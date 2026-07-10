using System.Net.Mime;
using System.Text.Json;

const string corsPolicy = "ExpoWeb";
const string stockIdentifiersSessionKey = "StockIdentifiers";
const string symbolResultsSessionKey = "SymbolResults";
var jsonSerializerOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicy, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:8081",
                "http://127.0.0.1:8081",
                "http://localhost:8082",
                "http://127.0.0.1:8082",
                "http://localhost:8083",
                "http://127.0.0.1:8083")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromDays(1);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.Name = ".StockScreener.Session";
});

builder.Services.AddHttpClient("TradingView", client =>
{
    client.BaseAddress = new Uri("https://scanner.tradingview.com");
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("stock-screener-api/1.0");
});

var app = builder.Build();

app.UseCors(corsPolicy);
app.UseSession();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/api/scan", async (
    IHttpClientFactory httpClientFactory,
    HttpContext httpContext,
    CancellationToken cancellationToken) =>
{
    using var requestContent = new StreamContent(httpContext.Request.Body);
    requestContent.Headers.ContentType = new(MediaTypeNames.Application.Json);

    var httpClient = httpClientFactory.CreateClient("TradingView");
    using var response = await httpClient.PostAsync("/global/scan", requestContent, cancellationToken);
    var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
    var contentType = response.Content.Headers.ContentType?.ToString() ?? MediaTypeNames.Application.Json;

    if (response.IsSuccessStatusCode)
    {
        CacheStockIdentifiers(httpContext.Session, responseBody);
    }

    return Results.Content(
        responseBody,
        contentType,
        statusCode: (int)response.StatusCode);
});

app.MapGet("/api/symbols", async (
    IHttpClientFactory httpClientFactory,
    HttpContext httpContext,
    CancellationToken cancellationToken) =>
{
    if (httpContext.Session.GetString(symbolResultsSessionKey) is { Length: > 0 } cachedResults)
    {
        return Results.Content(cachedResults, MediaTypeNames.Application.Json);
    }

    var identifiers = GetCachedStockIdentifiers(httpContext.Session);

    if (identifiers.Count == 0)
    {
        return Results.BadRequest(new
        {
            error = "No cached stock identifiers found. Call POST /api/scan first."
        });
    }

    var httpClient = httpClientFactory.CreateClient("TradingView");
    var results = new SymbolResult[identifiers.Count];

    await Parallel.ForEachAsync(
        identifiers.Select((identifier, index) => (Identifier: identifier, Index: index)),
        new ParallelOptions
        {
            MaxDegreeOfParallelism = 8,
            CancellationToken = cancellationToken
        },
        async (item, token) =>
        {
            using var request = CreateSymbolRequest(item.Identifier);
            using var response = await httpClient.SendAsync(request, token);
            var responseBody = await response.Content.ReadAsStringAsync(token);

            results[item.Index] = CreateSymbolResult(item.Identifier, response, responseBody);
        });

    var serializedResults = JsonSerializer.Serialize(results, jsonSerializerOptions);
    httpContext.Session.SetString(symbolResultsSessionKey, serializedResults);

    return Results.Content(serializedResults, MediaTypeNames.Application.Json);
});

app.Run();

static void CacheStockIdentifiers(ISession session, string responseBody)
{
    var identifiers = new List<string>();
    var previousIdentifiers = GetCachedStockIdentifiers(session);
    using var document = JsonDocument.Parse(responseBody);

    if (!document.RootElement.TryGetProperty("data", out var data) ||
        data.ValueKind != JsonValueKind.Array)
    {
        session.SetString(stockIdentifiersSessionKey, "[]");
        session.Remove(symbolResultsSessionKey);
        return;
    }

    foreach (var stock in data.EnumerateArray())
    {
        if (stock.TryGetProperty("s", out var identifier) &&
            identifier.ValueKind == JsonValueKind.String &&
            identifier.GetString() is { Length: > 0 } value)
        {
            identifiers.Add(value);
        }
    }

    session.SetString(stockIdentifiersSessionKey, JsonSerializer.Serialize(identifiers));

    if (!previousIdentifiers.SequenceEqual(identifiers))
    {
        session.Remove(symbolResultsSessionKey);
    }
}

static IReadOnlyList<string> GetCachedStockIdentifiers(ISession session)
{
    if (session.GetString(stockIdentifiersSessionKey) is not { Length: > 0 } cachedIdentifiers)
    {
        return [];
    }

    return JsonSerializer.Deserialize<List<string>>(cachedIdentifiers) ?? [];
}

static HttpRequestMessage CreateSymbolRequest(string identifier)
{
    var uri = $"/symbol?api_key=widget_user_token&symbol={Uri.EscapeDataString(identifier)}" +
        $"&fields={TradingViewSymbolRequest.EncodedFields}&no_404=true&label-product=right-details";

    var request = new HttpRequestMessage(HttpMethod.Get, uri);
    request.Headers.TryAddWithoutValidation("accept", "*/*");
    request.Headers.TryAddWithoutValidation("accept-language", "en-GB-oxendict,en-US;q=0.9,en;q=0.8");
    request.Headers.TryAddWithoutValidation("origin", "https://widgets.tradingview-widget.com");
    request.Headers.TryAddWithoutValidation("priority", "u=1, i");
    request.Headers.TryAddWithoutValidation("referer", "https://widgets.tradingview-widget.com/");
    request.Headers.TryAddWithoutValidation("sec-ch-ua", "\"Chromium\";v=\"148\", \"Google Chrome\";v=\"148\", \"Not/A)Brand\";v=\"99\"");
    request.Headers.TryAddWithoutValidation("sec-ch-ua-mobile", "?0");
    request.Headers.TryAddWithoutValidation("sec-ch-ua-platform", "\"macOS\"");
    request.Headers.TryAddWithoutValidation("sec-fetch-dest", "empty");
    request.Headers.TryAddWithoutValidation("sec-fetch-mode", "cors");
    request.Headers.TryAddWithoutValidation("sec-fetch-site", "cross-site");
    request.Headers.TryAddWithoutValidation(
        "user-agent",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36");

    return request;
}

static SymbolResult CreateSymbolResult(string identifier, HttpResponseMessage response, string responseBody)
{
    try
    {
        using var document = JsonDocument.Parse(responseBody);

        return new SymbolResult(
            identifier,
            (int)response.StatusCode,
            response.IsSuccessStatusCode,
            document.RootElement.Clone(),
            null);
    }
    catch (JsonException)
    {
        return new SymbolResult(
            identifier,
            (int)response.StatusCode,
            response.IsSuccessStatusCode,
            null,
            responseBody);
    }
}

internal sealed record SymbolResult(
    string Symbol,
    int StatusCode,
    bool IsSuccessStatusCode,
    JsonElement? Data,
    string? RawBody);

internal static class TradingViewSymbolRequest
{
    public const string EncodedFields =
        "Recommend.All%2CRecommend.MA%2CRecommend.Other%2Cclose%2CRSI%2CRSI%5B1%5D%2C" +
        "Stoch.K%2CStoch.D%2CStoch.K%5B1%5D%2CStoch.D%5B1%5D%2CCCI20%2CCCI20%5B1%5D%2C" +
        "ADX%2CADX%2BDI%2CADX-DI%2CADX%2BDI%5B1%5D%2CADX-DI%5B1%5D%2CAO%2CAO%5B1%5D%2C" +
        "AO%5B2%5D%2CMom%2CMom%5B1%5D%2CMACD.macd%2CMACD.signal%2CRec.Stoch.RSI%2C" +
        "Stoch.RSI.K%2CRec.WR%2CW.R%2CRec.BBPower%2CBBPower%2CRec.UO%2CUO%2CEMA10%2C" +
        "SMA10%2CEMA20%2CSMA20%2CEMA30%2CSMA30%2CEMA50%2CSMA50%2CEMA100%2CSMA100%2C" +
        "EMA200%2CSMA200%2CRec.Ichimoku%2CIchimoku.BLine%2CRec.VWMA%2CVWMA%2C" +
        "Rec.HullMA9%2CHullMA9";
}

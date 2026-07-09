using System.Net.Mime;
using System.Text;

const string corsPolicy = "ExpoWeb";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicy, policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddHttpClient("TradingView", client =>
{
    client.BaseAddress = new Uri("https://scanner.tradingview.com");
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("stock-screener-api/1.0");
});

var app = builder.Build();

app.UseCors(corsPolicy);

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/api/scan", async (IHttpClientFactory httpClientFactory, CancellationToken cancellationToken) =>
{
    using var requestContent = new StringContent(
        TradingViewScanRequest.Payload,
        Encoding.UTF8,
        MediaTypeNames.Application.Json);

    var httpClient = httpClientFactory.CreateClient("TradingView");
    using var response = await httpClient.PostAsync("/global/scan", requestContent, cancellationToken);
    var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
    var contentType = response.Content.Headers.ContentType?.ToString() ?? MediaTypeNames.Application.Json;

    return Results.Content(
        responseBody,
        contentType,
        statusCode: (int)response.StatusCode);
});

app.Run();

internal static class TradingViewScanRequest
{
    public const string Payload = """
    {
      "columns": [
        "ticker-view",
        "close",
        "type",
        "typespecs",
        "pricescale",
        "minmov",
        "fractional",
        "minmove2",
        "currency",
        "change",
        "Perf.W",
        "Perf.1M",
        "Perf.3M",
        "Perf.6M",
        "Perf.YTD",
        "Perf.Y",
        "Perf.5Y",
        "Perf.10Y",
        "Perf.All",
        "Volatility.W",
        "Volatility.M"
      ],
      "filter": [
        {
          "left": "exchange",
          "operation": "in_range",
          "right": ["ASX", "HKEX", "LSE", "NASDAQ", "NYSE", "AMEX", "TSX", "EURONEXT"]
        },
        {
          "left": "TechRating_1D",
          "operation": "in_range",
          "right": ["StrongBuy"]
        },
        {
          "left": "Perf.Y",
          "operation": "in_range",
          "right": [100, 400]
        },
        {
          "left": "is_primary",
          "operation": "equal",
          "right": true
        }
      ],
      "filter2": {
        "operator": "and",
        "operands": [
          {
            "operation": {
              "operator": "or",
              "operands": [
                {
                  "operation": {
                    "operator": "and",
                    "operands": [
                      {
                        "expression": {
                          "left": "type",
                          "operation": "equal",
                          "right": "stock"
                        }
                      },
                      {
                        "expression": {
                          "left": "typespecs",
                          "operation": "has",
                          "right": ["common"]
                        }
                      }
                    ]
                  }
                },
                {
                  "operation": {
                    "operator": "and",
                    "operands": [
                      {
                        "expression": {
                          "left": "type",
                          "operation": "equal",
                          "right": "stock"
                        }
                      },
                      {
                        "expression": {
                          "left": "typespecs",
                          "operation": "has",
                          "right": ["preferred"]
                        }
                      }
                    ]
                  }
                },
                {
                  "operation": {
                    "operator": "and",
                    "operands": [
                      {
                        "expression": {
                          "left": "type",
                          "operation": "equal",
                          "right": "dr"
                        }
                      }
                    ]
                  }
                },
                {
                  "operation": {
                    "operator": "and",
                    "operands": [
                      {
                        "expression": {
                          "left": "type",
                          "operation": "equal",
                          "right": "fund"
                        }
                      },
                      {
                        "expression": {
                          "left": "typespecs",
                          "operation": "has_none_of",
                          "right": ["etf", "mutual"]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            "expression": {
              "left": "typespecs",
              "operation": "has_none_of",
              "right": ["pre-ipo"]
            }
          }
        ]
      },
      "ignore_unknown_fields": false,
      "markets": [
        "america",
        "australia",
        "canada",
        "france",
        "germany",
        "hongkong",
        "ireland",
        "japan",
        "netherlands",
        "newzealand",
        "switzerland",
        "uk"
      ],
      "options": {
        "lang": "en"
      },
      "price_conversion": {
        "to_currency": "usd"
      },
      "range": [0, 100],
      "sort": {
        "sortBy": "Perf.Y",
        "sortOrder": "desc"
      }
    }
    """;
}

using System.Threading.RateLimiting;

namespace API.Infrastructure;

public static class ApiExtensions
{
    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration config,
        IHostEnvironment env)
    {
        services.AddControllers();
        services.AddOpenApi();

        // ── CORS ──────────────────────────────────────────────────────────────
        var allowedOrigins = config.GetSection("CorsSettings:AllowedOrigins").Get<string[]>();

        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                if (allowedOrigins != null && allowedOrigins.Length > 0)
                {
                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                }
                else if (env.IsDevelopment())
                {
                    // Development-only fallback: allow any origin so local tooling works.
                    // Never reached in production because CorsSettings:AllowedOrigins is required there.
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                }
                else
                {
                    // Production with no origins configured → reject all cross-origin requests.
                    // Fix: add CorsSettings:AllowedOrigins to your production config.
                    policy.WithOrigins(Array.Empty<string>());
                }
            });
        });

        // ── Rate limiting ─────────────────────────────────────────────────────
        // Auth endpoints (login, register, forgot-password, resend-confirmation)
        // are limited to 10 requests per minute per IP to resist brute-force attacks.
        services.AddRateLimiter(options =>
        {
            options.AddFixedWindowLimiter("auth", opt =>
            {
                opt.Window               = TimeSpan.FromMinutes(1);
                opt.PermitLimit          = 10;
                opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                opt.QueueLimit           = 0;
            });

            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.OnRejected = async (ctx, token) =>
            {
                ctx.HttpContext.Response.Headers.RetryAfter =
                    ((int)TimeSpan.FromMinutes(1).TotalSeconds).ToString();
                ctx.HttpContext.Response.ContentType = "application/json";
                await ctx.HttpContext.Response.WriteAsync(
                    "{\"message\":\"Too many requests. Please wait a moment and try again.\"}",
                    token);
            };
        });

        return services;
    }
}

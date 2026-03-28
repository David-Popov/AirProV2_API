using API.Data;
using API.Data.Seeds;
using API.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiServices(builder.Configuration, builder.Environment);
builder.Services.AddDatabaseServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration, builder.Environment);
builder.Services.AddRepositories();
builder.Services.AddApplicationServices();
builder.Services.AddExternalServices(builder.Configuration);
builder.Services.AddValidators();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate();

        if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
        {
            SeedDataManager.SeedAllData(services);
        }

        // Production admin bootstrap: creates admin from env vars if no admin exists
        ProductionAdminSeed.SeedAdminIfNotExists(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

// ── Security headers ──────────────────────────────────────────────────────────
// Applied before any other middleware so every response carries them.
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options",  "nosniff");
    context.Response.Headers.Append("X-Frame-Options",         "DENY");
    context.Response.Headers.Append("X-XSS-Protection",        "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy",         "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Permissions-Policy",      "camera=(), microphone=(), geolocation=()");

    if (!app.Environment.IsDevelopment())
    {
        // HSTS: tell browsers to use HTTPS for 1 year (only in production)
        context.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    await next();
});

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("AirProV2 API")
            .WithTheme(ScalarTheme.Purple)
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

app.UseHttpsRedirection();

// Use CORS
app.UseCors("AllowAll");

// Rate limiting — must be after CORS and before auth/controllers
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

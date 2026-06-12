using API.Data;
using API.Data.Seeds;
using API.Infrastructure;
using API.Middleware;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile(
    $"appsettings.{builder.Environment.EnvironmentName}.local.json",
    optional: true,
    reloadOnChange: true);

builder.Services.AddApiServices(builder.Configuration, builder.Environment);
builder.Services.AddDatabaseServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration, builder.Environment);
builder.Services.AddRepositories();
builder.Services.AddApplicationServices();
builder.Services.AddMapster();
builder.Services.AddExternalServices(builder.Configuration);
builder.Services.AddValidators();

var app = builder.Build();

StartupValidator.ValidateConfiguration(app.Services, app.Environment);

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate();

        if (app.Environment.IsDevelopment())
        {
            SeedDataManager.SeedAllData(services);
        }

        ProductionAdminSeed.SeedAdminIfNotExists(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options",  "nosniff");
    context.Response.Headers.Append("X-Frame-Options",         "DENY");
    context.Response.Headers.Append("X-XSS-Protection",        "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy",         "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Permissions-Policy",      "camera=(), microphone=(), geolocation=()");

    if (!app.Environment.IsDevelopment())
    {
        context.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    await next();
});

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

app.UseCors("AllowAll");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

using API.Models;
using API.Services.Email;
using API.Services.Stripe;
using Minio;

namespace API.Infrastructure;

public static class ExternalServicesExtensions
{
    public static IServiceCollection AddExternalServices(this IServiceCollection services, IConfiguration config)
    {
        // MinIO
        var minioSettings = config.GetSection("MinioSettings").Get<MinioSettings>();
        if (minioSettings != null)
        {
            services.Configure<MinioSettings>(config.GetSection("MinioSettings"));
            services.AddSingleton<IMinioClient>(_ =>
                new MinioClient()
                    .WithEndpoint(minioSettings.Endpoint)
                    .WithCredentials(minioSettings.AccessKey, minioSettings.SecretKey)
                    .WithSSL(minioSettings.UseSSL)
                    .Build());
        }

        // Stripe
        services.Configure<StripeSettings>(config.GetSection("StripeSettings"));
        services.AddScoped<IStripeService, StripeService>();

        // Email
        services.Configure<EmailSettings>(config.GetSection("EmailSettings"));
        services.AddScoped<IEmailService, EmailService>();
        services.AddSingleton<IBackgroundEmailQueue, BackgroundEmailQueue>();
        services.AddHostedService<BackgroundEmailProcessor>();

        return services;
    }
}

using API.Models;
using Microsoft.Extensions.Options;

namespace API.Infrastructure;

/// <summary>
/// Boot-time configuration validator. Fails fast in non-Development environments
/// if a required secret is missing, blank, or too short to be safe.
/// </summary>
public static class StartupValidator
{
    public static void ValidateConfiguration(IServiceProvider services, IHostEnvironment env)
    {
        var configuration = services.GetRequiredService<IConfiguration>();

        var jwtSecret = configuration["JwtSettings:SecretKey"];
        if (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret.Length < 32)
        {
            throw new InvalidOperationException(
                "JwtSettings:SecretKey must be set and at least 32 characters long.");
        }

        var encryptionKey = configuration["EncryptionSettings:Key"];
        if (string.IsNullOrWhiteSpace(encryptionKey) || encryptionKey.Length != 16)
        {
            throw new InvalidOperationException(
                "EncryptionSettings:Key must be set to exactly 16 characters.");
        }

        if (env.IsDevelopment())
        {
            return;
        }

        var stripe = services.GetRequiredService<IOptions<StripeSettings>>().Value;
        if (string.IsNullOrWhiteSpace(stripe.SecretKey))
        {
            throw new InvalidOperationException("StripeSettings:SecretKey must be set in non-Development environments.");
        }
        if (string.IsNullOrWhiteSpace(stripe.WebhookSecret))
        {
            throw new InvalidOperationException("StripeSettings:WebhookSecret must be set in non-Development environments.");
        }

        var email = services.GetRequiredService<IOptions<EmailSettings>>().Value;
        if (string.IsNullOrWhiteSpace(email.ApiToken))
        {
            throw new InvalidOperationException("EmailSettings:ApiToken must be set in non-Development environments.");
        }
    }
}

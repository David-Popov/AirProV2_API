using System.Collections.Concurrent;
using System.Text.Encodings.Web;
using API.Data.Entities;
using API.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace API.Services.Email;

public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<EmailService> _logger;

    private readonly ConcurrentDictionary<string, string> _templateCache = new();

    public EmailService(
        IOptions<EmailSettings> emailSettings,
        IWebHostEnvironment env,
        ILogger<EmailService> logger)
    {
        _emailSettings = emailSettings.Value;
        _env = env;
        _logger = logger;
    }

    public async Task SendWelcomeEmailAsync(ApplicationUser user, Company company)
    {
        var htmlBody = await BuildWelcomeEmailTemplateAsync(user, company);
        await SendEmailAsync(user.Email!, $"{user.FirstName} {user.LastName}", "Welcome to AirPro!", htmlBody);
    }

    public async Task SendEmployeeLimitReachedEmailAsync(Company company, int currentCount, int maxAllowed)
    {
        if (string.IsNullOrEmpty(company.Email)) return;

        var htmlBody = await BuildEmployeeLimitEmailTemplateAsync(company, maxAllowed);
        await SendEmailAsync(company.Email, company.CompanyName, "Employee Limit Reached - Upgrade Required", htmlBody);
    }

    public async Task SendSubscriptionPurchasedEmailAsync(Company company, string planName)
    {
        if (string.IsNullOrEmpty(company.Email)) return;

        var htmlBody = await BuildSubscriptionPurchasedEmailTemplateAsync(company, planName);
        await SendEmailAsync(company.Email, company.CompanyName, "Subscription Confirmed - Thank You!", htmlBody);
    }

    public async Task SendAccountDeletionConfirmationEmailAsync(string email, string companyName)
    {
        var htmlBody = await BuildAccountDeletionEmailTemplateAsync(companyName);
        await SendEmailAsync(email, companyName, "Account Deletion Confirmation", htmlBody);
    }

    public async Task SendSubscriptionStatusChangedEmailAsync(Company company, string previousStatus, string newStatus)
    {
        if (string.IsNullOrEmpty(company.Email)) return;

        var htmlBody = await BuildSubscriptionStatusChangedEmailTemplateAsync(company, previousStatus, newStatus);
        await SendEmailAsync(company.Email, company.CompanyName, $"Subscription Status Updated: {newStatus}", htmlBody);
    }

    public async Task SendNewEmployeeWelcomeEmailAsync(ApplicationUser employee, Company company, string passwordSetLink)
    {
        var subject = $"Welcome to {HtmlEncoder.Default.Encode(company.CompanyName)} - Your AirPro Account";
        var htmlBody = await BuildNewEmployeeWelcomeEmailTemplateAsync(employee, company, passwordSetLink);
        await SendEmailAsync(employee.Email!, $"{employee.FirstName} {employee.LastName}", subject, htmlBody);
    }

    public async Task SendTrialActivatedEmailAsync(Company company, DateTime trialEndDate)
    {
        if (string.IsNullOrEmpty(company.Email)) return;

        var htmlBody = await BuildTrialActivatedEmailTemplateAsync(company, trialEndDate);
        await SendEmailAsync(company.Email, company.CompanyName, "Your 6-Month Free Trial Has Started!", htmlBody);
    }

    public async Task SendEmailConfirmationAsync(string toEmail, string userName, string confirmLink)
    {
        var safeUserName = HtmlEncoder.Default.Encode(userName);
        var content = await LoadTemplateAsync("email-confirmation.html");
        content = Render(content, new Dictionary<string, string>
        {
            ["{{UserName}}"]    = safeUserName,
            ["{{ConfirmLink}}"] = confirmLink
        });

        var htmlBody = await WrapInBaseTemplateAsync("Confirm Your Email", content);
        await SendEmailAsync(toEmail, userName, "Confirm Your Email - AirPro", htmlBody);
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetLink)
    {
        var safeUserName = HtmlEncoder.Default.Encode(userName);
        var content = await LoadTemplateAsync("password-reset.html");
        content = Render(content, new Dictionary<string, string>
        {
            ["{{UserName}}"]  = safeUserName,
            ["{{ResetLink}}"] = resetLink
        });

        var htmlBody = await WrapInBaseTemplateAsync("Reset Your Password", content);
        await SendEmailAsync(toEmail, userName, "Reset Your Password - AirPro", htmlBody);
    }

    public async Task SendEmailChangeConfirmationAsync(string toEmail, string userName, string newEmail, string confirmLink)
    {
        var safeUserName = HtmlEncoder.Default.Encode(userName);
        var safeNewEmail = HtmlEncoder.Default.Encode(newEmail);
        var content = await LoadTemplateAsync("email-change-confirmation.html");
        content = Render(content, new Dictionary<string, string>
        {
            ["{{UserName}}"]    = safeUserName,
            ["{{NewEmail}}"]    = safeNewEmail,
            ["{{ConfirmLink}}"] = confirmLink
        });

        var htmlBody = await WrapInBaseTemplateAsync("Confirm Email Change", content);
        await SendEmailAsync(toEmail, userName, "Confirm Email Change - AirPro", htmlBody);
    }


    private async Task<string> BuildWelcomeEmailTemplateAsync(ApplicationUser user, Company company)
    {
        var content = await LoadTemplateAsync("welcome.html");
        content = Render(content, new Dictionary<string, string>
        {
            ["{{FirstName}}"]   = HtmlEncoder.Default.Encode(user.FirstName),
            ["{{CompanyName}}"] = HtmlEncoder.Default.Encode(company.CompanyName),
            ["{{Plan}}"]        = HtmlEncoder.Default.Encode(company.SubscriptionPlan.ToString()),
            ["{{LoginUrl}}"]    = $"{_emailSettings.WebsiteUrl}/login"
        });
        return await WrapInBaseTemplateAsync("Welcome to AirPro", content);
    }

    private async Task<string> BuildEmployeeLimitEmailTemplateAsync(Company company, int maxAllowed)
    {
        var content = await LoadTemplateAsync("employee-limit.html");
        content = Render(content, new Dictionary<string, string>
        {
            ["{{CompanyName}}"] = HtmlEncoder.Default.Encode(company.CompanyName),
            ["{{MaxAllowed}}"]  = maxAllowed.ToString(),
            ["{{Plan}}"]        = HtmlEncoder.Default.Encode(company.SubscriptionPlan.ToString()),
            ["{{UpgradeUrl}}"]  = $"{_emailSettings.WebsiteUrl}/settings/subscription"
        });
        return await WrapInBaseTemplateAsync("Employee Limit Reached", content);
    }

    private async Task<string> BuildSubscriptionPurchasedEmailTemplateAsync(Company company, string planName)
    {
        var content = await LoadTemplateAsync("subscription-purchased.html");
        content = Render(content, new Dictionary<string, string>
        {
            ["{{CompanyName}}"] = HtmlEncoder.Default.Encode(company.CompanyName),
            ["{{PlanName}}"]    = HtmlEncoder.Default.Encode(planName),
            ["{{ManageUrl}}"]   = $"{_emailSettings.WebsiteUrl}/settings/subscription"
        });
        return await WrapInBaseTemplateAsync("Subscription Confirmed", content);
    }

    private async Task<string> BuildAccountDeletionEmailTemplateAsync(string companyName)
    {
        var content = await LoadTemplateAsync("account-deletion.html");
        content = Render(content, new Dictionary<string, string>
        {
            ["{{CompanyName}}"] = HtmlEncoder.Default.Encode(companyName)
        });
        return await WrapInBaseTemplateAsync("Account Deleted", content);
    }

    private async Task<string> BuildSubscriptionStatusChangedEmailTemplateAsync(
        Company company, string previousStatus, string newStatus)
    {
        var statusMessage = newStatus.ToLower() switch
        {
            "active"    => "Your subscription is now active. Thank you for your payment!",
            "cancelled" => "Your subscription has been cancelled. You can continue using the service until the end of your billing period.",
            "expired"   => "Your subscription has expired. Please renew to continue enjoying premium features.",
            "suspended" => "Your subscription has been suspended due to a payment issue. Please update your payment method.",
            "trial"     => "Your free trial has started. Enjoy all premium features!",
            _           => $"Your subscription status has changed from {previousStatus} to {newStatus}."
        };

        var additionalInfo = "";
        if (newStatus.ToLower() is "expired" or "cancelled")
        {
            additionalInfo = """
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 16px;">
                  <tr>
                    <td style="background-color: #fef3c7; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 0 12px 12px 0; padding: 16px 20px; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
                      <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
                        <strong>Important:</strong> If you switch to the Free plan, note that it allows a maximum of 2 employees.
                        You will need to deactivate employees before switching to meet this limit.
                      </p>
                    </td>
                  </tr>
                </table>
                """;
        }

        var content = await LoadTemplateAsync("subscription-status-changed.html");
        content = Render(content, new Dictionary<string, string>
        {
            ["{{CompanyName}}"]     = HtmlEncoder.Default.Encode(company.CompanyName),
            ["{{StatusMessage}}"]   = statusMessage,
            ["{{PreviousStatus}}"]  = HtmlEncoder.Default.Encode(previousStatus),
            ["{{NewStatus}}"]       = HtmlEncoder.Default.Encode(newStatus),
            ["{{AdditionalInfo}}"]  = additionalInfo,
            ["{{ViewUrl}}"]         = $"{_emailSettings.WebsiteUrl}/settings/subscription"
        });
        return await WrapInBaseTemplateAsync("Subscription Status Update", content);
    }

    private async Task<string> BuildNewEmployeeWelcomeEmailTemplateAsync(
        ApplicationUser employee, Company company, string passwordSetLink)
    {
        var content = await LoadTemplateAsync("new-employee-welcome.html");
        content = Render(content, new Dictionary<string, string>
        {
            ["{{FirstName}}"]       = HtmlEncoder.Default.Encode(employee.FirstName),
            ["{{CompanyName}}"]     = HtmlEncoder.Default.Encode(company.CompanyName),
            ["{{Email}}"]           = HtmlEncoder.Default.Encode(employee.Email ?? string.Empty),
            ["{{PasswordSetLink}}"] = passwordSetLink
        });
        return await WrapInBaseTemplateAsync("Welcome to AirPro", content);
    }

    private async Task<string> BuildTrialActivatedEmailTemplateAsync(Company company, DateTime trialEndDate)
    {
        var content = await LoadTemplateAsync("trial-activated.html");
        content = Render(content, new Dictionary<string, string>
        {
            ["{{CompanyName}}"]  = HtmlEncoder.Default.Encode(company.CompanyName),
            ["{{TrialEndDate}}"] = trialEndDate.ToString("MMMM dd, yyyy"),
            ["{{DashboardUrl}}"] = $"{_emailSettings.WebsiteUrl}/dashboard"
        });
        return await WrapInBaseTemplateAsync("Free Trial Activated", content);
    }

    private async Task<string> WrapInBaseTemplateAsync(string title, string content)
    {
        var logoHtml = !string.IsNullOrEmpty(_emailSettings.CompanyLogoUrl)
            ? $"<img src='{_emailSettings.CompanyLogoUrl}' alt='AirPro' style='max-width: 150px; height: auto;' />"
            : $"<span style='font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; font-family: \"Plus Jakarta Sans\", Arial, sans-serif;'>Air</span>" +
              $"<span style='font-size: 28px; font-weight: 800; color: #93c5fd; letter-spacing: -0.5px; font-family: \"Plus Jakarta Sans\", Arial, sans-serif;'>Pro</span>";

        var baseTemplate = await LoadTemplateAsync("_base.html");
        return Render(baseTemplate, new Dictionary<string, string>
        {
            ["{{Title}}"]        = HtmlEncoder.Default.Encode(title),
            ["{{LogoHtml}}"]     = logoHtml,
            ["{{Content}}"]      = content,
            ["{{SupportEmail}}"] = _emailSettings.SupportEmail,
            ["{{SenderName}}"]   = _emailSettings.SenderName,
            ["{{Year}}"]         = DateTime.UtcNow.Year.ToString()
        });
    }

    private async Task<string> LoadTemplateAsync(string fileName)
    {
        if (!_templateCache.TryGetValue(fileName, out var content))
        {
            var path = Path.Combine(_env.ContentRootPath, "Templates", "Emails", fileName);
            content = await File.ReadAllTextAsync(path);
            _templateCache.TryAdd(fileName, content);
        }
        return content;
    }

    private static string Render(string template, Dictionary<string, string> placeholders)
    {
        foreach (var (key, value) in placeholders)
            template = template.Replace(key, value);
        return template;
    }

    private async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.ReplyTo.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SupportEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();

        try
        {
            var secureSocketOptions = _emailSettings.UseSsl
                ? SecureSocketOptions.StartTls
                : SecureSocketOptions.None;

            await client.ConnectAsync(_emailSettings.SmtpHost, _emailSettings.SmtpPort, secureSocketOptions);
            await client.AuthenticateAsync(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword);
            await client.SendAsync(message);

            _logger.LogInformation("Email sent successfully to {Email} via Mailtrap", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email} via Mailtrap", toEmail);
            throw;
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }
}

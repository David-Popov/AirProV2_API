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
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IOptions<EmailSettings> emailSettings,
        ILogger<EmailService> logger)
    {
        _emailSettings = emailSettings.Value;
        _logger = logger;
    }

    public async Task SendWelcomeEmailAsync(ApplicationUser user, Company company)
    {
        var subject = "Welcome to AirPro!";
        var htmlBody = BuildWelcomeEmailTemplate(user, company);

        await SendEmailAsync(
            user.Email!,
            $"{user.FirstName} {user.LastName}",
            subject,
            htmlBody);
    }

    public async Task SendEmployeeLimitReachedEmailAsync(Company company, int currentCount, int maxAllowed)
    {
        if (string.IsNullOrEmpty(company.Email)) return;

        var subject = "Employee Limit Reached - Upgrade Required";
        var htmlBody = BuildEmployeeLimitEmailTemplate(company, currentCount, maxAllowed);

        await SendEmailAsync(
            company.Email,
            company.CompanyName,
            subject,
            htmlBody);
    }

    public async Task SendSubscriptionPurchasedEmailAsync(Company company, string planName)
    {
        if (string.IsNullOrEmpty(company.Email)) return;

        var subject = "Subscription Confirmed - Thank You!";
        var htmlBody = BuildSubscriptionPurchasedEmailTemplate(company, planName);

        await SendEmailAsync(
            company.Email,
            company.CompanyName,
            subject,
            htmlBody);
    }

    public async Task SendAccountDeletionConfirmationEmailAsync(string email, string companyName)
    {
        var subject = "Account Deletion Confirmation";
        var htmlBody = BuildAccountDeletionEmailTemplate(companyName);

        await SendEmailAsync(
            email,
            companyName,
            subject,
            htmlBody);
    }

    public async Task SendSubscriptionStatusChangedEmailAsync(Company company, string previousStatus, string newStatus)
    {
        if (string.IsNullOrEmpty(company.Email)) return;

        var subject = $"Subscription Status Updated: {newStatus}";
        var htmlBody = BuildSubscriptionStatusChangedEmailTemplate(company, previousStatus, newStatus);

        await SendEmailAsync(
            company.Email,
            company.CompanyName,
            subject,
            htmlBody);
    }

    public async Task SendNewEmployeeWelcomeEmailAsync(ApplicationUser employee, Company company, string passwordSetLink)
    {
        var subject = $"Welcome to {HtmlEncoder.Default.Encode(company.CompanyName)} - Your AirPro Account";
        var htmlBody = BuildNewEmployeeWelcomeEmailTemplate(employee, company, passwordSetLink);

        await SendEmailAsync(
            employee.Email!,
            $"{employee.FirstName} {employee.LastName}",
            subject,
            htmlBody);
    }

    public async Task SendTrialActivatedEmailAsync(Company company, DateTime trialEndDate)
    {
        if (string.IsNullOrEmpty(company.Email)) return;

        var subject = "Your 6-Month Free Trial Has Started!";
        var htmlBody = BuildTrialActivatedEmailTemplate(company, trialEndDate);

        await SendEmailAsync(
            company.Email,
            company.CompanyName,
            subject,
            htmlBody);
    }

    private async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        
        // 1. Set the sender (Matches your Mailtrap verified domain)
        message.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
        
        // 2. Set the recipient
        message.To.Add(new MailboxAddress(toName, toEmail));
        
        message.ReplyTo.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SupportEmail));
        
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = htmlBody
        };
        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        
        try
        {
            var secureSocketOptions = _emailSettings.UseSsl 
                ? SecureSocketOptions.StartTls 
                : SecureSocketOptions.None;

            await client.ConnectAsync(
                _emailSettings.SmtpHost, 
                _emailSettings.SmtpPort, 
                secureSocketOptions);

            await client.AuthenticateAsync(
                _emailSettings.SmtpUsername, 
                _emailSettings.SmtpPassword);

            await client.SendAsync(message);
            
            _logger.LogInformation("Email sent successfully to {Email} via Mailtrap", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email} via Mailtrap", toEmail);
            throw; // Re-throw so your calling method knows it failed
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }

    private string WrapInBaseTemplate(string title, string content)
    {
        var logoHtml = !string.IsNullOrEmpty(_emailSettings.CompanyLogoUrl)
            ? $"<img src='{_emailSettings.CompanyLogoUrl}' alt='AirPro' style='max-width: 150px; height: auto;' />"
            : $"<h1 style='color: #ffffff; margin: 0;'>{_emailSettings.SenderName}</h1>";

        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{title}</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px; margin: 0 auto; background-color: #ffffff;'>
        <tr>
            <td style='padding: 20px; text-align: center; background-color: #6b21a8;'>
                {logoHtml}
            </td>
        </tr>
        <tr>
            <td style='padding: 30px 20px;'>
                {content}
            </td>
        </tr>
        <tr>
            <td style='padding: 20px; text-align: center; background-color: #f8f8f8; font-size: 12px; color: #666;'>
                <p style='margin: 0 0 10px 0;'>Questions? Contact us at <a href='mailto:{_emailSettings.SupportEmail}' style='color: #6b21a8;'>{_emailSettings.SupportEmail}</a></p>
                <p style='margin: 0;'>&copy; {DateTime.UtcNow.Year} {_emailSettings.SenderName}. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    private string BuildWelcomeEmailTemplate(ApplicationUser user, Company company)
    {
        var firstName   = HtmlEncoder.Default.Encode(user.FirstName);
        var companyName = HtmlEncoder.Default.Encode(company.CompanyName);
        var plan        = HtmlEncoder.Default.Encode(company.SubscriptionPlan.ToString());

        var content = $@"
            <h1 style='color: #333; margin: 0 0 20px 0;'>Welcome to AirPro, {firstName}!</h1>
            <p style='color: #666; line-height: 1.6;'>
                Thank you for registering <strong>{companyName}</strong> with AirPro.
                Your account is now active and ready to use.
            </p>
            <p style='color: #666; line-height: 1.6;'>
                You're currently on the <strong>{plan}</strong> plan.
            </p>
            <div style='margin: 30px 0; text-align: center;'>
                <a href='{_emailSettings.WebsiteUrl}/login'
                   style='background-color: #6b21a8; color: #ffffff; padding: 12px 30px;
                          text-decoration: none; border-radius: 5px; display: inline-block;'>
                    Get Started
                </a>
            </div>
            <p style='color: #666; line-height: 1.6;'>
                If you have any questions, our support team is here to help.
            </p>";

        return WrapInBaseTemplate("Welcome to AirPro", content);
    }

    private string BuildEmployeeLimitEmailTemplate(Company company, int currentCount, int maxAllowed)
    {
        var content = $@"
            <h1 style='color: #333; margin: 0 0 20px 0;'>Employee Limit Reached</h1>
            <p style='color: #666; line-height: 1.6;'>
                Your company <strong>{company.CompanyName}</strong> has reached the maximum number of
                employees ({maxAllowed}) allowed on your current <strong>{company.SubscriptionPlan}</strong> plan.
            </p>
            <p style='color: #666; line-height: 1.6;'>
                To add more employees, please upgrade your subscription to our Premium plan.
            </p>
            <div style='margin: 30px 0; text-align: center;'>
                <a href='{_emailSettings.WebsiteUrl}/settings/subscription'
                   style='background-color: #6b21a8; color: #ffffff; padding: 12px 30px;
                          text-decoration: none; border-radius: 5px; display: inline-block;'>
                    Upgrade Now
                </a>
            </div>";

        return WrapInBaseTemplate("Employee Limit Reached", content);
    }

    private string BuildSubscriptionPurchasedEmailTemplate(Company company, string planName)
    {
        var content = $@"
            <h1 style='color: #333; margin: 0 0 20px 0;'>Subscription Confirmed!</h1>
            <p style='color: #666; line-height: 1.6;'>
                Thank you for upgrading <strong>{company.CompanyName}</strong> to the <strong>{planName}</strong> plan.
            </p>
            <p style='color: #666; line-height: 1.6;'>
                Your subscription is now active. You can now enjoy all the benefits of your new plan,
                including unlimited employees.
            </p>
            <div style='margin: 30px 0; text-align: center;'>
                <a href='{_emailSettings.WebsiteUrl}/settings/subscription'
                   style='background-color: #6b21a8; color: #ffffff; padding: 12px 30px;
                          text-decoration: none; border-radius: 5px; display: inline-block;'>
                    Manage Subscription
                </a>
            </div>
            <p style='color: #666; line-height: 1.6;'>
                If you have any questions about your subscription, feel free to contact our support team.
            </p>";

        return WrapInBaseTemplate("Subscription Confirmed", content);
    }

    private string BuildAccountDeletionEmailTemplate(string companyName)
    {
        var content = $@"
            <h1 style='color: #333; margin: 0 0 20px 0;'>Account Deleted</h1>
            <p style='color: #666; line-height: 1.6;'>
                Your account for <strong>{companyName}</strong> has been successfully deleted.
            </p>
            <p style='color: #666; line-height: 1.6;'>
                All your data has been permanently removed from our system.
            </p>
            <p style='color: #666; line-height: 1.6;'>
                We're sorry to see you go. If you change your mind, you're always welcome to create a new account.
            </p>
            <p style='color: #666; line-height: 1.6;'>
                Thank you for using AirPro.
            </p>";

        return WrapInBaseTemplate("Account Deleted", content);
    }

    private string BuildSubscriptionStatusChangedEmailTemplate(Company company, string previousStatus, string newStatus)
    {
        var statusMessage = newStatus.ToLower() switch
        {
            "active" => "Your subscription is now active. Thank you for your payment!",
            "cancelled" => "Your subscription has been cancelled. You can continue using the service until the end of your billing period.",
            "expired" => "Your subscription has expired. Please renew to continue enjoying premium features.",
            "suspended" => "Your subscription has been suspended due to a payment issue. Please update your payment method.",
            "trial" => "Your free trial has started. Enjoy all premium features!",
            _ => $"Your subscription status has changed from {previousStatus} to {newStatus}."
        };

        var additionalInfo = "";
        if (newStatus.ToLower() == "expired" || newStatus.ToLower() == "cancelled")
        {
            additionalInfo = @"
            <div style='background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;'>
                <p style='margin: 0; color: #856404;'>
                    <strong>Important:</strong> If you choose to switch to the Free plan, please note that the Free plan
                    allows a maximum of 2 employees. You will need to deactivate employees to meet this limit before
                    switching to the Free plan.
                </p>
            </div>";
        }

        var content = $@"
            <h1 style='color: #333; margin: 0 0 20px 0;'>Subscription Status Update</h1>
            <p style='color: #666; line-height: 1.6;'>
                Dear <strong>{company.CompanyName}</strong>,
            </p>
            <p style='color: #666; line-height: 1.6;'>
                {statusMessage}
            </p>
            <div style='background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                <p style='margin: 0; color: #666;'>
                    <strong>Previous Status:</strong> {previousStatus}<br/>
                    <strong>New Status:</strong> {newStatus}
                </p>
            </div>
            {additionalInfo}
            <div style='margin: 30px 0; text-align: center;'>
                <a href='{_emailSettings.WebsiteUrl}/settings/subscription'
                   style='background-color: #6b21a8; color: #ffffff; padding: 12px 30px;
                          text-decoration: none; border-radius: 5px; display: inline-block;'>
                    View Subscription
                </a>
            </div>";

        return WrapInBaseTemplate("Subscription Status Update", content);
    }

    private string BuildNewEmployeeWelcomeEmailTemplate(ApplicationUser employee, Company company, string passwordSetLink)
    {
        var firstName   = HtmlEncoder.Default.Encode(employee.FirstName);
        var emailAddr   = HtmlEncoder.Default.Encode(employee.Email ?? string.Empty);
        var companyName = HtmlEncoder.Default.Encode(company.CompanyName);

        var content = $@"
            <h1 style='color: #333; margin: 0 0 20px 0;'>Welcome to the Team, {firstName}!</h1>
            <p style='color: #666; line-height: 1.6;'>
                You have been added as an employee at <strong>{companyName}</strong> on AirPro.
            </p>
            <p style='color: #666; line-height: 1.6;'>
                Your account has been created with the email address below. Use the button to set your password and access the platform.
            </p>
            <div style='background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                <p style='margin: 0; color: #666;'>
                    <strong>Email:</strong> {emailAddr}
                </p>
            </div>
            <div style='margin: 30px 0; text-align: center;'>
                <a href='{passwordSetLink}'
                   style='background-color: #6b21a8; color: #ffffff; padding: 12px 30px;
                          text-decoration: none; border-radius: 5px; display: inline-block;'>
                    Set Your Password
                </a>
            </div>
            <p style='color: #666; line-height: 1.6;'>
                This link expires in 24 hours. If you have any questions, please contact your manager or our support team.
            </p>";

        return WrapInBaseTemplate("Welcome to AirPro", content);
    }

    public async Task SendEmailConfirmationAsync(string toEmail, string userName, string confirmLink)
    {
        var subject        = "Confirm Your Email - AirPro";
        var safeUserName   = HtmlEncoder.Default.Encode(userName);
        var content = $@"
            <h1 style='color: #333; margin: 0 0 20px 0;'>Confirm Your Email Address</h1>
            <p style='color: #666; line-height: 1.6;'>
                Hi <strong>{safeUserName}</strong>,
            </p>
            <p style='color: #666; line-height: 1.6;'>
                Thank you for registering with AirPro. Please confirm your email address by clicking the button below.
            </p>
            <div style='margin: 30px 0; text-align: center;'>
                <a href='{confirmLink}'
                   style='background-color: #6b21a8; color: #ffffff; padding: 12px 30px;
                          text-decoration: none; border-radius: 5px; display: inline-block;'>
                    Confirm Email
                </a>
            </div>
            <p style='color: #666; line-height: 1.6;'>
                If you did not create an account, you can safely ignore this email.
            </p>";

        var htmlBody = WrapInBaseTemplate("Confirm Your Email", content);
        await SendEmailAsync(toEmail, userName, subject, htmlBody);
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetLink)
    {
        var subject      = "Reset Your Password - AirPro";
        var safeUserName = HtmlEncoder.Default.Encode(userName);
        var content = $@"
            <h1 style='color: #333; margin: 0 0 20px 0;'>Reset Your Password</h1>
            <p style='color: #666; line-height: 1.6;'>
                Hi <strong>{safeUserName}</strong>,
            </p>
            <p style='color: #666; line-height: 1.6;'>
                We received a request to reset your password. Click the button below to set a new password.
            </p>
            <div style='margin: 30px 0; text-align: center;'>
                <a href='{resetLink}'
                   style='background-color: #6b21a8; color: #ffffff; padding: 12px 30px;
                          text-decoration: none; border-radius: 5px; display: inline-block;'>
                    Reset Password
                </a>
            </div>
            <p style='color: #666; line-height: 1.6;'>
                This link will expire in 24 hours. If you did not request a password reset, you can safely ignore this email.
            </p>";

        var htmlBody = WrapInBaseTemplate("Reset Your Password", content);
        await SendEmailAsync(toEmail, userName, subject, htmlBody);
    }

    public async Task SendEmailChangeConfirmationAsync(string toEmail, string userName, string newEmail, string confirmLink)
    {
        var subject      = "Confirm Email Change - AirPro";
        var safeUserName = HtmlEncoder.Default.Encode(userName);
        var safeNewEmail = HtmlEncoder.Default.Encode(newEmail);
        var content = $@"
            <h1 style='color: #333; margin: 0 0 20px 0;'>Confirm Your New Email Address</h1>
            <p style='color: #666; line-height: 1.6;'>
                Hi <strong>{safeUserName}</strong>,
            </p>
            <p style='color: #666; line-height: 1.6;'>
                You requested to change your email address to <strong>{safeNewEmail}</strong>. Please confirm this change by clicking the button below.
            </p>
            <div style='margin: 30px 0; text-align: center;'>
                <a href='{confirmLink}'
                   style='background-color: #6b21a8; color: #ffffff; padding: 12px 30px;
                          text-decoration: none; border-radius: 5px; display: inline-block;'>
                    Confirm Email Change
                </a>
            </div>
            <p style='color: #666; line-height: 1.6;'>
                If you did not request this change, you can safely ignore this email.
            </p>";

        var htmlBody = WrapInBaseTemplate("Confirm Email Change", content);
        await SendEmailAsync(toEmail, userName, subject, htmlBody);
    }

    private string BuildTrialActivatedEmailTemplate(Company company, DateTime trialEndDate)
    {
        var content = $@"
            <h1 style='color: #333; margin: 0 0 20px 0;'>Your Free Trial Has Started!</h1>
            <p style='color: #666; line-height: 1.6;'>
                Thank you for activating the free trial for <strong>{company.CompanyName}</strong>!
            </p>
            <p style='color: #666; line-height: 1.6;'>
                You now have <strong>6 months</strong> of full access to all premium features, including
                unlimited employees.
            </p>
            <div style='background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;'>
                <p style='margin: 0; color: #155724;'>
                    <strong>Trial Period:</strong> 6 months<br/>
                    <strong>Trial End Date:</strong> {trialEndDate:MMMM dd, yyyy}
                </p>
            </div>
            <p style='color: #666; line-height: 1.6;'>
                Make the most of your trial period! Explore all features and see how AirPro can help
                streamline your business operations.
            </p>
            <div style='margin: 30px 0; text-align: center;'>
                <a href='{_emailSettings.WebsiteUrl}/dashboard'
                   style='background-color: #6b21a8; color: #ffffff; padding: 12px 30px;
                          text-decoration: none; border-radius: 5px; display: inline-block;'>
                    Start Exploring
                </a>
            </div>
            <p style='color: #666; line-height: 1.6;'>
                When your trial ends, you can upgrade to our Premium plan or continue with the Free plan
                (limited to 2 employees).
            </p>";

        return WrapInBaseTemplate("Free Trial Activated", content);
    }
}

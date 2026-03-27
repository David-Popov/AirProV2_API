using API.Data.Entities;

namespace API.Services.Email;

public interface IEmailService
{
    Task SendWelcomeEmailAsync(ApplicationUser user, Company company);
    Task SendEmployeeLimitReachedEmailAsync(Company company, int currentCount, int maxAllowed);
    Task SendSubscriptionPurchasedEmailAsync(Company company, string planName);
    Task SendAccountDeletionConfirmationEmailAsync(string email, string companyName);
    Task SendSubscriptionStatusChangedEmailAsync(Company company, string previousStatus, string newStatus);
    Task SendNewEmployeeWelcomeEmailAsync(ApplicationUser employee, Company company, string temporaryPassword);
    Task SendTrialActivatedEmailAsync(Company company, DateTime trialEndDate);
    Task SendEmailConfirmationAsync(string toEmail, string userName, string confirmLink);
    Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetLink);
    Task SendEmailChangeConfirmationAsync(string toEmail, string userName, string newEmail, string confirmLink);
}

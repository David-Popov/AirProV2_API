using API.Data;
using API.Data.Entities;
using API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Services.Background;

public class TrialCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TrialCleanupService> _logger;

    public TrialCleanupService(
        IServiceProvider serviceProvider,
        ILogger<TrialCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessExpiredTrialsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing expired trials");
            }

            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    private async Task ProcessExpiredTrialsAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var expiredCompanies = await context.Companies
            .Where(c => c.SubscriptionStatus == SubscriptionStatus.Trial &&
                        c.TrialEndDate < DateTime.UtcNow)
            .ToListAsync(stoppingToken);

        if (!expiredCompanies.Any())
        {
            return;
        }

        _logger.LogInformation($"Found {expiredCompanies.Count} expired trial companies. Marking as expired.");

        foreach (var company in expiredCompanies)
        {
            await MarkTrialAsExpiredAsync(context, company, stoppingToken);
        }
    }

    /// <summary>
    /// Marks trial as expired WITHOUT deactivating employees.
    /// Employees will be deactivated only when user chooses "Return to Free Plan" from the modal.
    /// </summary>
    private async Task MarkTrialAsExpiredAsync(
        ApplicationDbContext context,
        Data.Entities.Company company,
        CancellationToken stoppingToken)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(stoppingToken);
        try
        {
            _logger.LogInformation($"Marking trial as expired for company: {company.CompanyName} ({company.Id})");

            // Only mark as expired - do NOT deactivate employees yet
            // User will be shown a modal to choose: Upgrade to Premium OR Return to Free Plan
            company.SubscriptionStatus = SubscriptionStatus.Expired;
            company.IsSubscriptionActive = false;
            company.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync(stoppingToken);
            await transaction.CommitAsync(stoppingToken);

            _logger.LogInformation(
                $"Successfully marked trial as expired for company {company.CompanyName}. " +
                $"User will choose next action via modal.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(stoppingToken);
            _logger.LogError(ex, $"Failed to mark trial as expired for company {company.CompanyName} ({company.Id})");
        }
    }
}

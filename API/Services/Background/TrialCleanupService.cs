using API.Data;
using API.Models;
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

            // Run every 24 hours
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    private async Task ProcessExpiredTrialsAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var expiredCompanies = await context.Companies
            .Where(c => c.SubscriptionStatus == SubscriptionStatus.Trial &&
                        c.TrialEndDate < DateTime.UtcNow)
            .ToListAsync(stoppingToken);

        if (!expiredCompanies.Any())
        {
            return;
        }

        _logger.LogInformation($"Found {expiredCompanies.Count} expired trial companies. Starting cleanup.");

        foreach (var company in expiredCompanies)
        {
            await DeleteCompanyDataAsync(context, company, stoppingToken);
        }
    }

    private async Task DeleteCompanyDataAsync(ApplicationDbContext context, Data.Entities.Company company, CancellationToken stoppingToken)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(stoppingToken);
        try
        {
            _logger.LogInformation($"Deleting data for expired company: {company.CompanyName} ({company.Id})");

            // 1. Delete Montages
            // Direct SQL delete for performance is often better, but let's stick to EF Core for now
            // or use ExecuteDeleteAsync() which is available in newer EF Core versions (7+)
            await context.Montages
                .Where(m => m.CompanyId == company.Id)
                .ExecuteDeleteAsync(stoppingToken);

            // 2. Delete Inventory Items (Cascade is set in DB Context, but explicit delete is safer)
            await context.InventoryItems
                .Where(i => i.CompanyId == company.Id)
                .ExecuteDeleteAsync(stoppingToken);

            // 3. Delete Users (This will also delete their roles/claims via Identity tables cascade usually, but ApplicationUser table needs cleaning)
            // Note: If using Identity with full AspNetUsers tables, we should ideally use UserManager, 
            // but effectively deleting the User record cascades to UserRoles, UserClaims etc.
            // We need to be careful if we have other entities linked to Users.
            var users = await context.Users.Where(u => u.CompanyId == company.Id).ToListAsync(stoppingToken);
            if (users.Any())
            {
                context.Users.RemoveRange(users);
                await context.SaveChangesAsync(stoppingToken);
            }

            // 4. Delete Company
            context.Companies.Remove(company);
            await context.SaveChangesAsync(stoppingToken);

            await transaction.CommitAsync(stoppingToken);
            _logger.LogInformation($"Successfully deleted company {company.CompanyName}");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(stoppingToken);
            _logger.LogError(ex, $"Failed to delete company {company.CompanyName} ({company.Id})");
        }
    }
}

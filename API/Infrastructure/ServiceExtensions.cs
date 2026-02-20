using API.Services;
using API.Services.Admin;
using API.Services.AirConditioners;
using API.Services.Auth;
using API.Services.Companies;
using API.Services.Inventory;
using API.Services.MontageInventory;
using API.Services.MontagePhotos;
using API.Services.Montages;
using API.Services.ReportedProblems;

namespace API.Infrastructure;

public static class ServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IAirConditionerService, AirConditionerService>();
        services.AddScoped<IMontageService, MontageService>();
        services.AddScoped<ICompanyService, CompanyService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IInventoryAuditService, InventoryAuditService>();
        services.AddScoped<IMontageInventoryService, MontageInventoryService>();
        services.AddScoped<IMontagePhotoService, MontagePhotoService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IReportedProblemService, ReportedProblemService>();
        
        // Background services
        services.AddHostedService<API.Services.Background.TrialCleanupService>();

        return services;
    }
}

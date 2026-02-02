using API.Repositories;
using API.Repositories.Companies;

namespace API.Infrastructure;

public static class RepositoryExtensions
{
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IAirConditionerRepository, AirConditionerRepository>();
        services.AddScoped<IMontageRepository, MontageRepository>();
        services.AddScoped<ICompanyRepository, CompanyRepository>();
        services.AddScoped<IInventoryRepository, InventoryRepository>();

        return services;
    }
}

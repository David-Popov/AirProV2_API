using API.Data;
using API.Data.Interceptors;
using Microsoft.EntityFrameworkCore;

namespace API.Infrastructure;

public static class DatabaseExtensions
{
    public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddSingleton<SoftDeleteInterceptor>();
        
        services.AddDbContext<ApplicationDbContext>((serviceProvider, opt) => 
            opt.UseNpgsql(config.GetConnectionString("DefaultConnection"))
               .AddInterceptors(serviceProvider.GetRequiredService<SoftDeleteInterceptor>()));

        return services;
    }
}

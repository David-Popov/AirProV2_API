using API.Data;
using Microsoft.EntityFrameworkCore;

namespace API.Infrastructure;

public static class DatabaseExtensions
{
    public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<ApplicationDbContext>(opt => 
            opt.UseNpgsql(config.GetConnectionString("DefaultConnection")));

        return services;
    }
}

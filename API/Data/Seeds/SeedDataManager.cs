using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeds;

public static class SeedDataManager
{
    public static void SeedAllData(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        // Ensure database is created and migrated
        context.Database.Migrate();
        
        // Seed data in order
        CompanySeedData.SeedDataToDb(serviceProvider);
        RoleSeedData.SeedDataToDb(serviceProvider);
        UserSeedData.SeedDataToDb(serviceProvider);
        AirConditionerSeedData.SeedDataToDb(serviceProvider);
        ErrorCodeSeedData.SeedDataToDb(serviceProvider);
    }
}
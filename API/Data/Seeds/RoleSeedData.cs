using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeds;

public static class RoleSeedData
{
    public static void SeedDataToDb(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (context.Roles.Any())
            return;

        var roles = new List<IdentityRole>
        {
            new IdentityRole
            {
                Id = "r0000000-0000-0000-0000-000000000001",
                Name = "Admin",
                NormalizedName = "ADMIN",
                ConcurrencyStamp = Guid.NewGuid().ToString()
            },
            new IdentityRole
            {
                Id = "r0000000-0000-0000-0000-000000000002",
                Name = "Manager",
                NormalizedName = "MANAGER",
                ConcurrencyStamp = Guid.NewGuid().ToString()
            },
            new IdentityRole
            {
                Id = "r0000000-0000-0000-0000-000000000003",
                Name = "User",
                NormalizedName = "USER",
                ConcurrencyStamp = Guid.NewGuid().ToString()
            }
        };

        context.Roles.AddRange(roles);
        context.SaveChanges();
    }
}
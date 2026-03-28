using API.Data.Entities;
using Microsoft.AspNetCore.Identity;

namespace API.Data.Seeds;

public static class ProductionAdminSeed
{
    public static void SeedAdminIfNotExists(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        const string adminRoleId = "r0000000-0000-0000-0000-000000000001";

        if (context.UserRoles.Any(ur => ur.RoleId == adminRoleId))
            return;

        var email    = Environment.GetEnvironmentVariable("PROD_ADMIN_EMAIL")    ?? "admin@airprobg.com";
        var password = Environment.GetEnvironmentVariable("PROD_ADMIN_PASSWORD") ?? "Admin@Dev123!";

        var adminUser = new ApplicationUser
        {
            Id                   = Guid.NewGuid().ToString(),
            UserName             = email,
            NormalizedUserName   = email.ToUpperInvariant(),
            Email                = email,
            NormalizedEmail      = email.ToUpperInvariant(),
            EmailConfirmed       = true,
            FirstName            = "Admin",
            MiddleName           = string.Empty,
            LastName             = "User",
            Address              = string.Empty,
            PhoneNumberConfirmed = false,
            CompanyId            = null,
            SecurityStamp        = Guid.NewGuid().ToString(),
            ConcurrencyStamp     = Guid.NewGuid().ToString()
        };

        var hasher = new PasswordHasher<ApplicationUser>();
        adminUser.PasswordHash = hasher.HashPassword(adminUser, password);

        context.Users.Add(adminUser);
        context.UserRoles.Add(new IdentityUserRole<string>
        {
            UserId = adminUser.Id,
            RoleId = adminRoleId
        });
        context.SaveChanges();
    }
}

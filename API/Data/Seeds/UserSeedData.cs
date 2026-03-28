using API.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeds;

public static class UserSeedData
{
    public static void SeedDataToDb(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (context.Users.Any())
            return;

        var hasher = new PasswordHasher<ApplicationUser>();

        // M-12: Read seed passwords from environment variables so they are not
        // committed to source control. Fall back to obvious dev-only defaults that
        // must be changed before any real deployment.
        var adminPassword   = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD")   ?? "Admin@Dev123!";
        var managerPassword = Environment.GetEnvironmentVariable("SEED_MANAGER_PASSWORD") ?? "Manager@Dev123!";
        var userPassword    = Environment.GetEnvironmentVariable("SEED_USER_PASSWORD")    ?? "User@Dev123!";

        var adminUser = new ApplicationUser
        {
            Id = "u0000000-0000-0000-0000-000000000001",
            UserName = "admin@airprov2.com",
            NormalizedUserName = "ADMIN@AIRPROV2.COM",
            Email = "admin@airprov2.com",
            NormalizedEmail = "ADMIN@AIRPROV2.COM",
            EmailConfirmed = true,
            FirstName = "Admin",
            MiddleName = "System",
            LastName = "User",
            Address = "Sofia, Bulgaria",
            PhoneNumber = "+359888111111",
            PhoneNumberConfirmed = true,
            CompanyId = null, // Admin has no company
            SecurityStamp = Guid.NewGuid().ToString(),
            ConcurrencyStamp = Guid.NewGuid().ToString()
        };
        adminUser.PasswordHash = hasher.HashPassword(adminUser, adminPassword);

        var managerUser = new ApplicationUser
        {
            Id = "u0000000-0000-0000-0000-000000000002",
            UserName = "manager@airprov2.com",
            NormalizedUserName = "MANAGER@AIRPROV2.COM",
            Email = "manager@airprov2.com",
            NormalizedEmail = "MANAGER@AIRPROV2.COM",
            EmailConfirmed = true,
            FirstName = "Georgi",
            MiddleName = "Ivanov",
            LastName = "Petrov",
            Address = "Plovdiv, Bulgaria",
            PhoneNumber = "+359888222222",
            PhoneNumberConfirmed = true,
            CompanyId = Guid.Parse("c0000000-0000-0000-0000-000000000001"), // АйрПро ЕООД
            SecurityStamp = Guid.NewGuid().ToString(),
            ConcurrencyStamp = Guid.NewGuid().ToString()
        };
        managerUser.PasswordHash = hasher.HashPassword(managerUser, managerPassword);

        var normalUser1 = new ApplicationUser
        {
            Id = "u0000000-0000-0000-0000-000000000003",
            UserName = "ivan.dimitrov@airprov2.com",
            NormalizedUserName = "IVAN.DIMITROV@AIRPROV2.COM",
            Email = "ivan.dimitrov@airprov2.com",
            NormalizedEmail = "IVAN.DIMITROV@AIRPROV2.COM",
            EmailConfirmed = true,
            FirstName = "Ivan",
            MiddleName = "Petrov",
            LastName = "Dimitrov",
            Address = "Varna, Bulgaria",
            PhoneNumber = "+359888333333",
            PhoneNumberConfirmed = true,
            CompanyId = Guid.Parse("c0000000-0000-0000-0000-000000000002"), // Климат Сървис ООД
            SecurityStamp = Guid.NewGuid().ToString(),
            ConcurrencyStamp = Guid.NewGuid().ToString()
        };
        normalUser1.PasswordHash = hasher.HashPassword(normalUser1, userPassword);

        var normalUser2 = new ApplicationUser
        {
            Id = "u0000000-0000-0000-0000-000000000004",
            UserName = "maria.petrova@airprov2.com",
            NormalizedUserName = "MARIA.PETROVA@AIRPROV2.COM",
            Email = "maria.petrova@airprov2.com",
            NormalizedEmail = "MARIA.PETROVA@AIRPROV2.COM",
            EmailConfirmed = true,
            FirstName = "Maria",
            MiddleName = "Georgieva",
            LastName = "Petrova",
            Address = "Burgas, Bulgaria",
            PhoneNumber = "+359888444444",
            PhoneNumberConfirmed = true,
            CompanyId = Guid.Parse("c0000000-0000-0000-0000-000000000003"), // Техно Климат ЕТ
            SecurityStamp = Guid.NewGuid().ToString(),
            ConcurrencyStamp = Guid.NewGuid().ToString()
        };
        normalUser2.PasswordHash = hasher.HashPassword(normalUser2, userPassword);

        context.Users.AddRange(adminUser, managerUser, normalUser1, normalUser2);
        context.SaveChanges();

        // Assign roles
        var userRoles = new List<IdentityUserRole<string>>
        {
            new() { UserId = "u0000000-0000-0000-0000-000000000001", RoleId = "r0000000-0000-0000-0000-000000000001" },
            new() { UserId = "u0000000-0000-0000-0000-000000000002", RoleId = "r0000000-0000-0000-0000-000000000002" },
            new() { UserId = "u0000000-0000-0000-0000-000000000003", RoleId = "r0000000-0000-0000-0000-000000000003" },
            new() { UserId = "u0000000-0000-0000-0000-000000000004", RoleId = "r0000000-0000-0000-0000-000000000003" }
        };

        context.UserRoles.AddRange(userRoles);
        context.SaveChanges();
    }
}
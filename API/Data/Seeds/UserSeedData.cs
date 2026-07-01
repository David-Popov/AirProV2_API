using API.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeds;

/// <summary>
/// Seeds one global Admin plus, for each of the three demo companies, a Manager
/// (company owner) and exactly two <c>User</c>-role employees — the Free-tier
/// limit (2 employees, Managers excluded). All employees have male names.
/// Passwords come from env vars (SEED_ADMIN/MANAGER/USER_PASSWORD) with dev
/// defaults. Development only.
/// </summary>
public static class UserSeedData
{
    private static readonly Guid Company1 = Guid.Parse("c0000000-0000-0000-0000-000000000001"); // АйрПро ЕООД (София)
    private static readonly Guid Company2 = Guid.Parse("c0000000-0000-0000-0000-000000000002"); // Климат Сървис ООД (Пловдив)
    private static readonly Guid Company3 = Guid.Parse("c0000000-0000-0000-0000-000000000003"); // Техно Климат ЕТ (Варна)

    private const string AdminRoleId   = "r0000000-0000-0000-0000-000000000001";
    private const string ManagerRoleId = "r0000000-0000-0000-0000-000000000002";
    private const string UserRoleId    = "r0000000-0000-0000-0000-000000000003";

    public static void SeedDataToDb(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (context.Users.Any())
            return;

        var hasher = new PasswordHasher<ApplicationUser>();

        var adminPassword   = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD")   ?? "Admin@Dev123!";
        var managerPassword = Environment.GetEnvironmentVariable("SEED_MANAGER_PASSWORD") ?? "Manager@Dev123!";
        var userPassword    = Environment.GetEnvironmentVariable("SEED_USER_PASSWORD")    ?? "User@Dev123!";

        ApplicationUser MakeUser(string id, string email, string first, string middle, string last,
                                 string address, string phone, Guid? companyId, string password)
        {
            var user = new ApplicationUser
            {
                Id = id,
                UserName = email,
                NormalizedUserName = email.ToUpperInvariant(),
                Email = email,
                NormalizedEmail = email.ToUpperInvariant(),
                EmailConfirmed = true,
                FirstName = first,
                MiddleName = middle,
                LastName = last,
                Address = address,
                PhoneNumber = phone,
                PhoneNumberConfirmed = true,
                CompanyId = companyId,
                SecurityStamp = Guid.NewGuid().ToString(),
                ConcurrencyStamp = Guid.NewGuid().ToString()
            };
            user.PasswordHash = hasher.HashPassword(user, password);
            return user;
        }

        var users = new List<ApplicationUser>
        {
            // --- Global admin (no company) ---
            MakeUser("u0000000-0000-0000-0000-000000000001", "admin@airprov2.com",
                "Admin", "System", "User", "София, България", "+359888111111", null, adminPassword),

            // --- Company 1: АйрПро ЕООД (София) — manager + 2 employees ---
            MakeUser("u0000000-0000-0000-0000-000000000002", "manager@airprov2.com",
                "Георги", "Иванов", "Петров", "София, ул. Климентина 15", "+359888222222", Company1, managerPassword),
            MakeUser("u0000000-0000-0000-0000-000000000005", "petar.ivanov@airprov2.com",
                "Петър", "Георгиев", "Иванов", "София, ул. Витоша 15", "+359888555555", Company1, userPassword),
            MakeUser("u0000000-0000-0000-0000-000000000006", "stoyan.kolev@airprov2.com",
                "Стоян", "Колев", "Колев", "София, бул. България 102", "+359888666666", Company1, userPassword),

            // --- Company 2: Климат Сървис ООД (Пловдив) — manager + 2 employees ---
            MakeUser("u0000000-0000-0000-0000-000000000003", "ivan.dimitrov@airprov2.com",
                "Иван", "Петров", "Димитров", "Пловдив, бул. Васил Левски 42", "+359888333333", Company2, managerPassword),
            MakeUser("u0000000-0000-0000-0000-000000000007", "nikolay.todorov@airprov2.com",
                "Николай", "Стоянов", "Тодоров", "Пловдив, ул. Гладстон 8", "+359888777777", Company2, userPassword),
            MakeUser("u0000000-0000-0000-0000-000000000008", "dimitar.marinov@airprov2.com",
                "Димитър", "Ангелов", "Маринов", "Пловдив, ул. Иван Вазов 21", "+359888888888", Company2, userPassword),

            // --- Company 3: Техно Климат ЕТ (Варна) — manager + 2 employees ---
            MakeUser("u0000000-0000-0000-0000-000000000004", "atanas.petrov@airprov2.com",
                "Атанас", "Петров", "Петров", "Варна, ул. Цар Симеон 88", "+359888444444", Company3, managerPassword),
            MakeUser("u0000000-0000-0000-0000-000000000009", "kiril.todorov@airprov2.com",
                "Кирил", "Тодоров", "Иванов", "Варна, ул. Дунав 17", "+359888999999", Company3, userPassword),
            MakeUser("u0000000-0000-0000-0000-00000000000a", "vasil.marinov@airprov2.com",
                "Васил", "Маринов", "Георгиев", "Варна, бул. Сливница 33", "+359888000000", Company3, userPassword),
        };

        context.Users.AddRange(users);
        context.SaveChanges();

        var userRoles = new List<IdentityUserRole<string>>
        {
            // Admin
            new() { UserId = "u0000000-0000-0000-0000-000000000001", RoleId = AdminRoleId },
            // Managers (company owners) — NOT counted against the Free-tier employee limit
            new() { UserId = "u0000000-0000-0000-0000-000000000002", RoleId = ManagerRoleId },
            new() { UserId = "u0000000-0000-0000-0000-000000000003", RoleId = ManagerRoleId },
            new() { UserId = "u0000000-0000-0000-0000-000000000004", RoleId = ManagerRoleId },
            // Employees (User role) — 2 per company
            new() { UserId = "u0000000-0000-0000-0000-000000000005", RoleId = UserRoleId },
            new() { UserId = "u0000000-0000-0000-0000-000000000006", RoleId = UserRoleId },
            new() { UserId = "u0000000-0000-0000-0000-000000000007", RoleId = UserRoleId },
            new() { UserId = "u0000000-0000-0000-0000-000000000008", RoleId = UserRoleId },
            new() { UserId = "u0000000-0000-0000-0000-000000000009", RoleId = UserRoleId },
            new() { UserId = "u0000000-0000-0000-0000-00000000000a", RoleId = UserRoleId },
        };

        context.UserRoles.AddRange(userRoles);
        context.SaveChanges();
    }
}

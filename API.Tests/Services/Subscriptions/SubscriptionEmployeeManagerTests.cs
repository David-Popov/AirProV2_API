using API.Constants;
using API.Data.Entities;
using API.Services.Subscriptions;
using API.Tests.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Tests.Services.Subscriptions;

public class SubscriptionEmployeeManagerTests
{
    private const string UserRoleId = "role-user";
    private const string ManagerRoleId = "role-manager";

    private static async Task SeedRolesAsync(API.Data.ApplicationDbContext db)
    {
        db.Roles.AddRange(
            new IdentityRole { Id = UserRoleId, Name = AppRoles.User, NormalizedName = "USER" },
            new IdentityRole { Id = ManagerRoleId, Name = AppRoles.Manager, NormalizedName = "MANAGER" });
        await db.SaveChangesAsync();
    }

    private static async Task<ApplicationUser> AddUserAsync(
        API.Data.ApplicationDbContext db, Guid companyId, string roleId, DateTime? lastLogin, bool isActive = true)
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            CompanyId = companyId,
            Email = $"{Guid.NewGuid():N}@test.bg",
            UserName = $"{Guid.NewGuid():N}@test.bg",
            FirstName = "T",
            LastName = "U",
            IsActive = isActive,
            LastLoginAt = lastLogin,
        };
        db.Users.Add(user);
        db.UserRoles.Add(new IdentityUserRole<string> { UserId = user.Id, RoleId = roleId });
        await db.SaveChangesAsync();
        return user;
    }

    [Fact]
    public async Task KeepsTwoMostRecentlyActive_DeactivatesTheRest()
    {
        await using var db = TestDbContextFactory.Create();
        var companyId = Guid.NewGuid();
        await SeedRolesAsync(db);

        var now = DateTime.UtcNow;
        var recent1 = await AddUserAsync(db, companyId, UserRoleId, now);
        var recent2 = await AddUserAsync(db, companyId, UserRoleId, now.AddDays(-1));
        var old1    = await AddUserAsync(db, companyId, UserRoleId, now.AddDays(-10));
        var never   = await AddUserAsync(db, companyId, UserRoleId, null);

        var deactivated = await SubscriptionEmployeeManager.DeactivateExcessEmployeesAsync(db, companyId, keepActiveCount: 2);
        await db.SaveChangesAsync();

        deactivated.Should().Be(2);
        (await db.Users.FindAsync(recent1.Id))!.IsActive.Should().BeTrue();
        (await db.Users.FindAsync(recent2.Id))!.IsActive.Should().BeTrue();
        (await db.Users.FindAsync(old1.Id))!.IsActive.Should().BeFalse();
        (await db.Users.FindAsync(never.Id))!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task NeverDeactivatesManagers_AndManagersDoNotCountTowardLimit()
    {
        await using var db = TestDbContextFactory.Create();
        var companyId = Guid.NewGuid();
        await SeedRolesAsync(db);

        var now = DateTime.UtcNow;
        var manager = await AddUserAsync(db, companyId, ManagerRoleId, now);
        var u1 = await AddUserAsync(db, companyId, UserRoleId, now);
        var u2 = await AddUserAsync(db, companyId, UserRoleId, now.AddDays(-1));
        var u3 = await AddUserAsync(db, companyId, UserRoleId, now.AddDays(-2));

        var deactivated = await SubscriptionEmployeeManager.DeactivateExcessEmployeesAsync(db, companyId, keepActiveCount: 2);
        await db.SaveChangesAsync();

        deactivated.Should().Be(1);
        (await db.Users.FindAsync(manager.Id))!.IsActive.Should().BeTrue();
        (await db.Users.FindAsync(u1.Id))!.IsActive.Should().BeTrue();
        (await db.Users.FindAsync(u2.Id))!.IsActive.Should().BeTrue();
        (await db.Users.FindAsync(u3.Id))!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task NoOp_WhenAtOrUnderLimit()
    {
        await using var db = TestDbContextFactory.Create();
        var companyId = Guid.NewGuid();
        await SeedRolesAsync(db);

        await AddUserAsync(db, companyId, UserRoleId, DateTime.UtcNow);
        await AddUserAsync(db, companyId, UserRoleId, DateTime.UtcNow.AddDays(-1));

        var deactivated = await SubscriptionEmployeeManager.DeactivateExcessEmployeesAsync(db, companyId, keepActiveCount: 2);

        deactivated.Should().Be(0);
        (await db.Users.CountAsync(u => u.CompanyId == companyId && u.IsActive)).Should().Be(2);
    }

    [Fact]
    public async Task AlreadyInactiveEmployees_DoNotCountTowardLimit()
    {
        await using var db = TestDbContextFactory.Create();
        var companyId = Guid.NewGuid();
        await SeedRolesAsync(db);

        var now = DateTime.UtcNow;
        await AddUserAsync(db, companyId, UserRoleId, now, isActive: false);
        await AddUserAsync(db, companyId, UserRoleId, now, isActive: false);
        var a1 = await AddUserAsync(db, companyId, UserRoleId, now);
        var a2 = await AddUserAsync(db, companyId, UserRoleId, now.AddDays(-1));

        var deactivated = await SubscriptionEmployeeManager.DeactivateExcessEmployeesAsync(db, companyId, keepActiveCount: 2);
        await db.SaveChangesAsync();

        deactivated.Should().Be(0);
        (await db.Users.FindAsync(a1.Id))!.IsActive.Should().BeTrue();
        (await db.Users.FindAsync(a2.Id))!.IsActive.Should().BeTrue();
    }
}

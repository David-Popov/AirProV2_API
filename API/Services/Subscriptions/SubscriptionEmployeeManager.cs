using API.Constants;
using API.Data;
using Microsoft.EntityFrameworkCore;

namespace API.Services.Subscriptions;

public static class SubscriptionEmployeeManager
{
    public static async Task<int> DeactivateExcessEmployeesAsync(
        ApplicationDbContext context,
        Guid companyId,
        int keepActiveCount,
        CancellationToken cancellationToken = default)
    {
        var employeesWithRoles = await (
            from user in context.Users
            where user.CompanyId == companyId
            join userRole in context.UserRoles on user.Id equals userRole.UserId into urj
            from ur in urj.DefaultIfEmpty()
            join role in context.Roles on ur.RoleId equals role.Id into rj
            from r in rj.DefaultIfEmpty()
            select new { User = user, RoleName = r != null ? r.Name : null }
        ).ToListAsync(cancellationToken);

        var perUser = employeesWithRoles
            .GroupBy(x => x.User.Id)
            .Select(g => new
            {
                User = g.First().User,
                Roles = g.Select(x => x.RoleName).Where(n => n != null).ToHashSet()
            })
            .ToList();

        var activeRegularEmployees = perUser
            .Where(p => !p.Roles.Contains(AppRoles.Manager) && !p.Roles.Contains(AppRoles.Admin))
            .Select(p => p.User)
            .Where(u => u.IsActive)
            .ToList();

        if (activeRegularEmployees.Count <= keepActiveCount)
        {
            return 0;
        }

        var toDeactivate = activeRegularEmployees
            .OrderByDescending(u => u.LastLoginAt ?? DateTime.MinValue)
            .ThenByDescending(u => u.CreatedAt)
            .Skip(keepActiveCount)
            .ToList();

        foreach (var user in toDeactivate)
        {
            user.IsActive = false;
        }

        return toDeactivate.Count;
    }
}

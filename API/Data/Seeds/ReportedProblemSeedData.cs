using API.Data.Entities;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeds;

/// <summary>
/// A few demo problem reports (varied categories, from users across all three
/// companies) so the Reported Problems admin view has content for a
/// presentation. Development only.
/// </summary>
public static class ReportedProblemSeedData
{
    // Company 1
    private const string C1Manager = "u0000000-0000-0000-0000-000000000002";
    private const string C1Emp1    = "u0000000-0000-0000-0000-000000000005";
    // Company 2
    private const string C2Manager = "u0000000-0000-0000-0000-000000000003";
    private const string C2Emp1    = "u0000000-0000-0000-0000-000000000007";
    // Company 3
    private const string C3Manager = "u0000000-0000-0000-0000-000000000004";
    private const string C3Emp1    = "u0000000-0000-0000-0000-000000000009";

    public static void SeedDataToDb(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (context.ReportedProblems.Any())
            return;

        var now = DateTime.UtcNow;

        var problems = new List<ReportedProblem>
        {
            new() { Id = Guid.Parse("e1000000-0000-0000-0000-000000000001"), UserId = C1Manager, Category = ProblemCategory.Bug, Description = "При запазване на монтаж понякога датата на завършване не се обновява веднага в списъка.", CreatedAt = now.AddDays(-6) },
            new() { Id = Guid.Parse("e1000000-0000-0000-0000-000000000002"), UserId = C1Emp1, Category = ProblemCategory.UIIssue, Description = "На мобилен телефон бутонът за добавяне на материал е твърде малък.", CreatedAt = now.AddDays(-5) },
            new() { Id = Guid.Parse("e1000000-0000-0000-0000-000000000003"), UserId = C2Manager, Category = ProblemCategory.FeatureNotWorking, Description = "Търсенето по SKU в склада понякога не връща резултати.", CreatedAt = now.AddDays(-4) },
            new() { Id = Guid.Parse("e1000000-0000-0000-0000-000000000004"), UserId = C2Emp1, Category = ProblemCategory.PerformanceIssue, Description = "Зареждането на справките се забавя при повече от 100 монтажа.", CreatedAt = now.AddDays(-3) },
            new() { Id = Guid.Parse("e1000000-0000-0000-0000-000000000005"), UserId = C3Manager, Category = ProblemCategory.Other, Description = "Бихме искали възможност за експорт на монтажите в Excel.", CreatedAt = now.AddDays(-2) },
            new() { Id = Guid.Parse("e1000000-0000-0000-0000-000000000006"), UserId = C3Emp1, Category = ProblemCategory.DataNotInserted, Description = "Понякога снимка, качена от телефон, не се появява веднага в галерията.", CreatedAt = now.AddDays(-1) },
        };

        context.ReportedProblems.AddRange(problems);
        context.SaveChanges();
    }
}

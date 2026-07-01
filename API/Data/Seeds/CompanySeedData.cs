using API.Data.Entities;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeds;

public static class CompanySeedData
{
    public static void SeedDataToDb(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (context.Companies.Any())
            return;

        var companies = new List<Company>
        {
            new Company
            {
                Id = Guid.Parse("c0000000-0000-0000-0000-000000000001"),
                CompanyName = "АйрПро ЕООД",
                CompanyType = CompanyType.LTD,
                Bulstat = "123456789",
                VatNumber = "BG123456789",
                IsVatRegistered = true,
                Address = "ул. Климентина 15",
                City = "София",
                PostalCode = "1000",
                Phone = "+359888123456",
                Email = "office@airpro.bg",
                IsCompanyOwner = true,
                SubscriptionPlan = SubscriptionPlan.Free,
                SubscriptionStatus = SubscriptionStatus.Active,
                IsSubscriptionActive = true,
                HasUsedTrial = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Company
            {
                Id = Guid.Parse("c0000000-0000-0000-0000-000000000002"),
                CompanyName = "Климат Сървис ООД",
                CompanyType = CompanyType.LLC,
                Bulstat = "987654321",
                VatNumber = "BG987654321",
                IsVatRegistered = true,
                Address = "бул. Васил Левски 42",
                City = "Пловдив",
                PostalCode = "4000",
                Phone = "+359888654321",
                Email = "info@klimatservice.bg",
                IsCompanyOwner = true,
                SubscriptionPlan = SubscriptionPlan.Free,
                SubscriptionStatus = SubscriptionStatus.Active,
                IsSubscriptionActive = true,
                HasUsedTrial = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Company
            {
                Id = Guid.Parse("c0000000-0000-0000-0000-000000000003"),
                CompanyName = "Техно Климат ЕТ",
                CompanyType = CompanyType.SoleProprietorship,
                Bulstat = "111222333",
                VatNumber = null,
                IsVatRegistered = false,
                Address = "ул. Цар Симеон 88",
                City = "Варна",
                PostalCode = "9000",
                Phone = "+359888111222",
                Email = "contact@tehnoklima.bg",
                IsCompanyOwner = true,
                SubscriptionPlan = SubscriptionPlan.Free,
                SubscriptionStatus = SubscriptionStatus.Active,
                IsSubscriptionActive = true,
                HasUsedTrial = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Companies.AddRange(companies);
        context.SaveChanges();
    }
}
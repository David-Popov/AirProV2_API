using API.Data.Entities;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeds;

/// <summary>
/// Demo inventory for ALL three companies, so every company login shows stock
/// data. Each company has a healthy spread plus at least one low-stock item
/// (Quantity &lt;= MinQuantity, triggers the low-stock alert) and one out-of-stock
/// item. GUID prefix encodes the company: a1.. = Company 1, a2.. = Company 2,
/// a3.. = Company 3. Development only.
/// </summary>
public static class InventoryItemSeedData
{
    private static readonly Guid Company1 = Guid.Parse("c0000000-0000-0000-0000-000000000001");
    private static readonly Guid Company2 = Guid.Parse("c0000000-0000-0000-0000-000000000002");
    private static readonly Guid Company3 = Guid.Parse("c0000000-0000-0000-0000-000000000003");

    public static void SeedDataToDb(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (context.InventoryItems.Any())
            return;

        var now = DateTime.UtcNow;

        var items = new List<InventoryItem>
        {
            // ============ Company 1 — АйрПро ЕООД (София) ============
            new() { Id = Guid.Parse("a1000000-0000-0000-0000-000000000001"), CompanyId = Company1, Name = "Фреон R32", Description = "Хладилен агент R32, бутилка 10kg", Sku = "FRE-R32-10", Quantity = 45, UnitOfMeasure = UnitOfMeasure.Liters, MinQuantity = 10, UnitPrice = 28.50m, Supplier = "КлиматТрейд ООД", Location = "Склад A, рафт 1", IsActive = true, CreatedAt = now },
            new() { Id = Guid.Parse("a1000000-0000-0000-0000-000000000002"), CompanyId = Company1, Name = "Медни тръби 1/4\"", Description = "Медна тръба за хладилни инсталации, 1/4 инч", Sku = "CU-PIPE-14", Quantity = 320, UnitOfMeasure = UnitOfMeasure.Meters, MinQuantity = 50, UnitPrice = 6.20m, Supplier = "МедПром АД", Location = "Склад A, рафт 2", IsActive = true, CreatedAt = now },
            new() { Id = Guid.Parse("a1000000-0000-0000-0000-000000000003"), CompanyId = Company1, Name = "Конзоли за външно тяло", Description = "Стоманени конзоли за монтаж на външно тяло", Sku = "BRKT-OUT-STD", Quantity = 60, UnitOfMeasure = UnitOfMeasure.Sets, MinQuantity = 15, UnitPrice = 18.90m, Supplier = "МонтажСервиз ЕООД", Location = "Склад B, рафт 1", IsActive = true, CreatedAt = now },
            // low stock
            new() { Id = Guid.Parse("a1000000-0000-0000-0000-000000000004"), CompanyId = Company1, Name = "Медни тръби 3/8\"", Description = "Медна тръба за хладилни инсталации, 3/8 инч", Sku = "CU-PIPE-38", Quantity = 12, UnitOfMeasure = UnitOfMeasure.Meters, MinQuantity = 30, UnitPrice = 9.80m, Supplier = "МедПром АД", Location = "Склад A, рафт 2", IsActive = true, CreatedAt = now },
            // out of stock
            new() { Id = Guid.Parse("a1000000-0000-0000-0000-000000000005"), CompanyId = Company1, Name = "Дюбели 8мм", Description = "Найлонови дюбели 8мм, кутия 100бр.", Sku = "DWL-NYL-8", Quantity = 0, UnitOfMeasure = UnitOfMeasure.Boxes, MinQuantity = 10, UnitPrice = 3.60m, Supplier = "МонтажСервиз ЕООД", Location = "Склад B, рафт 5", IsActive = true, CreatedAt = now },

            // ============ Company 2 — Климат Сървис ООД (Пловдив) ============
            new() { Id = Guid.Parse("a2000000-0000-0000-0000-000000000001"), CompanyId = Company2, Name = "Фреон R410A", Description = "Хладилен агент R410A, бутилка 11kg", Sku = "FRE-R410-11", Quantity = 30, UnitOfMeasure = UnitOfMeasure.Liters, MinQuantity = 8, UnitPrice = 32.00m, Supplier = "КлиматТрейд ООД", Location = "Склад 1, рафт A", IsActive = true, CreatedAt = now },
            new() { Id = Guid.Parse("a2000000-0000-0000-0000-000000000002"), CompanyId = Company2, Name = "Дренажен маркуч 16мм", Description = "Гъвкав дренажен маркуч 16мм", Sku = "DRN-HOSE-16", Quantity = 150, UnitOfMeasure = UnitOfMeasure.Meters, MinQuantity = 25, UnitPrice = 1.40m, Supplier = "КлиматТрейд ООД", Location = "Склад 1, рафт B", IsActive = true, CreatedAt = now },
            // low stock
            new() { Id = Guid.Parse("a2000000-0000-0000-0000-000000000003"), CompanyId = Company2, Name = "Стенен носач универсален", Description = "Универсален носач за вътрешно тяло", Sku = "WALL-MNT-U", Quantity = 18, UnitOfMeasure = UnitOfMeasure.Pieces, MinQuantity = 20, UnitPrice = 9.50m, Supplier = "МонтажСервиз ЕООД", Location = "Склад 2, рафт A", IsActive = true, CreatedAt = now },
            // low stock
            new() { Id = Guid.Parse("a2000000-0000-0000-0000-000000000004"), CompanyId = Company2, Name = "Изолация за тръби 9мм", Description = "Каучукова изолация за медни тръби", Sku = "INS-PIPE-9", Quantity = 6, UnitOfMeasure = UnitOfMeasure.Rolls, MinQuantity = 15, UnitPrice = 12.00m, Supplier = "КлиматТрейд ООД", Location = "Склад 2, рафт B", IsActive = true, CreatedAt = now },
            // out of stock
            new() { Id = Guid.Parse("a2000000-0000-0000-0000-000000000005"), CompanyId = Company2, Name = "Болтове за конзоли M10", Description = "Поцинковани болтове M10 с дюбел", Sku = "BOLT-M10", Quantity = 0, UnitOfMeasure = UnitOfMeasure.Boxes, MinQuantity = 12, UnitPrice = 4.80m, Supplier = "МонтажСервиз ЕООД", Location = "Склад 2, рафт C", IsActive = true, CreatedAt = now },

            // ============ Company 3 — Техно Климат ЕТ (Варна) ============
            new() { Id = Guid.Parse("a3000000-0000-0000-0000-000000000001"), CompanyId = Company3, Name = "Медни тръби 1/2\"", Description = "Медна тръба за хладилни инсталации, 1/2 инч", Sku = "CU-PIPE-12", Quantity = 200, UnitOfMeasure = UnitOfMeasure.Meters, MinQuantity = 40, UnitPrice = 11.50m, Supplier = "МедПром АД", Location = "Главен склад, рафт 1", IsActive = true, CreatedAt = now },
            new() { Id = Guid.Parse("a3000000-0000-0000-0000-000000000002"), CompanyId = Company3, Name = "Кабел ПВВМ 4x1.5", Description = "Захранващ кабел 4x1.5мм²", Sku = "CBL-PVVM-415", Quantity = 220, UnitOfMeasure = UnitOfMeasure.Meters, MinQuantity = 40, UnitPrice = 2.80m, Supplier = "ЕлектроСнаб АД", Location = "Главен склад, рафт 2", IsActive = true, CreatedAt = now },
            // low stock
            new() { Id = Guid.Parse("a3000000-0000-0000-0000-000000000003"), CompanyId = Company3, Name = "Силиконов уплътнител", Description = "Неутрален силикон за уплътняване", Sku = "SIL-NEUT-300", Quantity = 9, UnitOfMeasure = UnitOfMeasure.Pieces, MinQuantity = 15, UnitPrice = 4.30m, Supplier = "КлиматТрейд ООД", Location = "Главен склад, рафт 3", IsActive = true, CreatedAt = now },
            // low stock
            new() { Id = Guid.Parse("a3000000-0000-0000-0000-000000000004"), CompanyId = Company3, Name = "Изолирбанд PVC", Description = "Изолационна лента, черна", Sku = "TAPE-PVC-BK", Quantity = 5, UnitOfMeasure = UnitOfMeasure.Rolls, MinQuantity = 25, UnitPrice = 1.10m, Supplier = "ЕлектроСнаб АД", Location = "Главен склад, рафт 3", IsActive = true, CreatedAt = now },
            // out of stock
            new() { Id = Guid.Parse("a3000000-0000-0000-0000-000000000005"), CompanyId = Company3, Name = "Масло за вакуум помпа", Description = "Минерално масло за вакуум помпа", Sku = "VAC-OIL-1L", Quantity = 0, UnitOfMeasure = UnitOfMeasure.Liters, MinQuantity = 5, UnitPrice = 22.00m, Supplier = "КлиматТрейд ООД", Location = "Главен склад, рафт 4", IsActive = true, CreatedAt = now },
        };

        context.InventoryItems.AddRange(items);
        context.SaveChanges();
    }
}

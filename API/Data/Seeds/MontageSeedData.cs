using API.Data.Entities;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeds;

/// <summary>
/// Demo montages for ALL three companies. Across the full set every
/// <see cref="MontageStatus"/> (Planned, InProgress, Completed, Canceled,
/// Overdue) and every <see cref="MontagePaymentStatus"/> (Paid, PartiallyPaid,
/// NotPaid, Overdue) is represented. Each montage belongs to its company,
/// is assigned to that company's employees, and (where it has materials) draws
/// them from that company's inventory. Encrypted client columns are encrypted
/// automatically by the EF EncryptColumn converter on SaveChanges.
///
/// Note: seeding materials here does NOT deduct inventory quantity (that is the
/// service layer's job) — inventory quantities are set independently in
/// <see cref="InventoryItemSeedData"/>. Development only.
/// </summary>
public static class MontageSeedData
{
    private static readonly Guid Company1 = Guid.Parse("c0000000-0000-0000-0000-000000000001");
    private static readonly Guid Company2 = Guid.Parse("c0000000-0000-0000-0000-000000000002");
    private static readonly Guid Company3 = Guid.Parse("c0000000-0000-0000-0000-000000000003");

    // Company managers (montage creators)
    private const string Manager1 = "u0000000-0000-0000-0000-000000000002";
    private const string Manager2 = "u0000000-0000-0000-0000-000000000003";
    private const string Manager3 = "u0000000-0000-0000-0000-000000000004";

    // Company employees (on-site workers)
    private const string C1Emp1 = "u0000000-0000-0000-0000-000000000005"; // Петър Иванов
    private const string C1Emp2 = "u0000000-0000-0000-0000-000000000006"; // Стоян Колев
    private const string C2Emp1 = "u0000000-0000-0000-0000-000000000007"; // Николай Тодоров
    private const string C2Emp2 = "u0000000-0000-0000-0000-000000000008"; // Димитър Маринов
    private const string C3Emp1 = "u0000000-0000-0000-0000-000000000009"; // Кирил Иванов
    private const string C3Emp2 = "u0000000-0000-0000-0000-00000000000a"; // Васил Георгиев

    // Seeded air conditioners (from AirConditionerSeedData).
    private static readonly Guid AcDaikinEmura = Guid.Parse("10000000-0000-0000-0000-000000000001");
    private static readonly Guid AcDaikinStylish = Guid.Parse("10000000-0000-0000-0000-000000000002");
    private static readonly Guid AcDaikinThree = Guid.Parse("10000000-0000-0000-0000-000000000003");
    private static readonly Guid AcMitsubishi = Guid.Parse("20000000-0000-0000-0000-000000000001");

    public static void SeedDataToDb(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (context.Montages.Any())
            return;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var now = DateTime.UtcNow;

        DateOnly Day(int offset) => today.AddDays(offset);

        var montages = new List<Montage>
        {
            // ================= Company 1 — АйрПро ЕООД (София) =================
            // Planned + NotPaid
            new() { Id = Guid.Parse("b1000000-0000-0000-0000-000000000001"), CompanyId = Company1, UserId = Manager1, AirConditionerId = AcDaikinEmura,
                ClientName = "Иван Георгиев", ClientPhone = "+359888111222", ClientEmail = "ivan.georgiev@example.com", ClientAddress = "ул. Витоша 15", ClientCity = "София",
                InstallationDate = Day(14), Status = MontageStatus.Planned, TotalPrice = 1200, PaidAmount = 0, PaymentStatus = MontagePaymentStatus.NotPaid,
                Notes = "Клиентът предпочита монтаж сутрин.", CreatedAt = now },

            // InProgress + PartiallyPaid (assignees + materials)
            new() { Id = Guid.Parse("b1000000-0000-0000-0000-000000000002"), CompanyId = Company1, UserId = Manager1, AirConditionerId = AcDaikinThree,
                ClientName = "Георги Колев", ClientPhone = "+359888999000", ClientEmail = "georgi.kolev@example.com", ClientAddress = "ул. Цар Симеон 5", ClientCity = "София",
                InstallationDate = Day(0), Status = MontageStatus.InProgress, IndoorUnitSerial = "IN-2026-0102",
                TotalPrice = 2100, PaidAmount = 1000, PaymentStatus = MontagePaymentStatus.PartiallyPaid,
                Notes = "Монтажът е в ход.", CreatedAt = now },

            // Completed + Paid (full data + materials)
            new() { Id = Guid.Parse("b1000000-0000-0000-0000-000000000003"), CompanyId = Company1, UserId = Manager1, AirConditionerId = AcDaikinEmura,
                ClientName = "Петър Стоянов", ClientPhone = "+359877555666", ClientEmail = "petar.stoyanov@example.com", ClientAddress = "ул. Гладстон 5", ClientCity = "София",
                InstallationDate = Day(-30), CompletionDate = Day(-28), Status = MontageStatus.Completed,
                IndoorUnitSerial = "IN-2026-0103", OutdoorUnitSerial = "OUT-2026-0103",
                TotalPrice = 2499.99m, PaidAmount = 2499.99m, PaymentStatus = MontagePaymentStatus.Paid,
                Notes = "Завършен и приет от клиента.", CreatedAt = now },

            // Overdue + Overdue payment
            new() { Id = Guid.Parse("b1000000-0000-0000-0000-000000000004"), CompanyId = Company1, UserId = Manager1, AirConditionerId = AcMitsubishi,
                ClientName = "Стефан Ангелов", ClientPhone = "+359888565656", ClientEmail = "stefan.angelov@example.com", ClientAddress = "ул. Хан Аспарух 3", ClientCity = "София",
                InstallationDate = Day(-12), Status = MontageStatus.Overdue,
                TotalPrice = 2200, PaidAmount = 0, PaymentStatus = MontagePaymentStatus.Overdue,
                Notes = "Просрочен — изчаква потвърждение от клиента.", CreatedAt = now },

            // ================= Company 2 — Климат Сървис ООД (Пловдив) =================
            // Planned + PartiallyPaid
            new() { Id = Guid.Parse("b2000000-0000-0000-0000-000000000001"), CompanyId = Company2, UserId = Manager2, AirConditionerId = AcDaikinStylish,
                ClientName = "Мария Петрова", ClientPhone = "+359888333444", ClientEmail = "maria.petrova@example.com", ClientAddress = "бул. Цар Освободител 22", ClientCity = "Пловдив",
                InstallationDate = Day(21), Status = MontageStatus.Planned, TotalPrice = 1800, PaidAmount = 600, PaymentStatus = MontagePaymentStatus.PartiallyPaid,
                Notes = "Платено капаро 600 лв.", CreatedAt = now },

            // InProgress + NotPaid
            new() { Id = Guid.Parse("b2000000-0000-0000-0000-000000000002"), CompanyId = Company2, UserId = Manager2, AirConditionerId = AcMitsubishi,
                ClientName = "Елена Димитрова", ClientPhone = "+359888777888", ClientEmail = "elena.dimitrova@example.com", ClientAddress = "ул. Сан Стефано 8", ClientCity = "Пловдив",
                InstallationDate = Day(-2), Status = MontageStatus.InProgress, IndoorUnitSerial = "IN-2026-0202",
                TotalPrice = 1500, PaidAmount = 0, PaymentStatus = MontagePaymentStatus.NotPaid,
                Notes = "Плащане при завършване.", CreatedAt = now },

            // Completed + Paid (custom AC + materials)
            new() { Id = Guid.Parse("b2000000-0000-0000-0000-000000000003"), CompanyId = Company2, UserId = Manager2,
                CustomAcBrand = "Toshiba", CustomAcModel = "Seiya RAS-B13", CustomAcKilowatts = 3.5m,
                ClientName = "Десислава Илиева", ClientPhone = "+359888121212", ClientEmail = "desislava.ilieva@example.com", ClientAddress = "ул. Шейново 12", ClientCity = "Пловдив",
                InstallationDate = Day(-45), CompletionDate = Day(-44), Status = MontageStatus.Completed,
                IndoorUnitSerial = "IN-2026-0203", OutdoorUnitSerial = "OUT-2026-0203",
                TotalPrice = 1750, PaidAmount = 1750, PaymentStatus = MontagePaymentStatus.Paid,
                Notes = "Климатик, доставен от клиента.", CreatedAt = now },

            // Canceled + NotPaid
            new() { Id = Guid.Parse("b2000000-0000-0000-0000-000000000004"), CompanyId = Company2, UserId = Manager2, AirConditionerId = AcDaikinStylish,
                ClientName = "Николай Тодоров", ClientPhone = "+359888343434", ClientEmail = "nikolay.todorov@example.com", ClientAddress = "ул. Раковски 40", ClientCity = "Пловдив",
                InstallationDate = Day(-10), Status = MontageStatus.Canceled,
                TotalPrice = 1100, PaidAmount = 0, PaymentStatus = MontagePaymentStatus.NotPaid,
                Notes = "Отменен по желание на клиента.", CreatedAt = now },

            // ================= Company 3 — Техно Климат ЕТ (Варна) =================
            // Planned + Paid (prepaid)
            new() { Id = Guid.Parse("b3000000-0000-0000-0000-000000000001"), CompanyId = Company3, UserId = Manager3, AirConditionerId = AcDaikinEmura,
                ClientName = "Калоян Първанов", ClientPhone = "+359888909090", ClientEmail = "kaloyan.parvanov@example.com", ClientAddress = "ул. Опълченска 9", ClientCity = "Варна",
                InstallationDate = Day(30), Status = MontageStatus.Planned,
                TotalPrice = 1350, PaidAmount = 1350, PaymentStatus = MontagePaymentStatus.Paid,
                Notes = "Платено предварително в пълен размер.", CreatedAt = now },

            // InProgress + PartiallyPaid (assignees + materials)
            new() { Id = Guid.Parse("b3000000-0000-0000-0000-000000000002"), CompanyId = Company3, UserId = Manager3, AirConditionerId = AcDaikinThree,
                ClientName = "Виолета Маринова", ClientPhone = "+359888787878", ClientEmail = "violeta.marinova@example.com", ClientAddress = "ул. Дунав 17", ClientCity = "Варна",
                InstallationDate = Day(0), Status = MontageStatus.InProgress, IndoorUnitSerial = "IN-2026-0302",
                TotalPrice = 1950, PaidAmount = 800, PaymentStatus = MontagePaymentStatus.PartiallyPaid,
                Notes = "Монтажът е в ход.", CreatedAt = now },

            // Overdue + PartiallyPaid
            new() { Id = Guid.Parse("b3000000-0000-0000-0000-000000000003"), CompanyId = Company3, UserId = Manager3, AirConditionerId = AcMitsubishi,
                ClientName = "Христо Ангелов", ClientPhone = "+359888454545", ClientEmail = "hristo.angelov@example.com", ClientAddress = "ул. Преслав 23", ClientCity = "Варна",
                InstallationDate = Day(-20), Status = MontageStatus.Overdue,
                TotalPrice = 2050, PaidAmount = 500, PaymentStatus = MontagePaymentStatus.PartiallyPaid,
                Notes = "Частично платено, монтажът е просрочен.", CreatedAt = now },

            // Completed + Paid (full data + materials)
            new() { Id = Guid.Parse("b3000000-0000-0000-0000-000000000004"), CompanyId = Company3, UserId = Manager3, AirConditionerId = AcDaikinStylish,
                ClientName = "Радослав Иванов", ClientPhone = "+359877222333", ClientEmail = "radoslav.ivanov@example.com", ClientAddress = "ул. Македония 7", ClientCity = "Варна",
                InstallationDate = Day(-25), CompletionDate = Day(-23), Status = MontageStatus.Completed,
                IndoorUnitSerial = "IN-2026-0304", OutdoorUnitSerial = "OUT-2026-0304",
                TotalPrice = 2300, PaidAmount = 2300, PaymentStatus = MontagePaymentStatus.Paid,
                Notes = "Завършен и приет от клиента.", CreatedAt = now },
        };

        context.Montages.AddRange(montages);
        context.SaveChanges();

        // Assigned workers — each montage to its own company's employees.
        var assignments = new List<MontageAssignment>
        {
            // Company 1
            new() { MontageId = Guid.Parse("b1000000-0000-0000-0000-000000000002"), UserId = C1Emp1, CreatedAt = now },
            new() { MontageId = Guid.Parse("b1000000-0000-0000-0000-000000000002"), UserId = C1Emp2, CreatedAt = now },
            new() { MontageId = Guid.Parse("b1000000-0000-0000-0000-000000000003"), UserId = C1Emp1, CreatedAt = now },
            new() { MontageId = Guid.Parse("b1000000-0000-0000-0000-000000000003"), UserId = C1Emp2, CreatedAt = now },
            new() { MontageId = Guid.Parse("b1000000-0000-0000-0000-000000000004"), UserId = C1Emp1, CreatedAt = now },
            // Company 2
            new() { MontageId = Guid.Parse("b2000000-0000-0000-0000-000000000002"), UserId = C2Emp1, CreatedAt = now },
            new() { MontageId = Guid.Parse("b2000000-0000-0000-0000-000000000003"), UserId = C2Emp1, CreatedAt = now },
            new() { MontageId = Guid.Parse("b2000000-0000-0000-0000-000000000003"), UserId = C2Emp2, CreatedAt = now },
            // Company 3
            new() { MontageId = Guid.Parse("b3000000-0000-0000-0000-000000000001"), UserId = C3Emp1, CreatedAt = now },
            new() { MontageId = Guid.Parse("b3000000-0000-0000-0000-000000000002"), UserId = C3Emp1, CreatedAt = now },
            new() { MontageId = Guid.Parse("b3000000-0000-0000-0000-000000000002"), UserId = C3Emp2, CreatedAt = now },
            new() { MontageId = Guid.Parse("b3000000-0000-0000-0000-000000000003"), UserId = C3Emp2, CreatedAt = now },
            new() { MontageId = Guid.Parse("b3000000-0000-0000-0000-000000000004"), UserId = C3Emp1, CreatedAt = now },
            new() { MontageId = Guid.Parse("b3000000-0000-0000-0000-000000000004"), UserId = C3Emp2, CreatedAt = now },
        };
        context.MontageAssignments.AddRange(assignments);

        // Used materials — each montage draws from its own company's inventory.
        var materials = new List<MontageInventoryItem>
        {
            // Company 1 — #2 InProgress
            new() { MontageId = Guid.Parse("b1000000-0000-0000-0000-000000000002"), InventoryItemId = Guid.Parse("a1000000-0000-0000-0000-000000000002"), QuantityUsed = 6, UnitPriceAtTime = 6.20m, Notes = "Свързване вътрешно-външно тяло", CreatedAt = now },
            new() { MontageId = Guid.Parse("b1000000-0000-0000-0000-000000000002"), InventoryItemId = Guid.Parse("a1000000-0000-0000-0000-000000000003"), QuantityUsed = 1, UnitPriceAtTime = 18.90m, Notes = "Конзоли за външно тяло", CreatedAt = now },
            // Company 1 — #3 Completed
            new() { MontageId = Guid.Parse("b1000000-0000-0000-0000-000000000003"), InventoryItemId = Guid.Parse("a1000000-0000-0000-0000-000000000001"), QuantityUsed = 2, UnitPriceAtTime = 28.50m, Notes = "Зареждане с фреон", CreatedAt = now },
            new() { MontageId = Guid.Parse("b1000000-0000-0000-0000-000000000003"), InventoryItemId = Guid.Parse("a1000000-0000-0000-0000-000000000002"), QuantityUsed = 8, UnitPriceAtTime = 6.20m, Notes = "Тръбен път", CreatedAt = now },

            // Company 2 — #3 Completed
            new() { MontageId = Guid.Parse("b2000000-0000-0000-0000-000000000003"), InventoryItemId = Guid.Parse("a2000000-0000-0000-0000-000000000001"), QuantityUsed = 2, UnitPriceAtTime = 32.00m, Notes = "Зареждане с фреон R410A", CreatedAt = now },
            new() { MontageId = Guid.Parse("b2000000-0000-0000-0000-000000000003"), InventoryItemId = Guid.Parse("a2000000-0000-0000-0000-000000000002"), QuantityUsed = 5, UnitPriceAtTime = 1.40m, Notes = "Отвеждане на конденз", CreatedAt = now },

            // Company 3 — #2 InProgress
            new() { MontageId = Guid.Parse("b3000000-0000-0000-0000-000000000002"), InventoryItemId = Guid.Parse("a3000000-0000-0000-0000-000000000001"), QuantityUsed = 10, UnitPriceAtTime = 11.50m, Notes = "Тръбен път", CreatedAt = now },
            new() { MontageId = Guid.Parse("b3000000-0000-0000-0000-000000000002"), InventoryItemId = Guid.Parse("a3000000-0000-0000-0000-000000000002"), QuantityUsed = 15, UnitPriceAtTime = 2.80m, Notes = "Захранващ кабел", CreatedAt = now },
            // Company 3 — #4 Completed
            new() { MontageId = Guid.Parse("b3000000-0000-0000-0000-000000000004"), InventoryItemId = Guid.Parse("a3000000-0000-0000-0000-000000000001"), QuantityUsed = 12, UnitPriceAtTime = 11.50m, Notes = "Тръбен път", CreatedAt = now },
            new() { MontageId = Guid.Parse("b3000000-0000-0000-0000-000000000004"), InventoryItemId = Guid.Parse("a3000000-0000-0000-0000-000000000003"), QuantityUsed = 2, UnitPriceAtTime = 4.30m, Notes = "Уплътняване", CreatedAt = now },
        };
        context.MontageInventoryItems.AddRange(materials);

        context.SaveChanges();
    }
}

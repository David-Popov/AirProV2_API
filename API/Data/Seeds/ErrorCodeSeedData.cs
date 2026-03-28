using API.Data.Entities;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeds;

public static class ErrorCodeSeedData
{
    public static void SeedDataToDb(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (context.ErrorCodes.Any())
            return;

        var errorCodes = GetErrorCodes();
        context.ErrorCodes.AddRange(errorCodes);
        context.SaveChanges();
    }
    
    private static List<ErrorCode> GetErrorCodes()
    {
        var errorCodes = new List<ErrorCode>();

        errorCodes.AddRange(new[]
        {
            new ErrorCode
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000001"),
                AirConditionerId = Guid.Parse("10000000-0000-0000-0000-000000000001"),
                Code = "A0",
                ErrorName = "Защита срещу блокиране",
                Description = "Активирана е защитата срещу блокиране на компресора",
                Solution = "Изчакайте 3 минути и рестартирайте системата",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000002"),
                AirConditionerId = Guid.Parse("10000000-0000-0000-0000-000000000001"),
                Code = "E1",
                ErrorName = "Грешка в PCB",
                Description = "Неизправност в печатната платка на вътрешното тяло",
                Solution = "Свържете се със сервиз за замяна на PCB",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000003"),
                AirConditionerId = Guid.Parse("10000000-0000-0000-0000-000000000002"),
                Code = "E5",
                ErrorName = "Защита срещу претоварване",
                Description = "Компресорът е претоварен",
                Solution = "Изключете климатика, почистете филтрите и проверете за блокирани решетки",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000004"),
                AirConditionerId = Guid.Parse("10000000-0000-0000-0000-000000000002"),
                Code = "F3",
                ErrorName = "Грешка на температурен сензор",
                Description = "Неизправност на сензора за температура на изходящия въздух",
                Solution = "Проверете връзката на сензора или го подменете",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000005"),
                AirConditionerId = Guid.Parse("10000000-0000-0000-0000-000000000003"),
                Code = "H6",
                ErrorName = "Блокиран компресор",
                Description = "Компресорът не може да стартира поради блокиране",
                Solution = "Проверете за механично блокиране и свържете се със сервиз",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000006"),
                AirConditionerId = Guid.Parse("10000000-0000-0000-0000-000000000003"),
                Code = "L5",
                ErrorName = "Претоварване на захранването",
                Description = "Напрежението е извън допустимите граници",
                Solution = "Проверете електрическата мрежа и стабилизирайте напрежението",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000007"),
                AirConditionerId = Guid.Parse("10000000-0000-0000-0000-000000000004"),
                Code = "U0",
                ErrorName = "Недостатъчно хладилно вещество",
                Description = "Ниско ниво на фреон в системата",
                Solution = "Проверете за течове и презаредете хладилния агент",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000008"),
                AirConditionerId = Guid.Parse("10000000-0000-0000-0000-000000000004"),
                Code = "U2",
                ErrorName = "Ниско напрежение",
                Description = "Захранващото напрежение е под минималното",
                Solution = "Проверете електрическата инсталация",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000009"),
                AirConditionerId = Guid.Parse("10000000-0000-0000-0000-000000000005"),
                Code = "C4",
                ErrorName = "Грешка на топлообменника",
                Description = "Сензорът на топлообменника не работи правилно",
                Solution = "Проверете и подменете сензора",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000010"),
                AirConditionerId = Guid.Parse("10000000-0000-0000-0000-000000000005"),
                Code = "J3",
                ErrorName = "Грешка в дренажната помпа",
                Description = "Дренажната помпа не функционира",
                Solution = "Почистете дренажа и проверете помпата",
                ErrorCodeSeverity = ErrorCodeSeverity.Low,
                CreatedAt = DateTime.UtcNow
            }
        });

        // Mitsubishi Electric error codes
        errorCodes.AddRange(new[]
        {
            new ErrorCode
            {
                Id = Guid.Parse("e1000000-0000-0000-0000-000000000001"),
                AirConditionerId = Guid.Parse("20000000-0000-0000-0000-000000000001"),
                Code = "E01",
                ErrorName = "Грешка PCB вътрешно тяло",
                Description = "Неизправност в платката на вътрешното тяло",
                Solution = "Рестартирайте системата, ако проблемът продължи - смяна на PCB",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e1000000-0000-0000-0000-000000000002"),
                AirConditionerId = Guid.Parse("20000000-0000-0000-0000-000000000001"),
                Code = "E02",
                ErrorName = "Грешка PCB външно тяло",
                Description = "Неизправност в платката на външното тяло",
                Solution = "Проверете електрозахранването и връзките",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e1000000-0000-0000-0000-000000000003"),
                AirConditionerId = Guid.Parse("20000000-0000-0000-0000-000000000002"),
                Code = "E03",
                ErrorName = "Грешка на високо налягане",
                Description = "Активирана защита при високо налягане",
                Solution = "Проверете кондензатора за замърсяване и вентилатора",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e1000000-0000-0000-0000-000000000004"),
                AirConditionerId = Guid.Parse("20000000-0000-0000-0000-000000000002"),
                Code = "E05",
                ErrorName = "Грешка на комуникацията",
                Description = "Няма комуникация между вътрешно и външно тяло",
                Solution = "Проверете кабелите и връзките",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e1000000-0000-0000-0000-000000000005"),
                AirConditionerId = Guid.Parse("20000000-0000-0000-0000-000000000003"),
                Code = "E06",
                ErrorName = "Грешка на вентилатора",
                Description = "Вентилаторът на външното тяло не работи",
                Solution = "Проверете мотора на вентилатора",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e1000000-0000-0000-0000-000000000006"),
                AirConditionerId = Guid.Parse("20000000-0000-0000-0000-000000000003"),
                Code = "E07",
                ErrorName = "Грешка фреон",
                Description = "Недостатъчно или излишно хладилно вещество",
                Solution = "Проверете и регулирайте нивото на фреон",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e1000000-0000-0000-0000-000000000007"),
                AirConditionerId = Guid.Parse("20000000-0000-0000-0000-000000000004"),
                Code = "E09",
                ErrorName = "Грешка термистор",
                Description = "Неизправен температурен сензор",
                Solution = "Подменете термистора",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e1000000-0000-0000-0000-000000000008"),
                AirConditionerId = Guid.Parse("20000000-0000-0000-0000-000000000004"),
                Code = "E12",
                ErrorName = "Грешка дренаж",
                Description = "Препълване на дренажната вана",
                Solution = "Почистете дренажната система",
                ErrorCodeSeverity = ErrorCodeSeverity.Low,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e1000000-0000-0000-0000-000000000009"),
                AirConditionerId = Guid.Parse("20000000-0000-0000-0000-000000000005"),
                Code = "E18",
                ErrorName = "Защита от замръзване",
                Description = "Активирана защита от замръзване на вътрешното тяло",
                Solution = "Почистете филтрите и проверете въздушния поток",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e1000000-0000-0000-0000-000000000010"),
                AirConditionerId = Guid.Parse("20000000-0000-0000-0000-000000000005"),
                Code = "E20",
                ErrorName = "Грешка компресор",
                Description = "Компресорът не може да стартира",
                Solution = "Проверете електрозахранването и компресора",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            }
        });

        // Gree error codes
        errorCodes.AddRange(new[]
        {
            new ErrorCode
            {
                Id = Guid.Parse("e2000000-0000-0000-0000-000000000001"),
                AirConditionerId = Guid.Parse("30000000-0000-0000-0000-000000000001"),
                Code = "E0",
                ErrorName = "EEPROM грешка",
                Description = "Грешка при четене/запис на паметта",
                Solution = "Рестартирайте системата или подменете платката",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e2000000-0000-0000-0000-000000000002"),
                AirConditionerId = Guid.Parse("30000000-0000-0000-0000-000000000001"),
                Code = "E1",
                ErrorName = "Комуникационна грешка",
                Description = "Липса на комуникация между тялата",
                Solution = "Проверете кабелната връзка",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e2000000-0000-0000-0000-000000000003"),
                AirConditionerId = Guid.Parse("30000000-0000-0000-0000-000000000002"),
                Code = "E2",
                ErrorName = "Грешка Zero Crossing",
                Description = "Проблем със синхронизацията на захранването",
                Solution = "Проверете електрозахранването",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e2000000-0000-0000-0000-000000000004"),
                AirConditionerId = Guid.Parse("30000000-0000-0000-0000-000000000002"),
                Code = "E3",
                ErrorName = "Грешка на вентилатора",
                Description = "Вентилаторът на вътрешното тяло не работи",
                Solution = "Проверете мотора на вентилатора",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e2000000-0000-0000-0000-000000000005"),
                AirConditionerId = Guid.Parse("30000000-0000-0000-0000-000000000003"),
                Code = "E4",
                ErrorName = "Грешка на температурен сензор",
                Description = "Сензорът за стайна температура не работи",
                Solution = "Подменете температурния сензор",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e2000000-0000-0000-0000-000000000006"),
                AirConditionerId = Guid.Parse("30000000-0000-0000-0000-000000000003"),
                Code = "E5",
                ErrorName = "Грешка на EVA сензор",
                Description = "Сензорът на изпарителя не работи",
                Solution = "Проверете и подменете сензора",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e2000000-0000-0000-0000-000000000007"),
                AirConditionerId = Guid.Parse("30000000-0000-0000-0000-000000000004"),
                Code = "F0",
                ErrorName = "Грешка на сензор за изходяща температура",
                Description = "Неизправен сензор на изходящ въздух",
                Solution = "Подменете сензора",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e2000000-0000-0000-0000-000000000008"),
                AirConditionerId = Guid.Parse("30000000-0000-0000-0000-000000000004"),
                Code = "F1",
                ErrorName = "Грешка на кондензаторен сензор",
                Description = "Сензорът на кондензатора е неизправен",
                Solution = "Проверете връзките и подменете сензора",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e2000000-0000-0000-0000-000000000009"),
                AirConditionerId = Guid.Parse("30000000-0000-0000-0000-000000000005"),
                Code = "H6",
                ErrorName = "Защита на компресора",
                Description = "Активирана защита на компресора",
                Solution = "Изчакайте 3 минути и рестартирайте",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e2000000-0000-0000-0000-000000000010"),
                AirConditionerId = Guid.Parse("30000000-0000-0000-0000-000000000005"),
                Code = "F4",
                ErrorName = "Защита от замръзване",
                Description = "Температурата на изпарителя е под 0°C",
                Solution = "Почистете филтрите и проверете нивото на фреон",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            }
        });

        // LG error codes
        errorCodes.AddRange(new[]
        {
            new ErrorCode
            {
                Id = Guid.Parse("e3000000-0000-0000-0000-000000000001"),
                AirConditionerId = Guid.Parse("40000000-0000-0000-0000-000000000001"),
                Code = "CH01",
                ErrorName = "Грешка на вътрешен сензор",
                Description = "Неизправност на температурния сензор на вътрешното тяло",
                Solution = "Проверете и подменете сензора",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e3000000-0000-0000-0000-000000000002"),
                AirConditionerId = Guid.Parse("40000000-0000-0000-0000-000000000001"),
                Code = "CH02",
                ErrorName = "Грешка на топлообменник",
                Description = "Сензорът на топлообменника не работи",
                Solution = "Подменете температурния сензор",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e3000000-0000-0000-0000-000000000003"),
                AirConditionerId = Guid.Parse("40000000-0000-0000-0000-000000000002"),
                Code = "CH03",
                ErrorName = "Грешка дренажна помпа",
                Description = "Дренажната помпа не функционира правилно",
                Solution = "Почистете и проверете дренажната помпа",
                ErrorCodeSeverity = ErrorCodeSeverity.Low,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e3000000-0000-0000-0000-000000000004"),
                AirConditionerId = Guid.Parse("40000000-0000-0000-0000-000000000002"),
                Code = "CH05",
                ErrorName = "Грешка на вентилатор",
                Description = "Моторът на вентилатора не работи",
                Solution = "Проверете електрозахранването на мотора",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e3000000-0000-0000-0000-000000000005"),
                AirConditionerId = Guid.Parse("40000000-0000-0000-0000-000000000003"),
                Code = "CH07",
                ErrorName = "Грешка в комуникацията",
                Description = "Няма връзка между вътрешно и външно тяло",
                Solution = "Проверете комуникационния кабел",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e3000000-0000-0000-0000-000000000006"),
                AirConditionerId = Guid.Parse("40000000-0000-0000-0000-000000000003"),
                Code = "CH10",
                ErrorName = "Грешка на компресор",
                Description = "Компресорът не може да стартира",
                Solution = "Проверете захранването и компресора",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e3000000-0000-0000-0000-000000000007"),
                AirConditionerId = Guid.Parse("40000000-0000-0000-0000-000000000004"),
                Code = "CH11",
                ErrorName = "Грешка на инверторна платка",
                Description = "Неизправност в инверторната платка",
                Solution = "Подменете инверторната платка",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e3000000-0000-0000-0000-000000000008"),
                AirConditionerId = Guid.Parse("40000000-0000-0000-0000-000000000004"),
                Code = "CH38",
                ErrorName = "Недостиг на хладилен агент",
                Description = "Ниско ниво на фреон",
                Solution = "Проверете за течове и презаредете системата",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e3000000-0000-0000-0000-000000000009"),
                AirConditionerId = Guid.Parse("40000000-0000-0000-0000-000000000005"),
                Code = "CH51",
                ErrorName = "Високо налягане",
                Description = "Прекалено високо налягане в системата",
                Solution = "Почистете кондензатора и проверете вентилатора",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e3000000-0000-0000-0000-000000000010"),
                AirConditionerId = Guid.Parse("40000000-0000-0000-0000-000000000005"),
                Code = "CH52",
                ErrorName = "Ниско налягане",
                Description = "Прекалено ниско налягане в системата",
                Solution = "Проверете нивото на хладилния агент",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            }
        });

        // Panasonic error codes
        errorCodes.AddRange(new[]
        {
            new ErrorCode
            {
                Id = Guid.Parse("e4000000-0000-0000-0000-000000000001"),
                AirConditionerId = Guid.Parse("50000000-0000-0000-0000-000000000001"),
                Code = "H11",
                ErrorName = "Грешка комуникация",
                Description = "Няма комуникация между вътрешно и външно тяло",
                Solution = "Проверете комуникационните кабели",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e4000000-0000-0000-0000-000000000002"),
                AirConditionerId = Guid.Parse("50000000-0000-0000-0000-000000000001"),
                Code = "H14",
                ErrorName = "Грешка на температурен сензор",
                Description = "Неизправен сензор за стайна температура",
                Solution = "Подменете температурния сензор",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e4000000-0000-0000-0000-000000000003"),
                AirConditionerId = Guid.Parse("50000000-0000-0000-0000-000000000002"),
                Code = "H15",
                ErrorName = "Грешка компресорен сензор",
                Description = "Сензорът на компресора не работи",
                Solution = "Проверете и подменете сензора",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e4000000-0000-0000-0000-000000000004"),
                AirConditionerId = Guid.Parse("50000000-0000-0000-0000-000000000002"),
                Code = "H16",
                ErrorName = "Грешка на външен топлообменник",
                Description = "Неизправност на сензора на външния топлообменник",
                Solution = "Подменете сензора",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e4000000-0000-0000-0000-000000000005"),
                AirConditionerId = Guid.Parse("50000000-0000-0000-0000-000000000003"),
                Code = "H19",
                ErrorName = "Грешка на вентилатор",
                Description = "Вентилаторът на вътрешното тяло не работи",
                Solution = "Проверете мотора на вентилатора",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e4000000-0000-0000-0000-000000000006"),
                AirConditionerId = Guid.Parse("50000000-0000-0000-0000-000000000003"),
                Code = "H23",
                ErrorName = "Грешка на дренаж",
                Description = "Блокиран или пълен дренаж",
                Solution = "Почистете дренажната система",
                ErrorCodeSeverity = ErrorCodeSeverity.Low,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e4000000-0000-0000-0000-000000000007"),
                AirConditionerId = Guid.Parse("50000000-0000-0000-0000-000000000004"),
                Code = "H27",
                ErrorName = "Защита от замръзване",
                Description = "Активирана защита от замръзване",
                Solution = "Почистете филтрите и проверете въздушния поток",
                ErrorCodeSeverity = ErrorCodeSeverity.Medium,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e4000000-0000-0000-0000-000000000008"),
                AirConditionerId = Guid.Parse("50000000-0000-0000-0000-000000000004"),
                Code = "H28",
                ErrorName = "Грешка високо налягане",
                Description = "Прекалено високо налягане в системата",
                Solution = "Почистете външното тяло и проверете вентилатора",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e4000000-0000-0000-0000-000000000009"),
                AirConditionerId = Guid.Parse("50000000-0000-0000-0000-000000000005"),
                Code = "H33",
                ErrorName = "Недостиг фреон",
                Description = "Недостатъчно ниво на хладилен агент",
                Solution = "Проверете за течове и презаредете",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            },
            new ErrorCode
            {
                Id = Guid.Parse("e4000000-0000-0000-0000-000000000010"),
                AirConditionerId = Guid.Parse("50000000-0000-0000-0000-000000000005"),
                Code = "H97",
                ErrorName = "Грешка на компресор",
                Description = "Компресорът не функционира правилно",
                Solution = "Свържете се със сервиз за проверка на компресора",
                ErrorCodeSeverity = ErrorCodeSeverity.Critical,
                CreatedAt = DateTime.UtcNow
            }
        });

        return errorCodes;
    }
}
using API.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeds;

public static class AirConditionerSeedData
{
    public static void SeedDataToDb(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (context.AirConditioners.Any())
            return;

        var airConditioners = GetAirConditioners();
        context.AirConditioners.AddRange(airConditioners);
        context.SaveChanges();
    }
    
    private static List<AirConditioner> GetAirConditioners()
    {
        
        var airConditioners = new List<AirConditioner>();

        // Daikin Air Conditioners (10)
        airConditioners.AddRange(new[]
        {
            new AirConditioner
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000001"),
                Name = "Daikin Emura FTXJ-MW",
                Brand = "Daikin",
                Model = "FTXJ35MW",
                Kilowatts = 12,
                Description = "Стилен и енергийно ефективен климатик с Wi-Fi контрол",
                Price = 2499.99m,
                ImageUrl = "https://example.com/daikin-emura.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000002"),
                Name = "Daikin Stylish FTXA-AW",
                Brand = "Daikin",
                Model = "FTXA25AW",
                Kilowatts = 9,
                Description = "Компактен дизайн с интелигентно управление на въздушния поток",
                Price = 2199.99m,
                ImageUrl = "https://example.com/daikin-stylish.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000003"),
                Name = "Daikin Perfera FTXM-R",
                Brand = "Daikin",
                Model = "FTXM42R",
                Kilowatts = 15,
                Description = "Висок клас климатик с отлична енергийна ефективност A+++",
                Price = 2899.99m,
                ImageUrl = "https://example.com/daikin-perfera.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000004"),
                Name = "Daikin Sensira FTXF-A",
                Brand = "Daikin",
                Model = "FTXF35A",
                Kilowatts = 12,
                Description = "Икономичен климатик с отлично съотношение цена-качество",
                Price = 1799.99m,
                ImageUrl = "https://example.com/daikin-sensira.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000005"),
                Name = "Daikin Comfora FTXP-M",
                Brand = "Daikin",
                Model = "FTXP25M",
                Kilowatts = 9,
                Description = "Тих и ефективен климатик за малки помещения",
                Price = 1899.99m,
                ImageUrl = "https://example.com/daikin-comfora.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000006"),
                Name = "Daikin Ururu Sarara FTXZ-N",
                Brand = "Daikin",
                Model = "FTXZ50N",
                Kilowatts = 18,
                Description = "Премиум климатик с овлажняване и пречистване на въздуха",
                Price = 3499.99m,
                ImageUrl = "https://example.com/daikin-ururu.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000007"),
                Name = "Daikin Siesta ATXC-B",
                Brand = "Daikin",
                Model = "ATXC35B",
                Kilowatts = 12,
                Description = "Компактен и икономичен климатик за дома",
                Price = 1699.99m,
                ImageUrl = "https://example.com/daikin-siesta.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000008"),
                Name = "Daikin Professional FVXM-F",
                Brand = "Daikin",
                Model = "FVXM50F",
                Kilowatts = 18,
                Description = "Професионален климатик за търговски обекти",
                Price = 3199.99m,
                ImageUrl = "https://example.com/daikin-professional.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000009"),
                Name = "Daikin Bluevolution FTXM20R",
                Brand = "Daikin",
                Model = "FTXM20R",
                Kilowatts = 7,
                Description = "Малък и енергийно ефективен климатик",
                Price = 1599.99m,
                ImageUrl = "https://example.com/daikin-bluevolution.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000010"),
                Name = "Daikin Nexura FVXG-K",
                Brand = "Daikin",
                Model = "FVXG50K",
                Kilowatts = 18,
                Description = "Подов климатик с елегантен дизайн",
                Price = 3299.99m,
                ImageUrl = "https://example.com/daikin-nexura.jpg",
                CreatedAt = DateTime.UtcNow
            }
        });

        // Mitsubishi Electric Air Conditioners (10)
        airConditioners.AddRange(new[]
        {
            new AirConditioner
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000001"),
                Name = "Mitsubishi Electric Kirigamine ZEN MSZ-EF",
                Brand = "Mitsubishi Electric",
                Model = "MSZ-EF35VE",
                Kilowatts = 12,
                Description = "Премиум климатик с изключителен дизайн и функционалност",
                Price = 2699.99m,
                ImageUrl = "https://example.com/mitsubishi-zen.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000002"),
                Name = "Mitsubishi Electric Diamond MSZ-LN",
                Brand = "Mitsubishi Electric",
                Model = "MSZ-LN25VG",
                Kilowatts = 9,
                Description = "Стилен инверторен климатик с Wi-Fi",
                Price = 2399.99m,
                ImageUrl = "https://example.com/mitsubishi-diamond.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000003"),
                Name = "Mitsubishi Electric Deluxe MSZ-FH",
                Brand = "Mitsubishi Electric",
                Model = "MSZ-FH35VE",
                Kilowatts = 12,
                Description = "Висококачествен климатик с 3D i-see сензор",
                Price = 2599.99m,
                ImageUrl = "https://example.com/mitsubishi-deluxe.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000004"),
                Name = "Mitsubishi Electric Classic MSZ-HR",
                Brand = "Mitsubishi Electric",
                Model = "MSZ-HR35VF",
                Kilowatts = 12,
                Description = "Надежден климатик с отлично качество",
                Price = 1899.99m,
                ImageUrl = "https://example.com/mitsubishi-classic.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000005"),
                Name = "Mitsubishi Electric Premium MSZ-AP",
                Brand = "Mitsubishi Electric",
                Model = "MSZ-AP42VG",
                Kilowatts = 15,
                Description = "Премиум серия с напреднали функции",
                Price = 2899.99m,
                ImageUrl = "https://example.com/mitsubishi-premium.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000006"),
                Name = "Mitsubishi Electric Compact MSZ-SF",
                Brand = "Mitsubishi Electric",
                Model = "MSZ-SF25VE",
                Kilowatts = 9,
                Description = "Компактен и ефективен климатик",
                Price = 1699.99m,
                ImageUrl = "https://example.com/mitsubishi-compact.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000007"),
                Name = "Mitsubishi Electric Design MSZ-EF",
                Brand = "Mitsubishi Electric",
                Model = "MSZ-EF50VE",
                Kilowatts = 18,
                Description = "Дизайнерски климатик за луксозни интериори",
                Price = 3199.99m,
                ImageUrl = "https://example.com/mitsubishi-design.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000008"),
                Name = "Mitsubishi Electric Smart MSZ-AY",
                Brand = "Mitsubishi Electric",
                Model = "MSZ-AY35VG",
                Kilowatts = 12,
                Description = "Интелигентен климатик с IoT функции",
                Price = 2499.99m,
                ImageUrl = "https://example.com/mitsubishi-smart.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000009"),
                Name = "Mitsubishi Electric Silent MSZ-DM",
                Brand = "Mitsubishi Electric",
                Model = "MSZ-DM35VA",
                Kilowatts = 12,
                Description = "Изключително тих климатик за спални",
                Price = 2199.99m,
                ImageUrl = "https://example.com/mitsubishi-silent.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000010"),
                Name = "Mitsubishi Electric Power MSZ-GF",
                Brand = "Mitsubishi Electric",
                Model = "MSZ-GF60VE",
                Kilowatts = 21,
                Description = "Мощен климатик за големи помещения",
                Price = 3599.99m,
                ImageUrl = "https://example.com/mitsubishi-power.jpg",
                CreatedAt = DateTime.UtcNow
            }
        });

        // Gree Air Conditioners (10)
        airConditioners.AddRange(new[]
        {
            new AirConditioner
            {
                Id = Guid.Parse("30000000-0000-0000-0000-000000000001"),
                Name = "Gree Amber Nordic GWH09YD",
                Brand = "Gree",
                Model = "GWH09YD-S6DBA2A",
                Kilowatts = 9,
                Description = "Климатик оптимизиран за работа при ниски температури",
                Price = 1299.99m,
                ImageUrl = "https://example.com/gree-amber.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("30000000-0000-0000-0000-000000000002"),
                Name = "Gree Fairy GWH12ACC",
                Brand = "Gree",
                Model = "GWH12ACC-K6DNA1A",
                Kilowatts = 12,
                Description = "Икономичен климатик с добро охлаждане",
                Price = 1199.99m,
                ImageUrl = "https://example.com/gree-fairy.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("30000000-0000-0000-0000-000000000003"),
                Name = "Gree Lomo Eco GWH09QB",
                Brand = "Gree",
                Model = "GWH09QB-K6DND2I",
                Kilowatts = 9,
                Description = "Енергоспестяващ климатик с R32 хладилен агент",
                Price = 1099.99m,
                ImageUrl = "https://example.com/gree-lomo.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("30000000-0000-0000-0000-000000000004"),
                Name = "Gree Bora GWH12AAB",
                Brand = "Gree",
                Model = "GWH12AAB-K6DNA5A",
                Kilowatts = 12,
                Description = "Надежден климатик със силно охлаждане",
                Price = 1399.99m,
                ImageUrl = "https://example.com/gree-bora.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("30000000-0000-0000-0000-000000000005"),
                Name = "Gree Viola GWH09RA",
                Brand = "Gree",
                Model = "GWH09RA-K6DNA2B",
                Kilowatts = 9,
                Description = "Стилен климатик с WiFi управление",
                Price = 1499.99m,
                ImageUrl = "https://example.com/gree-viola.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("30000000-0000-0000-0000-000000000006"),
                Name = "Gree Pular GWH18TD",
                Brand = "Gree",
                Model = "GWH18TD-K6DNA1B",
                Kilowatts = 18,
                Description = "Мощен климатик за средни и големи помещения",
                Price = 1899.99m,
                ImageUrl = "https://example.com/gree-pular.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("30000000-0000-0000-0000-000000000007"),
                Name = "Gree Cozy GWH07MA",
                Brand = "Gree",
                Model = "GWH07MA-K3NNA5A",
                Kilowatts = 7,
                Description = "Компактен климатик за малки стаи",
                Price = 999.99m,
                ImageUrl = "https://example.com/gree-cozy.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("30000000-0000-0000-0000-000000000008"),
                Name = "Gree U-Crown GWH24YE",
                Brand = "Gree",
                Model = "GWH24YE-S6DBA2A",
                Kilowatts = 24,
                Description = "Професионален климатик за офиси и магазини",
                Price = 2599.99m,
                ImageUrl = "https://example.com/gree-ucrown.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("30000000-0000-0000-0000-000000000009"),
                Name = "Gree Soyal GWH09ALC",
                Brand = "Gree",
                Model = "GWH09ALC-K6DNA1A",
                Kilowatts = 9,
                Description = "Тих и ефективен климатик",
                Price = 1249.99m,
                ImageUrl = "https://example.com/gree-soyal.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("30000000-0000-0000-0000-000000000010"),
                Name = "Gree G-Tech GWH12AEC",
                Brand = "Gree",
                Model = "GWH12AEC-K6DNA1A",
                Kilowatts = 12,
                Description = "Модерен климатик с интелигентно управление",
                Price = 1599.99m,
                ImageUrl = "https://example.com/gree-gtech.jpg",
                CreatedAt = DateTime.UtcNow
            }
        });

        // LG Air Conditioners (10)
        airConditioners.AddRange(new[]
        {
            new AirConditioner
            {
                Id = Guid.Parse("40000000-0000-0000-0000-000000000001"),
                Name = "LG Artcool Gallery A09FR",
                Brand = "LG",
                Model = "A09FR.NSF",
                Kilowatts = 9,
                Description = "Уникален дизайн климатик с персонализируем панел",
                Price = 2799.99m,
                ImageUrl = "https://example.com/lg-artcool-gallery.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("40000000-0000-0000-0000-000000000002"),
                Name = "LG Dual Cool S3-W12JA3AA",
                Brand = "LG",
                Model = "S3-W12JA3AA",
                Kilowatts = 12,
                Description = "Бързо охлаждане с Dual Inverter технология",
                Price = 1899.99m,
                ImageUrl = "https://example.com/lg-dualcool.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("40000000-0000-0000-0000-000000000003"),
                Name = "LG Standard Plus PM09SP",
                Brand = "LG",
                Model = "PM09SP.NSJ",
                Kilowatts = 9,
                Description = "Надежден климатик със стандартни функции",
                Price = 1599.99m,
                ImageUrl = "https://example.com/lg-standard.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("40000000-0000-0000-0000-000000000004"),
                Name = "LG Deluxe DC12RQ",
                Brand = "LG",
                Model = "DC12RQ.NSJ",
                Kilowatts = 12,
                Description = "Елегантен климатик с премиум функции",
                Price = 2199.99m,
                ImageUrl = "https://example.com/lg-deluxe.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("40000000-0000-0000-0000-000000000005"),
                Name = "LG Prestige AP09RT",
                Brand = "LG",
                Model = "AP09RT.NSJ",
                Kilowatts = 9,
                Description = "Престижна серия с напреднало пречистване на въздуха",
                Price = 2399.99m,
                ImageUrl = "https://example.com/lg-prestige.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("40000000-0000-0000-0000-000000000006"),
                Name = "LG Mega Plus P18EN",
                Brand = "LG",
                Model = "P18EN.NSJ",
                Kilowatts = 18,
                Description = "Мощен климатик за големи пространства",
                Price = 2899.99m,
                ImageUrl = "https://example.com/lg-mega.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("40000000-0000-0000-0000-000000000007"),
                Name = "LG ThinQ S3-Q09JA3AA",
                Brand = "LG",
                Model = "S3-Q09JA3AA",
                Kilowatts = 9,
                Description = "Smart климатик с AI ThinQ управление",
                Price = 2099.99m,
                ImageUrl = "https://example.com/lg-thinq.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("40000000-0000-0000-0000-000000000008"),
                Name = "LG Multi F MU2M15",
                Brand = "LG",
                Model = "MU2M15.U21",
                Kilowatts = 15,
                Description = "Мулти-сплит система за цялостно охлаждане",
                Price = 3299.99m,
                ImageUrl = "https://example.com/lg-multi.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("40000000-0000-0000-0000-000000000009"),
                Name = "LG Pro Cool PC07SQ",
                Brand = "LG",
                Model = "PC07SQ.NSJ",
                Kilowatts = 7,
                Description = "Професионален компактен климатик",
                Price = 1399.99m,
                ImageUrl = "https://example.com/lg-procool.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("40000000-0000-0000-0000-000000000010"),
                Name = "LG Libero E12EM",
                Brand = "LG",
                Model = "E12EM.NSJ",
                Kilowatts = 12,
                Description = "Икономичен климатик с добра ефективност",
                Price = 1699.99m,
                ImageUrl = "https://example.com/lg-libero.jpg",
                CreatedAt = DateTime.UtcNow
            }
        });

        // Panasonic Air Conditioners (10)
        airConditioners.AddRange(new[]
        {
            new AirConditioner
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000001"),
                Name = "Panasonic Etherea CS-Z25XKEW",
                Brand = "Panasonic",
                Model = "CS-Z25XKEW",
                Kilowatts = 9,
                Description = "Луксозен климатик с изключителен дизайн",
                Price = 2899.99m,
                ImageUrl = "https://example.com/panasonic-etherea.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000002"),
                Name = "Panasonic Nordic KIT-NZ35-XKE",
                Brand = "Panasonic",
                Model = "KIT-NZ35-XKE",
                Kilowatts = 12,
                Description = "Специално разработен за скандинавски климат",
                Price = 2599.99m,
                ImageUrl = "https://example.com/panasonic-nordic.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000003"),
                Name = "Panasonic Compact KIT-TZ25-WKE",
                Brand = "Panasonic",
                Model = "KIT-TZ25-WKE",
                Kilowatts = 9,
                Description = "Компактен и ефективен климатик",
                Price = 1799.99m,
                ImageUrl = "https://example.com/panasonic-compact.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000004"),
                Name = "Panasonic Standard CS-RE12RKEW",
                Brand = "Panasonic",
                Model = "CS-RE12RKEW",
                Kilowatts = 12,
                Description = "Стандартен климатик с отлично качество",
                Price = 1699.99m,
                ImageUrl = "https://example.com/panasonic-standard.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000005"),
                Name = "Panasonic Professional KIT-FZ35-WKE",
                Brand = "Panasonic",
                Model = "KIT-FZ35-WKE",
                Kilowatts = 12,
                Description = "Професионален климатик за бизнес",
                Price = 2399.99m,
                ImageUrl = "https://example.com/panasonic-professional.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000006"),
                Name = "Panasonic Elite CS-XZ50-XKEW",
                Brand = "Panasonic",
                Model = "CS-XZ50-XKEW",
                Kilowatts = 18,
                Description = "Елитна серия с най-високи технологии",
                Price = 3499.99m,
                ImageUrl = "https://example.com/panasonic-elite.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000007"),
                Name = "Panasonic Heatcharge KIT-VZ12-SKE",
                Brand = "Panasonic",
                Model = "KIT-VZ12-SKE",
                Kilowatts = 12,
                Description = "Оптимизиран за отопление при ниски температури",
                Price = 2199.99m,
                ImageUrl = "https://example.com/panasonic-heatcharge.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000008"),
                Name = "Panasonic Free Multi MU-2Z20-UBE",
                Brand = "Panasonic",
                Model = "MU-2Z20-UBE",
                Kilowatts = 20,
                Description = "Мулти-сплит система с висока ефективност",
                Price = 3699.99m,
                ImageUrl = "https://example.com/panasonic-multi.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000009"),
                Name = "Panasonic Eco KIT-UE09-RKEA",
                Brand = "Panasonic",
                Model = "KIT-UE09-RKEA",
                Kilowatts = 9,
                Description = "Екологичен климатик с нисък разход",
                Price = 1599.99m,
                ImageUrl = "https://example.com/panasonic-eco.jpg",
                CreatedAt = DateTime.UtcNow
            },
            new AirConditioner
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000010"),
                Name = "Panasonic Deluxe KIT-Z50-XKE",
                Brand = "Panasonic",
                Model = "KIT-Z50-XKE",
                Kilowatts = 18,
                Description = "Делукс климатик за луксозни интериори",
                Price = 3299.99m,
                ImageUrl = "https://example.com/panasonic-deluxe.jpg",
                CreatedAt = DateTime.UtcNow
            }
        });

        return airConditioners;
    }
}
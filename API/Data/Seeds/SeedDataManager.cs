namespace API.Data.Seeds;

public static class SeedDataManager
{
    public static void SeedAllData(IServiceProvider serviceProvider)
    {
        CompanySeedData.SeedDataToDb(serviceProvider);
        RoleSeedData.SeedDataToDb(serviceProvider);
        UserSeedData.SeedDataToDb(serviceProvider);
        AirConditionerSeedData.SeedDataToDb(serviceProvider);
        ErrorCodeSeedData.SeedDataToDb(serviceProvider);
    }
}
using API.Data.Entities;
using API.DTOs;
using Mapster;

namespace API.Mappings;

public class CompanyMappingRegister : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Company, CompanyDto>()
            .Map(d => d.Id, s => s.Id.ToString())
            .Map(d => d.CompanyType, s => s.CompanyType.ToString())
            .Map(d => d.SubscriptionPlan, s => s.SubscriptionPlan.ToString())
            .Map(d => d.UsersCount, s => s.Users.Count);

        config.NewConfig<ApplicationUser, UserDto>()
            .Map(d => d.Email, s => s.Email ?? string.Empty)
            .Map(d => d.CompanyId, s => s.CompanyId.ToString());
    }
}

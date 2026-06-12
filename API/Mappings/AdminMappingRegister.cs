using API.Data.Entities;
using API.DTOs.Admin;
using Mapster;

namespace API.Mappings;

public class AdminMappingRegister : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Company, AdminCompanyDto>()
            .Map(d => d.CompanyType, s => s.CompanyType.ToString())
            .Map(d => d.IsDeleted, s => s.IsActive == false)
            .Map(d => d.OwnerName, s => s.Users.Where(u => !u.IsDeleted).Select(u => u.FirstName + " " + u.LastName).FirstOrDefault())
            .Map(d => d.OwnerEmail, s => s.Users.Where(u => !u.IsDeleted).Select(u => u.Email).FirstOrDefault())
            .Map(d => d.OwnerPhone, s => s.Users.Where(u => !u.IsDeleted).Select(u => u.PhoneNumber).FirstOrDefault())
            .Map(d => d.SubscriptionPlan, s => s.SubscriptionPlan.ToString())
            .Map(d => d.SubscriptionStatus, s => s.SubscriptionStatus.ToString())
            .Map(d => d.UserCount, s => s.Users.Count(u => !u.IsDeleted))
            .Map(d => d.MontageCount, s => s.Montages.Count);

        config.NewConfig<Montage, AdminMontageDto>()
            .Map(d => d.Status, s => s.Status.ToString())
            .Map(d => d.PaymentStatus, s => s.PaymentStatus.ToString())
            .Map(d => d.UserName, s => s.User != null ? s.User.FirstName + " " + s.User.LastName : null)
            .Map(d => d.UserEmail, s => s.User != null ? s.User.Email : null)
            .Map(d => d.CompanyName, s => s.Company != null ? s.Company.CompanyName : null)
            .Map(d => d.AirConditionerBrand, s => s.AirConditioner != null ? s.AirConditioner.Brand : null)
            .Map(d => d.AirConditionerModel, s => s.AirConditioner != null ? s.AirConditioner.Model : null);
    }
}

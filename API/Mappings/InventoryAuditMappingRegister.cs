using API.Data.Entities;
using API.DTOs;
using Mapster;

namespace API.Mappings;

public class InventoryAuditMappingRegister : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<ApplicationUser, AuditUserDto>()
            .Map(d => d.FullName, s => (s.FirstName + " " + s.LastName).Trim());

        config.NewConfig<Montage, AuditMontageDto>();

        config.NewConfig<InventoryItem, AuditInventoryItemDto>();

        config.NewConfig<InventoryAuditLog, InventoryAuditLogDto>();
    }
}

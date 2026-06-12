using API.Data.Entities;
using API.DTOs;
using Mapster;

namespace API.Mappings;

public class InventoryMappingRegister : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<InventoryItem, InventoryItemDto>()
            .Map(d => d.UnitOfMeasure, s => s.UnitOfMeasure.ToString())
            .Map(d => d.IsLowStock, s => s.MinQuantity.HasValue && s.Quantity <= s.MinQuantity.Value);
    }
}

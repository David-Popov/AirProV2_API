using API.Data.Entities;
using API.DTOs;
using Mapster;

namespace API.Mappings;

public class MontageMappingRegister : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<MontageAssignment, AssignedUserDto>()
            .Map(d => d.Id, s => s.UserId)
            .Map(d => d.FullName, s => s.User != null ? s.User.FirstName + " " + s.User.LastName : "");

        config.NewConfig<MontageInventoryItem, MontageInventoryItemDto>()
            .Map(d => d.ItemName, s => s.InventoryItem != null ? s.InventoryItem.Name : null)
            .Map(d => d.ItemSku, s => s.InventoryItem != null ? s.InventoryItem.Sku : null)
            .Map(d => d.UnitOfMeasure, s => s.InventoryItem != null ? s.InventoryItem.UnitOfMeasure.ToString() : null)
            .Map(d => d.ItemIsActive, s => s.InventoryItem != null ? s.InventoryItem.IsActive : (bool?)null);
    }
}

using API.Data.Entities;
using API.DTOs;
using Mapster;

namespace API.Mappings;

public static class MontageMappingConfig
{
    public static readonly TypeAdapterConfig List = Build(detail: false);
    public static readonly TypeAdapterConfig Detail = Build(detail: true);

    private static TypeAdapterConfig Build(bool detail)
    {
        var config = TypeAdapterConfig.GlobalSettings.Clone();

        var setter = config.NewConfig<Montage, MontageDto>()
            .Map(d => d.Status, s => s.Status.ToString())
            .Map(d => d.PaymentStatus, s => s.PaymentStatus.ToString())
            .Map(d => d.AssignedUserIds, s => s.Assignments.Select(a => a.UserId).ToList())
            .Map(d => d.AssignedUsers, s => s.Assignments);

        if (detail)
        {
            setter
                .Map(d => d.UsedMaterials, s => s.UsedMaterials)
                .Map(d => d.Photos, s => s.Photos.OrderBy(p => p.DisplayOrder).ThenBy(p => p.CreatedAt).ToList());
        }
        else
        {
            setter
                .Ignore(d => d.UsedMaterials!)
                .Ignore(d => d.Photos!);
        }

        return config;
    }
}

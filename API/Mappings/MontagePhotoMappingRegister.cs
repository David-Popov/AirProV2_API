using API.Data.Entities;
using API.DTOs;
using Mapster;

namespace API.Mappings;

public class MontagePhotoMappingRegister : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<MontagePhoto, MontagePhotoDto>()
            .Map(d => d.Url, s => "/api/montagephotos/" + s.Id + "/download");
    }
}

using API.Data.Entities;
using API.DTOs;
using Mapster;

namespace API.Mappings;

public class AirConditionerMappingRegister : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<AirConditioner, AirConditionerDto>();

        config.NewConfig<ErrorCode, ErrorCodeDto>()
            .Map(d => d.Severity, s => s.ErrorCodeSeverity.ToString());
    }
}

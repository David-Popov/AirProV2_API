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
            .Map(d => d.Severity, s => s.ErrorCodeSeverity.ToString())
            // Brand-prefixed label (e.g. "Daikin FTXM35") — Name alone has no brand.
            .Map(d => d.AirConditionerName, s => s.AirConditioner == null
                ? null
                : (string.IsNullOrEmpty(s.AirConditioner.Brand)
                    ? s.AirConditioner.Name
                    : s.AirConditioner.Brand + " " + s.AirConditioner.Name));
    }
}

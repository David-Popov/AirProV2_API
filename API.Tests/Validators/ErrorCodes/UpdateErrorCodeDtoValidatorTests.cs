using API.DTOs;
using API.Validators.ErrorCodes;

namespace API.Tests.Validators.ErrorCodes;

public class UpdateErrorCodeDtoValidatorTests
{
    private readonly UpdateErrorCodeDtoValidator _validator = new();

    [Fact]
    public void Valid_Dto_Passes()
    {
        var result = _validator.Validate(new UpdateErrorCodeDto
        {
            Code = "E2",
            ErrorName = "Sensor failure"
        });

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Empty_Code_Fails()
    {
        var result = _validator.Validate(new UpdateErrorCodeDto
        {
            Code = ""
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateErrorCodeDto.Code));
    }
}

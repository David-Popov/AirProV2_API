using API.DTOs;
using API.Validators.ErrorCodes;

namespace API.Tests.Validators.ErrorCodes;

public class CreateErrorCodeDtoValidatorTests
{
    private readonly CreateErrorCodeDtoValidator _validator = new();

    [Fact]
    public void Valid_Dto_Passes()
    {
        var result = _validator.Validate(new CreateErrorCodeDto
        {
            Code = "E1",
            ErrorName = "Communication error"
        });

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Empty_Code_Fails()
    {
        var result = _validator.Validate(new CreateErrorCodeDto
        {
            Code = "",
            ErrorName = "Whatever"
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateErrorCodeDto.Code));
    }
}

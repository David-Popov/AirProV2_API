using API.DTOs.Auth;
using API.Validators.Auth;

namespace API.Tests.Validators.Auth;

public class UpdateProfileDtoValidatorTests
{
    private readonly UpdateProfileDtoValidator _validator = new();

    [Fact]
    public void Valid_Dto_Passes()
    {
        var result = _validator.Validate(new UpdateProfileDto
        {
            FirstName = "Ivan",
            LastName = "Ivanov"
        });

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Empty_FirstName_Fails()
    {
        var result = _validator.Validate(new UpdateProfileDto
        {
            FirstName = "",
            LastName = "Ivanov"
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateProfileDto.FirstName));
    }
}

using API.DTOs.Auth;
using API.Validators.Auth;

namespace API.Tests.Validators.Auth;

public class ChangePasswordDtoValidatorTests
{
    private readonly ChangePasswordDtoValidator _validator = new();

    [Fact]
    public void Matching_Strong_Passwords_Pass()
    {
        var result = _validator.Validate(new ChangePasswordDto
        {
            NewPassword = "Secret123",
            ConfirmPassword = "Secret123"
        });

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Mismatched_Passwords_Fail()
    {
        var result = _validator.Validate(new ChangePasswordDto
        {
            NewPassword = "Secret123",
            ConfirmPassword = "Different1"
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(ChangePasswordDto.ConfirmPassword));
    }
}

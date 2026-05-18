using API.DTOs.Auth;
using API.Validators.Auth;

namespace API.Tests.Validators.Auth;

public class ResetPasswordDtoValidatorTests
{
    private readonly ResetPasswordDtoValidator _validator = new();

    [Fact]
    public void Valid_Dto_Passes()
    {
        var result = _validator.Validate(new ResetPasswordDto
        {
            Email = "user@example.com",
            Token = "abc123",
            NewPassword = "Secret123"
        });

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Empty_Token_Fails()
    {
        var result = _validator.Validate(new ResetPasswordDto
        {
            Email = "user@example.com",
            Token = "",
            NewPassword = "Secret123"
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(ResetPasswordDto.Token));
    }
}

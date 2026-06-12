using API.DTOs;
using API.Validators.Auth;

namespace API.Tests.Validators.Auth;

public class LoginDtoValidatorTests
{
    private readonly LoginDtoValidator _validator = new();

    [Fact]
    public void Valid_Credentials_Pass()
    {
        var result = _validator.Validate(new LoginDto
        {
            Email = "user@example.com",
            Password = "Secret123!"
        });

        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-an-email")]
    [InlineData("@nodomain.com")]
    public void Invalid_Email_Fails(string email)
    {
        var result = _validator.Validate(new LoginDto { Email = email, Password = "Secret123!" });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginDto.Email));
    }

    [Fact]
    public void Empty_Password_Fails()
    {
        var result = _validator.Validate(new LoginDto { Email = "user@example.com", Password = "" });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginDto.Password));
    }
}

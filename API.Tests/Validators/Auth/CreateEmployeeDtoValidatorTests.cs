using API.DTOs;
using API.Validators.Auth;

namespace API.Tests.Validators.Auth;

public class CreateEmployeeDtoValidatorTests
{
    private readonly CreateEmployeeDtoValidator _validator = new();

    private static CreateEmployeeDto ValidDto() => new()
    {
        Email = "tech@example.com",
        Password = "Secret123",
        FirstName = "Petar",
        LastName = "Petrov"
    };

    [Fact]
    public void Valid_Dto_Passes()
    {
        _validator.Validate(ValidDto()).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Invalid_Email_Fails()
    {
        var dto = ValidDto();
        dto.Email = "not-an-email";

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateEmployeeDto.Email));
    }

    [Fact]
    public void Weak_Password_Fails()
    {
        var dto = ValidDto();
        dto.Password = "weakpw";

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateEmployeeDto.Password));
    }
}

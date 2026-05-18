using API.DTOs;
using API.Validators.Companies;

namespace API.Tests.Validators.Companies;

public class CreateCompanyUserDtoValidatorTests
{
    private readonly CreateCompanyUserDtoValidator _validator = new();

    private static CreateCompanyUserDto ValidDto() => new()
    {
        Email = "manager@example.com",
        Password = "Secret123!",
        FirstName = "Maria",
        LastName = "Petrova"
    };

    [Fact]
    public void Valid_Dto_Passes()
    {
        _validator.Validate(ValidDto()).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Password_Without_Special_Char_Fails()
    {
        // This validator is stricter — also requires a special character (\W_).
        var dto = ValidDto();
        dto.Password = "Secret123"; // missing special

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCompanyUserDto.Password));
    }
}

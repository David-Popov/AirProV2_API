using API.DTOs;
using API.Validators.Companies;

namespace API.Tests.Validators.Companies;

public class CreateCompanyDtoValidatorTests
{
    private readonly CreateCompanyDtoValidator _validator = new();

    private static CreateCompanyDto ValidDto() => new()
    {
        CompanyName = "Acme Klimat",
        CompanyType = "LLC",
        Bulstat = "123456789",
        Email = "info@acme.bg"
    };

    [Fact]
    public void Valid_Dto_Passes()
    {
        _validator.Validate(ValidDto()).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Empty_CompanyName_Fails()
    {
        var dto = ValidDto();
        dto.CompanyName = "";

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCompanyDto.CompanyName));
    }

    [Fact]
    public void Invalid_CompanyType_Fails()
    {
        var dto = ValidDto();
        dto.CompanyType = "MagicType";

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCompanyDto.CompanyType));
    }
}

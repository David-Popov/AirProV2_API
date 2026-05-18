using API.DTOs;
using API.Validators.Companies;

namespace API.Tests.Validators.Companies;

public class UpdateCompanyDtoValidatorTests
{
    private readonly UpdateCompanyDtoValidator _validator = new();

    [Fact]
    public void Valid_Dto_Passes()
    {
        var result = _validator.Validate(new UpdateCompanyDto
        {
            CompanyName = "Renamed Klimat",
            CompanyType = "LLC"
        });

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Bulstat_TooShort_Fails()
    {
        var result = _validator.Validate(new UpdateCompanyDto
        {
            CompanyName = "X",
            CompanyType = "LLC",
            Bulstat = "12345" // < 9 chars
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateCompanyDto.Bulstat));
    }
}

using API.DTOs;
using API.Validators.Montages;

namespace API.Tests.Validators.Montages;

public class CreateMontageDtoValidatorTests
{
    private readonly CreateMontageDtoValidator _validator = new();

    private static CreateMontageDto ValidDto() => new()
    {
        ClientName = "Petar Petrov",
        InstallationDate = DateOnly.FromDateTime(DateTime.UtcNow),
        TotalPrice = 1000m,
        PaidAmount = 0m
    };

    [Fact]
    public void Valid_Dto_Passes()
    {
        _validator.Validate(ValidDto()).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Empty_ClientName_Fails()
    {
        var dto = ValidDto();
        dto.ClientName = "";

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateMontageDto.ClientName));
    }

    [Fact]
    public void Paid_Exceeds_Total_Fails()
    {
        var dto = ValidDto();
        dto.TotalPrice = 100m;
        dto.PaidAmount = 200m;

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateMontageDto.PaidAmount));
    }

    [Fact]
    public void Invalid_Phone_Fails()
    {
        var dto = ValidDto();
        dto.ClientPhone = "123-456";

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateMontageDto.ClientPhone));
    }
}

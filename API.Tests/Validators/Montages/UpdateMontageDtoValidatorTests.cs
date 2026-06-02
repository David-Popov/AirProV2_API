using API.DTOs;
using API.Validators.Montages;

namespace API.Tests.Validators.Montages;

public class UpdateMontageDtoValidatorTests
{
    private readonly UpdateMontageDtoValidator _validator = new();

    private static UpdateMontageDto ValidDto() => new()
    {
        ClientName = "Maria Stoyanova",
        InstallationDate = DateOnly.FromDateTime(DateTime.UtcNow),
        TotalPrice = 500m,
        PaidAmount = 100m
    };

    [Fact]
    public void Valid_Dto_Passes()
    {
        _validator.Validate(ValidDto()).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Negative_TotalPrice_Fails()
    {
        var dto = ValidDto();
        dto.TotalPrice = -1m;

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateMontageDto.TotalPrice));
    }
}

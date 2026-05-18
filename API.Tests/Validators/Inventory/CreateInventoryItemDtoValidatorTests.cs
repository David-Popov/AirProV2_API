using API.DTOs;
using API.Validators.Inventory;

namespace API.Tests.Validators.Inventory;

public class CreateInventoryItemDtoValidatorTests
{
    private readonly CreateInventoryItemDtoValidator _validator = new();

    private static CreateInventoryItemDto ValidDto() => new()
    {
        CompanyId = Guid.NewGuid(),
        Name = "Copper Pipes 6mm",
        Quantity = 10m,
        UnitOfMeasure = "Meters"
    };

    [Fact]
    public void Valid_Dto_Passes()
    {
        _validator.Validate(ValidDto()).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Empty_CompanyId_Fails()
    {
        var dto = ValidDto();
        dto.CompanyId = Guid.Empty;

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateInventoryItemDto.CompanyId));
    }

    [Fact]
    public void Invalid_UnitOfMeasure_Fails()
    {
        var dto = ValidDto();
        dto.UnitOfMeasure = "Bushels";

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateInventoryItemDto.UnitOfMeasure));
    }

    [Fact]
    public void Negative_Quantity_Fails()
    {
        var dto = ValidDto();
        dto.Quantity = -1m;

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateInventoryItemDto.Quantity));
    }
}

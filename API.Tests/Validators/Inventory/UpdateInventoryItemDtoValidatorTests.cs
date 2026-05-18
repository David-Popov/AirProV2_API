using API.DTOs;
using API.Validators.Inventory;

namespace API.Tests.Validators.Inventory;

public class UpdateInventoryItemDtoValidatorTests
{
    private readonly UpdateInventoryItemDtoValidator _validator = new();

    [Fact]
    public void Valid_Dto_Passes()
    {
        var result = _validator.Validate(new UpdateInventoryItemDto
        {
            Name = "Copper Pipes 6mm",
            Quantity = 5m,
            UnitOfMeasure = "Meters"
        });

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Empty_Name_Fails()
    {
        var result = _validator.Validate(new UpdateInventoryItemDto
        {
            Name = "",
            Quantity = 5m,
            UnitOfMeasure = "Meters"
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateInventoryItemDto.Name));
    }
}

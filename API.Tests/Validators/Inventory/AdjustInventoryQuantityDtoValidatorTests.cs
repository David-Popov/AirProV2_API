using API.DTOs;
using API.Validators.Inventory;

namespace API.Tests.Validators.Inventory;

public class AdjustInventoryQuantityDtoValidatorTests
{
    private readonly AdjustInventoryQuantityDtoValidator _validator = new();

    [Theory]
    [InlineData(1.5)]
    [InlineData(-2.0)]
    public void Nonzero_Adjustment_Passes(double amount)
    {
        var result = _validator.Validate(new AdjustInventoryQuantityDto
        {
            AdjustmentAmount = (decimal)amount,
            Reason = "Manual count correction"
        });

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Zero_Adjustment_Fails()
    {
        var result = _validator.Validate(new AdjustInventoryQuantityDto
        {
            AdjustmentAmount = 0,
            Reason = "noop"
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(AdjustInventoryQuantityDto.AdjustmentAmount));
    }

    [Fact]
    public void Reason_TooLong_Fails()
    {
        var result = _validator.Validate(new AdjustInventoryQuantityDto
        {
            AdjustmentAmount = 1m,
            Reason = new string('x', 501)
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(AdjustInventoryQuantityDto.Reason));
    }
}

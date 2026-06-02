using API.DTOs;
using API.Validators.AirConditioners;

namespace API.Tests.Validators.AirConditioners;

public class UpdateAirConditionerDtoValidatorTests
{
    private readonly UpdateAirConditionerDtoValidator _validator = new();

    [Fact]
    public void Valid_Dto_Passes()
    {
        var result = _validator.Validate(new UpdateAirConditionerDto
        {
            Name = "Daikin FTXM50R",
            Kilowatts = 5,
            Price = 1199.99m
        });

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Negative_Price_Fails()
    {
        var result = _validator.Validate(new UpdateAirConditionerDto
        {
            Name = "Daikin FTXM50R",
            Price = -1m
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateAirConditionerDto.Price));
    }
}

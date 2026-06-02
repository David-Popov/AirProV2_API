using API.DTOs;
using API.Validators.AirConditioners;

namespace API.Tests.Validators.AirConditioners;

public class CreateAirConditionerDtoValidatorTests
{
    private readonly CreateAirConditionerDtoValidator _validator = new();

    [Fact]
    public void Valid_Dto_Passes()
    {
        var result = _validator.Validate(new CreateAirConditionerDto
        {
            Name = "Daikin FTXM35R",
            Brand = "Daikin",
            Model = "FTXM35R",
            Kilowatts = 3
        });

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Empty_Name_Fails()
    {
        var result = _validator.Validate(new CreateAirConditionerDto
        {
            Name = "",
            Brand = "Daikin"
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateAirConditionerDto.Name));
    }

    [Fact]
    public void Kilowatts_OutOfRange_Fails()
    {
        var result = _validator.Validate(new CreateAirConditionerDto
        {
            Name = "Mega Cooler",
            Kilowatts = 101 // exceeds max
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateAirConditionerDto.Kilowatts));
    }
}

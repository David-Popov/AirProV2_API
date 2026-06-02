using API.DTOs;
using API.Validators.Companies;

namespace API.Tests.Validators.Companies;

public class UpdateSubscriptionDtoValidatorTests
{
    private readonly UpdateSubscriptionDtoValidator _validator = new();

    [Theory]
    [InlineData("Free")]
    [InlineData("Premium")]
    [InlineData("FreeTrial")]
    public void Valid_Plans_Pass(string plan)
    {
        _validator.Validate(new UpdateSubscriptionDto
        {
            SubscriptionPlan = plan,
            IsSubscriptionActive = true
        }).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Unknown_Plan_Fails()
    {
        var result = _validator.Validate(new UpdateSubscriptionDto
        {
            SubscriptionPlan = "Platinum",
            IsSubscriptionActive = true
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateSubscriptionDto.SubscriptionPlan));
    }
}

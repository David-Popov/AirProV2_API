using API.DTOs;
using API.Validators.Companies;

namespace API.Tests.Validators.Companies;

public class UpdateSubscriptionDtoValidatorTests
{
    private readonly UpdateSubscriptionDtoValidator _validator = new();

    [Theory]
    [InlineData("Free")]
    [InlineData("Premium")]
    public void AdminSelectable_Plans_Pass(string plan)
    {
        _validator.Validate(new UpdateSubscriptionDto
        {
            SubscriptionPlan = plan,
            IsSubscriptionActive = true
        }).IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("FreeTrial")]
    [InlineData("Platinum")]
    [InlineData("")]
    public void NonSelectable_Or_Unknown_Plans_Fail(string plan)
    {
        var result = _validator.Validate(new UpdateSubscriptionDto
        {
            SubscriptionPlan = plan,
            IsSubscriptionActive = true
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateSubscriptionDto.SubscriptionPlan));
    }

    [Theory]
    [InlineData("Trial")]
    [InlineData("Active")]
    [InlineData("Expired")]
    [InlineData("Cancelled")]
    [InlineData("Suspended")]
    [InlineData(null)]
    public void Valid_Or_Absent_Statuses_Pass(string? status)
    {
        _validator.Validate(new UpdateSubscriptionDto
        {
            SubscriptionPlan = "Free",
            SubscriptionStatus = status,
            IsSubscriptionActive = true
        }).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Unknown_Status_Fails()
    {
        var result = _validator.Validate(new UpdateSubscriptionDto
        {
            SubscriptionPlan = "Free",
            SubscriptionStatus = "Frozen",
            IsSubscriptionActive = true
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateSubscriptionDto.SubscriptionStatus));
    }
}

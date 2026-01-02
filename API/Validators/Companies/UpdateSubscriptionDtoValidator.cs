using API.DTOs;
using API.Models;
using FluentValidation;

namespace API.Validators.Companies;

public class UpdateSubscriptionDtoValidator : AbstractValidator<UpdateSubscriptionDto>
{
    public UpdateSubscriptionDtoValidator()
    {
        RuleFor(x => x.SubscriptionPlan)
            .NotEmpty().WithMessage("Subscription plan is required")
            .Must(BeValidSubscriptionPlan).WithMessage("Invalid subscription plan");
    }

    private bool BeValidSubscriptionPlan(string subscriptionPlan)
    {
        return Enum.TryParse<SubscriptionPlan>(subscriptionPlan, out _);
    }
}
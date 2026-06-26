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
            .Must(BeAdminSelectablePlan).WithMessage("Plan must be either 'Free' or 'Premium'");

        RuleFor(x => x.SubscriptionStatus)
            .Must(BeValidSubscriptionStatus).WithMessage("Invalid subscription status")
            .When(x => !string.IsNullOrWhiteSpace(x.SubscriptionStatus));
    }

    private bool BeAdminSelectablePlan(string subscriptionPlan)
    {
        return Enum.TryParse<SubscriptionPlan>(subscriptionPlan, ignoreCase: true, out var plan)
            && plan is SubscriptionPlan.Free or SubscriptionPlan.Premium;
    }

    private bool BeValidSubscriptionStatus(string? subscriptionStatus)
    {
        return Enum.TryParse<SubscriptionStatus>(subscriptionStatus, ignoreCase: true, out _);
    }
}
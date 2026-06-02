using API.DTOs;
using API.Models;
using FluentValidation;

namespace API.Validators.Companies;

public class CreateCompanyDtoValidator : AbstractValidator<CreateCompanyDto>
{
    public CreateCompanyDtoValidator()
    {
        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Company name is required")
            .MaximumLength(60).WithMessage("Company name cannot exceed 60 characters");

        RuleFor(x => x.CompanyType)
            .NotEmpty().WithMessage("Company type is required")
            .Must(BeValidCompanyType).WithMessage("Invalid company type");

        RuleFor(x => x.Bulstat)
            .Length(9, 13).When(x => !string.IsNullOrEmpty(x.Bulstat))
            .WithMessage("BULSTAT must be between 9 and 13 characters");

        RuleFor(x => x.VatNumber)
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.VatNumber))
            .WithMessage("VAT number cannot exceed 50 characters");

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Invalid email format")
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Email cannot exceed 50 characters");

        RuleFor(x => x.Phone)
            .MaximumLength(20).When(x => !string.IsNullOrEmpty(x.Phone))
            .WithMessage("Phone cannot exceed 20 characters");

        RuleFor(x => x.Address)
            .MaximumLength(80).When(x => !string.IsNullOrEmpty(x.Address))
            .WithMessage("Address cannot exceed 80 characters");

        RuleFor(x => x.City)
            .MaximumLength(30).When(x => !string.IsNullOrEmpty(x.City))
            .WithMessage("City cannot exceed 30 characters");

        RuleFor(x => x.PostalCode)
            .MaximumLength(15).When(x => !string.IsNullOrEmpty(x.PostalCode))
            .WithMessage("Postal code cannot exceed 15 characters");

        RuleFor(x => x.SubscriptionPlan)
            .Must(BeValidSubscriptionPlan).When(x => !string.IsNullOrEmpty(x.SubscriptionPlan))
            .WithMessage("Invalid subscription plan");
    }

    private bool BeValidCompanyType(string companyType)
    {
        return Enum.TryParse<CompanyType>(companyType, out _);
    }

    private bool BeValidSubscriptionPlan(string? subscriptionPlan)
    {
        return Enum.TryParse<SubscriptionPlan>(subscriptionPlan, out _);
    }
}
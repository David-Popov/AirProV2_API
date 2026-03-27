using API.DTOs;
using API.Models;
using FluentValidation;

namespace API.Validators.Auth;

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        // User validation
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(50).WithMessage("Email cannot exceed 50 characters");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters")
            .MaximumLength(100).WithMessage("Password cannot exceed 100 characters")
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit");

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage("Confirm password is required")
            .Equal(x => x.Password).WithMessage("Passwords do not match");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MinimumLength(2).WithMessage("First name must be at least 2 characters")
            .MaximumLength(60).WithMessage("First name cannot exceed 60 characters");

        RuleFor(x => x.MiddleName)
            .MaximumLength(60).When(x => !string.IsNullOrEmpty(x.MiddleName))
            .WithMessage("Middle name cannot exceed 60 characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MinimumLength(2).WithMessage("Last name must be at least 2 characters")
            .MaximumLength(60).WithMessage("Last name cannot exceed 60 characters");

        RuleFor(x => x.PhoneNumber)
            .Matches(@"^(\+359|0)\d{8,9}$").When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("Invalid Bulgarian phone number format (e.g. +359888123456 or 0888123456)");

        RuleFor(x => x.Address)
            .MaximumLength(80).When(x => !string.IsNullOrEmpty(x.Address))
            .WithMessage("Address cannot exceed 80 characters");

        // Company validation
        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Company name is required")
            .MinimumLength(3).WithMessage("Company name must be at least 3 characters")
            .MaximumLength(60).WithMessage("Company name cannot exceed 60 characters");

        RuleFor(x => x.CompanyType)
            .NotEmpty().WithMessage("Company type is required")
            .Must(BeValidCompanyType).WithMessage("Invalid company type. Valid values are: SoleProprietorship, LLC, LTD, JSC, Partnership, LimitedPartnership, Cooperative, Other");

        RuleFor(x => x.Bulstat)
            .Matches(@"^\d{9}(\d{4})?$").When(x => !string.IsNullOrEmpty(x.Bulstat))
            .WithMessage("Bulstat must be 9 or 13 digits");

        RuleFor(x => x.VatNumber)
            .Matches(@"^BG\d{9,10}$").When(x => !string.IsNullOrEmpty(x.VatNumber))
            .WithMessage("VAT number must start with BG followed by 9-10 digits");

        RuleFor(x => x.CompanyAddress)
            .MaximumLength(80).When(x => !string.IsNullOrEmpty(x.CompanyAddress))
            .WithMessage("Company address cannot exceed 80 characters");

        RuleFor(x => x.CompanyCity)
            .MaximumLength(30).When(x => !string.IsNullOrEmpty(x.CompanyCity))
            .WithMessage("Company city cannot exceed 30 characters");

        RuleFor(x => x.CompanyPostalCode)
            .Matches(@"^\d{4}$").When(x => !string.IsNullOrEmpty(x.CompanyPostalCode))
            .WithMessage("Postal code must be exactly 4 digits");

        RuleFor(x => x.CompanyPhone)
            .Matches(@"^(\+359|0)\d{8,9}$").When(x => !string.IsNullOrEmpty(x.CompanyPhone))
            .WithMessage("Invalid Bulgarian phone number format (e.g. +359888123456 or 0888123456)");

        RuleFor(x => x.CompanyEmail)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.CompanyEmail))
            .WithMessage("Invalid company email format")
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.CompanyEmail))
            .WithMessage("Company email cannot exceed 50 characters");

        RuleFor(x => x.WarrantyDefaultMonths)
            .GreaterThanOrEqualTo(0).When(x => x.WarrantyDefaultMonths.HasValue)
            .WithMessage("Warranty default months must be greater than or equal to 0")
            .LessThanOrEqualTo(120).When(x => x.WarrantyDefaultMonths.HasValue)
            .WithMessage("Warranty default months cannot exceed 120");
    }

    private static bool BeValidCompanyType(string companyType)
    {
        return Enum.TryParse<CompanyType>(companyType, true, out _);
    }
}

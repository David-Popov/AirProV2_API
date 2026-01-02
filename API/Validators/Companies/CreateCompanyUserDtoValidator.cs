using API.DTOs;
using FluentValidation;

namespace API.Validators.Companies;

public class CreateCompanyUserDtoValidator : AbstractValidator<CreateCompanyUserDto>
{
    public CreateCompanyUserDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one digit")
            .Matches(@"[\W_]").WithMessage("Password must contain at least one special character");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(60).WithMessage("First name cannot exceed 60 characters");

        RuleFor(x => x.MiddleName)
            .MaximumLength(60).When(x => !string.IsNullOrEmpty(x.MiddleName))
            .WithMessage("Middle name cannot exceed 60 characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(60).WithMessage("Last name cannot exceed 60 characters");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("Phone number cannot exceed 20 characters");

        RuleFor(x => x.Address)
            .MaximumLength(80).When(x => !string.IsNullOrEmpty(x.Address))
            .WithMessage("Address cannot exceed 80 characters");
    }
}
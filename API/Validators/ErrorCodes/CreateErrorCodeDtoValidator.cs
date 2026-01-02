using API.DTOs;
using FluentValidation;

namespace API.Validators.ErrorCodes;

public class CreateErrorCodeDtoValidator : AbstractValidator<CreateErrorCodeDto>
{
    public CreateErrorCodeDtoValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Error code is required");

        RuleFor(x => x.ErrorName)
            .MaximumLength(200).When(x => !string.IsNullOrEmpty(x.ErrorName))
            .WithMessage("Error name cannot exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description cannot exceed 1000 characters");

        RuleFor(x => x.Solution)
            .MaximumLength(1000).When(x => !string.IsNullOrEmpty(x.Solution))
            .WithMessage("Solution cannot exceed 1000 characters");

        RuleFor(x => x.Severity)
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.Severity))
            .WithMessage("Severity cannot exceed 50 characters");
    }
}
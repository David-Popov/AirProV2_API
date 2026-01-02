using API.DTOs;
using FluentValidation;

namespace API.Validators.AirConditioners;

public class CreateAirConditionerDtoValidator : AbstractValidator<CreateAirConditionerDto>
{
    public CreateAirConditionerDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Name cannot exceed 200 characters");

        RuleFor(x => x.Brand)
            .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Brand))
            .WithMessage("Brand cannot exceed 100 characters");

        RuleFor(x => x.Model)
            .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Model))
            .WithMessage("Model cannot exceed 100 characters");

        RuleFor(x => x.Kilowatts)
            .GreaterThan(0).When(x => x.Kilowatts.HasValue)
            .LessThanOrEqualTo(100).When(x => x.Kilowatts.HasValue)
            .WithMessage("Kilowatts must be between 1 and 100");

        RuleFor(x => x.Description)
            .MaximumLength(1000).When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description cannot exceed 1000 characters");

        RuleFor(x => x.Price)
            .GreaterThan(0).When(x => x.Price.HasValue)
            .LessThanOrEqualTo(999999.99m).When(x => x.Price.HasValue)
            .WithMessage("Price must be between 0.01 and 999999.99");

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.ImageUrl))
            .WithMessage("Image URL cannot exceed 500 characters");
    }
}
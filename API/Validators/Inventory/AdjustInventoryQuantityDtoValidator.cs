using API.DTOs;
using FluentValidation;

namespace API.Validators.Inventory;

public class AdjustInventoryQuantityDtoValidator : AbstractValidator<AdjustInventoryQuantityDto>
{
    public AdjustInventoryQuantityDtoValidator()
    {
        RuleFor(x => x.AdjustmentAmount)
            .NotEqual(0).WithMessage("Adjustment amount cannot be zero");

        RuleFor(x => x.Reason)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.Reason))
            .WithMessage("Reason cannot exceed 500 characters");
    }
}

using API.DTOs;
using API.Models;
using FluentValidation;

namespace API.Validators.Inventory;

public class UpdateInventoryItemDtoValidator : AbstractValidator<UpdateInventoryItemDto>
{
    public UpdateInventoryItemDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MinimumLength(3).WithMessage("Name must be at least 3 characters")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description cannot exceed 500 characters");

        RuleFor(x => x.Sku)
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.Sku))
            .WithMessage("SKU cannot exceed 50 characters");

        RuleFor(x => x.Quantity)
            .GreaterThanOrEqualTo(0).WithMessage("Quantity must be greater than or equal to 0");

        RuleFor(x => x.UnitOfMeasure)
            .NotEmpty().WithMessage("Unit of measure is required")
            .Must(BeValidUnitOfMeasure).WithMessage("Invalid unit of measure. Valid values are: Pieces, Meters, Centimeters, Kilograms, Grams, Liters, Milliliters, Rolls, Boxes, Sets");

        RuleFor(x => x.MinQuantity)
            .GreaterThanOrEqualTo(0).When(x => x.MinQuantity.HasValue)
            .WithMessage("Minimum quantity must be greater than or equal to 0");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0).When(x => x.UnitPrice.HasValue)
            .WithMessage("Unit price must be greater than or equal to 0");

        RuleFor(x => x.Supplier)
            .MaximumLength(150).When(x => !string.IsNullOrEmpty(x.Supplier))
            .WithMessage("Supplier cannot exceed 150 characters");

        RuleFor(x => x.Location)
            .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Location))
            .WithMessage("Location cannot exceed 100 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.Notes))
            .WithMessage("Notes cannot exceed 500 characters");
    }

    private static bool BeValidUnitOfMeasure(string unitOfMeasure)
    {
        return Enum.TryParse<UnitOfMeasure>(unitOfMeasure, true, out _);
    }
}

using API.DTOs;
using FluentValidation;

namespace API.Validators.Montages;

public class UpdateMontageDtoValidator : AbstractValidator<UpdateMontageDto>
{
    public UpdateMontageDtoValidator()
    {
        RuleFor(x => x.ClientName)
            .NotEmpty().WithMessage("Client name is required")
            .MaximumLength(200).WithMessage("Client name cannot exceed 200 characters");

        RuleFor(x => x.ClientPhone)
            .MaximumLength(20).When(x => !string.IsNullOrEmpty(x.ClientPhone))
            .WithMessage("Client phone cannot exceed 20 characters");

        RuleFor(x => x.ClientEmail)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.ClientEmail))
            .WithMessage("Invalid email format")
            .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.ClientEmail))
            .WithMessage("Client email cannot exceed 100 characters");

        RuleFor(x => x.ClientAddress)
            .MaximumLength(200).When(x => !string.IsNullOrEmpty(x.ClientAddress))
            .WithMessage("Client address cannot exceed 200 characters");

        RuleFor(x => x.ClientCity)
            .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.ClientCity))
            .WithMessage("Client city cannot exceed 100 characters");

        RuleFor(x => x.InstallationDate)
            .NotEmpty().WithMessage("Installation date is required");

        RuleFor(x => x.Status)
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.Status))
            .WithMessage("Status cannot exceed 50 characters");

        RuleFor(x => x.IndoorUnitSerial)
            .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.IndoorUnitSerial))
            .WithMessage("Indoor unit serial cannot exceed 100 characters");

        RuleFor(x => x.OutdoorUnitSerial)
            .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.OutdoorUnitSerial))
            .WithMessage("Outdoor unit serial cannot exceed 100 characters");

        RuleFor(x => x.TotalPrice)
            .GreaterThanOrEqualTo(0).When(x => x.TotalPrice.HasValue)
            .WithMessage("Total price must be greater than or equal to 0");

        RuleFor(x => x.PaidAmount)
            .GreaterThanOrEqualTo(0).When(x => x.PaidAmount.HasValue)
            .WithMessage("Paid amount must be greater than or equal to 0")
            .LessThanOrEqualTo(x => x.TotalPrice ?? 0).When(x => x.PaidAmount.HasValue && x.TotalPrice.HasValue)
            .WithMessage("Paid amount cannot exceed total price");

        RuleFor(x => x.PaymentStatus)
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.PaymentStatus))
            .WithMessage("Payment status cannot exceed 50 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).When(x => !string.IsNullOrEmpty(x.Notes))
            .WithMessage("Notes cannot exceed 1000 characters");
    }
}
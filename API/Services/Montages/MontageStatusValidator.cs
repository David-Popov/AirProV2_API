namespace API.Services.Montages;

public class MontageStatusValidator
{
    public static ValidationResult CanSetStatusToCompleted(Data.Entities.Montage montage)
    {
        var errors = new List<string>();

        if (montage.PaymentStatus != Models.MontagePaymentStatus.Paid)
        {
            errors.Add("Montage cannot be completed: Payment is not fully paid");
        }
        
        if (montage.PaidAmount < montage.TotalPrice)
        {
            errors.Add($"Montage cannot be completed: Paid amount ({montage.PaidAmount}) is less than total price ({montage.TotalPrice})");
        }

        if (string.IsNullOrWhiteSpace(montage.IndoorUnitSerial))
        {
            errors.Add("Montage cannot be completed: Indoor unit serial number is required");
        }
        
        if (string.IsNullOrWhiteSpace(montage.OutdoorUnitSerial))
        {
            errors.Add("Montage cannot be completed: Outdoor unit serial number is required");
        }
        
        return new ValidationResult
        {
            IsValid = errors.Count == 0,
            Errors = errors
        };
    }
}

public class ValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
}

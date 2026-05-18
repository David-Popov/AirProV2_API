namespace API.DTOs.Stripe;

public class SubscriptionStatusDto
{
    public string Plan { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? CurrentPeriodEnd { get; set; }
    public DateTime? TrialEndDate { get; set; }
    public bool HasStripeSubscription { get; set; }
}

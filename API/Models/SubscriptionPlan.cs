namespace API.Models;

public enum SubscriptionPlan
{
    FreeTrial,
    Basic,
    Premium,
    Enterprise
}

public enum SubscriptionStatus
{
    Trial,      // User is on free trial
    Active,     // User has paid and subscription is active
    Expired,    // Trial or subscription has expired
    Cancelled,  // User cancelled their subscription
    Suspended   // Subscription suspended (e.g., payment issue)
}
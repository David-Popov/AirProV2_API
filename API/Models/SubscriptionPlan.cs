namespace API.Models;

public enum SubscriptionPlan
{
    FreeTrial = 0,    // 6-month trial - unlimited employees
    Premium = 2,      // Paid plan - unlimited employees
    Free = 10         // Free plan - 2 employees limit, no time limit
}

public enum SubscriptionStatus
{
    Trial,      // User is on free trial
    Active,     // User has paid and subscription is active
    Expired,    // Trial or subscription has expired
    Cancelled,  // User cancelled their subscription
    Suspended   // Subscription suspended (e.g., payment issue)
}
namespace API.Models;

/// <summary>
/// Defines subscription limits for different plans
/// IMPORTANT: Employee limits only apply to "User" role, NOT "Manager" role!
/// </summary>
public static class SubscriptionLimits
{
    /// <summary>
    /// Gets the maximum number of employees (User role only) allowed for a subscription plan
    /// </summary>
    public static int GetMaxEmployees(SubscriptionPlan plan)
    {
        return plan switch
        {
            SubscriptionPlan.Free => 2,              // Free plan: 2 employees max
            SubscriptionPlan.FreeTrial => 999,       // Trial: unlimited employees
            SubscriptionPlan.Premium => 999,         // Premium: unlimited employees
            _ => 0
        };
    }
}

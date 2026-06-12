namespace API.DTOs.Admin;

/// <summary>
/// Filter parameters for listing companies in admin panel
/// </summary>
public class AdminCompanyFilterDto
{
    public string? Name { get; set; }
    public string? OwnerEmail { get; set; }
    public string? OwnerPhone { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsDeleted { get; set; }
    public string? SubscriptionStatus { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Company response DTO for admin panel
/// </summary>
public class AdminCompanyDto
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string CompanyType { get; set; } = string.Empty;
    public string? Bulstat { get; set; }
    public string? VatNumber { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool? IsActive { get; set; }
    public bool IsDeleted { get; set; }

    public string? OwnerName { get; set; }
    public string? OwnerEmail { get; set; }
    public string? OwnerPhone { get; set; }

    public string SubscriptionPlan { get; set; } = string.Empty;
    public string SubscriptionStatus { get; set; } = string.Empty;
    public DateTime? TrialEndDate { get; set; }
    public DateTime? SubscriptionCurrentPeriodEnd { get; set; }
    public bool? IsSubscriptionActive { get; set; }

    public int UserCount { get; set; }
    public int MontageCount { get; set; }
    
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for updating company subscription
/// </summary>
public class AdminUpdateSubscriptionDto
{
    public string SubscriptionPlan { get; set; } = string.Empty;
    public string SubscriptionStatus { get; set; } = string.Empty;
    public DateTime? TrialEndDate { get; set; }
    public DateTime? SubscriptionCurrentPeriodEnd { get; set; }
    public bool? IsSubscriptionActive { get; set; }
}

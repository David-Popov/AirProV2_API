using API.Models;

namespace API.DTOs.Admin;

/// <summary>
/// Filter parameters for listing montages in admin panel
/// </summary>
public class AdminMontageFilterDto
{
    public string? ClientName { get; set; }
    public string? ClientAddress { get; set; }
    public string? ClientPhone { get; set; }
    public string? UserName { get; set; }
    public Guid? CompanyId { get; set; }
    public MontageStatus? Status { get; set; }
    public MontagePaymentStatus? PaymentStatus { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Montage response DTO for admin panel
/// </summary>
public class AdminMontageDto
{
    public Guid Id { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }
    public string? ClientEmail { get; set; }
    public string? ClientAddress { get; set; }
    public string? ClientCity { get; set; }
    public DateOnly InstallationDate { get; set; }
    public DateOnly? CompletionDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public decimal? TotalPrice { get; set; }
    public decimal? PaidAmount { get; set; }
    public string? Notes { get; set; }
    
    // User info
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    
    // Company info
    public Guid? CompanyId { get; set; }
    public string? CompanyName { get; set; }
    
    // AC info
    public Guid? AirConditionerId { get; set; }
    public string? AirConditionerBrand { get; set; }
    public string? AirConditionerModel { get; set; }
    
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating/updating montage from admin panel
/// </summary>
public class AdminCreateMontageDto
{
    public Guid? CompanyId { get; set; }
    public string? UserId { get; set; }
    public Guid? AirConditionerId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }
    public string? ClientEmail { get; set; }
    public string? ClientAddress { get; set; }
    public string? ClientCity { get; set; }
    public DateOnly InstallationDate { get; set; }
    public DateOnly? CompletionDate { get; set; }
    public MontageStatus Status { get; set; } = MontageStatus.Planned;
    public MontagePaymentStatus PaymentStatus { get; set; } = MontagePaymentStatus.NotPaid;
    public decimal? TotalPrice { get; set; }
    public decimal? PaidAmount { get; set; }
    public string? Notes { get; set; }
    public string? IndoorUnitSerial { get; set; }
    public string? OutdoorUnitSerial { get; set; }
}

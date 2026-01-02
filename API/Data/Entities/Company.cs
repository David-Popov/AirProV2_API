using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Models;

namespace API.Data.Entities;

[Table("companies")]
public class Company
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("company_name")]
    [MaxLength(60)]
    public string CompanyName { get; set; } = string.Empty;

    [Column("company_type")]
    public CompanyType CompanyType { get; set; } = CompanyType.SoleProprietorship;

    [Column("bulstat")]
    [MaxLength(50)]
    public string? Bulstat { get; set; }

    [Column("vat_number")]
    [MaxLength(50)]
    public string? VatNumber { get; set; }

    [Column("is_vat_registered")]
    public bool? IsVatRegistered { get; set; } = false;

    [Column("address")]
    [MaxLength(80)]
    public string? Address { get; set; }

    [Column("city")]
    [MaxLength(30)]
    public string? City { get; set; }

    [Column("postal_code")]
    [MaxLength(15)]
    public string? PostalCode { get; set; }

    [Column("phone")]
    [MaxLength(20)]
    public string? Phone { get; set; }

    [Column("email")]
    [MaxLength(50)]
    public string? Email { get; set; }

    [Column("is_company_owner")]
    public bool IsCompanyOwner { get; set; }

    [Column("warranty_default_months")]
    public int? WarrantyDefaultMonths { get; set; } = 12;

    [Column("subscription_plan")]
    public SubscriptionPlan SubscriptionPlan { get; set; } = SubscriptionPlan.FreeTrial;

    [Column("subscription_status")]
    public SubscriptionStatus SubscriptionStatus { get; set; } = SubscriptionStatus.Trial;

    [Column("trial_start_date")]
    public DateTime? TrialStartDate { get; set; }

    [Column("trial_end_date")]
    public DateTime? TrialEndDate { get; set; }

    [Column("is_subscription_active")]
    public bool? IsSubscriptionActive { get; set; } = true;

    [Column("is_active")]
    public bool? IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
    public virtual ICollection<Montage> Montages { get; set; } = new List<Montage>();
    public virtual ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
}
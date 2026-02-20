using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Models;
using EntityFrameworkCore.EncryptColumn.Attribute;

namespace API.Data.Entities;

[Table("montages")]
public class Montage
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("company_id")]
    public Guid? CompanyId { get; set; }
    
    [Column("user_id")]
    public string? UserId { get; set; }

    [Column("air_conditioner_id")]
    public Guid? AirConditionerId { get; set; }

    [Column("custom_ac_brand")]
    [MaxLength(200)]
    public string? CustomAcBrand { get; set; }

    [Column("custom_ac_model")]
    [MaxLength(200)]
    public string? CustomAcModel { get; set; }

    [Column("custom_ac_kilowatts", TypeName = "numeric(5, 2)")]
    public decimal? CustomAcKilowatts { get; set; }

    [EncryptColumn]
    [Required]
    [Column("client_name")]
    [MaxLength(200)]
    public string ClientName { get; set; } = string.Empty;

    [EncryptColumn]
    [Column("client_phone")]
    [MaxLength(150)]
    public string? ClientPhone { get; set; } = string.Empty;

    [EncryptColumn]
    [Column("client_email")]
    [MaxLength(200)]
    public string? ClientEmail { get; set; } = string.Empty;

    [EncryptColumn]
    [Column("client_address")]
    [MaxLength(400)]
    public string? ClientAddress { get; set; } = string.Empty;

    [EncryptColumn]
    [Column("client_city")]
    [MaxLength(200)]
    public string? ClientCity { get; set; } = string.Empty;

    [Required]
    [Column("installation_date")]
    public DateOnly InstallationDate { get; set; }

    [Column("completion_date")]
    public DateOnly? CompletionDate { get; set; }

    [Column("status")]
    [MaxLength(150)]
    public MontageStatus Status { get; set; } = MontageStatus.Planned;

    [Column("indoor_unit_serial")]
    [MaxLength(150)]
    public string? IndoorUnitSerial { get; set; } = string.Empty;

    [Column("outdoor_unit_serial")]
    [MaxLength(150)]
    public string? OutdoorUnitSerial { get; set; } = string.Empty;

    [Column("total_price", TypeName = "numeric(10, 2)")]
    public decimal? TotalPrice { get; set; }

    [Column("paid_amount", TypeName = "numeric(10, 2)")]
    public decimal? PaidAmount { get; set; } = 0;

    [Column("payment_status")]
    [MaxLength(20)]
    public MontagePaymentStatus PaymentStatus { get; set; } = MontagePaymentStatus.NotPaid;

    [Column("notes")]
    [MaxLength(500)]
    public string? Notes { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey("CompanyId")]
    public virtual Company? Company { get; set; }
    
    [ForeignKey("UserId")]
    public virtual ApplicationUser? User { get; set; }

    [ForeignKey("AirConditionerId")]
    public virtual AirConditioner? AirConditioner { get; set; }

    /// <summary>
    /// Materials used in this montage installation
    /// </summary>
    public virtual ICollection<MontageInventoryItem> UsedMaterials { get; set; } = new List<MontageInventoryItem>();
    
    /// <summary>
    /// Photos attached to this montage (max 5)
    /// </summary>
    public virtual ICollection<MontagePhoto> Photos { get; set; } = new List<MontagePhoto>();
}
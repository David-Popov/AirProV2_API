using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Data.Entities;

/// <summary>
/// Tracks all changes made to inventory items for audit purposes
/// </summary>
[Table("inventory_audit_logs")]
public class InventoryAuditLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("company_id")]
    public Guid CompanyId { get; set; }

    [Required]
    [Column("inventory_item_id")]
    public Guid InventoryItemId { get; set; }

    /// <summary>
    /// Type of action performed: Created, Updated, QuantityAdjusted, UsedInMontage, Archived, Restored, Deleted
    /// </summary>
    [Required]
    [Column("action")]
    [MaxLength(50)]
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// User who performed the action
    /// </summary>
    [Column("user_id")]
    public string? UserId { get; set; }

    /// <summary>
    /// Quantity before the change
    /// </summary>
    [Column("quantity_before", TypeName = "numeric(10, 2)")]
    public decimal? QuantityBefore { get; set; }

    /// <summary>
    /// Quantity after the change
    /// </summary>
    [Column("quantity_after", TypeName = "numeric(10, 2)")]
    public decimal? QuantityAfter { get; set; }

    /// <summary>
    /// Amount of quantity changed (positive or negative)
    /// </summary>
    [Column("quantity_changed", TypeName = "numeric(10, 2)")]
    public decimal? QuantityChanged { get; set; }

    /// <summary>
    /// Reason for the change (optional)
    /// </summary>
    [Column("reason")]
    [MaxLength(500)]
    public string? Reason { get; set; }

    /// <summary>
    /// Related montage ID if action is UsedInMontage
    /// </summary>
    [Column("related_montage_id")]
    public Guid? RelatedMontageId { get; set; }

    /// <summary>
    /// Additional details in JSON format
    /// </summary>
    [Column("details")]
    public string? Details { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("CompanyId")]
    public virtual Company? Company { get; set; }

    [ForeignKey("InventoryItemId")]
    public virtual InventoryItem? InventoryItem { get; set; }

    [ForeignKey("UserId")]
    public virtual ApplicationUser? User { get; set; }

    [ForeignKey("RelatedMontageId")]
    public virtual Montage? RelatedMontage { get; set; }
}

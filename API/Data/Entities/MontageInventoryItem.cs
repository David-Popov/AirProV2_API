using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Data.Entities;

/// <summary>
/// Links a Montage to InventoryItems used during installation.
/// Tracks quantity used and price at time of usage for historical accuracy.
/// </summary>
[Table("montage_inventory_items")]
public class MontageInventoryItem
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("montage_id")]
    public Guid MontageId { get; set; }

    [Required]
    [Column("inventory_item_id")]
    public Guid InventoryItemId { get; set; }

    /// <summary>
    /// Quantity of the item used in this montage
    /// </summary>
    [Required]
    [Column("quantity_used", TypeName = "numeric(10, 2)")]
    public decimal QuantityUsed { get; set; }

    /// <summary>
    /// Price per unit at the time of usage (for historical tracking)
    /// </summary>
    [Column("unit_price_at_time", TypeName = "numeric(10, 2)")]
    public decimal? UnitPriceAtTime { get; set; }

    [Column("notes")]
    [MaxLength(500)]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("MontageId")]
    public virtual Montage? Montage { get; set; }

    [ForeignKey("InventoryItemId")]
    public virtual InventoryItem? InventoryItem { get; set; }
}

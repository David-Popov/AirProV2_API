using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Models;

namespace API.Data.Entities;

[Table("inventory_items")]
public class InventoryItem
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("company_id")]
    public Guid CompanyId { get; set; }

    [Required]
    [Column("name")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    [MaxLength(500)]
    public string? Description { get; set; }

    [Column("sku")]
    [MaxLength(50)]
    public string? Sku { get; set; }

    [Required]
    [Column("quantity", TypeName = "numeric(10, 2)")]
    public decimal Quantity { get; set; } = 0;

    [Required]
    [Column("unit_of_measure")]
    public UnitOfMeasure UnitOfMeasure { get; set; } = UnitOfMeasure.Pieces;

    [Column("min_quantity", TypeName = "numeric(10, 2)")]
    public decimal? MinQuantity { get; set; }

    [Column("unit_price", TypeName = "numeric(10, 2)")]
    public decimal? UnitPrice { get; set; }

    [Column("supplier")]
    [MaxLength(150)]
    public string? Supplier { get; set; }

    [Column("location")]
    [MaxLength(100)]
    public string? Location { get; set; }

    [Column("notes")]
    [MaxLength(500)]
    public string? Notes { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey("CompanyId")]
    public virtual Company? Company { get; set; }

    /// <summary>
    /// Montages where this inventory item was used
    /// </summary>
    public virtual ICollection<MontageInventoryItem> MontageUsages { get; set; } = new List<MontageInventoryItem>();
}

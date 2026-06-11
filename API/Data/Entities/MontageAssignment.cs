using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Data.Entities;

/// <summary>
/// Links a Montage to the workers assigned to it (many-to-many).
/// A montage is usually carried out by two or more employees on-site;
/// each assigned worker can see and edit the montages they belong to.
/// </summary>
[Table("montage_assignments")]
public class MontageAssignment
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("montage_id")]
    public Guid MontageId { get; set; }

    [Required]
    [Column("user_id")]
    public string UserId { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("MontageId")]
    public virtual Montage? Montage { get; set; }

    [ForeignKey("UserId")]
    public virtual ApplicationUser? User { get; set; }
}

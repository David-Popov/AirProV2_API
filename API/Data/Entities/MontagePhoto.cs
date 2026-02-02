using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Data.Entities;

[Table("montage_photos")]
public class MontagePhoto
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [Column("montage_id")]
    public Guid MontageId { get; set; }
    
    [Required]
    [Column("file_name")]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    [Column("original_file_name")]
    [MaxLength(255)]
    public string OriginalFileName { get; set; } = string.Empty;
    
    [Required]
    [Column("content_type")]
    [MaxLength(100)]
    public string ContentType { get; set; } = string.Empty;
    
    [Column("file_size")]
    public long FileSize { get; set; }
    
    [Column("object_name")]
    [MaxLength(500)]
    public string ObjectName { get; set; } = string.Empty;
    
    [Column("description")]
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Column("display_order")]
    public int DisplayOrder { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [ForeignKey("MontageId")]
    public virtual Montage Montage { get; set; } = null!;
}

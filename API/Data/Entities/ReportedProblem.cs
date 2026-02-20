using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Models;

namespace API.Data.Entities;

[Table("reported_problems")]
public class ReportedProblem
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("user_id")]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [Column("category")]
    public ProblemCategory Category { get; set; }

    [Required]
    [Column("description")]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Column("screenshot_file_name")]
    [MaxLength(255)]
    public string? ScreenshotFileName { get; set; }

    [Column("screenshot_object_name")]
    [MaxLength(500)]
    public string? ScreenshotObjectName { get; set; }

    [Column("screenshot_content_type")]
    [MaxLength(100)]
    public string? ScreenshotContentType { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("UserId")]
    public virtual ApplicationUser User { get; set; } = null!;
}

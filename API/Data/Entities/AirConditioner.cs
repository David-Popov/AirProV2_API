using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Data.Entities;

[Table("air_conditioners")]
public class AirConditioner
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("brand")]
    public string? Brand { get; set; }

    [Column("model")]
    public string? Model { get; set; }

    [Column("kilowatts")]
    public int? Kilowatts { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("price", TypeName = "numeric(10, 2)")]
    public decimal? Price { get; set; }

    [Column("image_url")]
    public string? ImageUrl { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }
    
    public ICollection<ErrorCode> ErrorCodes { get; set; } = new HashSet<ErrorCode>();
}
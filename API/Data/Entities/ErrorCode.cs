using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Data.Entities;
using API.Models;


[Table("error_codes")]
public class ErrorCode
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("air_conditioner_id")]
    public Guid? AirConditionerId { get; set; }

    [Required]
    [Column("error_code")]
    public string Code { get; set; } = string.Empty;

    [Column("error_name")]
    public string? ErrorName { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("solution")]
    public string? Solution { get; set; }

    [Column("severity")] 
    public ErrorCodeSeverity ErrorCodeSeverity { get; set; } = ErrorCodeSeverity.Low;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey("AirConditionerId")]
    public virtual AirConditioner? AirConditioner { get; set; }
}

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

    [Column("pipe_size_liquid")]
    public string? PipeSizeLiquid { get; set; }

    [Column("pipe_size_gas")]
    public string? PipeSizeGas { get; set; }

    [Column("refrigerant_type")]
    public string? RefrigerantType { get; set; }

    [Column("factory_refrigerant_charge")]
    public int? FactoryRefrigerantCharge { get; set; }

    [Column("power_supply_location")]
    public string? PowerSupplyLocation { get; set; }

    [Column("cable_section")]
    public string? CableSection { get; set; }

    [Column("recommended_fuse")]
    public int? RecommendedFuse { get; set; }

    [Column("indoor_dimensions")]
    public string? IndoorDimensions { get; set; }

    [Column("outdoor_dimensions")]
    public string? OutdoorDimensions { get; set; }

    [Column("weight_indoor", TypeName = "decimal(5, 2)")]
    public decimal? WeightIndoor { get; set; }

    [Column("weight_outdoor", TypeName = "decimal(5, 2)")]
    public decimal? WeightOutdoor { get; set; }

    [Column("max_pipe_length")]
    public int? MaxPipeLength { get; set; }

    [Column("max_height_difference")]
    public int? MaxHeightDifference { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }
    
    public ICollection<ErrorCode> ErrorCodes { get; set; } = new HashSet<ErrorCode>();
}
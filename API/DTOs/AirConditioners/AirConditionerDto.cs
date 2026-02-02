using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.DTOs;

public class AirConditionerDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("brand")]
    public string? Brand { get; set; }

    [JsonPropertyName("model")]
    public string? Model { get; set; }

    [JsonPropertyName("kilowatts")]
    public int? Kilowatts { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("price")]
    public decimal? Price { get; set; }

    [JsonPropertyName("pipe_size_liquid")]
    public string? PipeSizeLiquid { get; set; }

    [JsonPropertyName("pipe_size_gas")]
    public string? PipeSizeGas { get; set; }

    [JsonPropertyName("refrigerant_type")]
    public string? RefrigerantType { get; set; }

    [JsonPropertyName("factory_refrigerant_charge")]
    public int? FactoryRefrigerantCharge { get; set; }

    [JsonPropertyName("power_supply_location")]
    public string? PowerSupplyLocation { get; set; }

    [JsonPropertyName("cable_section")]
    public string? CableSection { get; set; }

    [JsonPropertyName("recommended_fuse")]
    public int? RecommendedFuse { get; set; }

    [JsonPropertyName("indoor_dimensions")]
    public string? IndoorDimensions { get; set; }

    [JsonPropertyName("outdoor_dimensions")]
    public string? OutdoorDimensions { get; set; }

    [JsonPropertyName("weight_indoor")]
    public decimal? WeightIndoor { get; set; }

    [JsonPropertyName("weight_outdoor")]
    public decimal? WeightOutdoor { get; set; }

    [JsonPropertyName("max_pipe_length")]
    public int? MaxPipeLength { get; set; }

    [JsonPropertyName("max_height_difference")]
    public int? MaxHeightDifference { get; set; }

    [JsonPropertyName("image_url")]
    public string? ImageUrl { get; set; }

    public HashSet<ErrorCode> ErrorCodes { get; set; } = new HashSet<ErrorCode>();
}
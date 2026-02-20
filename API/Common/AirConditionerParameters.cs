using System.Text.Json.Serialization;

namespace API.Common;

public class AirConditionerParameters : PageParameters
{
    [JsonPropertyName("searchTerm")]
    public string? SearchTerm { get; set; }

    [JsonPropertyName("brand")]
    public string? Brand { get; set; }

    [JsonPropertyName("minPrice")]
    public decimal? MinPrice { get; set; }

    [JsonPropertyName("maxPrice")]
    public decimal? MaxPrice { get; set; }

    [JsonPropertyName("minKilowatts")]
    public double? MinKilowatts { get; set; }

    [JsonPropertyName("maxKilowatts")]
    public double? MaxKilowatts { get; set; }
}

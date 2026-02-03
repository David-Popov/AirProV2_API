using System.Text.Json.Serialization;

namespace API.Common;

public class MontageParameters : PageParameters
{
    [JsonPropertyName("startDate")]
    [Microsoft.AspNetCore.Mvc.FromQuery(Name = "startDate")]
    public DateTime? StartDate { get; set; }

    [JsonPropertyName("endDate")]
    [Microsoft.AspNetCore.Mvc.FromQuery(Name = "endDate")]
    public DateTime? EndDate { get; set; }

    [JsonPropertyName("status")]
    [Microsoft.AspNetCore.Mvc.FromQuery(Name = "status")]
    public string? Status { get; set; }

    [JsonPropertyName("clientName")]
    [Microsoft.AspNetCore.Mvc.FromQuery(Name = "clientName")]
    public string? ClientName { get; set; }

    [JsonPropertyName("clientPhone")]
    [Microsoft.AspNetCore.Mvc.FromQuery(Name = "clientPhone")]
    public string? ClientPhone { get; set; }
}

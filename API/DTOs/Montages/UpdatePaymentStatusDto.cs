using System.Text.Json.Serialization;

namespace API.DTOs;

public class UpdatePaymentStatusDto
{
    [JsonPropertyName("payment_status")]
    public string PaymentStatus { get; set; } = string.Empty;
    
    [JsonPropertyName("paid_amount")]
    public decimal? PaidAmount { get; set; }
}

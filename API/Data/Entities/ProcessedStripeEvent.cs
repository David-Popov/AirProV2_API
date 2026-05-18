using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Data.Entities;

/// <summary>
/// Idempotency record for Stripe webhook events.
/// Stripe delivers webhooks at-least-once; this table dedupes retries.
/// </summary>
public class ProcessedStripeEvent
{
    [Key]
    [Column("event_id")]
    [MaxLength(255)]
    public string EventId { get; set; } = string.Empty;

    [Column("event_type")]
    [MaxLength(100)]
    public string EventType { get; set; } = string.Empty;

    [Column("processed_at")]
    public DateTime ProcessedAt { get; set; }
}

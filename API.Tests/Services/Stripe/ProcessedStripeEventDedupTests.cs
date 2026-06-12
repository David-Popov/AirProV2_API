using API.Data.Entities;
using API.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace API.Tests.Services.Stripe;

/// <summary>
/// These tests pin the data-layer contract that <c>StripeService.HandleWebhookEventAsync</c>
/// relies on for at-least-once delivery deduplication. The service runs:
///
///   if (await _context.ProcessedStripeEvents.AsNoTracking()
///        .AnyAsync(e => e.EventId == stripeEvent.Id)) return;
///   ...
///   _context.ProcessedStripeEvents.Add(new ProcessedStripeEvent { EventId = ... });
///   await _context.SaveChangesAsync();
///   // catches DbUpdateException on concurrent duplicate insert (PostgreSQL 23505).
///
/// The full webhook handler can't be unit-tested directly because Stripe's
/// <c>EventUtility.ConstructEvent</c> verifies an HMAC signature against a real
/// secret — that needs an integration test with the Stripe CLI. These data-layer
/// tests at least guarantee the building blocks behave as expected.
/// </summary>
public class ProcessedStripeEventDedupTests
{
    [Fact]
    public async Task EmptyTable_AnyByEventId_ReturnsFalse()
    {
        await using var db = TestDbContextFactory.Create();

        var exists = await db.ProcessedStripeEvents
            .AsNoTracking()
            .AnyAsync(e => e.EventId == "evt_test_abc");

        exists.Should().BeFalse();
    }

    [Fact]
    public async Task RecordedEvent_AnyByEventId_ReturnsTrue()
    {
        await using var db = TestDbContextFactory.Create();
        db.ProcessedStripeEvents.Add(new ProcessedStripeEvent
        {
            EventId = "evt_test_abc",
            EventType = "checkout.session.completed",
            ProcessedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var exists = await db.ProcessedStripeEvents
            .AsNoTracking()
            .AnyAsync(e => e.EventId == "evt_test_abc");

        exists.Should().BeTrue();
    }

    [Fact]
    public async Task DuplicateEventId_SecondInsert_ThrowsBecauseOfPrimaryKey()
    {
        var dbName = Guid.NewGuid().ToString();
        await using (var db = TestDbContextFactory.Create(dbName))
        {
            db.ProcessedStripeEvents.Add(new ProcessedStripeEvent
            {
                EventId = "evt_test_dup",
                EventType = "x",
                ProcessedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }

        await using var db2 = TestDbContextFactory.Create(dbName);
        db2.ProcessedStripeEvents.Add(new ProcessedStripeEvent
        {
            EventId = "evt_test_dup",
            EventType = "x",
            ProcessedAt = DateTime.UtcNow
        });

        var act = async () => await db2.SaveChangesAsync();

        await act.Should().ThrowAsync<Exception>();
    }
}

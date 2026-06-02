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
        // PK on EventId is the contract the production code relies on for
        // concurrent-duplicate detection (PostgreSQL surfaces it as 23505 and
        // the catch block treats it as a benign no-op). InMemory provider also
        // enforces PK uniqueness — it throws InvalidOperationException at
        // SaveChanges time, but the protection mechanism is the same.
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

        // InMemory throws ArgumentException via the in-memory tracker when a
        // duplicate primary key is added. We only care that *some* exception
        // is thrown — the production catch handles the real database error.
        await act.Should().ThrowAsync<Exception>();
    }
}

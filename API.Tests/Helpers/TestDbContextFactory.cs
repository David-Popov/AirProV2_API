using API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Tests.Helpers;

/// <summary>
/// Builds an <see cref="ApplicationDbContext"/> backed by EF Core's InMemory
/// provider for unit tests. Each call returns an isolated database (unique
/// name) so tests cannot leak state into each other.
///
/// The EncryptColumn library only requires a valid 16-character key at context
/// construction — with InMemory storage, encrypt/decrypt round-trip transparently.
/// </summary>
public static class TestDbContextFactory
{
    /// <summary>Test encryption key. Exactly 16 characters as required by the EncryptColumn library.</summary>
    public const string TestEncryptionKey = "AirProTestKey001";

    public static ApplicationDbContext Create(string? databaseName = null)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["EncryptionSettings:Key"] = TestEncryptionKey
            })
            .Build();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new ApplicationDbContext(options, configuration);
    }
}

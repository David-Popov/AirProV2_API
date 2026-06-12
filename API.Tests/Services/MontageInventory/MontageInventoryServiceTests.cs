using API.Common;
using API.Data.Entities;
using API.DTOs;
using API.Models;
using API.Services.Inventory;
using API.Services.MontageInventory;
using API.Tests.Helpers;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace API.Tests.Services.MontageInventory;

public class MontageInventoryServiceTests
{
    private readonly IInventoryAuditService _audit;

    public MontageInventoryServiceTests()
    {
        _audit = Substitute.For<IInventoryAuditService>();
    }

    private static Montage SeedMontage(Guid? companyId = null) => new()
    {
        Id = Guid.NewGuid(),
        CompanyId = companyId ?? Guid.NewGuid(),
        ClientName = "Petar Petrov",
        InstallationDate = DateOnly.FromDateTime(DateTime.UtcNow),
    };

    private static InventoryItem SeedItem(Guid companyId, decimal qty) => new()
    {
        Id = Guid.NewGuid(),
        CompanyId = companyId,
        Name = "Copper Pipes 6mm",
        Quantity = qty,
        UnitOfMeasure = UnitOfMeasure.Meters,
    };

    [Fact]
    public async Task AddMaterials_SufficientStock_DeductsAndCreatesUsageRecord()
    {
        await using var db = TestDbContextFactory.Create();
        var montage = SeedMontage();
        var item = SeedItem(montage.CompanyId!.Value, qty: 20m);
        db.Montages.Add(montage);
        db.InventoryItems.Add(item);
        await db.SaveChangesAsync();

        var sut = new MontageInventoryService(db, NullLogger<MontageInventoryService>.Instance, _audit);

        var result = await sut.AddMaterialsAsync(montage.Id, new AddMaterialsToMontageRequest
        {
            Materials = new()
            {
                new AddMaterialToMontageRequest
                {
                    InventoryItemId = item.Id,
                    QuantityUsed = 5m,
                    Notes = "main run"
                }
            },
            UserId = "user-1"
        });

        result.Should().HaveCount(1);
        result[0].QuantityUsed.Should().Be(5m);

        var updatedItem = await db.InventoryItems.FindAsync(item.Id);
        updatedItem!.Quantity.Should().Be(15m, "5m should have been deducted from the 20m starting stock");

        var usage = await db.MontageInventoryItems.SingleAsync();
        usage.MontageId.Should().Be(montage.Id);
        usage.QuantityUsed.Should().Be(5m);

        await _audit.Received(1).LogActionAsync(Arg.Is<InventoryAuditLog>(l =>
            l.Action == "UsedInMontage" &&
            l.QuantityChanged == -5m &&
            l.RelatedMontageId == montage.Id));
    }

    [Fact]
    public async Task AddMaterials_InsufficientStock_Throws()
    {
        await using var db = TestDbContextFactory.Create();
        var montage = SeedMontage();
        var item = SeedItem(montage.CompanyId!.Value, qty: 2m);
        db.Montages.Add(montage);
        db.InventoryItems.Add(item);
        await db.SaveChangesAsync();

        var sut = new MontageInventoryService(db, NullLogger<MontageInventoryService>.Instance, _audit);

        var act = async () => await sut.AddMaterialsAsync(montage.Id, new AddMaterialsToMontageRequest
        {
            Materials = new()
            {
                new AddMaterialToMontageRequest { InventoryItemId = item.Id, QuantityUsed = 10m }
            }
        });

        await act.Should().ThrowAsync<ValidationException>().WithMessage("*Insufficient stock*");
    }

    [Fact]
    public async Task AddMaterials_MontageNotFound_Throws()
    {
        await using var db = TestDbContextFactory.Create();
        var sut = new MontageInventoryService(db, NullLogger<MontageInventoryService>.Instance, _audit);

        var act = async () => await sut.AddMaterialsAsync(Guid.NewGuid(), new AddMaterialsToMontageRequest
        {
            Materials = new() { new() { InventoryItemId = Guid.NewGuid(), QuantityUsed = 1m } }
        });

        await act.Should().ThrowAsync<NotFoundException>().WithMessage("Montage not found");
    }

    [Fact]
    public async Task RemoveMaterial_RestoresInventoryQuantity()
    {
        await using var db = TestDbContextFactory.Create();
        var montage = SeedMontage();
        var item = SeedItem(montage.CompanyId!.Value, qty: 10m);
        var usage = new MontageInventoryItem
        {
            Id = Guid.NewGuid(),
            MontageId = montage.Id,
            InventoryItemId = item.Id,
            QuantityUsed = 3m,
        };
        db.Montages.Add(montage);
        db.InventoryItems.Add(item);
        db.MontageInventoryItems.Add(usage);
        await db.SaveChangesAsync();

        var sut = new MontageInventoryService(db, NullLogger<MontageInventoryService>.Instance, _audit);

        await sut.RemoveMaterialAsync(usage.Id);

        var updatedItem = await db.InventoryItems.FindAsync(item.Id);
        updatedItem!.Quantity.Should().Be(13m, "the 3m used in the montage should be restored");
        var stillThere = await db.MontageInventoryItems.FindAsync(usage.Id);
        stillThere.Should().BeNull("the usage record should be removed");
    }

    [Fact]
    public async Task UpdateMaterialQuantity_IncreaseExceedingStock_Throws()
    {
        await using var db = TestDbContextFactory.Create();
        var montage = SeedMontage();
        var item = SeedItem(montage.CompanyId!.Value, qty: 1m);
        var usage = new MontageInventoryItem
        {
            Id = Guid.NewGuid(),
            MontageId = montage.Id,
            InventoryItemId = item.Id,
            QuantityUsed = 2m,
        };
        db.Montages.Add(montage);
        db.InventoryItems.Add(item);
        db.MontageInventoryItems.Add(usage);
        await db.SaveChangesAsync();

        var sut = new MontageInventoryService(db, NullLogger<MontageInventoryService>.Instance, _audit);

        var act = async () => await sut.UpdateMaterialQuantityAsync(usage.Id, 10m);

        await act.Should().ThrowAsync<ValidationException>().WithMessage("*Insufficient stock*");
    }
}

using API.Common;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Models;
using API.Repositories;
using API.Services.Inventory;
using API.Tests.Helpers;
using FluentValidation;
using Microsoft.Extensions.Logging.Abstractions;

namespace API.Tests.Services.Inventory;

public class InventoryServiceAdjustQuantityTests
{
    private readonly IInventoryRepository _repo;
    private readonly IInventoryAuditService _audit;
    private readonly ApplicationDbContext _db;
    private readonly InventoryService _sut;

    public InventoryServiceAdjustQuantityTests()
    {
        _repo  = Substitute.For<IInventoryRepository>();
        _audit = Substitute.For<IInventoryAuditService>();
        _db    = TestDbContextFactory.Create();
        _sut   = new InventoryService(_repo, _db, NullLogger<InventoryService>.Instance, _audit);
    }

    private static InventoryItem SeedItem(decimal startingQty = 10m) => new()
    {
        Id = Guid.NewGuid(),
        CompanyId = Guid.NewGuid(),
        Name = "Copper Pipes 6mm",
        Quantity = startingQty,
        UnitOfMeasure = UnitOfMeasure.Meters,
    };

    [Fact]
    public async Task PositiveAdjustment_AddsToStock()
    {
        var item = SeedItem(startingQty: 10m);
        _repo.GetByIdAsync(item.Id).Returns(item);

        var result = await _sut.AdjustQuantityAsync(item.Id, new AdjustInventoryQuantityDto
        {
            AdjustmentAmount = 5m,
            Reason = "Restocked"
        });

        result.Should().NotBeNull();
        result!.Quantity.Should().Be(15m);
        await _repo.Received(1).UpdateAsync(Arg.Is<InventoryItem>(i => i.Quantity == 15m));
        await _audit.Received(1).LogActionAsync(Arg.Is<InventoryAuditLog>(l =>
            l.Action == "QuantityAdjusted" &&
            l.QuantityBefore == 10m &&
            l.QuantityAfter == 15m &&
            l.QuantityChanged == 5m));
    }

    [Fact]
    public async Task NegativeAdjustment_SubtractsFromStock()
    {
        var item = SeedItem(startingQty: 10m);
        _repo.GetByIdAsync(item.Id).Returns(item);

        var result = await _sut.AdjustQuantityAsync(item.Id, new AdjustInventoryQuantityDto
        {
            AdjustmentAmount = -3m,
            Reason = "Used in montage"
        });

        result!.Quantity.Should().Be(7m);
        await _repo.Received(1).UpdateAsync(Arg.Is<InventoryItem>(i => i.Quantity == 7m));
    }

    [Fact]
    public async Task AdjustmentBelowZero_ThrowsValidationException()
    {
        var item = SeedItem(startingQty: 2m);
        _repo.GetByIdAsync(item.Id).Returns(item);

        var act = async () => await _sut.AdjustQuantityAsync(item.Id, new AdjustInventoryQuantityDto
        {
            AdjustmentAmount = -10m
        });

        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*negative quantity*");
        await _repo.DidNotReceive().UpdateAsync(Arg.Any<InventoryItem>());
        await _audit.DidNotReceive().LogActionAsync(Arg.Any<InventoryAuditLog>());
    }

    [Fact]
    public async Task ItemNotFound_ThrowsNotFoundException()
    {
        var missingId = Guid.NewGuid();
        _repo.GetByIdAsync(missingId).Returns((InventoryItem?)null);

        var act = async () => await _sut.AdjustQuantityAsync(missingId, new AdjustInventoryQuantityDto
        {
            AdjustmentAmount = 1m
        });

        await act.Should().ThrowAsync<NotFoundException>();
        await _repo.DidNotReceive().UpdateAsync(Arg.Any<InventoryItem>());
    }
}

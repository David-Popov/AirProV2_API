using API.Common;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Models;
using API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace API.Services.Montages;

public class MontageService : IMontageService
{
    private readonly IMontageRepository _repository;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MontageService> _logger;

    public MontageService(
        IMontageRepository repository,
        ApplicationDbContext context,
        ILogger<MontageService> logger)
    {
        _repository = repository;
        _context = context;
        _logger = logger;
    }

    public async Task AddMontageAsync(CreateMontageDto dto)
    {
        try
        {
            var montage = new Montage
            {
                CompanyId = dto.CompanyId,
                UserId = dto.UserId,
                AirConditionerId = dto.AirConditionerId,
                ClientName = dto.ClientName,
                ClientPhone = dto.ClientPhone,
                ClientEmail = dto.ClientEmail,
                ClientAddress = dto.ClientAddress,
                ClientCity = dto.ClientCity,
                InstallationDate = dto.InstallationDate,
                CompletionDate = dto.CompletionDate,
                Status = Enum.TryParse(dto.Status, out MontageStatus montageStatus) ? montageStatus : MontageStatus.Planned,
                IndoorUnitSerial = dto.IndoorUnitSerial,
                OutdoorUnitSerial = dto.OutdoorUnitSerial,
                TotalPrice = dto.TotalPrice,
                PaidAmount = dto.PaidAmount ?? 0,
                PaymentStatus = Enum.TryParse(dto.PaymentStatus, out MontagePaymentStatus montagePaymentStatus) ? montagePaymentStatus : MontagePaymentStatus.NotPaid,
                Notes = dto.Notes
            };

            await _repository.AddMontageAsync(montage);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdateMontageAsync(Guid montageId, UpdateMontageDto dto)
    {
        try
        {
            var montage = await _repository.GetByIdAsync(montageId);
            if (montage == null)
            {
                throw new InvalidOperationException("Montage not found");
            }

            montage.AirConditionerId = dto.AirConditionerId;
            montage.ClientName = dto.ClientName;
            montage.ClientPhone = dto.ClientPhone;
            montage.ClientEmail = dto.ClientEmail;
            montage.ClientAddress = dto.ClientAddress;
            montage.ClientCity = dto.ClientCity;
            montage.InstallationDate = dto.InstallationDate;
            montage.CompletionDate = dto.CompletionDate;
            montage.Status = Enum.TryParse(dto.Status, out MontageStatus montageStatus) ? montageStatus : MontageStatus.Planned;
            montage.IndoorUnitSerial = dto.IndoorUnitSerial;
            montage.OutdoorUnitSerial = dto.OutdoorUnitSerial;
            montage.TotalPrice = dto.TotalPrice;
            montage.PaidAmount = dto.PaidAmount;
            montage.PaymentStatus = Enum.TryParse(dto.PaymentStatus, out MontagePaymentStatus montagePaymentStatus) ? montagePaymentStatus : MontagePaymentStatus.NotPaid;
            montage.Notes = dto.Notes;

            await _repository.UpdateMontageAsync(montage);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdateMontageStatusAsync(Guid montageId, string status)
    {
        try
        {
            var montage = await _repository.GetByIdAsync(montageId);
            if (montage == null)
            {
                throw new InvalidOperationException("Montage not found");
            }

            montage.Status = Enum.TryParse(status, out MontageStatus montageStatus) ? montageStatus : MontageStatus.Planned;
            montage.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateMontageAsync(montage);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task DeleteMontageAsync(Guid montageId)
    {
        try
        {
            var montage = await _repository.GetByIdAsync(montageId);
            if (montage != null)
            {
                await _repository.DeleteMontageAsync(montage);
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<MontageDto?> GetByIdAsync(Guid montageId)
    {
        try
        {
            var montage = await _repository.GetByIdAsync(montageId);
            return montage == null ? null : ToDto(montage);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<MontageDto?> GetByIdWithAirConditionerAsync(Guid montageId)
    {
        try
        {
            var montage = await _repository.GetByIdWithAirConditionerAsync(montageId);
            return montage == null ? null : ToDto(montage);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<MontageDto>> GetAllAsync(PageParameters pageParameters)
    {
        try
        {
            var query = _context.Montages
                .Include(m => m.AirConditioner)
                .Include(m => m.UsedMaterials)
                    .ThenInclude(um => um.InventoryItem)
                .OrderByDescending(m => m.InstallationDate)
                .Select(m => new MontageDto
                {
                    Id = m.Id,
                    CompanyId = m.CompanyId,
                    UserId = m.UserId,
                    AirConditionerId = m.AirConditionerId,
                    ClientName = m.ClientName,
                    ClientPhone = m.ClientPhone,
                    ClientEmail = m.ClientEmail,
                    ClientAddress = m.ClientAddress,
                    ClientCity = m.ClientCity,
                    InstallationDate = m.InstallationDate,
                    CompletionDate = m.CompletionDate,
                    Status = m.Status.ToString(),
                    IndoorUnitSerial = m.IndoorUnitSerial,
                    OutdoorUnitSerial = m.OutdoorUnitSerial,
                    TotalPrice = m.TotalPrice,
                    PaidAmount = m.PaidAmount,
                    PaymentStatus = m.PaymentStatus.ToString(),
                    Notes = m.Notes,
                    CreatedAt = m.CreatedAt,
                    UpdatedAt = m.UpdatedAt,
                    AirConditioner = m.AirConditioner != null
                        ? new AirConditionerDto
                        {
                            Id = m.AirConditioner.Id,
                            Name = m.AirConditioner.Name,
                            Brand = m.AirConditioner.Brand,
                            Model = m.AirConditioner.Model,
                            Kilowatts = m.AirConditioner.Kilowatts,
                            Description = m.AirConditioner.Description,
                            Price = m.AirConditioner.Price,
                            ImageUrl = m.AirConditioner.ImageUrl,
                        }
                        : null
                });

            return await PagedList<MontageDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<MontageDto>> GetByCompanyIdAsync(Guid companyId, PageParameters pageParameters)
    {
        try
        {
            var query = _context.Montages
                .Include(m => m.AirConditioner)
                .Include(m => m.UsedMaterials)
                    .ThenInclude(um => um.InventoryItem)
                .Where(m => m.CompanyId == companyId)
                .OrderByDescending(m => m.InstallationDate)
                .Select(m => new MontageDto
                {
                    Id = m.Id,
                    CompanyId = m.CompanyId,
                    UserId = m.UserId,
                    AirConditionerId = m.AirConditionerId,
                    ClientName = m.ClientName,
                    ClientPhone = m.ClientPhone,
                    ClientEmail = m.ClientEmail,
                    ClientAddress = m.ClientAddress,
                    ClientCity = m.ClientCity,
                    InstallationDate = m.InstallationDate,
                    CompletionDate = m.CompletionDate,
                    Status = m.Status.ToString(),
                    IndoorUnitSerial = m.IndoorUnitSerial,
                    OutdoorUnitSerial = m.OutdoorUnitSerial,
                    TotalPrice = m.TotalPrice,
                    PaidAmount = m.PaidAmount,
                    PaymentStatus = m.PaymentStatus.ToString(),
                    Notes = m.Notes,
                    CreatedAt = m.CreatedAt,
                    UpdatedAt = m.UpdatedAt,
                    AirConditioner = m.AirConditioner != null ? new AirConditionerDto
                    {
                        Id = m.AirConditioner.Id,
                        Name = m.AirConditioner.Name,
                        Brand = m.AirConditioner.Brand,
                        Model = m.AirConditioner.Model,
                        Kilowatts = m.AirConditioner.Kilowatts,
                        Description = m.AirConditioner.Description,
                        Price = m.AirConditioner.Price,
                        ImageUrl = m.AirConditioner.ImageUrl,
                    } : null
                });
            
            return await PagedList<MontageDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }
    
    public async Task<PagedList<MontageDto>> GetByUserIdAsync(string userId, PageParameters pageParameters)
    {
        try
        {
            var query = _context.Montages
                .Include(m => m.AirConditioner)
                .Include(m => m.UsedMaterials)
                    .ThenInclude(um => um.InventoryItem)
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.InstallationDate)
                .Select(m => new MontageDto
                {
                    Id = m.Id,
                    CompanyId = m.CompanyId,
                    UserId = m.UserId,
                    AirConditionerId = m.AirConditionerId,
                    ClientName = m.ClientName,
                    ClientPhone = m.ClientPhone,
                    ClientEmail = m.ClientEmail,
                    ClientAddress = m.ClientAddress,
                    ClientCity = m.ClientCity,
                    InstallationDate = m.InstallationDate,
                    CompletionDate = m.CompletionDate,
                    Status = m.Status.ToString(),
                    IndoorUnitSerial = m.IndoorUnitSerial,
                    OutdoorUnitSerial = m.OutdoorUnitSerial,
                    TotalPrice = m.TotalPrice,
                    PaidAmount = m.PaidAmount,
                    PaymentStatus = m.PaymentStatus.ToString(),
                    Notes = m.Notes,
                    CreatedAt = m.CreatedAt,
                    UpdatedAt = m.UpdatedAt,
                    AirConditioner = m.AirConditioner != null ? new AirConditionerDto
                    {
                        Id = m.AirConditioner.Id,
                        Name = m.AirConditioner.Name,
                        Brand = m.AirConditioner.Brand,
                        Model = m.AirConditioner.Model,
                        Kilowatts = m.AirConditioner.Kilowatts,
                        Description = m.AirConditioner.Description,
                        Price = m.AirConditioner.Price,
                        ImageUrl = m.AirConditioner.ImageUrl,
                    } : null
                });
            
            return await PagedList<MontageDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }
    
    public async Task<PagedList<MontageDto>> GetByCompanyAndUserIdAsync(Guid companyId, string userId, PageParameters pageParameters)
    {
        try
        {
            var query = _context.Montages
                .Include(m => m.AirConditioner)
                .Include(m => m.UsedMaterials)
                    .ThenInclude(um => um.InventoryItem)
                .Where(m => m.CompanyId == companyId && m.UserId == userId)
                .OrderByDescending(m => m.InstallationDate)
                .Select(m => new MontageDto
                {
                    Id = m.Id,
                    CompanyId = m.CompanyId,
                    UserId = m.UserId,
                    AirConditionerId = m.AirConditionerId,
                    ClientName = m.ClientName,
                    ClientPhone = m.ClientPhone,
                    ClientEmail = m.ClientEmail,
                    ClientAddress = m.ClientAddress,
                    ClientCity = m.ClientCity,
                    InstallationDate = m.InstallationDate,
                    CompletionDate = m.CompletionDate,
                    Status = m.Status.ToString(),
                    IndoorUnitSerial = m.IndoorUnitSerial,
                    OutdoorUnitSerial = m.OutdoorUnitSerial,
                    TotalPrice = m.TotalPrice,
                    PaidAmount = m.PaidAmount,
                    PaymentStatus = m.PaymentStatus.ToString(),
                    Notes = m.Notes,
                    CreatedAt = m.CreatedAt,
                    UpdatedAt = m.UpdatedAt,
                    AirConditioner = m.AirConditioner != null ? new AirConditionerDto
                    {
                        Id = m.AirConditioner.Id,
                        Name = m.AirConditioner.Name,
                        Brand = m.AirConditioner.Brand,
                        Model = m.AirConditioner.Model,
                        Kilowatts = m.AirConditioner.Kilowatts,
                        Description = m.AirConditioner.Description,
                        Price = m.AirConditioner.Price,
                        ImageUrl = m.AirConditioner.ImageUrl,
                    } : null
                });
            
            return await PagedList<MontageDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }
    
    public async Task<PagedList<MontageDto>> GetByStatusAsync(string status, PageParameters pageParameters)
    {
        try
        {
            var query = _context.Montages
                .Include(m => m.AirConditioner)
                .Include(m => m.UsedMaterials)
                    .ThenInclude(um => um.InventoryItem)
                .Where(m => m.Status.ToString().ToLower() == status.ToLower())
                .OrderByDescending(m => m.InstallationDate)
                .Select(m => new MontageDto
                {
                    Id = m.Id,
                    CompanyId = m.CompanyId,
                    UserId = m.UserId,
                    AirConditionerId = m.AirConditionerId,
                    ClientName = m.ClientName,
                    ClientPhone = m.ClientPhone,
                    ClientEmail = m.ClientEmail,
                    ClientAddress = m.ClientAddress,
                    ClientCity = m.ClientCity,
                    InstallationDate = m.InstallationDate,
                    CompletionDate = m.CompletionDate,
                    Status = m.Status.ToString(),
                    IndoorUnitSerial = m.IndoorUnitSerial,
                    OutdoorUnitSerial = m.OutdoorUnitSerial,
                    TotalPrice = m.TotalPrice,
                    PaidAmount = m.PaidAmount,
                    PaymentStatus = m.PaymentStatus.ToString(),
                    Notes = m.Notes,
                    CreatedAt = m.CreatedAt,
                    UpdatedAt = m.UpdatedAt,
                    AirConditioner = m.AirConditioner != null ? new AirConditionerDto
                    {
                        Id = m.AirConditioner.Id,
                        Name = m.AirConditioner.Name,
                        Brand = m.AirConditioner.Brand,
                        Model = m.AirConditioner.Model,
                        Kilowatts = m.AirConditioner.Kilowatts,
                        Description = m.AirConditioner.Description,
                        Price = m.AirConditioner.Price,
                        ImageUrl = m.AirConditioner.ImageUrl,
                    } : null
                });
            
            return await PagedList<MontageDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<MontageDto>> GetByInstallationDateRangeAsync(DateOnly startDate, DateOnly endDate, PageParameters pageParameters)
    {
        try
        {
            var query = _context.Montages
                .Include(m => m.AirConditioner)
                .Include(m => m.UsedMaterials)
                    .ThenInclude(um => um.InventoryItem)
                .Where(m => m.InstallationDate >= startDate && m.InstallationDate <= endDate)
                .OrderByDescending(m => m.InstallationDate)
                .Select(m => new MontageDto
                {
                    Id = m.Id,
                    CompanyId = m.CompanyId,
                    UserId = m.UserId,
                    AirConditionerId = m.AirConditionerId,
                    ClientName = m.ClientName,
                    ClientPhone = m.ClientPhone,
                    ClientEmail = m.ClientEmail,
                    ClientAddress = m.ClientAddress,
                    ClientCity = m.ClientCity,
                    InstallationDate = m.InstallationDate,
                    CompletionDate = m.CompletionDate,
                    Status = m.Status.ToString(),
                    IndoorUnitSerial = m.IndoorUnitSerial,
                    OutdoorUnitSerial = m.OutdoorUnitSerial,
                    TotalPrice = m.TotalPrice,
                    PaidAmount = m.PaidAmount,
                    PaymentStatus = m.PaymentStatus.ToString(),
                    Notes = m.Notes,
                    CreatedAt = m.CreatedAt,
                    UpdatedAt = m.UpdatedAt,
                    AirConditioner = m.AirConditioner != null
                        ? new AirConditionerDto
                        {
                            Id = m.AirConditioner.Id,
                            Name = m.AirConditioner.Name,
                            Brand = m.AirConditioner.Brand,
                            Model = m.AirConditioner.Model,
                            Kilowatts = m.AirConditioner.Kilowatts,
                            Description = m.AirConditioner.Description,
                            Price = m.AirConditioner.Price,
                            ImageUrl = m.AirConditioner.ImageUrl,
                        }
                        : null
                });
    
            return await PagedList<MontageDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }
    
    private static MontageDto ToDto(Montage montage)
    {
       return new MontageDto
       {
           Id = montage.Id,
           CompanyId = montage.CompanyId,
           UserId = montage.UserId,
           AirConditionerId = montage.AirConditionerId,
           ClientName = montage.ClientName,
           ClientPhone = montage.ClientPhone,
           ClientEmail = montage.ClientEmail,
           ClientAddress = montage.ClientAddress,
           ClientCity = montage.ClientCity,
           InstallationDate = montage.InstallationDate,
           CompletionDate = montage.CompletionDate,
           Status = montage.Status.ToString(),
           IndoorUnitSerial = montage.IndoorUnitSerial,
           OutdoorUnitSerial = montage.OutdoorUnitSerial,
           TotalPrice = montage.TotalPrice,
           PaidAmount = montage.PaidAmount,
           PaymentStatus = montage.PaymentStatus.ToString(),
           Notes = montage.Notes,
           CreatedAt = montage.CreatedAt,
           UpdatedAt = montage.UpdatedAt,
           UsedMaterials = montage.UsedMaterials?.Select(m => new MontageInventoryItemDto
           {
               Id = m.Id,
               MontageId = m.MontageId,
               InventoryItemId = m.InventoryItemId,
               QuantityUsed = m.QuantityUsed,
               UnitPriceAtTime = m.UnitPriceAtTime,
               Notes = m.Notes,
               CreatedAt = m.CreatedAt,
               ItemName = m.InventoryItem?.Name,
               ItemSku = m.InventoryItem?.Sku,
               UnitOfMeasure = m.InventoryItem?.UnitOfMeasure.ToString()
           }).ToList() ?? new List<MontageInventoryItemDto>(),
           AirConditioner = montage.AirConditioner != null
               ? new AirConditionerDto
               {
                   Id = montage.AirConditioner.Id,
                   Name = montage.AirConditioner.Name,
                   Brand = montage.AirConditioner.Brand,
                   Model = montage.AirConditioner.Model,
                   Kilowatts = montage.AirConditioner.Kilowatts,
                   Description = montage.AirConditioner.Description,
                   Price = montage.AirConditioner.Price,
                   ImageUrl = montage.AirConditioner.ImageUrl,
               }
               : null,
           Photos = montage.Photos?.Select(p => new MontagePhotoDto
           {
               Id = p.Id,
               MontageId = p.MontageId,
               FileName = p.FileName,
               OriginalFileName = p.OriginalFileName,
               ContentType = p.ContentType,
               FileSize = p.FileSize,
               Url = $"/api/montagephotos/{p.Id}/download",
               Description = p.Description,
               DisplayOrder = p.DisplayOrder,
               CreatedAt = p.CreatedAt
           }).OrderBy(p => p.DisplayOrder).ThenBy(p => p.CreatedAt).ToList()
       };
    }
}
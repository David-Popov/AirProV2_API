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
            var existing = await _context.Montages
                .AsNoTracking()
                .FirstOrDefaultAsync(m => 
                    m.CompanyId == dto.CompanyId && 
                    m.ClientEmail == dto.ClientEmail && 
                    m.InstallationDate == dto.InstallationDate &&
                    m.AirConditionerId == dto.AirConditionerId);

            if (existing != null)
            {
                throw new InvalidOperationException("A montage with the same company, client email, installation date, and air conditioner already exists.");
            }

            var montage = new Montage
            {
                CompanyId = dto.CompanyId,
                UserId = dto.UserId,
                AirConditionerId = dto.AirConditionerId,
                CustomAcBrand = dto.CustomAcBrand,
                CustomAcModel = dto.CustomAcModel,
                CustomAcKilowatts = dto.CustomAcKilowatts,
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
            montage.CustomAcBrand = dto.CustomAcBrand;
            montage.CustomAcModel = dto.CustomAcModel;
            montage.CustomAcKilowatts = dto.CustomAcKilowatts;
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

            var newStatus = Enum.TryParse(status, out MontageStatus montageStatus) 
                ? montageStatus 
                : MontageStatus.Planned;
            
            if (newStatus == MontageStatus.Completed)
            {
                var validation = MontageStatusValidator.CanSetStatusToCompleted(montage);
                if (!validation.IsValid)
                {
                    throw new InvalidOperationException(string.Join("; ", validation.Errors));
                }
            }

            montage.Status = newStatus;
            montage.UpdatedAt = DateTime.UtcNow;
            
            if (newStatus == MontageStatus.Completed && montage.CompletionDate == null)
            {
                montage.CompletionDate = DateOnly.FromDateTime(DateTime.UtcNow);
            }

            await _repository.UpdateMontageAsync(montage);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdatePaymentStatusAsync(Guid montageId, string paymentStatus, decimal? paidAmount = null)
    {
        try
        {
            var montage = await _repository.GetByIdAsync(montageId);
            if (montage == null)
            {
                throw new InvalidOperationException("Montage not found");
            }

            var newPaymentStatus = Enum.TryParse(paymentStatus, out MontagePaymentStatus status) 
                ? status 
                : MontagePaymentStatus.NotPaid;

            montage.PaymentStatus = newPaymentStatus;
            
            if (paidAmount.HasValue)
            {
                montage.PaidAmount = paidAmount.Value;
            }
            else
            {
                switch (newPaymentStatus)
                {
                    case MontagePaymentStatus.Paid:
                        montage.PaidAmount = montage.TotalPrice;
                        break;
                    case MontagePaymentStatus.NotPaid:
                        montage.PaidAmount = 0;
                        break;
                }
            }
            
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

    public async Task<PagedList<MontageDto>> GetAllAsync(MontageParameters parameters)
    {
        try
        {
            var query = _context.Montages
                .AsNoTracking()
                .Include(m => m.AirConditioner)
                .Include(m => m.UsedMaterials)
                    .ThenInclude(um => um.InventoryItem)
                .AsQueryable();

            if (parameters.StartDate.HasValue)
            {
                var startDate = DateOnly.FromDateTime(parameters.StartDate.Value);
                query = query.Where(m => m.InstallationDate >= startDate);
            }

            if (parameters.EndDate.HasValue)
            {
                var endDate = DateOnly.FromDateTime(parameters.EndDate.Value);
                query = query.Where(m => m.InstallationDate <= endDate);
            }

            if (!string.IsNullOrWhiteSpace(parameters.Status))
            {
                // Try parse enum or search by string if stored as string? Database stores int usually if enum.
                // Assuming Status is stored as string or int. 
                // In AddMontageAsync it uses Enum to parse.
                // Let's check Entity configuration. Usually Enums are ints by default unless configured.
                // But let's check how GetByStatusAsync does it: .Where(m => m.Status.ToString().ToLower() == status.ToLower())
                // That suggests EF Core translation might be tricky or it's evaluated client side? No, EF Core can translate ToString() in some versions but generally it's better to parse before query.
                
                if (Enum.TryParse<MontageStatus>(parameters.Status, true, out var statusEnum))
                {
                   query = query.Where(m => m.Status == statusEnum);
                }
            }

            if (!string.IsNullOrWhiteSpace(parameters.ClientName))
            {
                query = query.Where(m => m.ClientName.ToLower().Contains(parameters.ClientName.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(parameters.ClientPhone))
            {
                query = query.Where(m => m.ClientPhone.Contains(parameters.ClientPhone));
            }

            var dtoQuery = query
                .OrderByDescending(m => m.InstallationDate)
                .Select(m => new MontageDto
                {
                    Id = m.Id,
                    CompanyId = m.CompanyId,
                    UserId = m.UserId,
                    AirConditionerId = m.AirConditionerId,
                    CustomAcBrand = m.CustomAcBrand,
                    CustomAcModel = m.CustomAcModel,
                    CustomAcKilowatts = m.CustomAcKilowatts,
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

            return await PagedList<MontageDto>.CreateAsync(dtoQuery, parameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<MontageDto>> GetByCompanyIdAsync(Guid companyId, MontageParameters parameters)
    {
        try
        {
            var query = _context.Montages
                .AsNoTracking()
                .Include(m => m.AirConditioner)
                .Include(m => m.UsedMaterials)
                    .ThenInclude(um => um.InventoryItem)
                .Where(m => m.CompanyId == companyId)
                .AsQueryable();

            // Apply filters from MontageParameters
            if (parameters.StartDate.HasValue)
            {
                var startDate = DateOnly.FromDateTime(parameters.StartDate.Value);
                query = query.Where(m => m.InstallationDate >= startDate);
            }

            if (parameters.EndDate.HasValue)
            {
                var endDate = DateOnly.FromDateTime(parameters.EndDate.Value);
                query = query.Where(m => m.InstallationDate <= endDate);
            }

            if (!string.IsNullOrWhiteSpace(parameters.Status))
            {
                if (Enum.TryParse<MontageStatus>(parameters.Status, true, out var statusEnum))
                {
                   query = query.Where(m => m.Status == statusEnum);
                }
            }

            if (!string.IsNullOrWhiteSpace(parameters.ClientName))
            {
                query = query.Where(m => m.ClientName.ToLower().Contains(parameters.ClientName.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(parameters.ClientPhone))
            {
                query = query.Where(m => m.ClientPhone.Contains(parameters.ClientPhone));
            }

            var dtoQuery = query
                .OrderByDescending(m => m.InstallationDate)
                .Select(m => new MontageDto
                {
                    Id = m.Id,
                    CompanyId = m.CompanyId,
                    UserId = m.UserId,
                    AirConditionerId = m.AirConditionerId,
                    CustomAcBrand = m.CustomAcBrand,
                    CustomAcModel = m.CustomAcModel,
                    CustomAcKilowatts = m.CustomAcKilowatts,
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

            return await PagedList<MontageDto>.CreateAsync(dtoQuery, parameters);
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
                .AsNoTracking()
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
                    CustomAcBrand = m.CustomAcBrand,
                    CustomAcModel = m.CustomAcModel,
                    CustomAcKilowatts = m.CustomAcKilowatts,
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
                .AsNoTracking()
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
                    CustomAcBrand = m.CustomAcBrand,
                    CustomAcModel = m.CustomAcModel,
                    CustomAcKilowatts = m.CustomAcKilowatts,
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
            // Parse enum before query — guarantees SQL-translatable WHERE clause
            if (!Enum.TryParse<MontageStatus>(status, ignoreCase: true, out var statusEnum))
                return PagedList<MontageDto>.Empty();

            var query = _context.Montages
                .AsNoTracking()
                .Include(m => m.AirConditioner)
                .Include(m => m.UsedMaterials)
                    .ThenInclude(um => um.InventoryItem)
                .Where(m => m.Status == statusEnum)
                .OrderByDescending(m => m.InstallationDate)
                .Select(m => new MontageDto
                {
                    Id = m.Id,
                    CompanyId = m.CompanyId,
                    UserId = m.UserId,
                    AirConditionerId = m.AirConditionerId,
                    CustomAcBrand = m.CustomAcBrand,
                    CustomAcModel = m.CustomAcModel,
                    CustomAcKilowatts = m.CustomAcKilowatts,
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
                .AsNoTracking()
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
                    CustomAcBrand = m.CustomAcBrand,
                    CustomAcModel = m.CustomAcModel,
                    CustomAcKilowatts = m.CustomAcKilowatts,
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
           CustomAcBrand = montage.CustomAcBrand,
           CustomAcModel = montage.CustomAcModel,
           CustomAcKilowatts = montage.CustomAcKilowatts,
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
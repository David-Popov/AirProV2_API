using ValidationException = FluentValidation.ValidationException;
using API.Common;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Models;
using API.Mappings;
using API.Repositories;
using Mapster;
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

    public async Task<Guid> AddMontageAsync(CreateMontageDto dto)
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
                throw new ValidationException("A montage with the same company, client email, installation date, and air conditioner already exists.");
            }

            await ValidateAssigneesAsync(dto.AssignedUserIds, dto.CompanyId);

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

            if (dto.AssignedUserIds != null)
            {
                foreach (var assigneeId in dto.AssignedUserIds.Where(id => !string.IsNullOrEmpty(id)).Distinct())
                {
                    montage.Assignments.Add(new MontageAssignment { UserId = assigneeId });
                }
            }

            await _repository.AddMontageAsync(montage);
            return montage.Id;
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
            var montage = await _context.Montages
                .FirstOrDefaultAsync(m => m.Id == montageId);
            if (montage == null)
            {
                throw new NotFoundException("Montage not found");
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
            montage.UpdatedAt = DateTime.UtcNow;

            if (dto.AssignedUserIds != null)
            {
                await ValidateAssigneesAsync(dto.AssignedUserIds, montage.CompanyId);
                var desired = dto.AssignedUserIds
                    .Where(id => !string.IsNullOrEmpty(id))
                    .Distinct()
                    .ToHashSet();

                var current = await _context.MontageAssignments
                    .Where(a => a.MontageId == montageId)
                    .ToListAsync();
                var currentIds = current.Select(a => a.UserId).ToHashSet();

                var toRemove = current.Where(a => !desired.Contains(a.UserId)).ToList();
                if (toRemove.Count > 0)
                {
                    _context.MontageAssignments.RemoveRange(toRemove);
                }

                foreach (var assigneeId in desired.Where(id => !currentIds.Contains(id)))
                {
                    _context.MontageAssignments.Add(new MontageAssignment { MontageId = montageId, UserId = assigneeId });
                }
            }

            await _context.SaveChangesAsync();
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
                throw new NotFoundException("Montage not found");
            }

            var newStatus = Enum.TryParse(status, out MontageStatus montageStatus) 
                ? montageStatus 
                : MontageStatus.Planned;
            
            if (newStatus == MontageStatus.Completed)
            {
                var validation = MontageStatusValidator.CanSetStatusToCompleted(montage);
                if (!validation.IsValid)
                {
                    throw new ValidationException(string.Join("; ", validation.Errors));
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
                throw new NotFoundException("Montage not found");
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
            return montage == null ? null : montage.Adapt<MontageDto>(MontageMappingConfig.Detail);
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
            return montage == null ? null : montage.Adapt<MontageDto>(MontageMappingConfig.Detail);
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

            if (!string.IsNullOrWhiteSpace(parameters.Status)
                && Enum.TryParse<MontageStatus>(parameters.Status, true, out var statusEnum))
            {
                query = query.Where(m => m.Status == statusEnum);
            }

            var needsInMemoryFilter = !string.IsNullOrWhiteSpace(parameters.ClientName)
                                   || !string.IsNullOrWhiteSpace(parameters.ClientPhone);

            if (needsInMemoryFilter)
            {
                var allItems = await query
                    .Include(m => m.AirConditioner)
                    .Include(m => m.Assignments)
                        .ThenInclude(a => a.User)
                    .OrderByDescending(m => m.InstallationDate)
                    .ToListAsync();

                IEnumerable<Montage> filtered = allItems;

                if (!string.IsNullOrWhiteSpace(parameters.ClientName))
                {
                    filtered = filtered.Where(m => m.ClientName.Contains(parameters.ClientName, StringComparison.OrdinalIgnoreCase));
                }

                if (!string.IsNullOrWhiteSpace(parameters.ClientPhone))
                {
                    filtered = filtered.Where(m => m.ClientPhone != null && m.ClientPhone.Contains(parameters.ClientPhone, StringComparison.OrdinalIgnoreCase));
                }

                var filteredList = filtered.ToList();
                var totalCount = filteredList.Count;
                var pagedItems = filteredList
                    .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                    .Take(parameters.PageSize)
                    .Select(m => m.Adapt<MontageDto>(MontageMappingConfig.List))
                    .ToList();

                return new PagedList<MontageDto>(pagedItems, parameters.PageNumber, parameters.PageSize, totalCount);
            }

            var dtoQuery = query
                .OrderByDescending(m => m.InstallationDate)
                .ProjectToType<MontageDto>(MontageMappingConfig.List);

            return await PagedList<MontageDto>.CreateAsync(dtoQuery, parameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<MontageDto>> GetByCompanyIdAsync(Guid companyId, MontageParameters parameters, string? assignedToUserId = null)
    {
        try
        {
            var query = _context.Montages
                .AsNoTracking()
                .Where(m => m.CompanyId == companyId)
                .AsQueryable();

            if (!string.IsNullOrEmpty(assignedToUserId))
            {
                query = query.Where(m => m.Assignments.Any(a => a.UserId == assignedToUserId));
            }

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

            var needsInMemoryFilter = !string.IsNullOrWhiteSpace(parameters.ClientName)
                                   || !string.IsNullOrWhiteSpace(parameters.ClientPhone);

            if (needsInMemoryFilter)
            {
                var allItems = await query
                    .Include(m => m.AirConditioner)
                    .Include(m => m.Assignments)
                        .ThenInclude(a => a.User)
                    .OrderByDescending(m => m.InstallationDate)
                    .ToListAsync();

                IEnumerable<Montage> filtered = allItems;

                if (!string.IsNullOrWhiteSpace(parameters.ClientName))
                {
                    filtered = filtered.Where(m => m.ClientName.Contains(parameters.ClientName, StringComparison.OrdinalIgnoreCase));
                }

                if (!string.IsNullOrWhiteSpace(parameters.ClientPhone))
                {
                    filtered = filtered.Where(m => m.ClientPhone != null && m.ClientPhone.Contains(parameters.ClientPhone, StringComparison.OrdinalIgnoreCase));
                }

                var filteredList = filtered.ToList();
                var totalCount = filteredList.Count;
                var pagedItems = filteredList
                    .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                    .Take(parameters.PageSize)
                    .Select(m => m.Adapt<MontageDto>(MontageMappingConfig.List))
                    .ToList();

                return new PagedList<MontageDto>(pagedItems, parameters.PageNumber, parameters.PageSize, totalCount);
            }

            var dtoQuery = query
                .OrderByDescending(m => m.InstallationDate)
                .ProjectToType<MontageDto>(MontageMappingConfig.List);

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
                .Where(m => m.Assignments.Any(a => a.UserId == userId))
                .OrderByDescending(m => m.InstallationDate)
                .ProjectToType<MontageDto>(MontageMappingConfig.List);

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
                .Where(m => m.CompanyId == companyId && m.Assignments.Any(a => a.UserId == userId))
                .OrderByDescending(m => m.InstallationDate)
                .ProjectToType<MontageDto>(MontageMappingConfig.List);

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
            if (!Enum.TryParse<MontageStatus>(status, ignoreCase: true, out var statusEnum))
                return PagedList<MontageDto>.Empty();

            var query = _context.Montages
                .AsNoTracking()
                .Where(m => m.Status == statusEnum)
                .OrderByDescending(m => m.InstallationDate)
                .ProjectToType<MontageDto>(MontageMappingConfig.List);

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
                .Where(m => m.InstallationDate >= startDate && m.InstallationDate <= endDate)
                .OrderByDescending(m => m.InstallationDate)
                .ProjectToType<MontageDto>(MontageMappingConfig.List);

            return await PagedList<MontageDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }
    
    /// <summary>
    /// Ensures every supplied assignee is an active, non-deleted employee of the
    /// given company. Batched into a single query (no N+1). Throws on mismatch.
    /// </summary>
    private async Task ValidateAssigneesAsync(List<string>? userIds, Guid? companyId)
    {
        if (userIds == null || companyId == null)
        {
            return;
        }

        var distinctIds = userIds.Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
        if (distinctIds.Count == 0)
        {
            return;
        }

        var validCount = await _context.Users
            .AsNoTracking()
            .CountAsync(u => distinctIds.Contains(u.Id) && u.CompanyId == companyId && u.IsActive);

        if (validCount != distinctIds.Count)
        {
            throw new ValidationException("One or more selected workers are not valid active employees of this company.");
        }
    }

}
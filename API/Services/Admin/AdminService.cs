using API.Common;
using API.Data;
using API.Data.Entities;
using API.DTOs.Admin;
using API.Models;
using API.Services.Auth;
using API.Services.Email;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Mapster;

namespace API.Services.Admin;

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IBackgroundEmailQueue _backgroundEmailQueue;
    private readonly IAuthService _authService;
    private readonly ILogger<AdminService> _logger;

    public AdminService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        IBackgroundEmailQueue backgroundEmailQueue,
        IAuthService authService,
        ILogger<AdminService> logger)
    {
        _context = context;
        _userManager = userManager;
        _backgroundEmailQueue = backgroundEmailQueue;
        _authService = authService;
        _logger = logger;
    }

    #region Company Management

    public async Task<PagedResult<AdminCompanyDto>> GetAllCompaniesAsync(AdminCompanyFilterDto filter)
    {
        var query = _context.Companies
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Name))
        {
            query = query.Where(c => c.CompanyName.ToLower().Contains(filter.Name.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(filter.OwnerEmail))
        {
            query = query.Where(c => c.Users.Any(u => 
                u.Email != null && u.Email.ToLower().Contains(filter.OwnerEmail.ToLower())));
        }

        if (!string.IsNullOrWhiteSpace(filter.OwnerPhone))
        {
            query = query.Where(c => c.Phone != null && c.Phone.Contains(filter.OwnerPhone));
        }

        if (filter.IsActive.HasValue)
        {
            query = query.Where(c => c.IsActive == filter.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.SubscriptionStatus))
        {
            if (Enum.TryParse<SubscriptionStatus>(filter.SubscriptionStatus, out var status))
            {
                query = query.Where(c => c.SubscriptionStatus == status);
            }
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ProjectToType<AdminCompanyDto>()
            .ToListAsync();

        return new PagedResult<AdminCompanyDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<AdminCompanyDto?> GetCompanyByIdAsync(Guid id)
    {
        return await _context.Companies
            .AsNoTracking()
            .Where(c => c.Id == id)
            .ProjectToType<AdminCompanyDto>()
            .FirstOrDefaultAsync();
    }

    public async Task<AdminCompanyDto?> UpdateCompanySubscriptionAsync(Guid companyId, AdminUpdateSubscriptionDto dto)
    {
        var company = await _context.Companies.FindAsync(companyId);
        if (company == null) return null;

        var previousStatus = company.SubscriptionStatus.ToString();

        if (Enum.TryParse<SubscriptionPlan>(dto.SubscriptionPlan, out var plan))
        {
            company.SubscriptionPlan = plan;
        }

        if (Enum.TryParse<SubscriptionStatus>(dto.SubscriptionStatus, out var status))
        {
            company.SubscriptionStatus = status;
        }

        if (dto.TrialEndDate.HasValue)
        {
            company.TrialEndDate = dto.TrialEndDate.Value;
        }

        if (dto.SubscriptionCurrentPeriodEnd.HasValue)
        {
            company.SubscriptionCurrentPeriodEnd = dto.SubscriptionCurrentPeriodEnd.Value;
        }

        if (dto.IsSubscriptionActive.HasValue)
        {
            company.IsSubscriptionActive = dto.IsSubscriptionActive.Value;
        }

        company.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var notifyCompany = company;
        var notifyPrevStatus = previousStatus;
        var notifyNewStatus = company.SubscriptionStatus.ToString();
        _backgroundEmailQueue.QueueEmail(async sp =>
        {
            var emailService = sp.GetRequiredService<IEmailService>();
            await emailService.SendSubscriptionStatusChangedEmailAsync(notifyCompany, notifyPrevStatus, notifyNewStatus);
        });

        return await GetCompanyByIdAsync(companyId);
    }

    public async Task<bool> SoftDeleteCompanyAsync(Guid companyId)
    {
        var company = await _context.Companies.FindAsync(companyId);
        if (company == null) return false;

        company.IsActive = false;
        company.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreCompanyAsync(Guid companyId)
    {
        var company = await _context.Companies.FindAsync(companyId);
        if (company == null) return false;

        company.IsActive = true;
        company.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region User Management

    public async Task<PagedResult<AdminUserDto>> GetAllUsersAsync(AdminUserFilterDto filter)
    {
        var query = _userManager.Users
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Name))
        {
            var nameLower = filter.Name.ToLower();
            query = query.Where(u =>
                u.FirstName.ToLower().Contains(nameLower) ||
                u.LastName.ToLower().Contains(nameLower));
        }

        if (!string.IsNullOrWhiteSpace(filter.Email))
        {
            query = query.Where(u => u.Email != null && u.Email.ToLower().Contains(filter.Email.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(filter.Phone))
        {
            query = query.Where(u => u.PhoneNumber != null && u.PhoneNumber.Contains(filter.Phone));
        }

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(u => u.CompanyId == filter.CompanyId.Value);
        }

        if (filter.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == filter.IsActive.Value);
        }

        if (filter.IsDeleted.HasValue)
        {
            query = query.Where(u => u.IsDeleted == filter.IsDeleted.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Role))
        {
            var roleName = filter.Role;
            var matchingUserIds =
                from ur in _context.UserRoles
                join r in _context.Roles on ur.RoleId equals r.Id
                where r.Name == roleName
                select ur.UserId;
            query = query.Where(u => matchingUserIds.Contains(u.Id));
        }

        var totalCount = await query.CountAsync();

        var pagedUsers = await query
            .OrderByDescending(u => u.Id)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.PhoneNumber,
                u.FirstName,
                u.MiddleName,
                u.LastName,
                u.Address,
                u.IsActive,
                u.IsDeleted,
                u.DeletedAt,
                u.CompanyId,
                CompanyName = u.Company != null ? u.Company.CompanyName : null
            })
            .ToListAsync();

        var pageUserIds = pagedUsers.Select(u => u.Id).ToList();
        var roleMap = await _context.UserRoles
            .AsNoTracking()
            .Where(ur => pageUserIds.Contains(ur.UserId))
            .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, RoleName = r.Name! })
            .GroupBy(x => x.UserId)
            .ToDictionaryAsync(g => g.Key, g => g.Select(x => x.RoleName).ToList());

        var items = pagedUsers.Select(u => new AdminUserDto
        {
            Id = u.Id,
            Email = u.Email ?? string.Empty,
            PhoneNumber = u.PhoneNumber,
            FirstName = u.FirstName,
            MiddleName = u.MiddleName,
            LastName = u.LastName,
            Address = u.Address,
            IsActive = u.IsActive,
            IsDeleted = u.IsDeleted,
            DeletedAt = u.DeletedAt,
            CompanyId = u.CompanyId,
            CompanyName = u.CompanyName,
            Roles = roleMap.TryGetValue(u.Id, out var roles) ? roles : new List<string>()
        }).ToList();

        return new PagedResult<AdminUserDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<AdminUserDto?> GetUserByIdAsync(string userId)
    {
        var user = await _userManager.Users
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);

        return new AdminUserDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            PhoneNumber = user.PhoneNumber,
            FirstName = user.FirstName,
            MiddleName = user.MiddleName,
            LastName = user.LastName,
            Address = user.Address,
            IsActive = user.IsActive,
            IsDeleted = user.IsDeleted,
            DeletedAt = user.DeletedAt,
            CompanyId = user.CompanyId,
            CompanyName = user.Company?.CompanyName,
            Roles = roles.ToList()
        };
    }

    public async Task<AdminUserDto?> UpdateUserAsync(string userId, AdminUpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return null;

        user.FirstName = dto.FirstName;
        user.MiddleName = dto.MiddleName;
        user.LastName = dto.LastName;
        user.Address = dto.Address ?? string.Empty;
        user.PhoneNumber = dto.PhoneNumber;
        user.IsActive = dto.IsActive;

        await _userManager.UpdateAsync(user);

        return await GetUserByIdAsync(userId);
    }

    public async Task<bool> ChangeUserPasswordAsync(string userId, AdminChangePasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);

        if (!result.Succeeded)
        {
            _logger.LogError("Failed to change password for user {UserId}: {Errors}",
                userId, string.Join(", ", result.Errors.Select(e => e.Description)));
            return false;
        }

        user.MustChangePassword = true;
        await _userManager.UpdateAsync(user);

        if (dto.SendEmailNotification)
        {
            var pwUser = user;
            var pwPassword = dto.NewPassword;
            _backgroundEmailQueue.QueueEmail(async sp =>
            {
                var emailService = sp.GetRequiredService<IEmailService>();
                await emailService.SendTemporaryPasswordEmailAsync(pwUser, pwPassword);
            });
        }

        return true;
    }

    public async Task<bool> ChangeUserRoleAsync(string userId, AdminChangeRoleDto dto)
    {
        if (dto.NewRole != "Manager" && dto.NewRole != "User")
        {
            _logger.LogWarning("Attempted to change user {UserId} to disallowed role: {Role}", userId, dto.NewRole);
            return false;
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var currentRoles = await _userManager.GetRolesAsync(user);
        
        if (currentRoles.Contains("Admin"))
        {
            _logger.LogWarning("Attempted to change Admin user {UserId} role", userId);
            return false;
        }

        var rolesToRemove = currentRoles.Where(r => r != "Admin").ToList();
        await _userManager.RemoveFromRolesAsync(user, rolesToRemove);

        await _userManager.AddToRoleAsync(user, dto.NewRole);

        return true;
    }

    public Task RequestUserEmailChangeAsync(string userId, string newEmail)
        => _authService.RequestEmailChangeAsync(userId, newEmail);

    public async Task<bool> SoftDeleteUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        user.IsActive = false;

        await _userManager.UpdateAsync(user);
        return true;
    }

    public async Task<bool> RestoreUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        user.IsDeleted = false;
        user.DeletedAt = null;
        user.IsActive = true;

        await _userManager.UpdateAsync(user);
        return true;
    }

    #endregion

    #region Montage Management

    public async Task<PagedResult<AdminMontageDto>> GetAllMontagesAsync(AdminMontageFilterDto filter)
    {
        var query = _context.Montages
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.ClientName))
        {
            query = query.Where(m => m.ClientName.ToLower().Contains(filter.ClientName.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(filter.ClientAddress))
        {
            query = query.Where(m => m.ClientAddress != null && m.ClientAddress.ToLower().Contains(filter.ClientAddress.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(filter.ClientPhone))
        {
            query = query.Where(m => m.ClientPhone != null && m.ClientPhone.Contains(filter.ClientPhone));
        }

        if (!string.IsNullOrWhiteSpace(filter.UserName))
        {
            query = query.Where(m => m.User != null && 
                (m.User.FirstName.ToLower().Contains(filter.UserName.ToLower()) ||
                 m.User.LastName.ToLower().Contains(filter.UserName.ToLower())));
        }

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(m => m.CompanyId == filter.CompanyId.Value);
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(m => m.Status == filter.Status.Value);
        }

        if (filter.PaymentStatus.HasValue)
        {
            query = query.Where(m => m.PaymentStatus == filter.PaymentStatus.Value);
        }

        if (filter.StartDate.HasValue)
        {
            var startDate = DateOnly.FromDateTime(filter.StartDate.Value);
            query = query.Where(m => m.InstallationDate >= startDate);
        }

        if (filter.EndDate.HasValue)
        {
            var endDate = DateOnly.FromDateTime(filter.EndDate.Value);
            query = query.Where(m => m.InstallationDate <= endDate);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ProjectToType<AdminMontageDto>()
            .ToListAsync();

        return new PagedResult<AdminMontageDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<AdminMontageDto?> GetMontageByIdAsync(Guid montageId)
    {
        return await _context.Montages
            .AsNoTracking()
            .Where(m => m.Id == montageId)
            .ProjectToType<AdminMontageDto>()
            .FirstOrDefaultAsync();
    }

    public async Task<AdminMontageDto> CreateMontageAsync(AdminCreateMontageDto dto)
    {
        var montage = new Montage
        {
            Id = Guid.NewGuid(),
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
            Status = dto.Status,
            PaymentStatus = dto.PaymentStatus,
            TotalPrice = dto.TotalPrice,
            PaidAmount = dto.PaidAmount,
            Notes = dto.Notes,
            IndoorUnitSerial = dto.IndoorUnitSerial,
            OutdoorUnitSerial = dto.OutdoorUnitSerial,
            CreatedAt = DateTime.UtcNow
        };

        _context.Montages.Add(montage);
        await _context.SaveChangesAsync();

        return (await GetMontageByIdAsync(montage.Id))!;
    }

    public async Task<AdminMontageDto?> UpdateMontageAsync(Guid montageId, AdminCreateMontageDto dto)
    {
        var montage = await _context.Montages.FindAsync(montageId);
        if (montage == null) return null;

        montage.CompanyId = dto.CompanyId;
        montage.UserId = dto.UserId;
        montage.AirConditionerId = dto.AirConditionerId;
        montage.ClientName = dto.ClientName;
        montage.ClientPhone = dto.ClientPhone;
        montage.ClientEmail = dto.ClientEmail;
        montage.ClientAddress = dto.ClientAddress;
        montage.ClientCity = dto.ClientCity;
        montage.InstallationDate = dto.InstallationDate;
        montage.CompletionDate = dto.CompletionDate;
        montage.Status = dto.Status;
        montage.PaymentStatus = dto.PaymentStatus;
        montage.TotalPrice = dto.TotalPrice;
        montage.PaidAmount = dto.PaidAmount;
        montage.Notes = dto.Notes;
        montage.IndoorUnitSerial = dto.IndoorUnitSerial;
        montage.OutdoorUnitSerial = dto.OutdoorUnitSerial;
        montage.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetMontageByIdAsync(montageId);
    }

    public async Task<bool> DeleteMontageAsync(Guid montageId)
    {
        var montage = await _context.Montages.FindAsync(montageId);
        if (montage == null) return false;

        _context.Montages.Remove(montage);
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion
}

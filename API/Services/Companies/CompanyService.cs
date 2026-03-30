using API.Common;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Models;
using API.Repositories;
using API.Repositories.Companies;
using API.Services.Email;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Services.Companies;

public class CompanyService : ICompanyService
{
    private readonly ICompanyRepository _repository;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<CompanyService> _logger;
    private readonly IBackgroundEmailQueue _backgroundEmailQueue;

    public CompanyService(
        ICompanyRepository repository,
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        ILogger<CompanyService> logger,
        IBackgroundEmailQueue backgroundEmailQueue)
    {
        _repository = repository;
        _context = context;
        _userManager = userManager;
        _logger = logger;
        _backgroundEmailQueue = backgroundEmailQueue;
    }

    public async Task<CompanyDto> AddCompanyAsync(CreateCompanyDto dto)
    {
        try
        {
            var existing = await _context.Companies
                .AsNoTracking()
                .FirstOrDefaultAsync(c => 
                    (dto.VatNumber != null && c.VatNumber == dto.VatNumber) || 
                    (dto.Bulstat != null && c.Bulstat == dto.Bulstat));

            if (existing != null)
            {
                throw new InvalidOperationException("A company with the same VAT number or Bulstat already exists.");
            }

            if (!Enum.TryParse<CompanyType>(dto.CompanyType, out var companyType))
            {
                throw new InvalidOperationException("Invalid company type");
            }

            var subscriptionPlan = string.IsNullOrEmpty(dto.SubscriptionPlan) 
                ? SubscriptionPlan.FreeTrial 
                : Enum.Parse<SubscriptionPlan>(dto.SubscriptionPlan);

            var company = new Company
            {
                CompanyName = dto.CompanyName,
                CompanyType = companyType,
                Bulstat = dto.Bulstat,
                VatNumber = dto.VatNumber,
                IsVatRegistered = dto.IsVatRegistered,
                Address = dto.Address,
                City = dto.City,
                PostalCode = dto.PostalCode,
                Phone = dto.Phone,
                Email = dto.Email,
                IsCompanyOwner = dto.IsCompanyOwner,
                WarrantyDefaultMonths = dto.WarrantyDefaultMonths ?? 12,
                SubscriptionPlan = subscriptionPlan,
                IsSubscriptionActive = true,
                IsActive = true
            };

            await _repository.AddCompanyAsync(company);
            
            return ToDto(company);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdateCompanyAsync(Guid companyId, UpdateCompanyDto dto)
    {
        try
        {
            var company = await _repository.GetByIdAsync(companyId);
            if (company == null)
            {
                throw new NotFoundException("Company not found");
            }

            if (!Enum.TryParse<CompanyType>(dto.CompanyType, out var companyType))
            {
                throw new InvalidOperationException("Invalid company type");
            }

            company.CompanyName = dto.CompanyName;
            company.CompanyType = companyType;
            company.Bulstat = dto.Bulstat;
            company.VatNumber = dto.VatNumber;
            company.IsVatRegistered = dto.IsVatRegistered;
            company.Address = dto.Address;
            company.City = dto.City;
            company.PostalCode = dto.PostalCode;
            company.Phone = dto.Phone;
            company.Email = dto.Email;
            company.WarrantyDefaultMonths = dto.WarrantyDefaultMonths;
            company.IsActive = dto.IsActive;

            await _repository.UpdateCompanyAsync(company);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task DeleteCompanyAsync(Guid companyId)
    {
        try
        {
            var company = await _repository.GetByIdAsync(companyId);
            if (company != null)
            {
                var companyEmail = company.Email;
                var companyName = company.CompanyName;

                await _repository.DeleteCompanyAsync(company);

                // Queue deletion confirmation email (non-blocking)
                if (!string.IsNullOrEmpty(companyEmail))
                {
                    var delEmail = companyEmail;
                    var delName = companyName;
                    _backgroundEmailQueue.QueueEmail(async sp =>
                    {
                        var emailService = sp.GetRequiredService<IEmailService>();
                        await emailService.SendAccountDeletionConfirmationEmailAsync(delEmail, delName);
                    });
                }
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<CompanyDto?> GetByIdAsync(Guid companyId)
    {
        try
        {
            var company = await _repository.GetByIdWithUsersAsync(companyId);
            return company == null ? null : ToDto(company);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<CompanyDto>> GetAllAsync(PageParameters pageParameters)
    {
        try
        {
            var query = _context.Companies
                .AsNoTracking()
                .Include(c => c.Users)
                .Select(c => new CompanyDto
                {
                    Id = c.Id.ToString(),
                    CompanyName = c.CompanyName,
                    CompanyType = c.CompanyType.ToString(),
                    Bulstat = c.Bulstat,
                    VatNumber = c.VatNumber,
                    IsVatRegistered = c.IsVatRegistered,
                    Address = c.Address,
                    City = c.City,
                    PostalCode = c.PostalCode,
                    Phone = c.Phone,
                    Email = c.Email,
                    IsCompanyOwner = c.IsCompanyOwner,
                    WarrantyDefaultMonths = c.WarrantyDefaultMonths,
                    SubscriptionPlan = c.SubscriptionPlan.ToString(),
                    IsSubscriptionActive = c.IsSubscriptionActive,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    UsersCount = c.Users.Count
                });
        
            return await PagedList<CompanyDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<PagedList<CompanyDto>> GetActiveCompaniesAsync(PageParameters pageParameters)
    {
        try
        {
            var query = _context.Companies
                .AsNoTracking()
                .Include(c => c.Users)
                .Where(c => c.IsActive == true)
                .Select(c => new CompanyDto
                {
                    Id = c.Id.ToString(),
                    CompanyName = c.CompanyName,
                    CompanyType = c.CompanyType.ToString(),
                    Bulstat = c.Bulstat,
                    VatNumber = c.VatNumber,
                    IsVatRegistered = c.IsVatRegistered,
                    Address = c.Address,
                    City = c.City,
                    PostalCode = c.PostalCode,
                    Phone = c.Phone,
                    Email = c.Email,
                    IsCompanyOwner = c.IsCompanyOwner,
                    WarrantyDefaultMonths = c.WarrantyDefaultMonths,
                    SubscriptionPlan = c.SubscriptionPlan.ToString(),
                    IsSubscriptionActive = c.IsSubscriptionActive,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    UsersCount = c.Users.Count
                });
        
            return await PagedList<CompanyDto>.CreateAsync(query, pageParameters);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<CompanyDto?> GetByBulstatAsync(string bulstat)
    {
        try
        {
            var company = await _repository.GetByBulstatAsync(bulstat);
            return company == null ? null : ToDto(company);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<UserDto> CreateCompanyUserAsync(Guid companyId, CreateCompanyUserDto dto)
    {
        try
        {
            var company = await _repository.GetByIdAsync(companyId);
            if (company == null)
            {
                throw new NotFoundException("Company not found");
            }

            if (company.IsSubscriptionActive != true)
            {
                throw new InvalidOperationException("Company subscription is not active. Cannot create new users.");
            }

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                MiddleName = dto.MiddleName ?? string.Empty,
                LastName = dto.LastName,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address ?? string.Empty,
                CompanyId = companyId,
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            return ToUserDto(user);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<UserDto>> GetCompanyUsersAsync(Guid companyId)
    {
        try
        {
            var users = await _repository.GetCompanyUsersAsync(companyId);
            return users.Select(u => ToUserDto(u));
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdateSubscriptionAsync(Guid companyId, UpdateSubscriptionDto dto)
    {
        try
        {
            var company = await _repository.GetByIdAsync(companyId);
            if (company == null)
            {
                throw new NotFoundException("Company not found");
            }

            if (!Enum.TryParse<SubscriptionPlan>(dto.SubscriptionPlan, out var subscriptionPlan))
            {
                throw new InvalidOperationException("Invalid subscription plan");
            }

            company.SubscriptionPlan = subscriptionPlan;
            company.IsSubscriptionActive = dto.IsSubscriptionActive;

            await _repository.UpdateCompanyAsync(company);

            if (dto.IsSubscriptionActive)
            {
                await RenewSubscriptionForAllUsersAsync(companyId);
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task RenewSubscriptionForAllUsersAsync(Guid companyId)
    {
        try
        {
            var company = await _repository.GetByIdWithUsersAsync(companyId);
            if (company == null)
            {
                throw new NotFoundException("Company not found");
            }

            company.IsSubscriptionActive = true;
            await _repository.UpdateCompanyAsync(company);

            _logger.LogInformation($"Subscription renewed for company {companyId} and all {company.Users.Count} users");
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task CheckAndExpireTrialSubscriptionsAsync()
    {
        try
        {
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);

            var updatedCount = await _context.Companies
                .Where(c => c.SubscriptionPlan == SubscriptionPlan.FreeTrial
                         && c.IsSubscriptionActive == true
                         && c.CreatedAt <= sixMonthsAgo)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(c => c.IsSubscriptionActive, false)
                    .SetProperty(c => c.UpdatedAt, DateTime.UtcNow));

            if (updatedCount > 0)
                _logger.LogInformation("Expired {Count} trial subscription(s)", updatedCount);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    private static CompanyDto ToDto(Company company)
    {
        return new CompanyDto
        {
            Id = company.Id.ToString(),
            CompanyName = company.CompanyName,
            CompanyType = company.CompanyType.ToString(),
            Bulstat = company.Bulstat,
            VatNumber = company.VatNumber,
            IsVatRegistered = company.IsVatRegistered,
            Address = company.Address,
            City = company.City,
            PostalCode = company.PostalCode,
            Phone = company.Phone,
            Email = company.Email,
            IsCompanyOwner = company.IsCompanyOwner,
            WarrantyDefaultMonths = company.WarrantyDefaultMonths,
            SubscriptionPlan = company.SubscriptionPlan.ToString(),
            IsSubscriptionActive = company.IsSubscriptionActive,
            IsActive = company.IsActive,
            CreatedAt = company.CreatedAt,
            UpdatedAt = company.UpdatedAt,
            UsersCount = company.Users?.Count ?? 0
        };
    }

    private static UserDto ToUserDto(ApplicationUser user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            MiddleName = user.MiddleName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            Address = user.Address,
            CompanyId = user.CompanyId.ToString()
        };
    }
}
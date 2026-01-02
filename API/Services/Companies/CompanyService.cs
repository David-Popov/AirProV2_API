using API.Common;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Models;
using API.Repositories;
using API.Repositories.Companies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Services.Companies;

public class CompanyService : ICompanyService
{
    private readonly ICompanyRepository _repository;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<CompanyService> _logger;

    public CompanyService(
        ICompanyRepository repository,
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        ILogger<CompanyService> logger)
    {
        _repository = repository;
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<CompanyDto> AddCompanyAsync(CreateCompanyDto dto)
    {
        try
        {
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
                throw new InvalidOperationException("Company not found");
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
                await _repository.DeleteCompanyAsync(company);
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
                throw new InvalidOperationException("Company not found");
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
                throw new InvalidOperationException("Company not found");
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
                throw new InvalidOperationException("Company not found");
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
            var companies = await _context.Companies
                .Where(c => c.SubscriptionPlan == SubscriptionPlan.FreeTrial && c.IsSubscriptionActive == true)
                .ToListAsync();

            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);

            foreach (var company in companies)
            {
                if (company.CreatedAt <= sixMonthsAgo)
                {
                    company.IsSubscriptionActive = false;
                    _context.Companies.Update(company);
                    
                    _logger.LogInformation($"Expired trial subscription for company {company.Id} - {company.CompanyName}");
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
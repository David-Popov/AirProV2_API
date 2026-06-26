using ValidationException = FluentValidation.ValidationException;
using API.Common;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Models;
using API.Repositories;
using API.Repositories.Companies;
using API.Services.Email;
using API.Services.Subscriptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Mapster;

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
                throw new ValidationException("A company with the same VAT number or Bulstat already exists.");
            }

            if (!Enum.TryParse<CompanyType>(dto.CompanyType, out var companyType))
            {
                throw new ValidationException("Invalid company type");
            }

            var subscriptionPlan = string.IsNullOrEmpty(dto.SubscriptionPlan)
                ? SubscriptionPlan.Free
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
                SubscriptionPlan = subscriptionPlan,
                SubscriptionStatus = SubscriptionStatus.Active,
                IsSubscriptionActive = true,
                IsActive = true
            };

            await _repository.AddCompanyAsync(company);

            return company.Adapt<CompanyDto>();
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
                throw new ValidationException("Invalid company type");
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
            return await _context.Companies
                .AsNoTracking()
                .Where(c => c.Id == companyId)
                .ProjectToType<CompanyDto>()
                .FirstOrDefaultAsync();
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
                .ProjectToType<CompanyDto>();

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
                .Where(c => c.IsActive == true)
                .ProjectToType<CompanyDto>();

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
            return await _context.Companies
                .AsNoTracking()
                .Where(c => c.Bulstat == bulstat)
                .ProjectToType<CompanyDto>()
                .FirstOrDefaultAsync();
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
                throw new ValidationException("Company subscription is not active. Cannot create new users.");
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
                throw new ValidationException($"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            return user.Adapt<UserDto>();
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
            return users.Adapt<IEnumerable<UserDto>>();
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
            if (!Enum.TryParse<SubscriptionPlan>(dto.SubscriptionPlan, ignoreCase: true, out var subscriptionPlan))
            {
                throw new ValidationException("Invalid subscription plan");
            }

            var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == companyId);
            if (company == null)
            {
                throw new NotFoundException("Company not found");
            }

            var oldPlan = company.SubscriptionPlan;

            await using var transaction = await _context.Database.BeginTransactionAsync();

            company.SubscriptionPlan = subscriptionPlan;
            company.IsSubscriptionActive = dto.IsSubscriptionActive;

            if (!string.IsNullOrWhiteSpace(dto.SubscriptionStatus))
            {
                if (!Enum.TryParse<SubscriptionStatus>(dto.SubscriptionStatus, ignoreCase: true, out var subscriptionStatus))
                {
                    throw new ValidationException("Invalid subscription status");
                }
                company.SubscriptionStatus = subscriptionStatus;
            }

            company.UpdatedAt = DateTime.UtcNow;

            var deactivatedCount = 0;
            if (oldPlan == SubscriptionPlan.Premium && subscriptionPlan == SubscriptionPlan.Free)
            {
                deactivatedCount = await SubscriptionEmployeeManager.DeactivateExcessEmployeesAsync(
                    _context, companyId, SubscriptionLimits.GetMaxEmployees(SubscriptionPlan.Free));
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            if (deactivatedCount > 0)
            {
                _logger.LogInformation(
                    "Company {CompanyId} downgraded Premium -> Free. Deactivated {Count} employee(s) to fit the Free limit.",
                    companyId, deactivatedCount);
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

}
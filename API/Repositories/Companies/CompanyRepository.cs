using API.Data;
using API.Data.Entities;
using API.Repositories.Companies;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

public class CompanyRepository : ICompanyRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CompanyRepository> _logger;
    
    public CompanyRepository(ApplicationDbContext context, ILogger<CompanyRepository> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    public async Task AddCompanyAsync(Company company)
    {
        try
        {
            await _context.Companies.AddAsync(company);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task UpdateCompanyAsync(Company company)
    {
        try
        {
            _context.Companies.Update(company);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task DeleteCompanyAsync(Company company)
    {
        try
        {
            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<Company?> GetByIdAsync(Guid companyId)
    {
        try
        {
            return await _context.Companies.FirstOrDefaultAsync(c => c.Id == companyId);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<Company?> GetByIdWithUsersAsync(Guid companyId)
    {
        try
        {
            return await _context.Companies
                .Include(c => c.Users)
                .FirstOrDefaultAsync(c => c.Id == companyId);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<Company>> GetAllAsync()
    {
        try
        {
            return await _context.Companies.ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<Company>> GetActiveCompaniesAsync()
    {
        try
        {
            return await _context.Companies
                .Where(c => c.IsActive == true)
                .ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<Company?> GetByBulstatAsync(string bulstat)
    {
        try
        {
            return await _context.Companies
                .FirstOrDefaultAsync(c => c.Bulstat == bulstat);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IEnumerable<ApplicationUser>> GetCompanyUsersAsync(Guid companyId)
    {
        try
        {
            return await _context.Users
                .Where(u => u.CompanyId == companyId)
                .ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<bool> HasActiveSubscriptionAsync(Guid companyId)
    {
        try
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.Id == companyId);
            
            return company?.IsSubscriptionActive == true;
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }
}
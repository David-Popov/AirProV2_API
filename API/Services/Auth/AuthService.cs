using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.Services.Auth;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("A user with this email already exists");
            }

            // Create company first
            var company = new Company
            {
                CompanyName = dto.CompanyName,
                CompanyType = Enum.TryParse(dto.CompanyType, true, out CompanyType companyType) 
                    ? companyType 
                    : CompanyType.SoleProprietorship,
                Bulstat = dto.Bulstat,
                VatNumber = dto.VatNumber,
                IsVatRegistered = dto.IsVatRegistered ?? false,
                Address = dto.CompanyAddress,
                City = dto.CompanyCity,
                PostalCode = dto.CompanyPostalCode,
                Phone = dto.CompanyPhone,
                Email = dto.CompanyEmail,
                IsCompanyOwner = true, // User registering is the company owner
                WarrantyDefaultMonths = dto.WarrantyDefaultMonths ?? 12,
                SubscriptionPlan = SubscriptionPlan.FreeTrial,
                SubscriptionStatus = SubscriptionStatus.Trial,
                TrialStartDate = DateTime.UtcNow,
                TrialEndDate = DateTime.UtcNow.AddMonths(3),
                IsSubscriptionActive = true,
                IsActive = true
            };

            await _context.Companies.AddAsync(company);
            await _context.SaveChangesAsync();

            // Create user
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                MiddleName = dto.MiddleName ?? string.Empty,
                LastName = dto.LastName,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address ?? string.Empty,
                CompanyId = company.Id,
                EmailConfirmed = true // For simplicity, auto-confirm email
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to create user: {errors}");
            }

            // Add Manager role - user who self-registers is the company owner/manager
            // They can later add employees with "User" role
            await _userManager.AddToRoleAsync(user, "Manager");

            await transaction.CommitAsync();

            // Generate JWT token
            var token = await GenerateJwtTokenAsync(user);
            var tokenExpiration = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes());

            // Get roles
            var roles = await _userManager.GetRolesAsync(user);

            return new AuthResponseDto
            {
                Token = token,
                TokenExpiration = tokenExpiration,
                User = new AuthUserDto
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FirstName = user.FirstName,
                    MiddleName = user.MiddleName,
                    LastName = user.LastName,
                    FullName = $"{user.FirstName} {user.LastName}".Trim(),
                    PhoneNumber = user.PhoneNumber,
                    CompanyId = company.Id,
                    CompanyName = company.CompanyName,
                    SubscriptionPlan = company.SubscriptionPlan.ToString(),
                    SubscriptionStatus = company.SubscriptionStatus.ToString(),
                    TrialEndDate = company.TrialEndDate,
                    Roles = roles.ToList()
                }
            };
        }
        catch (Exception e)
        {
            await transaction.RollbackAsync();
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                throw new InvalidOperationException("Invalid email or password");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: false);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException("Invalid email or password");
            }

            // Load company
            var company = user.CompanyId.HasValue 
                ? await _context.Companies.FindAsync(user.CompanyId.Value)
                : null;

            // Generate JWT token
            var token = await GenerateJwtTokenAsync(user);
            var tokenExpiration = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes());

            // Get roles
            var roles = await _userManager.GetRolesAsync(user);

            return new AuthResponseDto
            {
                Token = token,
                TokenExpiration = tokenExpiration,
                User = new AuthUserDto
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FirstName = user.FirstName,
                    MiddleName = user.MiddleName,
                    LastName = user.LastName,
                    FullName = $"{user.FirstName} {user.LastName}".Trim(),
                    PhoneNumber = user.PhoneNumber,
                    CompanyId = user.CompanyId,
                    CompanyName = company?.CompanyName,
                    SubscriptionPlan = company?.SubscriptionPlan.ToString(),
                    SubscriptionStatus = company?.SubscriptionStatus.ToString(),
                    TrialEndDate = company?.TrialEndDate,
                    Roles = roles.ToList()
                }
            };
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<AuthUserDto?> GetCurrentUserAsync(string userId)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            // Load company
            var company = user.CompanyId.HasValue 
                ? await _context.Companies.FindAsync(user.CompanyId.Value)
                : null;

            // Get roles
            var roles = await _userManager.GetRolesAsync(user);

            return new AuthUserDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                MiddleName = user.MiddleName,
                LastName = user.LastName,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                PhoneNumber = user.PhoneNumber,
                CompanyId = user.CompanyId,
                CompanyName = company?.CompanyName,
                SubscriptionPlan = company?.SubscriptionPlan.ToString(),
                SubscriptionStatus = company?.SubscriptionStatus.ToString(),
                TrialEndDate = company?.TrialEndDate,
                Roles = roles.ToList()
            };
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<bool> UserExistsAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        return user != null;
    }

    private async Task<string> GenerateJwtTokenAsync(ApplicationUser user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = jwtSettings["Issuer"] ?? "AirProV2API";
        var audience = jwtSettings["Audience"] ?? "AirProV2Client";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var roles = await _userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.Email!),
            new("first_name", user.FirstName),
            new("last_name", user.LastName),
            new("full_name", $"{user.FirstName} {user.LastName}".Trim())
        };

        // Add company claim if exists
        if (user.CompanyId.HasValue)
        {
            claims.Add(new Claim("company_id", user.CompanyId.Value.ToString()));
        }

        // Add role claims
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes()),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private int GetTokenExpirationMinutes()
    {
        var expirationStr = _configuration.GetSection("JwtSettings")["ExpirationInMinutes"];
        return int.TryParse(expirationStr, out var expiration) ? expiration : 1440; // Default 24 hours
    }

    // Employee Management Methods

    public async Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto, Guid companyId)
    {
        try
        {
            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("A user with this email already exists");
            }

            // Verify company exists
            var company = await _context.Companies.FindAsync(companyId);
            if (company == null)
            {
                throw new InvalidOperationException("Company not found");
            }

            // Create employee user
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
                EmailConfirmed = true // Auto-confirm for employees created by manager
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to create employee: {errors}");
            }

            // Add User role (employees are Users, not Managers)
            await _userManager.AddToRoleAsync(user, "User");

            var roles = await _userManager.GetRolesAsync(user);

            return new EmployeeDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                MiddleName = user.MiddleName,
                LastName = user.LastName,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                Roles = roles.ToList(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<List<EmployeeDto>> GetEmployeesByCompanyIdAsync(Guid companyId)
    {
        try
        {
            var users = await _context.Users
                .Where(u => u.CompanyId == companyId)
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .ToListAsync();

            var employeeDtos = new List<EmployeeDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                employeeDtos.Add(new EmployeeDto
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FirstName = user.FirstName,
                    MiddleName = user.MiddleName,
                    LastName = user.LastName,
                    FullName = $"{user.FirstName} {user.LastName}".Trim(),
                    PhoneNumber = user.PhoneNumber,
                    Address = user.Address,
                    Roles = roles.ToList(),
                    IsActive = user.LockoutEnd == null || user.LockoutEnd < DateTimeOffset.UtcNow,
                    CreatedAt = null // Identity doesn't track creation date by default
                });
            }

            return employeeDtos;
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<EmployeeDto?> GetEmployeeByIdAsync(string employeeId, Guid companyId)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(employeeId);
            if (user == null || user.CompanyId != companyId)
            {
                return null;
            }

            var roles = await _userManager.GetRolesAsync(user);

            return new EmployeeDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                MiddleName = user.MiddleName,
                LastName = user.LastName,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                Roles = roles.ToList(),
                IsActive = user.LockoutEnd == null || user.LockoutEnd < DateTimeOffset.UtcNow,
                CreatedAt = null
            };
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task DeleteEmployeeAsync(string employeeId, Guid companyId)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(employeeId);
            if (user == null || user.CompanyId != companyId)
            {
                throw new InvalidOperationException("Employee not found");
            }

            // Check if trying to delete a Manager
            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Contains("Manager"))
            {
                throw new InvalidOperationException("Cannot delete a Manager. Transfer ownership first.");
            }

            await _userManager.DeleteAsync(user);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<EmployeeDto> UpdateEmployeeAsync(string employeeId, CreateEmployeeDto dto, Guid companyId)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(employeeId);
            if (user == null || user.CompanyId != companyId)
            {
                throw new InvalidOperationException("Employee not found");
            }

            // Check if email is being changed and if new email already exists
            if (user.Email != dto.Email)
            {
                var existingUser = await _userManager.FindByEmailAsync(dto.Email);
                if (existingUser != null)
                {
                    throw new InvalidOperationException("A user with this email already exists");
                }
                user.Email = dto.Email;
                user.UserName = dto.Email;
            }

            user.FirstName = dto.FirstName;
            user.MiddleName = dto.MiddleName ?? string.Empty;
            user.LastName = dto.LastName;
            user.PhoneNumber = dto.PhoneNumber;
            user.Address = dto.Address ?? string.Empty;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to update employee: {errors}");
            }

            // Update password if provided
            if (!string.IsNullOrEmpty(dto.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var passwordResult = await _userManager.ResetPasswordAsync(user, token, dto.Password);
                if (!passwordResult.Succeeded)
                {
                    var errors = string.Join(", ", passwordResult.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Failed to update password: {errors}");
                }
            }

            var roles = await _userManager.GetRolesAsync(user);

            return new EmployeeDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                MiddleName = user.MiddleName,
                LastName = user.LastName,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                Roles = roles.ToList(),
                IsActive = user.LockoutEnd == null || user.LockoutEnd < DateTimeOffset.UtcNow,
                CreatedAt = null
            };
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }
}

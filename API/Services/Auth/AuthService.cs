using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.DTOs.Auth;
using API.Models;
using API.Services.Email;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.WebUtilities;
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
    private readonly IBackgroundEmailQueue _backgroundEmailQueue;
    private readonly EmailSettings _emailSettings;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<AuthService> logger,
        IBackgroundEmailQueue backgroundEmailQueue,
        IOptions<EmailSettings> emailSettings)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _configuration = configuration;
        _logger = logger;
        _backgroundEmailQueue = backgroundEmailQueue;
        _emailSettings = emailSettings.Value;
    }

    public async Task RegisterAsync(RegisterDto dto)
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
                SubscriptionPlan = SubscriptionPlan.Free,  // Start with Free plan (2 employees)
                SubscriptionStatus = SubscriptionStatus.Active,  // Free plan is active by default
                TrialStartDate = null,  // No trial yet
                TrialEndDate = null,    // No trial yet
                HasUsedTrial = false,   // Trial not used yet
                IsSubscriptionActive = true,
                IsActive = true
            };

            await _context.Companies.AddAsync(company);
            await _context.SaveChangesAsync();

            // Create user — email must be confirmed before login
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
                EmailConfirmed = false
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

            // Queue email confirmation email (non-blocking)
            var confirmToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(confirmToken));
            var confirmLink = $"{_emailSettings.WebsiteUrl}/confirm-email?userId={user.Id}&token={encodedToken}";

            var confirmUser = user;
            _backgroundEmailQueue.QueueEmail(async sp =>
            {
                var emailService = sp.GetRequiredService<IEmailService>();
                await emailService.SendEmailConfirmationAsync(
                    confirmUser.Email!,
                    $"{confirmUser.FirstName} {confirmUser.LastName}",
                    confirmLink);
            });
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

            if (!user.EmailConfirmed)
            {
                throw new InvalidOperationException("Please confirm your email address before logging in.");
            }

            if (!user.IsActive)
            {
                throw new InvalidOperationException("Your account has been deactivated. Please contact your manager.");
            }

            var company = user.CompanyId.HasValue 
                ? await _context.Companies.FindAsync(user.CompanyId.Value)
                : null;

            var token = await GenerateJwtTokenAsync(user);
            var tokenExpiration = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes());
            
            var refreshToken = await GenerateRefreshTokenAsync(user, token.Id);

            var roles = await _userManager.GetRolesAsync(user);

            return new AuthResponseDto
            {
                Token = token.Token,
                RefreshToken = refreshToken.Token,
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

            var company = user.CompanyId.HasValue 
                ? await _context.Companies.FindAsync(user.CompanyId.Value)
                : null;

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

    public async Task<AuthUserDto> UpdateProfileAsync(string userId, UpdateProfileDto dto)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            // Email changes are handled through the dedicated change-email flow

            user.FirstName = dto.FirstName;
            user.MiddleName = dto.MiddleName ?? string.Empty;
            user.LastName = dto.LastName;
            user.PhoneNumber = dto.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to update profile: {errors}");
            }

            var company = user.CompanyId.HasValue 
                ? await _context.Companies.FindAsync(user.CompanyId.Value)
                : null;

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

    public async Task<AuthResponseDto> RefreshTokenAsync(string token, string refreshToken)
    {
        var principal = GetPrincipalFromExpiredToken(token);
        if (principal == null)
        {
            throw new InvalidOperationException("Invalid token");
        }

        var expiryDateUnix = long.Parse(principal.Claims.Single(x => x.Type == JwtRegisteredClaimNames.Exp).Value);
        var expiryDateTimeUtc = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            .AddSeconds(expiryDateUnix);

        if (expiryDateTimeUtc > DateTime.UtcNow)
        {
           // throw new InvalidOperationException("This token has not expired yet");
        }

        var jti = principal.Claims.Single(x => x.Type == JwtRegisteredClaimNames.Jti).Value;
        
        var storedRefreshToken = await _context.RefreshTokens
            .Include(x => x.ApplicationUser)
            .SingleOrDefaultAsync(x => x.Token == refreshToken);

        if (storedRefreshToken == null)
        {
            throw new InvalidOperationException("Refresh token does not exist");
        }

        if (DateTime.UtcNow > storedRefreshToken.ExpiryDate)
        {
            throw new InvalidOperationException("Refresh token has expired");
        }

        if (storedRefreshToken.Invalidated)
        {
            throw new InvalidOperationException("Refresh token has been invalidated");
        }

        if (storedRefreshToken.Used)
        {
            throw new InvalidOperationException("Refresh token has been used");
        }

        if (storedRefreshToken.JwtId != jti)
        {
            throw new InvalidOperationException("Refresh token does not match this JWT");
        }

        storedRefreshToken.Used = true;
        _context.RefreshTokens.Update(storedRefreshToken);
        await _context.SaveChangesAsync();

        var user = await _userManager.FindByIdAsync(storedRefreshToken.UserId);
        if (user == null)
        {
             throw new InvalidOperationException("User not found");
        }

        var newToken = await GenerateJwtTokenAsync(user);
        var newRefreshToken = await GenerateRefreshTokenAsync(user, newToken.Id);
        
        // Return roles and other info
        var roles = await _userManager.GetRolesAsync(user);
        
        // Load company again to populate DTO
        var company = user.CompanyId.HasValue 
            ? await _context.Companies.FindAsync(user.CompanyId.Value)
            : null;

        return new AuthResponseDto
        {
            Token = newToken.Token,
            RefreshToken = newRefreshToken.Token,
            TokenExpiration = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes()),
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

    private async Task<RefreshToken> GenerateRefreshTokenAsync(ApplicationUser user, string jti)
    {
        var refreshToken = new RefreshToken
        {
            Token = Guid.NewGuid().ToString(),
            JwtId = jti,
            UserId = user.Id,
            CreationDate = DateTime.UtcNow,
            ExpiryDate = DateTime.UtcNow.AddMonths(6)
        };

        await _context.RefreshTokens.AddAsync(refreshToken);
        await _context.SaveChangesAsync();

        return refreshToken;
    }
    
    private ClaimsPrincipal? GetPrincipalFromExpiredToken(string? token)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateLifetime = false
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
        
        if (securityToken is not JwtSecurityToken jwtSecurityToken || 
            !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
        {
            throw new SecurityTokenException("Invalid token");
        }

        return principal;
    }

    private async Task<(string Token, string Id)> GenerateJwtTokenAsync(ApplicationUser user)
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

        return (new JwtSecurityTokenHandler().WriteToken(token), claims.First(c => c.Type == JwtRegisteredClaimNames.Jti).Value);
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
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("A user with this email already exists");
            }

            var company = await _context.Companies.FindAsync(companyId);
            if (company == null)
            {
                throw new InvalidOperationException("Company not found");
            }

            var currentEmployeeCount = await GetActiveEmployeeCountAsync(companyId);
            var maxEmployees = SubscriptionLimits.GetMaxEmployees(company.SubscriptionPlan);

            if (currentEmployeeCount >= maxEmployees)
            {
                // Queue employee limit notification (non-blocking)
                var limitCompany = company;
                var limitCount = currentEmployeeCount;
                var limitMax = maxEmployees;
                _backgroundEmailQueue.QueueEmail(async sp =>
                {
                    var emailService = sp.GetRequiredService<IEmailService>();
                    await emailService.SendEmployeeLimitReachedEmailAsync(limitCompany, limitCount, limitMax);
                });

                throw new InvalidOperationException(
                    $"Employee limit reached. Your current plan allows {maxEmployees} employees. " +
                    $"Please upgrade your subscription to add more employees.");
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
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to create employee: {errors}");
            }

            await _userManager.AddToRoleAsync(user, "User");

            // Queue welcome email to new employee (non-blocking)
            var empUser = user;
            var empCompany = company;
            var empPassword = dto.Password;
            _backgroundEmailQueue.QueueEmail(async sp =>
            {
                var emailService = sp.GetRequiredService<IEmailService>();
                await emailService.SendNewEmployeeWelcomeEmailAsync(empUser, empCompany, empPassword);
            });

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

            // Batch-load all user roles in a single query to avoid N+1
            var userIds = users.Select(u => u.Id).ToList();
            var roleMap = await _context.UserRoles
                .Where(ur => userIds.Contains(ur.UserId))
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, r.Name })
                .GroupBy(x => x.UserId)
                .ToDictionaryAsync(g => g.Key, g => g.Select(x => x.Name).ToList());

            var employeeDtos = users.Select(user => new EmployeeDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                MiddleName = user.MiddleName,
                LastName = user.LastName,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                Roles = roleMap.TryGetValue(user.Id, out var roles) ? roles : [],
                IsActive = user.IsActive,
                CreatedAt = null // Identity doesn't track creation date by default
            }).ToList();

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
                IsActive = user.IsActive,
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

            if (await IsManagerAsync(employeeId))
            {
                throw new InvalidOperationException("Cannot delete a Manager. Transfer ownership first.");
            }

            user.FirstName = "DELETED_USER";
            user.MiddleName = string.Empty;
            user.LastName = string.Empty;
            user.Email = $"deleted_{user.Id}@deleted.local";
            user.NormalizedEmail = user.Email.ToUpperInvariant();
            user.UserName = $"deleted_{user.Id}";
            user.NormalizedUserName = user.UserName.ToUpperInvariant();
            user.PhoneNumber = null;
            user.Address = string.Empty;
            user.IsActive = false;
            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;

            await _userManager.UpdateAsync(user);
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
                IsActive = user.IsActive,
                CreatedAt = null
            };
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<IList<string>> GetUserRolesAsync(string userId)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            return await _userManager.GetRolesAsync(user);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<int> GetActiveEmployeeCountAsync(Guid companyId)
    {
        try
        {
            var count = await (
                from u in _context.Users
                join ur in _context.UserRoles on u.Id equals ur.UserId
                join r in _context.Roles on ur.RoleId equals r.Id
                where u.CompanyId == companyId
                    && u.IsActive
                    && r.Name == "User"
                select u
            ).CountAsync();

            return count;
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    public async Task<bool> IsManagerAsync(string userId)
    {
        try
        {
            var roles = await GetUserRolesAsync(userId);
            return roles.Contains("Manager");
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            throw;
        }
    }

    // Email confirmation & password management

    public async Task<IdentityResult> ConfirmEmailAsync(string userId, string token)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return IdentityResult.Failed(new IdentityError { Description = "Invalid confirmation link." });
        }

        var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
        return await _userManager.ConfirmEmailAsync(user, decodedToken);
    }

    public async Task ResendConfirmationEmailAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null || user.EmailConfirmed)
        {
            return; // Silent — no user enumeration
        }

        var confirmToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(confirmToken));
        var confirmLink = $"{_emailSettings.WebsiteUrl}/confirm-email?userId={user.Id}&token={encodedToken}";

        var userName = $"{user.FirstName} {user.LastName}";
        var userEmail = user.Email!;
        _backgroundEmailQueue.QueueEmail(async sp =>
        {
            var emailService = sp.GetRequiredService<IEmailService>();
            await emailService.SendEmailConfirmationAsync(userEmail, userName, confirmLink);
        });
    }

    public async Task ForgotPasswordAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null || !user.EmailConfirmed)
        {
            return; // Silent — no user enumeration
        }

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(resetToken));
        var encodedEmail = Uri.EscapeDataString(email);
        var resetLink = $"{_emailSettings.WebsiteUrl}/reset-password?email={encodedEmail}&token={encodedToken}";

        var userName = $"{user.FirstName} {user.LastName}";
        var userEmail = user.Email!;
        _backgroundEmailQueue.QueueEmail(async sp =>
        {
            var emailService = sp.GetRequiredService<IEmailService>();
            await emailService.SendPasswordResetEmailAsync(userEmail, userName, resetLink);
        });
    }

    public async Task<IdentityResult> ResetPasswordAsync(string email, string token, string newPassword)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return IdentityResult.Failed(new IdentityError { Description = "Invalid password reset link." });
        }

        var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
        return await _userManager.ResetPasswordAsync(user, decodedToken, newPassword);
    }

    public async Task<IdentityResult> ChangePasswordAsync(string userId, string newPassword)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return IdentityResult.Failed(new IdentityError { Description = "User not found." });
        }

        // Generate a reset token and use it to set the new password (ensures password validation)
        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        return await _userManager.ResetPasswordAsync(user, resetToken, newPassword);
    }

    public async Task RequestEmailChangeAsync(string userId, string newEmail)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        var existingUser = await _userManager.FindByEmailAsync(newEmail);
        if (existingUser != null)
        {
            throw new InvalidOperationException("A user with this email already exists.");
        }

        var changeToken = await _userManager.GenerateChangeEmailTokenAsync(user, newEmail);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(changeToken));
        var encodedEmail = Uri.EscapeDataString(newEmail);
        var confirmLink = $"{_emailSettings.WebsiteUrl}/confirm-email-change?userId={user.Id}&newEmail={encodedEmail}&token={encodedToken}";

        var userName = $"{user.FirstName} {user.LastName}";
        _backgroundEmailQueue.QueueEmail(async sp =>
        {
            var emailService = sp.GetRequiredService<IEmailService>();
            await emailService.SendEmailChangeConfirmationAsync(newEmail, userName, newEmail, confirmLink);
        });
    }

    public async Task<IdentityResult> ConfirmEmailChangeAsync(string userId, string newEmail, string token)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return IdentityResult.Failed(new IdentityError { Description = "Invalid email change link." });
        }

        var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
        var result = await _userManager.ChangeEmailAsync(user, newEmail, decodedToken);

        if (result.Succeeded)
        {
            // Keep UserName in sync with Email
            user.UserName = newEmail;
            await _userManager.UpdateNormalizedUserNameAsync(user);
        }

        return result;
    }
}

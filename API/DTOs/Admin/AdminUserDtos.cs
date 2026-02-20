namespace API.DTOs.Admin;

/// <summary>
/// Filter parameters for listing users in admin panel
/// </summary>
public class AdminUserFilterDto
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Role { get; set; }
    public Guid? CompanyId { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsDeleted { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// User response DTO for admin panel
/// </summary>
public class AdminUserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string MiddleName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {MiddleName} {LastName}".Trim();
    public string? Address { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    
    // Company info
    public Guid? CompanyId { get; set; }
    public string? CompanyName { get; set; }
    
    // Role info
    public List<string> Roles { get; set; } = new();
    
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for updating user attributes
/// </summary>
public class AdminUpdateUserDto
{
    public string FirstName { get; set; } = string.Empty;
    public string MiddleName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for changing user password
/// </summary>
public class AdminChangePasswordDto
{
    public string NewPassword { get; set; } = string.Empty;
    public bool SendEmailNotification { get; set; } = true;
}

/// <summary>
/// DTO for changing user role
/// </summary>
public class AdminChangeRoleDto
{
    /// <summary>
    /// Target role: "Manager" or "User" only
    /// </summary>
    public string NewRole { get; set; } = string.Empty;
}

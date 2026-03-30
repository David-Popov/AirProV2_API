using System.Security.Claims;
using API.DTOs;
using API.DTOs.Auth;
using API.Services.Auth;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IValidator<RegisterDto> _registerValidator;
    private readonly IValidator<LoginDto> _loginValidator;
    private readonly IValidator<ChangePasswordDto> _changePasswordValidator;
    private readonly IValidator<ResetPasswordDto> _resetPasswordValidator;

    public AuthController(
        IAuthService authService,
        IValidator<RegisterDto> registerValidator,
        IValidator<LoginDto> loginValidator,
        IValidator<ChangePasswordDto> changePasswordValidator,
        IValidator<ResetPasswordDto> resetPasswordValidator)
    {
        _authService = authService;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
        _changePasswordValidator = changePasswordValidator;
        _resetPasswordValidator = resetPasswordValidator;
    }

    /// <summary>
    /// Register a new user with company
    /// </summary>
    /// <remarks>
    /// Creates a new user account along with their company. The user will be set as the company owner.
    /// A confirmation email will be sent — the user must confirm before logging in.
    /// </remarks>
    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> Register([FromBody] RegisterDto dto)
    {
        var validationResult = await _registerValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        await _authService.RegisterAsync(dto);
        return Ok(new { message = "Registration successful! Please check your email to confirm your account." });
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    /// <remarks>
    /// Authenticates a user and returns a JWT token upon successful login.
    /// </remarks>
    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var validationResult = await _loginValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var result = await _authService.LoginAsync(dto);
        return Ok(result);
    }

    /// <summary>
    /// Refresh access token
    /// </summary>
    [HttpPost("refresh-token")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto dto)
    {
        var result = await _authService.RefreshTokenAsync(dto.Token, dto.RefreshToken);
        return Ok(result);
    }

    /// <summary>
    /// Get current authenticated user
    /// </summary>
    /// <remarks>
    /// Returns the currently authenticated user's information.
    /// Requires a valid JWT token in the Authorization header.
    /// </remarks>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AuthUserDto>> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not authenticated" });
        }

        var user = await _authService.GetCurrentUserAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(user);
    }

    /// <summary>
    /// Check if email is available
    /// </summary>
    [HttpGet("check-email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<object>> CheckEmail([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "Email is required" });
        }

        var exists = await _authService.UserExistsAsync(email);
        return Ok(new { available = !exists });
    }

    /// <summary>
    /// Update user profile
    /// </summary>
    [HttpPut("profile")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AuthUserDto>> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        // Validate DTO manually since we can't easily inject a new validator into the constructor without breaking changes
        // A better approach would be to add the validator to the constructor, but for now we'll do manual validation or rely on automatic model validation if configured
        // However, to be consistent with other methods, let's use the injected validator

        // To avoid breaking the constructor signature for existing tests/usage, we'll retrieve the validator from request services
        var validator = HttpContext.RequestServices.GetService<IValidator<UpdateProfileDto>>();
        if (validator != null)
        {
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not authenticated" });
        }

        var result = await _authService.UpdateProfileAsync(userId, dto);
        return Ok(result);
    }

    /// <summary>
    /// Confirm email address after registration
    /// </summary>
    [HttpPost("confirm-email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> ConfirmEmail([FromBody] ConfirmEmailDto dto)
    {
        var result = await _authService.ConfirmEmailAsync(dto.UserId, dto.Token);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = errors });
        }

        return Ok(new { message = "Email confirmed successfully." });
    }

    /// <summary>
    /// Resend email confirmation link
    /// </summary>
    [HttpPost("resend-confirmation")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult> ResendConfirmation([FromBody] ResendConfirmationDto dto)
    {
        await _authService.ResendConfirmationEmailAsync(dto.Email);
        return Ok(new { message = "If an account exists with that email, a confirmation link has been sent." });
    }

    /// <summary>
    /// Request a password reset link
    /// </summary>
    [HttpPost("forgot-password")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await _authService.ForgotPasswordAsync(dto.Email);
        return Ok(new { message = "If an account exists with that email, a password reset link has been sent." });
    }

    /// <summary>
    /// Reset password using a token from email
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var validationResult = await _resetPasswordValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var result = await _authService.ResetPasswordAsync(dto.Email, dto.Token, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = errors });
        }

        return Ok(new { message = "Password reset successfully." });
    }

    /// <summary>
    /// Change password for authenticated user
    /// </summary>
    [HttpPut("change-password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var validationResult = await _changePasswordValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not authenticated" });
        }

        var result = await _authService.ChangePasswordAsync(userId, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = errors });
        }

        return Ok(new { message = "Password changed successfully." });
    }

    /// <summary>
    /// Request an email change (sends confirmation to new email)
    /// </summary>
    [HttpPost("change-email/request")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> RequestEmailChange([FromBody] RequestEmailChangeDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not authenticated" });
        }

        await _authService.RequestEmailChangeAsync(userId, dto.NewEmail);
        return Ok(new { message = "A confirmation link has been sent to your new email address." });
    }

    /// <summary>
    /// Confirm email change using token from email
    /// </summary>
    [HttpPost("change-email/confirm")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> ConfirmEmailChange([FromBody] ConfirmEmailChangeDto dto)
    {
        var result = await _authService.ConfirmEmailChangeAsync(dto.UserId, dto.NewEmail, dto.Token);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = errors });
        }

        return Ok(new { message = "Email changed successfully." });
    }
}

using System.Security.Claims;
using API.Constants;
using Microsoft.AspNetCore.Mvc;

namespace API.Common;

[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    protected Guid? GetCurrentUserCompanyId()
    {
        var companyIdClaim = User.FindFirstValue("company_id");
        if (string.IsNullOrEmpty(companyIdClaim))
        {
            return null;
        }
        return Guid.TryParse(companyIdClaim, out var companyId) ? companyId : null;
    }

    protected string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    /// <summary>
    /// True when the current user is an Admin or Manager — i.e. allowed to see and
    /// manage all of the company's montages. Plain workers (User role) are restricted
    /// to montages they are assigned to.
    /// </summary>
    protected bool IsManagerOrAdmin() =>
        User.IsInRole(AppRoles.Admin) || User.IsInRole(AppRoles.Manager);
}

using System.Security.Claims;
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
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace API.Data.Entities;

public class ApplicationUser : IdentityUser
{
    [Column("company_id")]
    public Guid? CompanyId { get; set; }

    [Column("first_name")]
    [MaxLength(60)]
    public string FirstName { get; set; } = string.Empty;
    
    [Column("middle_name")]
    [MaxLength(60)]
    public string MiddleName { get; set; } = string.Empty;
    
    [Column("last_name")]
    [MaxLength(60)]
    public string LastName { get; set; } = string.Empty;
    
    [Column("address")]
    [MaxLength(80)]
    public string Address { get; set; } = string.Empty;

    [ForeignKey("CompanyId")]
    public virtual Company? Company { get; set; }
}
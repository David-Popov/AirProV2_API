using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Data.Entities;

public class RefreshToken
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("token")]
    [MaxLength(255)]
    public string Token { get; set; } = string.Empty;

    [Column("jwt_id")]
    [MaxLength(100)]
    public string JwtId { get; set; } = string.Empty;

    [Column("creation_date")]
    public DateTime CreationDate { get; set; }

    [Column("expiry_date")]
    public DateTime ExpiryDate { get; set; }

    [Column("used")]
    public bool Used { get; set; }

    [Column("invalidated")]
    public bool Invalidated { get; set; }

    [Column("user_id")]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey(nameof(UserId))]
    public virtual ApplicationUser? ApplicationUser { get; set; }
}

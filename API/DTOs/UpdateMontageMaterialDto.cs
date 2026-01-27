using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class UpdateMontageMaterialDto
{
    [Range(0.001, double.MaxValue, ErrorMessage = "Quantity must be greater than 0")]
    public decimal QuantityUsed { get; set; }
}

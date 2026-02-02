namespace API.DTOs;

/// <summary>
/// DTO for updating only the montage status
/// </summary>
public class UpdateMontageStatusDto
{
    public required string Status { get; set; }
}

namespace API.Models;

public class EmailSettings
{
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string SmtpUsername { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public bool UseSsl { get; set; } = true;

    public string SenderEmail { get; set; } = string.Empty;
    public string SenderName { get; set; } = "AirPro";

    public string CompanyLogoUrl { get; set; } = string.Empty;
    public string SupportEmail { get; set; } = string.Empty;
    public string WebsiteUrl { get; set; } = string.Empty;
}

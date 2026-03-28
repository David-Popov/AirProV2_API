namespace API.Models;

public class EmailSettings
{
    public string ApiToken   { get; set; } = string.Empty;
    public string ApiBaseUrl { get; set; } = "https://send.api.mailtrap.io";

    public string SenderEmail    { get; set; } = string.Empty;
    public string SenderName     { get; set; } = "AirPro";
    public string CompanyLogoUrl { get; set; } = string.Empty;
    public string SupportEmail   { get; set; } = string.Empty;
    public string WebsiteUrl     { get; set; } = string.Empty;
}

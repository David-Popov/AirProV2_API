namespace API.Models;

public class EmailSettings
{
    public string ApiToken   { get; set; } = string.Empty;
    public string ApiBaseUrl { get; set; } = "https://send.api.mailtrap.io";

    /// <summary>
    /// Mailtrap Sandbox inbox id. When set, emails are sent to the sandbox inbox
    /// (POST /api/send/{InboxId}) instead of being delivered live (POST /api/send).
    /// Leave empty in production for live sending.
    /// </summary>
    public string InboxId { get; set; } = string.Empty;

    public string SenderEmail    { get; set; } = string.Empty;
    public string SenderName     { get; set; } = "AirPro";
    public string CompanyLogoUrl { get; set; } = string.Empty;
    public string SupportEmail   { get; set; } = string.Empty;
    public string WebsiteUrl     { get; set; } = string.Empty;
}

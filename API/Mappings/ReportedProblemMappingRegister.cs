using API.Data.Entities;
using API.DTOs.ReportedProblems;
using Mapster;

namespace API.Mappings;

public class ReportedProblemMappingRegister : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<ReportedProblem, ReportedProblemDto>()
            .Map(d => d.UserName, s => s.User != null ? (s.User.FirstName + " " + s.User.LastName).Trim() : "Unknown")
            .Map(d => d.UserEmail, s => s.User != null ? (s.User.Email ?? "Unknown") : "Unknown")
            .Map(d => d.HasScreenshot, s => !string.IsNullOrEmpty(s.ScreenshotObjectName))
            .Map(d => d.ScreenshotUrl, s => !string.IsNullOrEmpty(s.ScreenshotObjectName)
                ? "/api/reportedproblems/" + s.Id + "/screenshot"
                : null);
    }
}

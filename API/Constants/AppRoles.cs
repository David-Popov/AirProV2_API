namespace API.Constants;

/// <summary>
/// Centralised role name constants — avoids magic strings scattered across the codebase.
/// These must match the names seeded in <see cref="API.Data.Seeds.RoleSeedData"/>.
/// </summary>
public static class AppRoles
{
    public const string Admin   = "Admin";
    public const string Manager = "Manager";
    public const string User    = "User";
}

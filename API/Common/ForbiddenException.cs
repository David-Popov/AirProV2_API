namespace API.Common;

public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message) { }
}

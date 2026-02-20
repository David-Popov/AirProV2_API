namespace API.Models;

/// <summary>
/// Categories for reported problems
/// </summary>
public enum ProblemCategory
{
    /// <summary>
    /// A feature is not working as expected
    /// </summary>
    FeatureNotWorking = 0,
    
    /// <summary>
    /// New data is not being saved/inserted
    /// </summary>
    DataNotInserted = 1,
    
    /// <summary>
    /// General bug report
    /// </summary>
    Bug = 2,
    
    /// <summary>
    /// User interface problem
    /// </summary>
    UIIssue = 3,
    
    /// <summary>
    /// Slow performance or timeouts
    /// </summary>
    PerformanceIssue = 4,
    
    /// <summary>
    /// Other issues not covered by other categories
    /// </summary>
    Other = 5
}

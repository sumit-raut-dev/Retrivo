namespace RetrivoApi.DTOs;

public class AdminStatsDto
{
    public int TotalItems { get; set; }
    public int PendingItems { get; set; }
    public int OpenItems { get; set; }
    public int ResolvedItems { get; set; }
    public int TotalUsers { get; set; }
    public int TotalClaims { get; set; }
}

public class UserListDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ReportedItemsCount { get; set; }
}
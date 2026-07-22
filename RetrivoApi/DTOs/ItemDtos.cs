namespace RetrivoApi.DTOs;

public class CreateItemDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string Location { get; set; } = string.Empty;
    public string ItemType { get; set; } = "Lost";
    public string? PhotoUrl { get; set; }
}

public class UpdateItemStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class ItemPublicDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string ItemType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string ReporterName { get; set; } = string.Empty;
}

public class ItemReporterDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string ItemType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int ClaimCount { get; set; }
}

public class ItemAdminDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string ItemType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string ReporterName { get; set; } = string.Empty;
    public string ReporterEmail { get; set; } = string.Empty;
    public int ClaimCount { get; set; }
}
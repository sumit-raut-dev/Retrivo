namespace RetrivoApi.DTOs;

public class CreateClaimDto
{
    public int ItemId { get; set; }
    public string ClaimantName { get; set; } = string.Empty;
    public string ClaimantEmail { get; set; } = string.Empty;
    public string? ClaimantPhone { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
}

public class ClaimSuccessDto
{
    public string Message { get; set; } = "Claim submitted successfully!";
    public string ReporterName { get; set; } = string.Empty;
    public string ReporterEmail { get; set; } = string.Empty;
    public string? ReporterPhone { get; set; }
}

public class ClaimResponseDto
{
    public int Id { get; set; }
    public string ClaimantName { get; set; } = string.Empty;
    public string ClaimantEmail { get; set; } = string.Empty;
    public string? ClaimantPhone { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
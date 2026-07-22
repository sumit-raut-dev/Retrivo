using System;
using System.Collections.Generic;

namespace RetrivoApi.Models;

public partial class Claim
{
    public int Id { get; set; }

    public int ItemId { get; set; }

    public string ClaimantName { get; set; } = null!;

    public string ClaimantEmail { get; set; } = null!;

    public string? ClaimantPhone { get; set; }

    public string Message { get; set; } = null!;

    public string? PhotoUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Item Item { get; set; } = null!;
}

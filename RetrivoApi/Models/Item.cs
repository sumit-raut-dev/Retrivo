using System;
using System.Collections.Generic;

namespace RetrivoApi.Models;

public partial class Item
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public int CategoryId { get; set; }

    public string Location { get; set; } = null!;

    public string? PhotoUrl { get; set; }

    public string ItemType { get; set; } = null!;

    public string Status { get; set; } = null!;

    public int ReporterId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<Claim> Claims { get; set; } = new List<Claim>();

    public virtual User Reporter { get; set; } = null!;
}

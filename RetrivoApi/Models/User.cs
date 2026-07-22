using System;
using System.Collections.Generic;

namespace RetrivoApi.Models;

public partial class User
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? Phone { get; set; }

    public bool? IsAdmin { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Item> Items { get; set; } = new List<Item>();
}

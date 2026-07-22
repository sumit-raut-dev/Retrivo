using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetrivoApi.Data;
using RetrivoApi.DTOs;

namespace RetrivoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly AppDbContext _context;

    public SearchController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> SmartSearch([FromBody] SearchRequestDto request)
    {
        var query = request.Query?.ToLower().Trim() ?? "";

        if (string.IsNullOrEmpty(query))
        {
            var allItems = await _context.Items
                .Include(i => i.Category)
                .Include(i => i.Reporter)
                .Where(i => i.Status == "Open")
                .Select(i => new SearchResultDto
                {
                    Id = i.Id,
                    Title = i.Title,
                    Description = i.Description,
                    CategoryName = i.Category!.Name,
                    Location = i.Location,
                    PhotoUrl = i.PhotoUrl,
                    ItemType = i.ItemType,
                    Status = i.Status,
                    CreatedAt = i.CreatedAt ?? DateTime.MinValue,
                    ReporterName = i.Reporter!.FullName,
                    RelevanceScore = 0
                })
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(allItems);
        }

        var keywords = query.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        var items = await _context.Items
            .Include(i => i.Category)
            .Include(i => i.Reporter)
            .Where(i => i.Status == "Open")
            .ToListAsync();

        var scoredItems = items.Select(item =>
        {
            int score = 0;
            var titleLower = item.Title.ToLower();
            var descLower = item.Description.ToLower();
            var locLower = item.Location.ToLower();
            var catLower = item.Category?.Name?.ToLower() ?? "";
            var typeLower = item.ItemType.ToLower();

            foreach (var keyword in keywords)
            {
                if (titleLower.Contains(keyword)) score += 10;
                if (descLower.Contains(keyword)) score += 5;
                if (locLower.Contains(keyword)) score += 3;
                if (catLower.Contains(keyword)) score += 2;
                if (typeLower.Contains(keyword)) score += 2;
            }

            // Fix: Handle nullable DateTime
            var createdAt = item.CreatedAt ?? DateTime.UtcNow;
            var daysOld = (DateTime.UtcNow - createdAt).TotalDays;
            if (daysOld < 1) score += 3;
            else if (daysOld < 7) score += 2;
            else if (daysOld < 30) score += 1;

            return new SearchResultDto
            {
                Id = item.Id,
                Title = item.Title,
                Description = item.Description,
                CategoryName = item.Category?.Name ?? "",
                Location = item.Location,
                PhotoUrl = item.PhotoUrl,
                ItemType = item.ItemType,
                Status = item.Status,
                CreatedAt = item.CreatedAt ?? DateTime.MinValue,
                ReporterName = item.Reporter?.FullName ?? "",
                RelevanceScore = score
            };
        })
        .Where(i => i.RelevanceScore > 0)
        .OrderByDescending(i => i.RelevanceScore)
        .ThenByDescending(i => i.CreatedAt)
        .ToList();

        return Ok(scoredItems);
    }
}

public class SearchRequestDto
{
    public string Query { get; set; } = string.Empty;
}

public class SearchResultDto : ItemPublicDto
{
    public int RelevanceScore { get; set; }
}
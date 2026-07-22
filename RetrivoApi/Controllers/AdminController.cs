using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetrivoApi.Data;
using RetrivoApi.DTOs;

namespace RetrivoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = new AdminStatsDto
        {
            TotalItems = await _context.Items.CountAsync(),
            PendingItems = await _context.Items.CountAsync(i => i.Status == "Pending"),
            OpenItems = await _context.Items.CountAsync(i => i.Status == "Open"),
            ResolvedItems = await _context.Items.CountAsync(i => i.Status == "Resolved"),
            TotalUsers = await _context.Users.CountAsync(),
            TotalClaims = await _context.Claims.CountAsync()
        };

        return Ok(stats);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new UserListDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                CreatedAt = u.CreatedAt ?? DateTime.MinValue,
                ReportedItemsCount = _context.Items.Count(i => i.ReporterId == u.Id)
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("items-by-status")]
    public async Task<IActionResult> GetItemsByStatus()
    {
        var data = await _context.Items
            .GroupBy(i => i.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("items-by-type")]
    public async Task<IActionResult> GetItemsByType()
    {
        var data = await _context.Items
            .GroupBy(i => i.ItemType)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("items-by-category")]
    public async Task<IActionResult> GetItemsByCategory()
    {
        var data = await _context.Items
            .Include(i => i.Category)
            .GroupBy(i => i.Category!.Name)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("monthly-activity")]
    public async Task<IActionResult> GetMonthlyActivity()
    {
        var data = await _context.Items
            .GroupBy(i => new { i.CreatedAt!.Value.Year, i.CreatedAt!.Value.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Count = g.Count()
            })
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToListAsync();

        return Ok(data);
    }
}
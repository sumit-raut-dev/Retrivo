using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetrivoApi.Data;
using RetrivoApi.DTOs;
using System.Security.Claims;

namespace RetrivoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ItemsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetItems(
        [FromQuery] int? categoryId = null,
        [FromQuery] string? itemType = null,
        [FromQuery] string? search = null)
    {
        var query = _context.Items
            .Include(i => i.Category)
            .Include(i => i.Reporter)
            .Where(i => i.Status == "Open")
            .AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(i => i.CategoryId == categoryId.Value);

        if (!string.IsNullOrEmpty(itemType))
            query = query.Where(i => i.ItemType == itemType);

        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(i =>
                i.Title.ToLower().Contains(searchLower) ||
                i.Description.ToLower().Contains(searchLower) ||
                i.Location.ToLower().Contains(searchLower));
        }

        var items = await query
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new ItemPublicDto
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
                ReporterName = i.Reporter!.FullName
            })
            .ToListAsync();

        return Ok(items);
    }


    [HttpGet("public-stats")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicStats()
    {
        var totalItems = await _context.Items.CountAsync();
        var resolvedItems = await _context.Items.CountAsync(i => i.Status == "Resolved");
        var activeUsers = await _context.Users.CountAsync();

        var resolvedDurationsHours = await _context.Items
            .Where(i => i.Status == "Resolved" && i.UpdatedAt != null && i.CreatedAt != null)
            .Select(i => EF.Functions.DateDiffHour(i.CreatedAt!.Value, i.UpdatedAt!.Value))
            .ToListAsync();

        var avgRecoveryHours = resolvedDurationsHours.Count > 0
            ? Math.Round(resolvedDurationsHours.Average(), 0)
            : 0;

        return Ok(new
        {
            totalItems,
            resolvedItems,
            activeUsers,
            avgRecoveryHours
        });
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetItem(int id)
    {
        var item = await _context.Items
            .Include(i => i.Category)
            .Include(i => i.Reporter)
            .Where(i => i.Status == "Open" || i.Status == "Pending")
            .Select(i => new ItemPublicDto
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
                ReporterName = i.Reporter!.FullName
            })
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return NotFound(new { message = "Item not found" });

        return Ok(item);
    }

    [HttpPut("{id}/reopen")]
    [Authorize]
    public async Task<IActionResult> ReopenItem(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var item = await _context.Items.FirstOrDefaultAsync(i => i.Id == id && i.ReporterId == userId);
        if (item == null) return NotFound(new { message = "Item not found or you don't own it" });

        item.Status = "Open";
        item.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Item reopened for claims." });
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateItem(CreateItemDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            return BadRequest(new { message = "Invalid category" });

        var item = new Models.Item
        {
            Title = dto.Title,
            Description = dto.Description,
            CategoryId = dto.CategoryId,
            Location = dto.Location,
            PhotoUrl = dto.PhotoUrl,
            ItemType = dto.ItemType,
            Status = "Open",
            ReporterId = userId
        };

        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Item reported successfully!", itemId = item.Id });
    }

    [HttpGet("my-items")]
    [Authorize]
    public async Task<IActionResult> GetMyItems()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var items = await _context.Items
            .Include(i => i.Category)
            .Where(i => i.ReporterId == userId)
            .Select(i => new ItemReporterDto
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
                ClaimCount = i.Claims.Count
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPut("{id}/resolve")]
    [Authorize]
    public async Task<IActionResult> ResolveItem(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var item = await _context.Items.FirstOrDefaultAsync(i => i.Id == id && i.ReporterId == userId);
        if (item == null)
            return NotFound(new { message = "Item not found or you don't own it" });

        item.Status = "Resolved";
        item.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Item marked as resolved!" });
    }

    [HttpGet("admin/all")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllItemsAdmin()
    {
        var items = await _context.Items
            .Include(i => i.Category)
            .Include(i => i.Reporter)
            .Select(i => new ItemAdminDto
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
                ReporterEmail = i.Reporter!.Email,
                ClaimCount = i.Claims.Count
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpDelete("admin/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null)
            return NotFound(new { message = "Item not found" });

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Item deleted successfully" });
    }
}
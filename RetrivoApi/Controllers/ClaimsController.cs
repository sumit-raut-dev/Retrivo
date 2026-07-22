using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetrivoApi.Data;
using RetrivoApi.DTOs;
using System.Security.Claims;

namespace RetrivoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClaimsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClaimsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitClaim(CreateClaimDto dto)
    {
        var item = await _context.Items
            .Include(i => i.Reporter)
            .FirstOrDefaultAsync(i => i.Id == dto.ItemId && i.Status == "Open");

        if (item == null)
            return NotFound(new { message = "Item not found or not available for claims" });

        if (string.IsNullOrWhiteSpace(dto.ClaimantEmail) && string.IsNullOrWhiteSpace(dto.ClaimantPhone))
        {
            return BadRequest(new { message = "At least one contact method (email or phone) is required to submit a claim." });
        }

        var claim = new Models.Claim
        {
            ItemId = dto.ItemId,
            ClaimantName = dto.ClaimantName,
            ClaimantEmail = dto.ClaimantEmail,
            ClaimantPhone = dto.ClaimantPhone,
            Message = dto.Message,
            PhotoUrl = dto.PhotoUrl
        };

        _context.Claims.Add(claim);
        item.Status = "Pending";
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new ClaimSuccessDto
        {
            Message = "Your claim has been submitted successfully! You can now reach out to the reporter.",
            ReporterName = item.Reporter!.FullName,
            ReporterEmail = item.Reporter!.Email,
            ReporterPhone = item.Reporter!.Phone
        });
    }

    [HttpGet("my-claims")]
    [Authorize]
    public async Task<IActionResult> GetMyItemClaims()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var myItemIds = await _context.Items
            .Where(i => i.ReporterId == userId)
            .Select(i => i.Id)
            .ToListAsync();

        var claims = await _context.Claims
            .Include(c => c.Item)
            .Where(c => myItemIds.Contains(c.ItemId))
            .Select(c => new
            {
                c.Id,
                c.ItemId,
                ItemTitle = c.Item!.Title,
                c.ClaimantName,
                c.ClaimantEmail,
                c.ClaimantPhone,
                c.Message,
                c.PhotoUrl,
                CreatedAt = c.CreatedAt ?? DateTime.MinValue
            })
            .ToListAsync();

        return Ok(claims);
    }

    [HttpGet("item/{itemId}")]
    [Authorize]
    public async Task<IActionResult> GetClaimsForItem(int itemId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var item = await _context.Items.FirstOrDefaultAsync(i => i.Id == itemId && i.ReporterId == userId);
        if (item == null)
            return Unauthorized(new { message = "You don't own this item" });

        var claims = await _context.Claims
            .Where(c => c.ItemId == itemId)
            .Select(c => new ClaimResponseDto
            {
                Id = c.Id,
                ClaimantName = c.ClaimantName,
                ClaimantEmail = c.ClaimantEmail,
                ClaimantPhone = c.ClaimantPhone,
                Message = c.Message,
                PhotoUrl = c.PhotoUrl,
                CreatedAt = c.CreatedAt ?? DateTime.MinValue
            })
            .ToListAsync();

        return Ok(claims);
    }
}
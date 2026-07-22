using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RetrivoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly Cloudinary _cloudinary;
    private const long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public UploadController(IConfiguration config)
    {
        var account = new Account(
            config["Cloudinary:CloudName"]!,
            config["Cloudinary:ApiKey"]!,
            config["Cloudinary:ApiSecret"]!
        );
        _cloudinary = new Cloudinary(account);
    }

    [HttpPost]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        if (file.Length > MAX_FILE_SIZE)
            return BadRequest(new { message = "File size exceeds 5MB limit" });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/jpg", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest(new { message = "Only image files (JPG, PNG, WebP) are allowed" });

        try
        {
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "retrivo/items",
                Transformation = new Transformation()
                    .Quality("auto")
                    .FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
                return BadRequest(new { message = uploadResult.Error.Message });

            return Ok(new
            {
                url = uploadResult.SecureUrl.ToString(),
                publicId = uploadResult.PublicId
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Upload failed", error = ex.Message });
        }
    }
}
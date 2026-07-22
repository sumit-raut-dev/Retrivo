using Microsoft.IdentityModel.Tokens;
using RetrivoApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace RetrivoApi.Services;

public class JwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateUserToken(User user)
    {
        var claims = new[]
        {
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, user.Id.ToString()),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, user.Email),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, user.FullName),
            new System.Security.Claims.Claim("role", "user")
        };

        return GenerateToken(claims);
    }

    public string GenerateAdminToken(User admin)
    {
        var claims = new[]
        {
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, admin.Id.ToString()),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, admin.Email),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, admin.FullName),
            new System.Security.Claims.Claim("role", "admin")
        };

        return GenerateToken(claims);
    }

    private string GenerateToken(System.Security.Claims.Claim[] claims)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddDays(Convert.ToDouble(_config["Jwt:ExpireDays"])),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
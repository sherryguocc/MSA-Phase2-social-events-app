using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models.Dto; 
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAllUsers()
    {
        var users = _context.Users
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email ?? string.Empty,
                Bio = u.Bio ?? string.Empty,
                AvatarUrl = u.AvatarUrl ?? string.Empty,
                Name = u.Name ?? string.Empty,
                Hobby = u.Hobby ?? string.Empty,
                ContactInfo = u.ContactInfo ?? string.Empty
            })
            .ToList();

        return Ok(users);
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetMe()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdStr, out var userId))
            return Unauthorized(new { message = "Invalid user ID in token." });

        var user = _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email ?? string.Empty,
                Bio = u.Bio ?? string.Empty,
                AvatarUrl = u.AvatarUrl ?? string.Empty,
                Name = u.Name ?? string.Empty,
                Hobby = u.Hobby ?? string.Empty,
                ContactInfo = u.ContactInfo ?? string.Empty
            })
            .FirstOrDefault();

        if (user == null)
            return NotFound(new { message = "User not found." });

        return Ok(user);
    }

    [HttpGet("{id}")]
    public IActionResult GetUserById(int id)
    {
        var user = _context.Users
            .Where(u => u.Id == id)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email ?? string.Empty,
                Bio = u.Bio ?? string.Empty,
                AvatarUrl = u.AvatarUrl ?? string.Empty,
                Name = u.Name ?? string.Empty,
                Hobby = u.Hobby ?? string.Empty,
                ContactInfo = u.ContactInfo ?? string.Empty
            })
            .FirstOrDefault();

        if (user == null)
            return NotFound(new { message = "User not found." });

        return Ok(user);
    }

    [Authorize]
    [HttpPut("{id}")]
    public IActionResult UpdateUser(int id, [FromBody] UserDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        // Only allow user to update their own info
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdStr, out var userId) || userId != id)
            return Forbid();

        var user = _context.Users.FirstOrDefault(u => u.Id == id);
        if (user == null)
            return NotFound(new { message = "User not found." });

        // Only allow updating Email, Bio, AvatarUrl, Name, Hobby, ContactInfo; forbid username change
        if (updateDto.Username != null && updateDto.Username != user.Username)
        {
            return BadRequest(new { message = "Username cannot be changed." });
        }
        user.Email = updateDto.Email;
        user.Bio = updateDto.Bio;
        user.AvatarUrl = updateDto.AvatarUrl;
        user.Name = updateDto.Name;
        user.Hobby = updateDto.Hobby;
        user.ContactInfo = updateDto.ContactInfo;
        _context.SaveChanges();

        // Return updated user info
        var result = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            Name = user.Name,
            Hobby = user.Hobby,
            ContactInfo = user.ContactInfo
        };
        return Ok(result);
    }

    [Authorize]
    [HttpPut("{id}/password")]
    public IActionResult ChangePassword(int id, [FromBody] ChangePasswordDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Only allow user to change their own password
        if (dto.CurrentPassword == dto.NewPassword)
        {
            return BadRequest(new { message = "New password cannot be the same as current password." });
        }
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdStr, out var userId) || userId != id)
            return Forbid();

        var user = _context.Users.FirstOrDefault(u => u.Id == id);
        if (user == null)
            return NotFound(new { message = "User not found." });

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Current password is incorrect." });
        }
        if (!IsPasswordStrong(dto.NewPassword))
        {
            return BadRequest(new { message = "New password is too weak. It must contain at least 8 characters and include a combination of letters and numbers or special characters." });
        }
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        _context.SaveChanges();

        return Ok(new { message = "Password updated successfully." });
    }
    
    private static bool IsPasswordStrong(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            return false;

        var hasLetter = password.Any(char.IsLetter);
        var hasDigit = password.Any(char.IsDigit);
        var hasSpecial = password.Any(ch => !char.IsLetterOrDigit(ch));

        int strength = 0;
        if (hasLetter) strength++;
        if (hasDigit) strength++;
        if (hasSpecial) strength++;

        return strength >= 2; // at least two of the three criteria must be met
    }


}


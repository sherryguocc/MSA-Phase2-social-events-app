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
                Bio = u.Bio ?? string.Empty
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
                Bio = u.Bio ?? string.Empty
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
                Bio = u.Bio ?? string.Empty
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

        // Only allow updating Email and Bio, forbid username change
        if (updateDto.Username != null && updateDto.Username != user.Username)
        {
            return BadRequest(new { message = "Username cannot be changed." });
        }
        user.Email = updateDto.Email;
        user.Bio = updateDto.Bio;
        _context.SaveChanges();

        // Return updated user info
        var result = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Bio = user.Bio
        };
        return Ok(result);
    }
}

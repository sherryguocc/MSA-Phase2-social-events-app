using Microsoft.AspNetCore.Mvc;
using backend.Data;

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
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.Bio
            })
            .ToList();
        return Ok(users);
    }
}
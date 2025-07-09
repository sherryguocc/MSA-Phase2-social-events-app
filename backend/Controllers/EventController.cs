// ASP.NET Core controller for CRUD operations on Event model using AppDbContext and EF Core.
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventController : ControllerBase
{
    private readonly AppDbContext _context;

    public EventController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var events = _context.Events.ToList();
        return Ok(events);
    }

    [HttpPost]
    [Microsoft.AspNetCore.Authorization.Authorize] // Only authenticated users can create events
    public IActionResult Create(Event newEvent)
    {
        try
        {
            // Get user id from JWT token
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token.");
            }
            // Always set CreatedById from token, ignore any value from frontend
            newEvent.CreatedById = int.Parse(userIdClaim.Value);

            _context.Events.Add(newEvent);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetAll), new { id = newEvent.Id }, newEvent);
        }
        catch (Exception ex)
        {
            // Print detailed error info to console for debugging
            Console.WriteLine($"[EventController.Create] Exception: {ex.Message}\n{ex.StackTrace}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}

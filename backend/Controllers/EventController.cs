// ASP.NET Core controller for CRUD operations on Event model using AppDbContext and EF Core.
// ASP.NET Core controller for CRUD operations on Event model using AppDbContext and EF Core.
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

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


    [HttpGet("dto")]
    public async Task<ActionResult<IEnumerable<EventDTO>>> GetEvents()
    {
        var events = await _context.Events
            .Include(e => e.CreatedBy)
            .Select(e => new EventDTO
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                Location = e.Location,
                EventTime = e.EventTime,
                MinAttendees = e.MinAttendees,
                MaxAttendees = e.MaxAttendees,
                ImageUrl = e.ImageUrl,
                CreatedById = e.CreatedById,
                CreatedByUsername = e.CreatedBy != null ? e.CreatedBy.Username : "Unknown"
            })
            .ToListAsync();

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
            // Use GetEvents as the action name for CreatedAtAction, or just return Ok(newEvent)
            return CreatedAtAction(nameof(GetEvents), new { id = newEvent.Id }, newEvent);
        }
        catch (Exception ex)
        {
            // Print detailed error info to console for debugging
            Console.WriteLine($"[EventController.Create] Exception: {ex.Message}\n{ex.StackTrace}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("by-user/{userId}")]
    public IActionResult GetEventsByUser(int userId)
    {
        var events = _context.Events
            .Where(e => e.CreatedById == userId)
            .Include(e => e.CreatedBy)
            .Select(e => new EventDTO {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                Location = e.Location,
                EventTime = e.EventTime,
                MinAttendees = e.MinAttendees,
                MaxAttendees = e.MaxAttendees,
                ImageUrl = e.ImageUrl,
                CreatedById = e.CreatedById,
                CreatedByUsername = e.CreatedBy != null ? e.CreatedBy.Username : "Unknown"
            })
            .ToList();

        return Ok(events);
    }
}

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
                CreatedByUsername = e.CreatedBy != null ? e.CreatedBy.Username : "Unknown",
                CreatedByAvatarUrl = e.CreatedBy != null ? e.CreatedBy.AvatarUrl : null
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
                CreatedByUsername = e.CreatedBy != null ? e.CreatedBy.Username : "Unknown",
                CreatedByAvatarUrl = e.CreatedBy != null ? e.CreatedBy.AvatarUrl : null
            })
            .ToList();

        return Ok(events);
    }
    
    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPut("{id}")]
    public IActionResult EditEvent(int id, [FromBody] EventDTO updateDto)
    {

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            return Unauthorized("User ID not found in token.");
        }
        int userId = int.Parse(userIdClaim.Value);

        var ev = _context.Events.FirstOrDefault(e => e.Id == id);
        if (ev == null)
            return NotFound(new { message = "Event not found." });

        if (ev.CreatedById != userId)
            return Forbid();

        ev.Title = updateDto.Title;
        ev.Description = updateDto.Description;
        ev.Location = updateDto.Location;
        ev.EventTime = updateDto.EventTime;
        ev.MinAttendees = updateDto.MinAttendees;
        ev.MaxAttendees = updateDto.MaxAttendees;
        ev.ImageUrl = updateDto.ImageUrl;
        _context.SaveChanges();

        var createdBy = _context.Users.FirstOrDefault(u => u.Id == ev.CreatedById);
        var result = new EventDTO
        {
            Id = ev.Id,
            Title = ev.Title,
            Description = ev.Description,
            Location = ev.Location,
            EventTime = ev.EventTime,
            MinAttendees = ev.MinAttendees,
            MaxAttendees = ev.MaxAttendees,
            ImageUrl = ev.ImageUrl,
            CreatedById = ev.CreatedById,
            CreatedByUsername = createdBy?.Username ?? "Unknown",
            CreatedByAvatarUrl = createdBy?.AvatarUrl
        };
        return Ok(result);
    }

    // Get joined count for a specific event
    [HttpGet("{id}/joined-count")]
    public IActionResult GetJoinedCount(int id)
    {
        var eventExists = _context.Events.Any(e => e.Id == id);
        if (!eventExists)
            return NotFound(new { message = "Event not found." });
        var joinedCount = _context.Set<Participation>().Count(p => p.EventId == id && p.Status == "joined");
        return Ok(new { joinedCount });
    }

    // Batch get joined counts for multiple events
    [HttpPost("joined-counts")]
    public IActionResult GetJoinedCounts([FromBody] List<int> eventIds)
    {
        if (eventIds == null || eventIds.Count == 0)
            return BadRequest(new { message = "No eventIds provided." });
        var counts = _context.Participations
            .Where(p => eventIds.Contains(p.EventId) && p.Status == "joined")
            .GroupBy(p => p.EventId)
            .Select(g => new { EventId = g.Key, JoinedCount = g.Count() })
            .ToList();
        // Build result dictionary: eventId => joinedCount
        var result = eventIds.ToDictionary(
            id => id,
            id => counts.FirstOrDefault(c => c.EventId == id)?.JoinedCount ?? 0
        );
        return Ok(result);
    }
}

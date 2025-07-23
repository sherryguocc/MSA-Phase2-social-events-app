using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;


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
    [AllowAnonymous]
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
                CreatedByName = e.CreatedBy != null ? e.CreatedBy.Name : null,
                CreatedByAvatarUrl = e.CreatedBy != null ? e.CreatedBy.AvatarUrl : null
            })
            .ToListAsync();

        return Ok(events);
    }

    [HttpPost]
    [Microsoft.AspNetCore.Authorization.Authorize] // Only authenticated users can create events
    public IActionResult Create([FromBody] EventDTO eventDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            // Get user id from JWT token
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token.");
            }
            var userId = int.Parse(userIdClaim.Value);
            // Validate the event DTO
            var newEvent = new Event
            {
                Title = eventDto.Title ?? string.Empty,
                Description = eventDto.Description ?? string.Empty,
                Location = eventDto.Location ?? string.Empty,
                EventTime = eventDto.EventTime,
                MinAttendees = eventDto.MinAttendees,
                MaxAttendees = eventDto.MaxAttendees,
                ImageUrl = eventDto.ImageUrl ?? string.Empty,
                CreatedById = userId
            };
            _context.Events.Add(newEvent);
            _context.SaveChanges();
            var createdBy = _context.Users.FirstOrDefault(u => u.Id == userId);
            var result = new EventDTO
            {
                Id = newEvent.Id,
                Title = newEvent.Title,
                Description = newEvent.Description,
                Location = newEvent.Location,
                EventTime = newEvent.EventTime,
                MinAttendees = newEvent.MinAttendees,
                MaxAttendees = newEvent.MaxAttendees,
                ImageUrl = newEvent.ImageUrl,
                CreatedById = userId,
                CreatedByUsername = createdBy?.Username ?? "",
                CreatedByName = createdBy?.Name,
                CreatedByAvatarUrl = createdBy?.AvatarUrl
            };
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, stack = ex.StackTrace });
        }
    }
    
    [HttpGet("{id}")]
    public IActionResult GetEventById(int id)
    {
        var ev = _context.Events
            .Include(e => e.CreatedBy)
            .FirstOrDefault(e => e.Id == id);

        if (ev == null)
        {
            return NotFound(new { message = "Event not found." });
        }

        var dto = new EventDTO
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
            CreatedByUsername = ev.CreatedBy?.Username ?? "Unknown",
            CreatedByName = ev.CreatedBy?.Name,
            CreatedByAvatarUrl = ev.CreatedBy?.AvatarUrl
        };

        return Ok(dto);
    }

    [HttpDelete("{id}")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public IActionResult DeleteEvent(int id)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            return Unauthorized("User ID not found in token.");
        }

        int userId = int.Parse(userIdClaim.Value);

        var ev = _context.Events.FirstOrDefault(e => e.Id == id);
        if (ev == null)
        {
            return NotFound(new { message = "Event not found." });
        }

        const int AdminUserId = 1; // set the user Sherry(id==1) as the admin 

        bool isAdmin = userId == AdminUserId;

        if (ev.CreatedById != userId && !isAdmin)
        {
            return Forbid("Only the creator or admin can delete this event.");
        }

        // Check if there are any participations for this event
        var participations = _context.Participations.Where(p => p.EventId == id).ToList();
        if (participations.Any())
        {
            return BadRequest(new { message = "Cannot delete event with existing participations." });
        }
        _context.Events.Remove(ev);
        _context.SaveChanges();

        return Ok(new { message = "Event deleted successfully." });
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
                CreatedByName = e.CreatedBy != null ? e.CreatedBy.Name : null,
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
            CreatedByName = createdBy?.Name,
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

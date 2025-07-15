// ASP.NET Core controller for users to mark an Event as "Interested" or "Going".
// Includes endpoints for adding, updating, and viewing participations.

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Linq;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ParticipationController : ControllerBase
{
    private readonly AppDbContext _context;
    public ParticipationController(AppDbContext context)
    {
        _context = context;
    }

    // User joins event (including waitlist logic)
    [HttpPost("/api/events/{id}/join")]
    [Authorize]
    public IActionResult JoinEvent(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized("User not logged in");
        int userId = int.Parse(userIdClaim.Value);
        var user = _context.Users.FirstOrDefault(u => u.Id == userId);
        if (user == null) return NotFound("User not found");
        var ev = _context.Events.FirstOrDefault(e => e.Id == id);
        if (ev == null) return NotFound("Event not found");
        // Check if participation record already exists
        var existing = _context.Participations.FirstOrDefault(p => p.EventId == id && p.UserId == userId);
        if (existing != null && existing.Status == "joined") return BadRequest("Already joined");
        if (existing != null && existing.Status == "waitlist") return BadRequest("Already in waitlist");
        // Current joined count
        int joinedCount = _context.Participations.Count(p => p.EventId == id && p.Status == "joined");
        if (joinedCount < ev.MaxAttendees)
        {
            if (existing != null)
                existing.Status = "joined";
            else
                _context.Participations.Add(new Participation { EventId = id, UserId = userId, Status = "joined" });
        }
        else
        {
            if (existing != null)
                existing.Status = "waitlist";
            else
                _context.Participations.Add(new Participation { EventId = id, UserId = userId, Status = "waitlist" });
        }
        _context.SaveChanges();
        return Ok(new { joined = true });
    }

    // User cancels participation
    [HttpPost("/api/events/{id}/cancel")]
    [Authorize]
    public IActionResult CancelParticipation(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized("User not logged in");
        int userId = int.Parse(userIdClaim.Value);
        var part = _context.Participations.FirstOrDefault(p => p.EventId == id && p.UserId == userId);
        if (part == null) return NotFound("Participation not found");
        bool wasJoined = part.Status == "joined";
        _context.Participations.Remove(part);
        _context.SaveChanges();
        // Waitlist promotion logic
        if (wasJoined)
        {
            var ev = _context.Events.FirstOrDefault(e => e.Id == id);
            if (ev != null)
            {
                var nextWaitlist = _context.Participations
                    .Where(p => p.EventId == id && p.Status == "waitlist")
                    .OrderBy(p => p.Id).FirstOrDefault();
                if (nextWaitlist != null)
                {
                    nextWaitlist.Status = "joined";
                    _context.SaveChanges();
                }
            }
        }
        return Ok(new { cancelled = true });
    }

    // Mark as interested
    [HttpPost("/api/events/{id}/interest")]
    [Authorize]
    public IActionResult MarkInterest(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized("User not logged in");
        int userId = int.Parse(userIdClaim.Value);
        var user = _context.Users.FirstOrDefault(u => u.Id == userId);
        if (user == null) return NotFound("User not found");
        var ev = _context.Events.FirstOrDefault(e => e.Id == id);
        if (ev == null) return NotFound("Event not found");
        var existing = _context.Participations.FirstOrDefault(p => p.EventId == id && p.UserId == userId);
        if (existing != null && existing.Status == "interested") return BadRequest("Already interested");
        if (existing != null)
            existing.Status = "interested";
        else
            _context.Participations.Add(new Participation { EventId = id, UserId = userId, Status = "interested" });
        _context.SaveChanges();
        return Ok(new { interested = true });
    }

    // Query participating/interested/waitlisted users
    [HttpGet("/api/events/{id}/participants")]
    public IActionResult GetParticipants(int id)
    {
        var users = _context.Participations
            .Where(p => p.EventId == id && p.Status == "joined")
            .Join(_context.Users, p => p.UserId, u => u.Id, (p, u) => new { u.Id, u.Username, u.Name, u.Email, u.Bio, u.AvatarUrl })
            .ToList();
        return Ok(users);
    }
    [HttpGet("/api/events/{id}/waitlist")]
    public IActionResult GetWaitlist(int id)
    {
        var users = _context.Participations
            .Where(p => p.EventId == id && p.Status == "waitlist")
            .Join(_context.Users, p => p.UserId, u => u.Id, (p, u) => new { u.Id, u.Username, u.Name, u.Email, u.Bio, u.AvatarUrl })
            .ToList();
        return Ok(users);
    }
    [HttpGet("/api/events/{id}/interested")]
    public IActionResult GetInterestedUsers(int id)
    {
        var users = _context.Participations
            .Where(p => p.EventId == id && p.Status == "interested")
            .Join(_context.Users, p => p.UserId, u => u.Id, (p, u) => new { u.Id, u.Username, u.Name, u.Email, u.Bio, u.AvatarUrl })
            .ToList();
        return Ok(users);
    }

    // Query all events user is participating/interested/waitlisted in
    [HttpGet("/api/users/{userId}/joined")]
    public IActionResult GetJoinedEvents(int userId)
    {
        var events = _context.Participations
            .Where(p => p.UserId == userId && p.Status == "joined")
            .Join(_context.Events.Include(e => e.CreatedBy), p => p.EventId, e => e.Id, (p, e) => new {
                e.Id,
                e.Title,
                e.Description,
                e.Location,
                e.EventTime,
                e.MinAttendees,
                e.MaxAttendees,
                e.ImageUrl,
                CreatedById = e.CreatedById,
                CreatedByUsername = e.CreatedBy != null ? e.CreatedBy.Username : null,
                CreatedByName = e.CreatedBy != null ? e.CreatedBy.Name : null,
                CreatedByAvatarUrl = e.CreatedBy != null ? e.CreatedBy.AvatarUrl : null
            })
            .ToList();
        return Ok(events);
    }
    [HttpGet("/api/users/{userId}/interested")]
    public IActionResult GetInterestedEvents(int userId)
    {
        var events = _context.Participations
            .Where(p => p.UserId == userId && p.Status == "interested")
            .Join(_context.Events.Include(e => e.CreatedBy), p => p.EventId, e => e.Id, (p, e) => new {
                e.Id,
                e.Title,
                e.Description,
                e.Location,
                e.EventTime,
                e.MinAttendees,
                e.MaxAttendees,
                e.ImageUrl,
                CreatedById = e.CreatedById,
                CreatedByUsername = e.CreatedBy != null ? e.CreatedBy.Username : null,
                CreatedByName = e.CreatedBy != null ? e.CreatedBy.Name : null,
                CreatedByAvatarUrl = e.CreatedBy != null ? e.CreatedBy.AvatarUrl : null
            })
            .ToList();
        return Ok(events);
    }
    [HttpGet("/api/users/{userId}/waitlist")]
    public IActionResult GetWaitlistEvents(int userId)
    {
        var events = _context.Participations
            .Where(p => p.UserId == userId && p.Status == "waitlist")
            .Join(_context.Events.Include(e => e.CreatedBy), p => p.EventId, e => e.Id, (p, e) => new {
                e.Id,
                e.Title,
                e.Description,
                e.Location,
                e.EventTime,
                e.MinAttendees,
                e.MaxAttendees,
                e.ImageUrl,
                CreatedById = e.CreatedById,
                CreatedByUsername = e.CreatedBy != null ? e.CreatedBy.Username : null,
                CreatedByName = e.CreatedBy != null ? e.CreatedBy.Name : null,
                CreatedByAvatarUrl = e.CreatedBy != null ? e.CreatedBy.AvatarUrl : null
            })
            .ToList();
        return Ok(events);
    }
}

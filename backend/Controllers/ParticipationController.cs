// ASP.NET Core controller for users to mark an Event as "Interested" or "Going".
// Includes endpoints for adding, updating, and viewing participations.

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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

    [HttpPost("/api/events/{id}/join")]
    [Authorize]
    public IActionResult JoinEvent(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized("User not logged in");
        int userId = int.Parse(userIdClaim.Value);
        var user = _context.Users.FirstOrDefault(u => u.Id == userId);
        if (user == null) return NotFound("User not found");
        var ev = _context.Events
            .Include(e => e.Participants)
            .Include(e => e.Waitlist)
            .FirstOrDefault(e => e.Id == id);
        if (ev == null) return NotFound("Event not found");
        if (ev.Participants.Any(u => u.Id == userId)) return BadRequest("Already joined");
        if (ev.Waitlist.Any(u => u.Id == userId)) return BadRequest("Already in waitlist");
        if (ev.Participants.Count < ev.MaxAttendees)
        {
            ev.Participants.Add(user);
        }
        else
        {
            ev.Waitlist.Add(user);
        }
        _context.SaveChanges();
        return Ok(new { joined = ev.Participants.Any(u => u.Id == userId), waitlist = ev.Waitlist.Any(u => u.Id == userId) });
    }

    [HttpPost("/api/events/{id}/cancel")]
    [Authorize]
    public IActionResult CancelParticipation(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized("User not logged in");
        int userId = int.Parse(userIdClaim.Value);
        var user = _context.Users.FirstOrDefault(u => u.Id == userId);
        if (user == null) return NotFound("User not found");
        var ev = _context.Events
            .Include(e => e.Participants)
            .Include(e => e.Waitlist)
            .FirstOrDefault(e => e.Id == id);
        if (ev == null) return NotFound("Event not found");
        bool wasParticipant = ev.Participants.RemoveAll(u => u.Id == userId) > 0;
        bool wasWaitlist = ev.Waitlist.RemoveAll(u => u.Id == userId) > 0;
        // waitlist logic: if user was a participant, promote next waitlist user
        if (wasParticipant && ev.Waitlist.Count > 0)
        {
            var next = ev.Waitlist.First();
            ev.Waitlist.RemoveAt(0);
            ev.Participants.Add(next);
        }
        _context.SaveChanges();
        return Ok(new { cancelled = wasParticipant || wasWaitlist });
    }


    [HttpPost("/api/events/{id}/interest")]
    [Authorize]
    public IActionResult MarkInterest(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized("User not logged in");
        int userId = int.Parse(userIdClaim.Value);
        var user = _context.Users.FirstOrDefault(u => u.Id == userId);
        if (user == null) return NotFound("User not found");
        var ev = _context.Events
            .Include(e => e.InterestedUsers)
            .FirstOrDefault(e => e.Id == id);
        if (ev == null) return NotFound("Event not found");
        if (ev.InterestedUsers.Any(u => u.Id == userId)) return BadRequest("Already interested");
        ev.InterestedUsers.Add(user);
        _context.SaveChanges();
        return Ok(new { interested = true });
    }

    [HttpGet("/api/events/{id}/participants")]
    public IActionResult GetParticipants(int id)
    {
        var ev = _context.Events
            .Include(e => e.Participants)
            .FirstOrDefault(e => e.Id == id);
        if (ev == null) return NotFound("Event not found");
        var users = ev.Participants.Select(u => new { u.Id, u.Username, u.Email, u.Bio }).ToList();
        return Ok(users);
    }

    [HttpGet("/api/events/{id}/waitlist")]
    public IActionResult GetWaitlist(int id)
    {
        var ev = _context.Events
            .Include(e => e.Waitlist)
            .FirstOrDefault(e => e.Id == id);
        if (ev == null) return NotFound("Event not found");
        var users = ev.Waitlist.Select(u => new { u.Id, u.Username, u.Email, u.Bio }).ToList();
        return Ok(users);
    }

    [HttpGet("/api/events/{id}/interested")]
    public IActionResult GetInterestedUsers(int id)
    {
        var ev = _context.Events
            .Include(e => e.InterestedUsers)
            .FirstOrDefault(e => e.Id == id);
        if (ev == null) return NotFound("Event not found");
        var users = ev.InterestedUsers.Select(u => new { u.Id, u.Username, u.Email, u.Bio }).ToList();
        return Ok(users);
    }
}

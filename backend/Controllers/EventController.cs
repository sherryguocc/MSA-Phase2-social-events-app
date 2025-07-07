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
    public IActionResult Create(Event newEvent)
    {
        _context.Events.Add(newEvent);
        _context.SaveChanges();
        return CreatedAtAction(nameof(GetAll), new { id = newEvent.Id }, newEvent);
    }
}

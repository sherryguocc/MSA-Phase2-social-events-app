// EF Core model for Event.
// Includes Title, Description, Location, EventTime, MinAttendees, MaxAttendees, CreatedBy (User).
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Event
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Location { get; set; } = "";

    public DateTime EventTime { get; set; }
    public int MinAttendees { get; set; }
    public int MaxAttendees { get; set; }

    // Event image URL (not upload, just a link)
    public string ImageUrl { get; set; } = "/public/default-event.jpg";

    // Creator info
    public int CreatedById { get; set; }

    [ForeignKey("CreatedById")]
    public User? CreatedBy { get; set; }

    // Navigation property: comments
    public List<Comment> Comments { get; set; } = new();
}

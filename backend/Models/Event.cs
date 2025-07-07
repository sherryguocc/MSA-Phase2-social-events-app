// EF Core model for Event.
// Includes Title, Description, Location, EventTime, MinAttendees, MaxAttendees, CreatedBy (User).
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
}

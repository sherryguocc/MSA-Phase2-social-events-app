
namespace backend.DTOs;

public class EventDTO
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Location { get; set; } = "";
    public DateTime EventTime { get; set; }
    public int MinAttendees { get; set; }
    public int MaxAttendees { get; set; }
    public string ImageUrl { get; set; } = "";
    public int CreatedById { get; set; }
    public string CreatedByUsername { get; set; } = "";
    public string? CreatedByName { get; set; } // Real name of the creator
    public string? CreatedByAvatarUrl { get; set; }
}

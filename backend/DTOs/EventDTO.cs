
namespace backend.DTOs;
using System.ComponentModel.DataAnnotations;
using backend.Validation;


[ValidAttendeeRange]
public class EventDTO
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Title is required.")]
    public string Title { get; set; } = "";

    public string? Description { get; set; }

    [Required(ErrorMessage = "Location is required.")]
    public string Location { get; set; } = "";

    [Required(ErrorMessage = "EventTime is required.")]
    [FutureDate(ErrorMessage = "EventTime must be in the future.")]
    public DateTime EventTime { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "MinAttendees must be greater than 0.")]
    public int MinAttendees { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "MaxAttendees must be greater than 0.")]
    public int MaxAttendees { get; set; }

    public string? ImageUrl { get; set; }

    public int CreatedById { get; set; }

    public string? CreatedByUsername { get; set; }

    public string? CreatedByName { get; set; }

    public string? CreatedByAvatarUrl { get; set; }
}
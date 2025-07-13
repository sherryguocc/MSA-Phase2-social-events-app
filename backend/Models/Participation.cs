// EF Core model for Participation.
// Represents the relationship between User and Event with a status ("joined", "interested", "waitlist").
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Participation
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        public int EventId { get; set; }

        // Status: "joined", "interested", "waitlist"
        public string Status { get; set; } = "joined";

        [ForeignKey("UserId")]
        public User? User { get; set; }
        [ForeignKey("EventId")]
        public Event? Event { get; set; }
    }
}

// EF Core model for User in a social activity app.
// A User has Id, Username, Email, PasswordHash, and a list of created events and participations.
namespace backend.Models
{
    public class User
    {
        public int Id { get; set; }

        public string Username { get; set; } = "";
        public string? Email { get; set; } // Email can be null
        public string PasswordHash { get; set; } = "";

        public string? Bio { get; set; } // User self-introduction, can be null

        // Navigation properties
        public List<Event> CreatedEvents { get; set; } = new List<Event>();

        // Many-to-many navigation properties for event participation
        public List<Event> ParticipantsEvents { get; set; } = new List<Event>(); // Events the user joined
        public List<Event> InterestedEvents { get; set; } = new List<Event>();   // Events the user is interested in
        public List<Event> WaitlistEvents { get; set; } = new List<Event>();     // Events the user is in waitlist for

        // Navigation property: comments
        public List<Comment> Comments { get; set; } = new();
    }
}

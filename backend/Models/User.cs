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
        // public List<Participation> Participations { get; set; }
    }
}

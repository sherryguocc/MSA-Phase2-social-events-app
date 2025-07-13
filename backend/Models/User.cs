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

        // User avatar URL (can be null or empty, use default if not set)
        public string? AvatarUrl { get; set; }

        // New fields
        public string? Name { get; set; } // Real name, can be null
        public string? Hobby { get; set; } // User hobby, can be null
        public string? ContactInfo { get; set; } // Contact info, can be null

        // Navigation properties
        public List<Event> CreatedEvents { get; set; } = new List<Event>();

        // Navigation property: comments
        public List<Comment> Comments { get; set; } = new();
    }
}

using backend.Models;
using backend.Data;
using BCrypt.Net;


public static class TestSeeder
{
    public static void SeedTestData(AppDbContext context)
    {
        if (context.Users.Any()) return;

        var users = new List<User>
        {
            new User { Username = "alice", PasswordHash = BCrypt.Net.BCrypt.HashPassword("test123"), Name = "Alice Zhang", AvatarUrl = "/public/avatar1.png", Hobby = "Singing", ContactInfo = "alice@example.com" },
            new User { Username = "bob", PasswordHash = BCrypt.Net.BCrypt.HashPassword("test123"), Name = "Bob Li", AvatarUrl = "/public/avatar2.png", Hobby = "Gaming", ContactInfo = "bob@example.com" },
            new User { Username = "charlie", PasswordHash = BCrypt.Net.BCrypt.HashPassword("test123"), Name = "Charlie Wong", AvatarUrl = "/public/avatar3.png", Hobby = "Reading", ContactInfo = "charlie@example.com" }
        };
        context.Users.AddRange(users);
        context.SaveChanges();

        var events = new List<Event>
        {
            new Event {
                Title = "Karaoke Night", Description = "Sing your heart out!", Location = "Room 101", EventTime = DateTime.Now.AddDays(3),
                MinAttendees = 3, MaxAttendees = 10, ImageUrl = "/public/default-event.jpg", CreatedById = users[0].Id
            },
            new Event {
                Title = "Coding Meetup", Description = "Bring your laptop and code!", Location = "Library", EventTime = DateTime.Now.AddDays(5),
                MinAttendees = 2, MaxAttendees = 8, ImageUrl = "/public/default-event.jpg", CreatedById = users[1].Id
            }
        };
        context.Events.AddRange(events);
        context.SaveChanges();

        var participations = new List<Participation>
        {
            new Participation { UserId = users[0].Id, EventId = events[0].Id, Status = "Join" },
            new Participation { UserId = users[1].Id, EventId = events[0].Id, Status = "Interested" },
            new Participation { UserId = users[2].Id, EventId = events[1].Id, Status = "Join" }
        };
        context.Participations.AddRange(participations);
        context.SaveChanges();

        var comments = new List<Comment>
        {
            new Comment { Content = "Looking forward to this event!", EventId = events[0].Id, UserId = users[1].Id, CreatedAt = DateTime.Now },
            new Comment { Content = "Me too!", EventId = events[0].Id, UserId = users[2].Id, CreatedAt = DateTime.Now },
            new Comment { Content = "Do we need to bring snacks?", EventId = events[1].Id, UserId = users[0].Id, CreatedAt = DateTime.Now }
        };
        context.Comments.AddRange(comments);
        context.SaveChanges();

        Console.WriteLine("✅ Seed test data completed.");
    }
}

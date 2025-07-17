using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace backend.Tests.Data;

public class AppDbContextTests
{
    [Fact]
    public async Task CanAddAndRetrieveEvent()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new AppDbContext(options);

        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword"
        };

        var eventEntity = new Event
        {
            Title = "Test Event",
            Description = "Test Description",
            Location = "Test Location",
            EventTime = DateTime.Now.AddDays(1),
            MinAttendees = 5,
            MaxAttendees = 20,
            CreatedBy = user
        };

        // Act
        context.Users.Add(user);
        context.Events.Add(eventEntity);
        await context.SaveChangesAsync();

        // Assert
        var savedEvent = await context.Events
            .Include(e => e.CreatedBy)
            .FirstOrDefaultAsync(e => e.Title == "Test Event");

        Assert.NotNull(savedEvent);
        Assert.Equal("Test Event", savedEvent.Title);
        Assert.Equal("Test Description", savedEvent.Description);
        Assert.Equal("testuser", savedEvent.CreatedBy?.Username);
    }

    [Fact]
    public async Task CanAddAndRetrieveMultipleEvents()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new AppDbContext(options);

        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword"
        };

        var event1 = new Event
        {
            Title = "Event 1",
            Description = "Description 1",
            Location = "Location 1",
            EventTime = DateTime.Now.AddDays(1),
            MinAttendees = 5,
            MaxAttendees = 20,
            CreatedBy = user
        };

        var event2 = new Event
        {
            Title = "Event 2",
            Description = "Description 2",
            Location = "Location 2",
            EventTime = DateTime.Now.AddDays(2),
            MinAttendees = 10,
            MaxAttendees = 30,
            CreatedBy = user
        };

        // Act
        context.Users.Add(user);
        context.Events.AddRange(event1, event2);
        await context.SaveChangesAsync();

        // Assert
        var events = await context.Events.ToListAsync();
        Assert.Equal(2, events.Count);
        Assert.Contains(events, e => e.Title == "Event 1");
        Assert.Contains(events, e => e.Title == "Event 2");
    }

    [Fact]
    public async Task CanDeleteEvent()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new AppDbContext(options);

        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword"
        };

        var eventEntity = new Event
        {
            Title = "Test Event",
            Description = "Test Description",
            Location = "Test Location",
            EventTime = DateTime.Now.AddDays(1),
            MinAttendees = 5,
            MaxAttendees = 20,
            CreatedBy = user
        };

        context.Users.Add(user);
        context.Events.Add(eventEntity);
        await context.SaveChangesAsync();

        // Act
        context.Events.Remove(eventEntity);
        await context.SaveChangesAsync();

        // Assert
        var events = await context.Events.ToListAsync();
        Assert.Empty(events);
    }

    [Fact]
    public async Task CanUpdateEvent()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new AppDbContext(options);

        var user = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword"
        };

        var eventEntity = new Event
        {
            Title = "Original Title",
            Description = "Original Description",
            Location = "Original Location",
            EventTime = DateTime.Now.AddDays(1),
            MinAttendees = 5,
            MaxAttendees = 20,
            CreatedBy = user
        };

        context.Users.Add(user);
        context.Events.Add(eventEntity);
        await context.SaveChangesAsync();

        // Act
        eventEntity.Title = "Updated Title";
        eventEntity.Description = "Updated Description";
        await context.SaveChangesAsync();

        // Assert
        var updatedEvent = await context.Events.FirstAsync();
        Assert.Equal("Updated Title", updatedEvent.Title);
        Assert.Equal("Updated Description", updatedEvent.Description);
        Assert.Equal("Original Location", updatedEvent.Location); // Unchanged
    }
}

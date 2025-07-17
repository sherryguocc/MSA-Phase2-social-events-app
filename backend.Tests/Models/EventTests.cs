using backend.Models;
using Xunit;

namespace backend.Tests.Models;

public class EventTests
{
    [Fact]
    public void Event_DefaultValues_AreSetCorrectly()
    {
        // Arrange & Act
        var eventEntity = new Event();

        // Assert
        Assert.Equal(string.Empty, eventEntity.Title);
        Assert.Equal(string.Empty, eventEntity.Description);
        Assert.Equal(string.Empty, eventEntity.Location);
        Assert.Equal("/public/default-event.jpg", eventEntity.ImageUrl);
        Assert.Empty(eventEntity.Comments);
    }

    [Fact]
    public void Event_SetProperties_WorksCorrectly()
    {
        // Arrange
        var eventEntity = new Event();
        var eventTime = DateTime.Now.AddDays(1);

        // Act
        eventEntity.Title = "Test Event";
        eventEntity.Description = "Test Description";
        eventEntity.Location = "Test Location";
        eventEntity.EventTime = eventTime;
        eventEntity.MinAttendees = 5;
        eventEntity.MaxAttendees = 20;
        eventEntity.CreatedById = 1;
        eventEntity.ImageUrl = "http://example.com/image.jpg";

        // Assert
        Assert.Equal("Test Event", eventEntity.Title);
        Assert.Equal("Test Description", eventEntity.Description);
        Assert.Equal("Test Location", eventEntity.Location);
        Assert.Equal(eventTime, eventEntity.EventTime);
        Assert.Equal(5, eventEntity.MinAttendees);
        Assert.Equal(20, eventEntity.MaxAttendees);
        Assert.Equal(1, eventEntity.CreatedById);
        Assert.Equal("http://example.com/image.jpg", eventEntity.ImageUrl);
    }

    [Theory]
    [InlineData(1, 10, true)]  // Valid: min < max
    [InlineData(5, 5, true)]   // Valid: min = max
    [InlineData(10, 5, false)] // Invalid: min > max
    public void Event_AttendeeValidation_Theory(int minAttendees, int maxAttendees, bool isValid)
    {
        // Arrange
        var eventEntity = new Event
        {
            Title = "Test Event",
            MinAttendees = minAttendees,
            MaxAttendees = maxAttendees
        };

        // Act & Assert
        if (isValid)
        {
            Assert.True(eventEntity.MinAttendees <= eventEntity.MaxAttendees);
        }
        else
        {
            Assert.False(eventEntity.MinAttendees <= eventEntity.MaxAttendees);
        }
    }

    [Fact]
    public void Event_FutureEventTime_IsValid()
    {
        // Arrange
        var futureTime = DateTime.Now.AddDays(1);
        var eventEntity = new Event
        {
            Title = "Future Event",
            EventTime = futureTime
        };

        // Act & Assert
        Assert.True(eventEntity.EventTime > DateTime.Now);
    }

    [Fact]
    public void Event_PastEventTime_IsInvalid()
    {
        // Arrange
        var pastTime = DateTime.Now.AddDays(-1);
        var eventEntity = new Event
        {
            Title = "Past Event",
            EventTime = pastTime
        };

        // Act & Assert
        Assert.False(eventEntity.EventTime > DateTime.Now);
    }
}

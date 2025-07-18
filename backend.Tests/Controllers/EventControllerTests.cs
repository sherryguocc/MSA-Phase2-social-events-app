using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using Microsoft.EntityFrameworkCore;


namespace backend.Tests.Controllers;

public class EventControllerTests : IClassFixture<TestWebApplicationFactory<Program>>
{

    private readonly TestWebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public EventControllerTests(TestWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();

        // Clear the Events table in the database to ensure tests are isolated
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        context.Events.RemoveRange(context.Events);
        context.SaveChanges();
    }

    [Fact]
    public async Task GetEvents_ReturnsSuccessAndCorrectContentType()
    {
        // Act
        var response = await _client.GetAsync("/api/event/dto");

        // Assert
        response.EnsureSuccessStatusCode(); // Status Code 200-299
        Assert.Equal("application/json; charset=utf-8",
            response.Content.Headers.ContentType?.ToString());
    }

    [Fact]
    public async Task GetEvents_ReturnsEmptyListWhenNoEvents()
    {
        // Act
        var response = await _client.GetAsync("/api/event/dto");
        var content = await response.Content.ReadAsStringAsync();
        var events = JsonSerializer.Deserialize<List<EventDTO>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        Assert.NotNull(events);
        Assert.Empty(events);
    }

    [Fact]
    public async Task CreateEvent_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var eventDto = new EventDTO
        {
            Title = "Test Event",
            Description = "Test Description",
            Location = "Test Location",
            EventTime = DateTime.Now.AddDays(1),
            MinAttendees = 5,
            MaxAttendees = 20,
            ImageUrl = "http://example.com/image.jpg"
        };

        var json = JsonSerializer.Serialize(eventDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/event", content);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateEvent_WithAuthentication_ReturnsSuccess()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var token = _factory.GenerateJwtToken(user);
        
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var eventDto = new EventDTO
        {
            Title = "Test Event",
            Description = "Test Description",
            Location = "Test Location",
            EventTime = DateTime.Now.AddDays(1),
            MinAttendees = 5,
            MaxAttendees = 20,
            ImageUrl = "http://example.com/image.jpg"
        };

        var json = JsonSerializer.Serialize(eventDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/event", content);

        // Assert
        response.EnsureSuccessStatusCode();
        
        // Verify the event was created
        var eventsResponse = await _client.GetAsync("/api/event/dto");
        var eventsContent = await eventsResponse.Content.ReadAsStringAsync();
        var events = JsonSerializer.Deserialize<List<EventDTO>>(eventsContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(events);
        Assert.Single(events);
        Assert.Equal("Test Event", events[0].Title);
        Assert.Equal("Test Description", events[0].Description);
        Assert.Equal(user.Id, events[0].CreatedById);
    }

    [Fact]
    public async Task CreateEvent_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var token = _factory.GenerateJwtToken(user);
        
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var eventDto = new EventDTO
        {
            Title = "", // Invalid: empty title
            Description = "Test Description",
            Location = "Test Location",
            EventTime = DateTime.Now.AddDays(1),
            MinAttendees = 5,
            MaxAttendees = 20
        };

        var json = JsonSerializer.Serialize(eventDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/event", content);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateEvent_WithMinAttendeesGreaterThanMax_ReturnsBadRequest()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var token = _factory.GenerateJwtToken(user);
        
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var eventDto = new EventDTO
        {
            Title = "Test Event",
            Description = "Test Description",
            Location = "Test Location",
            EventTime = DateTime.Now.AddDays(1),
            MinAttendees = 20, // Invalid: min > max
            MaxAttendees = 10
        };

        var json = JsonSerializer.Serialize(eventDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/event", content);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateEvent_WithPastDate_ReturnsBadRequest()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var token = _factory.GenerateJwtToken(user);
        
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var eventDto = new EventDTO
        {
            Title = "Test Event",
            Description = "Test Description",
            Location = "Test Location",
            EventTime = DateTime.Now.AddDays(-1), // Invalid: past date
            MinAttendees = 5,
            MaxAttendees = 20
        };

        var json = JsonSerializer.Serialize(eventDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/event", content);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetEventById_ExistingEvent_ReturnsEvent()
    {
        // Arrange
        var user = await CreateTestUserAsync();
        var eventEntity = await CreateTestEventAsync(user);

        // Act
        var response = await _client.GetAsync($"/api/event/{eventEntity.Id}");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var eventDto = JsonSerializer.Deserialize<EventDTO>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(eventDto);
        Assert.Equal(eventEntity.Id, eventDto.Id);
        Assert.Equal(eventEntity.Title, eventDto.Title);
    }

    [Fact]
    public async Task GetEventById_NonExistingEvent_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/event/999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<User> CreateTestUserAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var user = new User
        {
            Username = $"testuser_{Guid.NewGuid()}",
            Email = $"test_{Guid.NewGuid()}@example.com",
            PasswordHash = "hashedpassword",
            Name = "Test User"
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    private async Task<Event> CreateTestEventAsync(User user)
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var eventEntity = new Event
        {
            Title = "Test Event",
            Description = "Test Description",
            Location = "Test Location",
            EventTime = DateTime.Now.AddDays(1),
            MinAttendees = 5,
            MaxAttendees = 20,
            CreatedById = user.Id,
            ImageUrl = "http://example.com/image.jpg"
        };

        context.Events.Add(eventEntity);
        await context.SaveChangesAsync();
        return eventEntity;
    }
}

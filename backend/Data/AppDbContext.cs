// EF Core DbContext for the social activity app.
// Contains DbSets for Users, Events, Participations, and Comments.
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Event> Events { get; set; }
}

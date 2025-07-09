// EF Core DbContext for the social activity app.
// Contains DbSets for Users, Events, Participations, and Comments.
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Event> Events { get; set; }
        // public DbSet<Participation> Participations { get; set; }
    }
}


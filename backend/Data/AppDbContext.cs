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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Event>()
                .HasOne(e => e.CreatedBy)
                .WithMany(u => u.CreatedEvents)  // One-to-many relationship: one user can create many event
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);  // Prevent cascade delete to avoid deleting user when event is deleted

            modelBuilder.Entity<Event>()
                .HasMany(e => e.Participants)
                .WithMany()
                .UsingEntity(j => j.ToTable("EventParticipants"));

            modelBuilder.Entity<Event>()
                .HasMany(e => e.InterestedUsers)
                .WithMany()
                .UsingEntity(j => j.ToTable("EventInterestedUsers"));

            modelBuilder.Entity<Event>()
                .HasMany(e => e.Waitlist)
                .WithMany()
                .UsingEntity(j => j.ToTable("EventWaitlist"));
        }

    }
}


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

            // Event <-> User (Joined)
            modelBuilder.Entity<User>()
                .HasMany(u => u.ParticipantsEvents)
                .WithMany(e => e.Participants)
                .UsingEntity(j => j.ToTable("EventParticipants"));

            // Event <-> User (Interested)
            modelBuilder.Entity<User>()
                .HasMany(u => u.InterestedEvents)
                .WithMany(e => e.InterestedUsers)
                .UsingEntity(j => j.ToTable("EventInterestedUsers"));

            // Event <-> User (Waitlist)
            modelBuilder.Entity<User>()
                .HasMany(u => u.WaitlistEvents)
                .WithMany(e => e.Waitlist)
                .UsingEntity(j => j.ToTable("EventWaitlist"));
        }

    }
}


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
        public DbSet<Participation> Participations { get; set; }
        public DbSet<Comment> Comments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Event>()
                .HasOne(e => e.CreatedBy)
                .WithMany(u => u.CreatedEvents)
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            // 移除所有 Event <-> User 多对多参与映射，全部用 Participation 表管理

            // 评论自引用（父子评论）
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);

            // 评论与 Event
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Event)
                .WithMany(e => e.Comments)
                .HasForeignKey(c => c.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // 评论与 User
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }

    }
}


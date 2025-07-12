
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Comment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key: Event this comment belongs to
        public int EventId { get; set; }
        public Event Event { get; set; } = null!;

        // Foreign key: User who posted this comment
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // Parent comment (null if top-level)
        public int? ParentCommentId { get; set; }
        public Comment? ParentComment { get; set; }

        // Navigation property: replies (child comments)
        public List<Comment> Replies { get; set; } = new();
    }
}

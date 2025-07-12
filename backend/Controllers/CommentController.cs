
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CommentController(AppDbContext context)
        {
            _context = context;
        }

        // Get all comments for an event (with nested replies)
        [HttpGet("event/{eventId}")]
        public async Task<IActionResult> GetCommentsForEvent(int eventId)
        {
            var comments = await _context.Comments
                .Where(c => c.EventId == eventId && c.ParentCommentId == null)
                .Include(c => c.User)
                .Include(c => c.Replies)
                    .ThenInclude(r => r.User)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            var result = comments.Select(c => new {
                c.Id,
                c.Content,
                c.CreatedAt,
                c.ParentCommentId,
                User = c.User == null ? null : new { c.User.Id, c.User.Username },
                Replies = (c.Replies ?? new List<Comment>()).OrderBy(r => r.CreatedAt).Select(r => new {
                    r.Id,
                    r.Content,
                    r.CreatedAt,
                    r.ParentCommentId,
                    User = r.User == null ? null : new { r.User.Id, r.User.Username }
                })
            });
            return Ok(result);
        }

        // Post a new comment (top-level or reply)
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> PostComment([FromBody] CommentDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Content))
                    return BadRequest("Comment content cannot be empty.");
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var comment = new Comment
                {
                    Content = dto.Content,
                    EventId = dto.EventId,
                    UserId = userId,
                    ParentCommentId = dto.ParentCommentId
                };
                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();
                // Return with user info
                await _context.Entry(comment).Reference(c => c.User).LoadAsync();
                var result = new {
                    comment.Id,
                    comment.Content,
                    comment.CreatedAt,
                    comment.ParentCommentId,
                    User = comment.User == null ? null : new { comment.User.Id, comment.User.Username }
                };
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error posting comment: {ex.Message}\n{ex.StackTrace}");
            }
        }

        // Delete a comment (and its replies)
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return NotFound();
            if (comment.UserId != userId) return Forbid();
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class CommentDto
    {
        public string Content { get; set; } = string.Empty;
        public int EventId { get; set; }
        public int? ParentCommentId { get; set; }
    }
}

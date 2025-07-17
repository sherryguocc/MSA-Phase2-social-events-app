using Microsoft.AspNetCore.Mvc;
using backend.Data;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/dev")]
    public class DevToolsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public DevToolsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpPost("reset")]
        public IActionResult ResetDatabase()
        {
            if (!_env.IsDevelopment())
            {
                return Forbid("This endpoint is only allowed in development environment.");
            }

            try
            {
                _context.Comments.RemoveRange(_context.Comments);
                _context.Participations.RemoveRange(_context.Participations);
                _context.Events.RemoveRange(_context.Events);
                _context.Users.RemoveRange(_context.Users);
                _context.SaveChanges();

                return Ok("✅ Database has been reset.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Error resetting database: {ex.Message}");
            }
        }
    }
}

namespace backend.Models.Dto
{
    public class UserDto
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
    }

}

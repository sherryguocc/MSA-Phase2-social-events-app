namespace backend.Models.Dto
{
    public class UserDto
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }

        // New fields
        public string? Name { get; set; }
        public string? Hobby { get; set; }
        public string? ContactInfo { get; set; }
    }

}

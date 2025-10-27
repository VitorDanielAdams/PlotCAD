using System.ComponentModel.DataAnnotations;

namespace PlotCAD.Application.DTOs.Auth
{
    public record LoginRequest
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(200, ErrorMessage = "Email must not exceed 200 characters")]
        public string Login { get; init; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [MinLength(3, ErrorMessage = "Password must be at least 6 characters")]
        [MaxLength(100, ErrorMessage = "Password must not exceed 100 characters")]
        public string Password { get; init; } = string.Empty;
    }
}

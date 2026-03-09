using System.ComponentModel.DataAnnotations;

namespace PlotCAD.Application.DTOs.Backoffice
{
    public record BackofficeLoginRequest
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(200, ErrorMessage = "Email must not exceed 200 characters")]
        public string Email { get; init; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [MaxLength(100, ErrorMessage = "Password must not exceed 100 characters")]
        public string Password { get; init; } = string.Empty;
    }

    public record BackofficeLoginResponse(string Token, string Name, string Email);
}

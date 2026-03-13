using System.ComponentModel.DataAnnotations;

namespace PlotCAD.Application.DTOs.Backoffice.Auth
{
    public record BackofficeLoginRequest
    {
        [Required(ErrorMessage = "Email é obrigatório")]
        [EmailAddress(ErrorMessage = "Formato inválido de email")]
        [MaxLength(200, ErrorMessage = "Email excede o limite de caracteres")]
        public string Email { get; init; } = string.Empty;

        [Required(ErrorMessage = "Senha é obrigatório")]
        [MaxLength(100, ErrorMessage = "Senha excede o limite de caracteres")]
        public string Password { get; init; } = string.Empty;
    }
}

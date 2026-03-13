using System.ComponentModel.DataAnnotations;

namespace PlotCAD.Application.DTOs.Backoffice.Module
{
    public record CreateModuleRequest
    {
        [Required(ErrorMessage = "Código é obrigatório")]
        [MaxLength(50, ErrorMessage = "Código excede o limite de caracteres")]
        [RegularExpression(@"^[a-z0-9_]+$", ErrorMessage = "Código precisa conter apenas letras minusculas, números e underline")]
        public string Code { get; init; } = string.Empty;

        [Required(ErrorMessage = "Nome é obrigatório")]
        [MaxLength(200, ErrorMessage = "Nome excede o limite de caracteres")]
        public string Name { get; init; } = string.Empty;

        [MaxLength(1000, ErrorMessage = "Descrição excede o limite de caracteres")]
        public string? Description { get; init; }
    }
}

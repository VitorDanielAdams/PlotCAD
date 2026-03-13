using System.ComponentModel.DataAnnotations;

namespace PlotCAD.Application.DTOs.Backoffice.Module
{
    public record UpdateModuleRequest
    {
        [Required(ErrorMessage = "Nome é obrigatório")]
        [MaxLength(200, ErrorMessage = "Nome excede o limite de caracteres")]
        public string Name { get; init; } = string.Empty;

        [MaxLength(1000, ErrorMessage = "Descrição excede o limite de caracteres")]
        public string? Description { get; init; }
    }
}

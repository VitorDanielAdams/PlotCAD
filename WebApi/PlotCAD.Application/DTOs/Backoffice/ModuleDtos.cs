using System.ComponentModel.DataAnnotations;

namespace PlotCAD.Application.DTOs.Backoffice
{
    public record ModuleResponse(
        int Id,
        string Code,
        string Name,
        string? Description,
        bool IsActive,
        DateTimeOffset CreatedAt);

    public record CreateModuleRequest
    {
        [Required(ErrorMessage = "Code is required")]
        [MaxLength(50, ErrorMessage = "Code must not exceed 50 characters")]
        [RegularExpression(@"^[a-z0-9_]+$", ErrorMessage = "Code must contain only lowercase letters, numbers, and underscores")]
        public string Code { get; init; } = string.Empty;

        [Required(ErrorMessage = "Name is required")]
        [MaxLength(200, ErrorMessage = "Name must not exceed 200 characters")]
        public string Name { get; init; } = string.Empty;

        [MaxLength(1000, ErrorMessage = "Description must not exceed 1000 characters")]
        public string? Description { get; init; }
    }

    public record UpdateModuleRequest
    {
        [Required(ErrorMessage = "Name is required")]
        [MaxLength(200, ErrorMessage = "Name must not exceed 200 characters")]
        public string Name { get; init; } = string.Empty;

        [MaxLength(1000, ErrorMessage = "Description must not exceed 1000 characters")]
        public string? Description { get; init; }
    }

    public record TenantModuleResponse(
        int ModuleId,
        string ModuleCode,
        string ModuleName,
        bool IsEnabled,
        DateTimeOffset? EnabledAt,
        DateTimeOffset? DisabledAt);

    public record SetTenantModuleRequest
    {
        public int ModuleId { get; init; }
        public bool IsEnabled { get; init; }
    }
}

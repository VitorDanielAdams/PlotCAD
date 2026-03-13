namespace PlotCAD.Application.DTOs.Backoffice.Module
{
    public record TenantModuleResponse(
        int ModuleId,
        string ModuleCode,
        string ModuleName,
        bool IsEnabled,
        DateTimeOffset? EnabledAt,
        DateTimeOffset? DisabledAt);
}

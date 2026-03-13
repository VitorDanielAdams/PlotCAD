namespace PlotCAD.Application.DTOs.Backoffice.Module
{
    public record SetTenantModuleRequest
    {
        public int ModuleId { get; init; }
        public bool IsEnabled { get; init; }
    }
}
namespace PlotCAD.Application.DTOs.Backoffice.Module
{
    public record ModuleResponse(
        int Id,
        string Code,
        string Name,
        string? Description,
        bool IsActive,
        DateTimeOffset CreatedAt);    
}

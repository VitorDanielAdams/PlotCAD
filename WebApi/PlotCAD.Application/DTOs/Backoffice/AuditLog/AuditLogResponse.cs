namespace PlotCAD.Application.DTOs.Backoffice.AuditLog
{
    public record AuditLogResponse(
        long Id,
        int? ManagerId,
        string? ManagerName,
        string Action,
        string EntityType,
        string EntityId,
        string? Details,
        string? IpAddress,
        DateTimeOffset CreatedAt);
}

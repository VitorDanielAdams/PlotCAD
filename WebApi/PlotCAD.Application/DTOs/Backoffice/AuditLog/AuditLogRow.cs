namespace PlotCAD.Application.DTOs.Backoffice.AuditLog
{
    public class AuditLogRow
    {
        public long Id { get; set; }
        public int? ManagerId { get; set; }
        public string? ManagerName { get; set; }
        public required string Action { get; set; }
        public required string EntityType { get; set; }
        public required string EntityId { get; set; }
        public string? Details { get; set; }
        public string? IpAddress { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}

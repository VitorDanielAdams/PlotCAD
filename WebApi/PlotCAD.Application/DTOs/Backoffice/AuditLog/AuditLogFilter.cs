namespace PlotCAD.Application.DTOs.Backoffice.AuditLog
{
    public class AuditLogFilter
    {
        public int? ManagerId { get; set; }
        public string? EntityType { get; set; }
        public string? Action { get; set; }
        public DateTimeOffset? FromDate { get; set; }
        public DateTimeOffset? ToDate { get; set; }
    }
}

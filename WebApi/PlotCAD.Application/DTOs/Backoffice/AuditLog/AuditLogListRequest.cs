using PlotCAD.Application.DTOs.Common;

namespace PlotCAD.Application.DTOs.Backoffice.AuditLog
{
    public class AuditLogListRequest : ListRequest
    {
        public int? ManagerId { get; init; }
        public string? EntityType { get; init; }
        public string? Action { get; init; }
        public DateTimeOffset? FromDate { get; init; }
        public DateTimeOffset? ToDate { get; init; }
    }
}

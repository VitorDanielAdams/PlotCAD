using System.ComponentModel.DataAnnotations.Schema;

namespace PlotCAD.Domain.Entities
{
    [Table("AuditLogs")]
    public class AuditLog
    {
        public long Id { get; set; }
        public int? ManagerId { get; set; }
        public required string Action { get; set; }
        public required string EntityType { get; set; }
        public required string EntityId { get; set; }
        public string? Details { get; set; }
        public string? IpAddress { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}

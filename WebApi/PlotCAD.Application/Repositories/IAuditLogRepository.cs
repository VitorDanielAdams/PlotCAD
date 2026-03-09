using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Repositories
{
    public interface IAuditLogRepository
    {
        Task CreateAsync(AuditLog log, CancellationToken ct = default);
        Task<IEnumerable<AuditLog>> GetPagedAsync(int page, int pageSize, AuditLogFilter? filter, CancellationToken ct = default);
        Task<int> GetCountAsync(AuditLogFilter? filter, CancellationToken ct = default);
    }

    public class AuditLogFilter
    {
        public int? ManagerId { get; set; }
        public string? EntityType { get; set; }
        public string? Action { get; set; }
        public DateTimeOffset? FromDate { get; set; }
        public DateTimeOffset? ToDate { get; set; }
    }
}

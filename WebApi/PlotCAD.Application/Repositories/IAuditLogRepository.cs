using PlotCAD.Application.DTOs.Backoffice.AuditLog;
using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Repositories
{
    public interface IAuditLogRepository
    {
        Task CreateAsync(AuditLog log, CancellationToken ct = default);
        Task<IEnumerable<AuditLogRow>> GetPagedAsync(int page, int pageSize, AuditLogFilter? filter, CancellationToken ct = default);
        Task<int> GetCountAsync(AuditLogFilter? filter, CancellationToken ct = default);
    }
}

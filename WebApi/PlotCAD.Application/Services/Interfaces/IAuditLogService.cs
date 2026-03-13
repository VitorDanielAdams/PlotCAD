using PlotCAD.Application.DTOs.Backoffice.AuditLog;
using PlotCAD.Application.DTOs.Common;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface IAuditLogService
    {
        Task LogAsync(int? managerId, string action, string entityType, string entityId, string? details = null, string? ipAddress = null, CancellationToken ct = default);
        Task<ListResponse<AuditLogResponse>> GetPagedAsync(AuditLogListRequest request, CancellationToken ct = default);
    }
}

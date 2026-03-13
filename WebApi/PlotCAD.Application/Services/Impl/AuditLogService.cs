using Microsoft.Extensions.Logging;
using PlotCAD.Application.DTOs.Backoffice.AuditLog;
using PlotCAD.Application.DTOs.Common;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Services.Impl
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly ILogger<AuditLogService> _logger;

        public AuditLogService(
            IAuditLogRepository auditLogRepository,
            ILogger<AuditLogService> logger)
        {
            _auditLogRepository = auditLogRepository;
            _logger = logger;
        }

        public async Task LogAsync(int? managerId, string action, string entityType, string entityId,
            string? details = null, string? ipAddress = null, CancellationToken ct = default)
        {
            var log = new AuditLog
            {
                ManagerId = managerId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Details = details,
                IpAddress = ipAddress,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _auditLogRepository.CreateAsync(log, ct);

            _logger.LogInformation("Audit: {Action} on {EntityType}:{EntityId} by manager {ManagerId}",
                action, entityType, entityId, managerId);
        }

        public async Task<ListResponse<AuditLogResponse>> GetPagedAsync(AuditLogListRequest request, CancellationToken ct = default)
        {
            var filter = new AuditLogFilter
            {
                ManagerId = request.ManagerId,
                EntityType = request.EntityType,
                Action = request.Action,
                FromDate = request.FromDate,
                ToDate = request.ToDate
            };

            var logsTask = await _auditLogRepository.GetPagedAsync(request.PageNumber, request.PageSize, filter, ct);
            var countTask = await  _auditLogRepository.GetCountAsync(filter, ct);

            var items = logsTask.Select(l => new AuditLogResponse(
                l.Id,
                l.ManagerId,
                l.ManagerName,
                l.Action,
                l.EntityType,
                l.EntityId,
                l.Details,
                l.IpAddress,
                l.CreatedAt));

            return new ListResponse<AuditLogResponse>(countTask, request.PageNumber, request.PageSize, items);
        }
    }
}

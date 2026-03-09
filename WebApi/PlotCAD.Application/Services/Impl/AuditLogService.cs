using Microsoft.Extensions.Logging;
using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Services.Impl
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly IBackofficeManagerRepository _managerRepository;
        private readonly ILogger<AuditLogService> _logger;

        public AuditLogService(
            IAuditLogRepository auditLogRepository,
            IBackofficeManagerRepository managerRepository,
            ILogger<AuditLogService> logger)
        {
            _auditLogRepository = auditLogRepository;
            _managerRepository = managerRepository;
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

        public async Task<PagedResponse<AuditLogResponse>> GetPagedAsync(AuditLogListRequest request, CancellationToken ct = default)
        {
            var filter = new AuditLogFilter
            {
                ManagerId = request.ManagerId,
                EntityType = request.EntityType,
                Action = request.Action,
                FromDate = request.FromDate,
                ToDate = request.ToDate
            };

            var logs = await _auditLogRepository.GetPagedAsync(request.Page, request.PageSize, filter, ct);
            var count = await _auditLogRepository.GetCountAsync(filter, ct);

            var managerIds = logs.Where(l => l.ManagerId.HasValue).Select(l => l.ManagerId!.Value).Distinct();
            var managerNames = new Dictionary<int, string>();
            foreach (var id in managerIds)
            {
                var manager = await _managerRepository.GetByIdAsync(id, ct);
                if (manager != null)
                    managerNames[id] = manager.Name;
            }

            var items = logs.Select(l => new AuditLogResponse(
                l.Id,
                l.ManagerId,
                l.ManagerId.HasValue && managerNames.TryGetValue(l.ManagerId.Value, out var name) ? name : null,
                l.Action,
                l.EntityType,
                l.EntityId,
                l.Details,
                l.IpAddress,
                l.CreatedAt));

            return new PagedResponse<AuditLogResponse>(items, count, request.Page, request.PageSize);
        }
    }
}

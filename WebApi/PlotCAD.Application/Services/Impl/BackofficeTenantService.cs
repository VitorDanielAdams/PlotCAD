using Microsoft.Extensions.Logging;
using PlotCAD.Application.DTOs.Backoffice.Tenant;
using PlotCAD.Application.DTOs.Common;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using System.Text.Json;

namespace PlotCAD.Application.Services.Impl
{
    public class BackofficeTenantService : IBackofficeTenantService
    {
        private readonly IBackofficeTenantRepository _tenantRepository;
        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentBackofficeUser _currentUser;
        private readonly ILogger<BackofficeTenantService> _logger;

        public BackofficeTenantService(
            IBackofficeTenantRepository tenantRepository,
            IAuditLogService auditLogService,
            ICurrentBackofficeUser currentUser,
            ILogger<BackofficeTenantService> logger)
        {
            _tenantRepository = tenantRepository;
            _auditLogService = auditLogService;
            _currentUser = currentUser;
            _logger = logger;
        }

        public async Task<ListResponse<BackofficeTenantResponse>> GetPagedAsync(BackofficeTenantListRequest request, CancellationToken ct = default)
        {
            _logger.LogInformation("Listing tenants: Page={Page}, PageSize={PageSize}", request.PageNumber, request.PageSize);

            var tenants = await _tenantRepository.GetPagedAsync(request.PageNumber, request.PageSize, request.Search, request.Status, ct);
            var count = await _tenantRepository.GetCountAsync(request.Search, request.Status, ct);

            var items = tenants.Select(t => new BackofficeTenantResponse(
                t.Tenant.Id,
                t.Tenant.Name,
                t.Tenant.PlanType,
                t.Tenant.MaxUsers,
                t.Tenant.SubscriptionStatus,
                t.Tenant.SubscriptionExpiresAt,
                null,
                t.UserCount,
                t.Tenant.CreatedAt,
                t.Tenant.UpdatedAt));

            return new ListResponse<BackofficeTenantResponse>(count, request.PageNumber, request.PageSize, items);
        }

        public async Task<BackofficeTenantResponse?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            var (tenant, userCount) = await _tenantRepository.GetByIdWithCountAsync(id, ct);
            if (tenant == null) return null;

            return new BackofficeTenantResponse(
                tenant.Id,
                tenant.Name,
                tenant.PlanType,
                tenant.MaxUsers,
                tenant.SubscriptionStatus,
                tenant.SubscriptionExpiresAt,
                null,
                userCount,
                tenant.CreatedAt,
                tenant.UpdatedAt);
        }

        public async Task UpdateSubscriptionAsync(Guid id, UpdateTenantSubscriptionRequest request, CancellationToken ct = default)
        {
            var (tenant, _) = await _tenantRepository.GetByIdWithCountAsync(id, ct);
            if (tenant == null)
                throw new KeyNotFoundException($"Tenant {id} not found.");

            await _tenantRepository.UpdateAsync(id, request.SubscriptionStatus, request.SubscriptionExpiresAt,
                request.PlanType, request.MaxUsers, ct);

            _logger.LogInformation("Tenant {TenantId} subscription updated by manager {ManagerId}", id, _currentUser.ManagerId);

            await _auditLogService.LogAsync(
                _currentUser.ManagerId,
                "tenant.subscription_updated",
                "Tenant",
                id.ToString(),
                JsonSerializer.Serialize(new { request.SubscriptionStatus, request.PlanType, request.MaxUsers }),
                _currentUser.IpAddress, ct);
        }
    }
}

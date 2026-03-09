using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Infrastructure.Service
{
    public class BackofficeTenantService : IBackofficeTenantService
    {
        private readonly IBackofficeTenantRepository _tenantRepository;

        public BackofficeTenantService(IBackofficeTenantRepository tenantRepository)
        {
            _tenantRepository = tenantRepository;
        }

        public async Task<PagedResponse<BackofficeTenantResponse>> GetPagedAsync(BackofficeTenantListRequest request, CancellationToken ct = default)
        {
            var tenants = await _tenantRepository.GetPagedAsync(request.Page, request.PageSize, request.Search, request.Status, ct);
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

            return new PagedResponse<BackofficeTenantResponse>(items, count, request.Page, request.PageSize);
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
            await _tenantRepository.UpdateAsync(id, request.SubscriptionStatus, request.SubscriptionExpiresAt,
                request.PlanType, request.MaxUsers, ct);
        }
    }
}

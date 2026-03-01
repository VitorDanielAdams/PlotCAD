using PlotCAD.Application.DTOs.Tenant;
using PlotCAD.Domain.Entities;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface ITenantService
    {
        Task<TenantResponse> ProvisionAsync(TenantProvisionRequest request, CancellationToken ct = default);
        Task UpdateSubscriptionAsync(Guid tenantId, SubscriptionStatus status, DateTimeOffset? expiresAt, CancellationToken ct = default);
        Task<Tenant?> GetCachedAsync(Guid tenantId, CancellationToken ct = default);
        Task<bool> CanAddUserAsync(Guid tenantId, CancellationToken ct = default);
    }
}

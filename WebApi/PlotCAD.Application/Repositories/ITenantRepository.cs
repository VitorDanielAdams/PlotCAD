using PlotCAD.Domain.Entities;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.Repositories
{
    public interface ITenantRepository
    {
        Task<Tenant?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<Tenant> CreateAsync(Tenant tenant, CancellationToken ct = default);
        Task UpdateSubscriptionAsync(Guid id, SubscriptionStatus status, DateTimeOffset? expiresAt, CancellationToken ct = default);
        Task<int> CountUsersAsync(Guid tenantId, CancellationToken ct = default);
    }
}

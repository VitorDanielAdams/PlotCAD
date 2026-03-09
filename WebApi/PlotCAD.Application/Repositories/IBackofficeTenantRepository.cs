using PlotCAD.Domain.Entities;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.Repositories
{
    public interface IBackofficeTenantRepository
    {
        Task<IEnumerable<(Tenant Tenant, int UserCount)>> GetPagedAsync(int page, int pageSize, string? search, SubscriptionStatus? status, CancellationToken ct = default);
        Task<int> GetCountAsync(string? search, SubscriptionStatus? status, CancellationToken ct = default);
        Task<(Tenant? Tenant, int UserCount)> GetByIdWithCountAsync(Guid id, CancellationToken ct = default);
        Task UpdateAsync(Guid id, SubscriptionStatus? status, DateTimeOffset? expiresAt, PlanType? planType, int? maxUsers, CancellationToken ct = default);
        Task<int> CountByStatusAsync(SubscriptionStatus status, CancellationToken ct = default);
        Task<int> CountAllAsync(CancellationToken ct = default);
    }
}

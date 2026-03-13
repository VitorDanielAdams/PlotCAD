using PlotCAD.Application.DTOs.Backoffice.Tenant;
using PlotCAD.Application.DTOs.Common;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface IBackofficeTenantService
    {
        Task<ListResponse<BackofficeTenantResponse>> GetPagedAsync(BackofficeTenantListRequest request, CancellationToken ct = default);
        Task<BackofficeTenantResponse?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task UpdateSubscriptionAsync(Guid id, UpdateTenantSubscriptionRequest request, CancellationToken ct = default);
    }
}

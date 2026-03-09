using PlotCAD.Application.DTOs.Backoffice;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface IBackofficeUserService
    {
        Task<PagedResponse<BackofficeUserResponse>> GetPagedAsync(BackofficeUserListRequest request, CancellationToken ct = default);
        Task<BackofficeUserResponse?> GetByIdAsync(int id, CancellationToken ct = default);
        Task SetActiveAsync(int id, bool isActive, CancellationToken ct = default);
        Task UpdateRoleAsync(int id, UpdateUserRoleRequest request, CancellationToken ct = default);
    }
}

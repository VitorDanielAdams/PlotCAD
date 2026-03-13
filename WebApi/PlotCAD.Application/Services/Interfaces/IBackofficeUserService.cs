using PlotCAD.Application.DTOs.Backoffice.User;
using PlotCAD.Application.DTOs.Common;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface IBackofficeUserService
    {
        Task<ListResponse<BackofficeUserResponse>> GetPagedAsync(BackofficeUserListRequest request, CancellationToken ct = default);
        Task<BackofficeUserResponse?> GetByIdAsync(int id, CancellationToken ct = default);
        Task SetActiveAsync(int id, bool isActive, CancellationToken ct = default);
        Task UpdateRoleAsync(int id, UpdateUserRoleRequest request, CancellationToken ct = default);
    }
}

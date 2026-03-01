using PlotCAD.Application.DTOs.Auth;
using PlotCAD.Application.DTOs.Common;
using PlotCAD.Application.DTOs.Tenant;
using PlotCAD.Application.DTOs.User;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserResponse> AddAsync(CreateTenantUserRequest request, CancellationToken cancellationToken = default);
        Task<UserResponse> GetCurrenUserAsync(CancellationToken cancellationToken = default);
        Task<UserResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<UserResponse>> GetAllActiveAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<UserResponse>> GetUsersByRoleAsync(Role role, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
        Task<bool> EmailExistsAsync(string email, int? excludeUserId = null, CancellationToken cancellationToken = default);

        // User management operations
        Task<ListResponse<UserResponse>> ListAsync(ListRequest<UserListFilter> args, CancellationToken cancellationToken = default);
        Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
        Task<UserResponse> UpdateAsync(int id, UpdateUserRequest request, CancellationToken cancellationToken = default);
        Task ToggleActiveAsync(int id, CancellationToken cancellationToken = default);
        Task ChangePasswordAsync(int id, string newPassword, CancellationToken cancellationToken = default);
        Task<PlanInfoResponse> GetPlanInfoAsync(CancellationToken cancellationToken = default);
    }
}

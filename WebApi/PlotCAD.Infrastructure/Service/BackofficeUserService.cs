using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Infrastructure.Service
{
    public class BackofficeUserService : IBackofficeUserService
    {
        private readonly IBackofficeUserRepository _userRepository;

        public BackofficeUserService(IBackofficeUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<PagedResponse<BackofficeUserResponse>> GetPagedAsync(BackofficeUserListRequest request, CancellationToken ct = default)
        {
            var users = await _userRepository.GetPagedAsync(
                request.Page, request.PageSize, request.Search, request.TenantId, request.Role, request.IsActive, ct);
            var count = await _userRepository.GetCountAsync(
                request.Search, request.TenantId, request.Role, request.IsActive, ct);

            var items = users.Select(u => new BackofficeUserResponse(
                u.Id,
                u.TenantId,
                u.TenantName,
                u.Name,
                u.Email,
                Enum.TryParse<Role>(u.Role, true, out var role) ? role : Role.Employee,
                u.IsActive,
                u.CreatedAt,
                u.UpdatedAt));

            return new PagedResponse<BackofficeUserResponse>(items, count, request.Page, request.PageSize);
        }

        public async Task<BackofficeUserResponse?> GetByIdAsync(int id, CancellationToken ct = default)
        {
            var u = await _userRepository.GetByIdAsync(id, ct);
            if (u == null) return null;

            return new BackofficeUserResponse(
                u.Id,
                u.TenantId,
                u.TenantName,
                u.Name,
                u.Email,
                Enum.TryParse<Role>(u.Role, true, out var role) ? role : Role.Employee,
                u.IsActive,
                u.CreatedAt,
                u.UpdatedAt);
        }

        public async Task SetActiveAsync(int id, bool isActive, CancellationToken ct = default)
        {
            _ = await _userRepository.GetByIdAsync(id, ct)
                ?? throw new KeyNotFoundException($"User {id} not found.");

            await _userRepository.SetActiveAsync(id, isActive, ct);
        }

        public async Task UpdateRoleAsync(int id, UpdateUserRoleRequest request, CancellationToken ct = default)
        {
            _ = await _userRepository.GetByIdAsync(id, ct)
                ?? throw new KeyNotFoundException($"User {id} not found.");

            await _userRepository.UpdateRoleAsync(id, request.Role, ct);
        }
    }
}

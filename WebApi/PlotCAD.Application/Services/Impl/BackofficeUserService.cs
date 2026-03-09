using Microsoft.Extensions.Logging;
using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Enums;
using System.Text.Json;

namespace PlotCAD.Application.Services.Impl
{
    public class BackofficeUserService : IBackofficeUserService
    {
        private readonly IBackofficeUserRepository _userRepository;
        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentBackofficeUser _currentUser;
        private readonly ILogger<BackofficeUserService> _logger;

        public BackofficeUserService(
            IBackofficeUserRepository userRepository,
            IAuditLogService auditLogService,
            ICurrentBackofficeUser currentUser,
            ILogger<BackofficeUserService> logger)
        {
            _userRepository = userRepository;
            _auditLogService = auditLogService;
            _currentUser = currentUser;
            _logger = logger;
        }

        public async Task<PagedResponse<BackofficeUserResponse>> GetPagedAsync(BackofficeUserListRequest request, CancellationToken ct = default)
        {
            _logger.LogInformation("Listing users: Page={Page}, PageSize={PageSize}", request.Page, request.PageSize);

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
            var user = await _userRepository.GetByIdAsync(id, ct)
                ?? throw new KeyNotFoundException($"User {id} not found.");

            await _userRepository.SetActiveAsync(id, isActive, ct);

            _logger.LogInformation("User {UserId} {Action} by manager {ManagerId}",
                id, isActive ? "activated" : "deactivated", _currentUser.ManagerId);

            await _auditLogService.LogAsync(
                _currentUser.ManagerId,
                isActive ? "user.activated" : "user.deactivated",
                "User",
                id.ToString(),
                JsonSerializer.Serialize(new { UserId = id, TenantId = user.TenantId, NewStatus = isActive }),
                _currentUser.IpAddress, ct);
        }

        public async Task UpdateRoleAsync(int id, UpdateUserRoleRequest request, CancellationToken ct = default)
        {
            var user = await _userRepository.GetByIdAsync(id, ct)
                ?? throw new KeyNotFoundException($"User {id} not found.");

            await _userRepository.UpdateRoleAsync(id, request.Role, ct);

            _logger.LogInformation("User {UserId} role changed to {Role} by manager {ManagerId}",
                id, request.Role, _currentUser.ManagerId);

            await _auditLogService.LogAsync(
                _currentUser.ManagerId,
                "user.role_changed",
                "User",
                id.ToString(),
                JsonSerializer.Serialize(new { UserId = id, OldRole = user.Role.ToString(), NewRole = request.Role.ToString() }),
                _currentUser.IpAddress, ct);
        }
    }
}

using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;
using System.Text.Json;

namespace PlotCAD.WebApi.Controllers.Backoffice
{
    [ApiController]
    [Route("api/backoffice/users")]
    [EnableCors("Backoffice")]
    public class BackofficeUserController : ControllerBase
    {
        private readonly IBackofficeUserService _userService;
        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentBackofficeUser _currentUser;
        private readonly ILogger<BackofficeUserController> _logger;

        public BackofficeUserController(
            IBackofficeUserService userService,
            IAuditLogService auditLogService,
            ICurrentBackofficeUser currentUser,
            ILogger<BackofficeUserController> logger)
        {
            _userService = userService;
            _auditLogService = auditLogService;
            _currentUser = currentUser;
            _logger = logger;
        }

        [HttpPost("list")]
        public async Task<ActionResult<ApiResponse<PagedResponse<BackofficeUserResponse>>>> List(
            [FromBody] BackofficeUserListRequest request, CancellationToken ct)
        {
            var result = await _userService.GetPagedAsync(request, ct);
            return Ok(ApiResponse<PagedResponse<BackofficeUserResponse>>.Ok(result));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse<BackofficeUserResponse>>> GetById(int id, CancellationToken ct)
        {
            var user = await _userService.GetByIdAsync(id, ct);
            if (user == null)
                return NotFound(ApiResponse<BackofficeUserResponse>.Fail("User not found"));

            return Ok(ApiResponse<BackofficeUserResponse>.Ok(user));
        }

        [HttpPatch("{id:int}/toggle-active")]
        public async Task<ActionResult<ApiResponse<object>>> ToggleActive(int id, CancellationToken ct)
        {
            var user = await _userService.GetByIdAsync(id, ct);
            if (user == null)
                return NotFound(ApiResponse<object>.Fail("User not found"));

            var newStatus = !user.IsActive;
            await _userService.SetActiveAsync(id, newStatus, ct);

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            await _auditLogService.LogAsync(
                _currentUser.ManagerId,
                newStatus ? "user.activated" : "user.deactivated",
                "User",
                id.ToString(),
                JsonSerializer.Serialize(new { UserId = id, TenantId = user.TenantId, NewStatus = newStatus }),
                ipAddress, ct);

            return Ok(ApiResponse<object?>.Ok(newStatus ? "User activated" : "User deactivated"));
        }

        [HttpPut("{id:int}/role")]
        public async Task<ActionResult<ApiResponse<object>>> UpdateRole(
            int id, [FromBody] UpdateUserRoleRequest request, CancellationToken ct)
        {
            var user = await _userService.GetByIdAsync(id, ct);
            if (user == null)
                return NotFound(ApiResponse<object>.Fail("User not found"));

            await _userService.UpdateRoleAsync(id, request, ct);

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            await _auditLogService.LogAsync(
                _currentUser.ManagerId,
                "user.role_changed",
                "User",
                id.ToString(),
                JsonSerializer.Serialize(new { UserId = id, OldRole = user.Role.ToString(), NewRole = request.Role.ToString() }),
                ipAddress, ct);

            return Ok(ApiResponse<object?>.Ok("Role updated"));
        }
    }
}

using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Enums;
using System.Security.Claims;

namespace PlotCAD.WebApi.Middleware
{
    public class AuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<AuthMiddleware> _logger;

        public AuthMiddleware(RequestDelegate next, ILogger<AuthMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ICurrentUserService currentUserService, IUserRepository userRepository)
        {
            if (context.Request.Headers.TryGetValue("X-Tenant-Key", out var tenantKey) &&
                Guid.TryParse(tenantKey, out var tenantId))
            {
                if (context.User?.Identity?.IsAuthenticated == true)
                {
                    var validationResult = await InitializeCurrentUser(context, currentUserService, userRepository, tenantId);
                    
                    if (!validationResult)
                    {
                        context.Response.StatusCode = 403;
                        await context.Response.WriteAsync("Forbidden: Invalid tenant access");
                        return;
                    }
                }
            }

            await _next(context);
        }

        private async Task<bool> InitializeCurrentUser(
            HttpContext context, 
            ICurrentUserService currentUserService, 
            IUserRepository userRepository, 
            Guid tenantId)
        {
            var user = context.User;
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return false;
            }

            var userEntity = await userRepository.GetByIdAsync(userId);
            if (userEntity == null || userEntity.TenantId != tenantId)
            {
                _logger.LogWarning(
                    "Tenant spoofing attempt detected. User {UserId} tried to access tenant {TenantId}. User's actual tenant: {ActualTenantId}",
                    userId, tenantId, userEntity?.TenantId);
                return false;
            }

            var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value ??
                user.FindFirst("role")?.Value;

            var role = roleClaim != null && Enum.TryParse<Role>(roleClaim, true, out var parsedRole)
                ? parsedRole
                : Role.Employee;

            currentUserService.SetUser(userId, role, tenantId);
            return true;
        }
    }
}

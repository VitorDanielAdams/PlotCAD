using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Enums;
using System.Security.Claims;

namespace PlotCAD.WebApi.Middleware
{
    public class AuthMiddleware
    {
        private readonly RequestDelegate _next;
        public AuthMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ICurrentUserService currentUserService)
        {

            if (context.Request.Headers.TryGetValue("X-Tenant-Key", out var tenantKey) &&
                Guid.TryParse(tenantKey, out var tenantId))
            {
                if (context.User?.Identity?.IsAuthenticated == true)
                {
                    InitializeCurrentUser(context, currentUserService, tenantId);
                }
            }

            await _next(context);
        }

        private void InitializeCurrentUser(HttpContext context, ICurrentUserService currentUserService, Guid tenantId)
        {
            var user = context.User;

            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return;
            }

            var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value ??
                user.FindFirst("role")?.Value;

            var role = roleClaim != null && Enum.TryParse<Role>(roleClaim, true, out var parsedRole)
                ? parsedRole
                : Role.Employee;

            currentUserService.SetUser(userId, role, tenantId);
        }
    }
}

using Microsoft.Extensions.Caching.Memory;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Enums;
using System.Security.Claims;
using System.Text.Json;

namespace PlotCAD.WebApi.Middleware
{
    public class AuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<AuthMiddleware> _logger;
        private readonly IMemoryCache _cache;

        public AuthMiddleware(RequestDelegate next, ILogger<AuthMiddleware> logger, IMemoryCache cache)
        {
            _next = next;
            _logger = logger;
            _cache = cache;
        }

        public async Task InvokeAsync(HttpContext context, ICurrentUserService currentUserService, ITenantService tenantService, IUserRepository userRepository)
        {
            if (context.Request.Path.StartsWithSegments("/api/internal") ||
                context.Request.Path.StartsWithSegments("/api/auth"))
            {
                await _next(context);
                return;
            }

            if (context.User?.Identity?.IsAuthenticated != true)
            {
                await _next(context);
                return;
            }

            var tenantClaim = context.User.FindFirst("tenant_id")?.Value;
            if (!Guid.TryParse(tenantClaim, out var tenantId))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized: missing tenant context");
                return;
            }

            var tenant = await tenantService.GetCachedAsync(tenantId);
            if (tenant == null)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized: tenant not found");
                return;
            }

            var status = tenant.SubscriptionStatus;

            if (tenant.SubscriptionExpiresAt.HasValue &&
                tenant.SubscriptionExpiresAt.Value < DateTimeOffset.UtcNow &&
                status == SubscriptionStatus.Active)
            {
                _ = tenantService.UpdateSubscriptionAsync(tenantId, SubscriptionStatus.Expired, tenant.SubscriptionExpiresAt);
                status = SubscriptionStatus.Expired;
            }

            if (status == SubscriptionStatus.Expired || status == SubscriptionStatus.Suspended)
            {
                context.Response.StatusCode = 402;
                context.Response.ContentType = "application/json";
                var message = status == SubscriptionStatus.Expired
                    ? "Subscription expired. Please renew your plan."
                    : "Account suspended. Please contact support.";
                await context.Response.WriteAsync(JsonSerializer.Serialize(new { message }));
                return;
            }

            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized: invalid user claim");
                return;
            }

            var roleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value
                         ?? context.User.FindFirst("role")?.Value;

            var role = roleClaim != null && Enum.TryParse<Role>(roleClaim, true, out var parsedRole)
                ? parsedRole
                : Role.Employee;

            currentUserService.SetUser(userId, role, tenantId);

            var cacheKey = $"user_check_{userId}";
            if (!_cache.TryGetValue(cacheKey, out (bool IsActive, long UpdatedAtUnix) cached))
            {
                var dbUser = await userRepository.GetByIdAsync(userId, context.RequestAborted);
                if (dbUser == null)
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsync("Unauthorized: user not found");
                    return;
                }

                cached = (dbUser.IsActive, ((DateTimeOffset)(dbUser.UpdatedAt ?? dbUser.CreatedAt)).ToUnixTimeSeconds());
                _cache.Set(cacheKey, cached, TimeSpan.FromSeconds(30));
            }

            if (!cached.IsActive)
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(JsonSerializer.Serialize(new { message = "Account has been disabled." }));
                return;
            }

            if (long.TryParse(context.User.FindFirst("user_updated_at")?.Value, out var tokenUpdatedAt)
                && tokenUpdatedAt < cached.UpdatedAtUnix)
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(JsonSerializer.Serialize(new { message = "Session expired. Please log in again." }));
                return;
            }

            await _next(context);
        }
    }
}

using Microsoft.Extensions.Caching.Memory;
using PlotCAD.Application.DTOs.Tenant;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Infrastructure.Service
{
    public class TenantService : ITenantService
    {
        private readonly ITenantRepository _tenantRepository;
        private readonly IMemoryCache _cache;

        public TenantService(ITenantRepository tenantRepository, IMemoryCache cache)
        {
            _tenantRepository = tenantRepository;
            _cache = cache;
        }

        public async Task<TenantResponse> ProvisionAsync(TenantProvisionRequest request, CancellationToken ct = default)
        {
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                PlanType = request.PlanType,
                MaxUsers = request.MaxUsers,
                SubscriptionStatus = SubscriptionStatus.Active,
                SubscriptionExpiresAt = request.SubscriptionExpiresAt,
                ExternalSubscriptionId = request.ExternalSubscriptionId,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _tenantRepository.CreateAsync(tenant, ct);

            _cache.Remove(CacheKey(tenant.Id));

            return MapToResponse(tenant);
        }

        public async Task UpdateSubscriptionAsync(Guid tenantId, SubscriptionStatus status, DateTimeOffset? expiresAt, CancellationToken ct = default)
        {
            await _tenantRepository.UpdateSubscriptionAsync(tenantId, status, expiresAt, ct);
            _cache.Remove(CacheKey(tenantId));
        }

        public async Task<Tenant?> GetCachedAsync(Guid tenantId, CancellationToken ct = default)
        {
            var key = CacheKey(tenantId);
            if (_cache.TryGetValue(key, out Tenant? cached))
                return cached;

            var tenant = await _tenantRepository.GetByIdAsync(tenantId, ct);
            if (tenant != null)
                _cache.Set(key, tenant, TimeSpan.FromMinutes(5));

            return tenant;
        }

        public async Task<bool> CanAddUserAsync(Guid tenantId, CancellationToken ct = default)
        {
            var tenant = await GetCachedAsync(tenantId, ct);
            if (tenant == null)
                return false;

            var count = await _tenantRepository.CountUsersAsync(tenantId, ct);
            return count < tenant.MaxUsers;
        }

        private static string CacheKey(Guid id) => $"tenant:{id}";

        private static TenantResponse MapToResponse(Tenant t) =>
            new(t.Id, t.Name, t.PlanType, t.MaxUsers, t.SubscriptionStatus, t.SubscriptionExpiresAt);
    }
}

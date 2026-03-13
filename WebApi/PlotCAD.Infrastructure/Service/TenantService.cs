using Microsoft.Extensions.Caching.Distributed;
using PlotCAD.Application.DTOs.PlotCad.Tenant;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;
using PlotCAD.Domain.Enums;
using System.Text.Json;

namespace PlotCAD.Infrastructure.Service
{
    public class TenantService : ITenantService
    {
        private readonly ITenantRepository _tenantRepository;
        private readonly IDistributedCache _cache;

        private static readonly DistributedCacheEntryOptions CacheOptions = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
        };

        public TenantService(ITenantRepository tenantRepository, IDistributedCache cache)
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

            await _cache.RemoveAsync(CacheKey(tenant.Id), ct);

            return MapToResponse(tenant);
        }

        public async Task UpdateSubscriptionAsync(Guid tenantId, SubscriptionStatus status, DateTimeOffset? expiresAt, CancellationToken ct = default)
        {
            await _tenantRepository.UpdateSubscriptionAsync(tenantId, status, expiresAt, ct);
            await _cache.RemoveAsync(CacheKey(tenantId), ct);
        }

        public async Task<Tenant?> GetCachedAsync(Guid tenantId, CancellationToken ct = default)
        {
            var key = CacheKey(tenantId);
            var cached = await _cache.GetStringAsync(key, ct);
            if (cached != null)
                return JsonSerializer.Deserialize<Tenant>(cached);

            var tenant = await _tenantRepository.GetByIdAsync(tenantId, ct);
            if (tenant != null)
                await _cache.SetStringAsync(key, JsonSerializer.Serialize(tenant), CacheOptions, ct);

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

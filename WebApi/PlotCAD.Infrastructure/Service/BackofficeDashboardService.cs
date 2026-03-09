using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Infrastructure.Service
{
    public class BackofficeDashboardService : IBackofficeDashboardService
    {
        private readonly IBackofficeTenantRepository _tenantRepository;
        private readonly IBackofficeUserRepository _userRepository;
        private readonly IModuleRepository _moduleRepository;

        public BackofficeDashboardService(
            IBackofficeTenantRepository tenantRepository,
            IBackofficeUserRepository userRepository,
            IModuleRepository moduleRepository)
        {
            _tenantRepository = tenantRepository;
            _userRepository = userRepository;
            _moduleRepository = moduleRepository;
        }

        public async Task<DashboardStatsResponse> GetStatsAsync(CancellationToken ct = default)
        {
            var totalTenants = await _tenantRepository.CountAllAsync(ct);
            var activeTenants = await _tenantRepository.CountByStatusAsync(SubscriptionStatus.Active, ct);
            var trialTenants = await _tenantRepository.CountByStatusAsync(SubscriptionStatus.Trial, ct);
            var expiredTenants = await _tenantRepository.CountByStatusAsync(SubscriptionStatus.Expired, ct);
            var suspendedTenants = await _tenantRepository.CountByStatusAsync(SubscriptionStatus.Suspended, ct);

            var totalUsers = await _userRepository.CountAllAsync(ct);
            var activeUsers = await _userRepository.CountActiveAsync(ct);

            var modules = await _moduleRepository.GetAllAsync(ct);
            var totalModules = modules.Count();

            return new DashboardStatsResponse(
                totalTenants,
                activeTenants,
                totalUsers,
                activeUsers,
                totalModules,
                trialTenants,
                expiredTenants,
                suspendedTenants);
        }
    }
}

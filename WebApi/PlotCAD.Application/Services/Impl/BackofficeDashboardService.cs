using Microsoft.Extensions.Logging;
using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.Services.Impl
{
    public class BackofficeDashboardService : IBackofficeDashboardService
    {
        private readonly IBackofficeTenantRepository _tenantRepository;
        private readonly IBackofficeUserRepository _userRepository;
        private readonly IModuleRepository _moduleRepository;
        private readonly ILogger<BackofficeDashboardService> _logger;

        public BackofficeDashboardService(
            IBackofficeTenantRepository tenantRepository,
            IBackofficeUserRepository userRepository,
            IModuleRepository moduleRepository,
            ILogger<BackofficeDashboardService> logger)
        {
            _tenantRepository = tenantRepository;
            _userRepository = userRepository;
            _moduleRepository = moduleRepository;
            _logger = logger;
        }

        public async Task<DashboardStatsResponse> GetStatsAsync(CancellationToken ct = default)
        {
            _logger.LogInformation("Fetching dashboard stats");

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

using Microsoft.Extensions.Logging;
using PlotCAD.Application.DTOs.Backoffice.Module;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;
using System.Text.Json;

namespace PlotCAD.Application.Services.Impl
{
    public class ModuleService : IModuleService
    {
        private readonly IModuleRepository _moduleRepository;
        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentBackofficeUser _currentUser;
        private readonly ILogger<ModuleService> _logger;

        public ModuleService(
            IModuleRepository moduleRepository,
            IAuditLogService auditLogService,
            ICurrentBackofficeUser currentUser,
            ILogger<ModuleService> logger)
        {
            _moduleRepository = moduleRepository;
            _auditLogService = auditLogService;
            _currentUser = currentUser;
            _logger = logger;
        }

        public async Task<IEnumerable<ModuleResponse>> GetAllAsync(CancellationToken ct = default)
        {
            var modules = await _moduleRepository.GetAllAsync(ct);
            return modules.Select(m => new ModuleResponse(m.Id, m.Code, m.Name, m.Description, m.IsActive, m.CreatedAt));
        }

        public async Task<ModuleResponse?> GetByIdAsync(int id, CancellationToken ct = default)
        {
            var m = await _moduleRepository.GetByIdAsync(id, ct);
            if (m == null) return null;
            return new ModuleResponse(m.Id, m.Code, m.Name, m.Description, m.IsActive, m.CreatedAt);
        }

        public async Task<ModuleResponse> CreateAsync(CreateModuleRequest request, CancellationToken ct = default)
        {
            var existing = await _moduleRepository.GetByCodeAsync(request.Code, ct);
            if (existing != null)
                throw new InvalidOperationException($"Module with code '{request.Code}' already exists.");

            var module = new Module
            {
                Code = request.Code,
                Name = request.Name,
                Description = request.Description,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };

            var created = await _moduleRepository.CreateAsync(module, ct);

            _logger.LogInformation("Module {ModuleCode} created by manager {ManagerId}", created.Code, _currentUser.ManagerId);

            await _auditLogService.LogAsync(
                _currentUser.ManagerId,
                "module.created",
                "Module",
                created.Id.ToString(),
                JsonSerializer.Serialize(new { created.Code, created.Name }),
                _currentUser.IpAddress, ct);

            return new ModuleResponse(created.Id, created.Code, created.Name, created.Description, created.IsActive, created.CreatedAt);
        }

        public async Task UpdateAsync(int id, UpdateModuleRequest request, CancellationToken ct = default)
        {
            var module = await _moduleRepository.GetByIdAsync(id, ct)
                ?? throw new KeyNotFoundException($"Module {id} not found.");

            module.Name = request.Name;
            module.Description = request.Description;
            await _moduleRepository.UpdateAsync(module, ct);

            _logger.LogInformation("Module {ModuleId} updated by manager {ManagerId}", id, _currentUser.ManagerId);

            await _auditLogService.LogAsync(
                _currentUser.ManagerId,
                "module.updated",
                "Module",
                id.ToString(),
                JsonSerializer.Serialize(new { request.Name }),
                _currentUser.IpAddress, ct);
        }

        public async Task ToggleActiveAsync(int id, bool isActive, CancellationToken ct = default)
        {
            _ = await _moduleRepository.GetByIdAsync(id, ct)
                ?? throw new KeyNotFoundException($"Module {id} not found.");

            await _moduleRepository.ToggleActiveAsync(id, isActive, ct);

            _logger.LogInformation("Module {ModuleId} {Action} by manager {ManagerId}",
                id, isActive ? "activated" : "deactivated", _currentUser.ManagerId);

            await _auditLogService.LogAsync(
                _currentUser.ManagerId,
                isActive ? "module.activated" : "module.deactivated",
                "Module",
                id.ToString(),
                null,
                _currentUser.IpAddress, ct);
        }

        public async Task<IEnumerable<TenantModuleResponse>> GetTenantModulesAsync(Guid tenantId, CancellationToken ct = default)
        {
            var tenantModules = await _moduleRepository.GetTenantModulesAsync(tenantId, ct);
            var allModules = await _moduleRepository.GetAllAsync(ct);

            var moduleDict = allModules.ToDictionary(m => m.Id);

            return tenantModules
                .Where(tm => moduleDict.ContainsKey(tm.ModuleId))
                .Select(tm =>
                {
                    var m = moduleDict[tm.ModuleId];
                    return new TenantModuleResponse(
                        tm.ModuleId, m.Code, m.Name, tm.IsEnabled, tm.EnabledAt, tm.DisabledAt);
                });
        }

        public async Task SetTenantModuleAsync(Guid tenantId, SetTenantModuleRequest request, CancellationToken ct = default)
        {
            _ = await _moduleRepository.GetByIdAsync(request.ModuleId, ct)
                ?? throw new KeyNotFoundException($"Module {request.ModuleId} not found.");

            await _moduleRepository.SetTenantModuleAsync(tenantId, request.ModuleId, request.IsEnabled, ct);

            _logger.LogInformation("Tenant {TenantId} module {ModuleId} {Action} by manager {ManagerId}",
                tenantId, request.ModuleId, request.IsEnabled ? "enabled" : "disabled", _currentUser.ManagerId);

            await _auditLogService.LogAsync(
                _currentUser.ManagerId,
                request.IsEnabled ? "tenant_module.enabled" : "tenant_module.disabled",
                "TenantModule",
                $"{tenantId}:{request.ModuleId}",
                JsonSerializer.Serialize(new { TenantId = tenantId, request.ModuleId, request.IsEnabled }),
                _currentUser.IpAddress, ct);
        }
    }
}

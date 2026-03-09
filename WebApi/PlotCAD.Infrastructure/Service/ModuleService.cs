using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;

namespace PlotCAD.Infrastructure.Service
{
    public class ModuleService : IModuleService
    {
        private readonly IModuleRepository _moduleRepository;

        public ModuleService(IModuleRepository moduleRepository)
        {
            _moduleRepository = moduleRepository;
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
            return new ModuleResponse(created.Id, created.Code, created.Name, created.Description, created.IsActive, created.CreatedAt);
        }

        public async Task UpdateAsync(int id, UpdateModuleRequest request, CancellationToken ct = default)
        {
            var module = await _moduleRepository.GetByIdAsync(id, ct)
                ?? throw new KeyNotFoundException($"Module {id} not found.");

            module.Name = request.Name;
            module.Description = request.Description;
            await _moduleRepository.UpdateAsync(module, ct);
        }

        public async Task ToggleActiveAsync(int id, bool isActive, CancellationToken ct = default)
        {
            _ = await _moduleRepository.GetByIdAsync(id, ct)
                ?? throw new KeyNotFoundException($"Module {id} not found.");

            await _moduleRepository.ToggleActiveAsync(id, isActive, ct);
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
        }
    }
}

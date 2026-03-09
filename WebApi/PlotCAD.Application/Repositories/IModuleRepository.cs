using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Repositories
{
    public interface IModuleRepository
    {
        Task<Module?> GetByIdAsync(int id, CancellationToken ct = default);
        Task<Module?> GetByCodeAsync(string code, CancellationToken ct = default);
        Task<IEnumerable<Module>> GetAllAsync(CancellationToken ct = default);
        Task<Module> CreateAsync(Module module, CancellationToken ct = default);
        Task UpdateAsync(Module module, CancellationToken ct = default);
        Task ToggleActiveAsync(int id, bool isActive, CancellationToken ct = default);
        Task<IEnumerable<TenantModule>> GetTenantModulesAsync(Guid tenantId, CancellationToken ct = default);
        Task SetTenantModuleAsync(Guid tenantId, int moduleId, bool isEnabled, CancellationToken ct = default);
    }
}

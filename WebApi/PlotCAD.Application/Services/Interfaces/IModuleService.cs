using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface IModuleService
    {
        Task<IEnumerable<ModuleResponse>> GetAllAsync(CancellationToken ct = default);
        Task<ModuleResponse?> GetByIdAsync(int id, CancellationToken ct = default);
        Task<ModuleResponse> CreateAsync(CreateModuleRequest request, CancellationToken ct = default);
        Task UpdateAsync(int id, UpdateModuleRequest request, CancellationToken ct = default);
        Task ToggleActiveAsync(int id, bool isActive, CancellationToken ct = default);
        Task<IEnumerable<TenantModuleResponse>> GetTenantModulesAsync(Guid tenantId, CancellationToken ct = default);
        Task SetTenantModuleAsync(Guid tenantId, SetTenantModuleRequest request, CancellationToken ct = default);
    }
}

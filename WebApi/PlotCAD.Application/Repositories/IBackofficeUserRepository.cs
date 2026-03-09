using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.Repositories
{
    public interface IBackofficeUserRepository
    {
        Task<IEnumerable<BackofficeUserRow>> GetPagedAsync(int page, int pageSize, string? search, Guid? tenantId, Role? role, bool? isActive, CancellationToken ct = default);
        Task<int> GetCountAsync(string? search, Guid? tenantId, Role? role, bool? isActive, CancellationToken ct = default);
        Task<BackofficeUserRow?> GetByIdAsync(int id, CancellationToken ct = default);
        Task SetActiveAsync(int id, bool isActive, CancellationToken ct = default);
        Task UpdateRoleAsync(int id, Role role, CancellationToken ct = default);
        Task<int> CountActiveAsync(CancellationToken ct = default);
        Task<int> CountAllAsync(CancellationToken ct = default);
    }

    public class BackofficeUserRow
    {
        public int Id { get; set; }
        public Guid TenantId { get; set; }
        public string TenantName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }
}

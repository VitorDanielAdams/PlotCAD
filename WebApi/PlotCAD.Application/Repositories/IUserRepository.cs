using PlotCAD.Application.Repositories.Common;
using PlotCAD.Domain.Entities;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<User> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<List<User>> ListByIsActiveAsync(bool isActive, CancellationToken cancellationToken = default);
        Task<IEnumerable<User>> GetUsersByRoleAsync(Role role, CancellationToken cancellationToken = default);
        Task<bool> EmailExistsAsync(string email, int? excludeUserId = null, CancellationToken cancellationToken = default);
    }
}

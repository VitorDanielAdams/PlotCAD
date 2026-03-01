using PlotCAD.Application.DTOs.User;
using PlotCAD.Application.Repositories.Common;
using PlotCAD.Domain.Entities;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        /// <summary>Finds a user by email without any tenant filter. Use only during authentication.</summary>
        Task<User?> GetByEmailForLoginAsync(string email, CancellationToken cancellationToken = default);
        Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<List<User>> ListByIsActiveAsync(bool isActive, CancellationToken cancellationToken = default);
        Task<IEnumerable<User>> GetUsersByRoleAsync(Role role, CancellationToken cancellationToken = default);
        Task<bool> EmailExistsAsync(string email, int? excludeUserId = null, CancellationToken cancellationToken = default);
        Task<IEnumerable<User>> GetPagedAsync(int page, int pageSize, UserListFilter? filter, CancellationToken cancellationToken = default);
        Task<int> GetCountAsync(UserListFilter? filter, CancellationToken cancellationToken = default);
        Task SetActiveAsync(int id, bool isActive, CancellationToken cancellationToken = default);
        Task ChangePasswordAsync(int id, string passwordHash, CancellationToken cancellationToken = default);
    }
}

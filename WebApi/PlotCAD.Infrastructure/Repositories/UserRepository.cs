using PlotCAD.Application.Repositories;
using PlotCAD.Domain.Entities;
using PlotCAD.Domain.Enums;
using PlotCAD.Infrastructure.Contexts;
using PlotCAD.Infrastructure.Repositories.Common;
using Microsoft.EntityFrameworkCore;

namespace PlotCAD.Infrastructure.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            return await ApplySoftDeleteFilter(_dbSet)
                .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        }

        public async Task<List<User>> ListByIsActiveAsync(bool isActive, CancellationToken cancellationToken = default)
        {
            return await ApplySoftDeleteFilter(_dbSet)
                .Where(u => u.IsActive == isActive)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<User>> GetUsersByRoleAsync(Role role, CancellationToken cancellationToken = default)
        {
            return await ApplySoftDeleteFilter(_dbSet)
                .Where(u => u.Role == role)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> EmailExistsAsync(string email, int? excludeUserId = null, CancellationToken cancellationToken = default)
        {
            var query = ApplySoftDeleteFilter(_dbSet)
                .Where(u => u.Email == email);

            if (excludeUserId.HasValue)
            {
                query = query.Where(u => u.Id != excludeUserId.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }

        public override async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await ApplySoftDeleteFilter(_dbSet)
                .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        }
    }
}

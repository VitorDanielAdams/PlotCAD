using Dapper;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;
using PlotCAD.Domain.Enums;
using PlotCAD.Infrastructure.Database;
using PlotCAD.Infrastructure.Repositories.Common;

namespace PlotCAD.Infrastructure.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(IDbConnectionFactory connectionFactory, ICurrentUserService currentUserService)
            : base(connectionFactory, currentUserService)
        {
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT Id, TenantId, Name, Email, PasswordHash, Role, IsActive, 
                    CreatedAt, UpdatedAt, DeletedAt
                FROM Users
                WHERE Email = @Email AND {BuildSoftDeleteFilter()}";

            return await QueryFirstOrDefaultAsync<User>(sql, new { Email = email, TenantId = GetCurrentTenantId() }, cancellationToken);
        }

        public async Task<List<User>> ListByIsActiveAsync(bool isActive, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT Id, TenantId, Name, Email, PasswordHash, Role, IsActive, 
                    CreatedAt, UpdatedAt, DeletedAt
                FROM Users
                WHERE IsActive = @IsActive AND {BuildSoftDeleteFilter()}
                ORDER BY Name";

            var result = await QueryAsync<User>(sql, new { IsActive = isActive, TenantId = GetCurrentTenantId() }, cancellationToken);
            return result.ToList();
        }

        public async Task<IEnumerable<User>> GetUsersByRoleAsync(Role role, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT Id, TenantId, Name, Email, PasswordHash, Role, IsActive, 
                    CreatedAt, UpdatedAt, DeletedAt
                FROM Users
                WHERE Role = @Role AND {BuildSoftDeleteFilter()}
                ORDER BY Name";

            return await QueryAsync<User>(sql, new { Role = role.ToString(), TenantId = GetCurrentTenantId() }, cancellationToken);
        }

        public async Task<bool> EmailExistsAsync(string email, int? excludeUserId = null, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT COUNT(1)
                FROM Users
                WHERE Email = @Email 
                AND (@ExcludeUserId IS NULL OR Id != @ExcludeUserId)
                AND {BuildSoftDeleteFilter()}";

            var count = await ExecuteScalarAsync<int>(sql, 
                new { Email = email, ExcludeUserId = excludeUserId, TenantId = GetCurrentTenantId() }, 
                cancellationToken);

            return count > 0;
        }

        public override async Task<User> AddAsync(User entity, CancellationToken cancellationToken = default)
        {
            var sql = @"
                INSERT INTO Users (TenantId, Name, Email, PasswordHash, Role, IsActive, CreatedAt, UpdatedAt)
                VALUES (@TenantId, @Name, @Email, @PasswordHash, @Role, @IsActive, @CreatedAt, @UpdatedAt);
                SELECT LAST_INSERT_ID();";

            var id = await ExecuteScalarAsync<int>(sql, new
            {
                TenantId = GetCurrentTenantId(),
                entity.Name,
                entity.Email,
                entity.PasswordHash,
                Role = entity.Role.ToString(),
                entity.IsActive,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            }, cancellationToken);

            entity.Id = id;
            return entity;
        }

        public override async Task UpdateAsync(User entity, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                UPDATE Users
                SET Name = @Name,
                    Email = @Email,
                    PasswordHash = @PasswordHash,
                    Role = @Role,
                    IsActive = @IsActive,
                    UpdatedAt = @UpdatedAt
                WHERE Id = @Id AND {BuildSoftDeleteFilter()}";

            await ExecuteAsync(sql, new
            {
                entity.Id,
                entity.Name,
                entity.Email,
                entity.PasswordHash,
                Role = entity.Role.ToString(),
                entity.IsActive,
                UpdatedAt = DateTimeOffset.UtcNow,
                TenantId = GetCurrentTenantId()
            }, cancellationToken);
        }
    }
}

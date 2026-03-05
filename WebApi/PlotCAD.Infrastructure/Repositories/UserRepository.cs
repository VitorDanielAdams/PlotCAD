using Dapper;
using PlotCAD.Application.DTOs.User;
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

        public async Task<User?> GetByEmailForLoginAsync(string email, CancellationToken cancellationToken = default)
        {
            const string sql = @"
                SELECT Id, TenantId, Name, Email, PasswordHash, Role, IsActive,
                    CreatedAt, UpdatedAt, DeletedAt
                FROM Users
                WHERE Email = @Email AND DeletedAt IS NULL AND IsActive = true";

            using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
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
                VALUES (@TenantId, @Name, @Email, @PasswordHash, @Role, @IsActive, @CreatedAt, @UpdatedAt)
                RETURNING Id";

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

        public async Task<IEnumerable<User>> GetPagedAsync(int page, int pageSize, UserListFilter? filter, CancellationToken cancellationToken = default)
        {
            var offset = (page - 1) * pageSize;
            var whereClause = GetListFilterWhere(filter);

            var sql = $@"
                SELECT Id, TenantId, Name, Email, PasswordHash, Role, IsActive,
                    CreatedAt, UpdatedAt, DeletedAt
                FROM Users
                WHERE {BuildSoftDeleteFilter()}
                  AND ({whereClause})
                ORDER BY Name
                LIMIT @PageSize OFFSET @Offset";

            var parameters = BuildFilterParameters(filter);
            parameters.Add("PageSize", pageSize);
            parameters.Add("Offset", offset);
            parameters.Add("TenantId", GetCurrentTenantId());

            return await QueryAsync<User>(sql, parameters, cancellationToken);
        }

        public async Task<int> GetCountAsync(UserListFilter? filter, CancellationToken cancellationToken = default)
        {
            var whereClause = GetListFilterWhere(filter);

            var sql = $@"
                SELECT COUNT(*)
                FROM Users
                WHERE {BuildSoftDeleteFilter()}
                  AND ({whereClause})";

            var parameters = BuildFilterParameters(filter);
            parameters.Add("TenantId", GetCurrentTenantId());

            return await ExecuteScalarAsync<int>(sql, parameters, cancellationToken);
        }

        public async Task SetActiveAsync(int id, bool isActive, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                UPDATE Users
                SET IsActive = @IsActive,
                    UpdatedAt = @UpdatedAt
                WHERE Id = @Id AND {BuildSoftDeleteFilter()}";

            await ExecuteAsync(sql, new
            {
                Id = id,
                IsActive = isActive,
                UpdatedAt = DateTimeOffset.UtcNow,
                TenantId = GetCurrentTenantId()
            }, cancellationToken);
        }

        public async Task ChangePasswordAsync(int id, string passwordHash, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                UPDATE Users
                SET PasswordHash = @PasswordHash,
                    UpdatedAt = @UpdatedAt
                WHERE Id = @Id AND {BuildSoftDeleteFilter()}";

            await ExecuteAsync(sql, new
            {
                Id = id,
                PasswordHash = passwordHash,
                UpdatedAt = DateTimeOffset.UtcNow,
                TenantId = GetCurrentTenantId()
            }, cancellationToken);
        }

        private string GetListFilterWhere(UserListFilter? filter)
        {
            var conditions = new List<string>();

            if (filter != null)
            {
                if (!string.IsNullOrWhiteSpace(filter.Name))
                    conditions.Add("Name ILIKE '%' || @Name || '%'");

                if (!string.IsNullOrWhiteSpace(filter.Email))
                    conditions.Add("Email ILIKE '%' || @Email || '%'");

                if (filter.IsActive.HasValue)
                    conditions.Add("IsActive = @IsActive");
            }

            return conditions.Count > 0 ? string.Join(" AND ", conditions) : "1=1";
        }

        private Dictionary<string, object> BuildFilterParameters(UserListFilter? filter)
        {
            var parameters = new Dictionary<string, object>();

            if (filter != null)
            {
                if (!string.IsNullOrWhiteSpace(filter.Name))
                    parameters.Add("Name", filter.Name);

                if (!string.IsNullOrWhiteSpace(filter.Email))
                    parameters.Add("Email", filter.Email);

                if (filter.IsActive.HasValue)
                    parameters.Add("IsActive", filter.IsActive.Value);
            }

            return parameters;
        }
    }
}

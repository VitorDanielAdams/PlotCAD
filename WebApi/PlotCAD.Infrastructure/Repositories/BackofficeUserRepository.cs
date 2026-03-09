using Dapper;
using PlotCAD.Application.Repositories;
using PlotCAD.Domain.Enums;
using PlotCAD.Infrastructure.Database;

namespace PlotCAD.Infrastructure.Repositories
{
    public class BackofficeUserRepository : IBackofficeUserRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public BackofficeUserRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<BackofficeUserRow>> GetPagedAsync(
            int page, int pageSize, string? search, Guid? tenantId, Role? role, bool? isActive, CancellationToken ct = default)
        {
            var (where, parameters) = BuildFilter(search, tenantId, role, isActive);

            var sql = $@"
                SELECT u.Id, u.TenantId, t.Name AS TenantName,
                       u.Name, u.Email, u.Role, u.IsActive,
                       u.CreatedAt, u.UpdatedAt
                FROM Users u
                INNER JOIN Tenants t ON t.Id = u.TenantId
                {where}
                ORDER BY u.CreatedAt DESC
                LIMIT @PageSize OFFSET @Offset";

            parameters.Add("PageSize", pageSize);
            parameters.Add("Offset", (page - 1) * pageSize);

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.QueryAsync<BackofficeUserRow>(sql, parameters);
        }

        public async Task<int> GetCountAsync(
            string? search, Guid? tenantId, Role? role, bool? isActive, CancellationToken ct = default)
        {
            var (where, parameters) = BuildFilter(search, tenantId, role, isActive);

            var sql = $@"
                SELECT COUNT(*)
                FROM Users u
                INNER JOIN Tenants t ON t.Id = u.TenantId
                {where}";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.ExecuteScalarAsync<int>(sql, parameters);
        }

        public async Task<BackofficeUserRow?> GetByIdAsync(int id, CancellationToken ct = default)
        {
            const string sql = @"
                SELECT u.Id, u.TenantId, t.Name AS TenantName,
                       u.Name, u.Email, u.Role, u.IsActive,
                       u.CreatedAt, u.UpdatedAt
                FROM Users u
                INNER JOIN Tenants t ON t.Id = u.TenantId
                WHERE u.Id = @Id AND u.DeletedAt IS NULL";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.QueryFirstOrDefaultAsync<BackofficeUserRow>(sql, new { Id = id });
        }

        public async Task SetActiveAsync(int id, bool isActive, CancellationToken ct = default)
        {
            const string sql = @"
                UPDATE Users
                SET IsActive = @IsActive, UpdatedAt = @UpdatedAt
                WHERE Id = @Id AND DeletedAt IS NULL";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            await connection.ExecuteAsync(sql, new
            {
                Id = id,
                IsActive = isActive,
                UpdatedAt = DateTimeOffset.UtcNow
            });
        }

        public async Task UpdateRoleAsync(int id, Role role, CancellationToken ct = default)
        {
            const string sql = @"
                UPDATE Users
                SET Role = @Role, UpdatedAt = @UpdatedAt
                WHERE Id = @Id AND DeletedAt IS NULL";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            await connection.ExecuteAsync(sql, new
            {
                Id = id,
                Role = role.ToString(),
                UpdatedAt = DateTimeOffset.UtcNow
            });
        }

        public async Task<int> CountActiveAsync(CancellationToken ct = default)
        {
            const string sql = "SELECT COUNT(*) FROM Users WHERE IsActive = true AND DeletedAt IS NULL";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.ExecuteScalarAsync<int>(sql);
        }

        public async Task<int> CountAllAsync(CancellationToken ct = default)
        {
            const string sql = "SELECT COUNT(*) FROM Users WHERE DeletedAt IS NULL";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.ExecuteScalarAsync<int>(sql);
        }

        private static (string Where, DynamicParameters Parameters) BuildFilter(
            string? search, Guid? tenantId, Role? role, bool? isActive)
        {
            var conditions = new List<string> { "u.DeletedAt IS NULL" };
            var parameters = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(search))
            {
                conditions.Add("(u.Name ILIKE @Search OR u.Email ILIKE @Search)");
                parameters.Add("Search", $"%{search}%");
            }

            if (tenantId.HasValue)
            {
                conditions.Add("u.TenantId = @TenantId");
                parameters.Add("TenantId", tenantId.Value);
            }

            if (role.HasValue)
            {
                conditions.Add("u.Role = @Role");
                parameters.Add("Role", role.Value.ToString());
            }

            if (isActive.HasValue)
            {
                conditions.Add("u.IsActive = @IsActive");
                parameters.Add("IsActive", isActive.Value);
            }

            var where = "WHERE " + string.Join(" AND ", conditions);
            return (where, parameters);
        }
    }
}

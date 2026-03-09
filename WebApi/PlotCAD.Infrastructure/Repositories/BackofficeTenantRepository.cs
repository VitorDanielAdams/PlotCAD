using Dapper;
using PlotCAD.Application.Repositories;
using PlotCAD.Domain.Entities;
using PlotCAD.Domain.Enums;
using PlotCAD.Infrastructure.Database;

namespace PlotCAD.Infrastructure.Repositories
{
    public class BackofficeTenantRepository : IBackofficeTenantRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        private class TenantRow
        {
            public Guid Id { get; set; }
            public string Name { get; set; } = "";
            public PlanType PlanType { get; set; }
            public int MaxUsers { get; set; }
            public SubscriptionStatus SubscriptionStatus { get; set; }
            public DateTimeOffset? SubscriptionExpiresAt { get; set; }
            public string? ExternalSubscriptionId { get; set; }
            public DateTimeOffset CreatedAt { get; set; }
            public DateTimeOffset? UpdatedAt { get; set; }
            public long UserCount { get; set; }
        }

        public BackofficeTenantRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<(Tenant Tenant, int UserCount)>> GetPagedAsync(
            int page, int pageSize, string? search, SubscriptionStatus? status, CancellationToken ct = default)
        {
            var conditions = new List<string>();
            var parameters = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(search))
            {
                conditions.Add("t.Name ILIKE @Search");
                parameters.Add("Search", $"%{search}%");
            }

            if (status.HasValue)
            {
                conditions.Add("t.SubscriptionStatus = @Status");
                parameters.Add("Status", (int)status.Value);
            }

            var where = conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : "";

            var sql = $@"
                SELECT t.Id, t.Name, t.PlanType, t.MaxUsers, t.SubscriptionStatus,
                       t.SubscriptionExpiresAt, t.ExternalSubscriptionId,
                       t.CreatedAt, t.UpdatedAt,
                       COUNT(u.Id) FILTER (WHERE u.DeletedAt IS NULL) AS UserCount
                FROM Tenants t
                LEFT JOIN Users u ON u.TenantId = t.Id
                {where}
                GROUP BY t.Id
                ORDER BY t.CreatedAt DESC
                LIMIT @PageSize OFFSET @Offset";

            parameters.Add("PageSize", pageSize);
            parameters.Add("Offset", (page - 1) * pageSize);

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            var rows = await connection.QueryAsync<TenantRow>(sql, parameters);

            return rows.Select(r => (
                new Tenant
                {
                    Id = r.Id,
                    Name = r.Name,
                    PlanType = r.PlanType,
                    MaxUsers = r.MaxUsers,
                    SubscriptionStatus = r.SubscriptionStatus,
                    SubscriptionExpiresAt = r.SubscriptionExpiresAt,
                    ExternalSubscriptionId = r.ExternalSubscriptionId,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt
                },
                (int)r.UserCount
            ));
        }

        public async Task<int> GetCountAsync(string? search, SubscriptionStatus? status, CancellationToken ct = default)
        {
            var conditions = new List<string>();
            var parameters = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(search))
            {
                conditions.Add("Name ILIKE @Search");
                parameters.Add("Search", $"%{search}%");
            }

            if (status.HasValue)
            {
                conditions.Add("SubscriptionStatus = @Status");
                parameters.Add("Status", (int)status.Value);
            }

            var where = conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : "";
            var sql = $"SELECT COUNT(*) FROM Tenants {where}";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.ExecuteScalarAsync<int>(sql, parameters);
        }

        public async Task<(Tenant? Tenant, int UserCount)> GetByIdWithCountAsync(Guid id, CancellationToken ct = default)
        {
            const string sql = @"
                SELECT t.Id, t.Name, t.PlanType, t.MaxUsers, t.SubscriptionStatus,
                       t.SubscriptionExpiresAt, t.ExternalSubscriptionId,
                       t.CreatedAt, t.UpdatedAt,
                       COUNT(u.Id) FILTER (WHERE u.DeletedAt IS NULL) AS UserCount
                FROM Tenants t
                LEFT JOIN Users u ON u.TenantId = t.Id
                WHERE t.Id = @Id
                GROUP BY t.Id";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            var row = await connection.QueryFirstOrDefaultAsync<TenantRow>(sql, new { Id = id });

            if (row == null)
                return (null, 0);

            return (new Tenant
            {
                Id = row.Id,
                Name = row.Name,
                PlanType = row.PlanType,
                MaxUsers = row.MaxUsers,
                SubscriptionStatus = row.SubscriptionStatus,
                SubscriptionExpiresAt = row.SubscriptionExpiresAt,
                ExternalSubscriptionId = row.ExternalSubscriptionId,
                CreatedAt = row.CreatedAt,
                UpdatedAt = row.UpdatedAt
            }, (int)row.UserCount);
        }

        public async Task UpdateAsync(Guid id, SubscriptionStatus? status, DateTimeOffset? expiresAt,
            PlanType? planType, int? maxUsers, CancellationToken ct = default)
        {
            var setClauses = new List<string> { "UpdatedAt = @UpdatedAt" };
            var parameters = new DynamicParameters();
            parameters.Add("Id", id);
            parameters.Add("UpdatedAt", DateTimeOffset.UtcNow);

            if (status.HasValue)
            {
                setClauses.Add("SubscriptionStatus = @Status");
                parameters.Add("Status", (int)status.Value);
            }

            if (expiresAt.HasValue)
            {
                setClauses.Add("SubscriptionExpiresAt = @ExpiresAt");
                parameters.Add("ExpiresAt", expiresAt.Value);
            }

            if (planType.HasValue)
            {
                setClauses.Add("PlanType = @PlanType");
                parameters.Add("PlanType", (int)planType.Value);
            }

            if (maxUsers.HasValue)
            {
                setClauses.Add("MaxUsers = @MaxUsers");
                parameters.Add("MaxUsers", maxUsers.Value);
            }

            var sql = $"UPDATE Tenants SET {string.Join(", ", setClauses)} WHERE Id = @Id";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            await connection.ExecuteAsync(sql, parameters);
        }

        public async Task<int> CountByStatusAsync(SubscriptionStatus status, CancellationToken ct = default)
        {
            const string sql = "SELECT COUNT(*) FROM Tenants WHERE SubscriptionStatus = @Status";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.ExecuteScalarAsync<int>(sql, new { Status = (int)status });
        }

        public async Task<int> CountAllAsync(CancellationToken ct = default)
        {
            const string sql = "SELECT COUNT(*) FROM Tenants";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.ExecuteScalarAsync<int>(sql);
        }
    }
}

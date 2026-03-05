using Dapper;
using PlotCAD.Application.Repositories;
using PlotCAD.Domain.Entities;
using PlotCAD.Domain.Enums;
using PlotCAD.Infrastructure.Database;

namespace PlotCAD.Infrastructure.Repositories
{
    public class TenantRepository : ITenantRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public TenantRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<Tenant?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            var sql = @"
                SELECT Id, Name, PlanType, MaxUsers, SubscriptionStatus,
                       SubscriptionExpiresAt, ExternalSubscriptionId, CreatedAt, UpdatedAt
                FROM Tenants
                WHERE Id = @Id";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.QueryFirstOrDefaultAsync<Tenant>(sql, new { Id = id });
        }

        public async Task<Tenant> CreateAsync(Tenant tenant, CancellationToken ct = default)
        {
            var sql = @"
                INSERT INTO Tenants (Id, Name, PlanType, MaxUsers, SubscriptionStatus,
                                     SubscriptionExpiresAt, ExternalSubscriptionId, CreatedAt, UpdatedAt)
                VALUES (@Id, @Name, @PlanType, @MaxUsers, @SubscriptionStatus,
                        @SubscriptionExpiresAt, @ExternalSubscriptionId, @CreatedAt, @UpdatedAt)";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            await connection.ExecuteAsync(sql, new
            {
                Id = tenant.Id,
                tenant.Name,
                PlanType = (int)tenant.PlanType,
                tenant.MaxUsers,
                SubscriptionStatus = (int)tenant.SubscriptionStatus,
                tenant.SubscriptionExpiresAt,
                tenant.ExternalSubscriptionId,
                tenant.CreatedAt,
                tenant.UpdatedAt
            });

            return tenant;
        }

        public async Task UpdateSubscriptionAsync(Guid id, SubscriptionStatus status, DateTimeOffset? expiresAt, CancellationToken ct = default)
        {
            var sql = @"
                UPDATE Tenants
                SET SubscriptionStatus = @Status,
                    SubscriptionExpiresAt = @ExpiresAt,
                    UpdatedAt = @UpdatedAt
                WHERE Id = @Id";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            await connection.ExecuteAsync(sql, new
            {
                Id = id,
                Status = (int)status,
                ExpiresAt = expiresAt,
                UpdatedAt = DateTimeOffset.UtcNow
            });
        }

        public async Task<int> CountUsersAsync(Guid tenantId, CancellationToken ct = default)
        {
            var sql = @"
                SELECT COUNT(*)
                FROM Users
                WHERE TenantId = @TenantId AND DeletedAt IS NULL";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.ExecuteScalarAsync<int>(sql, new { TenantId = tenantId });
        }
    }
}

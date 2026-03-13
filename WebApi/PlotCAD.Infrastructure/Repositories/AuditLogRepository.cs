using Dapper;
using PlotCAD.Application.DTOs.Backoffice.AuditLog;
using PlotCAD.Application.Repositories;
using PlotCAD.Domain.Entities;
using PlotCAD.Infrastructure.Database;

namespace PlotCAD.Infrastructure.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public AuditLogRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task CreateAsync(AuditLog log, CancellationToken ct = default)
        {
            const string sql = @"
                INSERT INTO AuditLogs (ManagerId, Action, EntityType, EntityId, Details, IpAddress, CreatedAt)
                VALUES (@ManagerId, @Action, @EntityType, @EntityId, @Details::jsonb, @IpAddress, @CreatedAt)";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            await connection.ExecuteAsync(sql, new
            {
                log.ManagerId,
                log.Action,
                log.EntityType,
                log.EntityId,
                log.Details,
                log.IpAddress,
                log.CreatedAt
            });
        }

        public async Task<IEnumerable<AuditLogRow>> GetPagedAsync(int page, int pageSize, AuditLogFilter? filter, CancellationToken ct = default)
        {
            var (where, parameters) = BuildFilter(filter);

            var sql = $@"
                SELECT al.Id, al.ManagerId, bm.Name AS ManagerName, al.Action, al.EntityType, al.EntityId, al.Details, al.IpAddress, al.CreatedAt
                FROM AuditLogs al
                LEFT JOIN BackofficeManagers bm ON al.ManagerId = bm.Id
                {where}
                ORDER BY al.CreatedAt DESC
                LIMIT @PageSize OFFSET @Offset";

            parameters.Add("PageSize", pageSize);
            parameters.Add("Offset", (page - 1) * pageSize);

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.QueryAsync<AuditLogRow>(sql, parameters);
        }

        public async Task<int> GetCountAsync(AuditLogFilter? filter, CancellationToken ct = default)
        {
            var (where, parameters) = BuildFilter(filter);

            var sql = $"SELECT COUNT(*) FROM AuditLogs al {where}";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.ExecuteScalarAsync<int>(sql, parameters);
        }

        private static (string Where, DynamicParameters Parameters) BuildFilter(AuditLogFilter? filter)
        {
            var conditions = new List<string>();
            var parameters = new DynamicParameters();

            if (filter?.ManagerId != null)
            {
                conditions.Add("al.ManagerId = @ManagerId");
                parameters.Add("ManagerId", filter.ManagerId);
            }

            if (!string.IsNullOrWhiteSpace(filter?.EntityType))
            {
                conditions.Add("al.EntityType = @EntityType");
                parameters.Add("EntityType", filter.EntityType);
            }

            if (!string.IsNullOrWhiteSpace(filter?.Action))
            {
                conditions.Add("al.Action = @Action");
                parameters.Add("Action", filter.Action);
            }

            if (filter?.FromDate != null)
            {
                conditions.Add("al.CreatedAt >= @FromDate");
                parameters.Add("FromDate", filter.FromDate);
            }

            if (filter?.ToDate != null)
            {
                conditions.Add("al.CreatedAt <= @ToDate");
                parameters.Add("ToDate", filter.ToDate);
            }

            var where = conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : "";
            return (where, parameters);
        }
    }
}

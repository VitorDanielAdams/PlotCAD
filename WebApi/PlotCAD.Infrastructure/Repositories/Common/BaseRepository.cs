using Dapper;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities.Common;
using PlotCAD.Infrastructure.Database;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Reflection;

namespace PlotCAD.Infrastructure.Repositories.Common
{
    public abstract class BaseRepository<T> where T : BaseEntity
    {
        protected readonly IDbConnectionFactory _connectionFactory;
        protected readonly ICurrentUserService _currentUserService;
        protected readonly string _tableName;

        protected BaseRepository(IDbConnectionFactory connectionFactory, ICurrentUserService currentUserService)
        {
            _connectionFactory = connectionFactory ?? throw new ArgumentNullException(nameof(connectionFactory));
            _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
            _tableName = GetTableName();
        }

        public virtual async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT * 
                FROM {_tableName}
                WHERE Id = @Id AND {BuildSoftDeleteFilter()}";

            return await QueryFirstOrDefaultAsync<T>(sql, new { Id = id, TenantId = GetCurrentTenantId() }, cancellationToken);
        }

        public virtual async Task<T?> GetByIdIncludingDeletedAsync(int id, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT * 
                FROM {_tableName}
                WHERE Id = @Id AND TenantId = @TenantId";

            return await QueryFirstOrDefaultAsync<T>(sql, new { Id = id, TenantId = GetCurrentTenantId() }, cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT * 
                FROM {_tableName}
                WHERE {BuildSoftDeleteFilter()}
                ORDER BY Id";

            return await QueryAsync<T>(sql, CreateTenantParam(), cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> GetAllIncludingDeletedAsync(CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT * 
                FROM {_tableName}
                WHERE TenantId = @TenantId
                ORDER BY Id";

            return await QueryAsync<T>(sql, CreateTenantParam(), cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> GetDeletedAsync(CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT * 
                FROM {_tableName}
                WHERE DeletedAt IS NOT NULL AND TenantId = @TenantId
                ORDER BY DeletedAt DESC";

            return await QueryAsync<T>(sql, CreateTenantParam(), cancellationToken);
        }

        public virtual async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
        {
            entity.TenantId = GetCurrentTenantId();
            entity.CreatedAt = DateTimeOffset.UtcNow;
            entity.UpdatedAt = DateTimeOffset.UtcNow;

            var properties = GetInsertProperties();
            var columns = string.Join(", ", properties.Select(p => p.Name));
            var values = string.Join(", ", properties.Select(p => $"@{p.Name}"));

            var sql = $@"
                INSERT INTO {_tableName} ({columns})
                VALUES ({values});
                SELECT LAST_INSERT_ID();";

            var id = await ExecuteScalarAsync<int>(sql, entity, cancellationToken);
            entity.Id = id;

            return entity;
        }

        public virtual async Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
        {
            entity.UpdatedAt = DateTimeOffset.UtcNow;

            var properties = GetUpdateProperties();
            var setClause = string.Join(", ", properties.Select(p => $"{p.Name} = @{p.Name}"));

            var sql = $@"
                UPDATE {_tableName}
                SET {setClause}
                WHERE Id = @Id AND {BuildSoftDeleteFilter()}";

            await ExecuteAsync(sql, entity, cancellationToken);
        }

        public virtual async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                UPDATE {_tableName}
                SET DeletedAt = @DeletedAt,
                    UpdatedAt = @UpdatedAt
                WHERE Id = @Id AND {BuildSoftDeleteFilter()}";

            await ExecuteAsync(sql, new
            {
                Id = id,
                DeletedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                TenantId = GetCurrentTenantId()
            }, cancellationToken);
        }

        public virtual async Task RestoreAsync(int id, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                UPDATE {_tableName}
                SET DeletedAt = NULL,
                    UpdatedAt = @UpdatedAt
                WHERE Id = @Id AND TenantId = @TenantId AND DeletedAt IS NOT NULL";

            await ExecuteAsync(sql, new
            {
                Id = id,
                UpdatedAt = DateTimeOffset.UtcNow,
                TenantId = GetCurrentTenantId()
            }, cancellationToken);
        }

        public virtual async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT COUNT(1)
                FROM {_tableName}
                WHERE Id = @Id AND {BuildSoftDeleteFilter()}";

            var count = await ExecuteScalarAsync<int>(sql, new { Id = id, TenantId = GetCurrentTenantId() }, cancellationToken);
            return count > 0;
        }

        public virtual async Task<bool> ExistsIncludingDeletedAsync(int id, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT COUNT(1)
                FROM {_tableName}
                WHERE Id = @Id AND TenantId = @TenantId";

            var count = await ExecuteScalarAsync<int>(sql, new { Id = id, TenantId = GetCurrentTenantId() }, cancellationToken);
            return count > 0;
        }

        public virtual async Task<bool> IsDeletedAsync(int id, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT COUNT(1)
                FROM {_tableName}
                WHERE Id = @Id AND TenantId = @TenantId AND DeletedAt IS NOT NULL";

            var count = await ExecuteScalarAsync<int>(sql, new { Id = id, TenantId = GetCurrentTenantId() }, cancellationToken);
            return count > 0;
        }

        public virtual async Task<int> CountAsync(CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT COUNT(*)
                FROM {_tableName}
                WHERE {BuildSoftDeleteFilter()}";

            return await ExecuteScalarAsync<int>(sql, CreateTenantParam(), cancellationToken);
        }

        public virtual async Task<int> CountIncludingDeletedAsync(CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT COUNT(*)
                FROM {_tableName}
                WHERE TenantId = @TenantId";

            return await ExecuteScalarAsync<int>(sql, CreateTenantParam(), cancellationToken);
        }

        public virtual async Task<int> CountDeletedAsync(CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT COUNT(*)
                FROM {_tableName}
                WHERE DeletedAt IS NOT NULL AND TenantId = @TenantId";

            return await ExecuteScalarAsync<int>(sql, CreateTenantParam(), cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var offset = (page - 1) * pageSize;
            var sql = $@"
                SELECT * 
                FROM {_tableName}
                WHERE {BuildSoftDeleteFilter()}
                ORDER BY Id
                LIMIT @PageSize OFFSET @Offset";

            return await QueryAsync<T>(sql,
                new { PageSize = pageSize, Offset = offset, TenantId = GetCurrentTenantId() },
                cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> GetPagedIncludingDeletedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var offset = (page - 1) * pageSize;
            var sql = $@"
                SELECT * 
                FROM {_tableName}
                WHERE TenantId = @TenantId
                ORDER BY Id
                LIMIT @PageSize OFFSET @Offset";

            return await QueryAsync<T>(sql,
                new { PageSize = pageSize, Offset = offset, TenantId = GetCurrentTenantId() },
                cancellationToken);
        }

        protected async Task<int> ExecuteAsync(string sql, object? param = null, CancellationToken cancellationToken = default)
        {
            using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
            return await connection.ExecuteAsync(sql, param);
        }

        protected async Task<T?> QueryFirstOrDefaultAsync<TResult>(string sql, object? param = null, CancellationToken cancellationToken = default)
        {
            using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
            return await connection.QueryFirstOrDefaultAsync<T>(sql, param);
        }

        protected async Task<IEnumerable<TResult>> QueryAsync<TResult>(string sql, object? param = null, CancellationToken cancellationToken = default)
        {
            using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
            return await connection.QueryAsync<TResult>(sql, param);
        }

        protected async Task<TResult?> ExecuteScalarAsync<TResult>(string sql, object? param = null, CancellationToken cancellationToken = default)
        {
            using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
            return await connection.ExecuteScalarAsync<TResult>(sql, param);
        }

        protected Guid GetCurrentTenantId() => _currentUserService.GetTenantId();

        protected string BuildSoftDeleteFilter(string tableAlias = "")
        {
            var prefix = string.IsNullOrEmpty(tableAlias) ? "" : $"{tableAlias}.";
            return $"{prefix}DeletedAt IS NULL AND {prefix}TenantId = @TenantId";
        }

        protected object CreateTenantParam() => new { TenantId = GetCurrentTenantId() };

        private string GetTableName()
        {
            var tableAttribute = typeof(T).GetCustomAttribute<TableAttribute>();
            return tableAttribute?.Name ?? $"{typeof(T).Name}s";
        }

        private IEnumerable<PropertyInfo> GetInsertProperties()
        {
            return typeof(T).GetProperties()
                .Where(p => p.Name != "Id" &&
                           p.Name != "IsDeleted" &&
                           p.CanWrite);
        }

        private IEnumerable<PropertyInfo> GetUpdateProperties()
        {
            return typeof(T).GetProperties()
                .Where(p => p.Name != "Id" &&
                           p.Name != "TenantId" &&
                           p.Name != "CreatedAt" &&
                           p.Name != "IsDeleted" &&
                           p.CanWrite);
        }
    }
}

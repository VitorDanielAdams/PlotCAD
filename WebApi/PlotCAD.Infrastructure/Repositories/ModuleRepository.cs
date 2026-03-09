using Dapper;
using PlotCAD.Application.Repositories;
using PlotCAD.Domain.Entities;
using PlotCAD.Infrastructure.Database;

namespace PlotCAD.Infrastructure.Repositories
{
    public class ModuleRepository : IModuleRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public ModuleRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<Module?> GetByIdAsync(int id, CancellationToken ct = default)
        {
            const string sql = @"
                SELECT Id, Code, Name, Description, IsActive, CreatedAt
                FROM Modules
                WHERE Id = @Id";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.QueryFirstOrDefaultAsync<Module>(sql, new { Id = id });
        }

        public async Task<Module?> GetByCodeAsync(string code, CancellationToken ct = default)
        {
            const string sql = @"
                SELECT Id, Code, Name, Description, IsActive, CreatedAt
                FROM Modules
                WHERE Code = @Code";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.QueryFirstOrDefaultAsync<Module>(sql, new { Code = code });
        }

        public async Task<IEnumerable<Module>> GetAllAsync(CancellationToken ct = default)
        {
            const string sql = @"
                SELECT Id, Code, Name, Description, IsActive, CreatedAt
                FROM Modules
                ORDER BY Name";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.QueryAsync<Module>(sql);
        }

        public async Task<Module> CreateAsync(Module module, CancellationToken ct = default)
        {
            const string sql = @"
                INSERT INTO Modules (Code, Name, Description, IsActive, CreatedAt)
                VALUES (@Code, @Name, @Description, @IsActive, @CreatedAt)
                RETURNING Id";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            module.Id = await connection.ExecuteScalarAsync<int>(sql, new
            {
                module.Code,
                module.Name,
                module.Description,
                module.IsActive,
                module.CreatedAt
            });
            return module;
        }

        public async Task UpdateAsync(Module module, CancellationToken ct = default)
        {
            const string sql = @"
                UPDATE Modules
                SET Name = @Name, Description = @Description
                WHERE Id = @Id";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            await connection.ExecuteAsync(sql, new { module.Id, module.Name, module.Description });
        }

        public async Task ToggleActiveAsync(int id, bool isActive, CancellationToken ct = default)
        {
            const string sql = @"
                UPDATE Modules
                SET IsActive = @IsActive
                WHERE Id = @Id";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            await connection.ExecuteAsync(sql, new { Id = id, IsActive = isActive });
        }

        public async Task<IEnumerable<TenantModule>> GetTenantModulesAsync(Guid tenantId, CancellationToken ct = default)
        {
            const string sql = @"
                SELECT tm.Id, tm.TenantId, tm.ModuleId, tm.IsEnabled, tm.EnabledAt, tm.DisabledAt
                FROM TenantModules tm
                WHERE tm.TenantId = @TenantId";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.QueryAsync<TenantModule>(sql, new { TenantId = tenantId });
        }

        public async Task SetTenantModuleAsync(Guid tenantId, int moduleId, bool isEnabled, CancellationToken ct = default)
        {
            const string sql = @"
                INSERT INTO TenantModules (TenantId, ModuleId, IsEnabled, EnabledAt, DisabledAt)
                VALUES (@TenantId, @ModuleId, @IsEnabled, @EnabledAt, @DisabledAt)
                ON CONFLICT (TenantId, ModuleId)
                DO UPDATE SET IsEnabled = @IsEnabled,
                              EnabledAt = CASE WHEN @IsEnabled THEN @EnabledAt ELSE TenantModules.EnabledAt END,
                              DisabledAt = CASE WHEN @IsEnabled THEN NULL ELSE @DisabledAt END";

            var now = DateTimeOffset.UtcNow;
            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            await connection.ExecuteAsync(sql, new
            {
                TenantId = tenantId,
                ModuleId = moduleId,
                IsEnabled = isEnabled,
                EnabledAt = now,
                DisabledAt = isEnabled ? (DateTimeOffset?)null : now
            });
        }
    }
}

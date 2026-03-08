using PlotCAD.Application.DTOs.Employee;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;
using PlotCAD.Infrastructure.Database;
using PlotCAD.Infrastructure.Repositories.Common;

namespace PlotCAD.Infrastructure.Repositories
{
    public class EmployeeRepository : BaseRepository<Employee>, IEmployeeRepository
    {
        private readonly IFieldEncryptionService _encryption;

        public EmployeeRepository(
            IDbConnectionFactory connectionFactory,
            ICurrentUserService currentUserService,
            IFieldEncryptionService encryption)
            : base(connectionFactory, currentUserService)
        {
            _encryption = encryption;
        }

        private void DecryptFields(Employee entity)
        {
            entity.Name = _encryption.Decrypt(entity.Name)!;
            entity.Phone = _encryption.Decrypt(entity.Phone)!;
            entity.Email = _encryption.Decrypt(entity.Email)!;
        }

        public override async Task<Employee> AddAsync(Employee entity, CancellationToken cancellationToken = default)
        {
            var sql = @"
                INSERT INTO Employees (TenantId, Name, Phone, Email, Position, IsActive, UserId, CreatedAt, UpdatedAt)
                VALUES (@TenantId, @Name, @Phone, @Email, @Position, @IsActive, @UserId, @CreatedAt, @UpdatedAt)
                RETURNING Id";

            var id = await ExecuteScalarAsync<int>(sql, new
            {
                TenantId = GetCurrentTenantId(),
                Name = _encryption.Encrypt(entity.Name),
                Phone = _encryption.Encrypt(entity.Phone),
                Email = _encryption.Encrypt(entity.Email),
                entity.Position,
                entity.IsActive,
                entity.UserId,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            }, cancellationToken);

            entity.Id = id;
            return entity;
        }

        public override async Task UpdateAsync(Employee entity, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                UPDATE Employees
                SET Name = @Name,
                    Phone = @Phone,
                    Email = @Email,
                    Position = @Position,
                    UpdatedAt = @UpdatedAt
                WHERE Id = @Id AND {BuildSoftDeleteFilter()}";

            await ExecuteAsync(sql, new
            {
                entity.Id,
                Name = _encryption.Encrypt(entity.Name),
                Phone = _encryption.Encrypt(entity.Phone),
                Email = _encryption.Encrypt(entity.Email),
                entity.Position,
                UpdatedAt = DateTimeOffset.UtcNow,
                TenantId = GetCurrentTenantId()
            }, cancellationToken);
        }

        public override async Task<Employee?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var employee = await base.GetByIdAsync(id, cancellationToken);

            if (employee is not null)
                DecryptFields(employee);

            return employee;
        }

        public override async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                UPDATE Employees
                SET DeletedAt = @DeletedAt,
                    UpdatedAt = @UpdatedAt,
                    IsActive = false
                WHERE Id = @Id AND {BuildSoftDeleteFilter()}";

            await ExecuteAsync(sql, new
            {
                Id = id,
                DeletedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                TenantId = GetCurrentTenantId()
            }, cancellationToken);
        }

        public async Task<IEnumerable<Employee>> GetAllAsync(EmployeeListFilter? filter, CancellationToken cancellationToken = default)
        {
            var whereClause = GetListFilterWhere(filter, includeName: false);

            var sql = $@"
                SELECT *
                FROM Employees
                WHERE {BuildSoftDeleteFilter()}
                  AND ({whereClause})
                ORDER BY Name";

            var parameters = BuildFilterParameters(filter, includeName: false);
            parameters.Add("TenantId", GetCurrentTenantId());

            var results = await QueryAsync<Employee>(sql, parameters, cancellationToken);

            foreach (var e in results)
                DecryptFields(e);

            return results;
        }

        public async Task<IEnumerable<Employee>> GetPagedAsync(int page, int pageSize, EmployeeListFilter? filter, CancellationToken cancellationToken = default)
        {
            var offset = (page - 1) * pageSize;
            var whereClause = GetListFilterWhere(filter);

            var sql = $@"
                SELECT *
                FROM Employees
                WHERE {BuildSoftDeleteFilter()}
                  AND ({whereClause})
                ORDER BY Name
                LIMIT @PageSize OFFSET @Offset";

            var parameters = BuildFilterParameters(filter);
            parameters.Add("PageSize", pageSize);
            parameters.Add("Offset", offset);
            parameters.Add("TenantId", GetCurrentTenantId());

            var results = await QueryAsync<Employee>(sql, parameters, cancellationToken);

            foreach (var e in results)
                DecryptFields(e);

            return results;
        }

        public async Task<int> GetCountAsync(EmployeeListFilter? filter, CancellationToken cancellationToken = default)
        {
            var whereClause = GetListFilterWhere(filter);

            var sql = $@"
                SELECT COUNT(*)
                FROM Employees
                WHERE {BuildSoftDeleteFilter()}
                  AND ({whereClause})";

            var parameters = BuildFilterParameters(filter);
            parameters.Add("TenantId", GetCurrentTenantId());

            return await ExecuteScalarAsync<int>(sql, parameters, cancellationToken);
        }

        public async Task SetActiveAsync(int id, bool isActive, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                UPDATE Employees
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

        public async Task<Employee?> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                SELECT *
                FROM Employees
                WHERE UserId = @UserId AND {BuildSoftDeleteFilter()}
                LIMIT 1";

            var employee = await QueryFirstOrDefaultAsync<Employee>(sql, new { UserId = userId, TenantId = GetCurrentTenantId() }, cancellationToken);

            if (employee is not null)
                DecryptFields(employee);

            return employee;
        }

        private string GetListFilterWhere(EmployeeListFilter? filter, bool includeName = true)
        {
            var conditions = new List<string>();

            if (filter != null)
            {
                if (includeName && !string.IsNullOrWhiteSpace(filter.Name))
                    conditions.Add("Name ILIKE '%' || @Name || '%'");

                if (filter.IsActive.HasValue)
                    conditions.Add("IsActive = @IsActive");
            }

            return conditions.Count > 0 ? string.Join(" AND ", conditions) : "1=1";
        }

        private Dictionary<string, object> BuildFilterParameters(EmployeeListFilter? filter, bool includeName = true)
        {
            var parameters = new Dictionary<string, object>();

            if (filter != null)
            {
                if (includeName && !string.IsNullOrWhiteSpace(filter.Name))
                    parameters.Add("Name", filter.Name);

                if (filter.IsActive.HasValue)
                    parameters.Add("IsActive", filter.IsActive.Value);
            }

            return parameters;
        }
    }
}

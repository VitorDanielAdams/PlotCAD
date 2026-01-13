using Dapper;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;
using PlotCAD.Infrastructure.Database;
using PlotCAD.Infrastructure.Repositories.Common;

namespace PlotCAD.Infrastructure.Repositories
{
    public class LandRepository : BaseRepository<LandEntity>, ILandRepository
    {
        public LandRepository(IDbConnectionFactory connectionFactory, ICurrentUserService currentUserService)
            : base(connectionFactory, currentUserService)
        {
        }

        public override async Task<LandEntity> AddAsync(LandEntity entity, CancellationToken cancellationToken = default)
        {
            var sql = @"
                INSERT INTO Lands (TenantId, Name, RegistrationNumber, TotalArea, Description, 
                                   Location, Expression, Path, IsActive, CreatedAt, UpdatedAt)
                VALUES (@TenantId, @Name, @RegistrationNumber, @TotalArea, @Description, 
                        @Location, @Expression, @Path, @IsActive, @CreatedAt, @UpdatedAt);
                SELECT LAST_INSERT_ID();";

            var id = await ExecuteScalarAsync<int>(sql, new
            {
                TenantId = GetCurrentTenantId(),
                entity.Name,
                entity.RegistrationNumber,
                entity.TotalArea,
                entity.Description,
                entity.Location,
                entity.Expression,
                entity.Path,
                entity.IsActive,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            }, cancellationToken);

            entity.Id = id;
            return entity;
        }

        public override async Task UpdateAsync(LandEntity entity, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                UPDATE Lands
                SET Name = @Name,
                    RegistrationNumber = @RegistrationNumber,
                    TotalArea = @TotalArea,
                    Description = @Description,
                    Location = @Location,
                    Expression = @Expression,
                    Path = @Path,
                    IsActive = @IsActive,
                    UpdatedAt = @UpdatedAt
                WHERE Id = @Id AND {BuildSoftDeleteFilter()}";

            await ExecuteAsync(sql, new
            {
                entity.Id,
                entity.Name,
                entity.RegistrationNumber,
                entity.TotalArea,
                entity.Description,
                entity.Location,
                entity.Expression,
                entity.Path,
                entity.IsActive,
                UpdatedAt = DateTimeOffset.UtcNow,
                TenantId = GetCurrentTenantId()
            }, cancellationToken);
        }

        public override async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                UPDATE Lands
                SET DeletedAt = @DeletedAt,
                    UpdatedAt = @UpdatedAt,
                    IsActive = 0
                WHERE Id = @Id AND {BuildSoftDeleteFilter()}";

            await ExecuteAsync(sql, new
            {
                Id = id,
                DeletedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                TenantId = GetCurrentTenantId()
            }, cancellationToken);
        }
    }
}

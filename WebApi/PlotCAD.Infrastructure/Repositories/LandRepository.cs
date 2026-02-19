using PlotCAD.Application.DTOs.Land.List;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;
using PlotCAD.Infrastructure.Database;
using PlotCAD.Infrastructure.Repositories.Common;

namespace PlotCAD.Infrastructure.Repositories
{
    public class LandRepository : BaseRepository<Land>, ILandRepository
    {
        public LandRepository(IDbConnectionFactory connectionFactory, ICurrentUserService currentUserService)
            : base(connectionFactory, currentUserService)
        {
        }

        public override async Task<Land> AddAsync(Land entity, CancellationToken cancellationToken = default)
        {
            var sql = @"
                INSERT INTO Lands (TenantId, UserId, Name, RegistrationNumber, Location, Client,
                    Notes, TotalArea, Perimeter, IsClosed, IsActive, CreatedAt, UpdatedAt)
                VALUES (@TenantId, @UserId, @Name, @RegistrationNumber, @Location, @Client,
                    @Notes, @TotalArea, @Perimeter, @IsClosed, @IsActive, @CreatedAt, @UpdatedAt);
                SELECT LAST_INSERT_ID();";

            var id = await ExecuteScalarAsync<int>(sql, new
            {
                TenantId = GetCurrentTenantId(),
                entity.UserId,
                entity.Name,
                entity.RegistrationNumber,
                entity.Location,
                entity.Client,
                entity.Notes,
                entity.TotalArea,
                entity.Perimeter,
                entity.IsClosed,
                entity.IsActive,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            }, cancellationToken);

            entity.Id = id;
            return entity;
        }

        public async Task AddSegmentsAsync(int landId, IEnumerable<LandSegment> segments, CancellationToken cancellationToken = default)
        {
            var sql = @"
                INSERT INTO LandSegments (TenantId, LandId, SortOrder, FromDirection, ToDirection,
                    Degrees, Minutes, Seconds, Distance, Label, BearingRaw, CreatedAt, UpdatedAt)
                VALUES (@TenantId, @LandId, @SortOrder, @FromDirection, @ToDirection,
                    @Degrees, @Minutes, @Seconds, @Distance, @Label, @BearingRaw, @CreatedAt, @UpdatedAt)";

            foreach (var segment in segments)
            {
                await ExecuteAsync(sql, new
                {
                    TenantId = GetCurrentTenantId(),
                    LandId = landId,
                    segment.SortOrder,
                    segment.FromDirection,
                    segment.ToDirection,
                    segment.Degrees,
                    segment.Minutes,
                    segment.Seconds,
                    segment.Distance,
                    segment.Label,
                    segment.BearingRaw,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                }, cancellationToken);
            }
        }

        public async Task<IEnumerable<LandSegment>> GetSegmentsByLandIdAsync(int landId, CancellationToken cancellationToken = default)
        {
            var sql = @"
                SELECT *
                FROM LandSegments
                WHERE LandId = @LandId AND DeletedAt IS NULL
                ORDER BY SortOrder";

            return await QueryAsync<LandSegment>(sql, new { LandId = landId }, cancellationToken);
        }

        public async Task<IEnumerable<Land>> GetPagedAsync(int page, int pageSize, LandListFilter? filter, CancellationToken cancellationToken = default)
        {
            var offset = (page - 1) * pageSize;
            var whereClause = GetListFilterWhere(filter);

            var sql = $@"
                SELECT *
                FROM Lands
                WHERE {BuildSoftDeleteFilter()}
                  AND ({whereClause})
                ORDER BY Id
                LIMIT @PageSize OFFSET @Offset";

            var parameters = BuildFilterParameters(filter);
            parameters.Add("PageSize", pageSize);
            parameters.Add("Offset", offset);
            parameters.Add("TenantId", GetCurrentTenantId());

            return await QueryAsync<Land>(sql, parameters, cancellationToken);
        }

        public async Task<int> GetCountAsync(LandListFilter? filter, CancellationToken cancellationToken = default)
        {
            var whereClause = GetListFilterWhere(filter);

            var sql = $@"
                SELECT COUNT(*)
                FROM Lands
                WHERE {BuildSoftDeleteFilter()}
                  AND ({whereClause})";

            var parameters = BuildFilterParameters(filter);
            parameters.Add("TenantId", GetCurrentTenantId());

            return await ExecuteScalarAsync<int>(sql, parameters, cancellationToken);
        }

        public override async Task UpdateAsync(Land entity, CancellationToken cancellationToken = default)
        {
            var sql = $@"
                UPDATE Lands
                SET Name = @Name,
                    RegistrationNumber = @RegistrationNumber,
                    Location = @Location,
                    Client = @Client,
                    Notes = @Notes,
                    TotalArea = @TotalArea,
                    Perimeter = @Perimeter,
                    IsClosed = @IsClosed,
                    IsActive = @IsActive,
                    UpdatedAt = @UpdatedAt
                WHERE Id = @Id AND {BuildSoftDeleteFilter()}";

            await ExecuteAsync(sql, new
            {
                entity.Id,
                entity.Name,
                entity.RegistrationNumber,
                entity.Location,
                entity.Client,
                entity.Notes,
                entity.TotalArea,
                entity.Perimeter,
                entity.IsClosed,
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

        private string GetListFilterWhere(LandListFilter? filter)
        {
            var conditions = new List<string>();

            if (filter != null)
            {
                if (!string.IsNullOrWhiteSpace(filter.Name))
                    conditions.Add("Name LIKE CONCAT('%', @Name, '%')");

                if (!string.IsNullOrWhiteSpace(filter.RegistrationNumber))
                    conditions.Add("RegistrationNumber LIKE CONCAT('%', @RegistrationNumber, '%')");

                if (filter.IsActive.HasValue)
                    conditions.Add("IsActive = @IsActive");
            }

            return conditions.Count > 0 ? string.Join(" AND ", conditions) : "1=1";
        }

        private Dictionary<string, object> BuildFilterParameters(LandListFilter? filter)
        {
            var parameters = new Dictionary<string, object>();

            if (filter != null)
            {
                if (!string.IsNullOrWhiteSpace(filter.Name))
                    parameters.Add("Name", filter.Name);

                if (!string.IsNullOrWhiteSpace(filter.RegistrationNumber))
                    parameters.Add("RegistrationNumber", filter.RegistrationNumber);

                if (filter.IsActive.HasValue)
                    parameters.Add("IsActive", filter.IsActive.Value);
            }

            return parameters;
        }
    }
}

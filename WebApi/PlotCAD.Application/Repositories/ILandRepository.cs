using PlotCAD.Application.DTOs.Land.List;
using PlotCAD.Application.Repositories.Common;
using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Repositories
{
    public interface ILandRepository : IRepository<Land>
    {
        Task<IEnumerable<Land>> GetPagedAsync(int page, int pageSize, LandListFilter? filter, CancellationToken cancellationToken = default);
        Task<int> GetCountAsync(LandListFilter? filter, CancellationToken cancellationToken = default);
        Task AddSegmentsAsync(int landId, IEnumerable<LandSegment> segments, CancellationToken cancellationToken = default);
        Task<IEnumerable<LandSegment>> GetSegmentsByLandIdAsync(int landId, CancellationToken cancellationToken = default);
    }
}

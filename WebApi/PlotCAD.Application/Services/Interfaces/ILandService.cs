using PlotCAD.Application.DTOs.Common;
using PlotCAD.Application.DTOs.Land;
using PlotCAD.Application.DTOs.Land.List;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface ILandService
    {
        Task<LandResponse> CreateAsync(LandSaveRequest request, CancellationToken cancellationToken = default);
        Task<ListResponse<LandListItemResponse>> ListAsync(ListRequest<LandListFilter> args, CancellationToken cancellationToken = default);
    }
}

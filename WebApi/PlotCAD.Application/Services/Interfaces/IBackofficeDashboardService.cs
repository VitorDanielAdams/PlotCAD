using PlotCAD.Application.DTOs.Backoffice;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface IBackofficeDashboardService
    {
        Task<DashboardStatsResponse> GetStatsAsync(CancellationToken ct = default);
    }
}

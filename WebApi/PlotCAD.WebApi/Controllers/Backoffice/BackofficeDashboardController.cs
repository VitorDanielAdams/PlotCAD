using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;

namespace PlotCAD.WebApi.Controllers.Backoffice
{
    [ApiController]
    [Route("api/backoffice/dashboard")]
    [EnableCors("Backoffice")]
    public class BackofficeDashboardController : ControllerBase
    {
        private readonly IBackofficeDashboardService _dashboardService;

        public BackofficeDashboardController(IBackofficeDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<DashboardStatsResponse>>> GetStats(CancellationToken ct)
        {
            var stats = await _dashboardService.GetStatsAsync(ct);
            return Ok(ApiResponse<DashboardStatsResponse>.Ok(stats));
        }
    }
}

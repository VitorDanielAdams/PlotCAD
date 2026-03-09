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
        private readonly ILogger<BackofficeDashboardController> _logger;

        public BackofficeDashboardController(
            IBackofficeDashboardService dashboardService,
            ILogger<BackofficeDashboardController> logger)
        {
            _dashboardService = dashboardService;
            _logger = logger;
        }

        [HttpGet("stats")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<DashboardStatsResponse>>> GetStats(CancellationToken ct)
        {
            try
            {
                var stats = await _dashboardService.GetStatsAsync(ct);
                return Ok(ApiResponse<DashboardStatsResponse>.Ok(stats));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching dashboard stats.");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }
    }
}

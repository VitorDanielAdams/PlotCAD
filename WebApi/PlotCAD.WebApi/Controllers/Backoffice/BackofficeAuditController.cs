using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;

namespace PlotCAD.WebApi.Controllers.Backoffice
{
    [ApiController]
    [Route("api/backoffice/audit")]
    [EnableCors("Backoffice")]
    public class BackofficeAuditController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<BackofficeAuditController> _logger;

        public BackofficeAuditController(
            IAuditLogService auditLogService,
            ILogger<BackofficeAuditController> logger)
        {
            _auditLogService = auditLogService;
            _logger = logger;
        }

        [HttpPost("list")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<PagedResponse<AuditLogResponse>>>> List(
            [FromBody] AuditLogListRequest request, CancellationToken ct)
        {
            try
            {
                var result = await _auditLogService.GetPagedAsync(request, ct);
                return Ok(ApiResponse<PagedResponse<AuditLogResponse>>.Ok(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while listing audit logs.");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }
    }
}

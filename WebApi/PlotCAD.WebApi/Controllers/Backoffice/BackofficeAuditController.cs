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

        public BackofficeAuditController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        [HttpPost("list")]
        public async Task<ActionResult<ApiResponse<PagedResponse<AuditLogResponse>>>> List(
            [FromBody] AuditLogListRequest request, CancellationToken ct)
        {
            var result = await _auditLogService.GetPagedAsync(request, ct);
            return Ok(ApiResponse<PagedResponse<AuditLogResponse>>.Ok(result));
        }
    }
}

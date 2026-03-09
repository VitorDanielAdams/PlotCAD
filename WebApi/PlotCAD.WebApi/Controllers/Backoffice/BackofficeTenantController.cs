using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;
using System.Text.Json;

namespace PlotCAD.WebApi.Controllers.Backoffice
{
    [ApiController]
    [Route("api/backoffice/tenants")]
    [EnableCors("Backoffice")]
    public class BackofficeTenantController : ControllerBase
    {
        private readonly IBackofficeTenantService _tenantService;
        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentBackofficeUser _currentUser;
        private readonly ILogger<BackofficeTenantController> _logger;

        public BackofficeTenantController(
            IBackofficeTenantService tenantService,
            IAuditLogService auditLogService,
            ICurrentBackofficeUser currentUser,
            ILogger<BackofficeTenantController> logger)
        {
            _tenantService = tenantService;
            _auditLogService = auditLogService;
            _currentUser = currentUser;
            _logger = logger;
        }

        [HttpPost("list")]
        public async Task<ActionResult<ApiResponse<PagedResponse<BackofficeTenantResponse>>>> List(
            [FromBody] BackofficeTenantListRequest request, CancellationToken ct)
        {
            var result = await _tenantService.GetPagedAsync(request, ct);
            return Ok(ApiResponse<PagedResponse<BackofficeTenantResponse>>.Ok(result));
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ApiResponse<BackofficeTenantResponse>>> GetById(Guid id, CancellationToken ct)
        {
            var tenant = await _tenantService.GetByIdAsync(id, ct);
            if (tenant == null)
                return NotFound(ApiResponse<BackofficeTenantResponse>.Fail("Tenant not found"));

            return Ok(ApiResponse<BackofficeTenantResponse>.Ok(tenant));
        }

        [HttpPut("{id:guid}/subscription")]
        public async Task<ActionResult<ApiResponse<object>>> UpdateSubscription(
            Guid id, [FromBody] UpdateTenantSubscriptionRequest request, CancellationToken ct)
        {
            var existing = await _tenantService.GetByIdAsync(id, ct);
            if (existing == null)
                return NotFound(ApiResponse<object>.Fail("Tenant not found"));

            await _tenantService.UpdateSubscriptionAsync(id, request, ct);

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            await _auditLogService.LogAsync(
                _currentUser.ManagerId,
                "tenant.subscription_updated",
                "Tenant",
                id.ToString(),
                JsonSerializer.Serialize(new { request.SubscriptionStatus, request.PlanType, request.MaxUsers }),
                ipAddress, ct);

            return Ok(ApiResponse<object?>.Ok("Subscription updated"));
        }
    }
}

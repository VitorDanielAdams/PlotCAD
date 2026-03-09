using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;
using System.Text.Json;

namespace PlotCAD.WebApi.Controllers.Backoffice
{
    [ApiController]
    [Route("api/backoffice/modules")]
    [EnableCors("Backoffice")]
    public class BackofficeModuleController : ControllerBase
    {
        private readonly IModuleService _moduleService;
        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentBackofficeUser _currentUser;
        private readonly ILogger<BackofficeModuleController> _logger;

        public BackofficeModuleController(
            IModuleService moduleService,
            IAuditLogService auditLogService,
            ICurrentBackofficeUser currentUser,
            ILogger<BackofficeModuleController> logger)
        {
            _moduleService = moduleService;
            _auditLogService = auditLogService;
            _currentUser = currentUser;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<ModuleResponse>>>> GetAll(CancellationToken ct)
        {
            var modules = await _moduleService.GetAllAsync(ct);
            return Ok(ApiResponse<IEnumerable<ModuleResponse>>.Ok(modules));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse<ModuleResponse>>> GetById(int id, CancellationToken ct)
        {
            var module = await _moduleService.GetByIdAsync(id, ct);
            if (module == null)
                return NotFound(ApiResponse<ModuleResponse>.Fail("Module not found"));

            return Ok(ApiResponse<ModuleResponse>.Ok(module));
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<ModuleResponse>>> Create(
            [FromBody] CreateModuleRequest request, CancellationToken ct)
        {
            try
            {
                var module = await _moduleService.CreateAsync(request, ct);

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                await _auditLogService.LogAsync(
                    _currentUser.ManagerId,
                    "module.created",
                    "Module",
                    module.Id.ToString(),
                    JsonSerializer.Serialize(new { module.Code, module.Name }),
                    ipAddress, ct);

                return CreatedAtAction(nameof(GetById), new { id = module.Id },
                    ApiResponse<ModuleResponse>.Ok(module));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ApiResponse<ModuleResponse>.Fail(ex.Message));
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ApiResponse<object>>> Update(
            int id, [FromBody] UpdateModuleRequest request, CancellationToken ct)
        {
            try
            {
                await _moduleService.UpdateAsync(id, request, ct);

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                await _auditLogService.LogAsync(
                    _currentUser.ManagerId,
                    "module.updated",
                    "Module",
                    id.ToString(),
                    JsonSerializer.Serialize(new { request.Name }),
                    ipAddress, ct);

                return Ok(ApiResponse<object?>.Ok("Module updated"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpPatch("{id:int}/toggle-active")]
        public async Task<ActionResult<ApiResponse<object>>> ToggleActive(int id, CancellationToken ct)
        {
            try
            {
                var module = await _moduleService.GetByIdAsync(id, ct);
                if (module == null)
                    return NotFound(ApiResponse<object>.Fail("Module not found"));

                var newStatus = !module.IsActive;
                await _moduleService.ToggleActiveAsync(id, newStatus, ct);

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                await _auditLogService.LogAsync(
                    _currentUser.ManagerId,
                    newStatus ? "module.activated" : "module.deactivated",
                    "Module",
                    id.ToString(),
                    null,
                    ipAddress, ct);

                return Ok(ApiResponse<object?>.Ok(newStatus ? "Module activated" : "Module deactivated"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpGet("tenant/{tenantId:guid}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TenantModuleResponse>>>> GetTenantModules(
            Guid tenantId, CancellationToken ct)
        {
            var modules = await _moduleService.GetTenantModulesAsync(tenantId, ct);
            return Ok(ApiResponse<IEnumerable<TenantModuleResponse>>.Ok(modules));
        }

        [HttpPost("tenant/{tenantId:guid}")]
        public async Task<ActionResult<ApiResponse<object>>> SetTenantModule(
            Guid tenantId, [FromBody] SetTenantModuleRequest request, CancellationToken ct)
        {
            try
            {
                await _moduleService.SetTenantModuleAsync(tenantId, request, ct);

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                await _auditLogService.LogAsync(
                    _currentUser.ManagerId,
                    request.IsEnabled ? "tenant_module.enabled" : "tenant_module.disabled",
                    "TenantModule",
                    $"{tenantId}:{request.ModuleId}",
                    JsonSerializer.Serialize(new { TenantId = tenantId, request.ModuleId, request.IsEnabled }),
                    ipAddress, ct);

                return Ok(ApiResponse<object?>.Ok("Tenant module updated"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
        }
    }
}

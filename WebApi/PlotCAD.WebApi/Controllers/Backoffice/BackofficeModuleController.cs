using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;

namespace PlotCAD.WebApi.Controllers.Backoffice
{
    [ApiController]
    [Route("api/backoffice/modules")]
    [EnableCors("Backoffice")]
    public class BackofficeModuleController : ControllerBase
    {
        private readonly IModuleService _moduleService;
        private readonly ILogger<BackofficeModuleController> _logger;

        public BackofficeModuleController(
            IModuleService moduleService,
            ILogger<BackofficeModuleController> logger)
        {
            _moduleService = moduleService;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<IEnumerable<ModuleResponse>>>> GetAll(CancellationToken ct)
        {
            try
            {
                var modules = await _moduleService.GetAllAsync(ct);
                return Ok(ApiResponse<IEnumerable<ModuleResponse>>.Ok(modules));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while listing modules.");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<ModuleResponse>>> GetById(int id, CancellationToken ct)
        {
            try
            {
                var module = await _moduleService.GetByIdAsync(id, ct);
                if (module == null)
                    return NotFound(ApiResponse<ModuleResponse>.Fail("Module not found"));

                return Ok(ApiResponse<ModuleResponse>.Ok(module));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting module {Id}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<ModuleResponse>>> Create(
            [FromBody] CreateModuleRequest request, CancellationToken ct)
        {
            try
            {
                var module = await _moduleService.CreateAsync(request, ct);
                return CreatedAtAction(nameof(GetById), new { id = module.Id },
                    ApiResponse<ModuleResponse>.Ok(module));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ApiResponse<ModuleResponse>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating module.");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<object>>> Update(
            int id, [FromBody] UpdateModuleRequest request, CancellationToken ct)
        {
            try
            {
                await _moduleService.UpdateAsync(id, request, ct);
                return Ok(ApiResponse<object?>.Ok("Module updated"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating module {Id}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }

        [HttpPatch("{id:int}/toggle-active")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<object>>> ToggleActive(int id, CancellationToken ct)
        {
            try
            {
                await _moduleService.ToggleActiveAsync(id, true, ct);
                return Ok(ApiResponse<object>.Ok());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while toggling active state for module {Id}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }

        [HttpGet("tenant/{tenantId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<IEnumerable<TenantModuleResponse>>>> GetTenantModules(
            Guid tenantId, CancellationToken ct)
        {
            try
            {
                var modules = await _moduleService.GetTenantModulesAsync(tenantId, ct);
                return Ok(ApiResponse<IEnumerable<TenantModuleResponse>>.Ok(modules));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting modules for tenant {TenantId}.", tenantId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }

        [HttpPost("tenant/{tenantId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<object>>> SetTenantModule(
            Guid tenantId, [FromBody] SetTenantModuleRequest request, CancellationToken ct)
        {
            try
            {
                await _moduleService.SetTenantModuleAsync(tenantId, request, ct);
                return Ok(ApiResponse<object?>.Ok("Tenant module updated"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while setting module for tenant {TenantId}.", tenantId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }
    }
}

using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;

namespace PlotCAD.WebApi.Controllers.Backoffice
{
    [ApiController]
    [Route("api/backoffice/tenants")]
    [EnableCors("Backoffice")]
    public class BackofficeTenantController : ControllerBase
    {
        private readonly IBackofficeTenantService _tenantService;
        private readonly ILogger<BackofficeTenantController> _logger;

        public BackofficeTenantController(
            IBackofficeTenantService tenantService,
            ILogger<BackofficeTenantController> logger)
        {
            _tenantService = tenantService;
            _logger = logger;
        }

        [HttpPost("list")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<PagedResponse<BackofficeTenantResponse>>>> List(
            [FromBody] BackofficeTenantListRequest request, CancellationToken ct)
        {
            try
            {
                var result = await _tenantService.GetPagedAsync(request, ct);
                return Ok(ApiResponse<PagedResponse<BackofficeTenantResponse>>.Ok(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while listing tenants.");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<BackofficeTenantResponse>>> GetById(Guid id, CancellationToken ct)
        {
            try
            {
                var tenant = await _tenantService.GetByIdAsync(id, ct);
                if (tenant == null)
                    return NotFound(ApiResponse<BackofficeTenantResponse>.Fail("Tenant not found"));

                return Ok(ApiResponse<BackofficeTenantResponse>.Ok(tenant));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting tenant {Id}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }

        [HttpPut("{id:guid}/subscription")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<object>>> UpdateSubscription(
            Guid id, [FromBody] UpdateTenantSubscriptionRequest request, CancellationToken ct)
        {
            try
            {
                await _tenantService.UpdateSubscriptionAsync(id, request, ct);
                return Ok(ApiResponse<object?>.Ok("Subscription updated"));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<object>.Fail("Tenant not found"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating subscription for tenant {Id}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }
    }
}

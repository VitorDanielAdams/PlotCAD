using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Backoffice.User;
using PlotCAD.Application.DTOs.Common;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;

namespace PlotCAD.WebApi.Controllers.Backoffice
{
    [ApiController]
    [Route("api/backoffice/users")]
    [EnableCors("Backoffice")]
    public class BackofficeUserController : ControllerBase
    {
        private readonly IBackofficeUserService _userService;
        private readonly ILogger<BackofficeUserController> _logger;

        public BackofficeUserController(
            IBackofficeUserService userService,
            ILogger<BackofficeUserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("list")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<ListResponse<BackofficeUserResponse>>>> List(
            [FromBody] BackofficeUserListRequest request, CancellationToken ct)
        {
            try
            {
                var result = await _userService.GetPagedAsync(request, ct);
                return Ok(ApiResponse<ListResponse<BackofficeUserResponse>>.Ok(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while listing users.");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<BackofficeUserResponse>>> GetById(int id, CancellationToken ct)
        {
            try
            {
                var user = await _userService.GetByIdAsync(id, ct);
                if (user == null)
                    return NotFound(ApiResponse<BackofficeUserResponse>.Fail("User not found"));

                return Ok(ApiResponse<BackofficeUserResponse>.Ok(user));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting user {Id}.", id);
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
                await _userService.SetActiveAsync(id, true, ct);
                return Ok(ApiResponse<object>.Ok());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while toggling active state for user {Id}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }

        [HttpPut("{id:int}/role")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<object>>> UpdateRole(
            int id, [FromBody] UpdateUserRoleRequest request, CancellationToken ct)
        {
            try
            {
                await _userService.UpdateRoleAsync(id, request, ct);
                return Ok(ApiResponse<object?>.Ok("Role updated"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating role for user {Id}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }
    }
}

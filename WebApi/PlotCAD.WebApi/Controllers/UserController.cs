using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Common;
using PlotCAD.Application.DTOs.User;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;
using System.Security.Authentication;

namespace PlotCAD.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserService userService, ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<UserResponse>>> Me(CancellationToken cancellationToken)
        {
            try
            {
                var response = await _userService.GetCurrenUserAsync(cancellationToken);
                return Ok(ApiResponse<UserResponse>.Ok(response));
            }
            catch (AuthenticationException ex)
            {
                _logger.LogWarning(ex, "Authentication error for current user");
                return Unauthorized(ApiResponse<object>.Fail("Invalid token"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current user");
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }

        [HttpGet("plan-info")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<PlanInfoResponse>>> PlanInfo(CancellationToken cancellationToken)
        {
            try
            {
                var response = await _userService.GetPlanInfoAsync(cancellationToken);
                return Ok(ApiResponse<PlanInfoResponse>.Ok(response));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving plan info");
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }

        [HttpPost("list")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<ListResponse<UserResponse>>>> List([FromBody] ListRequest<UserListFilter> request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _userService.ListAsync(request, cancellationToken);
                return Ok(ApiResponse<ListResponse<UserResponse>>.Ok(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing users");
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<UserResponse>>> Create([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _userService.CreateAsync(request, cancellationToken);
                return Ok(ApiResponse<UserResponse>.Ok(result));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<UserResponse>>> Update(int id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _userService.UpdateAsync(id, request, cancellationToken);
                return Ok(ApiResponse<UserResponse>.Ok(result));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {Id}", id);
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }

        [HttpPatch("{id:int}/toggle-active")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<object>>> ToggleActive(int id, CancellationToken cancellationToken)
        {
            try
            {
                await _userService.ToggleActiveAsync(id, cancellationToken);
                return Ok(ApiResponse<object>.Ok());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling active state for user {Id}", id);
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<object>>> Delete(int id, CancellationToken cancellationToken)
        {
            try
            {
                await _userService.DeleteAsync(id, cancellationToken);
                return Ok(ApiResponse<object>.Ok());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {Id}", id);
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }

        [HttpPatch("{id:int}/change-password")]
        [Authorize(Roles = "Manager")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<object>>> ChangePassword(int id, [FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
        {
            try
            {
                await _userService.ChangePasswordAsync(id, request.NewPassword, cancellationToken);
                return Ok(ApiResponse<object>.Ok());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {Id}", id);
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }
    }
}

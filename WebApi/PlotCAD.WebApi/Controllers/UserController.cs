using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        [ProducesResponseType(StatusCodes.Status404NotFound)]
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
    }
}

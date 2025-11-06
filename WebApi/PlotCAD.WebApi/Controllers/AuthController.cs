using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Auth;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;
using System.Security.Authentication;

namespace PlotCAD.WebApi.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<object>>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var response = await _authService.AuthenticateAsync(request, cancellationToken);
                AddTokenToCookie(response.Token);
                return Ok(ApiResponse<object>.Ok());
            }
            catch (UnauthorizedAccessException)
            {
                _logger.LogWarning("Failed login attempt for user: {Login}", request.Login);
                return Unauthorized(ApiResponse<object>.Fail("Invalid credentials"));
            }
            catch (AuthenticationException ex)
            {
                _logger.LogWarning(ex, "Authentication error for user: {Login}", request.Login);
                return Unauthorized(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during authentication for user: {Login}", request.Login);
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred during authentication"));
            }
        }

        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("Token", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development"
                    ? SameSiteMode.None
                    : SameSiteMode.Lax,
                Path = "/"
            });

            return Ok(ApiResponse<object>.Ok());
        }

        private void AddTokenToCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(2),
                SameSite = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development"
                    ? SameSiteMode.None
                    : SameSiteMode.Lax,
                Secure = true,
                IsEssential = true
            };
            Response.Cookies.Append("Token", token, cookieOptions);
        }
    }
}

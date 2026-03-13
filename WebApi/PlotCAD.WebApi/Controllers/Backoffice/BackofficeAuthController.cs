using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Backoffice.Auth;
using PlotCAD.Application.DTOs.Backoffice.Manager;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;
using System.Security.Authentication;

namespace PlotCAD.WebApi.Controllers.Backoffice
{
    [ApiController]
    [Route("api/backoffice/auth")]
    [EnableCors("Backoffice")]
    public class BackofficeAuthController : ControllerBase
    {
        private readonly IBackofficeAuthService _authService;
        private readonly ICurrentBackofficeUser _currentUser;
        private readonly ILogger<BackofficeAuthController> _logger;
        private readonly IConfiguration _configuration;

        public BackofficeAuthController(
            IBackofficeAuthService authService,
            ICurrentBackofficeUser currentUser,
            ILogger<BackofficeAuthController> logger,
            IConfiguration configuration)
        {
            _authService = authService;
            _currentUser = currentUser;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<object>>> Login(
            [FromBody] BackofficeLoginRequest request, CancellationToken ct)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                var response = await _authService.LoginAsync(request, ipAddress, ct);

                AddBackofficeCookie(response.Token);
                return Ok(ApiResponse<object>.Ok());
            }
            catch (UnauthorizedAccessException)
            {
                _logger.LogWarning("Failed backoffice login attempt for: {Email}", request.Email);
                return Unauthorized(ApiResponse<BackofficeLoginResponse>.Fail("Invalid credentials"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during backoffice authentication for: {Email}", request.Email);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<BackofficeLoginResponse>.Fail("An error occurred during authentication"));
            }
        }

        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Logout()
        {
            var cookieName = _configuration["Backoffice:Jwt:CookieName"] ?? "BackofficeToken";
            Response.Cookies.Delete(cookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development"
                    ? SameSiteMode.None
                    : SameSiteMode.Strict,
                Path = "/api/backoffice/"
            });

            return Ok();
        }

        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<ManagerResponseDto>>> Me()
        {
            if (_currentUser == null || !_currentUser.IsAuthenticated)
                return Unauthorized(ApiResponse<object>.Fail("Not authenticated"));

            try
            {
                var response = new ManagerResponseDto(_currentUser.ManagerId!.Value, _currentUser.Name!, _currentUser.Email!);
                return Ok(ApiResponse<ManagerResponseDto>.Ok(response));
            }
            catch (AuthenticationException ex)
            {
                _logger.LogWarning(ex, "Authentication error for current manager");
                return Unauthorized(ApiResponse<object>.Fail("Invalid token"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current manager");
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }


        private void AddBackofficeCookie(string token)
        {
            var cookieName = _configuration["Backoffice:Jwt:CookieName"] ?? "BackofficeToken";
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddHours(8),
                SameSite = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development"
                    ? SameSiteMode.None
                    : SameSiteMode.Strict,
                Secure = true,
                IsEssential = true,
                Path = "/api/backoffice/"
            };
            Response.Cookies.Append(cookieName, token, cookieOptions);
        }
    }
}

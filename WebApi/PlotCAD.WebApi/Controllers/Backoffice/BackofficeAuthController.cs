using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;

namespace PlotCAD.WebApi.Controllers.Backoffice
{
    [ApiController]
    [Route("api/backoffice/auth")]
    [EnableCors("Backoffice")]
    public class BackofficeAuthController : ControllerBase
    {
        private readonly IBackofficeAuthService _authService;
        private readonly IBackofficeManagerRepository _managerRepository;
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<BackofficeAuthController> _logger;
        private readonly IConfiguration _configuration;

        public BackofficeAuthController(
            IBackofficeAuthService authService,
            IBackofficeManagerRepository managerRepository,
            IAuditLogService auditLogService,
            ILogger<BackofficeAuthController> logger,
            IConfiguration configuration)
        {
            _authService = authService;
            _managerRepository = managerRepository;
            _auditLogService = auditLogService;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<BackofficeLoginResponse>>> Login(
            [FromBody] BackofficeLoginRequest request, CancellationToken ct)
        {
            try
            {
                var response = await _authService.AuthenticateAsync(request, ct);

                var manager = await _managerRepository.GetByEmailAsync(request.Email, ct);
                if (manager == null)
                    return Unauthorized(ApiResponse<BackofficeLoginResponse>.Fail("Invalid credentials"));

                var token = _authService.GenerateToken(manager.Id, manager.Email, manager.Name);
                AddBackofficeCookie(token);

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                await _auditLogService.LogAsync(manager.Id, "manager.login", "BackofficeManager",
                    manager.Id.ToString(), null, ipAddress, ct);

                return Ok(ApiResponse<BackofficeLoginResponse>.Ok(response));
            }
            catch (UnauthorizedAccessException)
            {
                _logger.LogWarning("Failed backoffice login attempt for: {Email}", request.Email);
                return Unauthorized(ApiResponse<BackofficeLoginResponse>.Fail("Invalid credentials"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during backoffice authentication for: {Email}", request.Email);
                return StatusCode(500, ApiResponse<BackofficeLoginResponse>.Fail("An error occurred during authentication"));
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
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

            return Ok(ApiResponse<object?>.Ok());
        }

        [HttpGet("me")]
        public IActionResult Me([FromServices] ICurrentBackofficeUser currentUser)
        {
            if (!currentUser.IsAuthenticated)
                return Unauthorized(ApiResponse<object>.Fail("Not authenticated"));

            return Ok(ApiResponse<object>.Ok(new
            {
                id = currentUser.ManagerId,
                email = currentUser.Email,
                name = currentUser.Name
            }));
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

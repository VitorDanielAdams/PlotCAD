using Microsoft.IdentityModel.Tokens;
using PlotCAD.Application.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace PlotCAD.WebApi.Middleware
{
    public class BackofficeAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<BackofficeAuthMiddleware> _logger;
        private readonly IConfiguration _configuration;

        public BackofficeAuthMiddleware(RequestDelegate next, ILogger<BackofficeAuthMiddleware> logger, IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context, ICurrentBackofficeUser currentBackofficeUser)
        {
            if (!context.Request.Path.StartsWithSegments("/api/backoffice"))
            {
                await _next(context);
                return;
            }

            if (context.Request.Path.StartsWithSegments("/api/backoffice/auth/login") ||
                context.Request.Path.StartsWithSegments("/api/backoffice/auth/logout"))
            {
                await _next(context);
                return;
            }

            var cookieName = _configuration["Backoffice:Jwt:CookieName"] ?? "BackofficeToken";
            var tokenString = context.Request.Cookies[cookieName];

            if (string.IsNullOrEmpty(tokenString))
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"message\":\"Authentication required\"}");
                return;
            }

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);

                var principal = tokenHandler.ValidateToken(tokenString, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidAudience = _configuration["Jwt:Issuer"],
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ClockSkew = TimeSpan.FromMinutes(1)
                }, out var validatedToken);

                var tokenTypeClaim = principal.FindFirst("token_type")?.Value;
                if (tokenTypeClaim != "backoffice")
                {
                    _logger.LogWarning("Non-backoffice token used on backoffice endpoint");
                    context.Response.StatusCode = 401;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync("{\"message\":\"Invalid token type\"}");
                    return;
                }

                var managerIdClaim = principal.FindFirst("manager_id")?.Value;
                var emailClaim = principal.FindFirst("manager_email")?.Value;
                var nameClaim = principal.FindFirst("manager_name")?.Value;

                if (!int.TryParse(managerIdClaim, out var managerId) || string.IsNullOrEmpty(emailClaim))
                {
                    context.Response.StatusCode = 401;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync("{\"message\":\"Invalid token claims\"}");
                    return;
                }

                currentBackofficeUser.SetManager(managerId, emailClaim, nameClaim ?? "", context.Connection.RemoteIpAddress?.ToString());
            }
            catch (SecurityTokenExpiredException)
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"message\":\"Token expired\"}");
                return;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Backoffice token validation failed");
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"message\":\"Authentication failed\"}");
                return;
            }

            await _next(context);
        }
    }
}

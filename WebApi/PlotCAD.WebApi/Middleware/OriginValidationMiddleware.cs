namespace PlotCAD.WebApi.Middleware
{
    public class OriginValidationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<OriginValidationMiddleware> _logger;
        private readonly IConfiguration _configuration;

        public OriginValidationMiddleware(RequestDelegate next, ILogger<OriginValidationMiddleware> logger, IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var origin = context.Request.Headers.Origin.FirstOrDefault();

            if (string.IsNullOrEmpty(origin))
            {
                await _next(context);
                return;
            }

            var path = context.Request.Path.Value ?? "";

            if (path.StartsWith("/api/backoffice", StringComparison.OrdinalIgnoreCase))
            {
                var allowed = GetAllowedOrigins("Frontend:BackofficeOrigins");
                if (!IsOriginAllowed(origin, allowed))
                {
                    _logger.LogWarning("Blocked request to backoffice from origin: {Origin}", origin);
                    context.Response.StatusCode = 403;
                    return;
                }
            }
            else if (path.StartsWith("/api/public", StringComparison.OrdinalIgnoreCase))
            {
                var allowed = GetAllowedOrigins("Frontend:LandingOrigins");
                if (!IsOriginAllowed(origin, allowed))
                {
                    _logger.LogWarning("Blocked request to public API from origin: {Origin}", origin);
                    context.Response.StatusCode = 403;
                    return;
                }
            }
            else if (path.StartsWith("/api/internal", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Blocked browser request to internal API from origin: {Origin}", origin);
                context.Response.StatusCode = 403;
                return;
            }
            else if (path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase))
            {
                var allowed = GetAllowedOrigins("Frontend:MainAppOrigins");
                if (!IsOriginAllowed(origin, allowed))
                {
                    _logger.LogWarning("Blocked request to main API from origin: {Origin}", origin);
                    context.Response.StatusCode = 403;
                    return;
                }
            }

            await _next(context);
        }

        private string[] GetAllowedOrigins(string configKey)
        {
            return _configuration.GetSection(configKey).Get<string[]>() ?? Array.Empty<string>();
        }

        private static bool IsOriginAllowed(string origin, string[] allowedOrigins)
        {
            return allowedOrigins.Any(allowed =>
                string.Equals(origin, allowed, StringComparison.OrdinalIgnoreCase));
        }
    }
}

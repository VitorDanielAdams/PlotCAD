using PlotCAD.Infrastructure.Logging.Extensions;
using System.Text;

namespace PlotCAD.WebApi.Middleware
{
    public class LoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<LoggingMiddleware> _logger;

        public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var requestLog = await BuildRequestLog(context.Request);
            _logger.LogInformation("REQ {Request}", requestLog);

            var originalBody = context.Response.Body;
            await using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            try
            {
                await _next(context);
            }
            finally
            {
                var responseLog = await BuildResponseLog(context.Response);
                _logger.LogInformation("RES {Response}", responseLog);

                responseBody.Seek(0, SeekOrigin.Begin);
                await responseBody.CopyToAsync(originalBody);
                context.Response.Body = originalBody;
            }
        }

        private static async Task<string> BuildRequestLog(HttpRequest request)
        {
            request.EnableBuffering();

            string body;
            using (var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true))
            {
                body = await reader.ReadToEndAsync();
                request.Body.Position = 0;
            }

            var requestSnapshot = new
            {
                request.Method,
                request.Path,
                Query = request.Query.ToDictionary(x => x.Key, x => x.Value.ToString()),
                Headers = request.Headers.ToDictionary(x => x.Key, x => x.Value.ToString()),
                Body = string.IsNullOrWhiteSpace(body) ? null : body
            };

            return requestSnapshot.ToLogString();
        }

        private static async Task<string> BuildResponseLog(HttpResponse response)
        {
            response.Body.Seek(0, SeekOrigin.Begin);

            var body = await new StreamReader(response.Body).ReadToEndAsync();
            response.Body.Seek(0, SeekOrigin.Begin);

            var responseSnapshot = new
            {
                response.StatusCode,
                Headers = response.Headers.ToDictionary(x => x.Key, x => x.Value.ToString()),
                Body = string.IsNullOrWhiteSpace(body) ? null : body
            };

            return responseSnapshot.ToLogString();
        }
    }
}

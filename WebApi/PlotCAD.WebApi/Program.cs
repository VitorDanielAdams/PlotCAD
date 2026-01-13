using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PlotCAD.Infrastructure;
using PlotCAD.WebApi.Middleware;
using PlotCAD.WebApi.Reponses;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

#region Serilog Configuration
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();
#endregion

builder.Services.AddInfrastructureServices(builder.Configuration);

#region Rate Limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    options.StackBlockedRequests = false;
    options.HttpStatusCode = 429;
    options.RealIpHeader = "X-Real-IP";
    options.ClientIdHeader = "Authorization";
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "POST:/api/auth/login",
            Period = "1m",
            Limit = 5,
            PeriodTimespan = TimeSpan.FromMinutes(1)
        },
        new RateLimitRule
        {
            Endpoint = "*",
            Period = "1m",
            Limit = 60 
        }
    };
});

builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

#endregion

#region JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Issuer"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Cookies["Token"];

                if (!string.IsNullOrEmpty(token) && token.StartsWith("Bearer "))
                    token = token.Substring("Bearer ".Length);

                context.Token = token;
                return Task.CompletedTask;
            }
        };
    });
#endregion

#region Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "PlotCAD API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter the JWT token in the field. Example: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});
#endregion

#region Cors
var allowedOrigins = builder.Configuration.GetSection("Frontend:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
#endregion

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .SelectMany(x => x.Value!.Errors.Select(e => e.ErrorMessage))
                .ToList();

            return new BadRequestObjectResult(new ApiResponse<object>
            {
                Success = false,
                Message = "Invalid input data",
                Errors = errors
            });
        };
    });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

var app = builder.Build();

app.UseRouting();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PlotCAD API");
        c.RoutePrefix = string.Empty;
        c.ConfigObject.AdditionalItems["withCredentials"] = true;
    });
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseIpRateLimiting();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<AuthMiddleware>();
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<LoggingMiddleware>();
app.MapControllers();

Log.Information("PlotCAD API Starting...");

app.Run();
using BCrypt.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using PlotCAD.Application.DTOs.Backoffice;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PlotCAD.Infrastructure.Service
{
    public class BackofficeAuthService : IBackofficeAuthService
    {
        private const int WorkFactor = 12;
        private readonly IBackofficeManagerRepository _managerRepository;
        private readonly IAuditLogService _auditLogService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<BackofficeAuthService> _logger;

        public BackofficeAuthService(
            IBackofficeManagerRepository managerRepository,
            IAuditLogService auditLogService,
            IConfiguration configuration,
            ILogger<BackofficeAuthService> logger)
        {
            _managerRepository = managerRepository;
            _auditLogService = auditLogService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<BackofficeLoginResponse> LoginAsync(BackofficeLoginRequest request, string? ipAddress, CancellationToken ct = default)
        {
            _logger.LogInformation("Backoffice login attempt for: {Email}", request.Email);

            var manager = await _managerRepository.GetByEmailAsync(request.Email, ct);

            if (manager == null)
            {
                BCrypt.Net.BCrypt.EnhancedHashPassword("dummy", HashType.SHA384, workFactor: WorkFactor);
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            if (!manager.IsActive)
            {
                BCrypt.Net.BCrypt.EnhancedVerify("dummy", manager.PasswordHash);
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            var valid = BCrypt.Net.BCrypt.EnhancedVerify(request.Password, manager.PasswordHash);
            if (!valid)
                throw new UnauthorizedAccessException("Invalid credentials");

            var token = GenerateToken(manager.Id, manager.Email, manager.Name);

            await _auditLogService.LogAsync(manager.Id, "manager.login", "BackofficeManager",
                manager.Id.ToString(), null, ipAddress, ct);

            return new BackofficeLoginResponse(token, manager.Name, manager.Email);
        }

        private string GenerateToken(int managerId, string email, string name)
        {
            var claims = new[]
            {
                new Claim("manager_id", managerId.ToString()),
                new Claim("manager_email", email),
                new Claim("manager_name", name),
                new Claim("token_type", "backoffice")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expirationMinutes = int.TryParse(_configuration["Backoffice:Jwt:ExpirationMinutes"], out var mins)
                ? mins
                : 60;

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

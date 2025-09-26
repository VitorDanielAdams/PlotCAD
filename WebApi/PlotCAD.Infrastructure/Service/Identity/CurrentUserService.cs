using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Enums;
using Microsoft.Extensions.Configuration;

namespace PlotCAD.Infrastructure.Service.Identity
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IConfiguration _configuration;
        public CurrentUserService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public int? UserId { get; private set; }
        public string UserName { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;
        public Role? Role { get; private set; }
        public int? TenantId { get; private set; }
        public bool IsAuthenticated => UserId.HasValue && TenantId.HasValue;

        public void SetUser(int userId, string userName, string email, Role role, int tenantId)
        {
            UserId = userId;
            Role = role;
            TenantId = tenantId;
        }

        public void ClearUser()
        {
            UserId = null;
            Role = null;
            TenantId = null;
        }

        public int GetTenantId()
        {
            if (!TenantId.HasValue)
            {
                if (int.TryParse(_configuration["DefaultTenantKey"], out var defaultTenantId))
                {
                    TenantId = defaultTenantId;
                }
            }

            return TenantId!.Value;
        }
    }
}

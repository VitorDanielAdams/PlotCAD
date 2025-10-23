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
        public Role? Role { get; private set; }
        public Guid? TenantId { get; private set; }
        public bool IsAuthenticated => UserId.HasValue && TenantId.HasValue;

        public void SetUser(int userId, Role role, Guid tenantId)
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

        public Guid GetTenantId()
        {
            if (!TenantId.HasValue)
            {
                if (Guid.TryParse(_configuration["DefaultTenantKey"], out var defaultTenantId))
                {
                    TenantId = defaultTenantId;
                }
            }

            return TenantId!.Value;
        }
    }
}

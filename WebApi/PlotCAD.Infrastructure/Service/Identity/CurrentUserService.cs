using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Infrastructure.Service.Identity
{
    public class CurrentUserService : ICurrentUserService
    {
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
                throw new InvalidOperationException("TenantId has not been set. Ensure AuthMiddleware ran before accessing tenant context.");

            return TenantId.Value;
        }
    }
}

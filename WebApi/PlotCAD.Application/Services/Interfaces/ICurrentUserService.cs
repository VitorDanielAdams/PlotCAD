using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface ICurrentUserService
    {
        int? UserId { get; }
        Role? Role { get; }
        Guid? TenantId { get; }
        bool IsAuthenticated { get; }
        Guid GetTenantId();
        void SetUser(int userId, Role role, Guid tenantId);
        void ClearUser();
    }
}

using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface ICurrentUserService
    {
        int? UserId { get; }
        string UserName { get; }
        string Email { get; }
        Role? Role { get; }
        int? TenantId { get; }
        bool IsAuthenticated { get; }
        int GetTenantId();
        void SetUser(int userId, string userName, string email, Role role, int tenantId);
        void ClearUser();
    }
}

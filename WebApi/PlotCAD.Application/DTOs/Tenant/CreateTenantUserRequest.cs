using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.Tenant
{
    public record CreateTenantUserRequest(
        string Name,
        string Email,
        string Password,
        Role Role
    );
}

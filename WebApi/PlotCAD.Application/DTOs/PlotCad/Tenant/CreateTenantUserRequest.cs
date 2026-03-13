using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.PlotCad.Tenant
{
    public record CreateTenantUserRequest(
        string Name,
        string Email,
        string Password,
        Role Role
    );
}

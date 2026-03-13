using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.Backoffice.User
{
    public record UpdateUserRoleRequest
    {
        public Role Role { get; init; }
    }
}

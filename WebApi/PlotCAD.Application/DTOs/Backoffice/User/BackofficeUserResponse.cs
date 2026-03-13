using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.Backoffice.User
{
    public record BackofficeUserResponse(
        int Id,
        Guid TenantId,
        string TenantName,
        string Name,
        string Email,
        Role Role,
        bool IsActive,
        DateTimeOffset CreatedAt,
        DateTimeOffset? UpdatedAt);
}

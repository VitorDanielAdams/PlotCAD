using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.Backoffice
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

    public record BackofficeUserListRequest
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 20;
        public string? Search { get; init; }
        public Guid? TenantId { get; init; }
        public Role? Role { get; init; }
        public bool? IsActive { get; init; }
    }

    public record UpdateUserRoleRequest
    {
        public Role Role { get; init; }
    }
}

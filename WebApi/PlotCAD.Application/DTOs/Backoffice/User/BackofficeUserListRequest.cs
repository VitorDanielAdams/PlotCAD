using PlotCAD.Application.DTOs.Common;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.Backoffice.User
{
    public class BackofficeUserListRequest : ListRequest
    {
        public string? Search { get; init; }
        public Guid? TenantId { get; init; }
        public Role? Role { get; init; }
        public bool? IsActive { get; init; }
    }
}

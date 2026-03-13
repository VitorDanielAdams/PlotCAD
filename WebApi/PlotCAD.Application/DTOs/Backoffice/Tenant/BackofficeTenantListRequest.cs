using PlotCAD.Application.DTOs.Common;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.Backoffice.Tenant
{
    public class BackofficeTenantListRequest : ListRequest
    {
        public string? Search { get; init; }
        public SubscriptionStatus? Status { get; init; }
    }
}

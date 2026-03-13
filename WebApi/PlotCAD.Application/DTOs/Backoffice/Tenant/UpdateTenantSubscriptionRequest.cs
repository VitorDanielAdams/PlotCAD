using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.Backoffice.Tenant
{
    public record UpdateTenantSubscriptionRequest
    {
        public SubscriptionStatus SubscriptionStatus { get; init; }
        public DateTimeOffset? SubscriptionExpiresAt { get; init; }
        public PlanType? PlanType { get; init; }
        public int? MaxUsers { get; init; }
    }
}

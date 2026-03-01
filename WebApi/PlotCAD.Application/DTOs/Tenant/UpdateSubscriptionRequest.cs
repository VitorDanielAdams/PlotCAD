using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.Tenant
{
    public record UpdateSubscriptionRequest(
        SubscriptionStatus SubscriptionStatus,
        DateTimeOffset? SubscriptionExpiresAt
    );
}

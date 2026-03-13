using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.PlotCad.Tenant
{
    public record UpdateSubscriptionRequest(
        SubscriptionStatus SubscriptionStatus,
        DateTimeOffset? SubscriptionExpiresAt
    );
}

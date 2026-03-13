using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.Backoffice.Tenant
{
    public record BackofficeTenantResponse(
        Guid Id,
        string Name,
        PlanType PlanType,
        int MaxUsers,
        SubscriptionStatus SubscriptionStatus,
        DateTimeOffset? SubscriptionExpiresAt,
        string? StripeCustomerId,
        int UserCount,
        DateTimeOffset CreatedAt,
        DateTimeOffset? UpdatedAt);
}

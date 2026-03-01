using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.Tenant
{
    public record TenantResponse(
        Guid Id,
        string Name,
        PlanType PlanType,
        int MaxUsers,
        SubscriptionStatus SubscriptionStatus,
        DateTimeOffset? SubscriptionExpiresAt
    );
}

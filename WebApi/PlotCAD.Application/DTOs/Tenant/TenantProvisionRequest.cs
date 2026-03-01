using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.Tenant
{
    public record TenantProvisionRequest(
        string Name,
        PlanType PlanType,
        int MaxUsers,
        DateTimeOffset? SubscriptionExpiresAt,
        string? ExternalSubscriptionId
    );
}

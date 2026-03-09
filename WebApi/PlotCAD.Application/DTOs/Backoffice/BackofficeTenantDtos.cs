using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.Backoffice
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

    public record BackofficeTenantListRequest
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 20;
        public string? Search { get; init; }
        public SubscriptionStatus? Status { get; init; }
    }

    public record UpdateTenantSubscriptionRequest
    {
        public SubscriptionStatus SubscriptionStatus { get; init; }
        public DateTimeOffset? SubscriptionExpiresAt { get; init; }
        public PlanType? PlanType { get; init; }
        public int? MaxUsers { get; init; }
    }
}

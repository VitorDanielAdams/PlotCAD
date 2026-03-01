using PlotCAD.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace PlotCAD.Domain.Entities
{
    [Table("Tenants")]
    public class Tenant
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public PlanType PlanType { get; set; }
        public int MaxUsers { get; set; } = 1;
        public SubscriptionStatus SubscriptionStatus { get; set; }
        public DateTimeOffset? SubscriptionExpiresAt { get; set; }
        public string? ExternalSubscriptionId { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }
}

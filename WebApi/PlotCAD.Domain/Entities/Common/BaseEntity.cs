using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PlotCAD.Domain.Entities.Common
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public Guid TenantId { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedAt { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public bool IsDeleted => DeletedAt.HasValue;
    }
}

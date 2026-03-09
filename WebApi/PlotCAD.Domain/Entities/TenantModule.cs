using System.ComponentModel.DataAnnotations.Schema;

namespace PlotCAD.Domain.Entities
{
    [Table("TenantModules")]
    public class TenantModule
    {
        public int Id { get; set; }
        public Guid TenantId { get; set; }
        public int ModuleId { get; set; }
        public bool IsEnabled { get; set; } = true;
        public DateTimeOffset EnabledAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DisabledAt { get; set; }
    }
}

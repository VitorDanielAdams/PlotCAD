using PlotCAD.Domain.Entities.Common;

namespace PlotCAD.Domain.Entities
{
    public class GeometryEntity : AuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }
}

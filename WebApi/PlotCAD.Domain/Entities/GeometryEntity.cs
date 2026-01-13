using PlotCAD.Domain.Entities.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace PlotCAD.Domain.Entities
{
    [Table("Geometries")]
    public class GeometryEntity : AuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }
}

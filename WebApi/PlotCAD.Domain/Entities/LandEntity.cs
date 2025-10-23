using PlotCAD.Domain.Entities.Common;

namespace PlotCAD.Domain.Entities
{
    public class LandEntity : AuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public int RegistrationNumber { get; set; }
        public int TotalArea { get; set; }
        public string? Description { get; set; } 
        public bool IsActive { get; set; } = true;
    }
}

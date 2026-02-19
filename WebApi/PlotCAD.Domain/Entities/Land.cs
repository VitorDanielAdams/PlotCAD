using PlotCAD.Domain.Entities.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace PlotCAD.Domain.Entities
{
    [Table("Lands")]
    public class Land : AuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public string RegistrationNumber { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Client { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public decimal TotalArea { get; set; }
        public decimal Perimeter { get; set; }
        public bool IsClosed { get; set; }
        public bool IsActive { get; set; } = true;
        public int UserId { get; set; }
    }
}

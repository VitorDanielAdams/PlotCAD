using PlotCAD.Domain.Entities.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace PlotCAD.Domain.Entities
{
    [Table("Employees")]
    public class Employee : BaseEntity
    {
        public required string Name { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Position { get; set; }
        public bool IsActive { get; set; } = true;
        public int? UserId { get; set; }
    }
}

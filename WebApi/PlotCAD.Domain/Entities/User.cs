using PlotCAD.Domain.Entities.Common;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Domain.Entities
{
    public class User : AuditableEntity
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public int WorkShiftId { get; set; }    
        public Role Role { get; set; } 
        public bool IsActive { get; set; } = true;

        public virtual WorkShift WorkShift { get; set; }
        public virtual ICollection<TimeSheet> TimeSheets { get; set; } = new List<TimeSheet>();
        public virtual ICollection<OvertimeRequest> OvertimeRequests { get; set; } = new List<OvertimeRequest>();
        public virtual ICollection<AdjustmentRequest> AdjustmentRequests { get; set; } = new List<AdjustmentRequest>();
    }
}

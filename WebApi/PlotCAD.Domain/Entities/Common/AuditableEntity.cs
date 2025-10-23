namespace PlotCAD.Domain.Entities.Common
{
    public abstract class AuditableEntity : BaseEntity
    {
        public int? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public string? DeletedBy { get; set; }
    }
}

using PlotCAD.Domain.Entities.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace PlotCAD.Domain.Entities
{
    [Table("LandSegments")]
    public class LandSegment : BaseEntity
    {
        public int LandId { get; set; }
        public int SortOrder { get; set; }
        public string FromDirection { get; set; } = string.Empty;
        public string ToDirection { get; set; } = string.Empty;
        public int Degrees { get; set; }
        public int Minutes { get; set; }
        public int Seconds { get; set; }
        public decimal Distance { get; set; }
        public string Label { get; set; } = string.Empty;
        public string BearingRaw { get; set; } = string.Empty;
    }
}

namespace PlotCAD.Application.DTOs.Land
{
    public class LandSaveRequest
    {
        public string Name { get; set; } = string.Empty;
        public string RegistrationNumber { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Client { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public decimal TotalArea { get; set; }
        public decimal Perimeter { get; set; }
        public bool IsClosed { get; set; }
        public IEnumerable<LandSegmentRequest> Segments { get; set; } = [];
    }
}

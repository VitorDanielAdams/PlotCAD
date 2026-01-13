namespace PlotCAD.Application.DTOs.Land
{
    public class LandSaveRequest
    {
        public string Name { get; set; } = string.Empty;
        public int RegistrationNumber { get; set; }
        public int TotalArea { get; set; }
        public string? Description { get; set; }
        public string Location { get; set; } = string.Empty;
        public string Expression { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}

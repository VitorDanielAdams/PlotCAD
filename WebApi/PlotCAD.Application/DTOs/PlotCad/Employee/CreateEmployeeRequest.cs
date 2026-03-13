namespace PlotCAD.Application.DTOs.PlotCad.Employee
{
    public class CreateEmployeeRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Position { get; set; }
    }
}

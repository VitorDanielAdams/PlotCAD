namespace PlotCAD.Application.DTOs.Employee
{
    public record EmployeeResponse(
        int Id,
        string Name,
        string? Phone,
        string? Email,
        string? Position,
        bool IsActive,
        int? UserId
    );
}

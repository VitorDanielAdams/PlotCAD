namespace PlotCAD.Application.DTOs.PlotCad.Land.List
{
    public record LandListItemResponse(
        int Id,
        string Name,
        string RegistrationNumber,
        string Location,
        string Client,
        decimal TotalArea,
        bool IsClosed,
        bool IsActive);
}

namespace PlotCAD.Application.DTOs.Land.List
{
    public record LandListItemResponse(string Name, int RegistrationNumber, string Location, int TotalArea, bool IsActive);
}

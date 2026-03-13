namespace PlotCAD.Application.DTOs.PlotCad.User
{
    public record UserResponse(int Id, string Name, string Email, string Role, bool IsActive);
}

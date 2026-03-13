using PlotCAD.Application.DTOs.PlotCad.User;

namespace PlotCAD.Application.DTOs.PlotCad.Auth
{
    public record LoginResponse (string Token, UserResponse User);
}

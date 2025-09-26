using PlotCAD.Application.DTOs.User;

namespace PlotCAD.Application.DTOs.Auth
{
    public record LoginResponse (string Token, UserResponse User);
}

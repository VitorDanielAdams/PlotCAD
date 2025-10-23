using PlotCAD.Application.DTOs.Auth;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse> AuthenticateAsync(LoginRequest request, CancellationToken cancellationToken = default);
        Task<string> HashPassword(string password);
        Task<bool> VerifyPassword(string hashedPassword, string providedPassword);
    }
}

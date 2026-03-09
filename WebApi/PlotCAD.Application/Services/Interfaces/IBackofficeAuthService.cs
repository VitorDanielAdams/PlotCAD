using PlotCAD.Application.DTOs.Backoffice;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface IBackofficeAuthService
    {
        Task<BackofficeLoginResponse> AuthenticateAsync(BackofficeLoginRequest request, CancellationToken ct = default);
        string GenerateToken(int managerId, string email, string name);
    }
}

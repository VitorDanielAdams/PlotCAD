using PlotCAD.Application.DTOs.Backoffice.Auth;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface IBackofficeAuthService
    {
        Task<BackofficeLoginResponse> LoginAsync(BackofficeLoginRequest request, string? ipAddress, CancellationToken ct = default);
    }
}

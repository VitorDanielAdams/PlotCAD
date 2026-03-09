using PlotCAD.Application.DTOs.Backoffice;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface IBackofficeAuthService
    {
        Task<BackofficeLoginResponse> LoginAsync(BackofficeLoginRequest request, string? ipAddress, CancellationToken ct = default);
    }
}

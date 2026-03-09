using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Repositories
{
    public interface IBackofficeManagerRepository
    {
        Task<BackofficeManager?> GetByIdAsync(int id, CancellationToken ct = default);
        Task<BackofficeManager?> GetByEmailAsync(string email, CancellationToken ct = default);
    }
}

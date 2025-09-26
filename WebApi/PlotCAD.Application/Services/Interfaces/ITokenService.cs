using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface ITokenService
    {
        Task<string>? GenerateToken(User player);
    }
}

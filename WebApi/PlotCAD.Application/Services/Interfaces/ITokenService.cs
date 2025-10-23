using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface ITokenService
    {
        string? GenerateToken(User player);
    }
}

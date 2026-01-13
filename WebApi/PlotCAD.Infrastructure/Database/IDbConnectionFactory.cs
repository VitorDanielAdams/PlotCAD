using System.Data;

namespace PlotCAD.Infrastructure.Database
{
    public interface IDbConnectionFactory
    {
        Task<IDbConnection> CreateConnectionAsync(CancellationToken cancellationToken = default);
        IDbConnection CreateConnection();
    }
}

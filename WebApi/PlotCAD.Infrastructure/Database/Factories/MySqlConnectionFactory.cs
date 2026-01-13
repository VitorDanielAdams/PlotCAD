using MySqlConnector;
using System.Data;

namespace PlotCAD.Infrastructure.Database.Factories
{
    public class MySqlConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;

        public MySqlConnectionFactory(string connectionString)
        {
            _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
        }

        public async Task<IDbConnection> CreateConnectionAsync(CancellationToken cancellationToken = default)
        {
            var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync(cancellationToken);
            return connection;
        }

        public IDbConnection CreateConnection()
        {
            var connection = new MySqlConnection(_connectionString);
            connection.Open();
            return connection;
        }
    }
}

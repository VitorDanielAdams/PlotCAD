using Dapper;
using PlotCAD.Application.Repositories;
using PlotCAD.Domain.Entities;
using PlotCAD.Infrastructure.Database;

namespace PlotCAD.Infrastructure.Repositories
{
    public class BackofficeManagerRepository : IBackofficeManagerRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public BackofficeManagerRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<BackofficeManager?> GetByIdAsync(int id, CancellationToken ct = default)
        {
            const string sql = @"
                SELECT Id, Name, Email, PasswordHash, IsActive, CreatedAt, UpdatedAt
                FROM BackofficeManagers
                WHERE Id = @Id";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.QueryFirstOrDefaultAsync<BackofficeManager>(sql, new { Id = id });
        }

        public async Task<BackofficeManager?> GetByEmailAsync(string email, CancellationToken ct = default)
        {
            const string sql = @"
                SELECT Id, Name, Email, PasswordHash, IsActive, CreatedAt, UpdatedAt
                FROM BackofficeManagers
                WHERE Email = @Email";

            using var connection = await _connectionFactory.CreateConnectionAsync(ct);
            return await connection.QueryFirstOrDefaultAsync<BackofficeManager>(sql, new { Email = email });
        }
    }
}

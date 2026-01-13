using Microsoft.Extensions.Configuration;
using PlotCAD.Infrastructure.Database.Factories;

namespace PlotCAD.Infrastructure.Database
{
    public static class DbConnectionFactoryProvider
    {
        public static IDbConnectionFactory CreateFactory(IConfiguration configuration)
        {
            var provider = configuration["Database:Provider"]?.ToLower() ?? "mysql";
            var connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found");

            return provider switch
            {
                "mysql" => new MySqlConnectionFactory(connectionString),
                _ => throw new NotSupportedException($"Database provider '{provider}' is not supported. Supported providers: mysql, postgresql, sqlserver")
            };
        }
    }
}

using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Impl;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Infrastructure.Database;
using PlotCAD.Infrastructure.Repositories;
using PlotCAD.Infrastructure.Service.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace PlotCAD.Infrastructure
{
    public static class ObjectContainer
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection container, IConfiguration configuration)
        {
            container.AddSingleton<IDbConnectionFactory>(sp => 
                DbConnectionFactoryProvider.CreateFactory(configuration));

            #region Repository
            container.AddScoped<IUserRepository, UserRepository>();
            container.AddScoped<ILandRepository, LandRepository>();
            #endregion

            #region Services
            container.AddScoped<IUserService, UserService>();
            container.AddScoped<ICurrentUserService, CurrentUserService>();
            container.AddScoped<ITokenService, TokenService>();
            container.AddScoped<IAuthService, AuthService>();
            container.AddScoped<ILandService, LandService>();
            #endregion

            return container;
        }
    }
}

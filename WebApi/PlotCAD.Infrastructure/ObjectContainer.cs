using PlotCAD.Application.Repositories;
using PlotCAD.Application.Repositories.Common;
using PlotCAD.Application.Services.Impl;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Infrastructure.Repositories;
using PlotCAD.Infrastructure.Repositories.Common;
using PlotCAD.Infrastructure.Service.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace PlotCAD.Infrastructure
{
    public static class ObjectContainer
    {
        public static IServiceCollection AddInfrastructureServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            #region Repository
            // Generic Repository
            services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));

            services.AddScoped<IUserRepository, UserRepository>();
            #endregion

            #region Services
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IAuthService, AuthService>();

            #endregion

            return services;
        }
    }
}

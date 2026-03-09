using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Impl;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Infrastructure.Database;
using PlotCAD.Infrastructure.Repositories;
using PlotCAD.Infrastructure.Service.Identity;
using PlotCAD.Infrastructure.Service;
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
            container.AddScoped<ITenantRepository, TenantRepository>();
            container.AddScoped<IEmployeeRepository, EmployeeRepository>();
            container.AddScoped<IBackofficeManagerRepository, BackofficeManagerRepository>();
            container.AddScoped<IBackofficeTenantRepository, BackofficeTenantRepository>();
            container.AddScoped<IBackofficeUserRepository, BackofficeUserRepository>();
            container.AddScoped<IModuleRepository, ModuleRepository>();
            container.AddScoped<IAuditLogRepository, AuditLogRepository>();
            #endregion

            #region Services
            container.AddSingleton<IFieldEncryptionService, FieldEncryptionService>();
            container.AddScoped<IUserService, UserService>();
            container.AddScoped<ICurrentUserService, CurrentUserService>();
            container.AddScoped<ITokenService, TokenService>();
            container.AddScoped<IAuthService, AuthService>();
            container.AddScoped<ILandService, LandService>();
            container.AddScoped<ITenantService, TenantService>();
            container.AddScoped<IEmployeeService, EmployeeService>();
            container.AddScoped<ICurrentBackofficeUser, CurrentBackofficeUser>();
            container.AddScoped<IBackofficeAuthService, BackofficeAuthService>();
            container.AddScoped<IBackofficeTenantService, BackofficeTenantService>();
            container.AddScoped<IBackofficeUserService, BackofficeUserService>();
            container.AddScoped<IBackofficeDashboardService, BackofficeDashboardService>();
            container.AddScoped<IModuleService, ModuleService>();
            container.AddScoped<IAuditLogService, AuditLogService>();
            #endregion

            return container;
        }
    }
}

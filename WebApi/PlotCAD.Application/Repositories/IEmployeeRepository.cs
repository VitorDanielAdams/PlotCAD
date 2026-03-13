using PlotCAD.Application.DTOs.PlotCad.Employee;
using PlotCAD.Application.Repositories.Common;
using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Repositories
{
    public interface IEmployeeRepository : IRepository<Employee>
    {
        Task<IEnumerable<Employee>> GetPagedAsync(int page, int pageSize, EmployeeListFilter? filter, CancellationToken cancellationToken = default);
        Task<IEnumerable<Employee>> GetAllAsync(EmployeeListFilter? filter, CancellationToken cancellationToken = default);
        Task<int> GetCountAsync(EmployeeListFilter? filter, CancellationToken cancellationToken = default);
        Task SetActiveAsync(int id, bool isActive, CancellationToken cancellationToken = default);
        Task<Employee?> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    }
}

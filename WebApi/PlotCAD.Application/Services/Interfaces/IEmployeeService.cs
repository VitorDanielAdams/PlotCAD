using PlotCAD.Application.DTOs.Common;
using PlotCAD.Application.DTOs.Employee;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface IEmployeeService
    {
        Task<ListResponse<EmployeeResponse>> ListAsync(ListRequest<EmployeeListFilter> args, CancellationToken cancellationToken = default);
        Task<EmployeeResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<EmployeeResponse> CreateAsync(CreateEmployeeRequest request, CancellationToken cancellationToken = default);
        Task<EmployeeResponse> UpdateAsync(int id, UpdateEmployeeRequest request, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}

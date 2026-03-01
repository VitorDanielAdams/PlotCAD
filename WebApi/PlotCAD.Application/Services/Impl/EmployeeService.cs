using AutoMapper;
using PlotCAD.Application.DTOs.Common;
using PlotCAD.Application.DTOs.Employee;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Services.Impl
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IMapper _mapper;

        public EmployeeService(IEmployeeRepository employeeRepository, IMapper mapper)
        {
            _employeeRepository = employeeRepository;
            _mapper = mapper;
        }

        public async Task<ListResponse<EmployeeResponse>> ListAsync(ListRequest<EmployeeListFilter> args, CancellationToken cancellationToken = default)
        {
            var items = await _employeeRepository.GetPagedAsync(args.PageNumber, args.PageSize, args.Filter, cancellationToken);
            var total = await _employeeRepository.GetCountAsync(args.Filter, cancellationToken);
            var mapped = _mapper.Map<IEnumerable<EmployeeResponse>>(items);
            return new ListResponse<EmployeeResponse>(total, args.PageNumber, args.PageSize, mapped);
        }

        public async Task<EmployeeResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var employee = await _employeeRepository.GetByIdAsync(id, cancellationToken)
                ?? throw new KeyNotFoundException($"Employee {id} not found.");

            return _mapper.Map<EmployeeResponse>(employee);
        }

        public async Task<EmployeeResponse> CreateAsync(CreateEmployeeRequest request, CancellationToken cancellationToken = default)
        {
            var employee = new Employee
            {
                Name = request.Name,
                Phone = request.Phone,
                Email = request.Email,
                Position = request.Position,
                IsActive = true
            };

            var created = await _employeeRepository.AddAsync(employee, cancellationToken);
            return _mapper.Map<EmployeeResponse>(created);
        }

        public async Task<EmployeeResponse> UpdateAsync(int id, UpdateEmployeeRequest request, CancellationToken cancellationToken = default)
        {
            var employee = await _employeeRepository.GetByIdAsync(id, cancellationToken)
                ?? throw new KeyNotFoundException($"Employee {id} not found.");

            employee.Name = request.Name;
            employee.Phone = request.Phone;
            employee.Email = request.Email;
            employee.Position = request.Position;

            await _employeeRepository.UpdateAsync(employee, cancellationToken);
            return _mapper.Map<EmployeeResponse>(employee);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var exists = await _employeeRepository.ExistsAsync(id, cancellationToken);
            if (!exists)
                throw new KeyNotFoundException($"Employee {id} not found.");

            await _employeeRepository.DeleteAsync(id, cancellationToken);
        }
    }
}

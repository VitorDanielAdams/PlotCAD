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
            // Name filter requires in-memory filtering because the Name field is encrypted
            if (!string.IsNullOrWhiteSpace(args.Filter?.Name))
            {
                var filterWithoutName = args.Filter == null ? null : new EmployeeListFilter { IsActive = args.Filter.IsActive };
                var allItems = await _employeeRepository.GetAllAsync(filterWithoutName, cancellationToken);
                var filtered = allItems
                    .Where(e => e.Name != null && e.Name.Contains(args.Filter!.Name, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                var total = filtered.Count;
                var paged = filtered.Skip((args.PageNumber - 1) * args.PageSize).Take(args.PageSize);
                var mapped = _mapper.Map<IEnumerable<EmployeeResponse>>(paged);
                return new ListResponse<EmployeeResponse>(total, args.PageNumber, args.PageSize, mapped);
            }

            var items = await _employeeRepository.GetPagedAsync(args.PageNumber, args.PageSize, args.Filter, cancellationToken);
            var count = await _employeeRepository.GetCountAsync(args.Filter, cancellationToken);
            var mappedAll = _mapper.Map<IEnumerable<EmployeeResponse>>(items);
            return new ListResponse<EmployeeResponse>(count, args.PageNumber, args.PageSize, mappedAll);
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

        public async Task ToggleActiveAsync(int id, CancellationToken cancellationToken = default)
        {
            var employee = await _employeeRepository.GetByIdAsync(id, cancellationToken)
                ?? throw new KeyNotFoundException($"Employee {id} not found.");

            await _employeeRepository.SetActiveAsync(id, !employee.IsActive, cancellationToken);
        }

        public async Task<EmployeeResponse> DuplicateAsync(int id, CancellationToken cancellationToken = default)
        {
            var source = await _employeeRepository.GetByIdAsync(id, cancellationToken)
                ?? throw new KeyNotFoundException($"Employee {id} not found.");

            var copy = new Employee
            {
                Name = $"{source.Name} (Cópia)",
                Phone = source.Phone,
                Email = source.Email,
                Position = source.Position,
                IsActive = true
            };

            var created = await _employeeRepository.AddAsync(copy, cancellationToken);
            return _mapper.Map<EmployeeResponse>(created);
        }
    }
}

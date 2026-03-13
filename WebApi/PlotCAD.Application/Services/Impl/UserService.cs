using AutoMapper;
using BCrypt.Net;
using PlotCAD.Application.DTOs.Common;
using PlotCAD.Application.DTOs.PlotCad.Tenant;
using PlotCAD.Application.DTOs.PlotCad.User;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;
using PlotCAD.Domain.Enums;
using System.Security.Authentication;

namespace PlotCAD.Application.Services.Impl
{
    public class UserService : IUserService
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserRepository _userRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly ITenantService _tenantService;
        private readonly IMapper _mapper;

        public UserService(
            ICurrentUserService currentUserService,
            IUserRepository userRepository,
            IEmployeeRepository employeeRepository,
            ITenantService tenantService,
            IMapper mapper)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _employeeRepository = employeeRepository;
            _tenantService = tenantService;
            _mapper = mapper;
        }

        public async Task<UserResponse> AddAsync(CreateTenantUserRequest request, CancellationToken cancellationToken = default)
        {
            var hash = BCrypt.Net.BCrypt.EnhancedHashPassword(request.Password, HashType.SHA384, workFactor: 12);
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = hash,
                Role = request.Role,
                IsActive = true
            };
            var created = await _userRepository.AddAsync(user, cancellationToken);
            return _mapper.Map<UserResponse>(created);
        }

        public async Task<UserResponse> GetCurrenUserAsync(CancellationToken cancellationToken)
        {
            if (_currentUserService.UserId == null)
                throw new AuthenticationException("Invalid Token");

            var user = await _userRepository.GetByIdAsync(_currentUserService.UserId.Value, cancellationToken);
            if (user == null)
                throw new Exception("User not found");

            return _mapper.Map<UserResponse>(user);
        }

        public async Task<UserResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetByIdAsync(id, cancellationToken)
                ?? throw new KeyNotFoundException($"User {id} not found.");
            return _mapper.Map<UserResponse>(user);
        }

        public async Task<IEnumerable<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var users = await _userRepository.GetAllAsync(cancellationToken);
            return _mapper.Map<IEnumerable<UserResponse>>(users);
        }

        public async Task<IEnumerable<UserResponse>> GetAllActiveAsync(CancellationToken cancellationToken = default)
        {
            var users = await _userRepository.ListByIsActiveAsync(true, cancellationToken);
            return _mapper.Map<IEnumerable<UserResponse>>(users);
        }

        public async Task<IEnumerable<UserResponse>> GetUsersByRoleAsync(Role role, CancellationToken cancellationToken = default)
        {
            var users = await _userRepository.GetUsersByRoleAsync(role, cancellationToken);
            return _mapper.Map<IEnumerable<UserResponse>>(users);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            if (_currentUserService.UserId == id)
                throw new InvalidOperationException("You cannot delete your own account.");

            var exists = await _userRepository.ExistsAsync(id, cancellationToken);
            if (!exists)
                throw new KeyNotFoundException($"User {id} not found.");
            await _userRepository.DeleteAsync(id, cancellationToken);
        }

        public Task<bool> EmailExistsAsync(string email, int? excludeUserId = null, CancellationToken cancellationToken = default)
        {
            return _userRepository.EmailExistsAsync(email, excludeUserId, cancellationToken);
        }

        public async Task<ListResponse<UserResponse>> ListAsync(ListRequest<UserListFilter> args, CancellationToken cancellationToken = default)
        {
            var items = await _userRepository.GetPagedAsync(args.PageNumber, args.PageSize, args.Filter, cancellationToken);
            var total = await _userRepository.GetCountAsync(args.Filter, cancellationToken);
            var mapped = _mapper.Map<IEnumerable<UserResponse>>(items);
            return new ListResponse<UserResponse>(total, args.PageNumber, args.PageSize, mapped);
        }

        public async Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
        {
            var tenantId = _currentUserService.GetTenantId();
            var canAdd = await _tenantService.CanAddUserAsync(tenantId, cancellationToken);
            if (!canAdd)
                throw new InvalidOperationException("User limit reached for the current plan.");

            var emailExists = await _userRepository.EmailExistsAsync(request.Email, null, cancellationToken);
            if (emailExists)
                throw new InvalidOperationException("An account with this email already exists.");

            var hash = BCrypt.Net.BCrypt.EnhancedHashPassword(request.Password, HashType.SHA384, workFactor: 12);
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = hash,
                Role = request.Role,
                IsActive = true
            };

            var created = await _userRepository.AddAsync(user, cancellationToken);

            // Also create the corresponding employee record
            var employee = new Employee
            {
                Name = created.Name,
                Email = created.Email,
                IsActive = true,
                UserId = created.Id
            };
            await _employeeRepository.AddAsync(employee, cancellationToken);

            return _mapper.Map<UserResponse>(created);
        }

        public async Task<UserResponse> UpdateAsync(int id, UpdateUserRequest request, CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetByIdAsync(id, cancellationToken)
                ?? throw new KeyNotFoundException($"User {id} not found.");

            var emailExists = await _userRepository.EmailExistsAsync(request.Email, id, cancellationToken);
            if (emailExists)
                throw new InvalidOperationException("An account with this email already exists.");

            user.Name = request.Name;
            user.Email = request.Email;
            user.Role = request.Role;

            await _userRepository.UpdateAsync(user, cancellationToken);

            // Sync employee name/email if linked
            var employee = await _employeeRepository.GetByUserIdAsync(id, cancellationToken);
            if (employee != null)
            {
                employee.Name = user.Name;
                employee.Email = user.Email;
                await _employeeRepository.UpdateAsync(employee, cancellationToken);
            }

            return _mapper.Map<UserResponse>(user);
        }

        public async Task ToggleActiveAsync(int id, CancellationToken cancellationToken = default)
        {
            if (_currentUserService.UserId == id)
                throw new InvalidOperationException("You cannot disable your own account.");

            var user = await _userRepository.GetByIdAsync(id, cancellationToken)
                ?? throw new KeyNotFoundException($"User {id} not found.");

            var newState = !user.IsActive;
            await _userRepository.SetActiveAsync(id, newState, cancellationToken);

            // Sync employee active state if linked
            var employee = await _employeeRepository.GetByUserIdAsync(id, cancellationToken);
            if (employee != null)
                await _employeeRepository.SetActiveAsync(employee.Id, newState, cancellationToken);
        }

        public async Task ChangePasswordAsync(int id, string newPassword, CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetByIdAsync(id, cancellationToken)
                ?? throw new KeyNotFoundException($"User {id} not found.");

            var hash = BCrypt.Net.BCrypt.EnhancedHashPassword(newPassword, HashType.SHA384, workFactor: 12);
            await _userRepository.ChangePasswordAsync(user.Id, hash, cancellationToken);
        }

        public async Task<PlanInfoResponse> GetPlanInfoAsync(CancellationToken cancellationToken = default)
        {
            var tenantId = _currentUserService.GetTenantId();
            var tenant = await _tenantService.GetCachedAsync(tenantId, cancellationToken)
                ?? throw new InvalidOperationException("Tenant not found.");

            var currentUsers = await _userRepository.GetCountAsync(null, cancellationToken);
            var canAddUsers = currentUsers < tenant.MaxUsers;

            return new PlanInfoResponse(tenant.MaxUsers, currentUsers, canAddUsers);
        }
    }
}

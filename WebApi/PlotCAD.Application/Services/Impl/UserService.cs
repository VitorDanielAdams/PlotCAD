using AutoMapper;
using PlotCAD.Application.DTOs.User;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Enums;
using System.Security.Authentication;

namespace PlotCAD.Application.Services.Impl
{
    public class UserService : IUserService
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public UserService(ICurrentUserService currentUserService, IUserRepository userRepository, IMapper mapper)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<UserResponse> GetCurrenUserAsync(CancellationToken cancellationToken)
        {
            if (_currentUserService.UserId == null)
                throw new AuthenticationException("Invalid Token");

            var user = await _userRepository.GetByIdAsync(_currentUserService.UserId.Value, cancellationToken);
            if (user == null)
                throw new Exception("User not found");

            var userResponse = _mapper.Map<UserResponse>(user);

            return userResponse;
        }

        public Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<bool> EmailExistsAsync(string email, int? excludeUserId = null, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<UserResponse>> GetAllActiveAsync(CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<UserResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<UserResponse>> GetUsersByRoleAsync(Role role, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }
    }
}

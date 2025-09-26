using AutoMapper;
using BCrypt.Net;
using PlotCAD.Application.DTOs.Auth;
using PlotCAD.Application.DTOs.User;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.Services.Impl
{
    public class UserService : IUserService
    {
        private const int WorkFactor = 12;
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;

        public UserService(IUserRepository userRepository, ITokenService tokenService, IMapper mapper)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _mapper = mapper;
        }

        public async Task<LoginResponse> AuthenticateAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetByEmailAsync(request.Login);
            if (user == null)
                throw new UnauthorizedAccessException("Invalid credentials");

            var valid = await this.VerifyPassword(user.PasswordHash, request.Password);
            if (!valid)
                throw new UnauthorizedAccessException("Invalid Password");

            var token = await _tokenService.GenerateToken(user);
            if (token == null) 
                throw new ApplicationException("Generate token failed.");

            var userResponse = _mapper.Map<UserResponse>(user);

            return new LoginResponse(token, userResponse);
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

        public Task<string> HashPassword(string password)
        {
            string hash = BCrypt.Net.BCrypt.EnhancedHashPassword(password, HashType.SHA384, workFactor: WorkFactor);
            return Task.FromResult(hash);
        }

        public Task<bool> VerifyPassword(string hashedPassword, string providedPassword)
        {
            bool isValid = BCrypt.Net.BCrypt.EnhancedVerify(providedPassword, hashedPassword);
            return Task.FromResult(isValid);
        }
    }
}

using AutoMapper;
using BCrypt.Net;
using PlotCAD.Application.DTOs.Auth;
using PlotCAD.Application.DTOs.User;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;

namespace PlotCAD.Application.Services.Impl
{
    public class AuthService : IAuthService
    {
        private const int WorkFactor = 12;
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;

        public AuthService(IUserRepository userRepository, ITokenService tokenService, IMapper mapper)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _mapper = mapper;
        }
        public async Task<LoginResponse> AuthenticateAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetByEmailAsync(request.Login, cancellationToken);
            if (user == null)
                throw new UnauthorizedAccessException("Invalid credentials");

            var valid = await this.VerifyPassword(user.PasswordHash, request.Password);
            if (!valid)
                throw new UnauthorizedAccessException("Invalid Password");

            var token = _tokenService.GenerateToken(user);
            if (token == null)
                throw new ApplicationException("Generate token failed.");

            var userResponse = _mapper.Map<UserResponse>(user);

            return new LoginResponse(token, userResponse);
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

using PlotCAD.Application.DTOs.Auth;
using PlotCAD.Application.DTOs.User;
using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserResponse> GetCurrenUserAsync(CancellationToken cancellationToken = default);
        Task<UserResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<UserResponse>> GetAllActiveAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<UserResponse>> GetUsersByRoleAsync(Role role, CancellationToken cancellationToken = default);
        //Task<GetUserResponseDTO> CreateAsync(CreateUserRequestDTO createUserRequest, CancellationToken cancellationToken = default);
        //Task<GetUserResponseDTO> UpdateAsync(int id, UpdateUserRequestDTO updateUserRequest, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
        //Task ChangePasswordAsync(int id, ChangePasswordRequestDTO changePasswordRequest, CancellationToken cancellationToken = default);
        Task<bool> EmailExistsAsync(string email, int? excludeUserId = null, CancellationToken cancellationToken = default);
    }
}

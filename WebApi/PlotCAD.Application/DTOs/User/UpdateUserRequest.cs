using PlotCAD.Domain.Enums;

namespace PlotCAD.Application.DTOs.User
{
    public class UpdateUserRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Role Role { get; set; } = Role.Employee;
    }
}

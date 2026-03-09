using PlotCAD.Application.Services.Interfaces;

namespace PlotCAD.Infrastructure.Service.Identity
{
    public class CurrentBackofficeUser : ICurrentBackofficeUser
    {
        private int? _managerId;
        private string? _email;
        private string? _name;
        private string? _ipAddress;

        public int? ManagerId => _managerId;
        public string? Email => _email;
        public string? Name => _name;
        public string? IpAddress => _ipAddress;
        public bool IsAuthenticated => _managerId.HasValue;

        public int GetManagerId()
        {
            return _managerId ?? throw new InvalidOperationException("Backoffice manager is not authenticated.");
        }

        public void SetManager(int managerId, string email, string name, string? ipAddress)
        {
            _managerId = managerId;
            _email = email;
            _name = name;
            _ipAddress = ipAddress;
        }
    }
}

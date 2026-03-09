using PlotCAD.Application.Services.Interfaces;

namespace PlotCAD.Infrastructure.Service.Identity
{
    public class CurrentBackofficeUser : ICurrentBackofficeUser
    {
        private int? _managerId;
        private string? _email;
        private string? _name;

        public int? ManagerId => _managerId;
        public string? Email => _email;
        public string? Name => _name;
        public bool IsAuthenticated => _managerId.HasValue;

        public int GetManagerId()
        {
            return _managerId ?? throw new InvalidOperationException("Backoffice manager is not authenticated.");
        }

        public void SetManager(int managerId, string email, string name)
        {
            _managerId = managerId;
            _email = email;
            _name = name;
        }
    }
}

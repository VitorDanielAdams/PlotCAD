namespace PlotCAD.Application.Services.Interfaces
{
    public interface ICurrentBackofficeUser
    {
        int? ManagerId { get; }
        string? Email { get; }
        string? Name { get; }
        bool IsAuthenticated { get; }
        int GetManagerId();
        void SetManager(int managerId, string email, string name);
    }
}

namespace PlotCAD.Application.DTOs.Backoffice.Dashboard
{
    public record DashboardStatsResponse(
        int TotalTenants,
        int ActiveTenants,
        int TotalUsers,
        int ActiveUsers,
        int TotalModules,
        int TrialTenants,
        int ExpiredTenants,
        int SuspendedTenants);
}

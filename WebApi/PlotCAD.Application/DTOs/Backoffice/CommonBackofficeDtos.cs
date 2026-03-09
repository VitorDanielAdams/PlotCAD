namespace PlotCAD.Application.DTOs.Backoffice
{
    public record AuditLogResponse(
        long Id,
        int? ManagerId,
        string? ManagerName,
        string Action,
        string EntityType,
        string EntityId,
        string? Details,
        string? IpAddress,
        DateTimeOffset CreatedAt);

    public record AuditLogListRequest
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 50;
        public int? ManagerId { get; init; }
        public string? EntityType { get; init; }
        public string? Action { get; init; }
        public DateTimeOffset? FromDate { get; init; }
        public DateTimeOffset? ToDate { get; init; }
    }

    public record DashboardStatsResponse(
        int TotalTenants,
        int ActiveTenants,
        int TotalUsers,
        int ActiveUsers,
        int TotalModules,
        int TrialTenants,
        int ExpiredTenants,
        int SuspendedTenants);

    public record PagedResponse<T>(
        IEnumerable<T> Items,
        int TotalCount,
        int Page,
        int PageSize)
    {
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}

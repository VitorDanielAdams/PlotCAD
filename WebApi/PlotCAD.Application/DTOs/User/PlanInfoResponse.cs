namespace PlotCAD.Application.DTOs.User
{
    public record PlanInfoResponse(
        int MaxUsers,
        int CurrentUsers,
        bool CanAddUsers
    );
}

namespace PlotCAD.Application.DTOs.PlotCad.User
{
    public record PlanInfoResponse(
        int MaxUsers,
        int CurrentUsers,
        bool CanAddUsers
    );
}

using AutoMapper;
using PlotCAD.Application.DTOs.User;
using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Mapping
{
    public class UserMapping : Profile
    {
        public UserMapping()
        {
            CreateMap<User, UserResponse>();
            CreateMap<UserResponse, User>();
        }
    }
}

using AutoMapper;
using PlotCAD.Application.DTOs.Employee;
using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Mapping
{
    public class EmployeeMapping : Profile
    {
        public EmployeeMapping()
        {
            CreateMap<Employee, EmployeeResponse>();
        }
    }
}

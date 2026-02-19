using AutoMapper;
using PlotCAD.Application.DTOs.Land.List;
using PlotCAD.Domain.Entities;

namespace PlotCAD.Application.Mapping
{
    public class LandMapping : Profile
    {
        public LandMapping()
        {
            CreateMap<Land, LandListItemResponse>();
            CreateMap<Land, LandResponse>();
            CreateMap<LandSegment, LandSegmentResponse>();
        }
    }
}

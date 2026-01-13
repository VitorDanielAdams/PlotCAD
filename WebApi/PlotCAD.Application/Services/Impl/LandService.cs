using Microsoft.Extensions.Logging;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;

namespace PlotCAD.Application.Services.Impl
{
    public class LandService : ILandService
    {
        private readonly ILogger<LandService> _logger;
        private readonly ILandRepository _landRepository;

        public LandService(ILogger<LandService> logger, ILandRepository landRepository)
        {
            _logger = logger;
            _landRepository = landRepository;
        }


    }
}

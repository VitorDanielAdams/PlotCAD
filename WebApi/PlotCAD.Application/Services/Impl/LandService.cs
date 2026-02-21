using AutoMapper;
using Microsoft.Extensions.Logging;
using PlotCAD.Application.DTOs.Common;
using PlotCAD.Application.DTOs.Land;
using PlotCAD.Application.DTOs.Land.List;
using PlotCAD.Application.Repositories;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Entities;
using System.Security.Authentication;

namespace PlotCAD.Application.Services.Impl
{
    public class LandService : ILandService
    {
        private readonly IMapper _mapper;
        private readonly ILogger<LandService> _logger;
        private readonly ILandRepository _landRepository;
        private readonly ICurrentUserService _currentUserService;

        public LandService(IMapper mapper, ILogger<LandService> logger, ILandRepository landRepository, ICurrentUserService currentUserService)
        {
            _mapper = mapper;
            _logger = logger;
            _landRepository = landRepository;
            _currentUserService = currentUserService;
        }

        public async Task<LandResponse> CreateAsync(LandSaveRequest request, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("{MethodName} - Request: {Request}", nameof(CreateAsync), request.ToLogString());

            if (_currentUserService.UserId == null)
                throw new AuthenticationException("Invalid Token");

            var newLand = new Land
            {
                Name = request.Name,
                RegistrationNumber = request.RegistrationNumber,
                Location = request.Location,
                Client = request.Client,
                Notes = request.Notes,
                TotalArea = request.TotalArea,
                Perimeter = request.Perimeter,
                IsClosed = request.IsClosed,
                IsActive = true,
                UserId = _currentUserService.UserId.Value,
            };

            var land = await _landRepository.AddAsync(newLand, cancellationToken);

            if (request.Segments.Any())
            {
                var segments = request.Segments.Select(s => new LandSegment
                {
                    LandId = land.Id,
                    SortOrder = s.SortOrder,
                    FromDirection = s.FromDirection,
                    ToDirection = s.ToDirection,
                    Degrees = s.Degrees,
                    Minutes = s.Minutes,
                    Seconds = s.Seconds,
                    Distance = s.Distance,
                    Label = s.Label,
                    BearingRaw = s.BearingRaw,
                });

                await _landRepository.AddSegmentsAsync(land.Id, segments, cancellationToken);
            }

            _logger.LogInformation("{MethodName} - Land created: {Id}", nameof(CreateAsync), land.Id);

            return _mapper.Map<LandResponse>(land);
        }

        public async Task<ListResponse<LandListItemResponse>> ListAsync(ListRequest<LandListFilter> args, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("{MethodName} - Request: {Request}", nameof(ListAsync), args.ToLogString());

            if (_currentUserService.UserId == null)
                throw new AuthenticationException("Invalid Token");

            var count = await _landRepository.GetCountAsync(args.Filter, cancellationToken);
            var items = await _landRepository.GetPagedAsync(args.PageNumber, args.PageSize, args.Filter, cancellationToken);

            var response = new ListResponse<LandListItemResponse>
            {
                TotalCount = count,
                PageNumber = args.PageNumber,
                PageSize = args.PageSize,
                Items = _mapper.Map<IEnumerable<LandListItemResponse>>(items)
            };

            _logger.LogInformation("{MethodName} - Response: {TotalCount} items found", nameof(ListAsync), count);

            return response;
        }

        public async Task<LandResponse?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("{MethodName} - Id: {Id}", nameof(GetByIdAsync), id);

            var land = await _landRepository.GetByIdAsync(id, cancellationToken);
            if (land == null) return null;

            var segments = await _landRepository.GetSegmentsByLandIdAsync(id, cancellationToken);
            var response = _mapper.Map<LandResponse>(land);
            response.Segments = _mapper.Map<IEnumerable<LandSegmentResponse>>(segments);

            return response;
        }
    }
}

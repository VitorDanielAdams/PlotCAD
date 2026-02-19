using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Common;
using PlotCAD.Application.DTOs.Land;
using PlotCAD.Application.DTOs.Land.List;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;

namespace PlotCAD.WebApi.Controllers
{
    [ApiController]
    [Route("api/lands")]
    public class LandController : ControllerBase
    {
        private readonly ILogger<LandController> _logger;
        private readonly ILandService _landService;

        public LandController(ILogger<LandController> logger, ILandService landService)
        {
            _logger = logger;
            _landService = landService;
        }

        [HttpPost("save")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<object>>> Save([FromBody] LandSaveRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _landService.CreateAsync(request, cancellationToken);
                return Ok(new ApiResponse<object>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while saving land.");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail("An error occurred while processing your request."));
            }
        }

        [HttpPost("list")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<ListResponse<LandListItemResponse>>>> List([FromBody] ListRequest<LandListFilter> request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _landService.ListAsync(request, cancellationToken);
                return Ok(ApiResponse<ListResponse<LandListItemResponse>>.Ok(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while saving land.");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail("An error occurred while processing your request."));
            } 
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<LandResponse>>> Get(int id, CancellationToken cancellationToken)
        {
            return Ok(new ApiResponse<LandResponse>());
        }
    }
}

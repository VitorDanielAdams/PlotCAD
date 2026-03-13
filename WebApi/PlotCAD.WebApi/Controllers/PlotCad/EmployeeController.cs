using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.Common;
using PlotCAD.Application.DTOs.PlotCad.Employee;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.WebApi.Reponses;

namespace PlotCAD.WebApi.Controllers.PlotCad
{
    [Authorize]
    [ApiController]
    [Route("api/employees")]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;
        private readonly ILogger<EmployeeController> _logger;

        public EmployeeController(IEmployeeService employeeService, ILogger<EmployeeController> logger)
        {
            _employeeService = employeeService;
            _logger = logger;
        }

        [HttpPost("list")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<ListResponse<EmployeeResponse>>>> List([FromBody] ListRequest<EmployeeListFilter> request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _employeeService.ListAsync(request, cancellationToken);
                return Ok(ApiResponse<ListResponse<EmployeeResponse>>.Ok(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing employees");
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<EmployeeResponse>>> Get(int id, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _employeeService.GetByIdAsync(id, cancellationToken);
                return Ok(ApiResponse<EmployeeResponse>.Ok(result));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting employee {Id}", id);
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<EmployeeResponse>>> Create([FromBody] CreateEmployeeRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _employeeService.CreateAsync(request, cancellationToken);
                return Ok(ApiResponse<EmployeeResponse>.Ok(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating employee");
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<EmployeeResponse>>> Update(int id, [FromBody] UpdateEmployeeRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _employeeService.UpdateAsync(id, request, cancellationToken);
                return Ok(ApiResponse<EmployeeResponse>.Ok(result));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating employee {Id}", id);
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<object>>> Delete(int id, CancellationToken cancellationToken)
        {
            try
            {
                await _employeeService.DeleteAsync(id, cancellationToken);
                return Ok(ApiResponse<object>.Ok());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting employee {Id}", id);
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }

        [HttpPatch("{id:int}/toggle-active")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<object>>> ToggleActive(int id, CancellationToken cancellationToken)
        {
            try
            {
                await _employeeService.ToggleActiveAsync(id, cancellationToken);
                return Ok(ApiResponse<object>.Ok());
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling active for employee {Id}", id);
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }

        [HttpPost("{id:int}/duplicate")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<EmployeeResponse>>> Duplicate(int id, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _employeeService.DuplicateAsync(id, cancellationToken);
                return Ok(ApiResponse<EmployeeResponse>.Ok(result));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error duplicating employee {Id}", id);
                return StatusCode(500, ApiResponse<object>.Fail("An error occurred"));
            }
        }
    }
}

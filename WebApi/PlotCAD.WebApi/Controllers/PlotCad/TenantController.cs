using Microsoft.AspNetCore.Mvc;
using PlotCAD.Application.DTOs.PlotCad.Tenant;
using PlotCAD.Application.Services.Interfaces;
using PlotCAD.Domain.Enums;
using PlotCAD.WebApi.Filters;

namespace PlotCAD.WebApi.Controllers.PlotCad
{
    [ApiController]
    [Route("api/internal/tenants")]
    [InternalApiKey]
    public class TenantController : ControllerBase
    {
        private readonly ITenantService _tenantService;
        private readonly IUserService _userService;
        private readonly ICurrentUserService _currentUserService;

        public TenantController(ITenantService tenantService, IUserService userService, ICurrentUserService currentUserService)
        {
            _tenantService = tenantService;
            _userService = userService;
            _currentUserService = currentUserService;
        }

        [HttpPost]
        public async Task<IActionResult> Provision([FromBody] TenantProvisionRequest request, CancellationToken ct)
        {
            var response = await _tenantService.ProvisionAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        {
            var tenant = await _tenantService.GetCachedAsync(id, ct);
            if (tenant == null)
                return NotFound();

            return Ok(new TenantResponse(
                tenant.Id,
                tenant.Name,
                tenant.PlanType,
                tenant.MaxUsers,
                tenant.SubscriptionStatus,
                tenant.SubscriptionExpiresAt));
        }

        [HttpPut("{id:guid}/subscription")]
        public async Task<IActionResult> UpdateSubscription(Guid id, [FromBody] UpdateSubscriptionRequest request, CancellationToken ct)
        {
            await _tenantService.UpdateSubscriptionAsync(id, request.SubscriptionStatus, request.SubscriptionExpiresAt, ct);
            return NoContent();
        }

        [HttpPost("{id:guid}/users")]
        public async Task<IActionResult> CreateUser(Guid id, [FromBody] CreateTenantUserRequest request, CancellationToken ct)
        {
            var canAdd = await _tenantService.CanAddUserAsync(id, ct);
            if (!canAdd)
                return UnprocessableEntity(new { message = "User limit reached for this tenant's plan." });

            _currentUserService.SetUser(0, Role.Admin, id);

            var user = await _userService.AddAsync(request, ct);
            return StatusCode(201, user);
        }
    }
}

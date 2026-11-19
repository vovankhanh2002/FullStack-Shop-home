using System.Security.Claims;
using Backend.Domain.Enums;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<OrderDto>>> Create([FromBody] CreateOrderRequest request)
    {
        Guid? userId = null;
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdStr, out var parsedId))
        {
            userId = parsedId;
        }

        var result = await _orderService.CreateOrderAsync(userId, request);
        return Ok(new ApiResponse<OrderDto>(true, "Đặt hàng thành công.", result));
    }

    [Authorize]
    [HttpGet("my-orders")]
    public async Task<ActionResult<ApiResponse<List<OrderDto>>>> GetMyOrders()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(new ApiResponse<object>(false, "Không xác thực được người dùng.", null));
        }

        var result = await _orderService.GetUserOrdersAsync(userId);
        return Ok(new ApiResponse<List<OrderDto>>(true, "Lấy danh sách đơn hàng thành công.", result));
    }

    [HttpGet("{orderCode}")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> GetByCode(string orderCode)
    {
        var result = await _orderService.GetOrderByCodeAsync(orderCode);
        return Ok(new ApiResponse<OrderDto>(true, "Lấy thông tin đơn hàng thành công.", result));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public async Task<ActionResult<ApiResponse<PagedResult<OrderDto>>>> GetAllAdmin(
        [FromQuery] OrderStatus? status,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 15
    )
    {
        var result = await _orderService.GetAllOrdersAdminAsync(status, pageIndex, pageSize);
        return Ok(new ApiResponse<PagedResult<OrderDto>>(true, "Lấy danh sách đơn hàng admin thành công.", result));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("admin/{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var result = await _orderService.UpdateOrderStatusAsync(id, request);
        return Ok(new ApiResponse<OrderDto>(true, "Cập nhật trạng thái đơn hàng thành công.", result));
    }
}

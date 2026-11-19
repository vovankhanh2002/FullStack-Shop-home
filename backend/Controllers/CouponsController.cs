using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly ICouponService _couponService;

    public CouponsController(ICouponService couponService)
    {
        _couponService = couponService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CouponDto>>>> GetAll()
    {
        var result = await _couponService.GetAllAsync();
        return Ok(new ApiResponse<List<CouponDto>>(true, "Lấy danh sách mã giảm giá thành công.", result));
    }

    [HttpPost("apply")]
    public async Task<ActionResult<ApiResponse<ApplyCouponResponse>>> ApplyCoupon([FromBody] ApplyCouponRequest request)
    {
        var result = await _couponService.ValidateCouponAsync(request.Code, request.SubTotal);
        return Ok(new ApiResponse<ApplyCouponResponse>(result.Valid, result.Message, result));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CouponDto>>> Create([FromBody] CouponDto request)
    {
        var result = await _couponService.CreateAsync(request);
        return Ok(new ApiResponse<CouponDto>(true, "Tạo mã giảm giá thành công.", result));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        await _couponService.DeleteAsync(id);
        return Ok(new ApiResponse<object>(true, "Xóa mã giảm giá thành công.", null));
    }
}

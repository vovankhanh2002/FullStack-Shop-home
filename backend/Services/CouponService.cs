using Backend.Data;
using Backend.Domain.Entities;
using Backend.Domain.Enums;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface ICouponService
{
    Task<List<CouponDto>> GetAllAsync();
    Task<ApplyCouponResponse> ValidateCouponAsync(string code, decimal subTotal);
    Task<CouponDto> CreateAsync(CouponDto dto);
    Task DeleteAsync(Guid id);
}

public class CouponService : ICouponService
{
    private readonly AppDbContext _context;

    public CouponService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CouponDto>> GetAllAsync()
    {
        return await _context.Coupons
            .Where(c => c.IsActive)
            .OrderByDescending(c => c.Value)
            .Select(c => new CouponDto(
                c.Id, c.Code, c.Description, c.DiscountType, c.Value,
                c.MinOrderValue, c.MaxDiscountAmount, c.StartDate, c.EndDate,
                c.UsageLimit, c.UsageCount, c.IsActive
            ))
            .ToListAsync();
    }

    public async Task<ApplyCouponResponse> ValidateCouponAsync(string code, decimal subTotal)
    {
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c =>
            c.Code.ToUpper() == code.Trim().ToUpper() && c.IsActive);

        if (coupon == null)
        {
            return new ApplyCouponResponse(false, "Mã giảm giá không tồn tại hoặc đã hết hạn.", 0, subTotal);
        }

        if (coupon.UsageCount >= coupon.UsageLimit)
        {
            return new ApplyCouponResponse(false, "Mã giảm giá đã hết lượt sử dụng.", 0, subTotal);
        }

        if (subTotal < coupon.MinOrderValue)
        {
            return new ApplyCouponResponse(false, $"Mã chỉ áp dụng cho đơn hàng từ {coupon.MinOrderValue:N0}đ trở lên.", 0, subTotal);
        }

        decimal discountAmount = 0;
        if (coupon.DiscountType == DiscountType.Percentage)
        {
            discountAmount = subTotal * (coupon.Value / 100m);
            if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
            {
                discountAmount = coupon.MaxDiscountAmount.Value;
            }
        }
        else
        {
            discountAmount = coupon.Value;
        }

        var finalAmount = Math.Max(0, subTotal - discountAmount);
        return new ApplyCouponResponse(true, "Áp dụng mã giảm giá thành công!", discountAmount, finalAmount);
    }

    public async Task<CouponDto> CreateAsync(CouponDto dto)
    {
        var coupon = new Coupon
        {
            Code = dto.Code.Trim().ToUpper(),
            Description = dto.Description,
            DiscountType = dto.DiscountType,
            Value = dto.Value,
            MinOrderValue = dto.MinOrderValue,
            MaxDiscountAmount = dto.MaxDiscountAmount,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            UsageLimit = dto.UsageLimit,
            IsActive = true
        };

        await _context.Coupons.AddAsync(coupon);
        await _context.SaveChangesAsync();

        return new CouponDto(
            coupon.Id, coupon.Code, coupon.Description, coupon.DiscountType, coupon.Value,
            coupon.MinOrderValue, coupon.MaxDiscountAmount, coupon.StartDate, coupon.EndDate,
            coupon.UsageLimit, coupon.UsageCount, coupon.IsActive
        );
    }

    public async Task DeleteAsync(Guid id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) throw new KeyNotFoundException("Không tìm thấy mã giảm giá.");

        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync();
    }
}

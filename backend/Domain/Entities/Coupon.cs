using Backend.Domain.Enums;

namespace Backend.Domain.Entities;

public class Coupon
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; } = DiscountType.Percentage;
    public decimal Value { get; set; } // 10% or 100,000đ
    public decimal MinOrderValue { get; set; } = 0;
    public decimal? MaxDiscountAmount { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int UsageLimit { get; set; } = 100;
    public int UsageCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}

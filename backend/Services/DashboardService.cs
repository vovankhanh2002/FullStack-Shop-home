using Backend.Data;
using Backend.Domain.Enums;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
}

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var totalRevenue = await _context.Orders
            .Where(o => o.OrderStatus == OrderStatus.Completed || o.PaymentStatus == PaymentStatus.Paid)
            .SumAsync(o => o.TotalAmount);

        var totalOrders = await _context.Orders.CountAsync();
        var totalProducts = await _context.Products.CountAsync(p => p.IsActive);
        var totalCustomers = await _context.Users.CountAsync(u => u.Role == UserRole.Customer);

        // Last 7 days revenue chart
        var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6);
        var recentOrdersList = await _context.Orders
            .Where(o => o.CreatedAt >= sevenDaysAgo)
            .ToListAsync();

        var revenueChart = new List<DailyRevenueDto>();
        for (int i = 0; i < 7; i++)
        {
            var targetDate = sevenDaysAgo.AddDays(i);
            var dateStr = targetDate.ToString("dd/MM");
            var dayOrders = recentOrdersList.Where(o => o.CreatedAt.Date == targetDate).ToList();
            var rev = dayOrders
                .Where(o => o.OrderStatus == OrderStatus.Completed || o.PaymentStatus == PaymentStatus.Paid)
                .Sum(o => o.TotalAmount);

            revenueChart.Add(new DailyRevenueDto(dateStr, rev, dayOrders.Count));
        }

        // Top products
        var topProducts = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Variants)
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.ViewCount)
            .Take(5)
            .Select(p => new ProductListDto(
                p.Id, p.CategoryId, p.Category.Name, p.Category.Slug,
                p.Name, p.Slug, p.ShortDescription, p.Material, p.Brand, p.WarrantyMonths,
                p.BasePrice, p.OriginalPrice,
                p.OriginalPrice > p.BasePrice && p.OriginalPrice > 0 ? (int)Math.Round((1 - (p.BasePrice / p.OriginalPrice)) * 100) : 0,
                p.PrimaryImageUrl, p.ViewCount, p.ReviewCount, p.AverageRating,
                p.IsFeatured, p.IsNew, p.IsFlashSale,
                p.Variants.Select(v => new ProductVariantDto(
                    v.Id, v.Size, v.ColorName, v.ColorHex, v.SKU, v.Price, v.OriginalPrice, v.StockQuantity, v.ImageUrl, v.IsActive
                )).ToList()
            ))
            .ToListAsync();

        // Recent orders
        var recentOrders = await _context.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Take(6)
            .Select(o => new OrderDto(
                o.Id, o.OrderCode, o.UserId, o.CustomerName, o.CustomerEmail, o.CustomerPhone,
                o.ShippingAddress, o.Province, o.District, o.Ward, o.InstallationNotes,
                o.SubTotal, o.ShippingFee, o.DiscountAmount, o.TotalAmount,
                o.PaymentMethod, o.PaymentStatus, o.OrderStatus, o.CouponCode,
                o.CreatedAt, o.ConfirmedAt, o.CompletedAt,
                o.Items.Select(i => new OrderItemDto(
                    i.Id, i.ProductId, i.VariantId, i.ProductName, i.VariantName,
                    i.ImageUrl, i.UnitPrice, i.Quantity, i.TotalPrice
                )).ToList()
            ))
            .ToListAsync();

        return new DashboardStatsDto(
            totalRevenue, totalOrders, totalProducts, totalCustomers,
            revenueChart, topProducts, recentOrders
        );
    }
}

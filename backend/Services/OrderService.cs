using Backend.Data;
using Backend.Domain.Entities;
using Backend.Domain.Enums;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(Guid? currentUserId, CreateOrderRequest request);
    Task<List<OrderDto>> GetUserOrdersAsync(Guid userId);
    Task<OrderDto> GetOrderByCodeAsync(string orderCode);
    Task<PagedResult<OrderDto>> GetAllOrdersAdminAsync(OrderStatus? status, int pageIndex = 1, int pageSize = 15);
    Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusRequest request);
}

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDto> CreateOrderAsync(Guid? currentUserId, CreateOrderRequest request)
    {
        if (request.Items == null || request.Items.Count == 0)
        {
            throw new BadHttpRequestException("Đơn hàng phải chứa ít nhất 1 sản phẩm.");
        }

        Guid userId;
        if (currentUserId.HasValue)
        {
            userId = currentUserId.Value;
        }
        else
        {
            // Guest checkout: Find existing customer by email or create a new Customer profile
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.CustomerEmail.Trim().ToLower());
            if (existingUser != null)
            {
                userId = existingUser.Id;
            }
            else
            {
                var guestUser = new User
                {
                    FullName = request.CustomerName.Trim(),
                    Email = request.CustomerEmail.Trim().ToLower(),
                    PhoneNumber = request.CustomerPhone?.Trim(),
                    Address = request.ShippingAddress?.Trim(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N")),
                    Role = UserRole.Customer,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Users.AddAsync(guestUser);
                await _context.SaveChangesAsync();
                userId = guestUser.Id;
            }
        }

        var orderItems = new List<OrderItem>();
        decimal subTotal = 0;

        foreach (var itemReq in request.Items)
        {
            var product = await _context.Products
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == itemReq.ProductId && p.IsActive);

            if (product == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy sản phẩm có ID: {itemReq.ProductId}");
            }

            decimal unitPrice = product.BasePrice;
            string variantName = "Mặc định";
            string? imageUrl = product.PrimaryImageUrl;

            if (itemReq.VariantId.HasValue)
            {
                var variant = product.Variants.FirstOrDefault(v => v.Id == itemReq.VariantId.Value && v.IsActive);
                if (variant != null)
                {
                    unitPrice = variant.Price;
                    variantName = $"{variant.Size} - {variant.ColorName}";
                    if (!string.IsNullOrEmpty(variant.ImageUrl))
                    {
                        imageUrl = variant.ImageUrl;
                    }

                    // Decrease stock
                    if (variant.StockQuantity >= itemReq.Quantity)
                    {
                        variant.StockQuantity -= itemReq.Quantity;
                    }
                }
            }

            var itemTotal = unitPrice * itemReq.Quantity;
            subTotal += itemTotal;

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                VariantId = itemReq.VariantId,
                ProductName = product.Name,
                VariantName = variantName,
                ImageUrl = imageUrl,
                UnitPrice = unitPrice,
                Quantity = itemReq.Quantity,
                TotalPrice = itemTotal
            });
        }

        // Shipping fee calculation: Free shipping for orders >= 1,000,000đ, otherwise 50,000đ
        decimal shippingFee = subTotal >= 1000000 ? 0 : 50000;
        decimal discountAmount = 0;

        // Apply coupon if provided
        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var coupon = await _context.Coupons.FirstOrDefaultAsync(c =>
                c.Code.ToUpper() == request.CouponCode.Trim().ToUpper() && c.IsActive);

            if (coupon != null && subTotal >= coupon.MinOrderValue)
            {
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

                coupon.UsageCount++;
            }
        }

        var totalAmount = Math.Max(0, subTotal + shippingFee - discountAmount);
        var orderCode = $"SH-{DateTime.UtcNow:yyMMdd}-{Guid.NewGuid():N}"[..15].ToUpper();

        var order = new Order
        {
            OrderCode = orderCode,
            UserId = userId,
            CustomerName = request.CustomerName,
            CustomerEmail = request.CustomerEmail,
            CustomerPhone = request.CustomerPhone,
            ShippingAddress = request.ShippingAddress,
            Province = request.Province,
            District = request.District,
            Ward = request.Ward,
            InstallationNotes = request.InstallationNotes,
            SubTotal = subTotal,
            ShippingFee = shippingFee,
            DiscountAmount = discountAmount,
            TotalAmount = totalAmount,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = PaymentStatus.Pending,
            OrderStatus = OrderStatus.Pending,
            CouponCode = request.CouponCode,
            CreatedAt = DateTime.UtcNow,
            Items = orderItems
        };

        await _context.Orders.AddAsync(order);
        await _context.SaveChangesAsync();

        return MapToDto(order);
    }

    public async Task<List<OrderDto>> GetUserOrdersAsync(Guid userId)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => MapToDto(o))
            .ToListAsync();
    }

    public async Task<OrderDto> GetOrderByCodeAsync(string orderCode)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderCode == orderCode);

        if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn hàng.");

        return MapToDto(order);
    }

    public async Task<PagedResult<OrderDto>> GetAllOrdersAdminAsync(OrderStatus? status, int pageIndex = 1, int pageSize = 15)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(o => o.OrderStatus == status.Value);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(o => MapToDto(o))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PagedResult<OrderDto>(items, totalCount, pageIndex, pageSize, totalPages);
    }

    public async Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn hàng.");

        order.OrderStatus = request.OrderStatus;
        if (request.PaymentStatus.HasValue)
        {
            order.PaymentStatus = request.PaymentStatus.Value;
        }

        if (request.OrderStatus == OrderStatus.Confirmed && order.ConfirmedAt == null)
        {
            order.ConfirmedAt = DateTime.UtcNow;
        }
        else if (request.OrderStatus == OrderStatus.Completed && order.CompletedAt == null)
        {
            order.CompletedAt = DateTime.UtcNow;
            order.PaymentStatus = PaymentStatus.Paid;
        }

        await _context.SaveChangesAsync();
        return MapToDto(order);
    }

    private static OrderDto MapToDto(Order o)
    {
        var items = o.Items.Select(i => new OrderItemDto(
            i.Id, i.ProductId, i.VariantId, i.ProductName, i.VariantName,
            i.ImageUrl, i.UnitPrice, i.Quantity, i.TotalPrice
        )).ToList();

        return new OrderDto(
            o.Id, o.OrderCode, o.UserId, o.CustomerName, o.CustomerEmail, o.CustomerPhone,
            o.ShippingAddress, o.Province, o.District, o.Ward, o.InstallationNotes,
            o.SubTotal, o.ShippingFee, o.DiscountAmount, o.TotalAmount,
            o.PaymentMethod, o.PaymentStatus, o.OrderStatus, o.CouponCode,
            o.CreatedAt, o.ConfirmedAt, o.CompletedAt, items
        );
    }
}

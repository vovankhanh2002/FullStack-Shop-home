using Backend.Domain.Enums;

namespace Backend.DTOs;

// Generic API response
public record ApiResponse<T>(bool Success, string Message, T? Data);

// Paged response
public record PagedResult<T>(List<T> Items, int TotalCount, int PageIndex, int PageSize, int TotalPages);

// Auth
public record LoginRequest(string Email, string Password);
public record RegisterRequest(string FullName, string Email, string Password, string? PhoneNumber, string? Address);
public record AuthResponse(UserDto User, string AccessToken, string RefreshToken);
public record UserDto(Guid Id, string FullName, string Email, string? PhoneNumber, string? Address, UserRole Role);

// Category
public record CategoryDto(Guid Id, string Name, string Slug, string? Description, string? ImageUrl, int DisplayOrder, int ProductCount);
public record CreateCategoryRequest(string Name, string? Description, string? ImageUrl, int DisplayOrder);

// Product Variant
public record ProductVariantDto(
    Guid Id,
    string Size,
    string ColorName,
    string ColorHex,
    string SKU,
    decimal Price,
    decimal OriginalPrice,
    int StockQuantity,
    string? ImageUrl,
    bool IsActive
);

public record CreateProductVariantRequest(
    string Size,
    string ColorName,
    string ColorHex,
    string SKU,
    decimal Price,
    decimal OriginalPrice,
    int StockQuantity,
    string? ImageUrl
);

// Product Image
public record ProductImageDto(Guid Id, string ImageUrl, int DisplayOrder, string? AltText);

// Product
public record ProductListDto(
    Guid Id,
    Guid CategoryId,
    string CategoryName,
    string CategorySlug,
    string Name,
    string Slug,
    string ShortDescription,
    string Material,
    string Brand,
    int WarrantyMonths,
    decimal BasePrice,
    decimal OriginalPrice,
    int DiscountPercent,
    string PrimaryImageUrl,
    int ViewCount,
    int ReviewCount,
    decimal AverageRating,
    bool IsFeatured,
    bool IsNew,
    bool IsFlashSale,
    List<ProductVariantDto> Variants
);

public record ProductDetailDto(
    Guid Id,
    Guid CategoryId,
    string CategoryName,
    string CategorySlug,
    string Name,
    string Slug,
    string ShortDescription,
    string Description,
    string Material,
    string Brand,
    int WarrantyMonths,
    string? CareInstructions,
    decimal BasePrice,
    decimal OriginalPrice,
    int DiscountPercent,
    string PrimaryImageUrl,
    int ViewCount,
    int ReviewCount,
    decimal AverageRating,
    bool IsFeatured,
    bool IsNew,
    bool IsFlashSale,
    List<ProductVariantDto> Variants,
    List<ProductImageDto> Images,
    List<ReviewDto> Reviews
);

public record CreateProductRequest(
    Guid CategoryId,
    string Name,
    string ShortDescription,
    string Description,
    string Material,
    string Brand,
    int WarrantyMonths,
    string? CareInstructions,
    decimal BasePrice,
    decimal OriginalPrice,
    string PrimaryImageUrl,
    bool IsFeatured,
    bool IsNew,
    bool IsFlashSale,
    List<CreateProductVariantRequest>? Variants,
    List<string>? AdditionalImages
);

public record UpdateProductRequest(
    Guid CategoryId,
    string Name,
    string ShortDescription,
    string Description,
    string Material,
    string Brand,
    int WarrantyMonths,
    string? CareInstructions,
    decimal BasePrice,
    decimal OriginalPrice,
    string PrimaryImageUrl,
    bool IsFeatured,
    bool IsNew,
    bool IsFlashSale,
    bool IsActive,
    List<CreateProductVariantRequest>? Variants = null,
    List<string>? AdditionalImages = null
);

// Order
public record CreateOrderItemRequest(Guid ProductId, Guid? VariantId, int Quantity);

public record CreateOrderRequest(
    string CustomerName,
    string CustomerEmail,
    string CustomerPhone,
    string ShippingAddress,
    string Province,
    string District,
    string? Ward,
    string? InstallationNotes,
    PaymentMethod PaymentMethod,
    string? CouponCode,
    List<CreateOrderItemRequest> Items
);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    Guid? VariantId,
    string ProductName,
    string VariantName,
    string? ImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal TotalPrice
);

public record OrderDto(
    Guid Id,
    string OrderCode,
    Guid UserId,
    string CustomerName,
    string CustomerEmail,
    string CustomerPhone,
    string ShippingAddress,
    string Province,
    string District,
    string? Ward,
    string? InstallationNotes,
    decimal SubTotal,
    decimal ShippingFee,
    decimal DiscountAmount,
    decimal TotalAmount,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    OrderStatus OrderStatus,
    string? CouponCode,
    DateTime CreatedAt,
    DateTime? ConfirmedAt,
    DateTime? CompletedAt,
    List<OrderItemDto> Items
);

public record UpdateOrderStatusRequest(OrderStatus OrderStatus, PaymentStatus? PaymentStatus);

// Coupon
public record CouponDto(
    Guid Id,
    string Code,
    string Description,
    DiscountType DiscountType,
    decimal Value,
    decimal MinOrderValue,
    decimal? MaxDiscountAmount,
    DateTime? StartDate,
    DateTime? EndDate,
    int UsageLimit,
    int UsageCount,
    bool IsActive
);

public record ApplyCouponRequest(string Code, decimal SubTotal);
public record ApplyCouponResponse(bool Valid, string Message, decimal DiscountAmount, decimal FinalAmount);

// Review
public record CreateReviewRequest(Guid ProductId, int Rating, string Comment);
public record ReviewDto(Guid Id, string CustomerName, int Rating, string Comment, DateTime CreatedAt);

// Lookbook
public record LookbookDto(
    Guid Id,
    string Title,
    string Subtitle,
    string ImageUrl,
    string RoomType,
    string Description,
    string HotspotsJson,
    int DisplayOrder
);

// Dashboard
public record DashboardStatsDto(
    decimal TotalRevenue,
    int TotalOrders,
    int TotalProducts,
    int TotalCustomers,
    List<DailyRevenueDto> RevenueChart,
    List<ProductListDto> TopProducts,
    List<OrderDto> RecentOrders
);

public record DailyRevenueDto(string Date, decimal Revenue, int Orders);

// SePay Payment Webhook
public class SepayWebhookRequest
{
    public long Id { get; set; }
    public string Gateway { get; set; } = string.Empty;
    public string TransactionDate { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string Content { get; set; } = string.Empty;
    public string TransferType { get; set; } = "in";
    public decimal TransferAmount { get; set; }
    public decimal Accumulated { get; set; }
    public string? SubAccount { get; set; }
    public string? ReferenceCode { get; set; }
    public string? Description { get; set; }
}

public record PaymentConfigDto(
    string BankName,
    string AccountNumber,
    string AccountName
);

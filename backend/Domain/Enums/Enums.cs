namespace Backend.Domain.Enums;

public enum UserRole
{
    Customer = 0,
    Admin = 1
}

public enum OrderStatus
{
    Pending = 0,     // Chờ xác nhận
    Confirmed = 1,   // Đã xác nhận
    Packing = 2,     // Đang đóng gói
    Delivering = 3,  // Đang giao lắp
    Completed = 4,   // Hoàn thành
    Cancelled = 5    // Đã hủy
}

public enum PaymentMethod
{
    COD = 0,     // Thanh toán khi nhận hàng
    VietQR = 1   // Chuyển khoản VietQR tự động
}

public enum PaymentStatus
{
    Pending = 0,
    Paid = 1,
    Failed = 2,
    Refunded = 3
}

public enum DiscountType
{
    Percentage = 0,
    FixedAmount = 1
}

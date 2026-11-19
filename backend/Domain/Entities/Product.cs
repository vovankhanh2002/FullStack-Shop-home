namespace Backend.Domain.Entities;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty; // Rich HTML/Markdown

    public string Material { get; set; } = "Cotton Tencel"; // Chất liệu
    public string Brand { get; set; } = "ShopHome Luxury"; // Thương hiệu / Bộ sưu tập
    public int WarrantyMonths { get; set; } = 24; // Bảo hành (tháng)
    public string? CareInstructions { get; set; } // Hướng dẫn giặt ủi/bảo quản

    public decimal BasePrice { get; set; } = 0; // Giá khởi điểm
    public decimal OriginalPrice { get; set; } = 0; // Giá gốc trước giảm
    public string PrimaryImageUrl { get; set; } = string.Empty;

    public int ViewCount { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;
    public decimal AverageRating { get; set; } = 5.0m;

    public bool IsFeatured { get; set; } = false;
    public bool IsNew { get; set; } = true;
    public bool IsFlashSale { get; set; } = false;
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

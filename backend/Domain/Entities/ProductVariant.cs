namespace Backend.Domain.Entities;

public class ProductVariant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string Size { get; set; } = "1m6 x 2m"; // 1m6 x 2m, 1m8 x 2m, 2m x 2m2...
    public string ColorName { get; set; } = "Be Cát"; // Be Cát, Xanh Olive...
    public string ColorHex { get; set; } = "#D4A373";
    public string SKU { get; set; } = string.Empty;

    public decimal Price { get; set; }
    public decimal OriginalPrice { get; set; }
    public int StockQuantity { get; set; } = 50;

    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
}

using System.Text.RegularExpressions;
using Backend.Data;
using Backend.Domain.Entities;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IProductService
{
    Task<PagedResult<ProductListDto>> GetProductsAsync(
        string? search,
        string? categorySlug,
        string? material,
        decimal? minPrice,
        decimal? maxPrice,
        bool? isFeatured,
        bool? isNew,
        bool? isFlashSale,
        string? sortBy,
        int pageIndex = 1,
        int pageSize = 12
    );

    Task<ProductDetailDto> GetBySlugAsync(string slug);
    Task<ProductDetailDto> GetByIdAsync(Guid id);
    Task<ProductDetailDto> CreateAsync(CreateProductRequest request);
    Task<ProductDetailDto> UpdateAsync(Guid id, UpdateProductRequest request);
    Task DeleteAsync(Guid id);

    Task<ProductVariantDto> AddVariantAsync(Guid productId, CreateProductVariantRequest request);
    Task DeleteVariantAsync(Guid variantId);
}

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ProductListDto>> GetProductsAsync(
        string? search,
        string? categorySlug,
        string? material,
        decimal? minPrice,
        decimal? maxPrice,
        bool? isFeatured,
        bool? isNew,
        bool? isFlashSale,
        string? sortBy,
        int pageIndex = 1,
        int pageSize = 12
    )
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Variants)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower().Trim();
            query = query.Where(p =>
                p.Name.ToLower().Contains(s) ||
                p.ShortDescription.ToLower().Contains(s) ||
                p.Material.ToLower().Contains(s) ||
                p.Brand.ToLower().Contains(s)
            );
        }

        if (!string.IsNullOrWhiteSpace(categorySlug))
        {
            query = query.Where(p => p.Category.Slug == categorySlug.Trim());
        }

        if (!string.IsNullOrWhiteSpace(material))
        {
            query = query.Where(p => p.Material.ToLower().Contains(material.ToLower().Trim()));
        }

        if (minPrice.HasValue)
        {
            query = query.Where(p => p.BasePrice >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.BasePrice <= maxPrice.Value);
        }

        if (isFeatured.HasValue)
        {
            query = query.Where(p => p.IsFeatured == isFeatured.Value);
        }

        if (isNew.HasValue)
        {
            query = query.Where(p => p.IsNew == isNew.Value);
        }

        if (isFlashSale.HasValue)
        {
            query = query.Where(p => p.IsFlashSale == isFlashSale.Value);
        }

        // Sorting
        query = sortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(p => p.BasePrice),
            "price_desc" => query.OrderByDescending(p => p.BasePrice),
            "popular" => query.OrderByDescending(p => p.ViewCount),
            "rating" => query.OrderByDescending(p => p.AverageRating),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(p => MapToListDto(p))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PagedResult<ProductListDto>(items, totalCount, pageIndex, pageSize, totalPages);
    }

    public async Task<ProductDetailDto> GetBySlugAsync(string slug)
    {
        var p = await _context.Products
            .Include(x => x.Category)
            .Include(x => x.Variants.Where(v => v.IsActive))
            .Include(x => x.Images.OrderBy(i => i.DisplayOrder))
            .Include(x => x.Reviews.OrderByDescending(r => r.CreatedAt))
            .FirstOrDefaultAsync(x => x.Slug == slug);

        if (p == null) throw new KeyNotFoundException("Không tìm thấy sản phẩm.");

        p.ViewCount++;
        await _context.SaveChangesAsync();

        return MapToDetailDto(p);
    }

    public async Task<ProductDetailDto> GetByIdAsync(Guid id)
    {
        var p = await _context.Products
            .Include(x => x.Category)
            .Include(x => x.Variants)
            .Include(x => x.Images.OrderBy(i => i.DisplayOrder))
            .Include(x => x.Reviews.OrderByDescending(r => r.CreatedAt))
            .FirstOrDefaultAsync(x => x.Id == id);

        if (p == null) throw new KeyNotFoundException("Không tìm thấy sản phẩm.");

        return MapToDetailDto(p);
    }

    public async Task<ProductDetailDto> CreateAsync(CreateProductRequest request)
    {
        var slug = GenerateSlug(request.Name);
        var existing = await _context.Products.AnyAsync(p => p.Slug == slug);
        if (existing) slug += $"-{Guid.NewGuid():N}"[..6];

        var product = new Product
        {
            CategoryId = request.CategoryId,
            Name = request.Name,
            Slug = slug,
            ShortDescription = request.ShortDescription,
            Description = request.Description,
            Material = request.Material,
            Brand = request.Brand,
            WarrantyMonths = request.WarrantyMonths,
            CareInstructions = request.CareInstructions,
            BasePrice = request.BasePrice,
            OriginalPrice = request.OriginalPrice,
            PrimaryImageUrl = request.PrimaryImageUrl,
            IsFeatured = request.IsFeatured,
            IsNew = request.IsNew,
            IsFlashSale = request.IsFlashSale,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (request.Variants != null && request.Variants.Count > 0)
        {
            foreach (var v in request.Variants)
            {
                product.Variants.Add(new ProductVariant
                {
                    Size = v.Size,
                    ColorName = v.ColorName,
                    ColorHex = v.ColorHex,
                    SKU = string.IsNullOrWhiteSpace(v.SKU) ? $"SH-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}-{Guid.NewGuid():N}"[..24] : v.SKU,
                    Price = v.Price,
                    OriginalPrice = v.OriginalPrice,
                    StockQuantity = v.StockQuantity,
                    ImageUrl = v.ImageUrl,
                    IsActive = true
                });
            }
        }

        if (request.AdditionalImages != null && request.AdditionalImages.Count > 0)
        {
            int order = 1;
            foreach (var img in request.AdditionalImages)
            {
                product.Images.Add(new ProductImage
                {
                    ImageUrl = img,
                    DisplayOrder = order++,
                    AltText = request.Name
                });
            }
        }

        await _context.Products.AddAsync(product);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(product.Id);
    }

    public async Task<ProductDetailDto> UpdateAsync(Guid id, UpdateProductRequest request)
    {
        var p = await _context.Products.FindAsync(id);
        if (p == null) throw new KeyNotFoundException("Không tìm thấy sản phẩm.");

        p.CategoryId = request.CategoryId;
        p.Name = request.Name;
        p.ShortDescription = request.ShortDescription;
        p.Description = request.Description;
        p.Material = request.Material;
        p.Brand = request.Brand;
        p.WarrantyMonths = request.WarrantyMonths;
        p.CareInstructions = request.CareInstructions;
        p.BasePrice = request.BasePrice;
        p.OriginalPrice = request.OriginalPrice;
        p.PrimaryImageUrl = request.PrimaryImageUrl;
        p.IsFeatured = request.IsFeatured;
        p.IsNew = request.IsNew;
        p.IsFlashSale = request.IsFlashSale;
        p.IsActive = request.IsActive;
        p.UpdatedAt = DateTime.UtcNow;

        if (request.Variants != null)
        {
            var oldVariants = await _context.ProductVariants.Where(v => v.ProductId == id).ToListAsync();
            _context.ProductVariants.RemoveRange(oldVariants);

            foreach (var v in request.Variants)
            {
                await _context.ProductVariants.AddAsync(new ProductVariant
                {
                    ProductId = id,
                    Size = v.Size,
                    ColorName = v.ColorName,
                    ColorHex = v.ColorHex,
                    SKU = string.IsNullOrWhiteSpace(v.SKU) ? $"SH-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}-{Guid.NewGuid():N}"[..24] : v.SKU,
                    Price = v.Price,
                    OriginalPrice = v.OriginalPrice,
                    StockQuantity = v.StockQuantity,
                    ImageUrl = string.IsNullOrWhiteSpace(v.ImageUrl) ? p.PrimaryImageUrl : v.ImageUrl,
                    IsActive = true
                });
            }
        }

        if (request.AdditionalImages != null)
        {
            var oldImages = await _context.ProductImages.Where(img => img.ProductId == id).ToListAsync();
            _context.ProductImages.RemoveRange(oldImages);

            int order = 1;
            foreach (var img in request.AdditionalImages)
            {
                await _context.ProductImages.AddAsync(new ProductImage
                {
                    ProductId = id,
                    ImageUrl = img,
                    DisplayOrder = order++,
                    AltText = p.Name
                });
            }
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(p.Id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var p = await _context.Products.FindAsync(id);
        if (p == null) throw new KeyNotFoundException("Không tìm thấy sản phẩm.");

        p.IsActive = false; // Soft delete
        await _context.SaveChangesAsync();
    }

    public async Task<ProductVariantDto> AddVariantAsync(Guid productId, CreateProductVariantRequest request)
    {
        var p = await _context.Products.FindAsync(productId);
        if (p == null) throw new KeyNotFoundException("Không tìm thấy sản phẩm.");

        var variant = new ProductVariant
        {
            ProductId = productId,
            Size = request.Size,
            ColorName = request.ColorName,
            ColorHex = request.ColorHex,
            SKU = request.SKU,
            Price = request.Price,
            OriginalPrice = request.OriginalPrice,
            StockQuantity = request.StockQuantity,
            ImageUrl = request.ImageUrl,
            IsActive = true
        };

        await _context.ProductVariants.AddAsync(variant);
        await _context.SaveChangesAsync();

        return new ProductVariantDto(
            variant.Id, variant.Size, variant.ColorName, variant.ColorHex,
            variant.SKU, variant.Price, variant.OriginalPrice, variant.StockQuantity,
            variant.ImageUrl, variant.IsActive
        );
    }

    public async Task DeleteVariantAsync(Guid variantId)
    {
        var v = await _context.ProductVariants.FindAsync(variantId);
        if (v == null) throw new KeyNotFoundException("Không tìm thấy biến thể.");

        _context.ProductVariants.Remove(v);
        await _context.SaveChangesAsync();
    }

    private static ProductListDto MapToListDto(Product p)
    {
        int discount = 0;
        if (p.OriginalPrice > p.BasePrice && p.OriginalPrice > 0)
        {
            discount = (int)Math.Round((1 - (p.BasePrice / p.OriginalPrice)) * 100);
        }

        var variants = p.Variants.Where(v => v.IsActive).Select(v => new ProductVariantDto(
            v.Id, v.Size, v.ColorName, v.ColorHex, v.SKU, v.Price, v.OriginalPrice, v.StockQuantity, v.ImageUrl, v.IsActive
        )).ToList();

        return new ProductListDto(
            p.Id, p.CategoryId, p.Category?.Name ?? "", p.Category?.Slug ?? "",
            p.Name, p.Slug, p.ShortDescription, p.Material, p.Brand, p.WarrantyMonths,
            p.BasePrice, p.OriginalPrice, discount, p.PrimaryImageUrl,
            p.ViewCount, p.ReviewCount, p.AverageRating,
            p.IsFeatured, p.IsNew, p.IsFlashSale, variants
        );
    }

    private static ProductDetailDto MapToDetailDto(Product p)
    {
        int discount = 0;
        if (p.OriginalPrice > p.BasePrice && p.OriginalPrice > 0)
        {
            discount = (int)Math.Round((1 - (p.BasePrice / p.OriginalPrice)) * 100);
        }

        var variants = p.Variants.Where(v => v.IsActive).Select(v => new ProductVariantDto(
            v.Id, v.Size, v.ColorName, v.ColorHex, v.SKU, v.Price, v.OriginalPrice, v.StockQuantity, v.ImageUrl, v.IsActive
        )).ToList();

        var images = p.Images.Select(i => new ProductImageDto(i.Id, i.ImageUrl, i.DisplayOrder, i.AltText)).ToList();
        var reviews = p.Reviews.Select(r => new ReviewDto(r.Id, r.CustomerName, r.Rating, r.Comment, r.CreatedAt)).ToList();

        return new ProductDetailDto(
            p.Id, p.CategoryId, p.Category?.Name ?? "", p.Category?.Slug ?? "",
            p.Name, p.Slug, p.ShortDescription, p.Description, p.Material, p.Brand,
            p.WarrantyMonths, p.CareInstructions, p.BasePrice, p.OriginalPrice, discount,
            p.PrimaryImageUrl, p.ViewCount, p.ReviewCount, p.AverageRating,
            p.IsFeatured, p.IsNew, p.IsFlashSale, variants, images, reviews
        );
    }

    private static string GenerateSlug(string text)
    {
        var str = text.ToLowerInvariant().Trim();
        str = Regex.Replace(str, @"[áàảãạăắằẳẵặâấầẩẫậ]", "a");
        str = Regex.Replace(str, @"[éèẻẽẹêếềểễệ]", "e");
        str = Regex.Replace(str, @"[íìỉĩị]", "i");
        str = Regex.Replace(str, @"[óòỏõọôốồổỗộơớờởỡợ]", "o");
        str = Regex.Replace(str, @"[úùủũụưứừửữự]", "u");
        str = Regex.Replace(str, @"[ýỳỷỹỵ]", "y");
        str = Regex.Replace(str, @"[đ]", "d");
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
        str = Regex.Replace(str, @"\s+", "-").Trim('-');
        return str;
    }
}

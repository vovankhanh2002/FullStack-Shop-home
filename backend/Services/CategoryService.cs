using System.Text.RegularExpressions;
using Backend.Data;
using Backend.Domain.Entities;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync();
    Task<CategoryDto> GetByIdAsync(Guid id);
    Task<CategoryDto> GetBySlugAsync(string slug);
    Task<CategoryDto> CreateAsync(CreateCategoryRequest request);
    Task<CategoryDto> UpdateAsync(Guid id, CreateCategoryRequest request);
    Task DeleteAsync(Guid id);
}

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        return await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Slug,
                c.Description,
                c.ImageUrl,
                c.DisplayOrder,
                c.Products.Count(p => p.IsActive)
            ))
            .ToListAsync();
    }

    public async Task<CategoryDto> GetByIdAsync(Guid id)
    {
        var c = await _context.Categories
            .Include(x => x.Products)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (c == null) throw new KeyNotFoundException("Không tìm thấy danh mục.");

        return new CategoryDto(c.Id, c.Name, c.Slug, c.Description, c.ImageUrl, c.DisplayOrder, c.Products.Count(p => p.IsActive));
    }

    public async Task<CategoryDto> GetBySlugAsync(string slug)
    {
        var c = await _context.Categories
            .Include(x => x.Products)
            .FirstOrDefaultAsync(x => x.Slug == slug);

        if (c == null) throw new KeyNotFoundException("Không tìm thấy danh mục.");

        return new CategoryDto(c.Id, c.Name, c.Slug, c.Description, c.ImageUrl, c.DisplayOrder, c.Products.Count(p => p.IsActive));
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request)
    {
        var slug = GenerateSlug(request.Name);
        var existing = await _context.Categories.AnyAsync(c => c.Slug == slug);
        if (existing) slug += $"-{Guid.NewGuid():N}"[..6];

        var category = new Category
        {
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            DisplayOrder = request.DisplayOrder,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();

        return new CategoryDto(category.Id, category.Name, category.Slug, category.Description, category.ImageUrl, category.DisplayOrder, 0);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, CreateCategoryRequest request)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) throw new KeyNotFoundException("Không tìm thấy danh mục.");

        category.Name = request.Name;
        category.Description = request.Description;
        category.ImageUrl = request.ImageUrl;
        category.DisplayOrder = request.DisplayOrder;

        await _context.SaveChangesAsync();

        var count = await _context.Products.CountAsync(p => p.CategoryId == id && p.IsActive);
        return new CategoryDto(category.Id, category.Name, category.Slug, category.Description, category.ImageUrl, category.DisplayOrder, count);
    }

    public async Task DeleteAsync(Guid id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) throw new KeyNotFoundException("Không tìm thấy danh mục.");

        var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
        if (hasProducts)
        {
            throw new InvalidOperationException("Không thể xóa danh mục đang chứa sản phẩm.");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
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

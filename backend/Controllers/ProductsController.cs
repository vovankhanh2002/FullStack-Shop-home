using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ProductListDto>>>> GetProducts(
        [FromQuery] string? search,
        [FromQuery] string? categorySlug,
        [FromQuery] string? material,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] bool? isFeatured,
        [FromQuery] bool? isNew,
        [FromQuery] bool? isFlashSale,
        [FromQuery] string? sortBy,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 12
    )
    {
        var result = await _productService.GetProductsAsync(
            search, categorySlug, material, minPrice, maxPrice,
            isFeatured, isNew, isFlashSale, sortBy, pageIndex, pageSize
        );
        return Ok(new ApiResponse<PagedResult<ProductListDto>>(true, "Lấy danh sách sản phẩm thành công.", result));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ApiResponse<ProductDetailDto>>> GetBySlug(string slug)
    {
        var result = await _productService.GetBySlugAsync(slug);
        return Ok(new ApiResponse<ProductDetailDto>(true, "Lấy chi tiết sản phẩm thành công.", result));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProductDetailDto>>> Create([FromBody] CreateProductRequest request)
    {
        var result = await _productService.CreateAsync(request);
        return CreatedAtAction(nameof(GetBySlug), new { slug = result.Slug },
            new ApiResponse<ProductDetailDto>(true, "Tạo sản phẩm mới thành công.", result));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ProductDetailDto>>> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        var result = await _productService.UpdateAsync(id, request);
        return Ok(new ApiResponse<ProductDetailDto>(true, "Cập nhật sản phẩm thành công.", result));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        await _productService.DeleteAsync(id);
        return Ok(new ApiResponse<object>(true, "Xóa sản phẩm thành công.", null));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{id:guid}/variants")]
    public async Task<ActionResult<ApiResponse<ProductVariantDto>>> AddVariant(Guid id, [FromBody] CreateProductVariantRequest request)
    {
        var result = await _productService.AddVariantAsync(id, request);
        return Ok(new ApiResponse<ProductVariantDto>(true, "Thêm biến thể sản phẩm thành công.", result));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("variants/{variantId:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteVariant(Guid variantId)
    {
        await _productService.DeleteVariantAsync(variantId);
        return Ok(new ApiResponse<object>(true, "Xóa biến thể sản phẩm thành công.", null));
    }
}

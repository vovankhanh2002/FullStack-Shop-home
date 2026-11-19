using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetAll()
    {
        var result = await _categoryService.GetAllAsync();
        return Ok(new ApiResponse<List<CategoryDto>>(true, "Lấy danh sách danh mục thành công.", result));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetBySlug(string slug)
    {
        var result = await _categoryService.GetBySlugAsync(slug);
        return Ok(new ApiResponse<CategoryDto>(true, "Lấy thông tin danh mục thành công.", result));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Create([FromBody] CreateCategoryRequest request)
    {
        var result = await _categoryService.CreateAsync(request);
        return CreatedAtAction(nameof(GetBySlug), new { slug = result.Slug },
            new ApiResponse<CategoryDto>(true, "Tạo danh mục thành công.", result));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Update(Guid id, [FromBody] CreateCategoryRequest request)
    {
        var result = await _categoryService.UpdateAsync(id, request);
        return Ok(new ApiResponse<CategoryDto>(true, "Cập nhật danh mục thành công.", result));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        await _categoryService.DeleteAsync(id);
        return Ok(new ApiResponse<object>(true, "Xóa danh mục thành công.", null));
    }
}

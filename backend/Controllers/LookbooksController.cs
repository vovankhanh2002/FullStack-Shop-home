using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LookbooksController : ControllerBase
{
    private readonly ILookbookService _lookbookService;

    public LookbooksController(ILookbookService lookbookService)
    {
        _lookbookService = lookbookService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<LookbookDto>>>> GetAll()
    {
        var result = await _lookbookService.GetAllAsync();
        return Ok(new ApiResponse<List<LookbookDto>>(true, "Lấy danh sách Lookbook thành công.", result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<LookbookDto>>> GetById(Guid id)
    {
        var result = await _lookbookService.GetByIdAsync(id);
        return Ok(new ApiResponse<LookbookDto>(true, "Lấy thông tin Lookbook thành công.", result));
    }
}

using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IFileStorageService _fileStorage;

    public UploadController(IFileStorageService fileStorage)
    {
        _fileStorage = fileStorage;
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("image")]
    public async Task<ActionResult<ApiResponse<string>>> UploadImage([FromForm] IFormFile file)
    {
        var url = await _fileStorage.SaveImageAsync(file);
        return Ok(new ApiResponse<string>(true, "Tải ảnh lên thành công.", url));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("images")]
    public async Task<ActionResult<ApiResponse<List<string>>>> UploadMultipleImages([FromForm] List<IFormFile> files)
    {
        var urls = new List<string>();
        foreach (var file in files)
        {
            if (file != null && file.Length > 0)
            {
                var url = await _fileStorage.SaveImageAsync(file);
                urls.Add(url);
            }
        }
        return Ok(new ApiResponse<List<string>>(true, "Tải nhiều ảnh thành công.", urls));
    }
}

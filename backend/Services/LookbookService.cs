using Backend.Data;
using Backend.Domain.Entities;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface ILookbookService
{
    Task<List<LookbookDto>> GetAllAsync();
    Task<LookbookDto> GetByIdAsync(Guid id);
}

public class LookbookService : ILookbookService
{
    private readonly AppDbContext _context;

    public LookbookService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<LookbookDto>> GetAllAsync()
    {
        return await _context.Lookbooks
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .Select(l => new LookbookDto(
                l.Id, l.Title, l.Subtitle, l.ImageUrl, l.RoomType,
                l.Description, l.HotspotsJson, l.DisplayOrder
            ))
            .ToListAsync();
    }

    public async Task<LookbookDto> GetByIdAsync(Guid id)
    {
        var l = await _context.Lookbooks.FindAsync(id);
        if (l == null) throw new KeyNotFoundException("Không tìm thấy Lookbook.");

        return new LookbookDto(
            l.Id, l.Title, l.Subtitle, l.ImageUrl, l.RoomType,
            l.Description, l.HotspotsJson, l.DisplayOrder
        );
    }
}

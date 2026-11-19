namespace Backend.Domain.Entities;

public class Lookbook
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string RoomType { get; set; } = "Phòng ngủ Master";
    public string Description { get; set; } = string.Empty;
    
    // JSON Array containing points: [{ "id": 1, "productId": "...", "topPercent": 45, "leftPercent": 35, "title": "Bộ Chăn Ga Tencel", "price": 2850000, "slug": "bo-chan-ga-tencel" }]
    public string HotspotsJson { get; set; } = "[]";

    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

using System.Text.Json;
using Backend.Domain.Entities;
using Backend.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context, IWebHostEnvironment env)
    {
        // 1. Ensure created
        await context.Database.EnsureCreatedAsync();

        // 2. Seed Users
        if (!await context.Users.AnyAsync())
        {
            var admin = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Quản Trị Viên ShopHome",
                Email = "admin@shophome.vn",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                PhoneNumber = "0901234567",
                Address = "123 Đường Nội Thất, P. Thảo Điền, TP. Thủ Đức, TP.HCM",
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow
            };

            var customer = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Nguyễn Thu Hà",
                Email = "khachhang@shophome.vn",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Khach@123"),
                PhoneNumber = "0987654321",
                Address = "Căn hộ 15.02, Chung cư Sunrise City, Quận 7, TP.HCM",
                Role = UserRole.Customer,
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddRangeAsync(admin, customer);
            await context.SaveChangesAsync();
        }

        // 3. Seed Categories
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new()
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Name = "Chăn Ga Gối Cao Cấp",
                    Slug = "chan-ga-goi",
                    Description = "Bộ chăn ga Tencel 60s, Cotton satin và vải lanh mềm mại, thoáng khí êm ái.",
                    ImageUrl = "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=800&auto=format&fit=crop",
                    DisplayOrder = 1,
                    IsActive = true
                },
                new()
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Name = "Nệm Ngủ & Đệm Êm",
                    Slug = "nem-ngu",
                    Description = "Nệm cao su thiên nhiên 100%, nệm lò xo túi độc lập nâng đỡ 7 vùng cơ thể.",
                    ImageUrl = "https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=800&auto=format&fit=crop",
                    DisplayOrder = 2,
                    IsActive = true
                },
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    Name = "Gối & Ruột Chăn 4 Mùa",
                    Slug = "goi-ruot-chan",
                    Description = "Gối công thái học chống đau mỏi vai gáy, ruột chăn lông vũ nhân tạo nhẹ ấm.",
                    ImageUrl = "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop",
                    DisplayOrder = 3,
                    IsActive = true
                },
                new()
                {
                    Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                    Name = "Giường Ngủ & Tab Gỗ",
                    Slug = "giuong-ngu",
                    Description = "Giường ngủ gỗ sồi tự nhiên, phong cách Bắc Âu Scandinavian tối giản sang trọng.",
                    ImageUrl = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
                    DisplayOrder = 4,
                    IsActive = true
                },
                new()
                {
                    Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                    Name = "Đèn & Decor Phòng Ngủ",
                    Slug = "decor-phong-ngu",
                    Description = "Đèn ngủ ánh sáng ấm, thảm trải sàn, nến thơm tinh dầu tạo không gian thư giãn.",
                    ImageUrl = "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
                    DisplayOrder = 5,
                    IsActive = true
                }
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }

        // 4. Seed Products with Variants
        if (!await context.Products.AnyAsync())
        {
            var catBedding = await context.Categories.FirstAsync(c => c.Slug == "chan-ga-goi");
            var catMattress = await context.Categories.FirstAsync(c => c.Slug == "nem-ngu");
            var catPillow = await context.Categories.FirstAsync(c => c.Slug == "goi-ruot-chan");
            var catBed = await context.Categories.FirstAsync(c => c.Slug == "giuong-ngu");
            var catDecor = await context.Categories.FirstAsync(c => c.Slug == "decor-phong-ngu");

            var p1 = new Product
            {
                Id = Guid.NewGuid(),
                CategoryId = catBedding.Id,
                Name = "Bộ Chăn Ga Tencel 60s Eco Silk - Sand Beige",
                Slug = "bo-chan-ga-tencel-60s-eco-silk-sand-beige",
                ShortDescription = "Chất liệu sợi gỗ bạch đàn sinh học Tencel 60s siêu mịn màng, mát lạnh tức thì khi chạm vào.",
                Description = @"### Trải nghiệm giấc ngủ hoàng gia cùng Tencel 60s Eco Silk
Được dệt từ 100% sợi cellulose chiết xuất từ cây bạch đàn tự nhiên, **Bộ chăn ga Tencel 60s Eco Silk** mang lại cảm giác mềm như lụa, mát lạnh ngay khi chạm vào và thấm hút mồ hôi gấp 2 lần cotton thông thường.

#### Điểm nổi bật:
- **Công nghệ sợi Tencel 60s:** Mật độ dệt cao, không xù lông sau nhiều lần giặt.
- **Kháng khuẩn tự nhiên:** Ngăn ngừa vi khuẩn và nấm mốc phát triển, an toàn tuyệt đối cho làn da nhạy cảm.
- **Trọn bộ 4 món:** 1 Ga bo chun / ga phủ, 1 Vỏ chăn kéo khóa 200x220cm, 2 Vỏ gối nằm 50x70cm.
- **Bảo hành:** Đổi mới trong 30 ngày nếu phát hiện lỗi đường may hoặc phai màu.",
                Material = "100% Sợi Tencel 60s Sinh Học",
                Brand = "ShopHome Atelier",
                WarrantyMonths = 12,
                CareInstructions = "Giặt máy chế độ nhẹ hoặc giặt tay bằng nước lạnh. Tránh dùng thuốc tẩy clo. Phơi nơi thoáng mát tránh ánh nắng gắt.",
                BasePrice = 2450000,
                OriginalPrice = 3200000,
                PrimaryImageUrl = "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1000&auto=format&fit=crop",
                IsFeatured = true,
                IsNew = true,
                IsFlashSale = true,
                AverageRating = 4.9m,
                ReviewCount = 28,
                Variants = new List<ProductVariant>
                {
                    new() { Size = "1m6 x 2m", ColorName = "Be Cát (Sand)", ColorHex = "#D4A373", SKU = "SH-TC-1620-BE", Price = 2450000, OriginalPrice = 3200000, StockQuantity = 30 },
                    new() { Size = "1m8 x 2m", ColorName = "Be Cát (Sand)", ColorHex = "#D4A373", SKU = "SH-TC-1820-BE", Price = 2650000, OriginalPrice = 3450000, StockQuantity = 25 },
                    new() { Size = "2m x 2m2", ColorName = "Be Cát (Sand)", ColorHex = "#D4A373", SKU = "SH-TC-2022-BE", Price = 2850000, OriginalPrice = 3700000, StockQuantity = 15 },
                    new() { Size = "1m6 x 2m", ColorName = "Xanh Olive (Sage)", ColorHex = "#5F6F52", SKU = "SH-TC-1620-OL", Price = 2450000, OriginalPrice = 3200000, StockQuantity = 20 },
                    new() { Size = "1m8 x 2m", ColorName = "Xanh Olive (Sage)", ColorHex = "#5F6F52", SKU = "SH-TC-1820-OL", Price = 2650000, OriginalPrice = 3450000, StockQuantity = 18 },
                    new() { Size = "1m8 x 2m", ColorName = "Xám Tro (Slate)", ColorHex = "#7D7C7C", SKU = "SH-TC-1820-SL", Price = 2650000, OriginalPrice = 3450000, StockQuantity = 12 }
                },
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1000&auto=format&fit=crop", DisplayOrder = 1, AltText = "Bộ ga Tencel Be Cát" },
                    new() { ImageUrl = "https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1000&auto=format&fit=crop", DisplayOrder = 2, AltText = "Chi tiết đường may Tencel" },
                    new() { ImageUrl = "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1000&auto=format&fit=crop", DisplayOrder = 3, AltText = "Góc phối cảnh phòng ngủ" }
                }
            };

            var p2 = new Product
            {
                Id = Guid.NewGuid(),
                CategoryId = catBedding.Id,
                Name = "Bộ Ga Giường Cotton Satin Hoàng Gia - Royal Navy",
                Slug = "bo-ga-giuong-cotton-satin-hoang-gia-royal-navy",
                ShortDescription = "Chất liệu 100% Cotton chải kỹ dệt vân Satin óng ả sang trọng, bền màu vượt trội.",
                Description = @"### Nét quý phái phong cách hoàng gia
Sử dụng công nghệ dệt vân bóng Satin trên nền sợi cotton chải kỹ cao cấp (Combed Cotton), tạo nên bề mặt vải óng nhẹ, mềm mịn và sang trọng. Màu xanh Navy sâu thẳm tôn lên sự tĩnh lặng và đẳng cấp cho phòng ngủ gia đình bạn.",
                Material = "100% Cotton Satin Dệt Vân",
                Brand = "Royal Collection",
                WarrantyMonths = 12,
                CareInstructions = "Giặt máy với bột giặt dịu nhẹ, phơi mặt trái dưới bóng râm.",
                BasePrice = 1890000,
                OriginalPrice = 2400000,
                PrimaryImageUrl = "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1000&auto=format&fit=crop",
                IsFeatured = true,
                IsNew = true,
                IsFlashSale = false,
                AverageRating = 4.8m,
                ReviewCount = 19,
                Variants = new List<ProductVariant>
                {
                    new() { Size = "1m6 x 2m", ColorName = "Xanh Navy", ColorHex = "#1E2A38", SKU = "SH-CS-1620-NV", Price = 1890000, OriginalPrice = 2400000, StockQuantity = 20 },
                    new() { Size = "1m8 x 2m", ColorName = "Xanh Navy", ColorHex = "#1E2A38", SKU = "SH-CS-1820-NV", Price = 2090000, OriginalPrice = 2650000, StockQuantity = 30 },
                    new() { Size = "1m8 x 2m", ColorName = "Trắng Tinh Khôi", ColorHex = "#FAF9F6", SKU = "SH-CS-1820-WH", Price = 2090000, OriginalPrice = 2650000, StockQuantity = 22 }
                }
            };

            var p3 = new Product
            {
                Id = Guid.NewGuid(),
                CategoryId = catMattress.Id,
                Name = "Nệm Cao Su Thiên Nhiên 100% Thuần Khiết - PureRest 15cm",
                Slug = "nem-cao-su-thien-nhien-purerest-15cm",
                ShortDescription = "Đúc nguyên khối từ 100% mủ cao su tự nhiên, nâng đỡ 7 vùng cột sống, bảo hành 10 năm.",
                Description = @"### Giấc ngủ nâng đỡ tự nhiên hoàn hảo
Nệm cao su thiên nhiên PureRest 15cm sản xuất theo tiêu chuẩn quốc tế với hàng triệu lỗ thông hơi tổ ong đối xứng, giúp không khí đối lưu liên tục, mát mẻ cả 4 mùa. Đàn hồi nâng đỡ cột sống tối ưu, không rung lắc khi xoay chuyển mình.",
                Material = "100% Cao su thiên nhiên nguyên khối",
                Brand = "PureRest Natural",
                WarrantyMonths = 120, // 10 năm
                CareInstructions = "Tránh để nệm tiếp xúc trực tiếp với nhiệt độ cao và ánh nắng mặt trời. Sử dụng kèm drap bọc chống thấm.",
                BasePrice = 11500000,
                OriginalPrice = 14800000,
                PrimaryImageUrl = "https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1000&auto=format&fit=crop",
                IsFeatured = true,
                IsNew = false,
                IsFlashSale = true,
                AverageRating = 5.0m,
                ReviewCount = 42,
                Variants = new List<ProductVariant>
                {
                    new() { Size = "1m6 x 2m (15cm)", ColorName = "Màu Sữa Tự Nhiên", ColorHex = "#F7F5EC", SKU = "SH-NR-1620-15", Price = 11500000, OriginalPrice = 14800000, StockQuantity = 10 },
                    new() { Size = "1m8 x 2m (15cm)", ColorName = "Màu Sữa Tự Nhiên", ColorHex = "#F7F5EC", SKU = "SH-NR-1820-15", Price = 12900000, OriginalPrice = 16500000, StockQuantity = 15 },
                    new() { Size = "2m x 2m2 (15cm)", ColorName = "Màu Sữa Tự Nhiên", ColorHex = "#F7F5EC", SKU = "SH-NR-2022-15", Price = 14500000, OriginalPrice = 18500000, StockQuantity = 8 }
                }
            };

            var p4 = new Product
            {
                Id = Guid.NewGuid(),
                CategoryId = catMattress.Id,
                Name = "Nệm Lò Xo Túi Độc Lập Kháng Khuẩn - CloudComfort 25cm",
                Slug = "nem-lo-xo-tui-doc-lap-cloudcomfort-25cm",
                ShortDescription = "Hệ thống lò xo túi độc lập êm ái cách ly chuyển động hoàn toàn, lớp topper mút cao cấp êm như mây.",
                Description = @"### Êm ái tuyệt đối, không ảnh hưởng người nằm cạnh
Công nghệ lò xo túi độc lập chịu lực riêng biệt từng vùng cơ thể kết hợp lớp đệm Topper mút tỷ trọng cao cho bạn cảm giác bồng bềnh và thư giãn sâu sau một ngày dài làm việc.",
                Material = "Lò xo thép không gỉ + Topper Foam kháng khuẩn",
                Brand = "CloudComfort",
                WarrantyMonths = 60, // 5 năm
                CareInstructions = "Định kỳ 6 tháng xoay đầu nệm 180 độ để gia tăng tuổi thọ và độ đàn hồi đều đặn.",
                BasePrice = 7900000,
                OriginalPrice = 9800000,
                PrimaryImageUrl = "https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?q=80&w=1000&auto=format&fit=crop",
                IsFeatured = true,
                IsNew = true,
                IsFlashSale = true,
                AverageRating = 4.7m,
                ReviewCount = 15,
                Variants = new List<ProductVariant>
                {
                    new() { Size = "1m6 x 2m", ColorName = "Trắng Bạc Kem", ColorHex = "#EDE8DF", SKU = "SH-LX-1620", Price = 7900000, OriginalPrice = 9800000, StockQuantity = 12 },
                    new() { Size = "1m8 x 2m", ColorName = "Trắng Bạc Kem", ColorHex = "#EDE8DF", SKU = "SH-LX-1820", Price = 8900000, OriginalPrice = 11200000, StockQuantity = 14 }
                }
            };

            var p5 = new Product
            {
                Id = Guid.NewGuid(),
                CategoryId = catPillow.Id,
                Name = "Gối Foam Công Thái Học Nâng Đỡ Đốt Sống Cổ - ErgoRest",
                Slug = "goi-foam-cong-thai-hoc-ergorest",
                ShortDescription = "Thiết kế lượn sóng định hình ôm sát đường cong đốt sống cổ, giải tỏa áp lực cơ vai gáy.",
                Description = @"### Giải pháp đẩy lùi đau mỏi cổ vai gáy
Ruột gối Memory Foam cao cấp chậm đàn hồi giúp phân tán lực ép đều đặn lên phần đầu và gáy, giữ trục cột sống luôn thẳng tự nhiên dù nằm ngửa hay nằm nghiêng.",
                Material = "Memory Foam tỷ trọng cao + Vỏ sợi lạnh Bamboo",
                Brand = "ErgoRest Health",
                WarrantyMonths = 24,
                CareInstructions = "Tháo vỏ gối giặt định kỳ, ruột gối chỉ cần hút bụi và để nơi khô thoáng, không giặt nước.",
                BasePrice = 650000,
                OriginalPrice = 950000,
                PrimaryImageUrl = "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1000&auto=format&fit=crop",
                IsFeatured = true,
                IsNew = false,
                IsFlashSale = false,
                AverageRating = 4.9m,
                ReviewCount = 35,
                Variants = new List<ProductVariant>
                {
                    new() { Size = "Tiêu chuẩn (50x30x10cm)", ColorName = "Xám Trắng", ColorHex = "#D8D8D8", SKU = "SH-ER-STD", Price = 650000, OriginalPrice = 950000, StockQuantity = 60 }
                }
            };

            var p6 = new Product
            {
                Id = Guid.NewGuid(),
                CategoryId = catPillow.Id,
                Name = "Ruột Chăn Lông Vũ Nhân Tạo 4 Mùa - Microfiber Soft",
                Slug = "ruot-chan-long-vu-nhan-tao-microfiber-soft",
                ShortDescription = "Bông hạt siêu mịn mô phỏng lông vũ tự nhiên, giữ ấm tốt nhưng siêu nhẹ, không gây dị ứng.",
                Description = @"### Nhẹ như mây, ấm áp suốt 4 mùa
Chất liệu bông vi sợi Microfiber cao cấp siêu nhẹ, mềm mại bồng bềnh, giữ nhiệt cân bằng tự nhiên và thoáng khí, không bị xẹp vón cục khi giặt máy.",
                Material = "Sợi Microfiber siêu mảnh kháng khuẩn",
                Brand = "ShopHome Bedding",
                WarrantyMonths = 12,
                CareInstructions = "Giặt máy lồng ngang với chế độ giặt đồ len/chăn ga, sấy ở nhiệt độ thấp.",
                BasePrice = 1250000,
                OriginalPrice = 1600000,
                PrimaryImageUrl = "https://images.unsplash.com/photo-1582582621959-48d27397dc69?q=80&w=1000&auto=format&fit=crop",
                IsFeatured = false,
                IsNew = true,
                IsFlashSale = false,
                AverageRating = 4.8m,
                ReviewCount = 12,
                Variants = new List<ProductVariant>
                {
                    new() { Size = "2m x 2m2 (1.8kg)", ColorName = "Trắng Tinh Khiết", ColorHex = "#FFFFFF", SKU = "SH-RC-2022", Price = 1250000, OriginalPrice = 1600000, StockQuantity = 40 }
                }
            };

            var p7 = new Product
            {
                Id = Guid.NewGuid(),
                CategoryId = catBed.Id,
                Name = "Giường Ngủ Gỗ Sồi Bắc Âu Tối Giản - Nordic Oak Bed",
                Slug = "giuong-ngu-go-soi-nordic-oak-bed",
                ShortDescription = "Gỗ sồi Nga tự nhiên đã qua xử lý sấy khô tẩm sấy chống cong vênh mối mọt, nan giường thép chịu tải 500kg.",
                Description = @"### Vẻ đẹp mộc mạc tinh tế chuẩn phong cách Scandinavia
Chiếc giường ngủ được chế tác từ gỗ sồi tự nhiên với những đường vân sống động, vát cạnh tròn an toàn cho gia đình có trẻ nhỏ. Kết cấu mộng âm dương truyền thống vững chãi, không phát ra tiếng cọt kẹt khi sử dụng.",
                Material = "100% Gỗ Sồi Tự Nhiên Nhập Khẩu",
                Brand = "Nordic Wood",
                WarrantyMonths = 36, // 3 năm
                CareInstructions = "Vệ sinh bằng khăn mềm ẩm, tránh để nước ngập sàn kéo dài.",
                BasePrice = 9800000,
                OriginalPrice = 12500000,
                PrimaryImageUrl = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1000&auto=format&fit=crop",
                IsFeatured = true,
                IsNew = false,
                IsFlashSale = false,
                AverageRating = 5.0m,
                ReviewCount = 16,
                Variants = new List<ProductVariant>
                {
                    new() { Size = "1m6 x 2m", ColorName = "Gỗ Tự Nhiên (Oak)", ColorHex = "#C19A6B", SKU = "SH-GD-1620", Price = 9800000, OriginalPrice = 12500000, StockQuantity = 8 },
                    new() { Size = "1m8 x 2m", ColorName = "Gỗ Tự Nhiên (Oak)", ColorHex = "#C19A6B", SKU = "SH-GD-1820", Price = 11200000, OriginalPrice = 13900000, StockQuantity = 10 },
                    new() { Size = "1m8 x 2m", ColorName = "Màu Óc Chó (Walnut)", ColorHex = "#4A3525", SKU = "SH-GD-1820-WN", Price = 11800000, OriginalPrice = 14500000, StockQuantity = 6 }
                }
            };

            var p8 = new Product
            {
                Id = Guid.NewGuid(),
                CategoryId = catDecor.Id,
                Name = "Đèn Ngủ Thân Gốm Tỏa Sáng Dịu Mắt - Ceramic Glow",
                Slug = "den-ngu-than-gom-ceramic-glow",
                ShortDescription = "Chao vải lanh khuếch tán ánh sáng vàng ấm 3000K, thân gốm thủ công mộc mạc.",
                Description = @"### Ánh sáng dịu êm vỗ về giấc ngủ
Đèn ngủ Ceramic Glow mang lại nguồn sáng ấm áp dịu nhẹ không gây chói mắt khi đọc sách trước khi ngủ. Thân đèn gốm men mờ thủ công kết hợp hài hòa với mọi phong cách nội thất từ Wabi Sabi đến Modern.",
                Material = "Gốm nung thủ công + Chao vải lanh",
                Brand = "Atelier Decor",
                WarrantyMonths = 12,
                CareInstructions = "Vệ sinh chao đèn bằng cọ lông mềm hoặc máy hút bụi mini.",
                BasePrice = 580000,
                OriginalPrice = 790000,
                PrimaryImageUrl = "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop",
                IsFeatured = false,
                IsNew = true,
                IsFlashSale = false,
                AverageRating = 4.8m,
                ReviewCount = 21,
                Variants = new List<ProductVariant>
                {
                    new() { Size = "Cao 45cm (Đường kính 28cm)", ColorName = "Trắng Gốm Mộc", ColorHex = "#EFEBD9", SKU = "SH-DN-CG", Price = 580000, OriginalPrice = 790000, StockQuantity = 35 }
                }
            };

            await context.Products.AddRangeAsync(p1, p2, p3, p4, p5, p6, p7, p8);
            await context.SaveChangesAsync();
        }

        // 5. Seed Lookbooks (Shop the Look from ega-bed)
        if (!await context.Lookbooks.AnyAsync())
        {
            var p1 = await context.Products.FirstOrDefaultAsync(p => p.Slug == "bo-chan-ga-tencel-60s-eco-silk-sand-beige");
            var p3 = await context.Products.FirstOrDefaultAsync(p => p.Slug == "nem-cao-su-thien-nhien-purerest-15cm");
            var p5 = await context.Products.FirstOrDefaultAsync(p => p.Slug == "goi-foam-cong-thai-hoc-ergorest");
            var p8 = await context.Products.FirstOrDefaultAsync(p => p.Slug == "den-ngu-than-gom-ceramic-glow");

            var hotspots = new List<object>
            {
                new { id = 1, productId = p1?.Id, topPercent = 62, leftPercent = 48, title = p1?.Name ?? "Bộ Chăn Ga Tencel Be Cát", price = 2450000, slug = p1?.Slug ?? "" },
                new { id = 2, productId = p5?.Id, topPercent = 42, leftPercent = 38, title = p5?.Name ?? "Gối Công Thái Học", price = 650000, slug = p5?.Slug ?? "" },
                new { id = 3, productId = p8?.Id, topPercent = 35, leftPercent = 82, title = p8?.Name ?? "Đèn Ngủ Gốm Ấm", price = 580000, slug = p8?.Slug ?? "" }
            };

            var lookbook1 = new Lookbook
            {
                Id = Guid.NewGuid(),
                Title = "Phòng Ngủ Master Scandinavian Ấm Áp",
                Subtitle = "Sự kết hợp hoàn mỹ giữa chất lụa Tencel và ánh đèn gốm dịu mắt",
                ImageUrl = "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200&auto=format&fit=crop",
                RoomType = "Phòng ngủ Master",
                Description = "Không gian được thiết kế theo phong cách tối giản Bắc Âu, tập trung vào trải nghiệm xúc giác êm ái của chăn ga Tencel và ánh sáng tự nhiên.",
                HotspotsJson = JsonSerializer.Serialize(hotspots),
                DisplayOrder = 1,
                IsActive = true
            };

            await context.Lookbooks.AddAsync(lookbook1);
            await context.SaveChangesAsync();
        }

        // 6. Seed Coupons
        if (!await context.Coupons.AnyAsync())
        {
            var coupons = new List<Coupon>
            {
                new()
                {
                    Code = "HOMEWELCOME",
                    Description = "Giảm ngay 10% tối đa 300.000đ cho đơn hàng đầu tiên",
                    DiscountType = DiscountType.Percentage,
                    Value = 10,
                    MinOrderValue = 500000,
                    MaxDiscountAmount = 300000,
                    UsageLimit = 200,
                    IsActive = true
                },
                new()
                {
                    Code = "FREESHIP",
                    Description = "Miễn phí vận chuyển & giao lắp tận phòng (trừ 100.000đ)",
                    DiscountType = DiscountType.FixedAmount,
                    Value = 100000,
                    MinOrderValue = 1000000,
                    UsageLimit = 500,
                    IsActive = true
                },
                new()
                {
                    Code = "COMBO500",
                    Description = "Giảm trực tiếp 500.000đ cho đơn phòng ngủ từ 5.000.000đ",
                    DiscountType = DiscountType.FixedAmount,
                    Value = 500000,
                    MinOrderValue = 5000000,
                    UsageLimit = 100,
                    IsActive = true
                }
            };

            await context.Coupons.AddRangeAsync(coupons);
            await context.SaveChangesAsync();
        }
    }
}

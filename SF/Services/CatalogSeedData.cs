using SF.Models;

namespace SF.Services;

public static class CatalogSeedData
{
    public sealed record CatalogSeedProduct(
        string Name,
        int CategoryId,
        decimal PriceVnd,
        decimal? PriceCrypto,
        decimal? OldPrice,
        bool Sale,
        string CategoryLabel,
        string ImageKey,
        string Icon,
        string[] Specs,
        string Rating,
        string RatingCount,
        int WarrantyMonths,
        int DisplayOrder,
        int Stock = 10);

    public static IReadOnlyList<CatalogSeedProduct> FrontendProducts { get; } = new[]
    {
        new CatalogSeedProduct("NVIDIA GeForce RTX 4090 24GB GDDR6X Founders Edition", 2, 47500000m, 12.2m, 52000000m, true, "GPU", "product-p1", "🖼️", new[] { "24GB VRAM", "Ada Lovelace", "450W" }, "★★★★★", "(284)", 36, 1),
        new CatalogSeedProduct("AMD Ryzen 9 7950X3D 16-Core 3D V-Cache Socket AM5", 1, 19800000m, 5.1m, null, false, "CPU", "product-p2", "⚡", new[] { "16C/32T", "128MB Cache", "AM5" }, "★★★★★", "(192)", 24, 2),
        new CatalogSeedProduct("ASUS ROG Maximus Z790 Apex Encore DDR5 Wi-Fi 7", 3, 14400000m, 3.7m, 18000000m, true, "Mainboard", "product-p3", "🔩", new[] { "DDR5", "PCIe 5.0", "Wi-Fi 7" }, "★★★★☆", "(87)", 24, 3),
        new CatalogSeedProduct("G.Skill Trident Z5 RGB DDR5-7200 CL34 64GB (2x32GB)", 4, 8900000m, 2.3m, null, false, "RAM", "product-p4", "💾", new[] { "64GB Kit", "DDR5-7200", "RGB" }, "★★★★★", "(156)", 24, 4),
        new CatalogSeedProduct("Samsung 990 Pro 2TB M.2 PCIe 5.0 NVMe 14.7GB/s", 5, 4200000m, 1.08m, 5500000m, true, "SSD", "product-p5", "🌀", new[] { "2TB", "PCIe 5.0", "14.7GB/s" }, "★★★★★", "(341)", 24, 5),
        new CatalogSeedProduct("LG UltraGear 32GS95UE 32 inch 4K OLED 240Hz", 9, 28900000m, 7.4m, 31900000m, true, "Màn hình", "product-p6", "🖥️", new[] { "4K OLED", "240Hz", "0.03ms" }, "★★★★★", "(64)", 24, 6),
        new CatalogSeedProduct("NZXT H9 Flow Mid Tower White", 7, 4690000m, 1.2m, null, false, "Case & PSU", "product-p7", "🏗️", new[] { "Mid Tower", "ATX", "Dual Chamber" }, "★★★★☆", "(92)", 24, 7),
        new CatalogSeedProduct("Corsair RM1000x Shift 1000W 80 Plus Gold", 6, 3990000m, 1.02m, 4590000m, true, "Case & PSU", "product-p8", "🔌", new[] { "1000W", "ATX 3.0", "80+ Gold" }, "★★★★★", "(118)", 24, 8),
        new CatalogSeedProduct("be quiet! Pure Loop 2 240mm AIO", 8, 1650000m, 1.42m, 2100000m, true, "Tản nhiệt", "product-p9", "❄️", new[] { "240mm", "AIO", "ARGB" }, "★★★★☆", "(53)", 24, 9),
        new CatalogSeedProduct("Logitech G Pro X Superlight 2 Lightspeed", 10, 3290000m, 1.84m, 3790000m, true, "Ngoại vi", "product-p10", "🖱️", new[] { "Wireless", "60g", "32K DPI" }, "★★★★★", "(205)", 24, 10),
        new CatalogSeedProduct("SilverFlag Titan RTX Gaming PC Ryzen 7 + RTX 4070 Super", 10, 36900000m, 9.4m, 39900000m, true, "PC Gaming", "product-p11", "🎮", new[] { "Ryzen 7", "RTX 4070 Super", "32GB DDR5" }, "★★★★★", "(41)", 24, 11),
        new CatalogSeedProduct("Corsair Vengeance DDR5 32GB", 4, 2190000m, 1.56m, 2900000m, true, "RAM", "product-p4", "💾", new[] { "32GB Kit", "DDR5", "Heatspreader" }, "★★★★★", "(128)", 24, 12),
    };

    public static CatalogSeedProduct? FindSeed(string? productName) =>
        FrontendProducts.FirstOrDefault(seed => string.Equals(seed.Name, productName, StringComparison.OrdinalIgnoreCase));

    public static string BuildCategorySlug(int categoryId) =>
        categoryId switch
        {
            1 => "cpu",
            2 => "vga",
            3 => "main",
            4 => "ram",
            5 => "ssd",
            6 => "psu",
            7 => "case",
            8 => "cool",
            9 => "mon",
            10 => "gg",
            _ => $"category{categoryId}"
        };

    public static string GetCategoryLabel(Product product) =>
        product.CategoryId switch
        {
            1 => "CPU",
            2 => "GPU",
            3 => "Mainboard",
            4 => "RAM",
            5 => "SSD",
            6 => "Case & PSU",
            7 => "Case & PSU",
            8 => "Tản nhiệt",
            9 => "Màn hình",
            10 => "Ngoại vi",
            _ => product.Category?.Name ?? "Khác"
        };

    public static string GetFallbackIcon(Product product) =>
        product.CategoryId switch
        {
            1 => "⚡",
            2 => "🖼️",
            3 => "🔩",
            4 => "💾",
            5 => "🌀",
            6 => "🔌",
            7 => "🏗️",
            8 => "❄️",
            9 => "🖥️",
            10 => "🖱️",
            _ => "🛒"
        };

    public static string[] GetFallbackSpecs(Product product) =>
        product.CategoryId switch
        {
            1 => new[] { "Hiệu năng cao", "Socket mới", "Build gaming" },
            2 => new[] { "Đồ họa mạnh", "Render nhanh", "Gaming 4K" },
            3 => new[] { "DDR5", "PCIe Gen mới", "Ép xung ổn định" },
            4 => new[] { "Băng thông cao", "DDR5", "Đa nhiệm tốt" },
            5 => new[] { "NVMe", "Tốc độ cao", "Lưu trữ nhanh" },
            6 => new[] { "Nguồn ổn định", "Chuẩn mới", "Build cao cấp" },
            7 => new[] { "Khung máy đẹp", "Thông gió tốt", "Cable gọn" },
            8 => new[] { "Giữ nhiệt thấp", "Tản mạnh", "Hoạt động êm" },
            9 => new[] { "Tần số cao", "Màu tốt", "Giải trí mượt" },
            10 => new[] { "Phụ kiện gaming", "Độ bền cao", "Thiết kế tối ưu" },
            _ => new[] { "Hàng chính hãng", "Bảo hành rõ ràng", "Sẵn tại SilverFlag" }
        };
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SF.Models;
using SF.Services;

namespace SF.Controllers;

[ApiController]
[Route("api/catalog")]
public class CatalogApiController : ControllerBase
{
    private readonly SilverFlagPcContext _db;

    public CatalogApiController(SilverFlagPcContext db)
    {
        _db = db;
    }

    [HttpGet("products")]
    public async Task<IActionResult> Products(CancellationToken cancellationToken)
    {
        var products = await _db.Products
            .Include(product => product.Category)
            .ToListAsync(cancellationToken);

        var payload = products
            .Select(product =>
            {
                var seed = CatalogSeedData.FindSeed(product.Name);
                var oldPrice = seed?.OldPrice ?? 0m;
                var nft = product.NftWarrantyEnabled;
                var sale = seed?.Sale ?? oldPrice > product.PriceVnd;
                var category = seed?.CategoryLabel ?? CatalogSeedData.GetCategoryLabel(product);
                var icon = seed?.Icon ?? CatalogSeedData.GetFallbackIcon(product);
                var specs = seed?.Specs ?? CatalogSeedData.GetFallbackSpecs(product);
                var rating = seed?.Rating ?? "★★★★☆";
                var ratingCount = seed?.RatingCount ?? $"({Math.Max(product.Stock, 1) * 7})";
                var warranty = product.WarrantyMonths is > 0 ? $"{product.WarrantyMonths}T" : string.Empty;
                var image = !string.IsNullOrWhiteSpace(product.ImageUrl)
                    ? product.ImageUrl
                    : $"/image/{CatalogSeedData.BuildCategorySlug(product.CategoryId)}{product.ProductId}.png";

                return new
                {
                    Id = product.ProductId.ToString(),
                    ProductId = product.ProductId,
                    Name = product.Name,
                    Category = category,
                    CategoryId = product.CategoryId,
                    Price = product.PriceVnd,
                    OldPrice = oldPrice,
                    CryptoPrice = product.PriceCrypto,
                    Crypto = product.PriceCrypto is > 0 ? $"≈ {product.PriceCrypto:0.####} TEST" : string.Empty,
                    Nft = nft,
                    Sale = sale,
                    Image = image,
                    Icon = icon,
                    Specs = specs,
                    Rating = rating,
                    RatingCount = ratingCount,
                    Warranty = warranty,
                    WarrantyMonths = product.WarrantyMonths,
                    NftWarrantyEnabled = product.NftWarrantyEnabled,
                    FeaturedIndex = seed?.DisplayOrder ?? 1000 + product.ProductId,
                    Stock = product.Stock
                };
            })
            .OrderBy(product => product.FeaturedIndex)
            .ThenBy(product => product.ProductId)
            .ToList();

        return Ok(payload);
    }

    [HttpGet("product-images")]
    public async Task<IActionResult> ProductImages(CancellationToken cancellationToken)
    {
        var products = await _db.Products
            .Include(product => product.Category)
            .Select(product => new
            {
                product.ProductId,
                product.Name,
                product.PriceVnd,
                product.ImageUrl,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name
            })
            .ToListAsync(cancellationToken);

        return Ok(products);
    }
}

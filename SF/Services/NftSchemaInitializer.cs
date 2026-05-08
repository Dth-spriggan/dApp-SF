using Microsoft.EntityFrameworkCore;
using SF.Models;

namespace SF.Services;

public class NftSchemaInitializer
{
    private readonly SilverFlagPcContext _db;

    public NftSchemaInitializer(SilverFlagPcContext db)
    {
        _db = db;
    }

    public async Task EnsureSchemaAsync(CancellationToken cancellationToken = default)
    {
        var sql = """
        IF COL_LENGTH('NFT_Warranty', 'MetadataUri') IS NULL
            ALTER TABLE NFT_Warranty ADD MetadataUri NVARCHAR(500) NULL;
        IF COL_LENGTH('NFT_Warranty', 'ImageUri') IS NULL
            ALTER TABLE NFT_Warranty ADD ImageUri NVARCHAR(500) NULL;
        IF COL_LENGTH('NFT_Warranty', 'MintStatus') IS NULL
            ALTER TABLE NFT_Warranty ADD MintStatus NVARCHAR(50) NULL;
        IF COL_LENGTH('NFT_Warranty', 'MintTxHash') IS NULL
            ALTER TABLE NFT_Warranty ADD MintTxHash VARCHAR(100) NULL;
        IF COL_LENGTH('NFT_Warranty', 'ChainTokenId') IS NULL
            ALTER TABLE NFT_Warranty ADD ChainTokenId VARCHAR(100) NULL;
        IF COL_LENGTH('NFT_Warranty', 'MetadataJson') IS NULL
            ALTER TABLE NFT_Warranty ADD MetadataJson NVARCHAR(MAX) NULL;
        IF COL_LENGTH('Product', 'ImageUrl') IS NULL
            ALTER TABLE Product ADD ImageUrl NVARCHAR(500) NULL;
        IF COL_LENGTH('Product', 'NftWarrantyEnabled') IS NULL
            ALTER TABLE Product ADD NftWarrantyEnabled BIT NOT NULL CONSTRAINT DF_Product_NftWarrantyEnabled DEFAULT(0);
        IF COL_LENGTH('Product', 'WarrantyMonths') IS NULL
            ALTER TABLE Product ADD WarrantyMonths INT NULL;
        IF COL_LENGTH('[User]', 'DefaultAddress') IS NULL
            ALTER TABLE [User] ADD DefaultAddress NVARCHAR(255) NULL;
        IF COL_LENGTH('[User]', 'DefaultRecipientName') IS NULL
            ALTER TABLE [User] ADD DefaultRecipientName NVARCHAR(100) NULL;
        IF COL_LENGTH('[User]', 'DefaultContactEmail') IS NULL
            ALTER TABLE [User] ADD DefaultContactEmail VARCHAR(255) NULL;
        IF COL_LENGTH('Orders', 'RecipientName') IS NULL
            ALTER TABLE Orders ADD RecipientName NVARCHAR(100) NULL;
        IF COL_LENGTH('Orders', 'RecipientPhone') IS NULL
            ALTER TABLE Orders ADD RecipientPhone VARCHAR(20) NULL;
        IF COL_LENGTH('Orders', 'ShippingAddress') IS NULL
            ALTER TABLE Orders ADD ShippingAddress NVARCHAR(255) NULL;
        IF COL_LENGTH('Orders', 'ContactEmail') IS NULL
            ALTER TABLE Orders ADD ContactEmail VARCHAR(255) NULL;
        """;

        await _db.Database.ExecuteSqlRawAsync(sql, cancellationToken);

        foreach (var seed in CatalogSeedData.FrontendProducts)
        {
            var product = await _db.Products.FirstOrDefaultAsync(
                item => item.Name == seed.Name,
                cancellationToken);

            if (product is null)
            {
                product = new Product
                {
                    Name = seed.Name
                };
                _db.Products.Add(product);
            }

            product.CategoryId = seed.CategoryId;
            product.PriceVnd = seed.PriceVnd;
            product.PriceCrypto = seed.PriceCrypto;
            product.NftWarrantyEnabled = true;
            product.WarrantyMonths = seed.WarrantyMonths;
            product.Stock = product.Stock > 0 ? product.Stock : seed.Stock;
        }

        await _db.SaveChangesAsync(cancellationToken);

        var products = await _db.Products
            .Include(product => product.Category)
            .ToListAsync(cancellationToken);

        var changed = false;
        foreach (var product in products)
        {
            var seed = CatalogSeedData.FindSeed(product.Name);

            if (seed is not null)
            {
                if (product.PriceCrypto != seed.PriceCrypto)
                {
                    product.PriceCrypto = seed.PriceCrypto;
                    changed = true;
                }

                if (product.WarrantyMonths != seed.WarrantyMonths)
                {
                    product.WarrantyMonths = seed.WarrantyMonths;
                    changed = true;
                }
            }

            if (!product.NftWarrantyEnabled)
            {
                product.NftWarrantyEnabled = true;
                changed = true;
            }

            if (product.WarrantyMonths is null or <= 0)
            {
                product.WarrantyMonths = seed?.WarrantyMonths ?? 24;
                changed = true;
            }

            if (!string.IsNullOrWhiteSpace(product.ImageUrl))
            {
                if (product.ImageUrl.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase))
                {
                    product.ImageUrl = product.ImageUrl[..^4] + ".png";
                    changed = true;
                }
                continue;
            }

            var categorySlug = CatalogSeedData.BuildCategorySlug(product.CategoryId);
            product.ImageUrl = $"/image/{categorySlug}{product.ProductId}.png";
            changed = true;
        }

        if (changed)
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}

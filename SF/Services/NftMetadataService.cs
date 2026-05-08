using System.Text;
using System.Text.Json;
using SF.Models;

namespace SF.Services;

public class NftMetadataService
{
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;
    private readonly IpfsPinningService _ipfsPinningService;

    public NftMetadataService(IWebHostEnvironment environment, IConfiguration configuration, IpfsPinningService ipfsPinningService)
    {
        _environment = environment;
        _configuration = configuration;
        _ipfsPinningService = ipfsPinningService;
    }

    public async Task<NftAssetBundle> GenerateAsync(NftWarranty warranty, Product product, Order order, CancellationToken cancellationToken = default)
    {
        var nftRoot = Path.Combine(_environment.WebRootPath, "nft");
        var imageRoot = Path.Combine(nftRoot, "images");
        var metadataRoot = Path.Combine(nftRoot, "metadata");

        Directory.CreateDirectory(imageRoot);
        Directory.CreateDirectory(metadataRoot);

        var imageFileName = $"warranty-{warranty.TokenId}.svg";
        var metadataFileName = $"warranty-{warranty.TokenId}.json";

        var imagePath = Path.Combine(imageRoot, imageFileName);
        var metadataPath = Path.Combine(metadataRoot, metadataFileName);

        var imageSvg = BuildWarrantySvg(warranty, product, order);
        await File.WriteAllTextAsync(imagePath, imageSvg, Encoding.UTF8, cancellationToken);

        var imageUri = $"/nft/images/{imageFileName}";
        if (_ipfsPinningService.IsConfigured)
        {
            var ipfsImageUri = await _ipfsPinningService.UploadFileAsync(imagePath, imageFileName, cancellationToken);
            if (!string.IsNullOrWhiteSpace(ipfsImageUri))
            {
                imageUri = ipfsImageUri;
            }
        }

        var metadata = new
        {
            name = $"SilverFlag Warranty NFT #{warranty.TokenId}",
            description = $"NFT bảo hành backend-generated cho đơn hàng #{order.OrderId} và sản phẩm {product.Name}.",
            image = imageUri,
            external_url = _configuration["Nft:ExternalUrl"] ?? string.Empty,
            attributes = new object[]
            {
                new { trait_type = "Order ID", value = $"#SF{order.OrderId:D6}" },
                new { trait_type = "Product", value = product.Name },
                new { trait_type = "Product Price", value = $"{product.PriceVnd:N0} VND" },
                new { trait_type = "Purchase Date", value = (order.CreatedAt ?? DateTime.Now).ToString("yyyy-MM-dd") },
                new { trait_type = "Expiry Date", value = warranty.ExpiryDate.ToString("yyyy-MM-dd") },
                new { trait_type = "Warranty Until", value = warranty.ExpiryDate.ToString("yyyy-MM-dd") },
                new { trait_type = "Status", value = "MetadataReady" }
            }
        };

        var metadataJson = JsonSerializer.Serialize(metadata, new JsonSerializerOptions
        {
            WriteIndented = true
        });
        await File.WriteAllTextAsync(metadataPath, metadataJson, Encoding.UTF8, cancellationToken);

        var metadataUri = $"/nft/metadata/{metadataFileName}";
        if (_ipfsPinningService.IsConfigured)
        {
            var ipfsMetadataUri = await _ipfsPinningService.UploadFileAsync(metadataPath, metadataFileName, cancellationToken);
            if (!string.IsNullOrWhiteSpace(ipfsMetadataUri))
            {
                metadataUri = ipfsMetadataUri;
            }
        }

        warranty.ImageUri = imageUri;
        warranty.MetadataUri = metadataUri;
        warranty.MetadataJson = metadataJson;
        warranty.MintStatus = "metadata_ready";
        warranty.ChainTokenId ??= warranty.TokenId.ToString();

        return new NftAssetBundle
        {
            ImagePath = imagePath,
            MetadataPath = metadataPath,
            ImageUri = imageUri,
            MetadataUri = metadataUri,
            MetadataJson = metadataJson
        };
    }

    private static string BuildWarrantySvg(NftWarranty warranty, Product product, Order order)
    {
        var safeProductName = EscapeXml(product.Name);
        var safeOrderId = EscapeXml($"#SF{order.OrderId:D6}");
        var safeToken = EscapeXml($"#{warranty.TokenId}");
        var safeExpiry = EscapeXml(warranty.ExpiryDate.ToString("dd/MM/yyyy"));

        return $$"""
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#0f172a"/>
              <stop offset="100%" stop-color="#1d4ed8"/>
            </linearGradient>
            <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#e2e8f0"/>
            </linearGradient>
          </defs>
          <rect width="1200" height="1200" fill="url(#bg)"/>
          <circle cx="970" cy="180" r="140" fill="#22c55e" opacity="0.18"/>
          <circle cx="220" cy="1010" r="200" fill="#a78bfa" opacity="0.16"/>
          <rect x="110" y="140" width="980" height="920" rx="42" fill="url(#card)"/>
          <rect x="160" y="190" width="880" height="820" rx="30" fill="#0f172a"/>
          <text x="220" y="300" fill="#f8fafc" font-size="48" font-family="Arial, sans-serif" font-weight="700">SilverFlag Warranty NFT</text>
          <text x="220" y="380" fill="#93c5fd" font-size="34" font-family="Arial, sans-serif">{{safeProductName}}</text>
          <text x="220" y="470" fill="#cbd5e1" font-size="28" font-family="Arial, sans-serif">Order: {{safeOrderId}}</text>
          <text x="220" y="530" fill="#cbd5e1" font-size="28" font-family="Arial, sans-serif">Token: {{safeToken}}</text>
          <text x="220" y="590" fill="#cbd5e1" font-size="28" font-family="Arial, sans-serif">Warranty Until: {{safeExpiry}}</text>
          <rect x="220" y="680" width="520" height="140" rx="22" fill="#1d4ed8"/>
          <text x="260" y="760" fill="#ffffff" font-size="42" font-family="Arial, sans-serif" font-weight="700">BACKEND GENERATED</text>
          <text x="220" y="910" fill="#94a3b8" font-size="24" font-family="Arial, sans-serif">Metadata minted off-chain first. Ready for IPFS / on-chain mint later.</text>
        </svg>
        """;
    }

    private static string EscapeXml(string value) =>
        value.Replace("&", "&amp;")
            .Replace("<", "&lt;")
            .Replace(">", "&gt;")
            .Replace("\"", "&quot;")
            .Replace("'", "&apos;");
}

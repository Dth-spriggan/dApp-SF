using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SF.Helpers;
using SF.Models;
using SF.Services;

namespace SF.Controllers;

[ApiController]
[Route("api/checkout")]
public class CheckoutApiController : ControllerBase
{
    private const string SessionUserIdKey = "sf.userId";
    private const string PendingCryptoKey = "sf.pendingCrypto";
    private readonly IConfiguration _configuration;
    private readonly SilverFlagPcContext _db;
    private readonly IWebHostEnvironment _environment;
    private readonly NftMetadataService _nftMetadataService;
    private readonly NftMintingService _nftMintingService;

    public CheckoutApiController(
        IConfiguration configuration,
        SilverFlagPcContext db,
        IWebHostEnvironment environment,
        NftMetadataService nftMetadataService,
        NftMintingService nftMintingService)
    {
        _configuration = configuration;
        _db = db;
        _environment = environment;
        _nftMetadataService = nftMetadataService;
        _nftMintingService = nftMintingService;
    }

    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var user = await GetSessionUserAsync(cancellationToken);
        if (user is null)
        {
            return Unauthorized();
        }

        try
        {
            var order = await PersistOrderAsync(user, request, cancellationToken);
            return Ok(new { orderId = order.OrderId });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("prepare-crypto")]
    public IActionResult PrepareCrypto([FromBody] PrepareCryptoCheckoutRequest request)
    {
        if (HttpContext.Session.GetInt32(SessionUserIdKey) is null)
        {
            return Unauthorized();
        }

        HttpContext.Session.SetJson(PendingCryptoKey, request);
        return NoContent();
    }

    [HttpPost("complete-crypto")]
    public async Task<IActionResult> CompleteCrypto([FromBody] CompleteCryptoCheckoutRequest request, CancellationToken cancellationToken)
    {
        var user = await GetSessionUserAsync(cancellationToken);
        if (user is null)
        {
            return Unauthorized();
        }

        var pending = HttpContext.Session.GetJson<PrepareCryptoCheckoutRequest>(PendingCryptoKey);
        if (pending is null || pending.Items.Count == 0)
        {
            return BadRequest(new { message = "Không tìm thấy phiên thanh toán crypto đang chờ." });
        }

        var createOrderRequest = new CreateOrderRequest
        {
            Items = pending.Items,
            PaymentMethod = $"Crypto ({pending.TokenSymbol})",
            TokenSymbol = pending.TokenSymbol,
            Wallet = request.Wallet ?? pending.Wallet,
            TxHash = request.TxHash,
            Status = "Paid",
            CryptoAmount = pending.CryptoAmount,
            RecipientName = pending.RecipientName,
            RecipientPhone = pending.RecipientPhone,
            ShippingAddress = pending.ShippingAddress,
            ContactEmail = pending.ContactEmail
        };

        try
        {
            var order = await PersistOrderAsync(user, createOrderRequest, cancellationToken);
            HttpContext.Session.Remove(PendingCryptoKey);

            return Ok(new { orderId = order.OrderId });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("upload-bank-proof")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> UploadBankProof(IFormFile file, CancellationToken cancellationToken)
    {
        if (HttpContext.Session.GetInt32(SessionUserIdKey) is null)
        {
            return Unauthorized();
        }

        if (file is null || file.Length == 0)
        {
            return BadRequest(new { message = "Vui lòng chọn ảnh minh chứng chuyển khoản." });
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = "Chỉ hỗ trợ file ảnh JPG, PNG hoặc WEBP." });
        }

        var uploadRoot = Path.Combine(_environment.WebRootPath, "uploads", "bank-proofs");
        Directory.CreateDirectory(uploadRoot);

        var fileName = $"{DateTime.Now:yyyyMMddHHmmssfff}_{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadRoot, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream, cancellationToken);

        return Ok(new
        {
            fileName = file.FileName,
            url = $"/uploads/bank-proofs/{fileName}"
        });
    }

    private async Task<User?> GetSessionUserAsync(CancellationToken cancellationToken)
    {
        var userId = HttpContext.Session.GetInt32(SessionUserIdKey);
        return userId is null
            ? null
            : await _db.Users.FirstOrDefaultAsync(x => x.UserId == userId.Value, cancellationToken);
    }

    private async Task<Order> PersistOrderAsync(User user, CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var recipientWallet = NormalizeWallet(request.Wallet) ?? NormalizeWallet(user.WalletAddress);
        var shippingInfo = ResolveShippingInfo(user, request);

        var resolvedItems = new List<(CheckoutItemRequest Item, Product Product)>();
        var unresolvedItems = new List<string>();

        foreach (var item in request.Items.Where(item => item.Qty > 0))
        {
            var product = await ResolveProductAsync(item, cancellationToken);
            if (product is null)
            {
                unresolvedItems.Add(item.Name);
                continue;
            }

            resolvedItems.Add((item, product));
        }

        if (resolvedItems.Count == 0 || unresolvedItems.Count > 0)
        {
            var names = unresolvedItems.Count > 0 ? string.Join(", ", unresolvedItems) : "không có sản phẩm hợp lệ";
            throw new InvalidOperationException($"Không map được Product cho: {names}");
        }

        var total = resolvedItems.Sum(x => x.Item.Price * Math.Max(x.Item.Qty, 1));

        var order = new Order
        {
            UserId = user.UserId,
            TotalAmount = total,
            TokenSymbol = request.TokenSymbol,
            TxHash = request.TxHash,
            Wallet = recipientWallet,
            RecipientName = shippingInfo.RecipientName,
            RecipientPhone = shippingInfo.RecipientPhone,
            ShippingAddress = shippingInfo.ShippingAddress,
            ContactEmail = shippingInfo.ContactEmail,
            Status = string.IsNullOrWhiteSpace(request.Status) ? "Processing" : request.Status,
            CreatedAt = DateTime.Now
        };

        user.DefaultRecipientName = shippingInfo.RecipientName;
        user.PhoneNumber = shippingInfo.RecipientPhone;
        user.DefaultAddress = shippingInfo.ShippingAddress;
        user.DefaultContactEmail = shippingInfo.ContactEmail;

        _db.Orders.Add(order);
        await _db.SaveChangesAsync(cancellationToken);

        foreach (var entry in resolvedItems)
        {
            if (entry.Item.CryptoPrice is > 0 && entry.Product.PriceCrypto != entry.Item.CryptoPrice)
            {
                entry.Product.PriceCrypto = entry.Item.CryptoPrice;
            }

            for (var i = 0; i < entry.Item.Qty; i++)
            {
                var detail = new OrderDetail
                {
                    OrderId = order.OrderId,
                    ProductId = entry.Product.ProductId,
                    UnitPrice = entry.Item.Price,
                    SerialNumber = Guid.NewGuid().ToString("N")[..12].ToUpperInvariant()
                };
                _db.OrderDetails.Add(detail);
                await _db.SaveChangesAsync(cancellationToken);

                if (entry.Product.NftWarrantyEnabled)
                {
                    var warrantyMonths = entry.Product.WarrantyMonths is > 0 ? entry.Product.WarrantyMonths.Value : 24;
                    var warranty = new NftWarranty
                    {
                        OrderDetailId = detail.OrderDetailId,
                        UserId = user.UserId,
                        Wallet = recipientWallet,
                        ContractAddress = _configuration["Nft:Minting:ContractAddress"] ?? "0xdc251d82647e3FA2c4D5200eCcd3622b85d61263",
                        ExpiryDate = DateTime.Now.AddMonths(warrantyMonths)
                    };
                    _db.NftWarranties.Add(warranty);
                    await _db.SaveChangesAsync(cancellationToken);
                    await _nftMetadataService.GenerateAsync(warranty, entry.Product, order, cancellationToken);

                    var mintResult = await _nftMintingService.TryMintAsync(warranty, recipientWallet, cancellationToken);
                    warranty.MintStatus = mintResult.Status;
                    warranty.MintTxHash = mintResult.TxHash;
                    warranty.MetadataUri = mintResult.TokenUri ?? warranty.MetadataUri;
                    warranty.ChainTokenId = mintResult.ChainTokenId ?? warranty.ChainTokenId;
                    await _db.SaveChangesAsync(cancellationToken);
                }
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        return order;
    }

    private async Task<Product?> ResolveProductAsync(CheckoutItemRequest item, CancellationToken cancellationToken)
    {
        if (int.TryParse(item.Id, out var directProductId))
        {
            var byId = await _db.Products.FirstOrDefaultAsync(p => p.ProductId == directProductId, cancellationToken);
            if (byId is not null)
            {
                return byId;
            }
        }

        var normalizedItemName = NormalizeName(item.Name);
        var itemTokens = normalizedItemName
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(token => token.Length >= 3)
            .ToArray();

        var candidates = await _db.Products
            .Where(p => p.PriceVnd == item.Price
                || p.Name.Contains(item.Name)
                || item.Name.Contains(p.Name))
            .ToListAsync(cancellationToken);

        if (candidates.Count == 0)
        {
            candidates = await _db.Products.ToListAsync(cancellationToken);
        }

        return candidates
            .Select(product => new
            {
                Product = product,
                Normalized = NormalizeName(product.Name)
            })
            .Select(x => new
            {
                x.Product,
                Score =
                    (x.Product.PriceVnd == item.Price ? 1000 : 0) +
                    (x.Normalized == normalizedItemName ? 500 : 0) +
                    (x.Normalized.Contains(normalizedItemName) || normalizedItemName.Contains(x.Normalized) ? 200 : 0) +
                    itemTokens.Count(token => x.Normalized.Contains(token)) * 25
            })
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .ThenBy(x => x.Product.ProductId)
            .Select(x => x.Product)
            .FirstOrDefault();
    }

    private static string NormalizeName(string value)
    {
        var chars = value
            .ToLowerInvariant()
            .Select(ch => char.IsLetterOrDigit(ch) ? ch : ' ')
            .ToArray();

        return string.Join(
            ' ',
            new string(chars).Split(' ', StringSplitOptions.RemoveEmptyEntries));
    }

    private static string? NormalizeWallet(string? wallet)
    {
        if (string.IsNullOrWhiteSpace(wallet))
        {
            return null;
        }

        return wallet.Trim();
    }

    private static (string RecipientName, string RecipientPhone, string ShippingAddress, string ContactEmail) ResolveShippingInfo(User user, CreateOrderRequest request)
    {
        var recipientName = FirstNonEmpty(request.RecipientName, user.DefaultRecipientName, user.FullName);
        var recipientPhone = FirstNonEmpty(request.RecipientPhone, user.PhoneNumber);
        var shippingAddress = FirstNonEmpty(request.ShippingAddress, user.DefaultAddress);
        var contactEmail = FirstNonEmpty(request.ContactEmail, user.DefaultContactEmail, user.Email);

        if (string.IsNullOrWhiteSpace(recipientName) ||
            string.IsNullOrWhiteSpace(recipientPhone) ||
            string.IsNullOrWhiteSpace(shippingAddress) ||
            string.IsNullOrWhiteSpace(contactEmail))
        {
            throw new InvalidOperationException("Vui long nhap day du thong tin giao hang truoc khi dat hang.");
        }

        return (recipientName, recipientPhone, shippingAddress, contactEmail);
    }

    private static string FirstNonEmpty(params string?[] values)
    {
        foreach (var value in values)
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                return value.Trim();
            }
        }

        return string.Empty;
    }
}

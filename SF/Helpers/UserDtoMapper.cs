using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using SF.Models;

namespace SF.Helpers;

public static class UserDtoMapper
{
    public static async Task<UserSessionDto> ToSessionDtoAsync(this User user, SilverFlagPcContext db, string? webRootPath = null, CancellationToken cancellationToken = default)
    {
        var orders = await db.Orders
            .Where(order => order.UserId == user.UserId)
            .Include(order => order.OrderDetails)
                .ThenInclude(detail => detail.Product)
            .OrderByDescending(order => order.CreatedAt)
            .ToListAsync(cancellationToken);

        var nftWarranties = await db.NftWarranties
            .Where(nft => nft.UserId == user.UserId)
            .Include(nft => nft.OrderDetail)
                .ThenInclude(detail => detail.Product)
            .Include(nft => nft.OrderDetail)
                .ThenInclude(detail => detail.Order)
            .OrderByDescending(nft => nft.ExpiryDate)
            .ToListAsync(cancellationToken);

        var ordersById = orders.ToDictionary(order => order.OrderId);
        var orderDetailsById = orders
            .SelectMany(order => order.OrderDetails)
            .GroupBy(detail => detail.OrderDetailId)
            .ToDictionary(group => group.Key, group => group.First());

        var metadataChanged = false;
        foreach (var nft in nftWarranties)
        {
            var detail = nft.OrderDetail;
            if (detail is null)
            {
                orderDetailsById.TryGetValue(nft.OrderDetailId, out detail);
            }

            var order = detail?.Order;
            if (order is null && detail is not null)
            {
                ordersById.TryGetValue(detail.OrderId, out order);
            }

            if (TryBackfillMetadata(nft, detail, order, webRootPath))
            {
                metadataChanged = true;
            }
        }

        if (metadataChanged)
        {
            await db.SaveChangesAsync(cancellationToken);
        }

        var orderDtos = orders.Select(order =>
        {
            var itemCount = order.OrderDetails.Count;
            var productNames = order.OrderDetails
                .Select(detail => detail.Product?.Name)
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Take(4)
                .ToList();
            var cryptoTotal = order.OrderDetails.Sum(detail => (detail.Product?.PriceCrypto ?? 0m));

            return new OrderViewDto
            {
                Id = $"#SF{order.OrderId:D6}",
                Date = (order.CreatedAt ?? DateTime.Now).ToString("dd/MM/yyyy"),
                PaidAtTime = (order.CreatedAt ?? DateTime.Now).ToString("HH:mm"),
                Items = $"{Math.Max(itemCount, 1)} sản phẩm",
                Products = productNames.Count > 0 ? string.Join(" · ", productNames) : $"Đơn hàng #{order.OrderId}",
                Total = $"{order.TotalAmount:N0}đ",
                StatusClass = MapStatusClass(order.Status),
                StatusText = MapStatusText(order.Status),
                PaymentMethod = string.IsNullOrWhiteSpace(order.TokenSymbol) ? "Thanh toán thường" : $"Crypto ({order.TokenSymbol})",
                CryptoTotal = string.IsNullOrWhiteSpace(order.TokenSymbol) || cryptoTotal <= 0
                    ? null
                    : $"{cryptoTotal:0.####} {order.TokenSymbol}",
                RecipientName = order.RecipientName ?? string.Empty,
                RecipientPhone = order.RecipientPhone ?? string.Empty,
                ShippingAddress = order.ShippingAddress ?? string.Empty,
                ContactEmail = order.ContactEmail ?? string.Empty
            };
        }).ToList();

        var nftDtos = nftWarranties.Select(nft =>
        {
            var metadata = TryParseMetadata(nft.MetadataJson);
            var detail = nft.OrderDetail;
            if (detail is null)
            {
                orderDetailsById.TryGetValue(nft.OrderDetailId, out detail);
            }

            var order = detail?.Order;
            if (order is null && detail is not null)
            {
                ordersById.TryGetValue(detail.OrderId, out order);
            }

            if (order is null && metadata?.OrderId is int metadataOrderId)
            {
                ordersById.TryGetValue(metadataOrderId, out order);
            }

            var productName = ResolveProductName(nft, detail, metadata);
            var productPrice = ResolveProductPrice(detail, order, productName, metadata);
            var purchaseAt = ResolvePurchaseDate(order, metadata);
            var expiryDate = ResolveExpiryDate(nft, metadata);
            var tokenLabel = !string.IsNullOrWhiteSpace(nft.ChainTokenId)
                ? $"#{nft.ChainTokenId}"
                : $"#{nft.TokenId}";
            var explorerUrl = !string.IsNullOrWhiteSpace(nft.MintTxHash)
                ? $"https://explorer.oasis.io/testnet/sapphire/tx/{nft.MintTxHash}"
                : null;

            return new NftViewDto
            {
                Icon = "◈",
                Name = productName,
                Summary = "NFT này là phiếu bảo hành số gắn với đơn hàng và sản phẩm của bạn.",
                Info = string.Empty,
                OrderLabel = ResolveOrderLabel(order, metadata, nft),
                ProductPrice = productPrice.HasValue ? $"{productPrice.Value:N0}đ" : "Không có dữ liệu",
                PurchaseDate = purchaseAt?.ToString("dd/MM/yyyy") ?? "Không có dữ liệu",
                ExpiryDate = expiryDate.ToString("dd/MM/yyyy"),
                TokenLabel = tokenLabel,
                MintTxHash = nft.MintTxHash,
                MintTxShort = ShortenHash(nft.MintTxHash),
                ExplorerUrl = explorerUrl,
                MetadataUri = nft.MetadataUri,
                StatusClass = nft.ExpiryDate >= DateTime.Now ? "nft-active" : "nft-expired",
                StatusText = nft.ExpiryDate >= DateTime.Now ? "◈ Còn hiệu lực" : "✕ Hết hạn",
                Toast = string.IsNullOrWhiteSpace(nft.MetadataUri) ? productName : $"{productName} · {nft.MetadataUri}"
            };
        }).ToList();

        return new UserSessionDto
        {
            Name = user.FullName ?? user.Email,
            Email = user.Email,
            Phone = user.PhoneNumber ?? string.Empty,
            Avatar = AuthUtils.BuildAvatar(user.FullName, user.Email),
            Points = 100 + orderDtos.Count * 10,
            Orders = orderDtos.Count,
            Nfts = nftDtos.Count,
            Address = new AddressViewDto
            {
                RecipientName = user.DefaultRecipientName ?? user.FullName ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                ShippingAddress = user.DefaultAddress ?? string.Empty,
                ContactEmail = user.DefaultContactEmail ?? user.Email,
                IsComplete = !string.IsNullOrWhiteSpace(user.DefaultRecipientName ?? user.FullName)
                    && !string.IsNullOrWhiteSpace(user.PhoneNumber)
                    && !string.IsNullOrWhiteSpace(user.DefaultAddress)
            },
            AccountData = new AccountDataDto
            {
                Orders = orderDtos,
                Nfts = nftDtos
            }
        };
    }

    private static string ResolveProductName(NftWarranty nft, OrderDetail? detail, NftMetadataSnapshot? metadata)
    {
        if (!string.IsNullOrWhiteSpace(detail?.Product?.Name))
        {
            return detail.Product.Name;
        }

        if (!string.IsNullOrWhiteSpace(metadata?.ProductName))
        {
            return metadata.ProductName;
        }

        return $"NFT #{nft.TokenId}";
    }

    private static decimal? ResolveProductPrice(OrderDetail? detail, Order? order, string productName, NftMetadataSnapshot? metadata)
    {
        if (detail?.UnitPrice > 0)
        {
            return detail.UnitPrice;
        }

        if (detail?.Product?.PriceVnd > 0)
        {
            return detail.Product.PriceVnd;
        }

        if (metadata?.ProductPrice is decimal metadataPrice && metadataPrice > 0)
        {
            return metadataPrice;
        }

        if (order is null)
        {
            return null;
        }

        var orderDetails = order.OrderDetails ?? [];
        if (orderDetails.Count == 1)
        {
            var onlyDetail = orderDetails.First();
            if (onlyDetail.UnitPrice > 0)
            {
                return onlyDetail.UnitPrice;
            }

            if (onlyDetail.Product?.PriceVnd > 0)
            {
                return onlyDetail.Product.PriceVnd;
            }
        }

        var matchedDetail = orderDetails.FirstOrDefault(x =>
            string.Equals(x.Product?.Name?.Trim(), productName.Trim(), StringComparison.OrdinalIgnoreCase));

        if (matchedDetail?.UnitPrice > 0)
        {
            return matchedDetail.UnitPrice;
        }

        if (matchedDetail?.Product?.PriceVnd > 0)
        {
            return matchedDetail.Product.PriceVnd;
        }

        return null;
    }

    private static DateTime? ResolvePurchaseDate(Order? order, NftMetadataSnapshot? metadata)
    {
        if (order?.CreatedAt is DateTime createdAt)
        {
            return createdAt;
        }

        if (metadata?.PurchaseDate is DateTime purchaseDate)
        {
            return purchaseDate;
        }

        return null;
    }

    private static DateTime ResolveExpiryDate(NftWarranty nft, NftMetadataSnapshot? metadata)
    {
        if (metadata?.ExpiryDate is DateTime expiryDate)
        {
            return expiryDate;
        }

        return nft.ExpiryDate;
    }

    private static string ResolveOrderLabel(Order? order, NftMetadataSnapshot? metadata, NftWarranty nft)
    {
        if (order is not null)
        {
            return $"#SF{order.OrderId:D6}";
        }

        if (!string.IsNullOrWhiteSpace(metadata?.OrderLabel))
        {
            return metadata.OrderLabel;
        }

        if (metadata?.OrderId is int metadataOrderId)
        {
            return $"#SF{metadataOrderId:D6}";
        }

        return $"NFT #{nft.TokenId:D6}";
    }

    private static string? LoadMetadataPayload(NftWarranty nft, string? webRootPath)
    {
        if (!string.IsNullOrWhiteSpace(nft.MetadataJson))
        {
            return nft.MetadataJson;
        }

        if (string.IsNullOrWhiteSpace(webRootPath) || string.IsNullOrWhiteSpace(nft.MetadataUri))
        {
            return null;
        }

        var relativePath = nft.MetadataUri.Replace('/', Path.DirectorySeparatorChar).TrimStart(Path.DirectorySeparatorChar);
        var metadataPath = Path.Combine(webRootPath, relativePath);
        if (!File.Exists(metadataPath))
        {
            return null;
        }

        try
        {
            return File.ReadAllText(metadataPath);
        }
        catch (IOException)
        {
            return null;
        }
        catch (UnauthorizedAccessException)
        {
            return null;
        }
    }

    private static bool TryBackfillMetadata(NftWarranty nft, OrderDetail? detail, Order? order, string? webRootPath)
    {
        var originalPayload = LoadMetadataPayload(nft, webRootPath);
        if (string.IsNullOrWhiteSpace(originalPayload))
        {
            return false;
        }

        JsonObject root;
        try
        {
            root = JsonNode.Parse(originalPayload)?.AsObject() ?? new JsonObject();
        }
        catch (JsonException)
        {
            return false;
        }

        if (root["attributes"] is not JsonArray attributes)
        {
            attributes = new JsonArray();
            root["attributes"] = attributes;
        }

        var changed = false;
        changed |= UpsertAttribute(attributes, "Order ID", order is not null ? $"#SF{order.OrderId:D6}" : null);
        changed |= UpsertAttribute(attributes, "Product", detail?.Product?.Name);
        changed |= UpsertAttribute(attributes, "Product Price", ResolveMetadataPriceValue(detail));
        changed |= UpsertAttribute(attributes, "Purchase Date", order?.CreatedAt?.ToString("yyyy-MM-dd"));
        changed |= UpsertAttribute(attributes, "Expiry Date", nft.ExpiryDate.ToString("yyyy-MM-dd"));

        var normalizedPayload = root.ToJsonString(new JsonSerializerOptions { WriteIndented = true });
        if (!string.Equals(nft.MetadataJson, normalizedPayload, StringComparison.Ordinal))
        {
            nft.MetadataJson = normalizedPayload;
            changed = true;
        }

        return changed;
    }

    private static bool UpsertAttribute(JsonArray attributes, string traitType, string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        foreach (var attributeNode in attributes)
        {
            if (attributeNode is not JsonObject attribute)
            {
                continue;
            }

            var existingTraitType = attribute["trait_type"]?.GetValue<string>()?.Trim();
            if (!string.Equals(existingTraitType, traitType, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var existingValue = attribute["value"]?.GetValue<string>()?.Trim();
            if (string.Equals(existingValue, value, StringComparison.Ordinal))
            {
                return false;
            }

            attribute["value"] = value;
            return true;
        }

        attributes.Add(new JsonObject
        {
            ["trait_type"] = traitType,
            ["value"] = value
        });
        return true;
    }

    private static string? ResolveMetadataPriceValue(OrderDetail? detail)
    {
        if (detail?.UnitPrice > 0)
        {
            return $"{detail.UnitPrice:N0} VND";
        }

        if (detail?.Product?.PriceVnd > 0)
        {
            return $"{detail.Product.PriceVnd:N0} VND";
        }

        return null;
    }

    private static NftMetadataSnapshot? TryParseMetadata(string? metadataJson)
    {
        if (string.IsNullOrWhiteSpace(metadataJson))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(metadataJson);
            var root = document.RootElement;

            string? orderLabel = null;
            int? orderId = null;
            string? productName = null;
            decimal? productPrice = null;
            DateTime? purchaseDate = null;
            DateTime? expiryDate = null;

            if (root.TryGetProperty("attributes", out var attributes) && attributes.ValueKind == JsonValueKind.Array)
            {
                foreach (var attribute in attributes.EnumerateArray())
                {
                    if (!attribute.TryGetProperty("trait_type", out var traitTypeElement) ||
                        !attribute.TryGetProperty("value", out var valueElement))
                    {
                        continue;
                    }

                    var traitType = traitTypeElement.GetString()?.Trim();
                    var value = valueElement.ValueKind switch
                    {
                        JsonValueKind.String => valueElement.GetString()?.Trim(),
                        JsonValueKind.Number => valueElement.ToString(),
                        _ => null
                    };

                    if (string.IsNullOrWhiteSpace(traitType) || string.IsNullOrWhiteSpace(value))
                    {
                        continue;
                    }

                    switch (traitType)
                    {
                        case "Order ID":
                            orderLabel = value;
                            orderId = ParseOrderId(value);
                            break;
                        case "Product":
                            productName = value;
                            break;
                        case "Product Price":
                            productPrice = ParseMoney(value);
                            break;
                        case "Purchase Date":
                            purchaseDate = ParseDate(value);
                            break;
                        case "Expiry Date":
                        case "Warranty Until":
                            expiryDate = ParseDate(value);
                            break;
                    }
                }
            }

            return new NftMetadataSnapshot(orderLabel, orderId, productName, productPrice, purchaseDate, expiryDate);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static int? ParseOrderId(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var digits = new string(value.Where(char.IsDigit).ToArray());
        return int.TryParse(digits, out var orderId) ? orderId : null;
    }

    private static decimal? ParseMoney(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var digits = new string(value.Where(ch => char.IsDigit(ch) || ch is '.' or ',').ToArray());
        if (string.IsNullOrWhiteSpace(digits))
        {
            return null;
        }

        digits = digits.Replace(",", string.Empty);
        return decimal.TryParse(digits, NumberStyles.Number, CultureInfo.InvariantCulture, out var amount)
            ? amount
            : null;
    }

    private static DateTime? ParseDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var formats = new[] { "yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy" };
        return DateTime.TryParseExact(value, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed)
            ? parsed
            : null;
    }

    private static string MapStatusClass(string? status) =>
        status?.ToLowerInvariant() switch
        {
            "completed" => "status-done",
            "paid" => "status-done",
            "shipping" => "status-ship",
            "processing" => "status-proc",
            _ => "status-proc"
        };

    private static string MapStatusText(string? status) =>
        status?.ToLowerInvariant() switch
        {
            "completed" => "✅ Đã hoàn thành",
            "paid" => "✅ Đã thanh toán",
            "shipping" => "🚚 Đang giao hàng",
            "processing" => "⏳ Đang xử lý",
            _ => "⏳ Đang xử lý"
        };

    private static string? ShortenHash(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length < 18)
        {
            return value;
        }

        return $"{value[..10]}...{value[^8..]}";
    }

    private sealed record NftMetadataSnapshot(
        string? OrderLabel,
        int? OrderId,
        string? ProductName,
        decimal? ProductPrice,
        DateTime? PurchaseDate,
        DateTime? ExpiryDate);
}

using System.Text.Json.Serialization;

namespace SF.Models;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}

public class UpdateProfileRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}

public class UpdateAddressRequest
{
    public string RecipientName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string? ContactEmail { get; set; }
}

public class CheckoutItemRequest
{
    public string? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? CryptoPrice { get; set; }
    public int Qty { get; set; }
    public bool Nft { get; set; }
    public string? Warranty { get; set; }
}

public class CreateOrderRequest
{
    public List<CheckoutItemRequest> Items { get; set; } = new();
    public string PaymentMethod { get; set; } = "COD";
    public string? TokenSymbol { get; set; }
    public string? TxHash { get; set; }
    public string? Wallet { get; set; }
    public string? Status { get; set; }
    public decimal? CryptoAmount { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string? ContactEmail { get; set; }
}

public class PrepareCryptoCheckoutRequest
{
    public List<CheckoutItemRequest> Items { get; set; } = new();
    public decimal CryptoAmount { get; set; }
    public string TokenSymbol { get; set; } = "TEST";
    public string? Wallet { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string? ContactEmail { get; set; }
}

public class CompleteCryptoCheckoutRequest
{
    public string? TxHash { get; set; }
    public string? Wallet { get; set; }
}

public class UserSessionDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public int Points { get; set; }
    public int Orders { get; set; }
    public int Nfts { get; set; }
    public bool IsAdmin { get; set; }
    public string? RedirectUrl { get; set; }
    public AddressViewDto Address { get; set; } = new();
    public AccountDataDto AccountData { get; set; } = new();
}

public class AccountDataDto
{
    public List<OrderViewDto> Orders { get; set; } = new();
    public List<NftViewDto> Nfts { get; set; } = new();
}

public class AddressViewDto
{
    public string RecipientName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public bool IsComplete { get; set; }
}

public class OrderViewDto
{
    public string Id { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string? PaidAtTime { get; set; }
    public string Items { get; set; } = string.Empty;
    public string Products { get; set; } = string.Empty;
    public string Total { get; set; } = string.Empty;
    public string StatusClass { get; set; } = string.Empty;
    public string StatusText { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? CryptoTotal { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
}

public class NftViewDto
{
    public string Icon { get; set; } = "◈";
    public string Name { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Info { get; set; } = string.Empty;
    public string OrderLabel { get; set; } = string.Empty;
    public string ProductPrice { get; set; } = string.Empty;
    public string PurchaseDate { get; set; } = string.Empty;
    public string ExpiryDate { get; set; } = string.Empty;
    public string TokenLabel { get; set; } = string.Empty;
    public string? MintTxHash { get; set; }
    public string? MintTxShort { get; set; }
    public string? ExplorerUrl { get; set; }
    public string? MetadataUri { get; set; }
    public string StatusClass { get; set; } = "nft-active";
    public string StatusText { get; set; } = "◈ Còn hiệu lực";
    public string Toast { get; set; } = string.Empty;
}

public class NftShowcaseResponseDto
{
    public int MintedCount { get; set; }
    public List<NftShowcaseItemDto> Items { get; set; } = new();
}

public class NftShowcaseItemDto
{
    public string Icon { get; set; } = "◈";
    public string Name { get; set; } = string.Empty;
    public string Meta { get; set; } = string.Empty;
    public string TokenLabel { get; set; } = string.Empty;
    public string StatusColor { get; set; } = "var(--green)";
}

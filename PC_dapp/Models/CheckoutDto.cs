namespace PC_dapp.Models
{
    public class CartItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Qty { get; set; }
        public bool Nft { get; set; }
    }

    public class CheckoutDto
    {
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string? TokenSymbol { get; set; }
        public string? TxHash { get; set; }
        public string? Wallet { get; set; }
        public List<CartItemDto> Items { get; set; } = new();
    }

    public class PrepareCryptoCheckoutResponse
    {
        public string CheckoutId { get; set; } = string.Empty;
    }

    public class CompleteCryptoCheckoutDto
    {
        public string CheckoutId { get; set; } = string.Empty;
        public string TxHash { get; set; } = string.Empty;
        public string? Wallet { get; set; }
    }
}

namespace PC_dapp.Models
{
    public class CartItemDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int Qty { get; set; }
        public bool Nft { get; set; }
    }

    public class CheckoutDto
    {
        public string Email { get; set; } // Để biết ai đang đặt hàng
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string PaymentMethod { get; set; }
        public decimal TotalAmount { get; set; }
        public string? TokenSymbol { get; set; }
        public string? TxHash { get; set; }
        public string? Wallet { get; set; }
        public List<CartItemDto> Items { get; set; }
    }
}
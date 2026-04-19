using Microsoft.AspNetCore.Mvc;
using SilverFlag.Models;

namespace SilverFlag.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckoutController : ControllerBase
    {
        private readonly SilverFlagPcContext _context;

        public CheckoutController(SilverFlagPcContext context)
        {
            _context = context;
        }

        [HttpPost("crypto")]
        public async Task<IActionResult> ProcessCryptoCheckout([FromBody] CryptoOrderRequest request)
        {
            // 1. Kiểm tra ví đã kết nối chưa
            if (string.IsNullOrEmpty(request.WalletAddress))
                return BadRequest(new { message = "Chưa kết nối ví Web3!" });

            // 2. Lưu Order vào Database
            var newOrder = new Order
            {
                // Tạm thời gán UserID = 2 (User demo) nếu chưa làm hệ thống Login JWT
                UserId = 2,
                TotalAmount = request.TotalAmount,
                TokenSymbol = "ETH",
                TxHash = request.TxHash,
                Wallet = request.WalletAddress,
                Status = "Paid", // Đã thanh toán qua Crypto
                CreatedAt = DateTime.Now
            };

            _context.Orders.Add(newOrder);
            await _context.SaveChangesAsync(); // Lưu để lấy OrderId

            // 3. Lưu chi tiết OrderDetails
            foreach (var item in request.CartItems)
            {
                var detail = new OrderDetail
                {
                    OrderId = newOrder.OrderId,
                    ProductId = item.ProductId,
                    UnitPrice = item.Price,
                    SerialNumber = "SN-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper()
                };
                _context.OrderDetails.Add(detail);
            }
            await _context.SaveChangesAsync();

            // 4. Trả về thành công để Frontend báo Toast và tiến hành Mint NFT
            return Ok(new
            {
                success = true,
                orderId = newOrder.OrderId,
                message = "Lưu đơn hàng Web3 thành công!"
            });
        }
    }

    // Các class dùng để hứng dữ liệu JSON từ Frontend
    public class CryptoOrderRequest
    {
        public string WalletAddress { get; set; }
        public string TxHash { get; set; }
        public decimal TotalAmount { get; set; }
        public List<CartItemDto> CartItems { get; set; }
    }

    public class CartItemDto
    {
        public int ProductId { get; set; }
        public decimal Price { get; set; }
        public int Qty { get; set; }
        public bool Nft { get; set; }
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PC_dapp.Models;

namespace PC_dapp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckoutController : ControllerBase
    {
        private readonly SilverFlagPcContext _context;
        private readonly PendingCryptoCheckoutStore _pendingCryptoCheckoutStore;

        public CheckoutController(
            SilverFlagPcContext context,
            PendingCryptoCheckoutStore pendingCryptoCheckoutStore)
        {
            _context = context;
            _pendingCryptoCheckoutStore = pendingCryptoCheckoutStore;
        }

        [HttpPost("prepare-crypto")]
        public async Task<IActionResult> PrepareCrypto([FromBody] CheckoutDto request)
        {
            var validationError = await ValidateCheckoutRequest(request);
            if (validationError is not null)
            {
                return validationError;
            }

            request.PaymentMethod = string.IsNullOrWhiteSpace(request.PaymentMethod)
                ? "Crypto"
                : request.PaymentMethod;
            request.TokenSymbol = string.IsNullOrWhiteSpace(request.TokenSymbol)
                ? "TEST"
                : request.TokenSymbol;
            request.TxHash = null;

            var checkoutId = _pendingCryptoCheckoutStore.Save(request);
            return Ok(new PrepareCryptoCheckoutResponse { CheckoutId = checkoutId });
        }

        [HttpPost("complete-crypto")]
        public async Task<IActionResult> CompleteCrypto([FromBody] CompleteCryptoCheckoutDto request)
        {
            if (string.IsNullOrWhiteSpace(request.CheckoutId))
            {
                return BadRequest(new { message = "Thiếu mã checkout crypto." });
            }

            if (string.IsNullOrWhiteSpace(request.TxHash))
            {
                return BadRequest(new { message = "Thiếu mã giao dịch blockchain." });
            }

            if (!_pendingCryptoCheckoutStore.Remove(request.CheckoutId, out var pendingCheckout) || pendingCheckout is null)
            {
                return NotFound(new { message = "Không tìm thấy checkout crypto đang chờ xác nhận." });
            }

            pendingCheckout.TxHash = request.TxHash;
            if (!string.IsNullOrWhiteSpace(request.Wallet))
            {
                pendingCheckout.Wallet = request.Wallet;
            }

            var result = await CreateOrder(pendingCheckout);
            return Ok(new { success = true, orderId = result.OrderId, message = "Thành công!" });
        }

        [HttpPost("place-order")]
        public async Task<IActionResult> PlaceOrder([FromBody] CheckoutDto request)
        {
            var validationError = await ValidateCheckoutRequest(request);
            if (validationError is not null)
            {
                return validationError;
            }

            var order = await CreateOrder(request);
            return Ok(new { success = true, orderId = order.OrderId, message = "Thành công!" });
        }

        private async Task<IActionResult?> ValidateCheckoutRequest(CheckoutDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Thiếu email đặt hàng." });
            }

            if (string.IsNullOrWhiteSpace(request.Address))
            {
                return BadRequest(new { message = "Thiếu địa chỉ giao hàng." });
            }

            if (request.Items == null || request.Items.Count == 0)
            {
                return BadRequest(new { message = "Giỏ hàng đang trống." });
            }

            var userExists = await _context.Users.AnyAsync(u => u.Email == request.Email);
            if (!userExists)
            {
                return Unauthorized(new { message = "Không tìm thấy user. Vui lòng đăng nhập!" });
            }

            return null;
        }

        private async Task<Order> CreateOrder(CheckoutDto request)
        {
            var user = await _context.Users.FirstAsync(u => u.Email == request.Email);

            var newOrder = new Order
            {
                UserId = user.UserId,
                ShippingAddress = request.Address,
                TotalAmount = request.TotalAmount,
                TokenSymbol = string.IsNullOrEmpty(request.TokenSymbol) ? null : request.TokenSymbol,
                TxHash = string.IsNullOrEmpty(request.TxHash) ? null : request.TxHash,
                Wallet = string.IsNullOrEmpty(request.Wallet) ? null : request.Wallet,
                Status = "Đang xử lý",
                CreatedAt = DateTime.Now
            };

            _context.Orders.Add(newOrder);
            await _context.SaveChangesAsync();

            foreach (var item in request.Items)
            {
                var numericProductId = new string(item.Id.Where(char.IsDigit).ToArray());
                int.TryParse(numericProductId, out var productId);
                var quantity = item.Qty > 0 ? item.Qty : 1;

                for (var i = 0; i < quantity; i++)
                {
                    var detail = new OrderDetail
                    {
                        OrderId = newOrder.OrderId,
                        ProductId = productId > 0 ? productId : 1,
                        UnitPrice = item.Price
                    };
                    _context.OrderDetails.Add(detail);
                }
            }

            await _context.SaveChangesAsync();
            return newOrder;
        }
    }
}

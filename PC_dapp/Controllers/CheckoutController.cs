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

        public CheckoutController(SilverFlagPcContext context)
        {
            _context = context;
        }

        [HttpPost("place-order")]
        public async Task<IActionResult> PlaceOrder([FromBody] CheckoutDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Không tìm thấy user. Vui lòng đăng nhập!" });
            }

            // 1. Tạo đối tượng Order
            var newOrder = new Order
            {
                UserId = user.UserId,
                ShippingAddress = request.Address,  // Nhớ Ctrl+S bên file Order.cs để hết báo đỏ dòng này nhé
                TotalAmount = request.TotalAmount,
                TokenSymbol = string.IsNullOrEmpty(request.TokenSymbol) ? null : request.TokenSymbol,
                TxHash = string.IsNullOrEmpty(request.TxHash) ? null : request.TxHash,
                Wallet = string.IsNullOrEmpty(request.Wallet) ? null : request.Wallet,
                Status = "Đang xử lý",
                CreatedAt = DateTime.Now
            };

            _context.Orders.Add(newOrder);
            await _context.SaveChangesAsync();

            // 2. Lưu chi tiết sản phẩm (Lưu nhiều dòng thay vì dùng cột Quantity)
            if (request.Items != null)
            {
                foreach (var item in request.Items)
                {
                    int pId = 0;
                    int.TryParse(new string(item.Id.Where(char.IsDigit).ToArray()), out pId);

                    // Khách mua bao nhiêu cái (item.Qty), ta tạo bấy nhiêu dòng OrderDetail
                    for (int i = 0; i < item.Qty; i++)
                    {
                        var detail = new OrderDetail
                        {
                            OrderId = newOrder.OrderId,
                            ProductId = pId > 0 ? pId : 1,
                            UnitPrice = item.Price
                            // SerialNumber tạm để null, nhân viên kho sẽ nhập sau khi xuất hàng
                        };
                        _context.OrderDetails.Add(detail);
                    }
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { success = true, orderId = newOrder.OrderId, message = "Thành công!" });
        }
    }
}
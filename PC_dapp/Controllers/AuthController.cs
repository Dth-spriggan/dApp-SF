using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PC_dapp.Models;

namespace PC_dapp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly SilverFlagPcContext _context;

        public AuthController(SilverFlagPcContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            // 1. Kiểm tra xem Email đã bị đăng ký chưa
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email này đã được sử dụng!" });
            }

            // 2. Chuyển dữ liệu từ DTO sang Entity User chuẩn của ngài
            var newUser = new User
            {
                Email = request.Email,
                PasswordHash = request.Password, // Thực tế sau này sẽ băm (Hash) pass, giờ lưu trần test trước
                FullName = $"{request.LastName} {request.FirstName}".Trim(),
                PhoneNumber = request.Phone,
                Role = "Customer"
                // WalletAddress để trống, bao giờ kết nối ví Web3 cập nhật sau
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đăng ký thành công!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            // 1. Tìm User có Email và Password khớp
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.PasswordHash == request.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Sai email hoặc mật khẩu!" });
            }

            // 2. Trả về thông tin để Frontend hiển thị trên Header
            return Ok(new
            {
                success = true,
                name = user.FullName,
                email = user.Email,
                phone = user.PhoneNumber,
                avatar = string.IsNullOrEmpty(user.FullName) ? "U" : user.FullName.Substring(0, 1).ToUpper()
            });
        }
    }
}
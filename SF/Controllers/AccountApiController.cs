using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SF.Helpers;
using SF.Models;

namespace SF.Controllers;

[ApiController]
[Route("api/account")]
public class AccountApiController : ControllerBase
{
    private const string SessionUserIdKey = "sf.userId";
    private const string SessionAdminKey = "sf.admin";
    private readonly SilverFlagPcContext _db;
    private readonly IWebHostEnvironment _environment;

    public AccountApiController(SilverFlagPcContext db, IWebHostEnvironment environment)
    {
        _db = db;
        _environment = environment;
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        if (HttpContext.Session.GetString(SessionAdminKey) == "1")
        {
            return Ok(new UserSessionDto
            {
                Name = "Administrator",
                Email = "admin",
                IsAdmin = true,
                RedirectUrl = "/Admin"
            });
        }

        var userId = HttpContext.Session.GetInt32(SessionUserIdKey);
        if (userId is null)
        {
            return Unauthorized();
        }

        var user = await _db.Users.FirstOrDefaultAsync(x => x.UserId == userId.Value, cancellationToken);
        if (user is null)
        {
            HttpContext.Session.Remove(SessionUserIdKey);
            return Unauthorized();
        }

        return Ok(await user.ToSessionDtoAsync(_db, _environment.WebRootPath, cancellationToken));
    }

    [HttpGet("nft-showcase")]
    public async Task<IActionResult> NftShowcase(CancellationToken cancellationToken)
    {
        var mintedCount = await _db.NftWarranties.CountAsync(cancellationToken);
        var latestNfts = await _db.NftWarranties
            .Include(nft => nft.OrderDetail)
                .ThenInclude(detail => detail.Product)
            .OrderByDescending(nft => nft.TokenId)
            .Take(3)
            .ToListAsync(cancellationToken);

        var response = new NftShowcaseResponseDto
        {
            MintedCount = mintedCount,
            Items = latestNfts.Select(nft => new NftShowcaseItemDto
            {
                Icon = "◈",
                Name = nft.OrderDetail?.Product?.Name ?? $"NFT #{nft.TokenId}",
                Meta = $"Bảo hành đến {nft.ExpiryDate:dd/MM/yyyy} · {(string.IsNullOrWhiteSpace(nft.MetadataUri) ? "Metadata pending" : "Metadata ready")}",
                TokenLabel = string.IsNullOrWhiteSpace(nft.ChainTokenId) ? $"#W-{nft.TokenId:D4}" : $"#{nft.ChainTokenId}",
                StatusColor = nft.ExpiryDate >= DateTime.Now ? "var(--green)" : "var(--orange)"
            }).ToList()
        };

        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (email == "admin" && request.Password == "admin")
        {
            HttpContext.Session.Remove(SessionUserIdKey);
            HttpContext.Session.SetString(SessionAdminKey, "1");
            return Ok(new UserSessionDto
            {
                Name = "Administrator",
                Email = "admin",
                IsAdmin = true,
                RedirectUrl = "/Admin"
            });
        }

        var passwordHash = AuthUtils.HashPassword(request.Password);

        var user = await _db.Users.FirstOrDefaultAsync(
            x => x.Email.ToLower() == email && x.PasswordHash == passwordHash,
            cancellationToken);

        if (user is null)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng." });
        }

        HttpContext.Session.SetInt32(SessionUserIdKey, user.UserId);
        HttpContext.Session.Remove(SessionAdminKey);
        return Ok(await user.ToSessionDtoAsync(_db, _environment.WebRootPath, cancellationToken));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(x => x.Email.ToLower() == email, cancellationToken))
        {
            return Conflict(new { message = "Email đã tồn tại." });
        }

        var user = new User
        {
            Email = email,
            PasswordHash = AuthUtils.HashPassword(request.Password),
            FullName = string.IsNullOrWhiteSpace(request.FullName) ? email : request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Role = "Customer"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        HttpContext.Session.SetInt32(SessionUserIdKey, user.UserId);
        HttpContext.Session.Remove(SessionAdminKey);
        return Ok(await user.ToSessionDtoAsync(_db, _environment.WebRootPath, cancellationToken));
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var userId = HttpContext.Session.GetInt32(SessionUserIdKey);
        if (userId is null)
        {
            return Unauthorized();
        }

        var user = await _db.Users.FirstOrDefaultAsync(x => x.UserId == userId.Value, cancellationToken);
        if (user is null)
        {
            return Unauthorized();
        }

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim();
        await _db.SaveChangesAsync(cancellationToken);

        return Ok(await user.ToSessionDtoAsync(_db, _environment.WebRootPath, cancellationToken));
    }

    [HttpPut("address")]
    public async Task<IActionResult> UpdateAddress([FromBody] UpdateAddressRequest request, CancellationToken cancellationToken)
    {
        var userId = HttpContext.Session.GetInt32(SessionUserIdKey);
        if (userId is null)
        {
            return Unauthorized();
        }

        var user = await _db.Users.FirstOrDefaultAsync(x => x.UserId == userId.Value, cancellationToken);
        if (user is null)
        {
            return Unauthorized();
        }

        var recipientName = request.RecipientName.Trim();
        var phoneNumber = request.PhoneNumber.Trim();
        var shippingAddress = request.ShippingAddress.Trim();
        var contactEmail = string.IsNullOrWhiteSpace(request.ContactEmail)
            ? user.Email
            : request.ContactEmail.Trim();

        if (string.IsNullOrWhiteSpace(recipientName) ||
            string.IsNullOrWhiteSpace(phoneNumber) ||
            string.IsNullOrWhiteSpace(shippingAddress))
        {
            return BadRequest(new { message = "Vui long nhap day du ten nguoi nhan, so dien thoai va dia chi giao hang." });
        }

        user.DefaultRecipientName = recipientName;
        user.PhoneNumber = phoneNumber;
        user.DefaultAddress = shippingAddress;
        user.DefaultContactEmail = contactEmail;
        await _db.SaveChangesAsync(cancellationToken);

        return Ok(await user.ToSessionDtoAsync(_db, _environment.WebRootPath, cancellationToken));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        HttpContext.Session.Remove(SessionUserIdKey);
        HttpContext.Session.Remove(SessionAdminKey);
        HttpContext.Session.Remove("sf.pendingCrypto");
        return NoContent();
    }
}

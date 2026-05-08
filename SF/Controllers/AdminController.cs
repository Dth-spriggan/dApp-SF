using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SF.Models;

namespace SF.Controllers;

public class AdminController : Controller
{
    private const string SessionAdminKey = "sf.admin";
    private readonly SilverFlagPcContext _db;

    public AdminController(SilverFlagPcContext db)
    {
        _db = db;
    }

    [HttpGet("/Admin")]
    public async Task<IActionResult> Index(string? message, CancellationToken cancellationToken)
    {
        if (!IsAdmin())
        {
            return RedirectToAction("Index", "Home");
        }

        return View("Dashboard", await BuildDashboardAsync(message, cancellationToken));
    }

    [HttpGet("/Admin/Products")]
    public async Task<IActionResult> Products(string? message, CancellationToken cancellationToken)
    {
        if (!IsAdmin())
        {
            return RedirectToAction("Index", "Home");
        }

        return View(await BuildProductsPageAsync(message, cancellationToken));
    }

    [HttpGet("/Admin/Orders")]
    public async Task<IActionResult> Orders(string? message, CancellationToken cancellationToken)
    {
        if (!IsAdmin())
        {
            return RedirectToAction("Index", "Home");
        }

        return View(await BuildOrdersPageAsync(message, cancellationToken));
    }

    [HttpGet("/Admin/Users")]
    public async Task<IActionResult> Users(string? message, CancellationToken cancellationToken)
    {
        if (!IsAdmin())
        {
            return RedirectToAction("Index", "Home");
        }

        return View(await BuildUsersPageAsync(message, cancellationToken));
    }

    [HttpPost("/Admin/products/create")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateProduct(ProductEditorInput input, CancellationToken cancellationToken)
    {
        if (!IsAdmin())
        {
            return RedirectToAction("Index", "Home");
        }

        if (!TryValidateProductInput(input, out var errorMessage))
        {
            return RedirectToAction(nameof(Products), new { message = errorMessage });
        }

        var product = new Product
        {
            Name = input.Name.Trim(),
            CategoryId = input.CategoryId,
            PriceVnd = input.PriceVnd,
            PriceCrypto = input.PriceCrypto,
            Stock = input.Stock,
            ImageUrl = string.IsNullOrWhiteSpace(input.ImageUrl) ? null : input.ImageUrl.Trim(),
            NftWarrantyEnabled = input.NftWarrantyEnabled,
            WarrantyMonths = input.NftWarrantyEnabled ? Math.Max(input.WarrantyMonths ?? 24, 1) : null
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(cancellationToken);
        return RedirectToAction(nameof(Products), new { message = "Da them san pham moi." });
    }

    [HttpPost("/Admin/products/update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateProduct(ProductEditorInput input, CancellationToken cancellationToken)
    {
        if (!IsAdmin())
        {
            return RedirectToAction("Index", "Home");
        }

        if (!TryValidateProductInput(input, out var errorMessage))
        {
            return RedirectToAction(nameof(Products), new { message = errorMessage });
        }

        var product = await _db.Products.FirstOrDefaultAsync(x => x.ProductId == input.ProductId, cancellationToken);
        if (product is null)
        {
            return RedirectToAction(nameof(Products), new { message = "Khong tim thay san pham can cap nhat." });
        }

        product.Name = input.Name.Trim();
        product.CategoryId = input.CategoryId;
        product.PriceVnd = input.PriceVnd;
        product.PriceCrypto = input.PriceCrypto;
        product.Stock = input.Stock;
        product.ImageUrl = string.IsNullOrWhiteSpace(input.ImageUrl) ? null : input.ImageUrl.Trim();
        product.NftWarrantyEnabled = input.NftWarrantyEnabled;
        product.WarrantyMonths = input.NftWarrantyEnabled ? Math.Max(input.WarrantyMonths ?? 24, 1) : null;

        await _db.SaveChangesAsync(cancellationToken);
        return RedirectToAction(nameof(Products), new { message = "Da cap nhat san pham." });
    }

    [HttpPost("/Admin/products/delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteProduct(int productId, CancellationToken cancellationToken)
    {
        if (!IsAdmin())
        {
            return RedirectToAction("Index", "Home");
        }

        var product = await _db.Products
            .Include(x => x.OrderDetails)
            .FirstOrDefaultAsync(x => x.ProductId == productId, cancellationToken);

        if (product is null)
        {
            return RedirectToAction(nameof(Products), new { message = "Khong tim thay san pham de xoa." });
        }

        if (product.OrderDetails.Any())
        {
            return RedirectToAction(nameof(Products), new { message = "San pham da co trong don hang, chi nen sua thong tin thay vi xoa." });
        }

        _db.Products.Remove(product);
        await _db.SaveChangesAsync(cancellationToken);
        return RedirectToAction(nameof(Products), new { message = "Da xoa san pham." });
    }

    [HttpPost("/Admin/orders/status")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateOrderStatus(UpdateOrderStatusInput input, CancellationToken cancellationToken)
    {
        if (!IsAdmin())
        {
            return RedirectToAction("Index", "Home");
        }

        var order = await _db.Orders.FirstOrDefaultAsync(x => x.OrderId == input.OrderId, cancellationToken);
        if (order is null)
        {
            return RedirectToAction(nameof(Orders), new { message = "Khong tim thay don hang can cap nhat." });
        }

        order.Status = string.IsNullOrWhiteSpace(input.Status) ? "Processing" : input.Status.Trim();
        await _db.SaveChangesAsync(cancellationToken);
        return RedirectToAction(nameof(Orders), new { message = $"Da cap nhat trang thai don #{order.OrderId}." });
    }

    [HttpPost("/Admin/logout")]
    [ValidateAntiForgeryToken]
    public IActionResult Logout()
    {
        HttpContext.Session.Remove(SessionAdminKey);
        return RedirectToAction("Index", "Home");
    }

    private bool IsAdmin() => HttpContext.Session.GetString(SessionAdminKey) == "1";

    private async Task<AdminDashboardViewModel> BuildDashboardAsync(string? message, CancellationToken cancellationToken)
    {
        var summary = await BuildSummaryAsync(cancellationToken);
        var recentOrders = await QueryOrders().Take(5).ToListAsync(cancellationToken);
        var lowStockProducts = await QueryProducts()
            .Where(product => product.Stock <= 5)
            .OrderBy(product => product.Stock)
            .Take(6)
            .ToListAsync(cancellationToken);

        return new AdminDashboardViewModel
        {
            ActivePage = "dashboard",
            Message = message,
            TotalOrders = summary.TotalOrders,
            TotalProducts = summary.TotalProducts,
            TotalCustomers = summary.TotalCustomers,
            Revenue = summary.Revenue,
            RecentOrders = recentOrders.Select(MapOrder).ToList(),
            LowStockProducts = lowStockProducts.Select(MapProduct).ToList()
        };
    }

    private async Task<AdminProductsPageViewModel> BuildProductsPageAsync(string? message, CancellationToken cancellationToken)
    {
        var summary = await BuildSummaryAsync(cancellationToken);
        var categories = await _db.Categories.OrderBy(category => category.Name).ToListAsync(cancellationToken);
        var products = await QueryProducts().ToListAsync(cancellationToken);

        return new AdminProductsPageViewModel
        {
            ActivePage = "products",
            Message = message,
            TotalOrders = summary.TotalOrders,
            TotalProducts = summary.TotalProducts,
            TotalCustomers = summary.TotalCustomers,
            Revenue = summary.Revenue,
            Categories = categories.Select(category => new CategoryOptionViewModel
            {
                CategoryId = category.CategoryId,
                Name = category.Name
            }).ToList(),
            Products = products.Select(MapProduct).ToList(),
            NewProduct = new ProductEditorInput
            {
                CategoryId = categories.FirstOrDefault()?.CategoryId ?? 0,
                WarrantyMonths = 24,
                NftWarrantyEnabled = true
            }
        };
    }

    private async Task<AdminOrdersPageViewModel> BuildOrdersPageAsync(string? message, CancellationToken cancellationToken)
    {
        var summary = await BuildSummaryAsync(cancellationToken);
        var orders = await QueryOrders().ToListAsync(cancellationToken);

        return new AdminOrdersPageViewModel
        {
            ActivePage = "orders",
            Message = message,
            TotalOrders = summary.TotalOrders,
            TotalProducts = summary.TotalProducts,
            TotalCustomers = summary.TotalCustomers,
            Revenue = summary.Revenue,
            Orders = orders.Select(MapOrder).ToList()
        };
    }

    private async Task<AdminUsersPageViewModel> BuildUsersPageAsync(string? message, CancellationToken cancellationToken)
    {
        var summary = await BuildSummaryAsync(cancellationToken);
        var users = await _db.Users
            .Include(user => user.Orders)
            .Include(user => user.NftWarranties)
            .OrderByDescending(user => user.UserId)
            .ToListAsync(cancellationToken);

        return new AdminUsersPageViewModel
        {
            ActivePage = "users",
            Message = message,
            TotalOrders = summary.TotalOrders,
            TotalProducts = summary.TotalProducts,
            TotalCustomers = summary.TotalCustomers,
            Revenue = summary.Revenue,
            Users = users.Select(user => new AdminUserViewModel
            {
                UserId = user.UserId,
                Name = user.FullName ?? user.Email,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                DefaultAddress = user.DefaultAddress ?? string.Empty,
                OrderCount = user.Orders.Count,
                NftCount = user.NftWarranties.Count,
                TotalSpent = user.Orders.Sum(order => order.TotalAmount)
            }).ToList()
        };
    }

    private async Task<(int TotalOrders, int TotalProducts, int TotalCustomers, decimal Revenue)> BuildSummaryAsync(CancellationToken cancellationToken)
    {
        var totalOrders = await _db.Orders.CountAsync(cancellationToken);
        var totalProducts = await _db.Products.CountAsync(cancellationToken);
        var totalCustomers = await _db.Users.CountAsync(cancellationToken);
        var revenue = await _db.Orders.SumAsync(order => (decimal?)order.TotalAmount, cancellationToken) ?? 0m;
        return (totalOrders, totalProducts, totalCustomers, revenue);
    }

    private IQueryable<Order> QueryOrders() =>
        _db.Orders
            .Include(order => order.User)
            .Include(order => order.OrderDetails)
                .ThenInclude(detail => detail.Product)
            .OrderByDescending(order => order.CreatedAt);

    private IQueryable<Product> QueryProducts() =>
        _db.Products
            .Include(product => product.Category)
            .OrderBy(product => product.ProductId);

    private static AdminOrderViewModel MapOrder(Order order) => new()
    {
        OrderId = order.OrderId,
        CustomerName = order.User?.FullName ?? order.User?.Email ?? string.Empty,
        CustomerEmail = order.User?.Email ?? string.Empty,
        RecipientName = order.RecipientName ?? string.Empty,
        RecipientPhone = order.RecipientPhone ?? string.Empty,
        ShippingAddress = order.ShippingAddress ?? string.Empty,
        ContactEmail = order.ContactEmail ?? string.Empty,
        Status = string.IsNullOrWhiteSpace(order.Status) ? "Processing" : order.Status,
        PaymentMethod = string.IsNullOrWhiteSpace(order.TokenSymbol) ? "Thanh toán thường" : $"Crypto ({order.TokenSymbol})",
        Wallet = order.Wallet ?? string.Empty,
        TxHash = order.TxHash ?? string.Empty,
        CreatedAt = order.CreatedAt,
        TotalAmount = order.TotalAmount,
        Items = order.OrderDetails.Select(detail => new AdminOrderItemViewModel
        {
            ProductName = detail.Product?.Name ?? $"Product #{detail.ProductId}",
            UnitPrice = detail.UnitPrice,
            SerialNumber = detail.SerialNumber ?? string.Empty
        }).ToList()
    };

    private static AdminProductViewModel MapProduct(Product product) => new()
    {
        ProductId = product.ProductId,
        Name = product.Name,
        CategoryId = product.CategoryId,
        CategoryName = product.Category?.Name ?? $"Category #{product.CategoryId}",
        PriceVnd = product.PriceVnd,
        PriceCrypto = product.PriceCrypto,
        Stock = product.Stock,
        ImageUrl = product.ImageUrl ?? string.Empty,
        NftWarrantyEnabled = product.NftWarrantyEnabled,
        WarrantyMonths = product.WarrantyMonths ?? 24
    };

    private static bool TryValidateProductInput(ProductEditorInput input, out string errorMessage)
    {
        if (string.IsNullOrWhiteSpace(input.Name))
        {
            errorMessage = "Ten san pham khong duoc de trong.";
            return false;
        }

        if (input.CategoryId <= 0)
        {
            errorMessage = "Vui long chon danh muc.";
            return false;
        }

        if (input.PriceVnd < 0 || input.Stock < 0)
        {
            errorMessage = "Gia va ton kho khong duoc am.";
            return false;
        }

        errorMessage = string.Empty;
        return true;
    }
}

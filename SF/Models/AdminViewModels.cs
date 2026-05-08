namespace SF.Models;

public abstract class AdminPageViewModel
{
    public string ActivePage { get; set; } = "dashboard";
    public string? Message { get; set; }
    public int TotalOrders { get; set; }
    public int TotalProducts { get; set; }
    public int TotalCustomers { get; set; }
    public decimal Revenue { get; set; }
}

public class AdminDashboardViewModel : AdminPageViewModel
{
    public List<AdminOrderViewModel> RecentOrders { get; set; } = new();
    public List<AdminProductViewModel> LowStockProducts { get; set; } = new();
}

public class AdminProductsPageViewModel : AdminPageViewModel
{
    public List<AdminProductViewModel> Products { get; set; } = new();
    public List<CategoryOptionViewModel> Categories { get; set; } = new();
    public ProductEditorInput NewProduct { get; set; } = new();
}

public class AdminOrdersPageViewModel : AdminPageViewModel
{
    public List<AdminOrderViewModel> Orders { get; set; } = new();
}

public class AdminUsersPageViewModel : AdminPageViewModel
{
    public List<AdminUserViewModel> Users { get; set; } = new();
}

public class AdminUserViewModel
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string DefaultAddress { get; set; } = string.Empty;
    public int OrderCount { get; set; }
    public int NftCount { get; set; }
    public decimal TotalSpent { get; set; }
}

public class AdminOrderViewModel
{
    public int OrderId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string Wallet { get; set; } = string.Empty;
    public string TxHash { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
    public decimal TotalAmount { get; set; }
    public List<AdminOrderItemViewModel> Items { get; set; } = new();
}

public class AdminOrderItemViewModel
{
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
}

public class AdminProductViewModel
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal PriceVnd { get; set; }
    public decimal? PriceCrypto { get; set; }
    public int Stock { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool NftWarrantyEnabled { get; set; }
    public int WarrantyMonths { get; set; }
}

public class CategoryOptionViewModel
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class ProductEditorInput
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public decimal PriceVnd { get; set; }
    public decimal? PriceCrypto { get; set; }
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public bool NftWarrantyEnabled { get; set; }
    public int? WarrantyMonths { get; set; }
}

public class UpdateOrderStatusInput
{
    public int OrderId { get; set; }
    public string Status { get; set; } = string.Empty;
}

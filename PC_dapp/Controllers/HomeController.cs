using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PC_dapp.Models;
using System.Diagnostics;

namespace PC_dapp.Controllers
{
    public class HomeController : Controller
    {
        private readonly SilverFlagPcContext _context;

        public HomeController(SilverFlagPcContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            // Lấy 12 sản phẩm mới nhất kèm Category
            var products = await _context.Products
                .Include(p => p.Category)
                .OrderByDescending(p => p.ProductId)
                .Take(12)
                .ToListAsync();

            return View(products);
        }
        public IActionResult CryptoPayment()
        {
            return View();
        }
    }
}

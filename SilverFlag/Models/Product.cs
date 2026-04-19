using System;
using System.Collections.Generic;

namespace SilverFlag.Models;

public partial class Product
{
    public int ProductId { get; set; }

    public int CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public decimal PriceVnd { get; set; }

    public decimal? PriceCrypto { get; set; }

    public int Stock { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
}

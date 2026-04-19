using System;
using System.Collections.Generic;

namespace SilverFlag.Models;

public partial class OrderDetail
{
    public int OrderDetailId { get; set; }

    public int OrderId { get; set; }

    public int ProductId { get; set; }

    public string? SerialNumber { get; set; }

    public decimal UnitPrice { get; set; }

    public virtual ICollection<NftWarranty> NftWarranties { get; set; } = new List<NftWarranty>();

    public virtual Order Order { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}

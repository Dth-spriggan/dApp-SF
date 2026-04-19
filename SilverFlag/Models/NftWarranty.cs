using System;
using System.Collections.Generic;

namespace SilverFlag.Models;

public partial class NftWarranty
{
    public int TokenId { get; set; }

    public int OrderDetailId { get; set; }

    public int UserId { get; set; }

    public string? Wallet { get; set; }

    public string? ContractAddress { get; set; }

    public DateTime ExpiryDate { get; set; }

    public virtual OrderDetail OrderDetail { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}

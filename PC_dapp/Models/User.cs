using System;
using System.Collections.Generic;

namespace PC_dapp.Models;

public partial class User
{
    public int UserId { get; set; }

    public string? WalletAddress { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? FullName { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Role { get; set; }

    public virtual ICollection<NftWarranty> NftWarranties { get; set; } = new List<NftWarranty>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}

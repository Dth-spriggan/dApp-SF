using System;
using System.Collections.Generic;

namespace SF.Models;

public partial class NftWarranty
{
    public int TokenId { get; set; }

    public int OrderDetailId { get; set; }

    public int UserId { get; set; }

    public string? Wallet { get; set; }

    public string? ContractAddress { get; set; }

    public string? MetadataUri { get; set; }

    public string? ImageUri { get; set; }

    public string? MintStatus { get; set; }

    public string? MintTxHash { get; set; }

    public string? ChainTokenId { get; set; }

    public string? MetadataJson { get; set; }

    public DateTime ExpiryDate { get; set; }

    public virtual OrderDetail OrderDetail { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}

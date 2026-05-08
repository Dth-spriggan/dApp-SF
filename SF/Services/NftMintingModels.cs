namespace SF.Services;

public class NftAssetBundle
{
    public string ImagePath { get; set; } = string.Empty;
    public string MetadataPath { get; set; } = string.Empty;
    public string ImageUri { get; set; } = string.Empty;
    public string MetadataUri { get; set; } = string.Empty;
    public string MetadataJson { get; set; } = string.Empty;
}

public class NftMintingResult
{
    public bool Minted { get; set; }
    public string Status { get; set; } = "metadata_ready";
    public string? TokenUri { get; set; }
    public string? TxHash { get; set; }
    public string? ChainTokenId { get; set; }
    public string? Message { get; set; }
}

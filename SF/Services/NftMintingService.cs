using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using SF.Models;
using System.Diagnostics;
using System.Text.Json;

namespace SF.Services;

public class NftMintingService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public NftMintingService(IConfiguration configuration, IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _environment = environment;
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_configuration["Nft:Minting:RpcUrl"]) &&
        !string.IsNullOrWhiteSpace(_configuration["Nft:Minting:ContractAddress"]) &&
        !string.IsNullOrWhiteSpace(_configuration["Nft:Minting:PrivateKey"]) &&
        !string.IsNullOrWhiteSpace(_configuration["Nft:Minting:AbiPath"]);

    public async Task<NftMintingResult> TryMintAsync(NftWarranty warranty, string? recipientWallet, CancellationToken cancellationToken = default)
    {
        if (!bool.TryParse(_configuration["Nft:Minting:Enabled"], out var enabled) || !enabled)
        {
            return new NftMintingResult
            {
                Status = "metadata_ready",
                TokenUri = warranty.MetadataUri,
                Message = "Minting disabled in configuration."
            };
        }

        if (!IsConfigured)
        {
            return new NftMintingResult
            {
                Status = "metadata_ready",
                TokenUri = warranty.MetadataUri,
                Message = "Minting configuration is incomplete."
            };
        }

        if (string.IsNullOrWhiteSpace(recipientWallet))
        {
            return new NftMintingResult
            {
                Status = "wallet_required",
                TokenUri = warranty.MetadataUri,
                Message = "Recipient wallet address is missing."
            };
        }

        var rpcUrl = _configuration["Nft:Minting:RpcUrl"]!;
        var contractAddress = _configuration["Nft:Minting:ContractAddress"]!;
        var privateKey = _configuration["Nft:Minting:PrivateKey"]!;
        var abiPathSetting = _configuration["Nft:Minting:AbiPath"]!;
        var abiPath = Path.IsPathRooted(abiPathSetting)
            ? abiPathSetting
            : Path.Combine(_environment.ContentRootPath, abiPathSetting.Replace('/', Path.DirectorySeparatorChar));
        if (!File.Exists(abiPath))
        {
            return new NftMintingResult
            {
                Status = "metadata_ready",
                TokenUri = warranty.MetadataUri,
                Message = $"NFT ABI file not found: {abiPath}"
            };
        }

        var abi = await File.ReadAllTextAsync(abiPath, cancellationToken);

        if (rpcUrl.Contains("sapphire", StringComparison.OrdinalIgnoreCase))
        {
            return await MintViaSapphireWorkerAsync(
                rpcUrl,
                privateKey,
                contractAddress,
                abiPath,
                recipientWallet,
                warranty.MetadataUri!,
                cancellationToken);
        }

        var account = new Account(privateKey);
        var web3 = new Web3(account, rpcUrl);
        var contract = web3.Eth.GetContract(abi, contractAddress);

        Function? mintFunction = null;
        string? mintFunctionName = null;
        foreach (var functionName in new[] { "safeMint", "mint", "mintTo" })
        {
            try
            {
                mintFunction = contract.GetFunction(functionName);
                if (mintFunction is not null)
                {
                    mintFunctionName = functionName;
                    break;
                }
            }
            catch
            {
                // Ignore and try the next known mint function shape.
            }
        }

        if (mintFunction is null)
        {
            return new NftMintingResult
            {
                Status = "metadata_ready",
                TokenUri = warranty.MetadataUri,
                Message = "No supported mint function found in NFT contract ABI."
            };
        }

        try
        {
            var mintsWithTokenUri = !string.Equals(mintFunctionName, "mintTo", StringComparison.Ordinal);
            HexBigInteger gas;
            TransactionInput transactionInput;

            if (mintsWithTokenUri)
            {
                gas = await mintFunction.EstimateGasAsync(
                    account.Address,
                    null,
                    null,
                    recipientWallet,
                    warranty.MetadataUri!);

                transactionInput = mintFunction.CreateTransactionInput(
                    account.Address,
                    gas,
                    null,
                    recipientWallet,
                    warranty.MetadataUri!);
            }
            else
            {
                gas = await mintFunction.EstimateGasAsync(
                    account.Address,
                    null,
                    null,
                    recipientWallet);

                transactionInput = mintFunction.CreateTransactionInput(
                    account.Address,
                    gas,
                    null,
                    recipientWallet);
            }

            var receipt = await web3.TransactionManager.SendTransactionAndWaitForReceiptAsync(
                transactionInput,
                cancellationToken: cancellationToken);

            if (receipt.Status is null || receipt.Status.Value == 0)
            {
                return new NftMintingResult
                {
                    Status = "mint_failed",
                    TokenUri = warranty.MetadataUri,
                    TxHash = receipt.TransactionHash,
                    Message = "Mint transaction reverted on-chain."
                };
            }

            return new NftMintingResult
            {
                Minted = true,
                Status = "minted",
                TokenUri = warranty.MetadataUri,
                TxHash = receipt.TransactionHash,
                ChainTokenId = TryExtractTokenId(receipt) ?? warranty.ChainTokenId,
                Message = "NFT minted successfully."
            };
        }
        catch (Exception ex)
        {
            return new NftMintingResult
            {
                Status = "mint_failed",
                TokenUri = warranty.MetadataUri,
                Message = ex.Message
            };
        }
    }

    private async Task<NftMintingResult> MintViaSapphireWorkerAsync(
        string rpcUrl,
        string privateKey,
        string contractAddress,
        string abiPath,
        string recipientWallet,
        string tokenUri,
        CancellationToken cancellationToken)
    {
        var workerScriptPath = ResolveWorkerScriptPath();
        if (workerScriptPath is null)
        {
            return new NftMintingResult
            {
                Status = "mint_failed",
                TokenUri = tokenUri,
                Message = "Sapphire mint worker script not found."
            };
        }

        var startInfo = new ProcessStartInfo
        {
            FileName = "node",
            WorkingDirectory = Path.GetDirectoryName(workerScriptPath)!,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false
        };

        startInfo.ArgumentList.Add(workerScriptPath);
        startInfo.ArgumentList.Add("--rpc-url");
        startInfo.ArgumentList.Add(rpcUrl);
        startInfo.ArgumentList.Add("--private-key");
        startInfo.ArgumentList.Add(privateKey);
        startInfo.ArgumentList.Add("--contract-address");
        startInfo.ArgumentList.Add(contractAddress);
        startInfo.ArgumentList.Add("--abi-path");
        startInfo.ArgumentList.Add(abiPath);
        startInfo.ArgumentList.Add("--recipient-wallet");
        startInfo.ArgumentList.Add(recipientWallet);
        startInfo.ArgumentList.Add("--token-uri");
        startInfo.ArgumentList.Add(tokenUri);

        using var process = new Process { StartInfo = startInfo };
        process.Start();

        var outputTask = process.StandardOutput.ReadToEndAsync(cancellationToken);
        var errorTask = process.StandardError.ReadToEndAsync(cancellationToken);
        await process.WaitForExitAsync(cancellationToken);

        var output = (await outputTask).Trim();
        var error = (await errorTask).Trim();

        if (string.IsNullOrWhiteSpace(output))
        {
            return new NftMintingResult
            {
                Status = "mint_failed",
                TokenUri = tokenUri,
                Message = string.IsNullOrWhiteSpace(error) ? "Sapphire mint worker returned no output." : error
            };
        }

        using var document = JsonDocument.Parse(output);
        var root = document.RootElement;
        var ok = root.TryGetProperty("ok", out var okElement) && okElement.GetBoolean();
        var txHash = root.TryGetProperty("txHash", out var txHashElement) ? txHashElement.GetString() : null;
        var tokenId = root.TryGetProperty("tokenId", out var tokenIdElement) ? tokenIdElement.GetString() : null;
        var message = root.TryGetProperty("message", out var messageElement) ? messageElement.GetString() : null;

        return new NftMintingResult
        {
            Minted = ok,
            Status = ok ? "minted" : "mint_failed",
            TokenUri = tokenUri,
            TxHash = txHash,
            ChainTokenId = tokenId,
            Message = message ?? (ok ? "NFT minted successfully." : "Sapphire mint worker failed.")
        };
    }

    private string? ResolveWorkerScriptPath()
    {
        var candidates = new[]
        {
            Path.Combine(_environment.ContentRootPath, "scripts", "sapphire-mint.mjs"),
            Path.Combine(_environment.ContentRootPath, "..", "..", "..", "scripts", "sapphire-mint.mjs")
        };

        return candidates
            .Select(Path.GetFullPath)
            .FirstOrDefault(File.Exists);
    }

    private static string? TryExtractTokenId(TransactionReceipt receipt)
    {
        const string transferSignatureTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
        var transferLog = receipt.Logs?
            .OfType<FilterLog>()
            .FirstOrDefault(log =>
                log.Topics is { Length: >= 4 } &&
                string.Equals(log.Topics[0]?.ToString(), transferSignatureTopic, StringComparison.OrdinalIgnoreCase));

        var tokenTopic = transferLog?.Topics?[3]?.ToString();
        if (string.IsNullOrWhiteSpace(tokenTopic))
        {
            return null;
        }

        try
        {
            return new HexBigInteger(tokenTopic).Value.ToString();
        }
        catch
        {
            return null;
        }
    }
}

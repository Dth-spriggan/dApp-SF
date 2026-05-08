using Nethereum.ABI.FunctionEncoding;
using Nethereum.Contracts;
using Nethereum.Web3;

public class BlockchainService
{
    private readonly Web3 _web3;
    private readonly string _contractAddress;
    private readonly string _abi;

    public BlockchainService(IConfiguration configuration)
    {
        var rpcUrl = configuration["Blockchain:RpcUrl"];
        _contractAddress = configuration["Blockchain:ContractAddress"];
        _abi = File.ReadAllText("Contracts/EscrowAbi.json");

        _web3 = new Web3(rpcUrl);
    }

    public async Task<List<ParameterOutput>> GetOrderAsync(long orderId)
    {
        var contract = _web3.Eth.GetContract(_abi, _contractAddress);
        var function = contract.GetFunction("getOrder");
        return await function.CallDecodingToDefaultAsync(orderId);
    }
}

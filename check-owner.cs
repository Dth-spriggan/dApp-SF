using System;
using System.Threading.Tasks;
using Nethereum.Web3;

var rpc = "https://testnet.sapphire.oasis.dev";
var contractAddress = "0x06e44A028D139a842b880Cf0D46fBaBB23f16595";
var abi = @"[
  {
    ""inputs"": [{""internalType"":""uint256"",""name"":""tokenId"",""type"":""uint256""}],
    ""name"": ""ownerOf"",
    ""outputs"": [{""internalType"":""address"",""name"":"""",""type"":""address""}],
    ""stateMutability"": ""view"",
    ""type"": ""function""
  },
  {
    ""inputs"": [{""internalType"":""uint256"",""name"":""tokenId"",""type"":""uint256""}],
    ""name"": ""tokenURI"",
    ""outputs"": [{""internalType"":""string"",""name"":"""",""type"":""string""}],
    ""stateMutability"": ""view"",
    ""type"": ""function""
  }
]";

var web3 = new Web3(rpc);
var contract = web3.Eth.GetContract(abi, contractAddress);
var ownerFn = contract.GetFunction("ownerOf");
var uriFn = contract.GetFunction("tokenURI");
try
{
    var owner = await ownerFn.CallAsync<string>(12);
    var uri = await uriFn.CallAsync<string>(12);
    Console.WriteLine($"OWNER={owner}");
    Console.WriteLine($"TOKEN_URI={uri}");
}
catch (Exception ex)
{
    Console.WriteLine("ERROR=" + ex.Message);
}

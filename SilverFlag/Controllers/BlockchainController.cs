using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/blockchain")]
public class BlockchainController : ControllerBase
{
    private readonly BlockchainService _blockchainService;

    public BlockchainController(BlockchainService blockchainService)
    {
        _blockchainService = blockchainService;
    }

    [HttpGet("order/{id}")]
    public async Task<IActionResult> GetOrder(long id)
    {
        var result = await _blockchainService.GetOrderAsync(id);
        return Ok(result);
    }
}

using System.Collections.Concurrent;

namespace PC_dapp.Models;

public class PendingCryptoCheckoutStore
{
    private readonly ConcurrentDictionary<string, CheckoutDto> _pendingCheckouts = new();

    public string Save(CheckoutDto checkout)
    {
        var checkoutId = Guid.NewGuid().ToString("N");
        _pendingCheckouts[checkoutId] = checkout;
        return checkoutId;
    }

    public bool TryGet(string checkoutId, out CheckoutDto? checkout)
    {
        return _pendingCheckouts.TryGetValue(checkoutId, out checkout);
    }

    public bool Remove(string checkoutId, out CheckoutDto? checkout)
    {
        return _pendingCheckouts.TryRemove(checkoutId, out checkout);
    }
}

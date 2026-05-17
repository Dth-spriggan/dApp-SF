const ESCROW_CONTRACT_ADDRESS = '0xdc251d82647e3FA2c4D5200eCcd3622b85d61263';
const ESCROW_SAPPHIRE_TESTNET = {
  chainId: '0x5aff',
  chainName: 'Oasis Sapphire Testnet',
  nativeCurrency: {
    name: 'TEST',
    symbol: 'TEST',
    decimals: 18,
  },
  rpcUrls: ['https://testnet.sapphire.oasis.dev'],
  blockExplorerUrls: ['https://explorer.oasis.io/testnet/sapphire']
};

const ESCROW_ABI = [
  'function confirmDelivery(uint256 orderId)',
  'function getOrder(uint256 orderId) view returns (address buyer, address seller, uint256 amount, uint8 status)',
  'function refundBuyer(uint256 orderId)'
];

function getEthereumProvider() {
  if (window.ethereum) {
    if (window.ethereum.providers) {
      return window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum;
    }
    return window.ethereum;
  }
  return null;
}

async function ensureEscrowSapphireNetwork() {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('Không tìm thấy MetaMask trong trình duyệt hiện tại.');
  }

  const currentChainId = await provider.request({ method: 'eth_chainId' });
  if (currentChainId === ESCROW_SAPPHIRE_TESTNET.chainId) {
    return;
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ESCROW_SAPPHIRE_TESTNET.chainId }]
    });
  } catch (error) {
    if (error?.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [ESCROW_SAPPHIRE_TESTNET]
      });
      return;
    }

    throw error;
  }
}

async function executeAdminRefund(orderId, chainOrderId) {
  if (typeof ethers === 'undefined') {
    alert('Chưa tải thư viện ethers.js để thao tác với MetaMask.');
    return;
  }

  try {
    await ensureEscrowSapphireNetwork();
    const provider = new ethers.BrowserProvider(getEthereumProvider());
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
    alert('Đang chờ xác nhận giao dịch hoàn tiền trong MetaMask...');
    const tx = await contract.refundBuyer(BigInt(chainOrderId));
    
    // Đợi giao dịch được xác nhận
    await tx.wait();

    // Gửi lên server
    const response = await fetch(`/api/checkout/orders/${orderId}/confirm-refund`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txHash: tx.hash })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi từ server');
    }

    alert('✅ Hoàn tiền thành công!');
    window.location.reload();

  } catch (err) {
    alert(err?.message || 'Không thể thực hiện hoàn tiền.');
  }
}

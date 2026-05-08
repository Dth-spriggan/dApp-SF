import fs from 'node:fs/promises';
import { Contract, Interface, JsonRpcProvider, Wallet } from 'ethers';
import { NETWORKS, wrapEthersSigner } from '@oasisprotocol/sapphire-ethers-v6';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key?.startsWith('--') || value == null) {
      throw new Error(`Invalid argument pair near: ${key ?? '<missing>'}`);
    }
    args[key.slice(2)] = value;
  }
  return args;
}

function fail(message, extra = {}) {
  process.stdout.write(JSON.stringify({
    ok: false,
    message,
    ...extra,
  }));
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv);
  const required = ['rpc-url', 'private-key', 'contract-address', 'abi-path', 'recipient-wallet', 'token-uri'];
  for (const key of required) {
    if (!args[key]) {
      fail(`Missing required argument --${key}`);
    }
  }

  const abiRaw = await fs.readFile(args['abi-path'], 'utf8');
  const abiJson = JSON.parse(abiRaw);
  const abi = Array.isArray(abiJson) ? abiJson : abiJson.abi;
  if (!Array.isArray(abi)) {
    fail('ABI file does not contain a valid ABI array.');
  }

  const rpcUrl = args['rpc-url'].includes('sapphire')
    ? NETWORKS.testnet.defaultGateway
    : args['rpc-url'];

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = wrapEthersSigner(new Wallet(args['private-key']).connect(provider));
  const contract = new Contract(args['contract-address'], abi, signer);
  const iface = new Interface(abi);

  let tx;
  if (typeof contract.mintTo === 'function') {
    tx = await contract.mintTo(args['recipient-wallet']);
  } else if (typeof contract.safeMint === 'function') {
    tx = await contract.safeMint(args['recipient-wallet'], args['token-uri']);
  } else if (typeof contract.mint === 'function') {
    tx = await contract.mint(args['recipient-wallet'], args['token-uri']);
  } else {
    fail('No supported mint function found in NFT contract ABI.');
  }

  const receipt = await tx.wait();
  const receiptSucceeded =
    !!receipt &&
    (receipt.status === 1 ||
      receipt.status === 1n ||
      receipt.status?.toString?.() === '1');

  if (!receiptSucceeded) {
    fail('Mint transaction reverted on-chain.', {
      txHash: tx.hash,
    });
  }

  let tokenId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === 'WarrantyMinted') {
        tokenId = parsed.args?.tokenId?.toString() ?? tokenId;
        break;
      }
      if (parsed?.name === 'Transfer') {
        tokenId = parsed.args?.tokenId?.toString() ?? tokenId;
      }
    } catch {
      // Ignore unrelated logs.
    }
  }

  process.stdout.write(JSON.stringify({
    ok: true,
    txHash: tx.hash,
    tokenId,
  }));
}

main().catch((error) => {
  fail(error?.shortMessage || error?.reason || error?.message || 'Unknown Sapphire mint error.');
});

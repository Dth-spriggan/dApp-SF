import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { ContractFactory, JsonRpcProvider, Wallet } from 'ethers';
import { NETWORKS, wrapEthersProvider, wrapEthersSigner } from '@oasisprotocol/sapphire-ethers-v6';

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

const args = parseArgs(process.argv);
const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const compileScriptPath = path.join(scriptDir, 'compile-warranty-nft.mjs');
const rpcUrl = args['rpc-url']?.includes('sapphire')
  ? NETWORKS.testnet.defaultGateway
  : args['rpc-url'];

if (!rpcUrl || !args['private-key']) {
  process.stdout.write(JSON.stringify({
    ok: false,
    message: 'Missing required arguments.',
  }));
  process.exit(1);
}

const { stdout } = await execFileAsync(
  'node',
  [compileScriptPath],
  { cwd: projectRoot }
);

const artifact = JSON.parse(stdout);
const provider = wrapEthersProvider(new JsonRpcProvider(rpcUrl));
const signer = wrapEthersSigner(new Wallet(args['private-key'], provider));
const owner = await signer.getAddress();

const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer);
const contract = await factory.deploy(owner);
await contract.waitForDeployment();

process.stdout.write(JSON.stringify({
  ok: true,
  owner,
  contractAddress: await contract.getAddress(),
}));

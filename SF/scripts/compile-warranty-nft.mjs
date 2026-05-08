import fs from 'node:fs';
import path from 'node:path';
import solc from 'solc';

const projectRoot = process.cwd();
const contractPath = path.join(projectRoot, 'Contracts', 'WarrantyNFT.sol');
const source = fs.readFileSync(contractPath, 'utf8');

function findImports(importPath) {
  const fullPath = path.join(projectRoot, 'node_modules', importPath);
  if (fs.existsSync(fullPath)) {
    return { contents: fs.readFileSync(fullPath, 'utf8') };
  }

  return { error: `File not found: ${importPath}` };
}

const input = {
  language: 'Solidity',
  sources: {
    'Contracts/WarrantyNFT.sol': { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
if (output.errors) {
  const hardErrors = output.errors.filter((entry) => entry.severity === 'error');
  if (hardErrors.length) {
    console.error(JSON.stringify(hardErrors, null, 2));
    process.exit(1);
  }
}

const contract = output.contracts['Contracts/WarrantyNFT.sol']?.WarrantyNFT;
if (!contract) {
  console.error('Compiled contract WarrantyNFT not found.');
  process.exit(1);
}

process.stdout.write(JSON.stringify({
  abi: contract.abi,
  bytecode: `0x${contract.evm.bytecode.object}`,
}));

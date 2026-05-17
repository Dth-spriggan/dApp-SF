# Escrow Verify Info

## Current deployed contract

The currently deployed escrow contract can only be verified as a runtime match on Oasis.

Reason:
- it was deployed through a Sapphire-encrypted deployment flow
- Oasis/Sourcify cannot match the creation bytecode in that case

## Clean full-verify setup for the next deployment

Use these files for the next escrow deployment if you want Oasis Explorer to show the contract as fully verified:

- `Contracts/verify/Escrow.full-verify.hardhat.config.ts`
- `Contracts/verify/Escrow.full-verify.deploy.ts`
- `Contracts/verify/Escrow.standard-input.json`
- `Contracts/verify/Escrow.constructor-args.txt`

Important:
- do not import `@oasisprotocol/sapphire-hardhat` in the deploy config used for the full-verify deployment
- deploy with `solc 0.8.28`
- use `evmVersion: paris`
- keep optimizer enabled with `runs: 1000`

Contract identifier:
`contracts/Escrow.sol:Escrow`

Compiler:
`0.8.28`

EVM version:
`paris`

Optimizer:
`enabled`

Runs:
`1000`

## Manual verification

Use `Escrow.standard-input.json` when the explorer supports **Standard JSON Input** upload.

If the explorer asks for constructor arguments, this contract needs exactly one argument:
- `_seller` as `address`

You must replace the placeholder in `Escrow.constructor-args.txt` with the ABI-encoded seller address used at deploy time.

Examples to encode `_seller`:

Using `cast`:
```bash
cast abi-encode "constructor(address)" 0xYourSellerAddress
```

Using `ethers`:
```js
ethers.AbiCoder.defaultAbiCoder().encode(["address"], ["0xYourSellerAddress"])
```

If the explorer asks for source path / contract name manually, use:
- Source path: `contracts/Escrow.sol`
- Contract name: `Escrow`

## Suggested commands

Compile and deploy with the clean config:

```bash
npx hardhat compile --config Contracts/verify/Escrow.full-verify.hardhat.config.ts
npx hardhat run Contracts/verify/Escrow.full-verify.deploy.ts --network sapphireTestnet --config Contracts/verify/Escrow.full-verify.hardhat.config.ts
```

After deployment, verify with Sourcify/Explorer using:
- contract address from deployment output
- `Contracts/verify/Escrow.standard-input.json`
- constructor args from `Escrow.constructor-args.txt`

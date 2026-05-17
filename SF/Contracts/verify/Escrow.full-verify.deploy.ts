import { ethers } from "hardhat";
import { getAddress } from "ethers";

async function main() {
  const seller = process.env.SELLER_ADDRESS;

  if (!seller) {
    throw new Error("Missing SELLER_ADDRESS in environment");
  }

  const sellerAddress = getAddress(seller);
  const Escrow = await ethers.getContractFactory("Escrow");
  const contract = await Escrow.deploy(sellerAddress);

  await contract.waitForDeployment();

  console.log("Escrow deployed to:", await contract.getAddress());
  console.log("Seller:", sellerAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

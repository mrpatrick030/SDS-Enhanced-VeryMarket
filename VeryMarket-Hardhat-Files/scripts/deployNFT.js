const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying ReceiptNFT with owner:", deployer.address);

  const ReceiptNFT = await hre.ethers.getContractFactory("ReceiptNFT");
  const receiptNFT = await ReceiptNFT.deploy("0xB13C1A2628CC64a4bBdc2f31581A4EF8aF8198Eb", deployer.address);
  await receiptNFT.waitForDeployment();
  const address = await receiptNFT.getAddress();

  console.log("ReceiptNFT deployed to:", address);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});


// deployment code
// npx hardhat run scripts/deployNFT.js --network somniaTestnet

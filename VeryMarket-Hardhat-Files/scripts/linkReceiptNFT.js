const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // deployed contract addresses
  const MARKETPLACE_ADDRESS = "0x0562eEB4Cd1AF649ffa18f4f3a1A50F2D7899f6e";
  const RECEIPT_NFT_ADDRESS = "0xf86470d61b01aE6546C08814ACeec442E42625Dc";

  console.log("Linking ReceiptNFT to Marketplace...");
  console.log("Deployer:", deployer.address);

  // Get Marketplace instance
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = Marketplace.attach(MARKETPLACE_ADDRESS);

  // Call setReceiptNFT
  const tx = await marketplace.setReceiptNFT(RECEIPT_NFT_ADDRESS);
  await tx.wait();

  console.log(`✅ ReceiptNFT successfully linked!`);
  console.log(`Marketplace: ${MARKETPLACE_ADDRESS}`);
  console.log(`ReceiptNFT: ${RECEIPT_NFT_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.log("❌ Error linking contracts:", error);
    process.exit(1);
  });

  // npx hardhat run scripts/linkReceiptNFT.js --network somniaTestnet
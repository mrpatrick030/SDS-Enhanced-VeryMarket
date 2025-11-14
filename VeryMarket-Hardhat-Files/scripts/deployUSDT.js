const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying USDT with owner:", deployer.address);

  const SomniaToken = await hre.ethers.getContractFactory("SomniaUSDT");
  const somniaToken = await SomniaToken.deploy();
  await somniaToken.waitForDeployment();
  const address = await somniaToken.getAddress();

  console.log("USDT deployed to:", address);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});


// deployment code
// npx hardhat run scripts/deployUSDT.js --network somniaTestnet

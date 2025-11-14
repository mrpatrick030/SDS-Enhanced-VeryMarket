const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying token with owner:", deployer.address);

  const SomniaToken = await hre.ethers.getContractFactory("SomniaDAI");
  const somniaToken = await SomniaToken.deploy();
  await somniaToken.waitForDeployment();
  const address = await somniaToken.getAddress();

  console.log("DAI deployed to:", address);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});


// deployment code
// npx hardhat run scripts/deployDAI.js --network somniaTestnet

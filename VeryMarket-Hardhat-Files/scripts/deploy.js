const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
      // Get deployer's wallet
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with address:", deployer.address);

      //Defining constructor arguments
  const feeBps = 200; //2% fee
  const feeCollector = "0x82aD97bEf0b7E17b1D30f56e592Fc819E1eeDAfc"; 
  const mediator = "0x82aD97bEf0b7E17b1D30f56e592Fc819E1eeDAfc"; 
  const initialTokens = [
    "0xA3b05E5Fe445F34E2F14683430F5eB6Cc5EE81B0",
    "0x79f0da8c3265C99655bC1d1B5E0A2E530d3a0306",
    "0x0628D6F7D69546C9a520e583968A1aaFe530A99A",
    "0x0000000000000000000000000000000000000000"
  ];
  
  //Get the contract factory and deploy
  const VeryMarket = await hre.ethers.getContractFactory("Marketplace");
  const contract = await VeryMarket.deploy(feeBps, feeCollector, mediator, initialTokens);

  //Wait for deployment
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  //Save deployed info and ABI to a JSON file
  const output = { address };
  const outputPath = path.join(__dirname, "../deployed.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  //Log everything to console
  console.log("✅ Contract deployed to:", address);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});


// deployment code
// npx hardhat run scripts/deploy.js --network somniaTestnet

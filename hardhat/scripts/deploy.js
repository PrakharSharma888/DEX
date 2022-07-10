require("dotenv").config({ path: ".env" });
const {hre, ethers} = require("hardhat");
const {CRYPTODEV_CONTRACT_ADDRESS} = require('../Constrants/index')

async function main() {

  

  const dexContract = await ethers.getContractFactory("Exchange");
  const deployedDexContract = await dexContract.deploy(
    CRYPTODEV_CONTRACT_ADDRESS
  );

  await deployedDexContract.deployed();

  console.log("DEX deployed to:", deployedDexContract.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

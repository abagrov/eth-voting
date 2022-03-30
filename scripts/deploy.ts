import _ from "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const factory = await ethers.getContractFactory("ReferendumContract");
  const contract = await factory.deploy();

  await contract.deployed();

  console.log("ReferendumContract deployed to:", `https://rinkeby.etherscan.io/address/${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "solidity-coverage";
import { config as dotEnvConfig } from "dotenv";
import "./tasks/interact";

dotEnvConfig();
const { ALCHEMY_URL, CONTRACT_PRIVATE } = process.env;

export default {
  solidity: "0.8.13",
  defaultNetwork: "hardhat",
   networks: {
      hardhat: {},
      rinkeby: {
         url: ALCHEMY_URL,
         accounts: [`0x${CONTRACT_PRIVATE}`]
      }
   },
};
import { Contract, ethers } from "ethers";
import { getContractAt } from "@nomiclabs/hardhat-ethers/internal/helpers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { env } from "./env";
import { getProvider } from "./provider";

export function getContract(
  name: string,
  hre: HardhatRuntimeEnvironment
): Promise<Contract> {
  const WALLET = new ethers.Wallet(env("CONTRACT_PRIVATE"), getProvider());
  return getContractAt(hre, name, env("CONTRACT_ADDRESS"), WALLET);
}
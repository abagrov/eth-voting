import { ethers } from "ethers";
import { env } from "./env";
import { getProvider } from "./provider";

export function getWallet(name: string): ethers.Wallet {
    return new ethers.Wallet(env(name), getProvider());
}

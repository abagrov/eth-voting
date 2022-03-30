import { task, types } from "hardhat/config";
import { Contract } from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { env } from "../lib/env";
import { getContract } from "../lib/contract";
import { getWallet } from "../lib/wallet";
import { getAddress, isAddress, parseEther } from "ethers/lib/utils";


task("add", "Add referendum")
    .addParam("name", "Name of referendum", undefined, types.string)
    .setAction(async (taskArgs, hre) => {
        return getContract("ReferendumContract", hre)
            .then((contract: Contract) => {
                console.log(taskArgs.name);
                return contract.addReferendum(taskArgs.name, { gasLimit: 500_000, });
            })
            .then((tr: TransactionResponse) => {
                process.stdout.write(`TX hash: https://rinkeby.etherscan.io/tx/${tr.hash}`);
            });
    });

task("vote", "Vote in referendum")
    .addParam("id", "Id of referendum to vote.", undefined, types.int)
    .addParam("voter", "Who is voting - key from .env with private key value.", undefined, types.string)
    .addParam("candidate", "Address of candidate - address as string or key from .env with address value.", undefined, types.string)
    .setAction(async (taskArgs, hre) => {
        return getContract("ReferendumContract", hre)
            .then((contract: Contract) => {
                const voter = getWallet(taskArgs.voter);
                const candidate = isAddress(taskArgs.candidate) ? getAddress(taskArgs.candidate) : getAddress(env(taskArgs.candidate))
                return contract.connect(voter).vote(taskArgs.id, candidate, { value: parseEther("0.01"), gasLimit: 500_000, });
            })
            .then((tr: TransactionResponse) => {
                process.stdout.write(`TX: https://rinkeby.etherscan.io/tx/${tr.hash}`);
            });
    });

task("end", "End referendum")
    .addParam("id", "Id of referendum to end.", undefined, types.int)
    .setAction(async (taskArgs, hre) => {
        return getContract("ReferendumContract", hre)
            .then((contract: Contract) => {
                return contract.endReferendum(taskArgs.id, { gasLimit: 500_000, });
            })
            .then((tr: TransactionResponse) => {
                process.stdout.write(`TX: https://rinkeby.etherscan.io/tx/${tr.hash}`);
            });
    });

task("withdraw", "Withdraw funds from contract.")
    .addParam("amount", "Amount of funds to be withdrawed. Provide 0 for all avaliable funds.", undefined, types.int)
    .addParam("address", "Address where funds will be transfered. Provide address as string or key from .env with address value.", undefined, types.string)
    .setAction(async (taskArgs, hre) => {
        return getContract("ReferendumContract", hre)
            .then((contract: Contract) => {
                const address = isAddress(taskArgs.address) ? getAddress(taskArgs.address) : getAddress(env(taskArgs.address))
                return contract.withdraw(address, taskArgs.amount, { gasLimit: 500_000, });
            })
            .then((tr: TransactionResponse) => {
                process.stdout.write(`TX: https://rinkeby.etherscan.io/tx/${tr.hash}`);
            });
    });

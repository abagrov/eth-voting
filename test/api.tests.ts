import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import _ from "@nomiclabs/hardhat-waffle";
import chai from "chai"
import { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
chai.use(solidity);


describe("Api tests", function () {
    let factory;
    let contract: Contract;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let addrs: SignerWithAddress[];

    beforeEach(async function () {
        factory = await ethers.getContractFactory("ReferendumContract");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        contract = await factory.deploy();
    });

    describe("Api calls", function () {
        it("Should return number of referendums", async function () {

            expect(await contract.getReferendumCount()).to.equal(0);

            await contract.addReferendum("Test");

            expect(await contract.getReferendumCount()).to.equal(1);
        });

        it("Add some referedums and get their names", async function () {
            await contract.addReferendum("Test");
            await contract.addReferendum("Hello");
            await contract.addReferendum("Third");

            const names = await contract.getReferendums(0, 10);

            expect(names[1][0]).to.equal(BigNumber.from(2));//id

            await expect(contract.getReferendums(4, 10))
                .to.be.revertedWith("Offset is more than referendums.");

            await expect(contract.getReferendums(0, 150))
                .to.be.revertedWith("Only 100 items per request.");
        });

        it("Add two candidates and retrieve them", async function () {
            await contract.addReferendum("Test");

            await contract.vote(1, addr2.address, { value: ethers.utils.parseEther("0.01") });
            await contract.connect(addr1).vote(1, addr1.address, { value: ethers.utils.parseEther("0.01") });

            const candidates = await contract.getCandidates(1);

            expect(candidates).to.eql([addr2.address, addr1.address]);
        });
    });
});

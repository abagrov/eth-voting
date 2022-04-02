import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import _ from "@nomiclabs/hardhat-waffle";
import chai from "chai"
import { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
chai.use(solidity);

describe("Referendum contract", function () {
  let factory;
  let contract: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const THREE_DAYS = 3 * 24 * 60 * 60;
  const DEFAULT_ADDRESS = "0x0000000000000000000000000000000000000000";

  beforeEach(async function () {
    factory = await ethers.getContractFactory("ReferendumContract");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    contract = await factory.deploy();
  });

  describe("Add referendum", function () {
    it("Should return number of referendums", async function () {

      expect(await contract.getReferendumCount()).to.equal(0);

      await contract.addReferendum("Test");

      expect(await contract.getReferendumCount()).to.equal(1);
    });

    it("Adding referendum by stranger is prohibited and should fail", async function () {

      expect(await contract.getReferendumCount()).to.equal(0);

      await expect(contract.connect(addr1).addReferendum("Test"))
        .to.be.reverted;
    });
  });

  describe("Vote tests", function () {
    it("Reverted if referedum id is wrong", async function () {
      await contract.addReferendum("Test");

      await expect(contract.connect(addr1).vote(0, addr2.address, { value: parseEther("0.009") }))
        .to.be.revertedWith("Wrong referendum Id.");
    });

    it("Reverted if candidate address is wrong", async function () {
      await contract.addReferendum("Test");

      await expect(contract.connect(addr1).vote(1, DEFAULT_ADDRESS, { value: parseEther("0.009") }))
        .to.be.revertedWith("Wrong address.");
    });

    it("Vote must be counted if value is ok", async function () {
      await contract.addReferendum("Test");

      await contract.connect(addr1).vote(1, addr2.address, { value: parseEther("0.01") })

      expect(await contract.getCandidateVoteCount(1, addr2.address)).to.equal(1)
      expect(await contract.getCandidateVoteCount(1, addr1.address)).to.equal(0)

    });

    it("Reverted if value is not ok", async function () {
      await contract.addReferendum("Test");

      await expect(contract.connect(addr1).vote(1, addr2.address, { value: parseEther("0.009") }))
        .to.be.revertedWith("Making vote costs more than you provided.");
    });

    it("Voting two times causes error", async function () {
      await contract.addReferendum("Test");

      await contract.vote(1, addr2.address, { value: parseEther("0.01") })

      expect(contract.vote(1, addr2.address, { value: parseEther("0.01") }))
        .to.be.revertedWith("You already voted in this referendum.");
    });

    it("Vote ends, cant vote anymore, ether transfered to winner, commission transfed to onwer", async function () {
      await contract.addReferendum("Test");

      await contract.vote(1, addr2.address, { value: parseEther("0.01") });
      await contract.connect(addr1).vote(1, addr1.address, { value: parseEther("0.01") });
      await contract.connect(addr2).vote(1, addr1.address, { value: parseEther("0.01") });
      await contract.connect(addrs[0]).vote(1, addr1.address, { value: parseEther("0.01") });

      await expect(contract.endReferendum(1))
        .to.be.revertedWith("Less than three days have passed since the beginning of the referendum.");

      await ethers.provider.send('evm_increaseTime', [THREE_DAYS]);
      await ethers.provider.send('evm_mine', []);

      await expect((await contract.endReferendum(1)))
        .to.changeEtherBalance(addr1, parseEther("0.036"))

      expect(await contract.provider.getBalance(contract.address)).to.equal(parseEther("0.004"));

      await expect(contract.connect(addrs[1]).vote(1, addr2.address, { value: parseEther("0.01") }))
        .to.be.revertedWith("Referendum already ended.");

      await expect(contract.endReferendum(1)).to.be.revertedWith("Referendum already ended.");

      await expect(contract.connect(addr1).withdraw(addr1.address)).to.be.reverted;
      await expect(contract.withdraw(DEFAULT_ADDRESS)).to.be.reverted;

      await expect((await contract.withdraw(addr1.address, parseEther("0.004"))))
        .to.changeEtherBalance(addr1, parseEther("0.004"))
    });

    it("Cant end vote with no candidates", async function () {
      await contract.addReferendum("Test");

      await ethers.provider.send('evm_increaseTime', [THREE_DAYS]);
      await ethers.provider.send('evm_mine', []);

      await expect(contract.endReferendum(1))
        .to.be.revertedWith("Seems like no one made a vote.");
    });

    it("Cant end vote with two or more candidates with same votes", async function () {
      await contract.addReferendum("Test");

      await contract.vote(1, addr1.address, { value: parseEther("0.01") });
      await contract.connect(addr1).vote(1, addr1.address, { value: parseEther("0.01") });

      await contract.connect(addrs[1]).vote(1, owner.address, { value: parseEther("0.01") });

      await contract.connect(addr2).vote(1, addr2.address, { value: parseEther("0.01") });
      await contract.connect(addrs[0]).vote(1, addr2.address, { value: parseEther("0.01") });

      await ethers.provider.send('evm_increaseTime', [THREE_DAYS]);
      await ethers.provider.send('evm_mine', []);

      await expect(contract.endReferendum(1))
        .to.be.revertedWith("Two or more winners, cant end referendum.");

      await contract.connect(addrs[2]).vote(1, addr2.address, { value: parseEther("0.01") });
      await expect(await contract.endReferendum(1))
        .to.changeEtherBalance(addr2, parseEther("0.054"))
    });

    it("Withdraw only by owner, reverted if amount more than commission even sufficient funds", async function () {
      await contract.addReferendum("Test");
      await contract.addReferendum("Test1");

      await ethers.provider.send('evm_increaseTime', [THREE_DAYS]);
      await ethers.provider.send('evm_mine', []);

      await contract.vote(1, addr1.address, { value: parseEther("0.01") });

      await expect(contract.connect(addr1).withdraw(owner.address, parseEther("0.00001")))
        .to.be.reverted;

      await expect(contract.withdraw(owner.address, parseEther("0.005")))
        .to.be.revertedWith("Amount is more than avaliable balance.");

      await expect(await contract.withdraw(owner.address, parseEther("0")))
        .to.changeEtherBalance(owner, parseEther("0.001"));

      await contract.withdraw(owner.address, parseEther("0"));

      await contract.endReferendum(1);

      await contract.vote(2, addr1.address, { value: parseEther("0.01") });
      await contract.connect(addr1).vote(2, addr1.address, { value: parseEther("0.01") });
      await contract.connect(addr2).vote(2, addr1.address, { value: parseEther("0.01") });
      await contract.connect(addrs[0]).vote(2, addr1.address, { value: parseEther("0.01") });

      await expect(contract.withdraw(DEFAULT_ADDRESS, parseEther("0")))
        .to.be.reverted;

      await expect(await contract.withdraw(owner.address, parseEther("0")))
        .to.changeEtherBalance(owner, parseEther("0.004"));

      await contract.endReferendum(2);
    });
  });
});



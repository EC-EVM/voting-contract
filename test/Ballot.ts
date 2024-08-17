import { expect } from "chai";
import { toHex, hexToString } from "viem";
import { viem } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function deployContract() {
  const publicClient = await viem.getPublicClient();
  const [deployer, otherAccount] = await viem.getWalletClients();
  const ballotContract = await viem.deployContract("Ballot", [
    PROPOSALS.map((prop) => toHex(prop, { size: 32 })),
  ]);
  return { publicClient, deployer, otherAccount, ballotContract };
}

describe("Ballot", async () => {
  describe("when the contract is deployed", async () => {
    it("has the provided proposals", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.read.proposals([BigInt(index)]);
        expect(hexToString(proposal[0], { size: 32 })).to.eq(PROPOSALS[index]);
      }
    });

    it("has zero votes for all proposals", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.read.proposals([BigInt(index)]);
        expect(proposal[1]).to.eq(0n);
      }
    });

    it("sets the deployer address as chairperson", async () => {
      const { ballotContract, deployer } = await loadFixture(deployContract);
      const chairperson = await ballotContract.read.chairperson();
      expect(chairperson.toLowerCase()).to.eq(deployer.account.address);
    });

    it("sets the voting weight for the chairperson as 1", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const chairperson = await ballotContract.read.chairperson();
      const chairpersonVoter = await ballotContract.read.voters([chairperson]);
      expect(chairpersonVoter[0]).to.eq(1n);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("gives right to vote for another address", async () => {
      const { ballotContract, deployer, otherAccount, publicClient } = await loadFixture(deployContract);
      const otherAddress = otherAccount.account.address

      const txHash = await ballotContract.write.giveRightToVote([otherAddress]);
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      expect(receipt.status).to.equal("success");

      const newVoter = await ballotContract.read.voters([otherAddress]);
      expect(newVoter[0]).to.eq(1n);
    });
    it("can not give right to vote for someone that has voted", async () => {
      const { ballotContract, deployer, otherAccount, publicClient } = await loadFixture(deployContract);
      const otherAddress = otherAccount.account.address

      const txHash = await ballotContract.write.giveRightToVote([otherAddress]);
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      expect(receipt.status).to.equal("success");

      const newVoter = await ballotContract.read.voters([otherAddress]);
      expect(newVoter[0]).to.eq(1n);

      const ballotContractAsOtherAccount = await viem.getContractAt(
        "Ballot",
        ballotContract.address,
        { client: { wallet: otherAccount } }
      );
      const txHash2 = await ballotContractAsOtherAccount.write.vote([0]);
      const receipt2 = await publicClient.getTransactionReceipt({ hash: txHash2 });
      expect(receipt2.status).to.equal("success");

      const voter = await ballotContract.read.voters([otherAccount.account.address]);
      expect(voter[1]).to.eq(true);

      await expect(
        ballotContract.write.giveRightToVote([otherAddress])
      ).to.be.rejectedWith("The voter already voted.");
    });
    it("can not give right to vote for someone that has already voting rights", async () => {
      const { ballotContract, deployer, otherAccount, publicClient } = await loadFixture(deployContract);
      const otherAddress = otherAccount.account.address

      const txHash = await ballotContract.write.giveRightToVote([otherAddress]);
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      expect(receipt.status).to.equal("success");

      const newVoter = await ballotContract.read.voters([otherAddress]);
      expect(newVoter[0]).to.eq(1n);

      await expect(
        ballotContract.write.giveRightToVote([otherAddress])
      ).to.be.rejected;
    });
  });

  describe("when the voter interacts with the vote function in the contract", async () => {
    it("should register the vote", async () => {
      const { ballotContract, deployer, publicClient } = await loadFixture(deployContract);

      const txHash = await ballotContract.write.vote([2]);
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      expect(receipt.status).to.equal("success");

      const voter = await ballotContract.read.voters([deployer.account.address]);
      expect(voter[1]).to.eq(true);
      expect(voter[3]).to.eq(2n);

      const proposal = await ballotContract.read.proposals([2n]);
      expect(proposal[1]).to.eq(1n);
    });
  });

  describe("when the voter interacts with the delegate function in the contract", async () => {
    it("should transfer voting power", async () => {
      const { ballotContract, deployer, otherAccount, publicClient } = await loadFixture(deployContract);
      const otherAddress = otherAccount.account.address;
      const delegateAddress = deployer.account.address;

      const txHash = await ballotContract.write.giveRightToVote([otherAddress]);
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      expect(receipt.status).to.equal("success");

      const newVoter = await ballotContract.read.voters([otherAddress]);
      expect(newVoter[0]).to.eq(1n);

      const ballotContractAsOtherAccount = await viem.getContractAt(
        "Ballot",
        ballotContract.address,
        { client: { wallet: otherAccount } }
      );
      const txHash2 = await ballotContractAsOtherAccount.write.delegate([delegateAddress]);
      const receipt2 = await publicClient.getTransactionReceipt({ hash: txHash2 });
      expect(receipt2.status).to.equal("success");

      const updatedVoter = await ballotContract.read.voters([otherAddress]);
      expect(updatedVoter[1]).to.eq(true);
      expect(updatedVoter[2].toLowerCase()).to.eq(delegateAddress);

      const delegateVoter = await ballotContract.read.voters([delegateAddress]);
      expect(delegateVoter[0]).to.eq(2n);
    });
  });

  describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("should revert", async () => {
      const { ballotContract, deployer, otherAccount, publicClient } = await loadFixture(deployContract);
      const otherAddress = otherAccount.account.address

      const ballotContractAsOtherAccount = await viem.getContractAt(
        "Ballot",
        ballotContract.address,
        { client: { wallet: otherAccount } }
      );
      await expect(
        ballotContractAsOtherAccount.write.giveRightToVote([otherAddress])
      ).to.be.rejectedWith("Only chairperson can give right to vote.");

      const otherVoter = await ballotContract.read.voters([otherAddress]);
      expect(otherVoter[0]).to.eq(0n);
    });
  });

  describe("when an account without right to vote interacts with the vote function in the contract", async () => {
    it("should revert", async () => {
      const { ballotContract, deployer, otherAccount, publicClient } = await loadFixture(deployContract);
      const otherAddress = otherAccount.account.address

      const ballotContractAsOtherAccount = await viem.getContractAt(
        "Ballot",
        ballotContract.address,
        { client: { wallet: otherAccount } }
      );
      await expect(
        ballotContractAsOtherAccount.write.vote([2n])
      ).to.be.rejectedWith("Has no right to vote");

      const proposal = await ballotContract.read.proposals([2n]);
      expect(proposal[1]).to.eq(0n);
    });
  });

  describe("when an account without right to vote interacts with the delegate function in the contract", async () => {
    it("should revert", async () => {
      const { ballotContract, deployer, otherAccount, publicClient } = await loadFixture(deployContract);
      const otherAddress = otherAccount.account.address
      const delegateAddress = deployer.account.address;

      const ballotContractAsOtherAccount = await viem.getContractAt(
        "Ballot",
        ballotContract.address,
        { client: { wallet: otherAccount } }
      );
      await expect(
        ballotContractAsOtherAccount.write.delegate([delegateAddress])
      ).to.be.rejectedWith("You have no right to vote");

      const updatedVoter = await ballotContract.read.voters([otherAddress]);
      expect(updatedVoter[1]).to.eq(false);

      const delegateVoter = await ballotContract.read.voters([delegateAddress]);
      expect(delegateVoter[0]).to.eq(1n);
    });
  });

  describe("when someone interacts with the winningProposal function before any votes are cast", async () => {
    it("should return 0", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const winningProposal = await ballotContract.read.winningProposal();
      expect(winningProposal).to.eq(0n);
    });
  });

  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", async () => {
    it("should return 0", async () => {
      const { ballotContract, deployer, publicClient } = await loadFixture(deployContract);

      const txHash = await ballotContract.write.vote([0]);
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      expect(receipt.status).to.equal("success");

      const proposal = await ballotContract.read.proposals([0n]);
      expect(proposal[1]).to.eq(1n);

      const winningProposal = await ballotContract.read.winningProposal();
      expect(winningProposal).to.eq(0n);
    });
  });

  describe("when someone interacts with the winnerName function before any votes are cast", async () => {
    it("should return name of proposal 0", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const winnerName = await ballotContract.read.winnerName();
      expect(winnerName).to.eq(toHex("Proposal 1", { size: 32 }));
    });
  });

  describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
    it("should return name of proposal 0", async () => {
      const { ballotContract, deployer, publicClient } = await loadFixture(deployContract);

      const txHash = await ballotContract.write.vote([0]);
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      expect(receipt.status).to.equal("success");

      const proposal = await ballotContract.read.proposals([0n]);
      expect(proposal[1]).to.eq(1n);

      const winnerName = await ballotContract.read.winnerName();
      expect(winnerName).to.eq(toHex("Proposal 1", { size: 32 }));
    });
  });

  describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", async () => {
    // TODO
    it("should return the name of the winner proposal", async () => {
      throw Error("Not implemented");
    });
  });
});
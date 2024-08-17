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
			// Read that it has the proposals
			for (let i = 0; i < PROPOSALS.length; i++) {
				const proposal = await ballotContract.read.proposals([BigInt(i)]);
				expect(hexToString(proposal[0], { size: 32 })).to.eq(PROPOSALS[i]);
			}
		});

		it("has zero votes for all proposals", async () => {
			const { ballotContract } = await loadFixture(deployContract);
			// Read that it has the proposals
			for (let i = 0; i < PROPOSALS.length; i++) {
				const proposal = await ballotContract.read.proposals([BigInt(i)]);
				expect(proposal[1]).to.eq(0n);
			}
		});
		it("sets the deployer address as chairperson", async () => {
			const { deployer, ballotContract } = await loadFixture(deployContract);
			// Read the chairperson
			const chairperson = await ballotContract.read.chairperson();
			expect(chairperson.toLowerCase()).to.equal(deployer.account.address);
		});
		it("sets the voting weight for the chairperson as 1", async () => {
			const { ballotContract } = await loadFixture(deployContract);
			// read the chairperson
			const chairperson = await ballotContract.read.chairperson();
			// read the voters
			const voters = await ballotContract.read.voters([chairperson]);
			expect(voters[0]).to.eq(1n)
		});
	});

	describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {
		it("gives right to vote for another address", async () => {
			const { otherAccount, ballotContract } = await loadFixture(deployContract);
			// We give right to vote to other address
			const giveRightToVote = await ballotContract.write.giveRightToVote([otherAccount.account.address]);
			// Check that the voting right is given
			const otherVote = await ballotContract.read.voters([otherAccount.account.address]);
			expect(otherVote[0]).to.eq(1n);
		});
		it("can not give right to vote for someone that has voted", async () => {
			const { deployer, ballotContract } = await loadFixture(deployContract);
			// Vote
			const voted = await ballotContract.write.vote([0n]);
			expect(ballotContract.write.giveRightToVote([deployer.account.address])).to.be.rejectedWith("The voter already voted.");
		});
		it("can not give right to vote for someone that has already voting rights", async () => {
			const { deployer, ballotContract } = await loadFixture(deployContract);
			// Vote
			expect(ballotContract.write.giveRightToVote([deployer.account.address])).to.be.rejected;
		});
	});

	describe("when the voter interacts with the vote function in the contract", async () => {
		it("should register the vote", async () => {
			const { ballotContract } = await loadFixture(deployContract);
			// Vote
			const voted = await ballotContract.write.vote([0n]);
			const proposal = await ballotContract.read.proposals([0n]);
			expect(proposal[1]).to.eq(1n);
		});
	});

	describe("when the voter interacts with the delegate function in the contract", async () => {
		it("should transfer voting power", async () => {
			const { deployer, otherAccount, ballotContract } = await loadFixture(deployContract);
			// give right to vote to other Account
			const giveVotingRight = await ballotContract.write.giveRightToVote([otherAccount.account.address]);

			// delegate chairperson's vote to otherAccount
			const delegateVote = await ballotContract.write.delegate([otherAccount.account.address]);

			// check if now otherAccount has > 1 vote
			const otherAccountVote = await ballotContract.read.voters([otherAccount.account.address]);
			expect(otherAccountVote[0]).to.eq(2n);
		});
	});

	describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
		it("should revert", async () => {
			const { deployer, otherAccount, ballotContract } = await loadFixture(deployContract);

			const ballotContractAsOther = await viem.getContractAt(
				"Ballot",
				ballotContract.address,
				{ client: { wallet: otherAccount } }
			);

			await expect(
				ballotContractAsOther.write.giveRightToVote([deployer.account.address])
			).to.be.rejectedWith("Only chairperson can give right to vote.");
		});
	});

	describe("when an account without right to vote interacts with the vote function in the contract", async () => {
		it("should revert", async () => {
			const { deployer, otherAccount, ballotContract } = await loadFixture(deployContract);

			const ballotContractAsOther = await viem.getContractAt(
				"Ballot",
				ballotContract.address,
				{ client: { wallet: otherAccount } }
			);

			await expect(
				ballotContractAsOther.write.vote([1n])
			).to.be.rejectedWith("Has no right to vote");
		});
	});

	describe("when an account without right to vote interacts with the delegate function in the contract", async () => {
		it("should revert", async () => {
			const { deployer, otherAccount, ballotContract } = await loadFixture(deployContract);

			const ballotContractAsOther = await viem.getContractAt(
				"Ballot",
				ballotContract.address,
				{ client: { wallet: otherAccount } }
			);

			await expect(
				ballotContractAsOther.write.delegate([deployer.account.address])
			).to.be.rejectedWith("You have no right to vote");
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
			const { ballotContract } = await loadFixture(deployContract);
			// Vote
			const voted = await ballotContract.write.vote([0n]);
			const winner = await ballotContract.read.winningProposal();
			expect(winner).to.eq(0n);
		});
	});

	describe("when someone interacts with the winnerName function before any votes are cast", async () => {
		it("should return name of proposal 0", async () => {
			const { ballotContract } = await loadFixture(deployContract);
			const winner = await ballotContract.read.winnerName();
			expect(hexToString(winner, { size: 32 })).to.eq(PROPOSALS[0]);
		});
	});

	describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
		it("should return name of proposal 0", async () => {
			const { ballotContract } = await loadFixture(deployContract);
			// Vote
			const voted = await ballotContract.write.vote([0n]);
			const winner = await ballotContract.read.winnerName();
			expect(hexToString(winner, { size: 32 })).to.eq(PROPOSALS[0]);
		});
	});

	describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", async () => {
		it("should return the name of the winner proposal", async () => {
			const { ballotContract } = await loadFixture(deployContract);
			const [deployer, walletTwo, walletThree, walletFour, walletFive] = await viem.getWalletClients();

			// delegate vote to other wallet
			await ballotContract.write.giveRightToVote([walletTwo.account.address]);
			await ballotContract.write.giveRightToVote([walletThree.account.address]);
			await ballotContract.write.giveRightToVote([walletFour.account.address]);
			await ballotContract.write.giveRightToVote([walletFive.account.address]);

			// vote as deployer
			await ballotContract.write.vote([0n]);

			// vote as wallet 2
			let ballotContractAsOther = await viem.getContractAt(
				"Ballot",
				ballotContract.address,
				{ client: { wallet: walletTwo } }
			);
			await ballotContractAsOther.write.vote([1n]);

			// vote as wallet 3
			ballotContractAsOther = await viem.getContractAt(
				"Ballot",
				ballotContract.address,
				{ client: { wallet: walletThree } }
			);
			await ballotContractAsOther.write.vote([2n]);

			// vote as wallet 4
			ballotContractAsOther = await viem.getContractAt(
				"Ballot",
				ballotContract.address,
				{ client: { wallet: walletFour } }
			);
			await ballotContractAsOther.write.vote([2n]);

			// vote as wallet 5
			ballotContractAsOther = await viem.getContractAt(
				"Ballot",
				ballotContract.address,
				{ client: { wallet: walletFive } }
			);
			await ballotContractAsOther.write.vote([2n]);

			const winningProposal = await ballotContract.read.winningProposal();
			expect(winningProposal).to.eq(2n) // Expected winner is index 2 

			const winnerName = await ballotContract.read.winnerName();
			expect(hexToString(winnerName, { size: 32 })).to.eq(PROPOSALS[2])
		});
	});
});
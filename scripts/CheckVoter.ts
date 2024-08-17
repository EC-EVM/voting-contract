import { formatUnits } from "viem";

// Created a helper directory to house RPC connection, constants, etc
import { connectToRPC } from "../helpers/connectToRPC";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

async function main() {
  // npx ts-node --files ./scripts/CheckVoter.ts [contractAddress] [address1] [address2] [address3]...

  // Check the parameters
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 2)
    throw new Error("Parameters not provided");

  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  // Get the wallet from args
  const wallets = parameters.slice(1);

  // Connect to Sepolia network with RPC
  const publicClient = await connectToRPC();
  const blockNumber = await publicClient.getBlockNumber();
  console.log("\nLast block number:", blockNumber);

  // Check the wallets amount of voting rights
  for (const wallet of wallets) {
    const validWallet = wallet as `0x${string}`;
    if (!validWallet) throw new Error("Wallet address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet))
      throw new Error("Invalid wallet address");

    console.log(`\Check ${validWallet} amount of right to vote...`);
    const checkVoter = (await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "voters",
      args: [validWallet],
    })) as any[];

    console.log("Result:");
    console.log("Weight:", formatUnits(checkVoter[0], 0)); // Check voter's weight
    console.log("Has voted:", checkVoter[1]); // Check whether the voter has voted (true/false)
    console.log("Delegate:", checkVoter[2]); // Check the address to whom the vote is delegated
    console.log("Voted proposal index:", formatUnits(checkVoter[3], 0)); // The index of the proposal they voted for, if they have voted
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
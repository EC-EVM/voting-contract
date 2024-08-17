import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";


dotenv.config();

import { createPublicClient, http, createWalletClient, formatEther, toHex, hexToString } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const deployerPrivateKey = process.env.PRIVATE_KEY || "";
const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  const proposals = process.argv.slice(2);
  if (!proposals || proposals.length < 1)
    throw new Error("Proposals not provided");
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  const blockNumber = await publicClient.getBlockNumber();
  console.log("Last block number:", blockNumber);
  const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
  const deployer = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  console.log("Deployer address:", deployer.account.address);
  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });

  //
  console.log(
    "Deployer balance:",
    formatEther(balance),
    deployer.chain.nativeCurrency.symbol
  );
  
  //
  console.log("\nDeploying Ballot contract");
  const hash = await deployer.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
    args: [proposals.map((prop) => toHex(prop, { size: 32 }))],
  });
  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmations...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Ballot contract deployed to:", receipt.contractAddress);

  // const parameters = process.argv.slice(2);
  // if (!parameters || parameters.length < 2)
  //   throw new Error("Parameters not provided");
  // const contractAddress = parameters[0] as `0x${string}`;
  // if (!contractAddress) throw new Error("Contract address not provided");
  // if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
  //   throw new Error("Invalid contract address");
  // const proposalIndex = parameters[1];
  // if (isNaN(Number(proposalIndex))) throw new Error("Invalid proposal index");

  
  // console.log("Proposal selected: ");
  // const proposal = (await publicClient.readContract({
  //   address: contractAddress,
  //   abi,
  //   functionName: "proposals",
  //   args: [BigInt(proposalIndex)],
  // })) as any[];
  // const name = hexToString(proposal[0], { size: 32 });
  // console.log("Voting to proposal", name);
  // console.log("Confirm? (Y/n)");

}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
import { createPublicClient, http, hexToString } from "viem";

import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

// npx ts-node --files ./scripts/PrintResults.ts [contractAddress] [number]
// npx ts-node --files ./scripts/PrintResults.ts 0x329590C91563584091f6f4D8909728EB1050EFEC 3


function validateParameters(parameters: string[]) {
  console.log('parameters', parameters)
  if (!parameters || parameters.length < 2)
    throw new Error("Parameters not provided");

  const contractAddress = parameters[0] as `0x${string}`;
  console.log('contractAddress', contractAddress)
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  const numberOfProposals = Number(parameters[1]);
  if (isNaN(numberOfProposals)) throw new Error("Invalid number of proposals");

  return { contractAddress, numberOfProposals }
}

async function main() {

  const { contractAddress, numberOfProposals } = validateParameters(process.argv.slice(2));

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  const blockNumber = await publicClient.getBlockNumber();
  console.log("Last block number:", blockNumber);

  for (let proposalIndex = 0; proposalIndex < numberOfProposals; proposalIndex++) {
    const proposal = (await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "proposals",
      args: [BigInt(proposalIndex)],
    })) as any[];
    console.log(`[${proposalIndex}] ${hexToString(proposal[0], { size: 32 })}: ${proposal[1]}`)
  }

  const winnerName = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "winnerName",
  })) as any;
  console.log('Winner:', hexToString(winnerName, { size: 32 }))
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

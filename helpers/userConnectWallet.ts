import { createWalletClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { providerApiKey, userPrivateKey } from "./constant";

export const userConnectWallet = async () => {
  const account = privateKeyToAccount(`0x${userPrivateKey}` as Address);
  const user = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  return user;
};
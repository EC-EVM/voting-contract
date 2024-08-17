import * as dotenv from "dotenv";

dotenv.config();

export const providerApiKey = process.env.ALCHEMY_API_KEY || "";
export const userPrivateKey = process.env.PRIVATE_KEY || "";
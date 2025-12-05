import { ethers } from "ethers";
import { provider } from "./provider.js";
import dotenv from "dotenv";
dotenv.config();

export const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
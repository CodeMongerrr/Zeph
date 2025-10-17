import { configVariable } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatViem from "@nomicfoundation/hardhat-viem";

export default {
  solidity: "0.8.20",
  plugins: [hardhatToolboxViem, hardhatViem],
  networks: {
    sepolia: {
      type: "http",
      chainType: "l1",
      url: "https://sepolia.infura.io/v3/19f8fd6dddaf4a52b9252e4bcebd24c8",
      accounts: ["68a51639a71f5bebbe0495c12bd82b0193df98dc25da51dbc95230e793eff58f"],
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
      viaIR: true
    }
  }
};

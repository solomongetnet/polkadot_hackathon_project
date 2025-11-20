import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";
import "dotenv/config";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    moonbase: {
      type: "http",
      chainType: "generic",
      url: configVariable("MOONBASE_RPC_URL"),
      chainId: 1287, // (hex: 0x507),
      accounts: [configVariable("MOONBASE_PRIVATE_KEY")],
    },
  },
});

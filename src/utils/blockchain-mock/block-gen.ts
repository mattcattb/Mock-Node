import type { CryptoCoin } from "@/common/types";
import { generateRandomHexString } from "@/utils/generation";

export function generateCoinBlockInfo(coin: CryptoCoin) {
  const timestamp = new Date();

  let blockHash: string;
  let nonce: number;

  switch (coin) {
    case "btc":
    case "ltc":
      blockHash = generateRandomHexString(64);
      nonce = Math.floor(Math.random() * 2 ** 32);
      break;
    case "eth":
      blockHash = "0x" + generateRandomHexString(64);
      nonce = 0;
      break;
    case "usdt":
    case "usdc":
      blockHash = "0x" + generateRandomHexString(64);
      nonce = 0;
      break;
    default:
      throw new Error(
        `Unsupported coin type for block info generation: ${coin}`
      );
  }

  return {
    hash: blockHash,
    nonce: nonce,
    timestamp: timestamp,
  };
}

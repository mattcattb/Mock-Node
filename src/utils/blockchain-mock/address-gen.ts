import type { CryptoCoin } from "@/common/types";
import { generateRandomString } from "@/utils/generation";

export function generateMockBitcoinAddress(): string {
  const chars = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  return "bc1" + generateRandomString(39, chars);
}

export function generateMockLitecoinAddress(): string {
  const chars = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  return "ltc1" + generateRandomString(39, chars);
}

export function generateMockEthereumAddress(): string {
  const chars = "0123456789abcdef";
  return "0x" + generateRandomString(40, chars);
}

export function generateBech32MockAddress(prefix: string): string {
  const chars = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  return prefix + generateRandomString(39, chars);
}

export function generateEvmMockAddress(prefix: string): string {
  const chars = "0123456789abcdef";
  return prefix + generateRandomString(40, chars);
}

export function generateCoinAddress(coin: CryptoCoin) {
  switch (coin) {
    case "btc":
      return generateBech32MockAddress("bc1");
    case "ltc":
      return generateBech32MockAddress("ltc1");
    case "eth":
    case "usdc":
    case "usdt":
      return generateEvmMockAddress("0x");
    default:
      throw new Error(`Unsupported coin type: ${coin}`);
  }
}

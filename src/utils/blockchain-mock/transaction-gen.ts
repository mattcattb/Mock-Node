import type { CryptoCoin } from "@/common/types";
import { generateRandomHexString } from "@/utils/generation";
function generateMockUtxoTxId(): string {
  return generateRandomHexString(64);
}

function generateMockEthereumTxHash(): string {
  return `0x${generateRandomHexString(64)}`;
}
export function generateTxIdForCoin(coin: CryptoCoin): string {
  switch (coin) {
    case "btc":
    case "ltc":
      return generateMockUtxoTxId();
    case "eth":
    case "usdt":
    case "usdc":
      return generateMockEthereumTxHash();
    default:
      return `mock_tx_${Date.now()}`;
  }
}

export function getTransactionKey(txid: string, vout: number): string {
  return `${txid}-${vout}`;
}

export function parseTransactionKey(key: string): {
  txid: string;
  vout: number;
} {
  const [txid, voutStr] = key.split("-");
  return { txid, vout: parseInt(voutStr, 10) };
}

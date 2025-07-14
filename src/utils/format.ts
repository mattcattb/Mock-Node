import Decimal from "decimal.js";

const USD_PRECISION = 2;
const COIN_PRECISION = 18;
const MULTIPLIER_PRECISION = 4;

export function formatUsd(amount: Decimal): string {
  return amount.toFixed(USD_PRECISION);
}

export function formatCoin(amount: Decimal): string {
  return amount.toFixed(COIN_PRECISION);
}

export function formatMultiplier(amount: Decimal): string {
  return amount.toFixed(MULTIPLIER_PRECISION, Decimal.ROUND_DOWN);
}

export function generateRandomString(length: number, chars: string): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const HEX_CHARS = "0123456789abcdef";

export function generateRandomHexString(length: number): string {
  return generateRandomString(length, HEX_CHARS);
}

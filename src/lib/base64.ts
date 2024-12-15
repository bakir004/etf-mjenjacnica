export function toBase64(input: string): string {
  return Buffer.from(input).toString("base64");
}

export function fromBase64(input: string): string {
  return Buffer.from(input, "base64").toString("utf-8");
}

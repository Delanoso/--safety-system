import { randomBytes } from "crypto";

export function generateSignToken(): string {
  return randomBytes(24).toString("hex");
}

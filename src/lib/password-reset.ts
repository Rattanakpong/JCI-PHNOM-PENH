import { randomBytes } from "crypto";

// 7 days — generous since the link is shared out-of-band (Telegram, in
// person, etc.) rather than emailed immediately.
export const RESET_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function generateResetToken() {
  return randomBytes(32).toString("base64url");
}

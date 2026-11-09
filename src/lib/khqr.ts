/**
 * Minimal EMVCo/Bakong KHQR payload builder.
 *
 * This builds a spec-shaped "individual" KHQR string (tags 00-63 + CRC)
 * good enough for rendering a scannable QR in development. ABA Pay's real
 * PayWay API additionally returns a transaction MD5 used to poll their
 * check-transaction endpoint for server-side payment verification — swap
 * `generateKhqrPayload` for a call to that API in production and keep this
 * file as the local fallback / offline preview generator.
 */

interface KhqrInput {
  accountId: string; // ABA deeplink account id (e.g. "jci_phnom_penh@aba")
  merchantName: string;
  merchantCity: string;
  amount: number; // in `currency` units, e.g. 25.00 USD
  currency: "USD" | "KHR";
  billNumber: string; // our registrationId — lets ABA's webhook/app map the payment back
}

const CURRENCY_CODE: Record<KhqrInput["currency"], string> = {
  USD: "840",
  KHR: "116",
};

function tlv(tag: string, value: string) {
  const length = value.length.toString().padStart(2, "0");
  return `${tag}${length}${value}`;
}

// CRC-16/CCITT-FALSE, as required by the EMVCo QR Code spec (tag 63).
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function generateKhqrPayload({
  accountId,
  merchantName,
  merchantCity,
  amount,
  currency,
  billNumber,
}: KhqrInput): string {
  const merchantAccountInfo = tlv(
    "29",
    tlv("00", "KHQR01") + tlv("01", accountId)
  );

  const additionalData = tlv("01", billNumber); // bill number sub-field

  const fields = [
    tlv("00", "01"), // Payload Format Indicator
    tlv("01", "12"), // Point of Initiation Method: 12 = dynamic (one-time amount)
    merchantAccountInfo,
    tlv("52", "5999"), // Merchant Category Code (generic)
    tlv("53", CURRENCY_CODE[currency]),
    tlv("54", amount.toFixed(2)), // Transaction Amount
    tlv("58", "KH"), // Country Code
    tlv("59", merchantName.slice(0, 25)),
    tlv("60", merchantCity.slice(0, 15)),
    tlv("62", additionalData),
  ].join("");

  // CRC covers everything including the "6304" tag+length prefix itself.
  const withCrcTag = `${fields}6304`;
  return `${withCrcTag}${crc16(withCrcTag)}`;
}

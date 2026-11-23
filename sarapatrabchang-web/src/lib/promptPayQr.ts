function crc16Ccitt(payload: string): string {
  let crc = 0xffff;

  for (const byte of new TextEncoder().encode(payload)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function emvField(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

export function createPromptPayPayload(phone: string, amount: number): string {
  const normalizedPhone = phone.replace(/\D/g, "");
  if (!/^0\d{9}$/.test(normalizedPhone)) {
    throw new Error("เบอร์ PromptPay ของแอดมินไม่ถูกต้อง");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("ยอดชำระต้องมากกว่า 0 บาท");
  }

  const promptPayPhone = `0066${normalizedPhone.slice(1)}`;
  const merchantAccount = emvField(
    "29",
    emvField("00", "A000000677010111") + emvField("01", promptPayPhone),
  );
  const payload =
    emvField("00", "01") +
    emvField("01", "12") +
    merchantAccount +
    emvField("58", "TH") +
    emvField("53", "764") +
    emvField("54", amount.toFixed(2)) +
    "6304";

  return `${payload}${crc16Ccitt(payload)}`;
}

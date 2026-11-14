// VietQR NAPAS 247 Standard Payload Generator

export function buildVietQrPayload(
  bankBin: string,
  accountNo: string,
  amount: number,
  content: string = ''
): string {
  const sanitize = (s: string) => (s || '').replace(/[^\x20-\x7E]/g, '');

  const f00 = '000201'; // Payload format indicator
  const f01 = '010212'; // 12: Dynamic QR (with amount), 11: Static QR

  // GUID A000000727
  const guid = '0010A000000727';

  // Sub-tag 01 for Consumer Account Info
  const sub00 = `00${String(bankBin.length).padStart(2, '0')}${bankBin}`;
  const sub01 = `01${String(accountNo.length).padStart(2, '0')}${accountNo}`;
  const innerSub = sub00 + sub01;
  const tag01 = `01${String(innerSub.length).padStart(2, '0')}${innerSub}`;

  // Service code (QRIBFTTC: Chuyen nhanh 247 qua so tai khoan)
  const tag02 = '0208QRIBFTTC';

  const f38Data = guid + tag01 + tag02;
  const f38 = `38${String(f38Data.length).padStart(2, '0')}${f38Data}`;

  const f53 = '5303704'; // VND currency
  const amtStr = Math.round(amount).toString();
  const f54 = `54${String(amtStr.length).padStart(2, '0')}${amtStr}`;
  const f58 = '5802VN'; // Country code

  let f62 = '';
  if (content && content.trim().length > 0) {
    const cleanContent = sanitize(content.trim());
    const c08 = `08${String(cleanContent.length).padStart(2, '0')}${cleanContent}`;
    f62 = `62${String(c08.length).padStart(2, '0')}${c08}`;
  }

  const raw = f00 + f01 + f38 + f53 + f54 + f58 + f62 + '6304';
  const crc = computeCrc16(raw);
  return raw + crc;
}

function computeCrc16(data: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;
  const bytes = Buffer.from(data, 'utf-8');

  for (let i = 0; i < bytes.length; i++) {
    for (let j = 0; j < 8; j++) {
      const bit = ((bytes[i] >> (7 - j)) & 1) === 1;
      const c15 = ((crc >> 15) & 1) === 1;
      crc <<= 1;
      if (c15 !== bit) crc ^= polynomial;
    }
  }

  crc &= 0xffff;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

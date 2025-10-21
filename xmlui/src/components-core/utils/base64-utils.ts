/**
 * Convert Uint8Array to base64 string without using btoa.
 * This approach handles all Unicode characters correctly.
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  const base64abc = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"
  ];

  let result = '';
  let i;
  const l = bytes.length;
  
  for (i = 2; i < l; i += 3) {
    result += base64abc[bytes[i - 2] >> 2];
    result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
    result += base64abc[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
    result += base64abc[bytes[i] & 0x3f];
  }
  
  if (i === l + 1) {
    // 1 byte left
    result += base64abc[bytes[i - 2] >> 2];
    result += base64abc[(bytes[i - 2] & 0x03) << 4];
    result += "==";
  }
  
  if (i === l) {
    // 2 bytes left
    result += base64abc[bytes[i - 2] >> 2];
    result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
    result += base64abc[(bytes[i - 1] & 0x0f) << 2];
    result += "=";
  }
  
  return result;
}

/**
 * Encode string to base64 value (handles Unicode properly).
 * This is a safe alternative to btoa() that works with Unicode characters.
 */
export function encodeToBase64(value: string | number | boolean | object | null): string {
  if (value === null || value === undefined) {
    return "";
  }

  const valueToString = typeof value === "object" ? JSON.stringify(value) : value.toString();

  if (typeof window !== 'undefined') {
    // Use TextEncoder to handle Unicode properly
    const encoder = new TextEncoder();
    const data = encoder.encode(valueToString);
    return uint8ArrayToBase64(data);
  }

  // Node.js environment
  const buff = Buffer.from(valueToString, 'utf8');
  return buff.toString('base64');
}

/**
 * Convert base64 string to Uint8Array without using atob.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const base64abc = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"
  ];

  // Create lookup table
  const lookup = new Uint8Array(256);
  for (let i = 0; i < base64abc.length; i++) {
    lookup[base64abc[i].charCodeAt(0)] = i;
  }

  // Remove padding
  let paddingLength = 0;
  if (base64.endsWith("==")) {
    paddingLength = 2;
  } else if (base64.endsWith("=")) {
    paddingLength = 1;
  }

  const length = base64.length;
  const bufferLength = (length * 3) / 4 - paddingLength;
  const bytes = new Uint8Array(bufferLength);

  let p = 0;
  for (let i = 0; i < length; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i + 1)];
    const encoded3 = lookup[base64.charCodeAt(i + 2)];
    const encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
  }

  return bytes;
}

/**
 * Decode base64 value to string (handles Unicode properly).
 * This is a safe alternative to atob() that works with Unicode characters.
 */
export function decodeFromBase64(value: string | number | boolean | object | null): string | null {
  if (!value) {
    return null;
  }

  const valueToString = typeof value === "object" ? JSON.stringify(value) : value.toString();

  if (typeof window !== "undefined") {
    // Decode from base64 and handle Unicode properly
    const bytes = base64ToUint8Array(valueToString);
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  // Node.js environment
  const buff = Buffer.from(valueToString, "base64");
  return buff.toString("utf8");
}

import { uint8ArrayToBase64 } from "../../components-core/utils/base64-utils";

/**
 * Convert a string to its UTF-8 bytes and compress it.
 *
 * @param {string} str
 * @returns {Promise<Uint8Array>}
 */
async function compress(str: string) {
  // Convert the string to a byte stream.
  const stream = new Blob([str]).stream();

  // Create a compressed stream.
  const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));

  // Convert the string to a byte stream.
  const reader = compressedStream.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return await concatUint8Arrays(chunks);
}

/**
 * Combine multiple Uint8Arrays into one.
 *
 */
async function concatUint8Arrays(uint8arrays: Uint8Array[]) {
  // Ensure each part is an ArrayBuffer (Blob typing expects ArrayBuffer not ArrayBufferLike).
  // Create a fresh Uint8Array copy for each chunk so the underlying buffer is a plain ArrayBuffer.
  const blobParts = uint8arrays.map(u => new Uint8Array(u).buffer);
  const blob = new Blob(blobParts);
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

export async function createQueryString(target: any) {
  // Convert the Uint8Array to a Base64 string.

  const compressed = await compress(target);
  const base64 = uint8ArrayToBase64(compressed);

  // Create a query string.
  return encodeURIComponent(base64);
}


export function withoutTrailingSlash(str: string) {
  if (str.endsWith("/")) {
    return str.substring(0, str.length - 1);
  }
  return str;
}
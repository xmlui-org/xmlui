/**
 * Convert a string to its UTF-8 bytes and compress it.
 *
 * @param {string} str
 * @returns {Promise<Uint8Array>}
 */
export async function compress(str: string) {
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
 * @param {ReadonlyArray<Uint8Array>} uint8arrays
 * @returns {Promise<Uint8Array>}
 */
async function concatUint8Arrays(uint8arrays: Uint8Array[]) {
  const blob = new Blob(uint8arrays);
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

export async function createQueryString(target: any) {
  // Convert the Uint8Array to a Base64 string.

  const compressed = await compress(target);
  const base64 = btoa(String.fromCharCode(...compressed));

  // Create a query string.
  return encodeURIComponent(base64);
}


export function withoutTrailingSlash(str: string) {
  if (str.endsWith("/")) {
    return str.substring(0, str.length - 1);
  }
  return str;
}
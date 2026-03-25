import { uint8ArrayToBase64 } from "../../../../xmlui/src/components-core/utils/base64-utils";

/**
 * Convert a string to its UTF-8 bytes and compress it.
 *
 * @param {string} str
 * @returns {Promise<Uint8Array>}
 */
async function compress(str: string): Promise<Uint8Array> {
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
 * Decompress bytes into a UTF-8 string.
 *
 * @param {Uint8Array} compressedBytes
 * @returns {Promise<string>}
 */
async function decompress(compressedBytes: Uint8Array): Promise<string> {
  // Convert the bytes to a stream.
  // Copy the Uint8Array to ensure we have a plain ArrayBuffer (not ArrayBufferLike/SharedArrayBuffer),
  // then pass that ArrayBuffer to Blob which satisfies the BlobPart typing.
  const arrayBuffer = compressedBytes.slice().buffer;
  const stream = new Blob([arrayBuffer]).stream();

  // Create a decompressed stream.
  const decompressedStream = stream.pipeThrough(new DecompressionStream("gzip"));

  // Convert the string to a byte stream.
  const reader = decompressedStream.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const stringBytes = await concatUint8Arrays(chunks);

  // Convert the bytes to a string.
  return new TextDecoder().decode(stringBytes);
}

/**
 * Combine multiple Uint8Arrays into one.
 *
 * @param {ReadonlyArray<Uint8Array>} uint8arrays
 * @returns {Promise<Uint8Array>}
 */
async function concatUint8Arrays(uint8arrays: Uint8Array[]): Promise<Uint8Array> {
  // Ensure we pass real ArrayBuffer instances to the Blob constructor by copying each Uint8Array's bytes.
  const buffers = uint8arrays.map(u => (new Uint8Array(u)).buffer);
  const blob = new Blob(buffers);
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

async function createQueryString(target: any): Promise<string> {
  // Convert the Uint8Array to a Base64 string.

  const compressed = await compress(target);
  const base64 = uint8ArrayToBase64(compressed);

  // Create a query string.
  return encodeURIComponent(base64);
}

export { compress, decompress, createQueryString };

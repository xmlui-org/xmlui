import { uint8ArrayToBase64 } from "../../../../xmlui/src/components-core/utils/base64-utils";

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
    const compressedStream = stream.pipeThrough(
        new CompressionStream("gzip")
    );

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
async function decompress(compressedBytes: Uint8Array) {
    // Convert the bytes to a stream.
    const stream = new Blob([new Uint8Array(compressedBytes)]).stream();

    // Create a decompressed stream.
    const decompressedStream = stream.pipeThrough(
        new DecompressionStream("gzip")
    );

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
 */
async function concatUint8Arrays(uint8arrays: ReadonlyArray<Uint8Array>) {
    // Convert each Uint8Array into an ArrayBufferView (copy if necessary) so it matches BlobPart[] typing.
    const parts: BlobPart[] = uint8arrays.map(u => new Uint8Array(u));
    const blob = new Blob(parts);
    const buffer = await blob.arrayBuffer();
    return new Uint8Array(buffer);
}

async function createQueryString(target: any) {
    // Convert the Uint8Array to a Base64 string.

    const compressed = await compress(target);
    const base64 = uint8ArrayToBase64(compressed);

    // Create a query string.
    return encodeURIComponent(base64);
}

export { compress, decompress, createQueryString };

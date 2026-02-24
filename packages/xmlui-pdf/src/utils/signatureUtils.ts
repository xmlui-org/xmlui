import { SIGNATURE_FONTS } from "../components/SignatureCapture/SignatureTypeInput";

/**
 * Render typed signature text to a PNG data URL
 * @param text - Signer name/text
 * @param fontFamily - Font family to use (must be from SIGNATURE_FONTS)
 * @returns Base64-encoded PNG data URL
 */
export function typedSignatureToDataUrl(text: string, fontFamily: string): string {
  const canvas = document.createElement("canvas");
  const fontSize = 48;
  const padding = 12;

  // Measure first with a rough canvas to determine width
  const ctx = canvas.getContext("2d")!;
  ctx.font = `${fontSize}px ${fontFamily}`;
  const measured = ctx.measureText(text);
  const width = Math.ceil(measured.width) + padding * 2;
  const height = fontSize + padding * 2;

  canvas.width = width;
  canvas.height = height;

  // Re-apply font after resize (resizing resets canvas state)
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = "#11182f";
  ctx.textBaseline = "middle";
  ctx.fillText(text, padding, height / 2);

  return canvas.toDataURL("image/png");
}

/**
 * Get font family from font index
 */
export function getFontFamilyByIndex(fontIndex: number): string {
  return SIGNATURE_FONTS[fontIndex]?.family ?? SIGNATURE_FONTS[0].family;
}

/**
 * Create a timestamp string for signature dating
 */
export function createSignatureTimestamp(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const year = now.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Check if a value is a valid base64 data URL (PNG or SVG)
 */
export function isValidSignatureDataUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return value.startsWith("data:image/png;base64,") || value.startsWith("data:image/svg+xml");
}

/**
 * Export signature data to base64 string (strip data URL prefix)
 */
export function exportSignatureBase64(dataUrl: string): string {
  if (dataUrl.startsWith("data:image/png;base64,")) {
    return dataUrl.replace("data:image/png;base64,", "");
  }
  if (dataUrl.startsWith("data:image/svg+xml;base64,")) {
    return dataUrl.replace("data:image/svg+xml;base64,", "");
  }
  return dataUrl;
}

/**
 * Import signature data from base64 string to data URL
 */
export function importSignatureBase64(base64: string, format: "png" | "svg" = "png"): string {
  const prefix = format === "png" ? "data:image/png;base64," : "data:image/svg+xml;base64,";
  if (base64.startsWith("data:image")) {
    return base64; // Already a data URL
  }
  return prefix + base64;
}

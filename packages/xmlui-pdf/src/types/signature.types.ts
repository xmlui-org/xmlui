/**
 * Type definitions for signature data
 */

/**
 * Signature capture methods
 */
export type SignatureType = "typed" | "uploaded";

/**
 * Signature data stored and applied to signature fields
 */
export interface SignatureData {
  /** Unique identifier */
  id: string;
  /** How the signature was captured */
  type: SignatureType;
  /** Base64-encoded image or SVG path data */
  data: string;
  /** When the signature was captured */
  timestamp: Date;
  /** Name of the signer */
  signerName?: string;
  /** Index of the font used (for typed signatures) */
  signerFontIndex?: number;
}

/**
 * Data required to create a signature (without generated fields)
 */
export type SignatureDataInput = Omit<SignatureData, "id" | "timestamp">;

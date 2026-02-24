/**
 * Type definitions for PDF document sources
 * Supports various input formats for loading PDFs
 */

/**
 * PDF document source types supported by the component.
 * 
 * Supports:
 * - URL strings: "https://example.com/document.pdf" or "/local/file.pdf"
 * - ArrayBuffer: Binary data from fetch() or file readers
 * - Uint8Array: Typed array with PDF bytes
 * - Blob: File or Blob objects
 * - Data URLs: "data:application/pdf;base64,JVBERi0xLjQK..."
 * - null: No document loaded
 */
export type PdfSource = 
  | string           // URL or data URL
  | ArrayBuffer      // Binary data
  | Uint8Array       // Typed array
  | Blob             // File or Blob
  | null;            // No document

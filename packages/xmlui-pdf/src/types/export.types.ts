import type { Annotation } from "./annotation.types";
import type { SignatureData } from "./signature.types";

/**
 * Data payload for PDF export to backend
 * Contains all annotations and signatures for the document
 */
export interface PdfExportData {
  /** All annotations in the document */
  annotations: Annotation[];
  
  /** All stored signatures, keyed by field ID */
  signatures: Record<string, SignatureData>;
  
  /** Export metadata */
  metadata: {
    /** When the export was requested */
    exportedAt: Date;
    
    /** Total number of pages in the PDF (if available) */
    pageCount?: number;
    
    /** Additional context the backend may need */
    [key: string]: any;
  };
}

/**
 * Response from backend after processing export
 */
export interface PdfExportResponse {
  /** Whether the export was successful */
  success: boolean;
  
  /** URL to download the exported PDF (if successful) */
  downloadUrl?: string;
  
  /** Error message if export failed */
  error?: string;
  
  /** Any additional data from backend */
  data?: Record<string, any>;
}

import { useState, useCallback, useRef } from "react";
import type { SignatureData } from "../types/signature.types";
import { isValidSignatureDataUrl } from "../utils/signatureUtils";

export interface UseSignatureOptions {
  /** Pre-load signatures on mount */
  initialSignatures?: Record<string, SignatureData>;
  /** Enable persistence to localStorage (not yet implemented) */
  persist?: boolean;
}

/**
 * Hook for managing signature state and operations
 *
 * @example
 * const signatures = useSignature({ initialSignatures: { field1: prevSignature } });
 * signatures.saveSignature('field1', capturedSignature);
 * const sig = signatures.getSignature('field1');
 */
export function useSignature(options: UseSignatureOptions = {}) {
  const { initialSignatures = {}, persist = false } = options;
  
  // Store signatures by field ID
  const [signatures, setSignatures] = useState<Record<string, SignatureData>>(initialSignatures);
  
  // Keep a ref to avoid stale closures in API methods
  const signaturesRef = useRef(signatures);
  signaturesRef.current = signatures;

  /**
   * Save a signature for a field
   */
  const saveSignature = useCallback((fieldId: string, signature: SignatureData) => {
    setSignatures(prev => {
      const next = { ...prev, [fieldId]: signature };
      if (persist) {
        try {
          localStorage.setItem(`pdf-sig-${fieldId}`, JSON.stringify(signature));
        } catch (e) {
          console.warn("Failed to persist signature:", e);
        }
      }
      return next;
    });
  }, [persist]);

  /**
   * Retrieve a signature for a field
   */
  const getSignature = useCallback((fieldId: string): SignatureData | null => {
    return signaturesRef.current[fieldId] ?? null;
  }, []);

  /**
   * Check if a field has been signed
   */
  const isSigned = useCallback((fieldId: string): boolean => {
    const sig = signaturesRef.current[fieldId];
    return sig != null && isValidSignatureDataUrl(sig.data);
  }, []);

  /**
   * Clear a signature for a field
   */
  const clearSignature = useCallback((fieldId: string) => {
    setSignatures(prev => {
      const { [fieldId]: _, ...rest } = prev;
      if (persist) {
        try {
          localStorage.removeItem(`pdf-sig-${fieldId}`);
        } catch (e) {
          console.warn("Failed to clear persisted signature:", e);
        }
      }
      return rest;
    });
  }, [persist]);

  /**
   * Get all stored signatures
   */
  const getAllSignatures = useCallback((): Record<string, SignatureData> => {
    return { ...signaturesRef.current };
  }, []);

  /**
   * Clear all signatures
   */
  const clearAllSignatures = useCallback(() => {
    setSignatures({});
    if (persist) {
      try {
        // Would need to iterate and remove all — for now, just clear the object
        Object.keys(signaturesRef.current).forEach(fieldId => {
          localStorage.removeItem(`pdf-sig-${fieldId}`);
        });
      } catch (e) {
        console.warn("Failed to clear all persisted signatures:", e);
      }
    }
  }, [persist]);

  return {
    saveSignature,
    getSignature,
    isSigned,
    clearSignature,
    getAllSignatures,
    clearAllSignatures,
    signatures: signaturesRef.current,
  };
}

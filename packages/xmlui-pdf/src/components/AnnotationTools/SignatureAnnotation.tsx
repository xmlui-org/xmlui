import type { Annotation } from "../../types/annotation.types";
import styles from "./AnnotationTools.module.scss";

export interface SignatureAnnotationProps {
  annotation: Annotation;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
  onSelect: (id: string) => void;
  /** Called when user clicks the sign button/placeholder to open the signature modal */
  onRequestSign?: (id: string) => void;
  /** Called when user clicks clear to remove signature */
  onClearSign?: (id: string) => void;
}

/**
 * SignatureAnnotation component - Signature field placeholder for PDF annotations
 * Phase 1: Displays placeholder
 * Phase 2: Will support signature image display and capture
 */
export function SignatureAnnotation({
  annotation,
  isSelected,
  onUpdate,
  onSelect,
  onRequestSign,
  onClearSign,
}: SignatureAnnotationProps) {
  const { id, value, properties } = annotation;
  const { label, required, signerDate } = properties;
  const hasSignature = !!value;

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(id);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    // Prevent parent drag handler from intercepting click on signature
    event.stopPropagation();
  };

  const handleFocus = () => {
    onSelect(id);
  };

  return (
    <div
      data-testid="signature-annotation"
      className={`${styles.signatureAnnotation} ${isSelected ? styles.selected : ""} ${!hasSignature ? styles.empty : ""}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      tabIndex={0}
      onFocus={handleFocus}
    >
      {label && (
        <div className={styles.signatureLabel}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </div>
      )}
      
      {hasSignature ? (
        // Signed: show captured signature image with option to re-sign or clear
        <div className={styles.signedContent}>
          <img
            src={value as string}
            alt="Signature"
            className={styles.signatureImage}
          />
          {signerDate && (
            <div className={styles.signatureDate}>
              Signed: {signerDate}
            </div>
          )}
          {isSelected && (
            <div className={styles.signatureActions}>
              {onRequestSign && (
                <button
                  type="button"
                  className={styles.changeButton}
                  onClick={(e) => { e.stopPropagation(); onRequestSign(id); }}
                  data-testid="change-signature-button"
                >
                  Change
                </button>
              )}
              {onClearSign && (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={(e) => { e.stopPropagation(); onClearSign(id); }}
                  data-testid="clear-signature-button"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        // Unsigned: placeholder / sign button
        <button
          type="button"
          className={styles.signaturePlaceholder}
          onClick={(e) => { e.stopPropagation(); onSelect(id); onRequestSign?.(id); }}
          data-testid="sign-here-button"
        >
          ✍ Click to sign
        </button>
      )}
    </div>
  );
}

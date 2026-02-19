import type { Annotation } from "../../types/annotation.types";
import styles from "./AnnotationTools.module.scss";

export interface SignatureAnnotationProps {
  annotation: Annotation;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
  onSelect: (id: string) => void;
  /** Called when user clicks the sign button/placeholder to open the signature modal */
  onRequestSign?: (id: string) => void;
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
}: SignatureAnnotationProps) {
  const { id, value, properties } = annotation;
  const { label, required } = properties;
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
        // Signed: show captured signature image with option to re-sign
        <div className={styles.signedContent}>
          <img
            src={value as string}
            alt="Signature"
            className={styles.signatureImage}
          />
          {isSelected && onRequestSign && (
            <button
              type="button"
              className={styles.resignButton}
              onClick={(e) => { e.stopPropagation(); onRequestSign(id); }}
              data-testid="resign-button"
            >
              Change
            </button>
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

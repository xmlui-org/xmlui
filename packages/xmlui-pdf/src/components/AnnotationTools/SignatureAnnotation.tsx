import type { Annotation } from "../../types/annotation.types";
import styles from "./AnnotationTools.module.scss";

export interface SignatureAnnotationProps {
  annotation: Annotation;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
  onSelect: (id: string) => void;
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
}: SignatureAnnotationProps) {
  const { id, value, properties } = annotation;
  const { label, required } = properties;
  const hasSignature = !!value;

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(id);
  };

  const handleFocus = () => {
    onSelect(id);
  };

  return (
    <div
      data-testid="signature-annotation"
      className={`${styles.signatureAnnotation} ${isSelected ? styles.selected : ""} ${!hasSignature ? styles.empty : ""}`}
      onClick={handleClick}
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
        // Phase 2: Display signature image
        <img
          src={value as string}
          alt="Signature"
          className={styles.signatureImage}
        />
      ) : (
        // Phase 1: Display placeholder
        <div className={styles.signaturePlaceholder}>
          Click to sign
        </div>
      )}
    </div>
  );
}

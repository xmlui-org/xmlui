import type { Annotation } from "../../types/annotation.types";
import styles from "./AnnotationTools.module.scss";

export interface CheckboxAnnotationProps {
  annotation: Annotation;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
  onSelect: (id: string) => void;
}

/**
 * CheckboxAnnotation component - Interactive checkbox field for PDF annotations
 */
export function CheckboxAnnotation({
  annotation,
  isSelected,
  onUpdate,
  onSelect,
}: CheckboxAnnotationProps) {
  const { id, value, properties } = annotation;
  const { label, required } = properties;
  const isChecked = value === true || value === "true";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(id, { value: event.target.checked });
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(id);
  };

  const handleFocus = () => {
    onSelect(id);
  };

  return (
    <div
      data-testid="checkbox-annotation"
      className={`${styles.checkboxAnnotation} ${isSelected ? styles.selected : ""}`}
      onClick={handleClick}
    >
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          onFocus={handleFocus}
          className={styles.checkbox}
        />
        {label && (
          <span className={styles.labelText}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </span>
        )}
      </label>
    </div>
  );
}

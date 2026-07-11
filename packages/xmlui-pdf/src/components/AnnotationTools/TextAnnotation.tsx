import type { Annotation } from "../../types/annotation.types";
import styles from "./AnnotationTools.module.scss";

export interface TextAnnotationProps {
  annotation: Annotation;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
  onSelect: (id: string) => void;
}

/**
 * TextAnnotation component - Interactive text input field for PDF annotations
 */
export function TextAnnotation({
  annotation,
  isSelected,
  onUpdate,
  onSelect,
}: TextAnnotationProps) {
  const { id, value, properties } = annotation;
  const { label, placeholder, required } = properties;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(id, { value: event.target.value });
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(id);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    // Prevent parent drag handler from intercepting click on input
    event.stopPropagation();
  };

  const handleFocus = () => {
    onSelect(id);
  };

  return (
    <div
      data-testid="text-annotation"
      className={`${styles.textAnnotation} ${isSelected ? styles.selected : ""}`}
      onClick={handleClick}
    >
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        type="text"
        value={value || ""}
        placeholder={placeholder}
        onChange={handleChange}
        onMouseDown={handleMouseDown}
        onFocus={handleFocus}
        className={styles.input}
        style={{
          fontSize: properties.fontSize ? `${properties.fontSize}px` : undefined,
          fontFamily: properties.fontFamily,
        }}
      />
    </div>
  );
}

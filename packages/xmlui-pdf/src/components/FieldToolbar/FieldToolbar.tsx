import type { AnnotationType } from "../../types/annotation.types";
import styles from "./FieldToolbar.module.scss";

export interface FieldToolbarProps {
  onAddAnnotation: (type: AnnotationType, page: number) => void;
  currentPage: number;
  isEditMode?: boolean;
}

/**
 * FieldToolbar component - Toolbar for adding annotations to PDF
 * Only visible in edit mode
 */
export function FieldToolbar({
  onAddAnnotation,
  currentPage,
  isEditMode = true,
}: FieldToolbarProps) {
  if (!isEditMode) {
    return null;
  }

  const handleAddText = () => {
    onAddAnnotation("text", currentPage);
  };

  const handleAddCheckbox = () => {
    onAddAnnotation("checkbox", currentPage);
  };

  const handleAddSignature = () => {
    onAddAnnotation("signature", currentPage);
  };

  return (
    <div className={styles.toolbar} data-testid="field-toolbar">
      <div className={styles.toolbarTitle}>Add Field</div>
      <div className={styles.buttonGroup}>
        <button
          className={styles.toolbarButton}
          onClick={handleAddText}
          title="Add Text Field"
          data-testid="add-text-button"
        >
          <span className={styles.icon}>T</span>
          <span className={styles.label}>Text</span>
        </button>
        <button
          className={styles.toolbarButton}
          onClick={handleAddCheckbox}
          title="Add Checkbox"
          data-testid="add-checkbox-button"
        >
          <span className={styles.icon}>☑</span>
          <span className={styles.label}>Checkbox</span>
        </button>
        <button
          className={styles.toolbarButton}
          onClick={handleAddSignature}
          title="Add Signature"
          data-testid="add-signature-button"
        >
          <span className={styles.icon}>✍</span>
          <span className={styles.label}>Signature</span>
        </button>
      </div>
    </div>
  );
}

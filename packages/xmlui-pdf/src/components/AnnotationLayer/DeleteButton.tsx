import styles from "./DeleteButton.module.scss";

export interface DeleteButtonProps {
  onDelete: () => void;
}

/**
 * DeleteButton component - Shows delete button for selected annotations
 */
export function DeleteButton({ onDelete }: DeleteButtonProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete();
  };

  return (
    <button
      className={styles.deleteButton}
      onClick={handleClick}
      title="Delete annotation (Delete/Backspace)"
      data-testid="delete-button"
      aria-label="Delete annotation"
    >
      ×
    </button>
  );
}

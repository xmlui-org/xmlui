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

  const handleMouseDown = (event: React.MouseEvent) => {
    // Prevent parent drag handler from calling preventDefault, which would
    // suppress this button's click event.
    event.stopPropagation();
  };

  return (
    <button
      className={styles.deleteButton}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      title="Delete annotation (Delete/Backspace)"
      data-testid="delete-button"
      aria-label="Delete annotation"
    >
      ×
    </button>
  );
}

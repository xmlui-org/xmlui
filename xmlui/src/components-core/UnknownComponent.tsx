import styles from "./UnknownComponent.module.scss";

/**
 * This React component renders an error message telling that a particular component type is not registered.
 * @param message Message to display
 */
function UnknownComponent ({ message }: { message: string }) {
  return (
    <div className={styles.errorOverlay}>
      <span className={styles.title}>Unknown component: {message}</span>
    </div>
  );
}

export default UnknownComponent;

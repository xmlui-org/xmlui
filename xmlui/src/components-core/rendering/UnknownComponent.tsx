import styles from "./UnknownComponent.module.scss";

/**
 * When the rendering engine finds an unknown (unregistered) component in the
 * markup, it renders this component and names the unregistered.
 */
function UnknownComponent ({ message }: { message: string }) {
  return (
    <div className={styles.errorOverlay}>
      <span className={styles.title}>Unknown component: {message}</span>
    </div>
  );
}

export default UnknownComponent;

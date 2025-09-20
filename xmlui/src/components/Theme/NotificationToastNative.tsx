import { CSSProperties, useEffect, useState, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import toast, { ToastBar, Toaster, useToasterStore } from "react-hot-toast";
import classnames from "classnames";
import { ModalVisibilityContext } from "../ModalDialog/ModalVisibilityContext";
import styles from "./NotificationToast.module.scss";

// Custom toast component that renders in the right place
const CustomToastRenderer = ({ toastDuration }: { toastDuration?: number }) => {
  const { toasts } = useToasterStore();
  const modalContext = useContext(ModalVisibilityContext);
  const isInsideModal = modalContext !== null;
  const previousToastsRef = useRef<string[]>([]);
  const [showingNewToast, setShowingNewToast] = useState<string | null>(null);

  // Detect when a new toast is added
  useEffect(() => {
    const currentToastIds = toasts.map(t => t.id);
    const previousToastIds = previousToastsRef.current;
    
    // Reset showing state when no toasts
    if (toasts.length === 0) {
      setShowingNewToast(null);
      previousToastsRef.current = [];
      return;
    }
    
    // Find newly added toasts
    const newToastIds = currentToastIds.filter(id => !previousToastIds.includes(id));
    
    if (newToastIds.length > 0) {
      const newestToastId = newToastIds[0]; // Get the newest toast
      
      // First, let existing toasts shift down (no new toast visible yet)
      setShowingNewToast(null);
      
      // After a delay, show the new toast with animation
      setTimeout(() => {
        setShowingNewToast(newestToastId);
      }, 150); // 150ms delay to let existing toasts settle
    }
    
    previousToastsRef.current = currentToastIds;
  }, [toasts]);

  if (toasts.length === 0) {
    return null;
  }

  // Sort toasts by creation time, newest first (highest createdAt)
  const sortedToasts = [...toasts].sort((a, b) => b.createdAt - a.createdAt);

  const toastElements = sortedToasts.map((t, index) => {
    const topPosition = index * 68; // Each toast is 68px below the previous one
    const isNewestToast = index === 0;
    const shouldShowWithAnimation = isNewestToast && showingNewToast === t.id;
    const shouldHideTemporarily = isNewestToast && showingNewToast !== t.id;
    
    const toastClassName = classnames(styles.toast, {
      [styles.animating]: shouldShowWithAnimation,
      [styles.hidden]: shouldHideTemporarily,
      [styles.visible]: !shouldHideTemporarily,
    });
    
    return (
      <div
        key={t.id}
        className={toastClassName}
        style={{
          top: `${topPosition}px`, // Dynamic position based on index
          zIndex: 1000 - index, // Newest on top
        }}
        onClick={() => toast.dismiss(t.id)}
      >
        {typeof t.message === 'function' ? t.message(t) : t.message}
      </div>
    );
  });

  // If we're inside a modal, render directly (no portal needed)
  if (isInsideModal) {
    return (
      <div className={styles.modalContainer}>
        <div className={styles.modalContainerInner}>
          {toastElements}
        </div>
      </div>
    );
  }

  // Otherwise, render to document.body with portal
  return createPortal(
    <div className={styles.toastContainer}>
      <div className={styles.toastContainerInner}>
        <div className={styles.toastWrapper}>
          {toastElements}
        </div>
      </div>
    </div>,
    document.body
  );
};

const TOASTER_CONTAINER_STYLE: CSSProperties = {
  display: "none", // Hide the original toaster since we're using custom rendering
};

// Define default props for the component
export const defaultProps = {
  toastDuration: 5000,
};

type NotificationToastProps = {
  toastDuration?: number;
  style?: CSSProperties;
};

let toasterMounted = false;

export const NotificationToastNative = ({ 
  toastDuration = defaultProps.toastDuration,
  style 
}: NotificationToastProps) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!toasterMounted) {
      toasterMounted = true;
      setShouldRender(true);
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div style={style}>
      {/* Hidden toaster just to initialize the toast system */}
      <Toaster
        position={"top-right"}
        containerStyle={TOASTER_CONTAINER_STYLE}
        toastOptions={{ style: { padding: "12px 16px" }, duration: toastDuration }}
      />
      {/* Our custom toast renderer */}
      <CustomToastRenderer toastDuration={toastDuration} />
    </div>
  );
};

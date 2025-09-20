import { CSSProperties, useEffect, useState, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import toast, { ToastBar, Toaster, useToasterStore } from "react-hot-toast";
import classnames from "classnames";
import { ModalVisibilityContext } from "../ModalDialog/ModalVisibilityContext";
import styles from "./NotificationToast.module.scss";

// Global state to track if any modal is open
let isAnyModalOpen = false;

// Custom toast component that renders in the right place
const CustomToastRenderer = ({ 
  toastDuration, 
  modalOnly = false 
}: { 
  toastDuration?: number; 
  modalOnly?: boolean; 
}) => {
  const { toasts } = useToasterStore();
  const modalContext = useContext(ModalVisibilityContext);
  const isInsideModal = modalContext !== null;
  const previousToastsRef = useRef<string[]>([]);
  const [showingNewToast, setShowingNewToast] = useState<string | null>(null);

  // Update global modal state when this instance's modal context changes
  useEffect(() => {
    if (modalOnly && isInsideModal) {
      isAnyModalOpen = true;
      return () => {
        isAnyModalOpen = false;
      };
    }
  }, [modalOnly, isInsideModal]);

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

  // Debug logging
  console.log('CustomToastRenderer debug:', {
    modalOnly,
    modalContext,
    isInsideModal,
    isAnyModalOpen,
    toastsLength: toasts.length
  });

  // Only render toasts if we're in the right context
  // For modal instance: only render if we're inside a modal
  // For theme instance: only render if no modal is open
  const shouldRenderToasts = modalOnly ? isInsideModal : !isAnyModalOpen;

  console.log('shouldRenderToasts:', shouldRenderToasts, 'for modalOnly:', modalOnly);

  // Don't render anything if we're not in the right context
  if (!shouldRenderToasts) {
    console.log('Not rendering toasts for this instance');
    return null;
  }

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

    // Get the icon based on toast type
    const getToastIcon = () => {
      switch (t.type) {
        case 'success':
          return (
            <span className={`${styles.toastIcon} ${styles.toastIconSuccess}`}>
              ✓
            </span>
          );
        case 'error':
          return (
            <span className={`${styles.toastIcon} ${styles.toastIconError}`}>
              ✕
            </span>
          );
        case 'loading':
          return <span className={styles.toastIcon}>⏳</span>;
        case 'blank':
        default:
          return null;
      }
    };
    
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
        <div className={styles.toastContent}>
          {getToastIcon()}
          <div className={styles.toastMessage}>
            {typeof t.message === 'function' ? t.message(t) : t.message}
          </div>
        </div>
      </div>
    );
  });

  // If we're inside a modal, render directly (no portal needed)
  if (isInsideModal) {
    console.log('Rendering toasts inside modal, isInsideModal:', isInsideModal);
    return (
      <div 
        className={styles.modalContainer}
        style={{ 
          // Force the top offset to ensure it's applied
          top: '60px',
          position: 'absolute',
          right: '20px',
          zIndex: 999999,
          backgroundColor: 'rgba(255, 0, 0, 0.1)' // Debug: red tint to see container
        }}
      >
        <div className={styles.modalContainerInner}>
          {toastElements}
        </div>
      </div>
    );
  }

  console.log('Rendering toasts outside modal, using portal');

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
  modalOnly?: boolean; // New prop to control whether this instance is for modals only
};

let toasterMounted = false;

export const NotificationToastNative = ({ 
  toastDuration = defaultProps.toastDuration,
  style,
  modalOnly = false
}: NotificationToastProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [shouldRenderToaster, setShouldRenderToaster] = useState(false);

  useEffect(() => {
    // Always allow this instance to render
    setShouldRender(true);
    
    // But only initialize the global toaster once
    if (!toasterMounted) {
      toasterMounted = true;
      setShouldRenderToaster(true);
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div style={style}>
      {/* Only render the hidden toaster initialization if this is the first instance */}
      {shouldRenderToaster && (
        <Toaster
          position={"top-right"}
          containerStyle={TOASTER_CONTAINER_STYLE}
          toastOptions={{ style: { padding: "12px 16px" }, duration: toastDuration }}
        />
      )}
      {/* Our custom toast renderer */}
      <CustomToastRenderer toastDuration={toastDuration} modalOnly={modalOnly} />
    </div>
  );
};

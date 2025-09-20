import { CSSProperties, useEffect, useState, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import toast, { Toaster, useToasterStore } from "react-hot-toast";
import classnames from "classnames";
import { ModalVisibilityContext } from "../ModalDialog/ModalVisibilityContext";
import styles from "./NotificationToast.module.scss";

// Global state to track if any modal is open - using a simple event system
let isAnyModalOpen = false;
let handoffInProgress = false;
const modalStateListeners = new Set<() => void>();

const notifyModalStateChange = () => {
  modalStateListeners.forEach((listener) => listener());
};

// Custom toast component that renders in the right place
const CustomToastRenderer = ({
  modalOnly = false,
}: {
  modalOnly?: boolean;
}) => {
  const { toasts } = useToasterStore();
  const modalContext = useContext(ModalVisibilityContext);
  const isInsideModal = modalContext !== null;
  const previousToastsRef = useRef<string[]>([]);
  const [hiddenNewToastId, setHiddenNewToastId] = useState<string | null>(null); // Track toast that's temporarily hidden during shift animation
  const newToastDetectedRef = useRef<string | null>(null); // Immediate detection during render
  const [, forceUpdate] = useState({});

  // Listen for modal state changes to force re-render
  useEffect(() => {
    const listener = () => {
      forceUpdate({});
    };
    modalStateListeners.add(listener);
    return () => {
      modalStateListeners.delete(listener);
    };
  }, [modalOnly]);

  // Update global modal state when this instance's modal context changes
  useEffect(() => {
    if (modalOnly && isInsideModal) {
      if (!isAnyModalOpen) {
        // Modal is opening - IMMEDIATELY start handoff to prevent any flicker
        // Set handoff flag synchronously FIRST, before any async operations
        handoffInProgress = true;

        // Clear animation state to ensure no hiding during handoff
        setHiddenNewToastId(null);
        newToastDetectedRef.current = null;

        // Short delay to complete the transition
        //const timer = setTimeout(() => {
        isAnyModalOpen = true;
        handoffInProgress = false;
        notifyModalStateChange(); // Notify all instances of final state
        //}, 0);

        // Return cleanup that handles both timeout and modal closing
        return () => {
          //clearTimeout(timer);
          isAnyModalOpen = false;
          handoffInProgress = false;
          notifyModalStateChange(); // Notify all instances
        };
      }
    }

    // If modal closed (modalOnly=true but isInsideModal=false), ensure cleanup
    if (modalOnly && !isInsideModal && isAnyModalOpen) {
      isAnyModalOpen = false;
      handoffInProgress = false;
      notifyModalStateChange(); // Notify all instances
    }
  }, [modalOnly, isInsideModal]);

  // Simple tracking of toast IDs for animation purposes
  useEffect(() => {
    const currentToastIds = toasts.map((t) => t.id);
    const previousToastIds = previousToastsRef.current;

    // Detect new toasts (that weren't in the previous list)
    const newToastIds = currentToastIds.filter((id) => !previousToastIds.includes(id));

    // Clear hidden state if there are no toasts
    if (currentToastIds.length === 0) {
      setHiddenNewToastId(null);
      newToastDetectedRef.current = null;
    }

    if (newToastIds.length > 0 && !handoffInProgress) {
      setHiddenNewToastId(null);
      newToastDetectedRef.current = null; // Clear the ref as well
    }

    previousToastsRef.current = currentToastIds;
  }, [toasts, modalOnly, handoffInProgress]);

  // Only render toasts if we're in the right context
  const shouldRenderToasts = handoffInProgress
    ? !modalOnly
    : modalOnly
      ? isInsideModal
      : !isAnyModalOpen;

  // Don't render anything if we're not in the right context or have no toasts
  if (!shouldRenderToasts || toasts.length === 0) {
    return null;
  }

  // Sort toasts by creation time, newest first (highest createdAt)
  const sortedToasts = [...toasts].sort((a, b) => b.createdAt - a.createdAt);

  // Immediate detection during render - check for new toasts right now
  const currentToastIds = toasts.map((t) => t.id);
  const newToastIds = currentToastIds.filter((id) => !previousToastsRef.current.includes(id));

  // If we detect a new toast during render, immediately mark it for hiding
  if (
    newToastIds.length > 0 &&
    !handoffInProgress &&
    newToastDetectedRef.current !== newToastIds[0]
  ) {
    newToastDetectedRef.current = newToastIds[0];
  }

  const toastElements = sortedToasts.map((t, index) => {
    const topPosition = index * 68; // Each toast is 68px below the previous one
    const isNewestToast = index === 0;

    // Find if this toast is newly added by comparing with previous toasts
    const isNewToast = !previousToastsRef.current.includes(t.id);

    // Two-phase animation logic with immediate detection:
    // Phase 1: New toast is hidden while existing toasts shift down
    // Phase 2: New toast appears with entrance animation
    // Use ref for immediate detection during render AND state for persistent tracking
    // CRITICAL: During handoff, NEVER hide any toasts regardless of animation state
    const isHiddenForShift =
      !handoffInProgress && (hiddenNewToastId === t.id || newToastDetectedRef.current === t.id);
    const shouldAnimate =
      isNewToast &&
      isNewestToast &&
      !handoffInProgress &&
      hiddenNewToastId !== t.id &&
      newToastDetectedRef.current !== t.id;

    const toastClassName = classnames(styles.toast, {
      [styles.animating]: shouldAnimate,
      [styles.hidden]: isHiddenForShift,
      [styles.visible]: !isHiddenForShift,
    });

    // Get the icon based on toast type
    const getToastIcon = () => {
      switch (t.type) {
        case "success":
          return <span className={`${styles.toastIcon} ${styles.toastIconSuccess}`}>✓</span>;
        case "error":
          return <span className={`${styles.toastIcon} ${styles.toastIconError}`}>✕</span>;
        case "loading":
          return <span className={styles.toastIcon}>⏳</span>;
        case "blank":
        default:
          return null;
      }
    };

    return (
      <div
        key={t.id}
        className={toastClassName}
        style={{
          top: `${topPosition}px`,
        }}
        onClick={() => toast.dismiss(t.id)}
      >
        <div className={styles.toastContent}>
          {getToastIcon()}
          <div className={styles.toastMessage}>
            {typeof t.message === "function" ? t.message(t) : t.message}
          </div>
        </div>
      </div>
    );
  });

  // If we're inside a modal, render directly (no portal needed)
  if (isInsideModal) {
    return (
      <div className={styles.modalContainer} style={MODAL_CONTAINER_STYLE}>
        <div className={styles.modalContainerInner}>{toastElements}</div>
      </div>
    );
  }

  // Otherwise, render to document.body with portal
  return createPortal(
    <div className={styles.toastContainer}>
      <div className={styles.toastContainerInner}>
        <div className={styles.toastWrapper}>{toastElements}</div>
      </div>
    </div>,
    document.body,
  );
};

const TOASTER_CONTAINER_STYLE: CSSProperties = {
  display: "none", // Hide the original toaster since we're using custom rendering
};

const MODAL_CONTAINER_STYLE: CSSProperties = {
  position: "fixed",
  top: "80px",
  right: "20px",
  zIndex: 999999,
  pointerEvents: "auto",
};

// Define default props for the component
export const defaultProps = {
  toastDuration: 5000, // Back to 5 seconds
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
  modalOnly = false,
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
      <CustomToastRenderer modalOnly={modalOnly} />
    </div>
  );
};

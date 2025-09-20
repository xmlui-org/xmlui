import { CSSProperties, useEffect, useState, useContext } from "react";
import { createPortal } from "react-dom";
import toast, { ToastBar, Toaster, useToasterStore } from "react-hot-toast";
import { ModalVisibilityContext } from "../ModalDialog/ModalVisibilityContext";

// Custom toast component that renders in the right place
const CustomToastRenderer = ({ toastDuration }: { toastDuration?: number }) => {
  const { toasts } = useToasterStore();
  const modalContext = useContext(ModalVisibilityContext);
  const isInsideModal = modalContext !== null;

  if (toasts.length === 0) return null;

  // Sort toasts by creation time, newest first (highest createdAt)
  const sortedToasts = [...toasts].sort((a, b) => b.createdAt - a.createdAt);

  const toastElements = sortedToasts.map((t, index) => {
    const topPosition = index * 68; // Each toast is 68px below the previous one
    
    return (
      <div
        key={t.id}
        style={{
          position: "absolute",
          top: `${topPosition}px`, // Fixed position based on index
          right: 0,
          backgroundColor: "white",
          padding: "12px 16px",
          borderRadius: "4px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          cursor: "pointer",
          maxWidth: "300px",
          wordBreak: "break-word",
          zIndex: 1000 - index, // Newest on top
          border: "1px solid #e1e5e9",
          transition: "top 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease", // Animate position changes
          opacity: 1,
          transform: "translateX(0)", // Start in final position
          animation: index === 0 ? "slideInFromRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none", // Only animate the newest toast
        }}
        onClick={() => toast.dismiss(t.id)}
      >
        {typeof t.message === 'function' ? t.message(t) : t.message}
      </div>
    );
  });

  // Inject keyframes for the slide-in animation
  if (typeof document !== 'undefined' && !document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideInFromRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // If we're inside a modal, render directly (no portal needed)
  if (isInsideModal) {
    return (
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 999999,
          pointerEvents: "none",
          width: "300px", // Fixed width for consistent animations
        }}
      >
        <div style={{ position: "relative", pointerEvents: "auto" }}>
          {toastElements}
        </div>
      </div>
    );
  }

  // Otherwise, render to document.body with portal
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 2147483647,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          pointerEvents: "auto",
          width: "300px", // Fixed width for consistent animations
        }}
      >
        <div style={{ position: "relative" }}>
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

type NotificationToastProps = {
  toastDuration?: number;
};

let toasterMounted = false;

export const NotificationToast = ({ toastDuration }: NotificationToastProps) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!toasterMounted) {
      toasterMounted = true;
      setShouldRender(true);
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <>
      {/* Hidden toaster just to initialize the toast system */}
      <Toaster
        position={"top-right"}
        containerStyle={TOASTER_CONTAINER_STYLE}
        toastOptions={{ style: { padding: "12px 16px" }, duration: toastDuration }}
      />
      {/* Our custom toast renderer */}
      <CustomToastRenderer toastDuration={toastDuration} />
    </>
  );
};

import { CSSProperties, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { useTheme } from "../../components-core/theming/ThemeContext";

const TOASTER_CONTAINER_STYLE: CSSProperties = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 40,
  position: "absolute",
  overflowY: "hidden",
};

type NotificationToastProps = {
  toastDuration?: number;
};

let toasterMounted = false;

export const NotificationToast = ({ toastDuration }: NotificationToastProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const { root } = useTheme();

  useEffect(() => {
    if (!toasterMounted) {
      toasterMounted = true;
      setShouldRender(true);
    }
  }, []);

  if (!shouldRender) return null;
  return createPortal(
    <Toaster
      position={"top-right"}
      containerStyle={TOASTER_CONTAINER_STYLE}
      toastOptions={{ style: { padding: "12px 16px" }, duration: toastDuration }}
    >
      {(t) => (
        <div onClick={() => toast.dismiss(t.id)}>
          <ToastBar position={t.position} toast={t} style={{ wordBreak: "break-word" }}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
              </>
            )}
          </ToastBar>
        </div>
      )}
    </Toaster>,
    root,
  );
};

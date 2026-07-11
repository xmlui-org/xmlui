import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import type { ToasterProps } from "react-hot-toast";
import { useTheme } from "../../components-core/theming/ThemeContext";

export type NotificationPosition =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

export const DEFAULT_NOTIFICATION_POSITION: NotificationPosition = "top-end";

const STANDARD_CONTAINER_STYLE: CSSProperties = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 40,
  position: "absolute",
  overflowY: "hidden",
};

function resolveToasterProps(position: NotificationPosition): {
  position: ToasterProps["position"];
  containerStyle: CSSProperties;
} {
  switch (position) {
    case "top-start":
      return { position: "top-left", containerStyle: STANDARD_CONTAINER_STYLE };
    case "top-center":
      return { position: "top-center", containerStyle: STANDARD_CONTAINER_STYLE };
    case "top-end":
      return { position: "top-right", containerStyle: STANDARD_CONTAINER_STYLE };
    case "bottom-start":
      return { position: "bottom-left", containerStyle: STANDARD_CONTAINER_STYLE };
    case "bottom-center":
      return { position: "bottom-center", containerStyle: STANDARD_CONTAINER_STYLE };
    case "bottom-end":
    default:
      return { position: "bottom-right", containerStyle: STANDARD_CONTAINER_STYLE };
  }
}

type NotificationToastProps = {
  toastDuration?: number;
  notificationPosition?: NotificationPosition;
};

let toasterMounted = false;

export const NotificationToast = ({
  toastDuration,
  notificationPosition = DEFAULT_NOTIFICATION_POSITION,
}: NotificationToastProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const { root } = useTheme();

  useEffect(() => {
    if (!toasterMounted) {
      toasterMounted = true;
      setShouldRender(true);
    }
    return () => {
      toasterMounted = false;
    };
  }, []);

  if (!shouldRender) return null;

  const { position, containerStyle } = resolveToasterProps(notificationPosition);
  return createPortal(
    <Toaster
      position={position}
      containerStyle={containerStyle}
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

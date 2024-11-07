import { CSSProperties } from "react";
import toast, { ToastBar, Toaster } from "react-hot-toast";

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

export const NotificationToast = ({ toastDuration }: NotificationToastProps) => {
  return (
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
    </Toaster>
  );
};

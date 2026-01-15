import { type ReactNode, useEffect } from "react";
import { noop } from "lodash-es";

type Props = {
  children?: ReactNode;
  onMessageReceived?: (data: any, event: MessageEvent) => void;
};

export const defaultProps: Pick<Props, "onMessageReceived"> = {
  onMessageReceived: noop,
};

export function MessageListenerNative({
  children,
  onMessageReceived = defaultProps.onMessageReceived,
}: Props) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      onMessageReceived?.(event.data, event);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onMessageReceived]);

  // Return children directly as a fragment to avoid adding any wrapper elements
  return <>{children}</>;
}

import type React from "react";
import { type CSSProperties, forwardRef, memo, useEffect, useImperativeHandle, useRef } from "react";
import classnames from "classnames";

import styles from "./IFrame.module.scss";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";

type Props = {
  src?: string;
  srcdoc?: string;
  allow?: string;
  name?: string;
  referrerPolicy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
  sandbox?: string;
  style?: CSSProperties;
  className?: string;
  registerComponentApi?: RegisterComponentApiFn;
} & Pick<React.HTMLAttributes<HTMLIFrameElement>, "onLoad">;

export const IFrame = memo(forwardRef(function IFrame(
  {
    src,
    srcdoc,
    allow,
    name,
    referrerPolicy,
    sandbox,
    style,
    className,
    onLoad,
    registerComponentApi,
    ...rest
  }: Props,
  ref: React.ForwardedRef<HTMLIFrameElement>,
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Expose the iframe element to parent via ref
  useImperativeHandle(ref, () => iframeRef.current!, []);

  // Register component APIs
  useEffect(() => {
    registerComponentApi?.({
      postMessage: (message: any, targetOrigin: string = "*") => {
        const contentWindow = iframeRef.current?.contentWindow;
        if (contentWindow) {
          contentWindow.postMessage(message, targetOrigin);
        }
      },
      getContentWindow: () => {
        return iframeRef.current?.contentWindow || null;
      },
      getContentDocument: () => {
        return iframeRef.current?.contentDocument || null;
      },
    });
  }, [registerComponentApi]);

  return (
    <iframe
      {...rest}
      ref={iframeRef}
      src={src}
      srcDoc={srcdoc}
      allow={allow}
      name={name}
      referrerPolicy={referrerPolicy}
      sandbox={sandbox}
      className={classnames(className, styles.iframe)}
      style={style}
      onLoad={onLoad}
    />
  );
}));

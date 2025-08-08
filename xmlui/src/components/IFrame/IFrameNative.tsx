import React, { type CSSProperties, forwardRef, memo } from "react";
import classnames from "classnames";

import styles from "./IFrame.module.scss";

type Props = {
  src?: string;
  srcdoc?: string;
  allow?: string;
  name?: string;
  referrerPolicy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
  sandbox?: string;
  style?: CSSProperties;
  className?: string;
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
    ...rest
  }: Props,
  ref: React.ForwardedRef<HTMLIFrameElement>,
) {
  return (
    <iframe
      {...rest}
      ref={ref}
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

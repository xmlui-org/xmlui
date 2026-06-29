import type { ForwardedRef } from "react";
import { forwardRef, memo, useEffect, useMemo } from "react";
import classnames from "classnames";
import { QRCode as QRCodeLib } from "react-qr-code";

import styles from "./QRCode.module.scss";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { defaultProps } from "./QRCode.defaults";

type Props = {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  color?: string;
  backgroundColor?: string;
  title?: string;
  classes?: Record<string, string>;
  onInit?: () => void | Promise<void>;
} & React.HTMLAttributes<HTMLDivElement>;

export const QRCode = memo(
  forwardRef(function QRCode(
    {
      value,
      size,
      level = defaultProps.level,
      color = defaultProps.color,
      backgroundColor = defaultProps.backgroundColor,
      title,
      style,
      className,
      classes,
      onInit,
      ...rest
    }: Props,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    const { getThemeVar } = useTheme();
    const themeSizeVar = getThemeVar("size-QRCode");
    const themeSizeNum = themeSizeVar ? parseInt(themeSizeVar as string, 10) : undefined;
    const effectiveSize = size ?? themeSizeNum ?? defaultProps.size;

    const containerStyle = useMemo(
      () => ({ ...style, width: effectiveSize, height: effectiveSize }),
      [style, effectiveSize],
    );

    useEffect(() => {
      void onInit?.();
    }, [onInit]);

    return (
      <div
        {...rest}
        ref={ref}
        className={classnames(classes?.[COMPONENT_PART_KEY], className, styles.container)}
        style={containerStyle}
      >
        <QRCodeLib
          value={value || ""}
          size={effectiveSize}
          level={level}
          fgColor={color}
          bgColor={backgroundColor}
          title={title}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          viewBox={`0 0 ${effectiveSize} ${effectiveSize}`}
        />
      </div>
    );
  }),
);

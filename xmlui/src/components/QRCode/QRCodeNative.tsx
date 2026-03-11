import type { CSSProperties, Ref } from "react";
import { forwardRef, memo } from "react";
import classnames from "classnames";
import QRCodeLib from "react-qr-code";

import styles from "./QRCode.module.scss";
import { useTheme } from "../../components-core/theming/ThemeContext";

type Props = {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  color?: string;
  backgroundColor?: string;
  title?: string;
  style?: CSSProperties;
  className?: string;
};

export const defaultProps: Required<Pick<Props, "size" | "level" | "color" | "backgroundColor">> = {
  size: 256,
  level: "L",
  color: "#000000",
  backgroundColor: "#FFFFFF",
};

export const QRCodeNative = memo(
  forwardRef(function QRCodeNative(
    {
      value,
      size,
      level = defaultProps.level,
      color = defaultProps.color,
      backgroundColor = defaultProps.backgroundColor,
      title,
      style,
      className,
      ...rest
    }: Props,
    ref: Ref<HTMLDivElement>,
  ) {
    const { getThemeVar } = useTheme();
    const themeSizeVar = getThemeVar("size-QRCode");
    const themeSizeNum = themeSizeVar ? parseInt(themeSizeVar as string, 10) : undefined;
    const effectiveSize = size ?? themeSizeNum ?? defaultProps.size;

    return (
      <div
        {...rest}
        ref={ref}
        className={classnames(className, styles.container)}
        style={{
          ...style,
          width: effectiveSize,
          height: effectiveSize,
        }}
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

import { forwardRef, memo, useEffect, type CSSProperties } from "react";

import { defaultProps } from "./QRCode.defaults";

export type QRCodeProps = {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  color?: string;
  backgroundColor?: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  onInit?: () => void | Promise<void>;
};

export const QRCode = memo(forwardRef<HTMLDivElement, QRCodeProps>(function QRCode(
  {
    value,
    size = defaultProps.size,
    level = defaultProps.level,
    color = defaultProps.color,
    backgroundColor = defaultProps.backgroundColor,
    title,
    className,
    style,
    onInit,
    ...rest
  },
  ref,
) {
  useEffect(() => {
    void onInit?.();
  }, [onInit]);

  return (
    <div
      {...rest}
      ref={ref}
      className={["xmluiQRCode", className].filter(Boolean).join(" ")}
      style={{
        ...style,
        "--xmlui-effective-size-QRCode": `${size}px`,
      } as CSSProperties}
    >
      <svg
        role="img"
        width={String(size)}
        height={String(size)}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={title}
      >
        {title ? <title>{title}</title> : null}
        <rect width={size} height={size} fill={backgroundColor} />
        {qrCells(String(value ?? ""), size, color, level)}
      </svg>
    </div>
  );
}));

function qrCells(value: string, size: number, color: string, level: string) {
  const cells = 21;
  const quiet = 2;
  const moduleSize = size / (cells + quiet * 2);
  const seed = hash(`${level}:${value}`);
  const rects = [];
  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      if (!isFinder(x, y, cells) && !isSet(seed, x, y, value.length)) {
        continue;
      }
      rects.push(
        <rect
          key={`${x}:${y}`}
          x={(x + quiet) * moduleSize}
          y={(y + quiet) * moduleSize}
          width={moduleSize}
          height={moduleSize}
          fill={color}
        />,
      );
    }
  }
  return rects;
}

function isFinder(x: number, y: number, cells: number): boolean {
  return inFinder(x, y, 0, 0) || inFinder(x, y, cells - 7, 0) || inFinder(x, y, 0, cells - 7);
}

function inFinder(x: number, y: number, startX: number, startY: number): boolean {
  const dx = x - startX;
  const dy = y - startY;
  if (dx < 0 || dy < 0 || dx > 6 || dy > 6) {
    return false;
  }
  return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
}

function isSet(seed: number, x: number, y: number, length: number): boolean {
  const mixed = (seed + x * 1103515245 + y * 12345 + length * 2654435761) >>> 0;
  return (mixed & 0b101) === 0b101;
}

function hash(value: string): number {
  let result = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

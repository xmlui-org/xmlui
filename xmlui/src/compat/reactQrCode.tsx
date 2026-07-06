import { forwardRef } from "react";

// The original react-qr-code 2.0.18 entry is CommonJS and Vite can serve it as
// raw browser ESM from linked workspace sources. This shim preserves the named
// export expected by copied XMLUI code without importing that CJS entry.
// @ts-expect-error qr.js does not ship TypeScript declarations.
import ErrorCorrectLevel from "qr.js/lib/ErrorCorrectLevel";
// @ts-expect-error qr.js does not ship TypeScript declarations.
import QRCodeImpl from "qr.js/lib/QRCode";

type QRCodeProps = {
  bgColor?: string;
  fgColor?: string;
  level?: "L" | "M" | "Q" | "H";
  size?: number;
  title?: string;
  value: string;
  viewBox?: string;
} & React.SVGAttributes<SVGSVGElement>;

export const QRCode = forwardRef<SVGSVGElement, QRCodeProps>(function QRCode(
  {
    bgColor = "#FFFFFF",
    fgColor = "#000000",
    level = "L",
    size = 256,
    title,
    value,
    ...props
  },
  ref,
) {
  const qrcode = new QRCodeImpl(-1, ErrorCorrectLevel[level]);
  qrcode.addData(value);
  qrcode.make();
  const cells: boolean[][] = qrcode.modules;
  const bgD = cells
    .map((row, rowIndex) =>
      row.map((cell, cellIndex) => !cell ? `M ${cellIndex} ${rowIndex} l 1 0 0 1 -1 0 Z` : "").join(" "),
    )
    .join(" ");
  const fgD = cells
    .map((row, rowIndex) =>
      row.map((cell, cellIndex) => cell ? `M ${cellIndex} ${rowIndex} l 1 0 0 1 -1 0 Z` : "").join(" "),
    )
    .join(" ");

  return (
    <svg
      {...props}
      ref={ref}
      height={size}
      viewBox={`0 0 ${cells.length} ${cells.length}`}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <path d={bgD} fill={bgColor} />
      <path d={fgD} fill={fgColor} />
    </svg>
  );
});

QRCode.displayName = "QRCode";

export default QRCode;

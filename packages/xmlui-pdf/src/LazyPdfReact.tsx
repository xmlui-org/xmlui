import { memo, Suspense, lazy, forwardRef } from "react";
import type { PdfNativeProps } from "./PdfReact";

const PdfNative = lazy(() => import("./PdfReact").then(m => ({ default: m.PdfNative })));

export const LazyPdf = memo(forwardRef<HTMLDivElement, PdfNativeProps>((props, ref) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PdfNative {...props} ref={ref} />
    </Suspense>
  );
}));

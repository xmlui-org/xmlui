import { Suspense, lazy, forwardRef } from "react";
import type { PdfNativeProps } from "./PdfNative";

const PdfNative = lazy(() => import("./PdfNative").then(m => ({ default: m.PdfNative })));

export const LazyPdf = forwardRef<HTMLDivElement, PdfNativeProps>((props, ref) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PdfNative {...props} ref={ref} />
    </Suspense>
  );
});

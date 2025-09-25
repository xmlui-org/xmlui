import { Suspense, lazy, forwardRef } from "react";

const Pdf = lazy(() => import("./Pdf"));

interface Props {
  src?: string;
  data?: any; // Binary data for PDF content
}

export const LazyPdf = forwardRef((props: Props, ref) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Pdf {...props} ref={ref} />
    </Suspense>
  );
});

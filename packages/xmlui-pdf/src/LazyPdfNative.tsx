import { Suspense, lazy, forwardRef } from "react";

const Pdf = lazy(() => import("./Pdf"));

interface Props {
  src: string;
}

export const LazyPdf = forwardRef((props: Props, ref) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Pdf {...props} ref={ref} />
    </Suspense>
  );
});

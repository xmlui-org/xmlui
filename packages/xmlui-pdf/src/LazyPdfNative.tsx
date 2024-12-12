import { Suspense, lazy } from "react";

const Pdf = lazy(() => import("./Pdf"));

interface Props {
  src: string;
}

export const LazyPdf = (props: Props) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Pdf {...props} />
    </Suspense>
  );
};

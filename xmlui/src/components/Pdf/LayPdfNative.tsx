import React, { Suspense } from "react";

const Pdf = React.lazy(() => import("./Pdf"));

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


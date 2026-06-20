import { memo, useEffect } from "react";

import { defaultProps } from "./PageMetaTitle.defaults";

export const PageMetaTitle = memo(function PageMetaTitle({
  title = defaultProps.title,
  noSuffix = defaultProps.noSuffix,
  appName = "test bed app",
}: {
  title?: string;
  noSuffix?: boolean;
  appName?: string;
}) {
  useEffect(() => {
    document.title = !noSuffix && appName ? `${title} | ${appName}` : title;
  }, [appName, noSuffix, title]);
  return null;
});

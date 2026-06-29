import { memo, useEffect } from "react";

import { useXmluiAppContext } from "../../runtime/appContext";
import { defaultProps } from "./PageMetaTitle.defaults";

export const PageMetaTitle = memo(function PageMetaTitle({
  title = defaultProps.title,
  noSuffix = defaultProps.noSuffix,
}: {
  title?: string;
  noSuffix?: boolean;
}) {
  const { appGlobals } = useXmluiAppContext();
  const appName = typeof appGlobals.name === "string" ? appGlobals.name : undefined;

  useEffect(() => {
    document.title = !noSuffix && appName ? `${title} | ${appName}` : title;
  }, [appName, noSuffix, title]);
  return null;
});

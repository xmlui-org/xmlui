import { useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useAppContext } from "../../components-core/AppContext";

// Default props for PageMetaTitle component
export const defaultProps = {
  title: "XMLUI Application",
  noSuffix: false,
};

export const PageMetaTitle = ({
  title = defaultProps.title,
  noSuffix = defaultProps.noSuffix,
}: {
  title: string;
  noSuffix?: boolean;
}) => {
  const { appGlobals } = useAppContext();
  const appName = appGlobals?.name;

  // When HelmetProvider.canUseDOM is false (e.g. after a previewMode AppWrapper renders
  // on a docs page), Helmet can no longer dispatch DOM updates. In that case, we fall
  // back to setting document.title directly so navigation still updates the browser tab.
  useEffect(() => {
    if (!HelmetProvider.canUseDOM) {
      document.title = !noSuffix && appName ? `${title} | ${appName}` : title;
    }
  }, [title, appName, noSuffix]);
  return noSuffix
    ? <Helmet title={title} titleTemplate="%s" />
    : <Helmet title={title} />;
};

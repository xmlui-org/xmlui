import { useXmluiAppContext } from "../runtime/appContext";
import { useEffect, useState } from "react";
import { responsiveBreakpoints } from "../styling";

const noop = () => {};
const defaultTranslations: Record<string, string> = {
  "xmlui.form.cancel": "Cancel",
  "xmlui.form.save": "Save",
  "xmlui.form.saving": "Saving...",
  "xmlui.form.validating": "Validating...",
  "xmlui.validation.email": "Not a valid email address",
  "xmlui.validation.url": "Not a valid URL",
  "xmlui.validation.phone": "Not a valid phone number",
  "xmlui.validation.isoDate": "Not a valid ISO 8601 date",
  "xmlui.validation.length": "Invalid length",
  "xmlui.validation.iban": "Not a valid IBAN",
  "xmlui.validation.creditCard": "Not a valid credit card number",
  "xmlui.validation.strongPassword":
    "Password must be at least 12 characters and include upper, lower, digit, and symbol",
  "xmlui.validation.noLeadingTrailingWhitespace": "Value must not start or end with whitespace",
};

export function useAppContext(): {
  appGlobals: Record<string, any>;
  loggedInUser: unknown;
  xmluiConfig: Record<string, any>;
  navigate: (...args: any[]) => void;
  setLoggedInUser: (user: unknown) => void;
  setNavigationHandlers: (handlers: unknown) => void;
  forceRefreshAnchorScroll: () => void;
  mediaSize: {
    sizeIndex: number;
    largeScreen: boolean;
    smallScreen: boolean;
    desktop: boolean;
    phone: boolean;
    tablet: boolean;
  };
  App: Record<string, (...args: any[]) => any>;
} {
  const appContext = useXmluiAppContext();
  const sizeIndex = useViewportSizeIndex();
  return {
    ...appContext,
    appGlobals: appContext.appGlobals as Record<string, any>,
    loggedInUser: appContext.loggedInUser,
    xmluiConfig: {},
    navigate: noop,
    setLoggedInUser: appContext.setLoggedInUser,
    setNavigationHandlers: noop,
    forceRefreshAnchorScroll: noop,
    mediaSize: {
      sizeIndex,
      largeScreen: sizeIndex >= 3,
      smallScreen: sizeIndex < 3,
      desktop: sizeIndex >= 3,
      phone: sizeIndex <= 1,
      tablet: sizeIndex === 2,
    },
    App: {
      setLocale: noop,
      registerLocaleBundles: noop,
      setAuditPolicy: noop,
      setAppDirection: noop,
      isRtlLocale: () => false,
      translate: (key: string) => defaultTranslations[key] ?? key,
      setScheduler: noop,
    },
  };
}

function useViewportSizeIndex(): number {
  const [sizeIndex, setSizeIndex] = useState(() =>
    typeof window === "undefined" ? 4 : sizeIndexFromWidth(window.innerWidth),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const update = () => setSizeIndex(sizeIndexFromWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return sizeIndex;
}

function sizeIndexFromWidth(width: number): number {
  if (width >= responsiveBreakpoints.xxl) return 5;
  if (width >= responsiveBreakpoints.xl) return 4;
  if (width >= responsiveBreakpoints.lg) return 3;
  if (width >= responsiveBreakpoints.md) return 2;
  if (width >= responsiveBreakpoints.sm) return 1;
  return 0;
}

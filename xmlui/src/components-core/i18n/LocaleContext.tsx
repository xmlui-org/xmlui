import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  DEFAULT_LOCALE_PROFILE,
  normalizeLocaleProfile,
  type LocaleProfile,
  type LocaleProfileInput,
} from "./locale-profile";

const LocaleContext = createContext<LocaleProfile>(DEFAULT_LOCALE_PROFILE);

type LocaleProfileProviderProps = LocaleProfileInput & {
  children: ReactNode;
  profile?: LocaleProfileInput;
  parent?: LocaleProfile;
  onInvalidLocale?: (locale: string) => void;
};

export function LocaleProfileProvider({
  children,
  profile,
  parent,
  onInvalidLocale,
  locale,
  source,
  decimalSeparator,
  groupSeparator,
  thousandSeparator,
  minusSign,
  currency,
  numberingSystem,
}: LocaleProfileProviderProps) {
  const inheritedProfile = useContext(LocaleContext);
  const parentProfile = parent ?? inheritedProfile;
  const value = useMemo(
    () =>
      normalizeLocaleProfile(
        profile ?? {
          locale,
          source,
          decimalSeparator,
          groupSeparator,
          thousandSeparator,
          minusSign,
          currency,
          numberingSystem,
        },
        parentProfile,
        onInvalidLocale,
      ),
    [
      profile,
      locale,
      source,
      decimalSeparator,
      groupSeparator,
      thousandSeparator,
      minusSign,
      currency,
      numberingSystem,
      parentProfile,
      onInvalidLocale,
    ],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleProfile(): LocaleProfile {
  return useContext(LocaleContext);
}

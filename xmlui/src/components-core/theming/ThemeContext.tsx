import React, { useContext } from "react";
import type { AppThemes, ThemeScope } from "../../abstractions/ThemingDefs";

export const ThemeContext = React.createContext<ThemeScope | undefined>(undefined);
export const ThemesContext = React.createContext<AppThemes | undefined>(undefined);

// This React hook makes the current theme information available within any component logic using the hook.
export function useTheme(): ThemeScope {
  return useContext(ThemeContext)!;
}

export function useThemes(): AppThemes {
  return useContext(ThemesContext)!;
}

export function useResourceUrl(resourceString?: string) {
  const { getResourceUrl } = useTheme();
  return getResourceUrl(resourceString);
}

import type { Dispatch, SetStateAction } from "react";

// This type describes one the available theme tones.
export type ThemeTone = "light" | "dark";

// When rendering any part of an XMLUI app, the styles to apply are enclosed in a 
// theme scope. Most apps use a single theme scope that includes all nodes within 
// the root app node. However, any app can use multiple theme scopes.
//
// The scope determines how the app applies styles to the particular section. This 
// type defines the properties of such a theme scope.
export type ThemeScope = {
  // Gets the id of the scope's theme
  activeThemeId: string; 

  // Gets the current tone of the scope's theme
  activeThemeTone: ThemeTone; 

  // The HTML element that works as the root of the theme's scope.
  root: HTMLElement | undefined; 

  // The active theme in the current scope
  activeTheme: ThemeDefinition; 

  // This hash object stores the CSS theme variable names with their CSS values 
  // definition, like "--xmlui-verticalAlignment-Text-sub": "sub";
  // "--xmlui-backgroundColor": "var(--xmlui-color-surface-50)"
  themeStyles: Record<string, string>;

  // This hash object stores the theme variable names with their CSS values definition,
  // like "verticalAlignment-Text-sub": "sub"; 
  // "backgroundColor": "var(--xmlui-color-surface-50)".
  themeVars: Record<string, string>;

  // This function retrieves the physical path of the provided resource. The path can
  // be used as a URL in HTML tags, like in the `src` attribute of `<img>`.
  getResourceUrl: (resourceString?: string) => string | undefined;

  // This function gets the value of the specified theme variable.
  getThemeVar: (themeVar: string) => string | undefined;
};

// This type represents the object managing app themes. When an app runs, styles are
// applied according to the current (active) application theme and tone.
export type AppThemes = {
  root: HTMLElement | undefined; // Represents the root HTML element the theme is assigned to

  // Sets the active theme id
  setActiveThemeId: (newThemeId: string) => void; 

  // Sets the active theme tone
  setActiveThemeTone: (newTone: ThemeTone) => void; 

  // Toggles the current theme tone
  toggleThemeTone: () => void; 

  // Gets the id of the active theme
  activeThemeId: string; 

  // Gets the tone of the active theme
  activeThemeTone: ThemeTone; 

  // This array holds all theme definitions available in the app.
  themes: Array<ThemeDefinition>; 

  // This array holds all resource definitions available in the app.
  resources: Record<string, string>; 

  // During the build process, resources may be renamed (resource folder and file
  // hierarchy flattened). This map resolves the original resource URLs to their
  // corresponding names created during the build.
  resourceMap: Record<string, string>;

  // This array lists the ids of available themes in the app.
  availableThemeIds: Array<string>; 

  // This property holds the current theme definition used in the app.
  activeTheme: ThemeDefinition; 
};

// This type describes a font definition resource.
export type FontDef =
  | {
      // Specifies a name that will be used as the font face value for font properties
      fontFamily: string;

      // A fontStyle value. Accepts two values to specify a range that is supported by
      // a font-face, for example `fontStyle: oblique 20deg 50deg`
      fontStyle?: string;

      // A font-weight value. Accepts two values to specify a range that is supported by
      // a font-face, for example `font-weight: 100 900`
      fontWeight?: string;

      // This property determines how a font face is displayed based on whether and
      // when it is downloaded and ready to use.
      fontDisplay?: string;

      // The mime type of the font file
      format?: string; 

      // Specifies references to font resources.
      src: string; 
    }
  | string;

export interface ThemeDefinitionDetails {
  themeVars?: Record<string, string>;
  resources?: Record<string, string | FontDef>;
}

// This type represents a theme definition object. Theme files can use this object's 
// JSON-serialized format to define an app theme; an app can have multiple theme files.
export interface ThemeDefinition extends ThemeDefinitionDetails {
  // Theme id
  id: string; 

  // Optional theme name
  name?: string; 

  // A theme can extend existing themes. The extension means that the theme variable
  // values defined in the new theme override the base theme's variable values.
  extends?: string | Array<string>;

  // This property defines the tone-dependent theme variable values. When a theme 
  // variable value is resolved, the common theme variable values are overridden with 
  // their theme-specific values.
  tones?: Record<string | ThemeTone, ThemeDefinitionDetails>;
}

export type DefaultThemeVars = Record<string | ThemeTone, string | Record<string, string>>;

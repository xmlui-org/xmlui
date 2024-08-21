import type { ThemeDefinition } from "@components-core/theming/abstractions";

import { palette } from "./palette";

const {
  $colorSurface50,
  $colorSurface100,
  $colorSurface200,
  $colorSurface300,
  $colorSurface400,
  $colorSurface500,
  $colorSurface500A80,
  $colorSurface500A60,
  $colorSurface600,
  $colorSurface700,
  $colorSurface800,
  $colorSurface900,
  $colorSurface950,

  $colorPrimary50,
  $colorPrimary950,

  $colorWarn700,

  $colorDanger400,
  $colorDanger500,
  $colorDanger600,
  $colorDanger700,

  $colorSuccess600,
} = palette;

// --- This theme contains the application-bound base theme variables and their default values.
// --- Individual controls also add their component-specific default theme variable values.
export const RootThemeDefinition: ThemeDefinition = {
  id: "root",
  resources: {
    "font.inter": "https://rsms.me/inter/inter.css"
  },
  themeVars: {
    // --- The unit of measurement for all sizes/spaces
    "space-base": "0.25rem",

    // --- Default surface color shades (form white to black)
    "color-surface-50": "hsl(204,30.3%,98%)",
    "color-surface-100": "hsl(204,30.3%,95%)",
    "color-surface-200": "hst(204,30.3%,83%)",
    "color-surface-300": "hsl(204,30.3%,75%)",
    "color-surface-400": "hsl(204,30.3%,63%)",
    "color-surface-500": "hsl(204,30.3%,52%)",
    "color-surface-600": "hs1(204,30.3%,40%)",
    "color-surface-700": "hsl(204,30.3%,32%)",
    "color-surface-800": "hs1(204,30.3%,27%);",
    "color-surface-900": "hsl(204,30.3%,16%)",
    "color-surface-950": "hsl(204,30.3%,13%)",
    "color-surface": "$color-surface-500", // #24656

    // --- Primary color shades (bluish)
    "color-primary-50": "hsl(212,71.9%,94.5%)",
    "color-primary-100": "hsl(212,71.9%,89.1%)",
    "color-primary-200": "hsl(212,71.9%,78.1%)",
    "color-primary-300": "hsl(212,71.9%,67.2%)",
    "color-primary-400": "hsl(212,71.9%,56.3%)",
    "color-primary-500": "#206bc4",
    "color-primary-600": "hsl(212,71.9%,36.3%)",
    "color-primary-700": "hsl(212,71.9%,27.2%)",
    "color-primary-800": "hsl(212,71.9%,18.1%)",
    "color-primary-900": "hsl(212,71.9%,9.1%)",
    "color-primary-950": "hsl(212,71.9%,4.5%)",
    "color-primary": "$color-primary-500",

    // --- Secondary color shades (steel-bluish)
    "color-secondary-50": "hsl(211.7,21.2%,96.9%)",
    "color-secondary-100": "hsl(211.7,21.2%,93.7%)",
    "color-secondary-200": "hsl(211.7,21.2%,87.4%)",
    "color-secondary-300": "hsl(211.7,21.2%,81.1%)",
    "color-secondary-400": "hsl(211.7,21.2%,74.8%)",
    "color-secondary-500": "#6c7a91",
    "color-secondary-600": "hsl(211.7,21.2%,54.8%)",
    "color-secondary-700": "hsl(211.7,21.2%,41.1%)",
    "color-secondary-800": "hsl(211.7,21.2%,27.4%)",
    "color-secondary-900": "hsl(211.7,21.2%,13.7%)",
    "color-secondary-950": "hsl(211.7,21.2%,6.9%)",
    "color-secondary": "$color-secondary-500",

    // --- Warning color shades (orange shades)
    "color-warn-50": "#fffaec",
    "color-warn-100": "#fff4d3",
    "color-warn-200": "#ffe5a5",
    "color-warn-300": "#ffd16d",
    "color-warn-400": "#ffb232",
    "color-warn-500": "#ff980a",
    "color-warn-600": "#f57b00",
    "color-warn-700": "#cc5d02",
    "color-warn-800": "#a1480b",
    "color-warn-900": "#823d0c",
    "color-warn-950": "#461d04",
    "color-warn": "$color-warn-500",

    // --- Danger color shades (reddish)
    "color-danger-50": "#fff1f2",
    "color-danger-100": "#ffdfe1",
    "color-danger-200": "#ffc5c9",
    "color-danger-300": "#ff9ca3",
    "color-danger-400": "#ff636e",
    "color-danger-500": "#ff3240",
    "color-danger-600": "#ea101f",
    "color-danger-700": "#c90c19",
    "color-danger-800": "#a60e18",
    "color-danger-900": "#89131b",
    "color-danger-950": "#4b0409",
    "color-danger": "$color-danger-600",
    "color-attention": "$color-danger-500",

    // --- Success color shades (greenish)
    "color-success-50": "hsl(129.5,58.4%,96.4%)",
    "color-success-100": "hsl(129.5,58.4%,92.9%)",
    "color-success-200": "hsl(129.5,58.4%,85.7%)",
    "color-success-300": "hsl(129.5,58.4%,78.6%)",
    "color-success-400": "hsl(129.5,58.4%,71.5%)",
    "color-success-500": "#2fb344",
    "color-success-600": "hsl(129.5,58.4%,51.5%)",
    "color-success-700": "hsl(129.5,58.4%,38.6%)",
    "color-success-800": "hsl(129.5,58.4%,25.7%)",
    "color-success-900": "hsl(129.5,58.4%,12.9%)",
    "color-success-950": "hsl(129.5,58.4%,6.4%)",
    "color-success": "$color-success-500",

    // --- Font weights
    "font-weight-light": "300",
    "font-weight-normal": "400",
    "font-weight-medium": "500",
    "font-weight-bold": "600",
    "font-weight-extra-bold": "900",

    // --- Default text colors (component use these values as their defaults)
    "color-text-primary": "$color-surface-950",
    "color-text-attention": "$color-danger-600",
    "color-text-subtitle": "$color-surface-500",
    "color-text--disabled": "$color-surface-400",

    // --- Default background colors (component use these values as their defaults)
    "color-bg-primary": "$color-surface-50",
    "color-bg-secondary": "$color-surface-50",
    "color-bg-attention": "$color-attention",
    "color-bg--disabled": "$color-surface-50",
    "color-bg--selected": "$color-primary-50",

    // --- Various default colors
    "color-info": "$color-surface-700",
    "color-valid": "$color-success-600",
    "color-warning": "$color-warn-700",
    "color-error": "$color-danger-600",

    // --- Default line height values (relative to the base unit, "space-base")
    "line-height-none": "1",
    "line-height-tight": "1.25",
    "line-height-snug": "1.375",
    "line-height-normal": "1.5",
    "line-height-relaxed": "1.625",
    "line-height-loose": "2",

    // --- The sans-serif font set
    "font-family-sans-serif":
      "'Inter', -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif",

    // --- The monospace font set
    "font-family-monospace":
      "Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace",
    "font-feature-settings": "'cv03', 'cv04', 'cv11'",

    // --- Some media breakpoints (review them)
    "media-max-width-phone": "420px",
    "media-max-width-tablet": "800px",

    // --- The app's default radius value
    radius: "4px",
    "color-outline--focus": "rgba($color-primary-500-rgb, .5)",
    "thickness-outline--focus": "2px",
    "style-outline--focus": "solid",
    "offset-outline--focus": "0",

    // --- The app's default font family
    "font-family": "$font-family-sans-serif",

    // --- Various font sizes (relative to the current context)
    "font-size-gigantic": "3rem",
    "font-size-large": "1.5rem",
    "font-size-medium": "1.25rem",
    "font-size-normal": "1rem",
    "font-size-small": "0.875rem",
    "font-size-smaller": "0.75rem",
    "font-size-tiny": "0.625rem",

    // --- The default font size
    "font-size": "$font-size-normal",

    // --- Font used for body
    "font-weight": "$font-weight-normal",

    // --- Various default values (review them)
    "color-border-dropdown-item": "$color-border",

    // --- Various predefined shadow values
    shadow: "0 1px 3px 0 rgba(0, 0, 0, .1), 0 1px 2px 0 rgba(0, 0, 0, .06)",
    "shadow-md":
      "0 4px 6px -1px rgba(0, 0, 0, .1), 0 2px 4px -1px rgba(0, 0, 0, .06)",
    "shadow-xxl":
      "0 8px 17px 0 rgba(0, 0, 0, .2), 0 6px 20px 0 rgba(0, 0, 0, .19)",
    "shadow-spread": "0px 0px 30px rgba(0, 0, 0, 0.1)",
    "shadow-spread-2": "-6px -4px 40px 10px rgba(0, 0, 0, 0.1)",
    "shadow-spread-2-xl": "-6px -4px 40px 18px rgba(0, 0, 0, 0.1)",

    // --- The default maximum content width
    "max-content-width": "1320px",

    "size-Icon": "1.25em",

    "shadow-Avatar": "inset 0 0 0 1px rgba(4, 32, 69, 0.1)",
    "border-size-Avatar": "0px",
    "radius-Avatar": "4px",

    "shadow-AppHeader": "none",
    // "height-AppHeader": "3.5rem",

    "padding-horizontal-NavPanel-horizontal": "1rem",
    "padding-vertical-HeaderLogo": "0.7rem",

    "padding-TableCell": ".75rem",
    "padding-TableHeading": ".5rem .75rem .5rem .75rem",
    "color-bg-TableRow--hover": "transparent",

    "shadow-NavPanel-vertical": "none",
    "width-NavPanel-vertical": "15rem",
  },
  tones: {
    light: {
      themeVars: {
        // --- Background colors
        "color-bg": $colorSurface50,
        "color-bg-primary": $colorSurface50,
        "color-bg-secondary": $colorSurface50,
        "color-bg--disabled": $colorSurface50,
        "color-bg--selected": $colorPrimary50,
        "color-bg-overlay": "rgba(0, 0, 0, 0.2)",
        "color-bg-dropdown-item--hover": $colorSurface100,
        "color-bg-dropdown-item--active": $colorSurface200,
        "color-bg-dropdown-item--active-hover": $colorSurface50,
        "color-bg-tree-row--selected--before": $colorPrimary50,

        // --- Various default colors
        "color-info": $colorSurface950,
        "color-valid": $colorSuccess600,
        "color-warning": $colorWarn700,
        "color-error": $colorDanger700,

        // --- Border colors
        "color-border": $colorSurface100,
        "color-border--disabled": $colorSurface200,
        "color-border-dropdown-item": $colorSurface600,

        // --- Text colors
        "color-text-primary": $colorSurface950,
        "color-text-secondary": $colorSurface600,
        "color-text-attention": $colorDanger600,
        "color-text-subtitle": $colorSurface500,
        "color-text--disabled": $colorSurface400,

        // --- Input is an abstract component, so we define its default theme variables here
        "color-bg-Input-default": "white",
        "color-border-Input-default": $colorSurface400,
        "color-border-Input-default--hover": $colorSurface600,
        "color-border-Input-default--focus": $colorSurface600,
        "color-border-Input-default--success": $colorSuccess600,
        "color-border-Input-default--warning": $colorWarn700,
        "color-border-Input-default--error": $colorDanger600,

        // --- InputLabel is a React component, so we define its default theme variables here
        "color-text-InputLabel-required": $colorDanger600,
      },
    },
    dark: {
      themeVars: {
        // --- Background colors
        "color-bg": $colorSurface950,
        "color-bg-primary": $colorSurface900,
        "color-bg-secondary": $colorSurface800,
        "color-bg--disabled": $colorSurface800,
        "color-bg--selected": $colorSurface700,
        "color-bg-overlay": "rgba(0, 0, 0, 0.4)",
        "color-bg-dropdown-item--hover": $colorSurface500A60,
        "color-bg-dropdown-item--active": $colorSurface500A80,
        "color-bg-tree-row--selected--before": $colorPrimary950,

        // --- Various default colors
        "color-info": $colorSurface50,
        "color-valid": $colorSuccess600,
        "color-warning": $colorWarn700,
        "color-error": $colorDanger700,

        // --- Border colors
        "color-border": $colorSurface800,
        "color-border--disabled": $colorSurface700,
        "color-border-dropdown-item": $colorSurface300,

        // --- Text colors
        "color-text-primary": $colorSurface100,
        "color-text-secondary": $colorSurface400,
        "color-text-attention": $colorDanger400,
        "color-text-subtitle": $colorSurface500,
        "color-text--disabled": $colorSurface500,

        // --- Input is an abstract component, so we define its default theme variables here
        "color-bg-Input-default": $colorSurface950,
        "color-bg-Input-warning": $colorSurface950,
        "color-bg-Input-error": $colorSurface950,
        "color-bg-Input-success": $colorSurface950,
        "color-border-Input-default": $colorSurface400,
        "color-border-Input-default--hover": $colorSurface200,
        "color-border-Input-default--focus": $colorSurface200,
        "color-border-Input-default--success": $colorSuccess600,
        "color-border-Input-default--warning": $colorWarn700,
        "color-border-Input-default--error": $colorDanger500,

        // --- InputLabel is a React component, so we define its default theme variables here
        "color-text-InputLabel-required": $colorDanger400,
      },
    },
  },
};

import type { ThemeDefinition } from "../abstractions";

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

  $colorInfo600,
  $colorInfo800,
} = palette;

// --- This theme contains the application-bound base theme variables and their default values.
// --- Individual controls also add their component-specific default theme variable values.
export const RootThemeDefinition: ThemeDefinition = {
  id: "root",
  resources: {
    "font.inter": "https://rsms.me/inter/inter.css",
  },
  themeVars: {
    // --- The unit of measurement for all sizes/spaces
    "space-base": "0.25rem",

    // --- Default surface color shades (form white to black)
    "color-surface-50": "hsl(204, 30.3%, 96.5%)",
    "color-surface-100": "hsl(204, 30.3%, 93%)",
    "color-surface-200": "hsl(204, 30.3%, 85%)",
    "color-surface-300": "hsl(204, 30.3%, 75%)",
    "color-surface-400": "hsl(204, 30.3%, 65%)",
    "color-surface-500": "hsl(204, 30.3%, 52%)", // #6894AD
    "color-surface-600": "hsl(204, 30.3%, 45%)",
    "color-surface-700": "hsl(204, 30.3%, 35%)",
    "color-surface-800": "hsl(204, 30.3%, 27%)",
    "color-surface-900": "hsl(204, 30.3%, 16%)",
    "color-surface-950": "hsl(204, 30.3%, 13%)",
    "color-surface": "$color-surface-500",

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
    "color-warn-50": "hsl(45, 100%, 97%)",
    "color-warn-100": "hsl(45, 100%, 91%)",
    "color-warn-200": "hsl(45, 100%, 80%)",
    "color-warn-300": "hsl(45, 100%, 70%)",
    "color-warn-400": "hsl(45, 100%, 60%)",
    "color-warn-500": "hsl(35, 100%, 50%)", // #ff980a
    "color-warn-600": "hsl(35, 100%, 45%)",
    "color-warn-700": "hsl(35, 100%, 40%)",
    "color-warn-800": "hsl(35, 100%, 35%)",
    "color-warn-900": "hsl(35, 100%, 30%)",
    "color-warn-950": "hsl(35, 100%, 15%)",
    "color-warn": "$color-warn-500",

    // --- Danger color shades (reddish)
    "color-danger-50": "hsl(356, 100%, 95%)",
    "color-danger-100": "hsl(356, 100%, 91%)",
    "color-danger-200": "hsl(356, 100%, 80%)",
    "color-danger-300": "hsl(356, 100%, 70%)",
    "color-danger-400": "hsl(356, 100%, 60%)",
    "color-danger-500": "hsl(356, 100%, 50%)", // #ff3240
    "color-danger-600": "hsl(356, 100%, 45%)",
    "color-danger-700": "hsl(356, 100%, 40%)",
    "color-danger-800": "hsl(356, 100%, 35%)",
    "color-danger-900": "hsl(356, 100%, 30%)",
    "color-danger-950": "hsl(356, 100%, 15%)",
    "color-danger": "$color-danger-600",
    "color-attention": "$color-danger-500",

    // --- Success color shades (greenish)
    "color-success-50": "hsl(129.5, 58.4%, 96.4%)",
    "color-success-100": "hsl(129.5, 58.4%, 92.9%)",
    "color-success-200": "hsl(129.5, 58.4%, 85.7%)",
    "color-success-300": "hsl(129.5, 58.4%, 78.6%)",
    "color-success-400": "hsl(129.5, 58.4%, 71.5%)",
    "color-success-500": "hsl(129.5, 58.4%, 51.5%)", // #2fb344
    "color-success-600": "hsl(129.5, 58.4%, 45%)",
    "color-success-700": "hsl(129.5, 58.4%, 38.6%)",
    "color-success-800": "hsl(129.5, 58.4%, 25.7%)",
    "color-success-900": "hsl(129.5, 58.4%, 12.9%)",
    "color-success-950": "hsl(129.5, 58.4%, 6.4%)",
    "color-success": "$color-success-500",

    "color-info-50": "hsl(183, 97%, 95%)",
    "color-info-100": "hsl(183, 97%, 90%)",
    "color-info-200": "hsl(183, 97%, 80%)",
    "color-info-300": "hsl(183, 97%, 70%)",
    "color-info-400": "hsl(183, 97%, 60%)",
    "color-info-500": "hsl(183, 97%, 50%)", // #02C4CE
    "color-info-600": "hsl(183, 97%, 45%)",
    "color-info-700": "hsl(183, 97%, 35%)",
    "color-info-800": "hsl(183, 97%, 25%)",
    "color-info-900": "hsl(183, 97%, 15%)",
    "color-info-950": "hsl(183, 97%, 10%)",

    // --- Font weights
    "fontWeight-light": "300",
    "fontWeight-normal": "400",
    "fontWeight-medium": "500",
    "fontWeight-bold": "600",
    "fontWeight-extra-bold": "900",

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
    "color-info": "$color-info-500",
    "color-valid": "$color-success-600",
    "color-warning": "$color-warn-700",
    "color-error": "$color-danger-600",

    // --- Default line height values (relative to the base unit, "space-base")
    "lineHeight-none": "1",
    "lineHeight-tight": "1.25",
    "lineHeight-snug": "1.375",
    "lineHeight-normal": "1.5",
    "lineHeight-relaxed": "1.625",
    "lineHeight-loose": "2",

    // --- The sans-serif font set
    "fontFamily-sans-serif":
      "'Inter', -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif",

    // --- The monospace font set
    "fontFamily-monospace": "Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace",
    "font-feature-settings": "'cv03', 'cv04', 'cv11'",

    // --- Some media breakpoints (review them)
    "media-maxWidth-phone": "576px",
    "media-maxWidth-landscape-phone": "768px",
    "media-maxWidth-tablet": "992px",
    "media-maxWidth-desktop": "1200px",
    "media-maxWidth-large-desktop": "1400px",

    // --- The app's default radius value
    borderRadius: "4px",
    "outlineColor--focus": "rgba($color-primary-500-rgb, .5)",
    "outlineWidth--focus": "2px",
    "outlineStyle--focus": "solid",
    "outlineOffset--focus": "0",

    // --- The app's default font family
    "fontFamily": "$fontFamily-sans-serif",

    // --- Various font sizes (relative to the current context)
    "fontSize-gigantic": "3rem",
    "fontSize-large": "1.5rem",
    "fontSize-medium": "1.25rem",
    "fontSize-normal": "1rem",
    "fontSize-small": "0.875rem",
    "fontSize-smaller": "0.75rem",
    "fontSize-tiny": "0.625rem",

    // --- The default font size
    "fontSize": "$fontSize-normal",

    // --- Predefined gap sizes
    "gap-none": "$space-0",
    "gap-tight": "$space-2",
    "gap-normal": "$space-4",
    "gap-loose": "$space-8",

    // --- Predefined paddings
    "padding-none": "$space-0",
    "padding-tight": "$space-2",
    "padding-normal": "$space-4",
    "padding-loose": "$space-8",

    // --- Predefined spaces
    "space-none": "$space-0",
    "space-tight": "$space-2",
    "space-normal": "$space-4",
    "space-loose": "$space-8",

    // --- Font used for body
    "fontWeight": "$fontWeight-normal",

    // --- Various default values (review them)
    "borderColor-dropdown-item": "$borderColor",

    // --- Various predefined shadow values
    shadow: "0 1px 3px 0 rgba(0, 0, 0, .1), 0 1px 2px 0 rgba(0, 0, 0, .06)",
    "shadow-md": "0 4px 6px -1px rgba(0, 0, 0, .1), 0 2px 4px -1px rgba(0, 0, 0, .06)",
    "shadow-xl":
      "0 16px 24px 2px rgba(0, 0, 0, 0.07), 0 6px 30px 5px rgba(0, 0, 0, 0.06), 0 8px 10px -5px rgba(0, 0, 0, 0.1)",
    "shadow-xxl": "0 8px 17px 0 rgba(0, 0, 0, .2), 0 6px 20px 0 rgba(0, 0, 0, .19)",
    "shadow-spread": "0px 0px 30px rgba(0, 0, 0, 0.1)",
    "shadow-spread-2": "-6px -4px 40px 10px rgba(0, 0, 0, 0.1)",
    "shadow-spread-2-xl": "-6px -4px 40px 18px rgba(0, 0, 0, 0.1)",

    // --- The default maximum content width
    "max-content-width": "1320px",

    "size-Icon": "1.25em",

    "boxShadow-Avatar": "inset 0 0 0 1px rgba(4, 32, 69, 0.1)",
    "border-size-Avatar": "0px",
    "borderRadius-Avatar": "4px",

    "boxShadow-header-App": "none",
    // "height-AppHeader": "3.5rem",

    "paddingHorizontal-NavPanel-horizontal": "1rem",
    "paddingVertical-HeaderLogo": "0.7rem",

    "padding-TableCell": ".75rem",
    "padding-TableHeading": ".5rem .75rem .5rem .75rem",
    "color-bg-TableRow--hover": "transparent",

    "boxShadow-NavPanel-vertical": "none",
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
        "color-bg-dropdown-item--active": $colorSurface100,
        "color-bg-dropdown-item--active-hover": $colorSurface50,
        "color-bg-tree-row--selected--before": $colorPrimary50,

        // --- Various default colors
        "color-info": "$color-info-800",
        "color-valid": $colorSuccess600,
        "color-warning": $colorWarn700,
        "color-error": $colorDanger700,

        // --- Border colors
        "borderColor": $colorSurface200,
        "borderColor--disabled": $colorSurface200,
        "borderColor-dropdown-item": $colorSurface200,

        // --- Text colors
        "color-text-primary": $colorSurface950,
        "color-text-secondary": $colorSurface600,
        "color-text-attention": $colorDanger600,
        "color-text-subtitle": $colorSurface500,
        "color-text--disabled": $colorSurface400,

        // --- Input is an abstract component, so we define its default theme variables here
        "color-bg-Input-default": "white",
        "borderColor-Input-default": $colorSurface200,
        "borderColor-Input-default--hover": $colorSurface600,
        "borderColor-Input-default--focus": $colorSurface600,
        "borderColor-Input-default--success": $colorSuccess600,
        "borderColor-Input-default--warning": $colorWarn700,
        "borderColor-Input-default--error": $colorDanger600,

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
        "color-info": $colorInfo600,
        "color-valid": $colorSuccess600,
        "color-warning": $colorWarn700,
        "color-error": $colorDanger700,

        // --- Border colors
        "borderColor": $colorSurface800,
        "borderColor--disabled": $colorSurface700,
        "borderColor-dropdown-item": $colorSurface300,

        // --- Text colors
        "color-text-primary": $colorSurface100,
        "color-text-secondary": $colorSurface400,
        "color-text-attention": $colorDanger400,
        "color-text-subtitle": $colorSurface500,
        "color-text--disabled": $colorSurface500,

        // --- Input is an abstract component, so we define its default theme variables here
        "borderColor-Input-default": $colorSurface800,
        "borderColor-Input-default--hover": $colorSurface500,
        "borderColor-Input-default--focus": $colorSurface500,
        "borderColor-Input-default--success": $colorSuccess600,
        "borderColor-Input-default--warning": $colorWarn700,
        "borderColor-Input-default--error": $colorDanger500,

        // --- InputLabel is a React component, so we define its default theme variables here
        "color-text-InputLabel-required": $colorDanger400,
      },
    },
  },
};

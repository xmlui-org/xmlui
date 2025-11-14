import type { ThemeDefinition } from "../../../abstractions/ThemingDefs";
import { palette } from "./palette";

const {
  $colorSurface0,
  $colorSurface50,
  $colorSurface100,
  $colorSurface200A80,
  $colorSurface200A70,
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
    // "font.inter": "https://rsms.me/inter/inter.css",
  },
  themeVars: {
    // --- The unit of measurement for all sizes/spaces
    "space-base": "0.25rem",

    // --- Default surface color shades (form white to black)
    "const-color-surface-0": "white",
    "const-color-surface-50": "hsl(204, 30.3%, 96.5%)",
    "const-color-surface-100": "hsl(204, 30.3%, 93%)",
    "const-color-surface-200": "hsl(204, 30.3%, 85%)",
    "const-color-surface-300": "hsl(204, 30.3%, 75%)",
    "const-color-surface-400": "hsl(204, 30.3%, 65%)",
    "const-color-surface-500": "hsl(204, 30.3%, 52%)", // #6894AD
    "const-color-surface-600": "hsl(204, 30.3%, 45%)",
    "const-color-surface-700": "hsl(204, 30.3%, 35%)",
    "const-color-surface-800": "hsl(204, 30.3%, 27%)",
    "const-color-surface-900": "hsl(204, 30.3%, 16%)",
    "const-color-surface-950": "hsl(204, 30.3%, 13%)",
    "const-color-surface-1000": "hsl(204, 30.3%, 9%)",
    "const-color-surface": "$const-color-surface-500",

    // --- Primary color shades (bluish)
    "const-color-primary-50": "hsl(212,71.9%,94.5%)",
    "const-color-primary-100": "hsl(212,71.9%,89.1%)",
    "const-color-primary-200": "hsl(212,71.9%,78.1%)",
    "const-color-primary-300": "hsl(212,71.9%,67.2%)",
    "const-color-primary-400": "hsl(212,71.9%,56.3%)",
    "const-color-primary-500": "#206bc4",
    "const-color-primary-600": "hsl(212,71.9%,36.3%)",
    "const-color-primary-700": "hsl(212,71.9%,27.2%)",
    "const-color-primary-800": "hsl(212,71.9%,18.1%)",
    "const-color-primary-900": "hsl(212,71.9%,9.1%)",
    "const-color-primary-950": "hsl(212,71.9%,4.5%)",
    "const-color-primary": "$const-color-primary-500",

    // --- Secondary color shades (steel-bluish)
    "const-color-secondary-50": "hsl(211.7,21.2%,96.9%)",
    "const-color-secondary-100": "hsl(211.7,21.2%,93.7%)",
    "const-color-secondary-200": "hsl(211.7,21.2%,87.4%)",
    "const-color-secondary-300": "hsl(211.7,21.2%,81.1%)",
    "const-color-secondary-400": "hsl(211.7,21.2%,74.8%)",
    "const-color-secondary-500": "#6c7a91",
    "const-color-secondary-600": "hsl(211.7,21.2%,54.8%)",
    "const-color-secondary-700": "hsl(211.7,21.2%,41.1%)",
    "const-color-secondary-800": "hsl(211.7,21.2%,27.4%)",
    "const-color-secondary-900": "hsl(211.7,21.2%,13.7%)",
    "const-color-secondary-950": "hsl(211.7,21.2%,6.9%)",
    "const-color-secondary": "$const-color-secondary-500",

    // --- Warning color shades (orange shades)
    "const-color-warn-50": "hsl(45, 100%, 97%)",
    "const-color-warn-100": "hsl(45, 100%, 91%)",
    "const-color-warn-200": "hsl(45, 100%, 80%)",
    "const-color-warn-300": "hsl(45, 100%, 70%)",
    "const-color-warn-400": "hsl(45, 100%, 60%)",
    "const-color-warn-500": "hsl(35, 100%, 50%)", // #ff980a
    "const-color-warn-600": "hsl(35, 100%, 45%)",
    "const-color-warn-700": "hsl(35, 100%, 40%)",
    "const-color-warn-800": "hsl(35, 100%, 35%)",
    "const-color-warn-900": "hsl(35, 100%, 30%)",
    "const-color-warn-950": "hsl(35, 100%, 15%)",
    "const-color-warn": "$const-color-warn-500",

    // --- Danger color shades (reddish)
    "const-color-danger-50": "hsl(356, 100%, 95%)",
    "const-color-danger-100": "hsl(356, 100%, 91%)",
    "const-color-danger-200": "hsl(356, 100%, 80%)",
    "const-color-danger-300": "hsl(356, 100%, 70%)",
    "const-color-danger-400": "hsl(356, 100%, 60%)",
    "const-color-danger-500": "hsl(356, 100%, 50%)", // #ff3240
    "const-color-danger-600": "hsl(356, 100%, 45%)",
    "const-color-danger-700": "hsl(356, 100%, 40%)",
    "const-color-danger-800": "hsl(356, 100%, 35%)",
    "const-color-danger-900": "hsl(356, 100%, 30%)",
    "const-color-danger-950": "hsl(356, 100%, 15%)",
    "const-color-danger": "$const-color-danger-600",
    "const-color-attention": "$const-color-danger-500",

    // --- Success color shades (greenish)
    "const-color-success-50": "hsl(129.5, 58.4%, 96.4%)",
    "const-color-success-100": "hsl(129.5, 58.4%, 92.9%)",
    "const-color-success-200": "hsl(129.5, 58.4%, 85.7%)",
    "const-color-success-300": "hsl(129.5, 58.4%, 78.6%)",
    "const-color-success-400": "hsl(129.5, 58.4%, 71.5%)",
    "const-color-success-500": "hsl(129.5, 58.4%, 51.5%)", // #2fb344
    "const-color-success-600": "hsl(129.5, 58.4%, 45%)",
    "const-color-success-700": "hsl(129.5, 58.4%, 38.6%)",
    "const-color-success-800": "hsl(129.5, 58.4%, 25.7%)",
    "const-color-success-900": "hsl(129.5, 58.4%, 12.9%)",
    "const-color-success-950": "hsl(129.5, 58.4%, 6.4%)",
    "const-color-success": "$const-color-success-500",

    "const-color-info-50": "hsl(183, 97%, 95%)",
    "const-color-info-100": "hsl(183, 97%, 90%)",
    "const-color-info-200": "hsl(183, 97%, 80%)",
    "const-color-info-300": "hsl(183, 97%, 70%)",
    "const-color-info-400": "hsl(183, 97%, 60%)",
    "const-color-info-500": "hsl(183, 97%, 50%)", // #02C4CE
    "const-color-info-600": "hsl(183, 97%, 45%)",
    "const-color-info-700": "hsl(183, 97%, 35%)",
    "const-color-info-800": "hsl(183, 97%, 25%)",
    "const-color-info-900": "hsl(183, 97%, 15%)",
    "const-color-info-950": "hsl(183, 97%, 10%)",

    // --- Font weights
    "fontWeight-light": "300",
    "fontWeight-normal": "400",
    "fontWeight-medium": "500",
    "fontWeight-bold": "600",
    "fontWeight-extra-bold": "900",

    // --- Default text colors (component use these values as their defaults)
    "textColor-primary": "$color-surface-950",
    "textColor-attention": "$color-danger-600",
    "textColor-subtitle": "$color-surface-500",
    "textColor--disabled": "$color-surface-400",

    // --- Default background colors (component use these values as their defaults)
    "backgroundColor-primary": "$color-surface-50",
    "backgroundColor-secondary": "$color-surface-50",
    "backgroundColor-attention": "$color-attention",
    "backgroundColor--disabled": "$color-surface-50",
    "backgroundColor--selected": "$color-primary-50",

    // --- Various default colors
    "color-info": "$color-info-500",
    "color-valid": "$color-success-600",
    "color-warning": "$color-warn-700",
    "color-error": "$color-danger-500",

    // --- The sans-serif font set
    "fontFamily-sans-serif":
      "'Inter', -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif",

    // --- The monospace font set
    "fontFamily-monospace": "Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace",
    "font-feature-settings": "'cv03', 'cv04', 'cv11'",

    // --- Some media breakpoints (review them)
    "maxWidth-phone": "576px",
    "maxWidth-landscape-phone": "768px",
    "maxWidth-tablet": "992px",
    "maxWidth-desktop": "1200px",
    "maxWidth-large-desktop": "1400px",

    // --- The app's default radius value
    borderRadius: "4px",
    "outlineColor--focus": "rgb(from $color-primary-500 r g b / 0.5)",
    "outlineWidth--focus": "2px",
    "outlineStyle--focus": "solid",
    "outlineOffset--focus": "0",

    // --- The app's default font family
    fontFamily: "$fontFamily-sans-serif",

    // --- Various font sizes (relative to the current context)
    "fontSize-tiny": "0.625rem",
    "fontSize-xs": "0.75rem",
    "fontSize-code": "0.85rem",
    "fontSize-sm": "0.875rem",
    "fontSize-base": "1rem",
    "fontSize-lg": "1.125rem",
    "fontSize-xl": "1.25rem",
    "fontSize-2xl": "1.5rem",
    "fontSize-3xl": "1.875rem",
    "fontSize-4xl": "2.25rem",
    "fontSize-5xl": "3rem",
    "fontSize-6xl": "3.75rem",
    "fontSize-7xl": "4.5rem",
    "fontSize-8xl": "6rem",
    "fontSize-9xl": "8rem",

    // --- The default font size
    fontSize: "$fontSize-base",

    // --- Various line height values
    // --- Default line height values (relative to the base unit, "space-base")
    "lineHeight-none": "1",
    "lineHeight-tight": "1.25",
    "lineHeight-snug": "1.375",
    "lineHeight-normal": "1.5",
    "lineHeight-relaxed": "1.625",
    "lineHeight-loose": "2",

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
    fontWeight: "$fontWeight-normal",

    // --- Various default values (review them)
    "borderColor-dropdown-item": "$borderColor",

    // --- Various predefined shadow values
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, .1), 0 1px 2px 0 rgba(0, 0, 0, .06)",
    "boxShadow-md": "0 4px 6px -1px rgba(0, 0, 0, .1), 0 2px 4px -1px rgba(0, 0, 0, .06)",
    "boxShadow-xl":
      "0 16px 24px 2px rgba(0, 0, 0, 0.07), 0 6px 30px 5px rgba(0, 0, 0, 0.06), 0 8px 10px -5px rgba(0, 0, 0, 0.1)",
    "boxShadow-xxl": "0 8px 17px 0 rgba(0, 0, 0, .2), 0 6px 20px 0 rgba(0, 0, 0, .19)",
    "boxShadow-spread": "0px 0px 30px rgba(0, 0, 0, 0.1)",
    "boxShadow-spread-2": "-6px -4px 40px 10px rgba(0, 0, 0, 0.1)",
    "boxShadow-spread-2-xl": "-6px -4px 40px 18px rgba(0, 0, 0, 0.1)",

    // --- The default maximum content width
    "maxWidth-content": "1280px",

    // --- The default maximum content column width
    "maxWidth-columnContent": "800px",

    // --- Background colors
    backgroundColor: "$color-surface-subtle",
    "backgroundColor-overlay": "rgba(0, 0, 0, 0.2)",
    "backgroundColor-dropdown-item--hover": $colorSurface50,
    "backgroundColor-dropdown-item--active": $colorSurface100,
    "backgroundColor-dropdown-item--active-hover": $colorSurface50,
    "backgroundColor-tree-row--selected--before": $colorPrimary50,

    // --- Border colors
    borderColor: "rgb(from $color-surface-900 r g b / 0.1)",
    "borderColor--disabled": $colorSurface100,

    // --- Text colors
    "textColor-secondary": $colorSurface600,

    // --- Input is an abstract component, so we define its default theme variables here
    "backgroundColor-Input-default": $colorSurface0,
    "backgroundColor-Input-success": $colorSurface0,
    "backgroundColor-Input-warning": $colorSurface0,
    "backgroundColor-Input-error": $colorSurface0,

    "borderColor-Input-default": $colorSurface200,
    "borderColor-Input-default--hover": $colorSurface600,
    "borderColor-Input-default--focus": $colorSurface600,
    "borderColor-Input-default--success": $colorSuccess600,
    "borderColor-Input-default--warning": $colorWarn700,
    "borderColor-Input-default--error": $colorDanger500,

    // --- InputLabel is a React component, so we define its default theme variables here
    "textColor-InputLabel-required": $colorDanger600,
  },
  tones: {
    light: {
      themeVars: {
        // --- Default surface color shades (form white to black)
        "color-surface-0": "$const-color-surface-0",
        "color-surface-50": "$const-color-surface-50",
        "color-surface-100": "$const-color-surface-100",
        "color-surface-200": "$const-color-surface-200",
        "color-surface-300": "$const-color-surface-300",
        "color-surface-400": "$const-color-surface-400",
        "color-surface-500": "$const-color-surface-500",
        "color-surface-600": "$const-color-surface-600",
        "color-surface-700": "$const-color-surface-700",
        "color-surface-800": "$const-color-surface-800",
        "color-surface-900": "$const-color-surface-900",
        "color-surface-950": "$const-color-surface-950",
        "color-surface-1000": "$const-color-surface-1000",
        "color-surface": "$const-color-surface-500",
        "color-surface-base": "$color-surface-0",
        "color-surface-lower": "$color-surface-100",
        "color-surface-raised": "$color-surface-0",
        "color-surface-subtle": "$color-surface-50",

        // --- Primary color shades (bluish)
        "color-primary-50": "$const-color-primary-50",
        "color-primary-100": "$const-color-primary-100",
        "color-primary-200": "$const-color-primary-200",
        "color-primary-300": "$const-color-primary-300",
        "color-primary-400": "$const-color-primary-400",
        "color-primary-500": "$const-color-primary-500",
        "color-primary-600": "$const-color-primary-600",
        "color-primary-700": "$const-color-primary-700",
        "color-primary-800": "$const-color-primary-800",
        "color-primary-900": "$const-color-primary-900",
        "color-primary-950": "$const-color-primary-950",
        "color-primary": "$const-color-primary-500",

        // --- Secondary color shades (steel-bluish)
        "color-secondary-50": "$const-color-secondary-50",
        "color-secondary-100": "$const-color-secondary-100",
        "color-secondary-200": "$const-color-secondary-200",
        "color-secondary-300": "$const-color-secondary-300",
        "color-secondary-400": "$const-color-secondary-400",
        "color-secondary-500": "$const-color-secondary-500",
        "color-secondary-600": "$const-color-secondary-600",
        "color-secondary-700": "$const-color-secondary-700",
        "color-secondary-800": "$const-color-secondary-800",
        "color-secondary-900": "$const-color-secondary-900",
        "color-secondary-950": "$const-color-secondary-950",
        "color-secondary": "$const-color-secondary-500",

        // --- Warning color shades (orange shades)
        "color-warn-50": "$const-color-warn-50",
        "color-warn-100": "$const-color-warn-100",
        "color-warn-200": "$const-color-warn-200",
        "color-warn-300": "$const-color-warn-300",
        "color-warn-400": "$const-color-warn-400",
        "color-warn-500": "$const-color-warn-500",
        "color-warn-600": "$const-color-warn-600",
        "color-warn-700": "$const-color-warn-700",
        "color-warn-800": "$const-color-warn-800",
        "color-warn-900": "$const-color-warn-900",
        "color-warn-950": "$const-color-warn-950",
        "color-warn": "$const-color-warn-500",

        // --- Danger color shades (reddish)
        "color-danger-50": "$const-color-danger-50",
        "color-danger-100": "$const-color-danger-100",
        "color-danger-200": "$const-color-danger-200",
        "color-danger-300": "$const-color-danger-300",
        "color-danger-400": "$const-color-danger-400",
        "color-danger-500": "$const-color-danger-500",
        "color-danger-600": "$const-color-danger-600",
        "color-danger-700": "$const-color-danger-700",
        "color-danger-800": "$const-color-danger-800",
        "color-danger-900": "$const-color-danger-900",
        "color-danger-950": "$const-color-danger-950",
        "color-danger": "$const-color-danger-600",
        "color-attention": "$const-color-danger-500",

        // --- Success color shades (greenish)
        "color-success-50": "$const-color-success-50",
        "color-success-100": "$const-color-success-100",
        "color-success-200": "$const-color-success-200",
        "color-success-300": "$const-color-success-300",
        "color-success-400": "$const-color-success-400",
        "color-success-500": "$const-color-success-500",
        "color-success-600": "$const-color-success-600",
        "color-success-700": "$const-color-success-700",
        "color-success-800": "$const-color-success-800",
        "color-success-900": "$const-color-success-900",
        "color-success-950": "$const-color-success-950",
        "color-success": "$const-color-success-500",

        "color-info-50 ": "$const-color-info-50 ",
        "color-info-100": "$const-color-info-100",
        "color-info-200": "$const-color-info-200",
        "color-info-300": "$const-color-info-300",
        "color-info-400": "$const-color-info-400",
        "color-info-500": "$const-color-info-500",
        "color-info-600": "$const-color-info-600",
        "color-info-700": "$const-color-info-700",
        "color-info-800": "$const-color-info-800",
        "color-info-900": "$const-color-info-900",
        "color-info-950": "$const-color-info-950",
        "color-info": "$const-color-info-800",
      },
    },
    dark: {
      themeVars: {
        // --- Default surface color shades (form white to black)
        "color-surface-0": "$const-color-surface-1000",
        "color-surface-50": "$const-color-surface-950",
        "color-surface-100": "$const-color-surface-900",
        "color-surface-200": "$const-color-surface-800",
        "color-surface-300": "$const-color-surface-700",
        "color-surface-400": "$const-color-surface-600",
        "color-surface-500": "$const-color-surface-500",
        "color-surface-600": "$const-color-surface-400",
        "color-surface-700": "$const-color-surface-300",
        "color-surface-800": "$const-color-surface-200",
        "color-surface-900": "$const-color-surface-100",
        "color-surface-950": "$const-color-surface-50",
        "color-surface-1000": "$const-color-surface-0",
        "color-surface": "$const-color-surface-500",
        "color-surface-base": "$color-surface-0",
        "color-surface-lower": "$color-surface-0",
        "color-surface-raised": "$color-surface-100",
        "color-surface-subtle": "$color-surface-50",

        // --- Primary color shades (bluish)
        "color-primary-50": "$const-color-primary-950",
        "color-primary-100": "$const-color-primary-900",
        "color-primary-200": "$const-color-primary-800",
        "color-primary-300": "$const-color-primary-700",
        "color-primary-400": "$const-color-primary-600",
        "color-primary-500": "$const-color-primary-500",
        "color-primary-600": "$const-color-primary-400",
        "color-primary-700": "$const-color-primary-300",
        "color-primary-800": "$const-color-primary-200",
        "color-primary-900": "$const-color-primary-100",
        "color-primary-950": "$const-color-primary-50",
        "color-primary": "$const-color-primary-500",

        // --- Secondary color shades (steel-bluish)
        "color-secondary-50": "$const-color-secondary-950",
        "color-secondary-100": "$const-color-secondary-900",
        "color-secondary-200": "$const-color-secondary-800",
        "color-secondary-300": "$const-color-secondary-700",
        "color-secondary-400": "$const-color-secondary-600",
        "color-secondary-500": "$const-color-secondary-500",
        "color-secondary-600": "$const-color-secondary-400",
        "color-secondary-700": "$const-color-secondary-300",
        "color-secondary-800": "$const-color-secondary-200",
        "color-secondary-900": "$const-color-secondary-100",
        "color-secondary-950": "$const-color-secondary-50",
        "color-secondary": "$const-color-secondary-500",

        // --- Warning color shades (orange shades)
        "color-warn-50": "$const-color-warn-950",
        "color-warn-100": "$const-color-warn-900",
        "color-warn-200": "$const-color-warn-800",
        "color-warn-300": "$const-color-warn-700",
        "color-warn-400": "$const-color-warn-600",
        "color-warn-500": "$const-color-warn-500",
        "color-warn-600": "$const-color-warn-400",
        "color-warn-700": "$const-color-warn-300",
        "color-warn-800": "$const-color-warn-200",
        "color-warn-900": "$const-color-warn-100",
        "color-warn-950": "$const-color-warn-50",
        "color-warn": "$const-color-warn-500",

        // --- Danger color shades (reddish)
        "color-danger-50": "$const-color-danger-950",
        "color-danger-100": "$const-color-danger-900",
        "color-danger-200": "$const-color-danger-800",
        "color-danger-300": "$const-color-danger-700",
        "color-danger-400": "$const-color-danger-600",
        "color-danger-500": "$const-color-danger-500",
        "color-danger-600": "$const-color-danger-400",
        "color-danger-700": "$const-color-danger-300",
        "color-danger-800": "$const-color-danger-200",
        "color-danger-900": "$const-color-danger-100",
        "color-danger-950": "$const-color-danger-50",
        "color-danger": "$const-color-danger-500",
        "color-attention": "$const-color-danger-400",

        // --- Success color shades (greenish)
        "color-success-50": "$const-color-success-950",
        "color-success-100": "$const-color-success-900",
        "color-success-200": "$const-color-success-800",
        "color-success-300": "$const-color-success-700",
        "color-success-400": "$const-color-success-600",
        "color-success-500": "$const-color-success-500",
        "color-success-600": "$const-color-success-400",
        "color-success-700": "$const-color-success-300",
        "color-success-800": "$const-color-success-200",
        "color-success-900": "$const-color-success-100",
        "color-success-950": "$const-color-success-50",
        "color-success": "$const-color-success-500",

        "color-info-50 ": "$const-color-info-950 ",
        "color-info-100": "$const-color-info-900",
        "color-info-200": "$const-color-info-800",
        "color-info-300": "$const-color-info-700",
        "color-info-400": "$const-color-info-600",
        "color-info-500": "$const-color-info-500",
        "color-info-600": "$const-color-info-400",
        "color-info-700": "$const-color-info-300",
        "color-info-800": "$const-color-info-200",
        "color-info-900": "$const-color-info-100",
        "color-info-950": "$const-color-info-50",
        "color-info": "$const-color-info-200",
      },
    },
  },
};

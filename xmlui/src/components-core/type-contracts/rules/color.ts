/**
 * Rule: `valueType: "color"`.
 *
 * Accepts:
 *   - CSS named colors (`red`, `transparent`, `currentColor`, …)
 *   - `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa` hex literals
 *   - CSS color functional notations (`rgb()`, `hsl()`, `color()`,
 *     `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`, `color-mix()`)
 *   - CSS custom properties (`var(--…)`), theme-token references
 *     (`$xxx` syntax used elsewhere in the framework), and component-shaped
 *     theme variable references left by fallback resolution.
 */

import type { CoercionRule } from "./types";

const HEX_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const FUNC_RE = /^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix)\s*\(.+\)$/i;
const VAR_RE = /^var\(\s*--[A-Za-z0-9_-]+(?:\s*,.*)?\)$/;
const TOKEN_RE = /^\$[A-Za-z0-9_-]+$/;
const THEME_VAR_REF_RE = /^[A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*-[A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*(?:--[A-Za-z0-9_-]+)*$/;

const NAMED_COLORS: ReadonlySet<string> = new Set([
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkgrey",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkslategrey",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dimgrey",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "green",
  "greenyellow",
  "grey",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightgrey",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightslategrey",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "rebeccapurple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "slategrey",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "transparent",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen",
  "currentcolor",
  "inherit",
  "initial",
  "unset",
  "revert",
]);

export const colorRule: CoercionRule = {
  valueType: "color",

  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw !== "string") {
      return {
        message: `Expected a CSS color string, got ${typeof raw}.`,
        expected: "color",
      };
    }
    const value = raw.trim();
    if (value === "") {
      return { message: "Expected a CSS color, got an empty string.", expected: "color" };
    }
    if (HEX_RE.test(value)) return null;
    if (FUNC_RE.test(value)) return null;
    if (VAR_RE.test(value)) return null;
    if (TOKEN_RE.test(value)) return null;
    if (THEME_VAR_REF_RE.test(value)) return null;
    if (NAMED_COLORS.has(value.toLowerCase())) return null;
    return {
      message: `Expected a CSS color, got ${JSON.stringify(value)}.`,
      expected: "color",
    };
  },

  coerce(raw) {
    if (typeof raw === "string") return raw.trim();
    return raw;
  },
};

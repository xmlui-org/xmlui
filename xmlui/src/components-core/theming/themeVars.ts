/**
 * The sole purpose of this module is to provide an object with the available keys of theme SCSS variables and the
 * prefix of the theme.
 */
import themeVars from "./themeVars.module.scss";

/**
 * This function extracts CSS variables from the specified SCSS input. It uses a hack to convert the CSS input to JSON
 * and then calls a JSON parser to create the desired object.
 * @param scssStr The scss input
 */
export function parseScssVar(scssStr: any) {
  if (!scssStr || typeof scssStr !== typeof "") {
    return scssStr;
  }

  // Lists and maps are surrounded by single quotes, e.g. "'[ \"string in list\", 5, \"5px\" ]'"
  // Remove them if they exist so they can be parsed correctly.
  let jsValue = scssStr.replace(/(^['"])|(['"]$)/g, "");

  try {
    // JSON-formatted string from within SCSS file
    return JSON.parse(jsValue);
  } catch (errorParsingJsonGeneratedInUtilScssFile) {
    try {
      // Value was likely an SCSS literal string; attempt parsing it manually.
      // Example: inspect($my-map) => '(num: 10, numWithUnits: 5px, str: hello, color: #fff, "keyAsStr": false, other: null)'
      return JSON.parse(
        scssStr
          .replace("(", "{")
          .replace(")", "}")
          // JSON values: convert any collection of word characters followed by a comma or bracket to a string
          .replace(/: ?([^,}]+)([,}])/g, ': "$1"$2')
          // JSON keys: space/bracket/comma as first character, not already a string, anything not colon or
          // space (rules out JSON values), ended by colon
          .replace(/([\s{,])(?!")([^:\s]+)+:/g, '$1"$2":'),
      );
    } catch (errorParsingScssStringLiteral) {
      return jsValue;
    }
  }
}

let keyPrefix = parseScssVar(themeVars.keyPrefix) || "";
let vars = parseScssVar(themeVars.themeVars);

/**
 * Export the desired SCSS variables and prefix
 */
const theme = {
  keyPrefix: keyPrefix,
  themeVars: vars,
};

export function getVarKey(varName: string) {
  if (keyPrefix) {
    return `--${keyPrefix}-${varName}`;
  }
  return `--${varName}`;
}

export default theme;

import styleToObject from "style-to-object";

type StyleToJsOptions = {
  reactCompat?: boolean;
};

const customPropertyRegex = /^--[a-zA-Z0-9_-]+$/;
const hyphenRegex = /-([a-z])/g;
const noHyphenRegex = /^[^-]+$/;
const vendorPrefixRegex = /^-(webkit|moz|ms|o|khtml)-/;
const msVendorPrefixRegex = /^-(ms)-/;

function camelCase(property: string, options: StyleToJsOptions = {}) {
  if (!property || noHyphenRegex.test(property) || customPropertyRegex.test(property)) {
    return property;
  }
  const normalized = property.toLowerCase();
  const withoutVendorHyphen = options.reactCompat
    ? normalized.replace(msVendorPrefixRegex, (_match, prefix: string) => `${prefix}-`)
    : normalized.replace(vendorPrefixRegex, (_match, prefix: string) => `${prefix}-`);
  return withoutVendorHyphen.replace(hyphenRegex, (_match, character: string) =>
    character.toUpperCase(),
  );
}

export default function styleToJs(style: string, options: StyleToJsOptions = {}) {
  const output: Record<string, string> = {};
  if (!style || typeof style !== "string") {
    return output;
  }
  styleToObject(style, (property, value) => {
    if (property && value) {
      output[camelCase(property, options)] = value;
    }
  });
  return output;
}

import type { LocaleBundle } from "../bundle-store";

export const xmluiEnglishBundle: LocaleBundle = {
  locale: "en",
  messages: {
    // Form buttons
    "xmlui.form.cancel": "Cancel",
    "xmlui.form.save": "Save",
    "xmlui.form.saving": "Saving...",
    "xmlui.form.validating": "Validating...",
    // Select
    "xmlui.select.searchPlaceholder": "Search...",
    // Drawer
    "xmlui.drawer.ariaLabel": "Drawer",
    "xmlui.drawer.closeAriaLabel": "Close",
    // Modal
    "xmlui.modal.closeAriaLabel": "Close",
    // Validators
    "xmlui.validation.email": "Not a valid email address",
    "xmlui.validation.url": "Not a valid URL",
    "xmlui.validation.phone": "Not a valid phone number",
    "xmlui.validation.isoDate": "Not a valid ISO 8601 date",
    "xmlui.validation.length": "Invalid length",
    "xmlui.validation.iban": "Not a valid IBAN",
    "xmlui.validation.creditCard": "Not a valid credit card number",
    "xmlui.validation.strongPassword":
      "Password must be at least 12 characters and include upper, lower, digit, and symbol",
    "xmlui.validation.noLeadingTrailingWhitespace":
      "Value must not start or end with whitespace",
  },
};

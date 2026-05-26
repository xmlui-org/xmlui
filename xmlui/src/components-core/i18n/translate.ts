import type { BundleStore, LocaleBundle } from "./bundle-store";
import type { I18nDiagnostic } from "./diagnostics";
import { formatIcuMessage, IcuFormatError, type MessageVariables } from "./icu";

export interface TranslatorOptions {
  store: BundleStore;
  locale: string;
  strict?: boolean;
  onDiagnostic?: (diagnostic: I18nDiagnostic) => void;
}

export function translateMessage(
  key: string,
  vars: MessageVariables | undefined,
  options: TranslatorOptions,
): string {
  const pattern = options.store.lookup(options.locale, key);
  if (pattern === undefined) {
    options.onDiagnostic?.({
      code: "missing-key",
      severity: options.strict ? "error" : "warn",
      locale: options.locale,
      key,
      message: `Missing translation key "${key}" for locale "${options.locale}".`,
    });
    return key;
  }
  try {
    return formatIcuMessage(pattern, vars, options.locale);
  } catch (error) {
    options.onDiagnostic?.({
      code: "icu-parse-error",
      severity: options.strict ? "error" : "warn",
      locale: options.locale,
      key,
      message: error instanceof Error ? error.message : String(error),
      data: error instanceof IcuFormatError ? { pattern: error.pattern } : undefined,
    });
    return key;
  }
}

export function normalizeLocaleBundle(input: unknown): LocaleBundle | undefined {
  if (!input || typeof input !== "object") return undefined;
  const locale = (input as any).locale;
  const messages = (input as any).messages;
  if (typeof locale !== "string" || (!messages && !(input instanceof Map))) {
    return undefined;
  }
  return {
    locale,
    messages: messages ?? input,
  };
}

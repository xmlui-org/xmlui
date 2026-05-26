export interface LocaleBundle {
  locale: string;
  messages: ReadonlyMap<string, string> | Record<string, string>;
}

export interface BundleStore {
  register(bundle: LocaleBundle): void;
  available(): readonly string[];
  lookup(locale: string, key: string): string | undefined;
}

export function createBundleStore(initial: readonly LocaleBundle[] = []): BundleStore {
  const bundles = new Map<string, Map<string, string>>();
  const store: BundleStore = {
    register(bundle) {
      const messages =
        bundle.messages instanceof Map
          ? new Map(bundle.messages)
          : new Map(Object.entries(bundle.messages));
      bundles.set(bundle.locale, messages);
    },
    available() {
      return [...bundles.keys()];
    },
    lookup(locale, key) {
      return bundles.get(locale)?.get(key) ?? bundles.get(locale.split("-")[0])?.get(key);
    },
  };
  for (const bundle of initial) {
    store.register(bundle);
  }
  return store;
}

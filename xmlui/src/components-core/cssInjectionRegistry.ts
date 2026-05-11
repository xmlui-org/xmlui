type CSSInjectionAPI = {
  injectCSS: (opts: { target: Element | ShadowRoot }) => void;
  removeCSS: () => void;
};

let _api: CSSInjectionAPI | null = null;

export const registerCSSInjection = (api: CSSInjectionAPI): void => {
  _api = api;
};

export const getCSSInjectionAPI = (): CSSInjectionAPI | null => _api;

import "./index.css";
import { jsxs as a, jsx as l } from "react/jsx-runtime";
import { createComponentRenderer as i, createMetadata as d, parseScssVar as m } from "xmlui";
import { useState as u } from "react";
const p = `'{"backgroundColor-HelloWorld": "var(--xmlui-backgroundColor-HelloWorld)", "textColor-HelloWorld": "var(--xmlui-textColor-HelloWorld)"}'`, g = "_container_inos9_13", C = "_message_inos9_23", W = "_button_inos9_28", h = "_counter_inos9_42", e = {
  themeVars: p,
  container: g,
  message: C,
  button: W,
  counter: h
}, n = {
  message: "Hello, World!"
};
function H({
  id: r,
  message: s = n.message
}) {
  const [o, t] = u(0), c = () => {
    t(o + 1);
  };
  return /* @__PURE__ */ a("div", { className: e.container, id: r, children: [
    /* @__PURE__ */ l("h2", { className: e.message, children: s }),
    /* @__PURE__ */ l("button", { className: e.button, onClick: c, children: "Click me!" }),
    /* @__PURE__ */ a("div", { className: e.counter, children: [
      "Clicks: ",
      o
    ] })
  ] });
}
const _ = d({
  description: "`HelloWorld` is a demonstration component.",
  status: "experimental",
  props: {
    message: {
      description: "The message to display.",
      isRequired: !1,
      type: "string",
      defaultValue: n.message
    }
  },
  themeVars: m(e.themeVars),
  defaultThemeVars: {
    "backgroundColor-HelloWorld": "$color-surface-50",
    "textColor-HelloWorld": "$color-content-primary",
    dark: {
      "backgroundColor-HelloWorld": "$color-surface-200",
      "textColor-HelloWorld": "$color-content-primary"
    }
  }
}), f = i(
  "HelloWorld",
  _,
  ({ node: r, extractValue: s }) => {
    var o, t;
    return /* @__PURE__ */ l(
      H,
      {
        id: s.asOptionalString((o = r.props) == null ? void 0 : o.id),
        message: s.asOptionalString((t = r.props) == null ? void 0 : t.message, n.message)
      }
    );
  }
), y = {
  namespace: "XMLUIExtensions",
  components: [f]
};
export {
  y as default
};

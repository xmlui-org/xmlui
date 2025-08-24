import "./index.css";
import { jsxs as p, jsx as l } from "react/jsx-runtime";
import { createComponentRenderer as W, createMetadata as C, parseScssVar as H } from "xmlui";
import _, { useState as x, useEffect as v } from "react";
const y = `'{"backgroundColor-HelloWorld": "var(--xmlui-backgroundColor-HelloWorld)", "textColor-HelloWorld": "var(--xmlui-textColor-HelloWorld)"}'`, V = "_container_inos9_13", R = "_message_inos9_23", w = "_button_inos9_28", N = "_counter_inos9_42", o = {
  themeVars: y,
  container: V,
  message: R,
  button: w,
  counter: N
}, h = {
  message: "Hello, World!"
}, S = _.forwardRef(
  function({
    id: c,
    message: a = h.message,
    className: d,
    onClick: s,
    onReset: t,
    registerComponentApi: e
  }, f) {
    const [n, u] = x(0), m = (r) => {
      u(r);
    };
    v(() => {
      e == null || e({
        setValue: m,
        value: n
      });
    }, [e, m, n]);
    const g = (r) => {
      const k = n + 1;
      u(k), s == null || s(r);
    }, b = (r) => {
      u(0), t == null || t(r);
    };
    return /* @__PURE__ */ p("div", { className: `${o.container} ${d || ""}`, id: c, ref: f, children: [
      /* @__PURE__ */ l("h2", { className: o.message, children: a }),
      /* @__PURE__ */ l(
        "button",
        {
          className: o.button,
          onClick: g,
          children: "Click me!"
        }
      ),
      /* @__PURE__ */ p("div", { className: o.counter, children: [
        "Clicks: ",
        /* @__PURE__ */ l("span", { className: o.count, children: n })
      ] }),
      n > 0 && /* @__PURE__ */ l(
        "button",
        {
          className: o.button,
          onClick: b,
          children: "Reset"
        }
      )
    ] });
  }
), T = C({
  description: "`HelloWorld` is a demonstration component that shows basic XMLUI patterns.",
  status: "experimental",
  props: {
    message: {
      description: "The greeting message to display.",
      isRequired: !1,
      type: "string",
      defaultValue: h.message
    }
  },
  events: {
    onClick: {
      description: "Triggered when the click button is pressed. Receives the current click count.",
      type: "function"
    },
    onReset: {
      description: "Triggered when the reset button is pressed. Called when count is reset to 0.",
      type: "function"
    }
  },
  apis: {
    value: {
      description: "The current click count value.",
      type: "number"
    },
    setValue: {
      description: "Set the click count to a specific value.",
      type: "function"
    }
  },
  themeVars: H(o.themeVars),
  defaultThemeVars: {
    "backgroundColor-HelloWorld": "$color-surface-50",
    "textColor-HelloWorld": "$color-content-primary",
    dark: {
      "backgroundColor-HelloWorld": "$color-surface-800"
      // No textColor override needed - $color-content-primary should auto-adapt
    }
  }
}), $ = W(
  "HelloWorld",
  T,
  ({ node: i, extractValue: c, lookupEventHandler: a, className: d, registerComponentApi: s }) => {
    var t, e;
    return /* @__PURE__ */ l(
      S,
      {
        id: c.asOptionalString((t = i.props) == null ? void 0 : t.id),
        message: c.asOptionalString((e = i.props) == null ? void 0 : e.message),
        onClick: a("onClick"),
        onReset: a("onReset"),
        className: d,
        registerComponentApi: s
      }
    );
  }
), O = {
  namespace: "XMLUIExtensions",
  components: [$]
};
export {
  O as default
};

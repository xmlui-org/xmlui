import "./index.css";
import { jsxs as m, jsx as u } from "react/jsx-runtime";
import { createComponentRenderer as p, createMetadata as f, parseScssVar as h } from "xmlui";
import { useState as C } from "react";
const g = `'{"backgroundColor-HelloWorld": "var(--xmlui-backgroundColor-HelloWorld)", "textColor-HelloWorld": "var(--xmlui-textColor-HelloWorld)", "backgroundColor-HelloWorld--success": "var(--xmlui-backgroundColor-HelloWorld--success)", "textColor-HelloWorld--success": "var(--xmlui-textColor-HelloWorld--success)"}'`, W = "_container_mm3fe_13", H = "_success_mm3fe_22", b = "_message_mm3fe_27", x = "_button_mm3fe_32", _ = "_counter_mm3fe_46", a = {
  themeVars: g,
  container: W,
  success: H,
  message: b,
  button: x,
  counter: _
};
function v(o) {
  return o && o.__esModule && Object.prototype.hasOwnProperty.call(o, "default") ? o.default : o;
}
var d = { exports: {} };
/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
(function(o) {
  (function() {
    var r = {}.hasOwnProperty;
    function t() {
      for (var e = "", s = 0; s < arguments.length; s++) {
        var c = arguments[s];
        c && (e = n(e, l(c)));
      }
      return e;
    }
    function l(e) {
      if (typeof e == "string" || typeof e == "number")
        return e;
      if (typeof e != "object")
        return "";
      if (Array.isArray(e))
        return t.apply(null, e);
      if (e.toString !== Object.prototype.toString && !e.toString.toString().includes("[native code]"))
        return e.toString();
      var s = "";
      for (var c in e)
        r.call(e, c) && e[c] && (s = n(s, c));
      return s;
    }
    function n(e, s) {
      return s ? e ? e + " " + s : e + s : e;
    }
    o.exports ? (t.default = t, o.exports = t) : window.classNames = t;
  })();
})(d);
var y = d.exports;
const k = /* @__PURE__ */ v(y), i = {
  message: "Hello, World!",
  theme: "default"
};
function S({
  id: o,
  message: r = i.message,
  theme: t = i.theme
}) {
  const [l, n] = C(0), e = () => {
    n(l + 1);
  };
  return /* @__PURE__ */ m("div", { className: k(a.container, a[t]), id: o, children: [
    /* @__PURE__ */ u("h2", { className: a.message, children: r }),
    /* @__PURE__ */ u("button", { className: a.button, onClick: e, children: "Click me!" }),
    /* @__PURE__ */ m("div", { className: a.counter, children: [
      "Clicks: ",
      l
    ] })
  ] });
}
const V = f({
  description: "`HelloWorld` is a demonstration component.",
  status: "experimental",
  props: {
    message: {
      description: "The message to display.",
      isRequired: !1,
      type: "string",
      defaultValue: i.message
    },
    theme: {
      description: "Visual theme variant.",
      isRequired: !1,
      type: "string",
      availableValues: ["default", "success"],
      defaultValue: i.theme
    }
  },
  themeVars: h(a.themeVars),
  defaultThemeVars: {
    "backgroundColor-HelloWorld": "$color-surface-50",
    "textColor-HelloWorld": "$color-content-primary",
    "backgroundColor-HelloWorld--success": "$color-success-50",
    "textColor-HelloWorld--success": "$color-success-700",
    dark: {
      "backgroundColor-HelloWorld": "$color-surface-200",
      "textColor-HelloWorld": "$color-content-primary",
      "backgroundColor-HelloWorld--success": "$color-success-200",
      "textColor-HelloWorld--success": "$color-success-800"
    }
  }
}), $ = p(
  "HelloWorld",
  V,
  ({ node: o, extractValue: r }) => {
    var t, l, n;
    return /* @__PURE__ */ u(
      S,
      {
        id: r.asOptionalString((t = o.props) == null ? void 0 : t.id),
        message: r.asOptionalString((l = o.props) == null ? void 0 : l.message, i.message),
        theme: r.asOptionalString((n = o.props) == null ? void 0 : n.theme, i.theme)
      }
    );
  }
), R = {
  namespace: "XMLUIExtensions",
  components: [$]
};
export {
  R as default
};

import { jsx as ue } from "react/jsx-runtime";
import V, { memo as oe, useState as Y, useRef as p, useCallback as z, useEffect as j, forwardRef as Ee } from "react";
import { wrapCompound as Pe, createMetadata as Ce, dDidChange as Ie, d as T, dReadonly as Te, dInitialValue as Le } from "xmlui";
function Ve(e, t, r) {
  return t in e ? Object.defineProperty(e, t, {
    value: r,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[t] = r, e;
}
function ce(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function le(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ce(Object(r), !0).forEach(function(n) {
      Ve(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : ce(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Re(e, t) {
  if (e == null) return {};
  var r = {}, n = Object.keys(e), o, i;
  for (i = 0; i < n.length; i++)
    o = n[i], !(t.indexOf(o) >= 0) && (r[o] = e[o]);
  return r;
}
function xe(e, t) {
  if (e == null) return {};
  var r = Re(e, t), n, o;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    for (o = 0; o < i.length; o++)
      n = i[o], !(t.indexOf(n) >= 0) && Object.prototype.propertyIsEnumerable.call(e, n) && (r[n] = e[n]);
  }
  return r;
}
function Ae(e, t) {
  return $e(e) || De(e, t) || Ne(e, t) || Ue();
}
function $e(e) {
  if (Array.isArray(e)) return e;
}
function De(e, t) {
  if (!(typeof Symbol > "u" || !(Symbol.iterator in Object(e)))) {
    var r = [], n = !0, o = !1, i = void 0;
    try {
      for (var a = e[Symbol.iterator](), c; !(n = (c = a.next()).done) && (r.push(c.value), !(t && r.length === t)); n = !0)
        ;
    } catch (s) {
      o = !0, i = s;
    } finally {
      try {
        !n && a.return != null && a.return();
      } finally {
        if (o) throw i;
      }
    }
    return r;
  }
}
function Ne(e, t) {
  if (e) {
    if (typeof e == "string") return se(e, t);
    var r = Object.prototype.toString.call(e).slice(8, -1);
    if (r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set") return Array.from(e);
    if (r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return se(e, t);
  }
}
function se(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Ue() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function We(e, t, r) {
  return t in e ? Object.defineProperty(e, t, {
    value: r,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[t] = r, e;
}
function de(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function fe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? de(Object(r), !0).forEach(function(n) {
      We(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : de(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function qe() {
  for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++)
    t[r] = arguments[r];
  return function(n) {
    return t.reduceRight(function(o, i) {
      return i(o);
    }, n);
  };
}
function W(e) {
  return function t() {
    for (var r = this, n = arguments.length, o = new Array(n), i = 0; i < n; i++)
      o[i] = arguments[i];
    return o.length >= e.length ? e.apply(this, o) : function() {
      for (var a = arguments.length, c = new Array(a), s = 0; s < a; s++)
        c[s] = arguments[s];
      return t.apply(r, [].concat(o, c));
    };
  };
}
function k(e) {
  return {}.toString.call(e).includes("Object");
}
function ze(e) {
  return !Object.keys(e).length;
}
function F(e) {
  return typeof e == "function";
}
function Fe(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function He(e, t) {
  return k(t) || C("changeType"), Object.keys(t).some(function(r) {
    return !Fe(e, r);
  }) && C("changeField"), t;
}
function Be(e) {
  F(e) || C("selectorType");
}
function Ge(e) {
  F(e) || k(e) || C("handlerType"), k(e) && Object.values(e).some(function(t) {
    return !F(t);
  }) && C("handlersType");
}
function Ke(e) {
  e || C("initialIsRequired"), k(e) || C("initialType"), ze(e) && C("initialContent");
}
function Xe(e, t) {
  throw new Error(e[t] || e.default);
}
var Ye = {
  initialIsRequired: "initial state is required",
  initialType: "initial state should be an object",
  initialContent: "initial state shouldn't be an empty object",
  handlerType: "handler should be an object or a function",
  handlersType: "all handlers should be a functions",
  selectorType: "selector should be a function",
  changeType: "provided value of changes should be an object",
  changeField: 'it seams you want to change a field in the state which is not specified in the "initial" state',
  default: "an unknown error accured in `state-local` package"
}, C = W(Xe)(Ye), K = {
  changes: He,
  selector: Be,
  handler: Ge,
  initial: Ke
};
function ke(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  K.initial(e), K.handler(t);
  var r = {
    current: e
  }, n = W(Ze)(r, t), o = W(Qe)(r), i = W(K.changes)(e), a = W(Je)(r);
  function c() {
    var f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function(M) {
      return M;
    };
    return K.selector(f), f(r.current);
  }
  function s(f) {
    qe(n, o, i, a)(f);
  }
  return [c, s];
}
function Je(e, t) {
  return F(t) ? t(e.current) : t;
}
function Qe(e, t) {
  return e.current = fe(fe({}, e.current), t), t;
}
function Ze(e, t, r) {
  return F(t) ? t(e.current) : Object.keys(r).forEach(function(n) {
    var o;
    return (o = t[n]) === null || o === void 0 ? void 0 : o.call(t, e.current[n]);
  }), r;
}
var _e = {
  create: ke
}, et = {
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs"
  }
};
function tt(e) {
  return function t() {
    for (var r = this, n = arguments.length, o = new Array(n), i = 0; i < n; i++)
      o[i] = arguments[i];
    return o.length >= e.length ? e.apply(this, o) : function() {
      for (var a = arguments.length, c = new Array(a), s = 0; s < a; s++)
        c[s] = arguments[s];
      return t.apply(r, [].concat(o, c));
    };
  };
}
function rt(e) {
  return {}.toString.call(e).includes("Object");
}
function nt(e) {
  return e || pe("configIsRequired"), rt(e) || pe("configType"), e.urls ? (ot(), {
    paths: {
      vs: e.urls.monacoBase
    }
  }) : e;
}
function ot() {
  console.warn(ge.deprecation);
}
function it(e, t) {
  throw new Error(e[t] || e.default);
}
var ge = {
  configIsRequired: "the configuration object is required",
  configType: "the configuration object should be an object",
  default: "an unknown error accured in `@monaco-editor/loader` package",
  deprecation: `Deprecation warning!
    You are using deprecated way of configuration.

    Instead of using
      monaco.config({ urls: { monacoBase: '...' } })
    use
      monaco.config({ paths: { vs: '...' } })

    For more please check the link https://github.com/suren-atoyan/monaco-loader#config
  `
}, pe = tt(it)(ge), at = {
  config: nt
}, ut = function() {
  for (var t = arguments.length, r = new Array(t), n = 0; n < t; n++)
    r[n] = arguments[n];
  return function(o) {
    return r.reduceRight(function(i, a) {
      return a(i);
    }, o);
  };
};
function he(e, t) {
  return Object.keys(t).forEach(function(r) {
    t[r] instanceof Object && e[r] && Object.assign(t[r], he(e[r], t[r]));
  }), le(le({}, e), t);
}
var ct = {
  type: "cancelation",
  msg: "operation is manually canceled"
};
function te(e) {
  var t = !1, r = new Promise(function(n, o) {
    e.then(function(i) {
      return t ? o(ct) : n(i);
    }), e.catch(o);
  });
  return r.cancel = function() {
    return t = !0;
  }, r;
}
var lt = _e.create({
  config: et,
  isInitialized: !1,
  resolve: null,
  reject: null,
  monaco: null
}), ve = Ae(lt, 2), H = ve[0], J = ve[1];
function st(e) {
  var t = at.config(e), r = t.monaco, n = xe(t, ["monaco"]);
  J(function(o) {
    return {
      config: he(o.config, n),
      monaco: r
    };
  });
}
function dt() {
  var e = H(function(t) {
    var r = t.monaco, n = t.isInitialized, o = t.resolve;
    return {
      monaco: r,
      isInitialized: n,
      resolve: o
    };
  });
  if (!e.isInitialized) {
    if (J({
      isInitialized: !0
    }), e.monaco)
      return e.resolve(e.monaco), te(re);
    if (window.monaco && window.monaco.editor)
      return me(window.monaco), e.resolve(window.monaco), te(re);
    ut(ft, gt)(ht);
  }
  return te(re);
}
function ft(e) {
  return document.body.appendChild(e);
}
function pt(e) {
  var t = document.createElement("script");
  return e && (t.src = e), t;
}
function gt(e) {
  var t = H(function(n) {
    var o = n.config, i = n.reject;
    return {
      config: o,
      reject: i
    };
  }), r = pt("".concat(t.config.paths.vs, "/loader.js"));
  return r.onload = function() {
    return e();
  }, r.onerror = t.reject, r;
}
function ht() {
  var e = H(function(r) {
    var n = r.config, o = r.resolve, i = r.reject;
    return {
      config: n,
      resolve: o,
      reject: i
    };
  }), t = window.require;
  t.config(e.config), t(["vs/editor/editor.main"], function(r) {
    me(r), e.resolve(r);
  }, function(r) {
    e.reject(r);
  });
}
function me(e) {
  H().monaco || J({
    monaco: e
  });
}
function vt() {
  return H(function(e) {
    var t = e.monaco;
    return t;
  });
}
var re = new Promise(function(e, t) {
  return J({
    resolve: e,
    reject: t
  });
}), be = {
  config: st,
  init: dt,
  __getMonacoInstance: vt
}, mt = { wrapper: { display: "flex", position: "relative", textAlign: "initial" }, fullWidth: { width: "100%" }, hide: { display: "none" } }, ne = mt, bt = { container: { display: "flex", height: "100%", width: "100%", justifyContent: "center", alignItems: "center" } }, wt = bt;
function yt({ children: e }) {
  return V.createElement("div", { style: wt.container }, e);
}
var Ot = yt, jt = Ot;
function Mt({ width: e, height: t, isEditorReady: r, loading: n, _ref: o, className: i, wrapperProps: a }) {
  return V.createElement("section", { style: { ...ne.wrapper, width: e, height: t }, ...a }, !r && V.createElement(jt, null, n), V.createElement("div", { ref: o, style: { ...ne.fullWidth, ...!r && ne.hide }, className: i }));
}
var St = Mt, we = oe(St);
function Et(e) {
  j(e, []);
}
var ye = Et;
function Pt(e, t, r = !0) {
  let n = p(!0);
  j(n.current || !r ? () => {
    n.current = !1;
  } : e, t);
}
var y = Pt;
function q() {
}
function L(e, t, r, n) {
  return Ct(e, n) || It(e, t, r, n);
}
function Ct(e, t) {
  return e.editor.getModel(Oe(e, t));
}
function It(e, t, r, n) {
  return e.editor.createModel(t, r, n ? Oe(e, n) : void 0);
}
function Oe(e, t) {
  return e.Uri.parse(t);
}
function Tt({ original: e, modified: t, language: r, originalLanguage: n, modifiedLanguage: o, originalModelPath: i, modifiedModelPath: a, keepCurrentOriginalModel: c = !1, keepCurrentModifiedModel: s = !1, theme: f = "light", loading: M = "Loading...", options: O = {}, height: R = "100%", width: E = "100%", className: x, wrapperProps: A = {}, beforeMount: S = q, onMount: Q = q }) {
  let [w, $] = Y(!1), [D, g] = Y(!0), h = p(null), d = p(null), N = p(null), m = p(Q), u = p(S), I = p(!1);
  ye(() => {
    let l = be.init();
    return l.then((v) => (d.current = v) && g(!1)).catch((v) => v?.type !== "cancelation" && console.error("Monaco initialization: error:", v)), () => h.current ? U() : l.cancel();
  }), y(() => {
    if (h.current && d.current) {
      let l = h.current.getOriginalEditor(), v = L(d.current, e || "", n || r || "text", i || "");
      v !== l.getModel() && l.setModel(v);
    }
  }, [i], w), y(() => {
    if (h.current && d.current) {
      let l = h.current.getModifiedEditor(), v = L(d.current, t || "", o || r || "text", a || "");
      v !== l.getModel() && l.setModel(v);
    }
  }, [a], w), y(() => {
    let l = h.current.getModifiedEditor();
    l.getOption(d.current.editor.EditorOption.readOnly) ? l.setValue(t || "") : t !== l.getValue() && (l.executeEdits("", [{ range: l.getModel().getFullModelRange(), text: t || "", forceMoveMarkers: !0 }]), l.pushUndoStop());
  }, [t], w), y(() => {
    h.current?.getModel()?.original.setValue(e || "");
  }, [e], w), y(() => {
    let { original: l, modified: v } = h.current.getModel();
    d.current.editor.setModelLanguage(l, n || r || "text"), d.current.editor.setModelLanguage(v, o || r || "text");
  }, [r, n, o], w), y(() => {
    d.current?.editor.setTheme(f);
  }, [f], w), y(() => {
    h.current?.updateOptions(O);
  }, [O], w);
  let B = z(() => {
    if (!d.current) return;
    u.current(d.current);
    let l = L(d.current, e || "", n || r || "text", i || ""), v = L(d.current, t || "", o || r || "text", a || "");
    h.current?.setModel({ original: l, modified: v });
  }, [r, t, o, e, n, i, a]), G = z(() => {
    !I.current && N.current && (h.current = d.current.editor.createDiffEditor(N.current, { automaticLayout: !0, ...O }), B(), d.current?.editor.setTheme(f), $(!0), I.current = !0);
  }, [O, f, B]);
  j(() => {
    w && m.current(h.current, d.current);
  }, [w]), j(() => {
    !D && !w && G();
  }, [D, w, G]);
  function U() {
    let l = h.current?.getModel();
    c || l?.original?.dispose(), s || l?.modified?.dispose(), h.current?.dispose();
  }
  return V.createElement(we, { width: E, height: R, isEditorReady: w, loading: M, _ref: N, className: x, wrapperProps: A });
}
var Lt = Tt;
oe(Lt);
function Vt(e) {
  let t = p();
  return j(() => {
    t.current = e;
  }, [e]), t.current;
}
var Rt = Vt, X = /* @__PURE__ */ new Map();
function xt({ defaultValue: e, defaultLanguage: t, defaultPath: r, value: n, language: o, path: i, theme: a = "light", line: c, loading: s = "Loading...", options: f = {}, overrideServices: M = {}, saveViewState: O = !0, keepCurrentModel: R = !1, width: E = "100%", height: x = "100%", className: A, wrapperProps: S = {}, beforeMount: Q = q, onMount: w = q, onChange: $, onValidate: D = q }) {
  let [g, h] = Y(!1), [d, N] = Y(!0), m = p(null), u = p(null), I = p(null), B = p(w), G = p(Q), U = p(), l = p(n), v = Rt(i), ie = p(!1), Z = p(!1);
  ye(() => {
    let b = be.init();
    return b.then((P) => (m.current = P) && N(!1)).catch((P) => P?.type !== "cancelation" && console.error("Monaco initialization: error:", P)), () => u.current ? Se() : b.cancel();
  }), y(() => {
    let b = L(m.current, e || n || "", t || o || "", i || r || "");
    b !== u.current?.getModel() && (O && X.set(v, u.current?.saveViewState()), u.current?.setModel(b), O && u.current?.restoreViewState(X.get(i)));
  }, [i], g), y(() => {
    u.current?.updateOptions(f);
  }, [f], g), y(() => {
    !u.current || n === void 0 || (u.current.getOption(m.current.editor.EditorOption.readOnly) ? u.current.setValue(n) : n !== u.current.getValue() && (Z.current = !0, u.current.executeEdits("", [{ range: u.current.getModel().getFullModelRange(), text: n, forceMoveMarkers: !0 }]), u.current.pushUndoStop(), Z.current = !1));
  }, [n], g), y(() => {
    let b = u.current?.getModel();
    b && o && m.current?.editor.setModelLanguage(b, o);
  }, [o], g), y(() => {
    c !== void 0 && u.current?.revealLine(c);
  }, [c], g), y(() => {
    m.current?.editor.setTheme(a);
  }, [a], g);
  let ae = z(() => {
    if (!(!I.current || !m.current) && !ie.current) {
      G.current(m.current);
      let b = i || r, P = L(m.current, n || e || "", t || o || "", b || "");
      u.current = m.current?.editor.create(I.current, { model: P, automaticLayout: !0, ...f }, M), O && u.current.restoreViewState(X.get(b)), m.current.editor.setTheme(a), c !== void 0 && u.current.revealLine(c), h(!0), ie.current = !0;
    }
  }, [e, t, r, n, o, i, f, M, O, a, c]);
  j(() => {
    g && B.current(u.current, m.current);
  }, [g]), j(() => {
    !d && !g && ae();
  }, [d, g, ae]), l.current = n, j(() => {
    g && $ && (U.current?.dispose(), U.current = u.current?.onDidChangeModelContent((b) => {
      Z.current || $(u.current.getValue(), b);
    }));
  }, [g, $]), j(() => {
    if (g) {
      let b = m.current.editor.onDidChangeMarkers((P) => {
        let _ = u.current.getModel()?.uri;
        if (_ && P.find((ee) => ee.path === _.path)) {
          let ee = m.current.editor.getModelMarkers({ resource: _ });
          D?.(ee);
        }
      });
      return () => {
        b?.dispose();
      };
    }
    return () => {
    };
  }, [g, D]);
  function Se() {
    U.current?.dispose(), R ? O && X.set(i, u.current.saveViewState()) : u.current.getModel()?.dispose(), u.current.dispose();
  }
  return V.createElement(we, { width: E, height: x, isEditorReady: g, loading: s, _ref: I, className: A, wrapperProps: S });
}
var At = xt, $t = oe(At), Dt = $t;
const je = Ee(({
  value: e,
  onChange: t,
  registerApi: r,
  className: n,
  language: o = "javascript",
  theme: i = "vs-dark",
  height: a = "300px",
  readOnly: c = !1,
  minimap: s = !0,
  lineNumbers: f = !0,
  wordWrap: M = !1,
  ...O
}, R) => {
  const E = p(null), x = z((S) => {
    E.current = S;
  }, []);
  j(() => {
    r?.({
      focus: () => E.current?.focus(),
      setValue: (S) => t?.(String(S ?? "")),
      getValue: () => E.current?.getValue() ?? ""
    });
  }, [r, t]), j(() => {
    E.current?.updateOptions({
      readOnly: c,
      minimap: { enabled: s },
      lineNumbers: f ? "on" : "off",
      wordWrap: M ? "on" : "off"
    });
  }, [c, s, f, M]);
  const A = z((S) => {
    c || t(S ?? "");
  }, [t, c]);
  return /* @__PURE__ */ ue("div", { ref: R, className: n, ...O, children: /* @__PURE__ */ ue(
    Dt,
    {
      height: a,
      language: o,
      theme: i,
      value: e ?? "",
      onChange: A,
      onMount: x,
      options: {
        readOnly: c,
        minimap: { enabled: s },
        lineNumbers: f ? "on" : "off",
        wordWrap: M ? "on" : "off",
        scrollBeyondLastLine: !1,
        automaticLayout: !0
      }
    }
  ) });
});
je.displayName = "CodeEditorRender";
const Me = "CodeEditor", Nt = Ce({
  status: "experimental",
  description: "`CodeEditor` wraps Monaco Editor (the engine behind VS Code) as an XMLUI component.",
  props: {
    initialValue: Le(),
    language: T("The programming language for syntax highlighting.", void 0, "string", "javascript"),
    theme: T("The editor color theme.", void 0, "string", "vs-dark"),
    height: T("The height of the editor.", void 0, "string", "300px"),
    readOnly: Te(),
    minimap: T("Whether to show the minimap.", void 0, "boolean", !0),
    lineNumbers: T("Whether to show line numbers.", void 0, "boolean", !0),
    wordWrap: T("Whether to wrap long lines.", void 0, "boolean", !1)
  },
  events: {
    didChange: Ie(Me)
  },
  apis: {
    value: {
      description: "Gets the current editor content.",
      signature: "get value(): string"
    },
    setValue: {
      description: "Sets the editor content programmatically.",
      signature: "setValue(value: string): void",
      parameters: { value: "The new text content." }
    },
    focus: {
      description: "Sets focus on the editor.",
      signature: "focus(): void"
    }
  }
}), Ut = Pe(Me, je, Nt, {
  booleans: ["readOnly", "minimap", "lineNumbers", "wordWrap"],
  strings: ["language", "theme", "height"],
  events: {
    didChange: "onDidChange"
  }
}), Ft = {
  namespace: "XMLUIExtensions",
  components: [Ut]
};
export {
  Ft as default
};

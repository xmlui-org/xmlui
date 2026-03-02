import "./index.css";
import { jsx as g, jsxs as te } from "react/jsx-runtime";
import * as a from "react";
import D, { forwardRef as Ce, useRef as ee, useState as Re, useEffect as Ie, useCallback as _e } from "react";
import "react-dom";
import { Tooltip as Ee, wrapCompound as Pe, createMetadata as Te, parseScssVar as ke, dLostFocus as $e, dGotFocus as Me, dDidChange as Ve, d as U, dValidationStatus as De, dReadonly as Ae, dRequired as Ne, dAutoFocus as Oe, dEnabled as Be, dInitialValue as Fe } from "xmlui";
function ne(e, [r, o]) {
  return Math.min(o, Math.max(r, e));
}
function O(e, r, { checkForDefaultPrevented: o = !0 } = {}) {
  return function(t) {
    if (e?.(t), o === !1 || !t.defaultPrevented)
      return r?.(t);
  };
}
function re(e, r) {
  if (typeof e == "function")
    return e(r);
  e != null && (e.current = r);
}
function ie(...e) {
  return (r) => {
    let o = !1;
    const i = e.map((t) => {
      const n = re(t, r);
      return !o && typeof n == "function" && (o = !0), n;
    });
    if (o)
      return () => {
        for (let t = 0; t < i.length; t++) {
          const n = i[t];
          typeof n == "function" ? n() : re(e[t], null);
        }
      };
  };
}
function M(...e) {
  return a.useCallback(ie(...e), e);
}
function le(e, r = []) {
  let o = [];
  function i(n, l) {
    const s = a.createContext(l), c = o.length;
    o = [...o, l];
    const d = (u) => {
      const { scope: h, children: x, ...C } = u, b = h?.[e]?.[c] || s, m = a.useMemo(() => C, Object.values(C));
      return /* @__PURE__ */ g(b.Provider, { value: m, children: x });
    };
    d.displayName = n + "Provider";
    function f(u, h) {
      const x = h?.[e]?.[c] || s, C = a.useContext(x);
      if (C) return C;
      if (l !== void 0) return l;
      throw new Error(`\`${u}\` must be used within \`${n}\``);
    }
    return [d, f];
  }
  const t = () => {
    const n = o.map((l) => a.createContext(l));
    return function(s) {
      const c = s?.[e] || n;
      return a.useMemo(
        () => ({ [`__scope${e}`]: { ...s, [e]: c } }),
        [s, c]
      );
    };
  };
  return t.scopeName = e, [i, ze(t, ...r)];
}
function ze(...e) {
  const r = e[0];
  if (e.length === 1) return r;
  const o = () => {
    const i = e.map((t) => ({
      useScope: t(),
      scopeName: t.scopeName
    }));
    return function(n) {
      const l = i.reduce((s, { useScope: c, scopeName: d }) => {
        const u = c(n)[`__scope${d}`];
        return { ...s, ...u };
      }, {});
      return a.useMemo(() => ({ [`__scope${r.scopeName}`]: l }), [l]);
    };
  };
  return o.scopeName = r.scopeName, o;
}
var se = globalThis?.document ? a.useLayoutEffect : () => {
}, Ke = a[" useInsertionEffect ".trim().toString()] || se;
function We({
  prop: e,
  defaultProp: r,
  onChange: o = () => {
  },
  caller: i
}) {
  const [t, n, l] = Le({
    defaultProp: r,
    onChange: o
  }), s = e !== void 0, c = s ? e : t;
  {
    const f = a.useRef(e !== void 0);
    a.useEffect(() => {
      const u = f.current;
      u !== s && console.warn(
        `${i} is changing from ${u ? "controlled" : "uncontrolled"} to ${s ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), f.current = s;
    }, [s, i]);
  }
  const d = a.useCallback(
    (f) => {
      if (s) {
        const u = He(f) ? f(e) : f;
        u !== e && l.current?.(u);
      } else
        n(f);
    },
    [s, e, n, l]
  );
  return [c, d];
}
function Le({
  defaultProp: e,
  onChange: r
}) {
  const [o, i] = a.useState(e), t = a.useRef(o), n = a.useRef(r);
  return Ke(() => {
    n.current = r;
  }, [r]), a.useEffect(() => {
    t.current !== o && (n.current?.(o), t.current = o);
  }, [o, t]), [o, i, n];
}
function He(e) {
  return typeof e == "function";
}
var je = a.createContext(void 0);
function Ue(e) {
  const r = a.useContext(je);
  return e || r || "ltr";
}
function qe(e) {
  const r = a.useRef({ value: e, previous: e });
  return a.useMemo(() => (r.current.value !== e && (r.current.previous = r.current.value, r.current.value = e), r.current.previous), [e]);
}
function Ye(e) {
  const [r, o] = a.useState(void 0);
  return se(() => {
    if (e) {
      o({ width: e.offsetWidth, height: e.offsetHeight });
      const i = new ResizeObserver((t) => {
        if (!Array.isArray(t) || !t.length)
          return;
        const n = t[0];
        let l, s;
        if ("borderBoxSize" in n) {
          const c = n.borderBoxSize, d = Array.isArray(c) ? c[0] : c;
          l = d.inlineSize, s = d.blockSize;
        } else
          l = e.offsetWidth, s = e.offsetHeight;
        o({ width: l, height: s });
      });
      return i.observe(e, { box: "border-box" }), () => i.unobserve(e);
    } else
      o(void 0);
  }, [e]), r;
}
// @__NO_SIDE_EFFECTS__
function Y(e) {
  const r = /* @__PURE__ */ Xe(e), o = a.forwardRef((i, t) => {
    const { children: n, ...l } = i, s = a.Children.toArray(n), c = s.find(Je);
    if (c) {
      const d = c.props.children, f = s.map((u) => u === c ? a.Children.count(d) > 1 ? a.Children.only(null) : a.isValidElement(d) ? d.props.children : null : u);
      return /* @__PURE__ */ g(r, { ...l, ref: t, children: a.isValidElement(d) ? a.cloneElement(d, void 0, f) : null });
    }
    return /* @__PURE__ */ g(r, { ...l, ref: t, children: n });
  });
  return o.displayName = `${e}.Slot`, o;
}
// @__NO_SIDE_EFFECTS__
function Xe(e) {
  const r = a.forwardRef((o, i) => {
    const { children: t, ...n } = o;
    if (a.isValidElement(t)) {
      const l = Qe(t), s = Ze(n, t.props);
      return t.type !== a.Fragment && (s.ref = i ? ie(i, l) : l), a.cloneElement(t, s);
    }
    return a.Children.count(t) > 1 ? a.Children.only(null) : null;
  });
  return r.displayName = `${e}.SlotClone`, r;
}
var Ge = Symbol("radix.slottable");
function Je(e) {
  return a.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Ge;
}
function Ze(e, r) {
  const o = { ...r };
  for (const i in r) {
    const t = e[i], n = r[i];
    /^on[A-Z]/.test(i) ? t && n ? o[i] = (...s) => {
      const c = n(...s);
      return t(...s), c;
    } : t && (o[i] = t) : i === "style" ? o[i] = { ...t, ...n } : i === "className" && (o[i] = [t, n].filter(Boolean).join(" "));
  }
  return { ...e, ...o };
}
function Qe(e) {
  let r = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, o = r && "isReactWarning" in r && r.isReactWarning;
  return o ? e.ref : (r = Object.getOwnPropertyDescriptor(e, "ref")?.get, o = r && "isReactWarning" in r && r.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
var er = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
], K = er.reduce((e, r) => {
  const o = /* @__PURE__ */ Y(`Primitive.${r}`), i = a.forwardRef((t, n) => {
    const { asChild: l, ...s } = t, c = l ? o : r;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ g(c, { ...s, ref: n });
  });
  return i.displayName = `Primitive.${r}`, { ...e, [r]: i };
}, {});
function rr(e) {
  const r = e + "CollectionProvider", [o, i] = le(r), [t, n] = o(
    r,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), l = (b) => {
    const { scope: m, children: v } = b, R = D.useRef(null), w = D.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ g(t, { scope: m, itemMap: w, collectionRef: R, children: v });
  };
  l.displayName = r;
  const s = e + "CollectionSlot", c = /* @__PURE__ */ Y(s), d = D.forwardRef(
    (b, m) => {
      const { scope: v, children: R } = b, w = n(s, v), S = M(m, w.collectionRef);
      return /* @__PURE__ */ g(c, { ref: S, children: R });
    }
  );
  d.displayName = s;
  const f = e + "CollectionItemSlot", u = "data-radix-collection-item", h = /* @__PURE__ */ Y(f), x = D.forwardRef(
    (b, m) => {
      const { scope: v, children: R, ...w } = b, S = D.useRef(null), T = M(m, S), _ = n(f, v);
      return D.useEffect(() => (_.itemMap.set(S, { ref: S, ...w }), () => void _.itemMap.delete(S))), /* @__PURE__ */ g(h, { [u]: "", ref: T, children: R });
    }
  );
  x.displayName = f;
  function C(b) {
    const m = n(e + "CollectionConsumer", b);
    return D.useCallback(() => {
      const R = m.collectionRef.current;
      if (!R) return [];
      const w = Array.from(R.querySelectorAll(`[${u}]`));
      return Array.from(m.itemMap.values()).sort(
        (_, $) => w.indexOf(_.ref.current) - w.indexOf($.ref.current)
      );
    }, [m.collectionRef, m.itemMap]);
  }
  return [
    { Provider: l, Slot: d, ItemSlot: x },
    C,
    i
  ];
}
var ae = ["PageUp", "PageDown"], ue = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], ce = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, B = "Slider", [X, or, tr] = rr(B), [de] = le(B, [
  tr
]), [nr, L] = de(B), fe = a.forwardRef(
  (e, r) => {
    const {
      name: o,
      min: i = 0,
      max: t = 100,
      step: n = 1,
      orientation: l = "horizontal",
      disabled: s = !1,
      minStepsBetweenThumbs: c = 0,
      defaultValue: d = [i],
      value: f,
      onValueChange: u = () => {
      },
      onValueCommit: h = () => {
      },
      inverted: x = !1,
      form: C,
      ...b
    } = e, m = a.useRef(/* @__PURE__ */ new Set()), v = a.useRef(0), w = l === "horizontal" ? ir : lr, [S = [], T] = We({
      prop: f,
      defaultProp: d,
      onChange: (I) => {
        [...m.current][v.current]?.focus(), u(I);
      }
    }), _ = a.useRef(S);
    function $(I) {
      const y = dr(S, I);
      k(I, y);
    }
    function H(I) {
      k(I, v.current);
    }
    function A() {
      const I = _.current[v.current];
      S[v.current] !== I && h(S);
    }
    function k(I, y, { commit: P } = { commit: !1 }) {
      const W = hr(n), j = br(Math.round((I - i) / n) * n + i, W), F = ne(j, [i, t]);
      T((N = []) => {
        const V = ur(N, F, y);
        if (pr(V, c * n)) {
          v.current = V.indexOf(F);
          const Q = String(V) !== String(N);
          return Q && P && h(V), Q ? V : N;
        } else
          return N;
      });
    }
    return /* @__PURE__ */ g(
      nr,
      {
        scope: e.__scopeSlider,
        name: o,
        disabled: s,
        min: i,
        max: t,
        valueIndexToChangeRef: v,
        thumbs: m.current,
        values: S,
        orientation: l,
        form: C,
        children: /* @__PURE__ */ g(X.Provider, { scope: e.__scopeSlider, children: /* @__PURE__ */ g(X.Slot, { scope: e.__scopeSlider, children: /* @__PURE__ */ g(
          w,
          {
            "aria-disabled": s,
            "data-disabled": s ? "" : void 0,
            ...b,
            ref: r,
            onPointerDown: O(b.onPointerDown, () => {
              s || (_.current = S);
            }),
            min: i,
            max: t,
            inverted: x,
            onSlideStart: s ? void 0 : $,
            onSlideMove: s ? void 0 : H,
            onSlideEnd: s ? void 0 : A,
            onHomeKeyDown: () => !s && k(i, 0, { commit: !0 }),
            onEndKeyDown: () => !s && k(t, S.length - 1, { commit: !0 }),
            onStepKeyDown: ({ event: I, direction: y }) => {
              if (!s) {
                const j = ae.includes(I.key) || I.shiftKey && ue.includes(I.key) ? 10 : 1, F = v.current, N = S[F], V = n * j * y;
                k(N + V, F, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
fe.displayName = B;
var [me, pe] = de(B, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), ir = a.forwardRef(
  (e, r) => {
    const {
      min: o,
      max: i,
      dir: t,
      inverted: n,
      onSlideStart: l,
      onSlideMove: s,
      onSlideEnd: c,
      onStepKeyDown: d,
      ...f
    } = e, [u, h] = a.useState(null), x = M(r, (w) => h(w)), C = a.useRef(void 0), b = Ue(t), m = b === "ltr", v = m && !n || !m && n;
    function R(w) {
      const S = C.current || u.getBoundingClientRect(), T = [0, S.width], $ = Z(T, v ? [o, i] : [i, o]);
      return C.current = S, $(w - S.left);
    }
    return /* @__PURE__ */ g(
      me,
      {
        scope: e.__scopeSlider,
        startEdge: v ? "left" : "right",
        endEdge: v ? "right" : "left",
        direction: v ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ g(
          he,
          {
            dir: b,
            "data-orientation": "horizontal",
            ...f,
            ref: x,
            style: {
              ...f.style,
              "--radix-slider-thumb-transform": "translateX(-50%)"
            },
            onSlideStart: (w) => {
              const S = R(w.clientX);
              l?.(S);
            },
            onSlideMove: (w) => {
              const S = R(w.clientX);
              s?.(S);
            },
            onSlideEnd: () => {
              C.current = void 0, c?.();
            },
            onStepKeyDown: (w) => {
              const T = ce[v ? "from-left" : "from-right"].includes(w.key);
              d?.({ event: w, direction: T ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), lr = a.forwardRef(
  (e, r) => {
    const {
      min: o,
      max: i,
      inverted: t,
      onSlideStart: n,
      onSlideMove: l,
      onSlideEnd: s,
      onStepKeyDown: c,
      ...d
    } = e, f = a.useRef(null), u = M(r, f), h = a.useRef(void 0), x = !t;
    function C(b) {
      const m = h.current || f.current.getBoundingClientRect(), v = [0, m.height], w = Z(v, x ? [i, o] : [o, i]);
      return h.current = m, w(b - m.top);
    }
    return /* @__PURE__ */ g(
      me,
      {
        scope: e.__scopeSlider,
        startEdge: x ? "bottom" : "top",
        endEdge: x ? "top" : "bottom",
        size: "height",
        direction: x ? 1 : -1,
        children: /* @__PURE__ */ g(
          he,
          {
            "data-orientation": "vertical",
            ...d,
            ref: u,
            style: {
              ...d.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
            },
            onSlideStart: (b) => {
              const m = C(b.clientY);
              n?.(m);
            },
            onSlideMove: (b) => {
              const m = C(b.clientY);
              l?.(m);
            },
            onSlideEnd: () => {
              h.current = void 0, s?.();
            },
            onStepKeyDown: (b) => {
              const v = ce[x ? "from-bottom" : "from-top"].includes(b.key);
              c?.({ event: b, direction: v ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), he = a.forwardRef(
  (e, r) => {
    const {
      __scopeSlider: o,
      onSlideStart: i,
      onSlideMove: t,
      onSlideEnd: n,
      onHomeKeyDown: l,
      onEndKeyDown: s,
      onStepKeyDown: c,
      ...d
    } = e, f = L(B, o);
    return /* @__PURE__ */ g(
      K.span,
      {
        ...d,
        ref: r,
        onKeyDown: O(e.onKeyDown, (u) => {
          u.key === "Home" ? (l(u), u.preventDefault()) : u.key === "End" ? (s(u), u.preventDefault()) : ae.concat(ue).includes(u.key) && (c(u), u.preventDefault());
        }),
        onPointerDown: O(e.onPointerDown, (u) => {
          const h = u.target;
          h.setPointerCapture(u.pointerId), u.preventDefault(), f.thumbs.has(h) ? h.focus() : i(u);
        }),
        onPointerMove: O(e.onPointerMove, (u) => {
          u.target.hasPointerCapture(u.pointerId) && t(u);
        }),
        onPointerUp: O(e.onPointerUp, (u) => {
          const h = u.target;
          h.hasPointerCapture(u.pointerId) && (h.releasePointerCapture(u.pointerId), n(u));
        })
      }
    );
  }
), be = "SliderTrack", Se = a.forwardRef(
  (e, r) => {
    const { __scopeSlider: o, ...i } = e, t = L(be, o);
    return /* @__PURE__ */ g(
      K.span,
      {
        "data-disabled": t.disabled ? "" : void 0,
        "data-orientation": t.orientation,
        ...i,
        ref: r
      }
    );
  }
);
Se.displayName = be;
var G = "SliderRange", ve = a.forwardRef(
  (e, r) => {
    const { __scopeSlider: o, ...i } = e, t = L(G, o), n = pe(G, o), l = a.useRef(null), s = M(r, l), c = t.values.length, d = t.values.map(
      (h) => we(h, t.min, t.max)
    ), f = c > 1 ? Math.min(...d) : 0, u = 100 - Math.max(...d);
    return /* @__PURE__ */ g(
      K.span,
      {
        "data-orientation": t.orientation,
        "data-disabled": t.disabled ? "" : void 0,
        ...i,
        ref: s,
        style: {
          ...e.style,
          [n.startEdge]: f + "%",
          [n.endEdge]: u + "%"
        }
      }
    );
  }
);
ve.displayName = G;
var J = "SliderThumb", ge = a.forwardRef(
  (e, r) => {
    const o = or(e.__scopeSlider), [i, t] = a.useState(null), n = M(r, (s) => t(s)), l = a.useMemo(
      () => i ? o().findIndex((s) => s.ref.current === i) : -1,
      [o, i]
    );
    return /* @__PURE__ */ g(sr, { ...e, ref: n, index: l });
  }
), sr = a.forwardRef(
  (e, r) => {
    const { __scopeSlider: o, index: i, name: t, ...n } = e, l = L(J, o), s = pe(J, o), [c, d] = a.useState(null), f = M(r, (R) => d(R)), u = c ? l.form || !!c.closest("form") : !0, h = Ye(c), x = l.values[i], C = x === void 0 ? 0 : we(x, l.min, l.max), b = cr(i, l.values.length), m = h?.[s.size], v = m ? fr(m, C, s.direction) : 0;
    return a.useEffect(() => {
      if (c)
        return l.thumbs.add(c), () => {
          l.thumbs.delete(c);
        };
    }, [c, l.thumbs]), /* @__PURE__ */ te(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [s.startEdge]: `calc(${C}% + ${v}px)`
        },
        children: [
          /* @__PURE__ */ g(X.ItemSlot, { scope: e.__scopeSlider, children: /* @__PURE__ */ g(
            K.span,
            {
              role: "slider",
              "aria-label": e["aria-label"] || b,
              "aria-valuemin": l.min,
              "aria-valuenow": x,
              "aria-valuemax": l.max,
              "aria-orientation": l.orientation,
              "data-orientation": l.orientation,
              "data-disabled": l.disabled ? "" : void 0,
              tabIndex: l.disabled ? void 0 : 0,
              ...n,
              ref: f,
              style: x === void 0 ? { display: "none" } : e.style,
              onFocus: O(e.onFocus, () => {
                l.valueIndexToChangeRef.current = i;
              })
            }
          ) }),
          u && /* @__PURE__ */ g(
            xe,
            {
              name: t ?? (l.name ? l.name + (l.values.length > 1 ? "[]" : "") : void 0),
              form: l.form,
              value: x
            },
            i
          )
        ]
      }
    );
  }
);
ge.displayName = J;
var ar = "RadioBubbleInput", xe = a.forwardRef(
  ({ __scopeSlider: e, value: r, ...o }, i) => {
    const t = a.useRef(null), n = M(t, i), l = qe(r);
    return a.useEffect(() => {
      const s = t.current;
      if (!s) return;
      const c = window.HTMLInputElement.prototype, f = Object.getOwnPropertyDescriptor(c, "value").set;
      if (l !== r && f) {
        const u = new Event("input", { bubbles: !0 });
        f.call(s, r), s.dispatchEvent(u);
      }
    }, [l, r]), /* @__PURE__ */ g(
      K.input,
      {
        style: { display: "none" },
        ...o,
        ref: n,
        defaultValue: r
      }
    );
  }
);
xe.displayName = ar;
function ur(e = [], r, o) {
  const i = [...e];
  return i[o] = r, i.sort((t, n) => t - n);
}
function we(e, r, o) {
  const n = 100 / (o - r) * (e - r);
  return ne(n, [0, 100]);
}
function cr(e, r) {
  return r > 2 ? `Value ${e + 1} of ${r}` : r === 2 ? ["Minimum", "Maximum"][e] : void 0;
}
function dr(e, r) {
  if (e.length === 1) return 0;
  const o = e.map((t) => Math.abs(t - r)), i = Math.min(...o);
  return o.indexOf(i);
}
function fr(e, r, o) {
  const i = e / 2, n = Z([0, 50], [0, i]);
  return (i - n(r) * o) * o;
}
function mr(e) {
  return e.slice(0, -1).map((r, o) => e[o + 1] - r);
}
function pr(e, r) {
  if (r > 0) {
    const o = mr(e);
    return Math.min(...o) >= r;
  }
  return !0;
}
function Z(e, r) {
  return (o) => {
    if (e[0] === e[1] || r[0] === r[1]) return r[0];
    const i = (r[1] - r[0]) / (e[1] - e[0]);
    return r[0] + i * (o - e[0]);
  };
}
function hr(e) {
  return (String(e).split(".")[1] || "").length;
}
function br(e, r) {
  const o = Math.pow(10, r);
  return Math.round(e * o) / o;
}
var Sr = fe, vr = Se, gr = ve, xr = ge;
function wr(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var q = { exports: {} };
/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
var oe;
function yr() {
  return oe || (oe = 1, (function(e) {
    (function() {
      var r = {}.hasOwnProperty;
      function o() {
        for (var n = "", l = 0; l < arguments.length; l++) {
          var s = arguments[l];
          s && (n = t(n, i(s)));
        }
        return n;
      }
      function i(n) {
        if (typeof n == "string" || typeof n == "number")
          return n;
        if (typeof n != "object")
          return "";
        if (Array.isArray(n))
          return o.apply(null, n);
        if (n.toString !== Object.prototype.toString && !n.toString.toString().includes("[native code]"))
          return n.toString();
        var l = "";
        for (var s in n)
          r.call(n, s) && n[s] && (l = t(l, s));
        return l;
      }
      function t(n, l) {
        return l ? n ? n + " " + l : n + l : n;
      }
      e.exports ? (o.default = o, e.exports = o) : window.classNames = o;
    })();
  })(q)), q.exports;
}
var Cr = yr();
const z = /* @__PURE__ */ wr(Cr), Rr = `'{"Input:borderRadius-Slider--default": "var(--xmlui-borderRadius-Slider--default)", "Input:borderColor-Slider--default": "var(--xmlui-borderColor-Slider--default)", "Input:borderWidth-Slider--default": "var(--xmlui-borderWidth-Slider--default)", "Input:borderStyle-Slider--default": "var(--xmlui-borderStyle-Slider--default)", "Input:boxShadow-Slider--default": "var(--xmlui-boxShadow-Slider--default)", "Input:borderColor-Slider--default--hover": "var(--xmlui-borderColor-Slider--default--hover)", "Input:boxShadow-Slider--default--hover": "var(--xmlui-boxShadow-Slider--default--hover)", "Input:borderColor-Slider--default--focus": "var(--xmlui-borderColor-Slider--default--focus)", "Input:boxShadow-Slider--default--focus": "var(--xmlui-boxShadow-Slider--default--focus)", "Input:borderRadius-Slider--error": "var(--xmlui-borderRadius-Slider--error)", "Input:borderColor-Slider--error": "var(--xmlui-borderColor-Slider--error)", "Input:borderWidth-Slider--error": "var(--xmlui-borderWidth-Slider--error)", "Input:borderStyle-Slider--error": "var(--xmlui-borderStyle-Slider--error)", "Input:boxShadow-Slider--error": "var(--xmlui-boxShadow-Slider--error)", "Input:borderColor-Slider--error--hover": "var(--xmlui-borderColor-Slider--error--hover)", "Input:boxShadow-Slider--error--hover": "var(--xmlui-boxShadow-Slider--error--hover)", "Input:borderColor-Slider--error--focus": "var(--xmlui-borderColor-Slider--error--focus)", "Input:boxShadow-Slider--error--focus": "var(--xmlui-boxShadow-Slider--error--focus)", "Input:borderRadius-Slider--warning": "var(--xmlui-borderRadius-Slider--warning)", "Input:borderColor-Slider--warning": "var(--xmlui-borderColor-Slider--warning)", "Input:borderWidth-Slider--warning": "var(--xmlui-borderWidth-Slider--warning)", "Input:borderStyle-Slider--warning": "var(--xmlui-borderStyle-Slider--warning)", "Input:boxShadow-Slider--warning": "var(--xmlui-boxShadow-Slider--warning)", "Input:borderColor-Slider--warning--hover": "var(--xmlui-borderColor-Slider--warning--hover)", "Input:boxShadow-Slider--warning--hover": "var(--xmlui-boxShadow-Slider--warning--hover)", "Input:borderColor-Slider--warning--focus": "var(--xmlui-borderColor-Slider--warning--focus)", "Input:boxShadow-Slider--warning--focus": "var(--xmlui-boxShadow-Slider--warning--focus)", "Input:borderRadius-Slider--success": "var(--xmlui-borderRadius-Slider--success)", "Input:borderColor-Slider--success": "var(--xmlui-borderColor-Slider--success)", "Input:borderWidth-Slider--success": "var(--xmlui-borderWidth-Slider--success)", "Input:borderStyle-Slider--success": "var(--xmlui-borderStyle-Slider--success)", "Input:boxShadow-Slider--success": "var(--xmlui-boxShadow-Slider--success)", "Input:borderColor-Slider--success--hover": "var(--xmlui-borderColor-Slider--success--hover)", "Input:boxShadow-Slider--success--hover": "var(--xmlui-boxShadow-Slider--success--hover)", "Input:borderColor-Slider--success--focus": "var(--xmlui-borderColor-Slider--success--focus)", "Input:boxShadow-Slider--success--focus": "var(--xmlui-boxShadow-Slider--success--focus)", "Input:backgroundColor-track-Slider": "var(--xmlui-backgroundColor-track-Slider)", "Input:backgroundColor-track-Slider--disabled": "var(--xmlui-backgroundColor-track-Slider--disabled)", "Input:backgroundColor-range-Slider": "var(--xmlui-backgroundColor-range-Slider)", "Input:backgroundColor-range-Slider--disabled": "var(--xmlui-backgroundColor-range-Slider--disabled)", "Input:borderWidth-thumb-Slider": "var(--xmlui-borderWidth-thumb-Slider)", "Input:borderStyle-thumb-Slider": "var(--xmlui-borderStyle-thumb-Slider)", "Input:borderColor-thumb-Slider": "var(--xmlui-borderColor-thumb-Slider)", "Input:backgroundColor-thumb-Slider": "var(--xmlui-backgroundColor-thumb-Slider)", "Input:boxShadow-thumb-Slider": "var(--xmlui-boxShadow-thumb-Slider)", "Input:backgroundColor-thumb-Slider--focus": "var(--xmlui-backgroundColor-thumb-Slider--focus)", "Input:boxShadow-thumb-Slider--focus": "var(--xmlui-boxShadow-thumb-Slider--focus)", "Input:backgroundColor-thumb-Slider--hover": "var(--xmlui-backgroundColor-thumb-Slider--hover)", "Input:boxShadow-thumb-Slider--hover": "var(--xmlui-boxShadow-thumb-Slider--hover)", "Input:backgroundColor-thumb-Slider--active": "var(--xmlui-backgroundColor-thumb-Slider--active)", "Input:boxShadow-thumb-Slider--active": "var(--xmlui-boxShadow-thumb-Slider--active)"}'`, Ir = "_sliderContainer_1cg26_14", _r = "_sliderRoot_1cg26_19", Er = "_sliderTrack_1cg26_28", Pr = "_error_1cg26_50", Tr = "_warning_1cg26_65", kr = "_valid_1cg26_80", $r = "_disabled_1cg26_95", Mr = "_sliderRange_1cg26_101", Vr = "_sliderThumb_1cg26_110", Dr = "_readOnly_1cg26_144", E = {
  themeVars: Rr,
  sliderContainer: Ir,
  sliderRoot: _r,
  sliderTrack: Er,
  error: Pr,
  warning: Tr,
  valid: kr,
  disabled: $r,
  sliderRange: Mr,
  sliderThumb: Vr,
  readOnly: Dr
}, ye = Ce(({
  value: e,
  onChange: r,
  registerApi: o,
  className: i,
  min: t = 0,
  max: n = 10,
  step: l = 1,
  inverted: s,
  enabled: c = !0,
  readOnly: d,
  required: f,
  autoFocus: u,
  tabIndex: h = -1,
  validationStatus: x = "none",
  minStepsBetweenThumbs: C = 1,
  rangeStyle: b,
  thumbStyle: m,
  showValues: v = !0,
  valueFormat: R = (_) => _.toString(),
  id: w,
  ...S
}, T) => {
  const _ = ee(null), $ = ee([]), [H, A] = Re(!1), k = Array.isArray(e) ? e : e != null ? [e] : [t];
  Ie(() => {
    o?.({
      focus: () => {
        const y = $.current.find((P) => P !== null);
        y ? y.focus() : _.current?.focus();
      },
      setValue: (y) => r?.(y)
    });
  }, [o, r]);
  const I = _e((y) => {
    d || (_.current && (_.current.value = y), r(y.length === 1 ? y[0] : y));
  }, [r, d]);
  return /* @__PURE__ */ g("div", { ...S, ref: T, className: z(E.sliderContainer, i), "data-slider-container": !0, children: /* @__PURE__ */ te(
    Sr,
    {
      ref: _,
      value: k,
      onValueChange: I,
      min: t,
      max: n,
      step: l,
      inverted: s,
      disabled: !c,
      tabIndex: h,
      "aria-readonly": d,
      minStepsBetweenThumbs: C,
      className: z(E.sliderRoot, {
        [E.disabled]: !c,
        [E.readOnly]: d
      }),
      onFocus: (y) => {
        A(!0), S.onFocus?.(y);
      },
      onBlur: (y) => {
        S.onBlur?.(y);
      },
      onMouseOver: () => A(!0),
      onMouseLeave: () => A(!1),
      onPointerDown: () => A(!0),
      children: [
        /* @__PURE__ */ g(
          vr,
          {
            "data-track": !0,
            className: z(E.sliderTrack, {
              [E.disabled]: !c,
              [E.readOnly]: d,
              [E.error]: x === "error",
              [E.warning]: x === "warning",
              [E.valid]: x === "valid"
            }),
            style: b ? { ...b } : void 0,
            children: /* @__PURE__ */ g(
              gr,
              {
                "data-range": !0,
                className: z(E.sliderRange, {
                  [E.disabled]: !c
                })
              }
            )
          }
        ),
        k.map((y, P) => /* @__PURE__ */ g(
          Ee,
          {
            text: R(k[P]),
            delayDuration: 100,
            open: v && H,
            children: /* @__PURE__ */ g(
              xr,
              {
                id: w,
                "aria-required": f,
                ref: (W) => {
                  $.current[P] = W;
                },
                className: z(E.sliderThumb, {
                  [E.disabled]: !c
                }),
                style: m ? { ...m } : void 0,
                "data-thumb-index": P,
                autoFocus: u && P === 0
              }
            )
          },
          P
        ))
      ]
    }
  ) });
});
ye.displayName = "SliderRender";
const p = "Slider", Ar = Te({
  status: "stable",
  description: "`Slider` provides an interactive control for selecting numeric values within a defined range, supporting both single value selection and range selection with multiple thumbs. It offers precise control through customizable steps and visual feedback with formatted value display.Hover over the component to see the tooltip with the current value. On mobile, tap the thumb to see the tooltip.",
  parts: {
    label: {
      description: "The label displayed for the slider."
    },
    track: {
      description: "The track element of the slider."
    },
    thumb: {
      description: "The thumb elements of the slider."
    }
  },
  props: {
    initialValue: Fe(),
    minValue: {
      description: "This property specifies the minimum value of the allowed input range.",
      valueType: "number",
      defaultValue: 0
    },
    maxValue: {
      description: "This property specifies the maximum value of the allowed input range.",
      valueType: "number",
      defaultValue: 10
    },
    step: {
      description: "This property defines the increment value for the slider, determining the allowed intervals between selectable values.",
      defaultValue: 1
    },
    minStepsBetweenThumbs: U(
      "This property sets the minimum number of steps required between multiple thumbs on the slider, ensuring they maintain a specified distance.",
      void 0,
      "number",
      1
    ),
    enabled: Be(),
    autoFocus: Oe(),
    required: Ne(),
    readOnly: Ae(),
    validationStatus: {
      ...De(),
      defaultValue: "none"
    },
    rangeStyle: U(
      "This optional property allows you to apply custom styles to the range element of the slider."
    ),
    thumbStyle: U(
      "This optional property allows you to apply custom styles to the thumb elements of the slider."
    ),
    showValues: {
      description: "This property controls whether the slider shows the current values of the thumbs.",
      valueType: "boolean",
      defaultValue: !0
    },
    valueFormat: {
      description: "This property allows you to customize how the values are displayed.",
      valueType: "any",
      defaultValue: "(value) => value.toString()"
    }
  },
  events: {
    didChange: Ve(p),
    gotFocus: Me(p),
    lostFocus: $e(p)
  },
  apis: {
    focus: {
      description: "This method sets the focus on the slider component.",
      signature: "focus(): void"
    },
    value: {
      description: `This API retrieves the current value of the \`${p}\`. You can use it to get the value programmatically.`,
      signature: "get value(): number | [number, number] | undefined"
    },
    setValue: {
      description: `This API sets the value of the \`${p}\`. You can use it to programmatically change the value.`,
      signature: "setValue(value: number | [number, number] | undefined): void",
      parameters: {
        value: "The new value to set. Can be a single value or an array of values for range sliders."
      }
    }
  },
  themeVars: ke(E.themeVars),
  defaultThemeVars: {
    [`backgroundColor-track-${p}`]: "$color-surface-200",
    [`backgroundColor-range-${p}`]: "$color-primary",
    [`borderWidth-thumb-${p}`]: "2px",
    [`borderStyle-thumb-${p}`]: "solid",
    [`borderColor-thumb-${p}`]: "$color-surface-50",
    [`backgroundColor-thumb-${p}`]: "$color-primary",
    [`backgroundColor-thumb-${p}--focus`]: "$color-primary",
    [`boxShadow-thumb-${p}--focus`]: "0 0 0 6px rgb(from $color-primary r g b / 0.4)",
    [`backgroundColor-thumb-${p}--hover`]: "$color-primary",
    [`boxShadow-thumb-${p}--hover`]: "0 0 0 6px rgb(from $color-primary r g b / 0.4)",
    [`backgroundColor-thumb-${p}--active`]: "$color-primary-400",
    [`boxShadow-thumb-${p}--active`]: "0 0 0 6px rgb(from $color-primary r g b / 0.4)",
    [`borderRadius-${p}--default`]: "$borderRadius",
    [`borderColor-${p}--default`]: "transparent",
    [`borderWidth-${p}--default`]: "0",
    [`borderStyle-${p}--default`]: "solid",
    [`boxShadow-${p}--default`]: "none",
    light: {
      [`backgroundColor-track-${p}--disabled`]: "$color-surface-300",
      [`backgroundColor-range-${p}--disabled`]: "$color-surface-400",
      [`backgroundColor-thumb-${p}`]: "$color-primary-500",
      [`borderColor-thumb-${p}`]: "$color-surface-50"
    },
    dark: {
      [`backgroundColor-track-${p}--disabled`]: "$color-surface-600",
      [`backgroundColor-range-${p}--disabled`]: "$color-surface-800",
      [`backgroundColor-thumb-${p}`]: "$color-primary-400",
      [`borderColor-thumb-${p}`]: "$color-surface-950"
    }
  }
}), Nr = Pe("SliderW", ye, Ar, {
  booleans: ["enabled", "autoFocus", "readOnly", "required", "showValues"],
  numbers: ["minValue", "maxValue", "step", "minStepsBetweenThumbs"],
  events: {
    didChange: "onDidChange",
    gotFocus: "onFocus",
    lostFocus: "onBlur"
  },
  callbacks: {
    valueFormat: "valueFormat"
  },
  rename: {
    minValue: "min",
    maxValue: "max"
  },
  parseInitialValue: (e, r) => {
    const o = Number(r.min) || 0, i = Number(r.max) || 10;
    let t = e;
    if (typeof e == "string")
      try {
        t = JSON.parse(e);
      } catch {
        t = parseFloat(e);
      }
    return (t == null || typeof t == "number" && isNaN(t)) && (t = o), (Array.isArray(t) ? t : [t]).map((l) => Math.min(i, Math.max(o, Number(l) || o)));
  },
  formatExternalValue: (e, r) => {
    const o = Number(r.min) || 0, i = Number(r.max) || 10;
    return (Array.isArray(e) ? e : e != null ? [e] : [o]).map((n) => Math.min(i, Math.max(o, Number(n) || o)));
  }
}), Wr = {
  namespace: "XMLUIExtensions",
  components: [Nr]
};
export {
  Wr as default
};

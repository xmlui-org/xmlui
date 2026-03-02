import { jsx as k, jsxs as wt } from "react/jsx-runtime";
import j, { forwardRef as N, useRef as Et, useEffect as Tt, useCallback as Dt } from "react";
import { wrapCompound as kt, createMetadata as xt, dDidChange as Ot, dReadonly as St, dEnabled as It, d as Pt, dInitialValue as At } from "xmlui";
function Mt(r, t, e) {
  return Math.max(t, Math.min(r, e));
}
const p = {
  toVector(r, t) {
    return r === void 0 && (r = t), Array.isArray(r) ? r : [r, r];
  },
  add(r, t) {
    return [r[0] + t[0], r[1] + t[1]];
  },
  sub(r, t) {
    return [r[0] - t[0], r[1] - t[1]];
  },
  addTo(r, t) {
    r[0] += t[0], r[1] += t[1];
  },
  subTo(r, t) {
    r[0] -= t[0], r[1] -= t[1];
  }
};
function Y(r, t, e) {
  return t === 0 || Math.abs(t) === 1 / 0 ? Math.pow(r, e * 5) : r * t * e / (t + e * r);
}
function H(r, t, e, i = 0.15) {
  return i === 0 ? Mt(r, t, e) : r < t ? -Y(t - r, e - t, i) + t : r > e ? +Y(r - e, e - t, i) + e : r;
}
function Ct(r, [t, e], [i, n]) {
  const [[s, o], [a, u]] = r;
  return [H(t, s, o, i), H(e, a, u, n)];
}
var S = {};
function Nt(r, t) {
  if (typeof r != "object" || r === null) return r;
  var e = r[Symbol.toPrimitive];
  if (e !== void 0) {
    var i = e.call(r, t);
    if (typeof i != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(r);
}
function Rt(r) {
  var t = Nt(r, "string");
  return typeof t == "symbol" ? t : String(t);
}
function g(r, t, e) {
  return t = Rt(t), t in r ? Object.defineProperty(r, t, {
    value: e,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : r[t] = e, r;
}
function W(r, t) {
  var e = Object.keys(r);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(r);
    t && (i = i.filter(function(n) {
      return Object.getOwnPropertyDescriptor(r, n).enumerable;
    })), e.push.apply(e, i);
  }
  return e;
}
function f(r) {
  for (var t = 1; t < arguments.length; t++) {
    var e = arguments[t] != null ? arguments[t] : {};
    t % 2 ? W(Object(e), !0).forEach(function(i) {
      g(r, i, e[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(e)) : W(Object(e)).forEach(function(i) {
      Object.defineProperty(r, i, Object.getOwnPropertyDescriptor(e, i));
    });
  }
  return r;
}
const it = {
  pointer: {
    start: "down",
    change: "move",
    end: "up"
  },
  mouse: {
    start: "down",
    change: "move",
    end: "up"
  },
  touch: {
    start: "start",
    change: "move",
    end: "end"
  },
  gesture: {
    start: "start",
    change: "change",
    end: "end"
  }
};
function z(r) {
  return r ? r[0].toUpperCase() + r.slice(1) : "";
}
const Lt = ["enter", "leave"];
function Vt(r = !1, t) {
  return r && !Lt.includes(t);
}
function jt(r, t = "", e = !1) {
  const i = it[r], n = i && i[t] || t;
  return "on" + z(r) + z(n) + (Vt(e, n) ? "Capture" : "");
}
const Kt = ["gotpointercapture", "lostpointercapture"];
function Ut(r) {
  let t = r.substring(2).toLowerCase();
  const e = !!~t.indexOf("passive");
  e && (t = t.replace("passive", ""));
  const i = Kt.includes(t) ? "capturecapture" : "capture", n = !!~t.indexOf(i);
  return n && (t = t.replace("capture", "")), {
    device: t,
    capture: n,
    passive: e
  };
}
function Bt(r, t = "") {
  const e = it[r], i = e && e[t] || t;
  return r + i;
}
function R(r) {
  return "touches" in r;
}
function nt(r) {
  return R(r) ? "touch" : "pointerType" in r ? r.pointerType : "mouse";
}
function Ft(r) {
  return Array.from(r.touches).filter((t) => {
    var e, i;
    return t.target === r.currentTarget || ((e = r.currentTarget) === null || e === void 0 || (i = e.contains) === null || i === void 0 ? void 0 : i.call(e, t.target));
  });
}
function $t(r) {
  return r.type === "touchend" || r.type === "touchcancel" ? r.changedTouches : r.targetTouches;
}
function st(r) {
  return R(r) ? $t(r)[0] : r;
}
function Yt(r) {
  return Ft(r).map((t) => t.identifier);
}
function K(r) {
  const t = st(r);
  return R(r) ? t.identifier : t.pointerId;
}
function G(r) {
  const t = st(r);
  return [t.clientX, t.clientY];
}
function Ht(r) {
  const t = {};
  if ("buttons" in r && (t.buttons = r.buttons), "shiftKey" in r) {
    const {
      shiftKey: e,
      altKey: i,
      metaKey: n,
      ctrlKey: s
    } = r;
    Object.assign(t, {
      shiftKey: e,
      altKey: i,
      metaKey: n,
      ctrlKey: s
    });
  }
  return t;
}
function M(r, ...t) {
  return typeof r == "function" ? r(...t) : r;
}
function Wt() {
}
function zt(...r) {
  return r.length === 0 ? Wt : r.length === 1 ? r[0] : function() {
    let t;
    for (const e of r)
      t = e.apply(this, arguments) || t;
    return t;
  };
}
function X(r, t) {
  return Object.assign({}, t, r || {});
}
const Gt = 32;
class Xt {
  constructor(t, e, i) {
    this.ctrl = t, this.args = e, this.key = i, this.state || (this.state = {}, this.computeValues([0, 0]), this.computeInitial(), this.init && this.init(), this.reset());
  }
  get state() {
    return this.ctrl.state[this.key];
  }
  set state(t) {
    this.ctrl.state[this.key] = t;
  }
  get shared() {
    return this.ctrl.state.shared;
  }
  get eventStore() {
    return this.ctrl.gestureEventStores[this.key];
  }
  get timeoutStore() {
    return this.ctrl.gestureTimeoutStores[this.key];
  }
  get config() {
    return this.ctrl.config[this.key];
  }
  get sharedConfig() {
    return this.ctrl.config.shared;
  }
  get handler() {
    return this.ctrl.handlers[this.key];
  }
  reset() {
    const {
      state: t,
      shared: e,
      ingKey: i,
      args: n
    } = this;
    e[i] = t._active = t.active = t._blocked = t._force = !1, t._step = [!1, !1], t.intentional = !1, t._movement = [0, 0], t._distance = [0, 0], t._direction = [0, 0], t._delta = [0, 0], t._bounds = [[-1 / 0, 1 / 0], [-1 / 0, 1 / 0]], t.args = n, t.axis = void 0, t.memo = void 0, t.elapsedTime = t.timeDelta = 0, t.direction = [0, 0], t.distance = [0, 0], t.overflow = [0, 0], t._movementBound = [!1, !1], t.velocity = [0, 0], t.movement = [0, 0], t.delta = [0, 0], t.timeStamp = 0;
  }
  start(t) {
    const e = this.state, i = this.config;
    e._active || (this.reset(), this.computeInitial(), e._active = !0, e.target = t.target, e.currentTarget = t.currentTarget, e.lastOffset = i.from ? M(i.from, e) : e.offset, e.offset = e.lastOffset, e.startTime = e.timeStamp = t.timeStamp);
  }
  computeValues(t) {
    const e = this.state;
    e._values = t, e.values = this.config.transform(t);
  }
  computeInitial() {
    const t = this.state;
    t._initial = t._values, t.initial = t.values;
  }
  compute(t) {
    const {
      state: e,
      config: i,
      shared: n
    } = this;
    e.args = this.args;
    let s = 0;
    if (t && (e.event = t, i.preventDefault && t.cancelable && e.event.preventDefault(), e.type = t.type, n.touches = this.ctrl.pointerIds.size || this.ctrl.touchIds.size, n.locked = !!document.pointerLockElement, Object.assign(n, Ht(t)), n.down = n.pressed = n.buttons % 2 === 1 || n.touches > 0, s = t.timeStamp - e.timeStamp, e.timeStamp = t.timeStamp, e.elapsedTime = e.timeStamp - e.startTime), e._active) {
      const b = e._delta.map(Math.abs);
      p.addTo(e._distance, b);
    }
    this.axisIntent && this.axisIntent(t);
    const [o, a] = e._movement, [u, l] = i.threshold, {
      _step: c,
      values: h
    } = e;
    if (i.hasCustomTransform ? (c[0] === !1 && (c[0] = Math.abs(o) >= u && h[0]), c[1] === !1 && (c[1] = Math.abs(a) >= l && h[1])) : (c[0] === !1 && (c[0] = Math.abs(o) >= u && Math.sign(o) * u), c[1] === !1 && (c[1] = Math.abs(a) >= l && Math.sign(a) * l)), e.intentional = c[0] !== !1 || c[1] !== !1, !e.intentional) return;
    const d = [0, 0];
    if (i.hasCustomTransform) {
      const [b, _t] = h;
      d[0] = c[0] !== !1 ? b - c[0] : 0, d[1] = c[1] !== !1 ? _t - c[1] : 0;
    } else
      d[0] = c[0] !== !1 ? o - c[0] : 0, d[1] = c[1] !== !1 ? a - c[1] : 0;
    this.restrictToAxis && !e._blocked && this.restrictToAxis(d);
    const y = e.offset, _ = e._active && !e._blocked || e.active;
    _ && (e.first = e._active && !e.active, e.last = !e._active && e.active, e.active = n[this.ingKey] = e._active, t && (e.first && ("bounds" in i && (e._bounds = M(i.bounds, e)), this.setup && this.setup()), e.movement = d, this.computeOffset()));
    const [m, w] = e.offset, [[E, T], [x, L]] = e._bounds;
    e.overflow = [m < E ? -1 : m > T ? 1 : 0, w < x ? -1 : w > L ? 1 : 0], e._movementBound[0] = e.overflow[0] ? e._movementBound[0] === !1 ? e._movement[0] : e._movementBound[0] : !1, e._movementBound[1] = e.overflow[1] ? e._movementBound[1] === !1 ? e._movement[1] : e._movementBound[1] : !1;
    const V = e._active ? i.rubberband || [0, 0] : [0, 0];
    if (e.offset = Ct(e._bounds, e.offset, V), e.delta = p.sub(e.offset, y), this.computeMovement(), _ && (!e.last || s > Gt)) {
      e.delta = p.sub(e.offset, y);
      const b = e.delta.map(Math.abs);
      p.addTo(e.distance, b), e.direction = e.delta.map(Math.sign), e._direction = e._delta.map(Math.sign), !e.first && s > 0 && (e.velocity = [b[0] / s, b[1] / s], e.timeDelta = s);
    }
  }
  emit() {
    const t = this.state, e = this.shared, i = this.config;
    if (t._active || this.clean(), (t._blocked || !t.intentional) && !t._force && !i.triggerAllEvents) return;
    const n = this.handler(f(f(f({}, e), t), {}, {
      [this.aliasKey]: t.values
    }));
    n !== void 0 && (t.memo = n);
  }
  clean() {
    this.eventStore.clean(), this.timeoutStore.clean();
  }
}
function qt([r, t], e) {
  const i = Math.abs(r), n = Math.abs(t);
  if (i > n && i > e)
    return "x";
  if (n > i && n > e)
    return "y";
}
class Jt extends Xt {
  constructor(...t) {
    super(...t), g(this, "aliasKey", "xy");
  }
  reset() {
    super.reset(), this.state.axis = void 0;
  }
  init() {
    this.state.offset = [0, 0], this.state.lastOffset = [0, 0];
  }
  computeOffset() {
    this.state.offset = p.add(this.state.lastOffset, this.state.movement);
  }
  computeMovement() {
    this.state.movement = p.sub(this.state.offset, this.state.lastOffset);
  }
  axisIntent(t) {
    const e = this.state, i = this.config;
    if (!e.axis && t) {
      const n = typeof i.axisThreshold == "object" ? i.axisThreshold[nt(t)] : i.axisThreshold;
      e.axis = qt(e._movement, n);
    }
    e._blocked = (i.lockDirection || !!i.axis) && !e.axis || !!i.axis && i.axis !== e.axis;
  }
  restrictToAxis(t) {
    if (this.config.axis || this.config.lockDirection)
      switch (this.state.axis) {
        case "x":
          t[1] = 0;
          break;
        case "y":
          t[0] = 0;
          break;
      }
  }
}
const q = (r) => r, J = 0.15, B = {
  enabled(r = !0) {
    return r;
  },
  eventOptions(r, t, e) {
    return f(f({}, e.shared.eventOptions), r);
  },
  preventDefault(r = !1) {
    return r;
  },
  triggerAllEvents(r = !1) {
    return r;
  },
  rubberband(r = 0) {
    switch (r) {
      case !0:
        return [J, J];
      case !1:
        return [0, 0];
      default:
        return p.toVector(r);
    }
  },
  from(r) {
    if (typeof r == "function") return r;
    if (r != null) return p.toVector(r);
  },
  transform(r, t, e) {
    const i = r || e.shared.transform;
    if (this.hasCustomTransform = !!i, S.NODE_ENV === "development") {
      const n = i || q;
      return (s) => {
        const o = n(s);
        return (!isFinite(o[0]) || !isFinite(o[1])) && console.warn(`[@use-gesture]: config.transform() must produce a valid result, but it was: [${o[0]},${[1]}]`), o;
      };
    }
    return i || q;
  },
  threshold(r) {
    return p.toVector(r, 0);
  }
};
S.NODE_ENV === "development" && Object.assign(B, {
  domTarget(r) {
    if (r !== void 0)
      throw Error("[@use-gesture]: `domTarget` option has been renamed to `target`.");
    return NaN;
  },
  lockDirection(r) {
    if (r !== void 0)
      throw Error("[@use-gesture]: `lockDirection` option has been merged with `axis`. Use it as in `{ axis: 'lock' }`");
    return NaN;
  },
  initial(r) {
    if (r !== void 0)
      throw Error("[@use-gesture]: `initial` option has been renamed to `from`.");
    return NaN;
  }
});
const Qt = 0, I = f(f({}, B), {}, {
  axis(r, t, {
    axis: e
  }) {
    if (this.lockDirection = e === "lock", !this.lockDirection) return e;
  },
  axisThreshold(r = Qt) {
    return r;
  },
  bounds(r = {}) {
    if (typeof r == "function")
      return (s) => I.bounds(r(s));
    if ("current" in r)
      return () => r.current;
    if (typeof HTMLElement == "function" && r instanceof HTMLElement)
      return r;
    const {
      left: t = -1 / 0,
      right: e = 1 / 0,
      top: i = -1 / 0,
      bottom: n = 1 / 0
    } = r;
    return [[t, e], [i, n]];
  }
}), Q = {
  ArrowRight: (r, t = 1) => [r * t, 0],
  ArrowLeft: (r, t = 1) => [-1 * r * t, 0],
  ArrowUp: (r, t = 1) => [0, -1 * r * t],
  ArrowDown: (r, t = 1) => [0, r * t]
};
class Zt extends Jt {
  constructor(...t) {
    super(...t), g(this, "ingKey", "dragging");
  }
  reset() {
    super.reset();
    const t = this.state;
    t._pointerId = void 0, t._pointerActive = !1, t._keyboardActive = !1, t._preventScroll = !1, t._delayed = !1, t.swipe = [0, 0], t.tap = !1, t.canceled = !1, t.cancel = this.cancel.bind(this);
  }
  setup() {
    const t = this.state;
    if (t._bounds instanceof HTMLElement) {
      const e = t._bounds.getBoundingClientRect(), i = t.currentTarget.getBoundingClientRect(), n = {
        left: e.left - i.left + t.offset[0],
        right: e.right - i.right + t.offset[0],
        top: e.top - i.top + t.offset[1],
        bottom: e.bottom - i.bottom + t.offset[1]
      };
      t._bounds = I.bounds(n);
    }
  }
  cancel() {
    const t = this.state;
    t.canceled || (t.canceled = !0, t._active = !1, setTimeout(() => {
      this.compute(), this.emit();
    }, 0));
  }
  setActive() {
    this.state._active = this.state._pointerActive || this.state._keyboardActive;
  }
  clean() {
    this.pointerClean(), this.state._pointerActive = !1, this.state._keyboardActive = !1, super.clean();
  }
  pointerDown(t) {
    const e = this.config, i = this.state;
    if (t.buttons != null && (Array.isArray(e.pointerButtons) ? !e.pointerButtons.includes(t.buttons) : e.pointerButtons !== -1 && e.pointerButtons !== t.buttons)) return;
    const n = this.ctrl.setEventIds(t);
    e.pointerCapture && t.target.setPointerCapture(t.pointerId), !(n && n.size > 1 && i._pointerActive) && (this.start(t), this.setupPointer(t), i._pointerId = K(t), i._pointerActive = !0, this.computeValues(G(t)), this.computeInitial(), e.preventScrollAxis && nt(t) !== "mouse" ? (i._active = !1, this.setupScrollPrevention(t)) : e.delay > 0 ? (this.setupDelayTrigger(t), e.triggerAllEvents && (this.compute(t), this.emit())) : this.startPointerDrag(t));
  }
  startPointerDrag(t) {
    const e = this.state;
    e._active = !0, e._preventScroll = !0, e._delayed = !1, this.compute(t), this.emit();
  }
  pointerMove(t) {
    const e = this.state, i = this.config;
    if (!e._pointerActive) return;
    const n = K(t);
    if (e._pointerId !== void 0 && n !== e._pointerId) return;
    const s = G(t);
    if (document.pointerLockElement === t.target ? e._delta = [t.movementX, t.movementY] : (e._delta = p.sub(s, e._values), this.computeValues(s)), p.addTo(e._movement, e._delta), this.compute(t), e._delayed && e.intentional) {
      this.timeoutStore.remove("dragDelay"), e.active = !1, this.startPointerDrag(t);
      return;
    }
    if (i.preventScrollAxis && !e._preventScroll)
      if (e.axis)
        if (e.axis === i.preventScrollAxis || i.preventScrollAxis === "xy") {
          e._active = !1, this.clean();
          return;
        } else {
          this.timeoutStore.remove("startPointerDrag"), this.startPointerDrag(t);
          return;
        }
      else
        return;
    this.emit();
  }
  pointerUp(t) {
    this.ctrl.setEventIds(t);
    try {
      this.config.pointerCapture && t.target.hasPointerCapture(t.pointerId) && t.target.releasePointerCapture(t.pointerId);
    } catch {
      S.NODE_ENV === "development" && console.warn("[@use-gesture]: If you see this message, it's likely that you're using an outdated version of `@react-three/fiber`. \n\nPlease upgrade to the latest version.");
    }
    const e = this.state, i = this.config;
    if (!e._active || !e._pointerActive) return;
    const n = K(t);
    if (e._pointerId !== void 0 && n !== e._pointerId) return;
    this.state._pointerActive = !1, this.setActive(), this.compute(t);
    const [s, o] = e._distance;
    if (e.tap = s <= i.tapsThreshold && o <= i.tapsThreshold, e.tap && i.filterTaps)
      e._force = !0;
    else {
      const [a, u] = e._delta, [l, c] = e._movement, [h, d] = i.swipe.velocity, [y, _] = i.swipe.distance, m = i.swipe.duration;
      if (e.elapsedTime < m) {
        const w = Math.abs(a / e.timeDelta), E = Math.abs(u / e.timeDelta);
        w > h && Math.abs(l) > y && (e.swipe[0] = Math.sign(a)), E > d && Math.abs(c) > _ && (e.swipe[1] = Math.sign(u));
      }
    }
    this.emit();
  }
  pointerClick(t) {
    !this.state.tap && t.detail > 0 && (t.preventDefault(), t.stopPropagation());
  }
  setupPointer(t) {
    const e = this.config, i = e.device;
    if (S.NODE_ENV === "development")
      try {
        if (i === "pointer" && e.preventScrollDelay === void 0) {
          const n = "uv" in t ? t.sourceEvent.currentTarget : t.currentTarget;
          window.getComputedStyle(n).touchAction === "auto" && console.warn("[@use-gesture]: The drag target has its `touch-action` style property set to `auto`. It is recommended to add `touch-action: 'none'` so that the drag gesture behaves correctly on touch-enabled devices. For more information read this: https://use-gesture.netlify.app/docs/extras/#touch-action.\n\nThis message will only show in development mode. It won't appear in production. If this is intended, you can ignore it.", n);
        }
      } catch {
      }
    e.pointerLock && t.currentTarget.requestPointerLock(), e.pointerCapture || (this.eventStore.add(this.sharedConfig.window, i, "change", this.pointerMove.bind(this)), this.eventStore.add(this.sharedConfig.window, i, "end", this.pointerUp.bind(this)), this.eventStore.add(this.sharedConfig.window, i, "cancel", this.pointerUp.bind(this)));
  }
  pointerClean() {
    this.config.pointerLock && document.pointerLockElement === this.state.currentTarget && document.exitPointerLock();
  }
  preventScroll(t) {
    this.state._preventScroll && t.cancelable && t.preventDefault();
  }
  setupScrollPrevention(t) {
    this.state._preventScroll = !1, te(t);
    const e = this.eventStore.add(this.sharedConfig.window, "touch", "change", this.preventScroll.bind(this), {
      passive: !1
    });
    this.eventStore.add(this.sharedConfig.window, "touch", "end", e), this.eventStore.add(this.sharedConfig.window, "touch", "cancel", e), this.timeoutStore.add("startPointerDrag", this.startPointerDrag.bind(this), this.config.preventScrollDelay, t);
  }
  setupDelayTrigger(t) {
    this.state._delayed = !0, this.timeoutStore.add("dragDelay", () => {
      this.state._step = [0, 0], this.startPointerDrag(t);
    }, this.config.delay);
  }
  keyDown(t) {
    const e = Q[t.key];
    if (e) {
      const i = this.state, n = t.shiftKey ? 10 : t.altKey ? 0.1 : 1;
      this.start(t), i._delta = e(this.config.keyboardDisplacement, n), i._keyboardActive = !0, p.addTo(i._movement, i._delta), this.compute(t), this.emit();
    }
  }
  keyUp(t) {
    t.key in Q && (this.state._keyboardActive = !1, this.setActive(), this.compute(t), this.emit());
  }
  bind(t) {
    const e = this.config.device;
    t(e, "start", this.pointerDown.bind(this)), this.config.pointerCapture && (t(e, "change", this.pointerMove.bind(this)), t(e, "end", this.pointerUp.bind(this)), t(e, "cancel", this.pointerUp.bind(this)), t("lostPointerCapture", "", this.pointerUp.bind(this))), this.config.keys && (t("key", "down", this.keyDown.bind(this)), t("key", "up", this.keyUp.bind(this))), this.config.filterTaps && t("click", "", this.pointerClick.bind(this), {
      capture: !0,
      passive: !1
    });
  }
}
function te(r) {
  "persist" in r && typeof r.persist == "function" && r.persist();
}
const P = typeof window < "u" && window.document && window.document.createElement;
function ot() {
  return P && "ontouchstart" in window;
}
function ee() {
  return ot() || P && window.navigator.maxTouchPoints > 1;
}
function re() {
  return P && "onpointerdown" in window;
}
function ie() {
  return P && "exitPointerLock" in window.document;
}
function ne() {
  try {
    return "constructor" in GestureEvent;
  } catch {
    return !1;
  }
}
const v = {
  isBrowser: P,
  gesture: ne(),
  touch: ot(),
  touchscreen: ee(),
  pointer: re(),
  pointerLock: ie()
}, se = 250, oe = 180, ae = 0.5, ce = 50, ue = 250, le = 10, Z = {
  mouse: 0,
  touch: 0,
  pen: 8
}, at = f(f({}, I), {}, {
  device(r, t, {
    pointer: {
      touch: e = !1,
      lock: i = !1,
      mouse: n = !1
    } = {}
  }) {
    return this.pointerLock = i && v.pointerLock, v.touch && e ? "touch" : this.pointerLock ? "mouse" : v.pointer && !n ? "pointer" : v.touch ? "touch" : "mouse";
  },
  preventScrollAxis(r, t, {
    preventScroll: e
  }) {
    if (this.preventScrollDelay = typeof e == "number" ? e : e || e === void 0 && r ? se : void 0, !(!v.touchscreen || e === !1))
      return r || (e !== void 0 ? "y" : void 0);
  },
  pointerCapture(r, t, {
    pointer: {
      capture: e = !0,
      buttons: i = 1,
      keys: n = !0
    } = {}
  }) {
    return this.pointerButtons = i, this.keys = n, !this.pointerLock && this.device === "pointer" && e;
  },
  threshold(r, t, {
    filterTaps: e = !1,
    tapsThreshold: i = 3,
    axis: n = void 0
  }) {
    const s = p.toVector(r, e ? i : n ? 1 : 0);
    return this.filterTaps = e, this.tapsThreshold = i, s;
  },
  swipe({
    velocity: r = ae,
    distance: t = ce,
    duration: e = ue
  } = {}) {
    return {
      velocity: this.transform(p.toVector(r)),
      distance: this.transform(p.toVector(t)),
      duration: e
    };
  },
  delay(r = 0) {
    switch (r) {
      case !0:
        return oe;
      case !1:
        return 0;
      default:
        return r;
    }
  },
  axisThreshold(r) {
    return r ? f(f({}, Z), r) : Z;
  },
  keyboardDisplacement(r = le) {
    return r;
  }
});
S.NODE_ENV === "development" && Object.assign(at, {
  useTouch(r) {
    if (r !== void 0)
      throw Error("[@use-gesture]: `useTouch` option has been renamed to `pointer.touch`. Use it as in `{ pointer: { touch: true } }`.");
    return NaN;
  },
  experimental_preventWindowScrollY(r) {
    if (r !== void 0)
      throw Error("[@use-gesture]: `experimental_preventWindowScrollY` option has been renamed to `preventScroll`.");
    return NaN;
  },
  swipeVelocity(r) {
    if (r !== void 0)
      throw Error("[@use-gesture]: `swipeVelocity` option has been renamed to `swipe.velocity`. Use it as in `{ swipe: { velocity: 0.5 } }`.");
    return NaN;
  },
  swipeDistance(r) {
    if (r !== void 0)
      throw Error("[@use-gesture]: `swipeDistance` option has been renamed to `swipe.distance`. Use it as in `{ swipe: { distance: 50 } }`.");
    return NaN;
  },
  swipeDuration(r) {
    if (r !== void 0)
      throw Error("[@use-gesture]: `swipeDuration` option has been renamed to `swipe.duration`. Use it as in `{ swipe: { duration: 250 } }`.");
    return NaN;
  }
});
f(f({}, B), {}, {
  device(r, t, {
    shared: e,
    pointer: {
      touch: i = !1
    } = {}
  }) {
    if (e.target && !v.touch && v.gesture) return "gesture";
    if (v.touch && i) return "touch";
    if (v.touchscreen) {
      if (v.pointer) return "pointer";
      if (v.touch) return "touch";
    }
  },
  bounds(r, t, {
    scaleBounds: e = {},
    angleBounds: i = {}
  }) {
    const n = (o) => {
      const a = X(M(e, o), {
        min: -1 / 0,
        max: 1 / 0
      });
      return [a.min, a.max];
    }, s = (o) => {
      const a = X(M(i, o), {
        min: -1 / 0,
        max: 1 / 0
      });
      return [a.min, a.max];
    };
    return typeof e != "function" && typeof i != "function" ? [n(), s()] : (o) => [n(o), s(o)];
  },
  threshold(r, t, e) {
    return this.lockDirection = e.axis === "lock", p.toVector(r, this.lockDirection ? [0.1, 3] : 0);
  },
  modifierKey(r) {
    return r === void 0 ? "ctrlKey" : r;
  },
  pinchOnWheel(r = !0) {
    return r;
  }
});
f(f({}, I), {}, {
  mouseOnly: (r = !0) => r
});
f(f({}, I), {}, {
  mouseOnly: (r = !0) => r
});
const ct = /* @__PURE__ */ new Map(), U = /* @__PURE__ */ new Map();
function fe(r) {
  ct.set(r.key, r.engine), U.set(r.key, r.resolver);
}
const de = {
  key: "drag",
  engine: Zt,
  resolver: at
};
var ut = {};
function he(r, t) {
  if (r == null) return {};
  var e = {}, i = Object.keys(r), n, s;
  for (s = 0; s < i.length; s++)
    n = i[s], !(t.indexOf(n) >= 0) && (e[n] = r[n]);
  return e;
}
function pe(r, t) {
  if (r == null) return {};
  var e = he(r, t), i, n;
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(r);
    for (n = 0; n < s.length; n++)
      i = s[n], !(t.indexOf(i) >= 0) && Object.prototype.propertyIsEnumerable.call(r, i) && (e[i] = r[i]);
  }
  return e;
}
const me = {
  target(r) {
    if (r)
      return () => "current" in r ? r.current : r;
  },
  enabled(r = !0) {
    return r;
  },
  window(r = v.isBrowser ? window : void 0) {
    return r;
  },
  eventOptions({
    passive: r = !0,
    capture: t = !1
  } = {}) {
    return {
      passive: r,
      capture: t
    };
  },
  transform(r) {
    return r;
  }
}, ge = ["target", "eventOptions", "window", "enabled", "transform"];
function A(r = {}, t) {
  const e = {};
  for (const [i, n] of Object.entries(t))
    switch (typeof n) {
      case "function":
        if (ut.NODE_ENV === "development") {
          const s = n.call(e, r[i], i, r);
          Number.isNaN(s) || (e[i] = s);
        } else
          e[i] = n.call(e, r[i], i, r);
        break;
      case "object":
        e[i] = A(r[i], n);
        break;
      case "boolean":
        n && (e[i] = r[i]);
        break;
    }
  return e;
}
function ve(r, t, e = {}) {
  const i = r, {
    target: n,
    eventOptions: s,
    window: o,
    enabled: a,
    transform: u
  } = i, l = pe(i, ge);
  if (e.shared = A({
    target: n,
    eventOptions: s,
    window: o,
    enabled: a,
    transform: u
  }, me), t) {
    const c = U.get(t);
    e[t] = A(f({
      shared: e.shared
    }, l), c);
  } else
    for (const c in l) {
      const h = U.get(c);
      if (h)
        e[c] = A(f({
          shared: e.shared
        }, l[c]), h);
      else if (ut.NODE_ENV === "development" && !["drag", "pinch", "scroll", "wheel", "move", "hover"].includes(c)) {
        if (c === "domTarget")
          throw Error("[@use-gesture]: `domTarget` option has been renamed to `target`.");
        console.warn(`[@use-gesture]: Unknown config key \`${c}\` was used. Please read the documentation for further information.`);
      }
    }
  return e;
}
class lt {
  constructor(t, e) {
    g(this, "_listeners", /* @__PURE__ */ new Set()), this._ctrl = t, this._gestureKey = e;
  }
  add(t, e, i, n, s) {
    const o = this._listeners, a = Bt(e, i), u = this._gestureKey ? this._ctrl.config[this._gestureKey].eventOptions : {}, l = f(f({}, u), s);
    t.addEventListener(a, n, l);
    const c = () => {
      t.removeEventListener(a, n, l), o.delete(c);
    };
    return o.add(c), c;
  }
  clean() {
    this._listeners.forEach((t) => t()), this._listeners.clear();
  }
}
class be {
  constructor() {
    g(this, "_timeouts", /* @__PURE__ */ new Map());
  }
  add(t, e, i = 140, ...n) {
    this.remove(t), this._timeouts.set(t, window.setTimeout(e, i, ...n));
  }
  remove(t) {
    const e = this._timeouts.get(t);
    e && window.clearTimeout(e);
  }
  clean() {
    this._timeouts.forEach((t) => void window.clearTimeout(t)), this._timeouts.clear();
  }
}
class ye {
  constructor(t) {
    g(this, "gestures", /* @__PURE__ */ new Set()), g(this, "_targetEventStore", new lt(this)), g(this, "gestureEventStores", {}), g(this, "gestureTimeoutStores", {}), g(this, "handlers", {}), g(this, "config", {}), g(this, "pointerIds", /* @__PURE__ */ new Set()), g(this, "touchIds", /* @__PURE__ */ new Set()), g(this, "state", {
      shared: {
        shiftKey: !1,
        metaKey: !1,
        ctrlKey: !1,
        altKey: !1
      }
    }), _e(this, t);
  }
  setEventIds(t) {
    if (R(t))
      return this.touchIds = new Set(Yt(t)), this.touchIds;
    if ("pointerId" in t)
      return t.type === "pointerup" || t.type === "pointercancel" ? this.pointerIds.delete(t.pointerId) : t.type === "pointerdown" && this.pointerIds.add(t.pointerId), this.pointerIds;
  }
  applyHandlers(t, e) {
    this.handlers = t, this.nativeHandlers = e;
  }
  applyConfig(t, e) {
    this.config = ve(t, e, this.config);
  }
  clean() {
    this._targetEventStore.clean();
    for (const t of this.gestures)
      this.gestureEventStores[t].clean(), this.gestureTimeoutStores[t].clean();
  }
  effect() {
    return this.config.shared.target && this.bind(), () => this._targetEventStore.clean();
  }
  bind(...t) {
    const e = this.config.shared, i = {};
    let n;
    if (!(e.target && (n = e.target(), !n))) {
      if (e.enabled) {
        for (const o of this.gestures) {
          const a = this.config[o], u = tt(i, a.eventOptions, !!n);
          if (a.enabled) {
            const l = ct.get(o);
            new l(this, t, o).bind(u);
          }
        }
        const s = tt(i, e.eventOptions, !!n);
        for (const o in this.nativeHandlers)
          s(o, "", (a) => this.nativeHandlers[o](f(f({}, this.state.shared), {}, {
            event: a,
            args: t
          })), void 0, !0);
      }
      for (const s in i)
        i[s] = zt(...i[s]);
      if (!n) return i;
      for (const s in i) {
        const {
          device: o,
          capture: a,
          passive: u
        } = Ut(s);
        this._targetEventStore.add(n, o, "", i[s], {
          capture: a,
          passive: u
        });
      }
    }
  }
}
function D(r, t) {
  r.gestures.add(t), r.gestureEventStores[t] = new lt(r, t), r.gestureTimeoutStores[t] = new be();
}
function _e(r, t) {
  t.drag && D(r, "drag"), t.wheel && D(r, "wheel"), t.scroll && D(r, "scroll"), t.move && D(r, "move"), t.pinch && D(r, "pinch"), t.hover && D(r, "hover");
}
const tt = (r, t, e) => (i, n, s, o = {}, a = !1) => {
  var u, l;
  const c = (u = o.capture) !== null && u !== void 0 ? u : t.capture, h = (l = o.passive) !== null && l !== void 0 ? l : t.passive;
  let d = a ? i : jt(i, n, c);
  e && h && (d += "Passive"), r[d] = r[d] || [], r[d].push(s);
};
function we(r, t = {}, e, i) {
  const n = j.useMemo(() => new ye(r), []);
  if (n.applyHandlers(r, i), n.applyConfig(t, e), j.useEffect(n.effect.bind(n)), j.useEffect(() => n.clean.bind(n), []), t.target === void 0)
    return n.bind.bind(n);
}
function Ee(r, t) {
  return fe(de), we({
    drag: r
  }, t || {}, "drag");
}
function Te(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var O, et;
function De() {
  if (et) return O;
  et = 1;
  var r = O && O.__assign || function() {
    return r = Object.assign || function(e) {
      for (var i, n = 1, s = arguments.length; n < s; n++) {
        i = arguments[n];
        for (var o in i) Object.prototype.hasOwnProperty.call(i, o) && (e[o] = i[o]);
      }
      return e;
    }, r.apply(this, arguments);
  };
  function t(e, i, n) {
    if (i === "className")
      e.className = [e.className, n].join(" ").trim();
    else if (i === "style")
      e.style = r(r({}, e.style), n);
    else if (typeof n == "function") {
      var s = e[i];
      e[i] = s ? function() {
        for (var o = [], a = 0; a < arguments.length; a++)
          o[a] = arguments[a];
        s.apply(void 0, o), n.apply(void 0, o);
      } : n;
    } else {
      if (
        // skip merging undefined values
        n === void 0 || // skip if both value are the same primitive value
        typeof n != "object" && n === e[i]
      )
        return;
      if (!(i in e))
        e[i] = n;
      else
        throw new Error("Didn’t know how to merge prop '".concat(i, "'. ") + "Only 'className', 'style', and event handlers are supported");
    }
  }
  return O = function() {
    for (var i = [], n = 0; n < arguments.length; n++)
      i[n] = arguments[n];
    return i.length === 1 ? i[0] : i.reduce(function(s, o) {
      for (var a in o)
        t(s, a, o[a]);
      return s;
    }, {});
  }, O;
}
var ke = De();
const xe = /* @__PURE__ */ Te(ke);
var ft = (r, t, e) => Math.max(t, Math.min(e, r)), Oe = (r) => ft(r, 0, 1), Se = (r, t, e) => (e - t) * r + t, Ie = (r, t, e) => (r - t) / (e - t), Pe = Object.defineProperty, C = Object.getOwnPropertySymbols, dt = Object.prototype.hasOwnProperty, ht = Object.prototype.propertyIsEnumerable, rt = (r, t, e) => t in r ? Pe(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e, F = (r, t) => {
  for (var e in t || (t = {})) dt.call(t, e) && rt(r, e, t[e]);
  if (C) for (var e of C(t)) ht.call(t, e) && rt(r, e, t[e]);
  return r;
}, Ae = (r, t) => {
  var e = {};
  for (var i in r) dt.call(r, i) && t.indexOf(i) < 0 && (e[i] = r[i]);
  if (r != null && C) for (var i of C(r)) t.indexOf(i) < 0 && ht.call(r, i) && (e[i] = r[i]);
  return e;
}, pt = "y", mt = !1, gt = Ie, vt = Se, $ = N((r, t) => {
  var e = r, { valueRaw: i, valueMin: n, valueMax: s, dragSensitivity: o, valueRawRoundFn: a, valueRawDisplayFn: u, onValueRawChange: l, orientation: c, axis: h = pt, includeIntoTabOrder: d = mt, mapTo01: y = gt, mapFrom01: _ = vt } = e, m = Ae(e, ["valueRaw", "valueMin", "valueMax", "dragSensitivity", "valueRawRoundFn", "valueRawDisplayFn", "onValueRawChange", "orientation", "axis", "includeIntoTabOrder", "mapTo01", "mapFrom01"]);
  let w = a(i), E = Ee(({ delta: T }) => {
    let x = 0;
    x += T[0] * o, x += T[1] * -o;
    let L = y(i, n, s), V = Oe(L + x), b = ft(_(V, n, s), n, s);
    l(b);
  }, { pointer: { keys: !1 }, axis: Me(c, h) });
  return k("div", F({ ref: t, role: "slider", "aria-valuenow": w, "aria-valuemin": n, "aria-valuemax": s, "aria-orientation": Ce(c, h), "aria-valuetext": u(i), tabIndex: d ? 0 : -1 }, xe(E(), { style: { touchAction: "none" }, onPointerDown(T) {
    T.currentTarget.focus();
  } }, m)));
});
$.displayName = "KnobHeadless";
$.defaultProps = { axis: pt, includeIntoTabOrder: mt, mapTo01: gt, mapFrom01: vt };
var Me = (r, t) => r ? r === "horizontal" ? "x" : "y" : t === "xy" ? void 0 : t, Ce = (r, t) => {
  if (r) return r;
  if (t !== "xy") return t === "x" ? "horizontal" : "vertical";
}, Ne = N((r, t) => k("label", F({ ref: t }, r)));
Ne.displayName = "KnobHeadlessLabel";
var Re = N((r, t) => k("output", F({ ref: t }, r)));
Re.displayName = "KnobHeadlessOutput";
const bt = N(({
  value: r,
  onChange: t,
  registerApi: e,
  className: i,
  min: n = 0,
  max: s = 100,
  step: o = 1,
  enabled: a = !0,
  readOnly: u,
  ...l
}, c) => {
  const h = Et(null), d = typeof r == "number" ? r : n;
  Tt(() => {
    e?.({
      focus: () => h.current?.focus(),
      setValue: (m) => t?.(Number(m))
    });
  }, [e, t]);
  const y = Dt((m) => {
    if (u || !a) return;
    const w = Math.round(m / o) * o, E = Math.min(s, Math.max(n, w));
    t(E);
  }, [t, u, a, n, s, o]), _ = (d - n) / (s - n) * 270 - 135;
  return /* @__PURE__ */ wt("div", { ref: c, className: i, ...l, style: { display: "inline-block", ...l.style }, children: [
    /* @__PURE__ */ k(
      $,
      {
        ref: h,
        valueMin: n,
        valueMax: s,
        valueRaw: d,
        valueRawRoundFn: (m) => Math.round(m / o) * o,
        valueRawDisplayFn: (m) => String(Math.round(m / o) * o),
        dragSensitivity: 6e-3,
        onValueRawChange: y,
        "aria-label": l["aria-label"] || "Knob",
        style: {
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `conic-gradient(
            var(--knob-color, #6366f1) 0deg,
            var(--knob-color, #6366f1) ${(d - n) / (s - n) * 270}deg,
            #e2e8f0 ${(d - n) / (s - n) * 270}deg,
            #e2e8f0 270deg,
            transparent 270deg
          )`,
          border: "3px solid #cbd5e1",
          cursor: a && !u ? "grab" : "default",
          opacity: a ? 1 : 0.5,
          position: "relative",
          outline: "none"
        },
        children: /* @__PURE__ */ k("div", { style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 2,
          height: "40%",
          background: "#1e293b",
          borderRadius: 1,
          transformOrigin: "bottom center",
          transform: `translate(-50%, -100%) rotate(${_}deg)`
        } })
      }
    ),
    /* @__PURE__ */ k("div", { style: { textAlign: "center", marginTop: 4, fontSize: 14, fontWeight: 600 }, children: d })
  ] });
});
bt.displayName = "KnobRender";
const yt = "Knob", Le = xt({
  status: "experimental",
  description: "`Knob` provides a circular dial input for selecting numeric values within a defined range. It wraps react-knob-headless — a headless, accessible knob primitive.",
  props: {
    initialValue: At(),
    minValue: {
      description: "Minimum value of the allowed range.",
      valueType: "number",
      defaultValue: 0
    },
    maxValue: {
      description: "Maximum value of the allowed range.",
      valueType: "number",
      defaultValue: 100
    },
    step: Pt("Step increment for the knob.", void 0, "number", 1),
    enabled: It(),
    readOnly: St()
  },
  events: {
    didChange: Ot(yt)
  },
  apis: {
    value: {
      description: "Gets the current knob value.",
      signature: "get value(): number | undefined"
    },
    setValue: {
      description: "Sets the knob value programmatically.",
      signature: "setValue(value: number): void",
      parameters: {
        value: "The new numeric value."
      }
    },
    focus: {
      description: "Sets focus on the knob.",
      signature: "focus(): void"
    }
  }
}), Ve = kt(yt, bt, Le, {
  booleans: ["enabled", "readOnly"],
  numbers: ["minValue", "maxValue", "step"],
  events: {
    didChange: "onDidChange"
  },
  rename: {
    minValue: "min",
    maxValue: "max"
  },
  parseInitialValue: (r, t) => {
    const e = Number(t.min) || 0, i = Number(t.max) || 100;
    let n = typeof r == "string" ? parseFloat(r) : r;
    return (n == null || isNaN(n)) && (n = e), Math.min(i, Math.max(e, Number(n)));
  },
  formatExternalValue: (r, t) => {
    const e = Number(t.min) || 0, i = Number(t.max) || 100, n = Number(r);
    return isNaN(n) ? e : Math.min(i, Math.max(e, n));
  }
}), Be = {
  namespace: "XMLUIExtensions",
  components: [Ve]
};
export {
  Be as default
};

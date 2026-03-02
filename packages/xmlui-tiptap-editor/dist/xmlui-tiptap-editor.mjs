import { jsxs as It, Fragment as Wr, jsx as I } from "react/jsx-runtime";
import Se, { useRef as Pr, useState as lc, useDebugValue as ac, useEffect as Ln, forwardRef as Wh, useLayoutEffect as Uh, createContext as Bs, useContext as cc, useMemo as Bu } from "react";
import Kh from "react-dom";
import { wrapCompound as Jh, createMetadata as Gh, dDidChange as Zh, d as Sn, dInitialValue as Xh } from "xmlui";
function Yh(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var br = { exports: {} }, uo = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var zu;
function Qh() {
  if (zu) return uo;
  zu = 1;
  var t = Se;
  function e(d, f) {
    return d === f && (d !== 0 || 1 / d === 1 / f) || d !== d && f !== f;
  }
  var n = typeof Object.is == "function" ? Object.is : e, r = t.useState, i = t.useEffect, o = t.useLayoutEffect, s = t.useDebugValue;
  function u(d, f) {
    var h = f(), p = r({ inst: { value: h, getSnapshot: f } }), m = p[0].inst, g = p[1];
    return o(
      function() {
        m.value = h, m.getSnapshot = f, l(m) && g({ inst: m });
      },
      [d, h, f]
    ), i(
      function() {
        return l(m) && g({ inst: m }), d(function() {
          l(m) && g({ inst: m });
        });
      },
      [d]
    ), s(h), h;
  }
  function l(d) {
    var f = d.getSnapshot;
    d = d.value;
    try {
      var h = f();
      return !n(d, h);
    } catch {
      return !0;
    }
  }
  function a(d, f) {
    return f();
  }
  var c = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? a : u;
  return uo.useSyncExternalStore = t.useSyncExternalStore !== void 0 ? t.useSyncExternalStore : c, uo;
}
var lo = {}, $u;
function ep() {
  if ($u) return lo;
  $u = 1;
  var t = {};
  /**
   * @license React
   * use-sync-external-store-shim.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  return t.NODE_ENV !== "production" && (function() {
    function e(p, m) {
      return p === m && (p !== 0 || 1 / p === 1 / m) || p !== p && m !== m;
    }
    function n(p, m) {
      d || o.startTransition === void 0 || (d = !0, console.error(
        "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
      ));
      var g = m();
      if (!f) {
        var b = m();
        s(g, b) || (console.error(
          "The result of getSnapshot should be cached to avoid an infinite loop"
        ), f = !0);
      }
      b = u({
        inst: { value: g, getSnapshot: m }
      });
      var y = b[0].inst, k = b[1];
      return a(
        function() {
          y.value = g, y.getSnapshot = m, r(y) && k({ inst: y });
        },
        [p, g, m]
      ), l(
        function() {
          return r(y) && k({ inst: y }), p(function() {
            r(y) && k({ inst: y });
          });
        },
        [p]
      ), c(g), g;
    }
    function r(p) {
      var m = p.getSnapshot;
      p = p.value;
      try {
        var g = m();
        return !s(p, g);
      } catch {
        return !0;
      }
    }
    function i(p, m) {
      return m();
    }
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var o = Se, s = typeof Object.is == "function" ? Object.is : e, u = o.useState, l = o.useEffect, a = o.useLayoutEffect, c = o.useDebugValue, d = !1, f = !1, h = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? i : n;
    lo.useSyncExternalStore = o.useSyncExternalStore !== void 0 ? o.useSyncExternalStore : h, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  })(), lo;
}
var Hu;
function zs() {
  if (Hu) return br.exports;
  Hu = 1;
  var t = {};
  return t.NODE_ENV === "production" ? br.exports = Qh() : br.exports = ep(), br.exports;
}
var dc = zs();
function se(t) {
  this.content = t;
}
se.prototype = {
  constructor: se,
  find: function(t) {
    for (var e = 0; e < this.content.length; e += 2)
      if (this.content[e] === t) return e;
    return -1;
  },
  // :: (string) → ?any
  // Retrieve the value stored under `key`, or return undefined when
  // no such key exists.
  get: function(t) {
    var e = this.find(t);
    return e == -1 ? void 0 : this.content[e + 1];
  },
  // :: (string, any, ?string) → OrderedMap
  // Create a new map by replacing the value of `key` with a new
  // value, or adding a binding to the end of the map. If `newKey` is
  // given, the key of the binding will be replaced with that key.
  update: function(t, e, n) {
    var r = n && n != t ? this.remove(n) : this, i = r.find(t), o = r.content.slice();
    return i == -1 ? o.push(n || t, e) : (o[i + 1] = e, n && (o[i] = n)), new se(o);
  },
  // :: (string) → OrderedMap
  // Return a map with the given key removed, if it existed.
  remove: function(t) {
    var e = this.find(t);
    if (e == -1) return this;
    var n = this.content.slice();
    return n.splice(e, 2), new se(n);
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the start of the map.
  addToStart: function(t, e) {
    return new se([t, e].concat(this.remove(t).content));
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the end of the map.
  addToEnd: function(t, e) {
    var n = this.remove(t).content.slice();
    return n.push(t, e), new se(n);
  },
  // :: (string, string, any) → OrderedMap
  // Add a key after the given key. If `place` is not found, the new
  // key is added to the end.
  addBefore: function(t, e, n) {
    var r = this.remove(e), i = r.content.slice(), o = r.find(t);
    return i.splice(o == -1 ? i.length : o, 0, e, n), new se(i);
  },
  // :: ((key: string, value: any))
  // Call the given function for each key/value pair in the map, in
  // order.
  forEach: function(t) {
    for (var e = 0; e < this.content.length; e += 2)
      t(this.content[e], this.content[e + 1]);
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by prepending the keys in this map that don't
  // appear in `map` before the keys in `map`.
  prepend: function(t) {
    return t = se.from(t), t.size ? new se(t.content.concat(this.subtract(t).content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by appending the keys in this map that don't
  // appear in `map` after the keys in `map`.
  append: function(t) {
    return t = se.from(t), t.size ? new se(this.subtract(t).content.concat(t.content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a map containing all the keys in this map that don't
  // appear in `map`.
  subtract: function(t) {
    var e = this;
    t = se.from(t);
    for (var n = 0; n < t.content.length; n += 2)
      e = e.remove(t.content[n]);
    return e;
  },
  // :: () → Object
  // Turn ordered map into a plain object.
  toObject: function() {
    var t = {};
    return this.forEach(function(e, n) {
      t[e] = n;
    }), t;
  },
  // :: number
  // The amount of keys in this map.
  get size() {
    return this.content.length >> 1;
  }
};
se.from = function(t) {
  if (t instanceof se) return t;
  var e = [];
  if (t) for (var n in t) e.push(n, t[n]);
  return new se(e);
};
function fc(t, e, n) {
  for (let r = 0; ; r++) {
    if (r == t.childCount || r == e.childCount)
      return t.childCount == e.childCount ? null : n;
    let i = t.child(r), o = e.child(r);
    if (i == o) {
      n += i.nodeSize;
      continue;
    }
    if (!i.sameMarkup(o))
      return n;
    if (i.isText && i.text != o.text) {
      for (let s = 0; i.text[s] == o.text[s]; s++)
        n++;
      return n;
    }
    if (i.content.size || o.content.size) {
      let s = fc(i.content, o.content, n + 1);
      if (s != null)
        return s;
    }
    n += i.nodeSize;
  }
}
function hc(t, e, n, r) {
  for (let i = t.childCount, o = e.childCount; ; ) {
    if (i == 0 || o == 0)
      return i == o ? null : { a: n, b: r };
    let s = t.child(--i), u = e.child(--o), l = s.nodeSize;
    if (s == u) {
      n -= l, r -= l;
      continue;
    }
    if (!s.sameMarkup(u))
      return { a: n, b: r };
    if (s.isText && s.text != u.text) {
      let a = 0, c = Math.min(s.text.length, u.text.length);
      for (; a < c && s.text[s.text.length - a - 1] == u.text[u.text.length - a - 1]; )
        a++, n--, r--;
      return { a: n, b: r };
    }
    if (s.content.size || u.content.size) {
      let a = hc(s.content, u.content, n - 1, r - 1);
      if (a)
        return a;
    }
    n -= l, r -= l;
  }
}
class w {
  /**
  @internal
  */
  constructor(e, n) {
    if (this.content = e, this.size = n || 0, n == null)
      for (let r = 0; r < e.length; r++)
        this.size += e[r].nodeSize;
  }
  /**
  Invoke a callback for all descendant nodes between the given two
  positions (relative to start of this fragment). Doesn't descend
  into a node when the callback returns `false`.
  */
  nodesBetween(e, n, r, i = 0, o) {
    for (let s = 0, u = 0; u < n; s++) {
      let l = this.content[s], a = u + l.nodeSize;
      if (a > e && r(l, i + u, o || null, s) !== !1 && l.content.size) {
        let c = u + 1;
        l.nodesBetween(Math.max(0, e - c), Math.min(l.content.size, n - c), r, i + c);
      }
      u = a;
    }
  }
  /**
  Call the given callback for every descendant node. `pos` will be
  relative to the start of the fragment. The callback may return
  `false` to prevent traversal of a given node's children.
  */
  descendants(e) {
    this.nodesBetween(0, this.size, e);
  }
  /**
  Extract the text between `from` and `to`. See the same method on
  [`Node`](https://prosemirror.net/docs/ref/#model.Node.textBetween).
  */
  textBetween(e, n, r, i) {
    let o = "", s = !0;
    return this.nodesBetween(e, n, (u, l) => {
      let a = u.isText ? u.text.slice(Math.max(e, l) - l, n - l) : u.isLeaf ? i ? typeof i == "function" ? i(u) : i : u.type.spec.leafText ? u.type.spec.leafText(u) : "" : "";
      u.isBlock && (u.isLeaf && a || u.isTextblock) && r && (s ? s = !1 : o += r), o += a;
    }, 0), o;
  }
  /**
  Create a new fragment containing the combined content of this
  fragment and the other.
  */
  append(e) {
    if (!e.size)
      return this;
    if (!this.size)
      return e;
    let n = this.lastChild, r = e.firstChild, i = this.content.slice(), o = 0;
    for (n.isText && n.sameMarkup(r) && (i[i.length - 1] = n.withText(n.text + r.text), o = 1); o < e.content.length; o++)
      i.push(e.content[o]);
    return new w(i, this.size + e.size);
  }
  /**
  Cut out the sub-fragment between the two given positions.
  */
  cut(e, n = this.size) {
    if (e == 0 && n == this.size)
      return this;
    let r = [], i = 0;
    if (n > e)
      for (let o = 0, s = 0; s < n; o++) {
        let u = this.content[o], l = s + u.nodeSize;
        l > e && ((s < e || l > n) && (u.isText ? u = u.cut(Math.max(0, e - s), Math.min(u.text.length, n - s)) : u = u.cut(Math.max(0, e - s - 1), Math.min(u.content.size, n - s - 1))), r.push(u), i += u.nodeSize), s = l;
      }
    return new w(r, i);
  }
  /**
  @internal
  */
  cutByIndex(e, n) {
    return e == n ? w.empty : e == 0 && n == this.content.length ? this : new w(this.content.slice(e, n));
  }
  /**
  Create a new fragment in which the node at the given index is
  replaced by the given node.
  */
  replaceChild(e, n) {
    let r = this.content[e];
    if (r == n)
      return this;
    let i = this.content.slice(), o = this.size + n.nodeSize - r.nodeSize;
    return i[e] = n, new w(i, o);
  }
  /**
  Create a new fragment by prepending the given node to this
  fragment.
  */
  addToStart(e) {
    return new w([e].concat(this.content), this.size + e.nodeSize);
  }
  /**
  Create a new fragment by appending the given node to this
  fragment.
  */
  addToEnd(e) {
    return new w(this.content.concat(e), this.size + e.nodeSize);
  }
  /**
  Compare this fragment to another one.
  */
  eq(e) {
    if (this.content.length != e.content.length)
      return !1;
    for (let n = 0; n < this.content.length; n++)
      if (!this.content[n].eq(e.content[n]))
        return !1;
    return !0;
  }
  /**
  The first child of the fragment, or `null` if it is empty.
  */
  get firstChild() {
    return this.content.length ? this.content[0] : null;
  }
  /**
  The last child of the fragment, or `null` if it is empty.
  */
  get lastChild() {
    return this.content.length ? this.content[this.content.length - 1] : null;
  }
  /**
  The number of child nodes in this fragment.
  */
  get childCount() {
    return this.content.length;
  }
  /**
  Get the child node at the given index. Raise an error when the
  index is out of range.
  */
  child(e) {
    let n = this.content[e];
    if (!n)
      throw new RangeError("Index " + e + " out of range for " + this);
    return n;
  }
  /**
  Get the child node at the given index, if it exists.
  */
  maybeChild(e) {
    return this.content[e] || null;
  }
  /**
  Call `f` for every child node, passing the node, its offset
  into this parent node, and its index.
  */
  forEach(e) {
    for (let n = 0, r = 0; n < this.content.length; n++) {
      let i = this.content[n];
      e(i, r, n), r += i.nodeSize;
    }
  }
  /**
  Find the first position at which this fragment and another
  fragment differ, or `null` if they are the same.
  */
  findDiffStart(e, n = 0) {
    return fc(this, e, n);
  }
  /**
  Find the first position, searching from the end, at which this
  fragment and the given fragment differ, or `null` if they are
  the same. Since this position will not be the same in both
  nodes, an object with two separate positions is returned.
  */
  findDiffEnd(e, n = this.size, r = e.size) {
    return hc(this, e, n, r);
  }
  /**
  Find the index and inner offset corresponding to a given relative
  position in this fragment. The result object will be reused
  (overwritten) the next time the function is called. @internal
  */
  findIndex(e) {
    if (e == 0)
      return yr(0, e);
    if (e == this.size)
      return yr(this.content.length, e);
    if (e > this.size || e < 0)
      throw new RangeError(`Position ${e} outside of fragment (${this})`);
    for (let n = 0, r = 0; ; n++) {
      let i = this.child(n), o = r + i.nodeSize;
      if (o >= e)
        return o == e ? yr(n + 1, o) : yr(n, r);
      r = o;
    }
  }
  /**
  Return a debugging string that describes this fragment.
  */
  toString() {
    return "<" + this.toStringInner() + ">";
  }
  /**
  @internal
  */
  toStringInner() {
    return this.content.join(", ");
  }
  /**
  Create a JSON-serializeable representation of this fragment.
  */
  toJSON() {
    return this.content.length ? this.content.map((e) => e.toJSON()) : null;
  }
  /**
  Deserialize a fragment from its JSON representation.
  */
  static fromJSON(e, n) {
    if (!n)
      return w.empty;
    if (!Array.isArray(n))
      throw new RangeError("Invalid input for Fragment.fromJSON");
    return new w(n.map(e.nodeFromJSON));
  }
  /**
  Build a fragment from an array of nodes. Ensures that adjacent
  text nodes with the same marks are joined together.
  */
  static fromArray(e) {
    if (!e.length)
      return w.empty;
    let n, r = 0;
    for (let i = 0; i < e.length; i++) {
      let o = e[i];
      r += o.nodeSize, i && o.isText && e[i - 1].sameMarkup(o) ? (n || (n = e.slice(0, i)), n[n.length - 1] = o.withText(n[n.length - 1].text + o.text)) : n && n.push(o);
    }
    return new w(n || e, r);
  }
  /**
  Create a fragment from something that can be interpreted as a
  set of nodes. For `null`, it returns the empty fragment. For a
  fragment, the fragment itself. For a node or array of nodes, a
  fragment containing those nodes.
  */
  static from(e) {
    if (!e)
      return w.empty;
    if (e instanceof w)
      return e;
    if (Array.isArray(e))
      return this.fromArray(e);
    if (e.attrs)
      return new w([e], e.nodeSize);
    throw new RangeError("Can not convert " + e + " to a Fragment" + (e.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
  }
}
w.empty = new w([], 0);
const ao = { index: 0, offset: 0 };
function yr(t, e) {
  return ao.index = t, ao.offset = e, ao;
}
function Ur(t, e) {
  if (t === e)
    return !0;
  if (!(t && typeof t == "object") || !(e && typeof e == "object"))
    return !1;
  let n = Array.isArray(t);
  if (Array.isArray(e) != n)
    return !1;
  if (n) {
    if (t.length != e.length)
      return !1;
    for (let r = 0; r < t.length; r++)
      if (!Ur(t[r], e[r]))
        return !1;
  } else {
    for (let r in t)
      if (!(r in e) || !Ur(t[r], e[r]))
        return !1;
    for (let r in e)
      if (!(r in t))
        return !1;
  }
  return !0;
}
let P = class Xo {
  /**
  @internal
  */
  constructor(e, n) {
    this.type = e, this.attrs = n;
  }
  /**
  Given a set of marks, create a new set which contains this one as
  well, in the right position. If this mark is already in the set,
  the set itself is returned. If any marks that are set to be
  [exclusive](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) with this mark are present,
  those are replaced by this one.
  */
  addToSet(e) {
    let n, r = !1;
    for (let i = 0; i < e.length; i++) {
      let o = e[i];
      if (this.eq(o))
        return e;
      if (this.type.excludes(o.type))
        n || (n = e.slice(0, i));
      else {
        if (o.type.excludes(this.type))
          return e;
        !r && o.type.rank > this.type.rank && (n || (n = e.slice(0, i)), n.push(this), r = !0), n && n.push(o);
      }
    }
    return n || (n = e.slice()), r || n.push(this), n;
  }
  /**
  Remove this mark from the given set, returning a new set. If this
  mark is not in the set, the set itself is returned.
  */
  removeFromSet(e) {
    for (let n = 0; n < e.length; n++)
      if (this.eq(e[n]))
        return e.slice(0, n).concat(e.slice(n + 1));
    return e;
  }
  /**
  Test whether this mark is in the given set of marks.
  */
  isInSet(e) {
    for (let n = 0; n < e.length; n++)
      if (this.eq(e[n]))
        return !0;
    return !1;
  }
  /**
  Test whether this mark has the same type and attributes as
  another mark.
  */
  eq(e) {
    return this == e || this.type == e.type && Ur(this.attrs, e.attrs);
  }
  /**
  Convert this mark to a JSON-serializeable representation.
  */
  toJSON() {
    let e = { type: this.type.name };
    for (let n in this.attrs) {
      e.attrs = this.attrs;
      break;
    }
    return e;
  }
  /**
  Deserialize a mark from JSON.
  */
  static fromJSON(e, n) {
    if (!n)
      throw new RangeError("Invalid input for Mark.fromJSON");
    let r = e.marks[n.type];
    if (!r)
      throw new RangeError(`There is no mark type ${n.type} in this schema`);
    let i = r.create(n.attrs);
    return r.checkAttrs(i.attrs), i;
  }
  /**
  Test whether two sets of marks are identical.
  */
  static sameSet(e, n) {
    if (e == n)
      return !0;
    if (e.length != n.length)
      return !1;
    for (let r = 0; r < e.length; r++)
      if (!e[r].eq(n[r]))
        return !1;
    return !0;
  }
  /**
  Create a properly sorted mark set from null, a single mark, or an
  unsorted array of marks.
  */
  static setFrom(e) {
    if (!e || Array.isArray(e) && e.length == 0)
      return Xo.none;
    if (e instanceof Xo)
      return [e];
    let n = e.slice();
    return n.sort((r, i) => r.type.rank - i.type.rank), n;
  }
};
P.none = [];
class Kr extends Error {
}
class v {
  /**
  Create a slice. When specifying a non-zero open depth, you must
  make sure that there are nodes of at least that depth at the
  appropriate side of the fragment—i.e. if the fragment is an
  empty paragraph node, `openStart` and `openEnd` can't be greater
  than 1.
  
  It is not necessary for the content of open nodes to conform to
  the schema's content constraints, though it should be a valid
  start/end/middle for such a node, depending on which sides are
  open.
  */
  constructor(e, n, r) {
    this.content = e, this.openStart = n, this.openEnd = r;
  }
  /**
  The size this slice would add when inserted into a document.
  */
  get size() {
    return this.content.size - this.openStart - this.openEnd;
  }
  /**
  @internal
  */
  insertAt(e, n) {
    let r = mc(this.content, e + this.openStart, n);
    return r && new v(r, this.openStart, this.openEnd);
  }
  /**
  @internal
  */
  removeBetween(e, n) {
    return new v(pc(this.content, e + this.openStart, n + this.openStart), this.openStart, this.openEnd);
  }
  /**
  Tests whether this slice is equal to another slice.
  */
  eq(e) {
    return this.content.eq(e.content) && this.openStart == e.openStart && this.openEnd == e.openEnd;
  }
  /**
  @internal
  */
  toString() {
    return this.content + "(" + this.openStart + "," + this.openEnd + ")";
  }
  /**
  Convert a slice to a JSON-serializable representation.
  */
  toJSON() {
    if (!this.content.size)
      return null;
    let e = { content: this.content.toJSON() };
    return this.openStart > 0 && (e.openStart = this.openStart), this.openEnd > 0 && (e.openEnd = this.openEnd), e;
  }
  /**
  Deserialize a slice from its JSON representation.
  */
  static fromJSON(e, n) {
    if (!n)
      return v.empty;
    let r = n.openStart || 0, i = n.openEnd || 0;
    if (typeof r != "number" || typeof i != "number")
      throw new RangeError("Invalid input for Slice.fromJSON");
    return new v(w.fromJSON(e, n.content), r, i);
  }
  /**
  Create a slice from a fragment by taking the maximum possible
  open value on both side of the fragment.
  */
  static maxOpen(e, n = !0) {
    let r = 0, i = 0;
    for (let o = e.firstChild; o && !o.isLeaf && (n || !o.type.spec.isolating); o = o.firstChild)
      r++;
    for (let o = e.lastChild; o && !o.isLeaf && (n || !o.type.spec.isolating); o = o.lastChild)
      i++;
    return new v(e, r, i);
  }
}
v.empty = new v(w.empty, 0, 0);
function pc(t, e, n) {
  let { index: r, offset: i } = t.findIndex(e), o = t.maybeChild(r), { index: s, offset: u } = t.findIndex(n);
  if (i == e || o.isText) {
    if (u != n && !t.child(s).isText)
      throw new RangeError("Removing non-flat range");
    return t.cut(0, e).append(t.cut(n));
  }
  if (r != s)
    throw new RangeError("Removing non-flat range");
  return t.replaceChild(r, o.copy(pc(o.content, e - i - 1, n - i - 1)));
}
function mc(t, e, n, r) {
  let { index: i, offset: o } = t.findIndex(e), s = t.maybeChild(i);
  if (o == e || s.isText)
    return r && !r.canReplace(i, i, n) ? null : t.cut(0, e).append(n).append(t.cut(e));
  let u = mc(s.content, e - o - 1, n, s);
  return u && t.replaceChild(i, s.copy(u));
}
function tp(t, e, n) {
  if (n.openStart > t.depth)
    throw new Kr("Inserted content deeper than insertion position");
  if (t.depth - n.openStart != e.depth - n.openEnd)
    throw new Kr("Inconsistent open depths");
  return gc(t, e, n, 0);
}
function gc(t, e, n, r) {
  let i = t.index(r), o = t.node(r);
  if (i == e.index(r) && r < t.depth - n.openStart) {
    let s = gc(t, e, n, r + 1);
    return o.copy(o.content.replaceChild(i, s));
  } else if (n.content.size)
    if (!n.openStart && !n.openEnd && t.depth == r && e.depth == r) {
      let s = t.parent, u = s.content;
      return Ht(s, u.cut(0, t.parentOffset).append(n.content).append(u.cut(e.parentOffset)));
    } else {
      let { start: s, end: u } = np(n, t);
      return Ht(o, yc(t, s, u, e, r));
    }
  else return Ht(o, Jr(t, e, r));
}
function bc(t, e) {
  if (!e.type.compatibleContent(t.type))
    throw new Kr("Cannot join " + e.type.name + " onto " + t.type.name);
}
function Yo(t, e, n) {
  let r = t.node(n);
  return bc(r, e.node(n)), r;
}
function $t(t, e) {
  let n = e.length - 1;
  n >= 0 && t.isText && t.sameMarkup(e[n]) ? e[n] = t.withText(e[n].text + t.text) : e.push(t);
}
function Fn(t, e, n, r) {
  let i = (e || t).node(n), o = 0, s = e ? e.index(n) : i.childCount;
  t && (o = t.index(n), t.depth > n ? o++ : t.textOffset && ($t(t.nodeAfter, r), o++));
  for (let u = o; u < s; u++)
    $t(i.child(u), r);
  e && e.depth == n && e.textOffset && $t(e.nodeBefore, r);
}
function Ht(t, e) {
  return t.type.checkContent(e), t.copy(e);
}
function yc(t, e, n, r, i) {
  let o = t.depth > i && Yo(t, e, i + 1), s = r.depth > i && Yo(n, r, i + 1), u = [];
  return Fn(null, t, i, u), o && s && e.index(i) == n.index(i) ? (bc(o, s), $t(Ht(o, yc(t, e, n, r, i + 1)), u)) : (o && $t(Ht(o, Jr(t, e, i + 1)), u), Fn(e, n, i, u), s && $t(Ht(s, Jr(n, r, i + 1)), u)), Fn(r, null, i, u), new w(u);
}
function Jr(t, e, n) {
  let r = [];
  if (Fn(null, t, n, r), t.depth > n) {
    let i = Yo(t, e, n + 1);
    $t(Ht(i, Jr(t, e, n + 1)), r);
  }
  return Fn(e, null, n, r), new w(r);
}
function np(t, e) {
  let n = e.depth - t.openStart, i = e.node(n).copy(t.content);
  for (let o = n - 1; o >= 0; o--)
    i = e.node(o).copy(w.from(i));
  return {
    start: i.resolveNoCache(t.openStart + n),
    end: i.resolveNoCache(i.content.size - t.openEnd - n)
  };
}
class Kn {
  /**
  @internal
  */
  constructor(e, n, r) {
    this.pos = e, this.path = n, this.parentOffset = r, this.depth = n.length / 3 - 1;
  }
  /**
  @internal
  */
  resolveDepth(e) {
    return e == null ? this.depth : e < 0 ? this.depth + e : e;
  }
  /**
  The parent node that the position points into. Note that even if
  a position points into a text node, that node is not considered
  the parent—text nodes are ‘flat’ in this model, and have no content.
  */
  get parent() {
    return this.node(this.depth);
  }
  /**
  The root node in which the position was resolved.
  */
  get doc() {
    return this.node(0);
  }
  /**
  The ancestor node at the given level. `p.node(p.depth)` is the
  same as `p.parent`.
  */
  node(e) {
    return this.path[this.resolveDepth(e) * 3];
  }
  /**
  The index into the ancestor at the given level. If this points
  at the 3rd node in the 2nd paragraph on the top level, for
  example, `p.index(0)` is 1 and `p.index(1)` is 2.
  */
  index(e) {
    return this.path[this.resolveDepth(e) * 3 + 1];
  }
  /**
  The index pointing after this position into the ancestor at the
  given level.
  */
  indexAfter(e) {
    return e = this.resolveDepth(e), this.index(e) + (e == this.depth && !this.textOffset ? 0 : 1);
  }
  /**
  The (absolute) position at the start of the node at the given
  level.
  */
  start(e) {
    return e = this.resolveDepth(e), e == 0 ? 0 : this.path[e * 3 - 1] + 1;
  }
  /**
  The (absolute) position at the end of the node at the given
  level.
  */
  end(e) {
    return e = this.resolveDepth(e), this.start(e) + this.node(e).content.size;
  }
  /**
  The (absolute) position directly before the wrapping node at the
  given level, or, when `depth` is `this.depth + 1`, the original
  position.
  */
  before(e) {
    if (e = this.resolveDepth(e), !e)
      throw new RangeError("There is no position before the top-level node");
    return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1];
  }
  /**
  The (absolute) position directly after the wrapping node at the
  given level, or the original position when `depth` is `this.depth + 1`.
  */
  after(e) {
    if (e = this.resolveDepth(e), !e)
      throw new RangeError("There is no position after the top-level node");
    return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1] + this.path[e * 3].nodeSize;
  }
  /**
  When this position points into a text node, this returns the
  distance between the position and the start of the text node.
  Will be zero for positions that point between nodes.
  */
  get textOffset() {
    return this.pos - this.path[this.path.length - 1];
  }
  /**
  Get the node directly after the position, if any. If the position
  points into a text node, only the part of that node after the
  position is returned.
  */
  get nodeAfter() {
    let e = this.parent, n = this.index(this.depth);
    if (n == e.childCount)
      return null;
    let r = this.pos - this.path[this.path.length - 1], i = e.child(n);
    return r ? e.child(n).cut(r) : i;
  }
  /**
  Get the node directly before the position, if any. If the
  position points into a text node, only the part of that node
  before the position is returned.
  */
  get nodeBefore() {
    let e = this.index(this.depth), n = this.pos - this.path[this.path.length - 1];
    return n ? this.parent.child(e).cut(0, n) : e == 0 ? null : this.parent.child(e - 1);
  }
  /**
  Get the position at the given index in the parent node at the
  given depth (which defaults to `this.depth`).
  */
  posAtIndex(e, n) {
    n = this.resolveDepth(n);
    let r = this.path[n * 3], i = n == 0 ? 0 : this.path[n * 3 - 1] + 1;
    for (let o = 0; o < e; o++)
      i += r.child(o).nodeSize;
    return i;
  }
  /**
  Get the marks at this position, factoring in the surrounding
  marks' [`inclusive`](https://prosemirror.net/docs/ref/#model.MarkSpec.inclusive) property. If the
  position is at the start of a non-empty node, the marks of the
  node after it (if any) are returned.
  */
  marks() {
    let e = this.parent, n = this.index();
    if (e.content.size == 0)
      return P.none;
    if (this.textOffset)
      return e.child(n).marks;
    let r = e.maybeChild(n - 1), i = e.maybeChild(n);
    if (!r) {
      let u = r;
      r = i, i = u;
    }
    let o = r.marks;
    for (var s = 0; s < o.length; s++)
      o[s].type.spec.inclusive === !1 && (!i || !o[s].isInSet(i.marks)) && (o = o[s--].removeFromSet(o));
    return o;
  }
  /**
  Get the marks after the current position, if any, except those
  that are non-inclusive and not present at position `$end`. This
  is mostly useful for getting the set of marks to preserve after a
  deletion. Will return `null` if this position is at the end of
  its parent node or its parent node isn't a textblock (in which
  case no marks should be preserved).
  */
  marksAcross(e) {
    let n = this.parent.maybeChild(this.index());
    if (!n || !n.isInline)
      return null;
    let r = n.marks, i = e.parent.maybeChild(e.index());
    for (var o = 0; o < r.length; o++)
      r[o].type.spec.inclusive === !1 && (!i || !r[o].isInSet(i.marks)) && (r = r[o--].removeFromSet(r));
    return r;
  }
  /**
  The depth up to which this position and the given (non-resolved)
  position share the same parent nodes.
  */
  sharedDepth(e) {
    for (let n = this.depth; n > 0; n--)
      if (this.start(n) <= e && this.end(n) >= e)
        return n;
    return 0;
  }
  /**
  Returns a range based on the place where this position and the
  given position diverge around block content. If both point into
  the same textblock, for example, a range around that textblock
  will be returned. If they point into different blocks, the range
  around those blocks in their shared ancestor is returned. You can
  pass in an optional predicate that will be called with a parent
  node to see if a range into that parent is acceptable.
  */
  blockRange(e = this, n) {
    if (e.pos < this.pos)
      return e.blockRange(this);
    for (let r = this.depth - (this.parent.inlineContent || this.pos == e.pos ? 1 : 0); r >= 0; r--)
      if (e.pos <= this.end(r) && (!n || n(this.node(r))))
        return new Gr(this, e, r);
    return null;
  }
  /**
  Query whether the given position shares the same parent node.
  */
  sameParent(e) {
    return this.pos - this.parentOffset == e.pos - e.parentOffset;
  }
  /**
  Return the greater of this and the given position.
  */
  max(e) {
    return e.pos > this.pos ? e : this;
  }
  /**
  Return the smaller of this and the given position.
  */
  min(e) {
    return e.pos < this.pos ? e : this;
  }
  /**
  @internal
  */
  toString() {
    let e = "";
    for (let n = 1; n <= this.depth; n++)
      e += (e ? "/" : "") + this.node(n).type.name + "_" + this.index(n - 1);
    return e + ":" + this.parentOffset;
  }
  /**
  @internal
  */
  static resolve(e, n) {
    if (!(n >= 0 && n <= e.content.size))
      throw new RangeError("Position " + n + " out of range");
    let r = [], i = 0, o = n;
    for (let s = e; ; ) {
      let { index: u, offset: l } = s.content.findIndex(o), a = o - l;
      if (r.push(s, u, i + l), !a || (s = s.child(u), s.isText))
        break;
      o = a - 1, i += l + 1;
    }
    return new Kn(n, r, o);
  }
  /**
  @internal
  */
  static resolveCached(e, n) {
    let r = Vu.get(e);
    if (r)
      for (let o = 0; o < r.elts.length; o++) {
        let s = r.elts[o];
        if (s.pos == n)
          return s;
      }
    else
      Vu.set(e, r = new rp());
    let i = r.elts[r.i] = Kn.resolve(e, n);
    return r.i = (r.i + 1) % ip, i;
  }
}
class rp {
  constructor() {
    this.elts = [], this.i = 0;
  }
}
const ip = 12, Vu = /* @__PURE__ */ new WeakMap();
class Gr {
  /**
  Construct a node range. `$from` and `$to` should point into the
  same node until at least the given `depth`, since a node range
  denotes an adjacent set of nodes in a single parent node.
  */
  constructor(e, n, r) {
    this.$from = e, this.$to = n, this.depth = r;
  }
  /**
  The position at the start of the range.
  */
  get start() {
    return this.$from.before(this.depth + 1);
  }
  /**
  The position at the end of the range.
  */
  get end() {
    return this.$to.after(this.depth + 1);
  }
  /**
  The parent node that the range points into.
  */
  get parent() {
    return this.$from.node(this.depth);
  }
  /**
  The start index of the range in the parent node.
  */
  get startIndex() {
    return this.$from.index(this.depth);
  }
  /**
  The end index of the range in the parent node.
  */
  get endIndex() {
    return this.$to.indexAfter(this.depth);
  }
}
const op = /* @__PURE__ */ Object.create(null);
let Et = class Qo {
  /**
  @internal
  */
  constructor(e, n, r, i = P.none) {
    this.type = e, this.attrs = n, this.marks = i, this.content = r || w.empty;
  }
  /**
  The array of this node's child nodes.
  */
  get children() {
    return this.content.content;
  }
  /**
  The size of this node, as defined by the integer-based [indexing
  scheme](https://prosemirror.net/docs/guide/#doc.indexing). For text nodes, this is the
  amount of characters. For other leaf nodes, it is one. For
  non-leaf nodes, it is the size of the content plus two (the
  start and end token).
  */
  get nodeSize() {
    return this.isLeaf ? 1 : 2 + this.content.size;
  }
  /**
  The number of children that the node has.
  */
  get childCount() {
    return this.content.childCount;
  }
  /**
  Get the child node at the given index. Raises an error when the
  index is out of range.
  */
  child(e) {
    return this.content.child(e);
  }
  /**
  Get the child node at the given index, if it exists.
  */
  maybeChild(e) {
    return this.content.maybeChild(e);
  }
  /**
  Call `f` for every child node, passing the node, its offset
  into this parent node, and its index.
  */
  forEach(e) {
    this.content.forEach(e);
  }
  /**
  Invoke a callback for all descendant nodes recursively between
  the given two positions that are relative to start of this
  node's content. The callback is invoked with the node, its
  position relative to the original node (method receiver),
  its parent node, and its child index. When the callback returns
  false for a given node, that node's children will not be
  recursed over. The last parameter can be used to specify a
  starting position to count from.
  */
  nodesBetween(e, n, r, i = 0) {
    this.content.nodesBetween(e, n, r, i, this);
  }
  /**
  Call the given callback for every descendant node. Doesn't
  descend into a node when the callback returns `false`.
  */
  descendants(e) {
    this.nodesBetween(0, this.content.size, e);
  }
  /**
  Concatenates all the text nodes found in this fragment and its
  children.
  */
  get textContent() {
    return this.isLeaf && this.type.spec.leafText ? this.type.spec.leafText(this) : this.textBetween(0, this.content.size, "");
  }
  /**
  Get all text between positions `from` and `to`. When
  `blockSeparator` is given, it will be inserted to separate text
  from different block nodes. If `leafText` is given, it'll be
  inserted for every non-text leaf node encountered, otherwise
  [`leafText`](https://prosemirror.net/docs/ref/#model.NodeSpec.leafText) will be used.
  */
  textBetween(e, n, r, i) {
    return this.content.textBetween(e, n, r, i);
  }
  /**
  Returns this node's first child, or `null` if there are no
  children.
  */
  get firstChild() {
    return this.content.firstChild;
  }
  /**
  Returns this node's last child, or `null` if there are no
  children.
  */
  get lastChild() {
    return this.content.lastChild;
  }
  /**
  Test whether two nodes represent the same piece of document.
  */
  eq(e) {
    return this == e || this.sameMarkup(e) && this.content.eq(e.content);
  }
  /**
  Compare the markup (type, attributes, and marks) of this node to
  those of another. Returns `true` if both have the same markup.
  */
  sameMarkup(e) {
    return this.hasMarkup(e.type, e.attrs, e.marks);
  }
  /**
  Check whether this node's markup correspond to the given type,
  attributes, and marks.
  */
  hasMarkup(e, n, r) {
    return this.type == e && Ur(this.attrs, n || e.defaultAttrs || op) && P.sameSet(this.marks, r || P.none);
  }
  /**
  Create a new node with the same markup as this node, containing
  the given content (or empty, if no content is given).
  */
  copy(e = null) {
    return e == this.content ? this : new Qo(this.type, this.attrs, e, this.marks);
  }
  /**
  Create a copy of this node, with the given set of marks instead
  of the node's own marks.
  */
  mark(e) {
    return e == this.marks ? this : new Qo(this.type, this.attrs, this.content, e);
  }
  /**
  Create a copy of this node with only the content between the
  given positions. If `to` is not given, it defaults to the end of
  the node.
  */
  cut(e, n = this.content.size) {
    return e == 0 && n == this.content.size ? this : this.copy(this.content.cut(e, n));
  }
  /**
  Cut out the part of the document between the given positions, and
  return it as a `Slice` object.
  */
  slice(e, n = this.content.size, r = !1) {
    if (e == n)
      return v.empty;
    let i = this.resolve(e), o = this.resolve(n), s = r ? 0 : i.sharedDepth(n), u = i.start(s), a = i.node(s).content.cut(i.pos - u, o.pos - u);
    return new v(a, i.depth - s, o.depth - s);
  }
  /**
  Replace the part of the document between the given positions with
  the given slice. The slice must 'fit', meaning its open sides
  must be able to connect to the surrounding content, and its
  content nodes must be valid children for the node they are placed
  into. If any of this is violated, an error of type
  [`ReplaceError`](https://prosemirror.net/docs/ref/#model.ReplaceError) is thrown.
  */
  replace(e, n, r) {
    return tp(this.resolve(e), this.resolve(n), r);
  }
  /**
  Find the node directly after the given position.
  */
  nodeAt(e) {
    for (let n = this; ; ) {
      let { index: r, offset: i } = n.content.findIndex(e);
      if (n = n.maybeChild(r), !n)
        return null;
      if (i == e || n.isText)
        return n;
      e -= i + 1;
    }
  }
  /**
  Find the (direct) child node after the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childAfter(e) {
    let { index: n, offset: r } = this.content.findIndex(e);
    return { node: this.content.maybeChild(n), index: n, offset: r };
  }
  /**
  Find the (direct) child node before the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childBefore(e) {
    if (e == 0)
      return { node: null, index: 0, offset: 0 };
    let { index: n, offset: r } = this.content.findIndex(e);
    if (r < e)
      return { node: this.content.child(n), index: n, offset: r };
    let i = this.content.child(n - 1);
    return { node: i, index: n - 1, offset: r - i.nodeSize };
  }
  /**
  Resolve the given position in the document, returning an
  [object](https://prosemirror.net/docs/ref/#model.ResolvedPos) with information about its context.
  */
  resolve(e) {
    return Kn.resolveCached(this, e);
  }
  /**
  @internal
  */
  resolveNoCache(e) {
    return Kn.resolve(this, e);
  }
  /**
  Test whether a given mark or mark type occurs in this document
  between the two given positions.
  */
  rangeHasMark(e, n, r) {
    let i = !1;
    return n > e && this.nodesBetween(e, n, (o) => (r.isInSet(o.marks) && (i = !0), !i)), i;
  }
  /**
  True when this is a block (non-inline node)
  */
  get isBlock() {
    return this.type.isBlock;
  }
  /**
  True when this is a textblock node, a block node with inline
  content.
  */
  get isTextblock() {
    return this.type.isTextblock;
  }
  /**
  True when this node allows inline content.
  */
  get inlineContent() {
    return this.type.inlineContent;
  }
  /**
  True when this is an inline node (a text node or a node that can
  appear among text).
  */
  get isInline() {
    return this.type.isInline;
  }
  /**
  True when this is a text node.
  */
  get isText() {
    return this.type.isText;
  }
  /**
  True when this is a leaf node.
  */
  get isLeaf() {
    return this.type.isLeaf;
  }
  /**
  True when this is an atom, i.e. when it does not have directly
  editable content. This is usually the same as `isLeaf`, but can
  be configured with the [`atom` property](https://prosemirror.net/docs/ref/#model.NodeSpec.atom)
  on a node's spec (typically used when the node is displayed as
  an uneditable [node view](https://prosemirror.net/docs/ref/#view.NodeView)).
  */
  get isAtom() {
    return this.type.isAtom;
  }
  /**
  Return a string representation of this node for debugging
  purposes.
  */
  toString() {
    if (this.type.spec.toDebugString)
      return this.type.spec.toDebugString(this);
    let e = this.type.name;
    return this.content.size && (e += "(" + this.content.toStringInner() + ")"), kc(this.marks, e);
  }
  /**
  Get the content match in this node at the given index.
  */
  contentMatchAt(e) {
    let n = this.type.contentMatch.matchFragment(this.content, 0, e);
    if (!n)
      throw new Error("Called contentMatchAt on a node with invalid content");
    return n;
  }
  /**
  Test whether replacing the range between `from` and `to` (by
  child index) with the given replacement fragment (which defaults
  to the empty fragment) would leave the node's content valid. You
  can optionally pass `start` and `end` indices into the
  replacement fragment.
  */
  canReplace(e, n, r = w.empty, i = 0, o = r.childCount) {
    let s = this.contentMatchAt(e).matchFragment(r, i, o), u = s && s.matchFragment(this.content, n);
    if (!u || !u.validEnd)
      return !1;
    for (let l = i; l < o; l++)
      if (!this.type.allowsMarks(r.child(l).marks))
        return !1;
    return !0;
  }
  /**
  Test whether replacing the range `from` to `to` (by index) with
  a node of the given type would leave the node's content valid.
  */
  canReplaceWith(e, n, r, i) {
    if (i && !this.type.allowsMarks(i))
      return !1;
    let o = this.contentMatchAt(e).matchType(r), s = o && o.matchFragment(this.content, n);
    return s ? s.validEnd : !1;
  }
  /**
  Test whether the given node's content could be appended to this
  node. If that node is empty, this will only return true if there
  is at least one node type that can appear in both nodes (to avoid
  merging completely incompatible nodes).
  */
  canAppend(e) {
    return e.content.size ? this.canReplace(this.childCount, this.childCount, e.content) : this.type.compatibleContent(e.type);
  }
  /**
  Check whether this node and its descendants conform to the
  schema, and raise an exception when they do not.
  */
  check() {
    this.type.checkContent(this.content), this.type.checkAttrs(this.attrs);
    let e = P.none;
    for (let n = 0; n < this.marks.length; n++) {
      let r = this.marks[n];
      r.type.checkAttrs(r.attrs), e = r.addToSet(e);
    }
    if (!P.sameSet(e, this.marks))
      throw new RangeError(`Invalid collection of marks for node ${this.type.name}: ${this.marks.map((n) => n.type.name)}`);
    this.content.forEach((n) => n.check());
  }
  /**
  Return a JSON-serializeable representation of this node.
  */
  toJSON() {
    let e = { type: this.type.name };
    for (let n in this.attrs) {
      e.attrs = this.attrs;
      break;
    }
    return this.content.size && (e.content = this.content.toJSON()), this.marks.length && (e.marks = this.marks.map((n) => n.toJSON())), e;
  }
  /**
  Deserialize a node from its JSON representation.
  */
  static fromJSON(e, n) {
    if (!n)
      throw new RangeError("Invalid input for Node.fromJSON");
    let r;
    if (n.marks) {
      if (!Array.isArray(n.marks))
        throw new RangeError("Invalid mark data for Node.fromJSON");
      r = n.marks.map(e.markFromJSON);
    }
    if (n.type == "text") {
      if (typeof n.text != "string")
        throw new RangeError("Invalid text node in JSON");
      return e.text(n.text, r);
    }
    let i = w.fromJSON(e, n.content), o = e.nodeType(n.type).create(n.attrs, i, r);
    return o.type.checkAttrs(o.attrs), o;
  }
};
Et.prototype.text = void 0;
class Zr extends Et {
  /**
  @internal
  */
  constructor(e, n, r, i) {
    if (super(e, n, null, i), !r)
      throw new RangeError("Empty text nodes are not allowed");
    this.text = r;
  }
  toString() {
    return this.type.spec.toDebugString ? this.type.spec.toDebugString(this) : kc(this.marks, JSON.stringify(this.text));
  }
  get textContent() {
    return this.text;
  }
  textBetween(e, n) {
    return this.text.slice(e, n);
  }
  get nodeSize() {
    return this.text.length;
  }
  mark(e) {
    return e == this.marks ? this : new Zr(this.type, this.attrs, this.text, e);
  }
  withText(e) {
    return e == this.text ? this : new Zr(this.type, this.attrs, e, this.marks);
  }
  cut(e = 0, n = this.text.length) {
    return e == 0 && n == this.text.length ? this : this.withText(this.text.slice(e, n));
  }
  eq(e) {
    return this.sameMarkup(e) && this.text == e.text;
  }
  toJSON() {
    let e = super.toJSON();
    return e.text = this.text, e;
  }
}
function kc(t, e) {
  for (let n = t.length - 1; n >= 0; n--)
    e = t[n].type.name + "(" + e + ")";
  return e;
}
class Wt {
  /**
  @internal
  */
  constructor(e) {
    this.validEnd = e, this.next = [], this.wrapCache = [];
  }
  /**
  @internal
  */
  static parse(e, n) {
    let r = new sp(e, n);
    if (r.next == null)
      return Wt.empty;
    let i = xc(r);
    r.next && r.err("Unexpected trailing text");
    let o = hp(fp(i));
    return pp(o, r), o;
  }
  /**
  Match a node type, returning a match after that node if
  successful.
  */
  matchType(e) {
    for (let n = 0; n < this.next.length; n++)
      if (this.next[n].type == e)
        return this.next[n].next;
    return null;
  }
  /**
  Try to match a fragment. Returns the resulting match when
  successful.
  */
  matchFragment(e, n = 0, r = e.childCount) {
    let i = this;
    for (let o = n; i && o < r; o++)
      i = i.matchType(e.child(o).type);
    return i;
  }
  /**
  @internal
  */
  get inlineContent() {
    return this.next.length != 0 && this.next[0].type.isInline;
  }
  /**
  Get the first matching node type at this match position that can
  be generated.
  */
  get defaultType() {
    for (let e = 0; e < this.next.length; e++) {
      let { type: n } = this.next[e];
      if (!(n.isText || n.hasRequiredAttrs()))
        return n;
    }
    return null;
  }
  /**
  @internal
  */
  compatible(e) {
    for (let n = 0; n < this.next.length; n++)
      for (let r = 0; r < e.next.length; r++)
        if (this.next[n].type == e.next[r].type)
          return !0;
    return !1;
  }
  /**
  Try to match the given fragment, and if that fails, see if it can
  be made to match by inserting nodes in front of it. When
  successful, return a fragment of inserted nodes (which may be
  empty if nothing had to be inserted). When `toEnd` is true, only
  return a fragment if the resulting match goes to the end of the
  content expression.
  */
  fillBefore(e, n = !1, r = 0) {
    let i = [this];
    function o(s, u) {
      let l = s.matchFragment(e, r);
      if (l && (!n || l.validEnd))
        return w.from(u.map((a) => a.createAndFill()));
      for (let a = 0; a < s.next.length; a++) {
        let { type: c, next: d } = s.next[a];
        if (!(c.isText || c.hasRequiredAttrs()) && i.indexOf(d) == -1) {
          i.push(d);
          let f = o(d, u.concat(c));
          if (f)
            return f;
        }
      }
      return null;
    }
    return o(this, []);
  }
  /**
  Find a set of wrapping node types that would allow a node of the
  given type to appear at this position. The result may be empty
  (when it fits directly) and will be null when no such wrapping
  exists.
  */
  findWrapping(e) {
    for (let r = 0; r < this.wrapCache.length; r += 2)
      if (this.wrapCache[r] == e)
        return this.wrapCache[r + 1];
    let n = this.computeWrapping(e);
    return this.wrapCache.push(e, n), n;
  }
  /**
  @internal
  */
  computeWrapping(e) {
    let n = /* @__PURE__ */ Object.create(null), r = [{ match: this, type: null, via: null }];
    for (; r.length; ) {
      let i = r.shift(), o = i.match;
      if (o.matchType(e)) {
        let s = [];
        for (let u = i; u.type; u = u.via)
          s.push(u.type);
        return s.reverse();
      }
      for (let s = 0; s < o.next.length; s++) {
        let { type: u, next: l } = o.next[s];
        !u.isLeaf && !u.hasRequiredAttrs() && !(u.name in n) && (!i.type || l.validEnd) && (r.push({ match: u.contentMatch, type: u, via: i }), n[u.name] = !0);
      }
    }
    return null;
  }
  /**
  The number of outgoing edges this node has in the finite
  automaton that describes the content expression.
  */
  get edgeCount() {
    return this.next.length;
  }
  /**
  Get the _n_​th outgoing edge from this node in the finite
  automaton that describes the content expression.
  */
  edge(e) {
    if (e >= this.next.length)
      throw new RangeError(`There's no ${e}th edge in this content match`);
    return this.next[e];
  }
  /**
  @internal
  */
  toString() {
    let e = [];
    function n(r) {
      e.push(r);
      for (let i = 0; i < r.next.length; i++)
        e.indexOf(r.next[i].next) == -1 && n(r.next[i].next);
    }
    return n(this), e.map((r, i) => {
      let o = i + (r.validEnd ? "*" : " ") + " ";
      for (let s = 0; s < r.next.length; s++)
        o += (s ? ", " : "") + r.next[s].type.name + "->" + e.indexOf(r.next[s].next);
      return o;
    }).join(`
`);
  }
}
Wt.empty = new Wt(!0);
class sp {
  constructor(e, n) {
    this.string = e, this.nodeTypes = n, this.inline = null, this.pos = 0, this.tokens = e.split(/\s*(?=\b|\W|$)/), this.tokens[this.tokens.length - 1] == "" && this.tokens.pop(), this.tokens[0] == "" && this.tokens.shift();
  }
  get next() {
    return this.tokens[this.pos];
  }
  eat(e) {
    return this.next == e && (this.pos++ || !0);
  }
  err(e) {
    throw new SyntaxError(e + " (in content expression '" + this.string + "')");
  }
}
function xc(t) {
  let e = [];
  do
    e.push(up(t));
  while (t.eat("|"));
  return e.length == 1 ? e[0] : { type: "choice", exprs: e };
}
function up(t) {
  let e = [];
  do
    e.push(lp(t));
  while (t.next && t.next != ")" && t.next != "|");
  return e.length == 1 ? e[0] : { type: "seq", exprs: e };
}
function lp(t) {
  let e = dp(t);
  for (; ; )
    if (t.eat("+"))
      e = { type: "plus", expr: e };
    else if (t.eat("*"))
      e = { type: "star", expr: e };
    else if (t.eat("?"))
      e = { type: "opt", expr: e };
    else if (t.eat("{"))
      e = ap(t, e);
    else
      break;
  return e;
}
function ju(t) {
  /\D/.test(t.next) && t.err("Expected number, got '" + t.next + "'");
  let e = Number(t.next);
  return t.pos++, e;
}
function ap(t, e) {
  let n = ju(t), r = n;
  return t.eat(",") && (t.next != "}" ? r = ju(t) : r = -1), t.eat("}") || t.err("Unclosed braced range"), { type: "range", min: n, max: r, expr: e };
}
function cp(t, e) {
  let n = t.nodeTypes, r = n[e];
  if (r)
    return [r];
  let i = [];
  for (let o in n) {
    let s = n[o];
    s.isInGroup(e) && i.push(s);
  }
  return i.length == 0 && t.err("No node type or group '" + e + "' found"), i;
}
function dp(t) {
  if (t.eat("(")) {
    let e = xc(t);
    return t.eat(")") || t.err("Missing closing paren"), e;
  } else if (/\W/.test(t.next))
    t.err("Unexpected token '" + t.next + "'");
  else {
    let e = cp(t, t.next).map((n) => (t.inline == null ? t.inline = n.isInline : t.inline != n.isInline && t.err("Mixing inline and block content"), { type: "name", value: n }));
    return t.pos++, e.length == 1 ? e[0] : { type: "choice", exprs: e };
  }
}
function fp(t) {
  let e = [[]];
  return i(o(t, 0), n()), e;
  function n() {
    return e.push([]) - 1;
  }
  function r(s, u, l) {
    let a = { term: l, to: u };
    return e[s].push(a), a;
  }
  function i(s, u) {
    s.forEach((l) => l.to = u);
  }
  function o(s, u) {
    if (s.type == "choice")
      return s.exprs.reduce((l, a) => l.concat(o(a, u)), []);
    if (s.type == "seq")
      for (let l = 0; ; l++) {
        let a = o(s.exprs[l], u);
        if (l == s.exprs.length - 1)
          return a;
        i(a, u = n());
      }
    else if (s.type == "star") {
      let l = n();
      return r(u, l), i(o(s.expr, l), l), [r(l)];
    } else if (s.type == "plus") {
      let l = n();
      return i(o(s.expr, u), l), i(o(s.expr, l), l), [r(l)];
    } else {
      if (s.type == "opt")
        return [r(u)].concat(o(s.expr, u));
      if (s.type == "range") {
        let l = u;
        for (let a = 0; a < s.min; a++) {
          let c = n();
          i(o(s.expr, l), c), l = c;
        }
        if (s.max == -1)
          i(o(s.expr, l), l);
        else
          for (let a = s.min; a < s.max; a++) {
            let c = n();
            r(l, c), i(o(s.expr, l), c), l = c;
          }
        return [r(l)];
      } else {
        if (s.type == "name")
          return [r(u, void 0, s.value)];
        throw new Error("Unknown expr type");
      }
    }
  }
}
function Cc(t, e) {
  return e - t;
}
function qu(t, e) {
  let n = [];
  return r(e), n.sort(Cc);
  function r(i) {
    let o = t[i];
    if (o.length == 1 && !o[0].term)
      return r(o[0].to);
    n.push(i);
    for (let s = 0; s < o.length; s++) {
      let { term: u, to: l } = o[s];
      !u && n.indexOf(l) == -1 && r(l);
    }
  }
}
function hp(t) {
  let e = /* @__PURE__ */ Object.create(null);
  return n(qu(t, 0));
  function n(r) {
    let i = [];
    r.forEach((s) => {
      t[s].forEach(({ term: u, to: l }) => {
        if (!u)
          return;
        let a;
        for (let c = 0; c < i.length; c++)
          i[c][0] == u && (a = i[c][1]);
        qu(t, l).forEach((c) => {
          a || i.push([u, a = []]), a.indexOf(c) == -1 && a.push(c);
        });
      });
    });
    let o = e[r.join(",")] = new Wt(r.indexOf(t.length - 1) > -1);
    for (let s = 0; s < i.length; s++) {
      let u = i[s][1].sort(Cc);
      o.next.push({ type: i[s][0], next: e[u.join(",")] || n(u) });
    }
    return o;
  }
}
function pp(t, e) {
  for (let n = 0, r = [t]; n < r.length; n++) {
    let i = r[n], o = !i.validEnd, s = [];
    for (let u = 0; u < i.next.length; u++) {
      let { type: l, next: a } = i.next[u];
      s.push(l.name), o && !(l.isText || l.hasRequiredAttrs()) && (o = !1), r.indexOf(a) == -1 && r.push(a);
    }
    o && e.err("Only non-generatable nodes (" + s.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
  }
}
function wc(t) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let n in t) {
    let r = t[n];
    if (!r.hasDefault)
      return null;
    e[n] = r.default;
  }
  return e;
}
function Ec(t, e) {
  let n = /* @__PURE__ */ Object.create(null);
  for (let r in t) {
    let i = e && e[r];
    if (i === void 0) {
      let o = t[r];
      if (o.hasDefault)
        i = o.default;
      else
        throw new RangeError("No value supplied for attribute " + r);
    }
    n[r] = i;
  }
  return n;
}
function Sc(t, e, n, r) {
  for (let i in e)
    if (!(i in t))
      throw new RangeError(`Unsupported attribute ${i} for ${n} of type ${i}`);
  for (let i in t) {
    let o = t[i];
    o.validate && o.validate(e[i]);
  }
}
function Ac(t, e) {
  let n = /* @__PURE__ */ Object.create(null);
  if (e)
    for (let r in e)
      n[r] = new gp(t, r, e[r]);
  return n;
}
let Wu = class vc {
  /**
  @internal
  */
  constructor(e, n, r) {
    this.name = e, this.schema = n, this.spec = r, this.markSet = null, this.groups = r.group ? r.group.split(" ") : [], this.attrs = Ac(e, r.attrs), this.defaultAttrs = wc(this.attrs), this.contentMatch = null, this.inlineContent = null, this.isBlock = !(r.inline || e == "text"), this.isText = e == "text";
  }
  /**
  True if this is an inline type.
  */
  get isInline() {
    return !this.isBlock;
  }
  /**
  True if this is a textblock type, a block that contains inline
  content.
  */
  get isTextblock() {
    return this.isBlock && this.inlineContent;
  }
  /**
  True for node types that allow no content.
  */
  get isLeaf() {
    return this.contentMatch == Wt.empty;
  }
  /**
  True when this node is an atom, i.e. when it does not have
  directly editable content.
  */
  get isAtom() {
    return this.isLeaf || !!this.spec.atom;
  }
  /**
  Return true when this node type is part of the given
  [group](https://prosemirror.net/docs/ref/#model.NodeSpec.group).
  */
  isInGroup(e) {
    return this.groups.indexOf(e) > -1;
  }
  /**
  The node type's [whitespace](https://prosemirror.net/docs/ref/#model.NodeSpec.whitespace) option.
  */
  get whitespace() {
    return this.spec.whitespace || (this.spec.code ? "pre" : "normal");
  }
  /**
  Tells you whether this node type has any required attributes.
  */
  hasRequiredAttrs() {
    for (let e in this.attrs)
      if (this.attrs[e].isRequired)
        return !0;
    return !1;
  }
  /**
  Indicates whether this node allows some of the same content as
  the given node type.
  */
  compatibleContent(e) {
    return this == e || this.contentMatch.compatible(e.contentMatch);
  }
  /**
  @internal
  */
  computeAttrs(e) {
    return !e && this.defaultAttrs ? this.defaultAttrs : Ec(this.attrs, e);
  }
  /**
  Create a `Node` of this type. The given attributes are
  checked and defaulted (you can pass `null` to use the type's
  defaults entirely, if no required attributes exist). `content`
  may be a `Fragment`, a node, an array of nodes, or
  `null`. Similarly `marks` may be `null` to default to the empty
  set of marks.
  */
  create(e = null, n, r) {
    if (this.isText)
      throw new Error("NodeType.create can't construct text nodes");
    return new Et(this, this.computeAttrs(e), w.from(n), P.setFrom(r));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but check the given content
  against the node type's content restrictions, and throw an error
  if it doesn't match.
  */
  createChecked(e = null, n, r) {
    return n = w.from(n), this.checkContent(n), new Et(this, this.computeAttrs(e), n, P.setFrom(r));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but see if it is
  necessary to add nodes to the start or end of the given fragment
  to make it fit the node. If no fitting wrapping can be found,
  return null. Note that, due to the fact that required nodes can
  always be created, this will always succeed if you pass null or
  `Fragment.empty` as content.
  */
  createAndFill(e = null, n, r) {
    if (e = this.computeAttrs(e), n = w.from(n), n.size) {
      let s = this.contentMatch.fillBefore(n);
      if (!s)
        return null;
      n = s.append(n);
    }
    let i = this.contentMatch.matchFragment(n), o = i && i.fillBefore(w.empty, !0);
    return o ? new Et(this, e, n.append(o), P.setFrom(r)) : null;
  }
  /**
  Returns true if the given fragment is valid content for this node
  type.
  */
  validContent(e) {
    let n = this.contentMatch.matchFragment(e);
    if (!n || !n.validEnd)
      return !1;
    for (let r = 0; r < e.childCount; r++)
      if (!this.allowsMarks(e.child(r).marks))
        return !1;
    return !0;
  }
  /**
  Throws a RangeError if the given fragment is not valid content for this
  node type.
  @internal
  */
  checkContent(e) {
    if (!this.validContent(e))
      throw new RangeError(`Invalid content for node ${this.name}: ${e.toString().slice(0, 50)}`);
  }
  /**
  @internal
  */
  checkAttrs(e) {
    Sc(this.attrs, e, "node", this.name);
  }
  /**
  Check whether the given mark type is allowed in this node.
  */
  allowsMarkType(e) {
    return this.markSet == null || this.markSet.indexOf(e) > -1;
  }
  /**
  Test whether the given set of marks are allowed in this node.
  */
  allowsMarks(e) {
    if (this.markSet == null)
      return !0;
    for (let n = 0; n < e.length; n++)
      if (!this.allowsMarkType(e[n].type))
        return !1;
    return !0;
  }
  /**
  Removes the marks that are not allowed in this node from the given set.
  */
  allowedMarks(e) {
    if (this.markSet == null)
      return e;
    let n;
    for (let r = 0; r < e.length; r++)
      this.allowsMarkType(e[r].type) ? n && n.push(e[r]) : n || (n = e.slice(0, r));
    return n ? n.length ? n : P.none : e;
  }
  /**
  @internal
  */
  static compile(e, n) {
    let r = /* @__PURE__ */ Object.create(null);
    e.forEach((o, s) => r[o] = new vc(o, n, s));
    let i = n.spec.topNode || "doc";
    if (!r[i])
      throw new RangeError("Schema is missing its top node type ('" + i + "')");
    if (!r.text)
      throw new RangeError("Every schema needs a 'text' type");
    for (let o in r.text.attrs)
      throw new RangeError("The text node type should not have attributes");
    return r;
  }
};
function mp(t, e, n) {
  let r = n.split("|");
  return (i) => {
    let o = i === null ? "null" : typeof i;
    if (r.indexOf(o) < 0)
      throw new RangeError(`Expected value of type ${r} for attribute ${e} on type ${t}, got ${o}`);
  };
}
class gp {
  constructor(e, n, r) {
    this.hasDefault = Object.prototype.hasOwnProperty.call(r, "default"), this.default = r.default, this.validate = typeof r.validate == "string" ? mp(e, n, r.validate) : r.validate;
  }
  get isRequired() {
    return !this.hasDefault;
  }
}
class $i {
  /**
  @internal
  */
  constructor(e, n, r, i) {
    this.name = e, this.rank = n, this.schema = r, this.spec = i, this.attrs = Ac(e, i.attrs), this.excluded = null;
    let o = wc(this.attrs);
    this.instance = o ? new P(this, o) : null;
  }
  /**
  Create a mark of this type. `attrs` may be `null` or an object
  containing only some of the mark's attributes. The others, if
  they have defaults, will be added.
  */
  create(e = null) {
    return !e && this.instance ? this.instance : new P(this, Ec(this.attrs, e));
  }
  /**
  @internal
  */
  static compile(e, n) {
    let r = /* @__PURE__ */ Object.create(null), i = 0;
    return e.forEach((o, s) => r[o] = new $i(o, i++, n, s)), r;
  }
  /**
  When there is a mark of this type in the given set, a new set
  without it is returned. Otherwise, the input set is returned.
  */
  removeFromSet(e) {
    for (var n = 0; n < e.length; n++)
      e[n].type == this && (e = e.slice(0, n).concat(e.slice(n + 1)), n--);
    return e;
  }
  /**
  Tests whether there is a mark of this type in the given set.
  */
  isInSet(e) {
    for (let n = 0; n < e.length; n++)
      if (e[n].type == this)
        return e[n];
  }
  /**
  @internal
  */
  checkAttrs(e) {
    Sc(this.attrs, e, "mark", this.name);
  }
  /**
  Queries whether a given mark type is
  [excluded](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) by this one.
  */
  excludes(e) {
    return this.excluded.indexOf(e) > -1;
  }
}
class $s {
  /**
  Construct a schema from a schema [specification](https://prosemirror.net/docs/ref/#model.SchemaSpec).
  */
  constructor(e) {
    this.linebreakReplacement = null, this.cached = /* @__PURE__ */ Object.create(null);
    let n = this.spec = {};
    for (let i in e)
      n[i] = e[i];
    n.nodes = se.from(e.nodes), n.marks = se.from(e.marks || {}), this.nodes = Wu.compile(this.spec.nodes, this), this.marks = $i.compile(this.spec.marks, this);
    let r = /* @__PURE__ */ Object.create(null);
    for (let i in this.nodes) {
      if (i in this.marks)
        throw new RangeError(i + " can not be both a node and a mark");
      let o = this.nodes[i], s = o.spec.content || "", u = o.spec.marks;
      if (o.contentMatch = r[s] || (r[s] = Wt.parse(s, this.nodes)), o.inlineContent = o.contentMatch.inlineContent, o.spec.linebreakReplacement) {
        if (this.linebreakReplacement)
          throw new RangeError("Multiple linebreak nodes defined");
        if (!o.isInline || !o.isLeaf)
          throw new RangeError("Linebreak replacement nodes must be inline leaf nodes");
        this.linebreakReplacement = o;
      }
      o.markSet = u == "_" ? null : u ? Uu(this, u.split(" ")) : u == "" || !o.inlineContent ? [] : null;
    }
    for (let i in this.marks) {
      let o = this.marks[i], s = o.spec.excludes;
      o.excluded = s == null ? [o] : s == "" ? [] : Uu(this, s.split(" "));
    }
    this.nodeFromJSON = (i) => Et.fromJSON(this, i), this.markFromJSON = (i) => P.fromJSON(this, i), this.topNodeType = this.nodes[this.spec.topNode || "doc"], this.cached.wrappings = /* @__PURE__ */ Object.create(null);
  }
  /**
  Create a node in this schema. The `type` may be a string or a
  `NodeType` instance. Attributes will be extended with defaults,
  `content` may be a `Fragment`, `null`, a `Node`, or an array of
  nodes.
  */
  node(e, n = null, r, i) {
    if (typeof e == "string")
      e = this.nodeType(e);
    else if (e instanceof Wu) {
      if (e.schema != this)
        throw new RangeError("Node type from different schema used (" + e.name + ")");
    } else throw new RangeError("Invalid node type: " + e);
    return e.createChecked(n, r, i);
  }
  /**
  Create a text node in the schema. Empty text nodes are not
  allowed.
  */
  text(e, n) {
    let r = this.nodes.text;
    return new Zr(r, r.defaultAttrs, e, P.setFrom(n));
  }
  /**
  Create a mark with the given type and attributes.
  */
  mark(e, n) {
    return typeof e == "string" && (e = this.marks[e]), e.create(n);
  }
  /**
  @internal
  */
  nodeType(e) {
    let n = this.nodes[e];
    if (!n)
      throw new RangeError("Unknown node type: " + e);
    return n;
  }
}
function Uu(t, e) {
  let n = [];
  for (let r = 0; r < e.length; r++) {
    let i = e[r], o = t.marks[i], s = o;
    if (o)
      n.push(o);
    else
      for (let u in t.marks) {
        let l = t.marks[u];
        (i == "_" || l.spec.group && l.spec.group.split(" ").indexOf(i) > -1) && n.push(s = l);
      }
    if (!s)
      throw new SyntaxError("Unknown mark type: '" + e[r] + "'");
  }
  return n;
}
function bp(t) {
  return t.tag != null;
}
function yp(t) {
  return t.style != null;
}
class rt {
  /**
  Create a parser that targets the given schema, using the given
  parsing rules.
  */
  constructor(e, n) {
    this.schema = e, this.rules = n, this.tags = [], this.styles = [];
    let r = this.matchedStyles = [];
    n.forEach((i) => {
      if (bp(i))
        this.tags.push(i);
      else if (yp(i)) {
        let o = /[^=]*/.exec(i.style)[0];
        r.indexOf(o) < 0 && r.push(o), this.styles.push(i);
      }
    }), this.normalizeLists = !this.tags.some((i) => {
      if (!/^(ul|ol)\b/.test(i.tag) || !i.node)
        return !1;
      let o = e.nodes[i.node];
      return o.contentMatch.matchType(o);
    });
  }
  /**
  Parse a document from the content of a DOM node.
  */
  parse(e, n = {}) {
    let r = new Ju(this, n, !1);
    return r.addAll(e, P.none, n.from, n.to), r.finish();
  }
  /**
  Parses the content of the given DOM node, like
  [`parse`](https://prosemirror.net/docs/ref/#model.DOMParser.parse), and takes the same set of
  options. But unlike that method, which produces a whole node,
  this one returns a slice that is open at the sides, meaning that
  the schema constraints aren't applied to the start of nodes to
  the left of the input and the end of nodes at the end.
  */
  parseSlice(e, n = {}) {
    let r = new Ju(this, n, !0);
    return r.addAll(e, P.none, n.from, n.to), v.maxOpen(r.finish());
  }
  /**
  @internal
  */
  matchTag(e, n, r) {
    for (let i = r ? this.tags.indexOf(r) + 1 : 0; i < this.tags.length; i++) {
      let o = this.tags[i];
      if (Cp(e, o.tag) && (o.namespace === void 0 || e.namespaceURI == o.namespace) && (!o.context || n.matchesContext(o.context))) {
        if (o.getAttrs) {
          let s = o.getAttrs(e);
          if (s === !1)
            continue;
          o.attrs = s || void 0;
        }
        return o;
      }
    }
  }
  /**
  @internal
  */
  matchStyle(e, n, r, i) {
    for (let o = i ? this.styles.indexOf(i) + 1 : 0; o < this.styles.length; o++) {
      let s = this.styles[o], u = s.style;
      if (!(u.indexOf(e) != 0 || s.context && !r.matchesContext(s.context) || // Test that the style string either precisely matches the prop,
      // or has an '=' sign after the prop, followed by the given
      // value.
      u.length > e.length && (u.charCodeAt(e.length) != 61 || u.slice(e.length + 1) != n))) {
        if (s.getAttrs) {
          let l = s.getAttrs(n);
          if (l === !1)
            continue;
          s.attrs = l || void 0;
        }
        return s;
      }
    }
  }
  /**
  @internal
  */
  static schemaRules(e) {
    let n = [];
    function r(i) {
      let o = i.priority == null ? 50 : i.priority, s = 0;
      for (; s < n.length; s++) {
        let u = n[s];
        if ((u.priority == null ? 50 : u.priority) < o)
          break;
      }
      n.splice(s, 0, i);
    }
    for (let i in e.marks) {
      let o = e.marks[i].spec.parseDOM;
      o && o.forEach((s) => {
        r(s = Gu(s)), s.mark || s.ignore || s.clearMark || (s.mark = i);
      });
    }
    for (let i in e.nodes) {
      let o = e.nodes[i].spec.parseDOM;
      o && o.forEach((s) => {
        r(s = Gu(s)), s.node || s.ignore || s.mark || (s.node = i);
      });
    }
    return n;
  }
  /**
  Construct a DOM parser using the parsing rules listed in a
  schema's [node specs](https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM), reordered by
  [priority](https://prosemirror.net/docs/ref/#model.GenericParseRule.priority).
  */
  static fromSchema(e) {
    return e.cached.domParser || (e.cached.domParser = new rt(e, rt.schemaRules(e)));
  }
}
const Mc = {
  address: !0,
  article: !0,
  aside: !0,
  blockquote: !0,
  canvas: !0,
  dd: !0,
  div: !0,
  dl: !0,
  fieldset: !0,
  figcaption: !0,
  figure: !0,
  footer: !0,
  form: !0,
  h1: !0,
  h2: !0,
  h3: !0,
  h4: !0,
  h5: !0,
  h6: !0,
  header: !0,
  hgroup: !0,
  hr: !0,
  li: !0,
  noscript: !0,
  ol: !0,
  output: !0,
  p: !0,
  pre: !0,
  section: !0,
  table: !0,
  tfoot: !0,
  ul: !0
}, kp = {
  head: !0,
  noscript: !0,
  object: !0,
  script: !0,
  style: !0,
  title: !0
}, Tc = { ol: !0, ul: !0 }, Jn = 1, es = 2, Pn = 4;
function Ku(t, e, n) {
  return e != null ? (e ? Jn : 0) | (e === "full" ? es : 0) : t && t.whitespace == "pre" ? Jn | es : n & ~Pn;
}
class kr {
  constructor(e, n, r, i, o, s) {
    this.type = e, this.attrs = n, this.marks = r, this.solid = i, this.options = s, this.content = [], this.activeMarks = P.none, this.match = o || (s & Pn ? null : e.contentMatch);
  }
  findWrapping(e) {
    if (!this.match) {
      if (!this.type)
        return [];
      let n = this.type.contentMatch.fillBefore(w.from(e));
      if (n)
        this.match = this.type.contentMatch.matchFragment(n);
      else {
        let r = this.type.contentMatch, i;
        return (i = r.findWrapping(e.type)) ? (this.match = r, i) : null;
      }
    }
    return this.match.findWrapping(e.type);
  }
  finish(e) {
    if (!(this.options & Jn)) {
      let r = this.content[this.content.length - 1], i;
      if (r && r.isText && (i = /[ \t\r\n\u000c]+$/.exec(r.text))) {
        let o = r;
        r.text.length == i[0].length ? this.content.pop() : this.content[this.content.length - 1] = o.withText(o.text.slice(0, o.text.length - i[0].length));
      }
    }
    let n = w.from(this.content);
    return !e && this.match && (n = n.append(this.match.fillBefore(w.empty, !0))), this.type ? this.type.create(this.attrs, n, this.marks) : n;
  }
  inlineContext(e) {
    return this.type ? this.type.inlineContent : this.content.length ? this.content[0].isInline : e.parentNode && !Mc.hasOwnProperty(e.parentNode.nodeName.toLowerCase());
  }
}
class Ju {
  constructor(e, n, r) {
    this.parser = e, this.options = n, this.isOpen = r, this.open = 0, this.localPreserveWS = !1;
    let i = n.topNode, o, s = Ku(null, n.preserveWhitespace, 0) | (r ? Pn : 0);
    i ? o = new kr(i.type, i.attrs, P.none, !0, n.topMatch || i.type.contentMatch, s) : r ? o = new kr(null, null, P.none, !0, null, s) : o = new kr(e.schema.topNodeType, null, P.none, !0, null, s), this.nodes = [o], this.find = n.findPositions, this.needsBlock = !1;
  }
  get top() {
    return this.nodes[this.open];
  }
  // Add a DOM node to the content. Text is inserted as text node,
  // otherwise, the node is passed to `addElement` or, if it has a
  // `style` attribute, `addElementWithStyles`.
  addDOM(e, n) {
    e.nodeType == 3 ? this.addTextNode(e, n) : e.nodeType == 1 && this.addElement(e, n);
  }
  addTextNode(e, n) {
    let r = e.nodeValue, i = this.top, o = i.options & es ? "full" : this.localPreserveWS || (i.options & Jn) > 0, { schema: s } = this.parser;
    if (o === "full" || i.inlineContext(e) || /[^ \t\r\n\u000c]/.test(r)) {
      if (o)
        if (o === "full")
          r = r.replace(/\r\n?/g, `
`);
        else if (s.linebreakReplacement && /[\r\n]/.test(r) && this.top.findWrapping(s.linebreakReplacement.create())) {
          let u = r.split(/\r?\n|\r/);
          for (let l = 0; l < u.length; l++)
            l && this.insertNode(s.linebreakReplacement.create(), n, !0), u[l] && this.insertNode(s.text(u[l]), n, !/\S/.test(u[l]));
          r = "";
        } else
          r = r.replace(/\r?\n|\r/g, " ");
      else if (r = r.replace(/[ \t\r\n\u000c]+/g, " "), /^[ \t\r\n\u000c]/.test(r) && this.open == this.nodes.length - 1) {
        let u = i.content[i.content.length - 1], l = e.previousSibling;
        (!u || l && l.nodeName == "BR" || u.isText && /[ \t\r\n\u000c]$/.test(u.text)) && (r = r.slice(1));
      }
      r && this.insertNode(s.text(r), n, !/\S/.test(r)), this.findInText(e);
    } else
      this.findInside(e);
  }
  // Try to find a handler for the given tag and use that to parse. If
  // none is found, the element's content nodes are added directly.
  addElement(e, n, r) {
    let i = this.localPreserveWS, o = this.top;
    (e.tagName == "PRE" || /pre/.test(e.style && e.style.whiteSpace)) && (this.localPreserveWS = !0);
    let s = e.nodeName.toLowerCase(), u;
    Tc.hasOwnProperty(s) && this.parser.normalizeLists && xp(e);
    let l = this.options.ruleFromNode && this.options.ruleFromNode(e) || (u = this.parser.matchTag(e, this, r));
    e: if (l ? l.ignore : kp.hasOwnProperty(s))
      this.findInside(e), this.ignoreFallback(e, n);
    else if (!l || l.skip || l.closeParent) {
      l && l.closeParent ? this.open = Math.max(0, this.open - 1) : l && l.skip.nodeType && (e = l.skip);
      let a, c = this.needsBlock;
      if (Mc.hasOwnProperty(s))
        o.content.length && o.content[0].isInline && this.open && (this.open--, o = this.top), a = !0, o.type || (this.needsBlock = !0);
      else if (!e.firstChild) {
        this.leafFallback(e, n);
        break e;
      }
      let d = l && l.skip ? n : this.readStyles(e, n);
      d && this.addAll(e, d), a && this.sync(o), this.needsBlock = c;
    } else {
      let a = this.readStyles(e, n);
      a && this.addElementByRule(e, l, a, l.consuming === !1 ? u : void 0);
    }
    this.localPreserveWS = i;
  }
  // Called for leaf DOM nodes that would otherwise be ignored
  leafFallback(e, n) {
    e.nodeName == "BR" && this.top.type && this.top.type.inlineContent && this.addTextNode(e.ownerDocument.createTextNode(`
`), n);
  }
  // Called for ignored nodes
  ignoreFallback(e, n) {
    e.nodeName == "BR" && (!this.top.type || !this.top.type.inlineContent) && this.findPlace(this.parser.schema.text("-"), n, !0);
  }
  // Run any style parser associated with the node's styles. Either
  // return an updated array of marks, or null to indicate some of the
  // styles had a rule with `ignore` set.
  readStyles(e, n) {
    let r = e.style;
    if (r && r.length)
      for (let i = 0; i < this.parser.matchedStyles.length; i++) {
        let o = this.parser.matchedStyles[i], s = r.getPropertyValue(o);
        if (s)
          for (let u = void 0; ; ) {
            let l = this.parser.matchStyle(o, s, this, u);
            if (!l)
              break;
            if (l.ignore)
              return null;
            if (l.clearMark ? n = n.filter((a) => !l.clearMark(a)) : n = n.concat(this.parser.schema.marks[l.mark].create(l.attrs)), l.consuming === !1)
              u = l;
            else
              break;
          }
      }
    return n;
  }
  // Look up a handler for the given node. If none are found, return
  // false. Otherwise, apply it, use its return value to drive the way
  // the node's content is wrapped, and return true.
  addElementByRule(e, n, r, i) {
    let o, s;
    if (n.node)
      if (s = this.parser.schema.nodes[n.node], s.isLeaf)
        this.insertNode(s.create(n.attrs), r, e.nodeName == "BR") || this.leafFallback(e, r);
      else {
        let l = this.enter(s, n.attrs || null, r, n.preserveWhitespace);
        l && (o = !0, r = l);
      }
    else {
      let l = this.parser.schema.marks[n.mark];
      r = r.concat(l.create(n.attrs));
    }
    let u = this.top;
    if (s && s.isLeaf)
      this.findInside(e);
    else if (i)
      this.addElement(e, r, i);
    else if (n.getContent)
      this.findInside(e), n.getContent(e, this.parser.schema).forEach((l) => this.insertNode(l, r, !1));
    else {
      let l = e;
      typeof n.contentElement == "string" ? l = e.querySelector(n.contentElement) : typeof n.contentElement == "function" ? l = n.contentElement(e) : n.contentElement && (l = n.contentElement), this.findAround(e, l, !0), this.addAll(l, r), this.findAround(e, l, !1);
    }
    o && this.sync(u) && this.open--;
  }
  // Add all child nodes between `startIndex` and `endIndex` (or the
  // whole node, if not given). If `sync` is passed, use it to
  // synchronize after every block element.
  addAll(e, n, r, i) {
    let o = r || 0;
    for (let s = r ? e.childNodes[r] : e.firstChild, u = i == null ? null : e.childNodes[i]; s != u; s = s.nextSibling, ++o)
      this.findAtPoint(e, o), this.addDOM(s, n);
    this.findAtPoint(e, o);
  }
  // Try to find a way to fit the given node type into the current
  // context. May add intermediate wrappers and/or leave non-solid
  // nodes that we're in.
  findPlace(e, n, r) {
    let i, o;
    for (let s = this.open, u = 0; s >= 0; s--) {
      let l = this.nodes[s], a = l.findWrapping(e);
      if (a && (!i || i.length > a.length + u) && (i = a, o = l, !a.length))
        break;
      if (l.solid) {
        if (r)
          break;
        u += 2;
      }
    }
    if (!i)
      return null;
    this.sync(o);
    for (let s = 0; s < i.length; s++)
      n = this.enterInner(i[s], null, n, !1);
    return n;
  }
  // Try to insert the given node, adjusting the context when needed.
  insertNode(e, n, r) {
    if (e.isInline && this.needsBlock && !this.top.type) {
      let o = this.textblockFromContext();
      o && (n = this.enterInner(o, null, n));
    }
    let i = this.findPlace(e, n, r);
    if (i) {
      this.closeExtra();
      let o = this.top;
      o.match && (o.match = o.match.matchType(e.type));
      let s = P.none;
      for (let u of i.concat(e.marks))
        (o.type ? o.type.allowsMarkType(u.type) : Zu(u.type, e.type)) && (s = u.addToSet(s));
      return o.content.push(e.mark(s)), !0;
    }
    return !1;
  }
  // Try to start a node of the given type, adjusting the context when
  // necessary.
  enter(e, n, r, i) {
    let o = this.findPlace(e.create(n), r, !1);
    return o && (o = this.enterInner(e, n, r, !0, i)), o;
  }
  // Open a node of the given type
  enterInner(e, n, r, i = !1, o) {
    this.closeExtra();
    let s = this.top;
    s.match = s.match && s.match.matchType(e);
    let u = Ku(e, o, s.options);
    s.options & Pn && s.content.length == 0 && (u |= Pn);
    let l = P.none;
    return r = r.filter((a) => (s.type ? s.type.allowsMarkType(a.type) : Zu(a.type, e)) ? (l = a.addToSet(l), !1) : !0), this.nodes.push(new kr(e, n, l, i, null, u)), this.open++, r;
  }
  // Make sure all nodes above this.open are finished and added to
  // their parents
  closeExtra(e = !1) {
    let n = this.nodes.length - 1;
    if (n > this.open) {
      for (; n > this.open; n--)
        this.nodes[n - 1].content.push(this.nodes[n].finish(e));
      this.nodes.length = this.open + 1;
    }
  }
  finish() {
    return this.open = 0, this.closeExtra(this.isOpen), this.nodes[0].finish(!!(this.isOpen || this.options.topOpen));
  }
  sync(e) {
    for (let n = this.open; n >= 0; n--) {
      if (this.nodes[n] == e)
        return this.open = n, !0;
      this.localPreserveWS && (this.nodes[n].options |= Jn);
    }
    return !1;
  }
  get currentPos() {
    this.closeExtra();
    let e = 0;
    for (let n = this.open; n >= 0; n--) {
      let r = this.nodes[n].content;
      for (let i = r.length - 1; i >= 0; i--)
        e += r[i].nodeSize;
      n && e++;
    }
    return e;
  }
  findAtPoint(e, n) {
    if (this.find)
      for (let r = 0; r < this.find.length; r++)
        this.find[r].node == e && this.find[r].offset == n && (this.find[r].pos = this.currentPos);
  }
  findInside(e) {
    if (this.find)
      for (let n = 0; n < this.find.length; n++)
        this.find[n].pos == null && e.nodeType == 1 && e.contains(this.find[n].node) && (this.find[n].pos = this.currentPos);
  }
  findAround(e, n, r) {
    if (e != n && this.find)
      for (let i = 0; i < this.find.length; i++)
        this.find[i].pos == null && e.nodeType == 1 && e.contains(this.find[i].node) && n.compareDocumentPosition(this.find[i].node) & (r ? 2 : 4) && (this.find[i].pos = this.currentPos);
  }
  findInText(e) {
    if (this.find)
      for (let n = 0; n < this.find.length; n++)
        this.find[n].node == e && (this.find[n].pos = this.currentPos - (e.nodeValue.length - this.find[n].offset));
  }
  // Determines whether the given context string matches this context.
  matchesContext(e) {
    if (e.indexOf("|") > -1)
      return e.split(/\s*\|\s*/).some(this.matchesContext, this);
    let n = e.split("/"), r = this.options.context, i = !this.isOpen && (!r || r.parent.type == this.nodes[0].type), o = -(r ? r.depth + 1 : 0) + (i ? 0 : 1), s = (u, l) => {
      for (; u >= 0; u--) {
        let a = n[u];
        if (a == "") {
          if (u == n.length - 1 || u == 0)
            continue;
          for (; l >= o; l--)
            if (s(u - 1, l))
              return !0;
          return !1;
        } else {
          let c = l > 0 || l == 0 && i ? this.nodes[l].type : r && l >= o ? r.node(l - o).type : null;
          if (!c || c.name != a && !c.isInGroup(a))
            return !1;
          l--;
        }
      }
      return !0;
    };
    return s(n.length - 1, this.open);
  }
  textblockFromContext() {
    let e = this.options.context;
    if (e)
      for (let n = e.depth; n >= 0; n--) {
        let r = e.node(n).contentMatchAt(e.indexAfter(n)).defaultType;
        if (r && r.isTextblock && r.defaultAttrs)
          return r;
      }
    for (let n in this.parser.schema.nodes) {
      let r = this.parser.schema.nodes[n];
      if (r.isTextblock && r.defaultAttrs)
        return r;
    }
  }
}
function xp(t) {
  for (let e = t.firstChild, n = null; e; e = e.nextSibling) {
    let r = e.nodeType == 1 ? e.nodeName.toLowerCase() : null;
    r && Tc.hasOwnProperty(r) && n ? (n.appendChild(e), e = n) : r == "li" ? n = e : r && (n = null);
  }
}
function Cp(t, e) {
  return (t.matches || t.msMatchesSelector || t.webkitMatchesSelector || t.mozMatchesSelector).call(t, e);
}
function Gu(t) {
  let e = {};
  for (let n in t)
    e[n] = t[n];
  return e;
}
function Zu(t, e) {
  let n = e.schema.nodes;
  for (let r in n) {
    let i = n[r];
    if (!i.allowsMarkType(t))
      continue;
    let o = [], s = (u) => {
      o.push(u);
      for (let l = 0; l < u.edgeCount; l++) {
        let { type: a, next: c } = u.edge(l);
        if (a == e || o.indexOf(c) < 0 && s(c))
          return !0;
      }
    };
    if (s(i.contentMatch))
      return !0;
  }
}
class Yt {
  /**
  Create a serializer. `nodes` should map node names to functions
  that take a node and return a description of the corresponding
  DOM. `marks` does the same for mark names, but also gets an
  argument that tells it whether the mark's content is block or
  inline content (for typical use, it'll always be inline). A mark
  serializer may be `null` to indicate that marks of that type
  should not be serialized.
  */
  constructor(e, n) {
    this.nodes = e, this.marks = n;
  }
  /**
  Serialize the content of this fragment to a DOM fragment. When
  not in the browser, the `document` option, containing a DOM
  document, should be passed so that the serializer can create
  nodes.
  */
  serializeFragment(e, n = {}, r) {
    r || (r = co(n).createDocumentFragment());
    let i = r, o = [];
    return e.forEach((s) => {
      if (o.length || s.marks.length) {
        let u = 0, l = 0;
        for (; u < o.length && l < s.marks.length; ) {
          let a = s.marks[l];
          if (!this.marks[a.type.name]) {
            l++;
            continue;
          }
          if (!a.eq(o[u][0]) || a.type.spec.spanning === !1)
            break;
          u++, l++;
        }
        for (; u < o.length; )
          i = o.pop()[1];
        for (; l < s.marks.length; ) {
          let a = s.marks[l++], c = this.serializeMark(a, s.isInline, n);
          c && (o.push([a, i]), i.appendChild(c.dom), i = c.contentDOM || c.dom);
        }
      }
      i.appendChild(this.serializeNodeInner(s, n));
    }), r;
  }
  /**
  @internal
  */
  serializeNodeInner(e, n) {
    let { dom: r, contentDOM: i } = Br(co(n), this.nodes[e.type.name](e), null, e.attrs);
    if (i) {
      if (e.isLeaf)
        throw new RangeError("Content hole not allowed in a leaf node spec");
      this.serializeFragment(e.content, n, i);
    }
    return r;
  }
  /**
  Serialize this node to a DOM node. This can be useful when you
  need to serialize a part of a document, as opposed to the whole
  document. To serialize a whole document, use
  [`serializeFragment`](https://prosemirror.net/docs/ref/#model.DOMSerializer.serializeFragment) on
  its [content](https://prosemirror.net/docs/ref/#model.Node.content).
  */
  serializeNode(e, n = {}) {
    let r = this.serializeNodeInner(e, n);
    for (let i = e.marks.length - 1; i >= 0; i--) {
      let o = this.serializeMark(e.marks[i], e.isInline, n);
      o && ((o.contentDOM || o.dom).appendChild(r), r = o.dom);
    }
    return r;
  }
  /**
  @internal
  */
  serializeMark(e, n, r = {}) {
    let i = this.marks[e.type.name];
    return i && Br(co(r), i(e, n), null, e.attrs);
  }
  static renderSpec(e, n, r = null, i) {
    return Br(e, n, r, i);
  }
  /**
  Build a serializer using the [`toDOM`](https://prosemirror.net/docs/ref/#model.NodeSpec.toDOM)
  properties in a schema's node and mark specs.
  */
  static fromSchema(e) {
    return e.cached.domSerializer || (e.cached.domSerializer = new Yt(this.nodesFromSchema(e), this.marksFromSchema(e)));
  }
  /**
  Gather the serializers in a schema's node specs into an object.
  This can be useful as a base to build a custom serializer from.
  */
  static nodesFromSchema(e) {
    let n = Xu(e.nodes);
    return n.text || (n.text = (r) => r.text), n;
  }
  /**
  Gather the serializers in a schema's mark specs into an object.
  */
  static marksFromSchema(e) {
    return Xu(e.marks);
  }
}
function Xu(t) {
  let e = {};
  for (let n in t) {
    let r = t[n].spec.toDOM;
    r && (e[n] = r);
  }
  return e;
}
function co(t) {
  return t.document || window.document;
}
const Yu = /* @__PURE__ */ new WeakMap();
function wp(t) {
  let e = Yu.get(t);
  return e === void 0 && Yu.set(t, e = Ep(t)), e;
}
function Ep(t) {
  let e = null;
  function n(r) {
    if (r && typeof r == "object")
      if (Array.isArray(r))
        if (typeof r[0] == "string")
          e || (e = []), e.push(r);
        else
          for (let i = 0; i < r.length; i++)
            n(r[i]);
      else
        for (let i in r)
          n(r[i]);
  }
  return n(t), e;
}
function Br(t, e, n, r) {
  if (typeof e == "string")
    return { dom: t.createTextNode(e) };
  if (e.nodeType != null)
    return { dom: e };
  if (e.dom && e.dom.nodeType != null)
    return e;
  let i = e[0], o;
  if (typeof i != "string")
    throw new RangeError("Invalid array passed to renderSpec");
  if (r && (o = wp(r)) && o.indexOf(e) > -1)
    throw new RangeError("Using an array from an attribute object as a DOM spec. This may be an attempted cross site scripting attack.");
  let s = i.indexOf(" ");
  s > 0 && (n = i.slice(0, s), i = i.slice(s + 1));
  let u, l = n ? t.createElementNS(n, i) : t.createElement(i), a = e[1], c = 1;
  if (a && typeof a == "object" && a.nodeType == null && !Array.isArray(a)) {
    c = 2;
    for (let d in a)
      if (a[d] != null) {
        let f = d.indexOf(" ");
        f > 0 ? l.setAttributeNS(d.slice(0, f), d.slice(f + 1), a[d]) : d == "style" && l.style ? l.style.cssText = a[d] : l.setAttribute(d, a[d]);
      }
  }
  for (let d = c; d < e.length; d++) {
    let f = e[d];
    if (f === 0) {
      if (d < e.length - 1 || d > c)
        throw new RangeError("Content hole must be the only child of its parent node");
      return { dom: l, contentDOM: l };
    } else {
      let { dom: h, contentDOM: p } = Br(t, f, n, r);
      if (l.appendChild(h), p) {
        if (u)
          throw new RangeError("Multiple content holes");
        u = p;
      }
    }
  }
  return { dom: l, contentDOM: u };
}
const _c = 65535, Dc = Math.pow(2, 16);
function Sp(t, e) {
  return t + e * Dc;
}
function Qu(t) {
  return t & _c;
}
function Ap(t) {
  return (t - (t & _c)) / Dc;
}
const Oc = 1, Nc = 2, zr = 4, Rc = 8;
class ts {
  /**
  @internal
  */
  constructor(e, n, r) {
    this.pos = e, this.delInfo = n, this.recover = r;
  }
  /**
  Tells you whether the position was deleted, that is, whether the
  step removed the token on the side queried (via the `assoc`)
  argument from the document.
  */
  get deleted() {
    return (this.delInfo & Rc) > 0;
  }
  /**
  Tells you whether the token before the mapped position was deleted.
  */
  get deletedBefore() {
    return (this.delInfo & (Oc | zr)) > 0;
  }
  /**
  True when the token after the mapped position was deleted.
  */
  get deletedAfter() {
    return (this.delInfo & (Nc | zr)) > 0;
  }
  /**
  Tells whether any of the steps mapped through deletes across the
  position (including both the token before and after the
  position).
  */
  get deletedAcross() {
    return (this.delInfo & zr) > 0;
  }
}
class Ce {
  /**
  Create a position map. The modifications to the document are
  represented as an array of numbers, in which each group of three
  represents a modified chunk as `[start, oldSize, newSize]`.
  */
  constructor(e, n = !1) {
    if (this.ranges = e, this.inverted = n, !e.length && Ce.empty)
      return Ce.empty;
  }
  /**
  @internal
  */
  recover(e) {
    let n = 0, r = Qu(e);
    if (!this.inverted)
      for (let i = 0; i < r; i++)
        n += this.ranges[i * 3 + 2] - this.ranges[i * 3 + 1];
    return this.ranges[r * 3] + n + Ap(e);
  }
  mapResult(e, n = 1) {
    return this._map(e, n, !1);
  }
  map(e, n = 1) {
    return this._map(e, n, !0);
  }
  /**
  @internal
  */
  _map(e, n, r) {
    let i = 0, o = this.inverted ? 2 : 1, s = this.inverted ? 1 : 2;
    for (let u = 0; u < this.ranges.length; u += 3) {
      let l = this.ranges[u] - (this.inverted ? i : 0);
      if (l > e)
        break;
      let a = this.ranges[u + o], c = this.ranges[u + s], d = l + a;
      if (e <= d) {
        let f = a ? e == l ? -1 : e == d ? 1 : n : n, h = l + i + (f < 0 ? 0 : c);
        if (r)
          return h;
        let p = e == (n < 0 ? l : d) ? null : Sp(u / 3, e - l), m = e == l ? Nc : e == d ? Oc : zr;
        return (n < 0 ? e != l : e != d) && (m |= Rc), new ts(h, m, p);
      }
      i += c - a;
    }
    return r ? e + i : new ts(e + i, 0, null);
  }
  /**
  @internal
  */
  touches(e, n) {
    let r = 0, i = Qu(n), o = this.inverted ? 2 : 1, s = this.inverted ? 1 : 2;
    for (let u = 0; u < this.ranges.length; u += 3) {
      let l = this.ranges[u] - (this.inverted ? r : 0);
      if (l > e)
        break;
      let a = this.ranges[u + o], c = l + a;
      if (e <= c && u == i * 3)
        return !0;
      r += this.ranges[u + s] - a;
    }
    return !1;
  }
  /**
  Calls the given function on each of the changed ranges included in
  this map.
  */
  forEach(e) {
    let n = this.inverted ? 2 : 1, r = this.inverted ? 1 : 2;
    for (let i = 0, o = 0; i < this.ranges.length; i += 3) {
      let s = this.ranges[i], u = s - (this.inverted ? o : 0), l = s + (this.inverted ? 0 : o), a = this.ranges[i + n], c = this.ranges[i + r];
      e(u, u + a, l, l + c), o += c - a;
    }
  }
  /**
  Create an inverted version of this map. The result can be used to
  map positions in the post-step document to the pre-step document.
  */
  invert() {
    return new Ce(this.ranges, !this.inverted);
  }
  /**
  @internal
  */
  toString() {
    return (this.inverted ? "-" : "") + JSON.stringify(this.ranges);
  }
  /**
  Create a map that moves all positions by offset `n` (which may be
  negative). This can be useful when applying steps meant for a
  sub-document to a larger document, or vice-versa.
  */
  static offset(e) {
    return e == 0 ? Ce.empty : new Ce(e < 0 ? [0, -e, 0] : [0, 0, e]);
  }
}
Ce.empty = new Ce([]);
class Gn {
  /**
  Create a new mapping with the given position maps.
  */
  constructor(e, n, r = 0, i = e ? e.length : 0) {
    this.mirror = n, this.from = r, this.to = i, this._maps = e || [], this.ownData = !(e || n);
  }
  /**
  The step maps in this mapping.
  */
  get maps() {
    return this._maps;
  }
  /**
  Create a mapping that maps only through a part of this one.
  */
  slice(e = 0, n = this.maps.length) {
    return new Gn(this._maps, this.mirror, e, n);
  }
  /**
  Add a step map to the end of this mapping. If `mirrors` is
  given, it should be the index of the step map that is the mirror
  image of this one.
  */
  appendMap(e, n) {
    this.ownData || (this._maps = this._maps.slice(), this.mirror = this.mirror && this.mirror.slice(), this.ownData = !0), this.to = this._maps.push(e), n != null && this.setMirror(this._maps.length - 1, n);
  }
  /**
  Add all the step maps in a given mapping to this one (preserving
  mirroring information).
  */
  appendMapping(e) {
    for (let n = 0, r = this._maps.length; n < e._maps.length; n++) {
      let i = e.getMirror(n);
      this.appendMap(e._maps[n], i != null && i < n ? r + i : void 0);
    }
  }
  /**
  Finds the offset of the step map that mirrors the map at the
  given offset, in this mapping (as per the second argument to
  `appendMap`).
  */
  getMirror(e) {
    if (this.mirror) {
      for (let n = 0; n < this.mirror.length; n++)
        if (this.mirror[n] == e)
          return this.mirror[n + (n % 2 ? -1 : 1)];
    }
  }
  /**
  @internal
  */
  setMirror(e, n) {
    this.mirror || (this.mirror = []), this.mirror.push(e, n);
  }
  /**
  Append the inverse of the given mapping to this one.
  */
  appendMappingInverted(e) {
    for (let n = e.maps.length - 1, r = this._maps.length + e._maps.length; n >= 0; n--) {
      let i = e.getMirror(n);
      this.appendMap(e._maps[n].invert(), i != null && i > n ? r - i - 1 : void 0);
    }
  }
  /**
  Create an inverted version of this mapping.
  */
  invert() {
    let e = new Gn();
    return e.appendMappingInverted(this), e;
  }
  /**
  Map a position through this mapping.
  */
  map(e, n = 1) {
    if (this.mirror)
      return this._map(e, n, !0);
    for (let r = this.from; r < this.to; r++)
      e = this._maps[r].map(e, n);
    return e;
  }
  /**
  Map a position through this mapping, returning a mapping
  result.
  */
  mapResult(e, n = 1) {
    return this._map(e, n, !1);
  }
  /**
  @internal
  */
  _map(e, n, r) {
    let i = 0;
    for (let o = this.from; o < this.to; o++) {
      let s = this._maps[o], u = s.mapResult(e, n);
      if (u.recover != null) {
        let l = this.getMirror(o);
        if (l != null && l > o && l < this.to) {
          o = l, e = this._maps[l].recover(u.recover);
          continue;
        }
      }
      i |= u.delInfo, e = u.pos;
    }
    return r ? e : new ts(e, i, null);
  }
}
const fo = /* @__PURE__ */ Object.create(null);
class he {
  /**
  Get the step map that represents the changes made by this step,
  and which can be used to transform between positions in the old
  and the new document.
  */
  getMap() {
    return Ce.empty;
  }
  /**
  Try to merge this step with another one, to be applied directly
  after it. Returns the merged step when possible, null if the
  steps can't be merged.
  */
  merge(e) {
    return null;
  }
  /**
  Deserialize a step from its JSON representation. Will call
  through to the step class' own implementation of this method.
  */
  static fromJSON(e, n) {
    if (!n || !n.stepType)
      throw new RangeError("Invalid input for Step.fromJSON");
    let r = fo[n.stepType];
    if (!r)
      throw new RangeError(`No step type ${n.stepType} defined`);
    return r.fromJSON(e, n);
  }
  /**
  To be able to serialize steps to JSON, each step needs a string
  ID to attach to its JSON representation. Use this method to
  register an ID for your step classes. Try to pick something
  that's unlikely to clash with steps from other modules.
  */
  static jsonID(e, n) {
    if (e in fo)
      throw new RangeError("Duplicate use of step JSON ID " + e);
    return fo[e] = n, n.prototype.jsonID = e, n;
  }
}
class Z {
  /**
  @internal
  */
  constructor(e, n) {
    this.doc = e, this.failed = n;
  }
  /**
  Create a successful step result.
  */
  static ok(e) {
    return new Z(e, null);
  }
  /**
  Create a failed step result.
  */
  static fail(e) {
    return new Z(null, e);
  }
  /**
  Call [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) with the given
  arguments. Create a successful result if it succeeds, and a
  failed one if it throws a `ReplaceError`.
  */
  static fromReplace(e, n, r, i) {
    try {
      return Z.ok(e.replace(n, r, i));
    } catch (o) {
      if (o instanceof Kr)
        return Z.fail(o.message);
      throw o;
    }
  }
}
function Hs(t, e, n) {
  let r = [];
  for (let i = 0; i < t.childCount; i++) {
    let o = t.child(i);
    o.content.size && (o = o.copy(Hs(o.content, e, o))), o.isInline && (o = e(o, n, i)), r.push(o);
  }
  return w.fromArray(r);
}
class kt extends he {
  /**
  Create a mark step.
  */
  constructor(e, n, r) {
    super(), this.from = e, this.to = n, this.mark = r;
  }
  apply(e) {
    let n = e.slice(this.from, this.to), r = e.resolve(this.from), i = r.node(r.sharedDepth(this.to)), o = new v(Hs(n.content, (s, u) => !s.isAtom || !u.type.allowsMarkType(this.mark.type) ? s : s.mark(this.mark.addToSet(s.marks)), i), n.openStart, n.openEnd);
    return Z.fromReplace(e, this.from, this.to, o);
  }
  invert() {
    return new Ie(this.from, this.to, this.mark);
  }
  map(e) {
    let n = e.mapResult(this.from, 1), r = e.mapResult(this.to, -1);
    return n.deleted && r.deleted || n.pos >= r.pos ? null : new kt(n.pos, r.pos, this.mark);
  }
  merge(e) {
    return e instanceof kt && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from ? new kt(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark) : null;
  }
  toJSON() {
    return {
      stepType: "addMark",
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to
    };
  }
  /**
  @internal
  */
  static fromJSON(e, n) {
    if (typeof n.from != "number" || typeof n.to != "number")
      throw new RangeError("Invalid input for AddMarkStep.fromJSON");
    return new kt(n.from, n.to, e.markFromJSON(n.mark));
  }
}
he.jsonID("addMark", kt);
class Ie extends he {
  /**
  Create a mark-removing step.
  */
  constructor(e, n, r) {
    super(), this.from = e, this.to = n, this.mark = r;
  }
  apply(e) {
    let n = e.slice(this.from, this.to), r = new v(Hs(n.content, (i) => i.mark(this.mark.removeFromSet(i.marks)), e), n.openStart, n.openEnd);
    return Z.fromReplace(e, this.from, this.to, r);
  }
  invert() {
    return new kt(this.from, this.to, this.mark);
  }
  map(e) {
    let n = e.mapResult(this.from, 1), r = e.mapResult(this.to, -1);
    return n.deleted && r.deleted || n.pos >= r.pos ? null : new Ie(n.pos, r.pos, this.mark);
  }
  merge(e) {
    return e instanceof Ie && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from ? new Ie(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark) : null;
  }
  toJSON() {
    return {
      stepType: "removeMark",
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to
    };
  }
  /**
  @internal
  */
  static fromJSON(e, n) {
    if (typeof n.from != "number" || typeof n.to != "number")
      throw new RangeError("Invalid input for RemoveMarkStep.fromJSON");
    return new Ie(n.from, n.to, e.markFromJSON(n.mark));
  }
}
he.jsonID("removeMark", Ie);
class xt extends he {
  /**
  Create a node mark step.
  */
  constructor(e, n) {
    super(), this.pos = e, this.mark = n;
  }
  apply(e) {
    let n = e.nodeAt(this.pos);
    if (!n)
      return Z.fail("No node at mark step's position");
    let r = n.type.create(n.attrs, null, this.mark.addToSet(n.marks));
    return Z.fromReplace(e, this.pos, this.pos + 1, new v(w.from(r), 0, n.isLeaf ? 0 : 1));
  }
  invert(e) {
    let n = e.nodeAt(this.pos);
    if (n) {
      let r = this.mark.addToSet(n.marks);
      if (r.length == n.marks.length) {
        for (let i = 0; i < n.marks.length; i++)
          if (!n.marks[i].isInSet(r))
            return new xt(this.pos, n.marks[i]);
        return new xt(this.pos, this.mark);
      }
    }
    return new Ut(this.pos, this.mark);
  }
  map(e) {
    let n = e.mapResult(this.pos, 1);
    return n.deletedAfter ? null : new xt(n.pos, this.mark);
  }
  toJSON() {
    return { stepType: "addNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  /**
  @internal
  */
  static fromJSON(e, n) {
    if (typeof n.pos != "number")
      throw new RangeError("Invalid input for AddNodeMarkStep.fromJSON");
    return new xt(n.pos, e.markFromJSON(n.mark));
  }
}
he.jsonID("addNodeMark", xt);
class Ut extends he {
  /**
  Create a mark-removing step.
  */
  constructor(e, n) {
    super(), this.pos = e, this.mark = n;
  }
  apply(e) {
    let n = e.nodeAt(this.pos);
    if (!n)
      return Z.fail("No node at mark step's position");
    let r = n.type.create(n.attrs, null, this.mark.removeFromSet(n.marks));
    return Z.fromReplace(e, this.pos, this.pos + 1, new v(w.from(r), 0, n.isLeaf ? 0 : 1));
  }
  invert(e) {
    let n = e.nodeAt(this.pos);
    return !n || !this.mark.isInSet(n.marks) ? this : new xt(this.pos, this.mark);
  }
  map(e) {
    let n = e.mapResult(this.pos, 1);
    return n.deletedAfter ? null : new Ut(n.pos, this.mark);
  }
  toJSON() {
    return { stepType: "removeNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  /**
  @internal
  */
  static fromJSON(e, n) {
    if (typeof n.pos != "number")
      throw new RangeError("Invalid input for RemoveNodeMarkStep.fromJSON");
    return new Ut(n.pos, e.markFromJSON(n.mark));
  }
}
he.jsonID("removeNodeMark", Ut);
class te extends he {
  /**
  The given `slice` should fit the 'gap' between `from` and
  `to`—the depths must line up, and the surrounding nodes must be
  able to be joined with the open sides of the slice. When
  `structure` is true, the step will fail if the content between
  from and to is not just a sequence of closing and then opening
  tokens (this is to guard against rebased replace steps
  overwriting something they weren't supposed to).
  */
  constructor(e, n, r, i = !1) {
    super(), this.from = e, this.to = n, this.slice = r, this.structure = i;
  }
  apply(e) {
    return this.structure && ns(e, this.from, this.to) ? Z.fail("Structure replace would overwrite content") : Z.fromReplace(e, this.from, this.to, this.slice);
  }
  getMap() {
    return new Ce([this.from, this.to - this.from, this.slice.size]);
  }
  invert(e) {
    return new te(this.from, this.from + this.slice.size, e.slice(this.from, this.to));
  }
  map(e) {
    let n = e.mapResult(this.from, 1), r = e.mapResult(this.to, -1);
    return n.deletedAcross && r.deletedAcross ? null : new te(n.pos, Math.max(n.pos, r.pos), this.slice, this.structure);
  }
  merge(e) {
    if (!(e instanceof te) || e.structure || this.structure)
      return null;
    if (this.from + this.slice.size == e.from && !this.slice.openEnd && !e.slice.openStart) {
      let n = this.slice.size + e.slice.size == 0 ? v.empty : new v(this.slice.content.append(e.slice.content), this.slice.openStart, e.slice.openEnd);
      return new te(this.from, this.to + (e.to - e.from), n, this.structure);
    } else if (e.to == this.from && !this.slice.openStart && !e.slice.openEnd) {
      let n = this.slice.size + e.slice.size == 0 ? v.empty : new v(e.slice.content.append(this.slice.content), e.slice.openStart, this.slice.openEnd);
      return new te(e.from, this.to, n, this.structure);
    } else
      return null;
  }
  toJSON() {
    let e = { stepType: "replace", from: this.from, to: this.to };
    return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
  }
  /**
  @internal
  */
  static fromJSON(e, n) {
    if (typeof n.from != "number" || typeof n.to != "number")
      throw new RangeError("Invalid input for ReplaceStep.fromJSON");
    return new te(n.from, n.to, v.fromJSON(e, n.slice), !!n.structure);
  }
}
he.jsonID("replace", te);
class ie extends he {
  /**
  Create a replace-around step with the given range and gap.
  `insert` should be the point in the slice into which the content
  of the gap should be moved. `structure` has the same meaning as
  it has in the [`ReplaceStep`](https://prosemirror.net/docs/ref/#transform.ReplaceStep) class.
  */
  constructor(e, n, r, i, o, s, u = !1) {
    super(), this.from = e, this.to = n, this.gapFrom = r, this.gapTo = i, this.slice = o, this.insert = s, this.structure = u;
  }
  apply(e) {
    if (this.structure && (ns(e, this.from, this.gapFrom) || ns(e, this.gapTo, this.to)))
      return Z.fail("Structure gap-replace would overwrite content");
    let n = e.slice(this.gapFrom, this.gapTo);
    if (n.openStart || n.openEnd)
      return Z.fail("Gap is not a flat range");
    let r = this.slice.insertAt(this.insert, n.content);
    return r ? Z.fromReplace(e, this.from, this.to, r) : Z.fail("Content does not fit in gap");
  }
  getMap() {
    return new Ce([
      this.from,
      this.gapFrom - this.from,
      this.insert,
      this.gapTo,
      this.to - this.gapTo,
      this.slice.size - this.insert
    ]);
  }
  invert(e) {
    let n = this.gapTo - this.gapFrom;
    return new ie(this.from, this.from + this.slice.size + n, this.from + this.insert, this.from + this.insert + n, e.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
  }
  map(e) {
    let n = e.mapResult(this.from, 1), r = e.mapResult(this.to, -1), i = this.from == this.gapFrom ? n.pos : e.map(this.gapFrom, -1), o = this.to == this.gapTo ? r.pos : e.map(this.gapTo, 1);
    return n.deletedAcross && r.deletedAcross || i < n.pos || o > r.pos ? null : new ie(n.pos, r.pos, i, o, this.slice, this.insert, this.structure);
  }
  toJSON() {
    let e = {
      stepType: "replaceAround",
      from: this.from,
      to: this.to,
      gapFrom: this.gapFrom,
      gapTo: this.gapTo,
      insert: this.insert
    };
    return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
  }
  /**
  @internal
  */
  static fromJSON(e, n) {
    if (typeof n.from != "number" || typeof n.to != "number" || typeof n.gapFrom != "number" || typeof n.gapTo != "number" || typeof n.insert != "number")
      throw new RangeError("Invalid input for ReplaceAroundStep.fromJSON");
    return new ie(n.from, n.to, n.gapFrom, n.gapTo, v.fromJSON(e, n.slice), n.insert, !!n.structure);
  }
}
he.jsonID("replaceAround", ie);
function ns(t, e, n) {
  let r = t.resolve(e), i = n - e, o = r.depth;
  for (; i > 0 && o > 0 && r.indexAfter(o) == r.node(o).childCount; )
    o--, i--;
  if (i > 0) {
    let s = r.node(o).maybeChild(r.indexAfter(o));
    for (; i > 0; ) {
      if (!s || s.isLeaf)
        return !0;
      s = s.firstChild, i--;
    }
  }
  return !1;
}
function vp(t, e, n, r) {
  let i = [], o = [], s, u;
  t.doc.nodesBetween(e, n, (l, a, c) => {
    if (!l.isInline)
      return;
    let d = l.marks;
    if (!r.isInSet(d) && c.type.allowsMarkType(r.type)) {
      let f = Math.max(a, e), h = Math.min(a + l.nodeSize, n), p = r.addToSet(d);
      for (let m = 0; m < d.length; m++)
        d[m].isInSet(p) || (s && s.to == f && s.mark.eq(d[m]) ? s.to = h : i.push(s = new Ie(f, h, d[m])));
      u && u.to == f ? u.to = h : o.push(u = new kt(f, h, r));
    }
  }), i.forEach((l) => t.step(l)), o.forEach((l) => t.step(l));
}
function Mp(t, e, n, r) {
  let i = [], o = 0;
  t.doc.nodesBetween(e, n, (s, u) => {
    if (!s.isInline)
      return;
    o++;
    let l = null;
    if (r instanceof $i) {
      let a = s.marks, c;
      for (; c = r.isInSet(a); )
        (l || (l = [])).push(c), a = c.removeFromSet(a);
    } else r ? r.isInSet(s.marks) && (l = [r]) : l = s.marks;
    if (l && l.length) {
      let a = Math.min(u + s.nodeSize, n);
      for (let c = 0; c < l.length; c++) {
        let d = l[c], f;
        for (let h = 0; h < i.length; h++) {
          let p = i[h];
          p.step == o - 1 && d.eq(i[h].style) && (f = p);
        }
        f ? (f.to = a, f.step = o) : i.push({ style: d, from: Math.max(u, e), to: a, step: o });
      }
    }
  }), i.forEach((s) => t.step(new Ie(s.from, s.to, s.style)));
}
function Vs(t, e, n, r = n.contentMatch, i = !0) {
  let o = t.doc.nodeAt(e), s = [], u = e + 1;
  for (let l = 0; l < o.childCount; l++) {
    let a = o.child(l), c = u + a.nodeSize, d = r.matchType(a.type);
    if (!d)
      s.push(new te(u, c, v.empty));
    else {
      r = d;
      for (let f = 0; f < a.marks.length; f++)
        n.allowsMarkType(a.marks[f].type) || t.step(new Ie(u, c, a.marks[f]));
      if (i && a.isText && n.whitespace != "pre") {
        let f, h = /\r?\n|\r/g, p;
        for (; f = h.exec(a.text); )
          p || (p = new v(w.from(n.schema.text(" ", n.allowedMarks(a.marks))), 0, 0)), s.push(new te(u + f.index, u + f.index + f[0].length, p));
      }
    }
    u = c;
  }
  if (!r.validEnd) {
    let l = r.fillBefore(w.empty, !0);
    t.replace(u, u, new v(l, 0, 0));
  }
  for (let l = s.length - 1; l >= 0; l--)
    t.step(s[l]);
}
function Tp(t, e, n) {
  return (e == 0 || t.canReplace(e, t.childCount)) && (n == t.childCount || t.canReplace(0, n));
}
function Cn(t) {
  let n = t.parent.content.cutByIndex(t.startIndex, t.endIndex);
  for (let r = t.depth, i = 0, o = 0; ; --r) {
    let s = t.$from.node(r), u = t.$from.index(r) + i, l = t.$to.indexAfter(r) - o;
    if (r < t.depth && s.canReplace(u, l, n))
      return r;
    if (r == 0 || s.type.spec.isolating || !Tp(s, u, l))
      break;
    u && (i = 1), l < s.childCount && (o = 1);
  }
  return null;
}
function _p(t, e, n) {
  let { $from: r, $to: i, depth: o } = e, s = r.before(o + 1), u = i.after(o + 1), l = s, a = u, c = w.empty, d = 0;
  for (let p = o, m = !1; p > n; p--)
    m || r.index(p) > 0 ? (m = !0, c = w.from(r.node(p).copy(c)), d++) : l--;
  let f = w.empty, h = 0;
  for (let p = o, m = !1; p > n; p--)
    m || i.after(p + 1) < i.end(p) ? (m = !0, f = w.from(i.node(p).copy(f)), h++) : a++;
  t.step(new ie(l, a, s, u, new v(c.append(f), d, h), c.size - d, !0));
}
function js(t, e, n = null, r = t) {
  let i = Dp(t, e), o = i && Op(r, e);
  return o ? i.map(el).concat({ type: e, attrs: n }).concat(o.map(el)) : null;
}
function el(t) {
  return { type: t, attrs: null };
}
function Dp(t, e) {
  let { parent: n, startIndex: r, endIndex: i } = t, o = n.contentMatchAt(r).findWrapping(e);
  if (!o)
    return null;
  let s = o.length ? o[0] : e;
  return n.canReplaceWith(r, i, s) ? o : null;
}
function Op(t, e) {
  let { parent: n, startIndex: r, endIndex: i } = t, o = n.child(r), s = e.contentMatch.findWrapping(o.type);
  if (!s)
    return null;
  let l = (s.length ? s[s.length - 1] : e).contentMatch;
  for (let a = r; l && a < i; a++)
    l = l.matchType(n.child(a).type);
  return !l || !l.validEnd ? null : s;
}
function Np(t, e, n) {
  let r = w.empty;
  for (let s = n.length - 1; s >= 0; s--) {
    if (r.size) {
      let u = n[s].type.contentMatch.matchFragment(r);
      if (!u || !u.validEnd)
        throw new RangeError("Wrapper type given to Transform.wrap does not form valid content of its parent wrapper");
    }
    r = w.from(n[s].type.create(n[s].attrs, r));
  }
  let i = e.start, o = e.end;
  t.step(new ie(i, o, i, o, new v(r, 0, 0), n.length, !0));
}
function Rp(t, e, n, r, i) {
  if (!r.isTextblock)
    throw new RangeError("Type given to setBlockType should be a textblock");
  let o = t.steps.length;
  t.doc.nodesBetween(e, n, (s, u) => {
    let l = typeof i == "function" ? i(s) : i;
    if (s.isTextblock && !s.hasMarkup(r, l) && Ip(t.doc, t.mapping.slice(o).map(u), r)) {
      let a = null;
      if (r.schema.linebreakReplacement) {
        let h = r.whitespace == "pre", p = !!r.contentMatch.matchType(r.schema.linebreakReplacement);
        h && !p ? a = !1 : !h && p && (a = !0);
      }
      a === !1 && Lc(t, s, u, o), Vs(t, t.mapping.slice(o).map(u, 1), r, void 0, a === null);
      let c = t.mapping.slice(o), d = c.map(u, 1), f = c.map(u + s.nodeSize, 1);
      return t.step(new ie(d, f, d + 1, f - 1, new v(w.from(r.create(l, null, s.marks)), 0, 0), 1, !0)), a === !0 && Ic(t, s, u, o), !1;
    }
  });
}
function Ic(t, e, n, r) {
  e.forEach((i, o) => {
    if (i.isText) {
      let s, u = /\r?\n|\r/g;
      for (; s = u.exec(i.text); ) {
        let l = t.mapping.slice(r).map(n + 1 + o + s.index);
        t.replaceWith(l, l + 1, e.type.schema.linebreakReplacement.create());
      }
    }
  });
}
function Lc(t, e, n, r) {
  e.forEach((i, o) => {
    if (i.type == i.type.schema.linebreakReplacement) {
      let s = t.mapping.slice(r).map(n + 1 + o);
      t.replaceWith(s, s + 1, e.type.schema.text(`
`));
    }
  });
}
function Ip(t, e, n) {
  let r = t.resolve(e), i = r.index();
  return r.parent.canReplaceWith(i, i + 1, n);
}
function Lp(t, e, n, r, i) {
  let o = t.doc.nodeAt(e);
  if (!o)
    throw new RangeError("No node at given position");
  n || (n = o.type);
  let s = n.create(r, null, i || o.marks);
  if (o.isLeaf)
    return t.replaceWith(e, e + o.nodeSize, s);
  if (!n.validContent(o.content))
    throw new RangeError("Invalid content for node type " + n.name);
  t.step(new ie(e, e + o.nodeSize, e + 1, e + o.nodeSize - 1, new v(w.from(s), 0, 0), 1, !0));
}
function it(t, e, n = 1, r) {
  let i = t.resolve(e), o = i.depth - n, s = r && r[r.length - 1] || i.parent;
  if (o < 0 || i.parent.type.spec.isolating || !i.parent.canReplace(i.index(), i.parent.childCount) || !s.type.validContent(i.parent.content.cutByIndex(i.index(), i.parent.childCount)))
    return !1;
  for (let a = i.depth - 1, c = n - 2; a > o; a--, c--) {
    let d = i.node(a), f = i.index(a);
    if (d.type.spec.isolating)
      return !1;
    let h = d.content.cutByIndex(f, d.childCount), p = r && r[c + 1];
    p && (h = h.replaceChild(0, p.type.create(p.attrs)));
    let m = r && r[c] || d;
    if (!d.canReplace(f + 1, d.childCount) || !m.type.validContent(h))
      return !1;
  }
  let u = i.indexAfter(o), l = r && r[0];
  return i.node(o).canReplaceWith(u, u, l ? l.type : i.node(o + 1).type);
}
function Fp(t, e, n = 1, r) {
  let i = t.doc.resolve(e), o = w.empty, s = w.empty;
  for (let u = i.depth, l = i.depth - n, a = n - 1; u > l; u--, a--) {
    o = w.from(i.node(u).copy(o));
    let c = r && r[a];
    s = w.from(c ? c.type.create(c.attrs, s) : i.node(u).copy(s));
  }
  t.step(new te(e, e, new v(o.append(s), n, n), !0));
}
function Dt(t, e) {
  let n = t.resolve(e), r = n.index();
  return Fc(n.nodeBefore, n.nodeAfter) && n.parent.canReplace(r, r + 1);
}
function Pp(t, e) {
  e.content.size || t.type.compatibleContent(e.type);
  let n = t.contentMatchAt(t.childCount), { linebreakReplacement: r } = t.type.schema;
  for (let i = 0; i < e.childCount; i++) {
    let o = e.child(i), s = o.type == r ? t.type.schema.nodes.text : o.type;
    if (n = n.matchType(s), !n || !t.type.allowsMarks(o.marks))
      return !1;
  }
  return n.validEnd;
}
function Fc(t, e) {
  return !!(t && e && !t.isLeaf && Pp(t, e));
}
function Hi(t, e, n = -1) {
  let r = t.resolve(e);
  for (let i = r.depth; ; i--) {
    let o, s, u = r.index(i);
    if (i == r.depth ? (o = r.nodeBefore, s = r.nodeAfter) : n > 0 ? (o = r.node(i + 1), u++, s = r.node(i).maybeChild(u)) : (o = r.node(i).maybeChild(u - 1), s = r.node(i + 1)), o && !o.isTextblock && Fc(o, s) && r.node(i).canReplace(u, u + 1))
      return e;
    if (i == 0)
      break;
    e = n < 0 ? r.before(i) : r.after(i);
  }
}
function Bp(t, e, n) {
  let r = null, { linebreakReplacement: i } = t.doc.type.schema, o = t.doc.resolve(e - n), s = o.node().type;
  if (i && s.inlineContent) {
    let c = s.whitespace == "pre", d = !!s.contentMatch.matchType(i);
    c && !d ? r = !1 : !c && d && (r = !0);
  }
  let u = t.steps.length;
  if (r === !1) {
    let c = t.doc.resolve(e + n);
    Lc(t, c.node(), c.before(), u);
  }
  s.inlineContent && Vs(t, e + n - 1, s, o.node().contentMatchAt(o.index()), r == null);
  let l = t.mapping.slice(u), a = l.map(e - n);
  if (t.step(new te(a, l.map(e + n, -1), v.empty, !0)), r === !0) {
    let c = t.doc.resolve(a);
    Ic(t, c.node(), c.before(), t.steps.length);
  }
  return t;
}
function zp(t, e, n) {
  let r = t.resolve(e);
  if (r.parent.canReplaceWith(r.index(), r.index(), n))
    return e;
  if (r.parentOffset == 0)
    for (let i = r.depth - 1; i >= 0; i--) {
      let o = r.index(i);
      if (r.node(i).canReplaceWith(o, o, n))
        return r.before(i + 1);
      if (o > 0)
        return null;
    }
  if (r.parentOffset == r.parent.content.size)
    for (let i = r.depth - 1; i >= 0; i--) {
      let o = r.indexAfter(i);
      if (r.node(i).canReplaceWith(o, o, n))
        return r.after(i + 1);
      if (o < r.node(i).childCount)
        return null;
    }
  return null;
}
function Pc(t, e, n) {
  let r = t.resolve(e);
  if (!n.content.size)
    return e;
  let i = n.content;
  for (let o = 0; o < n.openStart; o++)
    i = i.firstChild.content;
  for (let o = 1; o <= (n.openStart == 0 && n.size ? 2 : 1); o++)
    for (let s = r.depth; s >= 0; s--) {
      let u = s == r.depth ? 0 : r.pos <= (r.start(s + 1) + r.end(s + 1)) / 2 ? -1 : 1, l = r.index(s) + (u > 0 ? 1 : 0), a = r.node(s), c = !1;
      if (o == 1)
        c = a.canReplace(l, l, i);
      else {
        let d = a.contentMatchAt(l).findWrapping(i.firstChild.type);
        c = d && a.canReplaceWith(l, l, d[0]);
      }
      if (c)
        return u == 0 ? r.pos : u < 0 ? r.before(s + 1) : r.after(s + 1);
    }
  return null;
}
function Vi(t, e, n = e, r = v.empty) {
  if (e == n && !r.size)
    return null;
  let i = t.resolve(e), o = t.resolve(n);
  return Bc(i, o, r) ? new te(e, n, r) : new $p(i, o, r).fit();
}
function Bc(t, e, n) {
  return !n.openStart && !n.openEnd && t.start() == e.start() && t.parent.canReplace(t.index(), e.index(), n.content);
}
class $p {
  constructor(e, n, r) {
    this.$from = e, this.$to = n, this.unplaced = r, this.frontier = [], this.placed = w.empty;
    for (let i = 0; i <= e.depth; i++) {
      let o = e.node(i);
      this.frontier.push({
        type: o.type,
        match: o.contentMatchAt(e.indexAfter(i))
      });
    }
    for (let i = e.depth; i > 0; i--)
      this.placed = w.from(e.node(i).copy(this.placed));
  }
  get depth() {
    return this.frontier.length - 1;
  }
  fit() {
    for (; this.unplaced.size; ) {
      let a = this.findFittable();
      a ? this.placeNodes(a) : this.openMore() || this.dropNode();
    }
    let e = this.mustMoveInline(), n = this.placed.size - this.depth - this.$from.depth, r = this.$from, i = this.close(e < 0 ? this.$to : r.doc.resolve(e));
    if (!i)
      return null;
    let o = this.placed, s = r.depth, u = i.depth;
    for (; s && u && o.childCount == 1; )
      o = o.firstChild.content, s--, u--;
    let l = new v(o, s, u);
    return e > -1 ? new ie(r.pos, e, this.$to.pos, this.$to.end(), l, n) : l.size || r.pos != this.$to.pos ? new te(r.pos, i.pos, l) : null;
  }
  // Find a position on the start spine of `this.unplaced` that has
  // content that can be moved somewhere on the frontier. Returns two
  // depths, one for the slice and one for the frontier.
  findFittable() {
    let e = this.unplaced.openStart;
    for (let n = this.unplaced.content, r = 0, i = this.unplaced.openEnd; r < e; r++) {
      let o = n.firstChild;
      if (n.childCount > 1 && (i = 0), o.type.spec.isolating && i <= r) {
        e = r;
        break;
      }
      n = o.content;
    }
    for (let n = 1; n <= 2; n++)
      for (let r = n == 1 ? e : this.unplaced.openStart; r >= 0; r--) {
        let i, o = null;
        r ? (o = ho(this.unplaced.content, r - 1).firstChild, i = o.content) : i = this.unplaced.content;
        let s = i.firstChild;
        for (let u = this.depth; u >= 0; u--) {
          let { type: l, match: a } = this.frontier[u], c, d = null;
          if (n == 1 && (s ? a.matchType(s.type) || (d = a.fillBefore(w.from(s), !1)) : o && l.compatibleContent(o.type)))
            return { sliceDepth: r, frontierDepth: u, parent: o, inject: d };
          if (n == 2 && s && (c = a.findWrapping(s.type)))
            return { sliceDepth: r, frontierDepth: u, parent: o, wrap: c };
          if (o && a.matchType(o.type))
            break;
        }
      }
  }
  openMore() {
    let { content: e, openStart: n, openEnd: r } = this.unplaced, i = ho(e, n);
    return !i.childCount || i.firstChild.isLeaf ? !1 : (this.unplaced = new v(e, n + 1, Math.max(r, i.size + n >= e.size - r ? n + 1 : 0)), !0);
  }
  dropNode() {
    let { content: e, openStart: n, openEnd: r } = this.unplaced, i = ho(e, n);
    if (i.childCount <= 1 && n > 0) {
      let o = e.size - n <= n + i.size;
      this.unplaced = new v(Dn(e, n - 1, 1), n - 1, o ? n - 1 : r);
    } else
      this.unplaced = new v(Dn(e, n, 1), n, r);
  }
  // Move content from the unplaced slice at `sliceDepth` to the
  // frontier node at `frontierDepth`. Close that frontier node when
  // applicable.
  placeNodes({ sliceDepth: e, frontierDepth: n, parent: r, inject: i, wrap: o }) {
    for (; this.depth > n; )
      this.closeFrontierNode();
    if (o)
      for (let m = 0; m < o.length; m++)
        this.openFrontierNode(o[m]);
    let s = this.unplaced, u = r ? r.content : s.content, l = s.openStart - e, a = 0, c = [], { match: d, type: f } = this.frontier[n];
    if (i) {
      for (let m = 0; m < i.childCount; m++)
        c.push(i.child(m));
      d = d.matchFragment(i);
    }
    let h = u.size + e - (s.content.size - s.openEnd);
    for (; a < u.childCount; ) {
      let m = u.child(a), g = d.matchType(m.type);
      if (!g)
        break;
      a++, (a > 1 || l == 0 || m.content.size) && (d = g, c.push(zc(m.mark(f.allowedMarks(m.marks)), a == 1 ? l : 0, a == u.childCount ? h : -1)));
    }
    let p = a == u.childCount;
    p || (h = -1), this.placed = On(this.placed, n, w.from(c)), this.frontier[n].match = d, p && h < 0 && r && r.type == this.frontier[this.depth].type && this.frontier.length > 1 && this.closeFrontierNode();
    for (let m = 0, g = u; m < h; m++) {
      let b = g.lastChild;
      this.frontier.push({ type: b.type, match: b.contentMatchAt(b.childCount) }), g = b.content;
    }
    this.unplaced = p ? e == 0 ? v.empty : new v(Dn(s.content, e - 1, 1), e - 1, h < 0 ? s.openEnd : e - 1) : new v(Dn(s.content, e, a), s.openStart, s.openEnd);
  }
  mustMoveInline() {
    if (!this.$to.parent.isTextblock)
      return -1;
    let e = this.frontier[this.depth], n;
    if (!e.type.isTextblock || !po(this.$to, this.$to.depth, e.type, e.match, !1) || this.$to.depth == this.depth && (n = this.findCloseLevel(this.$to)) && n.depth == this.depth)
      return -1;
    let { depth: r } = this.$to, i = this.$to.after(r);
    for (; r > 1 && i == this.$to.end(--r); )
      ++i;
    return i;
  }
  findCloseLevel(e) {
    e: for (let n = Math.min(this.depth, e.depth); n >= 0; n--) {
      let { match: r, type: i } = this.frontier[n], o = n < e.depth && e.end(n + 1) == e.pos + (e.depth - (n + 1)), s = po(e, n, i, r, o);
      if (s) {
        for (let u = n - 1; u >= 0; u--) {
          let { match: l, type: a } = this.frontier[u], c = po(e, u, a, l, !0);
          if (!c || c.childCount)
            continue e;
        }
        return { depth: n, fit: s, move: o ? e.doc.resolve(e.after(n + 1)) : e };
      }
    }
  }
  close(e) {
    let n = this.findCloseLevel(e);
    if (!n)
      return null;
    for (; this.depth > n.depth; )
      this.closeFrontierNode();
    n.fit.childCount && (this.placed = On(this.placed, n.depth, n.fit)), e = n.move;
    for (let r = n.depth + 1; r <= e.depth; r++) {
      let i = e.node(r), o = i.type.contentMatch.fillBefore(i.content, !0, e.index(r));
      this.openFrontierNode(i.type, i.attrs, o);
    }
    return e;
  }
  openFrontierNode(e, n = null, r) {
    let i = this.frontier[this.depth];
    i.match = i.match.matchType(e), this.placed = On(this.placed, this.depth, w.from(e.create(n, r))), this.frontier.push({ type: e, match: e.contentMatch });
  }
  closeFrontierNode() {
    let n = this.frontier.pop().match.fillBefore(w.empty, !0);
    n.childCount && (this.placed = On(this.placed, this.frontier.length, n));
  }
}
function Dn(t, e, n) {
  return e == 0 ? t.cutByIndex(n, t.childCount) : t.replaceChild(0, t.firstChild.copy(Dn(t.firstChild.content, e - 1, n)));
}
function On(t, e, n) {
  return e == 0 ? t.append(n) : t.replaceChild(t.childCount - 1, t.lastChild.copy(On(t.lastChild.content, e - 1, n)));
}
function ho(t, e) {
  for (let n = 0; n < e; n++)
    t = t.firstChild.content;
  return t;
}
function zc(t, e, n) {
  if (e <= 0)
    return t;
  let r = t.content;
  return e > 1 && (r = r.replaceChild(0, zc(r.firstChild, e - 1, r.childCount == 1 ? n - 1 : 0))), e > 0 && (r = t.type.contentMatch.fillBefore(r).append(r), n <= 0 && (r = r.append(t.type.contentMatch.matchFragment(r).fillBefore(w.empty, !0)))), t.copy(r);
}
function po(t, e, n, r, i) {
  let o = t.node(e), s = i ? t.indexAfter(e) : t.index(e);
  if (s == o.childCount && !n.compatibleContent(o.type))
    return null;
  let u = r.fillBefore(o.content, !0, s);
  return u && !Hp(n, o.content, s) ? u : null;
}
function Hp(t, e, n) {
  for (let r = n; r < e.childCount; r++)
    if (!t.allowsMarks(e.child(r).marks))
      return !0;
  return !1;
}
function Vp(t) {
  return t.spec.defining || t.spec.definingForContent;
}
function jp(t, e, n, r) {
  if (!r.size)
    return t.deleteRange(e, n);
  let i = t.doc.resolve(e), o = t.doc.resolve(n);
  if (Bc(i, o, r))
    return t.step(new te(e, n, r));
  let s = Hc(i, o);
  s[s.length - 1] == 0 && s.pop();
  let u = -(i.depth + 1);
  s.unshift(u);
  for (let f = i.depth, h = i.pos - 1; f > 0; f--, h--) {
    let p = i.node(f).type.spec;
    if (p.defining || p.definingAsContext || p.isolating)
      break;
    s.indexOf(f) > -1 ? u = f : i.before(f) == h && s.splice(1, 0, -f);
  }
  let l = s.indexOf(u), a = [], c = r.openStart;
  for (let f = r.content, h = 0; ; h++) {
    let p = f.firstChild;
    if (a.push(p), h == r.openStart)
      break;
    f = p.content;
  }
  for (let f = c - 1; f >= 0; f--) {
    let h = a[f], p = Vp(h.type);
    if (p && !h.sameMarkup(i.node(Math.abs(u) - 1)))
      c = f;
    else if (p || !h.type.isTextblock)
      break;
  }
  for (let f = r.openStart; f >= 0; f--) {
    let h = (f + c + 1) % (r.openStart + 1), p = a[h];
    if (p)
      for (let m = 0; m < s.length; m++) {
        let g = s[(m + l) % s.length], b = !0;
        g < 0 && (b = !1, g = -g);
        let y = i.node(g - 1), k = i.index(g - 1);
        if (y.canReplaceWith(k, k, p.type, p.marks))
          return t.replace(i.before(g), b ? o.after(g) : n, new v($c(r.content, 0, r.openStart, h), h, r.openEnd));
      }
  }
  let d = t.steps.length;
  for (let f = s.length - 1; f >= 0 && (t.replace(e, n, r), !(t.steps.length > d)); f--) {
    let h = s[f];
    h < 0 || (e = i.before(h), n = o.after(h));
  }
}
function $c(t, e, n, r, i) {
  if (e < n) {
    let o = t.firstChild;
    t = t.replaceChild(0, o.copy($c(o.content, e + 1, n, r, o)));
  }
  if (e > r) {
    let o = i.contentMatchAt(0), s = o.fillBefore(t).append(t);
    t = s.append(o.matchFragment(s).fillBefore(w.empty, !0));
  }
  return t;
}
function qp(t, e, n, r) {
  if (!r.isInline && e == n && t.doc.resolve(e).parent.content.size) {
    let i = zp(t.doc, e, r.type);
    i != null && (e = n = i);
  }
  t.replaceRange(e, n, new v(w.from(r), 0, 0));
}
function Wp(t, e, n) {
  let r = t.doc.resolve(e), i = t.doc.resolve(n), o = Hc(r, i);
  for (let s = 0; s < o.length; s++) {
    let u = o[s], l = s == o.length - 1;
    if (l && u == 0 || r.node(u).type.contentMatch.validEnd)
      return t.delete(r.start(u), i.end(u));
    if (u > 0 && (l || r.node(u - 1).canReplace(r.index(u - 1), i.indexAfter(u - 1))))
      return t.delete(r.before(u), i.after(u));
  }
  for (let s = 1; s <= r.depth && s <= i.depth; s++)
    if (e - r.start(s) == r.depth - s && n > r.end(s) && i.end(s) - n != i.depth - s && r.start(s - 1) == i.start(s - 1) && r.node(s - 1).canReplace(r.index(s - 1), i.index(s - 1)))
      return t.delete(r.before(s), n);
  t.delete(e, n);
}
function Hc(t, e) {
  let n = [], r = Math.min(t.depth, e.depth);
  for (let i = r; i >= 0; i--) {
    let o = t.start(i);
    if (o < t.pos - (t.depth - i) || e.end(i) > e.pos + (e.depth - i) || t.node(i).type.spec.isolating || e.node(i).type.spec.isolating)
      break;
    (o == e.start(i) || i == t.depth && i == e.depth && t.parent.inlineContent && e.parent.inlineContent && i && e.start(i - 1) == o - 1) && n.push(i);
  }
  return n;
}
class an extends he {
  /**
  Construct an attribute step.
  */
  constructor(e, n, r) {
    super(), this.pos = e, this.attr = n, this.value = r;
  }
  apply(e) {
    let n = e.nodeAt(this.pos);
    if (!n)
      return Z.fail("No node at attribute step's position");
    let r = /* @__PURE__ */ Object.create(null);
    for (let o in n.attrs)
      r[o] = n.attrs[o];
    r[this.attr] = this.value;
    let i = n.type.create(r, null, n.marks);
    return Z.fromReplace(e, this.pos, this.pos + 1, new v(w.from(i), 0, n.isLeaf ? 0 : 1));
  }
  getMap() {
    return Ce.empty;
  }
  invert(e) {
    return new an(this.pos, this.attr, e.nodeAt(this.pos).attrs[this.attr]);
  }
  map(e) {
    let n = e.mapResult(this.pos, 1);
    return n.deletedAfter ? null : new an(n.pos, this.attr, this.value);
  }
  toJSON() {
    return { stepType: "attr", pos: this.pos, attr: this.attr, value: this.value };
  }
  static fromJSON(e, n) {
    if (typeof n.pos != "number" || typeof n.attr != "string")
      throw new RangeError("Invalid input for AttrStep.fromJSON");
    return new an(n.pos, n.attr, n.value);
  }
}
he.jsonID("attr", an);
class Zn extends he {
  /**
  Construct an attribute step.
  */
  constructor(e, n) {
    super(), this.attr = e, this.value = n;
  }
  apply(e) {
    let n = /* @__PURE__ */ Object.create(null);
    for (let i in e.attrs)
      n[i] = e.attrs[i];
    n[this.attr] = this.value;
    let r = e.type.create(n, e.content, e.marks);
    return Z.ok(r);
  }
  getMap() {
    return Ce.empty;
  }
  invert(e) {
    return new Zn(this.attr, e.attrs[this.attr]);
  }
  map(e) {
    return this;
  }
  toJSON() {
    return { stepType: "docAttr", attr: this.attr, value: this.value };
  }
  static fromJSON(e, n) {
    if (typeof n.attr != "string")
      throw new RangeError("Invalid input for DocAttrStep.fromJSON");
    return new Zn(n.attr, n.value);
  }
}
he.jsonID("docAttr", Zn);
let fn = class extends Error {
};
fn = function t(e) {
  let n = Error.call(this, e);
  return n.__proto__ = t.prototype, n;
};
fn.prototype = Object.create(Error.prototype);
fn.prototype.constructor = fn;
fn.prototype.name = "TransformError";
class qs {
  /**
  Create a transform that starts with the given document.
  */
  constructor(e) {
    this.doc = e, this.steps = [], this.docs = [], this.mapping = new Gn();
  }
  /**
  The starting document.
  */
  get before() {
    return this.docs.length ? this.docs[0] : this.doc;
  }
  /**
  Apply a new step in this transform, saving the result. Throws an
  error when the step fails.
  */
  step(e) {
    let n = this.maybeStep(e);
    if (n.failed)
      throw new fn(n.failed);
    return this;
  }
  /**
  Try to apply a step in this transformation, ignoring it if it
  fails. Returns the step result.
  */
  maybeStep(e) {
    let n = e.apply(this.doc);
    return n.failed || this.addStep(e, n.doc), n;
  }
  /**
  True when the document has been changed (when there are any
  steps).
  */
  get docChanged() {
    return this.steps.length > 0;
  }
  /**
  Return a single range, in post-transform document positions,
  that covers all content changed by this transform. Returns null
  if no replacements are made. Note that this will ignore changes
  that add/remove marks without replacing the underlying content.
  */
  changedRange() {
    let e = 1e9, n = -1e9;
    for (let r = 0; r < this.mapping.maps.length; r++) {
      let i = this.mapping.maps[r];
      r && (e = i.map(e, 1), n = i.map(n, -1)), i.forEach((o, s, u, l) => {
        e = Math.min(e, u), n = Math.max(n, l);
      });
    }
    return e == 1e9 ? null : { from: e, to: n };
  }
  /**
  @internal
  */
  addStep(e, n) {
    this.docs.push(this.doc), this.steps.push(e), this.mapping.appendMap(e.getMap()), this.doc = n;
  }
  /**
  Replace the part of the document between `from` and `to` with the
  given `slice`.
  */
  replace(e, n = e, r = v.empty) {
    let i = Vi(this.doc, e, n, r);
    return i && this.step(i), this;
  }
  /**
  Replace the given range with the given content, which may be a
  fragment, node, or array of nodes.
  */
  replaceWith(e, n, r) {
    return this.replace(e, n, new v(w.from(r), 0, 0));
  }
  /**
  Delete the content between the given positions.
  */
  delete(e, n) {
    return this.replace(e, n, v.empty);
  }
  /**
  Insert the given content at the given position.
  */
  insert(e, n) {
    return this.replaceWith(e, e, n);
  }
  /**
  Replace a range of the document with a given slice, using
  `from`, `to`, and the slice's
  [`openStart`](https://prosemirror.net/docs/ref/#model.Slice.openStart) property as hints, rather
  than fixed start and end points. This method may grow the
  replaced area or close open nodes in the slice in order to get a
  fit that is more in line with WYSIWYG expectations, by dropping
  fully covered parent nodes of the replaced region when they are
  marked [non-defining as
  context](https://prosemirror.net/docs/ref/#model.NodeSpec.definingAsContext), or including an
  open parent node from the slice that _is_ marked as [defining
  its content](https://prosemirror.net/docs/ref/#model.NodeSpec.definingForContent).
  
  This is the method, for example, to handle paste. The similar
  [`replace`](https://prosemirror.net/docs/ref/#transform.Transform.replace) method is a more
  primitive tool which will _not_ move the start and end of its given
  range, and is useful in situations where you need more precise
  control over what happens.
  */
  replaceRange(e, n, r) {
    return jp(this, e, n, r), this;
  }
  /**
  Replace the given range with a node, but use `from` and `to` as
  hints, rather than precise positions. When from and to are the same
  and are at the start or end of a parent node in which the given
  node doesn't fit, this method may _move_ them out towards a parent
  that does allow the given node to be placed. When the given range
  completely covers a parent node, this method may completely replace
  that parent node.
  */
  replaceRangeWith(e, n, r) {
    return qp(this, e, n, r), this;
  }
  /**
  Delete the given range, expanding it to cover fully covered
  parent nodes until a valid replace is found.
  */
  deleteRange(e, n) {
    return Wp(this, e, n), this;
  }
  /**
  Split the content in the given range off from its parent, if there
  is sibling content before or after it, and move it up the tree to
  the depth specified by `target`. You'll probably want to use
  [`liftTarget`](https://prosemirror.net/docs/ref/#transform.liftTarget) to compute `target`, to make
  sure the lift is valid.
  */
  lift(e, n) {
    return _p(this, e, n), this;
  }
  /**
  Join the blocks around the given position. If depth is 2, their
  last and first siblings are also joined, and so on.
  */
  join(e, n = 1) {
    return Bp(this, e, n), this;
  }
  /**
  Wrap the given [range](https://prosemirror.net/docs/ref/#model.NodeRange) in the given set of wrappers.
  The wrappers are assumed to be valid in this position, and should
  probably be computed with [`findWrapping`](https://prosemirror.net/docs/ref/#transform.findWrapping).
  */
  wrap(e, n) {
    return Np(this, e, n), this;
  }
  /**
  Set the type of all textblocks (partly) between `from` and `to` to
  the given node type with the given attributes.
  */
  setBlockType(e, n = e, r, i = null) {
    return Rp(this, e, n, r, i), this;
  }
  /**
  Change the type, attributes, and/or marks of the node at `pos`.
  When `type` isn't given, the existing node type is preserved,
  */
  setNodeMarkup(e, n, r = null, i) {
    return Lp(this, e, n, r, i), this;
  }
  /**
  Set a single attribute on a given node to a new value.
  The `pos` addresses the document content. Use `setDocAttribute`
  to set attributes on the document itself.
  */
  setNodeAttribute(e, n, r) {
    return this.step(new an(e, n, r)), this;
  }
  /**
  Set a single attribute on the document to a new value.
  */
  setDocAttribute(e, n) {
    return this.step(new Zn(e, n)), this;
  }
  /**
  Add a mark to the node at position `pos`.
  */
  addNodeMark(e, n) {
    return this.step(new xt(e, n)), this;
  }
  /**
  Remove a mark (or all marks of the given type) from the node at
  position `pos`.
  */
  removeNodeMark(e, n) {
    let r = this.doc.nodeAt(e);
    if (!r)
      throw new RangeError("No node at position " + e);
    if (n instanceof P)
      n.isInSet(r.marks) && this.step(new Ut(e, n));
    else {
      let i = r.marks, o, s = [];
      for (; o = n.isInSet(i); )
        s.push(new Ut(e, o)), i = o.removeFromSet(i);
      for (let u = s.length - 1; u >= 0; u--)
        this.step(s[u]);
    }
    return this;
  }
  /**
  Split the node at the given position, and optionally, if `depth` is
  greater than one, any number of nodes above that. By default, the
  parts split off will inherit the node type of the original node.
  This can be changed by passing an array of types and attributes to
  use after the split (with the outermost nodes coming first).
  */
  split(e, n = 1, r) {
    return Fp(this, e, n, r), this;
  }
  /**
  Add the given mark to the inline content between `from` and `to`.
  */
  addMark(e, n, r) {
    return vp(this, e, n, r), this;
  }
  /**
  Remove marks from inline nodes between `from` and `to`. When
  `mark` is a single mark, remove precisely that mark. When it is
  a mark type, remove all marks of that type. When it is null,
  remove all marks of any type.
  */
  removeMark(e, n, r) {
    return Mp(this, e, n, r), this;
  }
  /**
  Removes all marks and nodes from the content of the node at
  `pos` that don't match the given new parent node type. Accepts
  an optional starting [content match](https://prosemirror.net/docs/ref/#model.ContentMatch) as
  third argument.
  */
  clearIncompatible(e, n, r) {
    return Vs(this, e, n, r), this;
  }
}
const mo = /* @__PURE__ */ Object.create(null);
class O {
  /**
  Initialize a selection with the head and anchor and ranges. If no
  ranges are given, constructs a single range across `$anchor` and
  `$head`.
  */
  constructor(e, n, r) {
    this.$anchor = e, this.$head = n, this.ranges = r || [new Vc(e.min(n), e.max(n))];
  }
  /**
  The selection's anchor, as an unresolved position.
  */
  get anchor() {
    return this.$anchor.pos;
  }
  /**
  The selection's head.
  */
  get head() {
    return this.$head.pos;
  }
  /**
  The lower bound of the selection's main range.
  */
  get from() {
    return this.$from.pos;
  }
  /**
  The upper bound of the selection's main range.
  */
  get to() {
    return this.$to.pos;
  }
  /**
  The resolved lower  bound of the selection's main range.
  */
  get $from() {
    return this.ranges[0].$from;
  }
  /**
  The resolved upper bound of the selection's main range.
  */
  get $to() {
    return this.ranges[0].$to;
  }
  /**
  Indicates whether the selection contains any content.
  */
  get empty() {
    let e = this.ranges;
    for (let n = 0; n < e.length; n++)
      if (e[n].$from.pos != e[n].$to.pos)
        return !1;
    return !0;
  }
  /**
  Get the content of this selection as a slice.
  */
  content() {
    return this.$from.doc.slice(this.from, this.to, !0);
  }
  /**
  Replace the selection with a slice or, if no slice is given,
  delete the selection. Will append to the given transaction.
  */
  replace(e, n = v.empty) {
    let r = n.content.lastChild, i = null;
    for (let u = 0; u < n.openEnd; u++)
      i = r, r = r.lastChild;
    let o = e.steps.length, s = this.ranges;
    for (let u = 0; u < s.length; u++) {
      let { $from: l, $to: a } = s[u], c = e.mapping.slice(o);
      e.replaceRange(c.map(l.pos), c.map(a.pos), u ? v.empty : n), u == 0 && rl(e, o, (r ? r.isInline : i && i.isTextblock) ? -1 : 1);
    }
  }
  /**
  Replace the selection with the given node, appending the changes
  to the given transaction.
  */
  replaceWith(e, n) {
    let r = e.steps.length, i = this.ranges;
    for (let o = 0; o < i.length; o++) {
      let { $from: s, $to: u } = i[o], l = e.mapping.slice(r), a = l.map(s.pos), c = l.map(u.pos);
      o ? e.deleteRange(a, c) : (e.replaceRangeWith(a, c, n), rl(e, r, n.isInline ? -1 : 1));
    }
  }
  /**
  Find a valid cursor or leaf node selection starting at the given
  position and searching back if `dir` is negative, and forward if
  positive. When `textOnly` is true, only consider cursor
  selections. Will return null when no valid selection position is
  found.
  */
  static findFrom(e, n, r = !1) {
    let i = e.parent.inlineContent ? new D(e) : on(e.node(0), e.parent, e.pos, e.index(), n, r);
    if (i)
      return i;
    for (let o = e.depth - 1; o >= 0; o--) {
      let s = n < 0 ? on(e.node(0), e.node(o), e.before(o + 1), e.index(o), n, r) : on(e.node(0), e.node(o), e.after(o + 1), e.index(o) + 1, n, r);
      if (s)
        return s;
    }
    return null;
  }
  /**
  Find a valid cursor or leaf node selection near the given
  position. Searches forward first by default, but if `bias` is
  negative, it will search backwards first.
  */
  static near(e, n = 1) {
    return this.findFrom(e, n) || this.findFrom(e, -n) || new Ee(e.node(0));
  }
  /**
  Find the cursor or leaf node selection closest to the start of
  the given document. Will return an
  [`AllSelection`](https://prosemirror.net/docs/ref/#state.AllSelection) if no valid position
  exists.
  */
  static atStart(e) {
    return on(e, e, 0, 0, 1) || new Ee(e);
  }
  /**
  Find the cursor or leaf node selection closest to the end of the
  given document.
  */
  static atEnd(e) {
    return on(e, e, e.content.size, e.childCount, -1) || new Ee(e);
  }
  /**
  Deserialize the JSON representation of a selection. Must be
  implemented for custom classes (as a static class method).
  */
  static fromJSON(e, n) {
    if (!n || !n.type)
      throw new RangeError("Invalid input for Selection.fromJSON");
    let r = mo[n.type];
    if (!r)
      throw new RangeError(`No selection type ${n.type} defined`);
    return r.fromJSON(e, n);
  }
  /**
  To be able to deserialize selections from JSON, custom selection
  classes must register themselves with an ID string, so that they
  can be disambiguated. Try to pick something that's unlikely to
  clash with classes from other modules.
  */
  static jsonID(e, n) {
    if (e in mo)
      throw new RangeError("Duplicate use of selection JSON ID " + e);
    return mo[e] = n, n.prototype.jsonID = e, n;
  }
  /**
  Get a [bookmark](https://prosemirror.net/docs/ref/#state.SelectionBookmark) for this selection,
  which is a value that can be mapped without having access to a
  current document, and later resolved to a real selection for a
  given document again. (This is used mostly by the history to
  track and restore old selections.) The default implementation of
  this method just converts the selection to a text selection and
  returns the bookmark for that.
  */
  getBookmark() {
    return D.between(this.$anchor, this.$head).getBookmark();
  }
}
O.prototype.visible = !0;
class Vc {
  /**
  Create a range.
  */
  constructor(e, n) {
    this.$from = e, this.$to = n;
  }
}
let tl = !1;
function nl(t) {
  !tl && !t.parent.inlineContent && (tl = !0, console.warn("TextSelection endpoint not pointing into a node with inline content (" + t.parent.type.name + ")"));
}
class D extends O {
  /**
  Construct a text selection between the given points.
  */
  constructor(e, n = e) {
    nl(e), nl(n), super(e, n);
  }
  /**
  Returns a resolved position if this is a cursor selection (an
  empty text selection), and null otherwise.
  */
  get $cursor() {
    return this.$anchor.pos == this.$head.pos ? this.$head : null;
  }
  map(e, n) {
    let r = e.resolve(n.map(this.head));
    if (!r.parent.inlineContent)
      return O.near(r);
    let i = e.resolve(n.map(this.anchor));
    return new D(i.parent.inlineContent ? i : r, r);
  }
  replace(e, n = v.empty) {
    if (super.replace(e, n), n == v.empty) {
      let r = this.$from.marksAcross(this.$to);
      r && e.ensureMarks(r);
    }
  }
  eq(e) {
    return e instanceof D && e.anchor == this.anchor && e.head == this.head;
  }
  getBookmark() {
    return new ji(this.anchor, this.head);
  }
  toJSON() {
    return { type: "text", anchor: this.anchor, head: this.head };
  }
  /**
  @internal
  */
  static fromJSON(e, n) {
    if (typeof n.anchor != "number" || typeof n.head != "number")
      throw new RangeError("Invalid input for TextSelection.fromJSON");
    return new D(e.resolve(n.anchor), e.resolve(n.head));
  }
  /**
  Create a text selection from non-resolved positions.
  */
  static create(e, n, r = n) {
    let i = e.resolve(n);
    return new this(i, r == n ? i : e.resolve(r));
  }
  /**
  Return a text selection that spans the given positions or, if
  they aren't text positions, find a text selection near them.
  `bias` determines whether the method searches forward (default)
  or backwards (negative number) first. Will fall back to calling
  [`Selection.near`](https://prosemirror.net/docs/ref/#state.Selection^near) when the document
  doesn't contain a valid text position.
  */
  static between(e, n, r) {
    let i = e.pos - n.pos;
    if ((!r || i) && (r = i >= 0 ? 1 : -1), !n.parent.inlineContent) {
      let o = O.findFrom(n, r, !0) || O.findFrom(n, -r, !0);
      if (o)
        n = o.$head;
      else
        return O.near(n, r);
    }
    return e.parent.inlineContent || (i == 0 ? e = n : (e = (O.findFrom(e, -r, !0) || O.findFrom(e, r, !0)).$anchor, e.pos < n.pos != i < 0 && (e = n))), new D(e, n);
  }
}
O.jsonID("text", D);
class ji {
  constructor(e, n) {
    this.anchor = e, this.head = n;
  }
  map(e) {
    return new ji(e.map(this.anchor), e.map(this.head));
  }
  resolve(e) {
    return D.between(e.resolve(this.anchor), e.resolve(this.head));
  }
}
class _ extends O {
  /**
  Create a node selection. Does not verify the validity of its
  argument.
  */
  constructor(e) {
    let n = e.nodeAfter, r = e.node(0).resolve(e.pos + n.nodeSize);
    super(e, r), this.node = n;
  }
  map(e, n) {
    let { deleted: r, pos: i } = n.mapResult(this.anchor), o = e.resolve(i);
    return r ? O.near(o) : new _(o);
  }
  content() {
    return new v(w.from(this.node), 0, 0);
  }
  eq(e) {
    return e instanceof _ && e.anchor == this.anchor;
  }
  toJSON() {
    return { type: "node", anchor: this.anchor };
  }
  getBookmark() {
    return new Ws(this.anchor);
  }
  /**
  @internal
  */
  static fromJSON(e, n) {
    if (typeof n.anchor != "number")
      throw new RangeError("Invalid input for NodeSelection.fromJSON");
    return new _(e.resolve(n.anchor));
  }
  /**
  Create a node selection from non-resolved positions.
  */
  static create(e, n) {
    return new _(e.resolve(n));
  }
  /**
  Determines whether the given node may be selected as a node
  selection.
  */
  static isSelectable(e) {
    return !e.isText && e.type.spec.selectable !== !1;
  }
}
_.prototype.visible = !1;
O.jsonID("node", _);
class Ws {
  constructor(e) {
    this.anchor = e;
  }
  map(e) {
    let { deleted: n, pos: r } = e.mapResult(this.anchor);
    return n ? new ji(r, r) : new Ws(r);
  }
  resolve(e) {
    let n = e.resolve(this.anchor), r = n.nodeAfter;
    return r && _.isSelectable(r) ? new _(n) : O.near(n);
  }
}
class Ee extends O {
  /**
  Create an all-selection over the given document.
  */
  constructor(e) {
    super(e.resolve(0), e.resolve(e.content.size));
  }
  replace(e, n = v.empty) {
    if (n == v.empty) {
      e.delete(0, e.doc.content.size);
      let r = O.atStart(e.doc);
      r.eq(e.selection) || e.setSelection(r);
    } else
      super.replace(e, n);
  }
  toJSON() {
    return { type: "all" };
  }
  /**
  @internal
  */
  static fromJSON(e) {
    return new Ee(e);
  }
  map(e) {
    return new Ee(e);
  }
  eq(e) {
    return e instanceof Ee;
  }
  getBookmark() {
    return Up;
  }
}
O.jsonID("all", Ee);
const Up = {
  map() {
    return this;
  },
  resolve(t) {
    return new Ee(t);
  }
};
function on(t, e, n, r, i, o = !1) {
  if (e.inlineContent)
    return D.create(t, n);
  for (let s = r - (i > 0 ? 0 : 1); i > 0 ? s < e.childCount : s >= 0; s += i) {
    let u = e.child(s);
    if (u.isAtom) {
      if (!o && _.isSelectable(u))
        return _.create(t, n - (i < 0 ? u.nodeSize : 0));
    } else {
      let l = on(t, u, n + i, i < 0 ? u.childCount : 0, i, o);
      if (l)
        return l;
    }
    n += u.nodeSize * i;
  }
  return null;
}
function rl(t, e, n) {
  let r = t.steps.length - 1;
  if (r < e)
    return;
  let i = t.steps[r];
  if (!(i instanceof te || i instanceof ie))
    return;
  let o = t.mapping.maps[r], s;
  o.forEach((u, l, a, c) => {
    s == null && (s = c);
  }), t.setSelection(O.near(t.doc.resolve(s), n));
}
const il = 1, xr = 2, ol = 4;
class Kp extends qs {
  /**
  @internal
  */
  constructor(e) {
    super(e.doc), this.curSelectionFor = 0, this.updated = 0, this.meta = /* @__PURE__ */ Object.create(null), this.time = Date.now(), this.curSelection = e.selection, this.storedMarks = e.storedMarks;
  }
  /**
  The transaction's current selection. This defaults to the editor
  selection [mapped](https://prosemirror.net/docs/ref/#state.Selection.map) through the steps in the
  transaction, but can be overwritten with
  [`setSelection`](https://prosemirror.net/docs/ref/#state.Transaction.setSelection).
  */
  get selection() {
    return this.curSelectionFor < this.steps.length && (this.curSelection = this.curSelection.map(this.doc, this.mapping.slice(this.curSelectionFor)), this.curSelectionFor = this.steps.length), this.curSelection;
  }
  /**
  Update the transaction's current selection. Will determine the
  selection that the editor gets when the transaction is applied.
  */
  setSelection(e) {
    if (e.$from.doc != this.doc)
      throw new RangeError("Selection passed to setSelection must point at the current document");
    return this.curSelection = e, this.curSelectionFor = this.steps.length, this.updated = (this.updated | il) & ~xr, this.storedMarks = null, this;
  }
  /**
  Whether the selection was explicitly updated by this transaction.
  */
  get selectionSet() {
    return (this.updated & il) > 0;
  }
  /**
  Set the current stored marks.
  */
  setStoredMarks(e) {
    return this.storedMarks = e, this.updated |= xr, this;
  }
  /**
  Make sure the current stored marks or, if that is null, the marks
  at the selection, match the given set of marks. Does nothing if
  this is already the case.
  */
  ensureMarks(e) {
    return P.sameSet(this.storedMarks || this.selection.$from.marks(), e) || this.setStoredMarks(e), this;
  }
  /**
  Add a mark to the set of stored marks.
  */
  addStoredMark(e) {
    return this.ensureMarks(e.addToSet(this.storedMarks || this.selection.$head.marks()));
  }
  /**
  Remove a mark or mark type from the set of stored marks.
  */
  removeStoredMark(e) {
    return this.ensureMarks(e.removeFromSet(this.storedMarks || this.selection.$head.marks()));
  }
  /**
  Whether the stored marks were explicitly set for this transaction.
  */
  get storedMarksSet() {
    return (this.updated & xr) > 0;
  }
  /**
  @internal
  */
  addStep(e, n) {
    super.addStep(e, n), this.updated = this.updated & ~xr, this.storedMarks = null;
  }
  /**
  Update the timestamp for the transaction.
  */
  setTime(e) {
    return this.time = e, this;
  }
  /**
  Replace the current selection with the given slice.
  */
  replaceSelection(e) {
    return this.selection.replace(this, e), this;
  }
  /**
  Replace the selection with the given node. When `inheritMarks` is
  true and the content is inline, it inherits the marks from the
  place where it is inserted.
  */
  replaceSelectionWith(e, n = !0) {
    let r = this.selection;
    return n && (e = e.mark(this.storedMarks || (r.empty ? r.$from.marks() : r.$from.marksAcross(r.$to) || P.none))), r.replaceWith(this, e), this;
  }
  /**
  Delete the selection.
  */
  deleteSelection() {
    return this.selection.replace(this), this;
  }
  /**
  Replace the given range, or the selection if no range is given,
  with a text node containing the given string.
  */
  insertText(e, n, r) {
    let i = this.doc.type.schema;
    if (n == null)
      return e ? this.replaceSelectionWith(i.text(e), !0) : this.deleteSelection();
    {
      if (r == null && (r = n), !e)
        return this.deleteRange(n, r);
      let o = this.storedMarks;
      if (!o) {
        let s = this.doc.resolve(n);
        o = r == n ? s.marks() : s.marksAcross(this.doc.resolve(r));
      }
      return this.replaceRangeWith(n, r, i.text(e, o)), !this.selection.empty && this.selection.to == n + e.length && this.setSelection(O.near(this.selection.$to)), this;
    }
  }
  /**
  Store a metadata property in this transaction, keyed either by
  name or by plugin.
  */
  setMeta(e, n) {
    return this.meta[typeof e == "string" ? e : e.key] = n, this;
  }
  /**
  Retrieve a metadata property for a given name or plugin.
  */
  getMeta(e) {
    return this.meta[typeof e == "string" ? e : e.key];
  }
  /**
  Returns true if this transaction doesn't contain any metadata,
  and can thus safely be extended.
  */
  get isGeneric() {
    for (let e in this.meta)
      return !1;
    return !0;
  }
  /**
  Indicate that the editor should scroll the selection into view
  when updated to the state produced by this transaction.
  */
  scrollIntoView() {
    return this.updated |= ol, this;
  }
  /**
  True when this transaction has had `scrollIntoView` called on it.
  */
  get scrolledIntoView() {
    return (this.updated & ol) > 0;
  }
}
function sl(t, e) {
  return !e || !t ? t : t.bind(e);
}
class Nn {
  constructor(e, n, r) {
    this.name = e, this.init = sl(n.init, r), this.apply = sl(n.apply, r);
  }
}
const Jp = [
  new Nn("doc", {
    init(t) {
      return t.doc || t.schema.topNodeType.createAndFill();
    },
    apply(t) {
      return t.doc;
    }
  }),
  new Nn("selection", {
    init(t, e) {
      return t.selection || O.atStart(e.doc);
    },
    apply(t) {
      return t.selection;
    }
  }),
  new Nn("storedMarks", {
    init(t) {
      return t.storedMarks || null;
    },
    apply(t, e, n, r) {
      return r.selection.$cursor ? t.storedMarks : null;
    }
  }),
  new Nn("scrollToSelection", {
    init() {
      return 0;
    },
    apply(t, e) {
      return t.scrolledIntoView ? e + 1 : e;
    }
  })
];
class go {
  constructor(e, n) {
    this.schema = e, this.plugins = [], this.pluginsByKey = /* @__PURE__ */ Object.create(null), this.fields = Jp.slice(), n && n.forEach((r) => {
      if (this.pluginsByKey[r.key])
        throw new RangeError("Adding different instances of a keyed plugin (" + r.key + ")");
      this.plugins.push(r), this.pluginsByKey[r.key] = r, r.spec.state && this.fields.push(new Nn(r.key, r.spec.state, r));
    });
  }
}
class ln {
  /**
  @internal
  */
  constructor(e) {
    this.config = e;
  }
  /**
  The schema of the state's document.
  */
  get schema() {
    return this.config.schema;
  }
  /**
  The plugins that are active in this state.
  */
  get plugins() {
    return this.config.plugins;
  }
  /**
  Apply the given transaction to produce a new state.
  */
  apply(e) {
    return this.applyTransaction(e).state;
  }
  /**
  @internal
  */
  filterTransaction(e, n = -1) {
    for (let r = 0; r < this.config.plugins.length; r++)
      if (r != n) {
        let i = this.config.plugins[r];
        if (i.spec.filterTransaction && !i.spec.filterTransaction.call(i, e, this))
          return !1;
      }
    return !0;
  }
  /**
  Verbose variant of [`apply`](https://prosemirror.net/docs/ref/#state.EditorState.apply) that
  returns the precise transactions that were applied (which might
  be influenced by the [transaction
  hooks](https://prosemirror.net/docs/ref/#state.PluginSpec.filterTransaction) of
  plugins) along with the new state.
  */
  applyTransaction(e) {
    if (!this.filterTransaction(e))
      return { state: this, transactions: [] };
    let n = [e], r = this.applyInner(e), i = null;
    for (; ; ) {
      let o = !1;
      for (let s = 0; s < this.config.plugins.length; s++) {
        let u = this.config.plugins[s];
        if (u.spec.appendTransaction) {
          let l = i ? i[s].n : 0, a = i ? i[s].state : this, c = l < n.length && u.spec.appendTransaction.call(u, l ? n.slice(l) : n, a, r);
          if (c && r.filterTransaction(c, s)) {
            if (c.setMeta("appendedTransaction", e), !i) {
              i = [];
              for (let d = 0; d < this.config.plugins.length; d++)
                i.push(d < s ? { state: r, n: n.length } : { state: this, n: 0 });
            }
            n.push(c), r = r.applyInner(c), o = !0;
          }
          i && (i[s] = { state: r, n: n.length });
        }
      }
      if (!o)
        return { state: r, transactions: n };
    }
  }
  /**
  @internal
  */
  applyInner(e) {
    if (!e.before.eq(this.doc))
      throw new RangeError("Applying a mismatched transaction");
    let n = new ln(this.config), r = this.config.fields;
    for (let i = 0; i < r.length; i++) {
      let o = r[i];
      n[o.name] = o.apply(e, this[o.name], this, n);
    }
    return n;
  }
  /**
  Accessor that constructs and returns a new [transaction](https://prosemirror.net/docs/ref/#state.Transaction) from this state.
  */
  get tr() {
    return new Kp(this);
  }
  /**
  Create a new state.
  */
  static create(e) {
    let n = new go(e.doc ? e.doc.type.schema : e.schema, e.plugins), r = new ln(n);
    for (let i = 0; i < n.fields.length; i++)
      r[n.fields[i].name] = n.fields[i].init(e, r);
    return r;
  }
  /**
  Create a new state based on this one, but with an adjusted set
  of active plugins. State fields that exist in both sets of
  plugins are kept unchanged. Those that no longer exist are
  dropped, and those that are new are initialized using their
  [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method, passing in the new
  configuration object..
  */
  reconfigure(e) {
    let n = new go(this.schema, e.plugins), r = n.fields, i = new ln(n);
    for (let o = 0; o < r.length; o++) {
      let s = r[o].name;
      i[s] = this.hasOwnProperty(s) ? this[s] : r[o].init(e, i);
    }
    return i;
  }
  /**
  Serialize this state to JSON. If you want to serialize the state
  of plugins, pass an object mapping property names to use in the
  resulting JSON object to plugin objects. The argument may also be
  a string or number, in which case it is ignored, to support the
  way `JSON.stringify` calls `toString` methods.
  */
  toJSON(e) {
    let n = { doc: this.doc.toJSON(), selection: this.selection.toJSON() };
    if (this.storedMarks && (n.storedMarks = this.storedMarks.map((r) => r.toJSON())), e && typeof e == "object")
      for (let r in e) {
        if (r == "doc" || r == "selection")
          throw new RangeError("The JSON fields `doc` and `selection` are reserved");
        let i = e[r], o = i.spec.state;
        o && o.toJSON && (n[r] = o.toJSON.call(i, this[i.key]));
      }
    return n;
  }
  /**
  Deserialize a JSON representation of a state. `config` should
  have at least a `schema` field, and should contain array of
  plugins to initialize the state with. `pluginFields` can be used
  to deserialize the state of plugins, by associating plugin
  instances with the property names they use in the JSON object.
  */
  static fromJSON(e, n, r) {
    if (!n)
      throw new RangeError("Invalid input for EditorState.fromJSON");
    if (!e.schema)
      throw new RangeError("Required config field 'schema' missing");
    let i = new go(e.schema, e.plugins), o = new ln(i);
    return i.fields.forEach((s) => {
      if (s.name == "doc")
        o.doc = Et.fromJSON(e.schema, n.doc);
      else if (s.name == "selection")
        o.selection = O.fromJSON(o.doc, n.selection);
      else if (s.name == "storedMarks")
        n.storedMarks && (o.storedMarks = n.storedMarks.map(e.schema.markFromJSON));
      else {
        if (r)
          for (let u in r) {
            let l = r[u], a = l.spec.state;
            if (l.key == s.name && a && a.fromJSON && Object.prototype.hasOwnProperty.call(n, u)) {
              o[s.name] = a.fromJSON.call(l, e, n[u], o);
              return;
            }
          }
        o[s.name] = s.init(e, o);
      }
    }), o;
  }
}
function jc(t, e, n) {
  for (let r in t) {
    let i = t[r];
    i instanceof Function ? i = i.bind(e) : r == "handleDOMEvents" && (i = jc(i, e, {})), n[r] = i;
  }
  return n;
}
class H {
  /**
  Create a plugin.
  */
  constructor(e) {
    this.spec = e, this.props = {}, e.props && jc(e.props, this, this.props), this.key = e.key ? e.key.key : qc("plugin");
  }
  /**
  Extract the plugin's state field from an editor state.
  */
  getState(e) {
    return e[this.key];
  }
}
const bo = /* @__PURE__ */ Object.create(null);
function qc(t) {
  return t in bo ? t + "$" + ++bo[t] : (bo[t] = 0, t + "$");
}
class W {
  /**
  Create a plugin key.
  */
  constructor(e = "key") {
    this.key = qc(e);
  }
  /**
  Get the active plugin with this key, if any, from an editor
  state.
  */
  get(e) {
    return e.config.pluginsByKey[this.key];
  }
  /**
  Get the plugin's state from an editor state.
  */
  getState(e) {
    return e[this.key];
  }
}
const Us = (t, e) => t.selection.empty ? !1 : (e && e(t.tr.deleteSelection().scrollIntoView()), !0);
function Wc(t, e) {
  let { $cursor: n } = t.selection;
  return !n || (e ? !e.endOfTextblock("backward", t) : n.parentOffset > 0) ? null : n;
}
const Uc = (t, e, n) => {
  let r = Wc(t, n);
  if (!r)
    return !1;
  let i = Ks(r);
  if (!i) {
    let s = r.blockRange(), u = s && Cn(s);
    return u == null ? !1 : (e && e(t.tr.lift(s, u).scrollIntoView()), !0);
  }
  let o = i.nodeBefore;
  if (td(t, i, e, -1))
    return !0;
  if (r.parent.content.size == 0 && (hn(o, "end") || _.isSelectable(o)))
    for (let s = r.depth; ; s--) {
      let u = Vi(t.doc, r.before(s), r.after(s), v.empty);
      if (u && u.slice.size < u.to - u.from) {
        if (e) {
          let l = t.tr.step(u);
          l.setSelection(hn(o, "end") ? O.findFrom(l.doc.resolve(l.mapping.map(i.pos, -1)), -1) : _.create(l.doc, i.pos - o.nodeSize)), e(l.scrollIntoView());
        }
        return !0;
      }
      if (s == 1 || r.node(s - 1).childCount > 1)
        break;
    }
  return o.isAtom && i.depth == r.depth - 1 ? (e && e(t.tr.delete(i.pos - o.nodeSize, i.pos).scrollIntoView()), !0) : !1;
}, Gp = (t, e, n) => {
  let r = Wc(t, n);
  if (!r)
    return !1;
  let i = Ks(r);
  return i ? Kc(t, i, e) : !1;
}, Zp = (t, e, n) => {
  let r = Gc(t, n);
  if (!r)
    return !1;
  let i = Js(r);
  return i ? Kc(t, i, e) : !1;
};
function Kc(t, e, n) {
  let r = e.nodeBefore, i = r, o = e.pos - 1;
  for (; !i.isTextblock; o--) {
    if (i.type.spec.isolating)
      return !1;
    let c = i.lastChild;
    if (!c)
      return !1;
    i = c;
  }
  let s = e.nodeAfter, u = s, l = e.pos + 1;
  for (; !u.isTextblock; l++) {
    if (u.type.spec.isolating)
      return !1;
    let c = u.firstChild;
    if (!c)
      return !1;
    u = c;
  }
  let a = Vi(t.doc, o, l, v.empty);
  if (!a || a.from != o || a instanceof te && a.slice.size >= l - o)
    return !1;
  if (n) {
    let c = t.tr.step(a);
    c.setSelection(D.create(c.doc, o)), n(c.scrollIntoView());
  }
  return !0;
}
function hn(t, e, n = !1) {
  for (let r = t; r; r = e == "start" ? r.firstChild : r.lastChild) {
    if (r.isTextblock)
      return !0;
    if (n && r.childCount != 1)
      return !1;
  }
  return !1;
}
const Jc = (t, e, n) => {
  let { $head: r, empty: i } = t.selection, o = r;
  if (!i)
    return !1;
  if (r.parent.isTextblock) {
    if (n ? !n.endOfTextblock("backward", t) : r.parentOffset > 0)
      return !1;
    o = Ks(r);
  }
  let s = o && o.nodeBefore;
  return !s || !_.isSelectable(s) ? !1 : (e && e(t.tr.setSelection(_.create(t.doc, o.pos - s.nodeSize)).scrollIntoView()), !0);
};
function Ks(t) {
  if (!t.parent.type.spec.isolating)
    for (let e = t.depth - 1; e >= 0; e--) {
      if (t.index(e) > 0)
        return t.doc.resolve(t.before(e + 1));
      if (t.node(e).type.spec.isolating)
        break;
    }
  return null;
}
function Gc(t, e) {
  let { $cursor: n } = t.selection;
  return !n || (e ? !e.endOfTextblock("forward", t) : n.parentOffset < n.parent.content.size) ? null : n;
}
const Zc = (t, e, n) => {
  let r = Gc(t, n);
  if (!r)
    return !1;
  let i = Js(r);
  if (!i)
    return !1;
  let o = i.nodeAfter;
  if (td(t, i, e, 1))
    return !0;
  if (r.parent.content.size == 0 && (hn(o, "start") || _.isSelectable(o))) {
    let s = Vi(t.doc, r.before(), r.after(), v.empty);
    if (s && s.slice.size < s.to - s.from) {
      if (e) {
        let u = t.tr.step(s);
        u.setSelection(hn(o, "start") ? O.findFrom(u.doc.resolve(u.mapping.map(i.pos)), 1) : _.create(u.doc, u.mapping.map(i.pos))), e(u.scrollIntoView());
      }
      return !0;
    }
  }
  return o.isAtom && i.depth == r.depth - 1 ? (e && e(t.tr.delete(i.pos, i.pos + o.nodeSize).scrollIntoView()), !0) : !1;
}, Xc = (t, e, n) => {
  let { $head: r, empty: i } = t.selection, o = r;
  if (!i)
    return !1;
  if (r.parent.isTextblock) {
    if (n ? !n.endOfTextblock("forward", t) : r.parentOffset < r.parent.content.size)
      return !1;
    o = Js(r);
  }
  let s = o && o.nodeAfter;
  return !s || !_.isSelectable(s) ? !1 : (e && e(t.tr.setSelection(_.create(t.doc, o.pos)).scrollIntoView()), !0);
};
function Js(t) {
  if (!t.parent.type.spec.isolating)
    for (let e = t.depth - 1; e >= 0; e--) {
      let n = t.node(e);
      if (t.index(e) + 1 < n.childCount)
        return t.doc.resolve(t.after(e + 1));
      if (n.type.spec.isolating)
        break;
    }
  return null;
}
const Xp = (t, e) => {
  let n = t.selection, r = n instanceof _, i;
  if (r) {
    if (n.node.isTextblock || !Dt(t.doc, n.from))
      return !1;
    i = n.from;
  } else if (i = Hi(t.doc, n.from, -1), i == null)
    return !1;
  if (e) {
    let o = t.tr.join(i);
    r && o.setSelection(_.create(o.doc, i - t.doc.resolve(i).nodeBefore.nodeSize)), e(o.scrollIntoView());
  }
  return !0;
}, Yp = (t, e) => {
  let n = t.selection, r;
  if (n instanceof _) {
    if (n.node.isTextblock || !Dt(t.doc, n.to))
      return !1;
    r = n.to;
  } else if (r = Hi(t.doc, n.to, 1), r == null)
    return !1;
  return e && e(t.tr.join(r).scrollIntoView()), !0;
}, Qp = (t, e) => {
  let { $from: n, $to: r } = t.selection, i = n.blockRange(r), o = i && Cn(i);
  return o == null ? !1 : (e && e(t.tr.lift(i, o).scrollIntoView()), !0);
}, Yc = (t, e) => {
  let { $head: n, $anchor: r } = t.selection;
  return !n.parent.type.spec.code || !n.sameParent(r) ? !1 : (e && e(t.tr.insertText(`
`).scrollIntoView()), !0);
};
function Gs(t) {
  for (let e = 0; e < t.edgeCount; e++) {
    let { type: n } = t.edge(e);
    if (n.isTextblock && !n.hasRequiredAttrs())
      return n;
  }
  return null;
}
const e0 = (t, e) => {
  let { $head: n, $anchor: r } = t.selection;
  if (!n.parent.type.spec.code || !n.sameParent(r))
    return !1;
  let i = n.node(-1), o = n.indexAfter(-1), s = Gs(i.contentMatchAt(o));
  if (!s || !i.canReplaceWith(o, o, s))
    return !1;
  if (e) {
    let u = n.after(), l = t.tr.replaceWith(u, u, s.createAndFill());
    l.setSelection(O.near(l.doc.resolve(u), 1)), e(l.scrollIntoView());
  }
  return !0;
}, Qc = (t, e) => {
  let n = t.selection, { $from: r, $to: i } = n;
  if (n instanceof Ee || r.parent.inlineContent || i.parent.inlineContent)
    return !1;
  let o = Gs(i.parent.contentMatchAt(i.indexAfter()));
  if (!o || !o.isTextblock)
    return !1;
  if (e) {
    let s = (!r.parentOffset && i.index() < i.parent.childCount ? r : i).pos, u = t.tr.insert(s, o.createAndFill());
    u.setSelection(D.create(u.doc, s + 1)), e(u.scrollIntoView());
  }
  return !0;
}, ed = (t, e) => {
  let { $cursor: n } = t.selection;
  if (!n || n.parent.content.size)
    return !1;
  if (n.depth > 1 && n.after() != n.end(-1)) {
    let o = n.before();
    if (it(t.doc, o))
      return e && e(t.tr.split(o).scrollIntoView()), !0;
  }
  let r = n.blockRange(), i = r && Cn(r);
  return i == null ? !1 : (e && e(t.tr.lift(r, i).scrollIntoView()), !0);
};
function t0(t) {
  return (e, n) => {
    let { $from: r, $to: i } = e.selection;
    if (e.selection instanceof _ && e.selection.node.isBlock)
      return !r.parentOffset || !it(e.doc, r.pos) ? !1 : (n && n(e.tr.split(r.pos).scrollIntoView()), !0);
    if (!r.depth)
      return !1;
    let o = [], s, u, l = !1, a = !1;
    for (let h = r.depth; ; h--)
      if (r.node(h).isBlock) {
        l = r.end(h) == r.pos + (r.depth - h), a = r.start(h) == r.pos - (r.depth - h), u = Gs(r.node(h - 1).contentMatchAt(r.indexAfter(h - 1))), o.unshift(l && u ? { type: u } : null), s = h;
        break;
      } else {
        if (h == 1)
          return !1;
        o.unshift(null);
      }
    let c = e.tr;
    (e.selection instanceof D || e.selection instanceof Ee) && c.deleteSelection();
    let d = c.mapping.map(r.pos), f = it(c.doc, d, o.length, o);
    if (f || (o[0] = u ? { type: u } : null, f = it(c.doc, d, o.length, o)), !f)
      return !1;
    if (c.split(d, o.length, o), !l && a && r.node(s).type != u) {
      let h = c.mapping.map(r.before(s)), p = c.doc.resolve(h);
      u && r.node(s - 1).canReplaceWith(p.index(), p.index() + 1, u) && c.setNodeMarkup(c.mapping.map(r.before(s)), u);
    }
    return n && n(c.scrollIntoView()), !0;
  };
}
const n0 = t0(), r0 = (t, e) => {
  let { $from: n, to: r } = t.selection, i, o = n.sharedDepth(r);
  return o == 0 ? !1 : (i = n.before(o), e && e(t.tr.setSelection(_.create(t.doc, i))), !0);
};
function i0(t, e, n) {
  let r = e.nodeBefore, i = e.nodeAfter, o = e.index();
  return !r || !i || !r.type.compatibleContent(i.type) ? !1 : !r.content.size && e.parent.canReplace(o - 1, o) ? (n && n(t.tr.delete(e.pos - r.nodeSize, e.pos).scrollIntoView()), !0) : !e.parent.canReplace(o, o + 1) || !(i.isTextblock || Dt(t.doc, e.pos)) ? !1 : (n && n(t.tr.join(e.pos).scrollIntoView()), !0);
}
function td(t, e, n, r) {
  let i = e.nodeBefore, o = e.nodeAfter, s, u, l = i.type.spec.isolating || o.type.spec.isolating;
  if (!l && i0(t, e, n))
    return !0;
  let a = !l && e.parent.canReplace(e.index(), e.index() + 1);
  if (a && (s = (u = i.contentMatchAt(i.childCount)).findWrapping(o.type)) && u.matchType(s[0] || o.type).validEnd) {
    if (n) {
      let h = e.pos + o.nodeSize, p = w.empty;
      for (let b = s.length - 1; b >= 0; b--)
        p = w.from(s[b].create(null, p));
      p = w.from(i.copy(p));
      let m = t.tr.step(new ie(e.pos - 1, h, e.pos, h, new v(p, 1, 0), s.length, !0)), g = m.doc.resolve(h + 2 * s.length);
      g.nodeAfter && g.nodeAfter.type == i.type && Dt(m.doc, g.pos) && m.join(g.pos), n(m.scrollIntoView());
    }
    return !0;
  }
  let c = o.type.spec.isolating || r > 0 && l ? null : O.findFrom(e, 1), d = c && c.$from.blockRange(c.$to), f = d && Cn(d);
  if (f != null && f >= e.depth)
    return n && n(t.tr.lift(d, f).scrollIntoView()), !0;
  if (a && hn(o, "start", !0) && hn(i, "end")) {
    let h = i, p = [];
    for (; p.push(h), !h.isTextblock; )
      h = h.lastChild;
    let m = o, g = 1;
    for (; !m.isTextblock; m = m.firstChild)
      g++;
    if (h.canReplace(h.childCount, h.childCount, m.content)) {
      if (n) {
        let b = w.empty;
        for (let k = p.length - 1; k >= 0; k--)
          b = w.from(p[k].copy(b));
        let y = t.tr.step(new ie(e.pos - p.length, e.pos + o.nodeSize, e.pos + g, e.pos + o.nodeSize - g, new v(b, p.length, 0), 0, !0));
        n(y.scrollIntoView());
      }
      return !0;
    }
  }
  return !1;
}
function nd(t) {
  return function(e, n) {
    let r = e.selection, i = t < 0 ? r.$from : r.$to, o = i.depth;
    for (; i.node(o).isInline; ) {
      if (!o)
        return !1;
      o--;
    }
    return i.node(o).isTextblock ? (n && n(e.tr.setSelection(D.create(e.doc, t < 0 ? i.start(o) : i.end(o)))), !0) : !1;
  };
}
const o0 = nd(-1), s0 = nd(1);
function u0(t, e = null) {
  return function(n, r) {
    let { $from: i, $to: o } = n.selection, s = i.blockRange(o), u = s && js(s, t, e);
    return u ? (r && r(n.tr.wrap(s, u).scrollIntoView()), !0) : !1;
  };
}
function ul(t, e = null) {
  return function(n, r) {
    let i = !1;
    for (let o = 0; o < n.selection.ranges.length && !i; o++) {
      let { $from: { pos: s }, $to: { pos: u } } = n.selection.ranges[o];
      n.doc.nodesBetween(s, u, (l, a) => {
        if (i)
          return !1;
        if (!(!l.isTextblock || l.hasMarkup(t, e)))
          if (l.type == t)
            i = !0;
          else {
            let c = n.doc.resolve(a), d = c.index();
            i = c.parent.canReplaceWith(d, d + 1, t);
          }
      });
    }
    if (!i)
      return !1;
    if (r) {
      let o = n.tr;
      for (let s = 0; s < n.selection.ranges.length; s++) {
        let { $from: { pos: u }, $to: { pos: l } } = n.selection.ranges[s];
        o.setBlockType(u, l, t, e);
      }
      r(o.scrollIntoView());
    }
    return !0;
  };
}
function Zs(...t) {
  return function(e, n, r) {
    for (let i = 0; i < t.length; i++)
      if (t[i](e, n, r))
        return !0;
    return !1;
  };
}
Zs(Us, Uc, Jc);
Zs(Us, Zc, Xc);
Zs(Yc, Qc, ed, n0);
typeof navigator < "u" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os < "u" && os.platform && os.platform() == "darwin";
function l0(t, e = null) {
  return function(n, r) {
    let { $from: i, $to: o } = n.selection, s = i.blockRange(o);
    if (!s)
      return !1;
    let u = r ? n.tr : null;
    return a0(u, s, t, e) ? (r && r(u.scrollIntoView()), !0) : !1;
  };
}
function a0(t, e, n, r = null) {
  let i = !1, o = e, s = e.$from.doc;
  if (e.depth >= 2 && e.$from.node(e.depth - 1).type.compatibleContent(n) && e.startIndex == 0) {
    if (e.$from.index(e.depth - 1) == 0)
      return !1;
    let l = s.resolve(e.start - 2);
    o = new Gr(l, l, e.depth), e.endIndex < e.parent.childCount && (e = new Gr(e.$from, s.resolve(e.$to.end(e.depth)), e.depth)), i = !0;
  }
  let u = js(o, n, r, e);
  return u ? (t && c0(t, e, u, i, n), !0) : !1;
}
function c0(t, e, n, r, i) {
  let o = w.empty;
  for (let c = n.length - 1; c >= 0; c--)
    o = w.from(n[c].type.create(n[c].attrs, o));
  t.step(new ie(e.start - (r ? 2 : 0), e.end, e.start, e.end, new v(o, 0, 0), n.length, !0));
  let s = 0;
  for (let c = 0; c < n.length; c++)
    n[c].type == i && (s = c + 1);
  let u = n.length - s, l = e.start + n.length - (r ? 2 : 0), a = e.parent;
  for (let c = e.startIndex, d = e.endIndex, f = !0; c < d; c++, f = !1)
    !f && it(t.doc, l, u) && (t.split(l, u), l += 2 * u), l += a.child(c).nodeSize;
  return t;
}
function d0(t) {
  return function(e, n) {
    let { $from: r, $to: i } = e.selection, o = r.blockRange(i, (s) => s.childCount > 0 && s.firstChild.type == t);
    return o ? n ? r.node(o.depth - 1).type == t ? f0(e, n, t, o) : h0(e, n, o) : !0 : !1;
  };
}
function f0(t, e, n, r) {
  let i = t.tr, o = r.end, s = r.$to.end(r.depth);
  o < s && (i.step(new ie(o - 1, s, o, s, new v(w.from(n.create(null, r.parent.copy())), 1, 0), 1, !0)), r = new Gr(i.doc.resolve(r.$from.pos), i.doc.resolve(s), r.depth));
  const u = Cn(r);
  if (u == null)
    return !1;
  i.lift(r, u);
  let l = i.doc.resolve(i.mapping.map(o, -1) - 1);
  return Dt(i.doc, l.pos) && l.nodeBefore.type == l.nodeAfter.type && i.join(l.pos), e(i.scrollIntoView()), !0;
}
function h0(t, e, n) {
  let r = t.tr, i = n.parent;
  for (let h = n.end, p = n.endIndex - 1, m = n.startIndex; p > m; p--)
    h -= i.child(p).nodeSize, r.delete(h - 1, h + 1);
  let o = r.doc.resolve(n.start), s = o.nodeAfter;
  if (r.mapping.map(n.end) != n.start + o.nodeAfter.nodeSize)
    return !1;
  let u = n.startIndex == 0, l = n.endIndex == i.childCount, a = o.node(-1), c = o.index(-1);
  if (!a.canReplace(c + (u ? 0 : 1), c + 1, s.content.append(l ? w.empty : w.from(i))))
    return !1;
  let d = o.pos, f = d + s.nodeSize;
  return r.step(new ie(d - (u ? 1 : 0), f + (l ? 1 : 0), d + 1, f - 1, new v((u ? w.empty : w.from(i.copy(w.empty))).append(l ? w.empty : w.from(i.copy(w.empty))), u ? 0 : 1, l ? 0 : 1), u ? 0 : 1)), e(r.scrollIntoView()), !0;
}
function p0(t) {
  return function(e, n) {
    let { $from: r, $to: i } = e.selection, o = r.blockRange(i, (a) => a.childCount > 0 && a.firstChild.type == t);
    if (!o)
      return !1;
    let s = o.startIndex;
    if (s == 0)
      return !1;
    let u = o.parent, l = u.child(s - 1);
    if (l.type != t)
      return !1;
    if (n) {
      let a = l.lastChild && l.lastChild.type == u.type, c = w.from(a ? t.create() : null), d = new v(w.from(t.create(null, w.from(u.type.create(null, c)))), a ? 3 : 1, 0), f = o.start, h = o.end;
      n(e.tr.step(new ie(f - (a ? 3 : 1), h, f, h, d, 1, !0)).scrollIntoView());
    }
    return !0;
  };
}
const ue = function(t) {
  for (var e = 0; ; e++)
    if (t = t.previousSibling, !t)
      return e;
}, pn = function(t) {
  let e = t.assignedSlot || t.parentNode;
  return e && e.nodeType == 11 ? e.host : e;
};
let rs = null;
const tt = function(t, e, n) {
  let r = rs || (rs = document.createRange());
  return r.setEnd(t, n ?? t.nodeValue.length), r.setStart(t, e || 0), r;
}, m0 = function() {
  rs = null;
}, Kt = function(t, e, n, r) {
  return n && (ll(t, e, n, r, -1) || ll(t, e, n, r, 1));
}, g0 = /^(img|br|input|textarea|hr)$/i;
function ll(t, e, n, r, i) {
  for (var o; ; ) {
    if (t == n && e == r)
      return !0;
    if (e == (i < 0 ? 0 : De(t))) {
      let s = t.parentNode;
      if (!s || s.nodeType != 1 || ar(t) || g0.test(t.nodeName) || t.contentEditable == "false")
        return !1;
      e = ue(t) + (i < 0 ? 0 : 1), t = s;
    } else if (t.nodeType == 1) {
      let s = t.childNodes[e + (i < 0 ? -1 : 0)];
      if (s.nodeType == 1 && s.contentEditable == "false")
        if (!((o = s.pmViewDesc) === null || o === void 0) && o.ignoreForSelection)
          e += i;
        else
          return !1;
      else
        t = s, e = i < 0 ? De(t) : 0;
    } else
      return !1;
  }
}
function De(t) {
  return t.nodeType == 3 ? t.nodeValue.length : t.childNodes.length;
}
function b0(t, e) {
  for (; ; ) {
    if (t.nodeType == 3 && e)
      return t;
    if (t.nodeType == 1 && e > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[e - 1], e = De(t);
    } else if (t.parentNode && !ar(t))
      e = ue(t), t = t.parentNode;
    else
      return null;
  }
}
function y0(t, e) {
  for (; ; ) {
    if (t.nodeType == 3 && e < t.nodeValue.length)
      return t;
    if (t.nodeType == 1 && e < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[e], e = 0;
    } else if (t.parentNode && !ar(t))
      e = ue(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
function k0(t, e, n) {
  for (let r = e == 0, i = e == De(t); r || i; ) {
    if (t == n)
      return !0;
    let o = ue(t);
    if (t = t.parentNode, !t)
      return !1;
    r = r && o == 0, i = i && o == De(t);
  }
}
function ar(t) {
  let e;
  for (let n = t; n && !(e = n.pmViewDesc); n = n.parentNode)
    ;
  return e && e.node && e.node.isBlock && (e.dom == t || e.contentDOM == t);
}
const qi = function(t) {
  return t.focusNode && Kt(t.focusNode, t.focusOffset, t.anchorNode, t.anchorOffset);
};
function Lt(t, e) {
  let n = document.createEvent("Event");
  return n.initEvent("keydown", !0, !0), n.keyCode = t, n.key = n.code = e, n;
}
function x0(t) {
  let e = t.activeElement;
  for (; e && e.shadowRoot; )
    e = e.shadowRoot.activeElement;
  return e;
}
function C0(t, e, n) {
  if (t.caretPositionFromPoint)
    try {
      let r = t.caretPositionFromPoint(e, n);
      if (r)
        return { node: r.offsetNode, offset: Math.min(De(r.offsetNode), r.offset) };
    } catch {
    }
  if (t.caretRangeFromPoint) {
    let r = t.caretRangeFromPoint(e, n);
    if (r)
      return { node: r.startContainer, offset: Math.min(De(r.startContainer), r.startOffset) };
  }
}
const qe = typeof navigator < "u" ? navigator : null, al = typeof document < "u" ? document : null, Ot = qe && qe.userAgent || "", is = /Edge\/(\d+)/.exec(Ot), rd = /MSIE \d/.exec(Ot), ss = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(Ot), ye = !!(rd || ss || is), St = rd ? document.documentMode : ss ? +ss[1] : is ? +is[1] : 0, Oe = !ye && /gecko\/(\d+)/i.test(Ot);
Oe && +(/Firefox\/(\d+)/.exec(Ot) || [0, 0])[1];
const us = !ye && /Chrome\/(\d+)/.exec(Ot), ae = !!us, id = us ? +us[1] : 0, de = !ye && !!qe && /Apple Computer/.test(qe.vendor), mn = de && (/Mobile\/\w+/.test(Ot) || !!qe && qe.maxTouchPoints > 2), _e = mn || (qe ? /Mac/.test(qe.platform) : !1), od = qe ? /Win/.test(qe.platform) : !1, nt = /Android \d/.test(Ot), cr = !!al && "webkitFontSmoothing" in al.documentElement.style, w0 = cr ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0;
function E0(t) {
  let e = t.defaultView && t.defaultView.visualViewport;
  return e ? {
    left: 0,
    right: e.width,
    top: 0,
    bottom: e.height
  } : {
    left: 0,
    right: t.documentElement.clientWidth,
    top: 0,
    bottom: t.documentElement.clientHeight
  };
}
function Ze(t, e) {
  return typeof t == "number" ? t : t[e];
}
function S0(t) {
  let e = t.getBoundingClientRect(), n = e.width / t.offsetWidth || 1, r = e.height / t.offsetHeight || 1;
  return {
    left: e.left,
    right: e.left + t.clientWidth * n,
    top: e.top,
    bottom: e.top + t.clientHeight * r
  };
}
function cl(t, e, n) {
  let r = t.someProp("scrollThreshold") || 0, i = t.someProp("scrollMargin") || 5, o = t.dom.ownerDocument;
  for (let s = n || t.dom; s; ) {
    if (s.nodeType != 1) {
      s = pn(s);
      continue;
    }
    let u = s, l = u == o.body, a = l ? E0(o) : S0(u), c = 0, d = 0;
    if (e.top < a.top + Ze(r, "top") ? d = -(a.top - e.top + Ze(i, "top")) : e.bottom > a.bottom - Ze(r, "bottom") && (d = e.bottom - e.top > a.bottom - a.top ? e.top + Ze(i, "top") - a.top : e.bottom - a.bottom + Ze(i, "bottom")), e.left < a.left + Ze(r, "left") ? c = -(a.left - e.left + Ze(i, "left")) : e.right > a.right - Ze(r, "right") && (c = e.right - a.right + Ze(i, "right")), c || d)
      if (l)
        o.defaultView.scrollBy(c, d);
      else {
        let h = u.scrollLeft, p = u.scrollTop;
        d && (u.scrollTop += d), c && (u.scrollLeft += c);
        let m = u.scrollLeft - h, g = u.scrollTop - p;
        e = { left: e.left - m, top: e.top - g, right: e.right - m, bottom: e.bottom - g };
      }
    let f = l ? "fixed" : getComputedStyle(s).position;
    if (/^(fixed|sticky)$/.test(f))
      break;
    s = f == "absolute" ? s.offsetParent : pn(s);
  }
}
function A0(t) {
  let e = t.dom.getBoundingClientRect(), n = Math.max(0, e.top), r, i;
  for (let o = (e.left + e.right) / 2, s = n + 1; s < Math.min(innerHeight, e.bottom); s += 5) {
    let u = t.root.elementFromPoint(o, s);
    if (!u || u == t.dom || !t.dom.contains(u))
      continue;
    let l = u.getBoundingClientRect();
    if (l.top >= n - 20) {
      r = u, i = l.top;
      break;
    }
  }
  return { refDOM: r, refTop: i, stack: sd(t.dom) };
}
function sd(t) {
  let e = [], n = t.ownerDocument;
  for (let r = t; r && (e.push({ dom: r, top: r.scrollTop, left: r.scrollLeft }), t != n); r = pn(r))
    ;
  return e;
}
function v0({ refDOM: t, refTop: e, stack: n }) {
  let r = t ? t.getBoundingClientRect().top : 0;
  ud(n, r == 0 ? 0 : r - e);
}
function ud(t, e) {
  for (let n = 0; n < t.length; n++) {
    let { dom: r, top: i, left: o } = t[n];
    r.scrollTop != i + e && (r.scrollTop = i + e), r.scrollLeft != o && (r.scrollLeft = o);
  }
}
let en = null;
function M0(t) {
  if (t.setActive)
    return t.setActive();
  if (en)
    return t.focus(en);
  let e = sd(t);
  t.focus(en == null ? {
    get preventScroll() {
      return en = { preventScroll: !0 }, !0;
    }
  } : void 0), en || (en = !1, ud(e, 0));
}
function ld(t, e) {
  let n, r = 2e8, i, o = 0, s = e.top, u = e.top, l, a;
  for (let c = t.firstChild, d = 0; c; c = c.nextSibling, d++) {
    let f;
    if (c.nodeType == 1)
      f = c.getClientRects();
    else if (c.nodeType == 3)
      f = tt(c).getClientRects();
    else
      continue;
    for (let h = 0; h < f.length; h++) {
      let p = f[h];
      if (p.top <= s && p.bottom >= u) {
        s = Math.max(p.bottom, s), u = Math.min(p.top, u);
        let m = p.left > e.left ? p.left - e.left : p.right < e.left ? e.left - p.right : 0;
        if (m < r) {
          n = c, r = m, i = m && n.nodeType == 3 ? {
            left: p.right < e.left ? p.right : p.left,
            top: e.top
          } : e, c.nodeType == 1 && m && (o = d + (e.left >= (p.left + p.right) / 2 ? 1 : 0));
          continue;
        }
      } else p.top > e.top && !l && p.left <= e.left && p.right >= e.left && (l = c, a = { left: Math.max(p.left, Math.min(p.right, e.left)), top: p.top });
      !n && (e.left >= p.right && e.top >= p.top || e.left >= p.left && e.top >= p.bottom) && (o = d + 1);
    }
  }
  return !n && l && (n = l, i = a, r = 0), n && n.nodeType == 3 ? T0(n, i) : !n || r && n.nodeType == 1 ? { node: t, offset: o } : ld(n, i);
}
function T0(t, e) {
  let n = t.nodeValue.length, r = document.createRange(), i;
  for (let o = 0; o < n; o++) {
    r.setEnd(t, o + 1), r.setStart(t, o);
    let s = ct(r, 1);
    if (s.top != s.bottom && Xs(e, s)) {
      i = { node: t, offset: o + (e.left >= (s.left + s.right) / 2 ? 1 : 0) };
      break;
    }
  }
  return r.detach(), i || { node: t, offset: 0 };
}
function Xs(t, e) {
  return t.left >= e.left - 1 && t.left <= e.right + 1 && t.top >= e.top - 1 && t.top <= e.bottom + 1;
}
function _0(t, e) {
  let n = t.parentNode;
  return n && /^li$/i.test(n.nodeName) && e.left < t.getBoundingClientRect().left ? n : t;
}
function D0(t, e, n) {
  let { node: r, offset: i } = ld(e, n), o = -1;
  if (r.nodeType == 1 && !r.firstChild) {
    let s = r.getBoundingClientRect();
    o = s.left != s.right && n.left > (s.left + s.right) / 2 ? 1 : -1;
  }
  return t.docView.posFromDOM(r, i, o);
}
function O0(t, e, n, r) {
  let i = -1;
  for (let o = e, s = !1; o != t.dom; ) {
    let u = t.docView.nearestDesc(o, !0), l;
    if (!u)
      return null;
    if (u.dom.nodeType == 1 && (u.node.isBlock && u.parent || !u.contentDOM) && // Ignore elements with zero-size bounding rectangles
    ((l = u.dom.getBoundingClientRect()).width || l.height) && (u.node.isBlock && u.parent && !/^T(R|BODY|HEAD|FOOT)$/.test(u.dom.nodeName) && (!s && l.left > r.left || l.top > r.top ? i = u.posBefore : (!s && l.right < r.left || l.bottom < r.top) && (i = u.posAfter), s = !0), !u.contentDOM && i < 0 && !u.node.isText))
      return (u.node.isBlock ? r.top < (l.top + l.bottom) / 2 : r.left < (l.left + l.right) / 2) ? u.posBefore : u.posAfter;
    o = u.dom.parentNode;
  }
  return i > -1 ? i : t.docView.posFromDOM(e, n, -1);
}
function ad(t, e, n) {
  let r = t.childNodes.length;
  if (r && n.top < n.bottom)
    for (let i = Math.max(0, Math.min(r - 1, Math.floor(r * (e.top - n.top) / (n.bottom - n.top)) - 2)), o = i; ; ) {
      let s = t.childNodes[o];
      if (s.nodeType == 1) {
        let u = s.getClientRects();
        for (let l = 0; l < u.length; l++) {
          let a = u[l];
          if (Xs(e, a))
            return ad(s, e, a);
        }
      }
      if ((o = (o + 1) % r) == i)
        break;
    }
  return t;
}
function N0(t, e) {
  let n = t.dom.ownerDocument, r, i = 0, o = C0(n, e.left, e.top);
  o && ({ node: r, offset: i } = o);
  let s = (t.root.elementFromPoint ? t.root : n).elementFromPoint(e.left, e.top), u;
  if (!s || !t.dom.contains(s.nodeType != 1 ? s.parentNode : s)) {
    let a = t.dom.getBoundingClientRect();
    if (!Xs(e, a) || (s = ad(t.dom, e, a), !s))
      return null;
  }
  if (de)
    for (let a = s; r && a; a = pn(a))
      a.draggable && (r = void 0);
  if (s = _0(s, e), r) {
    if (Oe && r.nodeType == 1 && (i = Math.min(i, r.childNodes.length), i < r.childNodes.length)) {
      let c = r.childNodes[i], d;
      c.nodeName == "IMG" && (d = c.getBoundingClientRect()).right <= e.left && d.bottom > e.top && i++;
    }
    let a;
    cr && i && r.nodeType == 1 && (a = r.childNodes[i - 1]).nodeType == 1 && a.contentEditable == "false" && a.getBoundingClientRect().top >= e.top && i--, r == t.dom && i == r.childNodes.length - 1 && r.lastChild.nodeType == 1 && e.top > r.lastChild.getBoundingClientRect().bottom ? u = t.state.doc.content.size : (i == 0 || r.nodeType != 1 || r.childNodes[i - 1].nodeName != "BR") && (u = O0(t, r, i, e));
  }
  u == null && (u = D0(t, s, e));
  let l = t.docView.nearestDesc(s, !0);
  return { pos: u, inside: l ? l.posAtStart - l.border : -1 };
}
function dl(t) {
  return t.top < t.bottom || t.left < t.right;
}
function ct(t, e) {
  let n = t.getClientRects();
  if (n.length) {
    let r = n[e < 0 ? 0 : n.length - 1];
    if (dl(r))
      return r;
  }
  return Array.prototype.find.call(n, dl) || t.getBoundingClientRect();
}
const R0 = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
function cd(t, e, n) {
  let { node: r, offset: i, atom: o } = t.docView.domFromPos(e, n < 0 ? -1 : 1), s = cr || Oe;
  if (r.nodeType == 3)
    if (s && (R0.test(r.nodeValue) || (n < 0 ? !i : i == r.nodeValue.length))) {
      let l = ct(tt(r, i, i), n);
      if (Oe && i && /\s/.test(r.nodeValue[i - 1]) && i < r.nodeValue.length) {
        let a = ct(tt(r, i - 1, i - 1), -1);
        if (a.top == l.top) {
          let c = ct(tt(r, i, i + 1), -1);
          if (c.top != l.top)
            return An(c, c.left < a.left);
        }
      }
      return l;
    } else {
      let l = i, a = i, c = n < 0 ? 1 : -1;
      return n < 0 && !i ? (a++, c = -1) : n >= 0 && i == r.nodeValue.length ? (l--, c = 1) : n < 0 ? l-- : a++, An(ct(tt(r, l, a), c), c < 0);
    }
  if (!t.state.doc.resolve(e - (o || 0)).parent.inlineContent) {
    if (o == null && i && (n < 0 || i == De(r))) {
      let l = r.childNodes[i - 1];
      if (l.nodeType == 1)
        return yo(l.getBoundingClientRect(), !1);
    }
    if (o == null && i < De(r)) {
      let l = r.childNodes[i];
      if (l.nodeType == 1)
        return yo(l.getBoundingClientRect(), !0);
    }
    return yo(r.getBoundingClientRect(), n >= 0);
  }
  if (o == null && i && (n < 0 || i == De(r))) {
    let l = r.childNodes[i - 1], a = l.nodeType == 3 ? tt(l, De(l) - (s ? 0 : 1)) : l.nodeType == 1 && (l.nodeName != "BR" || !l.nextSibling) ? l : null;
    if (a)
      return An(ct(a, 1), !1);
  }
  if (o == null && i < De(r)) {
    let l = r.childNodes[i];
    for (; l.pmViewDesc && l.pmViewDesc.ignoreForCoords; )
      l = l.nextSibling;
    let a = l ? l.nodeType == 3 ? tt(l, 0, s ? 0 : 1) : l.nodeType == 1 ? l : null : null;
    if (a)
      return An(ct(a, -1), !0);
  }
  return An(ct(r.nodeType == 3 ? tt(r) : r, -n), n >= 0);
}
function An(t, e) {
  if (t.width == 0)
    return t;
  let n = e ? t.left : t.right;
  return { top: t.top, bottom: t.bottom, left: n, right: n };
}
function yo(t, e) {
  if (t.height == 0)
    return t;
  let n = e ? t.top : t.bottom;
  return { top: n, bottom: n, left: t.left, right: t.right };
}
function dd(t, e, n) {
  let r = t.state, i = t.root.activeElement;
  r != e && t.updateState(e), i != t.dom && t.focus();
  try {
    return n();
  } finally {
    r != e && t.updateState(r), i != t.dom && i && i.focus();
  }
}
function I0(t, e, n) {
  let r = e.selection, i = n == "up" ? r.$from : r.$to;
  return dd(t, e, () => {
    let { node: o } = t.docView.domFromPos(i.pos, n == "up" ? -1 : 1);
    for (; ; ) {
      let u = t.docView.nearestDesc(o, !0);
      if (!u)
        break;
      if (u.node.isBlock) {
        o = u.contentDOM || u.dom;
        break;
      }
      o = u.dom.parentNode;
    }
    let s = cd(t, i.pos, 1);
    for (let u = o.firstChild; u; u = u.nextSibling) {
      let l;
      if (u.nodeType == 1)
        l = u.getClientRects();
      else if (u.nodeType == 3)
        l = tt(u, 0, u.nodeValue.length).getClientRects();
      else
        continue;
      for (let a = 0; a < l.length; a++) {
        let c = l[a];
        if (c.bottom > c.top + 1 && (n == "up" ? s.top - c.top > (c.bottom - s.top) * 2 : c.bottom - s.bottom > (s.bottom - c.top) * 2))
          return !1;
      }
    }
    return !0;
  });
}
const L0 = /[\u0590-\u08ac]/;
function F0(t, e, n) {
  let { $head: r } = e.selection;
  if (!r.parent.isTextblock)
    return !1;
  let i = r.parentOffset, o = !i, s = i == r.parent.content.size, u = t.domSelection();
  return u ? !L0.test(r.parent.textContent) || !u.modify ? n == "left" || n == "backward" ? o : s : dd(t, e, () => {
    let { focusNode: l, focusOffset: a, anchorNode: c, anchorOffset: d } = t.domSelectionRange(), f = u.caretBidiLevel;
    u.modify("move", n, "character");
    let h = r.depth ? t.docView.domAfterPos(r.before()) : t.dom, { focusNode: p, focusOffset: m } = t.domSelectionRange(), g = p && !h.contains(p.nodeType == 1 ? p : p.parentNode) || l == p && a == m;
    try {
      u.collapse(c, d), l && (l != c || a != d) && u.extend && u.extend(l, a);
    } catch {
    }
    return f != null && (u.caretBidiLevel = f), g;
  }) : r.pos == r.start() || r.pos == r.end();
}
let fl = null, hl = null, pl = !1;
function P0(t, e, n) {
  return fl == e && hl == n ? pl : (fl = e, hl = n, pl = n == "up" || n == "down" ? I0(t, e, n) : F0(t, e, n));
}
const Ne = 0, ml = 1, Ft = 2, We = 3;
class dr {
  constructor(e, n, r, i) {
    this.parent = e, this.children = n, this.dom = r, this.contentDOM = i, this.dirty = Ne, r.pmViewDesc = this;
  }
  // Used to check whether a given description corresponds to a
  // widget/mark/node.
  matchesWidget(e) {
    return !1;
  }
  matchesMark(e) {
    return !1;
  }
  matchesNode(e, n, r) {
    return !1;
  }
  matchesHack(e) {
    return !1;
  }
  // When parsing in-editor content (in domchange.js), we allow
  // descriptions to determine the parse rules that should be used to
  // parse them.
  parseRule() {
    return null;
  }
  // Used by the editor's event handler to ignore events that come
  // from certain descs.
  stopEvent(e) {
    return !1;
  }
  // The size of the content represented by this desc.
  get size() {
    let e = 0;
    for (let n = 0; n < this.children.length; n++)
      e += this.children[n].size;
    return e;
  }
  // For block nodes, this represents the space taken up by their
  // start/end tokens.
  get border() {
    return 0;
  }
  destroy() {
    this.parent = void 0, this.dom.pmViewDesc == this && (this.dom.pmViewDesc = void 0);
    for (let e = 0; e < this.children.length; e++)
      this.children[e].destroy();
  }
  posBeforeChild(e) {
    for (let n = 0, r = this.posAtStart; ; n++) {
      let i = this.children[n];
      if (i == e)
        return r;
      r += i.size;
    }
  }
  get posBefore() {
    return this.parent.posBeforeChild(this);
  }
  get posAtStart() {
    return this.parent ? this.parent.posBeforeChild(this) + this.border : 0;
  }
  get posAfter() {
    return this.posBefore + this.size;
  }
  get posAtEnd() {
    return this.posAtStart + this.size - 2 * this.border;
  }
  localPosFromDOM(e, n, r) {
    if (this.contentDOM && this.contentDOM.contains(e.nodeType == 1 ? e : e.parentNode))
      if (r < 0) {
        let o, s;
        if (e == this.contentDOM)
          o = e.childNodes[n - 1];
        else {
          for (; e.parentNode != this.contentDOM; )
            e = e.parentNode;
          o = e.previousSibling;
        }
        for (; o && !((s = o.pmViewDesc) && s.parent == this); )
          o = o.previousSibling;
        return o ? this.posBeforeChild(s) + s.size : this.posAtStart;
      } else {
        let o, s;
        if (e == this.contentDOM)
          o = e.childNodes[n];
        else {
          for (; e.parentNode != this.contentDOM; )
            e = e.parentNode;
          o = e.nextSibling;
        }
        for (; o && !((s = o.pmViewDesc) && s.parent == this); )
          o = o.nextSibling;
        return o ? this.posBeforeChild(s) : this.posAtEnd;
      }
    let i;
    if (e == this.dom && this.contentDOM)
      i = n > ue(this.contentDOM);
    else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM))
      i = e.compareDocumentPosition(this.contentDOM) & 2;
    else if (this.dom.firstChild) {
      if (n == 0)
        for (let o = e; ; o = o.parentNode) {
          if (o == this.dom) {
            i = !1;
            break;
          }
          if (o.previousSibling)
            break;
        }
      if (i == null && n == e.childNodes.length)
        for (let o = e; ; o = o.parentNode) {
          if (o == this.dom) {
            i = !0;
            break;
          }
          if (o.nextSibling)
            break;
        }
    }
    return i ?? r > 0 ? this.posAtEnd : this.posAtStart;
  }
  nearestDesc(e, n = !1) {
    for (let r = !0, i = e; i; i = i.parentNode) {
      let o = this.getDesc(i), s;
      if (o && (!n || o.node))
        if (r && (s = o.nodeDOM) && !(s.nodeType == 1 ? s.contains(e.nodeType == 1 ? e : e.parentNode) : s == e))
          r = !1;
        else
          return o;
    }
  }
  getDesc(e) {
    let n = e.pmViewDesc;
    for (let r = n; r; r = r.parent)
      if (r == this)
        return n;
  }
  posFromDOM(e, n, r) {
    for (let i = e; i; i = i.parentNode) {
      let o = this.getDesc(i);
      if (o)
        return o.localPosFromDOM(e, n, r);
    }
    return -1;
  }
  // Find the desc for the node after the given pos, if any. (When a
  // parent node overrode rendering, there might not be one.)
  descAt(e) {
    for (let n = 0, r = 0; n < this.children.length; n++) {
      let i = this.children[n], o = r + i.size;
      if (r == e && o != r) {
        for (; !i.border && i.children.length; )
          for (let s = 0; s < i.children.length; s++) {
            let u = i.children[s];
            if (u.size) {
              i = u;
              break;
            }
          }
        return i;
      }
      if (e < o)
        return i.descAt(e - r - i.border);
      r = o;
    }
  }
  domFromPos(e, n) {
    if (!this.contentDOM)
      return { node: this.dom, offset: 0, atom: e + 1 };
    let r = 0, i = 0;
    for (let o = 0; r < this.children.length; r++) {
      let s = this.children[r], u = o + s.size;
      if (u > e || s instanceof hd) {
        i = e - o;
        break;
      }
      o = u;
    }
    if (i)
      return this.children[r].domFromPos(i - this.children[r].border, n);
    for (let o; r && !(o = this.children[r - 1]).size && o instanceof fd && o.side >= 0; r--)
      ;
    if (n <= 0) {
      let o, s = !0;
      for (; o = r ? this.children[r - 1] : null, !(!o || o.dom.parentNode == this.contentDOM); r--, s = !1)
        ;
      return o && n && s && !o.border && !o.domAtom ? o.domFromPos(o.size, n) : { node: this.contentDOM, offset: o ? ue(o.dom) + 1 : 0 };
    } else {
      let o, s = !0;
      for (; o = r < this.children.length ? this.children[r] : null, !(!o || o.dom.parentNode == this.contentDOM); r++, s = !1)
        ;
      return o && s && !o.border && !o.domAtom ? o.domFromPos(0, n) : { node: this.contentDOM, offset: o ? ue(o.dom) : this.contentDOM.childNodes.length };
    }
  }
  // Used to find a DOM range in a single parent for a given changed
  // range.
  parseRange(e, n, r = 0) {
    if (this.children.length == 0)
      return { node: this.contentDOM, from: e, to: n, fromOffset: 0, toOffset: this.contentDOM.childNodes.length };
    let i = -1, o = -1;
    for (let s = r, u = 0; ; u++) {
      let l = this.children[u], a = s + l.size;
      if (i == -1 && e <= a) {
        let c = s + l.border;
        if (e >= c && n <= a - l.border && l.node && l.contentDOM && this.contentDOM.contains(l.contentDOM))
          return l.parseRange(e, n, c);
        e = s;
        for (let d = u; d > 0; d--) {
          let f = this.children[d - 1];
          if (f.size && f.dom.parentNode == this.contentDOM && !f.emptyChildAt(1)) {
            i = ue(f.dom) + 1;
            break;
          }
          e -= f.size;
        }
        i == -1 && (i = 0);
      }
      if (i > -1 && (a > n || u == this.children.length - 1)) {
        n = a;
        for (let c = u + 1; c < this.children.length; c++) {
          let d = this.children[c];
          if (d.size && d.dom.parentNode == this.contentDOM && !d.emptyChildAt(-1)) {
            o = ue(d.dom);
            break;
          }
          n += d.size;
        }
        o == -1 && (o = this.contentDOM.childNodes.length);
        break;
      }
      s = a;
    }
    return { node: this.contentDOM, from: e, to: n, fromOffset: i, toOffset: o };
  }
  emptyChildAt(e) {
    if (this.border || !this.contentDOM || !this.children.length)
      return !1;
    let n = this.children[e < 0 ? 0 : this.children.length - 1];
    return n.size == 0 || n.emptyChildAt(e);
  }
  domAfterPos(e) {
    let { node: n, offset: r } = this.domFromPos(e, 0);
    if (n.nodeType != 1 || r == n.childNodes.length)
      throw new RangeError("No node after pos " + e);
    return n.childNodes[r];
  }
  // View descs are responsible for setting any selection that falls
  // entirely inside of them, so that custom implementations can do
  // custom things with the selection. Note that this falls apart when
  // a selection starts in such a node and ends in another, in which
  // case we just use whatever domFromPos produces as a best effort.
  setSelection(e, n, r, i = !1) {
    let o = Math.min(e, n), s = Math.max(e, n);
    for (let h = 0, p = 0; h < this.children.length; h++) {
      let m = this.children[h], g = p + m.size;
      if (o > p && s < g)
        return m.setSelection(e - p - m.border, n - p - m.border, r, i);
      p = g;
    }
    let u = this.domFromPos(e, e ? -1 : 1), l = n == e ? u : this.domFromPos(n, n ? -1 : 1), a = r.root.getSelection(), c = r.domSelectionRange(), d = !1;
    if ((Oe || de) && e == n) {
      let { node: h, offset: p } = u;
      if (h.nodeType == 3) {
        if (d = !!(p && h.nodeValue[p - 1] == `
`), d && p == h.nodeValue.length)
          for (let m = h, g; m; m = m.parentNode) {
            if (g = m.nextSibling) {
              g.nodeName == "BR" && (u = l = { node: g.parentNode, offset: ue(g) + 1 });
              break;
            }
            let b = m.pmViewDesc;
            if (b && b.node && b.node.isBlock)
              break;
          }
      } else {
        let m = h.childNodes[p - 1];
        d = m && (m.nodeName == "BR" || m.contentEditable == "false");
      }
    }
    if (Oe && c.focusNode && c.focusNode != l.node && c.focusNode.nodeType == 1) {
      let h = c.focusNode.childNodes[c.focusOffset];
      h && h.contentEditable == "false" && (i = !0);
    }
    if (!(i || d && de) && Kt(u.node, u.offset, c.anchorNode, c.anchorOffset) && Kt(l.node, l.offset, c.focusNode, c.focusOffset))
      return;
    let f = !1;
    if ((a.extend || e == n) && !(d && Oe)) {
      a.collapse(u.node, u.offset);
      try {
        e != n && a.extend(l.node, l.offset), f = !0;
      } catch {
      }
    }
    if (!f) {
      if (e > n) {
        let p = u;
        u = l, l = p;
      }
      let h = document.createRange();
      h.setEnd(l.node, l.offset), h.setStart(u.node, u.offset), a.removeAllRanges(), a.addRange(h);
    }
  }
  ignoreMutation(e) {
    return !this.contentDOM && e.type != "selection";
  }
  get contentLost() {
    return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM);
  }
  // Remove a subtree of the element tree that has been touched
  // by a DOM change, so that the next update will redraw it.
  markDirty(e, n) {
    for (let r = 0, i = 0; i < this.children.length; i++) {
      let o = this.children[i], s = r + o.size;
      if (r == s ? e <= s && n >= r : e < s && n > r) {
        let u = r + o.border, l = s - o.border;
        if (e >= u && n <= l) {
          this.dirty = e == r || n == s ? Ft : ml, e == u && n == l && (o.contentLost || o.dom.parentNode != this.contentDOM) ? o.dirty = We : o.markDirty(e - u, n - u);
          return;
        } else
          o.dirty = o.dom == o.contentDOM && o.dom.parentNode == this.contentDOM && !o.children.length ? Ft : We;
      }
      r = s;
    }
    this.dirty = Ft;
  }
  markParentsDirty() {
    let e = 1;
    for (let n = this.parent; n; n = n.parent, e++) {
      let r = e == 1 ? Ft : ml;
      n.dirty < r && (n.dirty = r);
    }
  }
  get domAtom() {
    return !1;
  }
  get ignoreForCoords() {
    return !1;
  }
  get ignoreForSelection() {
    return !1;
  }
  isText(e) {
    return !1;
  }
}
class fd extends dr {
  constructor(e, n, r, i) {
    let o, s = n.type.toDOM;
    if (typeof s == "function" && (s = s(r, () => {
      if (!o)
        return i;
      if (o.parent)
        return o.parent.posBeforeChild(o);
    })), !n.type.spec.raw) {
      if (s.nodeType != 1) {
        let u = document.createElement("span");
        u.appendChild(s), s = u;
      }
      s.contentEditable = "false", s.classList.add("ProseMirror-widget");
    }
    super(e, [], s, null), this.widget = n, this.widget = n, o = this;
  }
  matchesWidget(e) {
    return this.dirty == Ne && e.type.eq(this.widget.type);
  }
  parseRule() {
    return { ignore: !0 };
  }
  stopEvent(e) {
    let n = this.widget.spec.stopEvent;
    return n ? n(e) : !1;
  }
  ignoreMutation(e) {
    return e.type != "selection" || this.widget.spec.ignoreSelection;
  }
  destroy() {
    this.widget.type.destroy(this.dom), super.destroy();
  }
  get domAtom() {
    return !0;
  }
  get ignoreForSelection() {
    return !!this.widget.type.spec.relaxedSide;
  }
  get side() {
    return this.widget.type.side;
  }
}
class B0 extends dr {
  constructor(e, n, r, i) {
    super(e, [], n, null), this.textDOM = r, this.text = i;
  }
  get size() {
    return this.text.length;
  }
  localPosFromDOM(e, n) {
    return e != this.textDOM ? this.posAtStart + (n ? this.size : 0) : this.posAtStart + n;
  }
  domFromPos(e) {
    return { node: this.textDOM, offset: e };
  }
  ignoreMutation(e) {
    return e.type === "characterData" && e.target.nodeValue == e.oldValue;
  }
}
class Jt extends dr {
  constructor(e, n, r, i, o) {
    super(e, [], r, i), this.mark = n, this.spec = o;
  }
  static create(e, n, r, i) {
    let o = i.nodeViews[n.type.name], s = o && o(n, i, r);
    return (!s || !s.dom) && (s = Yt.renderSpec(document, n.type.spec.toDOM(n, r), null, n.attrs)), new Jt(e, n, s.dom, s.contentDOM || s.dom, s);
  }
  parseRule() {
    return this.dirty & We || this.mark.type.spec.reparseInView ? null : { mark: this.mark.type.name, attrs: this.mark.attrs, contentElement: this.contentDOM };
  }
  matchesMark(e) {
    return this.dirty != We && this.mark.eq(e);
  }
  markDirty(e, n) {
    if (super.markDirty(e, n), this.dirty != Ne) {
      let r = this.parent;
      for (; !r.node; )
        r = r.parent;
      r.dirty < this.dirty && (r.dirty = this.dirty), this.dirty = Ne;
    }
  }
  slice(e, n, r) {
    let i = Jt.create(this.parent, this.mark, !0, r), o = this.children, s = this.size;
    n < s && (o = as(o, n, s, r)), e > 0 && (o = as(o, 0, e, r));
    for (let u = 0; u < o.length; u++)
      o[u].parent = i;
    return i.children = o, i;
  }
  ignoreMutation(e) {
    return this.spec.ignoreMutation ? this.spec.ignoreMutation(e) : super.ignoreMutation(e);
  }
  destroy() {
    this.spec.destroy && this.spec.destroy(), super.destroy();
  }
}
class At extends dr {
  constructor(e, n, r, i, o, s, u, l, a) {
    super(e, [], o, s), this.node = n, this.outerDeco = r, this.innerDeco = i, this.nodeDOM = u;
  }
  // By default, a node is rendered using the `toDOM` method from the
  // node type spec. But client code can use the `nodeViews` spec to
  // supply a custom node view, which can influence various aspects of
  // the way the node works.
  //
  // (Using subclassing for this was intentionally decided against,
  // since it'd require exposing a whole slew of finicky
  // implementation details to the user code that they probably will
  // never need.)
  static create(e, n, r, i, o, s) {
    let u = o.nodeViews[n.type.name], l, a = u && u(n, o, () => {
      if (!l)
        return s;
      if (l.parent)
        return l.parent.posBeforeChild(l);
    }, r, i), c = a && a.dom, d = a && a.contentDOM;
    if (n.isText) {
      if (!c)
        c = document.createTextNode(n.text);
      else if (c.nodeType != 3)
        throw new RangeError("Text must be rendered as a DOM text node");
    } else c || ({ dom: c, contentDOM: d } = Yt.renderSpec(document, n.type.spec.toDOM(n), null, n.attrs));
    !d && !n.isText && c.nodeName != "BR" && (c.hasAttribute("contenteditable") || (c.contentEditable = "false"), n.type.spec.draggable && (c.draggable = !0));
    let f = c;
    return c = gd(c, r, n), a ? l = new z0(e, n, r, i, c, d || null, f, a, o, s + 1) : n.isText ? new Wi(e, n, r, i, c, f, o) : new At(e, n, r, i, c, d || null, f, o, s + 1);
  }
  parseRule() {
    if (this.node.type.spec.reparseInView)
      return null;
    let e = { node: this.node.type.name, attrs: this.node.attrs };
    if (this.node.type.whitespace == "pre" && (e.preserveWhitespace = "full"), !this.contentDOM)
      e.getContent = () => this.node.content;
    else if (!this.contentLost)
      e.contentElement = this.contentDOM;
    else {
      for (let n = this.children.length - 1; n >= 0; n--) {
        let r = this.children[n];
        if (this.dom.contains(r.dom.parentNode)) {
          e.contentElement = r.dom.parentNode;
          break;
        }
      }
      e.contentElement || (e.getContent = () => w.empty);
    }
    return e;
  }
  matchesNode(e, n, r) {
    return this.dirty == Ne && e.eq(this.node) && Xr(n, this.outerDeco) && r.eq(this.innerDeco);
  }
  get size() {
    return this.node.nodeSize;
  }
  get border() {
    return this.node.isLeaf ? 0 : 1;
  }
  // Syncs `this.children` to match `this.node.content` and the local
  // decorations, possibly introducing nesting for marks. Then, in a
  // separate step, syncs the DOM inside `this.contentDOM` to
  // `this.children`.
  updateChildren(e, n) {
    let r = this.node.inlineContent, i = n, o = e.composing ? this.localCompositionInfo(e, n) : null, s = o && o.pos > -1 ? o : null, u = o && o.pos < 0, l = new H0(this, s && s.node, e);
    q0(this.node, this.innerDeco, (a, c, d) => {
      a.spec.marks ? l.syncToMarks(a.spec.marks, r, e, c) : a.type.side >= 0 && !d && l.syncToMarks(c == this.node.childCount ? P.none : this.node.child(c).marks, r, e, c), l.placeWidget(a, e, i);
    }, (a, c, d, f) => {
      l.syncToMarks(a.marks, r, e, f);
      let h;
      l.findNodeMatch(a, c, d, f) || u && e.state.selection.from > i && e.state.selection.to < i + a.nodeSize && (h = l.findIndexWithChild(o.node)) > -1 && l.updateNodeAt(a, c, d, h, e) || l.updateNextNode(a, c, d, e, f, i) || l.addNode(a, c, d, e, i), i += a.nodeSize;
    }), l.syncToMarks([], r, e, 0), this.node.isTextblock && l.addTextblockHacks(), l.destroyRest(), (l.changed || this.dirty == Ft) && (s && this.protectLocalComposition(e, s), pd(this.contentDOM, this.children, e), mn && W0(this.dom));
  }
  localCompositionInfo(e, n) {
    let { from: r, to: i } = e.state.selection;
    if (!(e.state.selection instanceof D) || r < n || i > n + this.node.content.size)
      return null;
    let o = e.input.compositionNode;
    if (!o || !this.dom.contains(o.parentNode))
      return null;
    if (this.node.inlineContent) {
      let s = o.nodeValue, u = U0(this.node.content, s, r - n, i - n);
      return u < 0 ? null : { node: o, pos: u, text: s };
    } else
      return { node: o, pos: -1, text: "" };
  }
  protectLocalComposition(e, { node: n, pos: r, text: i }) {
    if (this.getDesc(n))
      return;
    let o = n;
    for (; o.parentNode != this.contentDOM; o = o.parentNode) {
      for (; o.previousSibling; )
        o.parentNode.removeChild(o.previousSibling);
      for (; o.nextSibling; )
        o.parentNode.removeChild(o.nextSibling);
      o.pmViewDesc && (o.pmViewDesc = void 0);
    }
    let s = new B0(this, o, n, i);
    e.input.compositionNodes.push(s), this.children = as(this.children, r, r + i.length, e, s);
  }
  // If this desc must be updated to match the given node decoration,
  // do so and return true.
  update(e, n, r, i) {
    return this.dirty == We || !e.sameMarkup(this.node) ? !1 : (this.updateInner(e, n, r, i), !0);
  }
  updateInner(e, n, r, i) {
    this.updateOuterDeco(n), this.node = e, this.innerDeco = r, this.contentDOM && this.updateChildren(i, this.posAtStart), this.dirty = Ne;
  }
  updateOuterDeco(e) {
    if (Xr(e, this.outerDeco))
      return;
    let n = this.nodeDOM.nodeType != 1, r = this.dom;
    this.dom = md(this.dom, this.nodeDOM, ls(this.outerDeco, this.node, n), ls(e, this.node, n)), this.dom != r && (r.pmViewDesc = void 0, this.dom.pmViewDesc = this), this.outerDeco = e;
  }
  // Mark this node as being the selected node.
  selectNode() {
    this.nodeDOM.nodeType == 1 && (this.nodeDOM.classList.add("ProseMirror-selectednode"), (this.contentDOM || !this.node.type.spec.draggable) && (this.nodeDOM.draggable = !0));
  }
  // Remove selected node marking from this node.
  deselectNode() {
    this.nodeDOM.nodeType == 1 && (this.nodeDOM.classList.remove("ProseMirror-selectednode"), (this.contentDOM || !this.node.type.spec.draggable) && this.nodeDOM.removeAttribute("draggable"));
  }
  get domAtom() {
    return this.node.isAtom;
  }
}
function gl(t, e, n, r, i) {
  gd(r, e, t);
  let o = new At(void 0, t, e, n, r, r, r, i, 0);
  return o.contentDOM && o.updateChildren(i, 0), o;
}
class Wi extends At {
  constructor(e, n, r, i, o, s, u) {
    super(e, n, r, i, o, null, s, u, 0);
  }
  parseRule() {
    let e = this.nodeDOM.parentNode;
    for (; e && e != this.dom && !e.pmIsDeco; )
      e = e.parentNode;
    return { skip: e || !0 };
  }
  update(e, n, r, i) {
    return this.dirty == We || this.dirty != Ne && !this.inParent() || !e.sameMarkup(this.node) ? !1 : (this.updateOuterDeco(n), (this.dirty != Ne || e.text != this.node.text) && e.text != this.nodeDOM.nodeValue && (this.nodeDOM.nodeValue = e.text, i.trackWrites == this.nodeDOM && (i.trackWrites = null)), this.node = e, this.dirty = Ne, !0);
  }
  inParent() {
    let e = this.parent.contentDOM;
    for (let n = this.nodeDOM; n; n = n.parentNode)
      if (n == e)
        return !0;
    return !1;
  }
  domFromPos(e) {
    return { node: this.nodeDOM, offset: e };
  }
  localPosFromDOM(e, n, r) {
    return e == this.nodeDOM ? this.posAtStart + Math.min(n, this.node.text.length) : super.localPosFromDOM(e, n, r);
  }
  ignoreMutation(e) {
    return e.type != "characterData" && e.type != "selection";
  }
  slice(e, n, r) {
    let i = this.node.cut(e, n), o = document.createTextNode(i.text);
    return new Wi(this.parent, i, this.outerDeco, this.innerDeco, o, o, r);
  }
  markDirty(e, n) {
    super.markDirty(e, n), this.dom != this.nodeDOM && (e == 0 || n == this.nodeDOM.nodeValue.length) && (this.dirty = We);
  }
  get domAtom() {
    return !1;
  }
  isText(e) {
    return this.node.text == e;
  }
}
class hd extends dr {
  parseRule() {
    return { ignore: !0 };
  }
  matchesHack(e) {
    return this.dirty == Ne && this.dom.nodeName == e;
  }
  get domAtom() {
    return !0;
  }
  get ignoreForCoords() {
    return this.dom.nodeName == "IMG";
  }
}
class z0 extends At {
  constructor(e, n, r, i, o, s, u, l, a, c) {
    super(e, n, r, i, o, s, u, a, c), this.spec = l;
  }
  // A custom `update` method gets to decide whether the update goes
  // through. If it does, and there's a `contentDOM` node, our logic
  // updates the children.
  update(e, n, r, i) {
    if (this.dirty == We)
      return !1;
    if (this.spec.update && (this.node.type == e.type || this.spec.multiType)) {
      let o = this.spec.update(e, n, r);
      return o && this.updateInner(e, n, r, i), o;
    } else return !this.contentDOM && !e.isLeaf ? !1 : super.update(e, n, r, i);
  }
  selectNode() {
    this.spec.selectNode ? this.spec.selectNode() : super.selectNode();
  }
  deselectNode() {
    this.spec.deselectNode ? this.spec.deselectNode() : super.deselectNode();
  }
  setSelection(e, n, r, i) {
    this.spec.setSelection ? this.spec.setSelection(e, n, r.root) : super.setSelection(e, n, r, i);
  }
  destroy() {
    this.spec.destroy && this.spec.destroy(), super.destroy();
  }
  stopEvent(e) {
    return this.spec.stopEvent ? this.spec.stopEvent(e) : !1;
  }
  ignoreMutation(e) {
    return this.spec.ignoreMutation ? this.spec.ignoreMutation(e) : super.ignoreMutation(e);
  }
}
function pd(t, e, n) {
  let r = t.firstChild, i = !1;
  for (let o = 0; o < e.length; o++) {
    let s = e[o], u = s.dom;
    if (u.parentNode == t) {
      for (; u != r; )
        r = bl(r), i = !0;
      r = r.nextSibling;
    } else
      i = !0, t.insertBefore(u, r);
    if (s instanceof Jt) {
      let l = r ? r.previousSibling : t.lastChild;
      pd(s.contentDOM, s.children, n), r = l ? l.nextSibling : t.firstChild;
    }
  }
  for (; r; )
    r = bl(r), i = !0;
  i && n.trackWrites == t && (n.trackWrites = null);
}
const Bn = function(t) {
  t && (this.nodeName = t);
};
Bn.prototype = /* @__PURE__ */ Object.create(null);
const Pt = [new Bn()];
function ls(t, e, n) {
  if (t.length == 0)
    return Pt;
  let r = n ? Pt[0] : new Bn(), i = [r];
  for (let o = 0; o < t.length; o++) {
    let s = t[o].type.attrs;
    if (s) {
      s.nodeName && i.push(r = new Bn(s.nodeName));
      for (let u in s) {
        let l = s[u];
        l != null && (n && i.length == 1 && i.push(r = new Bn(e.isInline ? "span" : "div")), u == "class" ? r.class = (r.class ? r.class + " " : "") + l : u == "style" ? r.style = (r.style ? r.style + ";" : "") + l : u != "nodeName" && (r[u] = l));
      }
    }
  }
  return i;
}
function md(t, e, n, r) {
  if (n == Pt && r == Pt)
    return e;
  let i = e;
  for (let o = 0; o < r.length; o++) {
    let s = r[o], u = n[o];
    if (o) {
      let l;
      u && u.nodeName == s.nodeName && i != t && (l = i.parentNode) && l.nodeName.toLowerCase() == s.nodeName || (l = document.createElement(s.nodeName), l.pmIsDeco = !0, l.appendChild(i), u = Pt[0]), i = l;
    }
    $0(i, u || Pt[0], s);
  }
  return i;
}
function $0(t, e, n) {
  for (let r in e)
    r != "class" && r != "style" && r != "nodeName" && !(r in n) && t.removeAttribute(r);
  for (let r in n)
    r != "class" && r != "style" && r != "nodeName" && n[r] != e[r] && t.setAttribute(r, n[r]);
  if (e.class != n.class) {
    let r = e.class ? e.class.split(" ").filter(Boolean) : [], i = n.class ? n.class.split(" ").filter(Boolean) : [];
    for (let o = 0; o < r.length; o++)
      i.indexOf(r[o]) == -1 && t.classList.remove(r[o]);
    for (let o = 0; o < i.length; o++)
      r.indexOf(i[o]) == -1 && t.classList.add(i[o]);
    t.classList.length == 0 && t.removeAttribute("class");
  }
  if (e.style != n.style) {
    if (e.style) {
      let r = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, i;
      for (; i = r.exec(e.style); )
        t.style.removeProperty(i[1]);
    }
    n.style && (t.style.cssText += n.style);
  }
}
function gd(t, e, n) {
  return md(t, t, Pt, ls(e, n, t.nodeType != 1));
}
function Xr(t, e) {
  if (t.length != e.length)
    return !1;
  for (let n = 0; n < t.length; n++)
    if (!t[n].type.eq(e[n].type))
      return !1;
  return !0;
}
function bl(t) {
  let e = t.nextSibling;
  return t.parentNode.removeChild(t), e;
}
class H0 {
  constructor(e, n, r) {
    this.lock = n, this.view = r, this.index = 0, this.stack = [], this.changed = !1, this.top = e, this.preMatch = V0(e.node.content, e);
  }
  // Destroy and remove the children between the given indices in
  // `this.top`.
  destroyBetween(e, n) {
    if (e != n) {
      for (let r = e; r < n; r++)
        this.top.children[r].destroy();
      this.top.children.splice(e, n - e), this.changed = !0;
    }
  }
  // Destroy all remaining children in `this.top`.
  destroyRest() {
    this.destroyBetween(this.index, this.top.children.length);
  }
  // Sync the current stack of mark descs with the given array of
  // marks, reusing existing mark descs when possible.
  syncToMarks(e, n, r, i) {
    let o = 0, s = this.stack.length >> 1, u = Math.min(s, e.length);
    for (; o < u && (o == s - 1 ? this.top : this.stack[o + 1 << 1]).matchesMark(e[o]) && e[o].type.spec.spanning !== !1; )
      o++;
    for (; o < s; )
      this.destroyRest(), this.top.dirty = Ne, this.index = this.stack.pop(), this.top = this.stack.pop(), s--;
    for (; s < e.length; ) {
      this.stack.push(this.top, this.index + 1);
      let l = -1, a = this.top.children.length;
      i < this.preMatch.index && (a = Math.min(this.index + 3, a));
      for (let c = this.index; c < a; c++) {
        let d = this.top.children[c];
        if (d.matchesMark(e[s]) && !this.isLocked(d.dom)) {
          l = c;
          break;
        }
      }
      if (l > -1)
        l > this.index && (this.changed = !0, this.destroyBetween(this.index, l)), this.top = this.top.children[this.index];
      else {
        let c = Jt.create(this.top, e[s], n, r);
        this.top.children.splice(this.index, 0, c), this.top = c, this.changed = !0;
      }
      this.index = 0, s++;
    }
  }
  // Try to find a node desc matching the given data. Skip over it and
  // return true when successful.
  findNodeMatch(e, n, r, i) {
    let o = -1, s;
    if (i >= this.preMatch.index && (s = this.preMatch.matches[i - this.preMatch.index]).parent == this.top && s.matchesNode(e, n, r))
      o = this.top.children.indexOf(s, this.index);
    else
      for (let u = this.index, l = Math.min(this.top.children.length, u + 5); u < l; u++) {
        let a = this.top.children[u];
        if (a.matchesNode(e, n, r) && !this.preMatch.matched.has(a)) {
          o = u;
          break;
        }
      }
    return o < 0 ? !1 : (this.destroyBetween(this.index, o), this.index++, !0);
  }
  updateNodeAt(e, n, r, i, o) {
    let s = this.top.children[i];
    return s.dirty == We && s.dom == s.contentDOM && (s.dirty = Ft), s.update(e, n, r, o) ? (this.destroyBetween(this.index, i), this.index++, !0) : !1;
  }
  findIndexWithChild(e) {
    for (; ; ) {
      let n = e.parentNode;
      if (!n)
        return -1;
      if (n == this.top.contentDOM) {
        let r = e.pmViewDesc;
        if (r) {
          for (let i = this.index; i < this.top.children.length; i++)
            if (this.top.children[i] == r)
              return i;
        }
        return -1;
      }
      e = n;
    }
  }
  // Try to update the next node, if any, to the given data. Checks
  // pre-matches to avoid overwriting nodes that could still be used.
  updateNextNode(e, n, r, i, o, s) {
    for (let u = this.index; u < this.top.children.length; u++) {
      let l = this.top.children[u];
      if (l instanceof At) {
        let a = this.preMatch.matched.get(l);
        if (a != null && a != o)
          return !1;
        let c = l.dom, d, f = this.isLocked(c) && !(e.isText && l.node && l.node.isText && l.nodeDOM.nodeValue == e.text && l.dirty != We && Xr(n, l.outerDeco));
        if (!f && l.update(e, n, r, i))
          return this.destroyBetween(this.index, u), l.dom != c && (this.changed = !0), this.index++, !0;
        if (!f && (d = this.recreateWrapper(l, e, n, r, i, s)))
          return this.destroyBetween(this.index, u), this.top.children[this.index] = d, d.contentDOM && (d.dirty = Ft, d.updateChildren(i, s + 1), d.dirty = Ne), this.changed = !0, this.index++, !0;
        break;
      }
    }
    return !1;
  }
  // When a node with content is replaced by a different node with
  // identical content, move over its children.
  recreateWrapper(e, n, r, i, o, s) {
    if (e.dirty || n.isAtom || !e.children.length || !e.node.content.eq(n.content) || !Xr(r, e.outerDeco) || !i.eq(e.innerDeco))
      return null;
    let u = At.create(this.top, n, r, i, o, s);
    if (u.contentDOM) {
      u.children = e.children, e.children = [];
      for (let l of u.children)
        l.parent = u;
    }
    return e.destroy(), u;
  }
  // Insert the node as a newly created node desc.
  addNode(e, n, r, i, o) {
    let s = At.create(this.top, e, n, r, i, o);
    s.contentDOM && s.updateChildren(i, o + 1), this.top.children.splice(this.index++, 0, s), this.changed = !0;
  }
  placeWidget(e, n, r) {
    let i = this.index < this.top.children.length ? this.top.children[this.index] : null;
    if (i && i.matchesWidget(e) && (e == i.widget || !i.widget.type.toDOM.parentNode))
      this.index++;
    else {
      let o = new fd(this.top, e, n, r);
      this.top.children.splice(this.index++, 0, o), this.changed = !0;
    }
  }
  // Make sure a textblock looks and behaves correctly in
  // contentEditable.
  addTextblockHacks() {
    let e = this.top.children[this.index - 1], n = this.top;
    for (; e instanceof Jt; )
      n = e, e = n.children[n.children.length - 1];
    (!e || // Empty textblock
    !(e instanceof Wi) || /\n$/.test(e.node.text) || this.view.requiresGeckoHackNode && /\s$/.test(e.node.text)) && ((de || ae) && e && e.dom.contentEditable == "false" && this.addHackNode("IMG", n), this.addHackNode("BR", this.top));
  }
  addHackNode(e, n) {
    if (n == this.top && this.index < n.children.length && n.children[this.index].matchesHack(e))
      this.index++;
    else {
      let r = document.createElement(e);
      e == "IMG" && (r.className = "ProseMirror-separator", r.alt = ""), e == "BR" && (r.className = "ProseMirror-trailingBreak");
      let i = new hd(this.top, [], r, null);
      n != this.top ? n.children.push(i) : n.children.splice(this.index++, 0, i), this.changed = !0;
    }
  }
  isLocked(e) {
    return this.lock && (e == this.lock || e.nodeType == 1 && e.contains(this.lock.parentNode));
  }
}
function V0(t, e) {
  let n = e, r = n.children.length, i = t.childCount, o = /* @__PURE__ */ new Map(), s = [];
  e: for (; i > 0; ) {
    let u;
    for (; ; )
      if (r) {
        let a = n.children[r - 1];
        if (a instanceof Jt)
          n = a, r = a.children.length;
        else {
          u = a, r--;
          break;
        }
      } else {
        if (n == e)
          break e;
        r = n.parent.children.indexOf(n), n = n.parent;
      }
    let l = u.node;
    if (l) {
      if (l != t.child(i - 1))
        break;
      --i, o.set(u, i), s.push(u);
    }
  }
  return { index: i, matched: o, matches: s.reverse() };
}
function j0(t, e) {
  return t.type.side - e.type.side;
}
function q0(t, e, n, r) {
  let i = e.locals(t), o = 0;
  if (i.length == 0) {
    for (let a = 0; a < t.childCount; a++) {
      let c = t.child(a);
      r(c, i, e.forChild(o, c), a), o += c.nodeSize;
    }
    return;
  }
  let s = 0, u = [], l = null;
  for (let a = 0; ; ) {
    let c, d;
    for (; s < i.length && i[s].to == o; ) {
      let g = i[s++];
      g.widget && (c ? (d || (d = [c])).push(g) : c = g);
    }
    if (c)
      if (d) {
        d.sort(j0);
        for (let g = 0; g < d.length; g++)
          n(d[g], a, !!l);
      } else
        n(c, a, !!l);
    let f, h;
    if (l)
      h = -1, f = l, l = null;
    else if (a < t.childCount)
      h = a, f = t.child(a++);
    else
      break;
    for (let g = 0; g < u.length; g++)
      u[g].to <= o && u.splice(g--, 1);
    for (; s < i.length && i[s].from <= o && i[s].to > o; )
      u.push(i[s++]);
    let p = o + f.nodeSize;
    if (f.isText) {
      let g = p;
      s < i.length && i[s].from < g && (g = i[s].from);
      for (let b = 0; b < u.length; b++)
        u[b].to < g && (g = u[b].to);
      g < p && (l = f.cut(g - o), f = f.cut(0, g - o), p = g, h = -1);
    } else
      for (; s < i.length && i[s].to < p; )
        s++;
    let m = f.isInline && !f.isLeaf ? u.filter((g) => !g.inline) : u.slice();
    r(f, m, e.forChild(o, f), h), o = p;
  }
}
function W0(t) {
  if (t.nodeName == "UL" || t.nodeName == "OL") {
    let e = t.style.cssText;
    t.style.cssText = e + "; list-style: square !important", window.getComputedStyle(t).listStyle, t.style.cssText = e;
  }
}
function U0(t, e, n, r) {
  for (let i = 0, o = 0; i < t.childCount && o <= r; ) {
    let s = t.child(i++), u = o;
    if (o += s.nodeSize, !s.isText)
      continue;
    let l = s.text;
    for (; i < t.childCount; ) {
      let a = t.child(i++);
      if (o += a.nodeSize, !a.isText)
        break;
      l += a.text;
    }
    if (o >= n) {
      if (o >= r && l.slice(r - e.length - u, r - u) == e)
        return r - e.length;
      let a = u < r ? l.lastIndexOf(e, r - u - 1) : -1;
      if (a >= 0 && a + e.length + u >= n)
        return u + a;
      if (n == r && l.length >= r + e.length - u && l.slice(r - u, r - u + e.length) == e)
        return r;
    }
  }
  return -1;
}
function as(t, e, n, r, i) {
  let o = [];
  for (let s = 0, u = 0; s < t.length; s++) {
    let l = t[s], a = u, c = u += l.size;
    a >= n || c <= e ? o.push(l) : (a < e && o.push(l.slice(0, e - a, r)), i && (o.push(i), i = void 0), c > n && o.push(l.slice(n - a, l.size, r)));
  }
  return o;
}
function Ys(t, e = null) {
  let n = t.domSelectionRange(), r = t.state.doc;
  if (!n.focusNode)
    return null;
  let i = t.docView.nearestDesc(n.focusNode), o = i && i.size == 0, s = t.docView.posFromDOM(n.focusNode, n.focusOffset, 1);
  if (s < 0)
    return null;
  let u = r.resolve(s), l, a;
  if (qi(n)) {
    for (l = s; i && !i.node; )
      i = i.parent;
    let d = i.node;
    if (i && d.isAtom && _.isSelectable(d) && i.parent && !(d.isInline && k0(n.focusNode, n.focusOffset, i.dom))) {
      let f = i.posBefore;
      a = new _(s == f ? u : r.resolve(f));
    }
  } else {
    if (n instanceof t.dom.ownerDocument.defaultView.Selection && n.rangeCount > 1) {
      let d = s, f = s;
      for (let h = 0; h < n.rangeCount; h++) {
        let p = n.getRangeAt(h);
        d = Math.min(d, t.docView.posFromDOM(p.startContainer, p.startOffset, 1)), f = Math.max(f, t.docView.posFromDOM(p.endContainer, p.endOffset, -1));
      }
      if (d < 0)
        return null;
      [l, s] = f == t.state.selection.anchor ? [f, d] : [d, f], u = r.resolve(s);
    } else
      l = t.docView.posFromDOM(n.anchorNode, n.anchorOffset, 1);
    if (l < 0)
      return null;
  }
  let c = r.resolve(l);
  if (!a) {
    let d = e == "pointer" || t.state.selection.head < u.pos && !o ? 1 : -1;
    a = Qs(t, c, u, d);
  }
  return a;
}
function bd(t) {
  return t.editable ? t.hasFocus() : kd(t) && document.activeElement && document.activeElement.contains(t.dom);
}
function ot(t, e = !1) {
  let n = t.state.selection;
  if (yd(t, n), !!bd(t)) {
    if (!e && t.input.mouseDown && t.input.mouseDown.allowDefault && ae) {
      let r = t.domSelectionRange(), i = t.domObserver.currentSelection;
      if (r.anchorNode && i.anchorNode && Kt(r.anchorNode, r.anchorOffset, i.anchorNode, i.anchorOffset)) {
        t.input.mouseDown.delayedSelectionSync = !0, t.domObserver.setCurSelection();
        return;
      }
    }
    if (t.domObserver.disconnectSelection(), t.cursorWrapper)
      J0(t);
    else {
      let { anchor: r, head: i } = n, o, s;
      yl && !(n instanceof D) && (n.$from.parent.inlineContent || (o = kl(t, n.from)), !n.empty && !n.$from.parent.inlineContent && (s = kl(t, n.to))), t.docView.setSelection(r, i, t, e), yl && (o && xl(o), s && xl(s)), n.visible ? t.dom.classList.remove("ProseMirror-hideselection") : (t.dom.classList.add("ProseMirror-hideselection"), "onselectionchange" in document && K0(t));
    }
    t.domObserver.setCurSelection(), t.domObserver.connectSelection();
  }
}
const yl = de || ae && id < 63;
function kl(t, e) {
  let { node: n, offset: r } = t.docView.domFromPos(e, 0), i = r < n.childNodes.length ? n.childNodes[r] : null, o = r ? n.childNodes[r - 1] : null;
  if (de && i && i.contentEditable == "false")
    return ko(i);
  if ((!i || i.contentEditable == "false") && (!o || o.contentEditable == "false")) {
    if (i)
      return ko(i);
    if (o)
      return ko(o);
  }
}
function ko(t) {
  return t.contentEditable = "true", de && t.draggable && (t.draggable = !1, t.wasDraggable = !0), t;
}
function xl(t) {
  t.contentEditable = "false", t.wasDraggable && (t.draggable = !0, t.wasDraggable = null);
}
function K0(t) {
  let e = t.dom.ownerDocument;
  e.removeEventListener("selectionchange", t.input.hideSelectionGuard);
  let n = t.domSelectionRange(), r = n.anchorNode, i = n.anchorOffset;
  e.addEventListener("selectionchange", t.input.hideSelectionGuard = () => {
    (n.anchorNode != r || n.anchorOffset != i) && (e.removeEventListener("selectionchange", t.input.hideSelectionGuard), setTimeout(() => {
      (!bd(t) || t.state.selection.visible) && t.dom.classList.remove("ProseMirror-hideselection");
    }, 20));
  });
}
function J0(t) {
  let e = t.domSelection();
  if (!e)
    return;
  let n = t.cursorWrapper.dom, r = n.nodeName == "IMG";
  r ? e.collapse(n.parentNode, ue(n) + 1) : e.collapse(n, 0), !r && !t.state.selection.visible && ye && St <= 11 && (n.disabled = !0, n.disabled = !1);
}
function yd(t, e) {
  if (e instanceof _) {
    let n = t.docView.descAt(e.from);
    n != t.lastSelectedViewDesc && (Cl(t), n && n.selectNode(), t.lastSelectedViewDesc = n);
  } else
    Cl(t);
}
function Cl(t) {
  t.lastSelectedViewDesc && (t.lastSelectedViewDesc.parent && t.lastSelectedViewDesc.deselectNode(), t.lastSelectedViewDesc = void 0);
}
function Qs(t, e, n, r) {
  return t.someProp("createSelectionBetween", (i) => i(t, e, n)) || D.between(e, n, r);
}
function wl(t) {
  return t.editable && !t.hasFocus() ? !1 : kd(t);
}
function kd(t) {
  let e = t.domSelectionRange();
  if (!e.anchorNode)
    return !1;
  try {
    return t.dom.contains(e.anchorNode.nodeType == 3 ? e.anchorNode.parentNode : e.anchorNode) && (t.editable || t.dom.contains(e.focusNode.nodeType == 3 ? e.focusNode.parentNode : e.focusNode));
  } catch {
    return !1;
  }
}
function G0(t) {
  let e = t.docView.domFromPos(t.state.selection.anchor, 0), n = t.domSelectionRange();
  return Kt(e.node, e.offset, n.anchorNode, n.anchorOffset);
}
function cs(t, e) {
  let { $anchor: n, $head: r } = t.selection, i = e > 0 ? n.max(r) : n.min(r), o = i.parent.inlineContent ? i.depth ? t.doc.resolve(e > 0 ? i.after() : i.before()) : null : i;
  return o && O.findFrom(o, e);
}
function dt(t, e) {
  return t.dispatch(t.state.tr.setSelection(e).scrollIntoView()), !0;
}
function El(t, e, n) {
  let r = t.state.selection;
  if (r instanceof D)
    if (n.indexOf("s") > -1) {
      let { $head: i } = r, o = i.textOffset ? null : e < 0 ? i.nodeBefore : i.nodeAfter;
      if (!o || o.isText || !o.isLeaf)
        return !1;
      let s = t.state.doc.resolve(i.pos + o.nodeSize * (e < 0 ? -1 : 1));
      return dt(t, new D(r.$anchor, s));
    } else if (r.empty) {
      if (t.endOfTextblock(e > 0 ? "forward" : "backward")) {
        let i = cs(t.state, e);
        return i && i instanceof _ ? dt(t, i) : !1;
      } else if (!(_e && n.indexOf("m") > -1)) {
        let i = r.$head, o = i.textOffset ? null : e < 0 ? i.nodeBefore : i.nodeAfter, s;
        if (!o || o.isText)
          return !1;
        let u = e < 0 ? i.pos - o.nodeSize : i.pos;
        return o.isAtom || (s = t.docView.descAt(u)) && !s.contentDOM ? _.isSelectable(o) ? dt(t, new _(e < 0 ? t.state.doc.resolve(i.pos - o.nodeSize) : i)) : cr ? dt(t, new D(t.state.doc.resolve(e < 0 ? u : u + o.nodeSize))) : !1 : !1;
      }
    } else return !1;
  else {
    if (r instanceof _ && r.node.isInline)
      return dt(t, new D(e > 0 ? r.$to : r.$from));
    {
      let i = cs(t.state, e);
      return i ? dt(t, i) : !1;
    }
  }
}
function Yr(t) {
  return t.nodeType == 3 ? t.nodeValue.length : t.childNodes.length;
}
function zn(t, e) {
  let n = t.pmViewDesc;
  return n && n.size == 0 && (e < 0 || t.nextSibling || t.nodeName != "BR");
}
function tn(t, e) {
  return e < 0 ? Z0(t) : X0(t);
}
function Z0(t) {
  let e = t.domSelectionRange(), n = e.focusNode, r = e.focusOffset;
  if (!n)
    return;
  let i, o, s = !1;
  for (Oe && n.nodeType == 1 && r < Yr(n) && zn(n.childNodes[r], -1) && (s = !0); ; )
    if (r > 0) {
      if (n.nodeType != 1)
        break;
      {
        let u = n.childNodes[r - 1];
        if (zn(u, -1))
          i = n, o = --r;
        else if (u.nodeType == 3)
          n = u, r = n.nodeValue.length;
        else
          break;
      }
    } else {
      if (xd(n))
        break;
      {
        let u = n.previousSibling;
        for (; u && zn(u, -1); )
          i = n.parentNode, o = ue(u), u = u.previousSibling;
        if (u)
          n = u, r = Yr(n);
        else {
          if (n = n.parentNode, n == t.dom)
            break;
          r = 0;
        }
      }
    }
  s ? ds(t, n, r) : i && ds(t, i, o);
}
function X0(t) {
  let e = t.domSelectionRange(), n = e.focusNode, r = e.focusOffset;
  if (!n)
    return;
  let i = Yr(n), o, s;
  for (; ; )
    if (r < i) {
      if (n.nodeType != 1)
        break;
      let u = n.childNodes[r];
      if (zn(u, 1))
        o = n, s = ++r;
      else
        break;
    } else {
      if (xd(n))
        break;
      {
        let u = n.nextSibling;
        for (; u && zn(u, 1); )
          o = u.parentNode, s = ue(u) + 1, u = u.nextSibling;
        if (u)
          n = u, r = 0, i = Yr(n);
        else {
          if (n = n.parentNode, n == t.dom)
            break;
          r = i = 0;
        }
      }
    }
  o && ds(t, o, s);
}
function xd(t) {
  let e = t.pmViewDesc;
  return e && e.node && e.node.isBlock;
}
function Y0(t, e) {
  for (; t && e == t.childNodes.length && !ar(t); )
    e = ue(t) + 1, t = t.parentNode;
  for (; t && e < t.childNodes.length; ) {
    let n = t.childNodes[e];
    if (n.nodeType == 3)
      return n;
    if (n.nodeType == 1 && n.contentEditable == "false")
      break;
    t = n, e = 0;
  }
}
function Q0(t, e) {
  for (; t && !e && !ar(t); )
    e = ue(t), t = t.parentNode;
  for (; t && e; ) {
    let n = t.childNodes[e - 1];
    if (n.nodeType == 3)
      return n;
    if (n.nodeType == 1 && n.contentEditable == "false")
      break;
    t = n, e = t.childNodes.length;
  }
}
function ds(t, e, n) {
  if (e.nodeType != 3) {
    let o, s;
    (s = Y0(e, n)) ? (e = s, n = 0) : (o = Q0(e, n)) && (e = o, n = o.nodeValue.length);
  }
  let r = t.domSelection();
  if (!r)
    return;
  if (qi(r)) {
    let o = document.createRange();
    o.setEnd(e, n), o.setStart(e, n), r.removeAllRanges(), r.addRange(o);
  } else r.extend && r.extend(e, n);
  t.domObserver.setCurSelection();
  let { state: i } = t;
  setTimeout(() => {
    t.state == i && ot(t);
  }, 50);
}
function Sl(t, e) {
  let n = t.state.doc.resolve(e);
  if (!(ae || od) && n.parent.inlineContent) {
    let i = t.coordsAtPos(e);
    if (e > n.start()) {
      let o = t.coordsAtPos(e - 1), s = (o.top + o.bottom) / 2;
      if (s > i.top && s < i.bottom && Math.abs(o.left - i.left) > 1)
        return o.left < i.left ? "ltr" : "rtl";
    }
    if (e < n.end()) {
      let o = t.coordsAtPos(e + 1), s = (o.top + o.bottom) / 2;
      if (s > i.top && s < i.bottom && Math.abs(o.left - i.left) > 1)
        return o.left > i.left ? "ltr" : "rtl";
    }
  }
  return getComputedStyle(t.dom).direction == "rtl" ? "rtl" : "ltr";
}
function Al(t, e, n) {
  let r = t.state.selection;
  if (r instanceof D && !r.empty || n.indexOf("s") > -1 || _e && n.indexOf("m") > -1)
    return !1;
  let { $from: i, $to: o } = r;
  if (!i.parent.inlineContent || t.endOfTextblock(e < 0 ? "up" : "down")) {
    let s = cs(t.state, e);
    if (s && s instanceof _)
      return dt(t, s);
  }
  if (!i.parent.inlineContent) {
    let s = e < 0 ? i : o, u = r instanceof Ee ? O.near(s, e) : O.findFrom(s, e);
    return u ? dt(t, u) : !1;
  }
  return !1;
}
function vl(t, e) {
  if (!(t.state.selection instanceof D))
    return !0;
  let { $head: n, $anchor: r, empty: i } = t.state.selection;
  if (!n.sameParent(r))
    return !0;
  if (!i)
    return !1;
  if (t.endOfTextblock(e > 0 ? "forward" : "backward"))
    return !0;
  let o = !n.textOffset && (e < 0 ? n.nodeBefore : n.nodeAfter);
  if (o && !o.isText) {
    let s = t.state.tr;
    return e < 0 ? s.delete(n.pos - o.nodeSize, n.pos) : s.delete(n.pos, n.pos + o.nodeSize), t.dispatch(s), !0;
  }
  return !1;
}
function Ml(t, e, n) {
  t.domObserver.stop(), e.contentEditable = n, t.domObserver.start();
}
function em(t) {
  if (!de || t.state.selection.$head.parentOffset > 0)
    return !1;
  let { focusNode: e, focusOffset: n } = t.domSelectionRange();
  if (e && e.nodeType == 1 && n == 0 && e.firstChild && e.firstChild.contentEditable == "false") {
    let r = e.firstChild;
    Ml(t, r, "true"), setTimeout(() => Ml(t, r, "false"), 20);
  }
  return !1;
}
function tm(t) {
  let e = "";
  return t.ctrlKey && (e += "c"), t.metaKey && (e += "m"), t.altKey && (e += "a"), t.shiftKey && (e += "s"), e;
}
function nm(t, e) {
  let n = e.keyCode, r = tm(e);
  if (n == 8 || _e && n == 72 && r == "c")
    return vl(t, -1) || tn(t, -1);
  if (n == 46 && !e.shiftKey || _e && n == 68 && r == "c")
    return vl(t, 1) || tn(t, 1);
  if (n == 13 || n == 27)
    return !0;
  if (n == 37 || _e && n == 66 && r == "c") {
    let i = n == 37 ? Sl(t, t.state.selection.from) == "ltr" ? -1 : 1 : -1;
    return El(t, i, r) || tn(t, i);
  } else if (n == 39 || _e && n == 70 && r == "c") {
    let i = n == 39 ? Sl(t, t.state.selection.from) == "ltr" ? 1 : -1 : 1;
    return El(t, i, r) || tn(t, i);
  } else {
    if (n == 38 || _e && n == 80 && r == "c")
      return Al(t, -1, r) || tn(t, -1);
    if (n == 40 || _e && n == 78 && r == "c")
      return em(t) || Al(t, 1, r) || tn(t, 1);
    if (r == (_e ? "m" : "c") && (n == 66 || n == 73 || n == 89 || n == 90))
      return !0;
  }
  return !1;
}
function eu(t, e) {
  t.someProp("transformCopied", (h) => {
    e = h(e, t);
  });
  let n = [], { content: r, openStart: i, openEnd: o } = e;
  for (; i > 1 && o > 1 && r.childCount == 1 && r.firstChild.childCount == 1; ) {
    i--, o--;
    let h = r.firstChild;
    n.push(h.type.name, h.attrs != h.type.defaultAttrs ? h.attrs : null), r = h.content;
  }
  let s = t.someProp("clipboardSerializer") || Yt.fromSchema(t.state.schema), u = vd(), l = u.createElement("div");
  l.appendChild(s.serializeFragment(r, { document: u }));
  let a = l.firstChild, c, d = 0;
  for (; a && a.nodeType == 1 && (c = Ad[a.nodeName.toLowerCase()]); ) {
    for (let h = c.length - 1; h >= 0; h--) {
      let p = u.createElement(c[h]);
      for (; l.firstChild; )
        p.appendChild(l.firstChild);
      l.appendChild(p), d++;
    }
    a = l.firstChild;
  }
  a && a.nodeType == 1 && a.setAttribute("data-pm-slice", `${i} ${o}${d ? ` -${d}` : ""} ${JSON.stringify(n)}`);
  let f = t.someProp("clipboardTextSerializer", (h) => h(e, t)) || e.content.textBetween(0, e.content.size, `

`);
  return { dom: l, text: f, slice: e };
}
function Cd(t, e, n, r, i) {
  let o = i.parent.type.spec.code, s, u;
  if (!n && !e)
    return null;
  let l = !!e && (r || o || !n);
  if (l) {
    if (t.someProp("transformPastedText", (f) => {
      e = f(e, o || r, t);
    }), o)
      return u = new v(w.from(t.state.schema.text(e.replace(/\r\n?/g, `
`))), 0, 0), t.someProp("transformPasted", (f) => {
        u = f(u, t, !0);
      }), u;
    let d = t.someProp("clipboardTextParser", (f) => f(e, i, r, t));
    if (d)
      u = d;
    else {
      let f = i.marks(), { schema: h } = t.state, p = Yt.fromSchema(h);
      s = document.createElement("div"), e.split(/(?:\r\n?|\n)+/).forEach((m) => {
        let g = s.appendChild(document.createElement("p"));
        m && g.appendChild(p.serializeNode(h.text(m, f)));
      });
    }
  } else
    t.someProp("transformPastedHTML", (d) => {
      n = d(n, t);
    }), s = sm(n), cr && um(s);
  let a = s && s.querySelector("[data-pm-slice]"), c = a && /^(\d+) (\d+)(?: -(\d+))? (.*)/.exec(a.getAttribute("data-pm-slice") || "");
  if (c && c[3])
    for (let d = +c[3]; d > 0; d--) {
      let f = s.firstChild;
      for (; f && f.nodeType != 1; )
        f = f.nextSibling;
      if (!f)
        break;
      s = f;
    }
  if (u || (u = (t.someProp("clipboardParser") || t.someProp("domParser") || rt.fromSchema(t.state.schema)).parseSlice(s, {
    preserveWhitespace: !!(l || c),
    context: i,
    ruleFromNode(f) {
      return f.nodeName == "BR" && !f.nextSibling && f.parentNode && !rm.test(f.parentNode.nodeName) ? { ignore: !0 } : null;
    }
  })), c)
    u = lm(Tl(u, +c[1], +c[2]), c[4]);
  else if (u = v.maxOpen(im(u.content, i), !0), u.openStart || u.openEnd) {
    let d = 0, f = 0;
    for (let h = u.content.firstChild; d < u.openStart && !h.type.spec.isolating; d++, h = h.firstChild)
      ;
    for (let h = u.content.lastChild; f < u.openEnd && !h.type.spec.isolating; f++, h = h.lastChild)
      ;
    u = Tl(u, d, f);
  }
  return t.someProp("transformPasted", (d) => {
    u = d(u, t, l);
  }), u;
}
const rm = /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i;
function im(t, e) {
  if (t.childCount < 2)
    return t;
  for (let n = e.depth; n >= 0; n--) {
    let i = e.node(n).contentMatchAt(e.index(n)), o, s = [];
    if (t.forEach((u) => {
      if (!s)
        return;
      let l = i.findWrapping(u.type), a;
      if (!l)
        return s = null;
      if (a = s.length && o.length && Ed(l, o, u, s[s.length - 1], 0))
        s[s.length - 1] = a;
      else {
        s.length && (s[s.length - 1] = Sd(s[s.length - 1], o.length));
        let c = wd(u, l);
        s.push(c), i = i.matchType(c.type), o = l;
      }
    }), s)
      return w.from(s);
  }
  return t;
}
function wd(t, e, n = 0) {
  for (let r = e.length - 1; r >= n; r--)
    t = e[r].create(null, w.from(t));
  return t;
}
function Ed(t, e, n, r, i) {
  if (i < t.length && i < e.length && t[i] == e[i]) {
    let o = Ed(t, e, n, r.lastChild, i + 1);
    if (o)
      return r.copy(r.content.replaceChild(r.childCount - 1, o));
    if (r.contentMatchAt(r.childCount).matchType(i == t.length - 1 ? n.type : t[i + 1]))
      return r.copy(r.content.append(w.from(wd(n, t, i + 1))));
  }
}
function Sd(t, e) {
  if (e == 0)
    return t;
  let n = t.content.replaceChild(t.childCount - 1, Sd(t.lastChild, e - 1)), r = t.contentMatchAt(t.childCount).fillBefore(w.empty, !0);
  return t.copy(n.append(r));
}
function fs(t, e, n, r, i, o) {
  let s = e < 0 ? t.firstChild : t.lastChild, u = s.content;
  return t.childCount > 1 && (o = 0), i < r - 1 && (u = fs(u, e, n, r, i + 1, o)), i >= n && (u = e < 0 ? s.contentMatchAt(0).fillBefore(u, o <= i).append(u) : u.append(s.contentMatchAt(s.childCount).fillBefore(w.empty, !0))), t.replaceChild(e < 0 ? 0 : t.childCount - 1, s.copy(u));
}
function Tl(t, e, n) {
  return e < t.openStart && (t = new v(fs(t.content, -1, e, t.openStart, 0, t.openEnd), e, t.openEnd)), n < t.openEnd && (t = new v(fs(t.content, 1, n, t.openEnd, 0, 0), t.openStart, n)), t;
}
const Ad = {
  thead: ["table"],
  tbody: ["table"],
  tfoot: ["table"],
  caption: ["table"],
  colgroup: ["table"],
  col: ["table", "colgroup"],
  tr: ["table", "tbody"],
  td: ["table", "tbody", "tr"],
  th: ["table", "tbody", "tr"]
};
let _l = null;
function vd() {
  return _l || (_l = document.implementation.createHTMLDocument("title"));
}
let xo = null;
function om(t) {
  let e = window.trustedTypes;
  return e ? (xo || (xo = e.defaultPolicy || e.createPolicy("ProseMirrorClipboard", { createHTML: (n) => n })), xo.createHTML(t)) : t;
}
function sm(t) {
  let e = /^(\s*<meta [^>]*>)*/.exec(t);
  e && (t = t.slice(e[0].length));
  let n = vd().createElement("div"), r = /<([a-z][^>\s]+)/i.exec(t), i;
  if ((i = r && Ad[r[1].toLowerCase()]) && (t = i.map((o) => "<" + o + ">").join("") + t + i.map((o) => "</" + o + ">").reverse().join("")), n.innerHTML = om(t), i)
    for (let o = 0; o < i.length; o++)
      n = n.querySelector(i[o]) || n;
  return n;
}
function um(t) {
  let e = t.querySelectorAll(ae ? "span:not([class]):not([style])" : "span.Apple-converted-space");
  for (let n = 0; n < e.length; n++) {
    let r = e[n];
    r.childNodes.length == 1 && r.textContent == " " && r.parentNode && r.parentNode.replaceChild(t.ownerDocument.createTextNode(" "), r);
  }
}
function lm(t, e) {
  if (!t.size)
    return t;
  let n = t.content.firstChild.type.schema, r;
  try {
    r = JSON.parse(e);
  } catch {
    return t;
  }
  let { content: i, openStart: o, openEnd: s } = t;
  for (let u = r.length - 2; u >= 0; u -= 2) {
    let l = n.nodes[r[u]];
    if (!l || l.hasRequiredAttrs())
      break;
    i = w.from(l.create(r[u + 1], i)), o++, s++;
  }
  return new v(i, o, s);
}
const me = {}, ge = {}, am = { touchstart: !0, touchmove: !0 };
class cm {
  constructor() {
    this.shiftKey = !1, this.mouseDown = null, this.lastKeyCode = null, this.lastKeyCodeTime = 0, this.lastClick = { time: 0, x: 0, y: 0, type: "", button: 0 }, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastIOSEnter = 0, this.lastIOSEnterFallbackTimeout = -1, this.lastFocus = 0, this.lastTouch = 0, this.lastChromeDelete = 0, this.composing = !1, this.compositionNode = null, this.composingTimeout = -1, this.compositionNodes = [], this.compositionEndedAt = -2e8, this.compositionID = 1, this.badSafariComposition = !1, this.compositionPendingChanges = 0, this.domChangeCount = 0, this.eventHandlers = /* @__PURE__ */ Object.create(null), this.hideSelectionGuard = null;
  }
}
function dm(t) {
  for (let e in me) {
    let n = me[e];
    t.dom.addEventListener(e, t.input.eventHandlers[e] = (r) => {
      hm(t, r) && !tu(t, r) && (t.editable || !(r.type in ge)) && n(t, r);
    }, am[e] ? { passive: !0 } : void 0);
  }
  de && t.dom.addEventListener("input", () => null), hs(t);
}
function Ct(t, e) {
  t.input.lastSelectionOrigin = e, t.input.lastSelectionTime = Date.now();
}
function fm(t) {
  t.domObserver.stop();
  for (let e in t.input.eventHandlers)
    t.dom.removeEventListener(e, t.input.eventHandlers[e]);
  clearTimeout(t.input.composingTimeout), clearTimeout(t.input.lastIOSEnterFallbackTimeout);
}
function hs(t) {
  t.someProp("handleDOMEvents", (e) => {
    for (let n in e)
      t.input.eventHandlers[n] || t.dom.addEventListener(n, t.input.eventHandlers[n] = (r) => tu(t, r));
  });
}
function tu(t, e) {
  return t.someProp("handleDOMEvents", (n) => {
    let r = n[e.type];
    return r ? r(t, e) || e.defaultPrevented : !1;
  });
}
function hm(t, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let n = e.target; n != t.dom; n = n.parentNode)
    if (!n || n.nodeType == 11 || n.pmViewDesc && n.pmViewDesc.stopEvent(e))
      return !1;
  return !0;
}
function pm(t, e) {
  !tu(t, e) && me[e.type] && (t.editable || !(e.type in ge)) && me[e.type](t, e);
}
ge.keydown = (t, e) => {
  let n = e;
  if (t.input.shiftKey = n.keyCode == 16 || n.shiftKey, !Td(t, n) && (t.input.lastKeyCode = n.keyCode, t.input.lastKeyCodeTime = Date.now(), !(nt && ae && n.keyCode == 13)))
    if (n.keyCode != 229 && t.domObserver.forceFlush(), mn && n.keyCode == 13 && !n.ctrlKey && !n.altKey && !n.metaKey) {
      let r = Date.now();
      t.input.lastIOSEnter = r, t.input.lastIOSEnterFallbackTimeout = setTimeout(() => {
        t.input.lastIOSEnter == r && (t.someProp("handleKeyDown", (i) => i(t, Lt(13, "Enter"))), t.input.lastIOSEnter = 0);
      }, 200);
    } else t.someProp("handleKeyDown", (r) => r(t, n)) || nm(t, n) ? n.preventDefault() : Ct(t, "key");
};
ge.keyup = (t, e) => {
  e.keyCode == 16 && (t.input.shiftKey = !1);
};
ge.keypress = (t, e) => {
  let n = e;
  if (Td(t, n) || !n.charCode || n.ctrlKey && !n.altKey || _e && n.metaKey)
    return;
  if (t.someProp("handleKeyPress", (i) => i(t, n))) {
    n.preventDefault();
    return;
  }
  let r = t.state.selection;
  if (!(r instanceof D) || !r.$from.sameParent(r.$to)) {
    let i = String.fromCharCode(n.charCode), o = () => t.state.tr.insertText(i).scrollIntoView();
    !/[\r\n]/.test(i) && !t.someProp("handleTextInput", (s) => s(t, r.$from.pos, r.$to.pos, i, o)) && t.dispatch(o()), n.preventDefault();
  }
};
function Ui(t) {
  return { left: t.clientX, top: t.clientY };
}
function mm(t, e) {
  let n = e.x - t.clientX, r = e.y - t.clientY;
  return n * n + r * r < 100;
}
function nu(t, e, n, r, i) {
  if (r == -1)
    return !1;
  let o = t.state.doc.resolve(r);
  for (let s = o.depth + 1; s > 0; s--)
    if (t.someProp(e, (u) => s > o.depth ? u(t, n, o.nodeAfter, o.before(s), i, !0) : u(t, n, o.node(s), o.before(s), i, !1)))
      return !0;
  return !1;
}
function cn(t, e, n) {
  if (t.focused || t.focus(), t.state.selection.eq(e))
    return;
  let r = t.state.tr.setSelection(e);
  r.setMeta("pointer", !0), t.dispatch(r);
}
function gm(t, e) {
  if (e == -1)
    return !1;
  let n = t.state.doc.resolve(e), r = n.nodeAfter;
  return r && r.isAtom && _.isSelectable(r) ? (cn(t, new _(n)), !0) : !1;
}
function bm(t, e) {
  if (e == -1)
    return !1;
  let n = t.state.selection, r, i;
  n instanceof _ && (r = n.node);
  let o = t.state.doc.resolve(e);
  for (let s = o.depth + 1; s > 0; s--) {
    let u = s > o.depth ? o.nodeAfter : o.node(s);
    if (_.isSelectable(u)) {
      r && n.$from.depth > 0 && s >= n.$from.depth && o.before(n.$from.depth + 1) == n.$from.pos ? i = o.before(n.$from.depth) : i = o.before(s);
      break;
    }
  }
  return i != null ? (cn(t, _.create(t.state.doc, i)), !0) : !1;
}
function ym(t, e, n, r, i) {
  return nu(t, "handleClickOn", e, n, r) || t.someProp("handleClick", (o) => o(t, e, r)) || (i ? bm(t, n) : gm(t, n));
}
function km(t, e, n, r) {
  return nu(t, "handleDoubleClickOn", e, n, r) || t.someProp("handleDoubleClick", (i) => i(t, e, r));
}
function xm(t, e, n, r) {
  return nu(t, "handleTripleClickOn", e, n, r) || t.someProp("handleTripleClick", (i) => i(t, e, r)) || Cm(t, n, r);
}
function Cm(t, e, n) {
  if (n.button != 0)
    return !1;
  let r = t.state.doc;
  if (e == -1)
    return r.inlineContent ? (cn(t, D.create(r, 0, r.content.size)), !0) : !1;
  let i = r.resolve(e);
  for (let o = i.depth + 1; o > 0; o--) {
    let s = o > i.depth ? i.nodeAfter : i.node(o), u = i.before(o);
    if (s.inlineContent)
      cn(t, D.create(r, u + 1, u + 1 + s.content.size));
    else if (_.isSelectable(s))
      cn(t, _.create(r, u));
    else
      continue;
    return !0;
  }
}
function ru(t) {
  return Qr(t);
}
const Md = _e ? "metaKey" : "ctrlKey";
me.mousedown = (t, e) => {
  let n = e;
  t.input.shiftKey = n.shiftKey;
  let r = ru(t), i = Date.now(), o = "singleClick";
  i - t.input.lastClick.time < 500 && mm(n, t.input.lastClick) && !n[Md] && t.input.lastClick.button == n.button && (t.input.lastClick.type == "singleClick" ? o = "doubleClick" : t.input.lastClick.type == "doubleClick" && (o = "tripleClick")), t.input.lastClick = { time: i, x: n.clientX, y: n.clientY, type: o, button: n.button };
  let s = t.posAtCoords(Ui(n));
  s && (o == "singleClick" ? (t.input.mouseDown && t.input.mouseDown.done(), t.input.mouseDown = new wm(t, s, n, !!r)) : (o == "doubleClick" ? km : xm)(t, s.pos, s.inside, n) ? n.preventDefault() : Ct(t, "pointer"));
};
class wm {
  constructor(e, n, r, i) {
    this.view = e, this.pos = n, this.event = r, this.flushed = i, this.delayedSelectionSync = !1, this.mightDrag = null, this.startDoc = e.state.doc, this.selectNode = !!r[Md], this.allowDefault = r.shiftKey;
    let o, s;
    if (n.inside > -1)
      o = e.state.doc.nodeAt(n.inside), s = n.inside;
    else {
      let c = e.state.doc.resolve(n.pos);
      o = c.parent, s = c.depth ? c.before() : 0;
    }
    const u = i ? null : r.target, l = u ? e.docView.nearestDesc(u, !0) : null;
    this.target = l && l.nodeDOM.nodeType == 1 ? l.nodeDOM : null;
    let { selection: a } = e.state;
    (r.button == 0 && o.type.spec.draggable && o.type.spec.selectable !== !1 || a instanceof _ && a.from <= s && a.to > s) && (this.mightDrag = {
      node: o,
      pos: s,
      addAttr: !!(this.target && !this.target.draggable),
      setUneditable: !!(this.target && Oe && !this.target.hasAttribute("contentEditable"))
    }), this.target && this.mightDrag && (this.mightDrag.addAttr || this.mightDrag.setUneditable) && (this.view.domObserver.stop(), this.mightDrag.addAttr && (this.target.draggable = !0), this.mightDrag.setUneditable && setTimeout(() => {
      this.view.input.mouseDown == this && this.target.setAttribute("contentEditable", "false");
    }, 20), this.view.domObserver.start()), e.root.addEventListener("mouseup", this.up = this.up.bind(this)), e.root.addEventListener("mousemove", this.move = this.move.bind(this)), Ct(e, "pointer");
  }
  done() {
    this.view.root.removeEventListener("mouseup", this.up), this.view.root.removeEventListener("mousemove", this.move), this.mightDrag && this.target && (this.view.domObserver.stop(), this.mightDrag.addAttr && this.target.removeAttribute("draggable"), this.mightDrag.setUneditable && this.target.removeAttribute("contentEditable"), this.view.domObserver.start()), this.delayedSelectionSync && setTimeout(() => ot(this.view)), this.view.input.mouseDown = null;
  }
  up(e) {
    if (this.done(), !this.view.dom.contains(e.target))
      return;
    let n = this.pos;
    this.view.state.doc != this.startDoc && (n = this.view.posAtCoords(Ui(e))), this.updateAllowDefault(e), this.allowDefault || !n ? Ct(this.view, "pointer") : ym(this.view, n.pos, n.inside, e, this.selectNode) ? e.preventDefault() : e.button == 0 && (this.flushed || // Safari ignores clicks on draggable elements
    de && this.mightDrag && !this.mightDrag.node.isAtom || // Chrome will sometimes treat a node selection as a
    // cursor, but still report that the node is selected
    // when asked through getSelection. You'll then get a
    // situation where clicking at the point where that
    // (hidden) cursor is doesn't change the selection, and
    // thus doesn't get a reaction from ProseMirror. This
    // works around that.
    ae && !this.view.state.selection.visible && Math.min(Math.abs(n.pos - this.view.state.selection.from), Math.abs(n.pos - this.view.state.selection.to)) <= 2) ? (cn(this.view, O.near(this.view.state.doc.resolve(n.pos))), e.preventDefault()) : Ct(this.view, "pointer");
  }
  move(e) {
    this.updateAllowDefault(e), Ct(this.view, "pointer"), e.buttons == 0 && this.done();
  }
  updateAllowDefault(e) {
    !this.allowDefault && (Math.abs(this.event.x - e.clientX) > 4 || Math.abs(this.event.y - e.clientY) > 4) && (this.allowDefault = !0);
  }
}
me.touchstart = (t) => {
  t.input.lastTouch = Date.now(), ru(t), Ct(t, "pointer");
};
me.touchmove = (t) => {
  t.input.lastTouch = Date.now(), Ct(t, "pointer");
};
me.contextmenu = (t) => ru(t);
function Td(t, e) {
  return t.composing ? !0 : de && Math.abs(e.timeStamp - t.input.compositionEndedAt) < 500 ? (t.input.compositionEndedAt = -2e8, !0) : !1;
}
const Em = nt ? 5e3 : -1;
ge.compositionstart = ge.compositionupdate = (t) => {
  if (!t.composing) {
    t.domObserver.flush();
    let { state: e } = t, n = e.selection.$to;
    if (e.selection instanceof D && (e.storedMarks || !n.textOffset && n.parentOffset && n.nodeBefore.marks.some((r) => r.type.spec.inclusive === !1) || ae && od && Sm(t)))
      t.markCursor = t.state.storedMarks || n.marks(), Qr(t, !0), t.markCursor = null;
    else if (Qr(t, !e.selection.empty), Oe && e.selection.empty && n.parentOffset && !n.textOffset && n.nodeBefore.marks.length) {
      let r = t.domSelectionRange();
      for (let i = r.focusNode, o = r.focusOffset; i && i.nodeType == 1 && o != 0; ) {
        let s = o < 0 ? i.lastChild : i.childNodes[o - 1];
        if (!s)
          break;
        if (s.nodeType == 3) {
          let u = t.domSelection();
          u && u.collapse(s, s.nodeValue.length);
          break;
        } else
          i = s, o = -1;
      }
    }
    t.input.composing = !0;
  }
  _d(t, Em);
};
function Sm(t) {
  let { focusNode: e, focusOffset: n } = t.domSelectionRange();
  if (!e || e.nodeType != 1 || n >= e.childNodes.length)
    return !1;
  let r = e.childNodes[n];
  return r.nodeType == 1 && r.contentEditable == "false";
}
ge.compositionend = (t, e) => {
  t.composing && (t.input.composing = !1, t.input.compositionEndedAt = e.timeStamp, t.input.compositionPendingChanges = t.domObserver.pendingRecords().length ? t.input.compositionID : 0, t.input.compositionNode = null, t.input.badSafariComposition ? t.domObserver.forceFlush() : t.input.compositionPendingChanges && Promise.resolve().then(() => t.domObserver.flush()), t.input.compositionID++, _d(t, 20));
};
function _d(t, e) {
  clearTimeout(t.input.composingTimeout), e > -1 && (t.input.composingTimeout = setTimeout(() => Qr(t), e));
}
function Dd(t) {
  for (t.composing && (t.input.composing = !1, t.input.compositionEndedAt = vm()); t.input.compositionNodes.length > 0; )
    t.input.compositionNodes.pop().markParentsDirty();
}
function Am(t) {
  let e = t.domSelectionRange();
  if (!e.focusNode)
    return null;
  let n = b0(e.focusNode, e.focusOffset), r = y0(e.focusNode, e.focusOffset);
  if (n && r && n != r) {
    let i = r.pmViewDesc, o = t.domObserver.lastChangedTextNode;
    if (n == o || r == o)
      return o;
    if (!i || !i.isText(r.nodeValue))
      return r;
    if (t.input.compositionNode == r) {
      let s = n.pmViewDesc;
      if (!(!s || !s.isText(n.nodeValue)))
        return r;
    }
  }
  return n || r;
}
function vm() {
  let t = document.createEvent("Event");
  return t.initEvent("event", !0, !0), t.timeStamp;
}
function Qr(t, e = !1) {
  if (!(nt && t.domObserver.flushingSoon >= 0)) {
    if (t.domObserver.forceFlush(), Dd(t), e || t.docView && t.docView.dirty) {
      let n = Ys(t), r = t.state.selection;
      return n && !n.eq(r) ? t.dispatch(t.state.tr.setSelection(n)) : (t.markCursor || e) && !r.$from.node(r.$from.sharedDepth(r.to)).inlineContent ? t.dispatch(t.state.tr.deleteSelection()) : t.updateState(t.state), !0;
    }
    return !1;
  }
}
function Mm(t, e) {
  if (!t.dom.parentNode)
    return;
  let n = t.dom.parentNode.appendChild(document.createElement("div"));
  n.appendChild(e), n.style.cssText = "position: fixed; left: -10000px; top: 10px";
  let r = getSelection(), i = document.createRange();
  i.selectNodeContents(e), t.dom.blur(), r.removeAllRanges(), r.addRange(i), setTimeout(() => {
    n.parentNode && n.parentNode.removeChild(n), t.focus();
  }, 50);
}
const Xn = ye && St < 15 || mn && w0 < 604;
me.copy = ge.cut = (t, e) => {
  let n = e, r = t.state.selection, i = n.type == "cut";
  if (r.empty)
    return;
  let o = Xn ? null : n.clipboardData, s = r.content(), { dom: u, text: l } = eu(t, s);
  o ? (n.preventDefault(), o.clearData(), o.setData("text/html", u.innerHTML), o.setData("text/plain", l)) : Mm(t, u), i && t.dispatch(t.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"));
};
function Tm(t) {
  return t.openStart == 0 && t.openEnd == 0 && t.content.childCount == 1 ? t.content.firstChild : null;
}
function _m(t, e) {
  if (!t.dom.parentNode)
    return;
  let n = t.input.shiftKey || t.state.selection.$from.parent.type.spec.code, r = t.dom.parentNode.appendChild(document.createElement(n ? "textarea" : "div"));
  n || (r.contentEditable = "true"), r.style.cssText = "position: fixed; left: -10000px; top: 10px", r.focus();
  let i = t.input.shiftKey && t.input.lastKeyCode != 45;
  setTimeout(() => {
    t.focus(), r.parentNode && r.parentNode.removeChild(r), n ? Yn(t, r.value, null, i, e) : Yn(t, r.textContent, r.innerHTML, i, e);
  }, 50);
}
function Yn(t, e, n, r, i) {
  let o = Cd(t, e, n, r, t.state.selection.$from);
  if (t.someProp("handlePaste", (l) => l(t, i, o || v.empty)))
    return !0;
  if (!o)
    return !1;
  let s = Tm(o), u = s ? t.state.tr.replaceSelectionWith(s, r) : t.state.tr.replaceSelection(o);
  return t.dispatch(u.scrollIntoView().setMeta("paste", !0).setMeta("uiEvent", "paste")), !0;
}
function Od(t) {
  let e = t.getData("text/plain") || t.getData("Text");
  if (e)
    return e;
  let n = t.getData("text/uri-list");
  return n ? n.replace(/\r?\n/g, " ") : "";
}
ge.paste = (t, e) => {
  let n = e;
  if (t.composing && !nt)
    return;
  let r = Xn ? null : n.clipboardData, i = t.input.shiftKey && t.input.lastKeyCode != 45;
  r && Yn(t, Od(r), r.getData("text/html"), i, n) ? n.preventDefault() : _m(t, n);
};
class Nd {
  constructor(e, n, r) {
    this.slice = e, this.move = n, this.node = r;
  }
}
const Dm = _e ? "altKey" : "ctrlKey";
function Rd(t, e) {
  let n = t.someProp("dragCopies", (r) => !r(e));
  return n ?? !e[Dm];
}
me.dragstart = (t, e) => {
  let n = e, r = t.input.mouseDown;
  if (r && r.done(), !n.dataTransfer)
    return;
  let i = t.state.selection, o = i.empty ? null : t.posAtCoords(Ui(n)), s;
  if (!(o && o.pos >= i.from && o.pos <= (i instanceof _ ? i.to - 1 : i.to))) {
    if (r && r.mightDrag)
      s = _.create(t.state.doc, r.mightDrag.pos);
    else if (n.target && n.target.nodeType == 1) {
      let d = t.docView.nearestDesc(n.target, !0);
      d && d.node.type.spec.draggable && d != t.docView && (s = _.create(t.state.doc, d.posBefore));
    }
  }
  let u = (s || t.state.selection).content(), { dom: l, text: a, slice: c } = eu(t, u);
  (!n.dataTransfer.files.length || !ae || id > 120) && n.dataTransfer.clearData(), n.dataTransfer.setData(Xn ? "Text" : "text/html", l.innerHTML), n.dataTransfer.effectAllowed = "copyMove", Xn || n.dataTransfer.setData("text/plain", a), t.dragging = new Nd(c, Rd(t, n), s);
};
me.dragend = (t) => {
  let e = t.dragging;
  window.setTimeout(() => {
    t.dragging == e && (t.dragging = null);
  }, 50);
};
ge.dragover = ge.dragenter = (t, e) => e.preventDefault();
ge.drop = (t, e) => {
  try {
    Om(t, e, t.dragging);
  } finally {
    t.dragging = null;
  }
};
function Om(t, e, n) {
  if (!e.dataTransfer)
    return;
  let r = t.posAtCoords(Ui(e));
  if (!r)
    return;
  let i = t.state.doc.resolve(r.pos), o = n && n.slice;
  o ? t.someProp("transformPasted", (h) => {
    o = h(o, t, !1);
  }) : o = Cd(t, Od(e.dataTransfer), Xn ? null : e.dataTransfer.getData("text/html"), !1, i);
  let s = !!(n && Rd(t, e));
  if (t.someProp("handleDrop", (h) => h(t, e, o || v.empty, s))) {
    e.preventDefault();
    return;
  }
  if (!o)
    return;
  e.preventDefault();
  let u = o ? Pc(t.state.doc, i.pos, o) : i.pos;
  u == null && (u = i.pos);
  let l = t.state.tr;
  if (s) {
    let { node: h } = n;
    h ? h.replace(l) : l.deleteSelection();
  }
  let a = l.mapping.map(u), c = o.openStart == 0 && o.openEnd == 0 && o.content.childCount == 1, d = l.doc;
  if (c ? l.replaceRangeWith(a, a, o.content.firstChild) : l.replaceRange(a, a, o), l.doc.eq(d))
    return;
  let f = l.doc.resolve(a);
  if (c && _.isSelectable(o.content.firstChild) && f.nodeAfter && f.nodeAfter.sameMarkup(o.content.firstChild))
    l.setSelection(new _(f));
  else {
    let h = l.mapping.map(u);
    l.mapping.maps[l.mapping.maps.length - 1].forEach((p, m, g, b) => h = b), l.setSelection(Qs(t, f, l.doc.resolve(h)));
  }
  t.focus(), t.dispatch(l.setMeta("uiEvent", "drop"));
}
me.focus = (t) => {
  t.input.lastFocus = Date.now(), t.focused || (t.domObserver.stop(), t.dom.classList.add("ProseMirror-focused"), t.domObserver.start(), t.focused = !0, setTimeout(() => {
    t.docView && t.hasFocus() && !t.domObserver.currentSelection.eq(t.domSelectionRange()) && ot(t);
  }, 20));
};
me.blur = (t, e) => {
  let n = e;
  t.focused && (t.domObserver.stop(), t.dom.classList.remove("ProseMirror-focused"), t.domObserver.start(), n.relatedTarget && t.dom.contains(n.relatedTarget) && t.domObserver.currentSelection.clear(), t.focused = !1);
};
me.beforeinput = (t, e) => {
  if (ae && nt && e.inputType == "deleteContentBackward") {
    t.domObserver.flushSoon();
    let { domChangeCount: r } = t.input;
    setTimeout(() => {
      if (t.input.domChangeCount != r || (t.dom.blur(), t.focus(), t.someProp("handleKeyDown", (o) => o(t, Lt(8, "Backspace")))))
        return;
      let { $cursor: i } = t.state.selection;
      i && i.pos > 0 && t.dispatch(t.state.tr.delete(i.pos - 1, i.pos).scrollIntoView());
    }, 50);
  }
};
for (let t in ge)
  me[t] = ge[t];
function Qn(t, e) {
  if (t == e)
    return !0;
  for (let n in t)
    if (t[n] !== e[n])
      return !1;
  for (let n in e)
    if (!(n in t))
      return !1;
  return !0;
}
class ei {
  constructor(e, n) {
    this.toDOM = e, this.spec = n || Vt, this.side = this.spec.side || 0;
  }
  map(e, n, r, i) {
    let { pos: o, deleted: s } = e.mapResult(n.from + i, this.side < 0 ? -1 : 1);
    return s ? null : new re(o - r, o - r, this);
  }
  valid() {
    return !0;
  }
  eq(e) {
    return this == e || e instanceof ei && (this.spec.key && this.spec.key == e.spec.key || this.toDOM == e.toDOM && Qn(this.spec, e.spec));
  }
  destroy(e) {
    this.spec.destroy && this.spec.destroy(e);
  }
}
class vt {
  constructor(e, n) {
    this.attrs = e, this.spec = n || Vt;
  }
  map(e, n, r, i) {
    let o = e.map(n.from + i, this.spec.inclusiveStart ? -1 : 1) - r, s = e.map(n.to + i, this.spec.inclusiveEnd ? 1 : -1) - r;
    return o >= s ? null : new re(o, s, this);
  }
  valid(e, n) {
    return n.from < n.to;
  }
  eq(e) {
    return this == e || e instanceof vt && Qn(this.attrs, e.attrs) && Qn(this.spec, e.spec);
  }
  static is(e) {
    return e.type instanceof vt;
  }
  destroy() {
  }
}
class iu {
  constructor(e, n) {
    this.attrs = e, this.spec = n || Vt;
  }
  map(e, n, r, i) {
    let o = e.mapResult(n.from + i, 1);
    if (o.deleted)
      return null;
    let s = e.mapResult(n.to + i, -1);
    return s.deleted || s.pos <= o.pos ? null : new re(o.pos - r, s.pos - r, this);
  }
  valid(e, n) {
    let { index: r, offset: i } = e.content.findIndex(n.from), o;
    return i == n.from && !(o = e.child(r)).isText && i + o.nodeSize == n.to;
  }
  eq(e) {
    return this == e || e instanceof iu && Qn(this.attrs, e.attrs) && Qn(this.spec, e.spec);
  }
  destroy() {
  }
}
class re {
  /**
  @internal
  */
  constructor(e, n, r) {
    this.from = e, this.to = n, this.type = r;
  }
  /**
  @internal
  */
  copy(e, n) {
    return new re(e, n, this.type);
  }
  /**
  @internal
  */
  eq(e, n = 0) {
    return this.type.eq(e.type) && this.from + n == e.from && this.to + n == e.to;
  }
  /**
  @internal
  */
  map(e, n, r) {
    return this.type.map(e, this, n, r);
  }
  /**
  Creates a widget decoration, which is a DOM node that's shown in
  the document at the given position. It is recommended that you
  delay rendering the widget by passing a function that will be
  called when the widget is actually drawn in a view, but you can
  also directly pass a DOM node. `getPos` can be used to find the
  widget's current document position.
  */
  static widget(e, n, r) {
    return new re(e, e, new ei(n, r));
  }
  /**
  Creates an inline decoration, which adds the given attributes to
  each inline node between `from` and `to`.
  */
  static inline(e, n, r, i) {
    return new re(e, n, new vt(r, i));
  }
  /**
  Creates a node decoration. `from` and `to` should point precisely
  before and after a node in the document. That node, and only that
  node, will receive the given attributes.
  */
  static node(e, n, r, i) {
    return new re(e, n, new iu(r, i));
  }
  /**
  The spec provided when creating this decoration. Can be useful
  if you've stored extra information in that object.
  */
  get spec() {
    return this.type.spec;
  }
  /**
  @internal
  */
  get inline() {
    return this.type instanceof vt;
  }
  /**
  @internal
  */
  get widget() {
    return this.type instanceof ei;
  }
}
const sn = [], Vt = {};
class B {
  /**
  @internal
  */
  constructor(e, n) {
    this.local = e.length ? e : sn, this.children = n.length ? n : sn;
  }
  /**
  Create a set of decorations, using the structure of the given
  document. This will consume (modify) the `decorations` array, so
  you must make a copy if you want need to preserve that.
  */
  static create(e, n) {
    return n.length ? ti(n, e, 0, Vt) : ce;
  }
  /**
  Find all decorations in this set which touch the given range
  (including decorations that start or end directly at the
  boundaries) and match the given predicate on their spec. When
  `start` and `end` are omitted, all decorations in the set are
  considered. When `predicate` isn't given, all decorations are
  assumed to match.
  */
  find(e, n, r) {
    let i = [];
    return this.findInner(e ?? 0, n ?? 1e9, i, 0, r), i;
  }
  findInner(e, n, r, i, o) {
    for (let s = 0; s < this.local.length; s++) {
      let u = this.local[s];
      u.from <= n && u.to >= e && (!o || o(u.spec)) && r.push(u.copy(u.from + i, u.to + i));
    }
    for (let s = 0; s < this.children.length; s += 3)
      if (this.children[s] < n && this.children[s + 1] > e) {
        let u = this.children[s] + 1;
        this.children[s + 2].findInner(e - u, n - u, r, i + u, o);
      }
  }
  /**
  Map the set of decorations in response to a change in the
  document.
  */
  map(e, n, r) {
    return this == ce || e.maps.length == 0 ? this : this.mapInner(e, n, 0, 0, r || Vt);
  }
  /**
  @internal
  */
  mapInner(e, n, r, i, o) {
    let s;
    for (let u = 0; u < this.local.length; u++) {
      let l = this.local[u].map(e, r, i);
      l && l.type.valid(n, l) ? (s || (s = [])).push(l) : o.onRemove && o.onRemove(this.local[u].spec);
    }
    return this.children.length ? Nm(this.children, s || [], e, n, r, i, o) : s ? new B(s.sort(jt), sn) : ce;
  }
  /**
  Add the given array of decorations to the ones in the set,
  producing a new set. Consumes the `decorations` array. Needs
  access to the current document to create the appropriate tree
  structure.
  */
  add(e, n) {
    return n.length ? this == ce ? B.create(e, n) : this.addInner(e, n, 0) : this;
  }
  addInner(e, n, r) {
    let i, o = 0;
    e.forEach((u, l) => {
      let a = l + r, c;
      if (c = Ld(n, u, a)) {
        for (i || (i = this.children.slice()); o < i.length && i[o] < l; )
          o += 3;
        i[o] == l ? i[o + 2] = i[o + 2].addInner(u, c, a + 1) : i.splice(o, 0, l, l + u.nodeSize, ti(c, u, a + 1, Vt)), o += 3;
      }
    });
    let s = Id(o ? Fd(n) : n, -r);
    for (let u = 0; u < s.length; u++)
      s[u].type.valid(e, s[u]) || s.splice(u--, 1);
    return new B(s.length ? this.local.concat(s).sort(jt) : this.local, i || this.children);
  }
  /**
  Create a new set that contains the decorations in this set, minus
  the ones in the given array.
  */
  remove(e) {
    return e.length == 0 || this == ce ? this : this.removeInner(e, 0);
  }
  removeInner(e, n) {
    let r = this.children, i = this.local;
    for (let o = 0; o < r.length; o += 3) {
      let s, u = r[o] + n, l = r[o + 1] + n;
      for (let c = 0, d; c < e.length; c++)
        (d = e[c]) && d.from > u && d.to < l && (e[c] = null, (s || (s = [])).push(d));
      if (!s)
        continue;
      r == this.children && (r = this.children.slice());
      let a = r[o + 2].removeInner(s, u + 1);
      a != ce ? r[o + 2] = a : (r.splice(o, 3), o -= 3);
    }
    if (i.length) {
      for (let o = 0, s; o < e.length; o++)
        if (s = e[o])
          for (let u = 0; u < i.length; u++)
            i[u].eq(s, n) && (i == this.local && (i = this.local.slice()), i.splice(u--, 1));
    }
    return r == this.children && i == this.local ? this : i.length || r.length ? new B(i, r) : ce;
  }
  forChild(e, n) {
    if (this == ce)
      return this;
    if (n.isLeaf)
      return B.empty;
    let r, i;
    for (let u = 0; u < this.children.length; u += 3)
      if (this.children[u] >= e) {
        this.children[u] == e && (r = this.children[u + 2]);
        break;
      }
    let o = e + 1, s = o + n.content.size;
    for (let u = 0; u < this.local.length; u++) {
      let l = this.local[u];
      if (l.from < s && l.to > o && l.type instanceof vt) {
        let a = Math.max(o, l.from) - o, c = Math.min(s, l.to) - o;
        a < c && (i || (i = [])).push(l.copy(a, c));
      }
    }
    if (i) {
      let u = new B(i.sort(jt), sn);
      return r ? new mt([u, r]) : u;
    }
    return r || ce;
  }
  /**
  @internal
  */
  eq(e) {
    if (this == e)
      return !0;
    if (!(e instanceof B) || this.local.length != e.local.length || this.children.length != e.children.length)
      return !1;
    for (let n = 0; n < this.local.length; n++)
      if (!this.local[n].eq(e.local[n]))
        return !1;
    for (let n = 0; n < this.children.length; n += 3)
      if (this.children[n] != e.children[n] || this.children[n + 1] != e.children[n + 1] || !this.children[n + 2].eq(e.children[n + 2]))
        return !1;
    return !0;
  }
  /**
  @internal
  */
  locals(e) {
    return ou(this.localsInner(e));
  }
  /**
  @internal
  */
  localsInner(e) {
    if (this == ce)
      return sn;
    if (e.inlineContent || !this.local.some(vt.is))
      return this.local;
    let n = [];
    for (let r = 0; r < this.local.length; r++)
      this.local[r].type instanceof vt || n.push(this.local[r]);
    return n;
  }
  forEachSet(e) {
    e(this);
  }
}
B.empty = new B([], []);
B.removeOverlap = ou;
const ce = B.empty;
class mt {
  constructor(e) {
    this.members = e;
  }
  map(e, n) {
    const r = this.members.map((i) => i.map(e, n, Vt));
    return mt.from(r);
  }
  forChild(e, n) {
    if (n.isLeaf)
      return B.empty;
    let r = [];
    for (let i = 0; i < this.members.length; i++) {
      let o = this.members[i].forChild(e, n);
      o != ce && (o instanceof mt ? r = r.concat(o.members) : r.push(o));
    }
    return mt.from(r);
  }
  eq(e) {
    if (!(e instanceof mt) || e.members.length != this.members.length)
      return !1;
    for (let n = 0; n < this.members.length; n++)
      if (!this.members[n].eq(e.members[n]))
        return !1;
    return !0;
  }
  locals(e) {
    let n, r = !0;
    for (let i = 0; i < this.members.length; i++) {
      let o = this.members[i].localsInner(e);
      if (o.length)
        if (!n)
          n = o;
        else {
          r && (n = n.slice(), r = !1);
          for (let s = 0; s < o.length; s++)
            n.push(o[s]);
        }
    }
    return n ? ou(r ? n : n.sort(jt)) : sn;
  }
  // Create a group for the given array of decoration sets, or return
  // a single set when possible.
  static from(e) {
    switch (e.length) {
      case 0:
        return ce;
      case 1:
        return e[0];
      default:
        return new mt(e.every((n) => n instanceof B) ? e : e.reduce((n, r) => n.concat(r instanceof B ? r : r.members), []));
    }
  }
  forEachSet(e) {
    for (let n = 0; n < this.members.length; n++)
      this.members[n].forEachSet(e);
  }
}
function Nm(t, e, n, r, i, o, s) {
  let u = t.slice();
  for (let a = 0, c = o; a < n.maps.length; a++) {
    let d = 0;
    n.maps[a].forEach((f, h, p, m) => {
      let g = m - p - (h - f);
      for (let b = 0; b < u.length; b += 3) {
        let y = u[b + 1];
        if (y < 0 || f > y + c - d)
          continue;
        let k = u[b] + c - d;
        h >= k ? u[b + 1] = f <= k ? -2 : -1 : f >= c && g && (u[b] += g, u[b + 1] += g);
      }
      d += g;
    }), c = n.maps[a].map(c, -1);
  }
  let l = !1;
  for (let a = 0; a < u.length; a += 3)
    if (u[a + 1] < 0) {
      if (u[a + 1] == -2) {
        l = !0, u[a + 1] = -1;
        continue;
      }
      let c = n.map(t[a] + o), d = c - i;
      if (d < 0 || d >= r.content.size) {
        l = !0;
        continue;
      }
      let f = n.map(t[a + 1] + o, -1), h = f - i, { index: p, offset: m } = r.content.findIndex(d), g = r.maybeChild(p);
      if (g && m == d && m + g.nodeSize == h) {
        let b = u[a + 2].mapInner(n, g, c + 1, t[a] + o + 1, s);
        b != ce ? (u[a] = d, u[a + 1] = h, u[a + 2] = b) : (u[a + 1] = -2, l = !0);
      } else
        l = !0;
    }
  if (l) {
    let a = Rm(u, t, e, n, i, o, s), c = ti(a, r, 0, s);
    e = c.local;
    for (let d = 0; d < u.length; d += 3)
      u[d + 1] < 0 && (u.splice(d, 3), d -= 3);
    for (let d = 0, f = 0; d < c.children.length; d += 3) {
      let h = c.children[d];
      for (; f < u.length && u[f] < h; )
        f += 3;
      u.splice(f, 0, c.children[d], c.children[d + 1], c.children[d + 2]);
    }
  }
  return new B(e.sort(jt), u);
}
function Id(t, e) {
  if (!e || !t.length)
    return t;
  let n = [];
  for (let r = 0; r < t.length; r++) {
    let i = t[r];
    n.push(new re(i.from + e, i.to + e, i.type));
  }
  return n;
}
function Rm(t, e, n, r, i, o, s) {
  function u(l, a) {
    for (let c = 0; c < l.local.length; c++) {
      let d = l.local[c].map(r, i, a);
      d ? n.push(d) : s.onRemove && s.onRemove(l.local[c].spec);
    }
    for (let c = 0; c < l.children.length; c += 3)
      u(l.children[c + 2], l.children[c] + a + 1);
  }
  for (let l = 0; l < t.length; l += 3)
    t[l + 1] == -1 && u(t[l + 2], e[l] + o + 1);
  return n;
}
function Ld(t, e, n) {
  if (e.isLeaf)
    return null;
  let r = n + e.nodeSize, i = null;
  for (let o = 0, s; o < t.length; o++)
    (s = t[o]) && s.from > n && s.to < r && ((i || (i = [])).push(s), t[o] = null);
  return i;
}
function Fd(t) {
  let e = [];
  for (let n = 0; n < t.length; n++)
    t[n] != null && e.push(t[n]);
  return e;
}
function ti(t, e, n, r) {
  let i = [], o = !1;
  e.forEach((u, l) => {
    let a = Ld(t, u, l + n);
    if (a) {
      o = !0;
      let c = ti(a, u, n + l + 1, r);
      c != ce && i.push(l, l + u.nodeSize, c);
    }
  });
  let s = Id(o ? Fd(t) : t, -n).sort(jt);
  for (let u = 0; u < s.length; u++)
    s[u].type.valid(e, s[u]) || (r.onRemove && r.onRemove(s[u].spec), s.splice(u--, 1));
  return s.length || i.length ? new B(s, i) : ce;
}
function jt(t, e) {
  return t.from - e.from || t.to - e.to;
}
function ou(t) {
  let e = t;
  for (let n = 0; n < e.length - 1; n++) {
    let r = e[n];
    if (r.from != r.to)
      for (let i = n + 1; i < e.length; i++) {
        let o = e[i];
        if (o.from == r.from) {
          o.to != r.to && (e == t && (e = t.slice()), e[i] = o.copy(o.from, r.to), Dl(e, i + 1, o.copy(r.to, o.to)));
          continue;
        } else {
          o.from < r.to && (e == t && (e = t.slice()), e[n] = r.copy(r.from, o.from), Dl(e, i, r.copy(o.from, r.to)));
          break;
        }
      }
  }
  return e;
}
function Dl(t, e, n) {
  for (; e < t.length && jt(n, t[e]) > 0; )
    e++;
  t.splice(e, 0, n);
}
function Co(t) {
  let e = [];
  return t.someProp("decorations", (n) => {
    let r = n(t.state);
    r && r != ce && e.push(r);
  }), t.cursorWrapper && e.push(B.create(t.state.doc, [t.cursorWrapper.deco])), mt.from(e);
}
const Im = {
  childList: !0,
  characterData: !0,
  characterDataOldValue: !0,
  attributes: !0,
  attributeOldValue: !0,
  subtree: !0
}, Lm = ye && St <= 11;
class Fm {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  set(e) {
    this.anchorNode = e.anchorNode, this.anchorOffset = e.anchorOffset, this.focusNode = e.focusNode, this.focusOffset = e.focusOffset;
  }
  clear() {
    this.anchorNode = this.focusNode = null;
  }
  eq(e) {
    return e.anchorNode == this.anchorNode && e.anchorOffset == this.anchorOffset && e.focusNode == this.focusNode && e.focusOffset == this.focusOffset;
  }
}
class Pm {
  constructor(e, n) {
    this.view = e, this.handleDOMChange = n, this.queue = [], this.flushingSoon = -1, this.observer = null, this.currentSelection = new Fm(), this.onCharData = null, this.suppressingSelectionUpdates = !1, this.lastChangedTextNode = null, this.observer = window.MutationObserver && new window.MutationObserver((r) => {
      for (let i = 0; i < r.length; i++)
        this.queue.push(r[i]);
      ye && St <= 11 && r.some((i) => i.type == "childList" && i.removedNodes.length || i.type == "characterData" && i.oldValue.length > i.target.nodeValue.length) ? this.flushSoon() : de && e.composing && r.some((i) => i.type == "childList" && i.target.nodeName == "TR") ? (e.input.badSafariComposition = !0, this.flushSoon()) : this.flush();
    }), Lm && (this.onCharData = (r) => {
      this.queue.push({ target: r.target, type: "characterData", oldValue: r.prevValue }), this.flushSoon();
    }), this.onSelectionChange = this.onSelectionChange.bind(this);
  }
  flushSoon() {
    this.flushingSoon < 0 && (this.flushingSoon = window.setTimeout(() => {
      this.flushingSoon = -1, this.flush();
    }, 20));
  }
  forceFlush() {
    this.flushingSoon > -1 && (window.clearTimeout(this.flushingSoon), this.flushingSoon = -1, this.flush());
  }
  start() {
    this.observer && (this.observer.takeRecords(), this.observer.observe(this.view.dom, Im)), this.onCharData && this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.connectSelection();
  }
  stop() {
    if (this.observer) {
      let e = this.observer.takeRecords();
      if (e.length) {
        for (let n = 0; n < e.length; n++)
          this.queue.push(e[n]);
        window.setTimeout(() => this.flush(), 20);
      }
      this.observer.disconnect();
    }
    this.onCharData && this.view.dom.removeEventListener("DOMCharacterDataModified", this.onCharData), this.disconnectSelection();
  }
  connectSelection() {
    this.view.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
  }
  disconnectSelection() {
    this.view.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
  }
  suppressSelectionUpdates() {
    this.suppressingSelectionUpdates = !0, setTimeout(() => this.suppressingSelectionUpdates = !1, 50);
  }
  onSelectionChange() {
    if (wl(this.view)) {
      if (this.suppressingSelectionUpdates)
        return ot(this.view);
      if (ye && St <= 11 && !this.view.state.selection.empty) {
        let e = this.view.domSelectionRange();
        if (e.focusNode && Kt(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset))
          return this.flushSoon();
      }
      this.flush();
    }
  }
  setCurSelection() {
    this.currentSelection.set(this.view.domSelectionRange());
  }
  ignoreSelectionChange(e) {
    if (!e.focusNode)
      return !0;
    let n = /* @__PURE__ */ new Set(), r;
    for (let o = e.focusNode; o; o = pn(o))
      n.add(o);
    for (let o = e.anchorNode; o; o = pn(o))
      if (n.has(o)) {
        r = o;
        break;
      }
    let i = r && this.view.docView.nearestDesc(r);
    if (i && i.ignoreMutation({
      type: "selection",
      target: r.nodeType == 3 ? r.parentNode : r
    }))
      return this.setCurSelection(), !0;
  }
  pendingRecords() {
    if (this.observer)
      for (let e of this.observer.takeRecords())
        this.queue.push(e);
    return this.queue;
  }
  flush() {
    let { view: e } = this;
    if (!e.docView || this.flushingSoon > -1)
      return;
    let n = this.pendingRecords();
    n.length && (this.queue = []);
    let r = e.domSelectionRange(), i = !this.suppressingSelectionUpdates && !this.currentSelection.eq(r) && wl(e) && !this.ignoreSelectionChange(r), o = -1, s = -1, u = !1, l = [];
    if (e.editable)
      for (let c = 0; c < n.length; c++) {
        let d = this.registerMutation(n[c], l);
        d && (o = o < 0 ? d.from : Math.min(d.from, o), s = s < 0 ? d.to : Math.max(d.to, s), d.typeOver && (u = !0));
      }
    if (l.some((c) => c.nodeName == "BR") && (e.input.lastKeyCode == 8 || e.input.lastKeyCode == 46)) {
      for (let c of l)
        if (c.nodeName == "BR" && c.parentNode) {
          let d = c.nextSibling;
          d && d.nodeType == 1 && d.contentEditable == "false" && c.parentNode.removeChild(c);
        }
    } else if (Oe && l.length) {
      let c = l.filter((d) => d.nodeName == "BR");
      if (c.length == 2) {
        let [d, f] = c;
        d.parentNode && d.parentNode.parentNode == f.parentNode ? f.remove() : d.remove();
      } else {
        let { focusNode: d } = this.currentSelection;
        for (let f of c) {
          let h = f.parentNode;
          h && h.nodeName == "LI" && (!d || $m(e, d) != h) && f.remove();
        }
      }
    }
    let a = null;
    o < 0 && i && e.input.lastFocus > Date.now() - 200 && Math.max(e.input.lastTouch, e.input.lastClick.time) < Date.now() - 300 && qi(r) && (a = Ys(e)) && a.eq(O.near(e.state.doc.resolve(0), 1)) ? (e.input.lastFocus = 0, ot(e), this.currentSelection.set(r), e.scrollToSelection()) : (o > -1 || i) && (o > -1 && (e.docView.markDirty(o, s), Bm(e)), e.input.badSafariComposition && (e.input.badSafariComposition = !1, Hm(e, l)), this.handleDOMChange(o, s, u, l), e.docView && e.docView.dirty ? e.updateState(e.state) : this.currentSelection.eq(r) || ot(e), this.currentSelection.set(r));
  }
  registerMutation(e, n) {
    if (n.indexOf(e.target) > -1)
      return null;
    let r = this.view.docView.nearestDesc(e.target);
    if (e.type == "attributes" && (r == this.view.docView || e.attributeName == "contenteditable" || // Firefox sometimes fires spurious events for null/empty styles
    e.attributeName == "style" && !e.oldValue && !e.target.getAttribute("style")) || !r || r.ignoreMutation(e))
      return null;
    if (e.type == "childList") {
      for (let c = 0; c < e.addedNodes.length; c++) {
        let d = e.addedNodes[c];
        n.push(d), d.nodeType == 3 && (this.lastChangedTextNode = d);
      }
      if (r.contentDOM && r.contentDOM != r.dom && !r.contentDOM.contains(e.target))
        return { from: r.posBefore, to: r.posAfter };
      let i = e.previousSibling, o = e.nextSibling;
      if (ye && St <= 11 && e.addedNodes.length)
        for (let c = 0; c < e.addedNodes.length; c++) {
          let { previousSibling: d, nextSibling: f } = e.addedNodes[c];
          (!d || Array.prototype.indexOf.call(e.addedNodes, d) < 0) && (i = d), (!f || Array.prototype.indexOf.call(e.addedNodes, f) < 0) && (o = f);
        }
      let s = i && i.parentNode == e.target ? ue(i) + 1 : 0, u = r.localPosFromDOM(e.target, s, -1), l = o && o.parentNode == e.target ? ue(o) : e.target.childNodes.length, a = r.localPosFromDOM(e.target, l, 1);
      return { from: u, to: a };
    } else return e.type == "attributes" ? { from: r.posAtStart - r.border, to: r.posAtEnd + r.border } : (this.lastChangedTextNode = e.target, {
      from: r.posAtStart,
      to: r.posAtEnd,
      // An event was generated for a text change that didn't change
      // any text. Mark the dom change to fall back to assuming the
      // selection was typed over with an identical value if it can't
      // find another change.
      typeOver: e.target.nodeValue == e.oldValue
    });
  }
}
let Ol = /* @__PURE__ */ new WeakMap(), Nl = !1;
function Bm(t) {
  if (!Ol.has(t) && (Ol.set(t, null), ["normal", "nowrap", "pre-line"].indexOf(getComputedStyle(t.dom).whiteSpace) !== -1)) {
    if (t.requiresGeckoHackNode = Oe, Nl)
      return;
    console.warn("ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package."), Nl = !0;
  }
}
function Rl(t, e) {
  let n = e.startContainer, r = e.startOffset, i = e.endContainer, o = e.endOffset, s = t.domAtPos(t.state.selection.anchor);
  return Kt(s.node, s.offset, i, o) && ([n, r, i, o] = [i, o, n, r]), { anchorNode: n, anchorOffset: r, focusNode: i, focusOffset: o };
}
function zm(t, e) {
  if (e.getComposedRanges) {
    let i = e.getComposedRanges(t.root)[0];
    if (i)
      return Rl(t, i);
  }
  let n;
  function r(i) {
    i.preventDefault(), i.stopImmediatePropagation(), n = i.getTargetRanges()[0];
  }
  return t.dom.addEventListener("beforeinput", r, !0), document.execCommand("indent"), t.dom.removeEventListener("beforeinput", r, !0), n ? Rl(t, n) : null;
}
function $m(t, e) {
  for (let n = e.parentNode; n && n != t.dom; n = n.parentNode) {
    let r = t.docView.nearestDesc(n, !0);
    if (r && r.node.isBlock)
      return n;
  }
  return null;
}
function Hm(t, e) {
  var n;
  let { focusNode: r, focusOffset: i } = t.domSelectionRange();
  for (let o of e)
    if (((n = o.parentNode) === null || n === void 0 ? void 0 : n.nodeName) == "TR") {
      let s = o.nextSibling;
      for (; s && s.nodeName != "TD" && s.nodeName != "TH"; )
        s = s.nextSibling;
      if (s) {
        let u = s;
        for (; ; ) {
          let l = u.firstChild;
          if (!l || l.nodeType != 1 || l.contentEditable == "false" || /^(BR|IMG)$/.test(l.nodeName))
            break;
          u = l;
        }
        u.insertBefore(o, u.firstChild), r == o && t.domSelection().collapse(o, i);
      } else
        o.parentNode.removeChild(o);
    }
}
function Vm(t, e, n) {
  let { node: r, fromOffset: i, toOffset: o, from: s, to: u } = t.docView.parseRange(e, n), l = t.domSelectionRange(), a, c = l.anchorNode;
  if (c && t.dom.contains(c.nodeType == 1 ? c : c.parentNode) && (a = [{ node: c, offset: l.anchorOffset }], qi(l) || a.push({ node: l.focusNode, offset: l.focusOffset })), ae && t.input.lastKeyCode === 8)
    for (let g = o; g > i; g--) {
      let b = r.childNodes[g - 1], y = b.pmViewDesc;
      if (b.nodeName == "BR" && !y) {
        o = g;
        break;
      }
      if (!y || y.size)
        break;
    }
  let d = t.state.doc, f = t.someProp("domParser") || rt.fromSchema(t.state.schema), h = d.resolve(s), p = null, m = f.parse(r, {
    topNode: h.parent,
    topMatch: h.parent.contentMatchAt(h.index()),
    topOpen: !0,
    from: i,
    to: o,
    preserveWhitespace: h.parent.type.whitespace == "pre" ? "full" : !0,
    findPositions: a,
    ruleFromNode: jm,
    context: h
  });
  if (a && a[0].pos != null) {
    let g = a[0].pos, b = a[1] && a[1].pos;
    b == null && (b = g), p = { anchor: g + s, head: b + s };
  }
  return { doc: m, sel: p, from: s, to: u };
}
function jm(t) {
  let e = t.pmViewDesc;
  if (e)
    return e.parseRule();
  if (t.nodeName == "BR" && t.parentNode) {
    if (de && /^(ul|ol)$/i.test(t.parentNode.nodeName)) {
      let n = document.createElement("div");
      return n.appendChild(document.createElement("li")), { skip: n };
    } else if (t.parentNode.lastChild == t || de && /^(tr|table)$/i.test(t.parentNode.nodeName))
      return { ignore: !0 };
  } else if (t.nodeName == "IMG" && t.getAttribute("mark-placeholder"))
    return { ignore: !0 };
  return null;
}
const qm = /^(a|abbr|acronym|b|bd[io]|big|br|button|cite|code|data(list)?|del|dfn|em|i|img|ins|kbd|label|map|mark|meter|output|q|ruby|s|samp|small|span|strong|su[bp]|time|u|tt|var)$/i;
function Wm(t, e, n, r, i) {
  let o = t.input.compositionPendingChanges || (t.composing ? t.input.compositionID : 0);
  if (t.input.compositionPendingChanges = 0, e < 0) {
    let S = t.input.lastSelectionTime > Date.now() - 50 ? t.input.lastSelectionOrigin : null, M = Ys(t, S);
    if (M && !t.state.selection.eq(M)) {
      if (ae && nt && t.input.lastKeyCode === 13 && Date.now() - 100 < t.input.lastKeyCodeTime && t.someProp("handleKeyDown", (Y) => Y(t, Lt(13, "Enter"))))
        return;
      let N = t.state.tr.setSelection(M);
      S == "pointer" ? N.setMeta("pointer", !0) : S == "key" && N.scrollIntoView(), o && N.setMeta("composition", o), t.dispatch(N);
    }
    return;
  }
  let s = t.state.doc.resolve(e), u = s.sharedDepth(n);
  e = s.before(u + 1), n = t.state.doc.resolve(n).after(u + 1);
  let l = t.state.selection, a = Vm(t, e, n), c = t.state.doc, d = c.slice(a.from, a.to), f, h;
  t.input.lastKeyCode === 8 && Date.now() - 100 < t.input.lastKeyCodeTime ? (f = t.state.selection.to, h = "end") : (f = t.state.selection.from, h = "start"), t.input.lastKeyCode = null;
  let p = Jm(d.content, a.doc.content, a.from, f, h);
  if (p && t.input.domChangeCount++, (mn && t.input.lastIOSEnter > Date.now() - 225 || nt) && i.some((S) => S.nodeType == 1 && !qm.test(S.nodeName)) && (!p || p.endA >= p.endB) && t.someProp("handleKeyDown", (S) => S(t, Lt(13, "Enter")))) {
    t.input.lastIOSEnter = 0;
    return;
  }
  if (!p)
    if (r && l instanceof D && !l.empty && l.$head.sameParent(l.$anchor) && !t.composing && !(a.sel && a.sel.anchor != a.sel.head))
      p = { start: l.from, endA: l.to, endB: l.to };
    else {
      if (a.sel) {
        let S = Il(t, t.state.doc, a.sel);
        if (S && !S.eq(t.state.selection)) {
          let M = t.state.tr.setSelection(S);
          o && M.setMeta("composition", o), t.dispatch(M);
        }
      }
      return;
    }
  t.state.selection.from < t.state.selection.to && p.start == p.endB && t.state.selection instanceof D && (p.start > t.state.selection.from && p.start <= t.state.selection.from + 2 && t.state.selection.from >= a.from ? p.start = t.state.selection.from : p.endA < t.state.selection.to && p.endA >= t.state.selection.to - 2 && t.state.selection.to <= a.to && (p.endB += t.state.selection.to - p.endA, p.endA = t.state.selection.to)), ye && St <= 11 && p.endB == p.start + 1 && p.endA == p.start && p.start > a.from && a.doc.textBetween(p.start - a.from - 1, p.start - a.from + 1) == "  " && (p.start--, p.endA--, p.endB--);
  let m = a.doc.resolveNoCache(p.start - a.from), g = a.doc.resolveNoCache(p.endB - a.from), b = c.resolve(p.start), y = m.sameParent(g) && m.parent.inlineContent && b.end() >= p.endA;
  if ((mn && t.input.lastIOSEnter > Date.now() - 225 && (!y || i.some((S) => S.nodeName == "DIV" || S.nodeName == "P")) || !y && m.pos < a.doc.content.size && (!m.sameParent(g) || !m.parent.inlineContent) && m.pos < g.pos && !/\S/.test(a.doc.textBetween(m.pos, g.pos, "", ""))) && t.someProp("handleKeyDown", (S) => S(t, Lt(13, "Enter")))) {
    t.input.lastIOSEnter = 0;
    return;
  }
  if (t.state.selection.anchor > p.start && Km(c, p.start, p.endA, m, g) && t.someProp("handleKeyDown", (S) => S(t, Lt(8, "Backspace")))) {
    nt && ae && t.domObserver.suppressSelectionUpdates();
    return;
  }
  ae && p.endB == p.start && (t.input.lastChromeDelete = Date.now()), nt && !y && m.start() != g.start() && g.parentOffset == 0 && m.depth == g.depth && a.sel && a.sel.anchor == a.sel.head && a.sel.head == p.endA && (p.endB -= 2, g = a.doc.resolveNoCache(p.endB - a.from), setTimeout(() => {
    t.someProp("handleKeyDown", function(S) {
      return S(t, Lt(13, "Enter"));
    });
  }, 20));
  let k = p.start, C = p.endA, x = (S) => {
    let M = S || t.state.tr.replace(k, C, a.doc.slice(p.start - a.from, p.endB - a.from));
    if (a.sel) {
      let N = Il(t, M.doc, a.sel);
      N && !(ae && t.composing && N.empty && (p.start != p.endB || t.input.lastChromeDelete < Date.now() - 100) && (N.head == k || N.head == M.mapping.map(C) - 1) || ye && N.empty && N.head == k) && M.setSelection(N);
    }
    return o && M.setMeta("composition", o), M.scrollIntoView();
  }, E;
  if (y)
    if (m.pos == g.pos) {
      ye && St <= 11 && m.parentOffset == 0 && (t.domObserver.suppressSelectionUpdates(), setTimeout(() => ot(t), 20));
      let S = x(t.state.tr.delete(k, C)), M = c.resolve(p.start).marksAcross(c.resolve(p.endA));
      M && S.ensureMarks(M), t.dispatch(S);
    } else if (
      // Adding or removing a mark
      p.endA == p.endB && (E = Um(m.parent.content.cut(m.parentOffset, g.parentOffset), b.parent.content.cut(b.parentOffset, p.endA - b.start())))
    ) {
      let S = x(t.state.tr);
      E.type == "add" ? S.addMark(k, C, E.mark) : S.removeMark(k, C, E.mark), t.dispatch(S);
    } else if (m.parent.child(m.index()).isText && m.index() == g.index() - (g.textOffset ? 0 : 1)) {
      let S = m.parent.textBetween(m.parentOffset, g.parentOffset), M = () => x(t.state.tr.insertText(S, k, C));
      t.someProp("handleTextInput", (N) => N(t, k, C, S, M)) || t.dispatch(M());
    } else
      t.dispatch(x());
  else
    t.dispatch(x());
}
function Il(t, e, n) {
  return Math.max(n.anchor, n.head) > e.content.size ? null : Qs(t, e.resolve(n.anchor), e.resolve(n.head));
}
function Um(t, e) {
  let n = t.firstChild.marks, r = e.firstChild.marks, i = n, o = r, s, u, l;
  for (let c = 0; c < r.length; c++)
    i = r[c].removeFromSet(i);
  for (let c = 0; c < n.length; c++)
    o = n[c].removeFromSet(o);
  if (i.length == 1 && o.length == 0)
    u = i[0], s = "add", l = (c) => c.mark(u.addToSet(c.marks));
  else if (i.length == 0 && o.length == 1)
    u = o[0], s = "remove", l = (c) => c.mark(u.removeFromSet(c.marks));
  else
    return null;
  let a = [];
  for (let c = 0; c < e.childCount; c++)
    a.push(l(e.child(c)));
  if (w.from(a).eq(t))
    return { mark: u, type: s };
}
function Km(t, e, n, r, i) {
  if (
    // The content must have shrunk
    n - e <= i.pos - r.pos || // newEnd must point directly at or after the end of the block that newStart points into
    wo(r, !0, !1) < i.pos
  )
    return !1;
  let o = t.resolve(e);
  if (!r.parent.isTextblock) {
    let u = o.nodeAfter;
    return u != null && n == e + u.nodeSize;
  }
  if (o.parentOffset < o.parent.content.size || !o.parent.isTextblock)
    return !1;
  let s = t.resolve(wo(o, !0, !0));
  return !s.parent.isTextblock || s.pos > n || wo(s, !0, !1) < n ? !1 : r.parent.content.cut(r.parentOffset).eq(s.parent.content);
}
function wo(t, e, n) {
  let r = t.depth, i = e ? t.end() : t.pos;
  for (; r > 0 && (e || t.indexAfter(r) == t.node(r).childCount); )
    r--, i++, e = !1;
  if (n) {
    let o = t.node(r).maybeChild(t.indexAfter(r));
    for (; o && !o.isLeaf; )
      o = o.firstChild, i++;
  }
  return i;
}
function Jm(t, e, n, r, i) {
  let o = t.findDiffStart(e, n);
  if (o == null)
    return null;
  let { a: s, b: u } = t.findDiffEnd(e, n + t.size, n + e.size);
  if (i == "end") {
    let l = Math.max(0, o - Math.min(s, u));
    r -= s + l - o;
  }
  if (s < o && t.size < e.size) {
    let l = r <= o && r >= s ? o - r : 0;
    o -= l, o && o < e.size && Ll(e.textBetween(o - 1, o + 1)) && (o += l ? 1 : -1), u = o + (u - s), s = o;
  } else if (u < o) {
    let l = r <= o && r >= u ? o - r : 0;
    o -= l, o && o < t.size && Ll(t.textBetween(o - 1, o + 1)) && (o += l ? 1 : -1), s = o + (s - u), u = o;
  }
  return { start: o, endA: s, endB: u };
}
function Ll(t) {
  if (t.length != 2)
    return !1;
  let e = t.charCodeAt(0), n = t.charCodeAt(1);
  return e >= 56320 && e <= 57343 && n >= 55296 && n <= 56319;
}
class Pd {
  /**
  Create a view. `place` may be a DOM node that the editor should
  be appended to, a function that will place it into the document,
  or an object whose `mount` property holds the node to use as the
  document container. If it is `null`, the editor will not be
  added to the document.
  */
  constructor(e, n) {
    this._root = null, this.focused = !1, this.trackWrites = null, this.mounted = !1, this.markCursor = null, this.cursorWrapper = null, this.lastSelectedViewDesc = void 0, this.input = new cm(), this.prevDirectPlugins = [], this.pluginViews = [], this.requiresGeckoHackNode = !1, this.dragging = null, this._props = n, this.state = n.state, this.directPlugins = n.plugins || [], this.directPlugins.forEach($l), this.dispatch = this.dispatch.bind(this), this.dom = e && e.mount || document.createElement("div"), e && (e.appendChild ? e.appendChild(this.dom) : typeof e == "function" ? e(this.dom) : e.mount && (this.mounted = !0)), this.editable = Bl(this), Pl(this), this.nodeViews = zl(this), this.docView = gl(this.state.doc, Fl(this), Co(this), this.dom, this), this.domObserver = new Pm(this, (r, i, o, s) => Wm(this, r, i, o, s)), this.domObserver.start(), dm(this), this.updatePluginViews();
  }
  /**
  Holds `true` when a
  [composition](https://w3c.github.io/uievents/#events-compositionevents)
  is active.
  */
  get composing() {
    return this.input.composing;
  }
  /**
  The view's current [props](https://prosemirror.net/docs/ref/#view.EditorProps).
  */
  get props() {
    if (this._props.state != this.state) {
      let e = this._props;
      this._props = {};
      for (let n in e)
        this._props[n] = e[n];
      this._props.state = this.state;
    }
    return this._props;
  }
  /**
  Update the view's props. Will immediately cause an update to
  the DOM.
  */
  update(e) {
    e.handleDOMEvents != this._props.handleDOMEvents && hs(this);
    let n = this._props;
    this._props = e, e.plugins && (e.plugins.forEach($l), this.directPlugins = e.plugins), this.updateStateInner(e.state, n);
  }
  /**
  Update the view by updating existing props object with the object
  given as argument. Equivalent to `view.update(Object.assign({},
  view.props, props))`.
  */
  setProps(e) {
    let n = {};
    for (let r in this._props)
      n[r] = this._props[r];
    n.state = this.state;
    for (let r in e)
      n[r] = e[r];
    this.update(n);
  }
  /**
  Update the editor's `state` prop, without touching any of the
  other props.
  */
  updateState(e) {
    this.updateStateInner(e, this._props);
  }
  updateStateInner(e, n) {
    var r;
    let i = this.state, o = !1, s = !1;
    e.storedMarks && this.composing && (Dd(this), s = !0), this.state = e;
    let u = i.plugins != e.plugins || this._props.plugins != n.plugins;
    if (u || this._props.plugins != n.plugins || this._props.nodeViews != n.nodeViews) {
      let h = zl(this);
      Zm(h, this.nodeViews) && (this.nodeViews = h, o = !0);
    }
    (u || n.handleDOMEvents != this._props.handleDOMEvents) && hs(this), this.editable = Bl(this), Pl(this);
    let l = Co(this), a = Fl(this), c = i.plugins != e.plugins && !i.doc.eq(e.doc) ? "reset" : e.scrollToSelection > i.scrollToSelection ? "to selection" : "preserve", d = o || !this.docView.matchesNode(e.doc, a, l);
    (d || !e.selection.eq(i.selection)) && (s = !0);
    let f = c == "preserve" && s && this.dom.style.overflowAnchor == null && A0(this);
    if (s) {
      this.domObserver.stop();
      let h = d && (ye || ae) && !this.composing && !i.selection.empty && !e.selection.empty && Gm(i.selection, e.selection);
      if (d) {
        let p = ae ? this.trackWrites = this.domSelectionRange().focusNode : null;
        this.composing && (this.input.compositionNode = Am(this)), (o || !this.docView.update(e.doc, a, l, this)) && (this.docView.updateOuterDeco(a), this.docView.destroy(), this.docView = gl(e.doc, a, l, this.dom, this)), p && (!this.trackWrites || !this.dom.contains(this.trackWrites)) && (h = !0);
      }
      h || !(this.input.mouseDown && this.domObserver.currentSelection.eq(this.domSelectionRange()) && G0(this)) ? ot(this, h) : (yd(this, e.selection), this.domObserver.setCurSelection()), this.domObserver.start();
    }
    this.updatePluginViews(i), !((r = this.dragging) === null || r === void 0) && r.node && !i.doc.eq(e.doc) && this.updateDraggedNode(this.dragging, i), c == "reset" ? this.dom.scrollTop = 0 : c == "to selection" ? this.scrollToSelection() : f && v0(f);
  }
  /**
  @internal
  */
  scrollToSelection() {
    let e = this.domSelectionRange().focusNode;
    if (!(!e || !this.dom.contains(e.nodeType == 1 ? e : e.parentNode))) {
      if (!this.someProp("handleScrollToSelection", (n) => n(this))) if (this.state.selection instanceof _) {
        let n = this.docView.domAfterPos(this.state.selection.from);
        n.nodeType == 1 && cl(this, n.getBoundingClientRect(), e);
      } else
        cl(this, this.coordsAtPos(this.state.selection.head, 1), e);
    }
  }
  destroyPluginViews() {
    let e;
    for (; e = this.pluginViews.pop(); )
      e.destroy && e.destroy();
  }
  updatePluginViews(e) {
    if (!e || e.plugins != this.state.plugins || this.directPlugins != this.prevDirectPlugins) {
      this.prevDirectPlugins = this.directPlugins, this.destroyPluginViews();
      for (let n = 0; n < this.directPlugins.length; n++) {
        let r = this.directPlugins[n];
        r.spec.view && this.pluginViews.push(r.spec.view(this));
      }
      for (let n = 0; n < this.state.plugins.length; n++) {
        let r = this.state.plugins[n];
        r.spec.view && this.pluginViews.push(r.spec.view(this));
      }
    } else
      for (let n = 0; n < this.pluginViews.length; n++) {
        let r = this.pluginViews[n];
        r.update && r.update(this, e);
      }
  }
  updateDraggedNode(e, n) {
    let r = e.node, i = -1;
    if (this.state.doc.nodeAt(r.from) == r.node)
      i = r.from;
    else {
      let o = r.from + (this.state.doc.content.size - n.doc.content.size);
      (o > 0 && this.state.doc.nodeAt(o)) == r.node && (i = o);
    }
    this.dragging = new Nd(e.slice, e.move, i < 0 ? void 0 : _.create(this.state.doc, i));
  }
  someProp(e, n) {
    let r = this._props && this._props[e], i;
    if (r != null && (i = n ? n(r) : r))
      return i;
    for (let s = 0; s < this.directPlugins.length; s++) {
      let u = this.directPlugins[s].props[e];
      if (u != null && (i = n ? n(u) : u))
        return i;
    }
    let o = this.state.plugins;
    if (o)
      for (let s = 0; s < o.length; s++) {
        let u = o[s].props[e];
        if (u != null && (i = n ? n(u) : u))
          return i;
      }
  }
  /**
  Query whether the view has focus.
  */
  hasFocus() {
    if (ye) {
      let e = this.root.activeElement;
      if (e == this.dom)
        return !0;
      if (!e || !this.dom.contains(e))
        return !1;
      for (; e && this.dom != e && this.dom.contains(e); ) {
        if (e.contentEditable == "false")
          return !1;
        e = e.parentElement;
      }
      return !0;
    }
    return this.root.activeElement == this.dom;
  }
  /**
  Focus the editor.
  */
  focus() {
    this.domObserver.stop(), this.editable && M0(this.dom), ot(this), this.domObserver.start();
  }
  /**
  Get the document root in which the editor exists. This will
  usually be the top-level `document`, but might be a [shadow
  DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
  root if the editor is inside one.
  */
  get root() {
    let e = this._root;
    if (e == null) {
      for (let n = this.dom.parentNode; n; n = n.parentNode)
        if (n.nodeType == 9 || n.nodeType == 11 && n.host)
          return n.getSelection || (Object.getPrototypeOf(n).getSelection = () => n.ownerDocument.getSelection()), this._root = n;
    }
    return e || document;
  }
  /**
  When an existing editor view is moved to a new document or
  shadow tree, call this to make it recompute its root.
  */
  updateRoot() {
    this._root = null;
  }
  /**
  Given a pair of viewport coordinates, return the document
  position that corresponds to them. May return null if the given
  coordinates aren't inside of the editor. When an object is
  returned, its `pos` property is the position nearest to the
  coordinates, and its `inside` property holds the position of the
  inner node that the position falls inside of, or -1 if it is at
  the top level, not in any node.
  */
  posAtCoords(e) {
    return N0(this, e);
  }
  /**
  Returns the viewport rectangle at a given document position.
  `left` and `right` will be the same number, as this returns a
  flat cursor-ish rectangle. If the position is between two things
  that aren't directly adjacent, `side` determines which element
  is used. When < 0, the element before the position is used,
  otherwise the element after.
  */
  coordsAtPos(e, n = 1) {
    return cd(this, e, n);
  }
  /**
  Find the DOM position that corresponds to the given document
  position. When `side` is negative, find the position as close as
  possible to the content before the position. When positive,
  prefer positions close to the content after the position. When
  zero, prefer as shallow a position as possible.
  
  Note that you should **not** mutate the editor's internal DOM,
  only inspect it (and even that is usually not necessary).
  */
  domAtPos(e, n = 0) {
    return this.docView.domFromPos(e, n);
  }
  /**
  Find the DOM node that represents the document node after the
  given position. May return `null` when the position doesn't point
  in front of a node or if the node is inside an opaque node view.
  
  This is intended to be able to call things like
  `getBoundingClientRect` on that DOM node. Do **not** mutate the
  editor DOM directly, or add styling this way, since that will be
  immediately overriden by the editor as it redraws the node.
  */
  nodeDOM(e) {
    let n = this.docView.descAt(e);
    return n ? n.nodeDOM : null;
  }
  /**
  Find the document position that corresponds to a given DOM
  position. (Whenever possible, it is preferable to inspect the
  document structure directly, rather than poking around in the
  DOM, but sometimes—for example when interpreting an event
  target—you don't have a choice.)
  
  The `bias` parameter can be used to influence which side of a DOM
  node to use when the position is inside a leaf node.
  */
  posAtDOM(e, n, r = -1) {
    let i = this.docView.posFromDOM(e, n, r);
    if (i == null)
      throw new RangeError("DOM position not inside the editor");
    return i;
  }
  /**
  Find out whether the selection is at the end of a textblock when
  moving in a given direction. When, for example, given `"left"`,
  it will return true if moving left from the current cursor
  position would leave that position's parent textblock. Will apply
  to the view's current state by default, but it is possible to
  pass a different state.
  */
  endOfTextblock(e, n) {
    return P0(this, n || this.state, e);
  }
  /**
  Run the editor's paste logic with the given HTML string. The
  `event`, if given, will be passed to the
  [`handlePaste`](https://prosemirror.net/docs/ref/#view.EditorProps.handlePaste) hook.
  */
  pasteHTML(e, n) {
    return Yn(this, "", e, !1, n || new ClipboardEvent("paste"));
  }
  /**
  Run the editor's paste logic with the given plain-text input.
  */
  pasteText(e, n) {
    return Yn(this, e, null, !0, n || new ClipboardEvent("paste"));
  }
  /**
  Serialize the given slice as it would be if it was copied from
  this editor. Returns a DOM element that contains a
  representation of the slice as its children, a textual
  representation, and the transformed slice (which can be
  different from the given input due to hooks like
  [`transformCopied`](https://prosemirror.net/docs/ref/#view.EditorProps.transformCopied)).
  */
  serializeForClipboard(e) {
    return eu(this, e);
  }
  /**
  Removes the editor from the DOM and destroys all [node
  views](https://prosemirror.net/docs/ref/#view.NodeView).
  */
  destroy() {
    this.docView && (fm(this), this.destroyPluginViews(), this.mounted ? (this.docView.update(this.state.doc, [], Co(this), this), this.dom.textContent = "") : this.dom.parentNode && this.dom.parentNode.removeChild(this.dom), this.docView.destroy(), this.docView = null, m0());
  }
  /**
  This is true when the view has been
  [destroyed](https://prosemirror.net/docs/ref/#view.EditorView.destroy) (and thus should not be
  used anymore).
  */
  get isDestroyed() {
    return this.docView == null;
  }
  /**
  Used for testing.
  */
  dispatchEvent(e) {
    return pm(this, e);
  }
  /**
  @internal
  */
  domSelectionRange() {
    let e = this.domSelection();
    return e ? de && this.root.nodeType === 11 && x0(this.dom.ownerDocument) == this.dom && zm(this, e) || e : { focusNode: null, focusOffset: 0, anchorNode: null, anchorOffset: 0 };
  }
  /**
  @internal
  */
  domSelection() {
    return this.root.getSelection();
  }
}
Pd.prototype.dispatch = function(t) {
  let e = this._props.dispatchTransaction;
  e ? e.call(this, t) : this.updateState(this.state.apply(t));
};
function Fl(t) {
  let e = /* @__PURE__ */ Object.create(null);
  return e.class = "ProseMirror", e.contenteditable = String(t.editable), t.someProp("attributes", (n) => {
    if (typeof n == "function" && (n = n(t.state)), n)
      for (let r in n)
        r == "class" ? e.class += " " + n[r] : r == "style" ? e.style = (e.style ? e.style + ";" : "") + n[r] : !e[r] && r != "contenteditable" && r != "nodeName" && (e[r] = String(n[r]));
  }), e.translate || (e.translate = "no"), [re.node(0, t.state.doc.content.size, e)];
}
function Pl(t) {
  if (t.markCursor) {
    let e = document.createElement("img");
    e.className = "ProseMirror-separator", e.setAttribute("mark-placeholder", "true"), e.setAttribute("alt", ""), t.cursorWrapper = { dom: e, deco: re.widget(t.state.selection.from, e, { raw: !0, marks: t.markCursor }) };
  } else
    t.cursorWrapper = null;
}
function Bl(t) {
  return !t.someProp("editable", (e) => e(t.state) === !1);
}
function Gm(t, e) {
  let n = Math.min(t.$anchor.sharedDepth(t.head), e.$anchor.sharedDepth(e.head));
  return t.$anchor.start(n) != e.$anchor.start(n);
}
function zl(t) {
  let e = /* @__PURE__ */ Object.create(null);
  function n(r) {
    for (let i in r)
      Object.prototype.hasOwnProperty.call(e, i) || (e[i] = r[i]);
  }
  return t.someProp("nodeViews", n), t.someProp("markViews", n), e;
}
function Zm(t, e) {
  let n = 0, r = 0;
  for (let i in t) {
    if (t[i] != e[i])
      return !0;
    n++;
  }
  for (let i in e)
    r++;
  return n != r;
}
function $l(t) {
  if (t.spec.state || t.spec.filterTransaction || t.spec.appendTransaction)
    throw new RangeError("Plugins passed directly to the view must not have a state component");
}
var Mt = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
}, ni = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
}, Xm = typeof navigator < "u" && /Mac/.test(navigator.platform), Ym = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var le = 0; le < 10; le++) Mt[48 + le] = Mt[96 + le] = String(le);
for (var le = 1; le <= 24; le++) Mt[le + 111] = "F" + le;
for (var le = 65; le <= 90; le++)
  Mt[le] = String.fromCharCode(le + 32), ni[le] = String.fromCharCode(le);
for (var Eo in Mt) ni.hasOwnProperty(Eo) || (ni[Eo] = Mt[Eo]);
function Qm(t) {
  var e = Xm && t.metaKey && t.shiftKey && !t.ctrlKey && !t.altKey || Ym && t.shiftKey && t.key && t.key.length == 1 || t.key == "Unidentified", n = !e && t.key || (t.shiftKey ? ni : Mt)[t.keyCode] || t.key || "Unidentified";
  return n == "Esc" && (n = "Escape"), n == "Del" && (n = "Delete"), n == "Left" && (n = "ArrowLeft"), n == "Up" && (n = "ArrowUp"), n == "Right" && (n = "ArrowRight"), n == "Down" && (n = "ArrowDown"), n;
}
const e1 = typeof navigator < "u" && /Mac|iP(hone|[oa]d)/.test(navigator.platform), t1 = typeof navigator < "u" && /Win/.test(navigator.platform);
function n1(t) {
  let e = t.split(/-(?!$)/), n = e[e.length - 1];
  n == "Space" && (n = " ");
  let r, i, o, s;
  for (let u = 0; u < e.length - 1; u++) {
    let l = e[u];
    if (/^(cmd|meta|m)$/i.test(l))
      s = !0;
    else if (/^a(lt)?$/i.test(l))
      r = !0;
    else if (/^(c|ctrl|control)$/i.test(l))
      i = !0;
    else if (/^s(hift)?$/i.test(l))
      o = !0;
    else if (/^mod$/i.test(l))
      e1 ? s = !0 : i = !0;
    else
      throw new Error("Unrecognized modifier name: " + l);
  }
  return r && (n = "Alt-" + n), i && (n = "Ctrl-" + n), s && (n = "Meta-" + n), o && (n = "Shift-" + n), n;
}
function r1(t) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let n in t)
    e[n1(n)] = t[n];
  return e;
}
function So(t, e, n = !0) {
  return e.altKey && (t = "Alt-" + t), e.ctrlKey && (t = "Ctrl-" + t), e.metaKey && (t = "Meta-" + t), n && e.shiftKey && (t = "Shift-" + t), t;
}
function i1(t) {
  return new H({ props: { handleKeyDown: su(t) } });
}
function su(t) {
  let e = r1(t);
  return function(n, r) {
    let i = Qm(r), o, s = e[So(i, r)];
    if (s && s(n.state, n.dispatch, n))
      return !0;
    if (i.length == 1 && i != " ") {
      if (r.shiftKey) {
        let u = e[So(i, r, !1)];
        if (u && u(n.state, n.dispatch, n))
          return !0;
      }
      if ((r.altKey || r.metaKey || r.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
      !(t1 && r.ctrlKey && r.altKey) && (o = Mt[r.keyCode]) && o != i) {
        let u = e[So(o, r)];
        if (u && u(n.state, n.dispatch, n))
          return !0;
      }
    }
    return !1;
  };
}
var o1 = Object.defineProperty, uu = (t, e) => {
  for (var n in e)
    o1(t, n, { get: e[n], enumerable: !0 });
};
function Ki(t) {
  const { state: e, transaction: n } = t;
  let { selection: r } = n, { doc: i } = n, { storedMarks: o } = n;
  return {
    ...e,
    apply: e.apply.bind(e),
    applyTransaction: e.applyTransaction.bind(e),
    plugins: e.plugins,
    schema: e.schema,
    reconfigure: e.reconfigure.bind(e),
    toJSON: e.toJSON.bind(e),
    get storedMarks() {
      return o;
    },
    get selection() {
      return r;
    },
    get doc() {
      return i;
    },
    get tr() {
      return r = n.selection, i = n.doc, o = n.storedMarks, n;
    }
  };
}
var Ji = class {
  constructor(t) {
    this.editor = t.editor, this.rawCommands = this.editor.extensionManager.commands, this.customState = t.state;
  }
  get hasCustomState() {
    return !!this.customState;
  }
  get state() {
    return this.customState || this.editor.state;
  }
  get commands() {
    const { rawCommands: t, editor: e, state: n } = this, { view: r } = e, { tr: i } = n, o = this.buildProps(i);
    return Object.fromEntries(
      Object.entries(t).map(([s, u]) => [s, (...a) => {
        const c = u(...a)(o);
        return !i.getMeta("preventDispatch") && !this.hasCustomState && r.dispatch(i), c;
      }])
    );
  }
  get chain() {
    return () => this.createChain();
  }
  get can() {
    return () => this.createCan();
  }
  createChain(t, e = !0) {
    const { rawCommands: n, editor: r, state: i } = this, { view: o } = r, s = [], u = !!t, l = t || i.tr, a = () => (!u && e && !l.getMeta("preventDispatch") && !this.hasCustomState && o.dispatch(l), s.every((d) => d === !0)), c = {
      ...Object.fromEntries(
        Object.entries(n).map(([d, f]) => [d, (...p) => {
          const m = this.buildProps(l, e), g = f(...p)(m);
          return s.push(g), c;
        }])
      ),
      run: a
    };
    return c;
  }
  createCan(t) {
    const { rawCommands: e, state: n } = this, r = !1, i = t || n.tr, o = this.buildProps(i, r);
    return {
      ...Object.fromEntries(
        Object.entries(e).map(([u, l]) => [u, (...a) => l(...a)({ ...o, dispatch: void 0 })])
      ),
      chain: () => this.createChain(i, r)
    };
  }
  buildProps(t, e = !0) {
    const { rawCommands: n, editor: r, state: i } = this, { view: o } = r, s = {
      tr: t,
      editor: r,
      view: o,
      state: Ki({
        state: i,
        transaction: t
      }),
      dispatch: e ? () => {
      } : void 0,
      chain: () => this.createChain(t, e),
      can: () => this.createCan(t),
      get commands() {
        return Object.fromEntries(
          Object.entries(n).map(([u, l]) => [u, (...a) => l(...a)(s)])
        );
      }
    };
    return s;
  }
}, Bd = {};
uu(Bd, {
  blur: () => s1,
  clearContent: () => u1,
  clearNodes: () => l1,
  command: () => a1,
  createParagraphNear: () => c1,
  cut: () => d1,
  deleteCurrentNode: () => f1,
  deleteNode: () => h1,
  deleteRange: () => p1,
  deleteSelection: () => m1,
  enter: () => g1,
  exitCode: () => b1,
  extendMarkRange: () => y1,
  first: () => k1,
  focus: () => C1,
  forEach: () => w1,
  insertContent: () => E1,
  insertContentAt: () => v1,
  joinBackward: () => _1,
  joinDown: () => T1,
  joinForward: () => D1,
  joinItemBackward: () => O1,
  joinItemForward: () => N1,
  joinTextblockBackward: () => R1,
  joinTextblockForward: () => I1,
  joinUp: () => M1,
  keyboardShortcut: () => F1,
  lift: () => P1,
  liftEmptyBlock: () => B1,
  liftListItem: () => z1,
  newlineInCode: () => $1,
  resetAttributes: () => H1,
  scrollIntoView: () => V1,
  selectAll: () => j1,
  selectNodeBackward: () => q1,
  selectNodeForward: () => W1,
  selectParentNode: () => U1,
  selectTextblockEnd: () => K1,
  selectTextblockStart: () => J1,
  setContent: () => G1,
  setMark: () => pg,
  setMeta: () => mg,
  setNode: () => gg,
  setNodeSelection: () => bg,
  setTextDirection: () => yg,
  setTextSelection: () => kg,
  sinkListItem: () => xg,
  splitBlock: () => Cg,
  splitListItem: () => wg,
  toggleList: () => Eg,
  toggleMark: () => Sg,
  toggleNode: () => Ag,
  toggleWrap: () => vg,
  undoInputRule: () => Mg,
  unsetAllMarks: () => Tg,
  unsetMark: () => _g,
  unsetTextDirection: () => Dg,
  updateAttributes: () => Og,
  wrapIn: () => Ng,
  wrapInList: () => Rg
});
var s1 = () => ({ editor: t, view: e }) => (requestAnimationFrame(() => {
  var n;
  t.isDestroyed || (e.dom.blur(), (n = window?.getSelection()) == null || n.removeAllRanges());
}), !0), u1 = (t = !0) => ({ commands: e }) => e.setContent("", { emitUpdate: t }), l1 = () => ({ state: t, tr: e, dispatch: n }) => {
  const { selection: r } = e, { ranges: i } = r;
  return n && i.forEach(({ $from: o, $to: s }) => {
    t.doc.nodesBetween(o.pos, s.pos, (u, l) => {
      if (u.type.isText)
        return;
      const { doc: a, mapping: c } = e, d = a.resolve(c.map(l)), f = a.resolve(c.map(l + u.nodeSize)), h = d.blockRange(f);
      if (!h)
        return;
      const p = Cn(h);
      if (u.type.isTextblock) {
        const { defaultType: m } = d.parent.contentMatchAt(d.index());
        e.setNodeMarkup(h.start, m);
      }
      (p || p === 0) && e.lift(h, p);
    });
  }), !0;
}, a1 = (t) => (e) => t(e), c1 = () => ({ state: t, dispatch: e }) => Qc(t, e), d1 = (t, e) => ({ editor: n, tr: r }) => {
  const { state: i } = n, o = i.doc.slice(t.from, t.to);
  r.deleteRange(t.from, t.to);
  const s = r.mapping.map(e);
  return r.insert(s, o.content), r.setSelection(new D(r.doc.resolve(Math.max(s - 1, 0)))), !0;
}, f1 = () => ({ tr: t, dispatch: e }) => {
  const { selection: n } = t, r = n.$anchor.node();
  if (r.content.size > 0)
    return !1;
  const i = t.selection.$anchor;
  for (let o = i.depth; o > 0; o -= 1)
    if (i.node(o).type === r.type) {
      if (e) {
        const u = i.before(o), l = i.after(o);
        t.delete(u, l).scrollIntoView();
      }
      return !0;
    }
  return !1;
};
function X(t, e) {
  if (typeof t == "string") {
    if (!e.nodes[t])
      throw Error(`There is no node type named '${t}'. Maybe you forgot to add the extension?`);
    return e.nodes[t];
  }
  return t;
}
var h1 = (t) => ({ tr: e, state: n, dispatch: r }) => {
  const i = X(t, n.schema), o = e.selection.$anchor;
  for (let s = o.depth; s > 0; s -= 1)
    if (o.node(s).type === i) {
      if (r) {
        const l = o.before(s), a = o.after(s);
        e.delete(l, a).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, p1 = (t) => ({ tr: e, dispatch: n }) => {
  const { from: r, to: i } = t;
  return n && e.delete(r, i), !0;
}, m1 = () => ({ state: t, dispatch: e }) => Us(t, e), g1 = () => ({ commands: t }) => t.keyboardShortcut("Enter"), b1 = () => ({ state: t, dispatch: e }) => e0(t, e);
function lu(t) {
  return Object.prototype.toString.call(t) === "[object RegExp]";
}
function ri(t, e, n = { strict: !0 }) {
  const r = Object.keys(e);
  return r.length ? r.every((i) => n.strict ? e[i] === t[i] : lu(e[i]) ? e[i].test(t[i]) : e[i] === t[i]) : !0;
}
function zd(t, e, n = {}) {
  return t.find((r) => r.type === e && ri(
    // Only check equality for the attributes that are provided
    Object.fromEntries(Object.keys(n).map((i) => [i, r.attrs[i]])),
    n
  ));
}
function Hl(t, e, n = {}) {
  return !!zd(t, e, n);
}
function au(t, e, n) {
  var r;
  if (!t || !e)
    return;
  let i = t.parent.childAfter(t.parentOffset);
  if ((!i.node || !i.node.marks.some((c) => c.type === e)) && (i = t.parent.childBefore(t.parentOffset)), !i.node || !i.node.marks.some((c) => c.type === e) || (n = n || ((r = i.node.marks[0]) == null ? void 0 : r.attrs), !zd([...i.node.marks], e, n)))
    return;
  let s = i.index, u = t.start() + i.offset, l = s + 1, a = u + i.node.nodeSize;
  for (; s > 0 && Hl([...t.parent.child(s - 1).marks], e, n); )
    s -= 1, u -= t.parent.child(s).nodeSize;
  for (; l < t.parent.childCount && Hl([...t.parent.child(l).marks], e, n); )
    a += t.parent.child(l).nodeSize, l += 1;
  return {
    from: u,
    to: a
  };
}
function st(t, e) {
  if (typeof t == "string") {
    if (!e.marks[t])
      throw Error(`There is no mark type named '${t}'. Maybe you forgot to add the extension?`);
    return e.marks[t];
  }
  return t;
}
var y1 = (t, e = {}) => ({ tr: n, state: r, dispatch: i }) => {
  const o = st(t, r.schema), { doc: s, selection: u } = n, { $from: l, from: a, to: c } = u;
  if (i) {
    const d = au(l, o, e);
    if (d && d.from <= a && d.to >= c) {
      const f = D.create(s, d.from, d.to);
      n.setSelection(f);
    }
  }
  return !0;
}, k1 = (t) => (e) => {
  const n = typeof t == "function" ? t(e) : t;
  for (let r = 0; r < n.length; r += 1)
    if (n[r](e))
      return !0;
  return !1;
};
function $d(t) {
  return t instanceof D;
}
function Bt(t = 0, e = 0, n = 0) {
  return Math.min(Math.max(t, e), n);
}
function Hd(t, e = null) {
  if (!e)
    return null;
  const n = O.atStart(t), r = O.atEnd(t);
  if (e === "start" || e === !0)
    return n;
  if (e === "end")
    return r;
  const i = n.from, o = r.to;
  return e === "all" ? D.create(t, Bt(0, i, o), Bt(t.content.size, i, o)) : D.create(t, Bt(e, i, o), Bt(e, i, o));
}
function Vl() {
  return navigator.platform === "Android" || /android/i.test(navigator.userAgent);
}
function ii() {
  return ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) || // iPad on iOS 13 detection
  navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function x1() {
  return typeof navigator < "u" ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : !1;
}
var C1 = (t = null, e = {}) => ({ editor: n, view: r, tr: i, dispatch: o }) => {
  e = {
    scrollIntoView: !0,
    ...e
  };
  const s = () => {
    (ii() || Vl()) && r.dom.focus(), x1() && !ii() && !Vl() && r.dom.focus({ preventScroll: !0 }), requestAnimationFrame(() => {
      n.isDestroyed || (r.focus(), e?.scrollIntoView && n.commands.scrollIntoView());
    });
  };
  try {
    if (r.hasFocus() && t === null || t === !1)
      return !0;
  } catch {
    return !1;
  }
  if (o && t === null && !$d(n.state.selection))
    return s(), !0;
  const u = Hd(i.doc, t) || n.state.selection, l = n.state.selection.eq(u);
  return o && (l || i.setSelection(u), l && i.storedMarks && i.setStoredMarks(i.storedMarks), s()), !0;
}, w1 = (t, e) => (n) => t.every((r, i) => e(r, { ...n, index: i })), E1 = (t, e) => ({ tr: n, commands: r }) => r.insertContentAt({ from: n.selection.from, to: n.selection.to }, t, e), Vd = (t) => {
  const e = t.childNodes;
  for (let n = e.length - 1; n >= 0; n -= 1) {
    const r = e[n];
    r.nodeType === 3 && r.nodeValue && /^(\n\s\s|\n)$/.test(r.nodeValue) ? t.removeChild(r) : r.nodeType === 1 && Vd(r);
  }
  return t;
};
function Cr(t) {
  if (typeof window > "u")
    throw new Error("[tiptap error]: there is no window object available, so this function cannot be used");
  const e = `<body>${t}</body>`, n = new window.DOMParser().parseFromString(e, "text/html").body;
  return Vd(n);
}
function er(t, e, n) {
  if (t instanceof Et || t instanceof w)
    return t;
  n = {
    slice: !0,
    parseOptions: {},
    ...n
  };
  const r = typeof t == "object" && t !== null, i = typeof t == "string";
  if (r)
    try {
      if (Array.isArray(t) && t.length > 0)
        return w.fromArray(t.map((u) => e.nodeFromJSON(u)));
      const s = e.nodeFromJSON(t);
      return n.errorOnInvalidContent && s.check(), s;
    } catch (o) {
      if (n.errorOnInvalidContent)
        throw new Error("[tiptap error]: Invalid JSON content", { cause: o });
      return console.warn("[tiptap warn]: Invalid content.", "Passed value:", t, "Error:", o), er("", e, n);
    }
  if (i) {
    if (n.errorOnInvalidContent) {
      let s = !1, u = "";
      const l = new $s({
        topNode: e.spec.topNode,
        marks: e.spec.marks,
        // Prosemirror's schemas are executed such that: the last to execute, matches last
        // This means that we can add a catch-all node at the end of the schema to catch any content that we don't know how to handle
        nodes: e.spec.nodes.append({
          __tiptap__private__unknown__catch__all__node: {
            content: "inline*",
            group: "block",
            parseDOM: [
              {
                tag: "*",
                getAttrs: (a) => (s = !0, u = typeof a == "string" ? a : a.outerHTML, null)
              }
            ]
          }
        })
      });
      if (n.slice ? rt.fromSchema(l).parseSlice(Cr(t), n.parseOptions) : rt.fromSchema(l).parse(Cr(t), n.parseOptions), n.errorOnInvalidContent && s)
        throw new Error("[tiptap error]: Invalid HTML content", {
          cause: new Error(`Invalid element found: ${u}`)
        });
    }
    const o = rt.fromSchema(e);
    return n.slice ? o.parseSlice(Cr(t), n.parseOptions).content : o.parse(Cr(t), n.parseOptions);
  }
  return er("", e, n);
}
function S1(t, e, n) {
  const r = t.steps.length - 1;
  if (r < e)
    return;
  const i = t.steps[r];
  if (!(i instanceof te || i instanceof ie))
    return;
  const o = t.mapping.maps[r];
  let s = 0;
  o.forEach((u, l, a, c) => {
    s === 0 && (s = c);
  }), t.setSelection(O.near(t.doc.resolve(s), n));
}
var A1 = (t) => !("type" in t), v1 = (t, e, n) => ({ tr: r, dispatch: i, editor: o }) => {
  var s;
  if (i) {
    n = {
      parseOptions: o.options.parseOptions,
      updateSelection: !0,
      applyInputRules: !1,
      applyPasteRules: !1,
      ...n
    };
    let u;
    const l = (g) => {
      o.emit("contentError", {
        editor: o,
        error: g,
        disableCollaboration: () => {
          "collaboration" in o.storage && typeof o.storage.collaboration == "object" && o.storage.collaboration && (o.storage.collaboration.isDisabled = !0);
        }
      });
    }, a = {
      preserveWhitespace: "full",
      ...n.parseOptions
    };
    if (!n.errorOnInvalidContent && !o.options.enableContentCheck && o.options.emitContentError)
      try {
        er(e, o.schema, {
          parseOptions: a,
          errorOnInvalidContent: !0
        });
      } catch (g) {
        l(g);
      }
    try {
      u = er(e, o.schema, {
        parseOptions: a,
        errorOnInvalidContent: (s = n.errorOnInvalidContent) != null ? s : o.options.enableContentCheck
      });
    } catch (g) {
      return l(g), !1;
    }
    let { from: c, to: d } = typeof t == "number" ? { from: t, to: t } : { from: t.from, to: t.to }, f = !0, h = !0;
    if ((A1(u) ? u : [u]).forEach((g) => {
      g.check(), f = f ? g.isText && g.marks.length === 0 : !1, h = h ? g.isBlock : !1;
    }), c === d && h) {
      const { parent: g } = r.doc.resolve(c);
      g.isTextblock && !g.type.spec.code && !g.childCount && (c -= 1, d += 1);
    }
    let m;
    if (f) {
      if (Array.isArray(e))
        m = e.map((g) => g.text || "").join("");
      else if (e instanceof w) {
        let g = "";
        e.forEach((b) => {
          b.text && (g += b.text);
        }), m = g;
      } else typeof e == "object" && e && e.text ? m = e.text : m = e;
      r.insertText(m, c, d);
    } else {
      m = u;
      const g = r.doc.resolve(c), b = g.node(), y = g.parentOffset === 0, k = b.isText || b.isTextblock, C = b.content.size > 0;
      y && k && C && (c = Math.max(0, c - 1)), r.replaceWith(c, d, m);
    }
    n.updateSelection && S1(r, r.steps.length - 1, -1), n.applyInputRules && r.setMeta("applyInputRules", { from: c, text: m }), n.applyPasteRules && r.setMeta("applyPasteRules", { from: c, text: m });
  }
  return !0;
}, M1 = () => ({ state: t, dispatch: e }) => Xp(t, e), T1 = () => ({ state: t, dispatch: e }) => Yp(t, e), _1 = () => ({ state: t, dispatch: e }) => Uc(t, e), D1 = () => ({ state: t, dispatch: e }) => Zc(t, e), O1 = () => ({ state: t, dispatch: e, tr: n }) => {
  try {
    const r = Hi(t.doc, t.selection.$from.pos, -1);
    return r == null ? !1 : (n.join(r, 2), e && e(n), !0);
  } catch {
    return !1;
  }
}, N1 = () => ({ state: t, dispatch: e, tr: n }) => {
  try {
    const r = Hi(t.doc, t.selection.$from.pos, 1);
    return r == null ? !1 : (n.join(r, 2), e && e(n), !0);
  } catch {
    return !1;
  }
}, R1 = () => ({ state: t, dispatch: e }) => Gp(t, e), I1 = () => ({ state: t, dispatch: e }) => Zp(t, e);
function jd() {
  return typeof navigator < "u" ? /Mac/.test(navigator.platform) : !1;
}
function L1(t) {
  const e = t.split(/-(?!$)/);
  let n = e[e.length - 1];
  n === "Space" && (n = " ");
  let r, i, o, s;
  for (let u = 0; u < e.length - 1; u += 1) {
    const l = e[u];
    if (/^(cmd|meta|m)$/i.test(l))
      s = !0;
    else if (/^a(lt)?$/i.test(l))
      r = !0;
    else if (/^(c|ctrl|control)$/i.test(l))
      i = !0;
    else if (/^s(hift)?$/i.test(l))
      o = !0;
    else if (/^mod$/i.test(l))
      ii() || jd() ? s = !0 : i = !0;
    else
      throw new Error(`Unrecognized modifier name: ${l}`);
  }
  return r && (n = `Alt-${n}`), i && (n = `Ctrl-${n}`), s && (n = `Meta-${n}`), o && (n = `Shift-${n}`), n;
}
var F1 = (t) => ({ editor: e, view: n, tr: r, dispatch: i }) => {
  const o = L1(t).split(/-(?!$)/), s = o.find((a) => !["Alt", "Ctrl", "Meta", "Shift"].includes(a)), u = new KeyboardEvent("keydown", {
    key: s === "Space" ? " " : s,
    altKey: o.includes("Alt"),
    ctrlKey: o.includes("Ctrl"),
    metaKey: o.includes("Meta"),
    shiftKey: o.includes("Shift"),
    bubbles: !0,
    cancelable: !0
  }), l = e.captureTransaction(() => {
    n.someProp("handleKeyDown", (a) => a(n, u));
  });
  return l?.steps.forEach((a) => {
    const c = a.map(r.mapping);
    c && i && r.maybeStep(c);
  }), !0;
};
function Tt(t, e, n = {}) {
  const { from: r, to: i, empty: o } = t.selection, s = e ? X(e, t.schema) : null, u = [];
  t.doc.nodesBetween(r, i, (d, f) => {
    if (d.isText)
      return;
    const h = Math.max(r, f), p = Math.min(i, f + d.nodeSize);
    u.push({
      node: d,
      from: h,
      to: p
    });
  });
  const l = i - r, a = u.filter((d) => s ? s.name === d.node.type.name : !0).filter((d) => ri(d.node.attrs, n, { strict: !1 }));
  return o ? !!a.length : a.reduce((d, f) => d + f.to - f.from, 0) >= l;
}
var P1 = (t, e = {}) => ({ state: n, dispatch: r }) => {
  const i = X(t, n.schema);
  return Tt(n, i, e) ? Qp(n, r) : !1;
}, B1 = () => ({ state: t, dispatch: e }) => ed(t, e), z1 = (t) => ({ state: e, dispatch: n }) => {
  const r = X(t, e.schema);
  return d0(r)(e, n);
}, $1 = () => ({ state: t, dispatch: e }) => Yc(t, e);
function Gi(t, e) {
  return e.nodes[t] ? "node" : e.marks[t] ? "mark" : null;
}
function jl(t, e) {
  const n = typeof e == "string" ? [e] : e;
  return Object.keys(t).reduce((r, i) => (n.includes(i) || (r[i] = t[i]), r), {});
}
var H1 = (t, e) => ({ tr: n, state: r, dispatch: i }) => {
  let o = null, s = null;
  const u = Gi(
    typeof t == "string" ? t : t.name,
    r.schema
  );
  if (!u)
    return !1;
  u === "node" && (o = X(t, r.schema)), u === "mark" && (s = st(t, r.schema));
  let l = !1;
  return n.selection.ranges.forEach((a) => {
    r.doc.nodesBetween(a.$from.pos, a.$to.pos, (c, d) => {
      o && o === c.type && (l = !0, i && n.setNodeMarkup(d, void 0, jl(c.attrs, e))), s && c.marks.length && c.marks.forEach((f) => {
        s === f.type && (l = !0, i && n.addMark(d, d + c.nodeSize, s.create(jl(f.attrs, e))));
      });
    });
  }), l;
}, V1 = () => ({ tr: t, dispatch: e }) => (e && t.scrollIntoView(), !0), j1 = () => ({ tr: t, dispatch: e }) => {
  if (e) {
    const n = new Ee(t.doc);
    t.setSelection(n);
  }
  return !0;
}, q1 = () => ({ state: t, dispatch: e }) => Jc(t, e), W1 = () => ({ state: t, dispatch: e }) => Xc(t, e), U1 = () => ({ state: t, dispatch: e }) => r0(t, e), K1 = () => ({ state: t, dispatch: e }) => s0(t, e), J1 = () => ({ state: t, dispatch: e }) => o0(t, e);
function ps(t, e, n = {}, r = {}) {
  return er(t, e, {
    slice: !1,
    parseOptions: n,
    errorOnInvalidContent: r.errorOnInvalidContent
  });
}
var G1 = (t, { errorOnInvalidContent: e, emitUpdate: n = !0, parseOptions: r = {} } = {}) => ({ editor: i, tr: o, dispatch: s, commands: u }) => {
  const { doc: l } = o;
  if (r.preserveWhitespace !== "full") {
    const a = ps(t, i.schema, r, {
      errorOnInvalidContent: e ?? i.options.enableContentCheck
    });
    return s && o.replaceWith(0, l.content.size, a).setMeta("preventUpdate", !n), !0;
  }
  return s && o.setMeta("preventUpdate", !n), u.insertContentAt({ from: 0, to: l.content.size }, t, {
    parseOptions: r,
    errorOnInvalidContent: e ?? i.options.enableContentCheck
  });
};
function qd(t, e) {
  const n = st(e, t.schema), { from: r, to: i, empty: o } = t.selection, s = [];
  o ? (t.storedMarks && s.push(...t.storedMarks), s.push(...t.selection.$head.marks())) : t.doc.nodesBetween(r, i, (l) => {
    s.push(...l.marks);
  });
  const u = s.find((l) => l.type.name === n.name);
  return u ? { ...u.attrs } : {};
}
function Wd(t, e) {
  const n = new qs(t);
  return e.forEach((r) => {
    r.steps.forEach((i) => {
      n.step(i);
    });
  }), n;
}
function Z1(t) {
  for (let e = 0; e < t.edgeCount; e += 1) {
    const { type: n } = t.edge(e);
    if (n.isTextblock && !n.hasRequiredAttrs())
      return n;
  }
  return null;
}
function X1(t, e, n) {
  const r = [];
  return t.nodesBetween(e.from, e.to, (i, o) => {
    n(i) && r.push({
      node: i,
      pos: o
    });
  }), r;
}
function Ud(t, e) {
  for (let n = t.depth; n > 0; n -= 1) {
    const r = t.node(n);
    if (e(r))
      return {
        pos: n > 0 ? t.before(n) : 0,
        start: t.start(n),
        depth: n,
        node: r
      };
  }
}
function Zi(t) {
  return (e) => Ud(e.$from, t);
}
function T(t, e, n) {
  return t.config[e] === void 0 && t.parent ? T(t.parent, e, n) : typeof t.config[e] == "function" ? t.config[e].bind({
    ...n,
    parent: t.parent ? T(t.parent, e, n) : null
  }) : t.config[e];
}
function cu(t) {
  return t.map((e) => {
    const n = {
      name: e.name,
      options: e.options,
      storage: e.storage
    }, r = T(e, "addExtensions", n);
    return r ? [e, ...cu(r())] : e;
  }).flat(10);
}
function fr(t, e) {
  const n = Yt.fromSchema(e).serializeFragment(t), i = document.implementation.createHTMLDocument().createElement("div");
  return i.appendChild(n), i.innerHTML;
}
function Kd(t) {
  return typeof t == "function";
}
function F(t, e = void 0, ...n) {
  return Kd(t) ? e ? t.bind(e)(...n) : t(...n) : t;
}
function Y1(t = {}) {
  return Object.keys(t).length === 0 && t.constructor === Object;
}
function gn(t) {
  const e = t.filter((i) => i.type === "extension"), n = t.filter((i) => i.type === "node"), r = t.filter((i) => i.type === "mark");
  return {
    baseExtensions: e,
    nodeExtensions: n,
    markExtensions: r
  };
}
function Jd(t) {
  const e = [], { nodeExtensions: n, markExtensions: r } = gn(t), i = [...n, ...r], o = {
    default: null,
    validate: void 0,
    rendered: !0,
    renderHTML: null,
    parseHTML: null,
    keepOnSplit: !0,
    isRequired: !1
  }, s = n.filter((a) => a.name !== "text").map((a) => a.name), u = r.map((a) => a.name), l = [...s, ...u];
  return t.forEach((a) => {
    const c = {
      name: a.name,
      options: a.options,
      storage: a.storage,
      extensions: i
    }, d = T(
      a,
      "addGlobalAttributes",
      c
    );
    if (!d)
      return;
    d().forEach((h) => {
      let p;
      Array.isArray(h.types) ? p = h.types : h.types === "*" ? p = l : h.types === "nodes" ? p = s : h.types === "marks" ? p = u : p = [], p.forEach((m) => {
        Object.entries(h.attributes).forEach(([g, b]) => {
          e.push({
            type: m,
            name: g,
            attribute: {
              ...o,
              ...b
            }
          });
        });
      });
    });
  }), i.forEach((a) => {
    const c = {
      name: a.name,
      options: a.options,
      storage: a.storage
    }, d = T(
      a,
      "addAttributes",
      c
    );
    if (!d)
      return;
    const f = d();
    Object.entries(f).forEach(([h, p]) => {
      const m = {
        ...o,
        ...p
      };
      typeof m?.default == "function" && (m.default = m.default()), m?.isRequired && m?.default === void 0 && delete m.default, e.push({
        type: a.name,
        name: h,
        attribute: m
      });
    });
  }), e;
}
function q(...t) {
  return t.filter((e) => !!e).reduce((e, n) => {
    const r = { ...e };
    return Object.entries(n).forEach(([i, o]) => {
      if (!r[i]) {
        r[i] = o;
        return;
      }
      if (i === "class") {
        const u = o ? String(o).split(" ") : [], l = r[i] ? r[i].split(" ") : [], a = u.filter((c) => !l.includes(c));
        r[i] = [...l, ...a].join(" ");
      } else if (i === "style") {
        const u = o ? o.split(";").map((c) => c.trim()).filter(Boolean) : [], l = r[i] ? r[i].split(";").map((c) => c.trim()).filter(Boolean) : [], a = /* @__PURE__ */ new Map();
        l.forEach((c) => {
          const [d, f] = c.split(":").map((h) => h.trim());
          a.set(d, f);
        }), u.forEach((c) => {
          const [d, f] = c.split(":").map((h) => h.trim());
          a.set(d, f);
        }), r[i] = Array.from(a.entries()).map(([c, d]) => `${c}: ${d}`).join("; ");
      } else
        r[i] = o;
    }), r;
  }, {});
}
function tr(t, e) {
  return e.filter((n) => n.type === t.type.name).filter((n) => n.attribute.rendered).map((n) => n.attribute.renderHTML ? n.attribute.renderHTML(t.attrs) || {} : {
    [n.name]: t.attrs[n.name]
  }).reduce((n, r) => q(n, r), {});
}
function Q1(t) {
  return typeof t != "string" ? t : t.match(/^[+-]?(?:\d*\.)?\d+$/) ? Number(t) : t === "true" ? !0 : t === "false" ? !1 : t;
}
function ql(t, e) {
  return "style" in t ? t : {
    ...t,
    getAttrs: (n) => {
      const r = t.getAttrs ? t.getAttrs(n) : t.attrs;
      if (r === !1)
        return !1;
      const i = e.reduce((o, s) => {
        const u = s.attribute.parseHTML ? s.attribute.parseHTML(n) : Q1(n.getAttribute(s.name));
        return u == null ? o : {
          ...o,
          [s.name]: u
        };
      }, {});
      return { ...r, ...i };
    }
  };
}
function Wl(t) {
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(t).filter(([e, n]) => e === "attrs" && Y1(n) ? !1 : n != null)
  );
}
function Ul(t) {
  var e, n;
  const r = {};
  return !((e = t?.attribute) != null && e.isRequired) && "default" in (t?.attribute || {}) && (r.default = t.attribute.default), ((n = t?.attribute) == null ? void 0 : n.validate) !== void 0 && (r.validate = t.attribute.validate), [t.name, r];
}
function eg(t, e) {
  var n;
  const r = Jd(t), { nodeExtensions: i, markExtensions: o } = gn(t), s = (n = i.find((a) => T(a, "topNode"))) == null ? void 0 : n.name, u = Object.fromEntries(
    i.map((a) => {
      const c = r.filter((b) => b.type === a.name), d = {
        name: a.name,
        options: a.options,
        storage: a.storage,
        editor: e
      }, f = t.reduce((b, y) => {
        const k = T(y, "extendNodeSchema", d);
        return {
          ...b,
          ...k ? k(a) : {}
        };
      }, {}), h = Wl({
        ...f,
        content: F(T(a, "content", d)),
        marks: F(T(a, "marks", d)),
        group: F(T(a, "group", d)),
        inline: F(T(a, "inline", d)),
        atom: F(T(a, "atom", d)),
        selectable: F(T(a, "selectable", d)),
        draggable: F(T(a, "draggable", d)),
        code: F(T(a, "code", d)),
        whitespace: F(T(a, "whitespace", d)),
        linebreakReplacement: F(
          T(a, "linebreakReplacement", d)
        ),
        defining: F(T(a, "defining", d)),
        isolating: F(T(a, "isolating", d)),
        attrs: Object.fromEntries(c.map(Ul))
      }), p = F(T(a, "parseHTML", d));
      p && (h.parseDOM = p.map(
        (b) => ql(b, c)
      ));
      const m = T(a, "renderHTML", d);
      m && (h.toDOM = (b) => m({
        node: b,
        HTMLAttributes: tr(b, c)
      }));
      const g = T(a, "renderText", d);
      return g && (h.toText = g), [a.name, h];
    })
  ), l = Object.fromEntries(
    o.map((a) => {
      const c = r.filter((g) => g.type === a.name), d = {
        name: a.name,
        options: a.options,
        storage: a.storage,
        editor: e
      }, f = t.reduce((g, b) => {
        const y = T(b, "extendMarkSchema", d);
        return {
          ...g,
          ...y ? y(a) : {}
        };
      }, {}), h = Wl({
        ...f,
        inclusive: F(T(a, "inclusive", d)),
        excludes: F(T(a, "excludes", d)),
        group: F(T(a, "group", d)),
        spanning: F(T(a, "spanning", d)),
        code: F(T(a, "code", d)),
        attrs: Object.fromEntries(c.map(Ul))
      }), p = F(T(a, "parseHTML", d));
      p && (h.parseDOM = p.map(
        (g) => ql(g, c)
      ));
      const m = T(a, "renderHTML", d);
      return m && (h.toDOM = (g) => m({
        mark: g,
        HTMLAttributes: tr(g, c)
      })), [a.name, h];
    })
  );
  return new $s({
    topNode: s,
    nodes: u,
    marks: l
  });
}
function tg(t) {
  const e = t.filter((n, r) => t.indexOf(n) !== r);
  return Array.from(new Set(e));
}
function $n(t) {
  return t.sort((n, r) => {
    const i = T(n, "priority") || 100, o = T(r, "priority") || 100;
    return i > o ? -1 : i < o ? 1 : 0;
  });
}
function Gd(t) {
  const e = $n(cu(t)), n = tg(e.map((r) => r.name));
  return n.length && console.warn(
    `[tiptap warn]: Duplicate extension names found: [${n.map((r) => `'${r}'`).join(", ")}]. This can lead to issues.`
  ), e;
}
function Zd(t, e, n) {
  const { from: r, to: i } = e, { blockSeparator: o = `

`, textSerializers: s = {} } = n || {};
  let u = "";
  return t.nodesBetween(r, i, (l, a, c, d) => {
    var f;
    l.isBlock && a > r && (u += o);
    const h = s?.[l.type.name];
    if (h)
      return c && (u += h({
        node: l,
        pos: a,
        parent: c,
        index: d,
        range: e
      })), !1;
    l.isText && (u += (f = l?.text) == null ? void 0 : f.slice(Math.max(r, a) - a, i - a));
  }), u;
}
function ng(t, e) {
  const n = {
    from: 0,
    to: t.content.size
  };
  return Zd(t, n, e);
}
function Xd(t) {
  return Object.fromEntries(
    Object.entries(t.nodes).filter(([, e]) => e.spec.toText).map(([e, n]) => [e, n.spec.toText])
  );
}
function rg(t, e) {
  const n = X(e, t.schema), { from: r, to: i } = t.selection, o = [];
  t.doc.nodesBetween(r, i, (u) => {
    o.push(u);
  });
  const s = o.reverse().find((u) => u.type.name === n.name);
  return s ? { ...s.attrs } : {};
}
function Yd(t, e) {
  const n = Gi(
    typeof e == "string" ? e : e.name,
    t.schema
  );
  return n === "node" ? rg(t, e) : n === "mark" ? qd(t, e) : {};
}
function ig(t, e = JSON.stringify) {
  const n = {};
  return t.filter((r) => {
    const i = e(r);
    return Object.prototype.hasOwnProperty.call(n, i) ? !1 : n[i] = !0;
  });
}
function og(t) {
  const e = ig(t);
  return e.length === 1 ? e : e.filter((n, r) => !e.filter((o, s) => s !== r).some((o) => n.oldRange.from >= o.oldRange.from && n.oldRange.to <= o.oldRange.to && n.newRange.from >= o.newRange.from && n.newRange.to <= o.newRange.to));
}
function Qd(t) {
  const { mapping: e, steps: n } = t, r = [];
  return e.maps.forEach((i, o) => {
    const s = [];
    if (i.ranges.length)
      i.forEach((u, l) => {
        s.push({ from: u, to: l });
      });
    else {
      const { from: u, to: l } = n[o];
      if (u === void 0 || l === void 0)
        return;
      s.push({ from: u, to: l });
    }
    s.forEach(({ from: u, to: l }) => {
      const a = e.slice(o).map(u, -1), c = e.slice(o).map(l), d = e.invert().map(a, -1), f = e.invert().map(c);
      r.push({
        oldRange: {
          from: d,
          to: f
        },
        newRange: {
          from: a,
          to: c
        }
      });
    });
  }), og(r);
}
function du(t, e, n) {
  const r = [];
  return t === e ? n.resolve(t).marks().forEach((i) => {
    const o = n.resolve(t), s = au(o, i.type);
    s && r.push({
      mark: i,
      ...s
    });
  }) : n.nodesBetween(t, e, (i, o) => {
    !i || i?.nodeSize === void 0 || r.push(
      ...i.marks.map((s) => ({
        from: o,
        to: o + i.nodeSize,
        mark: s
      }))
    );
  }), r;
}
var sg = (t, e, n, r = 20) => {
  const i = t.doc.resolve(n);
  let o = r, s = null;
  for (; o > 0 && s === null; ) {
    const u = i.node(o);
    u?.type.name === e ? s = u : o -= 1;
  }
  return [s, o];
};
function vn(t, e) {
  return e.nodes[t] || e.marks[t] || null;
}
function $r(t, e, n) {
  return Object.fromEntries(
    Object.entries(n).filter(([r]) => {
      const i = t.find((o) => o.type === e && o.name === r);
      return i ? i.attribute.keepOnSplit : !1;
    })
  );
}
var ug = (t, e = 500) => {
  let n = "";
  const r = t.parentOffset;
  return t.parent.nodesBetween(Math.max(0, r - e), r, (i, o, s, u) => {
    var l, a;
    const c = ((a = (l = i.type.spec).toText) == null ? void 0 : a.call(l, {
      node: i,
      pos: o,
      parent: s,
      index: u
    })) || i.textContent || "%leaf%";
    n += i.isAtom && !i.isText ? c : c.slice(0, Math.max(0, r - o));
  }), n;
};
function ms(t, e, n = {}) {
  const { empty: r, ranges: i } = t.selection, o = e ? st(e, t.schema) : null;
  if (r)
    return !!(t.storedMarks || t.selection.$from.marks()).filter((d) => o ? o.name === d.type.name : !0).find((d) => ri(d.attrs, n, { strict: !1 }));
  let s = 0;
  const u = [];
  if (i.forEach(({ $from: d, $to: f }) => {
    const h = d.pos, p = f.pos;
    t.doc.nodesBetween(h, p, (m, g) => {
      if (o && m.inlineContent && !m.type.allowsMarkType(o))
        return !1;
      if (!m.isText && !m.marks.length)
        return;
      const b = Math.max(h, g), y = Math.min(p, g + m.nodeSize), k = y - b;
      s += k, u.push(
        ...m.marks.map((C) => ({
          mark: C,
          from: b,
          to: y
        }))
      );
    });
  }), s === 0)
    return !1;
  const l = u.filter((d) => o ? o.name === d.mark.type.name : !0).filter((d) => ri(d.mark.attrs, n, { strict: !1 })).reduce((d, f) => d + f.to - f.from, 0), a = u.filter((d) => o ? d.mark.type !== o && d.mark.type.excludes(o) : !0).reduce((d, f) => d + f.to - f.from, 0);
  return (l > 0 ? l + a : l) >= s;
}
function lg(t, e, n = {}) {
  if (!e)
    return Tt(t, null, n) || ms(t, null, n);
  const r = Gi(e, t.schema);
  return r === "node" ? Tt(t, e, n) : r === "mark" ? ms(t, e, n) : !1;
}
var ag = (t, e) => {
  const { $from: n, $to: r, $anchor: i } = t.selection;
  if (e) {
    const o = Zi((u) => u.type.name === e)(t.selection);
    if (!o)
      return !1;
    const s = t.doc.resolve(o.pos + 1);
    return i.pos + 1 === s.end();
  }
  return !(r.parentOffset < r.parent.nodeSize - 2 || n.pos !== r.pos);
}, cg = (t) => {
  const { $from: e, $to: n } = t.selection;
  return !(e.parentOffset > 0 || e.pos !== n.pos);
};
function Kl(t, e) {
  return Array.isArray(e) ? e.some((n) => (typeof n == "string" ? n : n.name) === t.name) : e;
}
function Jl(t, e) {
  const { nodeExtensions: n } = gn(e), r = n.find((s) => s.name === t);
  if (!r)
    return !1;
  const i = {
    name: r.name,
    options: r.options,
    storage: r.storage
  }, o = F(T(r, "group", i));
  return typeof o != "string" ? !1 : o.split(" ").includes("list");
}
function Xi(t, {
  checkChildren: e = !0,
  ignoreWhitespace: n = !1
} = {}) {
  var r;
  if (n) {
    if (t.type.name === "hardBreak")
      return !0;
    if (t.isText)
      return /^\s*$/m.test((r = t.text) != null ? r : "");
  }
  if (t.isText)
    return !t.text;
  if (t.isAtom || t.isLeaf)
    return !1;
  if (t.content.childCount === 0)
    return !0;
  if (e) {
    let i = !0;
    return t.content.forEach((o) => {
      i !== !1 && (Xi(o, { ignoreWhitespace: n, checkChildren: e }) || (i = !1));
    }), i;
  }
  return !1;
}
function ef(t) {
  return t instanceof _;
}
var tf = class nf {
  constructor(e) {
    this.position = e;
  }
  /**
   * Creates a MappablePosition from a JSON object.
   */
  static fromJSON(e) {
    return new nf(e.position);
  }
  /**
   * Converts the MappablePosition to a JSON object.
   */
  toJSON() {
    return {
      position: this.position
    };
  }
};
function dg(t, e) {
  const n = e.mapping.mapResult(t.position);
  return {
    position: new tf(n.pos),
    mapResult: n
  };
}
function fg(t) {
  return new tf(t);
}
function hg(t, e, n) {
  var r;
  const { selection: i } = e;
  let o = null;
  if ($d(i) && (o = i.$cursor), o) {
    const u = (r = t.storedMarks) != null ? r : o.marks();
    return o.parent.type.allowsMarkType(n) && (!!n.isInSet(u) || !u.some((a) => a.type.excludes(n)));
  }
  const { ranges: s } = i;
  return s.some(({ $from: u, $to: l }) => {
    let a = u.depth === 0 ? t.doc.inlineContent && t.doc.type.allowsMarkType(n) : !1;
    return t.doc.nodesBetween(u.pos, l.pos, (c, d, f) => {
      if (a)
        return !1;
      if (c.isInline) {
        const h = !f || f.type.allowsMarkType(n), p = !!n.isInSet(c.marks) || !c.marks.some((m) => m.type.excludes(n));
        a = h && p;
      }
      return !a;
    }), a;
  });
}
var pg = (t, e = {}) => ({ tr: n, state: r, dispatch: i }) => {
  const { selection: o } = n, { empty: s, ranges: u } = o, l = st(t, r.schema);
  if (i)
    if (s) {
      const a = qd(r, l);
      n.addStoredMark(
        l.create({
          ...a,
          ...e
        })
      );
    } else
      u.forEach((a) => {
        const c = a.$from.pos, d = a.$to.pos;
        r.doc.nodesBetween(c, d, (f, h) => {
          const p = Math.max(h, c), m = Math.min(h + f.nodeSize, d);
          f.marks.find((b) => b.type === l) ? f.marks.forEach((b) => {
            l === b.type && n.addMark(
              p,
              m,
              l.create({
                ...b.attrs,
                ...e
              })
            );
          }) : n.addMark(p, m, l.create(e));
        });
      });
  return hg(r, n, l);
}, mg = (t, e) => ({ tr: n }) => (n.setMeta(t, e), !0), gg = (t, e = {}) => ({ state: n, dispatch: r, chain: i }) => {
  const o = X(t, n.schema);
  let s;
  return n.selection.$anchor.sameParent(n.selection.$head) && (s = n.selection.$anchor.parent.attrs), o.isTextblock ? i().command(({ commands: u }) => ul(o, { ...s, ...e })(n) ? !0 : u.clearNodes()).command(({ state: u }) => ul(o, { ...s, ...e })(u, r)).run() : (console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.'), !1);
}, bg = (t) => ({ tr: e, dispatch: n }) => {
  if (n) {
    const { doc: r } = e, i = Bt(t, 0, r.content.size), o = _.create(r, i);
    e.setSelection(o);
  }
  return !0;
}, yg = (t, e) => ({ tr: n, state: r, dispatch: i }) => {
  const { selection: o } = r;
  let s, u;
  return typeof e == "number" ? (s = e, u = e) : e && "from" in e && "to" in e ? (s = e.from, u = e.to) : (s = o.from, u = o.to), i && n.doc.nodesBetween(s, u, (l, a) => {
    l.isText || n.setNodeMarkup(a, void 0, {
      ...l.attrs,
      dir: t
    });
  }), !0;
}, kg = (t) => ({ tr: e, dispatch: n }) => {
  if (n) {
    const { doc: r } = e, { from: i, to: o } = typeof t == "number" ? { from: t, to: t } : t, s = D.atStart(r).from, u = D.atEnd(r).to, l = Bt(i, s, u), a = Bt(o, s, u), c = D.create(r, l, a);
    e.setSelection(c);
  }
  return !0;
}, xg = (t) => ({ state: e, dispatch: n }) => {
  const r = X(t, e.schema);
  return p0(r)(e, n);
};
function Gl(t, e) {
  const n = t.storedMarks || t.selection.$to.parentOffset && t.selection.$from.marks();
  if (n) {
    const r = n.filter((i) => e?.includes(i.type.name));
    t.tr.ensureMarks(r);
  }
}
var Cg = ({ keepMarks: t = !0 } = {}) => ({ tr: e, state: n, dispatch: r, editor: i }) => {
  const { selection: o, doc: s } = e, { $from: u, $to: l } = o, a = i.extensionManager.attributes, c = $r(a, u.node().type.name, u.node().attrs);
  if (o instanceof _ && o.node.isBlock)
    return !u.parentOffset || !it(s, u.pos) ? !1 : (r && (t && Gl(n, i.extensionManager.splittableMarks), e.split(u.pos).scrollIntoView()), !0);
  if (!u.parent.isBlock)
    return !1;
  const d = l.parentOffset === l.parent.content.size, f = u.depth === 0 ? void 0 : Z1(u.node(-1).contentMatchAt(u.indexAfter(-1)));
  let h = d && f ? [
    {
      type: f,
      attrs: c
    }
  ] : void 0, p = it(e.doc, e.mapping.map(u.pos), 1, h);
  if (!h && !p && it(e.doc, e.mapping.map(u.pos), 1, f ? [{ type: f }] : void 0) && (p = !0, h = f ? [
    {
      type: f,
      attrs: c
    }
  ] : void 0), r) {
    if (p && (o instanceof D && e.deleteSelection(), e.split(e.mapping.map(u.pos), 1, h), f && !d && !u.parentOffset && u.parent.type !== f)) {
      const m = e.mapping.map(u.before()), g = e.doc.resolve(m);
      u.node(-1).canReplaceWith(g.index(), g.index() + 1, f) && e.setNodeMarkup(e.mapping.map(u.before()), f);
    }
    t && Gl(n, i.extensionManager.splittableMarks), e.scrollIntoView();
  }
  return p;
}, wg = (t, e = {}) => ({ tr: n, state: r, dispatch: i, editor: o }) => {
  var s;
  const u = X(t, r.schema), { $from: l, $to: a } = r.selection, c = r.selection.node;
  if (c && c.isBlock || l.depth < 2 || !l.sameParent(a))
    return !1;
  const d = l.node(-1);
  if (d.type !== u)
    return !1;
  const f = o.extensionManager.attributes;
  if (l.parent.content.size === 0 && l.node(-1).childCount === l.indexAfter(-1)) {
    if (l.depth === 2 || l.node(-3).type !== u || l.index(-2) !== l.node(-2).childCount - 1)
      return !1;
    if (i) {
      let b = w.empty;
      const y = l.index(-1) ? 1 : l.index(-2) ? 2 : 3;
      for (let M = l.depth - y; M >= l.depth - 3; M -= 1)
        b = w.from(l.node(M).copy(b));
      const k = (
        // eslint-disable-next-line no-nested-ternary
        l.indexAfter(-1) < l.node(-2).childCount ? 1 : l.indexAfter(-2) < l.node(-3).childCount ? 2 : 3
      ), C = {
        ...$r(f, l.node().type.name, l.node().attrs),
        ...e
      }, x = ((s = u.contentMatch.defaultType) == null ? void 0 : s.createAndFill(C)) || void 0;
      b = b.append(w.from(u.createAndFill(null, x) || void 0));
      const E = l.before(l.depth - (y - 1));
      n.replace(E, l.after(-k), new v(b, 4 - y, 0));
      let S = -1;
      n.doc.nodesBetween(E, n.doc.content.size, (M, N) => {
        if (S > -1)
          return !1;
        M.isTextblock && M.content.size === 0 && (S = N + 1);
      }), S > -1 && n.setSelection(D.near(n.doc.resolve(S))), n.scrollIntoView();
    }
    return !0;
  }
  const h = a.pos === l.end() ? d.contentMatchAt(0).defaultType : null, p = {
    ...$r(f, d.type.name, d.attrs),
    ...e
  }, m = {
    ...$r(f, l.node().type.name, l.node().attrs),
    ...e
  };
  n.delete(l.pos, a.pos);
  const g = h ? [
    { type: u, attrs: p },
    { type: h, attrs: m }
  ] : [{ type: u, attrs: p }];
  if (!it(n.doc, l.pos, 2))
    return !1;
  if (i) {
    const { selection: b, storedMarks: y } = r, { splittableMarks: k } = o.extensionManager, C = y || b.$to.parentOffset && b.$from.marks();
    if (n.split(l.pos, 2, g).scrollIntoView(), !C || !i)
      return !0;
    const x = C.filter((E) => k.includes(E.type.name));
    n.ensureMarks(x);
  }
  return !0;
}, Ao = (t, e) => {
  const n = Zi((s) => s.type === e)(t.selection);
  if (!n)
    return !0;
  const r = t.doc.resolve(Math.max(0, n.pos - 1)).before(n.depth);
  if (r === void 0)
    return !0;
  const i = t.doc.nodeAt(r);
  return n.node.type === i?.type && Dt(t.doc, n.pos) && t.join(n.pos), !0;
}, vo = (t, e) => {
  const n = Zi((s) => s.type === e)(t.selection);
  if (!n)
    return !0;
  const r = t.doc.resolve(n.start).after(n.depth);
  if (r === void 0)
    return !0;
  const i = t.doc.nodeAt(r);
  return n.node.type === i?.type && Dt(t.doc, r) && t.join(r), !0;
}, Eg = (t, e, n, r = {}) => ({ editor: i, tr: o, state: s, dispatch: u, chain: l, commands: a, can: c }) => {
  const { extensions: d, splittableMarks: f } = i.extensionManager, h = X(t, s.schema), p = X(e, s.schema), { selection: m, storedMarks: g } = s, { $from: b, $to: y } = m, k = b.blockRange(y), C = g || m.$to.parentOffset && m.$from.marks();
  if (!k)
    return !1;
  const x = Zi((E) => Jl(E.type.name, d))(m);
  if (k.depth >= 1 && x && k.depth - x.depth <= 1) {
    if (x.node.type === h)
      return a.liftListItem(p);
    if (Jl(x.node.type.name, d) && h.validContent(x.node.content) && u)
      return l().command(() => (o.setNodeMarkup(x.pos, h), !0)).command(() => Ao(o, h)).command(() => vo(o, h)).run();
  }
  return !n || !C || !u ? l().command(() => c().wrapInList(h, r) ? !0 : a.clearNodes()).wrapInList(h, r).command(() => Ao(o, h)).command(() => vo(o, h)).run() : l().command(() => {
    const E = c().wrapInList(h, r), S = C.filter((M) => f.includes(M.type.name));
    return o.ensureMarks(S), E ? !0 : a.clearNodes();
  }).wrapInList(h, r).command(() => Ao(o, h)).command(() => vo(o, h)).run();
}, Sg = (t, e = {}, n = {}) => ({ state: r, commands: i }) => {
  const { extendEmptyMarkRange: o = !1 } = n, s = st(t, r.schema);
  return ms(r, s, e) ? i.unsetMark(s, { extendEmptyMarkRange: o }) : i.setMark(s, e);
}, Ag = (t, e, n = {}) => ({ state: r, commands: i }) => {
  const o = X(t, r.schema), s = X(e, r.schema), u = Tt(r, o, n);
  let l;
  return r.selection.$anchor.sameParent(r.selection.$head) && (l = r.selection.$anchor.parent.attrs), u ? i.setNode(s, l) : i.setNode(o, { ...l, ...n });
}, vg = (t, e = {}) => ({ state: n, commands: r }) => {
  const i = X(t, n.schema);
  return Tt(n, i, e) ? r.lift(i) : r.wrapIn(i, e);
}, Mg = () => ({ state: t, dispatch: e }) => {
  const n = t.plugins;
  for (let r = 0; r < n.length; r += 1) {
    const i = n[r];
    let o;
    if (i.spec.isInputRules && (o = i.getState(t))) {
      if (e) {
        const s = t.tr, u = o.transform;
        for (let l = u.steps.length - 1; l >= 0; l -= 1)
          s.step(u.steps[l].invert(u.docs[l]));
        if (o.text) {
          const l = s.doc.resolve(o.from).marks();
          s.replaceWith(o.from, o.to, t.schema.text(o.text, l));
        } else
          s.delete(o.from, o.to);
      }
      return !0;
    }
  }
  return !1;
}, Tg = () => ({ tr: t, dispatch: e }) => {
  const { selection: n } = t, { empty: r, ranges: i } = n;
  return r || e && i.forEach((o) => {
    t.removeMark(o.$from.pos, o.$to.pos);
  }), !0;
}, _g = (t, e = {}) => ({ tr: n, state: r, dispatch: i }) => {
  var o;
  const { extendEmptyMarkRange: s = !1 } = e, { selection: u } = n, l = st(t, r.schema), { $from: a, empty: c, ranges: d } = u;
  if (!i)
    return !0;
  if (c && s) {
    let { from: f, to: h } = u;
    const p = (o = a.marks().find((g) => g.type === l)) == null ? void 0 : o.attrs, m = au(a, l, p);
    m && (f = m.from, h = m.to), n.removeMark(f, h, l);
  } else
    d.forEach((f) => {
      n.removeMark(f.$from.pos, f.$to.pos, l);
    });
  return n.removeStoredMark(l), !0;
}, Dg = (t) => ({ tr: e, state: n, dispatch: r }) => {
  const { selection: i } = n;
  let o, s;
  return typeof t == "number" ? (o = t, s = t) : t && "from" in t && "to" in t ? (o = t.from, s = t.to) : (o = i.from, s = i.to), r && e.doc.nodesBetween(o, s, (u, l) => {
    if (u.isText)
      return;
    const a = { ...u.attrs };
    delete a.dir, e.setNodeMarkup(l, void 0, a);
  }), !0;
}, Og = (t, e = {}) => ({ tr: n, state: r, dispatch: i }) => {
  let o = null, s = null;
  const u = Gi(
    typeof t == "string" ? t : t.name,
    r.schema
  );
  if (!u)
    return !1;
  u === "node" && (o = X(t, r.schema)), u === "mark" && (s = st(t, r.schema));
  let l = !1;
  return n.selection.ranges.forEach((a) => {
    const c = a.$from.pos, d = a.$to.pos;
    let f, h, p, m;
    n.selection.empty ? r.doc.nodesBetween(c, d, (g, b) => {
      o && o === g.type && (l = !0, p = Math.max(b, c), m = Math.min(b + g.nodeSize, d), f = b, h = g);
    }) : r.doc.nodesBetween(c, d, (g, b) => {
      b < c && o && o === g.type && (l = !0, p = Math.max(b, c), m = Math.min(b + g.nodeSize, d), f = b, h = g), b >= c && b <= d && (o && o === g.type && (l = !0, i && n.setNodeMarkup(b, void 0, {
        ...g.attrs,
        ...e
      })), s && g.marks.length && g.marks.forEach((y) => {
        if (s === y.type && (l = !0, i)) {
          const k = Math.max(b, c), C = Math.min(b + g.nodeSize, d);
          n.addMark(
            k,
            C,
            s.create({
              ...y.attrs,
              ...e
            })
          );
        }
      }));
    }), h && (f !== void 0 && i && n.setNodeMarkup(f, void 0, {
      ...h.attrs,
      ...e
    }), s && h.marks.length && h.marks.forEach((g) => {
      s === g.type && i && n.addMark(
        p,
        m,
        s.create({
          ...g.attrs,
          ...e
        })
      );
    }));
  }), l;
}, Ng = (t, e = {}) => ({ state: n, dispatch: r }) => {
  const i = X(t, n.schema);
  return u0(i, e)(n, r);
}, Rg = (t, e = {}) => ({ state: n, dispatch: r }) => {
  const i = X(t, n.schema);
  return l0(i, e)(n, r);
}, Ig = class {
  constructor() {
    this.callbacks = {};
  }
  on(t, e) {
    return this.callbacks[t] || (this.callbacks[t] = []), this.callbacks[t].push(e), this;
  }
  emit(t, ...e) {
    const n = this.callbacks[t];
    return n && n.forEach((r) => r.apply(this, e)), this;
  }
  off(t, e) {
    const n = this.callbacks[t];
    return n && (e ? this.callbacks[t] = n.filter((r) => r !== e) : delete this.callbacks[t]), this;
  }
  once(t, e) {
    const n = (...r) => {
      this.off(t, n), e.apply(this, r);
    };
    return this.on(t, n);
  }
  removeAllListeners() {
    this.callbacks = {};
  }
}, Yi = class {
  constructor(t) {
    var e;
    this.find = t.find, this.handler = t.handler, this.undoable = (e = t.undoable) != null ? e : !0;
  }
}, Lg = (t, e) => {
  if (lu(e))
    return e.exec(t);
  const n = e(t);
  if (!n)
    return null;
  const r = [n.text];
  return r.index = n.index, r.input = t, r.data = n.data, n.replaceWith && (n.text.includes(n.replaceWith) || console.warn('[tiptap warn]: "inputRuleMatch.replaceWith" must be part of "inputRuleMatch.text".'), r.push(n.replaceWith)), r;
};
function wr(t) {
  var e;
  const { editor: n, from: r, to: i, text: o, rules: s, plugin: u } = t, { view: l } = n;
  if (l.composing)
    return !1;
  const a = l.state.doc.resolve(r);
  if (
    // check for code node
    a.parent.type.spec.code || (e = a.nodeBefore || a.nodeAfter) != null && e.marks.find((f) => f.type.spec.code)
  )
    return !1;
  let c = !1;
  const d = ug(a) + o;
  return s.forEach((f) => {
    if (c)
      return;
    const h = Lg(d, f.find);
    if (!h)
      return;
    const p = l.state.tr, m = Ki({
      state: l.state,
      transaction: p
    }), g = {
      from: r - (h[0].length - o.length),
      to: i
    }, { commands: b, chain: y, can: k } = new Ji({
      editor: n,
      state: m
    });
    f.handler({
      state: m,
      range: g,
      match: h,
      commands: b,
      chain: y,
      can: k
    }) === null || !p.steps.length || (f.undoable && p.setMeta(u, {
      transform: p,
      from: r,
      to: i,
      text: o
    }), l.dispatch(p), c = !0);
  }), c;
}
function Fg(t) {
  const { editor: e, rules: n } = t, r = new H({
    state: {
      init() {
        return null;
      },
      apply(i, o, s) {
        const u = i.getMeta(r);
        if (u)
          return u;
        const l = i.getMeta("applyInputRules");
        return !!l && setTimeout(() => {
          let { text: c } = l;
          typeof c == "string" ? c = c : c = fr(w.from(c), s.schema);
          const { from: d } = l, f = d + c.length;
          wr({
            editor: e,
            from: d,
            to: f,
            text: c,
            rules: n,
            plugin: r
          });
        }), i.selectionSet || i.docChanged ? null : o;
      }
    },
    props: {
      handleTextInput(i, o, s, u) {
        return wr({
          editor: e,
          from: o,
          to: s,
          text: u,
          rules: n,
          plugin: r
        });
      },
      handleDOMEvents: {
        compositionend: (i) => (setTimeout(() => {
          const { $cursor: o } = i.state.selection;
          o && wr({
            editor: e,
            from: o.pos,
            to: o.pos,
            text: "",
            rules: n,
            plugin: r
          });
        }), !1)
      },
      // add support for input rules to trigger on enter
      // this is useful for example for code blocks
      handleKeyDown(i, o) {
        if (o.key !== "Enter")
          return !1;
        const { $cursor: s } = i.state.selection;
        return s ? wr({
          editor: e,
          from: s.pos,
          to: s.pos,
          text: `
`,
          rules: n,
          plugin: r
        }) : !1;
      }
    },
    // @ts-ignore
    isInputRules: !0
  });
  return r;
}
function Pg(t) {
  return Object.prototype.toString.call(t).slice(8, -1);
}
function Er(t) {
  return Pg(t) !== "Object" ? !1 : t.constructor === Object && Object.getPrototypeOf(t) === Object.prototype;
}
function rf(t, e) {
  const n = { ...t };
  return Er(t) && Er(e) && Object.keys(e).forEach((r) => {
    Er(e[r]) && Er(t[r]) ? n[r] = rf(t[r], e[r]) : n[r] = e[r];
  }), n;
}
var fu = class {
  constructor(t = {}) {
    this.type = "extendable", this.parent = null, this.child = null, this.name = "", this.config = {
      name: this.name
    }, this.config = {
      ...this.config,
      ...t
    }, this.name = this.config.name;
  }
  get options() {
    return {
      ...F(
        T(this, "addOptions", {
          name: this.name
        })
      ) || {}
    };
  }
  get storage() {
    return {
      ...F(
        T(this, "addStorage", {
          name: this.name,
          options: this.options
        })
      ) || {}
    };
  }
  configure(t = {}) {
    const e = this.extend({
      ...this.config,
      addOptions: () => rf(this.options, t)
    });
    return e.name = this.name, e.parent = this.parent, e;
  }
  extend(t = {}) {
    const e = new this.constructor({ ...this.config, ...t });
    return e.parent = this, this.child = e, e.name = "name" in t ? t.name : e.parent.name, e;
  }
}, ve = class of extends fu {
  constructor() {
    super(...arguments), this.type = "mark";
  }
  /**
   * Create a new Mark instance
   * @param config - Mark configuration object or a function that returns a configuration object
   */
  static create(e = {}) {
    const n = typeof e == "function" ? e() : e;
    return new of(n);
  }
  static handleExit({ editor: e, mark: n }) {
    const { tr: r } = e.state, i = e.state.selection.$from;
    if (i.pos === i.end()) {
      const s = i.marks();
      if (!!!s.find((a) => a?.type.name === n.name))
        return !1;
      const l = s.find((a) => a?.type.name === n.name);
      return l && r.removeStoredMark(l), r.insertText(" ", i.pos), e.view.dispatch(r), !0;
    }
    return !1;
  }
  configure(e) {
    return super.configure(e);
  }
  extend(e) {
    const n = typeof e == "function" ? e() : e;
    return super.extend(n);
  }
};
function Bg(t) {
  return typeof t == "number";
}
var zg = class {
  constructor(t) {
    this.find = t.find, this.handler = t.handler;
  }
}, $g = (t, e, n) => {
  if (lu(e))
    return [...t.matchAll(e)];
  const r = e(t, n);
  return r ? r.map((i) => {
    const o = [i.text];
    return o.index = i.index, o.input = t, o.data = i.data, i.replaceWith && (i.text.includes(i.replaceWith) || console.warn('[tiptap warn]: "pasteRuleMatch.replaceWith" must be part of "pasteRuleMatch.text".'), o.push(i.replaceWith)), o;
  }) : [];
};
function Hg(t) {
  const { editor: e, state: n, from: r, to: i, rule: o, pasteEvent: s, dropEvent: u } = t, { commands: l, chain: a, can: c } = new Ji({
    editor: e,
    state: n
  }), d = [];
  return n.doc.nodesBetween(r, i, (h, p) => {
    var m, g, b, y, k;
    if ((g = (m = h.type) == null ? void 0 : m.spec) != null && g.code || !(h.isText || h.isTextblock || h.isInline))
      return;
    const C = (k = (y = (b = h.content) == null ? void 0 : b.size) != null ? y : h.nodeSize) != null ? k : 0, x = Math.max(r, p), E = Math.min(i, p + C);
    if (x >= E)
      return;
    const S = h.isText ? h.text || "" : h.textBetween(x - p, E - p, void 0, "￼");
    $g(S, o.find, s).forEach((N) => {
      if (N.index === void 0)
        return;
      const Y = x + N.index + 1, Pe = Y + N[0].length, Be = {
        from: n.tr.mapping.map(Y),
        to: n.tr.mapping.map(Pe)
      }, ut = o.handler({
        state: n,
        range: Be,
        match: N,
        commands: l,
        chain: a,
        can: c,
        pasteEvent: s,
        dropEvent: u
      });
      d.push(ut);
    });
  }), d.every((h) => h !== null);
}
var Sr = null, Vg = (t) => {
  var e;
  const n = new ClipboardEvent("paste", {
    clipboardData: new DataTransfer()
  });
  return (e = n.clipboardData) == null || e.setData("text/html", t), n;
};
function jg(t) {
  const { editor: e, rules: n } = t;
  let r = null, i = !1, o = !1, s = typeof ClipboardEvent < "u" ? new ClipboardEvent("paste") : null, u;
  try {
    u = typeof DragEvent < "u" ? new DragEvent("drop") : null;
  } catch {
    u = null;
  }
  const l = ({
    state: c,
    from: d,
    to: f,
    rule: h,
    pasteEvt: p
  }) => {
    const m = c.tr, g = Ki({
      state: c,
      transaction: m
    });
    if (!(!Hg({
      editor: e,
      state: g,
      from: Math.max(d - 1, 0),
      to: f.b - 1,
      rule: h,
      pasteEvent: p,
      dropEvent: u
    }) || !m.steps.length)) {
      try {
        u = typeof DragEvent < "u" ? new DragEvent("drop") : null;
      } catch {
        u = null;
      }
      return s = typeof ClipboardEvent < "u" ? new ClipboardEvent("paste") : null, m;
    }
  };
  return n.map((c) => new H({
    // we register a global drag handler to track the current drag source element
    view(d) {
      const f = (p) => {
        var m;
        r = (m = d.dom.parentElement) != null && m.contains(p.target) ? d.dom.parentElement : null, r && (Sr = e);
      }, h = () => {
        Sr && (Sr = null);
      };
      return window.addEventListener("dragstart", f), window.addEventListener("dragend", h), {
        destroy() {
          window.removeEventListener("dragstart", f), window.removeEventListener("dragend", h);
        }
      };
    },
    props: {
      handleDOMEvents: {
        drop: (d, f) => {
          if (o = r === d.dom.parentElement, u = f, !o) {
            const h = Sr;
            h?.isEditable && setTimeout(() => {
              const p = h.state.selection;
              p && h.commands.deleteRange({ from: p.from, to: p.to });
            }, 10);
          }
          return !1;
        },
        paste: (d, f) => {
          var h;
          const p = (h = f.clipboardData) == null ? void 0 : h.getData("text/html");
          return s = f, i = !!p?.includes("data-pm-slice"), !1;
        }
      }
    },
    appendTransaction: (d, f, h) => {
      const p = d[0], m = p.getMeta("uiEvent") === "paste" && !i, g = p.getMeta("uiEvent") === "drop" && !o, b = p.getMeta("applyPasteRules"), y = !!b;
      if (!m && !g && !y)
        return;
      if (y) {
        let { text: x } = b;
        typeof x == "string" ? x = x : x = fr(w.from(x), h.schema);
        const { from: E } = b, S = E + x.length, M = Vg(x);
        return l({
          rule: c,
          state: h,
          from: E,
          to: { b: S },
          pasteEvt: M
        });
      }
      const k = f.doc.content.findDiffStart(h.doc.content), C = f.doc.content.findDiffEnd(h.doc.content);
      if (!(!Bg(k) || !C || k === C.b))
        return l({
          rule: c,
          state: h,
          from: k,
          to: C,
          pasteEvt: s
        });
    }
  }));
}
var Qi = class {
  constructor(t, e) {
    this.splittableMarks = [], this.editor = e, this.baseExtensions = t, this.extensions = Gd(t), this.schema = eg(this.extensions, e), this.setupExtensions();
  }
  /**
   * Get all commands from the extensions.
   * @returns An object with all commands where the key is the command name and the value is the command function
   */
  get commands() {
    return this.extensions.reduce((t, e) => {
      const n = {
        name: e.name,
        options: e.options,
        storage: this.editor.extensionStorage[e.name],
        editor: this.editor,
        type: vn(e.name, this.schema)
      }, r = T(e, "addCommands", n);
      return r ? {
        ...t,
        ...r()
      } : t;
    }, {});
  }
  /**
   * Get all registered Prosemirror plugins from the extensions.
   * @returns An array of Prosemirror plugins
   */
  get plugins() {
    const { editor: t } = this;
    return $n([...this.extensions].reverse()).flatMap((r) => {
      const i = {
        name: r.name,
        options: r.options,
        storage: this.editor.extensionStorage[r.name],
        editor: t,
        type: vn(r.name, this.schema)
      }, o = [], s = T(
        r,
        "addKeyboardShortcuts",
        i
      );
      let u = {};
      if (r.type === "mark" && T(r, "exitable", i) && (u.ArrowRight = () => ve.handleExit({ editor: t, mark: r })), s) {
        const f = Object.fromEntries(
          Object.entries(s()).map(([h, p]) => [h, () => p({ editor: t })])
        );
        u = { ...u, ...f };
      }
      const l = i1(u);
      o.push(l);
      const a = T(r, "addInputRules", i);
      if (Kl(r, t.options.enableInputRules) && a) {
        const f = a();
        if (f && f.length) {
          const h = Fg({
            editor: t,
            rules: f
          }), p = Array.isArray(h) ? h : [h];
          o.push(...p);
        }
      }
      const c = T(r, "addPasteRules", i);
      if (Kl(r, t.options.enablePasteRules) && c) {
        const f = c();
        if (f && f.length) {
          const h = jg({ editor: t, rules: f });
          o.push(...h);
        }
      }
      const d = T(
        r,
        "addProseMirrorPlugins",
        i
      );
      if (d) {
        const f = d();
        o.push(...f);
      }
      return o;
    });
  }
  /**
   * Get all attributes from the extensions.
   * @returns An array of attributes
   */
  get attributes() {
    return Jd(this.extensions);
  }
  /**
   * Get all node views from the extensions.
   * @returns An object with all node views where the key is the node name and the value is the node view function
   */
  get nodeViews() {
    const { editor: t } = this, { nodeExtensions: e } = gn(this.extensions);
    return Object.fromEntries(
      e.filter((n) => !!T(n, "addNodeView")).map((n) => {
        const r = this.attributes.filter((l) => l.type === n.name), i = {
          name: n.name,
          options: n.options,
          storage: this.editor.extensionStorage[n.name],
          editor: t,
          type: X(n.name, this.schema)
        }, o = T(n, "addNodeView", i);
        if (!o)
          return [];
        const s = o();
        if (!s)
          return [];
        const u = (l, a, c, d, f) => {
          const h = tr(l, r);
          return s({
            // pass-through
            node: l,
            view: a,
            getPos: c,
            decorations: d,
            innerDecorations: f,
            // tiptap-specific
            editor: t,
            extension: n,
            HTMLAttributes: h
          });
        };
        return [n.name, u];
      })
    );
  }
  /**
   * Get the composed dispatchTransaction function from all extensions.
   * @param baseDispatch The base dispatch function (e.g. from the editor or user props)
   * @returns A composed dispatch function
   */
  dispatchTransaction(t) {
    const { editor: e } = this;
    return $n([...this.extensions].reverse()).reduceRight((r, i) => {
      const o = {
        name: i.name,
        options: i.options,
        storage: this.editor.extensionStorage[i.name],
        editor: e,
        type: vn(i.name, this.schema)
      }, s = T(
        i,
        "dispatchTransaction",
        o
      );
      return s ? (u) => {
        s.call(o, { transaction: u, next: r });
      } : r;
    }, t);
  }
  /**
   * Get the composed transformPastedHTML function from all extensions.
   * @param baseTransform The base transform function (e.g. from the editor props)
   * @returns A composed transform function that chains all extension transforms
   */
  transformPastedHTML(t) {
    const { editor: e } = this;
    return $n([...this.extensions]).reduce(
      (r, i) => {
        const o = {
          name: i.name,
          options: i.options,
          storage: this.editor.extensionStorage[i.name],
          editor: e,
          type: vn(i.name, this.schema)
        }, s = T(
          i,
          "transformPastedHTML",
          o
        );
        return s ? (u, l) => {
          const a = r(u, l);
          return s.call(o, a);
        } : r;
      },
      t || ((r) => r)
    );
  }
  get markViews() {
    const { editor: t } = this, { markExtensions: e } = gn(this.extensions);
    return Object.fromEntries(
      e.filter((n) => !!T(n, "addMarkView")).map((n) => {
        const r = this.attributes.filter((u) => u.type === n.name), i = {
          name: n.name,
          options: n.options,
          storage: this.editor.extensionStorage[n.name],
          editor: t,
          type: st(n.name, this.schema)
        }, o = T(n, "addMarkView", i);
        if (!o)
          return [];
        const s = (u, l, a) => {
          const c = tr(u, r);
          return o()({
            // pass-through
            mark: u,
            view: l,
            inline: a,
            // tiptap-specific
            editor: t,
            extension: n,
            HTMLAttributes: c,
            updateAttributes: (d) => {
              nb(u, t, d);
            }
          });
        };
        return [n.name, s];
      })
    );
  }
  /**
   * Go through all extensions, create extension storages & setup marks
   * & bind editor event listener.
   */
  setupExtensions() {
    const t = this.extensions;
    this.editor.extensionStorage = Object.fromEntries(
      t.map((e) => [e.name, e.storage])
    ), t.forEach((e) => {
      var n;
      const r = {
        name: e.name,
        options: e.options,
        storage: this.editor.extensionStorage[e.name],
        editor: this.editor,
        type: vn(e.name, this.schema)
      };
      e.type === "mark" && ((n = F(T(e, "keepOnSplit", r))) == null || n) && this.splittableMarks.push(e.name);
      const i = T(e, "onBeforeCreate", r), o = T(e, "onCreate", r), s = T(e, "onUpdate", r), u = T(
        e,
        "onSelectionUpdate",
        r
      ), l = T(e, "onTransaction", r), a = T(e, "onFocus", r), c = T(e, "onBlur", r), d = T(e, "onDestroy", r);
      i && this.editor.on("beforeCreate", i), o && this.editor.on("create", o), s && this.editor.on("update", s), u && this.editor.on("selectionUpdate", u), l && this.editor.on("transaction", l), a && this.editor.on("focus", a), c && this.editor.on("blur", c), d && this.editor.on("destroy", d);
    });
  }
};
Qi.resolve = Gd;
Qi.sort = $n;
Qi.flatten = cu;
var sf = {};
uu(sf, {
  ClipboardTextSerializer: () => lf,
  Commands: () => af,
  Delete: () => cf,
  Drop: () => df,
  Editable: () => ff,
  FocusEvents: () => pf,
  Keymap: () => mf,
  Paste: () => gf,
  Tabindex: () => bf,
  TextDirection: () => yf,
  focusEventsPluginKey: () => hf
});
var j = class uf extends fu {
  constructor() {
    super(...arguments), this.type = "extension";
  }
  /**
   * Create a new Extension instance
   * @param config - Extension configuration object or a function that returns a configuration object
   */
  static create(e = {}) {
    const n = typeof e == "function" ? e() : e;
    return new uf(n);
  }
  configure(e) {
    return super.configure(e);
  }
  extend(e) {
    const n = typeof e == "function" ? e() : e;
    return super.extend(n);
  }
}, lf = j.create({
  name: "clipboardTextSerializer",
  addOptions() {
    return {
      blockSeparator: void 0
    };
  },
  addProseMirrorPlugins() {
    return [
      new H({
        key: new W("clipboardTextSerializer"),
        props: {
          clipboardTextSerializer: () => {
            const { editor: t } = this, { state: e, schema: n } = t, { doc: r, selection: i } = e, { ranges: o } = i, s = Math.min(...o.map((c) => c.$from.pos)), u = Math.max(...o.map((c) => c.$to.pos)), l = Xd(n);
            return Zd(r, { from: s, to: u }, {
              ...this.options.blockSeparator !== void 0 ? { blockSeparator: this.options.blockSeparator } : {},
              textSerializers: l
            });
          }
        }
      })
    ];
  }
}), af = j.create({
  name: "commands",
  addCommands() {
    return {
      ...Bd
    };
  }
}), cf = j.create({
  name: "delete",
  onUpdate({ transaction: t, appendedTransactions: e }) {
    var n, r, i;
    const o = () => {
      var s, u, l, a;
      if ((a = (l = (u = (s = this.editor.options.coreExtensionOptions) == null ? void 0 : s.delete) == null ? void 0 : u.filterTransaction) == null ? void 0 : l.call(u, t)) != null ? a : t.getMeta("y-sync$"))
        return;
      const c = Wd(t.before, [t, ...e]);
      Qd(c).forEach((h) => {
        c.mapping.mapResult(h.oldRange.from).deletedAfter && c.mapping.mapResult(h.oldRange.to).deletedBefore && c.before.nodesBetween(h.oldRange.from, h.oldRange.to, (p, m) => {
          const g = m + p.nodeSize - 2, b = h.oldRange.from <= m && g <= h.oldRange.to;
          this.editor.emit("delete", {
            type: "node",
            node: p,
            from: m,
            to: g,
            newFrom: c.mapping.map(m),
            newTo: c.mapping.map(g),
            deletedRange: h.oldRange,
            newRange: h.newRange,
            partial: !b,
            editor: this.editor,
            transaction: t,
            combinedTransform: c
          });
        });
      });
      const f = c.mapping;
      c.steps.forEach((h, p) => {
        var m, g;
        if (h instanceof Ie) {
          const b = f.slice(p).map(h.from, -1), y = f.slice(p).map(h.to), k = f.invert().map(b, -1), C = f.invert().map(y), x = (m = c.doc.nodeAt(b - 1)) == null ? void 0 : m.marks.some((S) => S.eq(h.mark)), E = (g = c.doc.nodeAt(y)) == null ? void 0 : g.marks.some((S) => S.eq(h.mark));
          this.editor.emit("delete", {
            type: "mark",
            mark: h.mark,
            from: h.from,
            to: h.to,
            deletedRange: {
              from: k,
              to: C
            },
            newRange: {
              from: b,
              to: y
            },
            partial: !!(E || x),
            editor: this.editor,
            transaction: t,
            combinedTransform: c
          });
        }
      });
    };
    (i = (r = (n = this.editor.options.coreExtensionOptions) == null ? void 0 : n.delete) == null ? void 0 : r.async) == null || i ? setTimeout(o, 0) : o();
  }
}), df = j.create({
  name: "drop",
  addProseMirrorPlugins() {
    return [
      new H({
        key: new W("tiptapDrop"),
        props: {
          handleDrop: (t, e, n, r) => {
            this.editor.emit("drop", {
              editor: this.editor,
              event: e,
              slice: n,
              moved: r
            });
          }
        }
      })
    ];
  }
}), ff = j.create({
  name: "editable",
  addProseMirrorPlugins() {
    return [
      new H({
        key: new W("editable"),
        props: {
          editable: () => this.editor.options.editable
        }
      })
    ];
  }
}), hf = new W("focusEvents"), pf = j.create({
  name: "focusEvents",
  addProseMirrorPlugins() {
    const { editor: t } = this;
    return [
      new H({
        key: hf,
        props: {
          handleDOMEvents: {
            focus: (e, n) => {
              t.isFocused = !0;
              const r = t.state.tr.setMeta("focus", { event: n }).setMeta("addToHistory", !1);
              return e.dispatch(r), !1;
            },
            blur: (e, n) => {
              t.isFocused = !1;
              const r = t.state.tr.setMeta("blur", { event: n }).setMeta("addToHistory", !1);
              return e.dispatch(r), !1;
            }
          }
        }
      })
    ];
  }
}), mf = j.create({
  name: "keymap",
  addKeyboardShortcuts() {
    const t = () => this.editor.commands.first(({ commands: s }) => [
      () => s.undoInputRule(),
      // maybe convert first text block node to default node
      () => s.command(({ tr: u }) => {
        const { selection: l, doc: a } = u, { empty: c, $anchor: d } = l, { pos: f, parent: h } = d, p = d.parent.isTextblock && f > 0 ? u.doc.resolve(f - 1) : d, m = p.parent.type.spec.isolating, g = d.pos - d.parentOffset, b = m && p.parent.childCount === 1 ? g === d.pos : O.atStart(a).from === f;
        return !c || !h.type.isTextblock || h.textContent.length || !b || b && d.parent.type.name === "paragraph" ? !1 : s.clearNodes();
      }),
      () => s.deleteSelection(),
      () => s.joinBackward(),
      () => s.selectNodeBackward()
    ]), e = () => this.editor.commands.first(({ commands: s }) => [
      () => s.deleteSelection(),
      () => s.deleteCurrentNode(),
      () => s.joinForward(),
      () => s.selectNodeForward()
    ]), r = {
      Enter: () => this.editor.commands.first(({ commands: s }) => [
        () => s.newlineInCode(),
        () => s.createParagraphNear(),
        () => s.liftEmptyBlock(),
        () => s.splitBlock()
      ]),
      "Mod-Enter": () => this.editor.commands.exitCode(),
      Backspace: t,
      "Mod-Backspace": t,
      "Shift-Backspace": t,
      Delete: e,
      "Mod-Delete": e,
      "Mod-a": () => this.editor.commands.selectAll()
    }, i = {
      ...r
    }, o = {
      ...r,
      "Ctrl-h": t,
      "Alt-Backspace": t,
      "Ctrl-d": e,
      "Ctrl-Alt-Backspace": e,
      "Alt-Delete": e,
      "Alt-d": e,
      "Ctrl-a": () => this.editor.commands.selectTextblockStart(),
      "Ctrl-e": () => this.editor.commands.selectTextblockEnd()
    };
    return ii() || jd() ? o : i;
  },
  addProseMirrorPlugins() {
    return [
      // With this plugin we check if the whole document was selected and deleted.
      // In this case we will additionally call `clearNodes()` to convert e.g. a heading
      // to a paragraph if necessary.
      // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
      // with many other commands.
      new H({
        key: new W("clearDocument"),
        appendTransaction: (t, e, n) => {
          if (t.some((m) => m.getMeta("composition")))
            return;
          const r = t.some((m) => m.docChanged) && !e.doc.eq(n.doc), i = t.some((m) => m.getMeta("preventClearDocument"));
          if (!r || i)
            return;
          const { empty: o, from: s, to: u } = e.selection, l = O.atStart(e.doc).from, a = O.atEnd(e.doc).to;
          if (o || !(s === l && u === a) || !Xi(n.doc))
            return;
          const f = n.tr, h = Ki({
            state: n,
            transaction: f
          }), { commands: p } = new Ji({
            editor: this.editor,
            state: h
          });
          if (p.clearNodes(), !!f.steps.length)
            return f;
        }
      })
    ];
  }
}), gf = j.create({
  name: "paste",
  addProseMirrorPlugins() {
    return [
      new H({
        key: new W("tiptapPaste"),
        props: {
          handlePaste: (t, e, n) => {
            this.editor.emit("paste", {
              editor: this.editor,
              event: e,
              slice: n
            });
          }
        }
      })
    ];
  }
}), bf = j.create({
  name: "tabindex",
  addProseMirrorPlugins() {
    return [
      new H({
        key: new W("tabindex"),
        props: {
          attributes: () => this.editor.isEditable ? { tabindex: "0" } : {}
        }
      })
    ];
  }
}), yf = j.create({
  name: "textDirection",
  addOptions() {
    return {
      direction: void 0
    };
  },
  addGlobalAttributes() {
    if (!this.options.direction)
      return [];
    const { nodeExtensions: t } = gn(this.extensions);
    return [
      {
        types: t.filter((e) => e.name !== "text").map((e) => e.name),
        attributes: {
          dir: {
            default: this.options.direction,
            parseHTML: (e) => {
              const n = e.getAttribute("dir");
              return n && (n === "ltr" || n === "rtl" || n === "auto") ? n : this.options.direction;
            },
            renderHTML: (e) => e.dir ? {
              dir: e.dir
            } : {}
          }
        }
      }
    ];
  },
  addProseMirrorPlugins() {
    return [
      new H({
        key: new W("textDirection"),
        props: {
          attributes: () => {
            const t = this.options.direction;
            return t ? {
              dir: t
            } : {};
          }
        }
      })
    ];
  }
}), qg = class Rn {
  constructor(e, n, r = !1, i = null) {
    this.currentNode = null, this.actualDepth = null, this.isBlock = r, this.resolvedPos = e, this.editor = n, this.currentNode = i;
  }
  get name() {
    return this.node.type.name;
  }
  get node() {
    return this.currentNode || this.resolvedPos.node();
  }
  get element() {
    return this.editor.view.domAtPos(this.pos).node;
  }
  get depth() {
    var e;
    return (e = this.actualDepth) != null ? e : this.resolvedPos.depth;
  }
  get pos() {
    return this.resolvedPos.pos;
  }
  get content() {
    return this.node.content;
  }
  set content(e) {
    let n = this.from, r = this.to;
    if (this.isBlock) {
      if (this.content.size === 0) {
        console.error(`You can’t set content on a block node. Tried to set content on ${this.name} at ${this.pos}`);
        return;
      }
      n = this.from + 1, r = this.to - 1;
    }
    this.editor.commands.insertContentAt({ from: n, to: r }, e);
  }
  get attributes() {
    return this.node.attrs;
  }
  get textContent() {
    return this.node.textContent;
  }
  get size() {
    return this.node.nodeSize;
  }
  get from() {
    return this.isBlock ? this.pos : this.resolvedPos.start(this.resolvedPos.depth);
  }
  get range() {
    return {
      from: this.from,
      to: this.to
    };
  }
  get to() {
    return this.isBlock ? this.pos + this.size : this.resolvedPos.end(this.resolvedPos.depth) + (this.node.isText ? 0 : 1);
  }
  get parent() {
    if (this.depth === 0)
      return null;
    const e = this.resolvedPos.start(this.resolvedPos.depth - 1), n = this.resolvedPos.doc.resolve(e);
    return new Rn(n, this.editor);
  }
  get before() {
    let e = this.resolvedPos.doc.resolve(this.from - (this.isBlock ? 1 : 2));
    return e.depth !== this.depth && (e = this.resolvedPos.doc.resolve(this.from - 3)), new Rn(e, this.editor);
  }
  get after() {
    let e = this.resolvedPos.doc.resolve(this.to + (this.isBlock ? 2 : 1));
    return e.depth !== this.depth && (e = this.resolvedPos.doc.resolve(this.to + 3)), new Rn(e, this.editor);
  }
  get children() {
    const e = [];
    return this.node.content.forEach((n, r) => {
      const i = n.isBlock && !n.isTextblock, o = n.isAtom && !n.isText, s = n.isInline, u = this.pos + r + (o ? 0 : 1);
      if (u < 0 || u > this.resolvedPos.doc.nodeSize - 2)
        return;
      const l = this.resolvedPos.doc.resolve(u);
      if (!i && !s && l.depth <= this.depth)
        return;
      const a = new Rn(l, this.editor, i, i || s ? n : null);
      i && (a.actualDepth = this.depth + 1), e.push(a);
    }), e;
  }
  get firstChild() {
    return this.children[0] || null;
  }
  get lastChild() {
    const e = this.children;
    return e[e.length - 1] || null;
  }
  closest(e, n = {}) {
    let r = null, i = this.parent;
    for (; i && !r; ) {
      if (i.node.type.name === e)
        if (Object.keys(n).length > 0) {
          const o = i.node.attrs, s = Object.keys(n);
          for (let u = 0; u < s.length; u += 1) {
            const l = s[u];
            if (o[l] !== n[l])
              break;
          }
        } else
          r = i;
      i = i.parent;
    }
    return r;
  }
  querySelector(e, n = {}) {
    return this.querySelectorAll(e, n, !0)[0] || null;
  }
  querySelectorAll(e, n = {}, r = !1) {
    let i = [];
    if (!this.children || this.children.length === 0)
      return i;
    const o = Object.keys(n);
    return this.children.forEach((s) => {
      r && i.length > 0 || (s.node.type.name === e && o.every((l) => n[l] === s.node.attrs[l]) && i.push(s), !(r && i.length > 0) && (i = i.concat(s.querySelectorAll(e, n, r))));
    }), i;
  }
  setAttribute(e) {
    const { tr: n } = this.editor.state;
    n.setNodeMarkup(this.from, void 0, {
      ...this.node.attrs,
      ...e
    }), this.editor.view.dispatch(n);
  }
}, Wg = `.ProseMirror {
  position: relative;
}

.ProseMirror {
  word-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  -webkit-font-variant-ligatures: none;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0; /* the above doesn't seem to work in Edge */
}

.ProseMirror [contenteditable="false"] {
  white-space: normal;
}

.ProseMirror [contenteditable="false"] [contenteditable="true"] {
  white-space: pre-wrap;
}

.ProseMirror pre {
  white-space: pre-wrap;
}

img.ProseMirror-separator {
  display: inline !important;
  border: none !important;
  margin: 0 !important;
  width: 0 !important;
  height: 0 !important;
}

.ProseMirror-gapcursor {
  display: none;
  pointer-events: none;
  position: absolute;
  margin: 0;
}

.ProseMirror-gapcursor:after {
  content: "";
  display: block;
  position: absolute;
  top: -2px;
  width: 20px;
  border-top: 1px solid black;
  animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
}

@keyframes ProseMirror-cursor-blink {
  to {
    visibility: hidden;
  }
}

.ProseMirror-hideselection *::selection {
  background: transparent;
}

.ProseMirror-hideselection *::-moz-selection {
  background: transparent;
}

.ProseMirror-hideselection * {
  caret-color: transparent;
}

.ProseMirror-focused .ProseMirror-gapcursor {
  display: block;
}`;
function Ug(t, e, n) {
  const r = document.querySelector("style[data-tiptap-style]");
  if (r !== null)
    return r;
  const i = document.createElement("style");
  return e && i.setAttribute("nonce", e), i.setAttribute("data-tiptap-style", ""), i.innerHTML = t, document.getElementsByTagName("head")[0].appendChild(i), i;
}
var Kg = class extends Ig {
  constructor(t = {}) {
    super(), this.css = null, this.className = "tiptap", this.editorView = null, this.isFocused = !1, this.isInitialized = !1, this.extensionStorage = {}, this.instanceId = Math.random().toString(36).slice(2, 9), this.options = {
      element: typeof document < "u" ? document.createElement("div") : null,
      content: "",
      injectCSS: !0,
      injectNonce: void 0,
      extensions: [],
      autofocus: !1,
      editable: !0,
      textDirection: void 0,
      editorProps: {},
      parseOptions: {},
      coreExtensionOptions: {},
      enableInputRules: !0,
      enablePasteRules: !0,
      enableCoreExtensions: !0,
      enableContentCheck: !1,
      emitContentError: !1,
      onBeforeCreate: () => null,
      onCreate: () => null,
      onMount: () => null,
      onUnmount: () => null,
      onUpdate: () => null,
      onSelectionUpdate: () => null,
      onTransaction: () => null,
      onFocus: () => null,
      onBlur: () => null,
      onDestroy: () => null,
      onContentError: ({ error: r }) => {
        throw r;
      },
      onPaste: () => null,
      onDrop: () => null,
      onDelete: () => null,
      enableExtensionDispatchTransaction: !0
    }, this.isCapturingTransaction = !1, this.capturedTransaction = null, this.utils = {
      getUpdatedPosition: dg,
      createMappablePosition: fg
    }, this.setOptions(t), this.createExtensionManager(), this.createCommandManager(), this.createSchema(), this.on("beforeCreate", this.options.onBeforeCreate), this.emit("beforeCreate", { editor: this }), this.on("mount", this.options.onMount), this.on("unmount", this.options.onUnmount), this.on("contentError", this.options.onContentError), this.on("create", this.options.onCreate), this.on("update", this.options.onUpdate), this.on("selectionUpdate", this.options.onSelectionUpdate), this.on("transaction", this.options.onTransaction), this.on("focus", this.options.onFocus), this.on("blur", this.options.onBlur), this.on("destroy", this.options.onDestroy), this.on("drop", ({ event: r, slice: i, moved: o }) => this.options.onDrop(r, i, o)), this.on("paste", ({ event: r, slice: i }) => this.options.onPaste(r, i)), this.on("delete", this.options.onDelete);
    const e = this.createDoc(), n = Hd(e, this.options.autofocus);
    this.editorState = ln.create({
      doc: e,
      schema: this.schema,
      selection: n || void 0
    }), this.options.element && this.mount(this.options.element);
  }
  /**
   * Attach the editor to the DOM, creating a new editor view.
   */
  mount(t) {
    if (typeof document > "u")
      throw new Error(
        "[tiptap error]: The editor cannot be mounted because there is no 'document' defined in this environment."
      );
    this.createView(t), this.emit("mount", { editor: this }), this.css && !document.head.contains(this.css) && document.head.appendChild(this.css), window.setTimeout(() => {
      this.isDestroyed || (this.options.autofocus !== !1 && this.options.autofocus !== null && this.commands.focus(this.options.autofocus), this.emit("create", { editor: this }), this.isInitialized = !0);
    }, 0);
  }
  /**
   * Remove the editor from the DOM, but still allow remounting at a different point in time
   */
  unmount() {
    if (this.editorView) {
      const t = this.editorView.dom;
      t?.editor && delete t.editor, this.editorView.destroy();
    }
    if (this.editorView = null, this.isInitialized = !1, this.css && !document.querySelectorAll(`.${this.className}`).length)
      try {
        typeof this.css.remove == "function" ? this.css.remove() : this.css.parentNode && this.css.parentNode.removeChild(this.css);
      } catch (t) {
        console.warn("Failed to remove CSS element:", t);
      }
    this.css = null, this.emit("unmount", { editor: this });
  }
  /**
   * Returns the editor storage.
   */
  get storage() {
    return this.extensionStorage;
  }
  /**
   * An object of all registered commands.
   */
  get commands() {
    return this.commandManager.commands;
  }
  /**
   * Create a command chain to call multiple commands at once.
   */
  chain() {
    return this.commandManager.chain();
  }
  /**
   * Check if a command or a command chain can be executed. Without executing it.
   */
  can() {
    return this.commandManager.can();
  }
  /**
   * Inject CSS styles.
   */
  injectCSS() {
    this.options.injectCSS && typeof document < "u" && (this.css = Ug(Wg, this.options.injectNonce));
  }
  /**
   * Update editor options.
   *
   * @param options A list of options
   */
  setOptions(t = {}) {
    this.options = {
      ...this.options,
      ...t
    }, !(!this.editorView || !this.state || this.isDestroyed) && (this.options.editorProps && this.view.setProps(this.options.editorProps), this.view.updateState(this.state));
  }
  /**
   * Update editable state of the editor.
   */
  setEditable(t, e = !0) {
    this.setOptions({ editable: t }), e && this.emit("update", { editor: this, transaction: this.state.tr, appendedTransactions: [] });
  }
  /**
   * Returns whether the editor is editable.
   */
  get isEditable() {
    return this.options.editable && this.view && this.view.editable;
  }
  /**
   * Returns the editor view.
   */
  get view() {
    return this.editorView ? this.editorView : new Proxy(
      {
        state: this.editorState,
        updateState: (t) => {
          this.editorState = t;
        },
        dispatch: (t) => {
          this.dispatchTransaction(t);
        },
        // Stub some commonly accessed properties to prevent errors
        composing: !1,
        dragging: null,
        editable: !0,
        isDestroyed: !1
      },
      {
        get: (t, e) => {
          if (this.editorView)
            return this.editorView[e];
          if (e === "state")
            return this.editorState;
          if (e in t)
            return Reflect.get(t, e);
          throw new Error(
            `[tiptap error]: The editor view is not available. Cannot access view['${e}']. The editor may not be mounted yet.`
          );
        }
      }
    );
  }
  /**
   * Returns the editor state.
   */
  get state() {
    return this.editorView && (this.editorState = this.view.state), this.editorState;
  }
  /**
   * Register a ProseMirror plugin.
   *
   * @param plugin A ProseMirror plugin
   * @param handlePlugins Control how to merge the plugin into the existing plugins.
   * @returns The new editor state
   */
  registerPlugin(t, e) {
    const n = Kd(e) ? e(t, [...this.state.plugins]) : [...this.state.plugins, t], r = this.state.reconfigure({ plugins: n });
    return this.view.updateState(r), r;
  }
  /**
   * Unregister a ProseMirror plugin.
   *
   * @param nameOrPluginKeyToRemove The plugins name
   * @returns The new editor state or undefined if the editor is destroyed
   */
  unregisterPlugin(t) {
    if (this.isDestroyed)
      return;
    const e = this.state.plugins;
    let n = e;
    if ([].concat(t).forEach((i) => {
      const o = typeof i == "string" ? `${i}$` : i.key;
      n = n.filter((s) => !s.key.startsWith(o));
    }), e.length === n.length)
      return;
    const r = this.state.reconfigure({
      plugins: n
    });
    return this.view.updateState(r), r;
  }
  /**
   * Creates an extension manager.
   */
  createExtensionManager() {
    var t, e;
    const r = [...this.options.enableCoreExtensions ? [
      ff,
      lf.configure({
        blockSeparator: (e = (t = this.options.coreExtensionOptions) == null ? void 0 : t.clipboardTextSerializer) == null ? void 0 : e.blockSeparator
      }),
      af,
      pf,
      mf,
      bf,
      df,
      gf,
      cf,
      yf.configure({
        direction: this.options.textDirection
      })
    ].filter((i) => typeof this.options.enableCoreExtensions == "object" ? this.options.enableCoreExtensions[i.name] !== !1 : !0) : [], ...this.options.extensions].filter((i) => ["extension", "node", "mark"].includes(i?.type));
    this.extensionManager = new Qi(r, this);
  }
  /**
   * Creates an command manager.
   */
  createCommandManager() {
    this.commandManager = new Ji({
      editor: this
    });
  }
  /**
   * Creates a ProseMirror schema.
   */
  createSchema() {
    this.schema = this.extensionManager.schema;
  }
  /**
   * Creates the initial document.
   */
  createDoc() {
    let t;
    try {
      t = ps(this.options.content, this.schema, this.options.parseOptions, {
        errorOnInvalidContent: this.options.enableContentCheck
      });
    } catch (e) {
      if (!(e instanceof Error) || !["[tiptap error]: Invalid JSON content", "[tiptap error]: Invalid HTML content"].includes(e.message))
        throw e;
      this.emit("contentError", {
        editor: this,
        error: e,
        disableCollaboration: () => {
          "collaboration" in this.storage && typeof this.storage.collaboration == "object" && this.storage.collaboration && (this.storage.collaboration.isDisabled = !0), this.options.extensions = this.options.extensions.filter((n) => n.name !== "collaboration"), this.createExtensionManager();
        }
      }), t = ps(this.options.content, this.schema, this.options.parseOptions, {
        errorOnInvalidContent: !1
      });
    }
    return t;
  }
  /**
   * Creates a ProseMirror view.
   */
  createView(t) {
    const { editorProps: e, enableExtensionDispatchTransaction: n } = this.options, r = e.dispatchTransaction || this.dispatchTransaction.bind(this), i = n ? this.extensionManager.dispatchTransaction(r) : r, o = e.transformPastedHTML, s = this.extensionManager.transformPastedHTML(o);
    this.editorView = new Pd(t, {
      ...e,
      attributes: {
        // add `role="textbox"` to the editor element
        role: "textbox",
        ...e?.attributes
      },
      dispatchTransaction: i,
      transformPastedHTML: s,
      state: this.editorState,
      markViews: this.extensionManager.markViews,
      nodeViews: this.extensionManager.nodeViews
    });
    const u = this.state.reconfigure({
      plugins: this.extensionManager.plugins
    });
    this.view.updateState(u), this.prependClass(), this.injectCSS();
    const l = this.view.dom;
    l.editor = this;
  }
  /**
   * Creates all node and mark views.
   */
  createNodeViews() {
    this.view.isDestroyed || this.view.setProps({
      markViews: this.extensionManager.markViews,
      nodeViews: this.extensionManager.nodeViews
    });
  }
  /**
   * Prepend class name to element.
   */
  prependClass() {
    this.view.dom.className = `${this.className} ${this.view.dom.className}`;
  }
  captureTransaction(t) {
    this.isCapturingTransaction = !0, t(), this.isCapturingTransaction = !1;
    const e = this.capturedTransaction;
    return this.capturedTransaction = null, e;
  }
  /**
   * The callback over which to send transactions (state updates) produced by the view.
   *
   * @param transaction An editor state transaction
   */
  dispatchTransaction(t) {
    if (this.view.isDestroyed)
      return;
    if (this.isCapturingTransaction) {
      if (!this.capturedTransaction) {
        this.capturedTransaction = t;
        return;
      }
      t.steps.forEach((a) => {
        var c;
        return (c = this.capturedTransaction) == null ? void 0 : c.step(a);
      });
      return;
    }
    const { state: e, transactions: n } = this.state.applyTransaction(t), r = !this.state.selection.eq(e.selection), i = n.includes(t), o = this.state;
    if (this.emit("beforeTransaction", {
      editor: this,
      transaction: t,
      nextState: e
    }), !i)
      return;
    this.view.updateState(e), this.emit("transaction", {
      editor: this,
      transaction: t,
      appendedTransactions: n.slice(1)
    }), r && this.emit("selectionUpdate", {
      editor: this,
      transaction: t
    });
    const s = n.findLast((a) => a.getMeta("focus") || a.getMeta("blur")), u = s?.getMeta("focus"), l = s?.getMeta("blur");
    u && this.emit("focus", {
      editor: this,
      event: u.event,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      transaction: s
    }), l && this.emit("blur", {
      editor: this,
      event: l.event,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      transaction: s
    }), !(t.getMeta("preventUpdate") || !n.some((a) => a.docChanged) || o.doc.eq(e.doc)) && this.emit("update", {
      editor: this,
      transaction: t,
      appendedTransactions: n.slice(1)
    });
  }
  /**
   * Get attributes of the currently selected node or mark.
   */
  getAttributes(t) {
    return Yd(this.state, t);
  }
  isActive(t, e) {
    const n = typeof t == "string" ? t : null, r = typeof t == "string" ? e : t;
    return lg(this.state, n, r);
  }
  /**
   * Get the document as JSON.
   */
  getJSON() {
    return this.state.doc.toJSON();
  }
  /**
   * Get the document as HTML.
   */
  getHTML() {
    return fr(this.state.doc.content, this.schema);
  }
  /**
   * Get the document as text.
   */
  getText(t) {
    const { blockSeparator: e = `

`, textSerializers: n = {} } = t || {};
    return ng(this.state.doc, {
      blockSeparator: e,
      textSerializers: {
        ...Xd(this.schema),
        ...n
      }
    });
  }
  /**
   * Check if there is no content.
   */
  get isEmpty() {
    return Xi(this.state.doc);
  }
  /**
   * Destroy the editor.
   */
  destroy() {
    this.emit("destroy"), this.unmount(), this.removeAllListeners();
  }
  /**
   * Check if the editor is already destroyed.
   */
  get isDestroyed() {
    var t, e;
    return (e = (t = this.editorView) == null ? void 0 : t.isDestroyed) != null ? e : !0;
  }
  $node(t, e) {
    var n;
    return ((n = this.$doc) == null ? void 0 : n.querySelector(t, e)) || null;
  }
  $nodes(t, e) {
    var n;
    return ((n = this.$doc) == null ? void 0 : n.querySelectorAll(t, e)) || null;
  }
  $pos(t) {
    const e = this.state.doc.resolve(t);
    return new qg(e, this);
  }
  get $doc() {
    return this.$pos(0);
  }
};
function bn(t) {
  return new Yi({
    find: t.find,
    handler: ({ state: e, range: n, match: r }) => {
      const i = F(t.getAttributes, void 0, r);
      if (i === !1 || i === null)
        return null;
      const { tr: o } = e, s = r[r.length - 1], u = r[0];
      if (s) {
        const l = u.search(/\S/), a = n.from + u.indexOf(s), c = a + s.length;
        if (du(n.from, n.to, e.doc).filter((h) => h.mark.type.excluded.find((m) => m === t.type && m !== h.mark.type)).filter((h) => h.to > a).length)
          return null;
        c < n.to && o.delete(c, n.to), a > n.from && o.delete(n.from + l, a);
        const f = n.from + l + s.length;
        o.addMark(n.from + l, f, t.type.create(i || {})), o.removeStoredMark(t.type);
      }
    },
    undoable: t.undoable
  });
}
function Jg(t) {
  return new Yi({
    find: t.find,
    handler: ({ state: e, range: n, match: r }) => {
      const i = F(t.getAttributes, void 0, r) || {}, { tr: o } = e, s = n.from;
      let u = n.to;
      const l = t.type.create(i);
      if (r[1]) {
        const a = r[0].lastIndexOf(r[1]);
        let c = s + a;
        c > u ? c = u : u = c + r[1].length;
        const d = r[0][r[0].length - 1];
        o.insertText(d, s + r[0].length - 1), o.replaceWith(c, u, l);
      } else if (r[0]) {
        const a = t.type.isInline ? s : s - 1;
        o.insert(a, t.type.create(i)).delete(o.mapping.map(s), o.mapping.map(u));
      }
      o.scrollIntoView();
    },
    undoable: t.undoable
  });
}
function gs(t) {
  return new Yi({
    find: t.find,
    handler: ({ state: e, range: n, match: r }) => {
      const i = e.doc.resolve(n.from), o = F(t.getAttributes, void 0, r) || {};
      if (!i.node(-1).canReplaceWith(i.index(-1), i.indexAfter(-1), t.type))
        return null;
      e.tr.delete(n.from, n.to).setBlockType(n.from, n.from, t.type, o);
    },
    undoable: t.undoable
  });
}
function yn(t) {
  return new Yi({
    find: t.find,
    handler: ({ state: e, range: n, match: r, chain: i }) => {
      const o = F(t.getAttributes, void 0, r) || {}, s = e.tr.delete(n.from, n.to), l = s.doc.resolve(n.from).blockRange(), a = l && js(l, t.type, o);
      if (!a)
        return null;
      if (s.wrap(l, a), t.keepMarks && t.editor) {
        const { selection: d, storedMarks: f } = e, { splittableMarks: h } = t.editor.extensionManager, p = f || d.$to.parentOffset && d.$from.marks();
        if (p) {
          const m = p.filter((g) => h.includes(g.type.name));
          s.ensureMarks(m);
        }
      }
      if (t.keepAttributes) {
        const d = t.type.name === "bulletList" || t.type.name === "orderedList" ? "listItem" : "taskList";
        i().updateAttributes(d, o).run();
      }
      const c = s.doc.resolve(n.from - 1).nodeBefore;
      c && c.type === t.type && Dt(s.doc, n.from - 1) && (!t.joinPredicate || t.joinPredicate(r, c)) && s.join(n.from - 1);
    },
    undoable: t.undoable
  });
}
function Gg(t, e) {
  const { selection: n } = t, { $from: r } = n;
  if (n instanceof _) {
    const o = r.index();
    return r.parent.canReplaceWith(o, o + 1, e);
  }
  let i = r.depth;
  for (; i >= 0; ) {
    const o = r.index(i);
    if (r.node(i).contentMatchAt(o).matchType(e))
      return !0;
    i -= 1;
  }
  return !1;
}
var Zg = {};
uu(Zg, {
  createAtomBlockMarkdownSpec: () => Xg,
  createBlockMarkdownSpec: () => Yg,
  createInlineMarkdownSpec: () => tb,
  parseAttributes: () => hu,
  parseIndentedBlocks: () => bs,
  renderNestedMarkdownContent: () => mu,
  serializeAttributes: () => pu
});
function hu(t) {
  if (!t?.trim())
    return {};
  const e = {}, n = [], r = t.replace(/["']([^"']*)["']/g, (a) => (n.push(a), `__QUOTED_${n.length - 1}__`)), i = r.match(/(?:^|\s)\.([a-zA-Z][\w-]*)/g);
  if (i) {
    const a = i.map((c) => c.trim().slice(1));
    e.class = a.join(" ");
  }
  const o = r.match(/(?:^|\s)#([a-zA-Z][\w-]*)/);
  o && (e.id = o[1]);
  const s = /([a-zA-Z][\w-]*)\s*=\s*(__QUOTED_\d+__)/g;
  Array.from(r.matchAll(s)).forEach(([, a, c]) => {
    var d;
    const f = parseInt(((d = c.match(/__QUOTED_(\d+)__/)) == null ? void 0 : d[1]) || "0", 10), h = n[f];
    h && (e[a] = h.slice(1, -1));
  });
  const l = r.replace(/(?:^|\s)\.([a-zA-Z][\w-]*)/g, "").replace(/(?:^|\s)#([a-zA-Z][\w-]*)/g, "").replace(/([a-zA-Z][\w-]*)\s*=\s*__QUOTED_\d+__/g, "").trim();
  return l && l.split(/\s+/).filter(Boolean).forEach((c) => {
    c.match(/^[a-zA-Z][\w-]*$/) && (e[c] = !0);
  }), e;
}
function pu(t) {
  if (!t || Object.keys(t).length === 0)
    return "";
  const e = [];
  return t.class && String(t.class).split(/\s+/).filter(Boolean).forEach((r) => e.push(`.${r}`)), t.id && e.push(`#${t.id}`), Object.entries(t).forEach(([n, r]) => {
    n === "class" || n === "id" || (r === !0 ? e.push(n) : r !== !1 && r != null && e.push(`${n}="${String(r)}"`));
  }), e.join(" ");
}
function Xg(t) {
  const {
    nodeName: e,
    name: n,
    parseAttributes: r = hu,
    serializeAttributes: i = pu,
    defaultAttributes: o = {},
    requiredAttributes: s = [],
    allowedAttributes: u
  } = t, l = n || e, a = (c) => {
    if (!u)
      return c;
    const d = {};
    return u.forEach((f) => {
      f in c && (d[f] = c[f]);
    }), d;
  };
  return {
    parseMarkdown: (c, d) => {
      const f = { ...o, ...c.attributes };
      return d.createNode(e, f, []);
    },
    markdownTokenizer: {
      name: e,
      level: "block",
      start(c) {
        var d;
        const f = new RegExp(`^:::${l}(?:\\s|$)`, "m"), h = (d = c.match(f)) == null ? void 0 : d.index;
        return h !== void 0 ? h : -1;
      },
      tokenize(c, d, f) {
        const h = new RegExp(`^:::${l}(?:\\s+\\{([^}]*)\\})?\\s*:::(?:\\n|$)`), p = c.match(h);
        if (!p)
          return;
        const m = p[1] || "", g = r(m);
        if (!s.find((y) => !(y in g)))
          return {
            type: e,
            raw: p[0],
            attributes: g
          };
      }
    },
    renderMarkdown: (c) => {
      const d = a(c.attrs || {}), f = i(d), h = f ? ` {${f}}` : "";
      return `:::${l}${h} :::`;
    }
  };
}
function Yg(t) {
  const {
    nodeName: e,
    name: n,
    getContent: r,
    parseAttributes: i = hu,
    serializeAttributes: o = pu,
    defaultAttributes: s = {},
    content: u = "block",
    allowedAttributes: l
  } = t, a = n || e, c = (d) => {
    if (!l)
      return d;
    const f = {};
    return l.forEach((h) => {
      h in d && (f[h] = d[h]);
    }), f;
  };
  return {
    parseMarkdown: (d, f) => {
      let h;
      if (r) {
        const m = r(d);
        h = typeof m == "string" ? [{ type: "text", text: m }] : m;
      } else u === "block" ? h = f.parseChildren(d.tokens || []) : h = f.parseInline(d.tokens || []);
      const p = { ...s, ...d.attributes };
      return f.createNode(e, p, h);
    },
    markdownTokenizer: {
      name: e,
      level: "block",
      start(d) {
        var f;
        const h = new RegExp(`^:::${a}`, "m"), p = (f = d.match(h)) == null ? void 0 : f.index;
        return p !== void 0 ? p : -1;
      },
      tokenize(d, f, h) {
        var p;
        const m = new RegExp(`^:::${a}(?:\\s+\\{([^}]*)\\})?\\s*\\n`), g = d.match(m);
        if (!g)
          return;
        const [b, y = ""] = g, k = i(y);
        let C = 1;
        const x = b.length;
        let E = "";
        const S = /^:::([\w-]*)(\s.*)?/gm, M = d.slice(x);
        for (S.lastIndex = 0; ; ) {
          const N = S.exec(M);
          if (N === null)
            break;
          const Y = N.index, Pe = N[1];
          if (!((p = N[2]) != null && p.endsWith(":::"))) {
            if (Pe)
              C += 1;
            else if (C -= 1, C === 0) {
              const Be = M.slice(0, Y);
              E = Be.trim();
              const ut = d.slice(0, x + Y + N[0].length);
              let pe = [];
              if (E)
                if (u === "block")
                  for (pe = h.blockTokens(Be), pe.forEach((G) => {
                    G.text && (!G.tokens || G.tokens.length === 0) && (G.tokens = h.inlineTokens(G.text));
                  }); pe.length > 0; ) {
                    const G = pe[pe.length - 1];
                    if (G.type === "paragraph" && (!G.text || G.text.trim() === ""))
                      pe.pop();
                    else
                      break;
                  }
                else
                  pe = h.inlineTokens(E);
              return {
                type: e,
                raw: ut,
                attributes: k,
                content: E,
                tokens: pe
              };
            }
          }
        }
      }
    },
    renderMarkdown: (d, f) => {
      const h = c(d.attrs || {}), p = o(h), m = p ? ` {${p}}` : "", g = f.renderChildren(d.content || [], `

`);
      return `:::${a}${m}

${g}

:::`;
    }
  };
}
function Qg(t) {
  if (!t.trim())
    return {};
  const e = {}, n = /(\w+)=(?:"([^"]*)"|'([^']*)')/g;
  let r = n.exec(t);
  for (; r !== null; ) {
    const [, i, o, s] = r;
    e[i] = o || s, r = n.exec(t);
  }
  return e;
}
function eb(t) {
  return Object.entries(t).filter(([, e]) => e != null).map(([e, n]) => `${e}="${n}"`).join(" ");
}
function tb(t) {
  const {
    nodeName: e,
    name: n,
    getContent: r,
    parseAttributes: i = Qg,
    serializeAttributes: o = eb,
    defaultAttributes: s = {},
    selfClosing: u = !1,
    allowedAttributes: l
  } = t, a = n || e, c = (f) => {
    if (!l)
      return f;
    const h = {};
    return l.forEach((p) => {
      const m = typeof p == "string" ? p : p.name, g = typeof p == "string" ? void 0 : p.skipIfDefault;
      if (m in f) {
        const b = f[m];
        if (g !== void 0 && b === g)
          return;
        h[m] = b;
      }
    }), h;
  }, d = a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    parseMarkdown: (f, h) => {
      const p = { ...s, ...f.attributes };
      if (u)
        return h.createNode(e, p);
      const m = r ? r(f) : f.content || "";
      return m ? h.createNode(e, p, [h.createTextNode(m)]) : h.createNode(e, p, []);
    },
    markdownTokenizer: {
      name: e,
      level: "inline",
      start(f) {
        const h = u ? new RegExp(`\\[${d}\\s*[^\\]]*\\]`) : new RegExp(`\\[${d}\\s*[^\\]]*\\][\\s\\S]*?\\[\\/${d}\\]`), p = f.match(h), m = p?.index;
        return m !== void 0 ? m : -1;
      },
      tokenize(f, h, p) {
        const m = u ? new RegExp(`^\\[${d}\\s*([^\\]]*)\\]`) : new RegExp(`^\\[${d}\\s*([^\\]]*)\\]([\\s\\S]*?)\\[\\/${d}\\]`), g = f.match(m);
        if (!g)
          return;
        let b = "", y = "";
        if (u) {
          const [, C] = g;
          y = C;
        } else {
          const [, C, x] = g;
          y = C, b = x || "";
        }
        const k = i(y.trim());
        return {
          type: e,
          raw: g[0],
          content: b.trim(),
          attributes: k
        };
      }
    },
    renderMarkdown: (f) => {
      let h = "";
      r ? h = r(f) : f.content && f.content.length > 0 && (h = f.content.filter((b) => b.type === "text").map((b) => b.text).join(""));
      const p = c(f.attrs || {}), m = o(p), g = m ? ` ${m}` : "";
      return u ? `[${a}${g}]` : `[${a}${g}]${h}[/${a}]`;
    }
  };
}
function bs(t, e, n) {
  var r, i, o, s;
  const u = t.split(`
`), l = [];
  let a = "", c = 0;
  const d = e.baseIndentSize || 2;
  for (; c < u.length; ) {
    const f = u[c], h = f.match(e.itemPattern);
    if (!h) {
      if (l.length > 0)
        break;
      if (f.trim() === "") {
        c += 1, a = `${a}${f}
`;
        continue;
      } else
        return;
    }
    const p = e.extractItemData(h), { indentLevel: m, mainContent: g } = p;
    a = `${a}${f}
`;
    const b = [g];
    for (c += 1; c < u.length; ) {
      const x = u[c];
      if (x.trim() === "") {
        const S = u.slice(c + 1).findIndex((Y) => Y.trim() !== "");
        if (S === -1)
          break;
        if ((((i = (r = u[c + 1 + S].match(/^(\s*)/)) == null ? void 0 : r[1]) == null ? void 0 : i.length) || 0) > m) {
          b.push(x), a = `${a}${x}
`, c += 1;
          continue;
        } else
          break;
      }
      if ((((s = (o = x.match(/^(\s*)/)) == null ? void 0 : o[1]) == null ? void 0 : s.length) || 0) > m)
        b.push(x), a = `${a}${x}
`, c += 1;
      else
        break;
    }
    let y;
    const k = b.slice(1);
    if (k.length > 0) {
      const x = k.map((E) => E.slice(m + d)).join(`
`);
      x.trim() && (e.customNestedParser ? y = e.customNestedParser(x) : y = n.blockTokens(x));
    }
    const C = e.createToken(p, y);
    l.push(C);
  }
  if (l.length !== 0)
    return {
      items: l,
      raw: a
    };
}
function mu(t, e, n, r) {
  if (!t || !Array.isArray(t.content))
    return "";
  const i = typeof n == "function" ? n(r) : n, [o, ...s] = t.content, u = e.renderChildren([o]), l = [`${i}${u}`];
  return s && s.length > 0 && s.forEach((a) => {
    const c = e.renderChildren([a]);
    if (c) {
      const d = c.split(`
`).map((f) => f ? e.indent(f) : "").join(`
`);
      l.push(d);
    }
  }), l.join(`
`);
}
function nb(t, e, n = {}) {
  const { state: r } = e, { doc: i, tr: o } = r, s = t;
  i.descendants((u, l) => {
    const a = o.mapping.map(l), c = o.mapping.map(l) + u.nodeSize;
    let d = null;
    if (u.marks.forEach((h) => {
      if (h !== s)
        return !1;
      d = h;
    }), !d)
      return;
    let f = !1;
    if (Object.keys(n).forEach((h) => {
      n[h] !== d.attrs[h] && (f = !0);
    }), f) {
      const h = t.type.create({
        ...t.attrs,
        ...n
      });
      o.removeMark(a, c, t.type), o.addMark(a, c, h);
    }
  }), o.docChanged && e.view.dispatch(o);
}
var L = class kf extends fu {
  constructor() {
    super(...arguments), this.type = "node";
  }
  /**
   * Create a new Node instance
   * @param config - Node configuration object or a function that returns a configuration object
   */
  static create(e = {}) {
    const n = typeof e == "function" ? e() : e;
    return new kf(n);
  }
  configure(e) {
    return super.configure(e);
  }
  extend(e) {
    const n = typeof e == "function" ? e() : e;
    return super.extend(n);
  }
};
function Gt(t) {
  return new zg({
    find: t.find,
    handler: ({ state: e, range: n, match: r, pasteEvent: i }) => {
      const o = F(t.getAttributes, void 0, r, i);
      if (o === !1 || o === null)
        return null;
      const { tr: s } = e, u = r[r.length - 1], l = r[0];
      let a = n.to;
      if (u) {
        const c = l.search(/\S/), d = n.from + l.indexOf(u), f = d + u.length;
        if (du(n.from, n.to, e.doc).filter((p) => p.mark.type.excluded.find((g) => g === t.type && g !== p.mark.type)).filter((p) => p.to > d).length)
          return null;
        f < n.to && s.delete(f, n.to), d > n.from && s.delete(n.from + c, d), a = n.from + c + u.length, s.addMark(n.from + c, a, t.type.create(o || {})), s.removeStoredMark(t.type);
      }
    }
  });
}
const { getOwnPropertyNames: rb, getOwnPropertySymbols: ib } = Object, { hasOwnProperty: ob } = Object.prototype;
function Mo(t, e) {
  return function(r, i, o) {
    return t(r, i, o) && e(r, i, o);
  };
}
function Ar(t) {
  return function(n, r, i) {
    if (!n || !r || typeof n != "object" || typeof r != "object")
      return t(n, r, i);
    const { cache: o } = i, s = o.get(n), u = o.get(r);
    if (s && u)
      return s === r && u === n;
    o.set(n, r), o.set(r, n);
    const l = t(n, r, i);
    return o.delete(n), o.delete(r), l;
  };
}
function sb(t) {
  return t?.[Symbol.toStringTag];
}
function Zl(t) {
  return rb(t).concat(ib(t));
}
const ub = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  Object.hasOwn || ((t, e) => ob.call(t, e))
);
function Qt(t, e) {
  return t === e || !t && !e && t !== t && e !== e;
}
const lb = "__v", ab = "__o", cb = "_owner", { getOwnPropertyDescriptor: Xl, keys: Yl } = Object;
function db(t, e) {
  return t.byteLength === e.byteLength && oi(new Uint8Array(t), new Uint8Array(e));
}
function fb(t, e, n) {
  let r = t.length;
  if (e.length !== r)
    return !1;
  for (; r-- > 0; )
    if (!n.equals(t[r], e[r], r, r, t, e, n))
      return !1;
  return !0;
}
function hb(t, e) {
  return t.byteLength === e.byteLength && oi(new Uint8Array(t.buffer, t.byteOffset, t.byteLength), new Uint8Array(e.buffer, e.byteOffset, e.byteLength));
}
function pb(t, e) {
  return Qt(t.getTime(), e.getTime());
}
function mb(t, e) {
  return t.name === e.name && t.message === e.message && t.cause === e.cause && t.stack === e.stack;
}
function gb(t, e) {
  return t === e;
}
function Ql(t, e, n) {
  const r = t.size;
  if (r !== e.size)
    return !1;
  if (!r)
    return !0;
  const i = new Array(r), o = t.entries();
  let s, u, l = 0;
  for (; (s = o.next()) && !s.done; ) {
    const a = e.entries();
    let c = !1, d = 0;
    for (; (u = a.next()) && !u.done; ) {
      if (i[d]) {
        d++;
        continue;
      }
      const f = s.value, h = u.value;
      if (n.equals(f[0], h[0], l, d, t, e, n) && n.equals(f[1], h[1], f[0], h[0], t, e, n)) {
        c = i[d] = !0;
        break;
      }
      d++;
    }
    if (!c)
      return !1;
    l++;
  }
  return !0;
}
const bb = Qt;
function yb(t, e, n) {
  const r = Yl(t);
  let i = r.length;
  if (Yl(e).length !== i)
    return !1;
  for (; i-- > 0; )
    if (!xf(t, e, n, r[i]))
      return !1;
  return !0;
}
function Mn(t, e, n) {
  const r = Zl(t);
  let i = r.length;
  if (Zl(e).length !== i)
    return !1;
  let o, s, u;
  for (; i-- > 0; )
    if (o = r[i], !xf(t, e, n, o) || (s = Xl(t, o), u = Xl(e, o), (s || u) && (!s || !u || s.configurable !== u.configurable || s.enumerable !== u.enumerable || s.writable !== u.writable)))
      return !1;
  return !0;
}
function kb(t, e) {
  return Qt(t.valueOf(), e.valueOf());
}
function xb(t, e) {
  return t.source === e.source && t.flags === e.flags;
}
function ea(t, e, n) {
  const r = t.size;
  if (r !== e.size)
    return !1;
  if (!r)
    return !0;
  const i = new Array(r), o = t.values();
  let s, u;
  for (; (s = o.next()) && !s.done; ) {
    const l = e.values();
    let a = !1, c = 0;
    for (; (u = l.next()) && !u.done; ) {
      if (!i[c] && n.equals(s.value, u.value, s.value, u.value, t, e, n)) {
        a = i[c] = !0;
        break;
      }
      c++;
    }
    if (!a)
      return !1;
  }
  return !0;
}
function oi(t, e) {
  let n = t.byteLength;
  if (e.byteLength !== n || t.byteOffset !== e.byteOffset)
    return !1;
  for (; n-- > 0; )
    if (t[n] !== e[n])
      return !1;
  return !0;
}
function Cb(t, e) {
  return t.hostname === e.hostname && t.pathname === e.pathname && t.protocol === e.protocol && t.port === e.port && t.hash === e.hash && t.username === e.username && t.password === e.password;
}
function xf(t, e, n, r) {
  return (r === cb || r === ab || r === lb) && (t.$$typeof || e.$$typeof) ? !0 : ub(e, r) && n.equals(t[r], e[r], r, r, t, e, n);
}
const wb = "[object ArrayBuffer]", Eb = "[object Arguments]", Sb = "[object Boolean]", Ab = "[object DataView]", vb = "[object Date]", Mb = "[object Error]", Tb = "[object Map]", _b = "[object Number]", Db = "[object Object]", Ob = "[object RegExp]", Nb = "[object Set]", Rb = "[object String]", Ib = {
  "[object Int8Array]": !0,
  "[object Uint8Array]": !0,
  "[object Uint8ClampedArray]": !0,
  "[object Int16Array]": !0,
  "[object Uint16Array]": !0,
  "[object Int32Array]": !0,
  "[object Uint32Array]": !0,
  "[object Float16Array]": !0,
  "[object Float32Array]": !0,
  "[object Float64Array]": !0,
  "[object BigInt64Array]": !0,
  "[object BigUint64Array]": !0
}, Lb = "[object URL]", Fb = Object.prototype.toString;
function Pb({ areArrayBuffersEqual: t, areArraysEqual: e, areDataViewsEqual: n, areDatesEqual: r, areErrorsEqual: i, areFunctionsEqual: o, areMapsEqual: s, areNumbersEqual: u, areObjectsEqual: l, arePrimitiveWrappersEqual: a, areRegExpsEqual: c, areSetsEqual: d, areTypedArraysEqual: f, areUrlsEqual: h, unknownTagComparators: p }) {
  return function(g, b, y) {
    if (g === b)
      return !0;
    if (g == null || b == null)
      return !1;
    const k = typeof g;
    if (k !== typeof b)
      return !1;
    if (k !== "object")
      return k === "number" ? u(g, b, y) : k === "function" ? o(g, b, y) : !1;
    const C = g.constructor;
    if (C !== b.constructor)
      return !1;
    if (C === Object)
      return l(g, b, y);
    if (Array.isArray(g))
      return e(g, b, y);
    if (C === Date)
      return r(g, b, y);
    if (C === RegExp)
      return c(g, b, y);
    if (C === Map)
      return s(g, b, y);
    if (C === Set)
      return d(g, b, y);
    const x = Fb.call(g);
    if (x === vb)
      return r(g, b, y);
    if (x === Ob)
      return c(g, b, y);
    if (x === Tb)
      return s(g, b, y);
    if (x === Nb)
      return d(g, b, y);
    if (x === Db)
      return typeof g.then != "function" && typeof b.then != "function" && l(g, b, y);
    if (x === Lb)
      return h(g, b, y);
    if (x === Mb)
      return i(g, b, y);
    if (x === Eb)
      return l(g, b, y);
    if (Ib[x])
      return f(g, b, y);
    if (x === wb)
      return t(g, b, y);
    if (x === Ab)
      return n(g, b, y);
    if (x === Sb || x === _b || x === Rb)
      return a(g, b, y);
    if (p) {
      let E = p[x];
      if (!E) {
        const S = sb(g);
        S && (E = p[S]);
      }
      if (E)
        return E(g, b, y);
    }
    return !1;
  };
}
function Bb({ circular: t, createCustomConfig: e, strict: n }) {
  let r = {
    areArrayBuffersEqual: db,
    areArraysEqual: n ? Mn : fb,
    areDataViewsEqual: hb,
    areDatesEqual: pb,
    areErrorsEqual: mb,
    areFunctionsEqual: gb,
    areMapsEqual: n ? Mo(Ql, Mn) : Ql,
    areNumbersEqual: bb,
    areObjectsEqual: n ? Mn : yb,
    arePrimitiveWrappersEqual: kb,
    areRegExpsEqual: xb,
    areSetsEqual: n ? Mo(ea, Mn) : ea,
    areTypedArraysEqual: n ? Mo(oi, Mn) : oi,
    areUrlsEqual: Cb,
    unknownTagComparators: void 0
  };
  if (e && (r = Object.assign({}, r, e(r))), t) {
    const i = Ar(r.areArraysEqual), o = Ar(r.areMapsEqual), s = Ar(r.areObjectsEqual), u = Ar(r.areSetsEqual);
    r = Object.assign({}, r, {
      areArraysEqual: i,
      areMapsEqual: o,
      areObjectsEqual: s,
      areSetsEqual: u
    });
  }
  return r;
}
function zb(t) {
  return function(e, n, r, i, o, s, u) {
    return t(e, n, u);
  };
}
function $b({ circular: t, comparator: e, createState: n, equals: r, strict: i }) {
  if (n)
    return function(u, l) {
      const { cache: a = t ? /* @__PURE__ */ new WeakMap() : void 0, meta: c } = n();
      return e(u, l, {
        cache: a,
        equals: r,
        meta: c,
        strict: i
      });
    };
  if (t)
    return function(u, l) {
      return e(u, l, {
        cache: /* @__PURE__ */ new WeakMap(),
        equals: r,
        meta: void 0,
        strict: i
      });
    };
  const o = {
    cache: void 0,
    equals: r,
    meta: void 0,
    strict: i
  };
  return function(u, l) {
    return e(u, l, o);
  };
}
const Hb = Nt();
Nt({ strict: !0 });
Nt({ circular: !0 });
Nt({
  circular: !0,
  strict: !0
});
Nt({
  createInternalComparator: () => Qt
});
Nt({
  strict: !0,
  createInternalComparator: () => Qt
});
Nt({
  circular: !0,
  createInternalComparator: () => Qt
});
Nt({
  circular: !0,
  createInternalComparator: () => Qt,
  strict: !0
});
function Nt(t = {}) {
  const { circular: e = !1, createInternalComparator: n, createState: r, strict: i = !1 } = t, o = Bb(t), s = Pb(o), u = n ? n(s) : zb(s);
  return $b({ circular: e, comparator: s, createState: r, equals: u, strict: i });
}
var vr = { exports: {} }, To = {};
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ta;
function Vb() {
  if (ta) return To;
  ta = 1;
  var t = Se, e = zs();
  function n(a, c) {
    return a === c && (a !== 0 || 1 / a === 1 / c) || a !== a && c !== c;
  }
  var r = typeof Object.is == "function" ? Object.is : n, i = e.useSyncExternalStore, o = t.useRef, s = t.useEffect, u = t.useMemo, l = t.useDebugValue;
  return To.useSyncExternalStoreWithSelector = function(a, c, d, f, h) {
    var p = o(null);
    if (p.current === null) {
      var m = { hasValue: !1, value: null };
      p.current = m;
    } else m = p.current;
    p = u(
      function() {
        function b(E) {
          if (!y) {
            if (y = !0, k = E, E = f(E), h !== void 0 && m.hasValue) {
              var S = m.value;
              if (h(S, E))
                return C = S;
            }
            return C = E;
          }
          if (S = C, r(k, E)) return S;
          var M = f(E);
          return h !== void 0 && h(S, M) ? (k = E, S) : (k = E, C = M);
        }
        var y = !1, k, C, x = d === void 0 ? null : d;
        return [
          function() {
            return b(c());
          },
          x === null ? void 0 : function() {
            return b(x());
          }
        ];
      },
      [c, d, f, h]
    );
    var g = i(a, p[0], p[1]);
    return s(
      function() {
        m.hasValue = !0, m.value = g;
      },
      [g]
    ), l(g), g;
  }, To;
}
var _o = {}, na;
function jb() {
  if (na) return _o;
  na = 1;
  var t = {};
  /**
   * @license React
   * use-sync-external-store-shim/with-selector.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  return t.NODE_ENV !== "production" && (function() {
    function e(c, d) {
      return c === d && (c !== 0 || 1 / c === 1 / d) || c !== c && d !== d;
    }
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var n = Se, r = zs(), i = typeof Object.is == "function" ? Object.is : e, o = r.useSyncExternalStore, s = n.useRef, u = n.useEffect, l = n.useMemo, a = n.useDebugValue;
    _o.useSyncExternalStoreWithSelector = function(c, d, f, h, p) {
      var m = s(null);
      if (m.current === null) {
        var g = { hasValue: !1, value: null };
        m.current = g;
      } else g = m.current;
      m = l(
        function() {
          function y(S) {
            if (!k) {
              if (k = !0, C = S, S = h(S), p !== void 0 && g.hasValue) {
                var M = g.value;
                if (p(M, S))
                  return x = M;
              }
              return x = S;
            }
            if (M = x, i(C, S))
              return M;
            var N = h(S);
            return p !== void 0 && p(M, N) ? (C = S, M) : (C = S, x = N);
          }
          var k = !1, C, x, E = f === void 0 ? null : f;
          return [
            function() {
              return y(d());
            },
            E === null ? void 0 : function() {
              return y(E());
            }
          ];
        },
        [d, f, h, p]
      );
      var b = o(c, m[0], m[1]);
      return u(
        function() {
          g.hasValue = !0, g.value = b;
        },
        [b]
      ), a(b), b;
    }, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  })(), _o;
}
var ra;
function qb() {
  if (ra) return vr.exports;
  ra = 1;
  var t = {};
  return t.NODE_ENV === "production" ? vr.exports = Vb() : vr.exports = jb(), vr.exports;
}
var Wb = qb(), Ub = {}, Kb = (...t) => (e) => {
  t.forEach((n) => {
    typeof n == "function" ? n(e) : n && (n.current = e);
  });
}, Jb = ({ contentComponent: t }) => {
  const e = dc.useSyncExternalStore(
    t.subscribe,
    t.getSnapshot,
    t.getServerSnapshot
  );
  return /* @__PURE__ */ I(Wr, { children: Object.values(e) });
};
function Gb() {
  const t = /* @__PURE__ */ new Set();
  let e = {};
  return {
    /**
     * Subscribe to the editor instance's changes.
     */
    subscribe(n) {
      return t.add(n), () => {
        t.delete(n);
      };
    },
    getSnapshot() {
      return e;
    },
    getServerSnapshot() {
      return e;
    },
    /**
     * Adds a new NodeView Renderer to the editor.
     */
    setRenderer(n, r) {
      e = {
        ...e,
        [n]: Kh.createPortal(r.reactElement, r.element, n)
      }, t.forEach((i) => i());
    },
    /**
     * Removes a NodeView Renderer from the editor.
     */
    removeRenderer(n) {
      const r = { ...e };
      delete r[n], e = r, t.forEach((i) => i());
    }
  };
}
var Zb = class extends Se.Component {
  constructor(t) {
    var e;
    super(t), this.editorContentRef = Se.createRef(), this.initialized = !1, this.state = {
      hasContentComponentInitialized: !!((e = t.editor) != null && e.contentComponent)
    };
  }
  componentDidMount() {
    this.init();
  }
  componentDidUpdate() {
    this.init();
  }
  init() {
    var t;
    const e = this.props.editor;
    if (e && !e.isDestroyed && ((t = e.view.dom) != null && t.parentNode)) {
      if (e.contentComponent)
        return;
      const n = this.editorContentRef.current;
      n.append(...e.view.dom.parentNode.childNodes), e.setOptions({
        element: n
      }), e.contentComponent = Gb(), this.state.hasContentComponentInitialized || (this.unsubscribeToContentComponent = e.contentComponent.subscribe(() => {
        this.setState((r) => r.hasContentComponentInitialized ? r : {
          hasContentComponentInitialized: !0
        }), this.unsubscribeToContentComponent && this.unsubscribeToContentComponent();
      })), e.createNodeViews(), this.initialized = !0;
    }
  }
  componentWillUnmount() {
    var t;
    const e = this.props.editor;
    if (e) {
      this.initialized = !1, e.isDestroyed || e.view.setProps({
        nodeViews: {}
      }), this.unsubscribeToContentComponent && this.unsubscribeToContentComponent(), e.contentComponent = null;
      try {
        if (!((t = e.view.dom) != null && t.parentNode))
          return;
        const n = document.createElement("div");
        n.append(...e.view.dom.parentNode.childNodes), e.setOptions({
          element: n
        });
      } catch {
      }
    }
  }
  render() {
    const { editor: t, innerRef: e, ...n } = this.props;
    return /* @__PURE__ */ It(Wr, { children: [
      /* @__PURE__ */ I("div", { ref: Kb(e, this.editorContentRef), ...n }),
      t?.contentComponent && /* @__PURE__ */ I(Jb, { contentComponent: t.contentComponent })
    ] });
  }
}, Xb = Wh(
  (t, e) => {
    const n = Se.useMemo(() => Math.floor(Math.random() * 4294967295).toString(), [t.editor]);
    return Se.createElement(Zb, {
      key: n,
      innerRef: e,
      ...t
    });
  }
), Cf = Se.memo(Xb), Yb = typeof window < "u" ? Uh : Ln, Qb = class {
  constructor(t) {
    this.transactionNumber = 0, this.lastTransactionNumber = 0, this.subscribers = /* @__PURE__ */ new Set(), this.editor = t, this.lastSnapshot = { editor: t, transactionNumber: 0 }, this.getSnapshot = this.getSnapshot.bind(this), this.getServerSnapshot = this.getServerSnapshot.bind(this), this.watch = this.watch.bind(this), this.subscribe = this.subscribe.bind(this);
  }
  /**
   * Get the current editor instance.
   */
  getSnapshot() {
    return this.transactionNumber === this.lastTransactionNumber ? this.lastSnapshot : (this.lastTransactionNumber = this.transactionNumber, this.lastSnapshot = { editor: this.editor, transactionNumber: this.transactionNumber }, this.lastSnapshot);
  }
  /**
   * Always disable the editor on the server-side.
   */
  getServerSnapshot() {
    return { editor: null, transactionNumber: 0 };
  }
  /**
   * Subscribe to the editor instance's changes.
   */
  subscribe(t) {
    return this.subscribers.add(t), () => {
      this.subscribers.delete(t);
    };
  }
  /**
   * Watch the editor instance for changes.
   */
  watch(t) {
    if (this.editor = t, this.editor) {
      const e = () => {
        this.transactionNumber += 1, this.subscribers.forEach((r) => r());
      }, n = this.editor;
      return n.on("transaction", e), () => {
        n.off("transaction", e);
      };
    }
  }
};
function e2(t) {
  var e;
  const [n] = lc(() => new Qb(t.editor)), r = Wb.useSyncExternalStoreWithSelector(
    n.subscribe,
    n.getSnapshot,
    n.getServerSnapshot,
    t.selector,
    (e = t.equalityFn) != null ? e : Hb
  );
  return Yb(() => n.watch(t.editor), [t.editor, n]), ac(r), r;
}
var ia = Ub.NODE_ENV !== "production", ys = typeof window > "u", t2 = ys || !!(typeof window < "u" && window.next), n2 = class wf {
  constructor(e) {
    this.editor = null, this.subscriptions = /* @__PURE__ */ new Set(), this.isComponentMounted = !1, this.previousDeps = null, this.instanceId = "", this.options = e, this.subscriptions = /* @__PURE__ */ new Set(), this.setEditor(this.getInitialEditor()), this.scheduleDestroy(), this.getEditor = this.getEditor.bind(this), this.getServerSnapshot = this.getServerSnapshot.bind(this), this.subscribe = this.subscribe.bind(this), this.refreshEditorInstance = this.refreshEditorInstance.bind(this), this.scheduleDestroy = this.scheduleDestroy.bind(this), this.onRender = this.onRender.bind(this), this.createEditor = this.createEditor.bind(this);
  }
  setEditor(e) {
    this.editor = e, this.instanceId = Math.random().toString(36).slice(2, 9), this.subscriptions.forEach((n) => n());
  }
  getInitialEditor() {
    if (this.options.current.immediatelyRender === void 0) {
      if (ys || t2) {
        if (ia)
          throw new Error(
            "Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches."
          );
        return null;
      }
      return this.createEditor();
    }
    if (this.options.current.immediatelyRender && ys && ia)
      throw new Error(
        "Tiptap Error: SSR has been detected, and `immediatelyRender` has been set to `true` this is an unsupported configuration that may result in errors, explicitly set `immediatelyRender` to `false` to avoid hydration mismatches."
      );
    return this.options.current.immediatelyRender ? this.createEditor() : null;
  }
  /**
   * Create a new editor instance. And attach event listeners.
   */
  createEditor() {
    const e = {
      ...this.options.current,
      // Always call the most recent version of the callback function by default
      onBeforeCreate: (...r) => {
        var i, o;
        return (o = (i = this.options.current).onBeforeCreate) == null ? void 0 : o.call(i, ...r);
      },
      onBlur: (...r) => {
        var i, o;
        return (o = (i = this.options.current).onBlur) == null ? void 0 : o.call(i, ...r);
      },
      onCreate: (...r) => {
        var i, o;
        return (o = (i = this.options.current).onCreate) == null ? void 0 : o.call(i, ...r);
      },
      onDestroy: (...r) => {
        var i, o;
        return (o = (i = this.options.current).onDestroy) == null ? void 0 : o.call(i, ...r);
      },
      onFocus: (...r) => {
        var i, o;
        return (o = (i = this.options.current).onFocus) == null ? void 0 : o.call(i, ...r);
      },
      onSelectionUpdate: (...r) => {
        var i, o;
        return (o = (i = this.options.current).onSelectionUpdate) == null ? void 0 : o.call(i, ...r);
      },
      onTransaction: (...r) => {
        var i, o;
        return (o = (i = this.options.current).onTransaction) == null ? void 0 : o.call(i, ...r);
      },
      onUpdate: (...r) => {
        var i, o;
        return (o = (i = this.options.current).onUpdate) == null ? void 0 : o.call(i, ...r);
      },
      onContentError: (...r) => {
        var i, o;
        return (o = (i = this.options.current).onContentError) == null ? void 0 : o.call(i, ...r);
      },
      onDrop: (...r) => {
        var i, o;
        return (o = (i = this.options.current).onDrop) == null ? void 0 : o.call(i, ...r);
      },
      onPaste: (...r) => {
        var i, o;
        return (o = (i = this.options.current).onPaste) == null ? void 0 : o.call(i, ...r);
      },
      onDelete: (...r) => {
        var i, o;
        return (o = (i = this.options.current).onDelete) == null ? void 0 : o.call(i, ...r);
      }
    };
    return new Kg(e);
  }
  /**
   * Get the current editor instance.
   */
  getEditor() {
    return this.editor;
  }
  /**
   * Always disable the editor on the server-side.
   */
  getServerSnapshot() {
    return null;
  }
  /**
   * Subscribe to the editor instance's changes.
   */
  subscribe(e) {
    return this.subscriptions.add(e), () => {
      this.subscriptions.delete(e);
    };
  }
  static compareOptions(e, n) {
    return Object.keys(e).every((r) => [
      "onCreate",
      "onBeforeCreate",
      "onDestroy",
      "onUpdate",
      "onTransaction",
      "onFocus",
      "onBlur",
      "onSelectionUpdate",
      "onContentError",
      "onDrop",
      "onPaste"
    ].includes(r) ? !0 : r === "extensions" && e.extensions && n.extensions ? e.extensions.length !== n.extensions.length ? !1 : e.extensions.every((i, o) => {
      var s;
      return i === ((s = n.extensions) == null ? void 0 : s[o]);
    }) : e[r] === n[r]);
  }
  /**
   * On each render, we will create, update, or destroy the editor instance.
   * @param deps The dependencies to watch for changes
   * @returns A cleanup function
   */
  onRender(e) {
    return () => (this.isComponentMounted = !0, clearTimeout(this.scheduledDestructionTimeout), this.editor && !this.editor.isDestroyed && e.length === 0 ? wf.compareOptions(this.options.current, this.editor.options) || this.editor.setOptions({
      ...this.options.current,
      editable: this.editor.isEditable
    }) : this.refreshEditorInstance(e), () => {
      this.isComponentMounted = !1, this.scheduleDestroy();
    });
  }
  /**
   * Recreate the editor instance if the dependencies have changed.
   */
  refreshEditorInstance(e) {
    if (this.editor && !this.editor.isDestroyed) {
      if (this.previousDeps === null) {
        this.previousDeps = e;
        return;
      }
      if (this.previousDeps.length === e.length && this.previousDeps.every((r, i) => r === e[i]))
        return;
    }
    this.editor && !this.editor.isDestroyed && this.editor.destroy(), this.setEditor(this.createEditor()), this.previousDeps = e;
  }
  /**
   * Schedule the destruction of the editor instance.
   * This will only destroy the editor if it was not mounted on the next tick.
   * This is to avoid destroying the editor instance when it's actually still mounted.
   */
  scheduleDestroy() {
    const e = this.instanceId, n = this.editor;
    this.scheduledDestructionTimeout = setTimeout(() => {
      if (this.isComponentMounted && this.instanceId === e) {
        n && n.setOptions(this.options.current);
        return;
      }
      n && !n.isDestroyed && (n.destroy(), this.instanceId === e && this.setEditor(null));
    }, 1);
  }
};
function r2(t = {}, e = []) {
  const n = Pr(t);
  n.current = t;
  const [r] = lc(() => new n2(n)), i = dc.useSyncExternalStore(
    r.subscribe,
    r.getEditor,
    r.getServerSnapshot
  );
  return ac(i), Ln(r.onRender(e)), e2({
    editor: i,
    selector: ({ transactionNumber: o }) => t.shouldRerenderOnTransaction === !1 || t.shouldRerenderOnTransaction === void 0 ? null : t.immediatelyRender && o === 0 ? 0 : o + 1
  }), i;
}
var Ef = Bs({
  editor: null
});
Ef.Consumer;
var i2 = Bs({
  onDragStart: () => {
  },
  nodeViewContentChildren: void 0,
  nodeViewContentRef: () => {
  }
}), o2 = () => cc(i2);
Se.forwardRef((t, e) => {
  const { onDragStart: n } = o2(), r = t.as || "div";
  return (
    // @ts-ignore
    /* @__PURE__ */ I(
      r,
      {
        ...t,
        ref: e,
        "data-node-view-wrapper": "",
        onDragStart: n,
        style: {
          whiteSpace: "normal",
          ...t.style
        }
      }
    )
  );
});
Se.createContext({
  markViewContentRef: () => {
  }
});
var gu = Bs({
  get editor() {
    throw new Error("useTiptap must be used within a <Tiptap> provider");
  }
});
gu.displayName = "TiptapContext";
var s2 = () => cc(gu);
function Sf({ editor: t, instance: e, children: n }) {
  const r = t ?? e;
  if (!r)
    throw new Error("Tiptap: An editor instance is required. Pass a non-null `editor` prop.");
  const i = Bu(() => ({ editor: r }), [r]), o = Bu(() => ({ editor: r }), [r]);
  return /* @__PURE__ */ I(Ef.Provider, { value: o, children: /* @__PURE__ */ I(gu.Provider, { value: i, children: n }) });
}
Sf.displayName = "Tiptap";
function Af({ ...t }) {
  const { editor: e } = s2();
  return /* @__PURE__ */ I(Cf, { editor: e, ...t });
}
Af.displayName = "Tiptap.Content";
Object.assign(Sf, {
  /**
   * The Tiptap Content component that renders the EditorContent with the editor instance from the context.
   * @see TiptapContent
   */
  Content: Af
});
var si = (t, e) => {
  if (t === "slot")
    return 0;
  if (t instanceof Function)
    return t(e);
  const { children: n, ...r } = e ?? {};
  if (t === "svg")
    throw new Error("SVG elements are not supported in the JSX syntax, use the array syntax instead");
  return [t, r, n];
}, u2 = /^\s*>\s$/, l2 = L.create({
  name: "blockquote",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  content: "block+",
  group: "block",
  defining: !0,
  parseHTML() {
    return [{ tag: "blockquote" }];
  },
  renderHTML({ HTMLAttributes: t }) {
    return /* @__PURE__ */ si("blockquote", { ...q(this.options.HTMLAttributes, t), children: /* @__PURE__ */ si("slot", {}) });
  },
  parseMarkdown: (t, e) => e.createNode("blockquote", void 0, e.parseChildren(t.tokens || [])),
  renderMarkdown: (t, e) => {
    if (!t.content)
      return "";
    const n = ">", r = [];
    return t.content.forEach((i) => {
      const u = e.renderChildren([i]).split(`
`).map((l) => l.trim() === "" ? n : `${n} ${l}`);
      r.push(u.join(`
`));
    }), r.join(`
${n}
`);
  },
  addCommands() {
    return {
      setBlockquote: () => ({ commands: t }) => t.wrapIn(this.name),
      toggleBlockquote: () => ({ commands: t }) => t.toggleWrap(this.name),
      unsetBlockquote: () => ({ commands: t }) => t.lift(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-b": () => this.editor.commands.toggleBlockquote()
    };
  },
  addInputRules() {
    return [
      yn({
        find: u2,
        type: this.type
      })
    ];
  }
}), a2 = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))$/, c2 = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))/g, d2 = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))$/, f2 = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))/g, h2 = ve.create({
  name: "bold",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  parseHTML() {
    return [
      {
        tag: "strong"
      },
      {
        tag: "b",
        getAttrs: (t) => t.style.fontWeight !== "normal" && null
      },
      {
        style: "font-weight=400",
        clearMark: (t) => t.type.name === this.name
      },
      {
        style: "font-weight",
        getAttrs: (t) => /^(bold(er)?|[5-9]\d{2,})$/.test(t) && null
      }
    ];
  },
  renderHTML({ HTMLAttributes: t }) {
    return /* @__PURE__ */ si("strong", { ...q(this.options.HTMLAttributes, t), children: /* @__PURE__ */ si("slot", {}) });
  },
  markdownTokenName: "strong",
  parseMarkdown: (t, e) => e.applyMark("bold", e.parseInline(t.tokens || [])),
  renderMarkdown: (t, e) => `**${e.renderChildren(t)}**`,
  addCommands() {
    return {
      setBold: () => ({ commands: t }) => t.setMark(this.name),
      toggleBold: () => ({ commands: t }) => t.toggleMark(this.name),
      unsetBold: () => ({ commands: t }) => t.unsetMark(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-b": () => this.editor.commands.toggleBold(),
      "Mod-B": () => this.editor.commands.toggleBold()
    };
  },
  addInputRules() {
    return [
      bn({
        find: a2,
        type: this.type
      }),
      bn({
        find: d2,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      Gt({
        find: c2,
        type: this.type
      }),
      Gt({
        find: f2,
        type: this.type
      })
    ];
  }
}), p2 = /(^|[^`])`([^`]+)`(?!`)$/, m2 = /(^|[^`])`([^`]+)`(?!`)/g, g2 = ve.create({
  name: "code",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  excludes: "_",
  code: !0,
  exitable: !0,
  parseHTML() {
    return [{ tag: "code" }];
  },
  renderHTML({ HTMLAttributes: t }) {
    return ["code", q(this.options.HTMLAttributes, t), 0];
  },
  markdownTokenName: "codespan",
  parseMarkdown: (t, e) => e.applyMark("code", [{ type: "text", text: t.text || "" }]),
  renderMarkdown: (t, e) => t.content ? `\`${e.renderChildren(t.content)}\`` : "",
  addCommands() {
    return {
      setCode: () => ({ commands: t }) => t.setMark(this.name),
      toggleCode: () => ({ commands: t }) => t.toggleMark(this.name),
      unsetCode: () => ({ commands: t }) => t.unsetMark(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-e": () => this.editor.commands.toggleCode()
    };
  },
  addInputRules() {
    return [
      bn({
        find: p2,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      Gt({
        find: m2,
        type: this.type
      })
    ];
  }
}), Do = 4, b2 = /^```([a-z]+)?[\s\n]$/, y2 = /^~~~([a-z]+)?[\s\n]$/, k2 = L.create({
  name: "codeBlock",
  addOptions() {
    return {
      languageClassPrefix: "language-",
      exitOnTripleEnter: !0,
      exitOnArrowDown: !0,
      defaultLanguage: null,
      enableTabIndentation: !1,
      tabSize: Do,
      HTMLAttributes: {}
    };
  },
  content: "text*",
  marks: "",
  group: "block",
  code: !0,
  defining: !0,
  addAttributes() {
    return {
      language: {
        default: this.options.defaultLanguage,
        parseHTML: (t) => {
          var e;
          const { languageClassPrefix: n } = this.options;
          if (!n)
            return null;
          const o = [...((e = t.firstElementChild) == null ? void 0 : e.classList) || []].filter((s) => s.startsWith(n)).map((s) => s.replace(n, ""))[0];
          return o || null;
        },
        rendered: !1
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: "full"
      }
    ];
  },
  renderHTML({ node: t, HTMLAttributes: e }) {
    return [
      "pre",
      q(this.options.HTMLAttributes, e),
      [
        "code",
        {
          class: t.attrs.language ? this.options.languageClassPrefix + t.attrs.language : null
        },
        0
      ]
    ];
  },
  markdownTokenName: "code",
  parseMarkdown: (t, e) => {
    var n;
    return ((n = t.raw) == null ? void 0 : n.startsWith("```")) === !1 && t.codeBlockStyle !== "indented" ? [] : e.createNode(
      "codeBlock",
      { language: t.lang || null },
      t.text ? [e.createTextNode(t.text)] : []
    );
  },
  renderMarkdown: (t, e) => {
    var n;
    let r = "";
    const i = ((n = t.attrs) == null ? void 0 : n.language) || "";
    return t.content ? r = [`\`\`\`${i}`, e.renderChildren(t.content), "```"].join(`
`) : r = `\`\`\`${i}

\`\`\``, r;
  },
  addCommands() {
    return {
      setCodeBlock: (t) => ({ commands: e }) => e.setNode(this.name, t),
      toggleCodeBlock: (t) => ({ commands: e }) => e.toggleNode(this.name, "paragraph", t)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-c": () => this.editor.commands.toggleCodeBlock(),
      // remove code block when at start of document or code block is empty
      Backspace: () => {
        const { empty: t, $anchor: e } = this.editor.state.selection, n = e.pos === 1;
        return !t || e.parent.type.name !== this.name ? !1 : n || !e.parent.textContent.length ? this.editor.commands.clearNodes() : !1;
      },
      // handle tab indentation
      Tab: ({ editor: t }) => {
        var e;
        if (!this.options.enableTabIndentation)
          return !1;
        const n = (e = this.options.tabSize) != null ? e : Do, { state: r } = t, { selection: i } = r, { $from: o, empty: s } = i;
        if (o.parent.type !== this.type)
          return !1;
        const u = " ".repeat(n);
        return s ? t.commands.insertContent(u) : t.commands.command(({ tr: l }) => {
          const { from: a, to: c } = i, h = r.doc.textBetween(a, c, `
`, `
`).split(`
`).map((p) => u + p).join(`
`);
          return l.replaceWith(a, c, r.schema.text(h)), !0;
        });
      },
      // handle shift+tab reverse indentation
      "Shift-Tab": ({ editor: t }) => {
        var e;
        if (!this.options.enableTabIndentation)
          return !1;
        const n = (e = this.options.tabSize) != null ? e : Do, { state: r } = t, { selection: i } = r, { $from: o, empty: s } = i;
        return o.parent.type !== this.type ? !1 : s ? t.commands.command(({ tr: u }) => {
          var l;
          const { pos: a } = o, c = o.start(), d = o.end(), h = r.doc.textBetween(c, d, `
`, `
`).split(`
`);
          let p = 0, m = 0;
          const g = a - c;
          for (let E = 0; E < h.length; E += 1) {
            if (m + h[E].length >= g) {
              p = E;
              break;
            }
            m += h[E].length + 1;
          }
          const y = ((l = h[p].match(/^ */)) == null ? void 0 : l[0]) || "", k = Math.min(y.length, n);
          if (k === 0)
            return !0;
          let C = c;
          for (let E = 0; E < p; E += 1)
            C += h[E].length + 1;
          return u.delete(C, C + k), a - C <= k && u.setSelection(D.create(u.doc, C)), !0;
        }) : t.commands.command(({ tr: u }) => {
          const { from: l, to: a } = i, f = r.doc.textBetween(l, a, `
`, `
`).split(`
`).map((h) => {
            var p;
            const m = ((p = h.match(/^ */)) == null ? void 0 : p[0]) || "", g = Math.min(m.length, n);
            return h.slice(g);
          }).join(`
`);
          return u.replaceWith(l, a, r.schema.text(f)), !0;
        });
      },
      // exit node on triple enter
      Enter: ({ editor: t }) => {
        if (!this.options.exitOnTripleEnter)
          return !1;
        const { state: e } = t, { selection: n } = e, { $from: r, empty: i } = n;
        if (!i || r.parent.type !== this.type)
          return !1;
        const o = r.parentOffset === r.parent.nodeSize - 2, s = r.parent.textContent.endsWith(`

`);
        return !o || !s ? !1 : t.chain().command(({ tr: u }) => (u.delete(r.pos - 2, r.pos), !0)).exitCode().run();
      },
      // exit node on arrow down
      ArrowDown: ({ editor: t }) => {
        if (!this.options.exitOnArrowDown)
          return !1;
        const { state: e } = t, { selection: n, doc: r } = e, { $from: i, empty: o } = n;
        if (!o || i.parent.type !== this.type || !(i.parentOffset === i.parent.nodeSize - 2))
          return !1;
        const u = i.after();
        return u === void 0 ? !1 : r.nodeAt(u) ? t.commands.command(({ tr: a }) => (a.setSelection(O.near(r.resolve(u))), !0)) : t.commands.exitCode();
      }
    };
  },
  addInputRules() {
    return [
      gs({
        find: b2,
        type: this.type,
        getAttributes: (t) => ({
          language: t[1]
        })
      }),
      gs({
        find: y2,
        type: this.type,
        getAttributes: (t) => ({
          language: t[1]
        })
      })
    ];
  },
  addProseMirrorPlugins() {
    return [
      // this plugin creates a code block for pasted content from VS Code
      // we can also detect the copied code language
      new H({
        key: new W("codeBlockVSCodeHandler"),
        props: {
          handlePaste: (t, e) => {
            if (!e.clipboardData || this.editor.isActive(this.type.name))
              return !1;
            const n = e.clipboardData.getData("text/plain"), r = e.clipboardData.getData("vscode-editor-data"), i = r ? JSON.parse(r) : void 0, o = i?.mode;
            if (!n || !o)
              return !1;
            const { tr: s, schema: u } = t.state, l = u.text(n.replace(/\r\n?/g, `
`));
            return s.replaceSelectionWith(this.type.create({ language: o }, l)), s.selection.$from.parent.type !== this.type && s.setSelection(D.near(s.doc.resolve(Math.max(0, s.selection.from - 2)))), s.setMeta("paste", !0), t.dispatch(s), !0;
          }
        }
      })
    ];
  }
}), x2 = L.create({
  name: "doc",
  topNode: !0,
  content: "block+",
  renderMarkdown: (t, e) => t.content ? e.renderChildren(t.content, `

`) : ""
}), C2 = L.create({
  name: "hardBreak",
  markdownTokenName: "br",
  addOptions() {
    return {
      keepMarks: !0,
      HTMLAttributes: {}
    };
  },
  inline: !0,
  group: "inline",
  selectable: !1,
  linebreakReplacement: !0,
  parseHTML() {
    return [{ tag: "br" }];
  },
  renderHTML({ HTMLAttributes: t }) {
    return ["br", q(this.options.HTMLAttributes, t)];
  },
  renderText() {
    return `
`;
  },
  renderMarkdown: () => `  
`,
  parseMarkdown: () => ({
    type: "hardBreak"
  }),
  addCommands() {
    return {
      setHardBreak: () => ({ commands: t, chain: e, state: n, editor: r }) => t.first([
        () => t.exitCode(),
        () => t.command(() => {
          const { selection: i, storedMarks: o } = n;
          if (i.$from.parent.type.spec.isolating)
            return !1;
          const { keepMarks: s } = this.options, { splittableMarks: u } = r.extensionManager, l = o || i.$to.parentOffset && i.$from.marks();
          return e().insertContent({ type: this.name }).command(({ tr: a, dispatch: c }) => {
            if (c && l && s) {
              const d = l.filter((f) => u.includes(f.type.name));
              a.ensureMarks(d);
            }
            return !0;
          }).run();
        })
      ])
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => this.editor.commands.setHardBreak(),
      "Shift-Enter": () => this.editor.commands.setHardBreak()
    };
  }
}), w2 = L.create({
  name: "heading",
  addOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {}
    };
  },
  content: "inline*",
  group: "block",
  defining: !0,
  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: !1
      }
    };
  },
  parseHTML() {
    return this.options.levels.map((t) => ({
      tag: `h${t}`,
      attrs: { level: t }
    }));
  },
  renderHTML({ node: t, HTMLAttributes: e }) {
    return [`h${this.options.levels.includes(t.attrs.level) ? t.attrs.level : this.options.levels[0]}`, q(this.options.HTMLAttributes, e), 0];
  },
  parseMarkdown: (t, e) => e.createNode("heading", { level: t.depth || 1 }, e.parseInline(t.tokens || [])),
  renderMarkdown: (t, e) => {
    var n;
    const r = (n = t.attrs) != null && n.level ? parseInt(t.attrs.level, 10) : 1, i = "#".repeat(r);
    return t.content ? `${i} ${e.renderChildren(t.content)}` : "";
  },
  addCommands() {
    return {
      setHeading: (t) => ({ commands: e }) => this.options.levels.includes(t.level) ? e.setNode(this.name, t) : !1,
      toggleHeading: (t) => ({ commands: e }) => this.options.levels.includes(t.level) ? e.toggleNode(this.name, "paragraph", t) : !1
    };
  },
  addKeyboardShortcuts() {
    return this.options.levels.reduce(
      (t, e) => ({
        ...t,
        [`Mod-Alt-${e}`]: () => this.editor.commands.toggleHeading({ level: e })
      }),
      {}
    );
  },
  addInputRules() {
    return this.options.levels.map((t) => gs({
      find: new RegExp(`^(#{${Math.min(...this.options.levels)},${t}})\\s$`),
      type: this.type,
      getAttributes: {
        level: t
      }
    }));
  }
}), E2 = L.create({
  name: "horizontalRule",
  addOptions() {
    return {
      HTMLAttributes: {},
      nextNodeType: "paragraph"
    };
  },
  group: "block",
  parseHTML() {
    return [{ tag: "hr" }];
  },
  renderHTML({ HTMLAttributes: t }) {
    return ["hr", q(this.options.HTMLAttributes, t)];
  },
  markdownTokenName: "hr",
  parseMarkdown: (t, e) => e.createNode("horizontalRule"),
  renderMarkdown: () => "---",
  addCommands() {
    return {
      setHorizontalRule: () => ({ chain: t, state: e }) => {
        if (!Gg(e, e.schema.nodes[this.name]))
          return !1;
        const { selection: n } = e, { $to: r } = n, i = t();
        return ef(n) ? i.insertContentAt(r.pos, {
          type: this.name
        }) : i.insertContent({ type: this.name }), i.command(({ state: o, tr: s, dispatch: u }) => {
          if (u) {
            const { $to: l } = s.selection, a = l.end();
            if (l.nodeAfter)
              l.nodeAfter.isTextblock ? s.setSelection(D.create(s.doc, l.pos + 1)) : l.nodeAfter.isBlock ? s.setSelection(_.create(s.doc, l.pos)) : s.setSelection(D.create(s.doc, l.pos));
            else {
              const c = o.schema.nodes[this.options.nextNodeType] || l.parent.type.contentMatch.defaultType, d = c?.create();
              d && (s.insert(a, d), s.setSelection(D.create(s.doc, a + 1)));
            }
            s.scrollIntoView();
          }
          return !0;
        }).run();
      }
    };
  },
  addInputRules() {
    return [
      Jg({
        find: /^(?:---|—-|___\s|\*\*\*\s)$/,
        type: this.type
      })
    ];
  }
}), S2 = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))$/, A2 = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))/g, v2 = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))$/, M2 = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))/g, T2 = ve.create({
  name: "italic",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  parseHTML() {
    return [
      {
        tag: "em"
      },
      {
        tag: "i",
        getAttrs: (t) => t.style.fontStyle !== "normal" && null
      },
      {
        style: "font-style=normal",
        clearMark: (t) => t.type.name === this.name
      },
      {
        style: "font-style=italic"
      }
    ];
  },
  renderHTML({ HTMLAttributes: t }) {
    return ["em", q(this.options.HTMLAttributes, t), 0];
  },
  addCommands() {
    return {
      setItalic: () => ({ commands: t }) => t.setMark(this.name),
      toggleItalic: () => ({ commands: t }) => t.toggleMark(this.name),
      unsetItalic: () => ({ commands: t }) => t.unsetMark(this.name)
    };
  },
  markdownTokenName: "em",
  parseMarkdown: (t, e) => e.applyMark("italic", e.parseInline(t.tokens || [])),
  renderMarkdown: (t, e) => `*${e.renderChildren(t)}*`,
  addKeyboardShortcuts() {
    return {
      "Mod-i": () => this.editor.commands.toggleItalic(),
      "Mod-I": () => this.editor.commands.toggleItalic()
    };
  },
  addInputRules() {
    return [
      bn({
        find: S2,
        type: this.type
      }),
      bn({
        find: v2,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      Gt({
        find: A2,
        type: this.type
      }),
      Gt({
        find: M2,
        type: this.type
      })
    ];
  }
});
const _2 = "aaa1rp3bb0ott3vie4c1le2ogado5udhabi7c0ademy5centure6ountant0s9o1tor4d0s1ult4e0g1ro2tna4f0l1rica5g0akhan5ency5i0g1rbus3force5tel5kdn3l0ibaba4pay4lfinanz6state5y2sace3tom5m0azon4ericanexpress7family11x2fam3ica3sterdam8nalytics7droid5quan4z2o0l2partments8p0le4q0uarelle8r0ab1mco4chi3my2pa2t0e3s0da2ia2sociates9t0hleta5torney7u0ction5di0ble3o3spost5thor3o0s4w0s2x0a2z0ure5ba0by2idu3namex4d1k2r0celona5laycard4s5efoot5gains6seball5ketball8uhaus5yern5b0c1t1va3cg1n2d1e0ats2uty4er2rlin4st0buy5t2f1g1h0arti5i0ble3d1ke2ng0o3o1z2j1lack0friday9ockbuster8g1omberg7ue3m0s1w2n0pparibas9o0ats3ehringer8fa2m1nd2o0k0ing5sch2tik2on4t1utique6x2r0adesco6idgestone9oadway5ker3ther5ussels7s1t1uild0ers6siness6y1zz3v1w1y1z0h3ca0b1fe2l0l1vinklein9m0era3p2non3petown5ital0one8r0avan4ds2e0er0s4s2sa1e1h1ino4t0ering5holic7ba1n1re3c1d1enter4o1rn3f0a1d2g1h0anel2nel4rity4se2t2eap3intai5ristmas6ome4urch5i0priani6rcle4sco3tadel4i0c2y3k1l0aims4eaning6ick2nic1que6othing5ud3ub0med6m1n1o0ach3des3ffee4llege4ogne5m0mbank4unity6pany2re3uter5sec4ndos3struction8ulting7tact3ractors9oking4l1p2rsica5untry4pon0s4rses6pa2r0edit0card4union9icket5own3s1uise0s6u0isinella9v1w1x1y0mru3ou3z2dad1nce3ta1e1ing3sun4y2clk3ds2e0al0er2s3gree4livery5l1oitte5ta3mocrat6ntal2ist5si0gn4v2hl2iamonds6et2gital5rect0ory7scount3ver5h2y2j1k1m1np2o0cs1tor4g1mains5t1wnload7rive4tv2ubai3nlop4pont4rban5vag2r2z2earth3t2c0o2deka3u0cation8e1g1mail3erck5nergy4gineer0ing9terprises10pson4quipment8r0icsson6ni3s0q1tate5t1u0rovision8s2vents5xchange6pert3osed4ress5traspace10fage2il1rwinds6th3mily4n0s2rm0ers5shion4t3edex3edback6rrari3ero6i0delity5o2lm2nal1nce1ial7re0stone6mdale6sh0ing5t0ness6j1k1lickr3ghts4r2orist4wers5y2m1o0o0d1tball6rd1ex2sale4um3undation8x2r0ee1senius7l1ogans4ntier7tr2ujitsu5n0d2rniture7tbol5yi3ga0l0lery3o1up4me0s3p1rden4y2b0iz3d0n2e0a1nt0ing5orge5f1g0ee3h1i0ft0s3ves2ing5l0ass3e1obal2o4m0ail3bh2o1x2n1odaddy5ld0point6f2o0dyear5g0le4p1t1v2p1q1r0ainger5phics5tis4een3ipe3ocery4up4s1t1u0cci3ge2ide2tars5ru3w1y2hair2mburg5ngout5us3bo2dfc0bank7ealth0care8lp1sinki6re1mes5iphop4samitsu7tachi5v2k0t2m1n1ockey4ldings5iday5medepot5goods5s0ense7nda3rse3spital5t0ing5t0els3mail5use3w2r1sbc3t1u0ghes5yatt3undai7ibm2cbc2e1u2d1e0ee3fm2kano4l1m0amat4db2mo0bilien9n0c1dustries8finiti5o2g1k1stitute6urance4e4t0ernational10uit4vestments10o1piranga7q1r0ish4s0maili5t0anbul7t0au2v3jaguar4va3cb2e0ep2tzt3welry6io2ll2m0p2nj2o0bs1urg4t1y2p0morgan6rs3uegos4niper7kaufen5ddi3e0rryhotels6properties14fh2g1h1i0a1ds2m1ndle4tchen5wi3m1n1oeln3matsu5sher5p0mg2n2r0d1ed3uokgroup8w1y0oto4z2la0caixa5mborghini8er3nd0rover6xess5salle5t0ino3robe5w0yer5b1c1ds2ease3clerc5frak4gal2o2xus4gbt3i0dl2fe0insurance9style7ghting6ke2lly3mited4o2ncoln4k2ve1ing5k1lc1p2oan0s3cker3us3l1ndon4tte1o3ve3pl0financial11r1s1t0d0a3u0ndbeck6xe1ury5v1y2ma0drid4if1son4keup4n0agement7go3p1rket0ing3s4riott5shalls7ttel5ba2c0kinsey7d1e0d0ia3et2lbourne7me1orial6n0u2rckmsd7g1h1iami3crosoft7l1ni1t2t0subishi9k1l0b1s2m0a2n1o0bi0le4da2e1i1m1nash3ey2ster5rmon3tgage6scow4to0rcycles9v0ie4p1q1r1s0d2t0n1r2u0seum3ic4v1w1x1y1z2na0b1goya4me2vy3ba2c1e0c1t0bank4flix4work5ustar5w0s2xt0direct7us4f0l2g0o2hk2i0co2ke1on3nja3ssan1y5l1o0kia3rton4w0ruz3tv4p1r0a1w2tt2u1yc2z2obi1server7ffice5kinawa6layan0group9lo3m0ega4ne1g1l0ine5oo2pen3racle3nge4g0anic5igins6saka4tsuka4t2vh3pa0ge2nasonic7ris2s1tners4s1y3y2ccw3e0t2f0izer5g1h0armacy6d1ilips5one2to0graphy6s4ysio5ics1tet2ures6d1n0g1k2oneer5zza4k1l0ace2y0station9umbing5s3m1n0c2ohl2ker3litie5rn2st3r0axi3ess3ime3o0d0uctions8f1gressive8mo2perties3y5tection8u0dential9s1t1ub2w0c2y2qa1pon3uebec3st5racing4dio4e0ad1lestate6tor2y4cipes5d0stone5umbrella9hab3ise0n3t2liance6n0t0als5pair3ort3ublican8st0aurant8view0s5xroth6ich0ardli6oh3l1o1p2o0cks3deo3gers4om3s0vp3u0gby3hr2n2w0e2yukyu6sa0arland6fe0ty4kura4le1on3msclub4ung5ndvik0coromant12ofi4p1rl2s1ve2xo3b0i1s2c0b1haeffler7midt4olarships8ol3ule3warz5ience5ot3d1e0arch3t2cure1ity6ek2lect4ner3rvices6ven3w1x0y3fr2g1h0angrila6rp3ell3ia1ksha5oes2p0ping5uji3w3i0lk2na1gles5te3j1k0i0n2y0pe4l0ing4m0art3ile4n0cf3o0ccer3ial4ftbank4ware6hu2lar2utions7ng1y2y2pa0ce3ort2t3r0l2s1t0ada2ples4r1tebank4farm7c0group6ockholm6rage3e3ream4udio2y3yle4u0cks3pplies3y2ort5rf1gery5zuki5v1watch4iss4x1y0dney4stems6z2tab1ipei4lk2obao4rget4tamotors6r2too4x0i3c0i2d0k2eam2ch0nology8l1masek5nnis4va3f1g1h0d1eater2re6iaa2ckets5enda4ps2res2ol4j0maxx4x2k0maxx5l1m0all4n1o0day3kyo3ols3p1ray3shiba5tal3urs3wn2yota3s3r0ade1ing4ining5vel0ers0insurance16ust3v2t1ube2i1nes3shu4v0s2w1z2ua1bank3s2g1k1nicom3versity8o2ol2ps2s1y1z2va0cations7na1guard7c1e0gas3ntures6risign5mögensberater2ung14sicherung10t2g1i0ajes4deo3g1king4llas4n1p1rgin4sa1ion4va1o3laanderen9n1odka3lvo3te1ing3o2yage5u2wales2mart4ter4ng0gou5tch0es6eather0channel12bcam3er2site5d0ding5ibo2r3f1hoswho6ien2ki2lliamhill9n0dows4e1ners6me2olterskluwer11odside6rk0s2ld3w2s1tc1f3xbox3erox4ihuan4n2xx2yz3yachts4hoo3maxun5ndex5e1odobashi7ga2kohama6u0tube6t1un3za0ppos4ra3ero3ip2m1one3uerich6w2", D2 = "ελ1υ2бг1ел3дети4ею2католик6ом3мкд2он1сква6онлайн5рг3рус2ф2сайт3рб3укр3қаз3հայ3ישראל5קום3ابوظبي5رامكو5لاردن4بحرين5جزائر5سعودية6عليان5مغرب5مارات5یران5بارت2زار4يتك3ھارت5تونس4سودان3رية5شبكة4عراق2ب2مان4فلسطين6قطر3كاثوليك6وم3مصر2ليسيا5وريتانيا7قع4همراه5پاکستان7ڀارت4कॉम3नेट3भारत0म्3ोत5संगठन5বাংলা5ভারত2ৰত4ਭਾਰਤ4ભારત4ଭାରତ4இந்தியா6லங்கை6சிங்கப்பூர்11భారత్5ಭಾರತ4ഭാരതം5ලංකා4คอม3ไทย3ລາວ3გე2みんな3アマゾン4クラウド4グーグル4コム2ストア3セール3ファッション6ポイント4世界2中信1国1國1文网3亚马逊3企业2佛山2信息2健康2八卦2公司1益2台湾1灣2商城1店1标2嘉里0大酒店5在线2大拿2天主教3娱乐2家電2广东2微博2慈善2我爱你3手机2招聘2政务1府2新加坡2闻2时尚2書籍2机构2淡马锡3游戏2澳門2点看2移动2组织机构4网址1店1站1络2联通2谷歌2购物2通販2集团2電訊盈科4飞利浦3食品2餐厅2香格里拉3港2닷넷1컴2삼성2한국2", ks = "numeric", xs = "ascii", Cs = "alpha", Hn = "asciinumeric", In = "alphanumeric", ws = "domain", vf = "emoji", O2 = "scheme", N2 = "slashscheme", Oo = "whitespace";
function R2(t, e) {
  return t in e || (e[t] = []), e[t];
}
function zt(t, e, n) {
  e[ks] && (e[Hn] = !0, e[In] = !0), e[xs] && (e[Hn] = !0, e[Cs] = !0), e[Hn] && (e[In] = !0), e[Cs] && (e[In] = !0), e[In] && (e[ws] = !0), e[vf] && (e[ws] = !0);
  for (const r in e) {
    const i = R2(r, n);
    i.indexOf(t) < 0 && i.push(t);
  }
}
function I2(t, e) {
  const n = {};
  for (const r in e)
    e[r].indexOf(t) >= 0 && (n[r] = !0);
  return n;
}
function be(t = null) {
  this.j = {}, this.jr = [], this.jd = null, this.t = t;
}
be.groups = {};
be.prototype = {
  accepts() {
    return !!this.t;
  },
  /**
   * Follow an existing transition from the given input to the next state.
   * Does not mutate.
   * @param {string} input character or token type to transition on
   * @returns {?State<T>} the next state, if any
   */
  go(t) {
    const e = this, n = e.j[t];
    if (n)
      return n;
    for (let r = 0; r < e.jr.length; r++) {
      const i = e.jr[r][0], o = e.jr[r][1];
      if (o && i.test(t))
        return o;
    }
    return e.jd;
  },
  /**
   * Whether the state has a transition for the given input. Set the second
   * argument to true to only look for an exact match (and not a default or
   * regular-expression-based transition)
   * @param {string} input
   * @param {boolean} exactOnly
   */
  has(t, e = !1) {
    return e ? t in this.j : !!this.go(t);
  },
  /**
   * Short for "transition all"; create a transition from the array of items
   * in the given list to the same final resulting state.
   * @param {string | string[]} inputs Group of inputs to transition on
   * @param {Transition<T> | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of token groups
   */
  ta(t, e, n, r) {
    for (let i = 0; i < t.length; i++)
      this.tt(t[i], e, n, r);
  },
  /**
   * Short for "take regexp transition"; defines a transition for this state
   * when it encounters a token which matches the given regular expression
   * @param {RegExp} regexp Regular expression transition (populate first)
   * @param {T | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of token groups
   * @returns {State<T>} taken after the given input
   */
  tr(t, e, n, r) {
    r = r || be.groups;
    let i;
    return e && e.j ? i = e : (i = new be(e), n && r && zt(e, n, r)), this.jr.push([t, i]), i;
  },
  /**
   * Short for "take transitions", will take as many sequential transitions as
   * the length of the given input and returns the
   * resulting final state.
   * @param {string | string[]} input
   * @param {T | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of token groups
   * @returns {State<T>} taken after the given input
   */
  ts(t, e, n, r) {
    let i = this;
    const o = t.length;
    if (!o)
      return i;
    for (let s = 0; s < o - 1; s++)
      i = i.tt(t[s]);
    return i.tt(t[o - 1], e, n, r);
  },
  /**
   * Short for "take transition", this is a method for building/working with
   * state machines.
   *
   * If a state already exists for the given input, returns it.
   *
   * If a token is specified, that state will emit that token when reached by
   * the linkify engine.
   *
   * If no state exists, it will be initialized with some default transitions
   * that resemble existing default transitions.
   *
   * If a state is given for the second argument, that state will be
   * transitioned to on the given input regardless of what that input
   * previously did.
   *
   * Specify a token group flags to define groups that this token belongs to.
   * The token will be added to corresponding entires in the given groups
   * object.
   *
   * @param {string} input character, token type to transition on
   * @param {T | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of groups
   * @returns {State<T>} taken after the given input
   */
  tt(t, e, n, r) {
    r = r || be.groups;
    const i = this;
    if (e && e.j)
      return i.j[t] = e, e;
    const o = e;
    let s, u = i.go(t);
    if (u ? (s = new be(), Object.assign(s.j, u.j), s.jr.push.apply(s.jr, u.jr), s.jd = u.jd, s.t = u.t) : s = new be(), o) {
      if (r)
        if (s.t && typeof s.t == "string") {
          const l = Object.assign(I2(s.t, r), n);
          zt(o, l, r);
        } else n && zt(o, n, r);
      s.t = o;
    }
    return i.j[t] = s, s;
  }
};
const R = (t, e, n, r, i) => t.ta(e, n, r, i), U = (t, e, n, r, i) => t.tr(e, n, r, i), oa = (t, e, n, r, i) => t.ts(e, n, r, i), A = (t, e, n, r, i) => t.tt(e, n, r, i), Qe = "WORD", Es = "UWORD", Mf = "ASCIINUMERICAL", Tf = "ALPHANUMERICAL", nr = "LOCALHOST", Ss = "TLD", As = "UTLD", Hr = "SCHEME", un = "SLASH_SCHEME", bu = "NUM", vs = "WS", yu = "NL", Vn = "OPENBRACE", jn = "CLOSEBRACE", ui = "OPENBRACKET", li = "CLOSEBRACKET", ai = "OPENPAREN", ci = "CLOSEPAREN", di = "OPENANGLEBRACKET", fi = "CLOSEANGLEBRACKET", hi = "FULLWIDTHLEFTPAREN", pi = "FULLWIDTHRIGHTPAREN", mi = "LEFTCORNERBRACKET", gi = "RIGHTCORNERBRACKET", bi = "LEFTWHITECORNERBRACKET", yi = "RIGHTWHITECORNERBRACKET", ki = "FULLWIDTHLESSTHAN", xi = "FULLWIDTHGREATERTHAN", Ci = "AMPERSAND", wi = "APOSTROPHE", Ei = "ASTERISK", ft = "AT", Si = "BACKSLASH", Ai = "BACKTICK", vi = "CARET", gt = "COLON", ku = "COMMA", Mi = "DOLLAR", ze = "DOT", Ti = "EQUALS", xu = "EXCLAMATION", Te = "HYPHEN", qn = "PERCENT", _i = "PIPE", Di = "PLUS", Oi = "POUND", Wn = "QUERY", Cu = "QUOTE", _f = "FULLWIDTHMIDDLEDOT", wu = "SEMI", $e = "SLASH", Un = "TILDE", Ni = "UNDERSCORE", Df = "EMOJI", Ri = "SYM";
var Of = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ALPHANUMERICAL: Tf,
  AMPERSAND: Ci,
  APOSTROPHE: wi,
  ASCIINUMERICAL: Mf,
  ASTERISK: Ei,
  AT: ft,
  BACKSLASH: Si,
  BACKTICK: Ai,
  CARET: vi,
  CLOSEANGLEBRACKET: fi,
  CLOSEBRACE: jn,
  CLOSEBRACKET: li,
  CLOSEPAREN: ci,
  COLON: gt,
  COMMA: ku,
  DOLLAR: Mi,
  DOT: ze,
  EMOJI: Df,
  EQUALS: Ti,
  EXCLAMATION: xu,
  FULLWIDTHGREATERTHAN: xi,
  FULLWIDTHLEFTPAREN: hi,
  FULLWIDTHLESSTHAN: ki,
  FULLWIDTHMIDDLEDOT: _f,
  FULLWIDTHRIGHTPAREN: pi,
  HYPHEN: Te,
  LEFTCORNERBRACKET: mi,
  LEFTWHITECORNERBRACKET: bi,
  LOCALHOST: nr,
  NL: yu,
  NUM: bu,
  OPENANGLEBRACKET: di,
  OPENBRACE: Vn,
  OPENBRACKET: ui,
  OPENPAREN: ai,
  PERCENT: qn,
  PIPE: _i,
  PLUS: Di,
  POUND: Oi,
  QUERY: Wn,
  QUOTE: Cu,
  RIGHTCORNERBRACKET: gi,
  RIGHTWHITECORNERBRACKET: yi,
  SCHEME: Hr,
  SEMI: wu,
  SLASH: $e,
  SLASH_SCHEME: un,
  SYM: Ri,
  TILDE: Un,
  TLD: Ss,
  UNDERSCORE: Ni,
  UTLD: As,
  UWORD: Es,
  WORD: Qe,
  WS: vs
});
const Xe = /[a-z]/, Tn = new RegExp("\\p{L}", "u"), No = new RegExp("\\p{Emoji}", "u"), Ye = /\d/, Ro = /\s/, sa = "\r", Io = `
`, L2 = "️", F2 = "‍", Lo = "￼";
let Mr = null, Tr = null;
function P2(t = []) {
  const e = {};
  be.groups = e;
  const n = new be();
  Mr == null && (Mr = ua(_2)), Tr == null && (Tr = ua(D2)), A(n, "'", wi), A(n, "{", Vn), A(n, "}", jn), A(n, "[", ui), A(n, "]", li), A(n, "(", ai), A(n, ")", ci), A(n, "<", di), A(n, ">", fi), A(n, "（", hi), A(n, "）", pi), A(n, "「", mi), A(n, "」", gi), A(n, "『", bi), A(n, "』", yi), A(n, "＜", ki), A(n, "＞", xi), A(n, "&", Ci), A(n, "*", Ei), A(n, "@", ft), A(n, "`", Ai), A(n, "^", vi), A(n, ":", gt), A(n, ",", ku), A(n, "$", Mi), A(n, ".", ze), A(n, "=", Ti), A(n, "!", xu), A(n, "-", Te), A(n, "%", qn), A(n, "|", _i), A(n, "+", Di), A(n, "#", Oi), A(n, "?", Wn), A(n, '"', Cu), A(n, "/", $e), A(n, ";", wu), A(n, "~", Un), A(n, "_", Ni), A(n, "\\", Si), A(n, "・", _f);
  const r = U(n, Ye, bu, {
    [ks]: !0
  });
  U(r, Ye, r);
  const i = U(r, Xe, Mf, {
    [Hn]: !0
  }), o = U(r, Tn, Tf, {
    [In]: !0
  }), s = U(n, Xe, Qe, {
    [xs]: !0
  });
  U(s, Ye, i), U(s, Xe, s), U(i, Ye, i), U(i, Xe, i);
  const u = U(n, Tn, Es, {
    [Cs]: !0
  });
  U(u, Xe), U(u, Ye, o), U(u, Tn, u), U(o, Ye, o), U(o, Xe), U(o, Tn, o);
  const l = A(n, Io, yu, {
    [Oo]: !0
  }), a = A(n, sa, vs, {
    [Oo]: !0
  }), c = U(n, Ro, vs, {
    [Oo]: !0
  });
  A(n, Lo, c), A(a, Io, l), A(a, Lo, c), U(a, Ro, c), A(c, sa), A(c, Io), U(c, Ro, c), A(c, Lo, c);
  const d = U(n, No, Df, {
    [vf]: !0
  });
  A(d, "#"), U(d, No, d), A(d, L2, d);
  const f = A(d, F2);
  A(f, "#"), U(f, No, d);
  const h = [[Xe, s], [Ye, i]], p = [[Xe, null], [Tn, u], [Ye, o]];
  for (let m = 0; m < Mr.length; m++)
    at(n, Mr[m], Ss, Qe, h);
  for (let m = 0; m < Tr.length; m++)
    at(n, Tr[m], As, Es, p);
  zt(Ss, {
    tld: !0,
    ascii: !0
  }, e), zt(As, {
    utld: !0,
    alpha: !0
  }, e), at(n, "file", Hr, Qe, h), at(n, "mailto", Hr, Qe, h), at(n, "http", un, Qe, h), at(n, "https", un, Qe, h), at(n, "ftp", un, Qe, h), at(n, "ftps", un, Qe, h), zt(Hr, {
    scheme: !0,
    ascii: !0
  }, e), zt(un, {
    slashscheme: !0,
    ascii: !0
  }, e), t = t.sort((m, g) => m[0] > g[0] ? 1 : -1);
  for (let m = 0; m < t.length; m++) {
    const g = t[m][0], y = t[m][1] ? {
      [O2]: !0
    } : {
      [N2]: !0
    };
    g.indexOf("-") >= 0 ? y[ws] = !0 : Xe.test(g) ? Ye.test(g) ? y[Hn] = !0 : y[xs] = !0 : y[ks] = !0, oa(n, g, g, y);
  }
  return oa(n, "localhost", nr, {
    ascii: !0
  }), n.jd = new be(Ri), {
    start: n,
    tokens: Object.assign({
      groups: e
    }, Of)
  };
}
function Nf(t, e) {
  const n = B2(e.replace(/[A-Z]/g, (u) => u.toLowerCase())), r = n.length, i = [];
  let o = 0, s = 0;
  for (; s < r; ) {
    let u = t, l = null, a = 0, c = null, d = -1, f = -1;
    for (; s < r && (l = u.go(n[s])); )
      u = l, u.accepts() ? (d = 0, f = 0, c = u) : d >= 0 && (d += n[s].length, f++), a += n[s].length, o += n[s].length, s++;
    o -= d, s -= f, a -= d, i.push({
      t: c.t,
      // token type/name
      v: e.slice(o - a, o),
      // string value
      s: o - a,
      // start index
      e: o
      // end index (excluding)
    });
  }
  return i;
}
function B2(t) {
  const e = [], n = t.length;
  let r = 0;
  for (; r < n; ) {
    let i = t.charCodeAt(r), o, s = i < 55296 || i > 56319 || r + 1 === n || (o = t.charCodeAt(r + 1)) < 56320 || o > 57343 ? t[r] : t.slice(r, r + 2);
    e.push(s), r += s.length;
  }
  return e;
}
function at(t, e, n, r, i) {
  let o;
  const s = e.length;
  for (let u = 0; u < s - 1; u++) {
    const l = e[u];
    t.j[l] ? o = t.j[l] : (o = new be(r), o.jr = i.slice(), t.j[l] = o), t = o;
  }
  return o = new be(n), o.jr = i.slice(), t.j[e[s - 1]] = o, o;
}
function ua(t) {
  const e = [], n = [];
  let r = 0, i = "0123456789";
  for (; r < t.length; ) {
    let o = 0;
    for (; i.indexOf(t[r + o]) >= 0; )
      o++;
    if (o > 0) {
      e.push(n.join(""));
      for (let s = parseInt(t.substring(r, r + o), 10); s > 0; s--)
        n.pop();
      r += o;
    } else
      n.push(t[r]), r++;
  }
  return e;
}
const rr = {
  defaultProtocol: "http",
  events: null,
  format: la,
  formatHref: la,
  nl2br: !1,
  tagName: "a",
  target: null,
  rel: null,
  validate: !0,
  truncate: 1 / 0,
  className: null,
  attributes: null,
  ignoreTags: [],
  render: null
};
function Eu(t, e = null) {
  let n = Object.assign({}, rr);
  t && (n = Object.assign(n, t instanceof Eu ? t.o : t));
  const r = n.ignoreTags, i = [];
  for (let o = 0; o < r.length; o++)
    i.push(r[o].toUpperCase());
  this.o = n, e && (this.defaultRender = e), this.ignoreTags = i;
}
Eu.prototype = {
  o: rr,
  /**
   * @type string[]
   */
  ignoreTags: [],
  /**
   * @param {IntermediateRepresentation} ir
   * @returns {any}
   */
  defaultRender(t) {
    return t;
  },
  /**
   * Returns true or false based on whether a token should be displayed as a
   * link based on the user options.
   * @param {MultiToken} token
   * @returns {boolean}
   */
  check(t) {
    return this.get("validate", t.toString(), t);
  },
  // Private methods
  /**
   * Resolve an option's value based on the value of the option and the given
   * params. If operator and token are specified and the target option is
   * callable, automatically calls the function with the given argument.
   * @template {keyof Opts} K
   * @param {K} key Name of option to use
   * @param {string} [operator] will be passed to the target option if it's a
   * function. If not specified, RAW function value gets returned
   * @param {MultiToken} [token] The token from linkify.tokenize
   * @returns {Opts[K] | any}
   */
  get(t, e, n) {
    const r = e != null;
    let i = this.o[t];
    return i && (typeof i == "object" ? (i = n.t in i ? i[n.t] : rr[t], typeof i == "function" && r && (i = i(e, n))) : typeof i == "function" && r && (i = i(e, n.t, n)), i);
  },
  /**
   * @template {keyof Opts} L
   * @param {L} key Name of options object to use
   * @param {string} [operator]
   * @param {MultiToken} [token]
   * @returns {Opts[L] | any}
   */
  getObj(t, e, n) {
    let r = this.o[t];
    return typeof r == "function" && e != null && (r = r(e, n.t, n)), r;
  },
  /**
   * Convert the given token to a rendered element that may be added to the
   * calling-interface's DOM
   * @param {MultiToken} token Token to render to an HTML element
   * @returns {any} Render result; e.g., HTML string, DOM element, React
   *   Component, etc.
   */
  render(t) {
    const e = t.render(this);
    return (this.get("render", null, t) || this.defaultRender)(e, t.t, t);
  }
};
function la(t) {
  return t;
}
function Rf(t, e) {
  this.t = "token", this.v = t, this.tk = e;
}
Rf.prototype = {
  isLink: !1,
  /**
   * Return the string this token represents.
   * @return {string}
   */
  toString() {
    return this.v;
  },
  /**
   * What should the value for this token be in the `href` HTML attribute?
   * Returns the `.toString` value by default.
   * @param {string} [scheme]
   * @return {string}
   */
  toHref(t) {
    return this.toString();
  },
  /**
   * @param {Options} options Formatting options
   * @returns {string}
   */
  toFormattedString(t) {
    const e = this.toString(), n = t.get("truncate", e, this), r = t.get("format", e, this);
    return n && r.length > n ? r.substring(0, n) + "…" : r;
  },
  /**
   *
   * @param {Options} options
   * @returns {string}
   */
  toFormattedHref(t) {
    return t.get("formatHref", this.toHref(t.get("defaultProtocol")), this);
  },
  /**
   * The start index of this token in the original input string
   * @returns {number}
   */
  startIndex() {
    return this.tk[0].s;
  },
  /**
   * The end index of this token in the original input string (up to this
   * index but not including it)
   * @returns {number}
   */
  endIndex() {
    return this.tk[this.tk.length - 1].e;
  },
  /**
  	Returns an object  of relevant values for this token, which includes keys
  	* type - Kind of token ('url', 'email', etc.)
  	* value - Original text
  	* href - The value that should be added to the anchor tag's href
  		attribute
  		@method toObject
  	@param {string} [protocol] `'http'` by default
  */
  toObject(t = rr.defaultProtocol) {
    return {
      type: this.t,
      value: this.toString(),
      isLink: this.isLink,
      href: this.toHref(t),
      start: this.startIndex(),
      end: this.endIndex()
    };
  },
  /**
   *
   * @param {Options} options Formatting option
   */
  toFormattedObject(t) {
    return {
      type: this.t,
      value: this.toFormattedString(t),
      isLink: this.isLink,
      href: this.toFormattedHref(t),
      start: this.startIndex(),
      end: this.endIndex()
    };
  },
  /**
   * Whether this token should be rendered as a link according to the given options
   * @param {Options} options
   * @returns {boolean}
   */
  validate(t) {
    return t.get("validate", this.toString(), this);
  },
  /**
   * Return an object that represents how this link should be rendered.
   * @param {Options} options Formattinng options
   */
  render(t) {
    const e = this, n = this.toHref(t.get("defaultProtocol")), r = t.get("formatHref", n, this), i = t.get("tagName", n, e), o = this.toFormattedString(t), s = {}, u = t.get("className", n, e), l = t.get("target", n, e), a = t.get("rel", n, e), c = t.getObj("attributes", n, e), d = t.getObj("events", n, e);
    return s.href = r, u && (s.class = u), l && (s.target = l), a && (s.rel = a), c && Object.assign(s, c), {
      tagName: i,
      attributes: s,
      content: o,
      eventListeners: d
    };
  }
};
function eo(t, e) {
  class n extends Rf {
    constructor(i, o) {
      super(i, o), this.t = t;
    }
  }
  for (const r in e)
    n.prototype[r] = e[r];
  return n.t = t, n;
}
const aa = eo("email", {
  isLink: !0,
  toHref() {
    return "mailto:" + this.toString();
  }
}), ca = eo("text"), z2 = eo("nl"), _r = eo("url", {
  isLink: !0,
  /**
  	Lowercases relevant parts of the domain and adds the protocol if
  	required. Note that this will not escape unsafe HTML characters in the
  	URL.
  		@param {string} [scheme] default scheme (e.g., 'https')
  	@return {string} the full href
  */
  toHref(t = rr.defaultProtocol) {
    return this.hasProtocol() ? this.v : `${t}://${this.v}`;
  },
  /**
   * Check whether this URL token has a protocol
   * @return {boolean}
   */
  hasProtocol() {
    const t = this.tk;
    return t.length >= 2 && t[0].t !== nr && t[1].t === gt;
  }
}), Me = (t) => new be(t);
function $2({
  groups: t
}) {
  const e = t.domain.concat([Ci, Ei, ft, Si, Ai, vi, Mi, Ti, Te, bu, qn, _i, Di, Oi, $e, Ri, Un, Ni]), n = [wi, gt, ku, ze, xu, qn, Wn, Cu, wu, di, fi, Vn, jn, li, ui, ai, ci, hi, pi, mi, gi, bi, yi, ki, xi], r = [Ci, wi, Ei, Si, Ai, vi, Mi, Ti, Te, Vn, jn, qn, _i, Di, Oi, Wn, $e, Ri, Un, Ni], i = Me(), o = A(i, Un);
  R(o, r, o), R(o, t.domain, o);
  const s = Me(), u = Me(), l = Me();
  R(i, t.domain, s), R(i, t.scheme, u), R(i, t.slashscheme, l), R(s, r, o), R(s, t.domain, s);
  const a = A(s, ft);
  A(o, ft, a), A(u, ft, a), A(l, ft, a);
  const c = A(o, ze);
  R(c, r, o), R(c, t.domain, o);
  const d = Me();
  R(a, t.domain, d), R(d, t.domain, d);
  const f = A(d, ze);
  R(f, t.domain, d);
  const h = Me(aa);
  R(f, t.tld, h), R(f, t.utld, h), A(a, nr, h);
  const p = A(d, Te);
  A(p, Te, p), R(p, t.domain, d), R(h, t.domain, d), A(h, ze, f), A(h, Te, p);
  const m = A(h, gt);
  R(m, t.numeric, aa);
  const g = A(s, Te), b = A(s, ze);
  A(g, Te, g), R(g, t.domain, s), R(b, r, o), R(b, t.domain, s);
  const y = Me(_r);
  R(b, t.tld, y), R(b, t.utld, y), R(y, t.domain, s), R(y, r, o), A(y, ze, b), A(y, Te, g), A(y, ft, a);
  const k = A(y, gt), C = Me(_r);
  R(k, t.numeric, C);
  const x = Me(_r), E = Me();
  R(x, e, x), R(x, n, E), R(E, e, x), R(E, n, E), A(y, $e, x), A(C, $e, x);
  const S = A(u, gt), M = A(l, gt), N = A(M, $e), Y = A(N, $e);
  R(u, t.domain, s), A(u, ze, b), A(u, Te, g), R(l, t.domain, s), A(l, ze, b), A(l, Te, g), R(S, t.domain, x), A(S, $e, x), A(S, Wn, x), R(Y, t.domain, x), R(Y, e, x), A(Y, $e, x);
  const Pe = [
    [Vn, jn],
    // {}
    [ui, li],
    // []
    [ai, ci],
    // ()
    [di, fi],
    // <>
    [hi, pi],
    // （）
    [mi, gi],
    // 「」
    [bi, yi],
    // 『』
    [ki, xi]
    // ＜＞
  ];
  for (let Be = 0; Be < Pe.length; Be++) {
    const [ut, pe] = Pe[Be], G = A(x, ut);
    A(E, ut, G), A(G, pe, x);
    const lt = Me(_r);
    R(G, e, lt);
    const En = Me();
    R(G, n), R(lt, e, lt), R(lt, n, En), R(En, e, lt), R(En, n, En), A(lt, pe, x), A(En, pe, x);
  }
  return A(i, nr, y), A(i, yu, z2), {
    start: i,
    tokens: Of
  };
}
function H2(t, e, n) {
  let r = n.length, i = 0, o = [], s = [];
  for (; i < r; ) {
    let u = t, l = null, a = null, c = 0, d = null, f = -1;
    for (; i < r && !(l = u.go(n[i].t)); )
      s.push(n[i++]);
    for (; i < r && (a = l || u.go(n[i].t)); )
      l = null, u = a, u.accepts() ? (f = 0, d = u) : f >= 0 && f++, i++, c++;
    if (f < 0)
      i -= c, i < r && (s.push(n[i]), i++);
    else {
      s.length > 0 && (o.push(Fo(ca, e, s)), s = []), i -= f, c -= f;
      const h = d.t, p = n.slice(i - c, i);
      o.push(Fo(h, e, p));
    }
  }
  return s.length > 0 && o.push(Fo(ca, e, s)), o;
}
function Fo(t, e, n) {
  const r = n[0].s, i = n[n.length - 1].e, o = e.slice(r, i);
  return new t(o, n);
}
const V2 = typeof console < "u" && console && console.warn || (() => {
}), j2 = "until manual call of linkify.init(). Register all schemes and plugins before invoking linkify the first time.", V = {
  scanner: null,
  parser: null,
  tokenQueue: [],
  pluginQueue: [],
  customSchemes: [],
  initialized: !1
};
function q2() {
  return be.groups = {}, V.scanner = null, V.parser = null, V.tokenQueue = [], V.pluginQueue = [], V.customSchemes = [], V.initialized = !1, V;
}
function da(t, e = !1) {
  if (V.initialized && V2(`linkifyjs: already initialized - will not register custom scheme "${t}" ${j2}`), !/^[0-9a-z]+(-[0-9a-z]+)*$/.test(t))
    throw new Error(`linkifyjs: incorrect scheme format.
1. Must only contain digits, lowercase ASCII letters or "-"
2. Cannot start or end with "-"
3. "-" cannot repeat`);
  V.customSchemes.push([t, e]);
}
function W2() {
  V.scanner = P2(V.customSchemes);
  for (let t = 0; t < V.tokenQueue.length; t++)
    V.tokenQueue[t][1]({
      scanner: V.scanner
    });
  V.parser = $2(V.scanner.tokens);
  for (let t = 0; t < V.pluginQueue.length; t++)
    V.pluginQueue[t][1]({
      scanner: V.scanner,
      parser: V.parser
    });
  return V.initialized = !0, V;
}
function Su(t) {
  return V.initialized || W2(), H2(V.parser.start, t, Nf(V.scanner.start, t));
}
Su.scan = Nf;
function If(t, e = null, n = null) {
  if (e && typeof e == "object") {
    if (n)
      throw Error(`linkifyjs: Invalid link type ${e}; must be a string`);
    n = e, e = null;
  }
  const r = new Eu(n), i = Su(t), o = [];
  for (let s = 0; s < i.length; s++) {
    const u = i[s];
    u.isLink && (!e || u.t === e) && r.check(u) && o.push(u.toFormattedObject(r));
  }
  return o;
}
var Au = "[\0-   ᠎ -\u2029 　]", U2 = new RegExp(Au), K2 = new RegExp(`${Au}$`), J2 = new RegExp(Au, "g");
function G2(t) {
  return t.length === 1 ? t[0].isLink : t.length === 3 && t[1].isLink ? ["()", "[]"].includes(t[0].value + t[2].value) : !1;
}
function Z2(t) {
  return new H({
    key: new W("autolink"),
    appendTransaction: (e, n, r) => {
      const i = e.some((a) => a.docChanged) && !n.doc.eq(r.doc), o = e.some((a) => a.getMeta("preventAutolink"));
      if (!i || o)
        return;
      const { tr: s } = r, u = Wd(n.doc, [...e]);
      if (Qd(u).forEach(({ newRange: a }) => {
        const c = X1(r.doc, a, (h) => h.isTextblock);
        let d, f;
        if (c.length > 1)
          d = c[0], f = r.doc.textBetween(
            d.pos,
            d.pos + d.node.nodeSize,
            void 0,
            " "
          );
        else if (c.length) {
          const h = r.doc.textBetween(a.from, a.to, " ", " ");
          if (!K2.test(h))
            return;
          d = c[0], f = r.doc.textBetween(d.pos, a.to, void 0, " ");
        }
        if (d && f) {
          const h = f.split(U2).filter(Boolean);
          if (h.length <= 0)
            return !1;
          const p = h[h.length - 1], m = d.pos + f.lastIndexOf(p);
          if (!p)
            return !1;
          const g = Su(p).map((b) => b.toObject(t.defaultProtocol));
          if (!G2(g))
            return !1;
          g.filter((b) => b.isLink).map((b) => ({
            ...b,
            from: m + b.start + 1,
            to: m + b.end + 1
          })).filter((b) => r.schema.marks.code ? !r.doc.rangeHasMark(b.from, b.to, r.schema.marks.code) : !0).filter((b) => t.validate(b.value)).filter((b) => t.shouldAutoLink(b.value)).forEach((b) => {
            du(b.from, b.to, r.doc).some((y) => y.mark.type === t.type) || s.addMark(
              b.from,
              b.to,
              t.type.create({
                href: b.href
              })
            );
          });
        }
      }), !!s.steps.length)
        return s;
    }
  });
}
function X2(t) {
  return new H({
    key: new W("handleClickLink"),
    props: {
      handleClick: (e, n, r) => {
        var i, o;
        if (r.button !== 0 || !e.editable)
          return !1;
        let s = null;
        if (r.target instanceof HTMLAnchorElement)
          s = r.target;
        else {
          const l = r.target;
          if (!l)
            return !1;
          const a = t.editor.view.dom;
          s = l.closest("a"), s && !a.contains(s) && (s = null);
        }
        if (!s)
          return !1;
        let u = !1;
        if (t.enableClickSelection && (u = t.editor.commands.extendMarkRange(t.type.name)), t.openOnClick) {
          const l = Yd(e.state, t.type.name), a = (i = s.href) != null ? i : l.href, c = (o = s.target) != null ? o : l.target;
          a && (window.open(a, c), u = !0);
        }
        return u;
      }
    }
  });
}
function Y2(t) {
  return new H({
    key: new W("handlePasteLink"),
    props: {
      handlePaste: (e, n, r) => {
        const { shouldAutoLink: i } = t, { state: o } = e, { selection: s } = o, { empty: u } = s;
        if (u)
          return !1;
        let l = "";
        r.content.forEach((c) => {
          l += c.textContent;
        });
        const a = If(l, { defaultProtocol: t.defaultProtocol }).find(
          (c) => c.isLink && c.value === l
        );
        return !l || !a || i !== void 0 && !i(a.value) ? !1 : t.editor.commands.setMark(t.type, {
          href: a.href
        });
      }
    }
  });
}
function Rt(t, e) {
  const n = ["http", "https", "ftp", "ftps", "mailto", "tel", "callto", "sms", "cid", "xmpp"];
  return e && e.forEach((r) => {
    const i = typeof r == "string" ? r : r.scheme;
    i && n.push(i);
  }), !t || t.replace(J2, "").match(
    new RegExp(
      // eslint-disable-next-line no-useless-escape
      `^(?:(?:${n.join("|")}):|[^a-z]|[a-z0-9+.-]+(?:[^a-z+.-:]|$))`,
      "i"
    )
  );
}
var Lf = ve.create({
  name: "link",
  priority: 1e3,
  keepOnSplit: !1,
  exitable: !0,
  onCreate() {
    this.options.validate && !this.options.shouldAutoLink && (this.options.shouldAutoLink = this.options.validate, console.warn("The `validate` option is deprecated. Rename to the `shouldAutoLink` option instead.")), this.options.protocols.forEach((t) => {
      if (typeof t == "string") {
        da(t);
        return;
      }
      da(t.scheme, t.optionalSlashes);
    });
  },
  onDestroy() {
    q2();
  },
  inclusive() {
    return this.options.autolink;
  },
  addOptions() {
    return {
      openOnClick: !0,
      enableClickSelection: !1,
      linkOnPaste: !0,
      autolink: !0,
      protocols: [],
      defaultProtocol: "http",
      HTMLAttributes: {
        target: "_blank",
        rel: "noopener noreferrer nofollow",
        class: null
      },
      isAllowedUri: (t, e) => !!Rt(t, e.protocols),
      validate: (t) => !!t,
      shouldAutoLink: (t) => {
        const e = /^[a-z][a-z0-9+.-]*:\/\//i.test(t), n = /^[a-z][a-z0-9+.-]*:/i.test(t);
        if (e || n && !t.includes("@"))
          return !0;
        const i = (t.includes("@") ? t.split("@").pop() : t).split(/[/?#:]/)[0];
        return !(/^\d{1,3}(\.\d{1,3}){3}$/.test(i) || !/\./.test(i));
      }
    };
  },
  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML(t) {
          return t.getAttribute("href");
        }
      },
      target: {
        default: this.options.HTMLAttributes.target
      },
      rel: {
        default: this.options.HTMLAttributes.rel
      },
      class: {
        default: this.options.HTMLAttributes.class
      },
      title: {
        default: null
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: "a[href]",
        getAttrs: (t) => {
          const e = t.getAttribute("href");
          return !e || !this.options.isAllowedUri(e, {
            defaultValidate: (n) => !!Rt(n, this.options.protocols),
            protocols: this.options.protocols,
            defaultProtocol: this.options.defaultProtocol
          }) ? !1 : null;
        }
      }
    ];
  },
  renderHTML({ HTMLAttributes: t }) {
    return this.options.isAllowedUri(t.href, {
      defaultValidate: (e) => !!Rt(e, this.options.protocols),
      protocols: this.options.protocols,
      defaultProtocol: this.options.defaultProtocol
    }) ? ["a", q(this.options.HTMLAttributes, t), 0] : ["a", q(this.options.HTMLAttributes, { ...t, href: "" }), 0];
  },
  markdownTokenName: "link",
  parseMarkdown: (t, e) => e.applyMark("link", e.parseInline(t.tokens || []), {
    href: t.href,
    title: t.title || null
  }),
  renderMarkdown: (t, e) => {
    var n, r, i, o;
    const s = (r = (n = t.attrs) == null ? void 0 : n.href) != null ? r : "", u = (o = (i = t.attrs) == null ? void 0 : i.title) != null ? o : "", l = e.renderChildren(t);
    return u ? `[${l}](${s} "${u}")` : `[${l}](${s})`;
  },
  addCommands() {
    return {
      setLink: (t) => ({ chain: e }) => {
        const { href: n } = t;
        return this.options.isAllowedUri(n, {
          defaultValidate: (r) => !!Rt(r, this.options.protocols),
          protocols: this.options.protocols,
          defaultProtocol: this.options.defaultProtocol
        }) ? e().setMark(this.name, t).setMeta("preventAutolink", !0).run() : !1;
      },
      toggleLink: (t) => ({ chain: e }) => {
        const { href: n } = t || {};
        return n && !this.options.isAllowedUri(n, {
          defaultValidate: (r) => !!Rt(r, this.options.protocols),
          protocols: this.options.protocols,
          defaultProtocol: this.options.defaultProtocol
        }) ? !1 : e().toggleMark(this.name, t, { extendEmptyMarkRange: !0 }).setMeta("preventAutolink", !0).run();
      },
      unsetLink: () => ({ chain: t }) => t().unsetMark(this.name, { extendEmptyMarkRange: !0 }).setMeta("preventAutolink", !0).run()
    };
  },
  addPasteRules() {
    return [
      Gt({
        find: (t) => {
          const e = [];
          if (t) {
            const { protocols: n, defaultProtocol: r } = this.options, i = If(t).filter(
              (o) => o.isLink && this.options.isAllowedUri(o.value, {
                defaultValidate: (s) => !!Rt(s, n),
                protocols: n,
                defaultProtocol: r
              })
            );
            i.length && i.forEach((o) => {
              this.options.shouldAutoLink(o.value) && e.push({
                text: o.value,
                data: {
                  href: o.href
                },
                index: o.start
              });
            });
          }
          return e;
        },
        type: this.type,
        getAttributes: (t) => {
          var e;
          return {
            href: (e = t.data) == null ? void 0 : e.href
          };
        }
      })
    ];
  },
  addProseMirrorPlugins() {
    const t = [], { protocols: e, defaultProtocol: n } = this.options;
    return this.options.autolink && t.push(
      Z2({
        type: this.type,
        defaultProtocol: this.options.defaultProtocol,
        validate: (r) => this.options.isAllowedUri(r, {
          defaultValidate: (i) => !!Rt(i, e),
          protocols: e,
          defaultProtocol: n
        }),
        shouldAutoLink: this.options.shouldAutoLink
      })
    ), t.push(
      X2({
        type: this.type,
        editor: this.editor,
        openOnClick: this.options.openOnClick === "whenNotEditable" ? !0 : this.options.openOnClick,
        enableClickSelection: this.options.enableClickSelection
      })
    ), this.options.linkOnPaste && t.push(
      Y2({
        editor: this.editor,
        defaultProtocol: this.options.defaultProtocol,
        type: this.type,
        shouldAutoLink: this.options.shouldAutoLink
      })
    ), t;
  }
}), Q2 = Object.defineProperty, ey = (t, e) => {
  for (var n in e)
    Q2(t, n, { get: e[n], enumerable: !0 });
}, ty = "listItem", fa = "textStyle", ha = /^\s*([-+*])\s$/, Ff = L.create({
  name: "bulletList",
  addOptions() {
    return {
      itemTypeName: "listItem",
      HTMLAttributes: {},
      keepMarks: !1,
      keepAttributes: !1
    };
  },
  group: "block list",
  content() {
    return `${this.options.itemTypeName}+`;
  },
  parseHTML() {
    return [{ tag: "ul" }];
  },
  renderHTML({ HTMLAttributes: t }) {
    return ["ul", q(this.options.HTMLAttributes, t), 0];
  },
  markdownTokenName: "list",
  parseMarkdown: (t, e) => t.type !== "list" || t.ordered ? [] : {
    type: "bulletList",
    content: t.items ? e.parseChildren(t.items) : []
  },
  renderMarkdown: (t, e) => t.content ? e.renderChildren(t.content, `
`) : "",
  markdownOptions: {
    indentsContent: !0
  },
  addCommands() {
    return {
      toggleBulletList: () => ({ commands: t, chain: e }) => this.options.keepAttributes ? e().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(ty, this.editor.getAttributes(fa)).run() : t.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-8": () => this.editor.commands.toggleBulletList()
    };
  },
  addInputRules() {
    let t = yn({
      find: ha,
      type: this.type
    });
    return (this.options.keepMarks || this.options.keepAttributes) && (t = yn({
      find: ha,
      type: this.type,
      keepMarks: this.options.keepMarks,
      keepAttributes: this.options.keepAttributes,
      getAttributes: () => this.editor.getAttributes(fa),
      editor: this.editor
    })), [t];
  }
}), Pf = L.create({
  name: "listItem",
  addOptions() {
    return {
      HTMLAttributes: {},
      bulletListTypeName: "bulletList",
      orderedListTypeName: "orderedList"
    };
  },
  content: "paragraph block*",
  defining: !0,
  parseHTML() {
    return [
      {
        tag: "li"
      }
    ];
  },
  renderHTML({ HTMLAttributes: t }) {
    return ["li", q(this.options.HTMLAttributes, t), 0];
  },
  markdownTokenName: "list_item",
  parseMarkdown: (t, e) => {
    if (t.type !== "list_item")
      return [];
    let n = [];
    if (t.tokens && t.tokens.length > 0)
      if (t.tokens.some((i) => i.type === "paragraph"))
        n = e.parseChildren(t.tokens);
      else {
        const i = t.tokens[0];
        if (i && i.type === "text" && i.tokens && i.tokens.length > 0) {
          if (n = [
            {
              type: "paragraph",
              content: e.parseInline(i.tokens)
            }
          ], t.tokens.length > 1) {
            const s = t.tokens.slice(1), u = e.parseChildren(s);
            n.push(...u);
          }
        } else
          n = e.parseChildren(t.tokens);
      }
    return n.length === 0 && (n = [
      {
        type: "paragraph",
        content: []
      }
    ]), {
      type: "listItem",
      content: n
    };
  },
  renderMarkdown: (t, e, n) => mu(
    t,
    e,
    (r) => {
      var i, o;
      return r.parentType === "bulletList" ? "- " : r.parentType === "orderedList" ? `${(((o = (i = r.meta) == null ? void 0 : i.parentAttrs) == null ? void 0 : o.start) || 1) + r.index}. ` : "- ";
    },
    n
  ),
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
      Tab: () => this.editor.commands.sinkListItem(this.name),
      "Shift-Tab": () => this.editor.commands.liftListItem(this.name)
    };
  }
}), ny = {};
ey(ny, {
  findListItemPos: () => hr,
  getNextListDepth: () => vu,
  handleBackspace: () => Ms,
  handleDelete: () => Ts,
  hasListBefore: () => Bf,
  hasListItemAfter: () => ry,
  hasListItemBefore: () => zf,
  listItemHasSubList: () => $f,
  nextListIsDeeper: () => Hf,
  nextListIsHigher: () => Vf
});
var hr = (t, e) => {
  const { $from: n } = e.selection, r = X(t, e.schema);
  let i = null, o = n.depth, s = n.pos, u = null;
  for (; o > 0 && u === null; )
    i = n.node(o), i.type === r ? u = o : (o -= 1, s -= 1);
  return u === null ? null : { $pos: e.doc.resolve(s), depth: u };
}, vu = (t, e) => {
  const n = hr(t, e);
  if (!n)
    return !1;
  const [, r] = sg(e, t, n.$pos.pos + 4);
  return r;
}, Bf = (t, e, n) => {
  const { $anchor: r } = t.selection, i = Math.max(0, r.pos - 2), o = t.doc.resolve(i).node();
  return !(!o || !n.includes(o.type.name));
}, zf = (t, e) => {
  var n;
  const { $anchor: r } = e.selection, i = e.doc.resolve(r.pos - 2);
  return !(i.index() === 0 || ((n = i.nodeBefore) == null ? void 0 : n.type.name) !== t);
}, $f = (t, e, n) => {
  if (!n)
    return !1;
  const r = X(t, e.schema);
  let i = !1;
  return n.descendants((o) => {
    o.type === r && (i = !0);
  }), i;
}, Ms = (t, e, n) => {
  if (t.commands.undoInputRule())
    return !0;
  if (t.state.selection.from !== t.state.selection.to)
    return !1;
  if (!Tt(t.state, e) && Bf(t.state, e, n)) {
    const { $anchor: u } = t.state.selection, l = t.state.doc.resolve(u.before() - 1), a = [];
    l.node().descendants((f, h) => {
      f.type.name === e && a.push({ node: f, pos: h });
    });
    const c = a.at(-1);
    if (!c)
      return !1;
    const d = t.state.doc.resolve(l.start() + c.pos + 1);
    return t.chain().cut({ from: u.start() - 1, to: u.end() + 1 }, d.end()).joinForward().run();
  }
  if (!Tt(t.state, e) || !cg(t.state))
    return !1;
  const r = hr(e, t.state);
  if (!r)
    return !1;
  const o = t.state.doc.resolve(r.$pos.pos - 2).node(r.depth), s = $f(e, t.state, o);
  return zf(e, t.state) && !s ? t.commands.joinItemBackward() : t.chain().liftListItem(e).run();
}, Hf = (t, e) => {
  const n = vu(t, e), r = hr(t, e);
  return !r || !n ? !1 : n > r.depth;
}, Vf = (t, e) => {
  const n = vu(t, e), r = hr(t, e);
  return !r || !n ? !1 : n < r.depth;
}, Ts = (t, e) => {
  if (!Tt(t.state, e) || !ag(t.state, e))
    return !1;
  const { selection: n } = t.state, { $from: r, $to: i } = n;
  return !n.empty && r.sameParent(i) ? !1 : Hf(e, t.state) ? t.chain().focus(t.state.selection.from + 4).lift(e).joinBackward().run() : Vf(e, t.state) ? t.chain().joinForward().joinBackward().run() : t.commands.joinItemForward();
}, ry = (t, e) => {
  var n;
  const { $anchor: r } = e.selection, i = e.doc.resolve(r.pos - r.parentOffset - 2);
  return !(i.index() === i.parent.childCount - 1 || ((n = i.nodeAfter) == null ? void 0 : n.type.name) !== t);
}, jf = j.create({
  name: "listKeymap",
  addOptions() {
    return {
      listTypes: [
        {
          itemName: "listItem",
          wrapperNames: ["bulletList", "orderedList"]
        },
        {
          itemName: "taskItem",
          wrapperNames: ["taskList"]
        }
      ]
    };
  },
  addKeyboardShortcuts() {
    return {
      Delete: ({ editor: t }) => {
        let e = !1;
        return this.options.listTypes.forEach(({ itemName: n }) => {
          t.state.schema.nodes[n] !== void 0 && Ts(t, n) && (e = !0);
        }), e;
      },
      "Mod-Delete": ({ editor: t }) => {
        let e = !1;
        return this.options.listTypes.forEach(({ itemName: n }) => {
          t.state.schema.nodes[n] !== void 0 && Ts(t, n) && (e = !0);
        }), e;
      },
      Backspace: ({ editor: t }) => {
        let e = !1;
        return this.options.listTypes.forEach(({ itemName: n, wrapperNames: r }) => {
          t.state.schema.nodes[n] !== void 0 && Ms(t, n, r) && (e = !0);
        }), e;
      },
      "Mod-Backspace": ({ editor: t }) => {
        let e = !1;
        return this.options.listTypes.forEach(({ itemName: n, wrapperNames: r }) => {
          t.state.schema.nodes[n] !== void 0 && Ms(t, n, r) && (e = !0);
        }), e;
      }
    };
  }
}), pa = /^(\s*)(\d+)\.\s+(.*)$/, iy = /^\s/;
function oy(t) {
  const e = [];
  let n = 0, r = 0;
  for (; n < t.length; ) {
    const i = t[n], o = i.match(pa);
    if (!o)
      break;
    const [, s, u, l] = o, a = s.length;
    let c = l, d = n + 1;
    const f = [i];
    for (; d < t.length; ) {
      const h = t[d];
      if (h.match(pa))
        break;
      if (h.trim() === "")
        f.push(h), c += `
`, d += 1;
      else if (h.match(iy))
        f.push(h), c += `
${h.slice(a + 2)}`, d += 1;
      else
        break;
    }
    e.push({
      indent: a,
      number: parseInt(u, 10),
      content: c.trim(),
      raw: f.join(`
`)
    }), r = d, n = d;
  }
  return [e, r];
}
function qf(t, e, n) {
  var r;
  const i = [];
  let o = 0;
  for (; o < t.length; ) {
    const s = t[o];
    if (s.indent === e) {
      const u = s.content.split(`
`), l = ((r = u[0]) == null ? void 0 : r.trim()) || "", a = [];
      l && a.push({
        type: "paragraph",
        raw: l,
        tokens: n.inlineTokens(l)
      });
      const c = u.slice(1).join(`
`).trim();
      if (c) {
        const h = n.blockTokens(c);
        a.push(...h);
      }
      let d = o + 1;
      const f = [];
      for (; d < t.length && t[d].indent > e; )
        f.push(t[d]), d += 1;
      if (f.length > 0) {
        const h = Math.min(...f.map((m) => m.indent)), p = qf(f, h, n);
        a.push({
          type: "list",
          ordered: !0,
          start: f[0].number,
          items: p,
          raw: f.map((m) => m.raw).join(`
`)
        });
      }
      i.push({
        type: "list_item",
        raw: s.raw,
        tokens: a
      }), o = d;
    } else
      o += 1;
  }
  return i;
}
function sy(t, e) {
  return t.map((n) => {
    if (n.type !== "list_item")
      return e.parseChildren([n])[0];
    const r = [];
    return n.tokens && n.tokens.length > 0 && n.tokens.forEach((i) => {
      if (i.type === "paragraph" || i.type === "list" || i.type === "blockquote" || i.type === "code")
        r.push(...e.parseChildren([i]));
      else if (i.type === "text" && i.tokens) {
        const o = e.parseChildren([i]);
        r.push({
          type: "paragraph",
          content: o
        });
      } else {
        const o = e.parseChildren([i]);
        o.length > 0 && r.push(...o);
      }
    }), {
      type: "listItem",
      content: r
    };
  });
}
var uy = "listItem", ma = "textStyle", ga = /^(\d+)\.\s$/, Wf = L.create({
  name: "orderedList",
  addOptions() {
    return {
      itemTypeName: "listItem",
      HTMLAttributes: {},
      keepMarks: !1,
      keepAttributes: !1
    };
  },
  group: "block list",
  content() {
    return `${this.options.itemTypeName}+`;
  },
  addAttributes() {
    return {
      start: {
        default: 1,
        parseHTML: (t) => t.hasAttribute("start") ? parseInt(t.getAttribute("start") || "", 10) : 1
      },
      type: {
        default: null,
        parseHTML: (t) => t.getAttribute("type")
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: "ol"
      }
    ];
  },
  renderHTML({ HTMLAttributes: t }) {
    const { start: e, ...n } = t;
    return e === 1 ? ["ol", q(this.options.HTMLAttributes, n), 0] : ["ol", q(this.options.HTMLAttributes, t), 0];
  },
  markdownTokenName: "list",
  parseMarkdown: (t, e) => {
    if (t.type !== "list" || !t.ordered)
      return [];
    const n = t.start || 1, r = t.items ? sy(t.items, e) : [];
    return n !== 1 ? {
      type: "orderedList",
      attrs: { start: n },
      content: r
    } : {
      type: "orderedList",
      content: r
    };
  },
  renderMarkdown: (t, e) => t.content ? e.renderChildren(t.content, `
`) : "",
  markdownTokenizer: {
    name: "orderedList",
    level: "block",
    start: (t) => {
      const e = t.match(/^(\s*)(\d+)\.\s+/), n = e?.index;
      return n !== void 0 ? n : -1;
    },
    tokenize: (t, e, n) => {
      var r;
      const i = t.split(`
`), [o, s] = oy(i);
      if (o.length === 0)
        return;
      const u = qf(o, 0, n);
      return u.length === 0 ? void 0 : {
        type: "list",
        ordered: !0,
        start: ((r = o[0]) == null ? void 0 : r.number) || 1,
        items: u,
        raw: i.slice(0, s).join(`
`)
      };
    }
  },
  markdownOptions: {
    indentsContent: !0
  },
  addCommands() {
    return {
      toggleOrderedList: () => ({ commands: t, chain: e }) => this.options.keepAttributes ? e().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(uy, this.editor.getAttributes(ma)).run() : t.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-7": () => this.editor.commands.toggleOrderedList()
    };
  },
  addInputRules() {
    let t = yn({
      find: ga,
      type: this.type,
      getAttributes: (e) => ({ start: +e[1] }),
      joinPredicate: (e, n) => n.childCount + n.attrs.start === +e[1]
    });
    return (this.options.keepMarks || this.options.keepAttributes) && (t = yn({
      find: ga,
      type: this.type,
      keepMarks: this.options.keepMarks,
      keepAttributes: this.options.keepAttributes,
      getAttributes: (e) => ({ start: +e[1], ...this.editor.getAttributes(ma) }),
      joinPredicate: (e, n) => n.childCount + n.attrs.start === +e[1],
      editor: this.editor
    })), [t];
  }
}), ly = /^\s*(\[([( |x])?\])\s$/, Uf = L.create({
  name: "taskItem",
  addOptions() {
    return {
      nested: !1,
      HTMLAttributes: {},
      taskListTypeName: "taskList",
      a11y: void 0
    };
  },
  content() {
    return this.options.nested ? "paragraph block*" : "paragraph+";
  },
  defining: !0,
  addAttributes() {
    return {
      checked: {
        default: !1,
        keepOnSplit: !1,
        parseHTML: (t) => {
          const e = t.getAttribute("data-checked");
          return e === "" || e === "true";
        },
        renderHTML: (t) => ({
          "data-checked": t.checked
        })
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: `li[data-type="${this.name}"]`,
        priority: 51
      }
    ];
  },
  renderHTML({ node: t, HTMLAttributes: e }) {
    return [
      "li",
      q(this.options.HTMLAttributes, e, {
        "data-type": this.name
      }),
      [
        "label",
        [
          "input",
          {
            type: "checkbox",
            checked: t.attrs.checked ? "checked" : null
          }
        ],
        ["span"]
      ],
      ["div", 0]
    ];
  },
  parseMarkdown: (t, e) => {
    const n = [];
    if (t.tokens && t.tokens.length > 0 ? n.push(e.createNode("paragraph", {}, e.parseInline(t.tokens))) : t.text ? n.push(e.createNode("paragraph", {}, [e.createNode("text", { text: t.text })])) : n.push(e.createNode("paragraph", {}, [])), t.nestedTokens && t.nestedTokens.length > 0) {
      const r = e.parseChildren(t.nestedTokens);
      n.push(...r);
    }
    return e.createNode("taskItem", { checked: t.checked || !1 }, n);
  },
  renderMarkdown: (t, e) => {
    var n;
    const i = `- [${(n = t.attrs) != null && n.checked ? "x" : " "}] `;
    return mu(t, e, i);
  },
  addKeyboardShortcuts() {
    const t = {
      Enter: () => this.editor.commands.splitListItem(this.name),
      "Shift-Tab": () => this.editor.commands.liftListItem(this.name)
    };
    return this.options.nested ? {
      ...t,
      Tab: () => this.editor.commands.sinkListItem(this.name)
    } : t;
  },
  addNodeView() {
    return ({ node: t, HTMLAttributes: e, getPos: n, editor: r }) => {
      const i = document.createElement("li"), o = document.createElement("label"), s = document.createElement("span"), u = document.createElement("input"), l = document.createElement("div"), a = (d) => {
        var f, h;
        u.ariaLabel = ((h = (f = this.options.a11y) == null ? void 0 : f.checkboxLabel) == null ? void 0 : h.call(f, d, u.checked)) || `Task item checkbox for ${d.textContent || "empty task item"}`;
      };
      a(t), o.contentEditable = "false", u.type = "checkbox", u.addEventListener("mousedown", (d) => d.preventDefault()), u.addEventListener("change", (d) => {
        if (!r.isEditable && !this.options.onReadOnlyChecked) {
          u.checked = !u.checked;
          return;
        }
        const { checked: f } = d.target;
        r.isEditable && typeof n == "function" && r.chain().focus(void 0, { scrollIntoView: !1 }).command(({ tr: h }) => {
          const p = n();
          if (typeof p != "number")
            return !1;
          const m = h.doc.nodeAt(p);
          return h.setNodeMarkup(p, void 0, {
            ...m?.attrs,
            checked: f
          }), !0;
        }).run(), !r.isEditable && this.options.onReadOnlyChecked && (this.options.onReadOnlyChecked(t, f) || (u.checked = !u.checked));
      }), Object.entries(this.options.HTMLAttributes).forEach(([d, f]) => {
        i.setAttribute(d, f);
      }), i.dataset.checked = t.attrs.checked, u.checked = t.attrs.checked, o.append(u, s), i.append(o, l), Object.entries(e).forEach(([d, f]) => {
        i.setAttribute(d, f);
      });
      let c = new Set(Object.keys(e));
      return {
        dom: i,
        contentDOM: l,
        update: (d) => {
          if (d.type !== this.type)
            return !1;
          i.dataset.checked = d.attrs.checked, u.checked = d.attrs.checked, a(d);
          const f = r.extensionManager.attributes, h = tr(d, f), p = new Set(Object.keys(h)), m = this.options.HTMLAttributes;
          return c.forEach((g) => {
            p.has(g) || (g in m ? i.setAttribute(g, m[g]) : i.removeAttribute(g));
          }), Object.entries(h).forEach(([g, b]) => {
            b == null ? g in m ? i.setAttribute(g, m[g]) : i.removeAttribute(g) : i.setAttribute(g, b);
          }), c = p, !0;
        }
      };
    };
  },
  addInputRules() {
    return [
      yn({
        find: ly,
        type: this.type,
        getAttributes: (t) => ({
          checked: t[t.length - 1] === "x"
        })
      })
    ];
  }
}), Kf = L.create({
  name: "taskList",
  addOptions() {
    return {
      itemTypeName: "taskItem",
      HTMLAttributes: {}
    };
  },
  group: "block list",
  content() {
    return `${this.options.itemTypeName}+`;
  },
  parseHTML() {
    return [
      {
        tag: `ul[data-type="${this.name}"]`,
        priority: 51
      }
    ];
  },
  renderHTML({ HTMLAttributes: t }) {
    return ["ul", q(this.options.HTMLAttributes, t, { "data-type": this.name }), 0];
  },
  parseMarkdown: (t, e) => e.createNode("taskList", {}, e.parseChildren(t.items || [])),
  renderMarkdown: (t, e) => t.content ? e.renderChildren(t.content, `
`) : "",
  markdownTokenizer: {
    name: "taskList",
    level: "block",
    start(t) {
      var e;
      const n = (e = t.match(/^\s*[-+*]\s+\[([ xX])\]\s+/)) == null ? void 0 : e.index;
      return n !== void 0 ? n : -1;
    },
    tokenize(t, e, n) {
      const r = (o) => {
        const s = bs(
          o,
          {
            itemPattern: /^(\s*)([-+*])\s+\[([ xX])\]\s+(.*)$/,
            extractItemData: (u) => ({
              indentLevel: u[1].length,
              mainContent: u[4],
              checked: u[3].toLowerCase() === "x"
            }),
            createToken: (u, l) => ({
              type: "taskItem",
              raw: "",
              mainContent: u.mainContent,
              indentLevel: u.indentLevel,
              checked: u.checked,
              text: u.mainContent,
              tokens: n.inlineTokens(u.mainContent),
              nestedTokens: l
            }),
            // Allow recursive nesting
            customNestedParser: r
          },
          n
        );
        return s ? [
          {
            type: "taskList",
            raw: s.raw,
            items: s.items
          }
        ] : n.blockTokens(o);
      }, i = bs(
        t,
        {
          itemPattern: /^(\s*)([-+*])\s+\[([ xX])\]\s+(.*)$/,
          extractItemData: (o) => ({
            indentLevel: o[1].length,
            mainContent: o[4],
            checked: o[3].toLowerCase() === "x"
          }),
          createToken: (o, s) => ({
            type: "taskItem",
            raw: "",
            mainContent: o.mainContent,
            indentLevel: o.indentLevel,
            checked: o.checked,
            text: o.mainContent,
            tokens: n.inlineTokens(o.mainContent),
            nestedTokens: s
          }),
          // Use the recursive parser for nested content
          customNestedParser: r
        },
        n
      );
      if (i)
        return {
          type: "taskList",
          raw: i.raw,
          items: i.items
        };
    }
  },
  markdownOptions: {
    indentsContent: !0
  },
  addCommands() {
    return {
      toggleTaskList: () => ({ commands: t }) => t.toggleList(this.name, this.options.itemTypeName)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-9": () => this.editor.commands.toggleTaskList()
    };
  }
});
j.create({
  name: "listKit",
  addExtensions() {
    const t = [];
    return this.options.bulletList !== !1 && t.push(Ff.configure(this.options.bulletList)), this.options.listItem !== !1 && t.push(Pf.configure(this.options.listItem)), this.options.listKeymap !== !1 && t.push(jf.configure(this.options.listKeymap)), this.options.orderedList !== !1 && t.push(Wf.configure(this.options.orderedList)), this.options.taskItem !== !1 && t.push(Uf.configure(this.options.taskItem)), this.options.taskList !== !1 && t.push(Kf.configure(this.options.taskList)), t;
  }
});
var ba = "&nbsp;", ay = " ", cy = L.create({
  name: "paragraph",
  priority: 1e3,
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: "p" }];
  },
  renderHTML({ HTMLAttributes: t }) {
    return ["p", q(this.options.HTMLAttributes, t), 0];
  },
  parseMarkdown: (t, e) => {
    const n = t.tokens || [];
    if (n.length === 1 && n[0].type === "image")
      return e.parseChildren([n[0]]);
    const r = e.parseInline(n);
    return r.length === 1 && r[0].type === "text" && (r[0].text === ba || r[0].text === ay) ? e.createNode("paragraph", void 0, []) : e.createNode("paragraph", void 0, r);
  },
  renderMarkdown: (t, e) => {
    if (!t)
      return "";
    const n = Array.isArray(t.content) ? t.content : [];
    return n.length === 0 ? ba : e.renderChildren(n);
  },
  addCommands() {
    return {
      setParagraph: () => ({ commands: t }) => t.setNode(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-0": () => this.editor.commands.setParagraph()
    };
  }
}), dy = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))$/, fy = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))/g, hy = ve.create({
  name: "strike",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  parseHTML() {
    return [
      {
        tag: "s"
      },
      {
        tag: "del"
      },
      {
        tag: "strike"
      },
      {
        style: "text-decoration",
        consuming: !1,
        getAttrs: (t) => t.includes("line-through") ? {} : !1
      }
    ];
  },
  renderHTML({ HTMLAttributes: t }) {
    return ["s", q(this.options.HTMLAttributes, t), 0];
  },
  markdownTokenName: "del",
  parseMarkdown: (t, e) => e.applyMark("strike", e.parseInline(t.tokens || [])),
  renderMarkdown: (t, e) => `~~${e.renderChildren(t)}~~`,
  addCommands() {
    return {
      setStrike: () => ({ commands: t }) => t.setMark(this.name),
      toggleStrike: () => ({ commands: t }) => t.toggleMark(this.name),
      unsetStrike: () => ({ commands: t }) => t.unsetMark(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-s": () => this.editor.commands.toggleStrike()
    };
  },
  addInputRules() {
    return [
      bn({
        find: dy,
        type: this.type
      })
    ];
  },
  addPasteRules() {
    return [
      Gt({
        find: fy,
        type: this.type
      })
    ];
  }
}), py = L.create({
  name: "text",
  group: "inline",
  parseMarkdown: (t) => ({
    type: "text",
    text: t.text || ""
  }),
  renderMarkdown: (t) => t.text || ""
}), my = ve.create({
  name: "underline",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  parseHTML() {
    return [
      {
        tag: "u"
      },
      {
        style: "text-decoration",
        consuming: !1,
        getAttrs: (t) => t.includes("underline") ? {} : !1
      }
    ];
  },
  renderHTML({ HTMLAttributes: t }) {
    return ["u", q(this.options.HTMLAttributes, t), 0];
  },
  parseMarkdown(t, e) {
    return e.applyMark(this.name || "underline", e.parseInline(t.tokens || []));
  },
  renderMarkdown(t, e) {
    return `++${e.renderChildren(t)}++`;
  },
  markdownTokenizer: {
    name: "underline",
    level: "inline",
    start(t) {
      return t.indexOf("++");
    },
    tokenize(t, e, n) {
      const i = /^(\+\+)([\s\S]+?)(\+\+)/.exec(t);
      if (!i)
        return;
      const o = i[2].trim();
      return {
        type: "underline",
        raw: i[0],
        text: o,
        tokens: n.inlineTokens(o)
      };
    }
  },
  addCommands() {
    return {
      setUnderline: () => ({ commands: t }) => t.setMark(this.name),
      toggleUnderline: () => ({ commands: t }) => t.toggleMark(this.name),
      unsetUnderline: () => ({ commands: t }) => t.unsetMark(this.name)
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-u": () => this.editor.commands.toggleUnderline(),
      "Mod-U": () => this.editor.commands.toggleUnderline()
    };
  }
});
function gy(t = {}) {
  return new H({
    view(e) {
      return new by(e, t);
    }
  });
}
class by {
  constructor(e, n) {
    var r;
    this.editorView = e, this.cursorPos = null, this.element = null, this.timeout = -1, this.width = (r = n.width) !== null && r !== void 0 ? r : 1, this.color = n.color === !1 ? void 0 : n.color || "black", this.class = n.class, this.handlers = ["dragover", "dragend", "drop", "dragleave"].map((i) => {
      let o = (s) => {
        this[i](s);
      };
      return e.dom.addEventListener(i, o), { name: i, handler: o };
    });
  }
  destroy() {
    this.handlers.forEach(({ name: e, handler: n }) => this.editorView.dom.removeEventListener(e, n));
  }
  update(e, n) {
    this.cursorPos != null && n.doc != e.state.doc && (this.cursorPos > e.state.doc.content.size ? this.setCursor(null) : this.updateOverlay());
  }
  setCursor(e) {
    e != this.cursorPos && (this.cursorPos = e, e == null ? (this.element.parentNode.removeChild(this.element), this.element = null) : this.updateOverlay());
  }
  updateOverlay() {
    let e = this.editorView.state.doc.resolve(this.cursorPos), n = !e.parent.inlineContent, r, i = this.editorView.dom, o = i.getBoundingClientRect(), s = o.width / i.offsetWidth, u = o.height / i.offsetHeight;
    if (n) {
      let d = e.nodeBefore, f = e.nodeAfter;
      if (d || f) {
        let h = this.editorView.nodeDOM(this.cursorPos - (d ? d.nodeSize : 0));
        if (h) {
          let p = h.getBoundingClientRect(), m = d ? p.bottom : p.top;
          d && f && (m = (m + this.editorView.nodeDOM(this.cursorPos).getBoundingClientRect().top) / 2);
          let g = this.width / 2 * u;
          r = { left: p.left, right: p.right, top: m - g, bottom: m + g };
        }
      }
    }
    if (!r) {
      let d = this.editorView.coordsAtPos(this.cursorPos), f = this.width / 2 * s;
      r = { left: d.left - f, right: d.left + f, top: d.top, bottom: d.bottom };
    }
    let l = this.editorView.dom.offsetParent;
    this.element || (this.element = l.appendChild(document.createElement("div")), this.class && (this.element.className = this.class), this.element.style.cssText = "position: absolute; z-index: 50; pointer-events: none;", this.color && (this.element.style.backgroundColor = this.color)), this.element.classList.toggle("prosemirror-dropcursor-block", n), this.element.classList.toggle("prosemirror-dropcursor-inline", !n);
    let a, c;
    if (!l || l == document.body && getComputedStyle(l).position == "static")
      a = -pageXOffset, c = -pageYOffset;
    else {
      let d = l.getBoundingClientRect(), f = d.width / l.offsetWidth, h = d.height / l.offsetHeight;
      a = d.left - l.scrollLeft * f, c = d.top - l.scrollTop * h;
    }
    this.element.style.left = (r.left - a) / s + "px", this.element.style.top = (r.top - c) / u + "px", this.element.style.width = (r.right - r.left) / s + "px", this.element.style.height = (r.bottom - r.top) / u + "px";
  }
  scheduleRemoval(e) {
    clearTimeout(this.timeout), this.timeout = setTimeout(() => this.setCursor(null), e);
  }
  dragover(e) {
    if (!this.editorView.editable)
      return;
    let n = this.editorView.posAtCoords({ left: e.clientX, top: e.clientY }), r = n && n.inside >= 0 && this.editorView.state.doc.nodeAt(n.inside), i = r && r.type.spec.disableDropCursor, o = typeof i == "function" ? i(this.editorView, n, e) : i;
    if (n && !o) {
      let s = n.pos;
      if (this.editorView.dragging && this.editorView.dragging.slice) {
        let u = Pc(this.editorView.state.doc, s, this.editorView.dragging.slice);
        u != null && (s = u);
      }
      this.setCursor(s), this.scheduleRemoval(5e3);
    }
  }
  dragend() {
    this.scheduleRemoval(20);
  }
  drop() {
    this.scheduleRemoval(20);
  }
  dragleave(e) {
    this.editorView.dom.contains(e.relatedTarget) || this.setCursor(null);
  }
}
class K extends O {
  /**
  Create a gap cursor.
  */
  constructor(e) {
    super(e, e);
  }
  map(e, n) {
    let r = e.resolve(n.map(this.head));
    return K.valid(r) ? new K(r) : O.near(r);
  }
  content() {
    return v.empty;
  }
  eq(e) {
    return e instanceof K && e.head == this.head;
  }
  toJSON() {
    return { type: "gapcursor", pos: this.head };
  }
  /**
  @internal
  */
  static fromJSON(e, n) {
    if (typeof n.pos != "number")
      throw new RangeError("Invalid input for GapCursor.fromJSON");
    return new K(e.resolve(n.pos));
  }
  /**
  @internal
  */
  getBookmark() {
    return new Mu(this.anchor);
  }
  /**
  @internal
  */
  static valid(e) {
    let n = e.parent;
    if (n.isTextblock || !yy(e) || !ky(e))
      return !1;
    let r = n.type.spec.allowGapCursor;
    if (r != null)
      return r;
    let i = n.contentMatchAt(e.index()).defaultType;
    return i && i.isTextblock;
  }
  /**
  @internal
  */
  static findGapCursorFrom(e, n, r = !1) {
    e: for (; ; ) {
      if (!r && K.valid(e))
        return e;
      let i = e.pos, o = null;
      for (let s = e.depth; ; s--) {
        let u = e.node(s);
        if (n > 0 ? e.indexAfter(s) < u.childCount : e.index(s) > 0) {
          o = u.child(n > 0 ? e.indexAfter(s) : e.index(s) - 1);
          break;
        } else if (s == 0)
          return null;
        i += n;
        let l = e.doc.resolve(i);
        if (K.valid(l))
          return l;
      }
      for (; ; ) {
        let s = n > 0 ? o.firstChild : o.lastChild;
        if (!s) {
          if (o.isAtom && !o.isText && !_.isSelectable(o)) {
            e = e.doc.resolve(i + o.nodeSize * n), r = !1;
            continue e;
          }
          break;
        }
        o = s, i += n;
        let u = e.doc.resolve(i);
        if (K.valid(u))
          return u;
      }
      return null;
    }
  }
}
K.prototype.visible = !1;
K.findFrom = K.findGapCursorFrom;
O.jsonID("gapcursor", K);
class Mu {
  constructor(e) {
    this.pos = e;
  }
  map(e) {
    return new Mu(e.map(this.pos));
  }
  resolve(e) {
    let n = e.resolve(this.pos);
    return K.valid(n) ? new K(n) : O.near(n);
  }
}
function Jf(t) {
  return t.isAtom || t.spec.isolating || t.spec.createGapCursor;
}
function yy(t) {
  for (let e = t.depth; e >= 0; e--) {
    let n = t.index(e), r = t.node(e);
    if (n == 0) {
      if (r.type.spec.isolating)
        return !0;
      continue;
    }
    for (let i = r.child(n - 1); ; i = i.lastChild) {
      if (i.childCount == 0 && !i.inlineContent || Jf(i.type))
        return !0;
      if (i.inlineContent)
        return !1;
    }
  }
  return !0;
}
function ky(t) {
  for (let e = t.depth; e >= 0; e--) {
    let n = t.indexAfter(e), r = t.node(e);
    if (n == r.childCount) {
      if (r.type.spec.isolating)
        return !0;
      continue;
    }
    for (let i = r.child(n); ; i = i.firstChild) {
      if (i.childCount == 0 && !i.inlineContent || Jf(i.type))
        return !0;
      if (i.inlineContent)
        return !1;
    }
  }
  return !0;
}
function xy() {
  return new H({
    props: {
      decorations: Sy,
      createSelectionBetween(t, e, n) {
        return e.pos == n.pos && K.valid(n) ? new K(n) : null;
      },
      handleClick: wy,
      handleKeyDown: Cy,
      handleDOMEvents: { beforeinput: Ey }
    }
  });
}
const Cy = su({
  ArrowLeft: Dr("horiz", -1),
  ArrowRight: Dr("horiz", 1),
  ArrowUp: Dr("vert", -1),
  ArrowDown: Dr("vert", 1)
});
function Dr(t, e) {
  const n = t == "vert" ? e > 0 ? "down" : "up" : e > 0 ? "right" : "left";
  return function(r, i, o) {
    let s = r.selection, u = e > 0 ? s.$to : s.$from, l = s.empty;
    if (s instanceof D) {
      if (!o.endOfTextblock(n) || u.depth == 0)
        return !1;
      l = !1, u = r.doc.resolve(e > 0 ? u.after() : u.before());
    }
    let a = K.findGapCursorFrom(u, e, l);
    return a ? (i && i(r.tr.setSelection(new K(a))), !0) : !1;
  };
}
function wy(t, e, n) {
  if (!t || !t.editable)
    return !1;
  let r = t.state.doc.resolve(e);
  if (!K.valid(r))
    return !1;
  let i = t.posAtCoords({ left: n.clientX, top: n.clientY });
  return i && i.inside > -1 && _.isSelectable(t.state.doc.nodeAt(i.inside)) ? !1 : (t.dispatch(t.state.tr.setSelection(new K(r))), !0);
}
function Ey(t, e) {
  if (e.inputType != "insertCompositionText" || !(t.state.selection instanceof K))
    return !1;
  let { $from: n } = t.state.selection, r = n.parent.contentMatchAt(n.index()).findWrapping(t.state.schema.nodes.text);
  if (!r)
    return !1;
  let i = w.empty;
  for (let s = r.length - 1; s >= 0; s--)
    i = w.from(r[s].createAndFill(null, i));
  let o = t.state.tr.replace(n.pos, n.pos, new v(i, 0, 0));
  return o.setSelection(D.near(o.doc.resolve(n.pos + 1))), t.dispatch(o), !1;
}
function Sy(t) {
  if (!(t.selection instanceof K))
    return null;
  let e = document.createElement("div");
  return e.className = "ProseMirror-gapcursor", B.create(t.doc, [re.widget(t.selection.head, e, { key: "gapcursor" })]);
}
var Ii = 200, oe = function() {
};
oe.prototype.append = function(e) {
  return e.length ? (e = oe.from(e), !this.length && e || e.length < Ii && this.leafAppend(e) || this.length < Ii && e.leafPrepend(this) || this.appendInner(e)) : this;
};
oe.prototype.prepend = function(e) {
  return e.length ? oe.from(e).append(this) : this;
};
oe.prototype.appendInner = function(e) {
  return new Ay(this, e);
};
oe.prototype.slice = function(e, n) {
  return e === void 0 && (e = 0), n === void 0 && (n = this.length), e >= n ? oe.empty : this.sliceInner(Math.max(0, e), Math.min(this.length, n));
};
oe.prototype.get = function(e) {
  if (!(e < 0 || e >= this.length))
    return this.getInner(e);
};
oe.prototype.forEach = function(e, n, r) {
  n === void 0 && (n = 0), r === void 0 && (r = this.length), n <= r ? this.forEachInner(e, n, r, 0) : this.forEachInvertedInner(e, n, r, 0);
};
oe.prototype.map = function(e, n, r) {
  n === void 0 && (n = 0), r === void 0 && (r = this.length);
  var i = [];
  return this.forEach(function(o, s) {
    return i.push(e(o, s));
  }, n, r), i;
};
oe.from = function(e) {
  return e instanceof oe ? e : e && e.length ? new Gf(e) : oe.empty;
};
var Gf = /* @__PURE__ */ (function(t) {
  function e(r) {
    t.call(this), this.values = r;
  }
  t && (e.__proto__ = t), e.prototype = Object.create(t && t.prototype), e.prototype.constructor = e;
  var n = { length: { configurable: !0 }, depth: { configurable: !0 } };
  return e.prototype.flatten = function() {
    return this.values;
  }, e.prototype.sliceInner = function(i, o) {
    return i == 0 && o == this.length ? this : new e(this.values.slice(i, o));
  }, e.prototype.getInner = function(i) {
    return this.values[i];
  }, e.prototype.forEachInner = function(i, o, s, u) {
    for (var l = o; l < s; l++)
      if (i(this.values[l], u + l) === !1)
        return !1;
  }, e.prototype.forEachInvertedInner = function(i, o, s, u) {
    for (var l = o - 1; l >= s; l--)
      if (i(this.values[l], u + l) === !1)
        return !1;
  }, e.prototype.leafAppend = function(i) {
    if (this.length + i.length <= Ii)
      return new e(this.values.concat(i.flatten()));
  }, e.prototype.leafPrepend = function(i) {
    if (this.length + i.length <= Ii)
      return new e(i.flatten().concat(this.values));
  }, n.length.get = function() {
    return this.values.length;
  }, n.depth.get = function() {
    return 0;
  }, Object.defineProperties(e.prototype, n), e;
})(oe);
oe.empty = new Gf([]);
var Ay = /* @__PURE__ */ (function(t) {
  function e(n, r) {
    t.call(this), this.left = n, this.right = r, this.length = n.length + r.length, this.depth = Math.max(n.depth, r.depth) + 1;
  }
  return t && (e.__proto__ = t), e.prototype = Object.create(t && t.prototype), e.prototype.constructor = e, e.prototype.flatten = function() {
    return this.left.flatten().concat(this.right.flatten());
  }, e.prototype.getInner = function(r) {
    return r < this.left.length ? this.left.get(r) : this.right.get(r - this.left.length);
  }, e.prototype.forEachInner = function(r, i, o, s) {
    var u = this.left.length;
    if (i < u && this.left.forEachInner(r, i, Math.min(o, u), s) === !1 || o > u && this.right.forEachInner(r, Math.max(i - u, 0), Math.min(this.length, o) - u, s + u) === !1)
      return !1;
  }, e.prototype.forEachInvertedInner = function(r, i, o, s) {
    var u = this.left.length;
    if (i > u && this.right.forEachInvertedInner(r, i - u, Math.max(o, u) - u, s + u) === !1 || o < u && this.left.forEachInvertedInner(r, Math.min(i, u), o, s) === !1)
      return !1;
  }, e.prototype.sliceInner = function(r, i) {
    if (r == 0 && i == this.length)
      return this;
    var o = this.left.length;
    return i <= o ? this.left.slice(r, i) : r >= o ? this.right.slice(r - o, i - o) : this.left.slice(r, o).append(this.right.slice(0, i - o));
  }, e.prototype.leafAppend = function(r) {
    var i = this.right.leafAppend(r);
    if (i)
      return new e(this.left, i);
  }, e.prototype.leafPrepend = function(r) {
    var i = this.left.leafPrepend(r);
    if (i)
      return new e(i, this.right);
  }, e.prototype.appendInner = function(r) {
    return this.left.depth >= Math.max(this.right.depth, r.depth) + 1 ? new e(this.left, new e(this.right, r)) : new e(this, r);
  }, e;
})(oe);
const vy = 500;
class Re {
  constructor(e, n) {
    this.items = e, this.eventCount = n;
  }
  // Pop the latest event off the branch's history and apply it
  // to a document transform.
  popEvent(e, n) {
    if (this.eventCount == 0)
      return null;
    let r = this.items.length;
    for (; ; r--)
      if (this.items.get(r - 1).selection) {
        --r;
        break;
      }
    let i, o;
    n && (i = this.remapping(r, this.items.length), o = i.maps.length);
    let s = e.tr, u, l, a = [], c = [];
    return this.items.forEach((d, f) => {
      if (!d.step) {
        i || (i = this.remapping(r, f + 1), o = i.maps.length), o--, c.push(d);
        return;
      }
      if (i) {
        c.push(new He(d.map));
        let h = d.step.map(i.slice(o)), p;
        h && s.maybeStep(h).doc && (p = s.mapping.maps[s.mapping.maps.length - 1], a.push(new He(p, void 0, void 0, a.length + c.length))), o--, p && i.appendMap(p, o);
      } else
        s.maybeStep(d.step);
      if (d.selection)
        return u = i ? d.selection.map(i.slice(o)) : d.selection, l = new Re(this.items.slice(0, r).append(c.reverse().concat(a)), this.eventCount - 1), !1;
    }, this.items.length, 0), { remaining: l, transform: s, selection: u };
  }
  // Create a new branch with the given transform added.
  addTransform(e, n, r, i) {
    let o = [], s = this.eventCount, u = this.items, l = !i && u.length ? u.get(u.length - 1) : null;
    for (let c = 0; c < e.steps.length; c++) {
      let d = e.steps[c].invert(e.docs[c]), f = new He(e.mapping.maps[c], d, n), h;
      (h = l && l.merge(f)) && (f = h, c ? o.pop() : u = u.slice(0, u.length - 1)), o.push(f), n && (s++, n = void 0), i || (l = f);
    }
    let a = s - r.depth;
    return a > Ty && (u = My(u, a), s -= a), new Re(u.append(o), s);
  }
  remapping(e, n) {
    let r = new Gn();
    return this.items.forEach((i, o) => {
      let s = i.mirrorOffset != null && o - i.mirrorOffset >= e ? r.maps.length - i.mirrorOffset : void 0;
      r.appendMap(i.map, s);
    }, e, n), r;
  }
  addMaps(e) {
    return this.eventCount == 0 ? this : new Re(this.items.append(e.map((n) => new He(n))), this.eventCount);
  }
  // When the collab module receives remote changes, the history has
  // to know about those, so that it can adjust the steps that were
  // rebased on top of the remote changes, and include the position
  // maps for the remote changes in its array of items.
  rebased(e, n) {
    if (!this.eventCount)
      return this;
    let r = [], i = Math.max(0, this.items.length - n), o = e.mapping, s = e.steps.length, u = this.eventCount;
    this.items.forEach((f) => {
      f.selection && u--;
    }, i);
    let l = n;
    this.items.forEach((f) => {
      let h = o.getMirror(--l);
      if (h == null)
        return;
      s = Math.min(s, h);
      let p = o.maps[h];
      if (f.step) {
        let m = e.steps[h].invert(e.docs[h]), g = f.selection && f.selection.map(o.slice(l + 1, h));
        g && u++, r.push(new He(p, m, g));
      } else
        r.push(new He(p));
    }, i);
    let a = [];
    for (let f = n; f < s; f++)
      a.push(new He(o.maps[f]));
    let c = this.items.slice(0, i).append(a).append(r), d = new Re(c, u);
    return d.emptyItemCount() > vy && (d = d.compress(this.items.length - r.length)), d;
  }
  emptyItemCount() {
    let e = 0;
    return this.items.forEach((n) => {
      n.step || e++;
    }), e;
  }
  // Compressing a branch means rewriting it to push the air (map-only
  // items) out. During collaboration, these naturally accumulate
  // because each remote change adds one. The `upto` argument is used
  // to ensure that only the items below a given level are compressed,
  // because `rebased` relies on a clean, untouched set of items in
  // order to associate old items with rebased steps.
  compress(e = this.items.length) {
    let n = this.remapping(0, e), r = n.maps.length, i = [], o = 0;
    return this.items.forEach((s, u) => {
      if (u >= e)
        i.push(s), s.selection && o++;
      else if (s.step) {
        let l = s.step.map(n.slice(r)), a = l && l.getMap();
        if (r--, a && n.appendMap(a, r), l) {
          let c = s.selection && s.selection.map(n.slice(r));
          c && o++;
          let d = new He(a.invert(), l, c), f, h = i.length - 1;
          (f = i.length && i[h].merge(d)) ? i[h] = f : i.push(d);
        }
      } else s.map && r--;
    }, this.items.length, 0), new Re(oe.from(i.reverse()), o);
  }
}
Re.empty = new Re(oe.empty, 0);
function My(t, e) {
  let n;
  return t.forEach((r, i) => {
    if (r.selection && e-- == 0)
      return n = i, !1;
  }), t.slice(n);
}
class He {
  constructor(e, n, r, i) {
    this.map = e, this.step = n, this.selection = r, this.mirrorOffset = i;
  }
  merge(e) {
    if (this.step && e.step && !e.selection) {
      let n = e.step.merge(this.step);
      if (n)
        return new He(n.getMap().invert(), n, this.selection);
    }
  }
}
class ht {
  constructor(e, n, r, i, o) {
    this.done = e, this.undone = n, this.prevRanges = r, this.prevTime = i, this.prevComposition = o;
  }
}
const Ty = 20;
function _y(t, e, n, r) {
  let i = n.getMeta(qt), o;
  if (i)
    return i.historyState;
  n.getMeta(Ny) && (t = new ht(t.done, t.undone, null, 0, -1));
  let s = n.getMeta("appendedTransaction");
  if (n.steps.length == 0)
    return t;
  if (s && s.getMeta(qt))
    return s.getMeta(qt).redo ? new ht(t.done.addTransform(n, void 0, r, Vr(e)), t.undone, ya(n.mapping.maps), t.prevTime, t.prevComposition) : new ht(t.done, t.undone.addTransform(n, void 0, r, Vr(e)), null, t.prevTime, t.prevComposition);
  if (n.getMeta("addToHistory") !== !1 && !(s && s.getMeta("addToHistory") === !1)) {
    let u = n.getMeta("composition"), l = t.prevTime == 0 || !s && t.prevComposition != u && (t.prevTime < (n.time || 0) - r.newGroupDelay || !Dy(n, t.prevRanges)), a = s ? Po(t.prevRanges, n.mapping) : ya(n.mapping.maps);
    return new ht(t.done.addTransform(n, l ? e.selection.getBookmark() : void 0, r, Vr(e)), Re.empty, a, n.time, u ?? t.prevComposition);
  } else return (o = n.getMeta("rebased")) ? new ht(t.done.rebased(n, o), t.undone.rebased(n, o), Po(t.prevRanges, n.mapping), t.prevTime, t.prevComposition) : new ht(t.done.addMaps(n.mapping.maps), t.undone.addMaps(n.mapping.maps), Po(t.prevRanges, n.mapping), t.prevTime, t.prevComposition);
}
function Dy(t, e) {
  if (!e)
    return !1;
  if (!t.docChanged)
    return !0;
  let n = !1;
  return t.mapping.maps[0].forEach((r, i) => {
    for (let o = 0; o < e.length; o += 2)
      r <= e[o + 1] && i >= e[o] && (n = !0);
  }), n;
}
function ya(t) {
  let e = [];
  for (let n = t.length - 1; n >= 0 && e.length == 0; n--)
    t[n].forEach((r, i, o, s) => e.push(o, s));
  return e;
}
function Po(t, e) {
  if (!t)
    return null;
  let n = [];
  for (let r = 0; r < t.length; r += 2) {
    let i = e.map(t[r], 1), o = e.map(t[r + 1], -1);
    i <= o && n.push(i, o);
  }
  return n;
}
function Oy(t, e, n) {
  let r = Vr(e), i = qt.get(e).spec.config, o = (n ? t.undone : t.done).popEvent(e, r);
  if (!o)
    return null;
  let s = o.selection.resolve(o.transform.doc), u = (n ? t.done : t.undone).addTransform(o.transform, e.selection.getBookmark(), i, r), l = new ht(n ? u : o.remaining, n ? o.remaining : u, null, 0, -1);
  return o.transform.setSelection(s).setMeta(qt, { redo: n, historyState: l });
}
let Bo = !1, ka = null;
function Vr(t) {
  let e = t.plugins;
  if (ka != e) {
    Bo = !1, ka = e;
    for (let n = 0; n < e.length; n++)
      if (e[n].spec.historyPreserveItems) {
        Bo = !0;
        break;
      }
  }
  return Bo;
}
const qt = new W("history"), Ny = new W("closeHistory");
function Ry(t = {}) {
  return t = {
    depth: t.depth || 100,
    newGroupDelay: t.newGroupDelay || 500
  }, new H({
    key: qt,
    state: {
      init() {
        return new ht(Re.empty, Re.empty, null, 0, -1);
      },
      apply(e, n, r) {
        return _y(n, r, e, t);
      }
    },
    config: t,
    props: {
      handleDOMEvents: {
        beforeinput(e, n) {
          let r = n.inputType, i = r == "historyUndo" ? Xf : r == "historyRedo" ? Yf : null;
          return !i || !e.editable ? !1 : (n.preventDefault(), i(e.state, e.dispatch));
        }
      }
    }
  });
}
function Zf(t, e) {
  return (n, r) => {
    let i = qt.getState(n);
    if (!i || (t ? i.undone : i.done).eventCount == 0)
      return !1;
    if (r) {
      let o = Oy(i, n, t);
      o && r(e ? o.scrollIntoView() : o);
    }
    return !0;
  };
}
const Xf = Zf(!1, !0), Yf = Zf(!0, !0);
j.create({
  name: "characterCount",
  addOptions() {
    return {
      limit: null,
      mode: "textSize",
      textCounter: (t) => t.length,
      wordCounter: (t) => t.split(" ").filter((e) => e !== "").length
    };
  },
  addStorage() {
    return {
      characters: () => 0,
      words: () => 0
    };
  },
  onBeforeCreate() {
    this.storage.characters = (t) => {
      const e = t?.node || this.editor.state.doc;
      if ((t?.mode || this.options.mode) === "textSize") {
        const r = e.textBetween(0, e.content.size, void 0, " ");
        return this.options.textCounter(r);
      }
      return e.nodeSize;
    }, this.storage.words = (t) => {
      const e = t?.node || this.editor.state.doc, n = e.textBetween(0, e.content.size, " ", " ");
      return this.options.wordCounter(n);
    };
  },
  addProseMirrorPlugins() {
    let t = !1;
    return [
      new H({
        key: new W("characterCount"),
        appendTransaction: (e, n, r) => {
          if (t)
            return;
          const i = this.options.limit;
          if (i == null || i === 0) {
            t = !0;
            return;
          }
          const o = this.storage.characters({ node: r.doc });
          if (o > i) {
            const s = o - i, u = 0, l = s;
            console.warn(
              `[CharacterCount] Initial content exceeded limit of ${i} characters. Content was automatically trimmed.`
            );
            const a = r.tr.deleteRange(u, l);
            return t = !0, a;
          }
          t = !0;
        },
        filterTransaction: (e, n) => {
          const r = this.options.limit;
          if (!e.docChanged || r === 0 || r === null || r === void 0)
            return !0;
          const i = this.storage.characters({ node: n.doc }), o = this.storage.characters({ node: e.doc });
          if (o <= r || i > r && o > r && o <= i)
            return !0;
          if (i > r && o > r && o > i || !e.getMeta("paste"))
            return !1;
          const u = e.selection.$head.pos, l = o - r, a = u - l, c = u;
          return e.deleteRange(a, c), !(this.storage.characters({ node: e.doc }) > r);
        }
      })
    ];
  }
});
var Iy = j.create({
  name: "dropCursor",
  addOptions() {
    return {
      color: "currentColor",
      width: 1,
      class: void 0
    };
  },
  addProseMirrorPlugins() {
    return [gy(this.options)];
  }
});
j.create({
  name: "focus",
  addOptions() {
    return {
      className: "has-focus",
      mode: "all"
    };
  },
  addProseMirrorPlugins() {
    return [
      new H({
        key: new W("focus"),
        props: {
          decorations: ({ doc: t, selection: e }) => {
            const { isEditable: n, isFocused: r } = this.editor, { anchor: i } = e, o = [];
            if (!n || !r)
              return B.create(t, []);
            let s = 0;
            this.options.mode === "deepest" && t.descendants((l, a) => {
              if (l.isText)
                return;
              if (!(i >= a && i <= a + l.nodeSize - 1))
                return !1;
              s += 1;
            });
            let u = 0;
            return t.descendants((l, a) => {
              if (l.isText || !(i >= a && i <= a + l.nodeSize - 1))
                return !1;
              if (u += 1, this.options.mode === "deepest" && s - u > 0 || this.options.mode === "shallowest" && u > 1)
                return this.options.mode === "deepest";
              o.push(
                re.node(a, a + l.nodeSize, {
                  class: this.options.className
                })
              );
            }), B.create(t, o);
          }
        }
      })
    ];
  }
});
var Ly = j.create({
  name: "gapCursor",
  addProseMirrorPlugins() {
    return [xy()];
  },
  extendNodeSchema(t) {
    var e;
    const n = {
      name: t.name,
      options: t.options,
      storage: t.storage
    };
    return {
      allowGapCursor: (e = F(T(t, "allowGapCursor", n))) != null ? e : null
    };
  }
}), xa = "placeholder";
function Fy(t) {
  return t.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").replace(/^[0-9-]+/, "").replace(/^-+/, "").toLowerCase();
}
var Py = j.create({
  name: "placeholder",
  addOptions() {
    return {
      emptyEditorClass: "is-editor-empty",
      emptyNodeClass: "is-empty",
      dataAttribute: xa,
      placeholder: "Write something …",
      showOnlyWhenEditable: !0,
      showOnlyCurrent: !0,
      includeChildren: !1
    };
  },
  addProseMirrorPlugins() {
    const t = this.options.dataAttribute ? `data-${Fy(this.options.dataAttribute)}` : `data-${xa}`;
    return [
      new H({
        key: new W("placeholder"),
        props: {
          decorations: ({ doc: e, selection: n }) => {
            const r = this.editor.isEditable || !this.options.showOnlyWhenEditable, { anchor: i } = n, o = [];
            if (!r)
              return null;
            const s = this.editor.isEmpty;
            return e.descendants((u, l) => {
              const a = i >= l && i <= l + u.nodeSize, c = !u.isLeaf && Xi(u);
              if ((a || !this.options.showOnlyCurrent) && c) {
                const d = [this.options.emptyNodeClass];
                s && d.push(this.options.emptyEditorClass);
                const f = re.node(l, l + u.nodeSize, {
                  class: d.join(" "),
                  [t]: typeof this.options.placeholder == "function" ? this.options.placeholder({
                    editor: this.editor,
                    node: u,
                    pos: l,
                    hasAnchor: a
                  }) : this.options.placeholder
                });
                o.push(f);
              }
              return this.options.includeChildren;
            }), B.create(e, o);
          }
        }
      })
    ];
  }
});
j.create({
  name: "selection",
  addOptions() {
    return {
      className: "selection"
    };
  },
  addProseMirrorPlugins() {
    const { editor: t, options: e } = this;
    return [
      new H({
        key: new W("selection"),
        props: {
          decorations(n) {
            return n.selection.empty || t.isFocused || !t.isEditable || ef(n.selection) || t.view.dragging ? null : B.create(n.doc, [
              re.inline(n.selection.from, n.selection.to, {
                class: e.className
              })
            ]);
          }
        }
      })
    ];
  }
});
function Ca({ types: t, node: e }) {
  return e && Array.isArray(t) && t.includes(e.type) || e?.type === t;
}
var By = j.create({
  name: "trailingNode",
  addOptions() {
    return {
      node: void 0,
      notAfter: []
    };
  },
  addProseMirrorPlugins() {
    var t;
    const e = new W(this.name), n = this.options.node || ((t = this.editor.schema.topNodeType.contentMatch.defaultType) == null ? void 0 : t.name) || "paragraph", r = Object.entries(this.editor.schema.nodes).map(([, i]) => i).filter((i) => (this.options.notAfter || []).concat(n).includes(i.name));
    return [
      new H({
        key: e,
        appendTransaction: (i, o, s) => {
          const { doc: u, tr: l, schema: a } = s, c = e.getState(s), d = u.content.size, f = a.nodes[n];
          if (c)
            return l.insert(d, f.create());
        },
        state: {
          init: (i, o) => {
            const s = o.tr.doc.lastChild;
            return !Ca({ node: s, types: r });
          },
          apply: (i, o) => {
            if (!i.docChanged || i.getMeta("__uniqueIDTransaction"))
              return o;
            const s = i.doc.lastChild;
            return !Ca({ node: s, types: r });
          }
        }
      })
    ];
  }
}), zy = j.create({
  name: "undoRedo",
  addOptions() {
    return {
      depth: 100,
      newGroupDelay: 500
    };
  },
  addCommands() {
    return {
      undo: () => ({ state: t, dispatch: e }) => Xf(t, e),
      redo: () => ({ state: t, dispatch: e }) => Yf(t, e)
    };
  },
  addProseMirrorPlugins() {
    return [Ry(this.options)];
  },
  addKeyboardShortcuts() {
    return {
      "Mod-z": () => this.editor.commands.undo(),
      "Shift-Mod-z": () => this.editor.commands.redo(),
      "Mod-y": () => this.editor.commands.redo(),
      // Russian keyboard layouts
      "Mod-я": () => this.editor.commands.undo(),
      "Shift-Mod-я": () => this.editor.commands.redo()
    };
  }
}), $y = j.create({
  name: "starterKit",
  addExtensions() {
    var t, e, n, r;
    const i = [];
    return this.options.bold !== !1 && i.push(h2.configure(this.options.bold)), this.options.blockquote !== !1 && i.push(l2.configure(this.options.blockquote)), this.options.bulletList !== !1 && i.push(Ff.configure(this.options.bulletList)), this.options.code !== !1 && i.push(g2.configure(this.options.code)), this.options.codeBlock !== !1 && i.push(k2.configure(this.options.codeBlock)), this.options.document !== !1 && i.push(x2.configure(this.options.document)), this.options.dropcursor !== !1 && i.push(Iy.configure(this.options.dropcursor)), this.options.gapcursor !== !1 && i.push(Ly.configure(this.options.gapcursor)), this.options.hardBreak !== !1 && i.push(C2.configure(this.options.hardBreak)), this.options.heading !== !1 && i.push(w2.configure(this.options.heading)), this.options.undoRedo !== !1 && i.push(zy.configure(this.options.undoRedo)), this.options.horizontalRule !== !1 && i.push(E2.configure(this.options.horizontalRule)), this.options.italic !== !1 && i.push(T2.configure(this.options.italic)), this.options.listItem !== !1 && i.push(Pf.configure(this.options.listItem)), this.options.listKeymap !== !1 && i.push(jf.configure((t = this.options) == null ? void 0 : t.listKeymap)), this.options.link !== !1 && i.push(Lf.configure((e = this.options) == null ? void 0 : e.link)), this.options.orderedList !== !1 && i.push(Wf.configure(this.options.orderedList)), this.options.paragraph !== !1 && i.push(cy.configure(this.options.paragraph)), this.options.strike !== !1 && i.push(hy.configure(this.options.strike)), this.options.text !== !1 && i.push(py.configure(this.options.text)), this.options.underline !== !1 && i.push(my.configure((n = this.options) == null ? void 0 : n.underline)), this.options.trailingNode !== !1 && i.push(By.configure((r = this.options) == null ? void 0 : r.trailingNode)), i;
  }
}), Hy = $y;
let _s, Ds;
if (typeof WeakMap < "u") {
  let t = /* @__PURE__ */ new WeakMap();
  _s = (e) => t.get(e), Ds = (e, n) => (t.set(e, n), n);
} else {
  const t = [];
  let n = 0;
  _s = (r) => {
    for (let i = 0; i < t.length; i += 2) if (t[i] == r) return t[i + 1];
  }, Ds = (r, i) => (n == 10 && (n = 0), t[n++] = r, t[n++] = i);
}
var J = class {
  constructor(t, e, n, r) {
    this.width = t, this.height = e, this.map = n, this.problems = r;
  }
  findCell(t) {
    for (let e = 0; e < this.map.length; e++) {
      const n = this.map[e];
      if (n != t) continue;
      const r = e % this.width, i = e / this.width | 0;
      let o = r + 1, s = i + 1;
      for (let u = 1; o < this.width && this.map[e + u] == n; u++) o++;
      for (let u = 1; s < this.height && this.map[e + this.width * u] == n; u++) s++;
      return {
        left: r,
        top: i,
        right: o,
        bottom: s
      };
    }
    throw new RangeError(`No cell with offset ${t} found`);
  }
  colCount(t) {
    for (let e = 0; e < this.map.length; e++) if (this.map[e] == t) return e % this.width;
    throw new RangeError(`No cell with offset ${t} found`);
  }
  nextCell(t, e, n) {
    const { left: r, right: i, top: o, bottom: s } = this.findCell(t);
    return e == "horiz" ? (n < 0 ? r == 0 : i == this.width) ? null : this.map[o * this.width + (n < 0 ? r - 1 : i)] : (n < 0 ? o == 0 : s == this.height) ? null : this.map[r + this.width * (n < 0 ? o - 1 : s)];
  }
  rectBetween(t, e) {
    const { left: n, right: r, top: i, bottom: o } = this.findCell(t), { left: s, right: u, top: l, bottom: a } = this.findCell(e);
    return {
      left: Math.min(n, s),
      top: Math.min(i, l),
      right: Math.max(r, u),
      bottom: Math.max(o, a)
    };
  }
  cellsInRect(t) {
    const e = [], n = {};
    for (let r = t.top; r < t.bottom; r++) for (let i = t.left; i < t.right; i++) {
      const o = r * this.width + i, s = this.map[o];
      n[s] || (n[s] = !0, !(i == t.left && i && this.map[o - 1] == s || r == t.top && r && this.map[o - this.width] == s) && e.push(s));
    }
    return e;
  }
  positionAt(t, e, n) {
    for (let r = 0, i = 0; ; r++) {
      const o = i + n.child(r).nodeSize;
      if (r == t) {
        let s = e + t * this.width;
        const u = (t + 1) * this.width;
        for (; s < u && this.map[s] < i; ) s++;
        return s == u ? o - 1 : this.map[s];
      }
      i = o;
    }
  }
  static get(t) {
    return _s(t) || Ds(t, Vy(t));
  }
};
function Vy(t) {
  if (t.type.spec.tableRole != "table") throw new RangeError("Not a table node: " + t.type.name);
  const e = jy(t), n = t.childCount, r = [];
  let i = 0, o = null;
  const s = [];
  for (let a = 0, c = e * n; a < c; a++) r[a] = 0;
  for (let a = 0, c = 0; a < n; a++) {
    const d = t.child(a);
    c++;
    for (let p = 0; ; p++) {
      for (; i < r.length && r[i] != 0; ) i++;
      if (p == d.childCount) break;
      const m = d.child(p), { colspan: g, rowspan: b, colwidth: y } = m.attrs;
      for (let k = 0; k < b; k++) {
        if (k + a >= n) {
          (o || (o = [])).push({
            type: "overlong_rowspan",
            pos: c,
            n: b - k
          });
          break;
        }
        const C = i + k * e;
        for (let x = 0; x < g; x++) {
          r[C + x] == 0 ? r[C + x] = c : (o || (o = [])).push({
            type: "collision",
            row: a,
            pos: c,
            n: g - x
          });
          const E = y && y[x];
          if (E) {
            const S = (C + x) % e * 2, M = s[S];
            M == null || M != E && s[S + 1] == 1 ? (s[S] = E, s[S + 1] = 1) : M == E && s[S + 1]++;
          }
        }
      }
      i += g, c += m.nodeSize;
    }
    const f = (a + 1) * e;
    let h = 0;
    for (; i < f; ) r[i++] == 0 && h++;
    h && (o || (o = [])).push({
      type: "missing",
      row: a,
      n: h
    }), c++;
  }
  (e === 0 || n === 0) && (o || (o = [])).push({ type: "zero_sized" });
  const u = new J(e, n, r, o);
  let l = !1;
  for (let a = 0; !l && a < s.length; a += 2) s[a] != null && s[a + 1] < n && (l = !0);
  return l && qy(u, s, t), u;
}
function jy(t) {
  let e = -1, n = !1;
  for (let r = 0; r < t.childCount; r++) {
    const i = t.child(r);
    let o = 0;
    if (n) for (let s = 0; s < r; s++) {
      const u = t.child(s);
      for (let l = 0; l < u.childCount; l++) {
        const a = u.child(l);
        s + a.attrs.rowspan > r && (o += a.attrs.colspan);
      }
    }
    for (let s = 0; s < i.childCount; s++) {
      const u = i.child(s);
      o += u.attrs.colspan, u.attrs.rowspan > 1 && (n = !0);
    }
    e == -1 ? e = o : e != o && (e = Math.max(e, o));
  }
  return e;
}
function qy(t, e, n) {
  t.problems || (t.problems = []);
  const r = {};
  for (let i = 0; i < t.map.length; i++) {
    const o = t.map[i];
    if (r[o]) continue;
    r[o] = !0;
    const s = n.nodeAt(o);
    if (!s) throw new RangeError(`No cell with offset ${o} found`);
    let u = null;
    const l = s.attrs;
    for (let a = 0; a < l.colspan; a++) {
      const c = e[(i + a) % t.width * 2];
      c != null && (!l.colwidth || l.colwidth[a] != c) && ((u || (u = Wy(l)))[a] = c);
    }
    u && t.problems.unshift({
      type: "colwidth mismatch",
      pos: o,
      colwidth: u
    });
  }
}
function Wy(t) {
  if (t.colwidth) return t.colwidth.slice();
  const e = [];
  for (let n = 0; n < t.colspan; n++) e.push(0);
  return e;
}
function fe(t) {
  let e = t.cached.tableNodeTypes;
  if (!e) {
    e = t.cached.tableNodeTypes = {};
    for (const n in t.nodes) {
      const r = t.nodes[n], i = r.spec.tableRole;
      i && (e[i] = r);
    }
  }
  return e;
}
const bt = new W("selectingCells");
function Zt(t) {
  for (let e = t.depth - 1; e > 0; e--) if (t.node(e).type.spec.tableRole == "row") return t.node(0).resolve(t.before(e + 1));
  return null;
}
function Uy(t) {
  for (let e = t.depth; e > 0; e--) {
    const n = t.node(e).type.spec.tableRole;
    if (n === "cell" || n === "header_cell") return t.node(e);
  }
  return null;
}
function Le(t) {
  const e = t.selection.$head;
  for (let n = e.depth; n > 0; n--) if (e.node(n).type.spec.tableRole == "row") return !0;
  return !1;
}
function to(t) {
  const e = t.selection;
  if ("$anchorCell" in e && e.$anchorCell) return e.$anchorCell.pos > e.$headCell.pos ? e.$anchorCell : e.$headCell;
  if ("node" in e && e.node && e.node.type.spec.tableRole == "cell") return e.$anchor;
  const n = Zt(e.$head) || Ky(e.$head);
  if (n) return n;
  throw new RangeError(`No cell found around position ${e.head}`);
}
function Ky(t) {
  for (let e = t.nodeAfter, n = t.pos; e; e = e.firstChild, n++) {
    const r = e.type.spec.tableRole;
    if (r == "cell" || r == "header_cell") return t.doc.resolve(n);
  }
  for (let e = t.nodeBefore, n = t.pos; e; e = e.lastChild, n--) {
    const r = e.type.spec.tableRole;
    if (r == "cell" || r == "header_cell") return t.doc.resolve(n - e.nodeSize);
  }
}
function Os(t) {
  return t.parent.type.spec.tableRole == "row" && !!t.nodeAfter;
}
function Jy(t) {
  return t.node(0).resolve(t.pos + t.nodeAfter.nodeSize);
}
function Tu(t, e) {
  return t.depth == e.depth && t.pos >= e.start(-1) && t.pos <= e.end(-1);
}
function Qf(t, e, n) {
  const r = t.node(-1), i = J.get(r), o = t.start(-1), s = i.nextCell(t.pos - o, e, n);
  return s == null ? null : t.node(0).resolve(o + s);
}
function Xt(t, e, n = 1) {
  const r = {
    ...t,
    colspan: t.colspan - n
  };
  return r.colwidth && (r.colwidth = r.colwidth.slice(), r.colwidth.splice(e, n), r.colwidth.some((i) => i > 0) || (r.colwidth = null)), r;
}
function eh(t, e, n = 1) {
  const r = {
    ...t,
    colspan: t.colspan + n
  };
  if (r.colwidth) {
    r.colwidth = r.colwidth.slice();
    for (let i = 0; i < n; i++) r.colwidth.splice(e, 0, 0);
  }
  return r;
}
function Gy(t, e, n) {
  const r = fe(e.type.schema).header_cell;
  for (let i = 0; i < t.height; i++) if (e.nodeAt(t.map[n + i * t.width]).type != r) return !1;
  return !0;
}
var $ = class et extends O {
  constructor(e, n = e) {
    const r = e.node(-1), i = J.get(r), o = e.start(-1), s = i.rectBetween(e.pos - o, n.pos - o), u = e.node(0), l = i.cellsInRect(s).filter((c) => c != n.pos - o);
    l.unshift(n.pos - o);
    const a = l.map((c) => {
      const d = r.nodeAt(c);
      if (!d) throw new RangeError(`No cell with offset ${c} found`);
      const f = o + c + 1;
      return new Vc(u.resolve(f), u.resolve(f + d.content.size));
    });
    super(a[0].$from, a[0].$to, a), this.$anchorCell = e, this.$headCell = n;
  }
  map(e, n) {
    const r = e.resolve(n.map(this.$anchorCell.pos)), i = e.resolve(n.map(this.$headCell.pos));
    if (Os(r) && Os(i) && Tu(r, i)) {
      const o = this.$anchorCell.node(-1) != r.node(-1);
      return o && this.isRowSelection() ? et.rowSelection(r, i) : o && this.isColSelection() ? et.colSelection(r, i) : new et(r, i);
    }
    return D.between(r, i);
  }
  content() {
    const e = this.$anchorCell.node(-1), n = J.get(e), r = this.$anchorCell.start(-1), i = n.rectBetween(this.$anchorCell.pos - r, this.$headCell.pos - r), o = {}, s = [];
    for (let l = i.top; l < i.bottom; l++) {
      const a = [];
      for (let c = l * n.width + i.left, d = i.left; d < i.right; d++, c++) {
        const f = n.map[c];
        if (o[f]) continue;
        o[f] = !0;
        const h = n.findCell(f);
        let p = e.nodeAt(f);
        if (!p) throw new RangeError(`No cell with offset ${f} found`);
        const m = i.left - h.left, g = h.right - i.right;
        if (m > 0 || g > 0) {
          let b = p.attrs;
          if (m > 0 && (b = Xt(b, 0, m)), g > 0 && (b = Xt(b, b.colspan - g, g)), h.left < i.left) {
            if (p = p.type.createAndFill(b), !p) throw new RangeError(`Could not create cell with attrs ${JSON.stringify(b)}`);
          } else p = p.type.create(b, p.content);
        }
        if (h.top < i.top || h.bottom > i.bottom) {
          const b = {
            ...p.attrs,
            rowspan: Math.min(h.bottom, i.bottom) - Math.max(h.top, i.top)
          };
          h.top < i.top ? p = p.type.createAndFill(b) : p = p.type.create(b, p.content);
        }
        a.push(p);
      }
      s.push(e.child(l).copy(w.from(a)));
    }
    const u = this.isColSelection() && this.isRowSelection() ? e : s;
    return new v(w.from(u), 1, 1);
  }
  replace(e, n = v.empty) {
    const r = e.steps.length, i = this.ranges;
    for (let s = 0; s < i.length; s++) {
      const { $from: u, $to: l } = i[s], a = e.mapping.slice(r);
      e.replace(a.map(u.pos), a.map(l.pos), s ? v.empty : n);
    }
    const o = O.findFrom(e.doc.resolve(e.mapping.slice(r).map(this.to)), -1);
    o && e.setSelection(o);
  }
  replaceWith(e, n) {
    this.replace(e, new v(w.from(n), 0, 0));
  }
  forEachCell(e) {
    const n = this.$anchorCell.node(-1), r = J.get(n), i = this.$anchorCell.start(-1), o = r.cellsInRect(r.rectBetween(this.$anchorCell.pos - i, this.$headCell.pos - i));
    for (let s = 0; s < o.length; s++) e(n.nodeAt(o[s]), i + o[s]);
  }
  isColSelection() {
    const e = this.$anchorCell.index(-1), n = this.$headCell.index(-1);
    if (Math.min(e, n) > 0) return !1;
    const r = e + this.$anchorCell.nodeAfter.attrs.rowspan, i = n + this.$headCell.nodeAfter.attrs.rowspan;
    return Math.max(r, i) == this.$headCell.node(-1).childCount;
  }
  static colSelection(e, n = e) {
    const r = e.node(-1), i = J.get(r), o = e.start(-1), s = i.findCell(e.pos - o), u = i.findCell(n.pos - o), l = e.node(0);
    return s.top <= u.top ? (s.top > 0 && (e = l.resolve(o + i.map[s.left])), u.bottom < i.height && (n = l.resolve(o + i.map[i.width * (i.height - 1) + u.right - 1]))) : (u.top > 0 && (n = l.resolve(o + i.map[u.left])), s.bottom < i.height && (e = l.resolve(o + i.map[i.width * (i.height - 1) + s.right - 1]))), new et(e, n);
  }
  isRowSelection() {
    const e = this.$anchorCell.node(-1), n = J.get(e), r = this.$anchorCell.start(-1), i = n.colCount(this.$anchorCell.pos - r), o = n.colCount(this.$headCell.pos - r);
    if (Math.min(i, o) > 0) return !1;
    const s = i + this.$anchorCell.nodeAfter.attrs.colspan, u = o + this.$headCell.nodeAfter.attrs.colspan;
    return Math.max(s, u) == n.width;
  }
  eq(e) {
    return e instanceof et && e.$anchorCell.pos == this.$anchorCell.pos && e.$headCell.pos == this.$headCell.pos;
  }
  static rowSelection(e, n = e) {
    const r = e.node(-1), i = J.get(r), o = e.start(-1), s = i.findCell(e.pos - o), u = i.findCell(n.pos - o), l = e.node(0);
    return s.left <= u.left ? (s.left > 0 && (e = l.resolve(o + i.map[s.top * i.width])), u.right < i.width && (n = l.resolve(o + i.map[i.width * (u.top + 1) - 1]))) : (u.left > 0 && (n = l.resolve(o + i.map[u.top * i.width])), s.right < i.width && (e = l.resolve(o + i.map[i.width * (s.top + 1) - 1]))), new et(e, n);
  }
  toJSON() {
    return {
      type: "cell",
      anchor: this.$anchorCell.pos,
      head: this.$headCell.pos
    };
  }
  static fromJSON(e, n) {
    return new et(e.resolve(n.anchor), e.resolve(n.head));
  }
  static create(e, n, r = n) {
    return new et(e.resolve(n), e.resolve(r));
  }
  getBookmark() {
    return new Zy(this.$anchorCell.pos, this.$headCell.pos);
  }
};
$.prototype.visible = !1;
O.jsonID("cell", $);
var Zy = class th {
  constructor(e, n) {
    this.anchor = e, this.head = n;
  }
  map(e) {
    return new th(e.map(this.anchor), e.map(this.head));
  }
  resolve(e) {
    const n = e.resolve(this.anchor), r = e.resolve(this.head);
    return n.parent.type.spec.tableRole == "row" && r.parent.type.spec.tableRole == "row" && n.index() < n.parent.childCount && r.index() < r.parent.childCount && Tu(n, r) ? new $(n, r) : O.near(r, 1);
  }
};
function Xy(t) {
  if (!(t.selection instanceof $)) return null;
  const e = [];
  return t.selection.forEachCell((n, r) => {
    e.push(re.node(r, r + n.nodeSize, { class: "selectedCell" }));
  }), B.create(t.doc, e);
}
function Yy({ $from: t, $to: e }) {
  if (t.pos == e.pos || t.pos < e.pos - 6) return !1;
  let n = t.pos, r = e.pos, i = t.depth;
  for (; i >= 0 && !(t.after(i + 1) < t.end(i)); i--, n++) ;
  for (let o = e.depth; o >= 0 && !(e.before(o + 1) > e.start(o)); o--, r--) ;
  return n == r && /row|table/.test(t.node(i).type.spec.tableRole);
}
function Qy({ $from: t, $to: e }) {
  let n, r;
  for (let i = t.depth; i > 0; i--) {
    const o = t.node(i);
    if (o.type.spec.tableRole === "cell" || o.type.spec.tableRole === "header_cell") {
      n = o;
      break;
    }
  }
  for (let i = e.depth; i > 0; i--) {
    const o = e.node(i);
    if (o.type.spec.tableRole === "cell" || o.type.spec.tableRole === "header_cell") {
      r = o;
      break;
    }
  }
  return n !== r && e.parentOffset === 0;
}
function ek(t, e, n) {
  const r = (e || t).selection, i = (e || t).doc;
  let o, s;
  if (r instanceof _ && (s = r.node.type.spec.tableRole)) {
    if (s == "cell" || s == "header_cell") o = $.create(i, r.from);
    else if (s == "row") {
      const u = i.resolve(r.from + 1);
      o = $.rowSelection(u, u);
    } else if (!n) {
      const u = J.get(r.node), l = r.from + 1, a = l + u.map[u.width * u.height - 1];
      o = $.create(i, l + 1, a);
    }
  } else r instanceof D && Yy(r) ? o = D.create(i, r.from) : r instanceof D && Qy(r) && (o = D.create(i, r.$from.start(), r.$from.end()));
  return o && (e || (e = t.tr)).setSelection(o), e;
}
const tk = new W("fix-tables");
function nh(t, e, n, r) {
  const i = t.childCount, o = e.childCount;
  e: for (let s = 0, u = 0; s < o; s++) {
    const l = e.child(s);
    for (let a = u, c = Math.min(i, s + 3); a < c; a++) if (t.child(a) == l) {
      u = a + 1, n += l.nodeSize;
      continue e;
    }
    r(l, n), u < i && t.child(u).sameMarkup(l) ? nh(t.child(u), l, n + 1, r) : l.nodesBetween(0, l.content.size, r, n + 1), n += l.nodeSize;
  }
}
function rh(t, e) {
  let n;
  const r = (i, o) => {
    i.type.spec.tableRole == "table" && (n = nk(t, i, o, n));
  };
  return e ? e.doc != t.doc && nh(e.doc, t.doc, 0, r) : t.doc.descendants(r), n;
}
function nk(t, e, n, r) {
  const i = J.get(e);
  if (!i.problems) return r;
  r || (r = t.tr);
  const o = [];
  for (let l = 0; l < i.height; l++) o.push(0);
  for (let l = 0; l < i.problems.length; l++) {
    const a = i.problems[l];
    if (a.type == "collision") {
      const c = e.nodeAt(a.pos);
      if (!c) continue;
      const d = c.attrs;
      for (let f = 0; f < d.rowspan; f++) o[a.row + f] += a.n;
      r.setNodeMarkup(r.mapping.map(n + 1 + a.pos), null, Xt(d, d.colspan - a.n, a.n));
    } else if (a.type == "missing") o[a.row] += a.n;
    else if (a.type == "overlong_rowspan") {
      const c = e.nodeAt(a.pos);
      if (!c) continue;
      r.setNodeMarkup(r.mapping.map(n + 1 + a.pos), null, {
        ...c.attrs,
        rowspan: c.attrs.rowspan - a.n
      });
    } else if (a.type == "colwidth mismatch") {
      const c = e.nodeAt(a.pos);
      if (!c) continue;
      r.setNodeMarkup(r.mapping.map(n + 1 + a.pos), null, {
        ...c.attrs,
        colwidth: a.colwidth
      });
    } else if (a.type == "zero_sized") {
      const c = r.mapping.map(n);
      r.delete(c, c + e.nodeSize);
    }
  }
  let s, u;
  for (let l = 0; l < o.length; l++) o[l] && (s == null && (s = l), u = l);
  for (let l = 0, a = n + 1; l < i.height; l++) {
    const c = e.child(l), d = a + c.nodeSize, f = o[l];
    if (f > 0) {
      let h = "cell";
      c.firstChild && (h = c.firstChild.type.spec.tableRole);
      const p = [];
      for (let g = 0; g < f; g++) {
        const b = fe(t.schema)[h].createAndFill();
        b && p.push(b);
      }
      const m = (l == 0 || s == l - 1) && u == l ? a + 1 : d - 1;
      r.insert(r.mapping.map(m), p);
    }
    a = d;
  }
  return r.setMeta(tk, { fixTables: !0 });
}
function Ue(t) {
  const e = t.selection, n = to(t), r = n.node(-1), i = n.start(-1), o = J.get(r);
  return {
    ...e instanceof $ ? o.rectBetween(e.$anchorCell.pos - i, e.$headCell.pos - i) : o.findCell(n.pos - i),
    tableStart: i,
    map: o,
    table: r
  };
}
function ih(t, { map: e, tableStart: n, table: r }, i) {
  let o = i > 0 ? -1 : 0;
  Gy(e, r, i + o) && (o = i == 0 || i == e.width ? null : 0);
  for (let s = 0; s < e.height; s++) {
    const u = s * e.width + i;
    if (i > 0 && i < e.width && e.map[u - 1] == e.map[u]) {
      const l = e.map[u], a = r.nodeAt(l);
      t.setNodeMarkup(t.mapping.map(n + l), null, eh(a.attrs, i - e.colCount(l))), s += a.attrs.rowspan - 1;
    } else {
      const l = o == null ? fe(r.type.schema).cell : r.nodeAt(e.map[u + o]).type, a = e.positionAt(s, i, r);
      t.insert(t.mapping.map(n + a), l.createAndFill());
    }
  }
  return t;
}
function rk(t, e) {
  if (!Le(t)) return !1;
  if (e) {
    const n = Ue(t);
    e(ih(t.tr, n, n.left));
  }
  return !0;
}
function ik(t, e) {
  if (!Le(t)) return !1;
  if (e) {
    const n = Ue(t);
    e(ih(t.tr, n, n.right));
  }
  return !0;
}
function ok(t, { map: e, table: n, tableStart: r }, i) {
  const o = t.mapping.maps.length;
  for (let s = 0; s < e.height; ) {
    const u = s * e.width + i, l = e.map[u], a = n.nodeAt(l), c = a.attrs;
    if (i > 0 && e.map[u - 1] == l || i < e.width - 1 && e.map[u + 1] == l) t.setNodeMarkup(t.mapping.slice(o).map(r + l), null, Xt(c, i - e.colCount(l)));
    else {
      const d = t.mapping.slice(o).map(r + l);
      t.delete(d, d + a.nodeSize);
    }
    s += c.rowspan;
  }
}
function sk(t, e) {
  if (!Le(t)) return !1;
  if (e) {
    const n = Ue(t), r = t.tr;
    if (n.left == 0 && n.right == n.map.width) return !1;
    for (let i = n.right - 1; ok(r, n, i), i != n.left; i--) {
      const o = n.tableStart ? r.doc.nodeAt(n.tableStart - 1) : r.doc;
      if (!o) throw new RangeError("No table found");
      n.table = o, n.map = J.get(o);
    }
    e(r);
  }
  return !0;
}
function uk(t, e, n) {
  var r;
  const i = fe(e.type.schema).header_cell;
  for (let o = 0; o < t.width; o++) if (((r = e.nodeAt(t.map[o + n * t.width])) === null || r === void 0 ? void 0 : r.type) != i) return !1;
  return !0;
}
function oh(t, { map: e, tableStart: n, table: r }, i) {
  let o = n;
  for (let a = 0; a < i; a++) o += r.child(a).nodeSize;
  const s = [];
  let u = i > 0 ? -1 : 0;
  uk(e, r, i + u) && (u = i == 0 || i == e.height ? null : 0);
  for (let a = 0, c = e.width * i; a < e.width; a++, c++) if (i > 0 && i < e.height && e.map[c] == e.map[c - e.width]) {
    const d = e.map[c], f = r.nodeAt(d).attrs;
    t.setNodeMarkup(n + d, null, {
      ...f,
      rowspan: f.rowspan + 1
    }), a += f.colspan - 1;
  } else {
    var l;
    const d = u == null ? fe(r.type.schema).cell : (l = r.nodeAt(e.map[c + u * e.width])) === null || l === void 0 ? void 0 : l.type, f = d?.createAndFill();
    f && s.push(f);
  }
  return t.insert(o, fe(r.type.schema).row.create(null, s)), t;
}
function lk(t, e) {
  if (!Le(t)) return !1;
  if (e) {
    const n = Ue(t);
    e(oh(t.tr, n, n.top));
  }
  return !0;
}
function ak(t, e) {
  if (!Le(t)) return !1;
  if (e) {
    const n = Ue(t);
    e(oh(t.tr, n, n.bottom));
  }
  return !0;
}
function ck(t, { map: e, table: n, tableStart: r }, i) {
  let o = 0;
  for (let a = 0; a < i; a++) o += n.child(a).nodeSize;
  const s = o + n.child(i).nodeSize, u = t.mapping.maps.length;
  t.delete(o + r, s + r);
  const l = /* @__PURE__ */ new Set();
  for (let a = 0, c = i * e.width; a < e.width; a++, c++) {
    const d = e.map[c];
    if (!l.has(d)) {
      if (l.add(d), i > 0 && d == e.map[c - e.width]) {
        const f = n.nodeAt(d).attrs;
        t.setNodeMarkup(t.mapping.slice(u).map(d + r), null, {
          ...f,
          rowspan: f.rowspan - 1
        }), a += f.colspan - 1;
      } else if (i < e.height && d == e.map[c + e.width]) {
        const f = n.nodeAt(d), h = f.attrs, p = f.type.create({
          ...h,
          rowspan: f.attrs.rowspan - 1
        }, f.content), m = e.positionAt(i + 1, a, n);
        t.insert(t.mapping.slice(u).map(r + m), p), a += h.colspan - 1;
      }
    }
  }
}
function dk(t, e) {
  if (!Le(t)) return !1;
  if (e) {
    const n = Ue(t), r = t.tr;
    if (n.top == 0 && n.bottom == n.map.height) return !1;
    for (let i = n.bottom - 1; ck(r, n, i), i != n.top; i--) {
      const o = n.tableStart ? r.doc.nodeAt(n.tableStart - 1) : r.doc;
      if (!o) throw new RangeError("No table found");
      n.table = o, n.map = J.get(n.table);
    }
    e(r);
  }
  return !0;
}
function wa(t) {
  const e = t.content;
  return e.childCount == 1 && e.child(0).isTextblock && e.child(0).childCount == 0;
}
function fk({ width: t, height: e, map: n }, r) {
  let i = r.top * t + r.left, o = i, s = (r.bottom - 1) * t + r.left, u = i + (r.right - r.left - 1);
  for (let l = r.top; l < r.bottom; l++) {
    if (r.left > 0 && n[o] == n[o - 1] || r.right < t && n[u] == n[u + 1]) return !0;
    o += t, u += t;
  }
  for (let l = r.left; l < r.right; l++) {
    if (r.top > 0 && n[i] == n[i - t] || r.bottom < e && n[s] == n[s + t]) return !0;
    i++, s++;
  }
  return !1;
}
function Ea(t, e) {
  const n = t.selection;
  if (!(n instanceof $) || n.$anchorCell.pos == n.$headCell.pos) return !1;
  const r = Ue(t), { map: i } = r;
  if (fk(i, r)) return !1;
  if (e) {
    const o = t.tr, s = {};
    let u = w.empty, l, a;
    for (let c = r.top; c < r.bottom; c++) for (let d = r.left; d < r.right; d++) {
      const f = i.map[c * i.width + d], h = r.table.nodeAt(f);
      if (!(s[f] || !h))
        if (s[f] = !0, l == null)
          l = f, a = h;
        else {
          wa(h) || (u = u.append(h.content));
          const p = o.mapping.map(f + r.tableStart);
          o.delete(p, p + h.nodeSize);
        }
    }
    if (l == null || a == null) return !0;
    if (o.setNodeMarkup(l + r.tableStart, null, {
      ...eh(a.attrs, a.attrs.colspan, r.right - r.left - a.attrs.colspan),
      rowspan: r.bottom - r.top
    }), u.size > 0) {
      const c = l + 1 + a.content.size, d = wa(a) ? l + 1 : c;
      o.replaceWith(d + r.tableStart, c + r.tableStart, u);
    }
    o.setSelection(new $(o.doc.resolve(l + r.tableStart))), e(o);
  }
  return !0;
}
function Sa(t, e) {
  const n = fe(t.schema);
  return hk(({ node: r }) => n[r.type.spec.tableRole])(t, e);
}
function hk(t) {
  return (e, n) => {
    const r = e.selection;
    let i, o;
    if (r instanceof $) {
      if (r.$anchorCell.pos != r.$headCell.pos) return !1;
      i = r.$anchorCell.nodeAfter, o = r.$anchorCell.pos;
    } else {
      var s;
      if (i = Uy(r.$from), !i) return !1;
      o = (s = Zt(r.$from)) === null || s === void 0 ? void 0 : s.pos;
    }
    if (i == null || o == null || i.attrs.colspan == 1 && i.attrs.rowspan == 1) return !1;
    if (n) {
      let u = i.attrs;
      const l = [], a = u.colwidth;
      u.rowspan > 1 && (u = {
        ...u,
        rowspan: 1
      }), u.colspan > 1 && (u = {
        ...u,
        colspan: 1
      });
      const c = Ue(e), d = e.tr;
      for (let h = 0; h < c.right - c.left; h++) l.push(a ? {
        ...u,
        colwidth: a && a[h] ? [a[h]] : null
      } : u);
      let f;
      for (let h = c.top; h < c.bottom; h++) {
        let p = c.map.positionAt(h, c.left, c.table);
        h == c.top && (p += i.nodeSize);
        for (let m = c.left, g = 0; m < c.right; m++, g++)
          m == c.left && h == c.top || d.insert(f = d.mapping.map(p + c.tableStart, 1), t({
            node: i,
            row: h,
            col: m
          }).createAndFill(l[g]));
      }
      d.setNodeMarkup(o, t({
        node: i,
        row: c.top,
        col: c.left
      }), l[0]), r instanceof $ && d.setSelection(new $(d.doc.resolve(r.$anchorCell.pos), f ? d.doc.resolve(f) : void 0)), n(d);
    }
    return !0;
  };
}
function pk(t, e) {
  return function(n, r) {
    if (!Le(n)) return !1;
    const i = to(n);
    if (i.nodeAfter.attrs[t] === e) return !1;
    if (r) {
      const o = n.tr;
      n.selection instanceof $ ? n.selection.forEachCell((s, u) => {
        s.attrs[t] !== e && o.setNodeMarkup(u, null, {
          ...s.attrs,
          [t]: e
        });
      }) : o.setNodeMarkup(i.pos, null, {
        ...i.nodeAfter.attrs,
        [t]: e
      }), r(o);
    }
    return !0;
  };
}
function mk(t) {
  return function(e, n) {
    if (!Le(e)) return !1;
    if (n) {
      const r = fe(e.schema), i = Ue(e), o = e.tr, s = i.map.cellsInRect(t == "column" ? {
        left: i.left,
        top: 0,
        right: i.right,
        bottom: i.map.height
      } : t == "row" ? {
        left: 0,
        top: i.top,
        right: i.map.width,
        bottom: i.bottom
      } : i), u = s.map((l) => i.table.nodeAt(l));
      for (let l = 0; l < s.length; l++) u[l].type == r.header_cell && o.setNodeMarkup(i.tableStart + s[l], r.cell, u[l].attrs);
      if (o.steps.length === 0) for (let l = 0; l < s.length; l++) o.setNodeMarkup(i.tableStart + s[l], r.header_cell, u[l].attrs);
      n(o);
    }
    return !0;
  };
}
function Aa(t, e, n) {
  const r = e.map.cellsInRect({
    left: 0,
    top: 0,
    right: t == "row" ? e.map.width : 1,
    bottom: t == "column" ? e.map.height : 1
  });
  for (let i = 0; i < r.length; i++) {
    const o = e.table.nodeAt(r[i]);
    if (o && o.type !== n.header_cell) return !1;
  }
  return !0;
}
function ir(t, e) {
  return e = e || { useDeprecatedLogic: !1 }, e.useDeprecatedLogic ? mk(t) : function(n, r) {
    if (!Le(n)) return !1;
    if (r) {
      const i = fe(n.schema), o = Ue(n), s = n.tr, u = Aa("row", o, i), l = Aa("column", o, i), a = (t === "column" ? u : t === "row" && l) ? 1 : 0, c = t == "column" ? {
        left: 0,
        top: a,
        right: 1,
        bottom: o.map.height
      } : t == "row" ? {
        left: a,
        top: 0,
        right: o.map.width,
        bottom: 1
      } : o, d = t == "column" ? l ? i.cell : i.header_cell : t == "row" ? u ? i.cell : i.header_cell : i.cell;
      o.map.cellsInRect(c).forEach((f) => {
        const h = f + o.tableStart, p = s.doc.nodeAt(h);
        p && s.setNodeMarkup(h, d, p.attrs);
      }), r(s);
    }
    return !0;
  };
}
ir("row", { useDeprecatedLogic: !0 });
ir("column", { useDeprecatedLogic: !0 });
const gk = ir("cell", { useDeprecatedLogic: !0 });
function bk(t, e) {
  if (e < 0) {
    const n = t.nodeBefore;
    if (n) return t.pos - n.nodeSize;
    for (let r = t.index(-1) - 1, i = t.before(); r >= 0; r--) {
      const o = t.node(-1).child(r), s = o.lastChild;
      if (s) return i - 1 - s.nodeSize;
      i -= o.nodeSize;
    }
  } else {
    if (t.index() < t.parent.childCount - 1) return t.pos + t.nodeAfter.nodeSize;
    const n = t.node(-1);
    for (let r = t.indexAfter(-1), i = t.after(); r < n.childCount; r++) {
      const o = n.child(r);
      if (o.childCount) return i + 1;
      i += o.nodeSize;
    }
  }
  return null;
}
function va(t) {
  return function(e, n) {
    if (!Le(e)) return !1;
    const r = bk(to(e), t);
    if (r == null) return !1;
    if (n) {
      const i = e.doc.resolve(r);
      n(e.tr.setSelection(D.between(i, Jy(i))).scrollIntoView());
    }
    return !0;
  };
}
function yk(t, e) {
  const n = t.selection.$anchor;
  for (let r = n.depth; r > 0; r--) if (n.node(r).type.spec.tableRole == "table")
    return e && e(t.tr.delete(n.before(r), n.after(r)).scrollIntoView()), !0;
  return !1;
}
function Or(t, e) {
  const n = t.selection;
  if (!(n instanceof $)) return !1;
  if (e) {
    const r = t.tr, i = fe(t.schema).cell.createAndFill().content;
    n.forEachCell((o, s) => {
      o.content.eq(i) || r.replace(r.mapping.map(s + 1), r.mapping.map(s + o.nodeSize - 1), new v(i, 0, 0));
    }), r.docChanged && e(r);
  }
  return !0;
}
function kk(t) {
  if (t.size === 0) return null;
  let { content: e, openStart: n, openEnd: r } = t;
  for (; e.childCount == 1 && (n > 0 && r > 0 || e.child(0).type.spec.tableRole == "table"); )
    n--, r--, e = e.child(0).content;
  const i = e.child(0), o = i.type.spec.tableRole, s = i.type.schema, u = [];
  if (o == "row") for (let l = 0; l < e.childCount; l++) {
    let a = e.child(l).content;
    const c = l ? 0 : Math.max(0, n - 1), d = l < e.childCount - 1 ? 0 : Math.max(0, r - 1);
    (c || d) && (a = Ns(fe(s).row, new v(a, c, d)).content), u.push(a);
  }
  else if (o == "cell" || o == "header_cell") u.push(n || r ? Ns(fe(s).row, new v(e, n, r)).content : e);
  else return null;
  return xk(s, u);
}
function xk(t, e) {
  const n = [];
  for (let i = 0; i < e.length; i++) {
    const o = e[i];
    for (let s = o.childCount - 1; s >= 0; s--) {
      const { rowspan: u, colspan: l } = o.child(s).attrs;
      for (let a = i; a < i + u; a++) n[a] = (n[a] || 0) + l;
    }
  }
  let r = 0;
  for (let i = 0; i < n.length; i++) r = Math.max(r, n[i]);
  for (let i = 0; i < n.length; i++)
    if (i >= e.length && e.push(w.empty), n[i] < r) {
      const o = fe(t).cell.createAndFill(), s = [];
      for (let u = n[i]; u < r; u++) s.push(o);
      e[i] = e[i].append(w.from(s));
    }
  return {
    height: e.length,
    width: r,
    rows: e
  };
}
function Ns(t, e) {
  const n = t.createAndFill();
  return new qs(n).replace(0, n.content.size, e).doc;
}
function Ck({ width: t, height: e, rows: n }, r, i) {
  if (t != r) {
    const o = [], s = [];
    for (let u = 0; u < n.length; u++) {
      const l = n[u], a = [];
      for (let c = o[u] || 0, d = 0; c < r; d++) {
        let f = l.child(d % l.childCount);
        c + f.attrs.colspan > r && (f = f.type.createChecked(Xt(f.attrs, f.attrs.colspan, c + f.attrs.colspan - r), f.content)), a.push(f), c += f.attrs.colspan;
        for (let h = 1; h < f.attrs.rowspan; h++) o[u + h] = (o[u + h] || 0) + f.attrs.colspan;
      }
      s.push(w.from(a));
    }
    n = s, t = r;
  }
  if (e != i) {
    const o = [];
    for (let s = 0, u = 0; s < i; s++, u++) {
      const l = [], a = n[u % e];
      for (let c = 0; c < a.childCount; c++) {
        let d = a.child(c);
        s + d.attrs.rowspan > i && (d = d.type.create({
          ...d.attrs,
          rowspan: Math.max(1, i - d.attrs.rowspan)
        }, d.content)), l.push(d);
      }
      o.push(w.from(l));
    }
    n = o, e = i;
  }
  return {
    width: t,
    height: e,
    rows: n
  };
}
function wk(t, e, n, r, i, o, s) {
  const u = t.doc.type.schema, l = fe(u);
  let a, c;
  if (i > e.width) for (let d = 0, f = 0; d < e.height; d++) {
    const h = n.child(d);
    f += h.nodeSize;
    const p = [];
    let m;
    h.lastChild == null || h.lastChild.type == l.cell ? m = a || (a = l.cell.createAndFill()) : m = c || (c = l.header_cell.createAndFill());
    for (let g = e.width; g < i; g++) p.push(m);
    t.insert(t.mapping.slice(s).map(f - 1 + r), p);
  }
  if (o > e.height) {
    const d = [];
    for (let p = 0, m = (e.height - 1) * e.width; p < Math.max(e.width, i); p++) {
      const g = p >= e.width ? !1 : n.nodeAt(e.map[m + p]).type == l.header_cell;
      d.push(g ? c || (c = l.header_cell.createAndFill()) : a || (a = l.cell.createAndFill()));
    }
    const f = l.row.create(null, w.from(d)), h = [];
    for (let p = e.height; p < o; p++) h.push(f);
    t.insert(t.mapping.slice(s).map(r + n.nodeSize - 2), h);
  }
  return !!(a || c);
}
function Ma(t, e, n, r, i, o, s, u) {
  if (s == 0 || s == e.height) return !1;
  let l = !1;
  for (let a = i; a < o; a++) {
    const c = s * e.width + a, d = e.map[c];
    if (e.map[c - e.width] == d) {
      l = !0;
      const f = n.nodeAt(d), { top: h, left: p } = e.findCell(d);
      t.setNodeMarkup(t.mapping.slice(u).map(d + r), null, {
        ...f.attrs,
        rowspan: s - h
      }), t.insert(t.mapping.slice(u).map(e.positionAt(s, p, n)), f.type.createAndFill({
        ...f.attrs,
        rowspan: h + f.attrs.rowspan - s
      })), a += f.attrs.colspan - 1;
    }
  }
  return l;
}
function Ta(t, e, n, r, i, o, s, u) {
  if (s == 0 || s == e.width) return !1;
  let l = !1;
  for (let a = i; a < o; a++) {
    const c = a * e.width + s, d = e.map[c];
    if (e.map[c - 1] == d) {
      l = !0;
      const f = n.nodeAt(d), h = e.colCount(d), p = t.mapping.slice(u).map(d + r);
      t.setNodeMarkup(p, null, Xt(f.attrs, s - h, f.attrs.colspan - (s - h))), t.insert(p + f.nodeSize, f.type.createAndFill(Xt(f.attrs, 0, s - h))), a += f.attrs.rowspan - 1;
    }
  }
  return l;
}
function _a(t, e, n, r, i) {
  let o = n ? t.doc.nodeAt(n - 1) : t.doc;
  if (!o) throw new Error("No table found");
  let s = J.get(o);
  const { top: u, left: l } = r, a = l + i.width, c = u + i.height, d = t.tr;
  let f = 0;
  function h() {
    if (o = n ? d.doc.nodeAt(n - 1) : d.doc, !o) throw new Error("No table found");
    s = J.get(o), f = d.mapping.maps.length;
  }
  wk(d, s, o, n, a, c, f) && h(), Ma(d, s, o, n, l, a, u, f) && h(), Ma(d, s, o, n, l, a, c, f) && h(), Ta(d, s, o, n, u, c, l, f) && h(), Ta(d, s, o, n, u, c, a, f) && h();
  for (let p = u; p < c; p++) {
    const m = s.positionAt(p, l, o), g = s.positionAt(p, a, o);
    d.replace(d.mapping.slice(f).map(m + n), d.mapping.slice(f).map(g + n), new v(i.rows[p - u], 0, 0));
  }
  h(), d.setSelection(new $(d.doc.resolve(n + s.positionAt(u, l, o)), d.doc.resolve(n + s.positionAt(c - 1, a - 1, o)))), e(d);
}
const Ek = su({
  ArrowLeft: Nr("horiz", -1),
  ArrowRight: Nr("horiz", 1),
  ArrowUp: Nr("vert", -1),
  ArrowDown: Nr("vert", 1),
  "Shift-ArrowLeft": Rr("horiz", -1),
  "Shift-ArrowRight": Rr("horiz", 1),
  "Shift-ArrowUp": Rr("vert", -1),
  "Shift-ArrowDown": Rr("vert", 1),
  Backspace: Or,
  "Mod-Backspace": Or,
  Delete: Or,
  "Mod-Delete": Or
});
function jr(t, e, n) {
  return n.eq(t.selection) ? !1 : (e && e(t.tr.setSelection(n).scrollIntoView()), !0);
}
function Nr(t, e) {
  return (n, r, i) => {
    if (!i) return !1;
    const o = n.selection;
    if (o instanceof $) return jr(n, r, O.near(o.$headCell, e));
    if (t != "horiz" && !o.empty) return !1;
    const s = sh(i, t, e);
    if (s == null) return !1;
    if (t == "horiz") return jr(n, r, O.near(n.doc.resolve(o.head + e), e));
    {
      const u = n.doc.resolve(s), l = Qf(u, t, e);
      let a;
      return l ? a = O.near(l, 1) : e < 0 ? a = O.near(n.doc.resolve(u.before(-1)), -1) : a = O.near(n.doc.resolve(u.after(-1)), 1), jr(n, r, a);
    }
  };
}
function Rr(t, e) {
  return (n, r, i) => {
    if (!i) return !1;
    const o = n.selection;
    let s;
    if (o instanceof $) s = o;
    else {
      const l = sh(i, t, e);
      if (l == null) return !1;
      s = new $(n.doc.resolve(l));
    }
    const u = Qf(s.$headCell, t, e);
    return u ? jr(n, r, new $(s.$anchorCell, u)) : !1;
  };
}
function Sk(t, e) {
  const n = t.state.doc, r = Zt(n.resolve(e));
  return r ? (t.dispatch(t.state.tr.setSelection(new $(r))), !0) : !1;
}
function Ak(t, e, n) {
  if (!Le(t.state)) return !1;
  let r = kk(n);
  const i = t.state.selection;
  if (i instanceof $) {
    r || (r = {
      width: 1,
      height: 1,
      rows: [w.from(Ns(fe(t.state.schema).cell, n))]
    });
    const o = i.$anchorCell.node(-1), s = i.$anchorCell.start(-1), u = J.get(o).rectBetween(i.$anchorCell.pos - s, i.$headCell.pos - s);
    return r = Ck(r, u.right - u.left, u.bottom - u.top), _a(t.state, t.dispatch, s, u, r), !0;
  } else if (r) {
    const o = to(t.state), s = o.start(-1);
    return _a(t.state, t.dispatch, s, J.get(o.node(-1)).findCell(o.pos - s), r), !0;
  } else return !1;
}
function vk(t, e) {
  var n;
  if (e.button != 0 || e.ctrlKey || e.metaKey) return;
  const r = Da(t, e.target);
  let i;
  if (e.shiftKey && t.state.selection instanceof $)
    o(t.state.selection.$anchorCell, e), e.preventDefault();
  else if (e.shiftKey && r && (i = Zt(t.state.selection.$anchor)) != null && ((n = zo(t, e)) === null || n === void 0 ? void 0 : n.pos) != i.pos)
    o(i, e), e.preventDefault();
  else if (!r) return;
  function o(l, a) {
    let c = zo(t, a);
    const d = bt.getState(t.state) == null;
    if (!c || !Tu(l, c)) if (d) c = l;
    else return;
    const f = new $(l, c);
    if (d || !t.state.selection.eq(f)) {
      const h = t.state.tr.setSelection(f);
      d && h.setMeta(bt, l.pos), t.dispatch(h);
    }
  }
  function s() {
    t.root.removeEventListener("mouseup", s), t.root.removeEventListener("dragstart", s), t.root.removeEventListener("mousemove", u), bt.getState(t.state) != null && t.dispatch(t.state.tr.setMeta(bt, -1));
  }
  function u(l) {
    const a = l, c = bt.getState(t.state);
    let d;
    if (c != null) d = t.state.doc.resolve(c);
    else if (Da(t, a.target) != r && (d = zo(t, e), !d))
      return s();
    d && o(d, a);
  }
  t.root.addEventListener("mouseup", s), t.root.addEventListener("dragstart", s), t.root.addEventListener("mousemove", u);
}
function sh(t, e, n) {
  if (!(t.state.selection instanceof D)) return null;
  const { $head: r } = t.state.selection;
  for (let i = r.depth - 1; i >= 0; i--) {
    const o = r.node(i);
    if ((n < 0 ? r.index(i) : r.indexAfter(i)) != (n < 0 ? 0 : o.childCount)) return null;
    if (o.type.spec.tableRole == "cell" || o.type.spec.tableRole == "header_cell") {
      const s = r.before(i), u = e == "vert" ? n > 0 ? "down" : "up" : n > 0 ? "right" : "left";
      return t.endOfTextblock(u) ? s : null;
    }
  }
  return null;
}
function Da(t, e) {
  for (; e && e != t.dom; e = e.parentNode) if (e.nodeName == "TD" || e.nodeName == "TH") return e;
  return null;
}
function zo(t, e) {
  const n = t.posAtCoords({
    left: e.clientX,
    top: e.clientY
  });
  if (!n) return null;
  let { inside: r, pos: i } = n;
  return r >= 0 && Zt(t.state.doc.resolve(r)) || Zt(t.state.doc.resolve(i));
}
var Mk = class {
  constructor(e, n) {
    this.node = e, this.defaultCellMinWidth = n, this.dom = document.createElement("div"), this.dom.className = "tableWrapper", this.table = this.dom.appendChild(document.createElement("table")), this.table.style.setProperty("--default-cell-min-width", `${n}px`), this.colgroup = this.table.appendChild(document.createElement("colgroup")), Rs(e, this.colgroup, this.table, n), this.contentDOM = this.table.appendChild(document.createElement("tbody"));
  }
  update(e) {
    return e.type != this.node.type ? !1 : (this.node = e, Rs(e, this.colgroup, this.table, this.defaultCellMinWidth), !0);
  }
  ignoreMutation(e) {
    return e.type == "attributes" && (e.target == this.table || this.colgroup.contains(e.target));
  }
};
function Rs(t, e, n, r, i, o) {
  let s = 0, u = !0, l = e.firstChild;
  const a = t.firstChild;
  if (a) {
    for (let d = 0, f = 0; d < a.childCount; d++) {
      const { colspan: h, colwidth: p } = a.child(d).attrs;
      for (let m = 0; m < h; m++, f++) {
        const g = i == f ? o : p && p[m], b = g ? g + "px" : "";
        if (s += g || r, g || (u = !1), l)
          l.style.width != b && (l.style.width = b), l = l.nextSibling;
        else {
          const y = document.createElement("col");
          y.style.width = b, e.appendChild(y);
        }
      }
    }
    for (; l; ) {
      var c;
      const d = l.nextSibling;
      (c = l.parentNode) === null || c === void 0 || c.removeChild(l), l = d;
    }
    u ? (n.style.width = s + "px", n.style.minWidth = "") : (n.style.width = "", n.style.minWidth = s + "px");
  }
}
const we = new W("tableColumnResizing");
function Tk({ handleWidth: t = 5, cellMinWidth: e = 25, defaultCellMinWidth: n = 100, View: r = Mk, lastColumnResizable: i = !0 } = {}) {
  const o = new H({
    key: we,
    state: {
      init(s, u) {
        var l;
        const a = (l = o.spec) === null || l === void 0 || (l = l.props) === null || l === void 0 ? void 0 : l.nodeViews, c = fe(u.schema).table.name;
        return r && a && (a[c] = (d, f) => new r(d, n, f)), new _k(-1, !1);
      },
      apply(s, u) {
        return u.apply(s);
      }
    },
    props: {
      attributes: (s) => {
        const u = we.getState(s);
        return u && u.activeHandle > -1 ? { class: "resize-cursor" } : {};
      },
      handleDOMEvents: {
        mousemove: (s, u) => {
          Dk(s, u, t, i);
        },
        mouseleave: (s) => {
          Ok(s);
        },
        mousedown: (s, u) => {
          Nk(s, u, e, n);
        }
      },
      decorations: (s) => {
        const u = we.getState(s);
        if (u && u.activeHandle > -1) return Pk(s, u.activeHandle);
      },
      nodeViews: {}
    }
  });
  return o;
}
var _k = class qr {
  constructor(e, n) {
    this.activeHandle = e, this.dragging = n;
  }
  apply(e) {
    const n = this, r = e.getMeta(we);
    if (r && r.setHandle != null) return new qr(r.setHandle, !1);
    if (r && r.setDragging !== void 0) return new qr(n.activeHandle, r.setDragging);
    if (n.activeHandle > -1 && e.docChanged) {
      let i = e.mapping.map(n.activeHandle, -1);
      return Os(e.doc.resolve(i)) || (i = -1), new qr(i, n.dragging);
    }
    return n;
  }
};
function Dk(t, e, n, r) {
  if (!t.editable) return;
  const i = we.getState(t.state);
  if (i && !i.dragging) {
    const o = Ik(e.target);
    let s = -1;
    if (o) {
      const { left: u, right: l } = o.getBoundingClientRect();
      e.clientX - u <= n ? s = Oa(t, e, "left", n) : l - e.clientX <= n && (s = Oa(t, e, "right", n));
    }
    if (s != i.activeHandle) {
      if (!r && s !== -1) {
        const u = t.state.doc.resolve(s), l = u.node(-1), a = J.get(l), c = u.start(-1);
        if (a.colCount(u.pos - c) + u.nodeAfter.attrs.colspan - 1 == a.width - 1) return;
      }
      uh(t, s);
    }
  }
}
function Ok(t) {
  if (!t.editable) return;
  const e = we.getState(t.state);
  e && e.activeHandle > -1 && !e.dragging && uh(t, -1);
}
function Nk(t, e, n, r) {
  var i;
  if (!t.editable) return !1;
  const o = (i = t.dom.ownerDocument.defaultView) !== null && i !== void 0 ? i : window, s = we.getState(t.state);
  if (!s || s.activeHandle == -1 || s.dragging) return !1;
  const u = t.state.doc.nodeAt(s.activeHandle), l = Rk(t, s.activeHandle, u.attrs);
  t.dispatch(t.state.tr.setMeta(we, { setDragging: {
    startX: e.clientX,
    startWidth: l
  } }));
  function a(d) {
    o.removeEventListener("mouseup", a), o.removeEventListener("mousemove", c);
    const f = we.getState(t.state);
    f?.dragging && (Lk(t, f.activeHandle, Na(f.dragging, d, n)), t.dispatch(t.state.tr.setMeta(we, { setDragging: null })));
  }
  function c(d) {
    if (!d.which) return a(d);
    const f = we.getState(t.state);
    if (f && f.dragging) {
      const h = Na(f.dragging, d, n);
      Ra(t, f.activeHandle, h, r);
    }
  }
  return Ra(t, s.activeHandle, l, r), o.addEventListener("mouseup", a), o.addEventListener("mousemove", c), e.preventDefault(), !0;
}
function Rk(t, e, { colspan: n, colwidth: r }) {
  const i = r && r[r.length - 1];
  if (i) return i;
  const o = t.domAtPos(e);
  let s = o.node.childNodes[o.offset].offsetWidth, u = n;
  if (r)
    for (let l = 0; l < n; l++) r[l] && (s -= r[l], u--);
  return s / u;
}
function Ik(t) {
  for (; t && t.nodeName != "TD" && t.nodeName != "TH"; ) t = t.classList && t.classList.contains("ProseMirror") ? null : t.parentNode;
  return t;
}
function Oa(t, e, n, r) {
  const i = n == "right" ? -r : r, o = t.posAtCoords({
    left: e.clientX + i,
    top: e.clientY
  });
  if (!o) return -1;
  const { pos: s } = o, u = Zt(t.state.doc.resolve(s));
  if (!u) return -1;
  if (n == "right") return u.pos;
  const l = J.get(u.node(-1)), a = u.start(-1), c = l.map.indexOf(u.pos - a);
  return c % l.width == 0 ? -1 : a + l.map[c - 1];
}
function Na(t, e, n) {
  const r = e.clientX - t.startX;
  return Math.max(n, t.startWidth + r);
}
function uh(t, e) {
  t.dispatch(t.state.tr.setMeta(we, { setHandle: e }));
}
function Lk(t, e, n) {
  const r = t.state.doc.resolve(e), i = r.node(-1), o = J.get(i), s = r.start(-1), u = o.colCount(r.pos - s) + r.nodeAfter.attrs.colspan - 1, l = t.state.tr;
  for (let a = 0; a < o.height; a++) {
    const c = a * o.width + u;
    if (a && o.map[c] == o.map[c - o.width]) continue;
    const d = o.map[c], f = i.nodeAt(d).attrs, h = f.colspan == 1 ? 0 : u - o.colCount(d);
    if (f.colwidth && f.colwidth[h] == n) continue;
    const p = f.colwidth ? f.colwidth.slice() : Fk(f.colspan);
    p[h] = n, l.setNodeMarkup(s + d, null, {
      ...f,
      colwidth: p
    });
  }
  l.docChanged && t.dispatch(l);
}
function Ra(t, e, n, r) {
  const i = t.state.doc.resolve(e), o = i.node(-1), s = i.start(-1), u = J.get(o).colCount(i.pos - s) + i.nodeAfter.attrs.colspan - 1;
  let l = t.domAtPos(i.start(-1)).node;
  for (; l && l.nodeName != "TABLE"; ) l = l.parentNode;
  l && Rs(o, l.firstChild, l, r, u, n);
}
function Fk(t) {
  return Array(t).fill(0);
}
function Pk(t, e) {
  const n = [], r = t.doc.resolve(e), i = r.node(-1);
  if (!i) return B.empty;
  const o = J.get(i), s = r.start(-1), u = o.colCount(r.pos - s) + r.nodeAfter.attrs.colspan - 1;
  for (let a = 0; a < o.height; a++) {
    const c = u + a * o.width;
    if ((u == o.width - 1 || o.map[c] != o.map[c + 1]) && (a == 0 || o.map[c] != o.map[c - o.width])) {
      var l;
      const d = o.map[c], f = s + d + i.nodeAt(d).nodeSize - 1, h = document.createElement("div");
      h.className = "column-resize-handle", !((l = we.getState(t)) === null || l === void 0) && l.dragging && n.push(re.node(s + d, s + d + i.nodeAt(d).nodeSize, { class: "column-resize-dragging" })), n.push(re.widget(f, h));
    }
  }
  return B.create(t.doc, n);
}
function Bk({ allowTableNodeSelection: t = !1 } = {}) {
  return new H({
    key: bt,
    state: {
      init() {
        return null;
      },
      apply(e, n) {
        const r = e.getMeta(bt);
        if (r != null) return r == -1 ? null : r;
        if (n == null || !e.docChanged) return n;
        const { deleted: i, pos: o } = e.mapping.mapResult(n);
        return i ? null : o;
      }
    },
    props: {
      decorations: Xy,
      handleDOMEvents: { mousedown: vk },
      createSelectionBetween(e) {
        return bt.getState(e.state) != null ? e.state.selection : null;
      },
      handleTripleClick: Sk,
      handleKeyDown: Ek,
      handlePaste: Ak
    },
    appendTransaction(e, n, r) {
      return ek(r, rh(r, n), t);
    }
  });
}
var lh = L.create({
  name: "tableCell",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  content: "block+",
  addAttributes() {
    return {
      colspan: {
        default: 1
      },
      rowspan: {
        default: 1
      },
      colwidth: {
        default: null,
        parseHTML: (t) => {
          var e, n;
          const r = t.getAttribute("colwidth"), i = r ? r.split(",").map((o) => parseInt(o, 10)) : null;
          if (!i) {
            const o = (e = t.closest("table")) == null ? void 0 : e.querySelectorAll("colgroup > col"), s = Array.from(((n = t.parentElement) == null ? void 0 : n.children) || []).indexOf(t);
            if (s && s > -1 && o && o[s]) {
              const u = o[s].getAttribute("width");
              return u ? [parseInt(u, 10)] : null;
            }
          }
          return i;
        }
      }
    };
  },
  tableRole: "cell",
  isolating: !0,
  parseHTML() {
    return [{ tag: "td" }];
  },
  renderHTML({ HTMLAttributes: t }) {
    return ["td", q(this.options.HTMLAttributes, t), 0];
  }
}), ah = L.create({
  name: "tableHeader",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  content: "block+",
  addAttributes() {
    return {
      colspan: {
        default: 1
      },
      rowspan: {
        default: 1
      },
      colwidth: {
        default: null,
        parseHTML: (t) => {
          const e = t.getAttribute("colwidth");
          return e ? e.split(",").map((r) => parseInt(r, 10)) : null;
        }
      }
    };
  },
  tableRole: "header_cell",
  isolating: !0,
  parseHTML() {
    return [{ tag: "th" }];
  },
  renderHTML({ HTMLAttributes: t }) {
    return ["th", q(this.options.HTMLAttributes, t), 0];
  }
}), ch = L.create({
  name: "tableRow",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  content: "(tableCell | tableHeader)*",
  tableRole: "row",
  parseHTML() {
    return [{ tag: "tr" }];
  },
  renderHTML({ HTMLAttributes: t }) {
    return ["tr", q(this.options.HTMLAttributes, t), 0];
  }
});
function Is(t, e) {
  return e ? ["width", `${Math.max(e, t)}px`] : ["min-width", `${t}px`];
}
function Ia(t, e, n, r, i, o) {
  var s;
  let u = 0, l = !0, a = e.firstChild;
  const c = t.firstChild;
  if (c !== null)
    for (let f = 0, h = 0; f < c.childCount; f += 1) {
      const { colspan: p, colwidth: m } = c.child(f).attrs;
      for (let g = 0; g < p; g += 1, h += 1) {
        const b = i === h ? o : m && m[g], y = b ? `${b}px` : "";
        if (u += b || r, b || (l = !1), a) {
          if (a.style.width !== y) {
            const [k, C] = Is(r, b);
            a.style.setProperty(k, C);
          }
          a = a.nextSibling;
        } else {
          const k = document.createElement("col"), [C, x] = Is(r, b);
          k.style.setProperty(C, x), e.appendChild(k);
        }
      }
    }
  for (; a; ) {
    const f = a.nextSibling;
    (s = a.parentNode) == null || s.removeChild(a), a = f;
  }
  const d = t.attrs.style && typeof t.attrs.style == "string" && /\bwidth\s*:/i.test(t.attrs.style);
  l && !d ? (n.style.width = `${u}px`, n.style.minWidth = "") : (n.style.width = "", n.style.minWidth = `${u}px`);
}
var zk = class {
  constructor(t, e) {
    this.node = t, this.cellMinWidth = e, this.dom = document.createElement("div"), this.dom.className = "tableWrapper", this.table = this.dom.appendChild(document.createElement("table")), t.attrs.style && (this.table.style.cssText = t.attrs.style), this.colgroup = this.table.appendChild(document.createElement("colgroup")), Ia(t, this.colgroup, this.table, e), this.contentDOM = this.table.appendChild(document.createElement("tbody"));
  }
  update(t) {
    return t.type !== this.node.type ? !1 : (this.node = t, Ia(t, this.colgroup, this.table, this.cellMinWidth), !0);
  }
  ignoreMutation(t) {
    const e = t.target, n = this.dom.contains(e), r = this.contentDOM.contains(e);
    return !!(n && !r && (t.type === "attributes" || t.type === "childList" || t.type === "characterData"));
  }
};
function $k(t, e, n, r) {
  let i = 0, o = !0;
  const s = [], u = t.firstChild;
  if (!u)
    return {};
  for (let d = 0, f = 0; d < u.childCount; d += 1) {
    const { colspan: h, colwidth: p } = u.child(d).attrs;
    for (let m = 0; m < h; m += 1, f += 1) {
      const g = n === f ? r : p && p[m];
      i += g || e, g || (o = !1);
      const [b, y] = Is(e, g);
      s.push(["col", { style: `${b}: ${y}` }]);
    }
  }
  const l = o ? `${i}px` : "", a = o ? "" : `${i}px`;
  return { colgroup: ["colgroup", {}, ...s], tableWidth: l, tableMinWidth: a };
}
function La(t, e) {
  return t.createAndFill();
}
function Hk(t) {
  if (t.cached.tableNodeTypes)
    return t.cached.tableNodeTypes;
  const e = {};
  return Object.keys(t.nodes).forEach((n) => {
    const r = t.nodes[n];
    r.spec.tableRole && (e[r.spec.tableRole] = r);
  }), t.cached.tableNodeTypes = e, e;
}
function Vk(t, e, n, r, i) {
  const o = Hk(t), s = [], u = [];
  for (let a = 0; a < n; a += 1) {
    const c = La(o.cell);
    if (c && u.push(c), r) {
      const d = La(o.header_cell);
      d && s.push(d);
    }
  }
  const l = [];
  for (let a = 0; a < e; a += 1)
    l.push(o.row.createChecked(null, r && a === 0 ? s : u));
  return o.table.createChecked(null, l);
}
function jk(t) {
  return t instanceof $;
}
var Ir = ({ editor: t }) => {
  const { selection: e } = t.state;
  if (!jk(e))
    return !1;
  let n = 0;
  const r = Ud(e.ranges[0].$from, (o) => o.type.name === "table");
  return r?.node.descendants((o) => {
    if (o.type.name === "table")
      return !1;
    ["tableCell", "tableHeader"].includes(o.type.name) && (n += 1);
  }), n === e.ranges.length ? (t.commands.deleteTable(), !0) : !1;
}, qk = "";
function Wk(t) {
  return (t || "").replace(/\s+/g, " ").trim();
}
function Uk(t, e, n = {}) {
  var r;
  const i = (r = n.cellLineSeparator) != null ? r : qk;
  if (!t || !t.content || t.content.length === 0)
    return "";
  const o = [];
  t.content.forEach((p) => {
    const m = [];
    p.content && p.content.forEach((g) => {
      let b = "";
      g.content && Array.isArray(g.content) && g.content.length > 1 ? b = g.content.map((x) => e.renderChildren(x)).join(i) : b = g.content ? e.renderChildren(g.content) : "";
      const y = Wk(b), k = g.type === "tableHeader";
      m.push({ text: y, isHeader: k });
    }), o.push(m);
  });
  const s = o.reduce((p, m) => Math.max(p, m.length), 0);
  if (s === 0)
    return "";
  const u = new Array(s).fill(0);
  o.forEach((p) => {
    var m;
    for (let g = 0; g < s; g += 1) {
      const y = (((m = p[g]) == null ? void 0 : m.text) || "").length;
      y > u[g] && (u[g] = y), u[g] < 3 && (u[g] = 3);
    }
  });
  const l = (p, m) => p + " ".repeat(Math.max(0, m - p.length)), a = o[0], c = a.some((p) => p.isHeader);
  let d = `
`;
  const f = new Array(s).fill(0).map((p, m) => c && a[m] && a[m].text || "");
  return d += `| ${f.map((p, m) => l(p, u[m])).join(" | ")} |
`, d += `| ${u.map((p) => "-".repeat(Math.max(3, p))).join(" | ")} |
`, (c ? o.slice(1) : o).forEach((p) => {
    d += `| ${new Array(s).fill(0).map((m, g) => l(p[g] && p[g].text || "", u[g])).join(" | ")} |
`;
  }), d;
}
var Kk = Uk, dh = L.create({
  name: "table",
  // @ts-ignore
  addOptions() {
    return {
      HTMLAttributes: {},
      resizable: !1,
      renderWrapper: !1,
      handleWidth: 5,
      cellMinWidth: 25,
      // TODO: fix
      View: zk,
      lastColumnResizable: !0,
      allowTableNodeSelection: !1
    };
  },
  content: "tableRow+",
  tableRole: "table",
  isolating: !0,
  group: "block",
  parseHTML() {
    return [{ tag: "table" }];
  },
  renderHTML({ node: t, HTMLAttributes: e }) {
    const { colgroup: n, tableWidth: r, tableMinWidth: i } = $k(t, this.options.cellMinWidth), o = e.style;
    function s() {
      return o || (r ? `width: ${r}` : `min-width: ${i}`);
    }
    const u = [
      "table",
      q(this.options.HTMLAttributes, e, {
        style: s()
      }),
      n,
      ["tbody", 0]
    ];
    return this.options.renderWrapper ? ["div", { class: "tableWrapper" }, u] : u;
  },
  parseMarkdown: (t, e) => {
    const n = [];
    if (t.header) {
      const r = [];
      t.header.forEach((i) => {
        r.push(e.createNode("tableHeader", {}, [{ type: "paragraph", content: e.parseInline(i.tokens) }]));
      }), n.push(e.createNode("tableRow", {}, r));
    }
    return t.rows && t.rows.forEach((r) => {
      const i = [];
      r.forEach((o) => {
        i.push(e.createNode("tableCell", {}, [{ type: "paragraph", content: e.parseInline(o.tokens) }]));
      }), n.push(e.createNode("tableRow", {}, i));
    }), e.createNode("table", void 0, n);
  },
  renderMarkdown: (t, e) => Kk(t, e),
  addCommands() {
    return {
      insertTable: ({ rows: t = 3, cols: e = 3, withHeaderRow: n = !0 } = {}) => ({ tr: r, dispatch: i, editor: o }) => {
        const s = Vk(o.schema, t, e, n);
        if (i) {
          const u = r.selection.from + 1;
          r.replaceSelectionWith(s).scrollIntoView().setSelection(D.near(r.doc.resolve(u)));
        }
        return !0;
      },
      addColumnBefore: () => ({ state: t, dispatch: e }) => rk(t, e),
      addColumnAfter: () => ({ state: t, dispatch: e }) => ik(t, e),
      deleteColumn: () => ({ state: t, dispatch: e }) => sk(t, e),
      addRowBefore: () => ({ state: t, dispatch: e }) => lk(t, e),
      addRowAfter: () => ({ state: t, dispatch: e }) => ak(t, e),
      deleteRow: () => ({ state: t, dispatch: e }) => dk(t, e),
      deleteTable: () => ({ state: t, dispatch: e }) => yk(t, e),
      mergeCells: () => ({ state: t, dispatch: e }) => Ea(t, e),
      splitCell: () => ({ state: t, dispatch: e }) => Sa(t, e),
      toggleHeaderColumn: () => ({ state: t, dispatch: e }) => ir("column")(t, e),
      toggleHeaderRow: () => ({ state: t, dispatch: e }) => ir("row")(t, e),
      toggleHeaderCell: () => ({ state: t, dispatch: e }) => gk(t, e),
      mergeOrSplit: () => ({ state: t, dispatch: e }) => Ea(t, e) ? !0 : Sa(t, e),
      setCellAttribute: (t, e) => ({ state: n, dispatch: r }) => pk(t, e)(n, r),
      goToNextCell: () => ({ state: t, dispatch: e }) => va(1)(t, e),
      goToPreviousCell: () => ({ state: t, dispatch: e }) => va(-1)(t, e),
      fixTables: () => ({ state: t, dispatch: e }) => (e && rh(t), !0),
      setCellSelection: (t) => ({ tr: e, dispatch: n }) => {
        if (n) {
          const r = $.create(e.doc, t.anchorCell, t.headCell);
          e.setSelection(r);
        }
        return !0;
      }
    };
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.goToNextCell() ? !0 : this.editor.can().addRowAfter() ? this.editor.chain().addRowAfter().goToNextCell().run() : !1,
      "Shift-Tab": () => this.editor.commands.goToPreviousCell(),
      Backspace: Ir,
      "Mod-Backspace": Ir,
      Delete: Ir,
      "Mod-Delete": Ir
    };
  },
  addProseMirrorPlugins() {
    return [
      ...this.options.resizable && this.editor.isEditable ? [
        Tk({
          handleWidth: this.options.handleWidth,
          cellMinWidth: this.options.cellMinWidth,
          defaultCellMinWidth: this.options.cellMinWidth,
          View: this.options.View,
          lastColumnResizable: this.options.lastColumnResizable
        })
      ] : [],
      Bk({
        allowTableNodeSelection: this.options.allowTableNodeSelection
      })
    ];
  },
  extendNodeSchema(t) {
    const e = {
      name: t.name,
      options: t.options,
      storage: t.storage
    };
    return {
      tableRole: F(T(t, "tableRole", e))
    };
  }
});
j.create({
  name: "tableKit",
  addExtensions() {
    const t = [];
    return this.options.table !== !1 && t.push(dh.configure(this.options.table)), this.options.tableCell !== !1 && t.push(lh.configure(this.options.tableCell)), this.options.tableHeader !== !1 && t.push(ah.configure(this.options.tableHeader)), this.options.tableRow !== !1 && t.push(ch.configure(this.options.tableRow)), t;
  }
});
const Fa = {};
function Jk(t) {
  let e = Fa[t];
  if (e)
    return e;
  e = Fa[t] = [];
  for (let n = 0; n < 128; n++) {
    const r = String.fromCharCode(n);
    e.push(r);
  }
  for (let n = 0; n < t.length; n++) {
    const r = t.charCodeAt(n);
    e[r] = "%" + ("0" + r.toString(16).toUpperCase()).slice(-2);
  }
  return e;
}
function kn(t, e) {
  typeof e != "string" && (e = kn.defaultChars);
  const n = Jk(e);
  return t.replace(/(%[a-f0-9]{2})+/gi, function(r) {
    let i = "";
    for (let o = 0, s = r.length; o < s; o += 3) {
      const u = parseInt(r.slice(o + 1, o + 3), 16);
      if (u < 128) {
        i += n[u];
        continue;
      }
      if ((u & 224) === 192 && o + 3 < s) {
        const l = parseInt(r.slice(o + 4, o + 6), 16);
        if ((l & 192) === 128) {
          const a = u << 6 & 1984 | l & 63;
          a < 128 ? i += "��" : i += String.fromCharCode(a), o += 3;
          continue;
        }
      }
      if ((u & 240) === 224 && o + 6 < s) {
        const l = parseInt(r.slice(o + 4, o + 6), 16), a = parseInt(r.slice(o + 7, o + 9), 16);
        if ((l & 192) === 128 && (a & 192) === 128) {
          const c = u << 12 & 61440 | l << 6 & 4032 | a & 63;
          c < 2048 || c >= 55296 && c <= 57343 ? i += "���" : i += String.fromCharCode(c), o += 6;
          continue;
        }
      }
      if ((u & 248) === 240 && o + 9 < s) {
        const l = parseInt(r.slice(o + 4, o + 6), 16), a = parseInt(r.slice(o + 7, o + 9), 16), c = parseInt(r.slice(o + 10, o + 12), 16);
        if ((l & 192) === 128 && (a & 192) === 128 && (c & 192) === 128) {
          let d = u << 18 & 1835008 | l << 12 & 258048 | a << 6 & 4032 | c & 63;
          d < 65536 || d > 1114111 ? i += "����" : (d -= 65536, i += String.fromCharCode(55296 + (d >> 10), 56320 + (d & 1023))), o += 9;
          continue;
        }
      }
      i += "�";
    }
    return i;
  });
}
kn.defaultChars = ";/?:@&=+$,#";
kn.componentChars = "";
const Pa = {};
function Gk(t) {
  let e = Pa[t];
  if (e)
    return e;
  e = Pa[t] = [];
  for (let n = 0; n < 128; n++) {
    const r = String.fromCharCode(n);
    /^[0-9a-z]$/i.test(r) ? e.push(r) : e.push("%" + ("0" + n.toString(16).toUpperCase()).slice(-2));
  }
  for (let n = 0; n < t.length; n++)
    e[t.charCodeAt(n)] = t[n];
  return e;
}
function pr(t, e, n) {
  typeof e != "string" && (n = e, e = pr.defaultChars), typeof n > "u" && (n = !0);
  const r = Gk(e);
  let i = "";
  for (let o = 0, s = t.length; o < s; o++) {
    const u = t.charCodeAt(o);
    if (n && u === 37 && o + 2 < s && /^[0-9a-f]{2}$/i.test(t.slice(o + 1, o + 3))) {
      i += t.slice(o, o + 3), o += 2;
      continue;
    }
    if (u < 128) {
      i += r[u];
      continue;
    }
    if (u >= 55296 && u <= 57343) {
      if (u >= 55296 && u <= 56319 && o + 1 < s) {
        const l = t.charCodeAt(o + 1);
        if (l >= 56320 && l <= 57343) {
          i += encodeURIComponent(t[o] + t[o + 1]), o++;
          continue;
        }
      }
      i += "%EF%BF%BD";
      continue;
    }
    i += encodeURIComponent(t[o]);
  }
  return i;
}
pr.defaultChars = ";/?:@&=+$,-_.!~*'()#";
pr.componentChars = "-_.!~*'()";
function _u(t) {
  let e = "";
  return e += t.protocol || "", e += t.slashes ? "//" : "", e += t.auth ? t.auth + "@" : "", t.hostname && t.hostname.indexOf(":") !== -1 ? e += "[" + t.hostname + "]" : e += t.hostname || "", e += t.port ? ":" + t.port : "", e += t.pathname || "", e += t.search || "", e += t.hash || "", e;
}
function Li() {
  this.protocol = null, this.slashes = null, this.auth = null, this.port = null, this.hostname = null, this.hash = null, this.search = null, this.pathname = null;
}
const Zk = /^([a-z0-9.+-]+:)/i, Xk = /:[0-9]*$/, Yk = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/, Qk = ["<", ">", '"', "`", " ", "\r", `
`, "	"], ex = ["{", "}", "|", "\\", "^", "`"].concat(Qk), tx = ["'"].concat(ex), Ba = ["%", "/", "?", ";", "#"].concat(tx), za = ["/", "?", "#"], nx = 255, $a = /^[+a-z0-9A-Z_-]{0,63}$/, rx = /^([+a-z0-9A-Z_-]{0,63})(.*)$/, Ha = {
  javascript: !0,
  "javascript:": !0
}, Va = {
  http: !0,
  https: !0,
  ftp: !0,
  gopher: !0,
  file: !0,
  "http:": !0,
  "https:": !0,
  "ftp:": !0,
  "gopher:": !0,
  "file:": !0
};
function Du(t, e) {
  if (t && t instanceof Li) return t;
  const n = new Li();
  return n.parse(t, e), n;
}
Li.prototype.parse = function(t, e) {
  let n, r, i, o = t;
  if (o = o.trim(), !e && t.split("#").length === 1) {
    const a = Yk.exec(o);
    if (a)
      return this.pathname = a[1], a[2] && (this.search = a[2]), this;
  }
  let s = Zk.exec(o);
  if (s && (s = s[0], n = s.toLowerCase(), this.protocol = s, o = o.substr(s.length)), (e || s || o.match(/^\/\/[^@\/]+@[^@\/]+/)) && (i = o.substr(0, 2) === "//", i && !(s && Ha[s]) && (o = o.substr(2), this.slashes = !0)), !Ha[s] && (i || s && !Va[s])) {
    let a = -1;
    for (let p = 0; p < za.length; p++)
      r = o.indexOf(za[p]), r !== -1 && (a === -1 || r < a) && (a = r);
    let c, d;
    a === -1 ? d = o.lastIndexOf("@") : d = o.lastIndexOf("@", a), d !== -1 && (c = o.slice(0, d), o = o.slice(d + 1), this.auth = c), a = -1;
    for (let p = 0; p < Ba.length; p++)
      r = o.indexOf(Ba[p]), r !== -1 && (a === -1 || r < a) && (a = r);
    a === -1 && (a = o.length), o[a - 1] === ":" && a--;
    const f = o.slice(0, a);
    o = o.slice(a), this.parseHost(f), this.hostname = this.hostname || "";
    const h = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
    if (!h) {
      const p = this.hostname.split(/\./);
      for (let m = 0, g = p.length; m < g; m++) {
        const b = p[m];
        if (b && !b.match($a)) {
          let y = "";
          for (let k = 0, C = b.length; k < C; k++)
            b.charCodeAt(k) > 127 ? y += "x" : y += b[k];
          if (!y.match($a)) {
            const k = p.slice(0, m), C = p.slice(m + 1), x = b.match(rx);
            x && (k.push(x[1]), C.unshift(x[2])), C.length && (o = C.join(".") + o), this.hostname = k.join(".");
            break;
          }
        }
      }
    }
    this.hostname.length > nx && (this.hostname = ""), h && (this.hostname = this.hostname.substr(1, this.hostname.length - 2));
  }
  const u = o.indexOf("#");
  u !== -1 && (this.hash = o.substr(u), o = o.slice(0, u));
  const l = o.indexOf("?");
  return l !== -1 && (this.search = o.substr(l), o = o.slice(0, l)), o && (this.pathname = o), Va[n] && this.hostname && !this.pathname && (this.pathname = ""), this;
};
Li.prototype.parseHost = function(t) {
  let e = Xk.exec(t);
  e && (e = e[0], e !== ":" && (this.port = e.substr(1)), t = t.substr(0, t.length - e.length)), t && (this.hostname = t);
};
const ix = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  decode: kn,
  encode: pr,
  format: _u,
  parse: Du
}, Symbol.toStringTag, { value: "Module" })), fh = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, hh = /[\0-\x1F\x7F-\x9F]/, ox = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/, Ou = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/, ph = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/, mh = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/, sx = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Any: fh,
  Cc: hh,
  Cf: ox,
  P: Ou,
  S: ph,
  Z: mh
}, Symbol.toStringTag, { value: "Module" })), ux = new Uint16Array(
  // prettier-ignore
  'ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻 ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌'.split("").map((t) => t.charCodeAt(0))
), lx = new Uint16Array(
  // prettier-ignore
  "Ȁaglq	\x1Bɭ\0\0p;䀦os;䀧t;䀾t;䀼uot;䀢".split("").map((t) => t.charCodeAt(0))
);
var $o;
const ax = /* @__PURE__ */ new Map([
  [0, 65533],
  // C1 Unicode control character reference replacements
  [128, 8364],
  [130, 8218],
  [131, 402],
  [132, 8222],
  [133, 8230],
  [134, 8224],
  [135, 8225],
  [136, 710],
  [137, 8240],
  [138, 352],
  [139, 8249],
  [140, 338],
  [142, 381],
  [145, 8216],
  [146, 8217],
  [147, 8220],
  [148, 8221],
  [149, 8226],
  [150, 8211],
  [151, 8212],
  [152, 732],
  [153, 8482],
  [154, 353],
  [155, 8250],
  [156, 339],
  [158, 382],
  [159, 376]
]), cx = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
  ($o = String.fromCodePoint) !== null && $o !== void 0 ? $o : function(t) {
    let e = "";
    return t > 65535 && (t -= 65536, e += String.fromCharCode(t >>> 10 & 1023 | 55296), t = 56320 | t & 1023), e += String.fromCharCode(t), e;
  }
);
function dx(t) {
  var e;
  return t >= 55296 && t <= 57343 || t > 1114111 ? 65533 : (e = ax.get(t)) !== null && e !== void 0 ? e : t;
}
var ne;
(function(t) {
  t[t.NUM = 35] = "NUM", t[t.SEMI = 59] = "SEMI", t[t.EQUALS = 61] = "EQUALS", t[t.ZERO = 48] = "ZERO", t[t.NINE = 57] = "NINE", t[t.LOWER_A = 97] = "LOWER_A", t[t.LOWER_F = 102] = "LOWER_F", t[t.LOWER_X = 120] = "LOWER_X", t[t.LOWER_Z = 122] = "LOWER_Z", t[t.UPPER_A = 65] = "UPPER_A", t[t.UPPER_F = 70] = "UPPER_F", t[t.UPPER_Z = 90] = "UPPER_Z";
})(ne || (ne = {}));
const fx = 32;
var wt;
(function(t) {
  t[t.VALUE_LENGTH = 49152] = "VALUE_LENGTH", t[t.BRANCH_LENGTH = 16256] = "BRANCH_LENGTH", t[t.JUMP_TABLE = 127] = "JUMP_TABLE";
})(wt || (wt = {}));
function Ls(t) {
  return t >= ne.ZERO && t <= ne.NINE;
}
function hx(t) {
  return t >= ne.UPPER_A && t <= ne.UPPER_F || t >= ne.LOWER_A && t <= ne.LOWER_F;
}
function px(t) {
  return t >= ne.UPPER_A && t <= ne.UPPER_Z || t >= ne.LOWER_A && t <= ne.LOWER_Z || Ls(t);
}
function mx(t) {
  return t === ne.EQUALS || px(t);
}
var ee;
(function(t) {
  t[t.EntityStart = 0] = "EntityStart", t[t.NumericStart = 1] = "NumericStart", t[t.NumericDecimal = 2] = "NumericDecimal", t[t.NumericHex = 3] = "NumericHex", t[t.NamedEntity = 4] = "NamedEntity";
})(ee || (ee = {}));
var yt;
(function(t) {
  t[t.Legacy = 0] = "Legacy", t[t.Strict = 1] = "Strict", t[t.Attribute = 2] = "Attribute";
})(yt || (yt = {}));
class gx {
  constructor(e, n, r) {
    this.decodeTree = e, this.emitCodePoint = n, this.errors = r, this.state = ee.EntityStart, this.consumed = 1, this.result = 0, this.treeIndex = 0, this.excess = 1, this.decodeMode = yt.Strict;
  }
  /** Resets the instance to make it reusable. */
  startEntity(e) {
    this.decodeMode = e, this.state = ee.EntityStart, this.result = 0, this.treeIndex = 0, this.excess = 1, this.consumed = 1;
  }
  /**
   * Write an entity to the decoder. This can be called multiple times with partial entities.
   * If the entity is incomplete, the decoder will return -1.
   *
   * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
   * entity is incomplete, and resume when the next string is written.
   *
   * @param string The string containing the entity (or a continuation of the entity).
   * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  write(e, n) {
    switch (this.state) {
      case ee.EntityStart:
        return e.charCodeAt(n) === ne.NUM ? (this.state = ee.NumericStart, this.consumed += 1, this.stateNumericStart(e, n + 1)) : (this.state = ee.NamedEntity, this.stateNamedEntity(e, n));
      case ee.NumericStart:
        return this.stateNumericStart(e, n);
      case ee.NumericDecimal:
        return this.stateNumericDecimal(e, n);
      case ee.NumericHex:
        return this.stateNumericHex(e, n);
      case ee.NamedEntity:
        return this.stateNamedEntity(e, n);
    }
  }
  /**
   * Switches between the numeric decimal and hexadecimal states.
   *
   * Equivalent to the `Numeric character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericStart(e, n) {
    return n >= e.length ? -1 : (e.charCodeAt(n) | fx) === ne.LOWER_X ? (this.state = ee.NumericHex, this.consumed += 1, this.stateNumericHex(e, n + 1)) : (this.state = ee.NumericDecimal, this.stateNumericDecimal(e, n));
  }
  addToNumericResult(e, n, r, i) {
    if (n !== r) {
      const o = r - n;
      this.result = this.result * Math.pow(i, o) + parseInt(e.substr(n, o), i), this.consumed += o;
    }
  }
  /**
   * Parses a hexadecimal numeric entity.
   *
   * Equivalent to the `Hexademical character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericHex(e, n) {
    const r = n;
    for (; n < e.length; ) {
      const i = e.charCodeAt(n);
      if (Ls(i) || hx(i))
        n += 1;
      else
        return this.addToNumericResult(e, r, n, 16), this.emitNumericEntity(i, 3);
    }
    return this.addToNumericResult(e, r, n, 16), -1;
  }
  /**
   * Parses a decimal numeric entity.
   *
   * Equivalent to the `Decimal character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericDecimal(e, n) {
    const r = n;
    for (; n < e.length; ) {
      const i = e.charCodeAt(n);
      if (Ls(i))
        n += 1;
      else
        return this.addToNumericResult(e, r, n, 10), this.emitNumericEntity(i, 2);
    }
    return this.addToNumericResult(e, r, n, 10), -1;
  }
  /**
   * Validate and emit a numeric entity.
   *
   * Implements the logic from the `Hexademical character reference start
   * state` and `Numeric character reference end state` in the HTML spec.
   *
   * @param lastCp The last code point of the entity. Used to see if the
   *               entity was terminated with a semicolon.
   * @param expectedLength The minimum number of characters that should be
   *                       consumed. Used to validate that at least one digit
   *                       was consumed.
   * @returns The number of characters that were consumed.
   */
  emitNumericEntity(e, n) {
    var r;
    if (this.consumed <= n)
      return (r = this.errors) === null || r === void 0 || r.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
    if (e === ne.SEMI)
      this.consumed += 1;
    else if (this.decodeMode === yt.Strict)
      return 0;
    return this.emitCodePoint(dx(this.result), this.consumed), this.errors && (e !== ne.SEMI && this.errors.missingSemicolonAfterCharacterReference(), this.errors.validateNumericCharacterReference(this.result)), this.consumed;
  }
  /**
   * Parses a named entity.
   *
   * Equivalent to the `Named character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNamedEntity(e, n) {
    const { decodeTree: r } = this;
    let i = r[this.treeIndex], o = (i & wt.VALUE_LENGTH) >> 14;
    for (; n < e.length; n++, this.excess++) {
      const s = e.charCodeAt(n);
      if (this.treeIndex = bx(r, i, this.treeIndex + Math.max(1, o), s), this.treeIndex < 0)
        return this.result === 0 || // If we are parsing an attribute
        this.decodeMode === yt.Attribute && // We shouldn't have consumed any characters after the entity,
        (o === 0 || // And there should be no invalid characters.
        mx(s)) ? 0 : this.emitNotTerminatedNamedEntity();
      if (i = r[this.treeIndex], o = (i & wt.VALUE_LENGTH) >> 14, o !== 0) {
        if (s === ne.SEMI)
          return this.emitNamedEntityData(this.treeIndex, o, this.consumed + this.excess);
        this.decodeMode !== yt.Strict && (this.result = this.treeIndex, this.consumed += this.excess, this.excess = 0);
      }
    }
    return -1;
  }
  /**
   * Emit a named entity that was not terminated with a semicolon.
   *
   * @returns The number of characters consumed.
   */
  emitNotTerminatedNamedEntity() {
    var e;
    const { result: n, decodeTree: r } = this, i = (r[n] & wt.VALUE_LENGTH) >> 14;
    return this.emitNamedEntityData(n, i, this.consumed), (e = this.errors) === null || e === void 0 || e.missingSemicolonAfterCharacterReference(), this.consumed;
  }
  /**
   * Emit a named entity.
   *
   * @param result The index of the entity in the decode tree.
   * @param valueLength The number of bytes in the entity.
   * @param consumed The number of characters consumed.
   *
   * @returns The number of characters consumed.
   */
  emitNamedEntityData(e, n, r) {
    const { decodeTree: i } = this;
    return this.emitCodePoint(n === 1 ? i[e] & ~wt.VALUE_LENGTH : i[e + 1], r), n === 3 && this.emitCodePoint(i[e + 2], r), r;
  }
  /**
   * Signal to the parser that the end of the input was reached.
   *
   * Remaining data will be emitted and relevant errors will be produced.
   *
   * @returns The number of characters consumed.
   */
  end() {
    var e;
    switch (this.state) {
      case ee.NamedEntity:
        return this.result !== 0 && (this.decodeMode !== yt.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
      // Otherwise, emit a numeric entity if we have one.
      case ee.NumericDecimal:
        return this.emitNumericEntity(0, 2);
      case ee.NumericHex:
        return this.emitNumericEntity(0, 3);
      case ee.NumericStart:
        return (e = this.errors) === null || e === void 0 || e.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
      case ee.EntityStart:
        return 0;
    }
  }
}
function gh(t) {
  let e = "";
  const n = new gx(t, (r) => e += cx(r));
  return function(i, o) {
    let s = 0, u = 0;
    for (; (u = i.indexOf("&", u)) >= 0; ) {
      e += i.slice(s, u), n.startEntity(o);
      const a = n.write(
        i,
        // Skip the "&"
        u + 1
      );
      if (a < 0) {
        s = u + n.end();
        break;
      }
      s = u + a, u = a === 0 ? s + 1 : s;
    }
    const l = e + i.slice(s);
    return e = "", l;
  };
}
function bx(t, e, n, r) {
  const i = (e & wt.BRANCH_LENGTH) >> 7, o = e & wt.JUMP_TABLE;
  if (i === 0)
    return o !== 0 && r === o ? n : -1;
  if (o) {
    const l = r - o;
    return l < 0 || l >= i ? -1 : t[n + l] - 1;
  }
  let s = n, u = s + i - 1;
  for (; s <= u; ) {
    const l = s + u >>> 1, a = t[l];
    if (a < r)
      s = l + 1;
    else if (a > r)
      u = l - 1;
    else
      return t[l + i];
  }
  return -1;
}
const yx = gh(ux);
gh(lx);
function bh(t, e = yt.Legacy) {
  return yx(t, e);
}
function kx(t) {
  return Object.prototype.toString.call(t);
}
function Nu(t) {
  return kx(t) === "[object String]";
}
const xx = Object.prototype.hasOwnProperty;
function Cx(t, e) {
  return xx.call(t, e);
}
function no(t) {
  return Array.prototype.slice.call(arguments, 1).forEach(function(n) {
    if (n) {
      if (typeof n != "object")
        throw new TypeError(n + "must be object");
      Object.keys(n).forEach(function(r) {
        t[r] = n[r];
      });
    }
  }), t;
}
function yh(t, e, n) {
  return [].concat(t.slice(0, e), n, t.slice(e + 1));
}
function Ru(t) {
  return !(t >= 55296 && t <= 57343 || t >= 64976 && t <= 65007 || (t & 65535) === 65535 || (t & 65535) === 65534 || t >= 0 && t <= 8 || t === 11 || t >= 14 && t <= 31 || t >= 127 && t <= 159 || t > 1114111);
}
function Fi(t) {
  if (t > 65535) {
    t -= 65536;
    const e = 55296 + (t >> 10), n = 56320 + (t & 1023);
    return String.fromCharCode(e, n);
  }
  return String.fromCharCode(t);
}
const kh = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, wx = /&([a-z#][a-z0-9]{1,31});/gi, Ex = new RegExp(kh.source + "|" + wx.source, "gi"), Sx = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;
function Ax(t, e) {
  if (e.charCodeAt(0) === 35 && Sx.test(e)) {
    const r = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return Ru(r) ? Fi(r) : t;
  }
  const n = bh(t);
  return n !== t ? n : t;
}
function vx(t) {
  return t.indexOf("\\") < 0 ? t : t.replace(kh, "$1");
}
function xn(t) {
  return t.indexOf("\\") < 0 && t.indexOf("&") < 0 ? t : t.replace(Ex, function(e, n, r) {
    return n || Ax(e, r);
  });
}
const Mx = /[&<>"]/, Tx = /[&<>"]/g, _x = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function Dx(t) {
  return _x[t];
}
function _t(t) {
  return Mx.test(t) ? t.replace(Tx, Dx) : t;
}
const Ox = /[.?*+^$[\]\\(){}|-]/g;
function Nx(t) {
  return t.replace(Ox, "\\$&");
}
function z(t) {
  switch (t) {
    case 9:
    case 32:
      return !0;
  }
  return !1;
}
function or(t) {
  if (t >= 8192 && t <= 8202)
    return !0;
  switch (t) {
    case 9:
    // \t
    case 10:
    // \n
    case 11:
    // \v
    case 12:
    // \f
    case 13:
    // \r
    case 32:
    case 160:
    case 5760:
    case 8239:
    case 8287:
    case 12288:
      return !0;
  }
  return !1;
}
function sr(t) {
  return Ou.test(t) || ph.test(t);
}
function ur(t) {
  switch (t) {
    case 33:
    case 34:
    case 35:
    case 36:
    case 37:
    case 38:
    case 39:
    case 40:
    case 41:
    case 42:
    case 43:
    case 44:
    case 45:
    case 46:
    case 47:
    case 58:
    case 59:
    case 60:
    case 61:
    case 62:
    case 63:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 124:
    case 125:
    case 126:
      return !0;
    default:
      return !1;
  }
}
function ro(t) {
  return t = t.trim().replace(/\s+/g, " "), "ẞ".toLowerCase() === "Ṿ" && (t = t.replace(/ẞ/g, "ß")), t.toLowerCase().toUpperCase();
}
const Rx = { mdurl: ix, ucmicro: sx }, Ix = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  arrayReplaceAt: yh,
  assign: no,
  escapeHtml: _t,
  escapeRE: Nx,
  fromCodePoint: Fi,
  has: Cx,
  isMdAsciiPunct: ur,
  isPunctChar: sr,
  isSpace: z,
  isString: Nu,
  isValidEntityCode: Ru,
  isWhiteSpace: or,
  lib: Rx,
  normalizeReference: ro,
  unescapeAll: xn,
  unescapeMd: vx
}, Symbol.toStringTag, { value: "Module" }));
function Lx(t, e, n) {
  let r, i, o, s;
  const u = t.posMax, l = t.pos;
  for (t.pos = e + 1, r = 1; t.pos < u; ) {
    if (o = t.src.charCodeAt(t.pos), o === 93 && (r--, r === 0)) {
      i = !0;
      break;
    }
    if (s = t.pos, t.md.inline.skipToken(t), o === 91) {
      if (s === t.pos - 1)
        r++;
      else if (n)
        return t.pos = l, -1;
    }
  }
  let a = -1;
  return i && (a = t.pos), t.pos = l, a;
}
function Fx(t, e, n) {
  let r, i = e;
  const o = {
    ok: !1,
    pos: 0,
    str: ""
  };
  if (t.charCodeAt(i) === 60) {
    for (i++; i < n; ) {
      if (r = t.charCodeAt(i), r === 10 || r === 60)
        return o;
      if (r === 62)
        return o.pos = i + 1, o.str = xn(t.slice(e + 1, i)), o.ok = !0, o;
      if (r === 92 && i + 1 < n) {
        i += 2;
        continue;
      }
      i++;
    }
    return o;
  }
  let s = 0;
  for (; i < n && (r = t.charCodeAt(i), !(r === 32 || r < 32 || r === 127)); ) {
    if (r === 92 && i + 1 < n) {
      if (t.charCodeAt(i + 1) === 32)
        break;
      i += 2;
      continue;
    }
    if (r === 40 && (s++, s > 32))
      return o;
    if (r === 41) {
      if (s === 0)
        break;
      s--;
    }
    i++;
  }
  return e === i || s !== 0 || (o.str = xn(t.slice(e, i)), o.pos = i, o.ok = !0), o;
}
function Px(t, e, n, r) {
  let i, o = e;
  const s = {
    // if `true`, this is a valid link title
    ok: !1,
    // if `true`, this link can be continued on the next line
    can_continue: !1,
    // if `ok`, it's the position of the first character after the closing marker
    pos: 0,
    // if `ok`, it's the unescaped title
    str: "",
    // expected closing marker character code
    marker: 0
  };
  if (r)
    s.str = r.str, s.marker = r.marker;
  else {
    if (o >= n)
      return s;
    let u = t.charCodeAt(o);
    if (u !== 34 && u !== 39 && u !== 40)
      return s;
    e++, o++, u === 40 && (u = 41), s.marker = u;
  }
  for (; o < n; ) {
    if (i = t.charCodeAt(o), i === s.marker)
      return s.pos = o + 1, s.str += xn(t.slice(e, o)), s.ok = !0, s;
    if (i === 40 && s.marker === 41)
      return s;
    i === 92 && o + 1 < n && o++, o++;
  }
  return s.can_continue = !0, s.str += xn(t.slice(e, o)), s;
}
const Bx = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  parseLinkDestination: Fx,
  parseLinkLabel: Lx,
  parseLinkTitle: Px
}, Symbol.toStringTag, { value: "Module" })), Ke = {};
Ke.code_inline = function(t, e, n, r, i) {
  const o = t[e];
  return "<code" + i.renderAttrs(o) + ">" + _t(o.content) + "</code>";
};
Ke.code_block = function(t, e, n, r, i) {
  const o = t[e];
  return "<pre" + i.renderAttrs(o) + "><code>" + _t(t[e].content) + `</code></pre>
`;
};
Ke.fence = function(t, e, n, r, i) {
  const o = t[e], s = o.info ? xn(o.info).trim() : "";
  let u = "", l = "";
  if (s) {
    const c = s.split(/(\s+)/g);
    u = c[0], l = c.slice(2).join("");
  }
  let a;
  if (n.highlight ? a = n.highlight(o.content, u, l) || _t(o.content) : a = _t(o.content), a.indexOf("<pre") === 0)
    return a + `
`;
  if (s) {
    const c = o.attrIndex("class"), d = o.attrs ? o.attrs.slice() : [];
    c < 0 ? d.push(["class", n.langPrefix + u]) : (d[c] = d[c].slice(), d[c][1] += " " + n.langPrefix + u);
    const f = {
      attrs: d
    };
    return `<pre><code${i.renderAttrs(f)}>${a}</code></pre>
`;
  }
  return `<pre><code${i.renderAttrs(o)}>${a}</code></pre>
`;
};
Ke.image = function(t, e, n, r, i) {
  const o = t[e];
  return o.attrs[o.attrIndex("alt")][1] = i.renderInlineAsText(o.children, n, r), i.renderToken(t, e, n);
};
Ke.hardbreak = function(t, e, n) {
  return n.xhtmlOut ? `<br />
` : `<br>
`;
};
Ke.softbreak = function(t, e, n) {
  return n.breaks ? n.xhtmlOut ? `<br />
` : `<br>
` : `
`;
};
Ke.text = function(t, e) {
  return _t(t[e].content);
};
Ke.html_block = function(t, e) {
  return t[e].content;
};
Ke.html_inline = function(t, e) {
  return t[e].content;
};
function wn() {
  this.rules = no({}, Ke);
}
wn.prototype.renderAttrs = function(e) {
  let n, r, i;
  if (!e.attrs)
    return "";
  for (i = "", n = 0, r = e.attrs.length; n < r; n++)
    i += " " + _t(e.attrs[n][0]) + '="' + _t(e.attrs[n][1]) + '"';
  return i;
};
wn.prototype.renderToken = function(e, n, r) {
  const i = e[n];
  let o = "";
  if (i.hidden)
    return "";
  i.block && i.nesting !== -1 && n && e[n - 1].hidden && (o += `
`), o += (i.nesting === -1 ? "</" : "<") + i.tag, o += this.renderAttrs(i), i.nesting === 0 && r.xhtmlOut && (o += " /");
  let s = !1;
  if (i.block && (s = !0, i.nesting === 1 && n + 1 < e.length)) {
    const u = e[n + 1];
    (u.type === "inline" || u.hidden || u.nesting === -1 && u.tag === i.tag) && (s = !1);
  }
  return o += s ? `>
` : ">", o;
};
wn.prototype.renderInline = function(t, e, n) {
  let r = "";
  const i = this.rules;
  for (let o = 0, s = t.length; o < s; o++) {
    const u = t[o].type;
    typeof i[u] < "u" ? r += i[u](t, o, e, n, this) : r += this.renderToken(t, o, e);
  }
  return r;
};
wn.prototype.renderInlineAsText = function(t, e, n) {
  let r = "";
  for (let i = 0, o = t.length; i < o; i++)
    switch (t[i].type) {
      case "text":
        r += t[i].content;
        break;
      case "image":
        r += this.renderInlineAsText(t[i].children, e, n);
        break;
      case "html_inline":
      case "html_block":
        r += t[i].content;
        break;
      case "softbreak":
      case "hardbreak":
        r += `
`;
        break;
    }
  return r;
};
wn.prototype.render = function(t, e, n) {
  let r = "";
  const i = this.rules;
  for (let o = 0, s = t.length; o < s; o++) {
    const u = t[o].type;
    u === "inline" ? r += this.renderInline(t[o].children, e, n) : typeof i[u] < "u" ? r += i[u](t, o, e, n, this) : r += this.renderToken(t, o, e, n);
  }
  return r;
};
function ke() {
  this.__rules__ = [], this.__cache__ = null;
}
ke.prototype.__find__ = function(t) {
  for (let e = 0; e < this.__rules__.length; e++)
    if (this.__rules__[e].name === t)
      return e;
  return -1;
};
ke.prototype.__compile__ = function() {
  const t = this, e = [""];
  t.__rules__.forEach(function(n) {
    n.enabled && n.alt.forEach(function(r) {
      e.indexOf(r) < 0 && e.push(r);
    });
  }), t.__cache__ = {}, e.forEach(function(n) {
    t.__cache__[n] = [], t.__rules__.forEach(function(r) {
      r.enabled && (n && r.alt.indexOf(n) < 0 || t.__cache__[n].push(r.fn));
    });
  });
};
ke.prototype.at = function(t, e, n) {
  const r = this.__find__(t), i = n || {};
  if (r === -1)
    throw new Error("Parser rule not found: " + t);
  this.__rules__[r].fn = e, this.__rules__[r].alt = i.alt || [], this.__cache__ = null;
};
ke.prototype.before = function(t, e, n, r) {
  const i = this.__find__(t), o = r || {};
  if (i === -1)
    throw new Error("Parser rule not found: " + t);
  this.__rules__.splice(i, 0, {
    name: e,
    enabled: !0,
    fn: n,
    alt: o.alt || []
  }), this.__cache__ = null;
};
ke.prototype.after = function(t, e, n, r) {
  const i = this.__find__(t), o = r || {};
  if (i === -1)
    throw new Error("Parser rule not found: " + t);
  this.__rules__.splice(i + 1, 0, {
    name: e,
    enabled: !0,
    fn: n,
    alt: o.alt || []
  }), this.__cache__ = null;
};
ke.prototype.push = function(t, e, n) {
  const r = n || {};
  this.__rules__.push({
    name: t,
    enabled: !0,
    fn: e,
    alt: r.alt || []
  }), this.__cache__ = null;
};
ke.prototype.enable = function(t, e) {
  Array.isArray(t) || (t = [t]);
  const n = [];
  return t.forEach(function(r) {
    const i = this.__find__(r);
    if (i < 0) {
      if (e)
        return;
      throw new Error("Rules manager: invalid rule name " + r);
    }
    this.__rules__[i].enabled = !0, n.push(r);
  }, this), this.__cache__ = null, n;
};
ke.prototype.enableOnly = function(t, e) {
  Array.isArray(t) || (t = [t]), this.__rules__.forEach(function(n) {
    n.enabled = !1;
  }), this.enable(t, e);
};
ke.prototype.disable = function(t, e) {
  Array.isArray(t) || (t = [t]);
  const n = [];
  return t.forEach(function(r) {
    const i = this.__find__(r);
    if (i < 0) {
      if (e)
        return;
      throw new Error("Rules manager: invalid rule name " + r);
    }
    this.__rules__[i].enabled = !1, n.push(r);
  }, this), this.__cache__ = null, n;
};
ke.prototype.getRules = function(t) {
  return this.__cache__ === null && this.__compile__(), this.__cache__[t] || [];
};
function Fe(t, e, n) {
  this.type = t, this.tag = e, this.attrs = null, this.map = null, this.nesting = n, this.level = 0, this.children = null, this.content = "", this.markup = "", this.info = "", this.meta = null, this.block = !1, this.hidden = !1;
}
Fe.prototype.attrIndex = function(e) {
  if (!this.attrs)
    return -1;
  const n = this.attrs;
  for (let r = 0, i = n.length; r < i; r++)
    if (n[r][0] === e)
      return r;
  return -1;
};
Fe.prototype.attrPush = function(e) {
  this.attrs ? this.attrs.push(e) : this.attrs = [e];
};
Fe.prototype.attrSet = function(e, n) {
  const r = this.attrIndex(e), i = [e, n];
  r < 0 ? this.attrPush(i) : this.attrs[r] = i;
};
Fe.prototype.attrGet = function(e) {
  const n = this.attrIndex(e);
  let r = null;
  return n >= 0 && (r = this.attrs[n][1]), r;
};
Fe.prototype.attrJoin = function(e, n) {
  const r = this.attrIndex(e);
  r < 0 ? this.attrPush([e, n]) : this.attrs[r][1] = this.attrs[r][1] + " " + n;
};
function xh(t, e, n) {
  this.src = t, this.env = n, this.tokens = [], this.inlineMode = !1, this.md = e;
}
xh.prototype.Token = Fe;
const zx = /\r\n?|\n/g, $x = /\0/g;
function Hx(t) {
  let e;
  e = t.src.replace(zx, `
`), e = e.replace($x, "�"), t.src = e;
}
function Vx(t) {
  let e;
  t.inlineMode ? (e = new t.Token("inline", "", 0), e.content = t.src, e.map = [0, 1], e.children = [], t.tokens.push(e)) : t.md.block.parse(t.src, t.md, t.env, t.tokens);
}
function jx(t) {
  const e = t.tokens;
  for (let n = 0, r = e.length; n < r; n++) {
    const i = e[n];
    i.type === "inline" && t.md.inline.parse(i.content, t.md, t.env, i.children);
  }
}
function qx(t) {
  return /^<a[>\s]/i.test(t);
}
function Wx(t) {
  return /^<\/a\s*>/i.test(t);
}
function Ux(t) {
  const e = t.tokens;
  if (t.md.options.linkify)
    for (let n = 0, r = e.length; n < r; n++) {
      if (e[n].type !== "inline" || !t.md.linkify.pretest(e[n].content))
        continue;
      let i = e[n].children, o = 0;
      for (let s = i.length - 1; s >= 0; s--) {
        const u = i[s];
        if (u.type === "link_close") {
          for (s--; i[s].level !== u.level && i[s].type !== "link_open"; )
            s--;
          continue;
        }
        if (u.type === "html_inline" && (qx(u.content) && o > 0 && o--, Wx(u.content) && o++), !(o > 0) && u.type === "text" && t.md.linkify.test(u.content)) {
          const l = u.content;
          let a = t.md.linkify.match(l);
          const c = [];
          let d = u.level, f = 0;
          a.length > 0 && a[0].index === 0 && s > 0 && i[s - 1].type === "text_special" && (a = a.slice(1));
          for (let h = 0; h < a.length; h++) {
            const p = a[h].url, m = t.md.normalizeLink(p);
            if (!t.md.validateLink(m))
              continue;
            let g = a[h].text;
            a[h].schema ? a[h].schema === "mailto:" && !/^mailto:/i.test(g) ? g = t.md.normalizeLinkText("mailto:" + g).replace(/^mailto:/, "") : g = t.md.normalizeLinkText(g) : g = t.md.normalizeLinkText("http://" + g).replace(/^http:\/\//, "");
            const b = a[h].index;
            if (b > f) {
              const x = new t.Token("text", "", 0);
              x.content = l.slice(f, b), x.level = d, c.push(x);
            }
            const y = new t.Token("link_open", "a", 1);
            y.attrs = [["href", m]], y.level = d++, y.markup = "linkify", y.info = "auto", c.push(y);
            const k = new t.Token("text", "", 0);
            k.content = g, k.level = d, c.push(k);
            const C = new t.Token("link_close", "a", -1);
            C.level = --d, C.markup = "linkify", C.info = "auto", c.push(C), f = a[h].lastIndex;
          }
          if (f < l.length) {
            const h = new t.Token("text", "", 0);
            h.content = l.slice(f), h.level = d, c.push(h);
          }
          e[n].children = i = yh(i, s, c);
        }
      }
    }
}
const Ch = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/, Kx = /\((c|tm|r)\)/i, Jx = /\((c|tm|r)\)/ig, Gx = {
  c: "©",
  r: "®",
  tm: "™"
};
function Zx(t, e) {
  return Gx[e.toLowerCase()];
}
function Xx(t) {
  let e = 0;
  for (let n = t.length - 1; n >= 0; n--) {
    const r = t[n];
    r.type === "text" && !e && (r.content = r.content.replace(Jx, Zx)), r.type === "link_open" && r.info === "auto" && e--, r.type === "link_close" && r.info === "auto" && e++;
  }
}
function Yx(t) {
  let e = 0;
  for (let n = t.length - 1; n >= 0; n--) {
    const r = t[n];
    r.type === "text" && !e && Ch.test(r.content) && (r.content = r.content.replace(/\+-/g, "±").replace(/\.{2,}/g, "…").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/mg, "$1—").replace(/(^|\s)--(?=\s|$)/mg, "$1–").replace(/(^|[^-\s])--(?=[^-\s]|$)/mg, "$1–")), r.type === "link_open" && r.info === "auto" && e--, r.type === "link_close" && r.info === "auto" && e++;
  }
}
function Qx(t) {
  let e;
  if (t.md.options.typographer)
    for (e = t.tokens.length - 1; e >= 0; e--)
      t.tokens[e].type === "inline" && (Kx.test(t.tokens[e].content) && Xx(t.tokens[e].children), Ch.test(t.tokens[e].content) && Yx(t.tokens[e].children));
}
const e3 = /['"]/, ja = /['"]/g, qa = "’";
function Lr(t, e, n) {
  return t.slice(0, e) + n + t.slice(e + 1);
}
function t3(t, e) {
  let n;
  const r = [];
  for (let i = 0; i < t.length; i++) {
    const o = t[i], s = t[i].level;
    for (n = r.length - 1; n >= 0 && !(r[n].level <= s); n--)
      ;
    if (r.length = n + 1, o.type !== "text")
      continue;
    let u = o.content, l = 0, a = u.length;
    e:
      for (; l < a; ) {
        ja.lastIndex = l;
        const c = ja.exec(u);
        if (!c)
          break;
        let d = !0, f = !0;
        l = c.index + 1;
        const h = c[0] === "'";
        let p = 32;
        if (c.index - 1 >= 0)
          p = u.charCodeAt(c.index - 1);
        else
          for (n = i - 1; n >= 0 && !(t[n].type === "softbreak" || t[n].type === "hardbreak"); n--)
            if (t[n].content) {
              p = t[n].content.charCodeAt(t[n].content.length - 1);
              break;
            }
        let m = 32;
        if (l < a)
          m = u.charCodeAt(l);
        else
          for (n = i + 1; n < t.length && !(t[n].type === "softbreak" || t[n].type === "hardbreak"); n++)
            if (t[n].content) {
              m = t[n].content.charCodeAt(0);
              break;
            }
        const g = ur(p) || sr(String.fromCharCode(p)), b = ur(m) || sr(String.fromCharCode(m)), y = or(p), k = or(m);
        if (k ? d = !1 : b && (y || g || (d = !1)), y ? f = !1 : g && (k || b || (f = !1)), m === 34 && c[0] === '"' && p >= 48 && p <= 57 && (f = d = !1), d && f && (d = g, f = b), !d && !f) {
          h && (o.content = Lr(o.content, c.index, qa));
          continue;
        }
        if (f)
          for (n = r.length - 1; n >= 0; n--) {
            let C = r[n];
            if (r[n].level < s)
              break;
            if (C.single === h && r[n].level === s) {
              C = r[n];
              let x, E;
              h ? (x = e.md.options.quotes[2], E = e.md.options.quotes[3]) : (x = e.md.options.quotes[0], E = e.md.options.quotes[1]), o.content = Lr(o.content, c.index, E), t[C.token].content = Lr(
                t[C.token].content,
                C.pos,
                x
              ), l += E.length - 1, C.token === i && (l += x.length - 1), u = o.content, a = u.length, r.length = n;
              continue e;
            }
          }
        d ? r.push({
          token: i,
          pos: c.index,
          single: h,
          level: s
        }) : f && h && (o.content = Lr(o.content, c.index, qa));
      }
  }
}
function n3(t) {
  if (t.md.options.typographer)
    for (let e = t.tokens.length - 1; e >= 0; e--)
      t.tokens[e].type !== "inline" || !e3.test(t.tokens[e].content) || t3(t.tokens[e].children, t);
}
function r3(t) {
  let e, n;
  const r = t.tokens, i = r.length;
  for (let o = 0; o < i; o++) {
    if (r[o].type !== "inline") continue;
    const s = r[o].children, u = s.length;
    for (e = 0; e < u; e++)
      s[e].type === "text_special" && (s[e].type = "text");
    for (e = n = 0; e < u; e++)
      s[e].type === "text" && e + 1 < u && s[e + 1].type === "text" ? s[e + 1].content = s[e].content + s[e + 1].content : (e !== n && (s[n] = s[e]), n++);
    e !== n && (s.length = n);
  }
}
const Ho = [
  ["normalize", Hx],
  ["block", Vx],
  ["inline", jx],
  ["linkify", Ux],
  ["replacements", Qx],
  ["smartquotes", n3],
  // `text_join` finds `text_special` tokens (for escape sequences)
  // and joins them with the rest of the text
  ["text_join", r3]
];
function Iu() {
  this.ruler = new ke();
  for (let t = 0; t < Ho.length; t++)
    this.ruler.push(Ho[t][0], Ho[t][1]);
}
Iu.prototype.process = function(t) {
  const e = this.ruler.getRules("");
  for (let n = 0, r = e.length; n < r; n++)
    e[n](t);
};
Iu.prototype.State = xh;
function Je(t, e, n, r) {
  this.src = t, this.md = e, this.env = n, this.tokens = r, this.bMarks = [], this.eMarks = [], this.tShift = [], this.sCount = [], this.bsCount = [], this.blkIndent = 0, this.line = 0, this.lineMax = 0, this.tight = !1, this.ddIndent = -1, this.listIndent = -1, this.parentType = "root", this.level = 0;
  const i = this.src;
  for (let o = 0, s = 0, u = 0, l = 0, a = i.length, c = !1; s < a; s++) {
    const d = i.charCodeAt(s);
    if (!c)
      if (z(d)) {
        u++, d === 9 ? l += 4 - l % 4 : l++;
        continue;
      } else
        c = !0;
    (d === 10 || s === a - 1) && (d !== 10 && s++, this.bMarks.push(o), this.eMarks.push(s), this.tShift.push(u), this.sCount.push(l), this.bsCount.push(0), c = !1, u = 0, l = 0, o = s + 1);
  }
  this.bMarks.push(i.length), this.eMarks.push(i.length), this.tShift.push(0), this.sCount.push(0), this.bsCount.push(0), this.lineMax = this.bMarks.length - 1;
}
Je.prototype.push = function(t, e, n) {
  const r = new Fe(t, e, n);
  return r.block = !0, n < 0 && this.level--, r.level = this.level, n > 0 && this.level++, this.tokens.push(r), r;
};
Je.prototype.isEmpty = function(e) {
  return this.bMarks[e] + this.tShift[e] >= this.eMarks[e];
};
Je.prototype.skipEmptyLines = function(e) {
  for (let n = this.lineMax; e < n && !(this.bMarks[e] + this.tShift[e] < this.eMarks[e]); e++)
    ;
  return e;
};
Je.prototype.skipSpaces = function(e) {
  for (let n = this.src.length; e < n; e++) {
    const r = this.src.charCodeAt(e);
    if (!z(r))
      break;
  }
  return e;
};
Je.prototype.skipSpacesBack = function(e, n) {
  if (e <= n)
    return e;
  for (; e > n; )
    if (!z(this.src.charCodeAt(--e)))
      return e + 1;
  return e;
};
Je.prototype.skipChars = function(e, n) {
  for (let r = this.src.length; e < r && this.src.charCodeAt(e) === n; e++)
    ;
  return e;
};
Je.prototype.skipCharsBack = function(e, n, r) {
  if (e <= r)
    return e;
  for (; e > r; )
    if (n !== this.src.charCodeAt(--e))
      return e + 1;
  return e;
};
Je.prototype.getLines = function(e, n, r, i) {
  if (e >= n)
    return "";
  const o = new Array(n - e);
  for (let s = 0, u = e; u < n; u++, s++) {
    let l = 0;
    const a = this.bMarks[u];
    let c = a, d;
    for (u + 1 < n || i ? d = this.eMarks[u] + 1 : d = this.eMarks[u]; c < d && l < r; ) {
      const f = this.src.charCodeAt(c);
      if (z(f))
        f === 9 ? l += 4 - (l + this.bsCount[u]) % 4 : l++;
      else if (c - a < this.tShift[u])
        l++;
      else
        break;
      c++;
    }
    l > r ? o[s] = new Array(l - r + 1).join(" ") + this.src.slice(c, d) : o[s] = this.src.slice(c, d);
  }
  return o.join("");
};
Je.prototype.Token = Fe;
const i3 = 65536;
function Vo(t, e) {
  const n = t.bMarks[e] + t.tShift[e], r = t.eMarks[e];
  return t.src.slice(n, r);
}
function Wa(t) {
  const e = [], n = t.length;
  let r = 0, i = t.charCodeAt(r), o = !1, s = 0, u = "";
  for (; r < n; )
    i === 124 && (o ? (u += t.substring(s, r - 1), s = r) : (e.push(u + t.substring(s, r)), u = "", s = r + 1)), o = i === 92, r++, i = t.charCodeAt(r);
  return e.push(u + t.substring(s)), e;
}
function o3(t, e, n, r) {
  if (e + 2 > n)
    return !1;
  let i = e + 1;
  if (t.sCount[i] < t.blkIndent || t.sCount[i] - t.blkIndent >= 4)
    return !1;
  let o = t.bMarks[i] + t.tShift[i];
  if (o >= t.eMarks[i])
    return !1;
  const s = t.src.charCodeAt(o++);
  if (s !== 124 && s !== 45 && s !== 58 || o >= t.eMarks[i])
    return !1;
  const u = t.src.charCodeAt(o++);
  if (u !== 124 && u !== 45 && u !== 58 && !z(u) || s === 45 && z(u))
    return !1;
  for (; o < t.eMarks[i]; ) {
    const C = t.src.charCodeAt(o);
    if (C !== 124 && C !== 45 && C !== 58 && !z(C))
      return !1;
    o++;
  }
  let l = Vo(t, e + 1), a = l.split("|");
  const c = [];
  for (let C = 0; C < a.length; C++) {
    const x = a[C].trim();
    if (!x) {
      if (C === 0 || C === a.length - 1)
        continue;
      return !1;
    }
    if (!/^:?-+:?$/.test(x))
      return !1;
    x.charCodeAt(x.length - 1) === 58 ? c.push(x.charCodeAt(0) === 58 ? "center" : "right") : x.charCodeAt(0) === 58 ? c.push("left") : c.push("");
  }
  if (l = Vo(t, e).trim(), l.indexOf("|") === -1 || t.sCount[e] - t.blkIndent >= 4)
    return !1;
  a = Wa(l), a.length && a[0] === "" && a.shift(), a.length && a[a.length - 1] === "" && a.pop();
  const d = a.length;
  if (d === 0 || d !== c.length)
    return !1;
  if (r)
    return !0;
  const f = t.parentType;
  t.parentType = "table";
  const h = t.md.block.ruler.getRules("blockquote"), p = t.push("table_open", "table", 1), m = [e, 0];
  p.map = m;
  const g = t.push("thead_open", "thead", 1);
  g.map = [e, e + 1];
  const b = t.push("tr_open", "tr", 1);
  b.map = [e, e + 1];
  for (let C = 0; C < a.length; C++) {
    const x = t.push("th_open", "th", 1);
    c[C] && (x.attrs = [["style", "text-align:" + c[C]]]);
    const E = t.push("inline", "", 0);
    E.content = a[C].trim(), E.children = [], t.push("th_close", "th", -1);
  }
  t.push("tr_close", "tr", -1), t.push("thead_close", "thead", -1);
  let y, k = 0;
  for (i = e + 2; i < n && !(t.sCount[i] < t.blkIndent); i++) {
    let C = !1;
    for (let E = 0, S = h.length; E < S; E++)
      if (h[E](t, i, n, !0)) {
        C = !0;
        break;
      }
    if (C || (l = Vo(t, i).trim(), !l) || t.sCount[i] - t.blkIndent >= 4 || (a = Wa(l), a.length && a[0] === "" && a.shift(), a.length && a[a.length - 1] === "" && a.pop(), k += d - a.length, k > i3))
      break;
    if (i === e + 2) {
      const E = t.push("tbody_open", "tbody", 1);
      E.map = y = [e + 2, 0];
    }
    const x = t.push("tr_open", "tr", 1);
    x.map = [i, i + 1];
    for (let E = 0; E < d; E++) {
      const S = t.push("td_open", "td", 1);
      c[E] && (S.attrs = [["style", "text-align:" + c[E]]]);
      const M = t.push("inline", "", 0);
      M.content = a[E] ? a[E].trim() : "", M.children = [], t.push("td_close", "td", -1);
    }
    t.push("tr_close", "tr", -1);
  }
  return y && (t.push("tbody_close", "tbody", -1), y[1] = i), t.push("table_close", "table", -1), m[1] = i, t.parentType = f, t.line = i, !0;
}
function s3(t, e, n) {
  if (t.sCount[e] - t.blkIndent < 4)
    return !1;
  let r = e + 1, i = r;
  for (; r < n; ) {
    if (t.isEmpty(r)) {
      r++;
      continue;
    }
    if (t.sCount[r] - t.blkIndent >= 4) {
      r++, i = r;
      continue;
    }
    break;
  }
  t.line = i;
  const o = t.push("code_block", "code", 0);
  return o.content = t.getLines(e, i, 4 + t.blkIndent, !1) + `
`, o.map = [e, t.line], !0;
}
function u3(t, e, n, r) {
  let i = t.bMarks[e] + t.tShift[e], o = t.eMarks[e];
  if (t.sCount[e] - t.blkIndent >= 4 || i + 3 > o)
    return !1;
  const s = t.src.charCodeAt(i);
  if (s !== 126 && s !== 96)
    return !1;
  let u = i;
  i = t.skipChars(i, s);
  let l = i - u;
  if (l < 3)
    return !1;
  const a = t.src.slice(u, i), c = t.src.slice(i, o);
  if (s === 96 && c.indexOf(String.fromCharCode(s)) >= 0)
    return !1;
  if (r)
    return !0;
  let d = e, f = !1;
  for (; d++, !(d >= n || (i = u = t.bMarks[d] + t.tShift[d], o = t.eMarks[d], i < o && t.sCount[d] < t.blkIndent)); )
    if (t.src.charCodeAt(i) === s && !(t.sCount[d] - t.blkIndent >= 4) && (i = t.skipChars(i, s), !(i - u < l) && (i = t.skipSpaces(i), !(i < o)))) {
      f = !0;
      break;
    }
  l = t.sCount[e], t.line = d + (f ? 1 : 0);
  const h = t.push("fence", "code", 0);
  return h.info = c, h.content = t.getLines(e + 1, d, l, !0), h.markup = a, h.map = [e, t.line], !0;
}
function l3(t, e, n, r) {
  let i = t.bMarks[e] + t.tShift[e], o = t.eMarks[e];
  const s = t.lineMax;
  if (t.sCount[e] - t.blkIndent >= 4 || t.src.charCodeAt(i) !== 62)
    return !1;
  if (r)
    return !0;
  const u = [], l = [], a = [], c = [], d = t.md.block.ruler.getRules("blockquote"), f = t.parentType;
  t.parentType = "blockquote";
  let h = !1, p;
  for (p = e; p < n; p++) {
    const k = t.sCount[p] < t.blkIndent;
    if (i = t.bMarks[p] + t.tShift[p], o = t.eMarks[p], i >= o)
      break;
    if (t.src.charCodeAt(i++) === 62 && !k) {
      let x = t.sCount[p] + 1, E, S;
      t.src.charCodeAt(i) === 32 ? (i++, x++, S = !1, E = !0) : t.src.charCodeAt(i) === 9 ? (E = !0, (t.bsCount[p] + x) % 4 === 3 ? (i++, x++, S = !1) : S = !0) : E = !1;
      let M = x;
      for (u.push(t.bMarks[p]), t.bMarks[p] = i; i < o; ) {
        const N = t.src.charCodeAt(i);
        if (z(N))
          N === 9 ? M += 4 - (M + t.bsCount[p] + (S ? 1 : 0)) % 4 : M++;
        else
          break;
        i++;
      }
      h = i >= o, l.push(t.bsCount[p]), t.bsCount[p] = t.sCount[p] + 1 + (E ? 1 : 0), a.push(t.sCount[p]), t.sCount[p] = M - x, c.push(t.tShift[p]), t.tShift[p] = i - t.bMarks[p];
      continue;
    }
    if (h)
      break;
    let C = !1;
    for (let x = 0, E = d.length; x < E; x++)
      if (d[x](t, p, n, !0)) {
        C = !0;
        break;
      }
    if (C) {
      t.lineMax = p, t.blkIndent !== 0 && (u.push(t.bMarks[p]), l.push(t.bsCount[p]), c.push(t.tShift[p]), a.push(t.sCount[p]), t.sCount[p] -= t.blkIndent);
      break;
    }
    u.push(t.bMarks[p]), l.push(t.bsCount[p]), c.push(t.tShift[p]), a.push(t.sCount[p]), t.sCount[p] = -1;
  }
  const m = t.blkIndent;
  t.blkIndent = 0;
  const g = t.push("blockquote_open", "blockquote", 1);
  g.markup = ">";
  const b = [e, 0];
  g.map = b, t.md.block.tokenize(t, e, p);
  const y = t.push("blockquote_close", "blockquote", -1);
  y.markup = ">", t.lineMax = s, t.parentType = f, b[1] = t.line;
  for (let k = 0; k < c.length; k++)
    t.bMarks[k + e] = u[k], t.tShift[k + e] = c[k], t.sCount[k + e] = a[k], t.bsCount[k + e] = l[k];
  return t.blkIndent = m, !0;
}
function a3(t, e, n, r) {
  const i = t.eMarks[e];
  if (t.sCount[e] - t.blkIndent >= 4)
    return !1;
  let o = t.bMarks[e] + t.tShift[e];
  const s = t.src.charCodeAt(o++);
  if (s !== 42 && s !== 45 && s !== 95)
    return !1;
  let u = 1;
  for (; o < i; ) {
    const a = t.src.charCodeAt(o++);
    if (a !== s && !z(a))
      return !1;
    a === s && u++;
  }
  if (u < 3)
    return !1;
  if (r)
    return !0;
  t.line = e + 1;
  const l = t.push("hr", "hr", 0);
  return l.map = [e, t.line], l.markup = Array(u + 1).join(String.fromCharCode(s)), !0;
}
function Ua(t, e) {
  const n = t.eMarks[e];
  let r = t.bMarks[e] + t.tShift[e];
  const i = t.src.charCodeAt(r++);
  if (i !== 42 && i !== 45 && i !== 43)
    return -1;
  if (r < n) {
    const o = t.src.charCodeAt(r);
    if (!z(o))
      return -1;
  }
  return r;
}
function Ka(t, e) {
  const n = t.bMarks[e] + t.tShift[e], r = t.eMarks[e];
  let i = n;
  if (i + 1 >= r)
    return -1;
  let o = t.src.charCodeAt(i++);
  if (o < 48 || o > 57)
    return -1;
  for (; ; ) {
    if (i >= r)
      return -1;
    if (o = t.src.charCodeAt(i++), o >= 48 && o <= 57) {
      if (i - n >= 10)
        return -1;
      continue;
    }
    if (o === 41 || o === 46)
      break;
    return -1;
  }
  return i < r && (o = t.src.charCodeAt(i), !z(o)) ? -1 : i;
}
function c3(t, e) {
  const n = t.level + 2;
  for (let r = e + 2, i = t.tokens.length - 2; r < i; r++)
    t.tokens[r].level === n && t.tokens[r].type === "paragraph_open" && (t.tokens[r + 2].hidden = !0, t.tokens[r].hidden = !0, r += 2);
}
function d3(t, e, n, r) {
  let i, o, s, u, l = e, a = !0;
  if (t.sCount[l] - t.blkIndent >= 4 || t.listIndent >= 0 && t.sCount[l] - t.listIndent >= 4 && t.sCount[l] < t.blkIndent)
    return !1;
  let c = !1;
  r && t.parentType === "paragraph" && t.sCount[l] >= t.blkIndent && (c = !0);
  let d, f, h;
  if ((h = Ka(t, l)) >= 0) {
    if (d = !0, s = t.bMarks[l] + t.tShift[l], f = Number(t.src.slice(s, h - 1)), c && f !== 1) return !1;
  } else if ((h = Ua(t, l)) >= 0)
    d = !1;
  else
    return !1;
  if (c && t.skipSpaces(h) >= t.eMarks[l])
    return !1;
  if (r)
    return !0;
  const p = t.src.charCodeAt(h - 1), m = t.tokens.length;
  d ? (u = t.push("ordered_list_open", "ol", 1), f !== 1 && (u.attrs = [["start", f]])) : u = t.push("bullet_list_open", "ul", 1);
  const g = [l, 0];
  u.map = g, u.markup = String.fromCharCode(p);
  let b = !1;
  const y = t.md.block.ruler.getRules("list"), k = t.parentType;
  for (t.parentType = "list"; l < n; ) {
    o = h, i = t.eMarks[l];
    const C = t.sCount[l] + h - (t.bMarks[l] + t.tShift[l]);
    let x = C;
    for (; o < i; ) {
      const G = t.src.charCodeAt(o);
      if (G === 9)
        x += 4 - (x + t.bsCount[l]) % 4;
      else if (G === 32)
        x++;
      else
        break;
      o++;
    }
    const E = o;
    let S;
    E >= i ? S = 1 : S = x - C, S > 4 && (S = 1);
    const M = C + S;
    u = t.push("list_item_open", "li", 1), u.markup = String.fromCharCode(p);
    const N = [l, 0];
    u.map = N, d && (u.info = t.src.slice(s, h - 1));
    const Y = t.tight, Pe = t.tShift[l], Be = t.sCount[l], ut = t.listIndent;
    if (t.listIndent = t.blkIndent, t.blkIndent = M, t.tight = !0, t.tShift[l] = E - t.bMarks[l], t.sCount[l] = x, E >= i && t.isEmpty(l + 1) ? t.line = Math.min(t.line + 2, n) : t.md.block.tokenize(t, l, n, !0), (!t.tight || b) && (a = !1), b = t.line - l > 1 && t.isEmpty(t.line - 1), t.blkIndent = t.listIndent, t.listIndent = ut, t.tShift[l] = Pe, t.sCount[l] = Be, t.tight = Y, u = t.push("list_item_close", "li", -1), u.markup = String.fromCharCode(p), l = t.line, N[1] = l, l >= n || t.sCount[l] < t.blkIndent || t.sCount[l] - t.blkIndent >= 4)
      break;
    let pe = !1;
    for (let G = 0, lt = y.length; G < lt; G++)
      if (y[G](t, l, n, !0)) {
        pe = !0;
        break;
      }
    if (pe)
      break;
    if (d) {
      if (h = Ka(t, l), h < 0)
        break;
      s = t.bMarks[l] + t.tShift[l];
    } else if (h = Ua(t, l), h < 0)
      break;
    if (p !== t.src.charCodeAt(h - 1))
      break;
  }
  return d ? u = t.push("ordered_list_close", "ol", -1) : u = t.push("bullet_list_close", "ul", -1), u.markup = String.fromCharCode(p), g[1] = l, t.line = l, t.parentType = k, a && c3(t, m), !0;
}
function f3(t, e, n, r) {
  let i = t.bMarks[e] + t.tShift[e], o = t.eMarks[e], s = e + 1;
  if (t.sCount[e] - t.blkIndent >= 4 || t.src.charCodeAt(i) !== 91)
    return !1;
  function u(y) {
    const k = t.lineMax;
    if (y >= k || t.isEmpty(y))
      return null;
    let C = !1;
    if (t.sCount[y] - t.blkIndent > 3 && (C = !0), t.sCount[y] < 0 && (C = !0), !C) {
      const S = t.md.block.ruler.getRules("reference"), M = t.parentType;
      t.parentType = "reference";
      let N = !1;
      for (let Y = 0, Pe = S.length; Y < Pe; Y++)
        if (S[Y](t, y, k, !0)) {
          N = !0;
          break;
        }
      if (t.parentType = M, N)
        return null;
    }
    const x = t.bMarks[y] + t.tShift[y], E = t.eMarks[y];
    return t.src.slice(x, E + 1);
  }
  let l = t.src.slice(i, o + 1);
  o = l.length;
  let a = -1;
  for (i = 1; i < o; i++) {
    const y = l.charCodeAt(i);
    if (y === 91)
      return !1;
    if (y === 93) {
      a = i;
      break;
    } else if (y === 10) {
      const k = u(s);
      k !== null && (l += k, o = l.length, s++);
    } else if (y === 92 && (i++, i < o && l.charCodeAt(i) === 10)) {
      const k = u(s);
      k !== null && (l += k, o = l.length, s++);
    }
  }
  if (a < 0 || l.charCodeAt(a + 1) !== 58)
    return !1;
  for (i = a + 2; i < o; i++) {
    const y = l.charCodeAt(i);
    if (y === 10) {
      const k = u(s);
      k !== null && (l += k, o = l.length, s++);
    } else if (!z(y)) break;
  }
  const c = t.md.helpers.parseLinkDestination(l, i, o);
  if (!c.ok)
    return !1;
  const d = t.md.normalizeLink(c.str);
  if (!t.md.validateLink(d))
    return !1;
  i = c.pos;
  const f = i, h = s, p = i;
  for (; i < o; i++) {
    const y = l.charCodeAt(i);
    if (y === 10) {
      const k = u(s);
      k !== null && (l += k, o = l.length, s++);
    } else if (!z(y)) break;
  }
  let m = t.md.helpers.parseLinkTitle(l, i, o);
  for (; m.can_continue; ) {
    const y = u(s);
    if (y === null) break;
    l += y, i = o, o = l.length, s++, m = t.md.helpers.parseLinkTitle(l, i, o, m);
  }
  let g;
  for (i < o && p !== i && m.ok ? (g = m.str, i = m.pos) : (g = "", i = f, s = h); i < o; ) {
    const y = l.charCodeAt(i);
    if (!z(y))
      break;
    i++;
  }
  if (i < o && l.charCodeAt(i) !== 10 && g)
    for (g = "", i = f, s = h; i < o; ) {
      const y = l.charCodeAt(i);
      if (!z(y))
        break;
      i++;
    }
  if (i < o && l.charCodeAt(i) !== 10)
    return !1;
  const b = ro(l.slice(1, a));
  return b ? (r || (typeof t.env.references > "u" && (t.env.references = {}), typeof t.env.references[b] > "u" && (t.env.references[b] = { title: g, href: d }), t.line = s), !0) : !1;
}
const h3 = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
], p3 = "[a-zA-Z_:][a-zA-Z0-9:._-]*", m3 = "[^\"'=<>`\\x00-\\x20]+", g3 = "'[^']*'", b3 = '"[^"]*"', y3 = "(?:" + m3 + "|" + g3 + "|" + b3 + ")", k3 = "(?:\\s+" + p3 + "(?:\\s*=\\s*" + y3 + ")?)", wh = "<[A-Za-z][A-Za-z0-9\\-]*" + k3 + "*\\s*\\/?>", Eh = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>", x3 = "<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->", C3 = "<[?][\\s\\S]*?[?]>", w3 = "<![A-Za-z][^>]*>", E3 = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>", S3 = new RegExp("^(?:" + wh + "|" + Eh + "|" + x3 + "|" + C3 + "|" + w3 + "|" + E3 + ")"), A3 = new RegExp("^(?:" + wh + "|" + Eh + ")"), nn = [
  [/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, !0],
  [/^<!--/, /-->/, !0],
  [/^<\?/, /\?>/, !0],
  [/^<![A-Z]/, />/, !0],
  [/^<!\[CDATA\[/, /\]\]>/, !0],
  [new RegExp("^</?(" + h3.join("|") + ")(?=(\\s|/?>|$))", "i"), /^$/, !0],
  [new RegExp(A3.source + "\\s*$"), /^$/, !1]
];
function v3(t, e, n, r) {
  let i = t.bMarks[e] + t.tShift[e], o = t.eMarks[e];
  if (t.sCount[e] - t.blkIndent >= 4 || !t.md.options.html || t.src.charCodeAt(i) !== 60)
    return !1;
  let s = t.src.slice(i, o), u = 0;
  for (; u < nn.length && !nn[u][0].test(s); u++)
    ;
  if (u === nn.length)
    return !1;
  if (r)
    return nn[u][2];
  let l = e + 1;
  if (!nn[u][1].test(s)) {
    for (; l < n && !(t.sCount[l] < t.blkIndent); l++)
      if (i = t.bMarks[l] + t.tShift[l], o = t.eMarks[l], s = t.src.slice(i, o), nn[u][1].test(s)) {
        s.length !== 0 && l++;
        break;
      }
  }
  t.line = l;
  const a = t.push("html_block", "", 0);
  return a.map = [e, l], a.content = t.getLines(e, l, t.blkIndent, !0), !0;
}
function M3(t, e, n, r) {
  let i = t.bMarks[e] + t.tShift[e], o = t.eMarks[e];
  if (t.sCount[e] - t.blkIndent >= 4)
    return !1;
  let s = t.src.charCodeAt(i);
  if (s !== 35 || i >= o)
    return !1;
  let u = 1;
  for (s = t.src.charCodeAt(++i); s === 35 && i < o && u <= 6; )
    u++, s = t.src.charCodeAt(++i);
  if (u > 6 || i < o && !z(s))
    return !1;
  if (r)
    return !0;
  o = t.skipSpacesBack(o, i);
  const l = t.skipCharsBack(o, 35, i);
  l > i && z(t.src.charCodeAt(l - 1)) && (o = l), t.line = e + 1;
  const a = t.push("heading_open", "h" + String(u), 1);
  a.markup = "########".slice(0, u), a.map = [e, t.line];
  const c = t.push("inline", "", 0);
  c.content = t.src.slice(i, o).trim(), c.map = [e, t.line], c.children = [];
  const d = t.push("heading_close", "h" + String(u), -1);
  return d.markup = "########".slice(0, u), !0;
}
function T3(t, e, n) {
  const r = t.md.block.ruler.getRules("paragraph");
  if (t.sCount[e] - t.blkIndent >= 4)
    return !1;
  const i = t.parentType;
  t.parentType = "paragraph";
  let o = 0, s, u = e + 1;
  for (; u < n && !t.isEmpty(u); u++) {
    if (t.sCount[u] - t.blkIndent > 3)
      continue;
    if (t.sCount[u] >= t.blkIndent) {
      let h = t.bMarks[u] + t.tShift[u];
      const p = t.eMarks[u];
      if (h < p && (s = t.src.charCodeAt(h), (s === 45 || s === 61) && (h = t.skipChars(h, s), h = t.skipSpaces(h), h >= p))) {
        o = s === 61 ? 1 : 2;
        break;
      }
    }
    if (t.sCount[u] < 0)
      continue;
    let f = !1;
    for (let h = 0, p = r.length; h < p; h++)
      if (r[h](t, u, n, !0)) {
        f = !0;
        break;
      }
    if (f)
      break;
  }
  if (!o)
    return !1;
  const l = t.getLines(e, u, t.blkIndent, !1).trim();
  t.line = u + 1;
  const a = t.push("heading_open", "h" + String(o), 1);
  a.markup = String.fromCharCode(s), a.map = [e, t.line];
  const c = t.push("inline", "", 0);
  c.content = l, c.map = [e, t.line - 1], c.children = [];
  const d = t.push("heading_close", "h" + String(o), -1);
  return d.markup = String.fromCharCode(s), t.parentType = i, !0;
}
function _3(t, e, n) {
  const r = t.md.block.ruler.getRules("paragraph"), i = t.parentType;
  let o = e + 1;
  for (t.parentType = "paragraph"; o < n && !t.isEmpty(o); o++) {
    if (t.sCount[o] - t.blkIndent > 3 || t.sCount[o] < 0)
      continue;
    let a = !1;
    for (let c = 0, d = r.length; c < d; c++)
      if (r[c](t, o, n, !0)) {
        a = !0;
        break;
      }
    if (a)
      break;
  }
  const s = t.getLines(e, o, t.blkIndent, !1).trim();
  t.line = o;
  const u = t.push("paragraph_open", "p", 1);
  u.map = [e, t.line];
  const l = t.push("inline", "", 0);
  return l.content = s, l.map = [e, t.line], l.children = [], t.push("paragraph_close", "p", -1), t.parentType = i, !0;
}
const Fr = [
  // First 2 params - rule name & source. Secondary array - list of rules,
  // which can be terminated by this one.
  ["table", o3, ["paragraph", "reference"]],
  ["code", s3],
  ["fence", u3, ["paragraph", "reference", "blockquote", "list"]],
  ["blockquote", l3, ["paragraph", "reference", "blockquote", "list"]],
  ["hr", a3, ["paragraph", "reference", "blockquote", "list"]],
  ["list", d3, ["paragraph", "reference", "blockquote"]],
  ["reference", f3],
  ["html_block", v3, ["paragraph", "reference", "blockquote"]],
  ["heading", M3, ["paragraph", "reference", "blockquote"]],
  ["lheading", T3],
  ["paragraph", _3]
];
function io() {
  this.ruler = new ke();
  for (let t = 0; t < Fr.length; t++)
    this.ruler.push(Fr[t][0], Fr[t][1], { alt: (Fr[t][2] || []).slice() });
}
io.prototype.tokenize = function(t, e, n) {
  const r = this.ruler.getRules(""), i = r.length, o = t.md.options.maxNesting;
  let s = e, u = !1;
  for (; s < n && (t.line = s = t.skipEmptyLines(s), !(s >= n || t.sCount[s] < t.blkIndent)); ) {
    if (t.level >= o) {
      t.line = n;
      break;
    }
    const l = t.line;
    let a = !1;
    for (let c = 0; c < i; c++)
      if (a = r[c](t, s, n, !1), a) {
        if (l >= t.line)
          throw new Error("block rule didn't increment state.line");
        break;
      }
    if (!a) throw new Error("none of the block rules matched");
    t.tight = !u, t.isEmpty(t.line - 1) && (u = !0), s = t.line, s < n && t.isEmpty(s) && (u = !0, s++, t.line = s);
  }
};
io.prototype.parse = function(t, e, n, r) {
  if (!t)
    return;
  const i = new this.State(t, e, n, r);
  this.tokenize(i, i.line, i.lineMax);
};
io.prototype.State = Je;
function mr(t, e, n, r) {
  this.src = t, this.env = n, this.md = e, this.tokens = r, this.tokens_meta = Array(r.length), this.pos = 0, this.posMax = this.src.length, this.level = 0, this.pending = "", this.pendingLevel = 0, this.cache = {}, this.delimiters = [], this._prev_delimiters = [], this.backticks = {}, this.backticksScanned = !1, this.linkLevel = 0;
}
mr.prototype.pushPending = function() {
  const t = new Fe("text", "", 0);
  return t.content = this.pending, t.level = this.pendingLevel, this.tokens.push(t), this.pending = "", t;
};
mr.prototype.push = function(t, e, n) {
  this.pending && this.pushPending();
  const r = new Fe(t, e, n);
  let i = null;
  return n < 0 && (this.level--, this.delimiters = this._prev_delimiters.pop()), r.level = this.level, n > 0 && (this.level++, this._prev_delimiters.push(this.delimiters), this.delimiters = [], i = { delimiters: this.delimiters }), this.pendingLevel = this.level, this.tokens.push(r), this.tokens_meta.push(i), r;
};
mr.prototype.scanDelims = function(t, e) {
  const n = this.posMax, r = this.src.charCodeAt(t), i = t > 0 ? this.src.charCodeAt(t - 1) : 32;
  let o = t;
  for (; o < n && this.src.charCodeAt(o) === r; )
    o++;
  const s = o - t, u = o < n ? this.src.charCodeAt(o) : 32, l = ur(i) || sr(String.fromCharCode(i)), a = ur(u) || sr(String.fromCharCode(u)), c = or(i), d = or(u), f = !d && (!a || c || l), h = !c && (!l || d || a);
  return { can_open: f && (e || !h || l), can_close: h && (e || !f || a), length: s };
};
mr.prototype.Token = Fe;
function D3(t) {
  switch (t) {
    case 10:
    case 33:
    case 35:
    case 36:
    case 37:
    case 38:
    case 42:
    case 43:
    case 45:
    case 58:
    case 60:
    case 61:
    case 62:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 125:
    case 126:
      return !0;
    default:
      return !1;
  }
}
function O3(t, e) {
  let n = t.pos;
  for (; n < t.posMax && !D3(t.src.charCodeAt(n)); )
    n++;
  return n === t.pos ? !1 : (e || (t.pending += t.src.slice(t.pos, n)), t.pos = n, !0);
}
const N3 = /(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;
function R3(t, e) {
  if (!t.md.options.linkify || t.linkLevel > 0) return !1;
  const n = t.pos, r = t.posMax;
  if (n + 3 > r || t.src.charCodeAt(n) !== 58 || t.src.charCodeAt(n + 1) !== 47 || t.src.charCodeAt(n + 2) !== 47) return !1;
  const i = t.pending.match(N3);
  if (!i) return !1;
  const o = i[1], s = t.md.linkify.matchAtStart(t.src.slice(n - o.length));
  if (!s) return !1;
  let u = s.url;
  if (u.length <= o.length) return !1;
  u = u.replace(/\*+$/, "");
  const l = t.md.normalizeLink(u);
  if (!t.md.validateLink(l)) return !1;
  if (!e) {
    t.pending = t.pending.slice(0, -o.length);
    const a = t.push("link_open", "a", 1);
    a.attrs = [["href", l]], a.markup = "linkify", a.info = "auto";
    const c = t.push("text", "", 0);
    c.content = t.md.normalizeLinkText(u);
    const d = t.push("link_close", "a", -1);
    d.markup = "linkify", d.info = "auto";
  }
  return t.pos += u.length - o.length, !0;
}
function I3(t, e) {
  let n = t.pos;
  if (t.src.charCodeAt(n) !== 10)
    return !1;
  const r = t.pending.length - 1, i = t.posMax;
  if (!e)
    if (r >= 0 && t.pending.charCodeAt(r) === 32)
      if (r >= 1 && t.pending.charCodeAt(r - 1) === 32) {
        let o = r - 1;
        for (; o >= 1 && t.pending.charCodeAt(o - 1) === 32; ) o--;
        t.pending = t.pending.slice(0, o), t.push("hardbreak", "br", 0);
      } else
        t.pending = t.pending.slice(0, -1), t.push("softbreak", "br", 0);
    else
      t.push("softbreak", "br", 0);
  for (n++; n < i && z(t.src.charCodeAt(n)); )
    n++;
  return t.pos = n, !0;
}
const Lu = [];
for (let t = 0; t < 256; t++)
  Lu.push(0);
"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(t) {
  Lu[t.charCodeAt(0)] = 1;
});
function L3(t, e) {
  let n = t.pos;
  const r = t.posMax;
  if (t.src.charCodeAt(n) !== 92 || (n++, n >= r)) return !1;
  let i = t.src.charCodeAt(n);
  if (i === 10) {
    for (e || t.push("hardbreak", "br", 0), n++; n < r && (i = t.src.charCodeAt(n), !!z(i)); )
      n++;
    return t.pos = n, !0;
  }
  let o = t.src[n];
  if (i >= 55296 && i <= 56319 && n + 1 < r) {
    const u = t.src.charCodeAt(n + 1);
    u >= 56320 && u <= 57343 && (o += t.src[n + 1], n++);
  }
  const s = "\\" + o;
  if (!e) {
    const u = t.push("text_special", "", 0);
    i < 256 && Lu[i] !== 0 ? u.content = o : u.content = s, u.markup = s, u.info = "escape";
  }
  return t.pos = n + 1, !0;
}
function F3(t, e) {
  let n = t.pos;
  if (t.src.charCodeAt(n) !== 96)
    return !1;
  const i = n;
  n++;
  const o = t.posMax;
  for (; n < o && t.src.charCodeAt(n) === 96; )
    n++;
  const s = t.src.slice(i, n), u = s.length;
  if (t.backticksScanned && (t.backticks[u] || 0) <= i)
    return e || (t.pending += s), t.pos += u, !0;
  let l = n, a;
  for (; (a = t.src.indexOf("`", l)) !== -1; ) {
    for (l = a + 1; l < o && t.src.charCodeAt(l) === 96; )
      l++;
    const c = l - a;
    if (c === u) {
      if (!e) {
        const d = t.push("code_inline", "code", 0);
        d.markup = s, d.content = t.src.slice(n, a).replace(/\n/g, " ").replace(/^ (.+) $/, "$1");
      }
      return t.pos = l, !0;
    }
    t.backticks[c] = a;
  }
  return t.backticksScanned = !0, e || (t.pending += s), t.pos += u, !0;
}
function P3(t, e) {
  const n = t.pos, r = t.src.charCodeAt(n);
  if (e || r !== 126)
    return !1;
  const i = t.scanDelims(t.pos, !0);
  let o = i.length;
  const s = String.fromCharCode(r);
  if (o < 2)
    return !1;
  let u;
  o % 2 && (u = t.push("text", "", 0), u.content = s, o--);
  for (let l = 0; l < o; l += 2)
    u = t.push("text", "", 0), u.content = s + s, t.delimiters.push({
      marker: r,
      length: 0,
      // disable "rule of 3" length checks meant for emphasis
      token: t.tokens.length - 1,
      end: -1,
      open: i.can_open,
      close: i.can_close
    });
  return t.pos += i.length, !0;
}
function Ja(t, e) {
  let n;
  const r = [], i = e.length;
  for (let o = 0; o < i; o++) {
    const s = e[o];
    if (s.marker !== 126 || s.end === -1)
      continue;
    const u = e[s.end];
    n = t.tokens[s.token], n.type = "s_open", n.tag = "s", n.nesting = 1, n.markup = "~~", n.content = "", n = t.tokens[u.token], n.type = "s_close", n.tag = "s", n.nesting = -1, n.markup = "~~", n.content = "", t.tokens[u.token - 1].type === "text" && t.tokens[u.token - 1].content === "~" && r.push(u.token - 1);
  }
  for (; r.length; ) {
    const o = r.pop();
    let s = o + 1;
    for (; s < t.tokens.length && t.tokens[s].type === "s_close"; )
      s++;
    s--, o !== s && (n = t.tokens[s], t.tokens[s] = t.tokens[o], t.tokens[o] = n);
  }
}
function B3(t) {
  const e = t.tokens_meta, n = t.tokens_meta.length;
  Ja(t, t.delimiters);
  for (let r = 0; r < n; r++)
    e[r] && e[r].delimiters && Ja(t, e[r].delimiters);
}
const Sh = {
  tokenize: P3,
  postProcess: B3
};
function z3(t, e) {
  const n = t.pos, r = t.src.charCodeAt(n);
  if (e || r !== 95 && r !== 42)
    return !1;
  const i = t.scanDelims(t.pos, r === 42);
  for (let o = 0; o < i.length; o++) {
    const s = t.push("text", "", 0);
    s.content = String.fromCharCode(r), t.delimiters.push({
      // Char code of the starting marker (number).
      //
      marker: r,
      // Total length of these series of delimiters.
      //
      length: i.length,
      // A position of the token this delimiter corresponds to.
      //
      token: t.tokens.length - 1,
      // If this delimiter is matched as a valid opener, `end` will be
      // equal to its position, otherwise it's `-1`.
      //
      end: -1,
      // Boolean flags that determine if this delimiter could open or close
      // an emphasis.
      //
      open: i.can_open,
      close: i.can_close
    });
  }
  return t.pos += i.length, !0;
}
function Ga(t, e) {
  const n = e.length;
  for (let r = n - 1; r >= 0; r--) {
    const i = e[r];
    if (i.marker !== 95 && i.marker !== 42 || i.end === -1)
      continue;
    const o = e[i.end], s = r > 0 && e[r - 1].end === i.end + 1 && // check that first two markers match and adjacent
    e[r - 1].marker === i.marker && e[r - 1].token === i.token - 1 && // check that last two markers are adjacent (we can safely assume they match)
    e[i.end + 1].token === o.token + 1, u = String.fromCharCode(i.marker), l = t.tokens[i.token];
    l.type = s ? "strong_open" : "em_open", l.tag = s ? "strong" : "em", l.nesting = 1, l.markup = s ? u + u : u, l.content = "";
    const a = t.tokens[o.token];
    a.type = s ? "strong_close" : "em_close", a.tag = s ? "strong" : "em", a.nesting = -1, a.markup = s ? u + u : u, a.content = "", s && (t.tokens[e[r - 1].token].content = "", t.tokens[e[i.end + 1].token].content = "", r--);
  }
}
function $3(t) {
  const e = t.tokens_meta, n = t.tokens_meta.length;
  Ga(t, t.delimiters);
  for (let r = 0; r < n; r++)
    e[r] && e[r].delimiters && Ga(t, e[r].delimiters);
}
const Ah = {
  tokenize: z3,
  postProcess: $3
};
function H3(t, e) {
  let n, r, i, o, s = "", u = "", l = t.pos, a = !0;
  if (t.src.charCodeAt(t.pos) !== 91)
    return !1;
  const c = t.pos, d = t.posMax, f = t.pos + 1, h = t.md.helpers.parseLinkLabel(t, t.pos, !0);
  if (h < 0)
    return !1;
  let p = h + 1;
  if (p < d && t.src.charCodeAt(p) === 40) {
    for (a = !1, p++; p < d && (n = t.src.charCodeAt(p), !(!z(n) && n !== 10)); p++)
      ;
    if (p >= d)
      return !1;
    if (l = p, i = t.md.helpers.parseLinkDestination(t.src, p, t.posMax), i.ok) {
      for (s = t.md.normalizeLink(i.str), t.md.validateLink(s) ? p = i.pos : s = "", l = p; p < d && (n = t.src.charCodeAt(p), !(!z(n) && n !== 10)); p++)
        ;
      if (i = t.md.helpers.parseLinkTitle(t.src, p, t.posMax), p < d && l !== p && i.ok)
        for (u = i.str, p = i.pos; p < d && (n = t.src.charCodeAt(p), !(!z(n) && n !== 10)); p++)
          ;
    }
    (p >= d || t.src.charCodeAt(p) !== 41) && (a = !0), p++;
  }
  if (a) {
    if (typeof t.env.references > "u")
      return !1;
    if (p < d && t.src.charCodeAt(p) === 91 ? (l = p + 1, p = t.md.helpers.parseLinkLabel(t, p), p >= 0 ? r = t.src.slice(l, p++) : p = h + 1) : p = h + 1, r || (r = t.src.slice(f, h)), o = t.env.references[ro(r)], !o)
      return t.pos = c, !1;
    s = o.href, u = o.title;
  }
  if (!e) {
    t.pos = f, t.posMax = h;
    const m = t.push("link_open", "a", 1), g = [["href", s]];
    m.attrs = g, u && g.push(["title", u]), t.linkLevel++, t.md.inline.tokenize(t), t.linkLevel--, t.push("link_close", "a", -1);
  }
  return t.pos = p, t.posMax = d, !0;
}
function V3(t, e) {
  let n, r, i, o, s, u, l, a, c = "";
  const d = t.pos, f = t.posMax;
  if (t.src.charCodeAt(t.pos) !== 33 || t.src.charCodeAt(t.pos + 1) !== 91)
    return !1;
  const h = t.pos + 2, p = t.md.helpers.parseLinkLabel(t, t.pos + 1, !1);
  if (p < 0)
    return !1;
  if (o = p + 1, o < f && t.src.charCodeAt(o) === 40) {
    for (o++; o < f && (n = t.src.charCodeAt(o), !(!z(n) && n !== 10)); o++)
      ;
    if (o >= f)
      return !1;
    for (a = o, u = t.md.helpers.parseLinkDestination(t.src, o, t.posMax), u.ok && (c = t.md.normalizeLink(u.str), t.md.validateLink(c) ? o = u.pos : c = ""), a = o; o < f && (n = t.src.charCodeAt(o), !(!z(n) && n !== 10)); o++)
      ;
    if (u = t.md.helpers.parseLinkTitle(t.src, o, t.posMax), o < f && a !== o && u.ok)
      for (l = u.str, o = u.pos; o < f && (n = t.src.charCodeAt(o), !(!z(n) && n !== 10)); o++)
        ;
    else
      l = "";
    if (o >= f || t.src.charCodeAt(o) !== 41)
      return t.pos = d, !1;
    o++;
  } else {
    if (typeof t.env.references > "u")
      return !1;
    if (o < f && t.src.charCodeAt(o) === 91 ? (a = o + 1, o = t.md.helpers.parseLinkLabel(t, o), o >= 0 ? i = t.src.slice(a, o++) : o = p + 1) : o = p + 1, i || (i = t.src.slice(h, p)), s = t.env.references[ro(i)], !s)
      return t.pos = d, !1;
    c = s.href, l = s.title;
  }
  if (!e) {
    r = t.src.slice(h, p);
    const m = [];
    t.md.inline.parse(
      r,
      t.md,
      t.env,
      m
    );
    const g = t.push("image", "img", 0), b = [["src", c], ["alt", ""]];
    g.attrs = b, g.children = m, g.content = r, l && b.push(["title", l]);
  }
  return t.pos = o, t.posMax = f, !0;
}
const j3 = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/, q3 = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
function W3(t, e) {
  let n = t.pos;
  if (t.src.charCodeAt(n) !== 60)
    return !1;
  const r = t.pos, i = t.posMax;
  for (; ; ) {
    if (++n >= i) return !1;
    const s = t.src.charCodeAt(n);
    if (s === 60) return !1;
    if (s === 62) break;
  }
  const o = t.src.slice(r + 1, n);
  if (q3.test(o)) {
    const s = t.md.normalizeLink(o);
    if (!t.md.validateLink(s))
      return !1;
    if (!e) {
      const u = t.push("link_open", "a", 1);
      u.attrs = [["href", s]], u.markup = "autolink", u.info = "auto";
      const l = t.push("text", "", 0);
      l.content = t.md.normalizeLinkText(o);
      const a = t.push("link_close", "a", -1);
      a.markup = "autolink", a.info = "auto";
    }
    return t.pos += o.length + 2, !0;
  }
  if (j3.test(o)) {
    const s = t.md.normalizeLink("mailto:" + o);
    if (!t.md.validateLink(s))
      return !1;
    if (!e) {
      const u = t.push("link_open", "a", 1);
      u.attrs = [["href", s]], u.markup = "autolink", u.info = "auto";
      const l = t.push("text", "", 0);
      l.content = t.md.normalizeLinkText(o);
      const a = t.push("link_close", "a", -1);
      a.markup = "autolink", a.info = "auto";
    }
    return t.pos += o.length + 2, !0;
  }
  return !1;
}
function U3(t) {
  return /^<a[>\s]/i.test(t);
}
function K3(t) {
  return /^<\/a\s*>/i.test(t);
}
function J3(t) {
  const e = t | 32;
  return e >= 97 && e <= 122;
}
function G3(t, e) {
  if (!t.md.options.html)
    return !1;
  const n = t.posMax, r = t.pos;
  if (t.src.charCodeAt(r) !== 60 || r + 2 >= n)
    return !1;
  const i = t.src.charCodeAt(r + 1);
  if (i !== 33 && i !== 63 && i !== 47 && !J3(i))
    return !1;
  const o = t.src.slice(r).match(S3);
  if (!o)
    return !1;
  if (!e) {
    const s = t.push("html_inline", "", 0);
    s.content = o[0], U3(s.content) && t.linkLevel++, K3(s.content) && t.linkLevel--;
  }
  return t.pos += o[0].length, !0;
}
const Z3 = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i, X3 = /^&([a-z][a-z0-9]{1,31});/i;
function Y3(t, e) {
  const n = t.pos, r = t.posMax;
  if (t.src.charCodeAt(n) !== 38 || n + 1 >= r) return !1;
  if (t.src.charCodeAt(n + 1) === 35) {
    const o = t.src.slice(n).match(Z3);
    if (o) {
      if (!e) {
        const s = o[1][0].toLowerCase() === "x" ? parseInt(o[1].slice(1), 16) : parseInt(o[1], 10), u = t.push("text_special", "", 0);
        u.content = Ru(s) ? Fi(s) : Fi(65533), u.markup = o[0], u.info = "entity";
      }
      return t.pos += o[0].length, !0;
    }
  } else {
    const o = t.src.slice(n).match(X3);
    if (o) {
      const s = bh(o[0]);
      if (s !== o[0]) {
        if (!e) {
          const u = t.push("text_special", "", 0);
          u.content = s, u.markup = o[0], u.info = "entity";
        }
        return t.pos += o[0].length, !0;
      }
    }
  }
  return !1;
}
function Za(t) {
  const e = {}, n = t.length;
  if (!n) return;
  let r = 0, i = -2;
  const o = [];
  for (let s = 0; s < n; s++) {
    const u = t[s];
    if (o.push(0), (t[r].marker !== u.marker || i !== u.token - 1) && (r = s), i = u.token, u.length = u.length || 0, !u.close) continue;
    e.hasOwnProperty(u.marker) || (e[u.marker] = [-1, -1, -1, -1, -1, -1]);
    const l = e[u.marker][(u.open ? 3 : 0) + u.length % 3];
    let a = r - o[r] - 1, c = a;
    for (; a > l; a -= o[a] + 1) {
      const d = t[a];
      if (d.marker === u.marker && d.open && d.end < 0) {
        let f = !1;
        if ((d.close || u.open) && (d.length + u.length) % 3 === 0 && (d.length % 3 !== 0 || u.length % 3 !== 0) && (f = !0), !f) {
          const h = a > 0 && !t[a - 1].open ? o[a - 1] + 1 : 0;
          o[s] = s - a + h, o[a] = h, u.open = !1, d.end = s, d.close = !1, c = -1, i = -2;
          break;
        }
      }
    }
    c !== -1 && (e[u.marker][(u.open ? 3 : 0) + (u.length || 0) % 3] = c);
  }
}
function Q3(t) {
  const e = t.tokens_meta, n = t.tokens_meta.length;
  Za(t.delimiters);
  for (let r = 0; r < n; r++)
    e[r] && e[r].delimiters && Za(e[r].delimiters);
}
function eC(t) {
  let e, n, r = 0;
  const i = t.tokens, o = t.tokens.length;
  for (e = n = 0; e < o; e++)
    i[e].nesting < 0 && r--, i[e].level = r, i[e].nesting > 0 && r++, i[e].type === "text" && e + 1 < o && i[e + 1].type === "text" ? i[e + 1].content = i[e].content + i[e + 1].content : (e !== n && (i[n] = i[e]), n++);
  e !== n && (i.length = n);
}
const jo = [
  ["text", O3],
  ["linkify", R3],
  ["newline", I3],
  ["escape", L3],
  ["backticks", F3],
  ["strikethrough", Sh.tokenize],
  ["emphasis", Ah.tokenize],
  ["link", H3],
  ["image", V3],
  ["autolink", W3],
  ["html_inline", G3],
  ["entity", Y3]
], qo = [
  ["balance_pairs", Q3],
  ["strikethrough", Sh.postProcess],
  ["emphasis", Ah.postProcess],
  // rules for pairs separate '**' into its own text tokens, which may be left unused,
  // rule below merges unused segments back with the rest of the text
  ["fragments_join", eC]
];
function gr() {
  this.ruler = new ke();
  for (let t = 0; t < jo.length; t++)
    this.ruler.push(jo[t][0], jo[t][1]);
  this.ruler2 = new ke();
  for (let t = 0; t < qo.length; t++)
    this.ruler2.push(qo[t][0], qo[t][1]);
}
gr.prototype.skipToken = function(t) {
  const e = t.pos, n = this.ruler.getRules(""), r = n.length, i = t.md.options.maxNesting, o = t.cache;
  if (typeof o[e] < "u") {
    t.pos = o[e];
    return;
  }
  let s = !1;
  if (t.level < i) {
    for (let u = 0; u < r; u++)
      if (t.level++, s = n[u](t, !0), t.level--, s) {
        if (e >= t.pos)
          throw new Error("inline rule didn't increment state.pos");
        break;
      }
  } else
    t.pos = t.posMax;
  s || t.pos++, o[e] = t.pos;
};
gr.prototype.tokenize = function(t) {
  const e = this.ruler.getRules(""), n = e.length, r = t.posMax, i = t.md.options.maxNesting;
  for (; t.pos < r; ) {
    const o = t.pos;
    let s = !1;
    if (t.level < i) {
      for (let u = 0; u < n; u++)
        if (s = e[u](t, !1), s) {
          if (o >= t.pos)
            throw new Error("inline rule didn't increment state.pos");
          break;
        }
    }
    if (s) {
      if (t.pos >= r)
        break;
      continue;
    }
    t.pending += t.src[t.pos++];
  }
  t.pending && t.pushPending();
};
gr.prototype.parse = function(t, e, n, r) {
  const i = new this.State(t, e, n, r);
  this.tokenize(i);
  const o = this.ruler2.getRules(""), s = o.length;
  for (let u = 0; u < s; u++)
    o[u](i);
};
gr.prototype.State = mr;
function tC(t) {
  const e = {};
  t = t || {}, e.src_Any = fh.source, e.src_Cc = hh.source, e.src_Z = mh.source, e.src_P = Ou.source, e.src_ZPCc = [e.src_Z, e.src_P, e.src_Cc].join("|"), e.src_ZCc = [e.src_Z, e.src_Cc].join("|");
  const n = "[><｜]";
  return e.src_pseudo_letter = "(?:(?!" + n + "|" + e.src_ZPCc + ")" + e.src_Any + ")", e.src_ip4 = "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)", e.src_auth = "(?:(?:(?!" + e.src_ZCc + "|[@/\\[\\]()]).)+@)?", e.src_port = "(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?", e.src_host_terminator = "(?=$|" + n + "|" + e.src_ZPCc + ")(?!" + (t["---"] ? "-(?!--)|" : "-|") + "_|:\\d|\\.-|\\.(?!$|" + e.src_ZPCc + "))", e.src_path = "(?:[/?#](?:(?!" + e.src_ZCc + "|" + n + `|[()[\\]{}.,"'?!\\-;]).|\\[(?:(?!` + e.src_ZCc + "|\\]).)*\\]|\\((?:(?!" + e.src_ZCc + "|[)]).)*\\)|\\{(?:(?!" + e.src_ZCc + '|[}]).)*\\}|\\"(?:(?!' + e.src_ZCc + `|["]).)+\\"|\\'(?:(?!` + e.src_ZCc + "|[']).)+\\'|\\'(?=" + e.src_pseudo_letter + "|[-])|\\.{2,}[a-zA-Z0-9%/&]|\\.(?!" + e.src_ZCc + "|[.]|$)|" + (t["---"] ? "\\-(?!--(?:[^-]|$))(?:-*)|" : "\\-+|") + // allow `,,,` in paths
  ",(?!" + e.src_ZCc + "|$)|;(?!" + e.src_ZCc + "|$)|\\!+(?!" + e.src_ZCc + "|[!]|$)|\\?(?!" + e.src_ZCc + "|[?]|$))+|\\/)?", e.src_email_name = '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*', e.src_xn = "xn--[a-z0-9\\-]{1,59}", e.src_domain_root = // Allow letters & digits (http://test1)
  "(?:" + e.src_xn + "|" + e.src_pseudo_letter + "{1,63})", e.src_domain = "(?:" + e.src_xn + "|(?:" + e.src_pseudo_letter + ")|(?:" + e.src_pseudo_letter + "(?:-|" + e.src_pseudo_letter + "){0,61}" + e.src_pseudo_letter + "))", e.src_host = "(?:(?:(?:(?:" + e.src_domain + ")\\.)*" + e.src_domain + "))", e.tpl_host_fuzzy = "(?:" + e.src_ip4 + "|(?:(?:(?:" + e.src_domain + ")\\.)+(?:%TLDS%)))", e.tpl_host_no_ip_fuzzy = "(?:(?:(?:" + e.src_domain + ")\\.)+(?:%TLDS%))", e.src_host_strict = e.src_host + e.src_host_terminator, e.tpl_host_fuzzy_strict = e.tpl_host_fuzzy + e.src_host_terminator, e.src_host_port_strict = e.src_host + e.src_port + e.src_host_terminator, e.tpl_host_port_fuzzy_strict = e.tpl_host_fuzzy + e.src_port + e.src_host_terminator, e.tpl_host_port_no_ip_fuzzy_strict = e.tpl_host_no_ip_fuzzy + e.src_port + e.src_host_terminator, e.tpl_host_fuzzy_test = "localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:" + e.src_ZPCc + "|>|$))", e.tpl_email_fuzzy = "(^|" + n + '|"|\\(|' + e.src_ZCc + ")(" + e.src_email_name + "@" + e.tpl_host_fuzzy_strict + ")", e.tpl_link_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
  // but can start with > (markdown blockquote)
  "(^|(?![.:/\\-_@])(?:[$+<=>^`|｜]|" + e.src_ZPCc + "))((?![$+<=>^`|｜])" + e.tpl_host_port_fuzzy_strict + e.src_path + ")", e.tpl_link_no_ip_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
  // but can start with > (markdown blockquote)
  "(^|(?![.:/\\-_@])(?:[$+<=>^`|｜]|" + e.src_ZPCc + "))((?![$+<=>^`|｜])" + e.tpl_host_port_no_ip_fuzzy_strict + e.src_path + ")", e;
}
function Fs(t) {
  return Array.prototype.slice.call(arguments, 1).forEach(function(n) {
    n && Object.keys(n).forEach(function(r) {
      t[r] = n[r];
    });
  }), t;
}
function oo(t) {
  return Object.prototype.toString.call(t);
}
function nC(t) {
  return oo(t) === "[object String]";
}
function rC(t) {
  return oo(t) === "[object Object]";
}
function iC(t) {
  return oo(t) === "[object RegExp]";
}
function Xa(t) {
  return oo(t) === "[object Function]";
}
function oC(t) {
  return t.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
}
const vh = {
  fuzzyLink: !0,
  fuzzyEmail: !0,
  fuzzyIP: !1
};
function sC(t) {
  return Object.keys(t || {}).reduce(function(e, n) {
    return e || vh.hasOwnProperty(n);
  }, !1);
}
const uC = {
  "http:": {
    validate: function(t, e, n) {
      const r = t.slice(e);
      return n.re.http || (n.re.http = new RegExp(
        "^\\/\\/" + n.re.src_auth + n.re.src_host_port_strict + n.re.src_path,
        "i"
      )), n.re.http.test(r) ? r.match(n.re.http)[0].length : 0;
    }
  },
  "https:": "http:",
  "ftp:": "http:",
  "//": {
    validate: function(t, e, n) {
      const r = t.slice(e);
      return n.re.no_http || (n.re.no_http = new RegExp(
        "^" + n.re.src_auth + // Don't allow single-level domains, because of false positives like '//test'
        // with code comments
        "(?:localhost|(?:(?:" + n.re.src_domain + ")\\.)+" + n.re.src_domain_root + ")" + n.re.src_port + n.re.src_host_terminator + n.re.src_path,
        "i"
      )), n.re.no_http.test(r) ? e >= 3 && t[e - 3] === ":" || e >= 3 && t[e - 3] === "/" ? 0 : r.match(n.re.no_http)[0].length : 0;
    }
  },
  "mailto:": {
    validate: function(t, e, n) {
      const r = t.slice(e);
      return n.re.mailto || (n.re.mailto = new RegExp(
        "^" + n.re.src_email_name + "@" + n.re.src_host_strict,
        "i"
      )), n.re.mailto.test(r) ? r.match(n.re.mailto)[0].length : 0;
    }
  }
}, lC = "a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]", aC = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф".split("|");
function cC(t) {
  t.__index__ = -1, t.__text_cache__ = "";
}
function dC(t) {
  return function(e, n) {
    const r = e.slice(n);
    return t.test(r) ? r.match(t)[0].length : 0;
  };
}
function Ya() {
  return function(t, e) {
    e.normalize(t);
  };
}
function Pi(t) {
  const e = t.re = tC(t.__opts__), n = t.__tlds__.slice();
  t.onCompile(), t.__tlds_replaced__ || n.push(lC), n.push(e.src_xn), e.src_tlds = n.join("|");
  function r(u) {
    return u.replace("%TLDS%", e.src_tlds);
  }
  e.email_fuzzy = RegExp(r(e.tpl_email_fuzzy), "i"), e.link_fuzzy = RegExp(r(e.tpl_link_fuzzy), "i"), e.link_no_ip_fuzzy = RegExp(r(e.tpl_link_no_ip_fuzzy), "i"), e.host_fuzzy_test = RegExp(r(e.tpl_host_fuzzy_test), "i");
  const i = [];
  t.__compiled__ = {};
  function o(u, l) {
    throw new Error('(LinkifyIt) Invalid schema "' + u + '": ' + l);
  }
  Object.keys(t.__schemas__).forEach(function(u) {
    const l = t.__schemas__[u];
    if (l === null)
      return;
    const a = { validate: null, link: null };
    if (t.__compiled__[u] = a, rC(l)) {
      iC(l.validate) ? a.validate = dC(l.validate) : Xa(l.validate) ? a.validate = l.validate : o(u, l), Xa(l.normalize) ? a.normalize = l.normalize : l.normalize ? o(u, l) : a.normalize = Ya();
      return;
    }
    if (nC(l)) {
      i.push(u);
      return;
    }
    o(u, l);
  }), i.forEach(function(u) {
    t.__compiled__[t.__schemas__[u]] && (t.__compiled__[u].validate = t.__compiled__[t.__schemas__[u]].validate, t.__compiled__[u].normalize = t.__compiled__[t.__schemas__[u]].normalize);
  }), t.__compiled__[""] = { validate: null, normalize: Ya() };
  const s = Object.keys(t.__compiled__).filter(function(u) {
    return u.length > 0 && t.__compiled__[u];
  }).map(oC).join("|");
  t.re.schema_test = RegExp("(^|(?!_)(?:[><｜]|" + e.src_ZPCc + "))(" + s + ")", "i"), t.re.schema_search = RegExp("(^|(?!_)(?:[><｜]|" + e.src_ZPCc + "))(" + s + ")", "ig"), t.re.schema_at_start = RegExp("^" + t.re.schema_search.source, "i"), t.re.pretest = RegExp(
    "(" + t.re.schema_test.source + ")|(" + t.re.host_fuzzy_test.source + ")|@",
    "i"
  ), cC(t);
}
function fC(t, e) {
  const n = t.__index__, r = t.__last_index__, i = t.__text_cache__.slice(n, r);
  this.schema = t.__schema__.toLowerCase(), this.index = n + e, this.lastIndex = r + e, this.raw = i, this.text = i, this.url = i;
}
function Ps(t, e) {
  const n = new fC(t, e);
  return t.__compiled__[n.schema].normalize(n, t), n;
}
function Ae(t, e) {
  if (!(this instanceof Ae))
    return new Ae(t, e);
  e || sC(t) && (e = t, t = {}), this.__opts__ = Fs({}, vh, e), this.__index__ = -1, this.__last_index__ = -1, this.__schema__ = "", this.__text_cache__ = "", this.__schemas__ = Fs({}, uC, t), this.__compiled__ = {}, this.__tlds__ = aC, this.__tlds_replaced__ = !1, this.re = {}, Pi(this);
}
Ae.prototype.add = function(e, n) {
  return this.__schemas__[e] = n, Pi(this), this;
};
Ae.prototype.set = function(e) {
  return this.__opts__ = Fs(this.__opts__, e), this;
};
Ae.prototype.test = function(e) {
  if (this.__text_cache__ = e, this.__index__ = -1, !e.length)
    return !1;
  let n, r, i, o, s, u, l, a, c;
  if (this.re.schema_test.test(e)) {
    for (l = this.re.schema_search, l.lastIndex = 0; (n = l.exec(e)) !== null; )
      if (o = this.testSchemaAt(e, n[2], l.lastIndex), o) {
        this.__schema__ = n[2], this.__index__ = n.index + n[1].length, this.__last_index__ = n.index + n[0].length + o;
        break;
      }
  }
  return this.__opts__.fuzzyLink && this.__compiled__["http:"] && (a = e.search(this.re.host_fuzzy_test), a >= 0 && (this.__index__ < 0 || a < this.__index__) && (r = e.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null && (s = r.index + r[1].length, (this.__index__ < 0 || s < this.__index__) && (this.__schema__ = "", this.__index__ = s, this.__last_index__ = r.index + r[0].length))), this.__opts__.fuzzyEmail && this.__compiled__["mailto:"] && (c = e.indexOf("@"), c >= 0 && (i = e.match(this.re.email_fuzzy)) !== null && (s = i.index + i[1].length, u = i.index + i[0].length, (this.__index__ < 0 || s < this.__index__ || s === this.__index__ && u > this.__last_index__) && (this.__schema__ = "mailto:", this.__index__ = s, this.__last_index__ = u))), this.__index__ >= 0;
};
Ae.prototype.pretest = function(e) {
  return this.re.pretest.test(e);
};
Ae.prototype.testSchemaAt = function(e, n, r) {
  return this.__compiled__[n.toLowerCase()] ? this.__compiled__[n.toLowerCase()].validate(e, r, this) : 0;
};
Ae.prototype.match = function(e) {
  const n = [];
  let r = 0;
  this.__index__ >= 0 && this.__text_cache__ === e && (n.push(Ps(this, r)), r = this.__last_index__);
  let i = r ? e.slice(r) : e;
  for (; this.test(i); )
    n.push(Ps(this, r)), i = i.slice(this.__last_index__), r += this.__last_index__;
  return n.length ? n : null;
};
Ae.prototype.matchAtStart = function(e) {
  if (this.__text_cache__ = e, this.__index__ = -1, !e.length) return null;
  const n = this.re.schema_at_start.exec(e);
  if (!n) return null;
  const r = this.testSchemaAt(e, n[2], n[0].length);
  return r ? (this.__schema__ = n[2], this.__index__ = n.index + n[1].length, this.__last_index__ = n.index + n[0].length + r, Ps(this, 0)) : null;
};
Ae.prototype.tlds = function(e, n) {
  return e = Array.isArray(e) ? e : [e], n ? (this.__tlds__ = this.__tlds__.concat(e).sort().filter(function(r, i, o) {
    return r !== o[i - 1];
  }).reverse(), Pi(this), this) : (this.__tlds__ = e.slice(), this.__tlds_replaced__ = !0, Pi(this), this);
};
Ae.prototype.normalize = function(e) {
  e.schema || (e.url = "http://" + e.url), e.schema === "mailto:" && !/^mailto:/i.test(e.url) && (e.url = "mailto:" + e.url);
};
Ae.prototype.onCompile = function() {
};
const dn = 2147483647, Ve = 36, Fu = 1, lr = 26, hC = 38, pC = 700, Mh = 72, Th = 128, _h = "-", mC = /^xn--/, gC = /[^\0-\x7F]/, bC = /[\x2E\u3002\uFF0E\uFF61]/g, yC = {
  overflow: "Overflow: input needs wider integers to process",
  "not-basic": "Illegal input >= 0x80 (not a basic code point)",
  "invalid-input": "Invalid input"
}, Wo = Ve - Fu, je = Math.floor, Uo = String.fromCharCode;
function pt(t) {
  throw new RangeError(yC[t]);
}
function kC(t, e) {
  const n = [];
  let r = t.length;
  for (; r--; )
    n[r] = e(t[r]);
  return n;
}
function Dh(t, e) {
  const n = t.split("@");
  let r = "";
  n.length > 1 && (r = n[0] + "@", t = n[1]), t = t.replace(bC, ".");
  const i = t.split("."), o = kC(i, e).join(".");
  return r + o;
}
function Oh(t) {
  const e = [];
  let n = 0;
  const r = t.length;
  for (; n < r; ) {
    const i = t.charCodeAt(n++);
    if (i >= 55296 && i <= 56319 && n < r) {
      const o = t.charCodeAt(n++);
      (o & 64512) == 56320 ? e.push(((i & 1023) << 10) + (o & 1023) + 65536) : (e.push(i), n--);
    } else
      e.push(i);
  }
  return e;
}
const xC = (t) => String.fromCodePoint(...t), CC = function(t) {
  return t >= 48 && t < 58 ? 26 + (t - 48) : t >= 65 && t < 91 ? t - 65 : t >= 97 && t < 123 ? t - 97 : Ve;
}, Qa = function(t, e) {
  return t + 22 + 75 * (t < 26) - ((e != 0) << 5);
}, Nh = function(t, e, n) {
  let r = 0;
  for (t = n ? je(t / pC) : t >> 1, t += je(t / e); t > Wo * lr >> 1; r += Ve)
    t = je(t / Wo);
  return je(r + (Wo + 1) * t / (t + hC));
}, Rh = function(t) {
  const e = [], n = t.length;
  let r = 0, i = Th, o = Mh, s = t.lastIndexOf(_h);
  s < 0 && (s = 0);
  for (let u = 0; u < s; ++u)
    t.charCodeAt(u) >= 128 && pt("not-basic"), e.push(t.charCodeAt(u));
  for (let u = s > 0 ? s + 1 : 0; u < n; ) {
    const l = r;
    for (let c = 1, d = Ve; ; d += Ve) {
      u >= n && pt("invalid-input");
      const f = CC(t.charCodeAt(u++));
      f >= Ve && pt("invalid-input"), f > je((dn - r) / c) && pt("overflow"), r += f * c;
      const h = d <= o ? Fu : d >= o + lr ? lr : d - o;
      if (f < h)
        break;
      const p = Ve - h;
      c > je(dn / p) && pt("overflow"), c *= p;
    }
    const a = e.length + 1;
    o = Nh(r - l, a, l == 0), je(r / a) > dn - i && pt("overflow"), i += je(r / a), r %= a, e.splice(r++, 0, i);
  }
  return String.fromCodePoint(...e);
}, Ih = function(t) {
  const e = [];
  t = Oh(t);
  const n = t.length;
  let r = Th, i = 0, o = Mh;
  for (const l of t)
    l < 128 && e.push(Uo(l));
  const s = e.length;
  let u = s;
  for (s && e.push(_h); u < n; ) {
    let l = dn;
    for (const c of t)
      c >= r && c < l && (l = c);
    const a = u + 1;
    l - r > je((dn - i) / a) && pt("overflow"), i += (l - r) * a, r = l;
    for (const c of t)
      if (c < r && ++i > dn && pt("overflow"), c === r) {
        let d = i;
        for (let f = Ve; ; f += Ve) {
          const h = f <= o ? Fu : f >= o + lr ? lr : f - o;
          if (d < h)
            break;
          const p = d - h, m = Ve - h;
          e.push(
            Uo(Qa(h + p % m, 0))
          ), d = je(p / m);
        }
        e.push(Uo(Qa(d, 0))), o = Nh(i, a, u === s), i = 0, ++u;
      }
    ++i, ++r;
  }
  return e.join("");
}, wC = function(t) {
  return Dh(t, function(e) {
    return mC.test(e) ? Rh(e.slice(4).toLowerCase()) : e;
  });
}, EC = function(t) {
  return Dh(t, function(e) {
    return gC.test(e) ? "xn--" + Ih(e) : e;
  });
}, Lh = {
  /**
   * A string representing the current Punycode.js version number.
   * @memberOf punycode
   * @type String
   */
  version: "2.3.1",
  /**
   * An object of methods to convert from JavaScript's internal character
   * representation (UCS-2) to Unicode code points, and back.
   * @see <https://mathiasbynens.be/notes/javascript-encoding>
   * @memberOf punycode
   * @type Object
   */
  ucs2: {
    decode: Oh,
    encode: xC
  },
  decode: Rh,
  encode: Ih,
  toASCII: EC,
  toUnicode: wC
}, SC = {
  options: {
    // Enable HTML tags in source
    html: !1,
    // Use '/' to close single tags (<br />)
    xhtmlOut: !1,
    // Convert '\n' in paragraphs into <br>
    breaks: !1,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: !1,
    // Enable some language-neutral replacements + quotes beautification
    typographer: !1,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "“”‘’",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 100
  },
  components: {
    core: {},
    block: {},
    inline: {}
  }
}, AC = {
  options: {
    // Enable HTML tags in source
    html: !1,
    // Use '/' to close single tags (<br />)
    xhtmlOut: !1,
    // Convert '\n' in paragraphs into <br>
    breaks: !1,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: !1,
    // Enable some language-neutral replacements + quotes beautification
    typographer: !1,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "“”‘’",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 20
  },
  components: {
    core: {
      rules: [
        "normalize",
        "block",
        "inline",
        "text_join"
      ]
    },
    block: {
      rules: [
        "paragraph"
      ]
    },
    inline: {
      rules: [
        "text"
      ],
      rules2: [
        "balance_pairs",
        "fragments_join"
      ]
    }
  }
}, vC = {
  options: {
    // Enable HTML tags in source
    html: !0,
    // Use '/' to close single tags (<br />)
    xhtmlOut: !0,
    // Convert '\n' in paragraphs into <br>
    breaks: !1,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: !1,
    // Enable some language-neutral replacements + quotes beautification
    typographer: !1,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "“”‘’",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 20
  },
  components: {
    core: {
      rules: [
        "normalize",
        "block",
        "inline",
        "text_join"
      ]
    },
    block: {
      rules: [
        "blockquote",
        "code",
        "fence",
        "heading",
        "hr",
        "html_block",
        "lheading",
        "list",
        "reference",
        "paragraph"
      ]
    },
    inline: {
      rules: [
        "autolink",
        "backticks",
        "emphasis",
        "entity",
        "escape",
        "html_inline",
        "image",
        "link",
        "newline",
        "text"
      ],
      rules2: [
        "balance_pairs",
        "emphasis",
        "fragments_join"
      ]
    }
  }
}, MC = {
  default: SC,
  zero: AC,
  commonmark: vC
}, TC = /^(vbscript|javascript|file|data):/, _C = /^data:image\/(gif|png|jpeg|webp);/;
function DC(t) {
  const e = t.trim().toLowerCase();
  return TC.test(e) ? _C.test(e) : !0;
}
const Fh = ["http:", "https:", "mailto:"];
function OC(t) {
  const e = Du(t, !0);
  if (e.hostname && (!e.protocol || Fh.indexOf(e.protocol) >= 0))
    try {
      e.hostname = Lh.toASCII(e.hostname);
    } catch {
    }
  return pr(_u(e));
}
function NC(t) {
  const e = Du(t, !0);
  if (e.hostname && (!e.protocol || Fh.indexOf(e.protocol) >= 0))
    try {
      e.hostname = Lh.toUnicode(e.hostname);
    } catch {
    }
  return kn(_u(e), kn.defaultChars + "%");
}
function xe(t, e) {
  if (!(this instanceof xe))
    return new xe(t, e);
  e || Nu(t) || (e = t || {}, t = "default"), this.inline = new gr(), this.block = new io(), this.core = new Iu(), this.renderer = new wn(), this.linkify = new Ae(), this.validateLink = DC, this.normalizeLink = OC, this.normalizeLinkText = NC, this.utils = Ix, this.helpers = no({}, Bx), this.options = {}, this.configure(t), e && this.set(e);
}
xe.prototype.set = function(t) {
  return no(this.options, t), this;
};
xe.prototype.configure = function(t) {
  const e = this;
  if (Nu(t)) {
    const n = t;
    if (t = MC[n], !t)
      throw new Error('Wrong `markdown-it` preset "' + n + '", check name');
  }
  if (!t)
    throw new Error("Wrong `markdown-it` preset, can't be empty");
  return t.options && e.set(t.options), t.components && Object.keys(t.components).forEach(function(n) {
    t.components[n].rules && e[n].ruler.enableOnly(t.components[n].rules), t.components[n].rules2 && e[n].ruler2.enableOnly(t.components[n].rules2);
  }), this;
};
xe.prototype.enable = function(t, e) {
  let n = [];
  Array.isArray(t) || (t = [t]), ["core", "block", "inline"].forEach(function(i) {
    n = n.concat(this[i].ruler.enable(t, !0));
  }, this), n = n.concat(this.inline.ruler2.enable(t, !0));
  const r = t.filter(function(i) {
    return n.indexOf(i) < 0;
  });
  if (r.length && !e)
    throw new Error("MarkdownIt. Failed to enable unknown rule(s): " + r);
  return this;
};
xe.prototype.disable = function(t, e) {
  let n = [];
  Array.isArray(t) || (t = [t]), ["core", "block", "inline"].forEach(function(i) {
    n = n.concat(this[i].ruler.disable(t, !0));
  }, this), n = n.concat(this.inline.ruler2.disable(t, !0));
  const r = t.filter(function(i) {
    return n.indexOf(i) < 0;
  });
  if (r.length && !e)
    throw new Error("MarkdownIt. Failed to disable unknown rule(s): " + r);
  return this;
};
xe.prototype.use = function(t) {
  const e = [this].concat(Array.prototype.slice.call(arguments, 1));
  return t.apply(t, e), this;
};
xe.prototype.parse = function(t, e) {
  if (typeof t != "string")
    throw new Error("Input data should be a String");
  const n = new this.core.State(t, this, e);
  return this.core.process(n), n.tokens;
};
xe.prototype.render = function(t, e) {
  return e = e || {}, this.renderer.render(this.parse(t, e), this.options, e);
};
xe.prototype.parseInline = function(t, e) {
  const n = new this.core.State(t, this, e);
  return n.inlineMode = !0, this.core.process(n), n.tokens;
};
xe.prototype.renderInline = function(t, e) {
  return e = e || {}, this.renderer.render(this.parseInline(t, e), this.options, e);
};
const RC = new $s({
  nodes: {
    doc: {
      content: "block+"
    },
    paragraph: {
      content: "inline*",
      group: "block",
      parseDOM: [{ tag: "p" }],
      toDOM() {
        return ["p", 0];
      }
    },
    blockquote: {
      content: "block+",
      group: "block",
      parseDOM: [{ tag: "blockquote" }],
      toDOM() {
        return ["blockquote", 0];
      }
    },
    horizontal_rule: {
      group: "block",
      parseDOM: [{ tag: "hr" }],
      toDOM() {
        return ["div", ["hr"]];
      }
    },
    heading: {
      attrs: { level: { default: 1 } },
      content: "(text | image)*",
      group: "block",
      defining: !0,
      parseDOM: [
        { tag: "h1", attrs: { level: 1 } },
        { tag: "h2", attrs: { level: 2 } },
        { tag: "h3", attrs: { level: 3 } },
        { tag: "h4", attrs: { level: 4 } },
        { tag: "h5", attrs: { level: 5 } },
        { tag: "h6", attrs: { level: 6 } }
      ],
      toDOM(t) {
        return ["h" + t.attrs.level, 0];
      }
    },
    code_block: {
      content: "text*",
      group: "block",
      code: !0,
      defining: !0,
      marks: "",
      attrs: { params: { default: "" } },
      parseDOM: [{ tag: "pre", preserveWhitespace: "full", getAttrs: (t) => ({ params: t.getAttribute("data-params") || "" }) }],
      toDOM(t) {
        return ["pre", t.attrs.params ? { "data-params": t.attrs.params } : {}, ["code", 0]];
      }
    },
    ordered_list: {
      content: "list_item+",
      group: "block",
      attrs: { order: { default: 1 }, tight: { default: !1 } },
      parseDOM: [{ tag: "ol", getAttrs(t) {
        return {
          order: t.hasAttribute("start") ? +t.getAttribute("start") : 1,
          tight: t.hasAttribute("data-tight")
        };
      } }],
      toDOM(t) {
        return ["ol", {
          start: t.attrs.order == 1 ? null : t.attrs.order,
          "data-tight": t.attrs.tight ? "true" : null
        }, 0];
      }
    },
    bullet_list: {
      content: "list_item+",
      group: "block",
      attrs: { tight: { default: !1 } },
      parseDOM: [{ tag: "ul", getAttrs: (t) => ({ tight: t.hasAttribute("data-tight") }) }],
      toDOM(t) {
        return ["ul", { "data-tight": t.attrs.tight ? "true" : null }, 0];
      }
    },
    list_item: {
      content: "block+",
      defining: !0,
      parseDOM: [{ tag: "li" }],
      toDOM() {
        return ["li", 0];
      }
    },
    text: {
      group: "inline"
    },
    image: {
      inline: !0,
      attrs: {
        src: {},
        alt: { default: null },
        title: { default: null }
      },
      group: "inline",
      draggable: !0,
      parseDOM: [{ tag: "img[src]", getAttrs(t) {
        return {
          src: t.getAttribute("src"),
          title: t.getAttribute("title"),
          alt: t.getAttribute("alt")
        };
      } }],
      toDOM(t) {
        return ["img", t.attrs];
      }
    },
    hard_break: {
      inline: !0,
      group: "inline",
      selectable: !1,
      parseDOM: [{ tag: "br" }],
      toDOM() {
        return ["br"];
      }
    }
  },
  marks: {
    em: {
      parseDOM: [
        { tag: "i" },
        { tag: "em" },
        { style: "font-style=italic" },
        { style: "font-style=normal", clearMark: (t) => t.type.name == "em" }
      ],
      toDOM() {
        return ["em"];
      }
    },
    strong: {
      parseDOM: [
        { tag: "strong" },
        { tag: "b", getAttrs: (t) => t.style.fontWeight != "normal" && null },
        { style: "font-weight=400", clearMark: (t) => t.type.name == "strong" },
        { style: "font-weight", getAttrs: (t) => /^(bold(er)?|[5-9]\d{2,})$/.test(t) && null }
      ],
      toDOM() {
        return ["strong"];
      }
    },
    link: {
      attrs: {
        href: {},
        title: { default: null }
      },
      inclusive: !1,
      parseDOM: [{ tag: "a[href]", getAttrs(t) {
        return { href: t.getAttribute("href"), title: t.getAttribute("title") };
      } }],
      toDOM(t) {
        return ["a", t.attrs];
      }
    },
    code: {
      code: !0,
      parseDOM: [{ tag: "code" }],
      toDOM() {
        return ["code"];
      }
    }
  }
});
function IC(t, e) {
  if (t.isText && e.isText && P.sameSet(t.marks, e.marks))
    return t.withText(t.text + e.text);
}
class LC {
  constructor(e, n) {
    this.schema = e, this.tokenHandlers = n, this.stack = [{ type: e.topNodeType, attrs: null, content: [], marks: P.none }];
  }
  top() {
    return this.stack[this.stack.length - 1];
  }
  push(e) {
    this.stack.length && this.top().content.push(e);
  }
  // Adds the given text to the current position in the document,
  // using the current marks as styling.
  addText(e) {
    if (!e)
      return;
    let n = this.top(), r = n.content, i = r[r.length - 1], o = this.schema.text(e, n.marks), s;
    i && (s = IC(i, o)) ? r[r.length - 1] = s : r.push(o);
  }
  // Adds the given mark to the set of active marks.
  openMark(e) {
    let n = this.top();
    n.marks = e.addToSet(n.marks);
  }
  // Removes the given mark from the set of active marks.
  closeMark(e) {
    let n = this.top();
    n.marks = e.removeFromSet(n.marks);
  }
  parseTokens(e) {
    for (let n = 0; n < e.length; n++) {
      let r = e[n], i = this.tokenHandlers[r.type];
      if (!i)
        throw new Error("Token type `" + r.type + "` not supported by Markdown parser");
      i(this, r, e, n);
    }
  }
  // Add a node at the current position.
  addNode(e, n, r) {
    let i = this.top(), o = e.createAndFill(n, r, i ? i.marks : []);
    return o ? (this.push(o), o) : null;
  }
  // Wrap subsequent content in a node of the given type.
  openNode(e, n) {
    this.stack.push({ type: e, attrs: n, content: [], marks: P.none });
  }
  // Close and return the node that is currently on top of the stack.
  closeNode() {
    let e = this.stack.pop();
    return this.addNode(e.type, e.attrs, e.content);
  }
}
function _n(t, e, n, r) {
  return t.getAttrs ? t.getAttrs(e, n, r) : t.attrs instanceof Function ? t.attrs(e) : t.attrs;
}
function Ko(t, e) {
  return t.noCloseToken || e == "code_inline" || e == "code_block" || e == "fence";
}
function ec(t) {
  return t[t.length - 1] == `
` ? t.slice(0, t.length - 1) : t;
}
function Jo() {
}
function FC(t, e) {
  let n = /* @__PURE__ */ Object.create(null);
  for (let r in e) {
    let i = e[r];
    if (i.block) {
      let o = t.nodeType(i.block);
      Ko(i, r) ? n[r] = (s, u, l, a) => {
        s.openNode(o, _n(i, u, l, a)), s.addText(ec(u.content)), s.closeNode();
      } : (n[r + "_open"] = (s, u, l, a) => s.openNode(o, _n(i, u, l, a)), n[r + "_close"] = (s) => s.closeNode());
    } else if (i.node) {
      let o = t.nodeType(i.node);
      n[r] = (s, u, l, a) => s.addNode(o, _n(i, u, l, a));
    } else if (i.mark) {
      let o = t.marks[i.mark];
      Ko(i, r) ? n[r] = (s, u, l, a) => {
        s.openMark(o.create(_n(i, u, l, a))), s.addText(ec(u.content)), s.closeMark(o);
      } : (n[r + "_open"] = (s, u, l, a) => s.openMark(o.create(_n(i, u, l, a))), n[r + "_close"] = (s) => s.closeMark(o));
    } else if (i.ignore)
      Ko(i, r) ? n[r] = Jo : (n[r + "_open"] = Jo, n[r + "_close"] = Jo);
    else
      throw new RangeError("Unrecognized parsing spec " + JSON.stringify(i));
  }
  return n.text = (r, i) => r.addText(i.content), n.inline = (r, i) => r.parseTokens(i.children), n.softbreak = n.softbreak || ((r) => r.addText(" ")), n;
}
let PC = class {
  /**
  Create a parser with the given configuration. You can configure
  the markdown-it parser to parse the dialect you want, and provide
  a description of the ProseMirror entities those tokens map to in
  the `tokens` object, which maps token names to descriptions of
  what to do with them. Such a description is an object, and may
  have the following properties:
  */
  constructor(e, n, r) {
    this.schema = e, this.tokenizer = n, this.tokens = r, this.tokenHandlers = FC(e, r);
  }
  /**
  Parse a string as [CommonMark](http://commonmark.org/) markup,
  and create a ProseMirror document as prescribed by this parser's
  rules.
  
  The second argument, when given, is passed through to the
  [Markdown
  parser](https://markdown-it.github.io/markdown-it/#MarkdownIt.parse).
  */
  parse(e, n = {}) {
    let r = new LC(this.schema, this.tokenHandlers), i;
    r.parseTokens(this.tokenizer.parse(e, n));
    do
      i = r.closeNode();
    while (r.stack.length);
    return i || this.schema.topNodeType.createAndFill();
  }
};
function tc(t, e) {
  for (; ++e < t.length; )
    if (t[e].type != "list_item_open")
      return t[e].hidden;
  return !1;
}
new PC(RC, xe("commonmark", { html: !1 }), {
  blockquote: { block: "blockquote" },
  paragraph: { block: "paragraph" },
  list_item: { block: "list_item" },
  bullet_list: { block: "bullet_list", getAttrs: (t, e, n) => ({ tight: tc(e, n) }) },
  ordered_list: { block: "ordered_list", getAttrs: (t, e, n) => ({
    order: +t.attrGet("start") || 1,
    tight: tc(e, n)
  }) },
  heading: { block: "heading", getAttrs: (t) => ({ level: +t.tag.slice(1) }) },
  code_block: { block: "code_block", noCloseToken: !0 },
  fence: { block: "code_block", getAttrs: (t) => ({ params: t.info || "" }), noCloseToken: !0 },
  hr: { node: "horizontal_rule" },
  image: { node: "image", getAttrs: (t) => ({
    src: t.attrGet("src"),
    title: t.attrGet("title") || null,
    alt: t.children[0] && t.children[0].content || null
  }) },
  hardbreak: { node: "hard_break" },
  em: { mark: "em" },
  strong: { mark: "strong" },
  link: { mark: "link", getAttrs: (t) => ({
    href: t.attrGet("href"),
    title: t.attrGet("title") || null
  }) },
  code_inline: { mark: "code", noCloseToken: !0 }
});
const BC = { open: "", close: "", mixable: !0 };
let zC = class {
  /**
  Construct a serializer with the given configuration. The `nodes`
  object should map node names in a given schema to function that
  take a serializer state and such a node, and serialize the node.
  */
  constructor(e, n, r = {}) {
    this.nodes = e, this.marks = n, this.options = r;
  }
  /**
  Serialize the content of the given node to
  [CommonMark](http://commonmark.org/).
  */
  serialize(e, n = {}) {
    n = Object.assign({}, this.options, n);
    let r = new Ph(this.nodes, this.marks, n);
    return r.renderContent(e), r.out;
  }
};
const Ge = new zC({
  blockquote(t, e) {
    t.wrapBlock("> ", null, e, () => t.renderContent(e));
  },
  code_block(t, e) {
    const n = e.textContent.match(/`{3,}/gm), r = n ? n.sort().slice(-1)[0] + "`" : "```";
    t.write(r + (e.attrs.params || "") + `
`), t.text(e.textContent, !1), t.write(`
`), t.write(r), t.closeBlock(e);
  },
  heading(t, e) {
    t.write(t.repeat("#", e.attrs.level) + " "), t.renderInline(e, !1), t.closeBlock(e);
  },
  horizontal_rule(t, e) {
    t.write(e.attrs.markup || "---"), t.closeBlock(e);
  },
  bullet_list(t, e) {
    t.renderList(e, "  ", () => (e.attrs.bullet || "*") + " ");
  },
  ordered_list(t, e) {
    let n = e.attrs.order || 1, r = String(n + e.childCount - 1).length, i = t.repeat(" ", r + 2);
    t.renderList(e, i, (o) => {
      let s = String(n + o);
      return t.repeat(" ", r - s.length) + s + ". ";
    });
  },
  list_item(t, e) {
    t.renderContent(e);
  },
  paragraph(t, e) {
    t.renderInline(e), t.closeBlock(e);
  },
  image(t, e) {
    t.write("![" + t.esc(e.attrs.alt || "") + "](" + e.attrs.src.replace(/[\(\)]/g, "\\$&") + (e.attrs.title ? ' "' + e.attrs.title.replace(/"/g, '\\"') + '"' : "") + ")");
  },
  hard_break(t, e, n, r) {
    for (let i = r + 1; i < n.childCount; i++)
      if (n.child(i).type != e.type) {
        t.write(`\\
`);
        return;
      }
  },
  text(t, e) {
    t.text(e.text, !t.inAutolink);
  }
}, {
  em: { open: "*", close: "*", mixable: !0, expelEnclosingWhitespace: !0 },
  strong: { open: "**", close: "**", mixable: !0, expelEnclosingWhitespace: !0 },
  link: {
    open(t, e, n, r) {
      return t.inAutolink = $C(e, n, r), t.inAutolink ? "<" : "[";
    },
    close(t, e, n, r) {
      let { inAutolink: i } = t;
      return t.inAutolink = void 0, i ? ">" : "](" + e.attrs.href.replace(/[\(\)"]/g, "\\$&") + (e.attrs.title ? ` "${e.attrs.title.replace(/"/g, '\\"')}"` : "") + ")";
    },
    mixable: !0
  },
  code: {
    open(t, e, n, r) {
      return nc(n.child(r), -1);
    },
    close(t, e, n, r) {
      return nc(n.child(r - 1), 1);
    },
    escape: !1
  }
});
function nc(t, e) {
  let n = /`+/g, r, i = 0;
  if (t.isText)
    for (; r = n.exec(t.text); )
      i = Math.max(i, r[0].length);
  let o = i > 0 && e > 0 ? " `" : "`";
  for (let s = 0; s < i; s++)
    o += "`";
  return i > 0 && e < 0 && (o += " "), o;
}
function $C(t, e, n) {
  if (t.attrs.title || !/^\w+:/.test(t.attrs.href))
    return !1;
  let r = e.child(n);
  return !r.isText || r.text != t.attrs.href || r.marks[r.marks.length - 1] != t ? !1 : n == e.childCount - 1 || !t.isInSet(e.child(n + 1).marks);
}
let Ph = class {
  /**
  @internal
  */
  constructor(e, n, r) {
    this.nodes = e, this.marks = n, this.options = r, this.delim = "", this.out = "", this.closed = null, this.inAutolink = void 0, this.atBlockStart = !1, this.inTightList = !1, typeof this.options.tightLists > "u" && (this.options.tightLists = !1), typeof this.options.hardBreakNodeName > "u" && (this.options.hardBreakNodeName = "hard_break");
  }
  /**
  @internal
  */
  flushClose(e = 2) {
    if (this.closed) {
      if (this.atBlank() || (this.out += `
`), e > 1) {
        let n = this.delim, r = /\s+$/.exec(n);
        r && (n = n.slice(0, n.length - r[0].length));
        for (let i = 1; i < e; i++)
          this.out += n + `
`;
      }
      this.closed = null;
    }
  }
  /**
  @internal
  */
  getMark(e) {
    let n = this.marks[e];
    if (!n) {
      if (this.options.strict !== !1)
        throw new Error(`Mark type \`${e}\` not supported by Markdown renderer`);
      n = BC;
    }
    return n;
  }
  /**
  Render a block, prefixing each line with `delim`, and the first
  line in `firstDelim`. `node` should be the node that is closed at
  the end of the block, and `f` is a function that renders the
  content of the block.
  */
  wrapBlock(e, n, r, i) {
    let o = this.delim;
    this.write(n ?? e), this.delim += e, i(), this.delim = o, this.closeBlock(r);
  }
  /**
  @internal
  */
  atBlank() {
    return /(^|\n)$/.test(this.out);
  }
  /**
  Ensure the current content ends with a newline.
  */
  ensureNewLine() {
    this.atBlank() || (this.out += `
`);
  }
  /**
  Prepare the state for writing output (closing closed paragraphs,
  adding delimiters, and so on), and then optionally add content
  (unescaped) to the output.
  */
  write(e) {
    this.flushClose(), this.delim && this.atBlank() && (this.out += this.delim), e && (this.out += e);
  }
  /**
  Close the block for the given node.
  */
  closeBlock(e) {
    this.closed = e;
  }
  /**
  Add the given text to the document. When escape is not `false`,
  it will be escaped.
  */
  text(e, n = !0) {
    let r = e.split(`
`);
    for (let i = 0; i < r.length; i++)
      this.write(), !n && r[i][0] == "[" && /(^|[^\\])\!$/.test(this.out) && (this.out = this.out.slice(0, this.out.length - 1) + "\\!"), this.out += n ? this.esc(r[i], this.atBlockStart) : r[i], i != r.length - 1 && (this.out += `
`);
  }
  /**
  Render the given node as a block.
  */
  render(e, n, r) {
    if (this.nodes[e.type.name])
      this.nodes[e.type.name](this, e, n, r);
    else {
      if (this.options.strict !== !1)
        throw new Error("Token type `" + e.type.name + "` not supported by Markdown renderer");
      e.type.isLeaf || (e.type.inlineContent ? this.renderInline(e) : this.renderContent(e), e.isBlock && this.closeBlock(e));
    }
  }
  /**
  Render the contents of `parent` as block nodes.
  */
  renderContent(e) {
    e.forEach((n, r, i) => this.render(n, e, i));
  }
  /**
  Render the contents of `parent` as inline content.
  */
  renderInline(e, n = !0) {
    this.atBlockStart = n;
    let r = [], i = "", o = (s, u, l) => {
      let a = s ? s.marks : [];
      s && s.type.name === this.options.hardBreakNodeName && (a = a.filter((m) => {
        if (l + 1 == e.childCount)
          return !1;
        let g = e.child(l + 1);
        return m.isInSet(g.marks) && (!g.isText || /\S/.test(g.text));
      }));
      let c = i;
      if (i = "", s && s.isText && a.some((m) => {
        let g = this.getMark(m.type.name);
        return g && g.expelEnclosingWhitespace && !m.isInSet(r);
      })) {
        let [m, g, b] = /^(\s*)(.*)$/m.exec(s.text);
        g && (c += g, s = b ? s.withText(b) : null, s || (a = r));
      }
      if (s && s.isText && a.some((m) => {
        let g = this.getMark(m.type.name);
        return g && g.expelEnclosingWhitespace && !this.isMarkAhead(e, l + 1, m);
      })) {
        let [m, g, b] = /^(.*?)(\s*)$/m.exec(s.text);
        b && (i = b, s = g ? s.withText(g) : null, s || (a = r));
      }
      let d = a.length ? a[a.length - 1] : null, f = d && this.getMark(d.type.name).escape === !1, h = a.length - (f ? 1 : 0);
      e: for (let m = 0; m < h; m++) {
        let g = a[m];
        if (!this.getMark(g.type.name).mixable)
          break;
        for (let b = 0; b < r.length; b++) {
          let y = r[b];
          if (!this.getMark(y.type.name).mixable)
            break;
          if (g.eq(y)) {
            m > b ? a = a.slice(0, b).concat(g).concat(a.slice(b, m)).concat(a.slice(m + 1, h)) : b > m && (a = a.slice(0, m).concat(a.slice(m + 1, b)).concat(g).concat(a.slice(b, h)));
            continue e;
          }
        }
      }
      let p = 0;
      for (; p < Math.min(r.length, h) && a[p].eq(r[p]); )
        ++p;
      for (; p < r.length; )
        this.text(this.markString(r.pop(), !1, e, l), !1);
      if (c && this.text(c), s) {
        for (; r.length < h; ) {
          let m = a[r.length];
          r.push(m), this.text(this.markString(m, !0, e, l), !1), this.atBlockStart = !1;
        }
        f && s.isText ? this.text(this.markString(d, !0, e, l) + s.text + this.markString(d, !1, e, l + 1), !1) : this.render(s, e, l), this.atBlockStart = !1;
      }
      s?.isText && s.nodeSize > 0 && (this.atBlockStart = !1);
    };
    e.forEach(o), o(null, 0, e.childCount), this.atBlockStart = !1;
  }
  /**
  Render a node's content as a list. `delim` should be the extra
  indentation added to all lines except the first in an item,
  `firstDelim` is a function going from an item index to a
  delimiter for the first line of the item.
  */
  renderList(e, n, r) {
    this.closed && this.closed.type == e.type ? this.flushClose(3) : this.inTightList && this.flushClose(1);
    let i = typeof e.attrs.tight < "u" ? e.attrs.tight : this.options.tightLists, o = this.inTightList;
    this.inTightList = i, e.forEach((s, u, l) => {
      l && i && this.flushClose(1), this.wrapBlock(n, r(l), e, () => this.render(s, e, l));
    }), this.inTightList = o;
  }
  /**
  Escape the given string so that it can safely appear in Markdown
  content. If `startOfLine` is true, also escape characters that
  have special meaning only at the start of the line.
  */
  esc(e, n = !1) {
    return e = e.replace(/[`*\\~\[\]_]/g, (r, i) => r == "_" && i > 0 && i + 1 < e.length && e[i - 1].match(/\w/) && e[i + 1].match(/\w/) ? r : "\\" + r), n && (e = e.replace(/^(\+[ ]|[\-*>])/, "\\$&").replace(/^(\s*)(#{1,6})(\s|$)/, "$1\\$2$3").replace(/^(\s*\d+)\.\s/, "$1\\. ")), this.options.escapeExtraCharacters && (e = e.replace(this.options.escapeExtraCharacters, "\\$&")), e;
  }
  /**
  @internal
  */
  quote(e) {
    let n = e.indexOf('"') == -1 ? '""' : e.indexOf("'") == -1 ? "''" : "()";
    return n[0] + e + n[1];
  }
  /**
  Repeat the given string `n` times.
  */
  repeat(e, n) {
    let r = "";
    for (let i = 0; i < n; i++)
      r += e;
    return r;
  }
  /**
  Get the markdown string for a given opening or closing mark.
  */
  markString(e, n, r, i) {
    let o = this.getMark(e.type.name), s = n ? o.open : o.close;
    return typeof s == "string" ? s : s(this, e, r, i);
  }
  /**
  Get leading and trailing whitespace from a string. Values of
  leading or trailing property of the return object will be undefined
  if there is no match.
  */
  getEnclosingWhitespace(e) {
    return {
      leading: (e.match(/^(\s+)/) || [void 0])[0],
      trailing: (e.match(/(\s+)$/) || [void 0])[0]
    };
  }
  /**
  @internal
  */
  isMarkAhead(e, n, r) {
    for (; ; n++) {
      if (n >= e.childCount)
        return !1;
      let i = e.child(n);
      if (i.type.name != this.options.hardBreakNodeName)
        return r.isInSet(i.marks);
      n++;
    }
  }
};
var Go, rc;
function HC() {
  if (rc) return Go;
  rc = 1;
  var t = !0, e = !1, n = !1;
  Go = function(m, g) {
    g && (t = !g.enabled, e = !!g.label, n = !!g.labelAfter), m.core.ruler.after("inline", "github-task-lists", function(b) {
      for (var y = b.tokens, k = 2; k < y.length; k++)
        o(y, k) && (s(y[k], b.Token), r(y[k - 2], "class", "task-list-item" + (t ? "" : " enabled")), r(y[i(y, k - 2)], "class", "contains-task-list"));
    });
  };
  function r(m, g, b) {
    var y = m.attrIndex(g), k = [g, b];
    y < 0 ? m.attrPush(k) : m.attrs[y] = k;
  }
  function i(m, g) {
    for (var b = m[g].level - 1, y = g - 1; y >= 0; y--)
      if (m[y].level === b)
        return y;
    return -1;
  }
  function o(m, g) {
    return d(m[g]) && f(m[g - 1]) && h(m[g - 2]) && p(m[g]);
  }
  function s(m, g) {
    if (m.children.unshift(u(m, g)), m.children[1].content = m.children[1].content.slice(3), m.content = m.content.slice(3), e)
      if (n) {
        m.children.pop();
        var b = "task-item-" + Math.ceil(Math.random() * (1e4 * 1e3) - 1e3);
        m.children[0].content = m.children[0].content.slice(0, -1) + ' id="' + b + '">', m.children.push(c(m.content, b, g));
      } else
        m.children.unshift(l(g)), m.children.push(a(g));
  }
  function u(m, g) {
    var b = new g("html_inline", "", 0), y = t ? ' disabled="" ' : "";
    return m.content.indexOf("[ ] ") === 0 ? b.content = '<input class="task-list-item-checkbox"' + y + 'type="checkbox">' : (m.content.indexOf("[x] ") === 0 || m.content.indexOf("[X] ") === 0) && (b.content = '<input class="task-list-item-checkbox" checked=""' + y + 'type="checkbox">'), b;
  }
  function l(m) {
    var g = new m("html_inline", "", 0);
    return g.content = "<label>", g;
  }
  function a(m) {
    var g = new m("html_inline", "", 0);
    return g.content = "</label>", g;
  }
  function c(m, g, b) {
    var y = new b("html_inline", "", 0);
    return y.content = '<label class="task-list-item-label" for="' + g + '">' + m + "</label>", y.attrs = [{ for: g }], y;
  }
  function d(m) {
    return m.type === "inline";
  }
  function f(m) {
    return m.type === "paragraph_open";
  }
  function h(m) {
    return m.type === "list_item_open";
  }
  function p(m) {
    return m.content.indexOf("[ ] ") === 0 || m.content.indexOf("[x] ") === 0 || m.content.indexOf("[X] ") === 0;
  }
  return Go;
}
var VC = HC();
const jC = /* @__PURE__ */ Yh(VC);
var qC = Object.defineProperty, WC = (t, e, n) => e in t ? qC(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Bi = (t, e, n) => (WC(t, typeof e != "symbol" ? e + "" : e, n), n);
const UC = j.create({
  name: "markdownTightLists",
  addOptions: () => ({
    tight: !0,
    tightClass: "tight",
    listTypes: ["bulletList", "orderedList"]
  }),
  addGlobalAttributes() {
    return [{
      types: this.options.listTypes,
      attributes: {
        tight: {
          default: this.options.tight,
          parseHTML: (t) => t.getAttribute("data-tight") === "true" || !t.querySelector("p"),
          renderHTML: (t) => ({
            class: t.tight ? this.options.tightClass : null,
            "data-tight": t.tight ? "true" : null
          })
        }
      }
    }];
  },
  addCommands() {
    var t = this;
    return {
      toggleTight: function() {
        let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
        return (n) => {
          let {
            editor: r,
            commands: i
          } = n;
          function o(s) {
            if (!r.isActive(s))
              return !1;
            const u = r.getAttributes(s);
            return i.updateAttributes(s, {
              tight: e ?? !(u != null && u.tight)
            });
          }
          return t.options.listTypes.some((s) => o(s));
        };
      }
    };
  }
}), ic = xe();
function Bh(t, e) {
  return ic.inline.State.prototype.scanDelims.call({
    src: t,
    posMax: t.length
  }), new ic.inline.State(t, null, null, []).scanDelims(e, !0);
}
function zh(t, e, n, r) {
  let i = t.substring(0, n) + t.substring(n + e.length);
  return i = i.substring(0, n + r) + e + i.substring(n + r), i;
}
function KC(t, e, n, r) {
  let i = n, o = t;
  for (; i < r && !Bh(o, i).can_open; )
    o = zh(o, e, i, 1), i++;
  return {
    text: o,
    from: i,
    to: r
  };
}
function JC(t, e, n, r) {
  let i = r, o = t;
  for (; i > n && !Bh(o, i).can_close; )
    o = zh(o, e, i, -1), i--;
  return {
    text: o,
    from: n,
    to: i
  };
}
function GC(t, e, n, r) {
  let i = {
    text: t,
    from: n,
    to: r
  };
  return i = KC(i.text, e, i.from, i.to), i = JC(i.text, e, i.from, i.to), i.to - i.from < e.length + 1 && (i.text = i.text.substring(0, i.from) + i.text.substring(i.to + e.length)), i.text;
}
class ZC extends Ph {
  constructor(e, n, r) {
    super(e, n, r ?? {}), Bi(this, "inTable", !1), this.inlines = [];
  }
  render(e, n, r) {
    super.render(e, n, r);
    const i = this.inlines[this.inlines.length - 1];
    if (i != null && i.start && i !== null && i !== void 0 && i.end) {
      const {
        delimiter: o,
        start: s,
        end: u
      } = this.normalizeInline(i);
      this.out = GC(this.out, o, s, u), this.inlines.pop();
    }
  }
  markString(e, n, r, i) {
    const o = this.marks[e.type.name];
    if (o.expelEnclosingWhitespace)
      if (n)
        this.inlines.push({
          start: this.out.length,
          delimiter: o.open
        });
      else {
        const s = this.inlines.pop();
        this.inlines.push({
          ...s,
          end: this.out.length
        });
      }
    return super.markString(e, n, r, i);
  }
  normalizeInline(e) {
    let {
      start: n,
      end: r
    } = e;
    for (; this.out.charAt(n).match(/\s/); )
      n++;
    return {
      ...e,
      start: n
    };
  }
}
const $h = ve.create({
  name: "markdownHTMLMark",
  /**
   * @return {{markdown: MarkdownMarkSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize: {
          open(t, e) {
            var n, r;
            return this.editor.storage.markdown.options.html ? (n = (r = oc(e)) === null || r === void 0 ? void 0 : r[0]) !== null && n !== void 0 ? n : "" : (console.warn(`Tiptap Markdown: "${e.type.name}" mark is only available in html mode`), "");
          },
          close(t, e) {
            var n, r;
            return this.editor.storage.markdown.options.html && (n = (r = oc(e)) === null || r === void 0 ? void 0 : r[1]) !== null && n !== void 0 ? n : "";
          }
        },
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
});
function oc(t) {
  const e = t.type.schema, n = e.text(" ", [t]), i = fr(w.from(n), e).match(/^(<.*?>) (<\/.*?>)$/);
  return i ? [i[1], i[2]] : null;
}
function Pu(t) {
  const e = `<body>${t}</body>`;
  return new window.DOMParser().parseFromString(e, "text/html").body;
}
function XC(t) {
  return t?.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function YC(t) {
  const e = t.parentElement, n = e.cloneNode();
  for (; e.firstChild && e.firstChild !== t; )
    n.appendChild(e.firstChild);
  n.childNodes.length > 0 && e.parentElement.insertBefore(n, e), e.parentElement.insertBefore(t, e), e.childNodes.length === 0 && e.remove();
}
function QC(t) {
  const e = t.parentNode;
  for (; t.firstChild; )
    e.insertBefore(t.firstChild, t);
  e.removeChild(t);
}
const so = L.create({
  name: "markdownHTMLNode",
  addStorage() {
    return {
      markdown: {
        serialize(t, e, n) {
          this.editor.storage.markdown.options.html ? t.write(e6(e, n)) : (console.warn(`Tiptap Markdown: "${e.type.name}" node is only available in html mode`), t.write(`[${e.type.name}]`)), e.isBlock && t.closeBlock(e);
        },
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
});
function e6(t, e) {
  const n = t.type.schema, r = fr(w.from(t), n);
  return t.isBlock && (e instanceof w || e.type.name === n.topNodeType.name) ? t6(r) : r;
}
function t6(t) {
  const n = Pu(t).firstElementChild;
  return n.innerHTML = n.innerHTML.trim() ? `
${n.innerHTML}
` : `
`, n.outerHTML;
}
const n6 = L.create({
  name: "blockquote"
}), r6 = n6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize: Ge.nodes.blockquote,
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), i6 = L.create({
  name: "bulletList"
}), Hh = i6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize(t, e) {
          return t.renderList(e, "  ", () => (this.editor.storage.markdown.options.bulletListMarker || "-") + " ");
        },
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), o6 = L.create({
  name: "codeBlock"
}), s6 = o6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize(t, e) {
          t.write("```" + (e.attrs.language || "") + `
`), t.text(e.textContent, !1), t.ensureNewLine(), t.write("```"), t.closeBlock(e);
        },
        parse: {
          setup(t) {
            var e;
            t.set({
              langPrefix: (e = this.options.languageClassPrefix) !== null && e !== void 0 ? e : "language-"
            });
          },
          updateDOM(t) {
            t.innerHTML = t.innerHTML.replace(/\n<\/code><\/pre>/g, "</code></pre>");
          }
        }
      }
    };
  }
}), u6 = L.create({
  name: "hardBreak"
}), Vh = u6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize(t, e, n, r) {
          for (let i = r + 1; i < n.childCount; i++)
            if (n.child(i).type != e.type) {
              t.write(t.inTable ? so.storage.markdown.serialize.call(this, t, e, n) : `\\
`);
              return;
            }
        },
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), l6 = L.create({
  name: "heading"
}), a6 = l6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize: Ge.nodes.heading,
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), c6 = L.create({
  name: "horizontalRule"
}), d6 = c6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize: Ge.nodes.horizontal_rule,
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), f6 = L.create({
  name: "image"
}), h6 = f6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize: Ge.nodes.image,
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), p6 = L.create({
  name: "listItem"
}), m6 = p6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize: Ge.nodes.list_item,
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), g6 = L.create({
  name: "orderedList"
});
function b6(t, e, n) {
  let r = 0;
  for (; n - r > 0 && e.child(n - r - 1).type.name === t.type.name; r++)
    ;
  return r;
}
const y6 = g6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize(t, e, n, r) {
          const i = e.attrs.start || 1, o = String(i + e.childCount - 1).length, s = t.repeat(" ", o + 2), l = b6(e, n, r) % 2 ? ") " : ". ";
          t.renderList(e, s, (a) => {
            const c = String(i + a);
            return t.repeat(" ", o - c.length) + c + l;
          });
        },
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), k6 = L.create({
  name: "paragraph"
}), x6 = k6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize: Ge.nodes.paragraph,
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
});
function Zo(t) {
  var e, n;
  return (e = t == null || (n = t.content) === null || n === void 0 ? void 0 : n.content) !== null && e !== void 0 ? e : [];
}
const C6 = L.create({
  name: "table"
}), w6 = C6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize(t, e, n) {
          if (!E6(e)) {
            so.storage.markdown.serialize.call(this, t, e, n);
            return;
          }
          t.inTable = !0, e.forEach((r, i, o) => {
            if (t.write("| "), r.forEach((s, u, l) => {
              l && t.write(" | ");
              const a = s.firstChild;
              a.textContent.trim() && t.renderInline(a);
            }), t.write(" |"), t.ensureNewLine(), !o) {
              const s = Array.from({
                length: r.childCount
              }).map(() => "---").join(" | ");
              t.write(`| ${s} |`), t.ensureNewLine();
            }
          }), t.closeBlock(e), t.inTable = !1;
        },
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
});
function sc(t) {
  return t.attrs.colspan > 1 || t.attrs.rowspan > 1;
}
function E6(t) {
  const e = Zo(t), n = e[0], r = e.slice(1);
  return !(Zo(n).some((i) => i.type.name !== "tableHeader" || sc(i) || i.childCount > 1) || r.some((i) => Zo(i).some((o) => o.type.name === "tableHeader" || sc(o) || o.childCount > 1)));
}
const S6 = L.create({
  name: "taskItem"
}), A6 = S6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize(t, e) {
          const n = e.attrs.checked ? "[x]" : "[ ]";
          t.write(`${n} `), t.renderContent(e);
        },
        parse: {
          updateDOM(t) {
            [...t.querySelectorAll(".task-list-item")].forEach((e) => {
              const n = e.querySelector("input");
              e.setAttribute("data-type", "taskItem"), n && (e.setAttribute("data-checked", n.checked), n.remove());
            });
          }
        }
      }
    };
  }
}), v6 = L.create({
  name: "taskList"
}), M6 = v6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize: Hh.storage.markdown.serialize,
        parse: {
          setup(t) {
            t.use(jC);
          },
          updateDOM(t) {
            [...t.querySelectorAll(".contains-task-list")].forEach((e) => {
              e.setAttribute("data-type", "taskList");
            });
          }
        }
      }
    };
  }
}), T6 = L.create({
  name: "text"
}), _6 = T6.extend({
  /**
   * @return {{markdown: MarkdownNodeSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize(t, e) {
          t.text(XC(e.text));
        },
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), D6 = ve.create({
  name: "bold"
}), O6 = D6.extend({
  /**
   * @return {{markdown: MarkdownMarkSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize: Ge.marks.strong,
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), N6 = ve.create({
  name: "code"
}), R6 = N6.extend({
  /**
   * @return {{markdown: MarkdownMarkSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize: Ge.marks.code,
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), I6 = ve.create({
  name: "italic"
}), L6 = I6.extend({
  /**
   * @return {{markdown: MarkdownMarkSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize: Ge.marks.em,
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), F6 = ve.create({
  name: "link"
}), P6 = F6.extend({
  /**
   * @return {{markdown: MarkdownMarkSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize: Ge.marks.link,
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), B6 = ve.create({
  name: "strike"
}), z6 = B6.extend({
  /**
   * @return {{markdown: MarkdownMarkSpec}}
   */
  addStorage() {
    return {
      markdown: {
        serialize: {
          open: "~~",
          close: "~~",
          expelEnclosingWhitespace: !0
        },
        parse: {
          // handled by markdown-it
        }
      }
    };
  }
}), $6 = [r6, Hh, s6, Vh, a6, d6, so, h6, m6, y6, x6, w6, A6, M6, _6, O6, R6, $h, L6, P6, z6];
function zi(t) {
  var e, n;
  const r = (e = t.storage) === null || e === void 0 ? void 0 : e.markdown, i = (n = $6.find((o) => o.name === t.name)) === null || n === void 0 ? void 0 : n.storage.markdown;
  return r || i ? {
    ...i,
    ...r
  } : null;
}
class H6 {
  constructor(e) {
    Bi(this, "editor", null), this.editor = e;
  }
  serialize(e) {
    const n = new ZC(this.nodes, this.marks, {
      hardBreakNodeName: Vh.name
    });
    return n.renderContent(e), n.out;
  }
  get nodes() {
    var e;
    return {
      ...Object.fromEntries(Object.keys(this.editor.schema.nodes).map((n) => [n, this.serializeNode(so)])),
      ...Object.fromEntries((e = this.editor.extensionManager.extensions.filter((n) => n.type === "node" && this.serializeNode(n)).map((n) => [n.name, this.serializeNode(n)])) !== null && e !== void 0 ? e : [])
    };
  }
  get marks() {
    var e;
    return {
      ...Object.fromEntries(Object.keys(this.editor.schema.marks).map((n) => [n, this.serializeMark($h)])),
      ...Object.fromEntries((e = this.editor.extensionManager.extensions.filter((n) => n.type === "mark" && this.serializeMark(n)).map((n) => [n.name, this.serializeMark(n)])) !== null && e !== void 0 ? e : [])
    };
  }
  serializeNode(e) {
    var n;
    return (n = zi(e)) === null || n === void 0 || (n = n.serialize) === null || n === void 0 ? void 0 : n.bind({
      editor: this.editor,
      options: e.options
    });
  }
  serializeMark(e) {
    var n;
    const r = (n = zi(e)) === null || n === void 0 ? void 0 : n.serialize;
    return r ? {
      ...r,
      open: typeof r.open == "function" ? r.open.bind({
        editor: this.editor,
        options: e.options
      }) : r.open,
      close: typeof r.close == "function" ? r.close.bind({
        editor: this.editor,
        options: e.options
      }) : r.close
    } : null;
  }
}
class V6 {
  constructor(e, n) {
    Bi(this, "editor", null), Bi(this, "md", null);
    let {
      html: r,
      linkify: i,
      breaks: o
    } = n;
    this.editor = e, this.md = this.withPatchedRenderer(xe({
      html: r,
      linkify: i,
      breaks: o
    }));
  }
  parse(e) {
    let {
      inline: n
    } = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (typeof e == "string") {
      this.editor.extensionManager.extensions.forEach((o) => {
        var s;
        return (s = zi(o)) === null || s === void 0 || (s = s.parse) === null || s === void 0 || (s = s.setup) === null || s === void 0 ? void 0 : s.call({
          editor: this.editor,
          options: o.options
        }, this.md);
      });
      const r = this.md.render(e), i = Pu(r);
      return this.editor.extensionManager.extensions.forEach((o) => {
        var s;
        return (s = zi(o)) === null || s === void 0 || (s = s.parse) === null || s === void 0 || (s = s.updateDOM) === null || s === void 0 ? void 0 : s.call({
          editor: this.editor,
          options: o.options
        }, i);
      }), this.normalizeDOM(i, {
        inline: n,
        content: e
      }), i.innerHTML;
    }
    return e;
  }
  normalizeDOM(e, n) {
    let {
      inline: r,
      content: i
    } = n;
    return this.normalizeBlocks(e), e.querySelectorAll("*").forEach((o) => {
      var s;
      ((s = o.nextSibling) === null || s === void 0 ? void 0 : s.nodeType) === Node.TEXT_NODE && !o.closest("pre") && (o.nextSibling.textContent = o.nextSibling.textContent.replace(/^\n/, ""));
    }), r && this.normalizeInline(e, i), e;
  }
  normalizeBlocks(e) {
    const r = Object.values(this.editor.schema.nodes).filter((i) => i.isBlock).map((i) => {
      var o;
      return (o = i.spec.parseDOM) === null || o === void 0 ? void 0 : o.map((s) => s.tag);
    }).flat().filter(Boolean).join(",");
    r && [...e.querySelectorAll(r)].forEach((i) => {
      i.parentElement.matches("p") && YC(i);
    });
  }
  normalizeInline(e, n) {
    var r;
    if ((r = e.firstElementChild) !== null && r !== void 0 && r.matches("p")) {
      var i, o, s, u;
      const l = e.firstElementChild, {
        nextElementSibling: a
      } = l, c = (i = (o = n.match(/^\s+/)) === null || o === void 0 ? void 0 : o[0]) !== null && i !== void 0 ? i : "", d = a ? "" : (s = (u = n.match(/\s+$/)) === null || u === void 0 ? void 0 : u[0]) !== null && s !== void 0 ? s : "";
      if (n.match(/^\n\n/)) {
        l.innerHTML = `${l.innerHTML}${d}`;
        return;
      }
      QC(l), e.innerHTML = `${c}${e.innerHTML}${d}`;
    }
  }
  /**
   * @param {markdownit} md
   */
  withPatchedRenderer(e) {
    const n = (r) => function() {
      const i = r(...arguments);
      return i === `
` ? i : i[i.length - 1] === `
` ? i.slice(0, -1) : i;
    };
    return e.renderer.rules.hardbreak = n(e.renderer.rules.hardbreak), e.renderer.rules.softbreak = n(e.renderer.rules.softbreak), e.renderer.rules.fence = n(e.renderer.rules.fence), e.renderer.rules.code_block = n(e.renderer.rules.code_block), e.renderer.renderToken = n(e.renderer.renderToken.bind(e.renderer)), e;
  }
}
const j6 = j.create({
  name: "markdownClipboard",
  addOptions() {
    return {
      transformPastedText: !1,
      transformCopiedText: !1
    };
  },
  addProseMirrorPlugins() {
    return [new H({
      key: new W("markdownClipboard"),
      props: {
        clipboardTextParser: (t, e, n) => {
          if (n || !this.options.transformPastedText)
            return null;
          const r = this.editor.storage.markdown.parser.parse(t, {
            inline: !0
          });
          return rt.fromSchema(this.editor.schema).parseSlice(Pu(r), {
            preserveWhitespace: !0,
            context: e
          });
        },
        /**
         * @param {import('prosemirror-model').Slice} slice
         */
        clipboardTextSerializer: (t) => this.options.transformCopiedText ? this.editor.storage.markdown.serializer.serialize(t.content) : null
      }
    })];
  }
}), q6 = j.create({
  name: "markdown",
  priority: 50,
  addOptions() {
    return {
      html: !0,
      tightLists: !0,
      tightListClass: "tight",
      bulletListMarker: "-",
      linkify: !1,
      breaks: !1,
      transformPastedText: !1,
      transformCopiedText: !1
    };
  },
  addCommands() {
    const t = sf.Commands.config.addCommands();
    return {
      setContent: (e, n) => (r) => t.setContent(r.editor.storage.markdown.parser.parse(e), n)(r),
      insertContentAt: (e, n, r) => (i) => t.insertContentAt(e, i.editor.storage.markdown.parser.parse(n, {
        inline: !0
      }), r)(i)
    };
  },
  onBeforeCreate() {
    this.editor.storage.markdown = {
      options: {
        ...this.options
      },
      parser: new V6(this.editor, this.options),
      serializer: new H6(this.editor),
      getMarkdown: () => this.editor.storage.markdown.serializer.serialize(this.editor.state.doc)
    }, this.editor.options.initialContent = this.editor.options.content, this.editor.options.content = this.editor.storage.markdown.parser.parse(this.editor.options.content);
  },
  onCreate() {
    this.editor.options.content = this.editor.options.initialContent, delete this.editor.options.initialContent;
  },
  addStorage() {
    return {
      /// storage will be defined in onBeforeCreate() to prevent initial object overriding
    };
  },
  addExtensions() {
    return [UC.configure({
      tight: this.options.tightLists,
      tightClass: this.options.tightListClass
    }), j6.configure({
      transformPastedText: this.options.transformPastedText,
      transformCopiedText: this.options.transformCopiedText
    })];
  }
});
function uc(t) {
  try {
    return t.storage?.markdown?.getMarkdown?.() ?? t.getHTML();
  } catch {
    return t.getHTML();
  }
}
function W6(t, e) {
  if (!t.docChanged) return null;
  const n = t.steps;
  if (!n || n.length === 0) return null;
  for (const r of n) {
    const i = r.toJSON();
    if (i.stepType === "addMark")
      return { type: "format", displayLabel: `${i.mark?.type}: on` };
    if (i.stepType === "removeMark")
      return { type: "format", displayLabel: `${i.mark?.type}: off` };
    if (i.stepType === "replace") {
      const o = i.slice?.content;
      if (!o || o.length === 0)
        return { type: "delete", displayLabel: "delete" };
      const s = o[0];
      if (s?.type === "horizontalRule")
        return { type: "insert", displayLabel: "horizontal rule" };
      if (s?.type === "table") {
        const u = s.content?.length || 0, l = s.content?.[0]?.content?.length || 0;
        return { type: "insert", displayLabel: `table ${u}×${l}` };
      }
      if (s?.type === "heading")
        return { type: "structure", displayLabel: `heading ${s.attrs?.level || 1}` };
      if (s?.type === "codeBlock")
        return { type: "structure", displayLabel: "code block" };
      if (s?.text) {
        const u = s.text;
        return u.length <= 20 ? { type: "input", displayLabel: `"${u}"` } : { type: "input", displayLabel: `"${u.slice(0, 20)}…" (${u.length} chars)` };
      }
      if (s?.type === "paragraph" && s.content?.[0]?.text) {
        const u = s.content[0].text;
        return u.length <= 20 ? { type: "input", displayLabel: `"${u}"` } : { type: "input", displayLabel: `"${u.slice(0, 20)}…" (${u.length} chars)` };
      }
      if (s?.type)
        return { type: "insert", displayLabel: s.type };
    }
    if (i.stepType === "replaceAround") {
      const o = i.slice?.content?.[0]?.type;
      if (o)
        return { type: "structure", displayLabel: o };
    }
  }
  return { type: "edit", displayLabel: "content changed" };
}
function Q({
  onClick: t,
  active: e,
  disabled: n,
  title: r,
  children: i
}) {
  return /* @__PURE__ */ I(
    "button",
    {
      type: "button",
      onMouseDown: (o) => {
        o.preventDefault(), t();
      },
      disabled: n,
      title: r,
      style: {
        padding: "4px 8px",
        fontSize: 13,
        lineHeight: 1,
        cursor: n ? "default" : "pointer",
        background: e ? "#e0e0e0" : "transparent",
        border: "1px solid #ccc",
        borderRadius: 4,
        opacity: n ? 0.4 : 1
      },
      children: i
    }
  );
}
function rn() {
  return /* @__PURE__ */ I(
    "span",
    {
      style: {
        display: "inline-block",
        width: 1,
        height: 20,
        background: "#ccc",
        margin: "0 4px",
        verticalAlign: "middle"
      }
    }
  );
}
const jh = Se.forwardRef(
  ({
    value: t,
    onChange: e,
    onNativeEvent: n,
    registerApi: r,
    placeholder: i,
    editable: o = !0,
    toolbar: s = !0,
    toolbarItems: u,
    className: l,
    height: a = "300px",
    ...c
  }, d) => {
    const f = Se.useMemo(() => u ? new Set(u.split(",").map((y) => y.trim())) : null, [u]), h = (y) => !f || f.has(y), p = Pr(e);
    p.current = e;
    const m = Pr(n);
    m.current = n;
    const g = Pr(!1), b = r2({
      extensions: [
        Hy.configure({
          heading: { levels: [1, 2, 3, 4] }
        }),
        dh.configure({ resizable: !0 }),
        ch,
        lh,
        ah,
        Lf.configure({ openOnClick: !1 }),
        Kf,
        Uf.configure({ nested: !0 }),
        Py.configure({
          placeholder: i || "Start writing..."
        }),
        q6
      ],
      content: t || "",
      editable: o,
      onUpdate: ({ editor: y }) => {
        if (g.current) return;
        const k = uc(y);
        p.current?.(k);
      },
      onTransaction: ({ editor: y, transaction: k }) => {
        if (g.current || !m.current) return;
        const C = W6(k);
        C && m.current({
          type: C.type,
          displayLabel: C.displayLabel
        });
      },
      onFocus: () => {
        m.current?.({ type: "focus", displayLabel: "focus" });
      },
      onBlur: () => {
        m.current?.({ type: "blur", displayLabel: "blur" });
      }
    });
    return Ln(() => {
      b?.setEditable(o);
    }, [b, o]), Ln(() => {
      if (!b) return;
      const y = uc(b);
      t !== void 0 && t !== y && (g.current = !0, b.commands.setContent(t), g.current = !1);
    }, [b, t]), Ln(() => {
      b && r?.({
        focus: () => b.commands.focus(),
        setValue: (y) => {
          g.current = !0, b.commands.setContent(y), g.current = !1;
          const k = b.storage.markdown?.getMarkdown?.() ?? b.getHTML();
          p.current?.(k);
        },
        getMarkdown: () => b.storage.markdown?.getMarkdown?.() ?? b.getHTML(),
        getHTML: () => b.getHTML()
      });
    }, [b, r]), b ? /* @__PURE__ */ It("div", { ref: d, className: l, ...c, children: [
      s && /* @__PURE__ */ It(
        "div",
        {
          style: {
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            padding: "6px 8px",
            borderBottom: "1px solid #ddd",
            background: "#fafafa",
            borderRadius: "4px 4px 0 0"
          },
          children: [
            h("bold") && /* @__PURE__ */ I(
              Q,
              {
                onClick: () => b.chain().focus().toggleBold().run(),
                active: b.isActive("bold"),
                title: "Bold (Ctrl+B)",
                children: /* @__PURE__ */ I("strong", { children: "B" })
              }
            ),
            h("italic") && /* @__PURE__ */ I(
              Q,
              {
                onClick: () => b.chain().focus().toggleItalic().run(),
                active: b.isActive("italic"),
                title: "Italic (Ctrl+I)",
                children: /* @__PURE__ */ I("em", { children: "I" })
              }
            ),
            h("strike") && /* @__PURE__ */ I(
              Q,
              {
                onClick: () => b.chain().focus().toggleStrike().run(),
                active: b.isActive("strike"),
                title: "Strikethrough",
                children: /* @__PURE__ */ I("s", { children: "S" })
              }
            ),
            h("code") && /* @__PURE__ */ I(
              Q,
              {
                onClick: () => b.chain().focus().toggleCode().run(),
                active: b.isActive("code"),
                title: "Inline code",
                children: "<>"
              }
            ),
            (h("h1") || h("h2") || h("h3")) && /* @__PURE__ */ I(rn, {}),
            [1, 2, 3].map(
              (y) => h(`h${y}`) ? /* @__PURE__ */ It(
                Q,
                {
                  onClick: () => b.chain().focus().toggleHeading({ level: y }).run(),
                  active: b.isActive("heading", { level: y }),
                  title: `Heading ${y}`,
                  children: [
                    "H",
                    y
                  ]
                },
                y
              ) : null
            ),
            (h("bulletList") || h("orderedList") || h("taskList")) && /* @__PURE__ */ I(rn, {}),
            h("bulletList") && /* @__PURE__ */ I(
              Q,
              {
                onClick: () => b.chain().focus().toggleBulletList().run(),
                active: b.isActive("bulletList"),
                title: "Bullet list",
                children: "• List"
              }
            ),
            h("orderedList") && /* @__PURE__ */ I(
              Q,
              {
                onClick: () => b.chain().focus().toggleOrderedList().run(),
                active: b.isActive("orderedList"),
                title: "Numbered list",
                children: "1. List"
              }
            ),
            h("taskList") && /* @__PURE__ */ I(
              Q,
              {
                onClick: () => b.chain().focus().toggleTaskList().run(),
                active: b.isActive("taskList"),
                title: "Task list",
                children: "☑ Tasks"
              }
            ),
            (h("blockquote") || h("codeBlock") || h("hr")) && /* @__PURE__ */ I(rn, {}),
            h("blockquote") && /* @__PURE__ */ I(
              Q,
              {
                onClick: () => b.chain().focus().toggleBlockquote().run(),
                active: b.isActive("blockquote"),
                title: "Blockquote",
                children: "“ Quote"
              }
            ),
            h("codeBlock") && /* @__PURE__ */ It(
              Q,
              {
                onClick: () => b.chain().focus().toggleCodeBlock().run(),
                active: b.isActive("codeBlock"),
                title: "Code block",
                children: [
                  "{ }",
                  " Code"
                ]
              }
            ),
            h("hr") && /* @__PURE__ */ I(
              Q,
              {
                onClick: () => b.chain().focus().setHorizontalRule().run(),
                title: "Horizontal rule",
                children: "— HR"
              }
            ),
            h("link") && /* @__PURE__ */ I(rn, {}),
            h("link") && /* @__PURE__ */ I(
              Q,
              {
                onClick: () => {
                  if (b.isActive("link"))
                    b.chain().focus().unsetLink().run();
                  else {
                    const y = window.prompt("URL:");
                    y && b.chain().focus().setLink({ href: y }).run();
                  }
                },
                active: b.isActive("link"),
                title: "Link",
                children: "🔗 Link"
              }
            ),
            (h("table") || h("tableRow") || h("tableCol")) && /* @__PURE__ */ I(rn, {}),
            h("table") && /* @__PURE__ */ I(
              Q,
              {
                onClick: () => b.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: !0 }).run(),
                title: "Insert table",
                children: "▦ Table"
              }
            ),
            h("tableRow") && /* @__PURE__ */ It(Wr, { children: [
              /* @__PURE__ */ I(
                Q,
                {
                  onClick: () => b.chain().focus().addRowAfter().run(),
                  disabled: !b.can().addRowAfter(),
                  title: "Add row",
                  children: "+ Row"
                }
              ),
              /* @__PURE__ */ I(
                Q,
                {
                  onClick: () => b.chain().focus().deleteRow().run(),
                  disabled: !b.can().deleteRow(),
                  title: "Delete row",
                  children: "- Row"
                }
              )
            ] }),
            h("tableCol") && /* @__PURE__ */ It(Wr, { children: [
              /* @__PURE__ */ I(
                Q,
                {
                  onClick: () => b.chain().focus().addColumnAfter().run(),
                  disabled: !b.can().addColumnAfter(),
                  title: "Add column",
                  children: "+ Col"
                }
              ),
              /* @__PURE__ */ I(
                Q,
                {
                  onClick: () => b.chain().focus().deleteColumn().run(),
                  disabled: !b.can().deleteColumn(),
                  title: "Delete column",
                  children: "- Col"
                }
              )
            ] }),
            (h("undo") || h("redo")) && /* @__PURE__ */ I(rn, {}),
            h("undo") && /* @__PURE__ */ I(
              Q,
              {
                onClick: () => b.chain().focus().undo().run(),
                disabled: !b.can().undo(),
                title: "Undo (Ctrl+Z)",
                children: "↩ Undo"
              }
            ),
            h("redo") && /* @__PURE__ */ I(
              Q,
              {
                onClick: () => b.chain().focus().redo().run(),
                disabled: !b.can().redo(),
                title: "Redo (Ctrl+Shift+Z)",
                children: "↪ Redo"
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ I(
        "div",
        {
          style: {
            height: a,
            overflow: "auto",
            padding: "12px 16px",
            border: "1px solid #ddd",
            borderTop: s ? "none" : "1px solid #ddd",
            borderRadius: s ? "0 0 4px 4px" : 4
          },
          children: /* @__PURE__ */ I(Cf, { editor: b })
        }
      )
    ] }) : null;
  }
);
jh.displayName = "TiptapEditorRender";
const qh = "TiptapEditor", U6 = Gh({
  status: "experimental",
  description: "`TiptapEditor` wraps the Tiptap rich-text editor as an XMLUI component. It provides a full-featured markdown editing experience with toolbar, table editing, task lists, and live markdown output.",
  props: {
    initialValue: Xh(),
    placeholder: Sn("Placeholder text shown when the editor is empty.", void 0, "string", "Start writing..."),
    editable: Sn("Whether the editor is editable.", void 0, "boolean", !0),
    toolbar: Sn("Whether to show the formatting toolbar.", void 0, "boolean", !0),
    toolbarItems: Sn("Comma-separated list of toolbar items to show (e.g. 'bold,italic,bulletList,link,undo,redo'). If omitted, all items are shown.", void 0, "string"),
    height: Sn("The height of the editor content area.", void 0, "string", "300px")
  },
  events: {
    didChange: Zh(qh)
  },
  apis: {
    focus: {
      description: "Sets focus on the editor.",
      signature: "focus(): void"
    },
    setValue: {
      description: "Sets the editor content (markdown string).",
      signature: "setValue(value: string): void",
      parameters: { value: "The new markdown content." }
    },
    getMarkdown: {
      description: "Gets the current editor content as markdown.",
      signature: "getMarkdown(): string"
    },
    getHTML: {
      description: "Gets the current editor content as HTML.",
      signature: "getHTML(): string"
    }
  }
}), K6 = Jh(
  qh,
  jh,
  U6,
  {
    booleans: ["editable", "toolbar"],
    strings: ["placeholder", "height", "toolbarItems"],
    events: {
      didChange: "onDidChange"
    },
    captureNativeEvents: !0
  }
), nw = {
  namespace: "XMLUIExtensions",
  components: [K6]
};
export {
  nw as default
};

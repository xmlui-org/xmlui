import "./index.css";
import { jsx } from "react/jsx-runtime";
import React, { forwardRef, useRef, useEffect, useCallback } from "react";
import require$$0 from "react-dom";
import { wrapCompound, createMetadata, parseScssVar, dDidChange, dEnabled, d, dInitialValue } from "xmlui";
function getDefaultExportFromCjs(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var smart_gauge = {}, hasRequiredSmart_gauge;
function requireSmart_gauge() {
  return hasRequiredSmart_gauge || (hasRequiredSmart_gauge = 1, (function() {
    typeof document > "u" || (() => {
      var __webpack_modules__ = {
        /***/
        2612: (
          /***/
          (() => {
            Smart("smart-button", class extends Smart.ContentElement {
              static get properties() {
                return { value: { type: "string" }, name: { type: "string" }, type: { value: "button", type: "string" }, clickMode: { allowedValues: ["hover", "press", "release", "pressAndRelease"], type: "string", value: "release" } };
              }
              static get styleUrls() {
                return ["smart.button.css"];
              }
              template() {
                return `<button aria-label="Button" class="smart-button smart-unselectable" inner-h-t-m-l='[[innerHTML]]' id='button' type='[[type]]' name='[[name]]' value='[[value]]' disabled='[[disabled]]' role="presentation"></button>`;
              }
              refresh() {
              }
              static get listeners() {
                return { "button.down": "_downHandler", "button.mouseenter": "_mouseEnterHandler", "button.mouseleave": "_mouseLeaveHandler", "button.touchend": "_touchEndHandler", "button.click": "_clickHandler", "button.up": "_upHandler", up: "_upHandler", "button.focus": "_focusHandler", "button.blur": "_blurHandler" };
              }
              focus() {
                const t = this;
                t.$.button ? t.$.button.focus() : HTMLElement.prototype.focus.call(t);
              }
              blur() {
                const t = this;
                t.$.button ? t.$.button.blur() : HTMLElement.prototype.blur.call(t);
              }
              _upHandler(t) {
                const e = this;
                if (t.stopPropagation(), e.$.setAttributeValue("active", !1), e.dataset.target) {
                  const i = document.querySelector(e.dataset.target);
                  let a = e.dataset.toggle, n = e.dataset.arguments;
                  const r = "smart-window".toLowerCase();
                  if (i && i.nodeName.toLowerCase() === r && a === "modal" && (a = "openModal"), a === "tab" || a === "pill" || a === "list") {
                    const s = this.closest(".nav, .list-group"), o = '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]', l = !s || s.nodeName !== "UL" && s.nodeName !== "OL" ? s.children(".active") : s.querySelectorAll("li > .active");
                    if (s) {
                      const c = s.querySelectorAll(o);
                      for (let u = 0; u < c.length; u++) c[u].classList.remove("primary");
                      for (let u = 0; u < l.length; u++) l[u].classList.remove("active");
                      let m = e.parentNode;
                      for (; m; ) {
                        if (m.nodeName === "LI") {
                          m.classList.add("active");
                          break;
                        }
                        m = m.parentNode;
                      }
                      e.classList.add("primary");
                    }
                    return i.parentNode.querySelectorAll(".active").forEach(((c) => {
                      c.classList.remove("active"), c.classList.add("smart-hidden");
                    })), i.classList.add("active"), void i.classList.remove("smart-hidden");
                  }
                  a && i && !i[a] && a === "collapse" && (setTimeout((() => {
                    i.classList.contains("smart-hidden") ? i.classList.remove("smart-hidden") : i.classList.add("smart-hidden");
                  })), t.originalEvent.preventDefault()), a && i && !i[a] && a === "dropdown" ? (setTimeout((() => {
                    i.opened = !i.opened;
                  })), t.originalEvent.preventDefault()) : a && i && i[a] && (setTimeout((() => {
                    n ? i[a](n) : i[a]();
                  }), 50), t.originalEvent.preventDefault());
                }
              }
              _focusHandler() {
                this.$.setAttributeValue("focus", !0), this.$.fireEvent("focus");
              }
              _blurHandler() {
                this.$.setAttributeValue("focus", !1), this.$.fireEvent("blur");
              }
              _clickHandler(t) {
                const e = this;
                (e.clickMode !== "release" && e.clickMode !== "pressAndRelease" || e.readonly) && (t.preventDefault(), t.stopPropagation());
              }
              _downHandler(t) {
                const e = this;
                if (!(e.disabled || (e.hasRippleAnimation && Smart.Utilities.Animation.Ripple.animate(e, t.pageX, t.pageY), e.$.setAttributeValue("active", !0), e.clickMode !== "press" && e.clickMode !== "pressAndRelease" || e.readonly))) {
                  if (e.hasAttribute("smart-blazor")) return void e.$.dispatchEvent(new Event("click"));
                  const i = "buttons" in t ? t.buttons : t.which;
                  e.$.fireEvent("click", { buttons: i, clientX: t.clientX, clientY: t.clientY, pageX: t.pageX, pageY: t.pageY, screenX: t.screenX, screenY: t.screenY });
                }
              }
              _mouseEnterHandler(t) {
                const e = this;
                if (!e.readonly && (e.$button.setAttributeValue("hover", !0), e.$.setAttributeValue("hover", !0), e.clickMode === "hover")) {
                  const i = "buttons" in t ? t.buttons : t.which;
                  if (e.hasAttribute("smart-blazor")) return void e.$.dispatchEvent(new Event("click"));
                  e.$.fireEvent("click", { buttons: i, clientX: t.clientX, clientY: t.clientY, pageX: t.pageX, pageY: t.pageY, screenX: t.screenX, screenY: t.screenY });
                }
              }
              _touchEndHandler() {
                const t = this;
                setTimeout((function() {
                  t.$button.setAttributeValue("hover", !1), t.$.setAttributeValue("hover", !1);
                }), 300);
              }
              _mouseLeaveHandler() {
                this.$button.setAttributeValue("hover", !1), this.$.setAttributeValue("hover", !1);
              }
              propertyChangedHandler(t, e, i) {
                super.propertyChangedHandler(t, e, i);
                const a = this;
                t === "disabled" ? (a._setFocusable(), a.$button && a.$button.setAttributeValue("hover", !1), a.$.setAttributeValue("hover", !1), a instanceof Smart.RepeatButton && a._stopRepeat()) : t === "unfocusable" && a._setFocusable();
              }
              _setFocusable() {
                const t = this, e = t.$.button ? t.$.button : t;
                if (t.disabled || t.unfocusable) return e.removeAttribute("tabindex"), void (e.tabIndex = -1);
                e.tabIndex = t.tabIndex > 0 ? t.tabIndex : 0;
              }
              ready() {
                const t = this;
                super.ready(), t.setAttribute("role", "presentation"), t._setFocusable(), t.enableShadowDOM && t.$.hiddenInput && t.appendChild(t.$.hiddenInput);
              }
            }), Smart("smart-repeat-button", class extends Smart.Button {
              static get properties() {
                return { delay: { value: 50, type: "number" }, initialDelay: { value: 150, type: "number" } };
              }
              static get listeners() {
                return { "button.down": "_startRepeat", "button.mouseenter": "_overriddenHandler", "button.mouseleave": "_overriddenHandler", "button.pointerenter": "_updateInBoundsFlag", "button.pointerleave": "_updateInBoundsFlag", "button.touchmove": "_touchmoveHandler", "document.up": "_stopRepeat" };
              }
              _clickHandler(t) {
                const e = this;
                (e.clickMode !== "release" || e.preventDefaultClick || e.readonly || e.disabled) && (t.preventDefault(), t.stopPropagation(), e.preventDefaultClick = !1);
              }
              _updateInBoundsFlag(t) {
                const e = this;
                t.type.indexOf("leave") !== -1 ? (e._isPointerInBounds = !1, e.$button.setAttributeValue("hover", !1), e.$.setAttributeValue("hover", !1)) : (e._isPointerInBounds = !0, e.$button.setAttributeValue("hover", !0), e.$.setAttributeValue("hover", !0)), ("buttons" in t ? t.buttons : t.which) !== 1 && e._stopRepeat(t);
              }
              _startRepeat(t) {
                const e = this;
                e.setAttribute("active", ""), e._initialTimer || e.readonly || (e._initialTimer = setTimeout((function() {
                  e._repeatTimer = setInterval((() => {
                    if (e._isPointerInBounds) {
                      if (e.hasAttribute("smart-blazor")) return e.$.dispatchEvent(new Event("click")), void (e.preventDefaultClick = !0);
                      const i = "buttons" in t ? t.buttons : t.which;
                      e.$.fireEvent("click", { buttons: i, clientX: t.clientX, clientY: t.clientY, pageX: t.pageX, pageY: t.pageY, screenX: t.screenX, screenY: t.screenY }), e.preventDefaultClick = !0;
                    }
                  }), e.delay);
                }), e.initialDelay));
              }
              _stopRepeat(t) {
                const e = this;
                e.readonly || t && (t.type === "pointercancel" || t.originalEvent && t.originalEvent.type === "pointercancel") || (e.$.setAttributeValue("active", !1), e._repeatTimer && (clearInterval(e._repeatTimer), e._repeatTimer = null), e._initialTimer && (clearTimeout(e._initialTimer), e._initialTimer = null));
              }
              _touchmoveHandler(t) {
                this.preventDefaultClick && t.cancelable && (t.preventDefault(), t.stopPropagation());
              }
              _overriddenHandler() {
              }
            }), Smart("smart-toggle-button", class extends Smart.Button {
              static get properties() {
                return { checked: { value: !1, type: "boolean?" }, falseContent: { value: "", reflectToAttribute: !1, type: "string" }, indeterminateContent: { value: "", reflectToAttribute: !1, type: "string" }, indeterminate: { value: !1, type: "boolean" }, trueContent: { value: "", reflectToAttribute: !1, type: "string" }, indeterminateTemplate: { value: null, type: "any" }, trueTemplate: { value: null, type: "any" }, falseTemplate: { value: null, type: "any" }, type: { value: "toggle", type: "string", defaultReflectToAttribute: !0, readonly: !0 } };
              }
              static get listeners() {
                return { keydown: "_keyHandler", keyup: "_keyHandler", dragstart: "_dragStartHandler", "button.click": "_buttonClickHandler", "button.mouseenter": "_buttonMouseEnterHandler", "button.mouseleave": "_buttonMouseLeaveHandler", "document.up": "_documentUpHandler" };
              }
              ready() {
                super.ready(), this._setAriaState(), this._updateGroupValue();
              }
              _setAriaState() {
                const t = this, e = t.checked;
                e !== null ? t.setAttribute("aria-pressed", e) : t.setAttribute("aria-pressed", "mixed");
              }
              _buttonClickHandler() {
              }
              _buttonMouseLeaveHandler() {
                this.removeAttribute("hover");
              }
              _buttonMouseEnterHandler() {
                const t = this;
                t.setAttribute("hover", ""), t.disabled || t.readonly || t.clickMode !== "hover" || (t._changeCheckState("pointer"), t.focus(), t._updateHidenInputNameAndValue());
              }
              _documentUpHandler(t) {
                const e = this;
                e._pressed && (e._pressed = !1, e.disabled || e.readonly || e.clickMode === "press" || t.originalEvent.type === "pointercancel" || (e._changeCheckState("pointer"), e.focus(), e._updateHidenInputNameAndValue()));
              }
              _downHandler(t) {
                const e = this;
                e.disabled || e.readonly || (e.hasRippleAnimation && Smart.Utilities.Animation.Ripple.animate(e, t.pageX, t.pageY), e._pressed = !0, e.clickMode !== "press" && e.clickMode !== "pressAndRelease" || (e._changeCheckState("pointer"), e.hasAttribute("smart-blazor") ? e.$.dispatchEvent(new Event("click")) : e.$.fireEvent("click"), e._updateHidenInputNameAndValue()), e.clickMode === "press" && (t.preventDefault(), t.stopPropagation()));
              }
              _dragStartHandler(t) {
                t.preventDefault();
              }
              _keyHandler(t) {
                const e = this;
                if (e.disabled !== !0 && !e.readonly && t.keyCode === 32) {
                  if (t.type === "keydown") return void t.preventDefault();
                  if (e.switchMode === "none") return;
                  e._changeCheckState("keyboard"), e._updateHidenInputNameAndValue();
                }
              }
              _updateGroupValue() {
                const t = this;
                if (t.dataset.target) {
                  const e = document.querySelector(t.dataset.target);
                  if (e) {
                    const i = document.querySelectorAll('[data-target="' + t.dataset.target + '"]'), a = [];
                    if (t.checked) {
                      const n = t.dataset.property, r = t.dataset.value;
                      if (n && e[n] !== void 0) {
                        let s = r;
                        s === "true" && (s = !0), s === "false" && (s = !1), e[n] = s;
                      }
                    }
                    for (let n = 0; n < i.length; n++) {
                      const r = i[n];
                      r.checked && (r.name ? (a.push(r.name), t.id && r.setAttribute("data-id", t.id)) : t.id && a.push(t.id));
                    }
                    e.value = a.toString(), t._targetDispatchTimer && clearTimeout(t._targetDispatchTimer), t._targetDispatchTimer = setTimeout((() => {
                      e.dispatchEvent(new Event("change"));
                    }), 100);
                  }
                }
              }
              _changeCheckState(t) {
                const e = this;
                let i = null;
                e.checked === null ? e.checked = !0 : (i = e.checked, e.checked = !e.checked), e._handleTextSelection(), e.$.fireEvent("change", { value: e.checked, oldValue: i, changeType: t }), e.checked ? e.$.fireEvent("checkValue", { changeType: t }) : e.$.fireEvent("uncheckValue", { changeType: t }), e._updateGroupValue(), e._setAriaState();
              }
              _handleTextSelection() {
                const t = this;
                t.$.addClass("smart-unselectable"), t.timer && clearTimeout(t.timer), t.timer = setTimeout((() => t.$.removeClass("smart-unselectable")), 500);
              }
              propertyChangedHandler(t, e, i) {
                super.propertyChangedHandler(t, e, i);
                const a = this;
                if (t === "checked") return a.$.fireEvent("change", { value: i, oldValue: e, changeType: "api" }), void a._setAriaState();
                switch (t) {
                  case "trueTemplate":
                    a._handleTemplate(!0);
                    break;
                  case "falseTemplate":
                    a._handleTemplate(!1);
                    break;
                  case "indeterminateTemplate":
                    a._handleTemplate();
                }
              }
              _htmlBindOnInitialization() {
                const t = this;
                t._bindContentProperty("trueContent", "smart-true-content"), t._bindContentProperty("falseContent", "smart-false-content"), t._bindContentProperty("indeterminateContent", "smart-indeterminate-content");
              }
              _bindContentProperty(t, e) {
                const i = this;
                if (!i.$[t + "Container"]) return;
                let a = document.createElement("div");
                a.innerHTML = i.innerHTML;
                let n, r = a.getElementsByClassName(e);
                if (r.length > 0) for (let s = 0; s < r.length; s++) n = r[s];
                i[t] === "" && (i[t] = n === void 0 ? "" : n.outerHTML), i.$[t + "Container"].innerHTML = i[t];
              }
              _updateContentProperties() {
                const t = this;
                function e(i) {
                  t.$[i + "Container"] && (t[i] = t.$[i + "Container"].innerHTML);
                }
                e("trueContent"), e("falseContent"), e("indeterminateContent");
              }
              _updateHidenInputValue() {
                const t = this;
                if (!t.$.hiddenInput) return;
                let e;
                e = t.checked === null ? "null" : t.checked === !1 ? "off" : t.value || "on", t.$.hiddenInput.setAttribute("value", e);
              }
              _updateHidenInputName() {
                const t = this;
                if (!t.$.hiddenInput) return;
                let e = t.checked === !1 ? "" : t.name || "";
                t.$.hiddenInput.setAttribute("name", e);
              }
              _updateHidenInputNameAndValue() {
                this._updateHidenInputName(), this._updateHidenInputValue();
              }
              _handleTemplate(t, e) {
                const i = this;
                let a, n, r;
                if (t === !0 ? (a = i.trueTemplate, n = i.$.trueContentContainer, r = i.trueContent) : t === !1 ? (a = i.falseTemplate, n = i.$.falseContentContainer, r = i.falseContent) : (a = i.indeterminateTemplate, n = i.$.indeterminateContentContainer, r = i.indeterminateContent), e && (n.innerHTML = r || ""), a === null || !a) return;
                if (typeof a == "function") return void a(n, { value: r });
                if (!("content" in document.createElement("template"))) return void i.error(i.localize("htmlTemplateNotSuported", { elementType: i.nodeName.toLowerCase() }));
                if (a = document.getElementById(a), a === null || !("content" in a)) return void i.error(i.localize("invalidTemplate", { elementType: i.nodeName.toLowerCase(), property: "template" }));
                const s = a.content, o = s.childNodes.length, l = /{{\w+}}/g;
                let c, m = [];
                for (let f = 0; f < o; f++) for (c = l.exec(s.childNodes[f].innerHTML); c; ) m.push({ childNodeIndex: f, bindingString: c[0] }), c = l.exec(s.childNodes[f].innerHTML);
                const u = m.length;
                let p, h, g = document.importNode(a.content, !0);
                for (let f = 0; f < u; f++) {
                  p = g.childNodes[m[f].childNodeIndex], h = m.length;
                  for (let b = 0; b < h; b++) p.innerHTML = p.innerHTML.replace(m[f].bindingString, r);
                }
                n.innerHTML = "";
                for (let f = 0; f < g.childNodes.length; f++) g.childNodes[f].outerHTML && (n.innerHTML += g.childNodes[f].outerHTML);
              }
            });
          })
        ),
        /***/
        4232: (
          /***/
          (() => {
            Smart.Utilities.Assign("Complex", class {
              constructor(t, e) {
                if (typeof t == "string") this.complexNumber = this.parseComplexNumber(t), this.realPart = this.complexNumber.realPart, this.imaginaryPart = this.complexNumber.imaginaryPart;
                else {
                  if (typeof t != "number") throw new Error("Can't create complex number");
                  if (this.realPart = t, typeof e == "number") this.imaginaryPart = e;
                  else {
                    if (e !== void 0) throw new Error("Can't create complex number: invalid imaginary part");
                    this.imaginaryPart = 0;
                  }
                  this.complexNumber = this.parseComplexNumber(this.realPart, this.imaginaryPart);
                }
              }
              valueOf() {
                return this.imaginaryPart === 0 ? this.realPart : null;
              }
              isNaN() {
                return isNaN(this.realPart) || isNaN(this.imaginaryPart);
              }
              isZero() {
                return !(this.realPart !== 0 && this.realPart.toString() !== "-0" || this.imaginaryPart !== 0 && this.imaginaryPart.toString() !== "-0");
              }
              isFinite() {
                return isFinite(this.realPart) && isFinite(this.imaginaryPart);
              }
              isInfinite() {
                return !(this.isNaN() || this.isFinite());
              }
              parseComplexNumber(t, e) {
                const i = { realPart: 0, imaginaryPart: 0 };
                if (t == null) i.realPart = i.imaginaryPart = 0;
                else if (e !== void 0) i.realPart = t, i.imaginaryPart = e;
                else switch (typeof t) {
                  case "object":
                    if ("imaginaryPart" in t && "realPart" in t) i.realPart = t.realPart, i.imaginaryPart = t.imaginaryPart;
                    else {
                      if (t.length !== 2) throw SyntaxError("Invalid Complex Number Parameter");
                      i.realPart = t[0], i.imaginaryPart = t[1];
                    }
                    break;
                  case "string": {
                    i.imaginaryPart = i.realPart = 0;
                    const a = t.match(/\d+\.?\d*e[+-]?\d+|\d+\.?\d*|\.\d+|./g);
                    let n = 1, r = 0;
                    if (a === null) throw SyntaxError("Invalid Complex Number Parameter");
                    for (let s = 0; s < a.length; s++) {
                      const o = a[s];
                      if (!(o === " " || o === "	" || o === `
`)) if (o === "+") n++;
                      else if (o === "-") r++;
                      else if (o === "i" || o === "I") {
                        if (n + r === 0) throw SyntaxError("Invalid Complex Number Parameter");
                        a[s + 1] === " " || isNaN(a[s + 1]) ? i.imaginaryPart += parseFloat((r % 2 ? "-" : "") + "1") : (i.imaginaryPart += parseFloat((r % 2 ? "-" : "") + a[s + 1]), s++), n = r = 0;
                      } else {
                        if (n + r === 0 || isNaN(o)) throw SyntaxError("Invalid Complex Number Parameter");
                        a[s + 1] === "i" || a[s + 1] === "I" ? (i.imaginaryPart += parseFloat((r % 2 ? "-" : "") + o), s++) : i.realPart += parseFloat((r % 2 ? "-" : "") + o), n = r = 0;
                      }
                    }
                    if (n + r > 0) throw SyntaxError("Invalid Complex Number Parameter");
                    break;
                  }
                  case "number":
                    i.imaginaryPart = 0, i.realPart = t;
                    break;
                  default:
                    throw SyntaxError("Invalid Complex Number Parameter");
                }
                return i;
              }
              compare(t, e) {
                const i = this.parseComplexNumber(t, e), a = this.parseComplexNumber("1e-16");
                return Math.abs(i.realPart - this.realPart) <= a && Math.abs(i.imaginaryPart - this.imaginaryPart) <= a;
              }
              toString() {
                let t = this.realPart, e = this.imaginaryPart, i = "";
                return this.isNaN() ? "NaN" : this.isZero() ? "0" : this.isInfinite() ? "Infinity" : (t !== 0 && (i += t), e !== 0 && (t !== 0 ? i += e < 0 ? " - " : " + " : e < 0 && (i += "-"), e = Math.abs(e), e !== 1 && (i += e), i += "i"), i || "0");
              }
            });
          })
        ),
        /***/
        2052: (
          /***/
          (() => {
            (() => {
              const t = -1 * (/* @__PURE__ */ new Date()).getTimezoneOffset(), e = [{ id: "Local", offset: t, offsetHours: t / 60, displayName: "", supportsDaylightSavingTime: !1 }, { id: "Dateline Standard Time", offset: -720, offsetHours: -12, displayName: "(UTC-12:00) International Date Line West", supportsDaylightSavingTime: !1 }, { id: "UTC-11", offset: -660, offsetHours: -11, displayName: "(UTC-11:00) Coordinated Universal Time-11", supportsDaylightSavingTime: !1 }, { id: "Hawaiteratoran Standard Time", offset: -600, offsetHours: -10, displayName: "(UTC-10:00) Hawaiterator", supportsDaylightSavingTime: !1 }, { id: "Alaskan Standard Time", offset: -540, offsetHours: -9, displayName: "(UTC-09:00) Alaska", supportsDaylightSavingTime: !0 }, { id: "Pacific Standard Time (Mexico)", offset: -480, offsetHours: -8, displayName: "(UTC-08:00) Baja California", supportsDaylightSavingTime: !0 }, { id: "Pacific Standard Time", offset: -480, offsetHours: -8, displayName: "(UTC-08:00) Pacific Time (US & Canada)", supportsDaylightSavingTime: !0 }, { id: "US Mountain Standard Time", offset: -420, offsetHours: -7, displayName: "(UTC-07:00) Arizona", supportsDaylightSavingTime: !1 }, { id: "Mountain Standard Time (Mexico)", offset: -420, offsetHours: -7, displayName: "(UTC-07:00) Chihuahua, La Paz, Mazatlan", supportsDaylightSavingTime: !0 }, { id: "Mountain Standard Time", offset: -420, offsetHours: -7, displayName: "(UTC-07:00) Mountain Time (US & Canada)", supportsDaylightSavingTime: !0 }, { id: "Central Standard Time", offset: -360, offsetHours: -6, displayName: "(UTC-06:00) Central Time (US & Canada)", supportsDaylightSavingTime: !0 }, { id: "Central America Standard Time", offset: -360, offsetHours: -6, displayName: "(UTC-06:00) Central America", supportsDaylightSavingTime: !1 }, { id: "Canada Central Standard Time", offset: -360, offsetHours: -6, displayName: "(UTC-06:00) Saskatchewan", supportsDaylightSavingTime: !1 }, { id: "Central Standard Time (Mexico)", offset: -360, offsetHours: -6, displayName: "(UTC-06:00) Guadalajara, Mexico City, Monterrey", supportsDaylightSavingTime: !0 }, { id: "SA Pacific Standard Time", offset: -300, offsetHours: -5, displayName: "(UTC-05:00) Bogota, Lima, Quito, Rio Branco", supportsDaylightSavingTime: !1 }, { id: "Eastern Standard Time", offset: -300, offsetHours: -5, displayName: "(UTC-05:00) Eastern Time (US & Canada)", supportsDaylightSavingTime: !0 }, { id: "US Eastern Standard Time", offset: -300, offsetHours: -5, displayName: "(UTC-05:00) Indiana (East)", supportsDaylightSavingTime: !0 }, { id: "Venezuela Standard Time", offset: -270, offsetHours: -4.5, displayName: "(UTC-04:30) Caracas", supportsDaylightSavingTime: !1 }, { id: "Atlantic Standard Time", offset: -240, offsetHours: -4, displayName: "(UTC-04:00) Atlantic Time (Canada)", supportsDaylightSavingTime: !0 }, { id: "Paraguay Standard Time", offset: -240, offsetHours: -4, displayName: "(UTC-04:00) Asuncion", supportsDaylightSavingTime: !0 }, { id: "Central Brazilian Standard Time", offset: -240, offsetHours: -4, displayName: "(UTC-04:00) Cuiaba", supportsDaylightSavingTime: !0 }, { id: "Pacific SA Standard Time", offset: -240, offsetHours: -4, displayName: "(UTC-04:00) Santiago", supportsDaylightSavingTime: !0 }, { id: "SA Western Standard Time", offset: -240, offsetHours: -4, displayName: "(UTC-04:00) Georgetown, La Paz, Manaus, San Juan", supportsDaylightSavingTime: !1 }, { id: "Newfoundland Standard Time", offset: -210, offsetHours: -3.5, displayName: "(UTC-03:30) Newfoundland", supportsDaylightSavingTime: !0 }, { id: "SA Eastern Standard Time", offset: -180, offsetHours: -3, displayName: "(UTC-03:00) Cayenne, Fortaleza", supportsDaylightSavingTime: !1 }, { id: "Argentina Standard Time", offset: -180, offsetHours: -3, displayName: "(UTC-03:00) Buenos Aires", supportsDaylightSavingTime: !0 }, { id: "E. South America Standard Time", offset: -180, offsetHours: -3, displayName: "(UTC-03:00) Brasilia", supportsDaylightSavingTime: !0 }, { id: "Bahia Standard Time", offset: -180, offsetHours: -3, displayName: "(UTC-03:00) Salvador", supportsDaylightSavingTime: !0 }, { id: "Montevideo Standard Time", offset: -180, offsetHours: -3, displayName: "(UTC-03:00) Montevideo", supportsDaylightSavingTime: !0 }, { id: "Greenland Standard Time", offset: -180, offsetHours: -3, displayName: "(UTC-03:00) Greenland", supportsDaylightSavingTime: !0 }, { id: "UTC-02", offset: -120, offsetHours: -2, displayName: "(UTC-02:00) Coordinated Universal Time-02", supportsDaylightSavingTime: !1 }, { id: "Mid-Atlantic Standard Time", offset: -120, offsetHours: -2, displayName: "(UTC-02:00) Mid-Atlantic - Old", supportsDaylightSavingTime: !0 }, { id: "Azores Standard Time", offset: -60, offsetHours: -1, displayName: "(UTC-01:00) Azores", supportsDaylightSavingTime: !0 }, { id: "Cape Verde Standard Time", offset: -60, offsetHours: -1, displayName: "(UTC-01:00) Cape Verde Is.", supportsDaylightSavingTime: !1 }, { id: "Morocco Standard Time", offset: 0, offsetHours: 0, displayName: "(UTC) Casablanca", supportsDaylightSavingTime: !0 }, { id: "UTC", offset: 0, offsetHours: 0, displayName: "(UTC) Coordinated Universal Time", supportsDaylightSavingTime: !1 }, { id: "GMT Standard Time", offset: 0, offsetHours: 0, displayName: "(UTC) Dublin, Edinburgh, Lisbon, London", supportsDaylightSavingTime: !0 }, { id: "Greenwich Standard Time", offset: 0, offsetHours: 0, displayName: "(UTC) Monrovia, Reykjavik", supportsDaylightSavingTime: !1 }, { id: "Central European Standard Time", offset: 60, offsetHours: 1, displayName: "(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb", supportsDaylightSavingTime: !0 }, { id: "Namibia Standard Time", offset: 60, offsetHours: 1, displayName: "(UTC+01:00) Windhoek", supportsDaylightSavingTime: !0 }, { id: "W. Central Africa Standard Time", offset: 60, offsetHours: 1, displayName: "(UTC+01:00) West Central Africa", supportsDaylightSavingTime: !1 }, { id: "W. Europe Standard Time", offset: 60, offsetHours: 1, displayName: "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna", supportsDaylightSavingTime: !0 }, { id: "Central Europe Standard Time", offset: 60, offsetHours: 1, displayName: "(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague", supportsDaylightSavingTime: !0 }, { id: "Romance Standard Time", offset: 60, offsetHours: 1, displayName: "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris", supportsDaylightSavingTime: !0 }, { id: "FLE Standard Time", offset: 120, offsetHours: 2, displayName: "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius", supportsDaylightSavingTime: !0 }, { id: "South Africa Standard Time", offset: 120, offsetHours: 2, displayName: "(UTC+02:00) Harare, Pretoria", supportsDaylightSavingTime: !1 }, { id: "Turkey Standard Time", offset: 120, offsetHours: 2, displayName: "(UTC+02:00) Istanbul", supportsDaylightSavingTime: !0 }, { id: "GTB Standard Time", offset: 120, offsetHours: 2, displayName: "(UTC+02:00) Athens, Bucharest", supportsDaylightSavingTime: !0 }, { id: "Libya Standard Time", offset: 120, offsetHours: 2, displayName: "(UTC+02:00) Tripoli", supportsDaylightSavingTime: !0 }, { id: "E. Europe Standard Time", offset: 120, offsetHours: 2, displayName: "(UTC+02:00) E. Europe", supportsDaylightSavingTime: !0 }, { id: "Jordan Standard Time", offset: 120, offsetHours: 2, displayName: "(UTC+02:00) Amman", supportsDaylightSavingTime: !0 }, { id: "Middle East Standard Time", offset: 120, offsetHours: 2, displayName: "(UTC+02:00) Beirut", supportsDaylightSavingTime: !0 }, { id: "Egypt Standard Time", offset: 120, offsetHours: 2, displayName: "(UTC+02:00) Cairo", supportsDaylightSavingTime: !0 }, { id: "Syria Standard Time", offset: 120, offsetHours: 2, displayName: "(UTC+02:00) Damascus", supportsDaylightSavingTime: !0 }, { id: "Israel Standard Time", offset: 120, offsetHours: 2, displayName: "(UTC+02:00) Jerusalem", supportsDaylightSavingTime: !0 }, { id: "Arab Standard Time", offset: 180, offsetHours: 3, displayName: "(UTC+03:00) Kuwait, Riyadh", supportsDaylightSavingTime: !1 }, { id: "E. Africa Standard Time", offset: 180, offsetHours: 3, displayName: "(UTC+03:00) Nairobi", supportsDaylightSavingTime: !1 }, { id: "Arabic Standard Time", offset: 180, offsetHours: 3, displayName: "(UTC+03:00) Baghdad", supportsDaylightSavingTime: !0 }, { id: "Kaliningrad Standard Time", offset: 180, offsetHours: 3, displayName: "(UTC+03:00) Kaliningrad, Minsk", supportsDaylightSavingTime: !0 }, { id: "Iran Standard Time", offset: 210, offsetHours: 3.5, displayName: "(UTC+03:30) Tehran", supportsDaylightSavingTime: !0 }, { id: "Mauritius Standard Time", offset: 240, offsetHours: 4, displayName: "(UTC+04:00) Port Louis", supportsDaylightSavingTime: !0 }, { id: "Georgian Standard Time", offset: 240, offsetHours: 4, displayName: "(UTC+04:00) Tbilisi", supportsDaylightSavingTime: !1 }, { id: "Caucasus Standard Time", offset: 240, offsetHours: 4, displayName: "(UTC+04:00) Yerevan", supportsDaylightSavingTime: !0 }, { id: "Arabian Standard Time", offset: 240, offsetHours: 4, displayName: "(UTC+04:00) Abu Dhabi, Muscat", supportsDaylightSavingTime: !1 }, { id: "Azerbaijan Standard Time", offset: 240, offsetHours: 4, displayName: "(UTC+04:00) Baku", supportsDaylightSavingTime: !0 }, { id: "Russian Standard Time", offset: 240, offsetHours: 4, displayName: "(UTC+04:00) Moscow, St. Petersburg, Volgograd", supportsDaylightSavingTime: !0 }, { id: "Afghanistan Standard Time", offset: 270, offsetHours: 4.5, displayName: "(UTC+04:30) Kabul", supportsDaylightSavingTime: !1 }, { id: "Pakistan Standard Time", offset: 300, offsetHours: 5, displayName: "(UTC+05:00) Islamabad, Karachi", supportsDaylightSavingTime: !0 }, { id: "West Asia Standard Time", offset: 300, offsetHours: 5, displayName: "(UTC+05:00) Ashgabat, Tashkent", supportsDaylightSavingTime: !1 }, { id: "India Standard Time", offset: 330, offsetHours: 5.5, displayName: "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi", supportsDaylightSavingTime: !1 }, { id: "Sri Lanka Standard Time", offset: 330, offsetHours: 5.5, displayName: "(UTC+05:30) Sri Jayawardenepura", supportsDaylightSavingTime: !1 }, { id: "Nepal Standard Time", offset: 345, offsetHours: 5.75, displayName: "(UTC+05:45) Kathmandu", supportsDaylightSavingTime: !1 }, { id: "Central Asia Standard Time", offset: 360, offsetHours: 6, displayName: "(UTC+06:00) Astana", supportsDaylightSavingTime: !1 }, { id: "Bangladesh Standard Time", offset: 360, offsetHours: 6, displayName: "(UTC+06:00) Dhaka", supportsDaylightSavingTime: !0 }, { id: "Ekaterinburg Standard Time", offset: 360, offsetHours: 6, displayName: "(UTC+06:00) Ekaterinburg", supportsDaylightSavingTime: !0 }, { id: "Myanmar Standard Time", offset: 390, offsetHours: 6.5, displayName: "(UTC+06:30) Yangon (Rangoon)", supportsDaylightSavingTime: !1 }, { id: "SE Asia Standard Time", offset: 420, offsetHours: 7, displayName: "(UTC+07:00) Bangkok, Hanoi, Jakarta", supportsDaylightSavingTime: !1 }, { id: "N. Central Asia Standard Time", offset: 420, offsetHours: 7, displayName: "(UTC+07:00) Novosibirsk", supportsDaylightSavingTime: !0 }, { id: "Ulaanbaatar Standard Time", offset: 480, offsetHours: 8, displayName: "(UTC+08:00) Ulaanbaatar", supportsDaylightSavingTime: !1 }, { id: "China Standard Time", offset: 480, offsetHours: 8, displayName: "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi", supportsDaylightSavingTime: !1 }, { id: "Singapore Standard Time", offset: 480, offsetHours: 8, displayName: "(UTC+08:00) Kuala Lumpur, Singapore", supportsDaylightSavingTime: !1 }, { id: "North Asia Standard Time", offset: 480, offsetHours: 8, displayName: "(UTC+08:00) Krasnoyarsk", supportsDaylightSavingTime: !0 }, { id: "Taipei Standard Time", offset: 480, offsetHours: 8, displayName: "(UTC+08:00) Taipei", supportsDaylightSavingTime: !1 }, { id: "W. Australia Standard Time", offset: 480, offsetHours: 8, displayName: "(UTC+08:00) Perth", supportsDaylightSavingTime: !0 }, { id: "Korea Standard Time", offset: 540, offsetHours: 9, displayName: "(UTC+09:00) Seoul", supportsDaylightSavingTime: !1 }, { id: "North Asia East Standard Time", offset: 540, offsetHours: 9, displayName: "(UTC+09:00) Irkutsk", supportsDaylightSavingTime: !0 }, { id: "Tokyo Standard Time", offset: 540, offsetHours: 9, displayName: "(UTC+09:00) Osaka, Sapporo, Tokyo", supportsDaylightSavingTime: !1 }, { id: "AUS Central Standard Time", offset: 570, offsetHours: 9.5, displayName: "(UTC+09:30) Darwin", supportsDaylightSavingTime: !1 }, { id: "Cen. Australia Standard Time", offset: 570, offsetHours: 9.5, displayName: "(UTC+09:30) Adelaide", supportsDaylightSavingTime: !0 }, { id: "West Pacific Standard Time", offset: 600, offsetHours: 10, displayName: "(UTC+10:00) Guam, Port Moresby", supportsDaylightSavingTime: !1 }, { id: "Tasmania Standard Time", offset: 600, offsetHours: 10, displayName: "(UTC+10:00) Hobart", supportsDaylightSavingTime: !0 }, { id: "E. Australia Standard Time", offset: 600, offsetHours: 10, displayName: "(UTC+10:00) Brisbane", supportsDaylightSavingTime: !1 }, { id: "AUS Eastern Standard Time", offset: 600, offsetHours: 10, displayName: "(UTC+10:00) Canberra, Melbourne, Sydney", supportsDaylightSavingTime: !0 }, { id: "Yakutsk Standard Time", offset: 600, offsetHours: 10, displayName: "(UTC+10:00) Yakutsk", supportsDaylightSavingTime: !0 }, { id: "Vladivostok Standard Time", offset: 660, offsetHours: 11, displayName: "(UTC+11:00) Vladivostok", supportsDaylightSavingTime: !0 }, { id: "Central Pacific Standard Time", offset: 660, offsetHours: 11, displayName: "(UTC+11:00) Solomon Is., New Caledonia", supportsDaylightSavingTime: !1 }, { id: "Magadan Standard Time", offset: 720, offsetHours: 12, displayName: "(UTC+12:00) Magadan", supportsDaylightSavingTime: !0 }, { id: "Kamchatka Standard Time", offset: 720, offsetHours: 12, displayName: "(UTC+12:00) Petropavlovsk-Kamchatsky - Old", supportsDaylightSavingTime: !0 }, { id: "Fiji Standard Time", offset: 720, offsetHours: 12, displayName: "(UTC+12:00) Fiji", supportsDaylightSavingTime: !0 }, { id: "New Zealand Standard Time", offset: 720, offsetHours: 12, displayName: "(UTC+12:00) Auckland, Wellington", supportsDaylightSavingTime: !0 }, { id: "UTC+12", offset: 720, offsetHours: 12, displayName: "(UTC+12:00) Coordinated Universal Time+12", supportsDaylightSavingTime: !1 }, { id: "Tonga Standard Time", offset: 780, offsetHours: 13, displayName: "(UTC+13:00) Nuku'alofa", supportsDaylightSavingTime: !1 }, { id: "Samoa Standard Time", offset: 780, offsetHours: 13, displayName: "(UTC+13:00) Samoa", supportsDaylightSavingTime: !0 }], i = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365], a = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];
              Smart.Utilities.Assign("TimeSpan", class {
                constructor() {
                  const n = this;
                  if (n.ticksPerMillisecond = 1e4, n.millisecondsPerTick = 1e-4, n.ticksPerSecond = 1e7, n.secondsPerTick = 1e-7, n.ticksPerMinute = 6e8, n.minutesPerTick = 16666666666666667e-25, n.ticksPerHour = 36e9, n.hoursPerTick = 27777777777777777e-27, n.ticksPerDay = 864e9, n.daysPerTick = 11574074074074074e-28, n.millisPerSecond = 1e3, n.millisPerMinute = 6e4, n.millisPerHour = 36e5, n.millisPerDay = 864e5, n._ticks = 0, arguments.length === 1) {
                    if (isNaN(arguments[0])) throw new Error("Argument must be a number.");
                    n._ticks = arguments[0];
                  } else if (arguments.length === 3) n._ticks = n.timeToMS(arguments[0], arguments[1], arguments[2], 0);
                  else if (arguments.length === 4) {
                    const r = 1e3 * (3600 * arguments[0] * 24 + 3600 * arguments[1] + 60 * arguments[2] + arguments[3]) + 0;
                    n._ticks = r * n.ticksPerMillisecond;
                  } else if (arguments.length === 5) {
                    const r = 1e3 * (3600 * arguments[0] * 24 + 3600 * arguments[1] + 60 * arguments[2] + arguments[3]) + arguments[4];
                    n._ticks = r * n.ticksPerMillisecond;
                  }
                }
                ticks() {
                  return this._ticks;
                }
                days() {
                  return parseInt(this._ticks / this.ticksPerDay);
                }
                timeToMS(n, r, s, o) {
                  return parseInt((3600 * n + 60 * r + s + o / 1e3) * this.ticksPerSecond);
                }
                hours() {
                  return parseInt(this._ticks / this.ticksPerHour) % 24;
                }
                milliseconds() {
                  return parseInt(this._ticks / this.ticksPerMillisecond) % 1e3;
                }
                minutes() {
                  return parseInt(this._ticks / this.ticksPerMinute) % 60;
                }
                seconds() {
                  return parseInt(this._ticks / this.ticksPerSecond) % 60;
                }
                totalDays() {
                  return parseInt(this._ticks * this.daysPerTick);
                }
                totalHours() {
                  return parseInt(this._ticks * this.hoursPerTick);
                }
                totalMilliseconds() {
                  const n = this._ticks * this.millisecondsPerTick;
                  return parseInt(n);
                }
                totalMinutes() {
                  return parseInt(this._ticks * this.minutesPerTick);
                }
                totalSeconds() {
                  return parseInt(this._ticks * this.secondsPerTick);
                }
                add(n) {
                  const r = this._ticks + n._ticks;
                  return new Smart.Utilities.TimeSpan(r);
                }
                subtract(n) {
                  const r = this._ticks - n._ticks;
                  return new Smart.Utilities.TimeSpan(r);
                }
                duration() {
                  const n = this;
                  return n._ticks >= 0 ? new Smart.Utilities.TimeSpan(n._ticks) : new Smart.Utilities.TimeSpan(-n._ticks);
                }
                equals(n) {
                  return this._ticks === n._ticks;
                }
                valueOf() {
                  return this._ticks;
                }
                compare(n, r) {
                  return n._ticks > r._ticks ? 1 : n._ticks < r._ticks ? -1 : 0;
                }
                interval(n, r) {
                  const s = n * r + (n >= 0 ? 0.5 : -0.5);
                  return new Smart.Utilities.TimeSpan(s * this.ticksPerMillisecond);
                }
                fromDays(n) {
                  return this.interval(n, this.millisPerDay);
                }
                fromHours(n) {
                  return this.interval(n, this.millisPerHour);
                }
                fromMilliseconds(n) {
                  return this.interval(n, 1);
                }
                fromMinutes(n) {
                  return this.interval(n, this.millisPerMinute);
                }
                fromSeconds(n) {
                  return this.interval(n, this.millisPerSecond);
                }
                fromTicks(n) {
                  return new Smart.Utilities.TimeSpan(n);
                }
                toString() {
                  return this.totalMilliseconds().toString();
                }
                negate() {
                  return new Smart.Utilities.TimeSpan(-this._ticks);
                }
              }), Smart.Utilities.Assign("DateTime", class {
                constructor() {
                  function n(o) {
                    const l = r.regexISOString.exec(o);
                    s = new Smart.Utilities.DateTime(parseFloat(l[1]), parseFloat(l[2]), parseFloat(l[3]), parseFloat(l[4]), parseFloat(l[5]), parseFloat(l[6]), parseFloat(l[7]), 0, 0, 0, 0, 0, 0, 0, "UTC");
                  }
                  const r = this;
                  let s;
                  if (r.ticksPerMillisecond = 1e4, r.millisecondsPerTick = 1e-4, r.ticksPerSecond = 1e7, r.secondsPerTick = 1e-7, r.ticksPerMinute = 6e8, r.minutesPerTick = 16666666666666667e-25, r.ticksPerHour = 36e9, r.hoursPerTick = 27777777777777777e-27, r.ticksPerDay = 864e9, r.daysPerTick = 11574074074074074e-28, r.millisPerSecond = 1e3, r.millisPerMinute = 6e4, r.millisPerHour = 36e5, r.millisPerDay = 864e5, r.daysPerYear = 365, r.daysPer4Years = 1461, r.daysPer100Years = 36524, r.daysPer400Years = 146097, r.daysTo1601 = 584388, r.daysTo1899 = 693593, r.daysTo10000 = 3652059, r.minTicks = 0, r.maxTicks = 3155378976e9, r.maxMillis = 3155378976e5, r.datePartYear = 0, r.datePartDayOfYear = 1, r.datePartMonth = 2, r.datePartDay = 3, r.daysToMonth365 = i, r.daysToMonth366 = a, r.minValue = /* @__PURE__ */ new Date(0), r.maxValue = /* @__PURE__ */ new Date(3155378976e9), r.ticksMask = 4611686018427388e3, r.flagsMask = 13835058055282164e3, r.localMask = 9223372036854776e3, r.ticksCeiling = 4611686018427388e3, r.kindUnspecified = 0, r.kindUtc = 4611686018427388e3, r.kindLocal = 9223372036854776e3, r.kindLocalAmbiguousDst = 13835058055282164e3, r.kindShift = 62, r.regexTrim = /^\s+|\s+$/g, r.regexInfinity = /^[+-]?infinity$/i, r.regexHex = /^0x[a-f0-9]+$/i, r.regexParseFloat = /^[+-]?\d*\.?\d*(e[+-]?\d+)?$/, r.regexISOString = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z$/, r.calendar = { "/": "/", ":": ":", firstDay: 0, days: { names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], namesAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], namesShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] }, months: { names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ""], namesAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""] }, AM: ["AM", "am", "AM"], PM: ["PM", "pm", "PM"], eras: [{ name: "A.D.", start: null, offset: 0 }], twoDigitYearMax: 2029, patterns: { d: "M/d/yyyy", D: "dddd, MMMM dd, yyyy", t: "h:mm tt", T: "h:mm:ss tt", f: "dddd, MMMM dd, yyyy h:mm tt", F: "dddd, MMMM dd, yyyy h:mm:ss tt", M: "MMMM dd", Y: "yyyy MMMM", S: "yyyy'-'MM'-'dd'T'HH':'mm':'ss", ISO: "yyyy-MM-dd hh:mm:ss", ISO2: "yyyy-MM-dd HH:mm:ss", ISO8601: "yyyy-MM-ddTHH:mm:ss.sssZ", d1: "dd.MM.yyyy", d2: "dd-MM-yyyy", zone1: "yyyy-MM-ddTHH:mm:ss-HH:mm", zone2: "yyyy-MM-ddTHH:mm:ss+HH:mm", custom: "yyyy-MM-ddTHH:mm:ss.fff", custom2: "yyyy-MM-dd HH:mm:ss.fff", FP: "yyyy-MM-dd HH:mm:ss:fff:uu:nn:pp:ee:aa:xx:oo", FPA: "yyyy/MM/dd HH:mm:ss:fffuunnppeeaaxxoo", FPA2: "yyyy-MM-dd HH:mm:ss:fffuunnppeeaaxxoo", FT: "HH:mm:ss:fff:uu:nn:pp:ee:aa:xx:oo", PP: "yyyy-MM-dd HH:mm:ss:fff:uu:nn:pp", PT: "HH:mm:ss:fff:uu:nn:pp" }, percentsymbol: "%", currencysymbol: "$", currencysymbolposition: "before", decimalseparator: ".", thousandsseparator: "," }, r.dateData = 0, r.timeZone = null, r.timeZones = e, r._codeToUnit = { u: "_microsecond", uu: "_microsecond", n: "_nanosecond", nn: "_nanosecond", p: "_picosecond", pp: "_picosecond", e: "_femtosecond", ee: "_femtosecond", a: "_attosecond", aa: "_attosecond", x: "_zeptosecond", xx: "_zeptosecond", o: "_yoctosecond", oo: "_yoctosecond" }, r._smallUnits = ["_microsecond", "_nanosecond", "_picosecond", "_femtosecond", "_attosecond", "_zeptosecond", "_yoctosecond"], r._microsecond = 0, r._nanosecond = 0, r._picosecond = 0, r._femtosecond = 0, r._attosecond = 0, r._zeptosecond = 0, r._yoctosecond = 0, arguments.length === 0) {
                    const o = /* @__PURE__ */ new Date();
                    r.dateData = r.dateToMS(o.getFullYear(), o.getMonth() + 1, o.getDate()) + r.timeToMS(o.getHours(), o.getMinutes(), o.getSeconds(), o.getMilliseconds());
                  } else if (arguments.length === 1)
                    if (arguments[0] === void 0 && (arguments[0] = "todayDate"), typeof arguments[0] == "number" && isFinite(arguments[0]) || typeof arguments[0] != "string") if (typeof arguments[0] == "number") r.dateData = arguments[0];
                    else if (arguments[0] instanceof Date) {
                      const o = arguments[0];
                      r.dateData = r.dateToMS(o.getFullYear(), o.getMonth() + 1, o.getDate()) + r.timeToMS(o.getHours(), o.getMinutes(), o.getSeconds(), o.getMilliseconds());
                    } else r.dateData = arguments[0];
                    else {
                      let o;
                      arguments[0] === "today" ? o = /* @__PURE__ */ new Date() : arguments[0] === "todayDate" ? (o = /* @__PURE__ */ new Date(), o.setHours(0, 0, 0, 0)) : r.regexISOString.test(arguments[0]) ? n(arguments[0]) : o = r.tryparseDate(arguments[0]), o && (r.dateData = r.dateToMS(o.getFullYear(), o.getMonth() + 1, o.getDate()) + r.timeToMS(o.getHours(), o.getMinutes(), o.getSeconds(), o.getMilliseconds()));
                    }
                  else if (arguments.length === 2) {
                    if (arguments[0] === void 0 && (arguments[0] = "todayDate"), typeof arguments[0] == "number" && isFinite(arguments[0]) || typeof arguments[0] != "string") if (typeof arguments[0] == "number") r.dateData = arguments[0];
                    else if (arguments[0] instanceof Date) {
                      const o = arguments[0];
                      r.dateData = r.dateToMS(o.getFullYear(), o.getMonth() + 1, o.getDate()) + r.timeToMS(o.getHours(), o.getMinutes(), o.getSeconds(), o.getMilliseconds());
                    } else r.dateData = arguments[0];
                    else {
                      let o;
                      arguments[0] === "today" ? o = /* @__PURE__ */ new Date() : arguments[0] === "todayDate" ? (o = /* @__PURE__ */ new Date(), o.setHours(0, 0, 0, 0)) : r.regexISOString.test(arguments[0]) ? n(arguments[0]) : o = r.tryparseDate(arguments[0]), o && (r.dateData = r.dateToMS(o.getFullYear(), o.getMonth() + 1, o.getDate()) + r.timeToMS(o.getHours(), o.getMinutes(), o.getSeconds(), o.getMilliseconds()));
                    }
                    r.validateTimeZone(arguments[1]);
                  } else if (arguments.length > 2) if (typeof arguments[0] == "string") {
                    const o = r.tryparseDate(arguments[0], arguments[2], arguments[1]);
                    r.dateData = r.dateToMS(o.getFullYear(), o.getMonth() + 1, o.getDate()) + r.timeToMS(o.getHours(), o.getMinutes(), o.getSeconds(), o.getMilliseconds());
                  } else {
                    let o = arguments[0], l = arguments[1] - 1, c = arguments[2], m = arguments[3] || 0, u = arguments[4] || 0, p = arguments[5] || 0, h = arguments[6] || 0, g = arguments[7] || 0, f = arguments[8] || 0, b = arguments[9] || 0, y = arguments[10] || 0, _ = arguments[11] || 0, x = arguments[12] || 0, w = arguments[13] || 0;
                    o >= 2100 && (o = 2100), l >= 12 ? l = 11 : l < 0 && (l = 0), c > 31 ? c = r.daysInMonth(o, 1 + l) : c < 0 && (c = 0), m > 23 ? m = 23 : m < 0 && (m = 0), u > 59 ? u = 59 : u < 0 && (u = 0), p > 59 ? p = 59 : p < 0 && (p = 0);
                    const S = new Date(o, l, c, m, u, p, h);
                    o < 1970 && S.setFullYear(o), r.dateData = r.dateToMS(S.getFullYear(), S.getMonth() + 1, S.getDate()) + r.timeToMS(S.getHours(), S.getMinutes(), S.getSeconds(), S.getMilliseconds()), r._microsecond = g, r._nanosecond = f, r._picosecond = b, r._femtosecond = y, r._attosecond = _, r._zeptosecond = x, r._yoctosecond = w, arguments[14] && r.validateTimeZone(arguments[14]);
                  }
                  if (r.timeZone || r.validateTimeZone("Local"), s) {
                    const o = s.toTimeZone(r.timeZone);
                    r.dateData = o.dateData;
                  }
                }
                static isValidDate(n) {
                  const r = this.validateDate(n);
                  return !(!r || r && !r.dateData);
                }
                static validateDate(n, r, s) {
                  if (n instanceof Smart.Utilities.DateTime) return n;
                  if (n instanceof Date) return new Smart.Utilities.DateTime(n);
                  try {
                    if (typeof n == "string" && s) return this.parseDateString(n, r, s);
                    if (new RegExp(/^\d{1,2}\/\d{1,2}\/\d{4}(, \d{1,2}:\d{2}:\d{1,2} [A|P]M)?$/).test(n)) {
                      const o = new Date(n);
                      if (!isNaN(o.getTime())) return new Smart.Utilities.DateTime(o);
                    }
                    if (typeof n == "string") return this.parseDateString(n, r, s);
                    if (typeof n == "number") return new Smart.Utilities.DateTime(new Date(n));
                  } catch {
                  }
                  return r;
                }
                static parseDateString(n, r, s) {
                  const o = new Date(n);
                  if (!isNaN(o.getTime())) return n && typeof n == "string" && s ? new Smart.Utilities.DateTime(n, s, null) : new Smart.Utilities.DateTime(o);
                  const l = n.indexOf("Date("), c = n.indexOf("DateTime("), m = n.lastIndexOf(")");
                  let u = n;
                  if (l === -1 && c === -1 || m === -1) {
                    const p = new Smart.Utilities.DateTime(), h = p.parseDate(n, s);
                    if (h) return u = new Smart.Utilities.DateTime(h), p.copySmallTimePartValues(u), u;
                  } else {
                    if (u = l !== -1 ? n.slice(l + 5, m) : n.slice(c + 9, m), u = u.replace(/'/g, "").replace(/"/g, "").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), u.trim() === "") return new Smart.Utilities.DateTime();
                    if (new RegExp(/(^(\d+)(\s*,\s*\d+)+(\s*,\s*[a-zA-Z ]+)?$)/g).test(u)) return u = u.split(","), u.map((function(p, h) {
                      isNaN(u[h]) ? u[h] = p.trim() : u[h] = parseInt(p);
                    })), l !== -1 && u[1]++, u.unshift(null), u = new (Function.prototype.bind.apply(Smart.Utilities.DateTime, u))(), u;
                  }
                  if (u.trim() === "") return r;
                  if (!isNaN(u)) return u = new Date(parseInt(u, 10)), new Smart.Utilities.DateTime(u);
                  try {
                    const p = u.split(",");
                    p.length === 2 ? (p[1] = p[1].trim(), p.unshift(null), u = new (Function.prototype.bind.apply(Smart.Utilities.DateTime, p))()) : u = new Smart.Utilities.DateTime(u);
                  } catch {
                    u = r;
                  }
                  return u;
                }
                static fromFullTimeStamp(n) {
                  n = n.toString();
                  const r = new Smart.Utilities.DateTime(parseFloat(n.slice(0, n.length - 21)));
                  let s = n.slice(n.length - 21), o = 0;
                  for (; s.length > 0; ) r[r._smallUnits[o]] = parseInt(s.slice(0, 3), 10), s = s.slice(3), o++;
                  return r;
                }
                static getConstructorParameters(n) {
                  return [n.year(), n.month(), n.day(), n.hour(), n.minute(), n.second(), n.millisecond(), n._microsecond, n._nanosecond, n._picosecond, n._femtosecond, n._attosecond, n._zeptosecond, n._yoctosecond, n.timeZone];
                }
                static detectDisplayMode(n, r, s) {
                  if (n.calendar.patterns[r]) return ["d", "D", "M", "Y", "d1", "d2"].indexOf(r) !== -1 ? "calendar" : ["t", "T", "FT", "PT"].indexOf(r) !== -1 ? "timePicker" : "default";
                  const o = ["d", "M", "y"], l = ["h", "H", "m", "s", "t", "f", "u", "n", "p", "e", "a", "x", "o"], c = s.groups;
                  let m = !1, u = !1;
                  for (let p = 0; p < c.length; p++) {
                    const h = c[p].charAt(0);
                    if (o.indexOf(h) !== -1 ? m = !0 : l.indexOf(h) !== -1 && (u = !0), m && u) break;
                  }
                  return m === u ? "default" : m ? "calendar" : "timePicker";
                }
                static getLocalizedNames(n) {
                  const r = { names: [], namesAbbr: [], namesShort: [] }, s = { names: [], namesAbbr: [] };
                  if (this[n]) return this[n];
                  for (let o = 23; o < 30; o++) {
                    const l = new Date(2017, 6, o), c = l.toLocaleString(n, { weekday: "long" });
                    r.names.push(c), r.namesAbbr.push(l.toLocaleString(n, { weekday: "short" })), r.namesShort.push(c.substring(0, 2));
                  }
                  for (let o = 0; o < 12; o++) {
                    const l = new Date(2017, o, 1).toLocaleString(n, { month: "long" });
                    s.names.push(l), s.namesAbbr.push(l.substring(0, 3));
                  }
                  return s.names.push(""), s.namesAbbr.push(""), this[n] = { days: r, months: s }, this[n];
                }
                internalMS() {
                  return this.dateData;
                }
                getDatePart(n) {
                  const r = this, s = r.internalMS();
                  let o = parseInt(s / r.millisPerDay);
                  const l = parseInt(o / r.daysPer400Years);
                  o -= l * r.daysPer400Years;
                  let c = parseInt(o / r.daysPer100Years);
                  c === 4 && (c = 3), o -= c * r.daysPer100Years;
                  const m = parseInt(o / r.daysPer4Years);
                  o -= m * r.daysPer4Years;
                  let u = parseInt(o / r.daysPerYear);
                  if (u === 4 && (u = 3), n === r.datePartYear) return parseInt(400 * l + 100 * c + 4 * m + u + 1);
                  if (o -= u * r.daysPerYear, n === r.datePartDayOfYear) return parseInt(o + 1);
                  const p = u === 3 && (m !== 24 || c === 3) ? r.daysToMonth366 : r.daysToMonth365;
                  let h = o >> 6;
                  for (; o >= p[h]; ) h++;
                  return n === r.datePartMonth ? parseInt(h) : parseInt(o - p[h - 1] + 1);
                }
                dayOfWeek() {
                  const n = this.dateData;
                  return parseInt(n / this.millisPerDay + 1) % 7;
                }
                dayOfYear() {
                  return this.getDatePart(this.datePartDayOfYear);
                }
                weekOfYear(n) {
                  const r = this.toDate(), s = n || this.calendar.firstDay, o = new Date(r.getFullYear(), 0, 1), l = Math.floor((r.getTime() - o.getTime() - 6e4 * (r.getTimezoneOffset() - o.getTimezoneOffset())) / 864e5) + 1;
                  let c, m = o.getDay() - s;
                  if (m = m >= 0 ? m : m + 7, m < 4) {
                    if (c = Math.floor((l + m - 1) / 7) + 1, c > 52) {
                      let u = new Date(r.getFullYear() + 1, 0, 1).getDay() - s;
                      u = u >= 0 ? u : u + 7, c = u < 4 ? 1 : 53;
                    }
                  } else c = Math.floor((l + m - 1) / 7);
                  return c;
                }
                subtract(n) {
                  const r = this;
                  return new Smart.Utilities.TimeSpan(r.dateData * r.ticksPerMillisecond - n.dateData * r.ticksPerMillisecond);
                }
                dateToMS(n, r, s) {
                  const o = this;
                  if (n >= 1 && n <= 9999 && r >= 1 && r <= 12) {
                    n = parseInt(n);
                    const l = o.isLeapYear(n) ? o.daysToMonth366 : o.daysToMonth365;
                    if (s >= 1 && s <= l[r] - l[r - 1]) {
                      const c = n - 1;
                      return (365 * c + parseInt(c / 4) - parseInt(c / 100) + parseInt(c / 400) + l[r - 1] + s - 1) * o.millisPerDay;
                    }
                  }
                }
                isLeapYear(n) {
                  if (n < 1 || n > 9999) throw new Error("Year out of Range");
                  return n % 4 == 0 && (n % 100 != 0 || n % 400 == 0);
                }
                timeToMS(n, r, s, o) {
                  const l = this;
                  if (n >= 0 && n < 24 && r >= 0 && r < 60 && s >= 0 && s < 60) {
                    const c = parseInt(3600 * n + 60 * r + s);
                    return o > 0 && o < 1e3 ? c * l.millisPerSecond + o : c * l.millisPerSecond;
                  }
                }
                daysInMonth(n, r) {
                  if (r < 1 || r > 12) throw new Error("Month out of Range");
                  const s = this, o = s.isLeapYear(n) ? s.daysToMonth366 : s.daysToMonth365;
                  return o[r] - o[r - 1];
                }
                arrayIndexOf(n, r) {
                  return n.indexOf(r);
                }
                startsWith(n, r) {
                  return n.indexOf(r) === 0;
                }
                endsWith(n, r) {
                  return n.substr(n.length - r.length) === r;
                }
                trim(n) {
                  return (n + "").replace(this.regexTrim, "");
                }
                expandFormat(n, r) {
                  r = r || "F";
                  let s, o = n.patterns, l = r.length;
                  if (o[r]) return o[r];
                  if (l === 1) {
                    if (s = o[r], !s) throw "Invalid date format string '" + r + "'.";
                    r = s;
                  } else l === 2 && r.charAt(0) === "%" && (r = r.charAt(1));
                  return r;
                }
                getEra(n, r) {
                  if (!r || typeof n == "string") return 0;
                  let s, o = n.getTime();
                  for (let l = 0, c = r.length; l < c; l++) if (s = r[l].start, s === null || o >= s) return l;
                  return 0;
                }
                toUpper(n) {
                  return n.split(" ").join(" ").toUpperCase();
                }
                toUpperArray(n) {
                  const r = [];
                  for (let s = 0, o = n.length; s < o; s++) r[s] = this.toUpper(n[s]);
                  return r;
                }
                getEraYear(n, r, s, o) {
                  let l = n.getFullYear();
                  return !o && r.eras && (l -= typeof s == "number" ? s : r.eras[s].offset), l;
                }
                getDayIndex(n, r, s) {
                  const o = this, l = n.days;
                  let c, m = n._upperDays;
                  return m || (n._upperDays = m = [o.toUpperArray(l.names), o.toUpperArray(l.namesAbbr), o.toUpperArray(l.namesShort)]), r = r.toUpperCase(), s ? (c = o.arrayIndexOf(m[1], r), c === -1 && (c = o.arrayIndexOf(m[2], r))) : c = o.arrayIndexOf(m[0], r), c;
                }
                getMonthIndex(n, r, s) {
                  const o = this;
                  let l = n.months, c = n.monthsGenitive || n.months, m = n._upperMonths, u = n._upperMonthsGen;
                  m || (n._upperMonths = m = [o.toUpperArray(l.names), o.toUpperArray(l.namesAbbr)], n._upperMonthsGen = u = [o.toUpperArray(c.names), o.toUpperArray(c.namesAbbr)]), r = o.toUpper(r);
                  let p = o.arrayIndexOf(s ? m[1] : m[0], r);
                  return p < 0 && (p = o.arrayIndexOf(s ? u[1] : u[0], r)), p;
                }
                appendPreOrPostMatch(n, r) {
                  let s = 0, o = !1;
                  for (let l = 0, c = n.length; l < c; l++) {
                    const m = n.charAt(l);
                    switch (m) {
                      case "'":
                        o ? r.push("'") : s++, o = !1;
                        break;
                      case "\\":
                        o && r.push("\\"), o = !o;
                        break;
                      default:
                        r.push(m), o = !1;
                    }
                  }
                  return s;
                }
                getTokenRegExp() {
                  return /\/|dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyyy|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|uu|u|nn|n|pp|p|ee|e|aa|a|xx|x|oo|o|i{1,24}|zzz|zz|z|gg|g/g;
                }
                static ParseDate(n, r) {
                  return new Smart.Utilities.DateTime().tryparseDate(n, null, r);
                }
                tryparseDate(n, r, s) {
                  const o = this;
                  if (r == null && (r = o.calendar), s !== void 0) {
                    if (Array.isArray(s)) for (let p = 0; p < s.length; p++) {
                      const h = o.parseDate(n, s[p], r);
                      if (h) return h;
                    }
                    const u = o.parseDate(n, s, r);
                    if (u) return u;
                  }
                  if (n === "") return null;
                  if (n == null || n.substring || (n = n.toString()), n != null && n.substring(0, 6) === "/Date(") {
                    const u = /^\/Date\((-?\d+)(\+|-)?(\d+)?\)\/$/;
                    let p = /* @__PURE__ */ new Date(+n.replace(/\/Date\((\d+)\)\//, "$1"));
                    if (p === "Invalid Date") {
                      const h = n.match(/^\/Date\((\d+)([-+]\d\d)(\d\d)\)\/$/);
                      p = null, h && (p = new Date(1 * h[1] + 36e5 * h[2] + 6e4 * h[3]));
                    }
                    if (p == null || p === "Invalid Date" || isNaN(p)) {
                      const h = u.exec(n);
                      if (h) {
                        const g = new Date(parseInt(h[1]));
                        if (h[2]) {
                          let f = parseInt(h[3]);
                          h[2] === "-" && (f = -f);
                          const b = g.getUTCMinutes();
                          g.setUTCMinutes(b - f);
                        }
                        if (!isNaN(g.valueOf())) return g;
                      }
                    }
                    return p;
                  }
                  const l = { smartdate: "yyyy-MM-dd HH:mm:ss", d: "M/d/yyyy", D: "dddd, MMMM dd, yyyy", t: "h:mm tt", T: "h:mm:ss tt", f: "dddd, MMMM dd, yyyy h:mm tt", F: "dddd, MMMM dd, yyyy h:mm:ss tt", M: "MMMM dd", Y: "yyyy MMMM", S: "yyyy'-'MM'-'dd'T'HH':'mm':'ss", ISO: "yyyy-MM-dd hh:mm:ss", ISO2: "yyyy-MM-dd HH:mm:ss", ISO8601: "yyyy-MM-ddTHH:mm:ss.sssZ", d1: "dd.MM.yyyy", d2: "dd-MM-yyyy", d3: "MM-dd-yyyy", d4: "MM.dd.yyyy", zone1: "yyyy-MM-ddTHH:mm:ss-HH:mm", zone2: "yyyy-MM-ddTHH:mm:ss+HH:mm", custom: "yyyy-MM-ddTHH:mm:ss.fff", custom2: "yyyy-MM-dd HH:mm:ss.fff", custom3: "yyyy-MM-ddTHH:mm:ss.fff+HH:mm", custom4: "yyyy-MM-ddTHH:mm:ss.fff-HH:mm", custom5: "yyyy-MM-ddTHH:mm:ss.ffffff+HH:mm", custom6: "yyyy-MM-ddTHH:mm:ss.ffffff-HH:mm", custom7: "yyyy-MM-ddTHH:mm:ss.fffffff+HH:mm", custom8: "yyyy-MM-ddTHH:mm:ss.fffffff-HH:mm", iso: "yyyy-MM-ddTHH:mm:ssZ", iso2: "yyyy-MM-ddTHH:mm.fffZ", iso_date1: "yyyy-MM-dd", iso_date2: "yyyy-MM-dd", iso_date3: "yyyy-ddd", iso_date4: "yyyy-MM-dd HH:mm", iso_date5: "yyyy-MM-dd HH:mm Z", iso_date6: "yyyy-MMM-dd", iso_date7: "yyyy-MM", iso_date8: "yyyy-MMM", iso_date9: "yyyy-MMMM", iso_date10: "yyyy-MMMM-dd", iso_time1: "HH:mm:ss.tttt", iso_time2: "HH:mm:ss", iso_time3: "HH:mm", iso_time4: "HH", iso_time5: "yyyyyy-MM-dd", iso_time6: "yyyyyy-MM-dd", iso_time7: "dd/MM/yyyy HH:mm", iso_time8: "dd.MM.yyyy HH:mm", iso_time9: "dd-MM-yyyy HH:mm", iso_time10: "MM.dd.yyyy HH:mm", iso_time11: "MM-dd-yyyy HH:mm", iso_time12: "dd/MM/yyyy", iso_time13: "MM.dd.yyyy h:mm tt", iso_time14: "MM-dd-yyyy h:mm tt", iso_time15: "MM/dd/yyyy h:mm tt" };
                  for (let u in l) {
                    const p = o.parseDate(n, l[u], r);
                    if (p) return p;
                  }
                  const c = r.patterns;
                  for (let u in c) {
                    const p = o.parseDate(n, c[u], r);
                    if (p) {
                      if (u === "ISO") {
                        const h = o.parseDate(n, c.ISO2, r);
                        if (h) return h;
                      }
                      return p;
                    }
                  }
                  let m;
                  if (typeof n == "string") {
                    const u = [":", "/", "-", " ", ","];
                    let p = "", h = n = (function(b, y, _) {
                      return _.replace(new RegExp(b, "g"), y);
                    })(", ", ",", n = o.trim(n));
                    n.indexOf(":") >= 0 ? (p = n.substring(n.indexOf(":") - 2), p = o.trim(p), h = n.substring(0, n.indexOf(":") - 2)) : n.toUpperCase().indexOf("AM") >= 0 ? (p = n.substring(n.toUpperCase().indexOf("AM") - 2), p = o.trim(p), h = n.substring(0, n.toUpperCase().indexOf("AM") - 2)) : n.toUpperCase().indexOf("PM") >= 0 && (p = n.substring(n.toUpperCase().indexOf("PM") - 2), p = o.trim(p), h = n.substring(0, n.toUpperCase().indexOf("PM") - 2));
                    let g = /* @__PURE__ */ new Date(), f = !1;
                    if (h) {
                      for (let v = 0; v < u.length; v++) if (h.indexOf(u[v]) >= 0) {
                        m = h.split(u[v]);
                        break;
                      }
                      if (!m) return null;
                      let b = new Array(), y = new Array(), _ = new Array(), x = null, w = null;
                      for (let v = 0; v < m.length; v++) {
                        const T = m[v], k = o.parseDate(T, "d", r) || o.parseDate(T, "dd", r) || o.parseDate(T, "ddd", r) || o.parseDate(T, "dddd", r);
                        if (k && (b.push(k.getDate()), T.length > 2)) {
                          x = v;
                          break;
                        }
                      }
                      for (let v = 0; v < m.length; v++) {
                        const T = m[v], k = o.parseDate(T, "M", r) || o.parseDate(T, "MM", r) || o.parseDate(T, "MMM", r) || o.parseDate(T, "MMMM", r);
                        if (k) {
                          if (x != null && x === v) continue;
                          if (y.push(k.getMonth()), T.length > 2) {
                            w = v;
                            break;
                          }
                        }
                      }
                      for (let v = 0; v < m.length; v++) {
                        const T = m[v], k = o.parseDate(T, "yyyy", r);
                        if (k) {
                          if (x != null && x === v || w != null && w === v) continue;
                          _.push(k.getFullYear());
                        }
                      }
                      const S = new Array();
                      for (let v = b.length - 1; v >= 0; v--) for (let T = 0; T < y.length; T++) for (let k = 0; k < _.length; k++) {
                        const M = new Date(_[k], y[T], b[v]);
                        _[k] < 1970 && M.setFullYear(_[k]), isNaN(M.getTime()) || S.push(M);
                      }
                      S.length > 0 && (g = S[0], f = !0);
                    }
                    if (p) {
                      const b = p.indexOf(":") >= 0 ? p.split(":") : p, y = o.parseDate(p, "h:mm tt", r) || o.parseDate(p, "HH:mm:ss.fff", r) || o.parseDate(p, "HH:mm:ss.ff", r) || o.parseDate(p, "h:mm:ss tt", r) || o.parseDate(p, "HH:mm:ss.tttt", r) || o.parseDate(p, "HH:mm:ss", r) || o.parseDate(p, "HH:mm", r) || o.parseDate(p, "HH", r);
                      let _ = 0, x = 0, w = 0, S = 0;
                      y && !isNaN(y.getTime()) ? (_ = y.getHours(), x = y.getMinutes(), w = y.getSeconds(), S = y.getMilliseconds()) : (b.length === 1 && (_ = parseInt(b[0])), b.length === 2 && (_ = parseInt(b[0]), x = parseInt(b[1])), b.length === 3 && (_ = parseInt(b[0]), x = parseInt(b[1]), b[2].indexOf(".") >= 0 ? (w = parseInt(b[2].toString().split(".")[0]), S = parseInt(b[2].toString().split(".")[1])) : w = parseInt(b[2])), b.length === 4 && (_ = parseInt(b[0]), x = parseInt(b[1]), w = parseInt(b[2]), S = parseInt(b[3]))), !g || isNaN(_) || isNaN(x) || isNaN(w) || isNaN(S) || (g.setHours(_, x, w, S), f = !0);
                    }
                    if (f) return g;
                  }
                  if (n != null) {
                    m = [":", "/", "-"];
                    let u = !0;
                    for (let p = 0; p < m.length; p++) n.indexOf(m[p]) !== -1 && (u = !1);
                    if (u) {
                      const p = new Number(n);
                      if (!isNaN(p)) return new Date(p);
                    }
                  }
                  return null;
                }
                getParseRegExp(n, r) {
                  const s = this;
                  let o = n._parseRegExp;
                  if (o) {
                    const b = o[r];
                    if (b) return b;
                  } else n._parseRegExp = o = {};
                  let l, c = s.expandFormat(n, r).replace(/([\^\$\.\*\+\?\|\[\]\(\)\{\}])/g, "\\\\$1"), m = ["^"], u = [], p = 0, h = 0, g = s.getTokenRegExp();
                  for (; (l = g.exec(c)) !== null; ) {
                    const b = c.slice(p, l.index);
                    if (p = g.lastIndex, h += s.appendPreOrPostMatch(b, m), h % 2) {
                      m.push(l[0]);
                      continue;
                    }
                    let y, _ = l[0], x = _.length;
                    switch (_) {
                      case "dddd":
                      case "ddd":
                      case "MMMM":
                      case "MMM":
                      case "gg":
                      case "g":
                        y = "(\\D+)";
                        break;
                      case "tt":
                      case "t":
                        y = "(\\D*)";
                        break;
                      case "yyyyy":
                        y = "(\\d{1,4})";
                        break;
                      case "yyyy":
                        y = "(\\d{" + x + "})";
                        break;
                      case "fff":
                      case "ff":
                      case "f":
                        y = "(\\d{1," + x + "})";
                        break;
                      case "dd":
                      case "d":
                      case "MM":
                      case "M":
                      case "yy":
                      case "y":
                      case "HH":
                      case "H":
                      case "hh":
                      case "h":
                      case "mm":
                      case "m":
                      case "ss":
                      case "s":
                        y = "(\\d\\d?)";
                        break;
                      case "uu":
                      case "nn":
                      case "pp":
                      case "ee":
                      case "aa":
                      case "xx":
                      case "oo":
                        y = "(\\d{1,3})";
                        break;
                      case "zzz":
                        y = "([+-]?\\d\\d?:\\d{2})";
                        break;
                      case "zz":
                      case "z":
                        y = "([+-]?\\d\\d?)";
                        break;
                      case "/":
                        y = "/";
                        break;
                      default:
                        if (!/i{1,24}/.test(_)) throw "Invalid date format pattern '" + _ + "'.";
                        y = "(\\d{" + _.length + "})";
                    }
                    y && m.push(y), _ !== "/" && u.push(l[0]);
                  }
                  s.appendPreOrPostMatch(c.slice(p), m), m.push("$");
                  const f = { regExp: m.join("").replace(/\s+/g, "\\s+"), groups: u };
                  return o[r] = f;
                }
                outOfRange(n, r, s) {
                  return n < r || n > s;
                }
                expandYear(n, r) {
                  const s = this, o = /* @__PURE__ */ new Date(), l = s.getEra(o);
                  if (r < 100) {
                    let c = n.twoDigitYearMax;
                    c = typeof c == "string" ? (/* @__PURE__ */ new Date()).getFullYear() % 100 + parseInt(c, 10) : c;
                    const m = s.getEraYear(o, n, l);
                    (r += m - m % 100) > c && (r -= 100);
                  }
                  return r;
                }
                padZeros(n, r) {
                  let s, o = n + "";
                  return r > 1 && o.length < r ? (s = ["0", "00", "000"][r - 2] + o, s.substr(s.length - r, r)) : (s = o, s);
                }
                parseDate(n, r, s) {
                  const o = this;
                  s == null && (s = o.calendar), n = o.trim(n);
                  const l = s, c = o.getParseRegExp(l, r), m = new RegExp(c.regExp).exec(n);
                  if (m === null) return null;
                  let u, p = c.groups, h = null, g = null, f = null, b = null, y = null, _ = 0, x = 0, w = 0, S = 0, v = null, T = !1;
                  for (let D = 0, C = p.length; D < C; D++) {
                    const N = m[D + 1];
                    if (N) {
                      const A = p[D], B = A.length, I = parseInt(N, 10);
                      switch (A) {
                        case "dd":
                        case "d":
                          if (b = I, o.outOfRange(b, 1, 31)) return null;
                          break;
                        case "MMM":
                        case "MMMM":
                        case "MMMMM":
                        case "MMMMMM":
                        case "MMMMMMM":
                        case "MMMMMMMM":
                          if (f = o.getMonthIndex(l, N, B === 3), o.outOfRange(f, 0, 11)) return null;
                          break;
                        case "M":
                        case "MM":
                          if (f = I - 1, o.outOfRange(f, 0, 11)) return null;
                          break;
                        case "y":
                        case "yy":
                        case "yyyy":
                          if (g = B < 4 ? o.expandYear(l, I) : I, o.outOfRange(g, 0, 9999)) return null;
                          break;
                        case "h":
                        case "hh":
                          if (_ = I, _ === 12 && (_ = 0), o.outOfRange(_, 0, 11)) return null;
                          break;
                        case "H":
                        case "HH":
                          if (_ = I, o.outOfRange(_, 0, 23)) return null;
                          break;
                        case "m":
                        case "mm":
                          if (x = I, o.outOfRange(x, 0, 59)) return null;
                          break;
                        case "s":
                        case "ss":
                          if (w = I, o.outOfRange(w, 0, 59)) return null;
                          break;
                        case "tt":
                        case "t":
                          if (T = l.PM && (N === l.PM[0] || N === l.PM[1] || N === l.PM[2]), !T && (!l.AM || N !== l.AM[0] && N !== l.AM[1] && N !== l.AM[2])) return null;
                          break;
                        case "f":
                        case "ff":
                        case "fff":
                          if (S = I * Math.pow(10, 3 - B), o.outOfRange(S, 0, 999)) return null;
                          break;
                        case "uu":
                        case "nn":
                        case "pp":
                        case "ee":
                        case "aa":
                        case "xx":
                        case "oo":
                          if (o.outOfRange(I, 0, 1e3)) return null;
                          o[o._codeToUnit[A]] = I;
                          break;
                        case "ddd":
                        case "dddd":
                          if (y = o.getDayIndex(l, N, B === 3), o.outOfRange(y, 0, 6)) return null;
                          break;
                        case "zzz": {
                          const E = N.split(/:/);
                          if (E.length !== 2 || (u = parseInt(E[0], 10), o.outOfRange(u, -12, 13))) return null;
                          const L = parseInt(E[1], 10);
                          if (o.outOfRange(L, 0, 59)) return null;
                          v = 60 * u + (o.startsWith(N, "-") ? -L : L);
                          break;
                        }
                        case "z":
                        case "zz":
                          if (u = I, o.outOfRange(u, -12, 13)) return null;
                          v = 60 * u;
                          break;
                        case "g":
                        case "gg": {
                          let E = N;
                          if (!E || !l.eras) return null;
                          E = this.trim(E.toLowerCase());
                          for (let L = 0, H = l.eras.length; L < H; L++) if (E === l.eras[L].nathat.toLowerCase()) {
                            h = L;
                            break;
                          }
                          if (h === null) return null;
                          break;
                        }
                        default: {
                          let E = N;
                          E.length % 3 == 1 ? E += "00" : E.length % 3 == 2 && (E += "0"), S = parseInt(E.slice(0, 3), 10), E = E.slice(3);
                          let L = 0;
                          for (; E.length > 0; ) o[o._smallUnits[L]] = parseInt(E.slice(0, 3), 10), E = E.slice(3), L++;
                        }
                      }
                    }
                  }
                  let k, M = /* @__PURE__ */ new Date(), P = l.convert;
                  if (k = M.getFullYear(), g === null ? g = k : l.eras && (g += l.eras[h || 0].offset), f === null && (f = 0), b === null && (b = 1), P) {
                    if (M = P.toGregorian(g, f, b), M === null) return null;
                  } else if (M.setFullYear(g, f, b), M.getDate() !== b || y !== null && M.getDay() !== y) return null;
                  if (T && _ < 12 && (_ += 12), M.setHours(_, x, w, S), v !== null) {
                    const D = M.getMinutes() - (v + M.getTimezoneOffset());
                    M.setHours(M.getHours() + parseInt(D / 60, 10), D % 60);
                  }
                  return M;
                }
                toString(n, r) {
                  const s = this;
                  n === void 0 && (n = "yyyy-MM-dd HH:mm:ss");
                  const o = s.dateData.toString() + s.getFractionsOfSecondStamp() + n + (s.timeZone || "");
                  if (Smart.Utilities.DateTime.cache && Smart.Utilities.DateTime.cache[o] && s.showTodayDateAsString !== !1) return Smart.Utilities.DateTime.cache[o];
                  const l = s.toDate();
                  if (r == null && (r = s.calendar), typeof l == "string") return l;
                  if (!n || !n.length || n === "i") {
                    let y;
                    return y = s.formatDate(l, r.patterns.F, r), y;
                  }
                  const c = r.eras, m = n === "s";
                  n = s.expandFormat(r, n);
                  const u = [];
                  let p, h = 0, g = s.getTokenRegExp();
                  function f(y, _) {
                    if (y.getMonth !== void 0) switch (_) {
                      case 0:
                        return y.getFullYear();
                      case 1:
                        return y.getMonth();
                      case 2:
                        return y.getDate();
                    }
                  }
                  for (; ; ) {
                    const y = g.lastIndex, _ = g.exec(n), x = n.slice(y, _ ? _.index : n.length);
                    if (h += s.appendPreOrPostMatch(x, u), !_) break;
                    if (h % 2) {
                      u.push(_[0]);
                      continue;
                    }
                    const w = _[0], S = w.length;
                    let v;
                    if (/i{1,24}/.test(w)) u.push(s.getFirstNDigitsOfPrecision(w.length));
                    else switch (w) {
                      case "ddd":
                      case "dddd": {
                        const T = S === 3 ? r.days.namesAbbr : r.days.names;
                        u.push(T[l.getDay()]);
                        break;
                      }
                      case "d":
                      case "dd":
                        u.push(s.padZeros(f(l, 2), S));
                        break;
                      case "MMM":
                      case "MMMM":
                        v = f(l, 1), u.push(r.months[S === 3 ? "namesAbbr" : "names"][v]);
                        break;
                      case "M":
                      case "MM":
                        u.push(s.padZeros(f(l, 1) + 1, S));
                        break;
                      case "y":
                      case "yy":
                      case "yyyy":
                        v = s.getEraYear(l, r, s.getEra(l, c), m), S < 4 && (v %= 100), u.push(s.padZeros(v, S));
                        break;
                      case "h":
                      case "hh":
                        p = l.getHours() % 12, p === 0 && (p = 12), u.push(s.padZeros(p, S));
                        break;
                      case "H":
                      case "HH":
                        u.push(s.padZeros(l.getHours(), S));
                        break;
                      case "m":
                      case "mm":
                        u.push(s.padZeros(l.getMinutes(), S));
                        break;
                      case "s":
                      case "ss":
                        u.push(s.padZeros(l.getSeconds(), S));
                        break;
                      case "t":
                      case "tt":
                        v = l.getHours() < 12 ? r.AM ? r.AM[0] : " " : r.PM ? r.PM[0] : " ", u.push(S === 1 ? v.charAt(0) : v);
                        break;
                      case "f":
                      case "ff":
                      case "fff":
                        u.push(s.padZeros(l.getMilliseconds(), 3).substr(0, S));
                        break;
                      case "u":
                      case "n":
                      case "p":
                      case "e":
                      case "a":
                      case "x":
                      case "o":
                        u.push(s[s._codeToUnit[w]]);
                        break;
                      case "uu":
                      case "nn":
                      case "pp":
                      case "ee":
                      case "aa":
                      case "xx":
                      case "oo":
                        u.push(s.padZeros(s[s._codeToUnit[w]], 3));
                        break;
                      case "z":
                      case "zz":
                        u.push((s.timeZoneOffsetHours >= 0 ? "+" : "-") + s.padZeros(Math.floor(Math.abs(s.timeZoneOffsetHours)), S));
                        break;
                      case "zzz":
                        u.push((s.timeZoneOffsetHours >= 0 ? "+" : "-") + s.padZeros(Math.floor(Math.abs(s.timeZoneOffsetHours)), 2) + ":" + s.padZeros(60 * Math.abs(s.timeZoneOffsetHours % 1), 2));
                        break;
                      case "g":
                      case "gg":
                        r.eras && u.push(r.eras[s.getEra(l, c)].name);
                        break;
                      case "/":
                        u.push(r["/"]);
                        break;
                      default:
                        throw "Invalid date format pattern '" + w + "'.";
                    }
                  }
                  let b = u.join("");
                  if (Smart.Utilities.DateTime.cache || (Smart.Utilities.DateTime.cache = new Array()), s._today || (s._today = /* @__PURE__ */ new Date()), s.calendar && s.calendar.today && n.indexOf(":") === -1 && l.getFullYear() === s._today.getFullYear() && l.getDate() === s._today.getDate() && l.getMonth() === s._today.getMonth()) {
                    if (s.showTodayDateAsString === !1) return Smart.Utilities.DateTime.cache[o] = b, b;
                    b = s.calendar.today;
                  }
                  return Smart.Utilities.DateTime.cache[o] = b, b;
                }
                getFractionsOfSecondStamp() {
                  const n = this;
                  return n._microsecond.toString() + n._nanosecond + n._picosecond + n._femtosecond + n._attosecond + n._zeptosecond + n._yoctosecond;
                }
                getFirstNDigitsOfPrecision(n, r) {
                  const s = this;
                  return ("" + (r !== !0 ? s.padZeros(s.millisecond(), 3) : "") + s.padZeros(s._microsecond, 3) + s.padZeros(s._nanosecond, 3) + s.padZeros(s._picosecond, 3) + s.padZeros(s._femtosecond, 3) + s.padZeros(s._attosecond, 3) + s.padZeros(s._zeptosecond, 3) + s.padZeros(s._yoctosecond, 3)).slice(0, n);
                }
                copySmallTimePartValues(n) {
                  const r = this;
                  n._microsecond = r._microsecond, n._nanosecond = r._nanosecond, n._picosecond = r._picosecond, n._femtosecond = r._femtosecond, n._attosecond = r._attosecond, n._zeptosecond = r._zeptosecond, n._yoctosecond = r._yoctosecond;
                }
                add(n, r, s) {
                  const o = this, l = o.internalMS();
                  if (r === void 0) {
                    if (s === !1) return o.dateData = l + parseInt(n._ticks / o.ticksPerMillisecond), o;
                    const u = new Smart.Utilities.DateTime(l + parseInt(n._ticks / o.ticksPerMillisecond));
                    return o.copyTimeZone(u), o.copySmallTimePartValues(u), u;
                  }
                  const c = n * r;
                  if (c <= -o.maxMillis || c >= o.maxMillis) throw new Error("Out of Range");
                  if (s === !1) return o.dateData = l + c, o;
                  const m = new Smart.Utilities.DateTime(l + c);
                  return o.copyTimeZone(m), o.copySmallTimePartValues(m), m;
                }
                addDays(n, r) {
                  return this.add(n, this.millisPerDay, r);
                }
                clone() {
                  const n = this, r = new Smart.Utilities.DateTime(n.dateData);
                  return n.copyTimeZone(r), n.copySmallTimePartValues(r), r;
                }
                clearTime() {
                  const n = this, r = n.month(), s = n.year(), o = n.day(), l = new Smart.Utilities.DateTime(s, r, o, 0, 0, 0, 0);
                  return n.copyTimeZone(l), l;
                }
                addHours(n, r) {
                  return this.add(n, this.millisPerHour, r);
                }
                addDeciseconds(n, r) {
                  return this.add(100 * n, 1, r);
                }
                addCentiseconds(n, r) {
                  return this.add(10 * n, 1, r);
                }
                addMilliseconds(n, r) {
                  return this.add(n, 1, r);
                }
                addMinutes(n, r) {
                  return this.add(n, this.millisPerMinute, r);
                }
                addMonths(n, r) {
                  const s = this;
                  if (n < -12e4 || n > 12e4) throw new Error("Invalid Months Value");
                  let o = parseInt(s.getDatePart(s.datePartYear)), l = parseInt(s.getDatePart(s.datePartMonth)), c = parseInt(s.getDatePart(s.datePartDay));
                  if (n % 12 == 0) o += n / 12;
                  else {
                    const p = l - 1 + n;
                    p >= 0 ? (l = p % 12 + 1, o += p / 12) : (l = 12 + (p + 1) % 12, o += (p - 11) / 12), o = parseInt(o);
                  }
                  if (o < 1 || o > 9999) throw new Error("Year out of range");
                  const m = s.daysInMonth(o, l);
                  if (c > m && (c = m), r === !1) return s.dateData = s.dateToMS(o, l, c) + s.internalMS() % s.millisPerDay, s;
                  const u = new Smart.Utilities.DateTime(s.dateToMS(o, l, c) + s.internalMS() % s.millisPerDay);
                  return s.copyTimeZone(u), s.copySmallTimePartValues(u), u;
                }
                addSeconds(n, r) {
                  return this.add(n, this.millisPerSecond, r);
                }
                addYears(n, r) {
                  return this.addMonths(12 * n, r);
                }
                addMicroseconds(n, r) {
                  if (n === 0) return;
                  const s = this;
                  let o, l;
                  n < 0 && s.hour() === 0 && s.minute() === 0 && s.second() === 0 && s.millisecond() === 0 && s._microsecond === 0 && (o = parseInt(n / 1e3, 10) - 1, l = 1e3 + n % 1e3);
                  const c = 1e3 * s.timeToMS(s.hour(), s.minute(), s.second(), s.millisecond()) + s._microsecond, m = c + n;
                  let u;
                  if (o === void 0 && (o = parseInt(m / 1e3, 10) - parseInt(c / 1e3, 10)), l === void 0 && (l = parseInt(m % 1e3, 10)), o !== 0 && (u = s.addMilliseconds(o, r)), r !== !1) return u || (u = s.clone()), u._microsecond = l, u;
                  s._microsecond = l;
                }
                addFractionsOfSecond(n, r, s, o, l) {
                  if (n === 0) return;
                  const c = this, m = 1e3 * c[o] + c[s], u = n + m;
                  let p, h = parseInt(u / 1e3, 10) - parseInt(m / 1e3, 10), g = parseInt(u % 1e3, 10);
                  if (n < 0 && u < 0 && g < 0 && (h--, g = 1e3 + g), h !== 0 && (p = c[l](h, r)), r !== !1) return p || (p = c.clone()), p[s] = g, p;
                  c[s] = g;
                }
                addNanoseconds(n, r) {
                  return this.addFractionsOfSecond(n, r, "_nanosecond", "_microsecond", "addMicroseconds");
                }
                addPicoseconds(n, r) {
                  return this.addFractionsOfSecond(n, r, "_picosecond", "_nanosecond", "addNanoseconds");
                }
                addFemtoseconds(n, r) {
                  return this.addFractionsOfSecond(n, r, "_femtosecond", "_picosecond", "addPicoseconds");
                }
                addAttoseconds(n, r) {
                  return this.addFractionsOfSecond(n, r, "_attosecond", "_femtosecond", "addFemtoseconds");
                }
                addZeptoseconds(n, r) {
                  return this.addFractionsOfSecond(n, r, "_zeptosecond", "_attosecond", "addAttoseconds");
                }
                addYoctoseconds(n, r) {
                  return this.addFractionsOfSecond(n, r, "_yoctosecond", "_zeptosecond", "addZeptoseconds");
                }
                getTimeZoneOffset() {
                  const n = /* @__PURE__ */ new Date(), r = new Date(n.getFullYear(), 0, 1), s = new Date(n.getFullYear(), 6, 1), o = n.getTimezoneOffset() < Math.max(r.getTimezoneOffset(), s.getTimezoneOffset());
                  return { offset: -n.getTimezoneOffset() / 60, dst: +o };
                }
                isInDaylightSavingTime() {
                  const n = /* @__PURE__ */ new Date(), r = new Date(n.getFullYear(), 0, 1), s = new Date(n.getFullYear(), 6, 1);
                  return this.date().getTimezoneOffset() < Math.max(r.getTimezoneOffset(), s.getTimezoneOffset());
                }
                supportsDaylightSavingTime() {
                  const n = /* @__PURE__ */ new Date(), r = new Date(n.getFullYear(), 0, 1), s = new Date(n.getFullYear(), 6, 1);
                  return r.getTimezoneOffset() !== s.getTimezoneOffset();
                }
                date() {
                  const n = this, r = n.month(), s = n.year(), o = n.day(), l = new Smart.Utilities.DateTime(s, r, o);
                  return n.copyTimeZone(l), l;
                }
                isWeekend() {
                  return this.dayOfWeek() === 0 || this.dayOfWeek() === 6;
                }
                toDate(n) {
                  const r = this, s = r.month(), o = r.year(), l = r.day(), c = r.hour(), m = r.minute(), u = r.second(), p = r.millisecond();
                  let h = new Date(o, s - 1, l);
                  if (o < 1970 && h.setFullYear(o), h.setHours(c, m, u, p), n) {
                    const g = r.timeZones.filter((function(f) {
                      return f.id === n;
                    }));
                    if (g.length) {
                      let f = g[0].offset;
                      const b = h.getTime();
                      let y = 60 * h.getTimezoneOffset() * 1e3;
                      if (r.timeZone) {
                        const _ = r.timeZones.filter((function(x) {
                          return x.id === r.timeZone;
                        }));
                        _.length && (y = 60 * -_[0].offset * 1e3);
                      }
                      h = new Date(b + y + 6e4 * f);
                    }
                  }
                  return h;
                }
                toTimeZone(n) {
                  const r = this;
                  let s = n;
                  if (s == null && (s = "Local"), r.timeZone === s) return r.clone();
                  const o = r.timeZones.filter((function(m) {
                    return m.id === s;
                  }));
                  if (o.length === 0) return r.clone();
                  const l = this.toDate(s), c = new Smart.Utilities.DateTime(l);
                  return c.timeZone = s, c.timeZoneOffset = o[0].offset, c.timeZoneOffsetHours = o[0].offsetHours, r.copySmallTimePartValues(c), c;
                }
                day() {
                  return this.getDatePart(this.datePartDay);
                }
                month() {
                  return this.getDatePart(this.datePartMonth);
                }
                year() {
                  return this.getDatePart(this.datePartYear);
                }
                millisecond() {
                  return parseInt(this.internalMS() % 1e3);
                }
                hour() {
                  return parseInt(Math.floor(this.internalMS() / this.millisPerHour) % 24);
                }
                minute() {
                  return parseInt(this.internalMS() / this.millisPerMinute % 60);
                }
                second() {
                  return parseInt(this.internalMS() / this.millisPerSecond % 60);
                }
                microsecond() {
                  return this._microsecond;
                }
                nanosecond() {
                  return this._nanosecond;
                }
                picosecond() {
                  return this._picosecond;
                }
                femtosecond() {
                  return this._femtosecond;
                }
                attosecond() {
                  return this._attosecond;
                }
                zeptosecond() {
                  return this._zeptosecond;
                }
                yoctosecond() {
                  return this._yoctosecond;
                }
                valueOf() {
                  return this.dateData;
                }
                equals(n) {
                  const r = this;
                  return r.dateData === n.dateData && r._microsecond === n._microsecond && r._nanosecond === n._nanosecond && r._picosecond === n._picosecond && r._femtosecond === n._femtosecond && r._attosecond === n._attosecond && r._zeptosecond === n._zeptosecond && r._yoctosecond === n._yoctosecond;
                }
                equalDateParts(n) {
                  const r = this;
                  return r.year() === n.year() && r.month() === n.month() && r.day() === n.day();
                }
                compare(n) {
                  const r = this;
                  if (r.equals(n)) return 0;
                  const s = ["dateData", "_microsecond", "_nanosecond", "_picosecond", "_femtosecond", "_attosecond", "_zeptosecond", "_yoctosecond"];
                  for (let o = 0; o < s.length; o++) {
                    const l = s[o];
                    if (r[l] > n[l]) return 1;
                    if (r[l] < n[l]) return -1;
                  }
                  return 0;
                }
                toDateString() {
                  return this.toDate().toDateString();
                }
                toLocaleDateString() {
                  return this.toDate().toLocaleDateString(this.calendar.locale);
                }
                toLocaleString() {
                  return this.toDate().toLocaleString(this.calendar.locale);
                }
                toLocaleTimeString() {
                  return this.toDate().toLocaleTimeString(this.calendar.locale);
                }
                validateTimeZone(n) {
                  const r = this;
                  if (typeof n != "string") return;
                  const s = r.timeZones.filter((function(o) {
                    return o.id === n;
                  }));
                  s.length !== 0 && (r.timeZone = n, r.timeZoneOffset = s[0].offset, r.timeZoneOffsetHours = s[0].offsetHours);
                }
                copyTimeZone(n) {
                  const r = this;
                  n.timeZone = r.timeZone, n.timeZoneOffset = r.timeZoneOffset, n.timeZoneOffsetHours = r.timeZoneOffsetHours;
                }
                getTimeStamp() {
                  return new Smart.Utilities.BigNumber(this.dateData.toString() + this.getFirstNDigitsOfPrecision(void 0, !0));
                }
              });
            })();
          })
        ),
        /***/
        9613: (
          /***/
          (() => {
            Smart.Utilities.Assign("Draw", class {
              constructor(t, e) {
                const i = this;
                i.host = t, i.renderEngine = e || "", i.refresh();
                const a = ["clear", "removeElement", "attr", "getAttr", "line", "circle", "rect", "path", "pieslice", "pieSlicePath", "text", "measureText"];
                for (let n in a) i._addFn(Smart.Utilities.Draw.prototype, a[n]);
              }
              _addFn(t, e) {
                t[e] || (t[e] = function() {
                  return this.renderer[e].apply(this.renderer, arguments);
                });
              }
              _initRenderer(t) {
                return this.createRenderer(this, t);
              }
              _internalRefresh() {
                const t = this;
                if (t.renderer || (t.host.innerHTML = "", t._initRenderer(t.host)), window.getComputedStyle(t.host).display === "none") return;
                const e = t.renderer;
                if (!e) return;
                const i = e.getRect();
                t._render({ x: 1, y: 1, width: i.width, height: i.height });
              }
              _render(t) {
                this._plotRect = t;
              }
              refresh() {
                this._internalRefresh();
              }
              getSize() {
                const t = this._plotRect;
                return { width: t.width, height: t.height };
              }
              toGreyScale(t) {
                if (t.indexOf("#") === -1) return t;
                const e = this.cssToRgb(t);
                e[0] = e[1] = e[2] = Math.round(0.3 * e[0] + 0.59 * e[1] + 0.11 * e[2]);
                const i = this.rgbToHex(e[0], e[1], e[2]);
                return "#" + i[0] + i[1] + i[2];
              }
              decToHex(t) {
                return t.toString(16);
              }
              hexToDec(t) {
                return parseInt(t, 16);
              }
              rgbToHex(t, e, i) {
                return [this.decToHex(t), this.decToHex(e), this.decToHex(i)];
              }
              hexToRgb(t, e, i) {
                return [this.hexToDec(t), this.hexToDec(e), this.hexToDec(i)];
              }
              cssToRgb(t) {
                return t.indexOf("rgb") <= -1 ? this.hexToRgb(t.substring(1, 3), t.substring(3, 5), t.substring(5, 7)) : t.substring(4, t.length - 1).split(",");
              }
              hslToRgb(t) {
                let e, i, a;
                const n = parseFloat(t[0]), r = parseFloat(t[1]), s = parseFloat(t[2]);
                if (r === 0) e = i = a = s;
                else {
                  const o = s < 0.5 ? s * (1 + r) : s + r - s * r, l = 2 * s - o;
                  e = this.hueToRgb(l, o, n + 0.3333333333333333), i = this.hueToRgb(l, o, n), a = this.hueToRgb(l, o, n - 0.3333333333333333);
                }
                return [255 * e, 255 * i, 255 * a];
              }
              hueToRgb(t, e, i) {
                return i < 0 && (i += 1), i > 1 && (i -= 1), i < 0.16666666666666666 ? t + 6 * (e - t) * i : i < 0.5 ? e : i < 0.6666666666666666 ? t + (e - t) * (0.6666666666666666 - i) * 6 : t;
              }
              rgbToHsl(t) {
                const e = parseFloat(t[0]) / 255, i = parseFloat(t[1]) / 255, a = parseFloat(t[2]) / 255, n = Math.max(e, i, a), r = Math.min(e, i, a);
                let s, o, l = (n + r) / 2;
                if (n === r) s = o = 0;
                else {
                  const c = n - r;
                  switch (o = l > 0.5 ? c / (2 - n - r) : c / (n + r), n) {
                    case e:
                      s = (i - a) / c + (i < a ? 6 : 0);
                      break;
                    case i:
                      s = (a - e) / c + 2;
                      break;
                    case a:
                      s = (e - i) / c + 4;
                  }
                  s /= 6;
                }
                return [s, o, l];
              }
              swap(t, e) {
              }
              getNum(t) {
                if (t.constructor !== Array) {
                  if (isNaN(t)) return 0;
                } else for (let e = 0; e < t.length; e++) if (!isNaN(t[e])) return t[e];
                return 0;
              }
              _ptRotate(t, e, i, a, n) {
                const r = Math.sqrt(Math.pow(Math.abs(t - i), 2) + Math.pow(Math.abs(e - a), 2)), s = Math.asin((t - i) / r) + n;
                return { x: t = i + Math.cos(s) * r, y: e = a + Math.sin(s) * r };
              }
              log(t, e) {
                return Math.log(t) / (e ? Math.log(e) : 1);
              }
              _mod(t, e) {
                const i = Math.abs(t > e ? e : t);
                let a = 1;
                if (i !== 0) for (; i * a < 100; ) a *= 10;
                return (t *= a) % (e *= a) / a;
              }
              createRenderer(t, e) {
                const i = t;
                let a = i.renderer = null;
                return document.createElementNS && i.renderEngine !== "HTML5" && (a = new Smart.Utilities.SvgRenderer(this)), a !== null || i.renderEngine !== "HTML5" && i.renderEngine !== void 0 || (a = new Smart.Utilities.HTML5Renderer(this)), a.init(e), i.renderer = a, a;
              }
              getByPriority(t) {
                let e;
                for (let i = 0; i < t.length; i++) {
                  const a = t[i];
                  if (a != null && a !== "") {
                    e = a;
                    break;
                  }
                }
                return e;
              }
              get(t, e, i) {
                return i !== void 0 ? t[e][i] : t[e];
              }
              min(t, e) {
                let i = NaN;
                for (let a = 0; a < t.length; a++) {
                  const n = this.get(t, a, e);
                  (isNaN(i) || n < i) && (i = n);
                }
                return i;
              }
              max(t, e) {
                let i = NaN;
                for (let a = 0; a < t.length; a++) {
                  const n = this.get(t, a, e);
                  (isNaN(i) || n > i) && (i = n);
                }
                return i;
              }
              sum(t, e) {
                let i = 0;
                for (let a = 0; a < t.length; a++) {
                  const n = this.get(t, a, e);
                  isNaN(n) || (i += n);
                }
                return i;
              }
              count(t, e) {
                let i = 0;
                for (let a = 0; a < t.length; a++) {
                  const n = this.get(t, a, e);
                  isNaN(n) || i++;
                }
                return i;
              }
              avg(t, e) {
                return this.sum(t, e) / Math.max(1, this.count(t, e));
              }
              filter(t, e) {
                if (!e) return t;
                const i = [];
                for (let a = 0; a < t.length; a++) e(t[a]) && i.push(t[a]);
                return i;
              }
              scale(t, e, i, a) {
                if (isNaN(t)) return NaN;
                if ((t < Math.min(e.min, e.max) || t > Math.max(e.min, e.max)) && (!a || a.ignore_range !== !0)) return NaN;
                let n = NaN, r = 1;
                if (e.type === void 0 || e.type !== "logarithmic") {
                  let s = Math.abs(e.max - e.min);
                  s || (s = 1), r = Math.abs(t - Math.min(e.min, e.max)) / s;
                } else if (e.type === "logarithmic") {
                  let s = e.base;
                  isNaN(s) && (s = 10);
                  let o = Math.min(e.min, e.max);
                  o <= 0 && (o = 1);
                  let l = Math.max(e.min, e.max);
                  l <= 0 && (l = 1);
                  const c = this.log(l, s);
                  l = Math.pow(s, c);
                  const m = this.log(o, s);
                  o = Math.pow(s, m);
                  const u = this.log(t, s);
                  r = Math.abs(u - m) / (c - m);
                }
                if (i.type === "logarithmic") {
                  let s = i.base;
                  isNaN(s) && (s = 10);
                  const o = this.log(i.max, s), l = this.log(i.min, s);
                  i.flip && (r = 1 - r);
                  const c = Math.min(l, o) + r * Math.abs(o - l);
                  n = Math.pow(s, c);
                } else n = Math.min(i.min, i.max) + r * Math.abs(i.max - i.min), i.flip && (n = Math.max(i.min, i.max) - n + i.min);
                return n;
              }
              axis(t, e, i) {
                if (i <= 1) return [e, t];
                (isNaN(i) || i < 2) && (i = 2);
                let a = 0;
                for (; Math.round(t) !== t && Math.round(e) !== e && a < 10; ) t *= 10, e *= 10, a++;
                let n = (e - t) / i;
                for (; a < 10 && Math.round(n) !== n; ) t *= 10, e *= 10, n *= 10, a++;
                const r = [1, 2, 5];
                let s, o = 0;
                for (; ; ) {
                  let p = o % r.length, h = Math.floor(o / r.length), g = Math.pow(10, h) * r[p];
                  if (p = (o + 1) % r.length, h = Math.floor((o + 1) / r.length), s = Math.pow(10, h) * r[p], n >= g && n < s) break;
                  o++;
                }
                const l = s, c = [];
                let m = this.renderer._rnd(t, l, !1);
                const u = a <= 0 ? 1 : Math.pow(10, a);
                for (; m < e + l; ) c.push(m / u), m += l;
                return c;
              }
              _widgetToImage(t, e, i, a, n) {
                let r = t;
                if (!r) return !1;
                i !== void 0 && i !== "" || (i = "image." + e);
                let s = r.renderEngine, o = r.animation;
                if (r.animation = "none", r.renderEngine = "HTML5", r.renderEngine !== s) try {
                  r.refresh();
                } catch {
                  return r.renderEngine = s, r.refresh(), r.animation = o, !1;
                }
                let l = r.renderer.getContainer().firstElementChild, c = !0;
                typeof a == "function" && (c = a(t, l));
                let m = !0;
                return c && (m = this.exportImage(t, l, e, i, n)), r.renderEngine !== s && (r.renderEngine = s, r.refresh(), r.animation = o), m;
              }
              _saveAsImage(t, e) {
                return this._widgetToImage(this, t, e);
              }
              saveAsPNG(t) {
                return this._saveAsImage("png", t);
              }
              saveAsJPEG(t) {
                return this._saveAsImage("jpeg", t);
              }
              exportImage(t, e, i, a, n) {
                if (!e) return !1;
                let r = i.toLowerCase() === "pdf";
                r && (i = "jpeg"), a !== void 0 && a !== "" || (a = "image." + i);
                let s = !0;
                if (i !== "print") {
                  try {
                    if (e) if (r) {
                      n = n || "portrait";
                      const o = { content: { image: e.toDataURL("image/" + i), width: Math.min(e.width / 1.35, n === "portrait" ? 515 : 762) }, pageOrientation: n };
                      try {
                        pdfMake.createPdf(o).download(a);
                      } catch {
                        t.error(t.localize("missingReference", { files: "pdfmake.min.js" }));
                      }
                    } else {
                      Smart.Utilities.DataExporter || t.error(t.localize("missingReference", { files: "smart.export.js" }));
                      const o = new Smart.Utilities.DataExporter();
                      e.toBlob((function(l) {
                        o.downloadFile(l, i, a);
                      }));
                    }
                  } catch {
                    s = !1;
                  }
                  return s;
                }
                {
                  const o = window.open("", "", "width=800,height=500"), l = o.document.open(), c = '<!DOCTYPE html><html><head><meta charset="utf-8" /><title>jQWidgets Chart</title></head><body><img src="' + e.toDataURL() + '" /></html>';
                  try {
                    l.write(c), l.close(), setTimeout((function() {
                      o.print(), o.close();
                    }), 100);
                  } catch {
                  }
                }
              }
            }), Smart.Utilities.Assign("Renderer", class {
              constructor(t) {
                const e = this;
                e.draw = t, e._gradients = {}, e._toRadiansCoefficient = 2 * Math.PI / 360;
              }
              pieSlicePath(t, e, i, a, n, r, s) {
                a || (a = 1);
                const o = Math.abs(n - r), l = o > 180 ? 1 : 0;
                o >= 360 && (r = n + 359.99);
                const c = n * this._toRadiansCoefficient, m = r * this._toRadiansCoefficient;
                let u = t, p = t, h = e, g = e;
                const f = !isNaN(i) && i > 0;
                f && (s = 0);
                const b = Math.cos(c), y = Math.sin(c), _ = Math.cos(m), x = Math.sin(m);
                if (s + i > 0) {
                  if (s > 0) {
                    const P = (o / 2 + n) * this._toRadiansCoefficient;
                    t += s * Math.cos(P), e -= s * Math.sin(P);
                  }
                  f && (u = t + i * b, h = e - i * y, p = t + i * _, g = e - i * x);
                }
                const w = t + a * b, S = t + a * _, v = e - a * y, T = e - a * x;
                let k = "";
                const M = Math.abs(Math.abs(r - n) - 360) > 0.02;
                return f ? (k = "M " + p + "," + g, k += " a" + i + "," + i, k += " 0 " + l + ",1 " + (u - p) + "," + (h - g), k += M ? " L" + w + "," + v : " M" + w + "," + v, k += " a" + a + "," + a, k += " 0 " + l + ",0 " + (S - w) + "," + (T - v), M && (k += " Z")) : (k = "M " + S + "," + T, k += " a" + a + "," + a, k += " 0 " + l + ",1 " + (w - S) + "," + (v - T), M && (k += " L" + t + "," + e, k += " Z")), k;
              }
              measureText(t, e, i, a) {
                const n = this._getTextParts(t, e, i), r = n.width;
                let s = n.height;
                a === !1 && (s /= 0.6);
                let o = {};
                if (isNaN(e) && (e = 0), e === 0) o = { width: this._rup(r), height: this._rup(s) };
                else {
                  const l = e * Math.PI * 2 / 360, c = Math.abs(Math.sin(l)), m = Math.abs(Math.cos(l)), u = Math.abs(r * c + s * m), p = Math.abs(r * m + s * c);
                  o = { width: this._rup(p), height: this._rup(u) };
                }
                return a && (o.textPartsInfo = n), o;
              }
              alignTextInRect(t, e, i, a, n, r, s, o, l, c) {
                const m = l * Math.PI * 2 / 360, u = Math.sin(m), p = Math.cos(m), h = n * u, g = n * p;
                s === "center" || s === "" || s === "undefined" ? t += i / 2 : s === "right" && (t += i), o === "center" || o === "middle" || o === "" || o === "undefined" ? e += a / 2 : o === "bottom" ? e += a - r / 2 : o === "top" && (e += r / 2);
                let f = "middle";
                (c = c || "").indexOf("top") !== -1 ? f = "top" : c.indexOf("bottom") !== -1 && (f = "bottom");
                let b = "center";
                return c.indexOf("left") !== -1 ? b = "left" : c.indexOf("right") !== -1 && (b = "right"), b === "center" ? (t -= g / 2, e -= h / 2) : b === "right" && (t -= g, e -= h), f === "top" ? (t -= r * u, e += r * p) : f === "middle" && (t -= r * u / 2, e += r * p / 2), { x: t = this._rup(t), y: e = this._rup(e) };
              }
              adjustColor(t, e) {
                if (typeof t != "string") return "#000000";
                if (t.indexOf("#") === -1) return t;
                const i = this.draw;
                let a = i.cssToRgb(t);
                const n = i.rgbToHsl(a);
                n[2] = Math.min(1, n[2] * e), n[1] = Math.min(1, n[1] * e * 1.1), a = i.hslToRgb(n), t = "#";
                for (let r = 0; r < 3; r++) {
                  let s = Math.round(a[r]);
                  s = i.decToHex(s), s.toString().length === 1 && (t += "0"), t += s;
                }
                return t.toUpperCase();
              }
              _rup(t) {
                let e = Math.round(t);
                return t > e && e++, e;
              }
              _ptdist(t, e, i, a) {
                return Math.sqrt((i - t) * (i - t) + (a - e) * (a - e));
              }
              _rnd(t, e, i, a) {
                if (isNaN(t)) return t;
                a === void 0 && (a = !0);
                let n = t - (a === !0 ? t % e : this._mod(t, e));
                return t === n ? n : (i ? t > n && (n += e) : n > t && (n -= e), e === 1 ? Math.round(n) : n);
              }
              _ptrnd(t) {
                if (!document.createElementNS) return Math.round(t) === t ? t : this._rnd(t, 1, !1, !0);
                const e = this._rnd(t, 0.5, !1, !0);
                return Math.abs(e - Math.round(e)) !== 0.5 ? e > t ? e - 0.5 : e + 0.5 : e;
              }
              _getContrastColor(t) {
                if (t === void 0) return;
                let e = this.draw.hexToRgb(t.slice(1, 3), t.slice(3, 5), t.slice(5, 7));
                return (0.299 * e[0] + 0.61 * e[1] + 0.114 * e[2]) / 255 > 0.6 ? "#000000" : "#FFFFFF";
              }
            }), Smart.Utilities.Assign("SvgRenderer", class extends Smart.Utilities.Renderer {
              constructor(t) {
                super(t);
                const e = this;
                e._svgns = "http://www.w3.org/2000/svg", e._openGroups = [], e._clipId = 0;
              }
              init(t) {
                const e = document.createElement("div");
                e.className = "drawContainer", e.onselectstart = function() {
                  return !1;
                }, t.appendChild(e), this.host = t, this.container = e;
                try {
                  const i = document.createElementNS(this._svgns, "svg");
                  i.setAttribute("version", "1.1"), i.setAttribute("width", "100%"), i.setAttribute("height", "100%"), i.setAttribute("overflow", "hidden"), e.appendChild(i), this.canvas = i;
                } catch {
                  return !1;
                }
                return this._id = (/* @__PURE__ */ new Date()).getTime(), this.clear(), !0;
              }
              getType() {
                return "SVG";
              }
              refresh() {
              }
              getRect() {
                return { x: 0, y: 0, width: Math.max(this._rup(this.host.offsetWidth) - 1, 0), height: Math.max(this._rup(this.host.offsetHeight) - 1, 0) };
              }
              getContainer() {
                return this.container;
              }
              clear() {
                for (; this.canvas.childNodes.length > 0; ) this.removeElement(this.canvas.firstElementChild);
                this._defaultParent = void 0, this._defs = document.createElementNS(this._svgns, "defs"), this._gradients = {}, this.canvas.appendChild(this._defs);
              }
              removeElement(t) {
                if (t !== void 0) try {
                  for (; t.firstChild; ) this.removeElement(t.firstChild);
                  t.parentNode ? t.parentNode.removeChild(t) : this.canvas.removeChild(t);
                } catch {
                }
              }
              beginGroup() {
                const t = this._activeParent(), e = document.createElementNS(this._svgns, "g");
                return t.appendChild(e), this._openGroups.push(e), e;
              }
              endGroup() {
                this._openGroups.length !== 0 && this._openGroups.pop();
              }
              _activeParent() {
                return this._openGroups.length === 0 ? this.canvas : this._openGroups[this._openGroups.length - 1];
              }
              createClipRect(t) {
                const e = document.createElementNS(this._svgns, "clipPath"), i = document.createElementNS(this._svgns, "rect");
                return this.attr(i, { x: t.x, y: t.y, width: t.width, height: t.height, fill: "none" }), this._clipId = this._clipId || 0, e.id = "cl" + this._id + "_" + (++this._clipId).toString(), e.appendChild(i), this._defs.appendChild(e), e;
              }
              getWindowHref() {
                let t = window.location.href;
                return t && (t = t.replace(/([\('\)])/g, "\\$1"), t = t.replace(/#.*$/, ""), t);
              }
              setClip(t, e) {
                const i = "url(" + this.getWindowHref() + "#" + e.id + ")";
                return this.attr(t, { "clip-path": i });
              }
              addHandler(t, e, i) {
                t.addEventListener(e, i);
              }
              removeHandler() {
              }
              on(t, e, i) {
                this.addHandler(t, e, i);
              }
              off(t, e, i) {
                this.removeHandler(t, e, i);
              }
              shape(t, e) {
                const i = document.createElementNS(this._svgns, t);
                if (i) {
                  for (let a in e) i.setAttribute(a, e[a]);
                  return this._activeParent().appendChild(i), i;
                }
              }
              _getTextParts(t, e, i) {
                const a = { width: 0, height: 0, parts: [] };
                if (t === void 0) return a;
                const n = t.toString().split("<br>"), r = this._activeParent(), s = document.createElementNS(this._svgns, "text");
                this.attr(s, i);
                for (let o = 0; o < n.length; o++) {
                  const l = n[o], c = s.ownerDocument.createTextNode(l);
                  let m;
                  s.appendChild(c), r.appendChild(s);
                  try {
                    m = s.getBBox();
                  } catch {
                  }
                  const u = this._rup(m.width), p = this._rup(0.6 * m.height);
                  s.removeChild(c), a.width = Math.max(a.width, u), a.height += p + (o > 0 ? 4 : 0), a.parts.push({ width: u, height: p, text: l });
                }
                return r.removeChild(s), a;
              }
              _measureText(t, e, i, a) {
                return super.measureText(t, e, i, a);
              }
              measureText(t, e, i) {
                return this._measureText(t, e, i, !1);
              }
              text(t, e, i, a, n, r, s, o, l, c, m) {
                const u = this._measureText(t, r, s, !0, this).textPartsInfo, p = u.parts, h = this._getContrastColor(arguments[11]);
                let g;
                if (l || (l = "center"), c || (c = "center"), (p.length > 1 || o) && (g = this.beginGroup()), o) {
                  const k = this.createClipRect({ x: this._rup(e) - 1, y: this._rup(i) - 1, width: this._rup(a) + 2, height: this._rup(n) + 2 });
                  this.setClip(g, k);
                }
                let f = this._activeParent(), b = 0, y = 0;
                b = u.width, y = u.height, (isNaN(a) || a <= 0) && (a = b), (isNaN(n) || n <= 0) && (n = y);
                const _ = a || 0, x = n || 0;
                let w = 0;
                if (!r || r === 0) {
                  let k;
                  i += y, c === "center" || c === "middle" ? i += (x - y) / 2 : c === "bottom" && (i += x - y), a || (a = b), n || (n = y), f = this._activeParent();
                  for (let M = p.length - 1; M >= 0; M--) {
                    k = document.createElementNS(this._svgns, "text"), this.attr(k, s), this.attr(k, { cursor: "default" });
                    const P = k.ownerDocument.createTextNode(p[M].text);
                    k.appendChild(P);
                    let D = e;
                    const C = p[M].width, N = p[M].height;
                    l === "center" ? D += (_ - C) / 2 : l === "right" && (D += _ - C), this.attr(k, { x: this._rup(D), y: this._rup(i + w), width: this._rup(C), height: this._rup(N) }), h !== void 0 && (k.style.fill = h), f.appendChild(k), w -= p[M].height + 4;
                  }
                  return g ? (this.endGroup(), g) : k;
                }
                const S = this.alignTextInRect(e, i, a, n, b, y, l, c, r, m);
                e = S.x, i = S.y;
                const v = this.shape("g", { transform: "translate(" + e + "," + i + ")" }), T = this.shape("g", { transform: "rotate(" + r + ")" });
                v.appendChild(T), w = 0;
                for (let k = p.length - 1; k >= 0; k--) {
                  const M = document.createElementNS(this._svgns, "text");
                  this.attr(M, s), this.attr(M, { cursor: "default" });
                  const P = M.ownerDocument.createTextNode(p[k].text);
                  M.appendChild(P);
                  let D = 0;
                  const C = p[k].width, N = p[k].height;
                  l === "center" ? D += (u.width - C) / 2 : l === "right" && (D += u.width - C), this.attr(M, { x: this._rup(D), y: this._rup(w), width: this._rup(C), height: this._rup(N) }), T.appendChild(M), w -= N + 4;
                }
                return f.appendChild(v), g && this.endGroup(), v;
              }
              line(t, e, i, a, n) {
                const r = this.shape("line", { x1: t, y1: e, x2: i, y2: a });
                return this.attr(r, n), r;
              }
              path(t, e) {
                const i = this.shape("path");
                return i.setAttribute("d", t), e && this.attr(i, e), i;
              }
              rect(t, e, i, a, n) {
                t = this._ptrnd(t), e = this._ptrnd(e), i = Math.max(1, this._rnd(i, 1, !1)), a = Math.max(1, this._rnd(a, 1, !1));
                const r = this.shape("rect", { x: t, y: e, width: i, height: a });
                return n && this.attr(r, n), r;
              }
              circle(t, e, i, a) {
                const n = this.shape("circle", { cx: t, cy: e, r: i });
                return a && this.attr(n, a), n;
              }
              pieslice(t, e, i, a, n, r, s, o) {
                const l = this.pieSlicePath(t, e, i, a, n, r, s), c = this.shape("path");
                return c.setAttribute("d", l), o && this.attr(c, o), c;
              }
              attr(t, e) {
                if (t && e) for (let i in e) i === "textContent" ? t.textContent = e[i] : i === "width" || i === "height" ? t.setAttribute(i, Math.max(0, e[i])) : t.setAttribute(i, e[i]);
              }
              removeAttr(t, e) {
                if (t && e) for (let i in e) i === "textContent" ? t.textContent = "" : t.removeAttribute(e[i]);
              }
              getAttr(t, e) {
                return t.getAttribute(e);
              }
              _toLinearGradient(t, e, i) {
                const a = "grd" + this._id + t.replace("#", "") + (e ? "v" : "h"), n = "url(" + this.getWindowHref() + "#" + a + ")";
                if (this._gradients[n]) return n;
                const r = document.createElementNS(this._svgns, "linearGradient");
                this.attr(r, { x1: "0%", y1: "0%", x2: e ? "0%" : "100%", y2: e ? "100%" : "0%", id: a });
                for (let s = 0; s < i.length; s++) {
                  const o = i[s], l = document.createElementNS(this._svgns, "stop"), c = "stop-color:" + this.adjustColor(t, o[1]);
                  this.attr(l, { offset: o[0] + "%", style: c }), r.appendChild(l);
                }
                return this._defs.appendChild(r), this._gradients[n] = !0, n;
              }
              _toRadialGradient(t, e, i) {
                const a = "grd" + this._id + t.replace("#", "") + "r" + (i !== void 0 ? i.key : ""), n = "url(" + this.getWindowHref() + "#" + a + ")";
                if (this._gradients[n]) return n;
                const r = document.createElementNS(this._svgns, "radialGradient");
                i === void 0 ? this.attr(r, { cx: "50%", cy: "50%", r: "100%", fx: "50%", fy: "50%", id: a }) : this.attr(r, { cx: i.x, cy: i.y, r: i.outerRadius, id: a, gradientUnits: "userSpaceOnUse" });
                for (let s = 0; s < e.length; s++) {
                  const o = e[s], l = document.createElementNS(this._svgns, "stop"), c = "stop-color:" + this.adjustColor(t, o[1]);
                  this.attr(l, { offset: o[0] + "%", style: c }), r.appendChild(l);
                }
                return this._defs.appendChild(r), this._gradients[n] = !0, n;
              }
            }), Smart.Utilities.Assign("HTML5Renderer", class extends Smart.Utilities.Renderer {
              constructor(t) {
                super(t), this._renderers = new Smart.Utilities.HTML5RenderHelpers(this);
              }
              init(t) {
                try {
                  this.host = t;
                  const e = document.createElement("div"), i = document.createElement("canvas");
                  e.className = "chartContainer", e.style.position = "relative", e.onselectstart = function() {
                    return !1;
                  }, i.id = "__smartCanvasWrap", i.style.width = "100%", i.style.height = "100%", e.appendChild(i), t.appendChild(e), this.canvas = i, i.width = t.offsetWidth, i.height = t.offsetHeight, this.ctx = i.getContext("2d"), this._elements = {}, this._maxId = 0, this._gradientId = 0, this._gradients = {}, this._currentPoint = { x: 0, y: 0 }, this._lastCmd = "", this._pos = 0;
                } catch {
                  return !1;
                }
                return !0;
              }
              getType() {
                return "HTML5";
              }
              getContainer() {
                return this.host.getElementsByClassName("chartContainer")[0];
              }
              getRect() {
                return { x: 0, y: 0, width: this.canvas.width - 1, height: this.canvas.height - 1 };
              }
              beginGroup() {
              }
              endGroup() {
              }
              setClip() {
              }
              createClipRect() {
              }
              addHandler() {
              }
              removeHandler() {
              }
              on(t, e, i) {
                this.addHandler(t, e, i);
              }
              off(t, e, i) {
                this.removeHandler(t, e, i);
              }
              clear() {
                this._elements = {}, this._maxId = 0, this._renderers._gradients = {}, this._gradientId = 0;
              }
              removeElement(t) {
                t !== void 0 && this._elements[t.id] && delete this._elements[t.id];
              }
              shape(t, e) {
                let i = { type: t, id: this._maxId++ };
                for (let a in e) i[a] = e[a];
                return this._elements[i.id] = i, i;
              }
              attr(t, e) {
                for (let i in e) t[i] = e[i];
              }
              removeAttr(t, e) {
                for (let i in e) delete t[e[i]];
              }
              rect(t, e, i, a, n) {
                if (isNaN(t)) throw 'Invalid value for "x"';
                if (isNaN(e)) throw 'Invalid value for "y"';
                if (isNaN(i)) throw 'Invalid value for "width"';
                if (isNaN(a)) throw 'Invalid value for "height"';
                let r = this.shape("rect", { x: t, y: e, width: i, height: a });
                return n && this.attr(r, n), r;
              }
              path(t, e) {
                let i = this.shape("path", e);
                return this.attr(i, { d: t }), i;
              }
              line(t, e, i, a, n) {
                return this.path("M " + t + "," + e + " L " + i + "," + a, n);
              }
              circle(t, e, i, a) {
                let n = this.shape("circle", { x: t, y: e, r: i });
                return a && this.attr(n, a), n;
              }
              pieslice(t, e, i, a, n, r, s, o) {
                let l = this.path(this.pieSlicePath(t, e, i, a, n, r, s), o);
                return this.attr(l, { x: t, y: e, innerRadius: i, outerRadius: a, angleFrom: n, angleTo: r }), l;
              }
              _getCSSStyle(t) {
                const e = document.createElement("div");
                e.className = t, e.style.position = "absolute", e.style.visibility = "hidden", this.host.appendChild(e);
                let i = window.getComputedStyle(e);
                return i = { color: i.color, fontFamily: i.fontFamily, fontSize: i.fontSize, fontWeight: i.fontWeight }, this.host.removeChild(e), i;
              }
              _getTextParts(t, e, i) {
                let a = "Arial", n = "10pt", r = "";
                if (i && i.class) {
                  let l = this._getCSSStyle(i.class);
                  l.fontSize && (n = l.fontSize), l.fontFamily && (a = l.fontFamily), l.fontWeight && (r = l.fontWeight);
                }
                this.ctx.font = r + " " + n + " " + a;
                let s = { width: 0, height: 0, parts: [] }, o = t.toString().split("<br>");
                for (let l = 0; l < o.length; l++) {
                  let c = o[l], m = this.ctx.measureText(c).width, u = document.createElement("span");
                  u.className = "chart", u.font = this.ctx.font, u.textContent = c, this.host.appendChild(u);
                  let p = 0.6 * u.offsetHeight;
                  this.host.removeChild(u), s.width = Math.max(s.width, this._rup(m)), s.height += p + (l > 0 ? 4 : 0), s.parts.push({ width: m, height: p, text: c });
                }
                return s;
              }
              _measureText(t, e, i, a) {
                return super.measureText(t, e, i, a);
              }
              measureText(t, e, i) {
                return this._measureText(t, e, i, !1);
              }
              text(t, e, i, a, n, r, s, o, l, c, m) {
                let u = this.shape("text", { text: t, x: e, y: i, width: a, height: n, angle: r, clip: o, halign: l, valign: c, rotateAround: m });
                if (s && this.attr(u, s), u.fontFamily = "Arial", u.fontSize = "10pt", u.fontWeight = "", u.color = this._getContrastColor(arguments[11]), s && s.class) {
                  let h = this._getCSSStyle(s.class);
                  u.fontFamily = h.fontFamily || u.fontFamily, u.fontSize = h.fontSize || u.fontSize, u.fontWeight = h.fontWeight || u.fontWeight, u.color = u.color || h.color;
                }
                u.color = u.color || "#000000";
                let p = this._measureText(t, 0, s, !0);
                return this.attr(u, { textPartsInfo: p.textPartsInfo, textWidth: p.width, textHeight: p.height }), (a <= 0 || isNaN(a)) && this.attr(u, { width: p.width }), (n <= 0 || isNaN(n)) && this.attr(u, { height: p.height }), u;
              }
              _toLinearGradient(t, e, i) {
                if (this._renderers._gradients[t]) return t;
                let a = [];
                for (let r = 0; r < i.length; r++) a.push({ percent: i[r][0] / 100, color: this.adjustColor(t, i[r][1]) });
                let n = "gr" + this._gradientId++;
                return this.createGradient(n, e ? "vertical" : "horizontal", a), n;
              }
              _toRadialGradient(t, e) {
                if (this._renderers._gradients[t]) return t;
                let i = [];
                for (let n = 0; n < e.length; n++) i.push({ percent: e[n][0] / 100, color: this.adjustColor(t, e[n][1]) });
                let a = "gr" + this._gradientId++;
                return this.createGradient(a, "radial", i), a;
              }
              createGradient(t, e, i) {
                this._renderers.createGradient(this, t, e, i);
              }
              refresh() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                for (let t in this._elements) {
                  let e = this._elements[t];
                  this._renderers.setFillStyle(this, e), this._renderers.setStroke(this, e), this._renderers[this._elements[t].type](this.ctx, e);
                }
              }
            }), Smart.Utilities.Assign("HTML5RenderHelpers", class {
              constructor(t) {
                this.HTML5Renderer = t, this._cmds = "mlcazq";
              }
              ptrnd(t) {
                if (Math.abs(Math.round(t) - t) === 0.5) return t;
                let e = Math.round(t);
                return e < t && (e -= 1), e + 0.5;
              }
              createGradient(t, e, i, a) {
                t._gradients[e] = { orientation: i, colorStops: a };
              }
              setStroke(t, e) {
                let i = t.ctx, a = e["stroke-width"];
                i.strokeStyle = e.stroke || "transparent", i.lineWidth = a === 0 ? 0.01 : a !== void 0 ? a : 1, e["fill-opacity"] !== void 0 ? i.globalAlpha = e["fill-opacity"] : e.opacity !== void 0 ? i.globalAlpha = e.opacity : i.globalAlpha = 1, i.setLineDash && (e["stroke-dasharray"] ? i.setLineDash(e["stroke-dasharray"].split(",")) : i.setLineDash([]));
              }
              setFillStyle(t, e) {
                let i = t.ctx;
                if (i.fillStyle = "transparent", e["fill-opacity"] !== void 0 ? i.globalAlpha = e["fill-opacity"] : e.opacity !== void 0 ? i.globalAlpha = e.opacity : i.globalAlpha = 1, e.fill && e.fill.indexOf("#") === -1 && t._gradients[e.fill]) {
                  let a, n = t._gradients[e.fill].orientation !== "horizontal", r = t._gradients[e.fill].orientation === "radial", s = this.ptrnd(e.x), o = this.ptrnd(e.y), l = this.ptrnd(e.x + (n ? 0 : e.width)), c = this.ptrnd(e.y + (n ? e.height : 0));
                  if ((e.type === "circle" || e.type === "path" || e.type === "rect") && r) {
                    let u = this.ptrnd(e.x), p = this.ptrnd(e.y);
                    const h = e.innerRadius || 0, g = e.outerRadius || e.r || 0;
                    e.type === "rect" && (u += e.width / 2, p += e.height / 2), a = i.createRadialGradient(u, p, h, u, p, g);
                  }
                  r || ((isNaN(s) || isNaN(l) || isNaN(o) || isNaN(c)) && (s = 0, o = 0, l = n ? 0 : i.canvas.width, c = n ? i.canvas.height : 0), a = i.createLinearGradient(s, o, l, c));
                  let m = t._gradients[e.fill].colorStops;
                  for (let u = 0; u < m.length; u++) a.addColorStop(m[u].percent, m[u].color);
                  i.fillStyle = a;
                } else e.fill && (i.fillStyle = e.fill);
              }
              rect(t, e) {
                e.width !== 0 && e.height !== 0 && (t.fillRect(this.ptrnd(e.x), this.ptrnd(e.y), e.width, e.height), t.strokeRect(this.ptrnd(e.x), this.ptrnd(e.y), e.width, e.height));
              }
              circle(t, e) {
                e.r !== 0 && (t.beginPath(), t.arc(this.ptrnd(e.x), this.ptrnd(e.y), e.r, 0, 2 * Math.PI, !1), t.closePath(), t.fill(), t.stroke());
              }
              _parsePoint(t) {
                return { x: this._parseNumber(t), y: this._parseNumber(t) };
              }
              _parseNumber(t) {
                let e, i = !1;
                for (e = this._pos; e < t.length; e++) if (t[e] >= "0" && t[e] <= "9" || t[e] === "." || t[e] === "e" || t[e] === "-" && !i || t[e] === "-" && e >= 1 && t[e - 1] === "e") i = !0;
                else {
                  if (i || t[e] !== " " && t[e] !== ",") break;
                  this._pos++;
                }
                let a = parseFloat(t.substring(this._pos, e));
                if (!isNaN(a)) return this._pos = e, a;
              }
              _isRelativeCmd(t) {
                return this._cmds.indexOf(t) !== -1;
              }
              _parseCmd(t) {
                for (let e = this._pos; e < t.length; e++) {
                  if (this._cmds.toLowerCase().indexOf(t[e].toLowerCase()) !== -1) return this._pos = e + 1, this._lastCmd = t[e], this._lastCmd;
                  if (t[e] !== " ") {
                    if (t[e] >= "0" && t[e] <= "9") {
                      if (this._pos = e, this._lastCmd === "") break;
                      return this._lastCmd;
                    }
                  } else this._pos++;
                }
              }
              _toAbsolutePoint(t) {
                return { x: this._currentPoint.x + t.x, y: this._currentPoint.y + t.y };
              }
              path(t, e) {
                let i, a = e.d;
                for (this._pos = 0, this._lastCmd = "", this._currentPoint = { x: 0, y: 0 }, t.beginPath(); this._pos < a.length; ) {
                  let n = this._parseCmd(a);
                  if (n === void 0) break;
                  if (n !== "M" && n !== "m") if (n !== "L" && n !== "l") if (n !== "A" && n !== "a") if (n !== "Z" && n !== "z" || i === void 0) if (n !== "C" && n !== "c") {
                    if (!(n !== "Q" && n !== "q")) {
                      let r = this._parsePoint(a), s = this._parsePoint(a);
                      t.quadraticCurveTo(r.x, r.y, s.x, s.y), this._currentPoint = s;
                    }
                  } else {
                    let r = this._parsePoint(a), s = this._parsePoint(a), o = this._parsePoint(a);
                    t.bezierCurveTo(r.x, r.y, s.x, s.y, o.x, o.y), this._currentPoint = o;
                  }
                  else t.lineTo(i.x, i.y), this._currentPoint = i;
                  else {
                    let r = this._parseNumber(a), s = this._parseNumber(a), o = this._parseNumber(a) * (Math.PI / 180), l = this._parseNumber(a), c = this._parseNumber(a), m = this._parsePoint(a);
                    if (this._isRelativeCmd(n) && (m = this._toAbsolutePoint(m)), r === 0 || s === 0) continue;
                    let u = this._currentPoint, p = { x: Math.cos(o) * (u.x - m.x) / 2 + Math.sin(o) * (u.y - m.y) / 2, y: -Math.sin(o) * (u.x - m.x) / 2 + Math.cos(o) * (u.y - m.y) / 2 }, h = Math.pow(p.x, 2) / Math.pow(r, 2) + Math.pow(p.y, 2) / Math.pow(s, 2);
                    h > 1 && (r *= Math.sqrt(h), s *= Math.sqrt(h));
                    let g = (l === c ? -1 : 1) * Math.sqrt((Math.pow(r, 2) * Math.pow(s, 2) - Math.pow(r, 2) * Math.pow(p.y, 2) - Math.pow(s, 2) * Math.pow(p.x, 2)) / (Math.pow(r, 2) * Math.pow(p.y, 2) + Math.pow(s, 2) * Math.pow(p.x, 2)));
                    isNaN(g) && (g = 0);
                    let f = { x: g * r * p.y / s, y: g * -s * p.x / r }, b = { x: (u.x + m.x) / 2 + Math.cos(o) * f.x - Math.sin(o) * f.y, y: (u.y + m.y) / 2 + Math.sin(o) * f.x + Math.cos(o) * f.y }, y = function(D) {
                      return Math.sqrt(Math.pow(D[0], 2) + Math.pow(D[1], 2));
                    }, _ = function(D, C) {
                      return (D[0] * C[0] + D[1] * C[1]) / (y(D) * y(C));
                    }, x = function(D, C) {
                      return (D[0] * C[1] < D[1] * C[0] ? -1 : 1) * Math.acos(_(D, C));
                    }, w = x([1, 0], [(p.x - f.x) / r, (p.y - f.y) / s]), S = [(p.x - f.x) / r, (p.y - f.y) / s], v = [(-p.x - f.x) / r, (-p.y - f.y) / s], T = x(S, v);
                    _(S, v) <= -1 && (T = Math.PI), _(S, v) >= 1 && (T = 0), c === 0 && T > 0 && (T -= 2 * Math.PI), c === 1 && T < 0 && (T += 2 * Math.PI);
                    let k = r > s ? r : s, M = r > s ? 1 : r / s, P = r > s ? s / r : 1;
                    t.translate(b.x, b.y), t.rotate(o), t.scale(M, P), t.arc(0, 0, k, w, w + T, 1 - c), t.scale(1 / M, 1 / P), t.rotate(-o), t.translate(-b.x, -b.y);
                  }
                  else {
                    let r = this._parsePoint(a);
                    if (r === void 0) break;
                    t.lineTo(r.x, r.y), this._currentPoint = r;
                  }
                  else {
                    let r = this._parsePoint(a);
                    if (r === void 0) break;
                    t.moveTo(r.x, r.y), this._currentPoint = r, i === void 0 && (i = r);
                  }
                }
                t.fill(), t.stroke(), t.closePath();
              }
              text(t, e) {
                let i = this.ptrnd(e.x), a = this.ptrnd(e.y), n = this.ptrnd(e.width), r = this.ptrnd(e.height), s = e.halign, o = e.valign, l = e.angle, c = e.rotateAround, m = e.textPartsInfo, u = m.parts, p = e.clip;
                p === void 0 && (p = !0), t.save(), s || (s = "center"), o || (o = "center"), p && (t.rect(i, a, n, r), t.clip());
                let h = e.textWidth, g = e.textHeight, f = n || 0, b = r || 0;
                if (t.fillStyle = e.color, t.font = e.fontWeight + " " + e.fontSize + " " + e.fontFamily, !l || l === 0) {
                  a += g, o === "center" || o === "middle" ? a += (b - g) / 2 : o === "bottom" && (a += b - g), n || (n = h), r || (r = g);
                  let S = 0;
                  for (let v = u.length - 1; v >= 0; v--) {
                    let T = u[v], k = i, M = u[v].width;
                    s === "center" ? k += (f - M) / 2 : s === "right" && (k += f - M), t.fillText(T.text, k, a + S), S -= T.height + (v > 0 ? 4 : 0);
                  }
                  return void t.restore();
                }
                let y = this.HTML5Renderer.alignTextInRect(i, a, n, r, h, g, s, o, l, c);
                i = y.x, a = y.y;
                let _ = l * Math.PI * 2 / 360;
                t.translate(i, a), t.rotate(_);
                let x = 0, w = m.width;
                for (let S = u.length - 1; S >= 0; S--) {
                  let v = 0;
                  s === "center" ? v += (w - u[S].width) / 2 : s === "right" && (v += w - u[S].width), t.fillText(u[S].text, v, x), x -= u[S].height + 4;
                }
                t.restore();
              }
            }), Smart.Utilities.Assign("Plot", class {
              constructor(t) {
                this.renderer = t;
              }
              get(t, e, i) {
                return i !== void 0 ? t[e][i] : t[e];
              }
              min(t, e) {
                let i = NaN;
                for (let a = 0; a < t.length; a++) {
                  let n = this.get(t, a, e);
                  (isNaN(i) || n < i) && (i = n);
                }
                return i;
              }
              max(t, e) {
                let i = NaN;
                for (let a = 0; a < t.length; a++) {
                  let n = this.get(t, a, e);
                  (isNaN(i) || n > i) && (i = n);
                }
                return i;
              }
              sum(t, e) {
                let i = 0;
                for (let a = 0; a < t.length; a++) {
                  let n = this.get(t, a, e);
                  isNaN(n) || (i += n);
                }
                return i;
              }
              count(t, e) {
                let i = 0;
                for (let a = 0; a < t.length; a++) {
                  let n = this.get(t, a, e);
                  isNaN(n) || i++;
                }
                return i;
              }
              avg(t, e) {
                return this.sum(t, e) / Math.max(1, this.count(t, e));
              }
              filter(t, e) {
                if (!e) return t;
                let i = [];
                for (let a = 0; a < t.length; a++) e(t[a]) && i.push(t[a]);
                return i;
              }
              scale(t, e, i, a) {
                if (isNaN(t)) return NaN;
                if ((t < Math.min(e.min, e.max) || t > Math.max(e.min, e.max)) && (!a || a.ignore_range !== !0)) return NaN;
                let n = NaN, r = 1;
                if (e.type === void 0 || e.type !== "logarithmic") {
                  let s = Math.abs(e.max - e.min);
                  s || (s = 1), r = Math.abs(t - Math.min(e.min, e.max)) / s;
                } else if (e.type === "logarithmic") {
                  let s = e.base;
                  isNaN(s) && (s = 10);
                  let o = Math.min(e.min, e.max);
                  o <= 0 && (o = 1);
                  let l = Math.max(e.min, e.max);
                  l <= 0 && (l = 1);
                  let c = Math.log(l) / Math.log(s);
                  l = Math.pow(s, c);
                  let m = Math.log(o) / Math.log(s);
                  o = Math.pow(s, m);
                  let u = Math.log(t) / Math.log(s);
                  r = Math.abs(u - m) / (c - m);
                }
                if (i.type === "logarithmic") {
                  let s = i.base;
                  isNaN(s) && (s = 10);
                  let o = Math.log(i.max) / Math.log(s), l = Math.log(i.min) / Math.log(s);
                  i.flip && (r = 1 - r);
                  let c = Math.min(l, o) + r * Math.abs(o - l);
                  n = Math.pow(s, c);
                } else n = Math.min(i.min, i.max) + r * Math.abs(i.max - i.min), i.flip && (n = Math.max(i.min, i.max) - n + i.min);
                return n;
              }
              axis(t, e, i) {
                if (i <= 1) return [e, t];
                (isNaN(i) || i < 2) && (i = 2);
                let a = 0;
                for (; Math.round(t) !== t && Math.round(e) !== e && a < 10; ) t *= 10, e *= 10, a++;
                let n = (e - t) / i;
                for (; a < 10 && Math.round(n) !== n; ) t *= 10, e *= 10, n *= 10, a++;
                let r, s = [1, 2, 5], o = 0;
                for (; ; ) {
                  let p = o % s.length, h = Math.floor(o / s.length), g = Math.pow(10, h) * s[p];
                  if (p = (o + 1) % s.length, h = Math.floor((o + 1) / s.length), r = Math.pow(10, h) * s[p], n >= g && n < r) break;
                  o++;
                }
                let l = r, c = [], m = this.renderer._rnd(t, l, !1), u = a <= 0 ? 1 : Math.pow(10, a);
                for (; m < e + l; ) c.push(m / u), m += l;
                return c;
              }
            });
          })
        ),
        /***/
        6321: (
          /***/
          (() => {
            (function() {
              if (typeof window === void 0) return;
              const Version = "25.5.0", templates = [], LICENSE_CACHE_KEY = "smart_license_cache", LICENSE_CACHE_TTL = 2592e6;
              let namespace = "Smart";
              if (window[namespace] && window[namespace].Version) {
                if (window[namespace].Version === Version) return;
                if (window[namespace].Version !== Version) namespace += Version;
                else {
                  let t = 2;
                  for (; window[namespace]; ) namespace += t.toString(), t++;
                }
              }
              const isEdge = navigator.userAgent.indexOf("Edge") > -1 && navigator.appVersion.indexOf("Edge") > -1;
              function Import(t, e) {
                let i = 0;
                const a = function(n, r) {
                  return new Promise(((s) => {
                    const o = document.createElement("script");
                    o.src = n, o.onload = s;
                    for (let l = 0; l < document.head.children.length; l++) {
                      const c = document.head.children[l];
                      if (c.src && c.src.toString().indexOf(r) >= 0) return void s();
                    }
                    document.head.appendChild(o);
                  }));
                };
                return new Promise(((n) => {
                  const r = Utilities.Core.getScriptLocation(), s = function(o) {
                    if (!t[o]) return;
                    const l = r + "/" + t[o];
                    a(l, t[o]).then((function() {
                      i++, i === t.length && n(), s(o + 1);
                    }));
                  };
                  if (e) for (let o = 0; o < t.length; o++) {
                    const l = r + "/" + t[o];
                    a(l, t[o]).then((function() {
                      i++, i === t.length && n();
                    }));
                  }
                  else s(0);
                }));
              }
              document.elementsFromPoint || (document.elementsFromPoint = document.msElementsFromPoint);
              class Types {
                static isBoolean(e) {
                  return typeof e == "boolean";
                }
                static isFunction(e) {
                  return !!(e && e.constructor && e.call && e.apply);
                }
                static isArray(e) {
                  return Array.isArray(e);
                }
                static isObject(e) {
                  return e && (typeof e == "object" || this.isFunction(e)) || !1;
                }
                static isDate(e) {
                  return e instanceof Date;
                }
                static isString(e) {
                  return typeof e == "string";
                }
                static isNumber(e) {
                  return typeof e == "number";
                }
                static getType(e) {
                  const i = this, a = ["Boolean", "Number", "String", "Function", "Array", "Date", "Object"].find(((n) => {
                    if (i["is" + n](e)) return n;
                  }));
                  return a ? a.toLowerCase() : void 0;
                }
              }
              class Ripple {
                static animate(e, i, a, n) {
                  const r = e;
                  if (!r || !(r instanceof HTMLElement)) return;
                  if (r.getElementsByClassName("smart-ripple").length === 0) {
                    const h = document.createElement("span");
                    h.classList.add("smart-ripple"), h.setAttribute("role", "presentation");
                    let g = !0, f = null;
                    if (window[namespace].EnableShadowDOM && r.enableShadowDOM && r.isInShadowDOM !== !0) {
                      for (let b = 0; b < r.shadowRoot.host.shadowRoot.children.length; b++) r.shadowRoot.host.shadowRoot.children[b].tagName.toLowerCase() !== "link" && (f = r.shadowRoot.host.shadowRoot.children[b]);
                      r.shadowRoot.host.shadowRoot.querySelector(".smart-ripple") && (g = !1);
                    } else f = r.firstElementChild;
                    g && (f && !f.noRipple && f.offsetHeight > 0 ? f.appendChild(h) : r.appendChild(h));
                  }
                  let s = null;
                  if (s = window[namespace].EnableShadowDOM && r.shadowRoot ? r.shadowRoot.host.shadowRoot.querySelector(".smart-ripple") : r.getElementsByClassName("smart-ripple")[0], !s) return;
                  s.innerHTML = "", s.classList.remove("smart-animate"), s.style.height = s.style.width = Math.max(r.offsetHeight, r.offsetWidth) + "px";
                  const o = window.getComputedStyle(s.parentElement), l = parseInt(o.borderLeftWidth) || 0, c = parseInt(o.borderTopWidth) || 0, m = r.getBoundingClientRect(), u = i - (m.left + window.pageXOffset) - s.offsetWidth / 2 - l, p = a - (m.top + window.pageYOffset) - s.offsetHeight / 2 - c;
                  s.style.left = u + "px", s.style.top = p + "px", s.classList.add("smart-animate"), s.addEventListener("animationend", (function h() {
                    s.parentElement && s.parentElement.removeChild(s), n && n(), s.removeEventListener("animationend", h), s.removeEventListener("animationcancel", h);
                  })), s.addEventListener("animationcancel", (function h() {
                    s.parentElement && s.parentElement.removeChild(s), n && n(), s.removeEventListener("animationcancel", h), s.removeEventListener("animationend", h);
                  }));
                }
              }
              class Easings {
                static easeInQuad(e, i, a, n) {
                  return a * (e /= n) * e + i;
                }
                static easeOutQuad(e, i, a, n) {
                  return -a * (e /= n) * (e - 2) + i;
                }
                static easeInOutQuad(e, i, a, n) {
                  return (e /= n / 2) < 1 ? a / 2 * e * e + i : -a / 2 * (--e * (e - 2) - 1) + i;
                }
                static easeInCubic(e, i, a, n) {
                  return a * (e /= n) * e * e + i;
                }
                static easeOutCubic(e, i, a, n) {
                  return a * ((e = e / n - 1) * e * e + 1) + i;
                }
                static easeInOutCubic(e, i, a, n) {
                  return (e /= n / 2) < 1 ? a / 2 * e * e * e + i : a / 2 * ((e -= 2) * e * e + 2) + i;
                }
                static easeInQuart(e, i, a, n) {
                  return a * (e /= n) * e * e * e + i;
                }
                static easeOutQuart(e, i, a, n) {
                  return -a * ((e = e / n - 1) * e * e * e - 1) + i;
                }
                static easeInOutQuart(e, i, a, n) {
                  return (e /= n / 2) < 1 ? a / 2 * e * e * e * e + i : -a / 2 * ((e -= 2) * e * e * e - 2) + i;
                }
                static easeInQuint(e, i, a, n) {
                  return a * (e /= n) * e * e * e * e + i;
                }
                static easeOutQuint(e, i, a, n) {
                  return a * ((e = e / n - 1) * e * e * e * e + 1) + i;
                }
                static easeInOutQuint(e, i, a, n) {
                  return (e /= n / 2) < 1 ? a / 2 * e * e * e * e * e + i : a / 2 * ((e -= 2) * e * e * e * e + 2) + i;
                }
                static easeInSine(e, i, a, n) {
                  return -a * Math.cos(e / n * (Math.PI / 2)) + a + i;
                }
                static easeOutSine(e, i, a, n) {
                  return a * Math.sin(e / n * (Math.PI / 2)) + i;
                }
                static easeInOutSine(e, i, a, n) {
                  return -a / 2 * (Math.cos(Math.PI * e / n) - 1) + i;
                }
                static easeInExpo(e, i, a, n) {
                  return e === 0 ? i : a * Math.pow(2, 10 * (e / n - 1)) + i;
                }
                static easeOutExpo(e, i, a, n) {
                  return e === n ? i + a : a * (1 - Math.pow(2, -10 * e / n)) + i;
                }
                static easeInOutExpo(e, i, a, n) {
                  return e === 0 ? i : e === n ? i + a : (e /= n / 2) < 1 ? a / 2 * Math.pow(2, 10 * (e - 1)) + i : a / 2 * (2 - Math.pow(2, -10 * --e)) + i;
                }
                static easeInCirc(e, i, a, n) {
                  return -a * (Math.sqrt(1 - (e /= n) * e) - 1) + i;
                }
                static easeOutCirc(e, i, a, n) {
                  return a * Math.sqrt(1 - (e = e / n - 1) * e) + i;
                }
                static easeInOutCirc(e, i, a, n) {
                  return (e /= n / 2) < 1 ? -a / 2 * (Math.sqrt(1 - e * e) - 1) + i : a / 2 * (Math.sqrt(1 - (e -= 2) * e) + 1) + i;
                }
                static easeInElastic(e, i, a, n) {
                  let r = 1.70158, s = 0, o = a;
                  return e === 0 ? i : (e /= n) == 1 ? i + a : (s || (s = 0.3 * n), o < Math.abs(a) ? (o = a, r = s / 4) : r = s / (2 * Math.PI) * Math.asin(a / o), -o * Math.pow(2, 10 * (e -= 1)) * Math.sin((e * n - r) * (2 * Math.PI) / s) + i);
                }
                static easeOutElastic(e, i, a, n) {
                  let r = 1.70158, s = 0, o = a;
                  return e === 0 ? i : (e /= n) == 1 ? i + a : (s || (s = 0.3 * n), o < Math.abs(a) ? (o = a, r = s / 4) : r = s / (2 * Math.PI) * Math.asin(a / o), o * Math.pow(2, -10 * e) * Math.sin((e * n - r) * (2 * Math.PI) / s) + a + i);
                }
                static easeInOutElastic(e, i, a, n) {
                  let r = 1.70158, s = 0, o = a;
                  return e === 0 ? i : (e /= n / 2) == 2 ? i + a : (s || (s = n * 0.44999999999999996), o < Math.abs(a) ? (o = a, r = s / 4) : r = s / (2 * Math.PI) * Math.asin(a / o), e < 1 ? o * Math.pow(2, 10 * (e -= 1)) * Math.sin((e * n - r) * (2 * Math.PI) / s) * -0.5 + i : o * Math.pow(2, -10 * (e -= 1)) * Math.sin((e * n - r) * (2 * Math.PI) / s) * 0.5 + a + i);
                }
                static easeInBack(e, i, a, n, r) {
                  return r === void 0 && (r = 1.70158), a * (e /= n) * e * ((r + 1) * e - r) + i;
                }
                static easeOutBack(e, i, a, n, r) {
                  return r === void 0 && (r = 1.70158), a * ((e = e / n - 1) * e * ((r + 1) * e + r) + 1) + i;
                }
                static easeInOutBack(e, i, a, n, r) {
                  return r === void 0 && (r = 1.70158), (e /= n / 2) < 1 ? a / 2 * (e * e * ((1 + (r *= 1.525)) * e - r)) + i : a / 2 * ((e -= 2) * e * ((1 + (r *= 1.525)) * e + r) + 2) + i;
                }
                static easeInBounce(e, i, a, n) {
                  return a - this.easeOutBounce(n - e, 0, a, n) + i;
                }
                static easeOutBounce(e, i, a, n) {
                  return (e /= n) < 0.36363636363636365 ? a * (7.5625 * e * e) + i : e < 0.7272727272727273 ? a * (7.5625 * (e -= 0.5454545454545454) * e + 0.75) + i : e < 0.9090909090909091 ? a * (7.5625 * (e -= 0.8181818181818182) * e + 0.9375) + i : a * (7.5625 * (e -= 0.9545454545454546) * e + 0.984375) + i;
                }
                static easeInOutBounce(e, i, a, n) {
                  return e < n / 2 ? 0.5 * this.easeInBounce(2 * e, 0, a, n) + i : 0.5 * this.easeOutBounce(2 * e - n, 0, a, n) + 0.5 * a + i;
                }
              }
              class Core {
                static get isMobile() {
                  return /(iphone|ipod|ipad|android|iemobile|blackberry|bada)/.test(window.navigator.userAgent.toLowerCase()) || ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document;
                }
                static get Browser() {
                  let e;
                  const i = function(n) {
                    let r = n.indexOf(e);
                    if (r === -1) return;
                    const s = n.indexOf("rv:");
                    return parseFloat(e === "Trident" && s !== -1 ? n.substring(s + 3) : n.substring(r + e.length + 1));
                  };
                  let a = {};
                  return a[(function() {
                    const n = [{ string: navigator.userAgent, subString: "Edge", identity: "Edge" }, { string: navigator.userAgent, subString: "MSIE", identity: "IE" }, { string: navigator.userAgent, subString: "Trident", identity: "IE" }, { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" }, { string: navigator.userAgent, subString: "Opera", identity: "Opera" }, { string: navigator.userAgent, subString: "OPR", identity: "Opera" }, { string: navigator.userAgent, subString: "Chrome", identity: "Chrome" }, { string: navigator.userAgent, subString: "Safari", identity: "Safari" }];
                    for (let r = 0; r < n.length; r++) {
                      let s = n[r].string;
                      if (e = n[r].subString, s.indexOf(n[r].subString) !== -1) return n[r].identity;
                    }
                    return "Other";
                  })()] = !0, a.version = i(navigator.userAgent) || i(navigator.appVersion) || "Unknown", a;
                }
                static toCamelCase(e) {
                  return e.replace(/-([a-z])/g, (function(i) {
                    return i[1].toUpperCase();
                  }));
                }
                static toDash(e) {
                  return e.split(/(?=[A-Z])/).join("-").toLowerCase();
                }
                static unescapeHTML(e) {
                  return new DOMParser().parseFromString(e, "text/html").documentElement.textContent;
                }
                static escapeHTML(e) {
                  const i = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "/": "&#x2F;", "`": "&#x60;", "=": "&#x3D;" };
                  return String(e).replace(/[&<>"'`=\/]/g, ((a) => i[a]));
                }
                static sanitizeHTML(e) {
                  if (e && (e.indexOf("onclick") >= 0 || e.indexOf("onload") >= 0 || e.indexOf("onerror") >= 0)) return this.escapeHTML(e);
                  const i = new RegExp("<s*(applet|audio|base|bgsound|embed|form|iframe|isindex|keygen|layout|link|meta|object|script|svg|style|template|video)[^>]*>(.*?)<s*/s*(applet|audio|base|bgsound|embed|form|iframe|isindex|keygen|layout|link|meta|object|script|svg|style|template|video)>", "ig");
                  return String(e).replace(i, ((a) => this.escapeHTML(a)));
                }
                static createGUID() {
                  function e() {
                    return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
                  }
                  return e() + e() + "-" + e() + "-" + e() + "-" + e() + "-" + e() + e() + e();
                }
                static getScriptLocation() {
                  return window[namespace].BaseUrl !== "./" ? window[namespace].BaseUrl : (function() {
                    if (document.currentScript) {
                      let r = document.currentScript.src, s = r.lastIndexOf("/");
                      return r = r.substring(0, s), r;
                    }
                    const e = new Error();
                    let i = "(", a = ")";
                    if (Smart.Utilities.Core.Browser.Safari && (i = "@", a = `
`), e.fileName) return e.fileName.replace("/smart.element.js", "");
                    let n = e.stack.split(i);
                    return n = n[1], n = n.split(a)[0], n = n.split(":"), n.splice(-2, 2), n = n.join(":"), n.replace("/smart.element.js", "");
                  })();
                }
                static CSSVariablesSupport() {
                  return window.CSS && window.CSS.supports && window.CSS.supports("(--fake-var: 0)");
                }
                static assign(e, i) {
                  const a = (r) => r && typeof r == "object" && !Array.isArray(r) && r !== null;
                  let n = Object.assign({}, e);
                  return a(e) && a(i) && Object.keys(i).forEach(((r) => {
                    a(i[r]) ? r in e ? n[r] = this.assign(e[r], i[r]) : Object.assign(n, { [r]: i[r] }) : Object.assign(n, { [r]: i[r] });
                  })), n;
                }
                static html(e, i) {
                  const a = this;
                  let n = "", r = e.childNodes;
                  if (!i) {
                    for (let s, o = 0, l = r.length; o < l && (s = r[o]); o++) {
                      const c = ["strong"];
                      if (s instanceof HTMLElement || s.tagName && c.indexOf(s.tagName.toLowerCase()) >= 0) {
                        const m = s.tagName.toLowerCase(), u = s.attributes;
                        let p = "<" + m;
                        for (let h, g = 0; h = u[g]; g++) p += " " + h.name + '="' + h.value.replace(/[&\u00A0"]/g, Utilities.Core.escapeHTML) + '"';
                        p += ">", ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"][m] && (n += p), n = n + p + a.html(s) + "</" + m + ">";
                      } else {
                        if (s.nodeType === 8) continue;
                        n += s.textContent.replace(/[&\u00A0<>]/g, Utilities.Core.escapeHTML);
                      }
                    }
                    return n;
                  }
                  {
                    const s = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi;
                    e.innerHTML = i.replace(s, "<$1></$2>");
                  }
                }
              }
              let styleObservedElements = [];
              class StyleObserver {
                static watch(e) {
                  switch (e.nodeName.toLowerCase()) {
                    case "smart-grid":
                    case "smart-kanban":
                    case "smart-table":
                    case "smart-pivot-table":
                    case "smart-scheduler":
                    case "smart-tabs":
                    case "smart-card-view":
                    case "smart-list-box":
                    case "smart-combo-box":
                    case "smart-drop-down-list":
                    case "smart-calendar":
                    case "smart-gauge":
                    case "smart-numeric-text-box":
                    case "smart-menu":
                    case "smart-tree":
                      styleObservedElements.push(e);
                      break;
                    default:
                      return;
                  }
                  StyleObserver.start();
                }
                static start() {
                  StyleObserver.isStarted || (StyleObserver.isStarted = !0, StyleObserver.interval && clearInterval(StyleObserver.interval), styleObservedElements.length === 0 || document.hidden ? StyleObserver.isStarted = !1 : StyleObserver.interval = setInterval((function() {
                    StyleObserver.observe();
                  }), 100));
                }
                static stop() {
                  StyleObserver.isStarted = !1, StyleObserver.interval && clearInterval(StyleObserver.interval);
                }
                static observeElement(e) {
                  const i = e;
                  if (window.Smart.Mode === "test" || document.hidden) return void (StyleObserver.interval && clearInterval(StyleObserver.interval));
                  let a = e._computedStyle || i.hasStyleObserver !== "resize" ? document.defaultView.getComputedStyle(i, null) : {}, n = !0, r = i.hasStyleObserver !== "resize" ? ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth", "display", "visibility", "font-size", "font-family", "font-style", "font-weight", "max-height", "min-height", "max-width", "min-width", "overflow", "overflow-x", "overflow-y"] : [];
                  if (e.styleProperties && (r = r.concat(e.styleProperties)), e.observableStyleProperties && (r = e.observableStyleProperties), !i._styleInfo) {
                    i._styleInfo = [];
                    for (let o = 0; o < r.length; o++) {
                      const l = r[o], c = l.startsWith("--") ? a.getPropertyValue(l) : a[l];
                      i._styleInfo[l] = c;
                    }
                    return;
                  }
                  if (e.isHidden || a.display !== "none" && (e.offsetWidth !== 0 && e.offsetHeight !== 0 || (e.isHidden = !0)), e.isHidden) {
                    if (e.visibilityChangedHandler(), e.isHidden) return;
                    n = !1;
                  }
                  let s = [];
                  for (let o = 0; o < r.length; o++) {
                    const l = r[o], c = l.startsWith("--") ? a.getPropertyValue(l) : a[l];
                    i._styleInfo[l] !== c && (s[l] = { oldValue: i._styleInfo[l], value: c }, s.length++), i._styleInfo[l] = c;
                  }
                  s.length > 0 && (i.$.fireEvent("styleChanged", { styleProperties: s }, { bubbles: !1, cancelable: !0 }), s.display && n && i.$.fireEvent("resize", i, { bubbles: !1, cancelable: !0 }));
                }
                static observe() {
                  for (let e = 0; e < styleObservedElements.length; e++) {
                    const i = styleObservedElements[e];
                    this.observeElement(i);
                  }
                }
                static unwatch(e) {
                  StyleObserver.stop();
                  const i = styleObservedElements.indexOf(e);
                  i !== -1 && styleObservedElements.splice(i, 1), StyleObserver.start();
                }
              }
              let dataContextInfo = [];
              const data = [], inputEventTypes = ["resize", "down", "up", "move", "tap", "taphold", "swipeleft", "swiperight", "swipetop", "swipebottom"];
              class InputEvents {
                constructor(e) {
                  const i = this;
                  i.target = e, i.$target = new Extend(e), i.$document = e.$document ? e.$document : new Extend(document), i.id = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
                  let a = { handlers: {}, boundEventTypes: [], listen: i.listen.bind(i), unlisten: i.unlisten.bind(i) };
                  return i.tapHoldDelay = 750, i.swipeMin = 10, i.swipeMax = 5e3, i.swipeDelay = 1e3, i.tapHoldDelay = 750, i.inputEventProperties = ["clientX", "clientY", "pageX", "pageY", "screenX", "screenY"], inputEventTypes.forEach(((n) => {
                    a[n] = (r) => {
                      a.handlers[n] = r;
                    }, i[n] = (r) => {
                      if (!a.handlers[r.type]) {
                        if ((r.type === "mousemove" || r.type === "pointermove" || r.type === "touchmove") && a.handlers.move) {
                          const s = i.createEvent(r, "move");
                          a.handlers.move(s);
                        }
                        return !0;
                      }
                      return a.handlers[r.type](r);
                    };
                  })), i.listen(), i.handlers = a.handlers, a;
                }
                listen(e) {
                  const i = this;
                  if (e === "resize" && i.target !== document && i.target !== window && i.target.hasResizeObserver !== !1) {
                    if (Smart.Utilities.Core.Browser.Firefox) {
                      if (!i.target.resizeObserver) {
                        let a, n, r, s = !1, o = i.target.offsetWidth, l = i.target.offsetHeight;
                        const c = new ResizeObserver((() => {
                          if (!s) return void (s = !0);
                          const m = new CustomEvent("resize", { bubbles: !1, cancelable: !0 });
                          n = i.target.offsetWidth, r = i.target.offsetHeight, a = n !== o || r !== l, i.target.requiresLayout && (a = !0), a && (i.resize(m), i.target.requiresLayout = !1, o = n, l = r);
                        }));
                        c.observe(i.target), i.target.resizeObserver = c;
                      }
                    } else if (!i.target.resizeTrigger) {
                      const a = document.createElement("div");
                      a.className = "smart-resize-trigger-container", a.innerHTML = '<div class="smart-resize-trigger-container"><div class="smart-resize-trigger"></div></div><div class="smart-resize-trigger-container"><div class="smart-resize-trigger-shrink"></div></div>', a.setAttribute("aria-hidden", !0), window[namespace].EnableShadowDOM && i.target.shadowRoot ? i.target.shadowRoot.appendChild(a) : i.target.appendChild(a), i.target.resizeTrigger = a;
                      const n = a.childNodes[0], r = n.childNodes[0], s = a.childNodes[1], o = function() {
                        r.style.width = "100000px", r.style.height = "100000px", n.scrollLeft = 1e5, n.scrollTop = 1e5, s.scrollLeft = 1e5, s.scrollTop = 1e5;
                      };
                      let l, c, m, u, p = i.target.offsetWidth, h = i.target.offsetHeight;
                      if (p === 0 || h === 0) {
                        const g = function() {
                          o(), i.target.removeEventListener("resize", g);
                        };
                        i.target.addEventListener("resize", g), o();
                      } else o();
                      i.target.resizeHandler = function() {
                        c || (c = requestAnimationFrame((function() {
                          if (c = 0, m = i.target.offsetWidth, u = i.target.offsetHeight, l = m !== p || u !== h, i.target.requiresLayout && (l = !0), !l) return;
                          p = m, h = u;
                          const g = new CustomEvent("resize", { bubbles: !1, cancelable: !0 });
                          i.resize(g), i.target.requiresLayout = !1;
                        }))), o();
                      }, n.addEventListener("scroll", i.target.resizeHandler), s.addEventListener("scroll", i.target.resizeHandler);
                    }
                  }
                  i.isListening || (i.isListening = !0, i.isPressed = !1, i.isReleased = !1, i.isInBounds = !1, window.PointerEvent ? (i.$target.listen("pointerdown.inputEvents" + i.id, i.pointerDown.bind(i)), i.$target.listen("pointerup.inputEvents" + i.id, i.pointerUp.bind(i)), i.$target.listen("pointermove.inputEvents" + i.id, i.pointerMove.bind(i)), i.$target.listen("pointercancel.inputEvents" + i.id, i.pointerCancel.bind(i))) : ("ontouchstart" in window && (i.$target.listen("touchmove.inputEvents" + i.id, i.touchMove.bind(i)), i.$target.listen("touchstart.inputEvents" + i.id, i.touchStart.bind(i)), i.$target.listen("touchend.inputEvents" + i.id, i.touchEnd.bind(i)), i.$target.listen("touchcancel.inputEvents" + i.id, i.touchCancel.bind(i))), i.$target.listen("mousedown.inputEvents" + i.id, i.mouseDown.bind(i)), i.$target.listen("mouseup.inputEvents" + i.id, i.mouseUp.bind(i)), i.$target.listen("mousemove.inputEvents" + i.id, i.mouseMove.bind(i)), i.$target.listen("mouseleave.inputEvents" + i.id, i.mouseLeave.bind(i))), i.target._handleDocumentUp || (i.target._handleDocumentUp = i.handleDocumentUp.bind(i), i.target._handleDocumentUpId = i.id, i.$document.listen("mouseup.inputEvents" + i.target._handleDocumentUpId, i.target._handleDocumentUp)));
                }
                unlisten(e) {
                  const i = this;
                  if (i.isListening = !1, window.PointerEvent ? (i.$target.unlisten("pointerdown.inputEvents" + i.id), i.$target.unlisten("pointerup.inputEvents" + i.id), i.$target.unlisten("pointermove.inputEvents" + i.id), i.$target.unlisten("pointercancel.inputEvents" + i.id)) : ("ontouchstart" in window && (i.$target.unlisten("touchstart.inputEvents" + i.id), i.$target.unlisten("touchmove.inputEvents" + i.id), i.$target.unlisten("touchend.inputEvents" + i.id), i.$target.unlisten("touchcancel.inputEvents" + i.id)), i.$target.unlisten("mousedown.inputEvents" + i.id), i.$target.unlisten("mouseup.inputEvents" + i.id), i.$target.unlisten("mousemove.inputEvents" + i.id), i.$target.unlisten("mouseleave.inputEvents" + i.id)), i.target._handleDocumentUp && (i.$document.unlisten("mouseup.inputEvents" + i.target._handleDocumentUpId, i.target._handleDocumentUp), delete i.target._handleDocumentUp, delete i.target._handleDocumentUpId), e === "resize") {
                    if (Smart.Utilities.Core.Browser.Firefox) i.target.resizeObserver && (i.target.resizeObserver.unobserve(i.target), delete i.target.resizeObserver);
                    else if (i.target.resizeTrigger) {
                      const a = i.target.resizeTrigger, n = a.childNodes[0], r = a.childNodes[1];
                      n.removeEventListener("scroll", i.target.resizeHandler), r.removeEventListener("scroll", i.target.resizeHandler), i.target.resizeHandler = null, a.parentNode.removeChild(a), delete i.target.resizeTrigger;
                    }
                  }
                }
                handleDocumentUp(e) {
                  const i = this;
                  i.isPressed = !1, i.isReleased = !1, i.resetSwipe(e);
                }
                createEvent(e, i) {
                  const a = this, n = e.touches, r = e.changedTouches, s = n && n.length ? n[0] : r && r.length ? r[0] : void 0, o = new CustomEvent(i, { bubbles: !0, cancelable: !0, composed: a.$target.element.getRootNode().host !== void 0 });
                  if (o.originalEvent = e, s) {
                    for (let l = 0; l < a.inputEventProperties.length; l++) {
                      const c = a.inputEventProperties[l];
                      o[c] = s[c];
                    }
                    return o;
                  }
                  for (let l in e) l in o || (o[l] = e[l]);
                  return o;
                }
                fireTap(e) {
                  const i = this;
                  if (clearTimeout(this.tapHoldTimeout), !this.tapHoldFired && this.isInBounds) {
                    const a = i.createEvent(e, "tap");
                    i.tap(a);
                  }
                }
                initTap(e) {
                  const i = this;
                  i.isInBounds = !0, i.tapHoldFired = !1, i.tapHoldTimeout = setTimeout((function() {
                    if (i.isInBounds) {
                      i.tapHoldFired = !0;
                      const a = i.createEvent(e, "taphold");
                      i.taphold(a);
                    }
                  }), i.tapHoldDelay);
                }
                pointerDown(e) {
                  return this.handleDown(e);
                }
                mouseDown(e) {
                  const i = this;
                  if (!(i.isPressed || i.touchStartTime && /* @__PURE__ */ new Date() - i.touchStartTime < 500)) return i.handleDown(e);
                }
                touchStart(e) {
                  const i = this;
                  return i.touchStartTime = /* @__PURE__ */ new Date(), i.isTouchMoved = !0, i.handleDown(e);
                }
                mouseUp(e) {
                  const i = this;
                  if (!(i.isReleased || i.touchEndTime && /* @__PURE__ */ new Date() - i.touchEndTime < 500)) return i.handleUp(e);
                }
                handleDown(e) {
                  const i = this;
                  i.isReleased = !1, i.isPressed = !0;
                  const a = i.createEvent(e, "down");
                  return (i.handlers.tap || i.handlers.taphold) && i.initTap(a), (i.handlers.swipeleft || i.handlers.swiperight || i.handlers.swipetop || i.handlers.swipebottom) && i.initSwipe(a), i.down(a);
                }
                handleUp(e) {
                  const i = this;
                  i.isReleased = !0, i.isPressed = !1;
                  const a = i.createEvent(e, "up"), n = i.up(a);
                  return (i.handlers.tap || i.handlers.taphold) && i.fireTap(a), i.resetSwipe(a), n;
                }
                handleMove(e) {
                  const i = this;
                  let a = i.move(e);
                  return i.isPressed && (i._maxSwipeVerticalDistance = Math.max(i._maxSwipeVerticalDistance, Math.abs(i._startY - e.pageY)), i._maxSwipeHorizontalDistance = Math.max(i._maxSwipeHorizontalDistance, Math.abs(i._startX - e.pageX)), a = i.handleSwipeEvents(e)), a;
                }
                touchEnd(e) {
                  return this.touchEndTime = /* @__PURE__ */ new Date(), this.handleUp(e);
                }
                pointerUp(e) {
                  return this.handleUp(e);
                }
                pointerCancel(e) {
                  this.pointerUp(e);
                }
                touchCancel(e) {
                  this.touchEnd(e);
                }
                mouseLeave() {
                  this.isInBounds = !1;
                }
                mouseMove(e) {
                  if (!this.isTouchMoved) return this.handleMove(e);
                }
                pointerMove(e) {
                  return this.handleMove(e);
                }
                touchMove(e) {
                  const i = this, a = e.touches, n = e.changedTouches, r = a && a.length ? a[0] : n && n.length ? n[0] : void 0;
                  for (let s = 0; s < i.inputEventProperties.length; s++) {
                    const o = i.inputEventProperties[s];
                    e[o] === void 0 && (e[o] = r[o]);
                  }
                  return i.isTouchMoved = !0, i.handleMove(e);
                }
                handleSwipeEvents(e) {
                  const i = this;
                  let a = !0;
                  return (i.handlers.swipetop || i.handlers.swipebottom) && (a = this.handleVerticalSwipeEvents(e)), a === !1 || (i.handlers.swipeleft || i.handlers.swiperight) && (a = this.handleHorizontalSwipeEvents(e)), a;
                }
                handleVerticalSwipeEvents(e) {
                  let i, a;
                  return i = e.pageY, a = i - this._startY, this.swiped(e, a, "vertical");
                }
                handleHorizontalSwipeEvents(e) {
                  let i, a;
                  return i = e.pageX, a = i - this._startX, this.swiped(e, a, "horizontal");
                }
                swiped(e, i, a) {
                  const n = this;
                  if (a = a || 0, Math.abs(i) >= n.swipeMin && !n._swipeEvent && !n._swipeLocked) {
                    let r = i < 0 ? "swipeleft" : "swiperight";
                    if (a === "horizontal" ? n._swipeEvent = n.createEvent(e, r) : (r = i < 0 ? "swipetop" : "swipebottom", n._swipeEvent = n.createEvent(e, i < 0 ? "swipetop" : "swipebottom")), n[r] && (n[r](this._swipeEvent), Math.abs(i) <= this.swipeMax)) return e.stopImmediatePropagation(), !1;
                  }
                  return !0;
                }
                resetSwipe() {
                  this._swipeEvent = null, clearTimeout(this._swipeTimeout);
                }
                initSwipe(e) {
                  const i = this;
                  i._maxSwipeVerticalDistance = 0, i._maxSwipeHorizontalDistance = 0, i._startX = e.pageX, i._startY = e.pageY, i._swipeLocked = !1, i._swipeEvent = null, i._swipeTimeout = setTimeout((function() {
                    i._swipeLocked = !0;
                  }), i.swipeDelay);
                }
              }
              class Scroll {
                get scrollWidth() {
                  const e = this;
                  return e.horizontalScrollBar ? e.horizontalScrollBar.max : -1;
                }
                set scrollWidth(e) {
                  const i = this;
                  e < 0 && (e = 0), i.horizontalScrollBar && (i.horizontalScrollBar.max = e);
                }
                get scrollHeight() {
                  const e = this;
                  return e.verticalScrollBar ? e.verticalScrollBar.max : -1;
                }
                set scrollHeight(e) {
                  const i = this;
                  e < 0 && (e = 0), i.verticalScrollBar && (i.verticalScrollBar.max = e);
                }
                get scrollLeft() {
                  const e = this;
                  return e.horizontalScrollBar ? e.horizontalScrollBar.value : -1;
                }
                set scrollLeft(e) {
                  const i = this;
                  e < 0 && (e = 0), i.horizontalScrollBar && (i.horizontalScrollBar.value = e);
                }
                get scrollTop() {
                  const e = this;
                  return e.verticalScrollBar ? e.verticalScrollBar.value : -1;
                }
                set scrollTop(e) {
                  const i = this;
                  e < 0 && (e = 0), i.verticalScrollBar && (i.verticalScrollBar.value = e);
                }
                get vScrollBar() {
                  return this.verticalScrollBar;
                }
                get hScrollBar() {
                  return this.horizontalScrollBar;
                }
                constructor(e, i, a) {
                  const n = this;
                  n.container = e, n.horizontalScrollBar = i, n.verticalScrollBar = a, n.disableSwipeScroll = !1, e.disableSwipeScroll !== void 0 && (n.disableSwipeScroll = e.disableSwipeScroll), n.listen();
                }
                listen() {
                  const e = this, i = Core.isMobile, a = e.horizontalScrollBar, n = e.verticalScrollBar;
                  e.inputEvents = new InputEvents(e.container);
                  let r, s, o, l, c, m, u, p;
                  const h = function(w) {
                    return { amplitude: 0, delta: 0, initialValue: 0, min: 0, max: w.max, previousValue: 0, pointerPosition: 0, targetValue: 0, scrollBar: w, value: 0, velocity: 0 };
                  }, g = h(a), f = h(n), b = function() {
                    const w = e.container.touchVelocityCoefficient || 50;
                    m = Date.now(), u = m - l, l = m;
                    const S = function(v) {
                      v.delta = v.value - v.previousValue, v.previousValue = v.value;
                      let T = w * v.delta / (1 + u);
                      v.velocity = 0.8 * T + 0.2 * v.velocity;
                    };
                    S(f), S(g);
                  }, y = function(w) {
                    return p.value = w > p.max ? p.max : w < p.min ? p.min : w, p.scrollBar.value = p.value, w > p.max ? "max" : w < p.min ? "min" : "value";
                  };
                  function _() {
                    let w, S;
                    p.amplitude && (e.container.$.fireEvent("kineticScroll"), w = Date.now() - l, S = -p.amplitude * Math.exp(-w / 500), S > 5 || S < -5 ? (y(p.targetValue + S), cancelAnimationFrame(s), s = 0, s = requestAnimationFrame(_)) : y(p.targetValue));
                  }
                  let x;
                  e.inputEvents.down((function(w) {
                    if (!i) return;
                    const S = w.originalEvent.target, v = S && S.closest ? S.closest("smart-scroll-bar") : void 0;
                    if (v === e.horizontalScrollBar || v === e.verticalScrollBar) return;
                    o = !0, r = !1;
                    const T = function(k, M) {
                      k.amplitude = 0, k.pointerPosition = M, k.previousValue = k.value, k.value = k.scrollBar.value, k.initialValue = k.value, k.max = k.scrollBar.max;
                    };
                    T(f, w.clientY), T(g, w.clientX), l = Date.now(), clearInterval(c), c = setInterval(b, 500);
                  })), e.inputEvents.up((function() {
                    if (!o) return !0;
                    if (clearInterval(c), e.disableSwipeScroll) return void (o = !1);
                    const w = function(S) {
                      p = S, S.amplitude = 0.8 * S.velocity, S.targetValue = Math.round(S.value + S.amplitude), l = Date.now(), cancelAnimationFrame(s), s = requestAnimationFrame(_), S.velocity = 0;
                    };
                    f.velocity > 10 || f.velocity < -10 ? w(f) : (g.velocity > 10 || g.velocity < -10) && w(g), o = !1;
                  })), e.inputEvents.move((function(w) {
                    if (!o) return !0;
                    if (e.disableSwipeScroll || (r && (w.originalEvent.preventDefault(), w.originalEvent.stopPropagation()), g.visible = e.scrollWidth > 0, f.visible = e.scrollHeight > 0, !o || !g.visible && !f.visible)) return;
                    const S = e.container.touchScrollRatio, v = e.container;
                    let T, k;
                    S && (typeof S == "number" ? (T = -S, k = -S) : typeof S == "function" && (T = S(f.max, v.offsetHeight), k = S(g.max, v.offsetWidth))), f.ratio = T || -f.max / v.offsetHeight, f.delta = (w.clientY - f.pointerPosition) * f.ratio, g.ratio = k || -g.max / v.offsetWidth, g.delta = (w.clientX - g.pointerPosition) * g.ratio;
                    let M = "value";
                    const P = function(C, N, A) {
                      return C.delta > 5 || C.delta < -5 ? (p = C, M = C.initialValue + C.delta > p.max ? "max" : C.initialValue + C.delta < p.min ? "min" : "value", M === "min" && C.initialValue === 0 || M === "max" && C.initialValue === C.max || !C.visible || (e.container.$.fireEvent("kineticScroll"), y(C.initialValue + C.delta), b(), A.originalEvent.preventDefault(), A.originalEvent.stopPropagation(), r = !0, !1)) : null;
                    };
                    let D = P(f, w.clientY, w);
                    if (D !== null) return D;
                    {
                      let C = P(g, w.clientX, w);
                      if (C !== null) return C;
                    }
                  })), e.scrollTo = function(w, S) {
                    const v = S === !1 ? g : f;
                    let T = !1;
                    l || (l = Date.now()), x || (x = Date.now()), Math.abs(Date.now() - x) > 375 ? l = Date.now() : T = !0, x = Date.now(), v.value = v.scrollBar.value, v.delta = w - v.value, v.max = v.scrollBar.max, w <= v.min && (w = v.min), w >= v.max && (w = v.max), v.targetValue = w;
                    const k = w;
                    let M = v.value;
                    v.velocity = 100 * v.delta / (1 + v.max), v.from = M;
                    const P = function(C) {
                      return v.value = C > v.max ? v.max : C < v.min ? v.min : C, v.scrollBar.value = v.value, C > v.max ? "max" : C < v.min ? "min" : "value";
                    }, D = function() {
                      let C, N = Date.now() - x, A = Math.min(1e3, Date.now() - l), B = v.velocity * Math.exp(A / 175);
                      if (T) (B < 0 && v.value <= w || B > 0 && v.value >= w) && (B = 0), (v.value + B <= v.min || v.value + B >= v.max) && (B = 0), B > 0.5 || B < -0.5 ? (P(v.value + B), cancelAnimationFrame(s), s = 0, s = requestAnimationFrame(D)) : P(v.targetValue);
                      else {
                        if (N >= 175) return cancelAnimationFrame(s), e.container.$.fireEvent("kineticScroll"), void (s = 0);
                        C = Utilities.Animation.Easings.easeInSine(N, M, k - M, 175), P(C), cancelAnimationFrame(s), s = 0, s = requestAnimationFrame(D);
                      }
                    };
                    cancelAnimationFrame(s), s = requestAnimationFrame(D);
                  }, e.inputEvents.listen();
                }
                unlisten() {
                  const e = this;
                  e.inputEvents && e.inputEvents.unlisten(), delete e.inputEvents;
                }
              }
              class Extend {
                constructor(e) {
                  this.events = {}, this.handlers = {}, this.element = e;
                }
                hasClass(e) {
                  const i = this, a = e.split(" ");
                  for (let n = 0; n < a.length; n++)
                    if (!i.element.classList.contains(a[n])) return !1;
                  return !0;
                }
                addClass(e) {
                  const i = this;
                  if (i.hasClass(e)) return;
                  const a = e.split(" ");
                  for (let n = 0; n < a.length; n++) i.element.classList.add(a[n]);
                  i.isNativeElement || StyleObserver.observeElement(i.element);
                }
                removeClass(e) {
                  const i = this;
                  if (arguments.length === 0) return void i.element.removeAttribute("class");
                  const a = e.split(" ");
                  for (let n = 0; n < a.length; n++) i.element.classList.remove(a[n]);
                  i.element.className === "" && i.element.removeAttribute("class"), i.isNativeElement || StyleObserver.observeElement(i.element);
                }
                get isCustomElement() {
                  const e = this;
                  return !!e.element.tagName.startsWith(namespace) || e.element instanceof window[namespace].BaseElement || e.element.tagName !== "DIV" && e.element.tagName !== "SPAN" && e.element.tagName !== "BUTTON" && e.element.tagName !== "INPUT" && e.element.tagName !== "UL" && e.element.tagName !== "LI" && document.createElement(e.element.nodeName) instanceof window[namespace].BaseElement;
                }
                get isNativeElement() {
                  return !this.isCustomElement;
                }
                dispatch(e) {
                  const i = this, a = i.events[e.type];
                  let n = !1;
                  if (a.length > 1) for (let r = 0; r < a.length; r++) {
                    const s = a[r];
                    if (s.namespace && s.namespace.indexOf("_") >= 0) {
                      n = !0;
                      break;
                    }
                  }
                  n && a.sort((function(r, s) {
                    let o = r.namespace, l = s.namespace;
                    return o = o.indexOf("_") === -1 ? 0 : parseInt(o.substring(o.indexOf("_") + 1)), l = l.indexOf("_") === -1 ? 0 : parseInt(l.substring(l.indexOf("_") + 1)), o < l ? -1 : o > l ? 1 : 0;
                  }));
                  for (let r = 0; r < a.length; r++) {
                    const s = a[r];
                    if (e.namespace = s.namespace, e.context = s.context, e.defaultPrevented) break;
                    const o = s.handler.apply(i.element, [e]);
                    if (o !== void 0 && (e.result = o, o === !1)) {
                      e.preventDefault(), e.stopPropagation();
                      break;
                    }
                  }
                  return e.result;
                }
                fireEvent(e, i, a) {
                  const n = this;
                  a || (a = { bubbles: !0, cancelable: !0, composed: n.element.getRootNode().host !== null }), a.detail = i || {};
                  const r = new CustomEvent(e, a);
                  if (r.originalStopPropagation = r.stopPropagation, r.stopPropagation = function() {
                    return r.isPropagationStopped = !0, r.originalStopPropagation();
                  }, n.dispatchEvent(r), window[namespace].isVue) {
                    const s = Utilities.Core.toDash(e);
                    if (s !== e) {
                      const o = new CustomEvent(s, a);
                      o.originalStopPropagation = r.stopPropagation, o.stopPropagation = function() {
                        return o.isPropagationStopped = !0, o.originalStopPropagation();
                      }, n.dispatchEvent(o);
                    }
                  }
                  return r;
                }
                get isPassiveSupported() {
                  const e = this;
                  if (e.supportsPassive !== void 0) return e.supportsPassive;
                  e.supportsPassive = !1;
                  try {
                    let i = Object.defineProperty({}, "passive", { get: function() {
                      e.supportsPassive = !0;
                    } });
                    window.addEventListener("testPassive", null, i), window.removeEventListener("testPassive", null, i);
                  } catch {
                  }
                  return e.supportsPassive;
                }
                dispatchEvent(e) {
                  const i = this, a = e.type, n = i.element.context, r = a.substring(0, 1).toUpperCase() + a.substring(1);
                  i.element.context = document, i.element["on" + r] ? i.element["on" + r](e) : i.element["on" + a.toLowerCase()] ? i.element["on" + a.toLowerCase()](e) : i.element.dispatchEvent(e), i.element.context = n;
                }
                listen(e, i) {
                  const a = this, n = e.split("."), r = n.slice(1).join("."), s = n[0];
                  a.events[s] || (a.events[s] = []);
                  const o = { type: s, handler: i, context: a.element, namespace: r };
                  inputEventTypes.indexOf(s) >= 0 && (a.inputEvents || (a.inputEvents = new InputEvents(a.element)), a.inputEvents[s]((function(l) {
                    a.dispatchEvent(l);
                  })), a.inputEvents.boundEventTypes.push(s), a.inputEvents.listen(s)), a.events[s].length === 0 && (a.handlers[s] = a.dispatch.bind(a), s === "wheel" ? a.element.addEventListener("wheel", a.handlers[s], !!a.isPassiveSupported && { passive: !1 }) : s === "touchmove" || s === "touchstart" || s === "touchend" ? a.element.addEventListener(s, a.handlers[s], !!a.isPassiveSupported && { passive: !1 }) : a.element.addEventListener(s, a.handlers[s], !1)), a.events[s].push(o);
                }
                unlisten(e) {
                  const i = this, a = e.split("."), n = a.slice(1).join("."), r = a[0];
                  let s = i.events[r];
                  if (i.inputEvents && i.inputEvents.boundEventTypes.indexOf(r) >= 0 && (i.inputEvents.boundEventTypes.splice(i.inputEvents.boundEventTypes.indexOf(r), 1), i.inputEvents.boundEventTypes.length === 0 && i.inputEvents.unlisten(r)), s) {
                    for (let o = 0; o < s.length; o++) {
                      if (n !== "") {
                        let l = s.findIndex(((c) => c.namespace === n));
                        s.splice(l, 1);
                        break;
                      }
                      s = [];
                    }
                    s.length === 0 && (i.element.removeEventListener(r, i.handlers[r]), i.events[r] = [], delete i.handlers[r]);
                  }
                }
                getAttributeValue(e, i) {
                  const a = this, n = a.element.getAttribute(e);
                  if (a.isNativeElement) return a.deserialize(n, i);
                  const r = a.element.propertyByAttributeName[e];
                  return r.deserialize === void 0 ? a.deserialize(n, i, r.nullable) : a.element[r.deserialize](n);
                }
                setAttributeValue(e, i, a) {
                  const n = this;
                  let r, s = !1;
                  if (n.isNativeElement) {
                    if (r = n.serialize(i, a), a === "boolean" && ["checked", "selected", "async", "autofocus", "autoplay", "controls", "defer", "disabled", "hidden", "ismap", "loop", "multiple", "open", "readonly", "required", "scoped"].indexOf(e) >= 0)
                      return void (i ? n.element.setAttribute(e, "") : n.element.removeAttribute(e));
                  } else {
                    const o = n.element.propertyByAttributeName[e];
                    s = !o || o.nullable, r = o && o.serialize ? n.element[o.serialize](i) : n.serialize(i, a, s);
                  }
                  a !== "array" && a !== "object" || r !== "[]" && r !== "{}" ? r === void 0 ? (n.element.removeAttribute(e), n.element.shadowRoot && n.element.$.root && n.element.$.root.removeAttribute(e)) : (n.element.setAttribute(e, r), n.element.shadowRoot && n.element.$.root && n.element.$.root.setAttribute(e, r)) : n.element.removeAttribute(e);
                }
                serialize(e, i, a) {
                  if (i === void 0 && (i = Utilities.Types.getType(e)), !(e === void 0 || !a && e === null)) {
                    if (a && e === null) return "null";
                    if (i === "string") return e;
                    if (i === "boolean" || i === "bool") {
                      if (e === !0 || e === "true" || e === 1 || e === "1") return "";
                      if (e === !1 || e === "false" || e === 0 || e === "0") return;
                    }
                    return i === "array" ? JSON.stringify(e) : ["string", "number", "int", "integer", "float", "date", "any", "function"].indexOf(i) >= 0 ? e.toString() : i === "object" ? JSON.stringify(e) : void 0;
                  }
                }
                deserialize(e, i, a) {
                  const n = e === "null";
                  if (e !== void 0 && (!n || a)) {
                    if (n && a) return null;
                    if (i === "boolean" || i === "bool") return e !== null;
                    if (i === "number" || i === "float") return e === "NaN" ? NaN : e === "Infinity" ? 1 / 0 : e === "-Infinity" ? -1 / 0 : parseFloat(e);
                    if (i === "int" || i === "integer") return e === "NaN" ? NaN : e === "Infinity" ? 1 / 0 : e === "-Infinity" ? -1 / 0 : parseInt(e);
                    if (i === "string" || i === "any") return e;
                    if (i === "date") return new Date(e);
                    if (i === "function") {
                      if (typeof window[e] == "function") return window[e];
                    } else if (i === "array" || i === "object") try {
                      const r = JSON.parse(e);
                      if (r) return r;
                    } catch {
                      if (window[e] && typeof window[e] == "object") return window[e];
                      if (i === "object" && e.indexOf("{") >= 0) {
                        let s = (e = e.replace(/{/gi, "").replace(/}/gi, "").replace("[", "").replace("]", "").replace(/'/gi, "").replace(/"/gi, "").trim()).trim().split(","), o = {};
                        for (let l = 0; l < s.length; l++) {
                          const c = s[l].split(":")[0].trim(), m = s[l].split(":")[1].trim();
                          o[c] = m;
                        }
                        return o;
                      }
                      if (i === "array" && e.indexOf("[") >= 0) {
                        if (e.indexOf("{") >= 0) {
                          let s = e.replace(/{/gi, "").replace("[", "").replace("]", "").replace(/'/gi, "").replace(/"/gi, "").trim();
                          s = s.split("},");
                          for (let o = 0; o < s.length; o++) {
                            let l = {}, c = s[o].trim().split(",");
                            for (let m = 0; m < c.length; m++) {
                              const u = c[m].split(":")[0].trim(), p = c[m].split(":")[1].trim();
                              l[u] = p;
                            }
                            s[o] = l;
                          }
                          return s;
                        }
                        return e.replace("[", "").replace("]", "").replace(/'/gi, "").replace(/"/gi, "").trim().split(",");
                      }
                    }
                  }
                }
              }
              class Animation {
                static get Ripple() {
                  return Ripple;
                }
                static get Easings() {
                  return Easings;
                }
              }
              class Utilities {
                static get Types() {
                  return Types;
                }
                static get Core() {
                  return Core;
                }
                static get Animation() {
                  return Animation;
                }
                static get Scroll() {
                  return Scroll;
                }
                static get InputEvents() {
                  return InputEvents;
                }
                static Extend(e) {
                  return new Extend(e);
                }
                static Assign(e, i) {
                  if (e.indexOf(".") >= 0) {
                    const a = e.split(".");
                    return Utilities[a[0]] || (Utilities[a[0]] = {}), void (Utilities[a[0]][a[1]] = i);
                  }
                  Utilities[e] = i;
                }
              }
              const $document = Utilities.Extend(document);
              let observerTimer = null;
              document.addEventListener("click", (() => {
                StyleObserver.start(), observerTimer && clearTimeout(observerTimer), observerTimer = setTimeout((() => {
                  StyleObserver.stop();
                }), 1e4);
              })), document.addEventListener("mouseenter", (() => {
                StyleObserver.start();
              })), document.addEventListener("mouseleave", (() => {
                StyleObserver.stop();
              }));
              class BindingModule {
              }
              BindingModule.cache = {};
              class BaseElement extends HTMLElement {
                static get properties() {
                  return { appendTo: { value: "", type: "string" }, animation: { value: "advanced", type: "string", allowedValues: ["none", "simple", "advanced"] }, unfocusable: { value: !1, type: "boolean" }, disabled: { value: !1, type: "boolean" }, dataContext: { value: null, reflectToAttribute: !1, type: "any" }, debugMode: { value: !0, type: "boolean", reflectToAttribute: !1 }, unlockKey: { value: "", type: "string", reflectToAttribute: !1 }, locale: { value: "en", type: "string", reflectToAttribute: !1 }, localizeFormatFunction: { value: null, type: "any", reflectToAttribute: !1 }, messages: { value: { en: { propertyUnknownName: "Invalid property name: '{{name}}'!", propertyUnknownType: "'{{name}}' property is with undefined 'type' member!", propertyInvalidValue: "Invalid '{{name}}' property value! Actual value: '{{actualValue}}', Expected value: '{{value}}'!", propertyInvalidValueType: "Invalid '{{name}}' property value type! Actual type: '{{actualType}}', Expected type: '{{type}}'!", methodInvalidValueType: "Invalid '{{name}}' method argument value type! Actual type: '{{actualType}}', Expected type: '{{type}}' for argument with index: '{{argumentIndex}}'!", methodInvalidArgumentsCount: "Invalid '{{name}}' method arguments count! Actual arguments count: '{{actualArgumentsCount}}', Expected at least: '{{argumentsCount}}' argument(s)!", methodInvalidReturnType: "Invalid '{{name}}' method return type! Actual type: '{{actualType}}', Expected type: '{{type}}'!", elementNotInDOM: "Element does not exist in DOM! Please, add the element to the DOM, before invoking a method.", moduleUndefined: "Module is undefined.", missingReference: "{{elementType}}: Missing reference to '{{files}}'.", htmlTemplateNotSuported: "{{elementType}}: Web Browser doesn't support HTMLTemplate elements.", invalidTemplate: "{{elementType}}: '{{property}}' property accepts a string that must match the id of an HTMLTemplate element from the DOM." } }, reflectToAttribute: !1, inherit: !0, type: "object" }, props: { value: null, reflectToAttribute: !1, isHierarchicalProperty: !0, type: "any" }, readonly: { value: !1, type: "boolean" }, renderMode: { value: "auto", type: "string", reflectToAttribute: !1, allowedValues: ["auto", "manual"] }, rightToLeft: { value: !1, type: "boolean" }, rethrowError: { value: !0, type: "boolean", reflectToAttribute: !1 }, theme: { value: window[namespace].Theme, type: "string" }, visibility: { value: "visible", allowedValues: ["visible", "collapsed", "hidden"], type: "string" }, wait: { value: !1, type: "boolean" } };
                }
                getBindings(t, e) {
                  const i = this;
                  let a = 0, n = {}, r = ((s) => {
                    if (s instanceof HTMLElement) return i.parseAttributes(s);
                    {
                      let o = i.parseProperty(s.data ? s.data.trim() : null, "textContent", s);
                      if (o) return i && s.parentNode === i.$.content && (o.value = i.$.html !== "" ? i.$.html : void 0, i.innerHTML = ""), { textContent: o };
                    }
                  })(t);
                  r && (n.data = r), e || (n.mapping = [], e = n), t.getAttribute && (n.nodeId = t.getAttribute("smart-id"), e && r && (e.mapping[n.nodeId] = r)), n.node = t, t.firstChild && (n.children = {});
                  for (let s = t.firstChild; s; s = s.nextSibling) n.children[a++] = i.getBindings(s, e);
                  return n;
                }
                _addRemovePropertyBinding(t, e, i, a, n) {
                  if (!t || !e || !i) return;
                  const r = this, s = r.bindings, o = i.getAttribute("smart-id"), l = t.indexOf("{{") >= 0;
                  let c = !1;
                  (t = t.replace("{{", "").replace("}}", "").replace("[[", "").replace("]]", "")).indexOf("!") >= 0 && (t = t.replace("!", ""), c = !0);
                  const m = r._properties[t], u = { name: t, reflectToAttribute: m.reflectToAttribute, twoWay: l, type: m.type, not: c };
                  if (n && !a) {
                    const h = {}, g = { name: t, targetPropertyName: e, reflectToAttribute: m.reflectToAttribute, twoWay: l, type: m.type, not: c };
                    h[t] = g, s.mapping[o] = h;
                  }
                  const p = function(h) {
                    for (let g in h) {
                      const f = h[g];
                      if (f.nodeId === o) {
                        f.data || (f.data = {}), a ? (f.data[e] = null, delete f.data[e]) : f.data[e] = u;
                        break;
                      }
                      if (f.children) p(f.children);
                      else if (f.node && f.node.children && f.node === i.parentElement) {
                        const b = f.node;
                        if (!b.firstChild) continue;
                        f.children = {};
                        let y = 0;
                        for (let _ = b.firstChild; _; _ = _.nextSibling) f.children[y++] = r.getBindings(_);
                        p(f.children);
                      }
                    }
                  };
                  p(s.children), a ? delete r.boundProperties[t] : r.boundProperties[t] = !0, r.updateBoundNodes(t);
                }
                addPropertyBinding(t, e, i, a) {
                  this._addRemovePropertyBinding(t, e, i, !1, a);
                }
                removePropertyBinding(t, e, i, a) {
                  this._addRemovePropertyBinding(t, e, i, !0, a);
                }
                parseAttributes(t) {
                  const e = this;
                  let i;
                  for (let a = 0; a < t.attributes.length; a++) {
                    const n = t.attributes[a], r = n.name, s = n.value;
                    BindingModule.cache["toCamelCase" + r] || (BindingModule.cache["toCamelCase" + r] = Utilities.Core.toCamelCase(r));
                    const o = BindingModule.cache["toCamelCase" + r];
                    if (r.indexOf("(") >= 0) {
                      let c = r.substring(1, r.length - 1);
                      if (e && !e.dataContext) {
                        e.templateListeners[t.getAttribute("smart-id") + "." + c] = s, t.removeAttribute(r);
                        continue;
                      }
                      {
                        i || (i = {});
                        const m = s.substring(0, s.indexOf("("));
                        i[o] = { isEvent: !0, name: c, value: m };
                        continue;
                      }
                    }
                    let l = e.parseProperty(s, r, t);
                    l && (i || (i = {}), i[o] = l);
                  }
                  return i;
                }
                parseProperty(t, e) {
                  if (!t || !t.length) return;
                  const i = this;
                  let a, n = t.length, r = 0, s = 0, o = 0, l = !0;
                  for (; s < n; ) {
                    r = t.indexOf("{{", s);
                    let u = t.indexOf("[[", s), p = "}}";
                    if (u >= 0 && (r < 0 || u < r) && (r = u, l = !1, p = "]]"), o = r < 0 ? -1 : t.indexOf(p, r + 2), o < 0) return;
                    a = a || {};
                    let h = t.slice(r + 2, o).trim();
                    a.name = h, s = o + 2;
                  }
                  const c = a.name, m = i ? i._properties[c] : null;
                  return a.twoWay = l, a.ready = !1, i && (c.indexOf("::") >= 0 ? i.boundProperties[c.substring(0, c.indexOf("::"))] = !0 : i.boundProperties[c] = !0), m ? (a.type = m.type, a.reflectToAttribute = m.reflectToAttribute) : (["checked", "selected", "async", "autofocus", "autoplay", "controls", "defer", "disabled", "hidden", "ismap", "loop", "multiple", "open", "readonly", "required", "scoped"].indexOf(e) >= 0 ? a.type = "boolean" : a.type = "string", a.reflectToAttribute = !0), a;
                }
                updateTextNodes() {
                  const t = this;
                  t.updateTextNode(t.shadowRoot || t, t.bindings, t);
                }
                updateTextNode(t, e, i) {
                  const a = this;
                  if (!e) return;
                  let n = 0;
                  for (let r = t.firstChild; r && e.children; r = r.nextSibling) a.updateTextNode(r, e.children[n++], i);
                  if (e && e.data) for (let r in e.data) {
                    const s = e.data[r], o = s.name;
                    r === "textContent" && s.twoWay && !s.updating && s.value !== void 0 && (i[o] = s.value);
                  }
                }
                updateBoundProperty(t, e) {
                  if (e.updating) return;
                  const i = this;
                  e.updating = !0, i[t] = e.value, e.updating = !1;
                }
                updateBoundNodes(t) {
                  const e = this;
                  if (e.updateBoundNode(e.shadowRoot || e, e.bindings, e, t), e.detachedChildren.length > 0) for (let i = 0; i < e.detachedChildren.length; i++) {
                    const a = e.detachedChildren[i], n = a.getAttribute("smart-id"), r = function(o) {
                      if (o.nodeId === n) return o;
                      for (let l in o.children) {
                        const c = o.children[l];
                        if ((c.getAttribute ? c.getAttribute("smart-id") : "") === n) return o;
                        if (c.children) {
                          const m = r(c);
                          if (m) return m;
                        }
                      }
                      return null;
                    }, s = r(e.bindings);
                    if (s) e.updateBoundNode(a, s, e, t, !0);
                    else if (a.getAttribute && e.bindings.mapping) {
                      const o = e, l = e.bindings;
                      if (l) for (let c in l.mapping) {
                        const m = o.querySelector('[smart-id="' + c + '"]');
                        if (m) {
                          const u = l.mapping[c];
                          e.updateBoundData(m, u, o, t);
                        }
                      }
                    }
                  }
                }
                updateBoundMappedNodes() {
                  const t = this, e = t.bindings, i = t;
                  if (e.mapping) for (let a in e.mapping) {
                    let n = i.querySelector('[smart-id="' + a + '"]');
                    if (i.shadowRoot && (n = i.querySelector('[id="' + a + '"]'), n || (n = i.shadowRoot.querySelector('[id="' + a + '"]') || i.shadowRoot.querySelector('[smart-id="' + a + '"]'))), n) {
                      const r = e.mapping[a];
                      t.updateBoundData(n, r, i);
                    } else if (i.getAttribute("aria-controls")) {
                      let r = document.getElementById(i.getAttribute("aria-controls"));
                      if (!r && i.shadowRoot && (r = i.shadowRoot.getElementById(i.getAttribute("aria-controls"))), n = r.querySelector('[smart-id="' + a + '"]'), n) {
                        const s = e.mapping[a];
                        t.updateBoundData(n, s, i);
                      }
                    }
                  }
                }
                updateBoundNode(t, e, i, a, n) {
                  const r = this;
                  if (!e) return;
                  let s = 0;
                  if (n) {
                    if (n && !e.data) for (let l = t.firstChild; l && e.children; l = l.nextSibling) if (l.getAttribute) {
                      const c = l.getAttribute("smart-id"), m = (function() {
                        for (let u in e.children) if (e.children[u].nodeId === c) return e.children[u];
                      })();
                      r.updateBoundNode(l, m, i, a), s++;
                    } else r.updateBoundNode(l, e.children[s++], i, a, n);
                  } else for (let l = t.firstChild; l && e.children; l = l.nextSibling) if (l.getAttribute) {
                    const c = l.getAttribute("smart-id"), m = (function() {
                      for (let u in e.children) if (e.children[u].nodeId === c) return e.children[u];
                    })();
                    r.updateBoundNode(l, m, i, a), s++;
                  } else r.updateBoundNode(l, e.children[s++], i, a);
                  if (!e || !e.data) return;
                  const o = e.data;
                  r.updateBoundData(t, o, i, a);
                }
                updateBoundData(t, e, i, a) {
                  const n = this;
                  for (let r in e) {
                    const s = e[r];
                    let o = s.name;
                    if (!s.updating && (o.indexOf("::") >= 0 && (o = o.substring(0, o.indexOf("::"))), a === void 0 || a === o)) {
                      if (o.indexOf("(") >= 0) {
                        let l = o.substring(o.indexOf("("));
                        const c = o.substring(0, o.indexOf("("));
                        if (l = l.substring(1, l.length - 1), l = l.replace(/ /gi, ""), l = l.split(","), l.length > 0 && l[0] !== "") {
                          let m = [];
                          for (let u = 0; u < l.length; u++) m.push(i[l[u]]);
                          s.value = i[c].apply(i, m);
                        } else s.value = i[c]();
                        s.type = typeof s.value;
                      } else s.value = i[o];
                      if (o === "innerHTML") {
                        if (t[r].toString().trim() !== i[o].toString().trim()) {
                          if (window.smartBlazor && t[r].indexOf("<!--") >= 0) {
                            (s.ready || i._properties[o].defaultValue !== s.value) && (t[r] = s.value.toString());
                            continue;
                          }
                          (s.ready || i._properties[o].defaultValue !== s.value) && (t[r] = s.value.toString().trim());
                        }
                      } else s.not ? (t[r] = !s.value, s.targetPropertyName && (t[s.targetPropertyName] = !s.value)) : (t[r] = s.value, s.targetPropertyName && (t[s.targetPropertyName] = s.value));
                      if (t.$ && t.$.isNativeElement) {
                        BindingModule.cache["toDash" + r] || (BindingModule.cache["toDash" + r] = Utilities.Core.toDash(r));
                        const l = BindingModule.cache["toDash" + r], c = t.$.getAttributeValue(l, s.type);
                        !s.reflectToAttribute || c === s.value && s.ready || t.$.setAttributeValue(l, s.value, s.type), s.reflectToAttribute || t.$.setAttributeValue(l, null, s.type);
                      }
                      if (!s.ready) {
                        if (t.$ && t.$.isCustomElement) {
                          BindingModule.cache["toDash" + r] || (BindingModule.cache["toDash" + r] = Utilities.Core.toDash(r));
                          const l = BindingModule.cache["toDash" + r];
                          t._properties || (t._beforeCreatedProperties = t._properties = t.propertyByAttributeName = []), t._properties[r] || (t._properties[r] = { attributeName: l }, t._beforeCreatedProperties && (t._beforeCreatedProperties[r] = t._properties[r]), t.propertyByAttributeName[l] = t._properties[r]);
                          const c = t._properties[r];
                          c.isUpdating = !0, s.reflectToAttribute && (s.not ? t.$.setAttributeValue(c.attributeName, !s.value, s.type) : t.$.setAttributeValue(c.attributeName, s.value, s.type)), s.reflectToAttribute || t.$.setAttributeValue(c.attributeName, null, s.type), c.isUpdating = !1;
                        }
                        if (s.twoWay) {
                          const l = function(c) {
                            if (s.value = c, t.$ && t.$.isNativeElement) {
                              BindingModule.cache["toDash" + r] || (BindingModule.cache["toDash" + r] = Utilities.Core.toDash(r));
                              const m = BindingModule.cache["toDash" + r], u = t.$.getAttributeValue(m, s.type);
                              s.reflectToAttribute && u !== s.value && t.$.setAttributeValue(m, s.value, s.type), s.reflectToAttribute || t.$.setAttributeValue(m, null, s.type);
                            }
                          };
                          if (s.name.indexOf("::") >= 0) {
                            const c = s.name.indexOf("::"), m = s.name.substring(c + 2);
                            n["$" + t.getAttribute("smart-id")].listen(m, (function() {
                              l(t[r]);
                              const u = s.name.substring(0, s.name.indexOf("::"));
                              n.updateBoundProperty(u, s);
                            }));
                          }
                          if (t.$ && t.$.isCustomElement) {
                            t._properties[r] && (t._properties[r].notify = !0), BindingModule.cache["toDash" + r] || (BindingModule.cache["toDash" + r] = Utilities.Core.toDash(r));
                            const c = BindingModule.cache["toDash" + r];
                            n["$" + t.getAttribute("smart-id")].listen(c + "-changed", (function(m) {
                              let u = m.detail;
                              l(u.value);
                              const p = n.context;
                              m.context !== document && (n.context = n), n.updateBoundProperty(s.name, s), n.context = p;
                            }));
                          }
                        }
                      }
                      s.ready = !0;
                    }
                  }
                }
                static clearCache() {
                  this.cache = {};
                }
                addMessages(t, e) {
                  Object.assign(this.messages[t], e);
                }
                setLocale(t, e) {
                  const i = this;
                  i.messages = i.messages || {}, i.messages[t] = { ...i.messages[t] || {}, ...e }, i.locale = t;
                }
                localize(t, e) {
                  const i = this;
                  if (!i.messages || !i.messages[i.locale]) return;
                  let a = i.messages[i.locale][t];
                  if (a === "") return "";
                  if (!a) {
                    const r = i.messages.en;
                    if (r) {
                      let s = r[t];
                      if (s) {
                        for (let o in e) {
                          let l = e[o];
                          s = s.replace(new RegExp("{{" + o + "}}", "g"), l);
                        }
                        return s;
                      }
                      return t;
                    }
                  }
                  const n = a;
                  for (let r in e) {
                    let s = e[r];
                    a = a.replace(new RegExp("{{" + r + "}}", "g"), s);
                  }
                  if (i.localizeFormatFunction) {
                    const r = i.localizeFormatFunction(n, a, e, t);
                    if (r !== void 0) return r;
                  }
                  return a;
                }
                static get requires() {
                  return {};
                }
                static get listeners() {
                  return { "theme-changed": function(t) {
                    this.theme = t.detail.newValue;
                  } };
                }
                static get methods() {
                  return {};
                }
                get classNamesMap() {
                  return { animation: "smart-animate", rippleAnimation: "smart-ripple" };
                }
                get hasAnimation() {
                  return this.animation !== "none";
                }
                get hasRippleAnimation() {
                  return this.animation !== "none" && this.animation === "advanced";
                }
                static get modules() {
                  return window[namespace].Modules;
                }
                get properties() {
                  const t = this;
                  return t._properties || (t._properties = []), t._properties;
                }
                get parents() {
                  const t = this;
                  let e = [], i = t.parentNode;
                  for (; i && i.nodeType !== 9; ) i instanceof HTMLElement && e.push(i), i = i.parentNode;
                  const a = t.getRootNode();
                  if (a.host) {
                    const n = (r) => {
                      let s = [r], o = r.parentNode;
                      for (; o && o.nodeType !== 9; ) o instanceof HTMLElement && s.push(o), o = o.parentNode;
                      return s;
                    };
                    e = e.concat(n(a.host));
                  }
                  return window[namespace].EnableShadowDOM && t.isInShadowDOM && t.shadowParent && (e = e.concat(t.shadowParent.parents)), e;
                }
                log(t) {
                  this._logger("log", t);
                }
                warn(t) {
                  this._logger("warn", t);
                }
                error(t) {
                  this._logger("error", t);
                }
                _logger(t, e) {
                  if (this.debugMode) {
                    const i = e instanceof Error ? e.message : e.toString();
                    console[t](i);
                  }
                  if (this.rethrowError && t === "error") throw e;
                }
                get focused() {
                  return this.contains(document.activeElement);
                }
                template() {
                  return "<div></div>";
                }
                registered() {
                  const t = this;
                  t.onRegistered && t.onRegistered();
                }
                created() {
                  const t = this;
                  t.isReady = !1, t._initElement(t), t._setModuleState("created"), t.onCreated && t.onCreated();
                }
                completed() {
                  const t = this;
                  t.isCompleted = !0, t._onCompleted && t._onCompleted(), t.onCompleted && t.onCompleted();
                }
                whenReady(t) {
                  const e = this;
                  e.isCompleted ? t() : (e.whenReadyCallbacks || (e.whenReadyCallbacks = []), e.whenReadyCallbacks.push(t));
                }
                whenRendered(t) {
                  const e = this;
                  if (t) {
                    if (e.isRendered) return void t();
                    e.whenRenderedCallbacks || (e.whenRenderedCallbacks = []), e.whenRenderedCallbacks.push(t);
                  }
                  return new Promise(((i) => {
                    e.isRendered ? i() : (e.whenRenderedCallbacks || (e.whenRenderedCallbacks = []), e.whenRenderedCallbacks.push(i));
                  }));
                }
                addThemeClass() {
                  const t = this;
                  t.theme !== "" && t.classList.add("smart-" + t.theme);
                }
                addDefaultClass() {
                  const t = this;
                  t.classList.add(namespace.toLowerCase() + "-element"), t.classList.add(t.nodeName.toLowerCase());
                }
                _renderShadowRoot() {
                  const t = this;
                  if (t.shadowRoot) {
                    t.$.root.classList.add(t.nodeName.toLowerCase());
                    for (let e = 0; e < t.attributes.length; e++) {
                      const i = t.attributes[e];
                      i.name === "class" || i.name === "id" || i.name === "style" || i.name === "tabindex" || i.name.indexOf("aria") >= 0 || t.$.root.setAttribute(i.name, i.value);
                    }
                    for (let e = 0; e < t.classList.length; e++) {
                      const i = t.classList[e];
                      i !== "smart-element-init" && i !== "smart-element" && i !== "smart-hidden" && i !== "smart-visibility-hidden" && t.$.root.classList.add(i);
                    }
                  }
                }
                render() {
                  const t = this;
                  if (!t.isRendered && (t.isRendered = !0, t.isRendering = !1, t.context = document, t._renderShadowRoot(), t.whenRenderedCallbacks)) {
                    for (let e = 0; e < t.whenRenderedCallbacks.length; e++) t.whenRenderedCallbacks[e]();
                    t.whenRenderedCallbacks = [];
                  }
                  t.onRender && t.onRender(), t.disabled && t.setAttribute("aria-disabled", !0), t.readonly && ["checkbox", "combobox", "grid", "gridcell", "listbox", "radiogroup", "slider", "spinbutton", "textbox"].indexOf(t.getAttribute("role")) !== -1 && t.setAttribute("aria-readonly", !0);
                }
                addEventListener(t, e, i) {
                  const a = this;
                  if (t !== "ready" || !a.isRendered) return super.addEventListener(t, e, i);
                  Promise.resolve().then((() => {
                    e.call(a, new CustomEvent(t, { target: a }));
                  }));
                }
                ready() {
                  const t = this;
                  if (t._setId(), t.addThemeClass(), t.addDefaultClass(), t.visibility === "collapsed" ? t.classList.add("smart-hidden") : t.visibility === "hidden" && t.classList.add("smart-visibility-hidden"), t.dataContext && t.applyDataContext(), t.onReady && t.onReady(), t.shadowRoot && Smart(t._selector)) {
                    if (Smart(t._selector).styleUrls) {
                      const e = Smart(t._selector).styleUrls;
                      for (let i = 0; i < e.length; i++) t.importStyle(e[i]);
                    }
                    if (Smart(t._selector).styles) {
                      const e = document.createElement("style");
                      e.innerHTML = Smart(t._selector).styles, t.shadowRoot.insertBefore(e, t.shadowRoot.firstChild);
                    }
                  }
                  Smart(t._selector) && Smart(t._selector).ready && Smart(t._selector).ready();
                }
                _setId() {
                  const t = this;
                  if (!t.id) {
                    const e = t.elementName;
                    t.id = e.slice(0, 1).toLowerCase() + e.slice(1) + Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
                  }
                }
                loadLicenseCache() {
                  try {
                    const t = localStorage.getItem(LICENSE_CACHE_KEY);
                    return t ? JSON.parse(t) : null;
                  } catch {
                    return null;
                  }
                }
                saveLicenseCache(t) {
                  try {
                    localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({ ...t, checkedAt: Date.now() }));
                  } catch {
                  }
                }
                isCacheValid(t) {
                  let e = LICENSE_CACHE_TTL;
                  return t && t.licenseType && t.licenseType.toLowerCase().indexOf("monthly") === -1 && (e = 12 * LICENSE_CACHE_TTL), t && Date.now() - t.checkedAt < e;
                }
                async validateLicenseOnline(t) {
                  const e = this;
                  if (!(typeof navigator > "u" || navigator.onLine !== !1)) return null;
                  const i = await fetch("https://jqwidgets.com/portal/validate.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guid: t }) }), a = await i.text();
                  let n;
                  try {
                    n = JSON.parse(a), n && e.saveLicenseCache(n);
                  } catch {
                    console.log("Invalid License. Please, contact support@jqwidgets.com for assistance.");
                  }
                  return n;
                }
                async checkLicense() {
                  const t = this;
                  if (window.location.hostname.indexOf("htmlelements") === -1) {
                    const e = "9B3C72B9-D78F-5E17-8D07-0CBC0E1EDC29", i = new Date(2026, 2, 25);
                    if (t.unlockKey && (window[namespace].License = t.unlockKey), document.body.hasAttribute("smart-license")) {
                      const a = document.body.getAttribute("smart-license");
                      window[namespace].License = a;
                    }
                    if (window[namespace].License !== "Evaluation" && window[namespace].License !== e) {
                      const a = t.loadLicenseCache();
                      let n = null;
                      if (t.isCacheValid(a)) n = a;
                      else {
                        try {
                          n = await t.validateLicenseOnline(window[namespace].License);
                        } catch (r) {
                          console.warn("License online check failed", r);
                        }
                        !n && a && (n = a);
                      }
                      if (n && n.valid) window[namespace].License = e;
                      else if (n && !n.valid && n.validUntil) {
                        const r = n.validUntil, s = n.licenseType, [o, l, c] = r.split("-").map(Number);
                        i < new Date(o, l - 1, c) && (window[namespace].License = e, ("" + s).toLowerCase().indexOf("subscription") === -1 && (window[namespace].License = e));
                      }
                    }
                    if (window[namespace].License !== e) {
                      if (t.unlockKey === e) return;
                      if (document.body.hasAttribute("smart-license") && document.body.getAttribute("smart-license") === e)
                        return void (window[namespace].License = e);
                      t.logWatermark(), t.logLicense(), t.logGithub(), window[namespace].License = e;
                    }
                  }
                }
                logWatermark() {
                  if (window.Smart?.License) return;
                  const t = "smart-watermark";
                  if (document.getElementById(t)) return;
                  let e;
                  const i = document.createElement("a");
                  i.id = t, i.href = "https://htmlelements.com/license/", i.target = "_blank", i.rel = "noopener";
                  const a = document.createElement("span");
                  function n() {
                    e = setTimeout((() => {
                      i.style.opacity = "0", i.style.transform = "translateY(6px) scale(.98)", setTimeout((() => i.remove()), 400);
                    }), 1e4);
                  }
                  a.textContent = "https://htmlelements.com/license/", i.appendChild(a), i.style.position = "fixed", i.style.right = "16px", i.style.bottom = "16px", i.style.padding = "12px 18px", i.style.borderRadius = "999px", i.style.background = "linear-gradient(135deg, #0C3D78, #1565C0)", i.style.color = "#fff", i.style.fontSize = "14px", i.style.fontWeight = "600", i.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", i.style.textDecoration = "none", i.style.boxShadow = "0 10px 25px rgba(12,61,120,.35)", i.style.backdropFilter = "blur(6px)", i.style.opacity = "0", i.style.transform = "translateY(6px) scale(.98)", i.style.transition = "opacity 400ms ease, transform 400ms cubic-bezier(.2,.8,.2,1), box-shadow 200ms ease", i.style.zIndex = "999999", i.addEventListener("mouseenter", (() => {
                    clearTimeout(e), i.style.transform = "translateY(0) scale(1.03)", i.style.boxShadow = "0 16px 40px rgba(12,61,120,.45)";
                  })), i.addEventListener("mouseleave", (() => {
                    i.style.transform = "translateY(0) scale(1)", n();
                  })), setTimeout((() => {
                    document.getElementById(t) || (document.body.appendChild(i), requestAnimationFrame((() => {
                      i.style.opacity = "1", i.style.transform = "translateY(0) scale(1)";
                    })), n());
                  }), 800);
                }
                logGithub() {
                  if (window.Smart?.License) return;
                  const t = "smart-github-rate";
                  if (document.getElementById(t)) return;
                  let e;
                  const i = document.createElement("a");
                  i.id = t, i.href = "https://github.com/htmlelements/smart-webcomponents", i.target = "_blank", i.rel = "noopener";
                  const a = document.createElement("span");
                  a.textContent = "★", a.style.display = "inline-flex", a.style.alignItems = "center", a.style.justifyContent = "center", a.style.width = "18px", a.style.height = "18px", a.style.borderRadius = "50%", a.style.background = "#4FC3F7", a.style.marginRight = "10px", a.style.boxShadow = "0 0 0 3px rgba(79,195,247,.25)", a.style.fontSize = "12px", a.style.lineHeight = "1";
                  const n = document.createElement("span");
                  function r() {
                    e = setTimeout((() => {
                      i.style.opacity = "0", i.style.transform = "translateY(6px) scale(.98)", setTimeout((() => i.remove()), 400);
                    }), 1e4);
                  }
                  n.textContent = "Rate us on GitHub", i.appendChild(a), i.appendChild(n), i.style.position = "fixed", i.style.left = "16px", i.style.bottom = "16px", i.style.padding = "12px 18px", i.style.borderRadius = "999px", i.style.background = "linear-gradient(135deg, #0C3D78, #1565C0)", i.style.color = "#fff", i.style.fontSize = "14px", i.style.fontWeight = "600", i.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", i.style.textDecoration = "none", i.style.boxShadow = "0 10px 25px rgba(12,61,120,.35)", i.style.backdropFilter = "blur(6px)", i.style.opacity = "0", i.style.transform = "translateY(6px) scale(.98)", i.style.transition = "opacity 400ms ease, transform 400ms cubic-bezier(.2,.8,.2,1), box-shadow 200ms ease", i.style.zIndex = "999999", i.addEventListener("mouseenter", (() => {
                    clearTimeout(e), i.style.transform = "translateY(0) scale(1.03)", i.style.boxShadow = "0 16px 40px rgba(12,61,120,.45)";
                  })), i.addEventListener("mouseleave", (() => {
                    i.style.transform = "translateY(0) scale(1)", r();
                  })), setTimeout((() => {
                    document.getElementById(t) || (document.body.appendChild(i), requestAnimationFrame((() => {
                      i.style.opacity = "1", i.style.transform = "translateY(0) scale(1)";
                    })), r());
                  }), 800);
                }
                logLicense() {
                  console.log("****************************************************************************************************************"), console.log("****************************************************************************************************************"), console.log("****************************************************************************************************************"), console.log("*⚠ jQWidgets License Key Not Found."), console.log("*This is an EVALUATION only Version, it is NOT Licensed for software projects intended for PRODUCTION."), console.log("*if you want to hide this message, please send an email to: sales@jqwidgets.com for a license."), console.log("****************************************************************************************************************"), console.log("****************************************************************************************************************"), console.log("****************************************************************************************************************");
                }
                get _selector() {
                  const t = this;
                  return t.id ? "#" + t.id : t.classList.length > 0 ? "." + t.classList[0] : "";
                }
                applyDataContext(t) {
                  const e = this;
                  let i = typeof e.dataContext == "string" ? window[e.dataContext] || document[e.dataContext] : e.dataContext;
                  if (t && (i = t, e.dataContext = t), i) {
                    if (!i._uid) {
                      i._uid = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase(), i._properties = [];
                      for (let a in i) {
                        const n = i[a];
                        typeof n != "function" && a !== "_properties" && a !== "_uid" && (i._properties[a] = n, Object.defineProperty(i, a, { configurable: !1, enumerable: !0, get: () => i._properties[a], set(r) {
                          const s = i._properties[a];
                          i._properties[a] = r;
                          let o = [];
                          o[a] = { oldValue: s, value: r }, o.length++, e.updatingDataContext = !0, $document.fireEvent("dataContextPropertyChanged", { dataContext: i, properties: o }, { bubbles: !1, cancelable: !0 }), e.updatingDataContext = !1;
                        } }));
                      }
                    }
                    if (e.dataContextProperties = e.parseAttributes(e), e.dataContextPropertiesMap = {}, e.dataContextListeners = {}, e.dataContextProperties) {
                      e.updatingDataContext = !0;
                      for (let a in e.dataContextProperties) {
                        const n = e.dataContextProperties[a], r = n.name;
                        if (n.propertyName = a, e.dataContextPropertiesMap[r] = a, BindingModule.cache["toDash" + a] || (BindingModule.cache["toDash" + a] = Utilities.Core.toDash(r)), n.isEvent) {
                          const s = n.value;
                          e.dataContextListeners[r] && e.removeEventListener(r, e.dataContextListeners[r]), e.dataContextListeners[r] = function(o) {
                            i[s](o);
                          }, e.addEventListener(r, e.dataContextListeners[r]);
                        }
                        if (r.indexOf(".") >= 0) {
                          const s = r.split(".");
                          let o = i[s[0]];
                          for (let l = 1; l < s.length; l++) o = o[s[l]];
                          o !== void 0 && (e[a] = o);
                        } else e[a] = i[r];
                      }
                      e.dataContextPropertyChangedHandler = function(a) {
                        const n = a.detail.properties;
                        if (a.detail.dataContext === (typeof e.dataContext == "string" ? window[e.dataContext] || document[e.dataContext] : e.dataContext)) for (let r in n) {
                          const s = e.dataContextPropertiesMap[r], o = e.context;
                          s && (e.context = document, e[s] = n[r].value, e.context = o);
                        }
                      }, $document.listen("dataContextPropertyChanged", e.dataContextPropertyChangedHandler), e.updatingDataContext = !1;
                    } else e.dataContextProperties = null;
                  } else {
                    e.dataContextProperties = null;
                    const a = function() {
                      (typeof e.dataContext == "string" ? window[e.dataContext] || document[e.dataContext] : e.dataContext) && (e.applyDataContext(), window.removeEventListener("load", a));
                    };
                    window.addEventListener("load", a);
                  }
                }
                updateDataContextProperty(t) {
                  const e = this, i = typeof e.dataContext == "string" ? window[e.dataContext] || document[e.dataContext] : e.dataContext, a = e.dataContextProperties[t];
                  if (!e.updatingDataContext && a.twoWay) {
                    const n = a.name;
                    if (n.indexOf(".") >= 0) {
                      const r = n.split(".");
                      let s = i[r[0]];
                      for (let o = 1; o < r.length; o++) s = s[r[o]];
                      s !== void 0 && (s = e[t], dataContextInfo[i._uid] && (dataContextInfo[i._uid][t] = s));
                    } else i[n] = e[t], dataContextInfo[i._uid] && (dataContextInfo[i._uid][t] = i[n]);
                  }
                }
                static get version() {
                  return window[namespace].Version;
                }
                initProperties() {
                  const that = this;
                  if (Smart(that._selector) && Smart(that._selector).properties && (that._initProperties = Smart(that._selector).properties), that.hasAttribute("props") && !that.props) {
                    const resolveProps = () => {
                      const propsAttr = that.getAttribute("props");
                      let propsValue;
                      if (!propsAttr) return {};
                      try {
                        if (propsAttr.trim().startsWith("{") || propsAttr.trim().startsWith("[")) propsValue = JSON.parse(propsAttr);
                        else {
                          const localResolver = () => eval(propsAttr);
                          propsValue = localResolver();
                        }
                      } catch (t) {
                        console.warn(`Could not resolve props "${propsAttr}"`, t), propsValue = {};
                      }
                      if (typeof propsValue == "function") try {
                        propsValue = propsValue();
                      } catch (t) {
                        console.warn(`Error executing props function "${propsAttr}"`, t), propsValue = {};
                      }
                      return propsValue || {};
                    };
                    that._initProperties = resolveProps();
                  } else that.props && (that._initProperties = that.props);
                  if (that._initProperties) {
                    const t = Object.keys(that._initProperties);
                    for (let e = 0; e < t.length; e++) {
                      const i = t[e], a = that._initProperties[i];
                      if (a != null) {
                        if (a.constructor === Smart.ObservableArray || a instanceof Smart.ObservableArray) {
                          that[i] = a.toArray();
                          continue;
                        }
                        if (a.constructor === Smart.DataAdapter || a.constructor.name === "smartDataAdapter" || typeof a == "object" && Smart.DataAdapter && a instanceof Smart.DataAdapter || a instanceof Smart.Observable || a.constructor === Smart.Observable || typeof a != "object" || Utilities.Types.isArray(a) || a instanceof Date) {
                          if (that[i] === void 0 && ["onReady", "onAttached", "onDetached", "onCreated", "onCompleted"].indexOf(i) === -1) {
                            const n = that.localize("propertyUnknownName", { name: i });
                            that.log(n);
                          }
                          that[i] = a;
                          continue;
                        }
                      }
                      if (i !== "messages") if (i !== "dataSourceMap" && i !== "rowCSSRules") if (i !== "keys") {
                        if (a && typeof a == "object") {
                          const n = function(r, s) {
                            const o = Object.keys(r);
                            for (let l = 0; l < o.length; l++) {
                              const c = o[l], m = r[c], u = that._properties[s + "_" + c];
                              if (u && u.value === null) {
                                if (that[s + "_" + c] === void 0) {
                                  const p = that.localize("propertyUnknownName", { name: s + "_" + c });
                                  that.log(p);
                                }
                                that[s + "_" + c] = m;
                              } else if (typeof m == "object" && !Utilities.Types.isArray(m) && m && m.constructor !== Date) n(m, s + "_" + c);
                              else {
                                if (that[s + "_" + c] === void 0) {
                                  const p = that.localize("propertyUnknownName", { name: s + "_" + c });
                                  that.log(p);
                                }
                                that[s + "_" + c] = m;
                              }
                            }
                          };
                          n(a, i);
                        }
                      } else that[i] = a;
                      else that[i] = a;
                      else that[i] = Object.assign(that[i], a);
                    }
                  }
                }
                setProperties(t) {
                  const e = this, i = Object.keys(t);
                  for (let a = 0; a < i.length; a++) {
                    const n = i[a], r = t[n];
                    if (r.constructor === Smart.ObservableArray || r instanceof Smart.ObservableArray) e[n] = r.toArray();
                    else if (r.constructor === Smart.DataAdapter || r.constructor.name === "smartDataAdapter" || typeof r == "object" && Smart.DataAdapter && r instanceof Smart.DataAdapter || r instanceof Smart.Observable || r.constructor === Smart.Observable || typeof r != "object" || Utilities.Types.isArray(r) || r instanceof Date) {
                      if (e[n] === void 0 && ["onReady", "onAttached", "onDetached", "onCreated", "onCompleted"].indexOf(n) === -1) continue;
                      const s = e._properties[n];
                      s.type === "int" || s.type === "number" && typeof subPropertyValue == "string" ? s.type === "int" ? e[n] = parseInt(r) : e[n] = parseFloat(r) : e[n] = r;
                    } else if (n !== "messages" && n !== "dataSourceMap") {
                      if (typeof r == "object") {
                        const s = function(o, l) {
                          const c = Object.keys(o);
                          for (let m = 0; m < c.length; m++) {
                            const u = c[m], p = o[u], h = e._properties[l + "_" + u];
                            if (h && h.value === null) {
                              if (e[l + "_" + u] === void 0) continue;
                              const g = e._properties[l + "_" + u];
                              g.type === "int" || g.type === "number" && typeof p == "string" ? g.type === "int" ? e[l + "_" + u] = parseInt(p) : e[l + "_" + u] = parseFloat(p) : e[l + "_" + u] = p;
                            } else if (typeof p == "object" && !Utilities.Types.isArray(p) && p && p.constructor !== Date) s(p, l + "_" + u);
                            else {
                              if (e[l + "_" + u] === void 0) continue;
                              const g = e._properties[l + "_" + u];
                              g.type === "int" || g.type === "number" && typeof p == "string" ? g.type === "int" ? e[l + "_" + u] = parseInt(p) : e[l + "_" + u] = parseFloat(p) : e[l + "_" + u] = p;
                            }
                          }
                        };
                        s(r, n);
                      }
                    } else e[n] = r;
                  }
                }
                setup() {
                  const t = this;
                  if (t.context = this, t.isReady && !t.isCompleted) return;
                  if (t.isReady) return t._setModuleState("attached"), t.isAttached = !0, t.attached(), t._handleListeners("listen"), void (t.context = document);
                  t.ownerElement && t.ownerElement.detachedChildren.indexOf(t) >= 0 && t.ownerElement.detachedChildren.splice(t.ownerElement.detachedChildren.indexOf(t), 1), t.isReady = !0, t.methods = t.getStaticMember("methods"), t.initProperties(), Core.isMobile && t.classList.add("smart-mobile");
                  for (let a = 0; a < t.attributes.length; a += 1) {
                    const n = t.propertyByAttributeName[t.attributes[a].name];
                    if (!n) continue;
                    let r = t.$.getAttributeValue(n.attributeName, n.type);
                    const s = r ? r.toString() : "";
                    if (!(s.indexOf("{{") >= 0 || s.indexOf("[[") >= 0) && (n.type === "object" || n.type === "array" || !(t.attributes[a].value.indexOf("{{") >= 0 || t.attributes[a].value.indexOf("[[") >= 0)) && r !== void 0 && n.value !== r) {
                      const o = Utilities.Types.getType(r), l = t.attributes[a].value;
                      if ((n.type === "any" || n.type === "object") && "" + t[n.name] === r || n.type === "array" && t[n.name] && JSON.stringify(t[n.name]) === r) continue;
                      if (o === "number" && isNaN(r) && l !== "NaN" && l !== "Infinity" && l !== "-Infinity") {
                        const c = t.localize("propertyInvalidValueType", { name: n.name, actualType: "string", type: n.type });
                        t.log(c);
                      }
                      n.isUpdatingFromAttribute = !0, t[n.name] = r, n.isUpdatingFromAttribute = !1;
                    }
                  }
                  for (let a in t._properties) {
                    const n = t._properties[a];
                    if (a === "innerHTML" && n.value === n.defaultValue && (n.value = n.defaultValue = Utilities.Core.html(t)), n.type !== "boolean" && n.type !== "bool" || t.getAttribute(n.attributeName) === "false" && (n.isUpdating = !0, t.setAttribute(n.attributeName, ""), n.isUpdating = !1), n.defaultReflectToAttribute && n.reflectToAttribute) {
                      if (n.defaultReflectToAttribute && n.defaultReflectToAttributeConditions) {
                        let r = !0;
                        for (let s = 0; s < n.defaultReflectToAttributeConditions.length; s++) {
                          const o = n.defaultReflectToAttributeConditions[s];
                          let l, c;
                          for (let m in o) l = m, c = o[m];
                          t._properties[l] && t._properties[l].value !== c && (r = !1);
                        }
                        if (!r) continue;
                      }
                      n.isUpdating = !0, t.$.setAttributeValue(n.attributeName, n.value, n.type), n.isUpdating = !1;
                    }
                  }
                  const e = [];
                  if (t.children.length > 0) for (let a = 0; a < t.children.length; a++) {
                    const n = t.children[a];
                    Utilities.Extend(n).isCustomElement && e.push(n);
                  }
                  t.applyTemplate(), t.complete = function() {
                    if (!t.templateBindingsReady) {
                      const n = (r) => {
                        r.templateBindingsReady || (r.templateBindingsReady = !0, r.updateTextNodes(), r.updateBoundNodes());
                      };
                      if (t.ownerElement) {
                        let r = t.ownerElement, s = [];
                        for (; r; ) s.push(r), r = r.ownerElement;
                        for (let o = s.length - 1; o >= 0; o--) n(s[o]);
                        n(t);
                      } else n(t);
                    }
                    const a = () => {
                      if (t._setModuleState("ready"), t.ready(), t.renderMode !== "auto" || t.isRendered || t.render(), t.isAttached = !0, t._setModuleState("attached"), t.attached(), t._handleListeners("listen"), t.isHidden || t.offsetWidth !== 0 && t.offsetHeight !== 0 || (t.isHidden = !0), t.completed(), t.isRendered && (t.context = document), t.whenReadyCallbacks) {
                        for (let n = 0; n < t.whenReadyCallbacks.length; n++) t.whenReadyCallbacks[n]();
                        t.whenReadyCallbacks = [];
                      }
                    };
                    if (t.wait) t.classList.add("smart-visibility-hidden");
                    else if (t.classList.contains("smart-async")) requestAnimationFrame((() => {
                      a();
                    }));
                    else {
                      const n = t.shadowParent;
                      t.shadowParent = null;
                      const r = t.parents;
                      if (t.shadowParent = n, r.length === 0) return;
                      const s = () => {
                        let o = t.ownerElement, l = [];
                        for (; o; ) l.push(o), o = o.ownerElement;
                        for (let c = l.length - 1; c >= 0; c--) l[c].updateBoundMappedNodes();
                      };
                      t.ownerElement && r[r.length - 1].nodeName !== "HTML" ? t.getRootNode().host ? a() : t.ownerElement && t.ownerElement.parents[t.ownerElement.parents.length - 1].nodeName === "HTML" ? (s(), a()) : t.checkIsInDomInterval = setInterval((() => {
                        const o = t.parents;
                        o[o.length - 1].nodeName === "HTML" && (clearInterval(t.checkIsInDomInterval), s(), a());
                      }), 100) : a();
                    }
                  };
                  let i = [].slice.call(t.querySelectorAll("[smart-id]")).concat(e);
                  if (window[namespace].EnableShadowDOM && t.isInShadowDOM !== !0 && (i = [].slice.call(t.shadowRoot.querySelectorAll("[smart-id]")).concat(e)), i.length === 0) t.complete();
                  else {
                    t._completeListeners = 0;
                    for (let a = 0; a < i.length; a++) {
                      const n = i[a];
                      if (Utilities.Extend(n).isCustomElement) {
                        const r = (function() {
                          t._completeListeners--, t._completeListeners === 0 && (t.complete(), delete t._completeListeners);
                        }).bind(t);
                        n.isCompleted || n.isUtilityElement || n.wait === !0 || (t._completeListeners++, n._onCompleted || (n.completeHandlers = [], n._onCompleted = function() {
                          for (let s = 0; s < n.completeHandlers.length; s++) n.completeHandlers[s]();
                        }), n.completeHandlers.push(r));
                      }
                    }
                    t._completeListeners === 0 && t.complete();
                  }
                }
                visibilityChangedHandler() {
                  const t = this;
                  t.isReady && requestAnimationFrame((() => {
                    t.offsetWidth === 0 || t.offsetHeight === 0 ? t.isHidden = !0 : (t.isHidden = !1, t.$.fireEvent("resize", t, { bubbles: !1, cancelable: !0 }));
                  }));
                }
                attributeChangedCallback(t, e, i) {
                  const a = this, n = a.propertyByAttributeName[t];
                  if (t !== "class" && t !== "style" || a.visibilityChangedHandler(), n || a.attributeChanged(t, e, i), a.onAttributeChanged && a.onAttributeChanged(t, e, i), !n || n && n.isUpdating) return;
                  let r = a.$.getAttributeValue(n.attributeName, n.type);
                  i !== void 0 && a[n.name] !== r && (n.isUpdatingFromAttribute = !0, a[n.name] = r !== void 0 ? r : a._properties[n.name].defaultValue, n.isUpdatingFromAttribute = !1);
                }
                attributeChanged(t, e, i) {
                }
                set hasStyleObserver(t) {
                  const e = this;
                  e._hasStyleObserver === void 0 && (e._hasStyleObserver = t), t ? StyleObserver.watch(e) : StyleObserver.unwatch(e);
                }
                get hasStyleObserver() {
                  const t = this;
                  return t._hasStyleObserver === void 0 || t._hasStyleObserver;
                }
                attached() {
                  const t = this;
                  t.hasStyleObserver && StyleObserver.watch(t), t.onAttached && t.onAttached(), Smart(t._selector) && Smart(t._selector).attached && Smart(t._selector).attached();
                }
                detached() {
                  const t = this;
                  t.hasStyleObserver && StyleObserver.unwatch(t), t._setModuleState("detached"), t.isAttached = !1, t.ownerElement && t.ownerElement.detachedChildren.indexOf(t) === -1 && t.ownerElement.detachedChildren.push(t), t._handleListeners("unlisten"), t.onDetached && t.onDetached(), Smart(t._selector) && Smart(t._selector).detached && Smart(t._selector).detached(), data && data[t._selector] && delete data[t._selector];
                }
                propertyChangedHandler(t, e, i) {
                  const a = this;
                  e !== i && (t === "theme" && (e !== "" && a.classList.remove("smart-" + e), i !== "" && a.classList.add("smart-" + i)), t === "visibility" ? (e === "collapsed" ? a.classList.remove("smart-hidden") : e === "hidden" && a.classList.remove("smart-visibility-hidden"), i === "collapsed" ? a.classList.add("smart-hidden") : i === "hidden" && a.classList.add("smart-visibility-hidden")) : (t === "disabled" || t === "readonly") && a._ariaPropertyChangedHandler(t, i), a.propertyChanged && a.propertyChanged(t, e, i));
                }
                _ariaPropertyChangedHandler(t, e) {
                  const i = this;
                  t === "readonly" && ["checkbox", "combobox", "grid", "gridcell", "listbox", "radiogroup", "slider", "spinbutton", "textbox"].indexOf(i.getAttribute("role")) === -1 || (e ? i.setAttribute("aria-" + t, !0) : i.removeAttribute("aria-" + t));
                }
                _handleListeners(t) {
                  const e = this, i = e.tagName.toLowerCase(), a = (n) => {
                    for (let r in n) {
                      const s = r.split(".");
                      let o = s[0], l = e.$;
                      if (s[1]) if (o = s[1], l = e["$" + s[0]], s[0] === "document") {
                        let u = e.smartId;
                        u === "" && (u = Utilities.Core.toCamelCase(i)), o = o + "." + u;
                      } else e.smartId && (o = o + "." + e.smartId + "_" + e.parents.length);
                      else e.smartId && (o = o + "." + e.smartId);
                      const c = n[r], m = function(u) {
                        const p = e.context;
                        e.context = e, e[c] && e[c].apply(e, [u]), e.context = p;
                      };
                      l && l[t](o, m);
                    }
                  };
                  a(e.getStaticMember("listeners")), a(e.templateListeners), Smart(e._selector) && Smart(e._selector).properties && a(Smart(e._selector).listeners);
                }
                parseTemplate() {
                  const t = this, e = t.template(), i = document.createDocumentFragment();
                  if (templates[t.nodeName] && !isEdge) return templates[t.nodeName].cloneNode(!0);
                  if (e === "") return null;
                  let a = document.createElement("div");
                  i.appendChild(a), a.innerHTML = e;
                  let n = a.childNodes;
                  a.parentNode.removeChild(a);
                  for (let r = 0; r < n.length; r++) i.appendChild(n[r]);
                  return templates[t.nodeName] = i, isEdge ? i : i.cloneNode(!0);
                }
                applyTemplate() {
                  const t = this, e = t.parseTemplate();
                  if (!e || !e.hasChildNodes) return;
                  const i = e.childNodes[0], a = (s, o) => {
                    t["$" + s] = o.$ = Utilities.Extend(o), t.$[s] = o, o.ownerElement = t;
                  };
                  let n = i;
                  if (i.getElementsByTagName("content").length > 0) {
                    let s = i.getElementsByTagName("content")[0];
                    n = s.parentNode, n.removeChild(s);
                  } else {
                    const s = e.querySelectorAll("[inner-h-t-m-l]");
                    s && s.length > 0 && (n = s[0]);
                  }
                  t.$.template = i.nodeName.toLowerCase() === "template" ? i : i.querySelector("template");
                  let r = e.querySelectorAll("[id]");
                  r.length === 0 && (r = e.querySelectorAll("*")), a("root", i), a("content", n), t.$.html = t.innerHTML.toString().trim();
                  for (let s = 0; s < r.length; s += 1) {
                    let o = r[s];
                    o.id === "" && (o.id = "child" + s), a(o.id, o), o.setAttribute("smart-id", o.id), t.shadowRoot ? o.shadowParent = t : o.removeAttribute("id");
                  }
                  for (t.hasTemplateBindings !== !1 ? t.bindings = t.getBindings(e) : t.bindings = [], t.$root.addClass("smart-container"); t.childNodes.length; ) n.appendChild(t.firstChild);
                  if (t.appendTemplate(e), t.$.template) {
                    const s = document.createElement("div");
                    s.classList.add("smart-template-container"), t.$.templateContainer = s, t.$.template.parentNode.insertBefore(s, t.$.template), t.refreshTemplate();
                  }
                }
                refreshTemplate() {
                  const t = this;
                  if (!t.$.templateContainer) return;
                  t.templateDetached(t.$.templateContainer);
                  const e = t.$.template.content.cloneNode(!0);
                  t.templateBindings = t.getBindings(e), t.templateProperties = [];
                  let i = document.createDocumentFragment();
                  const a = function(n, r, s) {
                    for (let o in n) {
                      const l = n[o], c = l.node.cloneNode();
                      r.appendChild(c);
                      let m = [], u = !1;
                      if (l.data) for (let p in l.data) {
                        const h = l.data[p], g = h.name;
                        if (t.templateProperties[g] = !0, c.removeAttribute(Utilities.Core.toDash(p)), p === "*items") m = t[g], u = !0;
                        else if (g.indexOf("item.") >= 0 && s !== void 0) h.value = s[g.substring(5)], c[p] = h.value;
                        else if (g.indexOf("item") >= 0 && s !== void 0) h.value = s, c[p] = h.value;
                        else if (p === "*if") if (g.indexOf("(") >= 0) {
                          let f, b = g.substring(g.indexOf("("));
                          const y = g.substring(0, g.indexOf("("));
                          if (b = b.substring(1, b.length - 1), b = b.replace(/ /gi, ""), b = b.split(","), b.length > 0 && b[0] !== "") {
                            let _ = [];
                            for (let x = 0; x < b.length; x++) _.push(t[b[x]]);
                            f = t[y].apply(t, _);
                          } else f = t[y]();
                          f === !1 && r.removeChild(c);
                        } else t[g] || r.removeChild(c);
                        else t.updateBoundNode(c, l, t, g);
                      }
                      if (m.length > 0 || u) {
                        for (let p = 0; p < m.length; p++) l.children && a(l.children, c, m[p]);
                        if (typeof m == "number") for (let p = 0; p < m; p++) l.children && a(l.children, c, p);
                      } else l.children && a(l.children, c, s);
                    }
                  };
                  a(t.templateBindings.children, i), t.$.templateContainer.innerHTML = "", t.$.templateContainer.appendChild(i), t.templateAttached(t.$.templateContainer);
                }
                templateAttached() {
                }
                templateDetached() {
                }
                appendTemplate(t) {
                  this.appendChild(t);
                }
                defineElementModules() {
                  const t = this, e = t.constructor.prototype;
                  if (e.elementName === "BaseElement") {
                    e.modules = t.constructor.modules;
                    const i = e.modules;
                    for (let a = 0; a < i.length; a += 1) t.addModule(i[a]);
                  } else {
                    const i = e.modules;
                    if (!i) return;
                    for (let a = 0; a < i.length; a += 1) {
                      const n = i[a], r = n.prototype;
                      t.defineElementMethods(r.methodNames, r), t.defineElementProperties(n.properties);
                    }
                  }
                }
                watch(t, e) {
                  const i = this;
                  i._watch = t !== null && e !== null ? { properties: t, propertyChangedCallback: e } : null;
                }
                unwatch() {
                  this._watch = null;
                }
                set(t, e, i) {
                  const a = this, n = a.context;
                  a.context = i === !0 ? document : a, a[t] = e, a.context = n;
                }
                get(t) {
                  return this[t];
                }
                _setModuleState(t, e) {
                  const i = this, a = "is" + t.substring(0, 1).toUpperCase() + t.substring(1), n = "on" + t.substring(0, 1).toUpperCase() + t.substring(1);
                  for (let r = 0; r < i.modulesList.length; r++) {
                    const s = i.modulesList[r];
                    s[a] = !0, s[t] && s[t](e), s[n] && s[n](e);
                  }
                }
                addModule(t, e) {
                  const i = this;
                  if (!t) return;
                  const a = i.modules.slice(0), n = t.prototype, r = Object.getPrototypeOf(t);
                  if (r.name && r.name !== t.name && i.addModule(r), !t.moduleName && t.name && (t.moduleName = t.name), a.findIndex(((s) => t.moduleName === s.moduleName)) === -1 && a.push(t), i.defineModule(t), i.defineElementMethods(n.methodNames, n), i.defineElementProperties(t.properties), i.constructor.prototype.modules = a, e) for (let s in Smart.Elements.tagNames) {
                    const o = Smart.Elements.tagNames[s];
                    let l = Object.getPrototypeOf(o), c = [];
                    for (; l !== HTMLElement; ) c.push(l.prototype), l = Object.getPrototypeOf(l);
                    c.indexOf(i) >= 0 && o !== i && o.prototype.addModule(t);
                  }
                }
                defineModule(t) {
                  if (t.isDefined) return;
                  t.prototype._initModule = function(n) {
                    this.ownerElement = n;
                  };
                  const e = t.properties || {}, i = Object.keys(e), a = Object.getOwnPropertyNames(t.prototype);
                  t.prototype.methodNames = a;
                  for (let n = 0; n < i.length; n += 1) {
                    const r = i[n], s = e[r];
                    Object.defineProperty(t.prototype, r, { configurable: !1, enumerable: !0, get() {
                      return this.ownerElement ? this.ownerElement[r] : s.value;
                    }, set(o) {
                      this.ownerElement[r] = o;
                    } });
                  }
                  t.isDefined = !0;
                }
                getStaticMember(t, e) {
                  const i = window[namespace][this.elementName], a = i[t];
                  e || (e = "");
                  let n = e === "array" ? [] : e === "string" ? "" : {}, r = Object.getPrototypeOf(i), s = [];
                  for (; r[t]; ) s.push(r[t]), r = Object.getPrototypeOf(r);
                  for (let o = s.length - 1; o >= 0; o--) if (e === "array") for (let l = 0; l < s[o].length; l++) n.indexOf(s[o][l]) === -1 && n.push(s[o][l]);
                  else e === "string" ? n.indexOf(s[o]) === -1 && (n += s[o]) : n = Utilities.Core.assign(n, s[o]);
                  if (e === "array") {
                    for (let o = 0; o < a.length; o++) n.indexOf(a[o]) === -1 && n.push(a[o]);
                    return n;
                  }
                  return e === "string" ? (n.indexOf(a) === -1 && (n += a), n) : Utilities.Core.assign(n, a);
                }
                defineElementHierarchicalProperties(t, e) {
                  const i = this, a = [];
                  (function(n) {
                    const r = Object.keys(n);
                    for (let s = 0; s < r.length; s++) {
                      const o = r[s];
                      if (o === "messages" || o === "keys") continue;
                      const l = n[o], c = Object.keys(l), m = c.indexOf("value") >= 0 && c.indexOf("type") >= 0 && typeof l.value == "object";
                      if (l.type === "propertyObject" || m) {
                        const u = function(p, h) {
                          if (!p.value) return;
                          const g = Object.keys(p.value);
                          for (let f = 0; f < g.length; f++) {
                            const b = g[f], y = p.value[b], _ = h + "_" + b;
                            if (typeof y != "object" || y === null) break;
                            const x = Object.keys(y);
                            if (!(x.indexOf("value") >= 0 && x.indexOf("type") >= 0)) break;
                            if (p.type !== "array" && (p.isHierarchicalProperty = !0), y.parentPropertyName = h, e) {
                              const w = e._properties[_];
                              if (p.value.hasOwnProperty(b)) {
                                if (w.isDefined) continue;
                                delete p.value[b];
                              }
                              w.isDefined = !0, Object.defineProperty(p.value, b, { configurable: !1, enumerable: !0, get: () => e._properties[_].value, set(S) {
                                e.updateProperty(e, e._properties[_], S);
                              } });
                            }
                            a[_] || (a[_] = y, a.length++), (y.type === "propertyObject" || typeof y.value == "object" && y.type !== "array") && u(e ? e._properties[_] : y, _);
                          }
                        };
                        u(l, o);
                      }
                    }
                  })(t), a.length > 0 && !e && i.defineElementProperties(a);
                }
                defineElement() {
                  const t = this, e = t.constructor.prototype, i = t.getStaticMember("properties"), a = Object.getOwnPropertyNames(e);
                  e.extendedProperties = {}, e.boundProperties = {}, e.templateListeners = {}, t.defineElementModules(), t.defineElementMethods(a, e), t.defineElementProperties(i), t.defineElementHierarchicalProperties(t.extendedProperties), e._initElement = function() {
                    const n = this, r = e.extendedProperties, s = Object.keys(r), o = n.modules;
                    n.$ = Utilities.Extend(n), n.$document = $document, n.smartId = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase(), n.isCreated || (n.modulesList = [], n._properties = [], n._beforeCreatedProperties && (n._properties = n._beforeCreatedProperties, delete n._beforeCreatedProperties), n.detachedChildren = [], n.propertyByAttributeName = []);
                    for (let c = 0; c < o.length; c += 1) {
                      let m = new o[c]();
                      m._initModule(n), n.modulesList.push(m);
                    }
                    const l = [];
                    for (let c = 0; c < s.length; c += 1) {
                      const m = s[c], u = r[m];
                      let p = u.value;
                      if (n._properties[m]) {
                        if (n._properties[m].notify !== void 0) continue;
                        delete n._properties[m];
                      }
                      if (isOldChrome && m === "innerHTML" && delete n[m], window.navigator.userAgent.indexOf("PhantomJS") === -1 && n.hasOwnProperty(m)) if (u.isHierarchicalProperty && n[m]) {
                        const g = n[m];
                        l.push({ name: m, value: g }), p = u.value, delete n[m];
                      } else p = n[m], delete n[m];
                      if (u.type === "array" && p != null && (p = p.slice(0)), u.type === "object" && p != null && (p = Array.isArray(p) ? p.slice(0) : Object.assign({}, p)), n._properties[m] = { name: m, notify: u.notify, allowedValues: u.allowedValues, type: u.type, nullable: u.nullable, reflectToAttribute: u.reflectToAttribute, defaultReflectToAttribute: u.defaultReflectToAttribute, defaultReflectToAttributeConditions: u.defaultReflectToAttributeConditions, value: p, readOnly: u.readOnly, defaultValue: p, attributeName: u.attributeName, observer: u.observer, inherit: u.inherit, extend: u.extend, validator: u.validator }, n.propertyByAttributeName[u.attributeName] = n._properties[m], !u.hasOwnProperty("type")) {
                        const g = n.localize("propertyUnknownType", { name: m });
                        n.log(g);
                      }
                      if (u.type === "any" || u.type === "propertyObject") continue;
                      const h = Utilities.Types.getType(p);
                      if (p != null && u.type !== h && !u.validator) {
                        if (u.type === "object" && h === "array" || h === "number" && ["integer", "int", "float"].findIndex(((f) => f === u.type)) >= 0)
                          continue;
                        const g = n.localize("propertyInvalidValueType", { name: m, actualType: h, type: u.type });
                        n.log(g);
                      }
                    }
                    if (n.defineElementHierarchicalProperties(n._properties, n), l.length && window[namespace].RenderMode !== "manual") for (let c = 0; c < l.length; c++) {
                      const m = l[c];
                      n[m.name] = m.value;
                    }
                    n.isCreated = !0;
                  }, e.registered();
                }
                defineElementMethods(t, e) {
                  const i = this.constructor.prototype, a = function(r, s) {
                    const o = Array.prototype.slice.call(arguments, 2);
                    return function() {
                      if (!this.isReady && s !== "localize" && s !== "localize" && s !== "cloneNode" && s !== "importStyle" && s !== "log" && s !== "parseAttributes") {
                        const f = this.localize("elementNotInDOM");
                        this.log(f);
                      }
                      let c = this;
                      for (let f = 0; f < this.modulesList.length; f++) {
                        let b = this.modulesList[f];
                        if (s in b) {
                          c = b;
                          break;
                        }
                      }
                      const m = this.context, u = o.concat(Array.prototype.slice.call(arguments));
                      let p = null;
                      const h = function(f, b) {
                        return f === b || f === "number" && (b === "int" || b === "integer" || b === "float") || f === "bool" && b === "boolean" || f === "boolean" && b === "bool" || f === "object" && b === "any" || void 0;
                      };
                      if (this.methods) {
                        const f = this.methods[s];
                        if (f) {
                          const b = f.split(":");
                          p = b[b.length - 1].trim();
                          const y = [], _ = f.substring(1 + f.indexOf("("), f.lastIndexOf(")")).split(",");
                          let x = "";
                          for (let S = 0; S < _.length; S++) {
                            const v = _[S];
                            x += v, v.indexOf(":") >= 0 ? (y.push(x), x = "") : x += ",";
                          }
                          let w = y.length;
                          for (let S = 0; S < y.length; S++) {
                            const v = y[S].trim().split(":"), T = v[0].split("=")[0].trim().indexOf("?") >= 0, k = v[1].indexOf("?") >= 0, M = v[1].replace(/\?/gi, "").trim(), P = M.split("|");
                            let D = v[0].split("=")[1];
                            const C = Utilities.Types.getType(u[S]);
                            if (u[S] === void 0 && D) {
                              switch (D = D.trim(), M[0]) {
                                case "date": {
                                  let N = D.substring(D.indexOf("(") + 1, D.lastIndexOf(")"));
                                  N = N.length > 0 ? N.split(",").map(((A) => parseInt(A))) : [], D = N.length === 0 ? /* @__PURE__ */ new Date() : new Date(N[0], N[1], N[2]);
                                  break;
                                }
                                case "bool":
                                case "boolean":
                                  D = D === "true" || D === "1";
                                  break;
                                case "int":
                                case "integer":
                                  D = parseInt(D);
                                  break;
                                case "float":
                                case "number":
                                  D = parseFloat(D);
                                  break;
                                case "any":
                                case "object":
                                  D = D.indexOf("{") >= 0 ? JSON.parse(D) : D;
                              }
                              u.push(D);
                            } else T && w--;
                            if (M !== C && C) {
                              let N = !0;
                              for (let A = 0; A < P.length; A++) if (h(C, P[A])) {
                                N = !1;
                                break;
                              }
                              if (N && (u[S] !== null || !k)) {
                                const A = this.localize("methodInvalidValueType", { name: s, actualType: C, type: M, argumentIndex: S });
                                this.log(A);
                              }
                            }
                            if (u.length < w) {
                              const N = this.localize("methodInvalidArgumentsCount", { name: s, actualArgumentsCount: u.length, argumentsCount: w });
                              this.log(N);
                            }
                          }
                        }
                      }
                      this.context = this;
                      const g = r.apply(c, u);
                      if (p) {
                        const f = Utilities.Types.getType(g) === void 0 ? "void" : Utilities.Types.getType(g);
                        if (!h(f, p)) {
                          const b = this.localize("methodInvalidReturnType", { name: s, actualType: f, type: p });
                          this.log(b);
                        }
                      }
                      return this.context = m, g;
                    };
                  }, n = ["constructor", "ready", "created", "render", "attached", "detached", "appendChild", "insertBefore", "removeChild", "connect", "disconnectedCallback", "connectedCallback", "attributeChangedCallback", "propertyChangedHandler", "enableShadowDOM", "isInShadowDOM", "addPropertyBindings"];
                  for (let r in t) {
                    let s = t[r];
                    s && s.startsWith && s.startsWith("_") || n.find(((o) => o === s)) !== void 0 || i.extendedProperties[s] || Utilities.Types.isFunction(e[s]) && (i[s] = a(e[s], s));
                  }
                }
                defineElementProperties(t) {
                  if (!t) return;
                  const e = this, i = e.constructor.prototype, a = Object.keys(t), n = e.getStaticMember("properties");
                  Object.assign(i.extendedProperties, t), e.updateProperty = function(r, s, o) {
                    const l = r;
                    if (!s || s.readOnly) return;
                    if (s.allowedValues) {
                      let u = !1;
                      for (let p = 0; p < s.allowedValues.length; p++) if (s.allowedValues[p] === o) {
                        u = !0;
                        break;
                      }
                      if (!u) {
                        const p = JSON.stringify(s.allowedValues).replace(/\[|\]/gi, "").replace(",", ", ").replace(/"/gi, "'"), h = "'" + o + "'", g = l.localize("propertyInvalidValue", { name: s.name, actualValue: h, value: p });
                        return void l.log(g);
                      }
                    }
                    const c = s.name, m = l._properties[c].value;
                    if (s.validator && l[s.validator]) {
                      const u = l.context;
                      l.context = l;
                      const p = l[s.validator](m, o);
                      p !== void 0 && (o = p), l.context = u;
                    }
                    if (m !== o) {
                      if (l.propertyChanging) {
                        const u = l.propertyChanging(c, m, o);
                        if (u === !1 || u === null) return;
                      }
                      if (!s.hasOwnProperty("type")) {
                        const u = l.localize("propertyUnknownType", { name: c });
                        l.log(u);
                      }
                      if (!(s.type === "array" && JSON.stringify(m) === JSON.stringify(o))) {
                        if (o != null && s.type !== "any" && s.type !== "propertyObject" && s.type !== Utilities.Types.getType(o) && !s.validator || o === null && !s.nullable) {
                          let u = !0;
                          if (s.type === "object" && Utilities.Types.getType(o) === "array" && (u = !1), Utilities.Types.getType(o) === "number" && ["integer", "int", "float"].findIndex(((p) => p === s.type)) >= 0 && (u = !1), u) {
                            const p = l.localize("propertyInvalidValueType", { name: c, actualType: Utilities.Types.getType(o), type: s.type });
                            return void l.error(p);
                          }
                        }
                        if (s.isUpdating = !0, s.isHierarchicalProperty) {
                          const u = function(p, h) {
                            if (!p) return;
                            const g = Object.keys(p);
                            for (let f = 0; f < g.length; f++) {
                              const b = g[f], y = p[b];
                              typeof y == "object" && !Utilities.Types.isArray(y) && y && y.constructor !== Date ? u(y, h + "_" + b) : l[h + "_" + b] = y;
                            }
                          };
                          u(o, c);
                        } else l._properties[c].value = o;
                        if (!s.isUpdatingFromAttribute && s.reflectToAttribute && l.$.setAttributeValue(s.attributeName, o, s.type), l.isReady && (!l.ownerElement || l.ownerElement && l.ownerElement.isReady)) {
                          if (c === "wait" && (o || !m || l.isCompleted || (l.classList.remove("smart-visibility-hidden"), l.ownerElement && l.ownerElement.updateBoundMappedNodes(), l.updateBoundMappedNodes(), l.complete())), c === "renderMode") return;
                          if (l.context !== l && !l.wait) {
                            const p = l.context;
                            l.context = l, l.propertyChangedHandler(c, m, o), l.context = p, s.observer && l[s.observer] && (l.context = l, l[s.observer](m, o), l.context = document), l._watch && l._watch.properties.indexOf(c) >= 0 && l._watch.propertyChangedCallback(c, m, o);
                          }
                          const u = s.notify || l.boundProperties[c];
                          u && (l.$.fireEvent(s.attributeName + "-changed", { context: l.context, oldValue: m, value: l[c] }), l.boundProperties[c] && l.updateBoundNodes(c)), u && l.templateProperties && l.templateProperties[c] && l.refreshTemplate(), l.dataContextProperties && (c === "dataContext" ? l.applyDataContext() : l.dataContextProperties[c] && l.updateDataContextProperty(c));
                        }
                        s.isUpdating = !1;
                      }
                    }
                  };
                  for (let r = 0; r < a.length; r += 1) {
                    const s = a[r], o = t[s], l = Utilities.Core.toDash(s), c = o.type || "any", m = c.indexOf("?") >= 0 || c === "any";
                    m && c !== "any" && (o.type = c.substring(0, c.length - 1)), o.nullable = m, o.attributeName = l.toLowerCase(), o.name = s, o.reflectToAttribute = o.reflectToAttribute === void 0 || o.reflectToAttribute, o.inherit && n[s] && (o.value = n[s].value), o.extend && n[s] && Utilities.Core.assign(o.value, n[s].value), i.hasOwnProperty(s) || Object.defineProperty(i, s, { configurable: !1, enumerable: !0, get() {
                      if (this._properties[s]) return this._properties[s].value;
                    }, set(u) {
                      const p = this;
                      p.updateProperty(p, p._properties[s], u);
                    } });
                  }
                }
              }
              let customElements = [], registeredCallbacks = [], registeredLoadedCallbacks = [], isOldChrome = !1;
              const chromeAgent = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
              chromeAgent && parseInt(chromeAgent[2], 10) <= 50 && (isOldChrome = !0);
              class BaseCustomElement extends BaseElement {
                static get observedAttributes() {
                  let e = this, i = ["external-style"];
                  for (let a in e.prototype.extendedProperties) {
                    const n = e.prototype.extendedProperties[a];
                    i.push(n.attributeName);
                  }
                  return i;
                }
                static get styleUrls() {
                  return [];
                }
                static get styles() {
                  return "";
                }
                get styleUrl() {
                  return this._styleUrl;
                }
                set styleUrl(e) {
                  this._styleUrl = e;
                }
                get isInShadowDOM() {
                  const e = this, i = e.getRootNode();
                  return !e.hasAttribute("smart-blazor") && i !== document && i !== e;
                }
                getShadowRootOrBody() {
                  const e = this;
                  return e.isInShadowDOM && e.getRootNode().host ? e.getRootNode().host.shadowRoot : document.body;
                }
                get enableShadowDOM() {
                  return window[namespace].EnableShadowDOM;
                }
                importStyle(e, i) {
                  this._importStyle(e, i);
                }
                _importStyle(e, i) {
                  const a = this;
                  if (!a.shadowRoot || !e) return;
                  const n = (o) => {
                    const l = a.shadowRoot.children;
                    for (let m = 0; m < l.length; m++) {
                      const u = l[m];
                      if (u instanceof HTMLLinkElement && u.href === o) return i && i(), null;
                    }
                    const c = document.createElement("link");
                    return c.rel = "stylesheet", c.type = "text/css", c.href = o, c.onload = i, c;
                  }, r = (() => {
                    const o = a.shadowRoot.children;
                    let l = null;
                    for (let c = 0; c < o.length; c++) {
                      const m = o[c];
                      m instanceof HTMLLinkElement && (l = m);
                    }
                    return l;
                  })(), s = (o, l) => {
                    l.parentNode.insertBefore(o, l.nextSibling);
                  };
                  if (Array.isArray(e)) {
                    const o = document.createDocumentFragment();
                    for (let l = 0; l < e.length; l++) {
                      const c = n(e[l]);
                      c && o.appendChild(c);
                    }
                    r ? s(o, r) : a.shadowRoot.insertBefore(o, a.shadowRoot.firstChild);
                  } else {
                    const o = n(e);
                    if (!o) return;
                    r ? s(o, r) : a.shadowRoot.insertBefore(o, a.shadowRoot.firstChild);
                  }
                }
                attributeChanged(e, i, a) {
                  e === "style-url" && (this.styleUrl = a);
                }
                attributeChangedCallback(e, i, a) {
                  this.isReady && super.attributeChangedCallback(e, i, a);
                }
                constructor(e, i) {
                  super();
                  const a = this;
                  if (e) {
                    let n = null;
                    e && e.appendTo && !i && (i = e, e = e.appendTo, n = e), i && (a._initProperties = i);
                    const r = (s) => {
                      if (typeof s == "string" ? document.querySelector(s) : s) {
                        const o = typeof s == "string" ? document.querySelector(s) : s;
                        if (o instanceof HTMLDivElement) {
                          const l = document.createElement(a.tagName);
                          if (n) l._initProperties = i, o.appendChild(l);
                          else {
                            for (let c of o.attributes) l.setAttribute(c.name, o.getAttribute(c.name));
                            for (; o.childNodes.length; ) l.appendChild(o.firstChild);
                            typeof s == "string" && (l.id = s.substring(1)), l._initProperties = i, o.parentNode && o.parentNode.replaceChild(l, o);
                          }
                          return l;
                        }
                        if (i) {
                          const l = o.context;
                          if (o._initProperties = i, o.isReady) {
                            o.context = o;
                            const c = {}, m = {};
                            for (let u in i) c[u] = o[u], m[u] = i[u];
                            Object.getOwnPropertyNames(i).length > 0 && (o.initProperties(), o.propertyChangedHandler(i, c, m)), o.context = l;
                          }
                        }
                        return o;
                      }
                    };
                    if (typeof e == "string") {
                      const s = document.querySelectorAll(e), o = [];
                      if (s.length > 1) {
                        for (let l = 0; l < s.length; l++) {
                          const c = r(s[l]);
                          o.push(c);
                        }
                        return o;
                      }
                    } else if (e && e.length > 0) {
                      const s = e;
                      if (s.length > 1) {
                        for (let o = 0; o < s.length; o++) {
                          const l = r(s[o]);
                          customElements.push(l);
                        }
                        return customElements;
                      }
                    }
                    return r(e);
                  }
                  a._styleUrl = "", a.isUtilityElement || a.created();
                }
                _getRootShadowParent() {
                  let e = this.shadowParent;
                  for (; e; ) {
                    if (!e.shadowParent) return e;
                    e = e.shadowParent;
                  }
                  return e || this.shadowParent;
                }
                _getStyleUrl(e) {
                  let i = Utilities.Core.getScriptLocation() + window[namespace].StyleBaseUrl + e;
                  return this.shadowParent && (i = i.replace("scoped/", "")), i;
                }
                _getStyleUrls() {
                  const e = this;
                  e.nodeName.startsWith(namespace);
                  const i = e.getStaticMember("styleUrls", "array"), a = [];
                  for (let n = 0; n < i.length; n++) {
                    const r = i[n], s = e._getStyleUrl(r);
                    a.push(s);
                  }
                  return a;
                }
                _setupShadowRoot() {
                  const e = this;
                  e.classList.add("smart-element-init");
                  const i = (a) => {
                    a.$.root && (a.$.root.classList.add(namespace.toLowerCase() + "-element"), a.$.root.classList.add(e.nodeName.toLowerCase())), a.setup(), a.classList.remove("smart-element-init");
                  };
                  if (document.adoptedStyleSheets) if (window[namespace].AdoptedStyleSheets) window[namespace].AdoptedStyleSheetsLoaded ? (e.shadowRoot.adoptedStyleSheets = window[namespace].AdoptedStyleSheets, i(e)) : (e.shadowRoot.adoptedStyleSheets = window[namespace].AdoptedStyleSheets, window[namespace].AdoptedStyleSheetsLoadedQueue || (window[namespace].AdoptedStyleSheetsLoadedQueue = []), window[namespace].AdoptedStyleSheetsLoadedQueue.push(e));
                  else {
                    const a = new CSSStyleSheet();
                    let n = Utilities.Core.getScriptLocation() + "/styles/smart.default.css";
                    a.replace('@import url("' + n + '")').then((() => {
                      if (i(e), window[namespace].AdoptedStyleSheetsLoaded = !0, window[namespace].AdoptedStyleSheetsLoadedQueue) {
                        const r = window[namespace].AdoptedStyleSheetsLoadedQueue;
                        for (let s = 0; s < r.length; s++) {
                          const o = r[s];
                          i(o);
                        }
                        delete window[namespace].AdoptedStyleSheetsLoadedQueue;
                      }
                    })).catch(((r) => {
                      console.error("Failed to load:", r);
                    })), window[namespace].AdoptedStyleSheets = [a], document.adoptedStyleSheets = [a], e.shadowRoot.adoptedStyleSheets = window[namespace].AdoptedStyleSheets;
                  }
                }
                connect() {
                  const e = this;
                  window[namespace].EnableShadowDOM && !e.shadowRoot && e.isInShadowDOM !== !0 && (e.attachShadow({ mode: "open" }), e.shadowRoot && e.$.root && (e.shadowRoot.appendChild(e.$.root), e.$.root.classList.add(e.nodeName.toLowerCase()))), e.shadowRoot || e.shadowParent ? e.shadowRoot ? e._setupShadowRoot() : (e.shadowParent && window[namespace].EnableShadowDOM, e.setup()) : e.setup();
                }
                connectedCallback() {
                  const e = this;
                  if (e.isLoading || e.isUtilityElement) return;
                  e.classList.add("smart-element-init");
                  const i = function() {
                    e.classList.remove("smart-element-init");
                  };
                  if (document.readyState === "complete" && (window[namespace].isAngular === void 0 && (window[namespace].isAngular = document.body.querySelector("[ng-version]") !== null), window[namespace].isVue === void 0 && (window[namespace].isVue = document.querySelector(".vue-root") !== null), window[namespace].isAngular)) {
                    for (let a = 0; a < e.parents.length && !e.parents[a].nodeName.toLowerCase().startsWith(namespace.toLowerCase() + "-"); a++) if (e.parents[a].hasAttribute("ng-version") && !e.classList.contains("smart-angular")) {
                      window[namespace].RenderMode = "manual";
                      break;
                    }
                  }
                  if (document.readyState === "complete" && window[namespace].RenderMode !== "manual") {
                    const a = e.parents;
                    a.length && a[a.length - 1].nodeName === "HTML" || e.getRootNode().host ? (e.checkIsInDomTimer && clearInterval(e.checkIsInDomTimer), i(), e.connect()) : (e.checkIsInDomTimer && clearInterval(e.checkIsInDomTimer), a.length > 0 && (e.checkIsInDomTimer = setInterval((() => {
                      const n = e.parents;
                      n.length === 0 && clearInterval(e.checkIsInDomTimer), n.length > 0 && n[n.length - 1].nodeName === "HTML" && (clearInterval(e.checkIsInDomTimer), i(), e.connect());
                    }), 100)));
                  } else e.isLoading = !0, registeredLoadedCallbacks.push({ element: this, callback: (function() {
                    this.isReady || (i(), this.connect());
                  }).bind(e) });
                }
                disconnectedCallback() {
                  const e = this;
                  e.isAttached ? (e.shadowParent = null, e.detached()) : e._resetShadowParent();
                }
                adoptedCallback() {
                  this.setup();
                }
                appendTemplate(e) {
                  const i = this;
                  i.shadowRoot ? i.shadowRoot.appendChild(e) : i.appendChild(e);
                }
                _resetShadowParent() {
                  const e = this;
                  if (!window[namespace].EnableShadowDOM || e.shadowParent === null) return;
                  const i = [];
                  let a = e.parentNode;
                  for (; a && a.nodeType !== 9; ) {
                    if (a instanceof HTMLElement) i.push(a);
                    else if (a.nodeType === 11 && a.host) {
                      a = a.host;
                      continue;
                    }
                    a = a.parentNode;
                  }
                  for (let n = 0; n < i.length; n++) if (i[n] === e.shadowParent) return;
                  i.length > 0 && i[i.length - 1].nodeName === "HTML" && (e.shadowParent = null);
                }
              }
              class ElementRegistry {
                static register(e, i) {
                  const a = i.prototype;
                  let n = Core.toCamelCase(e).replace(/[a-z]+/, ""), r = i.version || window[namespace].Version;
                  if (window.customElements.get(e) && window.customElements.get(e).version === r) return;
                  let s = e;
                  for (r = r.split("."); window.customElements.get(e); ) e = s + "-" + r.join("."), r[2] = parseInt(r[2]) + 1;
                  if (!customElements[e]) {
                    if (e.startsWith(namespace.toLowerCase())) customElements[e] = window[namespace][n] = window[namespace.toLowerCase() + n] = i;
                    else {
                      let o = e.split("-")[0];
                      o = o.substring(0, 1).toUpperCase() + o.substring(1), window[namespace][o] || (window[namespace][o] = {}), customElements[e] = window[namespace][o][n] = window[o.toLowerCase() + n] = i, window[namespace][n] && (n = Core.toCamelCase(e)), window[namespace][n] = i;
                    }
                    a.elementName = n, a.defineElement(), registeredCallbacks[e] && registeredCallbacks[e](a), window.customElements.define(e, i);
                  }
                }
                static registerElements() {
                  const e = this;
                  if (e.toRegister) {
                    e.isRegistering = !0;
                    for (let i = 0; i < e.toRegister.length; i++) {
                      const a = e.toRegister[i];
                      e.register(a.tagName, a.element);
                    }
                    e.isRegistering = !1;
                  }
                }
                static get(e) {
                  if (customElements[e]) return customElements[e];
                }
                static whenRegistered(e, i) {
                  if (!e) throw new Error("Syntax Error: Invalid tag name");
                  const a = registeredCallbacks[e], n = this.get(e), r = n ? n.modules.length : 3;
                  try {
                    a || n ? !a && n ? (i(n.prototype), registeredCallbacks[e] = void 0) : a && !n ? registeredCallbacks[e] = function(s) {
                      a(s), i(s);
                    } : a && n && (n.proto && (a(n.proto), i(n.proto)), registeredCallbacks[e] = void 0) : registeredCallbacks[e] = function(s) {
                      try {
                        i(s);
                      } catch (o) {
                        const l = o instanceof Error ? o.message : o.toString();
                        console.log(l);
                      }
                    };
                  } catch (s) {
                    const o = s instanceof Error ? s.message : s.toString();
                    console.log(o);
                  }
                  if (n && r !== n.prototype.modules.length) {
                    const s = document.querySelectorAll(e);
                    for (let o = 0; o < s.length; o++) {
                      const l = s[o];
                      l.isCreated && l._initElement();
                    }
                  }
                }
              }
              ElementRegistry.lazyRegister = !1, ElementRegistry.tagNames = [];
              class Observable {
                constructor(e, i) {
                  const a = this;
                  this.name = "observable", e && Object.assign(a, e);
                  var n;
                  return n = e, Object.getOwnPropertyNames(Object.getPrototypeOf(n)).forEach(((r) => r === "constructor" || !!r.startsWith("_") || void (a[r] = n[r]))), new Proxy(a, { deleteProperty: function(r, s) {
                    return delete r[s], !0;
                  }, get: function(r, s) {
                    return r[s];
                  }, set: function(r, s, o) {
                    const l = r[s];
                    return l === o || (r[s] = o, !(s !== "notifyFn" && !s.startsWith("_") && s !== "canNotify") || !(!i || i.indexOf(s) !== -1) || !a.canNotify || (a._notify({ target: r, propertyName: s, oldValue: l, newValue: o }), !0));
                  } });
                }
                get canNotify() {
                  const e = this;
                  return e._canNotify === void 0 && (e._canNotify = !0), e._canNotify;
                }
                set canNotify(e) {
                  this._canNotify = e;
                }
                _notify(e) {
                  const i = this;
                  if (i.canNotify && i.notifyFn) for (let a = 0; a < i.notifyFn.length; a++) i.notifyFn[a](e);
                }
                notify(e) {
                  const i = this;
                  e && (i.notifyFn || (i.notifyFn = []), i.notifyFn.push(e));
                }
              }
              class ObservableArray {
                constructor() {
                  const e = this;
                  e.name = "observableArray", e.observables = arguments.length < 3 ? null : arguments[2];
                  const i = new Proxy(e, { deleteProperty: function(a, n) {
                    return delete a[n], !0;
                  }, apply: function(a, n, r) {
                    return a.apply(n, r);
                  }, get: function(a, n) {
                    return typeof (r = n) == "symbol" || typeof r == "object" && Object.prototype.toString.call(r) === "[object Symbol]" || a[n] || isNaN(parseInt(n)) ? a[n] : e.getItem(parseInt(n));
                    var r;
                  }, set: function(a, n, r) {
                    return a[n] || isNaN(parseInt(n)) ? (a[n] = r, !0) : (e.setItem(parseInt(n), r), !0);
                  } });
                  if (e._addArgs = { eventName: "change", object: i, action: "add", index: null, removed: new Array(), addedCount: 1 }, e._removeArgs = { eventName: "change", object: i, action: "remove", index: null, removed: null, addedCount: 0 }, arguments.length >= 1 && Array.isArray(arguments[0])) {
                    e._array = [];
                    const a = arguments[0];
                    for (let n = 0, r = a.length; n < r; n++) {
                      const s = e._getItem(e._array.length, a[n]);
                      e._array.push(s);
                    }
                  } else e._array = Array.apply(null, arguments);
                  return arguments.length === 2 && (e.notifyFn = arguments[1]), i;
                }
                get canNotify() {
                  const e = this;
                  return e._canNotify === void 0 && (e._canNotify = !0), e._canNotify;
                }
                set canNotify(e) {
                  this._canNotify = e;
                }
                _notify(e) {
                  const i = this;
                  i.canNotify && i.notifyFn && i.notifyFn(e);
                }
                notify(e) {
                  e && (this.notifyFn = e);
                }
                toArray() {
                  return this._array;
                }
                _getItem(e, i) {
                  const a = this;
                  return typeof i == "string" || typeof i == "number" || i === void 0 ? i : new Proxy(i, { deleteProperty: function(n, r) {
                    return delete n[r], !0;
                  }, set: function(n, r, s) {
                    const o = n[r];
                    return n[r] = s, !a._canNotify || n.canNotify === !1 || (a.observables && !a.observables[r] || a._notify({ eventName: "change", object: a, target: n, action: "update", index: e, path: e + "." + r, oldValue: o, newValue: s, propertyName: r }), !0);
                  } });
                }
                getItem(e) {
                  return this._array[e];
                }
                setItem(e, i) {
                  const a = this, n = a._array[e];
                  a._array[e] = a._getItem(e, i), a._notify({ eventName: "change", object: a._array, action: "update", index: e, removed: [n], addedCount: 1 });
                }
                get length() {
                  return this._array.length;
                }
                set length(e) {
                  const i = this;
                  Types.isNumber(e) && i._array && i._array.length !== e && i.splice(e, i._array.length - e);
                }
                toString() {
                  return this._array.toString();
                }
                toLocaleString() {
                  return this._array.toLocaleString();
                }
                concat() {
                  const e = this;
                  e._addArgs.index = e._array.length;
                  const i = e._array.concat.apply(e._array, arguments);
                  return new Smart.ObservableArray(i);
                }
                join(e) {
                  return this._array.join(e);
                }
                pop() {
                  const e = this;
                  e._removeArgs.index = e._array.length - 1, delete e[e._array.length - 1];
                  const i = e._array.pop();
                  return e._removeArgs.removed = [i], e._notify(e._removeArgs), e._notifyLengthChange(), i;
                }
                push() {
                  const e = this;
                  if (e._addArgs.index = e._array.length, arguments.length === 1 && Array.isArray(arguments[0])) {
                    const i = arguments[0];
                    for (let a = 0, n = i.length; a < n; a++) {
                      const r = e._getItem(e._array.length, i[a]);
                      e._array.push(r);
                    }
                  } else {
                    const i = e._getItem(e._addArgs.index, arguments[0]);
                    e._array.push.apply(e._array, [i]);
                  }
                  return e._addArgs.addedCount = e._array.length - e._addArgs.index, e._notify(e._addArgs), e._notifyLengthChange(), e._array.length;
                }
                _notifyLengthChange() {
                  const e = this;
                  if (!e.canNotify) return;
                  const i = e._createPropertyChangeData("length", e._array.length);
                  e._notify(i);
                }
                _createPropertyChangeData(e, i, a) {
                  return { eventName: "change", object: this, action: e, value: i, oldValue: a };
                }
                reverse() {
                  return this._array.reverse();
                }
                shift() {
                  const e = this, i = e._array.shift();
                  return e._removeArgs.index = 0, e._removeArgs.removed = [i], e._notify(e._removeArgs), e._notifyLengthChange(), i;
                }
                slice(e, i) {
                  return this._array.slice(e, i);
                }
                sort(e) {
                  return this._array.sort(e);
                }
                splice(e, i, a) {
                  const n = this, r = n._array.length;
                  let s;
                  if (a && a.length) for (let o = 0; o < a.length; o++) s = n._array.splice(e + o, i, a[o]);
                  else s = n._array.splice.apply(n._array, arguments);
                  if (a) {
                    let o = n.canNotify;
                    if (n.canNotify = !1, a.length) for (let l = 0; l < a.length; l++) n.setItem(e + l, a[l]);
                    else n.setItem(e, a);
                    n.canNotify = o, n._notify({ eventName: "change", object: this, action: "add", index: e, added: s, addedCount: n._array.length > r ? n._array.length - r : 0 });
                  } else n._notify({ eventName: "change", object: this, action: "remove", index: e, removed: s, addedCount: n._array.length > r ? n._array.length - r : 0 });
                  return n._array.length !== r && n._notifyLengthChange(), s;
                }
                unshift() {
                  const e = this, i = e._array.length, a = e._array.unshift.apply(e._array, arguments);
                  return e._addArgs.index = 0, e._addArgs.addedCount = a - i, e._notify(this._addArgs), e._notifyLengthChange(), a;
                }
                indexOf(e, i) {
                  const a = this;
                  for (let n = i || 0, r = a._array.length; n < r; n++) if (a._array[n] === e) return n;
                  return -1;
                }
                lastIndexOf(e, i) {
                  const a = this;
                  for (let n = i || a._array.length - 1; n >= 0; n--) if (a._array[n] === e) return n;
                  return -1;
                }
                find(e, i) {
                  return this._array.find(e, i);
                }
                findIndex(e, i) {
                  return this._array.findIndex(e, i);
                }
                every(e, i) {
                  return this._array.every(e, i);
                }
                some(e, i) {
                  return this._array.some(e, i);
                }
                forEach(e, i) {
                  this._array.forEach(e, i);
                }
                map(e, i) {
                  return this._array.map(e, i);
                }
                filter(e, i) {
                  return this._array.filter(e, i);
                }
                reduce(e, i) {
                  return i !== void 0 ? this._array.reduce(e, i) : this._array.reduce(e);
                }
                reduceRight(e, i) {
                  return i !== void 0 ? this._array.reduceRight(e, i) : this._array.reduceRight(e);
                }
                move(e, i) {
                  this.splice(i, 0, this.splice(e, 1)[0]);
                }
              }
              function Init(t, e) {
                const i = e.properties;
                e._properties = [];
                const a = function(r, s) {
                  const o = Object.keys(r);
                  for (let l = 0; l < o.length; l++) {
                    const c = o[l], m = r[c];
                    e._properties[s + c] = m, Array.isArray(m) ? e._properties[s + c] = new ObservableArray(m, (function(u) {
                      const p = c + "." + u.path, h = u.newValue, g = document.querySelector(t);
                      if (g) {
                        const f = p.split(".");
                        let b = g;
                        for (let y = 0; y < f.length; y++)
                          b = b[f[y]];
                        b = h;
                      }
                    })) : (Object.defineProperty(r, c, { configurable: !1, enumerable: !0, get: () => e._properties[s + c], set(u) {
                      e._properties[s + c] = u;
                    } }), m && m.constructor.name === "DataAdapter" || m && typeof m == "object" && Smart.DataAdapter && m instanceof Smart.DataAdapter || typeof m == "object" && m && Object.keys(m).length > 0 && a(m, s + c + "."));
                  }
                };
                a(i, ""), Object.defineProperty(e, "properties", { configurable: !1, enumerable: !0, get: () => i });
                const n = document.querySelector(t);
                if (n && n.isReady) for (let r in i) if (r === "properties") {
                  const s = i[r];
                  for (let o in s) n[o] = s[o];
                } else n[r] = i[r];
                else if (n) {
                  n.props = {};
                  for (let r in i) n.props[r] = i[r];
                }
              }
              let userDefinedSettings = {};
              window[namespace] && (userDefinedSettings = window[namespace]), window[namespace] = function(t, e) {
                let i = t;
                if (t) {
                  if (t.indexOf("#") >= 0 || t.indexOf(".") >= 0) return data[t] ? data[t] : e ? (data[t] = new e(), Init(t, data[t]), data[t]) : void 0;
                  if (e) {
                    if (ElementRegistry.tagNames[t] = e, ElementRegistry.lazyRegister) {
                      ElementRegistry.toRegister || (ElementRegistry.toRegister = []);
                      const a = Core.toCamelCase(i).replace(/[a-z]+/, "");
                      return window[namespace][a] = e, void ElementRegistry.toRegister.push({ tagName: i, element: e });
                    }
                    ElementRegistry.register(i, e);
                  }
                }
              }, window.addEventListener("load", (function() {
                const t = window[namespace].Elements.tagNames;
                let e = [];
                for (let i in t) {
                  const a = t[i];
                  let n = document.querySelectorAll("[" + i + "]");
                  for (let s = 0; s < n.length; s++) {
                    const o = n[s];
                    o instanceof HTMLDivElement && (o.__proto__ = a.prototype, o.created(), o.connectedCallback()), o.classList.add("smart-element-ready");
                  }
                  let r = a.name;
                  r === "Item" && (r = "ListItem"), n = document.querySelectorAll('[is="' + namespace.toLocaleLowerCase() + r + '"]');
                  for (let s = 0; s < n.length; s++) e.push(n[s]);
                }
                if (e.length > 0) {
                  const i = (a) => {
                    let n = [], r = a.parentNode;
                    for (; r && r.nodeType !== 9; ) r instanceof HTMLElement && n.push(r), r = r.parentNode;
                    return n;
                  };
                  e.sort((function(a, n) {
                    let r = i(a).length, s = i(n).length;
                    return r < s ? 1 : r > s ? -1 : 0;
                  }));
                  for (let a = 0; a < e.length; a++) {
                    const n = e[a], r = n.getAttribute("is");
                    let s;
                    s = r === "smartItem" ? new window.smartListItem(n) : new window[r](n), s.removeAttribute("is");
                  }
                }
              }));
              class Component {
                constructor(e, i) {
                  const a = this.name;
                  let n = null;
                  return e ? n = new window[a](e, i) : (n = new window[a](), n._initProperties = i), this._element = n, n;
                }
                get name() {
                  return "Component";
                }
                get element() {
                  return this._element;
                }
              }
              const connectElements = function() {
                if (document.readyState === "complete" && window[namespace].RenderMode !== "manual") {
                  registeredLoadedCallbacks.sort((function(t, e) {
                    let i = t.element.parents.length, a = e.element.parents.length;
                    return i < a ? -1 : i > a ? 1 : 0;
                  }));
                  for (let t = 0; t < registeredLoadedCallbacks.length; t++) window[namespace].RenderMode = "", registeredLoadedCallbacks[t].element.isLoading = !1, registeredLoadedCallbacks[t].callback(), window[namespace].RenderMode = "";
                  registeredLoadedCallbacks = [], document.removeEventListener("readystatechange", connectElements);
                }
              }, render = function() {
                const t = () => {
                  window[namespace].RenderMode = "", connectElements();
                };
                document.readyState === "complete" ? t() : (window.removeEventListener("load", t), window.addEventListener("load", t));
              };
              Object.assign(window[namespace], { Elements: ElementRegistry, Modules: [], BaseElement: BaseCustomElement, Utilities, Import, ObservableArray, Observable, Component, Theme: userDefinedSettings.Theme || "", EnableShadowDOM: userDefinedSettings.ShadowDom || !1, BaseUrl: "./", StyleBaseUrl: "/styles/default/", Version, Templates: templates, RenderMode: userDefinedSettings.RenderMode || "auto", Render: render, Data: data, Mode: userDefinedSettings.Mode || "production", License: userDefinedSettings.License || "Evaluation" });
              let theme = window[namespace].Theme;
              window[namespace].RenderMode !== "manual" && document.addEventListener("readystatechange", connectElements), Object.defineProperty(window[namespace], "Theme", { configurable: !1, enumerable: !0, get: () => theme, set(t) {
                const e = theme;
                theme = t, $document.fireEvent("theme-changed", { oldValue: e, newValue: t }, { bubbles: !0, cancelable: !0 });
              } }), window[namespace]("smart-base-element", window[namespace].BaseElement), window[namespace]("smart-content-element", class extends window[namespace].BaseElement {
                static get properties() {
                  return { content: { type: "any", reflectToAttribute: !1 }, innerHTML: { type: "string", reflectToAttribute: !1 } };
                }
                template() {
                  return "<div inner-h-t-m-l='[[innerHTML]]'></div>";
                }
                ready() {
                  super.ready(), this.applyContent();
                }
                refresh() {
                }
                clearContent() {
                  const t = this;
                  for (; t.$.content.firstChild; ) t.$.content.removeChild(t.$.content.firstChild);
                }
                applyContent() {
                  const t = this;
                  if (t.content === void 0) return void (t.content = t.$.content);
                  if (t.content === "" || t.content === null) return void t.clearContent();
                  if (t.content instanceof HTMLElement) return t.clearContent(), void t.$.content.appendChild(t.content);
                  const e = document.createDocumentFragment();
                  let i = document.createElement("div");
                  e.appendChild(i), t.content instanceof HTMLElement ? i.appendChild(t.content) : i.innerHTML = t.content;
                  let a = Array.from(i.childNodes);
                  i.parentNode.removeChild(i);
                  for (let n = 0; n < a.length; n++) e.appendChild(a[n]);
                  t.clearContent(), t.$.content.appendChild(e);
                }
                propertyChangedHandler(t, e, i) {
                  super.propertyChangedHandler(t, e, i);
                  const a = this;
                  e !== i && (t === "innerHTML" && (a.content = i, a.applyContent(), a.innerHTML = a.content = Utilities.Core.html(a.$.content)), t === "content" && a.applyContent());
                }
              }), window[namespace]("smart-scroll-viewer", class extends window[namespace].ContentElement {
                static get properties() {
                  return { autoRefresh: { type: "boolean", value: !1 }, horizontalScrollBarVisibility: { type: "string", value: "auto", allowedValues: ["auto", "disabled", "hidden", "visible"] }, touchScrollRatio: { type: "any", value: null }, touchVelocityCoefficient: { type: "number", value: 50 }, verticalScrollBarVisibility: { type: "string", value: "auto", allowedValues: ["auto", "disabled", "hidden", "visible"] } };
                }
                static get listeners() {
                  return { touchmove: "_touchmoveHandler", touchstart: "_touchstartHandler", wheel: "_mouseWheelHandler", "document.up": "_upHandler" };
                }
                static get styleUrls() {
                  return ["smart.scrollviewer.css"];
                }
                template() {
                  return `<div id="container" class="smart-container" role="presentation">
                        <div id="scrollViewerContainer" class="smart-scroll-viewer-container" role="presentation">
                            <div id="scrollViewerContentContainer" inner-h-t-m-l='[[innerHTML]]' class="smart-scroll-viewer-content-container" role="presentation">
                                <content></content>
                            </div>
                        </div>
                        <smart-scroll-bar id="verticalScrollBar" theme="[[theme]]"  animation="[[animation]]" disabled="[[disabled]]" right-to-left="[[rightToLeft]]" orientation="vertical"></smart-scroll-bar>
                        <smart-scroll-bar id="horizontalScrollBar" theme="[[theme]]" disabled="[[disabled]]" right-to-left="[[rightToLeft]]"></smart-scroll-bar>
                    </div>`;
                }
                appendChild(t) {
                  const e = this;
                  if (t) {
                    if (!e.isCompleted || t.classList && t.classList.contains("smart-resize-trigger-container")) {
                      const i = Array.prototype.slice.call(arguments, 2);
                      return HTMLElement.prototype.appendChild.apply(e, i.concat(Array.prototype.slice.call(arguments)));
                    }
                    e.$.scrollViewerContentContainer.appendChild(t);
                  }
                }
                removeChild(t) {
                  const e = this;
                  if (t) {
                    if (!e.isCompleted || t.classList && t.classList.contains("smart-resize-trigger-container")) {
                      const i = Array.prototype.slice.call(arguments, 2);
                      return HTMLElement.prototype.removeChild.apply(e, i.concat(Array.prototype.slice.call(arguments)));
                    }
                    e.$.scrollViewerContentContainer.removeChild(t);
                  }
                }
                removeAll() {
                  const t = this;
                  t.isCompleted && (t.$.scrollViewerContentContainer.innerHTML = "");
                }
                _horizontalScrollbarHandler(t) {
                  const e = this;
                  e.$.scrollViewerContentContainer.style.left = (e.rightToLeft ? 1 : -1) * e.scrollLeft + "px", t.stopPropagation && t.stopPropagation(), e.onHorizontalChange && e.onHorizontalChange(t);
                }
                _verticalScrollbarHandler(t) {
                  const e = this;
                  e.$.scrollViewerContentContainer.style.top = -e.scrollTop + "px", t.stopPropagation && t.stopPropagation(), e.onVerticalChange && e.onVerticalChange(t);
                }
                _touchmoveHandler(t) {
                  const e = this;
                  if (e._touchmoveInside && t.cancelable) return t.preventDefault(), void t.stopPropagation();
                  const i = e.scrollHeight > 0, a = e.scrollWidth > 0, n = e._touchCoords;
                  if (!i && !a || !n) return;
                  const r = t.touches[0];
                  let s, o, l, c;
                  e._touchCoords = [r.pageX, r.pageY], i ? (s = e.scrollTop, o = e.scrollHeight, l = r.pageY, c = n[1]) : (s = e.scrollLeft, o = e.scrollWidth, l = r.pageX, c = n[0]);
                  const m = parseFloat(l.toFixed(5)), u = parseFloat(c.toFixed(5));
                  s === 0 && m >= u || s === o && m <= u || (l !== c && (e._touchmoveInside = !0), t.cancelable && (t.preventDefault(), t.stopPropagation()));
                }
                _touchstartHandler(t) {
                  const e = t.touches[0];
                  this._touchCoords = [e.pageX, e.pageY];
                }
                _mouseWheelHandler(t) {
                  const e = this;
                  if (!e.disabled && (e.computedHorizontalScrollBarVisibility || e.computedVerticalScrollBarVisibility)) {
                    if (t.shiftKey && e.computedHorizontalScrollBarVisibility) {
                      const i = e.scrollLeft;
                      return i === 0 && t.deltaX < 0 || i === e.scrollHeight && t.deltaX > 0 ? void 0 : (t.stopPropagation(), t.preventDefault(), void (e.scrollWidth > 0 && e.scrollTo(void 0, e.scrollLeft + e._getScrollCoefficient(t, e.offsetWidth))));
                    }
                    if (e.computedVerticalScrollBarVisibility) {
                      const i = e.scrollTop;
                      if (i === 0 && t.deltaY < 0 || i === e.scrollHeight && t.deltaY > 0) return;
                      if (t.stopPropagation(), t.preventDefault(), e.scrollHeight > 0) {
                        e._wheelrafId = 0;
                        const a = () => {
                          e.scrollTop += t.deltaY;
                        };
                        cancelAnimationFrame(e._wheelrafId), e._wheelrafId = 0, e._wheelrafId = requestAnimationFrame(a);
                      }
                    }
                  }
                }
                _overriddenHandler() {
                }
                _upHandler() {
                  delete this._touchCoords, delete this._touchmoveInside;
                }
                _getScrollCoefficient(t, e) {
                  const i = t.deltaMode, a = Math.abs(t.deltaY);
                  let n;
                  return i === 0 ? n = a < 33.333333333333336 ? a : e : i === 1 ? n = a < 1 ? a * 33.333333333333336 : e : i === 2 && (n = e), t.deltaY < 0 ? -n : n;
                }
                applyContent() {
                  super.applyContent(), this.refresh();
                }
                get computedHorizontalScrollBarVisibility() {
                  const t = this;
                  return t._scrollView && t._scrollView.hScrollBar ? !t._scrollView.hScrollBar.$.hasClass("smart-hidden") : null;
                }
                get computedVerticalScrollBarVisibility() {
                  const t = this;
                  return t._scrollView && t._scrollView.vScrollBar ? !t._scrollView.vScrollBar.$.hasClass("smart-hidden") : null;
                }
                scrollTo(t, e) {
                  const i = this;
                  i._scrollView && (t !== void 0 && i._scrollView.scrollTo(t), e !== void 0 && i._scrollView.scrollTo(e, !1));
                }
                scrollTopTo(t) {
                  this._scrollView && this._scrollView.scrollTo(t);
                }
                scrollLeftTo(t) {
                  this._scrollView && this._scrollView.scrollTo(t, !1);
                }
                refreshScrollBarsVisibility() {
                  const t = this;
                  t._scrollView && (t._scrollView.hScrollBar.disabled = t.disabled, t._scrollView.vScrollBar.disabled = t.disabled, t.horizontalScrollBarVisibility === "disabled" && (t._scrollView.hScrollBar.disabled = !0), t.verticalScrollBarVisibility === "disabled" && (t._scrollView.vScrollBar.disabled = !0), t.scrollWidth > 0 ? t._scrollView.hScrollBar.$.removeClass("smart-hidden") : t.horizontalScrollBarVisibility !== "visible" && t._scrollView.hScrollBar.$.addClass("smart-hidden"), t.scrollHeight > 0 ? t._scrollView.vScrollBar.$.removeClass("smart-hidden") : t.verticalScrollBarVisibility !== "visible" && t._scrollView.vScrollBar.$.addClass("smart-hidden"), t.horizontalScrollBarVisibility === "hidden" && t._scrollView.hScrollBar.$.addClass("smart-hidden"), t.verticalScrollBarVisibility === "hidden" && t._scrollView.vScrollBar.$.addClass("smart-hidden"), t.horizontalScrollBarVisibility === "visible" && t._scrollView.hScrollBar.$.removeClass("smart-hidden"), t.verticalScrollBarVisibility === "visible" && (t._scrollView.vScrollBar.$.removeClass("smart-hidden"), t.disabled || (t._scrollView.vScrollBar.disabled = t.scrollHeight <= 0)), t.computedHorizontalScrollBarVisibility && t.computedVerticalScrollBarVisibility ? (t._scrollView.hScrollBar.$.addClass("bottom-corner"), t._scrollView.vScrollBar.$.addClass("bottom-corner")) : (t._scrollView.hScrollBar.$.removeClass("bottom-corner"), t._scrollView.vScrollBar.$.removeClass("bottom-corner")));
                }
                ready() {
                  super.ready();
                  const t = this;
                  t.$.verticalScrollBar.onChange = (e) => {
                    e.detail = e, t._verticalScrollbarHandler(e);
                  }, t.$.horizontalScrollBar.onChange = (e) => {
                    e.detail = e, t._horizontalScrollbarHandler(e);
                  }, t.$.verticalScrollBar.setAttribute("aria-controls", t.id), t.$.horizontalScrollBar.setAttribute("aria-controls", t.id), t._customScrollView || (t._scrollView = new Smart.Utilities.Scroll(t, t.$.horizontalScrollBar, t.$.verticalScrollBar)), t.refresh();
                }
                refresh() {
                  const t = this;
                  function e() {
                    const r = t.$.scrollViewerContainer.classList.contains("vscroll");
                    t.$.scrollViewerContainer.classList.remove("vscroll");
                    const s = t.$.scrollViewerContentContainer.offsetWidth - t.$.scrollViewerContainer.offsetWidth;
                    return s > 0 && t.horizontalScrollBarVisibility !== "hidden" || t.horizontalScrollBarVisibility === "visible" ? t.$.scrollViewerContainer.classList.add("hscroll") : t.$.scrollViewerContainer.classList.remove("hscroll"), r && t.$.scrollViewerContainer.classList.add("vscroll"), s;
                  }
                  function i() {
                    let r;
                    const s = t.$.scrollViewerContainer.classList.contains("hscroll");
                    if (t.$.scrollViewerContainer.classList.remove("hscroll"), Smart.Utilities.Core.Browser.Safari) {
                      const o = t.$.scrollViewerContentContainer.getBoundingClientRect().height, l = t.$.scrollViewerContainer.getBoundingClientRect().height;
                      r = o && l ? parseInt(o) - parseInt(l) : t.$.scrollViewerContentContainer.offsetHeight - t.$.scrollViewerContainer.offsetHeight;
                    } else r = t.$.scrollViewerContentContainer.offsetHeight - t.$.scrollViewerContainer.offsetHeight;
                    return t.virtualScrollHeight && (r = t.virtualScrollHeight), r > 0 && t.verticalScrollBarVisibility !== "hidden" || t.verticalScrollBarVisibility === "visible" ? t.$.scrollViewerContainer.classList.add("vscroll") : t.$.scrollViewerContainer.classList.remove("vscroll"), s && t.$.scrollViewerContainer.classList.add("hscroll"), r;
                  }
                  if (!t.$.scrollViewerContentContainer) return;
                  t.verticalScrollBarVisibility === "hidden" && t.$.scrollViewerContentContainer.setAttribute("disable-vertical", ""), t.horizontalScrollBarVisibility === "hidden" && t.$.scrollViewerContentContainer.setAttribute("disable-horizontal", "");
                  let a = t.scrollWidth, n = t.scrollHeight;
                  t.scrollWidth = e(), t.scrollHeight = i(), t.scrollHeight && n === t.scrollHeight || (t.scrollWidth = e()), t.scrollWidth && a === t.scrollWidth || (t.scrollHeight = i()), t.computedVerticalScrollBarVisibility && (t.scrollHeight += t._scrollView.hScrollBar.offsetHeight), t.computedHorizontalScrollBarVisibility && (t.scrollWidth += t._scrollView.vScrollBar.offsetWidth), t.scrollHeight === 0 && t.scrollWidth > 0 && t.$.container.offsetHeight - t.$.content.offsetHeight < 5 && (t.$.container.style.paddingBottom = t._scrollView.hScrollBar.offsetHeight + "px"), t.autoRefresh && (t.$.scrollViewerContainer.scrollLeft = 0, t.$.scrollViewerContainer.scrollTop = 0);
                }
                attached() {
                  const t = this;
                  super.attached(), t._scrollView || t._customScrollView || (t._scrollView = new Smart.Utilities.Scroll(t, t.$.horizontalScrollBar, t.$.verticalScrollBar));
                }
                detached() {
                  const t = this;
                  super.detached(), t._scrollView && (t._scrollView.unlisten(), delete t._scrollView);
                }
                get scrollWidth() {
                  const t = this;
                  return t._scrollView && t._scrollView.hScrollBar ? t._scrollView.hScrollBar.max === 1 && t.horizontalScrollBarVisibility === "visible" ? 0 : t._scrollView.hScrollBar.max : -1;
                }
                set scrollWidth(t) {
                  const e = this;
                  t < 0 && (t = 0), e._scrollView && e._scrollView.hScrollBar && (t === 0 && e.horizontalScrollBarVisibility === "visible" ? e._scrollView.hScrollBar.max = 0 : e._scrollView.hScrollBar.max = t, e.refreshScrollBarsVisibility());
                }
                get scrollHeight() {
                  const t = this;
                  return t._scrollView && t._scrollView.vScrollBar ? t._scrollView.vScrollBar.max === 1 && t.verticalScrollBarVisibility === "visible" ? 0 : t._scrollView.vScrollBar.max : 0;
                }
                set scrollHeight(t) {
                  const e = this;
                  t < 0 && (t = 0), e._scrollView && e._scrollView.vScrollBar && (t === 0 && e.verticalScrollBarVisibility === "visible" ? e._scrollView.vScrollBar.max = 1 : e._scrollView.vScrollBar.max = t, e.refreshScrollBarsVisibility());
                }
                get scrollLeft() {
                  const t = this;
                  return t._scrollView && t._scrollView.hScrollBar ? t._scrollView.hScrollBar.value : 0;
                }
                set scrollLeft(t) {
                  const e = this;
                  t < 0 && (t = 0), e._scrollView && e._scrollView.hScrollBar && (e._scrollView.hScrollBar.value = t);
                }
                get scrollTop() {
                  const t = this;
                  return t._scrollView && t._scrollView.vScrollBar ? t._scrollView.vScrollBar.value : 0;
                }
                set scrollTop(t) {
                  const e = this;
                  t < 0 && (t = 0), e._scrollView && e._scrollView.vScrollBar && (e._scrollView.vScrollBar.value = t);
                }
                getScrollLeft() {
                  return this.scrollLeft;
                }
                getScrollTop() {
                  return this.scrollTop;
                }
                getScrollWidth() {
                  return this.scrollWidth;
                }
                getScrollHeight() {
                  return this.scrollHeight;
                }
                propertyChangedHandler(t, e, i) {
                  const a = this;
                  super.propertyChangedHandler(t, e, i), t !== "animation" && t !== "theme" && a.refresh();
                }
              }), window[namespace].Utilities.Assign("PositionDetection", class {
                constructor(t, e, i, a) {
                  const n = this;
                  if (e) {
                    const r = "dropDown" + Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
                    e.id = r, t.setAttribute("aria-owns", r);
                  }
                  n.context = t, n.dropDown = e, n.defaultParent = i, n.closeMethod = a;
                }
                handleAutoPositioning() {
                  const t = this, e = t.context;
                  if (e.dropDownPosition !== "auto" || e.disabled || e.isHidden) return;
                  const i = window.requestAnimationFrame;
                  let a, n = Date.now();
                  return a = i((function r() {
                    e.isHidden || document.hidden || (a = i(r), e.dropDownPosition === "auto" && !e.disabled && (e.isInShadowDOM ? document.body.contains(e.shadowParent) : document.body.contains(e)) || cancelAnimationFrame(a), e.isHidden && cancelAnimationFrame(a), Date.now() - n >= 200 && (t.scrollHandler(), n = Date.now()));
                  }));
                }
                checkBrowserBounds(t) {
                  const e = this.context;
                  if (e.dropDownPosition === "auto" && !e.disabled) switch (t) {
                    case "vertically":
                      this.checkBrowserBoundsVertically();
                      break;
                    case "horizontally":
                      this.checkBrowserBoundsHorizontally();
                      break;
                    default:
                      this.checkBrowserBoundsVertically(), this.checkBrowserBoundsHorizontally();
                  }
                }
                checkBrowserBoundsHorizontally() {
                  const t = this.context, e = this.dropDown;
                  let i, a = 0;
                  Core.isMobile || window.innerWidth === document.documentElement.clientWidth || (a = window.innerWidth - document.documentElement.clientWidth), t._dropDownParent !== null ? i = !0 : e.style.left = "";
                  const n = window.innerWidth - a;
                  let r = t.getBoundingClientRect().left;
                  if (r < 0 && (e.style.left = (i ? 0 : Math.abs(r)) + "px", r = parseFloat(e.style.left)), r + e.offsetWidth > n) {
                    let s = r - Math.abs(n - r - e.offsetWidth);
                    i && (s += window.pageXOffset), e.style.left = (i ? s : s - r) + "px", window.innerWidth === document.documentElement.clientWidth && (e.style.left = parseFloat(e.style.left) + a + "px"), i && window.innerHeight === document.documentElement.clientHeight && this.positionDropDown(!0);
                  }
                }
                checkBrowserBoundsVertically(t) {
                  const e = this.context, i = this.dropDown, a = e._dropDownListPosition;
                  t || (t = e.getBoundingClientRect()), t.height !== 0 && (document.documentElement.clientHeight - Math.abs(t.top + t.height + i.offsetHeight) >= 0 ? e._dropDownListPosition = "bottom" : t.top - i.offsetHeight >= 0 ? e._dropDownListPosition = "top" : e._dropDownListPosition = "overlay-center", this.updatePositionAttribute(a, e._dropDownListPosition));
                }
                scrollHandler() {
                  const t = this.context;
                  if (!t.parentElement) return;
                  const e = t.getBoundingClientRect();
                  if (e.top === t._positionTop) return;
                  const i = t._dropDownListPosition;
                  this.checkBrowserBoundsVertically(e), t._dropDownListPosition !== i && this.positionDropDown(), t._positionTop = e.top;
                }
                getDropDownParent(t) {
                  const e = this.context, i = this.dropDown;
                  let a = e.dropDownAppendTo;
                  e._positionedParent = null, a === null ? e._dropDownParent = null : a === "body" || a === document.body ? e.getRootNode().host ? e._dropDownParent = e.getRootNode().host.shadowRoot : e._dropDownParent = document.body : a instanceof HTMLElement ? e._dropDownParent = a : typeof a == "string" ? (a = document.getElementById(a), a instanceof HTMLElement ? e._dropDownParent = a : (e.dropDownAppendTo = null, e._dropDownParent = null)) : (e.dropDownAppendTo = null, e._dropDownParent = null);
                  let n = e._dropDownParent;
                  if (n !== null) {
                    for (; n && n instanceof HTMLElement && window.getComputedStyle(n).position === "static" && n !== e.getShadowRootOrBody(); ) n = n.parentElement;
                    n === document.body ? e._positionedParent = null : e._positionedParent = n, i && (i.setAttribute("animation", e.animation), e.theme !== "" && i.$.addClass(e.theme), t && (e._dropDownParent.appendChild(i), i.$.addClass("smart-drop-down-repositioned")), e.detachedChildren.indexOf(i) === -1 && e.detachedChildren.push(i));
                  }
                }
                dropDownAppendToChangedHandler() {
                  const t = this.context, e = this.dropDown, i = t._dropDownParent;
                  this.getDropDownParent(), t._dropDownParent !== i && (t[this.closeMethod](), ["left", "top", "font-size", "font-family", "font-style", "font-weight"].forEach(((a) => e.style[a] = null)), t._dropDownParent === null ? (this.defaultParent.appendChild(e), e.$.removeClass("smart-drop-down-repositioned")) : (t._dropDownParent.appendChild(e), e.$.addClass("smart-drop-down-repositioned")));
                }
                dropDownPositionChangedHandler() {
                  const t = this;
                  t.dropDown.style.transition = "none", t.context[t.closeMethod](), t.setDropDownPosition(), t.handleAutoPositioning();
                }
                dropDownAttached(t) {
                  const e = this.context;
                  e._dropDownParent !== null && (e._dropDownParent.appendChild(this.dropDown), this.handleAutoPositioning(), t && e[t]());
                }
                dropDownDetached() {
                  const t = this.context;
                  t._dropDownParent !== null && document.body.contains(this.dropDown) && document.body.contains(t._dropDownParent) && t._dropDownParent.removeChild(this.dropDown);
                }
                setDropDownPosition() {
                  const t = this.context, e = t.dropDownPosition, i = t._dropDownListPosition;
                  e === "auto" ? this.checkBrowserBounds() : t._dropDownListPosition = e, this.updatePositionAttribute(i, t._dropDownListPosition);
                }
                updatePositionAttribute(t, e) {
                  const i = this.context, a = this.dropDown;
                  i.$.dropDownButton && !i.$.dropDownButton.hasAttribute(e) && (i.$.dropDownButton.removeAttribute(t), i.$.dropDownButton.setAttribute(e, "")), a.hasAttribute(e) || (a.style.transition = "none", a.removeAttribute(t), a.setAttribute(e, ""), requestAnimationFrame((function() {
                    a.style.transition = null;
                  })));
                }
                positionDropDown(t) {
                  const e = this.context, i = this.dropDown;
                  if (!e.opened || e._dropDownParent === null) return;
                  const a = e.getBoundingClientRect();
                  let n, r;
                  if (this.customPositionDropDown) {
                    const o = this.customPositionDropDown(a);
                    n = o.left, r = o.top;
                  } else switch (n = a.left, r = a.top, e._dropDownListPosition) {
                    case "bottom":
                      r += e.$.container.offsetHeight - 1;
                      break;
                    case "center-bottom":
                      r += e.$.container.offsetHeight - 1, n += e.offsetWidth - i.offsetWidth / 2;
                      break;
                    case "center-top":
                      r -= i.offsetHeight - 1, n += e.offsetWidth - i.offsetWidth / 2;
                      break;
                    case "top":
                      r -= i.offsetHeight - 1;
                      break;
                    case "overlay-bottom":
                      break;
                    case "overlay-center":
                      r -= i.offsetHeight / 2 - e.offsetHeight / 2;
                      break;
                    case "overlay-top":
                      r -= i.offsetHeight - e.offsetHeight;
                  }
                  const s = this.getDropDownOffset();
                  i.style.top = r + s.y + "px", t || (i.style.left = n + s.x + "px");
                }
                getDropDownOffset() {
                  const t = this.context._positionedParent;
                  let e, i;
                  if (t && t.nodeName !== "#document-fragment") {
                    const a = t.getBoundingClientRect();
                    e = -a.left, i = -a.top;
                  } else e = window.pageXOffset, i = window.pageYOffset;
                  return { x: e, y: i };
                }
                placeOverlay() {
                  const t = this.context;
                  if (!t.dropDownOverlay || t._overlay) return;
                  const e = document.createElement("div");
                  e.classList.add("smart-drop-down-overlay"), e.style.width = document.documentElement.scrollWidth + "px", e.style.height = document.documentElement.scrollHeight + "px", document.body.appendChild(e), t._overlay = e;
                }
                removeOverlay(t) {
                  const e = this, i = e.context;
                  i._overlay && (i.hasAnimation && t ? requestAnimationFrame((function a() {
                    e.dropDown.getBoundingClientRect().height > 0 ? requestAnimationFrame(a) : (document.body.removeChild(i._overlay), delete i._overlay);
                  })) : (document.body.removeChild(i._overlay), delete i._overlay));
                }
              });
              class Color {
                constructor(e) {
                  if (window.Smart._colors || (window.Smart._colors = []), window.Smart._colors[e]) {
                    const a = window.Smart._colors[e];
                    return this.hex = a.hex, this.r = a.r, this.g = a.g, void (this.b = a.b);
                  }
                  this.r = this.g = this.b = 0, this.hex = "";
                  const i = this.getStandardizedColor(e);
                  i && (this.setHex(i.substring(1)), window.Smart._colors[e] = { hex: this.hex, r: this.r, g: this.g, b: this.b });
                }
                getStandardizedColor(e) {
                  const i = document.createElement("canvas").getContext("2d");
                  return i.fillStyle = e, i.fillStyle;
                }
                getInvertedColor() {
                  if (this.hex === "") return "transparent";
                  const e = { "#DD5347": "#F8DCDA", "#8E24AA": "#F9EEFB", "#D50000": "#FFD5D5", "#E67C73": "#F9DBD9", "#F4511E": "#FDD6C8", "#F6BF26": "#FDF2D7", "#0B8043": "#DAFCEA", "#33B679": "#DFF7EC", "#3F51B5": "#E2E6F5", "#039BE5": "#E8F8FF", "#7986CB": "#DCDFF1", "#8C47FF": "#EADDFF", "#FF36C2": "#FFDFF5", "#FFCFC9": "#C9403E", "#FF9EB7": "#FF2058", "#FFD66D": "#AA7B00", "#FFEBB6": "#C18C00", "#93DF89": "#29721F", "#D1F7C4": "#619414", "#9DC7FF": "#003377", "#D0F0FD": "#098FCA", "#7D2FFF": "#1BB4F5", "#ECE1FD": "#7D30F1", "#FA9DE2": "#860666", "#FFDAF6": "#FF1AC6", "#CBCBCB": "#6B6B6B", "#EDEDED": "#909090", "#CDAFFF": "#4600BB" };
                  return e["#" + this.hex.toUpperCase()] ? e["#" + this.hex.toUpperCase()] : 255 - (0.299 * this.r + 0.587 * this.g + 0.114 * this.b) < 105 ? "Black" : "White";
                }
                hexToRgb(e) {
                  let i = "00", a = "00", n = "00";
                  return (e = this.validateHex(e)).length === 6 ? (i = e.substring(0, 2), a = e.substring(2, 4), n = e.substring(4, 6)) : (e.length > 4 && (i = e.substring(4, e.length), e = e.substring(0, 4)), e.length > 2 && (a = e.substring(2, e.length), e = e.substring(0, 2)), e.length > 0 && (n = e.substring(0, e.length))), { r: this.hexToInt(i), g: this.hexToInt(a), b: this.hexToInt(n) };
                }
                validateHex(e) {
                  return (e = (e = new String(e).toUpperCase()).replace(/[^A-F0-9]/g, "0")).length > 6 && (e = e.substring(0, 6)), e;
                }
                webSafeDec(e) {
                  return e = Math.round(e / 51), e *= 51;
                }
                hexToWebSafe(e) {
                  let i, a, n;
                  return e.length === 3 ? (i = e.substring(0, 1), a = e.substring(1, 1), n = e.substring(2, 1)) : (i = e.substring(0, 2), a = e.substring(2, 4), n = e.substring(4, 6)), this.intToHex(this.webSafeDec(this.hexToInt(i))) + this.intToHex(this.webSafeDec(this.hexToInt(a))) + this.intToHex(this.webSafeDec(this.hexToInt(n)));
                }
                rgbToWebSafe(e) {
                  return { r: this.webSafeDec(e.r), g: this.webSafeDec(e.g), b: this.webSafeDec(e.b) };
                }
                rgbToHex(e) {
                  return this.intToHex(e.r) + this.intToHex(e.g) + this.intToHex(e.b);
                }
                intToHex(e) {
                  let i = parseInt(e).toString(16);
                  return i.length === 1 && (i = "0" + i), i.toUpperCase();
                }
                hexToInt(e) {
                  return parseInt(e, 16);
                }
                setRgb(e, i, a) {
                  let n = function(r) {
                    return r < 0 || r > 255 || isNaN(parseInt(r)) ? 0 : r;
                  };
                  this.r = n(e), this.g = n(i), this.b = n(a), this.hex = this.rgbToHex(this);
                }
                setHex(e) {
                  this.hex = e;
                  let i = this.hexToRgb(this.hex);
                  this.r = i.r, this.g = i.g, this.b = i.b;
                }
              }
              window.Smart.Color = Color, window.Smart.WordsDictionary = ["the", "and", "for", "that", "this", "with", "you", "not", "are", "from", "your", "all", "have", "new", "more", "was", "will", "home", "can", "about", "page", "has", "search", "free", "but", "our", "one", "other", "information", "time", "they", "site", "may", "what", "which", "their", "news", "out", "use", "any", "there", "see", "only", "his", "when", "contact", "here", "business", "who", "web", "also", "now", "help", "get", "view", "online", "first", "been", "would", "how", "were", "services", "some", "these", "click", "its", "like", "service", "than", "find", "price", "date", "back", "top", "people", "had", "list", "name", "just", "over", "state", "year", "day", "into", "email", "two", "health", "world", "next", "used", "work", "last", "most", "products", "music", "buy", "data", "make", "them", "should", "product", "system", "post", "her", "city", "add", "policy", "number", "such", "please", "available", "copyright", "support", "message", "after", "best", "software", "then", "jan", "good", "video", "well", "where", "info", "rights", "public", "books", "high", "school", "through", "each", "links", "she", "review", "years", "order", "very", "privacy", "book", "items", "company", "read", "group", "need", "many", "user", "said", "does", "set", "under", "general", "research", "university", "january", "mail", "full", "map", "reviews", "program", "life", "know", "games", "way", "days", "management", "part", "could", "great", "united", "hotel", "real", "item", "international", "center", "ebay", "must", "store", "travel", "comments", "made", "development", "report", "off", "member", "details", "line", "terms", "before", "hotels", "did", "send", "right", "type", "because", "local", "those", "using", "results", "office", "education", "national", "car", "design", "take", "posted", "internet", "address", "community", "within", "states", "area", "want", "phone", "dvd", "shipping", "reserved", "subject", "between", "forum", "family", "long", "based", "code", "show", "even", "black", "check", "special", "prices", "website", "index", "being", "women", "much", "sign", "file", "link", "open", "today", "technology", "south", "case", "project", "same", "pages", "version", "section", "own", "found", "sports", "house", "related", "security", "both", "county", "american", "photo", "game", "members", "power", "while", "care", "network", "down", "computer", "systems", "three", "total", "place", "end", "following", "download", "him", "without", "per", "access", "think", "north", "resources", "current", "posts", "big", "media", "law", "control", "water", "history", "pictures", "size", "art", "personal", "since", "including", "guide", "shop", "directory", "board", "location", "change", "white", "text", "small", "rating", "rate", "government", "children", "during", "usa", "return", "students", "shopping", "account", "times", "sites", "level", "digital", "profile", "previous", "form", "events", "love", "old", "john", "main", "call", "hours", "image", "department", "title", "description", "non", "insurance", "another", "why", "shall", "property", "class", "still", "money", "quality", "every", "listing", "content", "country", "private", "little", "visit", "save", "tools", "low", "reply", "customer", "december", "compare", "movies", "include", "college", "value", "article", "york", "man", "card", "jobs", "provide", "food", "source", "author", "different", "press", "learn", "sale", "around", "print", "course", "job", "canada", "process", "teen", "room", "stock", "training", "too", "credit", "point", "join", "science", "men", "categories", "advanced", "west", "sales", "look", "english", "left", "team", "estate", "box", "conditions", "select", "windows", "photos", "gay", "thread", "week", "category", "note", "live", "large", "gallery", "table", "register", "however", "june", "october", "november", "market", "library", "really", "action", "start", "series", "model", "features", "air", "industry", "plan", "human", "provided", "yes", "required", "second", "hot", "accessories", "cost", "movie", "forums", "march", "september", "better", "say", "questions", "july", "yahoo", "going", "medical", "test", "friend", "come", "dec", "server", "study", "application", "cart", "staff", "articles", "san", "feedback", "again", "play", "looking", "issues", "april", "never", "users", "complete", "street", "topic", "comment", "financial", "things", "working", "against", "standard", "tax", "person", "below", "mobile", "less", "got", "blog", "party", "payment", "equipment", "login", "student", "let", "programs", "offers", "legal", "above", "recent", "park", "stores", "side", "act", "problem", "red", "give", "memory", "performance", "social", "august", "quote", "language", "story", "sell", "options", "experience", "rates", "create", "key", "body", "young", "america", "important", "field", "few", "east", "paper", "single", "age", "activities", "club", "example", "girls", "additional", "password", "latest", "something", "road", "gift", "question", "changes", "night", "hard", "texas", "oct", "pay", "four", "poker", "status", "browse", "issue", "range", "building", "seller", "court", "february", "always", "result", "audio", "light", "write", "war", "nov", "offer", "blue", "groups", "easy", "given", "files", "event", "release", "analysis", "request", "fax", "china", "making", "picture", "needs", "possible", "might", "professional", "yet", "month", "major", "star", "areas", "future", "space", "committee", "hand", "sun", "cards", "problems", "london", "washington", "meeting", "rss", "become", "interest", "child", "keep", "enter", "california", "share", "similar", "garden", "schools", "million", "added", "reference", "companies", "listed", "baby", "learning", "energy", "run", "delivery", "net", "popular", "term", "film", "stories", "put", "computers", "journal", "reports", "try", "welcome", "central", "images", "president", "notice", "original", "head", "radio", "until", "cell", "color", "self", "council", "away", "includes", "track", "australia", "discussion", "archive", "once", "others", "entertainment", "agreement", "format", "least", "society", "months", "log", "safety", "friends", "sure", "faq", "trade", "edition", "cars", "messages", "marketing", "tell", "further", "updated", "association", "able", "having", "provides", "david", "fun", "already", "green", "studies", "close", "common", "drive", "specific", "several", "gold", "feb", "living", "sep", "collection", "called", "short", "arts", "lot", "ask", "display", "limited", "powered", "solutions", "means", "director", "daily", "beach", "past", "natural", "whether", "due", "electronics", "five", "upon", "period", "planning", "database", "says", "official", "weather", "mar", "land", "average", "done", "technical", "window", "france", "pro", "region", "island", "record", "direct", "microsoft", "conference", "environment", "records", "district", "calendar", "costs", "style", "url", "front", "statement", "update", "parts", "aug", "ever", "downloads", "early", "miles", "sound", "resource", "present", "applications", "either", "ago", "document", "word", "works", "material", "bill", "apr", "written", "talk", "federal", "hosting", "rules", "final", "adult", "tickets", "thing", "centre", "requirements", "via", "cheap", "kids", "finance", "true", "minutes", "else", "mark", "third", "rock", "gifts", "europe", "reading", "topics", "bad", "individual", "tips", "plus", "auto", "cover", "usually", "edit", "together", "videos", "percent", "fast", "function", "fact", "unit", "getting", "global", "tech", "meet", "far", "economic", "player", "projects", "lyrics", "often", "subscribe", "submit", "germany", "amount", "watch", "included", "feel", "though", "bank", "risk", "thanks", "everything", "deals", "various", "words", "linux", "jul", "production", "commercial", "james", "weight", "town", "heart", "advertising", "received", "choose", "treatment", "newsletter", "archives", "points", "knowledge", "magazine", "error", "camera", "jun", "girl", "currently", "construction", "toys", "registered", "clear", "golf", "receive", "domain", "methods", "chapter", "makes", "protection", "policies", "loan", "wide", "beauty", "manager", "india", "position", "taken", "sort", "listings", "models", "michael", "known", "half", "cases", "step", "engineering", "florida", "simple", "quick", "none", "wireless", "license", "paul", "friday", "lake", "whole", "annual", "published", "later", "basic", "sony", "shows", "corporate", "google", "church", "method", "purchase", "customers", "active", "response", "practice", "hardware", "figure", "materials", "fire", "holiday", "chat", "enough", "designed", "along", "among", "death", "writing", "speed", "html", "countries", "loss", "face", "brand", "discount", "higher", "effects", "created", "remember", "standards", "oil", "bit", "yellow", "political", "increase", "advertise", "kingdom", "base", "near", "environmental", "thought", "stuff", "french", "storage", "japan", "doing", "loans", "shoes", "entry", "stay", "nature", "orders", "availability", "africa", "summary", "turn", "mean", "growth", "notes", "agency", "king", "monday", "european", "activity", "copy", "although", "drug", "pics", "western", "income", "force", "cash", "employment", "overall", "bay", "river", "commission", "package", "contents", "seen", "players", "engine", "port", "album", "regional", "stop", "supplies", "started", "administration", "bar", "institute", "views", "plans", "double", "dog", "build", "screen", "exchange", "types", "soon", "sponsored", "lines", "electronic", "continue", "across", "benefits", "needed", "season", "apply", "someone", "held", "anything", "printer", "condition", "effective", "believe", "organization", "effect", "asked", "eur", "mind", "sunday", "selection", "casino", "pdf", "lost", "tour", "menu", "volume", "cross", "anyone", "mortgage", "hope", "silver", "corporation", "wish", "inside", "solution", "mature", "role", "rather", "weeks", "addition", "came", "supply", "nothing", "certain", "usr", "executive", "running", "lower", "necessary", "union", "jewelry", "according", "clothing", "mon", "com", "particular", "fine", "names", "robert", "homepage", "hour", "gas", "skills", "six", "bush", "islands", "advice", "career", "military", "rental", "decision", "leave", "british", "teens", "pre", "huge", "sat", "woman", "facilities", "zip", "bid", "kind", "sellers", "middle", "move", "cable", "opportunities", "taking", "values", "division", "coming", "tuesday", "object", "lesbian", "appropriate", "machine", "logo", "length", "actually", "nice", "score", "statistics", "client", "returns", "capital", "follow", "sample", "investment", "sent", "shown", "saturday", "christmas", "england", "culture", "band", "flash", "lead", "george", "choice", "went", "starting", "registration", "fri", "thursday", "courses", "consumer", "airport", "foreign", "artist", "outside", "furniture", "levels", "channel", "letter", "mode", "phones", "ideas", "wednesday", "structure", "fund", "summer", "allow", "degree", "contract", "button", "releases", "wed", "homes", "super", "male", "matter", "custom", "virginia", "almost", "took", "located", "multiple", "asian", "distribution", "editor", "inn", "industrial", "cause", "potential", "song", "cnet", "ltd", "los", "focus", "late", "fall", "featured", "idea", "rooms", "female", "responsible", "inc", "communications", "win", "associated", "thomas", "primary", "cancer", "numbers", "reason", "tool", "browser", "spring", "foundation", "answer", "voice", "friendly", "schedule", "documents", "communication", "purpose", "feature", "bed", "comes", "police", "everyone", "independent", "approach", "cameras", "brown", "physical", "operating", "hill", "maps", "medicine", "deal", "hold", "ratings", "chicago", "forms", "glass", "happy", "tue", "smith", "wanted", "developed", "thank", "safe", "unique", "survey", "prior", "telephone", "sport", "ready", "feed", "animal", "sources", "mexico", "population", "regular", "secure", "navigation", "operations", "therefore", "simply", "evidence", "station", "christian", "round", "paypal", "favorite", "understand", "option", "master", "valley", "recently", "probably", "thu", "rentals", "sea", "built", "publications", "blood", "cut", "worldwide", "improve", "connection", "publisher", "hall", "larger", "anti", "networks", "earth", "parents", "nokia", "impact", "transfer", "introduction", "kitchen", "strong", "tel", "carolina", "wedding", "properties", "hospital", "ground", "overview", "ship", "accommodation", "owners", "disease", "excellent", "paid", "italy", "perfect", "hair", "opportunity", "kit", "classic", "basis", "command", "cities", "william", "express", "award", "distance", "tree", "peter", "assessment", "ensure", "thus", "wall", "involved", "extra", "especially", "interface", "partners", "budget", "rated", "guides", "success", "maximum", "operation", "existing", "quite", "selected", "boy", "amazon", "patients", "restaurants", "beautiful", "warning", "wine", "locations", "horse", "vote", "forward", "flowers", "stars", "significant", "lists", "technologies", "owner", "retail", "animals", "useful", "directly", "manufacturer", "ways", "est", "son", "providing", "rule", "mac", "housing", "takes", "iii", "gmt", "bring", "catalog", "searches", "max", "trying", "mother", "authority", "considered", "told", "xml", "traffic", "programme", "joined", "input", "strategy", "feet", "agent", "valid", "bin", "modern", "senior", "ireland", "teaching", "door", "grand", "testing", "trial", "charge", "units", "instead", "canadian", "cool", "normal", "wrote", "enterprise", "ships", "entire", "educational", "leading", "metal", "positive", "fitness", "chinese", "opinion", "asia", "football", "abstract", "uses", "output", "funds", "greater", "likely", "develop", "employees", "artists", "alternative", "processing", "responsibility", "resolution", "java", "guest", "seems", "publication", "pass", "relations", "trust", "van", "contains", "session", "multi", "photography", "republic", "fees", "components", "vacation", "century", "academic", "assistance", "completed", "skin", "graphics", "indian", "prev", "ads", "mary", "expected", "ring", "grade", "dating", "pacific", "mountain", "organizations", "pop", "filter", "mailing", "vehicle", "longer", "consider", "int", "northern", "behind", "panel", "floor", "german", "buying", "match", "proposed", "default", "require", "iraq", "boys", "outdoor", "deep", "morning", "otherwise", "allows", "rest", "protein", "plant", "reported", "hit", "transportation", "pool", "mini", "politics", "partner", "disclaimer", "authors", "boards", "faculty", "parties", "fish", "membership", "mission", "eye", "string", "sense", "modified", "pack", "released", "stage", "internal", "goods", "recommended", "born", "unless", "richard", "detailed", "japanese", "race", "approved", "background", "target", "except", "character", "usb", "maintenance", "ability", "maybe", "functions", "moving", "brands", "places", "php", "pretty", "trademarks", "phentermine", "spain", "southern", "yourself", "etc", "winter", "battery", "youth", "pressure", "submitted", "boston", "debt", "keywords", "medium", "television", "interested", "core", "break", "purposes", "throughout", "sets", "dance", "wood", "msn", "itself", "defined", "papers", "playing", "awards", "fee", "studio", "reader", "virtual", "device", "established", "answers", "rent", "las", "remote", "dark", "programming", "external", "apple", "regarding", "instructions", "min", "offered", "theory", "enjoy", "remove", "aid", "surface", "minimum", "visual", "host", "variety", "teachers", "isbn", "martin", "manual", "block", "subjects", "agents", "increased", "repair", "fair", "civil", "steel", "understanding", "songs", "fixed", "wrong", "beginning", "hands", "associates", "finally", "updates", "desktop", "classes", "paris", "ohio", "gets", "sector", "capacity", "requires", "jersey", "fat", "fully", "father", "electric", "saw", "instruments", "quotes", "officer", "driver", "businesses", "dead", "respect", "unknown", "specified", "restaurant", "mike", "trip", "pst", "worth", "procedures", "poor", "teacher", "eyes", "relationship", "workers", "farm", "georgia", "peace", "traditional", "campus", "tom", "showing", "creative", "coast", "benefit", "progress", "funding", "devices", "lord", "grant", "sub", "agree", "fiction", "hear", "sometimes", "watches", "careers", "beyond", "goes", "families", "led", "museum", "themselves", "fan", "transport", "interesting", "blogs", "wife", "evaluation", "accepted", "former", "implementation", "ten", "hits", "zone", "complex", "cat", "galleries", "references", "die", "presented", "jack", "flat", "flow", "agencies", "literature", "respective", "parent", "spanish", "michigan", "columbia", "setting", "scale", "stand", "economy", "highest", "helpful", "monthly", "critical", "frame", "musical", "definition", "secretary", "angeles", "networking", "path", "australian", "employee", "chief", "gives", "bottom", "magazines", "packages", "detail", "francisco", "laws", "changed", "pet", "heard", "begin", "individuals", "colorado", "royal", "clean", "switch", "russian", "largest", "african", "guy", "titles", "relevant", "guidelines", "justice", "connect", "bible", "dev", "cup", "basket", "applied", "weekly", "vol", "installation", "described", "demand", "suite", "vegas", "square", "chris", "attention", "advance", "skip", "diet", "army", "auction", "gear", "lee", "difference", "allowed", "correct", "charles", "nation", "selling", "lots", "piece", "sheet", "firm", "seven", "older", "illinois", "regulations", "elements", "species", "jump", "cells", "module", "resort", "facility", "random", "pricing", "dvds", "certificate", "minister", "motion", "looks", "fashion", "directions", "visitors", "documentation", "monitor", "trading", "forest", "calls", "whose", "coverage", "couple", "giving", "chance", "vision", "ball", "ending", "clients", "actions", "listen", "discuss", "accept", "automotive", "naked", "goal", "successful", "sold", "wind", "communities", "clinical", "situation", "sciences", "markets", "lowest", "highly", "publishing", "appear", "emergency", "developing", "lives", "currency", "leather", "determine", "temperature", "palm", "announcements", "patient", "actual", "historical", "stone", "bob", "commerce", "ringtones", "perhaps", "persons", "difficult", "scientific", "satellite", "fit", "tests", "village", "accounts", "amateur", "met", "pain", "xbox", "particularly", "factors", "coffee", "www", "settings", "buyer", "cultural", "steve", "easily", "oral", "ford", "poster", "edge", "functional", "root", "closed", "holidays", "ice", "pink", "zealand", "balance", "monitoring", "graduate", "replies", "shot", "architecture", "initial", "label", "thinking", "scott", "llc", "sec", "recommend", "canon", "league", "waste", "minute", "bus", "provider", "optional", "dictionary", "cold", "accounting", "manufacturing", "sections", "chair", "fishing", "effort", "phase", "fields", "bag", "fantasy", "letters", "motor", "professor", "context", "install", "shirt", "apparel", "generally", "continued", "foot", "mass", "crime", "count", "breast", "techniques", "ibm", "johnson", "quickly", "dollars", "websites", "religion", "claim", "driving", "permission", "surgery", "patch", "heat", "wild", "measures", "generation", "kansas", "miss", "chemical", "doctor", "task", "reduce", "brought", "himself", "nor", "component", "enable", "exercise", "bug", "santa", "mid", "guarantee", "leader", "diamond", "israel", "processes", "soft", "servers", "alone", "meetings", "seconds", "jones", "arizona", "keyword", "interests", "flight", "congress", "fuel", "username", "walk", "produced", "italian", "paperback", "classifieds", "wait", "supported", "pocket", "saint", "rose", "freedom", "argument", "competition", "creating", "jim", "drugs", "joint", "premium", "providers", "fresh", "characters", "attorney", "upgrade", "factor", "growing", "thousands", "stream", "apartments", "pick", "hearing", "eastern", "auctions", "therapy", "entries", "dates", "generated", "signed", "upper", "administrative", "serious", "prime", "samsung", "limit", "began", "louis", "steps", "errors", "shops", "del", "efforts", "informed", "thoughts", "creek", "worked", "quantity", "urban", "practices", "sorted", "reporting", "essential", "myself", "tours", "platform", "load", "affiliate", "labor", "immediately", "admin", "nursing", "defense", "machines", "designated", "tags", "heavy", "covered", "recovery", "joe", "guys", "integrated", "configuration", "merchant", "comprehensive", "expert", "universal", "protect", "drop", "solid", "cds", "presentation", "languages", "became", "orange", "compliance", "vehicles", "prevent", "theme", "rich", "campaign", "marine", "improvement", "guitar", "finding", "pennsylvania", "examples", "ipod", "saying", "spirit", "claims", "challenge", "motorola", "acceptance", "strategies", "seem", "affairs", "touch", "intended", "towards", "goals", "hire", "election", "suggest", "branch", "charges", "serve", "affiliates", "reasons", "magic", "mount", "smart", "talking", "gave", "ones", "latin", "multimedia", "avoid", "certified", "manage", "corner", "rank", "computing", "oregon", "element", "birth", "virus", "abuse", "interactive", "requests", "separate", "quarter", "procedure", "leadership", "tables", "define", "racing", "religious", "facts", "breakfast", "kong", "column", "plants", "faith", "chain", "developer", "identify", "avenue", "missing", "died", "approximately", "domestic", "sitemap", "recommendations", "moved", "houston", "reach", "comparison", "mental", "viewed", "moment", "extended", "sequence", "inch", "attack", "sorry", "centers", "opening", "damage", "lab", "reserve", "recipes", "cvs", "gamma", "plastic", "produce", "snow", "placed", "truth", "counter", "failure", "follows", "weekend", "dollar", "camp", "ontario", "automatically", "des", "minnesota", "films", "bridge", "native", "fill", "williams", "movement", "printing", "baseball", "owned", "approval", "draft", "chart", "played", "contacts", "jesus", "readers", "clubs", "lcd", "jackson", "equal", "adventure", "matching", "offering", "shirts", "profit", "leaders", "posters", "institutions", "assistant", "variable", "ave", "advertisement", "expect", "parking", "headlines", "yesterday", "compared", "determined", "wholesale", "workshop", "russia", "gone", "codes", "kinds", "extension", "seattle", "statements", "golden", "completely", "teams", "fort", "lighting", "senate", "forces", "funny", "brother", "gene", "turned", "portable", "tried", "electrical", "applicable", "disc", "returned", "pattern", "boat", "named", "theatre", "laser", "earlier", "manufacturers", "sponsor", "classical", "icon", "warranty", "dedicated", "indiana", "direction", "harry", "basketball", "objects", "ends", "delete", "evening", "assembly", "nuclear", "taxes", "mouse", "signal", "criminal", "issued", "brain", "sexual", "wisconsin", "powerful", "dream", "obtained", "false", "cast", "flower", "felt", "personnel", "passed", "supplied", "identified", "falls", "pic", "soul", "aids", "opinions", "promote", "stated", "stats", "hawaii", "professionals", "appears", "carry", "flag", "decided", "covers", "advantage", "hello", "designs", "maintain", "tourism", "priority", "newsletters", "adults", "clips", "savings", "graphic", "atom", "payments", "estimated", "binding", "brief", "ended", "winning", "eight", "anonymous", "iron", "straight", "script", "served", "wants", "miscellaneous", "prepared", "void", "dining", "alert", "integration", "atlanta", "dakota", "tag", "interview", "mix", "framework", "disk", "installed", "queen", "vhs", "credits", "clearly", "fix", "handle", "sweet", "desk", "criteria", "pubmed", "dave", "massachusetts", "diego", "hong", "vice", "associate", "truck", "behavior", "enlarge", "ray", "frequently", "revenue", "measure", "changing", "votes", "duty", "looked", "discussions", "bear", "gain", "festival", "laboratory", "ocean", "flights", "experts", "signs", "lack", "depth", "iowa", "whatever", "logged", "laptop", "vintage", "train", "exactly", "dry", "explore", "maryland", "spa", "concept", "nearly", "eligible", "checkout", "reality", "forgot", "handling", "origin", "knew", "gaming", "feeds", "billion", "destination", "scotland", "faster", "intelligence", "dallas", "bought", "con", "ups", "nations", "route", "followed", "specifications", "broken", "tripadvisor", "frank", "alaska", "zoom", "blow", "battle", "residential", "anime", "speak", "decisions", "industries", "protocol", "query", "clip", "partnership", "editorial", "expression", "equity", "provisions", "speech", "wire", "principles", "suggestions", "rural", "shared", "sounds", "replacement", "tape", "strategic", "judge", "spam", "economics", "acid", "bytes", "cent", "forced", "compatible", "fight", "apartment", "height", "null", "zero", "speaker", "filed", "netherlands", "obtain", "consulting", "recreation", "offices", "designer", "remain", "managed", "failed", "marriage", "roll", "korea", "banks", "participants", "secret", "bath", "kelly", "leads", "negative", "austin", "favorites", "toronto", "theater", "springs", "missouri", "andrew", "var", "perform", "healthy", "translation", "estimates", "font", "assets", "injury", "joseph", "ministry", "drivers", "lawyer", "figures", "married", "protected", "proposal", "sharing", "philadelphia", "portal", "waiting", "birthday", "beta", "fail", "gratis", "banking", "officials", "brian", "toward", "won", "slightly", "assist", "conduct", "contained", "lingerie", "legislation", "calling", "parameters", "jazz", "serving", "bags", "profiles", "miami", "comics", "matters", "houses", "doc", "postal", "relationships", "tennessee", "wear", "controls", "breaking", "combined", "ultimate", "wales", "representative", "frequency", "introduced", "minor", "finish", "departments", "residents", "noted", "displayed", "mom", "reduced", "physics", "rare", "spent", "performed", "extreme", "samples", "davis", "daniel", "bars", "reviewed", "row", "forecast", "removed", "helps", "singles", "administrator", "cycle", "amounts", "contain", "accuracy", "dual", "rise", "usd", "sleep", "bird", "pharmacy", "brazil", "creation", "static", "scene", "hunter", "addresses", "lady", "crystal", "famous", "writer", "chairman", "violence", "fans", "oklahoma", "speakers", "drink", "academy", "dynamic", "gender", "eat", "permanent", "agriculture", "dell", "cleaning", "constitutes", "portfolio", "practical", "delivered", "collectibles", "infrastructure", "exclusive", "seat", "concerns", "vendor", "originally", "intel", "utilities", "philosophy", "regulation", "officers", "reduction", "aim", "bids", "referred", "supports", "nutrition", "recording", "regions", "junior", "toll", "les", "cape", "ann", "rings", "meaning", "tip", "secondary", "wonderful", "mine", "ladies", "henry", "ticket", "announced", "guess", "agreed", "prevention", "whom", "ski", "soccer", "math", "import", "posting", "presence", "instant", "mentioned", "automatic", "healthcare", "viewing", "maintained", "increasing", "majority", "connected", "christ", "dan", "dogs", "directors", "aspects", "austria", "ahead", "moon", "participation", "scheme", "utility", "preview", "fly", "manner", "matrix", "containing", "combination", "devel", "amendment", "despite", "strength", "guaranteed", "turkey", "libraries", "proper", "distributed", "degrees", "singapore", "enterprises", "delta", "fear", "seeking", "inches", "phoenix", "convention", "shares", "principal", "daughter", "standing", "comfort", "colors", "wars", "cisco", "ordering", "kept", "alpha", "appeal", "cruise", "bonus", "certification", "previously", "hey", "bookmark", "buildings", "specials", "beat", "disney", "household", "batteries", "adobe", "smoking", "bbc", "becomes", "drives", "arms", "alabama", "tea", "improved", "trees", "avg", "achieve", "positions", "dress", "subscription", "dealer", "contemporary", "sky", "utah", "nearby", "rom", "carried", "happen", "exposure", "panasonic", "hide", "permalink", "signature", "gambling", "refer", "miller", "provision", "outdoors", "clothes", "caused", "luxury", "babes", "frames", "certainly", "indeed", "newspaper", "toy", "circuit", "layer", "printed", "slow", "removal", "easier", "src", "liability", "trademark", "hip", "printers", "faqs", "nine", "adding", "kentucky", "mostly", "eric", "spot", "taylor", "trackback", "prints", "spend", "factory", "interior", "revised", "grow", "americans", "optical", "promotion", "relative", "amazing", "clock", "dot", "hiv", "identity", "suites", "conversion", "feeling", "hidden", "reasonable", "victoria", "serial", "relief", "revision", "broadband", "influence", "ratio", "pda", "importance", "rain", "onto", "dsl", "planet", "webmaster", "copies", "recipe", "zum", "permit", "seeing", "proof", "dna", "diff", "tennis", "bass", "prescription", "bedroom", "empty", "instance", "hole", "pets", "ride", "licensed", "orlando", "specifically", "tim", "bureau", "maine", "sql", "represent", "conservation", "pair", "ideal", "specs", "recorded", "don", "pieces", "finished", "parks", "dinner", "lawyers", "sydney", "stress", "cream", "runs", "trends", "yeah", "discover", "patterns", "boxes", "louisiana", "hills", "javascript", "fourth", "advisor", "marketplace", "evil", "aware", "wilson", "shape", "evolution", "irish", "certificates", "objectives", "stations", "suggested", "gps", "remains", "acc", "greatest", "firms", "concerned", "euro", "operator", "structures", "generic", "encyclopedia", "usage", "cap", "ink", "charts", "continuing", "mixed", "census", "interracial", "peak", "competitive", "exist", "wheel", "transit", "suppliers", "salt", "compact", "poetry", "lights", "tracking", "angel", "bell", "keeping", "preparation", "attempt", "receiving", "matches", "accordance", "width", "noise", "engines", "forget", "array", "discussed", "accurate", "stephen", "elizabeth", "climate", "reservations", "pin", "playstation", "alcohol", "greek", "instruction", "managing", "annotation", "sister", "raw", "differences", "walking", "explain", "smaller", "newest", "establish", "gnu", "happened", "expressed", "jeff", "extent", "sharp", "lesbians", "ben", "lane", "paragraph", "kill", "mathematics", "aol", "compensation", "export", "managers", "aircraft", "modules", "sweden", "conflict", "conducted", "versions", "employer", "occur", "percentage", "knows", "mississippi", "describe", "concern", "backup", "requested", "citizens", "connecticut", "heritage", "personals", "immediate", "holding", "trouble", "spread", "coach", "kevin", "agricultural", "expand", "supporting", "audience", "assigned", "jordan", "collections", "ages", "participate", "plug", "specialist", "cook", "affect", "virgin", "experienced", "investigation", "raised", "hat", "institution", "directed", "dealers", "searching", "sporting", "helping", "perl", "affected", "lib", "bike", "totally", "plate", "expenses", "indicate", "blonde", "proceedings", "transmission", "anderson", "utc", "characteristics", "der", "lose", "organic", "seek", "experiences", "albums", "cheats", "extremely", "verzeichnis", "contracts", "guests", "hosted", "diseases", "concerning", "developers", "equivalent", "chemistry", "tony", "neighborhood", "nevada", "kits", "thailand", "variables", "agenda", "anyway", "continues", "tracks", "advisory", "cam", "curriculum", "logic", "template", "prince", "circle", "soil", "grants", "anywhere", "psychology", "responses", "atlantic", "wet", "circumstances", "edward", "investor", "identification", "ram", "leaving", "wildlife", "appliances", "matt", "elementary", "cooking", "speaking", "sponsors", "fox", "unlimited", "respond", "sizes", "plain", "exit", "entered", "iran", "arm", "keys", "launch", "wave", "checking", "costa", "belgium", "printable", "holy", "acts", "guidance", "mesh", "trail", "enforcement", "symbol", "crafts", "highway", "buddy", "hardcover", "observed", "dean", "setup", "poll", "booking", "glossary", "fiscal", "celebrity", "styles", "denver", "unix", "filled", "bond", "channels", "ericsson", "appendix", "notify", "blues", "chocolate", "pub", "portion", "scope", "hampshire", "supplier", "cables", "cotton", "bluetooth", "controlled", "requirement", "authorities", "biology", "dental", "killed", "border", "ancient", "debate", "representatives", "starts", "pregnancy", "causes", "arkansas", "biography", "leisure", "attractions", "learned", "transactions", "notebook", "explorer", "historic", "attached", "opened", "husband", "disabled", "authorized", "crazy", "upcoming", "britain", "concert", "retirement", "scores", "financing", "efficiency", "comedy", "adopted", "efficient", "weblog", "linear", "commitment", "specialty", "bears", "jean", "hop", "carrier", "edited", "constant", "visa", "mouth", "jewish", "meter", "linked", "portland", "interviews", "concepts", "gun", "reflect", "pure", "deliver", "wonder", "lessons", "fruit", "begins", "qualified", "reform", "lens", "alerts", "treated", "discovery", "draw", "mysql", "classified", "relating", "assume", "confidence", "alliance", "confirm", "warm", "neither", "lewis", "howard", "offline", "leaves", "engineer", "lifestyle", "consistent", "replace", "clearance", "connections", "inventory", "converter", "organisation", "babe", "checks", "reached", "becoming", "safari", "objective", "indicated", "sugar", "crew", "legs", "sam", "stick", "securities", "allen", "pdt", "relation", "enabled", "genre", "slide", "montana", "volunteer", "tested", "rear", "democratic", "enhance", "switzerland", "exact", "bound", "parameter", "adapter", "processor", "node", "formal", "dimensions", "contribute", "lock", "hockey", "storm", "micro", "colleges", "laptops", "mile", "showed", "challenges", "editors", "mens", "threads", "bowl", "supreme", "brothers", "recognition", "presents", "ref", "tank", "submission", "dolls", "estimate", "encourage", "navy", "kid", "regulatory", "inspection", "consumers", "cancel", "limits", "territory", "transaction", "manchester", "weapons", "paint", "delay", "pilot", "outlet", "contributions", "continuous", "czech", "resulting", "cambridge", "initiative", "novel", "pan", "execution", "disability", "increases", "ultra", "winner", "idaho", "contractor", "episode", "examination", "potter", "dish", "plays", "bulletin", "indicates", "modify", "oxford", "adam", "truly", "epinions", "painting", "committed", "extensive", "affordable", "universe", "candidate", "databases", "patent", "slot", "psp", "outstanding", "eating", "perspective", "planned", "watching", "lodge", "messenger", "mirror", "tournament", "consideration", "discounts", "sterling", "sessions", "kernel", "stocks", "buyers", "journals", "gray", "catalogue", "jennifer", "antonio", "charged", "broad", "taiwan", "und", "chosen", "demo", "greece", "swiss", "sarah", "clark", "hate", "terminal", "publishers", "nights", "behalf", "caribbean", "liquid", "rice", "nebraska", "loop", "salary", "reservation", "foods", "gourmet", "guard", "properly", "orleans", "saving", "nfl", "remaining", "empire", "resume", "twenty", "newly", "raise", "prepare", "avatar", "gary", "depending", "illegal", "expansion", "vary", "hundreds", "rome", "arab", "lincoln", "helped", "premier", "tomorrow", "purchased", "milk", "decide", "consent", "drama", "visiting", "performing", "downtown", "keyboard", "contest", "collected", "bands", "boot", "suitable", "absolutely", "millions", "lunch", "audit", "push", "chamber", "guinea", "findings", "muscle", "featuring", "iso", "implement", "clicking", "scheduled", "polls", "typical", "tower", "yours", "sum", "misc", "calculator", "significantly", "chicken", "temporary", "attend", "shower", "alan", "sending", "jason", "tonight", "dear", "sufficient", "holdem", "shell", "province", "catholic", "oak", "vat", "awareness", "vancouver", "governor", "beer", "seemed", "contribution", "measurement", "swimming", "spyware", "formula", "constitution", "packaging", "solar", "jose", "catch", "jane", "pakistan", "reliable", "consultation", "northwest", "sir", "doubt", "earn", "finder", "unable", "periods", "classroom", "tasks", "democracy", "attacks", "kim", "wallpaper", "merchandise", "const", "resistance", "doors", "symptoms", "resorts", "biggest", "memorial", "visitor", "twin", "forth", "insert", "baltimore", "gateway", "dont", "alumni", "drawing", "candidates", "charlotte", "ordered", "biological", "fighting", "transition", "happens", "preferences", "spy", "romance", "instrument", "bruce", "split", "themes", "powers", "heaven", "bits", "pregnant", "twice", "classification", "focused", "egypt", "physician", "hollywood", "bargain", "wikipedia", "cellular", "norway", "vermont", "asking", "blocks", "normally", "spiritual", "hunting", "diabetes", "suit", "shift", "chip", "res", "sit", "bodies", "photographs", "cutting", "wow", "simon", "writers", "marks", "flexible", "loved", "mapping", "numerous", "relatively", "birds", "satisfaction", "represents", "char", "indexed", "pittsburgh", "superior", "preferred", "saved", "paying", "cartoon", "shots", "intellectual", "moore", "granted", "choices", "carbon", "spending", "comfortable", "magnetic", "interaction", "listening", "effectively", "registry", "crisis", "outlook", "massive", "denmark", "employed", "bright", "treat", "header", "poverty", "formed", "piano", "echo", "que", "grid", "sheets", "patrick", "experimental", "puerto", "revolution", "consolidation", "displays", "plasma", "allowing", "earnings", "voip", "mystery", "landscape", "dependent", "mechanical", "journey", "delaware", "bidding", "consultants", "risks", "banner", "applicant", "charter", "fig", "barbara", "cooperation", "counties", "acquisition", "ports", "implemented", "directories", "recognized", "dreams", "blogger", "notification", "licensing", "stands", "teach", "occurred", "textbooks", "rapid", "pull", "hairy", "diversity", "cleveland", "reverse", "deposit", "seminar", "investments", "latina", "nasa", "wheels", "sexcam", "specify", "accessibility", "dutch", "sensitive", "templates", "formats", "tab", "depends", "boots", "holds", "router", "concrete", "editing", "poland", "folder", "womens", "css", "completion", "upload", "pulse", "universities", "technique", "contractors", "milfhunter", "voting", "courts", "notices", "subscriptions", "calculate", "detroit", "alexander", "broadcast", "converted", "metro", "toshiba", "anniversary", "improvements", "strip", "specification", "pearl", "accident", "nick", "accessible", "accessory", "resident", "plot", "qty", "possibly", "airline", "typically", "representation", "regard", "pump", "exists", "arrangements", "smooth", "conferences", "uniprotkb", "strike", "consumption", "birmingham", "flashing", "narrow", "afternoon", "threat", "surveys", "sitting", "putting", "consultant", "controller", "ownership", "committees", "legislative", "researchers", "vietnam", "trailer", "anne", "castle", "gardens", "missed", "malaysia", "unsubscribe", "antique", "labels", "willing", "bio", "molecular", "acting", "heads", "stored", "exam", "logos", "residence", "attorneys", "milfs", "antiques", "density", "hundred", "ryan", "operators", "strange", "sustainable", "philippines", "statistical", "beds", "mention", "innovation", "pcs", "employers", "grey", "parallel", "honda", "amended", "operate", "bills", "bold", "bathroom", "stable", "opera", "definitions", "von", "doctors", "lesson", "cinema", "asset", "scan", "elections", "drinking", "reaction", "blank", "enhanced", "entitled", "severe", "generate", "stainless", "newspapers", "hospitals", "deluxe", "humor", "aged", "monitors", "exception", "lived", "duration", "bulk", "successfully", "indonesia", "pursuant", "sci", "fabric", "edt", "visits", "primarily", "tight", "domains", "capabilities", "pmid", "contrast", "recommendation", "flying", "recruitment", "sin", "berlin", "cute", "organized", "para", "siemens", "adoption", "improving", "expensive", "meant", "capture", "pounds", "buffalo", "organisations", "plane", "explained", "seed", "programmes", "desire", "expertise", "mechanism", "camping", "jewellery", "meets", "welfare", "peer", "caught", "eventually", "marked", "driven", "measured", "medline", "bottle", "agreements", "considering", "innovative", "marshall", "massage", "rubber", "conclusion", "closing", "tampa", "thousand", "meat", "legend", "grace", "susan", "ing", "adams", "python", "monster", "alex", "bang", "villa", "bone", "columns", "disorders", "bugs", "collaboration", "hamilton", "detection", "ftp", "cookies", "inner", "formation", "tutorial", "med", "engineers", "entity", "cruises", "gate", "holder", "proposals", "moderator", "tutorials", "settlement", "portugal", "lawrence", "roman", "duties", "valuable", "tone", "collectables", "ethics", "forever", "dragon", "busy", "captain", "fantastic", "imagine", "brings", "heating", "leg", "neck", "wing", "governments", "purchasing", "scripts", "abc", "stereo", "appointed", "taste", "dealing", "commit", "tiny", "operational", "rail", "airlines", "liberal", "livecam", "jay", "trips", "gap", "sides", "tube", "turns", "corresponding", "descriptions", "cache", "belt", "jacket", "determination", "animation", "oracle", "matthew", "lease", "productions", "aviation", "hobbies", "proud", "excess", "disaster", "console", "commands", "telecommunications", "instructor", "giant", "achieved", "injuries", "shipped", "seats", "approaches", "biz", "alarm", "voltage", "anthony", "nintendo", "usual", "loading", "stamps", "appeared", "franklin", "angle", "rob", "vinyl", "highlights", "mining", "designers", "melbourne", "ongoing", "worst", "imaging", "betting", "scientists", "liberty", "wyoming", "blackjack", "argentina", "era", "convert", "possibility", "analyst", "commissioner", "dangerous", "garage", "exciting", "reliability", "thongs", "gcc", "unfortunately", "respectively", "volunteers", "attachment", "ringtone", "finland", "morgan", "derived", "pleasure", "honor", "asp", "oriented", "eagle", "desktops", "pants", "columbus", "nurse", "prayer", "appointment", "workshops", "hurricane", "quiet", "luck", "postage", "producer", "represented", "mortgages", "dial", "responsibilities", "cheese", "comic", "carefully", "jet", "productivity", "investors", "crown", "par", "underground", "diagnosis", "maker", "crack", "principle", "picks", "vacations", "gang", "semester", "calculated", "fetish", "applies", "casinos", "appearance", "smoke", "apache", "filters", "incorporated", "craft", "cake", "notebooks", "apart", "fellow", "blind", "lounge", "mad", "algorithm", "semi", "coins", "andy", "gross", "strongly", "cafe", "valentine", "hilton", "ken", "proteins", "horror", "exp", "familiar", "capable", "douglas", "debian", "till", "involving", "pen", "investing", "christopher", "admission", "epson", "shoe", "elected", "carrying", "victory", "sand", "madison", "terrorism", "joy", "editions", "cpu", "mainly", "ethnic", "ran", "parliament", "actor", "finds", "seal", "situations", "fifth", "allocated", "citizen", "vertical", "corrections", "structural", "municipal", "describes", "prize", "occurs", "jon", "absolute", "disabilities", "consists", "anytime", "substance", "prohibited", "addressed", "lies", "pipe", "soldiers", "guardian", "lecture", "simulation", "layout", "initiatives", "ill", "concentration", "classics", "lbs", "lay", "interpretation", "horses", "lol", "dirty", "deck", "wayne", "donate", "taught", "bankruptcy", "worker", "optimization", "alive", "temple", "substances", "prove", "discovered", "wings", "breaks", "genetic", "restrictions", "participating", "waters", "promise", "thin", "exhibition", "prefer", "ridge", "cabinet", "modem", "harris", "mph", "bringing", "sick", "dose", "evaluate", "tiffany", "tropical", "collect", "bet", "composition", "toyota", "streets", "nationwide", "vector", "definitely", "shaved", "turning", "buffer", "purple", "existence", "commentary", "larry", "limousines", "developments", "def", "immigration", "destinations", "lets", "mutual", "pipeline", "necessarily", "syntax", "attribute", "prison", "skill", "chairs", "everyday", "apparently", "surrounding", "mountains", "moves", "popularity", "inquiry", "ethernet", "checked", "exhibit", "throw", "trend", "sierra", "visible", "cats", "desert", "postposted", "oldest", "rhode", "nba", "coordinator", "obviously", "mercury", "steven", "handbook", "greg", "navigate", "worse", "summit", "victims", "epa", "spaces", "fundamental", "burning", "escape", "coupons", "somewhat", "receiver", "substantial", "progressive", "cialis", "boats", "glance", "scottish", "championship", "arcade", "richmond", "sacramento", "impossible", "ron", "russell", "tells", "obvious", "fiber", "depression", "graph", "covering", "platinum", "judgment", "bedrooms", "talks", "filing", "foster", "modeling", "passing", "awarded", "testimonials", "trials", "tissue", "memorabilia", "clinton", "masters", "bonds", "cartridge", "alberta", "explanation", "folk", "org", "commons", "cincinnati", "subsection", "fraud", "electricity", "permitted", "spectrum", "arrival", "okay", "pottery", "emphasis", "roger", "aspect", "workplace", "awesome", "mexican", "confirmed", "counts", "priced", "wallpapers", "hist", "crash", "lift", "desired", "inter", "closer", "assumes", "heights", "shadow", "riding", "infection", "firefox", "lisa", "expense", "grove", "eligibility", "venture", "clinic", "korean", "healing", "princess", "mall", "entering", "packet", "spray", "studios", "involvement", "dad", "buttons", "placement", "observations", "vbulletin", "funded", "thompson", "winners", "extend", "roads", "subsequent", "pat", "dublin", "rolling", "fell", "motorcycle", "yard", "disclosure", "establishment", "memories", "nelson", "arrived", "creates", "faces", "tourist", "mayor", "murder", "sean", "adequate", "senator", "yield", "presentations", "grades", "cartoons", "pour", "digest", "reg", "lodging", "tion", "dust", "hence", "wiki", "entirely", "replaced", "radar", "rescue", "undergraduate", "losses", "combat", "reducing", "stopped", "occupation", "lakes", "donations", "associations", "citysearch", "closely", "radiation", "diary", "seriously", "kings", "shooting", "kent", "adds", "nsw", "ear", "flags", "pci", "baker", "launched", "elsewhere", "pollution", "conservative", "guestbook", "shock", "effectiveness", "walls", "abroad", "ebony", "tie", "ward", "drawn", "arthur", "ian", "visited", "roof", "walker", "demonstrate", "atmosphere", "suggests", "kiss", "beast", "operated", "experiment", "targets", "overseas", "purchases", "dodge", "counsel", "federation", "pizza", "invited", "yards", "assignment", "chemicals", "gordon", "mod", "farmers", "queries", "bmw", "rush", "ukraine", "absence", "nearest", "cluster", "vendors", "mpeg", "whereas", "yoga", "serves", "woods", "surprise", "lamp", "rico", "partial", "shoppers", "phil", "everybody", "couples", "nashville", "ranking", "jokes", "cst", "http", "ceo", "simpson", "twiki", "sublime", "counseling", "palace", "acceptable", "satisfied", "glad", "wins", "measurements", "verify", "globe", "trusted", "copper", "milwaukee", "rack", "medication", "warehouse", "shareware", "rep", "dicke", "kerry", "receipt", "supposed", "ordinary", "nobody", "ghost", "violation", "configure", "stability", "mit", "applying", "southwest", "boss", "pride", "institutional", "expectations", "independence", "knowing", "reporter", "metabolism", "keith", "champion", "cloudy", "linda", "ross", "personally", "chile", "anna", "plenty", "solo", "sentence", "throat", "ignore", "maria", "uniform", "excellence", "wealth", "tall", "somewhere", "vacuum", "dancing", "attributes", "recognize", "brass", "writes", "plaza", "pdas", "outcomes", "survival", "quest", "publish", "sri", "screening", "toe", "thumbnail", "trans", "jonathan", "whenever", "nova", "lifetime", "api", "pioneer", "booty", "forgotten", "acrobat", "plates", "acres", "venue", "athletic", "thermal", "essays", "vital", "telling", "fairly", "coastal", "config", "charity", "intelligent", "edinburgh", "excel", "modes", "obligation", "campbell", "wake", "stupid", "harbor", "hungary", "traveler", "urw", "segment", "realize", "regardless", "lan", "enemy", "puzzle", "rising", "aluminum", "wells", "wishlist", "opens", "insight", "sms", "restricted", "republican", "secrets", "lucky", "latter", "merchants", "thick", "trailers", "repeat", "syndrome", "philips", "attendance", "penalty", "drum", "glasses", "enables", "nec", "iraqi", "builder", "vista", "jessica", "chips", "terry", "flood", "foto", "ease", "arguments", "amsterdam", "arena", "adventures", "pupils", "stewart", "announcement", "tabs", "outcome", "appreciate", "expanded", "casual", "grown", "polish", "lovely", "extras", "centres", "jerry", "clause", "smile", "lands", "troops", "indoor", "bulgaria", "armed", "broker", "charger", "regularly", "believed", "pine", "cooling", "tend", "gulf", "rick", "trucks", "mechanisms", "divorce", "laura", "shopper", "tokyo", "partly", "nikon", "customize", "tradition", "candy", "pills", "tiger", "donald", "folks", "sensor", "exposed", "telecom", "hunt", "angels", "deputy", "indicators", "sealed", "thai", "emissions", "physicians", "loaded", "fred", "complaint", "scenes", "experiments", "afghanistan", "boost", "spanking", "scholarship", "governance", "mill", "founded", "supplements", "chronic", "icons", "moral", "den", "catering", "aud", "finger", "keeps", "pound", "locate", "camcorder", "trained", "burn", "implementing", "roses", "labs", "ourselves", "bread", "tobacco", "wooden", "motors", "tough", "roberts", "incident", "gonna", "dynamics", "lie", "crm", "conversation", "decrease", "cumshots", "chest", "pension", "billy", "revenues", "emerging", "worship", "capability", "craig", "herself", "producing", "churches", "precision", "damages", "reserves", "contributed", "solve", "shorts", "reproduction", "minority", "diverse", "amp", "ingredients", "johnny", "sole", "franchise", "recorder", "complaints", "facing", "nancy", "promotions", "tones", "passion", "rehabilitation", "maintaining", "sight", "laid", "clay", "defence", "patches", "weak", "refund", "usc", "towns", "environments", "trembl", "divided", "blvd", "reception", "amd", "wise", "emails", "cyprus", "odds", "correctly", "insider", "seminars", "consequences", "makers", "hearts", "geography", "appearing", "integrity", "worry", "discrimination", "eve", "carter", "legacy", "marc", "pleased", "danger", "vitamin", "widely", "processed", "phrase", "genuine", "raising", "implications", "functionality", "paradise", "hybrid", "reads", "roles", "intermediate", "emotional", "sons", "leaf", "pad", "glory", "platforms", "bigger", "billing", "diesel", "versus", "combine", "overnight", "geographic", "exceed", "rod", "saudi", "fault", "cuba", "hrs", "preliminary", "districts", "introduce", "silk", "promotional", "kate", "chevrolet", "babies", "karen", "compiled", "romantic", "revealed", "specialists", "generator", "albert", "examine", "jimmy", "graham", "suspension", "bristol", "margaret", "compaq", "sad", "correction", "wolf", "slowly", "authentication", "communicate", "rugby", "supplement", "showtimes", "cal", "portions", "infant", "promoting", "sectors", "samuel", "fluid", "grounds", "fits", "kick", "regards", "meal", "hurt", "machinery", "bandwidth", "unlike", "equation", "baskets", "probability", "pot", "dimension", "wright", "img", "barry", "proven", "schedules", "admissions", "cached", "warren", "slip", "studied", "reviewer", "involves", "quarterly", "rpm", "profits", "devil", "grass", "comply", "marie", "florist", "illustrated", "cherry", "continental", "alternate", "deutsch", "achievement", "limitations", "kenya", "webcam", "cuts", "funeral", "nutten", "earrings", "enjoyed", "automated", "chapters", "pee", "charlie", "quebec", "passenger", "convenient", "dennis", "mars", "francis", "tvs", "sized", "manga", "noticed", "socket", "silent", "literary", "egg", "mhz", "signals", "caps", "orientation", "pill", "theft", "childhood", "swing", "symbols", "lat", "meta", "humans", "analog", "facial", "choosing", "talent", "dated", "flexibility", "seeker", "wisdom", "shoot", "boundary", "mint", "packard", "offset", "payday", "philip", "elite", "spin", "holders", "believes", "swedish", "poems", "deadline", "jurisdiction", "robot", "displaying", "witness", "collins", "equipped", "stages", "encouraged", "sur", "winds", "powder", "broadway", "acquired", "assess", "wash", "cartridges", "stones", "entrance", "gnome", "roots", "declaration", "losing", "attempts", "gadgets", "noble", "glasgow", "automation", "impacts", "rev", "gospel", "advantages", "shore", "loves", "induced", "knight", "preparing", "loose", "aims", "recipient", "linking", "extensions", "appeals", "earned", "illness", "islamic", "athletics", "southeast", "ieee", "alternatives", "pending", "parker", "determining", "lebanon", "corp", "personalized", "kennedy", "conditioning", "teenage", "soap", "triple", "cooper", "nyc", "vincent", "jam", "secured", "unusual", "answered", "partnerships", "destruction", "slots", "increasingly", "migration", "disorder", "routine", "toolbar", "basically", "rocks", "conventional", "titans", "applicants", "wearing", "axis", "sought", "genes", "mounted", "habitat", "firewall", "median", "guns", "scanner", "herein", "occupational", "animated", "judicial", "rio", "adjustment", "hero", "integer", "treatments", "bachelor", "attitude", "camcorders", "engaged", "falling", "basics", "montreal", "carpet", "struct", "lenses", "binary", "genetics", "attended", "difficulty", "punk", "collective", "coalition", "dropped", "enrollment", "duke", "walter", "pace", "besides", "wage", "producers", "collector", "arc", "hosts", "interfaces", "advertisers", "moments", "atlas", "strings", "dawn", "representing", "observation", "feels", "torture", "carl", "deleted", "coat", "mitchell", "mrs", "rica", "restoration", "convenience", "returning", "ralph", "opposition", "container", "defendant", "warner", "confirmation", "app", "embedded", "inkjet", "supervisor", "wizard", "corps", "actors", "liver", "peripherals", "liable", "brochure", "morris", "bestsellers", "petition", "eminem", "recall", "antenna", "picked", "assumed", "departure", "minneapolis", "belief", "killing", "bikini", "memphis", "shoulder", "decor", "lookup", "texts", "harvard", "brokers", "roy", "ion", "diameter", "ottawa", "doll", "podcast", "seasons", "peru", "interactions", "refine", "bidder", "singer", "evans", "herald", "literacy", "fails", "aging", "nike", "intervention", "fed", "plugin", "attraction", "diving", "invite", "modification", "alice", "latinas", "suppose", "customized", "reed", "involve", "moderate", "terror", "younger", "thirty", "mice", "opposite", "understood", "rapidly", "dealtime", "ban", "temp", "intro", "mercedes", "zus", "assurance", "clerk", "happening", "vast", "mills", "outline", "amendments", "tramadol", "holland", "receives", "jeans", "metropolitan", "compilation", "verification", "fonts", "ent", "odd", "wrap", "refers", "mood", "favor", "veterans", "quiz", "sigma", "attractive", "xhtml", "occasion", "recordings", "jefferson", "victim", "demands", "sleeping", "careful", "ext", "beam", "gardening", "obligations", "arrive", "orchestra", "sunset", "tracked", "moreover", "minimal", "polyphonic", "lottery", "tops", "framed", "aside", "outsourcing", "licence", "adjustable", "allocation", "michelle", "essay", "discipline", "amy", "demonstrated", "dialogue", "identifying", "alphabetical", "camps", "declared", "dispatched", "aaron", "handheld", "trace", "disposal", "shut", "florists", "packs", "installing", "switches", "romania", "voluntary", "ncaa", "thou", "consult", "phd", "greatly", "blogging", "mask", "cycling", "midnight", "commonly", "photographer", "inform", "turkish", "coal", "cry", "messaging", "pentium", "quantum", "murray", "intent", "zoo", "largely", "pleasant", "announce", "constructed", "additions", "requiring", "spoke", "aka", "arrow", "engagement", "sampling", "rough", "weird", "tee", "refinance", "lion", "inspired", "holes", "weddings", "blade", "suddenly", "oxygen", "cookie", "meals", "canyon", "goto", "meters", "merely", "calendars", "arrangement", "conclusions", "passes", "bibliography", "pointer", "compatibility", "stretch", "durham", "furthermore", "permits", "cooperative", "muslim", "neil", "sleeve", "netscape", "cleaner", "cricket", "beef", "feeding", "stroke", "township", "rankings", "measuring", "cad", "hats", "robin", "robinson", "jacksonville", "strap", "headquarters", "sharon", "crowd", "tcp", "transfers", "surf", "olympic", "transformation", "remained", "attachments", "dir", "entities", "customs", "administrators", "personality", "rainbow", "hook", "roulette", "decline", "gloves", "israeli", "medicare", "cord", "skiing", "cloud", "facilitate", "subscriber", "valve", "val", "hewlett", "explains", "proceed", "flickr", "feelings", "knife", "jamaica", "priorities", "shelf", "bookstore", "timing", "liked", "parenting", "adopt", "denied", "fotos", "incredible", "britney", "freeware", "donation", "outer", "crop", "deaths", "rivers", "commonwealth", "pharmaceutical", "manhattan", "tales", "katrina", "workforce", "islam", "nodes", "thumbs", "seeds", "cited", "lite", "ghz", "hub", "targeted", "organizational", "skype", "realized", "twelve", "founder", "decade", "gamecube", "dispute", "portuguese", "tired", "titten", "adverse", "everywhere", "excerpt", "eng", "steam", "discharge", "drinks", "ace", "voices", "acute", "halloween", "climbing", "stood", "sing", "tons", "perfume", "carol", "honest", "albany", "hazardous", "restore", "stack", "methodology", "somebody", "sue", "housewares", "reputation", "resistant", "democrats", "recycling", "hang", "gbp", "curve", "creator", "amber", "qualifications", "museums", "coding", "slideshow", "tracker", "variation", "passage", "transferred", "trunk", "hiking", "pierre", "jelsoft", "headset", "photograph", "oakland", "colombia", "waves", "camel", "distributor", "lamps", "underlying", "hood", "wrestling", "suicide", "archived", "photoshop", "chi", "arabia", "gathering", "projection", "juice", "chase", "mathematical", "logical", "sauce", "fame", "extract", "specialized", "diagnostic", "panama", "indianapolis", "payable", "corporations", "courtesy", "criticism", "automobile", "confidential", "rfc", "statutory", "accommodations", "athens", "northeast", "downloaded", "judges", "seo", "retired", "isp", "remarks", "detected", "decades", "paintings", "walked", "arising", "nissan", "bracelet", "ins", "eggs", "juvenile", "injection", "yorkshire", "populations", "protective", "afraid", "acoustic", "railway", "cassette", "initially", "indicator", "pointed", "jpg", "causing", "mistake", "norton", "locked", "eliminate", "fusion", "mineral", "sunglasses", "ruby", "steering", "beads", "fortune", "preference", "canvas", "threshold", "parish", "claimed", "screens", "cemetery", "planner", "croatia", "flows", "stadium", "venezuela", "exploration", "mins", "fewer", "sequences", "coupon", "nurses", "ssl", "stem", "proxy", "astronomy", "lanka", "opt", "edwards", "drew", "contests", "flu", "translate", "announces", "mlb", "costume", "tagged", "berkeley", "voted", "killer", "bikes", "gates", "adjusted", "rap", "tune", "bishop", "pulled", "corn", "shaped", "compression", "seasonal", "establishing", "farmer", "counters", "puts", "constitutional", "grew", "perfectly", "tin", "slave", "instantly", "cultures", "norfolk", "coaching", "examined", "trek", "encoding", "litigation", "submissions", "oem", "heroes", "painted", "lycos", "zdnet", "broadcasting", "horizontal", "artwork", "cosmetic", "resulted", "portrait", "terrorist", "informational", "ethical", "carriers", "ecommerce", "mobility", "floral", "builders", "ties", "struggle", "schemes", "suffering", "neutral", "fisher", "rat", "spears", "prospective", "bedding", "ultimately", "joining", "heading", "equally", "artificial", "bearing", "spectacular", "coordination", "connector", "brad", "combo", "seniors", "worlds", "guilty", "affiliated", "activation", "naturally", "haven", "tablet", "jury", "dos", "tail", "subscribers", "charm", "lawn", "violent", "mitsubishi", "underwear", "basin", "soup", "potentially", "ranch", "constraints", "crossing", "inclusive", "dimensional", "cottage", "drunk", "considerable", "crimes", "resolved", "mozilla", "byte", "toner", "nose", "latex", "branches", "anymore", "oclc", "delhi", "holdings", "alien", "locator", "selecting", "processors", "pantyhose", "plc", "broke", "nepal", "zimbabwe", "difficulties", "juan", "complexity", "msg", "constantly", "browsing", "resolve", "barcelona", "presidential", "documentary", "cod", "territories", "melissa", "moscow", "thesis", "thru", "jews", "nylon", "palestinian", "discs", "rocky", "bargains", "frequent", "trim", "nigeria", "ceiling", "pixels", "ensuring", "hispanic", "legislature", "hospitality", "gen", "anybody", "procurement", "diamonds", "espn", "fleet", "untitled", "bunch", "totals", "marriott", "singing", "theoretical", "afford", "exercises", "starring", "referral", "nhl", "surveillance", "optimal", "quit", "distinct", "protocols", "lung", "highlight", "substitute", "inclusion", "hopefully", "brilliant", "turner", "sucking", "cents", "reuters", "gel", "todd", "spoken", "omega", "evaluated", "stayed", "civic", "assignments", "manuals", "doug", "sees", "termination", "watched", "saver", "thereof", "grill", "households", "redeem", "rogers", "grain", "aaa", "authentic", "regime", "wanna", "wishes", "bull", "montgomery", "architectural", "louisville", "depend", "differ", "macintosh", "movements", "ranging", "monica", "repairs", "breath", "amenities", "virtually", "cole", "mart", "candle", "hanging", "colored", "authorization", "tale", "verified", "lynn", "formerly", "projector", "situated", "comparative", "std", "seeks", "herbal", "loving", "strictly", "routing", "docs", "stanley", "psychological", "surprised", "retailer", "vitamins", "elegant", "gains", "renewal", "vid", "genealogy", "opposed", "deemed", "scoring", "expenditure", "brooklyn", "liverpool", "sisters", "critics", "connectivity", "spots", "algorithms", "hacker", "madrid", "similarly", "margin", "coin", "solely", "fake", "salon", "collaborative", "norman", "fda", "excluding", "turbo", "headed", "voters", "cure", "madonna", "commander", "arch", "murphy", "thinks", "thats", "suggestion", "hdtv", "soldier", "phillips", "asin", "aimed", "justin", "bomb", "harm", "interval", "mirrors", "spotlight", "tricks", "reset", "brush", "investigate", "thy", "expansys", "panels", "repeated", "assault", "connecting", "spare", "logistics", "deer", "kodak", "tongue", "bowling", "tri", "danish", "pal", "monkey", "proportion", "filename", "skirt", "florence", "invest", "honey", "analyzes", "drawings", "significance", "scenario", "lovers", "atomic", "approx", "symposium", "arabic", "gauge", "essentials", "junction", "protecting", "faced", "mat", "rachel", "solving", "transmitted", "weekends", "screenshots", "produces", "oven", "ted", "intensive", "chains", "kingston", "sixth", "engage", "deviant", "noon", "switching", "quoted", "adapters", "correspondence", "farms", "imports", "supervision", "cheat", "bronze", "expenditures", "sandy", "separation", "testimony", "suspect", "celebrities", "macro", "sender", "mandatory", "boundaries", "crucial", "syndication", "gym", "celebration", "kde", "adjacent", "filtering", "tuition", "spouse", "exotic", "viewer", "signup", "threats", "luxembourg", "puzzles", "reaching", "damaged", "cams", "receptor", "laugh", "joel", "surgical", "destroy", "citation", "pitch", "autos", "premises", "perry", "proved", "offensive", "imperial", "dozen", "benjamin", "deployment", "teeth", "cloth", "studying", "colleagues", "stamp", "lotus", "salmon", "olympus", "separated", "proc", "cargo", "tan", "directive", "salem", "mate", "starter", "upgrades", "likes", "butter", "pepper", "weapon", "luggage", "burden", "chef", "tapes", "zones", "races", "isle", "stylish", "slim", "maple", "luke", "grocery", "offshore", "governing", "retailers", "depot", "kenneth", "comp", "alt", "pie", "blend", "harrison", "julie", "occasionally", "cbs", "attending", "emission", "pete", "spec", "finest", "realty", "janet", "bow", "penn", "recruiting", "apparent", "instructional", "phpbb", "autumn", "traveling", "probe", "midi", "permissions", "biotechnology", "toilet", "ranked", "jackets", "routes", "packed", "excited", "outreach", "helen", "mounting", "recover", "tied", "lopez", "balanced", "prescribed", "catherine", "timely", "talked", "upskirts", "debug", "delayed", "chuck", "reproduced", "hon", "dale", "explicit", "calculation", "villas", "ebook", "consolidated", "exclude", "peeing", "occasions", "brooks", "equations", "newton", "oils", "sept", "exceptional", "anxiety", "bingo", "whilst", "spatial", "respondents", "unto", "ceramic", "prompt", "precious", "minds", "annually", "considerations", "scanners", "atm", "xanax", "pays", "fingers", "sunny", "ebooks", "delivers", "queensland", "necklace", "musicians", "leeds", "composite", "unavailable", "cedar", "arranged", "lang", "theaters", "advocacy", "raleigh", "stud", "fold", "essentially", "designing", "threaded", "qualify", "blair", "hopes", "assessments", "cms", "mason", "diagram", "burns", "pumps", "footwear", "vic", "beijing", "peoples", "victor", "mario", "pos", "attach", "licenses", "utils", "removing", "advised", "brunswick", "spider", "phys", "ranges", "pairs", "sensitivity", "trails", "preservation", "hudson", "isolated", "calgary", "interim", "assisted", "divine", "streaming", "approve", "chose", "compound", "intensity", "technological", "syndicate", "abortion", "dialog", "venues", "blast", "wellness", "calcium", "newport", "antivirus", "addressing", "pole", "discounted", "indians", "shield", "harvest", "membrane", "prague", "previews", "bangladesh", "constitute", "locally", "concluded", "pickup", "desperate", "mothers", "nascar", "iceland", "demonstration", "governmental", "manufactured", "candles", "graduation", "mega", "bend", "sailing", "variations", "moms", "sacred", "addiction", "morocco", "chrome", "tommy", "springfield", "refused", "brake", "exterior", "greeting", "ecology", "oliver", "congo", "glen", "botswana", "nav", "delays", "synthesis", "olive", "undefined", "unemployment", "cyber", "verizon", "scored", "enhancement", "newcastle", "clone", "dicks", "velocity", "lambda", "relay", "composed", "tears", "performances", "oasis", "baseline", "cab", "angry", "societies", "silicon", "brazilian", "identical", "petroleum", "compete", "ist", "norwegian", "lover", "belong", "honolulu", "beatles", "lips", "retention", "exchanges", "pond", "rolls", "thomson", "barnes", "soundtrack", "wondering", "malta", "daddy", "ferry", "rabbit", "profession", "seating", "dam", "cnn", "separately", "physiology", "lil", "collecting", "das", "exports", "omaha", "tire", "participant", "scholarships", "recreational", "dominican", "chad", "electron", "loads", "friendship", "heather", "passport", "motel", "unions", "treasury", "warrant", "sys", "solaris", "frozen", "occupied", "josh", "royalty", "scales", "rally", "observer", "sunshine", "strain", "drag", "ceremony", "somehow", "arrested", "expanding", "provincial", "investigations", "icq", "ripe", "yamaha", "rely", "medications", "hebrew", "gained", "rochester", "dying", "laundry", "stuck", "solomon", "placing", "stops", "homework", "adjust", "assessed", "advertiser", "enabling", "encryption", "filling", "downloadable", "sophisticated", "imposed", "silence", "scsi", "focuses", "soviet", "possession", "laboratories", "treaty", "vocal", "trainer", "organ", "stronger", "volumes", "advances", "vegetables", "lemon", "toxic", "dns", "thumbnails", "darkness", "pty", "nuts", "nail", "bizrate", "vienna", "implied", "span", "stanford", "sox", "stockings", "joke", "respondent", "packing", "statute", "rejected", "satisfy", "destroyed", "shelter", "chapel", "gamespot", "manufacture", "layers", "wordpress", "guided", "vulnerability", "accountability", "celebrate", "accredited", "appliance", "compressed", "bahamas", "powell", "mixture", "bench", "univ", "tub", "rider", "scheduling", "radius", "perspectives", "mortality", "logging", "hampton", "christians", "borders", "therapeutic", "pads", "butts", "inns", "bobby", "impressive", "sheep", "accordingly", "architect", "railroad", "lectures", "challenging", "wines", "nursery", "harder", "cups", "ash", "microwave", "cheapest", "accidents", "travesti", "relocation", "stuart", "contributors", "salvador", "ali", "salad", "monroe", "tender", "violations", "foam", "temperatures", "paste", "clouds", "competitions", "discretion", "tft", "tanzania", "preserve", "jvc", "poem", "unsigned", "staying", "cosmetics", "easter", "theories", "repository", "praise", "jeremy", "venice", "concentrations", "vibrators", "estonia", "christianity", "veteran", "streams", "landing", "signing", "executed", "katie", "negotiations", "realistic", "cgi", "showcase", "integral", "asks", "relax", "namibia", "generating", "christina", "congressional", "synopsis", "hardly", "prairie", "reunion", "composer", "bean", "sword", "absent", "photographic", "sells", "ecuador", "hoping", "accessed", "spirits", "modifications", "coral", "pixel", "float", "colin", "bias", "imported", "paths", "bubble", "por", "acquire", "contrary", "millennium", "tribune", "vessel", "acids", "focusing", "viruses", "cheaper", "admitted", "dairy", "admit", "mem", "fancy", "equality", "samoa", "achieving", "tap", "stickers", "fisheries", "exceptions", "reactions", "leasing", "lauren", "beliefs", "macromedia", "companion", "squad", "analyze", "ashley", "scroll", "relate", "divisions", "swim", "wages", "additionally", "suffer", "forests", "fellowship", "nano", "invalid", "concerts", "martial", "males", "victorian", "retain", "execute", "tunnel", "genres", "cambodia", "patents", "copyrights", "chaos", "lithuania", "mastercard", "wheat", "chronicles", "obtaining", "beaver", "updating", "distribute", "readings", "decorative", "kijiji", "confused", "compiler", "enlargement", "eagles", "bases", "vii", "accused", "bee", "campaigns", "unity", "loud", "conjunction", "bride", "rats", "defines", "airports", "instances", "indigenous", "begun", "cfr", "brunette", "packets", "anchor", "socks", "validation", "parade", "corruption", "stat", "trigger", "incentives", "cholesterol", "gathered", "essex", "slovenia", "notified", "differential", "beaches", "folders", "dramatic", "surfaces", "terrible", "routers", "cruz", "pendant", "dresses", "baptist", "scientist", "starsmerchant", "hiring", "clocks", "arthritis", "bios", "females", "wallace", "nevertheless", "reflects", "taxation", "fever", "pmc", "cuisine", "surely", "practitioners", "transcript", "myspace", "theorem", "inflation", "thee", "ruth", "pray", "stylus", "compounds", "pope", "drums", "contracting", "arnold", "structured", "reasonably", "jeep", "chicks", "bare", "hung", "cattle", "mba", "radical", "graduates", "rover", "recommends", "controlling", "treasure", "reload", "distributors", "flame", "levitra", "tanks", "assuming", "monetary", "elderly", "pit", "arlington", "mono", "particles", "floating", "extraordinary", "tile", "indicating", "bolivia", "spell", "hottest", "stevens", "coordinate", "kuwait", "exclusively", "emily", "alleged", "limitation", "widescreen", "compile", "squirting", "webster", "struck", "illustration", "plymouth", "warnings", "construct", "apps", "inquiries", "bridal", "annex", "mag", "gsm", "inspiration", "tribal", "curious", "affecting", "freight", "rebate", "meetup", "eclipse", "sudan", "ddr", "downloading", "rec", "shuttle", "aggregate", "stunning", "cycles", "affects", "forecasts", "detect", "actively", "ciao", "ampland", "knee", "prep", "complicated", "chem", "fastest", "butler", "shopzilla", "injured", "decorating", "payroll", "cookbook", "expressions", "ton", "courier", "uploaded", "shakespeare", "hints", "collapse", "americas", "connectors", "twinks", "unlikely", "gif", "pros", "conflicts", "techno", "beverage", "tribute", "wired", "elvis", "immune", "latvia", "travelers", "forestry", "barriers", "cant", "rarely", "gpl", "infected", "offerings", "martha", "genesis", "barrier", "argue", "incorrect", "trains", "metals", "bicycle", "furnishings", "letting", "arise", "guatemala", "celtic", "thereby", "irc", "jamie", "particle", "perception", "minerals", "advise", "humidity", "bottles", "boxing", "bangkok", "renaissance", "pathology", "sara", "bra", "ordinance", "hughes", "photographers", "infections", "jeffrey", "chess", "operates", "brisbane", "configured", "survive", "oscar", "festivals", "menus", "joan", "possibilities", "duck", "reveal", "canal", "amino", "phi", "contributing", "herbs", "clinics", "mls", "cow", "manitoba", "analytical", "missions", "watson", "lying", "costumes", "strict", "dive", "saddam", "circulation", "drill", "offense", "bryan", "cet", "protest", "assumption", "jerusalem", "hobby", "tries", "transexuales", "invention", "nickname", "fiji", "technician", "inline", "executives", "enquiries", "washing", "audi", "staffing", "cognitive", "exploring", "trick", "enquiry", "closure", "raid", "ppc", "timber", "volt", "intense", "div", "playlist", "registrar", "showers", "supporters", "ruling", "steady", "dirt", "statutes", "withdrawal", "myers", "drops", "predicted", "wider", "saskatchewan", "cancellation", "plugins", "enrolled", "sensors", "screw", "ministers", "publicly", "hourly", "blame", "geneva", "freebsd", "veterinary", "acer", "prostores", "reseller", "dist", "handed", "suffered", "intake", "informal", "relevance", "incentive", "butterfly", "tucson", "mechanics", "heavily", "swingers", "fifty", "headers", "mistakes", "numerical", "ons", "geek", "uncle", "defining", "xnxx", "counting", "reflection", "sink", "accompanied", "assure", "invitation", "devoted", "princeton", "jacob", "sodium", "randy", "spirituality", "hormone", "meanwhile", "proprietary", "timothy", "childrens", "brick", "grip", "naval", "thumbzilla", "medieval", "porcelain", "avi", "bridges", "pichunter", "captured", "watt", "thehun", "decent", "casting", "dayton", "translated", "shortly", "cameron", "columnists", "pins", "carlos", "reno", "donna", "andreas", "warrior", "diploma", "cabin", "innocent", "scanning", "ide", "consensus", "polo", "valium", "copying", "rpg", "delivering", "cordless", "patricia", "horn", "eddie", "uganda", "fired", "journalism", "prot", "trivia", "adidas", "perth", "frog", "grammar", "intention", "syria", "disagree", "klein", "harvey", "tires", "logs", "undertaken", "tgp", "hazard", "retro", "leo", "livesex", "statewide", "semiconductor", "gregory", "episodes", "boolean", "circular", "anger", "diy", "mainland", "illustrations", "suits", "chances", "interact", "snap", "happiness", "arg", "substantially", "bizarre", "glenn", "auckland", "olympics", "fruits", "identifier", "geo", "worldsex", "ribbon", "calculations", "doe", "jpeg", "conducting", "startup", "suzuki", "trinidad", "ati", "kissing", "wal", "handy", "swap", "exempt", "crops", "reduces", "accomplished", "calculators", "geometry", "impression", "abs", "slovakia", "flip", "guild", "correlation", "gorgeous", "capitol", "sim", "dishes", "rna", "barbados", "chrysler", "nervous", "refuse", "extends", "fragrance", "mcdonald", "replica", "plumbing", "brussels", "tribe", "neighbors", "trades", "superb", "buzz", "transparent", "nuke", "rid", "trinity", "charleston", "handled", "legends", "boom", "calm", "champions", "floors", "selections", "projectors", "inappropriate", "exhaust", "comparing", "shanghai", "speaks", "burton", "vocational", "davidson", "copied", "scotia", "farming", "gibson", "pharmacies", "fork", "troy", "roller", "introducing", "batch", "organize", "appreciated", "alter", "nicole", "latino", "ghana", "edges", "mixing", "handles", "skilled", "fitted", "albuquerque", "harmony", "distinguished", "asthma", "projected", "assumptions", "shareholders", "twins", "developmental", "rip", "zope", "regulated", "triangle", "amend", "anticipated", "oriental", "reward", "windsor", "zambia", "completing", "gmbh", "buf", "hydrogen", "webshots", "sprint", "comparable", "chick", "advocate", "sims", "confusion", "copyrighted", "tray", "inputs", "warranties", "genome", "escorts", "documented", "thong", "medal", "paperbacks", "coaches", "vessels", "walks", "sol", "keyboards", "sage", "knives", "eco", "vulnerable", "arrange", "artistic", "bat", "honors", "booth", "indie", "reflected", "unified", "bones", "breed", "detector", "ignored", "polar", "fallen", "precise", "sussex", "respiratory", "notifications", "msgid", "transexual", "mainstream", "invoice", "evaluating", "lip", "subcommittee", "sap", "gather", "suse", "maternity", "backed", "alfred", "colonial", "carey", "motels", "forming", "embassy", "cave", "journalists", "danny", "rebecca", "slight", "proceeds", "indirect", "amongst", "wool", "foundations", "msgstr", "arrest", "volleyball", "adipex", "horizon", "deeply", "toolbox", "ict", "marina", "liabilities", "prizes", "bosnia", "browsers", "decreased", "patio", "tolerance", "surfing", "creativity", "lloyd", "describing", "optics", "pursue", "lightning", "overcome", "eyed", "quotations", "grab", "inspector", "attract", "brighton", "beans", "bookmarks", "ellis", "disable", "snake", "succeed", "leonard", "lending", "oops", "reminder", "searched", "behavioral", "riverside", "bathrooms", "plains", "sku", "raymond", "insights", "abilities", "initiated", "sullivan", "midwest", "karaoke", "trap", "lonely", "fool", "nonprofit", "lancaster", "suspended", "hereby", "observe", "julia", "containers", "attitudes", "karl", "berry", "collar", "simultaneously", "racial", "integrate", "bermuda", "amanda", "sociology", "mobiles", "screenshot", "exhibitions", "kelkoo", "confident", "retrieved", "exhibits", "officially", "consortium", "dies", "terrace", "bacteria", "pts", "replied", "seafood", "novels", "rrp", "recipients", "ought", "delicious", "traditions", "jail", "safely", "finite", "kidney", "periodically", "fixes", "sends", "durable", "mazda", "allied", "throws", "moisture", "hungarian", "roster", "referring", "symantec", "spencer", "wichita", "nasdaq", "uruguay", "ooo", "transform", "timer", "tablets", "tuning", "gotten", "educators", "tyler", "futures", "vegetable", "verse", "highs", "humanities", "independently", "wanting", "custody", "scratch", "launches", "ipaq", "alignment", "masturbating", "henderson", "britannica", "comm", "ellen", "competitors", "nhs", "rocket", "aye", "bullet", "towers", "racks", "lace", "nasty", "visibility", "latitude", "consciousness", "ste", "tumor", "ugly", "deposits", "beverly", "mistress", "encounter", "trustees", "watts", "duncan", "reprints", "hart", "bernard", "resolutions", "ment", "accessing", "forty", "tubes", "attempted", "col", "midlands", "priest", "floyd", "ronald", "analysts", "queue", "trance", "locale", "nicholas", "biol", "bundle", "hammer", "invasion", "witnesses", "runner", "rows", "administered", "notion", "skins", "mailed", "fujitsu", "spelling", "arctic", "exams", "rewards", "beneath", "strengthen", "defend", "frederick", "medicaid", "treo", "infrared", "seventh", "gods", "une", "welsh", "belly", "aggressive", "tex", "advertisements", "quarters", "stolen", "cia", "sublimedirectory", "soonest", "haiti", "disturbed", "determines", "sculpture", "poly", "ears", "dod", "fist", "naturals", "neo", "motivation", "lenders", "pharmacology", "fitting", "fixtures", "bloggers", "mere", "agrees", "passengers", "quantities", "petersburg", "consistently", "powerpoint", "cons", "surplus", "elder", "sonic", "obituaries", "cheers", "dig", "taxi", "punishment", "appreciation", "subsequently", "belarus", "nat", "zoning", "gravity", "providence", "thumb", "restriction", "incorporate", "backgrounds", "treasurer", "guitars", "essence", "flooring", "lightweight", "ethiopia", "mighty", "athletes", "humanity", "transcription", "holmes", "complications", "scholars", "dpi", "scripting", "gis", "remembered", "galaxy", "chester", "snapshot", "caring", "loc", "worn", "synthetic", "shaw", "segments", "testament", "expo", "dominant", "twist", "specifics", "itunes", "stomach", "partially", "buried", "newbie", "minimize", "darwin", "ranks", "wilderness", "debut", "generations", "tournaments", "bradley", "deny", "anatomy", "bali", "judy", "sponsorship", "headphones", "fraction", "trio", "proceeding", "cube", "defects", "volkswagen", "uncertainty", "breakdown", "milton", "marker", "reconstruction", "subsidiary", "strengths", "clarity", "rugs", "sandra", "adelaide", "encouraging", "furnished", "monaco", "settled", "folding", "emirates", "terrorists", "airfare", "comparisons", "beneficial", "distributions", "vaccine", "belize", "fate", "viewpicture", "promised", "volvo", "penny", "robust", "bookings", "threatened", "minolta", "republicans", "discusses", "gui", "porter", "gras", "jungle", "ver", "responded", "rim", "abstracts", "zen", "ivory", "alpine", "dis", "prediction", "pharmaceuticals", "andale", "fabulous", "remix", "alias", "thesaurus", "individually", "battlefield", "literally", "newer", "kay", "ecological", "spice", "oval", "implies", "soma", "ser", "cooler", "appraisal", "consisting", "maritime", "periodic", "submitting", "overhead", "ascii", "prospect", "shipment", "breeding", "citations", "geographical", "donor", "mozambique", "tension", "href", "benz", "trash", "shapes", "wifi", "tier", "fwd", "earl", "manor", "envelope", "diane", "homeland", "disclaimers", "championships", "excluded", "andrea", "breeds", "rapids", "disco", "sheffield", "bailey", "aus", "endif", "finishing", "emotions", "wellington", "incoming", "prospects", "lexmark", "cleaners", "bulgarian", "hwy", "eternal", "cashiers", "guam", "cite", "aboriginal", "remarkable", "rotation", "nam", "preventing", "productive", "boulevard", "eugene", "gdp", "pig", "metric", "compliant", "minus", "penalties", "bennett", "imagination", "hotmail", "refurbished", "joshua", "armenia", "varied", "grande", "closest", "activated", "actress", "mess", "conferencing", "assign", "armstrong", "politicians", "trackbacks", "lit", "accommodate", "tigers", "aurora", "una", "slides", "milan", "premiere", "lender", "villages", "shade", "chorus", "christine", "rhythm", "digit", "argued", "dietary", "symphony", "clarke", "sudden", "accepting", "precipitation", "marilyn", "lions", "findlaw", "ada", "pools", "lyric", "claire", "isolation", "speeds", "sustained", "matched", "approximate", "rope", "carroll", "rational", "programmer", "fighters", "chambers", "dump", "greetings", "inherited", "warming", "incomplete", "vocals", "chronicle", "fountain", "chubby", "grave", "legitimate", "biographies", "burner", "yrs", "foo", "investigator", "gba", "plaintiff", "finnish", "gentle", "prisoners", "deeper", "muslims", "hose", "mediterranean", "nightlife", "footage", "howto", "worthy", "reveals", "architects", "saints", "entrepreneur", "carries", "sig", "freelance", "duo", "excessive", "devon", "screensaver", "helena", "saves", "regarded", "valuation", "unexpected", "cigarette", "fog", "characteristic", "marion", "lobby", "egyptian", "tunisia", "metallica", "outlined", "consequently", "headline", "treating", "punch", "appointments", "str", "gotta", "cowboy", "narrative", "bahrain", "enormous", "karma", "consist", "betty", "queens", "academics", "pubs", "quantitative", "shemales", "lucas", "screensavers", "subdivision", "tribes", "vip", "defeat", "clicks", "distinction", "honduras", "naughty", "hazards", "insured", "harper", "livestock", "mardi", "exemption", "tenant", "sustainability", "cabinets", "tattoo", "shake", "algebra", "shadows", "holly", "formatting", "silly", "nutritional", "yea", "mercy", "hartford", "freely", "marcus", "sunrise", "wrapping", "mild", "fur", "nicaragua", "weblogs", "timeline", "tar", "belongs", "readily", "affiliation", "soc", "fence", "nudist", "infinite", "diana", "ensures", "relatives", "lindsay", "clan", "legally", "shame", "satisfactory", "revolutionary", "bracelets", "sync", "civilian", "telephony", "mesa", "fatal", "remedy", "realtors", "breathing", "briefly", "thickness", "adjustments", "graphical", "genius", "discussing", "aerospace", "fighter", "meaningful", "flesh", "retreat", "adapted", "barely", "wherever", "estates", "rug", "democrat", "borough", "maintains", "failing", "shortcuts", "retained", "voyeurweb", "pamela", "andrews", "marble", "extending", "jesse", "specifies", "hull", "logitech", "surrey", "briefing", "belkin", "dem", "accreditation", "wav", "blackberry", "highland", "meditation", "modular", "microphone", "macedonia", "combining", "brandon", "instrumental", "giants", "organizing", "shed", "balloon", "moderators", "winston", "memo", "ham", "solved", "tide", "kazakhstan", "hawaiian", "standings", "partition", "invisible", "gratuit", "consoles", "funk", "fbi", "qatar", "magnet", "translations", "porsche", "cayman", "jaguar", "reel", "sheer", "commodity", "posing", "kilometers", "bind", "thanksgiving", "rand", "hopkins", "urgent", "guarantees", "infants", "gothic", "cylinder", "witch", "buck", "indication", "congratulations", "tba", "cohen", "sie", "usgs", "puppy", "kathy", "acre", "graphs", "surround", "cigarettes", "revenge", "expires", "enemies", "lows", "controllers", "aqua", "chen", "emma", "consultancy", "finances", "accepts", "enjoying", "conventions", "eva", "patrol", "smell", "pest", "italiano", "coordinates", "rca", "carnival", "roughly", "sticker", "promises", "responding", "reef", "physically", "divide", "stakeholders", "hydrocodone", "gst", "consecutive", "cornell", "satin", "bon", "deserve", "attempting", "mailto", "promo", "representations", "chan", "worried", "tunes", "garbage", "competing", "combines", "mas", "beth", "bradford", "len", "phrases", "kai", "peninsula", "chelsea", "boring", "reynolds", "dom", "jill", "accurately", "speeches", "reaches", "schema", "considers", "sofa", "catalogs", "ministries", "vacancies", "quizzes", "parliamentary", "obj", "prefix", "lucia", "savannah", "barrel", "typing", "nerve", "dans", "planets", "deficit", "boulder", "pointing", "renew", "coupled", "viii", "myanmar", "metadata", "harold", "circuits", "floppy", "texture", "handbags", "jar", "somerset", "incurred", "acknowledge", "thoroughly", "antigua", "nottingham", "thunder", "tent", "caution", "identifies", "questionnaire", "qualification", "locks", "modelling", "namely", "miniature", "dept", "hack", "dare", "euros", "interstate", "pirates", "aerial", "hawk", "consequence", "rebel", "systematic", "perceived", "origins", "hired", "makeup", "textile", "lamb", "madagascar", "nathan", "tobago", "presenting", "cos", "troubleshooting", "uzbekistan", "indexes", "pac", "erp", "centuries", "magnitude", "richardson", "hindu", "fragrances", "vocabulary", "licking", "earthquake", "vpn", "fundraising", "fcc", "markers", "weights", "albania", "geological", "assessing", "lasting", "wicked", "eds", "introduces", "kills", "roommate", "webcams", "pushed", "webmasters", "computational", "acdbentity", "participated", "junk", "handhelds", "wax", "lucy", "answering", "hans", "impressed", "slope", "reggae", "failures", "poet", "conspiracy", "surname", "theology", "nails", "evident", "whats", "rides", "rehab", "epic", "saturn", "organizer", "nut", "allergy", "sake", "twisted", "combinations", "preceding", "merit", "enzyme", "cumulative", "zshops", "planes", "edmonton", "tackle", "disks", "condo", "pokemon", "amplifier", "ambien", "arbitrary", "prominent", "retrieve", "lexington", "vernon", "sans", "worldcat", "titanium", "irs", "fairy", "builds", "contacted", "shaft", "lean", "bye", "cdt", "recorders", "occasional", "leslie", "casio", "deutsche", "ana", "postings", "innovations", "kitty", "postcards", "dude", "drain", "monte", "fires", "algeria", "blessed", "luis", "reviewing", "cardiff", "cornwall", "favors", "potato", "panic", "explicitly", "sticks", "leone", "transsexual", "citizenship", "excuse", "reforms", "basement", "onion", "strand", "sandwich", "lawsuit", "alto", "informative", "girlfriend", "bloomberg", "cheque", "hierarchy", "influenced", "banners", "reject", "eau", "abandoned", "circles", "italic", "beats", "merry", "mil", "scuba", "gore", "complement", "cult", "dash", "passive", "mauritius", "valued", "cage", "checklist", "bangbus", "requesting", "courage", "verde", "lauderdale", "scenarios", "gazette", "hitachi", "divx", "extraction", "batman", "elevation", "hearings", "coleman", "hugh", "lap", "utilization", "beverages", "calibration", "jake", "eval", "efficiently", "anaheim", "ping", "textbook", "dried", "entertaining", "prerequisite", "luther", "frontier", "settle", "stopping", "refugees", "knights", "hypothesis", "palmer", "medicines", "flux", "derby", "sao", "peaceful", "altered", "pontiac", "regression", "doctrine", "scenic", "trainers", "muze", "enhancements", "renewable", "intersection", "passwords", "sewing", "consistency", "collectors", "conclude", "munich", "oman", "celebs", "gmc", "propose", "azerbaijan", "lighter", "rage", "adsl", "prix", "astrology", "advisors", "pavilion", "tactics", "trusts", "occurring", "supplemental", "travelling", "talented", "annie", "pillow", "induction", "derek", "precisely", "shorter", "harley", "spreading", "provinces", "relying", "finals", "paraguay", "steal", "parcel", "refined", "fifteen", "widespread", "incidence", "fears", "predict", "boutique", "acrylic", "rolled", "tuner", "avon", "incidents", "peterson", "rays", "asn", "shannon", "toddler", "enhancing", "flavor", "alike", "walt", "homeless", "horrible", "hungry", "metallic", "acne", "blocked", "interference", "warriors", "palestine", "listprice", "libs", "undo", "cadillac", "atmospheric", "malawi", "sagem", "knowledgestorm", "dana", "halo", "ppm", "curtis", "parental", "referenced", "strikes", "lesser", "publicity", "marathon", "ant", "proposition", "gays", "pressing", "gasoline", "apt", "dressed", "scout", "belfast", "exec", "dealt", "niagara", "inf", "eos", "warcraft", "charms", "catalyst", "trader", "bucks", "allowance", "vcr", "denial", "uri", "designation", "thrown", "prepaid", "raises", "gem", "duplicate", "electro", "criterion", "badge", "wrist", "civilization", "analyzed", "vietnamese", "heath", "tremendous", "ballot", "lexus", "varying", "remedies", "validity", "trustee", "maui", "handjobs", "weighted", "angola", "squirt", "performs", "plastics", "realm", "corrected", "jenny", "helmet", "salaries", "postcard", "elephant", "yemen", "encountered", "tsunami", "scholar", "nickel", "internationally", "surrounded", "psi", "buses", "expedia", "geology", "pct", "creatures", "coating", "commented", "wallet", "cleared", "smilies", "vids", "accomplish", "boating", "drainage", "shakira", "corners", "broader", "vegetarian", "rouge", "yeast", "yale", "newfoundland", "qld", "pas", "clearing", "investigated", "ambassador", "coated", "intend", "stephanie", "contacting", "vegetation", "doom", "findarticles", "louise", "kenny", "specially", "owen", "routines", "hitting", "yukon", "beings", "bite", "issn", "aquatic", "reliance", "habits", "striking", "myth", "infectious", "podcasts", "singh", "gig", "gilbert", "sas", "ferrari", "continuity", "brook", "outputs", "phenomenon", "ensemble", "insulin", "assured", "biblical", "weed", "conscious", "accent", "mysimon", "eleven", "wives", "ambient", "utilize", "mileage", "oecd", "prostate", "adaptor", "auburn", "unlock", "hyundai", "pledge", "vampire", "angela", "relates", "nitrogen", "xerox", "dice", "merger", "softball", "referrals", "quad", "dock", "differently", "firewire", "mods", "nextel", "framing", "musician", "blocking", "rwanda", "sorts", "integrating", "vsnet", "limiting", "dispatch", "revisions", "papua", "restored", "hint", "armor", "riders", "chargers", "remark", "dozens", "varies", "msie", "reasoning", "liz", "rendered", "picking", "charitable", "guards", "annotated", "ccd", "convinced", "openings", "buys", "burlington", "replacing", "researcher", "watershed", "councils", "occupations", "acknowledged", "kruger", "pockets", "granny", "pork", "equilibrium", "viral", "inquire", "pipes", "characterized", "laden", "aruba", "cottages", "realtor", "merge", "privilege", "edgar", "develops", "qualifying", "chassis", "dubai", "estimation", "barn", "pushing", "llp", "fleece", "pediatric", "boc", "fare", "asus", "pierce", "allan", "dressing", "techrepublic", "sperm", "bald", "filme", "craps", "fuji", "frost", "leon", "institutes", "mold", "dame", "sally", "yacht", "tracy", "prefers", "drilling", "brochures", "herb", "tmp", "alot", "ate", "breach", "whale", "traveller", "appropriations", "suspected", "tomatoes", "benchmark", "beginners", "instructors", "highlighted", "bedford", "stationery", "idle", "mustang", "unauthorized", "clusters", "antibody", "competent", "momentum", "fin", "wiring", "pastor", "mud", "calvin", "uni", "shark", "contributor", "demonstrates", "phases", "grateful", "emerald", "gradually", "laughing", "grows", "cliff", "desirable", "tract", "ballet", "journalist", "abraham", "bumper", "afterwards", "webpage", "religions", "garlic", "hostels", "shine", "senegal", "explosion", "banned", "wendy", "briefs", "signatures", "diffs", "cove", "mumbai", "ozone", "disciplines", "casa", "daughters", "conversations", "radios", "tariff", "nvidia", "opponent", "pasta", "simplified", "muscles", "serum", "wrapped", "swift", "motherboard", "runtime", "inbox", "focal", "bibliographic", "eden", "distant", "incl", "champagne", "ala", "decimal", "deviation", "superintendent", "propecia", "dip", "nbc", "samba", "hostel", "housewives", "employ", "mongolia", "penguin", "magical", "influences", "inspections", "irrigation", "miracle", "manually", "reprint", "reid", "hydraulic", "centered", "robertson", "flex", "yearly", "penetration", "wound", "belle", "rosa", "conviction", "hash", "omissions", "writings", "hamburg", "lazy", "mpg", "retrieval", "qualities", "cindy", "fathers", "carb", "charging", "cas", "marvel", "lined", "cio", "dow", "prototype", "importantly", "petite", "apparatus", "upc", "terrain", "dui", "pens", "explaining", "yen", "strips", "gossip", "rangers", "nomination", "empirical", "rotary", "worm", "dependence", "discrete", "beginner", "boxed", "lid", "sexuality", "polyester", "cubic", "deaf", "commitments", "suggesting", "sapphire", "kinase", "skirts", "mats", "remainder", "crawford", "labeled", "privileges", "televisions", "specializing", "marking", "commodities", "pvc", "serbia", "sheriff", "griffin", "declined", "guyana", "spies", "blah", "mime", "neighbor", "motorcycles", "elect", "highways", "thinkpad", "concentrate", "intimate", "reproductive", "preston", "deadly", "feof", "bunny", "chevy", "molecules", "rounds", "longest", "refrigerator", "tions", "intervals", "sentences", "dentists", "usda", "exclusion", "workstation", "holocaust", "keen", "flyer", "peas", "dosage", "receivers", "urls", "disposition", "variance", "navigator", "investigators", "cameroon", "baking", "marijuana", "adaptive", "computed", "needle", "baths", "enb", "cathedral", "brakes", "nirvana", "fairfield", "owns", "til", "invision", "sticky", "destiny", "generous", "madness", "emacs", "climb", "blowing", "fascinating", "landscapes", "heated", "lafayette", "jackie", "wto", "computation", "hay", "cardiovascular", "sparc", "cardiac", "salvation", "dover", "adrian", "predictions", "accompanying", "vatican", "brutal", "learners", "selective", "arbitration", "configuring", "token", "editorials", "zinc", "sacrifice", "seekers", "guru", "isa", "removable", "convergence", "yields", "gibraltar", "levy", "suited", "numeric", "anthropology", "skating", "kinda", "aberdeen", "emperor", "grad", "malpractice", "dylan", "bras", "belts", "blacks", "educated", "rebates", "reporters", "burke", "proudly", "pix", "necessity", "rendering", "mic", "inserted", "pulling", "basename", "kyle", "obesity", "curves", "suburban", "touring", "clara", "vertex", "hepatitis", "nationally", "tomato", "andorra", "waterproof", "expired", "travels", "flush", "waiver", "pale", "specialties", "hayes", "humanitarian", "invitations", "functioning", "delight", "survivor", "garcia", "cingular", "economies", "alexandria", "bacterial", "moses", "counted", "undertake", "declare", "continuously", "johns", "valves", "gaps", "impaired", "achievements", "donors", "tear", "jewel", "teddy", "convertible", "ata", "teaches", "ventures", "nil", "bufing", "stranger", "tragedy", "julian", "nest", "pam", "dryer", "painful", "velvet", "tribunal", "ruled", "nato", "pensions", "prayers", "funky", "secretariat", "nowhere", "cop", "paragraphs", "gale", "joins", "adolescent", "nominations", "wesley", "dim", "lately", "cancelled", "scary", "mattress", "mpegs", "brunei", "likewise", "banana", "introductory", "slovak", "cakes", "stan", "reservoir", "occurrence", "idol", "mixer", "remind", "worcester", "sbjct", "demographic", "charming", "mai", "tooth", "disciplinary", "annoying", "respected", "stays", "disclose", "affair", "drove", "washer", "upset", "restrict", "springer", "beside", "mines", "portraits", "rebound", "logan", "mentor", "interpreted", "evaluations", "fought", "baghdad", "elimination", "metres", "hypothetical", "immigrants", "complimentary", "helicopter", "pencil", "freeze", "performer", "abu", "titled", "commissions", "sphere", "powerseller", "moss", "ratios", "concord", "graduated", "endorsed", "surprising", "walnut", "lance", "ladder", "italia", "unnecessary", "dramatically", "liberia", "sherman", "cork", "maximize", "hansen", "senators", "workout", "mali", "yugoslavia", "bleeding", "characterization", "colon", "likelihood", "lanes", "purse", "fundamentals", "contamination", "mtv", "endangered", "compromise", "masturbation", "optimize", "stating", "dome", "caroline", "leu", "expiration", "namespace", "align", "peripheral", "bless", "engaging", "negotiation", "crest", "opponents", "triumph", "nominated", "confidentiality", "electoral", "changelog", "welding", "deferred", "alternatively", "heel", "alloy", "condos", "plots", "polished", "yang", "gently", "greensboro", "tulsa", "locking", "casey", "controversial", "draws", "fridge", "blanket", "bloom", "simpsons", "lou", "elliott", "recovered", "fraser", "justify", "upgrading", "blades", "pgp", "loops", "surge", "frontpage", "trauma", "tahoe", "advert", "possess", "demanding", "defensive", "sip", "flashers", "subaru", "forbidden", "vanilla", "programmers", "monitored", "installations", "deutschland", "picnic", "souls", "arrivals", "spank", "practitioner", "motivated", "dumb", "smithsonian", "hollow", "vault", "securely", "examining", "fioricet", "groove", "revelation", "pursuit", "delegation", "wires", "dictionaries", "mails", "backing", "greenhouse", "sleeps", "blake", "transparency", "dee", "travis", "endless", "figured", "orbit", "currencies", "niger", "bacon", "survivors", "positioning", "heater", "colony", "cannon", "circus", "promoted", "forbes", "mae", "moldova", "mel", "descending", "paxil", "spine", "trout", "enclosed", "feat", "temporarily", "ntsc", "cooked", "thriller", "transmit", "apnic", "fatty", "gerald", "pressed", "frequencies", "scanned", "reflections", "hunger", "mariah", "sic", "municipality", "usps", "joyce", "detective", "surgeon", "cement", "experiencing", "fireplace", "endorsement", "planners", "disputes", "textiles", "missile", "intranet", "closes", "seq", "psychiatry", "persistent", "deborah", "conf", "marco", "assists", "summaries", "glow", "gabriel", "auditor", "wma", "aquarium", "violin", "prophet", "cir", "bracket", "looksmart", "isaac", "oxide", "oaks", "magnificent", "erik", "colleague", "naples", "promptly", "modems", "adaptation", "harmful", "paintball", "prozac", "sexually", "enclosure", "acm", "dividend", "newark", "paso", "glucose", "phantom", "norm", "playback", "supervisors", "westminster", "turtle", "ips", "distances", "absorption", "treasures", "dsc", "warned", "neural", "ware", "fossil", "mia", "hometown", "badly", "transcripts", "apollo", "wan", "disappointed", "persian", "continually", "communist", "collectible", "handmade", "greene", "entrepreneurs", "robots", "grenada", "creations", "jade", "scoop", "acquisitions", "foul", "keno", "gtk", "earning", "mailman", "sanyo", "nested", "biodiversity", "excitement", "somalia", "movers", "verbal", "blink", "presently", "seas", "carlo", "workflow", "mysterious", "novelty", "bryant", "tiles", "voyuer", "librarian", "subsidiaries", "switched", "stockholm", "tamil", "garmin", "pose", "fuzzy", "indonesian", "grams", "therapist", "richards", "mrna", "budgets", "toolkit", "promising", "relaxation", "goat", "render", "carmen", "ira", "sen", "thereafter", "hardwood", "erotica", "temporal", "sail", "forge", "commissioners", "dense", "dts", "brave", "forwarding", "awful", "nightmare", "airplane", "reductions", "southampton", "istanbul", "impose", "organisms", "sega", "telescope", "viewers", "asbestos", "portsmouth", "cdna", "meyer", "enters", "pod", "savage", "advancement", "harassment", "willow", "resumes", "bolt", "gage", "throwing", "existed", "generators", "wagon", "barbie", "dat", "soa", "knock", "urge", "smtp", "generates", "potatoes", "thorough", "replication", "inexpensive", "kurt", "receptors", "peers", "roland", "optimum", "neon", "interventions", "quilt", "huntington", "creature", "ours", "mounts", "syracuse", "internship", "lone", "refresh", "aluminium", "snowboard", "beastality", "webcast", "michel", "evanescence", "subtle", "coordinated", "notre", "shipments", "maldives", "stripes", "firmware", "antarctica", "cope", "shepherd", "canberra", "cradle", "chancellor", "mambo", "lime", "kirk", "flour", "controversy", "legendary", "bool", "sympathy", "choir", "avoiding", "beautifully", "blond", "expects", "cho", "jumping", "fabrics", "antibodies", "polymer", "hygiene", "wit", "poultry", "virtue", "burst", "examinations", "surgeons", "bouquet", "immunology", "promotes", "mandate", "wiley", "departmental", "bbs", "spas", "ind", "corpus", "johnston", "terminology", "gentleman", "fibre", "reproduce", "convicted", "shades", "jets", "indices", "roommates", "adware", "qui", "intl", "threatening", "spokesman", "zoloft", "activists", "frankfurt", "prisoner", "daisy", "halifax", "encourages", "ultram", "cursor", "assembled", "earliest", "donated", "stuffed", "restructuring", "insects", "terminals", "crude", "morrison", "maiden", "simulations", "sufficiently", "examines", "viking", "myrtle", "bored", "cleanup", "yarn", "knit", "conditional", "mug", "crossword", "bother", "budapest", "conceptual", "knitting", "attacked", "bhutan", "liechtenstein", "mating", "compute", "redhead", "arrives", "translator", "automobiles", "tractor", "allah", "continent", "unwrap", "fares", "longitude", "resist", "challenged", "telecharger", "hoped", "pike", "safer", "insertion", "instrumentation", "ids", "hugo", "wagner", "constraint", "groundwater", "touched", "strengthening", "cologne", "gzip", "wishing", "ranger", "smallest", "insulation", "newman", "marsh", "ricky", "ctrl", "scared", "theta", "infringement", "bent", "laos", "subjective", "monsters", "asylum", "lightbox", "robbie", "stake", "cocktail", "outlets", "swaziland", "varieties", "arbor", "mediawiki", "configurations", "poison"];
            })();
          })
        ),
        /***/
        2175: (
          /***/
          (() => {
            Smart("smart-gauge", class extends Smart.Tank {
              static get properties() {
                return { analogDisplayType: { value: "needle", allowedValues: ["needle", "fill", "line"], type: "string" }, animationDuration: { value: 300, type: "number" }, digitalDisplay: { value: !1, type: "boolean" }, digitalDisplayPosition: { value: "bottom", allowedValues: ["top", "bottom", "right", "left", "center"], type: "string" }, drawNeedle: { value: null, type: "function?" }, endAngle: { value: 210, type: "number" }, needlePosition: { value: "center", allowedValues: ["center", "edge"], type: "string" }, ranges: { value: [], type: "array" }, scalePosition: { value: "inside", allowedValues: ["outside", "inside", "none"], type: "string" }, showRanges: { value: !1, type: "boolean" }, sizeMode: { value: "circle", allowedValues: ["circle", "auto", "none"], type: "string" }, startAngle: { value: -30, type: "number" } };
              }
              static get listeners() {
                return { down: "_downHandler", resize: "_resizeHandler", styleChanged: "_styleChangedHandler", "document.move": "_documentMoveHandler", "document.up": "_documentUpHandler", "document.selectstart": "_selectStartHandler", keydown: "_keydownHandler", move: "_trackMoveHandler" };
              }
              static get requires() {
                return { "Smart.Utilities.Draw": "smart.draw.js", "Smart.NumericTextBox": "smart.numerictextbox.js" };
              }
              static get styleUrls() {
                return ["smart.numerictextbox.css", "smart.gauge.css"];
              }
              template() {
                return `<div id="container" role="presentation">
                <div id="svgContainer" class="smart-svg-container" role="presentation" aria-hidden="true"></div>
                <div class="smart-digital-display-container" role="presentation">
                    <smart-numeric-text-box id="digitalDisplay"
                                            class="smart-digital-display"
                                            decimal-separator="[[decimalSeparator]]"
                                            max="[[max]]"
                                            min="[[min]]"
                                            name="[[name]]"
                                            placeholder="Digital display"
                                            readonly
                                            right-to-left="[[rightToLeft]]"
                                            input-format="[[scaleType]]"
                                            scientific-notation="[[scientificNotation]]"
                                            show-unit="[[showUnit]]"
                                            unit="[[unit]]"
                                            unfocusable
                                            validation="interaction"
                                            word-length="[[wordLength]]"
                                            role="tooltip">
                    </smart-numeric-text-box>
                </div>
            </div>`;
              }
              attached() {
                const t = this;
                super.attached(), t.isCompleted && (t._trackListener && (t._trackListener = new Smart.Utilities.InputEvents(t._track), t._trackListener.down((function(e) {
                  t._SVGElementDownHandler(e);
                }))), t._fillListener && (t._fillListener = new Smart.Utilities.InputEvents(t._fill), t._fillListener.down((function(e) {
                  t._SVGElementDownHandler(e);
                }))), t._lineListener && (t._lineListener = new Smart.Utilities.InputEvents(t._line), t._lineListener.down((function(e) {
                  t._SVGElementDownHandler(e);
                }))));
              }
              detached() {
                super.detached(), this._unlisten();
              }
              ready() {
                super.ready();
              }
              getOptimalSize() {
                const t = this;
                return t._renderingSuspended ? { width: 0, height: 0 } : t.sizeMode !== "auto" ? { width: t.offsetWidth, height: t._updateSize(!0) } : { width: t.offsetWidth, height: t.offsetHeight };
              }
              val(t) {
                const e = this;
                if (t === void 0) return e._getEventValue();
                if (e.mode === "date" && (t = (t = Smart.Utilities.DateTime.validateDate(t)).getTimeStamp()), e._numericProcessor.compare(t, e.value)) {
                  const i = e.value;
                  if (e._validateValue(t, e.value), !e._isVisible() || e._renderingSuspended) return void (e._renderingSuspended = !0);
                  e._animate(i);
                }
              }
              _createElement() {
                const t = this;
                t.$.digitalDisplay.id || (t.$.digitalDisplay.id = t.id + "DigitalDisplay"), t.setAttribute("aria-describedby", t.$.digitalDisplay.id), t.mode === "numeric" ? t._getEventValue = function() {
                  return t.value;
                } : (t._handleDateScale(), t.digitalDisplay = !1), t._numericProcessor = new Smart.Utilities.NumericProcessor(t, "scaleType"), t._numberRenderer = new Smart.Utilities.NumberRenderer(), t._draw = new Smart.Utilities.Draw(t.$.svgContainer), t._isVisible() ? (t._renderingSuspended = !1, t._setSettingsObject(), t._wordLengthNumber = t._numericProcessor.getWordLength(t.wordLength), t._measurements = {}, t._validateInitialPropertyValues(), t._getMeasurements(), t._setDrawVariables(), t._getRange(), t._numericProcessor.getAngleRangeCoefficient(), t.mode !== "numeric" && t.coerce ? t._coerceInitialDateValue = !0 : t._validateValue(), t._initTickIntervalHandler(), t._renderAnalogItems(), delete t._preventResizeHandler, t._setFocusable(), t._setUpdatePointerMethod()) : t._renderingSuspended = !0;
              }
              propertyChangedHandler(t, e, i) {
                function a(r, s, o, l) {
                  const c = r && s ? "both" : t;
                  n._validateMinMax(c, !1, e), t !== "logarithmicScale" && t !== "scaleType" && (t !== "wordLength" && n[t] === e || t === "wordLength" && n.min === o && n.max === l) || (n._setDrawVariables(), n._getRange(), n._numericProcessor.getAngleRangeCoefficient(), n._initTickIntervalHandler(), n._renderAnalogItems(), n._validateValue(n.value, n.value), n._updatePointer());
                }
                const n = this;
                if (n._isVisible() && !n._renderingSuspended) switch (t) {
                  case "analogDisplayType":
                    delete n._customSVGElements, n._getMeasurements(), i === "needle" && n.digitalDisplayPosition === "center" ? n.digitalDisplayPosition = "bottom" : e === "needle" && n.digitalDisplayPosition === "bottom" && (n.digitalDisplayPosition = "center"), n._renderAnalogItems(), n._setUpdatePointerMethod();
                    break;
                  case "coerce":
                    if (i) {
                      const r = n.value;
                      n._validateValue(r), n._updatePointer(), n._valueBeforeCoercion = r;
                    } else n._valueBeforeCoercion !== void 0 && (n._validateValue(n._valueBeforeCoercion), n._updatePointer());
                    break;
                  case "customInterval":
                    i ? (n._customTicks && (n.customTicks = n._customTicks), n._numericProcessor.validateCustomTicks()) : n.mode === "date" && (n._customTicks = n.customTicks), n._initTickIntervalHandler(), n._renderAnalogItems(), n._coerceCustomInterval();
                    break;
                  case "customTicks":
                    if (n.mode === "date" && !n.customInterval) return n._customTicks = i, void (n.customTicks = e);
                    n._numericProcessor.validateCustomTicks(), n.customInterval && (n._initTickIntervalHandler(), n._renderAnalogItems(), n._coerceCustomInterval());
                    break;
                  case "dateLabelFormatString":
                  case "showUnit":
                  case "unit":
                    n._initTickIntervalHandler(), n._renderAnalogItems();
                    break;
                  case "decimalSeparator":
                  case "scientificNotation":
                    if (n.mode === "date") return;
                    n._initTickIntervalHandler(), n._renderAnalogItems();
                    break;
                  case "digitalDisplay":
                  case "digitalDisplayPosition":
                    if (n.mode === "date") return void (t === "digitalDisplay" && (n.digitalDisplay = !1));
                    n._updateSize();
                    break;
                  case "mechanicalAction":
                  case "messages":
                    break;
                  case "disabled":
                  case "readonly":
                  case "unfocusable":
                    super.propertyChangedHandler(t, e, i);
                    break;
                  case "drawNeedle":
                    if (n.analogDisplayType !== "needle") return;
                    e === null && n._draw.removeElement(n._needle), i !== null ? n._updatePointer() : (n._renderAnalogItems(), delete n._customSVGElements);
                    break;
                  case "endAngle":
                  case "startAngle":
                    n._validateAngles(), n._numericProcessor.getAngleRangeCoefficient(), n._renderAnalogItems();
                    break;
                  case "interval":
                    n._numericProcessor.validateInterval(n.interval), n._validateValue(), n._updatePointer();
                    break;
                  case "inverted":
                  case "labelFormatFunction":
                  case "rightToLeft":
                  case "showRanges":
                    n._renderAnalogItems();
                    break;
                  case "labelsVisibility":
                    if (e === "all" && i === "endPoints" || e === "endPoints" && i === "all") return;
                    n._getMeasurements(), n._renderAnalogItems();
                    break;
                  case "logarithmicScale":
                    if (n.mode === "date") return void (n.logarithmicScale = !1);
                    n._initTickIntervalHandler(), a(!0, !0);
                    break;
                  case "max":
                  case "min":
                    n.mode === "date" && (delete n._dateInterval, n[t] = Smart.Utilities.DateTime.validateDate(i).getTimeStamp()), a(t === "min", t === "max");
                    break;
                  case "mode":
                    n.mode = e;
                    break;
                  case "needlePosition":
                    n.analogDisplayType === "needle" && n._updatePointer();
                    break;
                  case "precisionDigits":
                  case "significantDigits":
                    if (n.mode === "date") return;
                    t === "precisionDigits" && n.scaleType === "integer" && n.error(n.localize("noInteger", { elementType: n.nodeName.toLowerCase(), property: t })), t === "significantDigits" && n.precisionDigits !== null ? n.precisionDigits = null : t === "precisionDigits" && n.significantDigits !== null && (n.significantDigits = null), i !== null && (n.$.digitalDisplay.precisionDigits = n.precisionDigits, n.$.digitalDisplay.significantDigits = n.significantDigits), n._initTickIntervalHandler(), n._renderAnalogItems();
                    break;
                  case "ranges":
                    if (!n.showRanges) return;
                    n._renderAnalogItems();
                    break;
                  case "scaleType":
                    if (n.mode === "date") return void (n.scaleType = "integer");
                    n._numericProcessor = new Smart.Utilities.NumericProcessor(n, "scaleType"), a(!0, !0);
                    break;
                  case "scalePosition":
                  case "ticksPosition":
                    n._getMeasurements(), n._renderAnalogItems();
                    break;
                  case "sizeMode":
                    if (i === "none") return;
                    n._preventResizeHandler = !0, i === "circle" ? (n.$.container.removeAttribute("style"), n.style.height = n.offsetWidth + "px", n._measurements.cachedHeight = n.offsetHeight) : i === "auto" && (n.$.container.style.height = n.offsetWidth + "px", n._updateSize());
                    break;
                  case "theme":
                    super.propertyChangedHandler(t, e, i), n._getMeasurements(), n._renderAnalogItems();
                    break;
                  case "ticksVisibility":
                    if (e === "minor" && i === "major" || e === "major" && i === "minor") return;
                    n._getMeasurements(), n._renderAnalogItems();
                    break;
                  case "validation":
                    i === "strict" && n._validateValue(n.value, n.value);
                    break;
                  case "value": {
                    n.mode === "date" && (i = (i = Smart.Utilities.DateTime.validateDate(i)).getTimeStamp()), n._validateValue(i, e);
                    const r = i.toString();
                    n.value.toString() === r && (n._drawValue = n.logarithmicScale ? Math.log10(r).toString() : r), n._animate(e);
                    break;
                  }
                  case "wordLength":
                    if (n.mode === "date") return void (n.wordLength = "uint64");
                    n._wordLengthNumber = n._numericProcessor.getWordLength(n.wordLength), n.scaleType === "integer" && a(!0, !0, n.min, n.max);
                    break;
                  default:
                    super.propertyChangedHandler(t, e, i);
                }
                else n._renderingSuspended = !0;
              }
              _addAnalogDisplay() {
                const t = this, e = t._measurements, i = e.radius, a = t._draw;
                if (t.analogDisplayType === "needle") {
                  t._drawNeedle(!1);
                  const n = (e.needleWidth + 5) / 2;
                  t._centralCircle = a.circle(i, i, n, { class: "smart-needle-central-circle" }), t._minCoordinates.push(i - n), t._maxCoordinates.push(i + n);
                } else {
                  const n = i - t._distance.trackDistance - e.trackBorderWidth / 2 - 1;
                  t._track = a.pieslice(i, i, n - e.trackWidth, n, t.startAngle, t.endAngle, 0, { class: "smart-track" }), t._trackListener = new Smart.Utilities.InputEvents(t._track), t._trackListener.down((function(r) {
                    t._SVGElementDownHandler(r);
                  }));
                }
              }
              _calculateTickAndLabelDistance() {
                const t = this, e = t._measurements;
                if (t.scalePosition === "none") return t._plotLabels = !1, t._plotTicks = !1, e.innerRadius = e.radius, { majorTickDistance: 0, minorTickDistance: 0, labelDistance: 0, needleDistance: 0, trackDistance: 0 };
                const i = t._tickIntervalHandler.labelsSize, a = t._largestLabelSize || Math.max(i.minLabelSize, i.minLabelOtherSize, i.maxLabelSize, i.maxLabelOtherSize);
                let n, r, s, o = 1, l = 0;
                return t._largestLabelSize = a, t.scalePosition === "outside" && (o = a, n = o + e.majorTickSize - e.minorTickSize, r = 0), t.analogDisplayType === "needle" ? (s = t.scalePosition === "outside" ? o + e.majorTickSize : o + e.majorTickSize + a, t.ticksVisibility === "none" && (r = 0, s -= e.majorTickSize), t.labelsVisibility === "none" && (s -= a, t.scalePosition === "outside" && (o -= a, n -= a))) : t.labelsVisibility === "none" && t.ticksVisibility === "none" ? l = 0 : t.scalePosition === "outside" ? t.ticksPosition === "scale" ? (t.labelsVisibility === "none" && (o = 1, n = 1 + e.majorTickSize - e.minorTickSize), l = t.ticksVisibility !== "none" ? o + e.majorTickSize + 2 : a) : t.labelsVisibility !== "none" ? (n -= (e.trackWidth + e.trackBorderWidth) / 4, l = o - 1) : (o = 1, n = (e.trackWidth + e.trackBorderWidth) / 4 + 1, l = 0) : t.ticksPosition === "scale" ? (o = e.trackWidth + 1.5 * e.trackBorderWidth + 2, t.ticksVisibility === "none" && (r = o)) : n = (e.trackWidth + e.trackBorderWidth) / 4 + 1, n === void 0 && (n = o), r === void 0 && (r = o + e.majorTickSize), e.innerRadius = e.radius - r, delete t._plotLabels, delete t._plotTicks, delete t._equalToHalfRadius, t.scalePosition === "inside" ? e.innerRadius < a && (t._plotLabels = !1, t.ticksPosition === "scale" ? t.analogDisplayType !== "needle" && e.innerRadius < e.majorTickSize && (t._plotTicks = !1) : (t._equalToHalfRadius = !0, e.innerRadius = e.radius / 2)) : e.radius - l - e.trackBorderWidth < e.trackWidth && (e.trackWidth = e.radius - l - e.trackBorderWidth, e.lineSize = e.trackWidth + e.trackBorderWidth, t.ticksPosition === "track" && (e.majorTickSize = e.lineSize, e.minorTickSize = e.majorTickSize / 2, n = o + (e.majorTickSize - e.minorTickSize) / 2)), { majorTickDistance: o, minorTickDistance: n, labelDistance: r, needleDistance: s, trackDistance: l };
              }
              _calculateTickInterval() {
                const t = this, e = t._tickIntervalHandler.getInterval("radial", t._drawMin, t._drawMax, t.$.container, t.logarithmicScale);
                e.major !== t._majorTicksInterval ? (t._intervalHasChanged = !0, t._majorTicksInterval = e.major) : t._intervalHasChanged = !0, t._minorTicksInterval = e.minor, t.mode === "date" && t._calculateDateInterval(e.major);
              }
              _computeNeedlePointsCenter(t, e) {
                const i = this, a = i._measurements, n = a.innerRadius, r = a.radius, s = Math.sin(e), o = Math.cos(e);
                let l;
                return l = i.scalePosition === "inside" ? 0.9 * (n - i._largestLabelSize) : 0.9 * (n - i._distance.needleDistance), "M " + (r + t * o) + "," + (r - t * s) + " L " + (r - t * o) + "," + (r + t * s) + " L " + (r + l * s) + "," + (r + l * o) + " Z";
              }
              _computeNeedlePointsEdge(t, e, i) {
                const a = this._measurements.radius, n = a - this._distance.needleDistance, r = n - i, s = Math.sin(e), o = Math.cos(e), l = a + r * s, c = a + r * o;
                return "M " + (l + t * o) + "," + (c - t * s) + " L " + (l - t * o) + "," + (c + t * s) + " L " + (a + n * s) + "," + (a + n * o) + " Z";
              }
              _documentMoveHandler(t) {
                if (!this._dragging) return;
                const e = this, i = e._getAngleByCoordinate(t.pageX, t.pageY), a = e._getQuadrant(i), n = e._getRotationDirection();
                if (e._normalizedStartAngle === e.endAngle) {
                  let s;
                  !e.inverted && !e.rightToLeft || e.rightToLeft && e.inverted ? e._lockCW && n === "ccw" ? (s = e.endAngle, e._unlockRotation("_lockCW", i, a, s, { firstCondition: i > s, secondCondition: i < s })) : e._lockCCW && n === "cw" && (s = e._normalizedStartAngle, e._unlockRotation("_lockCCW", i, a, s, { firstCondition: i < s, secondCondition: i > s })) : e._lockCW && n === "cw" ? (s = e._normalizedStartAngle, e._unlockRotation("_lockCW", i, a, s, { firstCondition: i < s, secondCondition: i > s })) : e._lockCCW && n === "ccw" && (s = e.endAngle, e._unlockRotation("_lockCCW", i, a, s, { firstCondition: i > s, secondCondition: i < s }));
                } else e._lockCW && n === "ccw" && !e._outsideRange && e._numericProcessor._getAngleDifference(i, e._normalizedStartAngle) < 10 ? e._lockCW = !1 : e._lockCCW && n === "cw" && !e._outsideRange && e._numericProcessor._getAngleDifference(i, e.endAngle) < 10 && (e._lockCCW = !1);
                if (e._angle = i, e._quadrant = a, t.originalEvent && (t.originalEvent.stopPropagation(), t.originalEvent.preventDefault()), e._lockCW || e._lockCCW) return;
                let r = e._numericProcessor.getValueByAngle(i);
                if (e._normalizedStartAngle === e.endAngle) {
                  const s = e._numericProcessor.lockRotation(n === "cw" && !e.inverted && !e.rightToLeft || e.rightToLeft && e.inverted || n === "ccw" && (e.inverted || e.rightToLeft && !e.inverted), r);
                  s !== void 0 && (r = s);
                } else n === "ccw" && e._outsideEnd ? e._lockCCW = !0 : n === "cw" && e._outsideStart && (e._lockCW = !0);
                r !== void 0 && e._numericProcessor.compare(r, e.value) && (cancelAnimationFrame(e._animationFrameId), e._updatePointer(r), e.mechanicalAction !== "switchWhenReleased" ? e._numericProcessor.updateGaugeValue(r) : e._valueAtMoveEnd = r);
              }
              _documentUpHandler() {
                const t = this;
                if (t._dragging && (t._lockCW = !1, t._lockCCW = !1, t._dragging = !1, t.removeAttribute("dragged"), t.mechanicalAction !== "switchWhileDragging")) {
                  const e = t.mechanicalAction === "switchUntilReleased" ? t._valueAtDragStart : t._valueAtMoveEnd;
                  t._numericProcessor.compare(e, t.value) && (t.mechanicalAction === "switchUntilReleased" && t._animate(t.value, e), t._numericProcessor.updateGaugeValue(e));
                }
              }
              _downHandler(t, e) {
                const i = this, a = i.enableShadowDOM || i.isInShadowDOM ? t.originalEvent.composedPath()[0] : t.originalEvent.target;
                if (i.analogDisplayType !== "needle" && !e || i.disabled || i.readonly || i.$.digitalDisplay.contains(a) || !Smart.Utilities.Core.isMobile && ("buttons" in t && t.buttons !== 1 || t.which !== 1)) return void t.stopPropagation();
                const n = t.pageX, r = t.pageY;
                if (i._measurements.center = i._getCenterCoordinates(), i.analogDisplayType === "needle" && Math.sqrt(Math.pow(i._measurements.center.x - n, 2) + Math.pow(i._measurements.center.y - r, 2)) > i._measurements.radius) return void t.stopPropagation();
                i.mechanicalAction === "switchUntilReleased" && (i._valueAtDragStart = i.value), i._angle = i._getAngleByCoordinate(n, r), i._quadrant = i._getQuadrant(i._angle);
                const s = i._numericProcessor.getValueByAngle(i._angle);
                s !== void 0 && i._numericProcessor.compare(s, i.value) && (i._animate(i.value, s), i.mechanicalAction !== "switchWhenReleased" ? i._numericProcessor.updateGaugeValue(s) : i._valueAtMoveEnd = s), i._dragging = !0, i.setAttribute("dragged", "");
              }
              _animate(t, e) {
                const i = this, a = i.logarithmicScale, n = Math.max(1, Math.round(i.animationDuration / 15));
                if (cancelAnimationFrame(i._animationFrameId), !i.hasAnimation || n === 1) return void i._updatePointer(e);
                const r = i._numericProcessor;
                let s, o, l, c, m = 1;
                e === void 0 && (e = i.value), t = parseFloat(r.validate(r.createDescriptor(t), i._minObject, i._maxObject)), e = parseFloat(r.validate(r.createDescriptor(e), i._minObject, i._maxObject)), a ? (l = Math.log10(t), c = Math.log10(e)) : (l = t, c = e);
                const u = Math.abs(c - l);
                function p() {
                  s = o(), a && (s = Math.pow(10, s));
                }
                o = e > t ? function() {
                  return Math.min(Smart.Utilities.Animation.Easings.easeInOutSine(m, l, u, n), c);
                } : function() {
                  return Math.max(2 * l - Smart.Utilities.Animation.Easings.easeInOutSine(m, l, u, n), c);
                }, p(), i._animationFrameId = requestAnimationFrame((function h() {
                  if (m++, m === n) return s = e, void i._updatePointer(s);
                  i._updatePointer(s), p(), i._animationFrameId = requestAnimationFrame(h);
                }));
              }
              _drawFill(t, e) {
                const i = this;
                if (i.analogDisplayType === "needle") return;
                e === void 0 && (e = i._number);
                const a = i._measurements, n = a.radius, r = n - i._distance.trackDistance - a.trackBorderWidth / 2 - 1;
                if (i.analogDisplayType === "fill") {
                  const s = i._numericProcessor.getAngleByValue(e, !0, !0);
                  let o, l;
                  !i.inverted && !i.rightToLeft || i.rightToLeft && i.inverted ? (o = s, l = i.endAngle) : (o = i.startAngle, l = s), t ? i._fill.setAttribute("d", i._draw.pieSlicePath(n, n, r - a.trackWidth, r, o, l, 0)) : (i._fill = i._draw.pieslice(n, n, r - a.trackWidth, r, o, l, 0, { class: "smart-value" }), i._fillListener = new Smart.Utilities.InputEvents(i._fill), i._fillListener.down((function(c) {
                    i._SVGElementDownHandler(c);
                  })));
                } else {
                  const s = r + a.trackBorderWidth / 2, o = s - a.lineSize, l = i._numericProcessor.getAngleByValue(e), c = Math.sin(l), m = Math.cos(l), u = n + s * c, p = n + s * m, h = n + o * c, g = n + o * m;
                  t ? (i._line.setAttribute("x1", u), i._line.setAttribute("y1", p), i._line.setAttribute("x2", h), i._line.setAttribute("y2", g)) : (i._line = i._draw.line(u, p, h, g, { class: "smart-line" }), i._lineListener = new Smart.Utilities.InputEvents(i._line), i._lineListener.down((function(f) {
                    i._SVGElementDownHandler(f);
                  })));
                }
              }
              _drawLabel(t, e, i, a) {
                const n = this, r = n._measurements, s = r.radius, o = { class: "smart-label" + (a !== !1 ? " smart-label-middle" : ""), "font-size": r.fontSize, "font-family": r.fontFamily, "font-weight": r.fontWeight, "font-style": r.fontStyle };
                e = n._formatLabel(e.toString(), !1);
                const l = n._draw.measureText(e, 0, o), c = s - i - n._largestLabelSize / 2, m = Math.round(s + c * Math.sin(t)) - l.width / 2, u = Math.round(s + c * Math.cos(t)) - l.height / 2, p = n._draw.text(e, m, u, l.width, l.height, 0, o);
                n._minCoordinates.push(u), n._maxCoordinates.push(u + p.getBBox().height);
              }
              _drawNeedle(t, e) {
                const i = this, a = i._measurements;
                e === void 0 && (e = i._number);
                const n = i._numericProcessor.getAngleByValue(e);
                if (i.drawNeedle) {
                  if (i._customSVGElements = i.drawNeedle(i, i._draw, a.radius, n, i._distance.needleDistance), i._customSVGElements) {
                    const r = i._customSVGElements[0].parentElement || i._customSVGElements[0].parentNode;
                    for (let s = 0; s < i._customSVGElements.length; s++) r.insertBefore(i._customSVGElements[s], i._centralCircle);
                  }
                } else {
                  let r;
                  r = i.needlePosition === "center" ? i._computeNeedlePointsCenter(a.needleWidth / 2, n) : i._computeNeedlePointsEdge(a.needleWidth / 2, n, a.needleLength), t ? i._needle.setAttribute("d", r) : i._needle = i._draw.path(r, { class: "smart-needle" });
                }
              }
              _drawRanges() {
                const t = this, e = t._numericProcessor, i = t.ranges;
                if (!t.showRanges || i.length === 0) return;
                const a = t._measurements, n = a.radius;
                let r, s, o, l;
                t.analogDisplayType === "needle" ? (s = a.rangeSize, t.scalePosition === "inside" ? r = n - 1 : (r = n - t._distance.needleDistance - 2, t.labelsVisibility === "none" && t.ticksVisibility === "none" && (r += 1))) : (r = n - t._distance.trackDistance - a.trackBorderWidth / 2 - 1, s = a.trackWidth), !t.inverted && !t.rightToLeft || t.rightToLeft && t.inverted ? (o = "startValue", l = "endValue") : (o = "endValue", l = "startValue");
                for (let c = 0; c < i.length; c += 1) {
                  let m = i[c], u = e.validateColorRange(m[o]), p = e.validateColorRange(m[l]);
                  const h = t._draw.pieslice(n, n, r - s, r, e.getAngleByValue(p, !0, !0), e.getAngleByValue(u, !0, !0), 0, { class: "smart-range " + m.className });
                  t._ranges.push(h);
                }
              }
              _drawTick(t, e, i) {
                const a = this, n = a._measurements, r = n.radius;
                let s, o = "smart-tick";
                i === "major" ? s = n.majorTickSize : (s = n.minorTickSize, o += " smart-tick-minor");
                const l = e - s, c = r + e * Math.sin(t), m = r + e * Math.cos(t), u = r + l * Math.sin(t), p = r + l * Math.cos(t);
                a._draw.line(c, m, u, p, { class: o }), a._minCoordinates.push(Math.min(m, p)), a._maxCoordinates.push(Math.max(m, p));
              }
              _getAngleByCoordinate(t, e) {
                const i = this, a = i._measurements.center;
                let n = -1 * Math.atan2(e - a.y, t - a.x) * 180 / Math.PI;
                return n < 0 && (n += 360), i._actualAngle = n, i._normalizedStartAngle === i.endAngle || (function(r, s, o) {
                  for (; s < r; ) s += 360;
                  for (; o < r; ) o += 360;
                  return o >= r && o <= s;
                })(i._normalizedStartAngle, i.endAngle, n) ? (i._outsideRange = !1, i._outsideStart = !1, i._outsideEnd = !1) : (i._numericProcessor._getAngleDifference(n, i._normalizedStartAngle) <= i._numericProcessor._getAngleDifference(n, i.endAngle) ? (n = i._normalizedStartAngle, i._outsideStart = !0, i._outsideEnd = !1) : (n = i.endAngle, i._outsideEnd = !0, i._outsideStart = !1), i._outsideRange = !0), n;
              }
              _getCenterCoordinates() {
                const t = this.$.container.getBoundingClientRect(), e = this._measurements.radius, i = document.body.scrollLeft || document.documentElement.scrollLeft, a = document.body.scrollTop || document.documentElement.scrollTop;
                return { x: t.left + i + e, y: t.top + a + e };
              }
              _getInlineColors() {
                const t = this;
                let e = "", i = "", a = "";
                return t._track && (e = t._track.style.fill), t._fill && (i = t._fill.style.fill), t._line && (a = t._line.style.stroke), [e, i, a];
              }
              _getMeasurements() {
                const t = this;
                if (!t._isVisible() || t._renderingSuspended) return void (t._renderingSuspended = !0);
                const e = t._measurements;
                e.cachedWidth = t.offsetWidth, e.cachedHeight = t.offsetHeight, e.radius = e.cachedWidth / 2;
                const i = document.createElement("div");
                t.shadowRoot ? t.shadowRoot.appendChild(i) : t.appendChild(i), i.className = "smart-tick", e.majorTickSize = i.offsetWidth, i.className += " smart-tick-minor", e.minorTickSize = i.offsetWidth, i.className = "smart-label";
                const a = window.getComputedStyle(i);
                e.fontSize = a.fontSize, e.fontFamily = a.fontFamily, e.fontWeight = a.fontWeight, e.fontStyle = a.fontStyle, e.trackWidth = 0, e.trackBorderWidth = 0, t.analogDisplayType === "needle" ? (i.className = "smart-needle", e.needleWidth = i.offsetWidth, e.needleLength = i.offsetHeight, i.className = "smart-range", e.rangeSize = i.offsetWidth) : (i.className = "smart-track", e.trackBorderWidth = parseFloat(a.strokeWidth), e.trackWidth = Math.min(i.offsetWidth, e.radius - e.trackBorderWidth), e.lineSize = e.trackWidth + e.trackBorderWidth, t.ticksPosition === "track" && (e.majorTickSize = e.lineSize, e.minorTickSize = e.majorTickSize / 2)), t.shadowRoot ? t.shadowRoot.removeChild(i) : t.removeChild(i);
              }
              _getQuadrant(t) {
                return t > 270 ? 4 : t > 180 ? 3 : t > 90 ? 2 : 1;
              }
              _getRotationDirection() {
                const t = this, e = t._getQuadrant(t._actualAngle);
                return t._actualAngle < t._angle && (e !== 1 || t._quadrant !== 4) || t._actualAngle > t._angle && e === 4 && t._quadrant === 1 ? "cw" : "ccw";
              }
              _initTickIntervalHandler() {
                const t = this;
                if (!t._isVisible() || t._renderingSuspended) return void (t._renderingSuspended = !0);
                const e = t._formatLabel(t.min, !1), i = t._formatLabel(t.max, !1);
                t._tickIntervalHandler = new Smart.Utilities.TickIntervalHandler(t, e, i, "smart-label", t._settings.size, t.scaleType === "integer", t.logarithmicScale);
              }
              _keydownHandler(t) {
                const e = this, i = e._getEventValue(), a = e._number.toString();
                e.mode === "numeric" ? (e.value.toString() !== a && (e.value = a, e.$.digitalDisplay.value = a), super._keydownHandler(t), e.value.toString() !== i && e.$.fireEvent("change", { value: e.value, oldValue: i })) : (e.value.toString() !== a && (e._valueDate = Smart.Utilities.DateTime.fromFullTimeStamp(a), e.value = e._number), super._keydownHandler(t), e._valueDate.compare(i) !== 0 && e.$.fireEvent("change", { value: e._getEventValue(), oldValue: i })), e._setAriaValue("valuenow");
              }
              _normalizeAngle(t) {
                return (t %= 360) < 0 && (t += 360), t;
              }
              _renderAnalogItems(t) {
                const e = this;
                if (!e._isVisible() || e._renderingSuspended) return void (e._renderingSuspended = !0);
                const i = e._getInlineColors();
                if (e._unlisten(), e._draw.clear(), delete e._needle, delete e._centralCircle, delete e._track, delete e._trackListener, delete e._fill, delete e._fillListener, delete e._line, delete e._lineListener, e._ranges = [], e._minCoordinates = [], e._maxCoordinates = [], t !== !1 && (delete e._largestLabelSize, e._distance = e._calculateTickAndLabelDistance()), e._plotTicks !== !1 || e._plotLabels !== !1) {
                  e._calculateTickInterval();
                  const a = e._cachedLabelsSize, n = Math.max(a.minLabelSize, a.minLabelOtherSize, a.maxLabelSize, a.maxLabelOtherSize);
                  t !== !1 && e._largestLabelSize !== n && (e._largestLabelSize = n, e._distance = e._calculateTickAndLabelDistance(), e._calculateTickInterval());
                }
                e._coerceInitialDateValue && (e._validateValue(), delete e._coerceInitialDateValue), e._drawRanges(), e._addAnalogDisplay(), (e.ticksVisibility !== "none" && e._plotTicks !== !1 || e.labelsVisibility !== "none" && e._plotLabels !== !1) && (e.customInterval || e._dateInterval ? e._numericProcessor.addGaugeCustomTicks() : e._numericProcessor.addGaugeTicksAndLabels()), e._drawFill(!1), e._updateSize(), e._restoreInlineColors(i[0], i[1], i[2]);
              }
              refresh() {
                const t = this;
                if (t._preventResizeHandler) return void delete t._preventResizeHandler;
                if (!t._isVisible()) return void (t._renderingSuspended = !0);
                if (t._renderingSuspended) return void t._createElement();
                const e = t._measurements;
                if (!(t._renderingSuspended || e.cachedWidth === t.offsetWidth && e.cachedHeight === t.offsetHeight)) {
                  if (t.sizeMode === "circle") t.offsetWidth !== t.offsetHeight && (e.cachedWidth !== t.offsetWidth ? (t.style.height = t.offsetWidth + "px", t._preventResizeHandler = !0) : e.cachedHeight !== t.offsetHeight && (t.style.width = t.offsetHeight + "px", t._preventResizeHandler = !0));
                  else if (t.sizeMode === "auto") {
                    if (e.cachedHeight !== t.offsetHeight && e.cachedWidth === t.offsetWidth) return t.style.height = e.cachedHeight + "px", void (t._preventResizeHandler = !0);
                    t.$.container.style.height = t.offsetWidth + "px";
                  }
                  e.cachedWidth = t.offsetWidth, e.cachedHeight = t.offsetHeight, e.radius = e.cachedWidth / 2, t._equalToHalfRadius ? e.innerRadius = e.radius / 2 : e.innerRadius = e.radius - t._distance.labelDistance, t._renderAnalogItems(!1);
                }
              }
              _resizeHandler() {
                this.refresh();
              }
              _restoreInlineColors(t, e, i) {
                const a = this;
                a._track && t !== "" && (a._track.style.fill = t), a._fill && e !== "" && (a._fill.style.fill = e), a._line && i !== "" && (a._line.style.stroke = i);
              }
              _selectStartHandler(t) {
                this._dragging && t.preventDefault();
              }
              _setUpdatePointerMethod() {
                const t = this;
                t.analogDisplayType === "needle" ? t._updatePointer = function(e) {
                  if (t._customSVGElements) for (let i = 0; i < t._customSVGElements.length; i++) t._draw.removeElement(t._customSVGElements[i]);
                  t._drawNeedle(!0, e);
                } : t._updatePointer = function(e) {
                  t._drawFill(!0, e);
                };
              }
              _styleChangedHandler(t) {
                const e = this;
                t.detail.styleProperties && t.detail.styleProperties["min-height"] || (e._isVisible() ? e._renderingSuspended ? e._createElement() : (e._getMeasurements(), e._initTickIntervalHandler(), e._renderAnalogItems()) : e._renderingSuspended = !0);
              }
              _SVGElementDownHandler(t) {
                const e = this, i = e.context;
                e.context = e, e._downHandler(t, !0), e.context = i;
              }
              _unlockRotation(t, e, i, a, n) {
                const r = this, s = n.firstCondition, o = n.secondCondition, l = r._getQuadrant(a);
                (s && (i !== 4 || l !== 1) || o && i === 4 && l === 1) && r._numericProcessor._getAngleDifference(e, a) < 10 && (r[t] = !1);
              }
              _updateSize(t) {
                const e = this;
                if (e.sizeMode !== "auto" && t === void 0) return;
                const i = e._minCoordinates, a = e._maxCoordinates;
                let n = i[0], r = a[0];
                for (let l = 1; l < i.length; l++) n = Math.min(n, i[l]);
                for (let l = 1; l < a.length; l++) r = Math.max(r, a[l]);
                const s = e.getBoundingClientRect();
                if (e.digitalDisplay) {
                  const l = e.$.digitalDisplay.getBoundingClientRect();
                  n = Math.min(n, l.top - s.top), r = Math.max(r, l.bottom - s.top);
                }
                if (e.analogDisplayType !== "needle") {
                  const l = e._track.getBBox();
                  n = Math.min(n, l.y), r = Math.max(r, l.y + l.height);
                }
                for (let l = 0; l < e._ranges.length; l++) {
                  const c = e._ranges[l].getBBox();
                  n = Math.min(n, c.y - s.top), r = Math.max(r, c.y + c.height - s.top);
                }
                n -= 2;
                const o = r - n;
                if (t !== void 0) return Math.round(o);
                e._preventResizeHandler = !0, e.style.height = o + "px", e.$.container.style.marginTop = -1 * n + "px", e._measurements.cachedHeight = o;
              }
              _updateValue(t) {
                this._numericProcessor.updateGaugeValue(t);
              }
              _validate(t, e, i) {
                const a = this, n = a.value;
                a._validateValue(e), !i || i !== 35 && i !== 36 ? a._updatePointer() : a._animate(n);
              }
              _validateAngles() {
                const t = this;
                t._normalizedStartAngle = t._normalizeAngle(t.startAngle), t.endAngle = t._normalizeAngle(t.endAngle), t._normalizedStartAngle < t.endAngle ? t.startAngle = t._normalizedStartAngle : t.startAngle = t._normalizedStartAngle - 360, t._angleDifference = t.endAngle - t.startAngle;
              }
              _validateInitialPropertyValues() {
                super._validateInitialPropertyValues();
                const t = this;
                t.sizeMode === "circle" ? t.offsetWidth < t.offsetHeight ? t.style.height = t.offsetWidth + "px" : t.offsetWidth > t.offsetHeight && (t.style.width = t.offsetHeight + "px") : t.sizeMode === "auto" && (t.offsetHeight !== t.offsetWidth && (t.style.height = t.offsetWidth + "px"), t.$.container.style.height = t.offsetWidth + "px"), t._validateAngles(), t.significantDigits !== null ? t.$.digitalDisplay.significantDigits = t.significantDigits : t.precisionDigits !== null && (t.$.digitalDisplay.precisionDigits = t.precisionDigits);
              }
              _validateValue(t, e) {
                const i = this, a = i._numericProcessor, n = i.logarithmicScale, r = i.validation === "strict";
                let s, o, l, c, m, u = r && e !== void 0;
                t === void 0 ? (u = !1, t = i.value) : t = t.toString(), a.regexScientificNotation.test(t) && (t = a.scientificToDecimal(t)), isNaN(t) && (t = e || 0), i.coerce || r ? (s = a.getCoercedValue(a.createDescriptor(t, !0, !0, !0), !1, n), i._number = s, o = s.toString(), l = o) : (u = !1, s = a.getCoercedValue(a.createDescriptor(t, !0, !0, !1), !1, n), i._number = a.validate(s, a.createDescriptor(i._minObject), a.createDescriptor(i._maxObject)), o = s.toString(), l = i._number.toString()), i.mode === "numeric" ? (c = e, m = o, i.value = o, i.$.digitalDisplay.value = o) : (c = i._valueDate, i._valueDate = Smart.Utilities.DateTime.fromFullTimeStamp(o), m = i._valueDate, i.value = s), i._drawValue = n ? Math.log10(l).toString() : l, u && a.compare(i._number, e) && i.$.fireEvent("change", { value: m, oldValue: c }), i._setAriaValue("valuenow"), delete i._valueBeforeCoercion;
              }
              _unlisten() {
                const t = this;
                t._trackListener && t._trackListener.unlisten(), t._fillListener && t._fillListener.unlisten(), t._lineListener && t._lineListener.unlisten();
              }
            });
          })
        ),
        /***/
        8687: (
          /***/
          (() => {
            (() => {
              let t;
              try {
                t = !0;
              } catch {
                t = !1;
              }
              Smart.Utilities.Assign("BigNumber", class {
                constructor(e, i, a) {
                  var n, r = this;
                  if (Smart.Utilities.BigNumber.bigIntSupport) {
                    if (e instanceof Smart.Utilities.BigNumber) {
                      if (!Array.isArray(e._d)) return new Smart.Utilities.BigNumber(e._d);
                      e = (e._s ? "-" : "") + (e._d.slice(0, e._f).join("") || "0") + (e._f != e._d.length ? "." + e._d.slice(e._f).join("") : "");
                    }
                    try {
                      e === null ? r._d = BigInt(0) : typeof e == "string" && e.toLowerCase().indexOf("e") !== -1 ? r._d = BigInt(parseFloat(e)) : r._d = BigInt(e);
                    } catch {
                      try {
                        const h = e.toString().split(".");
                        let g = BigInt(h[0]), f = parseInt(h[1].charAt(0));
                        if (g >= 0 && f >= 5) g += BigInt(1);
                        else if (g < 0) {
                          if (f > 5) g -= BigInt(1);
                          else if (f === 5) {
                            let b = 1, y = h[1].charAt(b), _ = !1;
                            for (; y !== ""; ) if (b++, y = h[1].charAt(b), y !== "0") {
                              _ = !0;
                              break;
                            }
                            _ && (g -= BigInt(1));
                          }
                        }
                        r._d = g;
                      } catch {
                        r._d = BigInt(0);
                      }
                    }
                    return r._f = r._d.toString().replace("-", "").length, void (r._s = r._d < 0);
                  }
                  if (e instanceof Smart.Utilities.BigNumber) {
                    if (typeof e._d == "bigint") return new Smart.Utilities.BigNumber(e._d.toString());
                    for (n in { precision: 0, roundType: 0, _s: 0, _f: 0 }) r[n] = e[n];
                    return r._d = e._d.slice(), void (e._s && e._d.length === 1 && e._d[0] === 0 && (r._s = !1));
                  }
                  if (e !== void 0 && (e === "-0" && (e = "0"), new RegExp(/e/i).test(e))) {
                    var s = e.toString().toLowerCase(), o = s.indexOf("e"), l = new Smart.Utilities.BigNumber(s.slice(0, o)), c = s.slice(o + 2), m = s.slice(o + 1, o + 2), u = new Smart.Utilities.BigNumber(10).pow(m + c);
                    e = l.multiply(u).toString();
                  }
                  for (r.precision = isNaN(i = Math.abs(i)) ? Smart.Utilities.BigNumber.defaultPrecision : i, r.roundType = isNaN(a = Math.abs(a)) ? Smart.Utilities.BigNumber.defaultRoundType : a, r._s = (e += "").charAt(0) == "-", r._f = ((e = e.replace(/[^\d.]/g, "").split(".", 2))[0] = e[0].replace(/^0+/, "") || "0").length, n = (e = r._d = (e.join("") || "0").split("")).length; n; e[--n] = +e[n]) ;
                  r.round();
                }
                static get defaultPrecision() {
                  return 40;
                }
                static get defaultRoundType() {
                  return 4;
                }
                static get bigIntSupport() {
                  return t && Smart.Utilities.BigNumber.ignoreBigIntNativeSupport !== !0;
                }
                add(e) {
                  if (Smart.Utilities.BigNumber.bigIntSupport) return new Smart.Utilities.BigNumber(this._d + new Smart.Utilities.BigNumber(e)._d);
                  let i = this.normalizeOperand(this);
                  if (e = i.normalizeOperand(e), i.isZero() && i._s && (i._s = !1), e === 0 || e.constructor === Smart.Utilities.BigNumber && e._d.length === 1 && e._d[0] === 0) return new Smart.Utilities.BigNumber(i);
                  if (i._s != (e = new Smart.Utilities.BigNumber(e))._s) return e._s ^= 1, i.subtract(e);
                  var a, n, r = new Smart.Utilities.BigNumber(i), s = r._d, o = e._d, l = r._f, c = e._f;
                  for (e = Math.max(l, c), l != c && ((c = l - c) > 0 ? r._zeroes(o, c, 1) : r._zeroes(s, -c, 1)), a = (l = s.length) == (c = o.length) ? s.length : ((c = l - c) > 0 ? r._zeroes(o, c) : r._zeroes(s, -c)).length, n = 0; a; n = (s[--a] = s[a] + o[a] + n) / 10 >>> 0, s[a] %= 10) ;
                  return n && ++e && s.unshift(n), r._f = e, r.round();
                }
                subtract(e) {
                  if (Smart.Utilities.BigNumber.bigIntSupport) return new Smart.Utilities.BigNumber(this._d - new Smart.Utilities.BigNumber(e)._d);
                  let i = this.normalizeOperand(this);
                  if (e = i.normalizeOperand(e), i.isZero() && i._s && (i._s = !1), e === 0 || e.constructor === Smart.Utilities.BigNumber && e._d.length === 1 && e._d[0] === 0) return new Smart.Utilities.BigNumber(i);
                  if (i._s != (e = new Smart.Utilities.BigNumber(e))._s) return e._s ^= 1, i.add(e);
                  var a, n, r = new Smart.Utilities.BigNumber(i), s = r.abs().compare(e.abs()) + 1, o = s ? r : e, l = s ? e : r, c = o._f, m = l._f, u = c;
                  for (o = o._d, l = l._d, c != m && ((m = c - m) > 0 ? r._zeroes(l, m, 1) : r._zeroes(o, -m, 1)), a = (c = o.length) == (m = l.length) ? o.length : ((m = c - m) > 0 ? r._zeroes(l, m) : r._zeroes(o, -m)).length; a; ) {
                    if (o[--a] < l[a]) {
                      for (n = a; n && !o[--n]; o[n] = 9) ;
                      --o[n], o[a] += 10;
                    }
                    l[a] = o[a] - l[a];
                  }
                  return s || (r._s ^= 1), r._f = u, r._d = l, r.round();
                }
                multiply(e) {
                  if (Smart.Utilities.BigNumber.bigIntSupport) return new Smart.Utilities.BigNumber(this._d * new Smart.Utilities.BigNumber(e)._d);
                  let i = this.normalizeOperand(this);
                  e = i.normalizeOperand(e);
                  var a, n, r, s = new Smart.Utilities.BigNumber(i), o = s._d.length >= (e = new Smart.Utilities.BigNumber(e))._d.length, l = (o ? s : e)._d, c = (o ? e : s)._d, m = l.length, u = c.length, p = new Smart.Utilities.BigNumber();
                  for (a = u; a; o && r.unshift(o), p.set(p.add(new Smart.Utilities.BigNumber(r.join(""))))) for (r = new Array(u - --a).join("0").split(""), o = 0, n = m; n; o += l[--n] * c[a], r.unshift(o % 10), o = o / 10 >>> 0) ;
                  return s._s = s._s != e._s, s._f = ((o = m + u - s._f - e._f) >= (n = (s._d = p._d).length) ? i._zeroes(s._d, o - n + 1, 1).length : n) - o, s.round();
                }
                divide(e) {
                  if (Smart.Utilities.BigNumber.bigIntSupport) return new Smart.Utilities.BigNumber(this._d / new Smart.Utilities.BigNumber(e)._d);
                  let i = this.normalizeOperand(this);
                  if (e = i.normalizeOperand(e), (e = new Smart.Utilities.BigNumber(e)) == "0") throw new Error("Division by 0");
                  if (i == "0") return new Smart.Utilities.BigNumber();
                  var a, n, r, s = new Smart.Utilities.BigNumber(i), o = s._d, l = e._d, c = o.length - s._f, m = l.length - e._f, u = new Smart.Utilities.BigNumber(), p = 0, h = 1, g = 0, f = 0;
                  for (u._s = s._s != e._s, u.precision = Math.max(s.precision, e.precision), u._f = +u._d.pop(), c != m && s._zeroes(c > m ? l : o, Math.abs(c - m)), e._f = l.length, (l = e)._s = !1, l = l.round(), e = new Smart.Utilities.BigNumber(); o[0] == "0"; o.shift()) ;
                  e: do {
                    for (r = g = 0, e == "0" && (e._d = [], e._f = 0); p < o.length && e.compare(l) == -1; ++p) {
                      if (r = p + 1 == o.length, (!h && ++g > 1 || (f = r && e == "0" && o[p] == "0")) && (u._f == u._d.length && ++u._f, u._d.push(0)), o[p] == "0" && e == "0" || (e._d.push(o[p]), ++e._f), f) break e;
                      if (r && e.compare(l) == -1 && (u._f == u._d.length && ++u._f, 1) || (r = 0)) for (; u._d.push(0), e._d.push(0), ++e._f, e.compare(l) == -1; ) ;
                    }
                    if (h = 0, e.compare(l) == -1 && !(r = 0)) for (; r ? u._d.push(0) : r = 1, e._d.push(0), ++e._f, e.compare(l) == -1; ) ;
                    var b;
                    for (n = new Smart.Utilities.BigNumber(), a = 0; e.compare(b = n.add(l)) + 1 && ++a; n.set(b)) ;
                    e.set(e.subtract(n)), !r && u._f == u._d.length && ++u._f, u._d.push(a);
                  } while ((p < o.length || e != "0") && u._d.length - u._f <= u.precision);
                  return u.round();
                }
                mod(e) {
                  if (Smart.Utilities.BigNumber.bigIntSupport) return new Smart.Utilities.BigNumber(this._d % new Smart.Utilities.BigNumber(e)._d);
                  let i = this.normalizeOperand(this);
                  e = i.normalizeOperand(e);
                  var a = i.subtract(i.divide(e).intPart().multiply(e));
                  return a.isZero() && a._s && (a._s = !a._s), a;
                }
                pow(e) {
                  if (Smart.Utilities.BigNumber.bigIntSupport) {
                    let r = BigInt(1);
                    for (let s = BigInt(0); s < new Smart.Utilities.BigNumber(e)._d; s += BigInt(1)) r *= this._d;
                    return new Smart.Utilities.BigNumber(r);
                  }
                  let i = this.normalizeOperand(this);
                  e = i.normalizeOperand(e);
                  var a, n = new Smart.Utilities.BigNumber(i);
                  if ((e = new Smart.Utilities.BigNumber(e).intPart()) == 0) return n.set(1);
                  for (a = Math.abs(e); --a; n.set(n.multiply(i))) ;
                  return e < 0 ? n.set(new Smart.Utilities.BigNumber(1).divide(n)) : n;
                }
                set(e) {
                  return e = new Smart.Utilities.BigNumber(e), this._d = e._d, this._f = e._f, this._s = e._s, this;
                }
                compare(e) {
                  if (Smart.Utilities.BigNumber.bigIntSupport) {
                    const u = new Smart.Utilities.BigNumber(e)._d;
                    return this._d === u ? 0 : this._d > u ? 1 : -1;
                  }
                  let i = this.normalizeOperand(this);
                  e = i.normalizeOperand(e);
                  var a, n, r, s = i, o = i._f, l = new Smart.Utilities.BigNumber(e), c = l._f, m = [-1, 1];
                  if (s.isZero() && l.isZero()) return 0;
                  if (s._s != l._s) return s._s ? -1 : 1;
                  if (o != c) return m[o > c ^ s._s];
                  for (o = (r = s._d).length, c = (l = l._d).length, a = -1, n = Math.min(o, c); ++a < n; ) if (r[a] != l[a]) return m[r[a] > l[a] ^ s._s];
                  return o != c ? m[o > c ^ s._s] : 0;
                }
                negate() {
                  if (Smart.Utilities.BigNumber.bigIntSupport) return new Smart.Utilities.BigNumber(this._d * BigInt(-1));
                  let e = this.normalizeOperand(this);
                  var i = new Smart.Utilities.BigNumber(e);
                  return i._s ^= 1, i;
                }
                abs() {
                  if (Smart.Utilities.BigNumber.bigIntSupport) return new Smart.Utilities.BigNumber(this._d < 0 ? this._d * BigInt(-1) : this._d);
                  let e = this.normalizeOperand(this);
                  var i = new Smart.Utilities.BigNumber(e);
                  return i._s = 0, i;
                }
                intPart() {
                  if (Smart.Utilities.BigNumber.bigIntSupport) return new Smart.Utilities.BigNumber(this._d);
                  let e = this.normalizeOperand(this);
                  return new Smart.Utilities.BigNumber((e._s ? "-" : "") + (e._d.slice(0, e._f).join("") || "0"));
                }
                valueOf(e, i) {
                  return this.normalizeOperand(this).toString(e, i);
                }
                toString(e, i, a) {
                  function n(l) {
                    var c, m, u = new Smart.Utilities.BigNumber(2), p = [];
                    m = l === void 0 ? r : l;
                    do
                      c = m.mod(u), p.push(c.toString()), m = m.subtract(c).divide(u).intPart();
                    while (m.compare(new Smart.Utilities.BigNumber(0)) === 1);
                    return p.reverse().join("");
                  }
                  let r, s, o;
                  if (Smart.Utilities.BigNumber.bigIntSupport ? (r = this, s = Array.isArray(r._d) ? (r._s ? "-" : "") + (r._d.slice(0, r._f).join("") || "0") + (r._f != r._d.length ? "." + r._d.slice(r._f).join("") : "") : this._d.toString()) : (r = this.normalizeOperand(this), s = (r._s ? "-" : "") + (r._d.slice(0, r._f).join("") || "0") + (r._f != r._d.length ? "." + r._d.slice(r._f).join("") : "")), e === void 0 || e === 10) return s;
                  if (r.compare(0) > -1) switch (e) {
                    case 2:
                      o = n(), a && (o = o.padStart(i, "0"));
                      break;
                    case 8:
                      o = (function(l) {
                        for (var c = ""; l.length % 3 != 0; ) l = "0" + l;
                        for (var m = l.length / 3; m >= 1; m--) {
                          var u = l[3 * m - 3] + "" + l[3 * m - 2] + l[3 * m - 1];
                          c = parseInt(u, 2).toString(8) + "" + c;
                        }
                        return c;
                      })(n());
                      break;
                    case 16:
                      o = (function(l) {
                        for (var c = ""; l.length % 4 != 0; ) l = "0" + l;
                        for (var m = l.length / 4; m >= 1; m--) {
                          var u = l[4 * m - 4] + "" + l[4 * m - 3] + l[4 * m - 2] + l[4 * m - 1];
                          c = parseInt(u, 2).toString(16) + "" + c;
                        }
                        return c;
                      })(n()).toUpperCase(), a && (o = o.padStart(i / 4, "0"));
                  }
                  else o = (function(l, c, m) {
                    var u = "";
                    for (String.prototype.repeat && (l = "0".repeat(m - l.length) + l); l.length < m; ) l = "0" + l;
                    for (var p = !0, h = "", g = (u = (u = (u = (u = l.replace(/0/g, "a")).replace(/1/g, "b")).replace(/a/g, "1")).replace(/b/g, "0")).length - 1; g >= 0; g--) {
                      var f;
                      u.charAt(g) === "0" ? p === !0 ? (f = "1", p = !1) : f = "0" : f = p === !0 ? "0" : "1", h = f + "" + h;
                    }
                    switch (c) {
                      case 2:
                        return h;
                      case 8:
                        var b, y;
                        switch (m) {
                          case 8:
                            b = 3, y = "0";
                            break;
                          case 16:
                            b = 6, y = "00";
                            break;
                          case 32:
                            b = 11, y = "0";
                            break;
                          case 64:
                            b = 22, y = "00";
                        }
                        h = y + h;
                        for (var _ = "", x = b; x >= 1; x--) {
                          var w = h[3 * x - 3] + "" + h[3 * x - 2] + h[3 * x - 1];
                          _ = parseInt(w, 2).toString(8) + "" + _;
                        }
                        return _;
                      case 16:
                        var S;
                        switch (m) {
                          case 8:
                            S = 2;
                            break;
                          case 16:
                            S = 4;
                            break;
                          case 32:
                            S = 8;
                            break;
                          case 64:
                            S = 16;
                        }
                        for (var v = "", T = S; T >= 1; T--) {
                          var k = h[4 * T - 4] + "" + h[4 * T - 3] + h[4 * T - 2] + h[4 * T - 1];
                          v = parseInt(k, 2).toString(16) + "" + v;
                        }
                        return v.toUpperCase();
                    }
                  })(n(r.negate()), e, i);
                  return o;
                }
                _zeroes(e, i, a) {
                  var n = ["push", "unshift"][a || 0];
                  for (++i; --i; e[n](0)) ;
                  return e;
                }
                round() {
                  if ("_rounding" in this) return this;
                  var e, i, a, n, r = Smart.Utilities.BigNumber, s = this.roundType, o = this._d;
                  for (this._rounding = !0; this._f > 1 && !o[0]; --this._f, o.shift()) ;
                  for (e = this._f, a = o[i = this.precision + e]; o.length > e && !o[o.length - 1]; o.pop()) ;
                  return n = (this._s ? "-" : "") + (i - e ? "0." + this._zeroes([], i - e - 1).join("") : "") + 1, o.length > i && (a && s != r.DOWN && (s == r.UP || (s == r.CEIL ? !this._s : s == r.FLOOR ? this._s : s == r.HALF_UP ? a >= 5 : s == r.HALF_DOWN ? a > 5 : s == r.HALF_EVEN && a >= 5 && 1 & o[i - 1])) && this.add(n), o.splice(i, o.length - i)), delete this._rounding, this;
                }
                isZero() {
                  return this._d.length === 1 && this._d[0] === 0;
                }
                normalizeOperand(e) {
                  return e instanceof Smart.Utilities.BigNumber && typeof e._d == "bigint" ? new Smart.Utilities.BigNumber(e._d.toString()) : e;
                }
              });
            })();
          })
        ),
        /***/
        2754: (
          /***/
          (() => {
            Smart.Utilities.Assign("NumericProcessor", class {
              constructor(t, e) {
                switch (t[e]) {
                  case "integer":
                    return new Smart.Utilities.IntegerNumericProcessor(t, e);
                  case "floatingPoint":
                    return new Smart.Utilities.DecimalNumericProcessor(t, e);
                  case "complex":
                    return new Smart.Utilities.ComplexNumericProcessor(t, e);
                }
              }
            }), Smart.Utilities.Assign("BaseNumericProcessor", class {
              constructor(t, e) {
                const i = this;
                i.context = t, i._longestLabelSize = 0, i.numericFormatProperty = e, i.regexScientificNotation = new RegExp(/^([+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)(Y|Z|E|P|T|G|M|k|m|u|n|p|f|a|z|y){1}$/), i.regexNoLeadingZero = new RegExp(/^(-)?[.]\d+$/), i.regexLeadingZero = new RegExp(/^[+\-]?(0+)[1-9]+|^[+\-]?(0{2,})[.]|^(0{2,})$/), i.prefixesToPowers = { Y: 24, Z: 21, E: 18, P: 15, T: 12, G: 9, M: 6, k: 3, m: -3, u: -6, n: -9, p: -12, f: -15, a: -18, z: -21, y: -24 }, window.NIComplex ? i.complexConstructor = window.NIComplex : i.complexConstructor = Smart.Utilities.Complex;
              }
              prepareForValidation(t, e, i) {
                const a = this.context, n = t || e !== void 0;
                if (i = (i = i.toString()).replace(/\s/g, ""), i = a._discardDecimalSeparator(i), this.regexLeadingZero.test(i)) {
                  const o = this.regexLeadingZero.exec(i);
                  i = o[1] ? i.replace(o[1], "") : o[2] ? i.replace(o[2], "0") : i.replace(o[3], "0");
                }
                this.regexNoLeadingZero.test(i) ? i = i.charAt(0) === "-" ? "-0" + i.slice(1) : "0" + i : (a[this.numericFormatProperty] === "integer" && (a._radixNumber === 10 || n) || a[this.numericFormatProperty] === "floatingPoint") && this.regexScientificNotation.test(i) && (i = this.scientificToDecimal(i));
                let r, s = !1;
                if (a[this.numericFormatProperty] === "complex" && a._regexSpecial.nonNumericValue.test(i) === !1) try {
                  if (a._regexSpecial.exaValue.test(i)) {
                    const o = i.indexOf("E"), l = parseFloat(i.slice(0, o)) * Math.pow(10, 18), c = parseFloat(i.slice(o + 1, -1));
                    r = new this.complexConstructor(l, c);
                  } else r = new this.complexConstructor(i);
                  s = !0;
                } catch {
                  s = !1;
                }
                if (s !== !1 || !(!n && a._regex[a._radixNumber].test(i) === !1 || n && a._regex[10].test(i) === !1)) return { value: i, enteredComplexNumber: r };
                a._handleNonNumericValue(t, e, i);
              }
              isENotation(t) {
                return new RegExp(/e/i).test(t.toString());
              }
              scientificToDecimal(t) {
                const e = this.regexScientificNotation.exec(t), i = e[1], a = e[2];
                return parseFloat(i) * Math.pow(10, this.prefixesToPowers[a]);
              }
              _createMeasureLabel() {
                const t = this.context, e = document.createElement("div");
                return e.className = "smart-label", e.style.position = "absolute", e.style.visibility = "hidden", t.scalePosition !== "far" ? t._measureLabelScale = t.$.scaleNear : t._measureLabelScale = t.$.scaleFar, t._measureLabelScale.appendChild(e), e;
              }
              _addMajorTickAndLabel(t, e, i, a, n) {
                const r = this.context, s = r._settings.leftOrTop, o = this.valueToPx(a);
                let l = "", c = "";
                if (parseInt(o) > parseInt(r._measurements.trackLength)) return { tick: l, label: c };
                if (r.logarithmicScale && (t = r._formatLabel(Math.pow(10, a))), r.nodeName.toLowerCase() === "smart-tank" || r._intervalHasChanged) {
                  let m = r._tickIntervalHandler.labelsSize;
                  if (n) {
                    r._labelDummy.innerHTML = t;
                    let u = this.valueToPx(a), p = this.valueToPx(r._drawMax), h = this.valueToPx(r._drawMin), g = r._labelDummy[r._settings.size], f = r.orientation === "vertical" ? r._labelDummy.offsetWidth : r._labelDummy.offsetHeight, b = (g + m.minLabelSize) / 2, y = (g + m.maxLabelSize) / 2;
                    i = r._normalLayout ? u + y < p && u - b > h : u - y > p && u + b < h, f > this._longestLabelSize && (this._longestLabelSize = f);
                  } else this._longestLabelSize = Math.max(m.minLabelOtherSize, m.maxLabelOtherSize, this._longestLabelSize);
                }
                return r._tickValues.push(a), l = '<div style="' + s + ": " + o + 'px;" class="smart-tick"></div>', i !== !1 && (e === void 0 && (r._labelDummy.innerHTML = t, e = r._labelDummy[r._settings.size]), c += '<div class="smart-label' + (n ? " smart-label-middle" : "") + '" style="' + s + ": " + (o - e / 2) + 'px;">' + t + "</div>"), { tick: l, label: c };
              }
              getWordLength(t) {
                switch (this.context._unsigned = t.charAt(0) === "u", t) {
                  case "int8":
                  case "uint8":
                    return 8;
                  case "int16":
                  case "uint16":
                    return 16;
                  case "int32":
                  case "uint32":
                    return 32;
                  case "int64":
                  case "uint64":
                    return 64;
                }
              }
              getAngleByValue(t, e, i) {
                const a = this.context;
                e !== !1 && a.logarithmicScale && (t = Math.log10(t));
                const n = (t - a._drawMin) * a._angleRangeCoefficient;
                let r;
                return r = a.inverted === void 0 || !a.inverted && !a.rightToLeft || a.rightToLeft && a.inverted ? a.endAngle - n : a.startAngle + n, i ? r : r * Math.PI / 180 + Math.PI / 2;
              }
              getValueByAngle(t, e) {
                const i = this.context;
                let a, n, r;
                for (i.inverted === void 0 || !i.inverted && !i.rightToLeft || i.rightToLeft && i.inverted ? (a = i.endAngle, n = t) : (a = t, n = i._normalizedStartAngle); a < n; ) a += 360;
                if (r = (a - n) / i._angleDifference * i._range + parseFloat(i._drawMin), i.logarithmicScale) {
                  if (i.customInterval) return parseFloat(Math.pow(10, this.getCoercedValue(r, !0)).toFixed(12));
                  r = Math.pow(10, r);
                }
                return e && !i.coerce ? Math.round(r) : (r = this.createDescriptor(r, void 0, !0, !0), this.getCoercedValue(r, !1));
              }
              updateGaugeValue(t) {
                const e = this.context, i = e.value;
                e.value = t, e._drawValue = e.logarithmicScale ? Math.log10(t).toString() : t, e._number = this.createDescriptor(e.value), e.$.digitalDisplay.value = t, e.$.fireEvent("change", { value: t, oldValue: i }), e._setAriaValue("valuenow"), delete e._valueBeforeCoercion;
              }
              validateColorRange(t) {
                const e = this.context;
                return Math.min(Math.max(t, e.min), e.max);
              }
              getActualValue(t) {
                return this.context.logarithmicScale ? Math.pow(10, t) : t;
              }
              drawGaugeLogarithmicScaleMinorTicks(t, e, i) {
                const a = this.context;
                let n;
                e instanceof Smart.Utilities.BigNumber && (e = parseFloat(e.toString()));
                for (let r in t) if (n = r, r >= 0 && r % 1 == 0) break;
                for (let r = parseFloat(n); r < a._drawMax; r += e) for (let s = 2; s <= 9; s++) {
                  const o = s * Math.pow(10, r + e - 1);
                  o < a.max && i(o);
                }
                for (let r = parseFloat(n); r > a._drawMin; r -= e) for (let s = 2; s <= 9; s++) {
                  const o = s * Math.pow(10, r - 1);
                  o > a.min && i(o);
                }
              }
              _getAngleDifference(t, e) {
                const i = Math.abs(e - t) % 360;
                return i > 180 ? 360 - i : i;
              }
              addCustomTicks() {
                const t = this, e = t.context, i = !e.logarithmicScale;
                let a = "", n = "";
                function r(s) {
                  const o = e.customTicks[s], l = i ? t.createDescriptor(o) : Math.log10(o), c = s > 0 && s < e.customTicks.length - 1, m = t._addMajorTickAndLabel(e._formatLabel(o), void 0, !0, l, c);
                  a += m.tick, n += m.label;
                }
                if (t._longestLabelSize = 0, e._tickValues = [], e._labelDummy = t._createMeasureLabel(), e._normalLayout) for (let s = 0; s < e.customTicks.length; s++) r(s);
                else for (let s = e.customTicks.length - 1; s >= 0; s--) r(s);
                e.nodeName.toLowerCase() === "smart-tank" && e._updateScaleWidth(t._longestLabelSize), e._appendTicksAndLabelsToScales(a, n);
              }
              addGaugeCustomTicks() {
                const t = this, e = t.context, i = e._distance, a = e._measurements.radius - i.majorTickDistance;
                let n, r;
                function s(o) {
                  const l = e.customTicks[o], c = t.createDescriptor(l), m = t.getAngleByValue(c, !0), u = o > 0 && o < e.customTicks.length - 1;
                  n(m), r(m, l, u);
                }
                n = e.ticksVisibility !== "none" && e._plotTicks !== !1 ? function(o) {
                  e._drawTick(o, a, "major");
                } : function() {
                }, r = e.labelsVisibility !== "none" && e._plotLabels !== !1 ? function(o, l, c) {
                  e._drawLabel(o, l, i.labelDistance, c);
                } : function() {
                };
                for (let o = e.customTicks.length - 1; o >= 0; o--) s(o);
              }
            }), Smart.Utilities.Assign("IntegerNumericProcessor", class extends Smart.Utilities.BaseNumericProcessor {
              constructor(t, e) {
                super(t, e);
                const i = this;
                i.context = t, i.defaultMins = { int8: "-128", uint8: "0", int16: "-32768", uint16: "0", int32: "-2147483648", uint32: "0", int64: "-9223372036854775808", uint64: "0" }, i.defaultMaxs = { int8: "127", uint8: "255", int16: "32767", uint16: "65535", int32: "2147483647", uint32: "4294967295", int64: "9223372036854775807", uint64: "18446744073709551615" };
              }
              createDescriptor(t, e, i, a, n) {
                const r = this.context;
                let s;
                if (t.constructor !== Smart.Utilities.BigNumber) {
                  let o = !n && r._radixNumber ? r._radixNumber : 10;
                  o === 10 && e && t.constructor !== Smart.Utilities.BigNumber && this.isENotation(t) && (t = Smart.Utilities.BigNumber.bigIntSupport ? new Smart.Utilities.BigNumber(Math.round(t)) : new Smart.Utilities.NumberRenderer(t).largeExponentialToDecimal()), s = r._toBigNumberDecimal ? r._toBigNumberDecimal(t.toString(o, r._wordLengthNumber), o) : new Smart.Utilities.BigNumber(t);
                } else s = new Smart.Utilities.BigNumber(t);
                return i && (r._unsigned && s.compare(0) === -1 && (s = s.set(0)), a && (s = this.validate(s, r._minObject, r._maxObject)), s = this.round(s)), s;
              }
              round(t) {
                const e = this.context;
                if (t instanceof window.Smart.Utilities.BigNumber && typeof t._d == "bigint") return t;
                if (t instanceof window.Smart.Utilities.BigNumber == 0 || !e._wordLengthNumber || e._wordLengthNumber < 64) return new Smart.Utilities.BigNumber(Math.round(t.toString()));
                const i = t.mod(1);
                return i._d.length === 1 && i._d[0] === 0 || ((t = t.intPart())._s ? (i._d[1] > 5 || i._d[1] === 5 && i._d[2]) && (t = t.add(-1)) : i._d[1] > 4 && (t = t.add(1))), t;
              }
              validate(t, e, i) {
                let a;
                return a = t.compare(e) === -1 ? e : t.compare(i) === 1 ? i : t, a;
              }
              validateMinMax(t, e) {
                const i = this.context;
                let a = this.defaultMins[i.wordLength], n = new Smart.Utilities.BigNumber(a), r = this.defaultMaxs[i.wordLength], s = new Smart.Utilities.BigNumber(r), o = i.mode !== "date";
                if (i._numberRenderer === void 0 && (i._numberRenderer = new Smart.Utilities.NumberRenderer()), t && o) {
                  i.min !== null && (i.min = i.min.toString().replace(/\s/g, ""), this.regexScientificNotation.test(i.min) && (i.min = this.scientificToDecimal(i.min)));
                  let l = this.round(new Smart.Utilities.BigNumber(i.min));
                  i.min === null || i._minIsNull && i._initialized || !(l.compare(n) >= 0) ? (i._minIsNull = !0, i.min = a, i._minObject = n) : i._minObject = l;
                }
                if (e && o) {
                  i.max !== null && (i.max = i.max.toString().replace(/\s/g, ""), this.regexScientificNotation.test(i.max) && (i.max = this.scientificToDecimal(i.max)));
                  let l = this.round(new Smart.Utilities.BigNumber(i.max));
                  i.max === null || i._maxIsNull && i._initialized || !(l.compare(s) <= 0) ? (i._maxIsNull = !0, i.max = r, i._maxObject = s) : i._maxObject = l;
                }
                o || (i._minObject = new Smart.Utilities.BigNumber(i.min), i._maxObject = new Smart.Utilities.BigNumber(i.max)), this.compare(i._minObject, i._maxObject) || (i._minObject = n, i._maxObject = s, i._drawMin = i.logarithmicScale ? 0 : a, i._drawMax = i.logarithmicScale ? 10 : r, i.min = a, i.max = r), o || (i._minDate = Smart.Utilities.DateTime.fromFullTimeStamp(i.min), i._maxDate = Smart.Utilities.DateTime.fromFullTimeStamp(i.max));
              }
              valueToPx(t) {
                const e = Smart.Utilities.BigNumber.ignoreBigIntNativeSupport;
                Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = !0;
                const i = this.context, a = new Smart.Utilities.BigNumber(i._measurements.trackLength).divide(new Smart.Utilities.BigNumber(i._range));
                let n;
                if (i._normalLayout) {
                  const r = i._drawMin instanceof Smart.Utilities.BigNumber ? i._drawMin : new Smart.Utilities.BigNumber(i._drawMin);
                  t = new Smart.Utilities.BigNumber(t), n = parseFloat(a.multiply(t.subtract(r)).toString());
                } else {
                  const r = i._drawMax instanceof Smart.Utilities.BigNumber ? i._drawMax : new Smart.Utilities.BigNumber(i._drawMax);
                  n = parseFloat(this.round(r.subtract(t).multiply(a)).toString());
                }
                return Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = e, n;
              }
              pxToValue(t) {
                const e = this.context, i = Smart.Utilities.BigNumber.ignoreBigIntNativeSupport;
                let a;
                if (Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = !0, a = e._normalLayout ? e._valuePerPx.multiply(t - e._trackStart) : e._valuePerPx.multiply(e._trackEnd - t), a = this.round(a).toString(), Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = i, e.logarithmicScale) {
                  let n = parseFloat(a) + parseFloat(e._drawMin);
                  return new Smart.Utilities.BigNumber(Math.round(Math.pow(10, n)));
                }
                return this.createDescriptor(e._minObject.add(a), !1, !0, !0);
              }
              compare(t, e, i) {
                if ((t === null || e === null) && t !== e) return !0;
                t.constructor !== Smart.Utilities.BigNumber && (t = new Smart.Utilities.BigNumber(t));
                const a = t.compare(e);
                return i !== !0 ? a !== 0 : a;
              }
              incrementDecrement(t, e, i) {
                const a = this.context;
                let n;
                if (t.constructor !== Smart.Utilities.BigNumber && (t = new Smart.Utilities.BigNumber(t)), e === "add") {
                  if (n = t.add(i), a._drawMax !== void 0) return n.compare(a._drawMax) > 0 ? new Smart.Utilities.BigNumber(a._drawMax) : n;
                } else if (n = t.subtract(i), a._drawMin !== void 0) return n.compare(a._drawMin) < 0 ? new Smart.Utilities.BigNumber(a._drawMin) : n;
                return n;
              }
              render(t, e) {
                const i = this.context;
                if (!i.scientificNotation && e === !0) return new Smart.Utilities.NumberRenderer(new Smart.Utilities.BigNumber(t)).bigNumberToExponent(i.significantDigits);
                let a = t;
                return i.scientificNotation && e === !0 ? a = new Smart.Utilities.NumberRenderer(a).toScientific(i.significantDigits, i.precisionDigits) : typeof t != "string" && (a = t.toString(i._radixNumber, i._wordLengthNumber, i.leadingZeros)), a;
              }
              addTicksAndLabels() {
                const t = Smart.Utilities.BigNumber.ignoreBigIntNativeSupport;
                Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = !0;
                const e = this.context, i = e._measurements.trackLength, a = e._normalLayout, n = e._majorTicksInterval, r = this.round(new Smart.Utilities.BigNumber(e._range).divide(n)), s = i / r, o = new Smart.Utilities.BigNumber(e._drawMin), l = new Smart.Utilities.BigNumber(e._drawMax);
                let c, m, u, p, h, g, f, b, y, _ = "", x = "";
                e._tickValues = [], this._longestLabelSize = 0, a ? (c = o, m = n.add(c.subtract(c.mod(n))), u = m.subtract(c), h = e._formatLabel(o), g = e._tickIntervalHandler.labelsSize.minLabelSize, p = l, f = e._formatLabel(l), b = e._tickIntervalHandler.labelsSize.maxLabelSize) : (c = l, m = c.subtract(c.mod(n)), u = c.subtract(m), h = e._formatLabel(l), g = e._tickIntervalHandler.labelsSize.maxLabelSize, p = o, f = e._formatLabel(o), b = e._tickIntervalHandler.labelsSize.minLabelSize), e._labelDummy = this._createMeasureLabel(), y = this._addMajorTickAndLabel(h, g, !0, c), _ += y.tick, x += y.label;
                const w = u.divide(n).multiply(s);
                if (m.compare(e.max) !== 0 && w.compare(i) < 0) {
                  const S = e._formatLabel(m.toString()), v = w.compare(g) > 0;
                  y = this._addMajorTickAndLabel(S, void 0, v, m, !0), _ += y.tick, x += y.label;
                }
                y = this.addMiddleMajorTicks(r, s, w, u, a, n), _ += y.tick, x += y.label, y = this._addMajorTickAndLabel(f, b, !0, p), _ += y.tick, x += y.label, e.mode !== "date" && (_ += this.addMinorTicks(a)), e._measureLabelScale.removeChild(e._labelDummy), delete e._labelDummy, delete e._measureLabelScale, e.nodeName.toLowerCase() === "smart-tank" && e._updateScaleWidth(this._longestLabelSize), e._appendTicksAndLabelsToScales(_, x), Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = t;
              }
              addMiddleMajorTicks(t, e, i, a, n, r) {
                const s = this.context;
                let o, l = "", c = "";
                for (let m = 1; m < t; m++) {
                  let u, p = i.add(m * e);
                  if (n ? u = r.multiply(m).add(a.add(new Smart.Utilities.BigNumber(s._drawMin))) : (u = new Smart.Utilities.BigNumber(s._drawMax).subtract(a).subtract(r.multiply(m)), m === t - 1 && u.compare(0) === 0 && (s._numberRenderer.numericValue = s._tickIntervalHandler.nearestPowerOfTen, o = s._numberRenderer.bigNumberToExponent(1))), u.compare(s._drawMax) !== 0) {
                    let h = s._formatLabel(u.toString()), g = !0;
                    s._labelDummy.innerHTML = o || h;
                    let f = s._labelDummy[s._settings.size];
                    p.add(f).compare(t * e) >= 0 && (g = !1);
                    const b = this._addMajorTickAndLabel(h, void 0, g, u, !0);
                    l += b.tick, c += b.label;
                  }
                }
                return { tick: l, label: c };
              }
              addMinorTicks(t) {
                function e(u) {
                  a.indexOf(u) === -1 && u % r == 0 && (m += '<div style="' + s + ": " + i._numericProcessor.valueToPx(u) + 'px;" class="smart-tick smart-tick-minor"></div>');
                }
                const i = this.context, a = i._tickValues, n = i._tickIntervalHandler.nearestPowerOfTen, r = i._minorTicksInterval, s = i._settings.leftOrTop;
                let o, l, c, m = "";
                if (t ? (o = a[0], l = a[1], c = a[a.length - 1]) : (o = a[a.length - 1], l = a[a.length - 2], c = a[0]), i.logarithmicScale) (function() {
                  let u = i._measurements.trackLength / a.length, p = 0.1;
                  u < 20 ? p = 1 : u >= 20 && u < 40 ? p = l - o > 1 ? 1 : 0.5 : u >= 40 && u < 80 && (p = 0.2);
                  let h = Math.floor(i._drawMax), g = i._drawMax - h, f = i._drawMax - i._drawMin > a.length;
                  for (let b = i._drawMax; b > 0; b -= 1) {
                    let y = g > 0 ? Math.pow(10, b - g + 1) : Math.pow(10, b), _ = y * p;
                    for (let x = y; x > 0; x -= _) if (x < i.max && x > i.min) {
                      let w = new Smart.Utilities.BigNumber(Math.log10(x));
                      (w % 1 == 0 && f || !f) && (m += '<div style="' + s + ": " + i._numericProcessor.valueToPx(w) + 'px;" class="smart-tick smart-tick-minor"></div>');
                    }
                  }
                })();
                else {
                  for (let u = l; o.compare(u) < 0; u = u.subtract(n)) e(u);
                  for (let u = l.add(n); c.compare(u) > 0; u = u.add(n)) e(u);
                }
                return m;
              }
              validateCustomTicks() {
                const t = this.context, e = t.mode !== "date";
                let i = [];
                for (let a = 0; a < t.customTicks.length; a++) {
                  let n = t.customTicks[a];
                  e ? n = this.createDescriptor(n, !1, !0) : n._d === void 0 && (n = Smart.Utilities.DateTime.validateDate(n).getTimeStamp()), n.compare(t._minObject) >= 0 && n.compare(t._maxObject) <= 0 && i.push(n);
                }
                if (i.sort((function(a, n) {
                  return a.compare(n);
                })), e) {
                  for (let a = 0; a < i.length; a++) i[a] = i[a].toString();
                  i = i.filter((function(a, n, r) {
                    return !n || a !== r[n - 1];
                  }));
                }
                t.customTicks = i.slice(0);
              }
              addGaugeTicksAndLabels() {
                const t = Smart.Utilities.BigNumber.ignoreBigIntNativeSupport;
                Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = !0;
                const e = this.context, i = this, a = Math.max(e._tickIntervalHandler.labelsSize.minLabelSize, e._tickIntervalHandler.labelsSize.maxLabelSize), n = e._majorTicksInterval, r = e._minorTicksInterval, s = {}, o = e._distance, l = e._measurements.radius, c = l - o.majorTickDistance, m = l - o.minorTickDistance, u = new Smart.Utilities.BigNumber(e._drawMin), p = new Smart.Utilities.BigNumber(e._drawMax);
                let h, g, f, b, y, _;
                e.ticksVisibility !== "none" && e._plotTicks !== !1 ? (h = function(v) {
                  e._drawTick(v, c, "major");
                }, g = function(v) {
                  e._drawTick(i.getAngleByValue(v, !0), m, "minor");
                }) : (h = function() {
                }, g = function() {
                }), f = e.labelsVisibility !== "none" && e._plotLabels !== !1 ? function(v, T, k) {
                  e._drawLabel(v, T, o.labelDistance, k);
                } : function() {
                }, e.inverted === void 0 || !e.inverted && !e.rightToLeft || e.rightToLeft && e.inverted ? (y = e.endAngle, _ = e.startAngle) : (y = e.startAngle, _ = e.endAngle), b = i.getAngleByValue(u, !1), h(b), s[e._drawMin.toString()] = !0, f(b, e.min, !1);
                let x, w, S = u.subtract(u.mod(n));
                u.compare(0) !== -1 && (S = S.add(n));
                for (let v = new Smart.Utilities.BigNumber(S); v.compare(u) !== -1; v = v.subtract(r)) x = v;
                for (b = i.getAngleByValue(S, !1), h(b), s[S.toString()] = !0, 2 * Math.PI * e._measurements.innerRadius * (this._getAngleDifference(y, i.getAngleByValue(S, !1, !0)) / 360) > a && f(b, this.getActualValue(S), S.compare(p) === -1), w = S.add(n); w.compare(p.subtract(n)) === -1; w = w.add(n)) b = i.getAngleByValue(w, !1), h(b), s[w.toString()] = !0, f(b, this.getActualValue(w), !0);
                if (s[w.toString()] === void 0 && w.compare(p) !== 1 && (b = i.getAngleByValue(w, !1), h(b), s[w.toString()] = !0, 2 * Math.PI * e._measurements.innerRadius * (this._getAngleDifference(_, i.getAngleByValue(w, !1, !0)) / 360) >= a && f(b, this.getActualValue(w), !0), e._normalizedStartAngle !== e.endAngle && (b = i.getAngleByValue(p, !1), h(b), 2 * Math.PI * e._measurements.innerRadius * (this._getAngleDifference(_, y) / 360) >= a && f(b, e.max, !1))), e.mode !== "date") {
                  if (e.logarithmicScale) this.drawGaugeLogarithmicScaleMinorTicks(s, n, g);
                  else for (let v = x; v.compare(p) === -1; v = v.add(r)) s[v.toString()] || g(v);
                  Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = t;
                } else Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = t;
              }
              updateToolTipAndValue(t, e, i) {
                const a = this.context, n = a.logarithmicScale;
                a._updateTooltipValue(t.toString()), n && (t = parseFloat(Math.pow(10, parseFloat(t)).toFixed(11)));
                const r = (t = t instanceof Smart.Utilities.BigNumber ? t : new Smart.Utilities.BigNumber(t)).toString();
                a._number = t, a._drawValue = n ? Math.log10(r) : t, t.compare(e) !== 0 && i && (a.mode === "numeric" ? (a.value = r, t = r) : (e = a._valueDate, a._valueDate = Smart.Utilities.DateTime.fromFullTimeStamp(r), a.value = t, t = a._valueDate), a._programmaticValueIsSet || a.$.fireEvent("change", { value: t, oldValue: e }), a.$.hiddenInput && (a.$.hiddenInput.value = t), a._setAriaValue("valuenow"));
              }
              validateInterval(t) {
                const e = this.context, i = e._maxObject.subtract(e._minObject);
                e._validInterval = new Smart.Utilities.BigNumber(t), e._validInterval = this.round(e._validInterval), e._validInterval.compare(0) <= 0 && (e._validInterval = new Smart.Utilities.BigNumber(1)), e._validInterval.compare(i) === 1 && (e._validInterval = i), e.interval = e._validInterval.toString();
              }
              getCoercedValue(t, e, i) {
                const a = this.context;
                if (!a.coerce) return t;
                const n = !a.logarithmicScale;
                let r, s;
                if (t = t instanceof Smart.Utilities.BigNumber ? t : new Smart.Utilities.BigNumber(t), a.customInterval) {
                  const p = a.customTicks;
                  if (p.length === 0) return t;
                  let h, g;
                  if (n || i) {
                    r = a._minObject, h = r.subtract(t).abs(), g = r;
                    for (let f = 0; f < p.length; f++) {
                      const b = this.createDescriptor(p[f]), y = b.subtract(t).abs();
                      y.compare(h) === -1 && (h = y, g = b);
                    }
                  } else {
                    r = a._drawMin, h = Math.abs(r - parseFloat(t.toString())), g = r;
                    for (let f = 0; f < p.length; f++) {
                      const b = Math.log10(p[f]), y = Math.abs(b - t);
                      y < h && (h = y, g = b);
                    }
                    g = new Smart.Utilities.BigNumber(g);
                  }
                  return g;
                }
                let o = a._validInterval;
                if (a.mode === "date") {
                  if (a._dateIncrementMethod === "addYears") return this.coerceYear(t);
                  if (a._dateIncrementMethod === "addMonths") return this.coerceMonth(t);
                  o = new Smart.Utilities.BigNumber(a._dateIntervalNumber).multiply(o);
                }
                e !== !1 ? (r = new Smart.Utilities.BigNumber(a._drawMin), s = new Smart.Utilities.BigNumber(a._drawMax)) : (r = new Smart.Utilities.BigNumber(a.min), s = new Smart.Utilities.BigNumber(a.max));
                let l = t.subtract(r), c = l.mod(o);
                if (c.compare(0) === 0) return t;
                let m = l.subtract(c), u = m.add(o);
                if (l.subtract(m).abs().compare(l.subtract(u).abs()) < 0) return m.add(r);
                {
                  const p = u.add(r);
                  return p.compare(s) <= 0 ? p : m.add(r);
                }
              }
              coerceMonth(t) {
                const e = this.context, i = parseFloat(e._validInterval), a = Smart.Utilities.DateTime.fromFullTimeStamp(t), n = a.year(), r = a.month(), s = a.day(), o = e._minDate.year(), l = e._minDate.month(), c = 12 * (e._maxDate.year() - o - 1) + 12 - l + e._maxDate.month();
                let m = 12 * (n - 1 - o) + (12 - l) + r;
                i === 1 && ([1, 3, 5, 7, 8, 10, 12].indexOf(r) !== -1 ? (s > 16 || s === 16 && a.hour() > 11) && m++ : r === 2 ? a.isLeapYear(n) ? (s > 15 || s === 15 && a.hour() > 11) && m++ : s > 14 && m++ : s > 15 && m++), m = this.getCoercedTimePart(0, c, m, i);
                let u = e._minDate.addMonths(m, !0);
                return u.compare(e._maxDate) === 1 && (u = e._minDate.addMonths(m - i, !0)), e._drawValue = new Smart.Utilities.BigNumber(u.getTimeStamp()), e._drawValue;
              }
              coerceYear(t) {
                const e = this.context, i = parseFloat(e._validInterval), a = Smart.Utilities.DateTime.fromFullTimeStamp(t), n = e._maxDate.year(), r = Smart.Utilities.DateTime.getConstructorParameters(e._minDate);
                let s = a.year();
                a.month() > 6 && s++;
                let o = this.getCoercedTimePart(e._minDate.year(), n, s, i);
                o > n && (o -= i), r[0] = o, r.unshift(null);
                const l = new (Function.prototype.bind.apply(Smart.Utilities.DateTime, r))();
                return e._drawValue = new Smart.Utilities.BigNumber(l.getTimeStamp()), e._drawValue;
              }
              getCoercedTimePart(t, e, i, a) {
                let n = i - t, r = n % a;
                if (r === 0) return i;
                let s = parseFloat((n - r).toFixed(12)), o = s + a;
                if (e - t <= a) return i >= t + (e - t) / 2 ? e : t;
                if (Math.abs(n - s) < Math.abs(n - o)) return s + t;
                {
                  const l = o + t;
                  return l > e ? s + t : l;
                }
              }
              updateValue(t) {
                const e = this.context;
                t = t instanceof Smart.Utilities.BigNumber ? t : new Smart.Utilities.BigNumber(t);
                const i = this.validate(t, e._minObject, e._maxObject);
                let a, n, r = e.value;
                e._number = i, e._drawValue = e.logarithmicScale ? Math.log10(i) : i, e.mode === "numeric" ? (a = t.toString(), e.value = a, n = this.compare(t, r)) : (r = Smart.Utilities.DateTime.fromFullTimeStamp(r), e._valueDate = Smart.Utilities.DateTime.fromFullTimeStamp(t), e.value = t, a = t = e._valueDate, n = t.compare(r) !== 0), e._programmaticValueIsSet || !n && !e._scaleTypeChangedFlag || e.$.fireEvent("change", { value: a, oldValue: r }), e.$.hiddenInput && (e.$.hiddenInput.value = t), e._setAriaValue("valuenow"), e._moveThumbBasedOnValue(e._drawValue);
              }
              getValuePerPx(t, e) {
                const i = Smart.Utilities.BigNumber.ignoreBigIntNativeSupport;
                Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = !0;
                const a = new Smart.Utilities.BigNumber(t).divide(e);
                return Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = i, a;
              }
              restrictValue(t) {
                t[1].constructor === Smart.Utilities.BigNumber ? t[1].compare(t[0]) === -1 && t[1].set(t[0]) : t[1] < t[0] && (t[1] = t[0]);
              }
              getAngleByValue(t, e, i) {
                const a = this.context, n = Smart.Utilities.BigNumber.ignoreBigIntNativeSupport;
                if (Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = !0, a._wordLengthNumber < 64) return Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = n, super.getAngleByValue(parseFloat(t.toString()), e, i);
                t instanceof Smart.Utilities.BigNumber == 0 && (t = new Smart.Utilities.BigNumber(t)), e !== !1 && a.logarithmicScale && (t = new Smart.Utilities.BigNumber(Math.log10(t.toString())));
                const r = t.subtract(a._drawMin).multiply(a._angleRangeCoefficient);
                let s;
                return s = a.inverted === void 0 || !a.inverted && !a.rightToLeft || a.rightToLeft && a.inverted ? r.multiply(-1).add(a.endAngle) : r.add(a.startAngle), s = parseFloat(s.toString()), Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = n, i ? s : s * Math.PI / 180 + Math.PI / 2;
              }
              getValueByAngle(t) {
                const e = this.context;
                if (e._wordLengthNumber < 64) return super.getValueByAngle(t, !0);
                const i = Smart.Utilities.BigNumber.ignoreBigIntNativeSupport;
                let a, n, r, s;
                for (Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = !0, e.inverted === void 0 || !e.inverted && !e.rightToLeft || e.rightToLeft && e.inverted ? (a = e.endAngle, n = t) : (a = t, n = e._normalizedStartAngle); a < n; ) a += 360;
                return r = new Smart.Utilities.BigNumber((a - n) / e._angleDifference).multiply(e._range).add(e._drawMin), e.logarithmicScale && (r = new Smart.Utilities.BigNumber(Math.pow(10, r.toString()))), s = e.coerce ? this.getCoercedValue(r, !1) : this.round(r), Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = i, new Smart.Utilities.BigNumber(s);
              }
              updateGaugeValue(t) {
                if (t instanceof Smart.Utilities.BigNumber == 0) return super.updateGaugeValue(t);
                const e = this.context, i = e._getEventValue();
                e.mode === "numeric" ? (e.value = t.toString(), e.$.digitalDisplay.value = e.value) : (e._valueDate = Smart.Utilities.DateTime.fromFullTimeStamp(t), e.value = t), e._drawValue = e.logarithmicScale ? Math.log10(e.value).toString() : e.value, e._number = t, e.$.fireEvent("change", { value: e._getEventValue(), oldValue: i }), e._setAriaValue("valuenow");
              }
              validateColorRange(t) {
                const e = this.context;
                if (e._wordLengthNumber < 64) return super.validateColorRange(t);
                t = e.mode === "numeric" ? new Smart.Utilities.BigNumber(t) : (t = Smart.Utilities.DateTime.validateDate(t)).getTimeStamp();
                const i = new Smart.Utilities.BigNumber(e.min), a = new Smart.Utilities.BigNumber(e.max);
                return t.compare(i) === -1 && (t = i), t.compare(a) === 1 && (t = a), t;
              }
              lockRotation(t, e) {
                const i = this.context;
                if (e instanceof Smart.Utilities.BigNumber == 0 && (e = new Smart.Utilities.BigNumber(e)), t && e.compare(i._number) === -1) {
                  if (i._lockCW = !0, e.compare(i._maxObject) === -1) return new Smart.Utilities.BigNumber(i._maxObject);
                } else if (!t && e.compare(i._number) === 1 && (i._lockCCW = !0, e.compare(i._minObject) === 1)) return new Smart.Utilities.BigNumber(i._minObject);
              }
              getAngleRangeCoefficient() {
                const t = this.context, e = Smart.Utilities.BigNumber.ignoreBigIntNativeSupport;
                Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = !0, t._angleRangeCoefficient = new Smart.Utilities.BigNumber(t._angleDifference).divide(t._range), Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = e;
              }
            }), Smart.Utilities.Assign("DecimalNumericProcessor", class extends Smart.Utilities.BaseNumericProcessor {
              constructor(t, e) {
                super(t, e), this.context = t;
              }
              getPreciseModulo(t, e, i) {
                const a = t >= 0 ? 1 : -1;
                if (t = Math.abs(t), e = Math.abs(e), i === void 0) {
                  const n = t.toExponential(), r = e.toExponential(), s = parseInt(n.slice(n.indexOf("e") + 1), 10), o = parseInt(r.slice(r.indexOf("e") + 1), 10), l = s < 0 ? Math.abs(s) : 0, c = o < 0 ? Math.abs(o) : 0, m = Math.max(l, c);
                  if (this.roundCoefficient = m, t < e) return a * t;
                  if (t === e) return 0;
                  if ((t < -1 || t > 1) && (e < -1 || e > 1 || e === 1)) {
                    if (t % 1 == 0 && e % 1 == 0) return a * (t % e);
                    {
                      const p = Smart.Utilities.BigNumber.ignoreBigIntNativeSupport;
                      Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = !0;
                      const h = a * parseFloat(new Smart.Utilities.BigNumber(t).mod(e).toString());
                      return Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = p, h;
                    }
                  }
                  const u = Math.pow(10, m);
                  return a * (t * u % (e * u) / u);
                }
                return a * (Math.round(t * i) % Math.round(e * i));
              }
              createDescriptor(t, e, i, a) {
                let n = parseFloat(t);
                return a && (n = this.validate(n, this.context._minObject, this.context._maxObject)), n;
              }
              round(t) {
                return Math.round(t);
              }
              validate(t, e, i) {
                let a;
                return a = t < e ? e : t > i ? i : t, a;
              }
              validateMinMax(t, e) {
                const i = this.context, a = i._regexSpecial !== void 0 && i._regexSpecial.inf.test(i.min), n = i._regexSpecial !== void 0 && i._regexSpecial.inf.test(i.max);
                t && (i.min === null || a ? (i.min = -1 / 0, i._minObject = -1 / 0) : (i.min = i.min.toString().replace(/\s/g, ""), this.regexScientificNotation.test(i.min) && (i.min = this.scientificToDecimal(i.min)), i._minObject = i._discardDecimalSeparator(i.min))), e && (i.max === null || n ? (i.max = 1 / 0, i._maxObject = 1 / 0) : (i.max = i.max.toString().replace(/\s/g, ""), this.regexScientificNotation.test(i.max) && (i.max = this.scientificToDecimal(i.max)), i._maxObject = i._discardDecimalSeparator(i.max))), this.compare(i._minObject, i._maxObject) || (i._maxObject = parseFloat(i._maxObject) + 1, i.max = i._maxObject);
              }
              valueToPx(t) {
                const e = this.context, i = e._measurements.trackLength / e._range;
                let a;
                return a = e._normalLayout ? i * (t - e._drawMin) : i * (e._drawMax - t), Math.round(a);
              }
              pxToValue(t) {
                const e = this.context;
                let i;
                if (i = e._normalLayout ? (t - e._trackStart) * e._valuePerPx : (e._trackEnd - t) * e._valuePerPx, e.logarithmicScale) {
                  const a = i + parseFloat(e._drawMin);
                  return Math.pow(10, a);
                }
                return this.validate(i + e._minObject, e._minObject, e._maxObject);
              }
              compare(t, e, i) {
                return t = parseFloat(t), e = parseFloat(e), i !== !0 ? t !== e : t < e ? -1 : t > e ? 1 : 0;
              }
              incrementDecrement(t, e, i) {
                const a = this.context;
                let n;
                if (e === "add") {
                  if (n = parseFloat(t) + parseFloat(i), a._drawMax !== void 0) return n > parseFloat(a._drawMax) ? a._drawMax : n;
                } else if (n = parseFloat(t) - parseFloat(i), a._drawMin !== void 0) return n < parseFloat(a._drawMin) ? a._drawMin : n;
                return n;
              }
              render(t) {
                const e = this.context;
                if (e._regexSpecial !== void 0 && e._regexSpecial.nonNumericValue.test(t)) return t;
                {
                  const i = new Smart.Utilities.NumberRenderer(t);
                  return e.scientificNotation ? i.toScientific(e.significantDigits, e.precisionDigits) : i.toDigits(e.significantDigits, e.precisionDigits);
                }
              }
              addTicksAndLabels() {
                const t = this.context, e = t._measurements.trackLength, i = t._normalLayout, a = t._majorTicksInterval, n = Math.round(t._range / parseFloat(a.toString())), r = e / n, s = parseFloat(t._drawMin), o = parseFloat(t._drawMax);
                let l, c, m, u, p, h, g, f, b, y = "", _ = "";
                t._tickValues = [], this._longestLabelSize = 0, i ? (l = s, c = t.logarithmicScale && s < 0 && s !== -1 ? parseFloat(l - this.getPreciseModulo(l, a)) : parseFloat(l - this.getPreciseModulo(l, a) + parseFloat(a)), m = c - l, p = t._formatLabel(s), h = t._tickIntervalHandler.labelsSize.minLabelSize, u = o, g = t._formatLabel(o), f = t._tickIntervalHandler.labelsSize.maxLabelSize) : (l = o, c = parseFloat(l - this.getPreciseModulo(l, a)), m = l - c, p = t._formatLabel(o), h = t._tickIntervalHandler.labelsSize.maxLabelSize, u = s, g = t._formatLabel(s), f = t._tickIntervalHandler.labelsSize.minLabelSize), t._labelDummy = this._createMeasureLabel(), b = this._addMajorTickAndLabel(p, h, !0, l), y += b.tick, _ += b.label;
                const x = m / a * r;
                if (c.toString() !== t._drawMax.toString() && x < e) {
                  const w = t._formatLabel(c.toString()), S = h < x;
                  b = this._addMajorTickAndLabel(w, void 0, S, c, !0), y += b.tick, _ += b.label;
                }
                b = this.addMiddleMajorTicks(n, r, x, m, i, a), y += b.tick, _ += b.label, b = this._addMajorTickAndLabel(g, f, !0, u), y += b.tick, _ += b.label, y += this.addMinorTicks(i), t._measureLabelScale.removeChild(t._labelDummy), delete t._labelDummy, delete t._measureLabelScale, t.nodeName.toLowerCase() === "smart-tank" && t._updateScaleWidth(this._longestLabelSize), t._appendTicksAndLabelsToScales(y, _);
              }
              addMiddleMajorTicks(t, e, i, a, n, r) {
                const s = this.context;
                let o = "", l = "";
                for (let c = 1; c < t; c++) {
                  let m, u = c * e + i;
                  if (m = n ? parseFloat(s._drawMin) + r * c + a : parseFloat(s._drawMax) - r * c - a, m.toString() !== s._drawMax.toString()) {
                    let p = s._formatLabel(m.toString()), h = !0;
                    s._labelDummy.innerHTML = p, u + s._labelDummy[s._settings.size] >= t * e && (h = !1);
                    const g = this._addMajorTickAndLabel(p, void 0, h, m, !0);
                    o += g.tick, l += g.label;
                  }
                }
                return { tick: o, label: l };
              }
              addMinorTicks(t) {
                function e(g) {
                  return parseFloat(g.toFixed(o));
                }
                function i(g) {
                  n.indexOf(g) === -1 && a._numericProcessor.getPreciseModulo(g, s, l) === 0 && (h += '<div style="' + c + ": " + a._numericProcessor.valueToPx(g) + 'px;" class="smart-tick smart-tick-minor"></div>');
                }
                const a = this.context, n = a._tickValues, r = a._tickIntervalHandler.nearestPowerOfTen, s = a._minorTicksInterval, o = Math.log10(r) < 0 ? Math.round(Math.abs(Math.log10(r))) : 0, l = Math.pow(10, o), c = a._settings.leftOrTop;
                let m, u, p, h = "";
                if (t ? (m = n[0], u = n[1], p = n[n.length - 1]) : (m = n[n.length - 1], u = n[n.length - 2], p = n[0]), a.logarithmicScale) (function() {
                  let g = a._measurements.trackLength / n.length, f = 0.1;
                  g < 20 ? f = 1 : g >= 20 && g < 40 ? f = u - m > 1 ? 1 : 0.5 : g >= 40 && g < 80 && (f = 0.2);
                  let b = Math.floor(a._drawMax), y = a._drawMax - b, _ = a._drawMax - a._drawMin > n.length;
                  for (let x = a._drawMax; x > a._drawMin - 1; x -= 1) {
                    let w = y > 0 ? Math.pow(10, x - y + 1) : Math.pow(10, x), S = w * f;
                    for (let v = w; v > 0; v -= S) if (v < a.max && v > a.min) {
                      let T = new Smart.Utilities.BigNumber(Math.log10(v));
                      (T % 1 == 0 && _ || !_) && (h += '<div style="' + c + ": " + a._numericProcessor.valueToPx(T) + 'px;" class="smart-tick smart-tick-minor"></div>');
                    }
                  }
                })();
                else {
                  for (let g = u; g > m; g = e(g - r)) i(g);
                  for (let g = e(u + r); g < p; g = e(g + r)) i(g);
                }
                return h;
              }
              validateCustomTicks() {
                const t = this.context;
                let e = [];
                for (let i = 0; i < t.customTicks.length; i++) {
                  const a = t.customTicks[i], n = this.createDescriptor(a);
                  n >= t._minObject && n <= t._maxObject && e.push(n.toString());
                }
                e.sort((function(i, a) {
                  return i - a;
                })), e = e.filter((function(i, a, n) {
                  return !a || i !== n[a - 1];
                })), t.customTicks = e.slice(0);
              }
              addGaugeTicksAndLabels() {
                const t = this.context, e = this, i = Math.max(t._tickIntervalHandler.labelsSize.minLabelSize, t._tickIntervalHandler.labelsSize.maxLabelSize), a = t._majorTicksInterval, n = t._minorTicksInterval, r = {}, s = t._distance, o = t._measurements.radius, l = o - s.majorTickDistance, c = o - s.minorTickDistance;
                let m, u, p, h, g, f;
                t.ticksVisibility !== "none" && t._plotTicks !== !1 ? (m = function(x) {
                  t._drawTick(x, l, "major");
                }, u = function(x) {
                  t._drawTick(e.getAngleByValue(x, !0), c, "minor");
                }) : (m = function() {
                }, u = function() {
                }), p = t.labelsVisibility !== "none" && t._plotLabels !== !1 ? function(x, w, S) {
                  t._drawLabel(x, w, s.labelDistance, S);
                } : function() {
                }, t.inverted === void 0 || !t.inverted && !t.rightToLeft || t.rightToLeft && t.inverted ? (g = t.endAngle, f = t.startAngle) : (g = t.startAngle, f = t.endAngle), h = e.getAngleByValue(t._drawMin, !1), m(h), r[t._drawMin] = !0, p(h, t.min, !1);
                let b, y, _ = t._drawMin - e.getPreciseModulo(t._drawMin, a);
                t._drawMin >= 0 && (_ += a);
                for (let x = _; x >= t._drawMin; x -= n) b = x;
                for (h = e.getAngleByValue(_, !1), m(h), r[_] = !0, 2 * Math.PI * t._measurements.innerRadius * (this._getAngleDifference(g, e.getAngleByValue(_, !1, !0)) / 360) > i && p(h, this.getActualValue(_), _ < t._drawMax), y = _ + a; y < t._drawMax - a; y += a) h = e.getAngleByValue(y, !1), m(h), r[y] = !0, p(h, this.getActualValue(y), !0);
                if (r[y] === void 0 && y <= t._drawMax && (h = e.getAngleByValue(y, !1), m(h), r[y] = !0, 2 * Math.PI * t._measurements.innerRadius * (this._getAngleDifference(f, e.getAngleByValue(y, !1, !0)) / 360) >= i && p(h, this.getActualValue(y), !0), t._normalizedStartAngle !== t.endAngle && (h = e.getAngleByValue(t._drawMax, !1), m(h), r[t._drawMax] = !0, 2 * Math.PI * t._measurements.innerRadius * (this._getAngleDifference(f, g) / 360) >= i && p(h, t.max, !1))), t.logarithmicScale) this.drawGaugeLogarithmicScaleMinorTicks(r, a, u);
                else for (let x = b; x < t._drawMax; x += n) r[x] || u(x);
              }
              updateToolTipAndValue(t, e, i) {
                const a = this.context, n = a.logarithmicScale;
                a._updateTooltipValue(t), n && (t = parseFloat(Math.pow(10, parseFloat(t)).toFixed(11)));
                const r = t.toString();
                a._number = t, a._drawValue = n ? Math.log10(r) : t, r !== e && i && (a.value = a._discardDecimalSeparator(r), a._programmaticValueIsSet || a.$.fireEvent("change", { value: a.value, oldValue: e }), a.$.hiddenInput && (a.$.hiddenInput.value = a.value), a._setAriaValue("valuenow"));
              }
              validateInterval(t) {
                const e = this.context, i = e._maxObject - e._minObject;
                t <= 0 && (t = 1), e._validInterval = Math.min(parseFloat(t), i), e.interval = e._validInterval;
              }
              getCoercedValue(t, e, i) {
                const a = this.context;
                if (!a.coerce) return t;
                let n, r, s = !a.logarithmicScale;
                if (a.customInterval) {
                  const p = a.customTicks;
                  if (p.length === 0) return t;
                  s = s || i, n = e !== !1 ? parseFloat(a._drawMin) : a._minObject;
                  let h = Math.abs(n - t), g = n;
                  for (let f = 0; f < p.length; f++) {
                    const b = this.createDescriptor(p[f]), y = s ? b : Math.log10(b), _ = Math.abs(y - t);
                    _ < h && (h = _, g = y);
                  }
                  return g;
                }
                e !== !1 ? (n = parseFloat(a._drawMin), r = parseFloat(a._drawMax)) : (n = parseFloat(a.min), r = parseFloat(a.max));
                let o = t - n, l = this.getPreciseModulo(o, parseFloat(a.interval)), c = this.roundCoefficient;
                if (l === 0) return t;
                this.roundCoefficient === 0 && (c = 12);
                let m = parseFloat((o - l).toFixed(c)), u = m + parseFloat(a.interval);
                if (a.max - a.min <= parseFloat(a.interval) && s) {
                  let p = n, h = r;
                  return t >= p + (h - p) / 2 ? h : p;
                }
                if (Math.abs(o - m) < Math.abs(o - u)) return m + n;
                {
                  const p = u + n;
                  return p > r ? m + n : p;
                }
              }
              updateValue(t) {
                const e = this.context, i = this.validate(t, e._minObject, e._maxObject), a = e.value;
                t.toString() !== a.toString() || e._scaleTypeChangedFlag ? (e.value = t.toString(), e._number = i, e._programmaticValueIsSet || e.$.fireEvent("change", { value: e.value, oldValue: a })) : e.value = typeof t == "string" ? t : t.toString(), e._drawValue = e.logarithmicScale ? Math.log10(i).toString() : i.toString(), e._moveThumbBasedOnValue(e._drawValue), e.$.hiddenInput && (e.$.hiddenInput.value = e.value), e._setAriaValue("valuenow");
              }
              getValuePerPx(t, e) {
                return parseFloat(t) / e;
              }
              restrictValue(t) {
                t[1] < t[0] && (t[1] = t[0]);
              }
              lockRotation(t, e) {
                const i = this.context;
                if (t && e < i._number) {
                  if (i._lockCW = !0, e < i._maxObject) return i._maxObject;
                } else if (!t && e > i._number && (i._lockCCW = !0, e > i._minObject)) return i._minObject;
              }
              getAngleRangeCoefficient() {
                const t = this.context;
                t._angleRangeCoefficient = t._angleDifference / t._range;
              }
            }), Smart.Utilities.Assign("ComplexNumericProcessor", class extends Smart.Utilities.BaseNumericProcessor {
              constructor(t, e) {
                super(t, e), this.context = t;
              }
              createDescriptor(t, e, i, a, n, r) {
                let s;
                return s = r || (t.constructor === this.complexConstructor ? new this.complexConstructor(t.realPart, t.imaginaryPart) : new this.complexConstructor(t)), a && (s = this.validate(s, this.context._minObject, this.context._maxObject)), s;
              }
              validate(t, e, i) {
                let a = t;
                return e !== -1 / 0 ? this.compareComplexNumbers(t, e) === -1 && (a = new this.complexConstructor(e.realPart, e.imaginaryPart)) : i !== 1 / 0 && this.compareComplexNumbers(t, i) === 1 && (a = new this.complexConstructor(i.realPart, i.imaginaryPart)), a;
              }
              compare(t, e, i) {
                return i !== !0 ? this.compareComplexNumbers(t, e) !== 0 : this.compareComplexNumbers(t, e);
              }
              validateMinMax(t, e) {
                const i = this.context;
                t && (i.min === null || i._regexSpecial.inf.test(i.min) ? (i.min = -1 / 0, i._minObject = -1 / 0) : i._minObject = new this.complexConstructor(i.min)), e && (i.max === null || i._regexSpecial.inf.test(i.max) ? (i.max = 1 / 0, i._maxObject = 1 / 0) : i._maxObject = new this.complexConstructor(i.max));
              }
              incrementDecrement(t, e) {
                let i = new this.complexConstructor(t.realPart, t.imaginaryPart), a = this.context._spinButtonsStepObject;
                return e === "add" ? (i.realPart += a.realPart, i.imaginaryPart += a.imaginaryPart) : (i.realPart -= a.realPart, i.imaginaryPart -= a.imaginaryPart), i;
              }
              render(t) {
                let e = t;
                if (this.context._regexSpecial.nonNumericValue.test(t) === !1) {
                  let i, a = e.realPart, n = e.imaginaryPart, r = this.context.significantDigits, s = this.context.precisionDigits;
                  n >= 0 ? i = "+" : (i = "-", n = Math.abs(n));
                  const o = new Smart.Utilities.NumberRenderer(a), l = new Smart.Utilities.NumberRenderer(n);
                  this.context.scientificNotation ? (a = o.toScientific(r, s), n = l.toScientific(r, s)) : (a = o.toDigits(r, s), n = l.toDigits(r, s)), e = `${a} ${i} ${n}i`;
                }
                return e;
              }
              compareComplexNumbers(t, e) {
                if (t instanceof this.complexConstructor == 0 || e instanceof this.complexConstructor == 0) return -1;
                const i = t.realPart, a = e.realPart;
                if (i < a) return -1;
                if (i > a) return 1;
                {
                  const n = t.imaginaryPart, r = e.imaginaryPart;
                  return n < r ? -1 : n > r ? 1 : 0;
                }
              }
            }), Smart.Utilities.Assign("NumberRenderer", class {
              constructor(t) {
                const e = this;
                e.numericValue = t, e.powersToPrefixes = { 24: "Y", 21: "Z", 18: "E", 15: "P", 12: "T", 9: "G", 6: "M", 3: "k", 0: "", "-3": "m", "-6": "u", "-9": "n", "-12": "p", "-15": "f", "-18": "a", "-21": "z", "-24": "y" }, e.localizationObject = { currencysymbol: "$", currencysymbolposition: "before", decimalseparator: ".", thousandsseparator: ",", defaultPrecision: 2 };
              }
              isENotation(t) {
                return new RegExp(/e/i).test(t);
              }
              largeExponentialToDecimal(t) {
                let e;
                t === void 0 && (t = this.numericValue, e = !0);
                let i = t.toString().toLowerCase(), a = i.indexOf("e"), n = new Smart.Utilities.BigNumber(i.slice(0, a)), r = i.slice(a + 1, a + 2);
                r !== "+" && r !== "-" && (i = i.slice(0, a) + "e+" + i.slice(a + 1), r = "+");
                let s = i.slice(a + 2), o = new Smart.Utilities.BigNumber(10).pow(r + (e ? Math.min(20, s) : s));
                return n.multiply(o).toString();
              }
              bigNumberToExponent(t, e) {
                let i = this.numericValue;
                i.constructor !== Smart.Utilities.BigNumber && (i = new Smart.Utilities.BigNumber(i));
                const a = i._f;
                let n = i.toString();
                if (a <= 10) return e ? parseFloat(n).toExponential(t !== null ? t - 1 : void 0) : new Smart.Utilities.NumberRenderer(parseFloat(n)).toDigits(t);
                if (t >= a && !e) return n;
                {
                  let r;
                  i._s === !1 ? r = "" : (r = "-", n = n.slice(1)), parseFloat(n.slice(t, t + 1)) >= 5 && (n = new Smart.Utilities.BigNumber(n.slice(0, t)).add(1).toString());
                  let s = n.slice(1, t);
                  if (e) t--, s.length > 0 && t > s.length ? s += "0".repeat(t - s.length) : s.length === 0 && (s = "0".repeat(t));
                  else for (; s.length > 0 && s.charAt(s.length - 1) === "0"; ) s = s.slice(0, s.length - 1);
                  const o = s.length > 0 ? "." : "", l = a - 1;
                  return r + n.slice(0, 1) + o + s + "E+" + l;
                }
              }
              toScientific() {
                const t = this;
                let e;
                if (e = t.numericValue._d ? t.bigNumberToExponent(arguments[0] !== null ? arguments[0] : arguments[1] + 1, !0).toLowerCase() : t.numericValue <= -1 || t.numericValue >= 1 ? Number(t.toDigits(arguments[0], arguments[1])).toExponential() : Number(t.numericValue).toExponential(), isNaN(e)) return e;
                const i = e.indexOf("e");
                let a = parseInt(e.slice(i + 1), 10), n = parseFloat(e.slice(0, i)), r = new Smart.Utilities.NumberRenderer(n);
                if (a < 0) {
                  let u = r.toDigits(arguments[0], arguments[1]);
                  if (u = parseFloat(u).toExponential(), u.charAt(u.length - 1) === "0") {
                    let p = 0;
                    for (; a % 3 != 0; ) a--, p++;
                    if (p) {
                      const g = Smart.Utilities.BigNumber.ignoreBigIntNativeSupport;
                      Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = !0, n = parseFloat(new Smart.Utilities.BigNumber(n).multiply(Math.pow(10, p)).toString()), Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = g;
                    }
                    r.numericValue = n, n = r.toDigits(arguments[0], arguments[1]), r.numericValue = n / 1e3;
                    const h = r.toDigits(arguments[0], arguments[1]);
                    return h >= 1 && (n = h, a += 3), n + t.powersToPrefixes[a.toString()];
                  }
                }
                let s = 0;
                if (s = Math.abs(a) > 24 ? a - a / Math.abs(a) * 24 : a % 3, s > 0) for (let u = 0; u < s; u++) n *= 10;
                else if (s < 0) {
                  const u = Smart.Utilities.BigNumber.ignoreBigIntNativeSupport;
                  Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = !0, n = parseFloat(new Smart.Utilities.BigNumber(n).multiply(Math.pow(10, s)).toString()), Smart.Utilities.BigNumber.ignoreBigIntNativeSupport = u;
                }
                if (a > 0) {
                  const u = n >= 0 ? 0 : 1, p = e.slice(u, i).length - s - 2;
                  p >= 0 && (n = n.toFixed(p));
                }
                let o = Number(n).toExponential();
                o = parseFloat(o.charAt(o.length - 1)), r.numericValue = n, n = r.toDigits(arguments[0], arguments[1]);
                let l = Number(n).toExponential(), c = 0;
                l = parseFloat(l.charAt(l.length - 1)), l !== o && l % 3 == 0 && (n = parseFloat(n) / Math.pow(10, l), r.numericValue = n, n = r.toDigits(arguments[0], arguments[1]), c = l);
                const m = a - s + c;
                return n + t.powersToPrefixes[m.toString()];
              }
              bigNumberToScientific() {
                const t = this, e = t.numericValue._f - 1, i = parseInt(e, 10) % 3, a = parseInt(e, 10) - i;
                let n, r, s = t.numericValue.toString();
                if (s.charAt(0) === "-" ? (n = "-", s = s.slice(1)) : n = "", arguments[0] !== null) for (r = s.slice(0, arguments[0]), parseFloat(s.slice(arguments[0], arguments[0] + 1)) >= 5 && (r = new Smart.Utilities.BigNumber(r).add(1).toString()); r.length > 1 + i && r.charAt(r.length - 1) === "0"; ) r = r.slice(0, r.length - 1);
                else arguments[1] !== null && (r = s.slice(0, arguments[1] + 1), parseFloat(s.slice(arguments[1] + 1, arguments[1] + 2)) >= 5 && (r = new Smart.Utilities.BigNumber(r).add(1).toString()), arguments[1] + i > r.length - 1 && (r += "0".repeat(arguments[1] + i - r.length + 1)));
                return r.length > 1 + i && (r = r.slice(0, 1 + i) + "." + r.slice(1 + i)), n + r + t.powersToPrefixes[a.toString()];
              }
              toDigits(t, e) {
                const i = this;
                let a;
                return a = t !== null ? i.applySignificantDigits(t) : e !== null ? i.applyPrecisionDigits(e) : i.applySignificantDigits(8), a;
              }
              applySignificantDigits(t) {
                const e = this;
                function i(n) {
                  for (; n.charAt(n.length - 1) === "0"; ) n = n.slice(0, -1);
                  return n.charAt(n.length - 1) === "." && (n = n.slice(0, -1)), n;
                }
                t = Math.max(1, Math.min(t, 21));
                let a = parseFloat(e.numericValue).toPrecision(t).toUpperCase();
                if (a.indexOf(".") !== -1) if (e.isENotation(a)) {
                  const n = a.indexOf("."), r = a.indexOf("E");
                  let s = a.slice(n, r);
                  s = i(s), a = a.slice(0, n) + s + a.slice(r);
                } else a = i(a);
                return a;
              }
              applyPrecisionDigits(t) {
                const e = this;
                t = Math.max(0, Math.min(t, 20));
                let i = parseFloat(e.numericValue).toFixed(t);
                return e.isENotation(i) && (i = e.largeExponentialToDecimal(i) + "." + "0".repeat(t)), i;
              }
              getLogarithm(t) {
                const e = this.numericValue;
                let i;
                if (t === void 0 && (t = 10), t === 10) try {
                  i = Math.log10(e);
                } catch {
                  i = Math.log(e) / Math.log(10);
                }
                else i = Math.log(e) / Math.log(t);
                return i;
              }
              applySeparators(t, e) {
                const i = this, a = (t = t.toString()).indexOf(".");
                if (a !== -1) {
                  const n = t.slice(0, a), r = t.slice(a + 1);
                  return i.applyThousandsSeparator(n, e) + i.localizationObject.decimalseparator + r;
                }
                return i.applyThousandsSeparator(t, e);
              }
              applyThousandsSeparator(t, e) {
                if (e) return t;
                let i = "";
                (t = t.toString()).charAt(0) === "-" && (i = "-", t = t.slice(1));
                let a = t.split("").reverse();
                for (let n = 2; n < a.length - 1; n += 3) a[n] = this.localizationObject.thousandsseparator + a[n];
                return a.reverse(), a = a.join(""), i + a;
              }
              formatNumber(t, e, i) {
                const a = this;
                if (arguments[3] === void 0 && delete a._ignoreMinus, delete a._wordLengthNumber, !/^([a-zA-Z]\d*)$/g.test(e)) try {
                  return a.applyCustomFormat(t, e);
                } catch {
                  return t.toString();
                }
                const n = e.slice(0, 1);
                let r = e.slice(1);
                if (r !== "" && (isNaN(parseFloat(r)) || parseFloat(r) < 0 || parseFloat(r) > 99 ? r = "" : parseFloat(r) % 1 != 0 && (r = Math.round(r))), t._d) a.inputFormat = "integer";
                else {
                  if (t.imaginaryPart) return a.formatComplexNumber(t, e, n, r);
                  a.inputFormat = "floatingPoint";
                }
                let s, o = new Smart.Utilities.NumericProcessor(a, "inputFormat"), l = o.createDescriptor(t);
                switch (a._wordLengthNumber = o.getWordLength(i || "int32"), a.inputFormat === "integer" && (l = o.round(l)), a.numericValue = l, n) {
                  case "C":
                  case "c":
                    return r === "" && (r = a.localizationObject.defaultPrecision), r = parseFloat(r), s = a.inputFormat === "floatingPoint" ? a.applyPrecisionDigits(r) : l.toString() + (r > 0 ? "." + "0".repeat(r) : ""), s = a.applySeparators(s), a.localizationObject.currencysymbolposition === "before" ? s.charAt(0) === "-" ? "-" + a.localizationObject.currencysymbol + s.slice(1) : a.localizationObject.currencysymbol + s : s + " " + a.localizationObject.currencysymbol;
                  case "D":
                  case "d": {
                    if (s = l, a.inputFormat === "floatingPoint" && (s = Math.round(l)), s = s.toString(), r === "") return s;
                    let c = "";
                    s.charAt(0) === "-" && (c = "-", s = s.slice(1));
                    const m = r - s.length;
                    return m > 0 && (s = "0".repeat(m) + s), c + s;
                  }
                  case "E":
                  case "e":
                  case "U":
                  case "u": {
                    r === "" && (r = 6), s = a.inputFormat === "floatingPoint" ? l.toExponential(r) : a.bigNumberToExponent(parseFloat(r) + 1, !0).toLowerCase();
                    const c = s.indexOf("e"), m = s.slice(c + 2).length;
                    return m < 3 && (s = s.slice(0, c + 2) + "0".repeat(3 - m) + s.slice(c + 2)), n.toLowerCase() === "u" ? a.exponentialToSuperscript(a.applySeparators(s, !0)) : (n === "E" && (s = s.toUpperCase()), a.applySeparators(s, !0));
                  }
                  case "F":
                  case "f":
                  case "N":
                  case "n":
                    return r === "" && (r = a.localizationObject.defaultPrecision), r = parseFloat(r), s = a.inputFormat === "floatingPoint" ? a.applyPrecisionDigits(r) : l.toString() + (r > 0 ? "." + "0".repeat(r) : ""), a.applySeparators(s, n.toLowerCase() === "f");
                  case "G":
                  case "g": {
                    if (r === "" || r === "0") if (a.inputFormat === "floatingPoint") r = 15;
                    else switch (i) {
                      case "int8":
                      case "uint8":
                        r = 3;
                        break;
                      case "int16":
                      case "uint16":
                        r = 5;
                        break;
                      case "int64":
                        r = 19;
                        break;
                      case "uint64":
                        r = 20;
                        break;
                      default:
                        r = 10;
                    }
                    r = parseFloat(r);
                    let c = a.formatNumber(t, "E" + r, i), m = c.indexOf("E");
                    const u = parseInt(c.slice(m + 1), 10);
                    if (u > -5 && u < r) return a.inputFormat === "floatingPoint" ? a.applySeparators(a.applySignificantDigits(r), !0) : l.toString();
                    if (u > -100 && u < 100 && (c = c.slice(0, m + 2) + c.slice(m + 3)), c.indexOf(a.localizationObject.decimalseparator) !== -1) {
                      for (; c.charAt(m - 1) === "0"; ) c = c.slice(0, m - 1) + c.slice(m), m = c.indexOf("E");
                      c.charAt(m - 1) === a.localizationObject.decimalseparator && (c = c.slice(0, m - 1) + c.slice(m));
                    }
                    return n === "g" && (c = c.toLowerCase()), c;
                  }
                  case "P":
                  case "p":
                    return r === "" && (r = a.localizationObject.defaultPrecision), r = parseFloat(r), a.inputFormat === "floatingPoint" ? (a.numericValue = 100 * l, s = a.applyPrecisionDigits(r)) : s = l.multiply(100).toString() + (r > 0 ? "." + "0".repeat(r) : ""), a.applySeparators(s) + " %";
                  case "B":
                  case "b":
                  case "O":
                  case "o":
                  case "X":
                  case "x": {
                    let c;
                    switch (a.inputFormat !== "integer" && (a.inputFormat = "integer", o = new Smart.Utilities.NumericProcessor(a, "inputFormat"), l = o.round(o.createDescriptor(t))), n) {
                      case "B":
                      case "b":
                        c = 2;
                        break;
                      case "O":
                      case "o":
                        c = 8;
                        break;
                      default:
                        c = 16;
                    }
                    if (s = l.toString(c, a._wordLengthNumber), r !== "") {
                      const m = parseFloat(r) - s.length;
                      m > 0 && (s = "0".repeat(m) + s);
                    }
                    return n === "x" && (s = s.toLowerCase()), s;
                  }
                  case "S":
                  case "s":
                    return r === "" && (r = a.localizationObject.defaultPrecision), r = parseFloat(r), a.toScientific(null, r).replace(".", a.localizationObject.decimalseparator);
                  default:
                    return t.toString();
                }
              }
              formatComplexNumber(t, e, i) {
                const a = this;
                switch (i) {
                  case "E":
                  case "e":
                  case "U":
                  case "u":
                  case "F":
                  case "f":
                  case "G":
                  case "g":
                  case "N":
                  case "n":
                  case "S":
                  case "s":
                    return t.imaginaryPart >= 0 ? a.formatNumber(t.realPart, e) + " + " + a.formatNumber(t.imaginaryPart, e) + "i" : a.formatNumber(t.realPart, e) + " - " + a.formatNumber(Math.abs(t.imaginaryPart), e) + "i";
                  default:
                    return t.toString();
                }
              }
              toString(t, e, i) {
                return e ? this.formatNumber(t, e, i) : t.toString();
              }
              applyCustomFormat(t, e) {
                const i = this, a = (e = (e = e.replace(/_.|\[\w*\]|\*/g, "")).replace(/\?/g, "#")).split(";");
                if (typeof t == "string" && isNaN(t)) return a[a.length - 1].replace(/"/g, "").replace(/@/g, t.toString());
                if (t._d) i.inputFormat = "integer";
                else {
                  if (t.imaginaryPart) return t.toString();
                  t = parseFloat(t), i.inputFormat = "floatingPoint";
                }
                let n = new Smart.Utilities.NumericProcessor(i, "inputFormat"), r = n.createDescriptor(t);
                i.inputFormat === "integer" && (r = n.round(r)), i.numericProcessor = n;
                const s = i.getRelevantFormatSection(a, r);
                if (s === void 0) return t.toString();
                if (s.indexOf("@") !== -1) return a[a.length - 1].replace(/"/g, "").replace(/@/g, t.toString());
                const o = s.replace(/".*"/g, "").indexOf("%") !== -1, l = i.getTextParts(s);
                if (l.main.toLowerCase().indexOf("e") !== -1) return i.applyCustomExponentialFormat(r, l, n);
                if (l.main.indexOf("/") !== -1) return i.applyCustomFractionalFormat(r, l, n);
                if (o && (i.inputFormat === "integer" ? r = r.multiply(100) : r *= 100), l.main === "") {
                  if (!o) return l.suffix;
                  let w = r.toString();
                  return i._ignoreMinus && w.charAt(0) === "-" && (w = w.slice(1)), w + l.suffix;
                }
                let c = l.main.replace(/[^0#,. \/]/g, ""), m = c.indexOf(".");
                for (m !== -1 && (c = c.substring(0, m + 1) + c.substring(m + 1).replace(/\./g, ""), c.charAt(c.length - 1) === "." && (c = c.slice(0, c.length - 1)), m === 0 && (c = "#" + c)); c.charAt(c.length - 1) === ","; ) c = c.slice(0, c.length - 1), i.inputFormat === "floatingPoint" ? r /= 1e3 : r = r.multiply(1e-3);
                i.inputFormat === "integer" && (r = n.round(r));
                const u = c.indexOf(",") !== -1;
                c = c.replace(/,/g, "");
                const p = c.split("."), h = p[0];
                let g = p[1], f = "";
                if (p.length === 1) return i.inputFormat === "floatingPoint" && (r = n.round(r)), f = r.toString(), i.setTextParts(i.formatWholeNumber(f, h, u), l);
                f = r.toString();
                let b = f.split("."), y = i.formatWholeNumber(b[0], h, u), _ = b[1] || "";
                if (g.length <= _.length && (f = parseFloat(r.toFixed(g.length)).toString(), b = f.split("."), y = i.formatWholeNumber(b[0], h, u), _ = b[1] || "", _)) return i.setTextParts(y + i.localizationObject.decimalseparator + _.slice(0, g.length), l);
                g = g.slice(_.length - g.length);
                let x = g.lastIndexOf("0");
                return x === -1 ? _ === "" ? i.setTextParts(y, l) : i.setTextParts(y + i.localizationObject.decimalseparator + _, l) : i.setTextParts(y + i.localizationObject.decimalseparator + _ + "0".repeat(x + 1), l);
              }
              getRelevantFormatSection(t, e) {
                const i = this, a = i.numericProcessor.compare(e, 0, !0);
                if (a === 1) return t[0];
                let n, r;
                return t.length >= 3 ? (i._ignoreMinus = !0, n = 1, r = 2) : t.length === 2 ? (i._ignoreMinus = !0, r = 0, n = 1) : t.length === 1 && (r = 0, n = 0), a === 0 ? t[r] : a === -1 ? t[n] : void 0;
              }
              getTextParts(t) {
                const e = t.replace(/"[^"]*"/g, ""), i = t.match(/"[^"]*"/g), a = e.search(/0|#|\./g), n = Math.max(e.lastIndexOf("0"), e.lastIndexOf("#"), e.lastIndexOf("."), e.lastIndexOf(",")), r = e.slice(a, n + 1);
                if (r === "") return { prefix: "", main: "", suffix: t.replace(/"/g, "") };
                let s = t.indexOf(r), o = s + r.length;
                if (i) for (let l = 0; l < i.length; l++) {
                  const c = t.indexOf(i[l]);
                  s >= c && o <= c + i[l].length && (s = t.indexOf(r, c + i[l].length), o = s + r.length);
                }
                return { prefix: t.slice(0, s).replace(/"/g, ""), main: r, suffix: t.slice(o).replace(/"/g, "") };
              }
              applyCustomExponentialFormat(t, e, i) {
                const a = this;
                let n, r = e.main;
                const s = r.indexOf(",") !== -1;
                r = r.replace(/[^0#.eE+-]/g, "");
                const o = r.toLowerCase().indexOf("e");
                r = r.substring(0, o + 1) + r.substring(o + 1).replace(/[eE\.]/g, "");
                const l = r.charAt(o), c = r.indexOf(".");
                c !== -1 && (r = r.substring(0, c + 1) + r.substring(c + 1).replace(/\./g, "")), r.charAt(r.length - 1) === "." && (r = r.slice(0, r.length - 1));
                const m = r.split(l);
                let u = m[0];
                const p = u.split("."), h = p[0], g = p[1], f = m[1];
                let b = t.toString().split(".")[0].replace(/-/, ""), y = 0;
                if (b === "0" && i.compare(t, 0)) {
                  let _ = h.length - 1;
                  for (; parseInt(t) === 0; ) y++, t *= 10;
                  b = t.toString().split(".")[0].replace(/-/, ""), y += _, t *= Math.pow(10, _);
                }
                if (s && (u = u.slice(0, 1) + "," + u.slice(1)), b.length <= h.length) n = a.formatNumber(t, u, void 0, !0) + l + a.formatExponent(0 - y, f);
                else {
                  const _ = b.length - h.length;
                  let x = a.inputFormat === "floatingPoint" ? t / Math.pow(10, _) : t.divide(Math.pow(10, _));
                  g || (n = a.applyThousandsSeparator(i.round(x).toString(), !s) + l + a.formatExponent(_ - y, f));
                  let w = x.toString().split(".")[1] || "";
                  w.length === g.length ? n = a.applySeparators(x, !s) + l + a.formatExponent(_ - y, f) : w.length < g.length ? n = a.formatNumber(x, u, void 0, !0) + l + a.formatExponent(_ - y, f) : (x = a.inputFormat === "floatingPoint" ? x.toFixed(g.length) : x = i.round(t.divide(Math.pow(10, _ - g.length))).divide(Math.pow(10, g.length)), n = a.formatNumber(parseFloat(x), u, void 0, !0) + l + a.formatExponent(_ - y, f));
                }
                return a.setTextParts(n, e);
              }
              formatExponent(t, e) {
                let i;
                return ["+", "-"].indexOf(e.charAt(0)) !== -1 && (i = e.charAt(0), (t > 0 && i === "-" || t < 0 && i === "+") && (i = void 0)), t < 0 && (t = Math.abs(t), i = "-"), e = e.replace(/[+-]/g, ""), (i || "") + (t = this.formatNumber(t, e, void 0, !0));
              }
              formatWholeNumber(t, e, i) {
                const a = this;
                let n = "";
                if (t.charAt(0) === "-" && (a._ignoreMinus || (n = "-"), t = t.slice(1)), t === "0") {
                  if (e === "#".repeat(e.length)) return n;
                  t = "";
                }
                if (e.length <= t.length) return n + a.applyThousandsSeparator(t, !i);
                for (let r = (e = e.slice(0, e.length - t.length)).length - 1; r >= 0; r--) e.charAt(r) === "0" && (t = "0" + t);
                return n + a.applyThousandsSeparator(t, !i);
              }
              setTextParts(t, e) {
                return e.prefix + t + e.suffix;
              }
              applyCustomFractionalFormat(t, e, i) {
                const a = this, n = /^([0#,]+[ ]+)?([0#,]+\/[0#,]+)$/;
                let r, s = e.main.trim();
                if (!n.test(s)) return t.toString();
                const o = n.exec(s);
                if (o[2] = o[2].replace(/,/g, ""), a.inputFormat === "integer") {
                  const l = o[2].split("/");
                  return o[1] === void 0 ? r = a.formatNumber(t, l[0], void 0, !0) + "/" + a.formatNumber(1, l[1], void 0, !0) : (r = a.formatNumber(t, o[1].trim(), void 0, !0), o[2].indexOf("0") !== -1 && (r += " " + a.formatNumber(0, l[0], void 0, !0) + "/" + a.formatNumber(1, l[1], void 0, !0))), a.setTextParts(r, e);
                }
                if (o[1] === void 0) r = (t < 0 ? "-" : "") + a.formatAsFraction(Math.abs(t), o[2]);
                else {
                  const l = o[1].trim(), c = o[2];
                  r = a.formatNumber(parseInt(t, 10), l, void 0, !0) + " " + a.formatAsFraction(i.getPreciseModulo(Math.abs(t), 1), c);
                }
                return a.setTextParts(r.trim(), e);
              }
              formatAsFraction(t, e) {
                const i = this, a = e.split("/");
                if (t === 0) return e.indexOf("0") === -1 ? "" : i.formatNumber(0, a[0], void 0, !0) + "/" + i.formatNumber(1, a[1], void 0, !0);
                if (t % 1 == 0) return i.formatNumber(t, a[0], void 0, !0) + "/" + i.formatNumber(1, a[1], void 0, !0);
                const n = [];
                i.approximateFractions(t, n);
                const r = a[1].length >= 2 ? 2 : 1;
                let s = [], o = [];
                n.forEach((function(c, m) {
                  const u = c.denominator.toString().length, p = Math.abs(t - c.numerator / c.denominator);
                  if (s[u] === void 0) return o[u] = m, void (s[u] = p);
                  p < s[u] && (o[u] = m, s[u] = p);
                }));
                let l = o[r] ? n[o[r]] : n[o[1]];
                return i.formatNumber(l.numerator, a[0], void 0, !0) + "/" + i.formatNumber(l.denominator, a[1], void 0, !0);
              }
              approximateFractions(t, e) {
                const i = [0, 1], a = [1, 0], n = this.getMaxNumerator(t);
                let r, s = t, o = NaN;
                for (let l = 2; l < 1e3; l++) {
                  const c = Math.floor(s);
                  if (i[l] = c * i[l - 1] + i[l - 2], Math.abs(i[l]) > n || (a[l] = c * a[l - 1] + a[l - 2], r = i[l] / a[l], r === o) || (e.push({ numerator: i[l], denominator: a[l] }), r === t)) return;
                  o = r, s = 1 / (s - c);
                }
              }
              getMaxNumerator(t) {
                let e = null, i = t.toString().indexOf("E");
                i === -1 && (i = t.toString().indexOf("e")), e = i === -1 ? t.toString() : t.toString().substring(0, i);
                let a = null;
                const n = e.toString().indexOf(".");
                n === -1 ? a = e : n === 0 ? a = e.substring(1, e.length) : n < e.length && (a = e.substring(0, n) + e.substring(n + 1, e.length));
                let r = a;
                const s = r.toString().length, o = t;
                let l = o.toString().length;
                o === 0 && (l = 0);
                const c = s - l;
                for (let m = c; m > 0 && r % 2 == 0; m--) r /= 2;
                for (let m = c; m > 0 && r % 5 == 0; m--) r /= 5;
                return r;
              }
              exponentialToSuperscript(t) {
                const e = t.indexOf("e"), i = t.slice(e + 1).replace(/0{1,2}/, "");
                let a = t.slice(0, e + 1);
                return a = a.replace("e", "×10"), a += this.toSuperscript(i), a = a.replace("+", ""), a;
              }
              toSuperscript(t, e) {
                const i = "-0123456789", a = "⁻⁰¹²³⁴⁵⁶⁷⁸⁹";
                let n = "";
                for (let r = 0; r < t.length; r++) if (e === !0) {
                  const s = a.indexOf(t.charAt(r));
                  n += s !== -1 ? i[s] : t[r];
                } else {
                  const s = i.indexOf(t.charAt(r));
                  n += s !== -1 ? a[s] : t[r];
                }
                return n;
              }
            });
          })
        ),
        /***/
        7997: (
          /***/
          (() => {
            Smart("smart-numeric-text-box", class extends Smart.BaseElement {
              static get properties() {
                return { decimalSeparator: { value: ".", type: "string" }, dropDownAppendTo: { value: null, type: "any" }, enableMouseWheelAction: { value: !1, type: "boolean" }, inputFormat: { value: "integer", allowedValues: ["integer", "floatingPoint", "complex"], type: "string" }, hint: { value: "", type: "string" }, label: { value: "", type: "string" }, leadingZeros: { value: !1, type: "boolean" }, max: { value: null, type: "any" }, messages: { value: { en: { binary: "BIN", octal: "OCT", decimal: "DEC", hexadecimal: "HEX", integerOnly: "smartNumericTextBox: The property {{property}} can only be set when inputFormat is integer.", noInteger: "smartNumericTextBox: the property {{property}} cannot be set when inputFormat is integer.", significantPrecisionDigits: "smartNumericTextBox: the properties significantDigits and precisionDigits cannot be set at the same time." } }, type: "object", extend: !0 }, min: { value: null, type: "any" }, name: { value: "", type: "string" }, nullable: { value: !1, type: "boolean" }, opened: { value: !1, type: "boolean" }, outputFormatString: { value: null, type: "string?" }, placeholder: { value: "", type: "string" }, dropDownEnabled: { value: !1, type: "boolean" }, precisionDigits: { value: null, type: "number?" }, radix: { value: 10, allowedValues: ["2", "8", "10", "16", 2, 8, 10, 16, "binary", "octal", "decimal", "hexadecimal"], type: "any" }, radixDisplay: { value: !1, type: "boolean" }, radixDisplayPosition: { value: "left", allowedValues: ["left", "right"], type: "string" }, scientificNotation: { value: !1, type: "boolean" }, showDropDownValues: { value: !1, type: "boolean" }, showUnit: { value: !1, type: "boolean" }, significantDigits: { value: null, type: "number?" }, spinButtons: { value: !1, type: "boolean" }, spinButtonsDelay: { value: 75, type: "number" }, spinButtonsInitialDelay: { value: 0, type: "number" }, spinButtonsPosition: { value: "right", allowedValues: ["left", "right"], type: "string" }, spinButtonsStep: { value: "1", type: "any" }, type: { value: "numeric", type: "string", defaultReflectToAttribute: !0, readonly: !0 }, unit: { value: "kg", type: "string" }, validation: { value: "strict", allowedValues: ["strict", "interaction"], type: "string" }, value: { value: "0", type: "any?" }, wordLength: { value: "int32", allowedValues: ["int8", "uint8", "int16", "uint16", "int32", "uint32", "int64", "uint64"], type: "string" } };
              }
              static get listeners() {
                return { mouseenter: "_mouseenterMouseleaveHandler", mouseleave: "_mouseenterMouseleaveHandler", resize: "_resizeHandler", "downButton.click": "_downButtonClickHandler", "downButton.mouseenter": "_mouseenterMouseleaveHandler", "downButton.mouseleave": "_mouseenterMouseleaveHandler", "dropDown.click": "_dropDownItemClickHandler", "dropDown.mouseout": "_mouseenterMouseleaveHandler", "dropDown.mouseover": "_mouseenterMouseleaveHandler", "input.blur": "_inputBlurHandler", "input.change": "_inputChangeHandler", "input.focus": "_inputFocusHandler", "input.keydown": "_inputKeydownHandler", "input.keyup": "_inputKeyupHandler", "input.paste": "_inputPasteHandler", "input.wheel": "_inputWheelHandler", "radixDisplayButton.click": "_radixDisplayButtonClickHandler", "radixDisplayButton.mouseenter": "_mouseenterMouseleaveHandler", "radixDisplayButton.mouseleave": "_mouseenterMouseleaveHandler", "upButton.click": "_upButtonClickHandler", "upButton.mouseenter": "_mouseenterMouseleaveHandler", "upButton.mouseleave": "_mouseenterMouseleaveHandler", "document.down": "_documentMousedownHandler", "document.up": "_documentMouseupHandler" };
              }
              static get requires() {
                return window.NIComplex ? { "Smart.Button": "smart.button.js", "Smart.Utilities.BigNumber": "smart.math.js", "Smart.Utilities.NumericProcessor": "smart.numeric.js" } : { "Smart.Button": "smart.button.js", "Smart.Utilities.Complex": "smart.complex.js", "Smart.Utilities.BigNumber": "smart.math.js", "Smart.Utilities.NumericProcessor": "smart.numeric.js" };
              }
              static get styleUrls() {
                return ["smart.button.css", "smart.numerictextbox.css"];
              }
              template() {
                return `<div id="container" class="smart-container" role="presentation">
                <span id="label" inner-h-t-m-l="[[label]]" class="smart-label"></span>
                <div id="radixDisplayButton" class="smart-unselectable smart-input-addon smart-drop-down-button smart-numeric-text-box-component smart-numeric-text-box-radix-display" role="button" aria-haspopup="listbox"></div>
                <input id="input" type="text" spellcheck="false" class="smart-input smart-numeric-text-box-component" placeholder="[[placeholder]]" readonly="[[readonly]]" disabled="[[disabled]]" name="[[name]]" aria-label="[[placeholder]]" />
                <div id="unitDisplay" class="smart-unselectable smart-input-addon smart-drop-down-button smart-numeric-text-box-component smart-numeric-text-box-unit-display" role="presentation"></div>
                <div id="spinButtonsContainer" class="smart-input-addon smart-numeric-text-box-component smart-spin-buttons-container" role="presentation">
                    <smart-repeat-button initial-delay="[[spinButtonsInitialDelay]]" delay="[[spinButtonsDelay]]" animation="[[animation]]" unfocusable id="upButton" class="smart-spin-button" aria-label="Increment" right-to-left="[[rightToLeft]]">
                        <div class="smart-arrow smart-arrow-up" role="presentation" aria-hidden="true"></div>
                    </smart-repeat-button>
                    <smart-repeat-button initial-delay="[[spinButtonsInitialDelay]]" delay="[[spinButtonsDelay]]" animation="[[animation]]" unfocusable id="downButton" class="smart-spin-button" aria-label="Decrement" right-to-left="[[rightToLeft]]">
                        <div class="smart-arrow smart-arrow-down" role="presentation" aria-hidden="true"></div>
                    </smart-repeat-button>
                </div>
                <ul id="dropDown" class="smart-visibility-hidden smart-drop-down smart-numeric-text-box-drop-down" role="listbox">
                    <li id="dropDownItem2" class="smart-list-item" data-value="2" role="option"></li>
                    <li id="dropDownItem8" class="smart-list-item" data-value="8" role="option"></li>
                    <li id="dropDownItem10" class="smart-list-item" data-value="10" role="option"></li>
                    <li id="dropDownItem16" class="smart-list-item" data-value="16" role="option"></li>
                </ul>
                <span id="hint" class="smart-hint smart-hidden" inner-h-t-m-l="[[hint]]"></span>
            </div>`;
              }
              attached() {
                const t = this;
                super.attached(), t.isCompleted && (t._positionDetection.dropDownAttached(), t._positionDetection.checkBrowserBounds());
              }
              detached() {
                const t = this;
                super.detached(), t.opened && t._closeRadix(!0), t._positionDetection && t._positionDetection.dropDownDetached();
              }
              ready() {
                super.ready();
              }
              render() {
                const t = this;
                t._numericProcessor = new Smart.Utilities.NumericProcessor(t, "inputFormat"), t._numberRenderer = new Smart.Utilities.NumberRenderer(), t._numberRenderer.localizationObject.decimalseparator = t.decimalSeparator, t._positionDetection = new Smart.Utilities.PositionDetection(t, t.$.dropDown, t.$.container, "_closeRadix"), t._positionDetection.getDropDownParent(!0), t._dropDownListPosition = "bottom", t.rightToLeft && (t.spinButtonsPosition = t.spinButtonsPosition === "right" ? "left" : "right"), t._setIds(), t.setAttribute("aria-describedby", t.$.unitDisplay.id + " " + t.$.hint.id), t.getAttribute("aria-labelledby") || t.setAttribute("aria-labelledby", t.$.label.id), t.$.input.setAttribute("aria-label", t.label || t.placeholder || t.hint || "Numeric Text Box"), t.$.radixDisplayButton.setAttribute("aria-owns", t.$.dropDown.id), t.rightToLeft && t.dropDownAppendTo !== null && t.$.dropDown.setAttribute("right-to-left", ""), t._radixPrefixes = { 10: "d", 2: "b", 8: "o", 16: "x" }, t._regex = { 2: new RegExp(/^[0-1]+$/), 8: new RegExp(/^[0-7]+$/), 10: new RegExp(/^[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?$/), 16: new RegExp(/^[0-9a-f]+$/i) }, t._regexSpecial = { nan: new RegExp(/^(nan)$/i), inf: new RegExp(/^((-?inf(inity)?)|([+\-]?∞))$/i), nonNumericValue: new RegExp(/^$|(^((nan)|((-?inf(inity)?)|([+\-]?∞))|(null))$)/i), exaValue: new RegExp(/^[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[E])([+\-]\d*)?i$/) }, t._initialDropDownOptionsSet = !1, t.spinButtonsPosition === "left" && t.$.container.insertBefore(t.$.spinButtonsContainer, t.$.label.nextElementSibling), t.radixDisplayPosition === "right" && t.$.container.insertBefore(t.$.radixDisplayButton, t.$.unitDisplay.nextElementSibling), t._setInitialComponentDisplay(), t._initialAdjustments(), t._refreshShape(), t._initialized = !0, super.render();
              }
              _setIds() {
                const t = this;
                t.$.label.id || (t.$.label.id = t.id + "Label"), t.$.radixDisplayButton.id || (t.$.radixDisplayButton.id = t.id + "RadixDisplayButton"), t.$.unitDisplay.id || (t.$.unitDisplay.id = t.id + "UnitDisplay"), t.$.dropDown.id || (t.$.dropDown.id = t.id + "DropDown"), t.$.hint.id || (t.$.hint.id = t.id + "Hint");
              }
              _refreshShape() {
                const t = this.$.container.querySelectorAll(".smart-numeric-text-box-component:not(.smart-hidden)");
                Array.from(this.$.container.getElementsByClassName("smart-numeric-text-box-component")).forEach(((e) => e.classList.remove("smart-numeric-text-box-component-border-left", "smart-numeric-text-box-component-border-right"))), t.length > 0 && (t[0].classList.add("smart-numeric-text-box-component-border-left"), t[t.length - 1].classList.add("smart-numeric-text-box-component-border-right"));
              }
              val(t, e) {
                const i = this, a = t !== null && typeof t == "object" && Object.keys(t).length === 0;
                if (t === void 0 || a !== !1) return i.value;
                {
                  const n = i.value;
                  if ((t === "" || t === null) && n === null) return null;
                  if (t === null) return i._triggerChangeEvent = i.validation === "strict", i._validate(!1, null), i._triggerChangeEvent = !1, void (i._programmaticValueIsSet = !0);
                  if ((t = t.toString()).toUpperCase() === n.toString().toUpperCase()) return t;
                  e === void 0 ? (i._triggerChangeEvent = i.validation === "strict", i._validate(!1, t), i._triggerChangeEvent = !1) : i._setValue(t), i._programmaticValueIsSet = !0;
                }
              }
              focus() {
                this.$.input.focus();
              }
              select() {
                this.$.input.select();
              }
              _updateSpinButtonsStepObject() {
                const t = this;
                t._spinButtonsStepObject = t._numericProcessor.createDescriptor(t.spinButtonsStep, !0);
              }
              _setInitialComponentDisplay() {
                const t = this;
                t.spinButtons === !1 && t.$spinButtonsContainer.addClass("smart-hidden"), t.radixDisplay === !1 && t.$radixDisplayButton.addClass("smart-hidden"), t.showUnit === !1 && t.$unitDisplay.addClass("smart-hidden");
              }
              _initialAdjustments() {
                const t = this;
                t._radixNumber = t._getRadix(t.radix), t._wordLengthNumber = t._numericProcessor.getWordLength(t.wordLength), t._validatePropertyCompatibility(), t._numericProcessor.validateMinMax(!0, !0), t._updateSpinButtonsStepObject(), t._validate(!0), t._programmaticValueIsSet = !0, t._cachedInputValue = t.$.input.value, t._editableValue === void 0 && (t._editableValue = t._cachedInputValue), t.$.radixDisplayButton.innerHTML = t._radixPrefixes[t._radixNumber], t.$.unitDisplay.innerHTML = t.unit, t.disabled && (t.$.upButton.disabled = !0, t.$.downButton.disabled = !0), t.opened && (t.dropDownEnabled && !t.disabled && t.value !== null ? t._openRadix() : t.opened = !1), t.$.radixDisplayButton.setAttribute("aria-expanded", t.opened), t._setFocusable();
              }
              _validatePropertyCompatibility() {
                const t = this;
                t.inputFormat !== "integer" ? (t._radixNumber !== 10 && t.error(t.localize("integerOnly", { property: "radix" })), t.radixDisplay && t.error(t.localize("integerOnly", { property: "radixDisplay" })), t.dropDownEnabled && t.error(t.localize("integerOnly", { property: "dropDownEnabled" })), t.wordLength !== "int32" && t.error(t.localize("integerOnly", { property: "wordLength" }))) : t.precisionDigits !== null && t.error(t.localize("noInteger", { property: "precisionDigits" })), t.significantDigits === null && t.precisionDigits === null ? t.significantDigits = 8 : t.significantDigits !== null && t.precisionDigits !== null && t.error(t.localize("significantPrecisionDigits"));
              }
              _validate(t, e) {
                const i = this;
                let a;
                if (t) a = i.value, a === void 0 && (a = i.nullable ? null : "0");
                else if (e === void 0 || e === null && !i.nullable) {
                  if (a = i.$.input.value, a === i.value && i._programmaticValueIsSet !== !0) return void (i.$.input.value = i._cachedInputValue);
                } else a = e;
                if (i.nullable && (a === null || a === "")) return i.value = null, i._number = null, i.$.input.value = "", i._cachedInputValue = "", i._editableValue = "", void i._disableComponents();
                const n = i._numericProcessor.prepareForValidation(t, e, a);
                if (n === void 0) return void i._disableComponents();
                const r = i._numericProcessor.createDescriptor(n.value, !0, !0, !t && e === void 0 || i.validation === "strict", t || e !== void 0, n.enteredComplexNumber);
                if (t) {
                  i._number = r;
                  let s = i._renderValue(r);
                  i.value = r.toString(), i.$.input.value = s;
                } else i._updateValue(r);
                i._programmaticValueIsSet = !1, i._disableComponents();
              }
              _handleNonNumericValue(t, e, i) {
                const a = this;
                if (a.inputFormat !== "integer") {
                  if (a._regexSpecial.nan.test(i)) return void a._handleNaN(t);
                  if (a._regexSpecial.inf.test(i)) return void a._handleInfinity(t, e, i);
                }
                if (t) {
                  let n = a._numericProcessor.createDescriptor(0);
                  a._number = a._validateRange(n);
                  const r = a._renderValue(a._number);
                  a.value = a._number.toString(), a.$.input.value = r;
                } else if (e === void 0) a.$.input.value = a._cachedInputValue;
                else {
                  const n = a._number.toString();
                  a.value !== n && (a.value = n);
                }
              }
              _handleNaN(t) {
                const e = this;
                if (e.$.input.value = "NaN", t) e.value = NaN, e._number = NaN;
                else {
                  const i = e.value;
                  i !== null && i.toString() === "NaN" || (e.value = NaN, e._number = NaN, e._cachedInputValue = "NaN", e._editableValue = "NaN", e._triggerChangeEvent && (e.$.fireEvent("change", { value: NaN, oldValue: i, radix: e._radixNumber }), e._updateTargetValue()));
                }
              }
              _handleInfinity(t, e, i) {
                const a = this;
                let n, r;
                if (i.charAt(0) === "-" ? (n = i.charAt(1) === "∞" ? "-∞" : "-Inf", r = -1 / 0) : (n = i.indexOf("∞") !== -1 ? "∞" : "Inf", r = 1 / 0), r === -1 / 0 && a.min === -1 / 0 || r === 1 / 0 && a.max === 1 / 0 || e !== void 0) if (t) a.value = r, a._number = r, a.$.input.value = n;
                else {
                  const s = a.value;
                  i !== n && (a.$.input.value = n), s !== r && (a.value = r, a._number = r, a._cachedInputValue = n, a._editableValue = n, a._triggerChangeEvent && (a.$.fireEvent("change", { value: r, oldValue: s, radix: a._radixNumber }), a._updateTargetValue()));
                }
                else r === -1 / 0 ? a._validate(!1, a.min) : a._validate(!1, a.max);
              }
              _updateTargetValue(t) {
                const e = this;
                if (e.dataset.target) {
                  const i = document.querySelector(e.dataset.target);
                  if (i) {
                    const a = e.dataset.property, n = e.value;
                    a && i[a] !== void 0 && (i[a] = t !== void 0 ? t : n);
                  }
                }
              }
              _validateRange(t) {
                const e = this;
                return t = e._numericProcessor.validate(t, e._minObject, e._maxObject);
              }
              propertyChangedHandler(t, e, i) {
                super.propertyChangedHandler(t, e, i);
                const a = this, n = a.$.input;
                function r() {
                  a._initialDropDownOptionsSet === !0 && a._setDropDownOptions(!0), a._radixNumber !== 2 && a._radixNumber !== 16 || (a._cachedInputValue = a._number.toString(a._radixNumber, a._wordLengthNumber, a.leadingZeros), a._editableValue = a._cachedInputValue, a.$.input.value = a._cachedInputValue);
                }
                if (i != e) switch (t) {
                  case "disabled":
                    a._setFocusable(), i === !0 ? (a.$.upButton.disabled = !0, a.$.downButton.disabled = !0) : a._disableComponents();
                    break;
                  case "dropDownAppendTo":
                    a._positionDetection.dropDownAppendToChangedHandler(), a.$.dropDown.removeAttribute("right-to-left"), a.rightToLeft && i !== null && a.$.dropDown.setAttribute("right-to-left", "");
                    break;
                  case "unfocusable":
                    a._setFocusable();
                    break;
                  case "enableMouseWheelAction":
                  case "placeholder":
                  case "readonly":
                  case "spinButtonsDelay":
                  case "spinButtonsInitialDelay":
                    break;
                  case "value": {
                    if (i === "" && e === null) return;
                    if (i === null || i === "" || e === null) return a.value = e, a._triggerChangeEvent = a.validation === "strict", a._validate(!1, i), a._triggerChangeEvent = !1, void (a._programmaticValueIsSet = !0);
                    const s = i.toString(), o = e.toString();
                    o !== s && (o.toUpperCase() === s.toUpperCase() && (a.value = e), a._triggerChangeEvent = a.validation === "strict", a._validate(!1, s), a._triggerChangeEvent = !1, a._programmaticValueIsSet = !0);
                    break;
                  }
                  case "radix":
                    a.inputFormat === "integer" ? a._changeRadix(i) : a.error(a.localize("integerOnly", { property: "radix" }));
                    break;
                  case "rightToLeft":
                    a.dropDownAppendTo !== null && (i ? a.$.dropDown.setAttribute("right-to-left", "") : a.$.dropDown.removeAttribute("right-to-left")), a.spinButtonsPosition = a.rightToLeft ? "left" : "right", a.spinButtonsPosition === "left" ? a.$.container.insertBefore(a.$.spinButtonsContainer, a.$.label.nextElementSibling) : a.$.container.insertBefore(a.$.spinButtonsContainer, a.$.dropDown), a._refreshShape();
                    break;
                  case "leadingZeros":
                    a.inputFormat === "integer" && a._number !== null && r();
                    break;
                  case "min":
                  case "max":
                    if (i !== null && (a[`_${t}IsNull`] = !1), a._numericProcessor.validateMinMax(t === "min", t === "max"), a.validation === "strict") a._triggerChangeEvent = !0, a._validate(!1, a.value), a._triggerChangeEvent = !1;
                    else if (a._regexSpecial.nonNumericValue.test(a.value) === !1) {
                      const s = a._numericProcessor.createDescriptor(a._number), o = a._validateRange(s);
                      a._numericProcessor.compare(a.value, o) === !0 && (a._programmaticValueIsSet = !0);
                    }
                    break;
                  case "opened":
                    i ? a.dropDownEnabled && !a.disabled && a.value !== null ? a._openRadix() : (a.opened = !1, a.$.radixDisplayButton.setAttribute("aria-expanded", !1)) : a._closeRadix(!1, !0);
                    break;
                  case "outputFormatString":
                    i ? (a._cachedInputValue = a._numberRenderer.formatNumber(a._number, i), a.$.input.value = a._cachedInputValue) : (a._cachedInputValue = a._editableValue, a.$.input.value = a._editableValue);
                    break;
                  case "dropDownEnabled":
                    i ? (a.inputFormat !== "integer" && a.error(a.localize("integerOnly", { property: "dropDownEnabled" })), a._initialDropDownOptionsSet === !0 && a._setDropDownOptions(!0)) : a.opened && a._closeRadix(!0);
                    break;
                  case "spinButtons":
                    i ? a.$spinButtonsContainer.removeClass("smart-hidden") : a.$spinButtonsContainer.addClass("smart-hidden"), a._refreshShape();
                    break;
                  case "spinButtonsStep":
                    a._updateSpinButtonsStepObject();
                    break;
                  case "significantDigits":
                  case "precisionDigits":
                    if (t === "precisionDigits" && a.inputFormat === "integer" && a.error(a.localize("noInteger", { property: t })), t === "significantDigits" && a.precisionDigits !== null ? a.precisionDigits = null : t === "precisionDigits" && a.significantDigits !== null && (a.significantDigits = null), a._regexSpecial.nonNumericValue.test(a.value) === !1) {
                      const s = a._renderValue(a._number);
                      n.value = s;
                    }
                    break;
                  case "decimalSeparator": {
                    a._numberRenderer.localizationObject.decimalseparator = a.decimalSeparator;
                    const s = a._discardDecimalSeparator(n.value, e), o = a._applyDecimalSeparator(s), l = a._applyDecimalSeparator(a._discardDecimalSeparator(a._editableValue, e));
                    n.value = o, a._editableValue = l;
                    break;
                  }
                  case "spinButtonsPosition":
                    i === "left" ? a.$.container.insertBefore(a.$.spinButtonsContainer, a.$.label.nextElementSibling) : a.$.container.insertBefore(a.$.spinButtonsContainer, a.$.dropDown), a._refreshShape();
                    break;
                  case "wordLength":
                    if (a._wordLengthNumber = a._numericProcessor.getWordLength(i), a.inputFormat === "integer" && (a._numericProcessor.validateMinMax(!0, !0), a._number !== null)) {
                      let s = a._validateRange(new Smart.Utilities.BigNumber(a._number));
                      a._updateValue(s), a.leadingZeros && r();
                    }
                    break;
                  case "radixDisplay":
                    i ? (a.inputFormat !== "integer" && a.error(a.localize("integerOnly", { property: "radixDisplay" })), a.$radixDisplayButton.removeClass("smart-hidden")) : a.$radixDisplayButton.addClass("smart-hidden"), a._refreshShape();
                    break;
                  case "radixDisplayPosition":
                    i === "left" ? a.$.container.insertBefore(a.$.radixDisplayButton, a.$.input) : a.$.container.insertBefore(a.$.radixDisplayButton, a.$.unitDisplay.nextElementSibling), a._refreshShape();
                    break;
                  case "inputFormat":
                    a._changeInputFormat(e, i);
                    break;
                  case "showUnit":
                    i ? a.$unitDisplay.removeClass("smart-hidden") : a.$unitDisplay.addClass("smart-hidden"), a._refreshShape();
                    break;
                  case "unit":
                    a.$.unitDisplay.innerHTML = i;
                    break;
                  case "scientificNotation":
                    if (a._regexSpecial.nonNumericValue.test(a.value) === !1) {
                      const s = a._renderValue(a._number);
                      n.value = s;
                    }
                    break;
                  case "locale":
                  case "messages":
                  case "showDropDownValues":
                    a.opened ? a._setDropDownOptions() : a._initialDropDownOptionsSet = !1;
                    break;
                  case "nullable":
                    e === !0 && a.value === null && a._validate(!1, "0");
                    break;
                  case "validation":
                    i === "strict" && (a._triggerChangeEvent = !0, a._validate(!1, a.value), a._triggerChangeEvent = !1);
                }
                else typeof i != "string" && typeof e == "string" && (a[t] = e);
                a._cachedInputValue = n.value;
              }
              _changeInputFormat(t, e) {
                const i = this;
                i._numericProcessor = new Smart.Utilities.NumericProcessor(i, "inputFormat"), t !== "complex" ? (e === "integer" && t === "floatingPoint" && i._changeFromFloatingPointToIntegerInputFormat(), e === "floatingPoint" && t === "integer" && i._changeFromIntegerToFloatingPointInputFormat(), e === "complex" && i._changeToComplexInputFormat(t), i._updateSpinButtonsStepObject(), i.value !== null && (i._inputFormatChangedFlag = !0, i._validate(void 0, i._number.toString()), i._inputFormatChangedFlag = !1)) : i._changeFromComplexInputFormat(e);
              }
              _changeFromComplexInputFormat(t) {
                const e = this;
                if (e.spinButtonsStep = e._spinButtonsStepObject.realPart, e._updateSpinButtonsStepObject(), t === "integer" ? (e.min === -1 / 0 ? e.min = null : e.min = e._minObject.realPart, e.max === 1 / 0 ? e.max = null : e.max = e._maxObject.realPart) : (e.min !== -1 / 0 && (e.min = e._minObject.realPart), e.max !== 1 / 0 && (e.max = e._maxObject.realPart)), e._numericProcessor.validateMinMax(!0, !0), e.value !== null) {
                  const i = e._number;
                  e._inputFormatChangedFlag = !0, e._validate(void 0, (i.realPart !== void 0 ? i.realPart : i).toString()), e._inputFormatChangedFlag = !1;
                }
              }
              _changeFromFloatingPointToIntegerInputFormat() {
                const t = this;
                t.min === -1 / 0 && (t.min = null), t.max === 1 / 0 && (t.max = null), t._numericProcessor.validateMinMax(!0, !0);
              }
              _changeFromIntegerToFloatingPointInputFormat() {
                const t = this;
                t.radixDisplay && (t.radixDisplay = !1, t.$radixDisplayButton.addClass("smart-hidden")), t._radixNumber !== 10 && (t.radix = 10, t._radixNumber = 10), t._minIsNull ? (t.min = -1 / 0, t._minObject = -1 / 0) : t._minObject = parseFloat(t._minObject.toString()), t._maxIsNull ? (t.max = 1 / 0, t._maxObject = 1 / 0) : t._maxObject = parseFloat(t._maxObject.toString()), t.dropDownEnabled && (t.dropDownEnabled = !1);
              }
              _changeToComplexInputFormat(t) {
                const e = this;
                t === "integer" && (e.radixDisplay && (e.radixDisplay = !1, e.$radixDisplayButton.addClass("smart-hidden")), e._minIsNull && (e.min = null), e._maxIsNull && (e.max = null), e.dropDownEnabled && (e.dropDownEnabled = !1)), e._numericProcessor.validateMinMax(e.min !== -1 / 0, e.max !== 1 / 0);
              }
              _updateValue(t) {
                const e = this, i = e.$.input.value, a = t.toString(e._radixNumber, e._wordLengthNumber, e.leadingZeros), n = e._renderValue(t), r = e.value, s = e._regexSpecial.nonNumericValue.test(a);
                if (i === a && i === e._cachedInputValue || (e.$.input.value = n, e._cachedInputValue = n), e._inputFormatChangedFlag || s && n !== r || s === !1 && e._numericProcessor.compare(t, e._number)) {
                  e._number = e._numericProcessor.createDescriptor(t);
                  const o = e._number.toString();
                  e.value = o, e._setDropDownOptions(!0), e._triggerChangeEvent && (e.$.fireEvent("change", { value: o, oldValue: r, radix: e._radixNumber }), e._updateTargetValue());
                } else e.value = e._number.toString();
              }
              _setValue(t) {
                const e = this;
                e.value = t, e.$.input.value = t, e._number = e._numericProcessor.createDescriptor(t, !0), e._setDropDownOptions(!0);
              }
              _changeRadix(t) {
                const e = this, i = e._getRadix(t), a = e.radix;
                if (i === e._radixNumber) return;
                e.radix = t, e._radixNumber = i;
                const n = e.$.input, r = n.value;
                let s, o;
                e.value !== null ? (s = e._number.toString(i, e._wordLengthNumber, e.leadingZeros), o = e._renderValue(s)) : o = "", n.value = o, e._cachedInputValue = o, e.$.radixDisplayButton.innerHTML = e._radixPrefixes[i], e.$.fireEvent("radixChange", { radix: t, oldRadix: a, displayedValue: o, oldDisplayedValue: r });
              }
              _openRadix() {
                const t = this;
                if (t.$.fireEvent("opening").defaultPrevented) return void (t.opened = !1);
                t._initialDropDownOptionsSet === !1 && (t._setDropDownOptions(), t._initialDropDownOptionsSet = !0), t._dropDownParent !== null && (t.$.dropDown.style.width = t.offsetWidth + "px"), t.$radixDisplayButton.addClass("smart-numeric-text-box-pressed-component"), t.$dropDown.removeClass("smart-visibility-hidden"), t.$.dropDown.style.marginTop = null, t.opened = !0, t._positionDetection.positionDropDown();
                const e = (window.devicePixelRatio === 1 ? document.documentElement.clientHeight : window.innerHeight) - t.$.dropDown.getBoundingClientRect().top - t.$.dropDown.offsetHeight - parseFloat(getComputedStyle(t.$.dropDown).marginBottom);
                e < 0 && (t.$.dropDown.style.marginTop = e + "px"), t.$.fireEvent("open", { dropDown: t.$.dropDown }), t.$.radixDisplayButton.setAttribute("aria-expanded", !0);
              }
              _closeRadix(t, e) {
                const i = this;
                (i.opened || e) && (!i.$.fireEvent("closing").defaultPrevented || t ? (i.$radixDisplayButton.removeClass("smart-numeric-text-box-pressed-component"), i.$dropDown.addClass("smart-visibility-hidden"), i.opened = !1, i.$.fireEvent("close", { dropDown: i.$.dropDown }), i.$.radixDisplayButton.setAttribute("aria-expanded", !1)) : i.opened = !0);
              }
              _isLeftButtonPressed(t) {
                const e = t.buttons === 0 || t.which === 1;
                return t.detail.buttons === 1 || e;
              }
              _isIncrementOrDecrementAllowed() {
                const t = this;
                return !t.disabled && !t.readonly && t._regexSpecial.nonNumericValue.test(t.$.input.value) === !1;
              }
              _upButtonClickHandler(t) {
                const e = this;
                e._isLeftButtonPressed(t) && e._isIncrementOrDecrementAllowed() && (e._up || e.$upButton.addClass("smart-numeric-text-box-pressed-component"), e._incrementOrDecrement("add"));
              }
              _downButtonClickHandler(t) {
                const e = this;
                e._isLeftButtonPressed(t) && e._isIncrementOrDecrementAllowed() && (e._up || e.$downButton.addClass("smart-numeric-text-box-pressed-component"), e._incrementOrDecrement("subtract"));
              }
              _documentMousedownHandler(t) {
                const e = this;
                if (e._up = !1, !e.opened) return;
                let i = t.originalEvent.target;
                (e.shadowRoot || e.isInShadowDOM) && (i = t.originalEvent.composedPath()[0]), (e.shadowRoot || e).contains(i) || e.$.dropDown.contains(i) || e._closeRadix();
              }
              _documentMouseupHandler() {
                const t = this;
                t._up = !0, t.$upButton.removeClass("smart-numeric-text-box-pressed-component"), t.$downButton.removeClass("smart-numeric-text-box-pressed-component");
              }
              _radixDisplayButtonClickHandler() {
                const t = this;
                t.dropDownEnabled && !t.disabled && t.value !== null && (t.opened ? t._closeRadix() : t._openRadix());
              }
              _dropDownItemClickHandler(t) {
                if (t.target.$.hasClass("smart-list-item")) {
                  const e = this;
                  let i = t.target.getAttribute("data-value");
                  e._changeRadix(parseInt(i, 10)), e._closeRadix();
                }
              }
              _mouseenterMouseleaveHandler(t) {
                const e = this;
                t.target === e.$.dropDown || e.disabled || e.readonly || (t.type === "mouseenter" ? t.target.setAttribute("hover", "") : t.target.removeAttribute("hover"));
              }
              _inputKeydownHandler(t) {
                const e = this, i = t.charCode ? t.charCode : t.which;
                i === 40 && e._isIncrementOrDecrementAllowed() ? e._incrementOrDecrement("subtract") : i === 38 && e._isIncrementOrDecrementAllowed() && e._incrementOrDecrement("add"), e._keydownInfo = { value: e.$.input.value, specialKey: t.altKey || t.ctrlKey || t.shiftKey };
              }
              _inputKeyupHandler(t) {
                const e = this;
                if (t.keyCode === 13) e._suppressBlurEvent = !0, e.$.input.value !== e._cachedInputValue && (e._triggerChangeEvent = !0, e._validate(), e._triggerChangeEvent = !1, e.$.input.blur());
                else if (t.keyCode === 27) e.$.input.value = e._editableValue;
                else {
                  const i = e.$.input.value;
                  i !== "" && e._regex[e._radixNumber].test(i) ? (e.$.upButton.disabled = !1, e.$.downButton.disabled = !1) : i === "" && (e.$.upButton.disabled = !0, e.$.downButton.disabled = !0), !e._keydownInfo || e._keydownInfo.value === i || e._keydownInfo.specialKey || t.altKey || t.ctrlKey || t.shiftKey || t.key === "Control" || (e.$.fireEvent("changing", { currentValue: i, validValue: e.value, radix: e._radixNumber }), e._updateTargetValue(i));
                }
                t.preventDefault();
              }
              _inputBlurHandler() {
                const t = this;
                t._suppressBlurEvent === !0 ? (t._suppressBlurEvent = !1, t._formattedValue && (t._cachedInputValue = t._formattedValue, t.$.input.value = t._formattedValue, delete t._formattedValue)) : t.$.input.value !== t._editableValue ? (t._triggerChangeEvent = !0, t._validate(), t._triggerChangeEvent = !1) : t.$.input.value = t._cachedInputValue, t.radixDisplay && t.$.radixDisplayButton.removeAttribute("focus"), t.opened && t._closeRadix(), t.spinButtons && t.$.spinButtonsContainer.removeAttribute("focus"), t.showUnit && t.$.unitDisplay.removeAttribute("focus"), t.removeAttribute("focus"), t.$.fireEvent("blur");
              }
              _inputFocusHandler() {
                const t = this;
                t.spinButtons && t.$.spinButtonsContainer.setAttribute("focus", ""), t.radixDisplay && t.$.radixDisplayButton.setAttribute("focus", ""), t.showUnit && t.$.unitDisplay.setAttribute("focus", ""), t.opened && t._closeRadix(), t.setAttribute("focus", ""), t.outputFormatString && (t.$.input.value = t._editableValue), t.$.fireEvent("focus");
              }
              _inputChangeHandler(t) {
                t.stopPropagation(), t.preventDefault();
              }
              _inputPasteHandler() {
                const t = this;
                requestAnimationFrame((() => t.$.fireEvent("changing", { currentValue: t.$.input.value, validValue: t.value, radix: t._radixNumber })));
              }
              _inputWheelHandler(t) {
                const e = this, i = e.shadowRoot && e.shadowRoot.activeElement || document.activeElement;
                e.$.input === i && e.enableMouseWheelAction && e._isIncrementOrDecrementAllowed() && (t.stopPropagation(), t.preventDefault(), t.wheelDelta > 0 ? e._incrementOrDecrement("add") : e._incrementOrDecrement("subtract"));
              }
              _getRadix(t) {
                switch (t.toString()) {
                  case "10":
                  case "decimal":
                    return 10;
                  case "2":
                  case "binary":
                    return 2;
                  case "8":
                  case "octal":
                    return 8;
                  case "16":
                  case "hexadecimal":
                    return 16;
                }
              }
              _setDropDownOptions(t) {
                const e = this;
                if (e.dropDownEnabled === !1 || e._number === null) return;
                if (!e.showDropDownValues)
                  return t ? void 0 : (e.$.dropDownItem2.innerHTML = e.localize("binary"), e.$.dropDownItem8.innerHTML = e.localize("octal"), e.$.dropDownItem10.innerHTML = e.localize("decimal"), void (e.$.dropDownItem16.innerHTML = e.localize("hexadecimal")));
                const i = e._wordLengthNumber, a = e.leadingZeros;
                e.$.dropDownItem2.innerHTML = `${e._number.toString(2, i, a)} (${e.localize("binary")})`, e.$.dropDownItem8.innerHTML = `${e._number.toString(8, i)} (${e.localize("octal")})`, e.$.dropDownItem10.innerHTML = `${e._renderValue(e._number.toString(10, i), !0)} (${e.localize("decimal")})`, e.$.dropDownItem16.innerHTML = `${e._number.toString(16, i, a)} (${e.localize("hexadecimal")})`;
              }
              _incrementOrDecrement(t) {
                const e = this, i = e.shadowRoot && e.shadowRoot.activeElement || document.activeElement;
                let a = e._cachedInputValue;
                if (e.$.input === i && (a = e._editableValue, e._suppressBlurEvent = !0), (e.$.input.value !== a || e._programmaticValueIsSet && e.validation === "interaction") && (e._triggerChangeEvent = !0, e._validate(), e._triggerChangeEvent = !1, e._isIncrementOrDecrementAllowed() === !1)) return;
                const n = e._numericProcessor.incrementDecrement(e._number, t, e._spinButtonsStepObject), r = e._validateRange(n);
                e._triggerChangeEvent = !0, e._updateValue(r), e._triggerChangeEvent = !1;
              }
              _toBigNumberDecimal(t, e) {
                const i = this;
                let a;
                return e === 10 ? a = new Smart.Utilities.BigNumber(t) : i._unsigned || i._isNegative(t, e) === !1 ? i._wordLengthNumber < 64 ? (a = parseInt(t, e), a = new Smart.Utilities.BigNumber(a)) : a = i._getBigNumberFrom64BitBinOctHex(t, e) : (a = i._getNegativeDecimal(t, e), a = new Smart.Utilities.BigNumber(a)), a;
              }
              _isNegative(t, e) {
                const i = this, a = t.length, n = t.charAt(0).toLowerCase();
                if (e === 2) return a === i._wordLengthNumber && n === "1";
                if (e !== 8) return a === i._wordLengthNumber / 4 && ["8", "9", "a", "b", "c", "d", "e", "f"].indexOf(n) !== -1;
                switch (i._wordLengthNumber) {
                  case 8:
                    return a === 3 && (n === "2" || n === "3");
                  case 16:
                    return a === 5 && n === "1";
                  case 32:
                    return a === 11 && (n === "2" || n === "3");
                  case 64:
                    return a === 22 && n === "1";
                }
              }
              _getBigNumberFrom64BitBinOctHex(t, e) {
                let i = new Smart.Utilities.BigNumber(0);
                for (let a = t.length - 1; a >= 0; a--) {
                  let n = new Smart.Utilities.BigNumber(parseInt(t.charAt(a), e));
                  i = i.add(n.multiply(new Smart.Utilities.BigNumber(e).pow(t.length - 1 - a)));
                }
                return i;
              }
              _getNegativeDecimal(t, e) {
                const i = this;
                let a = t;
                if (e === 8) {
                  let r = [];
                  for (let s = 0; s < t.length; s++) {
                    let o = parseInt(t.charAt(s), 8).toString(2);
                    for (; o.length !== 3; ) o = `0${o}`;
                    r.push(o);
                  }
                  for (a = r.join(""); a.charAt(0) === "0"; ) a = a.slice(1);
                } else if (e === 16) {
                  let r = [];
                  for (let s = 0; s < t.length; s++) {
                    let o = parseInt(t.charAt(s), 16).toString(2);
                    for (; o.length !== 4; ) o = `0${o}`;
                    r.push(o);
                  }
                  a = r.join("");
                }
                let n = a.replace(/0/g, "a");
                return n = n.replace(/1/g, "b"), n = n.replace(/a/g, "1"), n = n.replace(/b/g, "0"), this._wordLengthNumber < 64 ? n = -1 * (parseInt(n, 2) + 1) : (n = i._getBigNumberFrom64BitBinOctHex(n, e), n = n.add(1).negate()), n;
              }
              _discardDecimalSeparator(t, e) {
                if (e === void 0 && (e = this.decimalSeparator), e !== "." && t !== 1 / 0 && t !== -1 / 0) {
                  let i = new RegExp(e, "g");
                  return t.replace(i, ".");
                }
                return t;
              }
              _applyDecimalSeparator(t) {
                const e = this;
                return typeof t != "string" && (t = t.toString()), e.decimalSeparator !== "." && (t = t.replace(/\./g, e.decimalSeparator)), t;
              }
              _renderValue(t, e) {
                const i = this, a = t, n = i._radixNumber === 10 || e === !0;
                if (t = i._numericProcessor.render(t, n), i.decimalSeparator !== "." && n && (t = i._applyDecimalSeparator(t)), e !== !0 && (i._editableValue = t, i.outputFormatString && i._radixNumber === 10)) {
                  const r = (i.shadowRoot || i.getRootNode()).activeElement || document.activeElement, s = i._numberRenderer.formatNumber(a, i.outputFormatString);
                  if (r !== i.$.input) return s;
                  i._formattedValue = s;
                }
                return t;
              }
              _setFocusable() {
                const t = this;
                t.disabled || t.unfocusable ? t.$.input.tabIndex = -1 : t.$.input.removeAttribute("tabindex");
              }
              _disableComponents() {
                const t = this;
                if (t.disabled) return;
                const e = t.value;
                e === null || e.toString() === "NaN" || Math.abs(e) === 1 / 0 ? (t.$.upButton.disabled = !0, t.$.downButton.disabled = !0) : (t.$.upButton.disabled = !1, t.$.downButton.disabled = !1);
              }
              _resizeHandler() {
                this.refresh();
              }
              refresh() {
                const t = this;
                t.opened && t._closeRadix(!0);
              }
            });
          })
        ),
        /***/
        9135: (
          /***/
          (() => {
            Smart("smart-scroll-bar", class extends Smart.BaseElement {
              static get properties() {
                return { clickRepeatDelay: { type: "integer", value: 50 }, largeStep: { type: "integer", value: 100 }, min: { type: "integer", value: 0 }, max: { type: "integer", value: 1e3 }, mechanicalAction: { value: "switchWhileDragging", allowedValues: ["switchUntilReleased", "switchWhenReleased", "switchWhileDragging"], type: "string" }, orientation: { type: "string", value: "horizontal", allowedValues: ["horizontal", "vertical"] }, step: { type: "integer", value: 10 }, showButtons: { type: "boolean", value: !0, defaultReflectToAttribute: !0 }, value: { type: "integer", value: 0 } };
              }
              static get styleUrls() {
                return ["smart.scrollbar.css"];
              }
              template() {
                return `<div id="container" class="smart-container" role="presentation">
                    <div id="nearButton" class="smart-scroll-button smart-arrow-left" role="presentation" aria-hidden="true"></div>
                    <div  id="track" class="smart-track" role="presentation">
                        <div id="thumb" class="smart-thumb" role="presentation"></div>
                    </div>
                    <div id="farButton" class="smart-scroll-button smart-arrow-right" role="presentation" aria-hidden="true"></div>
            </div>`;
              }
              static get listeners() {
                return { "nearButton.click": "_nearButtonClickHandler", "nearButton.down": "_startRepeat", "nearButton.up": "_stopRepeat", "nearButton.pointerenter": "_updateInBoundsFlag", "nearButton.pointerleave": "_updateInBoundsFlag", "farButton.click": "_farButtonClickHandler", "farButton.down": "_startRepeat", "farButton.up": "_stopRepeat", "farButton.pointerenter": "_updateInBoundsFlag", "farButton.pointerleave": "_updateInBoundsFlag", "track.down": "_trackDownHandler", "track.click": "_trackClickHandler", "track.move": "_trackMoveHandler", "thumb.down": "_dragStartHandler", "document.move": "_dragHandler", "document.up": "_dragEndHandler", up: "_dragEndHandler", "document.selectstart": "_selectStartHandler", resize: "_resizeHandler" };
              }
              _updateInBoundsFlag(t) {
                const e = this, i = t.target;
                i._isPointerInBounds = !0, t.type.indexOf("leave") !== -1 && (i._isPointerInBounds = !1), ("buttons" in t ? t.buttons : t.which) !== 1 && e._stopRepeat(t);
              }
              _startRepeat(t) {
                const e = this;
                if (e.disabled) return;
                const i = t.target;
                i._initialTimer || (i._initialTimer = setTimeout((function() {
                  i._repeatTimer = setInterval((() => {
                    if (i._isPointerInBounds) {
                      const a = "buttons" in t ? t.buttons : t.which;
                      i.$.fireEvent("click", { buttons: a, clientX: t.clientX, clientY: t.clientY, pageX: t.pageX, pageY: t.pageY, screenX: t.screenX, screenY: t.screenY });
                    }
                  }), e.clickRepeatDelay);
                }), 3 * e.clickRepeatDelay));
              }
              _stopRepeat(t) {
                if (this.disabled) return;
                const e = t.target;
                e._repeatTimer && (clearInterval(e._repeatTimer), e._repeatTimer = null), e._initialTimer && (clearTimeout(e._initialTimer), e._initialTimer = null);
              }
              _calculateThumbSize(t) {
                const e = this, i = e.max - e.min, a = e.orientation === "horizontal" ? e.$.track.offsetWidth > 10 : e.$.track.offsetHeight > 10;
                let n = 0;
                return i >= 1 && a ? (n = t / (i + t) * t, e.$.thumb.className.indexOf("smart-hidden") >= 0 && e.$thumb.removeClass("smart-hidden")) : e.$thumb.addClass("smart-hidden"), Math.max(10, Math.min(n, t));
              }
              _dragStartHandler(t) {
                const e = this;
                e.disabled || (e.thumbCapture = !0, e.dragStartX = t.clientX, e.dragStartY = t.clientY, e.dragStartValue = e.value, t.stopPropagation(), t.preventDefault());
              }
              _dragHandler(t) {
                const e = this;
                if (e.thumbCapture !== !0) return;
                e._isThumbDragged = !0;
                const i = (e.max - e.min) / (e.scrollBarSize - e.thumbSize), a = e.orientation === "horizontal" ? (t.clientX - e.dragStartX) * i : (t.clientY - e.dragStartY) * i;
                let n = a;
                e.rightToLeft && e.orientation === "horizontal" && (n = -a), e._updateValue(e.dragStartValue + n), t.stopPropagation(), t.preventDefault(), t.originalEvent && (t.originalEvent.stopPropagation(), t.originalEvent.preventDefault());
              }
              _dragEndHandler(t) {
                const e = this;
                e._trackDownTimer && (clearInterval(e._trackDownTimer), e._trackDownTimer = null), e.thumbCapture && (e.thumbCapture = !1, e._isThumbDragged = !1, e.mechanicalAction === "switchWhenReleased" ? e._updateValue(e.dragStartValue, e.value) : this.mechanicalAction === "switchUntilReleased" && e._updateValue(e.dragStartValue), t.preventDefault(), t.stopPropagation(), t.originalEvent.preventDefault(), t.originalEvent.stopPropagation());
              }
              _farButtonClickHandler() {
                const t = this;
                if (t.disabled) return;
                const e = t.value;
                t._updateValue(t.value + (t.orientation === "horizontal" && t.rightToLeft ? -1 : 1) * t.step), t.mechanicalAction === "switchUntilReleased" && t._updateValue(e);
              }
              _nearButtonClickHandler() {
                const t = this;
                if (t.disabled) return;
                const e = t.value;
                t._updateValue(t.value - (t.orientation === "horizontal" && t.rightToLeft ? -1 : 1) * t.step), t.mechanicalAction === "switchUntilReleased" && t._updateValue(e);
              }
              propertyChangedHandler(t, e, i) {
                super.propertyChangedHandler(t, e, i);
                const a = this;
                switch (t) {
                  case "min":
                  case "max":
                  case "orientation":
                  case "showButtons":
                    a._layout(), t === "min" ? a.setAttribute("aria-valuemin", i) : t === "max" ? a.setAttribute("aria-valuemax", i) : t === "orientation" && a.setAttribute("aria-orientation", i);
                    break;
                  case "value":
                    a._updateValue(e, i);
                    break;
                  default:
                    a._layout();
                }
              }
              render() {
                const t = this;
                t.setAttribute("role", "scrollbar"), t.setAttribute("aria-orientation", t.orientation), t.setAttribute("aria-valuemin", t.min), t.setAttribute("aria-valuemax", t.max), t.setAttribute("aria-valuenow", t.value), t._layout(), super.render();
              }
              _resizeHandler() {
                this._layout();
              }
              refresh() {
                this._layout();
              }
              beginUpdate() {
                this._isUpdating = !0;
              }
              endUpdate() {
                this._isUpdating = !1, this.refreshValue();
              }
              refreshValue() {
                const t = this;
                t._layout(), t._updateValue(t.value);
              }
              _layout() {
                const t = this;
                t._isUpdating || (t.scrollBarSize = t.orientation === "horizontal" ? t.$.track.offsetWidth : t.$.track.offsetHeight, t.thumbSize = t._calculateThumbSize(t.scrollBarSize), t.orientation === "horizontal" && t.$.thumb.style.width !== t.thumbSize + "px" ? t.$.thumb.style.width = t.thumbSize + "px" : t.orientation === "vertical" && t.$.thumb.style.height !== t.thumbSize + "px" && (t.$.thumb.style.height = t.thumbSize + "px"), t.orientation === "horizontal" ? (t.$.nearButton.classList.contains("smart-arrow-up") && t.$.nearButton.classList.remove("smart-arrow-up"), t.$.farButton.classList.contains("smart-arrow-down") && t.$.farButton.classList.remove("smart-arrow-down"), t.$.nearButton.classList.contains("smart-arrow-left") || t.$.nearButton.classList.add("smart-arrow-left"), t.$.farButton.classList.contains("smart-arrow-right") || t.$.farButton.classList.add("smart-arrow-right")) : (t.$.nearButton.classList.contains("smart-arrow-left") && t.$.nearButton.classList.remove("smart-arrow-left"), t.$.farButton.classList.contains("smart-arrow-right") && t.$.farButton.classList.remove("smart-arrow-right"), t.$.nearButton.classList.contains("smart-arrow-up") || t.$.nearButton.classList.add("smart-arrow-up"), t.$.farButton.classList.contains("smart-arrow-down") || t.$.farButton.classList.add("smart-arrow-down")), t._updateThumbPosition(), (t.value > t.max || t.value < t.min) && t._updateValue(t.value, t.value > t.max ? t.max : t.min));
              }
              _selectStartHandler(t) {
                this.thumbCapture && t.preventDefault();
              }
              _trackDownHandler(t) {
                const e = this;
                t.target === e.$.track && (e._trackDownTimer && clearInterval(e._trackDownTimer), e.thumbCapture || (e._trackDownTimer = setInterval((function() {
                  e._trackClickHandler(t);
                }), e.clickRepeatDelay), t.stopPropagation(), t.preventDefault()));
              }
              _trackClickHandler(t) {
                const e = this;
                if (e.disabled) return;
                if (e._isThumbDragged) return clearInterval(e._trackDownTimer), void (e._trackDownTimer = null);
                const i = e.$.thumb.getBoundingClientRect(), a = t.pageX - window.pageXOffset, n = t.pageY - window.pageYOffset, r = (e.rightToLeft ? -1 : 1) * e.value;
                e.orientation === "horizontal" ? a > (e._isThumbDragged ? e.dragStartX : i.right) ? e._updateValue(e.value + (e.rightToLeft ? -1 : 1) * e.largeStep) : a < (e._isThumbDragged ? e.dragStartX : i.left) && e._updateValue(e.value - (e.rightToLeft ? -1 : 1) * e.largeStep) : n > (e._isThumbDragged ? e.dragStartY : i.bottom) ? e._updateValue(e.value + e.largeStep) : n < (e._isThumbDragged ? e.dragStartY : i.top) && e._updateValue(e.value - e.largeStep), e.mechanicalAction === "switchUntilReleased" && e._updateValue(r);
              }
              _trackMoveHandler(t) {
                t.originalEvent.type === "touchmove" && t.originalEvent.preventDefault();
              }
              _updateValue(t, e) {
                const i = this;
                if (!i._isUpdating && (arguments.length === 1 && (e = t, t = i.value), (e === void 0 || isNaN(e)) && (e = i.min), e > i.max && (e = i.max), e < i.min && (e = i.min), i.value = e, t !== e)) {
                  if (i.setAttribute("aria-valuenow", e), i._updateThumbPosition(), i.thumbCapture && i.mechanicalAction === "switchWhenReleased") return;
                  if (i.onChange) return void i.onChange({ value: i.value, oldValue: t, min: i.min, max: i.max, context: i });
                  i.$.fireEvent("change", { value: i.value, oldValue: t, min: i.min, max: i.max });
                }
              }
              _updateThumbPosition() {
                const t = this, e = t.orientation === "horizontal" ? t.$.track.offsetWidth : t.$.track.offsetHeight, i = t._calculateThumbSize(e), a = e - i;
                let n = (e - i) / (t.max - t.min) * (t.value - t.min);
                t.rightToLeft && t.orientation === "horizontal" && (n = (e - i) / (t.max - t.min) * (t.max - t.value - t.min)), n = Math.min(a, Math.max(0, n)), t.orientation === "vertical" && t.$.thumb.style.top !== n + "px" ? t.$.thumb.style.top = n + "px" : t.orientation === "horizontal" && t.$.thumb.style.left !== n + "px" && (t.$.thumb.style.left = n + "px");
              }
            });
          })
        ),
        /***/
        5478: (
          /***/
          (() => {
            Smart("smart-tank", class extends Smart.BaseElement {
              static get properties() {
                return { coerce: { value: !1, type: "boolean" }, customInterval: { value: !1, type: "boolean" }, customTicks: { reflectToAttribute: !1, value: ["0", "50", "100"], type: "array" }, dateLabelFormatString: { value: "d", type: "string" }, decimalSeparator: { value: ".", type: "string" }, interval: { value: "1", type: "any" }, inverted: { value: !1, type: "boolean" }, labelFormatFunction: { value: null, type: "function?" }, labelsVisibility: { value: "all", allowedValues: ["all", "endPoints", "none"], type: "string" }, logarithmicScale: { value: !1, type: "boolean" }, max: { value: "100", type: "any" }, mechanicalAction: { value: "switchWhileDragging", allowedValues: ["switchUntilReleased", "switchWhenReleased", "switchWhileDragging"], type: "string" }, messages: { value: { en: { missingReference: "{{elementType}}: Missing reference to {{files}}.", significantPrecisionDigits: "{{elementType}}: the properties significantDigits and precisionDigits cannot be set at the same time.", invalidMinOrMax: "{{elementType}}: Invalid {{property}} value. Max cannot be lower than Min.", noInteger: '{{elementType}}: precisionDigits could be set only on "floatingPoint" scaleType.' } }, type: "object", extend: !0 }, min: { value: "0", type: "any" }, mode: { value: "numeric", allowedValues: ["numeric", "date"], type: "string" }, name: { value: "", type: "string" }, orientation: { value: "vertical", allowedValues: ["horizontal", "vertical"], type: "string" }, precisionDigits: { value: null, type: "number?" }, scalePosition: { value: "near", allowedValues: ["near", "far", "both", "none"], type: "string" }, scaleType: { value: "floatingPoint", allowedValues: ["floatingPoint", "integer"], type: "string" }, scientificNotation: { value: !1, type: "boolean" }, showThumbLabel: { value: !1, type: "boolean" }, showTooltip: { value: !1, type: "boolean" }, showUnit: { value: !1, type: "boolean" }, significantDigits: { value: null, type: "number?" }, thumbLabelPosition: { value: "near", allowedValues: ["near", "far"], type: "string" }, ticksPosition: { value: "scale", allowedValues: ["scale", "track"], type: "string" }, ticksVisibility: { value: "minor", allowedValues: ["major", "minor", "none"], type: "string" }, tooltipPosition: { value: "near", allowedValues: ["near", "far"], type: "string" }, unit: { defaultReflectToAttribute: !0, value: "kg", type: "string" }, validation: { value: "strict", allowedValues: ["strict", "interaction"], type: "string" }, value: { value: "0", type: "any" }, wordLength: { value: "int32", allowedValues: ["int8", "uint8", "int16", "uint16", "int32", "uint32", "int64", "uint64"], type: "string" } };
              }
              static get listeners() {
                return { "track.down": "_trackDownHandler", "track.move": "_trackMoveHandler", "document.move": "_documentMoveHandler", "document.up": "_documentUpHandler", keydown: "_keydownHandler", resize: "_resizeHandler", styleChanged: "_styleChangedHandler", "document.selectstart": "_selectStartHandler", "track.mouseenter": "_trackOnMouseEnterHandler", "track.mouseleave": "_trackOnMouseLeaveHandler" };
              }
              static get requires() {
                return { "Smart.Utilities.BigNumber": "smart.math.js", "Smart.Utilities.NumericProcessor": "smart.numeric.js", "Smart.Utilities.TickIntervalHandler": "smart.tickintervalhandler.js" };
              }
              static get styleUrls() {
                return ["smart.tank.css"];
              }
              template() {
                return `<div id="container" class="smart-container" role="presentation">
                    <div id="scaleNear" class="smart-scale smart-scale-near" role="presentation" aria-hidden="true"></div>
                    <div id="track" class="smart-track" role="presentation">
                        <div id="fill" class="smart-value" role="presentation">
                            <div id="bubbleContainer" class="smart-bubble-container" role="presentation"></div>
                            <div id="tooltip" class="smart-tooltip" role="tooltip"><div id="tooltipContent" class="smart-tooltip-content smart-unselectable" role="presentation"></div></div>
                            <div id="thumb" class="smart-thumb">
                                <div class="smart-thumb-label-container">
                                    <span id="thumbLabel" class="smart-thumb-label"></span>
                                </div>
                            </div>
                        </div>
                        <div id="trackTicksContainer" class="smart-track-ticks-container smart-hidden" role="presentation"></div>
                    </div>
                    <div id="scaleFar" class="smart-scale smart-scale-far" role="presentation" aria-hidden="true"></div>
                    <input id="hiddenInput" type="hidden" name="[[name]]">
                </div>`;
              }
              ready() {
                super.ready(), this._redefineProperty("customTicks"), this.checkLicense();
              }
              render() {
                const t = this;
                t.setAttribute("role", "slider"), t.setAttribute("aria-label", "Tank"), this._createElement(), t.enableShadowDOM && t.$.hiddenInput && t.appendChild(t.$.hiddenInput), super.render();
              }
              _createElement() {
                const t = this;
                t.$.tooltip.id || (t.$.tooltip.id = t.id + "Tooltip"), t.setAttribute("aria-describedby", t.$.tooltip.id), t.$.fill.style.transition = "none", t.mode === "numeric" ? t._getEventValue = function() {
                  return t.value;
                } : t._handleDateScale(), t._setSettingsObject(), t._setDrawVariables(), t._getLayoutType(), t._numericProcessor = new Smart.Utilities.NumericProcessor(t, "scaleType"), t._numberRenderer = new Smart.Utilities.NumberRenderer(), t._isVisible() ? (t._renderingSuspended = !1, t._setInitialComponentDisplay(), t._measurements = {}, t._wordLengthNumber = t._numericProcessor.getWordLength(t.wordLength), t._validateInitialPropertyValues(), t._setTicksAndInterval(), t._validate(!0), t._updateTooltipValue(t._drawValue), t._setFocusable(), t._setTrackSize(), t._setBubbles(), t.$.fill.style.transition = "", t.$.hiddenInput.value = t._getEventValue(), t.setAttribute("aria-orientation", t.orientation), t._setAriaValue("valuenow")) : t._renderingSuspended = !0;
              }
              val(t) {
                const e = this;
                if (t === void 0) return e._getEventValue();
                if (e.mode === "date") {
                  let i = Smart.Utilities.DateTime.validateDate(t);
                  return i = i.getTimeStamp(), i.compare(e.value) !== 0 ? void e._validate(!1, i, void 0, !0) : e._valueDate;
                }
                if (e.value.toString().toUpperCase() === t.toString().toUpperCase()) return e.value = typeof t == "string" ? t : t.toString();
                {
                  t = t.toString().replace(/\s/g, ""), e._numericProcessor.regexScientificNotation.test(t) && (t = e._numericProcessor.scientificToDecimal(t));
                  const i = e._discardDecimalSeparator(t.toString());
                  e._validate(!1, i, void 0, !0), delete e._valueBeforeCoercion;
                }
              }
              _setBubbles() {
                if (!this.hasAnimation) return;
                let t, e = document.createDocumentFragment();
                for (let i = 0; i < 5; i++) t = document.createElement("div"), t.classList.add("bubble"), t.classList.add("bubble" + (i + 1)), e.appendChild(t);
                this.$.bubbleContainer.appendChild(e);
              }
              _setTrackSize() {
                const t = this;
                t.orientation === "vertical" ? t._trackSize = t.$.track.offsetWidth : t._trackSize = t.$.track.offsetHeight;
              }
              getOptimalSize() {
                const t = this;
                if (t._renderingSuspended) return { width: 0, height: 0 };
                let e, i, a;
                switch (t.labelsVisibility) {
                  case "all":
                    i = t._numericProcessor._longestLabelSize;
                    break;
                  case "endPoints":
                    i = Math.max(t._tickIntervalHandler.labelsSize.minLabelOtherSize, t._tickIntervalHandler.labelsSize.maxLabelOtherSize);
                    break;
                  case "none":
                    i = 0;
                }
                switch (t.orientation) {
                  case "horizontal":
                    return e = { marginA: "marginBottom", marginB: "marginTop", nearScaleDistance: "bottom", farScaleDistance: "top", paddingA: "paddingBottom", paddingB: "paddingTop", offset: "offsetWidth", distance: "left" }, t._orientationChanged && (e.offset = "offsetHeight", t._trackChanged = !0), a = t._getSize(i, e), { width: a.optimalOtherSize, height: a.optimalSize };
                  case "vertical":
                    return e = { marginA: "marginLeft", marginB: "marginRight", nearScaleDistance: "right", farScaleDistance: "left", paddingA: "paddingLeft", paddingB: "paddingRight", offset: "offsetHeight", distance: "top" }, t._orientationChanged && (e.offset = "offsetWidth", t._trackChanged = !0), a = t._getSize(i, e), { width: a.optimalSize, height: a.optimalOtherSize };
                }
              }
              _updateTargetValue() {
                const t = this;
                if (t.dataset.target) {
                  const e = document.querySelector(t.dataset.target);
                  if (e) {
                    const i = t.dataset.property, a = t.value;
                    i && e[i] !== void 0 && (e[i] = a);
                  }
                }
              }
              propertyChangedHandler(t, e, i) {
                super.propertyChangedHandler(t, e, i);
                const a = this;
                if (a._isVisible() && !a._renderingSuspended) if (i != e) switch (t) {
                  case "labelsVisibility":
                  case "ticksVisibility":
                    return void a._updateScaleWidth(a._numericProcessor._longestLabelSize);
                  case "coerce":
                    if (i) {
                      const n = a.value, r = i = a.logarithmicScale ? Math.pow(10, a._numericProcessor.getCoercedValue(Math.log10(n))) : a._numericProcessor.getCoercedValue(n);
                      a._validate(!1, r, !0, !0), a._valueBeforeCoercion = n;
                    } else a._valueBeforeCoercion !== void 0 && a._validate(!1, a._valueBeforeCoercion, !1, !0);
                    return;
                  case "interval": {
                    a._numericProcessor.validateInterval(i);
                    const n = i = a.logarithmicScale ? Math.pow(10, a._numericProcessor.getCoercedValue(Math.log10(a.value))) : a._numericProcessor.getCoercedValue(a.value);
                    a._validate(!1, n, a.coerce, !0);
                    break;
                  }
                  case "min":
                  case "max": {
                    a.mode === "date" && (delete a._dateInterval, a[t] = Smart.Utilities.DateTime.validateDate(i).getTimeStamp()), a._validateMinMax(t, !1, e);
                    const n = a._numericProcessor.createDescriptor(a._discardDecimalSeparator(a.value, a.decimalSeparator), void 0, !0, a.validation === "strict");
                    a._setTicksAndInterval(), a._numericProcessor.updateValue(n);
                    let r = a.getOptimalSize(), s = a.getBoundingClientRect(), o = a.$.track.getBoundingClientRect();
                    r.width > s.width && o.width < 20 && (a.style.width = r.width + "px", a.style.height = r.height + "px");
                    break;
                  }
                  case "inverted":
                  case "rightToLeft": {
                    a._getLayoutType(), a._normalLayout && (a.$.fill.style[a._settings.margin] = "0px");
                    let n = a._numericProcessor.createDescriptor(a.value), r = a._numericProcessor.validate(n, a._minObject, a._maxObject);
                    a._setTicksAndInterval(), a._numericProcessor.updateValue(r);
                    break;
                  }
                  case "orientation": {
                    const n = a.$.fill.style, r = a.$.container.style;
                    switch (a._orientationChanged !== !0 && (a._orientationChanged = !0), a._tankSizeBeforeOrientation = { width: a.offsetWidth, height: a.offsetHeight }, a._setSettingsObject(), a._getLayoutType(), a.rightToLeft && (n.marginLeft = "0"), a.inverted && (n.marginTop = "0", n.marginLeft = "0"), a.orientation) {
                      case "vertical":
                        a.inverted || (n.marginTop = "auto", n.marginLeft = "0"), n.width = "100%", r.paddingLeft = "0", r.paddingRight = "0";
                        break;
                      case "horizontal":
                        (!a.inverted || !a.inverted && !a.rightToLeft || a.rightToLeft && a.inverted) && (n.marginTop = "0", n.marginLeft = "auto"), n.height = "100%", r.paddingTop = "0", r.paddingBottom = "0";
                    }
                    a._validateMinMax("both");
                    const s = a._numericProcessor.createDescriptor(a.value), o = a._numericProcessor.validate(s, a._minObject, a._maxObject);
                    a._setTicksAndInterval(), a._setTicksAndInterval(), a._numericProcessor.updateValue(o), a._trackChanged = !0, a.setAttribute("aria-orientation", i);
                    break;
                  }
                  case "significantDigits":
                  case "precisionDigits":
                    if (a.mode === "date") return;
                    if (t === "precisionDigits" && a.scaleType === "integer" && a.error(a.localize("noInteger", { elementType: a.nodeName.toLowerCase(), property: t })), t === "significantDigits" && a.precisionDigits !== null ? a.precisionDigits = null : t === "precisionDigits" && a.significantDigits !== null && (a.significantDigits = null), a._validateInitialPropertyValues(), a._setTicksAndInterval(), a.orientation === "horizontal" && (a.inverted || a.rightToLeft)) {
                      const n = a._numericProcessor.valueToPx(a._numericProcessor.getCoercedValue(a._drawValue));
                      a.updateFillSizeAndPosition(n, a._settings.margin, i, !1);
                    }
                    break;
                  case "decimalSeparator": {
                    if (a.scaleType === "integer" || a.mode === "date") return;
                    const n = a._discardDecimalSeparator(a.value, e), r = a._applyDecimalSeparator(n);
                    a.value = n, delete a._valueBeforeCoercion, a._numericProcessor.addTicksAndLabels(), a._updateTooltipValue(r);
                    break;
                  }
                  case "value":
                    if (a.value = e, i === null) return;
                    if (a.mode === "date") {
                      let n = Smart.Utilities.DateTime.validateDate(i);
                      return n = n.getTimeStamp(), void (n.compare(e) !== 0 && a._validate(!1, n, void 0, !0));
                    }
                    if (i.toString().toUpperCase() !== e.toString().toUpperCase()) {
                      let n = i !== void 0 ? i.toString().replace(/\s/g, "") : e.toString().replace(/\s/g, "");
                      a._numericProcessor.regexScientificNotation.test(n) && (n = a._numericProcessor.scientificToDecimal(n)), a._validate(!1, n, void 0, !0), delete a._valueBeforeCoercion;
                    } else a.value = typeof i == "string" ? i : i.toString();
                    break;
                  case "scaleType":
                    if (a.mode === "date") return void (a.scaleType = "integer");
                    a._changeScaleType(e, i);
                    break;
                  case "disabled":
                  case "unfocusable":
                    a._setFocusable();
                    break;
                  case "showUnit":
                  case "unit":
                    a._setTicksAndInterval(), a._moveThumbBasedOnValue(a._drawValue);
                    break;
                  case "tooltipPosition":
                    break;
                  case "wordLength": {
                    if (a.mode === "date") return void (a.wordLength = "uint64");
                    a._wordLengthNumber = a._numericProcessor.getWordLength(i), a._validateMinMax("both");
                    const n = a._numericProcessor.createDescriptor(a.value), r = a._numericProcessor.validate(n, a._minObject, a._maxObject);
                    a._setTicksAndInterval(), a._numericProcessor.updateValue(r);
                    break;
                  }
                  case "scalePosition":
                    a._setInitialComponentDisplay(), a._setTicksAndInterval(), a._moveThumbBasedOnValue(a._drawValue);
                    break;
                  case "labelFormatFunction":
                  case "scientificNotation": {
                    if (a.mode === "date" && t === "scientificNotation") return;
                    const n = a._discardDecimalSeparator(a.value, a.decimalSeparator);
                    a._setTicksAndInterval(), a._updateTooltipValue(n);
                    break;
                  }
                  case "logarithmicScale":
                    if (a.mode === "date") return void (a.logarithmicScale = !1);
                    a._validateMinMax("both"), a._setTicksAndInterval(), a._validate(!1, a.value, void 0, !0);
                    break;
                  case "ticksPosition":
                    i === "scale" ? (a.$trackTicksContainer.addClass("smart-hidden"), a.$.trackTicksContainer.innerHTML = "") : a.$trackTicksContainer.removeClass("smart-hidden"), a._numericProcessor.addTicksAndLabels();
                    break;
                  case "customInterval":
                    i ? (a._customTicks && (a.customTicks = a._customTicks), a._numericProcessor.validateCustomTicks()) : a.mode === "date" && (a._customTicks = a.customTicks), a._setTicksAndInterval(), a._coerceCustomInterval();
                    break;
                  case "customTicks":
                    if (a.mode === "date" && !a.customInterval) return a._customTicks = i, void (a.customTicks = e);
                    a._numericProcessor.validateCustomTicks(), a.customInterval && (a._setTicksAndInterval(), a._coerceCustomInterval());
                    break;
                  case "dateLabelFormatString":
                    a.mode === "date" && a._setTicksAndInterval();
                    break;
                  case "mode":
                    a.mode = e;
                    break;
                  case "showThumbLabel":
                    i && a.showTooltip && (a.showTooltip = !1);
                    break;
                  case "showTooltip":
                    i && a.showThumbLabel && (a.showThumbLabel = !1);
                    break;
                  case "validation":
                    i === "strict" && a._validate(!1, a.value);
                }
                else a[t] = e;
                else a._renderingSuspended = !0;
              }
              _setSettingsObject() {
                const t = this;
                t.orientation === "horizontal" ? t._settings = { clientSize: "clientWidth", dimension: "width", leftOrTop: "left", margin: "marginLeft", offset: "offsetLeft", otherSize: "offsetHeight", size: "offsetWidth", page: "pageX" } : t._settings = { clientSize: "clientHeight", dimension: "height", leftOrTop: "top", margin: "marginTop", offset: "offsetTop", otherSize: "offsetWidth", size: "offsetHeight", page: "pageY" };
              }
              _setInitialComponentDisplay() {
                const t = this;
                switch (t.scalePosition) {
                  case "near":
                    t.$scaleNear.removeClass("smart-hidden"), t.$scaleFar.addClass("smart-hidden");
                    break;
                  case "far":
                    t.$scaleNear.addClass("smart-hidden"), t.$scaleFar.removeClass("smart-hidden");
                    break;
                  case "both":
                    t.$scaleFar.removeClass("smart-hidden"), t.$scaleNear.removeClass("smart-hidden");
                    break;
                  case "none":
                    t.$scaleFar.addClass("smart-hidden"), t.$scaleNear.addClass("smart-hidden");
                }
                t.$tooltip.addClass("smart-hidden"), t.ticksPosition === "track" && t.$trackTicksContainer.removeClass("smart-hidden");
              }
              _styleChangedHandler() {
                const t = this;
                t._isVisible() ? t._renderingSuspended ? t._createElement() : t._renderingSuspended || (t._setTicksAndInterval(), t._moveThumbBasedOnValue(t._drawValue)) : t._renderingSuspended = !0;
              }
              _validateInitialPropertyValues() {
                const t = this, e = typeof t.value === String ? t.value.replace(/\s/g, "") : t.value.toString().replace(/\s/g, "");
                t.mode === "numeric" && t._numericProcessor.regexScientificNotation.test(e) && (t.value = t._numericProcessor.scientificToDecimal(e), delete t._valueBeforeCoercion), t.significantDigits = t.significantDigits !== null ? Math.min(Math.max(t.significantDigits, 1), 21) : null, t.significantDigits === null && t.precisionDigits === null ? t.significantDigits = 8 : t.significantDigits !== null && t.precisionDigits !== null && t.error(t.localize("significantPrecisionDigits", { elementType: t.nodeName.toLowerCase() })), t._validateMinMax("both", !0), t.showTooltip && t.showThumbLabel && (t.showTooltip = !1);
              }
              _validateMinMax(t, e, i) {
                const a = this;
                let n = t === "min" || t === "both", r = t === "max" || t === "both";
                function s(o, l) {
                  a._numericProcessor.validateMinMax(o === "min" || e, o === "max" || e);
                  const c = a["_" + o + "Object"];
                  (o === "min" ? a._numericProcessor.compare(a.max, c, !0) <= 0 : a._numericProcessor.compare(a.min, c, !0) > 0) ? l ? (a._numberRenderer = new Smart.Utilities.NumberRenderer(l), o === "min" ? n = !1 : r = !1, a[o] = l, a["_" + o + "Object"] = l) : a.error(a.localize("invalidMinOrMax", { elementType: a.nodeName.toLowerCase(), property: o })) : (a._numberRenderer = new Smart.Utilities.NumberRenderer(c), a[o] = a["_" + o + "Object"]);
                }
                typeof e === void 0 && (e = !1), t === "both" ? (s("min", i), s("max", i)) : s(t, i), a.logarithmicScale ? a._validateOnLogarithmicScale(n, r, i) : (a._drawMin = a.min, a._drawMax = a.max), a.min = a.min.toString(), a.max = a.max.toString(), a._minObject = a._numericProcessor.createDescriptor(a.min), a._maxObject = a._numericProcessor.createDescriptor(a.max), a.mode === "date" && (a._minDate = Smart.Utilities.DateTime.fromFullTimeStamp(a.min), a._maxDate = Smart.Utilities.DateTime.fromFullTimeStamp(a.max)), a._numericProcessor.validateInterval(a.interval), a.customInterval && a._numericProcessor.validateCustomTicks(), a._setAriaValue("valueminmax");
              }
              _calculateTickInterval() {
                const t = this;
                let e = t._tickIntervalHandler.getInterval("linear", t._drawMin, t._drawMax, t.$.track, t.logarithmicScale);
                e.major !== t._majorTicksInterval ? (t._intervalHasChanged = !0, t._majorTicksInterval = e.major) : t._intervalHasChanged = !0, t._minorTicksInterval = e.minor, t.mode === "date" && t._calculateDateInterval(e.major);
              }
              _calculateDateInterval(t) {
                const e = this, i = { month: "2628000000000000000000000000000", day: "86400000000000000000000000000", hour: "3600000000000000000000000000", minute: "60000000000000000000000000", second: "1000000000000000000000000" };
                let a = "year", n = new Smart.Utilities.BigNumber("31536000000000000000000000000000"), r = n.subtract(t).abs(), s = new Smart.Utilities.BigNumber(e.min).subtract(e.max).abs(), o = s.divide(t).toString();
                o < 2 && (t = s.divide(3));
                for (let p in i) if (Object.prototype.hasOwnProperty.call(i, p)) {
                  const h = new Smart.Utilities.BigNumber(i[p]), g = h.subtract(t).abs();
                  if (g.compare(r) !== -1) break;
                  a = p, n = h, r = g;
                }
                if (a === "second") {
                  if (e._numberRenderer.numericValue = parseFloat(t), e._numberRenderer.numericValue < 1e3) return e._dateIncrementMethod = "addYoctoseconds", void (e._dateIntervalNumber = 1);
                  let p = e._numberRenderer.toScientific(10);
                  return p = p.charAt(p.length - 1), e._dateIncrementMethod = e._unitToMethod[p], void (e._dateIntervalNumber = Math.pow(10, e._numericProcessor.prefixesToPowers[p]));
                }
                e._dateInterval = !0;
                const l = !e.customInterval;
                let c, m, u;
                switch (l && (c = [new Smart.Utilities.BigNumber(e.min)], m = s.divide(n).toString(), u = Math.max(1, Math.floor(m / o))), a) {
                  case "year":
                    if (l) for (let p = e._minDate.year() + u; p < e._maxDate.year(); p += u) c.push(new Smart.Utilities.BigNumber(new Smart.Utilities.DateTime(p, 1, 1).getTimeStamp()));
                    e._dateIncrementMethod = "addYears";
                    break;
                  case "month":
                    if (l) for (let p = new Smart.Utilities.DateTime(e._minDate.year(), e._minDate.month() + u, 1); p.compare(e._maxDate) === -1; p.addMonths(u, !1)) c.push(new Smart.Utilities.BigNumber(p.getTimeStamp()));
                    e._dateIncrementMethod = "addMonths";
                    break;
                  case "day":
                    if (l) for (let p = new Smart.Utilities.DateTime(e._minDate.year(), e._minDate.month(), e._minDate.day() + u); p.compare(e._maxDate) === -1; p.addDays(u, !1)) c.push(new Smart.Utilities.BigNumber(p.getTimeStamp()));
                    e._dateIncrementMethod = "addDays", e._dateIntervalNumber = 864e26;
                    break;
                  case "hour":
                    if (l) for (let p = new Smart.Utilities.DateTime(e._minDate.year(), e._minDate.month(), e._minDate.day(), e._minDate.hour() + u); p.compare(e._maxDate) === -1; p.addHours(u, !1)) c.push(new Smart.Utilities.BigNumber(p.getTimeStamp()));
                    e._dateIncrementMethod = "addHours", e._dateIntervalNumber = 36e26;
                    break;
                  case "minute":
                    if (l) for (let p = new Smart.Utilities.DateTime(e._minDate.year(), e._minDate.month(), e._minDate.day(), e._minDate.hour(), e._minDate.minute() + u); p.compare(e._maxDate) === -1; p.addMinutes(u, !1)) c.push(new Smart.Utilities.BigNumber(p.getTimeStamp()));
                    e._dateIncrementMethod = "addMinutes", e._dateIntervalNumber = 6e25;
                }
                l && (c[c.length - 1].compare(e.max) === -1 && c.push(new Smart.Utilities.BigNumber(e.max)), e.customTicks = c);
              }
              _formatNumber(t) {
                const e = this;
                if (e.mode === "date") return Smart.Utilities.DateTime.fromFullTimeStamp(t).toString(e.dateLabelFormatString);
                const i = e._numberRenderer;
                let a = parseFloat(t);
                if (i.numericValue = t, e.scientificNotation) a = e._numberRenderer.toScientific(e.significantDigits, e.precisionDigits);
                else switch (e.scaleType) {
                  case "floatingPoint":
                    a = e._applyDecimalSeparator(i.toDigits(e.significantDigits, e.precisionDigits));
                    break;
                  case "integer":
                    a = i.isENotation(a) ? Math.round(i.largeExponentialToDecimal(a)) : Math.round(a), a = i.toDigits(e.significantDigits, 0);
                }
                return a;
              }
              _formatLabel(t, e) {
                const i = this;
                let a;
                return i.labelFormatFunction && (i.mode === "date" && (t = Smart.Utilities.DateTime.fromFullTimeStamp(t)), a = i.labelFormatFunction(t), a !== void 0 && a !== "") || (a = i._formatNumber(t), i._numberRenderer = new Smart.Utilities.NumberRenderer(a), i.showUnit && (a += e !== !1 ? ' <span class="smart-unselectable">' + i.unit + "</span>" : " " + i.unit)), a;
              }
              _layout() {
                const t = this, e = t.$.container.style, i = t._tickIntervalHandler.labelsSize.minLabelSize / 2 + "px", a = t._tickIntervalHandler.labelsSize.maxLabelSize / 2 + "px";
                switch (t.orientation) {
                  case "horizontal":
                    if (t.scalePosition === "none") {
                      e.paddingLeft = "", e.paddingRight = "";
                      break;
                    }
                    !t.inverted && !t.rightToLeft || t.rightToLeft && t.inverted ? (e.paddingLeft = i, e.paddingRight = a) : (e.paddingLeft = a, e.paddingRight = i);
                    break;
                  case "vertical":
                    if (t.scalePosition === "none") {
                      e.paddingTop = "", e.paddingBottom = "";
                      break;
                    }
                    t.inverted ? (e.paddingBottom = a, e.paddingTop = i) : (e.paddingBottom = i, e.paddingTop = a);
                }
                t._measurements.trackLength = t.$.track[this._settings.clientSize];
              }
              _trackDownHandler(t) {
                const e = this;
                e.disabled || e.readonly || !Smart.Utilities.Core.isMobile && t.button !== 0 || (e.mechanicalAction === "switchUntilReleased" && (e._cachedValue = {}, e._cachedValue._number = e._number, e._cachedValue._drawValue = e._drawValue, e._cachedValue.value = e.value, e._valueDate && (e._cachedValue._valueDate = e._valueDate)), e._getTrackStartAndEnd(), e._moveThumbBasedOnCoordinates(t, !0, e.mechanicalAction !== "switchWhenReleased"), e._thumbDragged = !0, e.$track.addClass("smart-dragged"), e.showTooltip && e.$tooltip.removeClass("smart-hidden"));
              }
              _trackMoveHandler(t) {
                t.originalEvent.type === "touchmove" && t.originalEvent.preventDefault();
              }
              _documentMoveHandler(t) {
                const e = this;
                e._thumbDragged && (t.originalEvent.preventDefault(), e._moveThumbBasedOnCoordinates(t, !0, e.mechanicalAction !== "switchWhenReleased"), e.$fill.addClass("disable-animation"));
              }
              _documentUpHandler(t) {
                const e = this;
                if (e._thumbDragged) {
                  if (e.mechanicalAction === "switchWhenReleased") e._moveThumbBasedOnCoordinates(t, !0, !0);
                  else if (e.mechanicalAction === "switchUntilReleased" && e._numericProcessor.compare(e._number, e._cachedValue._number)) {
                    const i = e._getEventValue();
                    e._number = e._cachedValue._number, e._drawValue = e._cachedValue._drawValue, e._cachedValue._valueDate && (e._valueDate = e._cachedValue._valueDate), e.value = e._cachedValue.value, e._moveThumbBasedOnValue(e._drawValue);
                    const a = e._getEventValue();
                    e.$.fireEvent("change", { value: a, oldValue: i }), e._updateTargetValue(), e.$.hiddenInput.value = a, e._setAriaValue("valuenow");
                  }
                  e.showTooltip && e.$tooltip.addClass("smart-hidden"), e._thumbDragged = !1, e.$track.removeClass("smart-dragged"), e.$fill.removeClass("disable-animation");
                }
              }
              _selectStartHandler(t) {
                this._thumbDragged && t.preventDefault();
              }
              refresh() {
                this._resizeHandler();
              }
              _resizeHandler() {
                const t = this;
                t._isVisible() ? t._renderingSuspended ? t._createElement() : t._renderingSuspended || (t._orientationChanged !== !0 && (t._setTicksAndInterval(), t._moveThumbBasedOnValue(t._drawValue)), t._trackChanged && (t._measurements.trackLength = t.$.track[this._settings.clientSize], t._setTicksAndInterval(), t._moveThumbBasedOnValue(t._drawValue)), t._setTrackSize(), delete t._orientationChanged, delete t._trackChanged) : t._renderingSuspended = !0;
              }
              _moveThumbBasedOnCoordinates(t, e, i) {
                const a = this;
                let n = e ? Math.min(Math.max(t[a._settings.page], a._trackStart), a._trackEnd) : t[a._settings.page], r = a._numericProcessor.pxToValue(n);
                a.logarithmicScale ? (a._drawValue = Math.log10(r), r = a._numericProcessor.getCoercedValue(a._drawValue)) : (a._drawValue = r, r = a._numericProcessor.getCoercedValue(r)), n = Math.min(Math.max(a._numericProcessor.valueToPx(r) + a._trackStart, a._trackStart), a._trackEnd);
                const s = n - a._trackStart;
                a.updateFillSizeAndPosition(s, a._settings.margin, r, !0, i), t.originalEvent && t.originalEvent.stopPropagation();
              }
              _moveThumbBasedOnValue(t) {
                const e = this, i = e._numericProcessor.valueToPx(e._numericProcessor.getCoercedValue(t));
                e.updateFillSizeAndPosition(i, e._settings.margin, t, !0);
              }
              updateFillSizeAndPosition(t, e, i, a, n) {
                const r = this, s = r.$.fill.style;
                if (r._normalLayout ? s[r._settings.dimension] = t + "px" : (s[r._settings.dimension] = Math.min(r._measurements.trackLength, Math.max(0, r._measurements.trackLength - t)) + "px", s[e] = t + "px"), a) {
                  const o = r.value;
                  delete r._valueBeforeCoercion, r._numericProcessor.updateToolTipAndValue(i, o, n);
                }
              }
              _updateTooltipValue(t) {
                const e = this;
                t === void 0 && (t = e.value), e.logarithmicScale && (t = Math.pow(10, t.toString())), t = e._formatLabel(t), e.$.tooltipContent.innerHTML = t, e.$.thumbLabel.innerHTML = t;
              }
              _getSize(t, e) {
                const i = this, a = window.getComputedStyle(i), n = window.getComputedStyle(i.$.track), r = i._trackSize + parseFloat(n[e.marginA]) + parseFloat(n[e.marginB]);
                let s, o, l, c, m, u, p;
                function h(g, f) {
                  const b = g.getElementsByClassName("smart-label");
                  s = b[0], o = b[b.length - 1];
                  const y = window.getComputedStyle(b[0])[f];
                  l += parseFloat(y);
                }
                switch (l = r, i.scalePosition) {
                  case "none":
                    return l += parseFloat(a[e.paddingA]) + parseFloat(a[e.paddingB]), c = i._tankSizeBeforeOrientation !== void 0 ? i.orientation === "horizontal" ? i._tankSizeBeforeOrientation.height : i._tankSizeBeforeOrientation.width : i.orientation === "horizontal" ? parseFloat(n.width) : parseFloat(n.height), i._trackChanged !== !0 && (i._trackChanged = !0), { optimalSize: l, optimalOtherSize: c };
                  case "near":
                    l += t, h(i.$.scaleNear, e.nearScaleDistance);
                    break;
                  case "far":
                    l += t, h(i.$.scaleFar, e.farScaleDistance);
                    break;
                  case "both":
                    l += 2 * t, h(i.$.scaleNear, e.nearScaleDistance), h(i.$.scaleFar, e.farScaleDistance);
                }
                return l += parseFloat(a[e.paddingA]) + parseFloat(a[e.paddingB]), m = s.getBoundingClientRect(), u = o.getBoundingClientRect(), c = i[e.offset], p = m[e.distance] + s[e.offset] - u[e.distance], p > 0 && (c = s[e.offset] + o[e.offset]), { optimalSize: l, optimalOtherSize: c };
              }
              _getRange() {
                const t = this;
                t.logarithmicScale ? t._range = t._drawMax - t._drawMin : t.scaleType === "floatingPoint" ? t._range = (t._drawMax - t._drawMin).toString() : t._range = new Smart.Utilities.BigNumber(t._drawMax).subtract(t._drawMin).toString();
              }
              _getTrackStartAndEnd() {
                const t = this;
                let e, i = t.$.track.getBoundingClientRect();
                if (t.orientation === "horizontal") {
                  const r = document.body.scrollLeft || document.documentElement.scrollLeft;
                  e = i.left + r;
                } else {
                  const r = document.body.scrollTop || document.documentElement.scrollTop;
                  e = i.top + r;
                }
                const a = e + t._measurements.trackLength, n = a - e;
                t._trackStart = e, t._trackEnd = a, t._valuePerPx = t._numericProcessor.getValuePerPx(t._range, n);
              }
              _updateScaleWidth(t) {
                const e = this;
                let i = e.ticksPosition === "track" ? 4 : 12;
                switch (e.labelsVisibility) {
                  case "all":
                    t = e._numericProcessor._longestLabelSize;
                    break;
                  case "endPoints":
                    t = Math.max(e._tickIntervalHandler.labelsSize.minLabelOtherSize, e._tickIntervalHandler.labelsSize.maxLabelOtherSize);
                    break;
                  case "none":
                    t = 0;
                }
                let a = i + t, n = window.getComputedStyle(e.$.track);
                if (n.getPropertyValue("--smart-tank-scale-size")) e.$.container.style.setProperty("--smart-tank-scale-size", a + "px");
                else {
                  const r = window.getComputedStyle(e), s = e.$.scaleNear.style, o = e.$.scaleFar.style, l = e.$.track.style, c = parseFloat(n.getPropertyValue("min-width"));
                  let m, u, p, h, g, f = (parseFloat(n.getPropertyValue("outline-width")) || 0) + (parseFloat(n.getPropertyValue("outline-offset")) || 0);
                  switch (e.orientation) {
                    case "horizontal":
                      m = "height", u = "width", p = e.offsetHeight, g = parseFloat(r.getPropertyValue("padding-top")) + parseFloat(r.getPropertyValue("padding-bottom")), h = parseFloat(n.getPropertyValue("margin-top")) + parseFloat(n.getPropertyValue("margin-bottom"));
                      break;
                    case "vertical":
                      m = "width", u = "height", p = e.offsetWidth, g = parseFloat(r.getPropertyValue("padding-left")) + parseFloat(r.getPropertyValue("padding-right")), h = parseFloat(n.getPropertyValue("margin-left")) + parseFloat(n.getPropertyValue("margin-right"));
                  }
                  switch (e.scalePosition) {
                    case "near":
                      s.setProperty(m, a + "px"), l.setProperty(m, Math.max(isNaN ? 0 : c, p - g - a - 4 - h - f) + "px");
                      break;
                    case "far":
                      o.setProperty(m, a + "px"), l.setProperty(m, Math.max(isNaN ? 0 : c, p - g - a - 4 - h - f) + "px");
                      break;
                    case "both":
                      s.setProperty(m, a + "px"), o.setProperty(m, a + "px"), l.setProperty(m, Math.max(isNaN ? 0 : c, p - g - 2 * a - 4 - h - f) + "px");
                      break;
                    case "none":
                      l.setProperty(m, "");
                  }
                  l.setProperty(u, "100%"), s.setProperty(u, "100%"), o.setProperty(u, "100%");
                }
              }
              _appendTicksAndLabelsToScales(t, e) {
                const i = this;
                function a(n) {
                  n.innerHTML = e, i.ticksPosition === "scale" && (n.innerHTML += t);
                }
                switch (i.scalePosition) {
                  case "near":
                    a(i.$.scaleNear);
                    break;
                  case "far":
                    a(i.$.scaleFar);
                    break;
                  case "both":
                    a(i.$.scaleNear), a(i.$.scaleFar);
                }
                i.ticksPosition === "track" && (i.$.trackTicksContainer.innerHTML = t);
              }
              _discardDecimalSeparator(t, e) {
                if (e === void 0 && (e = this.decimalSeparator), e !== ".") {
                  let i = new RegExp(e, "g");
                  return typeof t == "string" ? t.replace(i, ".") : t.toString().replace(i, ".");
                }
                return t;
              }
              _applyDecimalSeparator(t) {
                const e = this;
                return typeof t != "string" && (t = t.toString()), e.decimalSeparator !== "." && (t = t.replace(/\./g, e.decimalSeparator)), t;
              }
              _validate(t, e, i, a) {
                const n = this;
                let r, s, o;
                n._programmaticValueIsSet = a && n.validation === "interaction", r = t ? n.value : e, i !== !0 && n.coerce ? (s = n._numericProcessor.createDescriptor(r, !0, !0, !0), s = n.logarithmicScale ? Math.pow(10, n._numericProcessor.getCoercedValue(Math.log10(s))) : n._numericProcessor.getCoercedValue(s), o = s) : n.validation === "strict" || !t && !n._programmaticValueIsSet ? (s = n._numericProcessor.createDescriptor(r, !0, !0, !0), o = s) : (s = n._numericProcessor.createDescriptor(r, !0, !0, !1), o = n._numericProcessor.validate(s, n._minObject, n._maxObject)), n._numericProcessor.regexScientificNotation.test(o) && (o = n._numericProcessor.scientificToDecimal(o)), o = n._discardDecimalSeparator(o, n.decimalSeparator), t ? (n._number = o, n._drawValue = n.logarithmicScale ? Math.log10(o) : o, n.mode === "numeric" ? n.value = s.toString() : (n._valueDate = Smart.Utilities.DateTime.fromFullTimeStamp(s), n.value = s), delete n._valueBeforeCoercion, n._moveThumbBasedOnValue(n._drawValue)) : n._numericProcessor.updateValue(s), n._programmaticValueIsSet = !1;
              }
              _changeScaleType() {
                const t = this;
                t._numericProcessor = new Smart.Utilities.NumericProcessor(t, "scaleType"), t._validateMinMax("both"), t._setTicksAndInterval(), t._scaleTypeChangedFlag = !0, t._validate(!0, t._number.toString()), t._scaleTypeChangedFlag = !1;
              }
              _setTicksAndInterval() {
                const t = this;
                if (!t._isVisible() || t._renderingSuspended) return void (t._renderingSuspended = !0);
                let e = t._formatLabel(t.min), i = t._formatLabel(t.max);
                t._getRange(), t._tickIntervalHandler = new Smart.Utilities.TickIntervalHandler(t, e, i, "smart-label", t._settings.size, t.scaleType === "integer", t.logarithmicScale), t._layout(), t.customInterval ? (t.mode === "date" && t._calculateTickInterval(), t._intervalHasChanged = !0, t._numericProcessor.addCustomTicks()) : (t._calculateTickInterval(), t._dateInterval ? (t._intervalHasChanged = !0, t._numericProcessor.addCustomTicks()) : t._numericProcessor.addTicksAndLabels());
              }
              _setFocusable() {
                const t = this;
                t.disabled || t.unfocusable ? t.removeAttribute("tabindex") : t.tabIndex = t.tabIndex > 0 ? t.tabIndex : 0;
              }
              _keyIncrementDecrement(t, e) {
                const i = this, a = t === "add" ? 1 : -1, n = e === void 0;
                if (n && (e = i.logarithmicScale ? new Smart.Utilities.BigNumber(i._drawValue) : i._drawValue), i.customInterval && i.coerce) {
                  let r, s;
                  n && (i.logarithmicScale && (e = i.value), i.mode === "numeric" && (e = e.toString())), i.mode === "numeric" ? (r = i.customTicks.indexOf(i.min) !== -1 ? i.customTicks.slice(0) : [i.min].concat(i.customTicks), s = r.indexOf(e)) : (r = i.customTicks.findIndex((function(l) {
                    return l.compare(i._drawMin) === 0;
                  })) !== -1 ? i.customTicks.slice(0) : [i._drawMin].concat(i.customTicks), s = r.findIndex((function(l) {
                    return l.compare(e) === 0;
                  })));
                  const o = r[s + 1 * a];
                  return o !== void 0 ? o : e === i.max && t === "subtract" ? r[r.length - 2] : e;
                }
                if (i.mode === "numeric") {
                  let r = i._numericProcessor.incrementDecrement(e, t, i._validInterval);
                  return i.logarithmicScale && (i._drawValue = r, r = Math.pow(10, Math.round(r))), r;
                }
                return i.validation !== "interaction" || i._valueDate.compare(i._minDate) !== -1 && i._valueDate.compare(i._maxDate) !== 1 || (i._valueDate = Smart.Utilities.DateTime.fromFullTimeStamp(i._drawValue)), i._valueDate[i._dateIncrementMethod](a * parseFloat(i.interval), !1), i._drawValue = new Smart.Utilities.BigNumber(i._valueDate.getTimeStamp()), i._drawValue.compare(i._drawMin) === -1 && (i._drawValue = new Smart.Utilities.BigNumber(i._drawMin), i._valueDate = Smart.Utilities.DateTime.fromFullTimeStamp(i._drawValue)), i._drawValue.compare(i._drawMax) === 1 && (i._drawValue = new Smart.Utilities.BigNumber(i._drawMax), i._valueDate = Smart.Utilities.DateTime.fromFullTimeStamp(i._drawValue)), i._drawValue;
              }
              _keydownHandler(t) {
                const e = this;
                if (e.disabled || e.readonly) return;
                const i = t.charCode ? t.charCode : t.which;
                if ([35, 36, 37, 38, 39, 40].indexOf(i) === -1) return;
                const a = [35, 38, 39].indexOf(i) > -1, n = [36, 37, 40].indexOf(i) > -1;
                if (t.preventDefault(), e.scaleType === "floatingPoint") {
                  if (parseFloat(e.value) <= parseFloat(e.min) && n || parseFloat(e.value) >= parseFloat(e.max) && a) return;
                } else {
                  let s = new Smart.Utilities.BigNumber(e._drawValue);
                  if (s.compare(e._drawMin) !== 1 && n || s.compare(e._drawMax) !== -1 && a) return;
                }
                let r;
                switch (i) {
                  case 40:
                  case 37:
                    r = e._keyIncrementDecrement("subtract");
                    break;
                  case 38:
                  case 39:
                    r = e._keyIncrementDecrement("add");
                    break;
                  case 36:
                    e._drawValue = e._drawMin, r = e.min;
                    break;
                  case 35:
                    e._drawValue = e._drawMax, r = e.max;
                }
                return e._validate(!1, r, i), !1;
              }
              _setDrawVariables() {
                const t = this;
                t.logarithmicScale ? (t._drawValue = Math.log10(t.value), t._drawMin = Math.log10(t.min), t._drawMax = Math.log10(t.max)) : (t._drawValue = t.value, t._drawMin = t.min, t._drawMax = t.max);
              }
              _validateOnLogarithmicScale(t, e) {
                const i = this;
                function a(n) {
                  return Math.pow(10, Math.round(Math.log10(n) - Math.log10(5.5) + 0.5));
                }
                if (t) if (i.min <= 0) i.min = 1, i._drawMin = 0;
                else if (Math.log10(i.min) % 1 != 0) {
                  let n = a(parseFloat(i.min));
                  n > i.min && (n /= 10), i._drawMin = Math.log10(i.min);
                } else i._drawMin = Math.log10(i.min);
                if (e) if (i.max <= 0) i.max = 1, i._drawMax = 0;
                else if (Math.log10(i.max) % 1 != 0) {
                  let n = a(parseFloat(i.max));
                  n < i.max && (n *= 10), i._drawMax = Math.log10(i.max);
                } else i._drawMax = Math.log10(i.max);
                i.scaleType === "integer" && (i._drawMin < 0 && (i._drawMin = 0, i.min = 1), i._drawMax < 0 && (i._drawMax = 1, i.max = 10)), i._drawMax === i._drawMin && (i._drawMax = i._drawMin + 1);
              }
              _getLayoutType() {
                const t = this, e = t.orientation, i = t.inverted, a = t.rightToLeft;
                t._normalLayout = e === "horizontal" && (!i && !a || a && i) || e === "vertical" && i;
              }
              _trackOnMouseEnterHandler() {
                const t = this;
                t.readonly || t.disabled || (t.$track.addClass("track-hovered"), t.$.track.setAttribute("hover", ""));
              }
              _trackOnMouseLeaveHandler() {
                const t = this;
                t.readonly || t.disabled || (t.$track.removeClass("track-hovered"), t.$.track.removeAttribute("hover"));
              }
              _isVisible() {
                const t = this;
                return !!(t.offsetWidth || t.offsetHeight || t.getClientRects().length);
              }
              _coerceCustomInterval() {
                const t = this;
                if (!t.coerce) return;
                const e = t._valueBeforeCoercion, i = t.logarithmicScale ? Math.pow(10, t._numericProcessor.getCoercedValue(Math.log10(t.value))) : t._numericProcessor.getCoercedValue(t.value);
                t._validate(!1, i, !0, !0), t._valueBeforeCoercion = e;
              }
              _handleDateScale() {
                const t = this, e = Smart.Utilities.DateTime;
                e || t.error(t.localize("missingReference", { elementType: t.nodeName.toLowerCase(), files: "smart.date.js" })), t._customTicks = t.customTicks, t._unitToMethod = { Y: "addSeconds", Z: "addMilliseconds", E: "addMicroseconds", P: "addNanoseconds", T: "addPicoseconds", G: "addFemtoseconds", M: "addAttoseconds", k: "addZeptoseconds" }, t._minDate = e.validateDate(t.min), t.min = t._minDate.getTimeStamp(), t._maxDate = e.validateDate(t.max), t.max = t._maxDate.getTimeStamp(), t.rangeSlider || (t._valueDate = e.validateDate(t.value), t.value = t._valueDate.getTimeStamp()), t._properties.min.serialize = "_serializeMin", t._properties.max.serialize = "_serializeMax", t._properties.value.serialize = "_serializeValue", t.scaleType = "integer", t.logarithmicScale = !1, t.wordLength = "uint64";
                const i = ["min", "max", "value"];
                for (let a = 0; a < i.length; a++) {
                  const n = i[a];
                  Object.defineProperty(t, n, { get: function() {
                    return t.context === t ? t.properties[n].value : t["_" + n + "Date"];
                  }, set(r) {
                    t.updateProperty(t, t._properties[n], r);
                  } });
                }
                t._getEventValue = function(a) {
                  return a ? (t.setAttribute("aria-valuetext", t._valueDate.toString("f")), t.value.toString()) : t._valueDate.clone();
                };
              }
              _serializeMin() {
                return this._minDate.toString();
              }
              _serializeMax() {
                return this._maxDate.toString();
              }
              _serializeValue() {
                return this._valueDate.toString();
              }
              _redefineProperty(t) {
                const e = this;
                Object.defineProperty(e, t, { get: function() {
                  return e.properties[t].value;
                }, set(i) {
                  function a(r, s) {
                    return s instanceof Smart.Utilities.BigNumber ? s.toString() : s;
                  }
                  const n = e.properties[t].value;
                  if (JSON.stringify(n, a) !== JSON.stringify(i, a) && (e.properties[t].value = i, e.isReady && (!e.ownerElement || e.ownerElement && e.ownerElement.isReady) && e.context !== e)) {
                    const r = e.context;
                    e.context = e, e.propertyChangedHandler(t, n, i), e.context = r;
                  }
                } });
              }
              _setAriaValue(t) {
                const e = this;
                t === "valuenow" ? e.setAttribute("aria-valuenow", e._getEventValue(!0)) : (e.setAttribute("aria-valuemin", e.min.toString()), e.setAttribute("aria-valuemax", e.max.toString()));
              }
            });
          })
        ),
        /***/
        7325: (
          /***/
          (() => {
            Smart.Utilities.Assign("TickIntervalHandler", class {
              constructor(t, e, i, a, n, r, s) {
                const o = this;
                o.context = t, o.minLabel = e, o.maxLabel = i, o.labelClass = a, o.dimension = n, o.logarithmic = s, t.customInterval ? t.customTicks.length > 0 ? o.labelsSize = o.getCustomTicksLabelSize() : o.labelsSize = { minLabelSize: 0, minLabelOtherSize: 0, maxLabelSize: 0, maxLabelOtherSize: 0 } : o.labelsSize = o.getMinAndMaxLabelSize(), r ? (o.getNiceInterval = o.getNiceIntervalInteger, o.getPossibleBiggerLabel = o.getPossibleBiggerLabelInteger) : (o.getNiceInterval = o.getNiceIntervalFloatingPoint, o.getPossibleBiggerLabel = o.getPossibleBiggerLabelFloatingPoint);
              }
              getInterval(t, e, i, a) {
                const n = this.context, r = n._measurements.innerRadius;
                let s, o, l = 1;
                t === "radial" ? (s = Math.max(this.labelsSize.minLabelSize, this.labelsSize.minLabelOtherSize, this.labelsSize.maxLabelSize, this.labelsSize.maxLabelOtherSize), l = 1.35) : (s = Math.max(this.labelsSize.minLabelSize, this.labelsSize.maxLabelSize), l = 1.45), s *= l, o = t === "radial" ? (function() {
                  let h = 2 * Math.PI * r * (Math.abs(n.startAngle - n.endAngle) / 360);
                  return Math.round(h);
                })() : n[this.dimension] - this.labelsSize.minLabelSize / 2 - this.labelsSize.maxLabelSize / 2, o = Math.max(10, o);
                const c = Math.ceil(o / s), m = t === "radial" ? 4 * c : 3 * c;
                let u = this.getNiceInterval(e, i, c, !0), p = this.getNiceInterval(e, i, m);
                if (n._cachedLabelsSize = this.labelsSize, c > 2 && !n.customInterval) {
                  const h = this.getPossibleBiggerLabel(c, u);
                  if (h.length > Math.max(this.minLabel.length, this.maxLabel.length)) {
                    const g = this.minLabel;
                    this.minLabel = h, this.labelsSize = this.getMinAndMaxLabelSize(), n._cachedLabelsSize = this.labelsSize;
                    const f = this.getInterval(t, e, i, a);
                    return this.minLabel = g, this.labelsSize = this.getMinAndMaxLabelSize(), f;
                  }
                }
                return { major: u, minor: p };
              }
              getNiceIntervalFloatingPoint(t, e, i, a) {
                const n = e - t, r = Math.floor(Math.log10(n) - Math.log10(i));
                let s, o = Math.pow(10, r), l = i * o;
                s = n < 2 * l ? 1 : n < 3 * l ? 2 : n < 7 * l ? 5 : 10;
                let c = s * o;
                if (a && this.context._range / c > i) {
                  switch (s) {
                    case 5:
                      s = 10;
                      break;
                    case 2:
                      s = 5;
                      break;
                    case 1:
                      s = 2;
                  }
                  c = s * o;
                }
                return this.nearestPowerOfTen = o, this.logarithmic && a ? Math.max(1, c) : c;
              }
              getPossibleBiggerLabelFloatingPoint(t, e) {
                const i = this.context;
                let a, n, r = parseFloat(i.min - i._numericProcessor.getPreciseModulo(parseFloat(i.min), e) + parseFloat(e)), s = r;
                this.logarithmic && (r = Math.pow(10, r)), a = i._formatLabel(r);
                for (let o = 1; o < t && (s += e, !(s >= i._drawMax)); o++) n = this.logarithmic ? Math.pow(10, s) : s, n = i._formatLabel(n), n.length > a.length && (a = n);
                return a;
              }
              getNiceIntervalInteger(t, e, i, a) {
                const n = new Smart.Utilities.BigNumber(e).subtract(new Smart.Utilities.BigNumber(t)), r = Math.floor(Math.log10(n.toString()) - Math.log10(i)), s = new Smart.Utilities.BigNumber(10).pow(new Smart.Utilities.BigNumber(r)), o = new Smart.Utilities.BigNumber(i).multiply(s);
                let l;
                l = n.compare(new Smart.Utilities.BigNumber(2 * o)) === -1 ? 1 : n.compare(new Smart.Utilities.BigNumber(3 * o)) === -1 ? 2 : n.compare(new Smart.Utilities.BigNumber(7 * o)) === -1 ? 5 : 10;
                let c = new Smart.Utilities.BigNumber(l).multiply(s);
                if (a && new Smart.Utilities.BigNumber(this.context._range).divide(c).compare(i) === 1) {
                  switch (l) {
                    case 5:
                      l = 10;
                      break;
                    case 2:
                      l = 5;
                      break;
                    case 1:
                      l = 2;
                  }
                  c = new Smart.Utilities.BigNumber(l).multiply(s);
                }
                return c.compare(1) === -1 && (c = new Smart.Utilities.BigNumber(1)), this.nearestPowerOfTen = s, c;
              }
              getPossibleBiggerLabelInteger(t, e) {
                const i = this.context, a = new Smart.Utilities.BigNumber(10);
                let n, r, s = new Smart.Utilities.BigNumber(i.min).subtract(new Smart.Utilities.BigNumber(i.min).mod(e)).add(e), o = s;
                this.logarithmic && (s = a.pow(s)), n = i._formatLabel(s);
                for (let l = 1; l < t && (o = o.add(e), o.compare(i._drawMax) === -1); l++) r = this.logarithmic ? a.pow(o) : o, r = i._formatLabel(r), r.length > n.length && (n = r);
                return n;
              }
              getMinAndMaxLabelSize() {
                const t = this, e = t.context, i = e.$.container, a = document.createElement("span");
                a.className = t.labelClass, a.style.position = "absolute", a.style.visibility = "hidden", i.appendChild(a), a.innerHTML = t.minLabel;
                const n = a[t.dimension], r = a[e._settings.otherSize];
                a.innerHTML = t.maxLabel;
                const s = a[t.dimension], o = a[e._settings.otherSize];
                return i.removeChild(a), { minLabelSize: n, minLabelOtherSize: r, maxLabelSize: s, maxLabelOtherSize: o };
              }
              getCustomTicksLabelSize() {
                const t = this, e = t.context, i = e.$.container, a = document.createElement("span"), n = e.customTicks;
                a.className = t.labelClass, a.style.position = "absolute", a.style.visibility = "hidden", i.appendChild(a), a.innerHTML = e._formatLabel(n[0]);
                let r = a[t.dimension], s = a[e._settings.otherSize];
                for (let o = 1; o < e.customTicks.length; o++) {
                  a.innerHTML = e._formatLabel(e.customTicks[o]);
                  const l = a[t.dimension], c = a[e._settings.otherSize];
                  l > r && (r = l), c > s && (s = c);
                }
                return i.removeChild(a), { minLabelSize: r, minLabelOtherSize: s, maxLabelSize: r, maxLabelOtherSize: s };
              }
            });
          })
        )
        /******/
      }, __webpack_module_cache__ = {};
      function __webpack_require__(t) {
        var e = __webpack_module_cache__[t];
        if (e !== void 0)
          return e.exports;
        var i = __webpack_module_cache__[t] = {
          /******/
          // no module.id needed
          /******/
          // no module.loaded needed
          /******/
          exports: {}
          /******/
        };
        return __webpack_modules__[t](i, i.exports, __webpack_require__), i.exports;
      }
      __webpack_require__.n = (t) => {
        var e = t && t.__esModule ? (
          /******/
          () => t.default
        ) : (
          /******/
          () => t
        );
        return __webpack_require__.d(e, { a: e }), e;
      }, __webpack_require__.d = (t, e) => {
        for (var i in e)
          __webpack_require__.o(e, i) && !__webpack_require__.o(t, i) && Object.defineProperty(t, i, { enumerable: !0, get: e[i] });
      }, __webpack_require__.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e), (() => {
        __webpack_require__(6321), __webpack_require__(2612), __webpack_require__(9135), __webpack_require__(9613), __webpack_require__(7325), __webpack_require__(8687), __webpack_require__(4232), __webpack_require__(2052), __webpack_require__(2754), __webpack_require__(7997), __webpack_require__(5478), __webpack_require__(2175);
        class t extends Smart.Component {
          get name() {
            return "smartGauge";
          }
        }
      })();
    })();
  })()), smart_gauge;
}
requireSmart_gauge();
var client = {}, hasRequiredClient;
function requireClient() {
  if (hasRequiredClient) return client;
  hasRequiredClient = 1;
  var t = {}, e = require$$0;
  if (t.NODE_ENV === "production")
    client.createRoot = e.createRoot, client.hydrateRoot = e.hydrateRoot;
  else {
    var i = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    client.createRoot = function(a, n) {
      i.usingClientEntryPoint = !0;
      try {
        return e.createRoot(a, n);
      } finally {
        i.usingClientEntryPoint = !1;
      }
    }, client.hydrateRoot = function(a, n, r) {
      i.usingClientEntryPoint = !0;
      try {
        return e.hydrateRoot(a, n, r);
      } finally {
        i.usingClientEntryPoint = !1;
      }
    };
  }
  return client;
}
var clientExports = requireClient();
const ReactDOM = /* @__PURE__ */ getDefaultExportFromCjs(clientExports);
typeof window < "u" && (window.Smart ? window.Smart.RenderMode = "manual" : window.Smart = { RenderMode: "manual" });
let Smart$1;
typeof window < "u" && (Smart$1 = window.Smart);
class Gauge extends React.Component {
  // Gets the id of the React component.
  get id() {
    return this._id || (this._id = "Gauge" + Math.floor((1 + Math.random()) * 65536).toString(16).substring(1)), this._id;
  }
  /** Specifies the style or format of the gauge's indicator, such as a needle, bar, or marker, which visually represents the current value on the gauge.
  *	Property type: GaugeAnalogDisplayType | string
  */
  get analogDisplayType() {
    return this.nativeElement ? this.nativeElement.analogDisplayType : void 0;
  }
  set analogDisplayType(e) {
    this.nativeElement && (this.nativeElement.analogDisplayType = e);
  }
  /** Configures or retrieves the current animation mode. When this property is set to 'none', all animations are disabled, resulting in static content with no animated transitions or effects. Setting a different value enables animation according to the specified mode.
  *	Property type: Animation | string
  */
  get animation() {
    return this.nativeElement ? this.nativeElement.animation : void 0;
  }
  set animation(e) {
    this.nativeElement && (this.nativeElement.animation = e);
  }
  /** Defines or retrieves the duration of the gauge's animation effect, measured in milliseconds. This property only applies when the animation setting is enabled (i.e., its value is not 'none'). If animation is set to 'none', this duration has no effect.
  *	Property type: number
  */
  get animationDuration() {
    return this.nativeElement ? this.nativeElement.animationDuration : void 0;
  }
  set animationDuration(e) {
    this.nativeElement && (this.nativeElement.animationDuration = e);
  }
  /** When the coerce property is set to true, any value provided will automatically be adjusted to the nearest valid value based on the defined interval. This ensures that the resulting value always conforms to the step size specified by the interval property, even if the original input does not exactly match an allowed value.
  *	Property type: boolean
  */
  get coerce() {
    return this.nativeElement ? this.nativeElement.coerce : void 0;
  }
  set coerce(e) {
    this.nativeElement && (this.nativeElement.coerce = e);
  }
  /** Determines whether custom tick marks, which may be placed at uneven intervals, are displayed on the plot. The specific positions of these custom ticks are specified using the customTicks property. This option allows you to override the default tick placement and use your own set of tick values.
  *	Property type: boolean
  */
  get customInterval() {
    return this.nativeElement ? this.nativeElement.customInterval : void 0;
  }
  set customInterval(e) {
    this.nativeElement && (this.nativeElement.customInterval = e);
  }
  /** When customInterval is enabled, you can define a specific list of tick values to be displayed on the plot. If coerce is set to true, any input value will automatically snap to the nearest tick from this predefined list, ensuring that only these tick values can be selected or represented.
  *	Property type: number[]
  */
  get customTicks() {
    return this.nativeElement ? this.nativeElement.customTicks : void 0;
  }
  set customTicks(e) {
    this.nativeElement && (this.nativeElement.customTicks = e);
  }
  /** Specifies the format of the date labels that appear when the mode property is set to 'date'. This determines how dates are displayed on the labels (e.g., 'YYYY-MM-DD', 'MM/DD/YYYY').
  *	Property type: string
  */
  get dateLabelFormatString() {
    return this.nativeElement ? this.nativeElement.dateLabelFormatString : void 0;
  }
  set dateLabelFormatString(e) {
    this.nativeElement && (this.nativeElement.dateLabelFormatString = e);
  }
  /** Specifies or retrieves the character used as the decimal separator in numeric values. This property allows you to define which character (such as "." or ",") separates the integer part from the fractional part in numbers when displaying or parsing numeric data.
  *	Property type: string
  */
  get decimalSeparator() {
    return this.nativeElement ? this.nativeElement.decimalSeparator : void 0;
  }
  set decimalSeparator(e) {
    this.nativeElement && (this.nativeElement.decimalSeparator = e);
  }
  /** Determines whether the element's content is shown or hidden on the digital interface. When enabled, the element is visible to users; when disabled, the element is not displayed on the screen.
  *	Property type: boolean
  */
  get digitalDisplay() {
    return this.nativeElement ? this.nativeElement.digitalDisplay : void 0;
  }
  set digitalDisplay(e) {
    this.nativeElement && (this.nativeElement.digitalDisplay = e);
  }
  /** Specifies the placement of the digital display within the element, allowing you to control its alignment (e.g., top, bottom, left, right, or center) relative to the element’s boundaries.
  *	Property type: GaugeDigitalDisplayPosition | string
  */
  get digitalDisplayPosition() {
    return this.nativeElement ? this.nativeElement.digitalDisplayPosition : void 0;
  }
  set digitalDisplayPosition(e) {
    this.nativeElement && (this.nativeElement.digitalDisplayPosition = e);
  }
  /** Determines whether the element is interactive or not. When enabled, the element responds to user actions (such as clicks or keyboard input); when disabled, the element appears inactive and does not accept user interaction.
  *	Property type: boolean
  */
  get disabled() {
    return this.nativeElement ? this.nativeElement.disabled : void 0;
  }
  set disabled(e) {
    this.nativeElement && (this.nativeElement.disabled = e);
  }
  /** Callback function that enables custom rendering of the needle element when using the 'analogDisplayType' setting. This function is called during the drawing process, allowing you to define the appearance and behavior of the needle beyond the default rendering. Only applicable when the display type is set to 'analog'.
  *	Property type: any
  */
  get drawNeedle() {
    return this.nativeElement ? this.nativeElement.drawNeedle : void 0;
  }
  set drawNeedle(e) {
    this.nativeElement && (this.nativeElement.drawNeedle = e);
  }
  /** Defines or retrieves the end angle of the gauge, specifying where the gauge’s scale terminates. The angle is measured in degrees, starting from the gauge’s initial position (commonly 0 degrees). Adjusting this property determines the extent of the gauge’s arc and affects how the scale is rendered visually.
  *	Property type: number
  */
  get endAngle() {
    return this.nativeElement ? this.nativeElement.endAngle : void 0;
  }
  set endAngle(e) {
    this.nativeElement && (this.nativeElement.endAngle = e);
  }
  /** "When the 'coerce' property is set to 'true', all input values are automatically adjusted to fall within the specified interval. Any value outside the interval will be coerced to the nearest boundary value of the interval."
  *	Property type: number
  */
  get interval() {
    return this.nativeElement ? this.nativeElement.interval : void 0;
  }
  set interval(e) {
    this.nativeElement && (this.nativeElement.interval = e);
  }
  /** Specifies the orientation of the gauge. When set to true, the starting and ending positions of the gauge are reversed, causing the gauge to be displayed in the opposite direction. If false, the gauge follows its default direction. Use this option to customize the gauge's flow based on your application's requirements.
  *	Property type: boolean
  */
  get inverted() {
    return this.nativeElement ? this.nativeElement.inverted : void 0;
  }
  set inverted(e) {
    this.nativeElement && (this.nativeElement.inverted = e);
  }
  /** A callback function that allows you to customize the formatting of the values shown within the gauge labels. This function receives the raw value as an argument and should return the formatted string to be displayed. Use this to control the appearance, number formatting, units, or localization of label values inside the gauge.
  *	Property type: any
  */
  get labelFormatFunction() {
    return this.nativeElement ? this.nativeElement.labelFormatFunction : void 0;
  }
  set labelFormatFunction(e) {
    this.nativeElement && (this.nativeElement.labelFormatFunction = e);
  }
  /** Specifies whether the labels within the element are displayed or hidden. When set to true, the labels inside the element are visible; when set to false, the labels are not shown. This property allows you to control the display of label text within the element.
  *	Property type: LabelsVisibility | string
  */
  get labelsVisibility() {
    return this.nativeElement ? this.nativeElement.labelsVisibility : void 0;
  }
  set labelsVisibility(e) {
    this.nativeElement && (this.nativeElement.labelsVisibility = e);
  }
  /** Provides a way to retrieve or assign the unlockKey property, which is a unique code required to activate or gain access to the product's full features. Use this property to securely manage the product's access control.
  *	Property type: string
  */
  get unlockKey() {
    return this.nativeElement ? this.nativeElement.unlockKey : void 0;
  }
  set unlockKey(e) {
    this.nativeElement && (this.nativeElement.unlockKey = e);
  }
  /** Specifies or retrieves the current locale setting, typically defined as a language and regional code (e.g., "en-US" for U.S. English). This property works together with the messages property to determine which localized message set is displayed, enabling proper language and formatting support for users based on their selected locale.
  *	Property type: string
  */
  get locale() {
    return this.nativeElement ? this.nativeElement.locale : void 0;
  }
  set locale(e) {
    this.nativeElement && (this.nativeElement.locale = e);
  }
  /** A callback function that allows you to customize the formatting of messages returned by the Localization Module. Use this to modify how localized strings are structured or displayed before they are delivered to your application, enabling support for advanced formatting, variable interpolation, or context-specific adaptations.
  *	Property type: any
  */
  get localizeFormatFunction() {
    return this.nativeElement ? this.nativeElement.localizeFormatFunction : void 0;
  }
  set localizeFormatFunction(e) {
    this.nativeElement && (this.nativeElement.localizeFormatFunction = e);
  }
  /** Controls whether the element displays data using a logarithmic scale. When enabled, values are plotted on a logarithmic axis, which is useful for visualizing data that spans several orders of magnitude. When disabled, a standard linear scale is used.
  *	Property type: boolean
  */
  get logarithmicScale() {
    return this.nativeElement ? this.nativeElement.logarithmicScale : void 0;
  }
  set logarithmicScale(e) {
    this.nativeElement && (this.nativeElement.logarithmicScale = e);
  }
  /** Specifies the upper limit for the element's scale, preventing it from being scaled beyond this maximum value. This setting ensures that when the element is resized or transformed, its scale will not exceed the defined maximum threshold.
  *	Property type: number
  */
  get max() {
    return this.nativeElement ? this.nativeElement.max : void 0;
  }
  set max(e) {
    this.nativeElement && (this.nativeElement.max = e);
  }
  /** Specifies the event or condition that triggers the update of the element’s value, such as on user input, when focus is lost, or after a specific action occurs. This setting controls how and when changes to the element's value are recognized and processed in the application.
  *	Property type: DragMechanicalAction | string
  */
  get mechanicalAction() {
    return this.nativeElement ? this.nativeElement.mechanicalAction : void 0;
  }
  set mechanicalAction(e) {
    this.nativeElement && (this.nativeElement.mechanicalAction = e);
  }
  /** Specifies or retrieves an object containing the text strings displayed by the widget, allowing for customization and localization of all user-facing messages. This property works together with the locale property to support multiple languages by providing translated strings for different locales. Use this to ensure the widget's interface is fully adaptable to users' language preferences.
  *	Property type: any
  */
  get messages() {
    return this.nativeElement ? this.nativeElement.messages : void 0;
  }
  set messages(e) {
    this.nativeElement && (this.nativeElement.messages = e);
  }
  /** Specifies the lowest allowable value for the element’s scale, preventing the element from being scaled below this threshold. This property ensures that the element cannot appear smaller than the defined minimum scale value.
  *	Property type: number
  */
  get min() {
    return this.nativeElement ? this.nativeElement.min : void 0;
  }
  set min(e) {
    this.nativeElement && (this.nativeElement.min = e);
  }
  /** Specifies whether the element is configured to handle numerical values or date values, enabling appropriate functionality and validation for each data type.
  *	Property type: ScaleMode | string
  */
  get mode() {
    return this.nativeElement ? this.nativeElement.mode : void 0;
  }
  set mode(e) {
    this.nativeElement && (this.nativeElement.mode = e);
  }
  /** Specifies or retrieves the element’s name attribute, which serves as the identifier for the element’s value when form data is submitted to the server. This name is used as the key in the name-value pair sent with the form submission, enabling the server-side application to access the corresponding data.
  *	Property type: string
  */
  get name() {
    return this.nativeElement ? this.nativeElement.name : void 0;
  }
  set name(e) {
    this.nativeElement && (this.nativeElement.name = e);
  }
  /** Specifies the angle or position of the needle when analogDisplayType is set to 'needle'. This value controls where the needle points on the analog display, allowing customization of its exact placement based on the current data or setting.
  *	Property type: GaugeNeedlePosition | string
  */
  get needlePosition() {
    return this.nativeElement ? this.nativeElement.needlePosition : void 0;
  }
  set needlePosition(e) {
    this.nativeElement && (this.nativeElement.needlePosition = e);
  }
  /** Specifies how many digits should be displayed after the decimal point for numeric values. This property is only applicable when the scaleType is set to 'floatingPoint'; it has no effect for other scale types.
  *	Property type: number
  */
  get precisionDigits() {
    return this.nativeElement ? this.nativeElement.precisionDigits : void 0;
  }
  set precisionDigits(e) {
    this.nativeElement && (this.nativeElement.precisionDigits = e);
  }
  /** This property is an array containing multiple objects, where each object defines a distinct range. Each range represents a colored area characterized by its own specific size and properties, such as start and end values, color, and label. These ranges allow you to visually differentiate segments according to predefined criteria on a graphical interface or data visualization component.
  *	Property type: {startValue: number, endValue: number, className: string}[]
  */
  get ranges() {
    return this.nativeElement ? this.nativeElement.ranges : void 0;
  }
  set ranges(e) {
    this.nativeElement && (this.nativeElement.ranges = e);
  }
  /** When the element is set to read-only, users are unable to modify its value or content; they can view the information but cannot interact with or edit the element in any way.
  *	Property type: boolean
  */
  get readonly() {
    return this.nativeElement ? this.nativeElement.readonly : void 0;
  }
  set readonly(e) {
    this.nativeElement && (this.nativeElement.readonly = e);
  }
  /** Specifies whether the element should use right-to-left (RTL) alignment to support languages and locales that utilize right-to-left fonts, such as Arabic or Hebrew. When enabled, the element's scale is inverted, and all labels and digital displays are repositioned and rendered in a right-to-left orientation to ensure proper localization and readability for RTL scripts. This property can be both set and retrieved.
  *	Property type: boolean
  */
  get rightToLeft() {
    return this.nativeElement ? this.nativeElement.rightToLeft : void 0;
  }
  set rightToLeft(e) {
    this.nativeElement && (this.nativeElement.rightToLeft = e);
  }
  /** Specifies the placement of the scale within the element, indicating where the scale will appear (e.g., top, bottom, left, or right) relative to the element.
  *	Property type: GaugeScalePosition | string
  */
  get scalePosition() {
    return this.nativeElement ? this.nativeElement.scalePosition : void 0;
  }
  set scalePosition(e) {
    this.nativeElement && (this.nativeElement.scalePosition = e);
  }
  /** Specifies the data type used for the gauge’s value and defines the corresponding scale (e.g., linear, logarithmic). This setting ensures that input values are interpreted correctly and displayed with the appropriate measurement scale on the gauge.
  *	Property type: ScaleType | string
  */
  get scaleType() {
    return this.nativeElement ? this.nativeElement.scaleType : void 0;
  }
  set scaleType(e) {
    this.nativeElement && (this.nativeElement.scaleType = e);
  }
  /** Specifies whether numerical values should be displayed using scientific notation (e.g., 1.23e+4) instead of standard decimal formatting. Set to true to enable scientific notation, or false to display numbers in regular decimal form.
  *	Property type: boolean
  */
  get scientificNotation() {
    return this.nativeElement ? this.nativeElement.scientificNotation : void 0;
  }
  set scientificNotation(e) {
    this.nativeElement && (this.nativeElement.scientificNotation = e);
  }
  /** This property determines whether the gauge’s range indicators are displayed on the gauge component. When set to true, the range segments (such as colored bands or sections representing value intervals) will be visible on the gauge; when set to false, these range indicators will be hidden.
  *	Property type: boolean
  */
  get showRanges() {
    return this.nativeElement ? this.nativeElement.showRanges : void 0;
  }
  set showRanges(e) {
    this.nativeElement && (this.nativeElement.showRanges = e);
  }
  /** Controls whether units are shown or hidden in the user interface, allowing you to toggle the display of measurement units (e.g., px, %, em) alongside values.
  *	Property type: boolean
  */
  get showUnit() {
    return this.nativeElement ? this.nativeElement.showUnit : void 0;
  }
  set showUnit(e) {
    this.nativeElement && (this.nativeElement.showUnit = e);
  }
  /** Calculates the number of significant digits present in a given number. This property is relevant only when the scaleType is set to 'integer', ensuring that the digit count pertains exclusively to whole numbers, not decimals or other formats.
  *	Property type: number | null
  */
  get significantDigits() {
    return this.nativeElement ? this.nativeElement.significantDigits : void 0;
  }
  set significantDigits(e) {
    this.nativeElement && (this.nativeElement.significantDigits = e);
  }
  /** Specifies the method used to determine the overall dimensions (width and height) of the Gauge component, affecting how it adapts to its parent container or specified sizing rules.
  *	Property type: GaugeSizeMode | string
  */
  get sizeMode() {
    return this.nativeElement ? this.nativeElement.sizeMode : void 0;
  }
  set sizeMode(e) {
    this.nativeElement && (this.nativeElement.sizeMode = e);
  }
  /** Sets or retrieves the starting angle of the gauge. This property defines the position, in degrees, where the gauge's scale begins, measured clockwise from the reference point (typically the rightmost horizontal axis at 0 degrees). Adjusting this value changes where the gauge arc starts, allowing for customized gauge orientations.
  *	Property type: number
  */
  get startAngle() {
    return this.nativeElement ? this.nativeElement.startAngle : void 0;
  }
  set startAngle(e) {
    this.nativeElement && (this.nativeElement.startAngle = e);
  }
  /** Sets or retrieves the visual theme applied to the element, allowing you to customize or query its overall appearance—such as colors, backgrounds, and style variations—to match different design schemes.
  *	Property type: string
  */
  get theme() {
    return this.nativeElement ? this.nativeElement.theme : void 0;
  }
  set theme(e) {
    this.nativeElement && (this.nativeElement.theme = e);
  }
  /** Specifies the exact placement of tick marks along the Gauge's scale, such as inside, outside, or across the gauge axis. This setting controls where the ticks appear relative to the gauge track for improved readability and customization.
  *	Property type: TicksPosition | string
  */
  get ticksPosition() {
    return this.nativeElement ? this.nativeElement.ticksPosition : void 0;
  }
  set ticksPosition(e) {
    this.nativeElement && (this.nativeElement.ticksPosition = e);
  }
  /** Controls whether the ticks are displayed or hidden on the axis. If set to true, ticks will be visible; if false, ticks will be hidden. This option allows you to toggle the tick marks for improved chart customization.
  *	Property type: TicksVisibility | string
  */
  get ticksVisibility() {
    return this.nativeElement ? this.nativeElement.ticksVisibility : void 0;
  }
  set ticksVisibility(e) {
    this.nativeElement && (this.nativeElement.ticksVisibility = e);
  }
  /** Specifies whether the element can receive keyboard focus. When set to true, the element can be focused programmatically or via user interaction (such as using the Tab key); when set to false, the element will be excluded from the tab order and cannot be focused.
  *	Property type: boolean
  */
  get unfocusable() {
    return this.nativeElement ? this.nativeElement.unfocusable : void 0;
  }
  set unfocusable(e) {
    this.nativeElement && (this.nativeElement.unfocusable = e);
  }
  /** Specifies or retrieves the unit of measurement (such as pixels, percentage, or em) that is applied to the values displayed on the element's scale. This determines how the scale values are interpreted and rendered for the element.
  *	Property type: string
  */
  get unit() {
    return this.nativeElement ? this.nativeElement.unit : void 0;
  }
  set unit(e) {
    this.nativeElement && (this.nativeElement.unit = e);
  }
  /** Defines validation constraints for the value by specifying minimum and maximum allowable limits. Ensures that the value entered falls within the specified range.
  *	Property type: Validation | string
  */
  get validation() {
    return this.nativeElement ? this.nativeElement.validation : void 0;
  }
  set validation(e) {
    this.nativeElement && (this.nativeElement.validation = e);
  }
  /** Sets or retrieves the current value of the element. If the scaleType property is set to 'date', the value must be a date object or a valid date string; otherwise, the value should match the expected data type for the current scaleType.
  *	Property type: string | number | Date
  */
  get value() {
    return this.nativeElement ? this.nativeElement.value : void 0;
  }
  set value(e) {
    this.nativeElement && (this.nativeElement.value = e);
  }
  /** Gets or sets the word length used for values. This property is only applicable when scaleType is set to 'integer'; it has no effect for other scale types.
  *	Property type: WordLength | string
  */
  get wordLength() {
    return this.nativeElement ? this.nativeElement.wordLength : void 0;
  }
  set wordLength(e) {
    this.nativeElement && (this.nativeElement.wordLength = e);
  }
  // Gets the properties of the React component.
  get properties() {
    return ["analogDisplayType", "animation", "animationDuration", "coerce", "customInterval", "customTicks", "dateLabelFormatString", "decimalSeparator", "digitalDisplay", "digitalDisplayPosition", "disabled", "drawNeedle", "endAngle", "interval", "inverted", "labelFormatFunction", "labelsVisibility", "unlockKey", "locale", "localizeFormatFunction", "logarithmicScale", "max", "mechanicalAction", "messages", "min", "mode", "name", "needlePosition", "precisionDigits", "ranges", "readonly", "rightToLeft", "scalePosition", "scaleType", "scientificNotation", "showRanges", "showUnit", "significantDigits", "sizeMode", "startAngle", "theme", "ticksPosition", "ticksVisibility", "unfocusable", "unit", "validation", "value", "wordLength"];
  }
  // Gets the events of the React component.
  get eventListeners() {
    return ["onChange", "onCreate", "onReady"];
  }
  /** Sets keyboard focus to the specified element, making it the active element for user input and interaction. This allows users to immediately begin typing or interacting with the element without manually clicking or tabbing to it. Commonly used for form fields or interactive components to improve accessibility and user experience.
  */
  focus() {
    this.nativeElement.isRendered ? this.nativeElement.focus() : this.nativeElement.whenRendered(() => {
      this.nativeElement.focus();
    });
  }
  /** Returns the optimal size of the element, including the current width and the calculated height based on the layout and dimensions of its internal child elements. This ensures the element can fully contain its content without overflow, reflecting the most appropriate size for display.
    * @returns {any}
  */
  getOptimalSize() {
    return this.nativeElement.getOptimalSize();
  }
  /** Retrieves or updates the current value displayed by the gauge component. Use this to programmatically read the gauge’s status or set it to a new value within its defined range.
    * @param {string | number | Date} value?. The value to be set. If no parameter is passed, returns the current value of the gauge. The value can be a date only when <b>scaleType</b> is 'date'.
    * @returns {string}
  */
  val(e) {
    return this.nativeElement.val(e);
  }
  constructor(e) {
    super(e), this.componentRef = React.createRef();
  }
  componentDidRender(e) {
    const i = this, a = {}, n = {};
    let r = null;
    const s = (o) => {
      const l = /* @__PURE__ */ new WeakSet();
      return JSON.stringify(o, (c, m) => {
        if (m !== null && typeof m == "object") {
          if (l.has(m))
            return;
          l.add(m);
        }
        return m;
      });
    };
    for (let o in i.props)
      if (o !== "children") {
        if (o === "style") {
          r = i.props[o];
          continue;
        }
        if (o.startsWith("on") && i.properties.indexOf(o) === -1) {
          n[o] = i.props[o];
          continue;
        }
        a[o] = i.props[o];
      }
    e && (i.nativeElement = this.componentRef.current, i.nativeElement.React = React, i.nativeElement.ReactDOM = ReactDOM, i.nativeElement && !i.nativeElement.isCompleted && (i.nativeElement.reactStateProps = JSON.parse(s(a)))), e && i.nativeElement && i.nativeElement.isCompleted;
    for (let o in a) {
      if (o === "class" || o === "className") {
        const l = a[o].trim().split(" ");
        if (i.nativeElement._classNames) {
          const c = i.nativeElement._classNames;
          for (let m in c)
            i.nativeElement.classList.contains(c[m]) && c[m] !== "" && i.nativeElement.classList.remove(c[m]);
        }
        i.nativeElement._classNames = l;
        for (let c in l)
          !i.nativeElement.classList.contains(l[c]) && l[c] !== "" && i.nativeElement.classList.add(l[c]);
        continue;
      }
      if (a[o] !== i.nativeElement[o]) {
        const l = (m) => m.replace(/-([a-z])/g, function(u) {
          return u[1].toUpperCase();
        });
        (o === "hover" || o === "active" || o === "focus" || o === "selected") && i.nativeElement.setAttribute(o, "");
        const c = l(o);
        if (i.nativeElement[c] === void 0 && i.nativeElement.setAttribute(o, a[o]), a[o] !== void 0) {
          if (typeof a[o] == "object" && i.nativeElement.reactStateProps && !e && s(a[o]) === s(i.nativeElement.reactStateProps[c]))
            continue;
          i.nativeElement[c] = a[o];
        }
      }
    }
    for (let o in n)
      i[o] = n[o], i.nativeElement[o.toLowerCase()] = n[o];
    if (e && (Smart$1.Render(), i.onCreate && i.onCreate(), i.nativeElement.whenRendered(() => {
      i.onReady && i.onReady();
    })), r)
      for (let o in r)
        i.nativeElement.style[o] = r[o];
  }
  componentDidMount() {
    this.componentDidRender(!0);
  }
  componentDidUpdate() {
    this.componentDidRender(!1);
  }
  componentWillUnmount() {
    const e = this;
    if (e.nativeElement) {
      e.nativeElement.whenRenderedCallbacks = [];
      for (let i = 0; i < e.eventListeners.length; i++) {
        const a = e.eventListeners[i];
        e.nativeElement.removeEventListener(a.substring(2).toLowerCase(), e[a]);
      }
    }
  }
  render() {
    return React.createElement("smart-gauge", { ref: this.componentRef, suppressHydrationWarning: !0 }, this.props.children);
  }
}
const themeVars = `'{"Input:backgroundColor-Gauge": "var(--xmlui-backgroundColor-Gauge)", "Input:textColor-Gauge": "var(--xmlui-textColor-Gauge)", "Input:primaryColor-Gauge": "var(--xmlui-primaryColor-Gauge)"}'`, gaugeContainer = "_gaugeContainer_1e254_14", styles = {
  themeVars,
  gaugeContainer
};
var classnames$1 = { exports: {} };
/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
var hasRequiredClassnames;
function requireClassnames() {
  return hasRequiredClassnames || (hasRequiredClassnames = 1, (function(t) {
    (function() {
      var e = {}.hasOwnProperty;
      function i() {
        for (var r = "", s = 0; s < arguments.length; s++) {
          var o = arguments[s];
          o && (r = n(r, a(o)));
        }
        return r;
      }
      function a(r) {
        if (typeof r == "string" || typeof r == "number")
          return r;
        if (typeof r != "object")
          return "";
        if (Array.isArray(r))
          return i.apply(null, r);
        if (r.toString !== Object.prototype.toString && !r.toString.toString().includes("[native code]"))
          return r.toString();
        var s = "";
        for (var o in r)
          e.call(r, o) && r[o] && (s = n(s, o));
        return s;
      }
      function n(r, s) {
        return s ? r ? r + " " + s : r + s : r;
      }
      t.exports ? (i.default = i, t.exports = i) : window.classNames = i;
    })();
  })(classnames$1)), classnames$1.exports;
}
var classnamesExports = requireClassnames();
const classnames = /* @__PURE__ */ getDefaultExportFromCjs(classnamesExports), GaugeRender = forwardRef(({
  value: t,
  onChange: e,
  registerApi: i,
  className: a,
  min: n = 0,
  max: r = 100,
  analogDisplayType: s = "needle",
  digitalDisplay: o = !1,
  startAngle: l = -30,
  endAngle: c = 210,
  scalePosition: m = "inside",
  animation: u = "none",
  unit: p = "",
  showUnit: h = !1,
  enabled: g = !0,
  ...f
}, b) => {
  const y = useRef(null), _ = typeof t == "number" ? t : n;
  useEffect(() => {
    i?.({
      focus: () => y.current?.focus(),
      setValue: (w) => e?.(Number(w))
    });
  }, [i, e]);
  const x = useCallback((w) => {
    const S = w?.detail?.value ?? w?.detail;
    S != null && e(Math.round(Number(S) * 100) / 100);
  }, [e]);
  return /* @__PURE__ */ jsx("div", { ref: b, className: classnames(styles.gaugeContainer, a), ...f, children: /* @__PURE__ */ jsx(
    Gauge,
    {
      ref: y,
      value: _,
      min: n,
      max: r,
      analogDisplayType: s,
      digitalDisplay: o,
      startAngle: l,
      endAngle: c,
      scalePosition: m,
      animation: u,
      unit: p,
      showUnit: h,
      disabled: !g,
      precisionDigits: 0,
      onChange: x
    }
  ) });
});
GaugeRender.displayName = "GaugeRender";
const COMP = "Gauge", GaugeMd = createMetadata({
  status: "experimental",
  description: "`Gauge` wraps the Smart UI Gauge web component, providing a circular dial display for numeric values with full XMLUI theming integration.",
  props: {
    initialValue: dInitialValue(),
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
    analogDisplayType: d(
      "Display type: 'needle', 'fill', or 'line'.",
      void 0,
      "string",
      "needle"
    ),
    digitalDisplay: d("Show digital value display.", void 0, "boolean", !1),
    startAngle: d("Start angle in degrees.", void 0, "number", -30),
    endAngle: d("End angle in degrees.", void 0, "number", 210),
    scalePosition: d(
      "Scale position: 'inside', 'outside', or 'none'.",
      void 0,
      "string",
      "inside"
    ),
    animation: d("Animation type: 'none' or 'advanced'.", void 0, "string", "none"),
    unit: d("Unit text appended to values.", void 0, "string", ""),
    showUnit: d("Whether to show the unit.", void 0, "boolean", !1),
    enabled: dEnabled()
  },
  events: {
    didChange: dDidChange(COMP)
  },
  apis: {
    value: {
      description: "Gets the current gauge value.",
      signature: "get value(): number | undefined"
    },
    setValue: {
      description: "Sets the gauge value programmatically.",
      signature: "setValue(value: number): void",
      parameters: {
        value: "The new numeric value."
      }
    },
    focus: {
      description: "Sets focus on the gauge.",
      signature: "focus(): void"
    }
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-50",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`primaryColor-${COMP}`]: "$color-primary"
  }
}), gaugeComponentRenderer = wrapCompound(COMP, GaugeRender, GaugeMd, {
  booleans: ["enabled", "digitalDisplay", "showUnit"],
  numbers: ["minValue", "maxValue", "startAngle", "endAngle"],
  strings: ["analogDisplayType", "scalePosition", "animation", "unit"],
  events: {
    didChange: "onDidChange"
  },
  rename: {
    minValue: "min",
    maxValue: "max"
  },
  parseInitialValue: (t, e) => {
    const i = Number(e.min) || 0, a = Number(e.max) || 100;
    let n = typeof t == "string" ? parseFloat(t) : t;
    return (n == null || isNaN(n)) && (n = i), Math.min(a, Math.max(i, Number(n)));
  },
  formatExternalValue: (t, e) => {
    const i = Number(e.min) || 0, a = Number(e.max) || 100, n = Number(t);
    return isNaN(n) ? i : Math.min(a, Math.max(i, n));
  }
}), index = {
  namespace: "XMLUIExtensions",
  components: [gaugeComponentRenderer]
};
export {
  index as default
};

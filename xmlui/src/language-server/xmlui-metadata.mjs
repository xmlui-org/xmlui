import { jsx as p, jsxs as j, Fragment as gr } from "react/jsx-runtime";
import * as Ve from "react";
import Ae, { useRef as he, useInsertionEffect as Yl, useCallback as X, useContext as $r, useEffect as K, useLayoutEffect as Bo, useState as me, forwardRef as xe, useMemo as ue, useId as mo, createContext as Zr, useDeferredValue as Xl, useImperativeHandle as Ql, Children as Ho, isValidElement as jo, createElement as Io, cloneElement as Bn, Fragment as In, memo as $n } from "react";
import { throttle as Zl, omitBy as jl, isUndefined as Jl, isEmpty as $a, noop as La, isArray as Kl, isNumber as Ln, isNil as vi, isEqual as ed, union as rd, uniq as td, orderBy as od } from "lodash-es";
import { Link as ad } from "@remix-run/react";
import { DayPicker as gi } from "react-day-picker";
import { parse as Yo, format as wt, parseISO as id, isValid as _n } from "date-fns";
import * as nt from "@radix-ui/react-dropdown-menu";
import { flushSync as An } from "react-dom";
import At from "immer";
import * as qt from "@radix-ui/react-dialog";
import { createContext as nd, useContextSelector as ld } from "use-context-selector";
import * as dd from "react-dropzone";
import * as sd from "@radix-ui/react-visually-hidden";
import { Portal as Nn, Root as ud, Trigger as cd, Value as md, Icon as pd, Content as hd, ScrollUpButton as xd, Viewport as bd, ScrollDownButton as fd, Item as vd, ItemText as gd, ItemIndicator as Td } from "@radix-ui/react-select";
import { Popover as yd, PopoverTrigger as Cd, PopoverContent as kd } from "@radix-ui/react-popover";
import { Command as Wn, CommandInput as _a, CommandList as On, CommandEmpty as Rn, CommandItem as Xa, CommandGroup as Sd } from "cmdk";
import * as Aa from "@radix-ui/react-radio-group";
import wd from "react-textarea-autosize";
import { Root as zn, Track as Hd, Range as Bd, Thumb as Id } from "@radix-ui/react-slider";
import { useReactTable as $d, getPaginationRowModel as Ld, getCoreRowModel as _d, flexRender as Ti } from "@tanstack/react-table";
import { observeElementOffset as Ad, useVirtualizer as Nd } from "@tanstack/react-virtual";
import * as Wd from "@radix-ui/react-accordion";
import { parseRegExpLiteral as yi } from "@eslint-community/regexpp";
import Od from "embla-carousel-react";
import Rd from "embla-carousel-autoplay";
const zd = `'{"padding-Button": "var(--xmlui-padding-Button)", "paddingHorizontal-Button": "var(--xmlui-paddingHorizontal-Button, var(--xmlui-padding-Button))", "paddingVertical-Button": "var(--xmlui-paddingVertical-Button, var(--xmlui-padding-Button))", "paddingLeft-Button": "var(--xmlui-paddingLeft-Button, var(--xmlui-paddingHorizontal-Button, var(--xmlui-padding-Button)))", "paddingRight-Button": "var(--xmlui-paddingRight-Button, var(--xmlui-paddingHorizontal-Button, var(--xmlui-padding-Button)))", "paddingTop-Button": "var(--xmlui-paddingTop-Button, var(--xmlui-paddingVertical-Button, var(--xmlui-padding-Button)))", "paddingBottom-Button": "var(--xmlui-paddingBottom-Button, var(--xmlui-paddingVertical-Button, var(--xmlui-padding-Button)))", "padding-Button-xs": "var(--xmlui-padding-Button-xs)", "paddingHorizontal-Button-xs": "var(--xmlui-paddingHorizontal-Button-xs, var(--xmlui-padding-Button-xs))", "paddingVertical-Button-xs": "var(--xmlui-paddingVertical-Button-xs, var(--xmlui-padding-Button-xs))", "paddingLeft-Button-xs": "var(--xmlui-paddingLeft-Button-xs, var(--xmlui-paddingHorizontal-Button-xs, var(--xmlui-padding-Button-xs)))", "paddingRight-Button-xs": "var(--xmlui-paddingRight-Button-xs, var(--xmlui-paddingHorizontal-Button-xs, var(--xmlui-padding-Button-xs)))", "paddingTop-Button-xs": "var(--xmlui-paddingTop-Button-xs, var(--xmlui-paddingVertical-Button-xs, var(--xmlui-padding-Button-xs)))", "paddingBottom-Button-xs": "var(--xmlui-paddingBottom-Button-xs, var(--xmlui-paddingVertical-Button-xs, var(--xmlui-padding-Button-xs)))", "padding-Button-sm": "var(--xmlui-padding-Button-sm)", "paddingHorizontal-Button-sm": "var(--xmlui-paddingHorizontal-Button-sm, var(--xmlui-padding-Button-sm))", "paddingVertical-Button-sm": "var(--xmlui-paddingVertical-Button-sm, var(--xmlui-padding-Button-sm))", "paddingLeft-Button-sm": "var(--xmlui-paddingLeft-Button-sm, var(--xmlui-paddingHorizontal-Button-sm, var(--xmlui-padding-Button-sm)))", "paddingRight-Button-sm": "var(--xmlui-paddingRight-Button-sm, var(--xmlui-paddingHorizontal-Button-sm, var(--xmlui-padding-Button-sm)))", "paddingTop-Button-sm": "var(--xmlui-paddingTop-Button-sm, var(--xmlui-paddingVertical-Button-sm, var(--xmlui-padding-Button-sm)))", "paddingBottom-Button-sm": "var(--xmlui-paddingBottom-Button-sm, var(--xmlui-paddingVertical-Button-sm, var(--xmlui-padding-Button-sm)))", "padding-Button-md": "var(--xmlui-padding-Button-md)", "paddingHorizontal-Button-md": "var(--xmlui-paddingHorizontal-Button-md, var(--xmlui-padding-Button-md))", "paddingVertical-Button-md": "var(--xmlui-paddingVertical-Button-md, var(--xmlui-padding-Button-md))", "paddingLeft-Button-md": "var(--xmlui-paddingLeft-Button-md, var(--xmlui-paddingHorizontal-Button-md, var(--xmlui-padding-Button-md)))", "paddingRight-Button-md": "var(--xmlui-paddingRight-Button-md, var(--xmlui-paddingHorizontal-Button-md, var(--xmlui-padding-Button-md)))", "paddingTop-Button-md": "var(--xmlui-paddingTop-Button-md, var(--xmlui-paddingVertical-Button-md, var(--xmlui-padding-Button-md)))", "paddingBottom-Button-md": "var(--xmlui-paddingBottom-Button-md, var(--xmlui-paddingVertical-Button-md, var(--xmlui-padding-Button-md)))", "padding-Button-lg": "var(--xmlui-padding-Button-lg)", "paddingHorizontal-Button-lg": "var(--xmlui-paddingHorizontal-Button-lg, var(--xmlui-padding-Button-lg))", "paddingVertical-Button-lg": "var(--xmlui-paddingVertical-Button-lg, var(--xmlui-padding-Button-lg))", "paddingLeft-Button-lg": "var(--xmlui-paddingLeft-Button-lg, var(--xmlui-paddingHorizontal-Button-lg, var(--xmlui-padding-Button-lg)))", "paddingRight-Button-lg": "var(--xmlui-paddingRight-Button-lg, var(--xmlui-paddingHorizontal-Button-lg, var(--xmlui-padding-Button-lg)))", "paddingTop-Button-lg": "var(--xmlui-paddingTop-Button-lg, var(--xmlui-paddingVertical-Button-lg, var(--xmlui-padding-Button-lg)))", "paddingBottom-Button-lg": "var(--xmlui-paddingBottom-Button-lg, var(--xmlui-paddingVertical-Button-lg, var(--xmlui-padding-Button-lg)))", "width-Button": "var(--xmlui-width-Button)", "height-Button": "var(--xmlui-height-Button)", "fontFamily-Button-primary-solid": "var(--xmlui-fontFamily-Button-primary-solid)", "fontSize-Button-primary-solid": "var(--xmlui-fontSize-Button-primary-solid)", "fontWeight-Button-primary-solid": "var(--xmlui-fontWeight-Button-primary-solid)", "borderRadius-Button-primary-solid": "var(--xmlui-borderRadius-Button-primary-solid)", "borderWidth-Button-primary-solid": "var(--xmlui-borderWidth-Button-primary-solid)", "borderColor-Button-primary-solid": "var(--xmlui-borderColor-Button-primary-solid)", "borderStyle-Button-primary-solid": "var(--xmlui-borderStyle-Button-primary-solid)", "backgroundColor-Button-primary-solid": "var(--xmlui-backgroundColor-Button-primary-solid)", "color-Button-primary-solid": "var(--xmlui-color-Button-primary-solid)", "boxShadow-Button-primary-solid": "var(--xmlui-boxShadow-Button-primary-solid)", "outlineWidth-Button-primary-solid--focus": "var(--xmlui-outlineWidth-Button-primary-solid--focus)", "outlineColor-Button-primary-solid--focus": "var(--xmlui-outlineColor-Button-primary-solid--focus)", "outlineStyle-Button-primary-solid--focus": "var(--xmlui-outlineStyle-Button-primary-solid--focus)", "outlineOffset-Button-primary-solid--focus": "var(--xmlui-outlineOffset-Button-primary-solid--focus)", "borderColor-Button-primary-solid--hover": "var(--xmlui-borderColor-Button-primary-solid--hover)", "color-Button-primary-solid--hover": "var(--xmlui-color-Button-primary-solid--hover)", "backgroundColor-Button-primary-solid--hover": "var(--xmlui-backgroundColor-Button-primary-solid--hover)", "borderColor-Button-primary-solid--active": "var(--xmlui-borderColor-Button-primary-solid--active)", "color-Button-primary-solid--active": "var(--xmlui-color-Button-primary-solid--active)", "boxShadow-Button-primary-solid--active": "var(--xmlui-boxShadow-Button-primary-solid--active)", "backgroundColor-Button-primary-solid--active": "var(--xmlui-backgroundColor-Button-primary-solid--active)", "backgroundColor-Button--disabled": "var(--xmlui-backgroundColor-Button--disabled)", "color-Button--disabled": "var(--xmlui-color-Button--disabled)", "borderColor-Button--disabled": "var(--xmlui-borderColor-Button--disabled)", "fontFamily-Button-secondary-solid": "var(--xmlui-fontFamily-Button-secondary-solid)", "fontSize-Button-secondary-solid": "var(--xmlui-fontSize-Button-secondary-solid)", "fontWeight-Button-secondary-solid": "var(--xmlui-fontWeight-Button-secondary-solid)", "borderRadius-Button-secondary-solid": "var(--xmlui-borderRadius-Button-secondary-solid)", "borderWidth-Button-secondary-solid": "var(--xmlui-borderWidth-Button-secondary-solid)", "borderColor-Button-secondary-solid": "var(--xmlui-borderColor-Button-secondary-solid)", "borderStyle-Button-secondary-solid": "var(--xmlui-borderStyle-Button-secondary-solid)", "backgroundColor-Button-secondary-solid": "var(--xmlui-backgroundColor-Button-secondary-solid)", "color-Button-secondary-solid": "var(--xmlui-color-Button-secondary-solid)", "boxShadow-Button-secondary-solid": "var(--xmlui-boxShadow-Button-secondary-solid)", "outlineWidth-Button-secondary-solid--focus": "var(--xmlui-outlineWidth-Button-secondary-solid--focus)", "outlineColor-Button-secondary-solid--focus": "var(--xmlui-outlineColor-Button-secondary-solid--focus)", "outlineStyle-Button-secondary-solid--focus": "var(--xmlui-outlineStyle-Button-secondary-solid--focus)", "outlineOffset-Button-secondary-solid--focus": "var(--xmlui-outlineOffset-Button-secondary-solid--focus)", "borderColor-Button-secondary-solid--hover": "var(--xmlui-borderColor-Button-secondary-solid--hover)", "color-Button-secondary-solid--hover": "var(--xmlui-color-Button-secondary-solid--hover)", "backgroundColor-Button-secondary-solid--hover": "var(--xmlui-backgroundColor-Button-secondary-solid--hover)", "borderColor-Button-secondary-solid--active": "var(--xmlui-borderColor-Button-secondary-solid--active)", "color-Button-secondary-solid--active": "var(--xmlui-color-Button-secondary-solid--active)", "boxShadow-Button-secondary-solid--active": "var(--xmlui-boxShadow-Button-secondary-solid--active)", "backgroundColor-Button-secondary-solid--active": "var(--xmlui-backgroundColor-Button-secondary-solid--active)", "fontFamily-Button-attention-solid": "var(--xmlui-fontFamily-Button-attention-solid)", "fontSize-Button-attention-solid": "var(--xmlui-fontSize-Button-attention-solid)", "fontWeight-Button-attention-solid": "var(--xmlui-fontWeight-Button-attention-solid)", "borderRadius-Button-attention-solid": "var(--xmlui-borderRadius-Button-attention-solid)", "borderWidth-Button-attention-solid": "var(--xmlui-borderWidth-Button-attention-solid)", "borderColor-Button-attention-solid": "var(--xmlui-borderColor-Button-attention-solid)", "borderStyle-Button-attention-solid": "var(--xmlui-borderStyle-Button-attention-solid)", "backgroundColor-Button-attention-solid": "var(--xmlui-backgroundColor-Button-attention-solid)", "color-Button-attention-solid": "var(--xmlui-color-Button-attention-solid)", "boxShadow-Button-attention-solid": "var(--xmlui-boxShadow-Button-attention-solid)", "outlineWidth-Button-attention-solid--focus": "var(--xmlui-outlineWidth-Button-attention-solid--focus)", "outlineColor-Button-attention-solid--focus": "var(--xmlui-outlineColor-Button-attention-solid--focus)", "outlineStyle-Button-attention-solid--focus": "var(--xmlui-outlineStyle-Button-attention-solid--focus)", "outlineOffset-Button-attention-solid--focus": "var(--xmlui-outlineOffset-Button-attention-solid--focus)", "borderColor-Button-attention-solid--hover": "var(--xmlui-borderColor-Button-attention-solid--hover)", "color-Button-attention-solid--hover": "var(--xmlui-color-Button-attention-solid--hover)", "backgroundColor-Button-attention-solid--hover": "var(--xmlui-backgroundColor-Button-attention-solid--hover)", "borderColor-Button-attention-solid--active": "var(--xmlui-borderColor-Button-attention-solid--active)", "color-Button-attention-solid--active": "var(--xmlui-color-Button-attention-solid--active)", "boxShadow-Button-attention-solid--active": "var(--xmlui-boxShadow-Button-attention-solid--active)", "backgroundColor-Button-attention-solid--active": "var(--xmlui-backgroundColor-Button-attention-solid--active)", "fontFamily-Button-primary-outlined": "var(--xmlui-fontFamily-Button-primary-outlined)", "fontSize-Button-primary-outlined": "var(--xmlui-fontSize-Button-primary-outlined)", "fontWeight-Button-primary-outlined": "var(--xmlui-fontWeight-Button-primary-outlined)", "borderRadius-Button-primary-outlined": "var(--xmlui-borderRadius-Button-primary-outlined)", "borderWidth-Button-primary-outlined": "var(--xmlui-borderWidth-Button-primary-outlined)", "borderColor-Button-primary-outlined": "var(--xmlui-borderColor-Button-primary-outlined)", "borderStyle-Button-primary-outlined": "var(--xmlui-borderStyle-Button-primary-outlined)", "color-Button-primary-outlined": "var(--xmlui-color-Button-primary-outlined)", "boxShadow-Button-primary-outlined": "var(--xmlui-boxShadow-Button-primary-outlined)", "outlineWidth-Button-primary-outlined--focus": "var(--xmlui-outlineWidth-Button-primary-outlined--focus)", "outlineColor-Button-primary-outlined--focus": "var(--xmlui-outlineColor-Button-primary-outlined--focus)", "outlineStyle-Button-primary-outlined--focus": "var(--xmlui-outlineStyle-Button-primary-outlined--focus)", "outlineOffset-Button-primary-outlined--focus": "var(--xmlui-outlineOffset-Button-primary-outlined--focus)", "borderColor-Button-primary-outlined--hover": "var(--xmlui-borderColor-Button-primary-outlined--hover)", "backgroundColor-Button-primary-outlined--hover": "var(--xmlui-backgroundColor-Button-primary-outlined--hover)", "color-Button-primary-outlined--hover": "var(--xmlui-color-Button-primary-outlined--hover)", "borderColor-Button-primary-outlined--active": "var(--xmlui-borderColor-Button-primary-outlined--active)", "backgroundColor-Button-primary-outlined--active": "var(--xmlui-backgroundColor-Button-primary-outlined--active)", "color-Button-primary-outlined--active": "var(--xmlui-color-Button-primary-outlined--active)", "fontFamily-Button-secondary-outlined": "var(--xmlui-fontFamily-Button-secondary-outlined)", "fontSize-Button-secondary-outlined": "var(--xmlui-fontSize-Button-secondary-outlined)", "fontWeight-Button-secondary-outlined": "var(--xmlui-fontWeight-Button-secondary-outlined)", "borderRadius-Button-secondary-outlined": "var(--xmlui-borderRadius-Button-secondary-outlined)", "borderWidth-Button-secondary-outlined": "var(--xmlui-borderWidth-Button-secondary-outlined)", "borderColor-Button-secondary-outlined": "var(--xmlui-borderColor-Button-secondary-outlined)", "borderStyle-Button-secondary-outlined": "var(--xmlui-borderStyle-Button-secondary-outlined)", "color-Button-secondary-outlined": "var(--xmlui-color-Button-secondary-outlined)", "boxShadow-Button-secondary-outlined": "var(--xmlui-boxShadow-Button-secondary-outlined)", "outlineWidth-Button-secondary-outlined--focus": "var(--xmlui-outlineWidth-Button-secondary-outlined--focus)", "outlineColor-Button-secondary-outlined--focus": "var(--xmlui-outlineColor-Button-secondary-outlined--focus)", "outlineStyle-Button-secondary-outlined--focus": "var(--xmlui-outlineStyle-Button-secondary-outlined--focus)", "outlineOffset-Button-secondary-outlined--focus": "var(--xmlui-outlineOffset-Button-secondary-outlined--focus)", "borderColor-Button-secondary-outlined--hover": "var(--xmlui-borderColor-Button-secondary-outlined--hover)", "backgroundColor-Button-secondary-outlined--hover": "var(--xmlui-backgroundColor-Button-secondary-outlined--hover)", "color-Button-secondary-outlined--hover": "var(--xmlui-color-Button-secondary-outlined--hover)", "borderColor-Button-secondary-outlined--active": "var(--xmlui-borderColor-Button-secondary-outlined--active)", "backgroundColor-Button-secondary-outlined--active": "var(--xmlui-backgroundColor-Button-secondary-outlined--active)", "color-Button-secondary-outlined--active": "var(--xmlui-color-Button-secondary-outlined--active)", "fontFamily-Button-attention-outlined": "var(--xmlui-fontFamily-Button-attention-outlined)", "fontSize-Button-attention-outlined": "var(--xmlui-fontSize-Button-attention-outlined)", "fontWeight-Button-attention-outlined": "var(--xmlui-fontWeight-Button-attention-outlined)", "borderRadius-Button-attention-outlined": "var(--xmlui-borderRadius-Button-attention-outlined)", "borderWidth-Button-attention-outlined": "var(--xmlui-borderWidth-Button-attention-outlined)", "borderColor-Button-attention-outlined": "var(--xmlui-borderColor-Button-attention-outlined)", "borderStyle-Button-attention-outlined": "var(--xmlui-borderStyle-Button-attention-outlined)", "color-Button-attention-outlined": "var(--xmlui-color-Button-attention-outlined)", "boxShadow-Button-attention-outlined": "var(--xmlui-boxShadow-Button-attention-outlined)", "outlineWidth-Button-attention-outlined--focus": "var(--xmlui-outlineWidth-Button-attention-outlined--focus)", "outlineColor-Button-attention-outlined--focus": "var(--xmlui-outlineColor-Button-attention-outlined--focus)", "outlineStyle-Button-attention-outlined--focus": "var(--xmlui-outlineStyle-Button-attention-outlined--focus)", "outlineOffset-Button-attention-outlined--focus": "var(--xmlui-outlineOffset-Button-attention-outlined--focus)", "borderColor-Button-attention-outlined--hover": "var(--xmlui-borderColor-Button-attention-outlined--hover)", "backgroundColor-Button-attention-outlined--hover": "var(--xmlui-backgroundColor-Button-attention-outlined--hover)", "color-Button-attention-outlined--hover": "var(--xmlui-color-Button-attention-outlined--hover)", "borderColor-Button-attention-outlined--active": "var(--xmlui-borderColor-Button-attention-outlined--active)", "backgroundColor-Button-attention-outlined--active": "var(--xmlui-backgroundColor-Button-attention-outlined--active)", "color-Button-attention-outlined--active": "var(--xmlui-color-Button-attention-outlined--active)", "fontFamily-Button-primary-ghost": "var(--xmlui-fontFamily-Button-primary-ghost)", "fontSize-Button-primary-ghost": "var(--xmlui-fontSize-Button-primary-ghost)", "fontWeight-Button-primary-ghost": "var(--xmlui-fontWeight-Button-primary-ghost)", "borderRadius-Button-primary-ghost": "var(--xmlui-borderRadius-Button-primary-ghost)", "borderWidth-Button-primary-ghost": "var(--xmlui-borderWidth-Button-primary-ghost)", "color-Button-primary-ghost": "var(--xmlui-color-Button-primary-ghost)", "outlineWidth-Button-primary-ghost--focus": "var(--xmlui-outlineWidth-Button-primary-ghost--focus)", "outlineColor-Button-primary-ghost--focus": "var(--xmlui-outlineColor-Button-primary-ghost--focus)", "outlineStyle-Button-primary-ghost--focus": "var(--xmlui-outlineStyle-Button-primary-ghost--focus)", "outlineOffset-Button-primary-ghost--focus": "var(--xmlui-outlineOffset-Button-primary-ghost--focus)", "backgroundColor-Button-primary-ghost--hover": "var(--xmlui-backgroundColor-Button-primary-ghost--hover)", "color-Button-primary-ghost--hover": "var(--xmlui-color-Button-primary-ghost--hover)", "backgroundColor-Button-primary-ghost--active": "var(--xmlui-backgroundColor-Button-primary-ghost--active)", "color-Button-primary-ghost--active": "var(--xmlui-color-Button-primary-ghost--active)", "fontFamily-Button-secondary-ghost": "var(--xmlui-fontFamily-Button-secondary-ghost)", "fontSize-Button-secondary-ghost": "var(--xmlui-fontSize-Button-secondary-ghost)", "fontWeight-Button-secondary-ghost": "var(--xmlui-fontWeight-Button-secondary-ghost)", "borderRadius-Button-secondary-ghost": "var(--xmlui-borderRadius-Button-secondary-ghost)", "borderWidth-Button-secondary-ghost": "var(--xmlui-borderWidth-Button-secondary-ghost)", "color-Button-secondary-ghost": "var(--xmlui-color-Button-secondary-ghost)", "outlineWidth-Button-secondary-ghost--focus": "var(--xmlui-outlineWidth-Button-secondary-ghost--focus)", "outlineColor-Button-secondary-ghost--focus": "var(--xmlui-outlineColor-Button-secondary-ghost--focus)", "outlineStyle-Button-secondary-ghost--focus": "var(--xmlui-outlineStyle-Button-secondary-ghost--focus)", "outlineOffset-Button-secondary-ghost--focus": "var(--xmlui-outlineOffset-Button-secondary-ghost--focus)", "backgroundColor-Button-secondary-ghost--hover": "var(--xmlui-backgroundColor-Button-secondary-ghost--hover)", "color-Button-secondary-ghost--hover": "var(--xmlui-color-Button-secondary-ghost--hover)", "backgroundColor-Button-secondary-ghost--active": "var(--xmlui-backgroundColor-Button-secondary-ghost--active)", "color-Button-secondary-ghost--active": "var(--xmlui-color-Button-secondary-ghost--active)", "fontFamily-Button-attention-ghost": "var(--xmlui-fontFamily-Button-attention-ghost)", "fontSize-Button-attention-ghost": "var(--xmlui-fontSize-Button-attention-ghost)", "fontWeight-Button-attention-ghost": "var(--xmlui-fontWeight-Button-attention-ghost)", "borderRadius-Button-attention-ghost": "var(--xmlui-borderRadius-Button-attention-ghost)", "borderWidth-Button-attention-ghost": "var(--xmlui-borderWidth-Button-attention-ghost)", "color-Button-attention-ghost": "var(--xmlui-color-Button-attention-ghost)", "outlineWidth-Button-attention-ghost--focus": "var(--xmlui-outlineWidth-Button-attention-ghost--focus)", "outlineColor-Button-attention-ghost--focus": "var(--xmlui-outlineColor-Button-attention-ghost--focus)", "outlineStyle-Button-attention-ghost--focus": "var(--xmlui-outlineStyle-Button-attention-ghost--focus)", "outlineOffset-Button-attention-ghost--focus": "var(--xmlui-outlineOffset-Button-attention-ghost--focus)", "backgroundColor-Button-attention-ghost--hover": "var(--xmlui-backgroundColor-Button-attention-ghost--hover)", "color-Button-attention-ghost--hover": "var(--xmlui-color-Button-attention-ghost--hover)", "backgroundColor-Button-attention-ghost--active": "var(--xmlui-backgroundColor-Button-attention-ghost--active)", "color-Button-attention-ghost--active": "var(--xmlui-color-Button-attention-ghost--active)"}'`, Vd = "_button_1ryns_13", Ed = "_alignStart_1ryns_29", Dd = "_alignEnd_1ryns_32", Pd = "_buttonHorizontal_1ryns_38", Md = "_xs_1ryns_41", Fd = "_sm_1ryns_48", qd = "_md_1ryns_55", Ud = "_lg_1ryns_62", Gd = "_buttonVertical_1ryns_69", Yd = "_solidPrimary_1ryns_103", Xd = "_solidSecondary_1ryns_138", Qd = "_solidAttention_1ryns_173", Zd = "_outlinedPrimary_1ryns_208", jd = "_outlinedSecondary_1ryns_241", Jd = "_outlinedAttention_1ryns_274", Kd = "_ghostPrimary_1ryns_307", es = "_ghostSecondary_1ryns_336", rs = "_ghostAttention_1ryns_365", Me = {
  themeVars: zd,
  button: Vd,
  alignStart: Ed,
  alignEnd: Dd,
  buttonHorizontal: Pd,
  xs: Md,
  sm: Fd,
  md: qd,
  lg: Ud,
  buttonVertical: Gd,
  solidPrimary: Yd,
  solidSecondary: Xd,
  solidAttention: Qd,
  outlinedPrimary: Zd,
  outlinedSecondary: jd,
  outlinedAttention: Jd,
  ghostPrimary: Kd,
  ghostSecondary: es,
  ghostAttention: rs
};
function C({
  description: e,
  shortDescription: r,
  specializedFrom: t,
  status: o,
  props: a,
  events: n,
  contextVars: i,
  apis: l,
  nonVisual: s,
  opaque: f,
  themeVars: h,
  themeVarDescriptions: c,
  defaultThemeVars: T,
  toneSpecificThemeVars: b,
  allowArbitraryProps: v,
  docFolder: y,
  isHtmlTag: w
}) {
  return {
    description: e,
    shortDescription: r,
    specializedFrom: t,
    status: o,
    props: a,
    events: n,
    contextVars: i,
    apis: l,
    nonVisual: s,
    opaque: f,
    themeVars: h,
    defaultThemeVars: T,
    themeVarDescriptions: c,
    toneSpecificThemeVars: b,
    allowArbitraryProps: v,
    docFolder: y,
    isHtmlTag: w
  };
}
function u(e, r, t, o, a, n) {
  return { description: e, isRequired: n, availableValues: r, valueType: t, defaultValue: o, isValid: a };
}
const Vn = [
  {
    value: "_self",
    description: "The link will open in the same frame as it was clicked."
  },
  {
    value: "_blank",
    description: "The link will open in a new window or tab."
  },
  {
    value: "_parent",
    description: "The link will open in the parent frame. If no parent, behaves as _self."
  },
  {
    value: "_top",
    description: "The topmost browsing context. The link will open in the full body of the window. If no ancestors, behaves as _self."
  },
  {
    value: "_unfencedTop",
    description: "Allows embedded fenced frames to navigate the top-level frame, i.e. traversing beyond the root of the fenced frame."
  }
], Qa = [
  { value: "xs", description: "Extra small button" },
  { value: "sm", description: "Small button" },
  { value: "md", description: "Medium button" },
  { value: "lg", description: "Large button" }
], ts = ["attention", "primary", "secondary"], os = [...ts], Za = [
  { value: "attention", description: "Attention state theme color" },
  { value: "primary", description: "Primary theme color" },
  { value: "secondary", description: "Secondary theme color" }
], as = [
  {
    value: "button",
    description: "Regular behavior that only executes logic if explicitly determined."
  },
  {
    value: "submit",
    description: "The button submits the form data to the server. This is the default for buttons in a Form or NativeForm component."
  },
  {
    value: "reset",
    description: "Resets all the controls to their initial values. Using it is ill advised for UX reasons."
  }
], is = ["solid", "outlined", "ghost"], ns = [...is], ja = [
  { value: "solid", description: "A button with a border and a filled background." },
  {
    value: "outlined",
    description: "The button is displayed with a border and a transparent background."
  },
  {
    value: "ghost",
    description: "A button with no border and fill. Only the label is visible; the background is colored when hovered or clicked."
  }
], En = ["start", "center", "end"], Dn = [
  { value: "center", description: "Place the content in the middle" },
  {
    value: "start",
    description: "Justify the content to the left (to the right if in right-to-left)"
  },
  {
    value: "end",
    description: "Justify the content to the right (to the left if in right-to-left)"
  }
], aa = [
  { value: "horizontal", description: "The component will fill the available space horizontally" },
  { value: "vertical", description: "The component will fill the available space vertically" }
], ls = ["start", "end"], ds = [...ls], Ja = [
  {
    value: "start",
    description: "The icon will appear at the start (left side when the left-to-right direction is set)"
  },
  {
    value: "end",
    description: "The icon will appear at the end (right side when the left-to-right direction is set)"
  }
], ss = [
  { value: "primary", description: "Primary theme color, no default icon" },
  { value: "secondary", description: "Secondary theme color, no default icon" },
  { value: "success", description: 'Success theme color, "success" icon' },
  { value: "danger", description: 'Warning theme color, "warning" icon' },
  { value: "warning", description: 'Danger theme color, "danger" icon' },
  { value: "info", description: 'Info theme color, "info" icon' },
  { value: "light", description: "Light theme color, no default icon" },
  { value: "dark", description: "Dark theme color, no default icon" }
], us = [
  {
    value: "start",
    description: "The left side of the window (left-to-right) or the right side of the window (right-to-left)"
  },
  {
    value: "end",
    description: "The right side of the window (left-to-right) or the left side of the window (right-to-left)"
  },
  { value: "top", description: "The top of the window" },
  { value: "bottom", description: "The bottom of the window" }
], Pn = [
  {
    value: "start",
    description: "The left side of the input (left-to-right) or the right side of the input (right-to-left)"
  },
  {
    value: "end",
    description: "The right side of the input (left-to-right) or the left side of the input (right-to-left)"
  },
  { value: "top", description: "The top of the input" },
  { value: "bottom", description: "The bottom of the input" }
], cs = ["start", "end"], ms = [...cs], ps = [
  // { value: "none", description: "No indicator" },
  { value: "valid", description: "Visual indicator for an input that is accepted" },
  { value: "warning", description: "Visual indicator for an input that produced a warning" },
  { value: "error", description: "Visual indicator for an input that produced an error" }
], hs = ["top", "bottom"], Ci = {
  abbr: "abbr",
  cite: "cite",
  code: "code",
  codefence: "pre",
  deleted: "del",
  inserted: "ins",
  keyboard: "kbd",
  marked: "mark",
  sample: "samp",
  sub: "sub",
  sup: "sup",
  var: "var",
  mono: "pre",
  strong: "strong",
  em: "em",
  title: "span",
  subtitle: "span",
  small: "span",
  caption: "span",
  placeholder: "span",
  paragraph: "p",
  subheading: "h6",
  tableheading: "h6",
  secondary: "span"
}, xs = [
  { value: "abbr", description: "Represents an abbreviation or acronym" },
  { value: "caption", description: "Represents the caption (or title) of a table" },
  { value: "cite", description: "Is used to mark up the title of a cited work" },
  { value: "code", description: "Represents a line of code" },
  {
    value: "codefence",
    description: "Handles the display of code blocks if combined with a `code` variant"
  },
  { value: "deleted", description: "Represents text that has been deleted" },
  { value: "em", description: "Marks text to stress emphasis" },
  {
    value: "inserted",
    description: "Represents a range of text that has been added to a document"
  },
  {
    value: "keyboard",
    description: "Represents a span of text denoting textual user input from a keyboard or voice input"
  },
  {
    value: "marked",
    description: "Represents text which is marked or highlighted for reference or notation"
  },
  { value: "mono", description: "Text using a mono style font family" },
  { value: "paragraph", description: "Represents a paragraph" },
  {
    value: "placeholder",
    description: "Text that is mostly used as the placeholder style in input controls"
  },
  { value: "sample", description: "Represents sample (or quoted) output from a computer program" },
  { value: "secondary", description: "Represents a bit dimmed secondary text" },
  { value: "small", description: "Represents side-comments and small print" },
  { value: "sub", description: "Specifies inline text as subscript" },
  { value: "strong", description: "Contents have strong importance" },
  { value: "subheading", description: "Indicates that the text is the subtitle in a heading" },
  {
    value: "subtitle",
    description: "Indicates that the text is the subtitle of some other content"
  },
  { value: "sup", description: "Specifies inline text as superscript" },
  { value: "tableheading", description: "Indicates that the text is a table heading" },
  { value: "title", description: "Indicates that the text is the title of some other content" },
  { value: "var", description: "Represents the name of a variable in a mathematical expression" }
], Mn = [
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "head",
  "options",
  "trace",
  "connect"
], bs = "xmlui", fs = '"[]"', Fn = {
  keyPrefix: bs,
  themeVars: fs
};
function Z(e) {
  if (!e || typeof e != "string")
    return e;
  let r = e.replace(/(^['"])|(['"]$)/g, "");
  try {
    return JSON.parse(r);
  } catch {
    try {
      return JSON.parse(
        e.replace("(", "{").replace(")", "}").replace(/: ?([^,}]+)([,}])/g, ': "$1"$2').replace(/([\s{,])(?!")([^:\s]+)+:/g, '$1"$2":')
      );
    } catch {
      return r;
    }
  }
}
Z(Fn.keyPrefix);
Z(Fn.themeVars);
function Pe(e) {
  return {
    description: e ?? "This property is for internal use only.",
    isInternal: !0
  };
}
function po(e) {
  return {
    description: `This event is triggered when the ${e} is clicked.`
  };
}
function Tr(e) {
  return {
    description: `This event is triggered when the ${e} has received the focus.`
  };
}
function yr(e) {
  return {
    description: `This event is triggered when the ${e} has lost the focus.`
  };
}
function er(e) {
  return {
    description: `This event is triggered when value of ${e} has changed.`
  };
}
function qn(e) {
  return {
    description: "The `true` value of this property signals that the component is in an _intedeterminate state_.",
    defaultValue: e
  };
}
function Fe() {
  return {
    description: "This property sets the label of the component.",
    valueType: "string"
  };
}
function Dr(e) {
  return {
    description: "Places the label at the given position of the component.",
    availableValues: Pn,
    defaultValue: e ?? "top"
  };
}
function jr(e) {
  return {
    description: `This property sets the width of the \`${e}\`.`
  };
}
function Jr(e) {
  return {
    description: `This boolean value indicates if the \`${e}\` labels can be split into multiple lines if it would overflow the available label width.`,
    valueType: "boolean",
    defaultValue: !1
  };
}
function rr() {
  return {
    description: "If this property is set to `true`, the component gets the focus automatically when displayed.",
    valueType: "boolean",
    defaultValue: !1
  };
}
function Cr(e) {
  return {
    description: "This property sets the component's initial value.",
    defaultValue: e
  };
}
function Lr(e) {
  return {
    description: "Set this property to `true` to disallow changing the component value.",
    valueType: "boolean",
    defaultValue: e ?? !1
  };
}
function Qe(e) {
  return {
    description: "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
    valueType: "boolean",
    defaultValue: e ?? !0
  };
}
function Un() {
  return {
    description: "The `true` value of the property indicates if the user can select multiple items.",
    valueType: "boolean",
    defaultValue: !1
  };
}
function _r(e) {
  return {
    description: "This property allows you to set the validation status of the input component.",
    availableValues: ps,
    defaultValue: e ?? "none"
  };
}
function Gn() {
  return {
    description: "You can query this read-only API property to query the component's current value (`true`: checked, `false`: unchecked)."
  };
}
function Kr() {
  return {
    description: "You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked)."
  };
}
function Re(e) {
  return {
    description: e,
    valueType: "ComponentDef"
  };
}
function Vt() {
  return {
    description: "A placeholder text that is visible in the input field when its empty.",
    valueType: "string"
  };
}
function _o() {
  return {
    description: "This property sets the maximum length of the input it accepts.",
    valueType: "number"
  };
}
function Ar() {
  return {
    description: "Set this property to `true` to indicate it must have a value before submitting the containing form.",
    valueType: "boolean"
  };
}
function Ka() {
  return {
    description: "This property sets a text to appear at the start (left side when the left-to-right direction is set) of the input.",
    valueType: "string"
  };
}
function ei() {
  return {
    description: "This property sets an icon to appear at the start (left side when the left-to-right direction is set) of the input.",
    valueType: "string"
  };
}
function ri() {
  return {
    description: "This property sets a text to appear on the end (right side when the left-to-right direction is set) of the input.",
    valueType: "string"
  };
}
function ti() {
  return {
    description: "This property sets an icon to appear on the end (right side when the left-to-right direction is set) of the input.",
    valueType: "string"
  };
}
function vs(e) {
  return {
    description: `This property indicates if the ${e} is expanded (\`true\`) or collapsed (\`false\`).`
  };
}
function gs(e) {
  return {
    description: `This method expands the ${e}.`
  };
}
function Ts(e) {
  return {
    description: `This method collapses the ${e}.`
  };
}
function et(e) {
  return {
    description: `This method sets the focus on the ${e}.`
  };
}
function ia() {
  return {
    description: "You can query the component's value. If no value is set, it will retrieve `undefined`."
  };
}
function ys(e) {
  return {
    description: `This event is triggered when the ${e} has been displayed. The event handler has a single boolean argument set to \`true\`, indicating that the user opened the component.`
  };
}
function Cs(e) {
  return {
    description: `This event is triggered when the ${e} has been closed. The event handler has a single boolean argument set to \`true\`, indicating that the user closed the component.`
  };
}
function Yn(e) {
  return {
    description: `This property allows you to define a custom trigger instead of the default one provided by \`${e}\`.`,
    valueType: "ComponentDef"
  };
}
function Xn(e, r = !1) {
  return {
    description: "This property sets the main axis along which the nested components are rendered.",
    availableValues: aa,
    valueType: "string",
    defaultValue: e,
    isRequired: r
  };
}
const ks = `'{"size-Icon": "var(--xmlui-size-Icon)", "thickness-stroke-Icon": "var(--xmlui-thickness-stroke-Icon)"}'`, Ss = "_base_13qtg_13", Qn = {
  themeVars: ks,
  base: Ss
};
function Vo(e) {
  return e[0].toUpperCase() + e.substring(1);
}
const $e = (e) => {
  const r = he(e);
  return Yl(() => {
    r.current = e;
  }, [e]), X((...t) => {
    const o = r.current;
    return o(...t);
  }, [r]);
};
function ws(e, r, t) {
  const o = Zl(
    (a, n, i) => {
      e(...i).then(a).catch(n);
    },
    r,
    t
  );
  return (...a) => new Promise((n, i) => {
    o(n, i, a);
  });
}
const Hs = Ae.createContext(void 0);
Ae.createContext(void 0);
function dt() {
  return $r(Hs);
}
function Bs(e) {
  const { getResourceUrl: r } = dt();
  return r(e);
}
const lr = Object.freeze([]), Ot = Object.freeze({}), de = (...e) => ({}), Is = (e, r) => {
  const t = e == null ? void 0 : e.current, o = he();
  K(() => {
    o != null && o.current && t && o.current.unobserve(t), o.current = new ResizeObserver(r), e && e.current && o.current && o.current.observe(e.current);
  }, [r, t, e]);
};
function Zn(e) {
  const r = he();
  return K(() => {
    r.current = e;
  }, [e]), r.current;
}
function ki(e) {
  const [r, t] = me(!1);
  return K(() => {
    if (!window) {
      t(!1);
      return;
    }
    const o = window.matchMedia(e);
    return a(), o.addEventListener("change", a), () => {
      o.removeEventListener("change", a);
    };
    function a() {
      t(o.matches);
    }
  }, [e]), r;
}
function $s(e) {
  const r = he({ mountedFired: !1 });
  K(() => {
    r.current.mountedFired || (r.current.mountedFired = !0, e == null || e());
  }, [e]);
}
const $o = typeof document < "u" ? Bo : K, Ls = Ae.createContext(null);
function jn() {
  return $r(Ls);
}
const _s = {
  // SVG attributes
  accentheight: "accentHeight",
  accumulate: "accumulate",
  additive: "additive",
  alignmentbaseline: "alignmentBaseline",
  allowreorder: "allowReorder",
  alphabetic: "alphabetic",
  amplitude: "amplitude",
  arabicform: "arabicForm",
  ascent: "ascent",
  attributename: "attributeName",
  attributetype: "attributeType",
  autoreverse: "autoReverse",
  azimuth: "azimuth",
  basefrequency: "baseFrequency",
  baseprofile: "baseProfile",
  baselineshift: "baselineShift",
  bbox: "bbox",
  begin: "begin",
  bias: "bias",
  by: "by",
  calcmode: "calcMode",
  capheight: "capHeight",
  clip: "clip",
  clippath: "clipPath",
  clippathunits: "clipPathUnits",
  cliprule: "clipRule",
  colorinterpolation: "colorInterpolation",
  colorinterpolationfilters: "colorInterpolationFilters",
  colorprofile: "colorProfile",
  colorrendering: "colorRendering",
  contentscripttype: "contentScriptType",
  contentstyletype: "contentStyleType",
  cursor: "cursor",
  cx: "cx",
  cy: "cy",
  d: "d",
  decelerate: "decelerate",
  descent: "descent",
  diffuseconstant: "diffuseConstant",
  direction: "direction",
  display: "display",
  divisor: "divisor",
  dominantbaseline: "dominantBaseline",
  dur: "dur",
  dx: "dx",
  dy: "dy",
  edgemode: "edgeMode",
  elevation: "elevation",
  enablebackground: "enableBackground",
  end: "end",
  exponent: "exponent",
  externalresourcesrequired: "externalResourcesRequired",
  fill: "fill",
  fillopacity: "fillOpacity",
  fillrule: "fillRule",
  filter: "filter",
  filterres: "filterRes",
  filterunits: "filterUnits",
  floodcolor: "floodColor",
  floodopacity: "floodOpacity",
  focusable: "focusable",
  fontfamily: "fontFamily",
  fontsize: "fontSize",
  fontsizeadjust: "fontSizeAdjust",
  fontstretch: "fontStretch",
  fontstyle: "fontStyle",
  fontvariant: "fontVariant",
  fontweight: "fontWeight",
  format: "format",
  from: "from",
  fx: "fx",
  fy: "fy",
  g1: "g1",
  g2: "g2",
  glyphname: "glyphName",
  glyphorientationhorizontal: "glyphOrientationHorizontal",
  glyphorientationvertical: "glyphOrientationVertical",
  glyphref: "glyphRef",
  gradienttransform: "gradientTransform",
  gradientunits: "gradientUnits",
  hanging: "hanging",
  horizadvx: "horizAdvX",
  horizoriginx: "horizOriginX",
  ideographic: "ideographic",
  imagerendering: "imageRendering",
  in: "in",
  in2: "in2",
  intercept: "intercept",
  k: "k",
  k1: "k1",
  k2: "k2",
  k3: "k3",
  k4: "k4",
  kernelmatrix: "kernelMatrix",
  kernelunitlength: "kernelUnitLength",
  kerning: "kerning",
  keypoints: "keyPoints",
  keysplines: "keySplines",
  keytimes: "keyTimes",
  lengthadjust: "lengthAdjust",
  letterspacing: "letterSpacing",
  lightingcolor: "lightingColor",
  limitingconeangle: "limitingConeAngle",
  local: "local",
  markerend: "markerEnd",
  markerheight: "markerHeight",
  markermid: "markerMid",
  markerstart: "markerStart",
  markerunits: "markerUnits",
  markerwidth: "markerWidth",
  mask: "mask",
  maskcontentunits: "maskContentUnits",
  maskunits: "maskUnits",
  mathematical: "mathematical",
  mode: "mode",
  numoctaves: "numOctaves",
  offset: "offset",
  opacity: "opacity",
  operator: "operator",
  order: "order",
  orient: "orient",
  orientation: "orientation",
  origin: "origin",
  overflow: "overflow",
  overlineposition: "overlinePosition",
  overlinethickness: "overlineThickness",
  paintorder: "paintOrder",
  panose1: "panose1",
  pathlength: "pathLength",
  patterncontentunits: "patternContentUnits",
  patterntransform: "patternTransform",
  patternunits: "patternUnits",
  pointerevents: "pointerEvents",
  points: "points",
  pointsatx: "pointsAtX",
  pointsaty: "pointsAtY",
  pointsatz: "pointsAtZ",
  preservealpha: "preserveAlpha",
  preserveaspectratio: "preserveAspectRatio",
  primitiveunits: "primitiveUnits",
  r: "r",
  radius: "radius",
  refx: "refX",
  refy: "refY",
  renderingintent: "renderingIntent",
  repeatcount: "repeatCount",
  repeatdur: "repeatDur",
  requiredextensions: "requiredExtensions",
  requiredfeatures: "requiredFeatures",
  restart: "restart",
  result: "result",
  rotate: "rotate",
  rx: "rx",
  ry: "ry",
  scale: "scale",
  seed: "seed",
  shaperendering: "shapeRendering",
  slope: "slope",
  spacing: "spacing",
  specularconstant: "specularConstant",
  specularexponent: "specularExponent",
  speed: "speed",
  spreadmethod: "spreadMethod",
  startoffset: "startOffset",
  stddeviation: "stdDeviation",
  stemh: "stemh",
  stemv: "stemv",
  stitchtiles: "stitchTiles",
  stopcolor: "stopColor",
  stopopacity: "stopOpacity",
  strikethroughposition: "strikethroughPosition",
  strikethroughthickness: "strikethroughThickness",
  string: "string",
  stroke: "stroke",
  strokedasharray: "strokeDasharray",
  strokedashoffset: "strokeDashoffset",
  strokelinecap: "strokeLinecap",
  strokelinejoin: "strokeLinejoin",
  strokemiterlimit: "strokeMiterlimit",
  strokeopacity: "strokeOpacity",
  strokewidth: "strokeWidth",
  surfacescale: "surfaceScale",
  systemlanguage: "systemLanguage",
  tablevalues: "tableValues",
  targetx: "targetX",
  targety: "targetY",
  textanchor: "textAnchor",
  textdecoration: "textDecoration",
  textlength: "textLength",
  textrendering: "textRendering",
  to: "to",
  transform: "transform",
  u1: "u1",
  u2: "u2",
  underlineposition: "underlinePosition",
  underlinethickness: "underlineThickness",
  unicode: "unicode",
  unicodebidi: "unicodeBidi",
  unicoderange: "unicodeRange",
  unitsperem: "unitsPerEm",
  valphabetic: "vAlphabetic",
  vhanging: "vHanging",
  videographic: "vIdeographic",
  vmathematical: "vMathematical",
  values: "values",
  vectoreffect: "vectorEffect",
  version: "version",
  vertadvy: "vertAdvY",
  vertoriginx: "vertOriginX",
  vertoriginy: "vertOriginY",
  viewbox: "viewBox",
  viewtarget: "viewTarget",
  visibility: "visibility",
  widths: "widths",
  wordspacing: "wordSpacing",
  writingmode: "writingMode",
  x: "x",
  x1: "x1",
  x2: "x2",
  xchannelselector: "xChannelSelector",
  xheight: "xHeight",
  xlinkactuate: "xlinkActuate",
  xlinkarcrole: "xlinkArcrole",
  xlinkhref: "xlinkHref",
  xlinkrole: "xlinkRole",
  xlinkshow: "xlinkShow",
  xlinktitle: "xlinkTitle",
  xlinktype: "xlinkType",
  xmlns: "xmlns",
  xmlnsxlink: "xmlnsXlink",
  xmlbase: "xmlBase",
  xmllang: "xmlLang",
  xmlspace: "xmlSpace",
  y: "y",
  y1: "y1",
  y2: "y2",
  ychannelselector: "yChannelSelector",
  z: "z",
  zoomandpan: "zoomAndPan"
}, As = /[-:]/g;
function Ns(e) {
  const { ensureCustomSvgIcon: r, customSvgs: t } = jn();
  $o(() => {
    e && r(e);
  }, [r, e]);
  const o = e ? t[e] : null, a = X(
    ({ style: n, className: i }) => {
      if (!o)
        return null;
      const { attributes: l, name: s } = o, f = {};
      return Object.entries(l).forEach(([h, c]) => {
        let T = h;
        /^(data-|aria-)/.test(h) ? T = h : T = h.replace(As, "").toLowerCase(), f[_s[T] || h] = c;
      }), /* @__PURE__ */ p("svg", { ...f, style: n, className: i, children: /* @__PURE__ */ p("use", { href: `#${s}` }) });
    },
    [o]
  );
  return e ? a : null;
}
function Ws(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Jn = { exports: {} };
/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
(function(e) {
  (function() {
    var r = {}.hasOwnProperty;
    function t() {
      for (var n = "", i = 0; i < arguments.length; i++) {
        var l = arguments[i];
        l && (n = a(n, o(l)));
      }
      return n;
    }
    function o(n) {
      if (typeof n == "string" || typeof n == "number")
        return n;
      if (typeof n != "object")
        return "";
      if (Array.isArray(n))
        return t.apply(null, n);
      if (n.toString !== Object.prototype.toString && !n.toString.toString().includes("[native code]"))
        return n.toString();
      var i = "";
      for (var l in n)
        r.call(n, l) && n[l] && (i = a(i, l));
      return i;
    }
    function a(n, i) {
      return i ? n ? n + " " + i : n + i : n;
    }
    e.exports ? (t.default = t, e.exports = t) : window.classNames = t;
  })();
})(Jn);
var Os = Jn.exports;
const le = /* @__PURE__ */ Ws(Os), sa = "xmlui";
function Kn(e) {
  if (typeof e == "string")
    return `var(--${sa}-${e.substring(1)})`;
  if (e.defaultValue && e.defaultValue.length > 0) {
    let r = "";
    for (const t of e.defaultValue)
      r += typeof t == "string" ? t : Kn(t);
    return `var(--${sa}-${e.id.substring(1)}, ${r})`;
  } else
    return `var(--${sa}-${e.id.substring(1)})`;
}
const ye = xe(function({ name: r, fallback: t, style: o, className: a, size: n, ...i }, l) {
  var v;
  const s = Es(r, t), f = typeof n == "string" ? Vs(n) : n, h = f || i.width, c = f || i.height, T = {
    // className is needed to apply a default color to the icon, thus other component classes can override this one
    className: le(Qn.base, a),
    ...i,
    size: f,
    width: h,
    height: c,
    style: {
      ...o,
      "--icon-width": h,
      "--icon-height": c
    }
  }, b = zs(r);
  return b ? /* @__PURE__ */ p(Rs, { ...T, url: b, name: r }) : ((v = s == null ? void 0 : s.renderer) == null ? void 0 : v.call(s, T)) || null;
});
function Rs(e) {
  var h;
  const { url: r, width: t, height: o, name: a, style: n, className: i } = e, l = Bs(r), s = (h = l == null ? void 0 : l.toLowerCase()) == null ? void 0 : h.endsWith(".svg"), f = Ns(l);
  if (l && s) {
    const c = f == null ? void 0 : f({ style: n, className: i });
    return c || /* @__PURE__ */ p("span", { style: n, className: i });
  }
  return /* @__PURE__ */ p("img", { src: l, style: { width: t, height: o, ...n }, alt: a });
}
function zs(e) {
  const { getResourceUrl: r } = dt();
  return e && r(`resource:icon.${e}`);
}
function Vs(e) {
  return /^\$[a-zA-Z0-9_$-]+$/g.test(e) ? Kn(e) : {
    xs: "0.75em",
    sm: "1em",
    md: "1.5rem",
    lg: "2em"
  }[e] || e;
}
function Es(e, r) {
  const t = jn();
  if (e && typeof e == "string") {
    const o = ":", a = e.split(o);
    if (a.length > 1) {
      const n = t.lookupIconRenderer(
        `${a[0].toLowerCase()}${o}${a[1]}`
      );
      if (n) return n;
    }
    if (a.length === 1) {
      const n = t.lookupIconRenderer(a[0]);
      if (n) return n;
    }
  }
  if (r && typeof r == "string") {
    const o = t.lookupIconRenderer(r.toLowerCase());
    if (o) return o;
  }
  return null;
}
function Si(e, r) {
  if (typeof e == "function")
    return e(r);
  e != null && (e.current = r);
}
function st(...e) {
  return (r) => {
    let t = !1;
    const o = e.map((a) => {
      const n = Si(a, r);
      return !t && typeof n == "function" && (t = !0), n;
    });
    if (t)
      return () => {
        for (let a = 0; a < o.length; a++) {
          const n = o[a];
          typeof n == "function" ? n() : Si(e[a], null);
        }
      };
  };
}
const nr = {
  type: "button",
  iconPosition: "start",
  contentPosition: "center",
  orientation: "horizontal",
  variant: "solid",
  themeColor: "primary",
  size: "sm"
}, dr = Ae.forwardRef(function({
  id: r,
  type: t = nr.type,
  icon: o,
  iconPosition: a = nr.iconPosition,
  contentPosition: n = nr.contentPosition,
  orientation: i = nr.orientation,
  variant: l = nr.variant,
  themeColor: s = nr.themeColor,
  size: f = nr.size,
  disabled: h,
  children: c,
  formId: T,
  onClick: b,
  onFocus: v,
  onBlur: y,
  style: w,
  gap: _,
  className: H,
  autoFocus: $,
  ...O
}, F) {
  const Y = he(null), V = F ? st(F, Y) : Y;
  K(() => {
    $ && setTimeout(() => {
      var W;
      (W = Y.current) == null || W.focus();
    }, 0);
  }, [$]);
  const R = a === "start";
  return /* @__PURE__ */ j(
    "button",
    {
      ...O,
      id: r,
      type: t,
      ref: V,
      className: le(H, Me.button, {
        [Me.buttonHorizontal]: i === "horizontal",
        [Me.buttonVertical]: i === "vertical",
        [Me.xs]: f === "xs",
        [Me.sm]: f === "sm",
        [Me.md]: f === "md",
        [Me.lg]: f === "lg",
        [Me.solidPrimary]: l === "solid" && s === "primary",
        [Me.solidSecondary]: l === "solid" && s === "secondary",
        [Me.solidAttention]: l === "solid" && s === "attention",
        [Me.outlinedPrimary]: l === "outlined" && s === "primary",
        [Me.outlinedSecondary]: l === "outlined" && s === "secondary",
        [Me.outlinedAttention]: l === "outlined" && s === "attention",
        [Me.ghostPrimary]: l === "ghost" && s === "primary",
        [Me.ghostSecondary]: l === "ghost" && s === "secondary",
        [Me.ghostAttention]: l === "ghost" && s === "attention",
        [Me.alignStart]: n === "start",
        [Me.alignEnd]: n === "end"
      }),
      autoFocus: $,
      disabled: h,
      form: T,
      style: w,
      onClick: b,
      onFocus: v,
      onBlur: y,
      children: [
        R && o,
        c,
        !R && o
      ]
    }
  );
}), U = "Button", Ds = C({
  description: "Button is an interactive element that triggers an action when clicked.",
  status: "stable",
  props: {
    autoFocus: {
      description: "Indicates if the button should receive focus when the page loads.",
      isRequired: !1,
      type: "boolean",
      defaultValue: !1
    },
    variant: {
      description: "The button variant determines the level of emphasis the button should possess.",
      isRequired: !1,
      type: "string",
      availableValues: ja,
      defaultValue: nr.variant
    },
    themeColor: {
      description: "Sets the button color scheme defined in the application theme.",
      isRequired: !1,
      type: "string",
      availableValues: Za,
      defaultValue: nr.themeColor
    },
    size: {
      description: "Sets the size of the button.",
      isRequired: !1,
      type: "string",
      availableValues: Qa,
      defaultValue: nr.size
    },
    label: {
      description: `This property is an optional string to set a label for the ${U}. If no label is specified and an icon is set, the ${U} will modify its styling to look like a small icon button. When the ${U} has nested children, it will display them and ignore the value of the \`label\` prop.`,
      type: "string"
    },
    type: {
      description: `This optional string describes how the ${U} appears in an HTML context. You rarely need to set this property explicitly.`,
      availableValues: as,
      valueType: "string",
      defaultValue: nr.type
    },
    enabled: {
      description: "The value of this property indicates whether the button accepts actions (`true`) or does not react to them (`false`).",
      type: "boolean",
      defaultValue: !0
    },
    orientation: Xn(nr.orientation),
    icon: {
      description: `This string value denotes an icon name. The framework will render an icon if XMLUI recognizes the icon by its name. If no label is specified and an icon is set, the ${U} displays only that icon.`,
      type: "string"
    },
    iconPosition: {
      description: `This optional string determines the location of the icon in the ${U}.`,
      availableValues: Ja,
      type: "string",
      defaultValue: nr.iconPosition
    },
    contentPosition: {
      description: `This optional value determines how the label and icon (or nested children) should be placedinside the ${U} component.`,
      availableValues: Dn,
      type: "string",
      defaultValue: nr.contentPosition
    }
  },
  events: {
    click: po(U),
    gotFocus: Tr(U),
    lostFocus: yr(U)
  },
  themeVars: Z(Me.themeVars),
  defaultThemeVars: {
    [`width-${U}`]: "fit-content",
    [`height-${U}`]: "fit-content",
    [`borderRadius-${U}`]: "$borderRadius",
    [`fontSize-${U}`]: "$fontSize-small",
    [`fontWeight-${U}`]: "$fontWeight-medium",
    [`backgroundColor-${U}-primary`]: "$color-primary-500",
    [`backgroundColor-${U}-attention`]: "$backgroundColor-attention",
    [`borderColor-${U}-attention`]: "$color-attention",
    [`backgroundColor-${U}--disabled`]: "$backgroundColor--disabled",
    [`borderColor-${U}--disabled`]: "$borderColor--disabled",
    [`borderStyle-${U}`]: "solid",
    [`color-${U}--disabled`]: "$textColor--disabled",
    [`outlineColor-${U}--focus`]: "$outlineColor--focus",
    [`borderWidth-${U}`]: "1px",
    [`outlineWidth-${U}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${U}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${U}--focus`]: "$outlineOffset--focus",
    [`paddingHorizontal-${U}-xs`]: "$space-1",
    [`paddingVertical-${U}-xs`]: "$space-0_5",
    [`paddingHorizontal-${U}-sm`]: "$space-4",
    [`paddingVertical-${U}-sm`]: "$space-2",
    [`paddingHorizontal-${U}-md`]: "$space-4",
    [`paddingVertical-${U}-md`]: "$space-3",
    [`paddingHorizontal-${U}-lg`]: "$space-5",
    [`paddingVertical-${U}-lg`]: "$space-4",
    light: {
      [`color-${U}`]: "$color-surface-950",
      [`color-${U}-solid`]: "$color-surface-50",
      [`borderColor-${U}-primary`]: "$color-primary-500",
      [`backgroundColor-${U}-primary--hover`]: "$color-primary-400",
      [`backgroundColor-${U}-primary--active`]: "$color-primary-500",
      [`backgroundColor-${U}-primary-outlined--hover`]: "$color-primary-50",
      [`backgroundColor-${U}-primary-outlined--active`]: "$color-primary-100",
      [`borderColor-${U}-primary-outlined`]: "$color-primary-600",
      [`borderColor-${U}-primary-outlined--hover`]: "$color-primary-500",
      [`color-${U}-primary-outlined`]: "$color-primary-900",
      [`color-${U}-primary-outlined--hover`]: "$color-primary-950",
      [`color-${U}-primary-outlined--active`]: "$color-primary-900",
      [`backgroundColor-${U}-primary-ghost--hover`]: "$color-primary-50",
      [`backgroundColor-${U}-primary-ghost--active`]: "$color-primary-100",
      [`borderColor-${U}-secondary`]: "$color-secondary-100",
      [`backgroundColor-${U}-secondary`]: "$color-secondary-500",
      [`backgroundColor-${U}-secondary--hover`]: "$color-secondary-400",
      [`backgroundColor-${U}-secondary--active`]: "$color-secondary-500",
      [`backgroundColor-${U}-secondary-outlined--hover`]: "$color-secondary-50",
      [`backgroundColor-${U}-secondary-outlined--active`]: "$color-secondary-100",
      [`backgroundColor-${U}-secondary-ghost--hover`]: "$color-secondary-100",
      [`backgroundColor-${U}-secondary-ghost--active`]: "$color-secondary-100",
      [`backgroundColor-${U}-attention--hover`]: "$color-danger-400",
      [`backgroundColor-${U}-attention--active`]: "$color-danger-500",
      [`backgroundColor-${U}-attention-outlined--hover`]: "$color-danger-50",
      [`backgroundColor-${U}-attention-outlined--active`]: "$color-danger-100",
      [`backgroundColor-${U}-attention-ghost--hover`]: "$color-danger-50",
      [`backgroundColor-${U}-attention-ghost--active`]: "$color-danger-100"
    },
    dark: {
      [`color-${U}`]: "$color-surface-50",
      [`color-${U}-solid`]: "$color-surface-50",
      [`borderColor-${U}-primary`]: "$color-primary-500",
      [`backgroundColor-${U}-primary--hover`]: "$color-primary-600",
      [`backgroundColor-${U}-primary--active`]: "$color-primary-500",
      [`backgroundColor-${U}-primary-outlined--hover`]: "$color-primary-900",
      [`backgroundColor-${U}-primary-outlined--active`]: "$color-primary-950",
      [`borderColor-${U}-primary-outlined`]: "$color-primary-600",
      [`borderColor-${U}-primary-outlined--hover`]: "$color-primary-500",
      [`color-${U}-primary-outlined`]: "$color-primary-100",
      [`color-${U}-primary-outlined--hover`]: "$color-primary-50",
      [`color-${U}-primary-outlined--active`]: "$color-primary-100",
      [`backgroundColor-${U}-primary-ghost--hover`]: "$color-primary-900",
      [`backgroundColor-${U}-primary-ghost--active`]: "$color-primary-950",
      [`borderColor-${U}-secondary`]: "$color-secondary-500",
      [`backgroundColor-${U}-secondary`]: "$color-secondary-500",
      [`backgroundColor-${U}-secondary--hover`]: "$color-secondary-400",
      [`backgroundColor-${U}-secondary--active`]: "$color-secondary-500",
      [`backgroundColor-${U}-secondary-outlined--hover`]: "$color-secondary-600",
      [`backgroundColor-${U}-secondary-outlined--active`]: "$color-secondary-500",
      [`backgroundColor-${U}-secondary-ghost--hover`]: "$color-secondary-900",
      [`backgroundColor-${U}-secondary-ghost--active`]: "$color-secondary-950",
      [`backgroundColor-${U}-attention--hover`]: "$color-danger-400",
      [`backgroundColor-${U}-attention--active`]: "$color-danger-500",
      [`backgroundColor-${U}-attention-outlined--hover`]: "$color-danger-900",
      [`backgroundColor-${U}-attention-outlined--active`]: "$color-danger-950",
      [`backgroundColor-${U}-attention-ghost--hover`]: "$color-danger-900",
      [`backgroundColor-${U}-attention-ghost--active`]: "$color-danger-950"
    }
  }
}), Ps = `'{"backgroundColor-Stack--hover": "var(--xmlui-backgroundColor-Stack--hover)", "border-Stack--hover": "var(--xmlui-border-Stack--hover)"}'`, Ms = "_base_1qnyy_13", Fs = "_hoverContainer_1qnyy_26", qs = "_handlesClick_1qnyy_39", Us = "_vertical_1qnyy_43", Gs = "_reverse_1qnyy_47", Ys = "_horizontal_1qnyy_51", Xs = "_justifyItemsStart_1qnyy_59", Qs = "_justifyItemsCenter_1qnyy_63", Zs = "_justifyItemsStretch_1qnyy_67", js = "_justifyItemsEnd_1qnyy_71", Js = "_alignItemsStart_1qnyy_76", Ks = "_alignItemsCenter_1qnyy_80", eu = "_alignItemsStretch_1qnyy_84", ru = "_alignItemsEnd_1qnyy_88", zr = {
  themeVars: Ps,
  base: Ms,
  hoverContainer: Fs,
  handlesClick: qs,
  vertical: Us,
  reverse: Gs,
  horizontal: Ys,
  justifyItemsStart: Xs,
  justifyItemsCenter: Qs,
  justifyItemsStretch: Zs,
  justifyItemsEnd: js,
  alignItemsStart: Js,
  alignItemsCenter: Ks,
  alignItemsStretch: eu,
  alignItemsEnd: ru
};
function tu(e, r, t) {
  return ue(() => e === "horizontal" ? {
    horizontal: r && zr[`justifyItems${Vo(r)}`],
    vertical: t && zr[`alignItems${Vo(t)}`]
  } : {
    horizontal: r && zr[`alignItems${Vo(r)}`],
    vertical: t && zr[`justifyItems${Vo(t)}`]
  }, [e, r, t]);
}
const el = "vertical", Lo = xe(function({
  uid: r,
  children: t,
  orientation: o = el,
  horizontalAlignment: a,
  verticalAlignment: n,
  style: i,
  reverse: l,
  hoverContainer: s,
  visibleOnHover: f,
  onClick: h,
  onMount: c,
  ...T
}, b) {
  $s(c);
  const { horizontal: v, vertical: y } = tu(
    o,
    a,
    n
  );
  return /* @__PURE__ */ p(
    "div",
    {
      ...T,
      onClick: h,
      ref: b,
      style: i,
      className: le(
        zr.base,
        {
          [zr.vertical]: o === "vertical",
          [zr.horizontal]: o === "horizontal",
          [zr.reverse]: l,
          [zr.hoverContainer]: s,
          "display-on-hover": f,
          [zr.handlesClick]: !!h
        },
        v ?? "",
        y ?? ""
      ),
      children: t
    }
  );
}), Ao = "Stack", ou = {
  description: "Manages the horizontal content alignment for each child element in the Stack.",
  availableValues: En,
  valueType: "string",
  defaultValue: "start"
}, au = {
  description: "Manages the vertical content alignment for each child element in the Stack.",
  availableValues: En,
  valueType: "string",
  defaultValue: "start"
}, Jo = C({
  description: "`Stack` is a layout container displaying children in a horizontal or vertical stack.",
  props: {
    gap: {
      description: "Optional size value indicating the gap between child elements.",
      valueType: "string",
      defaultValue: "$gap-normal"
    },
    reverse: {
      description: "Optional boolean property to reverse the order of child elements.",
      valueType: "boolean",
      defaultValue: !1
    },
    wrapContent: {
      description: "Optional boolean which wraps the content if set to true and the available space is not big enough. Works only with horizontal orientations.",
      valueType: "boolean",
      defaultValue: !1
    },
    orientation: {
      description: "An optional property that governs the Stack's orientation (whether the Stack lays out its children in a row or a column).",
      availableValues: ["horizontal", "vertical"],
      valueType: "string",
      defaultValue: el
    },
    horizontalAlignment: ou,
    verticalAlignment: au,
    hoverContainer: Pe("Reserved for future use"),
    visibleOnHover: Pe("Reserved for future use")
  },
  events: {
    click: po(Ao),
    mounted: Pe("Reserved for future use")
  },
  themeVars: Z(zr.themeVars)
}), No = {
  ...Jo,
  props: {
    ...Jo.props
  }
}, iu = {
  ...No,
  specializedFrom: Ao,
  description: "This component represents a stack rendering its contents vertically.",
  props: {
    ...Jo.props
  }
}, nu = {
  ...No,
  specializedFrom: Ao,
  description: "This component represents a stack rendering its contents horizontally.",
  props: {
    ...Jo.props
  }
}, lu = {
  ...No,
  specializedFrom: Ao,
  description: "This component represents a stack that renders its contents vertically and aligns that in the center along both axes."
}, du = {
  ...No,
  specializedFrom: Ao,
  description: "This component represents a stack that renders its contents horizontally and aligns that in the center along both axes."
}, su = `'{"Input:borderRadius-TextBox-default": "var(--xmlui-borderRadius-TextBox-default)", "Input:borderColor-TextBox-default": "var(--xmlui-borderColor-TextBox-default)", "Input:borderWidth-TextBox-default": "var(--xmlui-borderWidth-TextBox-default)", "Input:borderStyle-TextBox-default": "var(--xmlui-borderStyle-TextBox-default)", "Input:fontSize-TextBox-default": "var(--xmlui-fontSize-TextBox-default)", "Input:padding-TextBox-default": "var(--xmlui-padding-TextBox-default)", "Input:backgroundColor-TextBox-default": "var(--xmlui-backgroundColor-TextBox-default)", "Input:boxShadow-TextBox-default": "var(--xmlui-boxShadow-TextBox-default)", "Input:color-TextBox-default": "var(--xmlui-color-TextBox-default)", "Input:borderColor-TextBox-default--hover": "var(--xmlui-borderColor-TextBox-default--hover)", "Input:backgroundColor-TextBox-default--hover": "var(--xmlui-backgroundColor-TextBox-default--hover)", "Input:boxShadow-TextBox-default--hover": "var(--xmlui-boxShadow-TextBox-default--hover)", "Input:color-TextBox-default--hover": "var(--xmlui-color-TextBox-default--hover)", "Input:borderColor-TextBox-default--focus": "var(--xmlui-borderColor-TextBox-default--focus)", "Input:backgroundColor-TextBox-default--focus": "var(--xmlui-backgroundColor-TextBox-default--focus)", "Input:boxShadow-TextBox-default--focus": "var(--xmlui-boxShadow-TextBox-default--focus)", "Input:color-TextBox-default--focus": "var(--xmlui-color-TextBox-default--focus)", "Input:outlineWidth-TextBox-default--focus": "var(--xmlui-outlineWidth-TextBox-default--focus)", "Input:outlineColor-TextBox-default--focus": "var(--xmlui-outlineColor-TextBox-default--focus)", "Input:outlineStyle-TextBox-default--focus": "var(--xmlui-outlineStyle-TextBox-default--focus)", "Input:outlineOffset-TextBox-default--focus": "var(--xmlui-outlineOffset-TextBox-default--focus)", "Input:color-placeholder-TextBox-default": "var(--xmlui-color-placeholder-TextBox-default)", "Input:color-adornment-TextBox-default": "var(--xmlui-color-adornment-TextBox-default)", "Input:borderRadius-TextBox-error": "var(--xmlui-borderRadius-TextBox-error)", "Input:borderColor-TextBox-error": "var(--xmlui-borderColor-TextBox-error)", "Input:borderWidth-TextBox-error": "var(--xmlui-borderWidth-TextBox-error)", "Input:borderStyle-TextBox-error": "var(--xmlui-borderStyle-TextBox-error)", "Input:fontSize-TextBox-error": "var(--xmlui-fontSize-TextBox-error)", "Input:padding-TextBox-error": "var(--xmlui-padding-TextBox-error)", "Input:backgroundColor-TextBox-error": "var(--xmlui-backgroundColor-TextBox-error)", "Input:boxShadow-TextBox-error": "var(--xmlui-boxShadow-TextBox-error)", "Input:color-TextBox-error": "var(--xmlui-color-TextBox-error)", "Input:borderColor-TextBox-error--hover": "var(--xmlui-borderColor-TextBox-error--hover)", "Input:backgroundColor-TextBox-error--hover": "var(--xmlui-backgroundColor-TextBox-error--hover)", "Input:boxShadow-TextBox-error--hover": "var(--xmlui-boxShadow-TextBox-error--hover)", "Input:color-TextBox-error--hover": "var(--xmlui-color-TextBox-error--hover)", "Input:borderColor-TextBox-error--focus": "var(--xmlui-borderColor-TextBox-error--focus)", "Input:backgroundColor-TextBox-error--focus": "var(--xmlui-backgroundColor-TextBox-error--focus)", "Input:boxShadow-TextBox-error--focus": "var(--xmlui-boxShadow-TextBox-error--focus)", "Input:color-TextBox-error--focus": "var(--xmlui-color-TextBox-error--focus)", "Input:outlineWidth-TextBox-error--focus": "var(--xmlui-outlineWidth-TextBox-error--focus)", "Input:outlineColor-TextBox-error--focus": "var(--xmlui-outlineColor-TextBox-error--focus)", "Input:outlineStyle-TextBox-error--focus": "var(--xmlui-outlineStyle-TextBox-error--focus)", "Input:outlineOffset-TextBox-error--focus": "var(--xmlui-outlineOffset-TextBox-error--focus)", "Input:color-placeholder-TextBox-error": "var(--xmlui-color-placeholder-TextBox-error)", "Input:color-adornment-TextBox-error": "var(--xmlui-color-adornment-TextBox-error)", "Input:borderRadius-TextBox-warning": "var(--xmlui-borderRadius-TextBox-warning)", "Input:borderColor-TextBox-warning": "var(--xmlui-borderColor-TextBox-warning)", "Input:borderWidth-TextBox-warning": "var(--xmlui-borderWidth-TextBox-warning)", "Input:borderStyle-TextBox-warning": "var(--xmlui-borderStyle-TextBox-warning)", "Input:fontSize-TextBox-warning": "var(--xmlui-fontSize-TextBox-warning)", "Input:padding-TextBox-warning": "var(--xmlui-padding-TextBox-warning)", "Input:backgroundColor-TextBox-warning": "var(--xmlui-backgroundColor-TextBox-warning)", "Input:boxShadow-TextBox-warning": "var(--xmlui-boxShadow-TextBox-warning)", "Input:color-TextBox-warning": "var(--xmlui-color-TextBox-warning)", "Input:borderColor-TextBox-warning--hover": "var(--xmlui-borderColor-TextBox-warning--hover)", "Input:backgroundColor-TextBox-warning--hover": "var(--xmlui-backgroundColor-TextBox-warning--hover)", "Input:boxShadow-TextBox-warning--hover": "var(--xmlui-boxShadow-TextBox-warning--hover)", "Input:color-TextBox-warning--hover": "var(--xmlui-color-TextBox-warning--hover)", "Input:borderColor-TextBox-warning--focus": "var(--xmlui-borderColor-TextBox-warning--focus)", "Input:backgroundColor-TextBox-warning--focus": "var(--xmlui-backgroundColor-TextBox-warning--focus)", "Input:boxShadow-TextBox-warning--focus": "var(--xmlui-boxShadow-TextBox-warning--focus)", "Input:color-TextBox-warning--focus": "var(--xmlui-color-TextBox-warning--focus)", "Input:outlineWidth-TextBox-warning--focus": "var(--xmlui-outlineWidth-TextBox-warning--focus)", "Input:outlineColor-TextBox-warning--focus": "var(--xmlui-outlineColor-TextBox-warning--focus)", "Input:outlineStyle-TextBox-warning--focus": "var(--xmlui-outlineStyle-TextBox-warning--focus)", "Input:outlineOffset-TextBox-warning--focus": "var(--xmlui-outlineOffset-TextBox-warning--focus)", "Input:color-placeholder-TextBox-warning": "var(--xmlui-color-placeholder-TextBox-warning)", "Input:color-adornment-TextBox-warning": "var(--xmlui-color-adornment-TextBox-warning)", "Input:borderRadius-TextBox-success": "var(--xmlui-borderRadius-TextBox-success)", "Input:borderColor-TextBox-success": "var(--xmlui-borderColor-TextBox-success)", "Input:borderWidth-TextBox-success": "var(--xmlui-borderWidth-TextBox-success)", "Input:borderStyle-TextBox-success": "var(--xmlui-borderStyle-TextBox-success)", "Input:fontSize-TextBox-success": "var(--xmlui-fontSize-TextBox-success)", "Input:padding-TextBox-success": "var(--xmlui-padding-TextBox-success)", "Input:backgroundColor-TextBox-success": "var(--xmlui-backgroundColor-TextBox-success)", "Input:boxShadow-TextBox-success": "var(--xmlui-boxShadow-TextBox-success)", "Input:color-TextBox-success": "var(--xmlui-color-TextBox-success)", "Input:borderColor-TextBox-success--hover": "var(--xmlui-borderColor-TextBox-success--hover)", "Input:backgroundColor-TextBox-success--hover": "var(--xmlui-backgroundColor-TextBox-success--hover)", "Input:boxShadow-TextBox-success--hover": "var(--xmlui-boxShadow-TextBox-success--hover)", "Input:color-TextBox-success--hover": "var(--xmlui-color-TextBox-success--hover)", "Input:borderColor-TextBox-success--focus": "var(--xmlui-borderColor-TextBox-success--focus)", "Input:backgroundColor-TextBox-success--focus": "var(--xmlui-backgroundColor-TextBox-success--focus)", "Input:boxShadow-TextBox-success--focus": "var(--xmlui-boxShadow-TextBox-success--focus)", "Input:color-TextBox-success--focus": "var(--xmlui-color-TextBox-success--focus)", "Input:outlineWidth-TextBox-success--focus": "var(--xmlui-outlineWidth-TextBox-success--focus)", "Input:outlineColor-TextBox-success--focus": "var(--xmlui-outlineColor-TextBox-success--focus)", "Input:outlineStyle-TextBox-success--focus": "var(--xmlui-outlineStyle-TextBox-success--focus)", "Input:outlineOffset-TextBox-success--focus": "var(--xmlui-outlineOffset-TextBox-success--focus)", "Input:color-placeholder-TextBox-success": "var(--xmlui-color-placeholder-TextBox-success)", "Input:color-adornment-TextBox-success": "var(--xmlui-color-adornment-TextBox-success)", "Input:backgroundColor-TextBox--disabled": "var(--xmlui-backgroundColor-TextBox--disabled)", "Input:color-TextBox--disabled": "var(--xmlui-color-TextBox--disabled)", "Input:borderColor-TextBox--disabled": "var(--xmlui-borderColor-TextBox--disabled)"}'`, uu = "_inputRoot_1hpo0_13", cu = "_input_1hpo0_13", mu = "_adornment_1hpo0_53", pu = "_error_1hpo0_56", hu = "_warning_1hpo0_91", xu = "_valid_1hpo0_126", bu = "_readOnly_1hpo0_181", Rr = {
  themeVars: su,
  inputRoot: uu,
  input: cu,
  adornment: mu,
  error: pu,
  warning: hu,
  valid: xu,
  readOnly: bu
}, fu = "_wrapper_wg0td_13", vu = {
  wrapper: fu
}, gu = `'{"fontFamily-Text-abbr": "var(--xmlui-fontFamily-Text-abbr)", "fontSize-Text-abbr": "var(--xmlui-fontSize-Text-abbr)", "fontWeight-Text-abbr": "var(--xmlui-fontWeight-Text-abbr)", "font-style-Text-abbr": "var(--xmlui-font-style-Text-abbr)", "font-stretch-Text-abbr": "var(--xmlui-font-stretch-Text-abbr)", "textDecorationLine-Text-abbr": "var(--xmlui-textDecorationLine-Text-abbr)", "textDecorationColor-Text-abbr": "var(--xmlui-textDecorationColor-Text-abbr)", "textDecorationStyle-Text-abbr": "var(--xmlui-textDecorationStyle-Text-abbr)", "textDecorationThickness-Text-abbr": "var(--xmlui-textDecorationThickness-Text-abbr)", "textUnderlineOffset-Text-abbr": "var(--xmlui-textUnderlineOffset-Text-abbr)", "lineHeight-Text-abbr": "var(--xmlui-lineHeight-Text-abbr)", "color-Text-abbr": "var(--xmlui-color-Text-abbr)", "backgroundColor-Text-abbr": "var(--xmlui-backgroundColor-Text-abbr)", "borderRadius-Text-abbr": "var(--xmlui-borderRadius-Text-abbr)", "borderColor-Text-abbr": "var(--xmlui-borderColor-Text-abbr)", "borderWidth-Text-abbr": "var(--xmlui-borderWidth-Text-abbr)", "borderStyle-Text-abbr": "var(--xmlui-borderStyle-Text-abbr)", "marginTop-Text-abbr": "var(--xmlui-marginTop-Text-abbr)", "marginBottom-Text-abbr": "var(--xmlui-marginBottom-Text-abbr)", "textTransform-Text-abbr": "var(--xmlui-textTransform-Text-abbr)", "verticalAlign-Text-abbr": "var(--xmlui-verticalAlign-Text-abbr)", "letterSpacing-Text-abbr": "var(--xmlui-letterSpacing-Text-abbr)", "fontFamily-Text-cite": "var(--xmlui-fontFamily-Text-cite)", "fontSize-Text-cite": "var(--xmlui-fontSize-Text-cite)", "fontWeight-Text-cite": "var(--xmlui-fontWeight-Text-cite)", "font-style-Text-cite": "var(--xmlui-font-style-Text-cite)", "font-stretch-Text-cite": "var(--xmlui-font-stretch-Text-cite)", "textDecorationLine-Text-cite": "var(--xmlui-textDecorationLine-Text-cite)", "textDecorationColor-Text-cite": "var(--xmlui-textDecorationColor-Text-cite)", "textDecorationStyle-Text-cite": "var(--xmlui-textDecorationStyle-Text-cite)", "textDecorationThickness-Text-cite": "var(--xmlui-textDecorationThickness-Text-cite)", "textUnderlineOffset-Text-cite": "var(--xmlui-textUnderlineOffset-Text-cite)", "lineHeight-Text-cite": "var(--xmlui-lineHeight-Text-cite)", "color-Text-cite": "var(--xmlui-color-Text-cite)", "backgroundColor-Text-cite": "var(--xmlui-backgroundColor-Text-cite)", "borderRadius-Text-cite": "var(--xmlui-borderRadius-Text-cite)", "borderColor-Text-cite": "var(--xmlui-borderColor-Text-cite)", "borderWidth-Text-cite": "var(--xmlui-borderWidth-Text-cite)", "borderStyle-Text-cite": "var(--xmlui-borderStyle-Text-cite)", "marginTop-Text-cite": "var(--xmlui-marginTop-Text-cite)", "marginBottom-Text-cite": "var(--xmlui-marginBottom-Text-cite)", "textTransform-Text-cite": "var(--xmlui-textTransform-Text-cite)", "verticalAlign-Text-cite": "var(--xmlui-verticalAlign-Text-cite)", "letterSpacing-Text-cite": "var(--xmlui-letterSpacing-Text-cite)", "fontFamily-Text-code": "var(--xmlui-fontFamily-Text-code)", "fontSize-Text-code": "var(--xmlui-fontSize-Text-code)", "fontWeight-Text-code": "var(--xmlui-fontWeight-Text-code)", "font-style-Text-code": "var(--xmlui-font-style-Text-code)", "font-stretch-Text-code": "var(--xmlui-font-stretch-Text-code)", "textDecorationLine-Text-code": "var(--xmlui-textDecorationLine-Text-code)", "textDecorationColor-Text-code": "var(--xmlui-textDecorationColor-Text-code)", "textDecorationStyle-Text-code": "var(--xmlui-textDecorationStyle-Text-code)", "textDecorationThickness-Text-code": "var(--xmlui-textDecorationThickness-Text-code)", "textUnderlineOffset-Text-code": "var(--xmlui-textUnderlineOffset-Text-code)", "lineHeight-Text-code": "var(--xmlui-lineHeight-Text-code)", "color-Text-code": "var(--xmlui-color-Text-code)", "backgroundColor-Text-code": "var(--xmlui-backgroundColor-Text-code)", "borderRadius-Text-code": "var(--xmlui-borderRadius-Text-code)", "borderColor-Text-code": "var(--xmlui-borderColor-Text-code)", "borderWidth-Text-code": "var(--xmlui-borderWidth-Text-code)", "borderStyle-Text-code": "var(--xmlui-borderStyle-Text-code)", "marginTop-Text-code": "var(--xmlui-marginTop-Text-code)", "marginBottom-Text-code": "var(--xmlui-marginBottom-Text-code)", "textTransform-Text-code": "var(--xmlui-textTransform-Text-code)", "verticalAlign-Text-code": "var(--xmlui-verticalAlign-Text-code)", "letterSpacing-Text-code": "var(--xmlui-letterSpacing-Text-code)", "fontFamily-Text-codefence": "var(--xmlui-fontFamily-Text-codefence)", "fontSize-Text-codefence": "var(--xmlui-fontSize-Text-codefence)", "fontWeight-Text-codefence": "var(--xmlui-fontWeight-Text-codefence)", "font-style-Text-codefence": "var(--xmlui-font-style-Text-codefence)", "font-stretch-Text-codefence": "var(--xmlui-font-stretch-Text-codefence)", "textDecorationLine-Text-codefence": "var(--xmlui-textDecorationLine-Text-codefence)", "textDecorationColor-Text-codefence": "var(--xmlui-textDecorationColor-Text-codefence)", "textDecorationStyle-Text-codefence": "var(--xmlui-textDecorationStyle-Text-codefence)", "textDecorationThickness-Text-codefence": "var(--xmlui-textDecorationThickness-Text-codefence)", "textUnderlineOffset-Text-codefence": "var(--xmlui-textUnderlineOffset-Text-codefence)", "lineHeight-Text-codefence": "var(--xmlui-lineHeight-Text-codefence)", "color-Text-codefence": "var(--xmlui-color-Text-codefence)", "backgroundColor-Text-codefence": "var(--xmlui-backgroundColor-Text-codefence)", "borderRadius-Text-codefence": "var(--xmlui-borderRadius-Text-codefence)", "borderColor-Text-codefence": "var(--xmlui-borderColor-Text-codefence)", "borderWidth-Text-codefence": "var(--xmlui-borderWidth-Text-codefence)", "borderStyle-Text-codefence": "var(--xmlui-borderStyle-Text-codefence)", "marginTop-Text-codefence": "var(--xmlui-marginTop-Text-codefence)", "marginBottom-Text-codefence": "var(--xmlui-marginBottom-Text-codefence)", "textTransform-Text-codefence": "var(--xmlui-textTransform-Text-codefence)", "verticalAlign-Text-codefence": "var(--xmlui-verticalAlign-Text-codefence)", "letterSpacing-Text-codefence": "var(--xmlui-letterSpacing-Text-codefence)", "fontFamily-Text-deleted": "var(--xmlui-fontFamily-Text-deleted)", "fontSize-Text-deleted": "var(--xmlui-fontSize-Text-deleted)", "fontWeight-Text-deleted": "var(--xmlui-fontWeight-Text-deleted)", "font-style-Text-deleted": "var(--xmlui-font-style-Text-deleted)", "font-stretch-Text-deleted": "var(--xmlui-font-stretch-Text-deleted)", "textDecorationLine-Text-deleted": "var(--xmlui-textDecorationLine-Text-deleted)", "textDecorationColor-Text-deleted": "var(--xmlui-textDecorationColor-Text-deleted)", "textDecorationStyle-Text-deleted": "var(--xmlui-textDecorationStyle-Text-deleted)", "textDecorationThickness-Text-deleted": "var(--xmlui-textDecorationThickness-Text-deleted)", "textUnderlineOffset-Text-deleted": "var(--xmlui-textUnderlineOffset-Text-deleted)", "lineHeight-Text-deleted": "var(--xmlui-lineHeight-Text-deleted)", "color-Text-deleted": "var(--xmlui-color-Text-deleted)", "backgroundColor-Text-deleted": "var(--xmlui-backgroundColor-Text-deleted)", "borderRadius-Text-deleted": "var(--xmlui-borderRadius-Text-deleted)", "borderColor-Text-deleted": "var(--xmlui-borderColor-Text-deleted)", "borderWidth-Text-deleted": "var(--xmlui-borderWidth-Text-deleted)", "borderStyle-Text-deleted": "var(--xmlui-borderStyle-Text-deleted)", "marginTop-Text-deleted": "var(--xmlui-marginTop-Text-deleted)", "marginBottom-Text-deleted": "var(--xmlui-marginBottom-Text-deleted)", "textTransform-Text-deleted": "var(--xmlui-textTransform-Text-deleted)", "verticalAlign-Text-deleted": "var(--xmlui-verticalAlign-Text-deleted)", "letterSpacing-Text-deleted": "var(--xmlui-letterSpacing-Text-deleted)", "fontFamily-Text-inserted": "var(--xmlui-fontFamily-Text-inserted)", "fontSize-Text-inserted": "var(--xmlui-fontSize-Text-inserted)", "fontWeight-Text-inserted": "var(--xmlui-fontWeight-Text-inserted)", "font-style-Text-inserted": "var(--xmlui-font-style-Text-inserted)", "font-stretch-Text-inserted": "var(--xmlui-font-stretch-Text-inserted)", "textDecorationLine-Text-inserted": "var(--xmlui-textDecorationLine-Text-inserted)", "textDecorationColor-Text-inserted": "var(--xmlui-textDecorationColor-Text-inserted)", "textDecorationStyle-Text-inserted": "var(--xmlui-textDecorationStyle-Text-inserted)", "textDecorationThickness-Text-inserted": "var(--xmlui-textDecorationThickness-Text-inserted)", "textUnderlineOffset-Text-inserted": "var(--xmlui-textUnderlineOffset-Text-inserted)", "lineHeight-Text-inserted": "var(--xmlui-lineHeight-Text-inserted)", "color-Text-inserted": "var(--xmlui-color-Text-inserted)", "backgroundColor-Text-inserted": "var(--xmlui-backgroundColor-Text-inserted)", "borderRadius-Text-inserted": "var(--xmlui-borderRadius-Text-inserted)", "borderColor-Text-inserted": "var(--xmlui-borderColor-Text-inserted)", "borderWidth-Text-inserted": "var(--xmlui-borderWidth-Text-inserted)", "borderStyle-Text-inserted": "var(--xmlui-borderStyle-Text-inserted)", "marginTop-Text-inserted": "var(--xmlui-marginTop-Text-inserted)", "marginBottom-Text-inserted": "var(--xmlui-marginBottom-Text-inserted)", "textTransform-Text-inserted": "var(--xmlui-textTransform-Text-inserted)", "verticalAlign-Text-inserted": "var(--xmlui-verticalAlign-Text-inserted)", "letterSpacing-Text-inserted": "var(--xmlui-letterSpacing-Text-inserted)", "fontFamily-Text-keyboard": "var(--xmlui-fontFamily-Text-keyboard)", "fontSize-Text-keyboard": "var(--xmlui-fontSize-Text-keyboard)", "fontWeight-Text-keyboard": "var(--xmlui-fontWeight-Text-keyboard)", "font-style-Text-keyboard": "var(--xmlui-font-style-Text-keyboard)", "font-stretch-Text-keyboard": "var(--xmlui-font-stretch-Text-keyboard)", "textDecorationLine-Text-keyboard": "var(--xmlui-textDecorationLine-Text-keyboard)", "textDecorationColor-Text-keyboard": "var(--xmlui-textDecorationColor-Text-keyboard)", "textDecorationStyle-Text-keyboard": "var(--xmlui-textDecorationStyle-Text-keyboard)", "textDecorationThickness-Text-keyboard": "var(--xmlui-textDecorationThickness-Text-keyboard)", "textUnderlineOffset-Text-keyboard": "var(--xmlui-textUnderlineOffset-Text-keyboard)", "lineHeight-Text-keyboard": "var(--xmlui-lineHeight-Text-keyboard)", "color-Text-keyboard": "var(--xmlui-color-Text-keyboard)", "backgroundColor-Text-keyboard": "var(--xmlui-backgroundColor-Text-keyboard)", "borderRadius-Text-keyboard": "var(--xmlui-borderRadius-Text-keyboard)", "borderColor-Text-keyboard": "var(--xmlui-borderColor-Text-keyboard)", "borderWidth-Text-keyboard": "var(--xmlui-borderWidth-Text-keyboard)", "borderStyle-Text-keyboard": "var(--xmlui-borderStyle-Text-keyboard)", "marginTop-Text-keyboard": "var(--xmlui-marginTop-Text-keyboard)", "marginBottom-Text-keyboard": "var(--xmlui-marginBottom-Text-keyboard)", "textTransform-Text-keyboard": "var(--xmlui-textTransform-Text-keyboard)", "verticalAlign-Text-keyboard": "var(--xmlui-verticalAlign-Text-keyboard)", "letterSpacing-Text-keyboard": "var(--xmlui-letterSpacing-Text-keyboard)", "fontFamily-Text-marked": "var(--xmlui-fontFamily-Text-marked)", "fontSize-Text-marked": "var(--xmlui-fontSize-Text-marked)", "fontWeight-Text-marked": "var(--xmlui-fontWeight-Text-marked)", "font-style-Text-marked": "var(--xmlui-font-style-Text-marked)", "font-stretch-Text-marked": "var(--xmlui-font-stretch-Text-marked)", "textDecorationLine-Text-marked": "var(--xmlui-textDecorationLine-Text-marked)", "textDecorationColor-Text-marked": "var(--xmlui-textDecorationColor-Text-marked)", "textDecorationStyle-Text-marked": "var(--xmlui-textDecorationStyle-Text-marked)", "textDecorationThickness-Text-marked": "var(--xmlui-textDecorationThickness-Text-marked)", "textUnderlineOffset-Text-marked": "var(--xmlui-textUnderlineOffset-Text-marked)", "lineHeight-Text-marked": "var(--xmlui-lineHeight-Text-marked)", "color-Text-marked": "var(--xmlui-color-Text-marked)", "backgroundColor-Text-marked": "var(--xmlui-backgroundColor-Text-marked)", "borderRadius-Text-marked": "var(--xmlui-borderRadius-Text-marked)", "borderColor-Text-marked": "var(--xmlui-borderColor-Text-marked)", "borderWidth-Text-marked": "var(--xmlui-borderWidth-Text-marked)", "borderStyle-Text-marked": "var(--xmlui-borderStyle-Text-marked)", "marginTop-Text-marked": "var(--xmlui-marginTop-Text-marked)", "marginBottom-Text-marked": "var(--xmlui-marginBottom-Text-marked)", "textTransform-Text-marked": "var(--xmlui-textTransform-Text-marked)", "verticalAlign-Text-marked": "var(--xmlui-verticalAlign-Text-marked)", "letterSpacing-Text-marked": "var(--xmlui-letterSpacing-Text-marked)", "fontFamily-Text-mono": "var(--xmlui-fontFamily-Text-mono)", "fontSize-Text-mono": "var(--xmlui-fontSize-Text-mono)", "fontWeight-Text-mono": "var(--xmlui-fontWeight-Text-mono)", "font-style-Text-mono": "var(--xmlui-font-style-Text-mono)", "font-stretch-Text-mono": "var(--xmlui-font-stretch-Text-mono)", "textDecorationLine-Text-mono": "var(--xmlui-textDecorationLine-Text-mono)", "textDecorationColor-Text-mono": "var(--xmlui-textDecorationColor-Text-mono)", "textDecorationStyle-Text-mono": "var(--xmlui-textDecorationStyle-Text-mono)", "textDecorationThickness-Text-mono": "var(--xmlui-textDecorationThickness-Text-mono)", "textUnderlineOffset-Text-mono": "var(--xmlui-textUnderlineOffset-Text-mono)", "lineHeight-Text-mono": "var(--xmlui-lineHeight-Text-mono)", "color-Text-mono": "var(--xmlui-color-Text-mono)", "backgroundColor-Text-mono": "var(--xmlui-backgroundColor-Text-mono)", "borderRadius-Text-mono": "var(--xmlui-borderRadius-Text-mono)", "borderColor-Text-mono": "var(--xmlui-borderColor-Text-mono)", "borderWidth-Text-mono": "var(--xmlui-borderWidth-Text-mono)", "borderStyle-Text-mono": "var(--xmlui-borderStyle-Text-mono)", "marginTop-Text-mono": "var(--xmlui-marginTop-Text-mono)", "marginBottom-Text-mono": "var(--xmlui-marginBottom-Text-mono)", "textTransform-Text-mono": "var(--xmlui-textTransform-Text-mono)", "verticalAlign-Text-mono": "var(--xmlui-verticalAlign-Text-mono)", "letterSpacing-Text-mono": "var(--xmlui-letterSpacing-Text-mono)", "fontFamily-Text-sample": "var(--xmlui-fontFamily-Text-sample)", "fontSize-Text-sample": "var(--xmlui-fontSize-Text-sample)", "fontWeight-Text-sample": "var(--xmlui-fontWeight-Text-sample)", "font-style-Text-sample": "var(--xmlui-font-style-Text-sample)", "font-stretch-Text-sample": "var(--xmlui-font-stretch-Text-sample)", "textDecorationLine-Text-sample": "var(--xmlui-textDecorationLine-Text-sample)", "textDecorationColor-Text-sample": "var(--xmlui-textDecorationColor-Text-sample)", "textDecorationStyle-Text-sample": "var(--xmlui-textDecorationStyle-Text-sample)", "textDecorationThickness-Text-sample": "var(--xmlui-textDecorationThickness-Text-sample)", "textUnderlineOffset-Text-sample": "var(--xmlui-textUnderlineOffset-Text-sample)", "lineHeight-Text-sample": "var(--xmlui-lineHeight-Text-sample)", "color-Text-sample": "var(--xmlui-color-Text-sample)", "backgroundColor-Text-sample": "var(--xmlui-backgroundColor-Text-sample)", "borderRadius-Text-sample": "var(--xmlui-borderRadius-Text-sample)", "borderColor-Text-sample": "var(--xmlui-borderColor-Text-sample)", "borderWidth-Text-sample": "var(--xmlui-borderWidth-Text-sample)", "borderStyle-Text-sample": "var(--xmlui-borderStyle-Text-sample)", "marginTop-Text-sample": "var(--xmlui-marginTop-Text-sample)", "marginBottom-Text-sample": "var(--xmlui-marginBottom-Text-sample)", "textTransform-Text-sample": "var(--xmlui-textTransform-Text-sample)", "verticalAlign-Text-sample": "var(--xmlui-verticalAlign-Text-sample)", "letterSpacing-Text-sample": "var(--xmlui-letterSpacing-Text-sample)", "fontFamily-Text-sup": "var(--xmlui-fontFamily-Text-sup)", "fontSize-Text-sup": "var(--xmlui-fontSize-Text-sup)", "fontWeight-Text-sup": "var(--xmlui-fontWeight-Text-sup)", "font-style-Text-sup": "var(--xmlui-font-style-Text-sup)", "font-stretch-Text-sup": "var(--xmlui-font-stretch-Text-sup)", "textDecorationLine-Text-sup": "var(--xmlui-textDecorationLine-Text-sup)", "textDecorationColor-Text-sup": "var(--xmlui-textDecorationColor-Text-sup)", "textDecorationStyle-Text-sup": "var(--xmlui-textDecorationStyle-Text-sup)", "textDecorationThickness-Text-sup": "var(--xmlui-textDecorationThickness-Text-sup)", "textUnderlineOffset-Text-sup": "var(--xmlui-textUnderlineOffset-Text-sup)", "lineHeight-Text-sup": "var(--xmlui-lineHeight-Text-sup)", "color-Text-sup": "var(--xmlui-color-Text-sup)", "backgroundColor-Text-sup": "var(--xmlui-backgroundColor-Text-sup)", "borderRadius-Text-sup": "var(--xmlui-borderRadius-Text-sup)", "borderColor-Text-sup": "var(--xmlui-borderColor-Text-sup)", "borderWidth-Text-sup": "var(--xmlui-borderWidth-Text-sup)", "borderStyle-Text-sup": "var(--xmlui-borderStyle-Text-sup)", "marginTop-Text-sup": "var(--xmlui-marginTop-Text-sup)", "marginBottom-Text-sup": "var(--xmlui-marginBottom-Text-sup)", "textTransform-Text-sup": "var(--xmlui-textTransform-Text-sup)", "verticalAlign-Text-sup": "var(--xmlui-verticalAlign-Text-sup)", "letterSpacing-Text-sup": "var(--xmlui-letterSpacing-Text-sup)", "fontFamily-Text-sub": "var(--xmlui-fontFamily-Text-sub)", "fontSize-Text-sub": "var(--xmlui-fontSize-Text-sub)", "fontWeight-Text-sub": "var(--xmlui-fontWeight-Text-sub)", "font-style-Text-sub": "var(--xmlui-font-style-Text-sub)", "font-stretch-Text-sub": "var(--xmlui-font-stretch-Text-sub)", "textDecorationLine-Text-sub": "var(--xmlui-textDecorationLine-Text-sub)", "textDecorationColor-Text-sub": "var(--xmlui-textDecorationColor-Text-sub)", "textDecorationStyle-Text-sub": "var(--xmlui-textDecorationStyle-Text-sub)", "textDecorationThickness-Text-sub": "var(--xmlui-textDecorationThickness-Text-sub)", "textUnderlineOffset-Text-sub": "var(--xmlui-textUnderlineOffset-Text-sub)", "lineHeight-Text-sub": "var(--xmlui-lineHeight-Text-sub)", "color-Text-sub": "var(--xmlui-color-Text-sub)", "backgroundColor-Text-sub": "var(--xmlui-backgroundColor-Text-sub)", "borderRadius-Text-sub": "var(--xmlui-borderRadius-Text-sub)", "borderColor-Text-sub": "var(--xmlui-borderColor-Text-sub)", "borderWidth-Text-sub": "var(--xmlui-borderWidth-Text-sub)", "borderStyle-Text-sub": "var(--xmlui-borderStyle-Text-sub)", "marginTop-Text-sub": "var(--xmlui-marginTop-Text-sub)", "marginBottom-Text-sub": "var(--xmlui-marginBottom-Text-sub)", "textTransform-Text-sub": "var(--xmlui-textTransform-Text-sub)", "verticalAlign-Text-sub": "var(--xmlui-verticalAlign-Text-sub)", "letterSpacing-Text-sub": "var(--xmlui-letterSpacing-Text-sub)", "fontFamily-Text-var": "var(--xmlui-fontFamily-Text-var)", "fontSize-Text-var": "var(--xmlui-fontSize-Text-var)", "fontWeight-Text-var": "var(--xmlui-fontWeight-Text-var)", "font-style-Text-var": "var(--xmlui-font-style-Text-var)", "font-stretch-Text-var": "var(--xmlui-font-stretch-Text-var)", "textDecorationLine-Text-var": "var(--xmlui-textDecorationLine-Text-var)", "textDecorationColor-Text-var": "var(--xmlui-textDecorationColor-Text-var)", "textDecorationStyle-Text-var": "var(--xmlui-textDecorationStyle-Text-var)", "textDecorationThickness-Text-var": "var(--xmlui-textDecorationThickness-Text-var)", "textUnderlineOffset-Text-var": "var(--xmlui-textUnderlineOffset-Text-var)", "lineHeight-Text-var": "var(--xmlui-lineHeight-Text-var)", "color-Text-var": "var(--xmlui-color-Text-var)", "backgroundColor-Text-var": "var(--xmlui-backgroundColor-Text-var)", "borderRadius-Text-var": "var(--xmlui-borderRadius-Text-var)", "borderColor-Text-var": "var(--xmlui-borderColor-Text-var)", "borderWidth-Text-var": "var(--xmlui-borderWidth-Text-var)", "borderStyle-Text-var": "var(--xmlui-borderStyle-Text-var)", "marginTop-Text-var": "var(--xmlui-marginTop-Text-var)", "marginBottom-Text-var": "var(--xmlui-marginBottom-Text-var)", "textTransform-Text-var": "var(--xmlui-textTransform-Text-var)", "verticalAlign-Text-var": "var(--xmlui-verticalAlign-Text-var)", "letterSpacing-Text-var": "var(--xmlui-letterSpacing-Text-var)", "fontFamily-Text-title": "var(--xmlui-fontFamily-Text-title)", "fontSize-Text-title": "var(--xmlui-fontSize-Text-title)", "fontWeight-Text-title": "var(--xmlui-fontWeight-Text-title)", "font-style-Text-title": "var(--xmlui-font-style-Text-title)", "font-stretch-Text-title": "var(--xmlui-font-stretch-Text-title)", "textDecorationLine-Text-title": "var(--xmlui-textDecorationLine-Text-title)", "textDecorationColor-Text-title": "var(--xmlui-textDecorationColor-Text-title)", "textDecorationStyle-Text-title": "var(--xmlui-textDecorationStyle-Text-title)", "textDecorationThickness-Text-title": "var(--xmlui-textDecorationThickness-Text-title)", "textUnderlineOffset-Text-title": "var(--xmlui-textUnderlineOffset-Text-title)", "lineHeight-Text-title": "var(--xmlui-lineHeight-Text-title)", "color-Text-title": "var(--xmlui-color-Text-title)", "backgroundColor-Text-title": "var(--xmlui-backgroundColor-Text-title)", "borderRadius-Text-title": "var(--xmlui-borderRadius-Text-title)", "borderColor-Text-title": "var(--xmlui-borderColor-Text-title)", "borderWidth-Text-title": "var(--xmlui-borderWidth-Text-title)", "borderStyle-Text-title": "var(--xmlui-borderStyle-Text-title)", "marginTop-Text-title": "var(--xmlui-marginTop-Text-title)", "marginBottom-Text-title": "var(--xmlui-marginBottom-Text-title)", "textTransform-Text-title": "var(--xmlui-textTransform-Text-title)", "verticalAlign-Text-title": "var(--xmlui-verticalAlign-Text-title)", "letterSpacing-Text-title": "var(--xmlui-letterSpacing-Text-title)", "fontFamily-Text-subtitle": "var(--xmlui-fontFamily-Text-subtitle)", "fontSize-Text-subtitle": "var(--xmlui-fontSize-Text-subtitle)", "fontWeight-Text-subtitle": "var(--xmlui-fontWeight-Text-subtitle)", "font-style-Text-subtitle": "var(--xmlui-font-style-Text-subtitle)", "font-stretch-Text-subtitle": "var(--xmlui-font-stretch-Text-subtitle)", "textDecorationLine-Text-subtitle": "var(--xmlui-textDecorationLine-Text-subtitle)", "textDecorationColor-Text-subtitle": "var(--xmlui-textDecorationColor-Text-subtitle)", "textDecorationStyle-Text-subtitle": "var(--xmlui-textDecorationStyle-Text-subtitle)", "textDecorationThickness-Text-subtitle": "var(--xmlui-textDecorationThickness-Text-subtitle)", "textUnderlineOffset-Text-subtitle": "var(--xmlui-textUnderlineOffset-Text-subtitle)", "lineHeight-Text-subtitle": "var(--xmlui-lineHeight-Text-subtitle)", "color-Text-subtitle": "var(--xmlui-color-Text-subtitle)", "backgroundColor-Text-subtitle": "var(--xmlui-backgroundColor-Text-subtitle)", "borderRadius-Text-subtitle": "var(--xmlui-borderRadius-Text-subtitle)", "borderColor-Text-subtitle": "var(--xmlui-borderColor-Text-subtitle)", "borderWidth-Text-subtitle": "var(--xmlui-borderWidth-Text-subtitle)", "borderStyle-Text-subtitle": "var(--xmlui-borderStyle-Text-subtitle)", "marginTop-Text-subtitle": "var(--xmlui-marginTop-Text-subtitle)", "marginBottom-Text-subtitle": "var(--xmlui-marginBottom-Text-subtitle)", "textTransform-Text-subtitle": "var(--xmlui-textTransform-Text-subtitle)", "verticalAlign-Text-subtitle": "var(--xmlui-verticalAlign-Text-subtitle)", "letterSpacing-Text-subtitle": "var(--xmlui-letterSpacing-Text-subtitle)", "fontFamily-Text-small": "var(--xmlui-fontFamily-Text-small)", "fontSize-Text-small": "var(--xmlui-fontSize-Text-small)", "fontWeight-Text-small": "var(--xmlui-fontWeight-Text-small)", "font-style-Text-small": "var(--xmlui-font-style-Text-small)", "font-stretch-Text-small": "var(--xmlui-font-stretch-Text-small)", "textDecorationLine-Text-small": "var(--xmlui-textDecorationLine-Text-small)", "textDecorationColor-Text-small": "var(--xmlui-textDecorationColor-Text-small)", "textDecorationStyle-Text-small": "var(--xmlui-textDecorationStyle-Text-small)", "textDecorationThickness-Text-small": "var(--xmlui-textDecorationThickness-Text-small)", "textUnderlineOffset-Text-small": "var(--xmlui-textUnderlineOffset-Text-small)", "lineHeight-Text-small": "var(--xmlui-lineHeight-Text-small)", "color-Text-small": "var(--xmlui-color-Text-small)", "backgroundColor-Text-small": "var(--xmlui-backgroundColor-Text-small)", "borderRadius-Text-small": "var(--xmlui-borderRadius-Text-small)", "borderColor-Text-small": "var(--xmlui-borderColor-Text-small)", "borderWidth-Text-small": "var(--xmlui-borderWidth-Text-small)", "borderStyle-Text-small": "var(--xmlui-borderStyle-Text-small)", "marginTop-Text-small": "var(--xmlui-marginTop-Text-small)", "marginBottom-Text-small": "var(--xmlui-marginBottom-Text-small)", "textTransform-Text-small": "var(--xmlui-textTransform-Text-small)", "verticalAlign-Text-small": "var(--xmlui-verticalAlign-Text-small)", "letterSpacing-Text-small": "var(--xmlui-letterSpacing-Text-small)", "fontFamily-Text-caption": "var(--xmlui-fontFamily-Text-caption)", "fontSize-Text-caption": "var(--xmlui-fontSize-Text-caption)", "fontWeight-Text-caption": "var(--xmlui-fontWeight-Text-caption)", "font-style-Text-caption": "var(--xmlui-font-style-Text-caption)", "font-stretch-Text-caption": "var(--xmlui-font-stretch-Text-caption)", "textDecorationLine-Text-caption": "var(--xmlui-textDecorationLine-Text-caption)", "textDecorationColor-Text-caption": "var(--xmlui-textDecorationColor-Text-caption)", "textDecorationStyle-Text-caption": "var(--xmlui-textDecorationStyle-Text-caption)", "textDecorationThickness-Text-caption": "var(--xmlui-textDecorationThickness-Text-caption)", "textUnderlineOffset-Text-caption": "var(--xmlui-textUnderlineOffset-Text-caption)", "lineHeight-Text-caption": "var(--xmlui-lineHeight-Text-caption)", "color-Text-caption": "var(--xmlui-color-Text-caption)", "backgroundColor-Text-caption": "var(--xmlui-backgroundColor-Text-caption)", "borderRadius-Text-caption": "var(--xmlui-borderRadius-Text-caption)", "borderColor-Text-caption": "var(--xmlui-borderColor-Text-caption)", "borderWidth-Text-caption": "var(--xmlui-borderWidth-Text-caption)", "borderStyle-Text-caption": "var(--xmlui-borderStyle-Text-caption)", "marginTop-Text-caption": "var(--xmlui-marginTop-Text-caption)", "marginBottom-Text-caption": "var(--xmlui-marginBottom-Text-caption)", "textTransform-Text-caption": "var(--xmlui-textTransform-Text-caption)", "verticalAlign-Text-caption": "var(--xmlui-verticalAlign-Text-caption)", "letterSpacing-Text-caption": "var(--xmlui-letterSpacing-Text-caption)", "fontFamily-Text-placeholder": "var(--xmlui-fontFamily-Text-placeholder)", "fontSize-Text-placeholder": "var(--xmlui-fontSize-Text-placeholder)", "fontWeight-Text-placeholder": "var(--xmlui-fontWeight-Text-placeholder)", "font-style-Text-placeholder": "var(--xmlui-font-style-Text-placeholder)", "font-stretch-Text-placeholder": "var(--xmlui-font-stretch-Text-placeholder)", "textDecorationLine-Text-placeholder": "var(--xmlui-textDecorationLine-Text-placeholder)", "textDecorationColor-Text-placeholder": "var(--xmlui-textDecorationColor-Text-placeholder)", "textDecorationStyle-Text-placeholder": "var(--xmlui-textDecorationStyle-Text-placeholder)", "textDecorationThickness-Text-placeholder": "var(--xmlui-textDecorationThickness-Text-placeholder)", "textUnderlineOffset-Text-placeholder": "var(--xmlui-textUnderlineOffset-Text-placeholder)", "lineHeight-Text-placeholder": "var(--xmlui-lineHeight-Text-placeholder)", "color-Text-placeholder": "var(--xmlui-color-Text-placeholder)", "backgroundColor-Text-placeholder": "var(--xmlui-backgroundColor-Text-placeholder)", "borderRadius-Text-placeholder": "var(--xmlui-borderRadius-Text-placeholder)", "borderColor-Text-placeholder": "var(--xmlui-borderColor-Text-placeholder)", "borderWidth-Text-placeholder": "var(--xmlui-borderWidth-Text-placeholder)", "borderStyle-Text-placeholder": "var(--xmlui-borderStyle-Text-placeholder)", "marginTop-Text-placeholder": "var(--xmlui-marginTop-Text-placeholder)", "marginBottom-Text-placeholder": "var(--xmlui-marginBottom-Text-placeholder)", "textTransform-Text-placeholder": "var(--xmlui-textTransform-Text-placeholder)", "verticalAlign-Text-placeholder": "var(--xmlui-verticalAlign-Text-placeholder)", "letterSpacing-Text-placeholder": "var(--xmlui-letterSpacing-Text-placeholder)", "fontFamily-Text-paragraph": "var(--xmlui-fontFamily-Text-paragraph)", "fontSize-Text-paragraph": "var(--xmlui-fontSize-Text-paragraph)", "fontWeight-Text-paragraph": "var(--xmlui-fontWeight-Text-paragraph)", "font-style-Text-paragraph": "var(--xmlui-font-style-Text-paragraph)", "font-stretch-Text-paragraph": "var(--xmlui-font-stretch-Text-paragraph)", "textDecorationLine-Text-paragraph": "var(--xmlui-textDecorationLine-Text-paragraph)", "textDecorationColor-Text-paragraph": "var(--xmlui-textDecorationColor-Text-paragraph)", "textDecorationStyle-Text-paragraph": "var(--xmlui-textDecorationStyle-Text-paragraph)", "textDecorationThickness-Text-paragraph": "var(--xmlui-textDecorationThickness-Text-paragraph)", "textUnderlineOffset-Text-paragraph": "var(--xmlui-textUnderlineOffset-Text-paragraph)", "lineHeight-Text-paragraph": "var(--xmlui-lineHeight-Text-paragraph)", "color-Text-paragraph": "var(--xmlui-color-Text-paragraph)", "backgroundColor-Text-paragraph": "var(--xmlui-backgroundColor-Text-paragraph)", "borderRadius-Text-paragraph": "var(--xmlui-borderRadius-Text-paragraph)", "borderColor-Text-paragraph": "var(--xmlui-borderColor-Text-paragraph)", "borderWidth-Text-paragraph": "var(--xmlui-borderWidth-Text-paragraph)", "borderStyle-Text-paragraph": "var(--xmlui-borderStyle-Text-paragraph)", "marginTop-Text-paragraph": "var(--xmlui-marginTop-Text-paragraph)", "marginBottom-Text-paragraph": "var(--xmlui-marginBottom-Text-paragraph)", "textTransform-Text-paragraph": "var(--xmlui-textTransform-Text-paragraph)", "verticalAlign-Text-paragraph": "var(--xmlui-verticalAlign-Text-paragraph)", "letterSpacing-Text-paragraph": "var(--xmlui-letterSpacing-Text-paragraph)", "fontFamily-Text-subheading": "var(--xmlui-fontFamily-Text-subheading)", "fontSize-Text-subheading": "var(--xmlui-fontSize-Text-subheading)", "fontWeight-Text-subheading": "var(--xmlui-fontWeight-Text-subheading)", "font-style-Text-subheading": "var(--xmlui-font-style-Text-subheading)", "font-stretch-Text-subheading": "var(--xmlui-font-stretch-Text-subheading)", "textDecorationLine-Text-subheading": "var(--xmlui-textDecorationLine-Text-subheading)", "textDecorationColor-Text-subheading": "var(--xmlui-textDecorationColor-Text-subheading)", "textDecorationStyle-Text-subheading": "var(--xmlui-textDecorationStyle-Text-subheading)", "textDecorationThickness-Text-subheading": "var(--xmlui-textDecorationThickness-Text-subheading)", "textUnderlineOffset-Text-subheading": "var(--xmlui-textUnderlineOffset-Text-subheading)", "lineHeight-Text-subheading": "var(--xmlui-lineHeight-Text-subheading)", "color-Text-subheading": "var(--xmlui-color-Text-subheading)", "backgroundColor-Text-subheading": "var(--xmlui-backgroundColor-Text-subheading)", "borderRadius-Text-subheading": "var(--xmlui-borderRadius-Text-subheading)", "borderColor-Text-subheading": "var(--xmlui-borderColor-Text-subheading)", "borderWidth-Text-subheading": "var(--xmlui-borderWidth-Text-subheading)", "borderStyle-Text-subheading": "var(--xmlui-borderStyle-Text-subheading)", "marginTop-Text-subheading": "var(--xmlui-marginTop-Text-subheading)", "marginBottom-Text-subheading": "var(--xmlui-marginBottom-Text-subheading)", "textTransform-Text-subheading": "var(--xmlui-textTransform-Text-subheading)", "verticalAlign-Text-subheading": "var(--xmlui-verticalAlign-Text-subheading)", "letterSpacing-Text-subheading": "var(--xmlui-letterSpacing-Text-subheading)", "fontFamily-Text-tableheading": "var(--xmlui-fontFamily-Text-tableheading)", "fontSize-Text-tableheading": "var(--xmlui-fontSize-Text-tableheading)", "fontWeight-Text-tableheading": "var(--xmlui-fontWeight-Text-tableheading)", "font-style-Text-tableheading": "var(--xmlui-font-style-Text-tableheading)", "font-stretch-Text-tableheading": "var(--xmlui-font-stretch-Text-tableheading)", "textDecorationLine-Text-tableheading": "var(--xmlui-textDecorationLine-Text-tableheading)", "textDecorationColor-Text-tableheading": "var(--xmlui-textDecorationColor-Text-tableheading)", "textDecorationStyle-Text-tableheading": "var(--xmlui-textDecorationStyle-Text-tableheading)", "textDecorationThickness-Text-tableheading": "var(--xmlui-textDecorationThickness-Text-tableheading)", "textUnderlineOffset-Text-tableheading": "var(--xmlui-textUnderlineOffset-Text-tableheading)", "lineHeight-Text-tableheading": "var(--xmlui-lineHeight-Text-tableheading)", "color-Text-tableheading": "var(--xmlui-color-Text-tableheading)", "backgroundColor-Text-tableheading": "var(--xmlui-backgroundColor-Text-tableheading)", "borderRadius-Text-tableheading": "var(--xmlui-borderRadius-Text-tableheading)", "borderColor-Text-tableheading": "var(--xmlui-borderColor-Text-tableheading)", "borderWidth-Text-tableheading": "var(--xmlui-borderWidth-Text-tableheading)", "borderStyle-Text-tableheading": "var(--xmlui-borderStyle-Text-tableheading)", "marginTop-Text-tableheading": "var(--xmlui-marginTop-Text-tableheading)", "marginBottom-Text-tableheading": "var(--xmlui-marginBottom-Text-tableheading)", "textTransform-Text-tableheading": "var(--xmlui-textTransform-Text-tableheading)", "verticalAlign-Text-tableheading": "var(--xmlui-verticalAlign-Text-tableheading)", "letterSpacing-Text-tableheading": "var(--xmlui-letterSpacing-Text-tableheading)", "fontFamily-Text-secondary": "var(--xmlui-fontFamily-Text-secondary)", "fontSize-Text-secondary": "var(--xmlui-fontSize-Text-secondary)", "fontWeight-Text-secondary": "var(--xmlui-fontWeight-Text-secondary)", "font-style-Text-secondary": "var(--xmlui-font-style-Text-secondary)", "font-stretch-Text-secondary": "var(--xmlui-font-stretch-Text-secondary)", "textDecorationLine-Text-secondary": "var(--xmlui-textDecorationLine-Text-secondary)", "textDecorationColor-Text-secondary": "var(--xmlui-textDecorationColor-Text-secondary)", "textDecorationStyle-Text-secondary": "var(--xmlui-textDecorationStyle-Text-secondary)", "textDecorationThickness-Text-secondary": "var(--xmlui-textDecorationThickness-Text-secondary)", "textUnderlineOffset-Text-secondary": "var(--xmlui-textUnderlineOffset-Text-secondary)", "lineHeight-Text-secondary": "var(--xmlui-lineHeight-Text-secondary)", "color-Text-secondary": "var(--xmlui-color-Text-secondary)", "backgroundColor-Text-secondary": "var(--xmlui-backgroundColor-Text-secondary)", "borderRadius-Text-secondary": "var(--xmlui-borderRadius-Text-secondary)", "borderColor-Text-secondary": "var(--xmlui-borderColor-Text-secondary)", "borderWidth-Text-secondary": "var(--xmlui-borderWidth-Text-secondary)", "borderStyle-Text-secondary": "var(--xmlui-borderStyle-Text-secondary)", "marginTop-Text-secondary": "var(--xmlui-marginTop-Text-secondary)", "marginBottom-Text-secondary": "var(--xmlui-marginBottom-Text-secondary)", "textTransform-Text-secondary": "var(--xmlui-textTransform-Text-secondary)", "verticalAlign-Text-secondary": "var(--xmlui-verticalAlign-Text-secondary)", "letterSpacing-Text-secondary": "var(--xmlui-letterSpacing-Text-secondary)"}'`, Tu = "_text_icabi_13", yu = "_abbr_icabi_23", Cu = "_cite_icabi_52", ku = "_codefence_icabi_81", Su = "_code_icabi_81", wu = "_deleted_icabi_144", Hu = "_inserted_icabi_188", Bu = "_keyboard_icabi_232", Iu = "_marked_icabi_261", $u = "_mono_icabi_305", Lu = "_sample_icabi_334", _u = "_sup_icabi_363", Au = "_sub_icabi_392", Nu = "_title_icabi_450", Wu = "_subtitle_icabi_479", Ou = "_small_icabi_508", Ru = "_caption_icabi_537", zu = "_placeholder_icabi_566", Vu = "_paragraph_icabi_595", Eu = "_subheading_icabi_624", Du = "_tableheading_icabi_653", Pu = "_secondary_icabi_682", Mu = "_strong_icabi_711", Fu = "_truncateOverflow_icabi_719", qu = "_preserveLinebreaks_icabi_726", Uu = "_noEllipsis_icabi_730", Kt = {
  themeVars: gu,
  text: Tu,
  abbr: yu,
  cite: Cu,
  codefence: ku,
  code: Su,
  deleted: wu,
  inserted: Hu,
  keyboard: Bu,
  marked: Iu,
  mono: $u,
  sample: Lu,
  sup: _u,
  sub: Au,
  var: "_var_icabi_421",
  title: Nu,
  subtitle: Wu,
  small: Ou,
  caption: Ru,
  placeholder: zu,
  paragraph: Vu,
  subheading: Eu,
  tableheading: Du,
  secondary: Pu,
  strong: Mu,
  truncateOverflow: Fu,
  preserveLinebreaks: qu,
  noEllipsis: Uu
};
function Gu(e) {
  if (typeof e == "number") return e + "px";
  const r = e.trim();
  if (r.startsWith("var("))
    return r;
  const t = parseFloat(r), o = t.toString(), a = r.replace(o, "");
  return Number.isNaN(t) ? "0px" : a === "" ? o + "px" : r;
}
function rl(e) {
  const r = e && e > 0 ? e : 0;
  return r > 1 ? {
    WebkitLineClamp: r,
    lineClamp: r,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    boxOrient: "vertical",
    whiteSpace: "initial"
  } : Ot;
}
function wi(e) {
  if (typeof e == "number")
    return e + "px";
  if (typeof e == "string" && /^\d+$/.test(e.trim())) {
    const r = parseInt(e, 10);
    if (!isNaN(r))
      return r + "px";
  }
  return e == null ? void 0 : e.toString();
}
const no = xe(function({
  uid: r,
  variant: t,
  maxLines: o = 0,
  style: a,
  children: n,
  preserveLinebreaks: i,
  ellipses: l = !0,
  ...s
}, f) {
  const h = he(null), c = f ? st(h, f) : h, T = ue(() => !t || !Ci[t] ? "div" : Ci[t], [t]);
  return /* @__PURE__ */ p(gr, { children: /* @__PURE__ */ p(
    T,
    {
      ...s,
      ref: c,
      className: le([
        Kt.text,
        Kt[t || "default"],
        {
          [Kt.truncateOverflow]: o > 0,
          [Kt.preserveLinebreaks]: i,
          [Kt.noEllipsis]: !l
        }
      ]),
      style: {
        ...a,
        ...rl(o)
      },
      children: n
    }
  ) });
});
function lo({ iconName: e, text: r, className: t }) {
  return /* @__PURE__ */ p(gr, { children: e || r ? /* @__PURE__ */ j("div", { className: le(vu.wrapper, t), children: [
    /* @__PURE__ */ p(ye, { name: e, style: { color: "inherit" } }),
    r && /* @__PURE__ */ p("div", { style: { display: "flex", userSelect: "none" }, children: /* @__PURE__ */ p(no, { style: { fontSize: "inherit" }, children: r }) })
  ] }) : null });
}
var Na = Ve.forwardRef((e, r) => {
  const { children: t, ...o } = e, a = Ve.Children.toArray(t), n = a.find(Xu);
  if (n) {
    const i = n.props.children, l = a.map((s) => s === n ? Ve.Children.count(i) > 1 ? Ve.Children.only(null) : Ve.isValidElement(i) ? i.props.children : null : s);
    return /* @__PURE__ */ p(Wa, { ...o, ref: r, children: Ve.isValidElement(i) ? Ve.cloneElement(i, void 0, l) : null });
  }
  return /* @__PURE__ */ p(Wa, { ...o, ref: r, children: t });
});
Na.displayName = "Slot";
var Wa = Ve.forwardRef((e, r) => {
  const { children: t, ...o } = e;
  if (Ve.isValidElement(t)) {
    const a = Zu(t), n = Qu(o, t.props);
    return t.type !== Ve.Fragment && (n.ref = r ? st(r, a) : a), Ve.cloneElement(t, n);
  }
  return Ve.Children.count(t) > 1 ? Ve.Children.only(null) : null;
});
Wa.displayName = "SlotClone";
var Yu = ({ children: e }) => /* @__PURE__ */ p(gr, { children: e });
function Xu(e) {
  return Ve.isValidElement(e) && e.type === Yu;
}
function Qu(e, r) {
  const t = { ...r };
  for (const o in r) {
    const a = e[o], n = r[o];
    /^on[A-Z]/.test(o) ? a && n ? t[o] = (...l) => {
      n(...l), a(...l);
    } : a && (t[o] = a) : o === "style" ? t[o] = { ...a, ...n } : o === "className" && (t[o] = [a, n].filter(Boolean).join(" "));
  }
  return { ...e, ...t };
}
function Zu(e) {
  var o, a;
  let r = (o = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : o.get, t = r && "isReactWarning" in r && r.isReactWarning;
  return t ? e.ref : (r = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, t = r && "isReactWarning" in r && r.isReactWarning, t ? e.props.ref : e.props.ref || e.ref);
}
const ju = `'{"color-FormItemLabel": "var(--xmlui-color-FormItemLabel)", "fontFamily-FormItemLabel": "var(--xmlui-fontFamily-FormItemLabel)", "fontSize-FormItemLabel": "var(--xmlui-fontSize-FormItemLabel)", "fontWeight-FormItemLabel": "var(--xmlui-fontWeight-FormItemLabel)", "font-style-FormItemLabel": "var(--xmlui-font-style-FormItemLabel)", "textTransform-FormItemLabel": "var(--xmlui-textTransform-FormItemLabel)", "color-FormItemLabel-required": "var(--xmlui-color-FormItemLabel-required)", "fontSize-FormItemLabel-required": "var(--xmlui-fontSize-FormItemLabel-required)", "fontWeight-FormItemLabel-required": "var(--xmlui-fontWeight-FormItemLabel-required)", "font-style-FormItemLabel-required": "var(--xmlui-font-style-FormItemLabel-required)", "textTransform-FormItemLabel-required": "var(--xmlui-textTransform-FormItemLabel-required)", "color-FormItemLabel-requiredMark": "var(--xmlui-color-FormItemLabel-requiredMark)"}'`, Ju = "_container_17mb0_13", Ku = "_top_17mb0_20", ec = "_end_17mb0_25", rc = "_bottom_17mb0_31", tc = "_start_17mb0_36", oc = "_shrinkToLabel_17mb0_42", ac = "_inputLabel_17mb0_45", ic = "_disabled_17mb0_58", nc = "_labelBreak_17mb0_62", lc = "_required_17mb0_66", dc = "_requiredMark_17mb0_73", Hr = {
  themeVars: ju,
  container: Ju,
  top: Ku,
  end: ec,
  bottom: rc,
  start: tc,
  shrinkToLabel: oc,
  inputLabel: ac,
  disabled: ic,
  labelBreak: nc,
  required: lc,
  requiredMark: dc
}, sc = `'{"size-Spinner": "var(--xmlui-size-Spinner)", "thickness-Spinner": "var(--xmlui-thickness-Spinner)", "borderColor-Spinner": "var(--xmlui-borderColor-Spinner)"}'`, uc = "_fullScreenSpinnerWrapper_xat8c_54", Oa = {
  themeVars: sc,
  "lds-ring": "_lds-ring_xat8c_13",
  fullScreenSpinnerWrapper: uc
}, tl = xe(function({ delay: r = 400, fullScreen: t = !1, style: o }, a) {
  const [n, i] = me(r === 0);
  K(() => {
    const s = setTimeout(() => {
      i(!0);
    }, r);
    return () => {
      clearTimeout(s);
    };
  }, [r]);
  const l = /* @__PURE__ */ p(gr, { children: /* @__PURE__ */ j("div", { className: Oa["lds-ring"], style: o, ref: a, children: [
    /* @__PURE__ */ p("div", {}),
    /* @__PURE__ */ p("div", {}),
    /* @__PURE__ */ p("div", {}),
    /* @__PURE__ */ p("div", {})
  ] }) });
  return n ? t ? /* @__PURE__ */ p("div", { className: Oa.fullScreenSpinnerWrapper, children: l }) : l : null;
}), cc = /^[0-9]+$/, Ir = xe(function({
  id: r,
  labelPosition: t = "top",
  style: o,
  label: a,
  labelBreak: n = !0,
  labelWidth: i,
  enabled: l = !0,
  required: s = !1,
  children: f,
  validationInProgress: h = !1,
  shrinkToLabel: c = !1,
  onFocus: T,
  onBlur: b,
  labelStyle: v,
  validationResult: y,
  isInputTemplateUsed: w = !1
}, _) {
  const H = mo(), $ = r || H;
  return a === void 0 ? /* @__PURE__ */ p(Na, { style: o, id: $, onFocus: T, onBlur: b, ref: _, children: f }) : /* @__PURE__ */ j("div", { style: o, ref: _, children: [
    /* @__PURE__ */ j(
      "div",
      {
        className: le(Hr.container, {
          [Hr.top]: t === "top",
          [Hr.bottom]: t === "bottom",
          [Hr.start]: t === "start",
          [Hr.end]: t === "end",
          [Hr.shrinkToLabel]: c
        }),
        onFocus: T,
        onBlur: b,
        children: [
          a && /* @__PURE__ */ j(
            "label",
            {
              htmlFor: $,
              onClick: () => document.getElementById($).focus(),
              style: {
                ...v,
                width: i && cc.test(i) ? `${i}px` : i,
                flexShrink: i !== void 0 ? 0 : void 0
              },
              className: le(Hr.inputLabel, {
                [Hr.required]: s,
                [Hr.disabled]: !l,
                [Hr.labelBreak]: n
              }),
              children: [
                a,
                " ",
                s && /* @__PURE__ */ p("span", { className: Hr.requiredMark, children: "*" }),
                h && /* @__PURE__ */ p(
                  tl,
                  {
                    style: { height: "1em", width: "1em", marginLeft: "1em", alignSelf: "center" }
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ p(Na, { id: w ? void 0 : $, children: f })
        ]
      }
    ),
    y
  ] });
}), Ra = xe(function({
  id: r,
  type: t = "text",
  value: o = "",
  updateState: a = de,
  initialValue: n = "",
  style: i,
  maxLength: l,
  enabled: s = !0,
  placeholder: f,
  validationStatus: h = "none",
  onDidChange: c = de,
  onFocus: T = de,
  onBlur: b = de,
  registerComponentApi: v,
  startText: y,
  startIcon: w,
  endText: _,
  endIcon: H,
  autoFocus: $,
  readOnly: O,
  tabIndex: F,
  label: Y,
  labelPosition: V,
  labelWidth: R,
  labelBreak: W,
  required: z
}, x) {
  const m = he(null);
  K(() => {
    $ && setTimeout(() => {
      var P;
      (P = m.current) == null || P.focus();
    }, 0);
  }, [$]);
  const [g, k] = Ae.useState(o);
  K(() => {
    k(o);
  }, [o]), K(() => {
    a({ value: n }, { initial: !0 });
  }, [n, a]);
  const A = X(
    (P) => {
      k(P), a({ value: P }), c(P);
    },
    [c, a]
  ), q = X(
    (P) => {
      A(P.target.value);
    },
    [A]
  ), E = X(() => {
    T == null || T();
  }, [T]), N = X(() => {
    b == null || b();
  }, [b]), B = X(() => {
    var P;
    (P = m.current) == null || P.focus();
  }, []), D = $e((P) => {
    A(P);
  });
  return K(() => {
    v == null || v({
      focus: B,
      setValue: D
    });
  }, [B, v, D]), /* @__PURE__ */ p(
    Ir,
    {
      labelPosition: V,
      label: Y,
      labelWidth: R,
      labelBreak: W,
      required: z,
      enabled: s,
      onFocus: T,
      onBlur: b,
      style: i,
      ref: x,
      children: /* @__PURE__ */ j(
        "div",
        {
          className: le(Rr.inputRoot, {
            [Rr.disabled]: !s,
            [Rr.readOnly]: O,
            [Rr.error]: h === "error",
            [Rr.warning]: h === "warning",
            [Rr.valid]: h === "valid"
          }),
          tabIndex: -1,
          onFocus: B,
          children: [
            /* @__PURE__ */ p(lo, { text: y, iconName: w, className: Rr.adornment }),
            /* @__PURE__ */ p(
              "input",
              {
                id: r,
                type: t,
                className: le(Rr.input, { [Rr.readOnly]: O }),
                disabled: !s,
                value: g,
                maxLength: l,
                placeholder: f,
                onChange: q,
                onFocus: E,
                onBlur: N,
                ref: m,
                readOnly: O,
                autoFocus: $,
                tabIndex: s ? F : -1,
                required: z
              }
            ),
            /* @__PURE__ */ p(lo, { text: _, iconName: H, className: Rr.adornment })
          ]
        }
      )
    }
  );
}), Ht = "TextBox", ol = C({
  status: "experimental",
  description: `The \`${Ht}\` is an input component that allows users to input and edit textual data.`,
  props: {
    placeholder: Vt(),
    initialValue: Cr(),
    label: Fe(),
    labelPosition: Dr("top"),
    labelWidth: jr(Ht),
    labelBreak: Jr(Ht),
    maxLength: _o(),
    autoFocus: rr(),
    required: Ar(),
    readOnly: Lr(),
    enabled: Qe(),
    validationStatus: _r(),
    startText: Ka(),
    startIcon: ei(),
    endText: ri(),
    endIcon: ti()
  },
  events: {
    gotFocus: Tr(Ht),
    lostFocus: yr(Ht),
    didChange: er(Ht)
  },
  apis: {
    focus: et(Ht),
    value: u(
      "You can query the component's value. If no value is set, it will retrieve `undefined`."
    ),
    setValue: Kr()
  },
  themeVars: Z(Rr.themeVars),
  defaultThemeVars: {
    // TODO: When FormItem is themed, move these defaults there
    "borderRadius-Input": "$borderRadius",
    "color-Input": "$textColor-primary",
    "backgroundColor-Input--disabled": "$backgroundColor--disabled",
    "borderWidth-Input": "1px",
    "minHeight-Input": "39px",
    "padding-Input": "$space-2",
    "borderStyle-Input": "solid",
    "borderColor-Input--disabled": "$borderColor--disabled",
    "color-Input--disabled": "$textColor--disabled",
    "borderColor-Input-error": "$borderColor-Input-default--error",
    "borderColor-Input-warning": "$borderColor-Input-default--warning",
    "borderColor-Input-success": "$borderColor-Input-default--success",
    "color-placeholder-Input": "$textColor-subtitle",
    "color-adornment-Input": "$textColor-subtitle",
    "outlineColor-Input--focus": "$outlineColor--focus",
    "outlineWidth-Input--focus": "$outlineWidth--focus",
    "outlineStyle-Input--focus": "$outlineStyle--focus",
    "outlineOffset-Input--focus": "$outlineOffset--focus",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), mc = C({
  ...ol,
  description: "The `Password` component is a specialized version of the `TextBox` component that allows users to input and edit passwords."
});
function pc(e) {
  return typeof e == "string" && (e == null ? void 0 : e.startsWith("$"));
}
const Hi = "Theme", hc = C({
  description: `The \`${Hi}\` component provides a way to define a particular theming context for its nested components. The XMLUI framework uses \`${Hi}\` to define the default theming context for all of its child components. Theme variables and theme settings only work in this context.`,
  allowArbitraryProps: !0,
  props: {
    themeId: u("This property specifies which theme to use by setting the theme's id."),
    tone: {
      description: "This property allows the setting of the current theme's tone.",
      availableValues: ["light", "dark"],
      valueType: "string",
      defaultValue: "light"
    },
    root: u("This property indicates whether the component is at the root of the application.")
  },
  opaque: !0
}), xc = `'{"width-navPanel-App": "var(--xmlui-width-navPanel-App)", "boxShadow-header-App": "var(--xmlui-boxShadow-header-App)", "boxShadow-pages-App": "var(--xmlui-boxShadow-pages-App)", "maxWidth-content-App": "var(--xmlui-maxWidth-content-App)", "backgroundColor-AppHeader": "var(--xmlui-backgroundColor-AppHeader)", "borderBottom-AppHeader": "var(--xmlui-borderBottom-AppHeader)", "scroll-padding-block-Pages": "var(--xmlui-scroll-padding-block-Pages)"}'`, bc = {
  themeVars: xc
}, fc = [
  {
    value: "vertical",
    description: "This layout puts the navigation bar on the left side and displays its items vertically. The main content is aligned to the right (including the header and the footer), and its content is a single scroll container; every part of it moves as you scroll the page. This layout does not display the logo in the app header."
  },
  {
    value: "vertical-sticky",
    description: "Similar to `vertical`, the header and the navigation bar dock to the top of the main content's viewport, while the footer sticks to the bottom. This layout does not display the logo in the app header."
  },
  {
    value: "vertical-full-header",
    description: "Similar to `vertical-sticky`. However, the header and the navigation bar dock to the top of the app's window, while the footer sticks to the bottom."
  },
  {
    value: "condensed",
    description: "Similar to `horizontal`. However, the header and the navigation bar are in a single header block. (default)"
  },
  {
    value: "condensed-sticky",
    description: "However, the header and the navigation bar are in a single header block."
  },
  {
    value: "horizontal",
    description: "This layout stacks the layout sections in a single column in this order: header, navigation bar, main content, and footer. The application is a single scroll container; every part moves as you scroll the page."
  },
  {
    value: "horizontal-sticky",
    description: "Similar to `horizontal`, the header and the navigation bar dock to the top of the viewport, while the footer sticks to the bottom."
  }
];
Zr(null);
const vc = Ae.createContext(null), gc = `'{"padding-AppHeader": "var(--xmlui-padding-AppHeader)", "paddingHorizontal-AppHeader": "var(--xmlui-paddingHorizontal-AppHeader, var(--xmlui-padding-AppHeader))", "paddingVertical-AppHeader": "var(--xmlui-paddingVertical-AppHeader, var(--xmlui-padding-AppHeader))", "paddingLeft-AppHeader": "var(--xmlui-paddingLeft-AppHeader, var(--xmlui-paddingHorizontal-AppHeader, var(--xmlui-padding-AppHeader)))", "paddingRight-AppHeader": "var(--xmlui-paddingRight-AppHeader, var(--xmlui-paddingHorizontal-AppHeader, var(--xmlui-padding-AppHeader)))", "paddingTop-AppHeader": "var(--xmlui-paddingTop-AppHeader, var(--xmlui-paddingVertical-AppHeader, var(--xmlui-padding-AppHeader)))", "paddingBottom-AppHeader": "var(--xmlui-paddingBottom-AppHeader, var(--xmlui-paddingVertical-AppHeader, var(--xmlui-padding-AppHeader)))", "padding-logo-AppHeader": "var(--xmlui-padding-logo-AppHeader)", "paddingHorizontal-logo-AppHeader": "var(--xmlui-paddingHorizontal-logo-AppHeader, var(--xmlui-padding-logo-AppHeader))", "paddingVertical-logo-AppHeader": "var(--xmlui-paddingVertical-logo-AppHeader, var(--xmlui-padding-logo-AppHeader))", "paddingLeft-logo-AppHeader": "var(--xmlui-paddingLeft-logo-AppHeader, var(--xmlui-paddingHorizontal-logo-AppHeader, var(--xmlui-padding-logo-AppHeader)))", "paddingRight-logo-AppHeader": "var(--xmlui-paddingRight-logo-AppHeader, var(--xmlui-paddingHorizontal-logo-AppHeader, var(--xmlui-padding-logo-AppHeader)))", "paddingTop-logo-AppHeader": "var(--xmlui-paddingTop-logo-AppHeader, var(--xmlui-paddingVertical-logo-AppHeader, var(--xmlui-padding-logo-AppHeader)))", "paddingBottom-logo-AppHeader": "var(--xmlui-paddingBottom-logo-AppHeader, var(--xmlui-paddingVertical-logo-AppHeader, var(--xmlui-padding-logo-AppHeader)))", "border-AppHeader": "var(--xmlui-border-AppHeader)", "borderHorizontal-AppHeader": "var(--xmlui-borderHorizontal-AppHeader, var(--xmlui-border-AppHeader))", "borderVertical-AppHeader": "var(--xmlui-borderVertical-AppHeader, var(--xmlui-border-AppHeader))", "borderLeft-AppHeader": "var(--xmlui-borderLeft-AppHeader, var(--xmlui-borderHorizontal-AppHeader, var(--xmlui-border-AppHeader)))", "borderRight-AppHeader": "var(--xmlui-borderRight-AppHeader, var(--xmlui-borderHorizontal-AppHeader, var(--xmlui-border-AppHeader)))", "borderTop-AppHeader": "var(--xmlui-borderTop-AppHeader, var(--xmlui-borderVertical-AppHeader, var(--xmlui-border-AppHeader)))", "borderBottom-AppHeader": "var(--xmlui-borderBottom-AppHeader, var(--xmlui-borderVertical-AppHeader, var(--xmlui-border-AppHeader)))", "borderWidth-AppHeader": "var(--xmlui-borderWidth-AppHeader)", "borderHorizontalWidth-AppHeader": "var(--xmlui-borderHorizontalWidth-AppHeader, var(--xmlui-borderWidth-AppHeader))", "borderLeftWidth-AppHeader": "var(--xmlui-borderLeftWidth-AppHeader, var(--xmlui-borderHorizontalWidth-AppHeader, var(--xmlui-borderWidth-AppHeader)))", "borderRightWidth-AppHeader": "var(--xmlui-borderRightWidth-AppHeader, var(--xmlui-borderHorizontalWidth-AppHeader, var(--xmlui-borderWidth-AppHeader)))", "borderVerticalWidth-AppHeader": "var(--xmlui-borderVerticalWidth-AppHeader, var(--xmlui-borderWidth-AppHeader))", "borderTopWidth-AppHeader": "var(--xmlui-borderTopWidth-AppHeader, var(--xmlui-borderVerticalWidth-AppHeader, var(--xmlui-borderWidth-AppHeader)))", "borderBottomWidth-AppHeader": "var(--xmlui-borderBottomWidth-AppHeader, var(--xmlui-borderVerticalWidth-AppHeader, var(--xmlui-borderWidth-AppHeader)))", "borderStyle-AppHeader": "var(--xmlui-borderStyle-AppHeader)", "borderHorizontalStyle-AppHeader": "var(--xmlui-borderHorizontalStyle-AppHeader, var(--xmlui-borderStyle-AppHeader))", "borderLeftStyle-AppHeader": "var(--xmlui-borderLeftStyle-AppHeader, var(--xmlui-borderHorizontalStyle-AppHeader, var(--xmlui-borderStyle-AppHeader)))", "borderRightStyle-AppHeader": "var(--xmlui-borderRightStyle-AppHeader, var(--xmlui-borderHorizontalStyle-AppHeader, var(--xmlui-borderStyle-AppHeader)))", "borderVerticalStyle-AppHeader": "var(--xmlui-borderVerticalStyle-AppHeader, var(--xmlui-borderStyle-AppHeader))", "borderTopStyle-AppHeader": "var(--xmlui-borderTopStyle-AppHeader, var(--xmlui-borderVerticalStyle-AppHeader, var(--xmlui-borderStyle-AppHeader)))", "borderBottomStyle-AppHeader": "var(--xmlui-borderBottomStyle-AppHeader, var(--xmlui-borderVerticalStyle-AppHeader, var(--xmlui-borderStyle-AppHeader)))", "borderColor-AppHeader": "var(--xmlui-borderColor-AppHeader)", "borderHorizontalColor-AppHeader": "var(--xmlui-borderHorizontalColor-AppHeader, var(--xmlui-borderColor-AppHeader))", "borderLeftColor-AppHeader": "var(--xmlui-borderLeftColor-AppHeader, var(--xmlui-borderHorizontalColor-AppHeader, var(--xmlui-borderColor-AppHeader)))", "borderRightColor-AppHeader": "var(--xmlui-borderRightColor-AppHeader, var(--xmlui-borderHorizontalColor-AppHeader, var(--xmlui-borderColor-AppHeader)))", "borderVerticalColor-AppHeader": "var(--xmlui-borderVerticalColor-AppHeader, var(--xmlui-borderColor-AppHeader))", "borderTopColor-AppHeader": "var(--xmlui-borderTopColor-AppHeader, var(--xmlui-borderVerticalColor-AppHeader, var(--xmlui-borderColor-AppHeader)))", "borderBottomColor-AppHeader": "var(--xmlui-borderBottomColor-AppHeader, var(--xmlui-borderVerticalColor-AppHeader, var(--xmlui-borderColor-AppHeader)))", "radius-start-start-AppHeader": "var(--xmlui-radius-start-start-AppHeader, var(--xmlui-borderRadius-AppHeader))", "radius-start-end-AppHeader": "var(--xmlui-radius-start-end-AppHeader, var(--xmlui-borderRadius-AppHeader))", "radius-end-start-AppHeader": "var(--xmlui-radius-end-start-AppHeader, var(--xmlui-borderRadius-AppHeader))", "radius-end-end-AppHeader": "var(--xmlui-radius-end-end-AppHeader, var(--xmlui-borderRadius-AppHeader))", "width-logo-AppHeader": "var(--xmlui-width-logo-AppHeader)", "align-content-AppHeader": "var(--xmlui-align-content-AppHeader)", "height-AppHeader": "var(--xmlui-height-AppHeader)", "backgroundColor-AppHeader": "var(--xmlui-backgroundColor-AppHeader)", "maxWidth-content-AppHeader": "var(--xmlui-maxWidth-content-AppHeader)"}'`, Tc = {
  themeVars: gc
}, yc = '"[]"', Cc = {
  themeVars: yc
}, kc = `'{"padding-NavLink": "var(--xmlui-padding-NavLink)", "paddingHorizontal-NavLink": "var(--xmlui-paddingHorizontal-NavLink, var(--xmlui-padding-NavLink))", "paddingVertical-NavLink": "var(--xmlui-paddingVertical-NavLink, var(--xmlui-padding-NavLink))", "paddingLeft-NavLink": "var(--xmlui-paddingLeft-NavLink, var(--xmlui-paddingHorizontal-NavLink, var(--xmlui-padding-NavLink)))", "paddingRight-NavLink": "var(--xmlui-paddingRight-NavLink, var(--xmlui-paddingHorizontal-NavLink, var(--xmlui-padding-NavLink)))", "paddingTop-NavLink": "var(--xmlui-paddingTop-NavLink, var(--xmlui-paddingVertical-NavLink, var(--xmlui-padding-NavLink)))", "paddingBottom-NavLink": "var(--xmlui-paddingBottom-NavLink, var(--xmlui-paddingVertical-NavLink, var(--xmlui-padding-NavLink)))", "border-NavLink": "var(--xmlui-border-NavLink)", "borderHorizontal-NavLink": "var(--xmlui-borderHorizontal-NavLink, var(--xmlui-border-NavLink))", "borderVertical-NavLink": "var(--xmlui-borderVertical-NavLink, var(--xmlui-border-NavLink))", "borderLeft-NavLink": "var(--xmlui-borderLeft-NavLink, var(--xmlui-borderHorizontal-NavLink, var(--xmlui-border-NavLink)))", "borderRight-NavLink": "var(--xmlui-borderRight-NavLink, var(--xmlui-borderHorizontal-NavLink, var(--xmlui-border-NavLink)))", "borderTop-NavLink": "var(--xmlui-borderTop-NavLink, var(--xmlui-borderVertical-NavLink, var(--xmlui-border-NavLink)))", "borderBottom-NavLink": "var(--xmlui-borderBottom-NavLink, var(--xmlui-borderVertical-NavLink, var(--xmlui-border-NavLink)))", "borderWidth-NavLink": "var(--xmlui-borderWidth-NavLink)", "borderHorizontalWidth-NavLink": "var(--xmlui-borderHorizontalWidth-NavLink, var(--xmlui-borderWidth-NavLink))", "borderLeftWidth-NavLink": "var(--xmlui-borderLeftWidth-NavLink, var(--xmlui-borderHorizontalWidth-NavLink, var(--xmlui-borderWidth-NavLink)))", "borderRightWidth-NavLink": "var(--xmlui-borderRightWidth-NavLink, var(--xmlui-borderHorizontalWidth-NavLink, var(--xmlui-borderWidth-NavLink)))", "borderVerticalWidth-NavLink": "var(--xmlui-borderVerticalWidth-NavLink, var(--xmlui-borderWidth-NavLink))", "borderTopWidth-NavLink": "var(--xmlui-borderTopWidth-NavLink, var(--xmlui-borderVerticalWidth-NavLink, var(--xmlui-borderWidth-NavLink)))", "borderBottomWidth-NavLink": "var(--xmlui-borderBottomWidth-NavLink, var(--xmlui-borderVerticalWidth-NavLink, var(--xmlui-borderWidth-NavLink)))", "borderStyle-NavLink": "var(--xmlui-borderStyle-NavLink)", "borderHorizontalStyle-NavLink": "var(--xmlui-borderHorizontalStyle-NavLink, var(--xmlui-borderStyle-NavLink))", "borderLeftStyle-NavLink": "var(--xmlui-borderLeftStyle-NavLink, var(--xmlui-borderHorizontalStyle-NavLink, var(--xmlui-borderStyle-NavLink)))", "borderRightStyle-NavLink": "var(--xmlui-borderRightStyle-NavLink, var(--xmlui-borderHorizontalStyle-NavLink, var(--xmlui-borderStyle-NavLink)))", "borderVerticalStyle-NavLink": "var(--xmlui-borderVerticalStyle-NavLink, var(--xmlui-borderStyle-NavLink))", "borderTopStyle-NavLink": "var(--xmlui-borderTopStyle-NavLink, var(--xmlui-borderVerticalStyle-NavLink, var(--xmlui-borderStyle-NavLink)))", "borderBottomStyle-NavLink": "var(--xmlui-borderBottomStyle-NavLink, var(--xmlui-borderVerticalStyle-NavLink, var(--xmlui-borderStyle-NavLink)))", "borderColor-NavLink": "var(--xmlui-borderColor-NavLink)", "borderHorizontalColor-NavLink": "var(--xmlui-borderHorizontalColor-NavLink, var(--xmlui-borderColor-NavLink))", "borderLeftColor-NavLink": "var(--xmlui-borderLeftColor-NavLink, var(--xmlui-borderHorizontalColor-NavLink, var(--xmlui-borderColor-NavLink)))", "borderRightColor-NavLink": "var(--xmlui-borderRightColor-NavLink, var(--xmlui-borderHorizontalColor-NavLink, var(--xmlui-borderColor-NavLink)))", "borderVerticalColor-NavLink": "var(--xmlui-borderVerticalColor-NavLink, var(--xmlui-borderColor-NavLink))", "borderTopColor-NavLink": "var(--xmlui-borderTopColor-NavLink, var(--xmlui-borderVerticalColor-NavLink, var(--xmlui-borderColor-NavLink)))", "borderBottomColor-NavLink": "var(--xmlui-borderBottomColor-NavLink, var(--xmlui-borderVerticalColor-NavLink, var(--xmlui-borderColor-NavLink)))", "radius-start-start-NavLink": "var(--xmlui-radius-start-start-NavLink, var(--xmlui-borderRadius-NavLink))", "radius-start-end-NavLink": "var(--xmlui-radius-start-end-NavLink, var(--xmlui-borderRadius-NavLink))", "radius-end-start-NavLink": "var(--xmlui-radius-end-start-NavLink, var(--xmlui-borderRadius-NavLink))", "radius-end-end-NavLink": "var(--xmlui-radius-end-end-NavLink, var(--xmlui-borderRadius-NavLink))", "backgroundColor-NavLink": "var(--xmlui-backgroundColor-NavLink)", "backgroundColor-NavLink--hover": "var(--xmlui-backgroundColor-NavLink--hover)", "backgroundColor-NavLink--hover--active": "var(--xmlui-backgroundColor-NavLink--hover--active)", "backgroundColor-NavLink--active": "var(--xmlui-backgroundColor-NavLink--active)", "backgroundColor-NavLink--pressed": "var(--xmlui-backgroundColor-NavLink--pressed)", "backgroundColor-NavLink--pressed--active": "var(--xmlui-backgroundColor-NavLink--pressed--active)", "fontSize-NavLink": "var(--xmlui-fontSize-NavLink)", "color-NavLink": "var(--xmlui-color-NavLink)", "color-NavLink--hover": "var(--xmlui-color-NavLink--hover)", "color-NavLink--active": "var(--xmlui-color-NavLink--active)", "color-NavLink--hover--active": "var(--xmlui-color-NavLink--hover--active)", "color-NavLink--pressed": "var(--xmlui-color-NavLink--pressed)", "color-NavLink--pressed--active": "var(--xmlui-color-NavLink--pressed--active)", "color-icon-NavLink": "var(--xmlui-color-icon-NavLink)", "fontFamily-NavLink": "var(--xmlui-fontFamily-NavLink)", "fontWeight-NavLink": "var(--xmlui-fontWeight-NavLink)", "fontWeight-NavLink--pressed": "var(--xmlui-fontWeight-NavLink--pressed)", "fontWeight-NavLink--active": "var(--xmlui-fontWeight-NavLink--active)", "borderRadius-indicator-NavLink": "var(--xmlui-borderRadius-indicator-NavLink)", "thickness-indicator-NavLink": "var(--xmlui-thickness-indicator-NavLink)", "color-indicator-NavLink": "var(--xmlui-color-indicator-NavLink)", "color-indicator-NavLink--hover": "var(--xmlui-color-indicator-NavLink--hover)", "color-indicator-NavLink--active": "var(--xmlui-color-indicator-NavLink--active)", "color-indicator-NavLink--pressed": "var(--xmlui-color-indicator-NavLink--pressed)", "outlineWidth-NavLink--focus": "var(--xmlui-outlineWidth-NavLink--focus)", "outlineColor-NavLink--focus": "var(--xmlui-outlineColor-NavLink--focus)", "outlineStyle-NavLink--focus": "var(--xmlui-outlineStyle-NavLink--focus)", "outlineOffset-NavLink--focus": "var(--xmlui-outlineOffset-NavLink--focus)"}'`, Sc = {
  themeVars: kc
};
function wc(e) {
  return !e || typeof e == "string" || typeof e == "number" ? e : e.queryParams !== void 0 ? {
    ...e,
    search: new URLSearchParams(jl(e.queryParams, Jl)).toString()
  } : e;
}
const Hc = `'{"border-NavPanel": "var(--xmlui-border-NavPanel)", "borderHorizontal-NavPanel": "var(--xmlui-borderHorizontal-NavPanel, var(--xmlui-border-NavPanel))", "borderVertical-NavPanel": "var(--xmlui-borderVertical-NavPanel, var(--xmlui-border-NavPanel))", "borderLeft-NavPanel": "var(--xmlui-borderLeft-NavPanel, var(--xmlui-borderHorizontal-NavPanel, var(--xmlui-border-NavPanel)))", "borderRight-NavPanel": "var(--xmlui-borderRight-NavPanel, var(--xmlui-borderHorizontal-NavPanel, var(--xmlui-border-NavPanel)))", "borderTop-NavPanel": "var(--xmlui-borderTop-NavPanel, var(--xmlui-borderVertical-NavPanel, var(--xmlui-border-NavPanel)))", "borderBottom-NavPanel": "var(--xmlui-borderBottom-NavPanel, var(--xmlui-borderVertical-NavPanel, var(--xmlui-border-NavPanel)))", "borderWidth-NavPanel": "var(--xmlui-borderWidth-NavPanel)", "borderHorizontalWidth-NavPanel": "var(--xmlui-borderHorizontalWidth-NavPanel, var(--xmlui-borderWidth-NavPanel))", "borderLeftWidth-NavPanel": "var(--xmlui-borderLeftWidth-NavPanel, var(--xmlui-borderHorizontalWidth-NavPanel, var(--xmlui-borderWidth-NavPanel)))", "borderRightWidth-NavPanel": "var(--xmlui-borderRightWidth-NavPanel, var(--xmlui-borderHorizontalWidth-NavPanel, var(--xmlui-borderWidth-NavPanel)))", "borderVerticalWidth-NavPanel": "var(--xmlui-borderVerticalWidth-NavPanel, var(--xmlui-borderWidth-NavPanel))", "borderTopWidth-NavPanel": "var(--xmlui-borderTopWidth-NavPanel, var(--xmlui-borderVerticalWidth-NavPanel, var(--xmlui-borderWidth-NavPanel)))", "borderBottomWidth-NavPanel": "var(--xmlui-borderBottomWidth-NavPanel, var(--xmlui-borderVerticalWidth-NavPanel, var(--xmlui-borderWidth-NavPanel)))", "borderStyle-NavPanel": "var(--xmlui-borderStyle-NavPanel)", "borderHorizontalStyle-NavPanel": "var(--xmlui-borderHorizontalStyle-NavPanel, var(--xmlui-borderStyle-NavPanel))", "borderLeftStyle-NavPanel": "var(--xmlui-borderLeftStyle-NavPanel, var(--xmlui-borderHorizontalStyle-NavPanel, var(--xmlui-borderStyle-NavPanel)))", "borderRightStyle-NavPanel": "var(--xmlui-borderRightStyle-NavPanel, var(--xmlui-borderHorizontalStyle-NavPanel, var(--xmlui-borderStyle-NavPanel)))", "borderVerticalStyle-NavPanel": "var(--xmlui-borderVerticalStyle-NavPanel, var(--xmlui-borderStyle-NavPanel))", "borderTopStyle-NavPanel": "var(--xmlui-borderTopStyle-NavPanel, var(--xmlui-borderVerticalStyle-NavPanel, var(--xmlui-borderStyle-NavPanel)))", "borderBottomStyle-NavPanel": "var(--xmlui-borderBottomStyle-NavPanel, var(--xmlui-borderVerticalStyle-NavPanel, var(--xmlui-borderStyle-NavPanel)))", "borderColor-NavPanel": "var(--xmlui-borderColor-NavPanel)", "borderHorizontalColor-NavPanel": "var(--xmlui-borderHorizontalColor-NavPanel, var(--xmlui-borderColor-NavPanel))", "borderLeftColor-NavPanel": "var(--xmlui-borderLeftColor-NavPanel, var(--xmlui-borderHorizontalColor-NavPanel, var(--xmlui-borderColor-NavPanel)))", "borderRightColor-NavPanel": "var(--xmlui-borderRightColor-NavPanel, var(--xmlui-borderHorizontalColor-NavPanel, var(--xmlui-borderColor-NavPanel)))", "borderVerticalColor-NavPanel": "var(--xmlui-borderVerticalColor-NavPanel, var(--xmlui-borderColor-NavPanel))", "borderTopColor-NavPanel": "var(--xmlui-borderTopColor-NavPanel, var(--xmlui-borderVerticalColor-NavPanel, var(--xmlui-borderColor-NavPanel)))", "borderBottomColor-NavPanel": "var(--xmlui-borderBottomColor-NavPanel, var(--xmlui-borderVerticalColor-NavPanel, var(--xmlui-borderColor-NavPanel)))", "radius-start-start-NavPanel": "var(--xmlui-radius-start-start-NavPanel, var(--xmlui-borderRadius-NavPanel))", "radius-start-end-NavPanel": "var(--xmlui-radius-start-end-NavPanel, var(--xmlui-borderRadius-NavPanel))", "radius-end-start-NavPanel": "var(--xmlui-radius-end-start-NavPanel, var(--xmlui-borderRadius-NavPanel))", "radius-end-end-NavPanel": "var(--xmlui-radius-end-end-NavPanel, var(--xmlui-borderRadius-NavPanel))", "backgroundColor-NavPanel": "var(--xmlui-backgroundColor-NavPanel)", "boxShadow-NavPanel": "var(--xmlui-boxShadow-NavPanel)", "height-AppHeader": "var(--xmlui-height-AppHeader)", "maxWidth-content-App": "var(--xmlui-maxWidth-content-App)", "padding-NavPanel": "var(--xmlui-padding-NavPanel)", "paddingHorizontal-NavPanel": "var(--xmlui-paddingHorizontal-NavPanel)", "paddingVertical-NavPanel": "var(--xmlui-paddingVertical-NavPanel, var(--xmlui-padding-NavPanel))", "paddingLeft-NavPanel": "var(--xmlui-paddingLeft-NavPanel, var(--xmlui-paddingHorizontal-NavPanel, var(--xmlui-padding-NavPanel)))", "paddingRight-NavPanel": "var(--xmlui-paddingRight-NavPanel, var(--xmlui-paddingHorizontal-NavPanel, var(--xmlui-padding-NavPanel)))", "paddingTop-NavPanel": "var(--xmlui-paddingTop-NavPanel, var(--xmlui-paddingVertical-NavPanel, var(--xmlui-padding-NavPanel)))", "paddingBottom-NavPanel": "var(--xmlui-paddingBottom-NavPanel, var(--xmlui-paddingVertical-NavPanel, var(--xmlui-padding-NavPanel)))", "padding-logo-NavPanel": "var(--xmlui-padding-logo-NavPanel)", "paddingHorizontal-logo-NavPanel": "var(--xmlui-paddingHorizontal-logo-NavPanel)", "paddingVertical-logo-NavPanel": "var(--xmlui-paddingVertical-logo-NavPanel)", "paddingLeft-logo-NavPanel": "var(--xmlui-paddingLeft-logo-NavPanel, var(--xmlui-paddingHorizontal-logo-NavPanel, var(--xmlui-padding-logo-NavPanel)))", "paddingRight-logo-NavPanel": "var(--xmlui-paddingRight-logo-NavPanel, var(--xmlui-paddingHorizontal-logo-NavPanel, var(--xmlui-padding-logo-NavPanel)))", "paddingTop-logo-NavPanel": "var(--xmlui-paddingTop-logo-NavPanel, var(--xmlui-paddingVertical-logo-NavPanel, var(--xmlui-padding-logo-NavPanel)))", "paddingBottom-logo-NavPanel": "var(--xmlui-paddingBottom-logo-NavPanel, var(--xmlui-paddingVertical-logo-NavPanel, var(--xmlui-padding-logo-NavPanel)))", "marginBottom-logo-NavPanel": "var(--xmlui-marginBottom-logo-NavPanel)", "paddingVertical-AppHeader": "var(--xmlui-paddingVertical-AppHeader)", "align-content-AppHeader": "var(--xmlui-align-content-AppHeader)"}'`, Bc = {
  themeVars: Hc
}, Bt = "App", Ic = C({
  status: "stable",
  description: `The \`${Bt}\` component provides a UI frame for XMLUI apps. According to predefined (and run-time configurable) structure templates, \`${Bt}\` allows you to display your preferred layout.`,
  props: {
    layout: {
      description: "This property sets the layout template of the app. This setting determines the position and size of the app parts (such as header, navigation bar, footer, etc.) and the app's scroll behavior.",
      availableValues: fc
    },
    loggedInUser: {
      description: "Stores information about the currently logged in user.",
      valueType: "string"
    },
    logoTemplate: Re("Optional template of the app logo"),
    logo: {
      description: "Optional logo path",
      valueType: "string"
    },
    "logo-dark": {
      description: "Optional logo path in dark tone",
      valueType: "string"
    },
    "logo-light": {
      description: "Optional logo path in light tone",
      valueType: "string"
    },
    name: {
      description: "Optional application name (visible in the browser tab)",
      valueType: "string"
    },
    scrollWholePage: {
      description: "This boolean property specifies whether the whole page should scroll (`true`) or just the content area (`false`). The default value is `true`.",
      valueType: "boolean",
      defaultValue: !0
    },
    noScrollbarGutters: {
      description: "This boolean property specifies whether the scrollbar gutters should be hidden.",
      valueType: "boolean",
      defaultValue: !1
    },
    defaultTone: {
      description: `This property sets the app's default tone ("light" or "dark").`,
      valueType: "string",
      defaultValue: "light",
      availableValues: ["light", "dark"]
    },
    defaultTheme: {
      description: "This property sets the app's default theme.",
      valueType: "string",
      defaultValue: "xmlui"
    }
  },
  events: {
    ready: u(`This event fires when the \`${Bt}\` component finishes rendering on the page.`)
  },
  themeVars: Z(bc.themeVars),
  defaultThemeVars: {
    [`width-navPanel-${Bt}`]: "$space-64",
    [`maxWidth-content-${Bt}`]: "$maxWidth-content",
    [`boxShadow-header-${Bt}`]: "$boxShadow-spread",
    [`boxShadow-pages-${Bt}`]: "$boxShadow-spread",
    "scroll-padding-block-Pages": "$space-4",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
});
function za(e, r) {
  return {
    [`paddingLeft-${e}`]: (r == null ? void 0 : r.left) ?? `$paddingHorizontal-${e}`,
    [`paddingRight-${e}`]: (r == null ? void 0 : r.right) ?? `$paddingHorizontal-${e}`,
    [`paddingTop-${e}`]: (r == null ? void 0 : r.top) ?? `$paddingVertical-${e}`,
    [`paddingBottom-${e}`]: (r == null ? void 0 : r.bottom) ?? `$paddingVertical-${e}`,
    [`paddingHorizontal-${e}`]: (r == null ? void 0 : r.horizontal) ?? "",
    [`paddingVertical-${e}`]: (r == null ? void 0 : r.vertical) ?? "",
    [`padding-${e}`]: (r == null ? void 0 : r.all) ?? `$paddingTop-${e} $paddingRight-${e} $paddingBottom-${e} $paddingLeft-${e}`
  };
}
const Nr = "AppHeader", $c = C({
  status: "experimental",
  description: `\`${Nr}\` is a placeholder within \`App\` to define a custom application header.`,
  props: {
    profileMenuTemplate: Re(
      `This property makes the profile menu slot of the \`${Nr}\` component customizable.`
    ),
    logoTemplate: Re(
      "This property defines the template to use for the logo. With this property, you can construct your custom logo instead of using a single image."
    ),
    titleTemplate: Re(
      "This property defines the template to use for the title. With this property, you can construct your custom title instead of using a single image."
    ),
    title: {
      description: "Title for the application logo",
      valueType: "string"
    },
    showLogo: {
      description: "Show the logo in the header",
      valueType: "boolean",
      defaultValue: !0
    }
  },
  themeVars: Z(Tc.themeVars),
  themeVarDescriptions: {
    [`width-logo-${Nr}`]: "Sets the width of the displayed logo"
  },
  defaultThemeVars: {
    [`height-${Nr}`]: "$space-14",
    [`maxWidth-content-${Nr}`]: "$maxWidth-content-App",
    [`borderBottom-${Nr}`]: "1px solid $borderColor",
    ...za(`logo-${Nr}`, { horizontal: "$space-0", vertical: "$space-4" }),
    ...za(Nr, { horizontal: "$space-4", vertical: "$space-0" }),
    [`borderRadius-${Nr}`]: "0px",
    light: {
      [`backgroundColor-${Nr}`]: "white"
    },
    dark: {
      [`backgroundColor-${Nr}`]: "$color-surface-900"
    }
  }
}), go = "AppState", Lc = C({
  description: `${go} is a functional component (without a visible user interface) that helps store and manage the app's state.`,
  props: {
    bucket: {
      description: `This property is the identifier of the bucket to which the \`${go}\` instance is bound. Multiple \`${go}\` instances with the same bucket will share the same state object: any of them updating the state will cause the other instances to view the new, updated state.`,
      valueType: "string",
      defaultValue: "default"
    },
    initialValue: {
      description: `This property contains the initial state value. Though you can use multiple \`${go}\`component instances for the same bucket with their \`initialValue\` set, it may result in faulty app logic. When xmlui instantiates an \`${go}\` with an explicit initial value, that value is immediately set. Multiple initial values may result in undesired initialization.`
    }
  },
  apis: {
    update: u(
      "This method updates the application state object bound to the `AppState` instance. The function's single argument is an object that specifies the new state value."
    )
  },
  nonVisual: !0
}), _c = `'{"border-Avatar": "var(--xmlui-border-Avatar)", "borderHorizontal-Avatar": "var(--xmlui-borderHorizontal-Avatar, var(--xmlui-border-Avatar))", "borderVertical-Avatar": "var(--xmlui-borderVertical-Avatar, var(--xmlui-border-Avatar))", "borderLeft-Avatar": "var(--xmlui-borderLeft-Avatar, var(--xmlui-borderHorizontal-Avatar, var(--xmlui-border-Avatar)))", "borderRight-Avatar": "var(--xmlui-borderRight-Avatar, var(--xmlui-borderHorizontal-Avatar, var(--xmlui-border-Avatar)))", "borderTop-Avatar": "var(--xmlui-borderTop-Avatar, var(--xmlui-borderVertical-Avatar, var(--xmlui-border-Avatar)))", "borderBottom-Avatar": "var(--xmlui-borderBottom-Avatar, var(--xmlui-borderVertical-Avatar, var(--xmlui-border-Avatar)))", "borderWidth-Avatar": "var(--xmlui-borderWidth-Avatar)", "borderHorizontalWidth-Avatar": "var(--xmlui-borderHorizontalWidth-Avatar, var(--xmlui-borderWidth-Avatar))", "borderLeftWidth-Avatar": "var(--xmlui-borderLeftWidth-Avatar, var(--xmlui-borderHorizontalWidth-Avatar, var(--xmlui-borderWidth-Avatar)))", "borderRightWidth-Avatar": "var(--xmlui-borderRightWidth-Avatar, var(--xmlui-borderHorizontalWidth-Avatar, var(--xmlui-borderWidth-Avatar)))", "borderVerticalWidth-Avatar": "var(--xmlui-borderVerticalWidth-Avatar, var(--xmlui-borderWidth-Avatar))", "borderTopWidth-Avatar": "var(--xmlui-borderTopWidth-Avatar, var(--xmlui-borderVerticalWidth-Avatar, var(--xmlui-borderWidth-Avatar)))", "borderBottomWidth-Avatar": "var(--xmlui-borderBottomWidth-Avatar, var(--xmlui-borderVerticalWidth-Avatar, var(--xmlui-borderWidth-Avatar)))", "borderStyle-Avatar": "var(--xmlui-borderStyle-Avatar)", "borderHorizontalStyle-Avatar": "var(--xmlui-borderHorizontalStyle-Avatar, var(--xmlui-borderStyle-Avatar))", "borderLeftStyle-Avatar": "var(--xmlui-borderLeftStyle-Avatar, var(--xmlui-borderHorizontalStyle-Avatar, var(--xmlui-borderStyle-Avatar)))", "borderRightStyle-Avatar": "var(--xmlui-borderRightStyle-Avatar, var(--xmlui-borderHorizontalStyle-Avatar, var(--xmlui-borderStyle-Avatar)))", "borderVerticalStyle-Avatar": "var(--xmlui-borderVerticalStyle-Avatar, var(--xmlui-borderStyle-Avatar))", "borderTopStyle-Avatar": "var(--xmlui-borderTopStyle-Avatar, var(--xmlui-borderVerticalStyle-Avatar, var(--xmlui-borderStyle-Avatar)))", "borderBottomStyle-Avatar": "var(--xmlui-borderBottomStyle-Avatar, var(--xmlui-borderVerticalStyle-Avatar, var(--xmlui-borderStyle-Avatar)))", "borderColor-Avatar": "var(--xmlui-borderColor-Avatar)", "borderHorizontalColor-Avatar": "var(--xmlui-borderHorizontalColor-Avatar, var(--xmlui-borderColor-Avatar))", "borderLeftColor-Avatar": "var(--xmlui-borderLeftColor-Avatar, var(--xmlui-borderHorizontalColor-Avatar, var(--xmlui-borderColor-Avatar)))", "borderRightColor-Avatar": "var(--xmlui-borderRightColor-Avatar, var(--xmlui-borderHorizontalColor-Avatar, var(--xmlui-borderColor-Avatar)))", "borderVerticalColor-Avatar": "var(--xmlui-borderVerticalColor-Avatar, var(--xmlui-borderColor-Avatar))", "borderTopColor-Avatar": "var(--xmlui-borderTopColor-Avatar, var(--xmlui-borderVerticalColor-Avatar, var(--xmlui-borderColor-Avatar)))", "borderBottomColor-Avatar": "var(--xmlui-borderBottomColor-Avatar, var(--xmlui-borderVerticalColor-Avatar, var(--xmlui-borderColor-Avatar)))", "radius-start-start-Avatar": "var(--xmlui-radius-start-start-Avatar, var(--xmlui-borderRadius-Avatar))", "radius-start-end-Avatar": "var(--xmlui-radius-start-end-Avatar, var(--xmlui-borderRadius-Avatar))", "radius-end-start-Avatar": "var(--xmlui-radius-end-start-Avatar, var(--xmlui-borderRadius-Avatar))", "radius-end-end-Avatar": "var(--xmlui-radius-end-end-Avatar, var(--xmlui-borderRadius-Avatar))", "backgroundColor-Avatar": "var(--xmlui-backgroundColor-Avatar)", "boxShadow-Avatar": "var(--xmlui-boxShadow-Avatar)", "color-Avatar": "var(--xmlui-color-Avatar)", "fontWeight-Avatar": "var(--xmlui-fontWeight-Avatar)"}'`, Ac = "_container_b5op5_13", Nc = "_xs_b5op5_50", Wc = "_sm_b5op5_57", Oc = "_md_b5op5_64", Rc = "_lg_b5op5_71", zc = "_clickable_b5op5_78", _t = {
  themeVars: _c,
  container: Ac,
  xs: Nc,
  sm: Wc,
  md: Oc,
  lg: Rc,
  clickable: zc
}, al = {
  size: "sm"
}, Vc = xe(function({ size: r = al.size, url: t, name: o, style: a, onClick: n, ...i }, l) {
  let s = null;
  return !t && o && (s = o.trim().split(" ").filter((f) => !!f.trim().length).map((f) => f[0].toUpperCase()).slice(0, 3)), /* @__PURE__ */ p(
    "div",
    {
      ...i,
      ref: l,
      className: le(_t.container, {
        [_t.xs]: r === "xs",
        [_t.sm]: r === "sm",
        [_t.md]: r === "md",
        [_t.lg]: r === "lg",
        [_t.clickable]: !!n
      }),
      style: { backgroundImage: t ? `url(${t})` : "none", ...a },
      onClick: n,
      children: s
    }
  );
}), mr = "Avatar", Ec = C({
  description: `The \`${mr}\` component represents a user, group (or other entity's) avatar with a small image or initials.`,
  props: {
    size: {
      description: `This property defines the display size of the ${mr}.`,
      availableValues: Qa,
      valueType: "string",
      defaultValue: al.size
    },
    name: {
      description: `This property sets the name value the ${mr} uses to display initials.`,
      valueType: "string"
    },
    url: {
      description: `This property specifies the URL of the image to display in the ${mr}.`,
      valueType: "string"
    }
  },
  events: {
    click: u("This event is triggered when the avatar is clicked.")
  },
  themeVars: Z(_t.themeVars),
  defaultThemeVars: {
    [`borderRadius-${mr}`]: "4px",
    [`boxShadow-${mr}`]: "inset 0 0 0 1px rgba(4,32,69,0.1)",
    [`color-${mr}`]: "$textColor-secondary",
    [`fontWeight-${mr}`]: "$fontWeight-bold",
    light: {
      [`border-${mr}`]: "0px solid $color-surface-400A80",
      [`backgroundColor-${mr}`]: "$color-surface-100"
    },
    dark: {
      [`border-${mr}`]: "0px solid $color-surface-700",
      [`backgroundColor-${mr}`]: "$color-surface-800",
      [`borderColor-${mr}`]: "$color-surface-700"
    }
  }
}), Dc = `'{"border-Badge": "var(--xmlui-border-Badge)", "borderHorizontal-Badge": "var(--xmlui-borderHorizontal-Badge, var(--xmlui-border-Badge))", "borderVertical-Badge": "var(--xmlui-borderVertical-Badge, var(--xmlui-border-Badge))", "borderLeft-Badge": "var(--xmlui-borderLeft-Badge, var(--xmlui-borderHorizontal-Badge, var(--xmlui-border-Badge)))", "borderRight-Badge": "var(--xmlui-borderRight-Badge, var(--xmlui-borderHorizontal-Badge, var(--xmlui-border-Badge)))", "borderTop-Badge": "var(--xmlui-borderTop-Badge, var(--xmlui-borderVertical-Badge, var(--xmlui-border-Badge)))", "borderBottom-Badge": "var(--xmlui-borderBottom-Badge, var(--xmlui-borderVertical-Badge, var(--xmlui-border-Badge)))", "borderWidth-Badge": "var(--xmlui-borderWidth-Badge)", "borderHorizontalWidth-Badge": "var(--xmlui-borderHorizontalWidth-Badge, var(--xmlui-borderWidth-Badge))", "borderLeftWidth-Badge": "var(--xmlui-borderLeftWidth-Badge, var(--xmlui-borderHorizontalWidth-Badge, var(--xmlui-borderWidth-Badge)))", "borderRightWidth-Badge": "var(--xmlui-borderRightWidth-Badge, var(--xmlui-borderHorizontalWidth-Badge, var(--xmlui-borderWidth-Badge)))", "borderVerticalWidth-Badge": "var(--xmlui-borderVerticalWidth-Badge, var(--xmlui-borderWidth-Badge))", "borderTopWidth-Badge": "var(--xmlui-borderTopWidth-Badge, var(--xmlui-borderVerticalWidth-Badge, var(--xmlui-borderWidth-Badge)))", "borderBottomWidth-Badge": "var(--xmlui-borderBottomWidth-Badge, var(--xmlui-borderVerticalWidth-Badge, var(--xmlui-borderWidth-Badge)))", "borderStyle-Badge": "var(--xmlui-borderStyle-Badge)", "borderHorizontalStyle-Badge": "var(--xmlui-borderHorizontalStyle-Badge, var(--xmlui-borderStyle-Badge))", "borderLeftStyle-Badge": "var(--xmlui-borderLeftStyle-Badge, var(--xmlui-borderHorizontalStyle-Badge, var(--xmlui-borderStyle-Badge)))", "borderRightStyle-Badge": "var(--xmlui-borderRightStyle-Badge, var(--xmlui-borderHorizontalStyle-Badge, var(--xmlui-borderStyle-Badge)))", "borderVerticalStyle-Badge": "var(--xmlui-borderVerticalStyle-Badge, var(--xmlui-borderStyle-Badge))", "borderTopStyle-Badge": "var(--xmlui-borderTopStyle-Badge, var(--xmlui-borderVerticalStyle-Badge, var(--xmlui-borderStyle-Badge)))", "borderBottomStyle-Badge": "var(--xmlui-borderBottomStyle-Badge, var(--xmlui-borderVerticalStyle-Badge, var(--xmlui-borderStyle-Badge)))", "borderColor-Badge": "var(--xmlui-borderColor-Badge)", "borderHorizontalColor-Badge": "var(--xmlui-borderHorizontalColor-Badge, var(--xmlui-borderColor-Badge))", "borderLeftColor-Badge": "var(--xmlui-borderLeftColor-Badge, var(--xmlui-borderHorizontalColor-Badge, var(--xmlui-borderColor-Badge)))", "borderRightColor-Badge": "var(--xmlui-borderRightColor-Badge, var(--xmlui-borderHorizontalColor-Badge, var(--xmlui-borderColor-Badge)))", "borderVerticalColor-Badge": "var(--xmlui-borderVerticalColor-Badge, var(--xmlui-borderColor-Badge))", "borderTopColor-Badge": "var(--xmlui-borderTopColor-Badge, var(--xmlui-borderVerticalColor-Badge, var(--xmlui-borderColor-Badge)))", "borderBottomColor-Badge": "var(--xmlui-borderBottomColor-Badge, var(--xmlui-borderVerticalColor-Badge, var(--xmlui-borderColor-Badge)))", "radius-start-start-Badge": "var(--xmlui-radius-start-start-Badge, var(--xmlui-borderRadius-Badge))", "radius-start-end-Badge": "var(--xmlui-radius-start-end-Badge, var(--xmlui-borderRadius-Badge))", "radius-end-start-Badge": "var(--xmlui-radius-end-start-Badge, var(--xmlui-borderRadius-Badge))", "radius-end-end-Badge": "var(--xmlui-radius-end-end-Badge, var(--xmlui-borderRadius-Badge))", "padding-Badge": "var(--xmlui-padding-Badge)", "paddingHorizontal-Badge": "var(--xmlui-paddingHorizontal-Badge, var(--xmlui-padding-Badge))", "paddingVertical-Badge": "var(--xmlui-paddingVertical-Badge, var(--xmlui-padding-Badge))", "paddingLeft-Badge": "var(--xmlui-paddingLeft-Badge, var(--xmlui-paddingHorizontal-Badge, var(--xmlui-padding-Badge)))", "paddingRight-Badge": "var(--xmlui-paddingRight-Badge, var(--xmlui-paddingHorizontal-Badge, var(--xmlui-padding-Badge)))", "paddingTop-Badge": "var(--xmlui-paddingTop-Badge, var(--xmlui-paddingVertical-Badge, var(--xmlui-padding-Badge)))", "paddingBottom-Badge": "var(--xmlui-paddingBottom-Badge, var(--xmlui-paddingVertical-Badge, var(--xmlui-padding-Badge)))", "border-Badge-pill": "var(--xmlui-border-Badge-pill)", "borderHorizontal-Badge-pill": "var(--xmlui-borderHorizontal-Badge-pill, var(--xmlui-border-Badge-pill))", "borderVertical-Badge-pill": "var(--xmlui-borderVertical-Badge-pill, var(--xmlui-border-Badge-pill))", "borderLeft-Badge-pill": "var(--xmlui-borderLeft-Badge-pill, var(--xmlui-borderHorizontal-Badge-pill, var(--xmlui-border-Badge-pill)))", "borderRight-Badge-pill": "var(--xmlui-borderRight-Badge-pill, var(--xmlui-borderHorizontal-Badge-pill, var(--xmlui-border-Badge-pill)))", "borderTop-Badge-pill": "var(--xmlui-borderTop-Badge-pill, var(--xmlui-borderVertical-Badge-pill, var(--xmlui-border-Badge-pill)))", "borderBottom-Badge-pill": "var(--xmlui-borderBottom-Badge-pill, var(--xmlui-borderVertical-Badge-pill, var(--xmlui-border-Badge-pill)))", "borderWidth-Badge-pill": "var(--xmlui-borderWidth-Badge-pill)", "borderHorizontalWidth-Badge-pill": "var(--xmlui-borderHorizontalWidth-Badge-pill, var(--xmlui-borderWidth-Badge-pill))", "borderLeftWidth-Badge-pill": "var(--xmlui-borderLeftWidth-Badge-pill, var(--xmlui-borderHorizontalWidth-Badge-pill, var(--xmlui-borderWidth-Badge-pill)))", "borderRightWidth-Badge-pill": "var(--xmlui-borderRightWidth-Badge-pill, var(--xmlui-borderHorizontalWidth-Badge-pill, var(--xmlui-borderWidth-Badge-pill)))", "borderVerticalWidth-Badge-pill": "var(--xmlui-borderVerticalWidth-Badge-pill, var(--xmlui-borderWidth-Badge-pill))", "borderTopWidth-Badge-pill": "var(--xmlui-borderTopWidth-Badge-pill, var(--xmlui-borderVerticalWidth-Badge-pill, var(--xmlui-borderWidth-Badge-pill)))", "borderBottomWidth-Badge-pill": "var(--xmlui-borderBottomWidth-Badge-pill, var(--xmlui-borderVerticalWidth-Badge-pill, var(--xmlui-borderWidth-Badge-pill)))", "borderStyle-Badge-pill": "var(--xmlui-borderStyle-Badge-pill)", "borderHorizontalStyle-Badge-pill": "var(--xmlui-borderHorizontalStyle-Badge-pill, var(--xmlui-borderStyle-Badge-pill))", "borderLeftStyle-Badge-pill": "var(--xmlui-borderLeftStyle-Badge-pill, var(--xmlui-borderHorizontalStyle-Badge-pill, var(--xmlui-borderStyle-Badge-pill)))", "borderRightStyle-Badge-pill": "var(--xmlui-borderRightStyle-Badge-pill, var(--xmlui-borderHorizontalStyle-Badge-pill, var(--xmlui-borderStyle-Badge-pill)))", "borderVerticalStyle-Badge-pill": "var(--xmlui-borderVerticalStyle-Badge-pill, var(--xmlui-borderStyle-Badge-pill))", "borderTopStyle-Badge-pill": "var(--xmlui-borderTopStyle-Badge-pill, var(--xmlui-borderVerticalStyle-Badge-pill, var(--xmlui-borderStyle-Badge-pill)))", "borderBottomStyle-Badge-pill": "var(--xmlui-borderBottomStyle-Badge-pill, var(--xmlui-borderVerticalStyle-Badge-pill, var(--xmlui-borderStyle-Badge-pill)))", "borderColor-Badge-pill": "var(--xmlui-borderColor-Badge-pill)", "borderHorizontalColor-Badge-pill": "var(--xmlui-borderHorizontalColor-Badge-pill, var(--xmlui-borderColor-Badge-pill))", "borderLeftColor-Badge-pill": "var(--xmlui-borderLeftColor-Badge-pill, var(--xmlui-borderHorizontalColor-Badge-pill, var(--xmlui-borderColor-Badge-pill)))", "borderRightColor-Badge-pill": "var(--xmlui-borderRightColor-Badge-pill, var(--xmlui-borderHorizontalColor-Badge-pill, var(--xmlui-borderColor-Badge-pill)))", "borderVerticalColor-Badge-pill": "var(--xmlui-borderVerticalColor-Badge-pill, var(--xmlui-borderColor-Badge-pill))", "borderTopColor-Badge-pill": "var(--xmlui-borderTopColor-Badge-pill, var(--xmlui-borderVerticalColor-Badge-pill, var(--xmlui-borderColor-Badge-pill)))", "borderBottomColor-Badge-pill": "var(--xmlui-borderBottomColor-Badge-pill, var(--xmlui-borderVerticalColor-Badge-pill, var(--xmlui-borderColor-Badge-pill)))", "radius-start-start-Badge-pill": "var(--xmlui-radius-start-start-Badge-pill, var(--xmlui-borderRadius-Badge-pill))", "radius-start-end-Badge-pill": "var(--xmlui-radius-start-end-Badge-pill, var(--xmlui-borderRadius-Badge-pill))", "radius-end-start-Badge-pill": "var(--xmlui-radius-end-start-Badge-pill, var(--xmlui-borderRadius-Badge-pill))", "radius-end-end-Badge-pill": "var(--xmlui-radius-end-end-Badge-pill, var(--xmlui-borderRadius-Badge-pill))", "padding-Badge-pill": "var(--xmlui-padding-Badge-pill)", "paddingHorizontal-Badge-pill": "var(--xmlui-paddingHorizontal-Badge-pill, var(--xmlui-padding-Badge-pill))", "paddingVertical-Badge-pill": "var(--xmlui-paddingVertical-Badge-pill, var(--xmlui-padding-Badge-pill))", "paddingLeft-Badge-pill": "var(--xmlui-paddingLeft-Badge-pill, var(--xmlui-paddingHorizontal-Badge-pill, var(--xmlui-padding-Badge-pill)))", "paddingRight-Badge-pill": "var(--xmlui-paddingRight-Badge-pill, var(--xmlui-paddingHorizontal-Badge-pill, var(--xmlui-padding-Badge-pill)))", "paddingTop-Badge-pill": "var(--xmlui-paddingTop-Badge-pill, var(--xmlui-paddingVertical-Badge-pill, var(--xmlui-padding-Badge-pill)))", "paddingBottom-Badge-pill": "var(--xmlui-paddingBottom-Badge-pill, var(--xmlui-paddingVertical-Badge-pill, var(--xmlui-padding-Badge-pill)))", "backgroundColor-Badge": "var(--xmlui-backgroundColor-Badge)", "color-Badge": "var(--xmlui-color-Badge)", "fontSize-Badge": "var(--xmlui-fontSize-Badge)", "fontSize-Badge-pill": "var(--xmlui-fontSize-Badge-pill)", "fontWeight-Badge": "var(--xmlui-fontWeight-Badge)", "fontWeight-Badge-pill": "var(--xmlui-fontWeight-Badge-pill)"}'`, Pc = "_badge_14vq4_13", Mc = "_pill_14vq4_52", Va = {
  themeVars: Dc,
  badge: Pc,
  pill: Mc
}, Fc = ["badge", "pill"], qc = {
  variant: "badge"
};
xe(function({ children: r, color: t, variant: o = qc.variant, style: a }, n) {
  return /* @__PURE__ */ p(
    "div",
    {
      ref: n,
      className: le({
        [Va.badge]: o === "badge",
        [Va.pill]: o === "pill"
      }),
      style: {
        ...t ? typeof t == "string" ? { backgroundColor: t } : { backgroundColor: t.background, color: t.label } : {},
        ...a
      },
      children: r
    }
  );
});
const Sr = "Badge", Uc = C({
  status: "stable",
  description: `The \`${Sr}\` is a text label that accepts a color map to define its background color and, optionally, its label color.`,
  props: {
    value: {
      description: "The text that the component displays",
      type: "string",
      isRequired: !0
    },
    variant: {
      description: "Modifies the shape of the component. Comes in the regular `badge` variant or the `pill` variant with fully rounded corners.",
      type: "string",
      availableValues: Fc,
      defaultValue: "badge"
    },
    colorMap: {
      description: `The \`${Sr}\` component supports the mapping of a list of colors using the \`value\` prop as the key. Provide the component with a list or key-value pairs in two ways:`
    },
    themeColor: Pe("(**NOT IMPLEMENTED YET**) The theme color of the component."),
    indicatorText: Pe(
      "(**NOT IMPLEMENTED YET**) This property defines the text to display in the indicator. If it is not defined or empty, no indicator is displayed unless the `forceIndicator` property is set."
    ),
    forceIndicator: Pe(
      "(**NOT IMPLEMENTED YET**) This property forces the display of the indicator, even if the `indicatorText` property is not defined or empty."
    ),
    indicatorThemeColor: Pe("(**NOT IMPLEMENTED YET**) The theme color of the indicator."),
    indicatorPosition: Pe("(**NOT IMPLEMENTED YET**) The position of the indicator.")
  },
  events: {},
  themeVars: Z(Va.themeVars),
  defaultThemeVars: {
    [`padding-${Sr}`]: "$space-0_5 $space-2",
    [`border-${Sr}`]: "0px solid $borderColor",
    [`padding-${Sr}-pill`]: "$space-0_5 $space-2",
    [`borderRadius-${Sr}`]: "4px",
    [`fontSize-${Sr}`]: "0.8em",
    [`fontSize-${Sr}-pill`]: "0.8em",
    light: {
      [`backgroundColor-${Sr}`]: "rgba($color-secondary-500-rgb, .6)",
      [`color-${Sr}`]: "white"
    },
    dark: {
      [`backgroundColor-${Sr}`]: "rgba($color-secondary-500-rgb, .6)",
      [`color-${Sr}`]: "$color-surface-50"
    }
  }
}), Gc = Zr(null), Yc = C({
  description: "As its name suggests, this component places a bookmark into its parent component's view. The component has an `id` that you can use in links to navigate (scroll to) the bookmark's location.",
  opaque: !0,
  props: {
    uid: {
      description: "The unique identifier of the bookmark. You can use this identifier in links to navigate to this component's location.",
      valueType: "string"
    },
    level: {
      description: "The level of the bookmark. The level is used to determine the bookmark's position in the table of contents.",
      valueType: "number",
      defaultValue: 1
    },
    title: {
      description: "Defines the text to display the bookmark in the table of contents. If this property is empty, the text falls back to the value of `id`.",
      valueType: "string"
    },
    omitFromToc: {
      description: "If true, this bookmark will be excluded from the table of contents.",
      valueType: "boolean",
      defaultValue: !1
    }
  }
}), Xc = `'{"padding-Card": "var(--xmlui-padding-Card)", "paddingHorizontal-Card": "var(--xmlui-paddingHorizontal-Card, var(--xmlui-padding-Card))", "paddingVertical-Card": "var(--xmlui-paddingVertical-Card, var(--xmlui-padding-Card))", "paddingLeft-Card": "var(--xmlui-paddingLeft-Card, var(--xmlui-paddingHorizontal-Card, var(--xmlui-padding-Card)))", "paddingRight-Card": "var(--xmlui-paddingRight-Card, var(--xmlui-paddingHorizontal-Card, var(--xmlui-padding-Card)))", "paddingTop-Card": "var(--xmlui-paddingTop-Card, var(--xmlui-paddingVertical-Card, var(--xmlui-padding-Card)))", "paddingBottom-Card": "var(--xmlui-paddingBottom-Card, var(--xmlui-paddingVertical-Card, var(--xmlui-padding-Card)))", "border-Card": "var(--xmlui-border-Card)", "borderHorizontal-Card": "var(--xmlui-borderHorizontal-Card, var(--xmlui-border-Card))", "borderVertical-Card": "var(--xmlui-borderVertical-Card, var(--xmlui-border-Card))", "borderLeft-Card": "var(--xmlui-borderLeft-Card, var(--xmlui-borderHorizontal-Card, var(--xmlui-border-Card)))", "borderRight-Card": "var(--xmlui-borderRight-Card, var(--xmlui-borderHorizontal-Card, var(--xmlui-border-Card)))", "borderTop-Card": "var(--xmlui-borderTop-Card, var(--xmlui-borderVertical-Card, var(--xmlui-border-Card)))", "borderBottom-Card": "var(--xmlui-borderBottom-Card, var(--xmlui-borderVertical-Card, var(--xmlui-border-Card)))", "borderWidth-Card": "var(--xmlui-borderWidth-Card)", "borderHorizontalWidth-Card": "var(--xmlui-borderHorizontalWidth-Card, var(--xmlui-borderWidth-Card))", "borderLeftWidth-Card": "var(--xmlui-borderLeftWidth-Card, var(--xmlui-borderHorizontalWidth-Card, var(--xmlui-borderWidth-Card)))", "borderRightWidth-Card": "var(--xmlui-borderRightWidth-Card, var(--xmlui-borderHorizontalWidth-Card, var(--xmlui-borderWidth-Card)))", "borderVerticalWidth-Card": "var(--xmlui-borderVerticalWidth-Card, var(--xmlui-borderWidth-Card))", "borderTopWidth-Card": "var(--xmlui-borderTopWidth-Card, var(--xmlui-borderVerticalWidth-Card, var(--xmlui-borderWidth-Card)))", "borderBottomWidth-Card": "var(--xmlui-borderBottomWidth-Card, var(--xmlui-borderVerticalWidth-Card, var(--xmlui-borderWidth-Card)))", "borderStyle-Card": "var(--xmlui-borderStyle-Card)", "borderHorizontalStyle-Card": "var(--xmlui-borderHorizontalStyle-Card, var(--xmlui-borderStyle-Card))", "borderLeftStyle-Card": "var(--xmlui-borderLeftStyle-Card, var(--xmlui-borderHorizontalStyle-Card, var(--xmlui-borderStyle-Card)))", "borderRightStyle-Card": "var(--xmlui-borderRightStyle-Card, var(--xmlui-borderHorizontalStyle-Card, var(--xmlui-borderStyle-Card)))", "borderVerticalStyle-Card": "var(--xmlui-borderVerticalStyle-Card, var(--xmlui-borderStyle-Card))", "borderTopStyle-Card": "var(--xmlui-borderTopStyle-Card, var(--xmlui-borderVerticalStyle-Card, var(--xmlui-borderStyle-Card)))", "borderBottomStyle-Card": "var(--xmlui-borderBottomStyle-Card, var(--xmlui-borderVerticalStyle-Card, var(--xmlui-borderStyle-Card)))", "borderColor-Card": "var(--xmlui-borderColor-Card)", "borderHorizontalColor-Card": "var(--xmlui-borderHorizontalColor-Card, var(--xmlui-borderColor-Card))", "borderLeftColor-Card": "var(--xmlui-borderLeftColor-Card, var(--xmlui-borderHorizontalColor-Card, var(--xmlui-borderColor-Card)))", "borderRightColor-Card": "var(--xmlui-borderRightColor-Card, var(--xmlui-borderHorizontalColor-Card, var(--xmlui-borderColor-Card)))", "borderVerticalColor-Card": "var(--xmlui-borderVerticalColor-Card, var(--xmlui-borderColor-Card))", "borderTopColor-Card": "var(--xmlui-borderTopColor-Card, var(--xmlui-borderVerticalColor-Card, var(--xmlui-borderColor-Card)))", "borderBottomColor-Card": "var(--xmlui-borderBottomColor-Card, var(--xmlui-borderVerticalColor-Card, var(--xmlui-borderColor-Card)))", "radius-start-start-Card": "var(--xmlui-radius-start-start-Card, var(--xmlui-borderRadius-Card))", "radius-start-end-Card": "var(--xmlui-radius-start-end-Card, var(--xmlui-borderRadius-Card))", "radius-end-start-Card": "var(--xmlui-radius-end-start-Card, var(--xmlui-borderRadius-Card))", "radius-end-end-Card": "var(--xmlui-radius-end-end-Card, var(--xmlui-borderRadius-Card))", "boxShadow-Card": "var(--xmlui-boxShadow-Card)", "backgroundColor-Card": "var(--xmlui-backgroundColor-Card)", "borderRadius-Card": "var(--xmlui-borderRadius-Card)"}'`, Qc = "_wrapper_1hude_13", Zc = "_horizontal_1hude_46", jc = "_vertical_1hude_51", Jc = "_isClickable_1hude_54", ko = {
  themeVars: Xc,
  wrapper: Qc,
  horizontal: Zc,
  vertical: jc,
  isClickable: Jc
}, Kc = `'{"padding-Link": "var(--xmlui-padding-Link)", "paddingHorizontal-Link": "var(--xmlui-paddingHorizontal-Link, var(--xmlui-padding-Link))", "paddingVertical-Link": "var(--xmlui-paddingVertical-Link, var(--xmlui-padding-Link))", "paddingLeft-Link": "var(--xmlui-paddingLeft-Link, var(--xmlui-paddingHorizontal-Link, var(--xmlui-padding-Link)))", "paddingRight-Link": "var(--xmlui-paddingRight-Link, var(--xmlui-paddingHorizontal-Link, var(--xmlui-padding-Link)))", "paddingTop-Link": "var(--xmlui-paddingTop-Link, var(--xmlui-paddingVertical-Link, var(--xmlui-padding-Link)))", "paddingBottom-Link": "var(--xmlui-paddingBottom-Link, var(--xmlui-paddingVertical-Link, var(--xmlui-padding-Link)))", "padding-icon-Link": "var(--xmlui-padding-icon-Link)", "paddingHorizontal-icon-Link": "var(--xmlui-paddingHorizontal-icon-Link, var(--xmlui-padding-icon-Link))", "paddingVertical-icon-Link": "var(--xmlui-paddingVertical-icon-Link, var(--xmlui-padding-icon-Link))", "paddingLeft-icon-Link": "var(--xmlui-paddingLeft-icon-Link, var(--xmlui-paddingHorizontal-icon-Link, var(--xmlui-padding-icon-Link)))", "paddingRight-icon-Link": "var(--xmlui-paddingRight-icon-Link, var(--xmlui-paddingHorizontal-icon-Link, var(--xmlui-padding-icon-Link)))", "paddingTop-icon-Link": "var(--xmlui-paddingTop-icon-Link, var(--xmlui-paddingVertical-icon-Link, var(--xmlui-padding-icon-Link)))", "paddingBottom-icon-Link": "var(--xmlui-paddingBottom-icon-Link, var(--xmlui-paddingVertical-icon-Link, var(--xmlui-padding-icon-Link)))", "border-Link": "var(--xmlui-border-Link)", "borderHorizontal-Link": "var(--xmlui-borderHorizontal-Link, var(--xmlui-border-Link))", "borderVertical-Link": "var(--xmlui-borderVertical-Link, var(--xmlui-border-Link))", "borderLeft-Link": "var(--xmlui-borderLeft-Link, var(--xmlui-borderHorizontal-Link, var(--xmlui-border-Link)))", "borderRight-Link": "var(--xmlui-borderRight-Link, var(--xmlui-borderHorizontal-Link, var(--xmlui-border-Link)))", "borderTop-Link": "var(--xmlui-borderTop-Link, var(--xmlui-borderVertical-Link, var(--xmlui-border-Link)))", "borderBottom-Link": "var(--xmlui-borderBottom-Link, var(--xmlui-borderVertical-Link, var(--xmlui-border-Link)))", "borderWidth-Link": "var(--xmlui-borderWidth-Link)", "borderHorizontalWidth-Link": "var(--xmlui-borderHorizontalWidth-Link, var(--xmlui-borderWidth-Link))", "borderLeftWidth-Link": "var(--xmlui-borderLeftWidth-Link, var(--xmlui-borderHorizontalWidth-Link, var(--xmlui-borderWidth-Link)))", "borderRightWidth-Link": "var(--xmlui-borderRightWidth-Link, var(--xmlui-borderHorizontalWidth-Link, var(--xmlui-borderWidth-Link)))", "borderVerticalWidth-Link": "var(--xmlui-borderVerticalWidth-Link, var(--xmlui-borderWidth-Link))", "borderTopWidth-Link": "var(--xmlui-borderTopWidth-Link, var(--xmlui-borderVerticalWidth-Link, var(--xmlui-borderWidth-Link)))", "borderBottomWidth-Link": "var(--xmlui-borderBottomWidth-Link, var(--xmlui-borderVerticalWidth-Link, var(--xmlui-borderWidth-Link)))", "borderStyle-Link": "var(--xmlui-borderStyle-Link)", "borderHorizontalStyle-Link": "var(--xmlui-borderHorizontalStyle-Link, var(--xmlui-borderStyle-Link))", "borderLeftStyle-Link": "var(--xmlui-borderLeftStyle-Link, var(--xmlui-borderHorizontalStyle-Link, var(--xmlui-borderStyle-Link)))", "borderRightStyle-Link": "var(--xmlui-borderRightStyle-Link, var(--xmlui-borderHorizontalStyle-Link, var(--xmlui-borderStyle-Link)))", "borderVerticalStyle-Link": "var(--xmlui-borderVerticalStyle-Link, var(--xmlui-borderStyle-Link))", "borderTopStyle-Link": "var(--xmlui-borderTopStyle-Link, var(--xmlui-borderVerticalStyle-Link, var(--xmlui-borderStyle-Link)))", "borderBottomStyle-Link": "var(--xmlui-borderBottomStyle-Link, var(--xmlui-borderVerticalStyle-Link, var(--xmlui-borderStyle-Link)))", "borderColor-Link": "var(--xmlui-borderColor-Link)", "borderHorizontalColor-Link": "var(--xmlui-borderHorizontalColor-Link, var(--xmlui-borderColor-Link))", "borderLeftColor-Link": "var(--xmlui-borderLeftColor-Link, var(--xmlui-borderHorizontalColor-Link, var(--xmlui-borderColor-Link)))", "borderRightColor-Link": "var(--xmlui-borderRightColor-Link, var(--xmlui-borderHorizontalColor-Link, var(--xmlui-borderColor-Link)))", "borderVerticalColor-Link": "var(--xmlui-borderVerticalColor-Link, var(--xmlui-borderColor-Link))", "borderTopColor-Link": "var(--xmlui-borderTopColor-Link, var(--xmlui-borderVerticalColor-Link, var(--xmlui-borderColor-Link)))", "borderBottomColor-Link": "var(--xmlui-borderBottomColor-Link, var(--xmlui-borderVerticalColor-Link, var(--xmlui-borderColor-Link)))", "radius-start-start-Link": "var(--xmlui-radius-start-start-Link, var(--xmlui-borderRadius-Link))", "radius-start-end-Link": "var(--xmlui-radius-start-end-Link, var(--xmlui-borderRadius-Link))", "radius-end-start-Link": "var(--xmlui-radius-end-start-Link, var(--xmlui-borderRadius-Link))", "radius-end-end-Link": "var(--xmlui-radius-end-end-Link, var(--xmlui-borderRadius-Link))", "color-Link": "var(--xmlui-color-Link)", "color-Link--active": "var(--xmlui-color-Link--active)", "color-Link--hover": "var(--xmlui-color-Link--hover)", "color-Link--hover--active": "var(--xmlui-color-Link--hover--active)", "fontFamily-Link": "var(--xmlui-fontFamily-Link)", "fontSize-Link": "var(--xmlui-fontSize-Link)", "fontWeight-Link": "var(--xmlui-fontWeight-Link)", "fontWeight-Link--active": "var(--xmlui-fontWeight-Link--active)", "textDecorationColor-Link": "var(--xmlui-textDecorationColor-Link)", "textUnderlineOffset-Link": "var(--xmlui-textUnderlineOffset-Link)", "textDecorationLine-Link": "var(--xmlui-textDecorationLine-Link)", "textDecorationStyle-Link": "var(--xmlui-textDecorationStyle-Link)", "textDecorationThickness-Link": "var(--xmlui-textDecorationThickness-Link)", "gap-icon-Link": "var(--xmlui-gap-icon-Link)", "outlineWidth-Link--focus": "var(--xmlui-outlineWidth-Link--focus)", "outlineColor-Link--focus": "var(--xmlui-outlineColor-Link--focus)", "outlineStyle-Link--focus": "var(--xmlui-outlineStyle-Link--focus)", "outlineOffset-Link--focus": "var(--xmlui-outlineOffset-Link--focus)"}'`, em = "_container_x7jab_13", rm = "_active_x7jab_53", tm = "_disabled_x7jab_57", om = "_iconWrapper_x7jab_73", eo = {
  themeVars: Kc,
  container: em,
  active: rm,
  disabled: tm,
  iconWrapper: om
}, am = xe(function(r, t) {
  const { to: o, children: a, icon: n, active: i, onClick: l, target: s, disabled: f, style: h, ...c } = im(r), T = !!n && !a, b = ue(() => wc(o), [o]);
  return /* @__PURE__ */ j(
    o ? ad : "div",
    {
      ref: t,
      to: b,
      style: h,
      target: s,
      onClick: l,
      className: le(eo.container, {
        [eo.iconLink]: T,
        [eo.active]: i,
        [eo.disabled]: f
      }),
      ...c,
      children: [
        n && /* @__PURE__ */ p("div", { className: eo.iconWrapper, children: /* @__PURE__ */ p(ye, { name: n }) }),
        a
      ]
    }
  );
});
function im(e) {
  const { target: r, referrerPolicy: t } = e;
  return {
    ...e,
    target: r,
    referrerPolicy: t
  };
}
const nm = `'{"Heading:color-H1": "var(--xmlui-color-H1)", "Heading:letterSpacing-H1": "var(--xmlui-letterSpacing-H1)", "Heading:fontFamily-H1": "var(--xmlui-fontFamily-H1)", "Heading:fontWeight-H1": "var(--xmlui-fontWeight-H1)", "fontSize-H1": "var(--xmlui-fontSize-H1)", "lineHeight-H1": "var(--xmlui-lineHeight-H1)", "marginTop-H1": "var(--xmlui-marginTop-H1)", "marginBottom-H1": "var(--xmlui-marginBottom-H1)", "Heading:textDecorationLine-H1": "var(--xmlui-textDecorationLine-H1)", "Heading:textDecorationColor-H1": "var(--xmlui-textDecorationColor-H1)", "Heading:textDecorationStyle-H1": "var(--xmlui-textDecorationStyle-H1)", "Heading:textDecorationThickness-H1": "var(--xmlui-textDecorationThickness-H1)", "Heading:textUnderlineOffset-H1": "var(--xmlui-textUnderlineOffset-H1)", "Heading:color-H2": "var(--xmlui-color-H2)", "Heading:letterSpacing-H2": "var(--xmlui-letterSpacing-H2)", "Heading:fontFamily-H2": "var(--xmlui-fontFamily-H2)", "Heading:fontWeight-H2": "var(--xmlui-fontWeight-H2)", "fontSize-H2": "var(--xmlui-fontSize-H2)", "lineHeight-H2": "var(--xmlui-lineHeight-H2)", "marginTop-H2": "var(--xmlui-marginTop-H2)", "marginBottom-H2": "var(--xmlui-marginBottom-H2)", "Heading:textDecorationLine-H2": "var(--xmlui-textDecorationLine-H2)", "Heading:textDecorationColor-H2": "var(--xmlui-textDecorationColor-H2)", "Heading:textDecorationStyle-H2": "var(--xmlui-textDecorationStyle-H2)", "Heading:textDecorationThickness-H2": "var(--xmlui-textDecorationThickness-H2)", "Heading:textUnderlineOffset-H2": "var(--xmlui-textUnderlineOffset-H2)", "Heading:color-H3": "var(--xmlui-color-H3)", "Heading:letterSpacing-H3": "var(--xmlui-letterSpacing-H3)", "Heading:fontFamily-H3": "var(--xmlui-fontFamily-H3)", "Heading:fontWeight-H3": "var(--xmlui-fontWeight-H3)", "fontSize-H3": "var(--xmlui-fontSize-H3)", "lineHeight-H3": "var(--xmlui-lineHeight-H3)", "marginTop-H3": "var(--xmlui-marginTop-H3)", "marginBottom-H3": "var(--xmlui-marginBottom-H3)", "Heading:textDecorationLine-H3": "var(--xmlui-textDecorationLine-H3)", "Heading:textDecorationColor-H3": "var(--xmlui-textDecorationColor-H3)", "Heading:textDecorationStyle-H3": "var(--xmlui-textDecorationStyle-H3)", "Heading:textDecorationThickness-H3": "var(--xmlui-textDecorationThickness-H3)", "Heading:textUnderlineOffset-H3": "var(--xmlui-textUnderlineOffset-H3)", "Heading:color-H4": "var(--xmlui-color-H4)", "Heading:letterSpacing-H4": "var(--xmlui-letterSpacing-H4)", "Heading:fontFamily-H4": "var(--xmlui-fontFamily-H4)", "Heading:fontWeight-H4": "var(--xmlui-fontWeight-H4)", "fontSize-H4": "var(--xmlui-fontSize-H4)", "lineHeight-H4": "var(--xmlui-lineHeight-H4)", "marginTop-H4": "var(--xmlui-marginTop-H4)", "marginBottom-H4": "var(--xmlui-marginBottom-H4)", "Heading:textDecorationLine-H4": "var(--xmlui-textDecorationLine-H4)", "Heading:textDecorationColor-H4": "var(--xmlui-textDecorationColor-H4)", "Heading:textDecorationStyle-H4": "var(--xmlui-textDecorationStyle-H4)", "Heading:textDecorationThickness-H4": "var(--xmlui-textDecorationThickness-H4)", "Heading:textUnderlineOffset-H4": "var(--xmlui-textUnderlineOffset-H4)", "Heading:color-H5": "var(--xmlui-color-H5)", "Heading:letterSpacing-H5": "var(--xmlui-letterSpacing-H5)", "Heading:fontFamily-H5": "var(--xmlui-fontFamily-H5)", "Heading:fontWeight-H5": "var(--xmlui-fontWeight-H5)", "fontSize-H5": "var(--xmlui-fontSize-H5)", "lineHeight-H5": "var(--xmlui-lineHeight-H5)", "marginTop-H5": "var(--xmlui-marginTop-H5)", "marginBottom-H5": "var(--xmlui-marginBottom-H5)", "Heading:textDecorationLine-H5": "var(--xmlui-textDecorationLine-H5)", "Heading:textDecorationColor-H5": "var(--xmlui-textDecorationColor-H5)", "Heading:textDecorationStyle-H5": "var(--xmlui-textDecorationStyle-H5)", "Heading:textDecorationThickness-H5": "var(--xmlui-textDecorationThickness-H5)", "Heading:textUnderlineOffset-H5": "var(--xmlui-textUnderlineOffset-H5)", "Heading:color-H6": "var(--xmlui-color-H6)", "Heading:letterSpacing-H6": "var(--xmlui-letterSpacing-H6)", "Heading:fontFamily-H6": "var(--xmlui-fontFamily-H6)", "Heading:fontWeight-H6": "var(--xmlui-fontWeight-H6)", "fontSize-H6": "var(--xmlui-fontSize-H6)", "lineHeight-H6": "var(--xmlui-lineHeight-H6)", "marginTop-H6": "var(--xmlui-marginTop-H6)", "marginBottom-H6": "var(--xmlui-marginBottom-H6)", "Heading:textDecorationLine-H6": "var(--xmlui-textDecorationLine-H6)", "Heading:textDecorationColor-H6": "var(--xmlui-textDecorationColor-H6)", "Heading:textDecorationStyle-H6": "var(--xmlui-textDecorationStyle-H6)", "Heading:textDecorationThickness-H6": "var(--xmlui-textDecorationThickness-H6)", "Heading:textUnderlineOffset-H6": "var(--xmlui-textUnderlineOffset-H6)"}'`, lm = "_heading_q2wu3_13", dm = "_h1_q2wu3_13", sm = "_h2_q2wu3_28", um = "_h3_q2wu3_43", cm = "_h4_q2wu3_58", mm = "_h5_q2wu3_73", pm = "_h6_q2wu3_88", hm = "_truncateOverflow_q2wu3_108", xm = "_preserveLinebreaks_q2wu3_114", bm = "_noEllipsis_q2wu3_118", Br = {
  themeVars: nm,
  heading: lm,
  h1: dm,
  h2: sm,
  h3: um,
  h4: cm,
  h5: mm,
  h6: pm,
  truncateOverflow: hm,
  preserveLinebreaks: xm,
  noEllipsis: bm
}, oi = {
  level: "h1",
  ellipses: !0,
  omitFromToc: !1
}, Bi = xe(function({
  uid: r,
  level: t = "h1",
  children: o,
  sx: a,
  style: n,
  title: i,
  maxLines: l = 0,
  preserveLinebreaks: s,
  ellipses: f = !0,
  className: h,
  omitFromToc: c = !1,
  ...T
}, b) {
  const v = t == null ? void 0 : t.toLowerCase(), y = he(null), [w, _] = me(null), H = he(null), $ = $r(Gc), O = $ == null ? void 0 : $.registerHeading, F = $ == null ? void 0 : $.hasTableOfContents, Y = b ? st(y, b) : y;
  return K(() => {
    var V, R, W, z;
    if (F && y.current) {
      const x = (z = (W = (R = (V = y.current.textContent) == null ? void 0 : V.trim()) == null ? void 0 : R.replace(/[^\w\s-]/g, "")) == null ? void 0 : W.replace(/\s+/g, "-")) == null ? void 0 : z.toLowerCase();
      _(x || null);
    }
  }, [F]), $o(() => {
    if (F && y.current && w && !c)
      return O == null ? void 0 : O({
        id: w,
        level: parseInt(t.replace("h", "")),
        text: y.current.textContent.trim(),
        anchor: H.current
      });
  }, [w, F, O, t, c]), /* @__PURE__ */ j(
    v,
    {
      ref: Y,
      id: r,
      title: i,
      style: { ...a, ...n, ...rl(l) },
      className: le(Br.heading, Br[v], h || "", {
        [Br.truncateOverflow]: l > 0,
        [Br.preserveLinebreaks]: s,
        [Br.noEllipsis]: !f
      }),
      ...T,
      children: [
        w && F && /* @__PURE__ */ p("span", { ref: H, id: w, style: { width: 0, height: 0 }, "data-anchor": !0 }),
        o
      ]
    }
  );
}), Ko = {
  orientation: "vertical",
  showAvatar: !1
};
xe(function({
  children: r,
  orientation: t = Ko.orientation,
  style: o,
  title: a,
  subtitle: n,
  linkTo: i,
  avatarUrl: l,
  showAvatar: s = !!l || Ko.showAvatar,
  onClick: f
}, h) {
  const c = {
    level: "h2"
  };
  return /* @__PURE__ */ j(
    "div",
    {
      ref: h,
      className: le(ko.wrapper, {
        [ko.isClickable]: !!f,
        [ko.vertical]: t === "vertical",
        [ko.horizontal]: t === "horizontal"
      }),
      style: o,
      onClick: f,
      children: [
        [a, n, l, s].some(Boolean) && /* @__PURE__ */ j(Lo, { orientation: "horizontal", verticalAlignment: "center", style: { gap: "1rem" }, children: [
          s && /* @__PURE__ */ p(Vc, { url: l, name: a }),
          /* @__PURE__ */ j(Lo, { orientation: "vertical", children: [
            i ? a ? /* @__PURE__ */ p(am, { to: i + "", children: /* @__PURE__ */ p(Bi, { ...c, children: a }) }) : null : a ? /* @__PURE__ */ p(Bi, { ...c, children: a }) : null,
            n !== void 0 && /* @__PURE__ */ p(no, { variant: "small", children: n })
          ] })
        ] }),
        r
      ]
    }
  );
});
const pr = "Card", fm = C({
  description: `The \`${pr}\` component is a container for cohesive elements, often rendered visually as a card.`,
  props: {
    avatarUrl: {
      description: `Show the avatar (\`true\`) or not (\`false\`). If not specified, the ${pr} will show the first letters of the [\`title\`](#title).`,
      type: "string"
    },
    showAvatar: {
      description: `Indicates whether the ${pr} should be displayed`,
      valueType: "boolean",
      defaultValue: Ko.showAvatar
    },
    title: {
      description: "This prop sets the prestyled title.",
      valueType: "string"
    },
    subtitle: {
      description: "This prop sets the prestyled subtitle.",
      valueType: "string"
    },
    linkTo: {
      description: "This property wraps the title in a `Link` component that is clickable to navigate.",
      valueType: "string"
    },
    orientation: {
      description: `An optional property that governs the ${pr}'s orientation (whether the ${pr} lays out its children in a row or a column). If the orientation is set to \`horizontal\`, the ${pr} will display its children in a row, except for its [\`title\`](#title) and [\`subtitle\`](#subtitle).`,
      availableValues: aa,
      valueType: "string",
      defaultValue: Ko.orientation
    }
  },
  events: {
    click: po(pr)
  },
  themeVars: Z(ko.themeVars),
  defaultThemeVars: {
    [`padding-${pr}`]: "$space-4",
    [`border-${pr}`]: "1px solid $borderColor",
    [`borderRadius-${pr}`]: "$borderRadius",
    [`boxShadow-${pr}`]: "none",
    light: {
      [`backgroundColor-${pr}`]: "white"
    },
    dark: {
      [`backgroundColor-${pr}`]: "$color-surface-900"
    }
  }
}), vm = {
  throttleWaitInMs: 0
}, Ii = "ChangeListener", gm = C({
  description: `\`${Ii}\` is a functional component (it renders no UI) to trigger an action when a particular value (component property, state, etc.) changes.`,
  props: {
    listenTo: {
      description: "Value to the changes of which this component listens.",
      valueType: "any"
    },
    throttleWaitInMs: {
      description: "This variable sets a throttling time (in milliseconds) to apply when executing the `didChange` event handler. All changes within that throttling time will only fire the `didChange` event once.",
      valueType: "number",
      defaultValue: vm.throttleWaitInMs
    }
  },
  events: {
    didChange: er(Ii)
  }
}), Tm = `'{"Input:borderRadius-Checkbox-default": "var(--xmlui-borderRadius-Checkbox-default)", "Input:borderColor-Checkbox-default": "var(--xmlui-borderColor-Checkbox-default)", "Input:backgroundColor-Checkbox-default": "var(--xmlui-backgroundColor-Checkbox-default)", "Input:outlineWidth-Checkbox-default--focus": "var(--xmlui-outlineWidth-Checkbox-default--focus)", "Input:outlineColor-Checkbox-default--focus": "var(--xmlui-outlineColor-Checkbox-default--focus)", "Input:outlineStyle-Checkbox-default--focus": "var(--xmlui-outlineStyle-Checkbox-default--focus)", "Input:outlineOffset-Checkbox-default--focus": "var(--xmlui-outlineOffset-Checkbox-default--focus)", "Input:borderColor-Checkbox-default--hover": "var(--xmlui-borderColor-Checkbox-default--hover)", "Input:backgroundColor-Checkbox--disabled": "var(--xmlui-backgroundColor-Checkbox--disabled)", "Input:borderColor-Checkbox--disabled": "var(--xmlui-borderColor-Checkbox--disabled)", "Input:borderRadius-Checkbox-error": "var(--xmlui-borderRadius-Checkbox-error)", "Input:borderColor-Checkbox-error": "var(--xmlui-borderColor-Checkbox-error)", "Input:backgroundColor-Checkbox-error": "var(--xmlui-backgroundColor-Checkbox-error)", "Input:outlineWidth-Checkbox-error--focus": "var(--xmlui-outlineWidth-Checkbox-error--focus)", "Input:outlineColor-Checkbox-error--focus": "var(--xmlui-outlineColor-Checkbox-error--focus)", "Input:outlineStyle-Checkbox-error--focus": "var(--xmlui-outlineStyle-Checkbox-error--focus)", "Input:outlineOffset-Checkbox-error--focus": "var(--xmlui-outlineOffset-Checkbox-error--focus)", "Input:borderRadius-Checkbox-warning": "var(--xmlui-borderRadius-Checkbox-warning)", "Input:borderColor-Checkbox-warning": "var(--xmlui-borderColor-Checkbox-warning)", "Input:backgroundColor-Checkbox-warning": "var(--xmlui-backgroundColor-Checkbox-warning)", "Input:outlineWidth-Checkbox-warning--focus": "var(--xmlui-outlineWidth-Checkbox-warning--focus)", "Input:outlineColor-Checkbox-warning--focus": "var(--xmlui-outlineColor-Checkbox-warning--focus)", "Input:outlineStyle-Checkbox-warning--focus": "var(--xmlui-outlineStyle-Checkbox-warning--focus)", "Input:outlineOffset-Checkbox-warning--focus": "var(--xmlui-outlineOffset-Checkbox-warning--focus)", "Input:borderRadius-Checkbox-success": "var(--xmlui-borderRadius-Checkbox-success)", "Input:borderColor-Checkbox-success": "var(--xmlui-borderColor-Checkbox-success)", "Input:backgroundColor-Checkbox-success": "var(--xmlui-backgroundColor-Checkbox-success)", "Input:outlineWidth-Checkbox-success--focus": "var(--xmlui-outlineWidth-Checkbox-success--focus)", "Input:outlineColor-Checkbox-success--focus": "var(--xmlui-outlineColor-Checkbox-success--focus)", "Input:outlineStyle-Checkbox-success--focus": "var(--xmlui-outlineStyle-Checkbox-success--focus)", "Input:outlineOffset-Checkbox-success--focus": "var(--xmlui-outlineOffset-Checkbox-success--focus)", "backgroundColor-indicator-Checkbox": "var(--xmlui-backgroundColor-indicator-Checkbox)", "Input:borderColor-checked-Checkbox": "var(--xmlui-borderColor-checked-Checkbox)", "Input:backgroundColor-checked-Checkbox": "var(--xmlui-backgroundColor-checked-Checkbox)", "Input:borderColor-checked-Checkbox-error": "var(--xmlui-borderColor-checked-Checkbox-error)", "Input:backgroundColor-checked-Checkbox-error": "var(--xmlui-backgroundColor-checked-Checkbox-error)", "Input:borderColor-checked-Checkbox-warning": "var(--xmlui-borderColor-checked-Checkbox-warning)", "Input:backgroundColor-checked-Checkbox-warning": "var(--xmlui-backgroundColor-checked-Checkbox-warning)", "Input:borderColor-checked-Checkbox-success": "var(--xmlui-borderColor-checked-Checkbox-success)", "Input:backgroundColor-checked-Checkbox-success": "var(--xmlui-backgroundColor-checked-Checkbox-success)", "Input:borderColor-Switch": "var(--xmlui-borderColor-Switch)", "Input:backgroundColor-Switch": "var(--xmlui-backgroundColor-Switch)", "Input:borderColor-Switch-default--hover": "var(--xmlui-borderColor-Switch-default--hover)", "Input:backgroundColor-Switch--disabled": "var(--xmlui-backgroundColor-Switch--disabled)", "Input:borderColor-Switch--disabled": "var(--xmlui-borderColor-Switch--disabled)", "Input:borderColor-Switch-error": "var(--xmlui-borderColor-Switch-error)", "Input:borderColor-Switch-warning": "var(--xmlui-borderColor-Switch-warning)", "Input:borderColor-Switch-success": "var(--xmlui-borderColor-Switch-success)", "backgroundColor-indicator-Switch": "var(--xmlui-backgroundColor-indicator-Switch)", "Input:borderColor-checked-Switch": "var(--xmlui-borderColor-checked-Switch)", "Input:backgroundColor-checked-Switch": "var(--xmlui-backgroundColor-checked-Switch)", "Input:borderColor-checked-Switch-error": "var(--xmlui-borderColor-checked-Switch-error)", "Input:backgroundColor-checked-Switch-error": "var(--xmlui-backgroundColor-checked-Switch-error)", "Input:borderColor-checked-Switch-warning": "var(--xmlui-borderColor-checked-Switch-warning)", "Input:backgroundColor-checked-Switch-warning": "var(--xmlui-backgroundColor-checked-Switch-warning)", "Input:borderColor-checked-Switch-success": "var(--xmlui-borderColor-checked-Switch-success)", "Input:backgroundColor-checked-Switch-success": "var(--xmlui-backgroundColor-checked-Switch-success)", "Input:outlineWidth-Switch--focus": "var(--xmlui-outlineWidth-Switch--focus)", "Input:outlineColor-Switch--focus": "var(--xmlui-outlineColor-Switch--focus)", "Input:outlineStyle-Switch--focus": "var(--xmlui-outlineStyle-Switch--focus)", "Input:outlineOffset-Switch--focus": "var(--xmlui-outlineOffset-Switch--focus)"}'`, ym = "_resetAppearance_m9kqa_13", Cm = "_label_m9kqa_21", km = "_inputContainer_m9kqa_25", Sm = "_checkbox_m9kqa_33", wm = "_error_m9kqa_62", Hm = "_warning_m9kqa_73", Bm = "_valid_m9kqa_84", Ur = {
  themeVars: Tm,
  resetAppearance: ym,
  label: Cm,
  inputContainer: km,
  checkbox: Sm,
  error: wm,
  warning: Hm,
  valid: Bm,
  switch: "_switch_m9kqa_144"
}, Vr = {
  initialValue: !1,
  value: !1,
  enabled: !0,
  validationStatus: "none",
  indeterminate: !1
}, Ea = xe(function({
  id: r,
  initialValue: t = Vr.initialValue,
  value: o = Vr.value,
  enabled: a = Vr.enabled,
  style: n,
  readOnly: i,
  validationStatus: l = Vr.validationStatus,
  updateState: s = de,
  onDidChange: f = de,
  onFocus: h = de,
  onBlur: c = de,
  variant: T = "checkbox",
  indeterminate: b = Vr.indeterminate,
  className: v,
  label: y,
  labelPosition: w = "end",
  labelWidth: _,
  labelBreak: H,
  required: $,
  registerComponentApi: O,
  inputRenderer: F
}, Y) {
  const V = mo(), R = r || V, W = Ae.useRef(null);
  K(() => {
    s({ value: t }, { initial: !0 });
  }, [t, s]);
  const z = X(
    (E) => {
      var N;
      ((N = W.current) == null ? void 0 : N.checked) !== E && (s({ value: E }), f(E));
    },
    [f, s]
  ), x = X(
    (E) => {
      i || (s({ value: E.target.checked }), f(E.target.checked));
    },
    [f, i, s]
  ), m = X(() => {
    h == null || h();
  }, [h]), g = X(() => {
    c == null || c();
  }, [c]);
  K(() => {
    typeof b == "boolean" && W.current && (W.current.indeterminate = b);
  }, [b]);
  const k = X(() => {
    var E;
    (E = W.current) == null || E.focus();
  }, []), A = $e((E) => {
    z(E);
  });
  K(() => {
    O == null || O({
      focus: k,
      setValue: A
    });
  }, [k, O, A]);
  const q = ue(
    () => /* @__PURE__ */ p(
      "input",
      {
        id: R,
        ref: W,
        type: "checkbox",
        role: T,
        checked: o,
        disabled: !a,
        required: $,
        readOnly: i,
        "aria-readonly": i,
        "aria-checked": o,
        onChange: x,
        onFocus: m,
        onBlur: g,
        className: le(Ur.resetAppearance, v, {
          [Ur.checkbox]: T === "checkbox",
          [Ur.switch]: T === "switch",
          [Ur.error]: l === "error",
          [Ur.warning]: l === "warning",
          [Ur.valid]: l === "valid"
        })
      }
    ),
    [
      R,
      v,
      a,
      g,
      m,
      x,
      i,
      $,
      l,
      o,
      T
    ]
  );
  return /* @__PURE__ */ p(
    Ir,
    {
      ref: Y,
      id: R,
      label: y,
      style: n,
      labelPosition: w,
      labelWidth: _,
      labelBreak: H,
      required: $,
      enabled: a,
      isInputTemplateUsed: !!F,
      shrinkToLabel: !0,
      labelStyle: { pointerEvents: i ? "none" : void 0 },
      children: F ? /* @__PURE__ */ j("label", { className: Ur.label, children: [
        /* @__PURE__ */ p("div", { className: Ur.inputContainer, children: q }),
        F({
          $checked: o
        })
      ] }) : q
    }
  );
}), Be = "Checkbox", Im = C({
  status: "stable",
  description: `The \`${Be}\` component allows users to make binary choices, typically between checked or unchecked. It consists of a small box that can be toggled on or off by clicking on it.`,
  props: {
    indeterminate: qn(Vr.indeterminate),
    label: Fe(),
    labelPosition: Dr("end"),
    labelWidth: jr(Be),
    labelBreak: Jr(Be),
    required: Ar(),
    initialValue: Cr(Vr.initialValue),
    autoFocus: rr(),
    readOnly: Lr(),
    enabled: Qe(),
    validationStatus: _r(Vr.validationStatus),
    description: Pe(
      `(*** NOT IMPLEMENTED YET ***) This optional property displays an alternate description of the ${Be} besides its label.`
    ),
    inputTemplate: {
      description: "This property is used to define a custom checkbox input template"
    }
  },
  events: {
    gotFocus: Tr(Be),
    lostFocus: yr(Be),
    didChange: er(Be)
  },
  apis: {
    value: Gn(),
    setValue: Kr()
  },
  themeVars: Z(Ur.themeVars),
  defaultThemeVars: {
    [`borderColor-checked-${Be}-error`]: `$borderColor-${Be}-error`,
    [`backgroundColor-checked-${Be}-error`]: `$borderColor-${Be}-error`,
    [`borderColor-checked-${Be}-warning`]: `$borderColor-${Be}-warning`,
    [`backgroundColor-checked-${Be}-warning`]: `$borderColor-${Be}-warning`,
    [`borderColor-checked-${Be}-success`]: `$borderColor-${Be}-success`,
    [`backgroundColor-checked-${Be}-success`]: `$borderColor-${Be}-success`,
    light: {
      [`backgroundColor-indicator-${Be}`]: "$backgroundColor-primary",
      [`borderColor-checked-${Be}`]: "$color-primary-500",
      [`backgroundColor-checked-${Be}`]: "$color-primary-500",
      [`backgroundColor-${Be}--disabled`]: "$color-surface-200"
    },
    dark: {
      [`backgroundColor-indicator-${Be}`]: "$backgroundColor-primary",
      [`borderColor-checked-${Be}`]: "$color-primary-400",
      [`backgroundColor-checked-${Be}`]: "$color-primary-400",
      [`backgroundColor-${Be}--disabled`]: "$color-surface-800"
    }
  }
}), $m = `'{"backgroundColor-ContentSeparator": "var(--xmlui-backgroundColor-ContentSeparator)", "size-ContentSeparator": "var(--xmlui-size-ContentSeparator)"}'`, Lm = {
  themeVars: $m
}, _m = {
  orientation: "horizontal"
}, ua = "ContentSeparator", Am = C({
  description: `A \`${ua}\` is a component that divides or separates content visually within a layout. It serves as a visual cue to distinguish between different sections or groups of content, helping to improve readability and organization.`,
  props: {
    size: {
      description: "This property defines the component's height (if the `orientation` is horizontal) or the width (if the `orientation` is vertical).",
      valueType: "any"
    },
    orientation: {
      description: "Sets the main axis of the component",
      availableValues: aa,
      defaultValue: _m.orientation,
      valueType: "string"
    }
  },
  themeVars: Z(Lm.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${ua}`]: "$borderColor",
    [`size-${ua}`]: "1px",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), Nm = `'{"Input:minHeight-DatePicker": "var(--xmlui-minHeight-DatePicker)", "Input:fontSize-DatePicker": "var(--xmlui-fontSize-DatePicker)", "Input:borderRadius-DatePicker-default": "var(--xmlui-borderRadius-DatePicker-default)", "Input:borderColor-DatePicker-default": "var(--xmlui-borderColor-DatePicker-default)", "Input:borderWidth-DatePicker-default": "var(--xmlui-borderWidth-DatePicker-default)", "Input:borderStyle-DatePicker-default": "var(--xmlui-borderStyle-DatePicker-default)", "Input:backgroundColor-DatePicker-default": "var(--xmlui-backgroundColor-DatePicker-default)", "Input:boxShadow-DatePicker-default": "var(--xmlui-boxShadow-DatePicker-default)", "Input:color-DatePicker-default": "var(--xmlui-color-DatePicker-default)", "Input:padding-DatePicker-default": "var(--xmlui-padding-DatePicker-default)", "Input:borderColor-DatePicker-default--hover": "var(--xmlui-borderColor-DatePicker-default--hover)", "Input:backgroundColor-DatePicker-default--hover": "var(--xmlui-backgroundColor-DatePicker-default--hover)", "Input:boxShadow-DatePicker-default--hover": "var(--xmlui-boxShadow-DatePicker-default--hover)", "Input:color-DatePicker-default--hover": "var(--xmlui-color-DatePicker-default--hover)", "Input:outlineWidth-DatePicker-default--focus": "var(--xmlui-outlineWidth-DatePicker-default--focus)", "Input:outlineColor-DatePicker-default--focus": "var(--xmlui-outlineColor-DatePicker-default--focus)", "Input:outlineStyle-DatePicker-default--focus": "var(--xmlui-outlineStyle-DatePicker-default--focus)", "Input:outlineOffset-DatePicker-default--focus": "var(--xmlui-outlineOffset-DatePicker-default--focus)", "Input:color-placeholder-DatePicker-default": "var(--xmlui-color-placeholder-DatePicker-default)", "Input:color-adornment-DatePicker-default": "var(--xmlui-color-adornment-DatePicker-default)", "Input:borderRadius-DatePicker-error": "var(--xmlui-borderRadius-DatePicker-error)", "Input:borderColor-DatePicker-error": "var(--xmlui-borderColor-DatePicker-error)", "Input:borderWidth-DatePicker-error": "var(--xmlui-borderWidth-DatePicker-error)", "Input:borderStyle-DatePicker-error": "var(--xmlui-borderStyle-DatePicker-error)", "Input:backgroundColor-DatePicker-error": "var(--xmlui-backgroundColor-DatePicker-error)", "Input:boxShadow-DatePicker-error": "var(--xmlui-boxShadow-DatePicker-error)", "Input:color-DatePicker-error": "var(--xmlui-color-DatePicker-error)", "Input:padding-DatePicker-error": "var(--xmlui-padding-DatePicker-error)", "Input:borderColor-DatePicker-error--hover": "var(--xmlui-borderColor-DatePicker-error--hover)", "Input:backgroundColor-DatePicker-error--hover": "var(--xmlui-backgroundColor-DatePicker-error--hover)", "Input:boxShadow-DatePicker-error--hover": "var(--xmlui-boxShadow-DatePicker-error--hover)", "Input:color-DatePicker-error--hover": "var(--xmlui-color-DatePicker-error--hover)", "Input:outlineWidth-DatePicker-error--focus": "var(--xmlui-outlineWidth-DatePicker-error--focus)", "Input:outlineColor-DatePicker-error--focus": "var(--xmlui-outlineColor-DatePicker-error--focus)", "Input:outlineStyle-DatePicker-error--focus": "var(--xmlui-outlineStyle-DatePicker-error--focus)", "Input:outlineOffset-DatePicker-error--focus": "var(--xmlui-outlineOffset-DatePicker-error--focus)", "Input:color-placeholder-DatePicker-error": "var(--xmlui-color-placeholder-DatePicker-error)", "Input:color-adornment-DatePicker-error": "var(--xmlui-color-adornment-DatePicker-error)", "Input:borderRadius-DatePicker-warning": "var(--xmlui-borderRadius-DatePicker-warning)", "Input:borderColor-DatePicker-warning": "var(--xmlui-borderColor-DatePicker-warning)", "Input:borderWidth-DatePicker-warning": "var(--xmlui-borderWidth-DatePicker-warning)", "Input:borderStyle-DatePicker-warning": "var(--xmlui-borderStyle-DatePicker-warning)", "Input:backgroundColor-DatePicker-warning": "var(--xmlui-backgroundColor-DatePicker-warning)", "Input:boxShadow-DatePicker-warning": "var(--xmlui-boxShadow-DatePicker-warning)", "Input:color-DatePicker-warning": "var(--xmlui-color-DatePicker-warning)", "Input:padding-DatePicker-warning": "var(--xmlui-padding-DatePicker-warning)", "Input:borderColor-DatePicker-warning--hover": "var(--xmlui-borderColor-DatePicker-warning--hover)", "Input:backgroundColor-DatePicker-warning--hover": "var(--xmlui-backgroundColor-DatePicker-warning--hover)", "Input:boxShadow-DatePicker-warning--hover": "var(--xmlui-boxShadow-DatePicker-warning--hover)", "Input:color-DatePicker-warning--hover": "var(--xmlui-color-DatePicker-warning--hover)", "Input:outlineWidth-DatePicker-warning--focus": "var(--xmlui-outlineWidth-DatePicker-warning--focus)", "Input:outlineColor-DatePicker-warning--focus": "var(--xmlui-outlineColor-DatePicker-warning--focus)", "Input:outlineStyle-DatePicker-warning--focus": "var(--xmlui-outlineStyle-DatePicker-warning--focus)", "Input:outlineOffset-DatePicker-warning--focus": "var(--xmlui-outlineOffset-DatePicker-warning--focus)", "Input:color-placeholder-DatePicker-warning": "var(--xmlui-color-placeholder-DatePicker-warning)", "Input:color-adornment-DatePicker-warning": "var(--xmlui-color-adornment-DatePicker-warning)", "Input:borderRadius-DatePicker-success": "var(--xmlui-borderRadius-DatePicker-success)", "Input:borderColor-DatePicker-success": "var(--xmlui-borderColor-DatePicker-success)", "Input:borderWidth-DatePicker-success": "var(--xmlui-borderWidth-DatePicker-success)", "Input:borderStyle-DatePicker-success": "var(--xmlui-borderStyle-DatePicker-success)", "Input:backgroundColor-DatePicker-success": "var(--xmlui-backgroundColor-DatePicker-success)", "Input:boxShadow-DatePicker-success": "var(--xmlui-boxShadow-DatePicker-success)", "Input:color-DatePicker-success": "var(--xmlui-color-DatePicker-success)", "Input:padding-DatePicker-success": "var(--xmlui-padding-DatePicker-success)", "Input:borderColor-DatePicker-success--hover": "var(--xmlui-borderColor-DatePicker-success--hover)", "Input:backgroundColor-DatePicker-success--hover": "var(--xmlui-backgroundColor-DatePicker-success--hover)", "Input:boxShadow-DatePicker-success--hover": "var(--xmlui-boxShadow-DatePicker-success--hover)", "Input:color-DatePicker-success--hover": "var(--xmlui-color-DatePicker-success--hover)", "Input:outlineWidth-DatePicker-success--focus": "var(--xmlui-outlineWidth-DatePicker-success--focus)", "Input:outlineColor-DatePicker-success--focus": "var(--xmlui-outlineColor-DatePicker-success--focus)", "Input:outlineStyle-DatePicker-success--focus": "var(--xmlui-outlineStyle-DatePicker-success--focus)", "Input:outlineOffset-DatePicker-success--focus": "var(--xmlui-outlineOffset-DatePicker-success--focus)", "Input:color-placeholder-DatePicker-success": "var(--xmlui-color-placeholder-DatePicker-success)", "Input:color-adornment-DatePicker-success": "var(--xmlui-color-adornment-DatePicker-success)", "Input:backgroundColor-DatePicker--disabled": "var(--xmlui-backgroundColor-DatePicker--disabled)", "Input:color-DatePicker--disabled": "var(--xmlui-color-DatePicker--disabled)", "Input:borderColor-DatePicker--disabled": "var(--xmlui-borderColor-DatePicker--disabled)", "Input:boxShadow-menu-DatePicker": "var(--xmlui-boxShadow-menu-DatePicker)", "Input:backgroundColor-menu-DatePicker": "var(--xmlui-backgroundColor-menu-DatePicker)", "Input:borderRadius-menu-DatePicker": "var(--xmlui-borderRadius-menu-DatePicker)", "Input:backgroundColor-item-DatePicker--active": "var(--xmlui-backgroundColor-item-DatePicker--active)", "Input:backgroundColor-item-DatePicker--hover": "var(--xmlui-backgroundColor-item-DatePicker--hover)", "Input:color-value-DatePicker": "var(--xmlui-color-value-DatePicker)"}'`, Wm = "_datePicker_ql50w_13", Om = "_placeholder_ql50w_47", Rm = "_adornment_ql50w_50", zm = "_error_ql50w_53", Vm = "_warning_ql50w_81", Em = "_valid_ql50w_109", Dm = "_disabled_ql50w_137", Pm = "_indicator_ql50w_143", Mm = "_datePickerInput_ql50w_143", Fm = "_datePickerValue_ql50w_147", qm = "_inlinePickerMenu_ql50w_152", Um = "_datePickerMenu_ql50w_269", Gm = "_root_ql50w_278", Ym = "_vhidden_ql50w_284", Xm = "_button_reset_ql50w_304", Qm = "_button_ql50w_304", Zm = "_day_selected_ql50w_326", jm = "_months_ql50w_344", Jm = "_month_ql50w_344", Km = "_table_ql50w_360", ep = "_with_weeknumber_ql50w_366", rp = "_caption_ql50w_371", tp = "_multiple_months_ql50w_379", op = "_caption_dropdowns_ql50w_385", ap = "_caption_label_ql50w_390", ip = "_nav_ql50w_406", np = "_caption_start_ql50w_410", lp = "_caption_end_ql50w_417", dp = "_nav_button_ql50w_424", sp = "_dropdown_year_ql50w_437", up = "_dropdown_month_ql50w_438", cp = "_dropdown_ql50w_437", mp = "_dropdown_icon_ql50w_474", pp = "_head_ql50w_478", hp = "_head_row_ql50w_482", xp = "_row_ql50w_483", bp = "_head_cell_ql50w_487", fp = "_tbody_ql50w_498", vp = "_tfoot_ql50w_502", gp = "_cell_ql50w_506", Tp = "_weeknumber_ql50w_514", yp = "_day_ql50w_326", Cp = "_day_today_ql50w_533", kp = "_day_outside_ql50w_533", Sp = "_day_range_start_ql50w_556", wp = "_day_range_end_ql50w_556", Hp = "_day_range_middle_ql50w_580", ar = {
  themeVars: Nm,
  datePicker: Wm,
  placeholder: Om,
  adornment: Rm,
  error: zm,
  warning: Vm,
  valid: Em,
  disabled: Dm,
  indicator: Pm,
  datePickerInput: Mm,
  datePickerValue: Fm,
  inlinePickerMenu: qm,
  datePickerMenu: Um,
  root: Gm,
  vhidden: Ym,
  button_reset: Xm,
  button: Qm,
  day_selected: Zm,
  months: jm,
  month: Jm,
  table: Km,
  with_weeknumber: ep,
  caption: rp,
  multiple_months: tp,
  caption_dropdowns: op,
  caption_label: ap,
  nav: ip,
  caption_start: np,
  caption_end: lp,
  nav_button: dp,
  dropdown_year: sp,
  dropdown_month: up,
  dropdown: cp,
  dropdown_icon: mp,
  head: pp,
  head_row: hp,
  row: xp,
  head_cell: bp,
  tbody: fp,
  tfoot: vp,
  cell: gp,
  weeknumber: Tp,
  day: yp,
  day_today: Cp,
  day_outside: kp,
  day_range_start: Sp,
  day_range_end: wp,
  day_range_middle: Hp
}, Bp = ["single", "range"];
var ht = /* @__PURE__ */ ((e) => (e[e.Sunday = 0] = "Sunday", e[e.Monday = 1] = "Monday", e[e.Tuesday = 2] = "Tuesday", e[e.Wednesday = 3] = "Wednesday", e[e.Thursday = 4] = "Thursday", e[e.Friday = 5] = "Friday", e[e.Saturday = 6] = "Saturday", e))(ht || {});
const ea = [
  "MM/dd/yyyy",
  "MM-dd-yyyy",
  "yyyy/MM/dd",
  "yyyy-MM-dd",
  "dd/MM/yyyy",
  "dd-MM-yyyy",
  "yyyyMMdd",
  "MMddyyyy"
], Ke = {
  mode: "single",
  validationStatus: "none",
  enabled: !0,
  inline: !1,
  dateFormat: "MM/dd/yyyy",
  showWeekNumber: !1,
  weekStartsOn: 0,
  disabledDates: []
}, Ip = xe(function({
  id: r,
  initialValue: t,
  value: o,
  mode: a = Ke.mode,
  enabled: n = Ke.enabled,
  placeholder: i,
  updateState: l = de,
  validationStatus: s = Ke.validationStatus,
  onDidChange: f = de,
  onFocus: h = de,
  onBlur: c = de,
  dateFormat: T = Ke.dateFormat,
  showWeekNumber: b = Ke.showWeekNumber,
  weekStartsOn: v = Ke.weekStartsOn,
  fromDate: y,
  toDate: w,
  disabledDates: _ = Ke.disabledDates,
  style: H,
  registerComponentApi: $,
  inline: O = Ke.inline,
  startText: F,
  startIcon: Y,
  endText: V,
  endIcon: R
}, W) {
  const z = v >= 0 && v <= 6 ? v : 0, [x, m] = me(!1), [g, k] = me(!1), A = he(null), q = W ? st(A, W) : A, E = ue(() => {
    if (a === "single" && typeof o == "string")
      return ca(o) || Eo(o);
    if (a === "range" && typeof o == "object")
      return {
        from: ca(o == null ? void 0 : o.from) || Eo(o == null ? void 0 : o.from),
        to: ca(o == null ? void 0 : o.to) || Eo(o == null ? void 0 : o.to)
      };
  }, [o, a]);
  K(() => {
    if (!ea.includes(T))
      throw new Error(
        `Invalid dateFormat: ${T}. Supported formats are: ${ea.join(", ")}`
      );
  }, [T]);
  const N = ue(() => y ? Yo(y, T, /* @__PURE__ */ new Date()) : void 0, [y, T]), B = ue(() => w ? Yo(w, T, /* @__PURE__ */ new Date()) : void 0, [w, T]), D = ue(() => _ == null ? void 0 : _.map((te) => Yo(te, T, /* @__PURE__ */ new Date())), [_, T]), [P, I] = me(!1), { root: M } = dt(), G = () => {
    m(!0);
  }, J = () => {
    m(!1);
  }, ee = () => {
    k(!0);
  }, Ce = () => {
    k(!1);
  }, qe = X(() => {
    var te;
    (te = A == null ? void 0 : A.current) == null || te.focus();
  }, [A == null ? void 0 : A.current]), Ee = $e((te) => {
    const Q = Eo(te);
    ae(Q);
  });
  K(() => {
    $ == null || $({
      focus: qe,
      setValue: Ee
    });
  }, [qe, $, Ee]), K(() => {
    !x && !g && (c == null || c()), (x || g) && (h == null || h());
  }, [x, g, h, c]), K(() => {
    l({ value: t }, { initial: !0 });
  }, [t, l]);
  const ae = X(
    (te) => {
      if (!te)
        l({ value: void 0 }), f("");
      else if (a === "single") {
        const ne = wt(te, T);
        l({ value: ne }), f(ne);
      } else {
        const Q = te, ne = {
          from: Q.from ? wt(Q.from, T) : "",
          to: Q.to ? wt(Q.to, T) : ""
        };
        l({ value: ne }), f(ne);
      }
      a === "single" && I(!1);
    },
    [f, l, a, T]
  );
  return O ? /* @__PURE__ */ p("div", { children: /* @__PURE__ */ p("div", { className: ar.inlinePickerMenu, children: /* @__PURE__ */ p(
    gi,
    {
      fixedWeeks: !0,
      fromDate: N,
      toDate: B,
      disabled: D,
      weekStartsOn: z,
      showWeekNumber: b,
      showOutsideDays: !0,
      classNames: ar,
      mode: a === "single" ? "single" : "range",
      selected: E,
      onSelect: ae,
      initialFocus: !O,
      numberOfMonths: a === "range" ? 2 : 1
    }
  ) }) }) : /* @__PURE__ */ j(nt.Root, { open: P, onOpenChange: I, modal: !1, children: [
    /* @__PURE__ */ p(nt.Trigger, { asChild: !0, children: /* @__PURE__ */ j(
      "button",
      {
        disabled: !n,
        id: r,
        ref: q,
        style: H,
        className: le(ar.datePicker, {
          [ar.disabled]: !n,
          [ar.error]: s === "error",
          [ar.warning]: s === "warning",
          [ar.valid]: s === "valid"
        }),
        onFocus: G,
        onBlur: J,
        children: [
          /* @__PURE__ */ p(lo, { text: F, iconName: Y, className: ar.adornment }),
          /* @__PURE__ */ p("div", { className: ar.datePickerValue, children: a === "single" && E ? /* @__PURE__ */ p(gr, { children: wt(E, T) }) : a === "range" && typeof E == "object" && E.from ? E.to ? /* @__PURE__ */ j(gr, { children: [
            wt(E.from, T),
            " - ",
            wt(E.to, T)
          ] }) : /* @__PURE__ */ p(gr, { children: wt(E.from, T) }) : i ? /* @__PURE__ */ p("span", { className: ar.placeholder, children: i }) : /* @__PURE__ */ p("span", { children: " " }) }),
          /* @__PURE__ */ p(lo, { text: V, iconName: R, className: ar.adornment })
        ]
      }
    ) }),
    /* @__PURE__ */ p(nt.Portal, { container: M, children: /* @__PURE__ */ p(
      nt.Content,
      {
        align: "start",
        className: ar.datePickerMenu,
        onFocus: ee,
        onBlur: Ce,
        onInteractOutside: Ce,
        children: /* @__PURE__ */ p(
          gi,
          {
            fixedWeeks: !0,
            fromDate: N,
            toDate: B,
            disabled: D,
            weekStartsOn: z,
            showWeekNumber: b,
            showOutsideDays: !0,
            classNames: ar,
            mode: a === "single" ? "single" : "range",
            selected: E,
            onSelect: ae,
            initialFocus: !0,
            numberOfMonths: a === "range" ? 2 : 1
          }
        )
      }
    ) })
  ] });
}), $p = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/, ca = (e) => {
  if (e && $p.test(e)) {
    const r = id(e);
    if (_n(r))
      return r;
  }
}, Eo = (e) => {
  if (e)
    for (const r of ea) {
      const t = Yo(e, r, /* @__PURE__ */ new Date());
      if (_n(t))
        return t;
    }
}, hr = "DatePicker", Lp = C({
  status: "experimental",
  description: "A datepicker component enables the selection of a date or a range of dates in a specified format from an interactive display.",
  props: {
    placeholder: Vt(),
    initialValue: Cr(),
    autoFocus: rr(),
    readOnly: Lr(),
    enabled: Qe(Ke.enabled),
    validationStatus: _r(Ke.validationStatus),
    mode: {
      description: "The mode of the datepicker (single or range)",
      valueType: "string",
      availableValues: Bp,
      defaultValue: Ke.mode
    },
    dateFormat: {
      description: "The format of the date displayed in the input field",
      valueType: "string",
      defaultValue: Ke.dateFormat,
      availableValues: ea
    },
    showWeekNumber: {
      description: "Whether to show the week number in the calendar",
      valueType: "boolean",
      defaultValue: Ke.showWeekNumber
    },
    weekStartsOn: {
      description: "The first day of the week. 0 is Sunday, 1 is Monday, etc.",
      valueType: "number",
      defaultValue: Ke.weekStartsOn,
      availableValues: [
        {
          value: ht.Sunday,
          description: "Sunday"
        },
        {
          value: ht.Monday,
          description: "Monday"
        },
        {
          value: ht.Tuesday,
          description: "Tuesday"
        },
        {
          value: ht.Wednesday,
          description: "Wednesday"
        },
        {
          value: ht.Thursday,
          description: "Thursday"
        },
        {
          value: ht.Friday,
          description: "Friday"
        },
        {
          value: ht.Saturday,
          description: "Saturday"
        }
      ]
    },
    fromDate: {
      description: "The start date of the range of selectable dates",
      valueType: "string"
    },
    toDate: {
      description: "The end date of the range of selectable dates",
      valueType: "string"
    },
    disabledDates: {
      description: "An array of dates that are disabled",
      valueType: "any"
    },
    inline: {
      description: "Whether to display the datepicker inline",
      valueType: "boolean",
      defaultValue: Ke.inline
    },
    startText: Ka(),
    startIcon: ei(),
    endText: ri(),
    endIcon: ti()
  },
  events: {
    didChange: er(hr),
    gotFocus: Tr(hr),
    lostFocus: yr(hr)
  },
  apis: {
    focus: et(hr),
    value: u(
      "You can query the component's value. If no value is set, it will retrieve `undefined`."
    ),
    setValue: Kr()
  },
  themeVars: Z(ar.themeVars),
  defaultThemeVars: {
    [`boxShadow-menu-${hr}`]: "$boxShadow-md",
    [`borderRadius-menu-${hr}`]: "$borderRadius",
    [`color-value-${hr}`]: "$textColor-primary",
    light: {
      [`backgroundColor-menu-${hr}`]: "$color-surface-50",
      [`backgroundColor-item-${hr}--hover`]: "$color-surface-100",
      [`backgroundColor-item-${hr}--active`]: "$color-surface-200"
    },
    dark: {
      [`backgroundColor-menu-${hr}`]: "$color-surface-950",
      [`backgroundColor-item-${hr}--hover`]: "$color-surface-600",
      [`backgroundColor-item-${hr}--active`]: "$color-surface-700"
    }
  }
}), _p = `'{"backgroundColor-DropdownMenu": "var(--xmlui-backgroundColor-DropdownMenu)", "borderRadius-DropdownMenu": "var(--xmlui-borderRadius-DropdownMenu)", "boxShadow-DropdownMenu": "var(--xmlui-boxShadow-DropdownMenu)", "borderColor-DropdownMenu-content": "var(--xmlui-borderColor-DropdownMenu-content)", "borderWidth-DropdownMenu-content": "var(--xmlui-borderWidth-DropdownMenu-content)", "borderStyle-DropdownMenu-content": "var(--xmlui-borderStyle-DropdownMenu-content)", "minWidth-DropdownMenu": "var(--xmlui-minWidth-DropdownMenu)", "backgroundColor-MenuItem": "var(--xmlui-backgroundColor-MenuItem)", "color-MenuItem": "var(--xmlui-color-MenuItem)", "fontFamily-MenuItem": "var(--xmlui-fontFamily-MenuItem)", "gap-MenuItem": "var(--xmlui-gap-MenuItem)", "fontSize-MenuItem": "var(--xmlui-fontSize-MenuItem)", "paddingVertical-MenuItem": "var(--xmlui-paddingVertical-MenuItem)", "paddingHorizontal-MenuItem": "var(--xmlui-paddingHorizontal-MenuItem)", "backgroundColor-MenuItem--hover": "var(--xmlui-backgroundColor-MenuItem--hover)", "backgroundColor-MenuItem--active": "var(--xmlui-backgroundColor-MenuItem--active)", "backgroundColor-MenuItem--active--hover": "var(--xmlui-backgroundColor-MenuItem--active--hover)", "color-MenuItem--hover": "var(--xmlui-color-MenuItem--hover)", "color-MenuItem--active": "var(--xmlui-color-MenuItem--active)", "color-MenuItem--active--hover": "var(--xmlui-color-MenuItem--active--hover)", "marginTop-MenuSeparator": "var(--xmlui-marginTop-MenuSeparator)", "marginBottom-MenuSeparator": "var(--xmlui-marginBottom-MenuSeparator)", "width-MenuSeparator": "var(--xmlui-width-MenuSeparator)", "height-MenuSeparator": "var(--xmlui-height-MenuSeparator)", "color-MenuSeparator": "var(--xmlui-color-MenuSeparator)"}'`, Ap = "_DropdownMenuContent_28w8e_13", Np = "_DropdownMenuItem_28w8e_26", Wp = "_active_28w8e_50", Op = "_wrapper_28w8e_60", Wt = {
  themeVars: _p,
  DropdownMenuContent: Ap,
  DropdownMenuItem: Np,
  active: Wp,
  wrapper: Op
}, Qr = {
  alignment: "start",
  triggerButtonVariant: "ghost",
  triggerButtonThemeColor: "primary",
  triggerButtonIcon: "chevrondown",
  triggerButtonIconPosition: "end"
};
xe(function({
  triggerTemplate: r,
  children: t,
  label: o,
  registerComponentApi: a,
  style: n,
  onWillOpen: i,
  alignment: l = Qr.alignment,
  disabled: s = !1,
  triggerButtonVariant: f = Qr.triggerButtonVariant,
  triggerButtonThemeColor: h = Qr.triggerButtonThemeColor,
  triggerButtonIcon: c = Qr.triggerButtonIcon,
  triggerButtonIconPosition: T = Qr.triggerButtonIconPosition
}, b) {
  const { root: v } = dt(), [y, w] = me(!1);
  return K(() => {
    a == null || a({
      close: () => w(!1)
    });
  }, [a]), /* @__PURE__ */ j(
    nt.Root,
    {
      open: y,
      onOpenChange: async (_) => {
        _ && await (i == null ? void 0 : i()) === !1 || w(_);
      },
      children: [
        /* @__PURE__ */ p(nt.Trigger, { asChild: !0, disabled: s, ref: b, children: r || /* @__PURE__ */ p(
          dr,
          {
            icon: /* @__PURE__ */ p(ye, { name: c }),
            iconPosition: T,
            type: "button",
            variant: f,
            themeColor: h,
            disabled: s,
            children: o
          }
        ) }),
        /* @__PURE__ */ p(nt.Portal, { container: v, children: /* @__PURE__ */ p(
          nt.Content,
          {
            align: l,
            style: n,
            className: Wt.DropdownMenuContent,
            children: t
          }
        ) })
      ]
    }
  );
});
const ra = {
  iconPosition: "start",
  active: !1
};
xe(function({
  children: r,
  onClick: t = de,
  label: o,
  style: a,
  icon: n,
  iconPosition: i = ra.iconPosition,
  active: l = ra.active
}, s) {
  const f = i === "start";
  return /* @__PURE__ */ j(
    nt.Item,
    {
      style: a,
      className: le(Wt.DropdownMenuItem, {
        [Wt.active]: l
      }),
      onClick: (h) => {
        h.stopPropagation(), t(h);
      },
      ref: s,
      children: [
        f && n,
        /* @__PURE__ */ p("div", { className: Wt.wrapper, children: o ?? r }),
        !f && n
      ]
    }
  );
});
const Yr = "DropdownMenu", Rp = C({
  description: "This component represents a dropdown menu with a trigger. When the user clicks the trigger, the dropdown menu displays its items.",
  props: {
    label: Fe(),
    triggerTemplate: Yn(Yr),
    alignment: {
      description: "This property allows you to determine the alignment of the dropdown panel with the displayed menu items.",
      valueType: "string",
      availableValues: Dn,
      defaultValue: Qr.alignment
    },
    enabled: Qe(),
    triggerButtonVariant: {
      description: "This property defines the theme variant of the `Button` as the dropdown menu's trigger. It has no effect when a custom trigger is defined with `triggerTemplate`.",
      valueType: "string",
      availableValues: ja,
      defaultValue: Qr.triggerButtonVariant
    },
    triggerButtonThemeColor: {
      description: "This property defines the theme color of the `Button` as the dropdown menu's trigger. It has no effect when a custom trigger is defined with `triggerTemplate`.",
      valueType: "string",
      availableValues: Za,
      defaultValue: Qr.triggerButtonThemeColor
    },
    triggerButtonIcon: {
      description: "This property defines the icon to display on the trigger button.",
      defaultValue: Qr.triggerButtonIcon,
      valueType: "string"
    },
    triggerButtonIconPosition: {
      description: "This property defines the position of the icon on the trigger button.",
      defaultValue: Qr.triggerButtonIconPosition,
      valueType: "string",
      availableValues: Ja
    }
  },
  events: {
    willOpen: u(`This event fires when the \`${Yr}\` component is opened.`)
  },
  apis: {
    close: u("This method command closes the dropdown.")
  },
  themeVars: Z(Wt.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${Yr}`]: "$backgroundColor-primary",
    [`minWidth-${Yr}`]: "160px",
    [`boxShadow-${Yr}`]: "$boxShadow-xl",
    [`borderStyle-${Yr}-content`]: "solid",
    [`borderRadius-${Yr}`]: "$borderRadius"
  }
}), wr = "MenuItem", zp = C({
  description: "This property represents a leaf item in a menu hierarchy. Clicking the item triggers an action.",
  docFolder: Yr,
  props: {
    iconPosition: {
      description: "This property allows you to determine the position of the icon displayed in the menu item.",
      valueType: "string",
      availableValues: Ja,
      defaultValue: ra.iconPosition
    },
    icon: {
      description: "This property names an optional icon to display with the menu item.",
      valueType: "string"
    },
    label: Fe(),
    to: {
      description: "This property defines the URL of the menu item. If this property is defined (and the `click` event does not have an event handler), clicking the menu item navigates to this link.",
      valueType: "string"
    },
    active: {
      description: "This property indicates if the specified menu item is active.",
      valueType: "boolean",
      defaultValue: ra.active
    }
  },
  events: {
    click: po(wr)
  },
  themeVars: Z(Wt.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${wr}`]: "$backgroundColor-dropdown-item",
    [`color-${wr}`]: "$textColor-primary",
    [`fontFamily-${wr}`]: "$fontFamily",
    [`fontSize-${wr}`]: "$fontSize-small",
    [`paddingVertical-${wr}`]: "$space-2",
    [`paddingHorizontal-${wr}`]: "$space-3",
    [`backgroundColor-${wr}--hover`]: "$backgroundColor-dropdown-item--hover",
    [`color-${wr}--hover`]: "inherit",
    [`gap-${wr}`]: "$space-2",
    [`color-${wr}--active`]: "$color-primary",
    [`backgroundColor-${wr}--active`]: "$backgroundColor-dropdown-item--active",
    light: {},
    dark: {}
  }
}), Vp = "SubMenuItem", Ep = C({
  description: "This component represents a nested menu item within another menu or menu item.",
  docFolder: Yr,
  props: {
    label: Fe(),
    triggerTemplate: Yn(Vp)
  }
}), Ut = "MenuSeparator", Dp = C({
  description: "This component displays a separator line between menu items.",
  docFolder: Yr,
  themeVars: Z(Wt.themeVars),
  defaultThemeVars: {
    [`marginTop-${Ut}`]: "$space-1",
    [`marginBottom-${Ut}`]: "$space-1",
    [`width-${Ut}`]: "100%",
    [`height-${Ut}`]: "1px",
    [`color-${Ut}`]: "$borderColor-dropdown-item",
    [`marginHorizontal-${Ut}`]: "12px"
  }
}), Pp = "EmojiSelector", Mp = C({
  status: "experimental",
  description: `The \`${Pp}\` component provides users with a graphical interface to browse, search and select emojis to insert into text fields, messages, or other forms of communication.`,
  props: {
    autoFocus: rr()
  },
  events: {
    select: u("This event is fired when the user selects an emoticon from this component.")
  }
}), Fp = '"[]"', qp = "_container_1hin1_13", Up = "_buttonStart_1hin1_22", Gp = "_buttonEnd_1hin1_26", Yp = "_textBoxWrapper_1hin1_30", Xp = "_button_1hin1_22", ro = {
  themeVars: Fp,
  container: qp,
  buttonStart: Up,
  buttonEnd: Gp,
  textBoxWrapper: Yp,
  button: Xp
}, { useDropzone: Qp } = dd, Zp = ({
  id: e,
  enabled: r = !0,
  style: t,
  placeholder: o,
  buttonPosition: a = "end",
  buttonLabel: n = "Browse",
  buttonIcon: i,
  buttonIconPosition: l,
  variant: s,
  buttonThemeColor: f,
  buttonSize: h,
  autoFocus: c,
  validationStatus: T,
  updateState: b = de,
  onDidChange: v = de,
  onFocus: y = de,
  onBlur: w = de,
  registerComponentApi: _,
  value: H,
  initialValue: $,
  acceptsFileType: O,
  multiple: F = !1,
  directory: Y = !1,
  label: V,
  labelPosition: R,
  labelWidth: W,
  labelBreak: z,
  required: x
}) => {
  const m = $i($) ? $ : void 0, g = $i(H) ? H : void 0, k = he(null), A = typeof O == "string" ? O : O == null ? void 0 : O.join(",");
  K(() => {
    c && setTimeout(() => {
      var G;
      (G = k.current) == null || G.focus();
    }, 0);
  }, [c]), K(() => {
    b({ value: m }, { initial: !0 });
  }, [m, b]);
  const q = X(() => {
    w == null || w();
  }, [w]), E = X(() => {
    var G;
    (G = k.current) == null || G.focus();
  }, []), N = X(
    (G) => {
      G.length && (b({ value: G }), v(G));
    },
    [b, v]
  ), { getRootProps: B, getInputProps: D, open: P } = Qp({
    disabled: !r,
    multiple: F || Y,
    onDrop: N,
    noClick: !0,
    noKeyboard: !0,
    noDragEventsBubbling: !0,
    useFsAccessApi: Y === !1
  }), I = X(() => {
    y == null || y();
  }, [y]), M = $e(() => {
    P();
  });
  return K(() => {
    _ == null || _({
      focus: E,
      open: M
    });
  }, [E, M, _]), /* @__PURE__ */ p(
    Ir,
    {
      labelPosition: R,
      label: V,
      labelWidth: W,
      labelBreak: z,
      required: x,
      enabled: r,
      onFocus: y,
      onBlur: w,
      style: t,
      children: /* @__PURE__ */ j(
        "div",
        {
          className: le(ro.container, {
            [ro.buttonStart]: a === "start",
            [ro.buttonEnd]: a === "end"
          }),
          children: [
            /* @__PURE__ */ j(
              "button",
              {
                ...B({
                  tabIndex: 0,
                  onFocus: I,
                  onBlur: q,
                  disabled: !r,
                  className: ro.textBoxWrapper,
                  onClick: P,
                  ref: k,
                  type: "button"
                }),
                children: [
                  /* @__PURE__ */ p(sd.Root, { children: /* @__PURE__ */ p(
                    "input",
                    {
                      ...D({
                        webkitdirectory: Y ? "true" : void 0
                      }),
                      accept: A
                    }
                  ) }),
                  /* @__PURE__ */ p(
                    Ra,
                    {
                      placeholder: o,
                      enabled: r,
                      value: (g == null ? void 0 : g.map((G) => G.name).join(", ")) || "",
                      validationStatus: T,
                      readOnly: !0,
                      tabIndex: -1
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ p(
              dr,
              {
                id: e,
                disabled: !r,
                type: "button",
                onClick: P,
                icon: i,
                iconPosition: l,
                variant: s,
                themeColor: f,
                size: h,
                className: ro.button,
                autoFocus: c,
                children: n
              }
            )
          ]
        }
      )
    }
  );
};
function jp(e) {
  return e instanceof File;
}
function $i(e) {
  return Array.isArray(e) && e.every(jp);
}
const It = "FileInput", Jp = C({
  description: `The \`${It}\` is a user interface component that allows users to select files from their device's file system for upload (or processing its content otherwise).`,
  status: "experimental",
  props: {
    placeholder: Vt(),
    initialValue: Cr(),
    autoFocus: rr(),
    required: Ar(),
    readOnly: Lr(),
    enabled: Qe(),
    validationStatus: _r(),
    label: Fe(),
    labelPosition: Dr("top"),
    labelWidth: jr(It),
    labelBreak: Jr(It),
    buttonVariant: u("The button variant to use", ns),
    buttonLabel: u("This property is an optional string to set a label for the button part."),
    buttonIcon: u("The ID of the icon to display in the button"),
    buttonIconPosition: u(
      "This optional string determines the location of the button icon.",
      ds
    ),
    acceptsFileType: u(
      "A list of file types the input controls accepts provided as a string array."
    ),
    multiple: u(
      "This boolean property enables to add not just one (`false`), but multiple files to the field (`true`). This is done either by dragging onto the field or by selecting multiple files in the browser menu after clicking the input field button.",
      null,
      "boolean",
      !1
    ),
    directory: u(
      "This boolean property indicates whether the component allows selecting directories (`true`) or files only (`false`).",
      null,
      "boolean",
      !1
    ),
    buttonPosition: u(
      'This property determines the position of the button relative to the input field. The default is "end".',
      ["start", "end"]
    ),
    buttonSize: u("The size of the button (small, medium, large)", Qa),
    buttonThemeColor: u(
      "The button color scheme (primary, secondary, attention)",
      os
    )
  },
  events: {
    didChange: er(It),
    gotFocus: Tr(It),
    lostFocus: yr(It)
  },
  apis: {
    value: u(
      "By setting an ID for the component, you can refer to the value of the field if set. If no value is set, the value will be undefined."
    ),
    setValue: u(
      "(**NOT IMPLEMENTED YET**) You can use this method to set the component's current value programmatically."
    ),
    focus: et(It),
    open: u("This API command triggers the file browsing dialog to open.")
  },
  themeVars: Z(ro.themeVars)
}), Kp = `'{"backgroundColor-FileUploadDropZone": "var(--xmlui-backgroundColor-FileUploadDropZone)", "color-FileUploadDropZone": "var(--xmlui-color-FileUploadDropZone)", "backgroundColor-dropping-FileUploadDropZone": "var(--xmlui-backgroundColor-dropping-FileUploadDropZone)", "opacity-dropping-FileUploadDropZone": "var(--xmlui-opacity-dropping-FileUploadDropZone)"}'`, eh = {
  themeVars: Kp
}, rh = "FileUploadDropZone", th = C({
  description: `The \`${rh}\` component allows users to upload files to a web application by dragging and dropping files from their local file system onto a designated area within the UI.`,
  props: {
    text: {
      description: "With this property, you can change the default text to display when files are dragged over the drop zone.",
      defaultValue: "Drop files here",
      type: "string"
    },
    allowPaste: {
      description: "This property indicates if the drop zone accepts files pasted from the clipboard (`true`) or only dragged files (`false`).",
      type: "boolean",
      defaultValue: !0
    },
    enabled: u(
      "If set to `false`, the drop zone will be disabled and users will not be able to upload files.",
      null,
      "boolean",
      !0
    )
  },
  events: {
    upload: u(
      "This component accepts files for upload but does not perform the actual operation. It fires the `upload` event and passes the list files to upload in the method's argument. You can use the passed file information to implement the upload (according to the protocol your backend supports)."
    )
  },
  themeVars: Z(eh.themeVars),
  defaultThemeVars: {
    "backgroundColor-FileUploadDropZone": "$backgroundColor",
    "backgroundColor-dropping-FileUploadDropZone": "$backgroundColor--selected",
    "opacity-dropping-FileUploadDropZone": "0.5",
    "color-FileUploadDropZone": "$textColor",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), oh = '"[]"', ah = "_outer_aarhe_13", ih = "_flowContainer_aarhe_17", nh = "_horizontal_aarhe_21", lh = "_flowItem_aarhe_24", dh = "_forceBreak_aarhe_47", sh = "_starSized_aarhe_47", yt = {
  themeVars: oh,
  outer: ah,
  flowContainer: ih,
  horizontal: nh,
  flowItem: lh,
  break: "_break_aarhe_47",
  forceBreak: dh,
  starSized: sh
}, uh = "xmlui", ch = /(\$[a-zA-Z][a-zA-Z0-9-_]*)/g, mh = /^(true|false)$/, ma = /^\d*\*$/, ph = {
  cssProps: {},
  issues: /* @__PURE__ */ new Set()
};
function hh(e = Ot, r) {
  const t = {
    cssProps: {},
    issues: /* @__PURE__ */ new Set()
  };
  H(r) && (t.cssProps.flexShrink = 0), v("width");
  const o = y(t.cssProps.width, r);
  o !== null && (t.cssProps.flex = o, t.cssProps.flexShrink = 1), v("minWidth"), v("maxWidth"), v("height");
  const a = w(t.cssProps.height, r);
  a !== null && (t.cssProps.flex = a, t.cssProps.flexShrink = 1), v("minHeight"), v("maxHeight"), v("top"), v("right"), v("bottom"), v("left"), v("gap"), v("padding");
  const n = b("paddingHorizontal");
  n && (t.cssProps.paddingLeft = n, t.cssProps.paddingRight = n), v("paddingRight"), v("paddingLeft");
  const i = b("paddingVertical");
  i && (t.cssProps.paddingTop = i, t.cssProps.paddingBottom = i), v("paddingTop"), v("paddingBottom"), v("margin");
  const l = b("marginHorizontal");
  l && (t.cssProps.marginLeft = l, t.cssProps.marginRight = l), v("marginRight"), v("marginLeft");
  const s = b("marginVertical");
  s && (t.cssProps.marginTop = s, t.cssProps.marginBottom = s), v("marginTop"), v("marginBottom"), v("border");
  const f = b("borderHorizontal");
  f && (t.cssProps.borderLeft = f, t.cssProps.borderRight = f), v("borderRight"), v("borderLeft");
  const h = b("borderVertical");
  h && (t.cssProps.borderTop = h, t.cssProps.borderBottom = h), v("borderTop"), v("borderBottom"), v("borderColor"), v("borderStyle"), v("borderWidth"), v("borderRadius"), v("radiusTopLeft", "borderTopLeftRadius"), v("radiusTopRight", "borderTopRightRadius"), v("radiusBottomLeft", "borderBottomLeftRadius"), v("radiusBottomRight", "borderBottomRightRadius"), v("color"), v("fontFamily"), v("fontSize"), v("fontWeight"), v("fontStyle"), v("textDecoration"), v("textDecorationLine"), v("textDecorationColor"), v("textDecorationStyle"), v("textDecorationThickness"), v("textUnderlineOffset"), v("userSelect"), v("letterSpacing"), v("textTransform"), v("lineHeight"), v("textAlign"), v("textAlignLast"), v("textWrap"), v("backgroundColor"), v("background"), v("boxShadow"), v("direction"), v("overflowX"), v("overflowY"), v("zIndex"), v("opacity"), v("zoom"), v("cursor"), v("whiteSpace"), v("outline"), v("outlineWidth"), v("outlineColor"), v("outlineStyle"), v("outlineOffset");
  const c = b("wrapContent");
  c && (t.cssProps.flexWrap = c === "true" ? "wrap" : "nowrap"), v("canShrink", "flexShrink");
  const T = b("canShrink");
  if (T && (t.cssProps.flexShrink = T === "true" ? 1 : 0), $a(t.cssProps) && $a(t.issues))
    return ph;
  return t;
  function b($) {
    var Y, V;
    const O = F();
    if (((Y = r == null ? void 0 : r.mediaSize) == null ? void 0 : Y.sizeIndex) !== void 0) {
      const R = (V = r.mediaSize) == null ? void 0 : V.sizeIndex, W = F("xs"), z = F("sm"), x = F("md"), m = F("lg"), g = F("xl"), k = F("xxl");
      let A;
      switch (R) {
        case 0:
          A = W ?? z ?? x;
          break;
        case 1:
          A = z ?? x;
          break;
        case 2:
          A = x;
          break;
        case 3:
          A = m;
          break;
        case 4:
          A = g ?? m;
          break;
        case 5:
          A = k ?? g ?? m;
          break;
      }
      return A ?? O;
    }
    return O;
    function F(R = "") {
      const W = R ? `${$}-${R}` : $;
      let z = e[W];
      if (z == null)
        return;
      typeof z == "string" ? z = z.trim() : z = z.toString();
      const x = z ? z.replace(
        ch,
        (g) => xh(g.trim())
      ) : void 0;
      if (z !== x)
        return x;
      const m = bh[$];
      if (!m || m.length === 0)
        return x;
      for (const g of m)
        if (g.test(x))
          return x;
      return t.issues.add(W), x;
    }
  }
  function v($, O = "") {
    const F = b($);
    F && (t.cssProps[O || $] = F);
  }
  function y($, O) {
    return $ && H(O) === "horizontal" && ma.test($.toString()) ? _($.toString()) : null;
  }
  function w($, O) {
    return $ && H(O) === "vertical" && ma.test($.toString()) ? _($.toString()) : null;
  }
  function _($) {
    if (ma.test($)) {
      const O = $.slice(0, -1);
      return O === "" ? 1 : parseInt(O, 10);
    }
    return null;
  }
  function H($) {
    if (!$) return;
    let O = ($ == null ? void 0 : $.type) === "Stack" && ($ == null ? void 0 : $.orientation);
    return O == null ? void 0 : O.toString();
  }
}
function xh(e) {
  return `var(--${uh}-${e.substring(1)})`;
}
const bh = {
  // --- Dimensions
  width: [],
  minWidth: [],
  maxWidth: [],
  height: [],
  minHeight: [],
  maxHeight: [],
  gap: [],
  // --- Positions
  top: [],
  right: [],
  bottom: [],
  left: [],
  // --- Border
  border: [],
  borderTop: [],
  borderRight: [],
  borderBottom: [],
  borderLeft: [],
  borderColor: [],
  borderStyle: [],
  borderWidth: [],
  borderHorizontal: [],
  borderVertical: [],
  // --- Border radius
  borderRadius: [],
  radiusTopLeft: [],
  radiusTopRight: [],
  radiusBottomLeft: [],
  radiusBottomRight: [],
  // --- Padding
  padding: [],
  paddingHorizontal: [],
  paddingVertical: [],
  paddingTop: [],
  paddingRight: [],
  paddingBottom: [],
  paddingLeft: [],
  // --- Margin
  margin: [],
  marginHorizontal: [],
  marginVertical: [],
  marginTop: [],
  marginRight: [],
  marginBottom: [],
  marginLeft: [],
  // --- Other
  backgroundColor: [],
  background: [],
  boxShadow: [],
  direction: [],
  overflowX: [],
  overflowY: [],
  zIndex: [],
  opacity: [],
  // --- Typography
  color: [],
  fontFamily: [],
  fontSize: [],
  fontWeight: [],
  fontStyle: [mh],
  textDecoration: [],
  userSelect: [],
  letterSpacing: [],
  textTransform: [],
  lineHeight: [],
  textAlign: [],
  textWrap: [],
  textAlignLast: [],
  // --- Content rendering
  wrapContent: [],
  canShrink: [],
  // --- Other
  cursor: [],
  zoom: [],
  whiteSpace: [],
  textDecorationLine: [],
  textDecorationColor: [],
  textDecorationStyle: [],
  textDecorationThickness: [],
  textUnderlineOffset: [],
  // --- Outline
  outline: [],
  outlineWidth: [],
  outlineColor: [],
  outlineStyle: [],
  outlineOffset: []
}, pa = {}, il = Zr({
  rowGap: 0,
  columnGap: 0,
  setNumberOfChildren: La
}), fh = ({ force: e }) => /* @__PURE__ */ p("div", { className: le(yt.break, { [yt.forceBreak]: e }) });
xe(function({ children: r, forceBreak: t, ...o }, a) {
  const { rowGap: n, columnGap: i, setNumberOfChildren: l } = $r(il);
  $o(() => (l((R) => R + 1), () => {
    l((R) => R - 1);
  }), [l]);
  const { activeTheme: s, root: f } = dt(), h = o.width || "100%", c = o.minWidth || void 0, T = o.maxWidth || void 0, {
    width: b = h,
    minWidth: v,
    maxWidth: y,
    flex: w
  } = ue(() => (
    // --- New layout resolution
    hh(
      { width: h, maxWidth: T, minWidth: c },
      {
        type: "Stack",
        orientation: "horizontal"
      }
    ).cssProps || {}
  ), [T, c, h, s.themeVars]), _ = ue(() => {
    if (b && typeof b == "string" && b.startsWith("var(")) {
      if (!pa[b]) {
        const R = b.substring(4, b.length - 1), W = getComputedStyle(f).getPropertyValue(R);
        pa[b] = W || h;
      }
      return pa[b];
    }
    return b || h;
  }, [h, f, b]), H = typeof _ == "string" && _.endsWith("%"), $ = Gu(i), O = ki("(max-width: 420px)"), F = ki("(max-width: 800px)"), Y = {
    minWidth: v,
    maxWidth: y,
    width: H ? `min(${b} * ${O ? "8" : F ? "4" : "1"}, 100%)` : `min(calc(${b} + ${$}), 100%)`,
    paddingBottom: n,
    flex: w
  }, V = w !== void 0;
  return V && (Y.width = "100%", Y.minWidth = v || "1px"), /* @__PURE__ */ j(gr, { children: [
    /* @__PURE__ */ p(
      "div",
      {
        style: { ...Y, paddingRight: $ },
        className: le(yt.flowItem, {
          [yt.starSized]: V
        }),
        ref: a,
        children: r
      }
    ),
    V && /* @__PURE__ */ p(fh, {})
  ] });
});
const Li = {
  columnGap: "$gap-normal",
  rowGap: "$gap-normal"
};
xe(function({ style: r, columnGap: t = 0, rowGap: o = 0, children: a }, n) {
  const [i, l] = me(0), s = i === 1 ? 0 : t, f = wi(o), h = wi(s), c = ue(
    () => ({
      // We put a negative margin on the container to fill the space for the row's last columnGap
      marginRight: `calc(-1 * ${h})`,
      marginBottom: `calc(-1 * ${f})`
    }),
    [h, f]
  ), T = ue(() => ({
    rowGap: f,
    columnGap: h,
    setNumberOfChildren: l
  }), [h, f]);
  return /* @__PURE__ */ p(il.Provider, { value: T, children: /* @__PURE__ */ p("div", { style: r, ref: n, children: /* @__PURE__ */ p("div", { className: yt.outer, children: /* @__PURE__ */ p("div", { className: le(yt.flowContainer, yt.horizontal), style: c, children: a }) }) }) });
});
const _i = "FlowLayout", vh = C({
  description: "This layout component is used to position content in rows with an auto wrapping feature: if the length of the items exceed the available space the layout will wrap into a new line.",
  props: {
    gap: {
      description: `This property defines the gap between items in the same row and between rows. The ${_i} component creates a new row when an item is about to overflow the current row.`,
      type: "string",
      defaultValue: "$gap-normal"
    },
    columnGap: {
      description: "The `columnGap` property specifies the space between items in a single row; it overrides the `gap` value.",
      defaultValue: Li.columnGap
    },
    rowGap: {
      description: `The \`rowGap\` property specifies the space between the ${_i} rows; it overrides the \`gap\` value.`,
      defaultValue: Li.rowGap
    }
  },
  themeVars: Z(yt.themeVars)
}), gh = `'{"padding-Footer": "var(--xmlui-padding-Footer)", "paddingHorizontal-Footer": "var(--xmlui-paddingHorizontal-Footer, var(--xmlui-padding-Footer))", "paddingVertical-Footer": "var(--xmlui-paddingVertical-Footer, var(--xmlui-padding-Footer))", "paddingLeft-Footer": "var(--xmlui-paddingLeft-Footer, var(--xmlui-paddingHorizontal-Footer, var(--xmlui-padding-Footer)))", "paddingRight-Footer": "var(--xmlui-paddingRight-Footer, var(--xmlui-paddingHorizontal-Footer, var(--xmlui-padding-Footer)))", "paddingTop-Footer": "var(--xmlui-paddingTop-Footer, var(--xmlui-paddingVertical-Footer, var(--xmlui-padding-Footer)))", "paddingBottom-Footer": "var(--xmlui-paddingBottom-Footer, var(--xmlui-paddingVertical-Footer, var(--xmlui-padding-Footer)))", "border-Footer": "var(--xmlui-border-Footer)", "borderHorizontal-Footer": "var(--xmlui-borderHorizontal-Footer, var(--xmlui-border-Footer))", "borderVertical-Footer": "var(--xmlui-borderVertical-Footer, var(--xmlui-border-Footer))", "borderLeft-Footer": "var(--xmlui-borderLeft-Footer, var(--xmlui-borderHorizontal-Footer, var(--xmlui-border-Footer)))", "borderRight-Footer": "var(--xmlui-borderRight-Footer, var(--xmlui-borderHorizontal-Footer, var(--xmlui-border-Footer)))", "borderTop-Footer": "var(--xmlui-borderTop-Footer, var(--xmlui-borderVertical-Footer, var(--xmlui-border-Footer)))", "borderBottom-Footer": "var(--xmlui-borderBottom-Footer, var(--xmlui-borderVertical-Footer, var(--xmlui-border-Footer)))", "borderWidth-Footer": "var(--xmlui-borderWidth-Footer)", "borderHorizontalWidth-Footer": "var(--xmlui-borderHorizontalWidth-Footer, var(--xmlui-borderWidth-Footer))", "borderLeftWidth-Footer": "var(--xmlui-borderLeftWidth-Footer, var(--xmlui-borderHorizontalWidth-Footer, var(--xmlui-borderWidth-Footer)))", "borderRightWidth-Footer": "var(--xmlui-borderRightWidth-Footer, var(--xmlui-borderHorizontalWidth-Footer, var(--xmlui-borderWidth-Footer)))", "borderVerticalWidth-Footer": "var(--xmlui-borderVerticalWidth-Footer, var(--xmlui-borderWidth-Footer))", "borderTopWidth-Footer": "var(--xmlui-borderTopWidth-Footer, var(--xmlui-borderVerticalWidth-Footer, var(--xmlui-borderWidth-Footer)))", "borderBottomWidth-Footer": "var(--xmlui-borderBottomWidth-Footer, var(--xmlui-borderVerticalWidth-Footer, var(--xmlui-borderWidth-Footer)))", "borderStyle-Footer": "var(--xmlui-borderStyle-Footer)", "borderHorizontalStyle-Footer": "var(--xmlui-borderHorizontalStyle-Footer, var(--xmlui-borderStyle-Footer))", "borderLeftStyle-Footer": "var(--xmlui-borderLeftStyle-Footer, var(--xmlui-borderHorizontalStyle-Footer, var(--xmlui-borderStyle-Footer)))", "borderRightStyle-Footer": "var(--xmlui-borderRightStyle-Footer, var(--xmlui-borderHorizontalStyle-Footer, var(--xmlui-borderStyle-Footer)))", "borderVerticalStyle-Footer": "var(--xmlui-borderVerticalStyle-Footer, var(--xmlui-borderStyle-Footer))", "borderTopStyle-Footer": "var(--xmlui-borderTopStyle-Footer, var(--xmlui-borderVerticalStyle-Footer, var(--xmlui-borderStyle-Footer)))", "borderBottomStyle-Footer": "var(--xmlui-borderBottomStyle-Footer, var(--xmlui-borderVerticalStyle-Footer, var(--xmlui-borderStyle-Footer)))", "borderColor-Footer": "var(--xmlui-borderColor-Footer)", "borderHorizontalColor-Footer": "var(--xmlui-borderHorizontalColor-Footer, var(--xmlui-borderColor-Footer))", "borderLeftColor-Footer": "var(--xmlui-borderLeftColor-Footer, var(--xmlui-borderHorizontalColor-Footer, var(--xmlui-borderColor-Footer)))", "borderRightColor-Footer": "var(--xmlui-borderRightColor-Footer, var(--xmlui-borderHorizontalColor-Footer, var(--xmlui-borderColor-Footer)))", "borderVerticalColor-Footer": "var(--xmlui-borderVerticalColor-Footer, var(--xmlui-borderColor-Footer))", "borderTopColor-Footer": "var(--xmlui-borderTopColor-Footer, var(--xmlui-borderVerticalColor-Footer, var(--xmlui-borderColor-Footer)))", "borderBottomColor-Footer": "var(--xmlui-borderBottomColor-Footer, var(--xmlui-borderVerticalColor-Footer, var(--xmlui-borderColor-Footer)))", "radius-start-start-Footer": "var(--xmlui-radius-start-start-Footer, var(--xmlui-borderRadius-Footer))", "radius-start-end-Footer": "var(--xmlui-radius-start-end-Footer, var(--xmlui-borderRadius-Footer))", "radius-end-start-Footer": "var(--xmlui-radius-end-start-Footer, var(--xmlui-borderRadius-Footer))", "radius-end-end-Footer": "var(--xmlui-radius-end-end-Footer, var(--xmlui-borderRadius-Footer))", "backgroundColor-Footer": "var(--xmlui-backgroundColor-Footer)", "color-Footer": "var(--xmlui-color-Footer)", "height-Footer": "var(--xmlui-height-Footer)", "fontSize-Footer": "var(--xmlui-fontSize-Footer)", "verticalAlign-Footer": "var(--xmlui-verticalAlign-Footer)", "maxWidth-content-Footer": "var(--xmlui-maxWidth-content-Footer)"}'`, Th = {
  themeVars: gh
}, ct = "Footer", yh = C({
  description: `The \`${ct}\` is a component that acts as a placeholder within \`App\`.`,
  themeVars: Z(Th.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${ct}`]: "$backgroundColor-AppHeader",
    [`verticalAlign-${ct}`]: "center",
    [`fontSize-${ct}`]: "$fontSize-small",
    [`color-${ct}`]: "$textColor-secondary",
    [`maxWidth-content-${ct}`]: "$maxWidth-content",
    [`border-${ct}`]: "1px solid $borderColor",
    [`padding-${ct}`]: "$space-2 $space-4",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), Ch = `'{"gap-Form": "var(--xmlui-gap-Form)", "gap-buttonRow-Form": "var(--xmlui-gap-buttonRow-Form)"}'`, kh = "_wrapper_wscb6_13", Sh = "_buttonRow_wscb6_19", Da = {
  themeVars: Ch,
  wrapper: kh,
  buttonRow: Sh
};
var vr = /* @__PURE__ */ ((e) => (e.FIELD_LOST_FOCUS = "FormActionKind:FIELD_LOST_FOCUS", e.FIELD_VALUE_CHANGED = "FormActionKind:FIELD_VALUE_CHANGED", e.FIELD_FOCUSED = "FormActionKind:FIELD_FOCUSED", e.FIELD_VALIDATED = "FormActionKind:FIELD_VALIDATED", e.FIELD_INITIALIZED = "FormActionKind:FIELD_INITIALIZED", e.FIELD_REMOVED = "FormActionKind:FIELD_REMOVED", e.TRIED_TO_SUBMIT = "FormActionKind:TRIED_TO_SUBMIT", e.BACKEND_VALIDATION_ARRIVED = "FormActionKind:BACKEND_VALIDATION_ARRIVED", e.SUBMITTING = "FormActionKind:SUBMITTING", e.SUBMITTED = "FormActionKind:SUBMITTED", e.RESET = "FormActionKind:RESET", e))(vr || {});
function wh(e, r) {
  return {
    type: "FormActionKind:FIELD_INITIALIZED",
    payload: {
      uid: e,
      value: r
    }
  };
}
function Hh(e, r) {
  return {
    type: "FormActionKind:FIELD_VALUE_CHANGED",
    payload: {
      uid: e,
      value: r
    }
  };
}
function Bh(e) {
  return {
    type: "FormActionKind:FIELD_FOCUSED",
    payload: {
      uid: e
    }
  };
}
function Ih(e) {
  return {
    type: "FormActionKind:FIELD_LOST_FOCUS",
    payload: {
      uid: e
    }
  };
}
function Ai(e, r) {
  return {
    type: "FormActionKind:FIELD_VALIDATED",
    payload: {
      uid: e,
      validationResult: r
    }
  };
}
function $h(e) {
  return {
    type: "FormActionKind:FIELD_REMOVED",
    payload: {
      uid: e
    }
  };
}
function Lh() {
  return {
    type: "FormActionKind:TRIED_TO_SUBMIT",
    payload: {}
  };
}
function _h() {
  return {
    type: "FormActionKind:SUBMITTING",
    payload: {}
  };
}
function Ah() {
  return {
    type: "FormActionKind:SUBMITTED",
    payload: {}
  };
}
function Nh(e) {
  return {
    type: "FormActionKind:RESET",
    payload: {
      originalSubject: e
    }
  };
}
function Wh({ generalValidationResults: e = [], fieldValidationResults: r = {} }) {
  return {
    type: "FormActionKind:BACKEND_VALIDATION_ARRIVED",
    payload: {
      generalValidationResults: e,
      fieldValidationResults: r
    }
  };
}
const Oh = `'{"padding-ModalDialog": "var(--xmlui-padding-ModalDialog)", "paddingHorizontal-ModalDialog": "var(--xmlui-paddingHorizontal-ModalDialog, var(--xmlui-padding-ModalDialog))", "paddingVertical-ModalDialog": "var(--xmlui-paddingVertical-ModalDialog, var(--xmlui-padding-ModalDialog))", "paddingLeft-ModalDialog": "var(--xmlui-paddingLeft-ModalDialog, var(--xmlui-paddingHorizontal-ModalDialog, var(--xmlui-padding-ModalDialog)))", "paddingRight-ModalDialog": "var(--xmlui-paddingRight-ModalDialog, var(--xmlui-paddingHorizontal-ModalDialog, var(--xmlui-padding-ModalDialog)))", "paddingTop-ModalDialog": "var(--xmlui-paddingTop-ModalDialog, var(--xmlui-paddingVertical-ModalDialog, var(--xmlui-padding-ModalDialog)))", "paddingBottom-ModalDialog": "var(--xmlui-paddingBottom-ModalDialog, var(--xmlui-paddingVertical-ModalDialog, var(--xmlui-padding-ModalDialog)))", "padding-overlay-ModalDialog": "var(--xmlui-padding-overlay-ModalDialog)", "paddingHorizontal-overlay-ModalDialog": "var(--xmlui-paddingHorizontal-overlay-ModalDialog, var(--xmlui-padding-overlay-ModalDialog))", "paddingVertical-overlay-ModalDialog": "var(--xmlui-paddingVertical-overlay-ModalDialog, var(--xmlui-padding-overlay-ModalDialog))", "paddingLeft-overlay-ModalDialog": "var(--xmlui-paddingLeft-overlay-ModalDialog, var(--xmlui-paddingHorizontal-overlay-ModalDialog, var(--xmlui-padding-overlay-ModalDialog)))", "paddingRight-overlay-ModalDialog": "var(--xmlui-paddingRight-overlay-ModalDialog, var(--xmlui-paddingHorizontal-overlay-ModalDialog, var(--xmlui-padding-overlay-ModalDialog)))", "paddingTop-overlay-ModalDialog": "var(--xmlui-paddingTop-overlay-ModalDialog, var(--xmlui-paddingVertical-overlay-ModalDialog, var(--xmlui-padding-overlay-ModalDialog)))", "paddingBottom-overlay-ModalDialog": "var(--xmlui-paddingBottom-overlay-ModalDialog, var(--xmlui-paddingVertical-overlay-ModalDialog, var(--xmlui-padding-overlay-ModalDialog)))", "Dialog:backgroundColor-ModalDialog": "var(--xmlui-backgroundColor-ModalDialog)", "Dialog:backgroundColor-overlay-ModalDialog": "var(--xmlui-backgroundColor-overlay-ModalDialog)", "Dialog:borderRadius-ModalDialog": "var(--xmlui-borderRadius-ModalDialog)", "Dialog:fontFamily-ModalDialog": "var(--xmlui-fontFamily-ModalDialog)", "Dialog:color-ModalDialog": "var(--xmlui-color-ModalDialog)", "Dialog:minWidth-ModalDialog": "var(--xmlui-minWidth-ModalDialog)", "Dialog:maxWidth-ModalDialog": "var(--xmlui-maxWidth-ModalDialog)", "Dialog:marginBottom-title-ModalDialog": "var(--xmlui-marginBottom-title-ModalDialog)"}'`, Rh = "_overlay_vt4tq_13", zh = "_fullScreen_vt4tq_21", Vh = "_content_vt4tq_27", Eh = "_overlayBg_vt4tq_36", Dh = "_dialogTitle_vt4tq_70", Ph = "_innerContent_vt4tq_76", Mh = "_closeButton_vt4tq_102", xt = {
  themeVars: Oh,
  overlay: Rh,
  fullScreen: zh,
  content: Vh,
  overlayBg: Eh,
  dialogTitle: Dh,
  innerContent: Ph,
  closeButton: Mh
}, nl = Ae.createContext(null), Fh = () => {
  const e = mo(), { registerForm: r, unRegisterForm: t, requestClose: o, amITheSingleForm: a } = $r(nl) || {};
  return K(() => {
    if (r)
      return r(e), () => {
        t == null || t(e);
      };
  }, [e, r, t]), X(() => {
    if (o && a(e))
      return o();
  }, [a, e, o]);
};
Ae.forwardRef(
  ({ isInitiallyOpen: e, onOpen: r, onClose: t, registerComponentApi: o, renderDialog: a }, n) => {
    const i = dl(e, r, t), { doOpen: l, doClose: s, isOpen: f, openParams: h } = i;
    return K(() => {
      o == null || o({
        open: l,
        close: s
      });
    }, [s, l, o]), f ? /* @__PURE__ */ p(ll.Provider, { value: i, children: a({
      openParams: h,
      ref: n
    }) }) : null;
  }
);
const ll = Ae.createContext(null);
function dl(e, r, t) {
  const [o, a] = me(e), n = he(!1), [i, l] = me(null), s = $e((...h) => {
    l(h), r == null || r(), a(!0);
  }), f = $e(async () => {
    if (!n.current)
      try {
        if (n.current = !0, await (t == null ? void 0 : t()) === !1)
          return;
      } finally {
        n.current = !1;
      }
    a(!1);
  });
  return ue(() => ({
    isOpen: o,
    doClose: f,
    doOpen: s,
    openParams: i
  }), [f, s, o, i]);
}
function qh(e = !0, r, t) {
  const o = $r(ll), a = dl(e, r, t);
  return o || a;
}
const sl = Ae.forwardRef(
  ({
    children: e,
    style: r,
    isInitiallyOpen: t,
    fullScreen: o,
    title: a,
    closeButtonVisible: n = !0,
    onOpen: i,
    onClose: l
  }, s) => {
    const { root: f } = dt(), h = he(null), c = s ? st(s, h) : h, { isOpen: T, doClose: b, doOpen: v } = qh(t, i, l);
    K(() => {
      var _;
      T && ((_ = h.current) == null || _.focus());
    }, [T]), K(() => {
      if (T) {
        const _ = setTimeout(() => {
          document.body.style.pointerEvents = "";
        }, 0);
        return () => clearTimeout(_);
      } else
        document.body.style.pointerEvents = "auto";
    }, [T]);
    const y = he(/* @__PURE__ */ new Set()), w = ue(() => ({
      registerForm: (_) => {
        y.current.add(_);
      },
      unRegisterForm: (_) => {
        y.current.delete(_);
      },
      amITheSingleForm: (_) => y.current.size === 1 && y.current.has(_),
      requestClose: () => b()
    }), [b]);
    return f ? /* @__PURE__ */ p(qt.Root, { open: T, onOpenChange: (_) => _ ? v() : b(), children: /* @__PURE__ */ j(qt.Portal, { container: f, children: [
      !o && /* @__PURE__ */ p("div", { className: xt.overlayBg }),
      /* @__PURE__ */ p(
        qt.Overlay,
        {
          className: le(xt.overlay, {
            [xt.fullScreen]: o
          }),
          children: /* @__PURE__ */ j(
            qt.Content,
            {
              className: le(xt.content),
              onPointerDownOutside: (_) => {
                _.target instanceof Element && _.target.closest("._debug-inspect-button") !== null && _.preventDefault();
              },
              ref: c,
              style: { ...r, gap: void 0 },
              children: [
                !!a && /* @__PURE__ */ p(qt.Title, { style: { marginTop: 0 }, children: /* @__PURE__ */ p("header", { id: "dialogTitle", className: xt.dialogTitle, children: a }) }),
                /* @__PURE__ */ p("div", { className: xt.innerContent, style: { gap: r == null ? void 0 : r.gap }, children: /* @__PURE__ */ p(nl.Provider, { value: w, children: e }) }),
                n && /* @__PURE__ */ p(qt.Close, { asChild: !0, children: /* @__PURE__ */ p(
                  dr,
                  {
                    variant: "ghost",
                    themeColor: "secondary",
                    className: xt.closeButton,
                    "aria-label": "Close",
                    icon: /* @__PURE__ */ p(ye, { name: "close", size: "sm" }),
                    orientation: "vertical"
                  }
                ) })
              ]
            }
          )
        }
      )
    ] }) }) : null;
  }
);
sl.displayName = "ModalDialog";
const ul = /* @__PURE__ */ new Set(), sr = /* @__PURE__ */ new WeakMap(), io = /* @__PURE__ */ new WeakMap(), Rt = /* @__PURE__ */ new WeakMap(), Pa = /* @__PURE__ */ new WeakMap(), Uh = /* @__PURE__ */ new WeakMap(), so = /* @__PURE__ */ new WeakMap(), ta = /* @__PURE__ */ new WeakMap(), So = /* @__PURE__ */ new WeakSet();
let zt;
const lt = "__aa_tgt", Ma = "__aa_del", Gh = (e) => {
  const r = jh(e);
  r && r.forEach((t) => Jh(t));
}, Yh = (e) => {
  e.forEach((r) => {
    r.target === zt && Qh(), sr.has(r.target) && Et(r.target);
  });
};
function Xh(e) {
  const r = Pa.get(e);
  r == null || r.disconnect();
  let t = sr.get(e), o = 0;
  const a = 5;
  t || (t = uo(e), sr.set(e, t));
  const { offsetWidth: n, offsetHeight: i } = zt, s = [
    t.top - a,
    n - (t.left + a + t.width),
    i - (t.top + a + t.height),
    t.left - a
  ].map((h) => `${-1 * Math.floor(h)}px`).join(" "), f = new IntersectionObserver(() => {
    ++o > 1 && Et(e);
  }, {
    root: zt,
    threshold: 1,
    rootMargin: s
  });
  f.observe(e), Pa.set(e, f);
}
function Et(e) {
  clearTimeout(ta.get(e));
  const r = na(e), t = typeof r == "function" ? 500 : r.duration;
  ta.set(e, setTimeout(async () => {
    const o = Rt.get(e);
    try {
      await (o == null ? void 0 : o.finished), sr.set(e, uo(e)), Xh(e);
    } catch {
    }
  }, t));
}
function Qh() {
  clearTimeout(ta.get(zt)), ta.set(zt, setTimeout(() => {
    ul.forEach((e) => hl(e, (r) => cl(() => Et(r))));
  }, 100));
}
function Zh(e) {
  setTimeout(() => {
    Uh.set(e, setInterval(() => cl(Et.bind(null, e)), 2e3));
  }, Math.round(2e3 * Math.random()));
}
function cl(e) {
  typeof requestIdleCallback == "function" ? requestIdleCallback(() => e()) : requestAnimationFrame(() => e());
}
let Fa, oo;
typeof window < "u" && (zt = document.documentElement, Fa = new MutationObserver(Gh), oo = new ResizeObserver(Yh), oo.observe(zt));
function jh(e) {
  return e.reduce((o, a) => [
    ...o,
    ...Array.from(a.addedNodes),
    ...Array.from(a.removedNodes)
  ], []).every((o) => o.nodeName === "#comment") ? !1 : e.reduce((o, a) => {
    if (o === !1)
      return !1;
    if (a.target instanceof Element) {
      if (ha(a.target), !o.has(a.target)) {
        o.add(a.target);
        for (let n = 0; n < a.target.children.length; n++) {
          const i = a.target.children.item(n);
          if (i) {
            if (Ma in i)
              return !1;
            ha(a.target, i), o.add(i);
          }
        }
      }
      if (a.removedNodes.length)
        for (let n = 0; n < a.removedNodes.length; n++) {
          const i = a.removedNodes[n];
          if (Ma in i)
            return !1;
          i instanceof Element && (o.add(i), ha(a.target, i), io.set(i, [
            a.previousSibling,
            a.nextSibling
          ]));
        }
    }
    return o;
  }, /* @__PURE__ */ new Set());
}
function ha(e, r) {
  !r && !(lt in e) ? Object.defineProperty(e, lt, { value: e }) : r && !(lt in r) && Object.defineProperty(r, lt, { value: e });
}
function Jh(e) {
  var r;
  const t = e.isConnected, o = sr.has(e);
  t && io.has(e) && io.delete(e), Rt.has(e) && ((r = Rt.get(e)) === null || r === void 0 || r.cancel()), o && t ? ex(e) : o && !t ? tx(e) : rx(e);
}
function Gr(e) {
  return Number(e.replace(/[^0-9.\-]/g, ""));
}
function Kh(e) {
  let r = e.parentElement;
  for (; r; ) {
    if (r.scrollLeft || r.scrollTop)
      return { x: r.scrollLeft, y: r.scrollTop };
    r = r.parentElement;
  }
  return { x: 0, y: 0 };
}
function uo(e) {
  const r = e.getBoundingClientRect(), { x: t, y: o } = Kh(e);
  return {
    top: r.top + o,
    left: r.left + t,
    width: r.width,
    height: r.height
  };
}
function ml(e, r, t) {
  let o = r.width, a = r.height, n = t.width, i = t.height;
  const l = getComputedStyle(e);
  if (l.getPropertyValue("box-sizing") === "content-box") {
    const f = Gr(l.paddingTop) + Gr(l.paddingBottom) + Gr(l.borderTopWidth) + Gr(l.borderBottomWidth), h = Gr(l.paddingLeft) + Gr(l.paddingRight) + Gr(l.borderRightWidth) + Gr(l.borderLeftWidth);
    o -= h, n -= h, a -= f, i -= f;
  }
  return [o, n, a, i].map(Math.round);
}
function na(e) {
  return lt in e && so.has(e[lt]) ? so.get(e[lt]) : { duration: 250, easing: "ease-in-out" };
}
function pl(e) {
  if (lt in e)
    return e[lt];
}
function ai(e) {
  const r = pl(e);
  return r ? So.has(r) : !1;
}
function hl(e, ...r) {
  r.forEach((t) => t(e, so.has(e)));
  for (let t = 0; t < e.children.length; t++) {
    const o = e.children.item(t);
    o && r.forEach((a) => a(o, so.has(o)));
  }
}
function ex(e) {
  const r = sr.get(e), t = uo(e);
  if (!ai(e))
    return sr.set(e, t);
  let o;
  if (!r)
    return;
  const a = na(e);
  if (typeof a != "function") {
    const n = r.left - t.left, i = r.top - t.top, [l, s, f, h] = ml(e, r, t), c = {
      transform: `translate(${n}px, ${i}px)`
    }, T = {
      transform: "translate(0, 0)"
    };
    l !== s && (c.width = `${l}px`, T.width = `${s}px`), f !== h && (c.height = `${f}px`, T.height = `${h}px`), o = e.animate([c, T], {
      duration: a.duration,
      easing: a.easing
    });
  } else
    o = new Animation(a(e, "remain", r, t)), o.play();
  Rt.set(e, o), sr.set(e, t), o.addEventListener("finish", Et.bind(null, e));
}
function rx(e) {
  const r = uo(e);
  sr.set(e, r);
  const t = na(e);
  if (!ai(e))
    return;
  let o;
  typeof t != "function" ? o = e.animate([
    { transform: "scale(.98)", opacity: 0 },
    { transform: "scale(0.98)", opacity: 0, offset: 0.5 },
    { transform: "scale(1)", opacity: 1 }
  ], {
    duration: t.duration * 1.5,
    easing: "ease-in"
  }) : (o = new Animation(t(e, "add", r)), o.play()), Rt.set(e, o), o.addEventListener("finish", Et.bind(null, e));
}
function tx(e) {
  var r;
  if (!io.has(e) || !sr.has(e))
    return;
  const [t, o] = io.get(e);
  Object.defineProperty(e, Ma, { value: !0 }), o && o.parentNode && o.parentNode instanceof Element ? o.parentNode.insertBefore(e, o) : t && t.parentNode ? t.parentNode.appendChild(e) : (r = pl(e)) === null || r === void 0 || r.appendChild(e);
  function a() {
    var T;
    e.remove(), sr.delete(e), io.delete(e), Rt.delete(e), (T = Pa.get(e)) === null || T === void 0 || T.disconnect();
  }
  if (!ai(e))
    return a();
  const [n, i, l, s] = ox(e), f = na(e), h = sr.get(e);
  let c;
  Object.assign(e.style, {
    position: "absolute",
    top: `${n}px`,
    left: `${i}px`,
    width: `${l}px`,
    height: `${s}px`,
    margin: 0,
    pointerEvents: "none",
    transformOrigin: "center",
    zIndex: 100
  }), typeof f != "function" ? c = e.animate([
    {
      transform: "scale(1)",
      opacity: 1
    },
    {
      transform: "scale(.98)",
      opacity: 0
    }
  ], { duration: f.duration, easing: "ease-out" }) : (c = new Animation(f(e, "remove", h)), c.play()), Rt.set(e, c), c.addEventListener("finish", a);
}
function ox(e) {
  const r = sr.get(e), [t, , o] = ml(e, r, uo(e));
  let a = e.parentElement;
  for (; a && (getComputedStyle(a).position === "static" || a instanceof HTMLBodyElement); )
    a = a.parentElement;
  a || (a = document.body);
  const n = getComputedStyle(a), i = sr.get(a) || uo(a), l = Math.round(r.top - i.top) - Gr(n.borderTopWidth), s = Math.round(r.left - i.left) - Gr(n.borderLeftWidth);
  return [l, s, t, o];
}
function ax(e, r = {}) {
  return Fa && oo && (window.matchMedia("(prefers-reduced-motion: reduce)").matches && typeof r != "function" && !r.disrespectUserMotionPreference || (So.add(e), getComputedStyle(e).position === "static" && Object.assign(e.style, { position: "relative" }), hl(e, Et, Zh, (a) => oo == null ? void 0 : oo.observe(a)), typeof r == "function" ? so.set(e, r) : so.set(e, { duration: 250, easing: "ease-in-out", ...r }), Fa.observe(e, { childList: !0 }), ul.add(e))), Object.freeze({
    parent: e,
    enable: () => {
      So.add(e);
    },
    disable: () => {
      So.delete(e);
    },
    isEnabled: () => So.has(e)
  });
}
function ii(e) {
  const [r, t] = me();
  return [X((n) => {
    n instanceof HTMLElement ? t(ax(n, e)) : t(void 0);
  }, []), (n) => {
    r && (n ? r.enable() : r.disable());
  }];
}
const ix = "_summaryContainer_17ytj_13", nx = "_validationContainer_17ytj_22", lx = "_error_17ytj_52", dx = "_heading_17ytj_58", sx = "_warning_17ytj_62", ux = "_info_17ytj_72", cx = "_valid_17ytj_22", bt = {
  summaryContainer: ix,
  validationContainer: nx,
  error: lx,
  heading: dx,
  warning: sx,
  info: ux,
  valid: cx
}, mx = '"[]"', px = "_spacer_1414d_13", xl = {
  themeVars: mx,
  spacer: px
}, hx = () => /* @__PURE__ */ p("div", { className: xl.spacer });
function Ni({
  fieldValidationResults: e = Ot,
  generalValidationResults: r = lr
}) {
  const [t] = ii({ duration: 100 }), o = ue(() => {
    const a = {};
    return Object.entries(e).forEach(([n, i]) => {
      i.validations.forEach((l) => {
        l.isValid || (a[l.severity] = a[l.severity] || [], a[l.severity].push({
          field: n,
          message: l.invalidMessage || ""
        }));
      });
    }), r.forEach((n) => {
      a[n.severity] = a[n.severity] || [], a[n.severity].push({
        message: n.invalidMessage || ""
      });
    }), a;
  }, [e, r]);
  return /* @__PURE__ */ j("div", { ref: t, className: bt.summaryContainer, children: [
    /* @__PURE__ */ p(Wi, { issues: o.warning, severity: "warning", heading: "Validation warnings" }),
    /* @__PURE__ */ p(Wi, { issues: o.error, severity: "error", heading: "Validation errors" })
  ] });
}
const Wi = ({ heading: e, issues: r = lr, severity: t = "error", onClose: o }) => {
  const [a] = ii({ duration: 100 });
  return r.length === 0 ? null : /* @__PURE__ */ j(
    "div",
    {
      className: le(bt.validationContainer, {
        [bt.valid]: t === "valid",
        [bt.info]: t === "info",
        [bt.warning]: t === "warning",
        [bt.error]: t === "error"
      }),
      style: { paddingTop: o ? void 0 : "0.5rem" },
      children: [
        /* @__PURE__ */ j(Lo, { orientation: "horizontal", verticalAlignment: "center", style: { gap: "0.5rem" }, children: [
          /* @__PURE__ */ p(ye, { className: bt.heading, name: t, size: "md" }),
          /* @__PURE__ */ p("div", { className: bt.heading, children: /* @__PURE__ */ p(no, { children: e }) }),
          !!o && /* @__PURE__ */ j(gr, { children: [
            /* @__PURE__ */ p(hx, {}),
            /* @__PURE__ */ p(
              dr,
              {
                onClick: o,
                variant: "ghost",
                themeColor: "secondary",
                icon: /* @__PURE__ */ p(ye, { name: "close", size: "sm" }),
                orientation: "vertical"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ p("ul", { ref: a, children: r.map((n, i) => /* @__PURE__ */ p(xx, { issue: n }, i)) })
      ]
    }
  );
}, xx = ({ issue: e }) => {
  const { field: r, message: t } = e;
  return /* @__PURE__ */ p("li", { children: /* @__PURE__ */ j("span", { style: { display: "inline-flex", gap: r ? "0.25rem" : void 0 }, children: [
    r && /* @__PURE__ */ p(no, { variant: "small", fontWeight: "bold", children: `${r}:` }),
    /* @__PURE__ */ p(no, { variant: "small", preserveLinebreaks: !0, children: t })
  ] }) });
}, bx = ["error", "warning", "valid", "none"], bl = "errorLate", fx = [
  {
    value: "errorLate",
    description: "Display the error when the field loses focus.If an error is already displayed, continue for every keystroke until input is accepted."
  },
  {
    value: "onChanged",
    description: "Display error (if present) for every keystroke."
  },
  {
    value: "onLostFocus",
    description: "Show/hide error (if present) only if the field loses focus."
  }
], fl = nd(void 0);
function it(e) {
  return ld(fl, e);
}
const vx = [
  {
    value: "text",
    description: "Renders TextBox"
  },
  {
    value: "password",
    description: "Renders TextBox with `password` type"
  },
  {
    value: "textarea",
    description: "Renders Textarea"
  },
  {
    value: "checkbox",
    description: "Renders Checkbox"
  },
  {
    value: "number",
    description: "Renders NumberBox"
  },
  {
    value: "integer",
    description: "Renders NumberBox with `integersOnly` set to true"
  },
  {
    value: "file",
    description: "Renders FileInput"
  },
  {
    value: "datePicker",
    description: "Renders DatePicker"
  },
  {
    value: "radioGroup",
    description: "Renders RadioGroup"
  },
  {
    value: "switch",
    description: "Renders Switch"
  },
  {
    value: "select",
    description: "Renders Select"
  },
  {
    value: "autocomplete",
    description: "Renders AutoComplete"
  },
  {
    value: "slider",
    description: "Renders Slider"
  },
  {
    value: "colorpicker",
    description: "Renders ColorPicker"
  },
  {
    value: "custom",
    description: "Custom control specified in children"
  }
];
function gx(e) {
  return e == null || e === "" ? !0 : typeof e == "string" ? e.trim().length === 0 : $a(e);
}
function Oi(e = "", r) {
  return typeof e == "string" ? e.length >= r : (console.warn("minLength can only be used on strings"), !0);
}
function Ri(e = "", r) {
  return typeof e == "string" ? e.length <= r : (console.warn("maxLength can only be used on strings"), !0);
}
function zi(e = "", r) {
  return typeof e != "string" && !Ln(e) && console.warn("Range can only be used on strings and numbers"), Number(e) >= r;
}
function Vi(e = "", r) {
  return typeof e != "string" && !Ln(e) && console.warn("Range can only be used on strings and numbers"), Number(e) <= r;
}
function Tx(e = "", r) {
  if (typeof e == "string")
    return t(r).test(e);
  return console.warn("Regex can only be used on strings"), !0;
  function t(o) {
    const a = o.match(/^([/~@;%#'])(.*?)\1([gimsuy]*)$/);
    return a ? new RegExp(a[2], a[3]) : new RegExp(o);
  }
}
class vl {
  constructor(r, t, o) {
    this.validations = r, this.onValidate = t, this.value = o, this.preValidate = () => {
      const a = this.validateRequired();
      let n = [a];
      return (!a || a.isValid) && n.push(
        this.validateLength(),
        this.validateRange(),
        this.validatePattern(),
        this.validateRegex()
      ), n = n.filter((i) => i !== void 0), {
        isValid: n.find((i) => !i.isValid) === void 0,
        validatedValue: this.value,
        partial: this.onValidate !== void 0,
        validations: n
      };
    }, this.validate = async () => {
      const a = this.preValidate(), n = await this.validateCustom() || [];
      return a.validations.push(...n.map((i) => ({ ...i, async: !0 }))), {
        isValid: a.validations.find((i) => !i.isValid) === void 0,
        validatedValue: this.value,
        partial: !1,
        validations: a.validations
      };
    };
  }
  validateRequired() {
    const { required: r, requiredInvalidMessage: t } = this.validations;
    if (r)
      return {
        isValid: !gx(this.value),
        invalidMessage: t || "This field is required",
        severity: "error"
      };
  }
  validateLength() {
    const { minLength: r, maxLength: t, lengthInvalidMessage: o, lengthInvalidSeverity: a = "error" } = this.validations;
    if (!(r === void 0 && t === void 0))
      return r !== void 0 && t === void 0 ? {
        isValid: Oi(this.value, r),
        invalidMessage: o || `Input should be at least ${r} ${Di(r, "character")}`,
        severity: a
      } : r === void 0 && t !== void 0 ? {
        isValid: Ri(this.value, t),
        invalidMessage: o || `Input should be up to ${t} ${Di(t, "character")}`,
        severity: a
      } : {
        isValid: Oi(this.value, r) && Ri(this.value, t),
        invalidMessage: o || `Input length should be between ${r} and ${t}`,
        severity: a
      };
  }
  validateRange() {
    const { minValue: r, maxValue: t, rangeInvalidMessage: o, rangeInvalidSeverity: a = "error" } = this.validations;
    if (!(r === void 0 && t === void 0))
      return r !== void 0 && t === void 0 ? {
        isValid: zi(this.value, r),
        invalidMessage: o || `Input should be bigger than ${r}`,
        severity: a
      } : r === void 0 && t !== void 0 ? {
        isValid: Vi(this.value, t),
        invalidMessage: o || `Input should be smaller than ${t}`,
        severity: a
      } : {
        isValid: zi(this.value, r) && Vi(this.value, t),
        invalidMessage: o || `Input should be between ${r} and ${t}`,
        severity: a
      };
  }
  validatePattern() {
    const { pattern: r, patternInvalidMessage: t, patternInvalidSeverity: o = "error" } = this.validations;
    if (r)
      switch (r.toLowerCase()) {
        case "email":
          return {
            isValid: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(this.value),
            invalidMessage: t || "Not a valid email address",
            severity: o
          };
        case "phone":
          return {
            isValid: /^[a-zA-Z0-9#*)(+.\-_&']+$/g.test(this.value),
            invalidMessage: t || "Not a valid phone number",
            severity: o
          };
        case "url":
          let a;
          try {
            a = new URL(this.value);
          } catch {
          }
          return !a || a.protocol && !["http:", "https:"].includes(a.protocol) ? {
            isValid: !1,
            invalidMessage: "Not a valid URL",
            severity: o
          } : {
            isValid: !0,
            severity: "valid"
          };
        default:
          return console.warn("Unknown pattern provided"), {
            isValid: !0,
            severity: "valid"
          };
      }
  }
  validateRegex() {
    const { regex: r, regexInvalidMessage: t, regexInvalidSeverity: o = "error" } = this.validations;
    if (r !== void 0)
      return {
        isValid: Tx(this.value, r),
        invalidMessage: t || "Input is not in the correct format",
        severity: o
      };
  }
  async validateCustom() {
    if (!this.onValidate)
      return;
    const r = await this.onValidate(this.value);
    return typeof r == "boolean" ? [
      {
        isValid: r,
        invalidMessage: "Invalid input",
        severity: "error"
      }
    ] : Kl(r) ? r : [r];
  }
}
async function Ei(e, r, t) {
  return await new vl(e, r, t).validate();
}
function yx(e, r, t, o, a, n = 0) {
  const i = Xl(t), l = ue(() => n !== 0 ? ws(Ei, n, {
    trailing: !0,
    leading: !0
  }) : Ei, [n]);
  K(
    function() {
      const f = new vl(e, r, i);
      let h = !1;
      const c = f.preValidate();
      return h || (o(Ai(a, c)), c.partial && (async () => {
        const T = await l(e, r, i);
        h || o(Ai(a, T));
      })()), () => {
        h = !0;
      };
    },
    [a, i, o, r, l, e]
  );
}
function Cx(e, r, t, o = bl) {
  const a = it((_) => _.interactionFlags[e]) || Ot, n = a.forceShowValidationResult, i = a.focused, l = a.isValidLostFocus, s = a.isValidOnFocus, f = a.invalidToValid, h = !t || t.validatedValue !== r, c = a.isDirty, T = (t == null ? void 0 : t.isValid) === !0;
  let b = "none";
  for (const _ of (t == null ? void 0 : t.validations) || [])
    if (!_.isValid && (b !== "error" && _.severity === "warning" && (b = "warning"), _.severity === "error")) {
      b = "error";
      break;
    }
  let v = !1;
  switch (o) {
    case "errorLate":
      v = c && (i ? !f && !s : !l);
      break;
    case "onChanged":
      v = c;
      break;
    case "onLostFocus":
      v = c && (!i && !T || !l && !T);
  }
  v = v || n;
  const [y, w] = me(v);
  return y !== v && !h && w(v), h && (v = y), {
    isHelperTextShown: v,
    validationStatus: v ? b : "none"
  };
}
function kx(e) {
  const r = {
    error: [],
    warning: [],
    valid: [],
    none: []
  };
  return Object.entries(e).forEach(([t, o]) => {
    o.validations.forEach((a) => {
      a.isValid || (r[a.severity] = r[a.severity] || [], r[a.severity].push(a));
    });
  }), r;
}
function Di(e, r) {
  return e === 1 ? r : r + "s";
}
const Pi = (e, r, t) => {
  const o = r.split(".");
  for (let a = 0; a < o.length; a++) {
    const n = o[a];
    typeof o[a + 1] < "u" ? e[n] = e[n] ? e[n] : {} : e[n] = t, e = e[n];
  }
}, Mi = (e, r) => {
  const t = r.split(".");
  let o = e;
  for (let a = 0; a < t.length; a++)
    o = o == null ? void 0 : o[t[a]];
  return o;
};
At((e, r) => {
  var o, a, n, i;
  const { uid: t } = r.payload;
  switch (t !== void 0 && !e.interactionFlags[t] && (e.interactionFlags[t] = {
    isDirty: !1,
    invalidToValid: !1,
    isValidOnFocus: !1,
    isValidLostFocus: !1,
    focused: !1,
    forceShowValidationResult: !1
  }), r.type) {
    case vr.FIELD_INITIALIZED: {
      e.interactionFlags[t].isDirty || Pi(e.subject, t, r.payload.value);
      break;
    }
    case vr.FIELD_REMOVED: {
      delete e.validationResults[t];
      break;
    }
    case vr.FIELD_VALUE_CHANGED: {
      Pi(e.subject, t, r.payload.value), e.interactionFlags[t].isDirty = !0, e.interactionFlags[t].forceShowValidationResult = !1;
      break;
    }
    case vr.FIELD_VALIDATED: {
      if (r.payload.validationResult.validations.length === 0) {
        delete e.validationResults[t];
        break;
      }
      const l = (o = e.validationResults[t]) == null ? void 0 : o.isValid;
      if (r.payload.validationResult.partial) {
        const s = [
          ...r.payload.validationResult.validations,
          ...(((a = e.validationResults[t]) == null ? void 0 : a.validations.filter((f) => f.async)) || []).map(
            (f) => ({
              ...f,
              stale: !0
            })
          )
        ];
        e.validationResults[t] = {
          ...r.payload.validationResult,
          isValid: s.find((f) => !f.isValid) === void 0,
          validations: s
        };
      } else
        e.validationResults[t] = r.payload.validationResult;
      e.interactionFlags[t].invalidToValid = !l && e.validationResults[t].isValid;
      break;
    }
    case vr.FIELD_FOCUSED: {
      e.interactionFlags[t].isValidOnFocus = !!((n = e.validationResults[t]) != null && n.isValid), e.interactionFlags[t].focused = !0;
      break;
    }
    case vr.FIELD_LOST_FOCUS: {
      e.interactionFlags[t].isValidLostFocus = !!((i = e.validationResults[t]) != null && i.isValid), e.interactionFlags[t].focused = !1;
      break;
    }
    case vr.TRIED_TO_SUBMIT: {
      Object.keys(e.interactionFlags).forEach((l) => {
        e.interactionFlags[l].forceShowValidationResult = !0;
      });
      break;
    }
    case vr.SUBMITTING: {
      e.submitInProgress = !0;
      break;
    }
    case vr.SUBMITTED: {
      e.submitInProgress = !1, e.generalValidationResults = [], e.interactionFlags = {}, Object.keys(e.validationResults).forEach((l) => {
        var s;
        e.validationResults[l].validations = (s = e.validationResults[l].validations) == null ? void 0 : s.filter(
          (f) => !f.fromBackend
        ), e.validationResults[l].isValid = e.validationResults[l].validations.find((f) => !f.isValid) === void 0;
      });
      break;
    }
    case vr.BACKEND_VALIDATION_ARRIVED: {
      e.submitInProgress = !1, e.generalValidationResults = r.payload.generalValidationResults, Object.keys(e.validationResults).forEach((l) => {
        var s;
        e.validationResults[l].validations = (s = e.validationResults[l].validations) == null ? void 0 : s.filter(
          (f) => !f.fromBackend
        );
      }), Object.entries(r.payload.fieldValidationResults).forEach(
        ([l, s]) => {
          var f;
          e.validationResults[l].validations = [
            ...((f = e.validationResults[l]) == null ? void 0 : f.validations) || [],
            ...s || []
          ], e.validationResults[l].isValid = e.validationResults[l].validations.find((h) => !h.isValid) === void 0;
        }
      );
      break;
    }
    case vr.RESET: {
      const { originalSubject: l } = r.payload;
      return {
        ...Sx,
        subject: l
      };
    }
  }
});
const Sx = {
  subject: {},
  validationResults: {},
  generalValidationResults: [],
  interactionFlags: {},
  submitInProgress: !1
}, Gt = {
  cancelLabel: "Cancel",
  saveLabel: "Save",
  saveInProgressLabel: "Saving...",
  itemLabelPosition: "top",
  itemLabelBreak: !0,
  keepModalOpenOnSubmit: !1
}, wx = xe(function({
  formState: e,
  dispatch: r,
  initialValue: t = Ot,
  children: o,
  style: a,
  enabled: n = !0,
  cancelLabel: i = "Cancel",
  saveLabel: l = "Save",
  saveInProgressLabel: s = "Saving...",
  swapCancelAndSave: f,
  onSubmit: h,
  onCancel: c,
  onReset: T,
  buttonRow: b,
  id: v,
  registerComponentApi: y,
  itemLabelBreak: w = !0,
  itemLabelWidth: _,
  itemLabelPosition: H = "top",
  keepModalOpenOnSubmit: $ = !1
}, O) {
  const F = he(null);
  Ql(O, () => F.current);
  const [Y, V] = me(!1), R = Fh(), W = n && !e.submitInProgress, z = ue(() => ({
    itemLabelBreak: w,
    itemLabelWidth: _,
    itemLabelPosition: H,
    subject: e.subject,
    originalSubject: t,
    validationResults: e.validationResults,
    interactionFlags: e.interactionFlags,
    dispatch: r,
    enabled: W
  }), [
    r,
    e.interactionFlags,
    e.subject,
    e.validationResults,
    t,
    W,
    w,
    H,
    _
  ]), x = $e(() => {
    c == null || c(), R();
  }), m = $e(async (E) => {
    var P;
    if (E == null || E.preventDefault(), !W)
      return;
    V(!1), r(Lh());
    const { error: N, warning: B } = kx(
      Object.values(e.validationResults)
    );
    if (N.length)
      return;
    if (B.length && !Y) {
      V(!0);
      return;
    }
    const D = document.activeElement;
    r(_h());
    try {
      await (h == null ? void 0 : h(e.subject, {
        passAsDefaultBody: !0
      })), r(Ah()), $ || R(), t === Ot && An(() => {
        g();
      }), D && typeof D.focus == "function" && D.focus();
    } catch (I) {
      const M = [], G = {};
      I instanceof Error && "errorCategory" in I && I.errorCategory === "GenericBackendError" && ((P = I.details) != null && P.issues) && Array.isArray(I.details.issues) ? I.details.issues.forEach((J) => {
        const ee = {
          isValid: !1,
          invalidMessage: J.message,
          severity: J.severity || "error",
          fromBackend: !0
        };
        J.field !== void 0 ? (G[J.field] = G[J.field] || [], G[J.field].push(ee)) : M.push(ee);
      }) : M.push({
        isValid: !1,
        invalidMessage: I.message || "Couldn't save the form.",
        severity: "error",
        fromBackend: !0
      }), r(
        Wh({
          generalValidationResults: M,
          fieldValidationResults: G
        })
      );
    }
  }), g = $e(() => {
    r(Nh(t)), T == null || T();
  }), k = $e((E) => {
    typeof E != "object" || E === null || E === void 0 || Object.entries(E).forEach(([N, B]) => {
      r({
        type: vr.FIELD_VALUE_CHANGED,
        payload: {
          uid: N,
          value: B
        }
      });
    });
  }), A = i === "" ? null : /* @__PURE__ */ p(
    dr,
    {
      type: "button",
      themeColor: "secondary",
      variant: "ghost",
      onClick: x,
      children: i
    },
    "cancel"
  ), q = ue(
    () => /* @__PURE__ */ p(dr, { type: "submit", disabled: !W, children: e.submitInProgress ? s : l }, "submit"),
    [W, e.submitInProgress, s, l]
  );
  return K(() => {
    y == null || y({
      reset: g,
      update: k
    });
  }, [g, k, y]), /* @__PURE__ */ j(gr, { children: [
    /* @__PURE__ */ j(
      "form",
      {
        style: a,
        className: Da.wrapper,
        onSubmit: m,
        onReset: g,
        id: v,
        ref: F,
        children: [
          /* @__PURE__ */ p(Ni, { generalValidationResults: e.generalValidationResults }),
          /* @__PURE__ */ p(fl.Provider, { value: z, children: o }),
          b || /* @__PURE__ */ j("div", { className: Da.buttonRow, children: [
            f && [q, A],
            !f && [A, q]
          ] })
        ]
      }
    ),
    Y && /* @__PURE__ */ p(
      sl,
      {
        onClose: () => V(!1),
        isInitiallyOpen: !0,
        title: "Are you sure want to move forward?",
        children: /* @__PURE__ */ j(Lo, { orientation: "vertical", style: { gap: "0.5rem" }, children: [
          /* @__PURE__ */ p(no, { children: "The following warnings were found during validation. Please make sure you are willing to move forward despite these issues." }),
          /* @__PURE__ */ p(
            Ni,
            {
              generalValidationResults: e.generalValidationResults,
              fieldValidationResults: e.validationResults
            }
          ),
          /* @__PURE__ */ j(Lo, { orientation: "horizontal", horizontalAlignment: "end", style: { gap: "1em" }, children: [
            /* @__PURE__ */ p(
              dr,
              {
                variant: "ghost",
                themeColor: "secondary",
                onClick: () => V(!1),
                children: "No"
              }
            ),
            /* @__PURE__ */ p(dr, { onClick: () => m(), autoFocus: !0, children: "Yes, proceed" })
          ] })
        ] })
      }
    )
  ] });
});
wx.displayName = "Form";
const Hx = "Form", Bx = C({
  status: "experimental",
  description: `A \`${Hx}\` is a fundamental component that displays user interfaces that allow users to input (or change) data and submit it to the app (a server) for further processing.`,
  props: {
    buttonRowTemplate: Re(
      "This property allows defining a custom component to display the buttons at the bottom of the form."
    ),
    itemLabelPosition: {
      description: "This property sets the position of the item labels within the form.Individual `FormItem` instances can override this property.",
      availableValues: Pn,
      type: "string",
      defaultValue: Gt.itemLabelPosition
    },
    itemLabelWidth: {
      description: "This property sets the width of the item labels within the form. Individual `FormItem` instances can override this property.",
      type: "string"
    },
    itemLabelBreak: {
      description: "This boolean value indicates if form item labels can be split into multiple lines if it would overflow the available label width. Individual `FormItem` instances can override this property.",
      type: "boolean",
      defaultValue: Gt.itemLabelBreak
    },
    keepModalOpenOnSubmit: {
      description: "This property prevents the modal from closing when the form is submitted.",
      type: "boolean",
      defaultValue: Gt.keepModalOpenOnSubmit
    },
    data: {
      description: "This property sets the initial value of the form's data structure. The form infrastructure uses this value to set the initial state of form items within the form."
    },
    cancelLabel: {
      description: "This property defines the label of the Cancel button.",
      type: "string",
      defaultValue: Gt.cancelLabel
    },
    saveLabel: {
      description: "This property defines the label of the Save button.",
      type: "string",
      defaultValue: Gt.saveLabel
    },
    saveInProgressLabel: {
      description: "This property defines the label of the Save button to display during the form data submit (save) operation.",
      type: "string",
      defaultValue: Gt.saveInProgressLabel
    },
    swapCancelAndSave: {
      description: "By default, the Cancel button is to the left of the Save button. Set this property to `true` to swap them or `false` to keep their original location.",
      type: "boolean"
    },
    submitUrl: u("URL to submit the form data."),
    submitMethod: {
      description: "This property sets the HTTP method to use when submitting the form data. If not defined, `put` is used when the form has initial data; otherwise, `post`."
    },
    enabled: u("Whether the form is enabled or not. The default value is `true`."),
    _data_url: Pe("when we have an api bound data prop, we inject the url here")
  },
  events: {
    submit: u(
      "The form infrastructure fires this event when the form is submitted. The event argument is the current `data` value to save."
    ),
    cancel: u("The form infrastructure fires this event when the form is canceled."),
    reset: u("The form infrastructure fires this event when the form is reset.")
  },
  contextVars: {
    $data: u(
      "This property represents the value of the form data. You can access the fields of the form using the IDs in the `bindTo` property of nested `FormItem` instances. `$data` also provides an `update` method as a shortcut to the Form's exposed `update` method."
    )
  },
  apis: {
    reset: u("Call this event to reset the form to its initial state."),
    update: u(
      "You can pass a data object to update the form data. The properties in the passed data object are updated to their values accordingly. Other form properties remain intact."
    )
  },
  themeVars: Z(Da.themeVars),
  defaultThemeVars: {
    "gap-Form": "$space-4",
    "gap-buttonRow-Form": "$space-4",
    light: {
      "backgroundColor-ValidationDisplay-error": "$color-danger-100",
      "backgroundColor-ValidationDisplay-warning": "$color-warn-100",
      "backgroundColor-ValidationDisplay-info": "$color-primary-100",
      "backgroundColor-ValidationDisplay-valid": "$color-success-100",
      "color-accent-ValidationDisplay-error": "$color-error",
      "color-accent-ValidationDisplay-warning": "$color-warning",
      "color-accent-ValidationDisplay-info": "$color-info",
      "color-accent-ValidationDisplay-valid": "$color-valid",
      "color-ValidationDisplay-error": "$color-error",
      "color-ValidationDisplay-warning": "$color-warning",
      "color-ValidationDisplay-info": "$color-info",
      "color-ValidationDisplay-valid": "$color-valid"
    },
    dark: {
      "backgroundColor-ValidationDisplay-error": "$color-danger-900",
      "backgroundColor-ValidationDisplay-warning": "$color-warn-900",
      "backgroundColor-ValidationDisplay-info": "$color-secondary-800",
      "backgroundColor-ValidationDisplay-valid": "$color-success-900",
      "color-accent-ValidationDisplay-error": "$color-danger-500",
      "color-accent-ValidationDisplay-warning": "$color-warn-700",
      "color-accent-ValidationDisplay-info": "$color-surface-200",
      "color-accent-ValidationDisplay-valid": "$color-success-600",
      "color-ValidationDisplay-error": "$color-danger-500",
      "color-ValidationDisplay-warning": "$color-warn-700",
      "color-ValidationDisplay-info": "$color-secondary-200",
      "color-ValidationDisplay-valid": "$color-success-600"
    }
  }
});
var d = /* @__PURE__ */ ((e) => (e[e.Eof = -1] = "Eof", e[e.Ws = -2] = "Ws", e[e.BlockComment = -3] = "BlockComment", e[e.EolComment = -4] = "EolComment", e[e.Unknown = 0] = "Unknown", e[e.LParent = 1] = "LParent", e[e.RParent = 2] = "RParent", e[e.Identifier = 3] = "Identifier", e[e.Exponent = 4] = "Exponent", e[e.Divide = 5] = "Divide", e[e.Multiply = 6] = "Multiply", e[e.Remainder = 7] = "Remainder", e[e.Plus = 8] = "Plus", e[e.Minus = 9] = "Minus", e[e.BitwiseXor = 10] = "BitwiseXor", e[e.BitwiseOr = 11] = "BitwiseOr", e[e.LogicalOr = 12] = "LogicalOr", e[e.BitwiseAnd = 13] = "BitwiseAnd", e[e.LogicalAnd = 14] = "LogicalAnd", e[e.IncOp = 15] = "IncOp", e[e.DecOp = 16] = "DecOp", e[e.Assignment = 17] = "Assignment", e[e.AddAssignment = 18] = "AddAssignment", e[e.SubtractAssignment = 19] = "SubtractAssignment", e[e.ExponentAssignment = 20] = "ExponentAssignment", e[e.MultiplyAssignment = 21] = "MultiplyAssignment", e[e.DivideAssignment = 22] = "DivideAssignment", e[e.RemainderAssignment = 23] = "RemainderAssignment", e[e.ShiftLeftAssignment = 24] = "ShiftLeftAssignment", e[e.ShiftRightAssignment = 25] = "ShiftRightAssignment", e[e.SignedShiftRightAssignment = 26] = "SignedShiftRightAssignment", e[e.BitwiseAndAssignment = 27] = "BitwiseAndAssignment", e[e.BitwiseXorAssignment = 28] = "BitwiseXorAssignment", e[e.BitwiseOrAssignment = 29] = "BitwiseOrAssignment", e[e.LogicalAndAssignment = 30] = "LogicalAndAssignment", e[e.LogicalOrAssignment = 31] = "LogicalOrAssignment", e[e.NullCoalesceAssignment = 32] = "NullCoalesceAssignment", e[e.Semicolon = 33] = "Semicolon", e[e.Comma = 34] = "Comma", e[e.Colon = 35] = "Colon", e[e.LSquare = 36] = "LSquare", e[e.RSquare = 37] = "RSquare", e[e.QuestionMark = 38] = "QuestionMark", e[e.NullCoalesce = 39] = "NullCoalesce", e[e.OptionalChaining = 40] = "OptionalChaining", e[e.BinaryNot = 41] = "BinaryNot", e[e.LBrace = 42] = "LBrace", e[e.RBrace = 43] = "RBrace", e[e.Equal = 44] = "Equal", e[e.StrictEqual = 45] = "StrictEqual", e[e.LogicalNot = 46] = "LogicalNot", e[e.NotEqual = 47] = "NotEqual", e[e.StrictNotEqual = 48] = "StrictNotEqual", e[e.LessThan = 49] = "LessThan", e[e.LessThanOrEqual = 50] = "LessThanOrEqual", e[e.ShiftLeft = 51] = "ShiftLeft", e[e.GreaterThan = 52] = "GreaterThan", e[e.GreaterThanOrEqual = 53] = "GreaterThanOrEqual", e[e.ShiftRight = 54] = "ShiftRight", e[e.SignedShiftRight = 55] = "SignedShiftRight", e[e.Dot = 56] = "Dot", e[e.Spread = 57] = "Spread", e[e.Global = 58] = "Global", e[e.Backtick = 59] = "Backtick", e[e.DollarLBrace = 60] = "DollarLBrace", e[e.Arrow = 61] = "Arrow", e[e.DecimalLiteral = 62] = "DecimalLiteral", e[e.HexadecimalLiteral = 63] = "HexadecimalLiteral", e[e.BinaryLiteral = 64] = "BinaryLiteral", e[e.RealLiteral = 65] = "RealLiteral", e[e.StringLiteral = 66] = "StringLiteral", e[e.Infinity = 67] = "Infinity", e[e.NaN = 68] = "NaN", e[e.True = 69] = "True", e[e.False = 70] = "False", e[e.Typeof = 71] = "Typeof", e[e.Null = 72] = "Null", e[e.Undefined = 73] = "Undefined", e[e.In = 74] = "In", e[e.Let = 75] = "Let", e[e.Const = 76] = "Const", e[e.Var = 77] = "Var", e[e.If = 78] = "If", e[e.Else = 79] = "Else", e[e.Return = 80] = "Return", e[e.Break = 81] = "Break", e[e.Continue = 82] = "Continue", e[e.Do = 83] = "Do", e[e.While = 84] = "While", e[e.For = 85] = "For", e[e.Of = 86] = "Of", e[e.Try = 87] = "Try", e[e.Catch = 88] = "Catch", e[e.Finally = 89] = "Finally", e[e.Throw = 90] = "Throw", e[e.Switch = 91] = "Switch", e[e.Case = 92] = "Case", e[e.Default = 93] = "Default", e[e.Delete = 94] = "Delete", e[e.Function = 95] = "Function", e[e.Export = 96] = "Export", e[e.Import = 97] = "Import", e[e.As = 98] = "As", e[e.From = 99] = "From", e))(d || {});
class Ix {
  // Creates a stream that uses the specified source code
  constructor(r) {
    this.source = r, this._pos = 0, this._line = 1, this._column = 0;
  }
  // Gets the current position in the stream. Starts from 0.
  get position() {
    return this._pos;
  }
  // Gets the current line number. Starts from 1.
  get line() {
    return this._line;
  }
  // Gets the current column number. Starts from 0.
  get column() {
    return this._column;
  }
  // Peeks the next character in the stream. Returns null, if EOF; otherwise the current source code character
  peek() {
    return this.ahead(0);
  }
  // Looks ahead with `n` characters in the stream. Returns null, if EOF; otherwise the look-ahead character
  ahead(r = 1) {
    return this._pos + r > this.source.length - 1 ? null : this.source[this._pos + r];
  }
  // Gets the next character from the stream
  get() {
    if (this._pos >= this.source.length)
      return null;
    const r = this.source[this._pos++];
    return r === `
` ? (this._line++, this._column = 0) : this._column++, r;
  }
  // Gets the tail of the input stream
  getTail(r) {
    var t;
    return ((t = this.source) == null ? void 0 : t.substring(r)) ?? "";
  }
}
const $t = {
  [d.Eof]: {},
  [d.Ws]: {},
  [d.DollarLBrace]: {},
  [d.Backtick]: { expressionStart: !0 },
  [d.BlockComment]: {},
  [d.EolComment]: {},
  [d.Unknown]: {},
  [d.LParent]: { expressionStart: !0 },
  [d.RParent]: {},
  [d.Identifier]: { expressionStart: !0, keywordLike: !0, isPropLiteral: !0 },
  [d.Exponent]: {},
  [d.Divide]: {},
  [d.Multiply]: {},
  [d.Remainder]: {},
  [d.Plus]: { expressionStart: !0, canBeUnary: !0 },
  [d.Minus]: { expressionStart: !0, canBeUnary: !0 },
  [d.BitwiseXor]: {},
  [d.BitwiseOr]: {},
  [d.LogicalOr]: {},
  [d.BitwiseAnd]: {},
  [d.LogicalAnd]: {},
  [d.Assignment]: { isAssignment: !0 },
  [d.AddAssignment]: { isAssignment: !0 },
  [d.SubtractAssignment]: { isAssignment: !0 },
  [d.ExponentAssignment]: { isAssignment: !0 },
  [d.MultiplyAssignment]: { isAssignment: !0 },
  [d.DivideAssignment]: { isAssignment: !0 },
  [d.RemainderAssignment]: { isAssignment: !0 },
  [d.ShiftLeftAssignment]: { isAssignment: !0 },
  [d.ShiftRightAssignment]: { isAssignment: !0 },
  [d.SignedShiftRightAssignment]: { isAssignment: !0 },
  [d.BitwiseAndAssignment]: { isAssignment: !0 },
  [d.BitwiseXorAssignment]: { isAssignment: !0 },
  [d.BitwiseOrAssignment]: { isAssignment: !0 },
  [d.LogicalAndAssignment]: { isAssignment: !0 },
  [d.LogicalOrAssignment]: { isAssignment: !0 },
  [d.NullCoalesceAssignment]: { isAssignment: !0 },
  [d.Semicolon]: {},
  [d.Comma]: {},
  [d.Colon]: {},
  [d.LSquare]: { expressionStart: !0 },
  [d.RSquare]: {},
  [d.QuestionMark]: {},
  [d.NullCoalesce]: {},
  [d.OptionalChaining]: {},
  [d.BinaryNot]: { expressionStart: !0, canBeUnary: !0 },
  [d.LBrace]: { expressionStart: !0 },
  [d.RBrace]: {},
  [d.Equal]: {},
  [d.StrictEqual]: {},
  [d.LogicalNot]: { expressionStart: !0, canBeUnary: !0 },
  [d.NotEqual]: {},
  [d.StrictNotEqual]: {},
  [d.LessThan]: {},
  [d.LessThanOrEqual]: {},
  [d.ShiftLeft]: {},
  [d.GreaterThan]: {},
  [d.GreaterThanOrEqual]: {},
  [d.ShiftRight]: {},
  [d.SignedShiftRight]: {},
  [d.Dot]: {},
  [d.Spread]: { expressionStart: !0, isPropLiteral: !0 },
  [d.Global]: { expressionStart: !0 },
  [d.DecimalLiteral]: { expressionStart: !0, isPropLiteral: !0 },
  [d.HexadecimalLiteral]: { expressionStart: !0, isPropLiteral: !0 },
  [d.BinaryLiteral]: { expressionStart: !0, isPropLiteral: !0 },
  [d.RealLiteral]: { expressionStart: !0, isPropLiteral: !0 },
  [d.StringLiteral]: { expressionStart: !0, isPropLiteral: !0 },
  [d.IncOp]: { expressionStart: !0 },
  [d.DecOp]: { expressionStart: !0 },
  [d.Infinity]: { expressionStart: !0, keywordLike: !0 },
  [d.NaN]: { expressionStart: !0, keywordLike: !0 },
  [d.True]: { expressionStart: !0, keywordLike: !0, isPropLiteral: !0 },
  [d.False]: { expressionStart: !0, keywordLike: !0, isPropLiteral: !0 },
  [d.Typeof]: { expressionStart: !0, canBeUnary: !0, keywordLike: !0 },
  [d.Null]: { expressionStart: !0, keywordLike: !0 },
  [d.Undefined]: { expressionStart: !0, keywordLike: !0 },
  [d.In]: { keywordLike: !0 },
  [d.Let]: { keywordLike: !0 },
  [d.Const]: { keywordLike: !0 },
  [d.Var]: { keywordLike: !0 },
  [d.If]: { keywordLike: !0 },
  [d.Else]: { keywordLike: !0 },
  [d.Arrow]: { keywordLike: !0 },
  [d.Return]: { keywordLike: !0 },
  [d.Break]: { keywordLike: !0 },
  [d.Continue]: { keywordLike: !0 },
  [d.Do]: { keywordLike: !0 },
  [d.While]: { keywordLike: !0 },
  [d.For]: { keywordLike: !0 },
  [d.Of]: { keywordLike: !0 },
  [d.Throw]: { keywordLike: !0 },
  [d.Try]: { keywordLike: !0 },
  [d.Catch]: { keywordLike: !0 },
  [d.Finally]: { keywordLike: !0 },
  [d.Switch]: { keywordLike: !0 },
  [d.Case]: { keywordLike: !0 },
  [d.Default]: { keywordLike: !0 },
  [d.Delete]: { expressionStart: !0, canBeUnary: !0, keywordLike: !0 },
  [d.Function]: { keywordLike: !0, expressionStart: !0 },
  [d.Export]: { keywordLike: !0 },
  [d.Import]: { keywordLike: !0 },
  [d.As]: { keywordLike: !0 },
  [d.From]: { keywordLike: !0 }
};
class $x {
  /**
   * Initializes the tokenizer with the input stream
   * @param input Input source code stream
   */
  constructor(r) {
    this.input = r, this._ahead = [], this._prefetched = null, this._prefetchedPos = null, this._prefetchedColumn = null, this._lastFetchPosition = 0, this._phaseExternallySet = null;
  }
  /**
   * Fetches the next token without advancing to its position
   * @param ws If true, retrieve whitespaces too
   */
  peek(r = !1) {
    return this.ahead(0, r);
  }
  /**
   * Reads tokens ahead
   * @param n Number of token positions to read ahead
   * @param ws If true, retrieve whitespaces too
   */
  ahead(r = 1, t = !1) {
    if (r > 16)
      throw new Error("Cannot look ahead more than 16 tokens");
    for (; this._ahead.length <= r; ) {
      const o = this.fetch();
      if (Fi(o))
        return o;
      (t || !t && !qi(o)) && this._ahead.push(o);
    }
    return this._ahead[r];
  }
  /**
   * Fetches the next token and advances the stream position
   * @param ws If true, retrieve whitespaces too
   */
  get(r = !1) {
    if (this._ahead.length > 0) {
      const t = this._ahead.shift();
      if (!t)
        throw new Error("Token expected");
      return t;
    }
    for (; ; ) {
      const t = this.fetch();
      if (Fi(t) || r || !r && !qi(t))
        return t;
    }
  }
  /**
   * Gets a RegEx from the current position
   */
  getRegEx() {
    return this.fetchRegEx();
  }
  /**
   * Gets the remaining characters after the parsing phase
   */
  getTail() {
    return this._ahead.length > 0 ? this.input.getTail(this._ahead[0].location.startPosition) : this.input.getTail(this._lastFetchPosition);
  }
  /**
   * Parsing template literals requires a context sensitive lexer.
   * This method has to be called by the parser when the lexer needs to scan a string inside a template literal.
   * Call this after the first opening backing and after the parser is done with parsing a placeholder, after the right brace.
   */
  setStartingPhaseToTemplateLiteral() {
    this._phaseExternallySet = 33;
  }
  /**
   * Fetches the next character from the input stream
   */
  fetchNextChar() {
    return this._prefetched || (this._prefetchedPos = this.input.position, this._prefetchedColumn = this.input.column, this._prefetched = this.input.get()), this._prefetched;
  }
  /**
   * Fetches the next token from the input stream
   */
  fetch() {
    const r = this, t = this.input, o = this._prefetchedPos || t.position, a = t.line, n = this._prefetchedColumn || t.column;
    this._lastFetchPosition = this.input.position;
    let i = null, l = "", s = d.Eof, f = t.position, h = t.column, c = null, T = !1, b = this.getStartingPhaseThenReset();
    for (; ; ) {
      if (c = this.fetchNextChar(), c === null)
        return y();
      s === d.Eof && (s = d.Unknown);
      e: switch (b) {
        case 0:
          switch (c) {
            case " ":
            case "	":
            case `
`:
            case "\r":
              b = 1, s = d.Ws;
              break;
            case "/":
              b = 5, s = d.Divide;
              break;
            case "$":
              b = 6, s = d.Identifier;
              break;
            case "*":
              b = 8, s = d.Multiply;
              break;
            case "%":
              b = 54, s = d.Remainder;
              break;
            case "+":
              b = 51, s = d.Plus;
              break;
            case "-":
              b = 52, s = d.Minus;
              break;
            case "^":
              b = 58, s = d.BitwiseXor;
              break;
            case "|":
              b = 7, s = d.BitwiseOr;
              break;
            case "&":
              b = 9, s = d.BitwiseAnd;
              break;
            case "?":
              b = 22, s = d.QuestionMark;
              break;
            case ";":
              return w(d.Semicolon);
            case ",":
              return w(d.Comma);
            case "(":
              return w(d.LParent);
            case ")":
              return w(d.RParent);
            case ":":
              b = 20, s = d.Colon;
              break;
            case "`":
              return w(d.Backtick);
            case "[":
              return w(d.LSquare);
            case "]":
              return w(d.RSquare);
            case "~":
              return w(d.BinaryNot);
            case "{":
              return w(d.LBrace);
            case "}":
              return w(d.RBrace);
            case "=":
              b = 10, s = d.Assignment;
              break;
            case "!":
              b = 13, s = d.LogicalNot;
              break;
            case "<":
              b = 14, s = d.LessThan;
              break;
            case ">":
              b = 15, s = d.GreaterThan;
              break;
            case "0":
              b = 21, s = d.DecimalLiteral;
              break;
            case ".":
              b = 18, s = d.Dot;
              break;
            case '"':
            case "'":
              i = c, b = 35;
              break;
            default:
              Ui(c) ? (T = !0, b = 17, s = d.Identifier) : Fr(c) ? (b = 27, s = d.DecimalLiteral) : w(d.Unknown);
              break;
          }
          break;
        case 6:
          if (c === "{")
            return w(d.DollarLBrace);
          b = 17, T = !0, s = d.Identifier, Gi(c) || y();
          break;
        case 1:
          if (c !== " " && c !== "	" && c !== "\r" && c !== `
`)
            return y();
          break;
        case 3:
          c === "*" && (b = 4);
          break;
        case 4:
          if (c === "/")
            return w(d.BlockComment);
          break;
        case 2:
          if (c === `
`)
            return w();
          break;
        case 17:
          if (!Gi(c))
            return y();
          break;
        case 20:
          return c === ":" ? w(d.Global) : y();
        case 5:
          if (c === "*")
            b = 3;
          else if (c === "/")
            b = 2, s = d.EolComment;
          else return c === "=" ? w(d.DivideAssignment) : y();
          break;
        case 51:
          return c === "+" ? w(d.IncOp) : c === "=" ? w(d.AddAssignment) : y();
        case 52:
          return c === "-" ? w(d.DecOp) : c === "=" ? w(d.SubtractAssignment) : y();
        case 54:
          return c === "=" ? w(d.RemainderAssignment) : y();
        case 58:
          return c === "=" ? w(d.BitwiseXorAssignment) : y();
        case 7:
          if (c === "=")
            return w(d.BitwiseOrAssignment);
          if (c === "|") {
            b = 59, s = d.LogicalOr;
            break;
          }
          return y();
        case 59:
          return c === "=" ? w(d.LogicalOrAssignment) : y();
        case 9:
          if (c === "=")
            return w(d.BitwiseAndAssignment);
          if (c === "&") {
            b = 57, s = d.LogicalAnd;
            break;
          }
          return y();
        case 57:
          return c === "=" ? w(d.LogicalAndAssignment) : y();
        case 8:
          if (c === "*") {
            b = 50, s = d.Exponent;
            break;
          } else if (c === "=")
            return w(d.MultiplyAssignment);
          return y();
        case 50:
          return c === "=" ? w(d.ExponentAssignment) : y();
        case 22:
          if (c === "?") {
            b = 60, s = d.NullCoalesce;
            break;
          }
          return c === "." ? w(d.OptionalChaining) : y();
        case 60:
          return c === "=" ? w(d.NullCoalesceAssignment) : y();
        case 10:
          if (c === ">")
            return w(d.Arrow);
          if (c === "=") {
            b = 11, s = d.Equal;
            break;
          }
          return y();
        case 11:
          return c === "=" ? w(d.StrictEqual) : y();
        case 13:
          if (c === "=") {
            b = 12, s = d.NotEqual;
            break;
          }
          return y();
        case 12:
          return c === "=" ? w(d.StrictNotEqual) : y();
        case 14:
          if (c === "=")
            return w(d.LessThanOrEqual);
          if (c === "<") {
            b = 55, s = d.ShiftLeft;
            break;
          }
          return y();
        case 55:
          return c === "=" ? w(d.ShiftLeftAssignment) : y();
        case 15:
          if (c === "=")
            return w(d.GreaterThanOrEqual);
          if (c === ">") {
            b = 16, s = d.SignedShiftRight;
            break;
          }
          return y();
        case 16:
          if (c === ">") {
            b = 56, s = d.ShiftRight;
            break;
          }
          return c === "=" ? w(d.SignedShiftRightAssignment) : y();
        case 56:
          return c === "=" ? w(d.ShiftRightAssignment) : y();
        case 21:
          if (c === "x")
            b = 23, s = d.Unknown;
          else if (c === "b")
            b = 25, s = d.Unknown;
          else if (Fr(c) || c === "_")
            b = 27;
          else if (c === ".")
            b = 28, s = d.Unknown;
          else if (c === "e" || c === "E")
            b = 30, s = d.Unknown;
          else
            return y();
          break;
        case 18:
          if (c === ".") {
            b = 19, s = d.Unknown;
            break;
          }
          if (!Fr(c))
            return y();
          b = 29, s = d.RealLiteral;
          break;
        case 19:
          return c === "." ? w(d.Spread) : y();
        case 23:
          if (c === "_")
            break;
          if (!or(c))
            return y();
          b = 24, s = d.HexadecimalLiteral;
          break;
        case 24:
          if (!or(c) && c !== "_")
            return y();
          break;
        case 25:
          if (c === "_")
            break;
          if (!Yi(c))
            return y();
          b = 26, s = d.BinaryLiteral;
          break;
        case 26:
          if (!Yi(c) && c !== "_")
            return y();
          s = d.BinaryLiteral;
          break;
        case 27:
          if (Fr(c) || c === "_")
            break;
          if (c === "." && (this.input.peek() === null || Fr(this.input.peek())))
            b = 28, s = d.Unknown;
          else if (c === "e" || c === "E")
            b = 30, s = d.Unknown;
          else
            return y();
          break;
        case 28:
          if (Fr(c))
            b = 29, s = d.RealLiteral;
          else if (c === "e" || c === "E")
            b = 30;
          else
            return y();
          break;
        case 29:
          if (c === "e" || c === "E")
            b = 30, s = d.Unknown;
          else if (!Fr(c) && c !== "_")
            return y();
          break;
        case 30:
          if (c === "+" || c === "-")
            b = 31;
          else if (Fr(c))
            b = 32, s = d.RealLiteral;
          else
            return y();
          break;
        case 31:
          if (Fr(c))
            b = 32, s = d.RealLiteral;
          else
            return y();
          break;
        case 32:
          if (!Fr(c))
            return y();
          break;
        case 34: {
          b = 33;
          const $ = this.input.ahead(0), O = this.input.ahead(1);
          if ($ === "`" || $ === "$" && O === "{")
            return w(d.StringLiteral);
          break;
        }
        case 33:
          switch (c) {
            case "\\":
              b = 34, s = d.Unknown;
              break e;
            case "`":
              return w(d.Backtick);
            case "$":
              if (this.input.ahead(0) === "{")
                return v(), this.fetchNextChar(), w(d.DollarLBrace);
          }
          const _ = this.input.ahead(0), H = this.input.ahead(1);
          if (_ === "`" || _ === "$" && H === "{")
            return w(d.StringLiteral);
          break;
        case 35:
          if (c === i)
            return w(d.StringLiteral);
          if (Lx(c))
            return w(d.Unknown);
          c === "\\" && (b = 36, s = d.Unknown);
          break;
        case 36:
          switch (c) {
            case "b":
            case "f":
            case "n":
            case "r":
            case "t":
            case "v":
            case "S":
            case "0":
            case "'":
            case '"':
            case "`":
            case "\\":
              b = 35;
              break;
            case "x":
              b = 37;
              break;
            case "u":
              b = 39;
              break;
            default:
              b = 35;
              break;
          }
          break;
        case 37:
          if (or(c))
            b = 38;
          else
            return w(d.Unknown);
          break;
        case 38:
          if (or(c))
            b = 35;
          else
            return w(d.Unknown);
          break;
        case 39:
          if (c === "{") {
            b = 43;
            break;
          }
          if (or(c))
            b = 40;
          else
            return w(d.Unknown);
          break;
        case 40:
          if (or(c))
            b = 41;
          else
            return w(d.Unknown);
          break;
        case 41:
          if (or(c))
            b = 42;
          else
            return w(d.Unknown);
          break;
        case 42:
          if (or(c))
            b = 35;
          else
            return w(d.Unknown);
          break;
        case 43:
          if (or(c))
            b = 44;
          else
            return w(d.Unknown);
          break;
        case 44:
          if (c === "}")
            b = 35;
          else if (or(c))
            b = 45;
          else
            return w(d.Unknown);
          break;
        case 45:
          if (c === "}")
            b = 35;
          else if (or(c))
            b = 46;
          else
            return w(d.Unknown);
          break;
        case 46:
          if (c === "}")
            b = 35;
          else if (or(c))
            b = 47;
          else
            return w(d.Unknown);
          break;
        case 47:
          if (c === "}")
            b = 35;
          else if (or(c))
            b = 48;
          else
            return w(d.Unknown);
          break;
        case 48:
          if (c === "}")
            b = 35;
          else if (or(c))
            b = 49;
          else
            return w(d.Unknown);
          break;
        case 49:
          if (c === "}")
            b = 35;
          else
            return w(d.Unknown);
          break;
        default:
          return y();
      }
      v();
    }
    function v() {
      l += c, r._prefetched = null, r._prefetchedPos = null, r._prefetchedColumn = null, f = t.position, h = t.position;
    }
    function y() {
      return T && (s = fe.get(l) ?? (Ui(l[0]) && l[l.length - 1] !== "'" ? d.Identifier : d.Unknown)), {
        text: l,
        type: s,
        location: {
          startPosition: o,
          endPosition: f,
          startLine: a,
          endLine: a,
          startColumn: n,
          endColumn: h
        }
      };
    }
    function w(_) {
      return v(), _ !== void 0 && (s = _), y();
    }
  }
  getStartingPhaseThenReset() {
    if (this._phaseExternallySet !== null) {
      const r = this._phaseExternallySet;
      return this._phaseExternallySet = null, r;
    }
    return 0;
  }
  /**
   * Fetches the next RegEx token from the input stream
   */
  fetchRegEx() {
    const r = this._ahead.length > 0 ? this._ahead[0].location.startPosition : this._lastFetchPosition, t = this.input.getTail(r);
    try {
      const o = yi(t), a = o.raw;
      for (let n = 1; n < a.length; n++)
        this.fetchNextChar(), this._prefetched = null, this._prefetchedPos = null, this._prefetchedColumn = null;
      return this._ahead.length = 0, {
        success: !0,
        pattern: o.pattern.raw,
        flags: o.flags.raw,
        length: a.length
      };
    } catch (o) {
      let a = o.index;
      if (o.toString().includes("Invalid flag"))
        for (; a < t.length && "dgimsuy".includes(t[a]); )
          a++;
      if (a === void 0)
        return {
          success: !1,
          pattern: t[0]
        };
      const n = t.substring(0, a);
      try {
        const i = yi(n), l = i.raw;
        for (let s = 1; s < l.length; s++)
          this.fetchNextChar(), this._prefetched = null, this._prefetchedPos = null, this._prefetchedColumn = null;
        return this._ahead.length = 0, {
          success: !0,
          pattern: i.pattern.raw,
          flags: i.flags.raw,
          length: l.length
        };
      } catch {
        return {
          success: !1,
          pattern: n
        };
      }
    }
  }
}
const fe = /* @__PURE__ */ new Map();
fe.set("typeof", d.Typeof);
fe.set("Infinity", d.Infinity);
fe.set("NaN", d.NaN);
fe.set("true", d.True);
fe.set("false", d.False);
fe.set("undefined", d.Undefined);
fe.set("null", d.Null);
fe.set("in", d.In);
fe.set("let", d.Let);
fe.set("const", d.Const);
fe.set("var", d.Var);
fe.set("if", d.If);
fe.set("else", d.Else);
fe.set("return", d.Return);
fe.set("break", d.Break);
fe.set("continue", d.Continue);
fe.set("do", d.Do);
fe.set("while", d.While);
fe.set("for", d.For);
fe.set("of", d.Of);
fe.set("try", d.Try);
fe.set("catch", d.Catch);
fe.set("finally", d.Finally);
fe.set("throw", d.Throw);
fe.set("switch", d.Switch);
fe.set("case", d.Case);
fe.set("default", d.Default);
fe.set("delete", d.Delete);
fe.set("function", d.Function);
fe.set("export", d.Export);
fe.set("import", d.Import);
fe.set("as", d.As);
fe.set("from", d.From);
function Fi(e) {
  return e.type === d.Eof;
}
function qi(e) {
  return e.type <= d.Ws;
}
function Ui(e) {
  return e >= "a" && e <= "z" || e >= "A" && e <= "Z" || e === "_" || e === "$";
}
function Gi(e) {
  return e >= "a" && e <= "z" || e >= "A" && e <= "Z" || e >= "0" && e <= "9" || e === "_" || e === "$";
}
function Yi(e) {
  return e === "0" || e === "1";
}
function Fr(e) {
  return e >= "0" && e <= "9";
}
function or(e) {
  return e >= "0" && e <= "9" || e >= "A" && e <= "F" || e >= "a" && e <= "f";
}
function Lx(e) {
  return e === "\r" || e === `
` || e === "" || e === "\u2028" || e === "\u2029";
}
let _x = class gl extends Error {
  constructor(r, t) {
    super(r), this.code = t, Object.setPrototypeOf(this, gl.prototype);
  }
};
const Xo = {
  W001: "An expression expected",
  W002: "Unexpected token: {0}",
  W003: "An identifier expected",
  W004: "'}' expected",
  W005: "']' expected",
  W006: "')' expected",
  W007: "Invalid object property name type",
  W008: "':' expected",
  W009: "'=' expected",
  W010: "Invalid argument list",
  W011: "For loop variable must be initialized",
  W012: "'{' expected",
  W013: "'catch' or 'finally' expected",
  W014: "'(' or expected",
  W015: "'case' or 'default' expected",
  W016: "'default' case can be used only once within a switch statement",
  W017: "Invalid sequence expression",
  W018: "Invalid object literal",
  W019: "Identifier '{0}' is already imported",
  W020: "Function '{0}' is already defined in the module",
  W021: "'{0}' is already exported from the module",
  W022: "Cannot find module '{0}'",
  W023: "Module '{0}' does not export '{1}'",
  W024: "'function' or 'const' expected",
  W025: "'from' expected",
  W026: "A string literal expected",
  W027: "Variables can be declared only in the top level module",
  W028: "Invalid statement used in a module",
  W029: "An imported module can contain only exported functions",
  W030: "Nested declarations cannot be exported",
  W031: "An identifier in a declaration cannot start with '$'"
};
class Tl {
  /**
   * Initializes the parser with the specified source code
   * @param source Source code to parse
   */
  constructor(r) {
    this.source = r, this._parseErrors = [], this._statementLevel = 0, this._lexer = new $x(new Ix(r));
  }
  /**
   * The errors raised during the parse phase
   */
  get errors() {
    return this._parseErrors;
  }
  /**
   * Gets the current token
   */
  get current() {
    return this._lexer.peek();
  }
  /**
   * Checks if we're at the end of the expression
   */
  get isEof() {
    return this._lexer.peek().type === d.Eof;
  }
  /**
   * Gets the characters remaining after parsing
   */
  getTail() {
    return this._lexer.getTail();
  }
  // ==========================================================================
  // Statement parsing
  /**
   * Parses a list of statements:
   *
   * statements
   *   : statement*
   *   ;
   *
   * statement
   *   : emptyStatement
   *   | expressionStatement
   *   | letStatement
   *   | returnStatement
   *   ;
   */
  parseStatements() {
    this._statementLevel = 0;
    const r = [];
    for (; !this.isEof; ) {
      const t = this.parseStatement();
      if (!t) return null;
      r.push(t), t.type !== "EmptyS" && this.skipToken(d.Semicolon);
    }
    return r;
  }
  /**
   * Parses a single statement
   */
  parseStatement(r = !0) {
    this._statementLevel++;
    try {
      const t = this._lexer.peek();
      switch (t.type) {
        case d.Semicolon:
          return this.parseEmptyStatement();
        case d.Let:
          return this.parseLetStatement();
        case d.Const:
          return this.parseConstStatement();
        case d.Var:
          return this.parseVarStatement();
        case d.LBrace:
          return this.parseBlockStatement();
        case d.If:
          return this.parseIfStatement();
        case d.Do:
          return this.parseDoWhileStatement();
        case d.While:
          return this.parseWhileStatement();
        case d.Return:
          return this.parseReturnStatement();
        case d.Break:
          return this._lexer.get(), this.createStatementNode("BrkS", {}, t, t);
        case d.Continue:
          return this._lexer.get(), this.createStatementNode("ContS", {}, t, t);
        case d.For:
          return this.parseForStatement();
        case d.Throw:
          return this.parseThrowStatement();
        case d.Try:
          return this.parseTryStatement();
        case d.Switch:
          return this.parseSwitchStatement();
        case d.Function:
          return this.parseFunctionDeclaration();
        case d.Export:
          return this.parseExport();
        case d.Import:
          return this.parseImport();
        default:
          return t.type === d.Eof ? (this.reportError("W002", t, "EOF"), null) : this.isExpressionStart(t) ? this.parseExpressionStatement(r) : (this.reportError("W002", t, t.text), null);
      }
    } finally {
      this._statementLevel--;
    }
  }
  /**
   * Parses an empty statement
   *
   * emptyStatement
   *   : ";"
   *   ;
   */
  parseEmptyStatement() {
    const r = this._lexer.get();
    return this.createStatementNode("EmptyS", {}, r, r);
  }
  /**
   * Parses an expression statement
   *
   * expressionStatement
   *   : expression
   *   ;
   */
  parseExpressionStatement(r = !0) {
    const t = this._lexer.peek(), o = this.getExpression(r);
    return o ? this.createStatementNode(
      "ExprS",
      {
        expression: o
      },
      t,
      o.endToken
    ) : null;
  }
  /**
   * Parses a let statement
   *
   * letStatement
   *   : "let" id ["=" expression] ("," id ["=" expression])*
   *   ;
   */
  parseLetStatement() {
    const r = this._lexer.get();
    let t = r;
    const o = [];
    for (; ; ) {
      const a = this._lexer.peek();
      let n = {};
      if (a.type === d.LBrace) {
        t = this._lexer.ahead(1);
        const s = this.parseObjectDestructure();
        if (s === null) return null;
        n = {
          objectDestruct: s
        }, t = s.length > 0 ? s[s.length - 1].endToken : t;
      } else if (a.type === d.LSquare) {
        t = this._lexer.ahead(1);
        const s = this.parseArrayDestructure();
        if (s === null) return null;
        n = {
          arrayDestruct: s
        }, t = s.length > 0 ? s[s.length - 1].endToken : t;
      } else if (a.type === d.Identifier) {
        if (a.text.startsWith("$"))
          return this.reportError("W031"), null;
        t = this._lexer.get(), n = {
          id: a.text
        };
      } else
        return this.reportError("W003"), null;
      const i = this._lexer.peek();
      let l = null;
      if (i.type === d.Assignment) {
        if (this._lexer.get(), l = this.getExpression(!1), l === null) return null;
        n.expression = l, t = l.endToken;
      } else if (n.arrayDestruct || n.objectDestruct)
        return this.reportError("W009", i), null;
      if (o.push(
        this.createExpressionNode("VarD", n, a, t)
      ), this._lexer.peek().type !== d.Comma) break;
      this._lexer.get();
    }
    return this.createStatementNode(
      "LetS",
      {
        declarations: o
      },
      r,
      t
    );
  }
  /**
   * Parses a const statement
   *
   * constStatement
   *   : "const" id "=" expression
   *   ;
   */
  parseConstStatement() {
    const r = this._lexer.get();
    let t = r;
    const o = [];
    for (; ; ) {
      const a = this._lexer.peek();
      let n = {};
      if (a.type === d.LBrace) {
        t = this._lexer.ahead(1);
        const l = this.parseObjectDestructure();
        if (l === null) return null;
        n = {
          objectDestruct: l
        }, t = l.length > 0 ? l[l.length - 1].endToken : t;
      } else if (a.type === d.LSquare) {
        t = this._lexer.ahead(1);
        const l = this.parseArrayDestructure();
        if (l === null) return null;
        n = {
          arrayDestruct: l
        }, t = l.length > 0 ? l[l.length - 1].endToken : t;
      } else if (a.type === d.Identifier) {
        if (a.text.startsWith("$"))
          return this.reportError("W031"), null;
        t = this._lexer.get(), n = {
          id: a.text
        };
      } else
        return this.reportError("W003"), null;
      this.expectToken(d.Assignment);
      const i = this.getExpression(!1);
      if (i === null) return null;
      if (n.expression = i, t = i.endToken, o.push(
        this.createExpressionNode("VarD", n, a, t)
      ), this._lexer.peek().type !== d.Comma) break;
      this._lexer.get();
    }
    return this.createStatementNode(
      "ConstS",
      {
        declarations: o
      },
      r,
      t
    );
  }
  /**
   * Parses a const statement
   *
   * constStatement
   *   : "var" id "=" expression
   *   ;
   */
  parseVarStatement() {
    const r = this._lexer.get();
    let t = r;
    const o = [];
    for (; ; ) {
      const a = this._lexer.peek();
      let n = {};
      if (a.type === d.Identifier) {
        if (a.text.startsWith("$"))
          return this.reportError("W031"), null;
        t = this._lexer.get(), n = {
          id: a.text
        };
      } else
        return this.reportError("W003"), null;
      this.expectToken(d.Assignment);
      const i = this.getExpression(!1);
      if (i === null) return null;
      if (n.expression = i, t = i.endToken, o.push(
        this.createExpressionNode(
          "RVarD",
          n,
          a,
          t
        )
      ), this._lexer.peek().type !== d.Comma) break;
      this._lexer.get();
    }
    return this.createStatementNode(
      "VarS",
      {
        declarations: o
      },
      r,
      t
    );
  }
  /**
   * Parses an object destructure expression
   */
  parseObjectDestructure() {
    const r = [], t = this._lexer.get();
    let o = t, a = this._lexer.peek();
    for (; a.type === d.Identifier; ) {
      const n = a.text;
      if (n.startsWith("$"))
        return this.reportError("W031"), null;
      let i, l, s;
      if (this._lexer.get(), a = this._lexer.peek(), a.type === d.Colon) {
        if (this._lexer.get(), a = this._lexer.peek(), a.type === d.Identifier)
          i = a.text, o = a, this._lexer.get();
        else if (a.type === d.LSquare) {
          if (l = this.parseArrayDestructure(), l === null) return null;
          o = l[l.length - 1].endToken;
        } else if (a.type === d.LBrace) {
          if (s = this.parseObjectDestructure(), s === null) return null;
          o = s[s.length - 1].endToken;
        }
      }
      a = this._lexer.peek(), (a.type === d.Comma || a.type === d.RBrace) && (r.push(
        this.createExpressionNode(
          "ODestr",
          { id: n, alias: i, arrayDestruct: l, objectDestruct: s },
          t,
          o
        )
      ), a.type === d.Comma && (this._lexer.get(), a = this._lexer.peek()));
    }
    return this.expectToken(d.RBrace, "W004"), r;
  }
  parseArrayDestructure() {
    const r = [], t = this._lexer.get();
    let o = t;
    do {
      let a = this._lexer.peek(), n, i, l;
      if (a.type === d.Identifier) {
        if (n = a.text, n.startsWith("$"))
          return this.reportError("W031"), null;
        o = a, a = this._lexer.get();
      } else if (a.type === d.LSquare) {
        if (i = this.parseArrayDestructure(), i === null) return null;
        o = i[i.length - 1].endToken;
      } else if (a.type === d.LBrace) {
        if (l = this.parseObjectDestructure(), l === null) return null;
        o = l[l.length - 1].endToken;
      }
      if (a = this._lexer.peek(), a.type === d.Comma)
        r.push(
          this.createExpressionNode(
            "ADestr",
            { id: n, arrayDestruct: i, objectDestruct: l },
            t,
            o
          )
        ), this._lexer.get();
      else if (a.type === d.RSquare) {
        (n || i || l) && r.push(
          this.createExpressionNode(
            "ADestr",
            { id: n, arrayDestruct: i, objectDestruct: l },
            t,
            o
          )
        );
        break;
      } else
        return this.reportError("W002", a), null;
    } while (!0);
    return this.expectToken(d.RSquare, "W005"), r;
  }
  /**
   * Parses a block statement
   *
   * blockStatement
   *   : "{" (statement [";"])* "}"
   *   ;
   */
  parseBlockStatement() {
    const r = this._lexer.get(), t = [];
    for (; this._lexer.peek().type !== d.RBrace; ) {
      const a = this.parseStatement();
      if (!a) return null;
      t.push(a), a.type !== "EmptyS" && this.skipToken(d.Semicolon);
    }
    const o = this._lexer.get();
    return this.createStatementNode("BlockS", { statements: t }, r, o);
  }
  /**
   * Parses an if statement
   *
   * ifStatement
   *   : "if" "(" expression ")" statement ["else" statement]
   *   ;
   */
  parseIfStatement() {
    const r = this._lexer.get();
    let t = r;
    this.expectToken(d.LParent, "W014");
    const o = this.getExpression();
    if (!o) return null;
    this.expectToken(d.RParent, "W006");
    const a = this.parseStatement();
    if (!a) return null;
    t = a.endToken;
    let n = !0;
    a.type !== "BlockS" && (this._lexer.peek().type === d.Semicolon ? this._lexer.get() : n = !1);
    let i = null;
    if (n && this._lexer.peek().type === d.Else) {
      if (this._lexer.get(), i = this.parseStatement(), !i) return null;
      t = i.endToken;
    }
    return this.createStatementNode(
      "IfS",
      {
        condition: o,
        thenBranch: a,
        elseBranch: i
      },
      r,
      t
    );
  }
  /**
   * Parses a while statement
   *
   * whileStatement
   *   : "while" "(" condition ")" statement
   *   ;
   */
  parseWhileStatement() {
    const r = this._lexer.get();
    this.expectToken(d.LParent, "W014");
    const t = this.getExpression();
    if (!t) return null;
    this.expectToken(d.RParent, "W006");
    const o = this.parseStatement();
    return o ? this.createStatementNode(
      "WhileS",
      {
        condition: t,
        body: o
      },
      r,
      o.endToken
    ) : null;
  }
  /**
   * Parses a do-while statement
   *
   * doWhileStatement
   *   : "do" statement "while" "(" condition ")"
   *   ;
   */
  parseDoWhileStatement() {
    const r = this._lexer.get(), t = this.parseStatement();
    if (!t) return null;
    t.type !== "BlockS" && t.type !== "EmptyS" && this.expectToken(d.Semicolon), this.expectToken(d.While), this.expectToken(d.LParent, "W014");
    const o = this.getExpression();
    if (!o) return null;
    const a = this._lexer.peek();
    return this.expectToken(d.RParent, "W006"), this.createStatementNode(
      "DoWS",
      {
        condition: o,
        body: t
      },
      r,
      a
    );
  }
  /**
   * Parses an expression statement
   *
   * returnStatement
   *   : "return" expression?
   *   ;
   */
  parseReturnStatement() {
    const r = this._lexer.peek();
    let t = this._lexer.get(), o;
    if ($t[this._lexer.peek().type].expressionStart) {
      if (o = this.getExpression(), o === null) return null;
      t = o.endToken;
    }
    return this.createStatementNode(
      "RetS",
      {
        expression: o
      },
      r,
      t
    );
  }
  /**
   * forStatement
   *   : "for" "(" initStatement? ";" expression? ";" expression? ")" statement
   *   | forInOfStatement
   *   ;
   */
  parseForStatement() {
    const r = this._lexer.peek();
    this._lexer.get(), this.expectToken(d.LParent, "W014");
    let t = this._lexer.peek();
    if (t.type === d.Identifier) {
      if (this._lexer.ahead(1).type === d.In)
        return this.parseForInOfStatement(r, "none", t.text, "ForInS");
      if (this._lexer.ahead(1).type === d.Of)
        return this.parseForInOfStatement(r, "none", t.text, "ForOfS");
    } else if (t.type === d.Let) {
      const l = this._lexer.ahead(1);
      if (l.type === d.Identifier) {
        const s = this._lexer.ahead(2);
        if (s.type === d.In)
          return this.parseForInOfStatement(r, "let", l.text, "ForInS");
        if (s.type === d.Of)
          return this.parseForInOfStatement(r, "let", l.text, "ForOfS");
      }
    } else if (t.type === d.Const) {
      const l = this._lexer.ahead(1);
      if (l.type === d.Identifier) {
        const s = this._lexer.ahead(2);
        if (s.type === d.In)
          return this.parseForInOfStatement(r, "const", l.text, "ForInS");
        if (s.type === d.Of)
          return this.parseForInOfStatement(r, "const", l.text, "ForOfS");
      }
    }
    let o;
    if (t = this._lexer.peek(), t.type === d.Semicolon)
      this._lexer.get();
    else if (t.type === d.Let) {
      const l = this.parseLetStatement();
      if (l === null)
        return null;
      if (o = l, o.declarations.some((s) => !s.expression))
        return this.reportError("W011"), null;
      this.expectToken(d.Semicolon);
    } else if ($t[t.type].expressionStart) {
      const l = this.parseExpressionStatement();
      if (l === null)
        return null;
      o = l, this.expectToken(d.Semicolon);
    }
    let a;
    if (t = this._lexer.peek(), t.type === d.Semicolon)
      this._lexer.get();
    else {
      if (a = this.getExpression(), a === null)
        return null;
      this.expectToken(d.Semicolon);
    }
    let n;
    if (t = this._lexer.peek(), t.type !== d.RParent && (n = this.getExpression(), n === null))
      return null;
    this.expectToken(d.RParent, "W006");
    const i = this.parseStatement();
    return i ? this.createStatementNode(
      "ForS",
      {
        init: o,
        condition: a,
        update: n,
        body: i
      },
      r,
      i.endToken
    ) : null;
  }
  /**
   * forInOfStatement
   *   : "for" "(" [ "let" | "const" ] identifier ( "in" | "of" ) expression? ")" statement
   *   | forInOfStatement
   *   ;
   *
   * @param startToken Statement start token
   * @param varBinding Variable binding of the for..in/of statement
   * @param id ID name
   * @param type Is it a for..in or a for..of?
   */
  parseForInOfStatement(r, t, o, a) {
    if (t !== "none") {
      if (o.startsWith("$"))
        return this.reportError("W031"), null;
      this._lexer.get();
    }
    this._lexer.get(), this._lexer.get();
    const n = this.getExpression(!0);
    this.expectToken(d.RParent, "W006");
    const i = this.parseStatement();
    return i ? a === "ForInS" ? this.createStatementNode(
      "ForInS",
      {
        varBinding: t,
        id: o,
        expression: n,
        body: i
      },
      r,
      i.endToken
    ) : this.createStatementNode(
      "ForOfS",
      {
        varBinding: t,
        id: o,
        expression: n,
        body: i
      },
      r,
      i.endToken
    ) : null;
  }
  /**
   * Parses a throw statement
   *
   * throwStatement
   *   : "throw" expression
   *   ;
   */
  parseThrowStatement() {
    const r = this._lexer.peek();
    this._lexer.get();
    let t;
    return t = this.getExpression(), t === null ? null : this.createStatementNode(
      "ThrowS",
      {
        expression: t
      },
      r,
      t.endToken
    );
  }
  /**
   * Parses a try..catch..finally statement
   *
   * tryStatement
   *   : "try" blockStatement catchClause finallyClause?
   *   | "try" blockStatement catchClause? finallyClause
   *   ;
   *
   * catchClause
   *   : "catch" [ "(" identifier ") ]? blockStatement
   *   ;
   *
   * finallyClause
   *   : "finally" blockStatement
   */
  parseTryStatement() {
    const r = this._lexer.peek();
    let t = this._lexer.get();
    const o = this, a = f();
    let n, i, l, s = this._lexer.peek();
    if (s.type === d.Catch) {
      if (this._lexer.get(), s = this._lexer.peek(), s.type === d.LParent) {
        if (this._lexer.get(), s = this._lexer.peek(), s.type !== d.Identifier)
          return this.reportError("W003", s), null;
        i = s.text, this._lexer.get(), this.expectToken(d.RParent, "W006");
      }
      n = f(), t = n.endToken, this._lexer.peek().type === d.Finally && (this._lexer.get(), l = f(), t = l.endToken);
    } else if (s.type === d.Finally)
      this._lexer.get(), l = f(), t = l.endToken;
    else
      return this.reportError("W013", s), null;
    return this.createStatementNode(
      "TryS",
      {
        tryBlock: a,
        catchBlock: n,
        catchVariable: i,
        finallyBlock: l
      },
      r,
      t
    );
    function f() {
      const h = o._lexer.peek();
      return h.type !== d.LBrace ? (o.reportError("W012", h), null) : o.parseBlockStatement();
    }
  }
  /**
   * Parses a switch statement
   *
   * switchStatement
   *   : "switch" "(" expression ")" "{" caseClauses "}"
   *   ;
   *
   * caseClauses
   *   : "case" expression ":" statement*
   *   | "default" ":" statement*
   *   ;
   */
  parseSwitchStatement() {
    const r = this._lexer.get();
    this.expectToken(d.LParent, "W014");
    const t = this.getExpression();
    if (!t) return null;
    this.expectToken(d.RParent, "W006"), this.expectToken(d.LBrace, "W012");
    const o = [];
    let a = !1;
    for (; ; ) {
      let i = this._lexer.peek(), l;
      if (i.type === d.Case) {
        if (this._lexer.get(), l = this.getExpression(), !l) return null;
      } else if (i.type === d.Default) {
        if (a)
          return this.reportError("W016"), null;
        a = !0, this._lexer.get();
      } else {
        if (i.type === d.RBrace)
          break;
        return this.reportError("W015"), null;
      }
      this.expectToken(d.Colon, "W008");
      let s = [], f = !1;
      for (; !f; )
        switch (this._lexer.peek().type) {
          case d.Case:
          case d.Default:
          case d.RBrace:
            f = !0;
            break;
          default:
            const c = this.parseStatement();
            if (c === null) {
              f = !0;
              break;
            }
            s.push(c), c.type !== "EmptyS" && this.skipToken(d.Semicolon);
        }
      o.push(
        this.createNode(
          "SwitchC",
          {
            caseExpression: l,
            statements: s
          },
          r
        )
      );
    }
    const n = this._lexer.peek();
    return this.expectToken(d.RBrace, "W004"), this.createStatementNode(
      "SwitchS",
      {
        expression: t,
        cases: o
      },
      r,
      n
    );
  }
  /**
   * Parses a function declaration
   *
   * functionDeclaration
   *   : "function" identifier "(" [parameterList] ")" blockStatement
   *   ;
   */
  parseFunctionDeclaration(r = !1) {
    const t = this._lexer.get();
    let o;
    const a = this._lexer.peek();
    if (r) {
      if (a.type !== d.LParent) {
        if (a.type !== d.Identifier)
          return this.reportError("W003", a), null;
        o = a.text, this._lexer.get();
      }
    } else {
      if (a.type !== d.Identifier)
        return this.reportError("W003", a), null;
      o = a.text, this._lexer.get();
    }
    const n = this._lexer.peek();
    if (n.type !== d.LParent)
      return this.reportError("W014", n), null;
    const i = this.getExpression(!0);
    let l;
    const s = [];
    switch (i.type) {
      case "NoArgE":
        l = !0;
        break;
      case "IdE":
        l = (i.parenthesized ?? 0) <= 1, s.push(i);
        break;
      case "SeqE":
        l = i.parenthesized === 1;
        let h = !1;
        if (l)
          for (const c of i.expressions) {
            if (h) {
              l = !1;
              break;
            }
            switch (c.type) {
              case "IdE":
                l = !c.parenthesized, s.push(c);
                break;
              case "OLitE": {
                if (l = !c.parenthesized, l) {
                  const T = this.convertToObjectDestructure(c);
                  T && s.push(T);
                }
                break;
              }
              case "ALitE": {
                if (l = !c.parenthesized, l) {
                  const T = this.convertToArrayDestructure(c);
                  T && s.push(T);
                }
                break;
              }
              case "SpreadE": {
                if (h = !0, c.operand.type !== "IdE") {
                  l = !1;
                  break;
                }
                s.push(c);
                break;
              }
              default:
                l = !1;
                break;
            }
          }
        break;
      case "OLitE":
        if (l = i.parenthesized === 1, l) {
          const c = this.convertToObjectDestructure(i);
          c && s.push(c);
        }
        break;
      case "ALitE":
        if (l = i.parenthesized === 1, l) {
          const c = this.convertToArrayDestructure(i);
          c && s.push(c);
        }
        break;
      case "SpreadE":
        if (i.operand.type !== "IdE") {
          l = !1;
          break;
        }
        l = !0, s.push(i);
        break;
      default:
        l = !1;
    }
    if (!l)
      return this.reportError("W010", t), null;
    if (this._lexer.peek().type !== d.LBrace)
      return this.reportError("W012", this._lexer.peek()), null;
    const f = this.parseBlockStatement();
    return f ? this.createStatementNode(
      "FuncD",
      {
        name: o,
        args: s,
        statement: f
      },
      t,
      f.endToken
    ) : null;
  }
  /**
   * Parses an export statement
   *
   * exportStatement
   *   : "export" (constStatement | functionDeclaration)
   *   ;
   */
  parseExport() {
    this._lexer.get();
    const r = this._lexer.peek();
    if (r.type === d.Const) {
      if (this._statementLevel > 1)
        return this.reportError("W030", r), null;
      const t = this.parseConstStatement();
      return t === null ? null : { ...t, isExported: !0 };
    } else if (r.type === d.Function) {
      if (this._statementLevel > 1)
        return this.reportError("W030", r), null;
      const t = this.parseFunctionDeclaration();
      return t === null ? null : { ...t, isExported: !0 };
    }
    return this.reportError("W024", r), null;
  }
  /**
   * Parse an import declaration
   *
   * importDeclaration
   *   : "import" "{" importItem ("," importItem)* [ "," ] "}" from module
   *   ;
   *
   * importItem
   *   : identifier [ "as" identifier ]
   *   ;
   */
  parseImport() {
    const r = this._lexer.get();
    this.expectToken(d.LBrace, "W012");
    const t = {};
    let o = this._lexer.peek();
    for (; o.type !== d.RBrace; ) {
      if (o.type !== d.Identifier)
        return this.reportError("W003", o), null;
      const i = o.text;
      if (this._lexer.get(), o = this._lexer.peek(), o.type === d.As) {
        if (this._lexer.get(), o = this._lexer.peek(), o.type !== d.Identifier)
          return this.reportError("W003", o), null;
        if (t[o.text])
          return this.reportError("W019", o, o.text), null;
        t[o.text] = i, this._lexer.get();
      } else {
        if (t[i])
          return this.reportError("W019", o, i), null;
        t[i] = i;
      }
      o = this._lexer.peek(), o.type === d.Comma && (this._lexer.get(), o = this._lexer.peek());
    }
    this._lexer.get(), this.expectToken(d.From, "W025");
    const a = this._lexer.peek();
    if (a.type !== d.StringLiteral)
      return this.reportError("W026", a), null;
    this._lexer.get();
    const n = this.parseStringLiteral(a);
    return this.createStatementNode(
      "ImportD",
      {
        imports: t,
        moduleFile: n.value
      },
      r,
      a
    );
  }
  // ==========================================================================
  // Expression parsing
  /**
   * Parses an expression:
   *
   * expr
   *   : sequenceExpr
   *   ;
   */
  parseExpr(r = !0) {
    return r ? this.parseSequenceExpression() : this.parseCondOrSpreadOrAsgnOrArrowExpr();
  }
  /**
   * sequenceExpr
   *   : conditionalExpr ( "," conditionalExpr )?
   */
  parseSequenceExpression() {
    const r = this._lexer.peek();
    let t = r, o = this.parseCondOrSpreadOrAsgnOrArrowExpr();
    if (!o)
      return null;
    t = o.endToken;
    const a = [];
    let n = !1;
    if (this._lexer.peek().type === d.Comma)
      for (a.push(o); this.skipToken(d.Comma); )
        if (this._lexer.peek().type === d.Comma)
          n = !0, t = this._lexer.peek(), a.push(
            this.createExpressionNode("NoArgE", {}, t, t)
          );
        else {
          const i = this.parseCondOrSpreadOrAsgnOrArrowExpr();
          if (!i)
            break;
          t = i.endToken, a.push(i);
        }
    return a.length && (o = this.createExpressionNode(
      "SeqE",
      {
        expressions: a,
        loose: n
      },
      r,
      t
    ), n && (o = this.convertToArrayDestructure(o))), o;
  }
  /**
   * conditionalOrSpreadOrAsgnOrArrowExpr
   *   : nullCoalescingExpr ( "?" expr ":" expr )?
   *   | "..." nullCoalescingExpr
   *   | identifier "=" expr
   *   ;
   */
  parseCondOrSpreadOrAsgnOrArrowExpr() {
    const r = this._lexer.peek();
    if (r.type === d.Spread) {
      this._lexer.get();
      const a = this.parseNullCoalescingExpr();
      return a ? this.createExpressionNode(
        "SpreadE",
        {
          operand: a
        },
        r,
        a.endToken
      ) : null;
    }
    if (r.type === d.Function) {
      const a = this.parseFunctionDeclaration(!0);
      return a ? this.createExpressionNode(
        "ArrowE",
        {
          name: a.name,
          args: a.args,
          statement: a.statement
        },
        r,
        a.endToken
      ) : null;
    }
    const t = this.parseNullCoalescingExpr();
    if (!t)
      return null;
    const o = this._lexer.peek();
    if (o.type === d.Arrow)
      return this.parseArrowExpression(r, t);
    if (o.type === d.QuestionMark) {
      this._lexer.get();
      const a = this.getExpression(!1);
      this.expectToken(d.Colon);
      const n = this.getExpression(!1);
      return this.createExpressionNode(
        "CondE",
        {
          condition: t,
          consequent: a,
          alternate: n
        },
        r,
        n.endToken
      );
    }
    if ($t[o.type].isAssignment) {
      this._lexer.get();
      const a = this.getExpression();
      return a ? this.createExpressionNode(
        "AsgnE",
        {
          leftValue: t,
          operator: o.text,
          operand: a
        },
        r,
        a.endToken
      ) : null;
    }
    return t;
  }
  /**
   * Parses an arrow expression
   * @param start Start token
   * @param left Expression to the left from the arrow
   */
  parseArrowExpression(r, t) {
    let o;
    const a = [];
    switch (t.type) {
      case "NoArgE":
        o = !0;
        break;
      case "IdE":
        o = (t.parenthesized ?? 0) <= 1, a.push(t);
        break;
      case "SeqE":
        o = t.parenthesized === 1;
        let i = !1;
        if (o)
          for (const l of t.expressions) {
            if (i) {
              o = !1;
              break;
            }
            switch (l.type) {
              case "IdE":
                o = !l.parenthesized, a.push(l);
                break;
              case "OLitE": {
                if (o = !l.parenthesized, o) {
                  const s = this.convertToObjectDestructure(l);
                  s && a.push(s);
                }
                break;
              }
              case "ALitE": {
                if (o = !l.parenthesized, o) {
                  const s = this.convertToArrayDestructure(l);
                  s && a.push(s);
                }
                break;
              }
              case "SpreadE": {
                if (i = !0, l.operand.type !== "IdE") {
                  o = !1;
                  break;
                }
                a.push(l);
                break;
              }
              default:
                o = !1;
                break;
            }
          }
        break;
      case "OLitE":
        if (o = t.parenthesized === 1, o) {
          const l = this.convertToObjectDestructure(t);
          l && a.push(l);
        }
        break;
      case "ALitE":
        if (o = t.parenthesized === 1, o) {
          const l = this.convertToArrayDestructure(t);
          l && a.push(l);
        }
        break;
      case "SpreadE":
        o = t.operand.type === "IdE", o && a.push(t);
        break;
      default:
        o = !1;
    }
    if (!o)
      return this.reportError("W010", r), null;
    this._lexer.get();
    const n = this.parseStatement(!1);
    return n ? this.createExpressionNode(
      "ArrowE",
      {
        args: a,
        statement: n
      },
      r,
      n.endToken
    ) : null;
  }
  /**
   * nullCoalescingExpr
   *   : logicalOrExpr ( "??" logicalOrExpr )?
   *   ;
   */
  parseNullCoalescingExpr() {
    const r = this._lexer.peek();
    let t = this.parseLogicalOrExpr();
    if (!t)
      return null;
    for (; this.skipToken(d.NullCoalesce); ) {
      const o = this.parseLogicalOrExpr();
      if (!o)
        return this.reportError("W001"), null;
      let a = o.endToken;
      t = this.createExpressionNode(
        "BinaryE",
        {
          operator: "??",
          left: t,
          right: o
        },
        r,
        a
      );
    }
    return t;
  }
  /**
   * logicalOrExpr
   *   : logicalAndExpr ( "||" logicalAndExpr )?
   *   ;
   */
  parseLogicalOrExpr() {
    const r = this._lexer.peek();
    let t = this.parseLogicalAndExpr();
    if (!t)
      return null;
    for (; this.skipToken(d.LogicalOr); ) {
      const o = this.parseLogicalAndExpr();
      if (!o)
        return this.reportError("W001"), null;
      let a = o.endToken;
      t = this.createExpressionNode(
        "BinaryE",
        {
          operator: "||",
          left: t,
          right: o
        },
        r,
        a
      );
    }
    return t;
  }
  /**
   * logicalAndExpr
   *   : bitwiseOrExpr ( "&&" bitwiseOrExpr )?
   *   ;
   */
  parseLogicalAndExpr() {
    const r = this._lexer.peek();
    let t = this.parseBitwiseOrExpr();
    if (!t)
      return null;
    for (; this.skipToken(d.LogicalAnd); ) {
      const o = this.parseBitwiseOrExpr();
      if (!o)
        return this.reportError("W001"), null;
      let a = o.endToken;
      t = this.createExpressionNode(
        "BinaryE",
        {
          operator: "&&",
          left: t,
          right: o
        },
        r,
        a
      );
    }
    return t;
  }
  /**
   * bitwiseOrExpr
   *   : bitwiseXorExpr ( "|" bitwiseXorExpr )?
   *   ;
   */
  parseBitwiseOrExpr() {
    const r = this._lexer.peek();
    let t = this.parseBitwiseXorExpr();
    if (!t)
      return null;
    for (; this.skipToken(d.BitwiseOr); ) {
      const o = this.parseBitwiseXorExpr();
      if (!o)
        return this.reportError("W001"), null;
      let a = o.endToken;
      t = this.createExpressionNode(
        "BinaryE",
        {
          operator: "|",
          left: t,
          right: o
        },
        r,
        a
      );
    }
    return t;
  }
  /**
   * bitwiseXorExpr
   *   : bitwiseAndExpr ( "^" bitwiseAndExpr )?
   *   ;
   */
  parseBitwiseXorExpr() {
    const r = this._lexer.peek();
    let t = this.parseBitwiseAndExpr();
    if (!t)
      return null;
    for (; this.skipToken(d.BitwiseXor); ) {
      const o = this.parseBitwiseAndExpr();
      if (!o)
        return this.reportError("W001"), null;
      let a = o.endToken;
      t = this.createExpressionNode(
        "BinaryE",
        {
          operator: "^",
          left: t,
          right: o
        },
        r,
        a
      );
    }
    return t;
  }
  /**
   * bitwiseAndExpr
   *   : equExpr ( "&" equExpr )?
   *   ;
   */
  parseBitwiseAndExpr() {
    const r = this._lexer.peek();
    let t = this.parseEquExpr();
    if (!t)
      return null;
    for (; this.skipToken(d.BitwiseAnd); ) {
      const o = this.parseEquExpr();
      if (!o)
        return this.reportError("W001"), null;
      let a = o.endToken;
      t = this.createExpressionNode(
        "BinaryE",
        {
          operator: "&",
          left: t,
          right: o
        },
        r,
        a
      );
    }
    return t;
  }
  /**
   * equExpr
   *   : relOrInExpr ( ( "==" | "!=" | "===" | "!==" ) relOrInExpr )?
   *   ;
   */
  parseEquExpr() {
    const r = this._lexer.peek();
    let t = this.parseRelOrInExpr();
    if (!t)
      return null;
    let o;
    for (; o = this.skipTokens(
      d.Equal,
      d.StrictEqual,
      d.NotEqual,
      d.StrictNotEqual
    ); ) {
      const a = this.parseRelOrInExpr();
      if (!a)
        return this.reportError("W001"), null;
      let n = a.endToken;
      t = this.createExpressionNode(
        "BinaryE",
        {
          type: "BinaryE",
          operator: o.text,
          left: t,
          right: a
        },
        r,
        n
      );
    }
    return t;
  }
  /**
   * relOrInExpr
   *   : shiftExpr ( ( "<" | "<=" | ">" | ">=", "in" ) shiftExpr )?
   *   ;
   */
  parseRelOrInExpr() {
    const r = this._lexer.peek();
    let t = this.parseShiftExpr();
    if (!t)
      return null;
    let o;
    for (; o = this.skipTokens(
      d.LessThan,
      d.LessThanOrEqual,
      d.GreaterThan,
      d.GreaterThanOrEqual,
      d.In
    ); ) {
      const a = this.parseShiftExpr();
      if (!a)
        return this.reportError("W001"), null;
      let n = a.endToken;
      t = this.createExpressionNode(
        "BinaryE",
        {
          operator: o.text,
          left: t,
          right: a
        },
        r,
        n
      );
    }
    return t;
  }
  /**
   * shiftExpr
   *   : addExpr ( ( "<<" | ">>" | ">>>" ) addExpr )?
   *   ;
   */
  parseShiftExpr() {
    const r = this._lexer.peek();
    let t = this.parseAddExpr();
    if (!t)
      return null;
    let o;
    for (; o = this.skipTokens(
      d.ShiftLeft,
      d.ShiftRight,
      d.SignedShiftRight
    ); ) {
      const a = this.parseAddExpr();
      if (!a)
        return this.reportError("W001"), null;
      let n = a.endToken;
      t = this.createExpressionNode(
        "BinaryE",
        {
          operator: o.text,
          left: t,
          right: a
        },
        r,
        n
      );
    }
    return t;
  }
  /**
   * addExpr
   *   : multExpr ( ( "+" | "-" ) multExpr )?
   *   ;
   */
  parseAddExpr() {
    const r = this._lexer.peek();
    let t = this.parseMultExpr();
    if (!t)
      return null;
    let o;
    for (; o = this.skipTokens(d.Plus, d.Minus); ) {
      const a = this.parseMultExpr();
      if (!a)
        return this.reportError("W001"), null;
      let n = a.endToken;
      t = this.createExpressionNode(
        "BinaryE",
        {
          operator: o.text,
          left: t,
          right: a
        },
        r,
        n
      );
    }
    return t;
  }
  /**
   * multExpr
   *   : exponentialExpr ( ( "*" | "/" | "%") exponentialExpr )?
   *   ;
   */
  parseMultExpr() {
    const r = this._lexer.peek();
    let t = this.parseExponentialExpr();
    if (!t)
      return null;
    let o;
    for (; o = this.skipTokens(d.Multiply, d.Divide, d.Remainder); ) {
      const a = this.parseExponentialExpr();
      if (!a)
        return this.reportError("W001"), null;
      let n = a.endToken;
      t = this.createExpressionNode(
        "BinaryE",
        {
          operator: o.text,
          left: t,
          right: a
        },
        r,
        n
      );
    }
    return t;
  }
  /**
   * exponentialExpr
   *   : unaryExpr ( "**" unaryExpr )?
   *   ;
   */
  parseExponentialExpr() {
    const r = this._lexer.peek();
    let t = this.parseUnaryOrPrefixExpr();
    if (!t)
      return null;
    let o, a = 0;
    for (; o = this.skipToken(d.Exponent); ) {
      let n = this.parseUnaryOrPrefixExpr();
      if (!n)
        return this.reportError("W001"), null;
      let i = n.endToken;
      if (a === 0)
        t = this.createExpressionNode(
          "BinaryE",
          {
            operator: o.text,
            left: t,
            right: n
          },
          r,
          i
        );
      else {
        const l = t;
        t = this.createExpressionNode(
          "BinaryE",
          {
            operator: o.text,
            left: l.left,
            right: {
              type: "BinaryE",
              operator: o.text,
              left: l.right,
              right: n
            }
          },
          r,
          i
        );
      }
      a++;
    }
    return t;
  }
  /**
   * unaryExpr
   *   : ( "typeof" | "delete" | "+" | "-" | "~" | "!" ) memberOrInvocationExpr
   *   | memberOrInvocationExpr
   *   ;
   */
  parseUnaryOrPrefixExpr() {
    const r = this._lexer.peek();
    if ($t[r.type].canBeUnary) {
      this._lexer.get();
      const t = this.parseUnaryOrPrefixExpr();
      return t ? this.createExpressionNode(
        "UnaryE",
        {
          operator: r.text,
          operand: t
        },
        r,
        t.endToken
      ) : null;
    }
    if (r.type === d.IncOp || r.type === d.DecOp) {
      this._lexer.get();
      const t = this.parseMemberOrInvocationExpr();
      return t ? this.createExpressionNode(
        "PrefE",
        {
          operator: r.text,
          operand: t
        },
        r,
        t.endToken
      ) : null;
    }
    return this.parseMemberOrInvocationExpr();
  }
  /**
   * memberOrInvocationExpr
   *   : primaryExpr "(" functionArgs ")"
   *   | primaryExpr "." identifier
   *   | primaryExpr "?." identifier
   *   | primaryExpr "[" expr "]"
   *   ;
   */
  parseMemberOrInvocationExpr() {
    const r = this._lexer.peek();
    let t = this.parsePrimaryExpr();
    if (!t)
      return null;
    let o = !1;
    do {
      const n = this._lexer.peek();
      switch (n.type) {
        case d.LParent: {
          this._lexer.get();
          let h = [];
          if (this._lexer.peek().type !== d.RParent) {
            const T = this.parseExpr();
            if (!T)
              return this.reportError("W001"), null;
            h = T.type === "SeqE" ? T.expressions : [T];
          }
          const c = this._lexer.peek();
          this.expectToken(d.RParent, "W006"), t = this.createExpressionNode(
            "InvokeE",
            {
              object: t,
              arguments: h
            },
            r,
            c
          );
          break;
        }
        case d.Dot:
        case d.OptionalChaining:
          this._lexer.get();
          const i = this._lexer.get();
          if (!$t[i.type].keywordLike)
            return this.reportError("W003"), null;
          t = this.createExpressionNode(
            "MembE",
            {
              object: t,
              member: i.text,
              isOptional: n.type === d.OptionalChaining
            },
            r,
            i
          );
          break;
        case d.LSquare:
          this._lexer.get();
          const s = this.getExpression();
          if (!s)
            return null;
          const f = this._lexer.peek();
          this.expectToken(d.RSquare, "W005"), t = this.createExpressionNode(
            "CMembE",
            {
              object: t,
              member: s
            },
            r,
            f
          );
          break;
        default:
          o = !0;
          break;
      }
    } while (!o);
    const a = this._lexer.peek();
    return a.type === d.IncOp || a.type === d.DecOp ? (this._lexer.get(), this.createExpressionNode(
      "PostfE",
      {
        operator: a.text,
        operand: t
      },
      r,
      a
    )) : t;
  }
  /**
   * primaryExpr
   *   : literal
   *   | identifier
   *   | "::" identifier
   *   | "$item"
   *   | "(" expr ")"
   *   ;
   */
  parsePrimaryExpr() {
    const r = this._lexer.peek();
    switch (r.type) {
      case d.LParent:
        if (this._lexer.get(), this._lexer.peek().type === d.RParent) {
          const a = this._lexer.get();
          return this.createExpressionNode("NoArgE", {}, r, a);
        }
        const t = this.parseExpr();
        if (!t)
          return null;
        const o = this._lexer.peek();
        return this.expectToken(d.RParent, "W006"), t.parenthesized ?? (t.parenthesized = 0), t.parenthesized++, t.startToken = r, t.startPosition = r.location.startPosition, t.startLine = r.location.startLine, t.startColumn = r.location.startColumn, t.endToken = o, t.endPosition = o.location.endPosition, t.endLine = o.location.endLine, t.endColumn = o.location.endColumn, t.source = this.getSource(r, o), t;
      case d.Identifier: {
        const a = this._lexer.get();
        return this.createExpressionNode(
          "IdE",
          {
            name: a.text
          },
          a,
          a
        );
      }
      case d.Global: {
        this._lexer.get();
        const a = this._lexer.get();
        return a.type !== d.Identifier ? (this.reportError("W003"), null) : this.createExpressionNode(
          "IdE",
          {
            name: a.text,
            isGlobal: !0
          },
          a,
          a
        );
      }
      case d.Backtick:
        return this.parseTemplateLiteral();
      case d.False:
      case d.True:
        return this._lexer.get(), this.createExpressionNode(
          "LitE",
          {
            value: r.type === d.True
          },
          r,
          r
        );
      case d.BinaryLiteral:
        return this._lexer.get(), this.parseBinaryLiteral(r);
      case d.DecimalLiteral:
        return this._lexer.get(), this.parseDecimalLiteral(r);
      case d.HexadecimalLiteral:
        return this._lexer.get(), this.parseHexadecimalLiteral(r);
      case d.RealLiteral:
        return this._lexer.get(), this.parseRealLiteral(r);
      case d.StringLiteral:
        return this._lexer.get(), this.parseStringLiteral(r);
      case d.Infinity:
        return this._lexer.get(), this.createExpressionNode(
          "LitE",
          {
            value: 1 / 0
          },
          r,
          r
        );
      case d.NaN:
        return this._lexer.get(), this.createExpressionNode(
          "LitE",
          {
            value: NaN
          },
          r,
          r
        );
      case d.Null:
        return this._lexer.get(), this.createExpressionNode(
          "LitE",
          {
            value: null
          },
          r,
          r
        );
      case d.Undefined:
        return this._lexer.get(), this.createExpressionNode(
          "LitE",
          {
            value: void 0
          },
          r,
          r
        );
      case d.LSquare:
        return this.parseArrayLiteral();
      case d.LBrace:
        return this.parseObjectLiteral();
      case d.Divide:
        return this.parseRegExpLiteral();
    }
    return null;
  }
  parseTemplateLiteral() {
    const r = this._lexer.get();
    this._lexer.setStartingPhaseToTemplateLiteral();
    const t = [];
    e: for (; ; ) {
      let a = this._lexer.peek();
      switch (a.type) {
        case d.StringLiteral:
          this._lexer.get();
          const n = this.parseStringLiteral(a, !1);
          t.push(n);
          break;
        case d.DollarLBrace:
          this._lexer.get();
          const i = this.parseExpr();
          t.push(i), this.expectToken(d.RBrace, "W004"), this._lexer.setStartingPhaseToTemplateLiteral();
          break;
        case d.Backtick:
          break e;
        default:
          this.reportError("W004");
      }
    }
    const o = this._lexer.get();
    return this.createExpressionNode(
      "TempLitE",
      { segments: t },
      r,
      o
    );
  }
  /**
   * Parses an array literal
   */
  parseArrayLiteral() {
    const r = this._lexer.get();
    let t = [];
    if (this._lexer.peek().type !== d.RSquare) {
      const a = this.getExpression();
      a && (t = a.type === "SeqE" ? a.expressions : [a]);
    }
    const o = this._lexer.peek();
    return this.expectToken(d.RSquare), this.createExpressionNode(
      "ALitE",
      {
        items: t
      },
      r,
      o
    );
  }
  /**
   * Parses an object literal
   */
  parseObjectLiteral() {
    const r = this._lexer.get();
    let t = [];
    if (this._lexer.peek().type !== d.RBrace)
      for (; this._lexer.peek().type !== d.RBrace; ) {
        const a = this._lexer.peek(), n = $t[a.type];
        let i;
        if (n.expressionStart)
          if (a.type === d.LSquare) {
            if (this._lexer.get(), i = this.getExpression(), !i)
              return null;
            this.expectToken(d.RSquare, "W005"), i = this.createExpressionNode(
              "SeqE",
              {
                expressions: [i]
              },
              r
            );
          } else if (n.isPropLiteral) {
            if (i = this.getExpression(!1), !i)
              return null;
            if (i.type !== "IdE" && i.type !== "LitE" && i.type !== "SpreadE")
              return this.reportError("W007"), null;
          } else
            return this.reportError("W007"), null;
        else if (n.keywordLike)
          i = {
            type: "IdE",
            name: a.text,
            value: void 0,
            startPosition: a.location.startPosition,
            startLine: a.location.startLine,
            startColumn: a.location.startColumn,
            endPosition: a.location.endPosition,
            endLine: a.location.endLine,
            endColumn: a.location.endColumn,
            source: a.text,
            startToken: a,
            endToken: a
          }, this._lexer.get();
        else
          return this.reportError("W001"), null;
        const l = i.type;
        if (l === "SpreadE")
          t.push(i);
        else {
          if (l === "LitE") {
            const h = i.value;
            if (typeof h != "number" && typeof h != "string")
              return this.expectToken(d.RBrace, "W007"), null;
          }
          let f = null;
          if (l === "IdE") {
            const h = this._lexer.peek();
            (h.type === d.Comma || h.type === d.RBrace) && (f = { ...i });
          }
          if (!f && (this.expectToken(d.Colon, "W008"), f = this.getExpression(!1), !f))
            return null;
          t.push([i, f]);
        }
        const s = this._lexer.peek().type;
        if (s === d.Comma)
          this._lexer.get();
        else if (s !== d.RBrace)
          break;
      }
    const o = this._lexer.peek();
    return this.expectToken(d.RBrace, "W004"), this.createExpressionNode(
      "OLitE",
      {
        props: t
      },
      r,
      o
    );
  }
  parseRegExpLiteral() {
    const r = this._lexer.peek(), t = this._lexer.getRegEx();
    return t.success ? this.createExpressionNode(
      "LitE",
      {
        value: new RegExp(t.pattern, t.flags)
      },
      r,
      this._lexer.peek()
    ) : (this.reportError("W002", r, t.pattern ?? ""), null);
  }
  /**
   * Gets an expression
   */
  getExpression(r = !0) {
    const t = this.parseExpr(r);
    return t || (this.reportError("W001"), null);
  }
  // ==========================================================================
  // Helpers
  /**
   * Tests the type of the next token
   * @param type Expected token type
   * @param errorCode Error to raise if the next token is not expected
   * @param allowEof Allow an EOF instead of the expected token?
   */
  expectToken(r, t, o) {
    const a = this._lexer.peek();
    return a.type === r || o && a.type === d.Eof ? this._lexer.get() : (this.reportError(t ?? "W002", a, a.text), null);
  }
  /**
   * Skips the next token if the type is the specified one
   * @param type Token type to check
   */
  skipToken(r) {
    const t = this._lexer.peek();
    return t.type === r ? (this._lexer.get(), t) : null;
  }
  /**
   * Skips the next token if the type is the specified one
   * @param types Token types to check
   */
  skipTokens(...r) {
    const t = this._lexer.peek();
    for (const o of r)
      if (t.type === o)
        return this._lexer.get(), t;
    return null;
  }
  /**
   * Reports the specified error
   * @param errorCode Error code
   * @param token Token that represents the error's position
   * @param options Error message options
   */
  reportError(r, t, ...o) {
    let a = Xo[r] ?? "Unkonwn error";
    throw o && o.forEach(
      (i, l) => a = n(a, `{${l}}`, o[l].toString())
    ), t || (t = this._lexer.peek()), this._parseErrors.push({
      code: r,
      text: a,
      line: t.location.startLine,
      column: t.location.startColumn,
      position: t.location.startPosition
    }), new _x(a, r);
    function n(i, l, s) {
      do
        i = i.replace(l, s);
      while (i.includes(l));
      return i;
    }
  }
  /**
   * Creates an expression node
   * @param type Expression type
   * @param stump Stump properties
   * @param startToken The token that starts the expression
   * @param endToken The token that ends the expression
   * @param source Expression source code to store to the node
   */
  createNode(r, t, o, a, n) {
    a || (a = this._lexer.peek());
    const i = o.location.startPosition, l = a.location.startPosition;
    return Object.assign({}, t, {
      type: r,
      startPosition: i,
      endPosition: l,
      startLine: o.location.startLine,
      startColumn: o.location.startColumn,
      endLine: a.location.endLine,
      endColumn: a.location.endColumn,
      source: n ?? this.getSource(o, a)
    });
  }
  /**
   * Creates an expression node
   * @param type Expression type
   * @param stump Stump properties
   * @param startToken The token that starts the expression
   * @param endToken The token that ends the expression
   * @param source Expression source code to store to the node
   */
  createExpressionNode(r, t = {}, o, a, n) {
    a || (a = this._lexer.peek()), o || (o = a);
    const i = o.location.startPosition, l = a.location.endPosition;
    return Object.assign({}, t, {
      type: r,
      startPosition: i,
      endPosition: l,
      startLine: o.location.startLine,
      startColumn: o.location.startColumn,
      endLine: a.location.endLine,
      endColumn: a.location.endColumn,
      source: n ?? this.getSource(o, a),
      startToken: o,
      endToken: a
    });
  }
  /**
   * Creates a statement node
   * @param type Statement type
   * @param stump Stump properties
   * @param startToken The token that starts the statement
   * @param endToken The token that ends the statement
   */
  createStatementNode(r, t, o, a) {
    var s, f, h, c, T;
    const n = (s = o == null ? void 0 : o.location) == null ? void 0 : s.startPosition, i = this._lexer.peek(), l = a ? a.location.endPosition : i.type === d.Eof ? i.location.startPosition + 1 : i.location.startPosition;
    return Object.assign({}, t, {
      type: r,
      startPosition: n,
      endPosition: l,
      startLine: (f = o == null ? void 0 : o.location) == null ? void 0 : f.startLine,
      startColumn: (h = o == null ? void 0 : o.location) == null ? void 0 : h.startColumn,
      endLine: a ? a.location.endLine : (c = o == null ? void 0 : o.location) == null ? void 0 : c.endLine,
      endColumn: a ? a.location.endColumn : (T = o == null ? void 0 : o.location) == null ? void 0 : T.endColumn,
      source: this.source && n !== void 0 && l !== void 0 ? this.source.substring(n, l) : void 0,
      startToken: o,
      endToken: a
    });
  }
  /**
   * Gets the source code for the specified token range
   * @param start Start token
   * @param end Optional end token
   * @returns The source code for the token range
   */
  getSource(r, t) {
    return this.source.substring(
      r.location.startPosition,
      t.type === d.Eof ? t.location.startPosition : t.location.endPosition
    );
  }
  /**
   * Parses a binary literal
   * @param token Literal token
   */
  parseBinaryLiteral(r) {
    let t;
    const o = BigInt(r.text.replace(/[_']/g, ""));
    return o < Number.MIN_SAFE_INTEGER || o > Number.MAX_SAFE_INTEGER ? t = o : t = parseInt(r.text.substring(2).replace(/[_']/g, ""), 2), this.createExpressionNode(
      "LitE",
      {
        value: t
      },
      r,
      r
    );
  }
  /**
   * Parses a decimal literal
   * @param token Literal token
   */
  parseDecimalLiteral(r) {
    let t;
    const o = BigInt(r.text.replace(/[_']/g, ""));
    return o < Number.MIN_SAFE_INTEGER || o > Number.MAX_SAFE_INTEGER ? t = o : t = parseInt(r.text.replace(/[_']/g, ""), 10), this.createExpressionNode(
      "LitE",
      {
        value: t
      },
      r,
      r
    );
  }
  /**
   * Parses a hexadecimal literal
   * @param token Literal token
   */
  parseHexadecimalLiteral(r) {
    let t;
    const o = BigInt(r.text.replace(/[_']/g, ""));
    return o < Number.MIN_SAFE_INTEGER || o > Number.MAX_SAFE_INTEGER ? t = o : t = parseInt(r.text.substring(2).replace(/[_']/g, ""), 16), this.createExpressionNode(
      "LitE",
      {
        value: t
      },
      r,
      r
    );
  }
  /**
   * Parses a real literal
   * @param token Literal token
   */
  parseRealLiteral(r) {
    let t = parseFloat(r.text.replace(/[_']/g, ""));
    return this.createExpressionNode(
      "LitE",
      {
        value: t
      },
      r,
      r
    );
  }
  /**
   * Converts a string token to intrinsic string
   * @param token Literal token
   */
  parseStringLiteral(r, t = !0) {
    let o = r.text;
    t && (o = r.text.length < 2 ? "" : o.substring(1, o.length - 1));
    let a = "", n = 0, i = 0;
    for (const s of o)
      switch (n) {
        case 0:
          s === "\\" ? n = 1 : a += s;
          break;
        case 1:
          switch (n = 0, s) {
            case "b":
              a += "\b";
              break;
            case "f":
              a += "\f";
              break;
            case "n":
              a += `
`;
              break;
            case "r":
              a += "\r";
              break;
            case "t":
              a += "	";
              break;
            case "v":
              a += "\v";
              break;
            case "S":
              a += " ";
              break;
            case "0":
              a += "\0";
              break;
            case "'":
              a += "'";
              break;
            case '"':
              a += '"';
              break;
            case "\\":
              a += "\\";
              break;
            case "x":
              n = 2;
              break;
            case "u":
              n = 4;
              break;
            default:
              a += s;
              break;
          }
          break;
        case 2:
          l(s) ? (i = parseInt(s, 16), n = 3) : (a += "x", n = 0);
          break;
        case 3:
          l(s) ? (i = i * 16 + parseInt(s, 16), a += String.fromCharCode(i), n = 0) : (a += String.fromCharCode(i), a += s, n = 0);
          break;
        case 4:
          if (s === "{") {
            n = 8;
            break;
          }
          l(s) ? (i = parseInt(s, 16), n = 5) : (a += "x", n = 0);
          break;
        case 5:
          l(s) ? (i = i * 16 + parseInt(s, 16), n = 6) : (a += String.fromCharCode(i), a += s, n = 0);
          break;
        case 6:
          l(s) ? (i = i * 16 + parseInt(s, 16), n = 7) : (a += String.fromCharCode(i), a += s, n = 0);
          break;
        case 7:
          l(s) ? (i = i * 16 + parseInt(s, 16), a += String.fromCharCode(i), n = 0) : (a += String.fromCharCode(i), a += s, n = 0);
          break;
        case 8:
          l(s) ? (i = parseInt(s, 16), n = 9) : (a += "x", n = 0);
          break;
        case 9:
          l(s) ? (i = i * 16 + parseInt(s, 16), n = 10) : (a += String.fromCharCode(i), a += s, n = 0);
          break;
        case 10:
          l(s) ? (i = i * 16 + parseInt(s, 16), n = 11) : (a += String.fromCharCode(i), a += s, n = 0);
          break;
        case 11:
          l(s) ? (i = i * 16 + parseInt(s, 16), n = 12) : (a += String.fromCharCode(i), a += s, n = 0);
          break;
        case 12:
          l(s) ? (i = i * 16 + parseInt(s, 16), n = 13) : (a += String.fromCharCode(i), a += s, n = 0);
          break;
        case 13:
          l(s) ? (i = i * 16 + parseInt(s, 16), n = 14) : (a += String.fromCharCode(i), a += s, n = 0);
          break;
        case 14:
          a += String.fromCharCode(i), s !== "}" && (a += s), n = 0;
          break;
      }
    switch (n) {
      case 1:
        a += "\\";
        break;
      case 2:
        a += "x";
        break;
      case 3:
        a += String.fromCharCode(i);
        break;
    }
    return this.createExpressionNode(
      "LitE",
      {
        value: a
      },
      r,
      r
    );
    function l(s) {
      return s >= "0" && s <= "9" || s >= "a" && s <= "f" || s >= "A" && s <= "F";
    }
  }
  convertToArrayDestructure(r) {
    var a;
    const t = r.type === "SeqE" ? r.expressions : r.items, o = this.createExpressionNode(
      "Destr",
      { arrayDestruct: [] },
      r.startToken,
      r.endToken
    );
    for (const n of t) {
      let i;
      switch (n.type) {
        case "NoArgE":
          i = this.createExpressionNode(
            "ADestr",
            {},
            n.startToken,
            n.endToken
          );
          break;
        case "IdE":
          i = this.createExpressionNode(
            "ADestr",
            { id: n.name },
            n.startToken,
            n.endToken
          );
          break;
        case "Destr":
          o.arrayDestruct.push(...n.arrayDestruct);
          break;
        case "ADestr":
          i = n;
          break;
        case "ALitE": {
          const l = this.convertToArrayDestructure(n);
          l && (i = this.createExpressionNode(
            "ADestr",
            {
              arrayDestruct: l.arrayDestruct
            },
            n.startToken,
            n.endToken
          ));
          break;
        }
        case "ODestr":
          i = this.createExpressionNode(
            "ADestr",
            {
              objectDestruct: n
            },
            n.startToken,
            n.endToken
          );
          break;
        case "OLitE": {
          const l = this.convertToObjectDestructure(n);
          l && (i = this.createExpressionNode(
            "ADestr",
            {
              objectDestruct: l.objectDestruct
            },
            n.startToken,
            n.endToken
          ));
          break;
        }
        default:
          return this.reportError("W017"), null;
      }
      i && ((a = o.arrayDestruct) == null || a.push(i));
    }
    return o;
  }
  convertToObjectDestructure(r) {
    var o;
    const t = this.createExpressionNode(
      "Destr",
      { objectDestruct: [] },
      r.startToken,
      r.endToken
    );
    for (const a of r.props) {
      if (!Array.isArray(a)) return this.reportError("W018"), null;
      const [n, i] = a;
      if (n.type !== "IdE")
        return this.reportError("W018"), null;
      let l;
      switch (i.type) {
        case "IdE":
          i.name === n.name ? l = this.createExpressionNode(
            "ODestr",
            { id: n.name },
            i.startToken,
            i.endToken
          ) : l = this.createExpressionNode(
            "ODestr",
            {
              id: n.name,
              alias: i.name
            },
            i.startToken,
            i.endToken
          );
          break;
        case "ADestr": {
          l = this.createExpressionNode(
            "ODestr",
            {
              id: n.name,
              arrayDestruct: i
            },
            n.startToken,
            i.endToken
          );
          break;
        }
        case "ALitE": {
          const s = this.convertToArrayDestructure(i);
          s && (l = this.createExpressionNode(
            "ODestr",
            {
              id: n.name,
              arrayDestruct: s.arrayDestruct
            },
            n.startToken,
            i.endToken
          ));
          break;
        }
        case "ODestr":
          l = i;
          break;
        case "OLitE": {
          const s = this.convertToObjectDestructure(i);
          s && (l = this.createExpressionNode(
            "ODestr",
            {
              id: n.name,
              objectDestruct: s.objectDestruct
            },
            n.startToken,
            i.endToken
          ));
          break;
        }
        default:
          return this.reportError("W018"), null;
      }
      l && ((o = t.objectDestruct) == null || o.push(l));
    }
    return t;
  }
  /**
   * Tests if the specified token can be the start of an expression
   */
  isExpressionStart(r) {
    var t;
    return ((t = $t[r.type]) == null ? void 0 : t.expressionStart) ?? !1;
  }
}
function oe(e, r, t, o, a, n) {
  if (r.cancel)
    return r;
  if (r.skipChildren = !1, Array.isArray(e)) {
    for (const i of e)
      r = oe(i, r, t, o, a, n);
    return r;
  }
  switch (e.type) {
    case "BlockS": {
      if (r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel) return r;
      if (!r.skipChildren) {
        for (const i of e.statements)
          if (r = oe(i, r, t, o, e, "statements"), r.cancel) return r;
      }
      return r = (t == null ? void 0 : t(!1, e, r, a, n)) || r, r;
    }
    case "EmptyS":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r;
    case "ExprS":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel || !r.skipChildren && (r = oe(e.expression, r, t, o, e, "expression"), r.cancel) || (r = (t == null ? void 0 : t(!1, e, r, a, n)) || r), r;
    case "ArrowS":
      return r;
    case "LetS": {
      if (r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel) return r;
      if (!r.skipChildren) {
        for (const i of e.declarations)
          if (r = oe(i, r, t, o, e, "declarations"), r.cancel) return r;
      }
      return r = (t == null ? void 0 : t(!1, e, r, a, n)) || r, r;
    }
    case "ConstS": {
      if (r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel) return r;
      if (!r.skipChildren) {
        for (const i of e.declarations)
          if (r = oe(i, r, t, o, e, "declarations"), r.cancel) return r;
      }
      return r = (t == null ? void 0 : t(!1, e, r, a, n)) || r, r;
    }
    case "VarS": {
      if (r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel) return r;
      if (!r.skipChildren) {
        for (const i of e.declarations)
          if (r = oe(i, r, t, o, e, "declarations"), r.cancel) return r;
      }
      return r = (t == null ? void 0 : t(!1, e, r, a, n)) || r, r;
    }
    case "IfS":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel || !r.skipChildren && (r = oe(e.condition, r, t, o, e, "condition"), r.cancel || (e.thenBranch && (r = oe(e.thenBranch, r, t, o, e, "thenBranch")), r.cancel) || (e.elseBranch && (r = oe(e.elseBranch, r, t, o, e, "elseBranch")), r.cancel)) || (r = (t == null ? void 0 : t(!1, e, r, a, n)) || r), r;
    case "RetS":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel || !r.skipChildren && (e.expression && (r = oe(e.expression, r, t, o, e, "expression")), r.cancel) || (r = (t == null ? void 0 : t(!1, e, r, a, n)) || r), r;
    case "BrkS":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r;
    case "ContS":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r;
    case "WhileS":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel || !r.skipChildren && (r = oe(e.condition, r, t, o, e, "condition"), r.cancel || (r = oe(e.body, r, t, o, e, "body"), r.cancel)) || (r = (t == null ? void 0 : t(!1, e, r, a, n)) || r), r;
    case "DoWS":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel || !r.skipChildren && (r = oe(e.body, r, t, o, e, "body"), r.cancel || (r = oe(e.condition, r, t, o, e, "condition"), r.cancel)) || (r = (t == null ? void 0 : t(!1, e, r, a, n)) || r), r;
    case "ForS":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel || !r.skipChildren && (e.init && (r = oe(e.init, r, t, o, e, "init")), r.cancel || (e.condition && (r = oe(e.condition, r, t, o, e, "condition")), r.cancel) || (e.update && (r = oe(e.update, r, t, o, e, "update")), r.cancel) || (r = oe(e.body, r, t, o, e, "body"), r.cancel)) || (r = (t == null ? void 0 : t(!1, e, r, a, n)) || r), r;
    case "ForInS":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel || !r.skipChildren && (r = oe(e.expression, r, t, o, e, "expression"), r.cancel || (r = oe(e.body, r, t, o, e, "body"), r.cancel)) || (r = (t == null ? void 0 : t(!1, e, r, a, n)) || r), r;
    case "ForOfS":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel || !r.skipChildren && (r = oe(e.expression, r, t, o, e, "expression"), r.cancel || (r = oe(e.body, r, t, o, e, "body"), r.cancel)) || (r = (t == null ? void 0 : t(!1, e, r, a, n)) || r), r;
    case "ThrowS":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel || !r.skipChildren && (r = oe(e.expression, r, t, o, e, "expression"), r.cancel) || (r = (t == null ? void 0 : t(!1, e, r, a, n)) || r), r;
    case "TryS":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel || !r.skipChildren && (e.tryBlock && (r = oe(e.tryBlock, r, t, o, e, "tryBlock")), r.cancel || (e.catchBlock && (r = oe(e.catchBlock, r, t, o, e, "catchBlock")), r.cancel) || (e.finallyBlock && (r = oe(e.finallyBlock, r, t, o, e, "finallyBlock")), r.cancel)) || (r = (t == null ? void 0 : t(!1, e, r, a, n)) || r), r;
    case "SwitchS": {
      if (r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel) return r;
      if (!r.skipChildren) {
        if (r = oe(e.expression, r, t, o, e, "expression"), r.cancel) return r;
        for (const i of e.cases) {
          if (i.caseExpression && (r = oe(i.caseExpression, r, t, o, e, "caseExpression")), r.cancel) return r;
          if (i.statements !== void 0) {
            for (const l of i.statements)
              if (r = oe(l, r, t, o, e, "switchStatement"), r.cancel) return r;
          }
        }
      }
      return r = (t == null ? void 0 : t(!1, e, r, a, n)) || r, r;
    }
    case "FuncD": {
      if (r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel) return r;
      if (!r.skipChildren) {
        for (const i of e.args)
          if (r = oe(i, r, t, o, e, "arg"), r.cancel) return r;
        if (r = oe(e.statement, r, t, o, e, "statement"), r.cancel) return r;
      }
      return r = (t == null ? void 0 : t(!1, e, r, a, n)) || r, r;
    }
    case "ImportD":
      return r = (t == null ? void 0 : t(!0, e, r, a, n)) || r, r.cancel || (r = (t == null ? void 0 : t(!1, e, r, a, n)) || r), r;
    case "UnaryE":
      return r = r, r.cancel || !r.skipChildren && (r = oe(e.operand, r, t, o, e, "operand"), r.cancel) || (r = r), r;
    case "BinaryE":
      return r = r, r.cancel || !r.skipChildren && (r = oe(e.left, r, t, o, e, "left"), r.cancel || (r = oe(e.right, r, t, o, e, "right"), r.cancel)) || (r = r), r;
    case "SeqE": {
      if (r = r, r.cancel) return r;
      if (!r.skipChildren) {
        for (const i of e.expressions)
          if (r = oe(i, r, t, o, e, "expression"), r.cancel) return r;
      }
      return r = r, r;
    }
    case "CondE":
      return r = r, r.cancel || !r.skipChildren && (r = oe(e.condition, r, t, o, e, "condition"), r.cancel || (r = oe(e.consequent, r, t, o, e, "consequent"), r.cancel) || (r = oe(e.alternate, r, t, o, e, "alternate"), r.cancel)) || (r = r), r;
    case "InvokeE": {
      if (r = r, r.cancel) return r;
      if (!r.skipChildren) {
        for (const i of e.arguments)
          if (r = oe(i, r, t, o, e, "argument"), r.cancel) return r;
        if (r = oe(e.object, r, t, o, e, "object"), r.cancel) return r;
      }
      return r = r, r;
    }
    case "MembE":
      return r = r, r.cancel || !r.skipChildren && (r = oe(e.object, r, t, o, e, "object"), r.cancel) || (r = r), r;
    case "CMembE":
      return r = r, r.cancel || !r.skipChildren && (r = oe(e.object, r, t, o, e, "object"), r.cancel || (r = oe(e.member, r, t, o, e, "member"), r.cancel)) || (r = r), r;
    case "IdE":
      return r = r, r;
    case "LitE":
      return r = r, r;
    case "ALitE": {
      if (r = r, r.cancel) return r;
      if (!r.skipChildren) {
        for (const i of e.items)
          if (r = oe(i, r, t, o, e, "item"), r.cancel) return r;
      }
      return r = r, r;
    }
    case "OLitE": {
      if (r = r, r.cancel) return r;
      if (!r.skipChildren) {
        for (const i of e.props)
          if (Array.isArray(i)) {
            const [l, s] = i;
            if (r = oe(l, r, t, o, e, "propKey"), r.cancel || (r = oe(s, r, t, o, e, "propValue"), r.cancel)) return r;
          } else if (r = oe(i, r, t, o, e, "prop"), r.cancel) return r;
      }
      return r = r, r;
    }
    case "SpreadE":
      return r = r, r.cancel || !r.skipChildren && (r = oe(e.operand, r, t, o, e, "operand"), r.cancel) || (r = r), r;
    case "AsgnE":
      return r = r, r.cancel || !r.skipChildren && (r = oe(e.operand, r, t, o, e, "operand"), r.cancel || (r = oe(e.leftValue, r, t, o, e, "leftValue"), r.cancel)) || (r = r), r;
    case "NoArgE":
      return r = r, r;
    case "ArrowE": {
      if (r = r, r.cancel) return r;
      if (!r.skipChildren) {
        for (const i of e.args)
          if (r = oe(i, r, t, o, e, "arg"), r.cancel) return r;
        if (r = oe(e.statement, r, t, o, e, "statement"), r.cancel) return r;
      }
      return r = r, r;
    }
    case "PrefE":
    case "PostfE":
      return r = r, r.cancel || !r.skipChildren && (r = oe(e.operand, r, t, o, e, "operand"), r.cancel) || (r = r), r;
    case "VarD": {
      if (r = r, r.cancel) return r;
      if (!r.skipChildren) {
        if (e.arrayDestruct !== void 0) {
          for (const i of e.arrayDestruct)
            if (r = oe(i, r, t, o, e), r.cancel) return r;
        }
        if (e.objectDestruct !== void 0) {
          for (const i of e.objectDestruct)
            if (r = oe(i, r, t, o, e), r.cancel) return r;
        }
        if (e.expression && (r = oe(e.expression, r, t, o, e, "expression")), r.cancel) return r;
      }
      return r = r, r;
    }
    case "Destr":
    case "ODestr":
    case "ADestr": {
      if (r = r, r.cancel) return r;
      if (!r.skipChildren) {
        if (e.arrayDestruct !== void 0) {
          for (const i of e.arrayDestruct)
            if (r = oe(i, r, t, o, e), r.cancel) return r;
        }
        if (e.objectDestruct !== void 0) {
          for (const i of e.objectDestruct)
            if (r = oe(i, r, t, o, e), r.cancel) return r;
        }
      }
      return r = r, r;
    }
    case "RVarD":
      return r = r, r.cancel || !r.skipChildren && (e.expression && (r = oe(e.expression, r, t, o, e, "expression")), r.cancel) || (r = r), r;
    case "TempLitE":
      return r;
    default:
      return r;
  }
}
function Ax(e) {
  return e.type !== "ScriptModule";
}
function Nx(e, r, t, o = !1) {
  const a = /* @__PURE__ */ new Map(), n = {}, i = l(e, r, t, !0);
  return !i || Object.keys(n).length > 0 ? n : i;
  function l(s, f, h, c = !1) {
    var T;
    if (a.has(s))
      return a.get(s);
    const b = new Tl(f);
    let v = [];
    try {
      v = b.parseStatements();
    } catch {
      return n[s] = b.errors, null;
    }
    const y = b.current;
    if (y.type !== d.Eof)
      return n[s] ?? (n[s] = []), n[s].push({
        code: "W002",
        text: Xo.W002.replace(/\{(\d+)}/g, () => y.text),
        position: y.location.startLine,
        line: y.location.startLine,
        column: y.location.startColumn
      }), null;
    const w = [];
    oe(v, {
      data: null,
      cancel: !1,
      skipChildren: !1
    }, (R, W, z, x, m) => {
      if (!R) return z;
      if (c)
        switch (W.type) {
          case "VarS":
            x && V("W027", W);
            break;
          case "FuncD":
          case "ImportD":
            break;
          default:
            o && !x && V("W028", W, W.type);
            break;
        }
      else
        switch (W.type) {
          case "VarS":
            V("W027", W);
            break;
          case "FuncD":
            o && !W.isExported && V("W029", W);
            break;
          case "ImportD":
            break;
          default:
            o && !x && V("W028", W, W.type);
            break;
        }
      return z;
    });
    const H = {};
    v.filter((R) => R.type === "FuncD").forEach((R) => {
      const W = R;
      if (H[W.name]) {
        V("W020", R, W.name);
        return;
      }
      H[W.name] = W;
    });
    const $ = /* @__PURE__ */ new Map();
    v.forEach((R) => {
      R.type === "ConstS" && R.isExported ? Wx(R, (W) => {
        $.has(W) ? V("W021", R, W) : $.set(W, R);
      }) : R.type === "FuncD" && R.isExported && ($.has(R.name) ? V("W021", R, R.name) : $.set(R.name, R));
    });
    const O = {
      type: "ScriptModule",
      name: s,
      exports: $,
      importedModules: [],
      imports: {},
      functions: H,
      statements: v,
      executed: !1
    };
    a.set(s, O);
    const F = [], Y = {};
    for (let R = 0; R < v.length; R++) {
      const W = v[R];
      if (W.type !== "ImportD")
        continue;
      const z = h(s, W.moduleFile);
      if (z === null) {
        V("W022", W, W.moduleFile);
        continue;
      }
      const x = l(W.moduleFile, z, h);
      if (!x)
        return;
      F.push(x);
      const m = Object.keys(W.imports);
      m.length > 0 && (Y[T = W.moduleFile] ?? (Y[T] = {}));
      for (const g of m)
        x.exports.has(W.imports[g]) ? Y[W.moduleFile][g] = x.exports.get(W.imports[g]) : V("W023", W, W.moduleFile, g);
    }
    if (w.length > 0)
      return n[s] = w, null;
    return F.forEach((R) => R.parent = O), O.importedModules = F, O.imports = Y, O;
    function V(R, W, ...z) {
      let x = Xo[R];
      z && z.forEach(
        (m, g) => x = x.replaceAll(`{${g}}`, z[g].toString())
      ), w.push({
        code: R,
        text: Xo[R].replace(/\{(\d+)}/g, (m, g) => z[g]),
        position: W.startPosition,
        line: W.startLine,
        column: W.startColumn
      });
    }
  }
}
function yl(e) {
  var t;
  const r = ((t = e.blocks) == null ? void 0 : t.slice(0)) ?? [];
  return e.parent ? [...yl(e.parent), ...r] : r;
}
function Wx(e, r) {
  for (let n = 0; n < e.declarations.length; n++) {
    const i = e.declarations[n];
    t(i, r);
  }
  function t(n, i) {
    if (n.id)
      i(n.id);
    else if (n.arrayDestruct)
      o(n.arrayDestruct, i);
    else if (n.objectDestruct)
      a(n.objectDestruct, i);
    else
      throw new Error("Unknown declaration specifier");
  }
  function o(n, i) {
    for (let l = 0; l < n.length; l++) {
      const s = n[l];
      s.id ? i(s.id) : s.arrayDestruct ? o(s.arrayDestruct, i) : s.objectDestruct && a(s.objectDestruct, i);
    }
  }
  function a(n, i) {
    for (let l = 0; l < n.length; l++) {
      const s = n[l];
      s.arrayDestruct ? o(s.arrayDestruct, i) : s.objectDestruct ? a(s.objectDestruct, i) : i(s.alias ?? s.id);
    }
  }
}
function Ox(e, r) {
  if (e == null) return r;
  if (typeof e == "number")
    return e !== 0;
  if (typeof e == "string") {
    if (e = e.trim().toLowerCase(), e === "")
      return !1;
    if (e === "true")
      return !0;
    if (e === "false")
      return !1;
    if (e !== "")
      return !0;
  }
  if (typeof e == "boolean")
    return e;
  throw new Error(`A boolean value expected but ${typeof e} received.`);
}
const Rx = `'{"Input:borderRadius-NumberBox-default": "var(--xmlui-borderRadius-NumberBox-default)", "Input:borderColor-NumberBox-default": "var(--xmlui-borderColor-NumberBox-default)", "Input:borderWidth-NumberBox-default": "var(--xmlui-borderWidth-NumberBox-default)", "Input:borderStyle-NumberBox-default": "var(--xmlui-borderStyle-NumberBox-default)", "Input:fontSize-NumberBox-default": "var(--xmlui-fontSize-NumberBox-default)", "Input:backgroundColor-NumberBox-default": "var(--xmlui-backgroundColor-NumberBox-default)", "Input:boxShadow-NumberBox-default": "var(--xmlui-boxShadow-NumberBox-default)", "Input:color-NumberBox-default": "var(--xmlui-color-NumberBox-default)", "Input:borderColor-NumberBox-default--hover": "var(--xmlui-borderColor-NumberBox-default--hover)", "Input:backgroundColor-NumberBox-default--hover": "var(--xmlui-backgroundColor-NumberBox-default--hover)", "Input:boxShadow-NumberBox-default--hover": "var(--xmlui-boxShadow-NumberBox-default--hover)", "Input:color-NumberBox-default--hover": "var(--xmlui-color-NumberBox-default--hover)", "Input:borderColor-NumberBox-default--focus": "var(--xmlui-borderColor-NumberBox-default--focus)", "Input:backgroundColor-NumberBox-default--focus": "var(--xmlui-backgroundColor-NumberBox-default--focus)", "Input:boxShadow-NumberBox-default--focus": "var(--xmlui-boxShadow-NumberBox-default--focus)", "Input:color-NumberBox-default--focus": "var(--xmlui-color-NumberBox-default--focus)", "Input:outlineWidth-NumberBox-default--focus": "var(--xmlui-outlineWidth-NumberBox-default--focus)", "Input:outlineColor-NumberBox-default--focus": "var(--xmlui-outlineColor-NumberBox-default--focus)", "Input:outlineStyle-NumberBox-default--focus": "var(--xmlui-outlineStyle-NumberBox-default--focus)", "Input:outlineOffset-NumberBox-default--focus": "var(--xmlui-outlineOffset-NumberBox-default--focus)", "Input:color-placeholder-NumberBox-default": "var(--xmlui-color-placeholder-NumberBox-default)", "Input:color-adornment-NumberBox-default": "var(--xmlui-color-adornment-NumberBox-default)", "Input:borderRadius-NumberBox-error": "var(--xmlui-borderRadius-NumberBox-error)", "Input:borderColor-NumberBox-error": "var(--xmlui-borderColor-NumberBox-error)", "Input:borderWidth-NumberBox-error": "var(--xmlui-borderWidth-NumberBox-error)", "Input:borderStyle-NumberBox-error": "var(--xmlui-borderStyle-NumberBox-error)", "Input:fontSize-NumberBox-error": "var(--xmlui-fontSize-NumberBox-error)", "Input:backgroundColor-NumberBox-error": "var(--xmlui-backgroundColor-NumberBox-error)", "Input:boxShadow-NumberBox-error": "var(--xmlui-boxShadow-NumberBox-error)", "Input:color-NumberBox-error": "var(--xmlui-color-NumberBox-error)", "Input:borderColor-NumberBox-error--hover": "var(--xmlui-borderColor-NumberBox-error--hover)", "Input:backgroundColor-NumberBox-error--hover": "var(--xmlui-backgroundColor-NumberBox-error--hover)", "Input:boxShadow-NumberBox-error--hover": "var(--xmlui-boxShadow-NumberBox-error--hover)", "Input:color-NumberBox-error--hover": "var(--xmlui-color-NumberBox-error--hover)", "Input:borderColor-NumberBox-error--focus": "var(--xmlui-borderColor-NumberBox-error--focus)", "Input:backgroundColor-NumberBox-error--focus": "var(--xmlui-backgroundColor-NumberBox-error--focus)", "Input:boxShadow-NumberBox-error--focus": "var(--xmlui-boxShadow-NumberBox-error--focus)", "Input:color-NumberBox-error--focus": "var(--xmlui-color-NumberBox-error--focus)", "Input:outlineWidth-NumberBox-error--focus": "var(--xmlui-outlineWidth-NumberBox-error--focus)", "Input:outlineColor-NumberBox-error--focus": "var(--xmlui-outlineColor-NumberBox-error--focus)", "Input:outlineStyle-NumberBox-error--focus": "var(--xmlui-outlineStyle-NumberBox-error--focus)", "Input:outlineOffset-NumberBox-error--focus": "var(--xmlui-outlineOffset-NumberBox-error--focus)", "Input:color-placeholder-NumberBox-error": "var(--xmlui-color-placeholder-NumberBox-error)", "Input:color-adornment-NumberBox-error": "var(--xmlui-color-adornment-NumberBox-error)", "Input:borderRadius-NumberBox-warning": "var(--xmlui-borderRadius-NumberBox-warning)", "Input:borderColor-NumberBox-warning": "var(--xmlui-borderColor-NumberBox-warning)", "Input:borderWidth-NumberBox-warning": "var(--xmlui-borderWidth-NumberBox-warning)", "Input:borderStyle-NumberBox-warning": "var(--xmlui-borderStyle-NumberBox-warning)", "Input:fontSize-NumberBox-warning": "var(--xmlui-fontSize-NumberBox-warning)", "Input:backgroundColor-NumberBox-warning": "var(--xmlui-backgroundColor-NumberBox-warning)", "Input:boxShadow-NumberBox-warning": "var(--xmlui-boxShadow-NumberBox-warning)", "Input:color-NumberBox-warning": "var(--xmlui-color-NumberBox-warning)", "Input:borderColor-NumberBox-warning--hover": "var(--xmlui-borderColor-NumberBox-warning--hover)", "Input:backgroundColor-NumberBox-warning--hover": "var(--xmlui-backgroundColor-NumberBox-warning--hover)", "Input:boxShadow-NumberBox-warning--hover": "var(--xmlui-boxShadow-NumberBox-warning--hover)", "Input:color-NumberBox-warning--hover": "var(--xmlui-color-NumberBox-warning--hover)", "Input:borderColor-NumberBox-warning--focus": "var(--xmlui-borderColor-NumberBox-warning--focus)", "Input:backgroundColor-NumberBox-warning--focus": "var(--xmlui-backgroundColor-NumberBox-warning--focus)", "Input:boxShadow-NumberBox-warning--focus": "var(--xmlui-boxShadow-NumberBox-warning--focus)", "Input:color-NumberBox-warning--focus": "var(--xmlui-color-NumberBox-warning--focus)", "Input:outlineWidth-NumberBox-warning--focus": "var(--xmlui-outlineWidth-NumberBox-warning--focus)", "Input:outlineColor-NumberBox-warning--focus": "var(--xmlui-outlineColor-NumberBox-warning--focus)", "Input:outlineStyle-NumberBox-warning--focus": "var(--xmlui-outlineStyle-NumberBox-warning--focus)", "Input:outlineOffset-NumberBox-warning--focus": "var(--xmlui-outlineOffset-NumberBox-warning--focus)", "Input:color-placeholder-NumberBox-warning": "var(--xmlui-color-placeholder-NumberBox-warning)", "Input:color-adornment-NumberBox-warning": "var(--xmlui-color-adornment-NumberBox-warning)", "Input:borderRadius-NumberBox-success": "var(--xmlui-borderRadius-NumberBox-success)", "Input:borderColor-NumberBox-success": "var(--xmlui-borderColor-NumberBox-success)", "Input:borderWidth-NumberBox-success": "var(--xmlui-borderWidth-NumberBox-success)", "Input:borderStyle-NumberBox-success": "var(--xmlui-borderStyle-NumberBox-success)", "Input:fontSize-NumberBox-success": "var(--xmlui-fontSize-NumberBox-success)", "Input:backgroundColor-NumberBox-success": "var(--xmlui-backgroundColor-NumberBox-success)", "Input:boxShadow-NumberBox-success": "var(--xmlui-boxShadow-NumberBox-success)", "Input:color-NumberBox-success": "var(--xmlui-color-NumberBox-success)", "Input:borderColor-NumberBox-success--hover": "var(--xmlui-borderColor-NumberBox-success--hover)", "Input:backgroundColor-NumberBox-success--hover": "var(--xmlui-backgroundColor-NumberBox-success--hover)", "Input:boxShadow-NumberBox-success--hover": "var(--xmlui-boxShadow-NumberBox-success--hover)", "Input:color-NumberBox-success--hover": "var(--xmlui-color-NumberBox-success--hover)", "Input:borderColor-NumberBox-success--focus": "var(--xmlui-borderColor-NumberBox-success--focus)", "Input:backgroundColor-NumberBox-success--focus": "var(--xmlui-backgroundColor-NumberBox-success--focus)", "Input:boxShadow-NumberBox-success--focus": "var(--xmlui-boxShadow-NumberBox-success--focus)", "Input:color-NumberBox-success--focus": "var(--xmlui-color-NumberBox-success--focus)", "Input:outlineWidth-NumberBox-success--focus": "var(--xmlui-outlineWidth-NumberBox-success--focus)", "Input:outlineColor-NumberBox-success--focus": "var(--xmlui-outlineColor-NumberBox-success--focus)", "Input:outlineStyle-NumberBox-success--focus": "var(--xmlui-outlineStyle-NumberBox-success--focus)", "Input:outlineOffset-NumberBox-success--focus": "var(--xmlui-outlineOffset-NumberBox-success--focus)", "Input:color-placeholder-NumberBox-success": "var(--xmlui-color-placeholder-NumberBox-success)", "Input:color-adornment-NumberBox-success": "var(--xmlui-color-adornment-NumberBox-success)", "Input:backgroundColor-NumberBox--disabled": "var(--xmlui-backgroundColor-NumberBox--disabled)", "Input:color-NumberBox--disabled": "var(--xmlui-color-NumberBox--disabled)", "Input:borderColor-NumberBox--disabled": "var(--xmlui-borderColor-NumberBox--disabled)"}'`, zx = "_inputRoot_1a7gs_13", Vx = "_input_1a7gs_13", Ex = "_adornment_1a7gs_53", Dx = "_error_1a7gs_56", Px = "_warning_1a7gs_90", Mx = "_valid_1a7gs_124", Fx = "_spinnerBox_1a7gs_184", qx = "_spinnerButton_1a7gs_191", Ux = "_readOnly_1a7gs_197", je = {
  themeVars: Rx,
  inputRoot: zx,
  input: Vx,
  adornment: Ex,
  error: Dx,
  warning: Px,
  valid: Mx,
  spinnerBox: Fx,
  spinnerButton: qx,
  readOnly: Ux
}, Cl = 999999999999999, qa = ".", Qo = "e", Gx = /^-?\d+$/, Yx = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/, Xx = 1;
function kl(e) {
  return typeof e > "u" || e === null || e === "";
}
function xa(e) {
  return typeof e == "string" ? e : typeof e == "number" ? e.toString() : "";
}
function Qx(e, r, t) {
  let o = e;
  return e < r && (o = r), e > t && (o = t), o;
}
function Sl(e, r = !1) {
  return (r ? Jx : Zx)(e) ? (typeof e == "string" && (e = r ? Number.parseInt(e) : +e), e) : null;
}
function Zx(e) {
  return typeof e == "string" && e.length > 0 ? !Number.isNaN(+e) && jx(e) : typeof e == "number";
}
function jx(e) {
  const r = e.split(".")[0];
  return Math.abs(Number.parseInt(r)) <= Cl;
}
function Jx(e) {
  return typeof e == "string" && e.length > 0 && ![Qo, qa].some((r) => e.includes(r)) ? Number.isSafeInteger(+e) : typeof e == "number" ? Number.isSafeInteger(e) : !1;
}
const Kx = xe(function({
  id: r,
  value: t,
  initialValue: o,
  style: a,
  enabled: n = !0,
  placeholder: i,
  validationStatus: l = "none",
  hasSpinBox: s = !0,
  step: f,
  integersOnly: h = !1,
  zeroOrPositive: c = !1,
  min: T = c ? 0 : -999999999999999,
  max: b = Cl,
  maxLength: v,
  updateState: y = de,
  onDidChange: w = de,
  onFocus: _ = de,
  onBlur: H = de,
  registerComponentApi: $,
  startText: O,
  startIcon: F,
  endText: Y,
  endIcon: V,
  autoFocus: R,
  readOnly: W,
  required: z,
  label: x,
  labelPosition: m,
  labelWidth: g,
  labelBreak: k
}, A) {
  T = Math.max(c ? 0 : -999999999999999, T);
  const q = Sl(f, !0) ?? Xx, E = he(null), N = he(null), B = he(null);
  K(() => {
    R && setTimeout(() => {
      var Q;
      (Q = E.current) == null || Q.focus();
    }, 0);
  }, [R]);
  const [D, P] = Ae.useState(xa(t));
  K(() => {
    P(xa(t));
  }, [t]), K(() => {
    y({ value: o }, { initial: !0 });
  }, [o, y]);
  const I = X(
    (Q, ne) => {
      P(ne), y({ value: Q }), w(Q);
    },
    [w, y]
  ), M = X(
    (Q) => {
      const ne = Q.target.value;
      I(ne, ne);
    },
    [I]
  ), G = X(() => {
    if (W) return;
    const Q = Xi(D, q, T, b, h);
    Q !== void 0 && I(Q, Q.toString());
  }, [D, q, T, b, h, I, W]), J = X(() => {
    if (W) return;
    const Q = Xi(D, -q, T, b, h);
    Q !== void 0 && I(Q, Q.toString());
  }, [D, q, T, b, h, I, W]);
  Qi(N.current, G), Qi(B.current, J);
  const ee = (Q) => {
    var bo;
    let ne = !1;
    const Le = Q.target.value ?? "", Pr = Q.target.selectionStart, Ze = Le.substring(0, Q.target.selectionStart).indexOf(Qo);
    switch (Q.data) {
      case "-":
        ne = !0, Ze === -1 ? Le.startsWith("-") || kt("-" + Le, Pr + 1) : Le[Ze + 1] !== "-" && kt(
          Le.substring(0, Ze + 1) + "-" + Le.substring(Ze + 1),
          Pr + 1
        );
        break;
      case "+":
        ne = !0, Ze === -1 ? Le.startsWith("-") && kt(Le.substring(1), Pr - 1) : Le[Ze + 1] === "-" && kt(
          Le.substring(0, Ze + 1) + Le.substring(Ze + 2),
          Pr - 1
        );
        break;
      case qa:
        (h || Le.includes(qa) || Ze !== -1) && (ne = !0);
        break;
      case Qo:
        if (h) {
          ne = !0;
          break;
        }
        (Le.includes(Qo) || Ft(Pr, 2)) && (ne = !0);
        break;
      default:
        let Ne = Q.data;
        const Ue = Q.target.selectionStart;
        if (((bo = Q.data) == null ? void 0 : bo.length) > 0) {
          if (Ne.startsWith("-")) {
            if (Ue > 0) {
              ne = !0;
              break;
            }
          } else if (Ne.startsWith("+")) {
            ne = !0;
            break;
          }
          const Ge = Le.substring(0, Ue) + Ne + Le.substring(Q.target.selectionEnd);
          h && !Gx.test(Ge) ? ne = !0 : Yx.test(Ge) || (ne = !0);
          break;
        }
        if (Q.data < "0" || Q.data > "9") {
          ne = !0;
          break;
        }
        if (Le.startsWith("-") && Ue === 0) {
          ne = !0;
          break;
        }
        Ze !== -1 && Ft(Ze + 1, 1) && (ne = !0);
        break;
    }
    ne && Q.preventDefault();
    return;
    function Ft(Ne, Ue) {
      let Ge = 0;
      for (; Ne < Le.length; )
        if (/\d/.test(Le[Ne++]))
          Ge++;
        else {
          Ge = Ue + 1;
          break;
        }
      return Ge > Ue;
    }
    function kt(Ne, Ue) {
      var Ge;
      Q.target.value = Ne, I(Ne, Ne), (Ge = E.current) == null || Ge.setSelectionRange(Ue, Ue);
    }
  }, Ce = X(
    (Q) => {
      Q.code === "ArrowUp" && (Q.preventDefault(), G()), Q.code === "ArrowDown" && (Q.preventDefault(), J());
    },
    [G, J]
  ), qe = X(() => {
    _ == null || _();
  }, [_]), Ee = X(() => {
    P(xa(t)), H == null || H();
  }, [t, H]), ae = X(() => {
    var Q;
    (Q = E.current) == null || Q.focus();
  }, []), te = $e((Q) => {
    I(Q, kl(Q) ? "" : String(Q));
  });
  return K(() => {
    $ == null || $({
      focus: ae,
      setValue: te
    });
  }, [ae, $, te]), /* @__PURE__ */ p(
    Ir,
    {
      ref: A,
      labelPosition: m,
      label: x,
      labelWidth: g,
      labelBreak: k,
      required: z,
      enabled: n,
      onFocus: _,
      onBlur: H,
      style: a,
      children: /* @__PURE__ */ j(
        "div",
        {
          className: le(je.inputRoot, {
            [je.readOnly]: W,
            [je.disabled]: !n,
            [je.noSpinBox]: !s,
            [je.error]: l === "error",
            [je.warning]: l === "warning",
            [je.valid]: l === "valid"
          }),
          tabIndex: -1,
          onFocus: () => {
            var Q;
            (Q = E.current) == null || Q.focus();
          },
          children: [
            /* @__PURE__ */ p(lo, { text: O, iconName: F, className: je.adornment }),
            /* @__PURE__ */ p(
              "input",
              {
                id: r,
                type: "text",
                inputMode: "numeric",
                className: le(je.input, { [je.readOnly]: W }),
                disabled: !n,
                value: D,
                step: f,
                placeholder: i,
                onChange: M,
                onFocus: qe,
                onBlur: Ee,
                onBeforeInput: ee,
                onKeyDown: Ce,
                readOnly: W,
                ref: E,
                autoFocus: R,
                maxLength: v,
                required: z
              }
            ),
            /* @__PURE__ */ p(lo, { text: Y, iconName: V, className: je.adornment }),
            s && /* @__PURE__ */ j("div", { className: je.spinnerBox, children: [
              /* @__PURE__ */ p(
                dr,
                {
                  "data-spinner": "up",
                  type: "button",
                  variant: "ghost",
                  themeColor: "secondary",
                  tabIndex: -1,
                  className: je.spinnerButton,
                  disabled: !n || W,
                  ref: N,
                  children: /* @__PURE__ */ p(ye, { name: "chevronup", size: "sm" })
                }
              ),
              /* @__PURE__ */ p(
                dr,
                {
                  "data-spinner": "down",
                  type: "button",
                  tabIndex: -1,
                  variant: "ghost",
                  themeColor: "secondary",
                  className: je.spinnerButton,
                  disabled: !n || W,
                  ref: B,
                  children: /* @__PURE__ */ p(ye, { name: "chevrondown", size: "sm" })
                }
              )
            ] })
          ]
        }
      )
    }
  );
});
function Xi(e, r, t, o, a) {
  const n = Sl(e, a);
  if (!kl(n))
    return Qx(n + r, t, o);
}
function Qi(e, r, t = 500) {
  const o = he(0), a = he(0), n = he(r);
  K(() => {
    n.current = r;
  }, [r]), K(() => {
    const i = () => {
      var f;
      (f = n.current) == null || f.call(n), o.current = window.setTimeout(() => {
        a.current = window.setInterval(() => {
          var h;
          (h = n.current) == null || h.call(n);
        }, 100);
      }, t);
    }, l = () => {
      clearTimeout(o.current), clearInterval(a.current);
    }, s = () => {
      clearTimeout(o.current), clearInterval(a.current);
    };
    return e == null || e.addEventListener("mousedown", i), e == null || e.addEventListener("mouseup", l), e == null || e.addEventListener("mouseout", s), () => {
      e == null || e.removeEventListener("mousedown", i), e == null || e.removeEventListener("mouseup", l), e == null || e.removeEventListener("mouseout", s);
    };
  }, [e, r, t]);
}
function co() {
  return co = Object.assign ? Object.assign.bind() : function(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = arguments[r];
      for (var o in t) ({}).hasOwnProperty.call(t, o) && (e[o] = t[o]);
    }
    return e;
  }, co.apply(null, arguments);
}
function eb(e, r) {
  typeof e == "function" ? e(r) : e != null && (e.current = r);
}
function wl(...e) {
  return (r) => e.forEach(
    (t) => eb(t, r)
  );
}
function rb(...e) {
  return X(wl(...e), e);
}
const Hl = /* @__PURE__ */ xe((e, r) => {
  const { children: t, ...o } = e, a = Ho.toArray(t), n = a.find(ob);
  if (n) {
    const i = n.props.children, l = a.map((s) => s === n ? Ho.count(i) > 1 ? Ho.only(null) : /* @__PURE__ */ jo(i) ? i.props.children : null : s);
    return /* @__PURE__ */ Io(Ua, co({}, o, {
      ref: r
    }), /* @__PURE__ */ jo(i) ? /* @__PURE__ */ Bn(i, void 0, l) : null);
  }
  return /* @__PURE__ */ Io(Ua, co({}, o, {
    ref: r
  }), t);
});
Hl.displayName = "Slot";
const Ua = /* @__PURE__ */ xe((e, r) => {
  const { children: t, ...o } = e;
  return /* @__PURE__ */ jo(t) ? /* @__PURE__ */ Bn(t, {
    ...ab(o, t.props),
    ref: r ? wl(r, t.ref) : t.ref
  }) : Ho.count(t) > 1 ? Ho.only(null) : null;
});
Ua.displayName = "SlotClone";
const tb = ({ children: e }) => /* @__PURE__ */ Io(In, null, e);
function ob(e) {
  return /* @__PURE__ */ jo(e) && e.type === tb;
}
function ab(e, r) {
  const t = {
    ...r
  };
  for (const o in r) {
    const a = e[o], n = r[o];
    /^on[A-Z]/.test(o) ? a && n ? t[o] = (...l) => {
      n(...l), a(...l);
    } : a && (t[o] = a) : o === "style" ? t[o] = {
      ...a,
      ...n
    } : o === "className" && (t[o] = [
      a,
      n
    ].filter(Boolean).join(" "));
  }
  return {
    ...e,
    ...t
  };
}
const ib = [
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
  "span",
  "svg",
  "ul"
], nb = ib.reduce((e, r) => {
  const t = /* @__PURE__ */ xe((o, a) => {
    const { asChild: n, ...i } = o, l = n ? Hl : r;
    return K(() => {
      window[Symbol.for("radix-ui")] = !0;
    }, []), /* @__PURE__ */ Io(l, co({}, i, {
      ref: a
    }));
  });
  return t.displayName = `Primitive.${r}`, {
    ...e,
    [r]: t
  };
}, {});
function Zi(e) {
  const r = he(e);
  return K(() => {
    r.current = e;
  }), ue(
    () => (...t) => {
      var o;
      return (o = r.current) === null || o === void 0 ? void 0 : o.call(r, ...t);
    },
    []
  );
}
const ba = "focusScope.autoFocusOnMount", fa = "focusScope.autoFocusOnUnmount", ji = {
  bubbles: !1,
  cancelable: !0
}, lb = /* @__PURE__ */ xe((e, r) => {
  const { loop: t = !1, trapped: o = !1, onMountAutoFocus: a, onUnmountAutoFocus: n, ...i } = e, [l, s] = me(null), f = Zi(a), h = Zi(n), c = he(null), T = rb(
    r,
    (y) => s(y)
  ), b = he({
    paused: !1,
    pause() {
      this.paused = !0;
    },
    resume() {
      this.paused = !1;
    }
  }).current;
  K(() => {
    if (o) {
      let y = function($) {
        if (b.paused || !l) return;
        const O = $.target;
        l.contains(O) ? c.current = O : ft(c.current, {
          select: !0
        });
      }, w = function($) {
        if (b.paused || !l) return;
        const O = $.relatedTarget;
        O !== null && (l.contains(O) || ft(c.current, {
          select: !0
        }));
      }, _ = function($) {
        if (document.activeElement === document.body)
          for (const F of $) F.removedNodes.length > 0 && ft(l);
      };
      document.addEventListener("focusin", y), document.addEventListener("focusout", w);
      const H = new MutationObserver(_);
      return l && H.observe(l, {
        childList: !0,
        subtree: !0
      }), () => {
        document.removeEventListener("focusin", y), document.removeEventListener("focusout", w), H.disconnect();
      };
    }
  }, [
    o,
    l,
    b.paused
  ]), K(() => {
    if (l) {
      Ki.add(b);
      const y = document.activeElement;
      if (!l.contains(y)) {
        const _ = new CustomEvent(ba, ji);
        l.addEventListener(ba, f), l.dispatchEvent(_), _.defaultPrevented || (db(pb(Bl(l)), {
          select: !0
        }), document.activeElement === y && ft(l));
      }
      return () => {
        l.removeEventListener(ba, f), setTimeout(() => {
          const _ = new CustomEvent(fa, ji);
          l.addEventListener(fa, h), l.dispatchEvent(_), _.defaultPrevented || ft(y ?? document.body, {
            select: !0
          }), l.removeEventListener(fa, h), Ki.remove(b);
        }, 0);
      };
    }
  }, [
    l,
    f,
    h,
    b
  ]);
  const v = X((y) => {
    if (!t && !o || b.paused) return;
    const w = y.key === "Tab" && !y.altKey && !y.ctrlKey && !y.metaKey, _ = document.activeElement;
    if (w && _) {
      const H = y.currentTarget, [$, O] = sb(H);
      $ && O ? !y.shiftKey && _ === O ? (y.preventDefault(), t && ft($, {
        select: !0
      })) : y.shiftKey && _ === $ && (y.preventDefault(), t && ft(O, {
        select: !0
      })) : _ === H && y.preventDefault();
    }
  }, [
    t,
    o,
    b.paused
  ]);
  return /* @__PURE__ */ Io(nb.div, co({
    tabIndex: -1
  }, i, {
    ref: T,
    onKeyDown: v
  }));
});
function db(e, { select: r = !1 } = {}) {
  const t = document.activeElement;
  for (const o of e)
    if (ft(o, {
      select: r
    }), document.activeElement !== t) return;
}
function sb(e) {
  const r = Bl(e), t = Ji(r, e), o = Ji(r.reverse(), e);
  return [
    t,
    o
  ];
}
function Bl(e) {
  const r = [], t = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (o) => {
      const a = o.tagName === "INPUT" && o.type === "hidden";
      return o.disabled || o.hidden || a ? NodeFilter.FILTER_SKIP : o.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; t.nextNode(); ) r.push(t.currentNode);
  return r;
}
function Ji(e, r) {
  for (const t of e)
    if (!ub(t, {
      upTo: r
    })) return t;
}
function ub(e, { upTo: r }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (r !== void 0 && e === r) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function cb(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function ft(e, { select: r = !1 } = {}) {
  if (e && e.focus) {
    const t = document.activeElement;
    e.focus({
      preventScroll: !0
    }), e !== t && cb(e) && r && e.select();
  }
}
const Ki = mb();
function mb() {
  let e = [];
  return {
    add(r) {
      const t = e[0];
      r !== t && (t == null || t.pause()), e = en(e, r), e.unshift(r);
    },
    remove(r) {
      var t;
      e = en(e, r), (t = e[0]) === null || t === void 0 || t.resume();
    }
  };
}
function en(e, r) {
  const t = [
    ...e
  ], o = t.indexOf(r);
  return o !== -1 && t.splice(o, 1), t;
}
function pb(e) {
  return e.filter(
    (r) => r.tagName !== "A"
  );
}
const hb = `'{"Input:fontSize-Select-default": "var(--xmlui-fontSize-Select-default)", "Input:color-placeholder-Select-default": "var(--xmlui-color-placeholder-Select-default)", "Input:color-Select-default": "var(--xmlui-color-Select-default)", "Input:fontSize-Select-error": "var(--xmlui-fontSize-Select-error)", "Input:color-placeholder-Select-error": "var(--xmlui-color-placeholder-Select-error)", "Input:color-Select-error": "var(--xmlui-color-Select-error)", "Input:fontSize-Select-warning": "var(--xmlui-fontSize-Select-warning)", "Input:color-placeholder-Select-warning": "var(--xmlui-color-placeholder-Select-warning)", "Input:color-Select-warning": "var(--xmlui-color-Select-warning)", "Input:fontSize-Select-success": "var(--xmlui-fontSize-Select-success)", "Input:color-placeholder-Select-success": "var(--xmlui-color-placeholder-Select-success)", "Input:color-Select-success": "var(--xmlui-color-Select-success)", "Input:borderRadius-Select-default": "var(--xmlui-borderRadius-Select-default)", "Input:borderColor-Select-default": "var(--xmlui-borderColor-Select-default)", "Input:borderWidth-Select-default": "var(--xmlui-borderWidth-Select-default)", "Input:borderStyle-Select-default": "var(--xmlui-borderStyle-Select-default)", "Input:backgroundColor-Select-default": "var(--xmlui-backgroundColor-Select-default)", "Input:boxShadow-Select-default": "var(--xmlui-boxShadow-Select-default)", "Input:borderColor-Select-default--hover": "var(--xmlui-borderColor-Select-default--hover)", "Input:backgroundColor-Select-default--hover": "var(--xmlui-backgroundColor-Select-default--hover)", "Input:boxShadow-Select-default--hover": "var(--xmlui-boxShadow-Select-default--hover)", "Input:color-Select-default--hover": "var(--xmlui-color-Select-default--hover)", "Input:outlineWidth-Select-default--focus": "var(--xmlui-outlineWidth-Select-default--focus)", "Input:outlineColor-Select-default--focus": "var(--xmlui-outlineColor-Select-default--focus)", "Input:outlineStyle-Select-default--focus": "var(--xmlui-outlineStyle-Select-default--focus)", "Input:outlineOffset-Select-default--focus": "var(--xmlui-outlineOffset-Select-default--focus)", "Input:borderRadius-Select-error": "var(--xmlui-borderRadius-Select-error)", "Input:borderColor-Select-error": "var(--xmlui-borderColor-Select-error)", "Input:borderWidth-Select-error": "var(--xmlui-borderWidth-Select-error)", "Input:borderStyle-Select-error": "var(--xmlui-borderStyle-Select-error)", "Input:backgroundColor-Select-error": "var(--xmlui-backgroundColor-Select-error)", "Input:boxShadow-Select-error": "var(--xmlui-boxShadow-Select-error)", "Input:borderColor-Select-error--hover": "var(--xmlui-borderColor-Select-error--hover)", "Input:backgroundColor-Select-error--hover": "var(--xmlui-backgroundColor-Select-error--hover)", "Input:boxShadow-Select-error--hover": "var(--xmlui-boxShadow-Select-error--hover)", "Input:color-Select-error--hover": "var(--xmlui-color-Select-error--hover)", "Input:outlineWidth-Select-error--focus": "var(--xmlui-outlineWidth-Select-error--focus)", "Input:outlineColor-Select-error--focus": "var(--xmlui-outlineColor-Select-error--focus)", "Input:outlineStyle-Select-error--focus": "var(--xmlui-outlineStyle-Select-error--focus)", "Input:outlineOffset-Select-error--focus": "var(--xmlui-outlineOffset-Select-error--focus)", "Input:borderRadius-Select-warning": "var(--xmlui-borderRadius-Select-warning)", "Input:borderColor-Select-warning": "var(--xmlui-borderColor-Select-warning)", "Input:borderWidth-Select-warning": "var(--xmlui-borderWidth-Select-warning)", "Input:borderStyle-Select-warning": "var(--xmlui-borderStyle-Select-warning)", "Input:backgroundColor-Select-warning": "var(--xmlui-backgroundColor-Select-warning)", "Input:boxShadow-Select-warning": "var(--xmlui-boxShadow-Select-warning)", "Input:borderColor-Select-warning--hover": "var(--xmlui-borderColor-Select-warning--hover)", "Input:backgroundColor-Select-warning--hover": "var(--xmlui-backgroundColor-Select-warning--hover)", "Input:boxShadow-Select-warning--hover": "var(--xmlui-boxShadow-Select-warning--hover)", "Input:color-Select-warning--hover": "var(--xmlui-color-Select-warning--hover)", "Input:outlineWidth-Select-warning--focus": "var(--xmlui-outlineWidth-Select-warning--focus)", "Input:outlineColor-Select-warning--focus": "var(--xmlui-outlineColor-Select-warning--focus)", "Input:outlineStyle-Select-warning--focus": "var(--xmlui-outlineStyle-Select-warning--focus)", "Input:outlineOffset-Select-warning--focus": "var(--xmlui-outlineOffset-Select-warning--focus)", "Input:borderRadius-Select-success": "var(--xmlui-borderRadius-Select-success)", "Input:borderColor-Select-success": "var(--xmlui-borderColor-Select-success)", "Input:borderWidth-Select-success": "var(--xmlui-borderWidth-Select-success)", "Input:borderStyle-Select-success": "var(--xmlui-borderStyle-Select-success)", "Input:backgroundColor-Select-success": "var(--xmlui-backgroundColor-Select-success)", "Input:boxShadow-Select-success": "var(--xmlui-boxShadow-Select-success)", "Input:borderColor-Select-success--hover": "var(--xmlui-borderColor-Select-success--hover)", "Input:backgroundColor-Select-success--hover": "var(--xmlui-backgroundColor-Select-success--hover)", "Input:boxShadow-Select-success--hover": "var(--xmlui-boxShadow-Select-success--hover)", "Input:color-Select-success--hover": "var(--xmlui-color-Select-success--hover)", "Input:outlineWidth-Select-success--focus": "var(--xmlui-outlineWidth-Select-success--focus)", "Input:outlineColor-Select-success--focus": "var(--xmlui-outlineColor-Select-success--focus)", "Input:outlineStyle-Select-success--focus": "var(--xmlui-outlineStyle-Select-success--focus)", "Input:outlineOffset-Select-success--focus": "var(--xmlui-outlineOffset-Select-success--focus)", "opacity-Select--disabled": "var(--xmlui-opacity-Select--disabled)", "Input:backgroundColor-Select--disabled": "var(--xmlui-backgroundColor-Select--disabled)", "Input:color-Select--disabled": "var(--xmlui-color-Select--disabled)", "Input:borderColor-Select--disabled": "var(--xmlui-borderColor-Select--disabled)", "paddingVertical-Select-badge": "var(--xmlui-paddingVertical-Select-badge)", "paddingHorizontal-Select-badge": "var(--xmlui-paddingHorizontal-Select-badge)", "Input:fontSize-Select-badge": "var(--xmlui-fontSize-Select-badge)", "Input:backgroundColor-Select-badge": "var(--xmlui-backgroundColor-Select-badge)", "Input:color-Select-badge": "var(--xmlui-color-Select-badge)", "Input:backgroundColor-Select-badge--hover": "var(--xmlui-backgroundColor-Select-badge--hover)", "Input:color-Select-badge--hover": "var(--xmlui-color-Select-badge--hover)", "Input:backgroundColor-Select-badge--active": "var(--xmlui-backgroundColor-Select-badge--active)", "Input:color-Select-badge--active": "var(--xmlui-color-Select-badge--active)", "Input:color-placeholder-Select": "var(--xmlui-color-placeholder-Select)", "Input:backgroundColor-menu-Select": "var(--xmlui-backgroundColor-menu-Select)", "Input:borderRadius-menu-Select": "var(--xmlui-borderRadius-menu-Select)", "Input:boxShadow-menu-Select": "var(--xmlui-boxShadow-menu-Select)", "Input:borderWidth-menu-Select": "var(--xmlui-borderWidth-menu-Select)", "Input:borderColor-menu-Select": "var(--xmlui-borderColor-menu-Select)", "backgroundColor-item-Select": "var(--xmlui-backgroundColor-item-Select)", "backgroundColor-item-Select--hover": "var(--xmlui-backgroundColor-item-Select--hover)", "opacity-text-item-Select--disabled": "var(--xmlui-opacity-text-item-Select--disabled)", "fontSize-Select": "var(--xmlui-fontSize-Select)", "backgroundColor-item-Select--active": "var(--xmlui-backgroundColor-item-Select--active)", "color-indicator-Select": "var(--xmlui-color-indicator-Select)"}'`, xb = "_selectValue_fecn5_13", bb = "_error_fecn5_21", fb = "_warning_fecn5_29", vb = "_valid_fecn5_37", gb = "_selectTrigger_fecn5_46", Tb = "_badgeListContainer_fecn5_170", yb = "_badgeList_fecn5_170", Cb = "_badge_fecn5_170", kb = "_actions_fecn5_210", Sb = "_placeholder_fecn5_216", wb = "_emptyList_fecn5_221", Hb = "_selectScrollUpButton_fecn5_231", Bb = "_selectScrollDownButton_fecn5_240", Ib = "_command_fecn5_249", $b = "_commandInputContainer_fecn5_259", Lb = "_commandInput_fecn5_259", _b = "_commandList_fecn5_284", Ab = "_selectContent_fecn5_289", Nb = "_fadeIn_fecn5_1", Wb = "_zoomIn_fecn5_1", Ob = "_fadeOut_fecn5_1", Rb = "_zoomOut_fecn5_1", zb = "_slideInFromTop_fecn5_1", Vb = "_slideInFromRight_fecn5_1", Eb = "_slideInFromLeft_fecn5_1", Db = "_slideInFromBottom_fecn5_1", Pb = "_multiComboboxOption_fecn5_329", Mb = "_selectItem_fecn5_349", Fb = "_selectItemIndicator_fecn5_377", qb = "_selectViewport_fecn5_388", Ub = "_selectEmpty_fecn5_394", Gb = "_srOnly_fecn5_405", ke = {
  themeVars: hb,
  selectValue: xb,
  error: bb,
  warning: fb,
  valid: vb,
  selectTrigger: gb,
  badgeListContainer: Tb,
  badgeList: yb,
  badge: Cb,
  actions: kb,
  placeholder: Sb,
  emptyList: wb,
  selectScrollUpButton: Hb,
  selectScrollDownButton: Bb,
  command: Ib,
  commandInputContainer: $b,
  commandInput: Lb,
  commandList: _b,
  selectContent: Ab,
  fadeIn: Nb,
  zoomIn: Wb,
  fadeOut: Ob,
  zoomOut: Rb,
  slideInFromTop: zb,
  slideInFromRight: Vb,
  slideInFromLeft: Eb,
  slideInFromBottom: Db,
  multiComboboxOption: Pb,
  selectItem: Mb,
  selectItemIndicator: Fb,
  selectViewport: qb,
  selectEmpty: Ub,
  srOnly: Gb
}, Il = Zr(null);
function $l() {
  return $r(Il);
}
const Ll = Ae.createContext(null);
function Yb() {
  return Ae.useContext(Ll);
}
function la({
  children: e,
  Component: r
}) {
  return /* @__PURE__ */ p(Ll.Provider, { value: r, children: e });
}
const ni = Zr({
  onOptionAdd: () => {
  },
  onOptionRemove: () => {
  }
});
function li() {
  return $r(ni);
}
const Xb = xe(function(r, t) {
  const { root: o } = dt(), {
    enabled: a,
    onBlur: n,
    autoFocus: i,
    onValueChange: l,
    validationStatus: s,
    children: f,
    value: h,
    height: c,
    style: T,
    placeholder: b,
    id: v,
    triggerRef: y,
    onFocus: w,
    options: _
  } = r, H = t ? st(y, t) : y, $ = h + "", O = X(
    (F) => {
      var V;
      const Y = (V = Array.from(_.values()).find(
        (R) => R.value + "" === F
      )) == null ? void 0 : V.value;
      l(Y);
    },
    [l, _]
  );
  return /* @__PURE__ */ p(la, { Component: Al, children: /* @__PURE__ */ j(ud, { value: $, onValueChange: O, children: [
    /* @__PURE__ */ j(
      cd,
      {
        id: v,
        style: T,
        onFocus: w,
        onBlur: n,
        disabled: !a,
        className: le(ke.selectTrigger, {
          [ke.error]: s === "error",
          [ke.warning]: s === "warning",
          [ke.valid]: s === "valid"
        }),
        ref: H,
        autoFocus: i,
        children: [
          /* @__PURE__ */ p("div", { className: ke.selectValue, children: /* @__PURE__ */ p(md, { placeholder: b }) }),
          /* @__PURE__ */ p(pd, { asChild: !0, children: /* @__PURE__ */ p(ye, { name: "chevrondown" }) })
        ]
      }
    ),
    /* @__PURE__ */ p(Nn, { container: o, children: /* @__PURE__ */ j(
      hd,
      {
        className: ke.selectContent,
        position: "popper",
        style: { height: c },
        children: [
          /* @__PURE__ */ p(xd, { className: ke.selectScrollUpButton, children: /* @__PURE__ */ p(ye, { name: "chevronup" }) }),
          /* @__PURE__ */ p(bd, { className: le(ke.selectViewport), children: f }),
          /* @__PURE__ */ p(fd, { className: ke.selectScrollDownButton, children: /* @__PURE__ */ p(ye, { name: "chevrondown" }) })
        ]
      }
    ) })
  ] }) });
}), Qb = xe(function({
  id: r,
  initialValue: t,
  value: o,
  enabled: a = !0,
  placeholder: n,
  updateState: i = de,
  validationStatus: l = "none",
  onDidChange: s = de,
  onFocus: f = de,
  onBlur: h = de,
  registerComponentApi: c,
  emptyListTemplate: T,
  optionLabelRenderer: b,
  valueRenderer: v,
  style: y,
  dropdownHeight: w,
  children: _,
  autoFocus: H = !1,
  searchable: $ = !1,
  multiSelect: O = !1,
  label: F,
  labelPosition: Y,
  labelWidth: V,
  labelBreak: R,
  required: W = !1
}, z) {
  var ae;
  const [x, m] = me(null), [g, k] = me(!1), [A, q] = me(0), E = he(), { root: N } = dt(), [B, D] = me(/* @__PURE__ */ new Set());
  K(() => {
    t !== void 0 && i({ value: t }, { initial: !0 });
  }, [t, i]), K(() => {
    var Q;
    const te = x;
    return (Q = E.current) == null || Q.disconnect(), te && (E.current = new ResizeObserver(() => q(te.clientWidth)), E.current.observe(te)), () => {
      var ne;
      (ne = E.current) == null || ne.disconnect();
    };
  }, [x]);
  const P = X(
    (te) => {
      const Q = O ? Array.isArray(o) ? o.includes(te) ? o.filter((ne) => ne !== te) : [...o, te] : [te] : te === o ? null : te;
      i({ value: Q }), s(Q), k(!1);
    },
    [O, o, i, s]
  ), I = X(() => {
    const te = O ? [] : "";
    i({ value: te }), s(te);
  }, [O, i, s]), M = X(() => {
    x == null || x.focus();
  }, [x]), G = $e((te) => {
    P(te);
  });
  K(() => {
    c == null || c({
      focus: M,
      setValue: G
    });
  }, [M, c, G]);
  const J = ue(
    () => T ?? /* @__PURE__ */ j("div", { className: ke.selectEmpty, children: [
      /* @__PURE__ */ p(ye, { name: "noresult" }),
      /* @__PURE__ */ p("span", { children: "List is empty" })
    ] }),
    [T]
  ), ee = X((te) => {
    D((Q) => new Set(Q).add(te));
  }, []), Ce = X((te) => {
    D((Q) => {
      const ne = new Set(Q);
      return ne.delete(te), ne;
    });
  }, []), qe = ue(
    () => ({
      onOptionAdd: ee,
      onOptionRemove: Ce
    }),
    [ee, Ce]
  ), Ee = ue(
    () => ({
      multiSelect: O,
      value: o,
      optionLabelRenderer: b,
      onChange: P
    }),
    [O, P, o, b]
  );
  return /* @__PURE__ */ p(Il.Provider, { value: Ee, children: /* @__PURE__ */ p(ni.Provider, { value: qe, children: $ || O ? /* @__PURE__ */ j(la, { Component: _l, children: [
    _,
    /* @__PURE__ */ p(
      Ir,
      {
        ref: z,
        labelPosition: Y,
        label: F,
        labelWidth: V,
        labelBreak: R,
        required: W,
        enabled: a,
        onFocus: f,
        onBlur: h,
        style: y,
        children: /* @__PURE__ */ j(yd, { open: g, onOpenChange: k, modal: !1, children: [
          /* @__PURE__ */ p(Cd, { asChild: !0, children: /* @__PURE__ */ j(
            "button",
            {
              id: r,
              ref: m,
              onFocus: f,
              onBlur: h,
              disabled: !a,
              "aria-expanded": g,
              onClick: () => k((te) => !te),
              className: le(ke.selectTrigger, ke[l], {
                [ke.disabled]: !a,
                [ke.multi]: O
              }),
              autoFocus: H,
              children: [
                O ? Array.isArray(o) && o.length > 0 ? /* @__PURE__ */ p("div", { className: ke.badgeListContainer, children: /* @__PURE__ */ p("div", { className: ke.badgeList, children: o.map(
                  (te) => {
                    var Q;
                    return v ? v(
                      Array.from(B).find((ne) => ne.value === te),
                      () => {
                        P(te);
                      }
                    ) : /* @__PURE__ */ j("span", { className: ke.badge, children: [
                      (Q = Array.from(B).find((ne) => ne.value === te)) == null ? void 0 : Q.label,
                      /* @__PURE__ */ p(
                        ye,
                        {
                          name: "close",
                          size: "sm",
                          onClick: (ne) => {
                            ne.stopPropagation(), P(te);
                          }
                        }
                      )
                    ] }, te);
                  }
                ) }) }) : /* @__PURE__ */ p("span", { className: ke.placeholder, children: n || "" }) : o != null ? /* @__PURE__ */ p("div", { children: (ae = Array.from(B).find((te) => te.value === o)) == null ? void 0 : ae.label }) : /* @__PURE__ */ p("span", { className: ke.placeholder, children: n || "" }),
                /* @__PURE__ */ j("div", { className: ke.actions, children: [
                  O && Array.isArray(o) && o.length > 0 && /* @__PURE__ */ p(
                    ye,
                    {
                      name: "close",
                      onClick: (te) => {
                        te.stopPropagation(), I();
                      }
                    }
                  ),
                  /* @__PURE__ */ p(ye, { name: "chevrondown" })
                ] })
              ]
            }
          ) }),
          g && /* @__PURE__ */ p(Nn, { container: N, children: /* @__PURE__ */ p(lb, { asChild: !0, loop: !0, trapped: !0, children: /* @__PURE__ */ p(
            kd,
            {
              style: { width: A, height: w },
              className: ke.selectContent,
              children: /* @__PURE__ */ j(
                Wn,
                {
                  className: ke.command,
                  shouldFilter: $,
                  filter: (te, Q, ne) => (te + " " + ne.join(" ")).toLowerCase().includes(Q.toLowerCase()) ? 1 : 0,
                  children: [
                    $ ? /* @__PURE__ */ j("div", { className: ke.commandInputContainer, children: [
                      /* @__PURE__ */ p(ye, { name: "search" }),
                      /* @__PURE__ */ p(
                        _a,
                        {
                          className: le(ke.commandInput),
                          placeholder: "Search..."
                        }
                      )
                    ] }) : (
                      // https://github.com/pacocoursey/cmdk/issues/322#issuecomment-2444703817
                      /* @__PURE__ */ p("button", { autoFocus: !0, "aria-hidden": "true", className: ke.srOnly })
                    ),
                    /* @__PURE__ */ j(On, { className: ke.commandList, children: [
                      Array.from(B).map(({ value: te, label: Q, enabled: ne, keywords: Le }) => /* @__PURE__ */ p(
                        Zb,
                        {
                          value: te,
                          label: Q,
                          enabled: ne,
                          keywords: Le
                        },
                        te
                      )),
                      /* @__PURE__ */ p(Rn, { children: J })
                    ] })
                  ]
                }
              )
            }
          ) }) })
        ] })
      }
    )
  ] }) : /* @__PURE__ */ p(
    Xb,
    {
      ref: z,
      value: o,
      options: B,
      onValueChange: P,
      id: r,
      style: y,
      onFocus: f,
      onBlur: h,
      enabled: a,
      validationStatus: l,
      triggerRef: m,
      autoFocus: H,
      placeholder: n,
      height: w,
      children: _ || J
    }
  ) }) });
}), Zb = xe(function(r, t) {
  const o = mo(), { label: a, value: n, enabled: i = !0, keywords: l } = r, { value: s, onChange: f, multi: h, optionLabelRenderer: c } = $l(), T = Array.isArray(s) && h ? s.includes(n) : s === n;
  return /* @__PURE__ */ j(
    Xa,
    {
      id: o,
      ref: t,
      disabled: !i,
      value: n,
      className: ke.multiComboboxOption,
      onSelect: () => {
        f(n);
      },
      "data-state": T ? "checked" : void 0,
      keywords: l,
      children: [
        c ? c({ label: a, value: n }) : a,
        T && /* @__PURE__ */ p(ye, { name: "checkmark" })
      ]
    },
    o
  );
});
function _l(e) {
  const { onOptionRemove: r, onOptionAdd: t } = li(), [o, a] = me(null), n = ue(() => ({
    ...e,
    labelText: (o == null ? void 0 : o.textContent) ?? "",
    keywords: [(o == null ? void 0 : o.textContent) ?? ""]
  }), [e, o]);
  return K(() => (t(n), () => r(n)), [n, t, r]), /* @__PURE__ */ p("div", { ref: (i) => a(i), style: { display: "none" }, children: e.label });
}
const Al = Ae.forwardRef(
  (e, r) => {
    const { value: t, label: o, enabled: a = !0 } = e, { onOptionRemove: n, onOptionAdd: i } = li(), { optionLabelRenderer: l } = $l();
    return Bo(() => (i(e), () => n(e)), [e, i, n]), /* @__PURE__ */ j(vd, { ref: r, className: ke.selectItem, value: t + "", disabled: !a, children: [
      /* @__PURE__ */ p(gd, { children: l ? l({ value: t, label: o }) : o }),
      /* @__PURE__ */ p("span", { className: ke.selectItemIndicator, children: /* @__PURE__ */ p(Td, { children: /* @__PURE__ */ p(ye, { name: "checkmark" }) }) })
    ] });
  }
);
Al.displayName = "SelectOption";
const jb = `'{"gap-RadioGroupOption": "var(--xmlui-gap-RadioGroupOption)", "Input:backgroundColor-RadioGroupOption-default": "var(--xmlui-backgroundColor-RadioGroupOption-default)", "borderWidth-RadioGroupOption": "var(--xmlui-borderWidth-RadioGroupOption)", "Input:borderColor-RadioGroupOption-default": "var(--xmlui-borderColor-RadioGroupOption-default)", "Input:borderColor-RadioGroupOption-default--hover": "var(--xmlui-borderColor-RadioGroupOption-default--hover)", "Input:borderColor-RadioGroupOption-default--active": "var(--xmlui-borderColor-RadioGroupOption-default--active)", "Input:borderColor-RadioGroupOption--disabled": "var(--xmlui-borderColor-RadioGroupOption--disabled)", "Input:color-RadioGroupOption--disabled": "var(--xmlui-color-RadioGroupOption--disabled)", "Input:borderColor-RadioGroupOption-error": "var(--xmlui-borderColor-RadioGroupOption-error)", "Input:borderColor-RadioGroupOption-warning": "var(--xmlui-borderColor-RadioGroupOption-warning)", "Input:borderColor-RadioGroupOption-success": "var(--xmlui-borderColor-RadioGroupOption-success)", "backgroundColor-checked-RadioGroupOption-default": "var(--xmlui-backgroundColor-checked-RadioGroupOption-default)", "backgroundColor-checked-RadioGroupOption--disabled": "var(--xmlui-backgroundColor-checked-RadioGroupOption--disabled)", "backgroundColor-checked-RadioGroupOption-error": "var(--xmlui-backgroundColor-checked-RadioGroupOption-error)", "backgroundColor-checked-RadioGroupOption-warning": "var(--xmlui-backgroundColor-checked-RadioGroupOption-warning)", "backgroundColor-checked-RadioGroupOption-success": "var(--xmlui-backgroundColor-checked-RadioGroupOption-success)", "Input:fontSize-RadioGroupOption": "var(--xmlui-fontSize-RadioGroupOption)", "Input:fontWeight-RadioGroupOption": "var(--xmlui-fontWeight-RadioGroupOption)", "Input:color-RadioGroupOption-default": "var(--xmlui-color-RadioGroupOption-default)", "Input:color-RadioGroupOption-error": "var(--xmlui-color-RadioGroupOption-error)", "Input:color-RadioGroupOption-warning": "var(--xmlui-color-RadioGroupOption-warning)", "Input:color-RadioGroupOption-success": "var(--xmlui-color-RadioGroupOption-success)", "Input:outlineWidth-RadioGroupOption--focus": "var(--xmlui-outlineWidth-RadioGroupOption--focus)", "Input:outlineColor-RadioGroupOption--focus": "var(--xmlui-outlineColor-RadioGroupOption--focus)", "Input:outlineStyle-RadioGroupOption--focus": "var(--xmlui-outlineStyle-RadioGroupOption--focus)", "Input:outlineOffset-RadioGroupOption--focus": "var(--xmlui-outlineOffset-RadioGroupOption--focus)"}'`, Jb = "_radioGroupContainer_294hm_13", Kb = "_radioOptionContainer_294hm_20", ef = "_radioOption_294hm_20", rf = "_error_294hm_55", tf = "_warning_294hm_58", of = "_valid_294hm_61", af = "_indicator_294hm_65", nf = "_disabled_294hm_78", lf = "_itemContainer_294hm_91", df = "_optionLabel_294hm_99", sf = "_label_294hm_104", ir = {
  themeVars: jb,
  radioGroupContainer: Jb,
  radioOptionContainer: Kb,
  radioOption: ef,
  error: rf,
  warning: tf,
  valid: of,
  indicator: af,
  disabled: nf,
  itemContainer: lf,
  optionLabel: df,
  label: sf
}, Nl = Zr({
  status: "none"
}), uf = xe(function({
  id: r,
  value: t = "",
  initialValue: o = "",
  enabled: a = !0,
  validationStatus: n = "none",
  label: i,
  labelPosition: l,
  labelWidth: s,
  labelBreak: f,
  required: h = !1,
  updateState: c = de,
  onDidChange: T = de,
  onFocus: b = de,
  onBlur: v = de,
  children: y,
  registerComponentApi: w,
  style: _
}, H) {
  const [$, O] = Ae.useState(!1);
  K(() => {
    c({ value: o }, { initial: !0 });
  }, [o, c]);
  const F = X(
    (x) => {
      c({ value: x }), T(x);
    },
    [T, c]
  ), Y = X(
    (x) => {
      F(x);
    },
    [F]
  ), V = X(() => {
    O(!0), b == null || b();
  }, [b]), R = X(() => {
    O(!1), v == null || v();
  }, [v]), W = $e((x) => {
    F(x);
  });
  K(() => {
    w == null || w({
      //focus,
      setValue: W
    });
  }, [
    /* focus, */
    w,
    W
  ]);
  const z = ue(() => ({ value: t, status: n }), [t, n]);
  return /* @__PURE__ */ p(
    Ir,
    {
      ref: H,
      labelPosition: l,
      label: i,
      labelWidth: s,
      labelBreak: f,
      required: h,
      enabled: a,
      onFocus: b,
      onBlur: v,
      style: _,
      children: /* @__PURE__ */ p(la, { Component: cf, children: /* @__PURE__ */ p(Nl.Provider, { value: z, children: /* @__PURE__ */ p(
        Aa.Root,
        {
          id: r,
          onBlur: R,
          onFocus: V,
          onValueChange: Y,
          value: t,
          disabled: !a,
          className: le(ir.radioGroupContainer, {
            [ir.focused]: $,
            [ir.disabled]: !a
          }),
          children: y
        }
      ) }) })
    }
  );
}), cf = ({
  value: e,
  label: r,
  enabled: t = !0,
  optionRenderer: o,
  style: a
}) => {
  const n = mo(), i = $r(Nl), l = ue(
    () => ({
      [ir.disabled]: !t,
      [ir.error]: e === i.value && i.status === "error",
      [ir.warning]: e === i.value && i.status === "warning",
      [ir.valid]: e === i.value && i.status === "valid"
    }),
    [t, i.status, i.value, e]
  ), s = ue(
    () => /* @__PURE__ */ j(gr, { children: [
      /* @__PURE__ */ p(
        Aa.Item,
        {
          className: le(ir.radioOption, l),
          value: e,
          disabled: !t,
          id: n,
          children: /* @__PURE__ */ p(Aa.Indicator, { className: le(ir.indicator, l) })
        }
      ),
      /* @__PURE__ */ p("label", { htmlFor: n, className: le(ir.label, l), children: r ?? e })
    ] }),
    [t, n, r, l, e]
  );
  return /* @__PURE__ */ p("div", { className: ir.radioOptionContainer, style: a, children: o ? /* @__PURE__ */ j("label", { className: ir.optionLabel, children: [
    /* @__PURE__ */ p("div", { className: ir.itemContainer, children: s }),
    o({
      $checked: e === i.value
    })
  ] }) : s }, n);
}, mf = `'{"Input:borderRadius-Textarea-default": "var(--xmlui-borderRadius-Textarea-default)", "Input:borderColor-Textarea-default": "var(--xmlui-borderColor-Textarea-default)", "Input:borderWidth-Textarea-default": "var(--xmlui-borderWidth-Textarea-default)", "Input:borderStyle-Textarea-default": "var(--xmlui-borderStyle-Textarea-default)", "Input:fontSize-Textarea-default": "var(--xmlui-fontSize-Textarea-default)", "Input:padding-Textarea-default": "var(--xmlui-padding-Textarea-default)", "Input:backgroundColor-Textarea-default": "var(--xmlui-backgroundColor-Textarea-default)", "Input:boxShadow-Textarea-default": "var(--xmlui-boxShadow-Textarea-default)", "Input:color-Textarea-default": "var(--xmlui-color-Textarea-default)", "Input:borderColor-Textarea-default--hover": "var(--xmlui-borderColor-Textarea-default--hover)", "Input:backgroundColor-Textarea-default--hover": "var(--xmlui-backgroundColor-Textarea-default--hover)", "Input:boxShadow-Textarea-default--hover": "var(--xmlui-boxShadow-Textarea-default--hover)", "Input:color-Textarea-default--hover": "var(--xmlui-color-Textarea-default--hover)", "Input:borderColor-Textarea-default--focus": "var(--xmlui-borderColor-Textarea-default--focus)", "Input:backgroundColor-Textarea-default--focus": "var(--xmlui-backgroundColor-Textarea-default--focus)", "Input:boxShadow-Textarea-default--focus": "var(--xmlui-boxShadow-Textarea-default--focus)", "Input:color-Textarea-default--focus": "var(--xmlui-color-Textarea-default--focus)", "Input:outlineWidth-Textarea-default--focus": "var(--xmlui-outlineWidth-Textarea-default--focus)", "Input:outlineColor-Textarea-default--focus": "var(--xmlui-outlineColor-Textarea-default--focus)", "Input:outlineStyle-Textarea-default--focus": "var(--xmlui-outlineStyle-Textarea-default--focus)", "Input:outlineOffset-Textarea-default--focus": "var(--xmlui-outlineOffset-Textarea-default--focus)", "Input:color-placeholder-Textarea-default": "var(--xmlui-color-placeholder-Textarea-default)", "Input:borderRadius-Textarea-error": "var(--xmlui-borderRadius-Textarea-error)", "Input:borderColor-Textarea-error": "var(--xmlui-borderColor-Textarea-error)", "Input:borderWidth-Textarea-error": "var(--xmlui-borderWidth-Textarea-error)", "Input:borderStyle-Textarea-error": "var(--xmlui-borderStyle-Textarea-error)", "Input:fontSize-Textarea-error": "var(--xmlui-fontSize-Textarea-error)", "Input:padding-Textarea-error": "var(--xmlui-padding-Textarea-error)", "Input:backgroundColor-Textarea-error": "var(--xmlui-backgroundColor-Textarea-error)", "Input:boxShadow-Textarea-error": "var(--xmlui-boxShadow-Textarea-error)", "Input:color-Textarea-error": "var(--xmlui-color-Textarea-error)", "Input:borderColor-Textarea-error--hover": "var(--xmlui-borderColor-Textarea-error--hover)", "Input:backgroundColor-Textarea-error--hover": "var(--xmlui-backgroundColor-Textarea-error--hover)", "Input:boxShadow-Textarea-error--hover": "var(--xmlui-boxShadow-Textarea-error--hover)", "Input:color-Textarea-error--hover": "var(--xmlui-color-Textarea-error--hover)", "Input:borderColor-Textarea-error--focus": "var(--xmlui-borderColor-Textarea-error--focus)", "Input:backgroundColor-Textarea-error--focus": "var(--xmlui-backgroundColor-Textarea-error--focus)", "Input:boxShadow-Textarea-error--focus": "var(--xmlui-boxShadow-Textarea-error--focus)", "Input:color-Textarea-error--focus": "var(--xmlui-color-Textarea-error--focus)", "Input:outlineWidth-Textarea-error--focus": "var(--xmlui-outlineWidth-Textarea-error--focus)", "Input:outlineColor-Textarea-error--focus": "var(--xmlui-outlineColor-Textarea-error--focus)", "Input:outlineStyle-Textarea-error--focus": "var(--xmlui-outlineStyle-Textarea-error--focus)", "Input:outlineOffset-Textarea-error--focus": "var(--xmlui-outlineOffset-Textarea-error--focus)", "Input:color-placeholder-Textarea-error": "var(--xmlui-color-placeholder-Textarea-error)", "Input:borderRadius-Textarea-warning": "var(--xmlui-borderRadius-Textarea-warning)", "Input:borderColor-Textarea-warning": "var(--xmlui-borderColor-Textarea-warning)", "Input:borderWidth-Textarea-warning": "var(--xmlui-borderWidth-Textarea-warning)", "Input:borderStyle-Textarea-warning": "var(--xmlui-borderStyle-Textarea-warning)", "Input:fontSize-Textarea-warning": "var(--xmlui-fontSize-Textarea-warning)", "Input:padding-Textarea-warning": "var(--xmlui-padding-Textarea-warning)", "Input:backgroundColor-Textarea-warning": "var(--xmlui-backgroundColor-Textarea-warning)", "Input:boxShadow-Textarea-warning": "var(--xmlui-boxShadow-Textarea-warning)", "Input:color-Textarea-warning": "var(--xmlui-color-Textarea-warning)", "Input:borderColor-Textarea-warning--hover": "var(--xmlui-borderColor-Textarea-warning--hover)", "Input:backgroundColor-Textarea-warning--hover": "var(--xmlui-backgroundColor-Textarea-warning--hover)", "Input:boxShadow-Textarea-warning--hover": "var(--xmlui-boxShadow-Textarea-warning--hover)", "Input:color-Textarea-warning--hover": "var(--xmlui-color-Textarea-warning--hover)", "Input:borderColor-Textarea-warning--focus": "var(--xmlui-borderColor-Textarea-warning--focus)", "Input:backgroundColor-Textarea-warning--focus": "var(--xmlui-backgroundColor-Textarea-warning--focus)", "Input:boxShadow-Textarea-warning--focus": "var(--xmlui-boxShadow-Textarea-warning--focus)", "Input:color-Textarea-warning--focus": "var(--xmlui-color-Textarea-warning--focus)", "Input:outlineWidth-Textarea-warning--focus": "var(--xmlui-outlineWidth-Textarea-warning--focus)", "Input:outlineColor-Textarea-warning--focus": "var(--xmlui-outlineColor-Textarea-warning--focus)", "Input:outlineStyle-Textarea-warning--focus": "var(--xmlui-outlineStyle-Textarea-warning--focus)", "Input:outlineOffset-Textarea-warning--focus": "var(--xmlui-outlineOffset-Textarea-warning--focus)", "Input:color-placeholder-Textarea-warning": "var(--xmlui-color-placeholder-Textarea-warning)", "Input:borderRadius-Textarea-success": "var(--xmlui-borderRadius-Textarea-success)", "Input:borderColor-Textarea-success": "var(--xmlui-borderColor-Textarea-success)", "Input:borderWidth-Textarea-success": "var(--xmlui-borderWidth-Textarea-success)", "Input:borderStyle-Textarea-success": "var(--xmlui-borderStyle-Textarea-success)", "Input:fontSize-Textarea-success": "var(--xmlui-fontSize-Textarea-success)", "Input:padding-Textarea-success": "var(--xmlui-padding-Textarea-success)", "Input:backgroundColor-Textarea-success": "var(--xmlui-backgroundColor-Textarea-success)", "Input:boxShadow-Textarea-success": "var(--xmlui-boxShadow-Textarea-success)", "Input:color-Textarea-success": "var(--xmlui-color-Textarea-success)", "Input:borderColor-Textarea-success--hover": "var(--xmlui-borderColor-Textarea-success--hover)", "Input:backgroundColor-Textarea-success--hover": "var(--xmlui-backgroundColor-Textarea-success--hover)", "Input:boxShadow-Textarea-success--hover": "var(--xmlui-boxShadow-Textarea-success--hover)", "Input:color-Textarea-success--hover": "var(--xmlui-color-Textarea-success--hover)", "Input:borderColor-Textarea-success--focus": "var(--xmlui-borderColor-Textarea-success--focus)", "Input:backgroundColor-Textarea-success--focus": "var(--xmlui-backgroundColor-Textarea-success--focus)", "Input:boxShadow-Textarea-success--focus": "var(--xmlui-boxShadow-Textarea-success--focus)", "Input:color-Textarea-success--focus": "var(--xmlui-color-Textarea-success--focus)", "Input:outlineWidth-Textarea-success--focus": "var(--xmlui-outlineWidth-Textarea-success--focus)", "Input:outlineColor-Textarea-success--focus": "var(--xmlui-outlineColor-Textarea-success--focus)", "Input:outlineStyle-Textarea-success--focus": "var(--xmlui-outlineStyle-Textarea-success--focus)", "Input:outlineOffset-Textarea-success--focus": "var(--xmlui-outlineOffset-Textarea-success--focus)", "Input:color-placeholder-Textarea-success": "var(--xmlui-color-placeholder-Textarea-success)", "Input:backgroundColor-Textarea--disabled": "var(--xmlui-backgroundColor-Textarea--disabled)", "Input:color-Textarea--disabled": "var(--xmlui-color-Textarea--disabled)", "Input:borderColor-Textarea--disabled": "var(--xmlui-borderColor-Textarea--disabled)"}'`, pf = "_textarea_1kixh_13", hf = "_error_1kixh_53", xf = "_warning_1kixh_85", bf = "_valid_1kixh_117", ff = "_resizeHorizontal_1kixh_156", vf = "_resizeVertical_1kixh_160", gf = "_resizeBoth_1kixh_164", Xr = {
  themeVars: mf,
  textarea: pf,
  error: hf,
  warning: xf,
  valid: bf,
  resizeHorizontal: ff,
  resizeVertical: vf,
  resizeBoth: gf
}, rn = (e, r) => {
  if (typeof e == "function") {
    e(r);
    return;
  }
  e.current = r;
}, Tf = (e, r) => {
  const t = Ve.useRef();
  return Ve.useCallback(
    (o) => {
      e.current = o, t.current && rn(t.current, null), t.current = r, r && rn(r, o);
    },
    [r]
  );
}, yf = () => {
}, Cf = ({ maxRows: e, minRows: r, onChange: t = yf, style: o, ...a }, n) => {
  const i = he(null), l = Tf(i, n), [s, f] = Ve.useState(), [h, c] = Ve.useState();
  return K(() => {
    if (!i.current) return;
    const T = getComputedStyle(i.current), b = parseFloat(T.lineHeight), v = parseFloat(T.paddingTop) + parseFloat(T.paddingBottom), y = parseFloat(T.borderTop) + parseFloat(T.borderBottom), w = (T.boxSizing === "border-box" ? y : 0) + v;
    f(b * (r ?? 1) + w), c(b * (e ?? 1e4) + w);
  }, [i.current, e, r]), /* @__PURE__ */ p(
    "textarea",
    {
      ref: l,
      ...a,
      onChange: t,
      style: { ...o, minHeight: s, maxHeight: h }
    }
  );
}, kf = Ve.forwardRef(Cf), Sf = {
  horizontal: Xr.resizeHorizontal,
  vertical: Xr.resizeVertical,
  both: Xr.resizeBoth
}, wf = xe(function({
  id: r,
  value: t = "",
  placeholder: o = "",
  required: a = !1,
  readOnly: n = !1,
  allowCopy: i = !0,
  updateState: l = de,
  validationStatus: s,
  autoFocus: f = !1,
  initialValue: h = "",
  resize: c,
  onDidChange: T = de,
  onFocus: b = de,
  onBlur: v = de,
  controlled: y = !0,
  enterSubmits: w = !0,
  escResets: _,
  style: H,
  registerComponentApi: $,
  autoSize: O,
  maxRows: F,
  minRows: Y,
  maxLength: V,
  rows: R = 2,
  enabled: W = !0,
  label: z,
  labelPosition: x,
  labelWidth: m,
  labelBreak: g
}, k) {
  const A = he(null), [q, E] = me(null), [N, B] = Ae.useState(!1), D = X(
    (ae) => {
      l({ value: ae }), T(ae);
    },
    [T, l]
  ), P = X(
    (ae) => {
      D(ae.target.value);
    },
    [D]
  );
  K(() => {
    l({ value: h }, { initial: !0 });
  }, [h, l]);
  const I = (ae) => i ? !0 : (ae.preventDefault(), !1), M = () => {
    B(!0), b == null || b();
  }, G = () => {
    B(!1), v == null || v();
  }, J = X(() => {
    setTimeout(() => {
      var ae;
      (ae = A.current) == null || ae.focus();
    }, 0);
  }, []), ee = X(
    (ae) => {
      const te = A == null ? void 0 : A.current;
      if (te && ae) {
        const Q = te.selectionStart, ne = te.value;
        P({
          // @ts-ignore
          target: {
            value: ne.substring(0, Q) + ae + ne.substring(Q)
          }
        }), E(Q + ae.length);
      }
    },
    [A, P]
  ), Ce = $e((ae) => {
    D(ae);
  });
  K(() => {
    if (q) {
      const ae = A == null ? void 0 : A.current;
      ae && (ae.setSelectionRange(q, q), E(null));
    }
  }, [t, q, A]), K(() => {
    $ == null || $({
      focus: J,
      insert: ee,
      setValue: Ce
    });
  }, [J, ee, $, Ce]);
  const qe = X(
    (ae) => {
      var te, Q;
      ae.currentTarget.form && w && ae.key.toLowerCase() === "enter" && !ae.shiftKey && (ae.preventDefault(), (te = ae.currentTarget.form) == null || te.requestSubmit()), ae.currentTarget.form && _ && ae.key.toLowerCase() === "escape" && !ae.shiftKey && (ae.preventDefault(), (Q = ae.currentTarget.form) == null || Q.reset());
    },
    [w, _]
  ), Ee = {
    className: le(Xr.textarea, c ? Sf[c] : "", {
      [Xr.focused]: N,
      [Xr.disabled]: !W,
      [Xr.error]: s === "error",
      [Xr.warning]: s === "warning",
      [Xr.valid]: s === "valid"
    }),
    ref: A,
    style: H,
    value: y ? t || "" : void 0,
    disabled: !W,
    autoFocus: f,
    name: r,
    placeholder: o,
    required: a,
    maxLength: V,
    "aria-multiline": !0,
    "aria-readonly": n,
    readOnly: n,
    onChange: P,
    onCopy: I,
    onFocus: M,
    onBlur: G,
    onKeyDown: qe,
    autoComplete: "off"
  };
  return c === "both" || c === "horizontal" || c === "vertical" ? /* @__PURE__ */ p(
    Ir,
    {
      ref: k,
      labelPosition: x,
      label: z,
      labelWidth: m,
      labelBreak: g,
      required: a,
      enabled: W,
      onFocus: b,
      onBlur: v,
      style: H,
      children: /* @__PURE__ */ p(
        kf,
        {
          ...Ee,
          style: H,
          maxRows: F,
          minRows: Y,
          rows: R
        }
      )
    }
  ) : O || !vi(F) || !vi(Y) ? /* @__PURE__ */ p(
    Ir,
    {
      ref: k,
      labelPosition: x,
      label: z,
      labelWidth: m,
      labelBreak: g,
      required: a,
      enabled: W,
      onFocus: b,
      onBlur: v,
      style: H,
      children: /* @__PURE__ */ p(
        wd,
        {
          ...Ee,
          style: H,
          maxRows: F,
          minRows: Y,
          rows: R
        }
      )
    }
  ) : /* @__PURE__ */ p(
    Ir,
    {
      ref: k,
      labelPosition: x,
      label: z,
      labelWidth: m,
      labelBreak: g,
      required: a,
      enabled: W,
      onFocus: b,
      onBlur: v,
      style: H,
      children: /* @__PURE__ */ p("textarea", { ...Ee, rows: R })
    }
  );
}), Hf = `'{"border-AutoComplete": "var(--xmlui-border-AutoComplete)", "borderHorizontal-AutoComplete": "var(--xmlui-borderHorizontal-AutoComplete, var(--xmlui-border-AutoComplete))", "borderVertical-AutoComplete": "var(--xmlui-borderVertical-AutoComplete, var(--xmlui-border-AutoComplete))", "borderLeft-AutoComplete": "var(--xmlui-borderLeft-AutoComplete, var(--xmlui-borderHorizontal-AutoComplete, var(--xmlui-border-AutoComplete)))", "borderRight-AutoComplete": "var(--xmlui-borderRight-AutoComplete, var(--xmlui-borderHorizontal-AutoComplete, var(--xmlui-border-AutoComplete)))", "borderTop-AutoComplete": "var(--xmlui-borderTop-AutoComplete, var(--xmlui-borderVertical-AutoComplete, var(--xmlui-border-AutoComplete)))", "borderBottom-AutoComplete": "var(--xmlui-borderBottom-AutoComplete, var(--xmlui-borderVertical-AutoComplete, var(--xmlui-border-AutoComplete)))", "borderWidth-AutoComplete": "var(--xmlui-borderWidth-AutoComplete)", "borderHorizontalWidth-AutoComplete": "var(--xmlui-borderHorizontalWidth-AutoComplete, var(--xmlui-borderWidth-AutoComplete))", "borderLeftWidth-AutoComplete": "var(--xmlui-borderLeftWidth-AutoComplete, var(--xmlui-borderHorizontalWidth-AutoComplete, var(--xmlui-borderWidth-AutoComplete)))", "borderRightWidth-AutoComplete": "var(--xmlui-borderRightWidth-AutoComplete, var(--xmlui-borderHorizontalWidth-AutoComplete, var(--xmlui-borderWidth-AutoComplete)))", "borderVerticalWidth-AutoComplete": "var(--xmlui-borderVerticalWidth-AutoComplete, var(--xmlui-borderWidth-AutoComplete))", "borderTopWidth-AutoComplete": "var(--xmlui-borderTopWidth-AutoComplete, var(--xmlui-borderVerticalWidth-AutoComplete, var(--xmlui-borderWidth-AutoComplete)))", "borderBottomWidth-AutoComplete": "var(--xmlui-borderBottomWidth-AutoComplete, var(--xmlui-borderVerticalWidth-AutoComplete, var(--xmlui-borderWidth-AutoComplete)))", "borderStyle-AutoComplete": "var(--xmlui-borderStyle-AutoComplete)", "borderHorizontalStyle-AutoComplete": "var(--xmlui-borderHorizontalStyle-AutoComplete, var(--xmlui-borderStyle-AutoComplete))", "borderLeftStyle-AutoComplete": "var(--xmlui-borderLeftStyle-AutoComplete, var(--xmlui-borderHorizontalStyle-AutoComplete, var(--xmlui-borderStyle-AutoComplete)))", "borderRightStyle-AutoComplete": "var(--xmlui-borderRightStyle-AutoComplete, var(--xmlui-borderHorizontalStyle-AutoComplete, var(--xmlui-borderStyle-AutoComplete)))", "borderVerticalStyle-AutoComplete": "var(--xmlui-borderVerticalStyle-AutoComplete, var(--xmlui-borderStyle-AutoComplete))", "borderTopStyle-AutoComplete": "var(--xmlui-borderTopStyle-AutoComplete, var(--xmlui-borderVerticalStyle-AutoComplete, var(--xmlui-borderStyle-AutoComplete)))", "borderBottomStyle-AutoComplete": "var(--xmlui-borderBottomStyle-AutoComplete, var(--xmlui-borderVerticalStyle-AutoComplete, var(--xmlui-borderStyle-AutoComplete)))", "borderColor-AutoComplete": "var(--xmlui-borderColor-AutoComplete)", "borderHorizontalColor-AutoComplete": "var(--xmlui-borderHorizontalColor-AutoComplete, var(--xmlui-borderColor-AutoComplete))", "borderLeftColor-AutoComplete": "var(--xmlui-borderLeftColor-AutoComplete, var(--xmlui-borderHorizontalColor-AutoComplete, var(--xmlui-borderColor-AutoComplete)))", "borderRightColor-AutoComplete": "var(--xmlui-borderRightColor-AutoComplete, var(--xmlui-borderHorizontalColor-AutoComplete, var(--xmlui-borderColor-AutoComplete)))", "borderVerticalColor-AutoComplete": "var(--xmlui-borderVerticalColor-AutoComplete, var(--xmlui-borderColor-AutoComplete))", "borderTopColor-AutoComplete": "var(--xmlui-borderTopColor-AutoComplete, var(--xmlui-borderVerticalColor-AutoComplete, var(--xmlui-borderColor-AutoComplete)))", "borderBottomColor-AutoComplete": "var(--xmlui-borderBottomColor-AutoComplete, var(--xmlui-borderVerticalColor-AutoComplete, var(--xmlui-borderColor-AutoComplete)))", "radius-start-start-AutoComplete": "var(--xmlui-radius-start-start-AutoComplete, var(--xmlui-borderRadius-AutoComplete))", "radius-start-end-AutoComplete": "var(--xmlui-radius-start-end-AutoComplete, var(--xmlui-borderRadius-AutoComplete))", "radius-end-start-AutoComplete": "var(--xmlui-radius-end-start-AutoComplete, var(--xmlui-borderRadius-AutoComplete))", "radius-end-end-AutoComplete": "var(--xmlui-radius-end-end-AutoComplete, var(--xmlui-borderRadius-AutoComplete))", "padding-AutoComplete-badge": "var(--xmlui-padding-AutoComplete-badge)", "paddingHorizontal-AutoComplete-badge": "var(--xmlui-paddingHorizontal-AutoComplete-badge, var(--xmlui-padding-AutoComplete-badge))", "paddingVertical-AutoComplete-badge": "var(--xmlui-paddingVertical-AutoComplete-badge, var(--xmlui-padding-AutoComplete-badge))", "paddingLeft-AutoComplete-badge": "var(--xmlui-paddingLeft-AutoComplete-badge, var(--xmlui-paddingHorizontal-AutoComplete-badge, var(--xmlui-padding-AutoComplete-badge)))", "paddingRight-AutoComplete-badge": "var(--xmlui-paddingRight-AutoComplete-badge, var(--xmlui-paddingHorizontal-AutoComplete-badge, var(--xmlui-padding-AutoComplete-badge)))", "paddingTop-AutoComplete-badge": "var(--xmlui-paddingTop-AutoComplete-badge, var(--xmlui-paddingVertical-AutoComplete-badge, var(--xmlui-padding-AutoComplete-badge)))", "paddingBottom-AutoComplete-badge": "var(--xmlui-paddingBottom-AutoComplete-badge, var(--xmlui-paddingVertical-AutoComplete-badge, var(--xmlui-padding-AutoComplete-badge)))", "border-AutoComplete-badge": "var(--xmlui-border-AutoComplete-badge)", "borderHorizontal-AutoComplete-badge": "var(--xmlui-borderHorizontal-AutoComplete-badge, var(--xmlui-border-AutoComplete-badge))", "borderVertical-AutoComplete-badge": "var(--xmlui-borderVertical-AutoComplete-badge, var(--xmlui-border-AutoComplete-badge))", "borderLeft-AutoComplete-badge": "var(--xmlui-borderLeft-AutoComplete-badge, var(--xmlui-borderHorizontal-AutoComplete-badge, var(--xmlui-border-AutoComplete-badge)))", "borderRight-AutoComplete-badge": "var(--xmlui-borderRight-AutoComplete-badge, var(--xmlui-borderHorizontal-AutoComplete-badge, var(--xmlui-border-AutoComplete-badge)))", "borderTop-AutoComplete-badge": "var(--xmlui-borderTop-AutoComplete-badge, var(--xmlui-borderVertical-AutoComplete-badge, var(--xmlui-border-AutoComplete-badge)))", "borderBottom-AutoComplete-badge": "var(--xmlui-borderBottom-AutoComplete-badge, var(--xmlui-borderVertical-AutoComplete-badge, var(--xmlui-border-AutoComplete-badge)))", "borderWidth-AutoComplete-badge": "var(--xmlui-borderWidth-AutoComplete-badge)", "borderHorizontalWidth-AutoComplete-badge": "var(--xmlui-borderHorizontalWidth-AutoComplete-badge, var(--xmlui-borderWidth-AutoComplete-badge))", "borderLeftWidth-AutoComplete-badge": "var(--xmlui-borderLeftWidth-AutoComplete-badge, var(--xmlui-borderHorizontalWidth-AutoComplete-badge, var(--xmlui-borderWidth-AutoComplete-badge)))", "borderRightWidth-AutoComplete-badge": "var(--xmlui-borderRightWidth-AutoComplete-badge, var(--xmlui-borderHorizontalWidth-AutoComplete-badge, var(--xmlui-borderWidth-AutoComplete-badge)))", "borderVerticalWidth-AutoComplete-badge": "var(--xmlui-borderVerticalWidth-AutoComplete-badge, var(--xmlui-borderWidth-AutoComplete-badge))", "borderTopWidth-AutoComplete-badge": "var(--xmlui-borderTopWidth-AutoComplete-badge, var(--xmlui-borderVerticalWidth-AutoComplete-badge, var(--xmlui-borderWidth-AutoComplete-badge)))", "borderBottomWidth-AutoComplete-badge": "var(--xmlui-borderBottomWidth-AutoComplete-badge, var(--xmlui-borderVerticalWidth-AutoComplete-badge, var(--xmlui-borderWidth-AutoComplete-badge)))", "borderStyle-AutoComplete-badge": "var(--xmlui-borderStyle-AutoComplete-badge)", "borderHorizontalStyle-AutoComplete-badge": "var(--xmlui-borderHorizontalStyle-AutoComplete-badge, var(--xmlui-borderStyle-AutoComplete-badge))", "borderLeftStyle-AutoComplete-badge": "var(--xmlui-borderLeftStyle-AutoComplete-badge, var(--xmlui-borderHorizontalStyle-AutoComplete-badge, var(--xmlui-borderStyle-AutoComplete-badge)))", "borderRightStyle-AutoComplete-badge": "var(--xmlui-borderRightStyle-AutoComplete-badge, var(--xmlui-borderHorizontalStyle-AutoComplete-badge, var(--xmlui-borderStyle-AutoComplete-badge)))", "borderVerticalStyle-AutoComplete-badge": "var(--xmlui-borderVerticalStyle-AutoComplete-badge, var(--xmlui-borderStyle-AutoComplete-badge))", "borderTopStyle-AutoComplete-badge": "var(--xmlui-borderTopStyle-AutoComplete-badge, var(--xmlui-borderVerticalStyle-AutoComplete-badge, var(--xmlui-borderStyle-AutoComplete-badge)))", "borderBottomStyle-AutoComplete-badge": "var(--xmlui-borderBottomStyle-AutoComplete-badge, var(--xmlui-borderVerticalStyle-AutoComplete-badge, var(--xmlui-borderStyle-AutoComplete-badge)))", "borderColor-AutoComplete-badge": "var(--xmlui-borderColor-AutoComplete-badge)", "borderHorizontalColor-AutoComplete-badge": "var(--xmlui-borderHorizontalColor-AutoComplete-badge, var(--xmlui-borderColor-AutoComplete-badge))", "borderLeftColor-AutoComplete-badge": "var(--xmlui-borderLeftColor-AutoComplete-badge, var(--xmlui-borderHorizontalColor-AutoComplete-badge, var(--xmlui-borderColor-AutoComplete-badge)))", "borderRightColor-AutoComplete-badge": "var(--xmlui-borderRightColor-AutoComplete-badge, var(--xmlui-borderHorizontalColor-AutoComplete-badge, var(--xmlui-borderColor-AutoComplete-badge)))", "borderVerticalColor-AutoComplete-badge": "var(--xmlui-borderVerticalColor-AutoComplete-badge, var(--xmlui-borderColor-AutoComplete-badge))", "borderTopColor-AutoComplete-badge": "var(--xmlui-borderTopColor-AutoComplete-badge, var(--xmlui-borderVerticalColor-AutoComplete-badge, var(--xmlui-borderColor-AutoComplete-badge)))", "borderBottomColor-AutoComplete-badge": "var(--xmlui-borderBottomColor-AutoComplete-badge, var(--xmlui-borderVerticalColor-AutoComplete-badge, var(--xmlui-borderColor-AutoComplete-badge)))", "radius-start-start-AutoComplete-badge": "var(--xmlui-radius-start-start-AutoComplete-badge, var(--xmlui-borderRadius-AutoComplete-badge))", "radius-start-end-AutoComplete-badge": "var(--xmlui-radius-start-end-AutoComplete-badge, var(--xmlui-borderRadius-AutoComplete-badge))", "radius-end-start-AutoComplete-badge": "var(--xmlui-radius-end-start-AutoComplete-badge, var(--xmlui-borderRadius-AutoComplete-badge))", "radius-end-end-AutoComplete-badge": "var(--xmlui-radius-end-end-AutoComplete-badge, var(--xmlui-borderRadius-AutoComplete-badge))", "Input:borderRadius-AutoComplete-default": "var(--xmlui-borderRadius-AutoComplete-default)", "Input:borderColor-AutoComplete-default": "var(--xmlui-borderColor-AutoComplete-default)", "Input:borderWidth-AutoComplete-default": "var(--xmlui-borderWidth-AutoComplete-default)", "Input:borderStyle-AutoComplete-default": "var(--xmlui-borderStyle-AutoComplete-default)", "Input:fontSize-AutoComplete-default": "var(--xmlui-fontSize-AutoComplete-default)", "Input:backgroundColor-AutoComplete-default": "var(--xmlui-backgroundColor-AutoComplete-default)", "Input:boxShadow-AutoComplete-default": "var(--xmlui-boxShadow-AutoComplete-default)", "Input:color-AutoComplete-default": "var(--xmlui-color-AutoComplete-default)", "Input:borderColor-AutoComplete-default--hover": "var(--xmlui-borderColor-AutoComplete-default--hover)", "Input:backgroundColor-AutoComplete-default--hover": "var(--xmlui-backgroundColor-AutoComplete-default--hover)", "Input:boxShadow-AutoComplete-default--hover": "var(--xmlui-boxShadow-AutoComplete-default--hover)", "Input:color-AutoComplete-default--hover": "var(--xmlui-color-AutoComplete-default--hover)", "Input:color-placeholder-AutoComplete-default": "var(--xmlui-color-placeholder-AutoComplete-default)", "Input:borderRadius-AutoComplete-error": "var(--xmlui-borderRadius-AutoComplete-error)", "Input:borderColor-AutoComplete-error": "var(--xmlui-borderColor-AutoComplete-error)", "Input:borderWidth-AutoComplete-error": "var(--xmlui-borderWidth-AutoComplete-error)", "Input:borderStyle-AutoComplete-error": "var(--xmlui-borderStyle-AutoComplete-error)", "Input:fontSize-AutoComplete-error": "var(--xmlui-fontSize-AutoComplete-error)", "Input:backgroundColor-AutoComplete-error": "var(--xmlui-backgroundColor-AutoComplete-error)", "Input:boxShadow-AutoComplete-error": "var(--xmlui-boxShadow-AutoComplete-error)", "Input:color-AutoComplete-error": "var(--xmlui-color-AutoComplete-error)", "Input:borderColor-AutoComplete-error--hover": "var(--xmlui-borderColor-AutoComplete-error--hover)", "Input:backgroundColor-AutoComplete-error--hover": "var(--xmlui-backgroundColor-AutoComplete-error--hover)", "Input:boxShadow-AutoComplete-error--hover": "var(--xmlui-boxShadow-AutoComplete-error--hover)", "Input:color-AutoComplete-error--hover": "var(--xmlui-color-AutoComplete-error--hover)", "Input:color-placeholder-AutoComplete-error": "var(--xmlui-color-placeholder-AutoComplete-error)", "Input:borderRadius-AutoComplete-warning": "var(--xmlui-borderRadius-AutoComplete-warning)", "Input:borderColor-AutoComplete-warning": "var(--xmlui-borderColor-AutoComplete-warning)", "Input:borderWidth-AutoComplete-warning": "var(--xmlui-borderWidth-AutoComplete-warning)", "Input:borderStyle-AutoComplete-warning": "var(--xmlui-borderStyle-AutoComplete-warning)", "Input:fontSize-AutoComplete-warning": "var(--xmlui-fontSize-AutoComplete-warning)", "Input:backgroundColor-AutoComplete-warning": "var(--xmlui-backgroundColor-AutoComplete-warning)", "Input:boxShadow-AutoComplete-warning": "var(--xmlui-boxShadow-AutoComplete-warning)", "Input:color-AutoComplete-warning": "var(--xmlui-color-AutoComplete-warning)", "Input:borderColor-AutoComplete-warning--hover": "var(--xmlui-borderColor-AutoComplete-warning--hover)", "Input:backgroundColor-AutoComplete-warning--hover": "var(--xmlui-backgroundColor-AutoComplete-warning--hover)", "Input:boxShadow-AutoComplete-warning--hover": "var(--xmlui-boxShadow-AutoComplete-warning--hover)", "Input:color-AutoComplete-warning--hover": "var(--xmlui-color-AutoComplete-warning--hover)", "Input:color-placeholder-AutoComplete-warning": "var(--xmlui-color-placeholder-AutoComplete-warning)", "Input:borderRadius-AutoComplete-success": "var(--xmlui-borderRadius-AutoComplete-success)", "Input:borderColor-AutoComplete-success": "var(--xmlui-borderColor-AutoComplete-success)", "Input:borderWidth-AutoComplete-success": "var(--xmlui-borderWidth-AutoComplete-success)", "Input:borderStyle-AutoComplete-success": "var(--xmlui-borderStyle-AutoComplete-success)", "Input:fontSize-AutoComplete-success": "var(--xmlui-fontSize-AutoComplete-success)", "Input:backgroundColor-AutoComplete-success": "var(--xmlui-backgroundColor-AutoComplete-success)", "Input:boxShadow-AutoComplete-success": "var(--xmlui-boxShadow-AutoComplete-success)", "Input:color-AutoComplete-success": "var(--xmlui-color-AutoComplete-success)", "Input:borderColor-AutoComplete-success--hover": "var(--xmlui-borderColor-AutoComplete-success--hover)", "Input:backgroundColor-AutoComplete-success--hover": "var(--xmlui-backgroundColor-AutoComplete-success--hover)", "Input:boxShadow-AutoComplete-success--hover": "var(--xmlui-boxShadow-AutoComplete-success--hover)", "Input:color-AutoComplete-success--hover": "var(--xmlui-color-AutoComplete-success--hover)", "Input:color-placeholder-AutoComplete-success": "var(--xmlui-color-placeholder-AutoComplete-success)", "Input:backgroundColor-AutoComplete--disabled": "var(--xmlui-backgroundColor-AutoComplete--disabled)", "Input:color-AutoComplete--disabled": "var(--xmlui-color-AutoComplete--disabled)", "Input:borderColor-AutoComplete--disabled": "var(--xmlui-borderColor-AutoComplete--disabled)", "Input:outlineWidth-AutoComplete--focus": "var(--xmlui-outlineWidth-AutoComplete--focus)", "Input:outlineColor-AutoComplete--focus": "var(--xmlui-outlineColor-AutoComplete--focus)", "Input:outlineStyle-AutoComplete--focus": "var(--xmlui-outlineStyle-AutoComplete--focus)", "Input:outlineOffset-AutoComplete--focus": "var(--xmlui-outlineOffset-AutoComplete--focus)", "Input:fontSize-AutoComplete-badge": "var(--xmlui-fontSize-AutoComplete-badge)", "Input:backgroundColor-AutoComplete-badge": "var(--xmlui-backgroundColor-AutoComplete-badge)", "Input:color-AutoComplete-badge": "var(--xmlui-color-AutoComplete-badge)", "Input:backgroundColor-AutoComplete-badge--hover": "var(--xmlui-backgroundColor-AutoComplete-badge--hover)", "Input:color-AutoComplete-badge--hover": "var(--xmlui-color-AutoComplete-badge--hover)", "Input:backgroundColor-AutoComplete-badge--active": "var(--xmlui-backgroundColor-AutoComplete-badge--active)", "Input:color-AutoComplete-badge--active": "var(--xmlui-color-AutoComplete-badge--active)", "Input:color-placeholder-AutoComplete": "var(--xmlui-color-placeholder-AutoComplete)", "Input:backgroundColor-menu-AutoComplete": "var(--xmlui-backgroundColor-menu-AutoComplete)", "Input:borderRadius-menu-AutoComplete": "var(--xmlui-borderRadius-menu-AutoComplete)", "Input:boxShadow-menu-AutoComplete": "var(--xmlui-boxShadow-menu-AutoComplete)", "backgroundColor-item-AutoComplete": "var(--xmlui-backgroundColor-item-AutoComplete)", "backgroundColor-item-AutoComplete--hover": "var(--xmlui-backgroundColor-item-AutoComplete--hover)", "color-item-AutoComplete--disabled": "var(--xmlui-color-item-AutoComplete--disabled)"}'`, Bf = "_command_8zghs_13", If = "_badgeListWrapper_8zghs_20", $f = "_error_8zghs_43", Lf = "_warning_8zghs_62", _f = "_valid_8zghs_81", Af = "_disabled_8zghs_100", Nf = "_focused_8zghs_107", Wf = "_badgeList_8zghs_20", Of = "_badge_8zghs_20", Rf = "_commandInput_8zghs_172", zf = "_actions_8zghs_185", Vf = "_autoCompleteEmpty_8zghs_191", Ef = "_commandList_8zghs_201", Df = "_autoCompleteOption_8zghs_214", Je = {
  themeVars: Hf,
  command: Bf,
  badgeListWrapper: If,
  error: $f,
  warning: Lf,
  valid: _f,
  disabled: Af,
  focused: Nf,
  badgeList: Wf,
  badge: Of,
  commandInput: Rf,
  actions: zf,
  autoCompleteEmpty: Vf,
  commandList: Ef,
  "fade-in": "_fade-in_8zghs_1",
  autoCompleteOption: Df
}, Wl = Zr({
  value: null,
  onChange: (e) => {
  },
  optionRenderer: (e) => /* @__PURE__ */ p("div", { children: e.label }),
  inputValue: "",
  options: /* @__PURE__ */ new Set()
});
function Ol() {
  return $r(Wl);
}
function Pf(e) {
  return /* @__PURE__ */ p("div", { children: e.label });
}
function Mf(e, r) {
  return r.some(
    (t) => Array.from(e).some((o) => o.value === t.value || o.label === t.label)
  );
}
const Ff = xe(function({
  id: r,
  initialValue: t,
  value: o,
  enabled: a = !0,
  placeholder: n,
  updateState: i = de,
  validationStatus: l = "none",
  onDidChange: s = de,
  onFocus: f = de,
  onBlur: h = de,
  registerComponentApi: c,
  optionRenderer: T = Pf,
  emptyListTemplate: b,
  style: v,
  children: y,
  autoFocus: w = !1,
  dropdownHeight: _,
  multi: H = !1
}, $) {
  const O = he(null), [F, Y] = me(!1), V = he(null), [R, W] = me(/* @__PURE__ */ new Set()), [z, x] = me("");
  K(() => {
    t !== void 0 && i({ value: t || [] }, { initial: !0 });
  }, [t, i]);
  const m = X(
    (I) => {
      if (H ? x("") : Y(!0), I === "") return;
      const M = H ? Array.isArray(o) ? o.includes(I) ? o.filter((G) => G !== I) : [...o, I] : [I] : I === o ? null : I;
      i({ value: M }), s(M);
    },
    [H, o, i, s]
  );
  K(() => {
    var I;
    H || x(((I = Array.from(R).find((M) => M.value === o)) == null ? void 0 : I.labelText) || "");
  }, [H, R, o]);
  const g = X(() => {
    const I = H ? [] : "";
    x(""), i({ value: I }), s(I);
  }, [H, i, s]), k = X((I) => {
    W((M) => new Set(M).add(I));
  }, []), A = X((I) => {
    W((M) => {
      const G = new Set(M);
      return G.delete(I), G;
    });
  }, []), q = (I) => {
    V.current && !V.current.contains(I.target) && O.current && !O.current.contains(I.target) && (Y(!1), O.current.blur());
  };
  K(() => (F ? (document.addEventListener("mousedown", q), document.addEventListener("touchend", q)) : (document.removeEventListener("mousedown", q), document.removeEventListener("touchend", q)), () => {
    document.removeEventListener("mousedown", q), document.removeEventListener("touchend", q);
  }), [F]);
  const E = ue(
    () => b ?? /* @__PURE__ */ j("div", { className: Je.autoCompleteEmpty, children: [
      /* @__PURE__ */ p(ye, { name: "noresult" }),
      /* @__PURE__ */ p("span", { children: "List is empty" })
    ] }),
    [b]
  ), N = X(() => {
    var I;
    (I = O == null ? void 0 : O.current) == null || I.focus();
  }, [O]), B = $e((I) => {
    i({ value: Array.isArray(I) ? I : [I] });
  });
  K(() => {
    c == null || c({
      focus: N,
      setValue: B
    });
  }, [N, c, B]);
  const D = ue(
    () => ({
      onOptionAdd: k,
      onOptionRemove: A
    }),
    [k, A]
  ), P = ue(() => ({
    multi: H,
    value: o,
    onChange: m,
    optionRenderer: T,
    options: R,
    inputValue: z
  }), [z, H, T, R, m, o]);
  return /* @__PURE__ */ p(Wl.Provider, { value: P, children: /* @__PURE__ */ p(la, { Component: _l, children: /* @__PURE__ */ j(ni.Provider, { value: D, children: [
    y,
    /* @__PURE__ */ j(
      Wn,
      {
        ref: V,
        className: Je.command,
        filter: (I, M, G) => (I + " " + G.join(" ")).toLowerCase().includes(M.toLowerCase()) ? 1 : 0,
        children: [
          /* @__PURE__ */ j(
            "div",
            {
              ref: $,
              onClick: () => {
                var I;
                a && ((I = O == null ? void 0 : O.current) == null || I.focus());
              },
              style: v,
              className: le(Je.badgeListWrapper, Je[l], {
                [Je.disabled]: !a,
                [Je.focused]: document.activeElement === O.current
              }),
              children: [
                H ? /* @__PURE__ */ j("div", { className: Je.badgeList, children: [
                  Array.isArray(o) && o.map((I) => {
                    var M;
                    return /* @__PURE__ */ j("span", { className: Je.badge, children: [
                      (M = Array.from(R).find((G) => G.value === I)) == null ? void 0 : M.label,
                      /* @__PURE__ */ p(
                        ye,
                        {
                          name: "close",
                          size: "sm",
                          onClick: (G) => {
                            G.stopPropagation(), m(I);
                          }
                        }
                      )
                    ] }, I);
                  }),
                  /* @__PURE__ */ p(
                    _a,
                    {
                      id: r,
                      autoFocus: w,
                      ref: O,
                      value: z,
                      disabled: !a,
                      onValueChange: (I) => {
                        Y(!0), x(I);
                      },
                      onFocus: (I) => {
                        Y(!0), f();
                      },
                      onBlur: (I) => {
                        Y(!1), h();
                      },
                      placeholder: n,
                      className: Je.commandInput
                    }
                  )
                ] }) : /* @__PURE__ */ p(
                  _a,
                  {
                    id: r,
                    autoFocus: w,
                    ref: O,
                    value: z,
                    disabled: !a,
                    onValueChange: (I) => {
                      Y(!0), x(I);
                    },
                    onFocus: (I) => {
                      Y(!0), f();
                    },
                    onBlur: (I) => {
                      Y(!1), h();
                    },
                    placeholder: n,
                    className: Je.commandInput
                  }
                ),
                /* @__PURE__ */ j("div", { className: Je.actions, children: [
                  (o == null ? void 0 : o.length) > 0 && a && /* @__PURE__ */ p(
                    "button",
                    {
                      onClick: (I) => {
                        I.stopPropagation(), g();
                      },
                      children: /* @__PURE__ */ p(ye, { name: "close" })
                    }
                  ),
                  /* @__PURE__ */ p("button", { onClick: () => Y(!0), children: /* @__PURE__ */ p(ye, { name: "chevrondown" }) })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ p("div", { style: { position: "relative" }, children: F && /* @__PURE__ */ j(
            On,
            {
              className: Je.commandList,
              onMouseUp: () => {
                var I;
                (I = O == null ? void 0 : O.current) == null || I.focus();
              },
              style: { height: _ },
              children: [
                /* @__PURE__ */ p(Rn, { children: E }),
                /* @__PURE__ */ p(qf, {}),
                /* @__PURE__ */ p(Sd, { children: Array.from(R).map(({ value: I, label: M, enabled: G, keywords: J, labelText: ee }) => /* @__PURE__ */ p(
                  Uf,
                  {
                    value: I,
                    label: M,
                    enabled: G,
                    keywords: J,
                    labelText: ee
                  },
                  I
                )) })
              ]
            }
          ) })
        ]
      }
    )
  ] }) }) });
});
function qf() {
  const { value: e, options: r, inputValue: t, onChange: o } = Ol(), { onOptionAdd: a } = li();
  if (Mf(r, [{ value: t, label: t }]) || Array.isArray(e) && (e != null && e.find((i) => i === t)) || t === e)
    return /* @__PURE__ */ p("span", { style: { display: "none" } });
  const n = /* @__PURE__ */ p(
    Xa,
    {
      value: t,
      className: Je.autoCompleteOption,
      onMouseDown: (i) => {
        i.preventDefault(), i.stopPropagation();
      },
      onSelect: (i) => {
        a({ value: i, label: i, enabled: !0, labelText: i }), o(i);
      },
      children: `Create "${t}"`
    }
  );
  return t.length > 0 ? n : /* @__PURE__ */ p("span", { style: { display: "none" } });
}
function Uf({ value: e, label: r, enabled: t = !0, keywords: o }) {
  const a = mo(), { value: n, onChange: i, optionRenderer: l, multi: s } = Ol(), f = s ? n == null ? void 0 : n.includes(e) : n === e;
  return /* @__PURE__ */ j(
    Xa,
    {
      id: a,
      disabled: !t,
      value: `${e}`,
      className: Je.autoCompleteOption,
      onMouseDown: (h) => {
        h.preventDefault(), h.stopPropagation();
      },
      onSelect: () => {
        i(e);
      },
      "data-state": f ? "checked" : void 0,
      keywords: o,
      children: [
        l({ label: r, value: e }),
        f && /* @__PURE__ */ p(ye, { name: "checkmark" })
      ]
    },
    a
  );
}
const Gf = `'{"Input:backgroundColor-track-Slider": "var(--xmlui-backgroundColor-track-Slider)", "Input:borderRadius-Slider-default": "var(--xmlui-borderRadius-Slider-default)", "Input:borderColor-Slider-default": "var(--xmlui-borderColor-Slider-default)", "Input:borderWidth-Slider-default": "var(--xmlui-borderWidth-Slider-default)", "Input:borderStyle-Slider-default": "var(--xmlui-borderStyle-Slider-default)", "Input:boxShadow-Slider-default": "var(--xmlui-boxShadow-Slider-default)", "Input:borderColor-Slider-default--hover": "var(--xmlui-borderColor-Slider-default--hover)", "Input:boxShadow-Slider-default--hover": "var(--xmlui-boxShadow-Slider-default--hover)", "Input:borderColor-Slider-default--focus": "var(--xmlui-borderColor-Slider-default--focus)", "Input:boxShadow-Slider-default--focus": "var(--xmlui-boxShadow-Slider-default--focus)", "Input:borderRadius-Slider-error": "var(--xmlui-borderRadius-Slider-error)", "Input:borderColor-Slider-error": "var(--xmlui-borderColor-Slider-error)", "Input:borderWidth-Slider-error": "var(--xmlui-borderWidth-Slider-error)", "Input:borderStyle-Slider-error": "var(--xmlui-borderStyle-Slider-error)", "Input:boxShadow-Slider-error": "var(--xmlui-boxShadow-Slider-error)", "Input:borderColor-Slider-error--hover": "var(--xmlui-borderColor-Slider-error--hover)", "Input:boxShadow-Slider-error--hover": "var(--xmlui-boxShadow-Slider-error--hover)", "Input:borderColor-Slider-error--focus": "var(--xmlui-borderColor-Slider-error--focus)", "Input:boxShadow-Slider-error--focus": "var(--xmlui-boxShadow-Slider-error--focus)", "Input:borderRadius-Slider-warning": "var(--xmlui-borderRadius-Slider-warning)", "Input:borderColor-Slider-warning": "var(--xmlui-borderColor-Slider-warning)", "Input:borderWidth-Slider-warning": "var(--xmlui-borderWidth-Slider-warning)", "Input:borderStyle-Slider-warning": "var(--xmlui-borderStyle-Slider-warning)", "Input:boxShadow-Slider-warning": "var(--xmlui-boxShadow-Slider-warning)", "Input:borderColor-Slider-warning--hover": "var(--xmlui-borderColor-Slider-warning--hover)", "Input:boxShadow-Slider-warning--hover": "var(--xmlui-boxShadow-Slider-warning--hover)", "Input:borderColor-Slider-warning--focus": "var(--xmlui-borderColor-Slider-warning--focus)", "Input:boxShadow-Slider-warning--focus": "var(--xmlui-boxShadow-Slider-warning--focus)", "Input:borderRadius-Slider-success": "var(--xmlui-borderRadius-Slider-success)", "Input:borderColor-Slider-success": "var(--xmlui-borderColor-Slider-success)", "Input:borderWidth-Slider-success": "var(--xmlui-borderWidth-Slider-success)", "Input:borderStyle-Slider-success": "var(--xmlui-borderStyle-Slider-success)", "Input:boxShadow-Slider-success": "var(--xmlui-boxShadow-Slider-success)", "Input:borderColor-Slider-success--hover": "var(--xmlui-borderColor-Slider-success--hover)", "Input:boxShadow-Slider-success--hover": "var(--xmlui-boxShadow-Slider-success--hover)", "Input:borderColor-Slider-success--focus": "var(--xmlui-borderColor-Slider-success--focus)", "Input:boxShadow-Slider-success--focus": "var(--xmlui-boxShadow-Slider-success--focus)", "Input:backgroundColor-track-Slider--disabled": "var(--xmlui-backgroundColor-track-Slider--disabled)", "Input:backgroundColor-range-Slider": "var(--xmlui-backgroundColor-range-Slider)", "Input:backgroundColor-range-Slider--disabled": "var(--xmlui-backgroundColor-range-Slider--disabled)", "Input:borderWidth-thumb-Slider": "var(--xmlui-borderWidth-thumb-Slider)", "Input:borderStyle-thumb-Slider": "var(--xmlui-borderStyle-thumb-Slider)", "Input:borderColor-thumb-Slider": "var(--xmlui-borderColor-thumb-Slider)", "Input:backgroundColor-thumb-Slider": "var(--xmlui-backgroundColor-thumb-Slider)", "Input:boxShadow-thumb-Slider": "var(--xmlui-boxShadow-thumb-Slider)"}'`, Yf = "_sliderRoot_1irri_13", Xf = "_sliderTrack_1irri_22", Qf = "_error_1irri_43", Zf = "_warning_1irri_58", jf = "_valid_1irri_73", Jf = "_sliderRange_1irri_92", Kf = "_sliderThumb_1irri_101", qr = {
  themeVars: Gf,
  sliderRoot: Yf,
  sliderTrack: Xf,
  error: Qf,
  warning: Zf,
  valid: jf,
  sliderRange: Jf,
  sliderThumb: Kf
}, Rl = xe(
  ({
    style: e,
    step: r = 1,
    min: t,
    max: o,
    inverted: a,
    updateState: n,
    onDidChange: i = de,
    onFocus: l = de,
    onBlur: s = de,
    registerComponentApi: f,
    enabled: h = !0,
    value: c,
    autoFocus: T,
    readOnly: b,
    tabIndex: v = -1,
    label: y,
    labelPosition: w,
    labelWidth: _,
    labelBreak: H,
    required: $,
    validationStatus: O = "none",
    initialValue: F,
    minStepsBetweenThumbs: Y,
    rangeStyle: V,
    thumbStyle: R
  }, W) => {
    const z = he(null), [x, m] = Ae.useState([]);
    K(() => {
      typeof c == "object" ? m(c) : typeof c == "number" && m([c]);
    }, [c]), K(() => {
      n({ value: F }, { initial: !0 });
    }, [F, n]);
    const g = X(
      (B) => {
        n({ value: B }), i(B);
      },
      [i, n]
    ), k = X(
      (B) => {
        B.length > 1 ? g(B) : B.length === 1 && g(B[0]);
      },
      [g]
    ), A = X(() => {
      l == null || l();
    }, [l]), q = X(() => {
      s == null || s();
    }, [s]), E = X(() => {
      var B;
      (B = z.current) == null || B.focus();
    }, []), N = $e((B) => {
      g(B);
    });
    return K(() => {
      f == null || f({
        focus: E,
        setValue: N
      });
    }, [E, f, N]), /* @__PURE__ */ p(
      Ir,
      {
        labelPosition: w,
        label: y,
        labelWidth: _,
        labelBreak: H,
        required: $,
        enabled: h,
        onFocus: l,
        onBlur: s,
        style: e,
        ref: W,
        children: /* @__PURE__ */ j(
          zn,
          {
            minStepsBetweenThumbs: Y,
            ref: z,
            tabIndex: v,
            "aria-readonly": b,
            className: le(qr.sliderRoot),
            style: e,
            max: o,
            min: t,
            inverted: a,
            step: r,
            disabled: !h,
            onFocus: A,
            onBlur: q,
            onValueChange: k,
            "aria-required": $,
            value: x,
            autoFocus: T,
            children: [
              /* @__PURE__ */ p(
                Hd,
                {
                  className: le(qr.sliderTrack, {
                    [qr.disabled]: !h,
                    [qr.readOnly]: b,
                    [qr.error]: O === "error",
                    [qr.warning]: O === "warning",
                    [qr.valid]: O === "valid"
                  }),
                  children: /* @__PURE__ */ p(Bd, { className: qr.sliderRange, style: V })
                }
              ),
              x == null ? void 0 : x.map((B, D) => /* @__PURE__ */ p(Id, { className: qr.sliderThumb, style: R }, D))
            ]
          }
        )
      }
    );
  }
);
Rl.displayName = zn.displayName;
const ev = `'{"Input:backgroundColor-ColorPicker": "var(--xmlui-backgroundColor-ColorPicker)", "Input:borderRadius-ColorPicker-default": "var(--xmlui-borderRadius-ColorPicker-default)", "Input:borderColor-ColorPicker-default": "var(--xmlui-borderColor-ColorPicker-default)", "Input:borderWidth-ColorPicker-default": "var(--xmlui-borderWidth-ColorPicker-default)", "Input:borderStyle-ColorPicker-default": "var(--xmlui-borderStyle-ColorPicker-default)", "Input:boxShadow-ColorPicker-default": "var(--xmlui-boxShadow-ColorPicker-default)", "Input:borderColor-ColorPicker-default--hover": "var(--xmlui-borderColor-ColorPicker-default--hover)", "Input:boxShadow-ColorPicker-default--hover": "var(--xmlui-boxShadow-ColorPicker-default--hover)", "Input:borderColor-ColorPicker-default--focus": "var(--xmlui-borderColor-ColorPicker-default--focus)", "Input:boxShadow-ColorPicker-default--focus": "var(--xmlui-boxShadow-ColorPicker-default--focus)", "Input:borderRadius-ColorPicker-error": "var(--xmlui-borderRadius-ColorPicker-error)", "Input:borderColor-ColorPicker-error": "var(--xmlui-borderColor-ColorPicker-error)", "Input:borderWidth-ColorPicker-error": "var(--xmlui-borderWidth-ColorPicker-error)", "Input:borderStyle-ColorPicker-error": "var(--xmlui-borderStyle-ColorPicker-error)", "Input:boxShadow-ColorPicker-error": "var(--xmlui-boxShadow-ColorPicker-error)", "Input:borderColor-ColorPicker-error--hover": "var(--xmlui-borderColor-ColorPicker-error--hover)", "Input:boxShadow-ColorPicker-error--hover": "var(--xmlui-boxShadow-ColorPicker-error--hover)", "Input:borderColor-ColorPicker-error--focus": "var(--xmlui-borderColor-ColorPicker-error--focus)", "Input:boxShadow-ColorPicker-error--focus": "var(--xmlui-boxShadow-ColorPicker-error--focus)", "Input:borderRadius-ColorPicker-warning": "var(--xmlui-borderRadius-ColorPicker-warning)", "Input:borderColor-ColorPicker-warning": "var(--xmlui-borderColor-ColorPicker-warning)", "Input:borderWidth-ColorPicker-warning": "var(--xmlui-borderWidth-ColorPicker-warning)", "Input:borderStyle-ColorPicker-warning": "var(--xmlui-borderStyle-ColorPicker-warning)", "Input:boxShadow-ColorPicker-warning": "var(--xmlui-boxShadow-ColorPicker-warning)", "Input:borderColor-ColorPicker-warning--hover": "var(--xmlui-borderColor-ColorPicker-warning--hover)", "Input:boxShadow-ColorPicker-warning--hover": "var(--xmlui-boxShadow-ColorPicker-warning--hover)", "Input:borderColor-ColorPicker-warning--focus": "var(--xmlui-borderColor-ColorPicker-warning--focus)", "Input:boxShadow-ColorPicker-warning--focus": "var(--xmlui-boxShadow-ColorPicker-warning--focus)", "Input:borderRadius-ColorPicker-success": "var(--xmlui-borderRadius-ColorPicker-success)", "Input:borderColor-ColorPicker-success": "var(--xmlui-borderColor-ColorPicker-success)", "Input:borderWidth-ColorPicker-success": "var(--xmlui-borderWidth-ColorPicker-success)", "Input:borderStyle-ColorPicker-success": "var(--xmlui-borderStyle-ColorPicker-success)", "Input:boxShadow-ColorPicker-success": "var(--xmlui-boxShadow-ColorPicker-success)", "Input:borderColor-ColorPicker-success--hover": "var(--xmlui-borderColor-ColorPicker-success--hover)", "Input:boxShadow-ColorPicker-success--hover": "var(--xmlui-boxShadow-ColorPicker-success--hover)", "Input:borderColor-ColorPicker-success--focus": "var(--xmlui-borderColor-ColorPicker-success--focus)", "Input:boxShadow-ColorPicker-success--focus": "var(--xmlui-boxShadow-ColorPicker-success--focus)"}'`, rv = "_colorInput_ays9f_13", tv = "_error_ays9f_41", ov = "_warning_ays9f_56", av = "_valid_ays9f_71", to = {
  themeVars: ev,
  colorInput: rv,
  error: tv,
  warning: ov,
  valid: av
}, wo = {
  initialValue: "",
  value: "",
  enabled: !0,
  validationStatus: "none"
}, zl = xe(
  ({
    style: e,
    updateState: r,
    onDidChange: t = de,
    onFocus: o = de,
    onBlur: a = de,
    registerComponentApi: n,
    enabled: i = wo.enabled,
    value: l = wo.value,
    autoFocus: s,
    tabIndex: f = -1,
    label: h,
    labelPosition: c,
    labelWidth: T,
    labelBreak: b,
    required: v,
    validationStatus: y = wo.validationStatus,
    initialValue: w = wo.initialValue
  }, _) => {
    const H = he(null), $ = X(
      (W) => {
        r({ value: W }), t(W);
      },
      [t, r]
    ), O = X(
      (W) => {
        $(W.target.value);
      },
      [$]
    );
    K(() => {
      r({ value: w }, { initial: !0 });
    }, [w, r]);
    const F = X(() => {
      o == null || o();
    }, [o]), Y = X(() => {
      a == null || a();
    }, [a]), V = X(() => {
      var W;
      (W = H.current) == null || W.focus();
    }, []), R = $e((W) => {
      $(W);
    });
    return K(() => {
      n == null || n({
        focus: V,
        setValue: R
      });
    }, [V, n, R]), /* @__PURE__ */ p(
      Ir,
      {
        labelPosition: c,
        label: h,
        labelWidth: T,
        labelBreak: b,
        required: v,
        enabled: i,
        onFocus: o,
        onBlur: a,
        style: e,
        ref: _,
        children: /* @__PURE__ */ p(
          "input",
          {
            className: le(to.colorInput, {
              [to.disabled]: !i,
              [to.error]: y === "error",
              [to.warning]: y === "warning",
              [to.valid]: y === "valid"
            }),
            disabled: !i,
            onFocus: F,
            onChange: O,
            autoFocus: s,
            onBlur: Y,
            required: v,
            type: "color",
            inputMode: "text",
            ref: H,
            value: l,
            tabIndex: f
          }
        )
      }
    );
  }
);
zl.displayName = "ColorPicker";
const iv = "_helper_1qbfk_13", nv = "_helperText_1qbfk_24", lv = "_valid_1qbfk_29", dv = "_error_1qbfk_34", sv = "_warning_1qbfk_39", To = {
  helper: iv,
  helperText: nv,
  valid: lv,
  error: dv,
  warning: sv
};
var Vl = {
  color: void 0,
  size: void 0,
  className: void 0,
  style: void 0,
  attr: void 0
}, tn = Ae.createContext && Ae.createContext(Vl), Ct = function() {
  return Ct = Object.assign || function(e) {
    for (var r, t = 1, o = arguments.length; t < o; t++) {
      r = arguments[t];
      for (var a in r) Object.prototype.hasOwnProperty.call(r, a) && (e[a] = r[a]);
    }
    return e;
  }, Ct.apply(this, arguments);
}, uv = function(e, r) {
  var t = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && r.indexOf(o) < 0 && (t[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var a = 0, o = Object.getOwnPropertySymbols(e); a < o.length; a++)
    r.indexOf(o[a]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[a]) && (t[o[a]] = e[o[a]]);
  return t;
};
function El(e) {
  return e && e.map(function(r, t) {
    return Ae.createElement(r.tag, Ct({
      key: t
    }, r.attr), El(r.child));
  });
}
function ho(e) {
  return function(r) {
    return Ae.createElement(cv, Ct({
      attr: Ct({}, e.attr)
    }, r), El(e.child));
  };
}
function cv(e) {
  var r = function(t) {
    var o = e.attr, a = e.size, n = e.title, i = uv(e, ["attr", "size", "title"]), l = a || t.size || "1em", s;
    return t.className && (s = t.className), e.className && (s = (s ? s + " " : "") + e.className), Ae.createElement("svg", Ct({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, t.attr, o, i, {
      className: s,
      style: Ct(Ct({
        color: e.color || t.color
      }, t.style), e.style),
      height: l,
      width: l,
      xmlns: "http://www.w3.org/2000/svg"
    }), n && Ae.createElement("title", null, n), e.children);
  };
  return tn !== void 0 ? Ae.createElement(tn.Consumer, null, function(t) {
    return r(t);
  }) : r(Vl);
}
function mv(e) {
  return ho({ attr: { viewBox: "0 0 1024 1024" }, child: [{ tag: "path", attr: { d: "M464 720a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm16-304v184c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V416c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8zm475.7 440l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zm-783.5-27.9L512 239.9l339.8 588.2H172.2z" } }] })(e);
}
const pv = (e) => /* @__PURE__ */ p(mv, { ...e });
function hv(e) {
  return ho({ attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.493 2 11.953 2zM12 20c-4.411 0-8-3.589-8-8s3.567-8 7.953-8C16.391 4 20 7.589 20 12s-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M11 7h2v7h-2zm0 8h2v2h-2z" } }] })(e);
}
const xv = (e) => /* @__PURE__ */ p(hv, { ...e }), on = ({ text: e = "", status: r, style: t }) => {
  const o = () => {
    if (r === "warning")
      return /* @__PURE__ */ p(pv, { color: "var(--xmlui-color-warning)" });
    if (r === "error")
      return /* @__PURE__ */ p(xv, { color: "var(--xmlui-color-error)" });
  };
  return /* @__PURE__ */ j(
    "div",
    {
      style: t,
      className: le(To.helper, {
        [To.valid]: r === "valid",
        [To.warning]: r === "warning",
        [To.error]: r === "error"
      }),
      children: [
        r && /* @__PURE__ */ p("div", { style: { flexShrink: 0 }, children: o() }),
        e && /* @__PURE__ */ p("div", { className: To.helperText, children: e })
      ]
    }
  );
}, bv = {
  checkbox: "end"
}, Nt = {
  type: "text",
  labelBreak: !0,
  enabled: !0,
  customValidationsDebounce: 0
};
$n(function({
  style: r,
  bindTo: t,
  type: o = Nt.type,
  label: a,
  enabled: n = Nt.enabled,
  labelPosition: i,
  labelWidth: l,
  labelBreak: s = Nt.labelBreak,
  children: f,
  validations: h,
  onValidate: c,
  customValidationsDebounce: T = Nt.customValidationsDebounce,
  validationMode: b,
  registerComponentApi: v,
  maxTextLength: y,
  inputRenderer: w,
  ..._
}) {
  const H = it((B) => l || B.itemLabelWidth), $ = it(
    (B) => s !== void 0 ? s : B.itemLabelBreak
  ), O = it(
    (B) => i || B.itemLabelPosition || bv[o]
  ), F = it(
    (B) => Mi(B.originalSubject, t)
  ), Y = F === void 0 ? _.initialValue : F, V = it((B) => Mi(B.subject, t)), R = it((B) => B.validationResults[t]), W = it((B) => B.dispatch), z = it((B) => B.enabled), x = n && z;
  K(() => {
    W(wh(t, Y));
  }, [t, W, Y]), yx(h, c, V, W, t, T);
  const m = X(
    ({ value: B }, D) => {
      D != null && D.initial || W(Hh(t, B));
    },
    [t, W]
  );
  K(() => () => {
    W($h(t));
  }, [t, W]);
  const { validationStatus: g, isHelperTextShown: k } = Cx(
    t,
    V,
    R,
    b
  );
  let A = null;
  switch (o) {
    case "select": {
      A = /* @__PURE__ */ p(
        Qb,
        {
          ..._,
          value: V,
          updateState: m,
          registerComponentApi: v,
          enabled: x,
          validationStatus: g,
          children: f
        }
      );
      break;
    }
    case "autocomplete": {
      A = /* @__PURE__ */ p(
        Ff,
        {
          ..._,
          value: V,
          updateState: m,
          registerComponentApi: v,
          enabled: x,
          validationStatus: g,
          children: f
        }
      );
      break;
    }
    case "datePicker": {
      A = /* @__PURE__ */ p(
        Ip,
        {
          ..._,
          value: V,
          updateState: m,
          enabled: x,
          validationStatus: g
        }
      );
      break;
    }
    case "radioGroup": {
      A = /* @__PURE__ */ p(
        uf,
        {
          ..._,
          value: V,
          updateState: m,
          enabled: x,
          validationStatus: g,
          children: f
        }
      );
      break;
    }
    case "number":
    case "integer": {
      A = /* @__PURE__ */ p(
        Kx,
        {
          ..._,
          value: V,
          updateState: m,
          registerComponentApi: v,
          enabled: x,
          integersOnly: o === "integer",
          validationStatus: g,
          min: h.minValue,
          max: h.maxValue,
          maxLength: y ?? (h == null ? void 0 : h.maxLength)
        }
      );
      break;
    }
    case "switch":
    case "checkbox": {
      A = /* @__PURE__ */ p(
        Ea,
        {
          ..._,
          value: V,
          updateState: m,
          enabled: x,
          validationStatus: g,
          variant: o,
          inputRenderer: w
        }
      );
      break;
    }
    case "file": {
      A = /* @__PURE__ */ p(
        Zp,
        {
          ..._,
          value: V,
          updateState: m,
          registerComponentApi: v,
          enabled: x,
          validationStatus: g,
          multiple: Ox(_.multiple, !1)
        }
      );
      break;
    }
    case "text": {
      A = /* @__PURE__ */ p(
        Ra,
        {
          ..._,
          value: V,
          updateState: m,
          registerComponentApi: v,
          enabled: x,
          validationStatus: g,
          maxLength: y ?? (h == null ? void 0 : h.maxLength)
        }
      );
      break;
    }
    case "password": {
      A = /* @__PURE__ */ p(
        Ra,
        {
          ..._,
          type: "password",
          value: V,
          updateState: m,
          registerComponentApi: v,
          enabled: x,
          validationStatus: g,
          maxLength: y ?? (h == null ? void 0 : h.maxLength)
        }
      );
      break;
    }
    case "textarea": {
      A = /* @__PURE__ */ p(
        wf,
        {
          ..._,
          value: V,
          updateState: m,
          registerComponentApi: v,
          enabled: x,
          validationStatus: g,
          maxLength: y ?? (h == null ? void 0 : h.maxLength)
        }
      );
      break;
    }
    case "slider": {
      A = /* @__PURE__ */ p(
        Rl,
        {
          ..._,
          value: V,
          updateState: m,
          registerComponentApi: v,
          enabled: x,
          validationStatus: g,
          min: h.minValue,
          max: h.maxValue
        }
      );
      break;
    }
    case "colorpicker": {
      A = /* @__PURE__ */ p(
        zl,
        {
          ..._,
          value: V,
          updateState: m,
          registerComponentApi: v,
          enabled: x,
          validationStatus: g
        }
      );
      break;
    }
    case "custom": {
      A = f;
      break;
    }
    default: {
      console.warn(`unknown form item type ${o}`), A = /* @__PURE__ */ p("div", { children: V });
      break;
    }
  }
  const q = $e(() => {
    W(Bh(t));
  }), E = $e(() => {
    W(Ih(t));
  }), [N] = ii({ duration: 100 });
  return /* @__PURE__ */ p(
    Ir,
    {
      labelPosition: O,
      label: a,
      labelWidth: H,
      labelBreak: $,
      enabled: x,
      required: h.required,
      validationInProgress: R == null ? void 0 : R.partial,
      onFocus: q,
      onBlur: E,
      style: r,
      validationResult: /* @__PURE__ */ p("div", { ref: N, children: k && (R == null ? void 0 : R.validations.map((B, D) => /* @__PURE__ */ j(In, { children: [
        B.isValid && !!B.validMessage && /* @__PURE__ */ p(
          on,
          {
            text: B.validMessage,
            status: "valid",
            style: { opacity: B.stale ? 0.5 : void 0 }
          }
        ),
        !B.isValid && !!B.invalidMessage && /* @__PURE__ */ p(
          on,
          {
            text: B.invalidMessage,
            status: B.severity,
            style: { opacity: B.stale ? 0.5 : void 0 }
          }
        )
      ] }, D))) }),
      children: A
    }
  );
});
const Yt = "FormItem", Do = bx.filter(
  (e) => e !== "none"
), fv = C({
  status: "experimental",
  description: `A \`${Yt}\` component represents a single input element within a \`Form\`. The value within the \`${Yt}\` may be associated with a particular property within the encapsulating \`Form\` component's data.`,
  props: {
    bindTo: {
      description: "This property binds a particular input field to one of the attributes of the `Form` data. It names the property of the form's `data` data to get the input's initial value.When the field is saved, its value will be stored in the `data` property with this name."
    },
    autoFocus: rr(),
    label: Fe(),
    labelPosition: Dr(),
    labelWidth: u("This property sets the width of the item label."),
    labelBreak: {
      description: "This boolean value indicates if the label can be split into multiple lines if it would overflow the available label width.",
      type: "boolean",
      defaultValue: Nt.labelBreak
    },
    enabled: Qe(),
    type: {
      description: "This property is used to determine the specific input control the FormItem will wrap around. Note that the control names start with a lowercase letter and map to input components found in XMLUI.",
      availableValues: vx,
      defaultValue: Nt.type,
      valueType: "string"
    },
    customValidationsDebounce: {
      description: "This optional number prop determines the time interval between two runs of a custom validation.",
      type: "number",
      defaultValue: Nt.customValidationsDebounce
    },
    validationMode: {
      description: "This property sets what kind of validation mode or strategy to employ for a particular input field.",
      availableValues: fx,
      defaultValue: bl
    },
    initialValue: Cr(),
    required: Ar(),
    requiredInvalidMessage: {
      description: "This optional string property is used to customize the message that is displayed if the field is not filled in.",
      valueType: "string"
    },
    minLength: {
      description: "Checks whether the input has a minimum length of a specified value.",
      valueType: "number"
    },
    maxLength: {
      description: "Checks whether the input has a maximum length of a specified value.",
      valueType: "number"
    },
    maxTextLength: {
      description: "The maximum length of the text in the input field",
      valueType: "number"
    },
    lengthInvalidMessage: {
      description: "This optional string property is used to customize the message that is displayed on a failed length check: [minLength](#minlength) or [maxLength](#maxlength).",
      valueType: "string"
    },
    lengthInvalidSeverity: {
      description: "This property sets the severity level of the length validation.",
      valueType: "string",
      availableValues: Do,
      defaultValue: "error"
    },
    minValue: {
      description: "Checks whether the input has the minimum specified value.",
      valueType: "number"
    },
    maxValue: {
      description: "Checks whether the input has the maximum specified value.",
      valueType: "number"
    },
    rangeInvalidMessage: {
      description: "This optional string property is used to customize the message that is displayed when a value is out of range.",
      valueType: "string"
    },
    rangeInvalidSeverity: {
      description: "This property sets the severity level of the value range validation.",
      valueType: "string",
      availableValues: Do,
      defaultValue: "error"
    },
    pattern: {
      description: "Checks whether the input fits a predefined regular expression.",
      valueType: "string"
    },
    patternInvalidMessage: {
      description: "This optional string property is used to customize the message that is displayed on a failed pattern test.",
      valueType: "string"
    },
    patternInvalidSeverity: {
      description: "This property sets the severity level of the pattern validation.",
      valueType: "string",
      availableValues: Do,
      defaultValue: "error"
    },
    regex: {
      description: "Checks whether the input fits the provided regular expression.",
      valueType: "string"
    },
    regexInvalidMessage: {
      description: "This optional string property is used to customize the message that is displayed on a failed regular expression test.",
      valueType: "string"
    },
    regexInvalidSeverity: {
      description: "This property sets the severity level of regular expression validation.",
      valueType: "string",
      availableValues: Do,
      defaultValue: "error"
    },
    inputTemplate: {
      description: "This property is used to define a custom input template."
    }
  },
  events: {
    validate: u("This event is used to define a custom validation function.")
  },
  contextVars: {
    $value: u(
      `The context variable represents the current value of the \`${Yt}\`. It can be used in expressions and code snippets within the \`${Yt}\` instance.`
    ),
    $setValue: u(
      `This function can be invoked to set the \`${Yt}\` instance's value. The function has a single argument, the new value to set.`
    ),
    $validationResult: u(
      `This variable represents the result of the latest validation of the \`${Yt}\` instance.`
    )
  },
  themeVars: Z(Hr.themeVars),
  defaultThemeVars: {
    "color-FormItemLabel": "$textColor-primary",
    "fontSize-FormItemLabel": "$fontSize-small",
    "fontWeight-FormItemLabel": "$fontWeight-medium",
    "font-style-FormItemLabel": "normal",
    "textTransform-FormItemLabel": "none",
    "color-FormItemLabel-requiredMark": "$color-danger-400"
  }
}), Er = "Heading", Dt = u(
  `This property determines the text displayed in the heading. \`${Er}\` also accepts nested text instead of specifying the \`value\`. If both \`value\` and a nested text are used, the \`value\` will be displayed.`
), Pt = u(
  "This property determines the maximum number of lines the component can wrap to. If there is not enough space for all of the text, the component wraps the text up to as many lines as specified."
), vv = {
  description: "This property indicates whether ellipses should be displayed (`true`) when the heading text is cropped or not (`false`).",
  type: "boolean",
  defaultValue: oi.ellipses
}, gv = u(
  "This property indicates whether linebreaks should be preserved when displaying text."
), xo = (e) => `Represents a heading level ${e} text`, Mt = {
  description: "If true, this heading will be excluded from the table of contents.",
  type: "boolean",
  defaultValue: oi.omitFromToc
}, Tv = C({
  description: "Represents a heading text",
  props: {
    value: Dt,
    level: {
      description: "This property sets the visual significance (level) of the heading.",
      availableValues: ["h1", "h2", "h3", "h4", "h5", "h6"],
      defaultValue: oi.level
    },
    maxLines: Pt,
    ellipses: vv,
    preserveLinebreaks: gv,
    omitFromToc: Mt
  },
  themeVars: Z(Br.themeVars),
  defaultThemeVars: {
    [`fontFamily-${Er}`]: "$fontFamily",
    [`color-${Er}`]: "inherit",
    [`fontWeight-${Er}`]: "$fontWeight-bold",
    [`letterSpacing-${Er} `]: "0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), va = "H1", yv = C({
  description: xo(1),
  specializedFrom: Er,
  props: {
    value: Dt,
    maxLines: Pt,
    omitFromToc: Mt
  },
  themeVars: Z(Br.themeVars),
  defaultThemeVars: {
    [`fontSize-${va}`]: "$fontSize-large",
    [`marginTop-${va}`]: "0",
    [`marginBottom-${va}`]: "0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), ga = "H2", Cv = C({
  description: xo(2),
  specializedFrom: Er,
  props: {
    value: Dt,
    maxLines: Pt,
    omitFromToc: Mt
  },
  themeVars: Z(Br.themeVars),
  defaultThemeVars: {
    [`fontSize-${ga}`]: "$fontSize-medium",
    [`marginTop-${ga}`]: "0",
    [`marginBottom-${ga}`]: "0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), Ta = "H3", kv = C({
  description: xo(3),
  specializedFrom: Er,
  props: {
    value: Dt,
    maxLines: Pt,
    omitFromToc: Mt
  },
  themeVars: Z(Br.themeVars),
  defaultThemeVars: {
    [`fontSize-${Ta}`]: "$fontSize-normal",
    [`marginTop-${Ta}`]: "0",
    [`marginBottom-${Ta}`]: "0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), ya = "H4", Sv = C({
  description: xo(4),
  specializedFrom: Er,
  props: {
    value: Dt,
    maxLines: Pt,
    omitFromToc: Mt
  },
  themeVars: Z(Br.themeVars),
  defaultThemeVars: {
    [`fontSize-${ya}`]: "$fontSize-small",
    [`marginTop-${ya}`]: "0",
    [`marginBottom-${ya}`]: "0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), Ca = "H5", wv = C({
  description: xo(5),
  specializedFrom: Er,
  props: {
    value: Dt,
    maxLines: Pt,
    omitFromToc: Mt
  },
  themeVars: Z(Br.themeVars),
  defaultThemeVars: {
    [`fontSize-${Ca}`]: "$fontSize-smaller",
    [`marginTop-${Ca}`]: "0",
    [`marginBottom-${Ca}`]: "0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), ka = "H6", Hv = C({
  description: xo(6),
  specializedFrom: Er,
  props: {
    value: Dt,
    maxLines: Pt,
    omitFromToc: Mt
  },
  themeVars: Z(Br.themeVars),
  defaultThemeVars: {
    [`fontSize-${ka}`]: "$fontSize-tiny",
    [`marginTop-${ka}`]: "0",
    [`marginBottom-${ka}`]: "0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), Bv = C({
  status: "deprecated",
  description: "(**OBSOLETE**) This component displays some content when its parent component is hovered.",
  props: {
    triggerTemplate: Re("The component that opens the hover card when hovered.")
  }
}), an = "Icon", Iv = C({
  status: "experimental",
  description: "This component is the representation of an icon.",
  props: {
    name: u(
      "This string property specifies the name of the icon to display. All icons have unique names and identifying the name is case-sensitive."
    ),
    size: {
      description: `This property defines the size of the \`${an}\`. Note that setting the \`height\` and/or the \`width\` of the component will override this property.`,
      availableValues: ["xs", "sm", "md", "lg"]
    },
    fallback: u(
      "This optional property provides a way to handle situations when the provided [icon name](#name) is not found in the registry."
    )
  },
  themeVars: Z(Qn.themeVars),
  defaultThemeVars: {
    [`size-${an}`]: "1.25em"
  }
}), nn = "Image", $v = C({
  description: `The \`${nn}\` component represents or depicts an object, scene, idea, or other concept with a picture.`,
  props: {
    src: u("This property is used to indicate the source (path) of the image to display."),
    alt: u("This property specifies an alternate text for the image."),
    fit: {
      description: "This property sets how the image content should be resized to fit its container.",
      type: "string",
      defaultValue: "contain"
    },
    lazyLoad: u(
      "Lazy loading instructs the browser to load the image only when it is imminently needed (e.g. user scrolls to it). The default value is eager (`false`)."
    ),
    aspectRatio: u(
      "This property sets a preferred aspect ratio for the image, which will be used in the calculation of auto sizes and some other layout functions."
    ),
    animation: u("The animation object to be applied to the component")
  },
  events: {
    click: po(nn)
  },
  themeVars: Z(Cc.themeVars)
}), Lv = "Items", _v = C({
  description: `The \`${Lv}\` component maps sequential data items into component instances, representing each data item as a particular component.`,
  props: {
    items: Pe("This property contains the list of data items this component renders."),
    data: u(
      "This property contains the list of data items (obtained from a data source) this component renders."
    ),
    reverse: {
      description: "This property reverses the order in which data is mapped to template components."
    },
    itemTemplate: Re("The component template to display a single item")
  },
  contextVars: {
    $item: Re(
      "This value represents the current iteration item while the component renders its children."
    ),
    $itemIndex: Re(
      "This integer value represents the current iteration index (zero-based) while rendering children."
    ),
    $isFirst: Re("This boolean value indicates if the component renders its first item."),
    $isLast: Re("This boolean value indicates if the component renders its last item.")
  },
  opaque: !0
}), Oe = "Link", Av = C({
  description: `A \`${Oe}\` component represents a navigation target within the app or a reference to an external web URL.`,
  props: {
    to: u("This property defines the URL of the link."),
    enabled: Qe(),
    active: {
      description: "Indicates whether this link is active or not. If so, it will have a distinct visual appearance.",
      type: "boolean",
      defaultValue: !1
    },
    target: {
      description: `This property specifies where to open the link represented by the \`${Oe}\`. This property accepts the following values (in accordance with the HTML standard):`,
      availableValues: Vn,
      type: "string",
      defaultValue: "_self"
    },
    label: Fe(),
    icon: u("This property allows you to add an icon (specify the icon's name) to the link.")
  },
  themeVars: Z(eo.themeVars),
  themeVarDescriptions: {
    [`gap-icon-${Oe}`]: "This property defines the size of the gap between the icon and the label."
  },
  defaultThemeVars: {
    [`border-${Oe}`]: "0px solid $borderColor",
    [`color-${Oe}--hover--active`]: `$color-${Oe}--active`,
    [`textDecorationColor-${Oe}--hover`]: "$color-surface-400A80",
    [`textDecorationColor-${Oe}--active`]: "$color-surface200",
    [`fontWeight-${Oe}--active`]: "$fontWeight-bold",
    [`textDecorationColor-${Oe}`]: "$color-surface-400",
    [`textUnderlineOffset-${Oe}`]: "$space-1",
    [`textDecorationLine-${Oe}`]: "underline",
    [`textDecorationStyle-${Oe}`]: "dashed",
    [`textDecorationThickness-${Oe}`]: "$space-0_5",
    [`outlineColor-${Oe}--focus`]: "$outlineColor--focus",
    [`outlineWidth-${Oe}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${Oe}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${Oe}--focus`]: "$outlineOffset--focus",
    [`fontSize-${Oe}`]: "inherit",
    [`gap-icon-${Oe}`]: "$gap-tight",
    [`padding-icon-${Oe}`]: "$space-0_5",
    light: {
      [`color-${Oe}`]: "$color-primary-500",
      [`color-${Oe}--active`]: "$color-primary-500"
    },
    dark: {
      [`color-${Oe}`]: "$color-primary-500",
      [`color-${Oe}--active`]: "$color-primary-500"
    }
  }
}), Nv = '"[]"', Wv = {
  themeVars: Nv
}, Xt = "List", Ov = C({
  status: "experimental",
  description: `The \`${Xt}\` component is a robust layout container that renders associated data items as a list of components. \`${Xt}\` is virtualized; it renders only items that are visible in the viewport.`,
  props: {
    data: u(
      "The component receives data via this property. The `data` property is a list of items that the `List` can display."
    ),
    items: Pe(
      "You can use `items` as an alias for the `data` property. When you bind the list to a data source (e.g. an API endpoint), the `data` acts as the property that accepts a URL to fetch information from an API.When both `items` and `data` are used, `items` has priority."
    ),
    loading: u(
      "This property delays the rendering of children until it is set to `false`, or the component receives usable list items via the [`data`](#data) property."
    ),
    limit: u(`This property limits the number of items displayed in the \`${Xt}\`.`),
    scrollAnchor: {
      description: "This property pins the scroll position to a specified location of the list. Available values are shown below.",
      availableValues: hs,
      type: "string",
      defaultValue: "top"
    },
    groupBy: u(
      "This property sets which attribute of the data is used to group the list items. If the attribute does not appear in the data, it will be ignored."
    ),
    orderBy: u(
      "This property enables the ordering of list items by specifying an attribute in the data."
    ),
    availableGroups: u(
      `This property is an array of group names that the \`${Xt}\` will display.`
    ),
    groupHeaderTemplate: Re(
      "Enables the customization of how the groups are displayed, similarly to the [`itemTemplate`](#itemtemplate). You can use the `$item` context variable to access an item group and map its individual attributes."
    ),
    groupFooterTemplate: Re(
      "Enables the customization of how the the footer of each group is displayed. Combine with [`groupHeaderTemplate`](#groupHeaderTemplate) to customize sections. You can use the `$item` context variable to access an item group and map its individual attributes."
    ),
    itemTemplate: Re(
      "This property allows the customization of mapping data items to components. You can use the `$item` context variable to access an item and map its individual attributes."
    ),
    emptyListTemplate: Re(
      "This property defines the template to display when the list is empty."
    ),
    pageInfo: u(
      `This property contains the current page information. Setting this property also enures the \`${Xt}\` uses pagination.`
    ),
    idKey: {
      description: "Denotes which attribute of an item acts as the ID or key of the item",
      type: "string",
      defaultValue: "id"
    },
    groupsInitiallyExpanded: u(
      "This Boolean property defines whether the list groups are initially expanded."
    ),
    defaultGroups: u(
      `This property adds a list of default groups for the \`${Xt}\` and displays the group headers in the specified order. If the data contains group headers not in this list, those headers are also displayed (after the ones in this list); however, their order is not deterministic.`
    ),
    hideEmptyGroups: {
      description: "This boolean property indicates if empty groups should be hidden (no header and footer are displayed).",
      valueType: "boolean",
      defaultValue: !0
    },
    borderCollapse: {
      description: "Collapse items borders",
      valueType: "boolean",
      defaultValue: !0
    }
  },
  apis: {
    scrollToTop: u("This method scrolls the list to the top."),
    scrollToBottom: u("This method scrolls the list to the bottom."),
    scrollToIndex: u(
      "This method scrolls the list to a specific index. The method accepts an index as a parameter."
    ),
    scrollToId: u(
      "This method scrolls the list to a specific item. The method accepts an item ID as a parameter."
    )
  },
  contextVars: {
    $item: u("This property represents the value of an item in the data list.")
  },
  themeVars: Z(Wv.themeVars)
}), Rv = "Logo", zv = C({
  status: "experimental",
  description: `The \`${Rv}\` component represents a logo or a brand symbol. Usually, you use this component in the [\`AppHeader\`](./AppHeader.mdx#logotemplate).`
}), Vv = `'{"borderColor-HorizontalRule": "var(--xmlui-borderColor-HorizontalRule)", "borderWidth-HorizontalRule": "var(--xmlui-borderWidth-HorizontalRule)", "borderStyle-HorizontalRule": "var(--xmlui-borderStyle-HorizontalRule)", "backgroundColor-Blockquote": "var(--xmlui-backgroundColor-Blockquote)", "accent-Blockquote": "var(--xmlui-accent-Blockquote)", "borderRadius-Blockquote": "var(--xmlui-borderRadius-Blockquote)", "boxShadow-Blockquote": "var(--xmlui-boxShadow-Blockquote)", "padding-Blockquote": "var(--xmlui-padding-Blockquote)", "margin-Blockquote": "var(--xmlui-margin-Blockquote)", "backgroundColor-Admonition": "var(--xmlui-backgroundColor-Admonition)", "color-Admonition": "var(--xmlui-color-Admonition)", "size-icon-Admonition": "var(--xmlui-size-icon-Admonition)", "paddingLeft-UnorderedList": "var(--xmlui-paddingLeft-UnorderedList)", "paddingLeft-OrderedList": "var(--xmlui-paddingLeft-OrderedList)", "paddingLeft-ListItem": "var(--xmlui-paddingLeft-ListItem)", "color-marker-ListItem": "var(--xmlui-color-marker-ListItem)", "marginTop-HtmlHeading": "var(--xmlui-marginTop-HtmlHeading)", "marginBottom-HtmlHeading": "var(--xmlui-marginBottom-HtmlHeading)"}'`, Ev = {
  themeVars: Vv
}, Dv = `'{"color-HtmlTable": "var(--xmlui-color-HtmlTable)", "backgroundColor-HtmlTable": "var(--xmlui-backgroundColor-HtmlTable)", "fontFamily-HtmlTable": "var(--xmlui-fontFamily-HtmlTable)", "fontSize-HtmlTable": "var(--xmlui-fontSize-HtmlTable)", "fontWeight-HtmlTable": "var(--xmlui-fontWeight-HtmlTable)", "textTransform-HtmlTable": "var(--xmlui-textTransform-HtmlTable)", "marginTop-HtmlTable": "var(--xmlui-marginTop-HtmlTable)", "marginBottom-HtmlTable": "var(--xmlui-marginBottom-HtmlTable)", "border-HtmlTable": "var(--xmlui-border-HtmlTable)", "borderHorizontal-HtmlTable": "var(--xmlui-borderHorizontal-HtmlTable, var(--xmlui-border-HtmlTable))", "borderVertical-HtmlTable": "var(--xmlui-borderVertical-HtmlTable, var(--xmlui-border-HtmlTable))", "borderLeft-HtmlTable": "var(--xmlui-borderLeft-HtmlTable, var(--xmlui-borderHorizontal-HtmlTable, var(--xmlui-border-HtmlTable)))", "borderRight-HtmlTable": "var(--xmlui-borderRight-HtmlTable, var(--xmlui-borderHorizontal-HtmlTable, var(--xmlui-border-HtmlTable)))", "borderTop-HtmlTable": "var(--xmlui-borderTop-HtmlTable, var(--xmlui-borderVertical-HtmlTable, var(--xmlui-border-HtmlTable)))", "borderBottom-HtmlTable": "var(--xmlui-borderBottom-HtmlTable, var(--xmlui-borderVertical-HtmlTable, var(--xmlui-border-HtmlTable)))", "borderWidth-HtmlTable": "var(--xmlui-borderWidth-HtmlTable)", "borderHorizontalWidth-HtmlTable": "var(--xmlui-borderHorizontalWidth-HtmlTable, var(--xmlui-borderWidth-HtmlTable))", "borderLeftWidth-HtmlTable": "var(--xmlui-borderLeftWidth-HtmlTable, var(--xmlui-borderHorizontalWidth-HtmlTable, var(--xmlui-borderWidth-HtmlTable)))", "borderRightWidth-HtmlTable": "var(--xmlui-borderRightWidth-HtmlTable, var(--xmlui-borderHorizontalWidth-HtmlTable, var(--xmlui-borderWidth-HtmlTable)))", "borderVerticalWidth-HtmlTable": "var(--xmlui-borderVerticalWidth-HtmlTable, var(--xmlui-borderWidth-HtmlTable))", "borderTopWidth-HtmlTable": "var(--xmlui-borderTopWidth-HtmlTable, var(--xmlui-borderVerticalWidth-HtmlTable, var(--xmlui-borderWidth-HtmlTable)))", "borderBottomWidth-HtmlTable": "var(--xmlui-borderBottomWidth-HtmlTable, var(--xmlui-borderVerticalWidth-HtmlTable, var(--xmlui-borderWidth-HtmlTable)))", "borderStyle-HtmlTable": "var(--xmlui-borderStyle-HtmlTable)", "borderHorizontalStyle-HtmlTable": "var(--xmlui-borderHorizontalStyle-HtmlTable, var(--xmlui-borderStyle-HtmlTable))", "borderLeftStyle-HtmlTable": "var(--xmlui-borderLeftStyle-HtmlTable, var(--xmlui-borderHorizontalStyle-HtmlTable, var(--xmlui-borderStyle-HtmlTable)))", "borderRightStyle-HtmlTable": "var(--xmlui-borderRightStyle-HtmlTable, var(--xmlui-borderHorizontalStyle-HtmlTable, var(--xmlui-borderStyle-HtmlTable)))", "borderVerticalStyle-HtmlTable": "var(--xmlui-borderVerticalStyle-HtmlTable, var(--xmlui-borderStyle-HtmlTable))", "borderTopStyle-HtmlTable": "var(--xmlui-borderTopStyle-HtmlTable, var(--xmlui-borderVerticalStyle-HtmlTable, var(--xmlui-borderStyle-HtmlTable)))", "borderBottomStyle-HtmlTable": "var(--xmlui-borderBottomStyle-HtmlTable, var(--xmlui-borderVerticalStyle-HtmlTable, var(--xmlui-borderStyle-HtmlTable)))", "borderColor-HtmlTable": "var(--xmlui-borderColor-HtmlTable)", "borderHorizontalColor-HtmlTable": "var(--xmlui-borderHorizontalColor-HtmlTable, var(--xmlui-borderColor-HtmlTable))", "borderLeftColor-HtmlTable": "var(--xmlui-borderLeftColor-HtmlTable, var(--xmlui-borderHorizontalColor-HtmlTable, var(--xmlui-borderColor-HtmlTable)))", "borderRightColor-HtmlTable": "var(--xmlui-borderRightColor-HtmlTable, var(--xmlui-borderHorizontalColor-HtmlTable, var(--xmlui-borderColor-HtmlTable)))", "borderVerticalColor-HtmlTable": "var(--xmlui-borderVerticalColor-HtmlTable, var(--xmlui-borderColor-HtmlTable))", "borderTopColor-HtmlTable": "var(--xmlui-borderTopColor-HtmlTable, var(--xmlui-borderVerticalColor-HtmlTable, var(--xmlui-borderColor-HtmlTable)))", "borderBottomColor-HtmlTable": "var(--xmlui-borderBottomColor-HtmlTable, var(--xmlui-borderVerticalColor-HtmlTable, var(--xmlui-borderColor-HtmlTable)))", "radius-start-start-HtmlTable": "var(--xmlui-radius-start-start-HtmlTable, var(--xmlui-borderRadius-HtmlTable))", "radius-start-end-HtmlTable": "var(--xmlui-radius-start-end-HtmlTable, var(--xmlui-borderRadius-HtmlTable))", "radius-end-start-HtmlTable": "var(--xmlui-radius-end-start-HtmlTable, var(--xmlui-borderRadius-HtmlTable))", "radius-end-end-HtmlTable": "var(--xmlui-radius-end-end-HtmlTable, var(--xmlui-borderRadius-HtmlTable))", "padding-HtmlTable": "var(--xmlui-padding-HtmlTable)", "paddingHorizontal-HtmlTable": "var(--xmlui-paddingHorizontal-HtmlTable, var(--xmlui-padding-HtmlTable))", "paddingVertical-HtmlTable": "var(--xmlui-paddingVertical-HtmlTable, var(--xmlui-padding-HtmlTable))", "paddingLeft-HtmlTable": "var(--xmlui-paddingLeft-HtmlTable, var(--xmlui-paddingHorizontal-HtmlTable, var(--xmlui-padding-HtmlTable)))", "paddingRight-HtmlTable": "var(--xmlui-paddingRight-HtmlTable, var(--xmlui-paddingHorizontal-HtmlTable, var(--xmlui-padding-HtmlTable)))", "paddingTop-HtmlTable": "var(--xmlui-paddingTop-HtmlTable, var(--xmlui-paddingVertical-HtmlTable, var(--xmlui-padding-HtmlTable)))", "paddingBottom-HtmlTable": "var(--xmlui-paddingBottom-HtmlTable, var(--xmlui-paddingVertical-HtmlTable, var(--xmlui-padding-HtmlTable)))"}'`, Pv = `'{"backgroundColor-HtmlThead": "var(--xmlui-backgroundColor-HtmlThead)", "color-HtmlThead": "var(--xmlui-color-HtmlThead)", "fontWeight-HtmlThead": "var(--xmlui-fontWeight-HtmlThead)", "fontSize-HtmlThead": "var(--xmlui-fontSize-HtmlThead)", "textTransform-HtmlThead": "var(--xmlui-textTransform-HtmlThead)", "border-HtmlThead": "var(--xmlui-border-HtmlThead)", "borderHorizontal-HtmlThead": "var(--xmlui-borderHorizontal-HtmlThead, var(--xmlui-border-HtmlThead))", "borderVertical-HtmlThead": "var(--xmlui-borderVertical-HtmlThead, var(--xmlui-border-HtmlThead))", "borderLeft-HtmlThead": "var(--xmlui-borderLeft-HtmlThead, var(--xmlui-borderHorizontal-HtmlThead, var(--xmlui-border-HtmlThead)))", "borderRight-HtmlThead": "var(--xmlui-borderRight-HtmlThead, var(--xmlui-borderHorizontal-HtmlThead, var(--xmlui-border-HtmlThead)))", "borderTop-HtmlThead": "var(--xmlui-borderTop-HtmlThead, var(--xmlui-borderVertical-HtmlThead, var(--xmlui-border-HtmlThead)))", "borderBottom-HtmlThead": "var(--xmlui-borderBottom-HtmlThead, var(--xmlui-borderVertical-HtmlThead, var(--xmlui-border-HtmlThead)))", "borderWidth-HtmlThead": "var(--xmlui-borderWidth-HtmlThead)", "borderHorizontalWidth-HtmlThead": "var(--xmlui-borderHorizontalWidth-HtmlThead, var(--xmlui-borderWidth-HtmlThead))", "borderLeftWidth-HtmlThead": "var(--xmlui-borderLeftWidth-HtmlThead, var(--xmlui-borderHorizontalWidth-HtmlThead, var(--xmlui-borderWidth-HtmlThead)))", "borderRightWidth-HtmlThead": "var(--xmlui-borderRightWidth-HtmlThead, var(--xmlui-borderHorizontalWidth-HtmlThead, var(--xmlui-borderWidth-HtmlThead)))", "borderVerticalWidth-HtmlThead": "var(--xmlui-borderVerticalWidth-HtmlThead, var(--xmlui-borderWidth-HtmlThead))", "borderTopWidth-HtmlThead": "var(--xmlui-borderTopWidth-HtmlThead, var(--xmlui-borderVerticalWidth-HtmlThead, var(--xmlui-borderWidth-HtmlThead)))", "borderBottomWidth-HtmlThead": "var(--xmlui-borderBottomWidth-HtmlThead, var(--xmlui-borderVerticalWidth-HtmlThead, var(--xmlui-borderWidth-HtmlThead)))", "borderStyle-HtmlThead": "var(--xmlui-borderStyle-HtmlThead)", "borderHorizontalStyle-HtmlThead": "var(--xmlui-borderHorizontalStyle-HtmlThead, var(--xmlui-borderStyle-HtmlThead))", "borderLeftStyle-HtmlThead": "var(--xmlui-borderLeftStyle-HtmlThead, var(--xmlui-borderHorizontalStyle-HtmlThead, var(--xmlui-borderStyle-HtmlThead)))", "borderRightStyle-HtmlThead": "var(--xmlui-borderRightStyle-HtmlThead, var(--xmlui-borderHorizontalStyle-HtmlThead, var(--xmlui-borderStyle-HtmlThead)))", "borderVerticalStyle-HtmlThead": "var(--xmlui-borderVerticalStyle-HtmlThead, var(--xmlui-borderStyle-HtmlThead))", "borderTopStyle-HtmlThead": "var(--xmlui-borderTopStyle-HtmlThead, var(--xmlui-borderVerticalStyle-HtmlThead, var(--xmlui-borderStyle-HtmlThead)))", "borderBottomStyle-HtmlThead": "var(--xmlui-borderBottomStyle-HtmlThead, var(--xmlui-borderVerticalStyle-HtmlThead, var(--xmlui-borderStyle-HtmlThead)))", "borderColor-HtmlThead": "var(--xmlui-borderColor-HtmlThead)", "borderHorizontalColor-HtmlThead": "var(--xmlui-borderHorizontalColor-HtmlThead, var(--xmlui-borderColor-HtmlThead))", "borderLeftColor-HtmlThead": "var(--xmlui-borderLeftColor-HtmlThead, var(--xmlui-borderHorizontalColor-HtmlThead, var(--xmlui-borderColor-HtmlThead)))", "borderRightColor-HtmlThead": "var(--xmlui-borderRightColor-HtmlThead, var(--xmlui-borderHorizontalColor-HtmlThead, var(--xmlui-borderColor-HtmlThead)))", "borderVerticalColor-HtmlThead": "var(--xmlui-borderVerticalColor-HtmlThead, var(--xmlui-borderColor-HtmlThead))", "borderTopColor-HtmlThead": "var(--xmlui-borderTopColor-HtmlThead, var(--xmlui-borderVerticalColor-HtmlThead, var(--xmlui-borderColor-HtmlThead)))", "borderBottomColor-HtmlThead": "var(--xmlui-borderBottomColor-HtmlThead, var(--xmlui-borderVerticalColor-HtmlThead, var(--xmlui-borderColor-HtmlThead)))", "radius-start-start-HtmlThead": "var(--xmlui-radius-start-start-HtmlThead, var(--xmlui-borderRadius-HtmlThead))", "radius-start-end-HtmlThead": "var(--xmlui-radius-start-end-HtmlThead, var(--xmlui-borderRadius-HtmlThead))", "radius-end-start-HtmlThead": "var(--xmlui-radius-end-start-HtmlThead, var(--xmlui-borderRadius-HtmlThead))", "radius-end-end-HtmlThead": "var(--xmlui-radius-end-end-HtmlThead, var(--xmlui-borderRadius-HtmlThead))", "padding-HtmlThead": "var(--xmlui-padding-HtmlThead)", "paddingHorizontal-HtmlThead": "var(--xmlui-paddingHorizontal-HtmlThead, var(--xmlui-padding-HtmlThead))", "paddingVertical-HtmlThead": "var(--xmlui-paddingVertical-HtmlThead, var(--xmlui-padding-HtmlThead))", "paddingLeft-HtmlThead": "var(--xmlui-paddingLeft-HtmlThead, var(--xmlui-paddingHorizontal-HtmlThead, var(--xmlui-padding-HtmlThead)))", "paddingRight-HtmlThead": "var(--xmlui-paddingRight-HtmlThead, var(--xmlui-paddingHorizontal-HtmlThead, var(--xmlui-padding-HtmlThead)))", "paddingTop-HtmlThead": "var(--xmlui-paddingTop-HtmlThead, var(--xmlui-paddingVertical-HtmlThead, var(--xmlui-padding-HtmlThead)))", "paddingBottom-HtmlThead": "var(--xmlui-paddingBottom-HtmlThead, var(--xmlui-paddingVertical-HtmlThead, var(--xmlui-padding-HtmlThead)))"}'`, Mv = `'{"backgroundColor-HtmlTbody": "var(--xmlui-backgroundColor-HtmlTbody)", "color-HtmlTbody": "var(--xmlui-color-HtmlTbody)", "textAlign-HtmlTbody": "var(--xmlui-textAlign-HtmlTbody)", "verticalAlign-HtmlTbody": "var(--xmlui-verticalAlign-HtmlTbody)", "textTransform-HtmlTbody": "var(--xmlui-textTransform-HtmlTbody)"}'`, Fv = `'{"backgroundColor-HtmlTfoot": "var(--xmlui-backgroundColor-HtmlTfoot)", "color-HtmlTfoot": "var(--xmlui-color-HtmlTfoot)"}'`, qv = `'{"backgroundColor-HtmlTh": "var(--xmlui-backgroundColor-HtmlTh)", "color-HtmlTh": "var(--xmlui-color-HtmlTh)", "fontWeight-HtmlTh": "var(--xmlui-fontWeight-HtmlTh)", "fontSize-HtmlTh": "var(--xmlui-fontSize-HtmlTh)", "backgroundColor-HtmlTh--hover": "var(--xmlui-backgroundColor-HtmlTh--hover)", "border-HtmlTh": "var(--xmlui-border-HtmlTh)", "borderHorizontal-HtmlTh": "var(--xmlui-borderHorizontal-HtmlTh, var(--xmlui-border-HtmlTh))", "borderVertical-HtmlTh": "var(--xmlui-borderVertical-HtmlTh, var(--xmlui-border-HtmlTh))", "borderLeft-HtmlTh": "var(--xmlui-borderLeft-HtmlTh, var(--xmlui-borderHorizontal-HtmlTh, var(--xmlui-border-HtmlTh)))", "borderRight-HtmlTh": "var(--xmlui-borderRight-HtmlTh, var(--xmlui-borderHorizontal-HtmlTh, var(--xmlui-border-HtmlTh)))", "borderTop-HtmlTh": "var(--xmlui-borderTop-HtmlTh, var(--xmlui-borderVertical-HtmlTh, var(--xmlui-border-HtmlTh)))", "borderBottom-HtmlTh": "var(--xmlui-borderBottom-HtmlTh, var(--xmlui-borderVertical-HtmlTh, var(--xmlui-border-HtmlTh)))", "borderWidth-HtmlTh": "var(--xmlui-borderWidth-HtmlTh)", "borderHorizontalWidth-HtmlTh": "var(--xmlui-borderHorizontalWidth-HtmlTh, var(--xmlui-borderWidth-HtmlTh))", "borderLeftWidth-HtmlTh": "var(--xmlui-borderLeftWidth-HtmlTh, var(--xmlui-borderHorizontalWidth-HtmlTh, var(--xmlui-borderWidth-HtmlTh)))", "borderRightWidth-HtmlTh": "var(--xmlui-borderRightWidth-HtmlTh, var(--xmlui-borderHorizontalWidth-HtmlTh, var(--xmlui-borderWidth-HtmlTh)))", "borderVerticalWidth-HtmlTh": "var(--xmlui-borderVerticalWidth-HtmlTh, var(--xmlui-borderWidth-HtmlTh))", "borderTopWidth-HtmlTh": "var(--xmlui-borderTopWidth-HtmlTh, var(--xmlui-borderVerticalWidth-HtmlTh, var(--xmlui-borderWidth-HtmlTh)))", "borderBottomWidth-HtmlTh": "var(--xmlui-borderBottomWidth-HtmlTh, var(--xmlui-borderVerticalWidth-HtmlTh, var(--xmlui-borderWidth-HtmlTh)))", "borderStyle-HtmlTh": "var(--xmlui-borderStyle-HtmlTh)", "borderHorizontalStyle-HtmlTh": "var(--xmlui-borderHorizontalStyle-HtmlTh, var(--xmlui-borderStyle-HtmlTh))", "borderLeftStyle-HtmlTh": "var(--xmlui-borderLeftStyle-HtmlTh, var(--xmlui-borderHorizontalStyle-HtmlTh, var(--xmlui-borderStyle-HtmlTh)))", "borderRightStyle-HtmlTh": "var(--xmlui-borderRightStyle-HtmlTh, var(--xmlui-borderHorizontalStyle-HtmlTh, var(--xmlui-borderStyle-HtmlTh)))", "borderVerticalStyle-HtmlTh": "var(--xmlui-borderVerticalStyle-HtmlTh, var(--xmlui-borderStyle-HtmlTh))", "borderTopStyle-HtmlTh": "var(--xmlui-borderTopStyle-HtmlTh, var(--xmlui-borderVerticalStyle-HtmlTh, var(--xmlui-borderStyle-HtmlTh)))", "borderBottomStyle-HtmlTh": "var(--xmlui-borderBottomStyle-HtmlTh, var(--xmlui-borderVerticalStyle-HtmlTh, var(--xmlui-borderStyle-HtmlTh)))", "borderColor-HtmlTh": "var(--xmlui-borderColor-HtmlTh)", "borderHorizontalColor-HtmlTh": "var(--xmlui-borderHorizontalColor-HtmlTh, var(--xmlui-borderColor-HtmlTh))", "borderLeftColor-HtmlTh": "var(--xmlui-borderLeftColor-HtmlTh, var(--xmlui-borderHorizontalColor-HtmlTh, var(--xmlui-borderColor-HtmlTh)))", "borderRightColor-HtmlTh": "var(--xmlui-borderRightColor-HtmlTh, var(--xmlui-borderHorizontalColor-HtmlTh, var(--xmlui-borderColor-HtmlTh)))", "borderVerticalColor-HtmlTh": "var(--xmlui-borderVerticalColor-HtmlTh, var(--xmlui-borderColor-HtmlTh))", "borderTopColor-HtmlTh": "var(--xmlui-borderTopColor-HtmlTh, var(--xmlui-borderVerticalColor-HtmlTh, var(--xmlui-borderColor-HtmlTh)))", "borderBottomColor-HtmlTh": "var(--xmlui-borderBottomColor-HtmlTh, var(--xmlui-borderVerticalColor-HtmlTh, var(--xmlui-borderColor-HtmlTh)))", "radius-start-start-HtmlTh": "var(--xmlui-radius-start-start-HtmlTh, var(--xmlui-borderRadius-HtmlTh))", "radius-start-end-HtmlTh": "var(--xmlui-radius-start-end-HtmlTh, var(--xmlui-borderRadius-HtmlTh))", "radius-end-start-HtmlTh": "var(--xmlui-radius-end-start-HtmlTh, var(--xmlui-borderRadius-HtmlTh))", "radius-end-end-HtmlTh": "var(--xmlui-radius-end-end-HtmlTh, var(--xmlui-borderRadius-HtmlTh))", "padding-HtmlTh": "var(--xmlui-padding-HtmlTh)", "paddingHorizontal-HtmlTh": "var(--xmlui-paddingHorizontal-HtmlTh, var(--xmlui-padding-HtmlTh))", "paddingVertical-HtmlTh": "var(--xmlui-paddingVertical-HtmlTh, var(--xmlui-padding-HtmlTh))", "paddingLeft-HtmlTh": "var(--xmlui-paddingLeft-HtmlTh, var(--xmlui-paddingHorizontal-HtmlTh, var(--xmlui-padding-HtmlTh)))", "paddingRight-HtmlTh": "var(--xmlui-paddingRight-HtmlTh, var(--xmlui-paddingHorizontal-HtmlTh, var(--xmlui-padding-HtmlTh)))", "paddingTop-HtmlTh": "var(--xmlui-paddingTop-HtmlTh, var(--xmlui-paddingVertical-HtmlTh, var(--xmlui-padding-HtmlTh)))", "paddingBottom-HtmlTh": "var(--xmlui-paddingBottom-HtmlTh, var(--xmlui-paddingVertical-HtmlTh, var(--xmlui-padding-HtmlTh)))"}'`, Uv = `'{"backgroundColor-HtmlTr": "var(--xmlui-backgroundColor-HtmlTr)", "backgroundColor-HtmlTr--hover": "var(--xmlui-backgroundColor-HtmlTr--hover)", "backgroundColor-even-HtmlTr": "var(--xmlui-backgroundColor-even-HtmlTr)", "color-HtmlTr": "var(--xmlui-color-HtmlTr)", "color-HtmlTr--hover": "var(--xmlui-color-HtmlTr--hover)", "fontSize-HtmlTr": "var(--xmlui-fontSize-HtmlTr)", "fontWeight-HtmlTr": "var(--xmlui-fontWeight-HtmlTr)", "border-HtmlTr": "var(--xmlui-border-HtmlTr)", "borderHorizontal-HtmlTr": "var(--xmlui-borderHorizontal-HtmlTr, var(--xmlui-border-HtmlTr))", "borderVertical-HtmlTr": "var(--xmlui-borderVertical-HtmlTr, var(--xmlui-border-HtmlTr))", "borderLeft-HtmlTr": "var(--xmlui-borderLeft-HtmlTr, var(--xmlui-borderHorizontal-HtmlTr, var(--xmlui-border-HtmlTr)))", "borderRight-HtmlTr": "var(--xmlui-borderRight-HtmlTr, var(--xmlui-borderHorizontal-HtmlTr, var(--xmlui-border-HtmlTr)))", "borderTop-HtmlTr": "var(--xmlui-borderTop-HtmlTr, var(--xmlui-borderVertical-HtmlTr, var(--xmlui-border-HtmlTr)))", "borderBottom-HtmlTr": "var(--xmlui-borderBottom-HtmlTr, var(--xmlui-borderVertical-HtmlTr, var(--xmlui-border-HtmlTr)))", "borderWidth-HtmlTr": "var(--xmlui-borderWidth-HtmlTr)", "borderHorizontalWidth-HtmlTr": "var(--xmlui-borderHorizontalWidth-HtmlTr, var(--xmlui-borderWidth-HtmlTr))", "borderLeftWidth-HtmlTr": "var(--xmlui-borderLeftWidth-HtmlTr, var(--xmlui-borderHorizontalWidth-HtmlTr, var(--xmlui-borderWidth-HtmlTr)))", "borderRightWidth-HtmlTr": "var(--xmlui-borderRightWidth-HtmlTr, var(--xmlui-borderHorizontalWidth-HtmlTr, var(--xmlui-borderWidth-HtmlTr)))", "borderVerticalWidth-HtmlTr": "var(--xmlui-borderVerticalWidth-HtmlTr, var(--xmlui-borderWidth-HtmlTr))", "borderTopWidth-HtmlTr": "var(--xmlui-borderTopWidth-HtmlTr, var(--xmlui-borderVerticalWidth-HtmlTr, var(--xmlui-borderWidth-HtmlTr)))", "borderBottomWidth-HtmlTr": "var(--xmlui-borderBottomWidth-HtmlTr, var(--xmlui-borderVerticalWidth-HtmlTr, var(--xmlui-borderWidth-HtmlTr)))", "borderStyle-HtmlTr": "var(--xmlui-borderStyle-HtmlTr)", "borderHorizontalStyle-HtmlTr": "var(--xmlui-borderHorizontalStyle-HtmlTr, var(--xmlui-borderStyle-HtmlTr))", "borderLeftStyle-HtmlTr": "var(--xmlui-borderLeftStyle-HtmlTr, var(--xmlui-borderHorizontalStyle-HtmlTr, var(--xmlui-borderStyle-HtmlTr)))", "borderRightStyle-HtmlTr": "var(--xmlui-borderRightStyle-HtmlTr, var(--xmlui-borderHorizontalStyle-HtmlTr, var(--xmlui-borderStyle-HtmlTr)))", "borderVerticalStyle-HtmlTr": "var(--xmlui-borderVerticalStyle-HtmlTr, var(--xmlui-borderStyle-HtmlTr))", "borderTopStyle-HtmlTr": "var(--xmlui-borderTopStyle-HtmlTr, var(--xmlui-borderVerticalStyle-HtmlTr, var(--xmlui-borderStyle-HtmlTr)))", "borderBottomStyle-HtmlTr": "var(--xmlui-borderBottomStyle-HtmlTr, var(--xmlui-borderVerticalStyle-HtmlTr, var(--xmlui-borderStyle-HtmlTr)))", "borderColor-HtmlTr": "var(--xmlui-borderColor-HtmlTr)", "borderHorizontalColor-HtmlTr": "var(--xmlui-borderHorizontalColor-HtmlTr, var(--xmlui-borderColor-HtmlTr))", "borderLeftColor-HtmlTr": "var(--xmlui-borderLeftColor-HtmlTr, var(--xmlui-borderHorizontalColor-HtmlTr, var(--xmlui-borderColor-HtmlTr)))", "borderRightColor-HtmlTr": "var(--xmlui-borderRightColor-HtmlTr, var(--xmlui-borderHorizontalColor-HtmlTr, var(--xmlui-borderColor-HtmlTr)))", "borderVerticalColor-HtmlTr": "var(--xmlui-borderVerticalColor-HtmlTr, var(--xmlui-borderColor-HtmlTr))", "borderTopColor-HtmlTr": "var(--xmlui-borderTopColor-HtmlTr, var(--xmlui-borderVerticalColor-HtmlTr, var(--xmlui-borderColor-HtmlTr)))", "borderBottomColor-HtmlTr": "var(--xmlui-borderBottomColor-HtmlTr, var(--xmlui-borderVerticalColor-HtmlTr, var(--xmlui-borderColor-HtmlTr)))", "radius-start-start-HtmlTr": "var(--xmlui-radius-start-start-HtmlTr, var(--xmlui-borderRadius-HtmlTr))", "radius-start-end-HtmlTr": "var(--xmlui-radius-start-end-HtmlTr, var(--xmlui-borderRadius-HtmlTr))", "radius-end-start-HtmlTr": "var(--xmlui-radius-end-start-HtmlTr, var(--xmlui-borderRadius-HtmlTr))", "radius-end-end-HtmlTr": "var(--xmlui-radius-end-end-HtmlTr, var(--xmlui-borderRadius-HtmlTr))"}'`, Gv = `'{"backgroundColor-HtmlTd": "var(--xmlui-backgroundColor-HtmlTd)", "text-align-HtmlTd": "var(--xmlui-text-align-HtmlTd)", "verticalAlign-HtmlTd": "var(--xmlui-verticalAlign-HtmlTd)", "fontSize-HtmlTd": "var(--xmlui-fontSize-HtmlTd)", "fontWeight-HtmlTd": "var(--xmlui-fontWeight-HtmlTd)", "border-HtmlTd": "var(--xmlui-border-HtmlTd)", "borderHorizontal-HtmlTd": "var(--xmlui-borderHorizontal-HtmlTd, var(--xmlui-border-HtmlTd))", "borderVertical-HtmlTd": "var(--xmlui-borderVertical-HtmlTd, var(--xmlui-border-HtmlTd))", "borderLeft-HtmlTd": "var(--xmlui-borderLeft-HtmlTd, var(--xmlui-borderHorizontal-HtmlTd, var(--xmlui-border-HtmlTd)))", "borderRight-HtmlTd": "var(--xmlui-borderRight-HtmlTd, var(--xmlui-borderHorizontal-HtmlTd, var(--xmlui-border-HtmlTd)))", "borderTop-HtmlTd": "var(--xmlui-borderTop-HtmlTd, var(--xmlui-borderVertical-HtmlTd, var(--xmlui-border-HtmlTd)))", "borderBottom-HtmlTd": "var(--xmlui-borderBottom-HtmlTd, var(--xmlui-borderVertical-HtmlTd, var(--xmlui-border-HtmlTd)))", "borderWidth-HtmlTd": "var(--xmlui-borderWidth-HtmlTd)", "borderHorizontalWidth-HtmlTd": "var(--xmlui-borderHorizontalWidth-HtmlTd, var(--xmlui-borderWidth-HtmlTd))", "borderLeftWidth-HtmlTd": "var(--xmlui-borderLeftWidth-HtmlTd, var(--xmlui-borderHorizontalWidth-HtmlTd, var(--xmlui-borderWidth-HtmlTd)))", "borderRightWidth-HtmlTd": "var(--xmlui-borderRightWidth-HtmlTd, var(--xmlui-borderHorizontalWidth-HtmlTd, var(--xmlui-borderWidth-HtmlTd)))", "borderVerticalWidth-HtmlTd": "var(--xmlui-borderVerticalWidth-HtmlTd, var(--xmlui-borderWidth-HtmlTd))", "borderTopWidth-HtmlTd": "var(--xmlui-borderTopWidth-HtmlTd, var(--xmlui-borderVerticalWidth-HtmlTd, var(--xmlui-borderWidth-HtmlTd)))", "borderBottomWidth-HtmlTd": "var(--xmlui-borderBottomWidth-HtmlTd, var(--xmlui-borderVerticalWidth-HtmlTd, var(--xmlui-borderWidth-HtmlTd)))", "borderStyle-HtmlTd": "var(--xmlui-borderStyle-HtmlTd)", "borderHorizontalStyle-HtmlTd": "var(--xmlui-borderHorizontalStyle-HtmlTd, var(--xmlui-borderStyle-HtmlTd))", "borderLeftStyle-HtmlTd": "var(--xmlui-borderLeftStyle-HtmlTd, var(--xmlui-borderHorizontalStyle-HtmlTd, var(--xmlui-borderStyle-HtmlTd)))", "borderRightStyle-HtmlTd": "var(--xmlui-borderRightStyle-HtmlTd, var(--xmlui-borderHorizontalStyle-HtmlTd, var(--xmlui-borderStyle-HtmlTd)))", "borderVerticalStyle-HtmlTd": "var(--xmlui-borderVerticalStyle-HtmlTd, var(--xmlui-borderStyle-HtmlTd))", "borderTopStyle-HtmlTd": "var(--xmlui-borderTopStyle-HtmlTd, var(--xmlui-borderVerticalStyle-HtmlTd, var(--xmlui-borderStyle-HtmlTd)))", "borderBottomStyle-HtmlTd": "var(--xmlui-borderBottomStyle-HtmlTd, var(--xmlui-borderVerticalStyle-HtmlTd, var(--xmlui-borderStyle-HtmlTd)))", "borderColor-HtmlTd": "var(--xmlui-borderColor-HtmlTd)", "borderHorizontalColor-HtmlTd": "var(--xmlui-borderHorizontalColor-HtmlTd, var(--xmlui-borderColor-HtmlTd))", "borderLeftColor-HtmlTd": "var(--xmlui-borderLeftColor-HtmlTd, var(--xmlui-borderHorizontalColor-HtmlTd, var(--xmlui-borderColor-HtmlTd)))", "borderRightColor-HtmlTd": "var(--xmlui-borderRightColor-HtmlTd, var(--xmlui-borderHorizontalColor-HtmlTd, var(--xmlui-borderColor-HtmlTd)))", "borderVerticalColor-HtmlTd": "var(--xmlui-borderVerticalColor-HtmlTd, var(--xmlui-borderColor-HtmlTd))", "borderTopColor-HtmlTd": "var(--xmlui-borderTopColor-HtmlTd, var(--xmlui-borderVerticalColor-HtmlTd, var(--xmlui-borderColor-HtmlTd)))", "borderBottomColor-HtmlTd": "var(--xmlui-borderBottomColor-HtmlTd, var(--xmlui-borderVerticalColor-HtmlTd, var(--xmlui-borderColor-HtmlTd)))", "radius-start-start-HtmlTd": "var(--xmlui-radius-start-start-HtmlTd, var(--xmlui-borderRadius-HtmlTd))", "radius-start-end-HtmlTd": "var(--xmlui-radius-start-end-HtmlTd, var(--xmlui-borderRadius-HtmlTd))", "radius-end-start-HtmlTd": "var(--xmlui-radius-end-start-HtmlTd, var(--xmlui-borderRadius-HtmlTd))", "radius-end-end-HtmlTd": "var(--xmlui-radius-end-end-HtmlTd, var(--xmlui-borderRadius-HtmlTd))", "padding-HtmlTd": "var(--xmlui-padding-HtmlTd)", "paddingHorizontal-HtmlTd": "var(--xmlui-paddingHorizontal-HtmlTd, var(--xmlui-padding-HtmlTd))", "paddingVertical-HtmlTd": "var(--xmlui-paddingVertical-HtmlTd, var(--xmlui-padding-HtmlTd))", "paddingLeft-HtmlTd": "var(--xmlui-paddingLeft-HtmlTd, var(--xmlui-paddingHorizontal-HtmlTd, var(--xmlui-padding-HtmlTd)))", "paddingRight-HtmlTd": "var(--xmlui-paddingRight-HtmlTd, var(--xmlui-paddingHorizontal-HtmlTd, var(--xmlui-padding-HtmlTd)))", "paddingTop-HtmlTd": "var(--xmlui-paddingTop-HtmlTd, var(--xmlui-paddingVertical-HtmlTd, var(--xmlui-padding-HtmlTd)))", "paddingBottom-HtmlTd": "var(--xmlui-paddingBottom-HtmlTd, var(--xmlui-paddingVertical-HtmlTd, var(--xmlui-padding-HtmlTd)))"}'`, Yv = `'{"marginTop-HtmlOl": "var(--xmlui-marginTop-HtmlOl)", "marginBottom-HtmlOl": "var(--xmlui-marginBottom-HtmlOl)", "marginTop-HtmlUl": "var(--xmlui-marginTop-HtmlUl)", "marginBottom-HtmlUl": "var(--xmlui-marginBottom-HtmlUl)"}'`, Xv = `'{"marginTop-HtmlHeading": "var(--xmlui-marginTop-HtmlHeading)", "marginBottom-HtmlHeading": "var(--xmlui-marginBottom-HtmlHeading)"}'`, tr = {
  themeVarsTable: Dv,
  themeVarsThead: Pv,
  themeVarsTbody: Mv,
  themeVarsTfoot: Fv,
  themeVarsTh: qv,
  themeVarsTr: Uv,
  themeVarsTd: Gv,
  themeVarsList: Yv,
  themeVarsHeading: Xv
}, Qv = "Markdown", Zv = C({
  description: `\`${Qv}\` displays plain text styled using markdown syntax.`,
  themeVars: Z(Ev.themeVars),
  props: {
    content: u("This property sets the markdown content to display."),
    removeIndents: {
      description: "This boolean property specifies whether leading indents should be removed from the markdown content. If set to `true`, the shortest indent found at the start of the content lines is removed from the beginning of every line.",
      valueType: "boolean",
      defaultValue: !1
    }
  },
  defaultThemeVars: {
    "borderColor-HorizontalRule": "$borderColor",
    "borderWidth-HorizontalRule": "1px",
    "borderStyle-HorizontalRule": "solid",
    "accent-Blockquote": "$color-primary",
    "padding-Blockquote": "$space-2 $space-6",
    "margin-Blockquote": "$space-2",
    "paddingLeft-UnorderedList": "$space-6",
    "paddingLeft-OrderedList": "$space-6",
    "paddingLeft-ListItem": "$space-1",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), xr = "ModalDialog", jv = C({
  description: `The \`${xr}\` component defines a modal dialog UI element that can be displayed over the existing UI - triggered by some action.`,
  props: {
    fullScreen: {
      description: "Toggles whether the dialog encompasses the whole UI (`true`) or not and has a minimum width and height (`false`).",
      valueType: "boolean",
      defaultValue: !1
    },
    title: u("Provides a prestyled heading to display the intent of the dialog."),
    closeButtonVisible: {
      description: "Shows (`true`) or hides (`false`) the visibility of the close button on the dialog.",
      valueType: "boolean",
      defaultValue: !0
    }
  },
  events: {
    open: u(
      `This event is fired when the \`${xr}\` is opened either via a \`when\` or an imperative API call (\`open()\`).`
    ),
    close: u(
      `This event is fired when the close button is pressed or the user clicks outside the \`${xr}\`.`
    )
  },
  apis: {
    close: u(
      `This method is used to close the \`${xr}\`. Invoke it using \`modalId.close()\` where \`modalId\` refers to a \`ModalDialog\` component.`
    ),
    open: u(
      "This method imperatively opens the modal dialog. You can pass an arbitrary number of parameters to the method. In the `ModalDialog` instance, you can access those with the `$paramq` and `$params` context values."
    )
  },
  contextVars: {
    $param: u(
      "This value represents the first parameters passed to the `open()` method to display the modal dialog."
    ),
    $params: u(
      "This value represents the array of parameters passed to the `open()` method. You can use `$params[0]` to access the first and `$params[1]` to access the second (and so on) parameters. `$param` is the same as `$params[0]`."
    )
  },
  themeVars: Z(xt.themeVars),
  defaultThemeVars: {
    ...za(xr, { all: "$space-7" }),
    [`backgroundColor-${xr}`]: "$backgroundColor-primary",
    [`backgroundColor-overlay-${xr}`]: "$backgroundColor-overlay",
    [`color-${xr}`]: "$textColor-primary",
    [`borderRadius-${xr}`]: "$borderRadius",
    [`fontFamily-${xr}`]: "$fontFamily",
    [`maxWidth-${xr}`]: "450px",
    [`marginBottom-title-${xr}`]: "0",
    dark: {
      [`backgroundColor-${xr}`]: "$backgroundColor-primary"
    }
  }
}), Jv = `'{"backgroundColor-dropdown-NavGroup": "var(--xmlui-backgroundColor-dropdown-NavGroup)", "boxShadow-dropdown-NavGroup": "var(--xmlui-boxShadow-dropdown-NavGroup)", "borderRadius-dropdown-NavGroup": "var(--xmlui-borderRadius-dropdown-NavGroup)"}'`, Kv = {
  themeVars: Jv
}, Po = "NavGroup", eg = C({
  description: "The `NavGroup` component is a container for grouping related navigation targets (`NavLink` components). It can be displayed as a submenu in the App's UI.",
  props: {
    label: Fe(),
    icon: u(`This property defines an optional icon to display along with the \`${Po}\` label.`),
    to: u("This property defines an optional navigation link.")
  },
  themeVars: Z(Kv.themeVars),
  defaultThemeVars: {
    [`backgroundColor-dropdown-${Po}`]: "$backgroundColor-primary",
    [`borderRadius-dropdown-${Po}`]: "$borderRadius",
    [`boxShadow-dropdown-${Po}`]: "$boxShadow-spread"
  }
}), Ie = "NavLink", rg = C({
  description: `The \`${Ie}\` component defines a navigation target (app navigation menu item) within the app; it is associated with a particular in-app navigation target (or an external link).`,
  props: {
    to: u("This property defines the URL of the link."),
    enabled: Qe(),
    active: {
      description: "This property indicates if the particular navigation is an active link. An active link has a particular visual appearance, provided its [`displayActive`](#displayactive) property is set to `true`.",
      valueType: "boolean",
      defaultValue: !1
    },
    target: {
      description: "This property specifies how to open the clicked link.",
      availableValues: Vn,
      type: "string",
      defaultValue: "_self"
    },
    label: Fe(),
    vertical: {
      description: `This property sets how the active status is displayed on the \`${Ie}\` component. If set to true, the indicator is displayed on the side which lends itself to a vertically aligned navigation menu.`,
      valueType: "boolean",
      defaultValue: !1
    },
    displayActive: {
      description: "This Boolean property indicates if the active state of a link should have a visual indication. Setting it to `false` removes the visual indication of an active link.",
      valueType: "boolean",
      defaultValue: !0
    },
    icon: u(
      "This property allows you to add an icon (specify the icon's name) to the navigation link."
    )
  },
  events: {
    click: po(Ie)
  },
  themeVars: Z(Sc.themeVars),
  themeVarDescriptions: {
    [`color-indicator-${Ie}`]: "Provides the following states: `--hover`, `--active`, `--pressed`"
  },
  defaultThemeVars: {
    [`border-${Ie}`]: "0px solid $borderColor",
    [`borderRadius-${Ie}`]: "$borderRadius",
    [`backgroundColor-${Ie}`]: "transparent",
    [`paddingHorizontal-${Ie}`]: "$space-4",
    [`paddingVertical-${Ie}`]: "$space-2",
    [`fontSize-${Ie}`]: "$fontSize-small",
    [`fontWeight-${Ie}`]: "$fontWeight-normal",
    [`fontFamily-${Ie}`]: "$fontFamily",
    [`color-${Ie}`]: "$textColor-primary",
    [`fontWeight-${Ie}--pressed`]: "$fontWeight-normal",
    [`thickness-indicator-${Ie}`]: "$space-0_5",
    [`outlineColor-${Ie}--focus`]: "$outlineColor--focus",
    [`outlineWidth-${Ie}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${Ie}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${Ie}--focus`]: "-1px",
    [`borderRadius-indicator-${Ie}`]: "$borderRadius",
    light: {
      [`color-icon-${Ie}`]: "$color-surface-500",
      [`color-indicator-${Ie}--active`]: "$color-primary-500",
      [`color-indicator-${Ie}--pressed`]: "$color-primary-500",
      [`color-indicator-${Ie}--hover`]: "$color-primary-600"
    },
    dark: {
      [`color-indicator-${Ie}--active`]: "$color-primary-500",
      [`color-indicator-${Ie}--pressed`]: "$color-primary-500",
      [`color-indicator-${Ie}--hover`]: "$color-primary-400"
    }
  }
}), tt = "NavPanel", tg = C({
  description: `\`${tt}\` is a placeholder within \`App\` to define the app's navigation (menu) structure.`,
  props: {
    logoTemplate: Re(
      "This property defines the logo template to display in the navigation panel with the `vertical` and `vertical-sticky` layout."
    )
  },
  themeVars: Z(Bc.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${tt}`]: "transparent",
    [`border-${tt}`]: "0px solid $borderColor",
    [`paddingHorizontal-${tt}`]: "$space-4",
    [`paddingVertical-logo-${tt}`]: "$space-4",
    [`paddingHorizontal-logo-${tt}`]: "$space-4",
    [`marginBottom-logo-${tt}`]: "$space-4",
    light: {
      [`boxShadow-${tt}-vertical`]: "4px 0 4px 0 rgb(0 0 0 / 10%)"
    },
    dark: {
      [`boxShadow-${tt}-vertical`]: "4px 0 6px 0 rgba(0, 0, 0, 0.2)"
    }
  }
}), og = `'{"padding-NoResult": "var(--xmlui-padding-NoResult)", "paddingHorizontal-NoResult": "var(--xmlui-paddingHorizontal-NoResult, var(--xmlui-padding-NoResult))", "paddingVertical-NoResult": "var(--xmlui-paddingVertical-NoResult, var(--xmlui-padding-NoResult))", "paddingLeft-NoResult": "var(--xmlui-paddingLeft-NoResult, var(--xmlui-paddingHorizontal-NoResult, var(--xmlui-padding-NoResult)))", "paddingRight-NoResult": "var(--xmlui-paddingRight-NoResult, var(--xmlui-paddingHorizontal-NoResult, var(--xmlui-padding-NoResult)))", "paddingTop-NoResult": "var(--xmlui-paddingTop-NoResult, var(--xmlui-paddingVertical-NoResult, var(--xmlui-padding-NoResult)))", "paddingBottom-NoResult": "var(--xmlui-paddingBottom-NoResult, var(--xmlui-paddingVertical-NoResult, var(--xmlui-padding-NoResult)))", "border-NoResult": "var(--xmlui-border-NoResult)", "borderHorizontal-NoResult": "var(--xmlui-borderHorizontal-NoResult, var(--xmlui-border-NoResult))", "borderVertical-NoResult": "var(--xmlui-borderVertical-NoResult, var(--xmlui-border-NoResult))", "borderLeft-NoResult": "var(--xmlui-borderLeft-NoResult, var(--xmlui-borderHorizontal-NoResult, var(--xmlui-border-NoResult)))", "borderRight-NoResult": "var(--xmlui-borderRight-NoResult, var(--xmlui-borderHorizontal-NoResult, var(--xmlui-border-NoResult)))", "borderTop-NoResult": "var(--xmlui-borderTop-NoResult, var(--xmlui-borderVertical-NoResult, var(--xmlui-border-NoResult)))", "borderBottom-NoResult": "var(--xmlui-borderBottom-NoResult, var(--xmlui-borderVertical-NoResult, var(--xmlui-border-NoResult)))", "borderWidth-NoResult": "var(--xmlui-borderWidth-NoResult)", "borderHorizontalWidth-NoResult": "var(--xmlui-borderHorizontalWidth-NoResult, var(--xmlui-borderWidth-NoResult))", "borderLeftWidth-NoResult": "var(--xmlui-borderLeftWidth-NoResult, var(--xmlui-borderHorizontalWidth-NoResult, var(--xmlui-borderWidth-NoResult)))", "borderRightWidth-NoResult": "var(--xmlui-borderRightWidth-NoResult, var(--xmlui-borderHorizontalWidth-NoResult, var(--xmlui-borderWidth-NoResult)))", "borderVerticalWidth-NoResult": "var(--xmlui-borderVerticalWidth-NoResult, var(--xmlui-borderWidth-NoResult))", "borderTopWidth-NoResult": "var(--xmlui-borderTopWidth-NoResult, var(--xmlui-borderVerticalWidth-NoResult, var(--xmlui-borderWidth-NoResult)))", "borderBottomWidth-NoResult": "var(--xmlui-borderBottomWidth-NoResult, var(--xmlui-borderVerticalWidth-NoResult, var(--xmlui-borderWidth-NoResult)))", "borderStyle-NoResult": "var(--xmlui-borderStyle-NoResult)", "borderHorizontalStyle-NoResult": "var(--xmlui-borderHorizontalStyle-NoResult, var(--xmlui-borderStyle-NoResult))", "borderLeftStyle-NoResult": "var(--xmlui-borderLeftStyle-NoResult, var(--xmlui-borderHorizontalStyle-NoResult, var(--xmlui-borderStyle-NoResult)))", "borderRightStyle-NoResult": "var(--xmlui-borderRightStyle-NoResult, var(--xmlui-borderHorizontalStyle-NoResult, var(--xmlui-borderStyle-NoResult)))", "borderVerticalStyle-NoResult": "var(--xmlui-borderVerticalStyle-NoResult, var(--xmlui-borderStyle-NoResult))", "borderTopStyle-NoResult": "var(--xmlui-borderTopStyle-NoResult, var(--xmlui-borderVerticalStyle-NoResult, var(--xmlui-borderStyle-NoResult)))", "borderBottomStyle-NoResult": "var(--xmlui-borderBottomStyle-NoResult, var(--xmlui-borderVerticalStyle-NoResult, var(--xmlui-borderStyle-NoResult)))", "borderColor-NoResult": "var(--xmlui-borderColor-NoResult)", "borderHorizontalColor-NoResult": "var(--xmlui-borderHorizontalColor-NoResult, var(--xmlui-borderColor-NoResult))", "borderLeftColor-NoResult": "var(--xmlui-borderLeftColor-NoResult, var(--xmlui-borderHorizontalColor-NoResult, var(--xmlui-borderColor-NoResult)))", "borderRightColor-NoResult": "var(--xmlui-borderRightColor-NoResult, var(--xmlui-borderHorizontalColor-NoResult, var(--xmlui-borderColor-NoResult)))", "borderVerticalColor-NoResult": "var(--xmlui-borderVerticalColor-NoResult, var(--xmlui-borderColor-NoResult))", "borderTopColor-NoResult": "var(--xmlui-borderTopColor-NoResult, var(--xmlui-borderVerticalColor-NoResult, var(--xmlui-borderColor-NoResult)))", "borderBottomColor-NoResult": "var(--xmlui-borderBottomColor-NoResult, var(--xmlui-borderVerticalColor-NoResult, var(--xmlui-borderColor-NoResult)))", "radius-start-start-NoResult": "var(--xmlui-radius-start-start-NoResult, var(--xmlui-borderRadius-NoResult))", "radius-start-end-NoResult": "var(--xmlui-radius-start-end-NoResult, var(--xmlui-borderRadius-NoResult))", "radius-end-start-NoResult": "var(--xmlui-radius-end-start-NoResult, var(--xmlui-borderRadius-NoResult))", "radius-end-end-NoResult": "var(--xmlui-radius-end-end-NoResult, var(--xmlui-borderRadius-NoResult))", "gap-icon-NoResult": "var(--xmlui-gap-icon-NoResult)", "size-icon-NoResult": "var(--xmlui-size-icon-NoResult)"}'`, ag = {
  themeVars: og
}, yo = "NoResult", ig = C({
  description: `\`${yo}\` is a component that displays a visual indication that some data query (search) resulted in no (zero) items.`,
  props: {
    label: Fe(),
    icon: u("This property defines the icon to display with the component."),
    hideIcon: {
      description: "This boolean property indicates if the icon should be hidden.",
      valueType: "boolean",
      defaultValue: "false"
    }
  },
  themeVars: Z(ag.themeVars),
  defaultThemeVars: {
    [`border-${yo}`]: "0px solid $borderColor",
    [`paddingVertical-${yo}`]: "$space-2",
    [`gap-icon-${yo}`]: "$space-2",
    [`size-icon-${yo}`]: "$space-8",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), Lt = "NumberBox", ng = C({
  status: "experimental",
  description: `A \`${Lt}\` component allows users to input numeric values: either integer or floating point numbers. It also accepts empty values, where the stored value will be of type \`null\`.`,
  props: {
    placeholder: Vt(),
    initialValue: Cr(),
    label: Fe(),
    labelPosition: Dr("top"),
    labelWidth: jr(Lt),
    labelBreak: Jr(Lt),
    maxLength: _o(),
    autoFocus: rr(),
    required: Ar(),
    readOnly: Lr(),
    enabled: Qe(),
    validationStatus: _r(),
    startText: Ka(),
    startIcon: ei(),
    endText: ri(),
    endIcon: ti(),
    hasSpinBox: {
      description: "This boolean prop shows (`true`) or hides (`false`) the spinner buttons for the input field.",
      valueType: "boolean",
      defaultValue: !0
    },
    step: {
      description: "This prop governs how big the step when clicking on the spinner of the field.",
      valueType: "number",
      defaultValue: 1
    },
    integersOnly: {
      description: "This boolean property signs whether the input field accepts integers only (`true`) or not (`false`).",
      valueType: "boolean",
      defaultValue: !1
    },
    zeroOrPositive: {
      description: "This boolean property determines whether the input value can only be 0 or positive numbers (`true`) or also negative (`false`).",
      valueType: "boolean",
      defaultValue: !1
    },
    minValue: u(
      "The minimum value the input field allows. Can be a float or an integer if [`integersOnly`](#integersonly) is set to `false`, otherwise it can only be an integer."
    ),
    maxValue: u(
      "The maximum value the input field allows. Can be a float or an integer if [`integersOnly`](#integersonly) is set to `false`, otherwise it can only be an integer."
    )
  },
  events: {
    gotFocus: Tr(Lt),
    lostFocus: yr(Lt),
    didChange: er(Lt)
  },
  apis: {
    focus: et(Lt),
    value: ia(),
    setValue: Kr()
  },
  themeVars: Z(je.themeVars)
}), lg = `'{"border-OffCanvas": "var(--xmlui-border-OffCanvas)", "borderHorizontal-OffCanvas": "var(--xmlui-borderHorizontal-OffCanvas, var(--xmlui-border-OffCanvas))", "borderVertical-OffCanvas": "var(--xmlui-borderVertical-OffCanvas, var(--xmlui-border-OffCanvas))", "borderLeft-OffCanvas": "var(--xmlui-borderLeft-OffCanvas, var(--xmlui-borderHorizontal-OffCanvas, var(--xmlui-border-OffCanvas)))", "borderRight-OffCanvas": "var(--xmlui-borderRight-OffCanvas, var(--xmlui-borderHorizontal-OffCanvas, var(--xmlui-border-OffCanvas)))", "borderTop-OffCanvas": "var(--xmlui-borderTop-OffCanvas, var(--xmlui-borderVertical-OffCanvas, var(--xmlui-border-OffCanvas)))", "borderBottom-OffCanvas": "var(--xmlui-borderBottom-OffCanvas, var(--xmlui-borderVertical-OffCanvas, var(--xmlui-border-OffCanvas)))", "borderWidth-OffCanvas": "var(--xmlui-borderWidth-OffCanvas)", "borderHorizontalWidth-OffCanvas": "var(--xmlui-borderHorizontalWidth-OffCanvas, var(--xmlui-borderWidth-OffCanvas))", "borderLeftWidth-OffCanvas": "var(--xmlui-borderLeftWidth-OffCanvas, var(--xmlui-borderHorizontalWidth-OffCanvas, var(--xmlui-borderWidth-OffCanvas)))", "borderRightWidth-OffCanvas": "var(--xmlui-borderRightWidth-OffCanvas, var(--xmlui-borderHorizontalWidth-OffCanvas, var(--xmlui-borderWidth-OffCanvas)))", "borderVerticalWidth-OffCanvas": "var(--xmlui-borderVerticalWidth-OffCanvas, var(--xmlui-borderWidth-OffCanvas))", "borderTopWidth-OffCanvas": "var(--xmlui-borderTopWidth-OffCanvas, var(--xmlui-borderVerticalWidth-OffCanvas, var(--xmlui-borderWidth-OffCanvas)))", "borderBottomWidth-OffCanvas": "var(--xmlui-borderBottomWidth-OffCanvas, var(--xmlui-borderVerticalWidth-OffCanvas, var(--xmlui-borderWidth-OffCanvas)))", "borderStyle-OffCanvas": "var(--xmlui-borderStyle-OffCanvas)", "borderHorizontalStyle-OffCanvas": "var(--xmlui-borderHorizontalStyle-OffCanvas, var(--xmlui-borderStyle-OffCanvas))", "borderLeftStyle-OffCanvas": "var(--xmlui-borderLeftStyle-OffCanvas, var(--xmlui-borderHorizontalStyle-OffCanvas, var(--xmlui-borderStyle-OffCanvas)))", "borderRightStyle-OffCanvas": "var(--xmlui-borderRightStyle-OffCanvas, var(--xmlui-borderHorizontalStyle-OffCanvas, var(--xmlui-borderStyle-OffCanvas)))", "borderVerticalStyle-OffCanvas": "var(--xmlui-borderVerticalStyle-OffCanvas, var(--xmlui-borderStyle-OffCanvas))", "borderTopStyle-OffCanvas": "var(--xmlui-borderTopStyle-OffCanvas, var(--xmlui-borderVerticalStyle-OffCanvas, var(--xmlui-borderStyle-OffCanvas)))", "borderBottomStyle-OffCanvas": "var(--xmlui-borderBottomStyle-OffCanvas, var(--xmlui-borderVerticalStyle-OffCanvas, var(--xmlui-borderStyle-OffCanvas)))", "borderColor-OffCanvas": "var(--xmlui-borderColor-OffCanvas)", "borderHorizontalColor-OffCanvas": "var(--xmlui-borderHorizontalColor-OffCanvas, var(--xmlui-borderColor-OffCanvas))", "borderLeftColor-OffCanvas": "var(--xmlui-borderLeftColor-OffCanvas, var(--xmlui-borderHorizontalColor-OffCanvas, var(--xmlui-borderColor-OffCanvas)))", "borderRightColor-OffCanvas": "var(--xmlui-borderRightColor-OffCanvas, var(--xmlui-borderHorizontalColor-OffCanvas, var(--xmlui-borderColor-OffCanvas)))", "borderVerticalColor-OffCanvas": "var(--xmlui-borderVerticalColor-OffCanvas, var(--xmlui-borderColor-OffCanvas))", "borderTopColor-OffCanvas": "var(--xmlui-borderTopColor-OffCanvas, var(--xmlui-borderVerticalColor-OffCanvas, var(--xmlui-borderColor-OffCanvas)))", "borderBottomColor-OffCanvas": "var(--xmlui-borderBottomColor-OffCanvas, var(--xmlui-borderVerticalColor-OffCanvas, var(--xmlui-borderColor-OffCanvas)))", "radius-start-start-OffCanvas": "var(--xmlui-radius-start-start-OffCanvas, var(--xmlui-borderRadius-OffCanvas))", "radius-start-end-OffCanvas": "var(--xmlui-radius-start-end-OffCanvas, var(--xmlui-borderRadius-OffCanvas))", "radius-end-start-OffCanvas": "var(--xmlui-radius-end-start-OffCanvas, var(--xmlui-borderRadius-OffCanvas))", "radius-end-end-OffCanvas": "var(--xmlui-radius-end-end-OffCanvas, var(--xmlui-borderRadius-OffCanvas))", "padding-OffCanvas": "var(--xmlui-padding-OffCanvas)", "paddingHorizontal-OffCanvas": "var(--xmlui-paddingHorizontal-OffCanvas, var(--xmlui-padding-OffCanvas))", "paddingVertical-OffCanvas": "var(--xmlui-paddingVertical-OffCanvas, var(--xmlui-padding-OffCanvas))", "paddingLeft-OffCanvas": "var(--xmlui-paddingLeft-OffCanvas, var(--xmlui-paddingHorizontal-OffCanvas, var(--xmlui-padding-OffCanvas)))", "paddingRight-OffCanvas": "var(--xmlui-paddingRight-OffCanvas, var(--xmlui-paddingHorizontal-OffCanvas, var(--xmlui-padding-OffCanvas)))", "paddingTop-OffCanvas": "var(--xmlui-paddingTop-OffCanvas, var(--xmlui-paddingVertical-OffCanvas, var(--xmlui-padding-OffCanvas)))", "paddingBottom-OffCanvas": "var(--xmlui-paddingBottom-OffCanvas, var(--xmlui-paddingVertical-OffCanvas, var(--xmlui-padding-OffCanvas)))", "boxShadow-vertical-OffCanvas": "var(--xmlui-boxShadow-vertical-OffCanvas)", "boxShadow-horizontal-OffCanvas": "var(--xmlui-boxShadow-horizontal-OffCanvas)", "backgroundColor-OffCanvas": "var(--xmlui-backgroundColor-OffCanvas)", "width-OffCanvas": "var(--xmlui-width-OffCanvas)", "marginBottom-title-OffCanvas": "var(--xmlui-marginBottom-title-OffCanvas)"}'`, dg = {
  themeVars: lg
}, Mo = "OffCanvas", sg = C({
  status: "in progress",
  description: "(**NOT IMPLEMENTED YET**) The `OffCanvas` component is a hidden panel that slides into view from the side of the screen. It helps display additional content or navigation without disrupting the main interface.",
  props: {
    title: u("This property sets the title of the component.", null, "string"),
    isInitiallyOpen: u(
      "This property indicates if the component is initially open.",
      null,
      "boolean",
      !1
    ),
    enableBackdrop: u(
      "This property indicates if the backdrop is enabled when the component is displayed. When the backdrop is not enabled, clicking outside `OffCanvas` will not close it.",
      null,
      "boolean",
      !0
    ),
    enableBodyScroll: u(
      "This property indicates if the body scroll is enabled when the component is displayed.",
      null,
      "boolean",
      !1
    ),
    noCloseOnBackdropClick: u(
      `When this property is set to \`true\`, the ${Mo} does not close when the user clicks on its backdrop.`,
      null,
      "boolean",
      !1
    ),
    placement: u(
      `This property indicates the position where the ${Mo} should be docked to.`,
      us
    ),
    autoCloseInMs: u(
      "This property sets a timeout. When the timeout expires, the component gets hidden."
    )
  },
  events: {
    didOpen: ys(Mo),
    didClose: Cs(Mo)
  },
  apis: {
    open: u(
      "This method opens the component. It triggers the `didOpen` event  with the argument set to `false`."
    ),
    close: u(
      "This method closes the component. It triggers the `didClose` event with the argument set to `false`."
    )
  },
  themeVars: Z(dg.themeVars),
  defaultThemeVars: {
    "width-OffCanvas": "600px",
    "padding-OffCanvas": "$padding-tight",
    "paddingVertical-OffCanvas": "$padding-tight",
    "paddingHorizontal-OffCanvas": "$padding-normal",
    "backgroundColor-OffCanvas": "$backgroundColor",
    "boxShadow-horizontal-OffCanvas": "0 2px 10px rgba(0, 0, 0, 0.2)",
    "boxShadow-vertical-OffCanvas": "0 2px 10px rgba(0, 0, 0, 0.2)",
    light: {},
    dark: {}
  }
}), ug = C({
  description: "A PageMetaTitle component allows setting up (or changing) the app title to display with the current browser tab.",
  props: {
    value: u("This property sets the page's title to display in the browser tab.")
  }
}), ln = "Page", cg = C({
  status: "stable",
  docFolder: ln,
  description: `The \`${ln}\` component defines what content is displayed when the user navigates to a particular URL that is associated with the page.`,
  props: {
    //TODO illesg rename to path
    url: u("The URL of the route associated with the content.")
  }
}), mg = "Pages", pg = C({
  description: `The \`${mg}\` component is used as a container for [\`Page\`](./Page.mdx) components within an [\`App\`](./App.mdx).`,
  props: {
    defaultRoute: u("The default route when displaying the app")
  }
}), hg = '"[]"', xg = {
  themeVars: hg
}, bg = C({
  status: "deprecated",
  description: "(**OBSOLETE**) This component was created for the ChatEngine app.",
  props: {
    visibleOnHover: u("No description")
  },
  themeVars: Z(xg.themeVars)
}), fg = `'{"backgroundColor-ProgressBar": "var(--xmlui-backgroundColor-ProgressBar)", "color-indicator-ProgressBar": "var(--xmlui-color-indicator-ProgressBar)", "borderRadius-ProgressBar": "var(--xmlui-borderRadius-ProgressBar)", "borderRadius-indicator-ProgressBar": "var(--xmlui-borderRadius-indicator-ProgressBar)", "thickness-ProgressBar": "var(--xmlui-thickness-ProgressBar)"}'`, vg = {
  themeVars: fg
}, mt = "ProgressBar", gg = C({
  description: `A \`${mt}\` component visually represents the progress of a task or process.`,
  props: {
    value: {
      description: "This property defines the progress value with a number between 0 and 1.",
      valueType: "number",
      defaultValue: 0
    }
  },
  themeVars: Z(vg.themeVars),
  defaultThemeVars: {
    [`borderRadius-${mt}`]: "$borderRadius",
    [`borderRadius-indicator-${mt}`]: "0px",
    [`thickness-${mt}`]: "$space-2",
    light: {
      [`backgroundColor-${mt}`]: "$color-surface-200",
      [`color-indicator-${mt}`]: "$color-primary-500"
    },
    dark: {
      [`backgroundColor-${mt}`]: "$color-surface-700",
      [`color-indicator-${mt}`]: "$color-primary-500"
    }
  }
}), Tg = C({
  description: "The `Queue` component provides an API to enqueue elements and defines events to process queued elements in a FIFO order.",
  props: {
    progressFeedback: u(
      "This property defines the component template of the UI that displays progress information whenever, the queue's `progressReport` function in invoked."
    ),
    resultFeedback: u(
      "This property defines the component template of the UI that displays result information when the queue becomes empty after processing all queued items."
    ),
    clearAfterFinish: u(
      "This property indicates the completed items (successful or error) should be removed from the queue after completion."
    )
  },
  nonVisual: !0,
  events: {
    willProcess: u("This event is triggered to process a particular item."),
    process: u(
      "This event is fired to process the next item in the queue. If the processing cannot proceed because of some error, raise an exception, and the queue will handle that."
    ),
    didProcess: u(
      "This event is fired when the processing of a queued item has been successfully processed."
    ),
    processError: u(
      "This event is fired when processing an item raises an error. The event handler method receives two parameters. The first is the error raised during the processing of the item; the second is an object with these properties:"
    ),
    complete: u(
      "The queue fires this event when the queue gets empty after processing all items. The event handler has no arguments."
    )
  },
  apis: {
    enqueueItem: u(
      "This method enqueues the item passed in the method parameter. The new item will be processed after the current queue items have been handled. The method retrieves the unique ID of the newly added item; this ID can be used later in other methods, such as `remove`."
    ),
    enqueueItems: u(
      "This method enqueues the array of items passed in the method parameter. The new items will be processed after the current queue items have been handled. The method retrieves an array of unique IDs, one for each new item. An item ID can be used later in other methods, such as `remove`."
    ),
    getQueuedItems: u(
      "You can use this method to return the items in the queue. These items contain all entries not removed from the queue yet, including pending, in-progress, and completed items."
    ),
    getQueueLength: u(
      "This method retrieves the current queue length. The queue contains only those items that are not fully processed yet."
    ),
    remove: u(
      "This method retrieves the current queue length. The queue contains only those items that are not fully processed yet."
    )
  },
  contextVars: {
    $completedItems: u(
      "A list containing the queue items that have been completed (fully processed)."
    ),
    $queuedItems: u(
      "A list containing the items waiting in the queue, icluding the completed items."
    )
  }
}), Qt = "RadioGroup", _e = "RadioGroupOption", yg = C({
  description: `The \`${Qt}\` input component is a group of radio buttons ([\`RadioGroupOption\`](./RadioGroupOption.mdx) components) that allow users to select only one option from the group at a time.`,
  props: {
    initialValue: Cr(),
    autoFocus: rr(),
    required: Ar(),
    readOnly: Lr(),
    enabled: Qe(),
    validationStatus: _r(),
    orientation: u(
      "(*** NOT IMPLEMENTED YET ***) This property sets the orientation of the options within the radio group."
    ),
    label: Fe(),
    labelPosition: Dr("top"),
    labelWidth: jr(Qt),
    labelBreak: Jr(Qt)
  },
  events: {
    gotFocus: Tr(Qt),
    lostFocus: yr(Qt),
    didChange: er(Qt)
  },
  themeVars: Z(ir.themeVars),
  defaultThemeVars: {
    [`gap-${_e}`]: "$space-1_5",
    [`borderWidth-${_e}`]: "2px",
    [`backgroundColor-checked-${_e}--disabled]`]: `$borderColor-${_e}--disabled`,
    [`backgroundColor-checked-${_e}-error`]: `$borderColor-${_e}-error`,
    [`backgroundColor-checked-${_e}-warning`]: `$borderColor-${_e}-warning`,
    [`backgroundColor-checked-${_e}-success`]: `$borderColor-${_e}-success`,
    [`fontSize-${_e}`]: "$fontSize-small",
    [`fontWeight-${_e}`]: "$fontWeight-bold",
    [`color-${_e}-error`]: `$borderColor-${_e}-error`,
    [`color-${_e}-warning`]: `$borderColor-${_e}-warning`,
    [`color-${_e}-success`]: `$borderColor-${_e}-success`,
    light: {
      [`backgroundColor-checked-${_e}-default`]: "$color-primary-500",
      [`borderColor-${_e}-default`]: "$color-surface-500",
      [`borderColor-${_e}-default--hover`]: "$color-surface-700",
      [`borderColor-${_e}-default--active`]: "$color-primary-500"
    },
    dark: {
      [`backgroundColor-checked-${_e}-default`]: "$color-primary-500",
      [`borderColor-${_e}-default`]: "$color-surface-500",
      [`borderColor-${_e}-default--hover`]: "$color-surface-300",
      [`borderColor-${_e}-default--active`]: "$color-primary-400"
    }
  }
}), Cg = "RealTimeAdapter", kg = C({
  status: "experimental",
  description: `\`${Cg}\` is a non-visual component that listens to real-time events through long-polling.`,
  props: {
    url: u("This property specifies the URL to use for long-polling.")
  },
  events: {
    eventArrived: u("This event is raised when data arrives from the backend using long-polling.")
  }
}), Sg = "Redirect", wg = C({
  description: `\`${Sg}\` is a component that immediately redirects the browser to the URL in its \`to\` property when it gets visible (its \`when\` property gets \`true\`). The redirection works only within the app.`,
  props: {
    to: u("This property defines the URL to which this component is about to redirect requests.")
  }
}), Se = "Select", Hg = C({
  description: "Provides a dropdown with a list of options to choose from.",
  status: "experimental",
  props: {
    placeholder: Vt(),
    initialValue: Cr(),
    maxLength: _o(),
    autoFocus: rr(),
    required: Ar(),
    readOnly: Lr(),
    enabled: Qe(),
    validationStatus: _r(),
    label: Fe(),
    labelPosition: Dr("top"),
    labelWidth: jr(Se),
    labelBreak: Jr(Se),
    optionLabelTemplate: Re(
      "This property allows replacing the default template to display an option in the dropdown list."
    ),
    valueTemplate: Re(
      "This property allows replacing the default template to display a selected value when multiple selections (`multiSelect` is `true`) are enabled."
    ),
    dropdownHeight: u("This property sets the height of the dropdown list."),
    emptyListTemplate: u(
      "This optional property provides the ability to customize what is displayed when the list of options is empty."
    ),
    multiSelect: Un(),
    searchable: u("This property enables the search functionality in the dropdown list.")
  },
  events: {
    gotFocus: Tr(Se),
    lostFocus: yr(Se),
    didChange: er(Se)
  },
  apis: {
    focus: et(Se),
    setValue: Kr(),
    value: ia()
  },
  contextVars: {
    $item: u("This property represents the value of an item in the dropdown list."),
    $itemContext: u(
      "This property provides a `removeItem` method to delete the particular value from the selection."
    )
  },
  themeVars: Z(ke.themeVars),
  defaultThemeVars: {
    [`backgroundColor-menu-${Se}`]: "$backgroundColor-primary",
    [`boxShadow-menu-${Se}`]: "$boxShadow-md",
    [`borderRadius-menu-${Se}`]: "$borderRadius",
    [`borderWidth-menu-${Se}`]: "1px",
    [`borderColor-menu-${Se}`]: "$borderColor",
    [`backgroundColor-item-${Se}`]: "$backgroundColor-dropdown-item",
    [`backgroundColor-item-${Se}--hover`]: "$backgroundColor-dropdown-item--active",
    [`backgroundColor-item-${Se}--active`]: "$backgroundColor-dropdown-item--active",
    "minHeight-Input": "39px",
    [`backgroundColor-${Se}-badge`]: "$color-primary-500",
    [`fontSize-${Se}-badge`]: "$fontSize-small",
    [`paddingHorizontal-${Se}-badge`]: "$space-1",
    [`paddingVertical-${Se}-badge`]: "$space-1",
    [`opacity-text-item-${Se}--disabled`]: "0.5",
    [`opacity-${Se}--disabled`]: "0.5",
    light: {
      [`backgroundColor-${Se}-badge--hover`]: "$color-primary-400",
      [`backgroundColor-${Se}-badge--active`]: "$color-primary-500",
      [`color-item-${Se}--disabled`]: "$color-surface-200",
      [`color-${Se}-badge`]: "$color-surface-50"
    },
    dark: {
      [`backgroundColor-${Se}-badge--hover`]: "$color-primary-600",
      [`backgroundColor-${Se}-badge--active`]: "$color-primary-500",
      [`color-${Se}-badge`]: "$color-surface-50",
      [`color-item-${Se}--disabled`]: "$color-surface-800"
    }
  }
}), Bg = {
  value: lr
}, Ig = ({ children: e }) => {
  const [r, t] = me(Bg);
  return /* @__PURE__ */ p($g, { updateState: t, selectedItems: r.value, children: e });
}, $g = ({
  updateState: e = La,
  idKey: r = "id",
  children: t,
  selectedItems: o = lr,
  registerComponentApi: a = La
}) => {
  const [n, i] = me(o), l = he(!1), s = $e((T = lr) => {
    i(T);
    let b = T.filter((v) => !!o.find((y) => y[r] === v[r]));
    (!ed(o, b) || !l.current) && (l.current = !0, e({
      value: b
    }));
  }), f = $e((T) => {
    e({ value: n.filter((b) => T.includes(b[r])) });
  }), h = $e(() => {
    f(lr);
  });
  Bo(() => {
    a({
      clearSelection: h,
      setSelectedRowIds: f,
      refreshSelection: s
    });
  }, [h, f, a, s]);
  const c = ue(() => ({
    selectedItems: o,
    setSelectedRowIds: f,
    refreshSelection: s,
    idKey: r
  }), [s, o, f, r]);
  return /* @__PURE__ */ p(Dl.Provider, { value: c, children: t });
}, Dl = Ae.createContext(null);
function Pl() {
  return $r(Dl);
}
const Lg = "SelectionStore", _g = C({
  status: "deprecated",
  description: `The \`${Lg}\` is a non-visual component that may wrap components (items) and manage their selection state to accommodate the usage of other actions.`,
  props: {
    idKey: u(
      'The selected items in the selection store needs to have a unique ID to use as an unambiguous key for that particular item. This property uniquely identifies the selected object item via a given property. By default, the key attribute is `"id"`.'
    )
  }
}), Ag = "SpaceFiller", Ng = C({
  description: `The \`${Ag}\` is a component that works well in layout containers to fill the remaining (unused) space. Its behavior depends on the layout container in which it is used.`,
  themeVars: Z(xl.themeVars)
}), Co = "Spinner", Wg = C({
  description: `The \`${Co}\` component is an animated indicator that represents a particular action in progress without a deterministic progress value.`,
  props: {
    delay: {
      description: "The delay in milliseconds before the spinner is displayed.",
      valueType: "number",
      defaultValue: 400
    },
    fullScreen: {
      description: "If set to `true`, the component will be rendered in a full screen container.",
      valueType: "boolean",
      defaultValue: !1
    },
    themeColor: u("(**NOT IMPLEMENTED YET**) The theme color of the component.")
  },
  themeVars: Z(Oa.themeVars),
  defaultThemeVars: {
    [`size-${Co}`]: "$space-10",
    [`thickness-${Co}`]: "$space-0_5",
    light: {
      [`borderColor-${Co}`]: "$color-surface-400"
    },
    dark: {
      [`borderColor-${Co}`]: "$color-surface-600"
    }
  }
}), Og = `'{"boxShadow-Splitter": "var(--xmlui-boxShadow-Splitter)", "backgroundColor-Splitter": "var(--xmlui-backgroundColor-Splitter)", "borderRadius-Splitter": "var(--xmlui-borderRadius-Splitter)", "borderColor-Splitter": "var(--xmlui-borderColor-Splitter)", "borderWidth-Splitter": "var(--xmlui-borderWidth-Splitter)", "borderStyle-Splitter": "var(--xmlui-borderStyle-Splitter)", "border-Splitter": "var(--xmlui-border-Splitter)", "backgroundColor-resizer-Splitter": "var(--xmlui-backgroundColor-resizer-Splitter)", "thickness-resizer-Splitter": "var(--xmlui-thickness-resizer-Splitter)", "cursor-resizer-horizontal-Splitter": "var(--xmlui-cursor-resizer-horizontal-Splitter)", "cursor-resizer-vertical-Splitter": "var(--xmlui-cursor-resizer-vertical-Splitter)"}'`, Rg = {
  themeVars: Og
}, vt = "Splitter", oa = C({
  description: `The \`${vt}\` component divides a container (such as a window, panel, pane, etc.) into two resizable sections.`,
  props: {
    swapped: {
      description: `This optional booelan property indicates whether the \`${vt}\` sections are layed out as primary and secondary (\`false\`) or secondary and primary (\`true\`) from left to right.`,
      valueType: "boolean",
      defaultValue: !1
    },
    splitterTemplate: Re(
      "The divider can be customized using XMLUI components via this property."
    ),
    initialPrimarySize: {
      description: "This optional number property sets the initial size of the primary section. The unit of the size value is in pixels or percentages.",
      valueType: "string",
      defaultValue: "50%"
    },
    minPrimarySize: {
      description: "This property sets the minimum size the primary section can have. The unit of the size value is in pixels or percentages.",
      valueType: "string",
      defaultValue: "0%"
    },
    maxPrimarySize: {
      description: "This property sets the maximum size the primary section can have. The unit of the size value is in pixels or percentages.",
      valueType: "string",
      defaultValue: "100%"
    },
    floating: {
      description: "Toggles whether the resizer is visible (`false`) or not (`true`) when not hovered or dragged. The default value is `false`, meaning the resizer is visible all the time.",
      valueType: "boolean",
      defaultValue: !1
    },
    orientation: {
      description: "Sets whether the `Splitter` divides the container horizontally and lays out the section on top of each other (`vertical`), or vertically by placing the sections next to each other (`horizontal`).",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: "vertical"
    }
  },
  events: {
    resize: u("This event fires when the component is resized.")
  },
  themeVars: Z(Rg.themeVars),
  defaultThemeVars: {
    [`backgroundColor-resizer-${vt}`]: "$backgroundColor-Card",
    [`thickness-resizer-${vt}`]: "5px",
    [`cursor-resizer-horizontal-${vt}`]: "ew-resize",
    [`cursor-resizer-vertical-${vt}`]: "ns-resize"
  }
}), zg = {
  ...oa,
  props: {
    ...oa.props
  }
}, Vg = { ...oa, specializedFrom: vt }, Eg = { ...oa, specializedFrom: vt }, Dg = '"[]"', Pg = {
  themeVars: Dg
}, dn = "StickyBox", Mg = C({
  status: "experimental",
  description: `The \`${dn}\` is a component that "sticks" or remains fixed at the top or bottom position on the screen as the user scrolls.`,
  props: {
    to: {
      description: "This property determines whether the StickyBox should be anchored to the `top` or `bottom`.",
      availableValues: ["top", "bottom"],
      valueType: "string",
      defaultValue: "top"
    }
  },
  themeVars: Z(Pg.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${dn}`]: "$backgroundColor"
  }
}), Te = "Switch", Fg = C({
  description: `The \`${Te}\` component is a user interface element that allows users to toggle between two states: on and off. It consists of a small rectangular or circular button that can be moved left or right to change its state.`,
  props: {
    indeterminate: qn(Vr.indeterminate),
    label: Fe(),
    labelPosition: Dr("end"),
    labelWidth: jr(Te),
    labelBreak: Jr(Te),
    required: Ar(),
    initialValue: Cr(Vr.initialValue),
    autoFocus: rr(),
    readOnly: Lr(),
    enabled: Qe(),
    validationStatus: _r(Vr.validationStatus),
    description: Pe(
      `(*** NOT IMPLEMENTED YET ***) This optional property displays an alternate description of the ${Te} besides its label.`
    )
  },
  events: {
    gotFocus: Tr(Te),
    lostFocus: yr(Te),
    didChange: er(Te)
  },
  apis: {
    value: Gn(),
    setValue: Kr()
  },
  themeVars: Z(Ur.themeVars),
  defaultThemeVars: {
    [`borderColor-checked-${Te}-error`]: `$borderColor-${Te}-error`,
    [`backgroundColor-checked-${Te}-error`]: `$borderColor-${Te}-error`,
    [`borderColor-checked-${Te}-warning`]: `$borderColor-${Te}-warning`,
    [`backgroundColor-checked-${Te}-warning`]: `$borderColor-${Te}-warning`,
    [`borderColor-checked-${Te}-success`]: `$borderColor-${Te}-success`,
    [`backgroundColor-checked-${Te}-success`]: `$borderColor-${Te}-success`,
    light: {
      [`backgroundColor-${Te}`]: "$color-surface-400",
      [`borderColor-${Te}`]: "$color-surface-400",
      [`backgroundColor-indicator-${Te}`]: "$backgroundColor-primary",
      [`borderColor-checked-${Te}`]: "$color-primary-500",
      [`backgroundColor-checked-${Te}`]: "$color-primary-500",
      [`backgroundColor-${Te}--disabled`]: "$color-surface-200"
    },
    dark: {
      [`backgroundColor-${Te}`]: "$color-surface-500",
      [`borderColor-${Te}`]: "$color-surface-500",
      [`backgroundColor-indicator-${Te}`]: "$backgroundColor-primary",
      [`borderColor-checked-${Te}`]: "$color-primary-400",
      [`backgroundColor-checked-${Te}`]: "$color-primary-400",
      [`backgroundColor-${Te}--disabled`]: "$color-surface-800"
    }
  }
}), qg = `'{"color-pagination-Table": "var(--xmlui-color-pagination-Table)", "backgroundColor-Table": "var(--xmlui-backgroundColor-Table)", "color-Table": "var(--xmlui-color-Table)", "backgroundColor-row-Table": "var(--xmlui-backgroundColor-row-Table)", "backgroundColor-row-Table--hover": "var(--xmlui-backgroundColor-row-Table--hover)", "backgroundColor-selected-Table": "var(--xmlui-backgroundColor-selected-Table)", "backgroundColor-selected-Table--hover": "var(--xmlui-backgroundColor-selected-Table--hover)", "backgroundColor-heading-Table": "var(--xmlui-backgroundColor-heading-Table)", "backgroundColor-heading-Table--hover": "var(--xmlui-backgroundColor-heading-Table--hover)", "backgroundColor-heading-Table--active": "var(--xmlui-backgroundColor-heading-Table--active)", "padding-heading-Table": "var(--xmlui-padding-heading-Table)", "paddingHorizontal-heading-Table": "var(--xmlui-paddingHorizontal-heading-Table, var(--xmlui-padding-heading-Table))", "paddingVertical-heading-Table": "var(--xmlui-paddingVertical-heading-Table, var(--xmlui-padding-heading-Table))", "paddingLeft-heading-Table": "var(--xmlui-paddingLeft-heading-Table, var(--xmlui-paddingHorizontal-heading-Table, var(--xmlui-padding-heading-Table)))", "paddingRight-heading-Table": "var(--xmlui-paddingRight-heading-Table, var(--xmlui-paddingHorizontal-heading-Table, var(--xmlui-padding-heading-Table)))", "paddingTop-heading-Table": "var(--xmlui-paddingTop-heading-Table, var(--xmlui-paddingVertical-heading-Table, var(--xmlui-padding-heading-Table)))", "paddingBottom-heading-Table": "var(--xmlui-paddingBottom-heading-Table, var(--xmlui-paddingVertical-heading-Table, var(--xmlui-padding-heading-Table)))", "padding-cell-Table": "var(--xmlui-padding-cell-Table)", "paddingHorizontal-cell-Table": "var(--xmlui-paddingHorizontal-cell-Table, var(--xmlui-padding-cell-Table))", "paddingVertical-cell-Table": "var(--xmlui-paddingVertical-cell-Table, var(--xmlui-padding-cell-Table))", "paddingLeft-cell-Table": "var(--xmlui-paddingLeft-cell-Table, var(--xmlui-paddingHorizontal-cell-Table, var(--xmlui-padding-cell-Table)))", "paddingRight-cell-Table": "var(--xmlui-paddingRight-cell-Table, var(--xmlui-paddingHorizontal-cell-Table, var(--xmlui-padding-cell-Table)))", "paddingTop-cell-Table": "var(--xmlui-paddingTop-cell-Table, var(--xmlui-paddingVertical-cell-Table, var(--xmlui-padding-cell-Table)))", "paddingBottom-cell-Table": "var(--xmlui-paddingBottom-cell-Table, var(--xmlui-paddingVertical-cell-Table, var(--xmlui-padding-cell-Table)))", "paddingHorizontal-cell-first-Table": "var(--xmlui-paddingHorizontal-cell-first-Table)", "paddingHorizontal-cell-last-Table": "var(--xmlui-paddingHorizontal-cell-last-Table)", "border-cell-Table": "var(--xmlui-border-cell-Table)", "borderHorizontal-cell-Table": "var(--xmlui-borderHorizontal-cell-Table, var(--xmlui-border-cell-Table))", "borderVertical-cell-Table": "var(--xmlui-borderVertical-cell-Table, var(--xmlui-border-cell-Table))", "borderLeft-cell-Table": "var(--xmlui-borderLeft-cell-Table, var(--xmlui-borderHorizontal-cell-Table, var(--xmlui-border-cell-Table)))", "borderRight-cell-Table": "var(--xmlui-borderRight-cell-Table, var(--xmlui-borderHorizontal-cell-Table, var(--xmlui-border-cell-Table)))", "borderTop-cell-Table": "var(--xmlui-borderTop-cell-Table, var(--xmlui-borderVertical-cell-Table, var(--xmlui-border-cell-Table)))", "borderBottom-cell-Table": "var(--xmlui-borderBottom-cell-Table)", "borderWidth-cell-Table": "var(--xmlui-borderWidth-cell-Table)", "borderHorizontalWidth-cell-Table": "var(--xmlui-borderHorizontalWidth-cell-Table, var(--xmlui-borderWidth-cell-Table))", "borderLeftWidth-cell-Table": "var(--xmlui-borderLeftWidth-cell-Table, var(--xmlui-borderHorizontalWidth-cell-Table, var(--xmlui-borderWidth-cell-Table)))", "borderRightWidth-cell-Table": "var(--xmlui-borderRightWidth-cell-Table, var(--xmlui-borderHorizontalWidth-cell-Table, var(--xmlui-borderWidth-cell-Table)))", "borderVerticalWidth-cell-Table": "var(--xmlui-borderVerticalWidth-cell-Table, var(--xmlui-borderWidth-cell-Table))", "borderTopWidth-cell-Table": "var(--xmlui-borderTopWidth-cell-Table, var(--xmlui-borderVerticalWidth-cell-Table, var(--xmlui-borderWidth-cell-Table)))", "borderBottomWidth-cell-Table": "var(--xmlui-borderBottomWidth-cell-Table, var(--xmlui-borderVerticalWidth-cell-Table, var(--xmlui-borderWidth-cell-Table)))", "borderStyle-cell-Table": "var(--xmlui-borderStyle-cell-Table)", "borderHorizontalStyle-cell-Table": "var(--xmlui-borderHorizontalStyle-cell-Table, var(--xmlui-borderStyle-cell-Table))", "borderLeftStyle-cell-Table": "var(--xmlui-borderLeftStyle-cell-Table, var(--xmlui-borderHorizontalStyle-cell-Table, var(--xmlui-borderStyle-cell-Table)))", "borderRightStyle-cell-Table": "var(--xmlui-borderRightStyle-cell-Table, var(--xmlui-borderHorizontalStyle-cell-Table, var(--xmlui-borderStyle-cell-Table)))", "borderVerticalStyle-cell-Table": "var(--xmlui-borderVerticalStyle-cell-Table, var(--xmlui-borderStyle-cell-Table))", "borderTopStyle-cell-Table": "var(--xmlui-borderTopStyle-cell-Table, var(--xmlui-borderVerticalStyle-cell-Table, var(--xmlui-borderStyle-cell-Table)))", "borderBottomStyle-cell-Table": "var(--xmlui-borderBottomStyle-cell-Table, var(--xmlui-borderVerticalStyle-cell-Table, var(--xmlui-borderStyle-cell-Table)))", "borderColor-cell-Table": "var(--xmlui-borderColor-cell-Table)", "borderHorizontalColor-cell-Table": "var(--xmlui-borderHorizontalColor-cell-Table, var(--xmlui-borderColor-cell-Table))", "borderLeftColor-cell-Table": "var(--xmlui-borderLeftColor-cell-Table, var(--xmlui-borderHorizontalColor-cell-Table, var(--xmlui-borderColor-cell-Table)))", "borderRightColor-cell-Table": "var(--xmlui-borderRightColor-cell-Table, var(--xmlui-borderHorizontalColor-cell-Table, var(--xmlui-borderColor-cell-Table)))", "borderVerticalColor-cell-Table": "var(--xmlui-borderVerticalColor-cell-Table, var(--xmlui-borderColor-cell-Table))", "borderTopColor-cell-Table": "var(--xmlui-borderTopColor-cell-Table, var(--xmlui-borderVerticalColor-cell-Table, var(--xmlui-borderColor-cell-Table)))", "borderBottomColor-cell-Table": "var(--xmlui-borderBottomColor-cell-Table, var(--xmlui-borderVerticalColor-cell-Table, var(--xmlui-borderColor-cell-Table)))", "radius-start-start-cell-Table": "var(--xmlui-radius-start-start-cell-Table, var(--xmlui-borderRadius-cell-Table))", "radius-start-end-cell-Table": "var(--xmlui-radius-start-end-cell-Table, var(--xmlui-borderRadius-cell-Table))", "radius-end-start-cell-Table": "var(--xmlui-radius-end-start-cell-Table, var(--xmlui-borderRadius-cell-Table))", "radius-end-end-cell-Table": "var(--xmlui-radius-end-end-cell-Table, var(--xmlui-borderRadius-cell-Table))", "backgroundColor-pagination-Table": "var(--xmlui-backgroundColor-pagination-Table)", "color-heading-Table": "var(--xmlui-color-heading-Table)", "fontWeight-row-Table": "var(--xmlui-fontWeight-row-Table)", "fontSize-row-Table": "var(--xmlui-fontSize-row-Table)", "fontWeight-heading-Table": "var(--xmlui-fontWeight-heading-Table)", "fontSize-heading-Table": "var(--xmlui-fontSize-heading-Table)", "textTransform-heading-Table": "var(--xmlui-textTransform-heading-Table)", "outlineWidth-heading-Table--focus": "var(--xmlui-outlineWidth-heading-Table--focus)", "outlineColor-heading-Table--focus": "var(--xmlui-outlineColor-heading-Table--focus)", "outlineStyle-heading-Table--focus": "var(--xmlui-outlineStyle-heading-Table--focus)", "outlineOffset-heading-Table--focus": "var(--xmlui-outlineOffset-heading-Table--focus)"}'`, Ug = "_wrapper_4gpy0_13", Gg = "_noScroll_4gpy0_19", Yg = "_headerWrapper_4gpy0_23", Xg = "_tableBody_4gpy0_23", Qg = "_clickableHeader_4gpy0_29", Zg = "_headerContent_4gpy0_43", jg = "_headerRow_4gpy0_76", Jg = "_columnCell_4gpy0_81", Kg = "_cell_4gpy0_81", eT = "_table_4gpy0_23", rT = "_row_4gpy0_93", tT = "_checkBoxWrapper_4gpy0_99", oT = "_showInHeader_4gpy0_103", aT = "_selected_4gpy0_106", iT = "_allSelected_4gpy0_106", nT = "_focused_4gpy0_152", lT = "_disabled_4gpy0_164", dT = "_noRows_4gpy0_193", sT = "_pagination_4gpy0_199", uT = "_paginationLabel_4gpy0_215", cT = "_paginationSelect_4gpy0_220", mT = "_paginationButtons_4gpy0_226", pT = "_loadingWrapper_4gpy0_238", hT = "_resizer_4gpy0_253", xT = "_isResizing_4gpy0_275", He = {
  themeVars: qg,
  wrapper: Ug,
  noScroll: Gg,
  headerWrapper: Yg,
  tableBody: Xg,
  clickableHeader: Qg,
  headerContent: Zg,
  headerRow: jg,
  columnCell: Jg,
  cell: Kg,
  table: eT,
  row: rT,
  checkBoxWrapper: tT,
  showInHeader: oT,
  selected: aT,
  allSelected: iT,
  focused: nT,
  disabled: lT,
  noRows: dT,
  pagination: sT,
  paginationLabel: uT,
  paginationSelect: cT,
  paginationButtons: mT,
  loadingWrapper: pT,
  resizer: hT,
  isResizing: xT
}, sn = Zr({
  registerColumn: (e, r) => {
  },
  unRegisterColumn: (e) => {
  }
});
function bT(e) {
  return ho({ attr: { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, child: [{ tag: "polyline", attr: { points: "15 18 9 12 15 6" } }] })(e);
}
function fT(e) {
  return ho({ attr: { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, child: [{ tag: "polyline", attr: { points: "9 18 15 12 9 6" } }] })(e);
}
function vT(e) {
  return ho({ attr: { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, child: [{ tag: "polyline", attr: { points: "11 17 6 12 11 7" } }, { tag: "polyline", attr: { points: "18 17 13 12 18 7" } }] })(e);
}
function gT(e) {
  return ho({ attr: { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, child: [{ tag: "polyline", attr: { points: "13 17 18 12 13 7" } }, { tag: "polyline", attr: { points: "6 17 11 12 6 7" } }] })(e);
}
function TT({
  items: e = lr,
  visibleItems: r = e,
  rowsSelectable: t,
  enableMultiRowSelection: o,
  onSelectionDidChange: a
}) {
  const [n, i] = me(-1), [l, s] = me(null), { selectedItems: f, setSelectedRowIds: h, refreshSelection: c, idKey: T } = Pl(), b = ue(() => r.map((z) => z[T]), [T, r]);
  K(() => {
    c(t ? e : lr);
  }, [c, e, t]);
  const v = Zn(o);
  K(() => {
    v && !o && f.length > 1 && h([f[0][T]]);
  }, [
    o,
    T,
    v,
    f,
    h
  ]), K(() => {
    t && n !== -1 && !b[n] && b[0] && i(0);
  }, [n, t, i, b]);
  const y = $e(
    // targetIndex: the item affected by an event
    // options: key event options
    (z, x = {}) => {
      if (!t)
        return;
      const m = b[z], { shiftKey: g, metaKey: k, ctrlKey: A } = x, q = !o || !g && !k && !A;
      let E, N = [...f.map((B) => B[T])];
      if (q)
        E = {
          from: m,
          to: m
        }, N = [m];
      else if (g) {
        let B, D, P, I;
        if (l) {
          let G = b.indexOf(l.from), J = b.indexOf(l.to), ee = Math.min(G, J), Ce = Math.max(G, J);
          const qe = b.slice(ee, Ce + 1);
          N = N.filter(
            (te) => !qe.includes(te)
          ), P = l.from, I = m;
          let Ee = b.indexOf(P), ae = b.indexOf(I);
          B = Math.min(Ee, ae), D = Math.max(Ee, ae);
        } else
          P = m, I = m, B = z, D = z;
        const M = b.slice(B, D + 1);
        N = rd(N, M), E = {
          from: P,
          to: I
        };
      } else
        E = {
          from: m,
          to: m
        }, k || A ? N.includes(m) ? N = N.filter(
          (B) => B !== m
        ) : N.push(m) : N = [m];
      i(z), h(td(N)), s(E);
    }
  ), w = $e((z, x) => {
    if (!t)
      return;
    const m = b.indexOf(z[T]);
    y(m, x);
  }), _ = $e((z) => {
    if (t) {
      if (z.key === "ArrowDown") {
        z.preventDefault();
        let x = Math.min(r.length - 1, n + 1);
        n !== r.length - 1 && y(x, z);
      }
      if (z.key === "PageDown") {
        z.preventDefault();
        const x = Math.min(r.length - 1, n + 8);
        y(x, z);
      }
      if (z.key === "ArrowUp") {
        z.preventDefault();
        let x = Math.max(0, n - 1);
        n >= 0 && y(x, z);
      }
      if (z.key === "PageUp") {
        z.preventDefault();
        const x = Math.max(0, n - 8);
        y(x, z);
      }
    }
  });
  K(() => {
    a == null || a(f);
  }, [f, a]);
  const H = $e((z) => {
    t && (!o && z || h(z ? e.map((x) => x[T]) : []));
  }), $ = ue(() => {
    let z = {};
    return f.forEach((x) => {
      z[x[T]] = !0;
    }), z;
  }, [T, f]), O = X(() => f, [f]), F = X(() => f.map((z) => z[T]), [T, f]), Y = X(() => {
    H(!1);
  }, [H]), V = X(() => {
    H(!0);
  }, [H]), R = X(
    (z) => {
      if (!t)
        return;
      let x = Array.isArray(z) ? z : [z];
      x.length > 1 && !o && (x = [x[0]]), h(x);
    },
    [o, t, h]
  ), W = ue(() => ({
    getSelectedItems: O,
    getSelectedIds: F,
    clearSelection: Y,
    selectAll: V,
    selectId: R
  }), [Y, F, O, V, R]);
  return {
    onKeyDown: _,
    focusedIndex: n,
    toggleRowIndex: y,
    toggleRow: w,
    checkAllRows: H,
    selectedRowIdMap: $,
    selectedItems: f,
    idKey: T,
    selectionApi: W
  };
}
function yT(e) {
  return !1;
}
const CT = 42, kT = [10], un = (e) => {
  const r = e.getIsPinned();
  return {
    // boxShadow: isLastLeftPinnedColumn
    //   ? "-4px 0 4px -4px gray inset"
    //   : isFirstRightPinnedColumn
    //   ? "4px 0 4px -4px gray inset"
    //   : undefined,
    left: r === "left" ? `${e.getStart("left")}px` : void 0,
    right: r === "right" ? `${e.getAfter("right")}px` : void 0,
    opacity: r ? 0.95 : void 0,
    position: r ? "sticky" : "relative",
    backgroundColor: r ? "inherit" : void 0,
    zIndex: r ? 1 : void 0
  };
}, ST = xe(
  ({
    data: e = lr,
    columns: r = lr,
    isPaginated: t = !1,
    loading: o = !1,
    headerHeight: a,
    rowsSelectable: n = !1,
    enableMultiRowSelection: i = !0,
    pageSizes: l = kT,
    rowDisabledPredicate: s = yT,
    sortBy: f,
    sortingDirection: h = "ascending",
    iconSortAsc: c,
    iconSortDesc: T,
    iconNoSort: b,
    sortingDidChange: v,
    willSort: y,
    style: w,
    noDataRenderer: _,
    autoFocus: H = !1,
    hideHeader: $ = !1,
    hideNoDataView: O = !1,
    alwaysShowSelectionHeader: F = !1,
    registerComponentApi: Y,
    onSelectionDidChange: V
    // cols
  }, R) => {
    var mi, pi, hi, xi;
    const { getThemeVar: W } = dt(), z = Array.isArray(e) ? e : lr, x = he(null), m = R ? st(x, R) : x, g = he(null), k = he(null), A = f !== void 0, q = ue(() => r || (z.length ? Object.keys(z[0]).map((ie) => ({ header: ie, accessorKey: ie })) : lr), [r, z]);
    K(() => {
      H && x.current.focus();
    }, [H]);
    const [E, N] = me(lr), {
      toggleRow: B,
      checkAllRows: D,
      focusedIndex: P,
      onKeyDown: I,
      selectedRowIdMap: M,
      idKey: G,
      selectionApi: J
    } = TT({
      items: z,
      visibleItems: E,
      rowsSelectable: n,
      enableMultiRowSelection: i,
      onSelectionDidChange: V
    }), ee = ue(() => z.map((ie, ge) => ({
      ...ie,
      order: ge + 1
    })), [z]), [Ce, qe] = me(f), [Ee, ae] = me(h);
    Bo(() => {
      qe(f);
    }, [f]), Bo(() => {
      ae(h);
    }, [h]);
    const te = ue(() => !Ce || A ? ee : od(ee, Ce, Ee === "ascending" ? "asc" : "desc"), [Ce, Ee, ee, A]), Q = X(
      async (ie) => {
        let ge = "ascending", se = ie;
        Ce === ie && (Ee === "ascending" ? ge = "descending" : se = void 0), await (y == null ? void 0 : y(se, ge)) !== !1 && (ae(ge), qe(se), v == null || v(se, ge));
      },
      [Ce, y, v, Ee]
    ), ne = ue(() => q.map((ie, ge) => {
      const { width: se, starSizedWidth: ve } = kr(ie.width, !0, "width"), { width: ur } = kr(ie.minWidth, !1, "minWidth"), { width: We } = kr(ie.maxWidth, !1, "maxWidth");
      return {
        ...ie,
        header: ie.header ?? ie.accessorKey ?? " ",
        id: "col_" + ge,
        size: se,
        minSize: ur,
        maxSize: We,
        enableResizing: ie.canResize,
        enableSorting: ie.canSort,
        enablePinning: ie.pinTo !== void 0,
        meta: {
          starSizedWidth: ve,
          pinTo: ie.pinTo,
          style: ie.style,
          accessorKey: ie.accessorKey,
          cellRenderer: ie.cellRenderer
        }
      };
      function kr(cr, Mr, Ul) {
        let vo, zo;
        const St = pc(cr) ? W(cr) : cr;
        if (typeof St == "number")
          zo = St;
        else if (typeof St == "string") {
          const Gl = St.match(/^\s*\*\s*$/);
          if (Mr && Gl)
            vo = "1*";
          else {
            const bi = St.match(/^\s*(\d+)\s*\*\s*$/);
            if (Mr && bi)
              vo = bi[1] + "*";
            else {
              const fi = St.match(/^\s*(\d+)\s*(px)?\s*$/);
              if (fi)
                zo = Number(fi[1]);
              else
                throw new Error(`Invalid TableColumnDef '${Ul}' value: ${St}`);
            }
          }
        }
        return zo === void 0 && vo === void 0 && Mr && (vo = "1*"), { width: zo, starSizedWidth: vo };
      }
    }), [W, q]), Le = ue(() => n ? [{
      id: "select",
      size: CT,
      enableResizing: !1,
      enablePinning: !0,
      meta: {
        pinTo: "left"
      },
      header: ({ table: ge }) => i ? /* @__PURE__ */ p(
        Ea,
        {
          className: le(He.checkBoxWrapper, {
            [He.showInHeader]: F
          }),
          value: ge.getIsAllRowsSelected(),
          indeterminate: ge.getIsSomeRowsSelected(),
          onDidChange: (se) => {
            D(se);
          }
        }
      ) : null,
      cell: ({ row: ge }) => /* @__PURE__ */ p(
        Ea,
        {
          className: He.checkBoxWrapper,
          value: ge.getIsSelected(),
          indeterminate: ge.getIsSomeSelected(),
          onDidChange: () => {
            B(ge.original, { metaKey: !0 });
          }
        }
      )
    }, ...ne] : ne, [
      n,
      ne,
      i,
      F,
      D,
      B
    ]), [Pr, Wo] = me({
      pageSize: t ? l[0] : Number.MAX_VALUE,
      pageIndex: 0
    }), Ze = Zn(t);
    K(() => {
      !Ze && t && Wo((ie) => ({
        ...ie,
        pageSize: l[0]
      })), Ze && !t && Wo((ie) => ({
        pageIndex: 0,
        pageSize: Number.MAX_VALUE
      }));
    }, [t, l, Ze]);
    const [Ft, kt] = me({}), bo = ue(() => {
      const ie = [], ge = [];
      return Le.forEach((se) => {
        var ve, ur;
        ((ve = se.meta) == null ? void 0 : ve.pinTo) === "right" && ge.push(se.id), ((ur = se.meta) == null ? void 0 : ur.pinTo) === "left" && ie.push(se.id);
      }), {
        left: ie,
        right: ge
      };
    }, [Le]), Ne = $d({
      columns: Le,
      data: te,
      getCoreRowModel: _d(),
      getPaginationRowModel: t ? Ld() : void 0,
      enableRowSelection: n,
      enableMultiRowSelection: i,
      columnResizeMode: "onChange",
      getRowId: X(
        (ie) => ie[G] + "",
        [G]
      ),
      state: ue(
        () => ({
          pagination: Pr,
          rowSelection: M,
          columnSizing: Ft,
          columnPinning: bo
        }),
        [bo, Ft, Pr, M]
      ),
      onColumnSizingChange: kt,
      onPaginationChange: Wo
    }), Ue = Ne.getRowModel().rows;
    K(() => {
      N(Ue.map((ie) => ie.original));
    }, [Ue]);
    const Ge = $r(vc), fo = Ge && (w == null ? void 0 : w.maxHeight) === void 0 && (w == null ? void 0 : w.height) === void 0 && (w == null ? void 0 : w.flex) === void 0, ql = X(
      (ie, ge) => Ad(ie, (se, ve) => {
        var We;
        const ur = fo && ((We = x.current) == null ? void 0 : We.offsetTop) || 0;
        ge(se - ur, ve);
      }),
      [fo]
    ), ut = Nd({
      count: Ue.length,
      getScrollElement: X(() => fo && (Ge != null && Ge.current) ? Ge == null ? void 0 : Ge.current : x.current, [Ge, fo]),
      observeElementOffset: ql,
      estimateSize: X(() => k.current || 30, []),
      overscan: 5
    }), si = ut.getVirtualItems().length > 0 && ((pi = (mi = ut.getVirtualItems()) == null ? void 0 : mi[0]) == null ? void 0 : pi.start) || 0, ui = ut.getVirtualItems().length > 0 ? ut.getTotalSize() - (((xi = (hi = ut.getVirtualItems()) == null ? void 0 : hi[ut.getVirtualItems().length - 1]) == null ? void 0 : xi.end) || 0) : 0, Oo = z.length !== 0, da = he({}), ci = X((ie) => {
      da.current[ie] = !0;
    }, []), Ro = $e(() => {
      if (!g.current)
        return;
      let ie = g.current.clientWidth - 1;
      const ge = {}, se = [], ve = {};
      Ne.getAllColumns().forEach((We) => {
        var rt, kr;
        if (We.columnDef.size !== void 0 || da.current[We.id])
          ie -= Ft[We.id] || We.columnDef.size || 0;
        else {
          se.push(We);
          let cr;
          (rt = We.columnDef.meta) != null && rt.starSizedWidth ? cr = Number((kr = We.columnDef.meta) == null ? void 0 : kr.starSizedWidth.replace("*", "").trim()) || 1 : cr = 1, ve[We.id] = cr;
        }
      });
      const ur = Object.values(ve).reduce((We, rt) => We + rt, 0);
      se.forEach((We) => {
        ge[We.id] = Math.floor(
          ie * (ve[We.id] / ur)
        );
      }), An(() => {
        kt((We) => ({
          ...We,
          ...ge
        }));
      });
    });
    return Is(g, Ro), $o(() => {
      queueMicrotask(() => {
        Ro();
      });
    }, [Ro, q]), $o(() => {
      Y(J);
    }, [Y, J]), /* @__PURE__ */ j(
      "div",
      {
        className: le(He.wrapper, { [He.noScroll]: fo }),
        tabIndex: -1,
        onKeyDown: I,
        ref: m,
        style: w,
        children: [
          /* @__PURE__ */ j(
            "table",
            {
              className: He.table,
              ref: g,
              style: { borderRight: "1px solid transparent" },
              children: [
                !$ && /* @__PURE__ */ p("thead", { style: { height: a }, className: He.headerWrapper, children: Ne.getHeaderGroups().map((ie, ge) => /* @__PURE__ */ p(
                  "tr",
                  {
                    className: le(He.headerRow, {
                      [He.allSelected]: Ne.getIsAllRowsSelected()
                    }),
                    children: ie.headers.map((se, ve) => {
                      var kr, cr;
                      const { width: ur, ...We } = ((kr = se.column.columnDef.meta) == null ? void 0 : kr.style) || {}, rt = se.getSize();
                      return /* @__PURE__ */ j(
                        "th",
                        {
                          className: He.columnCell,
                          colSpan: se.colSpan,
                          style: {
                            position: "relative",
                            width: rt,
                            ...un(se.column)
                          },
                          children: [
                            /* @__PURE__ */ p(
                              wT,
                              {
                                hasSorting: se.column.columnDef.enableSorting,
                                updateSorting: () => {
                                  var Mr;
                                  return Q((Mr = se.column.columnDef.meta) == null ? void 0 : Mr.accessorKey);
                                },
                                children: /* @__PURE__ */ j("div", { className: He.headerContent, style: We, children: [
                                  Ti(
                                    se.column.columnDef.header,
                                    se.getContext()
                                  ),
                                  /* @__PURE__ */ p("span", { style: { display: "inline-flex", maxWidth: 16 }, children: se.column.columnDef.enableSorting && /* @__PURE__ */ p(
                                    HT,
                                    {
                                      iconSortAsc: c,
                                      iconSortDesc: T,
                                      iconNoSort: b,
                                      direction: ((cr = se.column.columnDef.meta) == null ? void 0 : cr.accessorKey) === Ce ? Ee : void 0
                                    }
                                  ) })
                                ] })
                              }
                            ),
                            se.column.getCanResize() && /* @__PURE__ */ p(
                              "div",
                              {
                                onDoubleClick: () => {
                                  da.current[se.column.id] = !1, se.column.columnDef.size !== void 0 ? se.column.resetSize() : Ro();
                                },
                                onMouseDown: (Mr) => {
                                  ci(se.column.id), se.getResizeHandler()(Mr);
                                },
                                onTouchStart: (Mr) => {
                                  ci(se.column.id), se.getResizeHandler()(Mr);
                                },
                                className: le(He.resizer, {
                                  [He.isResizing]: se.column.getIsResizing()
                                })
                              }
                            )
                          ]
                        },
                        `${se.id}-${ve}`
                      );
                    })
                  },
                  `${ie.id}-${ge}`
                )) }),
                Oo && /* @__PURE__ */ j("tbody", { className: He.tableBody, children: [
                  si > 0 && /* @__PURE__ */ p("tr", { children: /* @__PURE__ */ p("td", { style: { height: `${si}px` } }) }),
                  ut.getVirtualItems().map((ie) => {
                    const ge = ie.index, se = Ue[ge];
                    return /* @__PURE__ */ p(
                      "tr",
                      {
                        "data-index": ge,
                        className: le(He.row, {
                          [He.selected]: se.getIsSelected(),
                          [He.focused]: P === ge,
                          [He.disabled]: s(se.original)
                        }),
                        ref: (ve) => {
                          ve && k.current === null && (k.current = Math.round(ve.getBoundingClientRect().height)), ut.measureElement(ve);
                        },
                        onClick: (ve) => {
                          ve.defaultPrevented || ve.target.tagName.toLowerCase() === "input" || B(se.original, ve);
                        },
                        children: se.getVisibleCells().map((ve, ur) => {
                          var kr, cr;
                          const We = (cr = (kr = ve.column.columnDef) == null ? void 0 : kr.meta) == null ? void 0 : cr.cellRenderer, rt = ve.column.getSize();
                          return /* @__PURE__ */ p(
                            "td",
                            {
                              className: He.cell,
                              style: {
                                // width: size,
                                width: rt,
                                ...un(ve.column)
                              },
                              children: We ? We(ve.row.original, ge, ur, ve == null ? void 0 : ve.getValue()) : Ti(
                                ve.column.columnDef.cell,
                                ve.getContext()
                              )
                            },
                            `${ve.id}-${ur}`
                          );
                        })
                      },
                      `${se.id}-${ge}`
                    );
                  }),
                  ui > 0 && /* @__PURE__ */ p("tr", { children: /* @__PURE__ */ p("td", { style: { height: `${ui}px` } }) })
                ] })
              ]
            }
          ),
          o && !Oo && /* @__PURE__ */ p("div", { className: He.loadingWrapper, children: /* @__PURE__ */ p(tl, {}) }),
          !O && !o && !Oo && (_ ? _() : /* @__PURE__ */ p("div", { className: He.noRows, children: "No data available" })),
          t && Oo && Ue.length > 0 && Pr && // --- Render the pagination controls
          /* @__PURE__ */ j("div", { className: He.pagination, children: [
            /* @__PURE__ */ p("div", { style: { flex: 1 }, children: /* @__PURE__ */ j("span", { className: He.paginationLabel, children: [
              "Showing ",
              Ue[0].original.order,
              " to ",
              Ue[Ue.length - 1].original.order,
              " of",
              " ",
              z.length,
              " entries"
            ] }) }),
            l.length > 1 && /* @__PURE__ */ j("div", { children: [
              /* @__PURE__ */ p("span", { className: He.paginationLabel, children: "Rows per page" }),
              /* @__PURE__ */ p(
                "select",
                {
                  className: He.paginationSelect,
                  value: Pr.pageSize,
                  onChange: (ie) => {
                    Ne.setPageSize(Number(ie.target.value));
                  },
                  children: l.map((ie) => /* @__PURE__ */ p("option", { value: ie, children: ie }, ie))
                }
              )
            ] }),
            /* @__PURE__ */ j("div", { className: He.paginationButtons, children: [
              /* @__PURE__ */ p(
                dr,
                {
                  onClick: () => Ne.setPageIndex(0),
                  disabled: !Ne.getCanPreviousPage(),
                  type: "button",
                  variant: "ghost",
                  children: /* @__PURE__ */ p(vT, {})
                }
              ),
              /* @__PURE__ */ p(
                dr,
                {
                  onClick: () => Ne.previousPage(),
                  disabled: !Ne.getCanPreviousPage(),
                  type: "button",
                  variant: "ghost",
                  children: /* @__PURE__ */ p(bT, {})
                }
              ),
              /* @__PURE__ */ p(
                dr,
                {
                  onClick: () => Ne.nextPage(),
                  disabled: !Ne.getCanNextPage(),
                  type: "button",
                  variant: "ghost",
                  children: /* @__PURE__ */ p(fT, {})
                }
              ),
              /* @__PURE__ */ p(
                dr,
                {
                  onClick: () => Ne.setPageIndex(Ne.getPageCount() - 1),
                  disabled: !Ne.getCanNextPage(),
                  type: "button",
                  variant: "ghost",
                  children: /* @__PURE__ */ p(gT, {})
                }
              )
            ] })
          ] })
        ]
      }
    );
  }
);
function wT({ hasSorting: e, updateSorting: r, children: t }) {
  return e ? /* @__PURE__ */ p("button", { className: He.clickableHeader, onClick: r, children: t }) : /* @__PURE__ */ p(gr, { children: t });
}
function HT({
  direction: e,
  iconSortAsc: r = "sortasc:Table",
  iconSortDesc: t = "sortdesc:Table",
  iconNoSort: o = "nosort:Table"
}) {
  return e === "ascending" ? /* @__PURE__ */ p(ye, { name: r, fallback: "sortasc", size: "12" }) : e === "descending" ? /* @__PURE__ */ p(ye, { name: t, fallback: "sortdesc", size: "12" }) : o !== "-" ? /* @__PURE__ */ p(ye, { name: o, fallback: "nosort", size: "12" }) : /* @__PURE__ */ p(ye, { name: o, size: "12" });
}
const pe = "Table", BT = C({
  description: `\`${pe}\` is a component that displays cells organized into rows and columns. The \`${pe}\` component is virtualized so it only renders visible cells.`,
  props: {
    items: Pe(
      "You can use `items` as an alias for the `data` property. When you bind the table to a data source (e.g. an API endpoint), the `data` acts as the property that accepts a URL to fetch information from an API. When both `items` and `data` are used, `items` has priority."
    ),
    data: u(
      "The component receives data via this property. The `data` property is a list of items that the `Table` can display."
    ),
    isPaginated: {
      description: `This property adds pagination controls to the \`${pe}\`.`,
      valueType: "boolean",
      defaultValue: !1
    },
    loading: u(
      "This boolean property indicates if the component is fetching (or processing) data. This property is useful when data is loaded conditionally or receiving it takes some time."
    ),
    headerHeight: u("This optional property is used to specify the height of the table header."),
    rowsSelectable: u("Indicates whether the rows are selectable (`true`) or not (`false`)."),
    pageSizes: {
      description: "This property holds an array of page sizes (numbers) the user can select for pagination. If this property is not defined, the component allows only a page size of 10 items."
    },
    rowDisabledPredicate: u(
      "This property defines a predicate function with a return value that determines if the row should be disabled. The function retrieves the item to display and should return a Boolean-like value."
    ),
    noDataTemplate: Re(
      "A property to customize what to display if the table does not contain any data."
    ),
    sortBy: u("This property is used to determine which data attributes to sort by."),
    sortDirection: u(
      "This property determines the sort order to be `ascending` or `descending`. This property only works if the [`sortBy`](#sortby) property is also set."
    ),
    autoFocus: rr(),
    hideHeader: {
      description: "Set the header visibility using this property. Set it to `true` to hide the header.",
      valueType: "boolean",
      defaultValue: !1
    },
    iconNoSort: u(
      `Allows setting the icon displayed in the ${pe} column header when sorting is enabled, but the column remains unsorted.`
    ),
    iconSortAsc: u(
      `Allows setting the icon displayed in the ${pe} column header when sorting is enabled, and the column is sorted in ascending order.`
    ),
    iconSortDesc: u(
      `Allows setting the icon displayed in the ${pe} column header when sorting is enabled, and the column is sorted in descending order.`
    ),
    enableMultiRowSelection: {
      description: "This boolean property indicates whether you can select multiple rows in the table. This property only has an effect when the rowsSelectable property is set. Setting it to `false` limits selection to a single row.",
      valueType: "boolean",
      defaultValue: !0
    },
    alwaysShowSelectionHeader: {
      description: "This property indicates when the row selection header is displayed. When the value is `true,` the selection header is always visible. Otherwise, it is displayed only when hovered.",
      valueType: "boolean",
      defaultValue: !1
    }
  },
  events: {
    sortingDidChange: u(
      "This event is fired when the table data sorting has changed. It has two arguments: the column's name and the sort direction. When the column name is empty, the table displays the data list as it received it."
    ),
    willSort: u(
      "This event is fired before the table data is sorted. It has two arguments: the column's name and the sort direction. When the method returns a literal `false` value (and not any other falsy one), the method indicates that the sorting should be aborted."
    ),
    selectionDidChange: u(
      "This event is triggered when the table's current selection (the rows selected) changes. Its parameter is an array of the selected table row items. "
    )
  },
  apis: {
    clearSelection: u("This method clears the list of currently selected table rows."),
    getSelectedItems: u("This method returns the list of currently selected table rows items."),
    getSelectedIds: u("This method returns the list of currently selected table rows IDs."),
    selectAll: u(
      "This method selects all the rows in the table. This method has no effect if the rowsSelectable property is set to `false`."
    ),
    selectId: u(
      "This method selects the row with the specified ID. This method has no effect if the `rowsSelectable` property is set to `false`. The method argument can be a single id or an array of them."
    )
  },
  themeVars: Z(He.themeVars),
  defaultThemeVars: {
    [`padding-heading-${pe}`]: "$space-2",
    [`paddingHorizontal-cell-${pe}`]: "$space-2",
    [`paddingHorizontal-cell-first-${pe}`]: "$space-5",
    [`paddingHorizontal-cell-last-${pe}`]: "$space-5",
    [`paddingVertical-cell-${pe}`]: "$space-2",
    [`border-cell-${pe}`]: "1px solid $borderColor",
    [`outlineWidth-heading-${pe}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-heading-${pe}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-heading-${pe}--focus`]: "$outlineOffset--focus",
    [`fontSize-heading-${pe}`]: "$fontSize-tiny",
    [`fontWeight-heading-${pe}`]: "$fontWeight-bold",
    [`textTransform-heading-${pe}`]: "uppercase",
    [`fontSize-row-${pe}`]: "$fontSize-small",
    [`backgroundColor-${pe}`]: "$backgroundColor",
    [`backgroundColor-row-${pe}`]: "inherit",
    [`backgroundColor-selected-${pe}--hover`]: `$backgroundColor-row-${pe}--hover`,
    [`backgroundColor-pagination-${pe}`]: `$backgroundColor-${pe}`,
    [`outlineColor-heading-${pe}--focus`]: "$outlineColor--focus",
    [`color-pagination-${pe}`]: "$color-secondary",
    light: {
      [`backgroundColor-row-${pe}--hover`]: "$color-primary-50",
      [`backgroundColor-selected-${pe}`]: "$color-primary-100",
      [`backgroundColor-heading-${pe}--hover`]: "$color-surface-200",
      [`backgroundColor-heading-${pe}--active`]: "$color-surface-300",
      [`backgroundColor-heading-${pe}`]: "$color-surface-100",
      [`color-heading-${pe}`]: "$color-surface-500"
    },
    dark: {
      [`backgroundColor-row-${pe}--hover`]: "$color-primary-900",
      [`backgroundColor-selected-${pe}`]: "$color-primary-800",
      [`backgroundColor-heading-${pe}--hover`]: "$color-surface-800",
      [`backgroundColor-heading-${pe}`]: "$color-surface-950",
      [`backgroundColor-heading-${pe}--active`]: "$color-surface-700"
    }
  }
});
xe(
  ({
    extractValue: e,
    node: r,
    renderChild: t,
    lookupEventHandler: o,
    lookupSyncCallback: a,
    layoutCss: n,
    registerComponentApi: i
  }, l) => {
    var F, Y, V, R, W, z;
    const s = e(r.props.items) || e(r.props.data), [f, h] = me(lr), [c, T] = me(Ot), b = he([]), [v, y] = me(0), w = ue(() => ({
      registerColumn: (x, m) => {
        h(
          At((g) => {
            g.findIndex((A) => A === m) < 0 && g.push(m);
          })
        ), T(
          At((g) => {
            g[m] = x;
          })
        );
      },
      unRegisterColumn: (x) => {
        h(
          At((m) => m.filter((g) => g !== x))
        ), T(
          At((m) => {
            delete m[x];
          })
        );
      }
    }), []), _ = ue(() => ({
      registerColumn: (x, m) => {
        b.current.find((g) => g === m) || (y((g) => g + 1), b.current.push(m));
      },
      unRegisterColumn: (x) => {
        b.current.find((m) => m === x) && (b.current = b.current.filter((m) => m !== x), y((m) => m + 1));
      }
    }), []), H = ue(
      () => f.map((x) => c[x]),
      [f, c]
    ), $ = Pl(), O = /* @__PURE__ */ j(gr, { children: [
      /* @__PURE__ */ p(sn.Provider, { value: w, children: t(r.children) }, v),
      /* @__PURE__ */ p(sn.Provider, { value: _, children: t(r.children) }),
      /* @__PURE__ */ p(
        ST,
        {
          ref: l,
          data: s,
          columns: H,
          pageSizes: e(r.props.pageSizes),
          rowsSelectable: e.asOptionalBoolean(r.props.rowsSelectable),
          registerComponentApi: i,
          noDataRenderer: r.props.noDataTemplate && (() => t(r.props.noDataTemplate)),
          hideNoDataView: r.props.noDataTemplate === null || r.props.noDataTemplate === "",
          loading: e.asOptionalBoolean(r.props.loading),
          isPaginated: e.asOptionalBoolean((F = r.props) == null ? void 0 : F.isPaginated),
          headerHeight: e.asSize(r.props.headerHeight),
          rowDisabledPredicate: a(r.props.rowDisabledPredicate),
          sortBy: e((Y = r.props) == null ? void 0 : Y.sortBy),
          sortingDirection: e((V = r.props) == null ? void 0 : V.sortDirection),
          iconSortAsc: e.asOptionalString((R = r.props) == null ? void 0 : R.iconSortAsc),
          iconSortDesc: e.asOptionalString((W = r.props) == null ? void 0 : W.iconSortDesc),
          iconNoSort: e.asOptionalString((z = r.props) == null ? void 0 : z.iconNoSort),
          sortingDidChange: o("sortingDidChange"),
          onSelectionDidChange: o("selectionDidChange"),
          willSort: o("willSort"),
          style: n,
          uid: r.uid,
          autoFocus: e.asOptionalBoolean(r.props.autoFocus),
          hideHeader: e.asOptionalBoolean(r.props.hideHeader),
          enableMultiRowSelection: e.asOptionalBoolean(
            r.props.enableMultiRowSelection
          ),
          alwaysShowSelectionHeader: e.asOptionalBoolean(
            r.props.alwaysShowSelectionHeader
          )
        }
      )
    ] });
    return $ === null ? /* @__PURE__ */ p(Ig, { children: O }) : O;
  }
);
const IT = "Column", $T = C({
  description: `The \`${IT}\` component can be used within a \`Table\` to define a particular table column's visual properties and data bindings.`,
  props: {
    bindTo: {
      description: "Indicates what part of the data to lay out in the column.",
      valueType: "string"
    },
    header: {
      description: "Adds a label for a particular column.",
      valueType: "string"
    },
    width: {
      description: "This property defines the width of the column. You can use a numeric value, a pixel value (such as `100px`), or a star size value (such as `*`, `2*`, etc.). You will get an error if you use any other unit (or value).",
      valueType: "any"
    },
    minWidth: {
      description: "Indicates the minimum width a particular column can have. Same rules apply as with [width](#width).",
      valueType: "any"
    },
    maxWidth: {
      description: "Indicates the maximum width a particular column can have. Same rules apply as with [width](#width).",
      valueType: "any"
    },
    canSort: {
      description: "This property sets whether the user can sort by a column by clicking on its header (`true`) or not (`false`).",
      valueType: "boolean"
    },
    pinTo: {
      description: "This property allows the column to be pinned to the `left` (left-to-right writing style) or `right` (left-to-right writing style) edge of the table. If the writing style is right-to-left, the locations are switched.",
      availableValues: ["left", "right"],
      valueType: "string"
    },
    canResize: {
      description: "This property indicates whether the user can resize the column. If set to `true`, the column can be resized by dragging the column border. If set to `false`, the column cannot be resized. Double-clicking the column border resets to the original size.",
      valueType: "boolean"
    }
  },
  contextVars: {
    $item: {
      description: "The data item being rendered."
    },
    $row: {
      description: "The data item being rendered (the same as `$item`)."
    },
    $itemIndex: {
      description: "The index of the data item being rendered."
    },
    $rowIndex: {
      description: "The index of the data item being rendered (the same as `$itemIndex`)."
    },
    $colIndex: {
      description: "The index of the column being rendered."
    },
    $cell: {
      description: "The value of the cell being rendered."
    }
  }
}), LT = `'{"padding-TableOfContentsItem": "var(--xmlui-padding-TableOfContentsItem)", "paddingHorizontal-TableOfContentsItem": "var(--xmlui-paddingHorizontal-TableOfContentsItem, var(--xmlui-padding-TableOfContentsItem))", "paddingVertical-TableOfContentsItem": "var(--xmlui-paddingVertical-TableOfContentsItem, var(--xmlui-padding-TableOfContentsItem))", "paddingLeft-TableOfContentsItem": "var(--xmlui-paddingLeft-TableOfContentsItem, var(--xmlui-paddingHorizontal-TableOfContentsItem, var(--xmlui-padding-TableOfContentsItem)))", "paddingRight-TableOfContentsItem": "var(--xmlui-paddingRight-TableOfContentsItem, var(--xmlui-paddingHorizontal-TableOfContentsItem, var(--xmlui-padding-TableOfContentsItem)))", "paddingTop-TableOfContentsItem": "var(--xmlui-paddingTop-TableOfContentsItem, var(--xmlui-paddingVertical-TableOfContentsItem, var(--xmlui-padding-TableOfContentsItem)))", "paddingBottom-TableOfContentsItem": "var(--xmlui-paddingBottom-TableOfContentsItem, var(--xmlui-paddingVertical-TableOfContentsItem, var(--xmlui-padding-TableOfContentsItem)))", "padding-TableOfContentsItem-level-1": "var(--xmlui-padding-TableOfContentsItem-level-1)", "paddingHorizontal-TableOfContentsItem-level-1": "var(--xmlui-paddingHorizontal-TableOfContentsItem-level-1, var(--xmlui-padding-TableOfContentsItem-level-1))", "paddingVertical-TableOfContentsItem-level-1": "var(--xmlui-paddingVertical-TableOfContentsItem-level-1, var(--xmlui-padding-TableOfContentsItem-level-1))", "paddingLeft-TableOfContentsItem-level-1": "var(--xmlui-paddingLeft-TableOfContentsItem-level-1, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-1, var(--xmlui-padding-TableOfContentsItem-level-1)))", "paddingRight-TableOfContentsItem-level-1": "var(--xmlui-paddingRight-TableOfContentsItem-level-1, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-1, var(--xmlui-padding-TableOfContentsItem-level-1)))", "paddingTop-TableOfContentsItem-level-1": "var(--xmlui-paddingTop-TableOfContentsItem-level-1, var(--xmlui-paddingVertical-TableOfContentsItem-level-1, var(--xmlui-padding-TableOfContentsItem-level-1)))", "paddingBottom-TableOfContentsItem-level-1": "var(--xmlui-paddingBottom-TableOfContentsItem-level-1, var(--xmlui-paddingVertical-TableOfContentsItem-level-1, var(--xmlui-padding-TableOfContentsItem-level-1)))", "padding-TableOfContentsItem-level-2": "var(--xmlui-padding-TableOfContentsItem-level-2)", "paddingHorizontal-TableOfContentsItem-level-2": "var(--xmlui-paddingHorizontal-TableOfContentsItem-level-2, var(--xmlui-padding-TableOfContentsItem-level-2))", "paddingVertical-TableOfContentsItem-level-2": "var(--xmlui-paddingVertical-TableOfContentsItem-level-2, var(--xmlui-padding-TableOfContentsItem-level-2))", "paddingLeft-TableOfContentsItem-level-2": "var(--xmlui-paddingLeft-TableOfContentsItem-level-2, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-2, var(--xmlui-padding-TableOfContentsItem-level-2)))", "paddingRight-TableOfContentsItem-level-2": "var(--xmlui-paddingRight-TableOfContentsItem-level-2, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-2, var(--xmlui-padding-TableOfContentsItem-level-2)))", "paddingTop-TableOfContentsItem-level-2": "var(--xmlui-paddingTop-TableOfContentsItem-level-2, var(--xmlui-paddingVertical-TableOfContentsItem-level-2, var(--xmlui-padding-TableOfContentsItem-level-2)))", "paddingBottom-TableOfContentsItem-level-2": "var(--xmlui-paddingBottom-TableOfContentsItem-level-2, var(--xmlui-paddingVertical-TableOfContentsItem-level-2, var(--xmlui-padding-TableOfContentsItem-level-2)))", "padding-TableOfContentsItem-level-3": "var(--xmlui-padding-TableOfContentsItem-level-3)", "paddingHorizontal-TableOfContentsItem-level-3": "var(--xmlui-paddingHorizontal-TableOfContentsItem-level-3, var(--xmlui-padding-TableOfContentsItem-level-3))", "paddingVertical-TableOfContentsItem-level-3": "var(--xmlui-paddingVertical-TableOfContentsItem-level-3, var(--xmlui-padding-TableOfContentsItem-level-3))", "paddingLeft-TableOfContentsItem-level-3": "var(--xmlui-paddingLeft-TableOfContentsItem-level-3, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-3, var(--xmlui-padding-TableOfContentsItem-level-3)))", "paddingRight-TableOfContentsItem-level-3": "var(--xmlui-paddingRight-TableOfContentsItem-level-3, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-3, var(--xmlui-padding-TableOfContentsItem-level-3)))", "paddingTop-TableOfContentsItem-level-3": "var(--xmlui-paddingTop-TableOfContentsItem-level-3, var(--xmlui-paddingVertical-TableOfContentsItem-level-3, var(--xmlui-padding-TableOfContentsItem-level-3)))", "paddingBottom-TableOfContentsItem-level-3": "var(--xmlui-paddingBottom-TableOfContentsItem-level-3, var(--xmlui-paddingVertical-TableOfContentsItem-level-3, var(--xmlui-padding-TableOfContentsItem-level-3)))", "padding-TableOfContentsItem-level-4": "var(--xmlui-padding-TableOfContentsItem-level-4)", "paddingHorizontal-TableOfContentsItem-level-4": "var(--xmlui-paddingHorizontal-TableOfContentsItem-level-4, var(--xmlui-padding-TableOfContentsItem-level-4))", "paddingVertical-TableOfContentsItem-level-4": "var(--xmlui-paddingVertical-TableOfContentsItem-level-4, var(--xmlui-padding-TableOfContentsItem-level-4))", "paddingLeft-TableOfContentsItem-level-4": "var(--xmlui-paddingLeft-TableOfContentsItem-level-4, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-4, var(--xmlui-padding-TableOfContentsItem-level-4)))", "paddingRight-TableOfContentsItem-level-4": "var(--xmlui-paddingRight-TableOfContentsItem-level-4, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-4, var(--xmlui-padding-TableOfContentsItem-level-4)))", "paddingTop-TableOfContentsItem-level-4": "var(--xmlui-paddingTop-TableOfContentsItem-level-4, var(--xmlui-paddingVertical-TableOfContentsItem-level-4, var(--xmlui-padding-TableOfContentsItem-level-4)))", "paddingBottom-TableOfContentsItem-level-4": "var(--xmlui-paddingBottom-TableOfContentsItem-level-4, var(--xmlui-paddingVertical-TableOfContentsItem-level-4, var(--xmlui-padding-TableOfContentsItem-level-4)))", "padding-TableOfContentsItem-level-5": "var(--xmlui-padding-TableOfContentsItem-level-5)", "paddingHorizontal-TableOfContentsItem-level-5": "var(--xmlui-paddingHorizontal-TableOfContentsItem-level-5, var(--xmlui-padding-TableOfContentsItem-level-5))", "paddingVertical-TableOfContentsItem-level-5": "var(--xmlui-paddingVertical-TableOfContentsItem-level-5, var(--xmlui-padding-TableOfContentsItem-level-5))", "paddingLeft-TableOfContentsItem-level-5": "var(--xmlui-paddingLeft-TableOfContentsItem-level-5, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-5, var(--xmlui-padding-TableOfContentsItem-level-5)))", "paddingRight-TableOfContentsItem-level-5": "var(--xmlui-paddingRight-TableOfContentsItem-level-5, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-5, var(--xmlui-padding-TableOfContentsItem-level-5)))", "paddingTop-TableOfContentsItem-level-5": "var(--xmlui-paddingTop-TableOfContentsItem-level-5, var(--xmlui-paddingVertical-TableOfContentsItem-level-5, var(--xmlui-padding-TableOfContentsItem-level-5)))", "paddingBottom-TableOfContentsItem-level-5": "var(--xmlui-paddingBottom-TableOfContentsItem-level-5, var(--xmlui-paddingVertical-TableOfContentsItem-level-5, var(--xmlui-padding-TableOfContentsItem-level-5)))", "padding-TableOfContentsItem-level-6": "var(--xmlui-padding-TableOfContentsItem-level-6)", "paddingHorizontal-TableOfContentsItem-level-6": "var(--xmlui-paddingHorizontal-TableOfContentsItem-level-6, var(--xmlui-padding-TableOfContentsItem-level-6))", "paddingVertical-TableOfContentsItem-level-6": "var(--xmlui-paddingVertical-TableOfContentsItem-level-6, var(--xmlui-padding-TableOfContentsItem-level-6))", "paddingLeft-TableOfContentsItem-level-6": "var(--xmlui-paddingLeft-TableOfContentsItem-level-6, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-6, var(--xmlui-padding-TableOfContentsItem-level-6)))", "paddingRight-TableOfContentsItem-level-6": "var(--xmlui-paddingRight-TableOfContentsItem-level-6, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-6, var(--xmlui-padding-TableOfContentsItem-level-6)))", "paddingTop-TableOfContentsItem-level-6": "var(--xmlui-paddingTop-TableOfContentsItem-level-6, var(--xmlui-paddingVertical-TableOfContentsItem-level-6, var(--xmlui-padding-TableOfContentsItem-level-6)))", "paddingBottom-TableOfContentsItem-level-6": "var(--xmlui-paddingBottom-TableOfContentsItem-level-6, var(--xmlui-paddingVertical-TableOfContentsItem-level-6, var(--xmlui-padding-TableOfContentsItem-level-6)))", "backgroundColor-TableOfContents": "var(--xmlui-backgroundColor-TableOfContents)", "width-TableOfContents": "var(--xmlui-width-TableOfContents)", "height-TableOfContents": "var(--xmlui-height-TableOfContents)", "borderRadius-TableOfContents": "var(--xmlui-borderRadius-TableOfContents)", "borderColor-TableOfContents": "var(--xmlui-borderColor-TableOfContents)", "borderWidth-TableOfContents": "var(--xmlui-borderWidth-TableOfContents)", "borderStyle-TableOfContents": "var(--xmlui-borderStyle-TableOfContents)", "marginTop-TableOfContents": "var(--xmlui-marginTop-TableOfContents)", "marginBottom-TableOfContents": "var(--xmlui-marginBottom-TableOfContents)", "paddingVertical-TableOfContents": "var(--xmlui-paddingVertical-TableOfContents)", "paddingHorizontal-TableOfContents": "var(--xmlui-paddingHorizontal-TableOfContents)", "border-width-TableOfContentsItem": "var(--xmlui-border-width-TableOfContentsItem)", "border-style-TableOfContentsItem": "var(--xmlui-border-style-TableOfContentsItem)", "border-color-TableOfContentsItem": "var(--xmlui-border-color-TableOfContentsItem)", "color-TableOfContentsItem": "var(--xmlui-color-TableOfContentsItem)", "fontSize-TableOfContentsItem": "var(--xmlui-fontSize-TableOfContentsItem)", "fontWeight-TableOfContentsItem": "var(--xmlui-fontWeight-TableOfContentsItem)", "fontFamily-TableOfContentsItem": "var(--xmlui-fontFamily-TableOfContentsItem)", "textTransform-TableOfContentsItem": "var(--xmlui-textTransform-TableOfContentsItem)", "verticalAlign-TableOfContentsItem": "var(--xmlui-verticalAlign-TableOfContentsItem)", "letterSpacing-TableOfContentsItem": "var(--xmlui-letterSpacing-TableOfContentsItem)", "border-color-TableOfContentsItem--active": "var(--xmlui-border-color-TableOfContentsItem--active)", "color-TableOfContentsItem--active": "var(--xmlui-color-TableOfContentsItem--active)", "fontWeight-TableOfContentsItem--active": "var(--xmlui-fontWeight-TableOfContentsItem--active)"}'`, _T = {
  themeVars: LT
}, ce = "TableOfContents", AT = C({
  status: "experimental",
  description: `The \`${ce}\` component collects headings and bookmarks within the current page and displays them in a tree representing their hierarchy. When you select an item in this tree, the component navigates the page to the selected position.`,
  props: {
    smoothScrolling: {
      description: "This property indicates that smooth scrolling is used while scrolling the selected table of contents items into view.",
      valueType: "boolean",
      defaultValue: "false"
    },
    maxHeadingLevel: {
      description: "Defines the maximum heading level (1 to 6) to include in the table of contents. For example, if it is 2, then `H1` and `H2` are displayed, but lower levels (`H3` to `H6`) are not.",
      valueType: "number",
      defaultValue: "6"
    }
  },
  themeVars: Z(_T.themeVars),
  defaultThemeVars: {
    [`width-${ce}`]: "auto",
    [`height-${ce}`]: "auto",
    [`fontSize-${ce}Item`]: "$fontSize-smaller",
    [`fontWeight-${ce}Item`]: "$fontWeight-normal",
    [`fontFamily-${ce}Item`]: "$fontFamily",
    [`borderRadius-${ce}Item`]: "0",
    [`border-width-${ce}Item`]: "$space-0_5",
    [`border-style-${ce}Item`]: "solid",
    [`borderRadius-${ce}Item--active`]: "0",
    [`border-width-${ce}Item--active`]: "$space-0_5",
    [`border-style-${ce}Item--active`]: "solid",
    [`fontWeight-${ce}Item--active`]: "$fontWeight-bold",
    [`backgroundColor-${ce}`]: "transparent",
    [`paddingHorizontal-${ce}`]: "$space-8",
    [`paddingVertical-${ce}`]: "$space-4",
    [`paddingHorizontal-${ce}Item`]: "$space-2",
    [`paddingVertical-${ce}Item`]: "$space-2",
    [`paddingHorizontal-${ce}Item-level-1`]: "unset",
    [`paddingHorizontal-${ce}Item-level-2`]: "unset",
    [`paddingHorizontal-${ce}Item-level-3`]: "unset",
    [`paddingHorizontal-${ce}Item-level-4`]: "unset",
    [`paddingHorizontal-${ce}Item-level-5`]: "unset",
    [`paddingHorizontal-${ce}Item-level-6`]: "unset",
    [`marginTop-${ce}`]: "0",
    [`marginBottom-${ce}`]: "0",
    [`borderRadius-${ce}`]: "0",
    [`border-width-${ce}`]: "0",
    [`border-color-${ce}`]: "transparent",
    [`border-style-${ce}`]: "solid",
    [`textTransform-${ce}Item`]: "none",
    [`verticalAlign-${ce}Item`]: "baseline",
    [`letterSpacing-${ce}Item`]: "0",
    light: {
      [`color-${ce}Item`]: "$textColor-primary",
      [`border-color-${ce}Item`]: "$borderColor",
      [`border-color-${ce}Item--active`]: "$color-primary-500",
      [`color-${ce}Item--active`]: "$color-primary-500"
    },
    dark: {
      [`color-${ce}Item`]: "$textColor-primary",
      [`border-color-${ce}Item`]: "$borderColor",
      [`border-color-${ce}Item--active`]: "$color-primary-500",
      [`color-${ce}Item--active`]: "$textColor-secondary"
    }
  }
}), NT = `'{"backgroundColor-Tabs": "var(--xmlui-backgroundColor-Tabs)", "borderColor-Tabs": "var(--xmlui-borderColor-Tabs)", "borderWidth-Tabs": "var(--xmlui-borderWidth-Tabs)", "borderColor-active-Tabs": "var(--xmlui-borderColor-active-Tabs)", "backgroundColor-trigger-Tabs": "var(--xmlui-backgroundColor-trigger-Tabs)", "color-trigger-Tabs": "var(--xmlui-color-trigger-Tabs)", "backgroundColor-trigger-Tabs--hover": "var(--xmlui-backgroundColor-trigger-Tabs--hover)", "backgroundColor-list-Tabs": "var(--xmlui-backgroundColor-list-Tabs)"}'`, WT = {
  themeVars: NT
}, br = "Tabs", OT = C({
  status: "experimental",
  description: `The \`${br}\` component provides a tabbed layout where each tab has a clickable label and content.`,
  props: {
    activeTab: u(
      "This property indicates the index of the active tab. The indexing starts from 0, representing the starting (leftmost) tab."
    ),
    orientation: {
      description: "This property indicates the orientation of the component. In horizontal orientation, the tab sections are laid out on the left side of the content panel, while in vertical orientation, the buttons are at the top.",
      availableValues: ["horizontal", "vertical"],
      defaultValue: "vertical",
      valueType: "string"
    },
    tabTemplate: Re("This property declares the template for the clickable tab area.")
  },
  apis: {
    next: u("This method selects the next tab.")
  },
  themeVars: Z(WT.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${br}`]: "$backgroundColor-primary",
    [`borderStyle-${br}`]: "solid",
    [`borderColor-${br}`]: "$borderColor",
    [`borderColor-active-${br}`]: "$color-primary",
    [`borderWidth-${br}`]: "2px",
    [`backgroundColor-trigger-${br}`]: "$backgroundColor-primary",
    light: {
      [`backgroundColor-trigger-${br}--hover`]: "$color-primary-50",
      [`backgroundColor-list-${br}`]: "$color-primary-50",
      [`color-trigge-r${br}`]: "$color-primary-100"
    },
    dark: {
      [`backgroundColor-trigger-${br}--hover`]: "$color-primary-800",
      [`backgroundColor-list-${br}`]: "$color-primary-800",
      [`color-trigge-r${br}`]: "$color-primary-100"
    }
  }
}), re = "Text", RT = C({
  description: `The \`${re}\` component displays textual information in a number of optional styles and variants.`,
  props: {
    value: u(
      `The text to be displayed. This value can also be set via nesting the text into the \`${re}\` component.`
    ),
    variant: {
      description: "An optional string value that provides named presets for text variants with a unique combination of font style, weight, size, color, and other parameters. If not defined, the text uses the current style of its context.",
      availableValues: xs
    },
    maxLines: u(
      "This property determines the maximum number of lines the component can wrap to. If there is no space to display all the contents, the component displays up to as many lines as specified in this property. When the value is not defined, there is no limit on the displayed lines."
    ),
    preserveLinebreaks: {
      description: "This property indicates if linebreaks should be preserved when displaying text.",
      valueType: "boolean",
      defaultValue: "false"
    },
    ellipses: {
      description: "This property indicates whether ellipses should be displayed when the text is cropped (`true`) or not (`false`).",
      valueType: "boolean",
      defaultValue: !1
    }
  },
  themeVars: Z(Kt.themeVars),
  defaultThemeVars: {
    [`borderRadius-${re}`]: "$borderRadius",
    [`borderStyle-${re}`]: "solid",
    [`fontSize-${re}`]: "$fontSize-small",
    [`borderWidth-${re}`]: "$space-0",
    [`fontWeight-${re}-abbr`]: "$fontWeight-bold",
    [`textTransform-${re}-abbr`]: "uppercase",
    [`fontSize-${re}-secondary`]: "$fontSize-small",
    [`font-style-${re}-cite`]: "italic",
    [`color-${re}`]: "$textColor-primary",
    [`fontFamily-${re}`]: "$fontFamily",
    [`fontWeight-${re}`]: "$fontWeight-normal",
    [`fontFamily-${re}-code`]: "$fontFamily-monospace",
    [`fontSize-${re}-code`]: "$fontSize-small",
    [`borderWidth-${re}-code`]: "1px",
    [`paddingHorizontal-${re}-code`]: "$space-1",
    [`textDecorationLine-${re}-deleted`]: "line-through",
    [`textDecorationLine-${re}-inserted`]: "underline",
    [`fontFamily-${re}-keyboard`]: "$fontFamily-monospace",
    [`fontSize-${re}-keyboard`]: "$fontSize-small",
    [`fontWeight-${re}-keyboard`]: "$fontWeight-bold",
    [`borderWidth-${re}-keyboard`]: "1px",
    [`paddingHorizontal-${re}-keyboard`]: "$space-1",
    [`fontFamily-${re}-sample`]: "$fontFamily-monospace",
    [`fontSize-${re}-sample`]: "$fontSize-small",
    [`fontSize-${re}-sup`]: "$fontSize-smaller",
    [`verticalAlign-${re}-sup`]: "super",
    [`fontSize-${re}-sub`]: "$fontSize-smaller",
    [`verticalAlign-${re}-sub`]: "sub",
    [`font-style-${re}-var`]: "italic",
    [`fontFamily-${re}-mono`]: "$fontFamily-monospace",
    [`fontSize-${re}-title`]: "$fontSize-large",
    [`fontSize-${re}-subtitle`]: "$fontSize-medium",
    [`fontSize-${re}-small`]: "$fontSize-small",
    [`lineHeight-${re}-small`]: "$lineHeight-tight",
    [`letterSpacing-${re}-caption`]: "0.05rem",
    [`fontSize-${re}-placeholder`]: "$fontSize-small",
    [`fontFamily-${re}-codefence`]: "$fontFamily-monospace",
    [`paddingHorizontal-${re}-codefence`]: "$space-3",
    [`paddingVertical-${re}-codefence`]: "$space-2",
    [`paddingVertical-${re}-paragraph`]: "$space-1",
    [`fontSize-${re}-subheading`]: "$fontSize-H6",
    [`fontWeight-${re}-subheading`]: "$fontWeight-bold",
    [`letterSpacing-${re}-subheading`]: "0.04em",
    [`textTransform-${re}-subheading`]: "uppercase",
    [`marginTop-${re}-tableheading`]: "$space-1",
    [`marginBottom-${re}-tableheading`]: "$space-4",
    [`paddingHorizontal-${re}-tableheading`]: "$space-1",
    [`fontWeight-${re}-tableheading`]: "$fontWeight-bold",
    light: {
      [`backgroundColor-${re}-code`]: "$color-surface-100",
      [`borderColor-${re}-code`]: "$color-surface-200",
      [`backgroundColor-${re}-keyboard`]: "$color-surface-200",
      [`borderColor-${re}-keyboard`]: "$color-surface-300",
      [`backgroundColor-${re}-marked`]: "yellow",
      [`color-${re}-placeholder`]: "$color-surface-500",
      [`backgroundColor-${re}-codefence`]: "$color-primary-100",
      [`color-${re}-codefence`]: "$color-surface-900",
      [`color-${re}-subheading`]: "$textColor-secondary",
      [`color-${re}-secondary`]: "$textColor-secondary"
    },
    dark: {
      [`backgroundColor-${re}-code`]: "$color-surface-800",
      [`borderColor-${re}-code`]: "$color-surface-700",
      [`backgroundColor-${re}-keyboard`]: "$color-surface-800",
      [`borderColor-${re}-keyboard`]: "$color-surface-700",
      [`backgroundColor-${re}-marked`]: "orange",
      [`color-${re}-placeholder`]: "$color-surface-500",
      [`backgroundColor-${re}-codefence`]: "$color-primary-800",
      [`color-${re}-codefence`]: "$color-surface-200",
      [`color-${re}-subheading`]: "$textColor-secondary",
      [`color-${re}-secondary`]: "$textColor-secondary"
    }
  }
}), Wr = "TextArea", zT = [
  { value: "(undefined)", description: "No resizing" },
  { value: "horizontal", description: "Can only resize horizontally" },
  { value: "vertical", description: "Can only resize vertically" },
  { value: "both", description: "Can resize in both dimensions" }
], VT = C({
  status: "experimental",
  description: `\`${Wr}\` is a component that provides a multiline text input area.`,
  props: {
    enterSubmits: {
      description: "This optional boolean property indicates whether pressing the `Enter` key on the keyboard prompts the parent `Form` component to submit.",
      valueType: "boolean",
      defaultValue: !0
    },
    escResets: {
      description: `This boolean property indicates whether the ${Wr} contents should be reset when pressing the ESC key.`,
      valueType: "boolean",
      defaultValue: !1
    },
    maxRows: u(
      `This optional property sets the maximum number of text rows the \`${Wr}\` can grow.`
    ),
    minRows: u(
      `This optional property sets the minimum number of text rows the \`${Wr}\` can shrink.`
    ),
    rows: {
      description: "Specifies the number of rows the component initially has.",
      valueType: "number",
      defaultValue: 2
    },
    autoSize: {
      description: `If set to \`true\`, this boolean property enables the \`${Wr}\` to resize automatically based on the number of lines inside it.`,
      valueType: "boolean",
      defaultValue: !1
    },
    placeholder: Vt(),
    initialValue: Cr(),
    label: Fe(),
    labelPosition: Dr("top"),
    labelWidth: jr(Wr),
    labelBreak: Jr(Wr),
    maxLength: _o(),
    autoFocus: rr(),
    required: Ar(),
    readOnly: Lr(),
    enabled: Qe(),
    validationStatus: _r(),
    resize: {
      description: "This optional property specifies in which dimensions can the `TextArea` be resized by the user.",
      availableValues: zT
    }
  },
  events: {
    gotFocus: Tr(Wr),
    lostFocus: yr(Wr),
    didChange: er(Wr)
  },
  apis: {
    focus: et(Wr),
    value: u(
      "You can query the component's value. If no value is set, it will retrieve `undefined`."
    ),
    setValue: Kr()
  },
  themeVars: Z(Xr.themeVars)
}), ET = `'{"border-Accordion": "var(--xmlui-border-Accordion)", "borderHorizontal-Accordion": "var(--xmlui-borderHorizontal-Accordion, var(--xmlui-border-Accordion))", "borderVertical-Accordion": "var(--xmlui-borderVertical-Accordion, var(--xmlui-border-Accordion))", "borderLeft-Accordion": "var(--xmlui-borderLeft-Accordion, var(--xmlui-borderHorizontal-Accordion, var(--xmlui-border-Accordion)))", "borderRight-Accordion": "var(--xmlui-borderRight-Accordion, var(--xmlui-borderHorizontal-Accordion, var(--xmlui-border-Accordion)))", "borderTop-Accordion": "var(--xmlui-borderTop-Accordion, var(--xmlui-borderVertical-Accordion, var(--xmlui-border-Accordion)))", "borderBottom-Accordion": "var(--xmlui-borderBottom-Accordion, var(--xmlui-borderVertical-Accordion, var(--xmlui-border-Accordion)))", "borderWidth-Accordion": "var(--xmlui-borderWidth-Accordion)", "borderHorizontalWidth-Accordion": "var(--xmlui-borderHorizontalWidth-Accordion, var(--xmlui-borderWidth-Accordion))", "borderLeftWidth-Accordion": "var(--xmlui-borderLeftWidth-Accordion, var(--xmlui-borderHorizontalWidth-Accordion, var(--xmlui-borderWidth-Accordion)))", "borderRightWidth-Accordion": "var(--xmlui-borderRightWidth-Accordion, var(--xmlui-borderHorizontalWidth-Accordion, var(--xmlui-borderWidth-Accordion)))", "borderVerticalWidth-Accordion": "var(--xmlui-borderVerticalWidth-Accordion, var(--xmlui-borderWidth-Accordion))", "borderTopWidth-Accordion": "var(--xmlui-borderTopWidth-Accordion, var(--xmlui-borderVerticalWidth-Accordion, var(--xmlui-borderWidth-Accordion)))", "borderBottomWidth-Accordion": "var(--xmlui-borderBottomWidth-Accordion, var(--xmlui-borderVerticalWidth-Accordion, var(--xmlui-borderWidth-Accordion)))", "borderStyle-Accordion": "var(--xmlui-borderStyle-Accordion)", "borderHorizontalStyle-Accordion": "var(--xmlui-borderHorizontalStyle-Accordion, var(--xmlui-borderStyle-Accordion))", "borderLeftStyle-Accordion": "var(--xmlui-borderLeftStyle-Accordion, var(--xmlui-borderHorizontalStyle-Accordion, var(--xmlui-borderStyle-Accordion)))", "borderRightStyle-Accordion": "var(--xmlui-borderRightStyle-Accordion, var(--xmlui-borderHorizontalStyle-Accordion, var(--xmlui-borderStyle-Accordion)))", "borderVerticalStyle-Accordion": "var(--xmlui-borderVerticalStyle-Accordion, var(--xmlui-borderStyle-Accordion))", "borderTopStyle-Accordion": "var(--xmlui-borderTopStyle-Accordion, var(--xmlui-borderVerticalStyle-Accordion, var(--xmlui-borderStyle-Accordion)))", "borderBottomStyle-Accordion": "var(--xmlui-borderBottomStyle-Accordion, var(--xmlui-borderVerticalStyle-Accordion, var(--xmlui-borderStyle-Accordion)))", "borderColor-Accordion": "var(--xmlui-borderColor-Accordion)", "borderHorizontalColor-Accordion": "var(--xmlui-borderHorizontalColor-Accordion, var(--xmlui-borderColor-Accordion))", "borderLeftColor-Accordion": "var(--xmlui-borderLeftColor-Accordion, var(--xmlui-borderHorizontalColor-Accordion, var(--xmlui-borderColor-Accordion)))", "borderRightColor-Accordion": "var(--xmlui-borderRightColor-Accordion, var(--xmlui-borderHorizontalColor-Accordion, var(--xmlui-borderColor-Accordion)))", "borderVerticalColor-Accordion": "var(--xmlui-borderVerticalColor-Accordion, var(--xmlui-borderColor-Accordion))", "borderTopColor-Accordion": "var(--xmlui-borderTopColor-Accordion, var(--xmlui-borderVerticalColor-Accordion, var(--xmlui-borderColor-Accordion)))", "borderBottomColor-Accordion": "var(--xmlui-borderBottomColor-Accordion, var(--xmlui-borderVerticalColor-Accordion, var(--xmlui-borderColor-Accordion)))", "radius-start-start-Accordion": "var(--xmlui-radius-start-start-Accordion, var(--xmlui-borderRadius-Accordion))", "radius-start-end-Accordion": "var(--xmlui-radius-start-end-Accordion, var(--xmlui-borderRadius-Accordion))", "radius-end-start-Accordion": "var(--xmlui-radius-end-start-Accordion, var(--xmlui-borderRadius-Accordion))", "radius-end-end-Accordion": "var(--xmlui-radius-end-end-Accordion, var(--xmlui-borderRadius-Accordion))", "padding-Accordion": "var(--xmlui-padding-Accordion)", "paddingHorizontal-Accordion": "var(--xmlui-paddingHorizontal-Accordion, var(--xmlui-padding-Accordion))", "paddingVertical-Accordion": "var(--xmlui-paddingVertical-Accordion, var(--xmlui-padding-Accordion))", "paddingLeft-Accordion": "var(--xmlui-paddingLeft-Accordion, var(--xmlui-paddingHorizontal-Accordion, var(--xmlui-padding-Accordion)))", "paddingRight-Accordion": "var(--xmlui-paddingRight-Accordion, var(--xmlui-paddingHorizontal-Accordion, var(--xmlui-padding-Accordion)))", "paddingTop-Accordion": "var(--xmlui-paddingTop-Accordion, var(--xmlui-paddingVertical-Accordion, var(--xmlui-padding-Accordion)))", "paddingBottom-Accordion": "var(--xmlui-paddingBottom-Accordion, var(--xmlui-paddingVertical-Accordion, var(--xmlui-padding-Accordion)))", "borderRadius-Accordion": "var(--xmlui-borderRadius-Accordion)", "verticalAlign-header-Accordion": "var(--xmlui-verticalAlign-header-Accordion)", "fontSize-header-Accordion": "var(--xmlui-fontSize-header-Accordion)", "fontWeight-header-Accordion": "var(--xmlui-fontWeight-header-Accordion)", "font-style-header-Accordion": "var(--xmlui-font-style-header-Accordion)", "paddingVertical-header-Accordion": "var(--xmlui-paddingVertical-header-Accordion)", "paddingHorizontal-header-Accordion": "var(--xmlui-paddingHorizontal-header-Accordion)", "backgroundColor-header-Accordion": "var(--xmlui-backgroundColor-header-Accordion)", "color-header-Accordion": "var(--xmlui-color-header-Accordion)", "backgroundColor-header-Accordion-hover": "var(--xmlui-backgroundColor-header-Accordion-hover)", "color-content-Accordion": "var(--xmlui-color-content-Accordion)", "backgroundColor-content-Accordion": "var(--xmlui-backgroundColor-content-Accordion)", "width-icon-Accordion": "var(--xmlui-width-icon-Accordion)", "height-icon-Accordion": "var(--xmlui-height-icon-Accordion)", "color-icon-Accordion": "var(--xmlui-color-icon-Accordion)"}'`, DT = "_root_1dkwb_13", Ml = {
  themeVars: ET,
  root: DT
}, PT = Zr({
  expandedItems: null,
  rotateExpanded: null,
  expandItem: de,
  register: de,
  unRegister: de,
  hideIcon: null,
  expandedIcon: null,
  collapsedIcon: null,
  triggerPosition: null
}), gt = {
  hideIcon: !1,
  collapsedIcon: "chevrondown",
  triggerPosition: "end",
  rotateExpanded: "180deg"
};
xe(function({
  style: r,
  children: t,
  hideIcon: o = gt.hideIcon,
  expandedIcon: a,
  collapsedIcon: n = gt.collapsedIcon,
  triggerPosition: i = gt.triggerPosition,
  onDisplayDidChange: l = de,
  registerComponentApi: s,
  rotateExpanded: f = gt.rotateExpanded
}, h) {
  const [c, T] = me([]), [b, v] = me(/* @__PURE__ */ new Set()), y = X(
    (V) => {
      T((R) => R.filter((W) => W !== `${V}`));
    },
    [T]
  ), w = X(
    (V) => {
      c.includes(`${V}`) || T((R) => [...R, `${V}`]);
    },
    [T, c]
  ), _ = X(
    (V) => {
      c.includes(`${V}`) ? y(V) : w(V);
    },
    [y, w, c]
  ), H = X(
    (V) => {
      v((R) => (R.add(V), R));
    },
    [v]
  ), $ = X(
    (V) => {
      v((R) => (R.delete(V), R));
    },
    [v]
  ), O = X(
    (V) => {
      if (b.has(`trigger_${V}`)) {
        const R = document.getElementById(`trigger_${V}`);
        R && R.focus();
      }
    },
    [b]
  ), F = X(
    (V) => c.includes(`${V}`),
    [c]
  );
  K(() => {
    s == null || s({
      expanded: F,
      expand: w,
      collapse: y,
      toggle: _,
      focus: O
    });
  }, [s, w, y, _, O, F]);
  const Y = ue(
    () => ({
      register: H,
      unRegister: $,
      expandItem: w,
      expandedItems: c,
      hideIcon: o,
      expandedIcon: a,
      collapsedIcon: n,
      triggerPosition: i,
      rotateExpanded: f
    }),
    [
      H,
      $,
      c,
      o,
      a,
      n,
      i,
      w,
      f
    ]
  );
  return K(() => {
    l == null || l(c);
  }, [c, l]), /* @__PURE__ */ p(PT.Provider, { value: Y, children: /* @__PURE__ */ p(
    Wd.Root,
    {
      style: r,
      ref: h,
      value: c,
      type: "multiple",
      className: Ml.root,
      onValueChange: (V) => T(V),
      children: t
    }
  ) });
});
const we = "Accordion", MT = C({
  status: "in progress",
  description: `(**NOT IMPLEMENTED YET**) The \`${we}\` component is a collapsible container that toggles the display of content sections. It helps organize information by expanding or collapsing it based on user interaction.`,
  props: {
    triggerPosition: {
      description: "This property indicates the position where the trigger icon should be displayed. The `start` value signs the trigger is before the header text (template), and `end` indicates that it follows the header.",
      defaultValue: gt.triggerPosition,
      valueType: "string",
      availableValues: ms
    },
    collapsedIcon: {
      description: "This property is the name of the icon that is displayed when the accordion is collapsed.",
      valueType: "string",
      defaultValue: gt.collapsedIcon
    },
    expandedIcon: {
      description: "This property is the name of the icon that is displayed when the accordion is expanded.",
      valueType: "string"
    },
    hideIcon: {
      description: "This property indicates that the trigger icon is not displayed (`true`).",
      defaultValue: gt.hideIcon,
      valueType: "boolean"
    },
    rotateExpanded: {
      description: "This optional property defines the rotation angle of the expanded icon (relative to the collapsed icon).",
      valueType: "string",
      defaultValue: gt.rotateExpanded
    }
  },
  events: {
    displayDidChange: er(we)
  },
  apis: {
    expanded: vs(we),
    expand: gs(we),
    collapse: Ts(we),
    toggle: u(`This method toggles the state of the ${we} between expanded and collapsed.`),
    focus: et(we)
  },
  themeVars: Z(Ml.themeVars),
  defaultThemeVars: {
    [`paddingHorizontal-header-${we}`]: "$space-3",
    [`paddingVertical-header-${we}`]: "$space-3",
    [`verticalAlign-header-${we}`]: "center",
    [`fontSize-header-${we}`]: "$fontSize-normal",
    [`fontWeight-header-${we}`]: "$fontWeight-normal",
    [`fontFamily-header-${we}`]: "$fontFamily",
    [`border-${we}`]: "0px solid $borderColor",
    [`width-icon-${we}`]: "",
    [`height-icon-${we}`]: "",
    light: {
      [`backgroundColor-header-${we}`]: "$color-primary-500",
      [`backgroundColor-header-${we}-hover`]: "$color-primary-400",
      [`color-header-${we}`]: "$color-surface-50",
      [`color-content-${we}`]: "$textColor-primary",
      [`backgroundColor-content-${we}`]: "transparent",
      [`color-icon-${we}`]: "$color-surface-50"
    },
    dark: {
      [`backgroundColor-header-${we}`]: "$color-primary-500",
      [`backgroundColor-header-${we}-hover`]: "$color-primary-600",
      [`color-header-${we}`]: "$color-surface-50",
      [`color-content-${we}`]: "$textColor-primary",
      [`backgroundColor-content-${we}`]: "transparent",
      [`color-icon-${we}`]: "$color-surface-50"
    }
  }
}), FT = '"[]"', qT = {
  themeVars: FT
}, Fo = "Alert", UT = C({
  status: "in progress",
  description: `(**NOT IMPLEMENTED YET**) The \`${Fo}\` component is a panel used to display important notifications or feedback to users. It helps convey different statuses or levels of urgency, such as success, warning, error, and others.`,
  props: {
    statusColor: {
      description: `The value of this optional property sets the string to provide a color scheme for the ${Fo}.`,
      availableValues: ss,
      valueType: "string",
      defaultValue: "primary"
    },
    dismissable: {
      description: `This property's \`true\` value indicates if this alert is dismissable by the user. When the user closes the ${Fo}, it gets hidden.`,
      valueType: "boolean",
      defaultValue: !0
    },
    autoDismissInMs: {
      description: "Timeout for the alert to be dismissed",
      valueType: "number"
    },
    showIcon: {
      description: "Indicates if the alert should display an icon",
      valueType: "boolean",
      defaultValue: !0
    },
    icon: {
      description: "Icon to be displayed in the alert",
      valueType: "string"
    }
  },
  events: {},
  apis: {
    dismiss: u(
      `This method dismisses the ${Fo}. It triggers the \`didDismiss\` event with the argument set to \`false\`.`
    )
  },
  themeVars: Z(qT.themeVars),
  defaultThemeVars: {
    light: {},
    dark: {}
  }
}), cn = "TabItem", GT = C({
  description: `\`${cn}\` is a non-visual component describing a tab. Tabs component may use nested ${cn} instances from which the user can select.`,
  props: {
    label: Fe()
  }
}), YT = "Fragment", XT = C({
  description: `The \`${YT}\` component encloses multiple child components into a single root component, so it can be used where only a single component definition is allowed.`,
  opaque: !0
}), QT = "Tree", ZT = C({
  status: "in progress",
  description: `The \`${QT}\` component is a virtualized tree component that displays hierarchical data.`,
  props: {
    data: {
      description: "The data source of the tree.",
      required: !0
    },
    selectedUid: {
      description: "The ID (optional) of the selected tree row."
    },
    itemTemplate: Re("The template for each item in the tree.")
  }
}), qo = "APICall", jT = C({
  description: `\`${qo}\` is used to mutate (create, update or delete) some data on the backend. It is similar in nature to the \`DataSource\` component which retrieves data from the backend.`,
  props: {
    method: {
      description: "The method of data manipulation can be done via setting this property.",
      valueType: "string",
      availableValues: Mn,
      defaultValue: "get"
    },
    url: {
      description: "Use this property to set the URL to send data to.",
      isRequired: !0,
      valueType: "string"
    },
    rawBody: {
      description: "This property sets the request body to the value provided here without any conversion. Use the * `body` property if you want the object sent in JSON. When you define `body` and `rawBody`, the latest one prevails.",
      valueType: "string"
    },
    body: {
      description: "This property sets the request body. The object you pass here will be serialized to JSON when sending the request. Use the `rawBody` property to send another request body using its native format. When you define `body` and `rawBody`, the latest one prevails.",
      valueType: "string"
    },
    queryParams: {
      description: "This property sets the query parameters for the request. The object you pass here will be serialized to a query string and appended to the request URL. You can specify key and value pairs where the key is the name of a particular query parameter and the value is that parameter's value."
    },
    headers: {
      description: "You can define request header values as key and value pairs, where the key is the ID of the particular header and the value is that header's value."
    },
    confirmTitle: {
      description: `This optional string sets the title in the confirmation dialog that is displayed before the \`${qo}\` is executed.`,
      valueType: "string"
    },
    confirmMessage: {
      description: `This optional string sets the message in the confirmation dialog that is displayed before the \`${qo}\` is executed.`,
      valueType: "string"
    },
    confirmButtonLabel: {
      description: `This optional string property enables the customization of the submit button in the confirmation dialog that is displayed before the \`${qo}\` is executed.`,
      valueType: "string"
    },
    inProgressNotificationMessage: {
      description: "This property customizes the message that is displayed in a toast while the API operation is in progress.",
      valueType: "string"
    },
    errorNotificationMessage: {
      description: "This property defines the message to display automatically when the operation results in an error.",
      valueType: "string"
    },
    completedNotificationMessage: {
      description: "This property defines the message to display automatically when the operation has been completed.",
      valueType: "string"
    },
    payloadType: Pe(),
    invalidates: Pe(),
    updates: Pe(),
    optimisticValue: Pe(),
    getOptimisticValue: Pe()
  },
  events: {
    beforeRequest: u(
      "This event fires before the request is sent. Returning an explicit boolean`false` value will prevent the request from being sent."
    ),
    success: u("This event fires when a request results in a success."),
    /**
     * This event fires when a request results in an error.
     * @descriptionRef
     */
    error: u("This event fires when a request results in an error."),
    progress: Pe()
  },
  contextVars: {
    $param: u(
      "This value represents the first parameters passed to the `execute()` method to display the modal dialog."
    ),
    $params: u(
      "This value represents the array of parameters passed to the `execute()` method. You can use `$params[0]` to access the first and `$params[1]` to access the second (and so on) parameters. `$param` is the same as `$params[0]`."
    )
  },
  apis: {
    execute: u(
      "This method triggers the invocation of the API. You can pass an arbitrary number of parameters to the method. In the `APICall` instance, you can access those with the `$param` and `$params` context values."
    )
  }
}), Sa = "DataSource", JT = C({
  status: "stable",
  description: `The \`${Sa}\` component manages fetching data from a web API endpoint. This component automatically manages the complexity of the fetch operation and caching. To manipulate data on the backend, use the [\`APICall\`](./APICall.mdx) component.`,
  props: {
    method: {
      description: "The method by which the data fetching request is made.",
      defaultValue: "get",
      availableValues: Mn
    },
    url: {
      description: "This property represents the URL to fetch the data.",
      isRequired: !0,
      valueType: "string"
    },
    rawBody: {
      description: "This property sets the request body to the value provided here without any conversion. Use the `body` property if you want the object sent in JSON. When you define `body` and `rawBody`, the latest one prevails.",
      valueType: "string"
    },
    body: {
      description: "This property sets the request body. The object you pass here will be serialized to JSON when sending the request. Use the `rawBody` property to send another request body using its native format. When you define `body` and `rawBody`, the latest one prevails."
    },
    queryParams: {
      description: "This property sets the request body. The object you pass here will be serialized to JSON when sending the request. Use the `rawBody` property to send another request body using its native format. When you define `body` and `rawBody`, the latest one prevails."
    },
    headers: {
      description: "You can define request header values as key and value pairs, where the key is the ID of the particular header and the value is that header's value."
    },
    pollIntervalInSeconds: {
      description: "By setting this property, you can define periodic data fetching. The `DataSource` component will refresh its data according to the time specified as seconds. When the data changes during the refresh, it will trigger the update mechanism of XMLUI and re-render the UI accordingly.",
      valueType: "number"
    },
    inProgressNotificationMessage: {
      description: "This property defines the message to display when the data fetch operation is in progress.",
      valueType: "string"
    },
    completedNotificationMessage: {
      description: "This property defines the message to display when the data fetch operation has been completed.",
      valueType: "string"
    },
    errorNotificationMessage: {
      description: "This property defines the message to display when the data fetch operation results in an error.",
      valueType: "string"
    },
    resultSelector: {
      description: "The response of a data-fetching query may include additional information that the UI cannot (or does not intend) to process. With this property, you can define a selector that extracts the data from the response body."
    },
    transformResult: {
      description: "This property accepts a transformation function that receives the data coming from the backend after it has been through the evaluation of the optional `resultSelector` property. The function gets the entire result set and can transform it. The `DataSource` component `value` property will return the data from this function."
    },
    prevPageSelector: {
      description: `When using \`${Sa}\` with paging, the response may contain information about the previous and next page. This property defines the selector that extracts the previous page information from the response deserialized to an object.`
    },
    nextPageSelector: {
      description: `When using \`${Sa}\` with paging, the response may contain information about the previous and next page. This property defines the selector that extracts the next page information from the response deserialized to an object.`
    }
  },
  events: {
    loaded: u(
      "The component triggers this event when the fetch operation has been completed and the data is loaded. The argument of the event is the data loaded."
    ),
    error: u("This event fires when a request results in an error.")
  }
});
var L = /* @__PURE__ */ ((e) => (e[e.EOF = -1] = "EOF", e[e.nullCharacter = 0] = "nullCharacter", e[e.maxAsciiCharacter = 127] = "maxAsciiCharacter", e[e.lineFeed = 10] = "lineFeed", e[e.carriageReturn = 13] = "carriageReturn", e[e.lineSeparator = 8232] = "lineSeparator", e[e.paragraphSeparator = 8233] = "paragraphSeparator", e[e.nextLine = 133] = "nextLine", e[e.space = 32] = "space", e[e.nonBreakingSpace = 160] = "nonBreakingSpace", e[e.enQuad = 8192] = "enQuad", e[e.emQuad = 8193] = "emQuad", e[e.enSpace = 8194] = "enSpace", e[e.emSpace = 8195] = "emSpace", e[e.threePerEmSpace = 8196] = "threePerEmSpace", e[e.fourPerEmSpace = 8197] = "fourPerEmSpace", e[e.sixPerEmSpace = 8198] = "sixPerEmSpace", e[e.figureSpace = 8199] = "figureSpace", e[e.punctuationSpace = 8200] = "punctuationSpace", e[e.thinSpace = 8201] = "thinSpace", e[e.hairSpace = 8202] = "hairSpace", e[e.zeroWidthSpace = 8203] = "zeroWidthSpace", e[e.narrowNoBreakSpace = 8239] = "narrowNoBreakSpace", e[e.ideographicSpace = 12288] = "ideographicSpace", e[e.mathematicalSpace = 8287] = "mathematicalSpace", e[e.ogham = 5760] = "ogham", e[e.replacementCharacter = 65533] = "replacementCharacter", e[e._ = 95] = "_", e[e.$ = 36] = "$", e[e._0 = 48] = "_0", e[e._1 = 49] = "_1", e[e._2 = 50] = "_2", e[e._3 = 51] = "_3", e[e._4 = 52] = "_4", e[e._5 = 53] = "_5", e[e._6 = 54] = "_6", e[e._7 = 55] = "_7", e[e._8 = 56] = "_8", e[e._9 = 57] = "_9", e[e.a = 97] = "a", e[e.b = 98] = "b", e[e.c = 99] = "c", e[e.d = 100] = "d", e[e.e = 101] = "e", e[e.f = 102] = "f", e[e.g = 103] = "g", e[e.h = 104] = "h", e[e.i = 105] = "i", e[e.j = 106] = "j", e[e.k = 107] = "k", e[e.l = 108] = "l", e[e.m = 109] = "m", e[e.n = 110] = "n", e[e.o = 111] = "o", e[e.p = 112] = "p", e[e.q = 113] = "q", e[e.r = 114] = "r", e[e.s = 115] = "s", e[e.t = 116] = "t", e[e.u = 117] = "u", e[e.v = 118] = "v", e[e.w = 119] = "w", e[e.x = 120] = "x", e[e.y = 121] = "y", e[e.z = 122] = "z", e[e.A = 65] = "A", e[e.B = 66] = "B", e[e.C = 67] = "C", e[e.D = 68] = "D", e[e.E = 69] = "E", e[e.F = 70] = "F", e[e.G = 71] = "G", e[e.H = 72] = "H", e[e.I = 73] = "I", e[e.J = 74] = "J", e[e.K = 75] = "K", e[e.L = 76] = "L", e[e.M = 77] = "M", e[e.N = 78] = "N", e[e.O = 79] = "O", e[e.P = 80] = "P", e[e.Q = 81] = "Q", e[e.R = 82] = "R", e[e.S = 83] = "S", e[e.T = 84] = "T", e[e.U = 85] = "U", e[e.V = 86] = "V", e[e.W = 87] = "W", e[e.X = 88] = "X", e[e.Y = 89] = "Y", e[e.Z = 90] = "Z", e[e.ampersand = 38] = "ampersand", e[e.asterisk = 42] = "asterisk", e[e.at = 64] = "at", e[e.backslash = 92] = "backslash", e[e.backtick = 96] = "backtick", e[e.bar = 124] = "bar", e[e.caret = 94] = "caret", e[e.closeBrace = 125] = "closeBrace", e[e.closeBracket = 93] = "closeBracket", e[e.closeParen = 41] = "closeParen", e[e.colon = 58] = "colon", e[e.comma = 44] = "comma", e[e.dot = 46] = "dot", e[e.doubleQuote = 34] = "doubleQuote", e[e.equals = 61] = "equals", e[e.exclamation = 33] = "exclamation", e[e.greaterThan = 62] = "greaterThan", e[e.hash = 35] = "hash", e[e.lessThan = 60] = "lessThan", e[e.minus = 45] = "minus", e[e.openBrace = 123] = "openBrace", e[e.openBracket = 91] = "openBracket", e[e.openParen = 40] = "openParen", e[e.percent = 37] = "percent", e[e.plus = 43] = "plus", e[e.question = 63] = "question", e[e.semicolon = 59] = "semicolon", e[e.singleQuote = 39] = "singleQuote", e[e.slash = 47] = "slash", e[e.tilde = 126] = "tilde", e[e.backspace = 8] = "backspace", e[e.formFeed = 12] = "formFeed", e[e.byteOrderMark = 65279] = "byteOrderMark", e[e.tab = 9] = "tab", e[e.verticalTab = 11] = "verticalTab", e))(L || {}), ao = /* @__PURE__ */ ((e) => (e[e.Warning = 0] = "Warning", e[e.Error = 1] = "Error", e[e.Suggestion = 2] = "Suggestion", e[e.Message = 3] = "Message", e))(ao || {}), Tt = /* @__PURE__ */ ((e) => (e.onlyOneElem = "U002", e.expTagOpen = "U003", e.expTagIdent = "U004", e.expCloseStart = "U005", e.expEndOrClose = "U006", e.tagNameMismatch = "U007", e.expEnd = "U008", e.expAttrIdent = "U009", e.expEq = "U010", e.expAttrValue = "U011", e.duplAttr = "U012", e.uppercaseAttr = "U013", e.invalidChar = "W001", e.untermStr = "W002", e.untermComment = "W007", e.untermCData = "W008", e.untermScript = "W009", e))(Tt || {});
const wa = {
  code: "W001",
  category: 1,
  message: "Invalid character."
}, KT = {
  code: "W002",
  category: 1,
  message: "Unterminated string literal."
}, ey = {
  code: "W007",
  category: 1,
  message: "Unterminated comment"
}, ry = {
  code: "W008",
  category: 1,
  message: "Unterminated CDATA section"
}, ty = {
  code: "W009",
  category: 1,
  message: "Unterminated script section"
}, oy = {
  category: 1,
  code: "U008",
  message: "A '>' token expected."
}, ay = {
  category: 1,
  code: "U005",
  message: "A '</' token expected."
}, mn = {
  category: 1,
  code: "U004",
  message: "A tag identifier expected."
}, iy = {
  category: 1,
  code: "U011",
  message: "An attribute value expected."
}, ny = {
  category: 1,
  code: "U003",
  message: "A '<' token expected."
}, ly = {
  category: 1,
  code: "U006",
  message: "A '>' or '/>' token expected."
}, pn = {
  category: 1,
  code: "U009",
  message: "An attribute identifier expected."
};
var S = /* @__PURE__ */ ((e) => (e[e.Unknown = 0] = "Unknown", e[e.EndOfFileToken = 1] = "EndOfFileToken", e[e.CommentTrivia = 2] = "CommentTrivia", e[e.NewLineTrivia = 3] = "NewLineTrivia", e[e.WhitespaceTrivia = 4] = "WhitespaceTrivia", e[e.Identifier = 5] = "Identifier", e[e.OpenNodeStart = 6] = "OpenNodeStart", e[e.CloseNodeStart = 7] = "CloseNodeStart", e[e.NodeEnd = 8] = "NodeEnd", e[e.NodeClose = 9] = "NodeClose", e[e.Colon = 10] = "Colon", e[e.Equal = 11] = "Equal", e[e.StringLiteral = 12] = "StringLiteral", e[e.CData = 13] = "CData", e[e.Script = 14] = "Script", e[e.TextNode = 15] = "TextNode", e[e.AmpersandEntity = 16] = "AmpersandEntity", e[e.LessThanEntity = 17] = "LessThanEntity", e[e.GreaterThanEntity = 18] = "GreaterThanEntity", e[e.SingleQuoteEntity = 19] = "SingleQuoteEntity", e[e.DoubleQuoteEntity = 20] = "DoubleQuoteEntity", e[e.ElementNode = 21] = "ElementNode", e[e.AttributeNode = 22] = "AttributeNode", e[e.AttributeKeyNode = 23] = "AttributeKeyNode", e[e.ContentListNode = 24] = "ContentListNode", e[e.AttributeListNode = 25] = "AttributeListNode", e[e.TagNameNode = 26] = "TagNameNode", e[e.ErrorNode = 27] = "ErrorNode", e))(S || {});
function dy(e) {
  return e >= 2 && e <= 4;
}
function hn(e) {
  switch (e) {
    case 0:
      return "Unknown";
    case 1:
      return "EndOfFileToken";
    case 2:
      return "CommentTrivia";
    case 3:
      return "NewLineTrivia";
    case 4:
      return "WhitespaceTrivia";
    case 5:
      return "Identifier";
    case 6:
      return "OpenNodeStart";
    case 7:
      return "CloseNodeStart";
    case 8:
      return "NodeEnd";
    case 9:
      return "NodeClose";
    case 10:
      return "Colon";
    case 11:
      return "Equal";
    case 12:
      return "StringLiteral";
    case 13:
      return "CData";
    case 14:
      return "Script";
    case 16:
      return "AmpersandEntity";
    case 17:
      return "LessThanEntity";
    case 18:
      return "GreaterThanEntity";
    case 19:
      return "SingleQuoteEntity";
    case 20:
      return "DoubleQuoteEntity";
    case 21:
      return "ElementNode";
    case 22:
      return "AttributeNode";
    case 15:
      return "TextNode";
    case 24:
      return "ContentListNode";
    case 25:
      return "AttributeListNode";
    case 26:
      return "TagNameNode";
    case 27:
      return "ErrorNode";
    case 23:
      return "AttributeKeyNode";
  }
  return sy();
}
function sy(e) {
  throw new Error("Didn't expect to get here");
}
function uy(e, r, t, o, a) {
  let n = r, i, l, s, f, h, c;
  return F(n, o, a), {
    getStartPos: () => s,
    getTokenEnd: () => i,
    getToken: () => h,
    getTokenStart: () => f,
    getTokenText: () => n.substring(f, i),
    getTokenValue: () => c,
    isIdentifier: () => h === S.Identifier,
    peekChar: T,
    scanChar: b,
    scan: v,
    scanTrivia: y,
    scanText: w,
    getText: _,
    setText: F,
    setOnError: Y,
    resetTokenState: V,
    back: R
  };
  function T(g) {
    if (i + (g ?? 0) >= l)
      return null;
    const k = $(i + (g ?? 0));
    return isNaN(k) ? null : k;
  }
  function b() {
    if (i >= l)
      return null;
    const g = $(i);
    return i += ot(g), g;
  }
  function v() {
    for (s = i; ; ) {
      if (f = i, i >= l)
        return h = S.EndOfFileToken;
      const g = $(i);
      switch (g) {
        case L.lineFeed:
        case L.carriageReturn:
          return g === L.carriageReturn && i + 1 < l && H(i + 1) === L.lineFeed ? i += 2 : i++, h = S.NewLineTrivia;
        case L.tab:
        case L.verticalTab:
        case L.formFeed:
        case L.space:
        case L.nonBreakingSpace:
        case L.ogham:
        case L.enQuad:
        case L.emQuad:
        case L.enSpace:
        case L.emSpace:
        case L.threePerEmSpace:
        case L.fourPerEmSpace:
        case L.sixPerEmSpace:
        case L.figureSpace:
        case L.punctuationSpace:
        case L.thinSpace:
        case L.hairSpace:
        case L.zeroWidthSpace:
        case L.narrowNoBreakSpace:
        case L.mathematicalSpace:
        case L.ideographicSpace:
        case L.byteOrderMark: {
          for (; i < l && xn(H(i)); )
            i++;
          return h = S.WhitespaceTrivia;
        }
        case L.doubleQuote:
        case L.singleQuote:
        case L.backtick:
          return c = x(), h = S.StringLiteral;
        case L.ampersand:
          return H(i + 1) === L.a && H(i + 2) === L.m && H(i + 3) === L.p && H(i + 4) === L.semicolon ? (i += 5, h = S.AmpersandEntity) : H(i + 1) === L.l && H(i + 2) === L.t && H(i + 3) === L.semicolon ? (i += 4, h = S.LessThanEntity) : H(i + 1) === L.g && H(i + 2) === L.t && H(i + 3) === L.semicolon ? (i += 4, h = S.GreaterThanEntity) : H(i + 1) === L.q && H(i + 2) === L.u && H(i + 3) === L.o && H(i + 4) === L.t && H(i + 5) === L.semicolon ? (i += 6, h = S.DoubleQuoteEntity) : H(i + 1) === L.a && H(i + 2) === L.p && H(i + 3) === L.o && H(i + 4) === L.s && H(i + 5) === L.semicolon ? (i += 6, h = S.SingleQuoteEntity) : (i++, m(wa, 1), h = S.Unknown);
        case L.equals:
          return i++, h = S.Equal;
        case L.colon:
          return i++, h = S.Colon;
        case L.lessThan:
          if (H(i + 1) === L.slash)
            return i += 2, h = S.CloseNodeStart;
          if (
            // --- "<!-- -->", XMLUI comment
            H(i + 1) === L.exclamation && H(i + 2) === L.minus && H(i + 3) === L.minus
          ) {
            for (i += 4; i < l; ) {
              if (H(i) === L.minus && H(i + 1) === L.minus && H(i + 2) === L.greaterThan)
                return i += 3, h = S.CommentTrivia;
              i += ot(H(i));
            }
            return m(ey, 4), h = S.Unknown;
          } else if (
            // --- <![CDATA[ section
            H(i + 1) === L.exclamation && H(i + 2) === L.openBracket && H(i + 3) === L.C && H(i + 4) === L.D && H(i + 5) === L.A && H(i + 6) === L.T && H(i + 7) === L.A && H(i + 8) === L.openBracket
          ) {
            for (i += 9; i < l; ) {
              if (H(i) === L.closeBracket && H(i + 1) === L.closeBracket && H(i + 2) === L.greaterThan)
                return i += 3, h = S.CData;
              i += ot(H(i));
            }
            return m(ry, 9), h = S.CData;
          } else if (
            // --- <script>
            H(i + 1) === L.s && H(i + 2) === L.c && H(i + 3) === L.r && H(i + 4) === L.i && H(i + 5) === L.p && H(i + 6) === L.t && H(i + 7) === L.greaterThan
          ) {
            for (i += 8; i < l; ) {
              if (H(i) === L.lessThan && H(i + 1) === L.slash && H(i + 2) === L.s && H(i + 3) === L.c && H(i + 4) === L.r && H(i + 5) === L.i && H(i + 6) === L.p && H(i + 7) === L.t && H(i + 8) === L.greaterThan)
                return i += 9, h = S.Script;
              i += ot(H(i));
            }
            return m(ty, 9), h = S.Script;
          }
          return i++, h = S.OpenNodeStart;
        case L.slash:
          return H(i + 1) === L.greaterThan ? (i += 2, h = S.NodeClose) : (i++, m(wa, 1), h = S.Unknown);
        case L.greaterThan:
          return i++, h = S.NodeEnd;
        default:
          const k = W(g);
          if (k)
            return h = k;
          if (xn(g)) {
            i += ot(g);
            continue;
          } else if (xy(g)) {
            i += ot(g);
            continue;
          }
          const A = ot(g);
          return i += A, m(wa, A), h = S.Unknown;
      }
    }
  }
  function y() {
    const g = i, k = v();
    return dy(k) ? k : (V(g), null);
  }
  function w() {
    return S.Unknown;
  }
  function _() {
    return n;
  }
  function H(g) {
    return n.charCodeAt(g);
  }
  function $(g) {
    return O(n, g);
  }
  function O(g, k) {
    return g.codePointAt(k) ?? 0;
  }
  function F(g, k, A) {
    n = g || "", l = A === void 0 ? n.length : k + A, V(k || 0);
  }
  function Y(g) {
    t = g;
  }
  function V(g) {
    i = g, s = g, f = g, h = S.Unknown, c = void 0;
  }
  function R() {
    V(s);
  }
  function W(g) {
    let k = g;
    if (py(k)) {
      for (i += ot(k); i < l && hy(k = $(i)); )
        i += ot(k);
      return c = n.substring(f, i), z();
    }
  }
  function z() {
    return h = S.Identifier;
  }
  function x() {
    const g = H(i);
    i++;
    let k = "", A = i;
    for (; ; ) {
      if (i >= l) {
        k += n.substring(A, i), m(KT, 1);
        break;
      }
      if (H(i) === g) {
        k += n.substring(A, i), i++;
        break;
      }
      i++;
    }
    return k;
  }
  function m(g, k = 0) {
    t && t(g, k);
  }
}
function ot(e) {
  return e >= 65536 ? 2 : e === L.EOF ? 0 : 1;
}
function Fl(e) {
  return e >= L.A && e <= L.Z || e >= L.a && e <= L.z;
}
function cy(e) {
  return Fl(e) || my(e) || e === L._;
}
function my(e) {
  return e >= L._0 && e <= L._9;
}
function py(e) {
  return Fl(e) || e === L.$ || e === L._;
}
function hy(e) {
  return cy(e) || e === L.$ || e === L.minus || e === L.dot;
}
function xn(e) {
  return e === L.space || e === L.tab || e === L.verticalTab || e === L.formFeed || e === L.nonBreakingSpace || e === L.nextLine || e === L.ogham || e >= L.enQuad && e <= L.zeroWidthSpace || e === L.narrowNoBreakSpace || e === L.mathematicalSpace || e === L.ideographicSpace || e === L.byteOrderMark;
}
function xy(e) {
  return e === L.lineFeed || e === L.carriageReturn || e === L.lineSeparator || e === L.paragraphSeparator;
}
function by(e, r, t) {
  var n, i;
  const o = ((n = e.children) == null ? void 0 : n.filter((l) => l.kind !== S.ErrorNode)) ?? [], a = ((i = r.children) == null ? void 0 : i.filter((l) => l.kind !== S.ErrorNode)) ?? [];
  if (o.length !== a.length)
    return !1;
  for (let l = 0; l < o.length; ++l)
    if (t(o[l]) !== t(a[l]))
      return !1;
  return !0;
}
const Uo = {
  uppercaseAttr: function(e) {
    return {
      category: ao.Error,
      code: Tt.uppercaseAttr,
      message: `Attribute name '${e}' cannot start with an uppercase letter.`
    };
  },
  duplAttr: function(e) {
    return {
      category: ao.Error,
      code: Tt.duplAttr,
      message: `Duplicated attribute: '${e}'.`
    };
  },
  tagNameMismatch: function(e, r) {
    return {
      category: ao.Error,
      code: Tt.tagNameMismatch,
      message: `Opening and closing tag names should match. Opening tag has a name '${e}', but the closing tag name is '${r}'.`
    };
  },
  invalidChar: function(e) {
    return {
      category: ao.Error,
      code: Tt.invalidChar,
      message: `Invalid character '${e}'.`
    };
  }
};
function fy(e) {
  return {
    parse: () => vy(e),
    getText: (r, t = !0) => e.substring(t ? r.pos ?? r.start ?? 0 : r.start ?? r.pos ?? 0, r.end)
  };
}
function vy(e) {
  const r = [], t = [];
  let o, a = { children: [] }, n;
  const l = uy(!1, e, function(N, B) {
    n = {
      message: N,
      prefixLength: B
    };
  });
  function s(N, B = !0) {
    return e.substring(B ? N.pos : N.start, N.end);
  }
  function f() {
    m();
    e: for (; ; ) {
      const N = W();
      switch (N.kind) {
        case S.TextNode:
        case S.StringLiteral:
          z(N.kind);
          break;
        case S.CloseNodeStart:
          break e;
        case S.EndOfFileToken:
          break e;
        default:
          c();
          break;
      }
    }
    a.children && a.children.length > 0 ? g(S.ContentListNode) : q();
  }
  function h() {
    for (; ; )
      switch (W().kind) {
        case S.EndOfFileToken:
          x();
          return;
        default:
          c();
          break;
      }
  }
  function c() {
    !$(S.CData) && !$(S.Script) && (H(S.OpenNodeStart) ? T() : A(ny));
  }
  function T() {
    m(), z(S.OpenNodeStart);
    let N;
    if (H(S.Identifier) ? N = b() : Y(mn), v(), $(S.NodeClose)) {
      g(S.ElementNode);
      return;
    } else if ($(S.NodeEnd)) {
      if (f(), $(S.CloseNodeStart)) {
        if (H(S.Identifier)) {
          const B = b();
          N !== void 0 && !by(N, B, s) && Y(Uo.tagNameMismatch(s(N), s(B)));
        } else
          F(mn, [S.NodeEnd]);
        $(S.NodeEnd) || Y(oy);
      } else
        Y(ay);
      g(S.ElementNode);
      return;
    } else
      Y(ly);
  }
  function b() {
    return m(), z(S.Identifier), $(S.Colon) && $(S.Identifier), g(S.TagNameNode);
  }
  function v() {
    m();
    const N = [];
    for (; !O([S.EndOfFileToken, S.NodeEnd, S.NodeClose]); )
      y(N);
    a.children.length === 0 ? q() : g(S.AttributeListNode);
  }
  function y(N) {
    if (m(), H(S.Identifier))
      w(N);
    else {
      const B = [S.Equal];
      if (!F(pn, B))
        return;
    }
    if ($(S.Equal) && !$(S.StringLiteral) && !$(S.Identifier)) {
      const B = [S.NodeEnd, S.NodeClose];
      F(iy, B);
    }
    g(S.AttributeNode);
  }
  function w(N) {
    const B = R();
    let D;
    m(), z(S.Identifier), $(S.Colon) && (H(S.Identifier) ? D = z(S.Identifier) : F(pn, [
      S.NodeClose,
      S.NodeEnd,
      S.Equal
    ])), _(N, { nsIdent: D, nameIdent: B }), g(S.AttributeKeyNode);
  }
  function _(N, { nameIdent: B, nsIdent: D }) {
    const P = s(B), I = D === void 0 ? void 0 : s(D), M = ({ ns: Ce, name: qe }) => qe === P && Ce === I, G = N.findIndex(M) !== -1, J = "A" <= P[0] && P[0] <= "Z", ee = G || J;
    G && V(Uo.duplAttr(P), B.pos, B.end), J && V(Uo.uppercaseAttr(P), B.pos, B.end), ee || N.push({ name: P });
  }
  function H(N) {
    return R().kind === N;
  }
  function $(N) {
    const B = H(N);
    return B && x(), B;
  }
  function O(N) {
    return N.includes(R().kind);
  }
  function F(N, B) {
    return O(B) || H(S.EndOfFileToken) ? (Y(N), !0) : (m(), Y(N), x(), g(S.ErrorNode), !1);
  }
  function Y({ code: N, message: B, category: D }) {
    const { pos: P, end: I } = R();
    r.push({
      category: D,
      code: N,
      message: B,
      pos: P,
      end: I
    });
  }
  function V({ code: N, message: B, category: D }, P, I) {
    r.push({
      category: D,
      code: N,
      message: B,
      pos: P,
      end: I
    });
  }
  function R(N = !1) {
    return o !== void 0 || (o = k(N)), o;
  }
  function W() {
    const N = R(!0);
    if (N.kind === S.EndOfFileToken || N.kind === S.OpenNodeStart || N.kind === S.Script || N.kind === S.CData || N.kind === S.CloseNodeStart)
      return N;
    const B = N.triviaBefore, D = (B == null ? void 0 : B.length) ?? 0;
    let P = 0, I = [], M = -1;
    for (; P < D; ++P)
      if (B[P].kind === S.CommentTrivia)
        I.push(B[P]);
      else {
        M = P;
        break;
      }
    let G = -1;
    for (; P < D; ++P)
      if (B[P].kind === S.CommentTrivia) {
        G = P;
        break;
      }
    let J = !1;
    if (N.kind === S.StringLiteral) {
      const te = N.end, Q = k(!0);
      J = Q.kind === S.CData || Q.kind === S.CloseNodeStart || Q.kind === S.Script || Q.kind === S.OpenNodeStart, l.resetTokenState(te);
    }
    let ee;
    J ? ee = N.pos : I.length > 0 ? ee = I[I.length - 1].end : M !== -1 ? ee = B[M].pos : ee = N.start;
    let Ce = ee, qe;
    I.length > 0 && (qe = I, Ce = I[0].pos);
    let Ee = S.TextNode, ae = -1;
    if (G !== -1)
      ae = B[G].pos, l.resetTokenState(ae);
    else if (J)
      Ee = S.StringLiteral, ae = N.end;
    else {
      for (; ; ) {
        const te = l.peekChar();
        if (te === null || te === L.lessThan)
          break;
        l.scanChar();
      }
      ae = l.getTokenEnd();
    }
    return o = { kind: Ee, start: Ce, pos: ee, end: ae, triviaBefore: qe }, o;
  }
  function z(N) {
    const B = x();
    if (B.kind !== N)
      throw new Error(
        `expected ${hn(N)}, bumped a ${hn(B.kind)}`
      );
    return B;
  }
  function x() {
    if (o) {
      a.children.push(o);
      const B = o;
      return o = void 0, B;
    }
    const N = k(!1);
    return a.children.push(N), N;
  }
  function m() {
    t.push(a), a = {
      children: []
    };
  }
  function g(N) {
    const B = bn(N, a.children), D = t[t.length - 1];
    return D.children.push(B), a = D, t.pop(), B;
  }
  function k(N) {
    let B, D = [], P = null;
    for (; ; ) {
      if (B = l.scan(), P === null && (P = l.getTokenStart()), n !== void 0) {
        let I;
        n.message.code === Tt.invalidChar ? I = Uo.invalidChar(l.getTokenText()) : I = n.message;
        const M = l.getTokenStart(), G = {
          kind: B,
          start: P,
          pos: M,
          end: l.getTokenEnd(),
          triviaBefore: D.length > 0 ? D : void 0
        };
        if (D = [], N && I.code === Tt.invalidChar)
          return n = void 0, G;
        const J = M + n.prefixLength;
        return G.end = J, l.resetTokenState(J), m(), a.children.push(G), V(I, M, J), g(S.ErrorNode), n = void 0, k(N);
      }
      switch (B) {
        case S.CommentTrivia:
        case S.NewLineTrivia:
        case S.WhitespaceTrivia:
          D.push({
            kind: B,
            start: P,
            pos: l.getTokenStart(),
            end: l.getTokenEnd()
          });
          break;
        default:
          return {
            kind: B,
            start: P,
            pos: l.getTokenStart(),
            end: l.getTokenEnd(),
            triviaBefore: D.length > 0 ? D : void 0
          };
      }
    }
  }
  function A(N) {
    F(N, []);
  }
  function q() {
    const N = t[t.length - 1];
    N.children.push(...a.children), a = N, t.pop();
  }
  return h(), { node: bn(S.ContentListNode, a.children), errors: r };
}
function bn(e, r) {
  const t = r[0], o = r[r.length - 1];
  return {
    kind: e,
    start: t.start,
    pos: t.pos,
    end: o.end,
    children: r
  };
}
const Ha = "__PARSED__";
function gy(e, r, t, o) {
  const a = {
    vars: {},
    moduleErrors: {},
    functions: {}
  }, n = {}, i = Nx(e, r, t, !0);
  if (Ax(i))
    return { ...a, moduleErrors: i };
  const l = o(i.name);
  return i.statements.forEach((h) => {
    switch (h.type) {
      case "VarS":
        h.declarations.forEach((c) => {
          if (c.id in a.vars)
            throw new Error(`Duplicated var declaration: '${c.id}'`);
          a.vars[c.id] = {
            [Ha]: !0,
            source: c.expression.source,
            tree: c.expression
          };
        });
        break;
      case "FuncD":
        f(l, h);
        break;
      case "ImportD":
        break;
      default:
        throw new Error(`'${h.type}' is not allowed in a code-behind module.`);
    }
  }), s(i), a;
  function s(h) {
    var T;
    const c = o(h.name);
    if (!((T = n == null ? void 0 : n[c]) != null && T.collectedImportsFrom)) {
      for (const b in h.imports) {
        const v = o(b), y = h.imports[b];
        for (const w of Object.values(y))
          w.type === "FuncD" && f(v, w);
      }
      n[c] ?? (n[c] = { collectedImportsFrom: !0 }), n[c].collectedImportsFrom = !0;
      for (let b of h.importedModules)
        s(b);
    }
  }
  function f(h, c) {
    var w, _, H, $;
    var T;
    if (((_ = (w = n == null ? void 0 : n[h]) == null ? void 0 : w.functions) == null ? void 0 : _[c.name]) !== void 0)
      return;
    if (c.name in a.functions)
      throw new Error(`Duplicated function declaration: '${c.name}'`);
    const b = c.args.length === 1 ? `${c.args[0].source} => ${c.statement.source}` : `(${c.args.map((O) => O.source).join(", ")}) => ${c.statement.source}`, v = {
      type: "ArrowE",
      args: c.args.slice(),
      statement: c.statement,
      closureContext: yl({
        blocks: [{ vars: {} }]
      })
    }, y = ($ = (H = v.closureContext[0]) == null ? void 0 : H.vars) == null ? void 0 : $[c.name];
    y != null && y.closureContext && delete y.closureContext, n[h] ?? (n[h] = { functions: {}, collectedImportsFrom: !1 }), (T = n[h]).functions ?? (T.functions = {}), n[h].functions[c.name] = {
      [Ha]: !0,
      source: b,
      tree: v
    }, a.functions[c.name] = {
      [Ha]: !0,
      source: b,
      tree: v
    };
  }
}
class di extends Error {
  constructor(r, t) {
    super(`${t ? `${t}: ` : ""}${r}`), this.code = t, Object.setPrototypeOf(this, di.prototype);
  }
}
const Ty = {
  U001: "Unexpected token: {0}.",
  U002: "A component definition can have exactly one XMLUI element.",
  U003: "A '<' token expected.",
  U004: "A node identifier expected.",
  U005: "A '</' token expected.",
  U006: "A '>' or '/>' token expected.",
  U007: "An '{0}' ID expected in the closing tag but '{1}' received.",
  U008: "A '>' token expected.",
  U009: "An attribute identifier expected.",
  U010: "An '=' token expected.",
  U011: "An attribute value expected.",
  U012: "Duplicated attribute: '{0}'.",
  U013: "Attribute name cannot start with an uppercase letter.",
  U014: "An '{0}' ID expected in the closing tag's namespace but '{1}' received.",
  U015: "Unexpected token in text element: {0}.",
  T001: "A component definition must have exactly one XMLUI element.",
  T002: "A component definition's name must start with an uppercase letter.",
  T003: "A reusable component must have a non-empty name.",
  T004: "A reusable component's name must start with an uppercase letter.",
  T005: "A reusable component must have at least one nested component definition.",
  T006: "A reusable component definition cannot nest another one.",
  T007: "Invalid attribute name: '{0}'",
  T008: "Event attribute names should not start with 'on' prefix: '{0}'",
  T009: "Invalid node name '{0}' in a component definition",
  T010: "The '{0}' element does not accept a text child",
  T011: "Only 'name', 'value', and type hint attributes are accepted in '{0}'.",
  T012: "The 'name' attribute in '{0}' is required.",
  T013: "A loader element must have an id.",
  T014: "A loader element must not have '{0}'.",
  T015: "The uses element must define only a non-empty 'value' attribute.",
  T016: "Only 'field' or 'item' are accepted as a child element.",
  T017: "Cannot mix 'field' and 'item' nodes within an element.",
  T018: "The '{0}' node cannot have a 'name' attribute.",
  T019: "The 'value' attribute in '{0}' is required.",
  T020: "Cannot mix nested components and non-component children.",
  T021: "Invalid reusable component attribute '{0}'.",
  T022: "The 'script' tag must not have any attribute.",
  T023: "A 'script' tag cannot nest other child nodes, only text.",
  T024: "Cannot put a reusable component definitions into a slot.",
  T025: "Duplicate xmlns found: '{0}'.",
  T026: "The top level component's name cannot have a namespace.",
  T027: "Cannot resolve namespace '{0}'. It was not defined in any of the ancestor components.",
  T028: "Incorrect namespace value '{0}'. {1}",
  T029: "Incorrect scheme specified before ':' (colon) in namespace {0}. Delete it to get the default '{1}'."
}, fn = "Component", Ba = /^[A-Z]/, vn = /^on[A-Z]/, yy = ["name", "value"], Cy = 9, Ia = "component-ns", ky = "app-ns", Sy = "#app-ns", wy = "core-ns", Hy = "#xmlui-core-ns", pt = {
  property: "property",
  event: "event",
  variable: "variable",
  loaders: "loaders",
  uses: "uses",
  method: "method",
  item: "item",
  field: "field"
};
function By(e, r, t, o = () => "") {
  const a = (x) => x.text ?? r(x), n = _y(e), i = F(n), l = [], s = [];
  return f(l, i);
  function f(x, m) {
    const g = kn(m, a, s);
    if (g === fn)
      return c(m);
    let k = {
      type: g,
      debug: {
        source: {
          start: m.start,
          end: m.end,
          fileId: t
        }
      }
    };
    return T(x, k, m), k;
  }
  function h(x, m) {
    const g = kn(m, a, s);
    g === fn && be("T006");
    let k = {
      type: g,
      debug: {
        source: {
          start: m.start,
          end: m.end,
          fileId: t
        }
      }
    };
    return T(x, k, m), k;
  }
  function c(x) {
    const m = Zt(x).map($), g = m.find((ee) => ee.name === "name");
    g || be("T003"), Ba.test(g.value) || be("T004");
    let k;
    const A = m.filter((ee) => ee.startSegment === "method");
    A.length > 0 && (k = {}, A.forEach((ee) => {
      k[ee.name] = ee.value;
    }));
    let q;
    const E = m.filter((ee) => ee.startSegment === "var");
    E.length > 0 && (q = {}, E.forEach((ee) => {
      q[ee.name] = ee.value;
    }));
    const N = jt(x), B = N.filter(
      (ee) => ee.kind === S.ElementNode && !(at(ee, a) in pt)
    );
    B.length === 0 && B.push(gn(""));
    const D = [], P = [];
    for (let ee of N)
      if (ee.kind === S.ElementNode) {
        const Ce = at(ee, a);
        Ce === pt.variable ? P.push(ee) : Ce in pt && D.push(ee);
      }
    let I;
    B.length > 1 || P.length > 0 ? I = Tn([...P, ...B]) : I = B[0], s.push(/* @__PURE__ */ new Map()), m.filter((ee) => ee.namespace === "xmlns").forEach((ee) => {
      Cn(s, I, ee.unsegmentedName, ee.value);
    });
    let M = h(
      l,
      I
    );
    s.pop();
    const G = {
      name: g.value,
      component: M,
      debug: {
        source: {
          start: x.start,
          end: x.end,
          fileId: t
        }
      }
    };
    k && (G.api = k), q && (M.vars = { ...M.vars, ...q }), M.debug = {
      source: {
        start: I.start,
        end: I.end,
        fileId: t
      }
    };
    const J = yn(x, D);
    return T(l, G, J), G;
  }
  function T(x, m, g) {
    var B;
    const k = !Or(m), A = Zt(g);
    if (s.push(/* @__PURE__ */ new Map()), A.forEach((D) => {
      b(m, D);
    }), jt(g).forEach((D) => {
      if (D.kind === S.Script) {
        Zt(D).length > 0 && be("T022");
        const I = a(D), M = I.slice(
          I.indexOf(">") + 1,
          I.lastIndexOf("</")
        );
        m.script ?? (m.script = ""), m.script.length > 0 && (m.script += `
`), m.script += M;
        return;
      }
      if (D.kind === S.TextNode && !k) {
        m.children = Go(m.children, a(D));
        return;
      }
      const P = at(D, a);
      if (!(k && D.kind === S.ElementNode && !(P in pt))) {
        if (!(P in pt) && !k) {
          const I = h(x, D);
          I && (m.children ? typeof m.children == "string" ? m.children = [m.children, I] : Array.isArray(m.children) && m.children.push(I) : m.children = [I]);
          return;
        }
        switch (P) {
          case "property":
            _(
              x,
              m,
              D,
              (I) => {
                var M;
                return Or(m) ? (M = m.props) == null ? void 0 : M[I] : void 0;
              },
              (I, M) => {
                Or(m) && (m.props ?? (m.props = {}), m.props[I] = M);
              }
            );
            return;
          case "event":
            _(
              x,
              m,
              D,
              (I) => {
                var M;
                return Or(m) ? (M = m.events) == null ? void 0 : M[I] : void 0;
              },
              (I, M) => {
                Or(m) && (m.events ?? (m.events = {}), m.events[I] = M);
              },
              (I) => {
                vn.test(I) && be("T008", I);
              }
            );
            return;
          case pt.variable:
            _(
              x,
              m,
              D,
              (I) => {
                var M;
                return Or(m) ? (M = m.vars) == null ? void 0 : M[I] : void 0;
              },
              (I, M) => {
                Or(m) && (m.vars ?? (m.vars = {}), m.vars[I] = M);
              }
            );
            return;
          case "loaders":
            w(x, m, D);
            return;
          case "uses":
            H(m, D);
            return;
          case "method":
            _(
              x,
              m,
              D,
              (I) => {
                var M;
                return Or(m) ? (M = m.api) == null ? void 0 : M[I] : void 0;
              },
              (I, M) => {
                m.api ?? (m.api = {}), m.api[I] = M;
              }
            );
            return;
          default:
            be("T009", P);
            return;
        }
      }
    }), s.pop(), !m.script || m.script.trim().length === 0)
      return;
    const E = new Tl(m.script);
    try {
      E.parseStatements(), m.scriptCollected = gy(
        "Main",
        m.script,
        o,
        (D) => D
      );
    } catch (D) {
      E.errors && E.errors.length > 0 ? m.scriptError = E.errors : m.scriptError = D;
    }
    const N = ((B = m.scriptCollected) == null ? void 0 : B.moduleErrors) ?? {};
    Object.keys(N).length > 0 && (m.scriptError = N);
  }
  function b(x, m) {
    const { namespace: g, startSegment: k, name: A, value: q, unsegmentedName: E } = $(m);
    if (g === "xmlns")
      return Cn(s, x, E, q);
    if (!Or(x)) {
      if (k && k !== "method" && k !== "var") {
        be("T021");
        return;
      }
      if (A === "name" && !k)
        return;
      !k && A && be("T021", A);
      return;
    }
    switch (A) {
      case "id":
        x.uid = q;
        return;
      case "testId":
        x.testId = q;
        return;
      case "when":
        x.when = q;
        return;
      default:
        if (k === "var")
          x.vars ?? (x.vars = {}), x.vars[A] = q;
        else if (k === "method")
          x.api ?? (x.api = {}), x.api[A] = q;
        else if (k === "event")
          x.events ?? (x.events = {}), x.events[A] = q;
        else if (vn.test(A)) {
          x.events ?? (x.events = {});
          const B = A[2].toLowerCase() + A.substring(3);
          x.events[B] = q;
        } else
          x.props ?? (x.props = {}), x.props[A] = q;
        return;
    }
  }
  function v(x, m) {
    let g = null;
    if (!m) return g;
    let k = null;
    return m.forEach((A) => {
      if (A.kind === S.TextNode) {
        g = Go(g, a(A));
        return;
      }
      if (A.kind !== S.ElementNode) return;
      const q = at(A, a);
      if (q !== "field" && q !== "item") {
        be("T016");
        return;
      }
      if (q === "field") {
        if (!k)
          k = q, g = {};
        else if (k !== q) {
          be("T017");
          return;
        }
      } else if (q === "item") {
        if (!k)
          k = q, g = [];
        else if (k !== q) {
          be("T017");
          return;
        }
      }
      let E = y(x, A, q === "field");
      if (!E)
        return null;
      k === "field" ? g[E.name] = E.value : g.push(E.value);
    }), g;
  }
  function y(x, m, g = !0) {
    const k = at(m, a), A = jt(m), q = A.filter(
      (G) => G.kind === S.ElementNode && Ba.test(at(G, a))
    ), E = A.filter(
      (G) => G.kind === S.ElementNode && !Ba.test(at(G, a))
    ), N = Zt(m).map($), B = N.filter((G) => yy.indexOf(G.name) >= 0);
    if (N.length > B.length)
      return be("T011", k), null;
    const D = B.find((G) => G.name === "name");
    if (g) {
      if (!(D != null && D.value))
        return be("T012", k), null;
    } else if (D)
      return be("T018", k), null;
    const P = D == null ? void 0 : D.value, I = B.find((G) => G.name === "value");
    if (I && I.value === void 0)
      return be("T019", k), null;
    if (P && q.length >= 1) {
      if (E.length > 0)
        return be("T020"), null;
      const G = q.map((J) => h(x, J));
      return {
        name: P,
        value: G.length === 1 ? G[0] : G
      };
    }
    let M = I == null ? void 0 : I.value;
    return M === null ? null : typeof M == "string" ? { name: P, value: M } : { name: P, value: v(x, A) };
  }
  function w(x, m, g) {
    var q;
    if (!Or(m)) {
      be("T009", "loaders");
      return;
    }
    const k = jt(g);
    if (k.length === 0 && (m.loaders ?? (m.loaders = [])), (q = g.children) == null ? void 0 : q.some((E) => E.kind === S.AttributeListNode)) {
      be("T014", "attributes");
      return;
    }
    k.forEach((E) => {
      if (E.kind === S.TextNode) {
        be("T010", "loader");
        return;
      }
      const N = h(x, E);
      if (!N.uid) {
        be("T013");
        return;
      }
      if (N.vars) {
        be("T014", "vars");
        return;
      }
      if (N.loaders) {
        be("T014", "loaders");
        return;
      }
      if (N.uses) {
        be("T014", "uses");
        return;
      }
      m.loaders ?? (m.loaders = []), m.loaders.push(N);
    });
  }
  function _(x, m, g, k, A, q) {
    const E = y(x, g);
    if (!E)
      return;
    q == null || q((E == null ? void 0 : E.name) ?? "");
    const N = E.name, B = E.value;
    if ((E == null ? void 0 : E.value) !== void 0)
      A(N, Go(k(N), B));
    else {
      const D = jt(g), P = v(x, D);
      let I = k(N);
      I = Go(I, P), A(N, I);
    }
  }
  function H(x, m) {
    if (!Or(x)) {
      be("T009", "uses");
      return;
    }
    const g = Zt(m).map($), k = g.find((A) => A.name === "value");
    if (!(k != null && k.value) || g.length !== 1) {
      be("T015", "uses");
      return;
    }
    x.uses ?? (x.uses = k.value.split(",").map((A) => A.trim()));
  }
  function $(x) {
    let m = x.children[0];
    const g = m.children.length === 3;
    let k;
    g && (k = a(m.children[0]));
    let A = a(m.children[m.children.length - 1]);
    const q = A.split(".");
    q.length > 2 && be("T007", x, m);
    let E, N;
    q.length === 2 ? (N = q[0], E = q[1], E.trim() === "" && be("T007", x, E)) : E = A;
    const B = a(x.children[2]), D = B.substring(1, B.length - 1);
    return { namespace: k, startSegment: N, name: E, value: D, unsegmentedName: A };
  }
  function O(x) {
    for (let m of x) {
      const g = m.children[m.children.length - 1], k = W(a(g));
      k !== null && (g.text = k);
    }
  }
  function F(x) {
    const m = jt(x), g = at(x, a), A = !(g in pt) || g === "property", q = g !== "event" && g !== "method", E = Zt(x);
    $y(E), Ly(E, a), O(E), R(m), z(m, q);
    let N = !1, B = !1;
    for (let M = 0; M < m.length; ++M) {
      const G = m[M];
      let J;
      if (G.kind == S.Script) {
        B = !0;
        continue;
      }
      if (G.kind === S.ElementNode) {
        J = F(G), m[M] = J;
        continue;
      }
      let ee = a(G);
      G.kind === S.StringLiteral ? ee = ee.slice(1, -1) : G.kind === S.CData && (N = !0), A ? N ? J = Iy(ee) : J = gn(ee) : J = {
        kind: S.TextNode,
        text: ee
      }, m[M] = J;
    }
    const D = [], P = [];
    let I = !1;
    for (const M of m) {
      if (M.kind === S.ElementNode) {
        if ((at(M, a) ?? void 0) in pt) {
          D.push(M);
          continue;
        }
        I = !0;
      }
      P.push(M);
    }
    if (B && I) {
      const M = Tn(P);
      return D.push(M), yn(x, D);
    }
    return x;
  }
  function Y(x) {
    for (let m = 0; m < x.length; ++m)
      if (x[m].kind === S.StringLiteral || x[m].kind === S.TextNode) {
        const g = /[\f\n\r\t\v\u0020\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g;
        x[m].text = a(x[m]).replace(
          g,
          " "
        );
      }
  }
  function V(x) {
    for (let m = 0; m < x.length; ++m)
      x[m].kind === S.CData && (x[m].text = a(x[m]).slice(Cy, -3));
  }
  function R(x) {
    for (let m of x)
      if (m.kind === S.StringLiteral || m.kind === S.TextNode) {
        const g = W(a(m));
        g !== null && (m.text = g);
      }
  }
  function W(x) {
    let m = "", g = 0;
    for (let k = 0; k < x.length; ++k)
      if (x.charCodeAt(k) === L.ampersand)
        switch (x.charCodeAt(k + 1)) {
          case L.a:
            switch (x.charCodeAt(k + 2)) {
              case L.m:
                x.charCodeAt(k + 3) === L.p && x.charCodeAt(k + 4) === L.semicolon && (m = m + x.substring(g, k) + "&", k += 4, g = k + 1);
                break;
              case L.p:
                x.charCodeAt(k + 3) === L.o && x.charCodeAt(k + 4) === L.s && x.charCodeAt(k + 5) === L.semicolon && (m = m + x.substring(g, k) + "'", k += 5, g = k + 1);
                break;
            }
            break;
          case L.g:
            x.charCodeAt(k + 2) === L.t && x.charCodeAt(k + 3) === L.semicolon && (m = m + x.substring(g, k) + ">", k += 3, g = k + 1);
            break;
          case L.l:
            x.charCodeAt(k + 2) === L.t && x.charCodeAt(k + 3) === L.semicolon && (m = m + x.substring(g, k) + "<", k += 3, g = k + 1);
            break;
          case L.q:
            x.charCodeAt(k + 2) === L.u && x.charCodeAt(k + 3) === L.o && x.charCodeAt(k + 4) === L.t && x.charCodeAt(k + 5) === L.semicolon && (m = m + x.substring(g, k) + '"', k += 5, g = k + 1);
            break;
          case L.n:
            x.charCodeAt(k + 2) === L.b && x.charCodeAt(k + 3) === L.s && x.charCodeAt(k + 4) === L.p && x.charCodeAt(k + 5) === L.semicolon && (m = m + x.substring(g, k) + " ", k += 5, g = k + 1);
            break;
        }
    return g === 0 ? null : (m += x.substring(g), m);
  }
  function z(x, m) {
    m && Y(x), V(x);
    for (let g = x.length - 1; g > 0; --g) {
      const k = x[g - 1], A = x[g];
      k.kind === S.StringLiteral && A.kind === S.CData ? (x[g - 1] = {
        kind: S.CData,
        text: a(k).slice(1, -1) + a(A)
      }, x.pop()) : k.kind === S.CData && A.kind === S.StringLiteral ? (x[g - 1] = {
        kind: S.CData,
        text: a(k) + a(A).slice(1, -1)
      }, x.pop()) : k.kind === S.CData && A.kind === S.TextNode ? (x[g - 1] = {
        kind: S.CData,
        text: a(k) + a(A)
      }, x.pop()) : k.kind === S.CData && A.kind === S.CData ? (x[g - 1] = {
        kind: S.CData,
        text: a(k) + a(A)
      }, x.pop()) : k.kind === S.TextNode && A.kind === S.TextNode ? (a(k).endsWith(" ") && a(A).startsWith(" ") && (k.text = a(k).trimEnd()), x[g - 1] = {
        kind: S.TextNode,
        text: a(k) + a(A)
      }, x.pop()) : k.kind === S.TextNode && A.kind === S.CData && (x[g - 1] = {
        kind: S.CData,
        text: a(k) + a(A)
      }, x.pop());
    }
  }
}
function Iy(e) {
  return {
    kind: S.ElementNode,
    children: [
      { kind: S.OpenNodeStart },
      {
        kind: S.TagNameNode,
        children: [{ kind: S.Identifier, text: "TextNodeCData" }]
      },
      {
        kind: S.AttributeListNode,
        children: [
          {
            kind: S.AttributeNode,
            children: [
              {
                kind: S.AttributeKeyNode,
                children: [{ kind: S.Identifier, text: "value" }]
              },
              { kind: S.Equal },
              { kind: S.Identifier, text: `"${e}"` }
            ]
          }
        ]
      },
      { kind: S.NodeClose }
    ]
  };
}
function gn(e) {
  return {
    kind: S.ElementNode,
    children: [
      { kind: S.OpenNodeStart },
      {
        kind: S.TagNameNode,
        children: [{ kind: S.Identifier, text: "TextNode" }]
      },
      {
        kind: S.AttributeListNode,
        children: [
          {
            kind: S.AttributeNode,
            children: [
              {
                kind: S.AttributeKeyNode,
                children: [{ kind: S.Identifier, text: "value" }]
              },
              { kind: S.Equal },
              { kind: S.Identifier, text: `"${e}"` }
            ]
          }
        ]
      },
      { kind: S.NodeClose }
    ]
  };
}
function be(e, ...r) {
  let t = Ty[e] ?? "Unknown error";
  throw r && r.forEach((a, n) => t = o(t, `{${n}}`, a.toString())), new di(t, e);
  function o(a, n, i) {
    do
      a = a.replace(n, i);
    while (a.includes(n));
    return a;
  }
}
function Or(e) {
  return e.type;
}
function Go(e, r) {
  return e ? Array.isArray(e) ? typeof e == "string" ? [e, r] : (e.push(r), e) : [e, r] : r;
}
function Tn(e) {
  const r = {
    kind: S.TagNameNode,
    children: [{ kind: S.Identifier, text: "Fragment" }]
  };
  return {
    kind: S.ElementNode,
    start: e[0].start,
    pos: e[0].pos,
    end: e[e.length - 1].end,
    children: [
      { kind: S.OpenNodeStart },
      r,
      { kind: S.NodeEnd },
      { kind: S.ContentListNode, children: e },
      { kind: S.CloseNodeStart },
      r,
      { kind: S.NodeEnd }
    ]
  };
}
function Zt(e) {
  var r, t;
  return ((t = (r = e.children) == null ? void 0 : r.find((o) => o.kind === S.AttributeListNode)) == null ? void 0 : t.children) ?? [];
}
function jt(e) {
  var r, t;
  return ((t = (r = e.children) == null ? void 0 : r.find((o) => o.kind === S.ContentListNode)) == null ? void 0 : t.children) ?? [];
}
function yn(e, r) {
  var o;
  const t = (o = e.children) == null ? void 0 : o.findIndex((a) => a.kind === S.ContentListNode);
  return t === void 0 || t === -1 ? e : {
    ...e,
    children: [
      ...e.children.slice(0, t),
      { ...e.children[t], children: r },
      ...e.children.slice(t)
    ]
  };
}
function $y(e) {
  var r;
  for (let t of e)
    if (((r = t.children) == null ? void 0 : r.length) === 1) {
      const o = {
        kind: S.Equal
      }, a = {
        kind: S.StringLiteral,
        text: '"true"'
      };
      t.children.push(o, a);
    }
}
function Ly(e, r) {
  var t, o, a;
  for (let n of e) {
    const i = (t = n.children) == null ? void 0 : t[2];
    ((a = (o = n.children) == null ? void 0 : o[2]) == null ? void 0 : a.kind) === S.Identifier && (i.text = '"' + r(i) + '"');
  }
}
function Cn(e, r, t, o) {
  let a = o.split(":");
  if (a.length > 2)
    return be("T028", o, "Namespace cannot contain multiple ':' (colon).");
  let n = o;
  if (a.length === 2) {
    if (a[0] != Ia)
      return be("T029", o, Ia);
    n = a[1];
  }
  if (n.includes("#"))
    return be("T028", n, "Namespace cannot contain character '#'.");
  switch (n) {
    case Ia:
      n = t;
      break;
    case ky:
      n = Sy;
      break;
    case wy:
      n = Hy;
      break;
  }
  const i = e[e.length - 1];
  if (i.has(t))
    return be("T025", t);
  i.set(t, n), r.namespaces ?? (r.namespaces = {}), r.namespaces[t] = n;
}
function _y(e, r) {
  e.children.length !== 2 && be("T001");
  const t = e.children[0];
  return t.kind !== S.ElementNode && be("T001"), t;
}
function at(e, r) {
  const t = e.children.find((a) => a.kind === S.TagNameNode).children;
  return r(t.at(-1));
}
function kn(e, r, t) {
  const o = e.children.find((l) => l.kind === S.TagNameNode).children, a = r(o.at(-1));
  if (o.length === 1)
    return a;
  const n = r(o[0]);
  t.length === 0 && be("T026");
  let i;
  for (let l = t.length - 1; l >= 0 && (i = t[l].get(n), i === void 0); --l)
    ;
  return i === void 0 && be("T027", n), i + "." + a;
}
function Ay(e, r = 0, t) {
  const { parse: o, getText: a } = fy(e), { node: n, errors: i } = o();
  if (i.length > 0) {
    const l = [];
    for (let h = 0; h < e.length; ++h)
      e[h] === `
` && l.push(h);
    const s = Ny(i, l), f = Sn(n, a);
    return { component: null, errors: s, erroneousCompoundComponentName: f };
  }
  try {
    return { component: By(n, a, r, t), errors: [] };
  } catch (l) {
    const s = Sn(n, a), f = {
      message: l.message,
      col: 0,
      line: 0,
      code: Tt.expEq,
      category: ao.Error,
      pos: 0,
      end: 0
    };
    return {
      component: null,
      erroneousCompoundComponentName: s,
      errors: [f]
    };
  }
}
function Ny(e, r) {
  if (r.length === 0) {
    for (let t of e)
      t.line = 1, t.col = t.pos + 1;
    return e;
  }
  for (let t of e) {
    let o = 0;
    for (; o < r.length; ++o) {
      const n = r[o];
      if (t.pos < n) {
        t.line = o + 1, t.col = t.pos - (r[o - 1] ?? 0) + 1;
        break;
      }
    }
    const a = r[r.length - 1];
    t.pos >= a && (t.line = r.length + 1, t.col = t.pos - a + 0);
  }
  return e;
}
function Sn(e, r) {
  var s, f, h, c, T, b;
  const t = (s = e == null ? void 0 : e.children) == null ? void 0 : s[0], o = (h = (f = t == null ? void 0 : t.children) == null ? void 0 : f.find(
    (v) => v.kind === S.TagNameNode
  )) == null ? void 0 : h.children, a = o == null ? void 0 : o[o.length - 1];
  if (a === void 0 || r(a) !== "Component")
    return;
  const n = (T = (c = t.children) == null ? void 0 : c.find((v) => v.kind === S.AttributeListNode)) == null ? void 0 : T.children, i = (b = n == null ? void 0 : n.find(
    (v) => v.kind === S.AttributeNode && r(v == null ? void 0 : v.children[0]) === "name"
  )) == null ? void 0 : b.children, l = i == null ? void 0 : i[i.length - 1];
  if (l !== void 0 && l.kind === S.StringLiteral) {
    const v = r(l);
    return v.substring(1, v.length - 1);
  }
}
function Wy(e, r) {
  const t = Ay(r).component;
  if (!t)
    throw new Error(`Failed to parse ${e} component definition during build.`);
  return t;
}
const Ga = "FormSection", Oy = C({
  status: "experimental",
  description: `The \`${Ga}\` is a component that groups cohesive elements together within a \`Form\`. This grouping is indicated visually: the child components of the \`${Ga}\` are placed in a [\`FlowLayout\`](./FlowLayout.mdx) component.`
}), Ry = `
<Component name="FormSection">
  <VStack paddingBottom="{$props.paddingBottom ?? '1rem'}" gap="0" width="100%">
    <Heading 
      when="{!!$props.heading}"
      marginBottom="$space-tight"
      level="{$props.headingLevel ?? 'h3'}"
      fontWeight="{$props.headingWeight ?? 'bold'}"
      value="{$props.heading}" />
    <Text
      when="{!!$props.info}"
      fontSize="{$props.infoFontSize ?? '0.8rem'}"
      paddingBottom="$space-normal"
      value="{$props.info}" />
    <FlowLayout 
      width="100%"
      paddingTop="{$props.paddingTop ?? '$space-normal'}"
      columnGap="{$props.columnGap ?? '3rem'}"
      rowGap="{$props.rowGap ?? '$space-normal'}" >
      <Slot />
    </FlowLayout>
  </VStack>
</Component>
`;
Wy(Ga, Ry);
const zy = '"[]"', Vy = {
  themeVars: zy
}, Ey = "ButtonGroup", Dy = C({
  status: "in progress",
  description: `(**NOT IMPLEMENTED YET**) The \`${Ey}\` component is a container that embeds buttons used together for a particular reason. It provides a view that emphasizes this coherency.`,
  props: {
    themeColor: {
      description: "This optional property specifies the default theme color for the buttons in the group. Individual buttons may override this setting with their `themeColor` property.",
      availableValues: Za,
      valueType: "string",
      defaultValue: "primary"
    },
    variant: {
      description: "This optional property specifies the default variant for the buttons in the group. Individual buttons may override this setting with their `variant` property.",
      availableValues: ja,
      valueType: "string",
      defaultValue: "solid"
    },
    orientation: Xn("horizontal"),
    buttonWidth: {
      description: "When this optional property is set, all buttons within the group will have the specified width. If it is empty, each button's width accommodates its content."
    },
    gap: {
      description: "When this optional property is set, adjacent buttons will have the specified gap between them. If this property is not set, the buttons will be merged into one group."
    }
  },
  themeVars: Z(Vy.themeVars),
  defaultThemeVars: {
    light: {},
    dark: {}
  }
}), Py = "Breakout", My = C({
  description: `The \`${Py}\` component creates a breakout section. It allows its child to occupy the entire width of the UI even if the app or the parent container constrains the maximum content width.`
}), Fy = `'{"width-Carousel": "var(--xmlui-width-Carousel)", "height-Carousel": "var(--xmlui-height-Carousel)", "height-control-Carousel": "var(--xmlui-height-control-Carousel)", "width-control-Carousel": "var(--xmlui-width-control-Carousel)", "color-control-Carousel": "var(--xmlui-color-control-Carousel)", "backgroundColor-control-Carousel": "var(--xmlui-backgroundColor-control-Carousel)", "borderRadius-control-Carousel": "var(--xmlui-borderRadius-control-Carousel)", "backgroundColor-control-hover-Carousel": "var(--xmlui-backgroundColor-control-hover-Carousel)", "color-control-hover-Carousel": "var(--xmlui-color-control-hover-Carousel)", "backgroundColor-control-active-Carousel": "var(--xmlui-backgroundColor-control-active-Carousel)", "color-control-active-Carousel": "var(--xmlui-color-control-active-Carousel)", "color-control-disabled-Carousel": "var(--xmlui-color-control-disabled-Carousel)", "backgroundColor-control-disabled-Carousel": "var(--xmlui-backgroundColor-control-disabled-Carousel)", "width-indicator-Carousel": "var(--xmlui-width-indicator-Carousel)", "height-indicator-Carousel": "var(--xmlui-height-indicator-Carousel)", "color-indicator-Carousel": "var(--xmlui-color-indicator-Carousel)", "backgroundColor-indicator-Carousel": "var(--xmlui-backgroundColor-indicator-Carousel)", "backgroundColor-indicator-hover-Carousel": "var(--xmlui-backgroundColor-indicator-hover-Carousel)", "color-indicator-hover-Carousel": "var(--xmlui-color-indicator-hover-Carousel)", "backgroundColor-indicator-active-Carousel": "var(--xmlui-backgroundColor-indicator-active-Carousel)", "color-indicator-active-Carousel": "var(--xmlui-color-indicator-active-Carousel)"}'`, qy = "_carousel_cahis_13", Uy = "_carouselContentWrapper_cahis_30", Gy = "_carouselContent_cahis_30", Yy = "_vertical_cahis_40", Xy = "_controls_cahis_51", Qy = "_controlButton_cahis_60", Zy = "_indicators_cahis_87", jy = "_indicator_cahis_87", Jy = "_active_cahis_107", fr = {
  themeVars: Fy,
  carousel: qy,
  carouselContentWrapper: Uy,
  carouselContent: Gy,
  vertical: Yy,
  controls: Xy,
  controlButton: Qy,
  indicators: Zy,
  indicator: jy,
  active: Jy
}, Ky = Zr({
  register: (e) => {
  },
  unRegister: (e) => {
  }
});
function eC() {
  const [e, r] = me([]), t = ue(() => ({
    register: (o) => {
      r(
        At((a) => {
          const n = a.findIndex((i) => i.id === o.id);
          n < 0 ? a.push(o) : a[n] = o;
        })
      );
    },
    unRegister: (o) => {
      r(
        At((a) => a.filter((n) => n.id !== o))
      );
    }
  }), [r]);
  return {
    carouselItems: e,
    carouselContextValue: t
  };
}
const Xe = {
  orientation: "horizontal",
  indicators: !0,
  autoplay: !1,
  controls: !0,
  loop: !1,
  startIndex: 0,
  transitionDuration: 25,
  autoplayInterval: 5e3,
  stopAutoplayOnInteraction: !0
};
xe(function({
  orientation: r = Xe.orientation,
  children: t,
  style: o,
  indicators: a = Xe.indicators,
  onDisplayDidChange: n = de,
  autoplay: i = Xe.autoplay,
  controls: l = Xe.controls,
  loop: s = Xe.loop,
  startIndex: f = Xe.startIndex,
  prevIcon: h,
  nextIcon: c,
  transitionDuration: T = Xe.transitionDuration,
  autoplayInterval: b = Xe.autoplayInterval,
  stopAutoplayOnInteraction: v = Xe.stopAutoplayOnInteraction,
  registerComponentApi: y
}, w) {
  const _ = he(null), [H, $] = me(0), [O, F] = me([]), [Y, V] = me(!1), { carouselContextValue: R, carouselItems: W } = eC(), z = w ? st(_, w) : _, [x, m] = Od(
    {
      axis: r === "horizontal" ? "x" : "y",
      loop: s,
      startIndex: f,
      duration: T
    },
    O
  ), g = h || r === "horizontal" ? "arrowleft" : "arrowup", k = c || r === "horizontal" ? "arrowright" : "arrowdown";
  K(() => {
    i && F([
      Rd({
        delay: b,
        stopOnInteraction: v
      })
    ]);
  }, [b, i, v]);
  const A = X(() => {
    var Ce;
    const J = (Ce = m == null ? void 0 : m.plugins()) == null ? void 0 : Ce.autoplay;
    if (!J) return;
    (J.isPlaying() ? J.stop : J.play)();
  }, [m]);
  K(() => {
    var ee;
    const J = (ee = m == null ? void 0 : m.plugins()) == null ? void 0 : ee.autoplay;
    J && (V(J.isPlaying()), m.on("autoplay:play", () => V(!0)).on("autoplay:stop", () => V(!1)).on("reInit", () => V(J.isPlaying())));
  }, [m]);
  const q = X(
    (J) => {
      m == null || m.scrollTo(J);
    },
    [m]
  ), [E, N] = Ve.useState(!1), [B, D] = Ve.useState(!1), P = Ve.useCallback(
    (J) => {
      if (!J)
        return;
      const ee = J.selectedScrollSnap();
      n(ee), $(ee), N(J.canScrollPrev()), D(J.canScrollNext());
    },
    [n]
  ), I = X(() => {
    m && (m == null || m.scrollPrev());
  }, [m]), M = X(() => {
    m == null || m.scrollNext();
  }, [m]), G = X(
    (J) => {
      r === "horizontal" ? J.key === "ArrowLeft" ? (J.preventDefault(), I()) : J.key === "ArrowRight" && (J.preventDefault(), M()) : J.key === "ArrowUp" ? (J.preventDefault(), I()) : J.key === "ArrowDown" && (J.preventDefault(), M());
    },
    [r, I, M]
  );
  return K(() => {
    y == null || y({
      scrollTo: q,
      scrollPrev: I,
      scrollNext: M,
      canScrollPrev: () => E,
      canScrollNext: () => B
    });
  }, [y, q, I, M, E, B]), Ve.useEffect(() => {
    if (m)
      return P(m), m.on("init", P), m.on("reInit", P), m.on("select", P), () => {
        m == null || m.off("select", P);
      };
  }, [m, P]), K(() => {
    _ != null && _.current && _.current.addEventListener("keydown", G);
  }, [z, G]), /* @__PURE__ */ p(Ky.Provider, { value: R, children: /* @__PURE__ */ j(
    "div",
    {
      style: o,
      ref: z,
      className: le(fr.carousel),
      role: "region",
      tabIndex: -1,
      "aria-roledescription": "carousel",
      children: [
        /* @__PURE__ */ p("div", { ref: x, className: fr.carouselContentWrapper, children: /* @__PURE__ */ p(
          "div",
          {
            className: le(fr.carouselContent, {
              [fr.horizontal]: r === "horizontal",
              [fr.vertical]: r === "vertical"
            }),
            children: t
          }
        ) }),
        l && /* @__PURE__ */ j("div", { className: fr.controls, children: [
          i && /* @__PURE__ */ p("button", { className: fr.controlButton, onClick: A, children: Y ? /* @__PURE__ */ p(ye, { name: "pause" }) : /* @__PURE__ */ p(ye, { name: "play" }) }),
          /* @__PURE__ */ p("button", { className: fr.controlButton, disabled: !E, onClick: I, children: /* @__PURE__ */ p(ye, { name: g }) }),
          /* @__PURE__ */ p("button", { className: fr.controlButton, onClick: M, disabled: !B, children: /* @__PURE__ */ p(ye, { name: k }) })
        ] }),
        a && /* @__PURE__ */ p("div", { className: fr.indicators, children: W.map((J, ee) => /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            onClick: () => q(ee),
            className: le(fr.indicator, {
              [fr.active]: ee === H
            }),
            "aria-current": ee === H
          },
          ee
        )) })
      ]
    }
  ) });
});
const ze = "Carousel", rC = C({
  status: "in progress",
  description: "This component displays a slideshow by cycling through elements (images, text, or custom slides) like a carousel.",
  props: {
    orientation: {
      description: "This property indicates the orientation of the carousel. The `horizontal` value indicates that the carousel moves horizontally, and the `vertical` value indicates that the carousel moves vertically.",
      availableValues: aa,
      valueType: "string",
      defaultValue: Xe.orientation
    },
    indicators: {
      description: "This property indicates whether the carousel displays the indicators.",
      valueType: "boolean",
      defaultValue: Xe.indicators
    },
    controls: {
      description: "This property indicates whether the carousel displays the controls.",
      valueType: "boolean",
      defaultValue: Xe.controls
    },
    autoplay: {
      description: "This property indicates whether the carousel automatically scrolls.",
      valueType: "boolean",
      defaultValue: Xe.autoplay
    },
    loop: {
      description: "This property indicates whether the carousel loops.",
      valueType: "boolean",
      defaultValue: Xe.loop
    },
    startIndex: {
      description: "This property indicates the index of the first slide to display.",
      valueType: "number",
      defaultValue: Xe.startIndex
    },
    transitionDuration: {
      description: "This property indicates the duration of the transition between slides.",
      valueType: "number",
      defaultValue: Xe.transitionDuration
    },
    autoplayInterval: {
      description: "This property specifies the interval between autoplay transitions.",
      valueType: "number",
      defaultValue: Xe.autoplayInterval
    },
    stopAutoplayOnInteraction: {
      description: "This property indicates whether autoplay stops on interaction.",
      valueType: "boolean",
      defaultValue: Xe.stopAutoplayOnInteraction
    },
    prevIcon: {
      description: "This property specifies the icon to display for the previous control.",
      valueType: "string"
    },
    nextIcon: {
      description: "This property specifies the icon to display for the next control.",
      valueType: "string"
    },
    keyboard: {
      description: "This property indicates whether the carousel responds to keyboard events.",
      valueType: "boolean"
    }
  },
  events: {
    displayDidChange: er(ze)
  },
  apis: {
    canScrollPrev: u(
      "This method returns `true` if the carousel can scroll to the previous slide."
    ),
    canScrollNext: u("This method returns `true` if the carousel can scroll to the next slide."),
    scrollTo: u("This method scrolls the carousel to the specified slide index."),
    scrollPrev: u("This method scrolls the carousel to the previous slide."),
    scrollNext: u("This method scrolls the carousel to the next slide.")
  },
  themeVars: Z(fr.themeVars),
  themeVarDescriptions: {
    [`width-indicator-${ze}`]: "Sets the width of the indicator."
  },
  defaultThemeVars: {
    [`backgroundColor-control-${ze}`]: "$color-primary",
    [`color-control-${ze}`]: "$textColor",
    [`backgroundColor-control-hover-${ze}`]: "$color-primary",
    [`color-control-hover-${ze}`]: "$textColor",
    [`backgroundColor-control-active-${ze}`]: "$color-primary",
    [`backgroundColor-control-disabled-${ze}`]: "$color-surface-200",
    [`color-control-disabled-${ze}`]: "$textColor-disabled",
    [`color-control-active-${ze}`]: "$color-primary",
    [`backgroundColor-indicator-${ze}`]: "$color-surface-200",
    [`backgroundColor-indicator-active-${ze}`]: "$color-primary",
    [`color-indicator-${ze}`]: "$color-primary",
    [`color-indicator-active-${ze}`]: "$color-primary",
    [`backgroundColor-indicator-hover-${ze}`]: "$color-surface-200",
    [`color-indicator-hover-${ze}`]: "$color-primary",
    [`width-indicator-${ze}`]: "25px",
    [`height-indicator-${ze}`]: "6px",
    [`height-control-${ze}`]: "36px",
    [`width-control-${ze}`]: "36px",
    [`borderRadius-control-${ze}`]: "50%",
    [`height-${ze}`]: "100%",
    [`width-${ze}`]: "100%"
  }
}), tC = "ToneChangerButton", oC = C({
  status: "experimental",
  description: `The \`${tC}\` component is a component that allows the user to change the tone of the app.`,
  props: {}
}), aC = "Option", iC = C({
  description: `\`${aC}\` is a non-visual component describing a selection option. Other components (such as \`Select\`, \`AutoComplete\`, and others) may use nested \`Option\` instances from which the user can select.`,
  props: {
    label: u(
      "This property defines the text to display for the option. If `label` is not defined, `Option` will use the `value` as the label."
    ),
    value: u(
      "This property defines the value of the option. If `value` is not defined, `Option` will use the `label` as the value."
    ),
    enabled: Qe(),
    optionTemplate: u("This property is used to define a custom option template")
  }
}), nC = $n((e) => {
  const r = Yb();
  return r ? /* @__PURE__ */ p(r, { ...e }) : null;
});
nC.displayName = "OptionNative";
const De = "AutoComplete", lC = C({
  description: "This component is a dropdown with a list of options. According to the `multi` property, the user can select one or more items.",
  status: "experimental",
  props: {
    placeholder: Vt(),
    initialValue: Cr(),
    maxLength: _o(),
    autoFocus: rr(),
    required: Ar(),
    readOnly: Lr(),
    enabled: Qe(),
    validationStatus: _r(),
    dropdownHeight: u("This property sets the height of the dropdown list."),
    multi: Un(),
    optionTemplate: Re(
      "This property enables the customization of list items. To access the attributes of a list item use the `$item` context variable."
    ),
    emptyListTemplate: u(
      "This property defines the template to display when the list of options is empty."
    )
  },
  events: {
    gotFocus: Tr(De),
    lostFocus: yr(De),
    didChange: er(De)
  },
  apis: {
    focus: et(De),
    value: u(
      "You can query the component's value. If no value is set, it will retrieve `undefined`."
    ),
    setValue: Kr()
  },
  contextVars: {
    $item: u(
      "This context value represents an item when you define an option item template. Use `$item.value` and `$item.label` to refer to the value and label of the particular option."
    )
  },
  themeVars: Z(Je.themeVars),
  defaultThemeVars: {
    [`backgroundColor-menu-${De}`]: "$backgroundColor-primary",
    [`boxShadow-menu-${De}`]: "$boxShadow-md",
    [`borderRadius-menu-${De}`]: "$borderRadius",
    [`backgroundColor-item-${De}`]: "$backgroundColor-dropdown-item",
    [`backgroundColor-item-${De}--hover`]: "$backgroundColor-dropdown-item--active",
    [`backgroundColor-item-${De}--active`]: "$backgroundColor-dropdown-item--active",
    "minHeight-Input": "39px",
    [`backgroundColor-${De}-badge`]: "$color-primary-500",
    [`fontSize-${De}-badge`]: "$fontSize-small",
    [`paddingHorizontal-${De}-badge`]: "$space-1",
    [`paddingVertical-${De}-badge`]: "$space-1",
    light: {
      [`backgroundColor-${De}-badge--hover`]: "$color-primary-400",
      [`backgroundColor-${De}-badge--active`]: "$color-primary-500",
      [`color-item-${De}--disabled`]: "$color-surface-200",
      [`color-${De}-badge`]: "$color-surface-50"
    },
    dark: {
      [`backgroundColor-${De}-badge--hover`]: "$color-primary-600",
      [`backgroundColor-${De}-badge--active`]: "$color-primary-500",
      [`color-${De}-badge`]: "$color-surface-50",
      [`color-item-${De}--disabled`]: "$color-surface-800"
    }
  }
}), dC = '"[]"', sC = "_backdropContainer_18iuc_13", uC = "_backdrop_18iuc_13", cC = "_overlay_18iuc_26", Zo = {
  themeVars: dC,
  backdropContainer: sC,
  backdrop: uC,
  overlay: cC
}, Ya = {
  backgroundColor: "black",
  opacity: "0.1"
};
xe(function({
  style: r,
  children: t,
  overlayTemplate: o,
  backgroundColor: a = Ya.backgroundColor,
  opacity: n = Ya.opacity
}, i) {
  const l = { ...r, width: void 0 };
  return /* @__PURE__ */ j(
    "div",
    {
      className: Zo.backdropContainer,
      style: { width: r.width ?? "fit-content" },
      ref: i,
      children: [
        t,
        /* @__PURE__ */ p("div", { className: Zo.backdrop, style: { ...l, backgroundColor: a, opacity: n } }),
        o && /* @__PURE__ */ p("div", { className: Zo.overlay, children: o })
      ]
    }
  );
});
const mC = "Backdrop", pC = C({
  status: "stable",
  description: `The \`${mC}\` component is a semi-transparent overlay that appears on top of its child component to obscure or highlight the content behind it.`,
  props: {
    overlayTemplate: Re(
      "This property defines the component template for an optional overlay to display over the component."
    ),
    backgroundColor: {
      description: "The background color of the backdrop.",
      valueType: "string",
      defaultValue: Ya.backgroundColor
    },
    opacity: {
      description: "The opacity of the backdrop.",
      valueType: "number",
      defaultValue: 0.1
    }
  },
  themeVars: Z(Zo.themeVars)
}), hC = C({
  status: "experimental",
  description: "This component renders an HTML `a` tag.",
  isHtmlTag: !0,
  props: {
    href: u("Specifies the URL of the page the link goes to"),
    target: u("Specifies where to open the linked document"),
    rel: u("Specifies the relationship between the current document and the linked document"),
    download: u("Indicates that the target will be downloaded when a user clicks on the hyperlink"),
    hreflang: u("Specifies the language of the linked document"),
    type: u("Specifies the MIME type of the linked document"),
    ping: u(
      "Specifies a space-separated list of URLs to be notified if the user follows the hyperlink"
    ),
    referrerPolicy: u("Specifies the referrer policy for the element"),
    disabled: u("Specifies that the link should be disabled")
  }
}), xC = C({
  status: "experimental",
  description: "This component renders an HTML `address` tag.",
  isHtmlTag: !0
}), bC = C({
  status: "experimental",
  description: "This component renders an HTML `area` tag.",
  isHtmlTag: !0,
  props: {
    alt: u("Specifies an alternate text for the area"),
    coords: u("Specifies the coordinates of the area"),
    download: u("Indicates that the target will be downloaded when a user clicks on the area"),
    href: u("Specifies the URL of the linked document"),
    hrefLang: u("Specifies the language of the linked document"),
    referrerPolicy: u("Specifies the referrer policy for the area"),
    rel: u("Specifies the relationship between the current document and the linked document"),
    shape: u("Specifies the shape of the area"),
    target: u("Specifies where to open the linked document"),
    media: u("Specifies a media query for the linked resource")
  }
}), fC = C({
  status: "experimental",
  description: "This component renders an HTML `article` tag.",
  isHtmlTag: !0
}), vC = C({
  status: "experimental",
  description: "This component renders an HTML `aside` tag.",
  isHtmlTag: !0
}), gC = C({
  status: "experimental",
  description: "This component renders an HTML `audio` tag.",
  isHtmlTag: !0,
  props: {
    autoPlay: u("Specifies that the audio will start playing as soon as it is ready"),
    controls: u("Specifies that audio controls should be displayed"),
    crossOrigin: u("Specifies how the element handles cross-origin requests"),
    loop: u("Specifies that the audio will start over again every time it is finished"),
    muted: u("Specifies that the audio output should be muted"),
    preload: u(
      "Specifies if and how the author thinks the audio should be loaded when the page loads"
    ),
    src: u("Specifies the URL of the audio file")
  }
}), TC = C({
  status: "experimental",
  description: "This component renders an HTML `b` tag.",
  isHtmlTag: !0
}), yC = C({
  status: "experimental",
  description: "This component renders an HTML `bdi` tag.",
  isHtmlTag: !0
}), CC = C({
  status: "experimental",
  description: "This component renders an HTML `bdo` tag.",
  isHtmlTag: !0,
  props: {
    dir: u("Specifies the text direction override")
  }
}), kC = C({
  status: "experimental",
  description: "This component renders an HTML `blockquote` tag.",
  isHtmlTag: !0,
  props: {
    cite: u("Specifies the source of the quotation")
  }
}), SC = C({
  status: "experimental",
  description: "This component renders an HTML `br` tag.",
  isHtmlTag: !0
}), wC = C({
  status: "experimental",
  description: "This component renders an HTML `button` tag.",
  isHtmlTag: !0,
  props: {
    autoFocus: u("Specifies that the button should automatically get focus when the page loads"),
    disabled: u("Specifies that the button should be disabled"),
    form: u("Specifies the form the button belongs to"),
    formAction: u(
      "Specifies the URL of a file that processes the information submitted by the button"
    ),
    formEncType: u(
      "Specifies how the form-data should be encoded when submitting it to the server"
    ),
    formMethod: u("Specifies the HTTP method to use when sending form-data"),
    formNoValidate: u("Specifies that the form should not be validated when submitted"),
    formTarget: u("Specifies where to display the response after submitting the form"),
    name: u("Specifies a name for the button"),
    type: u("Specifies the type of the button"),
    value: u("Specifies the value associated with the button")
  }
}), HC = C({
  status: "experimental",
  description: "This component renders an HTML `canvas` tag.",
  isHtmlTag: !0,
  props: {
    width: u("Specifies the width of the canvas"),
    height: u("Specifies the height of the canvas")
  }
}), BC = C({
  status: "experimental",
  description: "This component renders an HTML `caption` tag.",
  isHtmlTag: !0
}), IC = C({
  status: "experimental",
  description: "This component renders an HTML `cite` tag.",
  isHtmlTag: !0
}), wn = C({
  status: "experimental",
  description: "This component renders an HTML `code` tag.",
  isHtmlTag: !0
}), $C = C({
  status: "experimental",
  description: "This component renders an HTML `col` tag.",
  isHtmlTag: !0,
  props: {
    span: u("Specifies the number of columns a `col` element should span")
  }
}), LC = C({
  status: "experimental",
  description: "This component renders an HTML `colgroup` tag.",
  isHtmlTag: !0,
  props: {
    span: u("Specifies the number of columns in a `colgroup`")
  }
}), _C = C({
  status: "experimental",
  description: "This component renders an HTML `data` tag.",
  isHtmlTag: !0,
  props: {
    value: u("Specifies the machine-readable value of the element")
  }
}), AC = C({
  status: "experimental",
  description: "This component renders an HTML `datalist` tag.",
  isHtmlTag: !0
}), NC = C({
  status: "experimental",
  description: "This component renders an HTML `dd` tag.",
  isHtmlTag: !0
}), WC = C({
  status: "experimental",
  description: "This component renders an HTML `del` tag.",
  isHtmlTag: !0,
  props: {
    cite: u("Specifies the source of the quotation"),
    dateTime: u("Specifies the date and time of the edit")
  }
}), OC = C({
  status: "experimental",
  description: "This component renders an HTML `details` tag.",
  isHtmlTag: !0,
  props: {
    open: u("Specifies that the details are visible (open)")
  }
}), RC = C({
  status: "experimental",
  description: "This component renders an HTML `dfn` tag.",
  isHtmlTag: !0
}), zC = C({
  status: "experimental",
  description: "This component renders an HTML `dialog` tag.",
  isHtmlTag: !0,
  props: {
    open: u("Specifies that the dialog is open")
  }
}), VC = C({
  status: "experimental",
  description: "This component renders an HTML `div` tag.",
  isHtmlTag: !0
}), EC = C({
  status: "experimental",
  description: "This component renders an HTML `dl` tag.",
  isHtmlTag: !0
}), DC = C({
  status: "experimental",
  description: "This component renders an HTML `dt` tag.",
  isHtmlTag: !0
}), Hn = C({
  status: "experimental",
  description: "This component renders an HTML `em` tag.",
  isHtmlTag: !0
}), PC = C({
  status: "experimental",
  description: "This component renders an HTML `embed` tag.",
  isHtmlTag: !0,
  props: {
    src: u("Specifies the URL of the resource"),
    type: u("Specifies the type of the resource"),
    width: u("Specifies the width of the embed"),
    height: u("Specifies the height of the embed")
  }
}), MC = C({
  status: "experimental",
  description: "This component renders an HTML `fieldset` tag.",
  isHtmlTag: !0,
  props: {
    disabled: u("Specifies that the fieldset should be disabled"),
    form: u("Specifies the form the fieldset belongs to"),
    name: u("Specifies a name for the fieldset")
  }
}), FC = C({
  status: "experimental",
  description: "This component renders an HTML `figcaption` tag.",
  isHtmlTag: !0
}), qC = C({
  status: "experimental",
  description: "This component renders an HTML `figure` tag.",
  isHtmlTag: !0
}), UC = C({
  status: "experimental",
  description: "This component renders an HTML `footer` tag.",
  isHtmlTag: !0
}), GC = C({
  status: "experimental",
  description: "This component renders an HTML `form` tag.",
  isHtmlTag: !0,
  props: {
    acceptCharset: u(
      "Specifies the character encodings that are to be used for the form submission"
    ),
    action: u("Specifies where to send the form-data when a form is submitted"),
    autoComplete: u("Specifies whether a form should have auto-completion"),
    encType: u("Specifies how the form-data should be encoded when submitting it to the server"),
    method: u("Specifies the HTTP method to use when sending form-data"),
    name: u("Specifies the name of the form"),
    noValidate: u("Specifies that the form should not be validated when submitted"),
    target: u("Specifies where to display the response after submitting the form")
  }
}), YC = C({
  status: "experimental",
  description: "This component renders an HTML `h1` tag.",
  isHtmlTag: !0,
  themeVars: Z(tr.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem"
  }
}), XC = C({
  status: "experimental",
  description: "This component renders an HTML `h2` tag.",
  isHtmlTag: !0,
  themeVars: Z(tr.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem"
  }
}), QC = C({
  status: "experimental",
  description: "This component renders an HTML `h3` tag.",
  isHtmlTag: !0,
  themeVars: Z(tr.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem"
  }
}), ZC = C({
  status: "experimental",
  description: "This component renders an HTML `h4` tag.",
  isHtmlTag: !0,
  themeVars: Z(tr.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem"
  }
}), jC = C({
  status: "experimental",
  description: "This component renders an HTML `h5` tag.",
  isHtmlTag: !0,
  themeVars: Z(tr.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem"
  }
}), JC = C({
  status: "experimental",
  description: "This component renders an HTML `h6` tag.",
  isHtmlTag: !0,
  themeVars: Z(tr.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem"
  }
}), KC = C({
  status: "experimental",
  description: "This component renders an HTML `header` tag.",
  isHtmlTag: !0
}), ek = C({
  status: "experimental",
  description: "This component renders an HTML `hr` tag.",
  isHtmlTag: !0
}), rk = C({
  status: "experimental",
  description: "This component renders an HTML `i` tag.",
  isHtmlTag: !0
}), tk = C({
  status: "experimental",
  description: "This component renders an HTML `iframe` tag.",
  isHtmlTag: !0,
  props: {
    src: u("Specifies the URL of the page to embed"),
    srcDoc: u("Specifies the HTML content of the page to embed"),
    name: u("Specifies the name of the iframe"),
    sandbox: u("Specifies a set of extra restrictions for the content in the iframe"),
    allow: u("Specifies a feature policy for the iframe"),
    allowFullScreen: u("Specifies that the iframe can be displayed in full-screen mode"),
    width: u("Specifies the width of the iframe"),
    height: u("Specifies the height of the iframe"),
    loading: u("Specifies the loading behavior of the iframe"),
    referrerPolicy: u("Specifies the referrer policy for the iframe")
  }
}), ok = C({
  status: "experimental",
  description: "This component renders an HTML `img` tag.",
  isHtmlTag: !0,
  props: {
    alt: u("Specifies an alternate text for an image"),
    height: u("Specifies the height of an image"),
    src: u("Specifies the path to the image"),
    width: u("Specifies the width of an image"),
    useMap: u("Specifies an image as a client-side image map"),
    loading: u("Specifies the loading behavior of the image"),
    referrerPolicy: u("Specifies the referrer policy for the image"),
    sizes: u("Specifies image sizes for different page layouts")
  }
}), ak = C({
  status: "experimental",
  description: "This component renders an HTML `input` tag.",
  isHtmlTag: !0,
  props: {
    type: u("Specifies the type of input"),
    value: u("Specifies the value of the input"),
    placeholder: u("Specifies a short hint that describes the expected value of the input"),
    autoFocus: u("Specifies that the input should automatically get focus when the page loads"),
    checked: u("Specifies that the input should be pre-selected"),
    disabled: u("Specifies that the input should be disabled"),
    form: u("Specifies the form the input belongs to"),
    name: u("Specifies the name of the input"),
    list: u(
      "Specifies the id of a datalist element that contains pre-defined options for the input"
    ),
    max: u("Specifies the maximum value for an input"),
    maxLength: u("Specifies the maximum number of characters allowed in an input"),
    min: u("Specifies the minimum value for an input"),
    minLength: u("Specifies the minimum number of characters allowed in an input"),
    multiple: u("Specifies that a user can enter more than one value"),
    pattern: u("Specifies a regular expression that an input's value is checked against"),
    readOnly: u("Specifies that the input is read-only"),
    required: u("Specifies that the input is required"),
    size: u("Specifies the width, in characters, of an input"),
    step: u("Specifies the legal number intervals for an input")
  }
}), ik = C({
  status: "experimental",
  description: "This component renders an HTML `ins` tag.",
  isHtmlTag: !0,
  props: {
    cite: u("Specifies the source URL for the inserted text"),
    dateTime: u("Specifies the date and time when the text was inserted")
  }
}), nk = C({
  status: "experimental",
  description: "This component renders an HTML `kbd` tag.",
  isHtmlTag: !0
}), lk = C({
  status: "experimental",
  description: "This component renders an HTML `label` tag.",
  isHtmlTag: !0,
  props: {
    htmlFor: u("Specifies which form element a label is bound to")
  }
}), dk = C({
  status: "experimental",
  description: "This component renders an HTML `legend` tag.",
  isHtmlTag: !0
}), sk = C({
  status: "experimental",
  description: "This component renders an HTML `li` tag.",
  isHtmlTag: !0,
  props: {
    value: u("Specifies the value of the list item (if the parent is an ordered list)")
  }
}), uk = C({
  status: "experimental",
  description: "This component renders an HTML `main` tag.",
  isHtmlTag: !0
}), ck = C({
  status: "experimental",
  description: "This component renders an HTML `map` tag.",
  isHtmlTag: !0,
  props: {
    name: u("Specifies the name of the map")
  }
}), mk = C({
  status: "experimental",
  description: "This component renders an HTML `mark` tag.",
  isHtmlTag: !0
}), pk = C({
  status: "experimental",
  description: "This component renders an HTML `menu` tag.",
  isHtmlTag: !0,
  props: {
    type: u("Specifies the type of the menu")
  }
}), hk = C({
  status: "experimental",
  description: "This component renders an HTML `meter` tag.",
  isHtmlTag: !0,
  props: {
    min: u("Specifies the minimum value"),
    max: u("Specifies the maximum value"),
    low: u("Specifies the lower bound of the high value"),
    high: u("Specifies the upper bound of the low value"),
    optimum: u("Specifies the optimal value"),
    value: u("Specifies the current value")
  }
}), xk = C({
  status: "experimental",
  description: "This component renders an HTML `nav` tag.",
  isHtmlTag: !0
}), bk = C({
  status: "experimental",
  description: "This component renders an HTML `object` tag.",
  isHtmlTag: !0,
  props: {
    data: u("Specifies the URL of the resource"),
    type: u("Specifies the MIME type of the resource"),
    name: u("Specifies the name of the object"),
    form: u("Specifies the form the object belongs to"),
    width: u("Specifies the width of the object"),
    height: u("Specifies the height of the object")
  }
}), fk = C({
  status: "experimental",
  description: "This component renders an HTML `ol` tag.",
  isHtmlTag: !0,
  themeVars: Z(tr.themeVarsList),
  // Use only themeVarsList
  defaultThemeVars: {
    "marginTop-HtmlOl": "$space-4",
    "marginBottom-HtmlOl": "$space-4"
  }
}), vk = C({
  status: "experimental",
  description: "This component renders an HTML `optgroup` tag.",
  isHtmlTag: !0,
  props: {
    label: u("Specifies the label for the option group"),
    disabled: u("Specifies that the option group is disabled")
  }
}), gk = C({
  status: "experimental",
  description: "This component renders an HTML `option` tag.",
  isHtmlTag: !0,
  props: {
    disabled: u("Specifies that the option should be disabled"),
    label: u("Specifies the label of the option"),
    selected: u("Specifies that the option should be pre-selected"),
    value: u("Specifies the value of the option")
  }
}), Tk = C({
  status: "experimental",
  description: "This component renders an HTML `output` tag.",
  isHtmlTag: !0,
  props: {
    form: u("Specifies the form element that the output is associated with"),
    htmlFor: u("Specifies the IDs of the elements that this output is related to"),
    name: u("Specifies the name of the output")
  }
}), yk = C({
  status: "experimental",
  description: "This component renders an HTML `p` tag.",
  isHtmlTag: !0
}), Ck = C({
  status: "experimental",
  description: "This component renders an HTML `param` tag.",
  isHtmlTag: !0,
  props: {
    name: u("Specifies the name of the parameter"),
    value: u("Specifies the value of the parameter")
  }
}), kk = C({
  status: "experimental",
  description: "This component renders an HTML `picture` tag.",
  isHtmlTag: !0
}), Sk = C({
  status: "experimental",
  description: "This component renders an HTML `pre` tag.",
  isHtmlTag: !0
}), wk = C({
  status: "experimental",
  description: "This component renders an HTML `progress` tag.",
  isHtmlTag: !0,
  props: {
    max: u("Specifies the maximum value of the progress element"),
    value: u("Specifies the current value of the progress element")
  }
}), Hk = C({
  status: "experimental",
  description: "This component renders an HTML `q` tag.",
  isHtmlTag: !0,
  props: {
    cite: u("Specifies the source URL of the quotation")
  }
}), Bk = C({
  status: "experimental",
  description: "This component renders an HTML `rp` tag.",
  isHtmlTag: !0
}), Ik = C({
  status: "experimental",
  description: "This component renders an HTML `rt` tag.",
  isHtmlTag: !0
}), $k = C({
  status: "experimental",
  description: "This component renders an HTML `ruby` tag.",
  isHtmlTag: !0
}), Lk = C({
  status: "experimental",
  description: "This component renders an HTML `s` tag.",
  isHtmlTag: !0
}), _k = C({
  status: "experimental",
  description: "This component renders an HTML `samp` tag.",
  isHtmlTag: !0
}), Ak = C({
  status: "experimental",
  description: "This component renders an HTML `section` tag.",
  isHtmlTag: !0
}), Nk = C({
  status: "experimental",
  description: "This component renders an HTML `select` tag.",
  isHtmlTag: !0,
  props: {
    autoFocus: u("Specifies that the select should automatically get focus when the page loads"),
    disabled: u("Specifies that the select should be disabled"),
    form: u("Specifies the form the select belongs to"),
    multiple: u("Specifies that multiple options can be selected at once"),
    name: u("Specifies the name of the select"),
    required: u("Specifies that the select is required"),
    size: u("Specifies the number of visible options in the select")
  }
}), Wk = C({
  status: "experimental",
  description: "This component renders an HTML `small` tag.",
  isHtmlTag: !0
}), Ok = C({
  status: "experimental",
  description: "This component renders an HTML `source` tag.",
  isHtmlTag: !0,
  props: {
    src: u("Specifies the URL of the media file"),
    type: u("Specifies the type of the media file"),
    media: u("Specifies a media query for the media file"),
    srcSet: u("Specifies the source set for responsive images"),
    sizes: u("Specifies the sizes attribute for responsive images")
  }
}), Rk = C({
  status: "experimental",
  description: "This component renders an HTML `span` tag.",
  isHtmlTag: !0
}), zk = C({
  status: "experimental",
  description: "This component renders an HTML `strong` tag.",
  isHtmlTag: !0
}), Vk = C({
  status: "experimental",
  description: "This component renders an HTML `sub` tag.",
  isHtmlTag: !0
}), Ek = C({
  status: "experimental",
  description: "This component renders an HTML `summary` tag.",
  isHtmlTag: !0
}), Dk = C({
  status: "experimental",
  description: "This component renders an HTML `sup` tag.",
  isHtmlTag: !0
}), Pk = C({
  status: "experimental",
  description: "This component renders an HTML `table` tag.",
  isHtmlTag: !0,
  props: {
    border: u("Specifies the width of the border around the table"),
    cellPadding: u("Specifies the space between the cell content and its borders"),
    cellSpacing: u("Specifies the space between cells"),
    summary: u("Provides a summary of the table's purpose and structure"),
    width: u("Specifies the width of the table"),
    align: u("Specifies the alignment of the table"),
    frame: u("Specifies which parts of the table frame to render"),
    rules: u("Specifies which rules to draw between cells")
  },
  themeVars: Z(tr.themeVarsTable),
  defaultThemeVars: {
    "backgroundColor-HtmlTable": "$backgroundColor",
    "border-HtmlTable": "1px solid $borderColor",
    "marginBottom-HtmlTable": "$space-4",
    "marginTop-HtmlTable": "$space-4"
  }
}), Mk = C({
  status: "experimental",
  description: "This component renders an HTML `tbody` tag.",
  isHtmlTag: !0,
  themeVars: Z(tr.themeVarsTbody)
}), Fk = C({
  status: "experimental",
  description: "This component renders an HTML `td` tag.",
  isHtmlTag: !0,
  props: {
    align: u("Specifies the horizontal alignment of the content in the cell"),
    colSpan: u("Specifies the number of columns a cell should span"),
    headers: u("Specifies a list of header cells the current cell is related to"),
    rowSpan: u("Specifies the number of rows a cell should span"),
    valign: u("Specifies the vertical alignment of the content in the cell"),
    scope: u("Specifies whether a cell is a header for a column, row, or group of columns or rows"),
    abbr: u("Specifies an abbreviated version of the content in the cell"),
    height: u("Specifies the height of the cell"),
    width: u("Specifies the width of the cell")
  },
  themeVars: Z(tr.themeVarsTd),
  defaultThemeVars: {
    "padding-HtmlTd": "$space-2",
    "borderBottom-HtmlTd": "1px solid $borderColor"
  }
}), qk = C({
  status: "experimental",
  description: "This component renders an HTML `template` tag.",
  isHtmlTag: !0
}), Uk = C({
  status: "experimental",
  description: "This component renders an HTML `textarea` tag.",
  isHtmlTag: !0,
  props: {
    autoFocus: u("Specifies that the textarea should automatically get focus when the page loads"),
    cols: u("Specifies the visible width of the text area in average character widths"),
    dirName: u("Specifies the text directionality"),
    disabled: u("Specifies that the textarea should be disabled"),
    form: u("Specifies the form the textarea belongs to"),
    maxLength: u("Specifies the maximum number of characters allowed in the textarea"),
    minLength: u("Specifies the minimum number of characters allowed in the textarea"),
    name: u("Specifies the name of the textarea"),
    placeholder: u("Specifies a short hint that describes the expected value"),
    readOnly: u("Specifies that the textarea is read-only"),
    required: u("Specifies that the textarea is required"),
    rows: u("Specifies the visible number of lines in the textarea"),
    value: u("Specifies the current value of the textarea"),
    wrap: u("Specifies how the text in a textarea is to be wrapped when submitted")
  }
}), Gk = C({
  status: "experimental",
  description: "This component renders an HTML `tfoot` tag.",
  isHtmlTag: !0,
  themeVars: Z(tr.themeVarsTfoot)
}), Yk = C({
  status: "experimental",
  description: "This component renders an HTML `th` tag.",
  isHtmlTag: !0,
  props: {
    abbr: u("Specifies an abbreviated version of the content in the header cell"),
    align: u("Specifies the horizontal alignment of the content in the header cell"),
    colSpan: u("Specifies the number of columns a header cell should span"),
    headers: u("Specifies a list of header cells the current header cell is related to"),
    rowSpan: u("Specifies the number of rows a header cell should span"),
    scope: u(
      "Specifies whether a header cell is a header for a column, row, or group of columns or rows"
    )
  },
  themeVars: Z(tr.themeVarsTh),
  defaultThemeVars: {
    "padding-HtmlTh": "$space-2",
    "fontSize-HtmlTh": "$fontSize-tiny",
    "fontWeight-HtmlTh": "$fontWeight-bold",
    light: {
      "backgroundColor-HtmlTh--hover": "$color-surface-200"
    },
    dark: {
      "backgroundColor-HtmlTh--hover": "$color-surface-800"
    }
  }
}), Xk = C({
  status: "experimental",
  description: "This component renders an HTML `thead` tag.",
  isHtmlTag: !0,
  themeVars: Z(tr.themeVarsThead),
  defaultThemeVars: {
    "textTransform-HtmlThead": "uppercase",
    light: {
      "backgroundColor-HtmlThead": "$color-surface-100",
      "color-HtmlThead": "$color-surface-500"
    },
    dark: {
      "backgroundColor-HtmlThead": "$color-surface-950"
    }
  }
}), Qk = C({
  status: "experimental",
  description: "This component renders an HTML `time` tag.",
  isHtmlTag: !0,
  props: {
    dateTime: u("Specifies the date and time in a machine-readable format")
  }
}), Zk = C({
  status: "experimental",
  description: "This component renders an HTML `tr` tag.",
  isHtmlTag: !0,
  themeVars: Z(tr.themeVarsTr),
  defaultThemeVars: {
    "fontSize-HtmlTr": "$fontSize-small",
    "backgroundColor-row-HtmlTr": "inherit",
    light: {
      "backgroundColor-HtmlTr--hover": "$color-primary-50"
    },
    dark: {
      "backgroundColor-HtmlTr--hover": "$color-primary-900"
    }
  }
}), jk = C({
  status: "experimental",
  description: "This component renders an HTML `track` tag.",
  isHtmlTag: !0,
  props: {
    default: u("Specifies that the track is to be enabled if no other track is more suitable"),
    kind: u("Specifies the kind of text track"),
    label: u("Specifies the title of the text track"),
    src: u("Specifies the URL of the track file"),
    srcLang: u("Specifies the language of the track text data")
  }
}), Jk = C({
  status: "experimental",
  description: "This component renders an HTML `u` tag.",
  isHtmlTag: !0
}), Kk = C({
  status: "experimental",
  description: "This component renders an HTML `ul` tag.",
  isHtmlTag: !0,
  themeVars: Z(tr.themeVarsList),
  // Use only themeVarsList
  defaultThemeVars: {
    "marginTop-HtmlUl": "$space-4",
    "marginBottom-HtmlUl": "$space-4"
  }
}), eS = C({
  status: "experimental",
  description: "This component renders an HTML `var` tag.",
  isHtmlTag: !0
}), rS = C({
  status: "experimental",
  description: "This component renders an HTML `video` tag.",
  isHtmlTag: !0,
  props: {
    autoPlay: u("Specifies that the video will start playing as soon as it is ready"),
    controls: u("Specifies that video controls should be displayed"),
    height: u("Specifies the height of the video player"),
    loop: u("Specifies that the video will start over again when finished"),
    muted: u("Specifies that the video output should be muted"),
    poster: u("Specifies an image to be shown while the video is downloading"),
    preload: u(
      "Specifies if and how the author thinks the video should be loaded when the page loads"
    ),
    src: u("Specifies the URL of the video file"),
    width: u("Specifies the width of the video player")
  }
}), tS = C({
  status: "experimental",
  description: "This component renders an HTML `wbr` tag.",
  isHtmlTag: !0
}), Ye = "Slider", oS = C({
  status: "experimental",
  description: `The \`${Ye}\` component allows you to select a numeric value between a range specified by minimum and maximum values.`,
  props: {
    initialValue: Cr(),
    label: Fe(),
    labelPosition: Dr("top"),
    labelWidth: jr(Ye),
    labelBreak: Jr(Ye),
    minValue: u(
      "This property specifies the minimum value of the allowed input range.",
      null,
      "number",
      0
    ),
    maxValue: u(
      "This property specifies the maximum value of the allowed input range.",
      null,
      "number",
      10
    ),
    step: u(
      "This property defines the increment value for the slider, determining the allowed intervals between selectable values."
    ),
    minStepsBetweenThumbs: u(
      "This property sets the minimum number of steps required between multiple thumbs on the slider, ensuring they maintain a specified distance."
    ),
    enabled: Qe(),
    autoFocus: rr(),
    required: Ar(),
    readOnly: Lr(),
    validationStatus: _r(),
    rangeStyle: u("This property allows you to apply custom styles to the range element of the slider."),
    thumbStyle: u("This property allows yout top apply custom styles to the thumb elements of the slider.")
  },
  events: {
    didChange: er(Ye),
    gotFocus: Tr(Ye),
    lostFocus: yr(Ye)
  },
  apis: {
    focus: et(Ye),
    value: ia(),
    setValue: Kr()
  },
  themeVars: Z(qr.themeVars),
  defaultThemeVars: {
    [`backgroundColor-track-${Ye}`]: "$color-surface-200",
    [`backgroundColor-range-${Ye}`]: "$color-primary",
    [`borderWidth-thumb-${Ye}`]: "2px",
    [`borderStyle-thumb-${Ye}`]: "solid",
    [`borderColor-thumb-${Ye}`]: "$color-surface-50",
    [`backgroundColor-thumb-${Ye}`]: "$color-primary",
    [`boxShadow-thumb-${Ye}`]: "$boxShadow-md",
    light: {
      [`backgroundColor-track-${Ye}--disabled`]: "$color-surface-300",
      [`backgroundColor-range-${Ye}--disabled`]: "$color-surface-400"
    },
    dark: {
      [`backgroundColor-track-${Ye}--disabled`]: "$color-surface-600",
      [`backgroundColor-range-${Ye}--disabled`]: "$color-surface-800"
    }
  }
}), Jt = "ColorPicker", aS = C({
  description: "This component allows the user to select a color with the browser's default color picker control.",
  props: {
    initialValue: Cr(),
    label: Fe(),
    labelPosition: Dr(),
    labelWidth: jr(Jt),
    labelBreak: Jr(Jt),
    enabled: Qe(),
    autoFocus: rr(),
    required: Ar(),
    readOnly: Lr(),
    validationStatus: _r(wo.validationStatus)
  },
  events: {
    didChange: er(Jt),
    gotFocus: Tr(Jt),
    lostFocus: yr(Jt)
  },
  apis: {
    focus: et(Jt),
    value: ia(),
    setValue: Kr()
  },
  themeVars: Z(to.themeVars)
}), SS = {
  // --- HTML tags
  a: hC,
  address: xC,
  area: bC,
  article: fC,
  aside: vC,
  audio: gC,
  b: TC,
  bdi: yC,
  bdo: CC,
  blockquote: kC,
  br: SC,
  button: wC,
  canvas: HC,
  caption: BC,
  cite: IC,
  code: wn,
  col: $C,
  colgroup: LC,
  data: _C,
  datalist: AC,
  dd: NC,
  del: WC,
  details: OC,
  dfn: RC,
  dialog: zC,
  div: VC,
  dl: EC,
  dt: DC,
  em: Hn,
  embed: PC,
  fieldset: MC,
  figcaption: FC,
  figure: qC,
  footer: UC,
  form: GC,
  h1: YC,
  h2: XC,
  h3: QC,
  h4: ZC,
  h5: jC,
  h6: JC,
  header: KC,
  hr: ek,
  i: rk,
  iframe: tk,
  img: ok,
  input: ak,
  ins: ik,
  kbd: nk,
  label: lk,
  legend: dk,
  li: sk,
  main: uk,
  map: ck,
  mark: mk,
  menu: pk,
  meter: hk,
  nav: xk,
  object: bk,
  ol: fk,
  optgroup: vk,
  option: gk,
  output: Tk,
  p: yk,
  param: Ck,
  picture: kk,
  pre: Sk,
  progress: wk,
  q: Hk,
  rp: Bk,
  rt: Ik,
  ruby: $k,
  s: Lk,
  samp: _k,
  section: Ak,
  select: Nk,
  small: Wk,
  source: Ok,
  span: Rk,
  strong: zk,
  sub: Vk,
  summary: Ek,
  sup: Dk,
  table: Pk,
  tbody: Mk,
  td: Fk,
  template: qk,
  textarea: Uk,
  tfoot: Gk,
  th: Yk,
  thead: Xk,
  time: Qk,
  tr: Zk,
  track: jk,
  u: Jk,
  ul: Kk,
  var: eS,
  video: rS,
  wbr: tS,
  // --- Heavy xmlui components
  Accordion: MT,
  Alert: UT,
  APICall: jT,
  App: Ic,
  AppHeader: $c,
  AppState: Lc,
  AutoComplete: lC,
  Avatar: Ec,
  Backdrop: pC,
  Badge: Uc,
  Bookmark: Yc,
  Breakout: My,
  Button: Ds,
  ButtonGroup: Dy,
  Card: fm,
  Carousel: rC,
  ChangeListener: gm,
  Checkbox: Im,
  CODE: wn,
  ColorPicker: aS,
  Column: $T,
  ContentSeparator: Am,
  DataSource: JT,
  DatePicker: Lp,
  DropdownMenu: Rp,
  EM: Hn,
  Fragment: XT,
  MenuItem: zp,
  SubMenuItem: Ep,
  EmojiSelector: Mp,
  FileInput: Jp,
  FileUploadDropZone: th,
  FlowLayout: vh,
  Footer: yh,
  Form: Bx,
  FormItem: fv,
  FormSection: Oy,
  Heading: Tv,
  H1: yv,
  H2: Cv,
  H3: kv,
  H4: Sv,
  H5: wv,
  H6: Hv,
  HoverCard: Bv,
  Icon: Iv,
  Image: $v,
  Items: _v,
  Link: Av,
  List: Ov,
  Logo: zv,
  Markdown: Zv,
  MenuSeparator: Dp,
  ModalDialog: jv,
  NavGroup: eg,
  NavLink: rg,
  NavPanel: tg,
  NoResult: ig,
  NumberBox: ng,
  OffCanvas: sg,
  Option: iC,
  PageMetaTitle: ug,
  Page: cg,
  Pages: pg,
  PositionedContainer: bg,
  ProgressBar: gg,
  Queue: Tg,
  RadioGroup: yg,
  RealTimeAdapter: kg,
  Redirect: wg,
  Select: Hg,
  SelectionStore: _g,
  Slider: oS,
  SpaceFiller: Ng,
  Spinner: Wg,
  Splitter: zg,
  HSplitter: Vg,
  VSplitter: Eg,
  Stack: No,
  CHStack: du,
  CVStack: lu,
  HStack: nu,
  VStack: iu,
  StickyBox: Mg,
  Switch: Fg,
  Table: BT,
  TableOfContents: AT,
  TabItem: GT,
  Tabs: OT,
  Text: RT,
  TextArea: VT,
  TextBox: ol,
  PasswordInput: mc,
  Theme: hc,
  ToneChangerButton: oC,
  Tree: ZT
};
export {
  SS as collectedComponentMetadata
};

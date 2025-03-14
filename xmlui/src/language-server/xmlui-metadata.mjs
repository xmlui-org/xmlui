import { jsx as m, jsxs as J, Fragment as Tt } from "react/jsx-runtime";
import * as Pe from "react";
import Ne, { useRef as he, useInsertionEffect as Ql, useCallback as X, useContext as Lt, useEffect as ee, useLayoutEffect as Io, useState as me, forwardRef as ve, useMemo as ce, useId as po, createContext as Qt, useDeferredValue as Zl, useImperativeHandle as Jl, Children as Bo, isValidElement as Zo, createElement as $o, cloneElement as Bn, Fragment as In, memo as $n } from "react";
import { throttle as Kl, omitBy as ed, isUndefined as td, isEmpty as $a, noop as La, isArray as rd, isNumber as Ln, isNil as fi, isEqual as od, union as ad, uniq as id, orderBy as nd } from "lodash-es";
import { Link as ld } from "@remix-run/react";
import { DayPicker as gi } from "react-day-picker";
import { parse as Yo, format as Hr, parseISO as dd, isValid as _n } from "date-fns";
import * as lr from "@radix-ui/react-dropdown-menu";
import { flushSync as An } from "react-dom";
import Nr from "immer";
import * as qr from "@radix-ui/react-dialog";
import { createContext as sd, useContextSelector as ud } from "use-context-selector";
import * as cd from "react-dropzone";
import * as md from "@radix-ui/react-visually-hidden";
import { Portal as Nn, Root as pd, Trigger as hd, Value as xd, Icon as bd, Content as vd, ScrollUpButton as fd, Viewport as gd, ScrollDownButton as Td, Item as yd, ItemText as Cd, ItemIndicator as kd } from "@radix-ui/react-select";
import { Popover as Wn, PopoverTrigger as On, PopoverContent as Rn, Portal as Sd } from "@radix-ui/react-popover";
import { Command as zn, CommandInput as _a, CommandList as Vn, CommandEmpty as En, CommandItem as Xa, CommandGroup as wd } from "cmdk";
import * as Aa from "@radix-ui/react-radio-group";
import Hd from "react-textarea-autosize";
import { Root as Pn, Track as Bd, Range as Id, Thumb as $d } from "@radix-ui/react-slider";
import { useReactTable as Ld, getPaginationRowModel as _d, getCoreRowModel as Ad, flexRender as Ti } from "@tanstack/react-table";
import { observeElementOffset as Nd, useVirtualizer as Wd } from "@tanstack/react-virtual";
import * as Od from "@radix-ui/react-accordion";
import { parseRegExpLiteral as yi } from "@eslint-community/regexpp";
import Rd from "embla-carousel-react";
import zd from "embla-carousel-autoplay";
const Vd = `'{"padding-Button": "var(--xmlui-padding-Button)", "paddingHorizontal-Button": "var(--xmlui-paddingHorizontal-Button, var(--xmlui-padding-Button))", "paddingVertical-Button": "var(--xmlui-paddingVertical-Button, var(--xmlui-padding-Button))", "paddingLeft-Button": "var(--xmlui-paddingLeft-Button, var(--xmlui-paddingHorizontal-Button, var(--xmlui-padding-Button)))", "paddingRight-Button": "var(--xmlui-paddingRight-Button, var(--xmlui-paddingHorizontal-Button, var(--xmlui-padding-Button)))", "paddingTop-Button": "var(--xmlui-paddingTop-Button, var(--xmlui-paddingVertical-Button, var(--xmlui-padding-Button)))", "paddingBottom-Button": "var(--xmlui-paddingBottom-Button, var(--xmlui-paddingVertical-Button, var(--xmlui-padding-Button)))", "padding-Button-xs": "var(--xmlui-padding-Button-xs)", "paddingHorizontal-Button-xs": "var(--xmlui-paddingHorizontal-Button-xs, var(--xmlui-padding-Button-xs))", "paddingVertical-Button-xs": "var(--xmlui-paddingVertical-Button-xs, var(--xmlui-padding-Button-xs))", "paddingLeft-Button-xs": "var(--xmlui-paddingLeft-Button-xs, var(--xmlui-paddingHorizontal-Button-xs, var(--xmlui-padding-Button-xs)))", "paddingRight-Button-xs": "var(--xmlui-paddingRight-Button-xs, var(--xmlui-paddingHorizontal-Button-xs, var(--xmlui-padding-Button-xs)))", "paddingTop-Button-xs": "var(--xmlui-paddingTop-Button-xs, var(--xmlui-paddingVertical-Button-xs, var(--xmlui-padding-Button-xs)))", "paddingBottom-Button-xs": "var(--xmlui-paddingBottom-Button-xs, var(--xmlui-paddingVertical-Button-xs, var(--xmlui-padding-Button-xs)))", "padding-Button-sm": "var(--xmlui-padding-Button-sm)", "paddingHorizontal-Button-sm": "var(--xmlui-paddingHorizontal-Button-sm, var(--xmlui-padding-Button-sm))", "paddingVertical-Button-sm": "var(--xmlui-paddingVertical-Button-sm, var(--xmlui-padding-Button-sm))", "paddingLeft-Button-sm": "var(--xmlui-paddingLeft-Button-sm, var(--xmlui-paddingHorizontal-Button-sm, var(--xmlui-padding-Button-sm)))", "paddingRight-Button-sm": "var(--xmlui-paddingRight-Button-sm, var(--xmlui-paddingHorizontal-Button-sm, var(--xmlui-padding-Button-sm)))", "paddingTop-Button-sm": "var(--xmlui-paddingTop-Button-sm, var(--xmlui-paddingVertical-Button-sm, var(--xmlui-padding-Button-sm)))", "paddingBottom-Button-sm": "var(--xmlui-paddingBottom-Button-sm, var(--xmlui-paddingVertical-Button-sm, var(--xmlui-padding-Button-sm)))", "padding-Button-md": "var(--xmlui-padding-Button-md)", "paddingHorizontal-Button-md": "var(--xmlui-paddingHorizontal-Button-md, var(--xmlui-padding-Button-md))", "paddingVertical-Button-md": "var(--xmlui-paddingVertical-Button-md, var(--xmlui-padding-Button-md))", "paddingLeft-Button-md": "var(--xmlui-paddingLeft-Button-md, var(--xmlui-paddingHorizontal-Button-md, var(--xmlui-padding-Button-md)))", "paddingRight-Button-md": "var(--xmlui-paddingRight-Button-md, var(--xmlui-paddingHorizontal-Button-md, var(--xmlui-padding-Button-md)))", "paddingTop-Button-md": "var(--xmlui-paddingTop-Button-md, var(--xmlui-paddingVertical-Button-md, var(--xmlui-padding-Button-md)))", "paddingBottom-Button-md": "var(--xmlui-paddingBottom-Button-md, var(--xmlui-paddingVertical-Button-md, var(--xmlui-padding-Button-md)))", "padding-Button-lg": "var(--xmlui-padding-Button-lg)", "paddingHorizontal-Button-lg": "var(--xmlui-paddingHorizontal-Button-lg, var(--xmlui-padding-Button-lg))", "paddingVertical-Button-lg": "var(--xmlui-paddingVertical-Button-lg, var(--xmlui-padding-Button-lg))", "paddingLeft-Button-lg": "var(--xmlui-paddingLeft-Button-lg, var(--xmlui-paddingHorizontal-Button-lg, var(--xmlui-padding-Button-lg)))", "paddingRight-Button-lg": "var(--xmlui-paddingRight-Button-lg, var(--xmlui-paddingHorizontal-Button-lg, var(--xmlui-padding-Button-lg)))", "paddingTop-Button-lg": "var(--xmlui-paddingTop-Button-lg, var(--xmlui-paddingVertical-Button-lg, var(--xmlui-padding-Button-lg)))", "paddingBottom-Button-lg": "var(--xmlui-paddingBottom-Button-lg, var(--xmlui-paddingVertical-Button-lg, var(--xmlui-padding-Button-lg)))", "width-Button": "var(--xmlui-width-Button)", "height-Button": "var(--xmlui-height-Button)", "fontFamily-Button-primary-solid": "var(--xmlui-fontFamily-Button-primary-solid)", "fontSize-Button-primary-solid": "var(--xmlui-fontSize-Button-primary-solid)", "fontWeight-Button-primary-solid": "var(--xmlui-fontWeight-Button-primary-solid)", "borderRadius-Button-primary-solid": "var(--xmlui-borderRadius-Button-primary-solid)", "borderWidth-Button-primary-solid": "var(--xmlui-borderWidth-Button-primary-solid)", "borderColor-Button-primary-solid": "var(--xmlui-borderColor-Button-primary-solid)", "borderStyle-Button-primary-solid": "var(--xmlui-borderStyle-Button-primary-solid)", "backgroundColor-Button-primary-solid": "var(--xmlui-backgroundColor-Button-primary-solid)", "textColor-Button-primary-solid": "var(--xmlui-textColor-Button-primary-solid)", "boxShadow-Button-primary-solid": "var(--xmlui-boxShadow-Button-primary-solid)", "outlineWidth-Button-primary-solid--focus": "var(--xmlui-outlineWidth-Button-primary-solid--focus)", "outlineColor-Button-primary-solid--focus": "var(--xmlui-outlineColor-Button-primary-solid--focus)", "outlineStyle-Button-primary-solid--focus": "var(--xmlui-outlineStyle-Button-primary-solid--focus)", "outlineOffset-Button-primary-solid--focus": "var(--xmlui-outlineOffset-Button-primary-solid--focus)", "borderColor-Button-primary-solid--hover": "var(--xmlui-borderColor-Button-primary-solid--hover)", "textColor-Button-primary-solid--hover": "var(--xmlui-textColor-Button-primary-solid--hover)", "backgroundColor-Button-primary-solid--hover": "var(--xmlui-backgroundColor-Button-primary-solid--hover)", "borderColor-Button-primary-solid--active": "var(--xmlui-borderColor-Button-primary-solid--active)", "textColor-Button-primary-solid--active": "var(--xmlui-textColor-Button-primary-solid--active)", "boxShadow-Button-primary-solid--active": "var(--xmlui-boxShadow-Button-primary-solid--active)", "backgroundColor-Button-primary-solid--active": "var(--xmlui-backgroundColor-Button-primary-solid--active)", "backgroundColor-Button--disabled": "var(--xmlui-backgroundColor-Button--disabled)", "textColor-Button--disabled": "var(--xmlui-textColor-Button--disabled)", "borderColor-Button--disabled": "var(--xmlui-borderColor-Button--disabled)", "fontFamily-Button-secondary-solid": "var(--xmlui-fontFamily-Button-secondary-solid)", "fontSize-Button-secondary-solid": "var(--xmlui-fontSize-Button-secondary-solid)", "fontWeight-Button-secondary-solid": "var(--xmlui-fontWeight-Button-secondary-solid)", "borderRadius-Button-secondary-solid": "var(--xmlui-borderRadius-Button-secondary-solid)", "borderWidth-Button-secondary-solid": "var(--xmlui-borderWidth-Button-secondary-solid)", "borderColor-Button-secondary-solid": "var(--xmlui-borderColor-Button-secondary-solid)", "borderStyle-Button-secondary-solid": "var(--xmlui-borderStyle-Button-secondary-solid)", "backgroundColor-Button-secondary-solid": "var(--xmlui-backgroundColor-Button-secondary-solid)", "textColor-Button-secondary-solid": "var(--xmlui-textColor-Button-secondary-solid)", "boxShadow-Button-secondary-solid": "var(--xmlui-boxShadow-Button-secondary-solid)", "outlineWidth-Button-secondary-solid--focus": "var(--xmlui-outlineWidth-Button-secondary-solid--focus)", "outlineColor-Button-secondary-solid--focus": "var(--xmlui-outlineColor-Button-secondary-solid--focus)", "outlineStyle-Button-secondary-solid--focus": "var(--xmlui-outlineStyle-Button-secondary-solid--focus)", "outlineOffset-Button-secondary-solid--focus": "var(--xmlui-outlineOffset-Button-secondary-solid--focus)", "borderColor-Button-secondary-solid--hover": "var(--xmlui-borderColor-Button-secondary-solid--hover)", "textColor-Button-secondary-solid--hover": "var(--xmlui-textColor-Button-secondary-solid--hover)", "backgroundColor-Button-secondary-solid--hover": "var(--xmlui-backgroundColor-Button-secondary-solid--hover)", "borderColor-Button-secondary-solid--active": "var(--xmlui-borderColor-Button-secondary-solid--active)", "textColor-Button-secondary-solid--active": "var(--xmlui-textColor-Button-secondary-solid--active)", "boxShadow-Button-secondary-solid--active": "var(--xmlui-boxShadow-Button-secondary-solid--active)", "backgroundColor-Button-secondary-solid--active": "var(--xmlui-backgroundColor-Button-secondary-solid--active)", "fontFamily-Button-attention-solid": "var(--xmlui-fontFamily-Button-attention-solid)", "fontSize-Button-attention-solid": "var(--xmlui-fontSize-Button-attention-solid)", "fontWeight-Button-attention-solid": "var(--xmlui-fontWeight-Button-attention-solid)", "borderRadius-Button-attention-solid": "var(--xmlui-borderRadius-Button-attention-solid)", "borderWidth-Button-attention-solid": "var(--xmlui-borderWidth-Button-attention-solid)", "borderColor-Button-attention-solid": "var(--xmlui-borderColor-Button-attention-solid)", "borderStyle-Button-attention-solid": "var(--xmlui-borderStyle-Button-attention-solid)", "backgroundColor-Button-attention-solid": "var(--xmlui-backgroundColor-Button-attention-solid)", "textColor-Button-attention-solid": "var(--xmlui-textColor-Button-attention-solid)", "boxShadow-Button-attention-solid": "var(--xmlui-boxShadow-Button-attention-solid)", "outlineWidth-Button-attention-solid--focus": "var(--xmlui-outlineWidth-Button-attention-solid--focus)", "outlineColor-Button-attention-solid--focus": "var(--xmlui-outlineColor-Button-attention-solid--focus)", "outlineStyle-Button-attention-solid--focus": "var(--xmlui-outlineStyle-Button-attention-solid--focus)", "outlineOffset-Button-attention-solid--focus": "var(--xmlui-outlineOffset-Button-attention-solid--focus)", "borderColor-Button-attention-solid--hover": "var(--xmlui-borderColor-Button-attention-solid--hover)", "textColor-Button-attention-solid--hover": "var(--xmlui-textColor-Button-attention-solid--hover)", "backgroundColor-Button-attention-solid--hover": "var(--xmlui-backgroundColor-Button-attention-solid--hover)", "borderColor-Button-attention-solid--active": "var(--xmlui-borderColor-Button-attention-solid--active)", "textColor-Button-attention-solid--active": "var(--xmlui-textColor-Button-attention-solid--active)", "boxShadow-Button-attention-solid--active": "var(--xmlui-boxShadow-Button-attention-solid--active)", "backgroundColor-Button-attention-solid--active": "var(--xmlui-backgroundColor-Button-attention-solid--active)", "fontFamily-Button-primary-outlined": "var(--xmlui-fontFamily-Button-primary-outlined)", "fontSize-Button-primary-outlined": "var(--xmlui-fontSize-Button-primary-outlined)", "fontWeight-Button-primary-outlined": "var(--xmlui-fontWeight-Button-primary-outlined)", "borderRadius-Button-primary-outlined": "var(--xmlui-borderRadius-Button-primary-outlined)", "borderWidth-Button-primary-outlined": "var(--xmlui-borderWidth-Button-primary-outlined)", "borderColor-Button-primary-outlined": "var(--xmlui-borderColor-Button-primary-outlined)", "borderStyle-Button-primary-outlined": "var(--xmlui-borderStyle-Button-primary-outlined)", "textColor-Button-primary-outlined": "var(--xmlui-textColor-Button-primary-outlined)", "boxShadow-Button-primary-outlined": "var(--xmlui-boxShadow-Button-primary-outlined)", "outlineWidth-Button-primary-outlined--focus": "var(--xmlui-outlineWidth-Button-primary-outlined--focus)", "outlineColor-Button-primary-outlined--focus": "var(--xmlui-outlineColor-Button-primary-outlined--focus)", "outlineStyle-Button-primary-outlined--focus": "var(--xmlui-outlineStyle-Button-primary-outlined--focus)", "outlineOffset-Button-primary-outlined--focus": "var(--xmlui-outlineOffset-Button-primary-outlined--focus)", "borderColor-Button-primary-outlined--hover": "var(--xmlui-borderColor-Button-primary-outlined--hover)", "backgroundColor-Button-primary-outlined--hover": "var(--xmlui-backgroundColor-Button-primary-outlined--hover)", "textColor-Button-primary-outlined--hover": "var(--xmlui-textColor-Button-primary-outlined--hover)", "borderColor-Button-primary-outlined--active": "var(--xmlui-borderColor-Button-primary-outlined--active)", "backgroundColor-Button-primary-outlined--active": "var(--xmlui-backgroundColor-Button-primary-outlined--active)", "textColor-Button-primary-outlined--active": "var(--xmlui-textColor-Button-primary-outlined--active)", "fontFamily-Button-secondary-outlined": "var(--xmlui-fontFamily-Button-secondary-outlined)", "fontSize-Button-secondary-outlined": "var(--xmlui-fontSize-Button-secondary-outlined)", "fontWeight-Button-secondary-outlined": "var(--xmlui-fontWeight-Button-secondary-outlined)", "borderRadius-Button-secondary-outlined": "var(--xmlui-borderRadius-Button-secondary-outlined)", "borderWidth-Button-secondary-outlined": "var(--xmlui-borderWidth-Button-secondary-outlined)", "borderColor-Button-secondary-outlined": "var(--xmlui-borderColor-Button-secondary-outlined)", "borderStyle-Button-secondary-outlined": "var(--xmlui-borderStyle-Button-secondary-outlined)", "textColor-Button-secondary-outlined": "var(--xmlui-textColor-Button-secondary-outlined)", "boxShadow-Button-secondary-outlined": "var(--xmlui-boxShadow-Button-secondary-outlined)", "outlineWidth-Button-secondary-outlined--focus": "var(--xmlui-outlineWidth-Button-secondary-outlined--focus)", "outlineColor-Button-secondary-outlined--focus": "var(--xmlui-outlineColor-Button-secondary-outlined--focus)", "outlineStyle-Button-secondary-outlined--focus": "var(--xmlui-outlineStyle-Button-secondary-outlined--focus)", "outlineOffset-Button-secondary-outlined--focus": "var(--xmlui-outlineOffset-Button-secondary-outlined--focus)", "borderColor-Button-secondary-outlined--hover": "var(--xmlui-borderColor-Button-secondary-outlined--hover)", "backgroundColor-Button-secondary-outlined--hover": "var(--xmlui-backgroundColor-Button-secondary-outlined--hover)", "textColor-Button-secondary-outlined--hover": "var(--xmlui-textColor-Button-secondary-outlined--hover)", "borderColor-Button-secondary-outlined--active": "var(--xmlui-borderColor-Button-secondary-outlined--active)", "backgroundColor-Button-secondary-outlined--active": "var(--xmlui-backgroundColor-Button-secondary-outlined--active)", "textColor-Button-secondary-outlined--active": "var(--xmlui-textColor-Button-secondary-outlined--active)", "fontFamily-Button-attention-outlined": "var(--xmlui-fontFamily-Button-attention-outlined)", "fontSize-Button-attention-outlined": "var(--xmlui-fontSize-Button-attention-outlined)", "fontWeight-Button-attention-outlined": "var(--xmlui-fontWeight-Button-attention-outlined)", "borderRadius-Button-attention-outlined": "var(--xmlui-borderRadius-Button-attention-outlined)", "borderWidth-Button-attention-outlined": "var(--xmlui-borderWidth-Button-attention-outlined)", "borderColor-Button-attention-outlined": "var(--xmlui-borderColor-Button-attention-outlined)", "borderStyle-Button-attention-outlined": "var(--xmlui-borderStyle-Button-attention-outlined)", "textColor-Button-attention-outlined": "var(--xmlui-textColor-Button-attention-outlined)", "boxShadow-Button-attention-outlined": "var(--xmlui-boxShadow-Button-attention-outlined)", "outlineWidth-Button-attention-outlined--focus": "var(--xmlui-outlineWidth-Button-attention-outlined--focus)", "outlineColor-Button-attention-outlined--focus": "var(--xmlui-outlineColor-Button-attention-outlined--focus)", "outlineStyle-Button-attention-outlined--focus": "var(--xmlui-outlineStyle-Button-attention-outlined--focus)", "outlineOffset-Button-attention-outlined--focus": "var(--xmlui-outlineOffset-Button-attention-outlined--focus)", "borderColor-Button-attention-outlined--hover": "var(--xmlui-borderColor-Button-attention-outlined--hover)", "backgroundColor-Button-attention-outlined--hover": "var(--xmlui-backgroundColor-Button-attention-outlined--hover)", "textColor-Button-attention-outlined--hover": "var(--xmlui-textColor-Button-attention-outlined--hover)", "borderColor-Button-attention-outlined--active": "var(--xmlui-borderColor-Button-attention-outlined--active)", "backgroundColor-Button-attention-outlined--active": "var(--xmlui-backgroundColor-Button-attention-outlined--active)", "textColor-Button-attention-outlined--active": "var(--xmlui-textColor-Button-attention-outlined--active)", "fontFamily-Button-primary-ghost": "var(--xmlui-fontFamily-Button-primary-ghost)", "fontSize-Button-primary-ghost": "var(--xmlui-fontSize-Button-primary-ghost)", "fontWeight-Button-primary-ghost": "var(--xmlui-fontWeight-Button-primary-ghost)", "borderRadius-Button-primary-ghost": "var(--xmlui-borderRadius-Button-primary-ghost)", "borderWidth-Button-primary-ghost": "var(--xmlui-borderWidth-Button-primary-ghost)", "textColor-Button-primary-ghost": "var(--xmlui-textColor-Button-primary-ghost)", "outlineWidth-Button-primary-ghost--focus": "var(--xmlui-outlineWidth-Button-primary-ghost--focus)", "outlineColor-Button-primary-ghost--focus": "var(--xmlui-outlineColor-Button-primary-ghost--focus)", "outlineStyle-Button-primary-ghost--focus": "var(--xmlui-outlineStyle-Button-primary-ghost--focus)", "outlineOffset-Button-primary-ghost--focus": "var(--xmlui-outlineOffset-Button-primary-ghost--focus)", "backgroundColor-Button-primary-ghost--hover": "var(--xmlui-backgroundColor-Button-primary-ghost--hover)", "textColor-Button-primary-ghost--hover": "var(--xmlui-textColor-Button-primary-ghost--hover)", "backgroundColor-Button-primary-ghost--active": "var(--xmlui-backgroundColor-Button-primary-ghost--active)", "textColor-Button-primary-ghost--active": "var(--xmlui-textColor-Button-primary-ghost--active)", "fontFamily-Button-secondary-ghost": "var(--xmlui-fontFamily-Button-secondary-ghost)", "fontSize-Button-secondary-ghost": "var(--xmlui-fontSize-Button-secondary-ghost)", "fontWeight-Button-secondary-ghost": "var(--xmlui-fontWeight-Button-secondary-ghost)", "borderRadius-Button-secondary-ghost": "var(--xmlui-borderRadius-Button-secondary-ghost)", "borderWidth-Button-secondary-ghost": "var(--xmlui-borderWidth-Button-secondary-ghost)", "textColor-Button-secondary-ghost": "var(--xmlui-textColor-Button-secondary-ghost)", "outlineWidth-Button-secondary-ghost--focus": "var(--xmlui-outlineWidth-Button-secondary-ghost--focus)", "outlineColor-Button-secondary-ghost--focus": "var(--xmlui-outlineColor-Button-secondary-ghost--focus)", "outlineStyle-Button-secondary-ghost--focus": "var(--xmlui-outlineStyle-Button-secondary-ghost--focus)", "outlineOffset-Button-secondary-ghost--focus": "var(--xmlui-outlineOffset-Button-secondary-ghost--focus)", "backgroundColor-Button-secondary-ghost--hover": "var(--xmlui-backgroundColor-Button-secondary-ghost--hover)", "textColor-Button-secondary-ghost--hover": "var(--xmlui-textColor-Button-secondary-ghost--hover)", "backgroundColor-Button-secondary-ghost--active": "var(--xmlui-backgroundColor-Button-secondary-ghost--active)", "textColor-Button-secondary-ghost--active": "var(--xmlui-textColor-Button-secondary-ghost--active)", "fontFamily-Button-attention-ghost": "var(--xmlui-fontFamily-Button-attention-ghost)", "fontSize-Button-attention-ghost": "var(--xmlui-fontSize-Button-attention-ghost)", "fontWeight-Button-attention-ghost": "var(--xmlui-fontWeight-Button-attention-ghost)", "borderRadius-Button-attention-ghost": "var(--xmlui-borderRadius-Button-attention-ghost)", "borderWidth-Button-attention-ghost": "var(--xmlui-borderWidth-Button-attention-ghost)", "textColor-Button-attention-ghost": "var(--xmlui-textColor-Button-attention-ghost)", "outlineWidth-Button-attention-ghost--focus": "var(--xmlui-outlineWidth-Button-attention-ghost--focus)", "outlineColor-Button-attention-ghost--focus": "var(--xmlui-outlineColor-Button-attention-ghost--focus)", "outlineStyle-Button-attention-ghost--focus": "var(--xmlui-outlineStyle-Button-attention-ghost--focus)", "outlineOffset-Button-attention-ghost--focus": "var(--xmlui-outlineOffset-Button-attention-ghost--focus)", "backgroundColor-Button-attention-ghost--hover": "var(--xmlui-backgroundColor-Button-attention-ghost--hover)", "textColor-Button-attention-ghost--hover": "var(--xmlui-textColor-Button-attention-ghost--hover)", "backgroundColor-Button-attention-ghost--active": "var(--xmlui-backgroundColor-Button-attention-ghost--active)", "textColor-Button-attention-ghost--active": "var(--xmlui-textColor-Button-attention-ghost--active)"}'`, Ed = "_button_1rnn4_13", Pd = "_alignStart_1rnn4_29", Dd = "_alignEnd_1rnn4_32", Md = "_buttonHorizontal_1rnn4_38", Fd = "_xs_1rnn4_41", Ud = "_sm_1rnn4_48", qd = "_md_1rnn4_55", Gd = "_lg_1rnn4_62", Yd = "_buttonVertical_1rnn4_69", Xd = "_solidPrimary_1rnn4_103", jd = "_solidSecondary_1rnn4_138", Qd = "_solidAttention_1rnn4_173", Zd = "_outlinedPrimary_1rnn4_208", Jd = "_outlinedSecondary_1rnn4_241", Kd = "_outlinedAttention_1rnn4_274", es = "_ghostPrimary_1rnn4_307", ts = "_ghostSecondary_1rnn4_336", rs = "_ghostAttention_1rnn4_365", Ue = {
  themeVars: Vd,
  button: Ed,
  alignStart: Pd,
  alignEnd: Dd,
  buttonHorizontal: Md,
  xs: Fd,
  sm: Ud,
  md: qd,
  lg: Gd,
  buttonVertical: Yd,
  solidPrimary: Xd,
  solidSecondary: jd,
  solidAttention: Qd,
  outlinedPrimary: Zd,
  outlinedSecondary: Jd,
  outlinedAttention: Kd,
  ghostPrimary: es,
  ghostSecondary: ts,
  ghostAttention: rs
};
function k({
  description: e,
  shortDescription: t,
  specializedFrom: r,
  status: o,
  props: a,
  events: n,
  contextVars: i,
  apis: l,
  nonVisual: s,
  opaque: v,
  themeVars: x,
  themeVarDescriptions: c,
  defaultThemeVars: T,
  toneSpecificThemeVars: b,
  allowArbitraryProps: f,
  docFolder: y,
  isHtmlTag: w
}) {
  return {
    description: e,
    shortDescription: t,
    specializedFrom: r,
    status: o,
    props: a,
    events: n,
    contextVars: i,
    apis: l,
    nonVisual: s,
    opaque: v,
    themeVars: x,
    defaultThemeVars: T,
    themeVarDescriptions: c,
    toneSpecificThemeVars: b,
    allowArbitraryProps: f,
    docFolder: y,
    isHtmlTag: w
  };
}
function u(e, t, r, o, a, n) {
  return { description: e, isRequired: n, availableValues: t, valueType: r, defaultValue: o, isValid: a };
}
const Dn = [
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
], ja = [
  { value: "xs", description: "Extra small button" },
  { value: "sm", description: "Small button" },
  { value: "md", description: "Medium button" },
  { value: "lg", description: "Large button" }
], os = ["attention", "primary", "secondary"], as = [...os], Qa = [
  { value: "attention", description: "Attention state theme color" },
  { value: "primary", description: "Primary theme color" },
  { value: "secondary", description: "Secondary theme color" }
], is = [
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
], ns = ["solid", "outlined", "ghost"], ls = [...ns], Za = [
  { value: "solid", description: "A button with a border and a filled background." },
  {
    value: "outlined",
    description: "The button is displayed with a border and a transparent background."
  },
  {
    value: "ghost",
    description: "A button with no border and fill. Only the label is visible; the background is colored when hovered or clicked."
  }
], Mn = ["start", "center", "end"], Fn = [
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
], ds = ["start", "end"], ss = [...ds], Ja = [
  {
    value: "start",
    description: "The icon will appear at the start (left side when the left-to-right direction is set)"
  },
  {
    value: "end",
    description: "The icon will appear at the end (right side when the left-to-right direction is set)"
  }
], us = [
  { value: "primary", description: "Primary theme color, no default icon" },
  { value: "secondary", description: "Secondary theme color, no default icon" },
  { value: "success", description: 'Success theme color, "success" icon' },
  { value: "danger", description: 'Warning theme color, "warning" icon' },
  { value: "warning", description: 'Danger theme color, "danger" icon' },
  { value: "info", description: 'Info theme color, "info" icon' },
  { value: "light", description: "Light theme color, no default icon" },
  { value: "dark", description: "Dark theme color, no default icon" }
], cs = [
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
], Un = [
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
], ms = ["start", "end"], ps = [...ms], hs = [
  // { value: "none", description: "No indicator" },
  { value: "valid", description: "Visual indicator for an input that is accepted" },
  { value: "warning", description: "Visual indicator for an input that produced a warning" },
  { value: "error", description: "Visual indicator for an input that produced an error" }
], xs = ["top", "bottom"], Ci = {
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
}, bs = [
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
], qn = [
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "head",
  "options",
  "trace",
  "connect"
], vs = "xmlui", fs = '"[]"', Gn = {
  keyPrefix: vs,
  themeVars: fs
};
function j(e) {
  if (!e || typeof e != "string")
    return e;
  let t = e.replace(/(^['"])|(['"]$)/g, "");
  try {
    return JSON.parse(t);
  } catch {
    try {
      return JSON.parse(
        e.replace("(", "{").replace(")", "}").replace(/: ?([^,}]+)([,}])/g, ': "$1"$2').replace(/([\s{,])(?!")([^:\s]+)+:/g, '$1"$2":')
      );
    } catch {
      return t;
    }
  }
}
j(Gn.keyPrefix);
j(Gn.themeVars);
function Fe(e) {
  return {
    description: e ?? "This property is for internal use only.",
    isInternal: !0
  };
}
function ho(e) {
  return {
    description: `This event is triggered when the ${e} is clicked.`
  };
}
function Ct(e) {
  return {
    description: `This event is triggered when the ${e} has received the focus.`
  };
}
function kt(e) {
  return {
    description: `This event is triggered when the ${e} has lost the focus.`
  };
}
function tt(e) {
  return {
    description: `This event is triggered when value of ${e} has changed.`
  };
}
function Yn(e) {
  return {
    description: "The `true` value of this property signals that the component is in an _intedeterminate state_.",
    defaultValue: e
  };
}
function qe() {
  return {
    description: "This property sets the label of the component.",
    valueType: "string"
  };
}
function Dt(e) {
  return {
    description: "Places the label at the given position of the component.",
    availableValues: Un,
    defaultValue: e ?? "top"
  };
}
function Zt(e) {
  return {
    description: `This property sets the width of the \`${e}\`.`
  };
}
function Jt(e) {
  return {
    description: `This boolean value indicates if the \`${e}\` labels can be split into multiple lines if it would overflow the available label width.`,
    valueType: "boolean",
    defaultValue: !1
  };
}
function rt() {
  return {
    description: "If this property is set to `true`, the component gets the focus automatically when displayed.",
    valueType: "boolean",
    defaultValue: !1
  };
}
function St(e) {
  return {
    description: "This property sets the component's initial value.",
    defaultValue: e
  };
}
function _t(e) {
  return {
    description: "Set this property to `true` to disallow changing the component value.",
    valueType: "boolean",
    defaultValue: e ?? !1
  };
}
function Ze(e) {
  return {
    description: "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
    valueType: "boolean",
    defaultValue: e ?? !0
  };
}
function Xn() {
  return {
    description: "The `true` value of the property indicates if the user can select multiple items.",
    valueType: "boolean",
    defaultValue: !1
  };
}
function At(e) {
  return {
    description: "This property allows you to set the validation status of the input component.",
    availableValues: hs,
    defaultValue: e ?? "none"
  };
}
function jn() {
  return {
    description: "You can query this read-only API property to query the component's current value (`true`: checked, `false`: unchecked)."
  };
}
function Kt() {
  return {
    description: "You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked)."
  };
}
function Ve(e) {
  return {
    description: e,
    valueType: "ComponentDef"
  };
}
function Er() {
  return {
    description: "A placeholder text that is visible in the input field when its empty.",
    valueType: "string"
  };
}
function Ao() {
  return {
    description: "This property sets the maximum length of the input it accepts.",
    valueType: "number"
  };
}
function Nt() {
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
function ti() {
  return {
    description: "This property sets a text to appear on the end (right side when the left-to-right direction is set) of the input.",
    valueType: "string"
  };
}
function ri() {
  return {
    description: "This property sets an icon to appear on the end (right side when the left-to-right direction is set) of the input.",
    valueType: "string"
  };
}
function gs(e) {
  return {
    description: `This property indicates if the ${e} is expanded (\`true\`) or collapsed (\`false\`).`
  };
}
function Ts(e) {
  return {
    description: `This method expands the ${e}.`
  };
}
function ys(e) {
  return {
    description: `This method collapses the ${e}.`
  };
}
function er(e) {
  return {
    description: `This method sets the focus on the ${e}.`
  };
}
function ia() {
  return {
    description: "You can query the component's value. If no value is set, it will retrieve `undefined`."
  };
}
function Cs(e) {
  return {
    description: `This event is triggered when the ${e} has been displayed. The event handler has a single boolean argument set to \`true\`, indicating that the user opened the component.`
  };
}
function ks(e) {
  return {
    description: `This event is triggered when the ${e} has been closed. The event handler has a single boolean argument set to \`true\`, indicating that the user closed the component.`
  };
}
function Qn(e) {
  return {
    description: `This property allows you to define a custom trigger instead of the default one provided by \`${e}\`.`,
    valueType: "ComponentDef"
  };
}
function Zn(e, t = !1) {
  return {
    description: "This property sets the main axis along which the nested components are rendered.",
    availableValues: aa,
    valueType: "string",
    defaultValue: e,
    isRequired: t
  };
}
const Ss = `'{"size-Icon": "var(--xmlui-size-Icon)", "thickness-stroke-Icon": "var(--xmlui-thickness-stroke-Icon)"}'`, ws = "_base_13qtg_13", Jn = {
  themeVars: Ss,
  base: ws
};
function Vo(e) {
  return e[0].toUpperCase() + e.substring(1);
}
const Le = (e) => {
  const t = he(e);
  return Ql(() => {
    t.current = e;
  }, [e]), X((...r) => {
    const o = t.current;
    return o(...r);
  }, [t]);
};
function Hs(e, t, r) {
  const o = Kl(
    (a, n, i) => {
      e(...i).then(a).catch(n);
    },
    t,
    r
  );
  return (...a) => new Promise((n, i) => {
    o(n, i, a);
  });
}
const Bs = Ne.createContext(void 0);
Ne.createContext(void 0);
function tr() {
  return Lt(Bs);
}
function Is(e) {
  const { getResourceUrl: t } = tr();
  return t(e);
}
const dt = Object.freeze([]), Rr = Object.freeze({}), de = (...e) => ({}), $s = (e, t) => {
  const r = e == null ? void 0 : e.current, o = he();
  ee(() => {
    o != null && o.current && r && o.current.unobserve(r), o.current = new ResizeObserver(t), e && e.current && o.current && o.current.observe(e.current);
  }, [t, r, e]);
};
function Kn(e) {
  const t = he();
  return ee(() => {
    t.current = e;
  }, [e]), t.current;
}
function ki(e) {
  const [t, r] = me(!1);
  return ee(() => {
    if (!window) {
      r(!1);
      return;
    }
    const o = window.matchMedia(e);
    return a(), o.addEventListener("change", a), () => {
      o.removeEventListener("change", a);
    };
    function a() {
      r(o.matches);
    }
  }, [e]), t;
}
function Ls(e) {
  const t = he({ mountedFired: !1 });
  ee(() => {
    t.current.mountedFired || (t.current.mountedFired = !0, e == null || e());
  }, [e]);
}
const Lo = typeof document < "u" ? Io : ee, _s = Ne.createContext(null);
function el() {
  return Lt(_s);
}
const As = {
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
}, Ns = /[-:]/g;
function Ws(e) {
  const { ensureCustomSvgIcon: t, customSvgs: r } = el();
  Lo(() => {
    e && t(e);
  }, [t, e]);
  const o = e ? r[e] : null, a = X(
    ({ style: n, className: i }) => {
      if (!o)
        return null;
      const { attributes: l, name: s } = o, v = {};
      return Object.entries(l).forEach(([x, c]) => {
        let T = x;
        /^(data-|aria-)/.test(x) ? T = x : T = x.replace(Ns, "").toLowerCase(), v[As[T] || x] = c;
      }), /* @__PURE__ */ m("svg", { ...v, style: n, className: i, children: /* @__PURE__ */ m("use", { href: `#${s}` }) });
    },
    [o]
  );
  return e ? a : null;
}
function Os(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var tl = { exports: {} };
/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
(function(e) {
  (function() {
    var t = {}.hasOwnProperty;
    function r() {
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
        return r.apply(null, n);
      if (n.toString !== Object.prototype.toString && !n.toString.toString().includes("[native code]"))
        return n.toString();
      var i = "";
      for (var l in n)
        t.call(n, l) && n[l] && (i = a(i, l));
      return i;
    }
    function a(n, i) {
      return i ? n ? n + " " + i : n + i : n;
    }
    e.exports ? (r.default = r, e.exports = r) : window.classNames = r;
  })();
})(tl);
var Rs = tl.exports;
const le = /* @__PURE__ */ Os(Rs), sa = "xmlui";
function rl(e) {
  if (typeof e == "string")
    return `var(--${sa}-${e.substring(1)})`;
  if (e.defaultValue && e.defaultValue.length > 0) {
    let t = "";
    for (const r of e.defaultValue)
      t += typeof r == "string" ? r : rl(r);
    return `var(--${sa}-${e.id.substring(1)}, ${t})`;
  } else
    return `var(--${sa}-${e.id.substring(1)})`;
}
const ke = ve(function({ name: t, fallback: r, style: o, className: a, size: n, ...i }, l) {
  var f;
  const s = Ps(t, r), v = typeof n == "string" ? Es(n) : n, x = v || i.width, c = v || i.height, T = {
    // className is needed to apply a default color to the icon, thus other component classes can override this one
    className: le(Jn.base, a),
    ...i,
    size: v,
    width: x,
    height: c,
    style: {
      ...o,
      "--icon-width": x,
      "--icon-height": c
    }
  }, b = Vs(t);
  return b ? /* @__PURE__ */ m(zs, { ...T, url: b, name: t }) : ((f = s == null ? void 0 : s.renderer) == null ? void 0 : f.call(s, T)) || null;
});
function zs(e) {
  var x;
  const { url: t, width: r, height: o, name: a, style: n, className: i } = e, l = Is(t), s = (x = l == null ? void 0 : l.toLowerCase()) == null ? void 0 : x.endsWith(".svg"), v = Ws(l);
  if (l && s) {
    const c = v == null ? void 0 : v({ style: n, className: i });
    return c || /* @__PURE__ */ m("span", { style: n, className: i });
  }
  return /* @__PURE__ */ m("img", { src: l, style: { width: r, height: o, ...n }, alt: a });
}
function Vs(e) {
  const { getResourceUrl: t } = tr();
  return e && t(`resource:icon.${e}`);
}
function Es(e) {
  return /^\$[a-zA-Z0-9_$-]+$/g.test(e) ? rl(e) : {
    xs: "0.75em",
    sm: "1em",
    md: "1.5rem",
    lg: "2em"
  }[e] || e;
}
function Ps(e, t) {
  const r = el();
  if (e && typeof e == "string") {
    const o = ":", a = e.split(o);
    if (a.length > 1) {
      const n = r.lookupIconRenderer(
        `${a[0].toLowerCase()}${o}${a[1]}`
      );
      if (n) return n;
    }
    if (a.length === 1) {
      const n = r.lookupIconRenderer(a[0]);
      if (n) return n;
    }
  }
  if (t && typeof t == "string") {
    const o = r.lookupIconRenderer(t.toLowerCase());
    if (o) return o;
  }
  return null;
}
function Si(e, t) {
  if (typeof e == "function")
    return e(t);
  e != null && (e.current = t);
}
function sr(...e) {
  return (t) => {
    let r = !1;
    const o = e.map((a) => {
      const n = Si(a, t);
      return !r && typeof n == "function" && (r = !0), n;
    });
    if (r)
      return () => {
        for (let a = 0; a < o.length; a++) {
          const n = o[a];
          typeof n == "function" ? n() : Si(e[a], null);
        }
      };
  };
}
const lt = {
  type: "button",
  iconPosition: "start",
  contentPosition: "center",
  orientation: "horizontal",
  variant: "solid",
  themeColor: "primary",
  size: "sm"
}, st = Ne.forwardRef(function({
  id: t,
  type: r = lt.type,
  icon: o,
  iconPosition: a = lt.iconPosition,
  contentPosition: n = lt.contentPosition,
  orientation: i = lt.orientation,
  variant: l = lt.variant,
  themeColor: s = lt.themeColor,
  size: v = lt.size,
  disabled: x,
  children: c,
  formId: T,
  onClick: b,
  onFocus: f,
  onBlur: y,
  style: w,
  gap: _,
  className: H,
  autoFocus: I,
  ...R
}, F) {
  const Z = he(null), V = F ? sr(F, Z) : Z;
  ee(() => {
    I && setTimeout(() => {
      var N;
      (N = Z.current) == null || N.focus();
    }, 0);
  }, [I]);
  const W = a === "start";
  return /* @__PURE__ */ J(
    "button",
    {
      ...R,
      id: t,
      type: r,
      ref: V,
      className: le(H, Ue.button, {
        [Ue.buttonHorizontal]: i === "horizontal",
        [Ue.buttonVertical]: i === "vertical",
        [Ue.xs]: v === "xs",
        [Ue.sm]: v === "sm",
        [Ue.md]: v === "md",
        [Ue.lg]: v === "lg",
        [Ue.solidPrimary]: l === "solid" && s === "primary",
        [Ue.solidSecondary]: l === "solid" && s === "secondary",
        [Ue.solidAttention]: l === "solid" && s === "attention",
        [Ue.outlinedPrimary]: l === "outlined" && s === "primary",
        [Ue.outlinedSecondary]: l === "outlined" && s === "secondary",
        [Ue.outlinedAttention]: l === "outlined" && s === "attention",
        [Ue.ghostPrimary]: l === "ghost" && s === "primary",
        [Ue.ghostSecondary]: l === "ghost" && s === "secondary",
        [Ue.ghostAttention]: l === "ghost" && s === "attention",
        [Ue.alignStart]: n === "start",
        [Ue.alignEnd]: n === "end"
      }),
      autoFocus: I,
      disabled: x,
      form: T,
      style: w,
      onClick: b,
      onFocus: f,
      onBlur: y,
      children: [
        W && o,
        c,
        !W && o
      ]
    }
  );
}), U = "Button", Ds = k({
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
      availableValues: Za,
      defaultValue: lt.variant
    },
    themeColor: {
      description: "Sets the button color scheme defined in the application theme.",
      isRequired: !1,
      type: "string",
      availableValues: Qa,
      defaultValue: lt.themeColor
    },
    size: {
      description: "Sets the size of the button.",
      isRequired: !1,
      type: "string",
      availableValues: ja,
      defaultValue: lt.size
    },
    label: {
      description: `This property is an optional string to set a label for the ${U}. If no label is specified and an icon is set, the ${U} will modify its styling to look like a small icon button. When the ${U} has nested children, it will display them and ignore the value of the \`label\` prop.`,
      type: "string"
    },
    type: {
      description: `This optional string describes how the ${U} appears in an HTML context. You rarely need to set this property explicitly.`,
      availableValues: is,
      valueType: "string",
      defaultValue: lt.type
    },
    enabled: {
      description: "The value of this property indicates whether the button accepts actions (`true`) or does not react to them (`false`).",
      type: "boolean",
      defaultValue: !0
    },
    orientation: Zn(lt.orientation),
    icon: {
      description: `This string value denotes an icon name. The framework will render an icon if XMLUI recognizes the icon by its name. If no label is specified and an icon is set, the ${U} displays only that icon.`,
      type: "string"
    },
    iconPosition: {
      description: `This optional string determines the location of the icon in the ${U}.`,
      availableValues: Ja,
      type: "string",
      defaultValue: lt.iconPosition
    },
    contentPosition: {
      description: `This optional value determines how the label and icon (or nested children) should be placedinside the ${U} component.`,
      availableValues: Fn,
      type: "string",
      defaultValue: lt.contentPosition
    }
  },
  events: {
    click: ho(U),
    gotFocus: Ct(U),
    lostFocus: kt(U)
  },
  themeVars: j(Ue.themeVars),
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
    [`textColor-${U}--disabled`]: "$textColor--disabled",
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
      [`textColor-${U}`]: "$color-surface-950",
      [`textColor-${U}-solid`]: "$color-surface-50",
      [`borderColor-${U}-primary`]: "$color-primary-500",
      [`backgroundColor-${U}-primary--hover`]: "$color-primary-400",
      [`backgroundColor-${U}-primary--active`]: "$color-primary-500",
      [`backgroundColor-${U}-primary-outlined--hover`]: "$color-primary-50",
      [`backgroundColor-${U}-primary-outlined--active`]: "$color-primary-100",
      [`borderColor-${U}-primary-outlined`]: "$color-primary-600",
      [`borderColor-${U}-primary-outlined--hover`]: "$color-primary-500",
      [`textColor-${U}-primary-outlined`]: "$color-primary-900",
      [`textColor-${U}-primary-outlined--hover`]: "$color-primary-950",
      [`textColor-${U}-primary-outlined--active`]: "$color-primary-900",
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
      [`textColor-${U}`]: "$color-surface-50",
      [`textColor-${U}-solid`]: "$color-surface-50",
      [`borderColor-${U}-primary`]: "$color-primary-500",
      [`backgroundColor-${U}-primary--hover`]: "$color-primary-600",
      [`backgroundColor-${U}-primary--active`]: "$color-primary-500",
      [`backgroundColor-${U}-primary-outlined--hover`]: "$color-primary-900",
      [`backgroundColor-${U}-primary-outlined--active`]: "$color-primary-950",
      [`borderColor-${U}-primary-outlined`]: "$color-primary-600",
      [`borderColor-${U}-primary-outlined--hover`]: "$color-primary-500",
      [`textColor-${U}-primary-outlined`]: "$color-primary-100",
      [`textColor-${U}-primary-outlined--hover`]: "$color-primary-50",
      [`textColor-${U}-primary-outlined--active`]: "$color-primary-100",
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
}), Ms = `'{"backgroundColor-Stack--hover": "var(--xmlui-backgroundColor-Stack--hover)", "border-Stack--hover": "var(--xmlui-border-Stack--hover)"}'`, Fs = "_base_1qnyy_13", Us = "_hoverContainer_1qnyy_26", qs = "_handlesClick_1qnyy_39", Gs = "_vertical_1qnyy_43", Ys = "_reverse_1qnyy_47", Xs = "_horizontal_1qnyy_51", js = "_justifyItemsStart_1qnyy_59", Qs = "_justifyItemsCenter_1qnyy_63", Zs = "_justifyItemsStretch_1qnyy_67", Js = "_justifyItemsEnd_1qnyy_71", Ks = "_alignItemsStart_1qnyy_76", eu = "_alignItemsCenter_1qnyy_80", tu = "_alignItemsStretch_1qnyy_84", ru = "_alignItemsEnd_1qnyy_88", Vt = {
  themeVars: Ms,
  base: Fs,
  hoverContainer: Us,
  handlesClick: qs,
  vertical: Gs,
  reverse: Ys,
  horizontal: Xs,
  justifyItemsStart: js,
  justifyItemsCenter: Qs,
  justifyItemsStretch: Zs,
  justifyItemsEnd: Js,
  alignItemsStart: Ks,
  alignItemsCenter: eu,
  alignItemsStretch: tu,
  alignItemsEnd: ru
};
function ou(e, t, r) {
  return ce(() => e === "horizontal" ? {
    horizontal: t && Vt[`justifyItems${Vo(t)}`],
    vertical: r && Vt[`alignItems${Vo(r)}`]
  } : {
    horizontal: t && Vt[`alignItems${Vo(t)}`],
    vertical: r && Vt[`justifyItems${Vo(r)}`]
  }, [e, t, r]);
}
const ol = "vertical", _o = ve(function({
  uid: t,
  children: r,
  orientation: o = ol,
  horizontalAlignment: a,
  verticalAlignment: n,
  style: i,
  reverse: l,
  hoverContainer: s,
  visibleOnHover: v,
  onClick: x,
  onMount: c,
  ...T
}, b) {
  Ls(c);
  const { horizontal: f, vertical: y } = ou(
    o,
    a,
    n
  );
  return /* @__PURE__ */ m(
    "div",
    {
      ...T,
      onClick: x,
      ref: b,
      style: i,
      className: le(
        Vt.base,
        {
          [Vt.vertical]: o === "vertical",
          [Vt.horizontal]: o === "horizontal",
          [Vt.reverse]: l,
          [Vt.hoverContainer]: s,
          "display-on-hover": v,
          [Vt.handlesClick]: !!x
        },
        f ?? "",
        y ?? ""
      ),
      children: r
    }
  );
}), No = "Stack", au = {
  description: "Manages the horizontal content alignment for each child element in the Stack.",
  availableValues: Mn,
  valueType: "string",
  defaultValue: "start"
}, iu = {
  description: "Manages the vertical content alignment for each child element in the Stack.",
  availableValues: Mn,
  valueType: "string",
  defaultValue: "start"
}, Jo = k({
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
      defaultValue: ol
    },
    horizontalAlignment: au,
    verticalAlignment: iu,
    hoverContainer: Fe("Reserved for future use"),
    visibleOnHover: Fe("Reserved for future use")
  },
  events: {
    click: ho(No),
    mounted: Fe("Reserved for future use")
  },
  themeVars: j(Vt.themeVars)
}), Wo = {
  ...Jo,
  props: {
    ...Jo.props
  }
}, nu = {
  ...Wo,
  specializedFrom: No,
  description: "This component represents a stack rendering its contents vertically.",
  props: {
    ...Jo.props
  }
}, lu = {
  ...Wo,
  specializedFrom: No,
  description: "This component represents a stack rendering its contents horizontally.",
  props: {
    ...Jo.props
  }
}, du = {
  ...Wo,
  specializedFrom: No,
  description: "This component represents a stack that renders its contents vertically and aligns that in the center along both axes."
}, su = {
  ...Wo,
  specializedFrom: No,
  description: "This component represents a stack that renders its contents horizontally and aligns that in the center along both axes."
}, uu = `'{"Input:borderRadius-TextBox-default": "var(--xmlui-borderRadius-TextBox-default)", "Input:borderColor-TextBox-default": "var(--xmlui-borderColor-TextBox-default)", "Input:borderWidth-TextBox-default": "var(--xmlui-borderWidth-TextBox-default)", "Input:borderStyle-TextBox-default": "var(--xmlui-borderStyle-TextBox-default)", "Input:fontSize-TextBox-default": "var(--xmlui-fontSize-TextBox-default)", "Input:padding-TextBox-default": "var(--xmlui-padding-TextBox-default)", "Input:backgroundColor-TextBox-default": "var(--xmlui-backgroundColor-TextBox-default)", "Input:boxShadow-TextBox-default": "var(--xmlui-boxShadow-TextBox-default)", "Input:textColor-TextBox-default": "var(--xmlui-textColor-TextBox-default)", "Input:borderColor-TextBox-default--hover": "var(--xmlui-borderColor-TextBox-default--hover)", "Input:backgroundColor-TextBox-default--hover": "var(--xmlui-backgroundColor-TextBox-default--hover)", "Input:boxShadow-TextBox-default--hover": "var(--xmlui-boxShadow-TextBox-default--hover)", "Input:textColor-TextBox-default--hover": "var(--xmlui-textColor-TextBox-default--hover)", "Input:borderColor-TextBox-default--focus": "var(--xmlui-borderColor-TextBox-default--focus)", "Input:backgroundColor-TextBox-default--focus": "var(--xmlui-backgroundColor-TextBox-default--focus)", "Input:boxShadow-TextBox-default--focus": "var(--xmlui-boxShadow-TextBox-default--focus)", "Input:textColor-TextBox-default--focus": "var(--xmlui-textColor-TextBox-default--focus)", "Input:outlineWidth-TextBox-default--focus": "var(--xmlui-outlineWidth-TextBox-default--focus)", "Input:outlineColor-TextBox-default--focus": "var(--xmlui-outlineColor-TextBox-default--focus)", "Input:outlineStyle-TextBox-default--focus": "var(--xmlui-outlineStyle-TextBox-default--focus)", "Input:outlineOffset-TextBox-default--focus": "var(--xmlui-outlineOffset-TextBox-default--focus)", "Input:color-placeholder-TextBox-default": "var(--xmlui-color-placeholder-TextBox-default)", "Input:color-adornment-TextBox-default": "var(--xmlui-color-adornment-TextBox-default)", "Input:borderRadius-TextBox-error": "var(--xmlui-borderRadius-TextBox-error)", "Input:borderColor-TextBox-error": "var(--xmlui-borderColor-TextBox-error)", "Input:borderWidth-TextBox-error": "var(--xmlui-borderWidth-TextBox-error)", "Input:borderStyle-TextBox-error": "var(--xmlui-borderStyle-TextBox-error)", "Input:fontSize-TextBox-error": "var(--xmlui-fontSize-TextBox-error)", "Input:padding-TextBox-error": "var(--xmlui-padding-TextBox-error)", "Input:backgroundColor-TextBox-error": "var(--xmlui-backgroundColor-TextBox-error)", "Input:boxShadow-TextBox-error": "var(--xmlui-boxShadow-TextBox-error)", "Input:textColor-TextBox-error": "var(--xmlui-textColor-TextBox-error)", "Input:borderColor-TextBox-error--hover": "var(--xmlui-borderColor-TextBox-error--hover)", "Input:backgroundColor-TextBox-error--hover": "var(--xmlui-backgroundColor-TextBox-error--hover)", "Input:boxShadow-TextBox-error--hover": "var(--xmlui-boxShadow-TextBox-error--hover)", "Input:textColor-TextBox-error--hover": "var(--xmlui-textColor-TextBox-error--hover)", "Input:borderColor-TextBox-error--focus": "var(--xmlui-borderColor-TextBox-error--focus)", "Input:backgroundColor-TextBox-error--focus": "var(--xmlui-backgroundColor-TextBox-error--focus)", "Input:boxShadow-TextBox-error--focus": "var(--xmlui-boxShadow-TextBox-error--focus)", "Input:textColor-TextBox-error--focus": "var(--xmlui-textColor-TextBox-error--focus)", "Input:outlineWidth-TextBox-error--focus": "var(--xmlui-outlineWidth-TextBox-error--focus)", "Input:outlineColor-TextBox-error--focus": "var(--xmlui-outlineColor-TextBox-error--focus)", "Input:outlineStyle-TextBox-error--focus": "var(--xmlui-outlineStyle-TextBox-error--focus)", "Input:outlineOffset-TextBox-error--focus": "var(--xmlui-outlineOffset-TextBox-error--focus)", "Input:color-placeholder-TextBox-error": "var(--xmlui-color-placeholder-TextBox-error)", "Input:color-adornment-TextBox-error": "var(--xmlui-color-adornment-TextBox-error)", "Input:borderRadius-TextBox-warning": "var(--xmlui-borderRadius-TextBox-warning)", "Input:borderColor-TextBox-warning": "var(--xmlui-borderColor-TextBox-warning)", "Input:borderWidth-TextBox-warning": "var(--xmlui-borderWidth-TextBox-warning)", "Input:borderStyle-TextBox-warning": "var(--xmlui-borderStyle-TextBox-warning)", "Input:fontSize-TextBox-warning": "var(--xmlui-fontSize-TextBox-warning)", "Input:padding-TextBox-warning": "var(--xmlui-padding-TextBox-warning)", "Input:backgroundColor-TextBox-warning": "var(--xmlui-backgroundColor-TextBox-warning)", "Input:boxShadow-TextBox-warning": "var(--xmlui-boxShadow-TextBox-warning)", "Input:textColor-TextBox-warning": "var(--xmlui-textColor-TextBox-warning)", "Input:borderColor-TextBox-warning--hover": "var(--xmlui-borderColor-TextBox-warning--hover)", "Input:backgroundColor-TextBox-warning--hover": "var(--xmlui-backgroundColor-TextBox-warning--hover)", "Input:boxShadow-TextBox-warning--hover": "var(--xmlui-boxShadow-TextBox-warning--hover)", "Input:textColor-TextBox-warning--hover": "var(--xmlui-textColor-TextBox-warning--hover)", "Input:borderColor-TextBox-warning--focus": "var(--xmlui-borderColor-TextBox-warning--focus)", "Input:backgroundColor-TextBox-warning--focus": "var(--xmlui-backgroundColor-TextBox-warning--focus)", "Input:boxShadow-TextBox-warning--focus": "var(--xmlui-boxShadow-TextBox-warning--focus)", "Input:textColor-TextBox-warning--focus": "var(--xmlui-textColor-TextBox-warning--focus)", "Input:outlineWidth-TextBox-warning--focus": "var(--xmlui-outlineWidth-TextBox-warning--focus)", "Input:outlineColor-TextBox-warning--focus": "var(--xmlui-outlineColor-TextBox-warning--focus)", "Input:outlineStyle-TextBox-warning--focus": "var(--xmlui-outlineStyle-TextBox-warning--focus)", "Input:outlineOffset-TextBox-warning--focus": "var(--xmlui-outlineOffset-TextBox-warning--focus)", "Input:color-placeholder-TextBox-warning": "var(--xmlui-color-placeholder-TextBox-warning)", "Input:color-adornment-TextBox-warning": "var(--xmlui-color-adornment-TextBox-warning)", "Input:borderRadius-TextBox-success": "var(--xmlui-borderRadius-TextBox-success)", "Input:borderColor-TextBox-success": "var(--xmlui-borderColor-TextBox-success)", "Input:borderWidth-TextBox-success": "var(--xmlui-borderWidth-TextBox-success)", "Input:borderStyle-TextBox-success": "var(--xmlui-borderStyle-TextBox-success)", "Input:fontSize-TextBox-success": "var(--xmlui-fontSize-TextBox-success)", "Input:padding-TextBox-success": "var(--xmlui-padding-TextBox-success)", "Input:backgroundColor-TextBox-success": "var(--xmlui-backgroundColor-TextBox-success)", "Input:boxShadow-TextBox-success": "var(--xmlui-boxShadow-TextBox-success)", "Input:textColor-TextBox-success": "var(--xmlui-textColor-TextBox-success)", "Input:borderColor-TextBox-success--hover": "var(--xmlui-borderColor-TextBox-success--hover)", "Input:backgroundColor-TextBox-success--hover": "var(--xmlui-backgroundColor-TextBox-success--hover)", "Input:boxShadow-TextBox-success--hover": "var(--xmlui-boxShadow-TextBox-success--hover)", "Input:textColor-TextBox-success--hover": "var(--xmlui-textColor-TextBox-success--hover)", "Input:borderColor-TextBox-success--focus": "var(--xmlui-borderColor-TextBox-success--focus)", "Input:backgroundColor-TextBox-success--focus": "var(--xmlui-backgroundColor-TextBox-success--focus)", "Input:boxShadow-TextBox-success--focus": "var(--xmlui-boxShadow-TextBox-success--focus)", "Input:textColor-TextBox-success--focus": "var(--xmlui-textColor-TextBox-success--focus)", "Input:outlineWidth-TextBox-success--focus": "var(--xmlui-outlineWidth-TextBox-success--focus)", "Input:outlineColor-TextBox-success--focus": "var(--xmlui-outlineColor-TextBox-success--focus)", "Input:outlineStyle-TextBox-success--focus": "var(--xmlui-outlineStyle-TextBox-success--focus)", "Input:outlineOffset-TextBox-success--focus": "var(--xmlui-outlineOffset-TextBox-success--focus)", "Input:color-placeholder-TextBox-success": "var(--xmlui-color-placeholder-TextBox-success)", "Input:color-adornment-TextBox-success": "var(--xmlui-color-adornment-TextBox-success)", "Input:backgroundColor-TextBox--disabled": "var(--xmlui-backgroundColor-TextBox--disabled)", "Input:textColor-TextBox--disabled": "var(--xmlui-textColor-TextBox--disabled)", "Input:borderColor-TextBox--disabled": "var(--xmlui-borderColor-TextBox--disabled)"}'`, cu = "_inputRoot_ley74_13", mu = "_input_ley74_13", pu = "_adornment_ley74_53", hu = "_error_ley74_56", xu = "_warning_ley74_91", bu = "_valid_ley74_126", vu = "_readOnly_ley74_181", zt = {
  themeVars: uu,
  inputRoot: cu,
  input: mu,
  adornment: pu,
  error: hu,
  warning: xu,
  valid: bu,
  readOnly: vu
}, fu = "_wrapper_wg0td_13", gu = {
  wrapper: fu
}, Tu = `'{"fontFamily-Text-abbr": "var(--xmlui-fontFamily-Text-abbr)", "fontSize-Text-abbr": "var(--xmlui-fontSize-Text-abbr)", "fontWeight-Text-abbr": "var(--xmlui-fontWeight-Text-abbr)", "font-style-Text-abbr": "var(--xmlui-font-style-Text-abbr)", "font-stretch-Text-abbr": "var(--xmlui-font-stretch-Text-abbr)", "textDecorationLine-Text-abbr": "var(--xmlui-textDecorationLine-Text-abbr)", "textDecorationColor-Text-abbr": "var(--xmlui-textDecorationColor-Text-abbr)", "textDecorationStyle-Text-abbr": "var(--xmlui-textDecorationStyle-Text-abbr)", "textDecorationThickness-Text-abbr": "var(--xmlui-textDecorationThickness-Text-abbr)", "textUnderlineOffset-Text-abbr": "var(--xmlui-textUnderlineOffset-Text-abbr)", "lineHeight-Text-abbr": "var(--xmlui-lineHeight-Text-abbr)", "textColor-Text-abbr": "var(--xmlui-textColor-Text-abbr)", "backgroundColor-Text-abbr": "var(--xmlui-backgroundColor-Text-abbr)", "borderRadius-Text-abbr": "var(--xmlui-borderRadius-Text-abbr)", "borderColor-Text-abbr": "var(--xmlui-borderColor-Text-abbr)", "borderWidth-Text-abbr": "var(--xmlui-borderWidth-Text-abbr)", "borderStyle-Text-abbr": "var(--xmlui-borderStyle-Text-abbr)", "marginTop-Text-abbr": "var(--xmlui-marginTop-Text-abbr)", "marginBottom-Text-abbr": "var(--xmlui-marginBottom-Text-abbr)", "textTransform-Text-abbr": "var(--xmlui-textTransform-Text-abbr)", "verticalAlign-Text-abbr": "var(--xmlui-verticalAlign-Text-abbr)", "letterSpacing-Text-abbr": "var(--xmlui-letterSpacing-Text-abbr)", "fontFamily-Text-cite": "var(--xmlui-fontFamily-Text-cite)", "fontSize-Text-cite": "var(--xmlui-fontSize-Text-cite)", "fontWeight-Text-cite": "var(--xmlui-fontWeight-Text-cite)", "font-style-Text-cite": "var(--xmlui-font-style-Text-cite)", "font-stretch-Text-cite": "var(--xmlui-font-stretch-Text-cite)", "textDecorationLine-Text-cite": "var(--xmlui-textDecorationLine-Text-cite)", "textDecorationColor-Text-cite": "var(--xmlui-textDecorationColor-Text-cite)", "textDecorationStyle-Text-cite": "var(--xmlui-textDecorationStyle-Text-cite)", "textDecorationThickness-Text-cite": "var(--xmlui-textDecorationThickness-Text-cite)", "textUnderlineOffset-Text-cite": "var(--xmlui-textUnderlineOffset-Text-cite)", "lineHeight-Text-cite": "var(--xmlui-lineHeight-Text-cite)", "textColor-Text-cite": "var(--xmlui-textColor-Text-cite)", "backgroundColor-Text-cite": "var(--xmlui-backgroundColor-Text-cite)", "borderRadius-Text-cite": "var(--xmlui-borderRadius-Text-cite)", "borderColor-Text-cite": "var(--xmlui-borderColor-Text-cite)", "borderWidth-Text-cite": "var(--xmlui-borderWidth-Text-cite)", "borderStyle-Text-cite": "var(--xmlui-borderStyle-Text-cite)", "marginTop-Text-cite": "var(--xmlui-marginTop-Text-cite)", "marginBottom-Text-cite": "var(--xmlui-marginBottom-Text-cite)", "textTransform-Text-cite": "var(--xmlui-textTransform-Text-cite)", "verticalAlign-Text-cite": "var(--xmlui-verticalAlign-Text-cite)", "letterSpacing-Text-cite": "var(--xmlui-letterSpacing-Text-cite)", "fontFamily-Text-code": "var(--xmlui-fontFamily-Text-code)", "fontSize-Text-code": "var(--xmlui-fontSize-Text-code)", "fontWeight-Text-code": "var(--xmlui-fontWeight-Text-code)", "font-style-Text-code": "var(--xmlui-font-style-Text-code)", "font-stretch-Text-code": "var(--xmlui-font-stretch-Text-code)", "textDecorationLine-Text-code": "var(--xmlui-textDecorationLine-Text-code)", "textDecorationColor-Text-code": "var(--xmlui-textDecorationColor-Text-code)", "textDecorationStyle-Text-code": "var(--xmlui-textDecorationStyle-Text-code)", "textDecorationThickness-Text-code": "var(--xmlui-textDecorationThickness-Text-code)", "textUnderlineOffset-Text-code": "var(--xmlui-textUnderlineOffset-Text-code)", "lineHeight-Text-code": "var(--xmlui-lineHeight-Text-code)", "textColor-Text-code": "var(--xmlui-textColor-Text-code)", "backgroundColor-Text-code": "var(--xmlui-backgroundColor-Text-code)", "borderRadius-Text-code": "var(--xmlui-borderRadius-Text-code)", "borderColor-Text-code": "var(--xmlui-borderColor-Text-code)", "borderWidth-Text-code": "var(--xmlui-borderWidth-Text-code)", "borderStyle-Text-code": "var(--xmlui-borderStyle-Text-code)", "marginTop-Text-code": "var(--xmlui-marginTop-Text-code)", "marginBottom-Text-code": "var(--xmlui-marginBottom-Text-code)", "textTransform-Text-code": "var(--xmlui-textTransform-Text-code)", "verticalAlign-Text-code": "var(--xmlui-verticalAlign-Text-code)", "letterSpacing-Text-code": "var(--xmlui-letterSpacing-Text-code)", "fontFamily-Text-codefence": "var(--xmlui-fontFamily-Text-codefence)", "fontSize-Text-codefence": "var(--xmlui-fontSize-Text-codefence)", "fontWeight-Text-codefence": "var(--xmlui-fontWeight-Text-codefence)", "font-style-Text-codefence": "var(--xmlui-font-style-Text-codefence)", "font-stretch-Text-codefence": "var(--xmlui-font-stretch-Text-codefence)", "textDecorationLine-Text-codefence": "var(--xmlui-textDecorationLine-Text-codefence)", "textDecorationColor-Text-codefence": "var(--xmlui-textDecorationColor-Text-codefence)", "textDecorationStyle-Text-codefence": "var(--xmlui-textDecorationStyle-Text-codefence)", "textDecorationThickness-Text-codefence": "var(--xmlui-textDecorationThickness-Text-codefence)", "textUnderlineOffset-Text-codefence": "var(--xmlui-textUnderlineOffset-Text-codefence)", "lineHeight-Text-codefence": "var(--xmlui-lineHeight-Text-codefence)", "textColor-Text-codefence": "var(--xmlui-textColor-Text-codefence)", "backgroundColor-Text-codefence": "var(--xmlui-backgroundColor-Text-codefence)", "borderRadius-Text-codefence": "var(--xmlui-borderRadius-Text-codefence)", "borderColor-Text-codefence": "var(--xmlui-borderColor-Text-codefence)", "borderWidth-Text-codefence": "var(--xmlui-borderWidth-Text-codefence)", "borderStyle-Text-codefence": "var(--xmlui-borderStyle-Text-codefence)", "marginTop-Text-codefence": "var(--xmlui-marginTop-Text-codefence)", "marginBottom-Text-codefence": "var(--xmlui-marginBottom-Text-codefence)", "textTransform-Text-codefence": "var(--xmlui-textTransform-Text-codefence)", "verticalAlign-Text-codefence": "var(--xmlui-verticalAlign-Text-codefence)", "letterSpacing-Text-codefence": "var(--xmlui-letterSpacing-Text-codefence)", "fontFamily-Text-deleted": "var(--xmlui-fontFamily-Text-deleted)", "fontSize-Text-deleted": "var(--xmlui-fontSize-Text-deleted)", "fontWeight-Text-deleted": "var(--xmlui-fontWeight-Text-deleted)", "font-style-Text-deleted": "var(--xmlui-font-style-Text-deleted)", "font-stretch-Text-deleted": "var(--xmlui-font-stretch-Text-deleted)", "textDecorationLine-Text-deleted": "var(--xmlui-textDecorationLine-Text-deleted)", "textDecorationColor-Text-deleted": "var(--xmlui-textDecorationColor-Text-deleted)", "textDecorationStyle-Text-deleted": "var(--xmlui-textDecorationStyle-Text-deleted)", "textDecorationThickness-Text-deleted": "var(--xmlui-textDecorationThickness-Text-deleted)", "textUnderlineOffset-Text-deleted": "var(--xmlui-textUnderlineOffset-Text-deleted)", "lineHeight-Text-deleted": "var(--xmlui-lineHeight-Text-deleted)", "textColor-Text-deleted": "var(--xmlui-textColor-Text-deleted)", "backgroundColor-Text-deleted": "var(--xmlui-backgroundColor-Text-deleted)", "borderRadius-Text-deleted": "var(--xmlui-borderRadius-Text-deleted)", "borderColor-Text-deleted": "var(--xmlui-borderColor-Text-deleted)", "borderWidth-Text-deleted": "var(--xmlui-borderWidth-Text-deleted)", "borderStyle-Text-deleted": "var(--xmlui-borderStyle-Text-deleted)", "marginTop-Text-deleted": "var(--xmlui-marginTop-Text-deleted)", "marginBottom-Text-deleted": "var(--xmlui-marginBottom-Text-deleted)", "textTransform-Text-deleted": "var(--xmlui-textTransform-Text-deleted)", "verticalAlign-Text-deleted": "var(--xmlui-verticalAlign-Text-deleted)", "letterSpacing-Text-deleted": "var(--xmlui-letterSpacing-Text-deleted)", "fontFamily-Text-inserted": "var(--xmlui-fontFamily-Text-inserted)", "fontSize-Text-inserted": "var(--xmlui-fontSize-Text-inserted)", "fontWeight-Text-inserted": "var(--xmlui-fontWeight-Text-inserted)", "font-style-Text-inserted": "var(--xmlui-font-style-Text-inserted)", "font-stretch-Text-inserted": "var(--xmlui-font-stretch-Text-inserted)", "textDecorationLine-Text-inserted": "var(--xmlui-textDecorationLine-Text-inserted)", "textDecorationColor-Text-inserted": "var(--xmlui-textDecorationColor-Text-inserted)", "textDecorationStyle-Text-inserted": "var(--xmlui-textDecorationStyle-Text-inserted)", "textDecorationThickness-Text-inserted": "var(--xmlui-textDecorationThickness-Text-inserted)", "textUnderlineOffset-Text-inserted": "var(--xmlui-textUnderlineOffset-Text-inserted)", "lineHeight-Text-inserted": "var(--xmlui-lineHeight-Text-inserted)", "textColor-Text-inserted": "var(--xmlui-textColor-Text-inserted)", "backgroundColor-Text-inserted": "var(--xmlui-backgroundColor-Text-inserted)", "borderRadius-Text-inserted": "var(--xmlui-borderRadius-Text-inserted)", "borderColor-Text-inserted": "var(--xmlui-borderColor-Text-inserted)", "borderWidth-Text-inserted": "var(--xmlui-borderWidth-Text-inserted)", "borderStyle-Text-inserted": "var(--xmlui-borderStyle-Text-inserted)", "marginTop-Text-inserted": "var(--xmlui-marginTop-Text-inserted)", "marginBottom-Text-inserted": "var(--xmlui-marginBottom-Text-inserted)", "textTransform-Text-inserted": "var(--xmlui-textTransform-Text-inserted)", "verticalAlign-Text-inserted": "var(--xmlui-verticalAlign-Text-inserted)", "letterSpacing-Text-inserted": "var(--xmlui-letterSpacing-Text-inserted)", "fontFamily-Text-keyboard": "var(--xmlui-fontFamily-Text-keyboard)", "fontSize-Text-keyboard": "var(--xmlui-fontSize-Text-keyboard)", "fontWeight-Text-keyboard": "var(--xmlui-fontWeight-Text-keyboard)", "font-style-Text-keyboard": "var(--xmlui-font-style-Text-keyboard)", "font-stretch-Text-keyboard": "var(--xmlui-font-stretch-Text-keyboard)", "textDecorationLine-Text-keyboard": "var(--xmlui-textDecorationLine-Text-keyboard)", "textDecorationColor-Text-keyboard": "var(--xmlui-textDecorationColor-Text-keyboard)", "textDecorationStyle-Text-keyboard": "var(--xmlui-textDecorationStyle-Text-keyboard)", "textDecorationThickness-Text-keyboard": "var(--xmlui-textDecorationThickness-Text-keyboard)", "textUnderlineOffset-Text-keyboard": "var(--xmlui-textUnderlineOffset-Text-keyboard)", "lineHeight-Text-keyboard": "var(--xmlui-lineHeight-Text-keyboard)", "textColor-Text-keyboard": "var(--xmlui-textColor-Text-keyboard)", "backgroundColor-Text-keyboard": "var(--xmlui-backgroundColor-Text-keyboard)", "borderRadius-Text-keyboard": "var(--xmlui-borderRadius-Text-keyboard)", "borderColor-Text-keyboard": "var(--xmlui-borderColor-Text-keyboard)", "borderWidth-Text-keyboard": "var(--xmlui-borderWidth-Text-keyboard)", "borderStyle-Text-keyboard": "var(--xmlui-borderStyle-Text-keyboard)", "marginTop-Text-keyboard": "var(--xmlui-marginTop-Text-keyboard)", "marginBottom-Text-keyboard": "var(--xmlui-marginBottom-Text-keyboard)", "textTransform-Text-keyboard": "var(--xmlui-textTransform-Text-keyboard)", "verticalAlign-Text-keyboard": "var(--xmlui-verticalAlign-Text-keyboard)", "letterSpacing-Text-keyboard": "var(--xmlui-letterSpacing-Text-keyboard)", "fontFamily-Text-marked": "var(--xmlui-fontFamily-Text-marked)", "fontSize-Text-marked": "var(--xmlui-fontSize-Text-marked)", "fontWeight-Text-marked": "var(--xmlui-fontWeight-Text-marked)", "font-style-Text-marked": "var(--xmlui-font-style-Text-marked)", "font-stretch-Text-marked": "var(--xmlui-font-stretch-Text-marked)", "textDecorationLine-Text-marked": "var(--xmlui-textDecorationLine-Text-marked)", "textDecorationColor-Text-marked": "var(--xmlui-textDecorationColor-Text-marked)", "textDecorationStyle-Text-marked": "var(--xmlui-textDecorationStyle-Text-marked)", "textDecorationThickness-Text-marked": "var(--xmlui-textDecorationThickness-Text-marked)", "textUnderlineOffset-Text-marked": "var(--xmlui-textUnderlineOffset-Text-marked)", "lineHeight-Text-marked": "var(--xmlui-lineHeight-Text-marked)", "textColor-Text-marked": "var(--xmlui-textColor-Text-marked)", "backgroundColor-Text-marked": "var(--xmlui-backgroundColor-Text-marked)", "borderRadius-Text-marked": "var(--xmlui-borderRadius-Text-marked)", "borderColor-Text-marked": "var(--xmlui-borderColor-Text-marked)", "borderWidth-Text-marked": "var(--xmlui-borderWidth-Text-marked)", "borderStyle-Text-marked": "var(--xmlui-borderStyle-Text-marked)", "marginTop-Text-marked": "var(--xmlui-marginTop-Text-marked)", "marginBottom-Text-marked": "var(--xmlui-marginBottom-Text-marked)", "textTransform-Text-marked": "var(--xmlui-textTransform-Text-marked)", "verticalAlign-Text-marked": "var(--xmlui-verticalAlign-Text-marked)", "letterSpacing-Text-marked": "var(--xmlui-letterSpacing-Text-marked)", "fontFamily-Text-mono": "var(--xmlui-fontFamily-Text-mono)", "fontSize-Text-mono": "var(--xmlui-fontSize-Text-mono)", "fontWeight-Text-mono": "var(--xmlui-fontWeight-Text-mono)", "font-style-Text-mono": "var(--xmlui-font-style-Text-mono)", "font-stretch-Text-mono": "var(--xmlui-font-stretch-Text-mono)", "textDecorationLine-Text-mono": "var(--xmlui-textDecorationLine-Text-mono)", "textDecorationColor-Text-mono": "var(--xmlui-textDecorationColor-Text-mono)", "textDecorationStyle-Text-mono": "var(--xmlui-textDecorationStyle-Text-mono)", "textDecorationThickness-Text-mono": "var(--xmlui-textDecorationThickness-Text-mono)", "textUnderlineOffset-Text-mono": "var(--xmlui-textUnderlineOffset-Text-mono)", "lineHeight-Text-mono": "var(--xmlui-lineHeight-Text-mono)", "textColor-Text-mono": "var(--xmlui-textColor-Text-mono)", "backgroundColor-Text-mono": "var(--xmlui-backgroundColor-Text-mono)", "borderRadius-Text-mono": "var(--xmlui-borderRadius-Text-mono)", "borderColor-Text-mono": "var(--xmlui-borderColor-Text-mono)", "borderWidth-Text-mono": "var(--xmlui-borderWidth-Text-mono)", "borderStyle-Text-mono": "var(--xmlui-borderStyle-Text-mono)", "marginTop-Text-mono": "var(--xmlui-marginTop-Text-mono)", "marginBottom-Text-mono": "var(--xmlui-marginBottom-Text-mono)", "textTransform-Text-mono": "var(--xmlui-textTransform-Text-mono)", "verticalAlign-Text-mono": "var(--xmlui-verticalAlign-Text-mono)", "letterSpacing-Text-mono": "var(--xmlui-letterSpacing-Text-mono)", "fontFamily-Text-sample": "var(--xmlui-fontFamily-Text-sample)", "fontSize-Text-sample": "var(--xmlui-fontSize-Text-sample)", "fontWeight-Text-sample": "var(--xmlui-fontWeight-Text-sample)", "font-style-Text-sample": "var(--xmlui-font-style-Text-sample)", "font-stretch-Text-sample": "var(--xmlui-font-stretch-Text-sample)", "textDecorationLine-Text-sample": "var(--xmlui-textDecorationLine-Text-sample)", "textDecorationColor-Text-sample": "var(--xmlui-textDecorationColor-Text-sample)", "textDecorationStyle-Text-sample": "var(--xmlui-textDecorationStyle-Text-sample)", "textDecorationThickness-Text-sample": "var(--xmlui-textDecorationThickness-Text-sample)", "textUnderlineOffset-Text-sample": "var(--xmlui-textUnderlineOffset-Text-sample)", "lineHeight-Text-sample": "var(--xmlui-lineHeight-Text-sample)", "textColor-Text-sample": "var(--xmlui-textColor-Text-sample)", "backgroundColor-Text-sample": "var(--xmlui-backgroundColor-Text-sample)", "borderRadius-Text-sample": "var(--xmlui-borderRadius-Text-sample)", "borderColor-Text-sample": "var(--xmlui-borderColor-Text-sample)", "borderWidth-Text-sample": "var(--xmlui-borderWidth-Text-sample)", "borderStyle-Text-sample": "var(--xmlui-borderStyle-Text-sample)", "marginTop-Text-sample": "var(--xmlui-marginTop-Text-sample)", "marginBottom-Text-sample": "var(--xmlui-marginBottom-Text-sample)", "textTransform-Text-sample": "var(--xmlui-textTransform-Text-sample)", "verticalAlign-Text-sample": "var(--xmlui-verticalAlign-Text-sample)", "letterSpacing-Text-sample": "var(--xmlui-letterSpacing-Text-sample)", "fontFamily-Text-sup": "var(--xmlui-fontFamily-Text-sup)", "fontSize-Text-sup": "var(--xmlui-fontSize-Text-sup)", "fontWeight-Text-sup": "var(--xmlui-fontWeight-Text-sup)", "font-style-Text-sup": "var(--xmlui-font-style-Text-sup)", "font-stretch-Text-sup": "var(--xmlui-font-stretch-Text-sup)", "textDecorationLine-Text-sup": "var(--xmlui-textDecorationLine-Text-sup)", "textDecorationColor-Text-sup": "var(--xmlui-textDecorationColor-Text-sup)", "textDecorationStyle-Text-sup": "var(--xmlui-textDecorationStyle-Text-sup)", "textDecorationThickness-Text-sup": "var(--xmlui-textDecorationThickness-Text-sup)", "textUnderlineOffset-Text-sup": "var(--xmlui-textUnderlineOffset-Text-sup)", "lineHeight-Text-sup": "var(--xmlui-lineHeight-Text-sup)", "textColor-Text-sup": "var(--xmlui-textColor-Text-sup)", "backgroundColor-Text-sup": "var(--xmlui-backgroundColor-Text-sup)", "borderRadius-Text-sup": "var(--xmlui-borderRadius-Text-sup)", "borderColor-Text-sup": "var(--xmlui-borderColor-Text-sup)", "borderWidth-Text-sup": "var(--xmlui-borderWidth-Text-sup)", "borderStyle-Text-sup": "var(--xmlui-borderStyle-Text-sup)", "marginTop-Text-sup": "var(--xmlui-marginTop-Text-sup)", "marginBottom-Text-sup": "var(--xmlui-marginBottom-Text-sup)", "textTransform-Text-sup": "var(--xmlui-textTransform-Text-sup)", "verticalAlign-Text-sup": "var(--xmlui-verticalAlign-Text-sup)", "letterSpacing-Text-sup": "var(--xmlui-letterSpacing-Text-sup)", "fontFamily-Text-sub": "var(--xmlui-fontFamily-Text-sub)", "fontSize-Text-sub": "var(--xmlui-fontSize-Text-sub)", "fontWeight-Text-sub": "var(--xmlui-fontWeight-Text-sub)", "font-style-Text-sub": "var(--xmlui-font-style-Text-sub)", "font-stretch-Text-sub": "var(--xmlui-font-stretch-Text-sub)", "textDecorationLine-Text-sub": "var(--xmlui-textDecorationLine-Text-sub)", "textDecorationColor-Text-sub": "var(--xmlui-textDecorationColor-Text-sub)", "textDecorationStyle-Text-sub": "var(--xmlui-textDecorationStyle-Text-sub)", "textDecorationThickness-Text-sub": "var(--xmlui-textDecorationThickness-Text-sub)", "textUnderlineOffset-Text-sub": "var(--xmlui-textUnderlineOffset-Text-sub)", "lineHeight-Text-sub": "var(--xmlui-lineHeight-Text-sub)", "textColor-Text-sub": "var(--xmlui-textColor-Text-sub)", "backgroundColor-Text-sub": "var(--xmlui-backgroundColor-Text-sub)", "borderRadius-Text-sub": "var(--xmlui-borderRadius-Text-sub)", "borderColor-Text-sub": "var(--xmlui-borderColor-Text-sub)", "borderWidth-Text-sub": "var(--xmlui-borderWidth-Text-sub)", "borderStyle-Text-sub": "var(--xmlui-borderStyle-Text-sub)", "marginTop-Text-sub": "var(--xmlui-marginTop-Text-sub)", "marginBottom-Text-sub": "var(--xmlui-marginBottom-Text-sub)", "textTransform-Text-sub": "var(--xmlui-textTransform-Text-sub)", "verticalAlign-Text-sub": "var(--xmlui-verticalAlign-Text-sub)", "letterSpacing-Text-sub": "var(--xmlui-letterSpacing-Text-sub)", "fontFamily-Text-var": "var(--xmlui-fontFamily-Text-var)", "fontSize-Text-var": "var(--xmlui-fontSize-Text-var)", "fontWeight-Text-var": "var(--xmlui-fontWeight-Text-var)", "font-style-Text-var": "var(--xmlui-font-style-Text-var)", "font-stretch-Text-var": "var(--xmlui-font-stretch-Text-var)", "textDecorationLine-Text-var": "var(--xmlui-textDecorationLine-Text-var)", "textDecorationColor-Text-var": "var(--xmlui-textDecorationColor-Text-var)", "textDecorationStyle-Text-var": "var(--xmlui-textDecorationStyle-Text-var)", "textDecorationThickness-Text-var": "var(--xmlui-textDecorationThickness-Text-var)", "textUnderlineOffset-Text-var": "var(--xmlui-textUnderlineOffset-Text-var)", "lineHeight-Text-var": "var(--xmlui-lineHeight-Text-var)", "textColor-Text-var": "var(--xmlui-textColor-Text-var)", "backgroundColor-Text-var": "var(--xmlui-backgroundColor-Text-var)", "borderRadius-Text-var": "var(--xmlui-borderRadius-Text-var)", "borderColor-Text-var": "var(--xmlui-borderColor-Text-var)", "borderWidth-Text-var": "var(--xmlui-borderWidth-Text-var)", "borderStyle-Text-var": "var(--xmlui-borderStyle-Text-var)", "marginTop-Text-var": "var(--xmlui-marginTop-Text-var)", "marginBottom-Text-var": "var(--xmlui-marginBottom-Text-var)", "textTransform-Text-var": "var(--xmlui-textTransform-Text-var)", "verticalAlign-Text-var": "var(--xmlui-verticalAlign-Text-var)", "letterSpacing-Text-var": "var(--xmlui-letterSpacing-Text-var)", "fontFamily-Text-title": "var(--xmlui-fontFamily-Text-title)", "fontSize-Text-title": "var(--xmlui-fontSize-Text-title)", "fontWeight-Text-title": "var(--xmlui-fontWeight-Text-title)", "font-style-Text-title": "var(--xmlui-font-style-Text-title)", "font-stretch-Text-title": "var(--xmlui-font-stretch-Text-title)", "textDecorationLine-Text-title": "var(--xmlui-textDecorationLine-Text-title)", "textDecorationColor-Text-title": "var(--xmlui-textDecorationColor-Text-title)", "textDecorationStyle-Text-title": "var(--xmlui-textDecorationStyle-Text-title)", "textDecorationThickness-Text-title": "var(--xmlui-textDecorationThickness-Text-title)", "textUnderlineOffset-Text-title": "var(--xmlui-textUnderlineOffset-Text-title)", "lineHeight-Text-title": "var(--xmlui-lineHeight-Text-title)", "textColor-Text-title": "var(--xmlui-textColor-Text-title)", "backgroundColor-Text-title": "var(--xmlui-backgroundColor-Text-title)", "borderRadius-Text-title": "var(--xmlui-borderRadius-Text-title)", "borderColor-Text-title": "var(--xmlui-borderColor-Text-title)", "borderWidth-Text-title": "var(--xmlui-borderWidth-Text-title)", "borderStyle-Text-title": "var(--xmlui-borderStyle-Text-title)", "marginTop-Text-title": "var(--xmlui-marginTop-Text-title)", "marginBottom-Text-title": "var(--xmlui-marginBottom-Text-title)", "textTransform-Text-title": "var(--xmlui-textTransform-Text-title)", "verticalAlign-Text-title": "var(--xmlui-verticalAlign-Text-title)", "letterSpacing-Text-title": "var(--xmlui-letterSpacing-Text-title)", "fontFamily-Text-subtitle": "var(--xmlui-fontFamily-Text-subtitle)", "fontSize-Text-subtitle": "var(--xmlui-fontSize-Text-subtitle)", "fontWeight-Text-subtitle": "var(--xmlui-fontWeight-Text-subtitle)", "font-style-Text-subtitle": "var(--xmlui-font-style-Text-subtitle)", "font-stretch-Text-subtitle": "var(--xmlui-font-stretch-Text-subtitle)", "textDecorationLine-Text-subtitle": "var(--xmlui-textDecorationLine-Text-subtitle)", "textDecorationColor-Text-subtitle": "var(--xmlui-textDecorationColor-Text-subtitle)", "textDecorationStyle-Text-subtitle": "var(--xmlui-textDecorationStyle-Text-subtitle)", "textDecorationThickness-Text-subtitle": "var(--xmlui-textDecorationThickness-Text-subtitle)", "textUnderlineOffset-Text-subtitle": "var(--xmlui-textUnderlineOffset-Text-subtitle)", "lineHeight-Text-subtitle": "var(--xmlui-lineHeight-Text-subtitle)", "textColor-Text-subtitle": "var(--xmlui-textColor-Text-subtitle)", "backgroundColor-Text-subtitle": "var(--xmlui-backgroundColor-Text-subtitle)", "borderRadius-Text-subtitle": "var(--xmlui-borderRadius-Text-subtitle)", "borderColor-Text-subtitle": "var(--xmlui-borderColor-Text-subtitle)", "borderWidth-Text-subtitle": "var(--xmlui-borderWidth-Text-subtitle)", "borderStyle-Text-subtitle": "var(--xmlui-borderStyle-Text-subtitle)", "marginTop-Text-subtitle": "var(--xmlui-marginTop-Text-subtitle)", "marginBottom-Text-subtitle": "var(--xmlui-marginBottom-Text-subtitle)", "textTransform-Text-subtitle": "var(--xmlui-textTransform-Text-subtitle)", "verticalAlign-Text-subtitle": "var(--xmlui-verticalAlign-Text-subtitle)", "letterSpacing-Text-subtitle": "var(--xmlui-letterSpacing-Text-subtitle)", "fontFamily-Text-small": "var(--xmlui-fontFamily-Text-small)", "fontSize-Text-small": "var(--xmlui-fontSize-Text-small)", "fontWeight-Text-small": "var(--xmlui-fontWeight-Text-small)", "font-style-Text-small": "var(--xmlui-font-style-Text-small)", "font-stretch-Text-small": "var(--xmlui-font-stretch-Text-small)", "textDecorationLine-Text-small": "var(--xmlui-textDecorationLine-Text-small)", "textDecorationColor-Text-small": "var(--xmlui-textDecorationColor-Text-small)", "textDecorationStyle-Text-small": "var(--xmlui-textDecorationStyle-Text-small)", "textDecorationThickness-Text-small": "var(--xmlui-textDecorationThickness-Text-small)", "textUnderlineOffset-Text-small": "var(--xmlui-textUnderlineOffset-Text-small)", "lineHeight-Text-small": "var(--xmlui-lineHeight-Text-small)", "textColor-Text-small": "var(--xmlui-textColor-Text-small)", "backgroundColor-Text-small": "var(--xmlui-backgroundColor-Text-small)", "borderRadius-Text-small": "var(--xmlui-borderRadius-Text-small)", "borderColor-Text-small": "var(--xmlui-borderColor-Text-small)", "borderWidth-Text-small": "var(--xmlui-borderWidth-Text-small)", "borderStyle-Text-small": "var(--xmlui-borderStyle-Text-small)", "marginTop-Text-small": "var(--xmlui-marginTop-Text-small)", "marginBottom-Text-small": "var(--xmlui-marginBottom-Text-small)", "textTransform-Text-small": "var(--xmlui-textTransform-Text-small)", "verticalAlign-Text-small": "var(--xmlui-verticalAlign-Text-small)", "letterSpacing-Text-small": "var(--xmlui-letterSpacing-Text-small)", "fontFamily-Text-caption": "var(--xmlui-fontFamily-Text-caption)", "fontSize-Text-caption": "var(--xmlui-fontSize-Text-caption)", "fontWeight-Text-caption": "var(--xmlui-fontWeight-Text-caption)", "font-style-Text-caption": "var(--xmlui-font-style-Text-caption)", "font-stretch-Text-caption": "var(--xmlui-font-stretch-Text-caption)", "textDecorationLine-Text-caption": "var(--xmlui-textDecorationLine-Text-caption)", "textDecorationColor-Text-caption": "var(--xmlui-textDecorationColor-Text-caption)", "textDecorationStyle-Text-caption": "var(--xmlui-textDecorationStyle-Text-caption)", "textDecorationThickness-Text-caption": "var(--xmlui-textDecorationThickness-Text-caption)", "textUnderlineOffset-Text-caption": "var(--xmlui-textUnderlineOffset-Text-caption)", "lineHeight-Text-caption": "var(--xmlui-lineHeight-Text-caption)", "textColor-Text-caption": "var(--xmlui-textColor-Text-caption)", "backgroundColor-Text-caption": "var(--xmlui-backgroundColor-Text-caption)", "borderRadius-Text-caption": "var(--xmlui-borderRadius-Text-caption)", "borderColor-Text-caption": "var(--xmlui-borderColor-Text-caption)", "borderWidth-Text-caption": "var(--xmlui-borderWidth-Text-caption)", "borderStyle-Text-caption": "var(--xmlui-borderStyle-Text-caption)", "marginTop-Text-caption": "var(--xmlui-marginTop-Text-caption)", "marginBottom-Text-caption": "var(--xmlui-marginBottom-Text-caption)", "textTransform-Text-caption": "var(--xmlui-textTransform-Text-caption)", "verticalAlign-Text-caption": "var(--xmlui-verticalAlign-Text-caption)", "letterSpacing-Text-caption": "var(--xmlui-letterSpacing-Text-caption)", "fontFamily-Text-placeholder": "var(--xmlui-fontFamily-Text-placeholder)", "fontSize-Text-placeholder": "var(--xmlui-fontSize-Text-placeholder)", "fontWeight-Text-placeholder": "var(--xmlui-fontWeight-Text-placeholder)", "font-style-Text-placeholder": "var(--xmlui-font-style-Text-placeholder)", "font-stretch-Text-placeholder": "var(--xmlui-font-stretch-Text-placeholder)", "textDecorationLine-Text-placeholder": "var(--xmlui-textDecorationLine-Text-placeholder)", "textDecorationColor-Text-placeholder": "var(--xmlui-textDecorationColor-Text-placeholder)", "textDecorationStyle-Text-placeholder": "var(--xmlui-textDecorationStyle-Text-placeholder)", "textDecorationThickness-Text-placeholder": "var(--xmlui-textDecorationThickness-Text-placeholder)", "textUnderlineOffset-Text-placeholder": "var(--xmlui-textUnderlineOffset-Text-placeholder)", "lineHeight-Text-placeholder": "var(--xmlui-lineHeight-Text-placeholder)", "textColor-Text-placeholder": "var(--xmlui-textColor-Text-placeholder)", "backgroundColor-Text-placeholder": "var(--xmlui-backgroundColor-Text-placeholder)", "borderRadius-Text-placeholder": "var(--xmlui-borderRadius-Text-placeholder)", "borderColor-Text-placeholder": "var(--xmlui-borderColor-Text-placeholder)", "borderWidth-Text-placeholder": "var(--xmlui-borderWidth-Text-placeholder)", "borderStyle-Text-placeholder": "var(--xmlui-borderStyle-Text-placeholder)", "marginTop-Text-placeholder": "var(--xmlui-marginTop-Text-placeholder)", "marginBottom-Text-placeholder": "var(--xmlui-marginBottom-Text-placeholder)", "textTransform-Text-placeholder": "var(--xmlui-textTransform-Text-placeholder)", "verticalAlign-Text-placeholder": "var(--xmlui-verticalAlign-Text-placeholder)", "letterSpacing-Text-placeholder": "var(--xmlui-letterSpacing-Text-placeholder)", "fontFamily-Text-paragraph": "var(--xmlui-fontFamily-Text-paragraph)", "fontSize-Text-paragraph": "var(--xmlui-fontSize-Text-paragraph)", "fontWeight-Text-paragraph": "var(--xmlui-fontWeight-Text-paragraph)", "font-style-Text-paragraph": "var(--xmlui-font-style-Text-paragraph)", "font-stretch-Text-paragraph": "var(--xmlui-font-stretch-Text-paragraph)", "textDecorationLine-Text-paragraph": "var(--xmlui-textDecorationLine-Text-paragraph)", "textDecorationColor-Text-paragraph": "var(--xmlui-textDecorationColor-Text-paragraph)", "textDecorationStyle-Text-paragraph": "var(--xmlui-textDecorationStyle-Text-paragraph)", "textDecorationThickness-Text-paragraph": "var(--xmlui-textDecorationThickness-Text-paragraph)", "textUnderlineOffset-Text-paragraph": "var(--xmlui-textUnderlineOffset-Text-paragraph)", "lineHeight-Text-paragraph": "var(--xmlui-lineHeight-Text-paragraph)", "textColor-Text-paragraph": "var(--xmlui-textColor-Text-paragraph)", "backgroundColor-Text-paragraph": "var(--xmlui-backgroundColor-Text-paragraph)", "borderRadius-Text-paragraph": "var(--xmlui-borderRadius-Text-paragraph)", "borderColor-Text-paragraph": "var(--xmlui-borderColor-Text-paragraph)", "borderWidth-Text-paragraph": "var(--xmlui-borderWidth-Text-paragraph)", "borderStyle-Text-paragraph": "var(--xmlui-borderStyle-Text-paragraph)", "marginTop-Text-paragraph": "var(--xmlui-marginTop-Text-paragraph)", "marginBottom-Text-paragraph": "var(--xmlui-marginBottom-Text-paragraph)", "textTransform-Text-paragraph": "var(--xmlui-textTransform-Text-paragraph)", "verticalAlign-Text-paragraph": "var(--xmlui-verticalAlign-Text-paragraph)", "letterSpacing-Text-paragraph": "var(--xmlui-letterSpacing-Text-paragraph)", "fontFamily-Text-subheading": "var(--xmlui-fontFamily-Text-subheading)", "fontSize-Text-subheading": "var(--xmlui-fontSize-Text-subheading)", "fontWeight-Text-subheading": "var(--xmlui-fontWeight-Text-subheading)", "font-style-Text-subheading": "var(--xmlui-font-style-Text-subheading)", "font-stretch-Text-subheading": "var(--xmlui-font-stretch-Text-subheading)", "textDecorationLine-Text-subheading": "var(--xmlui-textDecorationLine-Text-subheading)", "textDecorationColor-Text-subheading": "var(--xmlui-textDecorationColor-Text-subheading)", "textDecorationStyle-Text-subheading": "var(--xmlui-textDecorationStyle-Text-subheading)", "textDecorationThickness-Text-subheading": "var(--xmlui-textDecorationThickness-Text-subheading)", "textUnderlineOffset-Text-subheading": "var(--xmlui-textUnderlineOffset-Text-subheading)", "lineHeight-Text-subheading": "var(--xmlui-lineHeight-Text-subheading)", "textColor-Text-subheading": "var(--xmlui-textColor-Text-subheading)", "backgroundColor-Text-subheading": "var(--xmlui-backgroundColor-Text-subheading)", "borderRadius-Text-subheading": "var(--xmlui-borderRadius-Text-subheading)", "borderColor-Text-subheading": "var(--xmlui-borderColor-Text-subheading)", "borderWidth-Text-subheading": "var(--xmlui-borderWidth-Text-subheading)", "borderStyle-Text-subheading": "var(--xmlui-borderStyle-Text-subheading)", "marginTop-Text-subheading": "var(--xmlui-marginTop-Text-subheading)", "marginBottom-Text-subheading": "var(--xmlui-marginBottom-Text-subheading)", "textTransform-Text-subheading": "var(--xmlui-textTransform-Text-subheading)", "verticalAlign-Text-subheading": "var(--xmlui-verticalAlign-Text-subheading)", "letterSpacing-Text-subheading": "var(--xmlui-letterSpacing-Text-subheading)", "fontFamily-Text-tableheading": "var(--xmlui-fontFamily-Text-tableheading)", "fontSize-Text-tableheading": "var(--xmlui-fontSize-Text-tableheading)", "fontWeight-Text-tableheading": "var(--xmlui-fontWeight-Text-tableheading)", "font-style-Text-tableheading": "var(--xmlui-font-style-Text-tableheading)", "font-stretch-Text-tableheading": "var(--xmlui-font-stretch-Text-tableheading)", "textDecorationLine-Text-tableheading": "var(--xmlui-textDecorationLine-Text-tableheading)", "textDecorationColor-Text-tableheading": "var(--xmlui-textDecorationColor-Text-tableheading)", "textDecorationStyle-Text-tableheading": "var(--xmlui-textDecorationStyle-Text-tableheading)", "textDecorationThickness-Text-tableheading": "var(--xmlui-textDecorationThickness-Text-tableheading)", "textUnderlineOffset-Text-tableheading": "var(--xmlui-textUnderlineOffset-Text-tableheading)", "lineHeight-Text-tableheading": "var(--xmlui-lineHeight-Text-tableheading)", "textColor-Text-tableheading": "var(--xmlui-textColor-Text-tableheading)", "backgroundColor-Text-tableheading": "var(--xmlui-backgroundColor-Text-tableheading)", "borderRadius-Text-tableheading": "var(--xmlui-borderRadius-Text-tableheading)", "borderColor-Text-tableheading": "var(--xmlui-borderColor-Text-tableheading)", "borderWidth-Text-tableheading": "var(--xmlui-borderWidth-Text-tableheading)", "borderStyle-Text-tableheading": "var(--xmlui-borderStyle-Text-tableheading)", "marginTop-Text-tableheading": "var(--xmlui-marginTop-Text-tableheading)", "marginBottom-Text-tableheading": "var(--xmlui-marginBottom-Text-tableheading)", "textTransform-Text-tableheading": "var(--xmlui-textTransform-Text-tableheading)", "verticalAlign-Text-tableheading": "var(--xmlui-verticalAlign-Text-tableheading)", "letterSpacing-Text-tableheading": "var(--xmlui-letterSpacing-Text-tableheading)", "fontFamily-Text-secondary": "var(--xmlui-fontFamily-Text-secondary)", "fontSize-Text-secondary": "var(--xmlui-fontSize-Text-secondary)", "fontWeight-Text-secondary": "var(--xmlui-fontWeight-Text-secondary)", "font-style-Text-secondary": "var(--xmlui-font-style-Text-secondary)", "font-stretch-Text-secondary": "var(--xmlui-font-stretch-Text-secondary)", "textDecorationLine-Text-secondary": "var(--xmlui-textDecorationLine-Text-secondary)", "textDecorationColor-Text-secondary": "var(--xmlui-textDecorationColor-Text-secondary)", "textDecorationStyle-Text-secondary": "var(--xmlui-textDecorationStyle-Text-secondary)", "textDecorationThickness-Text-secondary": "var(--xmlui-textDecorationThickness-Text-secondary)", "textUnderlineOffset-Text-secondary": "var(--xmlui-textUnderlineOffset-Text-secondary)", "lineHeight-Text-secondary": "var(--xmlui-lineHeight-Text-secondary)", "textColor-Text-secondary": "var(--xmlui-textColor-Text-secondary)", "backgroundColor-Text-secondary": "var(--xmlui-backgroundColor-Text-secondary)", "borderRadius-Text-secondary": "var(--xmlui-borderRadius-Text-secondary)", "borderColor-Text-secondary": "var(--xmlui-borderColor-Text-secondary)", "borderWidth-Text-secondary": "var(--xmlui-borderWidth-Text-secondary)", "borderStyle-Text-secondary": "var(--xmlui-borderStyle-Text-secondary)", "marginTop-Text-secondary": "var(--xmlui-marginTop-Text-secondary)", "marginBottom-Text-secondary": "var(--xmlui-marginBottom-Text-secondary)", "textTransform-Text-secondary": "var(--xmlui-textTransform-Text-secondary)", "verticalAlign-Text-secondary": "var(--xmlui-verticalAlign-Text-secondary)", "letterSpacing-Text-secondary": "var(--xmlui-letterSpacing-Text-secondary)"}'`, yu = "_text_18uo1_13", Cu = "_abbr_18uo1_23", ku = "_cite_18uo1_52", Su = "_codefence_18uo1_81", wu = "_code_18uo1_81", Hu = "_deleted_18uo1_144", Bu = "_inserted_18uo1_188", Iu = "_keyboard_18uo1_232", $u = "_marked_18uo1_261", Lu = "_mono_18uo1_305", _u = "_sample_18uo1_334", Au = "_sup_18uo1_363", Nu = "_sub_18uo1_392", Wu = "_title_18uo1_450", Ou = "_subtitle_18uo1_479", Ru = "_small_18uo1_508", zu = "_caption_18uo1_537", Vu = "_placeholder_18uo1_566", Eu = "_paragraph_18uo1_595", Pu = "_subheading_18uo1_624", Du = "_tableheading_18uo1_653", Mu = "_secondary_18uo1_682", Fu = "_strong_18uo1_711", Uu = "_truncateOverflow_18uo1_719", qu = "_preserveLinebreaks_18uo1_726", Gu = "_noEllipsis_18uo1_730", eo = {
  themeVars: Tu,
  text: yu,
  abbr: Cu,
  cite: ku,
  codefence: Su,
  code: wu,
  deleted: Hu,
  inserted: Bu,
  keyboard: Iu,
  marked: $u,
  mono: Lu,
  sample: _u,
  sup: Au,
  sub: Nu,
  var: "_var_18uo1_421",
  title: Wu,
  subtitle: Ou,
  small: Ru,
  caption: zu,
  placeholder: Vu,
  paragraph: Eu,
  subheading: Pu,
  tableheading: Du,
  secondary: Mu,
  strong: Fu,
  truncateOverflow: Uu,
  preserveLinebreaks: qu,
  noEllipsis: Gu
};
function Yu(e) {
  if (typeof e == "number") return e + "px";
  const t = e.trim();
  if (t.startsWith("var("))
    return t;
  const r = parseFloat(t), o = r.toString(), a = t.replace(o, "");
  return Number.isNaN(r) ? "0px" : a === "" ? o + "px" : t;
}
function al(e) {
  const t = e && e > 0 ? e : 0;
  return t > 1 ? {
    WebkitLineClamp: t,
    lineClamp: t,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    boxOrient: "vertical",
    whiteSpace: "initial"
  } : Rr;
}
function wi(e) {
  if (typeof e == "number")
    return e + "px";
  if (typeof e == "string" && /^\d+$/.test(e.trim())) {
    const t = parseInt(e, 10);
    if (!isNaN(t))
      return t + "px";
  }
  return e == null ? void 0 : e.toString();
}
const lo = ve(function({
  uid: t,
  variant: r,
  maxLines: o = 0,
  style: a,
  children: n,
  preserveLinebreaks: i,
  ellipses: l = !0,
  ...s
}, v) {
  const x = he(null), c = v ? sr(x, v) : x, T = ce(() => !r || !Ci[r] ? "div" : Ci[r], [r]);
  return /* @__PURE__ */ m(Tt, { children: /* @__PURE__ */ m(
    T,
    {
      ...s,
      ref: c,
      className: le([
        eo.text,
        eo[r || "default"],
        {
          [eo.truncateOverflow]: o > 0,
          [eo.preserveLinebreaks]: i,
          [eo.noEllipsis]: !l
        }
      ]),
      style: {
        ...a,
        ...al(o)
      },
      children: n
    }
  ) });
});
function so({ iconName: e, text: t, className: r }) {
  return /* @__PURE__ */ m(Tt, { children: e || t ? /* @__PURE__ */ J("div", { className: le(gu.wrapper, r), children: [
    /* @__PURE__ */ m(ke, { name: e, style: { color: "inherit" } }),
    t && /* @__PURE__ */ m("div", { style: { display: "flex", userSelect: "none" }, children: /* @__PURE__ */ m(lo, { style: { fontSize: "inherit" }, children: t }) })
  ] }) : null });
}
var Na = Pe.forwardRef((e, t) => {
  const { children: r, ...o } = e, a = Pe.Children.toArray(r), n = a.find(ju);
  if (n) {
    const i = n.props.children, l = a.map((s) => s === n ? Pe.Children.count(i) > 1 ? Pe.Children.only(null) : Pe.isValidElement(i) ? i.props.children : null : s);
    return /* @__PURE__ */ m(Wa, { ...o, ref: t, children: Pe.isValidElement(i) ? Pe.cloneElement(i, void 0, l) : null });
  }
  return /* @__PURE__ */ m(Wa, { ...o, ref: t, children: r });
});
Na.displayName = "Slot";
var Wa = Pe.forwardRef((e, t) => {
  const { children: r, ...o } = e;
  if (Pe.isValidElement(r)) {
    const a = Zu(r), n = Qu(o, r.props);
    return r.type !== Pe.Fragment && (n.ref = t ? sr(t, a) : a), Pe.cloneElement(r, n);
  }
  return Pe.Children.count(r) > 1 ? Pe.Children.only(null) : null;
});
Wa.displayName = "SlotClone";
var Xu = ({ children: e }) => /* @__PURE__ */ m(Tt, { children: e });
function ju(e) {
  return Pe.isValidElement(e) && e.type === Xu;
}
function Qu(e, t) {
  const r = { ...t };
  for (const o in t) {
    const a = e[o], n = t[o];
    /^on[A-Z]/.test(o) ? a && n ? r[o] = (...l) => {
      n(...l), a(...l);
    } : a && (r[o] = a) : o === "style" ? r[o] = { ...a, ...n } : o === "className" && (r[o] = [a, n].filter(Boolean).join(" "));
  }
  return { ...e, ...r };
}
function Zu(e) {
  var o, a;
  let t = (o = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : o.get, r = t && "isReactWarning" in t && t.isReactWarning;
  return r ? e.ref : (t = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, r = t && "isReactWarning" in t && t.isReactWarning, r ? e.props.ref : e.props.ref || e.ref);
}
const Ju = `'{"textColor-FormItemLabel": "var(--xmlui-textColor-FormItemLabel)", "fontFamily-FormItemLabel": "var(--xmlui-fontFamily-FormItemLabel)", "fontSize-FormItemLabel": "var(--xmlui-fontSize-FormItemLabel)", "fontWeight-FormItemLabel": "var(--xmlui-fontWeight-FormItemLabel)", "font-style-FormItemLabel": "var(--xmlui-font-style-FormItemLabel)", "textTransform-FormItemLabel": "var(--xmlui-textTransform-FormItemLabel)", "textColor-FormItemLabel-required": "var(--xmlui-textColor-FormItemLabel-required)", "fontSize-FormItemLabel-required": "var(--xmlui-fontSize-FormItemLabel-required)", "fontWeight-FormItemLabel-required": "var(--xmlui-fontWeight-FormItemLabel-required)", "font-style-FormItemLabel-required": "var(--xmlui-font-style-FormItemLabel-required)", "textTransform-FormItemLabel-required": "var(--xmlui-textTransform-FormItemLabel-required)", "textColor-FormItemLabel-requiredMark": "var(--xmlui-textColor-FormItemLabel-requiredMark)"}'`, Ku = "_container_27yao_13", ec = "_top_27yao_20", tc = "_end_27yao_25", rc = "_bottom_27yao_31", oc = "_start_27yao_36", ac = "_shrinkToLabel_27yao_42", ic = "_inputLabel_27yao_45", nc = "_disabled_27yao_58", lc = "_labelBreak_27yao_62", dc = "_required_27yao_66", sc = "_requiredMark_27yao_73", It = {
  themeVars: Ju,
  container: Ku,
  top: ec,
  end: tc,
  bottom: rc,
  start: oc,
  shrinkToLabel: ac,
  inputLabel: ic,
  disabled: nc,
  labelBreak: lc,
  required: dc,
  requiredMark: sc
}, uc = `'{"size-Spinner": "var(--xmlui-size-Spinner)", "thickness-Spinner": "var(--xmlui-thickness-Spinner)", "borderColor-Spinner": "var(--xmlui-borderColor-Spinner)"}'`, cc = "_fullScreenSpinnerWrapper_xat8c_54", Oa = {
  themeVars: uc,
  "lds-ring": "_lds-ring_xat8c_13",
  fullScreenSpinnerWrapper: cc
}, il = ve(function({ delay: t = 400, fullScreen: r = !1, style: o }, a) {
  const [n, i] = me(t === 0);
  ee(() => {
    const s = setTimeout(() => {
      i(!0);
    }, t);
    return () => {
      clearTimeout(s);
    };
  }, [t]);
  const l = /* @__PURE__ */ m(Tt, { children: /* @__PURE__ */ J("div", { className: Oa["lds-ring"], style: o, ref: a, children: [
    /* @__PURE__ */ m("div", {}),
    /* @__PURE__ */ m("div", {}),
    /* @__PURE__ */ m("div", {}),
    /* @__PURE__ */ m("div", {})
  ] }) });
  return n ? r ? /* @__PURE__ */ m("div", { className: Oa.fullScreenSpinnerWrapper, children: l }) : l : null;
}), mc = /^[0-9]+$/, yt = ve(function({
  id: t,
  labelPosition: r = "top",
  style: o,
  label: a,
  labelBreak: n = !0,
  labelWidth: i,
  enabled: l = !0,
  required: s = !1,
  children: v,
  validationInProgress: x = !1,
  shrinkToLabel: c = !1,
  onFocus: T,
  onBlur: b,
  labelStyle: f,
  validationResult: y,
  isInputTemplateUsed: w = !1
}, _) {
  const H = po(), I = t || H;
  return a === void 0 ? /* @__PURE__ */ m(Na, { style: o, id: I, onFocus: T, onBlur: b, ref: _, children: v }) : /* @__PURE__ */ J("div", { style: o, ref: _, children: [
    /* @__PURE__ */ J(
      "div",
      {
        className: le(It.container, {
          [It.top]: r === "top",
          [It.bottom]: r === "bottom",
          [It.start]: r === "start",
          [It.end]: r === "end",
          [It.shrinkToLabel]: c
        }),
        onFocus: T,
        onBlur: b,
        children: [
          a && /* @__PURE__ */ J(
            "label",
            {
              htmlFor: I,
              onClick: () => document.getElementById(I).focus(),
              style: {
                ...f,
                width: i && mc.test(i) ? `${i}px` : i,
                flexShrink: i !== void 0 ? 0 : void 0
              },
              className: le(It.inputLabel, {
                [It.required]: s,
                [It.disabled]: !l,
                [It.labelBreak]: n
              }),
              children: [
                a,
                " ",
                s && /* @__PURE__ */ m("span", { className: It.requiredMark, children: "*" }),
                x && /* @__PURE__ */ m(
                  il,
                  {
                    style: { height: "1em", width: "1em", marginLeft: "1em", alignSelf: "center" }
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ m(Na, { id: w ? void 0 : I, children: v })
        ]
      }
    ),
    y
  ] });
}), Ra = ve(function({
  id: t,
  type: r = "text",
  value: o = "",
  updateState: a = de,
  initialValue: n = "",
  style: i,
  maxLength: l,
  enabled: s = !0,
  placeholder: v,
  validationStatus: x = "none",
  onDidChange: c = de,
  onFocus: T = de,
  onBlur: b = de,
  registerComponentApi: f,
  startText: y,
  startIcon: w,
  endText: _,
  endIcon: H,
  autoFocus: I,
  readOnly: R,
  tabIndex: F,
  label: Z,
  labelPosition: V,
  labelWidth: W,
  labelBreak: N,
  required: O
}, h) {
  const p = he(null);
  ee(() => {
    I && setTimeout(() => {
      var M;
      (M = p.current) == null || M.focus();
    }, 0);
  }, [I]);
  const [g, C] = Ne.useState(o);
  ee(() => {
    C(o);
  }, [o]), ee(() => {
    a({ value: n }, { initial: !0 });
  }, [n, a]);
  const L = X(
    (M) => {
      C(M), a({ value: M }), c(M);
    },
    [c, a]
  ), q = X(
    (M) => {
      L(M.target.value);
    },
    [L]
  ), z = X(() => {
    T == null || T();
  }, [T]), A = X(() => {
    b == null || b();
  }, [b]), B = X(() => {
    var M;
    (M = p.current) == null || M.focus();
  }, []), P = Le((M) => {
    L(M);
  });
  return ee(() => {
    f == null || f({
      focus: B,
      setValue: P
    });
  }, [B, f, P]), /* @__PURE__ */ m(
    yt,
    {
      labelPosition: V,
      label: Z,
      labelWidth: W,
      labelBreak: N,
      required: O,
      enabled: s,
      onFocus: T,
      onBlur: b,
      style: i,
      ref: h,
      children: /* @__PURE__ */ J(
        "div",
        {
          className: le(zt.inputRoot, {
            [zt.disabled]: !s,
            [zt.readOnly]: R,
            [zt.error]: x === "error",
            [zt.warning]: x === "warning",
            [zt.valid]: x === "valid"
          }),
          tabIndex: -1,
          onFocus: B,
          children: [
            /* @__PURE__ */ m(so, { text: y, iconName: w, className: zt.adornment }),
            /* @__PURE__ */ m(
              "input",
              {
                id: t,
                type: r,
                className: le(zt.input, { [zt.readOnly]: R }),
                disabled: !s,
                value: g,
                maxLength: l,
                placeholder: v,
                onChange: q,
                onFocus: z,
                onBlur: A,
                ref: p,
                readOnly: R,
                autoFocus: I,
                tabIndex: s ? F : -1,
                required: O
              }
            ),
            /* @__PURE__ */ m(so, { text: _, iconName: H, className: zt.adornment })
          ]
        }
      )
    }
  );
}), Br = "TextBox", nl = k({
  status: "experimental",
  description: `The \`${Br}\` is an input component that allows users to input and edit textual data.`,
  props: {
    placeholder: Er(),
    initialValue: St(),
    label: qe(),
    labelPosition: Dt("top"),
    labelWidth: Zt(Br),
    labelBreak: Jt(Br),
    maxLength: Ao(),
    autoFocus: rt(),
    required: Nt(),
    readOnly: _t(),
    enabled: Ze(),
    validationStatus: At(),
    startText: Ka(),
    startIcon: ei(),
    endText: ti(),
    endIcon: ri()
  },
  events: {
    gotFocus: Ct(Br),
    lostFocus: kt(Br),
    didChange: tt(Br)
  },
  apis: {
    focus: er(Br),
    value: u(
      "You can query the component's value. If no value is set, it will retrieve `undefined`."
    ),
    setValue: Kt()
  },
  themeVars: j(zt.themeVars),
  defaultThemeVars: {
    // TODO: When FormItem is themed, move these defaults there
    "borderRadius-Input": "$borderRadius",
    "textColor-Input": "$textColor-primary",
    "backgroundColor-Input--disabled": "$backgroundColor--disabled",
    "borderWidth-Input": "1px",
    "minHeight-Input": "39px",
    "padding-Input": "$space-2",
    "borderStyle-Input": "solid",
    "borderColor-Input--disabled": "$borderColor--disabled",
    "textColor-Input--disabled": "$textColor--disabled",
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
}), pc = k({
  ...nl,
  description: "The `Password` component is a specialized version of the `TextBox` component that allows users to input and edit passwords."
});
function hc(e) {
  return typeof e == "string" && (e == null ? void 0 : e.startsWith("$"));
}
const Hi = "Theme", xc = k({
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
}), bc = `'{"width-navPanel-App": "var(--xmlui-width-navPanel-App)", "boxShadow-header-App": "var(--xmlui-boxShadow-header-App)", "boxShadow-pages-App": "var(--xmlui-boxShadow-pages-App)", "maxWidth-content-App": "var(--xmlui-maxWidth-content-App)", "backgroundColor-AppHeader": "var(--xmlui-backgroundColor-AppHeader)", "borderBottom-AppHeader": "var(--xmlui-borderBottom-AppHeader)", "scroll-padding-block-Pages": "var(--xmlui-scroll-padding-block-Pages)"}'`, vc = {
  themeVars: bc
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
Qt(null);
const gc = Ne.createContext(null), Tc = `'{"padding-AppHeader": "var(--xmlui-padding-AppHeader)", "paddingHorizontal-AppHeader": "var(--xmlui-paddingHorizontal-AppHeader, var(--xmlui-padding-AppHeader))", "paddingVertical-AppHeader": "var(--xmlui-paddingVertical-AppHeader, var(--xmlui-padding-AppHeader))", "paddingLeft-AppHeader": "var(--xmlui-paddingLeft-AppHeader, var(--xmlui-paddingHorizontal-AppHeader, var(--xmlui-padding-AppHeader)))", "paddingRight-AppHeader": "var(--xmlui-paddingRight-AppHeader, var(--xmlui-paddingHorizontal-AppHeader, var(--xmlui-padding-AppHeader)))", "paddingTop-AppHeader": "var(--xmlui-paddingTop-AppHeader, var(--xmlui-paddingVertical-AppHeader, var(--xmlui-padding-AppHeader)))", "paddingBottom-AppHeader": "var(--xmlui-paddingBottom-AppHeader, var(--xmlui-paddingVertical-AppHeader, var(--xmlui-padding-AppHeader)))", "padding-logo-AppHeader": "var(--xmlui-padding-logo-AppHeader)", "paddingHorizontal-logo-AppHeader": "var(--xmlui-paddingHorizontal-logo-AppHeader, var(--xmlui-padding-logo-AppHeader))", "paddingVertical-logo-AppHeader": "var(--xmlui-paddingVertical-logo-AppHeader, var(--xmlui-padding-logo-AppHeader))", "paddingLeft-logo-AppHeader": "var(--xmlui-paddingLeft-logo-AppHeader, var(--xmlui-paddingHorizontal-logo-AppHeader, var(--xmlui-padding-logo-AppHeader)))", "paddingRight-logo-AppHeader": "var(--xmlui-paddingRight-logo-AppHeader, var(--xmlui-paddingHorizontal-logo-AppHeader, var(--xmlui-padding-logo-AppHeader)))", "paddingTop-logo-AppHeader": "var(--xmlui-paddingTop-logo-AppHeader, var(--xmlui-paddingVertical-logo-AppHeader, var(--xmlui-padding-logo-AppHeader)))", "paddingBottom-logo-AppHeader": "var(--xmlui-paddingBottom-logo-AppHeader, var(--xmlui-paddingVertical-logo-AppHeader, var(--xmlui-padding-logo-AppHeader)))", "border-AppHeader": "var(--xmlui-border-AppHeader)", "borderHorizontal-AppHeader": "var(--xmlui-borderHorizontal-AppHeader, var(--xmlui-border-AppHeader))", "borderVertical-AppHeader": "var(--xmlui-borderVertical-AppHeader, var(--xmlui-border-AppHeader))", "borderLeft-AppHeader": "var(--xmlui-borderLeft-AppHeader, var(--xmlui-borderHorizontal-AppHeader, var(--xmlui-border-AppHeader)))", "borderRight-AppHeader": "var(--xmlui-borderRight-AppHeader, var(--xmlui-borderHorizontal-AppHeader, var(--xmlui-border-AppHeader)))", "borderTop-AppHeader": "var(--xmlui-borderTop-AppHeader, var(--xmlui-borderVertical-AppHeader, var(--xmlui-border-AppHeader)))", "borderBottom-AppHeader": "var(--xmlui-borderBottom-AppHeader, var(--xmlui-borderVertical-AppHeader, var(--xmlui-border-AppHeader)))", "borderWidth-AppHeader": "var(--xmlui-borderWidth-AppHeader)", "borderHorizontalWidth-AppHeader": "var(--xmlui-borderHorizontalWidth-AppHeader, var(--xmlui-borderWidth-AppHeader))", "borderLeftWidth-AppHeader": "var(--xmlui-borderLeftWidth-AppHeader, var(--xmlui-borderHorizontalWidth-AppHeader, var(--xmlui-borderWidth-AppHeader)))", "borderRightWidth-AppHeader": "var(--xmlui-borderRightWidth-AppHeader, var(--xmlui-borderHorizontalWidth-AppHeader, var(--xmlui-borderWidth-AppHeader)))", "borderVerticalWidth-AppHeader": "var(--xmlui-borderVerticalWidth-AppHeader, var(--xmlui-borderWidth-AppHeader))", "borderTopWidth-AppHeader": "var(--xmlui-borderTopWidth-AppHeader, var(--xmlui-borderVerticalWidth-AppHeader, var(--xmlui-borderWidth-AppHeader)))", "borderBottomWidth-AppHeader": "var(--xmlui-borderBottomWidth-AppHeader, var(--xmlui-borderVerticalWidth-AppHeader, var(--xmlui-borderWidth-AppHeader)))", "borderStyle-AppHeader": "var(--xmlui-borderStyle-AppHeader)", "borderHorizontalStyle-AppHeader": "var(--xmlui-borderHorizontalStyle-AppHeader, var(--xmlui-borderStyle-AppHeader))", "borderLeftStyle-AppHeader": "var(--xmlui-borderLeftStyle-AppHeader, var(--xmlui-borderHorizontalStyle-AppHeader, var(--xmlui-borderStyle-AppHeader)))", "borderRightStyle-AppHeader": "var(--xmlui-borderRightStyle-AppHeader, var(--xmlui-borderHorizontalStyle-AppHeader, var(--xmlui-borderStyle-AppHeader)))", "borderVerticalStyle-AppHeader": "var(--xmlui-borderVerticalStyle-AppHeader, var(--xmlui-borderStyle-AppHeader))", "borderTopStyle-AppHeader": "var(--xmlui-borderTopStyle-AppHeader, var(--xmlui-borderVerticalStyle-AppHeader, var(--xmlui-borderStyle-AppHeader)))", "borderBottomStyle-AppHeader": "var(--xmlui-borderBottomStyle-AppHeader, var(--xmlui-borderVerticalStyle-AppHeader, var(--xmlui-borderStyle-AppHeader)))", "borderColor-AppHeader": "var(--xmlui-borderColor-AppHeader)", "borderHorizontalColor-AppHeader": "var(--xmlui-borderHorizontalColor-AppHeader, var(--xmlui-borderColor-AppHeader))", "borderLeftColor-AppHeader": "var(--xmlui-borderLeftColor-AppHeader, var(--xmlui-borderHorizontalColor-AppHeader, var(--xmlui-borderColor-AppHeader)))", "borderRightColor-AppHeader": "var(--xmlui-borderRightColor-AppHeader, var(--xmlui-borderHorizontalColor-AppHeader, var(--xmlui-borderColor-AppHeader)))", "borderVerticalColor-AppHeader": "var(--xmlui-borderVerticalColor-AppHeader, var(--xmlui-borderColor-AppHeader))", "borderTopColor-AppHeader": "var(--xmlui-borderTopColor-AppHeader, var(--xmlui-borderVerticalColor-AppHeader, var(--xmlui-borderColor-AppHeader)))", "borderBottomColor-AppHeader": "var(--xmlui-borderBottomColor-AppHeader, var(--xmlui-borderVerticalColor-AppHeader, var(--xmlui-borderColor-AppHeader)))", "radius-start-start-AppHeader": "var(--xmlui-radius-start-start-AppHeader, var(--xmlui-borderRadius-AppHeader))", "radius-start-end-AppHeader": "var(--xmlui-radius-start-end-AppHeader, var(--xmlui-borderRadius-AppHeader))", "radius-end-start-AppHeader": "var(--xmlui-radius-end-start-AppHeader, var(--xmlui-borderRadius-AppHeader))", "radius-end-end-AppHeader": "var(--xmlui-radius-end-end-AppHeader, var(--xmlui-borderRadius-AppHeader))", "width-logo-AppHeader": "var(--xmlui-width-logo-AppHeader)", "align-content-AppHeader": "var(--xmlui-align-content-AppHeader)", "height-AppHeader": "var(--xmlui-height-AppHeader)", "backgroundColor-AppHeader": "var(--xmlui-backgroundColor-AppHeader)", "maxWidth-content-AppHeader": "var(--xmlui-maxWidth-content-AppHeader)"}'`, yc = {
  themeVars: Tc
}, Cc = '"[]"', kc = {
  themeVars: Cc
}, Sc = `'{"padding-NavLink": "var(--xmlui-padding-NavLink)", "paddingHorizontal-NavLink": "var(--xmlui-paddingHorizontal-NavLink, var(--xmlui-padding-NavLink))", "paddingVertical-NavLink": "var(--xmlui-paddingVertical-NavLink, var(--xmlui-padding-NavLink))", "paddingLeft-NavLink": "var(--xmlui-paddingLeft-NavLink, var(--xmlui-paddingHorizontal-NavLink, var(--xmlui-padding-NavLink)))", "paddingRight-NavLink": "var(--xmlui-paddingRight-NavLink, var(--xmlui-paddingHorizontal-NavLink, var(--xmlui-padding-NavLink)))", "paddingTop-NavLink": "var(--xmlui-paddingTop-NavLink, var(--xmlui-paddingVertical-NavLink, var(--xmlui-padding-NavLink)))", "paddingBottom-NavLink": "var(--xmlui-paddingBottom-NavLink, var(--xmlui-paddingVertical-NavLink, var(--xmlui-padding-NavLink)))", "border-NavLink": "var(--xmlui-border-NavLink)", "borderHorizontal-NavLink": "var(--xmlui-borderHorizontal-NavLink, var(--xmlui-border-NavLink))", "borderVertical-NavLink": "var(--xmlui-borderVertical-NavLink, var(--xmlui-border-NavLink))", "borderLeft-NavLink": "var(--xmlui-borderLeft-NavLink, var(--xmlui-borderHorizontal-NavLink, var(--xmlui-border-NavLink)))", "borderRight-NavLink": "var(--xmlui-borderRight-NavLink, var(--xmlui-borderHorizontal-NavLink, var(--xmlui-border-NavLink)))", "borderTop-NavLink": "var(--xmlui-borderTop-NavLink, var(--xmlui-borderVertical-NavLink, var(--xmlui-border-NavLink)))", "borderBottom-NavLink": "var(--xmlui-borderBottom-NavLink, var(--xmlui-borderVertical-NavLink, var(--xmlui-border-NavLink)))", "borderWidth-NavLink": "var(--xmlui-borderWidth-NavLink)", "borderHorizontalWidth-NavLink": "var(--xmlui-borderHorizontalWidth-NavLink, var(--xmlui-borderWidth-NavLink))", "borderLeftWidth-NavLink": "var(--xmlui-borderLeftWidth-NavLink, var(--xmlui-borderHorizontalWidth-NavLink, var(--xmlui-borderWidth-NavLink)))", "borderRightWidth-NavLink": "var(--xmlui-borderRightWidth-NavLink, var(--xmlui-borderHorizontalWidth-NavLink, var(--xmlui-borderWidth-NavLink)))", "borderVerticalWidth-NavLink": "var(--xmlui-borderVerticalWidth-NavLink, var(--xmlui-borderWidth-NavLink))", "borderTopWidth-NavLink": "var(--xmlui-borderTopWidth-NavLink, var(--xmlui-borderVerticalWidth-NavLink, var(--xmlui-borderWidth-NavLink)))", "borderBottomWidth-NavLink": "var(--xmlui-borderBottomWidth-NavLink, var(--xmlui-borderVerticalWidth-NavLink, var(--xmlui-borderWidth-NavLink)))", "borderStyle-NavLink": "var(--xmlui-borderStyle-NavLink)", "borderHorizontalStyle-NavLink": "var(--xmlui-borderHorizontalStyle-NavLink, var(--xmlui-borderStyle-NavLink))", "borderLeftStyle-NavLink": "var(--xmlui-borderLeftStyle-NavLink, var(--xmlui-borderHorizontalStyle-NavLink, var(--xmlui-borderStyle-NavLink)))", "borderRightStyle-NavLink": "var(--xmlui-borderRightStyle-NavLink, var(--xmlui-borderHorizontalStyle-NavLink, var(--xmlui-borderStyle-NavLink)))", "borderVerticalStyle-NavLink": "var(--xmlui-borderVerticalStyle-NavLink, var(--xmlui-borderStyle-NavLink))", "borderTopStyle-NavLink": "var(--xmlui-borderTopStyle-NavLink, var(--xmlui-borderVerticalStyle-NavLink, var(--xmlui-borderStyle-NavLink)))", "borderBottomStyle-NavLink": "var(--xmlui-borderBottomStyle-NavLink, var(--xmlui-borderVerticalStyle-NavLink, var(--xmlui-borderStyle-NavLink)))", "borderColor-NavLink": "var(--xmlui-borderColor-NavLink)", "borderHorizontalColor-NavLink": "var(--xmlui-borderHorizontalColor-NavLink, var(--xmlui-borderColor-NavLink))", "borderLeftColor-NavLink": "var(--xmlui-borderLeftColor-NavLink, var(--xmlui-borderHorizontalColor-NavLink, var(--xmlui-borderColor-NavLink)))", "borderRightColor-NavLink": "var(--xmlui-borderRightColor-NavLink, var(--xmlui-borderHorizontalColor-NavLink, var(--xmlui-borderColor-NavLink)))", "borderVerticalColor-NavLink": "var(--xmlui-borderVerticalColor-NavLink, var(--xmlui-borderColor-NavLink))", "borderTopColor-NavLink": "var(--xmlui-borderTopColor-NavLink, var(--xmlui-borderVerticalColor-NavLink, var(--xmlui-borderColor-NavLink)))", "borderBottomColor-NavLink": "var(--xmlui-borderBottomColor-NavLink, var(--xmlui-borderVerticalColor-NavLink, var(--xmlui-borderColor-NavLink)))", "radius-start-start-NavLink": "var(--xmlui-radius-start-start-NavLink, var(--xmlui-borderRadius-NavLink))", "radius-start-end-NavLink": "var(--xmlui-radius-start-end-NavLink, var(--xmlui-borderRadius-NavLink))", "radius-end-start-NavLink": "var(--xmlui-radius-end-start-NavLink, var(--xmlui-borderRadius-NavLink))", "radius-end-end-NavLink": "var(--xmlui-radius-end-end-NavLink, var(--xmlui-borderRadius-NavLink))", "backgroundColor-NavLink": "var(--xmlui-backgroundColor-NavLink)", "backgroundColor-NavLink--hover": "var(--xmlui-backgroundColor-NavLink--hover)", "backgroundColor-NavLink--hover--active": "var(--xmlui-backgroundColor-NavLink--hover--active)", "backgroundColor-NavLink--active": "var(--xmlui-backgroundColor-NavLink--active)", "backgroundColor-NavLink--pressed": "var(--xmlui-backgroundColor-NavLink--pressed)", "backgroundColor-NavLink--pressed--active": "var(--xmlui-backgroundColor-NavLink--pressed--active)", "fontSize-NavLink": "var(--xmlui-fontSize-NavLink)", "textColor-NavLink": "var(--xmlui-textColor-NavLink)", "textColor-NavLink--hover": "var(--xmlui-textColor-NavLink--hover)", "textColor-NavLink--active": "var(--xmlui-textColor-NavLink--active)", "textColor-NavLink--hover--active": "var(--xmlui-textColor-NavLink--hover--active)", "textColor-NavLink--pressed": "var(--xmlui-textColor-NavLink--pressed)", "textColor-NavLink--pressed--active": "var(--xmlui-textColor-NavLink--pressed--active)", "color-icon-NavLink": "var(--xmlui-color-icon-NavLink)", "fontFamily-NavLink": "var(--xmlui-fontFamily-NavLink)", "fontWeight-NavLink": "var(--xmlui-fontWeight-NavLink)", "fontWeight-NavLink--pressed": "var(--xmlui-fontWeight-NavLink--pressed)", "fontWeight-NavLink--active": "var(--xmlui-fontWeight-NavLink--active)", "borderRadius-indicator-NavLink": "var(--xmlui-borderRadius-indicator-NavLink)", "thickness-indicator-NavLink": "var(--xmlui-thickness-indicator-NavLink)", "color-indicator-NavLink": "var(--xmlui-color-indicator-NavLink)", "color-indicator-NavLink--hover": "var(--xmlui-color-indicator-NavLink--hover)", "color-indicator-NavLink--active": "var(--xmlui-color-indicator-NavLink--active)", "color-indicator-NavLink--pressed": "var(--xmlui-color-indicator-NavLink--pressed)", "outlineWidth-NavLink--focus": "var(--xmlui-outlineWidth-NavLink--focus)", "outlineColor-NavLink--focus": "var(--xmlui-outlineColor-NavLink--focus)", "outlineStyle-NavLink--focus": "var(--xmlui-outlineStyle-NavLink--focus)", "outlineOffset-NavLink--focus": "var(--xmlui-outlineOffset-NavLink--focus)"}'`, wc = {
  themeVars: Sc
};
function Hc(e) {
  return !e || typeof e == "string" || typeof e == "number" ? e : e.queryParams !== void 0 ? {
    ...e,
    search: new URLSearchParams(ed(e.queryParams, td)).toString()
  } : e;
}
const Bc = `'{"border-NavPanel": "var(--xmlui-border-NavPanel)", "borderHorizontal-NavPanel": "var(--xmlui-borderHorizontal-NavPanel, var(--xmlui-border-NavPanel))", "borderVertical-NavPanel": "var(--xmlui-borderVertical-NavPanel, var(--xmlui-border-NavPanel))", "borderLeft-NavPanel": "var(--xmlui-borderLeft-NavPanel, var(--xmlui-borderHorizontal-NavPanel, var(--xmlui-border-NavPanel)))", "borderRight-NavPanel": "var(--xmlui-borderRight-NavPanel, var(--xmlui-borderHorizontal-NavPanel, var(--xmlui-border-NavPanel)))", "borderTop-NavPanel": "var(--xmlui-borderTop-NavPanel, var(--xmlui-borderVertical-NavPanel, var(--xmlui-border-NavPanel)))", "borderBottom-NavPanel": "var(--xmlui-borderBottom-NavPanel, var(--xmlui-borderVertical-NavPanel, var(--xmlui-border-NavPanel)))", "borderWidth-NavPanel": "var(--xmlui-borderWidth-NavPanel)", "borderHorizontalWidth-NavPanel": "var(--xmlui-borderHorizontalWidth-NavPanel, var(--xmlui-borderWidth-NavPanel))", "borderLeftWidth-NavPanel": "var(--xmlui-borderLeftWidth-NavPanel, var(--xmlui-borderHorizontalWidth-NavPanel, var(--xmlui-borderWidth-NavPanel)))", "borderRightWidth-NavPanel": "var(--xmlui-borderRightWidth-NavPanel, var(--xmlui-borderHorizontalWidth-NavPanel, var(--xmlui-borderWidth-NavPanel)))", "borderVerticalWidth-NavPanel": "var(--xmlui-borderVerticalWidth-NavPanel, var(--xmlui-borderWidth-NavPanel))", "borderTopWidth-NavPanel": "var(--xmlui-borderTopWidth-NavPanel, var(--xmlui-borderVerticalWidth-NavPanel, var(--xmlui-borderWidth-NavPanel)))", "borderBottomWidth-NavPanel": "var(--xmlui-borderBottomWidth-NavPanel, var(--xmlui-borderVerticalWidth-NavPanel, var(--xmlui-borderWidth-NavPanel)))", "borderStyle-NavPanel": "var(--xmlui-borderStyle-NavPanel)", "borderHorizontalStyle-NavPanel": "var(--xmlui-borderHorizontalStyle-NavPanel, var(--xmlui-borderStyle-NavPanel))", "borderLeftStyle-NavPanel": "var(--xmlui-borderLeftStyle-NavPanel, var(--xmlui-borderHorizontalStyle-NavPanel, var(--xmlui-borderStyle-NavPanel)))", "borderRightStyle-NavPanel": "var(--xmlui-borderRightStyle-NavPanel, var(--xmlui-borderHorizontalStyle-NavPanel, var(--xmlui-borderStyle-NavPanel)))", "borderVerticalStyle-NavPanel": "var(--xmlui-borderVerticalStyle-NavPanel, var(--xmlui-borderStyle-NavPanel))", "borderTopStyle-NavPanel": "var(--xmlui-borderTopStyle-NavPanel, var(--xmlui-borderVerticalStyle-NavPanel, var(--xmlui-borderStyle-NavPanel)))", "borderBottomStyle-NavPanel": "var(--xmlui-borderBottomStyle-NavPanel, var(--xmlui-borderVerticalStyle-NavPanel, var(--xmlui-borderStyle-NavPanel)))", "borderColor-NavPanel": "var(--xmlui-borderColor-NavPanel)", "borderHorizontalColor-NavPanel": "var(--xmlui-borderHorizontalColor-NavPanel, var(--xmlui-borderColor-NavPanel))", "borderLeftColor-NavPanel": "var(--xmlui-borderLeftColor-NavPanel, var(--xmlui-borderHorizontalColor-NavPanel, var(--xmlui-borderColor-NavPanel)))", "borderRightColor-NavPanel": "var(--xmlui-borderRightColor-NavPanel, var(--xmlui-borderHorizontalColor-NavPanel, var(--xmlui-borderColor-NavPanel)))", "borderVerticalColor-NavPanel": "var(--xmlui-borderVerticalColor-NavPanel, var(--xmlui-borderColor-NavPanel))", "borderTopColor-NavPanel": "var(--xmlui-borderTopColor-NavPanel, var(--xmlui-borderVerticalColor-NavPanel, var(--xmlui-borderColor-NavPanel)))", "borderBottomColor-NavPanel": "var(--xmlui-borderBottomColor-NavPanel, var(--xmlui-borderVerticalColor-NavPanel, var(--xmlui-borderColor-NavPanel)))", "radius-start-start-NavPanel": "var(--xmlui-radius-start-start-NavPanel, var(--xmlui-borderRadius-NavPanel))", "radius-start-end-NavPanel": "var(--xmlui-radius-start-end-NavPanel, var(--xmlui-borderRadius-NavPanel))", "radius-end-start-NavPanel": "var(--xmlui-radius-end-start-NavPanel, var(--xmlui-borderRadius-NavPanel))", "radius-end-end-NavPanel": "var(--xmlui-radius-end-end-NavPanel, var(--xmlui-borderRadius-NavPanel))", "backgroundColor-NavPanel": "var(--xmlui-backgroundColor-NavPanel)", "boxShadow-NavPanel": "var(--xmlui-boxShadow-NavPanel)", "height-AppHeader": "var(--xmlui-height-AppHeader)", "maxWidth-content-App": "var(--xmlui-maxWidth-content-App)", "padding-NavPanel": "var(--xmlui-padding-NavPanel)", "paddingHorizontal-NavPanel": "var(--xmlui-paddingHorizontal-NavPanel)", "paddingVertical-NavPanel": "var(--xmlui-paddingVertical-NavPanel, var(--xmlui-padding-NavPanel))", "paddingLeft-NavPanel": "var(--xmlui-paddingLeft-NavPanel, var(--xmlui-paddingHorizontal-NavPanel, var(--xmlui-padding-NavPanel)))", "paddingRight-NavPanel": "var(--xmlui-paddingRight-NavPanel, var(--xmlui-paddingHorizontal-NavPanel, var(--xmlui-padding-NavPanel)))", "paddingTop-NavPanel": "var(--xmlui-paddingTop-NavPanel, var(--xmlui-paddingVertical-NavPanel, var(--xmlui-padding-NavPanel)))", "paddingBottom-NavPanel": "var(--xmlui-paddingBottom-NavPanel, var(--xmlui-paddingVertical-NavPanel, var(--xmlui-padding-NavPanel)))", "padding-logo-NavPanel": "var(--xmlui-padding-logo-NavPanel)", "paddingHorizontal-logo-NavPanel": "var(--xmlui-paddingHorizontal-logo-NavPanel)", "paddingVertical-logo-NavPanel": "var(--xmlui-paddingVertical-logo-NavPanel)", "paddingLeft-logo-NavPanel": "var(--xmlui-paddingLeft-logo-NavPanel, var(--xmlui-paddingHorizontal-logo-NavPanel, var(--xmlui-padding-logo-NavPanel)))", "paddingRight-logo-NavPanel": "var(--xmlui-paddingRight-logo-NavPanel, var(--xmlui-paddingHorizontal-logo-NavPanel, var(--xmlui-padding-logo-NavPanel)))", "paddingTop-logo-NavPanel": "var(--xmlui-paddingTop-logo-NavPanel, var(--xmlui-paddingVertical-logo-NavPanel, var(--xmlui-padding-logo-NavPanel)))", "paddingBottom-logo-NavPanel": "var(--xmlui-paddingBottom-logo-NavPanel, var(--xmlui-paddingVertical-logo-NavPanel, var(--xmlui-padding-logo-NavPanel)))", "marginBottom-logo-NavPanel": "var(--xmlui-marginBottom-logo-NavPanel)", "paddingVertical-AppHeader": "var(--xmlui-paddingVertical-AppHeader)", "align-content-AppHeader": "var(--xmlui-align-content-AppHeader)"}'`, Ic = {
  themeVars: Bc
}, Ir = "App", $c = k({
  status: "stable",
  description: `The \`${Ir}\` component provides a UI frame for XMLUI apps. According to predefined (and run-time configurable) structure templates, \`${Ir}\` allows you to display your preferred layout.`,
  props: {
    layout: {
      description: "This property sets the layout template of the app. This setting determines the position and size of the app parts (such as header, navigation bar, footer, etc.) and the app's scroll behavior.",
      availableValues: fc
    },
    loggedInUser: {
      description: "Stores information about the currently logged in user.",
      valueType: "string"
    },
    logoTemplate: Ve("Optional template of the app logo"),
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
    ready: u(`This event fires when the \`${Ir}\` component finishes rendering on the page.`)
  },
  themeVars: j(vc.themeVars),
  defaultThemeVars: {
    [`width-navPanel-${Ir}`]: "$space-64",
    [`maxWidth-content-${Ir}`]: "$maxWidth-content",
    [`boxShadow-header-${Ir}`]: "$boxShadow-spread",
    [`boxShadow-pages-${Ir}`]: "$boxShadow-spread",
    "scroll-padding-block-Pages": "$space-4",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
});
function za(e, t) {
  return {
    [`paddingLeft-${e}`]: (t == null ? void 0 : t.left) ?? `$paddingHorizontal-${e}`,
    [`paddingRight-${e}`]: (t == null ? void 0 : t.right) ?? `$paddingHorizontal-${e}`,
    [`paddingTop-${e}`]: (t == null ? void 0 : t.top) ?? `$paddingVertical-${e}`,
    [`paddingBottom-${e}`]: (t == null ? void 0 : t.bottom) ?? `$paddingVertical-${e}`,
    [`paddingHorizontal-${e}`]: (t == null ? void 0 : t.horizontal) ?? "",
    [`paddingVertical-${e}`]: (t == null ? void 0 : t.vertical) ?? "",
    [`padding-${e}`]: (t == null ? void 0 : t.all) ?? `$paddingTop-${e} $paddingRight-${e} $paddingBottom-${e} $paddingLeft-${e}`
  };
}
const Wt = "AppHeader", Lc = k({
  status: "experimental",
  description: `\`${Wt}\` is a placeholder within \`App\` to define a custom application header.`,
  props: {
    profileMenuTemplate: Ve(
      `This property makes the profile menu slot of the \`${Wt}\` component customizable.`
    ),
    logoTemplate: Ve(
      "This property defines the template to use for the logo. With this property, you can construct your custom logo instead of using a single image."
    ),
    titleTemplate: Ve(
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
  themeVars: j(yc.themeVars),
  themeVarDescriptions: {
    [`width-logo-${Wt}`]: "Sets the width of the displayed logo"
  },
  defaultThemeVars: {
    [`height-${Wt}`]: "$space-14",
    [`maxWidth-content-${Wt}`]: "$maxWidth-content-App",
    [`borderBottom-${Wt}`]: "1px solid $borderColor",
    ...za(`logo-${Wt}`, { horizontal: "$space-0", vertical: "$space-4" }),
    ...za(Wt, { horizontal: "$space-4", vertical: "$space-0" }),
    [`borderRadius-${Wt}`]: "0px",
    light: {
      [`backgroundColor-${Wt}`]: "white"
    },
    dark: {
      [`backgroundColor-${Wt}`]: "$color-surface-900"
    }
  }
}), To = "AppState", _c = k({
  description: `${To} is a functional component (without a visible user interface) that helps store and manage the app's state.`,
  props: {
    bucket: {
      description: `This property is the identifier of the bucket to which the \`${To}\` instance is bound. Multiple \`${To}\` instances with the same bucket will share the same state object: any of them updating the state will cause the other instances to view the new, updated state.`,
      valueType: "string",
      defaultValue: "default"
    },
    initialValue: {
      description: `This property contains the initial state value. Though you can use multiple \`${To}\`component instances for the same bucket with their \`initialValue\` set, it may result in faulty app logic. When xmlui instantiates an \`${To}\` with an explicit initial value, that value is immediately set. Multiple initial values may result in undesired initialization.`
    }
  },
  apis: {
    update: u(
      "This method updates the application state object bound to the `AppState` instance. The function's single argument is an object that specifies the new state value."
    )
  },
  nonVisual: !0
}), Ac = `'{"border-Avatar": "var(--xmlui-border-Avatar)", "borderHorizontal-Avatar": "var(--xmlui-borderHorizontal-Avatar, var(--xmlui-border-Avatar))", "borderVertical-Avatar": "var(--xmlui-borderVertical-Avatar, var(--xmlui-border-Avatar))", "borderLeft-Avatar": "var(--xmlui-borderLeft-Avatar, var(--xmlui-borderHorizontal-Avatar, var(--xmlui-border-Avatar)))", "borderRight-Avatar": "var(--xmlui-borderRight-Avatar, var(--xmlui-borderHorizontal-Avatar, var(--xmlui-border-Avatar)))", "borderTop-Avatar": "var(--xmlui-borderTop-Avatar, var(--xmlui-borderVertical-Avatar, var(--xmlui-border-Avatar)))", "borderBottom-Avatar": "var(--xmlui-borderBottom-Avatar, var(--xmlui-borderVertical-Avatar, var(--xmlui-border-Avatar)))", "borderWidth-Avatar": "var(--xmlui-borderWidth-Avatar)", "borderHorizontalWidth-Avatar": "var(--xmlui-borderHorizontalWidth-Avatar, var(--xmlui-borderWidth-Avatar))", "borderLeftWidth-Avatar": "var(--xmlui-borderLeftWidth-Avatar, var(--xmlui-borderHorizontalWidth-Avatar, var(--xmlui-borderWidth-Avatar)))", "borderRightWidth-Avatar": "var(--xmlui-borderRightWidth-Avatar, var(--xmlui-borderHorizontalWidth-Avatar, var(--xmlui-borderWidth-Avatar)))", "borderVerticalWidth-Avatar": "var(--xmlui-borderVerticalWidth-Avatar, var(--xmlui-borderWidth-Avatar))", "borderTopWidth-Avatar": "var(--xmlui-borderTopWidth-Avatar, var(--xmlui-borderVerticalWidth-Avatar, var(--xmlui-borderWidth-Avatar)))", "borderBottomWidth-Avatar": "var(--xmlui-borderBottomWidth-Avatar, var(--xmlui-borderVerticalWidth-Avatar, var(--xmlui-borderWidth-Avatar)))", "borderStyle-Avatar": "var(--xmlui-borderStyle-Avatar)", "borderHorizontalStyle-Avatar": "var(--xmlui-borderHorizontalStyle-Avatar, var(--xmlui-borderStyle-Avatar))", "borderLeftStyle-Avatar": "var(--xmlui-borderLeftStyle-Avatar, var(--xmlui-borderHorizontalStyle-Avatar, var(--xmlui-borderStyle-Avatar)))", "borderRightStyle-Avatar": "var(--xmlui-borderRightStyle-Avatar, var(--xmlui-borderHorizontalStyle-Avatar, var(--xmlui-borderStyle-Avatar)))", "borderVerticalStyle-Avatar": "var(--xmlui-borderVerticalStyle-Avatar, var(--xmlui-borderStyle-Avatar))", "borderTopStyle-Avatar": "var(--xmlui-borderTopStyle-Avatar, var(--xmlui-borderVerticalStyle-Avatar, var(--xmlui-borderStyle-Avatar)))", "borderBottomStyle-Avatar": "var(--xmlui-borderBottomStyle-Avatar, var(--xmlui-borderVerticalStyle-Avatar, var(--xmlui-borderStyle-Avatar)))", "borderColor-Avatar": "var(--xmlui-borderColor-Avatar)", "borderHorizontalColor-Avatar": "var(--xmlui-borderHorizontalColor-Avatar, var(--xmlui-borderColor-Avatar))", "borderLeftColor-Avatar": "var(--xmlui-borderLeftColor-Avatar, var(--xmlui-borderHorizontalColor-Avatar, var(--xmlui-borderColor-Avatar)))", "borderRightColor-Avatar": "var(--xmlui-borderRightColor-Avatar, var(--xmlui-borderHorizontalColor-Avatar, var(--xmlui-borderColor-Avatar)))", "borderVerticalColor-Avatar": "var(--xmlui-borderVerticalColor-Avatar, var(--xmlui-borderColor-Avatar))", "borderTopColor-Avatar": "var(--xmlui-borderTopColor-Avatar, var(--xmlui-borderVerticalColor-Avatar, var(--xmlui-borderColor-Avatar)))", "borderBottomColor-Avatar": "var(--xmlui-borderBottomColor-Avatar, var(--xmlui-borderVerticalColor-Avatar, var(--xmlui-borderColor-Avatar)))", "radius-start-start-Avatar": "var(--xmlui-radius-start-start-Avatar, var(--xmlui-borderRadius-Avatar))", "radius-start-end-Avatar": "var(--xmlui-radius-start-end-Avatar, var(--xmlui-borderRadius-Avatar))", "radius-end-start-Avatar": "var(--xmlui-radius-end-start-Avatar, var(--xmlui-borderRadius-Avatar))", "radius-end-end-Avatar": "var(--xmlui-radius-end-end-Avatar, var(--xmlui-borderRadius-Avatar))", "backgroundColor-Avatar": "var(--xmlui-backgroundColor-Avatar)", "boxShadow-Avatar": "var(--xmlui-boxShadow-Avatar)", "textColor-Avatar": "var(--xmlui-textColor-Avatar)", "fontWeight-Avatar": "var(--xmlui-fontWeight-Avatar)"}'`, Nc = "_container_vm9kj_13", Wc = "_xs_vm9kj_50", Oc = "_sm_vm9kj_57", Rc = "_md_vm9kj_64", zc = "_lg_vm9kj_71", Vc = "_clickable_vm9kj_78", Ar = {
  themeVars: Ac,
  container: Nc,
  xs: Wc,
  sm: Oc,
  md: Rc,
  lg: zc,
  clickable: Vc
}, ll = {
  size: "sm"
}, Ec = ve(function({ size: t = ll.size, url: r, name: o, style: a, onClick: n, ...i }, l) {
  let s = null;
  return !r && o && (s = o.trim().split(" ").filter((v) => !!v.trim().length).map((v) => v[0].toUpperCase()).slice(0, 3)), /* @__PURE__ */ m(
    "div",
    {
      ...i,
      ref: l,
      className: le(Ar.container, {
        [Ar.xs]: t === "xs",
        [Ar.sm]: t === "sm",
        [Ar.md]: t === "md",
        [Ar.lg]: t === "lg",
        [Ar.clickable]: !!n
      }),
      style: { backgroundImage: r ? `url(${r})` : "none", ...a },
      onClick: n,
      children: s
    }
  );
}), pt = "Avatar", Pc = k({
  description: `The \`${pt}\` component represents a user, group (or other entity's) avatar with a small image or initials.`,
  props: {
    size: {
      description: `This property defines the display size of the ${pt}.`,
      availableValues: ja,
      valueType: "string",
      defaultValue: ll.size
    },
    name: {
      description: `This property sets the name value the ${pt} uses to display initials.`,
      valueType: "string"
    },
    url: {
      description: `This property specifies the URL of the image to display in the ${pt}.`,
      valueType: "string"
    }
  },
  events: {
    click: u("This event is triggered when the avatar is clicked.")
  },
  themeVars: j(Ar.themeVars),
  defaultThemeVars: {
    [`borderRadius-${pt}`]: "4px",
    [`boxShadow-${pt}`]: "inset 0 0 0 1px rgba(4,32,69,0.1)",
    [`textColor-${pt}`]: "$textColor-secondary",
    [`fontWeight-${pt}`]: "$fontWeight-bold",
    light: {
      [`border-${pt}`]: "0px solid $color-surface-400A80",
      [`backgroundColor-${pt}`]: "$color-surface-100"
    },
    dark: {
      [`border-${pt}`]: "0px solid $color-surface-700",
      [`backgroundColor-${pt}`]: "$color-surface-800",
      [`borderColor-${pt}`]: "$color-surface-700"
    }
  }
}), Dc = `'{"border-Badge": "var(--xmlui-border-Badge)", "borderHorizontal-Badge": "var(--xmlui-borderHorizontal-Badge, var(--xmlui-border-Badge))", "borderVertical-Badge": "var(--xmlui-borderVertical-Badge, var(--xmlui-border-Badge))", "borderLeft-Badge": "var(--xmlui-borderLeft-Badge, var(--xmlui-borderHorizontal-Badge, var(--xmlui-border-Badge)))", "borderRight-Badge": "var(--xmlui-borderRight-Badge, var(--xmlui-borderHorizontal-Badge, var(--xmlui-border-Badge)))", "borderTop-Badge": "var(--xmlui-borderTop-Badge, var(--xmlui-borderVertical-Badge, var(--xmlui-border-Badge)))", "borderBottom-Badge": "var(--xmlui-borderBottom-Badge, var(--xmlui-borderVertical-Badge, var(--xmlui-border-Badge)))", "borderWidth-Badge": "var(--xmlui-borderWidth-Badge)", "borderHorizontalWidth-Badge": "var(--xmlui-borderHorizontalWidth-Badge, var(--xmlui-borderWidth-Badge))", "borderLeftWidth-Badge": "var(--xmlui-borderLeftWidth-Badge, var(--xmlui-borderHorizontalWidth-Badge, var(--xmlui-borderWidth-Badge)))", "borderRightWidth-Badge": "var(--xmlui-borderRightWidth-Badge, var(--xmlui-borderHorizontalWidth-Badge, var(--xmlui-borderWidth-Badge)))", "borderVerticalWidth-Badge": "var(--xmlui-borderVerticalWidth-Badge, var(--xmlui-borderWidth-Badge))", "borderTopWidth-Badge": "var(--xmlui-borderTopWidth-Badge, var(--xmlui-borderVerticalWidth-Badge, var(--xmlui-borderWidth-Badge)))", "borderBottomWidth-Badge": "var(--xmlui-borderBottomWidth-Badge, var(--xmlui-borderVerticalWidth-Badge, var(--xmlui-borderWidth-Badge)))", "borderStyle-Badge": "var(--xmlui-borderStyle-Badge)", "borderHorizontalStyle-Badge": "var(--xmlui-borderHorizontalStyle-Badge, var(--xmlui-borderStyle-Badge))", "borderLeftStyle-Badge": "var(--xmlui-borderLeftStyle-Badge, var(--xmlui-borderHorizontalStyle-Badge, var(--xmlui-borderStyle-Badge)))", "borderRightStyle-Badge": "var(--xmlui-borderRightStyle-Badge, var(--xmlui-borderHorizontalStyle-Badge, var(--xmlui-borderStyle-Badge)))", "borderVerticalStyle-Badge": "var(--xmlui-borderVerticalStyle-Badge, var(--xmlui-borderStyle-Badge))", "borderTopStyle-Badge": "var(--xmlui-borderTopStyle-Badge, var(--xmlui-borderVerticalStyle-Badge, var(--xmlui-borderStyle-Badge)))", "borderBottomStyle-Badge": "var(--xmlui-borderBottomStyle-Badge, var(--xmlui-borderVerticalStyle-Badge, var(--xmlui-borderStyle-Badge)))", "borderColor-Badge": "var(--xmlui-borderColor-Badge)", "borderHorizontalColor-Badge": "var(--xmlui-borderHorizontalColor-Badge, var(--xmlui-borderColor-Badge))", "borderLeftColor-Badge": "var(--xmlui-borderLeftColor-Badge, var(--xmlui-borderHorizontalColor-Badge, var(--xmlui-borderColor-Badge)))", "borderRightColor-Badge": "var(--xmlui-borderRightColor-Badge, var(--xmlui-borderHorizontalColor-Badge, var(--xmlui-borderColor-Badge)))", "borderVerticalColor-Badge": "var(--xmlui-borderVerticalColor-Badge, var(--xmlui-borderColor-Badge))", "borderTopColor-Badge": "var(--xmlui-borderTopColor-Badge, var(--xmlui-borderVerticalColor-Badge, var(--xmlui-borderColor-Badge)))", "borderBottomColor-Badge": "var(--xmlui-borderBottomColor-Badge, var(--xmlui-borderVerticalColor-Badge, var(--xmlui-borderColor-Badge)))", "radius-start-start-Badge": "var(--xmlui-radius-start-start-Badge, var(--xmlui-borderRadius-Badge))", "radius-start-end-Badge": "var(--xmlui-radius-start-end-Badge, var(--xmlui-borderRadius-Badge))", "radius-end-start-Badge": "var(--xmlui-radius-end-start-Badge, var(--xmlui-borderRadius-Badge))", "radius-end-end-Badge": "var(--xmlui-radius-end-end-Badge, var(--xmlui-borderRadius-Badge))", "padding-Badge": "var(--xmlui-padding-Badge)", "paddingHorizontal-Badge": "var(--xmlui-paddingHorizontal-Badge, var(--xmlui-padding-Badge))", "paddingVertical-Badge": "var(--xmlui-paddingVertical-Badge, var(--xmlui-padding-Badge))", "paddingLeft-Badge": "var(--xmlui-paddingLeft-Badge, var(--xmlui-paddingHorizontal-Badge, var(--xmlui-padding-Badge)))", "paddingRight-Badge": "var(--xmlui-paddingRight-Badge, var(--xmlui-paddingHorizontal-Badge, var(--xmlui-padding-Badge)))", "paddingTop-Badge": "var(--xmlui-paddingTop-Badge, var(--xmlui-paddingVertical-Badge, var(--xmlui-padding-Badge)))", "paddingBottom-Badge": "var(--xmlui-paddingBottom-Badge, var(--xmlui-paddingVertical-Badge, var(--xmlui-padding-Badge)))", "border-Badge-pill": "var(--xmlui-border-Badge-pill)", "borderHorizontal-Badge-pill": "var(--xmlui-borderHorizontal-Badge-pill, var(--xmlui-border-Badge-pill))", "borderVertical-Badge-pill": "var(--xmlui-borderVertical-Badge-pill, var(--xmlui-border-Badge-pill))", "borderLeft-Badge-pill": "var(--xmlui-borderLeft-Badge-pill, var(--xmlui-borderHorizontal-Badge-pill, var(--xmlui-border-Badge-pill)))", "borderRight-Badge-pill": "var(--xmlui-borderRight-Badge-pill, var(--xmlui-borderHorizontal-Badge-pill, var(--xmlui-border-Badge-pill)))", "borderTop-Badge-pill": "var(--xmlui-borderTop-Badge-pill, var(--xmlui-borderVertical-Badge-pill, var(--xmlui-border-Badge-pill)))", "borderBottom-Badge-pill": "var(--xmlui-borderBottom-Badge-pill, var(--xmlui-borderVertical-Badge-pill, var(--xmlui-border-Badge-pill)))", "borderWidth-Badge-pill": "var(--xmlui-borderWidth-Badge-pill)", "borderHorizontalWidth-Badge-pill": "var(--xmlui-borderHorizontalWidth-Badge-pill, var(--xmlui-borderWidth-Badge-pill))", "borderLeftWidth-Badge-pill": "var(--xmlui-borderLeftWidth-Badge-pill, var(--xmlui-borderHorizontalWidth-Badge-pill, var(--xmlui-borderWidth-Badge-pill)))", "borderRightWidth-Badge-pill": "var(--xmlui-borderRightWidth-Badge-pill, var(--xmlui-borderHorizontalWidth-Badge-pill, var(--xmlui-borderWidth-Badge-pill)))", "borderVerticalWidth-Badge-pill": "var(--xmlui-borderVerticalWidth-Badge-pill, var(--xmlui-borderWidth-Badge-pill))", "borderTopWidth-Badge-pill": "var(--xmlui-borderTopWidth-Badge-pill, var(--xmlui-borderVerticalWidth-Badge-pill, var(--xmlui-borderWidth-Badge-pill)))", "borderBottomWidth-Badge-pill": "var(--xmlui-borderBottomWidth-Badge-pill, var(--xmlui-borderVerticalWidth-Badge-pill, var(--xmlui-borderWidth-Badge-pill)))", "borderStyle-Badge-pill": "var(--xmlui-borderStyle-Badge-pill)", "borderHorizontalStyle-Badge-pill": "var(--xmlui-borderHorizontalStyle-Badge-pill, var(--xmlui-borderStyle-Badge-pill))", "borderLeftStyle-Badge-pill": "var(--xmlui-borderLeftStyle-Badge-pill, var(--xmlui-borderHorizontalStyle-Badge-pill, var(--xmlui-borderStyle-Badge-pill)))", "borderRightStyle-Badge-pill": "var(--xmlui-borderRightStyle-Badge-pill, var(--xmlui-borderHorizontalStyle-Badge-pill, var(--xmlui-borderStyle-Badge-pill)))", "borderVerticalStyle-Badge-pill": "var(--xmlui-borderVerticalStyle-Badge-pill, var(--xmlui-borderStyle-Badge-pill))", "borderTopStyle-Badge-pill": "var(--xmlui-borderTopStyle-Badge-pill, var(--xmlui-borderVerticalStyle-Badge-pill, var(--xmlui-borderStyle-Badge-pill)))", "borderBottomStyle-Badge-pill": "var(--xmlui-borderBottomStyle-Badge-pill, var(--xmlui-borderVerticalStyle-Badge-pill, var(--xmlui-borderStyle-Badge-pill)))", "borderColor-Badge-pill": "var(--xmlui-borderColor-Badge-pill)", "borderHorizontalColor-Badge-pill": "var(--xmlui-borderHorizontalColor-Badge-pill, var(--xmlui-borderColor-Badge-pill))", "borderLeftColor-Badge-pill": "var(--xmlui-borderLeftColor-Badge-pill, var(--xmlui-borderHorizontalColor-Badge-pill, var(--xmlui-borderColor-Badge-pill)))", "borderRightColor-Badge-pill": "var(--xmlui-borderRightColor-Badge-pill, var(--xmlui-borderHorizontalColor-Badge-pill, var(--xmlui-borderColor-Badge-pill)))", "borderVerticalColor-Badge-pill": "var(--xmlui-borderVerticalColor-Badge-pill, var(--xmlui-borderColor-Badge-pill))", "borderTopColor-Badge-pill": "var(--xmlui-borderTopColor-Badge-pill, var(--xmlui-borderVerticalColor-Badge-pill, var(--xmlui-borderColor-Badge-pill)))", "borderBottomColor-Badge-pill": "var(--xmlui-borderBottomColor-Badge-pill, var(--xmlui-borderVerticalColor-Badge-pill, var(--xmlui-borderColor-Badge-pill)))", "radius-start-start-Badge-pill": "var(--xmlui-radius-start-start-Badge-pill, var(--xmlui-borderRadius-Badge-pill))", "radius-start-end-Badge-pill": "var(--xmlui-radius-start-end-Badge-pill, var(--xmlui-borderRadius-Badge-pill))", "radius-end-start-Badge-pill": "var(--xmlui-radius-end-start-Badge-pill, var(--xmlui-borderRadius-Badge-pill))", "radius-end-end-Badge-pill": "var(--xmlui-radius-end-end-Badge-pill, var(--xmlui-borderRadius-Badge-pill))", "padding-Badge-pill": "var(--xmlui-padding-Badge-pill)", "paddingHorizontal-Badge-pill": "var(--xmlui-paddingHorizontal-Badge-pill, var(--xmlui-padding-Badge-pill))", "paddingVertical-Badge-pill": "var(--xmlui-paddingVertical-Badge-pill, var(--xmlui-padding-Badge-pill))", "paddingLeft-Badge-pill": "var(--xmlui-paddingLeft-Badge-pill, var(--xmlui-paddingHorizontal-Badge-pill, var(--xmlui-padding-Badge-pill)))", "paddingRight-Badge-pill": "var(--xmlui-paddingRight-Badge-pill, var(--xmlui-paddingHorizontal-Badge-pill, var(--xmlui-padding-Badge-pill)))", "paddingTop-Badge-pill": "var(--xmlui-paddingTop-Badge-pill, var(--xmlui-paddingVertical-Badge-pill, var(--xmlui-padding-Badge-pill)))", "paddingBottom-Badge-pill": "var(--xmlui-paddingBottom-Badge-pill, var(--xmlui-paddingVertical-Badge-pill, var(--xmlui-padding-Badge-pill)))", "backgroundColor-Badge": "var(--xmlui-backgroundColor-Badge)", "textColor-Badge": "var(--xmlui-textColor-Badge)", "fontSize-Badge": "var(--xmlui-fontSize-Badge)", "fontSize-Badge-pill": "var(--xmlui-fontSize-Badge-pill)", "fontWeight-Badge": "var(--xmlui-fontWeight-Badge)", "fontWeight-Badge-pill": "var(--xmlui-fontWeight-Badge-pill)"}'`, Mc = "_badge_gx6it_13", Fc = "_pill_gx6it_52", Va = {
  themeVars: Dc,
  badge: Mc,
  pill: Fc
}, Uc = ["badge", "pill"], qc = {
  variant: "badge"
};
ve(function({ children: t, color: r, variant: o = qc.variant, style: a }, n) {
  return /* @__PURE__ */ m(
    "div",
    {
      ref: n,
      className: le({
        [Va.badge]: o === "badge",
        [Va.pill]: o === "pill"
      }),
      style: {
        ...r ? typeof r == "string" ? { backgroundColor: r } : { backgroundColor: r.background, color: r.label } : {},
        ...a
      },
      children: t
    }
  );
});
const Ht = "Badge", Gc = k({
  status: "stable",
  description: `The \`${Ht}\` is a text label that accepts a color map to define its background color and, optionally, its label color.`,
  props: {
    value: {
      description: "The text that the component displays",
      type: "string",
      isRequired: !0
    },
    variant: {
      description: "Modifies the shape of the component. Comes in the regular `badge` variant or the `pill` variant with fully rounded corners.",
      type: "string",
      availableValues: Uc,
      defaultValue: "badge"
    },
    colorMap: {
      description: `The \`${Ht}\` component supports the mapping of a list of colors using the \`value\` prop as the key. Provide the component with a list or key-value pairs in two ways:`
    },
    themeColor: Fe("(**NOT IMPLEMENTED YET**) The theme color of the component."),
    indicatorText: Fe(
      "(**NOT IMPLEMENTED YET**) This property defines the text to display in the indicator. If it is not defined or empty, no indicator is displayed unless the `forceIndicator` property is set."
    ),
    forceIndicator: Fe(
      "(**NOT IMPLEMENTED YET**) This property forces the display of the indicator, even if the `indicatorText` property is not defined or empty."
    ),
    indicatorThemeColor: Fe("(**NOT IMPLEMENTED YET**) The theme color of the indicator."),
    indicatorPosition: Fe("(**NOT IMPLEMENTED YET**) The position of the indicator.")
  },
  events: {},
  themeVars: j(Va.themeVars),
  defaultThemeVars: {
    [`padding-${Ht}`]: "$space-0_5 $space-2",
    [`border-${Ht}`]: "0px solid $borderColor",
    [`padding-${Ht}-pill`]: "$space-0_5 $space-2",
    [`borderRadius-${Ht}`]: "4px",
    [`fontSize-${Ht}`]: "0.8em",
    [`fontSize-${Ht}-pill`]: "0.8em",
    light: {
      [`backgroundColor-${Ht}`]: "rgba($color-secondary-500-rgb, .6)",
      [`textColor-${Ht}`]: "white"
    },
    dark: {
      [`backgroundColor-${Ht}`]: "rgba($color-secondary-500-rgb, .6)",
      [`textColor-${Ht}`]: "$color-surface-50"
    }
  }
}), Yc = Qt(null), Xc = k({
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
}), jc = `'{"padding-Card": "var(--xmlui-padding-Card)", "paddingHorizontal-Card": "var(--xmlui-paddingHorizontal-Card, var(--xmlui-padding-Card))", "paddingVertical-Card": "var(--xmlui-paddingVertical-Card, var(--xmlui-padding-Card))", "paddingLeft-Card": "var(--xmlui-paddingLeft-Card, var(--xmlui-paddingHorizontal-Card, var(--xmlui-padding-Card)))", "paddingRight-Card": "var(--xmlui-paddingRight-Card, var(--xmlui-paddingHorizontal-Card, var(--xmlui-padding-Card)))", "paddingTop-Card": "var(--xmlui-paddingTop-Card, var(--xmlui-paddingVertical-Card, var(--xmlui-padding-Card)))", "paddingBottom-Card": "var(--xmlui-paddingBottom-Card, var(--xmlui-paddingVertical-Card, var(--xmlui-padding-Card)))", "border-Card": "var(--xmlui-border-Card)", "borderHorizontal-Card": "var(--xmlui-borderHorizontal-Card, var(--xmlui-border-Card))", "borderVertical-Card": "var(--xmlui-borderVertical-Card, var(--xmlui-border-Card))", "borderLeft-Card": "var(--xmlui-borderLeft-Card, var(--xmlui-borderHorizontal-Card, var(--xmlui-border-Card)))", "borderRight-Card": "var(--xmlui-borderRight-Card, var(--xmlui-borderHorizontal-Card, var(--xmlui-border-Card)))", "borderTop-Card": "var(--xmlui-borderTop-Card, var(--xmlui-borderVertical-Card, var(--xmlui-border-Card)))", "borderBottom-Card": "var(--xmlui-borderBottom-Card, var(--xmlui-borderVertical-Card, var(--xmlui-border-Card)))", "borderWidth-Card": "var(--xmlui-borderWidth-Card)", "borderHorizontalWidth-Card": "var(--xmlui-borderHorizontalWidth-Card, var(--xmlui-borderWidth-Card))", "borderLeftWidth-Card": "var(--xmlui-borderLeftWidth-Card, var(--xmlui-borderHorizontalWidth-Card, var(--xmlui-borderWidth-Card)))", "borderRightWidth-Card": "var(--xmlui-borderRightWidth-Card, var(--xmlui-borderHorizontalWidth-Card, var(--xmlui-borderWidth-Card)))", "borderVerticalWidth-Card": "var(--xmlui-borderVerticalWidth-Card, var(--xmlui-borderWidth-Card))", "borderTopWidth-Card": "var(--xmlui-borderTopWidth-Card, var(--xmlui-borderVerticalWidth-Card, var(--xmlui-borderWidth-Card)))", "borderBottomWidth-Card": "var(--xmlui-borderBottomWidth-Card, var(--xmlui-borderVerticalWidth-Card, var(--xmlui-borderWidth-Card)))", "borderStyle-Card": "var(--xmlui-borderStyle-Card)", "borderHorizontalStyle-Card": "var(--xmlui-borderHorizontalStyle-Card, var(--xmlui-borderStyle-Card))", "borderLeftStyle-Card": "var(--xmlui-borderLeftStyle-Card, var(--xmlui-borderHorizontalStyle-Card, var(--xmlui-borderStyle-Card)))", "borderRightStyle-Card": "var(--xmlui-borderRightStyle-Card, var(--xmlui-borderHorizontalStyle-Card, var(--xmlui-borderStyle-Card)))", "borderVerticalStyle-Card": "var(--xmlui-borderVerticalStyle-Card, var(--xmlui-borderStyle-Card))", "borderTopStyle-Card": "var(--xmlui-borderTopStyle-Card, var(--xmlui-borderVerticalStyle-Card, var(--xmlui-borderStyle-Card)))", "borderBottomStyle-Card": "var(--xmlui-borderBottomStyle-Card, var(--xmlui-borderVerticalStyle-Card, var(--xmlui-borderStyle-Card)))", "borderColor-Card": "var(--xmlui-borderColor-Card)", "borderHorizontalColor-Card": "var(--xmlui-borderHorizontalColor-Card, var(--xmlui-borderColor-Card))", "borderLeftColor-Card": "var(--xmlui-borderLeftColor-Card, var(--xmlui-borderHorizontalColor-Card, var(--xmlui-borderColor-Card)))", "borderRightColor-Card": "var(--xmlui-borderRightColor-Card, var(--xmlui-borderHorizontalColor-Card, var(--xmlui-borderColor-Card)))", "borderVerticalColor-Card": "var(--xmlui-borderVerticalColor-Card, var(--xmlui-borderColor-Card))", "borderTopColor-Card": "var(--xmlui-borderTopColor-Card, var(--xmlui-borderVerticalColor-Card, var(--xmlui-borderColor-Card)))", "borderBottomColor-Card": "var(--xmlui-borderBottomColor-Card, var(--xmlui-borderVerticalColor-Card, var(--xmlui-borderColor-Card)))", "radius-start-start-Card": "var(--xmlui-radius-start-start-Card, var(--xmlui-borderRadius-Card))", "radius-start-end-Card": "var(--xmlui-radius-start-end-Card, var(--xmlui-borderRadius-Card))", "radius-end-start-Card": "var(--xmlui-radius-end-start-Card, var(--xmlui-borderRadius-Card))", "radius-end-end-Card": "var(--xmlui-radius-end-end-Card, var(--xmlui-borderRadius-Card))", "boxShadow-Card": "var(--xmlui-boxShadow-Card)", "backgroundColor-Card": "var(--xmlui-backgroundColor-Card)", "borderRadius-Card": "var(--xmlui-borderRadius-Card)"}'`, Qc = "_wrapper_1hude_13", Zc = "_horizontal_1hude_46", Jc = "_vertical_1hude_51", Kc = "_isClickable_1hude_54", So = {
  themeVars: jc,
  wrapper: Qc,
  horizontal: Zc,
  vertical: Jc,
  isClickable: Kc
}, em = `'{"padding-Link": "var(--xmlui-padding-Link)", "paddingHorizontal-Link": "var(--xmlui-paddingHorizontal-Link, var(--xmlui-padding-Link))", "paddingVertical-Link": "var(--xmlui-paddingVertical-Link, var(--xmlui-padding-Link))", "paddingLeft-Link": "var(--xmlui-paddingLeft-Link, var(--xmlui-paddingHorizontal-Link, var(--xmlui-padding-Link)))", "paddingRight-Link": "var(--xmlui-paddingRight-Link, var(--xmlui-paddingHorizontal-Link, var(--xmlui-padding-Link)))", "paddingTop-Link": "var(--xmlui-paddingTop-Link, var(--xmlui-paddingVertical-Link, var(--xmlui-padding-Link)))", "paddingBottom-Link": "var(--xmlui-paddingBottom-Link, var(--xmlui-paddingVertical-Link, var(--xmlui-padding-Link)))", "padding-icon-Link": "var(--xmlui-padding-icon-Link)", "paddingHorizontal-icon-Link": "var(--xmlui-paddingHorizontal-icon-Link, var(--xmlui-padding-icon-Link))", "paddingVertical-icon-Link": "var(--xmlui-paddingVertical-icon-Link, var(--xmlui-padding-icon-Link))", "paddingLeft-icon-Link": "var(--xmlui-paddingLeft-icon-Link, var(--xmlui-paddingHorizontal-icon-Link, var(--xmlui-padding-icon-Link)))", "paddingRight-icon-Link": "var(--xmlui-paddingRight-icon-Link, var(--xmlui-paddingHorizontal-icon-Link, var(--xmlui-padding-icon-Link)))", "paddingTop-icon-Link": "var(--xmlui-paddingTop-icon-Link, var(--xmlui-paddingVertical-icon-Link, var(--xmlui-padding-icon-Link)))", "paddingBottom-icon-Link": "var(--xmlui-paddingBottom-icon-Link, var(--xmlui-paddingVertical-icon-Link, var(--xmlui-padding-icon-Link)))", "border-Link": "var(--xmlui-border-Link)", "borderHorizontal-Link": "var(--xmlui-borderHorizontal-Link, var(--xmlui-border-Link))", "borderVertical-Link": "var(--xmlui-borderVertical-Link, var(--xmlui-border-Link))", "borderLeft-Link": "var(--xmlui-borderLeft-Link, var(--xmlui-borderHorizontal-Link, var(--xmlui-border-Link)))", "borderRight-Link": "var(--xmlui-borderRight-Link, var(--xmlui-borderHorizontal-Link, var(--xmlui-border-Link)))", "borderTop-Link": "var(--xmlui-borderTop-Link, var(--xmlui-borderVertical-Link, var(--xmlui-border-Link)))", "borderBottom-Link": "var(--xmlui-borderBottom-Link, var(--xmlui-borderVertical-Link, var(--xmlui-border-Link)))", "borderWidth-Link": "var(--xmlui-borderWidth-Link)", "borderHorizontalWidth-Link": "var(--xmlui-borderHorizontalWidth-Link, var(--xmlui-borderWidth-Link))", "borderLeftWidth-Link": "var(--xmlui-borderLeftWidth-Link, var(--xmlui-borderHorizontalWidth-Link, var(--xmlui-borderWidth-Link)))", "borderRightWidth-Link": "var(--xmlui-borderRightWidth-Link, var(--xmlui-borderHorizontalWidth-Link, var(--xmlui-borderWidth-Link)))", "borderVerticalWidth-Link": "var(--xmlui-borderVerticalWidth-Link, var(--xmlui-borderWidth-Link))", "borderTopWidth-Link": "var(--xmlui-borderTopWidth-Link, var(--xmlui-borderVerticalWidth-Link, var(--xmlui-borderWidth-Link)))", "borderBottomWidth-Link": "var(--xmlui-borderBottomWidth-Link, var(--xmlui-borderVerticalWidth-Link, var(--xmlui-borderWidth-Link)))", "borderStyle-Link": "var(--xmlui-borderStyle-Link)", "borderHorizontalStyle-Link": "var(--xmlui-borderHorizontalStyle-Link, var(--xmlui-borderStyle-Link))", "borderLeftStyle-Link": "var(--xmlui-borderLeftStyle-Link, var(--xmlui-borderHorizontalStyle-Link, var(--xmlui-borderStyle-Link)))", "borderRightStyle-Link": "var(--xmlui-borderRightStyle-Link, var(--xmlui-borderHorizontalStyle-Link, var(--xmlui-borderStyle-Link)))", "borderVerticalStyle-Link": "var(--xmlui-borderVerticalStyle-Link, var(--xmlui-borderStyle-Link))", "borderTopStyle-Link": "var(--xmlui-borderTopStyle-Link, var(--xmlui-borderVerticalStyle-Link, var(--xmlui-borderStyle-Link)))", "borderBottomStyle-Link": "var(--xmlui-borderBottomStyle-Link, var(--xmlui-borderVerticalStyle-Link, var(--xmlui-borderStyle-Link)))", "borderColor-Link": "var(--xmlui-borderColor-Link)", "borderHorizontalColor-Link": "var(--xmlui-borderHorizontalColor-Link, var(--xmlui-borderColor-Link))", "borderLeftColor-Link": "var(--xmlui-borderLeftColor-Link, var(--xmlui-borderHorizontalColor-Link, var(--xmlui-borderColor-Link)))", "borderRightColor-Link": "var(--xmlui-borderRightColor-Link, var(--xmlui-borderHorizontalColor-Link, var(--xmlui-borderColor-Link)))", "borderVerticalColor-Link": "var(--xmlui-borderVerticalColor-Link, var(--xmlui-borderColor-Link))", "borderTopColor-Link": "var(--xmlui-borderTopColor-Link, var(--xmlui-borderVerticalColor-Link, var(--xmlui-borderColor-Link)))", "borderBottomColor-Link": "var(--xmlui-borderBottomColor-Link, var(--xmlui-borderVerticalColor-Link, var(--xmlui-borderColor-Link)))", "radius-start-start-Link": "var(--xmlui-radius-start-start-Link, var(--xmlui-borderRadius-Link))", "radius-start-end-Link": "var(--xmlui-radius-start-end-Link, var(--xmlui-borderRadius-Link))", "radius-end-start-Link": "var(--xmlui-radius-end-start-Link, var(--xmlui-borderRadius-Link))", "radius-end-end-Link": "var(--xmlui-radius-end-end-Link, var(--xmlui-borderRadius-Link))", "textColor-Link": "var(--xmlui-textColor-Link)", "textColor-Link--active": "var(--xmlui-textColor-Link--active)", "textColor-Link--hover": "var(--xmlui-textColor-Link--hover)", "textColor-Link--hover--active": "var(--xmlui-textColor-Link--hover--active)", "fontFamily-Link": "var(--xmlui-fontFamily-Link)", "fontSize-Link": "var(--xmlui-fontSize-Link)", "fontWeight-Link": "var(--xmlui-fontWeight-Link)", "fontWeight-Link--active": "var(--xmlui-fontWeight-Link--active)", "textDecorationColor-Link": "var(--xmlui-textDecorationColor-Link)", "textUnderlineOffset-Link": "var(--xmlui-textUnderlineOffset-Link)", "textDecorationLine-Link": "var(--xmlui-textDecorationLine-Link)", "textDecorationStyle-Link": "var(--xmlui-textDecorationStyle-Link)", "textDecorationThickness-Link": "var(--xmlui-textDecorationThickness-Link)", "gap-icon-Link": "var(--xmlui-gap-icon-Link)", "outlineWidth-Link--focus": "var(--xmlui-outlineWidth-Link--focus)", "outlineColor-Link--focus": "var(--xmlui-outlineColor-Link--focus)", "outlineStyle-Link--focus": "var(--xmlui-outlineStyle-Link--focus)", "outlineOffset-Link--focus": "var(--xmlui-outlineOffset-Link--focus)"}'`, tm = "_container_4iyrb_13", rm = "_active_4iyrb_53", om = "_disabled_4iyrb_57", am = "_iconWrapper_4iyrb_73", to = {
  themeVars: em,
  container: tm,
  active: rm,
  disabled: om,
  iconWrapper: am
}, im = ve(function(t, r) {
  const { to: o, children: a, icon: n, active: i, onClick: l, target: s, disabled: v, style: x, ...c } = nm(t), T = !!n && !a, b = ce(() => Hc(o), [o]);
  return /* @__PURE__ */ J(
    o ? ld : "div",
    {
      ref: r,
      to: b,
      style: x,
      target: s,
      onClick: l,
      className: le(to.container, {
        [to.iconLink]: T,
        [to.active]: i,
        [to.disabled]: v
      }),
      ...c,
      children: [
        n && /* @__PURE__ */ m("div", { className: to.iconWrapper, children: /* @__PURE__ */ m(ke, { name: n }) }),
        a
      ]
    }
  );
});
function nm(e) {
  const { target: t, referrerPolicy: r } = e;
  return {
    ...e,
    target: t,
    referrerPolicy: r
  };
}
const lm = `'{"Heading:textColor-H1": "var(--xmlui-textColor-H1)", "Heading:letterSpacing-H1": "var(--xmlui-letterSpacing-H1)", "Heading:fontFamily-H1": "var(--xmlui-fontFamily-H1)", "Heading:fontWeight-H1": "var(--xmlui-fontWeight-H1)", "fontSize-H1": "var(--xmlui-fontSize-H1)", "lineHeight-H1": "var(--xmlui-lineHeight-H1)", "marginTop-H1": "var(--xmlui-marginTop-H1)", "marginBottom-H1": "var(--xmlui-marginBottom-H1)", "Heading:textDecorationLine-H1": "var(--xmlui-textDecorationLine-H1)", "Heading:textDecorationColor-H1": "var(--xmlui-textDecorationColor-H1)", "Heading:textDecorationStyle-H1": "var(--xmlui-textDecorationStyle-H1)", "Heading:textDecorationThickness-H1": "var(--xmlui-textDecorationThickness-H1)", "Heading:textUnderlineOffset-H1": "var(--xmlui-textUnderlineOffset-H1)", "Heading:textColor-H2": "var(--xmlui-textColor-H2)", "Heading:letterSpacing-H2": "var(--xmlui-letterSpacing-H2)", "Heading:fontFamily-H2": "var(--xmlui-fontFamily-H2)", "Heading:fontWeight-H2": "var(--xmlui-fontWeight-H2)", "fontSize-H2": "var(--xmlui-fontSize-H2)", "lineHeight-H2": "var(--xmlui-lineHeight-H2)", "marginTop-H2": "var(--xmlui-marginTop-H2)", "marginBottom-H2": "var(--xmlui-marginBottom-H2)", "Heading:textDecorationLine-H2": "var(--xmlui-textDecorationLine-H2)", "Heading:textDecorationColor-H2": "var(--xmlui-textDecorationColor-H2)", "Heading:textDecorationStyle-H2": "var(--xmlui-textDecorationStyle-H2)", "Heading:textDecorationThickness-H2": "var(--xmlui-textDecorationThickness-H2)", "Heading:textUnderlineOffset-H2": "var(--xmlui-textUnderlineOffset-H2)", "Heading:textColor-H3": "var(--xmlui-textColor-H3)", "Heading:letterSpacing-H3": "var(--xmlui-letterSpacing-H3)", "Heading:fontFamily-H3": "var(--xmlui-fontFamily-H3)", "Heading:fontWeight-H3": "var(--xmlui-fontWeight-H3)", "fontSize-H3": "var(--xmlui-fontSize-H3)", "lineHeight-H3": "var(--xmlui-lineHeight-H3)", "marginTop-H3": "var(--xmlui-marginTop-H3)", "marginBottom-H3": "var(--xmlui-marginBottom-H3)", "Heading:textDecorationLine-H3": "var(--xmlui-textDecorationLine-H3)", "Heading:textDecorationColor-H3": "var(--xmlui-textDecorationColor-H3)", "Heading:textDecorationStyle-H3": "var(--xmlui-textDecorationStyle-H3)", "Heading:textDecorationThickness-H3": "var(--xmlui-textDecorationThickness-H3)", "Heading:textUnderlineOffset-H3": "var(--xmlui-textUnderlineOffset-H3)", "Heading:textColor-H4": "var(--xmlui-textColor-H4)", "Heading:letterSpacing-H4": "var(--xmlui-letterSpacing-H4)", "Heading:fontFamily-H4": "var(--xmlui-fontFamily-H4)", "Heading:fontWeight-H4": "var(--xmlui-fontWeight-H4)", "fontSize-H4": "var(--xmlui-fontSize-H4)", "lineHeight-H4": "var(--xmlui-lineHeight-H4)", "marginTop-H4": "var(--xmlui-marginTop-H4)", "marginBottom-H4": "var(--xmlui-marginBottom-H4)", "Heading:textDecorationLine-H4": "var(--xmlui-textDecorationLine-H4)", "Heading:textDecorationColor-H4": "var(--xmlui-textDecorationColor-H4)", "Heading:textDecorationStyle-H4": "var(--xmlui-textDecorationStyle-H4)", "Heading:textDecorationThickness-H4": "var(--xmlui-textDecorationThickness-H4)", "Heading:textUnderlineOffset-H4": "var(--xmlui-textUnderlineOffset-H4)", "Heading:textColor-H5": "var(--xmlui-textColor-H5)", "Heading:letterSpacing-H5": "var(--xmlui-letterSpacing-H5)", "Heading:fontFamily-H5": "var(--xmlui-fontFamily-H5)", "Heading:fontWeight-H5": "var(--xmlui-fontWeight-H5)", "fontSize-H5": "var(--xmlui-fontSize-H5)", "lineHeight-H5": "var(--xmlui-lineHeight-H5)", "marginTop-H5": "var(--xmlui-marginTop-H5)", "marginBottom-H5": "var(--xmlui-marginBottom-H5)", "Heading:textDecorationLine-H5": "var(--xmlui-textDecorationLine-H5)", "Heading:textDecorationColor-H5": "var(--xmlui-textDecorationColor-H5)", "Heading:textDecorationStyle-H5": "var(--xmlui-textDecorationStyle-H5)", "Heading:textDecorationThickness-H5": "var(--xmlui-textDecorationThickness-H5)", "Heading:textUnderlineOffset-H5": "var(--xmlui-textUnderlineOffset-H5)", "Heading:textColor-H6": "var(--xmlui-textColor-H6)", "Heading:letterSpacing-H6": "var(--xmlui-letterSpacing-H6)", "Heading:fontFamily-H6": "var(--xmlui-fontFamily-H6)", "Heading:fontWeight-H6": "var(--xmlui-fontWeight-H6)", "fontSize-H6": "var(--xmlui-fontSize-H6)", "lineHeight-H6": "var(--xmlui-lineHeight-H6)", "marginTop-H6": "var(--xmlui-marginTop-H6)", "marginBottom-H6": "var(--xmlui-marginBottom-H6)", "Heading:textDecorationLine-H6": "var(--xmlui-textDecorationLine-H6)", "Heading:textDecorationColor-H6": "var(--xmlui-textDecorationColor-H6)", "Heading:textDecorationStyle-H6": "var(--xmlui-textDecorationStyle-H6)", "Heading:textDecorationThickness-H6": "var(--xmlui-textDecorationThickness-H6)", "Heading:textUnderlineOffset-H6": "var(--xmlui-textUnderlineOffset-H6)"}'`, dm = "_heading_yjkue_13", sm = "_h1_yjkue_13", um = "_h2_yjkue_28", cm = "_h3_yjkue_43", mm = "_h4_yjkue_58", pm = "_h5_yjkue_73", hm = "_h6_yjkue_88", xm = "_truncateOverflow_yjkue_108", bm = "_preserveLinebreaks_yjkue_114", vm = "_noEllipsis_yjkue_118", $t = {
  themeVars: lm,
  heading: dm,
  h1: sm,
  h2: um,
  h3: cm,
  h4: mm,
  h5: pm,
  h6: hm,
  truncateOverflow: xm,
  preserveLinebreaks: bm,
  noEllipsis: vm
}, oi = {
  level: "h1",
  ellipses: !0,
  omitFromToc: !1
}, Bi = ve(function({
  uid: t,
  level: r = "h1",
  children: o,
  sx: a,
  style: n,
  title: i,
  maxLines: l = 0,
  preserveLinebreaks: s,
  ellipses: v = !0,
  className: x,
  omitFromToc: c = !1,
  ...T
}, b) {
  const f = r == null ? void 0 : r.toLowerCase(), y = he(null), [w, _] = me(null), H = he(null), I = Lt(Yc), R = I == null ? void 0 : I.registerHeading, F = I == null ? void 0 : I.hasTableOfContents, Z = b ? sr(y, b) : y;
  return ee(() => {
    var V, W, N, O;
    if (F && y.current) {
      const h = (O = (N = (W = (V = y.current.textContent) == null ? void 0 : V.trim()) == null ? void 0 : W.replace(/[^\w\s-]/g, "")) == null ? void 0 : N.replace(/\s+/g, "-")) == null ? void 0 : O.toLowerCase();
      _(h || null);
    }
  }, [F]), Lo(() => {
    if (F && y.current && w && !c)
      return R == null ? void 0 : R({
        id: w,
        level: parseInt(r.replace("h", "")),
        text: y.current.textContent.trim(),
        anchor: H.current
      });
  }, [w, F, R, r, c]), /* @__PURE__ */ J(
    f,
    {
      ref: Z,
      id: t,
      title: i,
      style: { ...a, ...n, ...al(l) },
      className: le($t.heading, $t[f], x || "", {
        [$t.truncateOverflow]: l > 0,
        [$t.preserveLinebreaks]: s,
        [$t.noEllipsis]: !v
      }),
      ...T,
      children: [
        w && F && /* @__PURE__ */ m("span", { ref: H, id: w, style: { width: 0, height: 0 }, "data-anchor": !0 }),
        o
      ]
    }
  );
}), Ko = {
  orientation: "vertical",
  showAvatar: !1
};
ve(function({
  children: t,
  orientation: r = Ko.orientation,
  style: o,
  title: a,
  subtitle: n,
  linkTo: i,
  avatarUrl: l,
  showAvatar: s = !!l || Ko.showAvatar,
  onClick: v
}, x) {
  const c = {
    level: "h2"
  };
  return /* @__PURE__ */ J(
    "div",
    {
      ref: x,
      className: le(So.wrapper, {
        [So.isClickable]: !!v,
        [So.vertical]: r === "vertical",
        [So.horizontal]: r === "horizontal"
      }),
      style: o,
      onClick: v,
      children: [
        [a, n, l, s].some(Boolean) && /* @__PURE__ */ J(_o, { orientation: "horizontal", verticalAlignment: "center", style: { gap: "1rem" }, children: [
          s && /* @__PURE__ */ m(Ec, { url: l, name: a }),
          /* @__PURE__ */ J(_o, { orientation: "vertical", children: [
            i ? a ? /* @__PURE__ */ m(im, { to: i + "", children: /* @__PURE__ */ m(Bi, { ...c, children: a }) }) : null : a ? /* @__PURE__ */ m(Bi, { ...c, children: a }) : null,
            n !== void 0 && /* @__PURE__ */ m(lo, { variant: "small", children: n })
          ] })
        ] }),
        t
      ]
    }
  );
});
const ht = "Card", fm = k({
  description: `The \`${ht}\` component is a container for cohesive elements, often rendered visually as a card.`,
  props: {
    avatarUrl: {
      description: `Show the avatar (\`true\`) or not (\`false\`). If not specified, the ${ht} will show the first letters of the [\`title\`](#title).`,
      type: "string"
    },
    showAvatar: {
      description: `Indicates whether the ${ht} should be displayed`,
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
      description: `An optional property that governs the ${ht}'s orientation (whether the ${ht} lays out its children in a row or a column). If the orientation is set to \`horizontal\`, the ${ht} will display its children in a row, except for its [\`title\`](#title) and [\`subtitle\`](#subtitle).`,
      availableValues: aa,
      valueType: "string",
      defaultValue: Ko.orientation
    }
  },
  events: {
    click: ho(ht)
  },
  themeVars: j(So.themeVars),
  defaultThemeVars: {
    [`padding-${ht}`]: "$space-4",
    [`border-${ht}`]: "1px solid $borderColor",
    [`borderRadius-${ht}`]: "$borderRadius",
    [`boxShadow-${ht}`]: "none",
    light: {
      [`backgroundColor-${ht}`]: "white"
    },
    dark: {
      [`backgroundColor-${ht}`]: "$color-surface-900"
    }
  }
}), gm = {
  throttleWaitInMs: 0
}, Ii = "ChangeListener", Tm = k({
  description: `\`${Ii}\` is a functional component (it renders no UI) to trigger an action when a particular value (component property, state, etc.) changes.`,
  props: {
    listenTo: {
      description: "Value to the changes of which this component listens.",
      valueType: "any"
    },
    throttleWaitInMs: {
      description: "This variable sets a throttling time (in milliseconds) to apply when executing the `didChange` event handler. All changes within that throttling time will only fire the `didChange` event once.",
      valueType: "number",
      defaultValue: gm.throttleWaitInMs
    }
  },
  events: {
    didChange: tt(Ii)
  }
}), ym = `'{"Input:borderRadius-Checkbox-default": "var(--xmlui-borderRadius-Checkbox-default)", "Input:borderColor-Checkbox-default": "var(--xmlui-borderColor-Checkbox-default)", "Input:backgroundColor-Checkbox-default": "var(--xmlui-backgroundColor-Checkbox-default)", "Input:outlineWidth-Checkbox-default--focus": "var(--xmlui-outlineWidth-Checkbox-default--focus)", "Input:outlineColor-Checkbox-default--focus": "var(--xmlui-outlineColor-Checkbox-default--focus)", "Input:outlineStyle-Checkbox-default--focus": "var(--xmlui-outlineStyle-Checkbox-default--focus)", "Input:outlineOffset-Checkbox-default--focus": "var(--xmlui-outlineOffset-Checkbox-default--focus)", "Input:borderColor-Checkbox-default--hover": "var(--xmlui-borderColor-Checkbox-default--hover)", "Input:backgroundColor-Checkbox--disabled": "var(--xmlui-backgroundColor-Checkbox--disabled)", "Input:borderColor-Checkbox--disabled": "var(--xmlui-borderColor-Checkbox--disabled)", "Input:borderRadius-Checkbox-error": "var(--xmlui-borderRadius-Checkbox-error)", "Input:borderColor-Checkbox-error": "var(--xmlui-borderColor-Checkbox-error)", "Input:backgroundColor-Checkbox-error": "var(--xmlui-backgroundColor-Checkbox-error)", "Input:outlineWidth-Checkbox-error--focus": "var(--xmlui-outlineWidth-Checkbox-error--focus)", "Input:outlineColor-Checkbox-error--focus": "var(--xmlui-outlineColor-Checkbox-error--focus)", "Input:outlineStyle-Checkbox-error--focus": "var(--xmlui-outlineStyle-Checkbox-error--focus)", "Input:outlineOffset-Checkbox-error--focus": "var(--xmlui-outlineOffset-Checkbox-error--focus)", "Input:borderRadius-Checkbox-warning": "var(--xmlui-borderRadius-Checkbox-warning)", "Input:borderColor-Checkbox-warning": "var(--xmlui-borderColor-Checkbox-warning)", "Input:backgroundColor-Checkbox-warning": "var(--xmlui-backgroundColor-Checkbox-warning)", "Input:outlineWidth-Checkbox-warning--focus": "var(--xmlui-outlineWidth-Checkbox-warning--focus)", "Input:outlineColor-Checkbox-warning--focus": "var(--xmlui-outlineColor-Checkbox-warning--focus)", "Input:outlineStyle-Checkbox-warning--focus": "var(--xmlui-outlineStyle-Checkbox-warning--focus)", "Input:outlineOffset-Checkbox-warning--focus": "var(--xmlui-outlineOffset-Checkbox-warning--focus)", "Input:borderRadius-Checkbox-success": "var(--xmlui-borderRadius-Checkbox-success)", "Input:borderColor-Checkbox-success": "var(--xmlui-borderColor-Checkbox-success)", "Input:backgroundColor-Checkbox-success": "var(--xmlui-backgroundColor-Checkbox-success)", "Input:outlineWidth-Checkbox-success--focus": "var(--xmlui-outlineWidth-Checkbox-success--focus)", "Input:outlineColor-Checkbox-success--focus": "var(--xmlui-outlineColor-Checkbox-success--focus)", "Input:outlineStyle-Checkbox-success--focus": "var(--xmlui-outlineStyle-Checkbox-success--focus)", "Input:outlineOffset-Checkbox-success--focus": "var(--xmlui-outlineOffset-Checkbox-success--focus)", "backgroundColor-indicator-Checkbox": "var(--xmlui-backgroundColor-indicator-Checkbox)", "Input:borderColor-checked-Checkbox": "var(--xmlui-borderColor-checked-Checkbox)", "Input:backgroundColor-checked-Checkbox": "var(--xmlui-backgroundColor-checked-Checkbox)", "Input:borderColor-checked-Checkbox-error": "var(--xmlui-borderColor-checked-Checkbox-error)", "Input:backgroundColor-checked-Checkbox-error": "var(--xmlui-backgroundColor-checked-Checkbox-error)", "Input:borderColor-checked-Checkbox-warning": "var(--xmlui-borderColor-checked-Checkbox-warning)", "Input:backgroundColor-checked-Checkbox-warning": "var(--xmlui-backgroundColor-checked-Checkbox-warning)", "Input:borderColor-checked-Checkbox-success": "var(--xmlui-borderColor-checked-Checkbox-success)", "Input:backgroundColor-checked-Checkbox-success": "var(--xmlui-backgroundColor-checked-Checkbox-success)", "Input:borderColor-Switch": "var(--xmlui-borderColor-Switch)", "Input:backgroundColor-Switch": "var(--xmlui-backgroundColor-Switch)", "Input:borderColor-Switch-default--hover": "var(--xmlui-borderColor-Switch-default--hover)", "Input:backgroundColor-Switch--disabled": "var(--xmlui-backgroundColor-Switch--disabled)", "Input:borderColor-Switch--disabled": "var(--xmlui-borderColor-Switch--disabled)", "Input:borderColor-Switch-error": "var(--xmlui-borderColor-Switch-error)", "Input:borderColor-Switch-warning": "var(--xmlui-borderColor-Switch-warning)", "Input:borderColor-Switch-success": "var(--xmlui-borderColor-Switch-success)", "backgroundColor-indicator-Switch": "var(--xmlui-backgroundColor-indicator-Switch)", "Input:borderColor-checked-Switch": "var(--xmlui-borderColor-checked-Switch)", "Input:backgroundColor-checked-Switch": "var(--xmlui-backgroundColor-checked-Switch)", "Input:borderColor-checked-Switch-error": "var(--xmlui-borderColor-checked-Switch-error)", "Input:backgroundColor-checked-Switch-error": "var(--xmlui-backgroundColor-checked-Switch-error)", "Input:borderColor-checked-Switch-warning": "var(--xmlui-borderColor-checked-Switch-warning)", "Input:backgroundColor-checked-Switch-warning": "var(--xmlui-backgroundColor-checked-Switch-warning)", "Input:borderColor-checked-Switch-success": "var(--xmlui-borderColor-checked-Switch-success)", "Input:backgroundColor-checked-Switch-success": "var(--xmlui-backgroundColor-checked-Switch-success)", "Input:outlineWidth-Switch--focus": "var(--xmlui-outlineWidth-Switch--focus)", "Input:outlineColor-Switch--focus": "var(--xmlui-outlineColor-Switch--focus)", "Input:outlineStyle-Switch--focus": "var(--xmlui-outlineStyle-Switch--focus)", "Input:outlineOffset-Switch--focus": "var(--xmlui-outlineOffset-Switch--focus)"}'`, Cm = "_resetAppearance_m9kqa_13", km = "_label_m9kqa_21", Sm = "_inputContainer_m9kqa_25", wm = "_checkbox_m9kqa_33", Hm = "_error_m9kqa_62", Bm = "_warning_m9kqa_73", Im = "_valid_m9kqa_84", qt = {
  themeVars: ym,
  resetAppearance: Cm,
  label: km,
  inputContainer: Sm,
  checkbox: wm,
  error: Hm,
  warning: Bm,
  valid: Im,
  switch: "_switch_m9kqa_144"
}, Et = {
  initialValue: !1,
  value: !1,
  enabled: !0,
  validationStatus: "none",
  indeterminate: !1
}, Ea = ve(function({
  id: t,
  initialValue: r = Et.initialValue,
  value: o = Et.value,
  enabled: a = Et.enabled,
  style: n,
  readOnly: i,
  validationStatus: l = Et.validationStatus,
  updateState: s = de,
  onDidChange: v = de,
  onFocus: x = de,
  onBlur: c = de,
  variant: T = "checkbox",
  indeterminate: b = Et.indeterminate,
  className: f,
  label: y,
  labelPosition: w = "end",
  labelWidth: _,
  labelBreak: H,
  required: I,
  registerComponentApi: R,
  inputRenderer: F
}, Z) {
  const V = po(), W = t || V, N = Ne.useRef(null);
  ee(() => {
    s({ value: r }, { initial: !0 });
  }, [r, s]);
  const O = X(
    (z) => {
      var A;
      ((A = N.current) == null ? void 0 : A.checked) !== z && (s({ value: z }), v(z));
    },
    [v, s]
  ), h = X(
    (z) => {
      i || (s({ value: z.target.checked }), v(z.target.checked));
    },
    [v, i, s]
  ), p = X(() => {
    x == null || x();
  }, [x]), g = X(() => {
    c == null || c();
  }, [c]);
  ee(() => {
    typeof b == "boolean" && N.current && (N.current.indeterminate = b);
  }, [b]);
  const C = X(() => {
    var z;
    (z = N.current) == null || z.focus();
  }, []), L = Le((z) => {
    O(z);
  });
  ee(() => {
    R == null || R({
      focus: C,
      setValue: L
    });
  }, [C, R, L]);
  const q = ce(
    () => /* @__PURE__ */ m(
      "input",
      {
        id: W,
        ref: N,
        type: "checkbox",
        role: T,
        checked: o,
        disabled: !a,
        required: I,
        readOnly: i,
        "aria-readonly": i,
        "aria-checked": o,
        onChange: h,
        onFocus: p,
        onBlur: g,
        className: le(qt.resetAppearance, f, {
          [qt.checkbox]: T === "checkbox",
          [qt.switch]: T === "switch",
          [qt.error]: l === "error",
          [qt.warning]: l === "warning",
          [qt.valid]: l === "valid"
        })
      }
    ),
    [
      W,
      f,
      a,
      g,
      p,
      h,
      i,
      I,
      l,
      o,
      T
    ]
  );
  return /* @__PURE__ */ m(
    yt,
    {
      ref: Z,
      id: W,
      label: y,
      style: n,
      labelPosition: w,
      labelWidth: _,
      labelBreak: H,
      required: I,
      enabled: a,
      isInputTemplateUsed: !!F,
      shrinkToLabel: !0,
      labelStyle: { pointerEvents: i ? "none" : void 0 },
      children: F ? /* @__PURE__ */ J("label", { className: qt.label, children: [
        /* @__PURE__ */ m("div", { className: qt.inputContainer, children: q }),
        F({
          $checked: o
        })
      ] }) : q
    }
  );
}), Ie = "Checkbox", $m = k({
  status: "stable",
  description: `The \`${Ie}\` component allows users to make binary choices, typically between checked or unchecked. It consists of a small box that can be toggled on or off by clicking on it.`,
  props: {
    indeterminate: Yn(Et.indeterminate),
    label: qe(),
    labelPosition: Dt("end"),
    labelWidth: Zt(Ie),
    labelBreak: Jt(Ie),
    required: Nt(),
    initialValue: St(Et.initialValue),
    autoFocus: rt(),
    readOnly: _t(),
    enabled: Ze(),
    validationStatus: At(Et.validationStatus),
    description: Fe(
      `(*** NOT IMPLEMENTED YET ***) This optional property displays an alternate description of the ${Ie} besides its label.`
    ),
    inputTemplate: {
      description: "This property is used to define a custom checkbox input template"
    }
  },
  events: {
    gotFocus: Ct(Ie),
    lostFocus: kt(Ie),
    didChange: tt(Ie)
  },
  apis: {
    value: jn(),
    setValue: Kt()
  },
  themeVars: j(qt.themeVars),
  defaultThemeVars: {
    [`borderColor-checked-${Ie}-error`]: `$borderColor-${Ie}-error`,
    [`backgroundColor-checked-${Ie}-error`]: `$borderColor-${Ie}-error`,
    [`borderColor-checked-${Ie}-warning`]: `$borderColor-${Ie}-warning`,
    [`backgroundColor-checked-${Ie}-warning`]: `$borderColor-${Ie}-warning`,
    [`borderColor-checked-${Ie}-success`]: `$borderColor-${Ie}-success`,
    [`backgroundColor-checked-${Ie}-success`]: `$borderColor-${Ie}-success`,
    light: {
      [`backgroundColor-indicator-${Ie}`]: "$backgroundColor-primary",
      [`borderColor-checked-${Ie}`]: "$color-primary-500",
      [`backgroundColor-checked-${Ie}`]: "$color-primary-500",
      [`backgroundColor-${Ie}--disabled`]: "$color-surface-200"
    },
    dark: {
      [`backgroundColor-indicator-${Ie}`]: "$backgroundColor-primary",
      [`borderColor-checked-${Ie}`]: "$color-primary-400",
      [`backgroundColor-checked-${Ie}`]: "$color-primary-400",
      [`backgroundColor-${Ie}--disabled`]: "$color-surface-800"
    }
  }
}), Lm = `'{"backgroundColor-ContentSeparator": "var(--xmlui-backgroundColor-ContentSeparator)", "size-ContentSeparator": "var(--xmlui-size-ContentSeparator)"}'`, _m = {
  themeVars: Lm
}, Am = {
  orientation: "horizontal"
}, ua = "ContentSeparator", Nm = k({
  description: `A \`${ua}\` is a component that divides or separates content visually within a layout. It serves as a visual cue to distinguish between different sections or groups of content, helping to improve readability and organization.`,
  props: {
    size: {
      description: "This property defines the component's height (if the `orientation` is horizontal) or the width (if the `orientation` is vertical).",
      valueType: "any"
    },
    orientation: {
      description: "Sets the main axis of the component",
      availableValues: aa,
      defaultValue: Am.orientation,
      valueType: "string"
    }
  },
  themeVars: j(_m.themeVars),
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
}), Wm = `'{"Input:minHeight-DatePicker": "var(--xmlui-minHeight-DatePicker)", "Input:fontSize-DatePicker": "var(--xmlui-fontSize-DatePicker)", "Input:borderRadius-DatePicker-default": "var(--xmlui-borderRadius-DatePicker-default)", "Input:borderColor-DatePicker-default": "var(--xmlui-borderColor-DatePicker-default)", "Input:borderWidth-DatePicker-default": "var(--xmlui-borderWidth-DatePicker-default)", "Input:borderStyle-DatePicker-default": "var(--xmlui-borderStyle-DatePicker-default)", "Input:backgroundColor-DatePicker-default": "var(--xmlui-backgroundColor-DatePicker-default)", "Input:boxShadow-DatePicker-default": "var(--xmlui-boxShadow-DatePicker-default)", "Input:textColor-DatePicker-default": "var(--xmlui-textColor-DatePicker-default)", "Input:padding-DatePicker-default": "var(--xmlui-padding-DatePicker-default)", "Input:borderColor-DatePicker-default--hover": "var(--xmlui-borderColor-DatePicker-default--hover)", "Input:backgroundColor-DatePicker-default--hover": "var(--xmlui-backgroundColor-DatePicker-default--hover)", "Input:boxShadow-DatePicker-default--hover": "var(--xmlui-boxShadow-DatePicker-default--hover)", "Input:textColor-DatePicker-default--hover": "var(--xmlui-textColor-DatePicker-default--hover)", "Input:outlineWidth-DatePicker-default--focus": "var(--xmlui-outlineWidth-DatePicker-default--focus)", "Input:outlineColor-DatePicker-default--focus": "var(--xmlui-outlineColor-DatePicker-default--focus)", "Input:outlineStyle-DatePicker-default--focus": "var(--xmlui-outlineStyle-DatePicker-default--focus)", "Input:outlineOffset-DatePicker-default--focus": "var(--xmlui-outlineOffset-DatePicker-default--focus)", "Input:textColor-placeholder-DatePicker-default": "var(--xmlui-textColor-placeholder-DatePicker-default)", "Input:textColor-adornment-DatePicker-default": "var(--xmlui-textColor-adornment-DatePicker-default)", "Input:borderRadius-DatePicker-error": "var(--xmlui-borderRadius-DatePicker-error)", "Input:borderColor-DatePicker-error": "var(--xmlui-borderColor-DatePicker-error)", "Input:borderWidth-DatePicker-error": "var(--xmlui-borderWidth-DatePicker-error)", "Input:borderStyle-DatePicker-error": "var(--xmlui-borderStyle-DatePicker-error)", "Input:backgroundColor-DatePicker-error": "var(--xmlui-backgroundColor-DatePicker-error)", "Input:boxShadow-DatePicker-error": "var(--xmlui-boxShadow-DatePicker-error)", "Input:textColor-DatePicker-error": "var(--xmlui-textColor-DatePicker-error)", "Input:padding-DatePicker-error": "var(--xmlui-padding-DatePicker-error)", "Input:borderColor-DatePicker-error--hover": "var(--xmlui-borderColor-DatePicker-error--hover)", "Input:backgroundColor-DatePicker-error--hover": "var(--xmlui-backgroundColor-DatePicker-error--hover)", "Input:boxShadow-DatePicker-error--hover": "var(--xmlui-boxShadow-DatePicker-error--hover)", "Input:textColor-DatePicker-error--hover": "var(--xmlui-textColor-DatePicker-error--hover)", "Input:outlineWidth-DatePicker-error--focus": "var(--xmlui-outlineWidth-DatePicker-error--focus)", "Input:outlineColor-DatePicker-error--focus": "var(--xmlui-outlineColor-DatePicker-error--focus)", "Input:outlineStyle-DatePicker-error--focus": "var(--xmlui-outlineStyle-DatePicker-error--focus)", "Input:outlineOffset-DatePicker-error--focus": "var(--xmlui-outlineOffset-DatePicker-error--focus)", "Input:textColor-placeholder-DatePicker-error": "var(--xmlui-textColor-placeholder-DatePicker-error)", "Input:textColor-adornment-DatePicker-error": "var(--xmlui-textColor-adornment-DatePicker-error)", "Input:borderRadius-DatePicker-warning": "var(--xmlui-borderRadius-DatePicker-warning)", "Input:borderColor-DatePicker-warning": "var(--xmlui-borderColor-DatePicker-warning)", "Input:borderWidth-DatePicker-warning": "var(--xmlui-borderWidth-DatePicker-warning)", "Input:borderStyle-DatePicker-warning": "var(--xmlui-borderStyle-DatePicker-warning)", "Input:backgroundColor-DatePicker-warning": "var(--xmlui-backgroundColor-DatePicker-warning)", "Input:boxShadow-DatePicker-warning": "var(--xmlui-boxShadow-DatePicker-warning)", "Input:textColor-DatePicker-warning": "var(--xmlui-textColor-DatePicker-warning)", "Input:padding-DatePicker-warning": "var(--xmlui-padding-DatePicker-warning)", "Input:borderColor-DatePicker-warning--hover": "var(--xmlui-borderColor-DatePicker-warning--hover)", "Input:backgroundColor-DatePicker-warning--hover": "var(--xmlui-backgroundColor-DatePicker-warning--hover)", "Input:boxShadow-DatePicker-warning--hover": "var(--xmlui-boxShadow-DatePicker-warning--hover)", "Input:textColor-DatePicker-warning--hover": "var(--xmlui-textColor-DatePicker-warning--hover)", "Input:outlineWidth-DatePicker-warning--focus": "var(--xmlui-outlineWidth-DatePicker-warning--focus)", "Input:outlineColor-DatePicker-warning--focus": "var(--xmlui-outlineColor-DatePicker-warning--focus)", "Input:outlineStyle-DatePicker-warning--focus": "var(--xmlui-outlineStyle-DatePicker-warning--focus)", "Input:outlineOffset-DatePicker-warning--focus": "var(--xmlui-outlineOffset-DatePicker-warning--focus)", "Input:textColor-placeholder-DatePicker-warning": "var(--xmlui-textColor-placeholder-DatePicker-warning)", "Input:textColor-adornment-DatePicker-warning": "var(--xmlui-textColor-adornment-DatePicker-warning)", "Input:borderRadius-DatePicker-success": "var(--xmlui-borderRadius-DatePicker-success)", "Input:borderColor-DatePicker-success": "var(--xmlui-borderColor-DatePicker-success)", "Input:borderWidth-DatePicker-success": "var(--xmlui-borderWidth-DatePicker-success)", "Input:borderStyle-DatePicker-success": "var(--xmlui-borderStyle-DatePicker-success)", "Input:backgroundColor-DatePicker-success": "var(--xmlui-backgroundColor-DatePicker-success)", "Input:boxShadow-DatePicker-success": "var(--xmlui-boxShadow-DatePicker-success)", "Input:textColor-DatePicker-success": "var(--xmlui-textColor-DatePicker-success)", "Input:padding-DatePicker-success": "var(--xmlui-padding-DatePicker-success)", "Input:borderColor-DatePicker-success--hover": "var(--xmlui-borderColor-DatePicker-success--hover)", "Input:backgroundColor-DatePicker-success--hover": "var(--xmlui-backgroundColor-DatePicker-success--hover)", "Input:boxShadow-DatePicker-success--hover": "var(--xmlui-boxShadow-DatePicker-success--hover)", "Input:textColor-DatePicker-success--hover": "var(--xmlui-textColor-DatePicker-success--hover)", "Input:outlineWidth-DatePicker-success--focus": "var(--xmlui-outlineWidth-DatePicker-success--focus)", "Input:outlineColor-DatePicker-success--focus": "var(--xmlui-outlineColor-DatePicker-success--focus)", "Input:outlineStyle-DatePicker-success--focus": "var(--xmlui-outlineStyle-DatePicker-success--focus)", "Input:outlineOffset-DatePicker-success--focus": "var(--xmlui-outlineOffset-DatePicker-success--focus)", "Input:textColor-placeholder-DatePicker-success": "var(--xmlui-textColor-placeholder-DatePicker-success)", "Input:textColor-adornment-DatePicker-success": "var(--xmlui-textColor-adornment-DatePicker-success)", "Input:backgroundColor-DatePicker--disabled": "var(--xmlui-backgroundColor-DatePicker--disabled)", "Input:textColor-DatePicker--disabled": "var(--xmlui-textColor-DatePicker--disabled)", "Input:borderColor-DatePicker--disabled": "var(--xmlui-borderColor-DatePicker--disabled)", "Input:boxShadow-menu-DatePicker": "var(--xmlui-boxShadow-menu-DatePicker)", "Input:backgroundColor-menu-DatePicker": "var(--xmlui-backgroundColor-menu-DatePicker)", "Input:borderRadius-menu-DatePicker": "var(--xmlui-borderRadius-menu-DatePicker)", "Input:backgroundColor-item-DatePicker--active": "var(--xmlui-backgroundColor-item-DatePicker--active)", "Input:backgroundColor-item-DatePicker--hover": "var(--xmlui-backgroundColor-item-DatePicker--hover)", "Input:textColor-value-DatePicker": "var(--xmlui-textColor-value-DatePicker)"}'`, Om = "_datePicker_1lk6v_13", Rm = "_placeholder_1lk6v_47", zm = "_adornment_1lk6v_50", Vm = "_error_1lk6v_53", Em = "_warning_1lk6v_81", Pm = "_valid_1lk6v_109", Dm = "_disabled_1lk6v_137", Mm = "_indicator_1lk6v_143", Fm = "_datePickerInput_1lk6v_143", Um = "_datePickerValue_1lk6v_147", qm = "_inlinePickerMenu_1lk6v_152", Gm = "_datePickerMenu_1lk6v_269", Ym = "_root_1lk6v_278", Xm = "_vhidden_1lk6v_284", jm = "_button_reset_1lk6v_304", Qm = "_button_1lk6v_304", Zm = "_day_selected_1lk6v_326", Jm = "_months_1lk6v_344", Km = "_month_1lk6v_344", ep = "_table_1lk6v_360", tp = "_with_weeknumber_1lk6v_366", rp = "_caption_1lk6v_371", op = "_multiple_months_1lk6v_379", ap = "_caption_dropdowns_1lk6v_385", ip = "_caption_label_1lk6v_390", np = "_nav_1lk6v_406", lp = "_caption_start_1lk6v_410", dp = "_caption_end_1lk6v_417", sp = "_nav_button_1lk6v_424", up = "_dropdown_year_1lk6v_437", cp = "_dropdown_month_1lk6v_438", mp = "_dropdown_1lk6v_437", pp = "_dropdown_icon_1lk6v_474", hp = "_head_1lk6v_478", xp = "_head_row_1lk6v_482", bp = "_row_1lk6v_483", vp = "_head_cell_1lk6v_487", fp = "_tbody_1lk6v_498", gp = "_tfoot_1lk6v_502", Tp = "_cell_1lk6v_506", yp = "_weeknumber_1lk6v_514", Cp = "_day_1lk6v_326", kp = "_day_today_1lk6v_533", Sp = "_day_outside_1lk6v_533", wp = "_day_range_start_1lk6v_556", Hp = "_day_range_end_1lk6v_556", Bp = "_day_range_middle_1lk6v_580", it = {
  themeVars: Wm,
  datePicker: Om,
  placeholder: Rm,
  adornment: zm,
  error: Vm,
  warning: Em,
  valid: Pm,
  disabled: Dm,
  indicator: Mm,
  datePickerInput: Fm,
  datePickerValue: Um,
  inlinePickerMenu: qm,
  datePickerMenu: Gm,
  root: Ym,
  vhidden: Xm,
  button_reset: jm,
  button: Qm,
  day_selected: Zm,
  months: Jm,
  month: Km,
  table: ep,
  with_weeknumber: tp,
  caption: rp,
  multiple_months: op,
  caption_dropdowns: ap,
  caption_label: ip,
  nav: np,
  caption_start: lp,
  caption_end: dp,
  nav_button: sp,
  dropdown_year: up,
  dropdown_month: cp,
  dropdown: mp,
  dropdown_icon: pp,
  head: hp,
  head_row: xp,
  row: bp,
  head_cell: vp,
  tbody: fp,
  tfoot: gp,
  cell: Tp,
  weeknumber: yp,
  day: Cp,
  day_today: kp,
  day_outside: Sp,
  day_range_start: wp,
  day_range_end: Hp,
  day_range_middle: Bp
}, Ip = ["single", "range"];
var hr = /* @__PURE__ */ ((e) => (e[e.Sunday = 0] = "Sunday", e[e.Monday = 1] = "Monday", e[e.Tuesday = 2] = "Tuesday", e[e.Wednesday = 3] = "Wednesday", e[e.Thursday = 4] = "Thursday", e[e.Friday = 5] = "Friday", e[e.Saturday = 6] = "Saturday", e))(hr || {});
const ea = [
  "MM/dd/yyyy",
  "MM-dd-yyyy",
  "yyyy/MM/dd",
  "yyyy-MM-dd",
  "dd/MM/yyyy",
  "dd-MM-yyyy",
  "yyyyMMdd",
  "MMddyyyy"
], et = {
  mode: "single",
  validationStatus: "none",
  enabled: !0,
  inline: !1,
  dateFormat: "MM/dd/yyyy",
  showWeekNumber: !1,
  weekStartsOn: 0,
  disabledDates: []
}, $p = ve(function({
  id: t,
  initialValue: r,
  value: o,
  mode: a = et.mode,
  enabled: n = et.enabled,
  placeholder: i,
  updateState: l = de,
  validationStatus: s = et.validationStatus,
  onDidChange: v = de,
  onFocus: x = de,
  onBlur: c = de,
  dateFormat: T = et.dateFormat,
  showWeekNumber: b = et.showWeekNumber,
  weekStartsOn: f = et.weekStartsOn,
  fromDate: y,
  toDate: w,
  disabledDates: _ = et.disabledDates,
  style: H,
  registerComponentApi: I,
  inline: R = et.inline,
  startText: F,
  startIcon: Z,
  endText: V,
  endIcon: W
}, N) {
  const O = f >= 0 && f <= 6 ? f : 0, [h, p] = me(!1), [g, C] = me(!1), L = he(null), q = N ? sr(L, N) : L, z = ce(() => {
    if (a === "single" && typeof o == "string")
      return ca(o) || Eo(o);
    if (a === "range" && typeof o == "object")
      return {
        from: ca(o == null ? void 0 : o.from) || Eo(o == null ? void 0 : o.from),
        to: ca(o == null ? void 0 : o.to) || Eo(o == null ? void 0 : o.to)
      };
  }, [o, a]);
  ee(() => {
    if (!ea.includes(T))
      throw new Error(
        `Invalid dateFormat: ${T}. Supported formats are: ${ea.join(", ")}`
      );
  }, [T]);
  const A = ce(() => y ? Yo(y, T, /* @__PURE__ */ new Date()) : void 0, [y, T]), B = ce(() => w ? Yo(w, T, /* @__PURE__ */ new Date()) : void 0, [w, T]), P = ce(() => _ == null ? void 0 : _.map((oe) => Yo(oe, T, /* @__PURE__ */ new Date())), [_, T]), [M, E] = me(!1), { root: G } = tr(), Q = () => {
    p(!0);
  }, K = () => {
    p(!1);
  }, te = () => {
    C(!0);
  }, be = () => {
    C(!1);
  }, Me = X(() => {
    var oe;
    (oe = L == null ? void 0 : L.current) == null || oe.focus();
  }, [L == null ? void 0 : L.current]), We = Le((oe) => {
    const Y = Eo(oe);
    ie(Y);
  });
  ee(() => {
    I == null || I({
      focus: Me,
      setValue: We
    });
  }, [Me, I, We]), ee(() => {
    !h && !g && (c == null || c()), (h || g) && (x == null || x());
  }, [h, g, x, c]), ee(() => {
    l({ value: r }, { initial: !0 });
  }, [r, l]);
  const ie = X(
    (oe) => {
      if (!oe)
        l({ value: void 0 }), v("");
      else if (a === "single") {
        const D = Hr(oe, T);
        l({ value: D }), v(D);
      } else {
        const Y = oe, D = {
          from: Y.from ? Hr(Y.from, T) : "",
          to: Y.to ? Hr(Y.to, T) : ""
        };
        l({ value: D }), v(D);
      }
      a === "single" && E(!1);
    },
    [v, l, a, T]
  );
  return R ? /* @__PURE__ */ m("div", { children: /* @__PURE__ */ m("div", { className: it.inlinePickerMenu, children: /* @__PURE__ */ m(
    gi,
    {
      fixedWeeks: !0,
      fromDate: A,
      toDate: B,
      disabled: P,
      weekStartsOn: O,
      showWeekNumber: b,
      showOutsideDays: !0,
      classNames: it,
      mode: a === "single" ? "single" : "range",
      selected: z,
      onSelect: ie,
      initialFocus: !R,
      numberOfMonths: a === "range" ? 2 : 1
    }
  ) }) }) : /* @__PURE__ */ J(lr.Root, { open: M, onOpenChange: E, modal: !1, children: [
    /* @__PURE__ */ m(lr.Trigger, { asChild: !0, children: /* @__PURE__ */ J(
      "button",
      {
        disabled: !n,
        id: t,
        ref: q,
        style: H,
        className: le(it.datePicker, {
          [it.disabled]: !n,
          [it.error]: s === "error",
          [it.warning]: s === "warning",
          [it.valid]: s === "valid"
        }),
        onFocus: Q,
        onBlur: K,
        children: [
          /* @__PURE__ */ m(so, { text: F, iconName: Z, className: it.adornment }),
          /* @__PURE__ */ m("div", { className: it.datePickerValue, children: a === "single" && z ? /* @__PURE__ */ m(Tt, { children: Hr(z, T) }) : a === "range" && typeof z == "object" && z.from ? z.to ? /* @__PURE__ */ J(Tt, { children: [
            Hr(z.from, T),
            " - ",
            Hr(z.to, T)
          ] }) : /* @__PURE__ */ m(Tt, { children: Hr(z.from, T) }) : i ? /* @__PURE__ */ m("span", { className: it.placeholder, children: i }) : /* @__PURE__ */ m("span", { children: " " }) }),
          /* @__PURE__ */ m(so, { text: V, iconName: W, className: it.adornment })
        ]
      }
    ) }),
    /* @__PURE__ */ m(lr.Portal, { container: G, children: /* @__PURE__ */ m(
      lr.Content,
      {
        align: "start",
        className: it.datePickerMenu,
        onFocus: te,
        onBlur: be,
        onInteractOutside: be,
        children: /* @__PURE__ */ m(
          gi,
          {
            fixedWeeks: !0,
            fromDate: A,
            toDate: B,
            disabled: P,
            weekStartsOn: O,
            showWeekNumber: b,
            showOutsideDays: !0,
            classNames: it,
            mode: a === "single" ? "single" : "range",
            selected: z,
            onSelect: ie,
            initialFocus: !0,
            numberOfMonths: a === "range" ? 2 : 1
          }
        )
      }
    ) })
  ] });
}), Lp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/, ca = (e) => {
  if (e && Lp.test(e)) {
    const t = dd(e);
    if (_n(t))
      return t;
  }
}, Eo = (e) => {
  if (e)
    for (const t of ea) {
      const r = Yo(e, t, /* @__PURE__ */ new Date());
      if (_n(r))
        return r;
    }
}, xt = "DatePicker", _p = k({
  status: "experimental",
  description: "A datepicker component enables the selection of a date or a range of dates in a specified format from an interactive display.",
  props: {
    placeholder: Er(),
    initialValue: St(),
    autoFocus: rt(),
    readOnly: _t(),
    enabled: Ze(et.enabled),
    validationStatus: At(et.validationStatus),
    mode: {
      description: "The mode of the datepicker (single or range)",
      valueType: "string",
      availableValues: Ip,
      defaultValue: et.mode
    },
    dateFormat: {
      description: "The format of the date displayed in the input field",
      valueType: "string",
      defaultValue: et.dateFormat,
      availableValues: ea
    },
    showWeekNumber: {
      description: "Whether to show the week number in the calendar",
      valueType: "boolean",
      defaultValue: et.showWeekNumber
    },
    weekStartsOn: {
      description: "The first day of the week. 0 is Sunday, 1 is Monday, etc.",
      valueType: "number",
      defaultValue: et.weekStartsOn,
      availableValues: [
        {
          value: hr.Sunday,
          description: "Sunday"
        },
        {
          value: hr.Monday,
          description: "Monday"
        },
        {
          value: hr.Tuesday,
          description: "Tuesday"
        },
        {
          value: hr.Wednesday,
          description: "Wednesday"
        },
        {
          value: hr.Thursday,
          description: "Thursday"
        },
        {
          value: hr.Friday,
          description: "Friday"
        },
        {
          value: hr.Saturday,
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
      defaultValue: et.inline
    },
    startText: Ka(),
    startIcon: ei(),
    endText: ti(),
    endIcon: ri()
  },
  events: {
    didChange: tt(xt),
    gotFocus: Ct(xt),
    lostFocus: kt(xt)
  },
  apis: {
    focus: er(xt),
    value: u(
      "You can query the component's value. If no value is set, it will retrieve `undefined`."
    ),
    setValue: Kt()
  },
  themeVars: j(it.themeVars),
  defaultThemeVars: {
    [`boxShadow-menu-${xt}`]: "$boxShadow-md",
    [`borderRadius-menu-${xt}`]: "$borderRadius",
    [`textColor-value-${xt}`]: "$textColor-primary",
    light: {
      [`backgroundColor-menu-${xt}`]: "$color-surface-50",
      [`backgroundColor-item-${xt}--hover`]: "$color-surface-100",
      [`backgroundColor-item-${xt}--active`]: "$color-surface-200"
    },
    dark: {
      [`backgroundColor-menu-${xt}`]: "$color-surface-950",
      [`backgroundColor-item-${xt}--hover`]: "$color-surface-600",
      [`backgroundColor-item-${xt}--active`]: "$color-surface-700"
    }
  }
}), Ap = `'{"backgroundColor-DropdownMenu": "var(--xmlui-backgroundColor-DropdownMenu)", "borderRadius-DropdownMenu": "var(--xmlui-borderRadius-DropdownMenu)", "boxShadow-DropdownMenu": "var(--xmlui-boxShadow-DropdownMenu)", "borderColor-DropdownMenu-content": "var(--xmlui-borderColor-DropdownMenu-content)", "borderWidth-DropdownMenu-content": "var(--xmlui-borderWidth-DropdownMenu-content)", "borderStyle-DropdownMenu-content": "var(--xmlui-borderStyle-DropdownMenu-content)", "minWidth-DropdownMenu": "var(--xmlui-minWidth-DropdownMenu)", "backgroundColor-MenuItem": "var(--xmlui-backgroundColor-MenuItem)", "color-MenuItem": "var(--xmlui-color-MenuItem)", "fontFamily-MenuItem": "var(--xmlui-fontFamily-MenuItem)", "gap-MenuItem": "var(--xmlui-gap-MenuItem)", "fontSize-MenuItem": "var(--xmlui-fontSize-MenuItem)", "paddingVertical-MenuItem": "var(--xmlui-paddingVertical-MenuItem)", "paddingHorizontal-MenuItem": "var(--xmlui-paddingHorizontal-MenuItem)", "backgroundColor-MenuItem--hover": "var(--xmlui-backgroundColor-MenuItem--hover)", "backgroundColor-MenuItem--active": "var(--xmlui-backgroundColor-MenuItem--active)", "backgroundColor-MenuItem--active--hover": "var(--xmlui-backgroundColor-MenuItem--active--hover)", "color-MenuItem--hover": "var(--xmlui-color-MenuItem--hover)", "color-MenuItem--active": "var(--xmlui-color-MenuItem--active)", "color-MenuItem--active--hover": "var(--xmlui-color-MenuItem--active--hover)", "marginTop-MenuSeparator": "var(--xmlui-marginTop-MenuSeparator)", "marginBottom-MenuSeparator": "var(--xmlui-marginBottom-MenuSeparator)", "width-MenuSeparator": "var(--xmlui-width-MenuSeparator)", "height-MenuSeparator": "var(--xmlui-height-MenuSeparator)", "color-MenuSeparator": "var(--xmlui-color-MenuSeparator)"}'`, Np = "_DropdownMenuContent_28w8e_13", Wp = "_DropdownMenuItem_28w8e_26", Op = "_active_28w8e_50", Rp = "_wrapper_28w8e_60", Or = {
  themeVars: Ap,
  DropdownMenuContent: Np,
  DropdownMenuItem: Wp,
  active: Op,
  wrapper: Rp
}, jt = {
  alignment: "start",
  triggerButtonVariant: "ghost",
  triggerButtonThemeColor: "primary",
  triggerButtonIcon: "chevrondown",
  triggerButtonIconPosition: "end"
};
ve(function({
  triggerTemplate: t,
  children: r,
  label: o,
  registerComponentApi: a,
  style: n,
  onWillOpen: i,
  alignment: l = jt.alignment,
  disabled: s = !1,
  triggerButtonVariant: v = jt.triggerButtonVariant,
  triggerButtonThemeColor: x = jt.triggerButtonThemeColor,
  triggerButtonIcon: c = jt.triggerButtonIcon,
  triggerButtonIconPosition: T = jt.triggerButtonIconPosition
}, b) {
  const { root: f } = tr(), [y, w] = me(!1);
  return ee(() => {
    a == null || a({
      close: () => w(!1)
    });
  }, [a]), /* @__PURE__ */ J(
    lr.Root,
    {
      open: y,
      onOpenChange: async (_) => {
        _ && await (i == null ? void 0 : i()) === !1 || w(_);
      },
      children: [
        /* @__PURE__ */ m(lr.Trigger, { asChild: !0, disabled: s, ref: b, children: t || /* @__PURE__ */ m(
          st,
          {
            icon: /* @__PURE__ */ m(ke, { name: c }),
            iconPosition: T,
            type: "button",
            variant: v,
            themeColor: x,
            disabled: s,
            children: o
          }
        ) }),
        /* @__PURE__ */ m(lr.Portal, { container: f, children: /* @__PURE__ */ m(
          lr.Content,
          {
            align: l,
            style: n,
            className: Or.DropdownMenuContent,
            children: r
          }
        ) })
      ]
    }
  );
});
const ta = {
  iconPosition: "start",
  active: !1
};
ve(function({
  children: t,
  onClick: r = de,
  label: o,
  style: a,
  icon: n,
  iconPosition: i = ta.iconPosition,
  active: l = ta.active
}, s) {
  const v = i === "start";
  return /* @__PURE__ */ J(
    lr.Item,
    {
      style: a,
      className: le(Or.DropdownMenuItem, {
        [Or.active]: l
      }),
      onClick: (x) => {
        x.stopPropagation(), r(x);
      },
      ref: s,
      children: [
        v && n,
        /* @__PURE__ */ m("div", { className: Or.wrapper, children: o ?? t }),
        !v && n
      ]
    }
  );
});
const Yt = "DropdownMenu", zp = k({
  description: "This component represents a dropdown menu with a trigger. When the user clicks the trigger, the dropdown menu displays its items.",
  props: {
    label: qe(),
    triggerTemplate: Qn(Yt),
    alignment: {
      description: "This property allows you to determine the alignment of the dropdown panel with the displayed menu items.",
      valueType: "string",
      availableValues: Fn,
      defaultValue: jt.alignment
    },
    enabled: Ze(),
    triggerButtonVariant: {
      description: "This property defines the theme variant of the `Button` as the dropdown menu's trigger. It has no effect when a custom trigger is defined with `triggerTemplate`.",
      valueType: "string",
      availableValues: Za,
      defaultValue: jt.triggerButtonVariant
    },
    triggerButtonThemeColor: {
      description: "This property defines the theme color of the `Button` as the dropdown menu's trigger. It has no effect when a custom trigger is defined with `triggerTemplate`.",
      valueType: "string",
      availableValues: Qa,
      defaultValue: jt.triggerButtonThemeColor
    },
    triggerButtonIcon: {
      description: "This property defines the icon to display on the trigger button.",
      defaultValue: jt.triggerButtonIcon,
      valueType: "string"
    },
    triggerButtonIconPosition: {
      description: "This property defines the position of the icon on the trigger button.",
      defaultValue: jt.triggerButtonIconPosition,
      valueType: "string",
      availableValues: Ja
    }
  },
  events: {
    willOpen: u(`This event fires when the \`${Yt}\` component is opened.`)
  },
  apis: {
    close: u("This method command closes the dropdown.")
  },
  themeVars: j(Or.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${Yt}`]: "$backgroundColor-primary",
    [`minWidth-${Yt}`]: "160px",
    [`boxShadow-${Yt}`]: "$boxShadow-xl",
    [`borderStyle-${Yt}-content`]: "solid",
    [`borderRadius-${Yt}`]: "$borderRadius"
  }
}), Bt = "MenuItem", Vp = k({
  description: "This property represents a leaf item in a menu hierarchy. Clicking the item triggers an action.",
  docFolder: Yt,
  props: {
    iconPosition: {
      description: "This property allows you to determine the position of the icon displayed in the menu item.",
      valueType: "string",
      availableValues: Ja,
      defaultValue: ta.iconPosition
    },
    icon: {
      description: "This property names an optional icon to display with the menu item.",
      valueType: "string"
    },
    label: qe(),
    to: {
      description: "This property defines the URL of the menu item. If this property is defined (and the `click` event does not have an event handler), clicking the menu item navigates to this link.",
      valueType: "string"
    },
    active: {
      description: "This property indicates if the specified menu item is active.",
      valueType: "boolean",
      defaultValue: ta.active
    }
  },
  events: {
    click: ho(Bt)
  },
  themeVars: j(Or.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${Bt}`]: "$backgroundColor-dropdown-item",
    [`color-${Bt}`]: "$textColor-primary",
    [`fontFamily-${Bt}`]: "$fontFamily",
    [`fontSize-${Bt}`]: "$fontSize-small",
    [`paddingVertical-${Bt}`]: "$space-2",
    [`paddingHorizontal-${Bt}`]: "$space-3",
    [`backgroundColor-${Bt}--hover`]: "$backgroundColor-dropdown-item--hover",
    [`color-${Bt}--hover`]: "inherit",
    [`gap-${Bt}`]: "$space-2",
    [`color-${Bt}--active`]: "$color-primary",
    [`backgroundColor-${Bt}--active`]: "$backgroundColor-dropdown-item--active",
    light: {},
    dark: {}
  }
}), Ep = "SubMenuItem", Pp = k({
  description: "This component represents a nested menu item within another menu or menu item.",
  docFolder: Yt,
  props: {
    label: qe(),
    triggerTemplate: Qn(Ep)
  }
}), Gr = "MenuSeparator", Dp = k({
  description: "This component displays a separator line between menu items.",
  docFolder: Yt,
  themeVars: j(Or.themeVars),
  defaultThemeVars: {
    [`marginTop-${Gr}`]: "$space-1",
    [`marginBottom-${Gr}`]: "$space-1",
    [`width-${Gr}`]: "100%",
    [`height-${Gr}`]: "1px",
    [`color-${Gr}`]: "$borderColor-dropdown-item",
    [`marginHorizontal-${Gr}`]: "12px"
  }
}), Mp = "EmojiSelector", Fp = k({
  status: "experimental",
  description: `The \`${Mp}\` component provides users with a graphical interface to browse, search and select emojis to insert into text fields, messages, or other forms of communication.`,
  props: {
    autoFocus: rt()
  },
  events: {
    select: u("This event is fired when the user selects an emoticon from this component.")
  }
}), Up = '"[]"', qp = "_container_1hin1_13", Gp = "_buttonStart_1hin1_22", Yp = "_buttonEnd_1hin1_26", Xp = "_textBoxWrapper_1hin1_30", jp = "_button_1hin1_22", ro = {
  themeVars: Up,
  container: qp,
  buttonStart: Gp,
  buttonEnd: Yp,
  textBoxWrapper: Xp,
  button: jp
}, { useDropzone: Qp } = cd, Zp = ({
  id: e,
  enabled: t = !0,
  style: r,
  placeholder: o,
  buttonPosition: a = "end",
  buttonLabel: n = "Browse",
  buttonIcon: i,
  buttonIconPosition: l,
  variant: s,
  buttonThemeColor: v,
  buttonSize: x,
  autoFocus: c,
  validationStatus: T,
  updateState: b = de,
  onDidChange: f = de,
  onFocus: y = de,
  onBlur: w = de,
  registerComponentApi: _,
  value: H,
  initialValue: I,
  acceptsFileType: R,
  multiple: F = !1,
  directory: Z = !1,
  label: V,
  labelPosition: W,
  labelWidth: N,
  labelBreak: O,
  required: h
}) => {
  const p = $i(I) ? I : void 0, g = $i(H) ? H : void 0, C = he(null), L = typeof R == "string" ? R : R == null ? void 0 : R.join(",");
  ee(() => {
    c && setTimeout(() => {
      var Q;
      (Q = C.current) == null || Q.focus();
    }, 0);
  }, [c]), ee(() => {
    b({ value: p }, { initial: !0 });
  }, [p, b]);
  const q = X(() => {
    w == null || w();
  }, [w]), z = X(() => {
    var Q;
    (Q = C.current) == null || Q.focus();
  }, []), A = X(
    (Q) => {
      Q.length && (b({ value: Q }), f(Q));
    },
    [b, f]
  ), { getRootProps: B, getInputProps: P, open: M } = Qp({
    disabled: !t,
    multiple: F || Z,
    onDrop: A,
    noClick: !0,
    noKeyboard: !0,
    noDragEventsBubbling: !0,
    useFsAccessApi: Z === !1
  }), E = X(() => {
    y == null || y();
  }, [y]), G = Le(() => {
    M();
  });
  return ee(() => {
    _ == null || _({
      focus: z,
      open: G
    });
  }, [z, G, _]), /* @__PURE__ */ m(
    yt,
    {
      labelPosition: W,
      label: V,
      labelWidth: N,
      labelBreak: O,
      required: h,
      enabled: t,
      onFocus: y,
      onBlur: w,
      style: r,
      children: /* @__PURE__ */ J(
        "div",
        {
          className: le(ro.container, {
            [ro.buttonStart]: a === "start",
            [ro.buttonEnd]: a === "end"
          }),
          children: [
            /* @__PURE__ */ J(
              "button",
              {
                ...B({
                  tabIndex: 0,
                  onFocus: E,
                  onBlur: q,
                  disabled: !t,
                  className: ro.textBoxWrapper,
                  onClick: M,
                  ref: C,
                  type: "button"
                }),
                children: [
                  /* @__PURE__ */ m(md.Root, { children: /* @__PURE__ */ m(
                    "input",
                    {
                      ...P({
                        webkitdirectory: Z ? "true" : void 0
                      }),
                      accept: L
                    }
                  ) }),
                  /* @__PURE__ */ m(
                    Ra,
                    {
                      placeholder: o,
                      enabled: t,
                      value: (g == null ? void 0 : g.map((Q) => Q.name).join(", ")) || "",
                      validationStatus: T,
                      readOnly: !0,
                      tabIndex: -1
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ m(
              st,
              {
                id: e,
                disabled: !t,
                type: "button",
                onClick: M,
                icon: i,
                iconPosition: l,
                variant: s,
                themeColor: v,
                size: x,
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
function Jp(e) {
  return e instanceof File;
}
function $i(e) {
  return Array.isArray(e) && e.every(Jp);
}
const $r = "FileInput", Kp = k({
  description: `The \`${$r}\` is a user interface component that allows users to select files from their device's file system for upload (or processing its content otherwise).`,
  status: "experimental",
  props: {
    placeholder: Er(),
    initialValue: St(),
    autoFocus: rt(),
    required: Nt(),
    readOnly: _t(),
    enabled: Ze(),
    validationStatus: At(),
    label: qe(),
    labelPosition: Dt("top"),
    labelWidth: Zt($r),
    labelBreak: Jt($r),
    buttonVariant: u("The button variant to use", ls),
    buttonLabel: u("This property is an optional string to set a label for the button part."),
    buttonIcon: u("The ID of the icon to display in the button"),
    buttonIconPosition: u(
      "This optional string determines the location of the button icon.",
      ss
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
    buttonSize: u("The size of the button (small, medium, large)", ja),
    buttonThemeColor: u(
      "The button color scheme (primary, secondary, attention)",
      as
    )
  },
  events: {
    didChange: tt($r),
    gotFocus: Ct($r),
    lostFocus: kt($r)
  },
  apis: {
    value: u(
      "By setting an ID for the component, you can refer to the value of the field if set. If no value is set, the value will be undefined."
    ),
    setValue: u(
      "(**NOT IMPLEMENTED YET**) You can use this method to set the component's current value programmatically."
    ),
    focus: er($r),
    open: u("This API command triggers the file browsing dialog to open.")
  },
  themeVars: j(ro.themeVars)
}), eh = `'{"backgroundColor-FileUploadDropZone": "var(--xmlui-backgroundColor-FileUploadDropZone)", "textColor-FileUploadDropZone": "var(--xmlui-textColor-FileUploadDropZone)", "backgroundColor-dropping-FileUploadDropZone": "var(--xmlui-backgroundColor-dropping-FileUploadDropZone)", "opacity-dropping-FileUploadDropZone": "var(--xmlui-opacity-dropping-FileUploadDropZone)"}'`, th = {
  themeVars: eh
}, rh = "FileUploadDropZone", oh = k({
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
  themeVars: j(th.themeVars),
  defaultThemeVars: {
    "backgroundColor-FileUploadDropZone": "$backgroundColor",
    "backgroundColor-dropping-FileUploadDropZone": "$backgroundColor--selected",
    "opacity-dropping-FileUploadDropZone": "0.5",
    "textColor-FileUploadDropZone": "$textColor",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), ah = '"[]"', ih = "_outer_aarhe_13", nh = "_flowContainer_aarhe_17", lh = "_horizontal_aarhe_21", dh = "_flowItem_aarhe_24", sh = "_forceBreak_aarhe_47", uh = "_starSized_aarhe_47", yr = {
  themeVars: ah,
  outer: ih,
  flowContainer: nh,
  horizontal: lh,
  flowItem: dh,
  break: "_break_aarhe_47",
  forceBreak: sh,
  starSized: uh
}, ch = "xmlui", mh = /(\$[a-zA-Z][a-zA-Z0-9-_]*)/g, ph = /^(true|false)$/, ma = /^\d*\*$/, hh = {
  cssProps: {},
  issues: /* @__PURE__ */ new Set()
};
function xh(e = Rr, t) {
  const r = {
    cssProps: {},
    issues: /* @__PURE__ */ new Set()
  };
  H(t) && (r.cssProps.flexShrink = 0), f("width");
  const o = y(r.cssProps.width, t);
  o !== null && (r.cssProps.flex = o, r.cssProps.flexShrink = 1), f("minWidth"), f("maxWidth"), f("height");
  const a = w(r.cssProps.height, t);
  a !== null && (r.cssProps.flex = a, r.cssProps.flexShrink = 1), f("minHeight"), f("maxHeight"), f("top"), f("right"), f("bottom"), f("left"), f("gap"), f("padding");
  const n = b("paddingHorizontal");
  n && (r.cssProps.paddingLeft = n, r.cssProps.paddingRight = n), f("paddingRight"), f("paddingLeft");
  const i = b("paddingVertical");
  i && (r.cssProps.paddingTop = i, r.cssProps.paddingBottom = i), f("paddingTop"), f("paddingBottom"), f("margin");
  const l = b("marginHorizontal");
  l && (r.cssProps.marginLeft = l, r.cssProps.marginRight = l), f("marginRight"), f("marginLeft");
  const s = b("marginVertical");
  s && (r.cssProps.marginTop = s, r.cssProps.marginBottom = s), f("marginTop"), f("marginBottom"), f("border");
  const v = b("borderHorizontal");
  v && (r.cssProps.borderLeft = v, r.cssProps.borderRight = v), f("borderRight"), f("borderLeft");
  const x = b("borderVertical");
  x && (r.cssProps.borderTop = x, r.cssProps.borderBottom = x), f("borderTop"), f("borderBottom"), f("borderColor"), f("borderStyle"), f("borderWidth"), f("borderRadius"), f("radiusTopLeft", "borderTopLeftRadius"), f("radiusTopRight", "borderTopRightRadius"), f("radiusBottomLeft", "borderBottomLeftRadius"), f("radiusBottomRight", "borderBottomRightRadius"), f("color"), f("fontFamily"), f("fontSize"), f("fontWeight"), f("fontStyle"), f("textDecoration"), f("textDecorationLine"), f("textDecorationColor"), f("textDecorationStyle"), f("textDecorationThickness"), f("textUnderlineOffset"), f("userSelect"), f("letterSpacing"), f("textTransform"), f("lineHeight"), f("textAlign"), f("textAlignLast"), f("textWrap"), f("backgroundColor"), f("background"), f("boxShadow"), f("direction"), f("overflowX"), f("overflowY"), f("zIndex"), f("opacity"), f("zoom"), f("cursor"), f("whiteSpace"), f("outline"), f("outlineWidth"), f("outlineColor"), f("outlineStyle"), f("outlineOffset");
  const c = b("wrapContent");
  c && (r.cssProps.flexWrap = c === "true" ? "wrap" : "nowrap"), f("canShrink", "flexShrink");
  const T = b("canShrink");
  if (T && (r.cssProps.flexShrink = T === "true" ? 1 : 0), $a(r.cssProps) && $a(r.issues))
    return hh;
  return r;
  function b(I) {
    var Z, V;
    const R = F();
    if (((Z = t == null ? void 0 : t.mediaSize) == null ? void 0 : Z.sizeIndex) !== void 0) {
      const W = (V = t.mediaSize) == null ? void 0 : V.sizeIndex, N = F("xs"), O = F("sm"), h = F("md"), p = F("lg"), g = F("xl"), C = F("xxl");
      let L;
      switch (W) {
        case 0:
          L = N ?? O ?? h;
          break;
        case 1:
          L = O ?? h;
          break;
        case 2:
          L = h;
          break;
        case 3:
          L = p;
          break;
        case 4:
          L = g ?? p;
          break;
        case 5:
          L = C ?? g ?? p;
          break;
      }
      return L ?? R;
    }
    return R;
    function F(W = "") {
      const N = W ? `${I}-${W}` : I;
      let O = e[N];
      if (O == null)
        return;
      typeof O == "string" ? O = O.trim() : O = O.toString();
      const h = O ? O.replace(
        mh,
        (g) => bh(g.trim())
      ) : void 0;
      if (O !== h)
        return h;
      const p = vh[I];
      if (!p || p.length === 0)
        return h;
      for (const g of p)
        if (g.test(h))
          return h;
      return r.issues.add(N), h;
    }
  }
  function f(I, R = "") {
    const F = b(I);
    F && (r.cssProps[R || I] = F);
  }
  function y(I, R) {
    return I && H(R) === "horizontal" && ma.test(I.toString()) ? _(I.toString()) : null;
  }
  function w(I, R) {
    return I && H(R) === "vertical" && ma.test(I.toString()) ? _(I.toString()) : null;
  }
  function _(I) {
    if (ma.test(I)) {
      const R = I.slice(0, -1);
      return R === "" ? 1 : parseInt(R, 10);
    }
    return null;
  }
  function H(I) {
    if (!I) return;
    let R = (I == null ? void 0 : I.type) === "Stack" && (I == null ? void 0 : I.orientation);
    return R == null ? void 0 : R.toString();
  }
}
function bh(e) {
  return `var(--${ch}-${e.substring(1)})`;
}
const vh = {
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
  fontStyle: [ph],
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
}, pa = {}, dl = Qt({
  rowGap: 0,
  columnGap: 0,
  setNumberOfChildren: La
}), fh = ({ force: e }) => /* @__PURE__ */ m("div", { className: le(yr.break, { [yr.forceBreak]: e }) });
ve(function({ children: t, forceBreak: r, ...o }, a) {
  const { rowGap: n, columnGap: i, setNumberOfChildren: l } = Lt(dl);
  Lo(() => (l((W) => W + 1), () => {
    l((W) => W - 1);
  }), [l]);
  const { activeTheme: s, root: v } = tr(), x = o.width || "100%", c = o.minWidth || void 0, T = o.maxWidth || void 0, {
    width: b = x,
    minWidth: f,
    maxWidth: y,
    flex: w
  } = ce(() => (
    // --- New layout resolution
    xh(
      { width: x, maxWidth: T, minWidth: c },
      {
        type: "Stack",
        orientation: "horizontal"
      }
    ).cssProps || {}
  ), [T, c, x, s.themeVars]), _ = ce(() => {
    if (b && typeof b == "string" && b.startsWith("var(")) {
      if (!pa[b]) {
        const W = b.substring(4, b.length - 1), N = getComputedStyle(v).getPropertyValue(W);
        pa[b] = N || x;
      }
      return pa[b];
    }
    return b || x;
  }, [x, v, b]), H = typeof _ == "string" && _.endsWith("%"), I = Yu(i), R = ki("(max-width: 420px)"), F = ki("(max-width: 800px)"), Z = {
    minWidth: f,
    maxWidth: y,
    width: H ? `min(${b} * ${R ? "8" : F ? "4" : "1"}, 100%)` : `min(calc(${b} + ${I}), 100%)`,
    paddingBottom: n,
    flex: w
  }, V = w !== void 0;
  return V && (Z.width = "100%", Z.minWidth = f || "1px"), /* @__PURE__ */ J(Tt, { children: [
    /* @__PURE__ */ m(
      "div",
      {
        style: { ...Z, paddingRight: I },
        className: le(yr.flowItem, {
          [yr.starSized]: V
        }),
        ref: a,
        children: t
      }
    ),
    V && /* @__PURE__ */ m(fh, {})
  ] });
});
const Li = {
  columnGap: "$gap-normal",
  rowGap: "$gap-normal"
};
ve(function({ style: t, columnGap: r = 0, rowGap: o = 0, children: a }, n) {
  const [i, l] = me(0), s = i === 1 ? 0 : r, v = wi(o), x = wi(s), c = ce(
    () => ({
      // We put a negative margin on the container to fill the space for the row's last columnGap
      marginRight: `calc(-1 * ${x})`,
      marginBottom: `calc(-1 * ${v})`
    }),
    [x, v]
  ), T = ce(() => ({
    rowGap: v,
    columnGap: x,
    setNumberOfChildren: l
  }), [x, v]);
  return /* @__PURE__ */ m(dl.Provider, { value: T, children: /* @__PURE__ */ m("div", { style: t, ref: n, children: /* @__PURE__ */ m("div", { className: yr.outer, children: /* @__PURE__ */ m("div", { className: le(yr.flowContainer, yr.horizontal), style: c, children: a }) }) }) });
});
const _i = "FlowLayout", gh = k({
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
  themeVars: j(yr.themeVars)
}), Th = `'{"padding-Footer": "var(--xmlui-padding-Footer)", "paddingHorizontal-Footer": "var(--xmlui-paddingHorizontal-Footer, var(--xmlui-padding-Footer))", "paddingVertical-Footer": "var(--xmlui-paddingVertical-Footer, var(--xmlui-padding-Footer))", "paddingLeft-Footer": "var(--xmlui-paddingLeft-Footer, var(--xmlui-paddingHorizontal-Footer, var(--xmlui-padding-Footer)))", "paddingRight-Footer": "var(--xmlui-paddingRight-Footer, var(--xmlui-paddingHorizontal-Footer, var(--xmlui-padding-Footer)))", "paddingTop-Footer": "var(--xmlui-paddingTop-Footer, var(--xmlui-paddingVertical-Footer, var(--xmlui-padding-Footer)))", "paddingBottom-Footer": "var(--xmlui-paddingBottom-Footer, var(--xmlui-paddingVertical-Footer, var(--xmlui-padding-Footer)))", "border-Footer": "var(--xmlui-border-Footer)", "borderHorizontal-Footer": "var(--xmlui-borderHorizontal-Footer, var(--xmlui-border-Footer))", "borderVertical-Footer": "var(--xmlui-borderVertical-Footer, var(--xmlui-border-Footer))", "borderLeft-Footer": "var(--xmlui-borderLeft-Footer, var(--xmlui-borderHorizontal-Footer, var(--xmlui-border-Footer)))", "borderRight-Footer": "var(--xmlui-borderRight-Footer, var(--xmlui-borderHorizontal-Footer, var(--xmlui-border-Footer)))", "borderTop-Footer": "var(--xmlui-borderTop-Footer, var(--xmlui-borderVertical-Footer, var(--xmlui-border-Footer)))", "borderBottom-Footer": "var(--xmlui-borderBottom-Footer, var(--xmlui-borderVertical-Footer, var(--xmlui-border-Footer)))", "borderWidth-Footer": "var(--xmlui-borderWidth-Footer)", "borderHorizontalWidth-Footer": "var(--xmlui-borderHorizontalWidth-Footer, var(--xmlui-borderWidth-Footer))", "borderLeftWidth-Footer": "var(--xmlui-borderLeftWidth-Footer, var(--xmlui-borderHorizontalWidth-Footer, var(--xmlui-borderWidth-Footer)))", "borderRightWidth-Footer": "var(--xmlui-borderRightWidth-Footer, var(--xmlui-borderHorizontalWidth-Footer, var(--xmlui-borderWidth-Footer)))", "borderVerticalWidth-Footer": "var(--xmlui-borderVerticalWidth-Footer, var(--xmlui-borderWidth-Footer))", "borderTopWidth-Footer": "var(--xmlui-borderTopWidth-Footer, var(--xmlui-borderVerticalWidth-Footer, var(--xmlui-borderWidth-Footer)))", "borderBottomWidth-Footer": "var(--xmlui-borderBottomWidth-Footer, var(--xmlui-borderVerticalWidth-Footer, var(--xmlui-borderWidth-Footer)))", "borderStyle-Footer": "var(--xmlui-borderStyle-Footer)", "borderHorizontalStyle-Footer": "var(--xmlui-borderHorizontalStyle-Footer, var(--xmlui-borderStyle-Footer))", "borderLeftStyle-Footer": "var(--xmlui-borderLeftStyle-Footer, var(--xmlui-borderHorizontalStyle-Footer, var(--xmlui-borderStyle-Footer)))", "borderRightStyle-Footer": "var(--xmlui-borderRightStyle-Footer, var(--xmlui-borderHorizontalStyle-Footer, var(--xmlui-borderStyle-Footer)))", "borderVerticalStyle-Footer": "var(--xmlui-borderVerticalStyle-Footer, var(--xmlui-borderStyle-Footer))", "borderTopStyle-Footer": "var(--xmlui-borderTopStyle-Footer, var(--xmlui-borderVerticalStyle-Footer, var(--xmlui-borderStyle-Footer)))", "borderBottomStyle-Footer": "var(--xmlui-borderBottomStyle-Footer, var(--xmlui-borderVerticalStyle-Footer, var(--xmlui-borderStyle-Footer)))", "borderColor-Footer": "var(--xmlui-borderColor-Footer)", "borderHorizontalColor-Footer": "var(--xmlui-borderHorizontalColor-Footer, var(--xmlui-borderColor-Footer))", "borderLeftColor-Footer": "var(--xmlui-borderLeftColor-Footer, var(--xmlui-borderHorizontalColor-Footer, var(--xmlui-borderColor-Footer)))", "borderRightColor-Footer": "var(--xmlui-borderRightColor-Footer, var(--xmlui-borderHorizontalColor-Footer, var(--xmlui-borderColor-Footer)))", "borderVerticalColor-Footer": "var(--xmlui-borderVerticalColor-Footer, var(--xmlui-borderColor-Footer))", "borderTopColor-Footer": "var(--xmlui-borderTopColor-Footer, var(--xmlui-borderVerticalColor-Footer, var(--xmlui-borderColor-Footer)))", "borderBottomColor-Footer": "var(--xmlui-borderBottomColor-Footer, var(--xmlui-borderVerticalColor-Footer, var(--xmlui-borderColor-Footer)))", "radius-start-start-Footer": "var(--xmlui-radius-start-start-Footer, var(--xmlui-borderRadius-Footer))", "radius-start-end-Footer": "var(--xmlui-radius-start-end-Footer, var(--xmlui-borderRadius-Footer))", "radius-end-start-Footer": "var(--xmlui-radius-end-start-Footer, var(--xmlui-borderRadius-Footer))", "radius-end-end-Footer": "var(--xmlui-radius-end-end-Footer, var(--xmlui-borderRadius-Footer))", "backgroundColor-Footer": "var(--xmlui-backgroundColor-Footer)", "textColor-Footer": "var(--xmlui-textColor-Footer)", "height-Footer": "var(--xmlui-height-Footer)", "fontSize-Footer": "var(--xmlui-fontSize-Footer)", "verticalAlign-Footer": "var(--xmlui-verticalAlign-Footer)", "maxWidth-content-Footer": "var(--xmlui-maxWidth-content-Footer)"}'`, yh = {
  themeVars: Th
}, cr = "Footer", Ch = k({
  description: `The \`${cr}\` is a component that acts as a placeholder within \`App\`.`,
  themeVars: j(yh.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${cr}`]: "$backgroundColor-AppHeader",
    [`verticalAlign-${cr}`]: "center",
    [`fontSize-${cr}`]: "$fontSize-small",
    [`textColor-${cr}`]: "$textColor-secondary",
    [`maxWidth-content-${cr}`]: "$maxWidth-content",
    [`border-${cr}`]: "1px solid $borderColor",
    [`padding-${cr}`]: "$space-2 $space-4",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), kh = `'{"gap-Form": "var(--xmlui-gap-Form)", "gap-buttonRow-Form": "var(--xmlui-gap-buttonRow-Form)"}'`, Sh = "_wrapper_wscb6_13", wh = "_buttonRow_wscb6_19", Pa = {
  themeVars: kh,
  wrapper: Sh,
  buttonRow: wh
};
var gt = /* @__PURE__ */ ((e) => (e.FIELD_LOST_FOCUS = "FormActionKind:FIELD_LOST_FOCUS", e.FIELD_VALUE_CHANGED = "FormActionKind:FIELD_VALUE_CHANGED", e.FIELD_FOCUSED = "FormActionKind:FIELD_FOCUSED", e.FIELD_VALIDATED = "FormActionKind:FIELD_VALIDATED", e.FIELD_INITIALIZED = "FormActionKind:FIELD_INITIALIZED", e.FIELD_REMOVED = "FormActionKind:FIELD_REMOVED", e.TRIED_TO_SUBMIT = "FormActionKind:TRIED_TO_SUBMIT", e.BACKEND_VALIDATION_ARRIVED = "FormActionKind:BACKEND_VALIDATION_ARRIVED", e.SUBMITTING = "FormActionKind:SUBMITTING", e.SUBMITTED = "FormActionKind:SUBMITTED", e.RESET = "FormActionKind:RESET", e))(gt || {});
function Hh(e, t) {
  return {
    type: "FormActionKind:FIELD_INITIALIZED",
    payload: {
      uid: e,
      value: t
    }
  };
}
function Bh(e, t) {
  return {
    type: "FormActionKind:FIELD_VALUE_CHANGED",
    payload: {
      uid: e,
      value: t
    }
  };
}
function Ih(e) {
  return {
    type: "FormActionKind:FIELD_FOCUSED",
    payload: {
      uid: e
    }
  };
}
function $h(e) {
  return {
    type: "FormActionKind:FIELD_LOST_FOCUS",
    payload: {
      uid: e
    }
  };
}
function Ai(e, t) {
  return {
    type: "FormActionKind:FIELD_VALIDATED",
    payload: {
      uid: e,
      validationResult: t
    }
  };
}
function Lh(e) {
  return {
    type: "FormActionKind:FIELD_REMOVED",
    payload: {
      uid: e
    }
  };
}
function _h() {
  return {
    type: "FormActionKind:TRIED_TO_SUBMIT",
    payload: {}
  };
}
function Ah() {
  return {
    type: "FormActionKind:SUBMITTING",
    payload: {}
  };
}
function Nh() {
  return {
    type: "FormActionKind:SUBMITTED",
    payload: {}
  };
}
function Wh(e) {
  return {
    type: "FormActionKind:RESET",
    payload: {
      originalSubject: e
    }
  };
}
function Oh({ generalValidationResults: e = [], fieldValidationResults: t = {} }) {
  return {
    type: "FormActionKind:BACKEND_VALIDATION_ARRIVED",
    payload: {
      generalValidationResults: e,
      fieldValidationResults: t
    }
  };
}
const Rh = `'{"padding-ModalDialog": "var(--xmlui-padding-ModalDialog)", "paddingHorizontal-ModalDialog": "var(--xmlui-paddingHorizontal-ModalDialog, var(--xmlui-padding-ModalDialog))", "paddingVertical-ModalDialog": "var(--xmlui-paddingVertical-ModalDialog, var(--xmlui-padding-ModalDialog))", "paddingLeft-ModalDialog": "var(--xmlui-paddingLeft-ModalDialog, var(--xmlui-paddingHorizontal-ModalDialog, var(--xmlui-padding-ModalDialog)))", "paddingRight-ModalDialog": "var(--xmlui-paddingRight-ModalDialog, var(--xmlui-paddingHorizontal-ModalDialog, var(--xmlui-padding-ModalDialog)))", "paddingTop-ModalDialog": "var(--xmlui-paddingTop-ModalDialog, var(--xmlui-paddingVertical-ModalDialog, var(--xmlui-padding-ModalDialog)))", "paddingBottom-ModalDialog": "var(--xmlui-paddingBottom-ModalDialog, var(--xmlui-paddingVertical-ModalDialog, var(--xmlui-padding-ModalDialog)))", "padding-overlay-ModalDialog": "var(--xmlui-padding-overlay-ModalDialog)", "paddingHorizontal-overlay-ModalDialog": "var(--xmlui-paddingHorizontal-overlay-ModalDialog, var(--xmlui-padding-overlay-ModalDialog))", "paddingVertical-overlay-ModalDialog": "var(--xmlui-paddingVertical-overlay-ModalDialog, var(--xmlui-padding-overlay-ModalDialog))", "paddingLeft-overlay-ModalDialog": "var(--xmlui-paddingLeft-overlay-ModalDialog, var(--xmlui-paddingHorizontal-overlay-ModalDialog, var(--xmlui-padding-overlay-ModalDialog)))", "paddingRight-overlay-ModalDialog": "var(--xmlui-paddingRight-overlay-ModalDialog, var(--xmlui-paddingHorizontal-overlay-ModalDialog, var(--xmlui-padding-overlay-ModalDialog)))", "paddingTop-overlay-ModalDialog": "var(--xmlui-paddingTop-overlay-ModalDialog, var(--xmlui-paddingVertical-overlay-ModalDialog, var(--xmlui-padding-overlay-ModalDialog)))", "paddingBottom-overlay-ModalDialog": "var(--xmlui-paddingBottom-overlay-ModalDialog, var(--xmlui-paddingVertical-overlay-ModalDialog, var(--xmlui-padding-overlay-ModalDialog)))", "Dialog:backgroundColor-ModalDialog": "var(--xmlui-backgroundColor-ModalDialog)", "Dialog:backgroundColor-overlay-ModalDialog": "var(--xmlui-backgroundColor-overlay-ModalDialog)", "Dialog:borderRadius-ModalDialog": "var(--xmlui-borderRadius-ModalDialog)", "Dialog:fontFamily-ModalDialog": "var(--xmlui-fontFamily-ModalDialog)", "Dialog:textColor-ModalDialog": "var(--xmlui-textColor-ModalDialog)", "Dialog:minWidth-ModalDialog": "var(--xmlui-minWidth-ModalDialog)", "Dialog:maxWidth-ModalDialog": "var(--xmlui-maxWidth-ModalDialog)", "Dialog:marginBottom-title-ModalDialog": "var(--xmlui-marginBottom-title-ModalDialog)"}'`, zh = "_overlay_it5gt_13", Vh = "_fullScreen_it5gt_21", Eh = "_content_it5gt_27", Ph = "_overlayBg_it5gt_36", Dh = "_dialogTitle_it5gt_70", Mh = "_innerContent_it5gt_76", Fh = "_closeButton_it5gt_102", xr = {
  themeVars: Rh,
  overlay: zh,
  fullScreen: Vh,
  content: Eh,
  overlayBg: Ph,
  dialogTitle: Dh,
  innerContent: Mh,
  closeButton: Fh
}, sl = Ne.createContext(null), Uh = () => {
  const e = po(), { registerForm: t, unRegisterForm: r, requestClose: o, amITheSingleForm: a } = Lt(sl) || {};
  return ee(() => {
    if (t)
      return t(e), () => {
        r == null || r(e);
      };
  }, [e, t, r]), X(() => {
    if (o && a(e))
      return o();
  }, [a, e, o]);
};
Ne.forwardRef(
  ({ isInitiallyOpen: e, onOpen: t, onClose: r, registerComponentApi: o, renderDialog: a }, n) => {
    const i = cl(e, t, r), { doOpen: l, doClose: s, isOpen: v, openParams: x } = i;
    return ee(() => {
      o == null || o({
        open: l,
        close: s
      });
    }, [s, l, o]), v ? /* @__PURE__ */ m(ul.Provider, { value: i, children: a({
      openParams: x,
      ref: n
    }) }) : null;
  }
);
const ul = Ne.createContext(null);
function cl(e, t, r) {
  const [o, a] = me(e), n = he(!1), [i, l] = me(null), s = Le((...x) => {
    l(x), t == null || t(), a(!0);
  }), v = Le(async () => {
    if (!n.current)
      try {
        if (n.current = !0, await (r == null ? void 0 : r()) === !1)
          return;
      } finally {
        n.current = !1;
      }
    a(!1);
  });
  return ce(() => ({
    isOpen: o,
    doClose: v,
    doOpen: s,
    openParams: i
  }), [v, s, o, i]);
}
function qh(e = !0, t, r) {
  const o = Lt(ul), a = cl(e, t, r);
  return o || a;
}
const ml = Ne.forwardRef(
  ({
    children: e,
    style: t,
    isInitiallyOpen: r,
    fullScreen: o,
    title: a,
    closeButtonVisible: n = !0,
    onOpen: i,
    onClose: l
  }, s) => {
    const { root: v } = tr(), x = he(null), c = s ? sr(s, x) : x, { isOpen: T, doClose: b, doOpen: f } = qh(r, i, l);
    ee(() => {
      var _;
      T && ((_ = x.current) == null || _.focus());
    }, [T]), ee(() => {
      if (T) {
        const _ = setTimeout(() => {
          document.body.style.pointerEvents = "";
        }, 0);
        return () => clearTimeout(_);
      } else
        document.body.style.pointerEvents = "auto";
    }, [T]);
    const y = he(/* @__PURE__ */ new Set()), w = ce(() => ({
      registerForm: (_) => {
        y.current.add(_);
      },
      unRegisterForm: (_) => {
        y.current.delete(_);
      },
      amITheSingleForm: (_) => y.current.size === 1 && y.current.has(_),
      requestClose: () => b()
    }), [b]);
    return v ? /* @__PURE__ */ m(qr.Root, { open: T, onOpenChange: (_) => _ ? f() : b(), children: /* @__PURE__ */ J(qr.Portal, { container: v, children: [
      !o && /* @__PURE__ */ m("div", { className: xr.overlayBg }),
      /* @__PURE__ */ m(
        qr.Overlay,
        {
          className: le(xr.overlay, {
            [xr.fullScreen]: o
          }),
          children: /* @__PURE__ */ J(
            qr.Content,
            {
              className: le(xr.content),
              onPointerDownOutside: (_) => {
                _.target instanceof Element && _.target.closest("._debug-inspect-button") !== null && _.preventDefault();
              },
              ref: c,
              style: { ...t, gap: void 0 },
              children: [
                !!a && /* @__PURE__ */ m(qr.Title, { style: { marginTop: 0 }, children: /* @__PURE__ */ m("header", { id: "dialogTitle", className: xr.dialogTitle, children: a }) }),
                /* @__PURE__ */ m("div", { className: xr.innerContent, style: { gap: t == null ? void 0 : t.gap }, children: /* @__PURE__ */ m(sl.Provider, { value: w, children: e }) }),
                n && /* @__PURE__ */ m(qr.Close, { asChild: !0, children: /* @__PURE__ */ m(
                  st,
                  {
                    variant: "ghost",
                    themeColor: "secondary",
                    className: xr.closeButton,
                    "aria-label": "Close",
                    icon: /* @__PURE__ */ m(ke, { name: "close", size: "sm" }),
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
ml.displayName = "ModalDialog";
const pl = /* @__PURE__ */ new Set(), ut = /* @__PURE__ */ new WeakMap(), no = /* @__PURE__ */ new WeakMap(), zr = /* @__PURE__ */ new WeakMap(), Da = /* @__PURE__ */ new WeakMap(), Gh = /* @__PURE__ */ new WeakMap(), uo = /* @__PURE__ */ new WeakMap(), ra = /* @__PURE__ */ new WeakMap(), wo = /* @__PURE__ */ new WeakSet();
let Vr;
const dr = "__aa_tgt", Ma = "__aa_del", Yh = (e) => {
  const t = Jh(e);
  t && t.forEach((r) => Kh(r));
}, Xh = (e) => {
  e.forEach((t) => {
    t.target === Vr && Qh(), ut.has(t.target) && Pr(t.target);
  });
};
function jh(e) {
  const t = Da.get(e);
  t == null || t.disconnect();
  let r = ut.get(e), o = 0;
  const a = 5;
  r || (r = co(e), ut.set(e, r));
  const { offsetWidth: n, offsetHeight: i } = Vr, s = [
    r.top - a,
    n - (r.left + a + r.width),
    i - (r.top + a + r.height),
    r.left - a
  ].map((x) => `${-1 * Math.floor(x)}px`).join(" "), v = new IntersectionObserver(() => {
    ++o > 1 && Pr(e);
  }, {
    root: Vr,
    threshold: 1,
    rootMargin: s
  });
  v.observe(e), Da.set(e, v);
}
function Pr(e) {
  clearTimeout(ra.get(e));
  const t = na(e), r = typeof t == "function" ? 500 : t.duration;
  ra.set(e, setTimeout(async () => {
    const o = zr.get(e);
    try {
      await (o == null ? void 0 : o.finished), ut.set(e, co(e)), jh(e);
    } catch {
    }
  }, r));
}
function Qh() {
  clearTimeout(ra.get(Vr)), ra.set(Vr, setTimeout(() => {
    pl.forEach((e) => vl(e, (t) => hl(() => Pr(t))));
  }, 100));
}
function Zh(e) {
  setTimeout(() => {
    Gh.set(e, setInterval(() => hl(Pr.bind(null, e)), 2e3));
  }, Math.round(2e3 * Math.random()));
}
function hl(e) {
  typeof requestIdleCallback == "function" ? requestIdleCallback(() => e()) : requestAnimationFrame(() => e());
}
let Fa, ao;
typeof window < "u" && (Vr = document.documentElement, Fa = new MutationObserver(Yh), ao = new ResizeObserver(Xh), ao.observe(Vr));
function Jh(e) {
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
          i instanceof Element && (o.add(i), ha(a.target, i), no.set(i, [
            a.previousSibling,
            a.nextSibling
          ]));
        }
    }
    return o;
  }, /* @__PURE__ */ new Set());
}
function ha(e, t) {
  !t && !(dr in e) ? Object.defineProperty(e, dr, { value: e }) : t && !(dr in t) && Object.defineProperty(t, dr, { value: e });
}
function Kh(e) {
  var t;
  const r = e.isConnected, o = ut.has(e);
  r && no.has(e) && no.delete(e), zr.has(e) && ((t = zr.get(e)) === null || t === void 0 || t.cancel()), o && r ? tx(e) : o && !r ? ox(e) : rx(e);
}
function Gt(e) {
  return Number(e.replace(/[^0-9.\-]/g, ""));
}
function ex(e) {
  let t = e.parentElement;
  for (; t; ) {
    if (t.scrollLeft || t.scrollTop)
      return { x: t.scrollLeft, y: t.scrollTop };
    t = t.parentElement;
  }
  return { x: 0, y: 0 };
}
function co(e) {
  const t = e.getBoundingClientRect(), { x: r, y: o } = ex(e);
  return {
    top: t.top + o,
    left: t.left + r,
    width: t.width,
    height: t.height
  };
}
function xl(e, t, r) {
  let o = t.width, a = t.height, n = r.width, i = r.height;
  const l = getComputedStyle(e);
  if (l.getPropertyValue("box-sizing") === "content-box") {
    const v = Gt(l.paddingTop) + Gt(l.paddingBottom) + Gt(l.borderTopWidth) + Gt(l.borderBottomWidth), x = Gt(l.paddingLeft) + Gt(l.paddingRight) + Gt(l.borderRightWidth) + Gt(l.borderLeftWidth);
    o -= x, n -= x, a -= v, i -= v;
  }
  return [o, n, a, i].map(Math.round);
}
function na(e) {
  return dr in e && uo.has(e[dr]) ? uo.get(e[dr]) : { duration: 250, easing: "ease-in-out" };
}
function bl(e) {
  if (dr in e)
    return e[dr];
}
function ai(e) {
  const t = bl(e);
  return t ? wo.has(t) : !1;
}
function vl(e, ...t) {
  t.forEach((r) => r(e, uo.has(e)));
  for (let r = 0; r < e.children.length; r++) {
    const o = e.children.item(r);
    o && t.forEach((a) => a(o, uo.has(o)));
  }
}
function tx(e) {
  const t = ut.get(e), r = co(e);
  if (!ai(e))
    return ut.set(e, r);
  let o;
  if (!t)
    return;
  const a = na(e);
  if (typeof a != "function") {
    const n = t.left - r.left, i = t.top - r.top, [l, s, v, x] = xl(e, t, r), c = {
      transform: `translate(${n}px, ${i}px)`
    }, T = {
      transform: "translate(0, 0)"
    };
    l !== s && (c.width = `${l}px`, T.width = `${s}px`), v !== x && (c.height = `${v}px`, T.height = `${x}px`), o = e.animate([c, T], {
      duration: a.duration,
      easing: a.easing
    });
  } else
    o = new Animation(a(e, "remain", t, r)), o.play();
  zr.set(e, o), ut.set(e, r), o.addEventListener("finish", Pr.bind(null, e));
}
function rx(e) {
  const t = co(e);
  ut.set(e, t);
  const r = na(e);
  if (!ai(e))
    return;
  let o;
  typeof r != "function" ? o = e.animate([
    { transform: "scale(.98)", opacity: 0 },
    { transform: "scale(0.98)", opacity: 0, offset: 0.5 },
    { transform: "scale(1)", opacity: 1 }
  ], {
    duration: r.duration * 1.5,
    easing: "ease-in"
  }) : (o = new Animation(r(e, "add", t)), o.play()), zr.set(e, o), o.addEventListener("finish", Pr.bind(null, e));
}
function ox(e) {
  var t;
  if (!no.has(e) || !ut.has(e))
    return;
  const [r, o] = no.get(e);
  Object.defineProperty(e, Ma, { value: !0 }), o && o.parentNode && o.parentNode instanceof Element ? o.parentNode.insertBefore(e, o) : r && r.parentNode ? r.parentNode.appendChild(e) : (t = bl(e)) === null || t === void 0 || t.appendChild(e);
  function a() {
    var T;
    e.remove(), ut.delete(e), no.delete(e), zr.delete(e), (T = Da.get(e)) === null || T === void 0 || T.disconnect();
  }
  if (!ai(e))
    return a();
  const [n, i, l, s] = ax(e), v = na(e), x = ut.get(e);
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
  }), typeof v != "function" ? c = e.animate([
    {
      transform: "scale(1)",
      opacity: 1
    },
    {
      transform: "scale(.98)",
      opacity: 0
    }
  ], { duration: v.duration, easing: "ease-out" }) : (c = new Animation(v(e, "remove", x)), c.play()), zr.set(e, c), c.addEventListener("finish", a);
}
function ax(e) {
  const t = ut.get(e), [r, , o] = xl(e, t, co(e));
  let a = e.parentElement;
  for (; a && (getComputedStyle(a).position === "static" || a instanceof HTMLBodyElement); )
    a = a.parentElement;
  a || (a = document.body);
  const n = getComputedStyle(a), i = ut.get(a) || co(a), l = Math.round(t.top - i.top) - Gt(n.borderTopWidth), s = Math.round(t.left - i.left) - Gt(n.borderLeftWidth);
  return [l, s, r, o];
}
function ix(e, t = {}) {
  return Fa && ao && (window.matchMedia("(prefers-reduced-motion: reduce)").matches && typeof t != "function" && !t.disrespectUserMotionPreference || (wo.add(e), getComputedStyle(e).position === "static" && Object.assign(e.style, { position: "relative" }), vl(e, Pr, Zh, (a) => ao == null ? void 0 : ao.observe(a)), typeof t == "function" ? uo.set(e, t) : uo.set(e, { duration: 250, easing: "ease-in-out", ...t }), Fa.observe(e, { childList: !0 }), pl.add(e))), Object.freeze({
    parent: e,
    enable: () => {
      wo.add(e);
    },
    disable: () => {
      wo.delete(e);
    },
    isEnabled: () => wo.has(e)
  });
}
function ii(e) {
  const [t, r] = me();
  return [X((n) => {
    n instanceof HTMLElement ? r(ix(n, e)) : r(void 0);
  }, []), (n) => {
    t && (n ? t.enable() : t.disable());
  }];
}
const nx = "_summaryContainer_1sc6r_13", lx = "_validationContainer_1sc6r_22", dx = "_error_1sc6r_52", sx = "_heading_1sc6r_58", ux = "_warning_1sc6r_62", cx = "_info_1sc6r_72", mx = "_valid_1sc6r_22", br = {
  summaryContainer: nx,
  validationContainer: lx,
  error: dx,
  heading: sx,
  warning: ux,
  info: cx,
  valid: mx
}, px = '"[]"', hx = "_spacer_1414d_13", fl = {
  themeVars: px,
  spacer: hx
}, xx = () => /* @__PURE__ */ m("div", { className: fl.spacer });
function Ni({
  fieldValidationResults: e = Rr,
  generalValidationResults: t = dt
}) {
  const [r] = ii({ duration: 100 }), o = ce(() => {
    const a = {};
    return Object.entries(e).forEach(([n, i]) => {
      i.validations.forEach((l) => {
        l.isValid || (a[l.severity] = a[l.severity] || [], a[l.severity].push({
          field: n,
          message: l.invalidMessage || ""
        }));
      });
    }), t.forEach((n) => {
      a[n.severity] = a[n.severity] || [], a[n.severity].push({
        message: n.invalidMessage || ""
      });
    }), a;
  }, [e, t]);
  return /* @__PURE__ */ J("div", { ref: r, className: br.summaryContainer, children: [
    /* @__PURE__ */ m(Wi, { issues: o.warning, severity: "warning", heading: "Validation warnings" }),
    /* @__PURE__ */ m(Wi, { issues: o.error, severity: "error", heading: "Validation errors" })
  ] });
}
const Wi = ({ heading: e, issues: t = dt, severity: r = "error", onClose: o }) => {
  const [a] = ii({ duration: 100 });
  return t.length === 0 ? null : /* @__PURE__ */ J(
    "div",
    {
      className: le(br.validationContainer, {
        [br.valid]: r === "valid",
        [br.info]: r === "info",
        [br.warning]: r === "warning",
        [br.error]: r === "error"
      }),
      style: { paddingTop: o ? void 0 : "0.5rem" },
      children: [
        /* @__PURE__ */ J(_o, { orientation: "horizontal", verticalAlignment: "center", style: { gap: "0.5rem" }, children: [
          /* @__PURE__ */ m(ke, { className: br.heading, name: r, size: "md" }),
          /* @__PURE__ */ m("div", { className: br.heading, children: /* @__PURE__ */ m(lo, { children: e }) }),
          !!o && /* @__PURE__ */ J(Tt, { children: [
            /* @__PURE__ */ m(xx, {}),
            /* @__PURE__ */ m(
              st,
              {
                onClick: o,
                variant: "ghost",
                themeColor: "secondary",
                icon: /* @__PURE__ */ m(ke, { name: "close", size: "sm" }),
                orientation: "vertical"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ m("ul", { ref: a, children: t.map((n, i) => /* @__PURE__ */ m(bx, { issue: n }, i)) })
      ]
    }
  );
}, bx = ({ issue: e }) => {
  const { field: t, message: r } = e;
  return /* @__PURE__ */ m("li", { children: /* @__PURE__ */ J("span", { style: { display: "inline-flex", gap: t ? "0.25rem" : void 0 }, children: [
    t && /* @__PURE__ */ m(lo, { variant: "small", fontWeight: "bold", children: `${t}:` }),
    /* @__PURE__ */ m(lo, { variant: "small", preserveLinebreaks: !0, children: r })
  ] }) });
}, vx = ["error", "warning", "valid", "none"], gl = "errorLate", fx = [
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
], Tl = sd(void 0);
function nr(e) {
  return ud(Tl, e);
}
const gx = [
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
function Tx(e) {
  return e == null || e === "" ? !0 : typeof e == "string" ? e.trim().length === 0 : $a(e);
}
function Oi(e = "", t) {
  return typeof e == "string" ? e.length >= t : (console.warn("minLength can only be used on strings"), !0);
}
function Ri(e = "", t) {
  return typeof e == "string" ? e.length <= t : (console.warn("maxLength can only be used on strings"), !0);
}
function zi(e = "", t) {
  return typeof e != "string" && !Ln(e) && console.warn("Range can only be used on strings and numbers"), Number(e) >= t;
}
function Vi(e = "", t) {
  return typeof e != "string" && !Ln(e) && console.warn("Range can only be used on strings and numbers"), Number(e) <= t;
}
function yx(e = "", t) {
  if (typeof e == "string")
    return r(t).test(e);
  return console.warn("Regex can only be used on strings"), !0;
  function r(o) {
    const a = o.match(/^([/~@;%#'])(.*?)\1([gimsuy]*)$/);
    return a ? new RegExp(a[2], a[3]) : new RegExp(o);
  }
}
class yl {
  constructor(t, r, o) {
    this.validations = t, this.onValidate = r, this.value = o, this.preValidate = () => {
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
    const { required: t, requiredInvalidMessage: r } = this.validations;
    if (t)
      return {
        isValid: !Tx(this.value),
        invalidMessage: r || "This field is required",
        severity: "error"
      };
  }
  validateLength() {
    const { minLength: t, maxLength: r, lengthInvalidMessage: o, lengthInvalidSeverity: a = "error" } = this.validations;
    if (!(t === void 0 && r === void 0))
      return t !== void 0 && r === void 0 ? {
        isValid: Oi(this.value, t),
        invalidMessage: o || `Input should be at least ${t} ${Pi(t, "character")}`,
        severity: a
      } : t === void 0 && r !== void 0 ? {
        isValid: Ri(this.value, r),
        invalidMessage: o || `Input should be up to ${r} ${Pi(r, "character")}`,
        severity: a
      } : {
        isValid: Oi(this.value, t) && Ri(this.value, r),
        invalidMessage: o || `Input length should be between ${t} and ${r}`,
        severity: a
      };
  }
  validateRange() {
    const { minValue: t, maxValue: r, rangeInvalidMessage: o, rangeInvalidSeverity: a = "error" } = this.validations;
    if (!(t === void 0 && r === void 0))
      return t !== void 0 && r === void 0 ? {
        isValid: zi(this.value, t),
        invalidMessage: o || `Input should be bigger than ${t}`,
        severity: a
      } : t === void 0 && r !== void 0 ? {
        isValid: Vi(this.value, r),
        invalidMessage: o || `Input should be smaller than ${r}`,
        severity: a
      } : {
        isValid: zi(this.value, t) && Vi(this.value, r),
        invalidMessage: o || `Input should be between ${t} and ${r}`,
        severity: a
      };
  }
  validatePattern() {
    const { pattern: t, patternInvalidMessage: r, patternInvalidSeverity: o = "error" } = this.validations;
    if (t)
      switch (t.toLowerCase()) {
        case "email":
          return {
            isValid: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(this.value),
            invalidMessage: r || "Not a valid email address",
            severity: o
          };
        case "phone":
          return {
            isValid: /^[a-zA-Z0-9#*)(+.\-_&']+$/g.test(this.value),
            invalidMessage: r || "Not a valid phone number",
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
    const { regex: t, regexInvalidMessage: r, regexInvalidSeverity: o = "error" } = this.validations;
    if (t !== void 0)
      return {
        isValid: yx(this.value, t),
        invalidMessage: r || "Input is not in the correct format",
        severity: o
      };
  }
  async validateCustom() {
    if (!this.onValidate)
      return;
    const t = await this.onValidate(this.value);
    return typeof t == "boolean" ? [
      {
        isValid: t,
        invalidMessage: "Invalid input",
        severity: "error"
      }
    ] : rd(t) ? t : [t];
  }
}
async function Ei(e, t, r) {
  return await new yl(e, t, r).validate();
}
function Cx(e, t, r, o, a, n = 0) {
  const i = Zl(r), l = ce(() => n !== 0 ? Hs(Ei, n, {
    trailing: !0,
    leading: !0
  }) : Ei, [n]);
  ee(
    function() {
      const v = new yl(e, t, i);
      let x = !1;
      const c = v.preValidate();
      return x || (o(Ai(a, c)), c.partial && (async () => {
        const T = await l(e, t, i);
        x || o(Ai(a, T));
      })()), () => {
        x = !0;
      };
    },
    [a, i, o, t, l, e]
  );
}
function kx(e, t, r, o = gl) {
  const a = nr((_) => _.interactionFlags[e]) || Rr, n = a.forceShowValidationResult, i = a.focused, l = a.isValidLostFocus, s = a.isValidOnFocus, v = a.invalidToValid, x = !r || r.validatedValue !== t, c = a.isDirty, T = (r == null ? void 0 : r.isValid) === !0;
  let b = "none";
  for (const _ of (r == null ? void 0 : r.validations) || [])
    if (!_.isValid && (b !== "error" && _.severity === "warning" && (b = "warning"), _.severity === "error")) {
      b = "error";
      break;
    }
  let f = !1;
  switch (o) {
    case "errorLate":
      f = c && (i ? !v && !s : !l);
      break;
    case "onChanged":
      f = c;
      break;
    case "onLostFocus":
      f = c && (!i && !T || !l && !T);
  }
  f = f || n;
  const [y, w] = me(f);
  return y !== f && !x && w(f), x && (f = y), {
    isHelperTextShown: f,
    validationStatus: f ? b : "none"
  };
}
function Sx(e) {
  const t = {
    error: [],
    warning: [],
    valid: [],
    none: []
  };
  return Object.entries(e).forEach(([r, o]) => {
    o.validations.forEach((a) => {
      a.isValid || (t[a.severity] = t[a.severity] || [], t[a.severity].push(a));
    });
  }), t;
}
function Pi(e, t) {
  return e === 1 ? t : t + "s";
}
const Di = (e, t, r) => {
  const o = t.split(".");
  for (let a = 0; a < o.length; a++) {
    const n = o[a];
    typeof o[a + 1] < "u" ? e[n] = e[n] ? e[n] : {} : e[n] = r, e = e[n];
  }
}, Mi = (e, t) => {
  const r = t.split(".");
  let o = e;
  for (let a = 0; a < r.length; a++)
    o = o == null ? void 0 : o[r[a]];
  return o;
};
Nr((e, t) => {
  var o, a, n, i;
  const { uid: r } = t.payload;
  switch (r !== void 0 && !e.interactionFlags[r] && (e.interactionFlags[r] = {
    isDirty: !1,
    invalidToValid: !1,
    isValidOnFocus: !1,
    isValidLostFocus: !1,
    focused: !1,
    forceShowValidationResult: !1
  }), t.type) {
    case gt.FIELD_INITIALIZED: {
      e.interactionFlags[r].isDirty || Di(e.subject, r, t.payload.value);
      break;
    }
    case gt.FIELD_REMOVED: {
      delete e.validationResults[r];
      break;
    }
    case gt.FIELD_VALUE_CHANGED: {
      Di(e.subject, r, t.payload.value), e.interactionFlags[r].isDirty = !0, e.interactionFlags[r].forceShowValidationResult = !1;
      break;
    }
    case gt.FIELD_VALIDATED: {
      if (t.payload.validationResult.validations.length === 0) {
        delete e.validationResults[r];
        break;
      }
      const l = (o = e.validationResults[r]) == null ? void 0 : o.isValid;
      if (t.payload.validationResult.partial) {
        const s = [
          ...t.payload.validationResult.validations,
          ...(((a = e.validationResults[r]) == null ? void 0 : a.validations.filter((v) => v.async)) || []).map(
            (v) => ({
              ...v,
              stale: !0
            })
          )
        ];
        e.validationResults[r] = {
          ...t.payload.validationResult,
          isValid: s.find((v) => !v.isValid) === void 0,
          validations: s
        };
      } else
        e.validationResults[r] = t.payload.validationResult;
      e.interactionFlags[r].invalidToValid = !l && e.validationResults[r].isValid;
      break;
    }
    case gt.FIELD_FOCUSED: {
      e.interactionFlags[r].isValidOnFocus = !!((n = e.validationResults[r]) != null && n.isValid), e.interactionFlags[r].focused = !0;
      break;
    }
    case gt.FIELD_LOST_FOCUS: {
      e.interactionFlags[r].isValidLostFocus = !!((i = e.validationResults[r]) != null && i.isValid), e.interactionFlags[r].focused = !1;
      break;
    }
    case gt.TRIED_TO_SUBMIT: {
      Object.keys(e.interactionFlags).forEach((l) => {
        e.interactionFlags[l].forceShowValidationResult = !0;
      });
      break;
    }
    case gt.SUBMITTING: {
      e.submitInProgress = !0;
      break;
    }
    case gt.SUBMITTED: {
      e.submitInProgress = !1, e.generalValidationResults = [], e.interactionFlags = {}, Object.keys(e.validationResults).forEach((l) => {
        var s;
        e.validationResults[l].validations = (s = e.validationResults[l].validations) == null ? void 0 : s.filter(
          (v) => !v.fromBackend
        ), e.validationResults[l].isValid = e.validationResults[l].validations.find((v) => !v.isValid) === void 0;
      });
      break;
    }
    case gt.BACKEND_VALIDATION_ARRIVED: {
      e.submitInProgress = !1, e.generalValidationResults = t.payload.generalValidationResults, Object.keys(e.validationResults).forEach((l) => {
        var s;
        e.validationResults[l].validations = (s = e.validationResults[l].validations) == null ? void 0 : s.filter(
          (v) => !v.fromBackend
        );
      }), Object.entries(t.payload.fieldValidationResults).forEach(
        ([l, s]) => {
          var v;
          e.validationResults[l].validations = [
            ...((v = e.validationResults[l]) == null ? void 0 : v.validations) || [],
            ...s || []
          ], e.validationResults[l].isValid = e.validationResults[l].validations.find((x) => !x.isValid) === void 0;
        }
      );
      break;
    }
    case gt.RESET: {
      const { originalSubject: l } = t.payload;
      return {
        ...wx,
        subject: l
      };
    }
  }
});
const wx = {
  subject: {},
  validationResults: {},
  generalValidationResults: [],
  interactionFlags: {},
  submitInProgress: !1
}, Yr = {
  cancelLabel: "Cancel",
  saveLabel: "Save",
  saveInProgressLabel: "Saving...",
  itemLabelPosition: "top",
  itemLabelBreak: !0,
  keepModalOpenOnSubmit: !1
}, Hx = ve(function({
  formState: e,
  dispatch: t,
  initialValue: r = Rr,
  children: o,
  style: a,
  enabled: n = !0,
  cancelLabel: i = "Cancel",
  saveLabel: l = "Save",
  saveInProgressLabel: s = "Saving...",
  swapCancelAndSave: v,
  onSubmit: x,
  onCancel: c,
  onReset: T,
  buttonRow: b,
  id: f,
  registerComponentApi: y,
  itemLabelBreak: w = !0,
  itemLabelWidth: _,
  itemLabelPosition: H = "top",
  keepModalOpenOnSubmit: I = !1
}, R) {
  const F = he(null);
  Jl(R, () => F.current);
  const [Z, V] = me(!1), W = Uh(), N = n && !e.submitInProgress, O = ce(() => ({
    itemLabelBreak: w,
    itemLabelWidth: _,
    itemLabelPosition: H,
    subject: e.subject,
    originalSubject: r,
    validationResults: e.validationResults,
    interactionFlags: e.interactionFlags,
    dispatch: t,
    enabled: N
  }), [
    t,
    e.interactionFlags,
    e.subject,
    e.validationResults,
    r,
    N,
    w,
    H,
    _
  ]), h = Le(() => {
    c == null || c(), W();
  }), p = Le(async (z) => {
    var M;
    if (z == null || z.preventDefault(), !N)
      return;
    V(!1), t(_h());
    const { error: A, warning: B } = Sx(
      Object.values(e.validationResults)
    );
    if (A.length)
      return;
    if (B.length && !Z) {
      V(!0);
      return;
    }
    const P = document.activeElement;
    t(Ah());
    try {
      await (x == null ? void 0 : x(e.subject, {
        passAsDefaultBody: !0
      })), t(Nh()), I || W(), r === Rr && An(() => {
        g();
      }), P && typeof P.focus == "function" && P.focus();
    } catch (E) {
      const G = [], Q = {};
      E instanceof Error && "errorCategory" in E && E.errorCategory === "GenericBackendError" && ((M = E.details) != null && M.issues) && Array.isArray(E.details.issues) ? E.details.issues.forEach((K) => {
        const te = {
          isValid: !1,
          invalidMessage: K.message,
          severity: K.severity || "error",
          fromBackend: !0
        };
        K.field !== void 0 ? (Q[K.field] = Q[K.field] || [], Q[K.field].push(te)) : G.push(te);
      }) : G.push({
        isValid: !1,
        invalidMessage: E.message || "Couldn't save the form.",
        severity: "error",
        fromBackend: !0
      }), t(
        Oh({
          generalValidationResults: G,
          fieldValidationResults: Q
        })
      );
    }
  }), g = Le(() => {
    t(Wh(r)), T == null || T();
  }), C = Le((z) => {
    typeof z != "object" || z === null || z === void 0 || Object.entries(z).forEach(([A, B]) => {
      t({
        type: gt.FIELD_VALUE_CHANGED,
        payload: {
          uid: A,
          value: B
        }
      });
    });
  }), L = i === "" ? null : /* @__PURE__ */ m(
    st,
    {
      type: "button",
      themeColor: "secondary",
      variant: "ghost",
      onClick: h,
      children: i
    },
    "cancel"
  ), q = ce(
    () => /* @__PURE__ */ m(st, { type: "submit", disabled: !N, children: e.submitInProgress ? s : l }, "submit"),
    [N, e.submitInProgress, s, l]
  );
  return ee(() => {
    y == null || y({
      reset: g,
      update: C
    });
  }, [g, C, y]), /* @__PURE__ */ J(Tt, { children: [
    /* @__PURE__ */ J(
      "form",
      {
        style: a,
        className: Pa.wrapper,
        onSubmit: p,
        onReset: g,
        id: f,
        ref: F,
        children: [
          /* @__PURE__ */ m(Ni, { generalValidationResults: e.generalValidationResults }),
          /* @__PURE__ */ m(Tl.Provider, { value: O, children: o }),
          b || /* @__PURE__ */ J("div", { className: Pa.buttonRow, children: [
            v && [q, L],
            !v && [L, q]
          ] })
        ]
      }
    ),
    Z && /* @__PURE__ */ m(
      ml,
      {
        onClose: () => V(!1),
        isInitiallyOpen: !0,
        title: "Are you sure want to move forward?",
        children: /* @__PURE__ */ J(_o, { orientation: "vertical", style: { gap: "0.5rem" }, children: [
          /* @__PURE__ */ m(lo, { children: "The following warnings were found during validation. Please make sure you are willing to move forward despite these issues." }),
          /* @__PURE__ */ m(
            Ni,
            {
              generalValidationResults: e.generalValidationResults,
              fieldValidationResults: e.validationResults
            }
          ),
          /* @__PURE__ */ J(_o, { orientation: "horizontal", horizontalAlignment: "end", style: { gap: "1em" }, children: [
            /* @__PURE__ */ m(
              st,
              {
                variant: "ghost",
                themeColor: "secondary",
                onClick: () => V(!1),
                children: "No"
              }
            ),
            /* @__PURE__ */ m(st, { onClick: () => p(), autoFocus: !0, children: "Yes, proceed" })
          ] })
        ] })
      }
    )
  ] });
});
Hx.displayName = "Form";
const Bx = "Form", Ix = k({
  status: "experimental",
  description: `A \`${Bx}\` is a fundamental component that displays user interfaces that allow users to input (or change) data and submit it to the app (a server) for further processing.`,
  props: {
    buttonRowTemplate: Ve(
      "This property allows defining a custom component to display the buttons at the bottom of the form."
    ),
    itemLabelPosition: {
      description: "This property sets the position of the item labels within the form.Individual `FormItem` instances can override this property.",
      availableValues: Un,
      type: "string",
      defaultValue: Yr.itemLabelPosition
    },
    itemLabelWidth: {
      description: "This property sets the width of the item labels within the form. Individual `FormItem` instances can override this property.",
      type: "string"
    },
    itemLabelBreak: {
      description: "This boolean value indicates if form item labels can be split into multiple lines if it would overflow the available label width. Individual `FormItem` instances can override this property.",
      type: "boolean",
      defaultValue: Yr.itemLabelBreak
    },
    keepModalOpenOnSubmit: {
      description: "This property prevents the modal from closing when the form is submitted.",
      type: "boolean",
      defaultValue: Yr.keepModalOpenOnSubmit
    },
    data: {
      description: "This property sets the initial value of the form's data structure. The form infrastructure uses this value to set the initial state of form items within the form."
    },
    cancelLabel: {
      description: "This property defines the label of the Cancel button.",
      type: "string",
      defaultValue: Yr.cancelLabel
    },
    saveLabel: {
      description: "This property defines the label of the Save button.",
      type: "string",
      defaultValue: Yr.saveLabel
    },
    saveInProgressLabel: {
      description: "This property defines the label of the Save button to display during the form data submit (save) operation.",
      type: "string",
      defaultValue: Yr.saveInProgressLabel
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
    _data_url: Fe("when we have an api bound data prop, we inject the url here")
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
  themeVars: j(Pa.themeVars),
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
      "textColor-ValidationDisplay-error": "$color-error",
      "textColor-ValidationDisplay-warning": "$color-warning",
      "textColor-ValidationDisplay-info": "$color-info",
      "textColor-ValidationDisplay-valid": "$color-valid"
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
      "textColor-ValidationDisplay-error": "$color-danger-500",
      "textColor-ValidationDisplay-warning": "$color-warn-700",
      "textColor-ValidationDisplay-info": "$color-secondary-200",
      "textColor-ValidationDisplay-valid": "$color-success-600"
    }
  }
});
var d = /* @__PURE__ */ ((e) => (e[e.Eof = -1] = "Eof", e[e.Ws = -2] = "Ws", e[e.BlockComment = -3] = "BlockComment", e[e.EolComment = -4] = "EolComment", e[e.Unknown = 0] = "Unknown", e[e.LParent = 1] = "LParent", e[e.RParent = 2] = "RParent", e[e.Identifier = 3] = "Identifier", e[e.Exponent = 4] = "Exponent", e[e.Divide = 5] = "Divide", e[e.Multiply = 6] = "Multiply", e[e.Remainder = 7] = "Remainder", e[e.Plus = 8] = "Plus", e[e.Minus = 9] = "Minus", e[e.BitwiseXor = 10] = "BitwiseXor", e[e.BitwiseOr = 11] = "BitwiseOr", e[e.LogicalOr = 12] = "LogicalOr", e[e.BitwiseAnd = 13] = "BitwiseAnd", e[e.LogicalAnd = 14] = "LogicalAnd", e[e.IncOp = 15] = "IncOp", e[e.DecOp = 16] = "DecOp", e[e.Assignment = 17] = "Assignment", e[e.AddAssignment = 18] = "AddAssignment", e[e.SubtractAssignment = 19] = "SubtractAssignment", e[e.ExponentAssignment = 20] = "ExponentAssignment", e[e.MultiplyAssignment = 21] = "MultiplyAssignment", e[e.DivideAssignment = 22] = "DivideAssignment", e[e.RemainderAssignment = 23] = "RemainderAssignment", e[e.ShiftLeftAssignment = 24] = "ShiftLeftAssignment", e[e.ShiftRightAssignment = 25] = "ShiftRightAssignment", e[e.SignedShiftRightAssignment = 26] = "SignedShiftRightAssignment", e[e.BitwiseAndAssignment = 27] = "BitwiseAndAssignment", e[e.BitwiseXorAssignment = 28] = "BitwiseXorAssignment", e[e.BitwiseOrAssignment = 29] = "BitwiseOrAssignment", e[e.LogicalAndAssignment = 30] = "LogicalAndAssignment", e[e.LogicalOrAssignment = 31] = "LogicalOrAssignment", e[e.NullCoalesceAssignment = 32] = "NullCoalesceAssignment", e[e.Semicolon = 33] = "Semicolon", e[e.Comma = 34] = "Comma", e[e.Colon = 35] = "Colon", e[e.LSquare = 36] = "LSquare", e[e.RSquare = 37] = "RSquare", e[e.QuestionMark = 38] = "QuestionMark", e[e.NullCoalesce = 39] = "NullCoalesce", e[e.OptionalChaining = 40] = "OptionalChaining", e[e.BinaryNot = 41] = "BinaryNot", e[e.LBrace = 42] = "LBrace", e[e.RBrace = 43] = "RBrace", e[e.Equal = 44] = "Equal", e[e.StrictEqual = 45] = "StrictEqual", e[e.LogicalNot = 46] = "LogicalNot", e[e.NotEqual = 47] = "NotEqual", e[e.StrictNotEqual = 48] = "StrictNotEqual", e[e.LessThan = 49] = "LessThan", e[e.LessThanOrEqual = 50] = "LessThanOrEqual", e[e.ShiftLeft = 51] = "ShiftLeft", e[e.GreaterThan = 52] = "GreaterThan", e[e.GreaterThanOrEqual = 53] = "GreaterThanOrEqual", e[e.ShiftRight = 54] = "ShiftRight", e[e.SignedShiftRight = 55] = "SignedShiftRight", e[e.Dot = 56] = "Dot", e[e.Spread = 57] = "Spread", e[e.Global = 58] = "Global", e[e.Backtick = 59] = "Backtick", e[e.DollarLBrace = 60] = "DollarLBrace", e[e.Arrow = 61] = "Arrow", e[e.DecimalLiteral = 62] = "DecimalLiteral", e[e.HexadecimalLiteral = 63] = "HexadecimalLiteral", e[e.BinaryLiteral = 64] = "BinaryLiteral", e[e.RealLiteral = 65] = "RealLiteral", e[e.StringLiteral = 66] = "StringLiteral", e[e.Infinity = 67] = "Infinity", e[e.NaN = 68] = "NaN", e[e.True = 69] = "True", e[e.False = 70] = "False", e[e.Typeof = 71] = "Typeof", e[e.Null = 72] = "Null", e[e.Undefined = 73] = "Undefined", e[e.In = 74] = "In", e[e.Let = 75] = "Let", e[e.Const = 76] = "Const", e[e.Var = 77] = "Var", e[e.If = 78] = "If", e[e.Else = 79] = "Else", e[e.Return = 80] = "Return", e[e.Break = 81] = "Break", e[e.Continue = 82] = "Continue", e[e.Do = 83] = "Do", e[e.While = 84] = "While", e[e.For = 85] = "For", e[e.Of = 86] = "Of", e[e.Try = 87] = "Try", e[e.Catch = 88] = "Catch", e[e.Finally = 89] = "Finally", e[e.Throw = 90] = "Throw", e[e.Switch = 91] = "Switch", e[e.Case = 92] = "Case", e[e.Default = 93] = "Default", e[e.Delete = 94] = "Delete", e[e.Function = 95] = "Function", e[e.Export = 96] = "Export", e[e.Import = 97] = "Import", e[e.As = 98] = "As", e[e.From = 99] = "From", e))(d || {});
class $x {
  // Creates a stream that uses the specified source code
  constructor(t) {
    this.source = t, this._pos = 0, this._line = 1, this._column = 0;
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
  ahead(t = 1) {
    return this._pos + t > this.source.length - 1 ? null : this.source[this._pos + t];
  }
  // Gets the next character from the stream
  get() {
    if (this._pos >= this.source.length)
      return null;
    const t = this.source[this._pos++];
    return t === `
` ? (this._line++, this._column = 0) : this._column++, t;
  }
  // Gets the tail of the input stream
  getTail(t) {
    var r;
    return ((r = this.source) == null ? void 0 : r.substring(t)) ?? "";
  }
}
const Lr = {
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
class Lx {
  /**
   * Initializes the tokenizer with the input stream
   * @param input Input source code stream
   */
  constructor(t) {
    this.input = t, this._ahead = [], this._prefetched = null, this._prefetchedPos = null, this._prefetchedColumn = null, this._lastFetchPosition = 0, this._phaseExternallySet = null;
  }
  /**
   * Fetches the next token without advancing to its position
   * @param ws If true, retrieve whitespaces too
   */
  peek(t = !1) {
    return this.ahead(0, t);
  }
  /**
   * Reads tokens ahead
   * @param n Number of token positions to read ahead
   * @param ws If true, retrieve whitespaces too
   */
  ahead(t = 1, r = !1) {
    if (t > 16)
      throw new Error("Cannot look ahead more than 16 tokens");
    for (; this._ahead.length <= t; ) {
      const o = this.fetch();
      if (Fi(o))
        return o;
      (r || !r && !Ui(o)) && this._ahead.push(o);
    }
    return this._ahead[t];
  }
  /**
   * Fetches the next token and advances the stream position
   * @param ws If true, retrieve whitespaces too
   */
  get(t = !1) {
    if (this._ahead.length > 0) {
      const r = this._ahead.shift();
      if (!r)
        throw new Error("Token expected");
      return r;
    }
    for (; ; ) {
      const r = this.fetch();
      if (Fi(r) || t || !t && !Ui(r))
        return r;
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
    const t = this, r = this.input, o = this._prefetchedPos || r.position, a = r.line, n = this._prefetchedColumn || r.column;
    this._lastFetchPosition = this.input.position;
    let i = null, l = "", s = d.Eof, v = r.position, x = r.column, c = null, T = !1, b = this.getStartingPhaseThenReset();
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
              qi(c) ? (T = !0, b = 17, s = d.Identifier) : Ft(c) ? (b = 27, s = d.DecimalLiteral) : w(d.Unknown);
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
          else if (Ft(c) || c === "_")
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
          if (!Ft(c))
            return y();
          b = 29, s = d.RealLiteral;
          break;
        case 19:
          return c === "." ? w(d.Spread) : y();
        case 23:
          if (c === "_")
            break;
          if (!at(c))
            return y();
          b = 24, s = d.HexadecimalLiteral;
          break;
        case 24:
          if (!at(c) && c !== "_")
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
          if (Ft(c) || c === "_")
            break;
          if (c === "." && (this.input.peek() === null || Ft(this.input.peek())))
            b = 28, s = d.Unknown;
          else if (c === "e" || c === "E")
            b = 30, s = d.Unknown;
          else
            return y();
          break;
        case 28:
          if (Ft(c))
            b = 29, s = d.RealLiteral;
          else if (c === "e" || c === "E")
            b = 30;
          else
            return y();
          break;
        case 29:
          if (c === "e" || c === "E")
            b = 30, s = d.Unknown;
          else if (!Ft(c) && c !== "_")
            return y();
          break;
        case 30:
          if (c === "+" || c === "-")
            b = 31;
          else if (Ft(c))
            b = 32, s = d.RealLiteral;
          else
            return y();
          break;
        case 31:
          if (Ft(c))
            b = 32, s = d.RealLiteral;
          else
            return y();
          break;
        case 32:
          if (!Ft(c))
            return y();
          break;
        case 34: {
          b = 33;
          const I = this.input.ahead(0), R = this.input.ahead(1);
          if (I === "`" || I === "$" && R === "{")
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
                return f(), this.fetchNextChar(), w(d.DollarLBrace);
          }
          const _ = this.input.ahead(0), H = this.input.ahead(1);
          if (_ === "`" || _ === "$" && H === "{")
            return w(d.StringLiteral);
          break;
        case 35:
          if (c === i)
            return w(d.StringLiteral);
          if (_x(c))
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
          if (at(c))
            b = 38;
          else
            return w(d.Unknown);
          break;
        case 38:
          if (at(c))
            b = 35;
          else
            return w(d.Unknown);
          break;
        case 39:
          if (c === "{") {
            b = 43;
            break;
          }
          if (at(c))
            b = 40;
          else
            return w(d.Unknown);
          break;
        case 40:
          if (at(c))
            b = 41;
          else
            return w(d.Unknown);
          break;
        case 41:
          if (at(c))
            b = 42;
          else
            return w(d.Unknown);
          break;
        case 42:
          if (at(c))
            b = 35;
          else
            return w(d.Unknown);
          break;
        case 43:
          if (at(c))
            b = 44;
          else
            return w(d.Unknown);
          break;
        case 44:
          if (c === "}")
            b = 35;
          else if (at(c))
            b = 45;
          else
            return w(d.Unknown);
          break;
        case 45:
          if (c === "}")
            b = 35;
          else if (at(c))
            b = 46;
          else
            return w(d.Unknown);
          break;
        case 46:
          if (c === "}")
            b = 35;
          else if (at(c))
            b = 47;
          else
            return w(d.Unknown);
          break;
        case 47:
          if (c === "}")
            b = 35;
          else if (at(c))
            b = 48;
          else
            return w(d.Unknown);
          break;
        case 48:
          if (c === "}")
            b = 35;
          else if (at(c))
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
      f();
    }
    function f() {
      l += c, t._prefetched = null, t._prefetchedPos = null, t._prefetchedColumn = null, v = r.position, x = r.position;
    }
    function y() {
      return T && (s = ge.get(l) ?? (qi(l[0]) && l[l.length - 1] !== "'" ? d.Identifier : d.Unknown)), {
        text: l,
        type: s,
        location: {
          startPosition: o,
          endPosition: v,
          startLine: a,
          endLine: a,
          startColumn: n,
          endColumn: x
        }
      };
    }
    function w(_) {
      return f(), _ !== void 0 && (s = _), y();
    }
  }
  getStartingPhaseThenReset() {
    if (this._phaseExternallySet !== null) {
      const t = this._phaseExternallySet;
      return this._phaseExternallySet = null, t;
    }
    return 0;
  }
  /**
   * Fetches the next RegEx token from the input stream
   */
  fetchRegEx() {
    const t = this._ahead.length > 0 ? this._ahead[0].location.startPosition : this._lastFetchPosition, r = this.input.getTail(t);
    try {
      const o = yi(r), a = o.raw;
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
        for (; a < r.length && "dgimsuy".includes(r[a]); )
          a++;
      if (a === void 0)
        return {
          success: !1,
          pattern: r[0]
        };
      const n = r.substring(0, a);
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
const ge = /* @__PURE__ */ new Map();
ge.set("typeof", d.Typeof);
ge.set("Infinity", d.Infinity);
ge.set("NaN", d.NaN);
ge.set("true", d.True);
ge.set("false", d.False);
ge.set("undefined", d.Undefined);
ge.set("null", d.Null);
ge.set("in", d.In);
ge.set("let", d.Let);
ge.set("const", d.Const);
ge.set("var", d.Var);
ge.set("if", d.If);
ge.set("else", d.Else);
ge.set("return", d.Return);
ge.set("break", d.Break);
ge.set("continue", d.Continue);
ge.set("do", d.Do);
ge.set("while", d.While);
ge.set("for", d.For);
ge.set("of", d.Of);
ge.set("try", d.Try);
ge.set("catch", d.Catch);
ge.set("finally", d.Finally);
ge.set("throw", d.Throw);
ge.set("switch", d.Switch);
ge.set("case", d.Case);
ge.set("default", d.Default);
ge.set("delete", d.Delete);
ge.set("function", d.Function);
ge.set("export", d.Export);
ge.set("import", d.Import);
ge.set("as", d.As);
ge.set("from", d.From);
function Fi(e) {
  return e.type === d.Eof;
}
function Ui(e) {
  return e.type <= d.Ws;
}
function qi(e) {
  return e >= "a" && e <= "z" || e >= "A" && e <= "Z" || e === "_" || e === "$";
}
function Gi(e) {
  return e >= "a" && e <= "z" || e >= "A" && e <= "Z" || e >= "0" && e <= "9" || e === "_" || e === "$";
}
function Yi(e) {
  return e === "0" || e === "1";
}
function Ft(e) {
  return e >= "0" && e <= "9";
}
function at(e) {
  return e >= "0" && e <= "9" || e >= "A" && e <= "F" || e >= "a" && e <= "f";
}
function _x(e) {
  return e === "\r" || e === `
` || e === "" || e === "\u2028" || e === "\u2029";
}
let Ax = class Cl extends Error {
  constructor(t, r) {
    super(t), this.code = r, Object.setPrototypeOf(this, Cl.prototype);
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
class kl {
  /**
   * Initializes the parser with the specified source code
   * @param source Source code to parse
   */
  constructor(t) {
    this.source = t, this._parseErrors = [], this._statementLevel = 0, this._lexer = new Lx(new $x(t));
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
    const t = [];
    for (; !this.isEof; ) {
      const r = this.parseStatement();
      if (!r) return null;
      t.push(r), r.type !== "EmptyS" && this.skipToken(d.Semicolon);
    }
    return t;
  }
  /**
   * Parses a single statement
   */
  parseStatement(t = !0) {
    this._statementLevel++;
    try {
      const r = this._lexer.peek();
      switch (r.type) {
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
          return this._lexer.get(), this.createStatementNode("BrkS", {}, r, r);
        case d.Continue:
          return this._lexer.get(), this.createStatementNode("ContS", {}, r, r);
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
          return r.type === d.Eof ? (this.reportError("W002", r, "EOF"), null) : this.isExpressionStart(r) ? this.parseExpressionStatement(t) : (this.reportError("W002", r, r.text), null);
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
    const t = this._lexer.get();
    return this.createStatementNode("EmptyS", {}, t, t);
  }
  /**
   * Parses an expression statement
   *
   * expressionStatement
   *   : expression
   *   ;
   */
  parseExpressionStatement(t = !0) {
    const r = this._lexer.peek(), o = this.getExpression(t);
    return o ? this.createStatementNode(
      "ExprS",
      {
        expression: o
      },
      r,
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
    const t = this._lexer.get();
    let r = t;
    const o = [];
    for (; ; ) {
      const a = this._lexer.peek();
      let n = {};
      if (a.type === d.LBrace) {
        r = this._lexer.ahead(1);
        const s = this.parseObjectDestructure();
        if (s === null) return null;
        n = {
          objectDestruct: s
        }, r = s.length > 0 ? s[s.length - 1].endToken : r;
      } else if (a.type === d.LSquare) {
        r = this._lexer.ahead(1);
        const s = this.parseArrayDestructure();
        if (s === null) return null;
        n = {
          arrayDestruct: s
        }, r = s.length > 0 ? s[s.length - 1].endToken : r;
      } else if (a.type === d.Identifier) {
        if (a.text.startsWith("$"))
          return this.reportError("W031"), null;
        r = this._lexer.get(), n = {
          id: a.text
        };
      } else
        return this.reportError("W003"), null;
      const i = this._lexer.peek();
      let l = null;
      if (i.type === d.Assignment) {
        if (this._lexer.get(), l = this.getExpression(!1), l === null) return null;
        n.expression = l, r = l.endToken;
      } else if (n.arrayDestruct || n.objectDestruct)
        return this.reportError("W009", i), null;
      if (o.push(
        this.createExpressionNode("VarD", n, a, r)
      ), this._lexer.peek().type !== d.Comma) break;
      this._lexer.get();
    }
    return this.createStatementNode(
      "LetS",
      {
        declarations: o
      },
      t,
      r
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
    const t = this._lexer.get();
    let r = t;
    const o = [];
    for (; ; ) {
      const a = this._lexer.peek();
      let n = {};
      if (a.type === d.LBrace) {
        r = this._lexer.ahead(1);
        const l = this.parseObjectDestructure();
        if (l === null) return null;
        n = {
          objectDestruct: l
        }, r = l.length > 0 ? l[l.length - 1].endToken : r;
      } else if (a.type === d.LSquare) {
        r = this._lexer.ahead(1);
        const l = this.parseArrayDestructure();
        if (l === null) return null;
        n = {
          arrayDestruct: l
        }, r = l.length > 0 ? l[l.length - 1].endToken : r;
      } else if (a.type === d.Identifier) {
        if (a.text.startsWith("$"))
          return this.reportError("W031"), null;
        r = this._lexer.get(), n = {
          id: a.text
        };
      } else
        return this.reportError("W003"), null;
      this.expectToken(d.Assignment);
      const i = this.getExpression(!1);
      if (i === null) return null;
      if (n.expression = i, r = i.endToken, o.push(
        this.createExpressionNode("VarD", n, a, r)
      ), this._lexer.peek().type !== d.Comma) break;
      this._lexer.get();
    }
    return this.createStatementNode(
      "ConstS",
      {
        declarations: o
      },
      t,
      r
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
    const t = this._lexer.get();
    let r = t;
    const o = [];
    for (; ; ) {
      const a = this._lexer.peek();
      let n = {};
      if (a.type === d.Identifier) {
        if (a.text.startsWith("$"))
          return this.reportError("W031"), null;
        r = this._lexer.get(), n = {
          id: a.text
        };
      } else
        return this.reportError("W003"), null;
      this.expectToken(d.Assignment);
      const i = this.getExpression(!1);
      if (i === null) return null;
      if (n.expression = i, r = i.endToken, o.push(
        this.createExpressionNode(
          "RVarD",
          n,
          a,
          r
        )
      ), this._lexer.peek().type !== d.Comma) break;
      this._lexer.get();
    }
    return this.createStatementNode(
      "VarS",
      {
        declarations: o
      },
      t,
      r
    );
  }
  /**
   * Parses an object destructure expression
   */
  parseObjectDestructure() {
    const t = [], r = this._lexer.get();
    let o = r, a = this._lexer.peek();
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
      a = this._lexer.peek(), (a.type === d.Comma || a.type === d.RBrace) && (t.push(
        this.createExpressionNode(
          "ODestr",
          { id: n, alias: i, arrayDestruct: l, objectDestruct: s },
          r,
          o
        )
      ), a.type === d.Comma && (this._lexer.get(), a = this._lexer.peek()));
    }
    return this.expectToken(d.RBrace, "W004"), t;
  }
  parseArrayDestructure() {
    const t = [], r = this._lexer.get();
    let o = r;
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
        t.push(
          this.createExpressionNode(
            "ADestr",
            { id: n, arrayDestruct: i, objectDestruct: l },
            r,
            o
          )
        ), this._lexer.get();
      else if (a.type === d.RSquare) {
        (n || i || l) && t.push(
          this.createExpressionNode(
            "ADestr",
            { id: n, arrayDestruct: i, objectDestruct: l },
            r,
            o
          )
        );
        break;
      } else
        return this.reportError("W002", a), null;
    } while (!0);
    return this.expectToken(d.RSquare, "W005"), t;
  }
  /**
   * Parses a block statement
   *
   * blockStatement
   *   : "{" (statement [";"])* "}"
   *   ;
   */
  parseBlockStatement() {
    const t = this._lexer.get(), r = [];
    for (; this._lexer.peek().type !== d.RBrace; ) {
      const a = this.parseStatement();
      if (!a) return null;
      r.push(a), a.type !== "EmptyS" && this.skipToken(d.Semicolon);
    }
    const o = this._lexer.get();
    return this.createStatementNode("BlockS", { statements: r }, t, o);
  }
  /**
   * Parses an if statement
   *
   * ifStatement
   *   : "if" "(" expression ")" statement ["else" statement]
   *   ;
   */
  parseIfStatement() {
    const t = this._lexer.get();
    let r = t;
    this.expectToken(d.LParent, "W014");
    const o = this.getExpression();
    if (!o) return null;
    this.expectToken(d.RParent, "W006");
    const a = this.parseStatement();
    if (!a) return null;
    r = a.endToken;
    let n = !0;
    a.type !== "BlockS" && (this._lexer.peek().type === d.Semicolon ? this._lexer.get() : n = !1);
    let i = null;
    if (n && this._lexer.peek().type === d.Else) {
      if (this._lexer.get(), i = this.parseStatement(), !i) return null;
      r = i.endToken;
    }
    return this.createStatementNode(
      "IfS",
      {
        condition: o,
        thenBranch: a,
        elseBranch: i
      },
      t,
      r
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
    const t = this._lexer.get();
    this.expectToken(d.LParent, "W014");
    const r = this.getExpression();
    if (!r) return null;
    this.expectToken(d.RParent, "W006");
    const o = this.parseStatement();
    return o ? this.createStatementNode(
      "WhileS",
      {
        condition: r,
        body: o
      },
      t,
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
    const t = this._lexer.get(), r = this.parseStatement();
    if (!r) return null;
    r.type !== "BlockS" && r.type !== "EmptyS" && this.expectToken(d.Semicolon), this.expectToken(d.While), this.expectToken(d.LParent, "W014");
    const o = this.getExpression();
    if (!o) return null;
    const a = this._lexer.peek();
    return this.expectToken(d.RParent, "W006"), this.createStatementNode(
      "DoWS",
      {
        condition: o,
        body: r
      },
      t,
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
    const t = this._lexer.peek();
    let r = this._lexer.get(), o;
    if (Lr[this._lexer.peek().type].expressionStart) {
      if (o = this.getExpression(), o === null) return null;
      r = o.endToken;
    }
    return this.createStatementNode(
      "RetS",
      {
        expression: o
      },
      t,
      r
    );
  }
  /**
   * forStatement
   *   : "for" "(" initStatement? ";" expression? ";" expression? ")" statement
   *   | forInOfStatement
   *   ;
   */
  parseForStatement() {
    const t = this._lexer.peek();
    this._lexer.get(), this.expectToken(d.LParent, "W014");
    let r = this._lexer.peek();
    if (r.type === d.Identifier) {
      if (this._lexer.ahead(1).type === d.In)
        return this.parseForInOfStatement(t, "none", r.text, "ForInS");
      if (this._lexer.ahead(1).type === d.Of)
        return this.parseForInOfStatement(t, "none", r.text, "ForOfS");
    } else if (r.type === d.Let) {
      const l = this._lexer.ahead(1);
      if (l.type === d.Identifier) {
        const s = this._lexer.ahead(2);
        if (s.type === d.In)
          return this.parseForInOfStatement(t, "let", l.text, "ForInS");
        if (s.type === d.Of)
          return this.parseForInOfStatement(t, "let", l.text, "ForOfS");
      }
    } else if (r.type === d.Const) {
      const l = this._lexer.ahead(1);
      if (l.type === d.Identifier) {
        const s = this._lexer.ahead(2);
        if (s.type === d.In)
          return this.parseForInOfStatement(t, "const", l.text, "ForInS");
        if (s.type === d.Of)
          return this.parseForInOfStatement(t, "const", l.text, "ForOfS");
      }
    }
    let o;
    if (r = this._lexer.peek(), r.type === d.Semicolon)
      this._lexer.get();
    else if (r.type === d.Let) {
      const l = this.parseLetStatement();
      if (l === null)
        return null;
      if (o = l, o.declarations.some((s) => !s.expression))
        return this.reportError("W011"), null;
      this.expectToken(d.Semicolon);
    } else if (Lr[r.type].expressionStart) {
      const l = this.parseExpressionStatement();
      if (l === null)
        return null;
      o = l, this.expectToken(d.Semicolon);
    }
    let a;
    if (r = this._lexer.peek(), r.type === d.Semicolon)
      this._lexer.get();
    else {
      if (a = this.getExpression(), a === null)
        return null;
      this.expectToken(d.Semicolon);
    }
    let n;
    if (r = this._lexer.peek(), r.type !== d.RParent && (n = this.getExpression(), n === null))
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
      t,
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
  parseForInOfStatement(t, r, o, a) {
    if (r !== "none") {
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
        varBinding: r,
        id: o,
        expression: n,
        body: i
      },
      t,
      i.endToken
    ) : this.createStatementNode(
      "ForOfS",
      {
        varBinding: r,
        id: o,
        expression: n,
        body: i
      },
      t,
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
    const t = this._lexer.peek();
    this._lexer.get();
    let r;
    return r = this.getExpression(), r === null ? null : this.createStatementNode(
      "ThrowS",
      {
        expression: r
      },
      t,
      r.endToken
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
    const t = this._lexer.peek();
    let r = this._lexer.get();
    const o = this, a = v();
    let n, i, l, s = this._lexer.peek();
    if (s.type === d.Catch) {
      if (this._lexer.get(), s = this._lexer.peek(), s.type === d.LParent) {
        if (this._lexer.get(), s = this._lexer.peek(), s.type !== d.Identifier)
          return this.reportError("W003", s), null;
        i = s.text, this._lexer.get(), this.expectToken(d.RParent, "W006");
      }
      n = v(), r = n.endToken, this._lexer.peek().type === d.Finally && (this._lexer.get(), l = v(), r = l.endToken);
    } else if (s.type === d.Finally)
      this._lexer.get(), l = v(), r = l.endToken;
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
      t,
      r
    );
    function v() {
      const x = o._lexer.peek();
      return x.type !== d.LBrace ? (o.reportError("W012", x), null) : o.parseBlockStatement();
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
    const t = this._lexer.get();
    this.expectToken(d.LParent, "W014");
    const r = this.getExpression();
    if (!r) return null;
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
      let s = [], v = !1;
      for (; !v; )
        switch (this._lexer.peek().type) {
          case d.Case:
          case d.Default:
          case d.RBrace:
            v = !0;
            break;
          default:
            const c = this.parseStatement();
            if (c === null) {
              v = !0;
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
          t
        )
      );
    }
    const n = this._lexer.peek();
    return this.expectToken(d.RBrace, "W004"), this.createStatementNode(
      "SwitchS",
      {
        expression: r,
        cases: o
      },
      t,
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
  parseFunctionDeclaration(t = !1) {
    const r = this._lexer.get();
    let o;
    const a = this._lexer.peek();
    if (t) {
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
        let x = !1;
        if (l)
          for (const c of i.expressions) {
            if (x) {
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
                if (x = !0, c.operand.type !== "IdE") {
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
      return this.reportError("W010", r), null;
    if (this._lexer.peek().type !== d.LBrace)
      return this.reportError("W012", this._lexer.peek()), null;
    const v = this.parseBlockStatement();
    return v ? this.createStatementNode(
      "FuncD",
      {
        name: o,
        args: s,
        statement: v
      },
      r,
      v.endToken
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
    const t = this._lexer.peek();
    if (t.type === d.Const) {
      if (this._statementLevel > 1)
        return this.reportError("W030", t), null;
      const r = this.parseConstStatement();
      return r === null ? null : { ...r, isExported: !0 };
    } else if (t.type === d.Function) {
      if (this._statementLevel > 1)
        return this.reportError("W030", t), null;
      const r = this.parseFunctionDeclaration();
      return r === null ? null : { ...r, isExported: !0 };
    }
    return this.reportError("W024", t), null;
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
    const t = this._lexer.get();
    this.expectToken(d.LBrace, "W012");
    const r = {};
    let o = this._lexer.peek();
    for (; o.type !== d.RBrace; ) {
      if (o.type !== d.Identifier)
        return this.reportError("W003", o), null;
      const i = o.text;
      if (this._lexer.get(), o = this._lexer.peek(), o.type === d.As) {
        if (this._lexer.get(), o = this._lexer.peek(), o.type !== d.Identifier)
          return this.reportError("W003", o), null;
        if (r[o.text])
          return this.reportError("W019", o, o.text), null;
        r[o.text] = i, this._lexer.get();
      } else {
        if (r[i])
          return this.reportError("W019", o, i), null;
        r[i] = i;
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
        imports: r,
        moduleFile: n.value
      },
      t,
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
  parseExpr(t = !0) {
    return t ? this.parseSequenceExpression() : this.parseCondOrSpreadOrAsgnOrArrowExpr();
  }
  /**
   * sequenceExpr
   *   : conditionalExpr ( "," conditionalExpr )?
   */
  parseSequenceExpression() {
    const t = this._lexer.peek();
    let r = t, o = this.parseCondOrSpreadOrAsgnOrArrowExpr();
    if (!o)
      return null;
    r = o.endToken;
    const a = [];
    let n = !1;
    if (this._lexer.peek().type === d.Comma)
      for (a.push(o); this.skipToken(d.Comma); )
        if (this._lexer.peek().type === d.Comma)
          n = !0, r = this._lexer.peek(), a.push(
            this.createExpressionNode("NoArgE", {}, r, r)
          );
        else {
          const i = this.parseCondOrSpreadOrAsgnOrArrowExpr();
          if (!i)
            break;
          r = i.endToken, a.push(i);
        }
    return a.length && (o = this.createExpressionNode(
      "SeqE",
      {
        expressions: a,
        loose: n
      },
      t,
      r
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
    const t = this._lexer.peek();
    if (t.type === d.Spread) {
      this._lexer.get();
      const a = this.parseNullCoalescingExpr();
      return a ? this.createExpressionNode(
        "SpreadE",
        {
          operand: a
        },
        t,
        a.endToken
      ) : null;
    }
    if (t.type === d.Function) {
      const a = this.parseFunctionDeclaration(!0);
      return a ? this.createExpressionNode(
        "ArrowE",
        {
          name: a.name,
          args: a.args,
          statement: a.statement
        },
        t,
        a.endToken
      ) : null;
    }
    const r = this.parseNullCoalescingExpr();
    if (!r)
      return null;
    const o = this._lexer.peek();
    if (o.type === d.Arrow)
      return this.parseArrowExpression(t, r);
    if (o.type === d.QuestionMark) {
      this._lexer.get();
      const a = this.getExpression(!1);
      this.expectToken(d.Colon);
      const n = this.getExpression(!1);
      return this.createExpressionNode(
        "CondE",
        {
          condition: r,
          consequent: a,
          alternate: n
        },
        t,
        n.endToken
      );
    }
    if (Lr[o.type].isAssignment) {
      this._lexer.get();
      const a = this.getExpression();
      return a ? this.createExpressionNode(
        "AsgnE",
        {
          leftValue: r,
          operator: o.text,
          operand: a
        },
        t,
        a.endToken
      ) : null;
    }
    return r;
  }
  /**
   * Parses an arrow expression
   * @param start Start token
   * @param left Expression to the left from the arrow
   */
  parseArrowExpression(t, r) {
    let o;
    const a = [];
    switch (r.type) {
      case "NoArgE":
        o = !0;
        break;
      case "IdE":
        o = (r.parenthesized ?? 0) <= 1, a.push(r);
        break;
      case "SeqE":
        o = r.parenthesized === 1;
        let i = !1;
        if (o)
          for (const l of r.expressions) {
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
        if (o = r.parenthesized === 1, o) {
          const l = this.convertToObjectDestructure(r);
          l && a.push(l);
        }
        break;
      case "ALitE":
        if (o = r.parenthesized === 1, o) {
          const l = this.convertToArrayDestructure(r);
          l && a.push(l);
        }
        break;
      case "SpreadE":
        o = r.operand.type === "IdE", o && a.push(r);
        break;
      default:
        o = !1;
    }
    if (!o)
      return this.reportError("W010", t), null;
    this._lexer.get();
    const n = this.parseStatement(!1);
    return n ? this.createExpressionNode(
      "ArrowE",
      {
        args: a,
        statement: n
      },
      t,
      n.endToken
    ) : null;
  }
  /**
   * nullCoalescingExpr
   *   : logicalOrExpr ( "??" logicalOrExpr )?
   *   ;
   */
  parseNullCoalescingExpr() {
    const t = this._lexer.peek();
    let r = this.parseLogicalOrExpr();
    if (!r)
      return null;
    for (; this.skipToken(d.NullCoalesce); ) {
      const o = this.parseLogicalOrExpr();
      if (!o)
        return this.reportError("W001"), null;
      let a = o.endToken;
      r = this.createExpressionNode(
        "BinaryE",
        {
          operator: "??",
          left: r,
          right: o
        },
        t,
        a
      );
    }
    return r;
  }
  /**
   * logicalOrExpr
   *   : logicalAndExpr ( "||" logicalAndExpr )?
   *   ;
   */
  parseLogicalOrExpr() {
    const t = this._lexer.peek();
    let r = this.parseLogicalAndExpr();
    if (!r)
      return null;
    for (; this.skipToken(d.LogicalOr); ) {
      const o = this.parseLogicalAndExpr();
      if (!o)
        return this.reportError("W001"), null;
      let a = o.endToken;
      r = this.createExpressionNode(
        "BinaryE",
        {
          operator: "||",
          left: r,
          right: o
        },
        t,
        a
      );
    }
    return r;
  }
  /**
   * logicalAndExpr
   *   : bitwiseOrExpr ( "&&" bitwiseOrExpr )?
   *   ;
   */
  parseLogicalAndExpr() {
    const t = this._lexer.peek();
    let r = this.parseBitwiseOrExpr();
    if (!r)
      return null;
    for (; this.skipToken(d.LogicalAnd); ) {
      const o = this.parseBitwiseOrExpr();
      if (!o)
        return this.reportError("W001"), null;
      let a = o.endToken;
      r = this.createExpressionNode(
        "BinaryE",
        {
          operator: "&&",
          left: r,
          right: o
        },
        t,
        a
      );
    }
    return r;
  }
  /**
   * bitwiseOrExpr
   *   : bitwiseXorExpr ( "|" bitwiseXorExpr )?
   *   ;
   */
  parseBitwiseOrExpr() {
    const t = this._lexer.peek();
    let r = this.parseBitwiseXorExpr();
    if (!r)
      return null;
    for (; this.skipToken(d.BitwiseOr); ) {
      const o = this.parseBitwiseXorExpr();
      if (!o)
        return this.reportError("W001"), null;
      let a = o.endToken;
      r = this.createExpressionNode(
        "BinaryE",
        {
          operator: "|",
          left: r,
          right: o
        },
        t,
        a
      );
    }
    return r;
  }
  /**
   * bitwiseXorExpr
   *   : bitwiseAndExpr ( "^" bitwiseAndExpr )?
   *   ;
   */
  parseBitwiseXorExpr() {
    const t = this._lexer.peek();
    let r = this.parseBitwiseAndExpr();
    if (!r)
      return null;
    for (; this.skipToken(d.BitwiseXor); ) {
      const o = this.parseBitwiseAndExpr();
      if (!o)
        return this.reportError("W001"), null;
      let a = o.endToken;
      r = this.createExpressionNode(
        "BinaryE",
        {
          operator: "^",
          left: r,
          right: o
        },
        t,
        a
      );
    }
    return r;
  }
  /**
   * bitwiseAndExpr
   *   : equExpr ( "&" equExpr )?
   *   ;
   */
  parseBitwiseAndExpr() {
    const t = this._lexer.peek();
    let r = this.parseEquExpr();
    if (!r)
      return null;
    for (; this.skipToken(d.BitwiseAnd); ) {
      const o = this.parseEquExpr();
      if (!o)
        return this.reportError("W001"), null;
      let a = o.endToken;
      r = this.createExpressionNode(
        "BinaryE",
        {
          operator: "&",
          left: r,
          right: o
        },
        t,
        a
      );
    }
    return r;
  }
  /**
   * equExpr
   *   : relOrInExpr ( ( "==" | "!=" | "===" | "!==" ) relOrInExpr )?
   *   ;
   */
  parseEquExpr() {
    const t = this._lexer.peek();
    let r = this.parseRelOrInExpr();
    if (!r)
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
      r = this.createExpressionNode(
        "BinaryE",
        {
          type: "BinaryE",
          operator: o.text,
          left: r,
          right: a
        },
        t,
        n
      );
    }
    return r;
  }
  /**
   * relOrInExpr
   *   : shiftExpr ( ( "<" | "<=" | ">" | ">=", "in" ) shiftExpr )?
   *   ;
   */
  parseRelOrInExpr() {
    const t = this._lexer.peek();
    let r = this.parseShiftExpr();
    if (!r)
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
      r = this.createExpressionNode(
        "BinaryE",
        {
          operator: o.text,
          left: r,
          right: a
        },
        t,
        n
      );
    }
    return r;
  }
  /**
   * shiftExpr
   *   : addExpr ( ( "<<" | ">>" | ">>>" ) addExpr )?
   *   ;
   */
  parseShiftExpr() {
    const t = this._lexer.peek();
    let r = this.parseAddExpr();
    if (!r)
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
      r = this.createExpressionNode(
        "BinaryE",
        {
          operator: o.text,
          left: r,
          right: a
        },
        t,
        n
      );
    }
    return r;
  }
  /**
   * addExpr
   *   : multExpr ( ( "+" | "-" ) multExpr )?
   *   ;
   */
  parseAddExpr() {
    const t = this._lexer.peek();
    let r = this.parseMultExpr();
    if (!r)
      return null;
    let o;
    for (; o = this.skipTokens(d.Plus, d.Minus); ) {
      const a = this.parseMultExpr();
      if (!a)
        return this.reportError("W001"), null;
      let n = a.endToken;
      r = this.createExpressionNode(
        "BinaryE",
        {
          operator: o.text,
          left: r,
          right: a
        },
        t,
        n
      );
    }
    return r;
  }
  /**
   * multExpr
   *   : exponentialExpr ( ( "*" | "/" | "%") exponentialExpr )?
   *   ;
   */
  parseMultExpr() {
    const t = this._lexer.peek();
    let r = this.parseExponentialExpr();
    if (!r)
      return null;
    let o;
    for (; o = this.skipTokens(d.Multiply, d.Divide, d.Remainder); ) {
      const a = this.parseExponentialExpr();
      if (!a)
        return this.reportError("W001"), null;
      let n = a.endToken;
      r = this.createExpressionNode(
        "BinaryE",
        {
          operator: o.text,
          left: r,
          right: a
        },
        t,
        n
      );
    }
    return r;
  }
  /**
   * exponentialExpr
   *   : unaryExpr ( "**" unaryExpr )?
   *   ;
   */
  parseExponentialExpr() {
    const t = this._lexer.peek();
    let r = this.parseUnaryOrPrefixExpr();
    if (!r)
      return null;
    let o, a = 0;
    for (; o = this.skipToken(d.Exponent); ) {
      let n = this.parseUnaryOrPrefixExpr();
      if (!n)
        return this.reportError("W001"), null;
      let i = n.endToken;
      if (a === 0)
        r = this.createExpressionNode(
          "BinaryE",
          {
            operator: o.text,
            left: r,
            right: n
          },
          t,
          i
        );
      else {
        const l = r;
        r = this.createExpressionNode(
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
          t,
          i
        );
      }
      a++;
    }
    return r;
  }
  /**
   * unaryExpr
   *   : ( "typeof" | "delete" | "+" | "-" | "~" | "!" ) memberOrInvocationExpr
   *   | memberOrInvocationExpr
   *   ;
   */
  parseUnaryOrPrefixExpr() {
    const t = this._lexer.peek();
    if (Lr[t.type].canBeUnary) {
      this._lexer.get();
      const r = this.parseUnaryOrPrefixExpr();
      return r ? this.createExpressionNode(
        "UnaryE",
        {
          operator: t.text,
          operand: r
        },
        t,
        r.endToken
      ) : null;
    }
    if (t.type === d.IncOp || t.type === d.DecOp) {
      this._lexer.get();
      const r = this.parseMemberOrInvocationExpr();
      return r ? this.createExpressionNode(
        "PrefE",
        {
          operator: t.text,
          operand: r
        },
        t,
        r.endToken
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
    const t = this._lexer.peek();
    let r = this.parsePrimaryExpr();
    if (!r)
      return null;
    let o = !1;
    do {
      const n = this._lexer.peek();
      switch (n.type) {
        case d.LParent: {
          this._lexer.get();
          let x = [];
          if (this._lexer.peek().type !== d.RParent) {
            const T = this.parseExpr();
            if (!T)
              return this.reportError("W001"), null;
            x = T.type === "SeqE" ? T.expressions : [T];
          }
          const c = this._lexer.peek();
          this.expectToken(d.RParent, "W006"), r = this.createExpressionNode(
            "InvokeE",
            {
              object: r,
              arguments: x
            },
            t,
            c
          );
          break;
        }
        case d.Dot:
        case d.OptionalChaining:
          this._lexer.get();
          const i = this._lexer.get();
          if (!Lr[i.type].keywordLike)
            return this.reportError("W003"), null;
          r = this.createExpressionNode(
            "MembE",
            {
              object: r,
              member: i.text,
              isOptional: n.type === d.OptionalChaining
            },
            t,
            i
          );
          break;
        case d.LSquare:
          this._lexer.get();
          const s = this.getExpression();
          if (!s)
            return null;
          const v = this._lexer.peek();
          this.expectToken(d.RSquare, "W005"), r = this.createExpressionNode(
            "CMembE",
            {
              object: r,
              member: s
            },
            t,
            v
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
        operand: r
      },
      t,
      a
    )) : r;
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
    const t = this._lexer.peek();
    switch (t.type) {
      case d.LParent:
        if (this._lexer.get(), this._lexer.peek().type === d.RParent) {
          const a = this._lexer.get();
          return this.createExpressionNode("NoArgE", {}, t, a);
        }
        const r = this.parseExpr();
        if (!r)
          return null;
        const o = this._lexer.peek();
        return this.expectToken(d.RParent, "W006"), r.parenthesized ?? (r.parenthesized = 0), r.parenthesized++, r.startToken = t, r.startPosition = t.location.startPosition, r.startLine = t.location.startLine, r.startColumn = t.location.startColumn, r.endToken = o, r.endPosition = o.location.endPosition, r.endLine = o.location.endLine, r.endColumn = o.location.endColumn, r.source = this.getSource(t, o), r;
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
            value: t.type === d.True
          },
          t,
          t
        );
      case d.BinaryLiteral:
        return this._lexer.get(), this.parseBinaryLiteral(t);
      case d.DecimalLiteral:
        return this._lexer.get(), this.parseDecimalLiteral(t);
      case d.HexadecimalLiteral:
        return this._lexer.get(), this.parseHexadecimalLiteral(t);
      case d.RealLiteral:
        return this._lexer.get(), this.parseRealLiteral(t);
      case d.StringLiteral:
        return this._lexer.get(), this.parseStringLiteral(t);
      case d.Infinity:
        return this._lexer.get(), this.createExpressionNode(
          "LitE",
          {
            value: 1 / 0
          },
          t,
          t
        );
      case d.NaN:
        return this._lexer.get(), this.createExpressionNode(
          "LitE",
          {
            value: NaN
          },
          t,
          t
        );
      case d.Null:
        return this._lexer.get(), this.createExpressionNode(
          "LitE",
          {
            value: null
          },
          t,
          t
        );
      case d.Undefined:
        return this._lexer.get(), this.createExpressionNode(
          "LitE",
          {
            value: void 0
          },
          t,
          t
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
    const t = this._lexer.get();
    this._lexer.setStartingPhaseToTemplateLiteral();
    const r = [];
    e: for (; ; ) {
      let a = this._lexer.peek();
      switch (a.type) {
        case d.StringLiteral:
          this._lexer.get();
          const n = this.parseStringLiteral(a, !1);
          r.push(n);
          break;
        case d.DollarLBrace:
          this._lexer.get();
          const i = this.parseExpr();
          r.push(i), this.expectToken(d.RBrace, "W004"), this._lexer.setStartingPhaseToTemplateLiteral();
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
      { segments: r },
      t,
      o
    );
  }
  /**
   * Parses an array literal
   */
  parseArrayLiteral() {
    const t = this._lexer.get();
    let r = [];
    if (this._lexer.peek().type !== d.RSquare) {
      const a = this.getExpression();
      a && (r = a.type === "SeqE" ? a.expressions : [a]);
    }
    const o = this._lexer.peek();
    return this.expectToken(d.RSquare), this.createExpressionNode(
      "ALitE",
      {
        items: r
      },
      t,
      o
    );
  }
  /**
   * Parses an object literal
   */
  parseObjectLiteral() {
    const t = this._lexer.get();
    let r = [];
    if (this._lexer.peek().type !== d.RBrace)
      for (; this._lexer.peek().type !== d.RBrace; ) {
        const a = this._lexer.peek(), n = Lr[a.type];
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
              t
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
          r.push(i);
        else {
          if (l === "LitE") {
            const x = i.value;
            if (typeof x != "number" && typeof x != "string")
              return this.expectToken(d.RBrace, "W007"), null;
          }
          let v = null;
          if (l === "IdE") {
            const x = this._lexer.peek();
            (x.type === d.Comma || x.type === d.RBrace) && (v = { ...i });
          }
          if (!v && (this.expectToken(d.Colon, "W008"), v = this.getExpression(!1), !v))
            return null;
          r.push([i, v]);
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
        props: r
      },
      t,
      o
    );
  }
  parseRegExpLiteral() {
    const t = this._lexer.peek(), r = this._lexer.getRegEx();
    return r.success ? this.createExpressionNode(
      "LitE",
      {
        value: new RegExp(r.pattern, r.flags)
      },
      t,
      this._lexer.peek()
    ) : (this.reportError("W002", t, r.pattern ?? ""), null);
  }
  /**
   * Gets an expression
   */
  getExpression(t = !0) {
    const r = this.parseExpr(t);
    return r || (this.reportError("W001"), null);
  }
  // ==========================================================================
  // Helpers
  /**
   * Tests the type of the next token
   * @param type Expected token type
   * @param errorCode Error to raise if the next token is not expected
   * @param allowEof Allow an EOF instead of the expected token?
   */
  expectToken(t, r, o) {
    const a = this._lexer.peek();
    return a.type === t || o && a.type === d.Eof ? this._lexer.get() : (this.reportError(r ?? "W002", a, a.text), null);
  }
  /**
   * Skips the next token if the type is the specified one
   * @param type Token type to check
   */
  skipToken(t) {
    const r = this._lexer.peek();
    return r.type === t ? (this._lexer.get(), r) : null;
  }
  /**
   * Skips the next token if the type is the specified one
   * @param types Token types to check
   */
  skipTokens(...t) {
    const r = this._lexer.peek();
    for (const o of t)
      if (r.type === o)
        return this._lexer.get(), r;
    return null;
  }
  /**
   * Reports the specified error
   * @param errorCode Error code
   * @param token Token that represents the error's position
   * @param options Error message options
   */
  reportError(t, r, ...o) {
    let a = Xo[t] ?? "Unkonwn error";
    throw o && o.forEach(
      (i, l) => a = n(a, `{${l}}`, o[l].toString())
    ), r || (r = this._lexer.peek()), this._parseErrors.push({
      code: t,
      text: a,
      line: r.location.startLine,
      column: r.location.startColumn,
      position: r.location.startPosition
    }), new Ax(a, t);
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
  createNode(t, r, o, a, n) {
    a || (a = this._lexer.peek());
    const i = o.location.startPosition, l = a.location.startPosition;
    return Object.assign({}, r, {
      type: t,
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
  createExpressionNode(t, r = {}, o, a, n) {
    a || (a = this._lexer.peek()), o || (o = a);
    const i = o.location.startPosition, l = a.location.endPosition;
    return Object.assign({}, r, {
      type: t,
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
  createStatementNode(t, r, o, a) {
    var s, v, x, c, T;
    const n = (s = o == null ? void 0 : o.location) == null ? void 0 : s.startPosition, i = this._lexer.peek(), l = a ? a.location.endPosition : i.type === d.Eof ? i.location.startPosition + 1 : i.location.startPosition;
    return Object.assign({}, r, {
      type: t,
      startPosition: n,
      endPosition: l,
      startLine: (v = o == null ? void 0 : o.location) == null ? void 0 : v.startLine,
      startColumn: (x = o == null ? void 0 : o.location) == null ? void 0 : x.startColumn,
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
  getSource(t, r) {
    return this.source.substring(
      t.location.startPosition,
      r.type === d.Eof ? r.location.startPosition : r.location.endPosition
    );
  }
  /**
   * Parses a binary literal
   * @param token Literal token
   */
  parseBinaryLiteral(t) {
    let r;
    const o = BigInt(t.text.replace(/[_']/g, ""));
    return o < Number.MIN_SAFE_INTEGER || o > Number.MAX_SAFE_INTEGER ? r = o : r = parseInt(t.text.substring(2).replace(/[_']/g, ""), 2), this.createExpressionNode(
      "LitE",
      {
        value: r
      },
      t,
      t
    );
  }
  /**
   * Parses a decimal literal
   * @param token Literal token
   */
  parseDecimalLiteral(t) {
    let r;
    const o = BigInt(t.text.replace(/[_']/g, ""));
    return o < Number.MIN_SAFE_INTEGER || o > Number.MAX_SAFE_INTEGER ? r = o : r = parseInt(t.text.replace(/[_']/g, ""), 10), this.createExpressionNode(
      "LitE",
      {
        value: r
      },
      t,
      t
    );
  }
  /**
   * Parses a hexadecimal literal
   * @param token Literal token
   */
  parseHexadecimalLiteral(t) {
    let r;
    const o = BigInt(t.text.replace(/[_']/g, ""));
    return o < Number.MIN_SAFE_INTEGER || o > Number.MAX_SAFE_INTEGER ? r = o : r = parseInt(t.text.substring(2).replace(/[_']/g, ""), 16), this.createExpressionNode(
      "LitE",
      {
        value: r
      },
      t,
      t
    );
  }
  /**
   * Parses a real literal
   * @param token Literal token
   */
  parseRealLiteral(t) {
    let r = parseFloat(t.text.replace(/[_']/g, ""));
    return this.createExpressionNode(
      "LitE",
      {
        value: r
      },
      t,
      t
    );
  }
  /**
   * Converts a string token to intrinsic string
   * @param token Literal token
   */
  parseStringLiteral(t, r = !0) {
    let o = t.text;
    r && (o = t.text.length < 2 ? "" : o.substring(1, o.length - 1));
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
      t,
      t
    );
    function l(s) {
      return s >= "0" && s <= "9" || s >= "a" && s <= "f" || s >= "A" && s <= "F";
    }
  }
  convertToArrayDestructure(t) {
    var a;
    const r = t.type === "SeqE" ? t.expressions : t.items, o = this.createExpressionNode(
      "Destr",
      { arrayDestruct: [] },
      t.startToken,
      t.endToken
    );
    for (const n of r) {
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
  convertToObjectDestructure(t) {
    var o;
    const r = this.createExpressionNode(
      "Destr",
      { objectDestruct: [] },
      t.startToken,
      t.endToken
    );
    for (const a of t.props) {
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
      l && ((o = r.objectDestruct) == null || o.push(l));
    }
    return r;
  }
  /**
   * Tests if the specified token can be the start of an expression
   */
  isExpressionStart(t) {
    var r;
    return ((r = Lr[t.type]) == null ? void 0 : r.expressionStart) ?? !1;
  }
}
function ae(e, t, r, o, a, n) {
  if (t.cancel)
    return t;
  if (t.skipChildren = !1, Array.isArray(e)) {
    for (const i of e)
      t = ae(i, t, r, o, a, n);
    return t;
  }
  switch (e.type) {
    case "BlockS": {
      if (t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel) return t;
      if (!t.skipChildren) {
        for (const i of e.statements)
          if (t = ae(i, t, r, o, e, "statements"), t.cancel) return t;
      }
      return t = (r == null ? void 0 : r(!1, e, t, a, n)) || t, t;
    }
    case "EmptyS":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t;
    case "ExprS":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel || !t.skipChildren && (t = ae(e.expression, t, r, o, e, "expression"), t.cancel) || (t = (r == null ? void 0 : r(!1, e, t, a, n)) || t), t;
    case "ArrowS":
      return t;
    case "LetS": {
      if (t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel) return t;
      if (!t.skipChildren) {
        for (const i of e.declarations)
          if (t = ae(i, t, r, o, e, "declarations"), t.cancel) return t;
      }
      return t = (r == null ? void 0 : r(!1, e, t, a, n)) || t, t;
    }
    case "ConstS": {
      if (t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel) return t;
      if (!t.skipChildren) {
        for (const i of e.declarations)
          if (t = ae(i, t, r, o, e, "declarations"), t.cancel) return t;
      }
      return t = (r == null ? void 0 : r(!1, e, t, a, n)) || t, t;
    }
    case "VarS": {
      if (t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel) return t;
      if (!t.skipChildren) {
        for (const i of e.declarations)
          if (t = ae(i, t, r, o, e, "declarations"), t.cancel) return t;
      }
      return t = (r == null ? void 0 : r(!1, e, t, a, n)) || t, t;
    }
    case "IfS":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel || !t.skipChildren && (t = ae(e.condition, t, r, o, e, "condition"), t.cancel || (e.thenBranch && (t = ae(e.thenBranch, t, r, o, e, "thenBranch")), t.cancel) || (e.elseBranch && (t = ae(e.elseBranch, t, r, o, e, "elseBranch")), t.cancel)) || (t = (r == null ? void 0 : r(!1, e, t, a, n)) || t), t;
    case "RetS":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel || !t.skipChildren && (e.expression && (t = ae(e.expression, t, r, o, e, "expression")), t.cancel) || (t = (r == null ? void 0 : r(!1, e, t, a, n)) || t), t;
    case "BrkS":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t;
    case "ContS":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t;
    case "WhileS":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel || !t.skipChildren && (t = ae(e.condition, t, r, o, e, "condition"), t.cancel || (t = ae(e.body, t, r, o, e, "body"), t.cancel)) || (t = (r == null ? void 0 : r(!1, e, t, a, n)) || t), t;
    case "DoWS":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel || !t.skipChildren && (t = ae(e.body, t, r, o, e, "body"), t.cancel || (t = ae(e.condition, t, r, o, e, "condition"), t.cancel)) || (t = (r == null ? void 0 : r(!1, e, t, a, n)) || t), t;
    case "ForS":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel || !t.skipChildren && (e.init && (t = ae(e.init, t, r, o, e, "init")), t.cancel || (e.condition && (t = ae(e.condition, t, r, o, e, "condition")), t.cancel) || (e.update && (t = ae(e.update, t, r, o, e, "update")), t.cancel) || (t = ae(e.body, t, r, o, e, "body"), t.cancel)) || (t = (r == null ? void 0 : r(!1, e, t, a, n)) || t), t;
    case "ForInS":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel || !t.skipChildren && (t = ae(e.expression, t, r, o, e, "expression"), t.cancel || (t = ae(e.body, t, r, o, e, "body"), t.cancel)) || (t = (r == null ? void 0 : r(!1, e, t, a, n)) || t), t;
    case "ForOfS":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel || !t.skipChildren && (t = ae(e.expression, t, r, o, e, "expression"), t.cancel || (t = ae(e.body, t, r, o, e, "body"), t.cancel)) || (t = (r == null ? void 0 : r(!1, e, t, a, n)) || t), t;
    case "ThrowS":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel || !t.skipChildren && (t = ae(e.expression, t, r, o, e, "expression"), t.cancel) || (t = (r == null ? void 0 : r(!1, e, t, a, n)) || t), t;
    case "TryS":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel || !t.skipChildren && (e.tryBlock && (t = ae(e.tryBlock, t, r, o, e, "tryBlock")), t.cancel || (e.catchBlock && (t = ae(e.catchBlock, t, r, o, e, "catchBlock")), t.cancel) || (e.finallyBlock && (t = ae(e.finallyBlock, t, r, o, e, "finallyBlock")), t.cancel)) || (t = (r == null ? void 0 : r(!1, e, t, a, n)) || t), t;
    case "SwitchS": {
      if (t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel) return t;
      if (!t.skipChildren) {
        if (t = ae(e.expression, t, r, o, e, "expression"), t.cancel) return t;
        for (const i of e.cases) {
          if (i.caseExpression && (t = ae(i.caseExpression, t, r, o, e, "caseExpression")), t.cancel) return t;
          if (i.statements !== void 0) {
            for (const l of i.statements)
              if (t = ae(l, t, r, o, e, "switchStatement"), t.cancel) return t;
          }
        }
      }
      return t = (r == null ? void 0 : r(!1, e, t, a, n)) || t, t;
    }
    case "FuncD": {
      if (t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel) return t;
      if (!t.skipChildren) {
        for (const i of e.args)
          if (t = ae(i, t, r, o, e, "arg"), t.cancel) return t;
        if (t = ae(e.statement, t, r, o, e, "statement"), t.cancel) return t;
      }
      return t = (r == null ? void 0 : r(!1, e, t, a, n)) || t, t;
    }
    case "ImportD":
      return t = (r == null ? void 0 : r(!0, e, t, a, n)) || t, t.cancel || (t = (r == null ? void 0 : r(!1, e, t, a, n)) || t), t;
    case "UnaryE":
      return t = t, t.cancel || !t.skipChildren && (t = ae(e.operand, t, r, o, e, "operand"), t.cancel) || (t = t), t;
    case "BinaryE":
      return t = t, t.cancel || !t.skipChildren && (t = ae(e.left, t, r, o, e, "left"), t.cancel || (t = ae(e.right, t, r, o, e, "right"), t.cancel)) || (t = t), t;
    case "SeqE": {
      if (t = t, t.cancel) return t;
      if (!t.skipChildren) {
        for (const i of e.expressions)
          if (t = ae(i, t, r, o, e, "expression"), t.cancel) return t;
      }
      return t = t, t;
    }
    case "CondE":
      return t = t, t.cancel || !t.skipChildren && (t = ae(e.condition, t, r, o, e, "condition"), t.cancel || (t = ae(e.consequent, t, r, o, e, "consequent"), t.cancel) || (t = ae(e.alternate, t, r, o, e, "alternate"), t.cancel)) || (t = t), t;
    case "InvokeE": {
      if (t = t, t.cancel) return t;
      if (!t.skipChildren) {
        for (const i of e.arguments)
          if (t = ae(i, t, r, o, e, "argument"), t.cancel) return t;
        if (t = ae(e.object, t, r, o, e, "object"), t.cancel) return t;
      }
      return t = t, t;
    }
    case "MembE":
      return t = t, t.cancel || !t.skipChildren && (t = ae(e.object, t, r, o, e, "object"), t.cancel) || (t = t), t;
    case "CMembE":
      return t = t, t.cancel || !t.skipChildren && (t = ae(e.object, t, r, o, e, "object"), t.cancel || (t = ae(e.member, t, r, o, e, "member"), t.cancel)) || (t = t), t;
    case "IdE":
      return t = t, t;
    case "LitE":
      return t = t, t;
    case "ALitE": {
      if (t = t, t.cancel) return t;
      if (!t.skipChildren) {
        for (const i of e.items)
          if (t = ae(i, t, r, o, e, "item"), t.cancel) return t;
      }
      return t = t, t;
    }
    case "OLitE": {
      if (t = t, t.cancel) return t;
      if (!t.skipChildren) {
        for (const i of e.props)
          if (Array.isArray(i)) {
            const [l, s] = i;
            if (t = ae(l, t, r, o, e, "propKey"), t.cancel || (t = ae(s, t, r, o, e, "propValue"), t.cancel)) return t;
          } else if (t = ae(i, t, r, o, e, "prop"), t.cancel) return t;
      }
      return t = t, t;
    }
    case "SpreadE":
      return t = t, t.cancel || !t.skipChildren && (t = ae(e.operand, t, r, o, e, "operand"), t.cancel) || (t = t), t;
    case "AsgnE":
      return t = t, t.cancel || !t.skipChildren && (t = ae(e.operand, t, r, o, e, "operand"), t.cancel || (t = ae(e.leftValue, t, r, o, e, "leftValue"), t.cancel)) || (t = t), t;
    case "NoArgE":
      return t = t, t;
    case "ArrowE": {
      if (t = t, t.cancel) return t;
      if (!t.skipChildren) {
        for (const i of e.args)
          if (t = ae(i, t, r, o, e, "arg"), t.cancel) return t;
        if (t = ae(e.statement, t, r, o, e, "statement"), t.cancel) return t;
      }
      return t = t, t;
    }
    case "PrefE":
    case "PostfE":
      return t = t, t.cancel || !t.skipChildren && (t = ae(e.operand, t, r, o, e, "operand"), t.cancel) || (t = t), t;
    case "VarD": {
      if (t = t, t.cancel) return t;
      if (!t.skipChildren) {
        if (e.arrayDestruct !== void 0) {
          for (const i of e.arrayDestruct)
            if (t = ae(i, t, r, o, e), t.cancel) return t;
        }
        if (e.objectDestruct !== void 0) {
          for (const i of e.objectDestruct)
            if (t = ae(i, t, r, o, e), t.cancel) return t;
        }
        if (e.expression && (t = ae(e.expression, t, r, o, e, "expression")), t.cancel) return t;
      }
      return t = t, t;
    }
    case "Destr":
    case "ODestr":
    case "ADestr": {
      if (t = t, t.cancel) return t;
      if (!t.skipChildren) {
        if (e.arrayDestruct !== void 0) {
          for (const i of e.arrayDestruct)
            if (t = ae(i, t, r, o, e), t.cancel) return t;
        }
        if (e.objectDestruct !== void 0) {
          for (const i of e.objectDestruct)
            if (t = ae(i, t, r, o, e), t.cancel) return t;
        }
      }
      return t = t, t;
    }
    case "RVarD":
      return t = t, t.cancel || !t.skipChildren && (e.expression && (t = ae(e.expression, t, r, o, e, "expression")), t.cancel) || (t = t), t;
    case "TempLitE":
      return t;
    default:
      return t;
  }
}
function Nx(e) {
  return e.type !== "ScriptModule";
}
function Wx(e, t, r, o = !1) {
  const a = /* @__PURE__ */ new Map(), n = {}, i = l(e, t, r, !0);
  return !i || Object.keys(n).length > 0 ? n : i;
  function l(s, v, x, c = !1) {
    var T;
    if (a.has(s))
      return a.get(s);
    const b = new kl(v);
    let f = [];
    try {
      f = b.parseStatements();
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
    ae(f, {
      data: null,
      cancel: !1,
      skipChildren: !1
    }, (W, N, O, h, p) => {
      if (!W) return O;
      if (c)
        switch (N.type) {
          case "VarS":
            h && V("W027", N);
            break;
          case "FuncD":
          case "ImportD":
            break;
          default:
            o && !h && V("W028", N, N.type);
            break;
        }
      else
        switch (N.type) {
          case "VarS":
            V("W027", N);
            break;
          case "FuncD":
            o && !N.isExported && V("W029", N);
            break;
          case "ImportD":
            break;
          default:
            o && !h && V("W028", N, N.type);
            break;
        }
      return O;
    });
    const H = {};
    f.filter((W) => W.type === "FuncD").forEach((W) => {
      const N = W;
      if (H[N.name]) {
        V("W020", W, N.name);
        return;
      }
      H[N.name] = N;
    });
    const I = /* @__PURE__ */ new Map();
    f.forEach((W) => {
      W.type === "ConstS" && W.isExported ? Ox(W, (N) => {
        I.has(N) ? V("W021", W, N) : I.set(N, W);
      }) : W.type === "FuncD" && W.isExported && (I.has(W.name) ? V("W021", W, W.name) : I.set(W.name, W));
    });
    const R = {
      type: "ScriptModule",
      name: s,
      exports: I,
      importedModules: [],
      imports: {},
      functions: H,
      statements: f,
      executed: !1
    };
    a.set(s, R);
    const F = [], Z = {};
    for (let W = 0; W < f.length; W++) {
      const N = f[W];
      if (N.type !== "ImportD")
        continue;
      const O = x(s, N.moduleFile);
      if (O === null) {
        V("W022", N, N.moduleFile);
        continue;
      }
      const h = l(N.moduleFile, O, x);
      if (!h)
        return;
      F.push(h);
      const p = Object.keys(N.imports);
      p.length > 0 && (Z[T = N.moduleFile] ?? (Z[T] = {}));
      for (const g of p)
        h.exports.has(N.imports[g]) ? Z[N.moduleFile][g] = h.exports.get(N.imports[g]) : V("W023", N, N.moduleFile, g);
    }
    if (w.length > 0)
      return n[s] = w, null;
    return F.forEach((W) => W.parent = R), R.importedModules = F, R.imports = Z, R;
    function V(W, N, ...O) {
      let h = Xo[W];
      O && O.forEach(
        (p, g) => h = h.replaceAll(`{${g}}`, O[g].toString())
      ), w.push({
        code: W,
        text: Xo[W].replace(/\{(\d+)}/g, (p, g) => O[g]),
        position: N.startPosition,
        line: N.startLine,
        column: N.startColumn
      });
    }
  }
}
function Sl(e) {
  var r;
  const t = ((r = e.blocks) == null ? void 0 : r.slice(0)) ?? [];
  return e.parent ? [...Sl(e.parent), ...t] : t;
}
function Ox(e, t) {
  for (let n = 0; n < e.declarations.length; n++) {
    const i = e.declarations[n];
    r(i, t);
  }
  function r(n, i) {
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
function Rx(e, t) {
  if (e == null) return t;
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
const zx = `'{"Input:borderRadius-NumberBox-default": "var(--xmlui-borderRadius-NumberBox-default)", "Input:borderColor-NumberBox-default": "var(--xmlui-borderColor-NumberBox-default)", "Input:borderWidth-NumberBox-default": "var(--xmlui-borderWidth-NumberBox-default)", "Input:borderStyle-NumberBox-default": "var(--xmlui-borderStyle-NumberBox-default)", "Input:fontSize-NumberBox-default": "var(--xmlui-fontSize-NumberBox-default)", "Input:backgroundColor-NumberBox-default": "var(--xmlui-backgroundColor-NumberBox-default)", "Input:boxShadow-NumberBox-default": "var(--xmlui-boxShadow-NumberBox-default)", "Input:textColor-NumberBox-default": "var(--xmlui-textColor-NumberBox-default)", "Input:borderColor-NumberBox-default--hover": "var(--xmlui-borderColor-NumberBox-default--hover)", "Input:backgroundColor-NumberBox-default--hover": "var(--xmlui-backgroundColor-NumberBox-default--hover)", "Input:boxShadow-NumberBox-default--hover": "var(--xmlui-boxShadow-NumberBox-default--hover)", "Input:textColor-NumberBox-default--hover": "var(--xmlui-textColor-NumberBox-default--hover)", "Input:borderColor-NumberBox-default--focus": "var(--xmlui-borderColor-NumberBox-default--focus)", "Input:backgroundColor-NumberBox-default--focus": "var(--xmlui-backgroundColor-NumberBox-default--focus)", "Input:boxShadow-NumberBox-default--focus": "var(--xmlui-boxShadow-NumberBox-default--focus)", "Input:textColor-NumberBox-default--focus": "var(--xmlui-textColor-NumberBox-default--focus)", "Input:outlineWidth-NumberBox-default--focus": "var(--xmlui-outlineWidth-NumberBox-default--focus)", "Input:outlineColor-NumberBox-default--focus": "var(--xmlui-outlineColor-NumberBox-default--focus)", "Input:outlineStyle-NumberBox-default--focus": "var(--xmlui-outlineStyle-NumberBox-default--focus)", "Input:outlineOffset-NumberBox-default--focus": "var(--xmlui-outlineOffset-NumberBox-default--focus)", "Input:textColor-placeholder-NumberBox-default": "var(--xmlui-textColor-placeholder-NumberBox-default)", "Input:textColor-adornment-NumberBox-default": "var(--xmlui-textColor-adornment-NumberBox-default)", "Input:borderRadius-NumberBox-error": "var(--xmlui-borderRadius-NumberBox-error)", "Input:borderColor-NumberBox-error": "var(--xmlui-borderColor-NumberBox-error)", "Input:borderWidth-NumberBox-error": "var(--xmlui-borderWidth-NumberBox-error)", "Input:borderStyle-NumberBox-error": "var(--xmlui-borderStyle-NumberBox-error)", "Input:fontSize-NumberBox-error": "var(--xmlui-fontSize-NumberBox-error)", "Input:backgroundColor-NumberBox-error": "var(--xmlui-backgroundColor-NumberBox-error)", "Input:boxShadow-NumberBox-error": "var(--xmlui-boxShadow-NumberBox-error)", "Input:textColor-NumberBox-error": "var(--xmlui-textColor-NumberBox-error)", "Input:borderColor-NumberBox-error--hover": "var(--xmlui-borderColor-NumberBox-error--hover)", "Input:backgroundColor-NumberBox-error--hover": "var(--xmlui-backgroundColor-NumberBox-error--hover)", "Input:boxShadow-NumberBox-error--hover": "var(--xmlui-boxShadow-NumberBox-error--hover)", "Input:textColor-NumberBox-error--hover": "var(--xmlui-textColor-NumberBox-error--hover)", "Input:borderColor-NumberBox-error--focus": "var(--xmlui-borderColor-NumberBox-error--focus)", "Input:backgroundColor-NumberBox-error--focus": "var(--xmlui-backgroundColor-NumberBox-error--focus)", "Input:boxShadow-NumberBox-error--focus": "var(--xmlui-boxShadow-NumberBox-error--focus)", "Input:textColor-NumberBox-error--focus": "var(--xmlui-textColor-NumberBox-error--focus)", "Input:outlineWidth-NumberBox-error--focus": "var(--xmlui-outlineWidth-NumberBox-error--focus)", "Input:outlineColor-NumberBox-error--focus": "var(--xmlui-outlineColor-NumberBox-error--focus)", "Input:outlineStyle-NumberBox-error--focus": "var(--xmlui-outlineStyle-NumberBox-error--focus)", "Input:outlineOffset-NumberBox-error--focus": "var(--xmlui-outlineOffset-NumberBox-error--focus)", "Input:textColor-placeholder-NumberBox-error": "var(--xmlui-textColor-placeholder-NumberBox-error)", "Input:textColor-adornment-NumberBox-error": "var(--xmlui-textColor-adornment-NumberBox-error)", "Input:borderRadius-NumberBox-warning": "var(--xmlui-borderRadius-NumberBox-warning)", "Input:borderColor-NumberBox-warning": "var(--xmlui-borderColor-NumberBox-warning)", "Input:borderWidth-NumberBox-warning": "var(--xmlui-borderWidth-NumberBox-warning)", "Input:borderStyle-NumberBox-warning": "var(--xmlui-borderStyle-NumberBox-warning)", "Input:fontSize-NumberBox-warning": "var(--xmlui-fontSize-NumberBox-warning)", "Input:backgroundColor-NumberBox-warning": "var(--xmlui-backgroundColor-NumberBox-warning)", "Input:boxShadow-NumberBox-warning": "var(--xmlui-boxShadow-NumberBox-warning)", "Input:textColor-NumberBox-warning": "var(--xmlui-textColor-NumberBox-warning)", "Input:borderColor-NumberBox-warning--hover": "var(--xmlui-borderColor-NumberBox-warning--hover)", "Input:backgroundColor-NumberBox-warning--hover": "var(--xmlui-backgroundColor-NumberBox-warning--hover)", "Input:boxShadow-NumberBox-warning--hover": "var(--xmlui-boxShadow-NumberBox-warning--hover)", "Input:textColor-NumberBox-warning--hover": "var(--xmlui-textColor-NumberBox-warning--hover)", "Input:borderColor-NumberBox-warning--focus": "var(--xmlui-borderColor-NumberBox-warning--focus)", "Input:backgroundColor-NumberBox-warning--focus": "var(--xmlui-backgroundColor-NumberBox-warning--focus)", "Input:boxShadow-NumberBox-warning--focus": "var(--xmlui-boxShadow-NumberBox-warning--focus)", "Input:textColor-NumberBox-warning--focus": "var(--xmlui-textColor-NumberBox-warning--focus)", "Input:outlineWidth-NumberBox-warning--focus": "var(--xmlui-outlineWidth-NumberBox-warning--focus)", "Input:outlineColor-NumberBox-warning--focus": "var(--xmlui-outlineColor-NumberBox-warning--focus)", "Input:outlineStyle-NumberBox-warning--focus": "var(--xmlui-outlineStyle-NumberBox-warning--focus)", "Input:outlineOffset-NumberBox-warning--focus": "var(--xmlui-outlineOffset-NumberBox-warning--focus)", "Input:textColor-placeholder-NumberBox-warning": "var(--xmlui-textColor-placeholder-NumberBox-warning)", "Input:textColor-adornment-NumberBox-warning": "var(--xmlui-textColor-adornment-NumberBox-warning)", "Input:borderRadius-NumberBox-success": "var(--xmlui-borderRadius-NumberBox-success)", "Input:borderColor-NumberBox-success": "var(--xmlui-borderColor-NumberBox-success)", "Input:borderWidth-NumberBox-success": "var(--xmlui-borderWidth-NumberBox-success)", "Input:borderStyle-NumberBox-success": "var(--xmlui-borderStyle-NumberBox-success)", "Input:fontSize-NumberBox-success": "var(--xmlui-fontSize-NumberBox-success)", "Input:backgroundColor-NumberBox-success": "var(--xmlui-backgroundColor-NumberBox-success)", "Input:boxShadow-NumberBox-success": "var(--xmlui-boxShadow-NumberBox-success)", "Input:textColor-NumberBox-success": "var(--xmlui-textColor-NumberBox-success)", "Input:borderColor-NumberBox-success--hover": "var(--xmlui-borderColor-NumberBox-success--hover)", "Input:backgroundColor-NumberBox-success--hover": "var(--xmlui-backgroundColor-NumberBox-success--hover)", "Input:boxShadow-NumberBox-success--hover": "var(--xmlui-boxShadow-NumberBox-success--hover)", "Input:textColor-NumberBox-success--hover": "var(--xmlui-textColor-NumberBox-success--hover)", "Input:borderColor-NumberBox-success--focus": "var(--xmlui-borderColor-NumberBox-success--focus)", "Input:backgroundColor-NumberBox-success--focus": "var(--xmlui-backgroundColor-NumberBox-success--focus)", "Input:boxShadow-NumberBox-success--focus": "var(--xmlui-boxShadow-NumberBox-success--focus)", "Input:textColor-NumberBox-success--focus": "var(--xmlui-textColor-NumberBox-success--focus)", "Input:outlineWidth-NumberBox-success--focus": "var(--xmlui-outlineWidth-NumberBox-success--focus)", "Input:outlineColor-NumberBox-success--focus": "var(--xmlui-outlineColor-NumberBox-success--focus)", "Input:outlineStyle-NumberBox-success--focus": "var(--xmlui-outlineStyle-NumberBox-success--focus)", "Input:outlineOffset-NumberBox-success--focus": "var(--xmlui-outlineOffset-NumberBox-success--focus)", "Input:textColor-placeholder-NumberBox-success": "var(--xmlui-textColor-placeholder-NumberBox-success)", "Input:textColor-adornment-NumberBox-success": "var(--xmlui-textColor-adornment-NumberBox-success)", "Input:backgroundColor-NumberBox--disabled": "var(--xmlui-backgroundColor-NumberBox--disabled)", "Input:textColor-NumberBox--disabled": "var(--xmlui-textColor-NumberBox--disabled)", "Input:borderColor-NumberBox--disabled": "var(--xmlui-borderColor-NumberBox--disabled)"}'`, Vx = "_inputRoot_1dsq1_13", Ex = "_input_1dsq1_13", Px = "_adornment_1dsq1_53", Dx = "_error_1dsq1_56", Mx = "_warning_1dsq1_90", Fx = "_valid_1dsq1_124", Ux = "_spinnerBox_1dsq1_184", qx = "_spinnerButton_1dsq1_191", Gx = "_readOnly_1dsq1_197", Ke = {
  themeVars: zx,
  inputRoot: Vx,
  input: Ex,
  adornment: Px,
  error: Dx,
  warning: Mx,
  valid: Fx,
  spinnerBox: Ux,
  spinnerButton: qx,
  readOnly: Gx
}, wl = 999999999999999, Ua = ".", jo = "e", Yx = /^-?\d+$/, Xx = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/, jx = 1;
function Hl(e) {
  return typeof e > "u" || e === null || e === "";
}
function xa(e) {
  return typeof e == "string" ? e : typeof e == "number" ? e.toString() : "";
}
function Qx(e, t, r) {
  let o = e;
  return e < t && (o = t), e > r && (o = r), o;
}
function Bl(e, t = !1) {
  return (t ? Kx : Zx)(e) ? (typeof e == "string" && (e = t ? Number.parseInt(e) : +e), e) : null;
}
function Zx(e) {
  return typeof e == "string" && e.length > 0 ? !Number.isNaN(+e) && Jx(e) : typeof e == "number";
}
function Jx(e) {
  const t = e.split(".")[0];
  return Math.abs(Number.parseInt(t)) <= wl;
}
function Kx(e) {
  return typeof e == "string" && e.length > 0 && ![jo, Ua].some((t) => e.includes(t)) ? Number.isSafeInteger(+e) : typeof e == "number" ? Number.isSafeInteger(e) : !1;
}
const eb = ve(function({
  id: t,
  value: r,
  initialValue: o,
  style: a,
  enabled: n = !0,
  placeholder: i,
  validationStatus: l = "none",
  hasSpinBox: s = !0,
  step: v,
  integersOnly: x = !1,
  zeroOrPositive: c = !1,
  min: T = c ? 0 : -999999999999999,
  max: b = wl,
  maxLength: f,
  updateState: y = de,
  onDidChange: w = de,
  onFocus: _ = de,
  onBlur: H = de,
  registerComponentApi: I,
  startText: R,
  startIcon: F,
  endText: Z,
  endIcon: V,
  autoFocus: W,
  readOnly: N,
  required: O,
  label: h,
  labelPosition: p,
  labelWidth: g,
  labelBreak: C
}, L) {
  T = Math.max(c ? 0 : -999999999999999, T);
  const q = Bl(v, !0) ?? jx, z = he(null), A = he(null), B = he(null);
  ee(() => {
    W && setTimeout(() => {
      var Y;
      (Y = z.current) == null || Y.focus();
    }, 0);
  }, [W]);
  const [P, M] = Ne.useState(xa(r));
  ee(() => {
    M(xa(r));
  }, [r]), ee(() => {
    y({ value: o }, { initial: !0 });
  }, [o, y]);
  const E = X(
    (Y, D) => {
      M(D), y({ value: Y }), w(Y);
    },
    [w, y]
  ), G = X(
    (Y) => {
      const D = Y.target.value;
      E(D, D);
    },
    [E]
  ), Q = X(() => {
    if (N) return;
    const Y = Xi(P, q, T, b, x);
    Y !== void 0 && E(Y, Y.toString());
  }, [P, q, T, b, x, E, N]), K = X(() => {
    if (N) return;
    const Y = Xi(P, -q, T, b, x);
    Y !== void 0 && E(Y, Y.toString());
  }, [P, q, T, b, x, E, N]);
  ji(A.current, Q), ji(B.current, K);
  const te = (Y) => {
    var vo;
    let D = !1;
    const se = Y.target.value ?? "", _e = Y.target.selectionStart, Qe = se.substring(0, Y.target.selectionStart).indexOf(jo);
    switch (Y.data) {
      case "-":
        D = !0, Qe === -1 ? se.startsWith("-") || Sr("-" + se, _e + 1) : se[Qe + 1] !== "-" && Sr(
          se.substring(0, Qe + 1) + "-" + se.substring(Qe + 1),
          _e + 1
        );
        break;
      case "+":
        D = !0, Qe === -1 ? se.startsWith("-") && Sr(se.substring(1), _e - 1) : se[Qe + 1] === "-" && Sr(
          se.substring(0, Qe + 1) + se.substring(Qe + 2),
          _e - 1
        );
        break;
      case Ua:
        (x || se.includes(Ua) || Qe !== -1) && (D = !0);
        break;
      case jo:
        if (x) {
          D = !0;
          break;
        }
        (se.includes(jo) || Ur(_e, 2)) && (D = !0);
        break;
      default:
        let Oe = Y.data;
        const Ge = Y.target.selectionStart;
        if (((vo = Y.data) == null ? void 0 : vo.length) > 0) {
          if (Oe.startsWith("-")) {
            if (Ge > 0) {
              D = !0;
              break;
            }
          } else if (Oe.startsWith("+")) {
            D = !0;
            break;
          }
          const Ye = se.substring(0, Ge) + Oe + se.substring(Y.target.selectionEnd);
          x && !Yx.test(Ye) ? D = !0 : Xx.test(Ye) || (D = !0);
          break;
        }
        if (Y.data < "0" || Y.data > "9") {
          D = !0;
          break;
        }
        if (se.startsWith("-") && Ge === 0) {
          D = !0;
          break;
        }
        Qe !== -1 && Ur(Qe + 1, 1) && (D = !0);
        break;
    }
    D && Y.preventDefault();
    return;
    function Ur(Oe, Ge) {
      let Ye = 0;
      for (; Oe < se.length; )
        if (/\d/.test(se[Oe++]))
          Ye++;
        else {
          Ye = Ge + 1;
          break;
        }
      return Ye > Ge;
    }
    function Sr(Oe, Ge) {
      var Ye;
      Y.target.value = Oe, E(Oe, Oe), (Ye = z.current) == null || Ye.setSelectionRange(Ge, Ge);
    }
  }, be = X(
    (Y) => {
      Y.code === "ArrowUp" && (Y.preventDefault(), Q()), Y.code === "ArrowDown" && (Y.preventDefault(), K());
    },
    [Q, K]
  ), Me = X(() => {
    _ == null || _();
  }, [_]), We = X(() => {
    M(xa(r)), H == null || H();
  }, [r, H]), ie = X(() => {
    var Y;
    (Y = z.current) == null || Y.focus();
  }, []), oe = Le((Y) => {
    E(Y, Hl(Y) ? "" : String(Y));
  });
  return ee(() => {
    I == null || I({
      focus: ie,
      setValue: oe
    });
  }, [ie, I, oe]), /* @__PURE__ */ m(
    yt,
    {
      ref: L,
      labelPosition: p,
      label: h,
      labelWidth: g,
      labelBreak: C,
      required: O,
      enabled: n,
      onFocus: _,
      onBlur: H,
      style: a,
      children: /* @__PURE__ */ J(
        "div",
        {
          className: le(Ke.inputRoot, {
            [Ke.readOnly]: N,
            [Ke.disabled]: !n,
            [Ke.noSpinBox]: !s,
            [Ke.error]: l === "error",
            [Ke.warning]: l === "warning",
            [Ke.valid]: l === "valid"
          }),
          tabIndex: -1,
          onFocus: () => {
            var Y;
            (Y = z.current) == null || Y.focus();
          },
          children: [
            /* @__PURE__ */ m(so, { text: R, iconName: F, className: Ke.adornment }),
            /* @__PURE__ */ m(
              "input",
              {
                id: t,
                type: "text",
                inputMode: "numeric",
                className: le(Ke.input, { [Ke.readOnly]: N }),
                disabled: !n,
                value: P,
                step: v,
                placeholder: i,
                onChange: G,
                onFocus: Me,
                onBlur: We,
                onBeforeInput: te,
                onKeyDown: be,
                readOnly: N,
                ref: z,
                autoFocus: W,
                maxLength: f,
                required: O
              }
            ),
            /* @__PURE__ */ m(so, { text: Z, iconName: V, className: Ke.adornment }),
            s && /* @__PURE__ */ J("div", { className: Ke.spinnerBox, children: [
              /* @__PURE__ */ m(
                st,
                {
                  "data-spinner": "up",
                  type: "button",
                  variant: "ghost",
                  themeColor: "secondary",
                  tabIndex: -1,
                  className: Ke.spinnerButton,
                  disabled: !n || N,
                  ref: A,
                  children: /* @__PURE__ */ m(ke, { name: "chevronup", size: "sm" })
                }
              ),
              /* @__PURE__ */ m(
                st,
                {
                  "data-spinner": "down",
                  type: "button",
                  tabIndex: -1,
                  variant: "ghost",
                  themeColor: "secondary",
                  className: Ke.spinnerButton,
                  disabled: !n || N,
                  ref: B,
                  children: /* @__PURE__ */ m(ke, { name: "chevrondown", size: "sm" })
                }
              )
            ] })
          ]
        }
      )
    }
  );
});
function Xi(e, t, r, o, a) {
  const n = Bl(e, a);
  if (!Hl(n))
    return Qx(n + t, r, o);
}
function ji(e, t, r = 500) {
  const o = he(0), a = he(0), n = he(t);
  ee(() => {
    n.current = t;
  }, [t]), ee(() => {
    const i = () => {
      var v;
      (v = n.current) == null || v.call(n), o.current = window.setTimeout(() => {
        a.current = window.setInterval(() => {
          var x;
          (x = n.current) == null || x.call(n);
        }, 100);
      }, r);
    }, l = () => {
      clearTimeout(o.current), clearInterval(a.current);
    }, s = () => {
      clearTimeout(o.current), clearInterval(a.current);
    };
    return e == null || e.addEventListener("mousedown", i), e == null || e.addEventListener("mouseup", l), e == null || e.addEventListener("mouseout", s), () => {
      e == null || e.removeEventListener("mousedown", i), e == null || e.removeEventListener("mouseup", l), e == null || e.removeEventListener("mouseout", s);
    };
  }, [e, t, r]);
}
function mo() {
  return mo = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var o in r) ({}).hasOwnProperty.call(r, o) && (e[o] = r[o]);
    }
    return e;
  }, mo.apply(null, arguments);
}
function tb(e, t) {
  typeof e == "function" ? e(t) : e != null && (e.current = t);
}
function Il(...e) {
  return (t) => e.forEach(
    (r) => tb(r, t)
  );
}
function rb(...e) {
  return X(Il(...e), e);
}
const $l = /* @__PURE__ */ ve((e, t) => {
  const { children: r, ...o } = e, a = Bo.toArray(r), n = a.find(ab);
  if (n) {
    const i = n.props.children, l = a.map((s) => s === n ? Bo.count(i) > 1 ? Bo.only(null) : /* @__PURE__ */ Zo(i) ? i.props.children : null : s);
    return /* @__PURE__ */ $o(qa, mo({}, o, {
      ref: t
    }), /* @__PURE__ */ Zo(i) ? /* @__PURE__ */ Bn(i, void 0, l) : null);
  }
  return /* @__PURE__ */ $o(qa, mo({}, o, {
    ref: t
  }), r);
});
$l.displayName = "Slot";
const qa = /* @__PURE__ */ ve((e, t) => {
  const { children: r, ...o } = e;
  return /* @__PURE__ */ Zo(r) ? /* @__PURE__ */ Bn(r, {
    ...ib(o, r.props),
    ref: t ? Il(t, r.ref) : r.ref
  }) : Bo.count(r) > 1 ? Bo.only(null) : null;
});
qa.displayName = "SlotClone";
const ob = ({ children: e }) => /* @__PURE__ */ $o(In, null, e);
function ab(e) {
  return /* @__PURE__ */ Zo(e) && e.type === ob;
}
function ib(e, t) {
  const r = {
    ...t
  };
  for (const o in t) {
    const a = e[o], n = t[o];
    /^on[A-Z]/.test(o) ? a && n ? r[o] = (...l) => {
      n(...l), a(...l);
    } : a && (r[o] = a) : o === "style" ? r[o] = {
      ...a,
      ...n
    } : o === "className" && (r[o] = [
      a,
      n
    ].filter(Boolean).join(" "));
  }
  return {
    ...e,
    ...r
  };
}
const nb = [
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
], lb = nb.reduce((e, t) => {
  const r = /* @__PURE__ */ ve((o, a) => {
    const { asChild: n, ...i } = o, l = n ? $l : t;
    return ee(() => {
      window[Symbol.for("radix-ui")] = !0;
    }, []), /* @__PURE__ */ $o(l, mo({}, i, {
      ref: a
    }));
  });
  return r.displayName = `Primitive.${t}`, {
    ...e,
    [t]: r
  };
}, {});
function Qi(e) {
  const t = he(e);
  return ee(() => {
    t.current = e;
  }), ce(
    () => (...r) => {
      var o;
      return (o = t.current) === null || o === void 0 ? void 0 : o.call(t, ...r);
    },
    []
  );
}
const ba = "focusScope.autoFocusOnMount", va = "focusScope.autoFocusOnUnmount", Zi = {
  bubbles: !1,
  cancelable: !0
}, db = /* @__PURE__ */ ve((e, t) => {
  const { loop: r = !1, trapped: o = !1, onMountAutoFocus: a, onUnmountAutoFocus: n, ...i } = e, [l, s] = me(null), v = Qi(a), x = Qi(n), c = he(null), T = rb(
    t,
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
  ee(() => {
    if (o) {
      let y = function(I) {
        if (b.paused || !l) return;
        const R = I.target;
        l.contains(R) ? c.current = R : vr(c.current, {
          select: !0
        });
      }, w = function(I) {
        if (b.paused || !l) return;
        const R = I.relatedTarget;
        R !== null && (l.contains(R) || vr(c.current, {
          select: !0
        }));
      }, _ = function(I) {
        if (document.activeElement === document.body)
          for (const F of I) F.removedNodes.length > 0 && vr(l);
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
  ]), ee(() => {
    if (l) {
      Ki.add(b);
      const y = document.activeElement;
      if (!l.contains(y)) {
        const _ = new CustomEvent(ba, Zi);
        l.addEventListener(ba, v), l.dispatchEvent(_), _.defaultPrevented || (sb(hb(Ll(l)), {
          select: !0
        }), document.activeElement === y && vr(l));
      }
      return () => {
        l.removeEventListener(ba, v), setTimeout(() => {
          const _ = new CustomEvent(va, Zi);
          l.addEventListener(va, x), l.dispatchEvent(_), _.defaultPrevented || vr(y ?? document.body, {
            select: !0
          }), l.removeEventListener(va, x), Ki.remove(b);
        }, 0);
      };
    }
  }, [
    l,
    v,
    x,
    b
  ]);
  const f = X((y) => {
    if (!r && !o || b.paused) return;
    const w = y.key === "Tab" && !y.altKey && !y.ctrlKey && !y.metaKey, _ = document.activeElement;
    if (w && _) {
      const H = y.currentTarget, [I, R] = ub(H);
      I && R ? !y.shiftKey && _ === R ? (y.preventDefault(), r && vr(I, {
        select: !0
      })) : y.shiftKey && _ === I && (y.preventDefault(), r && vr(R, {
        select: !0
      })) : _ === H && y.preventDefault();
    }
  }, [
    r,
    o,
    b.paused
  ]);
  return /* @__PURE__ */ $o(lb.div, mo({
    tabIndex: -1
  }, i, {
    ref: T,
    onKeyDown: f
  }));
});
function sb(e, { select: t = !1 } = {}) {
  const r = document.activeElement;
  for (const o of e)
    if (vr(o, {
      select: t
    }), document.activeElement !== r) return;
}
function ub(e) {
  const t = Ll(e), r = Ji(t, e), o = Ji(t.reverse(), e);
  return [
    r,
    o
  ];
}
function Ll(e) {
  const t = [], r = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (o) => {
      const a = o.tagName === "INPUT" && o.type === "hidden";
      return o.disabled || o.hidden || a ? NodeFilter.FILTER_SKIP : o.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; r.nextNode(); ) t.push(r.currentNode);
  return t;
}
function Ji(e, t) {
  for (const r of e)
    if (!cb(r, {
      upTo: t
    })) return r;
}
function cb(e, { upTo: t }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (t !== void 0 && e === t) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function mb(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function vr(e, { select: t = !1 } = {}) {
  if (e && e.focus) {
    const r = document.activeElement;
    e.focus({
      preventScroll: !0
    }), e !== r && mb(e) && t && e.select();
  }
}
const Ki = pb();
function pb() {
  let e = [];
  return {
    add(t) {
      const r = e[0];
      t !== r && (r == null || r.pause()), e = en(e, t), e.unshift(t);
    },
    remove(t) {
      var r;
      e = en(e, t), (r = e[0]) === null || r === void 0 || r.resume();
    }
  };
}
function en(e, t) {
  const r = [
    ...e
  ], o = r.indexOf(t);
  return o !== -1 && r.splice(o, 1), r;
}
function hb(e) {
  return e.filter(
    (t) => t.tagName !== "A"
  );
}
const xb = `'{"Input:fontSize-Select-default": "var(--xmlui-fontSize-Select-default)", "Input:textColor-placeholder-Select-default": "var(--xmlui-textColor-placeholder-Select-default)", "Input:textColor-Select-default": "var(--xmlui-textColor-Select-default)", "Input:fontSize-Select-error": "var(--xmlui-fontSize-Select-error)", "Input:textColor-placeholder-Select-error": "var(--xmlui-textColor-placeholder-Select-error)", "Input:textColor-Select-error": "var(--xmlui-textColor-Select-error)", "Input:fontSize-Select-warning": "var(--xmlui-fontSize-Select-warning)", "Input:textColor-placeholder-Select-warning": "var(--xmlui-textColor-placeholder-Select-warning)", "Input:textColor-Select-warning": "var(--xmlui-textColor-Select-warning)", "Input:fontSize-Select-success": "var(--xmlui-fontSize-Select-success)", "Input:textColor-placeholder-Select-success": "var(--xmlui-textColor-placeholder-Select-success)", "Input:textColor-Select-success": "var(--xmlui-textColor-Select-success)", "Input:borderRadius-Select-default": "var(--xmlui-borderRadius-Select-default)", "Input:borderColor-Select-default": "var(--xmlui-borderColor-Select-default)", "Input:borderWidth-Select-default": "var(--xmlui-borderWidth-Select-default)", "Input:borderStyle-Select-default": "var(--xmlui-borderStyle-Select-default)", "Input:backgroundColor-Select-default": "var(--xmlui-backgroundColor-Select-default)", "Input:boxShadow-Select-default": "var(--xmlui-boxShadow-Select-default)", "Input:borderColor-Select-default--hover": "var(--xmlui-borderColor-Select-default--hover)", "Input:backgroundColor-Select-default--hover": "var(--xmlui-backgroundColor-Select-default--hover)", "Input:boxShadow-Select-default--hover": "var(--xmlui-boxShadow-Select-default--hover)", "Input:textColor-Select-default--hover": "var(--xmlui-textColor-Select-default--hover)", "Input:outlineWidth-Select-default--focus": "var(--xmlui-outlineWidth-Select-default--focus)", "Input:outlineColor-Select-default--focus": "var(--xmlui-outlineColor-Select-default--focus)", "Input:outlineStyle-Select-default--focus": "var(--xmlui-outlineStyle-Select-default--focus)", "Input:outlineOffset-Select-default--focus": "var(--xmlui-outlineOffset-Select-default--focus)", "Input:borderRadius-Select-error": "var(--xmlui-borderRadius-Select-error)", "Input:borderColor-Select-error": "var(--xmlui-borderColor-Select-error)", "Input:borderWidth-Select-error": "var(--xmlui-borderWidth-Select-error)", "Input:borderStyle-Select-error": "var(--xmlui-borderStyle-Select-error)", "Input:backgroundColor-Select-error": "var(--xmlui-backgroundColor-Select-error)", "Input:boxShadow-Select-error": "var(--xmlui-boxShadow-Select-error)", "Input:borderColor-Select-error--hover": "var(--xmlui-borderColor-Select-error--hover)", "Input:backgroundColor-Select-error--hover": "var(--xmlui-backgroundColor-Select-error--hover)", "Input:boxShadow-Select-error--hover": "var(--xmlui-boxShadow-Select-error--hover)", "Input:textColor-Select-error--hover": "var(--xmlui-textColor-Select-error--hover)", "Input:outlineWidth-Select-error--focus": "var(--xmlui-outlineWidth-Select-error--focus)", "Input:outlineColor-Select-error--focus": "var(--xmlui-outlineColor-Select-error--focus)", "Input:outlineStyle-Select-error--focus": "var(--xmlui-outlineStyle-Select-error--focus)", "Input:outlineOffset-Select-error--focus": "var(--xmlui-outlineOffset-Select-error--focus)", "Input:borderRadius-Select-warning": "var(--xmlui-borderRadius-Select-warning)", "Input:borderColor-Select-warning": "var(--xmlui-borderColor-Select-warning)", "Input:borderWidth-Select-warning": "var(--xmlui-borderWidth-Select-warning)", "Input:borderStyle-Select-warning": "var(--xmlui-borderStyle-Select-warning)", "Input:backgroundColor-Select-warning": "var(--xmlui-backgroundColor-Select-warning)", "Input:boxShadow-Select-warning": "var(--xmlui-boxShadow-Select-warning)", "Input:borderColor-Select-warning--hover": "var(--xmlui-borderColor-Select-warning--hover)", "Input:backgroundColor-Select-warning--hover": "var(--xmlui-backgroundColor-Select-warning--hover)", "Input:boxShadow-Select-warning--hover": "var(--xmlui-boxShadow-Select-warning--hover)", "Input:textColor-Select-warning--hover": "var(--xmlui-textColor-Select-warning--hover)", "Input:outlineWidth-Select-warning--focus": "var(--xmlui-outlineWidth-Select-warning--focus)", "Input:outlineColor-Select-warning--focus": "var(--xmlui-outlineColor-Select-warning--focus)", "Input:outlineStyle-Select-warning--focus": "var(--xmlui-outlineStyle-Select-warning--focus)", "Input:outlineOffset-Select-warning--focus": "var(--xmlui-outlineOffset-Select-warning--focus)", "Input:borderRadius-Select-success": "var(--xmlui-borderRadius-Select-success)", "Input:borderColor-Select-success": "var(--xmlui-borderColor-Select-success)", "Input:borderWidth-Select-success": "var(--xmlui-borderWidth-Select-success)", "Input:borderStyle-Select-success": "var(--xmlui-borderStyle-Select-success)", "Input:backgroundColor-Select-success": "var(--xmlui-backgroundColor-Select-success)", "Input:boxShadow-Select-success": "var(--xmlui-boxShadow-Select-success)", "Input:borderColor-Select-success--hover": "var(--xmlui-borderColor-Select-success--hover)", "Input:backgroundColor-Select-success--hover": "var(--xmlui-backgroundColor-Select-success--hover)", "Input:boxShadow-Select-success--hover": "var(--xmlui-boxShadow-Select-success--hover)", "Input:textColor-Select-success--hover": "var(--xmlui-textColor-Select-success--hover)", "Input:outlineWidth-Select-success--focus": "var(--xmlui-outlineWidth-Select-success--focus)", "Input:outlineColor-Select-success--focus": "var(--xmlui-outlineColor-Select-success--focus)", "Input:outlineStyle-Select-success--focus": "var(--xmlui-outlineStyle-Select-success--focus)", "Input:outlineOffset-Select-success--focus": "var(--xmlui-outlineOffset-Select-success--focus)", "opacity-Select--disabled": "var(--xmlui-opacity-Select--disabled)", "Input:backgroundColor-Select--disabled": "var(--xmlui-backgroundColor-Select--disabled)", "Input:textColor-Select--disabled": "var(--xmlui-textColor-Select--disabled)", "Input:borderColor-Select--disabled": "var(--xmlui-borderColor-Select--disabled)", "paddingVertical-Select-badge": "var(--xmlui-paddingVertical-Select-badge)", "paddingHorizontal-Select-badge": "var(--xmlui-paddingHorizontal-Select-badge)", "Input:fontSize-Select-badge": "var(--xmlui-fontSize-Select-badge)", "Input:backgroundColor-Select-badge": "var(--xmlui-backgroundColor-Select-badge)", "Input:textColor-Select-badge": "var(--xmlui-textColor-Select-badge)", "Input:backgroundColor-Select-badge--hover": "var(--xmlui-backgroundColor-Select-badge--hover)", "Input:textColor-Select-badge--hover": "var(--xmlui-textColor-Select-badge--hover)", "Input:backgroundColor-Select-badge--active": "var(--xmlui-backgroundColor-Select-badge--active)", "Input:textColor-Select-badge--active": "var(--xmlui-textColor-Select-badge--active)", "Input:textColor-placeholder-Select": "var(--xmlui-textColor-placeholder-Select)", "Input:backgroundColor-menu-Select": "var(--xmlui-backgroundColor-menu-Select)", "Input:borderRadius-menu-Select": "var(--xmlui-borderRadius-menu-Select)", "Input:boxShadow-menu-Select": "var(--xmlui-boxShadow-menu-Select)", "Input:borderWidth-menu-Select": "var(--xmlui-borderWidth-menu-Select)", "Input:borderColor-menu-Select": "var(--xmlui-borderColor-menu-Select)", "backgroundColor-item-Select": "var(--xmlui-backgroundColor-item-Select)", "backgroundColor-item-Select--hover": "var(--xmlui-backgroundColor-item-Select--hover)", "opacity-text-item-Select--disabled": "var(--xmlui-opacity-text-item-Select--disabled)", "fontSize-Select": "var(--xmlui-fontSize-Select)", "backgroundColor-item-Select--active": "var(--xmlui-backgroundColor-item-Select--active)", "textColor-indicator-Select": "var(--xmlui-textColor-indicator-Select)"}'`, bb = "_selectValue_1gnmc_13", vb = "_error_1gnmc_21", fb = "_warning_1gnmc_29", gb = "_valid_1gnmc_37", Tb = "_selectTrigger_1gnmc_46", yb = "_badgeListContainer_1gnmc_170", Cb = "_badgeList_1gnmc_170", kb = "_badge_1gnmc_170", Sb = "_actions_1gnmc_210", wb = "_placeholder_1gnmc_216", Hb = "_emptyList_1gnmc_221", Bb = "_selectScrollUpButton_1gnmc_231", Ib = "_selectScrollDownButton_1gnmc_240", $b = "_command_1gnmc_249", Lb = "_commandInputContainer_1gnmc_259", _b = "_commandInput_1gnmc_259", Ab = "_commandList_1gnmc_284", Nb = "_selectContent_1gnmc_289", Wb = "_fadeIn_1gnmc_1", Ob = "_zoomIn_1gnmc_1", Rb = "_fadeOut_1gnmc_1", zb = "_zoomOut_1gnmc_1", Vb = "_slideInFromTop_1gnmc_1", Eb = "_slideInFromRight_1gnmc_1", Pb = "_slideInFromLeft_1gnmc_1", Db = "_slideInFromBottom_1gnmc_1", Mb = "_multiComboboxOption_1gnmc_329", Fb = "_selectItem_1gnmc_349", Ub = "_selectItemIndicator_1gnmc_377", qb = "_selectViewport_1gnmc_388", Gb = "_selectEmpty_1gnmc_394", Yb = "_srOnly_1gnmc_405", Se = {
  themeVars: xb,
  selectValue: bb,
  error: vb,
  warning: fb,
  valid: gb,
  selectTrigger: Tb,
  badgeListContainer: yb,
  badgeList: Cb,
  badge: kb,
  actions: Sb,
  placeholder: wb,
  emptyList: Hb,
  selectScrollUpButton: Bb,
  selectScrollDownButton: Ib,
  command: $b,
  commandInputContainer: Lb,
  commandInput: _b,
  commandList: Ab,
  selectContent: Nb,
  fadeIn: Wb,
  zoomIn: Ob,
  fadeOut: Rb,
  zoomOut: zb,
  slideInFromTop: Vb,
  slideInFromRight: Eb,
  slideInFromLeft: Pb,
  slideInFromBottom: Db,
  multiComboboxOption: Mb,
  selectItem: Fb,
  selectItemIndicator: Ub,
  selectViewport: qb,
  selectEmpty: Gb,
  srOnly: Yb
}, _l = Qt(null);
function Al() {
  return Lt(_l);
}
const Nl = Ne.createContext(null);
function Xb() {
  return Ne.useContext(Nl);
}
function la({
  children: e,
  Component: t
}) {
  return /* @__PURE__ */ m(Nl.Provider, { value: t, children: e });
}
const ni = Qt({
  onOptionAdd: () => {
  },
  onOptionRemove: () => {
  }
});
function li() {
  return Lt(ni);
}
const jb = ve(function(t, r) {
  const { root: o } = tr(), {
    enabled: a,
    onBlur: n,
    autoFocus: i,
    onValueChange: l,
    validationStatus: s,
    children: v,
    value: x,
    height: c,
    style: T,
    placeholder: b,
    id: f,
    triggerRef: y,
    onFocus: w,
    options: _
  } = t, H = r ? sr(y, r) : y, I = x + "", R = X(
    (F) => {
      var V;
      const Z = (V = Array.from(_.values()).find(
        (W) => W.value + "" === F
      )) == null ? void 0 : V.value;
      l(Z);
    },
    [l, _]
  );
  return /* @__PURE__ */ m(la, { Component: Ol, children: /* @__PURE__ */ J(pd, { value: I, onValueChange: R, children: [
    /* @__PURE__ */ J(
      hd,
      {
        id: f,
        style: T,
        onFocus: w,
        onBlur: n,
        disabled: !a,
        className: le(Se.selectTrigger, {
          [Se.error]: s === "error",
          [Se.warning]: s === "warning",
          [Se.valid]: s === "valid"
        }),
        ref: H,
        autoFocus: i,
        children: [
          /* @__PURE__ */ m("div", { className: Se.selectValue, children: /* @__PURE__ */ m(xd, { placeholder: b }) }),
          /* @__PURE__ */ m(bd, { asChild: !0, children: /* @__PURE__ */ m(ke, { name: "chevrondown" }) })
        ]
      }
    ),
    /* @__PURE__ */ m(Nn, { container: o, children: /* @__PURE__ */ J(
      vd,
      {
        className: Se.selectContent,
        position: "popper",
        style: { height: c },
        children: [
          /* @__PURE__ */ m(fd, { className: Se.selectScrollUpButton, children: /* @__PURE__ */ m(ke, { name: "chevronup" }) }),
          /* @__PURE__ */ m(gd, { className: le(Se.selectViewport), children: v }),
          /* @__PURE__ */ m(Td, { className: Se.selectScrollDownButton, children: /* @__PURE__ */ m(ke, { name: "chevrondown" }) })
        ]
      }
    ) })
  ] }) });
}), Qb = ve(function({
  id: t,
  initialValue: r,
  value: o,
  enabled: a = !0,
  placeholder: n,
  updateState: i = de,
  validationStatus: l = "none",
  onDidChange: s = de,
  onFocus: v = de,
  onBlur: x = de,
  registerComponentApi: c,
  emptyListTemplate: T,
  optionLabelRenderer: b,
  valueRenderer: f,
  style: y,
  dropdownHeight: w,
  children: _,
  autoFocus: H = !1,
  searchable: I = !1,
  multiSelect: R = !1,
  label: F,
  labelPosition: Z,
  labelWidth: V,
  labelBreak: W,
  required: N = !1
}, O) {
  var ie;
  const [h, p] = me(null), [g, C] = me(!1), [L, q] = me(0), z = he(), { root: A } = tr(), [B, P] = me(/* @__PURE__ */ new Set());
  ee(() => {
    r !== void 0 && i({ value: r }, { initial: !0 });
  }, [r, i]), ee(() => {
    var Y;
    const oe = h;
    return (Y = z.current) == null || Y.disconnect(), oe && (z.current = new ResizeObserver(() => q(oe.clientWidth)), z.current.observe(oe)), () => {
      var D;
      (D = z.current) == null || D.disconnect();
    };
  }, [h]);
  const M = X(
    (oe) => {
      const Y = R ? Array.isArray(o) ? o.includes(oe) ? o.filter((D) => D !== oe) : [...o, oe] : [oe] : oe === o ? null : oe;
      i({ value: Y }), s(Y), C(!1);
    },
    [R, o, i, s]
  ), E = X(() => {
    const oe = R ? [] : "";
    i({ value: oe }), s(oe);
  }, [R, i, s]), G = X(() => {
    h == null || h.focus();
  }, [h]), Q = Le((oe) => {
    M(oe);
  });
  ee(() => {
    c == null || c({
      focus: G,
      setValue: Q
    });
  }, [G, c, Q]);
  const K = ce(
    () => T ?? /* @__PURE__ */ J("div", { className: Se.selectEmpty, children: [
      /* @__PURE__ */ m(ke, { name: "noresult" }),
      /* @__PURE__ */ m("span", { children: "List is empty" })
    ] }),
    [T]
  ), te = X((oe) => {
    P((Y) => new Set(Y).add(oe));
  }, []), be = X((oe) => {
    P((Y) => {
      const D = new Set(Y);
      return D.delete(oe), D;
    });
  }, []), Me = ce(
    () => ({
      onOptionAdd: te,
      onOptionRemove: be
    }),
    [te, be]
  ), We = ce(
    () => ({
      multiSelect: R,
      value: o,
      optionLabelRenderer: b,
      onChange: M
    }),
    [R, M, o, b]
  );
  return /* @__PURE__ */ m(_l.Provider, { value: We, children: /* @__PURE__ */ m(ni.Provider, { value: Me, children: I || R ? /* @__PURE__ */ J(la, { Component: Wl, children: [
    _,
    /* @__PURE__ */ m(
      yt,
      {
        ref: O,
        labelPosition: Z,
        label: F,
        labelWidth: V,
        labelBreak: W,
        required: N,
        enabled: a,
        onFocus: v,
        onBlur: x,
        style: y,
        children: /* @__PURE__ */ J(Wn, { open: g, onOpenChange: C, modal: !1, children: [
          /* @__PURE__ */ m(On, { asChild: !0, children: /* @__PURE__ */ J(
            "button",
            {
              id: t,
              ref: p,
              onFocus: v,
              onBlur: x,
              disabled: !a,
              "aria-expanded": g,
              onClick: () => C((oe) => !oe),
              className: le(Se.selectTrigger, Se[l], {
                [Se.disabled]: !a,
                [Se.multi]: R
              }),
              autoFocus: H,
              children: [
                R ? Array.isArray(o) && o.length > 0 ? /* @__PURE__ */ m("div", { className: Se.badgeListContainer, children: /* @__PURE__ */ m("div", { className: Se.badgeList, children: o.map(
                  (oe) => {
                    var Y;
                    return f ? f(
                      Array.from(B).find((D) => D.value === oe),
                      () => {
                        M(oe);
                      }
                    ) : /* @__PURE__ */ J("span", { className: Se.badge, children: [
                      (Y = Array.from(B).find((D) => D.value === oe)) == null ? void 0 : Y.label,
                      /* @__PURE__ */ m(
                        ke,
                        {
                          name: "close",
                          size: "sm",
                          onClick: (D) => {
                            D.stopPropagation(), M(oe);
                          }
                        }
                      )
                    ] }, oe);
                  }
                ) }) }) : /* @__PURE__ */ m("span", { className: Se.placeholder, children: n || "" }) : o != null ? /* @__PURE__ */ m("div", { children: (ie = Array.from(B).find((oe) => oe.value === o)) == null ? void 0 : ie.label }) : /* @__PURE__ */ m("span", { className: Se.placeholder, children: n || "" }),
                /* @__PURE__ */ J("div", { className: Se.actions, children: [
                  R && Array.isArray(o) && o.length > 0 && /* @__PURE__ */ m(
                    ke,
                    {
                      name: "close",
                      onClick: (oe) => {
                        oe.stopPropagation(), E();
                      }
                    }
                  ),
                  /* @__PURE__ */ m(ke, { name: "chevrondown" })
                ] })
              ]
            }
          ) }),
          g && /* @__PURE__ */ m(Nn, { container: A, children: /* @__PURE__ */ m(db, { asChild: !0, loop: !0, trapped: !0, children: /* @__PURE__ */ m(
            Rn,
            {
              style: { width: L, height: w },
              className: Se.selectContent,
              children: /* @__PURE__ */ J(
                zn,
                {
                  className: Se.command,
                  shouldFilter: I,
                  filter: (oe, Y, D) => (oe + " " + D.join(" ")).toLowerCase().includes(Y.toLowerCase()) ? 1 : 0,
                  children: [
                    I ? /* @__PURE__ */ J("div", { className: Se.commandInputContainer, children: [
                      /* @__PURE__ */ m(ke, { name: "search" }),
                      /* @__PURE__ */ m(
                        _a,
                        {
                          className: le(Se.commandInput),
                          placeholder: "Search..."
                        }
                      )
                    ] }) : (
                      // https://github.com/pacocoursey/cmdk/issues/322#issuecomment-2444703817
                      /* @__PURE__ */ m("button", { autoFocus: !0, "aria-hidden": "true", className: Se.srOnly })
                    ),
                    /* @__PURE__ */ J(Vn, { className: Se.commandList, children: [
                      Array.from(B).map(({ value: oe, label: Y, enabled: D, keywords: se }) => /* @__PURE__ */ m(
                        Zb,
                        {
                          value: oe,
                          label: Y,
                          enabled: D,
                          keywords: se
                        },
                        oe
                      )),
                      /* @__PURE__ */ m(En, { children: K })
                    ] })
                  ]
                }
              )
            }
          ) }) })
        ] })
      }
    )
  ] }) : /* @__PURE__ */ m(
    jb,
    {
      ref: O,
      value: o,
      options: B,
      onValueChange: M,
      id: t,
      style: y,
      onFocus: v,
      onBlur: x,
      enabled: a,
      validationStatus: l,
      triggerRef: p,
      autoFocus: H,
      placeholder: n,
      height: w,
      children: _ || K
    }
  ) }) });
}), Zb = ve(function(t, r) {
  const o = po(), { label: a, value: n, enabled: i = !0, keywords: l } = t, { value: s, onChange: v, multi: x, optionLabelRenderer: c } = Al(), T = Array.isArray(s) && x ? s.includes(n) : s === n;
  return /* @__PURE__ */ J(
    Xa,
    {
      id: o,
      ref: r,
      disabled: !i,
      value: n,
      className: Se.multiComboboxOption,
      onSelect: () => {
        v(n);
      },
      "data-state": T ? "checked" : void 0,
      keywords: l,
      children: [
        c ? c({ label: a, value: n }) : a,
        T && /* @__PURE__ */ m(ke, { name: "checkmark" })
      ]
    },
    o
  );
});
function Wl(e) {
  const { onOptionRemove: t, onOptionAdd: r } = li(), [o, a] = me(null), n = ce(() => ({
    ...e,
    labelText: (o == null ? void 0 : o.textContent) ?? "",
    keywords: [(o == null ? void 0 : o.textContent) ?? ""]
  }), [e, o]);
  return ee(() => (r(n), () => t(n)), [n, r, t]), /* @__PURE__ */ m("div", { ref: (i) => a(i), style: { display: "none" }, children: e.label });
}
const Ol = Ne.forwardRef(
  (e, t) => {
    const { value: r, label: o, enabled: a = !0 } = e, { onOptionRemove: n, onOptionAdd: i } = li(), { optionLabelRenderer: l } = Al();
    return Io(() => (i(e), () => n(e)), [e, i, n]), /* @__PURE__ */ J(yd, { ref: t, className: Se.selectItem, value: r + "", disabled: !a, children: [
      /* @__PURE__ */ m(Cd, { children: l ? l({ value: r, label: o }) : o }),
      /* @__PURE__ */ m("span", { className: Se.selectItemIndicator, children: /* @__PURE__ */ m(kd, { children: /* @__PURE__ */ m(ke, { name: "checkmark" }) }) })
    ] });
  }
);
Ol.displayName = "SelectOption";
const Jb = `'{"gap-RadioGroupOption": "var(--xmlui-gap-RadioGroupOption)", "Input:backgroundColor-RadioGroupOption-default": "var(--xmlui-backgroundColor-RadioGroupOption-default)", "borderWidth-RadioGroupOption": "var(--xmlui-borderWidth-RadioGroupOption)", "Input:borderColor-RadioGroupOption-default": "var(--xmlui-borderColor-RadioGroupOption-default)", "Input:borderColor-RadioGroupOption-default--hover": "var(--xmlui-borderColor-RadioGroupOption-default--hover)", "Input:borderColor-RadioGroupOption-default--active": "var(--xmlui-borderColor-RadioGroupOption-default--active)", "Input:borderColor-RadioGroupOption--disabled": "var(--xmlui-borderColor-RadioGroupOption--disabled)", "Input:color-RadioGroupOption--disabled": "var(--xmlui-color-RadioGroupOption--disabled)", "Input:borderColor-RadioGroupOption-error": "var(--xmlui-borderColor-RadioGroupOption-error)", "Input:borderColor-RadioGroupOption-warning": "var(--xmlui-borderColor-RadioGroupOption-warning)", "Input:borderColor-RadioGroupOption-success": "var(--xmlui-borderColor-RadioGroupOption-success)", "backgroundColor-checked-RadioGroupOption-default": "var(--xmlui-backgroundColor-checked-RadioGroupOption-default)", "backgroundColor-checked-RadioGroupOption--disabled": "var(--xmlui-backgroundColor-checked-RadioGroupOption--disabled)", "backgroundColor-checked-RadioGroupOption-error": "var(--xmlui-backgroundColor-checked-RadioGroupOption-error)", "backgroundColor-checked-RadioGroupOption-warning": "var(--xmlui-backgroundColor-checked-RadioGroupOption-warning)", "backgroundColor-checked-RadioGroupOption-success": "var(--xmlui-backgroundColor-checked-RadioGroupOption-success)", "Input:fontSize-RadioGroupOption": "var(--xmlui-fontSize-RadioGroupOption)", "Input:fontWeight-RadioGroupOption": "var(--xmlui-fontWeight-RadioGroupOption)", "Input:color-RadioGroupOption-default": "var(--xmlui-color-RadioGroupOption-default)", "Input:color-RadioGroupOption-error": "var(--xmlui-color-RadioGroupOption-error)", "Input:color-RadioGroupOption-warning": "var(--xmlui-color-RadioGroupOption-warning)", "Input:color-RadioGroupOption-success": "var(--xmlui-color-RadioGroupOption-success)", "Input:outlineWidth-RadioGroupOption--focus": "var(--xmlui-outlineWidth-RadioGroupOption--focus)", "Input:outlineColor-RadioGroupOption--focus": "var(--xmlui-outlineColor-RadioGroupOption--focus)", "Input:outlineStyle-RadioGroupOption--focus": "var(--xmlui-outlineStyle-RadioGroupOption--focus)", "Input:outlineOffset-RadioGroupOption--focus": "var(--xmlui-outlineOffset-RadioGroupOption--focus)"}'`, Kb = "_radioGroupContainer_294hm_13", ev = "_radioOptionContainer_294hm_20", tv = "_radioOption_294hm_20", rv = "_error_294hm_55", ov = "_warning_294hm_58", av = "_valid_294hm_61", iv = "_indicator_294hm_65", nv = "_disabled_294hm_78", lv = "_itemContainer_294hm_91", dv = "_optionLabel_294hm_99", sv = "_label_294hm_104", nt = {
  themeVars: Jb,
  radioGroupContainer: Kb,
  radioOptionContainer: ev,
  radioOption: tv,
  error: rv,
  warning: ov,
  valid: av,
  indicator: iv,
  disabled: nv,
  itemContainer: lv,
  optionLabel: dv,
  label: sv
}, Rl = Qt({
  status: "none"
}), uv = ve(function({
  id: t,
  value: r = "",
  initialValue: o = "",
  enabled: a = !0,
  validationStatus: n = "none",
  label: i,
  labelPosition: l,
  labelWidth: s,
  labelBreak: v,
  required: x = !1,
  updateState: c = de,
  onDidChange: T = de,
  onFocus: b = de,
  onBlur: f = de,
  children: y,
  registerComponentApi: w,
  style: _
}, H) {
  const [I, R] = Ne.useState(!1);
  ee(() => {
    c({ value: o }, { initial: !0 });
  }, [o, c]);
  const F = X(
    (h) => {
      c({ value: h }), T(h);
    },
    [T, c]
  ), Z = X(
    (h) => {
      F(h);
    },
    [F]
  ), V = X(() => {
    R(!0), b == null || b();
  }, [b]), W = X(() => {
    R(!1), f == null || f();
  }, [f]), N = Le((h) => {
    F(h);
  });
  ee(() => {
    w == null || w({
      //focus,
      setValue: N
    });
  }, [
    /* focus, */
    w,
    N
  ]);
  const O = ce(() => ({ value: r, status: n }), [r, n]);
  return /* @__PURE__ */ m(
    yt,
    {
      ref: H,
      labelPosition: l,
      label: i,
      labelWidth: s,
      labelBreak: v,
      required: x,
      enabled: a,
      onFocus: b,
      onBlur: f,
      style: _,
      children: /* @__PURE__ */ m(la, { Component: cv, children: /* @__PURE__ */ m(Rl.Provider, { value: O, children: /* @__PURE__ */ m(
        Aa.Root,
        {
          id: t,
          onBlur: W,
          onFocus: V,
          onValueChange: Z,
          value: r,
          disabled: !a,
          className: le(nt.radioGroupContainer, {
            [nt.focused]: I,
            [nt.disabled]: !a
          }),
          children: y
        }
      ) }) })
    }
  );
}), cv = ({
  value: e,
  label: t,
  enabled: r = !0,
  optionRenderer: o,
  style: a
}) => {
  const n = po(), i = Lt(Rl), l = ce(
    () => ({
      [nt.disabled]: !r,
      [nt.error]: e === i.value && i.status === "error",
      [nt.warning]: e === i.value && i.status === "warning",
      [nt.valid]: e === i.value && i.status === "valid"
    }),
    [r, i.status, i.value, e]
  ), s = ce(
    () => /* @__PURE__ */ J(Tt, { children: [
      /* @__PURE__ */ m(
        Aa.Item,
        {
          className: le(nt.radioOption, l),
          value: e,
          disabled: !r,
          id: n,
          children: /* @__PURE__ */ m(Aa.Indicator, { className: le(nt.indicator, l) })
        }
      ),
      /* @__PURE__ */ m("label", { htmlFor: n, className: le(nt.label, l), children: t ?? e })
    ] }),
    [r, n, t, l, e]
  );
  return /* @__PURE__ */ m("div", { className: nt.radioOptionContainer, style: a, children: o ? /* @__PURE__ */ J("label", { className: nt.optionLabel, children: [
    /* @__PURE__ */ m("div", { className: nt.itemContainer, children: s }),
    o({
      $checked: e === i.value
    })
  ] }) : s }, n);
}, mv = `'{"Input:borderRadius-Textarea-default": "var(--xmlui-borderRadius-Textarea-default)", "Input:borderColor-Textarea-default": "var(--xmlui-borderColor-Textarea-default)", "Input:borderWidth-Textarea-default": "var(--xmlui-borderWidth-Textarea-default)", "Input:borderStyle-Textarea-default": "var(--xmlui-borderStyle-Textarea-default)", "Input:fontSize-Textarea-default": "var(--xmlui-fontSize-Textarea-default)", "Input:padding-Textarea-default": "var(--xmlui-padding-Textarea-default)", "Input:backgroundColor-Textarea-default": "var(--xmlui-backgroundColor-Textarea-default)", "Input:boxShadow-Textarea-default": "var(--xmlui-boxShadow-Textarea-default)", "Input:textColor-Textarea-default": "var(--xmlui-textColor-Textarea-default)", "Input:borderColor-Textarea-default--hover": "var(--xmlui-borderColor-Textarea-default--hover)", "Input:backgroundColor-Textarea-default--hover": "var(--xmlui-backgroundColor-Textarea-default--hover)", "Input:boxShadow-Textarea-default--hover": "var(--xmlui-boxShadow-Textarea-default--hover)", "Input:textColor-Textarea-default--hover": "var(--xmlui-textColor-Textarea-default--hover)", "Input:borderColor-Textarea-default--focus": "var(--xmlui-borderColor-Textarea-default--focus)", "Input:backgroundColor-Textarea-default--focus": "var(--xmlui-backgroundColor-Textarea-default--focus)", "Input:boxShadow-Textarea-default--focus": "var(--xmlui-boxShadow-Textarea-default--focus)", "Input:textColor-Textarea-default--focus": "var(--xmlui-textColor-Textarea-default--focus)", "Input:outlineWidth-Textarea-default--focus": "var(--xmlui-outlineWidth-Textarea-default--focus)", "Input:outlineColor-Textarea-default--focus": "var(--xmlui-outlineColor-Textarea-default--focus)", "Input:outlineStyle-Textarea-default--focus": "var(--xmlui-outlineStyle-Textarea-default--focus)", "Input:outlineOffset-Textarea-default--focus": "var(--xmlui-outlineOffset-Textarea-default--focus)", "Input:color-placeholder-Textarea-default": "var(--xmlui-color-placeholder-Textarea-default)", "Input:borderRadius-Textarea-error": "var(--xmlui-borderRadius-Textarea-error)", "Input:borderColor-Textarea-error": "var(--xmlui-borderColor-Textarea-error)", "Input:borderWidth-Textarea-error": "var(--xmlui-borderWidth-Textarea-error)", "Input:borderStyle-Textarea-error": "var(--xmlui-borderStyle-Textarea-error)", "Input:fontSize-Textarea-error": "var(--xmlui-fontSize-Textarea-error)", "Input:padding-Textarea-error": "var(--xmlui-padding-Textarea-error)", "Input:backgroundColor-Textarea-error": "var(--xmlui-backgroundColor-Textarea-error)", "Input:boxShadow-Textarea-error": "var(--xmlui-boxShadow-Textarea-error)", "Input:textColor-Textarea-error": "var(--xmlui-textColor-Textarea-error)", "Input:borderColor-Textarea-error--hover": "var(--xmlui-borderColor-Textarea-error--hover)", "Input:backgroundColor-Textarea-error--hover": "var(--xmlui-backgroundColor-Textarea-error--hover)", "Input:boxShadow-Textarea-error--hover": "var(--xmlui-boxShadow-Textarea-error--hover)", "Input:textColor-Textarea-error--hover": "var(--xmlui-textColor-Textarea-error--hover)", "Input:borderColor-Textarea-error--focus": "var(--xmlui-borderColor-Textarea-error--focus)", "Input:backgroundColor-Textarea-error--focus": "var(--xmlui-backgroundColor-Textarea-error--focus)", "Input:boxShadow-Textarea-error--focus": "var(--xmlui-boxShadow-Textarea-error--focus)", "Input:textColor-Textarea-error--focus": "var(--xmlui-textColor-Textarea-error--focus)", "Input:outlineWidth-Textarea-error--focus": "var(--xmlui-outlineWidth-Textarea-error--focus)", "Input:outlineColor-Textarea-error--focus": "var(--xmlui-outlineColor-Textarea-error--focus)", "Input:outlineStyle-Textarea-error--focus": "var(--xmlui-outlineStyle-Textarea-error--focus)", "Input:outlineOffset-Textarea-error--focus": "var(--xmlui-outlineOffset-Textarea-error--focus)", "Input:color-placeholder-Textarea-error": "var(--xmlui-color-placeholder-Textarea-error)", "Input:borderRadius-Textarea-warning": "var(--xmlui-borderRadius-Textarea-warning)", "Input:borderColor-Textarea-warning": "var(--xmlui-borderColor-Textarea-warning)", "Input:borderWidth-Textarea-warning": "var(--xmlui-borderWidth-Textarea-warning)", "Input:borderStyle-Textarea-warning": "var(--xmlui-borderStyle-Textarea-warning)", "Input:fontSize-Textarea-warning": "var(--xmlui-fontSize-Textarea-warning)", "Input:padding-Textarea-warning": "var(--xmlui-padding-Textarea-warning)", "Input:backgroundColor-Textarea-warning": "var(--xmlui-backgroundColor-Textarea-warning)", "Input:boxShadow-Textarea-warning": "var(--xmlui-boxShadow-Textarea-warning)", "Input:textColor-Textarea-warning": "var(--xmlui-textColor-Textarea-warning)", "Input:borderColor-Textarea-warning--hover": "var(--xmlui-borderColor-Textarea-warning--hover)", "Input:backgroundColor-Textarea-warning--hover": "var(--xmlui-backgroundColor-Textarea-warning--hover)", "Input:boxShadow-Textarea-warning--hover": "var(--xmlui-boxShadow-Textarea-warning--hover)", "Input:textColor-Textarea-warning--hover": "var(--xmlui-textColor-Textarea-warning--hover)", "Input:borderColor-Textarea-warning--focus": "var(--xmlui-borderColor-Textarea-warning--focus)", "Input:backgroundColor-Textarea-warning--focus": "var(--xmlui-backgroundColor-Textarea-warning--focus)", "Input:boxShadow-Textarea-warning--focus": "var(--xmlui-boxShadow-Textarea-warning--focus)", "Input:textColor-Textarea-warning--focus": "var(--xmlui-textColor-Textarea-warning--focus)", "Input:outlineWidth-Textarea-warning--focus": "var(--xmlui-outlineWidth-Textarea-warning--focus)", "Input:outlineColor-Textarea-warning--focus": "var(--xmlui-outlineColor-Textarea-warning--focus)", "Input:outlineStyle-Textarea-warning--focus": "var(--xmlui-outlineStyle-Textarea-warning--focus)", "Input:outlineOffset-Textarea-warning--focus": "var(--xmlui-outlineOffset-Textarea-warning--focus)", "Input:color-placeholder-Textarea-warning": "var(--xmlui-color-placeholder-Textarea-warning)", "Input:borderRadius-Textarea-success": "var(--xmlui-borderRadius-Textarea-success)", "Input:borderColor-Textarea-success": "var(--xmlui-borderColor-Textarea-success)", "Input:borderWidth-Textarea-success": "var(--xmlui-borderWidth-Textarea-success)", "Input:borderStyle-Textarea-success": "var(--xmlui-borderStyle-Textarea-success)", "Input:fontSize-Textarea-success": "var(--xmlui-fontSize-Textarea-success)", "Input:padding-Textarea-success": "var(--xmlui-padding-Textarea-success)", "Input:backgroundColor-Textarea-success": "var(--xmlui-backgroundColor-Textarea-success)", "Input:boxShadow-Textarea-success": "var(--xmlui-boxShadow-Textarea-success)", "Input:textColor-Textarea-success": "var(--xmlui-textColor-Textarea-success)", "Input:borderColor-Textarea-success--hover": "var(--xmlui-borderColor-Textarea-success--hover)", "Input:backgroundColor-Textarea-success--hover": "var(--xmlui-backgroundColor-Textarea-success--hover)", "Input:boxShadow-Textarea-success--hover": "var(--xmlui-boxShadow-Textarea-success--hover)", "Input:textColor-Textarea-success--hover": "var(--xmlui-textColor-Textarea-success--hover)", "Input:borderColor-Textarea-success--focus": "var(--xmlui-borderColor-Textarea-success--focus)", "Input:backgroundColor-Textarea-success--focus": "var(--xmlui-backgroundColor-Textarea-success--focus)", "Input:boxShadow-Textarea-success--focus": "var(--xmlui-boxShadow-Textarea-success--focus)", "Input:textColor-Textarea-success--focus": "var(--xmlui-textColor-Textarea-success--focus)", "Input:outlineWidth-Textarea-success--focus": "var(--xmlui-outlineWidth-Textarea-success--focus)", "Input:outlineColor-Textarea-success--focus": "var(--xmlui-outlineColor-Textarea-success--focus)", "Input:outlineStyle-Textarea-success--focus": "var(--xmlui-outlineStyle-Textarea-success--focus)", "Input:outlineOffset-Textarea-success--focus": "var(--xmlui-outlineOffset-Textarea-success--focus)", "Input:color-placeholder-Textarea-success": "var(--xmlui-color-placeholder-Textarea-success)", "Input:backgroundColor-Textarea--disabled": "var(--xmlui-backgroundColor-Textarea--disabled)", "Input:textColor-Textarea--disabled": "var(--xmlui-textColor-Textarea--disabled)", "Input:borderColor-Textarea--disabled": "var(--xmlui-borderColor-Textarea--disabled)"}'`, pv = "_textarea_y6osp_13", hv = "_error_y6osp_53", xv = "_warning_y6osp_85", bv = "_valid_y6osp_117", vv = "_resizeHorizontal_y6osp_156", fv = "_resizeVertical_y6osp_160", gv = "_resizeBoth_y6osp_164", Xt = {
  themeVars: mv,
  textarea: pv,
  error: hv,
  warning: xv,
  valid: bv,
  resizeHorizontal: vv,
  resizeVertical: fv,
  resizeBoth: gv
}, tn = (e, t) => {
  if (typeof e == "function") {
    e(t);
    return;
  }
  e.current = t;
}, Tv = (e, t) => {
  const r = Pe.useRef();
  return Pe.useCallback(
    (o) => {
      e.current = o, r.current && tn(r.current, null), r.current = t, t && tn(t, o);
    },
    [t]
  );
}, yv = () => {
}, Cv = ({ maxRows: e, minRows: t, onChange: r = yv, style: o, ...a }, n) => {
  const i = he(null), l = Tv(i, n), [s, v] = Pe.useState(), [x, c] = Pe.useState();
  return ee(() => {
    if (!i.current) return;
    const T = getComputedStyle(i.current), b = parseFloat(T.lineHeight), f = parseFloat(T.paddingTop) + parseFloat(T.paddingBottom), y = parseFloat(T.borderTop) + parseFloat(T.borderBottom), w = (T.boxSizing === "border-box" ? y : 0) + f;
    v(b * (t ?? 1) + w), c(b * (e ?? 1e4) + w);
  }, [i.current, e, t]), /* @__PURE__ */ m(
    "textarea",
    {
      ref: l,
      ...a,
      onChange: r,
      style: { ...o, minHeight: s, maxHeight: x }
    }
  );
}, kv = Pe.forwardRef(Cv), Sv = {
  horizontal: Xt.resizeHorizontal,
  vertical: Xt.resizeVertical,
  both: Xt.resizeBoth
}, wv = ve(function({
  id: t,
  value: r = "",
  placeholder: o = "",
  required: a = !1,
  readOnly: n = !1,
  allowCopy: i = !0,
  updateState: l = de,
  validationStatus: s,
  autoFocus: v = !1,
  initialValue: x = "",
  resize: c,
  onDidChange: T = de,
  onFocus: b = de,
  onBlur: f = de,
  controlled: y = !0,
  enterSubmits: w = !0,
  escResets: _,
  style: H,
  registerComponentApi: I,
  autoSize: R,
  maxRows: F,
  minRows: Z,
  maxLength: V,
  rows: W = 2,
  enabled: N = !0,
  label: O,
  labelPosition: h,
  labelWidth: p,
  labelBreak: g
}, C) {
  const L = he(null), [q, z] = me(null), [A, B] = Ne.useState(!1), P = X(
    (ie) => {
      l({ value: ie }), T(ie);
    },
    [T, l]
  ), M = X(
    (ie) => {
      P(ie.target.value);
    },
    [P]
  );
  ee(() => {
    l({ value: x }, { initial: !0 });
  }, [x, l]);
  const E = (ie) => i ? !0 : (ie.preventDefault(), !1), G = () => {
    B(!0), b == null || b();
  }, Q = () => {
    B(!1), f == null || f();
  }, K = X(() => {
    setTimeout(() => {
      var ie;
      (ie = L.current) == null || ie.focus();
    }, 0);
  }, []), te = X(
    (ie) => {
      const oe = L == null ? void 0 : L.current;
      if (oe && ie) {
        const Y = oe.selectionStart, D = oe.value;
        M({
          // @ts-ignore
          target: {
            value: D.substring(0, Y) + ie + D.substring(Y)
          }
        }), z(Y + ie.length);
      }
    },
    [L, M]
  ), be = Le((ie) => {
    P(ie);
  });
  ee(() => {
    if (q) {
      const ie = L == null ? void 0 : L.current;
      ie && (ie.setSelectionRange(q, q), z(null));
    }
  }, [r, q, L]), ee(() => {
    I == null || I({
      focus: K,
      insert: te,
      setValue: be
    });
  }, [K, te, I, be]);
  const Me = X(
    (ie) => {
      var oe, Y;
      ie.currentTarget.form && w && ie.key.toLowerCase() === "enter" && !ie.shiftKey && (ie.preventDefault(), (oe = ie.currentTarget.form) == null || oe.requestSubmit()), ie.currentTarget.form && _ && ie.key.toLowerCase() === "escape" && !ie.shiftKey && (ie.preventDefault(), (Y = ie.currentTarget.form) == null || Y.reset());
    },
    [w, _]
  ), We = {
    className: le(Xt.textarea, c ? Sv[c] : "", {
      [Xt.focused]: A,
      [Xt.disabled]: !N,
      [Xt.error]: s === "error",
      [Xt.warning]: s === "warning",
      [Xt.valid]: s === "valid"
    }),
    ref: L,
    style: H,
    value: y ? r || "" : void 0,
    disabled: !N,
    autoFocus: v,
    name: t,
    placeholder: o,
    required: a,
    maxLength: V,
    "aria-multiline": !0,
    "aria-readonly": n,
    readOnly: n,
    onChange: M,
    onCopy: E,
    onFocus: G,
    onBlur: Q,
    onKeyDown: Me,
    autoComplete: "off"
  };
  return c === "both" || c === "horizontal" || c === "vertical" ? /* @__PURE__ */ m(
    yt,
    {
      ref: C,
      labelPosition: h,
      label: O,
      labelWidth: p,
      labelBreak: g,
      required: a,
      enabled: N,
      onFocus: b,
      onBlur: f,
      style: H,
      children: /* @__PURE__ */ m(
        kv,
        {
          ...We,
          style: H,
          maxRows: F,
          minRows: Z,
          rows: W
        }
      )
    }
  ) : R || !fi(F) || !fi(Z) ? /* @__PURE__ */ m(
    yt,
    {
      ref: C,
      labelPosition: h,
      label: O,
      labelWidth: p,
      labelBreak: g,
      required: a,
      enabled: N,
      onFocus: b,
      onBlur: f,
      style: H,
      children: /* @__PURE__ */ m(
        Hd,
        {
          ...We,
          style: H,
          maxRows: F,
          minRows: Z,
          rows: W
        }
      )
    }
  ) : /* @__PURE__ */ m(
    yt,
    {
      ref: C,
      labelPosition: h,
      label: O,
      labelWidth: p,
      labelBreak: g,
      required: a,
      enabled: N,
      onFocus: b,
      onBlur: f,
      style: H,
      children: /* @__PURE__ */ m("textarea", { ...We, rows: W })
    }
  );
}), Hv = `'{"border-AutoComplete": "var(--xmlui-border-AutoComplete)", "borderHorizontal-AutoComplete": "var(--xmlui-borderHorizontal-AutoComplete, var(--xmlui-border-AutoComplete))", "borderVertical-AutoComplete": "var(--xmlui-borderVertical-AutoComplete, var(--xmlui-border-AutoComplete))", "borderLeft-AutoComplete": "var(--xmlui-borderLeft-AutoComplete, var(--xmlui-borderHorizontal-AutoComplete, var(--xmlui-border-AutoComplete)))", "borderRight-AutoComplete": "var(--xmlui-borderRight-AutoComplete, var(--xmlui-borderHorizontal-AutoComplete, var(--xmlui-border-AutoComplete)))", "borderTop-AutoComplete": "var(--xmlui-borderTop-AutoComplete, var(--xmlui-borderVertical-AutoComplete, var(--xmlui-border-AutoComplete)))", "borderBottom-AutoComplete": "var(--xmlui-borderBottom-AutoComplete, var(--xmlui-borderVertical-AutoComplete, var(--xmlui-border-AutoComplete)))", "borderWidth-AutoComplete": "var(--xmlui-borderWidth-AutoComplete)", "borderHorizontalWidth-AutoComplete": "var(--xmlui-borderHorizontalWidth-AutoComplete, var(--xmlui-borderWidth-AutoComplete))", "borderLeftWidth-AutoComplete": "var(--xmlui-borderLeftWidth-AutoComplete, var(--xmlui-borderHorizontalWidth-AutoComplete, var(--xmlui-borderWidth-AutoComplete)))", "borderRightWidth-AutoComplete": "var(--xmlui-borderRightWidth-AutoComplete, var(--xmlui-borderHorizontalWidth-AutoComplete, var(--xmlui-borderWidth-AutoComplete)))", "borderVerticalWidth-AutoComplete": "var(--xmlui-borderVerticalWidth-AutoComplete, var(--xmlui-borderWidth-AutoComplete))", "borderTopWidth-AutoComplete": "var(--xmlui-borderTopWidth-AutoComplete, var(--xmlui-borderVerticalWidth-AutoComplete, var(--xmlui-borderWidth-AutoComplete)))", "borderBottomWidth-AutoComplete": "var(--xmlui-borderBottomWidth-AutoComplete, var(--xmlui-borderVerticalWidth-AutoComplete, var(--xmlui-borderWidth-AutoComplete)))", "borderStyle-AutoComplete": "var(--xmlui-borderStyle-AutoComplete)", "borderHorizontalStyle-AutoComplete": "var(--xmlui-borderHorizontalStyle-AutoComplete, var(--xmlui-borderStyle-AutoComplete))", "borderLeftStyle-AutoComplete": "var(--xmlui-borderLeftStyle-AutoComplete, var(--xmlui-borderHorizontalStyle-AutoComplete, var(--xmlui-borderStyle-AutoComplete)))", "borderRightStyle-AutoComplete": "var(--xmlui-borderRightStyle-AutoComplete, var(--xmlui-borderHorizontalStyle-AutoComplete, var(--xmlui-borderStyle-AutoComplete)))", "borderVerticalStyle-AutoComplete": "var(--xmlui-borderVerticalStyle-AutoComplete, var(--xmlui-borderStyle-AutoComplete))", "borderTopStyle-AutoComplete": "var(--xmlui-borderTopStyle-AutoComplete, var(--xmlui-borderVerticalStyle-AutoComplete, var(--xmlui-borderStyle-AutoComplete)))", "borderBottomStyle-AutoComplete": "var(--xmlui-borderBottomStyle-AutoComplete, var(--xmlui-borderVerticalStyle-AutoComplete, var(--xmlui-borderStyle-AutoComplete)))", "borderColor-AutoComplete": "var(--xmlui-borderColor-AutoComplete)", "borderHorizontalColor-AutoComplete": "var(--xmlui-borderHorizontalColor-AutoComplete, var(--xmlui-borderColor-AutoComplete))", "borderLeftColor-AutoComplete": "var(--xmlui-borderLeftColor-AutoComplete, var(--xmlui-borderHorizontalColor-AutoComplete, var(--xmlui-borderColor-AutoComplete)))", "borderRightColor-AutoComplete": "var(--xmlui-borderRightColor-AutoComplete, var(--xmlui-borderHorizontalColor-AutoComplete, var(--xmlui-borderColor-AutoComplete)))", "borderVerticalColor-AutoComplete": "var(--xmlui-borderVerticalColor-AutoComplete, var(--xmlui-borderColor-AutoComplete))", "borderTopColor-AutoComplete": "var(--xmlui-borderTopColor-AutoComplete, var(--xmlui-borderVerticalColor-AutoComplete, var(--xmlui-borderColor-AutoComplete)))", "borderBottomColor-AutoComplete": "var(--xmlui-borderBottomColor-AutoComplete, var(--xmlui-borderVerticalColor-AutoComplete, var(--xmlui-borderColor-AutoComplete)))", "radius-start-start-AutoComplete": "var(--xmlui-radius-start-start-AutoComplete, var(--xmlui-borderRadius-AutoComplete))", "radius-start-end-AutoComplete": "var(--xmlui-radius-start-end-AutoComplete, var(--xmlui-borderRadius-AutoComplete))", "radius-end-start-AutoComplete": "var(--xmlui-radius-end-start-AutoComplete, var(--xmlui-borderRadius-AutoComplete))", "radius-end-end-AutoComplete": "var(--xmlui-radius-end-end-AutoComplete, var(--xmlui-borderRadius-AutoComplete))", "padding-AutoComplete-badge": "var(--xmlui-padding-AutoComplete-badge)", "paddingHorizontal-AutoComplete-badge": "var(--xmlui-paddingHorizontal-AutoComplete-badge, var(--xmlui-padding-AutoComplete-badge))", "paddingVertical-AutoComplete-badge": "var(--xmlui-paddingVertical-AutoComplete-badge, var(--xmlui-padding-AutoComplete-badge))", "paddingLeft-AutoComplete-badge": "var(--xmlui-paddingLeft-AutoComplete-badge, var(--xmlui-paddingHorizontal-AutoComplete-badge, var(--xmlui-padding-AutoComplete-badge)))", "paddingRight-AutoComplete-badge": "var(--xmlui-paddingRight-AutoComplete-badge, var(--xmlui-paddingHorizontal-AutoComplete-badge, var(--xmlui-padding-AutoComplete-badge)))", "paddingTop-AutoComplete-badge": "var(--xmlui-paddingTop-AutoComplete-badge, var(--xmlui-paddingVertical-AutoComplete-badge, var(--xmlui-padding-AutoComplete-badge)))", "paddingBottom-AutoComplete-badge": "var(--xmlui-paddingBottom-AutoComplete-badge, var(--xmlui-paddingVertical-AutoComplete-badge, var(--xmlui-padding-AutoComplete-badge)))", "border-AutoComplete-badge": "var(--xmlui-border-AutoComplete-badge)", "borderHorizontal-AutoComplete-badge": "var(--xmlui-borderHorizontal-AutoComplete-badge, var(--xmlui-border-AutoComplete-badge))", "borderVertical-AutoComplete-badge": "var(--xmlui-borderVertical-AutoComplete-badge, var(--xmlui-border-AutoComplete-badge))", "borderLeft-AutoComplete-badge": "var(--xmlui-borderLeft-AutoComplete-badge, var(--xmlui-borderHorizontal-AutoComplete-badge, var(--xmlui-border-AutoComplete-badge)))", "borderRight-AutoComplete-badge": "var(--xmlui-borderRight-AutoComplete-badge, var(--xmlui-borderHorizontal-AutoComplete-badge, var(--xmlui-border-AutoComplete-badge)))", "borderTop-AutoComplete-badge": "var(--xmlui-borderTop-AutoComplete-badge, var(--xmlui-borderVertical-AutoComplete-badge, var(--xmlui-border-AutoComplete-badge)))", "borderBottom-AutoComplete-badge": "var(--xmlui-borderBottom-AutoComplete-badge, var(--xmlui-borderVertical-AutoComplete-badge, var(--xmlui-border-AutoComplete-badge)))", "borderWidth-AutoComplete-badge": "var(--xmlui-borderWidth-AutoComplete-badge)", "borderHorizontalWidth-AutoComplete-badge": "var(--xmlui-borderHorizontalWidth-AutoComplete-badge, var(--xmlui-borderWidth-AutoComplete-badge))", "borderLeftWidth-AutoComplete-badge": "var(--xmlui-borderLeftWidth-AutoComplete-badge, var(--xmlui-borderHorizontalWidth-AutoComplete-badge, var(--xmlui-borderWidth-AutoComplete-badge)))", "borderRightWidth-AutoComplete-badge": "var(--xmlui-borderRightWidth-AutoComplete-badge, var(--xmlui-borderHorizontalWidth-AutoComplete-badge, var(--xmlui-borderWidth-AutoComplete-badge)))", "borderVerticalWidth-AutoComplete-badge": "var(--xmlui-borderVerticalWidth-AutoComplete-badge, var(--xmlui-borderWidth-AutoComplete-badge))", "borderTopWidth-AutoComplete-badge": "var(--xmlui-borderTopWidth-AutoComplete-badge, var(--xmlui-borderVerticalWidth-AutoComplete-badge, var(--xmlui-borderWidth-AutoComplete-badge)))", "borderBottomWidth-AutoComplete-badge": "var(--xmlui-borderBottomWidth-AutoComplete-badge, var(--xmlui-borderVerticalWidth-AutoComplete-badge, var(--xmlui-borderWidth-AutoComplete-badge)))", "borderStyle-AutoComplete-badge": "var(--xmlui-borderStyle-AutoComplete-badge)", "borderHorizontalStyle-AutoComplete-badge": "var(--xmlui-borderHorizontalStyle-AutoComplete-badge, var(--xmlui-borderStyle-AutoComplete-badge))", "borderLeftStyle-AutoComplete-badge": "var(--xmlui-borderLeftStyle-AutoComplete-badge, var(--xmlui-borderHorizontalStyle-AutoComplete-badge, var(--xmlui-borderStyle-AutoComplete-badge)))", "borderRightStyle-AutoComplete-badge": "var(--xmlui-borderRightStyle-AutoComplete-badge, var(--xmlui-borderHorizontalStyle-AutoComplete-badge, var(--xmlui-borderStyle-AutoComplete-badge)))", "borderVerticalStyle-AutoComplete-badge": "var(--xmlui-borderVerticalStyle-AutoComplete-badge, var(--xmlui-borderStyle-AutoComplete-badge))", "borderTopStyle-AutoComplete-badge": "var(--xmlui-borderTopStyle-AutoComplete-badge, var(--xmlui-borderVerticalStyle-AutoComplete-badge, var(--xmlui-borderStyle-AutoComplete-badge)))", "borderBottomStyle-AutoComplete-badge": "var(--xmlui-borderBottomStyle-AutoComplete-badge, var(--xmlui-borderVerticalStyle-AutoComplete-badge, var(--xmlui-borderStyle-AutoComplete-badge)))", "borderColor-AutoComplete-badge": "var(--xmlui-borderColor-AutoComplete-badge)", "borderHorizontalColor-AutoComplete-badge": "var(--xmlui-borderHorizontalColor-AutoComplete-badge, var(--xmlui-borderColor-AutoComplete-badge))", "borderLeftColor-AutoComplete-badge": "var(--xmlui-borderLeftColor-AutoComplete-badge, var(--xmlui-borderHorizontalColor-AutoComplete-badge, var(--xmlui-borderColor-AutoComplete-badge)))", "borderRightColor-AutoComplete-badge": "var(--xmlui-borderRightColor-AutoComplete-badge, var(--xmlui-borderHorizontalColor-AutoComplete-badge, var(--xmlui-borderColor-AutoComplete-badge)))", "borderVerticalColor-AutoComplete-badge": "var(--xmlui-borderVerticalColor-AutoComplete-badge, var(--xmlui-borderColor-AutoComplete-badge))", "borderTopColor-AutoComplete-badge": "var(--xmlui-borderTopColor-AutoComplete-badge, var(--xmlui-borderVerticalColor-AutoComplete-badge, var(--xmlui-borderColor-AutoComplete-badge)))", "borderBottomColor-AutoComplete-badge": "var(--xmlui-borderBottomColor-AutoComplete-badge, var(--xmlui-borderVerticalColor-AutoComplete-badge, var(--xmlui-borderColor-AutoComplete-badge)))", "radius-start-start-AutoComplete-badge": "var(--xmlui-radius-start-start-AutoComplete-badge, var(--xmlui-borderRadius-AutoComplete-badge))", "radius-start-end-AutoComplete-badge": "var(--xmlui-radius-start-end-AutoComplete-badge, var(--xmlui-borderRadius-AutoComplete-badge))", "radius-end-start-AutoComplete-badge": "var(--xmlui-radius-end-start-AutoComplete-badge, var(--xmlui-borderRadius-AutoComplete-badge))", "radius-end-end-AutoComplete-badge": "var(--xmlui-radius-end-end-AutoComplete-badge, var(--xmlui-borderRadius-AutoComplete-badge))", "Input:borderRadius-AutoComplete-default": "var(--xmlui-borderRadius-AutoComplete-default)", "Input:borderColor-AutoComplete-default": "var(--xmlui-borderColor-AutoComplete-default)", "Input:borderWidth-AutoComplete-default": "var(--xmlui-borderWidth-AutoComplete-default)", "Input:borderStyle-AutoComplete-default": "var(--xmlui-borderStyle-AutoComplete-default)", "Input:fontSize-AutoComplete-default": "var(--xmlui-fontSize-AutoComplete-default)", "Input:backgroundColor-AutoComplete-default": "var(--xmlui-backgroundColor-AutoComplete-default)", "Input:boxShadow-AutoComplete-default": "var(--xmlui-boxShadow-AutoComplete-default)", "Input:textColor-AutoComplete-default": "var(--xmlui-textColor-AutoComplete-default)", "Input:borderColor-AutoComplete-default--hover": "var(--xmlui-borderColor-AutoComplete-default--hover)", "Input:backgroundColor-AutoComplete-default--hover": "var(--xmlui-backgroundColor-AutoComplete-default--hover)", "Input:boxShadow-AutoComplete-default--hover": "var(--xmlui-boxShadow-AutoComplete-default--hover)", "Input:textColor-AutoComplete-default--hover": "var(--xmlui-textColor-AutoComplete-default--hover)", "Input:textColor-placeholder-AutoComplete-default": "var(--xmlui-textColor-placeholder-AutoComplete-default)", "Input:borderRadius-AutoComplete-error": "var(--xmlui-borderRadius-AutoComplete-error)", "Input:borderColor-AutoComplete-error": "var(--xmlui-borderColor-AutoComplete-error)", "Input:borderWidth-AutoComplete-error": "var(--xmlui-borderWidth-AutoComplete-error)", "Input:borderStyle-AutoComplete-error": "var(--xmlui-borderStyle-AutoComplete-error)", "Input:fontSize-AutoComplete-error": "var(--xmlui-fontSize-AutoComplete-error)", "Input:backgroundColor-AutoComplete-error": "var(--xmlui-backgroundColor-AutoComplete-error)", "Input:boxShadow-AutoComplete-error": "var(--xmlui-boxShadow-AutoComplete-error)", "Input:textColor-AutoComplete-error": "var(--xmlui-textColor-AutoComplete-error)", "Input:borderColor-AutoComplete-error--hover": "var(--xmlui-borderColor-AutoComplete-error--hover)", "Input:backgroundColor-AutoComplete-error--hover": "var(--xmlui-backgroundColor-AutoComplete-error--hover)", "Input:boxShadow-AutoComplete-error--hover": "var(--xmlui-boxShadow-AutoComplete-error--hover)", "Input:textColor-AutoComplete-error--hover": "var(--xmlui-textColor-AutoComplete-error--hover)", "Input:textColor-placeholder-AutoComplete-error": "var(--xmlui-textColor-placeholder-AutoComplete-error)", "Input:borderRadius-AutoComplete-warning": "var(--xmlui-borderRadius-AutoComplete-warning)", "Input:borderColor-AutoComplete-warning": "var(--xmlui-borderColor-AutoComplete-warning)", "Input:borderWidth-AutoComplete-warning": "var(--xmlui-borderWidth-AutoComplete-warning)", "Input:borderStyle-AutoComplete-warning": "var(--xmlui-borderStyle-AutoComplete-warning)", "Input:fontSize-AutoComplete-warning": "var(--xmlui-fontSize-AutoComplete-warning)", "Input:backgroundColor-AutoComplete-warning": "var(--xmlui-backgroundColor-AutoComplete-warning)", "Input:boxShadow-AutoComplete-warning": "var(--xmlui-boxShadow-AutoComplete-warning)", "Input:textColor-AutoComplete-warning": "var(--xmlui-textColor-AutoComplete-warning)", "Input:borderColor-AutoComplete-warning--hover": "var(--xmlui-borderColor-AutoComplete-warning--hover)", "Input:backgroundColor-AutoComplete-warning--hover": "var(--xmlui-backgroundColor-AutoComplete-warning--hover)", "Input:boxShadow-AutoComplete-warning--hover": "var(--xmlui-boxShadow-AutoComplete-warning--hover)", "Input:textColor-AutoComplete-warning--hover": "var(--xmlui-textColor-AutoComplete-warning--hover)", "Input:textColor-placeholder-AutoComplete-warning": "var(--xmlui-textColor-placeholder-AutoComplete-warning)", "Input:borderRadius-AutoComplete-success": "var(--xmlui-borderRadius-AutoComplete-success)", "Input:borderColor-AutoComplete-success": "var(--xmlui-borderColor-AutoComplete-success)", "Input:borderWidth-AutoComplete-success": "var(--xmlui-borderWidth-AutoComplete-success)", "Input:borderStyle-AutoComplete-success": "var(--xmlui-borderStyle-AutoComplete-success)", "Input:fontSize-AutoComplete-success": "var(--xmlui-fontSize-AutoComplete-success)", "Input:backgroundColor-AutoComplete-success": "var(--xmlui-backgroundColor-AutoComplete-success)", "Input:boxShadow-AutoComplete-success": "var(--xmlui-boxShadow-AutoComplete-success)", "Input:textColor-AutoComplete-success": "var(--xmlui-textColor-AutoComplete-success)", "Input:borderColor-AutoComplete-success--hover": "var(--xmlui-borderColor-AutoComplete-success--hover)", "Input:backgroundColor-AutoComplete-success--hover": "var(--xmlui-backgroundColor-AutoComplete-success--hover)", "Input:boxShadow-AutoComplete-success--hover": "var(--xmlui-boxShadow-AutoComplete-success--hover)", "Input:textColor-AutoComplete-success--hover": "var(--xmlui-textColor-AutoComplete-success--hover)", "Input:textColor-placeholder-AutoComplete-success": "var(--xmlui-textColor-placeholder-AutoComplete-success)", "Input:backgroundColor-AutoComplete--disabled": "var(--xmlui-backgroundColor-AutoComplete--disabled)", "Input:textColor-AutoComplete--disabled": "var(--xmlui-textColor-AutoComplete--disabled)", "Input:borderColor-AutoComplete--disabled": "var(--xmlui-borderColor-AutoComplete--disabled)", "Input:outlineWidth-AutoComplete--focus": "var(--xmlui-outlineWidth-AutoComplete--focus)", "Input:outlineColor-AutoComplete--focus": "var(--xmlui-outlineColor-AutoComplete--focus)", "Input:outlineStyle-AutoComplete--focus": "var(--xmlui-outlineStyle-AutoComplete--focus)", "Input:outlineOffset-AutoComplete--focus": "var(--xmlui-outlineOffset-AutoComplete--focus)", "Input:fontSize-AutoComplete-badge": "var(--xmlui-fontSize-AutoComplete-badge)", "Input:backgroundColor-AutoComplete-badge": "var(--xmlui-backgroundColor-AutoComplete-badge)", "Input:textColor-AutoComplete-badge": "var(--xmlui-textColor-AutoComplete-badge)", "Input:backgroundColor-AutoComplete-badge--hover": "var(--xmlui-backgroundColor-AutoComplete-badge--hover)", "Input:textColor-AutoComplete-badge--hover": "var(--xmlui-textColor-AutoComplete-badge--hover)", "Input:backgroundColor-AutoComplete-badge--active": "var(--xmlui-backgroundColor-AutoComplete-badge--active)", "Input:textColor-AutoComplete-badge--active": "var(--xmlui-textColor-AutoComplete-badge--active)", "Input:textColor-placeholder-AutoComplete": "var(--xmlui-textColor-placeholder-AutoComplete)", "Input:backgroundColor-menu-AutoComplete": "var(--xmlui-backgroundColor-menu-AutoComplete)", "Input:borderRadius-menu-AutoComplete": "var(--xmlui-borderRadius-menu-AutoComplete)", "Input:boxShadow-menu-AutoComplete": "var(--xmlui-boxShadow-menu-AutoComplete)", "backgroundColor-item-AutoComplete": "var(--xmlui-backgroundColor-item-AutoComplete)", "backgroundColor-item-AutoComplete--hover": "var(--xmlui-backgroundColor-item-AutoComplete--hover)", "textColor-item-AutoComplete--disabled": "var(--xmlui-textColor-item-AutoComplete--disabled)"}'`, Bv = "_command_dpz2y_13", Iv = "_badgeListWrapper_dpz2y_20", $v = "_error_dpz2y_43", Lv = "_warning_dpz2y_62", _v = "_valid_dpz2y_81", Av = "_disabled_dpz2y_100", Nv = "_focused_dpz2y_107", Wv = "_badgeList_dpz2y_20", Ov = "_badge_dpz2y_20", Rv = "_commandInput_dpz2y_172", zv = "_actions_dpz2y_188", Vv = "_autoCompleteEmpty_dpz2y_194", Ev = "_commandList_dpz2y_204", Pv = "_autoCompleteOption_dpz2y_217", Je = {
  themeVars: Hv,
  command: Bv,
  badgeListWrapper: Iv,
  error: $v,
  warning: Lv,
  valid: _v,
  disabled: Av,
  focused: Nv,
  badgeList: Wv,
  badge: Ov,
  commandInput: Rv,
  actions: zv,
  autoCompleteEmpty: Vv,
  commandList: Ev,
  "fade-in": "_fade-in_dpz2y_1",
  autoCompleteOption: Pv
}, zl = Qt({
  value: null,
  onChange: (e) => {
  },
  optionRenderer: (e) => /* @__PURE__ */ m("div", { children: e.label }),
  inputValue: "",
  options: /* @__PURE__ */ new Set()
});
function Vl() {
  return Lt(zl);
}
function Dv(e) {
  return /* @__PURE__ */ m("div", { children: e.label });
}
function Mv(e, t) {
  return t.some(
    (r) => Array.from(e).some((o) => o.value === r.value || o.label === r.label)
  );
}
const Fv = ve(function({
  id: t,
  initialValue: r,
  value: o,
  enabled: a = !0,
  placeholder: n,
  updateState: i = de,
  validationStatus: l = "none",
  onDidChange: s = de,
  onFocus: v = de,
  onBlur: x = de,
  registerComponentApi: c,
  optionRenderer: T = Dv,
  emptyListTemplate: b,
  style: f,
  children: y,
  autoFocus: w = !1,
  dropdownHeight: _,
  multi: H = !1,
  label: I,
  labelPosition: R,
  labelWidth: F,
  labelBreak: Z,
  required: V = !1
}, W) {
  const [N, O] = me(null), h = he(null), [p, g] = me(!1), C = he(null), [L, q] = me(/* @__PURE__ */ new Set()), [z, A] = me(""), { root: B } = tr(), [P, M] = me(0), E = he();
  ee(() => {
    r !== void 0 && i({ value: r || [] }, { initial: !0 });
  }, [r, i]), ee(() => {
    var se;
    const D = N;
    return (se = E.current) == null || se.disconnect(), D && (E.current = new ResizeObserver(() => M(D.clientWidth)), E.current.observe(D)), () => {
      var _e;
      (_e = E.current) == null || _e.disconnect();
    };
  }, [N]);
  const G = X(
    (D) => {
      if (H ? A("") : g(!0), D === "") return;
      const se = H ? Array.isArray(o) ? o.includes(D) ? o.filter((_e) => _e !== D) : [...o, D] : [D] : D === o ? null : D;
      i({ value: se }), s(se);
    },
    [H, o, i, s]
  );
  ee(() => {
    var D;
    H || A(((D = Array.from(L).find((se) => se.value === o)) == null ? void 0 : D.labelText) || "");
  }, [H, L, o]);
  const Q = X(() => {
    const D = H ? [] : "";
    A(""), i({ value: D }), s(D);
  }, [H, i, s]), K = X((D) => {
    q((se) => new Set(se).add(D));
  }, []), te = X((D) => {
    q((se) => {
      const _e = new Set(se);
      return _e.delete(D), _e;
    });
  }, []), be = (D) => {
    C.current && !C.current.contains(D.target) && h.current && !h.current.contains(D.target) && (g(!1), h.current.blur());
  };
  ee(() => (p ? (document.addEventListener("mousedown", be), document.addEventListener("touchend", be)) : (document.removeEventListener("mousedown", be), document.removeEventListener("touchend", be)), () => {
    document.removeEventListener("mousedown", be), document.removeEventListener("touchend", be);
  }), [p]);
  const Me = ce(
    () => b ?? /* @__PURE__ */ J("div", { className: Je.autoCompleteEmpty, children: [
      /* @__PURE__ */ m(ke, { name: "noresult" }),
      /* @__PURE__ */ m("span", { children: "List is empty" })
    ] }),
    [b]
  ), We = X(() => {
    var D;
    (D = h == null ? void 0 : h.current) == null || D.focus();
  }, [h]), ie = Le((D) => {
    i({ value: Array.isArray(D) ? D : [D] });
  });
  ee(() => {
    c == null || c({
      focus: We,
      setValue: ie
    });
  }, [We, c, ie]);
  const oe = ce(
    () => ({
      onOptionAdd: K,
      onOptionRemove: te
    }),
    [K, te]
  ), Y = ce(() => ({
    multi: H,
    value: o,
    onChange: G,
    optionRenderer: T,
    options: L,
    inputValue: z
  }), [z, H, T, L, G, o]);
  return /* @__PURE__ */ m(zl.Provider, { value: Y, children: /* @__PURE__ */ m(la, { Component: Wl, children: /* @__PURE__ */ J(ni.Provider, { value: oe, children: [
    y,
    /* @__PURE__ */ m(
      yt,
      {
        ref: W,
        labelPosition: R,
        label: I,
        labelWidth: F,
        labelBreak: Z,
        required: V,
        enabled: a,
        onFocus: v,
        onBlur: x,
        style: f,
        children: /* @__PURE__ */ m(Wn, { open: p, children: /* @__PURE__ */ J(
          zn,
          {
            ref: C,
            className: Je.command,
            filter: (D, se, _e) => (D + " " + _e.join(" ")).toLowerCase().includes(se.toLowerCase()) ? 1 : 0,
            children: [
              /* @__PURE__ */ m(On, { style: { width: "100%" }, children: /* @__PURE__ */ J(
                "div",
                {
                  ref: O,
                  onClick: () => {
                    var D;
                    a && ((D = h == null ? void 0 : h.current) == null || D.focus());
                  },
                  style: f,
                  className: le(Je.badgeListWrapper, Je[l], {
                    [Je.disabled]: !a,
                    [Je.focused]: document.activeElement === h.current
                  }),
                  children: [
                    H ? /* @__PURE__ */ J("div", { className: Je.badgeList, children: [
                      Array.isArray(o) && o.map((D) => {
                        var se;
                        return /* @__PURE__ */ J("span", { className: Je.badge, children: [
                          (se = Array.from(L).find((_e) => _e.value === D)) == null ? void 0 : se.label,
                          /* @__PURE__ */ m(
                            ke,
                            {
                              name: "close",
                              size: "sm",
                              onClick: (_e) => {
                                _e.stopPropagation(), G(D);
                              }
                            }
                          )
                        ] }, D);
                      }),
                      /* @__PURE__ */ m(
                        _a,
                        {
                          id: t,
                          autoFocus: w,
                          ref: h,
                          value: z,
                          disabled: !a,
                          onValueChange: (D) => {
                            g(!0), A(D);
                          },
                          onFocus: () => {
                            g(!0), v();
                          },
                          onBlur: () => {
                            g(!1), x();
                          },
                          placeholder: n,
                          className: Je.commandInput
                        }
                      )
                    ] }) : /* @__PURE__ */ m(
                      _a,
                      {
                        id: t,
                        autoFocus: w,
                        ref: h,
                        value: z,
                        disabled: !a,
                        onValueChange: (D) => {
                          g(!0), A(D);
                        },
                        onFocus: () => {
                          g(!0), v();
                        },
                        onBlur: () => {
                          g(!1), x();
                        },
                        placeholder: n,
                        className: Je.commandInput
                      }
                    ),
                    /* @__PURE__ */ J("div", { className: Je.actions, children: [
                      (o == null ? void 0 : o.length) > 0 && a && /* @__PURE__ */ m(
                        "button",
                        {
                          onClick: (D) => {
                            D.stopPropagation(), Q();
                          },
                          children: /* @__PURE__ */ m(ke, { name: "close" })
                        }
                      ),
                      /* @__PURE__ */ m("button", { onClick: () => g(!0), children: /* @__PURE__ */ m(ke, { name: "chevrondown" }) })
                    ] })
                  ]
                }
              ) }),
              p && /* @__PURE__ */ m(Sd, { container: B, children: /* @__PURE__ */ m(
                Rn,
                {
                  asChild: !0,
                  style: { width: P, height: _ },
                  className: Je.popoverContent,
                  align: "start",
                  onOpenAutoFocus: (D) => D.preventDefault(),
                  children: /* @__PURE__ */ J(
                    Vn,
                    {
                      className: Je.commandList,
                      onMouseUp: () => {
                        var D;
                        (D = h == null ? void 0 : h.current) == null || D.focus();
                      },
                      style: { height: _ },
                      children: [
                        /* @__PURE__ */ m(En, { children: Me }),
                        /* @__PURE__ */ m(Uv, {}),
                        /* @__PURE__ */ m(wd, { children: Array.from(L).map(
                          ({ value: D, label: se, enabled: _e, keywords: kr, labelText: Qe }) => /* @__PURE__ */ m(
                            qv,
                            {
                              value: D,
                              label: se,
                              enabled: _e,
                              keywords: kr,
                              labelText: Qe
                            },
                            D
                          )
                        ) })
                      ]
                    }
                  )
                }
              ) })
            ]
          }
        ) })
      }
    )
  ] }) }) });
});
function Uv() {
  const { value: e, options: t, inputValue: r, onChange: o } = Vl(), { onOptionAdd: a } = li();
  if (Mv(t, [{ value: r, label: r }]) || Array.isArray(e) && (e != null && e.find((i) => i === r)) || r === e)
    return /* @__PURE__ */ m("span", { style: { display: "none" } });
  const n = /* @__PURE__ */ m(
    Xa,
    {
      value: r,
      className: Je.autoCompleteOption,
      onMouseDown: (i) => {
        i.preventDefault(), i.stopPropagation();
      },
      onSelect: (i) => {
        a({ value: i, label: i, enabled: !0, labelText: i }), o(i);
      },
      children: `Create "${r}"`
    }
  );
  return r.length > 0 ? n : /* @__PURE__ */ m("span", { style: { display: "none" } });
}
function qv({ value: e, label: t, enabled: r = !0, keywords: o }) {
  const a = po(), { value: n, onChange: i, optionRenderer: l, multi: s } = Vl(), v = s ? n == null ? void 0 : n.includes(e) : n === e;
  return /* @__PURE__ */ J(
    Xa,
    {
      id: a,
      disabled: !r,
      value: `${e}`,
      className: Je.autoCompleteOption,
      onMouseDown: (x) => {
        x.preventDefault(), x.stopPropagation();
      },
      onSelect: () => {
        i(e);
      },
      "data-state": v ? "checked" : void 0,
      keywords: o,
      children: [
        l({ label: t, value: e }),
        v && /* @__PURE__ */ m(ke, { name: "checkmark" })
      ]
    },
    a
  );
}
const Gv = `'{"Input:backgroundColor-track-Slider": "var(--xmlui-backgroundColor-track-Slider)", "Input:borderRadius-Slider-default": "var(--xmlui-borderRadius-Slider-default)", "Input:borderColor-Slider-default": "var(--xmlui-borderColor-Slider-default)", "Input:borderWidth-Slider-default": "var(--xmlui-borderWidth-Slider-default)", "Input:borderStyle-Slider-default": "var(--xmlui-borderStyle-Slider-default)", "Input:boxShadow-Slider-default": "var(--xmlui-boxShadow-Slider-default)", "Input:borderColor-Slider-default--hover": "var(--xmlui-borderColor-Slider-default--hover)", "Input:boxShadow-Slider-default--hover": "var(--xmlui-boxShadow-Slider-default--hover)", "Input:borderColor-Slider-default--focus": "var(--xmlui-borderColor-Slider-default--focus)", "Input:boxShadow-Slider-default--focus": "var(--xmlui-boxShadow-Slider-default--focus)", "Input:borderRadius-Slider-error": "var(--xmlui-borderRadius-Slider-error)", "Input:borderColor-Slider-error": "var(--xmlui-borderColor-Slider-error)", "Input:borderWidth-Slider-error": "var(--xmlui-borderWidth-Slider-error)", "Input:borderStyle-Slider-error": "var(--xmlui-borderStyle-Slider-error)", "Input:boxShadow-Slider-error": "var(--xmlui-boxShadow-Slider-error)", "Input:borderColor-Slider-error--hover": "var(--xmlui-borderColor-Slider-error--hover)", "Input:boxShadow-Slider-error--hover": "var(--xmlui-boxShadow-Slider-error--hover)", "Input:borderColor-Slider-error--focus": "var(--xmlui-borderColor-Slider-error--focus)", "Input:boxShadow-Slider-error--focus": "var(--xmlui-boxShadow-Slider-error--focus)", "Input:borderRadius-Slider-warning": "var(--xmlui-borderRadius-Slider-warning)", "Input:borderColor-Slider-warning": "var(--xmlui-borderColor-Slider-warning)", "Input:borderWidth-Slider-warning": "var(--xmlui-borderWidth-Slider-warning)", "Input:borderStyle-Slider-warning": "var(--xmlui-borderStyle-Slider-warning)", "Input:boxShadow-Slider-warning": "var(--xmlui-boxShadow-Slider-warning)", "Input:borderColor-Slider-warning--hover": "var(--xmlui-borderColor-Slider-warning--hover)", "Input:boxShadow-Slider-warning--hover": "var(--xmlui-boxShadow-Slider-warning--hover)", "Input:borderColor-Slider-warning--focus": "var(--xmlui-borderColor-Slider-warning--focus)", "Input:boxShadow-Slider-warning--focus": "var(--xmlui-boxShadow-Slider-warning--focus)", "Input:borderRadius-Slider-success": "var(--xmlui-borderRadius-Slider-success)", "Input:borderColor-Slider-success": "var(--xmlui-borderColor-Slider-success)", "Input:borderWidth-Slider-success": "var(--xmlui-borderWidth-Slider-success)", "Input:borderStyle-Slider-success": "var(--xmlui-borderStyle-Slider-success)", "Input:boxShadow-Slider-success": "var(--xmlui-boxShadow-Slider-success)", "Input:borderColor-Slider-success--hover": "var(--xmlui-borderColor-Slider-success--hover)", "Input:boxShadow-Slider-success--hover": "var(--xmlui-boxShadow-Slider-success--hover)", "Input:borderColor-Slider-success--focus": "var(--xmlui-borderColor-Slider-success--focus)", "Input:boxShadow-Slider-success--focus": "var(--xmlui-boxShadow-Slider-success--focus)", "Input:backgroundColor-track-Slider--disabled": "var(--xmlui-backgroundColor-track-Slider--disabled)", "Input:backgroundColor-range-Slider": "var(--xmlui-backgroundColor-range-Slider)", "Input:backgroundColor-range-Slider--disabled": "var(--xmlui-backgroundColor-range-Slider--disabled)", "Input:borderWidth-thumb-Slider": "var(--xmlui-borderWidth-thumb-Slider)", "Input:borderStyle-thumb-Slider": "var(--xmlui-borderStyle-thumb-Slider)", "Input:borderColor-thumb-Slider": "var(--xmlui-borderColor-thumb-Slider)", "Input:backgroundColor-thumb-Slider": "var(--xmlui-backgroundColor-thumb-Slider)", "Input:boxShadow-thumb-Slider": "var(--xmlui-boxShadow-thumb-Slider)"}'`, Yv = "_sliderRoot_1irri_13", Xv = "_sliderTrack_1irri_22", jv = "_error_1irri_43", Qv = "_warning_1irri_58", Zv = "_valid_1irri_73", Jv = "_sliderRange_1irri_92", Kv = "_sliderThumb_1irri_101", Ut = {
  themeVars: Gv,
  sliderRoot: Yv,
  sliderTrack: Xv,
  error: jv,
  warning: Qv,
  valid: Zv,
  sliderRange: Jv,
  sliderThumb: Kv
}, El = ve(
  ({
    style: e,
    step: t = 1,
    min: r,
    max: o,
    inverted: a,
    updateState: n,
    onDidChange: i = de,
    onFocus: l = de,
    onBlur: s = de,
    registerComponentApi: v,
    enabled: x = !0,
    value: c,
    autoFocus: T,
    readOnly: b,
    tabIndex: f = -1,
    label: y,
    labelPosition: w,
    labelWidth: _,
    labelBreak: H,
    required: I,
    validationStatus: R = "none",
    initialValue: F,
    minStepsBetweenThumbs: Z,
    rangeStyle: V,
    thumbStyle: W
  }, N) => {
    const O = he(null), [h, p] = Ne.useState([]);
    ee(() => {
      typeof c == "object" ? p(c) : typeof c == "number" && p([c]);
    }, [c]), ee(() => {
      n({ value: F }, { initial: !0 });
    }, [F, n]);
    const g = X(
      (B) => {
        n({ value: B }), i(B);
      },
      [i, n]
    ), C = X(
      (B) => {
        B.length > 1 ? g(B) : B.length === 1 && g(B[0]);
      },
      [g]
    ), L = X(() => {
      l == null || l();
    }, [l]), q = X(() => {
      s == null || s();
    }, [s]), z = X(() => {
      var B;
      (B = O.current) == null || B.focus();
    }, []), A = Le((B) => {
      g(B);
    });
    return ee(() => {
      v == null || v({
        focus: z,
        setValue: A
      });
    }, [z, v, A]), /* @__PURE__ */ m(
      yt,
      {
        labelPosition: w,
        label: y,
        labelWidth: _,
        labelBreak: H,
        required: I,
        enabled: x,
        onFocus: l,
        onBlur: s,
        style: e,
        ref: N,
        children: /* @__PURE__ */ J(
          Pn,
          {
            minStepsBetweenThumbs: Z,
            ref: O,
            tabIndex: f,
            "aria-readonly": b,
            className: le(Ut.sliderRoot),
            style: e,
            max: o,
            min: r,
            inverted: a,
            step: t,
            disabled: !x,
            onFocus: L,
            onBlur: q,
            onValueChange: C,
            "aria-required": I,
            value: h,
            autoFocus: T,
            children: [
              /* @__PURE__ */ m(
                Bd,
                {
                  className: le(Ut.sliderTrack, {
                    [Ut.disabled]: !x,
                    [Ut.readOnly]: b,
                    [Ut.error]: R === "error",
                    [Ut.warning]: R === "warning",
                    [Ut.valid]: R === "valid"
                  }),
                  children: /* @__PURE__ */ m(Id, { className: Ut.sliderRange, style: V })
                }
              ),
              h == null ? void 0 : h.map((B, P) => /* @__PURE__ */ m($d, { className: Ut.sliderThumb, style: W }, P))
            ]
          }
        )
      }
    );
  }
);
El.displayName = Pn.displayName;
const ef = `'{"Input:backgroundColor-ColorPicker": "var(--xmlui-backgroundColor-ColorPicker)", "Input:borderRadius-ColorPicker-default": "var(--xmlui-borderRadius-ColorPicker-default)", "Input:borderColor-ColorPicker-default": "var(--xmlui-borderColor-ColorPicker-default)", "Input:borderWidth-ColorPicker-default": "var(--xmlui-borderWidth-ColorPicker-default)", "Input:borderStyle-ColorPicker-default": "var(--xmlui-borderStyle-ColorPicker-default)", "Input:boxShadow-ColorPicker-default": "var(--xmlui-boxShadow-ColorPicker-default)", "Input:borderColor-ColorPicker-default--hover": "var(--xmlui-borderColor-ColorPicker-default--hover)", "Input:boxShadow-ColorPicker-default--hover": "var(--xmlui-boxShadow-ColorPicker-default--hover)", "Input:borderColor-ColorPicker-default--focus": "var(--xmlui-borderColor-ColorPicker-default--focus)", "Input:boxShadow-ColorPicker-default--focus": "var(--xmlui-boxShadow-ColorPicker-default--focus)", "Input:borderRadius-ColorPicker-error": "var(--xmlui-borderRadius-ColorPicker-error)", "Input:borderColor-ColorPicker-error": "var(--xmlui-borderColor-ColorPicker-error)", "Input:borderWidth-ColorPicker-error": "var(--xmlui-borderWidth-ColorPicker-error)", "Input:borderStyle-ColorPicker-error": "var(--xmlui-borderStyle-ColorPicker-error)", "Input:boxShadow-ColorPicker-error": "var(--xmlui-boxShadow-ColorPicker-error)", "Input:borderColor-ColorPicker-error--hover": "var(--xmlui-borderColor-ColorPicker-error--hover)", "Input:boxShadow-ColorPicker-error--hover": "var(--xmlui-boxShadow-ColorPicker-error--hover)", "Input:borderColor-ColorPicker-error--focus": "var(--xmlui-borderColor-ColorPicker-error--focus)", "Input:boxShadow-ColorPicker-error--focus": "var(--xmlui-boxShadow-ColorPicker-error--focus)", "Input:borderRadius-ColorPicker-warning": "var(--xmlui-borderRadius-ColorPicker-warning)", "Input:borderColor-ColorPicker-warning": "var(--xmlui-borderColor-ColorPicker-warning)", "Input:borderWidth-ColorPicker-warning": "var(--xmlui-borderWidth-ColorPicker-warning)", "Input:borderStyle-ColorPicker-warning": "var(--xmlui-borderStyle-ColorPicker-warning)", "Input:boxShadow-ColorPicker-warning": "var(--xmlui-boxShadow-ColorPicker-warning)", "Input:borderColor-ColorPicker-warning--hover": "var(--xmlui-borderColor-ColorPicker-warning--hover)", "Input:boxShadow-ColorPicker-warning--hover": "var(--xmlui-boxShadow-ColorPicker-warning--hover)", "Input:borderColor-ColorPicker-warning--focus": "var(--xmlui-borderColor-ColorPicker-warning--focus)", "Input:boxShadow-ColorPicker-warning--focus": "var(--xmlui-boxShadow-ColorPicker-warning--focus)", "Input:borderRadius-ColorPicker-success": "var(--xmlui-borderRadius-ColorPicker-success)", "Input:borderColor-ColorPicker-success": "var(--xmlui-borderColor-ColorPicker-success)", "Input:borderWidth-ColorPicker-success": "var(--xmlui-borderWidth-ColorPicker-success)", "Input:borderStyle-ColorPicker-success": "var(--xmlui-borderStyle-ColorPicker-success)", "Input:boxShadow-ColorPicker-success": "var(--xmlui-boxShadow-ColorPicker-success)", "Input:borderColor-ColorPicker-success--hover": "var(--xmlui-borderColor-ColorPicker-success--hover)", "Input:boxShadow-ColorPicker-success--hover": "var(--xmlui-boxShadow-ColorPicker-success--hover)", "Input:borderColor-ColorPicker-success--focus": "var(--xmlui-borderColor-ColorPicker-success--focus)", "Input:boxShadow-ColorPicker-success--focus": "var(--xmlui-boxShadow-ColorPicker-success--focus)"}'`, tf = "_colorInput_ays9f_13", rf = "_error_ays9f_41", of = "_warning_ays9f_56", af = "_valid_ays9f_71", oo = {
  themeVars: ef,
  colorInput: tf,
  error: rf,
  warning: of,
  valid: af
}, Ho = {
  initialValue: "",
  value: "",
  enabled: !0,
  validationStatus: "none"
}, Pl = ve(
  ({
    style: e,
    updateState: t,
    onDidChange: r = de,
    onFocus: o = de,
    onBlur: a = de,
    registerComponentApi: n,
    enabled: i = Ho.enabled,
    value: l = Ho.value,
    autoFocus: s,
    tabIndex: v = -1,
    label: x,
    labelPosition: c,
    labelWidth: T,
    labelBreak: b,
    required: f,
    validationStatus: y = Ho.validationStatus,
    initialValue: w = Ho.initialValue
  }, _) => {
    const H = he(null), I = X(
      (N) => {
        t({ value: N }), r(N);
      },
      [r, t]
    ), R = X(
      (N) => {
        I(N.target.value);
      },
      [I]
    );
    ee(() => {
      t({ value: w }, { initial: !0 });
    }, [w, t]);
    const F = X(() => {
      o == null || o();
    }, [o]), Z = X(() => {
      a == null || a();
    }, [a]), V = X(() => {
      var N;
      (N = H.current) == null || N.focus();
    }, []), W = Le((N) => {
      I(N);
    });
    return ee(() => {
      n == null || n({
        focus: V,
        setValue: W
      });
    }, [V, n, W]), /* @__PURE__ */ m(
      yt,
      {
        labelPosition: c,
        label: x,
        labelWidth: T,
        labelBreak: b,
        required: f,
        enabled: i,
        onFocus: o,
        onBlur: a,
        style: e,
        ref: _,
        children: /* @__PURE__ */ m(
          "input",
          {
            className: le(oo.colorInput, {
              [oo.disabled]: !i,
              [oo.error]: y === "error",
              [oo.warning]: y === "warning",
              [oo.valid]: y === "valid"
            }),
            disabled: !i,
            onFocus: F,
            onChange: R,
            autoFocus: s,
            onBlur: Z,
            required: f,
            type: "color",
            inputMode: "text",
            ref: H,
            value: l,
            tabIndex: v
          }
        )
      }
    );
  }
);
Pl.displayName = "ColorPicker";
const nf = "_helper_1qbfk_13", lf = "_helperText_1qbfk_24", df = "_valid_1qbfk_29", sf = "_error_1qbfk_34", uf = "_warning_1qbfk_39", yo = {
  helper: nf,
  helperText: lf,
  valid: df,
  error: sf,
  warning: uf
};
var Dl = {
  color: void 0,
  size: void 0,
  className: void 0,
  style: void 0,
  attr: void 0
}, rn = Ne.createContext && Ne.createContext(Dl), Cr = function() {
  return Cr = Object.assign || function(e) {
    for (var t, r = 1, o = arguments.length; r < o; r++) {
      t = arguments[r];
      for (var a in t) Object.prototype.hasOwnProperty.call(t, a) && (e[a] = t[a]);
    }
    return e;
  }, Cr.apply(this, arguments);
}, cf = function(e, t) {
  var r = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (r[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var a = 0, o = Object.getOwnPropertySymbols(e); a < o.length; a++)
    t.indexOf(o[a]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[a]) && (r[o[a]] = e[o[a]]);
  return r;
};
function Ml(e) {
  return e && e.map(function(t, r) {
    return Ne.createElement(t.tag, Cr({
      key: r
    }, t.attr), Ml(t.child));
  });
}
function xo(e) {
  return function(t) {
    return Ne.createElement(mf, Cr({
      attr: Cr({}, e.attr)
    }, t), Ml(e.child));
  };
}
function mf(e) {
  var t = function(r) {
    var o = e.attr, a = e.size, n = e.title, i = cf(e, ["attr", "size", "title"]), l = a || r.size || "1em", s;
    return r.className && (s = r.className), e.className && (s = (s ? s + " " : "") + e.className), Ne.createElement("svg", Cr({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, r.attr, o, i, {
      className: s,
      style: Cr(Cr({
        color: e.color || r.color
      }, r.style), e.style),
      height: l,
      width: l,
      xmlns: "http://www.w3.org/2000/svg"
    }), n && Ne.createElement("title", null, n), e.children);
  };
  return rn !== void 0 ? Ne.createElement(rn.Consumer, null, function(r) {
    return t(r);
  }) : t(Dl);
}
function pf(e) {
  return xo({ attr: { viewBox: "0 0 1024 1024" }, child: [{ tag: "path", attr: { d: "M464 720a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm16-304v184c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V416c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8zm475.7 440l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zm-783.5-27.9L512 239.9l339.8 588.2H172.2z" } }] })(e);
}
const hf = (e) => /* @__PURE__ */ m(pf, { ...e });
function xf(e) {
  return xo({ attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.493 2 11.953 2zM12 20c-4.411 0-8-3.589-8-8s3.567-8 7.953-8C16.391 4 20 7.589 20 12s-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M11 7h2v7h-2zm0 8h2v2h-2z" } }] })(e);
}
const bf = (e) => /* @__PURE__ */ m(xf, { ...e }), on = ({ text: e = "", status: t, style: r }) => {
  const o = () => {
    if (t === "warning")
      return /* @__PURE__ */ m(hf, { color: "var(--xmlui-color-warning)" });
    if (t === "error")
      return /* @__PURE__ */ m(bf, { color: "var(--xmlui-color-error)" });
  };
  return /* @__PURE__ */ J(
    "div",
    {
      style: r,
      className: le(yo.helper, {
        [yo.valid]: t === "valid",
        [yo.warning]: t === "warning",
        [yo.error]: t === "error"
      }),
      children: [
        t && /* @__PURE__ */ m("div", { style: { flexShrink: 0 }, children: o() }),
        e && /* @__PURE__ */ m("div", { className: yo.helperText, children: e })
      ]
    }
  );
}, vf = {
  checkbox: "end"
}, Wr = {
  type: "text",
  labelBreak: !0,
  enabled: !0,
  customValidationsDebounce: 0
};
$n(function({
  style: t,
  bindTo: r,
  type: o = Wr.type,
  label: a,
  enabled: n = Wr.enabled,
  labelPosition: i,
  labelWidth: l,
  labelBreak: s = Wr.labelBreak,
  children: v,
  validations: x,
  onValidate: c,
  customValidationsDebounce: T = Wr.customValidationsDebounce,
  validationMode: b,
  registerComponentApi: f,
  maxTextLength: y,
  inputRenderer: w,
  ..._
}) {
  const H = nr((B) => l || B.itemLabelWidth), I = nr(
    (B) => s !== void 0 ? s : B.itemLabelBreak
  ), R = nr(
    (B) => i || B.itemLabelPosition || vf[o]
  ), F = nr(
    (B) => Mi(B.originalSubject, r)
  ), Z = F === void 0 ? _.initialValue : F, V = nr((B) => Mi(B.subject, r)), W = nr((B) => B.validationResults[r]), N = nr((B) => B.dispatch), O = nr((B) => B.enabled), h = n && O;
  ee(() => {
    N(Hh(r, Z));
  }, [r, N, Z]), Cx(x, c, V, N, r, T);
  const p = X(
    ({ value: B }, P) => {
      P != null && P.initial || N(Bh(r, B));
    },
    [r, N]
  );
  ee(() => () => {
    N(Lh(r));
  }, [r, N]);
  const { validationStatus: g, isHelperTextShown: C } = kx(
    r,
    V,
    W,
    b
  );
  let L = null;
  switch (o) {
    case "select": {
      L = /* @__PURE__ */ m(
        Qb,
        {
          ..._,
          value: V,
          updateState: p,
          registerComponentApi: f,
          enabled: h,
          validationStatus: g,
          children: v
        }
      );
      break;
    }
    case "autocomplete": {
      L = /* @__PURE__ */ m(
        Fv,
        {
          ..._,
          value: V,
          updateState: p,
          registerComponentApi: f,
          enabled: h,
          validationStatus: g,
          children: v
        }
      );
      break;
    }
    case "datePicker": {
      L = /* @__PURE__ */ m(
        $p,
        {
          ..._,
          value: V,
          updateState: p,
          enabled: h,
          validationStatus: g
        }
      );
      break;
    }
    case "radioGroup": {
      L = /* @__PURE__ */ m(
        uv,
        {
          ..._,
          value: V,
          updateState: p,
          enabled: h,
          validationStatus: g,
          children: v
        }
      );
      break;
    }
    case "number":
    case "integer": {
      L = /* @__PURE__ */ m(
        eb,
        {
          ..._,
          value: V,
          updateState: p,
          registerComponentApi: f,
          enabled: h,
          integersOnly: o === "integer",
          validationStatus: g,
          min: x.minValue,
          max: x.maxValue,
          maxLength: y ?? (x == null ? void 0 : x.maxLength)
        }
      );
      break;
    }
    case "switch":
    case "checkbox": {
      L = /* @__PURE__ */ m(
        Ea,
        {
          ..._,
          value: V,
          updateState: p,
          enabled: h,
          validationStatus: g,
          variant: o,
          inputRenderer: w
        }
      );
      break;
    }
    case "file": {
      L = /* @__PURE__ */ m(
        Zp,
        {
          ..._,
          value: V,
          updateState: p,
          registerComponentApi: f,
          enabled: h,
          validationStatus: g,
          multiple: Rx(_.multiple, !1)
        }
      );
      break;
    }
    case "text": {
      L = /* @__PURE__ */ m(
        Ra,
        {
          ..._,
          value: V,
          updateState: p,
          registerComponentApi: f,
          enabled: h,
          validationStatus: g,
          maxLength: y ?? (x == null ? void 0 : x.maxLength)
        }
      );
      break;
    }
    case "password": {
      L = /* @__PURE__ */ m(
        Ra,
        {
          ..._,
          type: "password",
          value: V,
          updateState: p,
          registerComponentApi: f,
          enabled: h,
          validationStatus: g,
          maxLength: y ?? (x == null ? void 0 : x.maxLength)
        }
      );
      break;
    }
    case "textarea": {
      L = /* @__PURE__ */ m(
        wv,
        {
          ..._,
          value: V,
          updateState: p,
          registerComponentApi: f,
          enabled: h,
          validationStatus: g,
          maxLength: y ?? (x == null ? void 0 : x.maxLength)
        }
      );
      break;
    }
    case "slider": {
      L = /* @__PURE__ */ m(
        El,
        {
          ..._,
          value: V,
          updateState: p,
          registerComponentApi: f,
          enabled: h,
          validationStatus: g,
          min: x.minValue,
          max: x.maxValue
        }
      );
      break;
    }
    case "colorpicker": {
      L = /* @__PURE__ */ m(
        Pl,
        {
          ..._,
          value: V,
          updateState: p,
          registerComponentApi: f,
          enabled: h,
          validationStatus: g
        }
      );
      break;
    }
    case "custom": {
      L = v;
      break;
    }
    default: {
      console.warn(`unknown form item type ${o}`), L = /* @__PURE__ */ m("div", { children: V });
      break;
    }
  }
  const q = Le(() => {
    N(Ih(r));
  }), z = Le(() => {
    N($h(r));
  }), [A] = ii({ duration: 100 });
  return /* @__PURE__ */ m(
    yt,
    {
      labelPosition: R,
      label: a,
      labelWidth: H,
      labelBreak: I,
      enabled: h,
      required: x.required,
      validationInProgress: W == null ? void 0 : W.partial,
      onFocus: q,
      onBlur: z,
      style: t,
      validationResult: /* @__PURE__ */ m("div", { ref: A, children: C && (W == null ? void 0 : W.validations.map((B, P) => /* @__PURE__ */ J(In, { children: [
        B.isValid && !!B.validMessage && /* @__PURE__ */ m(
          on,
          {
            text: B.validMessage,
            status: "valid",
            style: { opacity: B.stale ? 0.5 : void 0 }
          }
        ),
        !B.isValid && !!B.invalidMessage && /* @__PURE__ */ m(
          on,
          {
            text: B.invalidMessage,
            status: B.severity,
            style: { opacity: B.stale ? 0.5 : void 0 }
          }
        )
      ] }, P))) }),
      children: L
    }
  );
});
const Xr = "FormItem", Po = vx.filter(
  (e) => e !== "none"
), ff = k({
  status: "experimental",
  description: `A \`${Xr}\` component represents a single input element within a \`Form\`. The value within the \`${Xr}\` may be associated with a particular property within the encapsulating \`Form\` component's data.`,
  props: {
    bindTo: {
      description: "This property binds a particular input field to one of the attributes of the `Form` data. It names the property of the form's `data` data to get the input's initial value.When the field is saved, its value will be stored in the `data` property with this name."
    },
    autoFocus: rt(),
    label: qe(),
    labelPosition: Dt(),
    labelWidth: u("This property sets the width of the item label."),
    labelBreak: {
      description: "This boolean value indicates if the label can be split into multiple lines if it would overflow the available label width.",
      type: "boolean",
      defaultValue: Wr.labelBreak
    },
    enabled: Ze(),
    type: {
      description: "This property is used to determine the specific input control the FormItem will wrap around. Note that the control names start with a lowercase letter and map to input components found in XMLUI.",
      availableValues: gx,
      defaultValue: Wr.type,
      valueType: "string"
    },
    customValidationsDebounce: {
      description: "This optional number prop determines the time interval between two runs of a custom validation.",
      type: "number",
      defaultValue: Wr.customValidationsDebounce
    },
    validationMode: {
      description: "This property sets what kind of validation mode or strategy to employ for a particular input field.",
      availableValues: fx,
      defaultValue: gl
    },
    initialValue: St(),
    required: Nt(),
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
      availableValues: Po,
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
      availableValues: Po,
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
      availableValues: Po,
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
      availableValues: Po,
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
      `The context variable represents the current value of the \`${Xr}\`. It can be used in expressions and code snippets within the \`${Xr}\` instance.`
    ),
    $setValue: u(
      `This function can be invoked to set the \`${Xr}\` instance's value. The function has a single argument, the new value to set.`
    ),
    $validationResult: u(
      `This variable represents the result of the latest validation of the \`${Xr}\` instance.`
    )
  },
  themeVars: j(It.themeVars),
  defaultThemeVars: {
    "textColor-FormItemLabel": "$textColor-primary",
    "fontSize-FormItemLabel": "$fontSize-small",
    "fontWeight-FormItemLabel": "$fontWeight-medium",
    "font-style-FormItemLabel": "normal",
    "textTransform-FormItemLabel": "none",
    "textColor-FormItemLabel-requiredMark": "$color-danger-400"
  }
}), Pt = "Heading", Dr = u(
  `This property determines the text displayed in the heading. \`${Pt}\` also accepts nested text instead of specifying the \`value\`. If both \`value\` and a nested text are used, the \`value\` will be displayed.`
), Mr = u(
  "This property determines the maximum number of lines the component can wrap to. If there is not enough space for all of the text, the component wraps the text up to as many lines as specified."
), gf = {
  description: "This property indicates whether ellipses should be displayed (`true`) when the heading text is cropped or not (`false`).",
  type: "boolean",
  defaultValue: oi.ellipses
}, Tf = u(
  "This property indicates whether linebreaks should be preserved when displaying text."
), bo = (e) => `Represents a heading level ${e} text`, Fr = {
  description: "If true, this heading will be excluded from the table of contents.",
  type: "boolean",
  defaultValue: oi.omitFromToc
}, yf = k({
  description: "Represents a heading text",
  props: {
    value: Dr,
    level: {
      description: "This property sets the visual significance (level) of the heading.",
      availableValues: ["h1", "h2", "h3", "h4", "h5", "h6"],
      defaultValue: oi.level
    },
    maxLines: Mr,
    ellipses: gf,
    preserveLinebreaks: Tf,
    omitFromToc: Fr
  },
  themeVars: j($t.themeVars),
  defaultThemeVars: {
    [`fontFamily-${Pt}`]: "$fontFamily",
    [`textColor-${Pt}`]: "inherit",
    [`fontWeight-${Pt}`]: "$fontWeight-bold",
    [`letterSpacing-${Pt} `]: "0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), fa = "H1", Cf = k({
  description: bo(1),
  specializedFrom: Pt,
  props: {
    value: Dr,
    maxLines: Mr,
    omitFromToc: Fr
  },
  themeVars: j($t.themeVars),
  defaultThemeVars: {
    [`fontSize-${fa}`]: "$fontSize-large",
    [`marginTop-${fa}`]: "0",
    [`marginBottom-${fa}`]: "0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), ga = "H2", kf = k({
  description: bo(2),
  specializedFrom: Pt,
  props: {
    value: Dr,
    maxLines: Mr,
    omitFromToc: Fr
  },
  themeVars: j($t.themeVars),
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
}), Ta = "H3", Sf = k({
  description: bo(3),
  specializedFrom: Pt,
  props: {
    value: Dr,
    maxLines: Mr,
    omitFromToc: Fr
  },
  themeVars: j($t.themeVars),
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
}), ya = "H4", wf = k({
  description: bo(4),
  specializedFrom: Pt,
  props: {
    value: Dr,
    maxLines: Mr,
    omitFromToc: Fr
  },
  themeVars: j($t.themeVars),
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
}), Ca = "H5", Hf = k({
  description: bo(5),
  specializedFrom: Pt,
  props: {
    value: Dr,
    maxLines: Mr,
    omitFromToc: Fr
  },
  themeVars: j($t.themeVars),
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
}), ka = "H6", Bf = k({
  description: bo(6),
  specializedFrom: Pt,
  props: {
    value: Dr,
    maxLines: Mr,
    omitFromToc: Fr
  },
  themeVars: j($t.themeVars),
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
}), If = k({
  status: "deprecated",
  description: "(**OBSOLETE**) This component displays some content when its parent component is hovered.",
  props: {
    triggerTemplate: Ve("The component that opens the hover card when hovered.")
  }
}), an = "Icon", $f = k({
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
  themeVars: j(Jn.themeVars),
  defaultThemeVars: {
    [`size-${an}`]: "1.25em"
  }
}), nn = "Image", Lf = k({
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
    click: ho(nn)
  },
  themeVars: j(kc.themeVars)
}), _f = "Items", Af = k({
  description: `The \`${_f}\` component maps sequential data items into component instances, representing each data item as a particular component.`,
  props: {
    items: Fe("This property contains the list of data items this component renders."),
    data: u(
      "This property contains the list of data items (obtained from a data source) this component renders."
    ),
    reverse: {
      description: "This property reverses the order in which data is mapped to template components."
    },
    itemTemplate: Ve("The component template to display a single item")
  },
  contextVars: {
    $item: Ve(
      "This value represents the current iteration item while the component renders its children."
    ),
    $itemIndex: Ve(
      "This integer value represents the current iteration index (zero-based) while rendering children."
    ),
    $isFirst: Ve("This boolean value indicates if the component renders its first item."),
    $isLast: Ve("This boolean value indicates if the component renders its last item.")
  },
  opaque: !0
}), ze = "Link", Nf = k({
  description: `A \`${ze}\` component represents a navigation target within the app or a reference to an external web URL.`,
  props: {
    to: u("This property defines the URL of the link."),
    enabled: Ze(),
    active: {
      description: "Indicates whether this link is active or not. If so, it will have a distinct visual appearance.",
      type: "boolean",
      defaultValue: !1
    },
    target: {
      description: `This property specifies where to open the link represented by the \`${ze}\`. This property accepts the following values (in accordance with the HTML standard):`,
      availableValues: Dn,
      type: "string",
      defaultValue: "_self"
    },
    label: qe(),
    icon: u("This property allows you to add an icon (specify the icon's name) to the link.")
  },
  themeVars: j(to.themeVars),
  themeVarDescriptions: {
    [`gap-icon-${ze}`]: "This property defines the size of the gap between the icon and the label."
  },
  defaultThemeVars: {
    [`border-${ze}`]: "0px solid $borderColor",
    [`textColor-${ze}--hover--active`]: `$textColor-${ze}--active`,
    [`textDecorationColor-${ze}--hover`]: "$color-surface-400A80",
    [`textDecorationColor-${ze}--active`]: "$color-surface200",
    [`fontWeight-${ze}--active`]: "$fontWeight-bold",
    [`textDecorationColor-${ze}`]: "$color-surface-400",
    [`textUnderlineOffset-${ze}`]: "$space-1",
    [`textDecorationLine-${ze}`]: "underline",
    [`textDecorationStyle-${ze}`]: "dashed",
    [`textDecorationThickness-${ze}`]: "$space-0_5",
    [`outlineColor-${ze}--focus`]: "$outlineColor--focus",
    [`outlineWidth-${ze}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${ze}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${ze}--focus`]: "$outlineOffset--focus",
    [`fontSize-${ze}`]: "inherit",
    [`gap-icon-${ze}`]: "$gap-tight",
    [`padding-icon-${ze}`]: "$space-0_5",
    light: {
      [`textColor-${ze}`]: "$color-primary-500",
      [`textColor-${ze}--active`]: "$color-primary-500"
    },
    dark: {
      [`textColor-${ze}`]: "$color-primary-500",
      [`textColor-${ze}--active`]: "$color-primary-500"
    }
  }
}), Wf = '"[]"', Of = {
  themeVars: Wf
}, jr = "List", Rf = k({
  status: "experimental",
  description: `The \`${jr}\` component is a robust layout container that renders associated data items as a list of components. \`${jr}\` is virtualized; it renders only items that are visible in the viewport.`,
  props: {
    data: u(
      "The component receives data via this property. The `data` property is a list of items that the `List` can display."
    ),
    items: Fe(
      "You can use `items` as an alias for the `data` property. When you bind the list to a data source (e.g. an API endpoint), the `data` acts as the property that accepts a URL to fetch information from an API.When both `items` and `data` are used, `items` has priority."
    ),
    loading: u(
      "This property delays the rendering of children until it is set to `false`, or the component receives usable list items via the [`data`](#data) property."
    ),
    limit: u(`This property limits the number of items displayed in the \`${jr}\`.`),
    scrollAnchor: {
      description: "This property pins the scroll position to a specified location of the list. Available values are shown below.",
      availableValues: xs,
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
      `This property is an array of group names that the \`${jr}\` will display.`
    ),
    groupHeaderTemplate: Ve(
      "Enables the customization of how the groups are displayed, similarly to the [`itemTemplate`](#itemtemplate). You can use the `$item` context variable to access an item group and map its individual attributes."
    ),
    groupFooterTemplate: Ve(
      "Enables the customization of how the the footer of each group is displayed. Combine with [`groupHeaderTemplate`](#groupHeaderTemplate) to customize sections. You can use the `$item` context variable to access an item group and map its individual attributes."
    ),
    itemTemplate: Ve(
      "This property allows the customization of mapping data items to components. You can use the `$item` context variable to access an item and map its individual attributes."
    ),
    emptyListTemplate: Ve(
      "This property defines the template to display when the list is empty."
    ),
    pageInfo: u(
      `This property contains the current page information. Setting this property also enures the \`${jr}\` uses pagination.`
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
      `This property adds a list of default groups for the \`${jr}\` and displays the group headers in the specified order. If the data contains group headers not in this list, those headers are also displayed (after the ones in this list); however, their order is not deterministic.`
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
  themeVars: j(Of.themeVars)
}), zf = "Logo", Vf = k({
  status: "experimental",
  description: `The \`${zf}\` component represents a logo or a brand symbol. Usually, you use this component in the [\`AppHeader\`](./AppHeader.mdx#logotemplate).`
}), Ef = `'{"borderColor-HorizontalRule": "var(--xmlui-borderColor-HorizontalRule)", "borderWidth-HorizontalRule": "var(--xmlui-borderWidth-HorizontalRule)", "borderStyle-HorizontalRule": "var(--xmlui-borderStyle-HorizontalRule)", "backgroundColor-Blockquote": "var(--xmlui-backgroundColor-Blockquote)", "accent-Blockquote": "var(--xmlui-accent-Blockquote)", "borderRadius-Blockquote": "var(--xmlui-borderRadius-Blockquote)", "boxShadow-Blockquote": "var(--xmlui-boxShadow-Blockquote)", "padding-Blockquote": "var(--xmlui-padding-Blockquote)", "margin-Blockquote": "var(--xmlui-margin-Blockquote)", "backgroundColor-Admonition": "var(--xmlui-backgroundColor-Admonition)", "textColor-Admonition": "var(--xmlui-textColor-Admonition)", "size-icon-Admonition": "var(--xmlui-size-icon-Admonition)", "paddingLeft-UnorderedList": "var(--xmlui-paddingLeft-UnorderedList)", "paddingLeft-OrderedList": "var(--xmlui-paddingLeft-OrderedList)", "paddingLeft-ListItem": "var(--xmlui-paddingLeft-ListItem)", "color-marker-ListItem": "var(--xmlui-color-marker-ListItem)", "marginTop-HtmlHeading": "var(--xmlui-marginTop-HtmlHeading)", "marginBottom-HtmlHeading": "var(--xmlui-marginBottom-HtmlHeading)"}'`, Pf = {
  themeVars: Ef
}, Df = `'{"textColor-HtmlTable": "var(--xmlui-textColor-HtmlTable)", "backgroundColor-HtmlTable": "var(--xmlui-backgroundColor-HtmlTable)", "fontFamily-HtmlTable": "var(--xmlui-fontFamily-HtmlTable)", "fontSize-HtmlTable": "var(--xmlui-fontSize-HtmlTable)", "fontWeight-HtmlTable": "var(--xmlui-fontWeight-HtmlTable)", "textTransform-HtmlTable": "var(--xmlui-textTransform-HtmlTable)", "marginTop-HtmlTable": "var(--xmlui-marginTop-HtmlTable)", "marginBottom-HtmlTable": "var(--xmlui-marginBottom-HtmlTable)", "border-HtmlTable": "var(--xmlui-border-HtmlTable)", "borderHorizontal-HtmlTable": "var(--xmlui-borderHorizontal-HtmlTable, var(--xmlui-border-HtmlTable))", "borderVertical-HtmlTable": "var(--xmlui-borderVertical-HtmlTable, var(--xmlui-border-HtmlTable))", "borderLeft-HtmlTable": "var(--xmlui-borderLeft-HtmlTable, var(--xmlui-borderHorizontal-HtmlTable, var(--xmlui-border-HtmlTable)))", "borderRight-HtmlTable": "var(--xmlui-borderRight-HtmlTable, var(--xmlui-borderHorizontal-HtmlTable, var(--xmlui-border-HtmlTable)))", "borderTop-HtmlTable": "var(--xmlui-borderTop-HtmlTable, var(--xmlui-borderVertical-HtmlTable, var(--xmlui-border-HtmlTable)))", "borderBottom-HtmlTable": "var(--xmlui-borderBottom-HtmlTable, var(--xmlui-borderVertical-HtmlTable, var(--xmlui-border-HtmlTable)))", "borderWidth-HtmlTable": "var(--xmlui-borderWidth-HtmlTable)", "borderHorizontalWidth-HtmlTable": "var(--xmlui-borderHorizontalWidth-HtmlTable, var(--xmlui-borderWidth-HtmlTable))", "borderLeftWidth-HtmlTable": "var(--xmlui-borderLeftWidth-HtmlTable, var(--xmlui-borderHorizontalWidth-HtmlTable, var(--xmlui-borderWidth-HtmlTable)))", "borderRightWidth-HtmlTable": "var(--xmlui-borderRightWidth-HtmlTable, var(--xmlui-borderHorizontalWidth-HtmlTable, var(--xmlui-borderWidth-HtmlTable)))", "borderVerticalWidth-HtmlTable": "var(--xmlui-borderVerticalWidth-HtmlTable, var(--xmlui-borderWidth-HtmlTable))", "borderTopWidth-HtmlTable": "var(--xmlui-borderTopWidth-HtmlTable, var(--xmlui-borderVerticalWidth-HtmlTable, var(--xmlui-borderWidth-HtmlTable)))", "borderBottomWidth-HtmlTable": "var(--xmlui-borderBottomWidth-HtmlTable, var(--xmlui-borderVerticalWidth-HtmlTable, var(--xmlui-borderWidth-HtmlTable)))", "borderStyle-HtmlTable": "var(--xmlui-borderStyle-HtmlTable)", "borderHorizontalStyle-HtmlTable": "var(--xmlui-borderHorizontalStyle-HtmlTable, var(--xmlui-borderStyle-HtmlTable))", "borderLeftStyle-HtmlTable": "var(--xmlui-borderLeftStyle-HtmlTable, var(--xmlui-borderHorizontalStyle-HtmlTable, var(--xmlui-borderStyle-HtmlTable)))", "borderRightStyle-HtmlTable": "var(--xmlui-borderRightStyle-HtmlTable, var(--xmlui-borderHorizontalStyle-HtmlTable, var(--xmlui-borderStyle-HtmlTable)))", "borderVerticalStyle-HtmlTable": "var(--xmlui-borderVerticalStyle-HtmlTable, var(--xmlui-borderStyle-HtmlTable))", "borderTopStyle-HtmlTable": "var(--xmlui-borderTopStyle-HtmlTable, var(--xmlui-borderVerticalStyle-HtmlTable, var(--xmlui-borderStyle-HtmlTable)))", "borderBottomStyle-HtmlTable": "var(--xmlui-borderBottomStyle-HtmlTable, var(--xmlui-borderVerticalStyle-HtmlTable, var(--xmlui-borderStyle-HtmlTable)))", "borderColor-HtmlTable": "var(--xmlui-borderColor-HtmlTable)", "borderHorizontalColor-HtmlTable": "var(--xmlui-borderHorizontalColor-HtmlTable, var(--xmlui-borderColor-HtmlTable))", "borderLeftColor-HtmlTable": "var(--xmlui-borderLeftColor-HtmlTable, var(--xmlui-borderHorizontalColor-HtmlTable, var(--xmlui-borderColor-HtmlTable)))", "borderRightColor-HtmlTable": "var(--xmlui-borderRightColor-HtmlTable, var(--xmlui-borderHorizontalColor-HtmlTable, var(--xmlui-borderColor-HtmlTable)))", "borderVerticalColor-HtmlTable": "var(--xmlui-borderVerticalColor-HtmlTable, var(--xmlui-borderColor-HtmlTable))", "borderTopColor-HtmlTable": "var(--xmlui-borderTopColor-HtmlTable, var(--xmlui-borderVerticalColor-HtmlTable, var(--xmlui-borderColor-HtmlTable)))", "borderBottomColor-HtmlTable": "var(--xmlui-borderBottomColor-HtmlTable, var(--xmlui-borderVerticalColor-HtmlTable, var(--xmlui-borderColor-HtmlTable)))", "radius-start-start-HtmlTable": "var(--xmlui-radius-start-start-HtmlTable, var(--xmlui-borderRadius-HtmlTable))", "radius-start-end-HtmlTable": "var(--xmlui-radius-start-end-HtmlTable, var(--xmlui-borderRadius-HtmlTable))", "radius-end-start-HtmlTable": "var(--xmlui-radius-end-start-HtmlTable, var(--xmlui-borderRadius-HtmlTable))", "radius-end-end-HtmlTable": "var(--xmlui-radius-end-end-HtmlTable, var(--xmlui-borderRadius-HtmlTable))", "padding-HtmlTable": "var(--xmlui-padding-HtmlTable)", "paddingHorizontal-HtmlTable": "var(--xmlui-paddingHorizontal-HtmlTable, var(--xmlui-padding-HtmlTable))", "paddingVertical-HtmlTable": "var(--xmlui-paddingVertical-HtmlTable, var(--xmlui-padding-HtmlTable))", "paddingLeft-HtmlTable": "var(--xmlui-paddingLeft-HtmlTable, var(--xmlui-paddingHorizontal-HtmlTable, var(--xmlui-padding-HtmlTable)))", "paddingRight-HtmlTable": "var(--xmlui-paddingRight-HtmlTable, var(--xmlui-paddingHorizontal-HtmlTable, var(--xmlui-padding-HtmlTable)))", "paddingTop-HtmlTable": "var(--xmlui-paddingTop-HtmlTable, var(--xmlui-paddingVertical-HtmlTable, var(--xmlui-padding-HtmlTable)))", "paddingBottom-HtmlTable": "var(--xmlui-paddingBottom-HtmlTable, var(--xmlui-paddingVertical-HtmlTable, var(--xmlui-padding-HtmlTable)))"}'`, Mf = `'{"backgroundColor-HtmlThead": "var(--xmlui-backgroundColor-HtmlThead)", "textColor-HtmlThead": "var(--xmlui-textColor-HtmlThead)", "fontWeight-HtmlThead": "var(--xmlui-fontWeight-HtmlThead)", "fontSize-HtmlThead": "var(--xmlui-fontSize-HtmlThead)", "textTransform-HtmlThead": "var(--xmlui-textTransform-HtmlThead)", "border-HtmlThead": "var(--xmlui-border-HtmlThead)", "borderHorizontal-HtmlThead": "var(--xmlui-borderHorizontal-HtmlThead, var(--xmlui-border-HtmlThead))", "borderVertical-HtmlThead": "var(--xmlui-borderVertical-HtmlThead, var(--xmlui-border-HtmlThead))", "borderLeft-HtmlThead": "var(--xmlui-borderLeft-HtmlThead, var(--xmlui-borderHorizontal-HtmlThead, var(--xmlui-border-HtmlThead)))", "borderRight-HtmlThead": "var(--xmlui-borderRight-HtmlThead, var(--xmlui-borderHorizontal-HtmlThead, var(--xmlui-border-HtmlThead)))", "borderTop-HtmlThead": "var(--xmlui-borderTop-HtmlThead, var(--xmlui-borderVertical-HtmlThead, var(--xmlui-border-HtmlThead)))", "borderBottom-HtmlThead": "var(--xmlui-borderBottom-HtmlThead, var(--xmlui-borderVertical-HtmlThead, var(--xmlui-border-HtmlThead)))", "borderWidth-HtmlThead": "var(--xmlui-borderWidth-HtmlThead)", "borderHorizontalWidth-HtmlThead": "var(--xmlui-borderHorizontalWidth-HtmlThead, var(--xmlui-borderWidth-HtmlThead))", "borderLeftWidth-HtmlThead": "var(--xmlui-borderLeftWidth-HtmlThead, var(--xmlui-borderHorizontalWidth-HtmlThead, var(--xmlui-borderWidth-HtmlThead)))", "borderRightWidth-HtmlThead": "var(--xmlui-borderRightWidth-HtmlThead, var(--xmlui-borderHorizontalWidth-HtmlThead, var(--xmlui-borderWidth-HtmlThead)))", "borderVerticalWidth-HtmlThead": "var(--xmlui-borderVerticalWidth-HtmlThead, var(--xmlui-borderWidth-HtmlThead))", "borderTopWidth-HtmlThead": "var(--xmlui-borderTopWidth-HtmlThead, var(--xmlui-borderVerticalWidth-HtmlThead, var(--xmlui-borderWidth-HtmlThead)))", "borderBottomWidth-HtmlThead": "var(--xmlui-borderBottomWidth-HtmlThead, var(--xmlui-borderVerticalWidth-HtmlThead, var(--xmlui-borderWidth-HtmlThead)))", "borderStyle-HtmlThead": "var(--xmlui-borderStyle-HtmlThead)", "borderHorizontalStyle-HtmlThead": "var(--xmlui-borderHorizontalStyle-HtmlThead, var(--xmlui-borderStyle-HtmlThead))", "borderLeftStyle-HtmlThead": "var(--xmlui-borderLeftStyle-HtmlThead, var(--xmlui-borderHorizontalStyle-HtmlThead, var(--xmlui-borderStyle-HtmlThead)))", "borderRightStyle-HtmlThead": "var(--xmlui-borderRightStyle-HtmlThead, var(--xmlui-borderHorizontalStyle-HtmlThead, var(--xmlui-borderStyle-HtmlThead)))", "borderVerticalStyle-HtmlThead": "var(--xmlui-borderVerticalStyle-HtmlThead, var(--xmlui-borderStyle-HtmlThead))", "borderTopStyle-HtmlThead": "var(--xmlui-borderTopStyle-HtmlThead, var(--xmlui-borderVerticalStyle-HtmlThead, var(--xmlui-borderStyle-HtmlThead)))", "borderBottomStyle-HtmlThead": "var(--xmlui-borderBottomStyle-HtmlThead, var(--xmlui-borderVerticalStyle-HtmlThead, var(--xmlui-borderStyle-HtmlThead)))", "borderColor-HtmlThead": "var(--xmlui-borderColor-HtmlThead)", "borderHorizontalColor-HtmlThead": "var(--xmlui-borderHorizontalColor-HtmlThead, var(--xmlui-borderColor-HtmlThead))", "borderLeftColor-HtmlThead": "var(--xmlui-borderLeftColor-HtmlThead, var(--xmlui-borderHorizontalColor-HtmlThead, var(--xmlui-borderColor-HtmlThead)))", "borderRightColor-HtmlThead": "var(--xmlui-borderRightColor-HtmlThead, var(--xmlui-borderHorizontalColor-HtmlThead, var(--xmlui-borderColor-HtmlThead)))", "borderVerticalColor-HtmlThead": "var(--xmlui-borderVerticalColor-HtmlThead, var(--xmlui-borderColor-HtmlThead))", "borderTopColor-HtmlThead": "var(--xmlui-borderTopColor-HtmlThead, var(--xmlui-borderVerticalColor-HtmlThead, var(--xmlui-borderColor-HtmlThead)))", "borderBottomColor-HtmlThead": "var(--xmlui-borderBottomColor-HtmlThead, var(--xmlui-borderVerticalColor-HtmlThead, var(--xmlui-borderColor-HtmlThead)))", "radius-start-start-HtmlThead": "var(--xmlui-radius-start-start-HtmlThead, var(--xmlui-borderRadius-HtmlThead))", "radius-start-end-HtmlThead": "var(--xmlui-radius-start-end-HtmlThead, var(--xmlui-borderRadius-HtmlThead))", "radius-end-start-HtmlThead": "var(--xmlui-radius-end-start-HtmlThead, var(--xmlui-borderRadius-HtmlThead))", "radius-end-end-HtmlThead": "var(--xmlui-radius-end-end-HtmlThead, var(--xmlui-borderRadius-HtmlThead))", "padding-HtmlThead": "var(--xmlui-padding-HtmlThead)", "paddingHorizontal-HtmlThead": "var(--xmlui-paddingHorizontal-HtmlThead, var(--xmlui-padding-HtmlThead))", "paddingVertical-HtmlThead": "var(--xmlui-paddingVertical-HtmlThead, var(--xmlui-padding-HtmlThead))", "paddingLeft-HtmlThead": "var(--xmlui-paddingLeft-HtmlThead, var(--xmlui-paddingHorizontal-HtmlThead, var(--xmlui-padding-HtmlThead)))", "paddingRight-HtmlThead": "var(--xmlui-paddingRight-HtmlThead, var(--xmlui-paddingHorizontal-HtmlThead, var(--xmlui-padding-HtmlThead)))", "paddingTop-HtmlThead": "var(--xmlui-paddingTop-HtmlThead, var(--xmlui-paddingVertical-HtmlThead, var(--xmlui-padding-HtmlThead)))", "paddingBottom-HtmlThead": "var(--xmlui-paddingBottom-HtmlThead, var(--xmlui-paddingVertical-HtmlThead, var(--xmlui-padding-HtmlThead)))"}'`, Ff = `'{"backgroundColor-HtmlTbody": "var(--xmlui-backgroundColor-HtmlTbody)", "textColor-HtmlTbody": "var(--xmlui-textColor-HtmlTbody)", "textAlign-HtmlTbody": "var(--xmlui-textAlign-HtmlTbody)", "verticalAlign-HtmlTbody": "var(--xmlui-verticalAlign-HtmlTbody)", "textTransform-HtmlTbody": "var(--xmlui-textTransform-HtmlTbody)"}'`, Uf = `'{"backgroundColor-HtmlTfoot": "var(--xmlui-backgroundColor-HtmlTfoot)", "textColor-HtmlTfoot": "var(--xmlui-textColor-HtmlTfoot)"}'`, qf = `'{"backgroundColor-HtmlTh": "var(--xmlui-backgroundColor-HtmlTh)", "textColor-HtmlTh": "var(--xmlui-textColor-HtmlTh)", "fontWeight-HtmlTh": "var(--xmlui-fontWeight-HtmlTh)", "fontSize-HtmlTh": "var(--xmlui-fontSize-HtmlTh)", "backgroundColor-HtmlTh--hover": "var(--xmlui-backgroundColor-HtmlTh--hover)", "border-HtmlTh": "var(--xmlui-border-HtmlTh)", "borderHorizontal-HtmlTh": "var(--xmlui-borderHorizontal-HtmlTh, var(--xmlui-border-HtmlTh))", "borderVertical-HtmlTh": "var(--xmlui-borderVertical-HtmlTh, var(--xmlui-border-HtmlTh))", "borderLeft-HtmlTh": "var(--xmlui-borderLeft-HtmlTh, var(--xmlui-borderHorizontal-HtmlTh, var(--xmlui-border-HtmlTh)))", "borderRight-HtmlTh": "var(--xmlui-borderRight-HtmlTh, var(--xmlui-borderHorizontal-HtmlTh, var(--xmlui-border-HtmlTh)))", "borderTop-HtmlTh": "var(--xmlui-borderTop-HtmlTh, var(--xmlui-borderVertical-HtmlTh, var(--xmlui-border-HtmlTh)))", "borderBottom-HtmlTh": "var(--xmlui-borderBottom-HtmlTh, var(--xmlui-borderVertical-HtmlTh, var(--xmlui-border-HtmlTh)))", "borderWidth-HtmlTh": "var(--xmlui-borderWidth-HtmlTh)", "borderHorizontalWidth-HtmlTh": "var(--xmlui-borderHorizontalWidth-HtmlTh, var(--xmlui-borderWidth-HtmlTh))", "borderLeftWidth-HtmlTh": "var(--xmlui-borderLeftWidth-HtmlTh, var(--xmlui-borderHorizontalWidth-HtmlTh, var(--xmlui-borderWidth-HtmlTh)))", "borderRightWidth-HtmlTh": "var(--xmlui-borderRightWidth-HtmlTh, var(--xmlui-borderHorizontalWidth-HtmlTh, var(--xmlui-borderWidth-HtmlTh)))", "borderVerticalWidth-HtmlTh": "var(--xmlui-borderVerticalWidth-HtmlTh, var(--xmlui-borderWidth-HtmlTh))", "borderTopWidth-HtmlTh": "var(--xmlui-borderTopWidth-HtmlTh, var(--xmlui-borderVerticalWidth-HtmlTh, var(--xmlui-borderWidth-HtmlTh)))", "borderBottomWidth-HtmlTh": "var(--xmlui-borderBottomWidth-HtmlTh, var(--xmlui-borderVerticalWidth-HtmlTh, var(--xmlui-borderWidth-HtmlTh)))", "borderStyle-HtmlTh": "var(--xmlui-borderStyle-HtmlTh)", "borderHorizontalStyle-HtmlTh": "var(--xmlui-borderHorizontalStyle-HtmlTh, var(--xmlui-borderStyle-HtmlTh))", "borderLeftStyle-HtmlTh": "var(--xmlui-borderLeftStyle-HtmlTh, var(--xmlui-borderHorizontalStyle-HtmlTh, var(--xmlui-borderStyle-HtmlTh)))", "borderRightStyle-HtmlTh": "var(--xmlui-borderRightStyle-HtmlTh, var(--xmlui-borderHorizontalStyle-HtmlTh, var(--xmlui-borderStyle-HtmlTh)))", "borderVerticalStyle-HtmlTh": "var(--xmlui-borderVerticalStyle-HtmlTh, var(--xmlui-borderStyle-HtmlTh))", "borderTopStyle-HtmlTh": "var(--xmlui-borderTopStyle-HtmlTh, var(--xmlui-borderVerticalStyle-HtmlTh, var(--xmlui-borderStyle-HtmlTh)))", "borderBottomStyle-HtmlTh": "var(--xmlui-borderBottomStyle-HtmlTh, var(--xmlui-borderVerticalStyle-HtmlTh, var(--xmlui-borderStyle-HtmlTh)))", "borderColor-HtmlTh": "var(--xmlui-borderColor-HtmlTh)", "borderHorizontalColor-HtmlTh": "var(--xmlui-borderHorizontalColor-HtmlTh, var(--xmlui-borderColor-HtmlTh))", "borderLeftColor-HtmlTh": "var(--xmlui-borderLeftColor-HtmlTh, var(--xmlui-borderHorizontalColor-HtmlTh, var(--xmlui-borderColor-HtmlTh)))", "borderRightColor-HtmlTh": "var(--xmlui-borderRightColor-HtmlTh, var(--xmlui-borderHorizontalColor-HtmlTh, var(--xmlui-borderColor-HtmlTh)))", "borderVerticalColor-HtmlTh": "var(--xmlui-borderVerticalColor-HtmlTh, var(--xmlui-borderColor-HtmlTh))", "borderTopColor-HtmlTh": "var(--xmlui-borderTopColor-HtmlTh, var(--xmlui-borderVerticalColor-HtmlTh, var(--xmlui-borderColor-HtmlTh)))", "borderBottomColor-HtmlTh": "var(--xmlui-borderBottomColor-HtmlTh, var(--xmlui-borderVerticalColor-HtmlTh, var(--xmlui-borderColor-HtmlTh)))", "radius-start-start-HtmlTh": "var(--xmlui-radius-start-start-HtmlTh, var(--xmlui-borderRadius-HtmlTh))", "radius-start-end-HtmlTh": "var(--xmlui-radius-start-end-HtmlTh, var(--xmlui-borderRadius-HtmlTh))", "radius-end-start-HtmlTh": "var(--xmlui-radius-end-start-HtmlTh, var(--xmlui-borderRadius-HtmlTh))", "radius-end-end-HtmlTh": "var(--xmlui-radius-end-end-HtmlTh, var(--xmlui-borderRadius-HtmlTh))", "padding-HtmlTh": "var(--xmlui-padding-HtmlTh)", "paddingHorizontal-HtmlTh": "var(--xmlui-paddingHorizontal-HtmlTh, var(--xmlui-padding-HtmlTh))", "paddingVertical-HtmlTh": "var(--xmlui-paddingVertical-HtmlTh, var(--xmlui-padding-HtmlTh))", "paddingLeft-HtmlTh": "var(--xmlui-paddingLeft-HtmlTh, var(--xmlui-paddingHorizontal-HtmlTh, var(--xmlui-padding-HtmlTh)))", "paddingRight-HtmlTh": "var(--xmlui-paddingRight-HtmlTh, var(--xmlui-paddingHorizontal-HtmlTh, var(--xmlui-padding-HtmlTh)))", "paddingTop-HtmlTh": "var(--xmlui-paddingTop-HtmlTh, var(--xmlui-paddingVertical-HtmlTh, var(--xmlui-padding-HtmlTh)))", "paddingBottom-HtmlTh": "var(--xmlui-paddingBottom-HtmlTh, var(--xmlui-paddingVertical-HtmlTh, var(--xmlui-padding-HtmlTh)))"}'`, Gf = `'{"backgroundColor-HtmlTr": "var(--xmlui-backgroundColor-HtmlTr)", "backgroundColor-HtmlTr--hover": "var(--xmlui-backgroundColor-HtmlTr--hover)", "backgroundColor-even-HtmlTr": "var(--xmlui-backgroundColor-even-HtmlTr)", "textColor-HtmlTr": "var(--xmlui-textColor-HtmlTr)", "textColor-HtmlTr--hover": "var(--xmlui-textColor-HtmlTr--hover)", "fontSize-HtmlTr": "var(--xmlui-fontSize-HtmlTr)", "fontWeight-HtmlTr": "var(--xmlui-fontWeight-HtmlTr)", "border-HtmlTr": "var(--xmlui-border-HtmlTr)", "borderHorizontal-HtmlTr": "var(--xmlui-borderHorizontal-HtmlTr, var(--xmlui-border-HtmlTr))", "borderVertical-HtmlTr": "var(--xmlui-borderVertical-HtmlTr, var(--xmlui-border-HtmlTr))", "borderLeft-HtmlTr": "var(--xmlui-borderLeft-HtmlTr, var(--xmlui-borderHorizontal-HtmlTr, var(--xmlui-border-HtmlTr)))", "borderRight-HtmlTr": "var(--xmlui-borderRight-HtmlTr, var(--xmlui-borderHorizontal-HtmlTr, var(--xmlui-border-HtmlTr)))", "borderTop-HtmlTr": "var(--xmlui-borderTop-HtmlTr, var(--xmlui-borderVertical-HtmlTr, var(--xmlui-border-HtmlTr)))", "borderBottom-HtmlTr": "var(--xmlui-borderBottom-HtmlTr, var(--xmlui-borderVertical-HtmlTr, var(--xmlui-border-HtmlTr)))", "borderWidth-HtmlTr": "var(--xmlui-borderWidth-HtmlTr)", "borderHorizontalWidth-HtmlTr": "var(--xmlui-borderHorizontalWidth-HtmlTr, var(--xmlui-borderWidth-HtmlTr))", "borderLeftWidth-HtmlTr": "var(--xmlui-borderLeftWidth-HtmlTr, var(--xmlui-borderHorizontalWidth-HtmlTr, var(--xmlui-borderWidth-HtmlTr)))", "borderRightWidth-HtmlTr": "var(--xmlui-borderRightWidth-HtmlTr, var(--xmlui-borderHorizontalWidth-HtmlTr, var(--xmlui-borderWidth-HtmlTr)))", "borderVerticalWidth-HtmlTr": "var(--xmlui-borderVerticalWidth-HtmlTr, var(--xmlui-borderWidth-HtmlTr))", "borderTopWidth-HtmlTr": "var(--xmlui-borderTopWidth-HtmlTr, var(--xmlui-borderVerticalWidth-HtmlTr, var(--xmlui-borderWidth-HtmlTr)))", "borderBottomWidth-HtmlTr": "var(--xmlui-borderBottomWidth-HtmlTr, var(--xmlui-borderVerticalWidth-HtmlTr, var(--xmlui-borderWidth-HtmlTr)))", "borderStyle-HtmlTr": "var(--xmlui-borderStyle-HtmlTr)", "borderHorizontalStyle-HtmlTr": "var(--xmlui-borderHorizontalStyle-HtmlTr, var(--xmlui-borderStyle-HtmlTr))", "borderLeftStyle-HtmlTr": "var(--xmlui-borderLeftStyle-HtmlTr, var(--xmlui-borderHorizontalStyle-HtmlTr, var(--xmlui-borderStyle-HtmlTr)))", "borderRightStyle-HtmlTr": "var(--xmlui-borderRightStyle-HtmlTr, var(--xmlui-borderHorizontalStyle-HtmlTr, var(--xmlui-borderStyle-HtmlTr)))", "borderVerticalStyle-HtmlTr": "var(--xmlui-borderVerticalStyle-HtmlTr, var(--xmlui-borderStyle-HtmlTr))", "borderTopStyle-HtmlTr": "var(--xmlui-borderTopStyle-HtmlTr, var(--xmlui-borderVerticalStyle-HtmlTr, var(--xmlui-borderStyle-HtmlTr)))", "borderBottomStyle-HtmlTr": "var(--xmlui-borderBottomStyle-HtmlTr, var(--xmlui-borderVerticalStyle-HtmlTr, var(--xmlui-borderStyle-HtmlTr)))", "borderColor-HtmlTr": "var(--xmlui-borderColor-HtmlTr)", "borderHorizontalColor-HtmlTr": "var(--xmlui-borderHorizontalColor-HtmlTr, var(--xmlui-borderColor-HtmlTr))", "borderLeftColor-HtmlTr": "var(--xmlui-borderLeftColor-HtmlTr, var(--xmlui-borderHorizontalColor-HtmlTr, var(--xmlui-borderColor-HtmlTr)))", "borderRightColor-HtmlTr": "var(--xmlui-borderRightColor-HtmlTr, var(--xmlui-borderHorizontalColor-HtmlTr, var(--xmlui-borderColor-HtmlTr)))", "borderVerticalColor-HtmlTr": "var(--xmlui-borderVerticalColor-HtmlTr, var(--xmlui-borderColor-HtmlTr))", "borderTopColor-HtmlTr": "var(--xmlui-borderTopColor-HtmlTr, var(--xmlui-borderVerticalColor-HtmlTr, var(--xmlui-borderColor-HtmlTr)))", "borderBottomColor-HtmlTr": "var(--xmlui-borderBottomColor-HtmlTr, var(--xmlui-borderVerticalColor-HtmlTr, var(--xmlui-borderColor-HtmlTr)))", "radius-start-start-HtmlTr": "var(--xmlui-radius-start-start-HtmlTr, var(--xmlui-borderRadius-HtmlTr))", "radius-start-end-HtmlTr": "var(--xmlui-radius-start-end-HtmlTr, var(--xmlui-borderRadius-HtmlTr))", "radius-end-start-HtmlTr": "var(--xmlui-radius-end-start-HtmlTr, var(--xmlui-borderRadius-HtmlTr))", "radius-end-end-HtmlTr": "var(--xmlui-radius-end-end-HtmlTr, var(--xmlui-borderRadius-HtmlTr))"}'`, Yf = `'{"backgroundColor-HtmlTd": "var(--xmlui-backgroundColor-HtmlTd)", "text-align-HtmlTd": "var(--xmlui-text-align-HtmlTd)", "verticalAlign-HtmlTd": "var(--xmlui-verticalAlign-HtmlTd)", "fontSize-HtmlTd": "var(--xmlui-fontSize-HtmlTd)", "fontWeight-HtmlTd": "var(--xmlui-fontWeight-HtmlTd)", "border-HtmlTd": "var(--xmlui-border-HtmlTd)", "borderHorizontal-HtmlTd": "var(--xmlui-borderHorizontal-HtmlTd, var(--xmlui-border-HtmlTd))", "borderVertical-HtmlTd": "var(--xmlui-borderVertical-HtmlTd, var(--xmlui-border-HtmlTd))", "borderLeft-HtmlTd": "var(--xmlui-borderLeft-HtmlTd, var(--xmlui-borderHorizontal-HtmlTd, var(--xmlui-border-HtmlTd)))", "borderRight-HtmlTd": "var(--xmlui-borderRight-HtmlTd, var(--xmlui-borderHorizontal-HtmlTd, var(--xmlui-border-HtmlTd)))", "borderTop-HtmlTd": "var(--xmlui-borderTop-HtmlTd, var(--xmlui-borderVertical-HtmlTd, var(--xmlui-border-HtmlTd)))", "borderBottom-HtmlTd": "var(--xmlui-borderBottom-HtmlTd, var(--xmlui-borderVertical-HtmlTd, var(--xmlui-border-HtmlTd)))", "borderWidth-HtmlTd": "var(--xmlui-borderWidth-HtmlTd)", "borderHorizontalWidth-HtmlTd": "var(--xmlui-borderHorizontalWidth-HtmlTd, var(--xmlui-borderWidth-HtmlTd))", "borderLeftWidth-HtmlTd": "var(--xmlui-borderLeftWidth-HtmlTd, var(--xmlui-borderHorizontalWidth-HtmlTd, var(--xmlui-borderWidth-HtmlTd)))", "borderRightWidth-HtmlTd": "var(--xmlui-borderRightWidth-HtmlTd, var(--xmlui-borderHorizontalWidth-HtmlTd, var(--xmlui-borderWidth-HtmlTd)))", "borderVerticalWidth-HtmlTd": "var(--xmlui-borderVerticalWidth-HtmlTd, var(--xmlui-borderWidth-HtmlTd))", "borderTopWidth-HtmlTd": "var(--xmlui-borderTopWidth-HtmlTd, var(--xmlui-borderVerticalWidth-HtmlTd, var(--xmlui-borderWidth-HtmlTd)))", "borderBottomWidth-HtmlTd": "var(--xmlui-borderBottomWidth-HtmlTd, var(--xmlui-borderVerticalWidth-HtmlTd, var(--xmlui-borderWidth-HtmlTd)))", "borderStyle-HtmlTd": "var(--xmlui-borderStyle-HtmlTd)", "borderHorizontalStyle-HtmlTd": "var(--xmlui-borderHorizontalStyle-HtmlTd, var(--xmlui-borderStyle-HtmlTd))", "borderLeftStyle-HtmlTd": "var(--xmlui-borderLeftStyle-HtmlTd, var(--xmlui-borderHorizontalStyle-HtmlTd, var(--xmlui-borderStyle-HtmlTd)))", "borderRightStyle-HtmlTd": "var(--xmlui-borderRightStyle-HtmlTd, var(--xmlui-borderHorizontalStyle-HtmlTd, var(--xmlui-borderStyle-HtmlTd)))", "borderVerticalStyle-HtmlTd": "var(--xmlui-borderVerticalStyle-HtmlTd, var(--xmlui-borderStyle-HtmlTd))", "borderTopStyle-HtmlTd": "var(--xmlui-borderTopStyle-HtmlTd, var(--xmlui-borderVerticalStyle-HtmlTd, var(--xmlui-borderStyle-HtmlTd)))", "borderBottomStyle-HtmlTd": "var(--xmlui-borderBottomStyle-HtmlTd, var(--xmlui-borderVerticalStyle-HtmlTd, var(--xmlui-borderStyle-HtmlTd)))", "borderColor-HtmlTd": "var(--xmlui-borderColor-HtmlTd)", "borderHorizontalColor-HtmlTd": "var(--xmlui-borderHorizontalColor-HtmlTd, var(--xmlui-borderColor-HtmlTd))", "borderLeftColor-HtmlTd": "var(--xmlui-borderLeftColor-HtmlTd, var(--xmlui-borderHorizontalColor-HtmlTd, var(--xmlui-borderColor-HtmlTd)))", "borderRightColor-HtmlTd": "var(--xmlui-borderRightColor-HtmlTd, var(--xmlui-borderHorizontalColor-HtmlTd, var(--xmlui-borderColor-HtmlTd)))", "borderVerticalColor-HtmlTd": "var(--xmlui-borderVerticalColor-HtmlTd, var(--xmlui-borderColor-HtmlTd))", "borderTopColor-HtmlTd": "var(--xmlui-borderTopColor-HtmlTd, var(--xmlui-borderVerticalColor-HtmlTd, var(--xmlui-borderColor-HtmlTd)))", "borderBottomColor-HtmlTd": "var(--xmlui-borderBottomColor-HtmlTd, var(--xmlui-borderVerticalColor-HtmlTd, var(--xmlui-borderColor-HtmlTd)))", "radius-start-start-HtmlTd": "var(--xmlui-radius-start-start-HtmlTd, var(--xmlui-borderRadius-HtmlTd))", "radius-start-end-HtmlTd": "var(--xmlui-radius-start-end-HtmlTd, var(--xmlui-borderRadius-HtmlTd))", "radius-end-start-HtmlTd": "var(--xmlui-radius-end-start-HtmlTd, var(--xmlui-borderRadius-HtmlTd))", "radius-end-end-HtmlTd": "var(--xmlui-radius-end-end-HtmlTd, var(--xmlui-borderRadius-HtmlTd))", "padding-HtmlTd": "var(--xmlui-padding-HtmlTd)", "paddingHorizontal-HtmlTd": "var(--xmlui-paddingHorizontal-HtmlTd, var(--xmlui-padding-HtmlTd))", "paddingVertical-HtmlTd": "var(--xmlui-paddingVertical-HtmlTd, var(--xmlui-padding-HtmlTd))", "paddingLeft-HtmlTd": "var(--xmlui-paddingLeft-HtmlTd, var(--xmlui-paddingHorizontal-HtmlTd, var(--xmlui-padding-HtmlTd)))", "paddingRight-HtmlTd": "var(--xmlui-paddingRight-HtmlTd, var(--xmlui-paddingHorizontal-HtmlTd, var(--xmlui-padding-HtmlTd)))", "paddingTop-HtmlTd": "var(--xmlui-paddingTop-HtmlTd, var(--xmlui-paddingVertical-HtmlTd, var(--xmlui-padding-HtmlTd)))", "paddingBottom-HtmlTd": "var(--xmlui-paddingBottom-HtmlTd, var(--xmlui-paddingVertical-HtmlTd, var(--xmlui-padding-HtmlTd)))"}'`, Xf = `'{"marginTop-HtmlOl": "var(--xmlui-marginTop-HtmlOl)", "marginBottom-HtmlOl": "var(--xmlui-marginBottom-HtmlOl)", "marginTop-HtmlUl": "var(--xmlui-marginTop-HtmlUl)", "marginBottom-HtmlUl": "var(--xmlui-marginBottom-HtmlUl)"}'`, jf = `'{"marginTop-HtmlHeading": "var(--xmlui-marginTop-HtmlHeading)", "marginBottom-HtmlHeading": "var(--xmlui-marginBottom-HtmlHeading)"}'`, ot = {
  themeVarsTable: Df,
  themeVarsThead: Mf,
  themeVarsTbody: Ff,
  themeVarsTfoot: Uf,
  themeVarsTh: qf,
  themeVarsTr: Gf,
  themeVarsTd: Yf,
  themeVarsList: Xf,
  themeVarsHeading: jf
}, Qf = "Markdown", Zf = k({
  description: `\`${Qf}\` displays plain text styled using markdown syntax.`,
  themeVars: j(Pf.themeVars),
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
}), bt = "ModalDialog", Jf = k({
  description: `The \`${bt}\` component defines a modal dialog UI element that can be displayed over the existing UI - triggered by some action.`,
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
      `This event is fired when the \`${bt}\` is opened either via a \`when\` or an imperative API call (\`open()\`).`
    ),
    close: u(
      `This event is fired when the close button is pressed or the user clicks outside the \`${bt}\`.`
    )
  },
  apis: {
    close: u(
      `This method is used to close the \`${bt}\`. Invoke it using \`modalId.close()\` where \`modalId\` refers to a \`ModalDialog\` component.`
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
  themeVars: j(xr.themeVars),
  defaultThemeVars: {
    ...za(bt, { all: "$space-7" }),
    [`backgroundColor-${bt}`]: "$backgroundColor-primary",
    [`backgroundColor-overlay-${bt}`]: "$backgroundColor-overlay",
    [`textColor-${bt}`]: "$textColor-primary",
    [`borderRadius-${bt}`]: "$borderRadius",
    [`fontFamily-${bt}`]: "$fontFamily",
    [`maxWidth-${bt}`]: "450px",
    [`marginBottom-title-${bt}`]: "0",
    dark: {
      [`backgroundColor-${bt}`]: "$backgroundColor-primary"
    }
  }
}), Kf = `'{"backgroundColor-dropdown-NavGroup": "var(--xmlui-backgroundColor-dropdown-NavGroup)", "boxShadow-dropdown-NavGroup": "var(--xmlui-boxShadow-dropdown-NavGroup)", "borderRadius-dropdown-NavGroup": "var(--xmlui-borderRadius-dropdown-NavGroup)"}'`, eg = {
  themeVars: Kf
}, Do = "NavGroup", tg = k({
  description: "The `NavGroup` component is a container for grouping related navigation targets (`NavLink` components). It can be displayed as a submenu in the App's UI.",
  props: {
    label: qe(),
    icon: u(`This property defines an optional icon to display along with the \`${Do}\` label.`),
    to: u("This property defines an optional navigation link.")
  },
  themeVars: j(eg.themeVars),
  defaultThemeVars: {
    [`backgroundColor-dropdown-${Do}`]: "$backgroundColor-primary",
    [`borderRadius-dropdown-${Do}`]: "$borderRadius",
    [`boxShadow-dropdown-${Do}`]: "$boxShadow-spread"
  }
}), $e = "NavLink", rg = k({
  description: `The \`${$e}\` component defines a navigation target (app navigation menu item) within the app; it is associated with a particular in-app navigation target (or an external link).`,
  props: {
    to: u("This property defines the URL of the link."),
    enabled: Ze(),
    active: {
      description: "This property indicates if the particular navigation is an active link. An active link has a particular visual appearance, provided its [`displayActive`](#displayactive) property is set to `true`.",
      valueType: "boolean",
      defaultValue: !1
    },
    target: {
      description: "This property specifies how to open the clicked link.",
      availableValues: Dn,
      type: "string",
      defaultValue: "_self"
    },
    label: qe(),
    vertical: {
      description: `This property sets how the active status is displayed on the \`${$e}\` component. If set to true, the indicator is displayed on the side which lends itself to a vertically aligned navigation menu.`,
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
    click: ho($e)
  },
  themeVars: j(wc.themeVars),
  themeVarDescriptions: {
    [`color-indicator-${$e}`]: "Provides the following states: `--hover`, `--active`, `--pressed`"
  },
  defaultThemeVars: {
    [`border-${$e}`]: "0px solid $borderColor",
    [`borderRadius-${$e}`]: "$borderRadius",
    [`backgroundColor-${$e}`]: "transparent",
    [`paddingHorizontal-${$e}`]: "$space-4",
    [`paddingVertical-${$e}`]: "$space-2",
    [`fontSize-${$e}`]: "$fontSize-small",
    [`fontWeight-${$e}`]: "$fontWeight-normal",
    [`fontFamily-${$e}`]: "$fontFamily",
    [`textColor-${$e}`]: "$textColor-primary",
    [`fontWeight-${$e}--pressed`]: "$fontWeight-normal",
    [`thickness-indicator-${$e}`]: "$space-0_5",
    [`outlineColor-${$e}--focus`]: "$outlineColor--focus",
    [`outlineWidth-${$e}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${$e}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${$e}--focus`]: "-1px",
    [`borderRadius-indicator-${$e}`]: "$borderRadius",
    light: {
      [`color-icon-${$e}`]: "$color-surface-500",
      [`color-indicator-${$e}--active`]: "$color-primary-500",
      [`color-indicator-${$e}--pressed`]: "$color-primary-500",
      [`color-indicator-${$e}--hover`]: "$color-primary-600"
    },
    dark: {
      [`color-indicator-${$e}--active`]: "$color-primary-500",
      [`color-indicator-${$e}--pressed`]: "$color-primary-500",
      [`color-indicator-${$e}--hover`]: "$color-primary-400"
    }
  }
}), or = "NavPanel", og = k({
  description: `\`${or}\` is a placeholder within \`App\` to define the app's navigation (menu) structure.`,
  props: {
    logoTemplate: Ve(
      "This property defines the logo template to display in the navigation panel with the `vertical` and `vertical-sticky` layout."
    )
  },
  themeVars: j(Ic.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${or}`]: "transparent",
    [`border-${or}`]: "0px solid $borderColor",
    [`paddingHorizontal-${or}`]: "$space-4",
    [`paddingVertical-logo-${or}`]: "$space-4",
    [`paddingHorizontal-logo-${or}`]: "$space-4",
    [`marginBottom-logo-${or}`]: "$space-4",
    light: {
      [`boxShadow-${or}-vertical`]: "4px 0 4px 0 rgb(0 0 0 / 10%)"
    },
    dark: {
      [`boxShadow-${or}-vertical`]: "4px 0 6px 0 rgba(0, 0, 0, 0.2)"
    }
  }
}), ag = `'{"padding-NoResult": "var(--xmlui-padding-NoResult)", "paddingHorizontal-NoResult": "var(--xmlui-paddingHorizontal-NoResult, var(--xmlui-padding-NoResult))", "paddingVertical-NoResult": "var(--xmlui-paddingVertical-NoResult, var(--xmlui-padding-NoResult))", "paddingLeft-NoResult": "var(--xmlui-paddingLeft-NoResult, var(--xmlui-paddingHorizontal-NoResult, var(--xmlui-padding-NoResult)))", "paddingRight-NoResult": "var(--xmlui-paddingRight-NoResult, var(--xmlui-paddingHorizontal-NoResult, var(--xmlui-padding-NoResult)))", "paddingTop-NoResult": "var(--xmlui-paddingTop-NoResult, var(--xmlui-paddingVertical-NoResult, var(--xmlui-padding-NoResult)))", "paddingBottom-NoResult": "var(--xmlui-paddingBottom-NoResult, var(--xmlui-paddingVertical-NoResult, var(--xmlui-padding-NoResult)))", "border-NoResult": "var(--xmlui-border-NoResult)", "borderHorizontal-NoResult": "var(--xmlui-borderHorizontal-NoResult, var(--xmlui-border-NoResult))", "borderVertical-NoResult": "var(--xmlui-borderVertical-NoResult, var(--xmlui-border-NoResult))", "borderLeft-NoResult": "var(--xmlui-borderLeft-NoResult, var(--xmlui-borderHorizontal-NoResult, var(--xmlui-border-NoResult)))", "borderRight-NoResult": "var(--xmlui-borderRight-NoResult, var(--xmlui-borderHorizontal-NoResult, var(--xmlui-border-NoResult)))", "borderTop-NoResult": "var(--xmlui-borderTop-NoResult, var(--xmlui-borderVertical-NoResult, var(--xmlui-border-NoResult)))", "borderBottom-NoResult": "var(--xmlui-borderBottom-NoResult, var(--xmlui-borderVertical-NoResult, var(--xmlui-border-NoResult)))", "borderWidth-NoResult": "var(--xmlui-borderWidth-NoResult)", "borderHorizontalWidth-NoResult": "var(--xmlui-borderHorizontalWidth-NoResult, var(--xmlui-borderWidth-NoResult))", "borderLeftWidth-NoResult": "var(--xmlui-borderLeftWidth-NoResult, var(--xmlui-borderHorizontalWidth-NoResult, var(--xmlui-borderWidth-NoResult)))", "borderRightWidth-NoResult": "var(--xmlui-borderRightWidth-NoResult, var(--xmlui-borderHorizontalWidth-NoResult, var(--xmlui-borderWidth-NoResult)))", "borderVerticalWidth-NoResult": "var(--xmlui-borderVerticalWidth-NoResult, var(--xmlui-borderWidth-NoResult))", "borderTopWidth-NoResult": "var(--xmlui-borderTopWidth-NoResult, var(--xmlui-borderVerticalWidth-NoResult, var(--xmlui-borderWidth-NoResult)))", "borderBottomWidth-NoResult": "var(--xmlui-borderBottomWidth-NoResult, var(--xmlui-borderVerticalWidth-NoResult, var(--xmlui-borderWidth-NoResult)))", "borderStyle-NoResult": "var(--xmlui-borderStyle-NoResult)", "borderHorizontalStyle-NoResult": "var(--xmlui-borderHorizontalStyle-NoResult, var(--xmlui-borderStyle-NoResult))", "borderLeftStyle-NoResult": "var(--xmlui-borderLeftStyle-NoResult, var(--xmlui-borderHorizontalStyle-NoResult, var(--xmlui-borderStyle-NoResult)))", "borderRightStyle-NoResult": "var(--xmlui-borderRightStyle-NoResult, var(--xmlui-borderHorizontalStyle-NoResult, var(--xmlui-borderStyle-NoResult)))", "borderVerticalStyle-NoResult": "var(--xmlui-borderVerticalStyle-NoResult, var(--xmlui-borderStyle-NoResult))", "borderTopStyle-NoResult": "var(--xmlui-borderTopStyle-NoResult, var(--xmlui-borderVerticalStyle-NoResult, var(--xmlui-borderStyle-NoResult)))", "borderBottomStyle-NoResult": "var(--xmlui-borderBottomStyle-NoResult, var(--xmlui-borderVerticalStyle-NoResult, var(--xmlui-borderStyle-NoResult)))", "borderColor-NoResult": "var(--xmlui-borderColor-NoResult)", "borderHorizontalColor-NoResult": "var(--xmlui-borderHorizontalColor-NoResult, var(--xmlui-borderColor-NoResult))", "borderLeftColor-NoResult": "var(--xmlui-borderLeftColor-NoResult, var(--xmlui-borderHorizontalColor-NoResult, var(--xmlui-borderColor-NoResult)))", "borderRightColor-NoResult": "var(--xmlui-borderRightColor-NoResult, var(--xmlui-borderHorizontalColor-NoResult, var(--xmlui-borderColor-NoResult)))", "borderVerticalColor-NoResult": "var(--xmlui-borderVerticalColor-NoResult, var(--xmlui-borderColor-NoResult))", "borderTopColor-NoResult": "var(--xmlui-borderTopColor-NoResult, var(--xmlui-borderVerticalColor-NoResult, var(--xmlui-borderColor-NoResult)))", "borderBottomColor-NoResult": "var(--xmlui-borderBottomColor-NoResult, var(--xmlui-borderVerticalColor-NoResult, var(--xmlui-borderColor-NoResult)))", "radius-start-start-NoResult": "var(--xmlui-radius-start-start-NoResult, var(--xmlui-borderRadius-NoResult))", "radius-start-end-NoResult": "var(--xmlui-radius-start-end-NoResult, var(--xmlui-borderRadius-NoResult))", "radius-end-start-NoResult": "var(--xmlui-radius-end-start-NoResult, var(--xmlui-borderRadius-NoResult))", "radius-end-end-NoResult": "var(--xmlui-radius-end-end-NoResult, var(--xmlui-borderRadius-NoResult))", "gap-icon-NoResult": "var(--xmlui-gap-icon-NoResult)", "size-icon-NoResult": "var(--xmlui-size-icon-NoResult)"}'`, ig = {
  themeVars: ag
}, Co = "NoResult", ng = k({
  description: `\`${Co}\` is a component that displays a visual indication that some data query (search) resulted in no (zero) items.`,
  props: {
    label: qe(),
    icon: u("This property defines the icon to display with the component."),
    hideIcon: {
      description: "This boolean property indicates if the icon should be hidden.",
      valueType: "boolean",
      defaultValue: "false"
    }
  },
  themeVars: j(ig.themeVars),
  defaultThemeVars: {
    [`border-${Co}`]: "0px solid $borderColor",
    [`paddingVertical-${Co}`]: "$space-2",
    [`gap-icon-${Co}`]: "$space-2",
    [`size-icon-${Co}`]: "$space-8",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  }
}), _r = "NumberBox", lg = k({
  status: "experimental",
  description: `A \`${_r}\` component allows users to input numeric values: either integer or floating point numbers. It also accepts empty values, where the stored value will be of type \`null\`.`,
  props: {
    placeholder: Er(),
    initialValue: St(),
    label: qe(),
    labelPosition: Dt("top"),
    labelWidth: Zt(_r),
    labelBreak: Jt(_r),
    maxLength: Ao(),
    autoFocus: rt(),
    required: Nt(),
    readOnly: _t(),
    enabled: Ze(),
    validationStatus: At(),
    startText: Ka(),
    startIcon: ei(),
    endText: ti(),
    endIcon: ri(),
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
    gotFocus: Ct(_r),
    lostFocus: kt(_r),
    didChange: tt(_r)
  },
  apis: {
    focus: er(_r),
    value: ia(),
    setValue: Kt()
  },
  themeVars: j(Ke.themeVars)
}), dg = `'{"border-OffCanvas": "var(--xmlui-border-OffCanvas)", "borderHorizontal-OffCanvas": "var(--xmlui-borderHorizontal-OffCanvas, var(--xmlui-border-OffCanvas))", "borderVertical-OffCanvas": "var(--xmlui-borderVertical-OffCanvas, var(--xmlui-border-OffCanvas))", "borderLeft-OffCanvas": "var(--xmlui-borderLeft-OffCanvas, var(--xmlui-borderHorizontal-OffCanvas, var(--xmlui-border-OffCanvas)))", "borderRight-OffCanvas": "var(--xmlui-borderRight-OffCanvas, var(--xmlui-borderHorizontal-OffCanvas, var(--xmlui-border-OffCanvas)))", "borderTop-OffCanvas": "var(--xmlui-borderTop-OffCanvas, var(--xmlui-borderVertical-OffCanvas, var(--xmlui-border-OffCanvas)))", "borderBottom-OffCanvas": "var(--xmlui-borderBottom-OffCanvas, var(--xmlui-borderVertical-OffCanvas, var(--xmlui-border-OffCanvas)))", "borderWidth-OffCanvas": "var(--xmlui-borderWidth-OffCanvas)", "borderHorizontalWidth-OffCanvas": "var(--xmlui-borderHorizontalWidth-OffCanvas, var(--xmlui-borderWidth-OffCanvas))", "borderLeftWidth-OffCanvas": "var(--xmlui-borderLeftWidth-OffCanvas, var(--xmlui-borderHorizontalWidth-OffCanvas, var(--xmlui-borderWidth-OffCanvas)))", "borderRightWidth-OffCanvas": "var(--xmlui-borderRightWidth-OffCanvas, var(--xmlui-borderHorizontalWidth-OffCanvas, var(--xmlui-borderWidth-OffCanvas)))", "borderVerticalWidth-OffCanvas": "var(--xmlui-borderVerticalWidth-OffCanvas, var(--xmlui-borderWidth-OffCanvas))", "borderTopWidth-OffCanvas": "var(--xmlui-borderTopWidth-OffCanvas, var(--xmlui-borderVerticalWidth-OffCanvas, var(--xmlui-borderWidth-OffCanvas)))", "borderBottomWidth-OffCanvas": "var(--xmlui-borderBottomWidth-OffCanvas, var(--xmlui-borderVerticalWidth-OffCanvas, var(--xmlui-borderWidth-OffCanvas)))", "borderStyle-OffCanvas": "var(--xmlui-borderStyle-OffCanvas)", "borderHorizontalStyle-OffCanvas": "var(--xmlui-borderHorizontalStyle-OffCanvas, var(--xmlui-borderStyle-OffCanvas))", "borderLeftStyle-OffCanvas": "var(--xmlui-borderLeftStyle-OffCanvas, var(--xmlui-borderHorizontalStyle-OffCanvas, var(--xmlui-borderStyle-OffCanvas)))", "borderRightStyle-OffCanvas": "var(--xmlui-borderRightStyle-OffCanvas, var(--xmlui-borderHorizontalStyle-OffCanvas, var(--xmlui-borderStyle-OffCanvas)))", "borderVerticalStyle-OffCanvas": "var(--xmlui-borderVerticalStyle-OffCanvas, var(--xmlui-borderStyle-OffCanvas))", "borderTopStyle-OffCanvas": "var(--xmlui-borderTopStyle-OffCanvas, var(--xmlui-borderVerticalStyle-OffCanvas, var(--xmlui-borderStyle-OffCanvas)))", "borderBottomStyle-OffCanvas": "var(--xmlui-borderBottomStyle-OffCanvas, var(--xmlui-borderVerticalStyle-OffCanvas, var(--xmlui-borderStyle-OffCanvas)))", "borderColor-OffCanvas": "var(--xmlui-borderColor-OffCanvas)", "borderHorizontalColor-OffCanvas": "var(--xmlui-borderHorizontalColor-OffCanvas, var(--xmlui-borderColor-OffCanvas))", "borderLeftColor-OffCanvas": "var(--xmlui-borderLeftColor-OffCanvas, var(--xmlui-borderHorizontalColor-OffCanvas, var(--xmlui-borderColor-OffCanvas)))", "borderRightColor-OffCanvas": "var(--xmlui-borderRightColor-OffCanvas, var(--xmlui-borderHorizontalColor-OffCanvas, var(--xmlui-borderColor-OffCanvas)))", "borderVerticalColor-OffCanvas": "var(--xmlui-borderVerticalColor-OffCanvas, var(--xmlui-borderColor-OffCanvas))", "borderTopColor-OffCanvas": "var(--xmlui-borderTopColor-OffCanvas, var(--xmlui-borderVerticalColor-OffCanvas, var(--xmlui-borderColor-OffCanvas)))", "borderBottomColor-OffCanvas": "var(--xmlui-borderBottomColor-OffCanvas, var(--xmlui-borderVerticalColor-OffCanvas, var(--xmlui-borderColor-OffCanvas)))", "radius-start-start-OffCanvas": "var(--xmlui-radius-start-start-OffCanvas, var(--xmlui-borderRadius-OffCanvas))", "radius-start-end-OffCanvas": "var(--xmlui-radius-start-end-OffCanvas, var(--xmlui-borderRadius-OffCanvas))", "radius-end-start-OffCanvas": "var(--xmlui-radius-end-start-OffCanvas, var(--xmlui-borderRadius-OffCanvas))", "radius-end-end-OffCanvas": "var(--xmlui-radius-end-end-OffCanvas, var(--xmlui-borderRadius-OffCanvas))", "padding-OffCanvas": "var(--xmlui-padding-OffCanvas)", "paddingHorizontal-OffCanvas": "var(--xmlui-paddingHorizontal-OffCanvas, var(--xmlui-padding-OffCanvas))", "paddingVertical-OffCanvas": "var(--xmlui-paddingVertical-OffCanvas, var(--xmlui-padding-OffCanvas))", "paddingLeft-OffCanvas": "var(--xmlui-paddingLeft-OffCanvas, var(--xmlui-paddingHorizontal-OffCanvas, var(--xmlui-padding-OffCanvas)))", "paddingRight-OffCanvas": "var(--xmlui-paddingRight-OffCanvas, var(--xmlui-paddingHorizontal-OffCanvas, var(--xmlui-padding-OffCanvas)))", "paddingTop-OffCanvas": "var(--xmlui-paddingTop-OffCanvas, var(--xmlui-paddingVertical-OffCanvas, var(--xmlui-padding-OffCanvas)))", "paddingBottom-OffCanvas": "var(--xmlui-paddingBottom-OffCanvas, var(--xmlui-paddingVertical-OffCanvas, var(--xmlui-padding-OffCanvas)))", "boxShadow-vertical-OffCanvas": "var(--xmlui-boxShadow-vertical-OffCanvas)", "boxShadow-horizontal-OffCanvas": "var(--xmlui-boxShadow-horizontal-OffCanvas)", "backgroundColor-OffCanvas": "var(--xmlui-backgroundColor-OffCanvas)", "width-OffCanvas": "var(--xmlui-width-OffCanvas)", "marginBottom-title-OffCanvas": "var(--xmlui-marginBottom-title-OffCanvas)"}'`, sg = {
  themeVars: dg
}, Mo = "OffCanvas", ug = k({
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
      cs
    ),
    autoCloseInMs: u(
      "This property sets a timeout. When the timeout expires, the component gets hidden."
    )
  },
  events: {
    didOpen: Cs(Mo),
    didClose: ks(Mo)
  },
  apis: {
    open: u(
      "This method opens the component. It triggers the `didOpen` event  with the argument set to `false`."
    ),
    close: u(
      "This method closes the component. It triggers the `didClose` event with the argument set to `false`."
    )
  },
  themeVars: j(sg.themeVars),
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
}), cg = k({
  description: "A PageMetaTitle component allows setting up (or changing) the app title to display with the current browser tab.",
  props: {
    value: u("This property sets the page's title to display in the browser tab.")
  }
}), ln = "Page", mg = k({
  status: "stable",
  docFolder: ln,
  description: `The \`${ln}\` component defines what content is displayed when the user navigates to a particular URL that is associated with the page.`,
  props: {
    //TODO illesg rename to path
    url: u("The URL of the route associated with the content.")
  }
}), pg = "Pages", hg = k({
  description: `The \`${pg}\` component is used as a container for [\`Page\`](./Page.mdx) components within an [\`App\`](./App.mdx).`,
  props: {
    defaultRoute: u("The default route when displaying the app")
  }
}), xg = '"[]"', bg = {
  themeVars: xg
}, vg = k({
  status: "deprecated",
  description: "(**OBSOLETE**) This component was created for the ChatEngine app.",
  props: {
    visibleOnHover: u("No description")
  },
  themeVars: j(bg.themeVars)
}), fg = `'{"backgroundColor-ProgressBar": "var(--xmlui-backgroundColor-ProgressBar)", "color-indicator-ProgressBar": "var(--xmlui-color-indicator-ProgressBar)", "borderRadius-ProgressBar": "var(--xmlui-borderRadius-ProgressBar)", "borderRadius-indicator-ProgressBar": "var(--xmlui-borderRadius-indicator-ProgressBar)", "thickness-ProgressBar": "var(--xmlui-thickness-ProgressBar)"}'`, gg = {
  themeVars: fg
}, mr = "ProgressBar", Tg = k({
  description: `A \`${mr}\` component visually represents the progress of a task or process.`,
  props: {
    value: {
      description: "This property defines the progress value with a number between 0 and 1.",
      valueType: "number",
      defaultValue: 0
    }
  },
  themeVars: j(gg.themeVars),
  defaultThemeVars: {
    [`borderRadius-${mr}`]: "$borderRadius",
    [`borderRadius-indicator-${mr}`]: "0px",
    [`thickness-${mr}`]: "$space-2",
    light: {
      [`backgroundColor-${mr}`]: "$color-surface-200",
      [`color-indicator-${mr}`]: "$color-primary-500"
    },
    dark: {
      [`backgroundColor-${mr}`]: "$color-surface-700",
      [`color-indicator-${mr}`]: "$color-primary-500"
    }
  }
}), yg = k({
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
}), Qr = "RadioGroup", Ae = "RadioGroupOption", Cg = k({
  description: `The \`${Qr}\` input component is a group of radio buttons ([\`RadioGroupOption\`](./RadioGroupOption.mdx) components) that allow users to select only one option from the group at a time.`,
  props: {
    initialValue: St(),
    autoFocus: rt(),
    required: Nt(),
    readOnly: _t(),
    enabled: Ze(),
    validationStatus: At(),
    orientation: u(
      "(*** NOT IMPLEMENTED YET ***) This property sets the orientation of the options within the radio group."
    ),
    label: qe(),
    labelPosition: Dt("top"),
    labelWidth: Zt(Qr),
    labelBreak: Jt(Qr)
  },
  events: {
    gotFocus: Ct(Qr),
    lostFocus: kt(Qr),
    didChange: tt(Qr)
  },
  themeVars: j(nt.themeVars),
  defaultThemeVars: {
    [`gap-${Ae}`]: "$space-1_5",
    [`borderWidth-${Ae}`]: "2px",
    [`backgroundColor-checked-${Ae}--disabled]`]: `$borderColor-${Ae}--disabled`,
    [`backgroundColor-checked-${Ae}-error`]: `$borderColor-${Ae}-error`,
    [`backgroundColor-checked-${Ae}-warning`]: `$borderColor-${Ae}-warning`,
    [`backgroundColor-checked-${Ae}-success`]: `$borderColor-${Ae}-success`,
    [`fontSize-${Ae}`]: "$fontSize-small",
    [`fontWeight-${Ae}`]: "$fontWeight-bold",
    [`textColor-${Ae}-error`]: `$borderColor-${Ae}-error`,
    [`textColor-${Ae}-warning`]: `$borderColor-${Ae}-warning`,
    [`textColor-${Ae}-success`]: `$borderColor-${Ae}-success`,
    light: {
      [`backgroundColor-checked-${Ae}-default`]: "$color-primary-500",
      [`borderColor-${Ae}-default`]: "$color-surface-500",
      [`borderColor-${Ae}-default--hover`]: "$color-surface-700",
      [`borderColor-${Ae}-default--active`]: "$color-primary-500"
    },
    dark: {
      [`backgroundColor-checked-${Ae}-default`]: "$color-primary-500",
      [`borderColor-${Ae}-default`]: "$color-surface-500",
      [`borderColor-${Ae}-default--hover`]: "$color-surface-300",
      [`borderColor-${Ae}-default--active`]: "$color-primary-400"
    }
  }
}), kg = "RealTimeAdapter", Sg = k({
  status: "experimental",
  description: `\`${kg}\` is a non-visual component that listens to real-time events through long-polling.`,
  props: {
    url: u("This property specifies the URL to use for long-polling.")
  },
  events: {
    eventArrived: u("This event is raised when data arrives from the backend using long-polling.")
  }
}), wg = "Redirect", Hg = k({
  description: `\`${wg}\` is a component that immediately redirects the browser to the URL in its \`to\` property when it gets visible (its \`when\` property gets \`true\`). The redirection works only within the app.`,
  props: {
    to: u("This property defines the URL to which this component is about to redirect requests.")
  }
}), we = "Select", Bg = k({
  description: "Provides a dropdown with a list of options to choose from.",
  status: "experimental",
  props: {
    placeholder: Er(),
    initialValue: St(),
    maxLength: Ao(),
    autoFocus: rt(),
    required: Nt(),
    readOnly: _t(),
    enabled: Ze(),
    validationStatus: At(),
    label: qe(),
    labelPosition: Dt("top"),
    labelWidth: Zt(we),
    labelBreak: Jt(we),
    optionLabelTemplate: Ve(
      "This property allows replacing the default template to display an option in the dropdown list."
    ),
    valueTemplate: Ve(
      "This property allows replacing the default template to display a selected value when multiple selections (`multiSelect` is `true`) are enabled."
    ),
    dropdownHeight: u("This property sets the height of the dropdown list."),
    emptyListTemplate: u(
      "This optional property provides the ability to customize what is displayed when the list of options is empty."
    ),
    multiSelect: Xn(),
    searchable: u("This property enables the search functionality in the dropdown list.")
  },
  events: {
    gotFocus: Ct(we),
    lostFocus: kt(we),
    didChange: tt(we)
  },
  apis: {
    focus: er(we),
    setValue: Kt(),
    value: ia()
  },
  contextVars: {
    $item: u("This property represents the value of an item in the dropdown list."),
    $itemContext: u(
      "This property provides a `removeItem` method to delete the particular value from the selection."
    )
  },
  themeVars: j(Se.themeVars),
  defaultThemeVars: {
    [`backgroundColor-menu-${we}`]: "$backgroundColor-primary",
    [`boxShadow-menu-${we}`]: "$boxShadow-md",
    [`borderRadius-menu-${we}`]: "$borderRadius",
    [`borderWidth-menu-${we}`]: "1px",
    [`borderColor-menu-${we}`]: "$borderColor",
    [`backgroundColor-item-${we}`]: "$backgroundColor-dropdown-item",
    [`backgroundColor-item-${we}--hover`]: "$backgroundColor-dropdown-item--active",
    [`backgroundColor-item-${we}--active`]: "$backgroundColor-dropdown-item--active",
    "minHeight-Input": "39px",
    [`backgroundColor-${we}-badge`]: "$color-primary-500",
    [`fontSize-${we}-badge`]: "$fontSize-small",
    [`paddingHorizontal-${we}-badge`]: "$space-1",
    [`paddingVertical-${we}-badge`]: "$space-1",
    [`opacity-text-item-${we}--disabled`]: "0.5",
    [`opacity-${we}--disabled`]: "0.5",
    light: {
      [`backgroundColor-${we}-badge--hover`]: "$color-primary-400",
      [`backgroundColor-${we}-badge--active`]: "$color-primary-500",
      [`textColor-item-${we}--disabled`]: "$color-surface-200",
      [`textColor-${we}-badge`]: "$color-surface-50"
    },
    dark: {
      [`backgroundColor-${we}-badge--hover`]: "$color-primary-600",
      [`backgroundColor-${we}-badge--active`]: "$color-primary-500",
      [`textColor-${we}-badge`]: "$color-surface-50",
      [`textColor-item-${we}--disabled`]: "$color-surface-800"
    }
  }
}), Ig = {
  value: dt
}, $g = ({ children: e }) => {
  const [t, r] = me(Ig);
  return /* @__PURE__ */ m(Lg, { updateState: r, selectedItems: t.value, children: e });
}, Lg = ({
  updateState: e = La,
  idKey: t = "id",
  children: r,
  selectedItems: o = dt,
  registerComponentApi: a = La
}) => {
  const [n, i] = me(o), l = he(!1), s = Le((T = dt) => {
    i(T);
    let b = T.filter((f) => !!o.find((y) => y[t] === f[t]));
    (!od(o, b) || !l.current) && (l.current = !0, e({
      value: b
    }));
  }), v = Le((T) => {
    e({ value: n.filter((b) => T.includes(b[t])) });
  }), x = Le(() => {
    v(dt);
  });
  Io(() => {
    a({
      clearSelection: x,
      setSelectedRowIds: v,
      refreshSelection: s
    });
  }, [x, v, a, s]);
  const c = ce(() => ({
    selectedItems: o,
    setSelectedRowIds: v,
    refreshSelection: s,
    idKey: t
  }), [s, o, v, t]);
  return /* @__PURE__ */ m(Fl.Provider, { value: c, children: r });
}, Fl = Ne.createContext(null);
function Ul() {
  return Lt(Fl);
}
const _g = "SelectionStore", Ag = k({
  status: "deprecated",
  description: `The \`${_g}\` is a non-visual component that may wrap components (items) and manage their selection state to accommodate the usage of other actions.`,
  props: {
    idKey: u(
      'The selected items in the selection store needs to have a unique ID to use as an unambiguous key for that particular item. This property uniquely identifies the selected object item via a given property. By default, the key attribute is `"id"`.'
    )
  }
}), Ng = "SpaceFiller", Wg = k({
  description: `The \`${Ng}\` is a component that works well in layout containers to fill the remaining (unused) space. Its behavior depends on the layout container in which it is used.`,
  themeVars: j(fl.themeVars)
}), ko = "Spinner", Og = k({
  description: `The \`${ko}\` component is an animated indicator that represents a particular action in progress without a deterministic progress value.`,
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
  themeVars: j(Oa.themeVars),
  defaultThemeVars: {
    [`size-${ko}`]: "$space-10",
    [`thickness-${ko}`]: "$space-0_5",
    light: {
      [`borderColor-${ko}`]: "$color-surface-400"
    },
    dark: {
      [`borderColor-${ko}`]: "$color-surface-600"
    }
  }
}), Rg = `'{"boxShadow-Splitter": "var(--xmlui-boxShadow-Splitter)", "backgroundColor-Splitter": "var(--xmlui-backgroundColor-Splitter)", "borderRadius-Splitter": "var(--xmlui-borderRadius-Splitter)", "borderColor-Splitter": "var(--xmlui-borderColor-Splitter)", "borderWidth-Splitter": "var(--xmlui-borderWidth-Splitter)", "borderStyle-Splitter": "var(--xmlui-borderStyle-Splitter)", "border-Splitter": "var(--xmlui-border-Splitter)", "backgroundColor-resizer-Splitter": "var(--xmlui-backgroundColor-resizer-Splitter)", "thickness-resizer-Splitter": "var(--xmlui-thickness-resizer-Splitter)", "cursor-resizer-horizontal-Splitter": "var(--xmlui-cursor-resizer-horizontal-Splitter)", "cursor-resizer-vertical-Splitter": "var(--xmlui-cursor-resizer-vertical-Splitter)"}'`, zg = {
  themeVars: Rg
}, fr = "Splitter", oa = k({
  description: `The \`${fr}\` component divides a container (such as a window, panel, pane, etc.) into two resizable sections.`,
  props: {
    swapped: {
      description: `This optional booelan property indicates whether the \`${fr}\` sections are layed out as primary and secondary (\`false\`) or secondary and primary (\`true\`) from left to right.`,
      valueType: "boolean",
      defaultValue: !1
    },
    splitterTemplate: Ve(
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
  themeVars: j(zg.themeVars),
  defaultThemeVars: {
    [`backgroundColor-resizer-${fr}`]: "$backgroundColor-Card",
    [`thickness-resizer-${fr}`]: "5px",
    [`cursor-resizer-horizontal-${fr}`]: "ew-resize",
    [`cursor-resizer-vertical-${fr}`]: "ns-resize"
  }
}), Vg = {
  ...oa,
  props: {
    ...oa.props
  }
}, Eg = { ...oa, specializedFrom: fr }, Pg = { ...oa, specializedFrom: fr }, Dg = '"[]"', Mg = {
  themeVars: Dg
}, dn = "StickyBox", Fg = k({
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
  themeVars: j(Mg.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${dn}`]: "$backgroundColor"
  }
}), Ce = "Switch", Ug = k({
  description: `The \`${Ce}\` component is a user interface element that allows users to toggle between two states: on and off. It consists of a small rectangular or circular button that can be moved left or right to change its state.`,
  props: {
    indeterminate: Yn(Et.indeterminate),
    label: qe(),
    labelPosition: Dt("end"),
    labelWidth: Zt(Ce),
    labelBreak: Jt(Ce),
    required: Nt(),
    initialValue: St(Et.initialValue),
    autoFocus: rt(),
    readOnly: _t(),
    enabled: Ze(),
    validationStatus: At(Et.validationStatus),
    description: Fe(
      `(*** NOT IMPLEMENTED YET ***) This optional property displays an alternate description of the ${Ce} besides its label.`
    )
  },
  events: {
    gotFocus: Ct(Ce),
    lostFocus: kt(Ce),
    didChange: tt(Ce)
  },
  apis: {
    value: jn(),
    setValue: Kt()
  },
  themeVars: j(qt.themeVars),
  defaultThemeVars: {
    [`borderColor-checked-${Ce}-error`]: `$borderColor-${Ce}-error`,
    [`backgroundColor-checked-${Ce}-error`]: `$borderColor-${Ce}-error`,
    [`borderColor-checked-${Ce}-warning`]: `$borderColor-${Ce}-warning`,
    [`backgroundColor-checked-${Ce}-warning`]: `$borderColor-${Ce}-warning`,
    [`borderColor-checked-${Ce}-success`]: `$borderColor-${Ce}-success`,
    [`backgroundColor-checked-${Ce}-success`]: `$borderColor-${Ce}-success`,
    light: {
      [`backgroundColor-${Ce}`]: "$color-surface-400",
      [`borderColor-${Ce}`]: "$color-surface-400",
      [`backgroundColor-indicator-${Ce}`]: "$backgroundColor-primary",
      [`borderColor-checked-${Ce}`]: "$color-primary-500",
      [`backgroundColor-checked-${Ce}`]: "$color-primary-500",
      [`backgroundColor-${Ce}--disabled`]: "$color-surface-200"
    },
    dark: {
      [`backgroundColor-${Ce}`]: "$color-surface-500",
      [`borderColor-${Ce}`]: "$color-surface-500",
      [`backgroundColor-indicator-${Ce}`]: "$backgroundColor-primary",
      [`borderColor-checked-${Ce}`]: "$color-primary-400",
      [`backgroundColor-checked-${Ce}`]: "$color-primary-400",
      [`backgroundColor-${Ce}--disabled`]: "$color-surface-800"
    }
  }
}), qg = `'{"textColor-pagination-Table": "var(--xmlui-textColor-pagination-Table)", "backgroundColor-Table": "var(--xmlui-backgroundColor-Table)", "textColor-Table": "var(--xmlui-textColor-Table)", "backgroundColor-row-Table": "var(--xmlui-backgroundColor-row-Table)", "backgroundColor-row-Table--hover": "var(--xmlui-backgroundColor-row-Table--hover)", "backgroundColor-selected-Table": "var(--xmlui-backgroundColor-selected-Table)", "backgroundColor-selected-Table--hover": "var(--xmlui-backgroundColor-selected-Table--hover)", "backgroundColor-heading-Table": "var(--xmlui-backgroundColor-heading-Table)", "backgroundColor-heading-Table--hover": "var(--xmlui-backgroundColor-heading-Table--hover)", "backgroundColor-heading-Table--active": "var(--xmlui-backgroundColor-heading-Table--active)", "padding-heading-Table": "var(--xmlui-padding-heading-Table)", "paddingHorizontal-heading-Table": "var(--xmlui-paddingHorizontal-heading-Table, var(--xmlui-padding-heading-Table))", "paddingVertical-heading-Table": "var(--xmlui-paddingVertical-heading-Table, var(--xmlui-padding-heading-Table))", "paddingLeft-heading-Table": "var(--xmlui-paddingLeft-heading-Table, var(--xmlui-paddingHorizontal-heading-Table, var(--xmlui-padding-heading-Table)))", "paddingRight-heading-Table": "var(--xmlui-paddingRight-heading-Table, var(--xmlui-paddingHorizontal-heading-Table, var(--xmlui-padding-heading-Table)))", "paddingTop-heading-Table": "var(--xmlui-paddingTop-heading-Table, var(--xmlui-paddingVertical-heading-Table, var(--xmlui-padding-heading-Table)))", "paddingBottom-heading-Table": "var(--xmlui-paddingBottom-heading-Table, var(--xmlui-paddingVertical-heading-Table, var(--xmlui-padding-heading-Table)))", "padding-cell-Table": "var(--xmlui-padding-cell-Table)", "paddingHorizontal-cell-Table": "var(--xmlui-paddingHorizontal-cell-Table, var(--xmlui-padding-cell-Table))", "paddingVertical-cell-Table": "var(--xmlui-paddingVertical-cell-Table, var(--xmlui-padding-cell-Table))", "paddingLeft-cell-Table": "var(--xmlui-paddingLeft-cell-Table, var(--xmlui-paddingHorizontal-cell-Table, var(--xmlui-padding-cell-Table)))", "paddingRight-cell-Table": "var(--xmlui-paddingRight-cell-Table, var(--xmlui-paddingHorizontal-cell-Table, var(--xmlui-padding-cell-Table)))", "paddingTop-cell-Table": "var(--xmlui-paddingTop-cell-Table, var(--xmlui-paddingVertical-cell-Table, var(--xmlui-padding-cell-Table)))", "paddingBottom-cell-Table": "var(--xmlui-paddingBottom-cell-Table, var(--xmlui-paddingVertical-cell-Table, var(--xmlui-padding-cell-Table)))", "paddingHorizontal-cell-first-Table": "var(--xmlui-paddingHorizontal-cell-first-Table)", "paddingHorizontal-cell-last-Table": "var(--xmlui-paddingHorizontal-cell-last-Table)", "border-cell-Table": "var(--xmlui-border-cell-Table)", "borderHorizontal-cell-Table": "var(--xmlui-borderHorizontal-cell-Table, var(--xmlui-border-cell-Table))", "borderVertical-cell-Table": "var(--xmlui-borderVertical-cell-Table, var(--xmlui-border-cell-Table))", "borderLeft-cell-Table": "var(--xmlui-borderLeft-cell-Table, var(--xmlui-borderHorizontal-cell-Table, var(--xmlui-border-cell-Table)))", "borderRight-cell-Table": "var(--xmlui-borderRight-cell-Table, var(--xmlui-borderHorizontal-cell-Table, var(--xmlui-border-cell-Table)))", "borderTop-cell-Table": "var(--xmlui-borderTop-cell-Table, var(--xmlui-borderVertical-cell-Table, var(--xmlui-border-cell-Table)))", "borderBottom-cell-Table": "var(--xmlui-borderBottom-cell-Table)", "borderWidth-cell-Table": "var(--xmlui-borderWidth-cell-Table)", "borderHorizontalWidth-cell-Table": "var(--xmlui-borderHorizontalWidth-cell-Table, var(--xmlui-borderWidth-cell-Table))", "borderLeftWidth-cell-Table": "var(--xmlui-borderLeftWidth-cell-Table, var(--xmlui-borderHorizontalWidth-cell-Table, var(--xmlui-borderWidth-cell-Table)))", "borderRightWidth-cell-Table": "var(--xmlui-borderRightWidth-cell-Table, var(--xmlui-borderHorizontalWidth-cell-Table, var(--xmlui-borderWidth-cell-Table)))", "borderVerticalWidth-cell-Table": "var(--xmlui-borderVerticalWidth-cell-Table, var(--xmlui-borderWidth-cell-Table))", "borderTopWidth-cell-Table": "var(--xmlui-borderTopWidth-cell-Table, var(--xmlui-borderVerticalWidth-cell-Table, var(--xmlui-borderWidth-cell-Table)))", "borderBottomWidth-cell-Table": "var(--xmlui-borderBottomWidth-cell-Table, var(--xmlui-borderVerticalWidth-cell-Table, var(--xmlui-borderWidth-cell-Table)))", "borderStyle-cell-Table": "var(--xmlui-borderStyle-cell-Table)", "borderHorizontalStyle-cell-Table": "var(--xmlui-borderHorizontalStyle-cell-Table, var(--xmlui-borderStyle-cell-Table))", "borderLeftStyle-cell-Table": "var(--xmlui-borderLeftStyle-cell-Table, var(--xmlui-borderHorizontalStyle-cell-Table, var(--xmlui-borderStyle-cell-Table)))", "borderRightStyle-cell-Table": "var(--xmlui-borderRightStyle-cell-Table, var(--xmlui-borderHorizontalStyle-cell-Table, var(--xmlui-borderStyle-cell-Table)))", "borderVerticalStyle-cell-Table": "var(--xmlui-borderVerticalStyle-cell-Table, var(--xmlui-borderStyle-cell-Table))", "borderTopStyle-cell-Table": "var(--xmlui-borderTopStyle-cell-Table, var(--xmlui-borderVerticalStyle-cell-Table, var(--xmlui-borderStyle-cell-Table)))", "borderBottomStyle-cell-Table": "var(--xmlui-borderBottomStyle-cell-Table, var(--xmlui-borderVerticalStyle-cell-Table, var(--xmlui-borderStyle-cell-Table)))", "borderColor-cell-Table": "var(--xmlui-borderColor-cell-Table)", "borderHorizontalColor-cell-Table": "var(--xmlui-borderHorizontalColor-cell-Table, var(--xmlui-borderColor-cell-Table))", "borderLeftColor-cell-Table": "var(--xmlui-borderLeftColor-cell-Table, var(--xmlui-borderHorizontalColor-cell-Table, var(--xmlui-borderColor-cell-Table)))", "borderRightColor-cell-Table": "var(--xmlui-borderRightColor-cell-Table, var(--xmlui-borderHorizontalColor-cell-Table, var(--xmlui-borderColor-cell-Table)))", "borderVerticalColor-cell-Table": "var(--xmlui-borderVerticalColor-cell-Table, var(--xmlui-borderColor-cell-Table))", "borderTopColor-cell-Table": "var(--xmlui-borderTopColor-cell-Table, var(--xmlui-borderVerticalColor-cell-Table, var(--xmlui-borderColor-cell-Table)))", "borderBottomColor-cell-Table": "var(--xmlui-borderBottomColor-cell-Table, var(--xmlui-borderVerticalColor-cell-Table, var(--xmlui-borderColor-cell-Table)))", "radius-start-start-cell-Table": "var(--xmlui-radius-start-start-cell-Table, var(--xmlui-borderRadius-cell-Table))", "radius-start-end-cell-Table": "var(--xmlui-radius-start-end-cell-Table, var(--xmlui-borderRadius-cell-Table))", "radius-end-start-cell-Table": "var(--xmlui-radius-end-start-cell-Table, var(--xmlui-borderRadius-cell-Table))", "radius-end-end-cell-Table": "var(--xmlui-radius-end-end-cell-Table, var(--xmlui-borderRadius-cell-Table))", "backgroundColor-pagination-Table": "var(--xmlui-backgroundColor-pagination-Table)", "textColor-heading-Table": "var(--xmlui-textColor-heading-Table)", "fontWeight-row-Table": "var(--xmlui-fontWeight-row-Table)", "fontSize-row-Table": "var(--xmlui-fontSize-row-Table)", "fontWeight-heading-Table": "var(--xmlui-fontWeight-heading-Table)", "fontSize-heading-Table": "var(--xmlui-fontSize-heading-Table)", "textTransform-heading-Table": "var(--xmlui-textTransform-heading-Table)", "outlineWidth-heading-Table--focus": "var(--xmlui-outlineWidth-heading-Table--focus)", "outlineColor-heading-Table--focus": "var(--xmlui-outlineColor-heading-Table--focus)", "outlineStyle-heading-Table--focus": "var(--xmlui-outlineStyle-heading-Table--focus)", "outlineOffset-heading-Table--focus": "var(--xmlui-outlineOffset-heading-Table--focus)"}'`, Gg = "_wrapper_1wfr8_13", Yg = "_noScroll_1wfr8_19", Xg = "_headerWrapper_1wfr8_23", jg = "_tableBody_1wfr8_23", Qg = "_clickableHeader_1wfr8_29", Zg = "_headerContent_1wfr8_43", Jg = "_headerRow_1wfr8_76", Kg = "_columnCell_1wfr8_81", eT = "_cell_1wfr8_81", tT = "_table_1wfr8_23", rT = "_row_1wfr8_93", oT = "_checkBoxWrapper_1wfr8_99", aT = "_showInHeader_1wfr8_103", iT = "_selected_1wfr8_106", nT = "_allSelected_1wfr8_106", lT = "_focused_1wfr8_152", dT = "_disabled_1wfr8_164", sT = "_noRows_1wfr8_193", uT = "_pagination_1wfr8_199", cT = "_paginationLabel_1wfr8_215", mT = "_paginationSelect_1wfr8_220", pT = "_paginationButtons_1wfr8_226", hT = "_loadingWrapper_1wfr8_238", xT = "_resizer_1wfr8_253", bT = "_isResizing_1wfr8_275", Be = {
  themeVars: qg,
  wrapper: Gg,
  noScroll: Yg,
  headerWrapper: Xg,
  tableBody: jg,
  clickableHeader: Qg,
  headerContent: Zg,
  headerRow: Jg,
  columnCell: Kg,
  cell: eT,
  table: tT,
  row: rT,
  checkBoxWrapper: oT,
  showInHeader: aT,
  selected: iT,
  allSelected: nT,
  focused: lT,
  disabled: dT,
  noRows: sT,
  pagination: uT,
  paginationLabel: cT,
  paginationSelect: mT,
  paginationButtons: pT,
  loadingWrapper: hT,
  resizer: xT,
  isResizing: bT
}, sn = Qt({
  registerColumn: (e, t) => {
  },
  unRegisterColumn: (e) => {
  }
});
function vT(e) {
  return xo({ attr: { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, child: [{ tag: "polyline", attr: { points: "15 18 9 12 15 6" } }] })(e);
}
function fT(e) {
  return xo({ attr: { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, child: [{ tag: "polyline", attr: { points: "9 18 15 12 9 6" } }] })(e);
}
function gT(e) {
  return xo({ attr: { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, child: [{ tag: "polyline", attr: { points: "11 17 6 12 11 7" } }, { tag: "polyline", attr: { points: "18 17 13 12 18 7" } }] })(e);
}
function TT(e) {
  return xo({ attr: { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, child: [{ tag: "polyline", attr: { points: "13 17 18 12 13 7" } }, { tag: "polyline", attr: { points: "6 17 11 12 6 7" } }] })(e);
}
function yT({
  items: e = dt,
  visibleItems: t = e,
  rowsSelectable: r,
  enableMultiRowSelection: o,
  onSelectionDidChange: a
}) {
  const [n, i] = me(-1), [l, s] = me(null), { selectedItems: v, setSelectedRowIds: x, refreshSelection: c, idKey: T } = Ul(), b = ce(() => t.map((O) => O[T]), [T, t]);
  ee(() => {
    c(r ? e : dt);
  }, [c, e, r]);
  const f = Kn(o);
  ee(() => {
    f && !o && v.length > 1 && x([v[0][T]]);
  }, [
    o,
    T,
    f,
    v,
    x
  ]), ee(() => {
    r && n !== -1 && !b[n] && b[0] && i(0);
  }, [n, r, i, b]);
  const y = Le(
    // targetIndex: the item affected by an event
    // options: key event options
    (O, h = {}) => {
      if (!r)
        return;
      const p = b[O], { shiftKey: g, metaKey: C, ctrlKey: L } = h, q = !o || !g && !C && !L;
      let z, A = [...v.map((B) => B[T])];
      if (q)
        z = {
          from: p,
          to: p
        }, A = [p];
      else if (g) {
        let B, P, M, E;
        if (l) {
          let Q = b.indexOf(l.from), K = b.indexOf(l.to), te = Math.min(Q, K), be = Math.max(Q, K);
          const Me = b.slice(te, be + 1);
          A = A.filter(
            (oe) => !Me.includes(oe)
          ), M = l.from, E = p;
          let We = b.indexOf(M), ie = b.indexOf(E);
          B = Math.min(We, ie), P = Math.max(We, ie);
        } else
          M = p, E = p, B = O, P = O;
        const G = b.slice(B, P + 1);
        A = ad(A, G), z = {
          from: M,
          to: E
        };
      } else
        z = {
          from: p,
          to: p
        }, C || L ? A.includes(p) ? A = A.filter(
          (B) => B !== p
        ) : A.push(p) : A = [p];
      i(O), x(id(A)), s(z);
    }
  ), w = Le((O, h) => {
    if (!r)
      return;
    const p = b.indexOf(O[T]);
    y(p, h);
  }), _ = Le((O) => {
    if (r) {
      if (O.key === "ArrowDown") {
        O.preventDefault();
        let h = Math.min(t.length - 1, n + 1);
        n !== t.length - 1 && y(h, O);
      }
      if (O.key === "PageDown") {
        O.preventDefault();
        const h = Math.min(t.length - 1, n + 8);
        y(h, O);
      }
      if (O.key === "ArrowUp") {
        O.preventDefault();
        let h = Math.max(0, n - 1);
        n >= 0 && y(h, O);
      }
      if (O.key === "PageUp") {
        O.preventDefault();
        const h = Math.max(0, n - 8);
        y(h, O);
      }
    }
  });
  ee(() => {
    a == null || a(v);
  }, [v, a]);
  const H = Le((O) => {
    r && (!o && O || x(O ? e.map((h) => h[T]) : []));
  }), I = ce(() => {
    let O = {};
    return v.forEach((h) => {
      O[h[T]] = !0;
    }), O;
  }, [T, v]), R = X(() => v, [v]), F = X(() => v.map((O) => O[T]), [T, v]), Z = X(() => {
    H(!1);
  }, [H]), V = X(() => {
    H(!0);
  }, [H]), W = X(
    (O) => {
      if (!r)
        return;
      let h = Array.isArray(O) ? O : [O];
      h.length > 1 && !o && (h = [h[0]]), x(h);
    },
    [o, r, x]
  ), N = ce(() => ({
    getSelectedItems: R,
    getSelectedIds: F,
    clearSelection: Z,
    selectAll: V,
    selectId: W
  }), [Z, F, R, V, W]);
  return {
    onKeyDown: _,
    focusedIndex: n,
    toggleRowIndex: y,
    toggleRow: w,
    checkAllRows: H,
    selectedRowIdMap: I,
    selectedItems: v,
    idKey: T,
    selectionApi: N
  };
}
function CT(e) {
  return !1;
}
const kT = 42, ST = [10], un = (e) => {
  const t = e.getIsPinned();
  return {
    // boxShadow: isLastLeftPinnedColumn
    //   ? "-4px 0 4px -4px gray inset"
    //   : isFirstRightPinnedColumn
    //   ? "4px 0 4px -4px gray inset"
    //   : undefined,
    left: t === "left" ? `${e.getStart("left")}px` : void 0,
    right: t === "right" ? `${e.getAfter("right")}px` : void 0,
    opacity: t ? 0.95 : void 0,
    position: t ? "sticky" : "relative",
    backgroundColor: t ? "inherit" : void 0,
    zIndex: t ? 1 : void 0
  };
}, wT = ve(
  ({
    data: e = dt,
    columns: t = dt,
    isPaginated: r = !1,
    loading: o = !1,
    headerHeight: a,
    rowsSelectable: n = !1,
    enableMultiRowSelection: i = !0,
    pageSizes: l = ST,
    rowDisabledPredicate: s = CT,
    sortBy: v,
    sortingDirection: x = "ascending",
    iconSortAsc: c,
    iconSortDesc: T,
    iconNoSort: b,
    sortingDidChange: f,
    willSort: y,
    style: w,
    noDataRenderer: _,
    autoFocus: H = !1,
    hideHeader: I = !1,
    hideNoDataView: R = !1,
    alwaysShowSelectionHeader: F = !1,
    registerComponentApi: Z,
    onSelectionDidChange: V
    // cols
  }, W) => {
    var mi, pi, hi, xi;
    const { getThemeVar: N } = tr(), O = Array.isArray(e) ? e : dt, h = he(null), p = W ? sr(h, W) : h, g = he(null), C = he(null), L = v !== void 0, q = ce(() => t || (O.length ? Object.keys(O[0]).map((ne) => ({ header: ne, accessorKey: ne })) : dt), [t, O]);
    ee(() => {
      H && h.current.focus();
    }, [H]);
    const [z, A] = me(dt), {
      toggleRow: B,
      checkAllRows: P,
      focusedIndex: M,
      onKeyDown: E,
      selectedRowIdMap: G,
      idKey: Q,
      selectionApi: K
    } = yT({
      items: O,
      visibleItems: z,
      rowsSelectable: n,
      enableMultiRowSelection: i,
      onSelectionDidChange: V
    }), te = ce(() => O.map((ne, ye) => ({
      ...ne,
      order: ye + 1
    })), [O]), [be, Me] = me(v), [We, ie] = me(x);
    Io(() => {
      Me(v);
    }, [v]), Io(() => {
      ie(x);
    }, [x]);
    const oe = ce(() => !be || L ? te : nd(te, be, We === "ascending" ? "asc" : "desc"), [be, We, te, L]), Y = X(
      async (ne) => {
        let ye = "ascending", ue = ne;
        be === ne && (We === "ascending" ? ye = "descending" : ue = void 0), await (y == null ? void 0 : y(ue, ye)) !== !1 && (ie(ye), Me(ue), f == null || f(ue, ye));
      },
      [be, y, f, We]
    ), D = ce(() => q.map((ne, ye) => {
      const { width: ue, starSizedWidth: Te } = wt(ne.width, !0, "width"), { width: ct } = wt(ne.minWidth, !1, "minWidth"), { width: Re } = wt(ne.maxWidth, !1, "maxWidth");
      return {
        ...ne,
        header: ne.header ?? ne.accessorKey ?? " ",
        id: "col_" + ye,
        size: ue,
        minSize: ct,
        maxSize: Re,
        enableResizing: ne.canResize,
        enableSorting: ne.canSort,
        enablePinning: ne.pinTo !== void 0,
        meta: {
          starSizedWidth: Te,
          pinTo: ne.pinTo,
          style: ne.style,
          accessorKey: ne.accessorKey,
          cellRenderer: ne.cellRenderer
        }
      };
      function wt(mt, Mt, Xl) {
        let go, zo;
        const wr = hc(mt) ? N(mt) : mt;
        if (typeof wr == "number")
          zo = wr;
        else if (typeof wr == "string") {
          const jl = wr.match(/^\s*\*\s*$/);
          if (Mt && jl)
            go = "1*";
          else {
            const bi = wr.match(/^\s*(\d+)\s*\*\s*$/);
            if (Mt && bi)
              go = bi[1] + "*";
            else {
              const vi = wr.match(/^\s*(\d+)\s*(px)?\s*$/);
              if (vi)
                zo = Number(vi[1]);
              else
                throw new Error(`Invalid TableColumnDef '${Xl}' value: ${wr}`);
            }
          }
        }
        return zo === void 0 && go === void 0 && Mt && (go = "1*"), { width: zo, starSizedWidth: go };
      }
    }), [N, q]), se = ce(() => n ? [{
      id: "select",
      size: kT,
      enableResizing: !1,
      enablePinning: !0,
      meta: {
        pinTo: "left"
      },
      header: ({ table: ye }) => i ? /* @__PURE__ */ m(
        Ea,
        {
          className: le(Be.checkBoxWrapper, {
            [Be.showInHeader]: F
          }),
          value: ye.getIsAllRowsSelected(),
          indeterminate: ye.getIsSomeRowsSelected(),
          onDidChange: (ue) => {
            P(ue);
          }
        }
      ) : null,
      cell: ({ row: ye }) => /* @__PURE__ */ m(
        Ea,
        {
          className: Be.checkBoxWrapper,
          value: ye.getIsSelected(),
          indeterminate: ye.getIsSomeSelected(),
          onDidChange: () => {
            B(ye.original, { metaKey: !0 });
          }
        }
      )
    }, ...D] : D, [
      n,
      D,
      i,
      F,
      P,
      B
    ]), [_e, kr] = me({
      pageSize: r ? l[0] : Number.MAX_VALUE,
      pageIndex: 0
    }), Qe = Kn(r);
    ee(() => {
      !Qe && r && kr((ne) => ({
        ...ne,
        pageSize: l[0]
      })), Qe && !r && kr((ne) => ({
        pageIndex: 0,
        pageSize: Number.MAX_VALUE
      }));
    }, [r, l, Qe]);
    const [Ur, Sr] = me({}), vo = ce(() => {
      const ne = [], ye = [];
      return se.forEach((ue) => {
        var Te, ct;
        ((Te = ue.meta) == null ? void 0 : Te.pinTo) === "right" && ye.push(ue.id), ((ct = ue.meta) == null ? void 0 : ct.pinTo) === "left" && ne.push(ue.id);
      }), {
        left: ne,
        right: ye
      };
    }, [se]), Oe = Ld({
      columns: se,
      data: oe,
      getCoreRowModel: Ad(),
      getPaginationRowModel: r ? _d() : void 0,
      enableRowSelection: n,
      enableMultiRowSelection: i,
      columnResizeMode: "onChange",
      getRowId: X(
        (ne) => ne[Q] + "",
        [Q]
      ),
      state: ce(
        () => ({
          pagination: _e,
          rowSelection: G,
          columnSizing: Ur,
          columnPinning: vo
        }),
        [vo, Ur, _e, G]
      ),
      onColumnSizingChange: Sr,
      onPaginationChange: kr
    }), Ge = Oe.getRowModel().rows;
    ee(() => {
      A(Ge.map((ne) => ne.original));
    }, [Ge]);
    const Ye = Lt(gc), fo = Ye && (w == null ? void 0 : w.maxHeight) === void 0 && (w == null ? void 0 : w.height) === void 0 && (w == null ? void 0 : w.flex) === void 0, Yl = X(
      (ne, ye) => Nd(ne, (ue, Te) => {
        var Re;
        const ct = fo && ((Re = h.current) == null ? void 0 : Re.offsetTop) || 0;
        ye(ue - ct, Te);
      }),
      [fo]
    ), ur = Wd({
      count: Ge.length,
      getScrollElement: X(() => fo && (Ye != null && Ye.current) ? Ye == null ? void 0 : Ye.current : h.current, [Ye, fo]),
      observeElementOffset: Yl,
      estimateSize: X(() => C.current || 30, []),
      overscan: 5
    }), si = ur.getVirtualItems().length > 0 && ((pi = (mi = ur.getVirtualItems()) == null ? void 0 : mi[0]) == null ? void 0 : pi.start) || 0, ui = ur.getVirtualItems().length > 0 ? ur.getTotalSize() - (((xi = (hi = ur.getVirtualItems()) == null ? void 0 : hi[ur.getVirtualItems().length - 1]) == null ? void 0 : xi.end) || 0) : 0, Oo = O.length !== 0, da = he({}), ci = X((ne) => {
      da.current[ne] = !0;
    }, []), Ro = Le(() => {
      if (!g.current)
        return;
      let ne = g.current.clientWidth - 1;
      const ye = {}, ue = [], Te = {};
      Oe.getAllColumns().forEach((Re) => {
        var rr, wt;
        if (Re.columnDef.size !== void 0 || da.current[Re.id])
          ne -= Ur[Re.id] || Re.columnDef.size || 0;
        else {
          ue.push(Re);
          let mt;
          (rr = Re.columnDef.meta) != null && rr.starSizedWidth ? mt = Number((wt = Re.columnDef.meta) == null ? void 0 : wt.starSizedWidth.replace("*", "").trim()) || 1 : mt = 1, Te[Re.id] = mt;
        }
      });
      const ct = Object.values(Te).reduce((Re, rr) => Re + rr, 0);
      ue.forEach((Re) => {
        ye[Re.id] = Math.floor(
          ne * (Te[Re.id] / ct)
        );
      }), An(() => {
        Sr((Re) => ({
          ...Re,
          ...ye
        }));
      });
    });
    return $s(g, Ro), Lo(() => {
      queueMicrotask(() => {
        Ro();
      });
    }, [Ro, q]), Lo(() => {
      Z(K);
    }, [Z, K]), /* @__PURE__ */ J(
      "div",
      {
        className: le(Be.wrapper, { [Be.noScroll]: fo }),
        tabIndex: -1,
        onKeyDown: E,
        ref: p,
        style: w,
        children: [
          /* @__PURE__ */ J(
            "table",
            {
              className: Be.table,
              ref: g,
              style: { borderRight: "1px solid transparent" },
              children: [
                !I && /* @__PURE__ */ m("thead", { style: { height: a }, className: Be.headerWrapper, children: Oe.getHeaderGroups().map((ne, ye) => /* @__PURE__ */ m(
                  "tr",
                  {
                    className: le(Be.headerRow, {
                      [Be.allSelected]: Oe.getIsAllRowsSelected()
                    }),
                    children: ne.headers.map((ue, Te) => {
                      var wt, mt;
                      const { width: ct, ...Re } = ((wt = ue.column.columnDef.meta) == null ? void 0 : wt.style) || {}, rr = ue.getSize();
                      return /* @__PURE__ */ J(
                        "th",
                        {
                          className: Be.columnCell,
                          colSpan: ue.colSpan,
                          style: {
                            position: "relative",
                            width: rr,
                            ...un(ue.column)
                          },
                          children: [
                            /* @__PURE__ */ m(
                              HT,
                              {
                                hasSorting: ue.column.columnDef.enableSorting,
                                updateSorting: () => {
                                  var Mt;
                                  return Y((Mt = ue.column.columnDef.meta) == null ? void 0 : Mt.accessorKey);
                                },
                                children: /* @__PURE__ */ J("div", { className: Be.headerContent, style: Re, children: [
                                  Ti(
                                    ue.column.columnDef.header,
                                    ue.getContext()
                                  ),
                                  /* @__PURE__ */ m("span", { style: { display: "inline-flex", maxWidth: 16 }, children: ue.column.columnDef.enableSorting && /* @__PURE__ */ m(
                                    BT,
                                    {
                                      iconSortAsc: c,
                                      iconSortDesc: T,
                                      iconNoSort: b,
                                      direction: ((mt = ue.column.columnDef.meta) == null ? void 0 : mt.accessorKey) === be ? We : void 0
                                    }
                                  ) })
                                ] })
                              }
                            ),
                            ue.column.getCanResize() && /* @__PURE__ */ m(
                              "div",
                              {
                                onDoubleClick: () => {
                                  da.current[ue.column.id] = !1, ue.column.columnDef.size !== void 0 ? ue.column.resetSize() : Ro();
                                },
                                onMouseDown: (Mt) => {
                                  ci(ue.column.id), ue.getResizeHandler()(Mt);
                                },
                                onTouchStart: (Mt) => {
                                  ci(ue.column.id), ue.getResizeHandler()(Mt);
                                },
                                className: le(Be.resizer, {
                                  [Be.isResizing]: ue.column.getIsResizing()
                                })
                              }
                            )
                          ]
                        },
                        `${ue.id}-${Te}`
                      );
                    })
                  },
                  `${ne.id}-${ye}`
                )) }),
                Oo && /* @__PURE__ */ J("tbody", { className: Be.tableBody, children: [
                  si > 0 && /* @__PURE__ */ m("tr", { children: /* @__PURE__ */ m("td", { style: { height: `${si}px` } }) }),
                  ur.getVirtualItems().map((ne) => {
                    const ye = ne.index, ue = Ge[ye];
                    return /* @__PURE__ */ m(
                      "tr",
                      {
                        "data-index": ye,
                        className: le(Be.row, {
                          [Be.selected]: ue.getIsSelected(),
                          [Be.focused]: M === ye,
                          [Be.disabled]: s(ue.original)
                        }),
                        ref: (Te) => {
                          Te && C.current === null && (C.current = Math.round(Te.getBoundingClientRect().height)), ur.measureElement(Te);
                        },
                        onClick: (Te) => {
                          Te.defaultPrevented || Te.target.tagName.toLowerCase() === "input" || B(ue.original, Te);
                        },
                        children: ue.getVisibleCells().map((Te, ct) => {
                          var wt, mt;
                          const Re = (mt = (wt = Te.column.columnDef) == null ? void 0 : wt.meta) == null ? void 0 : mt.cellRenderer, rr = Te.column.getSize();
                          return /* @__PURE__ */ m(
                            "td",
                            {
                              className: Be.cell,
                              style: {
                                // width: size,
                                width: rr,
                                ...un(Te.column)
                              },
                              children: Re ? Re(Te.row.original, ye, ct, Te == null ? void 0 : Te.getValue()) : Ti(
                                Te.column.columnDef.cell,
                                Te.getContext()
                              )
                            },
                            `${Te.id}-${ct}`
                          );
                        })
                      },
                      `${ue.id}-${ye}`
                    );
                  }),
                  ui > 0 && /* @__PURE__ */ m("tr", { children: /* @__PURE__ */ m("td", { style: { height: `${ui}px` } }) })
                ] })
              ]
            }
          ),
          o && !Oo && /* @__PURE__ */ m("div", { className: Be.loadingWrapper, children: /* @__PURE__ */ m(il, {}) }),
          !R && !o && !Oo && (_ ? _() : /* @__PURE__ */ m("div", { className: Be.noRows, children: "No data available" })),
          r && Oo && Ge.length > 0 && _e && // --- Render the pagination controls
          /* @__PURE__ */ J("div", { className: Be.pagination, children: [
            /* @__PURE__ */ m("div", { style: { flex: 1 }, children: /* @__PURE__ */ J("span", { className: Be.paginationLabel, children: [
              "Showing ",
              Ge[0].original.order,
              " to ",
              Ge[Ge.length - 1].original.order,
              " of",
              " ",
              O.length,
              " entries"
            ] }) }),
            l.length > 1 && /* @__PURE__ */ J("div", { children: [
              /* @__PURE__ */ m("span", { className: Be.paginationLabel, children: "Rows per page" }),
              /* @__PURE__ */ m(
                "select",
                {
                  className: Be.paginationSelect,
                  value: _e.pageSize,
                  onChange: (ne) => {
                    Oe.setPageSize(Number(ne.target.value));
                  },
                  children: l.map((ne) => /* @__PURE__ */ m("option", { value: ne, children: ne }, ne))
                }
              )
            ] }),
            /* @__PURE__ */ J("div", { className: Be.paginationButtons, children: [
              /* @__PURE__ */ m(
                st,
                {
                  onClick: () => Oe.setPageIndex(0),
                  disabled: !Oe.getCanPreviousPage(),
                  type: "button",
                  variant: "ghost",
                  children: /* @__PURE__ */ m(gT, {})
                }
              ),
              /* @__PURE__ */ m(
                st,
                {
                  onClick: () => Oe.previousPage(),
                  disabled: !Oe.getCanPreviousPage(),
                  type: "button",
                  variant: "ghost",
                  children: /* @__PURE__ */ m(vT, {})
                }
              ),
              /* @__PURE__ */ m(
                st,
                {
                  onClick: () => Oe.nextPage(),
                  disabled: !Oe.getCanNextPage(),
                  type: "button",
                  variant: "ghost",
                  children: /* @__PURE__ */ m(fT, {})
                }
              ),
              /* @__PURE__ */ m(
                st,
                {
                  onClick: () => Oe.setPageIndex(Oe.getPageCount() - 1),
                  disabled: !Oe.getCanNextPage(),
                  type: "button",
                  variant: "ghost",
                  children: /* @__PURE__ */ m(TT, {})
                }
              )
            ] })
          ] })
        ]
      }
    );
  }
);
function HT({ hasSorting: e, updateSorting: t, children: r }) {
  return e ? /* @__PURE__ */ m("button", { className: Be.clickableHeader, onClick: t, children: r }) : /* @__PURE__ */ m(Tt, { children: r });
}
function BT({
  direction: e,
  iconSortAsc: t = "sortasc:Table",
  iconSortDesc: r = "sortdesc:Table",
  iconNoSort: o = "nosort:Table"
}) {
  return e === "ascending" ? /* @__PURE__ */ m(ke, { name: t, fallback: "sortasc", size: "12" }) : e === "descending" ? /* @__PURE__ */ m(ke, { name: r, fallback: "sortdesc", size: "12" }) : o !== "-" ? /* @__PURE__ */ m(ke, { name: o, fallback: "nosort", size: "12" }) : /* @__PURE__ */ m(ke, { name: o, size: "12" });
}
const xe = "Table", IT = k({
  description: `\`${xe}\` is a component that displays cells organized into rows and columns. The \`${xe}\` component is virtualized so it only renders visible cells.`,
  props: {
    items: Fe(
      "You can use `items` as an alias for the `data` property. When you bind the table to a data source (e.g. an API endpoint), the `data` acts as the property that accepts a URL to fetch information from an API. When both `items` and `data` are used, `items` has priority."
    ),
    data: u(
      "The component receives data via this property. The `data` property is a list of items that the `Table` can display."
    ),
    isPaginated: {
      description: `This property adds pagination controls to the \`${xe}\`.`,
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
    noDataTemplate: Ve(
      "A property to customize what to display if the table does not contain any data."
    ),
    sortBy: u("This property is used to determine which data attributes to sort by."),
    sortDirection: u(
      "This property determines the sort order to be `ascending` or `descending`. This property only works if the [`sortBy`](#sortby) property is also set."
    ),
    autoFocus: rt(),
    hideHeader: {
      description: "Set the header visibility using this property. Set it to `true` to hide the header.",
      valueType: "boolean",
      defaultValue: !1
    },
    iconNoSort: u(
      `Allows setting the icon displayed in the ${xe} column header when sorting is enabled, but the column remains unsorted.`
    ),
    iconSortAsc: u(
      `Allows setting the icon displayed in the ${xe} column header when sorting is enabled, and the column is sorted in ascending order.`
    ),
    iconSortDesc: u(
      `Allows setting the icon displayed in the ${xe} column header when sorting is enabled, and the column is sorted in descending order.`
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
  themeVars: j(Be.themeVars),
  defaultThemeVars: {
    [`padding-heading-${xe}`]: "$space-2",
    [`paddingHorizontal-cell-${xe}`]: "$space-2",
    [`paddingHorizontal-cell-first-${xe}`]: "$space-5",
    [`paddingHorizontal-cell-last-${xe}`]: "$space-5",
    [`paddingVertical-cell-${xe}`]: "$space-2",
    [`border-cell-${xe}`]: "1px solid $borderColor",
    [`outlineWidth-heading-${xe}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-heading-${xe}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-heading-${xe}--focus`]: "$outlineOffset--focus",
    [`fontSize-heading-${xe}`]: "$fontSize-tiny",
    [`fontWeight-heading-${xe}`]: "$fontWeight-bold",
    [`textTransform-heading-${xe}`]: "uppercase",
    [`fontSize-row-${xe}`]: "$fontSize-small",
    [`backgroundColor-${xe}`]: "$backgroundColor",
    [`backgroundColor-row-${xe}`]: "inherit",
    [`backgroundColor-selected-${xe}--hover`]: `$backgroundColor-row-${xe}--hover`,
    [`backgroundColor-pagination-${xe}`]: `$backgroundColor-${xe}`,
    [`outlineColor-heading-${xe}--focus`]: "$outlineColor--focus",
    [`textColor-pagination-${xe}`]: "$color-secondary",
    light: {
      [`backgroundColor-row-${xe}--hover`]: "$color-primary-50",
      [`backgroundColor-selected-${xe}`]: "$color-primary-100",
      [`backgroundColor-heading-${xe}--hover`]: "$color-surface-200",
      [`backgroundColor-heading-${xe}--active`]: "$color-surface-300",
      [`backgroundColor-heading-${xe}`]: "$color-surface-100",
      [`textColor-heading-${xe}`]: "$color-surface-500"
    },
    dark: {
      [`backgroundColor-row-${xe}--hover`]: "$color-primary-900",
      [`backgroundColor-selected-${xe}`]: "$color-primary-800",
      [`backgroundColor-heading-${xe}--hover`]: "$color-surface-800",
      [`backgroundColor-heading-${xe}`]: "$color-surface-950",
      [`backgroundColor-heading-${xe}--active`]: "$color-surface-700"
    }
  }
});
ve(
  ({
    extractValue: e,
    node: t,
    renderChild: r,
    lookupEventHandler: o,
    lookupSyncCallback: a,
    layoutCss: n,
    registerComponentApi: i
  }, l) => {
    var F, Z, V, W, N, O;
    const s = e(t.props.items) || e(t.props.data), [v, x] = me(dt), [c, T] = me(Rr), b = he([]), [f, y] = me(0), w = ce(() => ({
      registerColumn: (h, p) => {
        x(
          Nr((g) => {
            g.findIndex((L) => L === p) < 0 && g.push(p);
          })
        ), T(
          Nr((g) => {
            g[p] = h;
          })
        );
      },
      unRegisterColumn: (h) => {
        x(
          Nr((p) => p.filter((g) => g !== h))
        ), T(
          Nr((p) => {
            delete p[h];
          })
        );
      }
    }), []), _ = ce(() => ({
      registerColumn: (h, p) => {
        b.current.find((g) => g === p) || (y((g) => g + 1), b.current.push(p));
      },
      unRegisterColumn: (h) => {
        b.current.find((p) => p === h) && (b.current = b.current.filter((p) => p !== h), y((p) => p + 1));
      }
    }), []), H = ce(
      () => v.map((h) => c[h]),
      [v, c]
    ), I = Ul(), R = /* @__PURE__ */ J(Tt, { children: [
      /* @__PURE__ */ m(sn.Provider, { value: w, children: r(t.children) }, f),
      /* @__PURE__ */ m(sn.Provider, { value: _, children: r(t.children) }),
      /* @__PURE__ */ m(
        wT,
        {
          ref: l,
          data: s,
          columns: H,
          pageSizes: e(t.props.pageSizes),
          rowsSelectable: e.asOptionalBoolean(t.props.rowsSelectable),
          registerComponentApi: i,
          noDataRenderer: t.props.noDataTemplate && (() => r(t.props.noDataTemplate)),
          hideNoDataView: t.props.noDataTemplate === null || t.props.noDataTemplate === "",
          loading: e.asOptionalBoolean(t.props.loading),
          isPaginated: e.asOptionalBoolean((F = t.props) == null ? void 0 : F.isPaginated),
          headerHeight: e.asSize(t.props.headerHeight),
          rowDisabledPredicate: a(t.props.rowDisabledPredicate),
          sortBy: e((Z = t.props) == null ? void 0 : Z.sortBy),
          sortingDirection: e((V = t.props) == null ? void 0 : V.sortDirection),
          iconSortAsc: e.asOptionalString((W = t.props) == null ? void 0 : W.iconSortAsc),
          iconSortDesc: e.asOptionalString((N = t.props) == null ? void 0 : N.iconSortDesc),
          iconNoSort: e.asOptionalString((O = t.props) == null ? void 0 : O.iconNoSort),
          sortingDidChange: o("sortingDidChange"),
          onSelectionDidChange: o("selectionDidChange"),
          willSort: o("willSort"),
          style: n,
          uid: t.uid,
          autoFocus: e.asOptionalBoolean(t.props.autoFocus),
          hideHeader: e.asOptionalBoolean(t.props.hideHeader),
          enableMultiRowSelection: e.asOptionalBoolean(
            t.props.enableMultiRowSelection
          ),
          alwaysShowSelectionHeader: e.asOptionalBoolean(
            t.props.alwaysShowSelectionHeader
          )
        }
      )
    ] });
    return I === null ? /* @__PURE__ */ m($g, { children: R }) : R;
  }
);
const $T = "Column", LT = k({
  description: `The \`${$T}\` component can be used within a \`Table\` to define a particular table column's visual properties and data bindings.`,
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
}), _T = `'{"padding-TableOfContentsItem": "var(--xmlui-padding-TableOfContentsItem)", "paddingHorizontal-TableOfContentsItem": "var(--xmlui-paddingHorizontal-TableOfContentsItem, var(--xmlui-padding-TableOfContentsItem))", "paddingVertical-TableOfContentsItem": "var(--xmlui-paddingVertical-TableOfContentsItem, var(--xmlui-padding-TableOfContentsItem))", "paddingLeft-TableOfContentsItem": "var(--xmlui-paddingLeft-TableOfContentsItem, var(--xmlui-paddingHorizontal-TableOfContentsItem, var(--xmlui-padding-TableOfContentsItem)))", "paddingRight-TableOfContentsItem": "var(--xmlui-paddingRight-TableOfContentsItem, var(--xmlui-paddingHorizontal-TableOfContentsItem, var(--xmlui-padding-TableOfContentsItem)))", "paddingTop-TableOfContentsItem": "var(--xmlui-paddingTop-TableOfContentsItem, var(--xmlui-paddingVertical-TableOfContentsItem, var(--xmlui-padding-TableOfContentsItem)))", "paddingBottom-TableOfContentsItem": "var(--xmlui-paddingBottom-TableOfContentsItem, var(--xmlui-paddingVertical-TableOfContentsItem, var(--xmlui-padding-TableOfContentsItem)))", "padding-TableOfContentsItem-level-1": "var(--xmlui-padding-TableOfContentsItem-level-1)", "paddingHorizontal-TableOfContentsItem-level-1": "var(--xmlui-paddingHorizontal-TableOfContentsItem-level-1, var(--xmlui-padding-TableOfContentsItem-level-1))", "paddingVertical-TableOfContentsItem-level-1": "var(--xmlui-paddingVertical-TableOfContentsItem-level-1, var(--xmlui-padding-TableOfContentsItem-level-1))", "paddingLeft-TableOfContentsItem-level-1": "var(--xmlui-paddingLeft-TableOfContentsItem-level-1, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-1, var(--xmlui-padding-TableOfContentsItem-level-1)))", "paddingRight-TableOfContentsItem-level-1": "var(--xmlui-paddingRight-TableOfContentsItem-level-1, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-1, var(--xmlui-padding-TableOfContentsItem-level-1)))", "paddingTop-TableOfContentsItem-level-1": "var(--xmlui-paddingTop-TableOfContentsItem-level-1, var(--xmlui-paddingVertical-TableOfContentsItem-level-1, var(--xmlui-padding-TableOfContentsItem-level-1)))", "paddingBottom-TableOfContentsItem-level-1": "var(--xmlui-paddingBottom-TableOfContentsItem-level-1, var(--xmlui-paddingVertical-TableOfContentsItem-level-1, var(--xmlui-padding-TableOfContentsItem-level-1)))", "padding-TableOfContentsItem-level-2": "var(--xmlui-padding-TableOfContentsItem-level-2)", "paddingHorizontal-TableOfContentsItem-level-2": "var(--xmlui-paddingHorizontal-TableOfContentsItem-level-2, var(--xmlui-padding-TableOfContentsItem-level-2))", "paddingVertical-TableOfContentsItem-level-2": "var(--xmlui-paddingVertical-TableOfContentsItem-level-2, var(--xmlui-padding-TableOfContentsItem-level-2))", "paddingLeft-TableOfContentsItem-level-2": "var(--xmlui-paddingLeft-TableOfContentsItem-level-2, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-2, var(--xmlui-padding-TableOfContentsItem-level-2)))", "paddingRight-TableOfContentsItem-level-2": "var(--xmlui-paddingRight-TableOfContentsItem-level-2, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-2, var(--xmlui-padding-TableOfContentsItem-level-2)))", "paddingTop-TableOfContentsItem-level-2": "var(--xmlui-paddingTop-TableOfContentsItem-level-2, var(--xmlui-paddingVertical-TableOfContentsItem-level-2, var(--xmlui-padding-TableOfContentsItem-level-2)))", "paddingBottom-TableOfContentsItem-level-2": "var(--xmlui-paddingBottom-TableOfContentsItem-level-2, var(--xmlui-paddingVertical-TableOfContentsItem-level-2, var(--xmlui-padding-TableOfContentsItem-level-2)))", "padding-TableOfContentsItem-level-3": "var(--xmlui-padding-TableOfContentsItem-level-3)", "paddingHorizontal-TableOfContentsItem-level-3": "var(--xmlui-paddingHorizontal-TableOfContentsItem-level-3, var(--xmlui-padding-TableOfContentsItem-level-3))", "paddingVertical-TableOfContentsItem-level-3": "var(--xmlui-paddingVertical-TableOfContentsItem-level-3, var(--xmlui-padding-TableOfContentsItem-level-3))", "paddingLeft-TableOfContentsItem-level-3": "var(--xmlui-paddingLeft-TableOfContentsItem-level-3, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-3, var(--xmlui-padding-TableOfContentsItem-level-3)))", "paddingRight-TableOfContentsItem-level-3": "var(--xmlui-paddingRight-TableOfContentsItem-level-3, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-3, var(--xmlui-padding-TableOfContentsItem-level-3)))", "paddingTop-TableOfContentsItem-level-3": "var(--xmlui-paddingTop-TableOfContentsItem-level-3, var(--xmlui-paddingVertical-TableOfContentsItem-level-3, var(--xmlui-padding-TableOfContentsItem-level-3)))", "paddingBottom-TableOfContentsItem-level-3": "var(--xmlui-paddingBottom-TableOfContentsItem-level-3, var(--xmlui-paddingVertical-TableOfContentsItem-level-3, var(--xmlui-padding-TableOfContentsItem-level-3)))", "padding-TableOfContentsItem-level-4": "var(--xmlui-padding-TableOfContentsItem-level-4)", "paddingHorizontal-TableOfContentsItem-level-4": "var(--xmlui-paddingHorizontal-TableOfContentsItem-level-4, var(--xmlui-padding-TableOfContentsItem-level-4))", "paddingVertical-TableOfContentsItem-level-4": "var(--xmlui-paddingVertical-TableOfContentsItem-level-4, var(--xmlui-padding-TableOfContentsItem-level-4))", "paddingLeft-TableOfContentsItem-level-4": "var(--xmlui-paddingLeft-TableOfContentsItem-level-4, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-4, var(--xmlui-padding-TableOfContentsItem-level-4)))", "paddingRight-TableOfContentsItem-level-4": "var(--xmlui-paddingRight-TableOfContentsItem-level-4, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-4, var(--xmlui-padding-TableOfContentsItem-level-4)))", "paddingTop-TableOfContentsItem-level-4": "var(--xmlui-paddingTop-TableOfContentsItem-level-4, var(--xmlui-paddingVertical-TableOfContentsItem-level-4, var(--xmlui-padding-TableOfContentsItem-level-4)))", "paddingBottom-TableOfContentsItem-level-4": "var(--xmlui-paddingBottom-TableOfContentsItem-level-4, var(--xmlui-paddingVertical-TableOfContentsItem-level-4, var(--xmlui-padding-TableOfContentsItem-level-4)))", "padding-TableOfContentsItem-level-5": "var(--xmlui-padding-TableOfContentsItem-level-5)", "paddingHorizontal-TableOfContentsItem-level-5": "var(--xmlui-paddingHorizontal-TableOfContentsItem-level-5, var(--xmlui-padding-TableOfContentsItem-level-5))", "paddingVertical-TableOfContentsItem-level-5": "var(--xmlui-paddingVertical-TableOfContentsItem-level-5, var(--xmlui-padding-TableOfContentsItem-level-5))", "paddingLeft-TableOfContentsItem-level-5": "var(--xmlui-paddingLeft-TableOfContentsItem-level-5, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-5, var(--xmlui-padding-TableOfContentsItem-level-5)))", "paddingRight-TableOfContentsItem-level-5": "var(--xmlui-paddingRight-TableOfContentsItem-level-5, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-5, var(--xmlui-padding-TableOfContentsItem-level-5)))", "paddingTop-TableOfContentsItem-level-5": "var(--xmlui-paddingTop-TableOfContentsItem-level-5, var(--xmlui-paddingVertical-TableOfContentsItem-level-5, var(--xmlui-padding-TableOfContentsItem-level-5)))", "paddingBottom-TableOfContentsItem-level-5": "var(--xmlui-paddingBottom-TableOfContentsItem-level-5, var(--xmlui-paddingVertical-TableOfContentsItem-level-5, var(--xmlui-padding-TableOfContentsItem-level-5)))", "padding-TableOfContentsItem-level-6": "var(--xmlui-padding-TableOfContentsItem-level-6)", "paddingHorizontal-TableOfContentsItem-level-6": "var(--xmlui-paddingHorizontal-TableOfContentsItem-level-6, var(--xmlui-padding-TableOfContentsItem-level-6))", "paddingVertical-TableOfContentsItem-level-6": "var(--xmlui-paddingVertical-TableOfContentsItem-level-6, var(--xmlui-padding-TableOfContentsItem-level-6))", "paddingLeft-TableOfContentsItem-level-6": "var(--xmlui-paddingLeft-TableOfContentsItem-level-6, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-6, var(--xmlui-padding-TableOfContentsItem-level-6)))", "paddingRight-TableOfContentsItem-level-6": "var(--xmlui-paddingRight-TableOfContentsItem-level-6, var(--xmlui-paddingHorizontal-TableOfContentsItem-level-6, var(--xmlui-padding-TableOfContentsItem-level-6)))", "paddingTop-TableOfContentsItem-level-6": "var(--xmlui-paddingTop-TableOfContentsItem-level-6, var(--xmlui-paddingVertical-TableOfContentsItem-level-6, var(--xmlui-padding-TableOfContentsItem-level-6)))", "paddingBottom-TableOfContentsItem-level-6": "var(--xmlui-paddingBottom-TableOfContentsItem-level-6, var(--xmlui-paddingVertical-TableOfContentsItem-level-6, var(--xmlui-padding-TableOfContentsItem-level-6)))", "backgroundColor-TableOfContents": "var(--xmlui-backgroundColor-TableOfContents)", "width-TableOfContents": "var(--xmlui-width-TableOfContents)", "height-TableOfContents": "var(--xmlui-height-TableOfContents)", "borderRadius-TableOfContents": "var(--xmlui-borderRadius-TableOfContents)", "borderColor-TableOfContents": "var(--xmlui-borderColor-TableOfContents)", "borderWidth-TableOfContents": "var(--xmlui-borderWidth-TableOfContents)", "borderStyle-TableOfContents": "var(--xmlui-borderStyle-TableOfContents)", "marginTop-TableOfContents": "var(--xmlui-marginTop-TableOfContents)", "marginBottom-TableOfContents": "var(--xmlui-marginBottom-TableOfContents)", "paddingVertical-TableOfContents": "var(--xmlui-paddingVertical-TableOfContents)", "paddingHorizontal-TableOfContents": "var(--xmlui-paddingHorizontal-TableOfContents)", "border-width-TableOfContentsItem": "var(--xmlui-border-width-TableOfContentsItem)", "border-style-TableOfContentsItem": "var(--xmlui-border-style-TableOfContentsItem)", "border-color-TableOfContentsItem": "var(--xmlui-border-color-TableOfContentsItem)", "textColor-TableOfContentsItem": "var(--xmlui-textColor-TableOfContentsItem)", "fontSize-TableOfContentsItem": "var(--xmlui-fontSize-TableOfContentsItem)", "fontWeight-TableOfContentsItem": "var(--xmlui-fontWeight-TableOfContentsItem)", "fontFamily-TableOfContentsItem": "var(--xmlui-fontFamily-TableOfContentsItem)", "textTransform-TableOfContentsItem": "var(--xmlui-textTransform-TableOfContentsItem)", "verticalAlign-TableOfContentsItem": "var(--xmlui-verticalAlign-TableOfContentsItem)", "letterSpacing-TableOfContentsItem": "var(--xmlui-letterSpacing-TableOfContentsItem)", "borderColor-TableOfContentsItem--active": "var(--xmlui-borderColor-TableOfContentsItem--active)", "color-TableOfContentsItem--active": "var(--xmlui-color-TableOfContentsItem--active)", "fontWeight-TableOfContentsItem--active": "var(--xmlui-fontWeight-TableOfContentsItem--active)"}'`, AT = {
  themeVars: _T
}, pe = "TableOfContents", NT = k({
  status: "experimental",
  description: `The \`${pe}\` component collects headings and bookmarks within the current page and displays them in a tree representing their hierarchy. When you select an item in this tree, the component navigates the page to the selected position.`,
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
  themeVars: j(AT.themeVars),
  defaultThemeVars: {
    [`width-${pe}`]: "auto",
    [`height-${pe}`]: "auto",
    [`fontSize-${pe}Item`]: "$fontSize-smaller",
    [`fontWeight-${pe}Item`]: "$fontWeight-normal",
    [`fontFamily-${pe}Item`]: "$fontFamily",
    [`borderRadius-${pe}Item`]: "0",
    [`border-width-${pe}Item`]: "$space-0_5",
    [`border-style-${pe}Item`]: "solid",
    [`borderRadius-${pe}Item--active`]: "0",
    [`border-width-${pe}Item--active`]: "$space-0_5",
    [`border-style-${pe}Item--active`]: "solid",
    [`fontWeight-${pe}Item--active`]: "$fontWeight-bold",
    [`backgroundColor-${pe}`]: "transparent",
    [`paddingHorizontal-${pe}`]: "$space-8",
    [`paddingVertical-${pe}`]: "$space-4",
    [`paddingHorizontal-${pe}Item`]: "$space-2",
    [`paddingVertical-${pe}Item`]: "$space-2",
    [`paddingHorizontal-${pe}Item-level-1`]: "unset",
    [`paddingHorizontal-${pe}Item-level-2`]: "unset",
    [`paddingHorizontal-${pe}Item-level-3`]: "unset",
    [`paddingHorizontal-${pe}Item-level-4`]: "unset",
    [`paddingHorizontal-${pe}Item-level-5`]: "unset",
    [`paddingHorizontal-${pe}Item-level-6`]: "unset",
    [`marginTop-${pe}`]: "0",
    [`marginBottom-${pe}`]: "0",
    [`borderRadius-${pe}`]: "0",
    [`border-width-${pe}`]: "0",
    [`borderColor-${pe}`]: "transparent",
    [`border-style-${pe}`]: "solid",
    [`textTransform-${pe}Item`]: "none",
    [`verticalAlign-${pe}Item`]: "baseline",
    [`letterSpacing-${pe}Item`]: "0",
    light: {
      [`color-${pe}Item`]: "$textColor-primary",
      [`borderColor-${pe}Item`]: "$borderColor",
      [`borderColor-${pe}Item--active`]: "$color-primary-500",
      [`color-${pe}Item--active`]: "$color-primary-500"
    },
    dark: {
      [`color-${pe}Item`]: "$textColor-primary",
      [`borderColor-${pe}Item`]: "$borderColor",
      [`borderColor-${pe}Item--active`]: "$color-primary-500",
      [`color-${pe}Item--active`]: "$textColor-secondary"
    }
  }
}), WT = `'{"backgroundColor-Tabs": "var(--xmlui-backgroundColor-Tabs)", "borderColor-Tabs": "var(--xmlui-borderColor-Tabs)", "borderWidth-Tabs": "var(--xmlui-borderWidth-Tabs)", "borderColor-active-Tabs": "var(--xmlui-borderColor-active-Tabs)", "backgroundColor-trigger-Tabs": "var(--xmlui-backgroundColor-trigger-Tabs)", "textColor-trigger-Tabs": "var(--xmlui-textColor-trigger-Tabs)", "backgroundColor-trigger-Tabs--hover": "var(--xmlui-backgroundColor-trigger-Tabs--hover)", "backgroundColor-list-Tabs": "var(--xmlui-backgroundColor-list-Tabs)"}'`, OT = {
  themeVars: WT
}, vt = "Tabs", RT = k({
  status: "experimental",
  description: `The \`${vt}\` component provides a tabbed layout where each tab has a clickable label and content.`,
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
    tabTemplate: Ve("This property declares the template for the clickable tab area.")
  },
  apis: {
    next: u("This method selects the next tab.")
  },
  themeVars: j(OT.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${vt}`]: "$backgroundColor-primary",
    [`borderStyle-${vt}`]: "solid",
    [`borderColor-${vt}`]: "$borderColor",
    [`borderColor-active-${vt}`]: "$color-primary",
    [`borderWidth-${vt}`]: "2px",
    [`backgroundColor-trigger-${vt}`]: "$backgroundColor-primary",
    light: {
      [`backgroundColor-trigger-${vt}--hover`]: "$color-primary-50",
      [`backgroundColor-list-${vt}`]: "$color-primary-50",
      [`textColor-trigger-${vt}`]: "$color-primary-100"
    },
    dark: {
      [`backgroundColor-trigger-${vt}--hover`]: "$color-primary-800",
      [`backgroundColor-list-${vt}`]: "$color-primary-800",
      [`textColor-trigger-${vt}`]: "$color-primary-100"
    }
  }
}), re = "Text", zT = k({
  description: `The \`${re}\` component displays textual information in a number of optional styles and variants.`,
  props: {
    value: u(
      `The text to be displayed. This value can also be set via nesting the text into the \`${re}\` component.`
    ),
    variant: {
      description: "An optional string value that provides named presets for text variants with a unique combination of font style, weight, size, color, and other parameters. If not defined, the text uses the current style of its context.",
      availableValues: bs
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
  themeVars: j(eo.themeVars),
  defaultThemeVars: {
    [`borderRadius-${re}`]: "$borderRadius",
    [`borderStyle-${re}`]: "solid",
    [`fontSize-${re}`]: "$fontSize-small",
    [`borderWidth-${re}`]: "$space-0",
    [`fontWeight-${re}-abbr`]: "$fontWeight-bold",
    [`textTransform-${re}-abbr`]: "uppercase",
    [`fontSize-${re}-secondary`]: "$fontSize-small",
    [`font-style-${re}-cite`]: "italic",
    [`textColor-${re}`]: "$textColor-primary",
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
}), Ot = "TextArea", VT = [
  { value: "(undefined)", description: "No resizing" },
  { value: "horizontal", description: "Can only resize horizontally" },
  { value: "vertical", description: "Can only resize vertically" },
  { value: "both", description: "Can resize in both dimensions" }
], ET = k({
  status: "experimental",
  description: `\`${Ot}\` is a component that provides a multiline text input area.`,
  props: {
    enterSubmits: {
      description: "This optional boolean property indicates whether pressing the `Enter` key on the keyboard prompts the parent `Form` component to submit.",
      valueType: "boolean",
      defaultValue: !0
    },
    escResets: {
      description: `This boolean property indicates whether the ${Ot} contents should be reset when pressing the ESC key.`,
      valueType: "boolean",
      defaultValue: !1
    },
    maxRows: u(
      `This optional property sets the maximum number of text rows the \`${Ot}\` can grow.`
    ),
    minRows: u(
      `This optional property sets the minimum number of text rows the \`${Ot}\` can shrink.`
    ),
    rows: {
      description: "Specifies the number of rows the component initially has.",
      valueType: "number",
      defaultValue: 2
    },
    autoSize: {
      description: `If set to \`true\`, this boolean property enables the \`${Ot}\` to resize automatically based on the number of lines inside it.`,
      valueType: "boolean",
      defaultValue: !1
    },
    placeholder: Er(),
    initialValue: St(),
    label: qe(),
    labelPosition: Dt("top"),
    labelWidth: Zt(Ot),
    labelBreak: Jt(Ot),
    maxLength: Ao(),
    autoFocus: rt(),
    required: Nt(),
    readOnly: _t(),
    enabled: Ze(),
    validationStatus: At(),
    resize: {
      description: "This optional property specifies in which dimensions can the `TextArea` be resized by the user.",
      availableValues: VT
    }
  },
  events: {
    gotFocus: Ct(Ot),
    lostFocus: kt(Ot),
    didChange: tt(Ot)
  },
  apis: {
    focus: er(Ot),
    value: u(
      "You can query the component's value. If no value is set, it will retrieve `undefined`."
    ),
    setValue: Kt()
  },
  themeVars: j(Xt.themeVars)
}), PT = `'{"border-Accordion": "var(--xmlui-border-Accordion)", "borderHorizontal-Accordion": "var(--xmlui-borderHorizontal-Accordion, var(--xmlui-border-Accordion))", "borderVertical-Accordion": "var(--xmlui-borderVertical-Accordion, var(--xmlui-border-Accordion))", "borderLeft-Accordion": "var(--xmlui-borderLeft-Accordion, var(--xmlui-borderHorizontal-Accordion, var(--xmlui-border-Accordion)))", "borderRight-Accordion": "var(--xmlui-borderRight-Accordion, var(--xmlui-borderHorizontal-Accordion, var(--xmlui-border-Accordion)))", "borderTop-Accordion": "var(--xmlui-borderTop-Accordion, var(--xmlui-borderVertical-Accordion, var(--xmlui-border-Accordion)))", "borderBottom-Accordion": "var(--xmlui-borderBottom-Accordion, var(--xmlui-borderVertical-Accordion, var(--xmlui-border-Accordion)))", "borderWidth-Accordion": "var(--xmlui-borderWidth-Accordion)", "borderHorizontalWidth-Accordion": "var(--xmlui-borderHorizontalWidth-Accordion, var(--xmlui-borderWidth-Accordion))", "borderLeftWidth-Accordion": "var(--xmlui-borderLeftWidth-Accordion, var(--xmlui-borderHorizontalWidth-Accordion, var(--xmlui-borderWidth-Accordion)))", "borderRightWidth-Accordion": "var(--xmlui-borderRightWidth-Accordion, var(--xmlui-borderHorizontalWidth-Accordion, var(--xmlui-borderWidth-Accordion)))", "borderVerticalWidth-Accordion": "var(--xmlui-borderVerticalWidth-Accordion, var(--xmlui-borderWidth-Accordion))", "borderTopWidth-Accordion": "var(--xmlui-borderTopWidth-Accordion, var(--xmlui-borderVerticalWidth-Accordion, var(--xmlui-borderWidth-Accordion)))", "borderBottomWidth-Accordion": "var(--xmlui-borderBottomWidth-Accordion, var(--xmlui-borderVerticalWidth-Accordion, var(--xmlui-borderWidth-Accordion)))", "borderStyle-Accordion": "var(--xmlui-borderStyle-Accordion)", "borderHorizontalStyle-Accordion": "var(--xmlui-borderHorizontalStyle-Accordion, var(--xmlui-borderStyle-Accordion))", "borderLeftStyle-Accordion": "var(--xmlui-borderLeftStyle-Accordion, var(--xmlui-borderHorizontalStyle-Accordion, var(--xmlui-borderStyle-Accordion)))", "borderRightStyle-Accordion": "var(--xmlui-borderRightStyle-Accordion, var(--xmlui-borderHorizontalStyle-Accordion, var(--xmlui-borderStyle-Accordion)))", "borderVerticalStyle-Accordion": "var(--xmlui-borderVerticalStyle-Accordion, var(--xmlui-borderStyle-Accordion))", "borderTopStyle-Accordion": "var(--xmlui-borderTopStyle-Accordion, var(--xmlui-borderVerticalStyle-Accordion, var(--xmlui-borderStyle-Accordion)))", "borderBottomStyle-Accordion": "var(--xmlui-borderBottomStyle-Accordion, var(--xmlui-borderVerticalStyle-Accordion, var(--xmlui-borderStyle-Accordion)))", "borderColor-Accordion": "var(--xmlui-borderColor-Accordion)", "borderHorizontalColor-Accordion": "var(--xmlui-borderHorizontalColor-Accordion, var(--xmlui-borderColor-Accordion))", "borderLeftColor-Accordion": "var(--xmlui-borderLeftColor-Accordion, var(--xmlui-borderHorizontalColor-Accordion, var(--xmlui-borderColor-Accordion)))", "borderRightColor-Accordion": "var(--xmlui-borderRightColor-Accordion, var(--xmlui-borderHorizontalColor-Accordion, var(--xmlui-borderColor-Accordion)))", "borderVerticalColor-Accordion": "var(--xmlui-borderVerticalColor-Accordion, var(--xmlui-borderColor-Accordion))", "borderTopColor-Accordion": "var(--xmlui-borderTopColor-Accordion, var(--xmlui-borderVerticalColor-Accordion, var(--xmlui-borderColor-Accordion)))", "borderBottomColor-Accordion": "var(--xmlui-borderBottomColor-Accordion, var(--xmlui-borderVerticalColor-Accordion, var(--xmlui-borderColor-Accordion)))", "radius-start-start-Accordion": "var(--xmlui-radius-start-start-Accordion, var(--xmlui-borderRadius-Accordion))", "radius-start-end-Accordion": "var(--xmlui-radius-start-end-Accordion, var(--xmlui-borderRadius-Accordion))", "radius-end-start-Accordion": "var(--xmlui-radius-end-start-Accordion, var(--xmlui-borderRadius-Accordion))", "radius-end-end-Accordion": "var(--xmlui-radius-end-end-Accordion, var(--xmlui-borderRadius-Accordion))", "padding-Accordion": "var(--xmlui-padding-Accordion)", "paddingHorizontal-Accordion": "var(--xmlui-paddingHorizontal-Accordion, var(--xmlui-padding-Accordion))", "paddingVertical-Accordion": "var(--xmlui-paddingVertical-Accordion, var(--xmlui-padding-Accordion))", "paddingLeft-Accordion": "var(--xmlui-paddingLeft-Accordion, var(--xmlui-paddingHorizontal-Accordion, var(--xmlui-padding-Accordion)))", "paddingRight-Accordion": "var(--xmlui-paddingRight-Accordion, var(--xmlui-paddingHorizontal-Accordion, var(--xmlui-padding-Accordion)))", "paddingTop-Accordion": "var(--xmlui-paddingTop-Accordion, var(--xmlui-paddingVertical-Accordion, var(--xmlui-padding-Accordion)))", "paddingBottom-Accordion": "var(--xmlui-paddingBottom-Accordion, var(--xmlui-paddingVertical-Accordion, var(--xmlui-padding-Accordion)))", "borderRadius-Accordion": "var(--xmlui-borderRadius-Accordion)", "verticalAlign-header-Accordion": "var(--xmlui-verticalAlign-header-Accordion)", "fontSize-header-Accordion": "var(--xmlui-fontSize-header-Accordion)", "fontWeight-header-Accordion": "var(--xmlui-fontWeight-header-Accordion)", "font-style-header-Accordion": "var(--xmlui-font-style-header-Accordion)", "paddingVertical-header-Accordion": "var(--xmlui-paddingVertical-header-Accordion)", "paddingHorizontal-header-Accordion": "var(--xmlui-paddingHorizontal-header-Accordion)", "backgroundColor-header-Accordion": "var(--xmlui-backgroundColor-header-Accordion)", "color-header-Accordion": "var(--xmlui-color-header-Accordion)", "backgroundColor-header-Accordion-hover": "var(--xmlui-backgroundColor-header-Accordion-hover)", "color-content-Accordion": "var(--xmlui-color-content-Accordion)", "backgroundColor-content-Accordion": "var(--xmlui-backgroundColor-content-Accordion)", "width-icon-Accordion": "var(--xmlui-width-icon-Accordion)", "height-icon-Accordion": "var(--xmlui-height-icon-Accordion)", "color-icon-Accordion": "var(--xmlui-color-icon-Accordion)"}'`, DT = "_root_1dkwb_13", ql = {
  themeVars: PT,
  root: DT
}, MT = Qt({
  expandedItems: null,
  rotateExpanded: null,
  expandItem: de,
  register: de,
  unRegister: de,
  hideIcon: null,
  expandedIcon: null,
  collapsedIcon: null,
  triggerPosition: null
}), gr = {
  hideIcon: !1,
  collapsedIcon: "chevrondown",
  triggerPosition: "end",
  rotateExpanded: "180deg"
};
ve(function({
  style: t,
  children: r,
  hideIcon: o = gr.hideIcon,
  expandedIcon: a,
  collapsedIcon: n = gr.collapsedIcon,
  triggerPosition: i = gr.triggerPosition,
  onDisplayDidChange: l = de,
  registerComponentApi: s,
  rotateExpanded: v = gr.rotateExpanded
}, x) {
  const [c, T] = me([]), [b, f] = me(/* @__PURE__ */ new Set()), y = X(
    (V) => {
      T((W) => W.filter((N) => N !== `${V}`));
    },
    [T]
  ), w = X(
    (V) => {
      c.includes(`${V}`) || T((W) => [...W, `${V}`]);
    },
    [T, c]
  ), _ = X(
    (V) => {
      c.includes(`${V}`) ? y(V) : w(V);
    },
    [y, w, c]
  ), H = X(
    (V) => {
      f((W) => (W.add(V), W));
    },
    [f]
  ), I = X(
    (V) => {
      f((W) => (W.delete(V), W));
    },
    [f]
  ), R = X(
    (V) => {
      if (b.has(`trigger_${V}`)) {
        const W = document.getElementById(`trigger_${V}`);
        W && W.focus();
      }
    },
    [b]
  ), F = X(
    (V) => c.includes(`${V}`),
    [c]
  );
  ee(() => {
    s == null || s({
      expanded: F,
      expand: w,
      collapse: y,
      toggle: _,
      focus: R
    });
  }, [s, w, y, _, R, F]);
  const Z = ce(
    () => ({
      register: H,
      unRegister: I,
      expandItem: w,
      expandedItems: c,
      hideIcon: o,
      expandedIcon: a,
      collapsedIcon: n,
      triggerPosition: i,
      rotateExpanded: v
    }),
    [
      H,
      I,
      c,
      o,
      a,
      n,
      i,
      w,
      v
    ]
  );
  return ee(() => {
    l == null || l(c);
  }, [c, l]), /* @__PURE__ */ m(MT.Provider, { value: Z, children: /* @__PURE__ */ m(
    Od.Root,
    {
      style: t,
      ref: x,
      value: c,
      type: "multiple",
      className: ql.root,
      onValueChange: (V) => T(V),
      children: r
    }
  ) });
});
const He = "Accordion", FT = k({
  status: "in progress",
  description: `(**NOT IMPLEMENTED YET**) The \`${He}\` component is a collapsible container that toggles the display of content sections. It helps organize information by expanding or collapsing it based on user interaction.`,
  props: {
    triggerPosition: {
      description: "This property indicates the position where the trigger icon should be displayed. The `start` value signs the trigger is before the header text (template), and `end` indicates that it follows the header.",
      defaultValue: gr.triggerPosition,
      valueType: "string",
      availableValues: ps
    },
    collapsedIcon: {
      description: "This property is the name of the icon that is displayed when the accordion is collapsed.",
      valueType: "string",
      defaultValue: gr.collapsedIcon
    },
    expandedIcon: {
      description: "This property is the name of the icon that is displayed when the accordion is expanded.",
      valueType: "string"
    },
    hideIcon: {
      description: "This property indicates that the trigger icon is not displayed (`true`).",
      defaultValue: gr.hideIcon,
      valueType: "boolean"
    },
    rotateExpanded: {
      description: "This optional property defines the rotation angle of the expanded icon (relative to the collapsed icon).",
      valueType: "string",
      defaultValue: gr.rotateExpanded
    }
  },
  events: {
    displayDidChange: tt(He)
  },
  apis: {
    expanded: gs(He),
    expand: Ts(He),
    collapse: ys(He),
    toggle: u(`This method toggles the state of the ${He} between expanded and collapsed.`),
    focus: er(He)
  },
  themeVars: j(ql.themeVars),
  defaultThemeVars: {
    [`paddingHorizontal-header-${He}`]: "$space-3",
    [`paddingVertical-header-${He}`]: "$space-3",
    [`verticalAlign-header-${He}`]: "center",
    [`fontSize-header-${He}`]: "$fontSize-normal",
    [`fontWeight-header-${He}`]: "$fontWeight-normal",
    [`fontFamily-header-${He}`]: "$fontFamily",
    [`border-${He}`]: "0px solid $borderColor",
    [`width-icon-${He}`]: "",
    [`height-icon-${He}`]: "",
    light: {
      [`backgroundColor-header-${He}`]: "$color-primary-500",
      [`backgroundColor-header-${He}-hover`]: "$color-primary-400",
      [`color-header-${He}`]: "$color-surface-50",
      [`color-content-${He}`]: "$textColor-primary",
      [`backgroundColor-content-${He}`]: "transparent",
      [`color-icon-${He}`]: "$color-surface-50"
    },
    dark: {
      [`backgroundColor-header-${He}`]: "$color-primary-500",
      [`backgroundColor-header-${He}-hover`]: "$color-primary-600",
      [`color-header-${He}`]: "$color-surface-50",
      [`color-content-${He}`]: "$textColor-primary",
      [`backgroundColor-content-${He}`]: "transparent",
      [`color-icon-${He}`]: "$color-surface-50"
    }
  }
}), UT = '"[]"', qT = {
  themeVars: UT
}, Fo = "Alert", GT = k({
  status: "in progress",
  description: `(**NOT IMPLEMENTED YET**) The \`${Fo}\` component is a panel used to display important notifications or feedback to users. It helps convey different statuses or levels of urgency, such as success, warning, error, and others.`,
  props: {
    statusColor: {
      description: `The value of this optional property sets the string to provide a color scheme for the ${Fo}.`,
      availableValues: us,
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
  themeVars: j(qT.themeVars),
  defaultThemeVars: {
    light: {},
    dark: {}
  }
}), cn = "TabItem", YT = k({
  description: `\`${cn}\` is a non-visual component describing a tab. Tabs component may use nested ${cn} instances from which the user can select.`,
  props: {
    label: qe()
  }
}), XT = "Fragment", jT = k({
  description: `The \`${XT}\` component encloses multiple child components into a single root component, so it can be used where only a single component definition is allowed.`,
  opaque: !0
}), QT = "Tree", ZT = k({
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
    itemTemplate: Ve("The template for each item in the tree.")
  }
}), Uo = "APICall", JT = k({
  description: `\`${Uo}\` is used to mutate (create, update or delete) some data on the backend. It is similar in nature to the \`DataSource\` component which retrieves data from the backend.`,
  props: {
    method: {
      description: "The method of data manipulation can be done via setting this property.",
      valueType: "string",
      availableValues: qn,
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
      description: `This optional string sets the title in the confirmation dialog that is displayed before the \`${Uo}\` is executed.`,
      valueType: "string"
    },
    confirmMessage: {
      description: `This optional string sets the message in the confirmation dialog that is displayed before the \`${Uo}\` is executed.`,
      valueType: "string"
    },
    confirmButtonLabel: {
      description: `This optional string property enables the customization of the submit button in the confirmation dialog that is displayed before the \`${Uo}\` is executed.`,
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
    payloadType: Fe(),
    invalidates: Fe(),
    updates: Fe(),
    optimisticValue: Fe(),
    getOptimisticValue: Fe()
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
    progress: Fe()
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
}), Sa = "DataSource", KT = k({
  status: "stable",
  description: `The \`${Sa}\` component manages fetching data from a web API endpoint. This component automatically manages the complexity of the fetch operation and caching. To manipulate data on the backend, use the [\`APICall\`](./APICall.mdx) component.`,
  props: {
    method: {
      description: "The method by which the data fetching request is made.",
      defaultValue: "get",
      availableValues: qn
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
var $ = /* @__PURE__ */ ((e) => (e[e.EOF = -1] = "EOF", e[e.nullCharacter = 0] = "nullCharacter", e[e.maxAsciiCharacter = 127] = "maxAsciiCharacter", e[e.lineFeed = 10] = "lineFeed", e[e.carriageReturn = 13] = "carriageReturn", e[e.lineSeparator = 8232] = "lineSeparator", e[e.paragraphSeparator = 8233] = "paragraphSeparator", e[e.nextLine = 133] = "nextLine", e[e.space = 32] = "space", e[e.nonBreakingSpace = 160] = "nonBreakingSpace", e[e.enQuad = 8192] = "enQuad", e[e.emQuad = 8193] = "emQuad", e[e.enSpace = 8194] = "enSpace", e[e.emSpace = 8195] = "emSpace", e[e.threePerEmSpace = 8196] = "threePerEmSpace", e[e.fourPerEmSpace = 8197] = "fourPerEmSpace", e[e.sixPerEmSpace = 8198] = "sixPerEmSpace", e[e.figureSpace = 8199] = "figureSpace", e[e.punctuationSpace = 8200] = "punctuationSpace", e[e.thinSpace = 8201] = "thinSpace", e[e.hairSpace = 8202] = "hairSpace", e[e.zeroWidthSpace = 8203] = "zeroWidthSpace", e[e.narrowNoBreakSpace = 8239] = "narrowNoBreakSpace", e[e.ideographicSpace = 12288] = "ideographicSpace", e[e.mathematicalSpace = 8287] = "mathematicalSpace", e[e.ogham = 5760] = "ogham", e[e.replacementCharacter = 65533] = "replacementCharacter", e[e._ = 95] = "_", e[e.$ = 36] = "$", e[e._0 = 48] = "_0", e[e._1 = 49] = "_1", e[e._2 = 50] = "_2", e[e._3 = 51] = "_3", e[e._4 = 52] = "_4", e[e._5 = 53] = "_5", e[e._6 = 54] = "_6", e[e._7 = 55] = "_7", e[e._8 = 56] = "_8", e[e._9 = 57] = "_9", e[e.a = 97] = "a", e[e.b = 98] = "b", e[e.c = 99] = "c", e[e.d = 100] = "d", e[e.e = 101] = "e", e[e.f = 102] = "f", e[e.g = 103] = "g", e[e.h = 104] = "h", e[e.i = 105] = "i", e[e.j = 106] = "j", e[e.k = 107] = "k", e[e.l = 108] = "l", e[e.m = 109] = "m", e[e.n = 110] = "n", e[e.o = 111] = "o", e[e.p = 112] = "p", e[e.q = 113] = "q", e[e.r = 114] = "r", e[e.s = 115] = "s", e[e.t = 116] = "t", e[e.u = 117] = "u", e[e.v = 118] = "v", e[e.w = 119] = "w", e[e.x = 120] = "x", e[e.y = 121] = "y", e[e.z = 122] = "z", e[e.A = 65] = "A", e[e.B = 66] = "B", e[e.C = 67] = "C", e[e.D = 68] = "D", e[e.E = 69] = "E", e[e.F = 70] = "F", e[e.G = 71] = "G", e[e.H = 72] = "H", e[e.I = 73] = "I", e[e.J = 74] = "J", e[e.K = 75] = "K", e[e.L = 76] = "L", e[e.M = 77] = "M", e[e.N = 78] = "N", e[e.O = 79] = "O", e[e.P = 80] = "P", e[e.Q = 81] = "Q", e[e.R = 82] = "R", e[e.S = 83] = "S", e[e.T = 84] = "T", e[e.U = 85] = "U", e[e.V = 86] = "V", e[e.W = 87] = "W", e[e.X = 88] = "X", e[e.Y = 89] = "Y", e[e.Z = 90] = "Z", e[e.ampersand = 38] = "ampersand", e[e.asterisk = 42] = "asterisk", e[e.at = 64] = "at", e[e.backslash = 92] = "backslash", e[e.backtick = 96] = "backtick", e[e.bar = 124] = "bar", e[e.caret = 94] = "caret", e[e.closeBrace = 125] = "closeBrace", e[e.closeBracket = 93] = "closeBracket", e[e.closeParen = 41] = "closeParen", e[e.colon = 58] = "colon", e[e.comma = 44] = "comma", e[e.dot = 46] = "dot", e[e.doubleQuote = 34] = "doubleQuote", e[e.equals = 61] = "equals", e[e.exclamation = 33] = "exclamation", e[e.greaterThan = 62] = "greaterThan", e[e.hash = 35] = "hash", e[e.lessThan = 60] = "lessThan", e[e.minus = 45] = "minus", e[e.openBrace = 123] = "openBrace", e[e.openBracket = 91] = "openBracket", e[e.openParen = 40] = "openParen", e[e.percent = 37] = "percent", e[e.plus = 43] = "plus", e[e.question = 63] = "question", e[e.semicolon = 59] = "semicolon", e[e.singleQuote = 39] = "singleQuote", e[e.slash = 47] = "slash", e[e.tilde = 126] = "tilde", e[e.backspace = 8] = "backspace", e[e.formFeed = 12] = "formFeed", e[e.byteOrderMark = 65279] = "byteOrderMark", e[e.tab = 9] = "tab", e[e.verticalTab = 11] = "verticalTab", e))($ || {}), io = /* @__PURE__ */ ((e) => (e[e.Warning = 0] = "Warning", e[e.Error = 1] = "Error", e[e.Suggestion = 2] = "Suggestion", e[e.Message = 3] = "Message", e))(io || {}), Tr = /* @__PURE__ */ ((e) => (e.onlyOneElem = "U002", e.expTagOpen = "U003", e.expTagIdent = "U004", e.expCloseStart = "U005", e.expEndOrClose = "U006", e.tagNameMismatch = "U007", e.expEnd = "U008", e.expAttrIdent = "U009", e.expEq = "U010", e.expAttrValue = "U011", e.duplAttr = "U012", e.uppercaseAttr = "U013", e.invalidChar = "W001", e.untermStr = "W002", e.untermComment = "W007", e.untermCData = "W008", e.untermScript = "W009", e))(Tr || {});
const wa = {
  code: "W001",
  category: 1,
  message: "Invalid character."
}, ey = {
  code: "W002",
  category: 1,
  message: "Unterminated string literal."
}, ty = {
  code: "W007",
  category: 1,
  message: "Unterminated comment"
}, ry = {
  code: "W008",
  category: 1,
  message: "Unterminated CDATA section"
}, oy = {
  code: "W009",
  category: 1,
  message: "Unterminated script section"
}, ay = {
  category: 1,
  code: "U008",
  message: "A '>' token expected."
}, iy = {
  category: 1,
  code: "U005",
  message: "A '</' token expected."
}, mn = {
  category: 1,
  code: "U004",
  message: "A tag identifier expected."
}, ny = {
  category: 1,
  code: "U011",
  message: "An attribute value expected."
}, ly = {
  category: 1,
  code: "U003",
  message: "A '<' token expected."
}, dy = {
  category: 1,
  code: "U006",
  message: "A '>' or '/>' token expected."
}, pn = {
  category: 1,
  code: "U009",
  message: "An attribute identifier expected."
};
var S = /* @__PURE__ */ ((e) => (e[e.Unknown = 0] = "Unknown", e[e.EndOfFileToken = 1] = "EndOfFileToken", e[e.CommentTrivia = 2] = "CommentTrivia", e[e.NewLineTrivia = 3] = "NewLineTrivia", e[e.WhitespaceTrivia = 4] = "WhitespaceTrivia", e[e.Identifier = 5] = "Identifier", e[e.OpenNodeStart = 6] = "OpenNodeStart", e[e.CloseNodeStart = 7] = "CloseNodeStart", e[e.NodeEnd = 8] = "NodeEnd", e[e.NodeClose = 9] = "NodeClose", e[e.Colon = 10] = "Colon", e[e.Equal = 11] = "Equal", e[e.StringLiteral = 12] = "StringLiteral", e[e.CData = 13] = "CData", e[e.Script = 14] = "Script", e[e.TextNode = 15] = "TextNode", e[e.AmpersandEntity = 16] = "AmpersandEntity", e[e.LessThanEntity = 17] = "LessThanEntity", e[e.GreaterThanEntity = 18] = "GreaterThanEntity", e[e.SingleQuoteEntity = 19] = "SingleQuoteEntity", e[e.DoubleQuoteEntity = 20] = "DoubleQuoteEntity", e[e.ElementNode = 21] = "ElementNode", e[e.AttributeNode = 22] = "AttributeNode", e[e.AttributeKeyNode = 23] = "AttributeKeyNode", e[e.ContentListNode = 24] = "ContentListNode", e[e.AttributeListNode = 25] = "AttributeListNode", e[e.TagNameNode = 26] = "TagNameNode", e[e.ErrorNode = 27] = "ErrorNode", e))(S || {});
function sy(e) {
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
  return uy();
}
function uy(e) {
  throw new Error("Didn't expect to get here");
}
function cy(e, t, r, o, a) {
  let n = t, i, l, s, v, x, c;
  return F(n, o, a), {
    getStartPos: () => s,
    getTokenEnd: () => i,
    getToken: () => x,
    getTokenStart: () => v,
    getTokenText: () => n.substring(v, i),
    getTokenValue: () => c,
    isIdentifier: () => x === S.Identifier,
    peekChar: T,
    scanChar: b,
    scan: f,
    scanTrivia: y,
    scanText: w,
    getText: _,
    setText: F,
    setOnError: Z,
    resetTokenState: V,
    back: W
  };
  function T(g) {
    if (i + (g ?? 0) >= l)
      return null;
    const C = I(i + (g ?? 0));
    return isNaN(C) ? null : C;
  }
  function b() {
    if (i >= l)
      return null;
    const g = I(i);
    return i += ar(g), g;
  }
  function f() {
    for (s = i; ; ) {
      if (v = i, i >= l)
        return x = S.EndOfFileToken;
      const g = I(i);
      switch (g) {
        case $.lineFeed:
        case $.carriageReturn:
          return g === $.carriageReturn && i + 1 < l && H(i + 1) === $.lineFeed ? i += 2 : i++, x = S.NewLineTrivia;
        case $.tab:
        case $.verticalTab:
        case $.formFeed:
        case $.space:
        case $.nonBreakingSpace:
        case $.ogham:
        case $.enQuad:
        case $.emQuad:
        case $.enSpace:
        case $.emSpace:
        case $.threePerEmSpace:
        case $.fourPerEmSpace:
        case $.sixPerEmSpace:
        case $.figureSpace:
        case $.punctuationSpace:
        case $.thinSpace:
        case $.hairSpace:
        case $.zeroWidthSpace:
        case $.narrowNoBreakSpace:
        case $.mathematicalSpace:
        case $.ideographicSpace:
        case $.byteOrderMark: {
          for (; i < l && xn(H(i)); )
            i++;
          return x = S.WhitespaceTrivia;
        }
        case $.doubleQuote:
        case $.singleQuote:
        case $.backtick:
          return c = h(), x = S.StringLiteral;
        case $.ampersand:
          return H(i + 1) === $.a && H(i + 2) === $.m && H(i + 3) === $.p && H(i + 4) === $.semicolon ? (i += 5, x = S.AmpersandEntity) : H(i + 1) === $.l && H(i + 2) === $.t && H(i + 3) === $.semicolon ? (i += 4, x = S.LessThanEntity) : H(i + 1) === $.g && H(i + 2) === $.t && H(i + 3) === $.semicolon ? (i += 4, x = S.GreaterThanEntity) : H(i + 1) === $.q && H(i + 2) === $.u && H(i + 3) === $.o && H(i + 4) === $.t && H(i + 5) === $.semicolon ? (i += 6, x = S.DoubleQuoteEntity) : H(i + 1) === $.a && H(i + 2) === $.p && H(i + 3) === $.o && H(i + 4) === $.s && H(i + 5) === $.semicolon ? (i += 6, x = S.SingleQuoteEntity) : (i++, p(wa, 1), x = S.Unknown);
        case $.equals:
          return i++, x = S.Equal;
        case $.colon:
          return i++, x = S.Colon;
        case $.lessThan:
          if (H(i + 1) === $.slash)
            return i += 2, x = S.CloseNodeStart;
          if (
            // --- "<!-- -->", XMLUI comment
            H(i + 1) === $.exclamation && H(i + 2) === $.minus && H(i + 3) === $.minus
          ) {
            for (i += 4; i < l; ) {
              if (H(i) === $.minus && H(i + 1) === $.minus && H(i + 2) === $.greaterThan)
                return i += 3, x = S.CommentTrivia;
              i += ar(H(i));
            }
            return p(ty, 4), x = S.Unknown;
          } else if (
            // --- <![CDATA[ section
            H(i + 1) === $.exclamation && H(i + 2) === $.openBracket && H(i + 3) === $.C && H(i + 4) === $.D && H(i + 5) === $.A && H(i + 6) === $.T && H(i + 7) === $.A && H(i + 8) === $.openBracket
          ) {
            for (i += 9; i < l; ) {
              if (H(i) === $.closeBracket && H(i + 1) === $.closeBracket && H(i + 2) === $.greaterThan)
                return i += 3, x = S.CData;
              i += ar(H(i));
            }
            return p(ry, 9), x = S.CData;
          } else if (
            // --- <script>
            H(i + 1) === $.s && H(i + 2) === $.c && H(i + 3) === $.r && H(i + 4) === $.i && H(i + 5) === $.p && H(i + 6) === $.t && H(i + 7) === $.greaterThan
          ) {
            for (i += 8; i < l; ) {
              if (H(i) === $.lessThan && H(i + 1) === $.slash && H(i + 2) === $.s && H(i + 3) === $.c && H(i + 4) === $.r && H(i + 5) === $.i && H(i + 6) === $.p && H(i + 7) === $.t && H(i + 8) === $.greaterThan)
                return i += 9, x = S.Script;
              i += ar(H(i));
            }
            return p(oy, 9), x = S.Script;
          }
          return i++, x = S.OpenNodeStart;
        case $.slash:
          return H(i + 1) === $.greaterThan ? (i += 2, x = S.NodeClose) : (i++, p(wa, 1), x = S.Unknown);
        case $.greaterThan:
          return i++, x = S.NodeEnd;
        default:
          const C = N(g);
          if (C)
            return x = C;
          if (xn(g)) {
            i += ar(g);
            continue;
          } else if (by(g)) {
            i += ar(g);
            continue;
          }
          const L = ar(g);
          return i += L, p(wa, L), x = S.Unknown;
      }
    }
  }
  function y() {
    const g = i, C = f();
    return sy(C) ? C : (V(g), null);
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
  function I(g) {
    return R(n, g);
  }
  function R(g, C) {
    return g.codePointAt(C) ?? 0;
  }
  function F(g, C, L) {
    n = g || "", l = L === void 0 ? n.length : C + L, V(C || 0);
  }
  function Z(g) {
    r = g;
  }
  function V(g) {
    i = g, s = g, v = g, x = S.Unknown, c = void 0;
  }
  function W() {
    V(s);
  }
  function N(g) {
    let C = g;
    if (hy(C)) {
      for (i += ar(C); i < l && xy(C = I(i)); )
        i += ar(C);
      return c = n.substring(v, i), O();
    }
  }
  function O() {
    return x = S.Identifier;
  }
  function h() {
    const g = H(i);
    i++;
    let C = "", L = i;
    for (; ; ) {
      if (i >= l) {
        C += n.substring(L, i), p(ey, 1);
        break;
      }
      if (H(i) === g) {
        C += n.substring(L, i), i++;
        break;
      }
      i++;
    }
    return C;
  }
  function p(g, C = 0) {
    r && r(g, C);
  }
}
function ar(e) {
  return e >= 65536 ? 2 : e === $.EOF ? 0 : 1;
}
function Gl(e) {
  return e >= $.A && e <= $.Z || e >= $.a && e <= $.z;
}
function my(e) {
  return Gl(e) || py(e) || e === $._;
}
function py(e) {
  return e >= $._0 && e <= $._9;
}
function hy(e) {
  return Gl(e) || e === $.$ || e === $._;
}
function xy(e) {
  return my(e) || e === $.$ || e === $.minus || e === $.dot;
}
function xn(e) {
  return e === $.space || e === $.tab || e === $.verticalTab || e === $.formFeed || e === $.nonBreakingSpace || e === $.nextLine || e === $.ogham || e >= $.enQuad && e <= $.zeroWidthSpace || e === $.narrowNoBreakSpace || e === $.mathematicalSpace || e === $.ideographicSpace || e === $.byteOrderMark;
}
function by(e) {
  return e === $.lineFeed || e === $.carriageReturn || e === $.lineSeparator || e === $.paragraphSeparator;
}
function vy(e, t, r) {
  var n, i;
  const o = ((n = e.children) == null ? void 0 : n.filter((l) => l.kind !== S.ErrorNode)) ?? [], a = ((i = t.children) == null ? void 0 : i.filter((l) => l.kind !== S.ErrorNode)) ?? [];
  if (o.length !== a.length)
    return !1;
  for (let l = 0; l < o.length; ++l)
    if (r(o[l]) !== r(a[l]))
      return !1;
  return !0;
}
const qo = {
  uppercaseAttr: function(e) {
    return {
      category: io.Error,
      code: Tr.uppercaseAttr,
      message: `Attribute name '${e}' cannot start with an uppercase letter.`
    };
  },
  duplAttr: function(e) {
    return {
      category: io.Error,
      code: Tr.duplAttr,
      message: `Duplicated attribute: '${e}'.`
    };
  },
  tagNameMismatch: function(e, t) {
    return {
      category: io.Error,
      code: Tr.tagNameMismatch,
      message: `Opening and closing tag names should match. Opening tag has a name '${e}', but the closing tag name is '${t}'.`
    };
  },
  invalidChar: function(e) {
    return {
      category: io.Error,
      code: Tr.invalidChar,
      message: `Invalid character '${e}'.`
    };
  }
};
function fy(e) {
  return {
    parse: () => gy(e),
    getText: (t, r = !0) => e.substring(r ? t.pos ?? t.start ?? 0 : t.start ?? t.pos ?? 0, t.end)
  };
}
function gy(e) {
  const t = [], r = [];
  let o, a = { children: [] }, n;
  const l = cy(!1, e, function(A, B) {
    n = {
      message: A,
      prefixLength: B
    };
  });
  function s(A, B = !0) {
    return e.substring(B ? A.pos : A.start, A.end);
  }
  function v() {
    p();
    e: for (; ; ) {
      const A = N();
      switch (A.kind) {
        case S.TextNode:
        case S.StringLiteral:
          O(A.kind);
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
  function x() {
    for (; ; )
      switch (N().kind) {
        case S.EndOfFileToken:
          h();
          return;
        default:
          c();
          break;
      }
  }
  function c() {
    !I(S.CData) && !I(S.Script) && (H(S.OpenNodeStart) ? T() : L(ly));
  }
  function T() {
    p(), O(S.OpenNodeStart);
    let A;
    if (H(S.Identifier) ? A = b() : Z(mn), f(), I(S.NodeClose)) {
      g(S.ElementNode);
      return;
    } else if (I(S.NodeEnd)) {
      if (v(), I(S.CloseNodeStart)) {
        if (H(S.Identifier)) {
          const B = b();
          A !== void 0 && !vy(A, B, s) && Z(qo.tagNameMismatch(s(A), s(B)));
        } else
          F(mn, [S.NodeEnd]);
        I(S.NodeEnd) || Z(ay);
      } else
        Z(iy);
      g(S.ElementNode);
      return;
    } else
      Z(dy);
  }
  function b() {
    return p(), O(S.Identifier), I(S.Colon) && I(S.Identifier), g(S.TagNameNode);
  }
  function f() {
    p();
    const A = [];
    for (; !R([S.EndOfFileToken, S.NodeEnd, S.NodeClose]); )
      y(A);
    a.children.length === 0 ? q() : g(S.AttributeListNode);
  }
  function y(A) {
    if (p(), H(S.Identifier))
      w(A);
    else {
      const B = [S.Equal];
      if (!F(pn, B))
        return;
    }
    if (I(S.Equal) && !I(S.StringLiteral) && !I(S.Identifier)) {
      const B = [S.NodeEnd, S.NodeClose];
      F(ny, B);
    }
    g(S.AttributeNode);
  }
  function w(A) {
    const B = W();
    let P;
    p(), O(S.Identifier), I(S.Colon) && (H(S.Identifier) ? P = O(S.Identifier) : F(pn, [
      S.NodeClose,
      S.NodeEnd,
      S.Equal
    ])), _(A, { nsIdent: P, nameIdent: B }), g(S.AttributeKeyNode);
  }
  function _(A, { nameIdent: B, nsIdent: P }) {
    const M = s(B), E = P === void 0 ? void 0 : s(P), G = ({ ns: be, name: Me }) => Me === M && be === E, Q = A.findIndex(G) !== -1, K = "A" <= M[0] && M[0] <= "Z", te = Q || K;
    Q && V(qo.duplAttr(M), B.pos, B.end), K && V(qo.uppercaseAttr(M), B.pos, B.end), te || A.push({ name: M });
  }
  function H(A) {
    return W().kind === A;
  }
  function I(A) {
    const B = H(A);
    return B && h(), B;
  }
  function R(A) {
    return A.includes(W().kind);
  }
  function F(A, B) {
    return R(B) || H(S.EndOfFileToken) ? (Z(A), !0) : (p(), Z(A), h(), g(S.ErrorNode), !1);
  }
  function Z({ code: A, message: B, category: P }) {
    const { pos: M, end: E } = W();
    t.push({
      category: P,
      code: A,
      message: B,
      pos: M,
      end: E
    });
  }
  function V({ code: A, message: B, category: P }, M, E) {
    t.push({
      category: P,
      code: A,
      message: B,
      pos: M,
      end: E
    });
  }
  function W(A = !1) {
    return o !== void 0 || (o = C(A)), o;
  }
  function N() {
    const A = W(!0);
    if (A.kind === S.EndOfFileToken || A.kind === S.OpenNodeStart || A.kind === S.Script || A.kind === S.CData || A.kind === S.CloseNodeStart)
      return A;
    const B = A.triviaBefore, P = (B == null ? void 0 : B.length) ?? 0;
    let M = 0, E = [], G = -1;
    for (; M < P; ++M)
      if (B[M].kind === S.CommentTrivia)
        E.push(B[M]);
      else {
        G = M;
        break;
      }
    let Q = -1;
    for (; M < P; ++M)
      if (B[M].kind === S.CommentTrivia) {
        Q = M;
        break;
      }
    let K = !1;
    if (A.kind === S.StringLiteral) {
      const oe = A.end, Y = C(!0);
      K = Y.kind === S.CData || Y.kind === S.CloseNodeStart || Y.kind === S.Script || Y.kind === S.OpenNodeStart, l.resetTokenState(oe);
    }
    let te;
    K ? te = A.pos : E.length > 0 ? te = E[E.length - 1].end : G !== -1 ? te = B[G].pos : te = A.start;
    let be = te, Me;
    E.length > 0 && (Me = E, be = E[0].pos);
    let We = S.TextNode, ie = -1;
    if (Q !== -1)
      ie = B[Q].pos, l.resetTokenState(ie);
    else if (K)
      We = S.StringLiteral, ie = A.end;
    else {
      for (; ; ) {
        const oe = l.peekChar();
        if (oe === null || oe === $.lessThan)
          break;
        l.scanChar();
      }
      ie = l.getTokenEnd();
    }
    return o = { kind: We, start: be, pos: te, end: ie, triviaBefore: Me }, o;
  }
  function O(A) {
    const B = h();
    if (B.kind !== A)
      throw new Error(
        `expected ${hn(A)}, bumped a ${hn(B.kind)}`
      );
    return B;
  }
  function h() {
    if (o) {
      a.children.push(o);
      const B = o;
      return o = void 0, B;
    }
    const A = C(!1);
    return a.children.push(A), A;
  }
  function p() {
    r.push(a), a = {
      children: []
    };
  }
  function g(A) {
    const B = bn(A, a.children), P = r[r.length - 1];
    return P.children.push(B), a = P, r.pop(), B;
  }
  function C(A) {
    let B, P = [], M = null;
    for (; ; ) {
      if (B = l.scan(), M === null && (M = l.getTokenStart()), n !== void 0) {
        let E;
        n.message.code === Tr.invalidChar ? E = qo.invalidChar(l.getTokenText()) : E = n.message;
        const G = l.getTokenStart(), Q = {
          kind: B,
          start: M,
          pos: G,
          end: l.getTokenEnd(),
          triviaBefore: P.length > 0 ? P : void 0
        };
        if (P = [], A && E.code === Tr.invalidChar)
          return n = void 0, Q;
        const K = G + n.prefixLength;
        return Q.end = K, l.resetTokenState(K), p(), a.children.push(Q), V(E, G, K), g(S.ErrorNode), n = void 0, C(A);
      }
      switch (B) {
        case S.CommentTrivia:
        case S.NewLineTrivia:
        case S.WhitespaceTrivia:
          P.push({
            kind: B,
            start: M,
            pos: l.getTokenStart(),
            end: l.getTokenEnd()
          });
          break;
        default:
          return {
            kind: B,
            start: M,
            pos: l.getTokenStart(),
            end: l.getTokenEnd(),
            triviaBefore: P.length > 0 ? P : void 0
          };
      }
    }
  }
  function L(A) {
    F(A, []);
  }
  function q() {
    const A = r[r.length - 1];
    A.children.push(...a.children), a = A, r.pop();
  }
  return x(), { node: bn(S.ContentListNode, a.children), errors: t };
}
function bn(e, t) {
  const r = t[0], o = t[t.length - 1];
  return {
    kind: e,
    start: r.start,
    pos: r.pos,
    end: o.end,
    children: t
  };
}
const Ha = "__PARSED__";
function Ty(e, t, r, o) {
  const a = {
    vars: {},
    moduleErrors: {},
    functions: {}
  }, n = {}, i = Wx(e, t, r, !0);
  if (Nx(i))
    return { ...a, moduleErrors: i };
  const l = o(i.name);
  return i.statements.forEach((x) => {
    switch (x.type) {
      case "VarS":
        x.declarations.forEach((c) => {
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
        v(l, x);
        break;
      case "ImportD":
        break;
      default:
        throw new Error(`'${x.type}' is not allowed in a code-behind module.`);
    }
  }), s(i), a;
  function s(x) {
    var T;
    const c = o(x.name);
    if (!((T = n == null ? void 0 : n[c]) != null && T.collectedImportsFrom)) {
      for (const b in x.imports) {
        const f = o(b), y = x.imports[b];
        for (const w of Object.values(y))
          w.type === "FuncD" && v(f, w);
      }
      n[c] ?? (n[c] = { collectedImportsFrom: !0 }), n[c].collectedImportsFrom = !0;
      for (let b of x.importedModules)
        s(b);
    }
  }
  function v(x, c) {
    var w, _, H, I;
    var T;
    if (((_ = (w = n == null ? void 0 : n[x]) == null ? void 0 : w.functions) == null ? void 0 : _[c.name]) !== void 0)
      return;
    if (c.name in a.functions)
      throw new Error(`Duplicated function declaration: '${c.name}'`);
    const b = c.args.length === 1 ? `${c.args[0].source} => ${c.statement.source}` : `(${c.args.map((R) => R.source).join(", ")}) => ${c.statement.source}`, f = {
      type: "ArrowE",
      args: c.args.slice(),
      statement: c.statement,
      closureContext: Sl({
        blocks: [{ vars: {} }]
      })
    }, y = (I = (H = f.closureContext[0]) == null ? void 0 : H.vars) == null ? void 0 : I[c.name];
    y != null && y.closureContext && delete y.closureContext, n[x] ?? (n[x] = { functions: {}, collectedImportsFrom: !1 }), (T = n[x]).functions ?? (T.functions = {}), n[x].functions[c.name] = {
      [Ha]: !0,
      source: b,
      tree: f
    }, a.functions[c.name] = {
      [Ha]: !0,
      source: b,
      tree: f
    };
  }
}
class di extends Error {
  constructor(t, r) {
    super(`${r ? `${r}: ` : ""}${t}`), this.code = r, Object.setPrototypeOf(this, di.prototype);
  }
}
const yy = {
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
}, vn = "Component", Ba = /^[A-Z]/, fn = /^on[A-Z]/, Cy = ["name", "value"], ky = 9, Ia = "component-ns", Sy = "app-ns", wy = "#app-ns", Hy = "core-ns", By = "#xmlui-core-ns", pr = {
  property: "property",
  event: "event",
  variable: "variable",
  loaders: "loaders",
  uses: "uses",
  method: "method",
  item: "item",
  field: "field"
};
function Iy(e, t, r, o = () => "") {
  const a = (h) => h.text ?? t(h), n = Ay(e), i = F(n), l = [], s = [];
  return v(l, i);
  function v(h, p) {
    const g = kn(p, a, s);
    if (g === vn)
      return c(p);
    let C = {
      type: g,
      debug: {
        source: {
          start: p.start,
          end: p.end,
          fileId: r
        }
      }
    };
    return T(h, C, p), C;
  }
  function x(h, p) {
    const g = kn(p, a, s);
    g === vn && fe("T006");
    let C = {
      type: g,
      debug: {
        source: {
          start: p.start,
          end: p.end,
          fileId: r
        }
      }
    };
    return T(h, C, p), C;
  }
  function c(h) {
    const p = Zr(h).map(I), g = p.find((te) => te.name === "name");
    g || fe("T003"), Ba.test(g.value) || fe("T004");
    let C;
    const L = p.filter((te) => te.startSegment === "method");
    L.length > 0 && (C = {}, L.forEach((te) => {
      C[te.name] = te.value;
    }));
    let q;
    const z = p.filter((te) => te.startSegment === "var");
    z.length > 0 && (q = {}, z.forEach((te) => {
      q[te.name] = te.value;
    }));
    const A = Jr(h), B = A.filter(
      (te) => te.kind === S.ElementNode && !(ir(te, a) in pr)
    );
    B.length === 0 && B.push(gn(""));
    const P = [], M = [];
    for (let te of A)
      if (te.kind === S.ElementNode) {
        const be = ir(te, a);
        be === pr.variable ? M.push(te) : be in pr && P.push(te);
      }
    let E;
    B.length > 1 || M.length > 0 ? E = Tn([...M, ...B]) : E = B[0], s.push(/* @__PURE__ */ new Map()), p.filter((te) => te.namespace === "xmlns").forEach((te) => {
      Cn(s, E, te.unsegmentedName, te.value);
    });
    let G = x(
      l,
      E
    );
    s.pop();
    const Q = {
      name: g.value,
      component: G,
      debug: {
        source: {
          start: h.start,
          end: h.end,
          fileId: r
        }
      }
    };
    C && (Q.api = C), q && (G.vars = { ...G.vars, ...q }), G.debug = {
      source: {
        start: E.start,
        end: E.end,
        fileId: r
      }
    };
    const K = yn(h, P);
    return T(l, Q, K), Q;
  }
  function T(h, p, g) {
    var B;
    const C = !Rt(p), L = Zr(g);
    if (s.push(/* @__PURE__ */ new Map()), L.forEach((P) => {
      b(p, P);
    }), Jr(g).forEach((P) => {
      if (P.kind === S.Script) {
        Zr(P).length > 0 && fe("T022");
        const E = a(P), G = E.slice(
          E.indexOf(">") + 1,
          E.lastIndexOf("</")
        );
        p.script ?? (p.script = ""), p.script.length > 0 && (p.script += `
`), p.script += G;
        return;
      }
      if (P.kind === S.TextNode && !C) {
        p.children = Go(p.children, a(P));
        return;
      }
      const M = ir(P, a);
      if (!(C && P.kind === S.ElementNode && !(M in pr))) {
        if (!(M in pr) && !C) {
          const E = x(h, P);
          E && (p.children ? typeof p.children == "string" ? p.children = [p.children, E] : Array.isArray(p.children) && p.children.push(E) : p.children = [E]);
          return;
        }
        switch (M) {
          case "property":
            _(
              h,
              p,
              P,
              (E) => {
                var G;
                return Rt(p) ? (G = p.props) == null ? void 0 : G[E] : void 0;
              },
              (E, G) => {
                Rt(p) && (p.props ?? (p.props = {}), p.props[E] = G);
              }
            );
            return;
          case "event":
            _(
              h,
              p,
              P,
              (E) => {
                var G;
                return Rt(p) ? (G = p.events) == null ? void 0 : G[E] : void 0;
              },
              (E, G) => {
                Rt(p) && (p.events ?? (p.events = {}), p.events[E] = G);
              },
              (E) => {
                fn.test(E) && fe("T008", E);
              }
            );
            return;
          case pr.variable:
            _(
              h,
              p,
              P,
              (E) => {
                var G;
                return Rt(p) ? (G = p.vars) == null ? void 0 : G[E] : void 0;
              },
              (E, G) => {
                Rt(p) && (p.vars ?? (p.vars = {}), p.vars[E] = G);
              }
            );
            return;
          case "loaders":
            w(h, p, P);
            return;
          case "uses":
            H(p, P);
            return;
          case "method":
            _(
              h,
              p,
              P,
              (E) => {
                var G;
                return Rt(p) ? (G = p.api) == null ? void 0 : G[E] : void 0;
              },
              (E, G) => {
                p.api ?? (p.api = {}), p.api[E] = G;
              }
            );
            return;
          default:
            fe("T009", M);
            return;
        }
      }
    }), s.pop(), !p.script || p.script.trim().length === 0)
      return;
    const z = new kl(p.script);
    try {
      z.parseStatements(), p.scriptCollected = Ty(
        "Main",
        p.script,
        o,
        (P) => P
      );
    } catch (P) {
      z.errors && z.errors.length > 0 ? p.scriptError = z.errors : p.scriptError = P;
    }
    const A = ((B = p.scriptCollected) == null ? void 0 : B.moduleErrors) ?? {};
    Object.keys(A).length > 0 && (p.scriptError = A);
  }
  function b(h, p) {
    const { namespace: g, startSegment: C, name: L, value: q, unsegmentedName: z } = I(p);
    if (g === "xmlns")
      return Cn(s, h, z, q);
    if (!Rt(h)) {
      if (C && C !== "method" && C !== "var") {
        fe("T021");
        return;
      }
      if (L === "name" && !C)
        return;
      !C && L && fe("T021", L);
      return;
    }
    switch (L) {
      case "id":
        h.uid = q;
        return;
      case "testId":
        h.testId = q;
        return;
      case "when":
        h.when = q;
        return;
      default:
        if (C === "var")
          h.vars ?? (h.vars = {}), h.vars[L] = q;
        else if (C === "method")
          h.api ?? (h.api = {}), h.api[L] = q;
        else if (C === "event")
          h.events ?? (h.events = {}), h.events[L] = q;
        else if (fn.test(L)) {
          h.events ?? (h.events = {});
          const B = L[2].toLowerCase() + L.substring(3);
          h.events[B] = q;
        } else
          h.props ?? (h.props = {}), h.props[L] = q;
        return;
    }
  }
  function f(h, p) {
    let g = null;
    if (!p) return g;
    let C = null;
    return p.forEach((L) => {
      if (L.kind === S.TextNode) {
        g = Go(g, a(L));
        return;
      }
      if (L.kind !== S.ElementNode) return;
      const q = ir(L, a);
      if (q !== "field" && q !== "item") {
        fe("T016");
        return;
      }
      if (q === "field") {
        if (!C)
          C = q, g = {};
        else if (C !== q) {
          fe("T017");
          return;
        }
      } else if (q === "item") {
        if (!C)
          C = q, g = [];
        else if (C !== q) {
          fe("T017");
          return;
        }
      }
      let z = y(h, L, q === "field");
      if (!z)
        return null;
      C === "field" ? g[z.name] = z.value : g.push(z.value);
    }), g;
  }
  function y(h, p, g = !0) {
    const C = ir(p, a), L = Jr(p), q = L.filter(
      (Q) => Q.kind === S.ElementNode && Ba.test(ir(Q, a))
    ), z = L.filter(
      (Q) => Q.kind === S.ElementNode && !Ba.test(ir(Q, a))
    ), A = Zr(p).map(I), B = A.filter((Q) => Cy.indexOf(Q.name) >= 0);
    if (A.length > B.length)
      return fe("T011", C), null;
    const P = B.find((Q) => Q.name === "name");
    if (g) {
      if (!(P != null && P.value))
        return fe("T012", C), null;
    } else if (P)
      return fe("T018", C), null;
    const M = P == null ? void 0 : P.value, E = B.find((Q) => Q.name === "value");
    if (E && E.value === void 0)
      return fe("T019", C), null;
    if (M && q.length >= 1) {
      if (z.length > 0)
        return fe("T020"), null;
      const Q = q.map((K) => x(h, K));
      return {
        name: M,
        value: Q.length === 1 ? Q[0] : Q
      };
    }
    let G = E == null ? void 0 : E.value;
    return G === null ? null : typeof G == "string" ? { name: M, value: G } : { name: M, value: f(h, L) };
  }
  function w(h, p, g) {
    var q;
    if (!Rt(p)) {
      fe("T009", "loaders");
      return;
    }
    const C = Jr(g);
    if (C.length === 0 && (p.loaders ?? (p.loaders = [])), (q = g.children) == null ? void 0 : q.some((z) => z.kind === S.AttributeListNode)) {
      fe("T014", "attributes");
      return;
    }
    C.forEach((z) => {
      if (z.kind === S.TextNode) {
        fe("T010", "loader");
        return;
      }
      const A = x(h, z);
      if (!A.uid) {
        fe("T013");
        return;
      }
      if (A.vars) {
        fe("T014", "vars");
        return;
      }
      if (A.loaders) {
        fe("T014", "loaders");
        return;
      }
      if (A.uses) {
        fe("T014", "uses");
        return;
      }
      p.loaders ?? (p.loaders = []), p.loaders.push(A);
    });
  }
  function _(h, p, g, C, L, q) {
    const z = y(h, g);
    if (!z)
      return;
    q == null || q((z == null ? void 0 : z.name) ?? "");
    const A = z.name, B = z.value;
    if ((z == null ? void 0 : z.value) !== void 0)
      L(A, Go(C(A), B));
    else {
      const P = Jr(g), M = f(h, P);
      let E = C(A);
      E = Go(E, M), L(A, E);
    }
  }
  function H(h, p) {
    if (!Rt(h)) {
      fe("T009", "uses");
      return;
    }
    const g = Zr(p).map(I), C = g.find((L) => L.name === "value");
    if (!(C != null && C.value) || g.length !== 1) {
      fe("T015", "uses");
      return;
    }
    h.uses ?? (h.uses = C.value.split(",").map((L) => L.trim()));
  }
  function I(h) {
    let p = h.children[0];
    const g = p.children.length === 3;
    let C;
    g && (C = a(p.children[0]));
    let L = a(p.children[p.children.length - 1]);
    const q = L.split(".");
    q.length > 2 && fe("T007", h, p);
    let z, A;
    q.length === 2 ? (A = q[0], z = q[1], z.trim() === "" && fe("T007", h, z)) : z = L;
    const B = a(h.children[2]), P = B.substring(1, B.length - 1);
    return { namespace: C, startSegment: A, name: z, value: P, unsegmentedName: L };
  }
  function R(h) {
    for (let p of h) {
      const g = p.children[p.children.length - 1], C = N(a(g));
      C !== null && (g.text = C);
    }
  }
  function F(h) {
    const p = Jr(h), g = ir(h, a), L = !(g in pr) || g === "property", q = g !== "event" && g !== "method", z = Zr(h);
    Ly(z), _y(z, a), R(z), W(p), O(p, q);
    let A = !1, B = !1;
    for (let G = 0; G < p.length; ++G) {
      const Q = p[G];
      let K;
      if (Q.kind == S.Script) {
        B = !0;
        continue;
      }
      if (Q.kind === S.ElementNode) {
        K = F(Q), p[G] = K;
        continue;
      }
      let te = a(Q);
      Q.kind === S.StringLiteral ? te = te.slice(1, -1) : Q.kind === S.CData && (A = !0), L ? A ? K = $y(te) : K = gn(te) : K = {
        kind: S.TextNode,
        text: te
      }, p[G] = K;
    }
    const P = [], M = [];
    let E = !1;
    for (const G of p) {
      if (G.kind === S.ElementNode) {
        if ((ir(G, a) ?? void 0) in pr) {
          P.push(G);
          continue;
        }
        E = !0;
      }
      M.push(G);
    }
    if (B && E) {
      const G = Tn(M);
      return P.push(G), yn(h, P);
    }
    return h;
  }
  function Z(h) {
    for (let p = 0; p < h.length; ++p)
      if (h[p].kind === S.StringLiteral || h[p].kind === S.TextNode) {
        const g = /[\f\n\r\t\v\u0020\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g;
        h[p].text = a(h[p]).replace(
          g,
          " "
        );
      }
  }
  function V(h) {
    for (let p = 0; p < h.length; ++p)
      h[p].kind === S.CData && (h[p].text = a(h[p]).slice(ky, -3));
  }
  function W(h) {
    for (let p of h)
      if (p.kind === S.StringLiteral || p.kind === S.TextNode) {
        const g = N(a(p));
        g !== null && (p.text = g);
      }
  }
  function N(h) {
    let p = "", g = 0;
    for (let C = 0; C < h.length; ++C)
      if (h.charCodeAt(C) === $.ampersand)
        switch (h.charCodeAt(C + 1)) {
          case $.a:
            switch (h.charCodeAt(C + 2)) {
              case $.m:
                h.charCodeAt(C + 3) === $.p && h.charCodeAt(C + 4) === $.semicolon && (p = p + h.substring(g, C) + "&", C += 4, g = C + 1);
                break;
              case $.p:
                h.charCodeAt(C + 3) === $.o && h.charCodeAt(C + 4) === $.s && h.charCodeAt(C + 5) === $.semicolon && (p = p + h.substring(g, C) + "'", C += 5, g = C + 1);
                break;
            }
            break;
          case $.g:
            h.charCodeAt(C + 2) === $.t && h.charCodeAt(C + 3) === $.semicolon && (p = p + h.substring(g, C) + ">", C += 3, g = C + 1);
            break;
          case $.l:
            h.charCodeAt(C + 2) === $.t && h.charCodeAt(C + 3) === $.semicolon && (p = p + h.substring(g, C) + "<", C += 3, g = C + 1);
            break;
          case $.q:
            h.charCodeAt(C + 2) === $.u && h.charCodeAt(C + 3) === $.o && h.charCodeAt(C + 4) === $.t && h.charCodeAt(C + 5) === $.semicolon && (p = p + h.substring(g, C) + '"', C += 5, g = C + 1);
            break;
          case $.n:
            h.charCodeAt(C + 2) === $.b && h.charCodeAt(C + 3) === $.s && h.charCodeAt(C + 4) === $.p && h.charCodeAt(C + 5) === $.semicolon && (p = p + h.substring(g, C) + " ", C += 5, g = C + 1);
            break;
        }
    return g === 0 ? null : (p += h.substring(g), p);
  }
  function O(h, p) {
    p && Z(h), V(h);
    for (let g = h.length - 1; g > 0; --g) {
      const C = h[g - 1], L = h[g];
      C.kind === S.StringLiteral && L.kind === S.CData ? (h[g - 1] = {
        kind: S.CData,
        text: a(C).slice(1, -1) + a(L)
      }, h.pop()) : C.kind === S.CData && L.kind === S.StringLiteral ? (h[g - 1] = {
        kind: S.CData,
        text: a(C) + a(L).slice(1, -1)
      }, h.pop()) : C.kind === S.CData && L.kind === S.TextNode ? (h[g - 1] = {
        kind: S.CData,
        text: a(C) + a(L)
      }, h.pop()) : C.kind === S.CData && L.kind === S.CData ? (h[g - 1] = {
        kind: S.CData,
        text: a(C) + a(L)
      }, h.pop()) : C.kind === S.TextNode && L.kind === S.TextNode ? (a(C).endsWith(" ") && a(L).startsWith(" ") && (C.text = a(C).trimEnd()), h[g - 1] = {
        kind: S.TextNode,
        text: a(C) + a(L)
      }, h.pop()) : C.kind === S.TextNode && L.kind === S.CData && (h[g - 1] = {
        kind: S.CData,
        text: a(C) + a(L)
      }, h.pop());
    }
  }
}
function $y(e) {
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
function fe(e, ...t) {
  let r = yy[e] ?? "Unknown error";
  throw t && t.forEach((a, n) => r = o(r, `{${n}}`, a.toString())), new di(r, e);
  function o(a, n, i) {
    do
      a = a.replace(n, i);
    while (a.includes(n));
    return a;
  }
}
function Rt(e) {
  return e.type;
}
function Go(e, t) {
  return e ? Array.isArray(e) ? typeof e == "string" ? [e, t] : (e.push(t), e) : [e, t] : t;
}
function Tn(e) {
  const t = {
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
      t,
      { kind: S.NodeEnd },
      { kind: S.ContentListNode, children: e },
      { kind: S.CloseNodeStart },
      t,
      { kind: S.NodeEnd }
    ]
  };
}
function Zr(e) {
  var t, r;
  return ((r = (t = e.children) == null ? void 0 : t.find((o) => o.kind === S.AttributeListNode)) == null ? void 0 : r.children) ?? [];
}
function Jr(e) {
  var t, r;
  return ((r = (t = e.children) == null ? void 0 : t.find((o) => o.kind === S.ContentListNode)) == null ? void 0 : r.children) ?? [];
}
function yn(e, t) {
  var o;
  const r = (o = e.children) == null ? void 0 : o.findIndex((a) => a.kind === S.ContentListNode);
  return r === void 0 || r === -1 ? e : {
    ...e,
    children: [
      ...e.children.slice(0, r),
      { ...e.children[r], children: t },
      ...e.children.slice(r)
    ]
  };
}
function Ly(e) {
  var t;
  for (let r of e)
    if (((t = r.children) == null ? void 0 : t.length) === 1) {
      const o = {
        kind: S.Equal
      }, a = {
        kind: S.StringLiteral,
        text: '"true"'
      };
      r.children.push(o, a);
    }
}
function _y(e, t) {
  var r, o, a;
  for (let n of e) {
    const i = (r = n.children) == null ? void 0 : r[2];
    ((a = (o = n.children) == null ? void 0 : o[2]) == null ? void 0 : a.kind) === S.Identifier && (i.text = '"' + t(i) + '"');
  }
}
function Cn(e, t, r, o) {
  let a = o.split(":");
  if (a.length > 2)
    return fe("T028", o, "Namespace cannot contain multiple ':' (colon).");
  let n = o;
  if (a.length === 2) {
    if (a[0] != Ia)
      return fe("T029", o, Ia);
    n = a[1];
  }
  if (n.includes("#"))
    return fe("T028", n, "Namespace cannot contain character '#'.");
  switch (n) {
    case Ia:
      n = r;
      break;
    case Sy:
      n = wy;
      break;
    case Hy:
      n = By;
      break;
  }
  const i = e[e.length - 1];
  if (i.has(r))
    return fe("T025", r);
  i.set(r, n), t.namespaces ?? (t.namespaces = {}), t.namespaces[r] = n;
}
function Ay(e, t) {
  e.children.length !== 2 && fe("T001");
  const r = e.children[0];
  return r.kind !== S.ElementNode && fe("T001"), r;
}
function ir(e, t) {
  const r = e.children.find((a) => a.kind === S.TagNameNode).children;
  return t(r.at(-1));
}
function kn(e, t, r) {
  const o = e.children.find((l) => l.kind === S.TagNameNode).children, a = t(o.at(-1));
  if (o.length === 1)
    return a;
  const n = t(o[0]);
  r.length === 0 && fe("T026");
  let i;
  for (let l = r.length - 1; l >= 0 && (i = r[l].get(n), i === void 0); --l)
    ;
  return i === void 0 && fe("T027", n), i + "." + a;
}
function Ny(e, t = 0, r) {
  const { parse: o, getText: a } = fy(e), { node: n, errors: i } = o();
  if (i.length > 0) {
    const l = [];
    for (let x = 0; x < e.length; ++x)
      e[x] === `
` && l.push(x);
    const s = Wy(i, l), v = Sn(n, a);
    return { component: null, errors: s, erroneousCompoundComponentName: v };
  }
  try {
    return { component: Iy(n, a, t, r), errors: [] };
  } catch (l) {
    const s = Sn(n, a), v = {
      message: l.message,
      col: 0,
      line: 0,
      code: Tr.expEq,
      category: io.Error,
      pos: 0,
      end: 0
    };
    return {
      component: null,
      erroneousCompoundComponentName: s,
      errors: [v]
    };
  }
}
function Wy(e, t) {
  if (t.length === 0) {
    for (let r of e)
      r.line = 1, r.col = r.pos + 1;
    return e;
  }
  for (let r of e) {
    let o = 0;
    for (; o < t.length; ++o) {
      const n = t[o];
      if (r.pos < n) {
        r.line = o + 1, r.col = r.pos - (t[o - 1] ?? 0) + 1;
        break;
      }
    }
    const a = t[t.length - 1];
    r.pos >= a && (r.line = t.length + 1, r.col = r.pos - a + 0);
  }
  return e;
}
function Sn(e, t) {
  var s, v, x, c, T, b;
  const r = (s = e == null ? void 0 : e.children) == null ? void 0 : s[0], o = (x = (v = r == null ? void 0 : r.children) == null ? void 0 : v.find(
    (f) => f.kind === S.TagNameNode
  )) == null ? void 0 : x.children, a = o == null ? void 0 : o[o.length - 1];
  if (a === void 0 || t(a) !== "Component")
    return;
  const n = (T = (c = r.children) == null ? void 0 : c.find((f) => f.kind === S.AttributeListNode)) == null ? void 0 : T.children, i = (b = n == null ? void 0 : n.find(
    (f) => f.kind === S.AttributeNode && t(f == null ? void 0 : f.children[0]) === "name"
  )) == null ? void 0 : b.children, l = i == null ? void 0 : i[i.length - 1];
  if (l !== void 0 && l.kind === S.StringLiteral) {
    const f = t(l);
    return f.substring(1, f.length - 1);
  }
}
function Oy(e, t) {
  const r = Ny(t).component;
  if (!r)
    throw new Error(`Failed to parse ${e} component definition during build.`);
  return r;
}
const Ga = "FormSection", Ry = k({
  status: "experimental",
  description: `The \`${Ga}\` is a component that groups cohesive elements together within a \`Form\`. This grouping is indicated visually: the child components of the \`${Ga}\` are placed in a [\`FlowLayout\`](./FlowLayout.mdx) component.`
}), zy = `
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
Oy(Ga, zy);
const Vy = '"[]"', Ey = {
  themeVars: Vy
}, Py = "ButtonGroup", Dy = k({
  status: "in progress",
  description: `(**NOT IMPLEMENTED YET**) The \`${Py}\` component is a container that embeds buttons used together for a particular reason. It provides a view that emphasizes this coherency.`,
  props: {
    themeColor: {
      description: "This optional property specifies the default theme color for the buttons in the group. Individual buttons may override this setting with their `themeColor` property.",
      availableValues: Qa,
      valueType: "string",
      defaultValue: "primary"
    },
    variant: {
      description: "This optional property specifies the default variant for the buttons in the group. Individual buttons may override this setting with their `variant` property.",
      availableValues: Za,
      valueType: "string",
      defaultValue: "solid"
    },
    orientation: Zn("horizontal"),
    buttonWidth: {
      description: "When this optional property is set, all buttons within the group will have the specified width. If it is empty, each button's width accommodates its content."
    },
    gap: {
      description: "When this optional property is set, adjacent buttons will have the specified gap between them. If this property is not set, the buttons will be merged into one group."
    }
  },
  themeVars: j(Ey.themeVars),
  defaultThemeVars: {
    light: {},
    dark: {}
  }
}), My = "Breakout", Fy = k({
  description: `The \`${My}\` component creates a breakout section. It allows its child to occupy the entire width of the UI even if the app or the parent container constrains the maximum content width.`
}), Uy = `'{"width-Carousel": "var(--xmlui-width-Carousel)", "height-Carousel": "var(--xmlui-height-Carousel)", "height-control-Carousel": "var(--xmlui-height-control-Carousel)", "width-control-Carousel": "var(--xmlui-width-control-Carousel)", "textColor-control-Carousel": "var(--xmlui-textColor-control-Carousel)", "backgroundColor-control-Carousel": "var(--xmlui-backgroundColor-control-Carousel)", "borderRadius-control-Carousel": "var(--xmlui-borderRadius-control-Carousel)", "backgroundColor-control-hover-Carousel": "var(--xmlui-backgroundColor-control-hover-Carousel)", "textColor-control-hover-Carousel": "var(--xmlui-textColor-control-hover-Carousel)", "backgroundColor-control-active-Carousel": "var(--xmlui-backgroundColor-control-active-Carousel)", "textColor-control-active-Carousel": "var(--xmlui-textColor-control-active-Carousel)", "textColor-control-disabled-Carousel": "var(--xmlui-textColor-control-disabled-Carousel)", "backgroundColor-control-disabled-Carousel": "var(--xmlui-backgroundColor-control-disabled-Carousel)", "width-indicator-Carousel": "var(--xmlui-width-indicator-Carousel)", "height-indicator-Carousel": "var(--xmlui-height-indicator-Carousel)", "textColor-indicator-Carousel": "var(--xmlui-textColor-indicator-Carousel)", "backgroundColor-indicator-Carousel": "var(--xmlui-backgroundColor-indicator-Carousel)", "backgroundColor-indicator-hover-Carousel": "var(--xmlui-backgroundColor-indicator-hover-Carousel)", "textColor-indicator-hover-Carousel": "var(--xmlui-textColor-indicator-hover-Carousel)", "backgroundColor-indicator-active-Carousel": "var(--xmlui-backgroundColor-indicator-active-Carousel)", "textColor-indicator-active-Carousel": "var(--xmlui-textColor-indicator-active-Carousel)"}'`, qy = "_carousel_1jsvj_13", Gy = "_carouselContentWrapper_1jsvj_30", Yy = "_carouselContent_1jsvj_30", Xy = "_vertical_1jsvj_40", jy = "_controls_1jsvj_51", Qy = "_controlButton_1jsvj_60", Zy = "_indicators_1jsvj_87", Jy = "_indicator_1jsvj_87", Ky = "_active_1jsvj_107", ft = {
  themeVars: Uy,
  carousel: qy,
  carouselContentWrapper: Gy,
  carouselContent: Yy,
  vertical: Xy,
  controls: jy,
  controlButton: Qy,
  indicators: Zy,
  indicator: Jy,
  active: Ky
}, eC = Qt({
  register: (e) => {
  },
  unRegister: (e) => {
  }
});
function tC() {
  const [e, t] = me([]), r = ce(() => ({
    register: (o) => {
      t(
        Nr((a) => {
          const n = a.findIndex((i) => i.id === o.id);
          n < 0 ? a.push(o) : a[n] = o;
        })
      );
    },
    unRegister: (o) => {
      t(
        Nr((a) => a.filter((n) => n.id !== o))
      );
    }
  }), [t]);
  return {
    carouselItems: e,
    carouselContextValue: r
  };
}
const je = {
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
ve(function({
  orientation: t = je.orientation,
  children: r,
  style: o,
  indicators: a = je.indicators,
  onDisplayDidChange: n = de,
  autoplay: i = je.autoplay,
  controls: l = je.controls,
  loop: s = je.loop,
  startIndex: v = je.startIndex,
  prevIcon: x,
  nextIcon: c,
  transitionDuration: T = je.transitionDuration,
  autoplayInterval: b = je.autoplayInterval,
  stopAutoplayOnInteraction: f = je.stopAutoplayOnInteraction,
  registerComponentApi: y
}, w) {
  const _ = he(null), [H, I] = me(0), [R, F] = me([]), [Z, V] = me(!1), { carouselContextValue: W, carouselItems: N } = tC(), O = w ? sr(_, w) : _, [h, p] = Rd(
    {
      axis: t === "horizontal" ? "x" : "y",
      loop: s,
      startIndex: v,
      duration: T
    },
    R
  ), g = x || t === "horizontal" ? "arrowleft" : "arrowup", C = c || t === "horizontal" ? "arrowright" : "arrowdown";
  ee(() => {
    i && F([
      zd({
        delay: b,
        stopOnInteraction: f
      })
    ]);
  }, [b, i, f]);
  const L = X(() => {
    var be;
    const K = (be = p == null ? void 0 : p.plugins()) == null ? void 0 : be.autoplay;
    if (!K) return;
    (K.isPlaying() ? K.stop : K.play)();
  }, [p]);
  ee(() => {
    var te;
    const K = (te = p == null ? void 0 : p.plugins()) == null ? void 0 : te.autoplay;
    K && (V(K.isPlaying()), p.on("autoplay:play", () => V(!0)).on("autoplay:stop", () => V(!1)).on("reInit", () => V(K.isPlaying())));
  }, [p]);
  const q = X(
    (K) => {
      p == null || p.scrollTo(K);
    },
    [p]
  ), [z, A] = Pe.useState(!1), [B, P] = Pe.useState(!1), M = Pe.useCallback(
    (K) => {
      if (!K)
        return;
      const te = K.selectedScrollSnap();
      n(te), I(te), A(K.canScrollPrev()), P(K.canScrollNext());
    },
    [n]
  ), E = X(() => {
    p && (p == null || p.scrollPrev());
  }, [p]), G = X(() => {
    p == null || p.scrollNext();
  }, [p]), Q = X(
    (K) => {
      t === "horizontal" ? K.key === "ArrowLeft" ? (K.preventDefault(), E()) : K.key === "ArrowRight" && (K.preventDefault(), G()) : K.key === "ArrowUp" ? (K.preventDefault(), E()) : K.key === "ArrowDown" && (K.preventDefault(), G());
    },
    [t, E, G]
  );
  return ee(() => {
    y == null || y({
      scrollTo: q,
      scrollPrev: E,
      scrollNext: G,
      canScrollPrev: () => z,
      canScrollNext: () => B
    });
  }, [y, q, E, G, z, B]), Pe.useEffect(() => {
    if (p)
      return M(p), p.on("init", M), p.on("reInit", M), p.on("select", M), () => {
        p == null || p.off("select", M);
      };
  }, [p, M]), ee(() => {
    _ != null && _.current && _.current.addEventListener("keydown", Q);
  }, [O, Q]), /* @__PURE__ */ m(eC.Provider, { value: W, children: /* @__PURE__ */ J(
    "div",
    {
      style: o,
      ref: O,
      className: le(ft.carousel),
      role: "region",
      tabIndex: -1,
      "aria-roledescription": "carousel",
      children: [
        /* @__PURE__ */ m("div", { ref: h, className: ft.carouselContentWrapper, children: /* @__PURE__ */ m(
          "div",
          {
            className: le(ft.carouselContent, {
              [ft.horizontal]: t === "horizontal",
              [ft.vertical]: t === "vertical"
            }),
            children: r
          }
        ) }),
        l && /* @__PURE__ */ J("div", { className: ft.controls, children: [
          i && /* @__PURE__ */ m("button", { className: ft.controlButton, onClick: L, children: Z ? /* @__PURE__ */ m(ke, { name: "pause" }) : /* @__PURE__ */ m(ke, { name: "play" }) }),
          /* @__PURE__ */ m("button", { className: ft.controlButton, disabled: !z, onClick: E, children: /* @__PURE__ */ m(ke, { name: g }) }),
          /* @__PURE__ */ m("button", { className: ft.controlButton, onClick: G, disabled: !B, children: /* @__PURE__ */ m(ke, { name: C }) })
        ] }),
        a && /* @__PURE__ */ m("div", { className: ft.indicators, children: N.map((K, te) => /* @__PURE__ */ m(
          "button",
          {
            type: "button",
            onClick: () => q(te),
            className: le(ft.indicator, {
              [ft.active]: te === H
            }),
            "aria-current": te === H
          },
          te
        )) })
      ]
    }
  ) });
});
const Ee = "Carousel", rC = k({
  status: "in progress",
  description: "This component displays a slideshow by cycling through elements (images, text, or custom slides) like a carousel.",
  props: {
    orientation: {
      description: "This property indicates the orientation of the carousel. The `horizontal` value indicates that the carousel moves horizontally, and the `vertical` value indicates that the carousel moves vertically.",
      availableValues: aa,
      valueType: "string",
      defaultValue: je.orientation
    },
    indicators: {
      description: "This property indicates whether the carousel displays the indicators.",
      valueType: "boolean",
      defaultValue: je.indicators
    },
    controls: {
      description: "This property indicates whether the carousel displays the controls.",
      valueType: "boolean",
      defaultValue: je.controls
    },
    autoplay: {
      description: "This property indicates whether the carousel automatically scrolls.",
      valueType: "boolean",
      defaultValue: je.autoplay
    },
    loop: {
      description: "This property indicates whether the carousel loops.",
      valueType: "boolean",
      defaultValue: je.loop
    },
    startIndex: {
      description: "This property indicates the index of the first slide to display.",
      valueType: "number",
      defaultValue: je.startIndex
    },
    transitionDuration: {
      description: "This property indicates the duration of the transition between slides.",
      valueType: "number",
      defaultValue: je.transitionDuration
    },
    autoplayInterval: {
      description: "This property specifies the interval between autoplay transitions.",
      valueType: "number",
      defaultValue: je.autoplayInterval
    },
    stopAutoplayOnInteraction: {
      description: "This property indicates whether autoplay stops on interaction.",
      valueType: "boolean",
      defaultValue: je.stopAutoplayOnInteraction
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
    displayDidChange: tt(Ee)
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
  themeVars: j(ft.themeVars),
  themeVarDescriptions: {
    [`width-indicator-${Ee}`]: "Sets the width of the indicator."
  },
  defaultThemeVars: {
    [`backgroundColor-control-${Ee}`]: "$color-primary",
    [`textColor-control-${Ee}`]: "$textColor",
    [`backgroundColor-control-hover-${Ee}`]: "$color-primary",
    [`textColor-control-hover-${Ee}`]: "$textColor",
    [`backgroundColor-control-active-${Ee}`]: "$color-primary",
    [`backgroundColor-control-disabled-${Ee}`]: "$color-surface-200",
    [`textColor-control-disabled-${Ee}`]: "$textColor-disabled",
    [`textColor-control-active-${Ee}`]: "$color-primary",
    [`backgroundColor-indicator-${Ee}`]: "$color-surface-200",
    [`backgroundColor-indicator-active-${Ee}`]: "$color-primary",
    [`textColor-indicator-${Ee}`]: "$color-primary",
    [`textColor-indicator-active-${Ee}`]: "$color-primary",
    [`backgroundColor-indicator-hover-${Ee}`]: "$color-surface-200",
    [`textColor-indicator-hover-${Ee}`]: "$color-primary",
    [`width-indicator-${Ee}`]: "25px",
    [`height-indicator-${Ee}`]: "6px",
    [`height-control-${Ee}`]: "36px",
    [`width-control-${Ee}`]: "36px",
    [`borderRadius-control-${Ee}`]: "50%",
    [`height-${Ee}`]: "100%",
    [`width-${Ee}`]: "100%"
  }
}), oC = "ToneChangerButton", aC = k({
  status: "experimental",
  description: `The \`${oC}\` component is a component that allows the user to change the tone of the app.`,
  props: {}
}), iC = "Option", nC = k({
  description: `\`${iC}\` is a non-visual component describing a selection option. Other components (such as \`Select\`, \`AutoComplete\`, and others) may use nested \`Option\` instances from which the user can select.`,
  props: {
    label: u(
      "This property defines the text to display for the option. If `label` is not defined, `Option` will use the `value` as the label."
    ),
    value: u(
      "This property defines the value of the option. If `value` is not defined, `Option` will use the `label` as the value."
    ),
    enabled: Ze(),
    optionTemplate: u("This property is used to define a custom option template")
  }
}), lC = $n((e) => {
  const t = Xb();
  return t ? /* @__PURE__ */ m(t, { ...e }) : null;
});
lC.displayName = "OptionNative";
const De = "AutoComplete", dC = k({
  description: "This component is a dropdown with a list of options. According to the `multi` property, the user can select one or more items.",
  status: "experimental",
  props: {
    placeholder: Er(),
    initialValue: St(),
    maxLength: Ao(),
    autoFocus: rt(),
    required: Nt(),
    readOnly: _t(),
    enabled: Ze(),
    validationStatus: At(),
    dropdownHeight: u("This property sets the height of the dropdown list."),
    multi: Xn(),
    optionTemplate: Ve(
      "This property enables the customization of list items. To access the attributes of a list item use the `$item` context variable."
    ),
    emptyListTemplate: u(
      "This property defines the template to display when the list of options is empty."
    )
  },
  events: {
    gotFocus: Ct(De),
    lostFocus: kt(De),
    didChange: tt(De)
  },
  apis: {
    focus: er(De),
    value: u(
      "You can query the component's value. If no value is set, it will retrieve `undefined`."
    ),
    setValue: Kt()
  },
  contextVars: {
    $item: u(
      "This context value represents an item when you define an option item template. Use `$item.value` and `$item.label` to refer to the value and label of the particular option."
    )
  },
  themeVars: j(Je.themeVars),
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
      [`textColor-item-${De}--disabled`]: "$color-surface-200",
      [`textColor-${De}-badge`]: "$color-surface-50"
    },
    dark: {
      [`backgroundColor-${De}-badge--hover`]: "$color-primary-600",
      [`backgroundColor-${De}-badge--active`]: "$color-primary-500",
      [`textColor-${De}-badge`]: "$color-surface-50",
      [`textColor-item-${De}--disabled`]: "$color-surface-800"
    }
  }
}), sC = '"[]"', uC = "_backdropContainer_18iuc_13", cC = "_backdrop_18iuc_13", mC = "_overlay_18iuc_26", Qo = {
  themeVars: sC,
  backdropContainer: uC,
  backdrop: cC,
  overlay: mC
}, Ya = {
  backgroundColor: "black",
  opacity: "0.1"
};
ve(function({
  style: t,
  children: r,
  overlayTemplate: o,
  backgroundColor: a = Ya.backgroundColor,
  opacity: n = Ya.opacity
}, i) {
  const l = { ...t, width: void 0 };
  return /* @__PURE__ */ J(
    "div",
    {
      className: Qo.backdropContainer,
      style: { width: t.width ?? "fit-content" },
      ref: i,
      children: [
        r,
        /* @__PURE__ */ m("div", { className: Qo.backdrop, style: { ...l, backgroundColor: a, opacity: n } }),
        o && /* @__PURE__ */ m("div", { className: Qo.overlay, children: o })
      ]
    }
  );
});
const pC = "Backdrop", hC = k({
  status: "stable",
  description: `The \`${pC}\` component is a semi-transparent overlay that appears on top of its child component to obscure or highlight the content behind it.`,
  props: {
    overlayTemplate: Ve(
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
  themeVars: j(Qo.themeVars)
}), xC = k({
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
}), bC = k({
  status: "experimental",
  description: "This component renders an HTML `address` tag.",
  isHtmlTag: !0
}), vC = k({
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
}), fC = k({
  status: "experimental",
  description: "This component renders an HTML `article` tag.",
  isHtmlTag: !0
}), gC = k({
  status: "experimental",
  description: "This component renders an HTML `aside` tag.",
  isHtmlTag: !0
}), TC = k({
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
}), yC = k({
  status: "experimental",
  description: "This component renders an HTML `b` tag.",
  isHtmlTag: !0
}), CC = k({
  status: "experimental",
  description: "This component renders an HTML `bdi` tag.",
  isHtmlTag: !0
}), kC = k({
  status: "experimental",
  description: "This component renders an HTML `bdo` tag.",
  isHtmlTag: !0,
  props: {
    dir: u("Specifies the text direction override")
  }
}), SC = k({
  status: "experimental",
  description: "This component renders an HTML `blockquote` tag.",
  isHtmlTag: !0,
  props: {
    cite: u("Specifies the source of the quotation")
  }
}), wC = k({
  status: "experimental",
  description: "This component renders an HTML `br` tag.",
  isHtmlTag: !0
}), HC = k({
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
}), BC = k({
  status: "experimental",
  description: "This component renders an HTML `canvas` tag.",
  isHtmlTag: !0,
  props: {
    width: u("Specifies the width of the canvas"),
    height: u("Specifies the height of the canvas")
  }
}), IC = k({
  status: "experimental",
  description: "This component renders an HTML `caption` tag.",
  isHtmlTag: !0
}), $C = k({
  status: "experimental",
  description: "This component renders an HTML `cite` tag.",
  isHtmlTag: !0
}), wn = k({
  status: "experimental",
  description: "This component renders an HTML `code` tag.",
  isHtmlTag: !0
}), LC = k({
  status: "experimental",
  description: "This component renders an HTML `col` tag.",
  isHtmlTag: !0,
  props: {
    span: u("Specifies the number of columns a `col` element should span")
  }
}), _C = k({
  status: "experimental",
  description: "This component renders an HTML `colgroup` tag.",
  isHtmlTag: !0,
  props: {
    span: u("Specifies the number of columns in a `colgroup`")
  }
}), AC = k({
  status: "experimental",
  description: "This component renders an HTML `data` tag.",
  isHtmlTag: !0,
  props: {
    value: u("Specifies the machine-readable value of the element")
  }
}), NC = k({
  status: "experimental",
  description: "This component renders an HTML `datalist` tag.",
  isHtmlTag: !0
}), WC = k({
  status: "experimental",
  description: "This component renders an HTML `dd` tag.",
  isHtmlTag: !0
}), OC = k({
  status: "experimental",
  description: "This component renders an HTML `del` tag.",
  isHtmlTag: !0,
  props: {
    cite: u("Specifies the source of the quotation"),
    dateTime: u("Specifies the date and time of the edit")
  }
}), RC = k({
  status: "experimental",
  description: "This component renders an HTML `details` tag.",
  isHtmlTag: !0,
  props: {
    open: u("Specifies that the details are visible (open)")
  }
}), zC = k({
  status: "experimental",
  description: "This component renders an HTML `dfn` tag.",
  isHtmlTag: !0
}), VC = k({
  status: "experimental",
  description: "This component renders an HTML `dialog` tag.",
  isHtmlTag: !0,
  props: {
    open: u("Specifies that the dialog is open")
  }
}), EC = k({
  status: "experimental",
  description: "This component renders an HTML `div` tag.",
  isHtmlTag: !0
}), PC = k({
  status: "experimental",
  description: "This component renders an HTML `dl` tag.",
  isHtmlTag: !0
}), DC = k({
  status: "experimental",
  description: "This component renders an HTML `dt` tag.",
  isHtmlTag: !0
}), Hn = k({
  status: "experimental",
  description: "This component renders an HTML `em` tag.",
  isHtmlTag: !0
}), MC = k({
  status: "experimental",
  description: "This component renders an HTML `embed` tag.",
  isHtmlTag: !0,
  props: {
    src: u("Specifies the URL of the resource"),
    type: u("Specifies the type of the resource"),
    width: u("Specifies the width of the embed"),
    height: u("Specifies the height of the embed")
  }
}), FC = k({
  status: "experimental",
  description: "This component renders an HTML `fieldset` tag.",
  isHtmlTag: !0,
  props: {
    disabled: u("Specifies that the fieldset should be disabled"),
    form: u("Specifies the form the fieldset belongs to"),
    name: u("Specifies a name for the fieldset")
  }
}), UC = k({
  status: "experimental",
  description: "This component renders an HTML `figcaption` tag.",
  isHtmlTag: !0
}), qC = k({
  status: "experimental",
  description: "This component renders an HTML `figure` tag.",
  isHtmlTag: !0
}), GC = k({
  status: "experimental",
  description: "This component renders an HTML `footer` tag.",
  isHtmlTag: !0
}), YC = k({
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
}), XC = k({
  status: "experimental",
  description: "This component renders an HTML `h1` tag.",
  isHtmlTag: !0,
  themeVars: j(ot.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem"
  }
}), jC = k({
  status: "experimental",
  description: "This component renders an HTML `h2` tag.",
  isHtmlTag: !0,
  themeVars: j(ot.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem"
  }
}), QC = k({
  status: "experimental",
  description: "This component renders an HTML `h3` tag.",
  isHtmlTag: !0,
  themeVars: j(ot.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem"
  }
}), ZC = k({
  status: "experimental",
  description: "This component renders an HTML `h4` tag.",
  isHtmlTag: !0,
  themeVars: j(ot.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem"
  }
}), JC = k({
  status: "experimental",
  description: "This component renders an HTML `h5` tag.",
  isHtmlTag: !0,
  themeVars: j(ot.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem"
  }
}), KC = k({
  status: "experimental",
  description: "This component renders an HTML `h6` tag.",
  isHtmlTag: !0,
  themeVars: j(ot.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem"
  }
}), ek = k({
  status: "experimental",
  description: "This component renders an HTML `header` tag.",
  isHtmlTag: !0
}), tk = k({
  status: "experimental",
  description: "This component renders an HTML `hr` tag.",
  isHtmlTag: !0
}), rk = k({
  status: "experimental",
  description: "This component renders an HTML `i` tag.",
  isHtmlTag: !0
}), ok = k({
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
}), ak = k({
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
}), ik = k({
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
}), nk = k({
  status: "experimental",
  description: "This component renders an HTML `ins` tag.",
  isHtmlTag: !0,
  props: {
    cite: u("Specifies the source URL for the inserted text"),
    dateTime: u("Specifies the date and time when the text was inserted")
  }
}), lk = k({
  status: "experimental",
  description: "This component renders an HTML `kbd` tag.",
  isHtmlTag: !0
}), dk = k({
  status: "experimental",
  description: "This component renders an HTML `label` tag.",
  isHtmlTag: !0,
  props: {
    htmlFor: u("Specifies which form element a label is bound to")
  }
}), sk = k({
  status: "experimental",
  description: "This component renders an HTML `legend` tag.",
  isHtmlTag: !0
}), uk = k({
  status: "experimental",
  description: "This component renders an HTML `li` tag.",
  isHtmlTag: !0,
  props: {
    value: u("Specifies the value of the list item (if the parent is an ordered list)")
  }
}), ck = k({
  status: "experimental",
  description: "This component renders an HTML `main` tag.",
  isHtmlTag: !0
}), mk = k({
  status: "experimental",
  description: "This component renders an HTML `map` tag.",
  isHtmlTag: !0,
  props: {
    name: u("Specifies the name of the map")
  }
}), pk = k({
  status: "experimental",
  description: "This component renders an HTML `mark` tag.",
  isHtmlTag: !0
}), hk = k({
  status: "experimental",
  description: "This component renders an HTML `menu` tag.",
  isHtmlTag: !0,
  props: {
    type: u("Specifies the type of the menu")
  }
}), xk = k({
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
}), bk = k({
  status: "experimental",
  description: "This component renders an HTML `nav` tag.",
  isHtmlTag: !0
}), vk = k({
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
}), fk = k({
  status: "experimental",
  description: "This component renders an HTML `ol` tag.",
  isHtmlTag: !0,
  themeVars: j(ot.themeVarsList),
  // Use only themeVarsList
  defaultThemeVars: {
    "marginTop-HtmlOl": "$space-4",
    "marginBottom-HtmlOl": "$space-4"
  }
}), gk = k({
  status: "experimental",
  description: "This component renders an HTML `optgroup` tag.",
  isHtmlTag: !0,
  props: {
    label: u("Specifies the label for the option group"),
    disabled: u("Specifies that the option group is disabled")
  }
}), Tk = k({
  status: "experimental",
  description: "This component renders an HTML `option` tag.",
  isHtmlTag: !0,
  props: {
    disabled: u("Specifies that the option should be disabled"),
    label: u("Specifies the label of the option"),
    selected: u("Specifies that the option should be pre-selected"),
    value: u("Specifies the value of the option")
  }
}), yk = k({
  status: "experimental",
  description: "This component renders an HTML `output` tag.",
  isHtmlTag: !0,
  props: {
    form: u("Specifies the form element that the output is associated with"),
    htmlFor: u("Specifies the IDs of the elements that this output is related to"),
    name: u("Specifies the name of the output")
  }
}), Ck = k({
  status: "experimental",
  description: "This component renders an HTML `p` tag.",
  isHtmlTag: !0
}), kk = k({
  status: "experimental",
  description: "This component renders an HTML `param` tag.",
  isHtmlTag: !0,
  props: {
    name: u("Specifies the name of the parameter"),
    value: u("Specifies the value of the parameter")
  }
}), Sk = k({
  status: "experimental",
  description: "This component renders an HTML `picture` tag.",
  isHtmlTag: !0
}), wk = k({
  status: "experimental",
  description: "This component renders an HTML `pre` tag.",
  isHtmlTag: !0
}), Hk = k({
  status: "experimental",
  description: "This component renders an HTML `progress` tag.",
  isHtmlTag: !0,
  props: {
    max: u("Specifies the maximum value of the progress element"),
    value: u("Specifies the current value of the progress element")
  }
}), Bk = k({
  status: "experimental",
  description: "This component renders an HTML `q` tag.",
  isHtmlTag: !0,
  props: {
    cite: u("Specifies the source URL of the quotation")
  }
}), Ik = k({
  status: "experimental",
  description: "This component renders an HTML `rp` tag.",
  isHtmlTag: !0
}), $k = k({
  status: "experimental",
  description: "This component renders an HTML `rt` tag.",
  isHtmlTag: !0
}), Lk = k({
  status: "experimental",
  description: "This component renders an HTML `ruby` tag.",
  isHtmlTag: !0
}), _k = k({
  status: "experimental",
  description: "This component renders an HTML `s` tag.",
  isHtmlTag: !0
}), Ak = k({
  status: "experimental",
  description: "This component renders an HTML `samp` tag.",
  isHtmlTag: !0
}), Nk = k({
  status: "experimental",
  description: "This component renders an HTML `section` tag.",
  isHtmlTag: !0
}), Wk = k({
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
}), Ok = k({
  status: "experimental",
  description: "This component renders an HTML `small` tag.",
  isHtmlTag: !0
}), Rk = k({
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
}), zk = k({
  status: "experimental",
  description: "This component renders an HTML `span` tag.",
  isHtmlTag: !0
}), Vk = k({
  status: "experimental",
  description: "This component renders an HTML `strong` tag.",
  isHtmlTag: !0
}), Ek = k({
  status: "experimental",
  description: "This component renders an HTML `sub` tag.",
  isHtmlTag: !0
}), Pk = k({
  status: "experimental",
  description: "This component renders an HTML `summary` tag.",
  isHtmlTag: !0
}), Dk = k({
  status: "experimental",
  description: "This component renders an HTML `sup` tag.",
  isHtmlTag: !0
}), Mk = k({
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
  themeVars: j(ot.themeVarsTable),
  defaultThemeVars: {
    "backgroundColor-HtmlTable": "$backgroundColor",
    "border-HtmlTable": "1px solid $borderColor",
    "marginBottom-HtmlTable": "$space-4",
    "marginTop-HtmlTable": "$space-4"
  }
}), Fk = k({
  status: "experimental",
  description: "This component renders an HTML `tbody` tag.",
  isHtmlTag: !0,
  themeVars: j(ot.themeVarsTbody)
}), Uk = k({
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
  themeVars: j(ot.themeVarsTd),
  defaultThemeVars: {
    "padding-HtmlTd": "$space-2",
    "borderBottom-HtmlTd": "1px solid $borderColor"
  }
}), qk = k({
  status: "experimental",
  description: "This component renders an HTML `template` tag.",
  isHtmlTag: !0
}), Gk = k({
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
}), Yk = k({
  status: "experimental",
  description: "This component renders an HTML `tfoot` tag.",
  isHtmlTag: !0,
  themeVars: j(ot.themeVarsTfoot)
}), Xk = k({
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
  themeVars: j(ot.themeVarsTh),
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
}), jk = k({
  status: "experimental",
  description: "This component renders an HTML `thead` tag.",
  isHtmlTag: !0,
  themeVars: j(ot.themeVarsThead),
  defaultThemeVars: {
    "textTransform-HtmlThead": "uppercase",
    light: {
      "backgroundColor-HtmlThead": "$color-surface-100",
      "textColor-HtmlThead": "$color-surface-500"
    },
    dark: {
      "backgroundColor-HtmlThead": "$color-surface-950"
    }
  }
}), Qk = k({
  status: "experimental",
  description: "This component renders an HTML `time` tag.",
  isHtmlTag: !0,
  props: {
    dateTime: u("Specifies the date and time in a machine-readable format")
  }
}), Zk = k({
  status: "experimental",
  description: "This component renders an HTML `tr` tag.",
  isHtmlTag: !0,
  themeVars: j(ot.themeVarsTr),
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
}), Jk = k({
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
}), Kk = k({
  status: "experimental",
  description: "This component renders an HTML `u` tag.",
  isHtmlTag: !0
}), eS = k({
  status: "experimental",
  description: "This component renders an HTML `ul` tag.",
  isHtmlTag: !0,
  themeVars: j(ot.themeVarsList),
  // Use only themeVarsList
  defaultThemeVars: {
    "marginTop-HtmlUl": "$space-4",
    "marginBottom-HtmlUl": "$space-4"
  }
}), tS = k({
  status: "experimental",
  description: "This component renders an HTML `var` tag.",
  isHtmlTag: !0
}), rS = k({
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
}), oS = k({
  status: "experimental",
  description: "This component renders an HTML `wbr` tag.",
  isHtmlTag: !0
}), Xe = "Slider", aS = k({
  status: "experimental",
  description: `The \`${Xe}\` component allows you to select a numeric value between a range specified by minimum and maximum values.`,
  props: {
    initialValue: St(),
    label: qe(),
    labelPosition: Dt("top"),
    labelWidth: Zt(Xe),
    labelBreak: Jt(Xe),
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
    enabled: Ze(),
    autoFocus: rt(),
    required: Nt(),
    readOnly: _t(),
    validationStatus: At(),
    rangeStyle: u("This property allows you to apply custom styles to the range element of the slider."),
    thumbStyle: u("This property allows yout top apply custom styles to the thumb elements of the slider.")
  },
  events: {
    didChange: tt(Xe),
    gotFocus: Ct(Xe),
    lostFocus: kt(Xe)
  },
  apis: {
    focus: er(Xe),
    value: ia(),
    setValue: Kt()
  },
  themeVars: j(Ut.themeVars),
  defaultThemeVars: {
    [`backgroundColor-track-${Xe}`]: "$color-surface-200",
    [`backgroundColor-range-${Xe}`]: "$color-primary",
    [`borderWidth-thumb-${Xe}`]: "2px",
    [`borderStyle-thumb-${Xe}`]: "solid",
    [`borderColor-thumb-${Xe}`]: "$color-surface-50",
    [`backgroundColor-thumb-${Xe}`]: "$color-primary",
    [`boxShadow-thumb-${Xe}`]: "$boxShadow-md",
    light: {
      [`backgroundColor-track-${Xe}--disabled`]: "$color-surface-300",
      [`backgroundColor-range-${Xe}--disabled`]: "$color-surface-400"
    },
    dark: {
      [`backgroundColor-track-${Xe}--disabled`]: "$color-surface-600",
      [`backgroundColor-range-${Xe}--disabled`]: "$color-surface-800"
    }
  }
}), Kr = "ColorPicker", iS = k({
  description: "This component allows the user to select a color with the browser's default color picker control.",
  props: {
    initialValue: St(),
    label: qe(),
    labelPosition: Dt(),
    labelWidth: Zt(Kr),
    labelBreak: Jt(Kr),
    enabled: Ze(),
    autoFocus: rt(),
    required: Nt(),
    readOnly: _t(),
    validationStatus: At(Ho.validationStatus)
  },
  events: {
    didChange: tt(Kr),
    gotFocus: Ct(Kr),
    lostFocus: kt(Kr)
  },
  apis: {
    focus: er(Kr),
    value: ia(),
    setValue: Kt()
  },
  themeVars: j(oo.themeVars)
}), wS = {
  // --- HTML tags
  a: xC,
  address: bC,
  area: vC,
  article: fC,
  aside: gC,
  audio: TC,
  b: yC,
  bdi: CC,
  bdo: kC,
  blockquote: SC,
  br: wC,
  button: HC,
  canvas: BC,
  caption: IC,
  cite: $C,
  code: wn,
  col: LC,
  colgroup: _C,
  data: AC,
  datalist: NC,
  dd: WC,
  del: OC,
  details: RC,
  dfn: zC,
  dialog: VC,
  div: EC,
  dl: PC,
  dt: DC,
  em: Hn,
  embed: MC,
  fieldset: FC,
  figcaption: UC,
  figure: qC,
  footer: GC,
  form: YC,
  h1: XC,
  h2: jC,
  h3: QC,
  h4: ZC,
  h5: JC,
  h6: KC,
  header: ek,
  hr: tk,
  i: rk,
  iframe: ok,
  img: ak,
  input: ik,
  ins: nk,
  kbd: lk,
  label: dk,
  legend: sk,
  li: uk,
  main: ck,
  map: mk,
  mark: pk,
  menu: hk,
  meter: xk,
  nav: bk,
  object: vk,
  ol: fk,
  optgroup: gk,
  option: Tk,
  output: yk,
  p: Ck,
  param: kk,
  picture: Sk,
  pre: wk,
  progress: Hk,
  q: Bk,
  rp: Ik,
  rt: $k,
  ruby: Lk,
  s: _k,
  samp: Ak,
  section: Nk,
  select: Wk,
  small: Ok,
  source: Rk,
  span: zk,
  strong: Vk,
  sub: Ek,
  summary: Pk,
  sup: Dk,
  table: Mk,
  tbody: Fk,
  td: Uk,
  template: qk,
  textarea: Gk,
  tfoot: Yk,
  th: Xk,
  thead: jk,
  time: Qk,
  tr: Zk,
  track: Jk,
  u: Kk,
  ul: eS,
  var: tS,
  video: rS,
  wbr: oS,
  // --- Heavy xmlui components
  Accordion: FT,
  Alert: GT,
  APICall: JT,
  App: $c,
  AppHeader: Lc,
  AppState: _c,
  AutoComplete: dC,
  Avatar: Pc,
  Backdrop: hC,
  Badge: Gc,
  Bookmark: Xc,
  Breakout: Fy,
  Button: Ds,
  ButtonGroup: Dy,
  Card: fm,
  Carousel: rC,
  ChangeListener: Tm,
  Checkbox: $m,
  CODE: wn,
  ColorPicker: iS,
  Column: LT,
  ContentSeparator: Nm,
  DataSource: KT,
  DatePicker: _p,
  DropdownMenu: zp,
  EM: Hn,
  Fragment: jT,
  MenuItem: Vp,
  SubMenuItem: Pp,
  EmojiSelector: Fp,
  FileInput: Kp,
  FileUploadDropZone: oh,
  FlowLayout: gh,
  Footer: Ch,
  Form: Ix,
  FormItem: ff,
  FormSection: Ry,
  Heading: yf,
  H1: Cf,
  H2: kf,
  H3: Sf,
  H4: wf,
  H5: Hf,
  H6: Bf,
  HoverCard: If,
  Icon: $f,
  Image: Lf,
  Items: Af,
  Link: Nf,
  List: Rf,
  Logo: Vf,
  Markdown: Zf,
  MenuSeparator: Dp,
  ModalDialog: Jf,
  NavGroup: tg,
  NavLink: rg,
  NavPanel: og,
  NoResult: ng,
  NumberBox: lg,
  OffCanvas: ug,
  Option: nC,
  PageMetaTitle: cg,
  Page: mg,
  Pages: hg,
  PositionedContainer: vg,
  ProgressBar: Tg,
  Queue: yg,
  RadioGroup: Cg,
  RealTimeAdapter: Sg,
  Redirect: Hg,
  Select: Bg,
  SelectionStore: Ag,
  Slider: aS,
  SpaceFiller: Wg,
  Spinner: Og,
  Splitter: Vg,
  HSplitter: Eg,
  VSplitter: Pg,
  Stack: Wo,
  CHStack: su,
  CVStack: du,
  HStack: lu,
  VStack: nu,
  StickyBox: Fg,
  Switch: Ug,
  Table: IT,
  TableOfContents: NT,
  TabItem: YT,
  Tabs: RT,
  Text: zT,
  TextArea: ET,
  TextBox: nl,
  PasswordInput: pc,
  Theme: xc,
  ToneChangerButton: aC,
  Tree: ZT
};
export {
  wS as collectedComponentMetadata
};

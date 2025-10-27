import { describe, expect, it } from "vitest";
import {
  BASE_COMPONENT_PART,
  resolveComponentLayoutProps,
} from "../../../src/components-core/theming/component-layout-resolver";
import { StackStyleResolver } from "../../../src/components/Stack/Stack";

describe("Component property layout", () => {
  it("should parse empty", () => {
    const result = resolveComponentLayoutProps({});
    expect(result).toStrictEqual({});
  });

  describe("single component properties", () => {
    it("single component property", () => {
      const result = resolveComponentLayoutProps({
        color: "red",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { color: "red" },
        },
      });
    });

    it("single component property: paddingHorizontal", () => {
      const result = resolveComponentLayoutProps({
        paddingHorizontal: "12px",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { paddingLeft: "12px", paddingRight: "12px" },
        },
      });
    });

    it("single component property: paddingVertical", () => {
      const result = resolveComponentLayoutProps({
        paddingVertical: "12px",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { paddingTop: "12px", paddingBottom: "12px" },
        },
      });
    });

    it("single component property: marginHorizontal", () => {
      const result = resolveComponentLayoutProps({
        marginHorizontal: "12px",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { marginLeft: "12px", marginRight: "12px" },
        },
      });
    });

    it("single component property: marginVertical", () => {
      const result = resolveComponentLayoutProps({
        marginVertical: "12px",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { marginTop: "12px", marginBottom: "12px" },
        },
      });
    });

    it("single component property: borderHorizontal", () => {
      const result = resolveComponentLayoutProps({
        borderHorizontal: "12px",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { borderLeft: "12px", borderRight: "12px" },
        },
      });
    });

    it("single component property: borderVertical", () => {
      const result = resolveComponentLayoutProps({
        borderVertical: "12px",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { borderTop: "12px", borderBottom: "12px" },
        },
      });
    });

    it("single component property: wrapContent/true", () => {
      const result = resolveComponentLayoutProps({
        wrapContent: true,
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { flexWrap: "wrap" },
        },
      });
    });

    it("single component property: wrapContent/false", () => {
      const result = resolveComponentLayoutProps({
        wrapContent: false,
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { flexWrap: "nowrap" },
        },
      });
    });

    it("single component property: canShrink/true", () => {
      const result = resolveComponentLayoutProps({
        canShrink: true,
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { flexShrink: 1 },
        },
      });
    });

    it("single component property: canShrink/false", () => {
      const result = resolveComponentLayoutProps({
        canShrink: false,
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { flexShrink: 0 },
        },
      });
    });

    it("single component property: width (no star size)", () => {
      const result = resolveComponentLayoutProps({
        width: "100px",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { width: "100px" },
        },
      });
    });

    it("single component property: width (star size)", () => {
      const result = resolveComponentLayoutProps(
        {
          width: "23*",
        },
        {
          layoutContext: {
            type: "Stack",
            orientation: "horizontal",
          },
        }
      );
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { flex: 23, flexShrink: 1 },
        },
      });
    });

    it("single component property: height (no star size)", () => {
      const result = resolveComponentLayoutProps({
        height: "100px",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { height: "100px" },
        },
      });
    });

    it("single component property: height (star size)", () => {
      const result = resolveComponentLayoutProps(
        {
          height: "23*",
        },
        {
          layoutContext: {
            type: "Stack",
            orientation: "vertical",
          },
        }
      );
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { flex: 23, flexShrink: 1 },
        },
      });
    });
  });

  describe("multiple component properties", () => {
    it("multiple component properties", () => {
      const result = resolveComponentLayoutProps({
        color: "red",
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { color: "red", backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: paddingHorizontal", () => {
      const result = resolveComponentLayoutProps({
        paddingHorizontal: "12px",
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { paddingLeft: "12px", paddingRight: "12px", backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: paddingVertical", () => {
      const result = resolveComponentLayoutProps({
        paddingVertical: "12px",
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { paddingTop: "12px", paddingBottom: "12px", backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: marginHorizontal", () => {
      const result = resolveComponentLayoutProps({
        marginHorizontal: "12px",
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { marginLeft: "12px", marginRight: "12px", backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: marginVertical", () => {
      const result = resolveComponentLayoutProps({
        marginVertical: "12px",
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { marginTop: "12px", marginBottom: "12px", backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: borderHorizontal", () => {
      const result = resolveComponentLayoutProps({
        borderHorizontal: "12px",
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { borderLeft: "12px", borderRight: "12px", backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: borderVertical", () => {
      const result = resolveComponentLayoutProps({
        borderVertical: "12px",
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { borderTop: "12px", borderBottom: "12px", backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: wrapContent/true", () => {
      const result = resolveComponentLayoutProps({
        wrapContent: true,
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { flexWrap: "wrap", backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: wrapContent/false", () => {
      const result = resolveComponentLayoutProps({
        wrapContent: false,
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { flexWrap: "nowrap", backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: canShrink/true", () => {
      const result = resolveComponentLayoutProps({
        canShrink: true,
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { flexShrink: 1, backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: canShrink/false", () => {
      const result = resolveComponentLayoutProps({
        canShrink: false,
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { flexShrink: 0, backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: width (no star size)", () => {
      const result = resolveComponentLayoutProps({
        width: "100px",
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { width: "100px", backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: width (star size)", () => {
      const result = resolveComponentLayoutProps(
        {
          width: "23*",
          backgroundColor: "green",
        },
        {
          layoutContext: {
            type: "Stack",
            orientation: "horizontal",
          },
        }
      );
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { flex: 23, flexShrink: 1, backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: height (no star size)", () => {
      const result = resolveComponentLayoutProps({
        height: "100px",
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { height: "100px", backgroundColor: "green" },
        },
      });
    });

    it("multiple component properties: height (star size)", () => {
      const result = resolveComponentLayoutProps(
        {
          height: "23*",
          backgroundColor: "green",
        },
        {
          layoutContext: {
            type: "Stack",
            orientation: "vertical",
          },
        }
      );
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { flex: 23, flexShrink: 1, backgroundColor: "green" },
        },
      });
    });
  });

  describe("single component properties with state", () => {
    it("single component property with state", () => {
      const result = resolveComponentLayoutProps({
        "color--hover": "red",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { states: { hover: { color: "red" } } },
        },
      });
    });

    it("single component property with multiple states #1", () => {
      const result = resolveComponentLayoutProps({
        "color--hover--active": "red",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { states: { "hover&active": { color: "red" } } },
        },
      });
    });

    it("single component property with multiple states #2", () => {
      const result = resolveComponentLayoutProps({
        "color--hover--active--focus": "red",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { states: { "hover&active&focus": { color: "red" } } },
        },
      });
    });

    it("multiple component properties with state", () => {
      const result = resolveComponentLayoutProps({
        "color--hover": "red",
        "backgroundColor--hover": "blue",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { states: { hover: { color: "red", backgroundColor: "blue" } } },
        },
      });
    });

    it("multiple component properties with multiple states #1", () => {
      const result = resolveComponentLayoutProps({
        "color--focus": "red",
        "backgroundColor--hover": "blue",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { states: { focus: { color: "red" }, hover: { backgroundColor: "blue" } } },
        },
      });
    });

    it("multiple component properties with multiple states #2", () => {
      const result = resolveComponentLayoutProps({
        "color--focus": "red",
        "backgroundColor--hover--focus": "blue",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: {
            states: { focus: { color: "red" }, "hover&focus": { backgroundColor: "blue" } },
          },
        },
      });
    });

    it("multiple component properties with multiple states #3", () => {
      const result = resolveComponentLayoutProps({
        "color--focus": "red",
        "backgroundColor--focus": "blue",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { states: { focus: { color: "red", backgroundColor: "blue" } } },
        },
      });
    });

    it("multiple component properties with multiple states #4", () => {
      const result = resolveComponentLayoutProps({
        "color--focus--active": "red",
        "backgroundColor--focus": "blue",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: {
            states: { focus: { backgroundColor: "blue" }, "focus&active": { color: "red" } },
          },
        },
      });
    });
  });

  describe("multiple component properties with and without state", () => {
    it("multiple component properties with state", () => {
      const result = resolveComponentLayoutProps({
        "color--hover": "red",
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { backgroundColor: "green", states: { hover: { color: "red" } } },
        },
      });
    });

    it("multiple component properties with multiple states #1", () => {
      const result = resolveComponentLayoutProps({
        "color--hover--active": "red",
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { backgroundColor: "green", states: { "hover&active": { color: "red" } } },
        },
      });
    });

    it("multiple component properties with multiple states #2", () => {
      const result = resolveComponentLayoutProps({
        "color--hover--active--focus": "red",
        backgroundColor: "green",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: {
            backgroundColor: "green",
            states: { "hover&active&focus": { color: "red" } },
          },
        },
      });
    });

    it("multiple component properties with state (both with state)", () => {
      const result = resolveComponentLayoutProps({
        "color--hover": "red",
        "backgroundColor--hover": "blue",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { states: { hover: { color: "red", backgroundColor: "blue" } } },
        },
      });
    });

    it("multiple component properties with multiple states #1 (mixed)", () => {
      const result = resolveComponentLayoutProps({
        "color--focus": "red",
        "backgroundColor--hover": "blue",
        padding: "10px",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: {
            padding: "10px",
            states: { focus: { color: "red" }, hover: { backgroundColor: "blue" } },
          },
        },
      });
    });

    it("multiple component properties with multiple states #2 (mixed)", () => {
      const result = resolveComponentLayoutProps({
        "color--focus": "red",
        "backgroundColor--hover--focus": "blue",
        margin: "5px",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: {
            margin: "5px",
            states: { focus: { color: "red" }, "hover&focus": { backgroundColor: "blue" } },
          },
        },
      });
    });

    it("multiple component properties with multiple states #3 (mixed)", () => {
      const result = resolveComponentLayoutProps({
        "color--focus": "red",
        "backgroundColor--focus": "blue",
        border: "1px solid black",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: {
            border: "1px solid black",
            states: { focus: { color: "red", backgroundColor: "blue" } },
          },
        },
      });
    });

    it("multiple component properties with multiple states #4 (mixed)", () => {
      const result = resolveComponentLayoutProps({
        "color--focus--active": "red",
        "backgroundColor--focus": "blue",
        fontSize: "14px",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: {
            fontSize: "14px",
            states: { focus: { backgroundColor: "blue" }, "focus&active": { color: "red" } },
          },
        },
      });
    });
  });

  describe("component properties with parts", () => {
    it("single component property with part", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator": "red",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: { color: "red" },
        },
      });
    });

    it("multiple component property with part", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator": "red",
        "backgroundColor-indicator": "green",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: { color: "red", backgroundColor: "green" },
        },
      });
    });

    it("multiple component property with multiple parts #1", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator": "red",
        "backgroundColor-handle": "green",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: { color: "red" },
        },
        handle: {
          baseStyles: { backgroundColor: "green" },
        },
      });
    });

    it("multiple component property with multiple parts #2", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator": "red",
        "backgroundColor-handle": "green",
        "fontSize-indicator": "12px",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: { color: "red", fontSize: "12px" },
        },
        handle: {
          baseStyles: { backgroundColor: "green" },
        },
      });
    });
  });

  describe("component properties with parts and state", () => {
    it("single component property with part and state", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator--hover": "red",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: { states: { hover: { color: "red" } } },
        },
      });
    });

    it("single component property with part and multiple states #1", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator--hover--active": "red",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: { states: { "hover&active": { color: "red" } } },
        },
      });
    });

    it("single component property with part and multiple states #2", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator--hover--active--focus": "red",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: { states: { "hover&active&focus": { color: "red" } } },
        },
      });
    });

    it("multiple component properties with part and state", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator--hover": "red",
        "backgroundColor-indicator--hover": "green",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: { states: { hover: { color: "red", backgroundColor: "green" } } },
        },
      });
    });

    it("multiple component properties with part and multiple states #1", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator--focus": "red",
        "backgroundColor-indicator--hover": "green",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: { states: { focus: { color: "red" }, hover: { backgroundColor: "green" } } },
        },
      });
    });

    it("multiple component properties with part and multiple states #2", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator--focus": "red",
        "backgroundColor-indicator--hover--focus": "green",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: {
            states: { focus: { color: "red" }, "hover&focus": { backgroundColor: "green" } },
          },
        },
      });
    });

    it("multiple component properties with part and multiple states #3", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator--focus": "red",
        "backgroundColor-indicator--focus": "green",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: { states: { focus: { color: "red", backgroundColor: "green" } } },
        },
      });
    });

    it("multiple component properties with part and multiple states #4", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator--focus--active": "red",
        "backgroundColor-indicator--focus": "green",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: {
            states: { focus: { backgroundColor: "green" }, "focus&active": { color: "red" } },
          },
        },
      });
    });

    it("multiple component properties with multiple parts and states #1", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator--hover": "red",
        "backgroundColor-handle--focus": "green",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: { states: { hover: { color: "red" } } },
        },
        handle: {
          baseStyles: { states: { focus: { backgroundColor: "green" } } },
        },
      });
    });

    it("multiple component properties with multiple parts and states #2", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator--hover": "red",
        "backgroundColor-handle--focus": "green",
        "fontSize-indicator--active": "12px",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: { states: { hover: { color: "red" }, active: { fontSize: "12px" } } },
        },
        handle: {
          baseStyles: { states: { focus: { backgroundColor: "green" } } },
        },
      });
    });

    it("multiple component properties with multiple parts and mixed states", () => {
      const result = resolveComponentLayoutProps({
        "color-indicator--hover--active": "red",
        "backgroundColor-handle--focus": "green",
        "fontSize-indicator--hover": "12px",
        "border-handle--focus--active": "1px solid black",
      });
      expect(result).toStrictEqual({
        indicator: {
          baseStyles: { states: { "hover&active": { color: "red" }, hover: { fontSize: "12px" } } },
        },
        handle: {
          baseStyles: {
            states: {
              focus: { backgroundColor: "green" },
              "focus&active": { border: "1px solid black" },
            },
          },
        },
      });
    });
  });

  describe("mixed component properties, parts, and states", () => {
    it("mix of base properties, parts without states, and parts with states", () => {
      const result = resolveComponentLayoutProps({
        color: "blue", // base property
        "backgroundColor-header": "yellow", // part property without state
        "fontSize-indicator--hover": "14px", // part property with state
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { color: "blue" },
        },
        header: {
          baseStyles: { backgroundColor: "yellow" },
        },
        indicator: {
          baseStyles: { states: { hover: { fontSize: "14px" } } },
        },
      });
    });

    it("mix of base properties with states and parts with states", () => {
      const result = resolveComponentLayoutProps({
        "color--hover": "red", // base property with state
        "backgroundColor-header--focus": "green", // part property with state
        "border-footer": "1px solid black", // part property without state
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: { states: { hover: { color: "red" } } },
        },
        header: {
          baseStyles: { states: { focus: { backgroundColor: "green" } } },
        },
        footer: {
          baseStyles: { border: "1px solid black" },
        },
      });
    });

    it("complex mix: base properties, parts, multiple states", () => {
      const result = resolveComponentLayoutProps({
        width: "100px", // base property
        height: "50px", // base property
        "color--hover": "red", // base property with state
        "backgroundColor--active": "blue", // base property with different state
        "fontSize-header": "16px", // part property
        "padding-header--hover": "10px", // part property with state
        "margin-footer--focus--active": "5px", // part property with multiple states
        "border-sidebar": "2px solid gray", // different part property
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: {
            width: "100px",
            height: "50px",
            states: {
              hover: { color: "red" },
              active: { backgroundColor: "blue" },
            },
          },
        },
        header: {
          baseStyles: {
            fontSize: "16px",
            states: { hover: { padding: "10px" } },
          },
        },
        footer: {
          baseStyles: { states: { "focus&active": { margin: "5px" } } },
        },
        sidebar: {
          baseStyles: { border: "2px solid gray" },
        },
      });
    });

    it("same property applied to different contexts", () => {
      const result = resolveComponentLayoutProps({
        color: "black", // base color
        "color-header": "blue", // header color
        "color-footer--hover": "red", // footer color on hover
        "color--active": "green", // base color on active
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: {
            color: "black",
            states: { active: { color: "green" } },
          },
        },
        header: {
          baseStyles: { color: "blue" },
        },
        footer: {
          baseStyles: { states: { hover: { color: "red" } } },
        },
      });
    });

    it("overlapping states across base and parts", () => {
      const result = resolveComponentLayoutProps({
        "backgroundColor--hover": "lightblue", // base background on hover
        "color--hover": "darkblue", // base color on hover
        "fontSize-title--hover": "18px", // title font size on hover
        "padding-title--focus": "8px", // title padding on focus
        "margin-content--hover--focus": "12px", // content margin on hover and focus
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: {
            states: {
              hover: { backgroundColor: "lightblue", color: "darkblue" },
            },
          },
        },
        title: {
          baseStyles: {
            states: {
              hover: { fontSize: "18px" },
              focus: { padding: "8px" },
            },
          },
        },
        content: {
          baseStyles: { states: { "hover&focus": { margin: "12px" } } },
        },
      });
    });

    it("multiple properties per part with mixed states", () => {
      const result = resolveComponentLayoutProps({
        "width-card": "200px", // card width (no state)
        "height-card": "150px", // card height (no state)
        "backgroundColor-card--hover": "gray", // card background on hover
        "border-card--focus": "2px solid blue", // card border on focus
        "color-card--hover--active": "white", // card color on hover and active
        "padding-card": "16px", // card padding (no state)
      });
      expect(result).toStrictEqual({
        card: {
          baseStyles: {
            width: "200px",
            height: "150px",
            padding: "16px",
            states: {
              hover: { backgroundColor: "gray" },
              focus: { border: "2px solid blue" },
              "hover&active": { color: "white" },
            },
          },
        },
      });
    });

    it("state conflicts and merging across different parts", () => {
      const result = resolveComponentLayoutProps({
        "color--focus": "red", // base color on focus
        "backgroundColor--focus": "yellow", // base background on focus
        "fontSize-header--focus": "20px", // header font size on focus
        "color-footer--focus": "blue", // footer color on focus (different from base)
        "margin-header": "10px", // header margin (no state)
        "padding-footer--active": "5px", // footer padding on active
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: {
            states: {
              focus: { color: "red", backgroundColor: "yellow" },
            },
          },
        },
        header: {
          baseStyles: {
            margin: "10px",
            states: { focus: { fontSize: "20px" } },
          },
        },
        footer: {
          baseStyles: {
            states: {
              focus: { color: "blue" },
              active: { padding: "5px" },
            },
          },
        },
      });
    });
  });

  describe("regression", () => {
    it("has responsive with state", () => {
      const result = resolveComponentLayoutProps({
        backgroundColor: "red",
        "backgroundColor-xxl": "green",
        "backgroundColor-xxl--hover": "blue",
      });
      expect(result).toStrictEqual({
        [BASE_COMPONENT_PART]: {
          baseStyles: {
            backgroundColor: "red",
          },
          responsiveStyles: {
            xxl: {
              backgroundColor: "green",
              states: {
                hover: { backgroundColor: "blue" },
              },
            },
          },
        },
      });
    });
  });

  it("responsive depends on (Stack orientation + horizontalAlignment)", () => {
    // <Stack
    //     orientation="vertical"
    //     orientation-md="horizontal"
    //     horizontalAlignment="center"
    //   >

    const result = resolveComponentLayoutProps({
      "orientation": "vertical",
      "horizontalAlignment": "center",
      "orientation-md": "horizontal"
    }, {
      stylePropResolvers: StackStyleResolver
    });
    expect(result).toStrictEqual({
      [BASE_COMPONENT_PART]: {
        baseStyles: {
          alignItems: "center"
        },
        responsiveStyles: {
          md: {
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "center",
          }
        }
      },
    });
  });

  it("responsive depends on (Stack orientation + horizontalAlignment + reverse)", () => {
    const result = resolveComponentLayoutProps({
      "orientation": "vertical",
      "reverse": "true",
      "horizontalAlignment": "center",
      "orientation-md": "horizontal",
      "reverse-md": "false",
    }, {
      stylePropResolvers: StackStyleResolver
    });
    expect(result).toStrictEqual({
      [BASE_COMPONENT_PART]: {
        baseStyles: {
          flexDirection: "column-reverse",
          alignItems: "center"
        },
        responsiveStyles: {
          md: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",
          }
        }
      },
    });
  });


  it("responsive depends on (Stack orientation + horizontalAlignment + reverse 2)", () => {
    // <Stack
    //     height="100px"
    //     backgroundColor="blue"
    //     orientation="vertical"
    //     reverse="true"
    //     horizontalAlignment="center"
    //     orientation-md="horizontal"
    //     reverse-xl="false"
    //     backgroundColor-xxl="red"
    //   >

    const result = resolveComponentLayoutProps({
      "orientation": "vertical",
      "reverse": "true",
      "horizontalAlignment": "center",
      "orientation-md": "horizontal",
      "reverse-xl": "false",
      "backgroundColor-xxl": "red"
    }, {
      stylePropResolvers: StackStyleResolver
    });
    expect(result).toStrictEqual({
      [BASE_COMPONENT_PART]: {
        baseStyles: {
          flexDirection: "column-reverse",
          alignItems: "center",
        },
        responsiveStyles: {
          md: {
            flexDirection: "row-reverse",
            justifyContent: "center",
            alignItems: "flex-start",
          },
          xl: {
            flexDirection: "row"
          },
          xxl: {
            backgroundColor: "red"
          }
        }
      },
    });
  });
});

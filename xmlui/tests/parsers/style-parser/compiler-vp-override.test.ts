import { describe, expect, it } from "vitest";
import { compileLayout } from "@parsers/style-parser/style-compiler";

type TestDescriptor = {
  category: string;
  props: string[];
  cssProps?: Record<string, string>;
  baseValue: string;
  overrideValue: string;
  override2Value: string;
};

const testDescriptors: TestDescriptor[] = [
  {
    category: "size",
    props: [
      "width",
      "minWidth",
      "maxWidth",
      "height",
      "minHeight",
      "maxHeight",
      "top",
      "right",
      "bottom",
      "left",
      "gap",
      "padding",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "margin",
      "marginTop",
      "marginRight",
      "marginBottom",
      "marginLeft",
      "letterSpacing",
      "fontSize",
      "lineHeight"
    ],
    baseValue: "12px",
    overrideValue: "123px",
    override2Value: "456px",
  },
  {
    category: "border",
    props: ["border", "borderTop", "borderRight", "borderBottom", "borderLeft"],
    baseValue: "1px solid red",
    overrideValue: "2px solid blue",
    override2Value: "3px solid green",
  },
  {
    category: "radius",
    props: ["radius", "radiusTopLeft", "radiusTopRight", "radiusBottomRight", "radiusBottomLeft"],
    cssProps: {
      radius: "borderRadius",
      radiusTopLeft: "borderTopLeftRadius",
      radiusTopRight: "borderTopRightRadius",
      radiusBottomRight: "borderBottomRightRadius",
      radiusBottomLeft: "borderBottomLeftRadius",
    },
    baseValue: "12px",
    overrideValue: "123px",
    override2Value: "456px",
  },
  {
    category: "color",
    props: ["backgroundColor", "background", "color"],
    baseValue: "red",
    overrideValue: "blue",
    override2Value: "green",
  },
  {
    category: "shadow",
    props: ["shadow"],
    cssProps: { shadow: "boxShadow" },
    baseValue: "1px 1px 1px 1px red",
    overrideValue: "2px 2px 2px 2px blue",
    override2Value: "3px 3px 3px 3px green",
  },
  {
    category: "direction",
    props: ["direction"],
    baseValue: "rtl",
    overrideValue: "ltr",
    override2Value: "rtl",
  },
  {
    category: "overflow",
    props: ["horizontalOverflow", "verticalOverflow"],
    cssProps: {
      horizontalOverflow: "overflowX",
      verticalOverflow: "overflowY",
    },
    baseValue: "hidden",
    overrideValue: "visible",
    override2Value: "scroll",
  },
  {
    category: "zIndex",
    props: ["zIndex"],
    baseValue: "1",
    overrideValue: "2",
    override2Value: "3",
  },
  {
    category: "opacity",
    props: ["opacity"],
    baseValue: "0.5",
    overrideValue: "0.7",
    override2Value: "0.9",
  },
  {
    category: "fontFamily",
    props: ["fontFamily"],
    baseValue: "Arial",
    overrideValue: "'Times New Roman'",
    override2Value: "'Courier New'",
  },
  {
    category: "fontWeight",
    props: ["fontWeight"],
    baseValue: "normal",
    overrideValue: "bold",
    override2Value: "bolder",
  },
  {
    category: "textDecoration",
    props: ["textDecoration"],
    baseValue: "none",
    overrideValue: "underline",
    override2Value: "line-through",
  },
  {
    category: "userSelect",
    props: ["userSelect"],
    baseValue: "none",
    overrideValue: "text",
    override2Value: "all",
  },
  {
    category: "textTransform",
    props: ["textTransform"],
    baseValue: "uppercase",
    overrideValue: "lowercase",
    override2Value: "capitalize",
  },
  {
    category: "textAlign",
    props: ["textAlign","textAlignLast"],
    baseValue: "center",
    overrideValue: "left",
    override2Value: "right",
  },
  {
    category: "cursor",
    props: ["cursor"],
    baseValue: "pointer",
    overrideValue: "default",
    override2Value: "none",
  }
];

testDescriptors.forEach((td) => {
  describe(`Style compiler viewport (${td.category})`, () => {
    // --- width
    td.props.forEach((c) => {
      it(`${c}, ${c}-xs (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-md (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-md`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-md (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-md`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-md (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-md`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-md (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-md`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-md (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-md`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-md (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-md`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xl (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xl (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xl (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xl (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xl (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xl (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xxl (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xxl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xxl (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xxl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xxl (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xxl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xxl (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xxl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xxl (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xxl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xxl (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xxl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs, ${c}-md (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue, [`${c}-md`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs, ${c}-md (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue, [`${c}-md`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.override2Value);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs, ${c}-md (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue, [`${c}-md`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.override2Value);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs, ${c}-md (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue, [`${c}-md`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs, ${c}-md (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue, [`${c}-md`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs, ${c}-md (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue, [`${c}-md`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs, ${c}-xl (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue, [`${c}-xl`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs, ${c}-xl (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue, [`${c}-xl`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs, ${c}-xl (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue, [`${c}-xl`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs, ${c}-xl (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue, [`${c}-xl`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs, ${c}-xl (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue, [`${c}-xl`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.override2Value);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs, ${c}-xl (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue, [`${c}-xl`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.override2Value);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg, ${c}-xxl (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue, [`${c}-xxl`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg, ${c}-xxl (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue, [`${c}-xxl`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg, ${c}-xxl (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue, [`${c}-xxl`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg, ${c}-xxl (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue, [`${c}-xxl`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg, ${c}-xxl (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue, [`${c}-xxl`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg, ${c}-xxl (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue, [`${c}-xxl`]: td.override2Value },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        const propName = td.cssProps?.[c] ? td.cssProps[c] : c;
        expect(result.cssProps[propName]).equal(td.override2Value);
        expect(result.issues).equal(undefined);
      });
    });
  });
});

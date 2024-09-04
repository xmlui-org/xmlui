import { describe, expect, it } from "vitest";
import { compileLayout } from "@parsers/style-parser/style-compiler";

type TestDescriptor = {
  category: string;
  props: string[];
  baseValue: string;
  overrideValue: string;
};

const testDescriptors: TestDescriptor[] = [
  {
    category: "size",
    props: ["width"],
    baseValue: "12px",
    overrideValue: "123px",
  },
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
        expect(result.cssProps[c]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xs (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xs`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        expect(result.cssProps[c]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        expect(result.cssProps[c]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        expect(result.cssProps[c]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-sm (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-sm`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-md (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-md`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        expect(result.cssProps[c]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-md (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-md`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        expect(result.cssProps[c]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-md (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-md`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        expect(result.cssProps[c]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-md (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-md`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-md (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-md`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-md (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-md`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        expect(result.cssProps[c]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        expect(result.cssProps[c]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-lg (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-lg`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        expect(result.cssProps[c]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xl (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xl (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xl (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xl (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xl (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        expect(result.cssProps[c]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xl (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        expect(result.cssProps[c]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xxl (xs)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xxl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 0 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xxl (sm)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xxl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 1 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xxl (md)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xxl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 2 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xxl (lg)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xxl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 3 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xxl (xl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xxl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 4 } },
        );
        expect(result.cssProps[c]).equal(td.baseValue);
        expect(result.issues).equal(undefined);
      });

      it(`${c}, ${c}-xxl (xxl)`, () => {
        const result = compileLayout(
          { [c]: td.baseValue, [`${c}-xxl`]: td.overrideValue },
          {},
          { mediaSize: { sizeIndex: 5 } },
        );
        expect(result.cssProps[c]).equal(td.overrideValue);
        expect(result.issues).equal(undefined);
      });
    });
  });
});

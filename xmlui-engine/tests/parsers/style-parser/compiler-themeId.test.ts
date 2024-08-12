import { describe, expect, it, test } from "vitest";
import { compileLayout } from "@parsers/style-parser/style-compiler";
import { toCssVar } from "@parsers/style-parser/StyleParser";

describe("Style compiler", () => {
  const sizeCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  const themeVars = {
    myTheme: "12px",
  };

  // --- width
  test.each(sizeCases)(`width (themeId): $src`, (c) => {
    const result = compileLayout({ width: c.src }, themeVars);
    expect(result.cssProps?.width).equal(toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined }));
    expect(result.issues).equal(undefined);
  });

  // --- minWidth
  sizeCases.forEach((c) =>
    it(`minWidth (themeId): ${c.src}`, () => {
      const result = compileLayout({ minWidth: c.src }, themeVars);
      expect(result.cssProps?.minWidth).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- maxWidth
  sizeCases.forEach((c) =>
    it(`maxWidth (themeId): ${c.src}`, () => {
      const result = compileLayout({ maxWidth: c.src }, themeVars);
      expect(result.cssProps?.maxWidth).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- height
  sizeCases.forEach((c) =>
    it(`height (themeId): ${c.src}`, () => {
      const result = compileLayout({ height: c.src }, themeVars);
      expect(result.cssProps?.height).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- minHeight
  sizeCases.forEach((c) =>
    it(`minHeight (themeId): ${c.src}`, () => {
      const result = compileLayout({ minHeight: c.src }, themeVars);
      expect(result.cssProps?.minHeight).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- maxHeight
  sizeCases.forEach((c) =>
    it(`maxHeight (themeId): ${c.src}`, () => {
      const result = compileLayout({ maxHeight: c.src }, themeVars);
      expect(result.cssProps?.maxHeight).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  const scrollingCases = [
    {
      src: "$myTheme",
    },
  ];

  // --- horizontalOverflow
  scrollingCases.forEach((c) =>
    it(`horizontalOverflow (themeId): ${c.src}`, () => {
      const result = compileLayout({ horizontalOverflow: c.src }, themeVars);
      expect(result.cssProps?.overflowX).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- verticalOverflow
  scrollingCases.forEach((c) =>
    it(`verticalOverflow (themeId): ${c.src}`, () => {
      const result = compileLayout({ verticalOverflow: c.src }, themeVars);
      expect(result.cssProps?.overflowY).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  const directionCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  // --- direction
  directionCases.forEach((c) =>
    it(`direction (themeId): ${c.src}`, () => {
      const result = compileLayout({ direction: c.src }, themeVars);
      expect(result.cssProps?.direction).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- FontFamily
  const fontFamilyCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  fontFamilyCases.forEach((c) =>
    it(`fontFamily (themeId): ${c.src}`, () => {
      const result = compileLayout({ fontFamily: c.src }, themeVars);
      expect(result.cssProps?.fontFamily).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- FontWeight

  const fontWeightCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  fontWeightCases.forEach((c) =>
    it(`fontWeight (theming): ${c.src}`, () => {
      const result = compileLayout({ fontWeight: c.src }, themeVars);
      expect(result.cssProps?.fontWeight).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- zIndex

  const zIndexCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  zIndexCases.forEach((c) =>
    it(`zIndex (themeId): ${c.src}`, () => {
      const result = compileLayout({ zIndex: c.src }, themeVars);
      expect(result.cssProps?.zIndex).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  const borderCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  // --- border
  borderCases.forEach((c) =>
    it(`border (themeId): ${c.src}`, () => {
      const result = compileLayout({ border: c.src }, themeVars);
      expect(result.cssProps?.border).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- borderTop
  borderCases.forEach((c) =>
    it(`borderTop (themeId): ${c.src}`, () => {
      const result = compileLayout({ borderTop: c.src }, themeVars);
      expect(result.cssProps?.borderTop).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- borderRight
  borderCases.forEach((c) =>
    it(`borderRight (themeId): ${c.src}`, () => {
      const result = compileLayout({ borderRight: c.src }, themeVars);
      expect(result.cssProps?.borderRight).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- borderBottom
  borderCases.forEach((c) =>
    it(`borderBottom (themeId): ${c.src}`, () => {
      const result = compileLayout({ borderBottom: c.src }, themeVars);
      expect(result.cssProps?.borderBottom).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- borderLeft
  borderCases.forEach((c) =>
    it(`borderLeft (themeId): ${c.src}`, () => {
      const result = compileLayout({ borderLeft: c.src }, themeVars);
      expect(result.cssProps?.borderLeft).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  it(`border (spec themeId) #1`, () => {
    const result = compileLayout({ border: "$myTheme solid 4px" }, themeVars);
    expect(result.cssProps?.border).equal("var(--xmlui-myTheme) 4px solid");
    expect(result.issues).equal(undefined);
  });

  it(`border (spec themeId) #2`, () => {
    const result = compileLayout({ border: "solid $myTheme 4px" }, themeVars);
    expect(result.cssProps?.border).equal("var(--xmlui-myTheme) 4px solid");
    expect(result.issues).equal(undefined);
  });

  it(`border (spec themeId) #3`, () => {
    const result = compileLayout({ border: "solid 4px $myTheme" }, themeVars);
    expect(result.cssProps?.border).equal("var(--xmlui-myTheme) 4px solid");
    expect(result.issues).equal(undefined);
  });

  it(`border (spec themeId) #4`, () => {
    const result = compileLayout({ border: "$myBorder 4px $myTheme" }, themeVars);
    expect(result.cssProps?.border).equal("var(--xmlui-myBorder) var(--xmlui-myTheme) 4px");
    expect(result.issues).equal(undefined);
  });

  it(`border (spec themeId) #5`, () => {
    const result = compileLayout({ border: "$myBorder $mySize $myTheme" }, themeVars);
    expect(result.cssProps?.border).equal(
      "var(--xmlui-myBorder) var(--xmlui-mySize) var(--xmlui-myTheme)"
    );
    expect(result.issues).equal(undefined);
  });

  const textDecorationCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  textDecorationCases.forEach((c) =>
    it(`textDecoration (themeId): ${c.src}`, () => {
      const result = compileLayout({ textDecoration: c.src }, themeVars);
      expect(result.cssProps?.textDecoration).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  it(`textDecoration (spec themeId) #1`, () => {
    const result = compileLayout({ textDecoration: "$myTheme wavy" }, themeVars);
    expect(result.cssProps?.textDecoration).equal("var(--xmlui-myTheme) wavy");
    expect(result.issues).equal(undefined);
  });

  it(`textDecoration (spec themeId) #2`, () => {
    const result = compileLayout({ textDecoration: "wavy $myTheme" }, themeVars);
    expect(result.cssProps?.textDecoration).equal("var(--xmlui-myTheme) wavy");
    expect(result.issues).equal(undefined);
  });

  it(`textDecoration (spec themeId) #3`, () => {
    const result = compileLayout({ textDecoration: "$myTheme wavy red" }, themeVars);
    expect(result.cssProps?.textDecoration).equal("var(--xmlui-myTheme) wavy red");
    expect(result.issues).equal(undefined);
  });

  it(`textDecoration (spec themeId) #4`, () => {
    const result = compileLayout({ textDecoration: "$myTheme wavy $other" }, themeVars);
    expect(result.cssProps?.textDecoration).equal(
      "var(--xmlui-myTheme) var(--xmlui-other) wavy"
    );
    expect(result.issues).equal(undefined);
  });

  it(`textDecoration (spec themeId) #5`, () => {
    const result = compileLayout({ textDecoration: "$myTheme $third $other" }, themeVars);
    expect(result.cssProps?.textDecoration).equal(
      "var(--xmlui-myTheme) var(--xmlui-third) var(--xmlui-other)"
    );
    expect(result.issues).equal(undefined);
  });

  const radiusCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  it(`radius (themeId): this`, () => {
    const result = compileLayout({ radius: "$myTheme" }, themeVars);
    expect(result.cssProps?.borderRadius).equal(toCssVar({ id: "$myTheme", defaultValue: undefined }));
    expect(result.issues).equal(undefined);
  });

  // --- radius
  radiusCases.forEach((c) =>
    it(`radius (themeId): ${c.src}`, () => {
      const result = compileLayout({ radius: c.src }, themeVars);
      expect(result.cssProps?.borderRadius).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- radiusTopLeft
  radiusCases.forEach((c) =>
    it(`radiusTopLeft (themeId): ${c.src}`, () => {
      const result = compileLayout({ radiusTopLeft: c.src }, themeVars);
      expect(result.cssProps?.borderTopLeftRadius).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- radiusTopRight
  radiusCases.forEach((c) =>
    it(`radiusTopRight (themeId): ${c.src}`, () => {
      const result = compileLayout({ radiusTopRight: c.src }, themeVars);
      expect(result.cssProps?.borderTopRightRadius).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- radiusBottomLeft
  radiusCases.forEach((c) =>
    it(`radiusBottomLeft (themeId): ${c.src}`, () => {
      const result = compileLayout({ radiusBottomLeft: c.src }, themeVars);
      expect(result.cssProps?.borderBottomLeftRadius).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- radiusBottomRight
  radiusCases.forEach((c) =>
    it(`radiusBottomRight (themeId): ${c.src}`, () => {
      const result = compileLayout({ radiusBottomRight: c.src }, themeVars);
      expect(result.cssProps?.borderBottomRightRadius).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  it(`radius (spec themeId) #1`, () => {
    const result = compileLayout({ radius: "$myTheme 25%" }, themeVars);
    expect(result.cssProps?.borderRadius).equal("var(--xmlui-myTheme) / 25%");
    expect(result.issues).equal(undefined);
  });

  it(`radius (spec themeId) #2`, () => {
    const result = compileLayout({ radius: "25% $myTheme" }, themeVars);
    expect(result.cssProps?.borderRadius).equal("25% / var(--xmlui-myTheme)");
    expect(result.issues).equal(undefined);
  });

  it(`radius (spec themeId) #3`, () => {
    const result = compileLayout({ radius: "$myTheme $other" }, themeVars);
    expect(result.cssProps?.borderRadius).equal("var(--xmlui-myTheme) / var(--xmlui-other)");
    expect(result.issues).equal(undefined);
  });

  const shadowCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  shadowCases.forEach((c) =>
    it(`shadow (themeId): ${c.src}`, () => {
      const result = compileLayout({ shadow: c.src }, themeVars);
      expect(result.cssProps?.boxShadow).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  const alignmentCases = ["start", "center", "end"];

  alignmentCases.forEach((c) =>
    it(`horizontalAlignment: ${c}`, () => {
      const result = compileLayout({ horizontalAlignment: c }, themeVars);
      expect(result.nonCssProps.horizontalAlignment).equal(c);
      expect(result.issues).equal(undefined);
    })
  );

  alignmentCases.forEach((c) =>
    it(`verticalAlignment: ${c}`, () => {
      const result = compileLayout({ verticalAlignment: c }, themeVars);
      expect(result.nonCssProps.verticalAlignment).equal(c);
      expect(result.issues).equal(undefined);
    })
  );

  const orientationCases = ["horizontal", "vertical"];

  orientationCases.forEach((c) =>
    it(`orientation: ${c}`, () => {
      const result = compileLayout({ orientation: c }, themeVars);
      expect(result.nonCssProps.orientation).equal(c);
      expect(result.issues).equal(undefined);
    })
  );

  const paddingCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  // --- padding
  paddingCases.forEach((c) =>
    it(`padding (themeId): ${c.src}`, () => {
      const result = compileLayout({ padding: c.src }, themeVars);
      expect(result.cssProps?.padding).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- horizontalPadding
  paddingCases.forEach((c) =>
    it(`horizontalPadding (themeId): ${c.src}`, () => {
      const result = compileLayout({ horizontalPadding: c.src }, themeVars);
      expect(result.cssProps?.paddingLeft).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.cssProps?.paddingRight).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- verticalPadding
  paddingCases.forEach((c) =>
    it(`verticalPadding (themeId): ${c.src}`, () => {
      const result = compileLayout({ verticalPadding: c.src }, themeVars);
      expect(result.cssProps?.paddingTop).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.cssProps?.paddingBottom).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- leftPadding
  paddingCases.forEach((c) =>
    it(`paddingLeft (themeId) #1: ${c.src}`, () => {
      const result = compileLayout({ paddingLeft: c.src }, themeVars);
      expect(result.cssProps?.paddingLeft).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  paddingCases.forEach((c) =>
    it(`paddingLeft (themeId) #2: ${c.src}`, () => {
      const result = compileLayout({ paddingLeft: c.src, horizontalPadding: "20%" }, themeVars);
      expect(result.cssProps?.paddingLeft).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.cssProps?.paddingRight).equal("20%");
      expect(result.issues).equal(undefined);
    })
  );

  // --- rightPadding
  paddingCases.forEach((c) =>
    it(`paddingRight (themeId) #1: ${c.src}`, () => {
      const result = compileLayout({ paddingRight: c.src }, themeVars);
      expect(result.cssProps?.paddingRight).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  paddingCases.forEach((c) =>
    it(`paddingRight (themeId) #2: ${c.src}`, () => {
      const result = compileLayout({ paddingRight: c.src, horizontalPadding: "20%" }, themeVars);
      expect(result.cssProps?.paddingRight).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.cssProps?.paddingLeft).equal("20%");
      expect(result.issues).equal(undefined);
    })
  );

  // --- topPadding
  paddingCases.forEach((c) =>
    it(`paddingTop (themeId) #1: ${c.src}`, () => {
      const result = compileLayout({ paddingTop: c.src }, themeVars);
      expect(result.cssProps?.paddingTop).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  paddingCases.forEach((c) =>
    it(`paddingTop (themeId) #2: ${c.src}`, () => {
      const result = compileLayout({ paddingTop: c.src, verticalPadding: "20%" }, themeVars);
      expect(result.cssProps?.paddingTop).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.cssProps?.paddingBottom).equal("20%");
      expect(result.issues).equal(undefined);
    })
  );

  // --- bottomPadding
  paddingCases.forEach((c) =>
    it(`paddingBottom (themeId) #1: ${c.src}`, () => {
      const result = compileLayout({ paddingBottom: c.src }, themeVars);
      expect(result.cssProps?.paddingBottom).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  paddingCases.forEach((c) =>
    it(`paddingBottom (themeId) #2: ${c.src}`, () => {
      const result = compileLayout({ paddingBottom: c.src, verticalPadding: "20%" }, themeVars);
      expect(result.cssProps?.paddingBottom).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.cssProps?.paddingTop).equal("20%");
      expect(result.issues).equal(undefined);
    })
  );

  const colorCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  colorCases.forEach((c) =>
    it(`color (themeId): ${c.src}`, () => {
      const result = compileLayout({ color: c.src }, themeVars);
      expect(result.cssProps?.color).equal(toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined }));
      expect(result.issues).equal(undefined);
    })
  );

  colorCases.forEach((c) =>
    it(`backgroundColor (themeId): ${c.src}`, () => {
      const result = compileLayout({ backgroundColor: c.src }, themeVars);
      expect(result.cssProps?.backgroundColor).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  const fontSizeCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  fontSizeCases.forEach((c) =>
    it(`fontSize (themeId): ${c.src}`, () => {
      const result = compileLayout({ fontSize: c.src }, themeVars);
      expect(result.cssProps?.fontSize).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  const italicCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  italicCases.forEach((c) =>
    it(`italic (themeId): ${c.src}`, () => {
      const result = compileLayout({ italic: c.src }, themeVars);
      expect(result.cssProps?.fontStyle).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  const wrapCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  wrapCases.forEach((c) =>
    it(`wrapContent (themeId): ${c.src}`, () => {
      const result = compileLayout({ wrapContent: c.src }, themeVars);
      expect(result.cssProps?.flexWrap).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  const shrinkCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  shrinkCases.forEach((c) =>
    it(`canShrink (themeId): ${c.src}`, () => {
      const result = compileLayout({ canShrink: c.src }, themeVars);
      expect(result.cssProps?.flexShrink).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  const marginCases = [
    {
      src: "$myTheme",
      exp: "",
    },
  ];

  // --- margin
  marginCases.forEach((c) =>
    it(`margin (themeId): ${c.src}`, () => {
      const result = compileLayout({ margin: c.src }, themeVars);
      expect(result.cssProps?.margin).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- horizontalMargin
  marginCases.forEach((c) =>
    it(`horizontalMargin (themeId): ${c.src}`, () => {
      const result = compileLayout({ horizontalMargin: c.src }, themeVars);
      expect(result.cssProps?.marginLeft).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.cssProps?.marginRight).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- verticalMargin
  marginCases.forEach((c) =>
    it(`verticalMargin (themeId): ${c.src}`, () => {
      const result = compileLayout({ verticalMargin: c.src }, themeVars);
      expect(result.cssProps?.marginTop).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.cssProps?.marginBottom).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  // --- leftMargin
  marginCases.forEach((c) =>
    it(`marginLeft (themeId) #1: ${c.src}`, () => {
      const result = compileLayout({ marginLeft: c.src }, themeVars);
      expect(result.cssProps?.marginLeft).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  marginCases.forEach((c) =>
    it(`marginLeft (themeId) #2: ${c.src}`, () => {
      const result = compileLayout({ marginLeft: c.src, horizontalMargin: "20%" }, themeVars);
      expect(result.cssProps?.marginLeft).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.cssProps?.marginRight).equal("20%");
      expect(result.issues).equal(undefined);
    })
  );

  // --- rightMargin
  marginCases.forEach((c) =>
    it(`marginRight (themeId) #1: ${c.src}`, () => {
      const result = compileLayout({ marginRight: c.src }, themeVars);
      expect(result.cssProps?.marginRight).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  marginCases.forEach((c) =>
    it(`marginRight (themeId) #2: ${c.src}`, () => {
      const result = compileLayout({ marginRight: c.src, horizontalMargin: "20%" }, themeVars);
      expect(result.cssProps?.marginRight).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.cssProps?.marginLeft).equal("20%");
      expect(result.issues).equal(undefined);
    })
  );

  // --- topMargin
  marginCases.forEach((c) =>
    it(`marginTop (themeId) #1: ${c.src}`, () => {
      const result = compileLayout({ marginTop: c.src }, themeVars);
      expect(result.cssProps?.marginTop).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.issues).equal(undefined);
    })
  );

  marginCases.forEach((c) =>
    it(`marginTop (themeId) #2: ${c.src}`, () => {
      const result = compileLayout({ marginTop: c.src, verticalMargin: "20%" }, themeVars);
      expect(result.cssProps?.marginTop).equal(
        toCssVar({
          id: "$myTheme",
          defaultValue: c.exp ? [c.exp] : undefined,
        })
      );
      expect(result.cssProps?.marginBottom).equal("20%");
      expect(result.issues).equal(undefined);
    })
  );

  // --- bottomMargin
  marginCases.forEach((c) =>
    it(`marginBottom (themeId) #1: ${c.src}`, () => {
      const result = compileLayout({ marginBottom: c.src }, themeVars);
      expect(result.cssProps?.marginBottom).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.issues).equal(undefined);
    })
  );

  marginCases.forEach((c) =>
    it(`marginBottom (themeId) #2: ${c.src}`, () => {
      const result = compileLayout({ marginBottom: c.src, verticalMargin: "20%" }, themeVars);
      expect(result.cssProps?.marginBottom).equal(
        toCssVar({ id: "$myTheme", defaultValue: c.exp ? [c.exp] : undefined })
      );
      expect(result.cssProps?.marginTop).equal("20%");
      expect(result.issues).equal(undefined);
    })
  );

  //TODO illesg
  // it(`referencing undefined themeVar should give undefined result`, () => {
  //   const result = compileLayout({ width: "$border-ChatInput" });
  //   expect(result.cssProps?.width).equal(undefined);
  //   expect(result.issues).equal(undefined);
  // });

  it(`referencing multiple undefined themeVars should give undefined result`, () => {
    const result = compileLayout({ radius: "$myTheme $otherTheme" });
    expect(result.cssProps?.borderRadius).equal(undefined);
    expect(result.issues).equal(undefined);
  });

  it(`referencing partially undefined themeVar should give result`, () => {
    const result = compileLayout(
      { radius: "$myTheme $otherTheme" },
      {
        myTheme: "2px",
      }
    );
    expect(result.cssProps?.borderRadius).equal(`${toCssVar("$myTheme")} / ${toCssVar("$otherTheme")}`);
    expect(result.issues).equal(undefined);
  });
});

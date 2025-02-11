import { describe, expect, it } from "vitest";
import { StyleTokenType } from "../../../src/parsers/style-parser/tokens";
import { StyleLexer } from "../../../src/parsers/style-parser/StyleLexer";
import { StyleInputStream } from "../../../src/parsers/style-parser/StyleInputStream";

describe("Parser - Binary operations", () => {
  const simpleTokens = [
    { src: " ", token: StyleTokenType.Ws },
    { src: "\t", token: StyleTokenType.Ws },
    { src: "\n", token: StyleTokenType.Ws },
    { src: "\r", token: StyleTokenType.Ws },
    { src: "*", token: StyleTokenType.Star },
    { src: ",", token: StyleTokenType.Comma },
    { src: "(", token: StyleTokenType.LParent },
    { src: ")", token: StyleTokenType.RParent },
    { src: "%", token: StyleTokenType.Percentage },
    { src: "/", token: StyleTokenType.Slash },
    { src: "none", token: StyleTokenType.None },
    { src: "reset", token: StyleTokenType.Reset },
  ];

  simpleTokens.forEach((s) =>
    it(`Token: ${s.src}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s.src));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s.src);
      expect(token.type).equal(s.token);
    })
  );

  const sizeUnitTokens = ["px", "cm", "mm", "in", "pt", "pc", "em", "rem", "vw", "vh", "ex", "ch", "vmin", "vmax"];

  sizeUnitTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.SizeUnit);
    })
  );

  const alignmentTokens = ["start", "center", "end"];

  alignmentTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.Alignment);
    })
  );

  const textAlignTokens = ["left", "right", "justify"];

  textAlignTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.TextAlignment);
    })
  );

  const orientationTokens = ["horizontal", "vertical"];

  orientationTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.Orientation);
    })
  );

  const borderStyleTokens = ["dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"];

  borderStyleTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.BorderStyle);
    })
  );

  const directionTokens = ["ltr", "rtl"];

  directionTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.Direction);
    })
  );

  const fontWeightTokens = ["lighter", "normal", "bold", "bolder", "100", "200"];

  fontWeightTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).to.be.oneOf([StyleTokenType.FontWeight, StyleTokenType.Number]);
    })
  );

  const zIndexTokens = ["-1", "0", "1", "99"];

  zIndexTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.Number);
    })
  );

  const scrollingTokens = ["visible", "hidden", "scroll"];

  scrollingTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.Scrolling);
    })
  );

  const fontFamilyTokens = ["$fontFamily", "serif", "sansSerif", "mono"];

  fontFamilyTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).to.be.oneOf([StyleTokenType.FontFamily, StyleTokenType.Identifier]);
    })
  );

  const angleTokens = ["deg", "rad", "grad", "turn"];

  angleTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.Angle);
    })
  );

  const numberTokens = [
    { src: "0", value: 0 },
    { src: "1", value: 1 },
    { src: "2", value: 2 },
    { src: "3", value: 3 },
    { src: "4", value: 4 },
    { src: "5", value: 5 },
    { src: "6", value: 6 },
    { src: "7", value: 7 },
    { src: "8", value: 8 },
    { src: "9", value: 9 },
    { src: "123", value: 123 },
    { src: ".25", value: 0.25 },
    { src: "1234.125", value: 1234.125 },
    { src: "-9", value: -9 },
    { src: "-123", value: -123 },
    { src: "-.25", value: -0.25 },
    { src: "-1234.125", value: -1234.125 },
  ];

  numberTokens.forEach((s) =>
    it(`Token: ${s.src}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s.src));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s.src);
      expect(token.type).equal(StyleTokenType.Number);
      expect(parseFloat(token.text)).equal(s.value);
    })
  );

  const hexaColorTokens = [
    { src: "#", token: StyleTokenType.Unknown },
    { src: "#1", token: StyleTokenType.Unknown },
    { src: "#f2", token: StyleTokenType.Unknown },
    { src: "#abc", token: StyleTokenType.HexaColor },
    { src: "#abcf", token: StyleTokenType.HexaColor },
    { src: "#1abcf", token: StyleTokenType.Unknown },
    { src: "#12abcf", token: StyleTokenType.HexaColor },
    { src: "#012abcf", token: StyleTokenType.Unknown },
    { src: "#4312abcf", token: StyleTokenType.HexaColor },
    { src: "#14312abcf", token: StyleTokenType.Unknown },
    { src: "#d14312abcf", token: StyleTokenType.Unknown },
  ];

  hexaColorTokens.forEach((s) =>
    it(`Token: ${s.src}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s.src));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s.src);
      expect(token.type).equal(s.token);
    })
  );

  it("Token: none", () => {
    // --- Arrange
    const lexer = new StyleLexer(new StyleInputStream("none"));

    // --- Act
    const token = lexer.get(true);

    // --- Assert
    expect(token.text).equal("none");
    expect(token.type).equal(StyleTokenType.None);
  });

  const colorFunctionTokens = ["rgb", "rgba", "hsl", "hsla"];

  colorFunctionTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.ColorFunc);
    })
  );

  const colorNameTokens = [
    "transparent",
    "black",
    "silver",
    "gray",
    "white",
    "maroon",
    "red",
    "purple",
    "fuchsia",
    "green",
    "lime",
    "olive",
    "yellow",
    "navy",
    "blue",
    "teal",
    "aqua",
    "orange",
    "aliceblue",
    "antiquewhite",
    "aquamarine",
    "azure",
    "beige",
    "bisque",
    "blanchedalmond",
    "blueviolet",
    "brown",
    "burlywood",
    "cadetblue",
    "chartreuse",
    "chocolate",
    "coral",
    "cornflowerblue",
    "cornsilk",
    "crimson",
    "cyan",
    "darkblue",
    "darkcyan",
    "darkgoldenrod",
    "darkgray",
    "darkgreen",
    "darkgrey",
    "darkkhaki",
    "darkmagenta",
    "darkolivegreen",
    "darkorange",
    "darkorchid",
    "darkred",
    "darksalmon",
    "darkseagreen",
    "darkslateblue",
    "darkslategray",
    "darkslategrey",
    "darkturquoise",
    "darkviolet",
    "deeppink",
    "deepskyblue",
    "dimgray",
    "dimgrey",
    "dodgerblue",
    "firebrick",
    "floralwhite",
    "forestgreen",
    "gainsboro",
    "ghostwhite",
    "gold",
    "goldenrod",
    "greenyellow",
    "grey",
    "honeydew",
    "hotpink",
    "indianred",
    "indigo",
    "ivory",
    "khaki",
    "lavender",
    "lavenderblush",
    "lawngreen",
    "lemonchiffon",
    "lightblue",
    "lightcoral",
    "lightcyan",
    "lightgoldenrodyellow",
    "lightgray",
    "lightgreen",
    "lightgrey",
    "lightpink",
    "lightsalmon",
    "lightseagreen",
    "lightskyblue",
    "lightslategray",
    "lightslategrey",
    "lightsteelblue",
    "lightyellow",
    "limegreen",
    "linen",
    "magenta",
    "mediumaquamarine",
    "mediumblue",
    "mediumorchid",
    "mediumpurple",
    "mediumseagreen",
    "mediumslateblue",
    "mediumspringgreen",
    "mediumturquoise",
    "mediumvioletred",
    "midnightblue",
    "mintcream",
    "mistyrose",
    "moccasin",
    "navajowhite",
    "oldlace",
    "olivedrab",
    "orangered",
    "orchid",
    "palegoldenrod",
    "palegreen",
    "paleturquoise",
    "palevioletred",
    "papayawhip",
    "peachpuff",
    "peru",
    "pink",
    "plum",
    "powderblue",
    "rosybrown",
    "royalblue",
    "saddlebrown",
    "salmon",
    "sandybrown",
    "seagreen",
    "seashell",
    "sienna",
    "skyblue",
    "slateblue",
    "slategray",
    "slategrey",
    "snow",
    "springgreen",
    "steelblue",
    "tan",
    "thistle",
    "tomato",
    "turquoise",
    "violet",
    "wheat",
    "whitesmoke",
    "yellowgreen",
    "rebeccapurple",
  ];

  colorNameTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.ColorName);
    })
  );

  const lineDecorationTokens = ["underline", "overline", "line-through"];

  lineDecorationTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.DecorationLine);
    })
  );

  const stringTokens = ["'start'", "'Courier New'", '"end"'];

  stringTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.String);
    })
  );

  const userSelectTokens = ["all", "text", "contain"];

  userSelectTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.UserSelect);
    })
  );

  const textTransformTokens = ["capitalize", "uppercase", "lowercase", "full-width", "full-size-kana"];

  textTransformTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
      expect(token.type).equal(StyleTokenType.TextTransform);
    })
  );

  const cursorTokens = [
    "auto",
    "default",
    "none",
    "context-menu",
    "help",
    "pointer",
    "progress",
    "wait",
    "cell",
    "crosshair",
    "text",
    "vertical-text",
    "alias",
    "copy",
    "move",
    "no-drop",
    "not-allowed",
    "grab",
    "grabbing",
    "all-scroll",
    "col-resize",
    "row-resize",
    "n-resize",
    "e-resize",
    "s-resize",
    "w-resize",
    "ne-resize",
    "nw-resize",
    "se-resize",
    "sw-resize",
    "ew-resize",
    "ns-resize",
    "nesw-resize",
    "nwse-resize",
    "zoom-in",
    "zoom-out",
  ];

  cursorTokens.forEach((s) =>
    it(`Token: ${s}`, () => {
      // --- Arrange
      const lexer = new StyleLexer(new StyleInputStream(s));

      // --- Act
      const token = lexer.get(true);

      // --- Assert
      expect(token.text).equal(s);
    })
  );
});

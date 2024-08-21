import type { StyleErrorCodes } from "./errors";
import type { StyleToken } from "./tokens";
import type {
  AlignmentNode,
  BaseNode,
  BooleanNode,
  BorderNode,
  BorderStyleNode,
  ColorNode,
  CursorNode,
  DirectionNode,
  FontFamilyNode,
  FontWeightNode,
  OrientationNode,
  RadiusNode,
  ScrollingNode,
  ShadowNode,
  ShadowSegment,
  SizeNode,
  StyleNode,
  TextAlignNode,
  TextDecorationNode,
  TextTransformNode,
  ThemeIdDescriptor,
  UserSelectNode,
  ZIndexNode,
} from "./source-tree";
import { styleErrorMessages, StyleParserError } from "./errors";
import { StyleInputStream } from "./StyleInputStream";
import { StyleLexer } from "./StyleLexer";
import { StyleTokenType } from "./tokens";

export const THEME_VAR_PREFIX = "xmlui";

type StyleParserErrorMessage = {
  code: StyleErrorCodes;
  text: string;
  position: number;
};

/**
 * This class parses a binding expression and transforms it into an evaluable expression tree
 */
export class StyleParser {
  // --- Keep track of error messages
  private _parseErrors: StyleParserErrorMessage[] = [];

  // --- Use this lexer
  private _lexer: StyleLexer;

  /**
   * Initializes the parser with the specified source code
   * @param source Source code to parse
   */
  constructor(public readonly source: string) {
    this._lexer = new StyleLexer(new StyleInputStream(source));
  }

  /**
   * The errors raised during the parse phase
   */
  get errors(): StyleParserErrorMessage[] {
    return this._parseErrors;
  }

  /**
   * Gets the current token
   */
  get current(): StyleToken {
    return this._lexer.peek();
  }

  /**
   * Checks if we're at the end of the expression
   */
  get isEof(): boolean {
    return this._lexer.peek().type === StyleTokenType.Eof;
  }

  /**
   * Gets the characters remaining after parsing
   */
  getTail(): string {
    return this._lexer.getTail();
  }

  /**
   * Tests if the parse is complete
   */
  testCompleted(): boolean {
    const token = this._lexer.peek(true);
    if (token.type === StyleTokenType.Eof) return true;
    if (token.type === StyleTokenType.Ws) {
      this._lexer.get(true);
      return this._lexer.peek().type === StyleTokenType.Eof;
    } else {
      return false;
    }
  }

  /**
   * Parses a size value with its unit
   */
  parseSize(): SizeNode | null {
    return this.parseSizeLike("px");
  }

  /**
   * Parses a line height value
   */
  parseLineHeight(): SizeNode | null {
    return this.parseSizeLike("");
  }

  /**
   * Parses size and allows "fit-content"
   */
  parseMargin(): SizeNode | null {
    const startToken = this._lexer.peek();
    if (startToken.type === StyleTokenType.Auto) {
      this._lexer.get();
      return this.createNode<SizeNode>(
        "Size",
        {
          value: -1,
          unit: "",
          extSize: startToken.text,
        },
        startToken
      );
    }
    return this.parseSize();
  }

  /**
   * Parses an opacity value
   */
  parseOpacity(): SizeNode | null {
    const startToken = this._lexer.peek();
    const themeIdNode = this.tryThemeId<SizeNode>();
    if (themeIdNode) return themeIdNode;

    const value = this.getNumber();
    if (value === null) return null;

    // --- Get the unit
    let unit = "";
    const unitToken = this._lexer.peek(true);
    if (unitToken.text === "%") {
      unit = this._lexer.get(true).text;
    } else if (unitToken.type === StyleTokenType.Ws) {
      this._lexer.get(true);
    } else if (unitToken.type !== StyleTokenType.Eof) {
      this.reportError("S016", unitToken);
      return null;
    }

    // --- Done.
    return this.createNode<SizeNode>(
      "Size",
      {
        value,
        unit,
      },
      startToken
    );
  }

  /**
   * Parses a boolean value
   */
  parseBoolean(): BooleanNode | null {
    const startToken = this._lexer.peek();
    const themeIdNode = this.tryThemeId<BooleanNode>();
    if (themeIdNode) return themeIdNode;

    if (startToken.type !== StyleTokenType.Boolean) {
      this.reportError("S017", startToken);
      return null;
    }
    // --- Done.
    this._lexer.get();
    return this.createNode<BooleanNode>(
      "Boolean",
      {
        value: startToken.text === "true" || startToken.text === "yes" || startToken.text === "on",
      },
      startToken
    );
  }

  /**
   * Parses an alignment value
   */
  parseAlignment(): AlignmentNode | null {
    const startToken = this._lexer.peek();
    if (startToken.type !== StyleTokenType.Alignment) {
      this.reportError("S003", startToken);
      return null;
    }
    // --- Done.
    this._lexer.get();
    return this.createNode<AlignmentNode>(
      "Alignment",
      {
        value: startToken.text,
      },
      startToken
    );
  }

  /**
   * Parses a text alignment value
   */
  parseTextAlign(): TextAlignNode | null {
    const startToken = this._lexer.peek();
    if (startToken.type !== StyleTokenType.Alignment && startToken.type !== StyleTokenType.TextAlignment) {
      this.reportError("S003", startToken);
      return null;
    }
    // --- Done.
    this._lexer.get();
    return this.createNode<TextAlignNode>(
      "TextAlign",
      {
        value: startToken.text,
      },
      startToken
    );
  }

  /**
   * Parses a user select value
   */
  parseUserSelect(): UserSelectNode | null {
    const startToken = this._lexer.peek();
    if (
      startToken.type !== StyleTokenType.None &&
      startToken.type !== StyleTokenType.Auto &&
      startToken.type !== StyleTokenType.UserSelect
    ) {
      this.reportError("S020", startToken);
      return null;
    }
    // --- Done.
    this._lexer.get();
    return this.createNode<UserSelectNode>(
      "UserSelect",
      {
        value: startToken.text,
      },
      startToken
    );
  }

  /**
   * Parses a text transform value
   */
  parseTextTransform(): TextTransformNode | null {
    const startToken = this._lexer.peek();
    if (startToken.type !== StyleTokenType.None && startToken.type !== StyleTokenType.TextTransform) {
      this.reportError("S021", startToken);
      return null;
    }

    // --- Done.
    this._lexer.get();
    return this.createNode<TextTransformNode>(
      "TextTransform",
      {
        value: startToken.text,
      },
      startToken
    );
  }

  /**
   * Parses an orientation value
   */
  parseOrientation(): OrientationNode | null {
    const startToken = this._lexer.peek();
    if (startToken.type !== StyleTokenType.Orientation) {
      this.reportError("S018", startToken);
      return null;
    }
    // --- Done.
    this._lexer.get();
    return this.createNode<OrientationNode>(
      "Orientation",
      {
        value: startToken.text,
      },
      startToken
    );
  }

  /**
   * Parses a cursor value
   */
  parseCursor(): CursorNode | null {
    const startToken = this._lexer.peek();
    switch (startToken.type) {
      case StyleTokenType.Auto:
      case StyleTokenType.None:
      case StyleTokenType.Default:
      case StyleTokenType.Cursor:
        this._lexer.get();
        return this.createNode<CursorNode>(
          "Cursor",
          {
            value: startToken.text,
          },
          startToken
        );
      case StyleTokenType.UserSelect:
        if (startToken.text === "text") {
          this._lexer.get();
          return this.createNode<CursorNode>(
            "Cursor",
            {
              value: "text",
            },
            startToken
          );
        }
        this.reportError("S018", startToken);
        return null;
      default:
        this.reportError("S018", startToken);
        return null;
    }
  }

  /**
   * Parses a direction value
   */
  parseDirection(): DirectionNode | null {
    const startToken = this._lexer.peek();
    const themeIdNode = this.tryThemeId<DirectionNode>();
    if (themeIdNode) return themeIdNode;

    if (startToken.type !== StyleTokenType.Direction) {
      this.reportError("S013", startToken);
      return null;
    }
    // --- Done.
    this._lexer.get();
    return this.createNode<DirectionNode>(
      "Direction",
      {
        value: startToken.text,
      },
      startToken
    );
  }

  /**
   * Parses a fontFamily value
   */
  parseFontFamily(): FontFamilyNode | null {
    const startToken = this._lexer.peek();
    const themeIdNode = this.tryThemeId<FontFamilyNode>();
    if (themeIdNode) return themeIdNode;

    let value = "";
    let nextToken = startToken;
    while (true) {
      // --- Get font name token
      if (nextToken.type === StyleTokenType.Eof) break;
      if (
        nextToken.type === StyleTokenType.FontFamily ||
        nextToken.type === StyleTokenType.Identifier ||
        nextToken.type === StyleTokenType.String
      ) {
        value += (value ? ", " : "") + nextToken.text;
      } else {
        this.reportError("S014", nextToken);
        return null;
      }

      // --- Skip the parsed token
      this._lexer.get();

      // --- Check for separator comma
      nextToken = this._lexer.peek();
      if (nextToken.type === StyleTokenType.Comma) {
        this._lexer.get();
      } else {
        break;
      }
      nextToken = this._lexer.peek();
    }

    // --- Done.
    return this.createNode<FontFamilyNode>(
      "FontFamily",
      {
        value,
      },
      startToken
    );
  }

  /**
   * Parses a weight value
   */
  parseFontWeight(): FontWeightNode | null {
    const startToken = this._lexer.peek();
    const themeIdNode = this.tryThemeId<FontWeightNode>();
    if (themeIdNode) return themeIdNode;

    if (startToken.type !== StyleTokenType.FontWeight && startToken.type !== StyleTokenType.Number) {
      this.reportError("S015", startToken);
      return null;
    }
    // --- Done.
    this._lexer.get();
    return this.createNode<FontWeightNode>(
      "FontWeight",
      {
        value: startToken.text,
      },
      startToken
    );
  }

  /**
   * Parses a zIndex value
   */
  parseZIndex(): ZIndexNode | null {
    const startToken = this._lexer.peek();
    const themeIdNode = this.tryThemeId<ZIndexNode>();
    if (themeIdNode) return themeIdNode;

    if (startToken.type !== StyleTokenType.Number) {
      this.reportError("S001", startToken);
      return null;
    }
    // --- Done.
    this._lexer.get();
    return this.createNode<ZIndexNode>(
      "ZIndex",
      {
        value: startToken.text,
      },
      startToken
    );
  }

  /**
   * Parses a scrolling value
   */
  parseScrolling(): ScrollingNode | null {
    const startToken = this._lexer.peek();
    const themeIdNode = this.tryThemeId<ScrollingNode>();
    if (themeIdNode) return themeIdNode;

    if (startToken.type !== StyleTokenType.Scrolling) {
      this.reportError("S012", startToken);
      return null;
    }
    // --- Done.
    this._lexer.get();
    return this.createNode<ScrollingNode>(
      "Scrolling",
      {
        value: startToken.text,
      },
      startToken
    );
  }

  /**
   * Parses a border style value with its unit
   */
  parseBorderStyle(): BorderStyleNode | null {
    const startToken = this._lexer.peek();
    if (startToken.type !== StyleTokenType.BorderStyle && startToken.type !== StyleTokenType.None) {
      this.reportError("S004", startToken);
      return null;
    }
    // --- Done.
    this._lexer.get();
    return this.createNode<BorderStyleNode>(
      "BorderStyle",
      {
        value: startToken.text,
      },
      startToken
    );
  }

  /**
   * Parses a border (size, style, color in arbitrary order)
   */
  parseBorder(): BorderNode | null {
    const startToken = this._lexer.peek();
    const themeIdNode = this.tryThemeId<BorderNode>();
    let themeId1: ThemeIdDescriptor | undefined;

    let maxStyleTokens = 3;
    if (themeIdNode) {
      if (this.testCompleted()) {
        return themeIdNode;
      }
      maxStyleTokens = 2;
      themeId1 = themeIdNode.themeId;
    }

    let sizeFound: SizeNode | null = null;
    let styleFound: BorderStyleNode | null = null;
    let colorFound: ColorNode | null = null;

    let themeId2: ThemeIdDescriptor | undefined;
    let themeId3: ThemeIdDescriptor | undefined;

    for (let i = 0; i < maxStyleTokens; i++) {
      const nextToken = this._lexer.peek();
      if (isThemeId(nextToken)) {
        if (!themeId2) {
          themeId2 = this.parseThemeId();
        } else {
          themeId3 = this.parseThemeId();
        }
      } else {
        switch (nextToken.type) {
          case StyleTokenType.Number:
            if (sizeFound) {
              this.reportError("S016", nextToken);
              return null;
            }
            sizeFound = this.parseSize();
            break;

          case StyleTokenType.BorderStyle:
            if (styleFound) {
              this.reportError("S016", nextToken);
              return null;
            }
            styleFound = this.parseBorderStyle();
            break;

          case StyleTokenType.ColorName:
          case StyleTokenType.ColorFunc:
          case StyleTokenType.HexaColor:
            if (colorFound) {
              this.reportError("S016", nextToken);
              return null;
            }
            colorFound = this.parseColor();
            break;

          default:
            this.reportError("S016", nextToken);
            return null;
        }
      }

      const spToken = this._lexer.peek(true);
      if (spToken.type === StyleTokenType.Eof) break;
      if (spToken.type === StyleTokenType.Ws) {
        this._lexer.get(true);
      }
    }

    return this.createNode<BorderNode>(
      "Border",
      {
        themeId1,
        themeId2,
        themeId3,
        widthValue: sizeFound?.value,
        widthUnit: sizeFound?.unit,
        color: colorFound?.value,
        styleValue: styleFound?.value,
      },
      startToken
    );
  }

  /**
   * Parses a color value
   */
  parseColor(): ColorNode | null {
    const startToken = this._lexer.peek();
    const themeIdNode = this.tryThemeId<ColorNode>();
    if (themeIdNode) return themeIdNode;

    const parser = this;
    switch (startToken.type) {
      case StyleTokenType.ColorName:
        this._lexer.get();
        return this.createNode<ColorNode>(
          "Color",
          {
            value: startToken.text.toLowerCase(),
          },
          startToken
        );

      case StyleTokenType.HexaColor:
        this._lexer.get();
        return this.createNode<ColorNode>(
          "Color",
          {
            value: startToken.text,
          },
          startToken
        );

      case StyleTokenType.ColorFunc:
        let success = false;
        switch (startToken.text) {
          case "rgb":
            success = parseColorParameters(["V%", "V%", "V%"]);
            break;
          case "rgba":
            success = parseColorParameters(["V%", "V%", "V%", "alpha"]);
            break;
          case "hsl":
            success = parseColorParameters(["angle", "%", "%"]);
            break;
          case "hsla":
            success = parseColorParameters(["angle", "%", "%", "alpha"]);
            break;
          default:
            this.reportError("S006", startToken, startToken.text);
            return null;
        }
        if (success) {
          return {
            type: "Color",
            startPosition: startToken.start,
            endPosition: this._lexer.peek().start,
            value: this.getSource(startToken, this._lexer.peek()),
          };
        }
        return null;

      default:
        this.reportError("S005", startToken);
        return null;
    }

    function parseColorParameters(pars: string[]): boolean {
      // --- Skip the color function name token
      parser._lexer.get();

      // --- Expect "("
      parser.expectToken(StyleTokenType.LParent, "S007");

      // --- Iterate through pars
      for (let i = 0; i < pars.length; i++) {
        // --- Get the parameter value
        const value = parser.getNumber();
        if (value === null) return false;

        // --- Get optional parameter unit
        const unit = parser._lexer.peek(true);

        // --- Process the value & unit
        switch (pars[i]) {
          // 0-255 or 0%-100%
          case "V%":
            if (unit.type === StyleTokenType.Percentage) {
              if (value < 0 || value > 100) {
                parser.reportError("S008");
                return false;
              }
              parser._lexer.get();
            } else {
              if (value < 0 || value > 255) {
                parser.reportError("S009");
                return false;
              }
            }
            break;
          // 0%-100%
          case "%":
            if (unit.type !== StyleTokenType.Percentage || value < 0 || value > 100) {
              parser.reportError("S008");
              return false;
            }
            parser._lexer.get();
            break;

          case "angle":
            if (unit.type === StyleTokenType.Angle) {
              parser._lexer.get();
            }
            break;

          // alpha with units
          case "alpha":
            if (unit.type === StyleTokenType.Percentage) {
              if (value < 0 || value > 100) {
                parser.reportError("S008");
                return false;
              }
              parser._lexer.get();
            } else {
              if (value < 0 || value > 1) {
                parser.reportError("S011");
                return false;
              }
            }
            break;
        }

        // --- No separator expected after the last parameter
        if (i === pars.length - 1) continue;

        // --- Process the separator
        let sepToken = parser._lexer.peek(true);
        if (sepToken.type === StyleTokenType.Ws) {
          parser._lexer.get();
          sepToken = parser._lexer.peek(true);
          if (sepToken.type === StyleTokenType.Comma) {
            parser._lexer.get();
          }
        } else {
          parser.expectToken(StyleTokenType.Comma);
        }
        sepToken = parser._lexer.peek();
        if (sepToken.type === StyleTokenType.Ws) {
          parser._lexer.get();
        }
      }

      // --- Process the optional separator
      let aSepToken = parser._lexer.peek();
      if (aSepToken.type === StyleTokenType.Ws) {
        parser._lexer.get();
      }

      // --- Expect ")"
      parser.expectToken(StyleTokenType.RParent, "S010");
      return true;
    }
  }

  /**
   * Parses a text decoration value
   */
  parseTextDecoration(): TextDecorationNode | null {
    const startToken = this._lexer.peek();
    if (startToken.type === StyleTokenType.None) {
      this._lexer.get();
      return this.createNode<TextDecorationNode>(
        "TextDecoration",
        {
          none: true,
        },
        startToken
      );
    }

    const themeIdNode = this.tryThemeId<TextDecorationNode>();
    let themeId1: ThemeIdDescriptor | undefined;

    let maxStyleTokens = 3;
    if (themeIdNode) {
      if (this.testCompleted()) {
        return themeIdNode;
      }
      maxStyleTokens = 2;
      themeId1 = themeIdNode.themeId;
    }

    const acceptedStyles = ["solid", "double", "dotted", "dashed", "wavy"];
    let lineFound: string | undefined;
    let styleFound: string | undefined;
    let colorFound: ColorNode | null = null;

    let themeId2: ThemeIdDescriptor | undefined;
    let themeId3: ThemeIdDescriptor | undefined;

    for (let i = 0; i < maxStyleTokens; i++) {
      const nextToken = this._lexer.peek();
      if (isThemeId(nextToken)) {
        if (!themeId2) {
          themeId2 = this.parseThemeId();
        } else {
          themeId3 = this.parseThemeId();
        }
      } else {
        if (acceptedStyles.indexOf(nextToken.text) >= 0) {
          styleFound = nextToken.text;
          this._lexer.get();
        } else {
          switch (nextToken.type) {
            case StyleTokenType.DecorationLine:
              if (lineFound) {
                this.reportError("S016", nextToken);
                return null;
              }
              this._lexer.get();
              lineFound = nextToken.text;
              break;

            case StyleTokenType.ColorName:
            case StyleTokenType.ColorFunc:
            case StyleTokenType.HexaColor:
              if (colorFound) {
                this.reportError("S016", nextToken);
                return null;
              }
              colorFound = this.parseColor();
              break;

            default:
              this.reportError("S016", nextToken);
              return null;
          }
        }
      }
      const spToken = this._lexer.peek(true);
      if (spToken.type === StyleTokenType.Eof) break;
      if (spToken.type === StyleTokenType.Ws) {
        this._lexer.get(true);
      }
    }

    return this.createNode<TextDecorationNode>(
      "TextDecoration",
      {
        themeId1,
        themeId2,
        themeId3,
        color: colorFound?.value,
        style: styleFound,
        line: lineFound,
      },
      startToken
    );
  }

  /**
   * Parses a radius value
   */
  parseRadius(): RadiusNode | null {
    const values: SizeNode[] = [];
    const themeIds: ThemeIdDescriptor[] = [];
    const startToken = this._lexer.peek();
    let count = 0;
    while (count < 2) {
      // --- Resolve to theme id or size
      const themeIdNode = this.tryThemeId<RadiusNode>();
      if (themeIdNode) {
        themeIds[count] = themeIdNode.themeId!;
        if (this._lexer.peek().type === StyleTokenType.Eof) {
          // --- No more token
          count = 5;
        } else {
          // --- Skip trailing spaces
          while (this._lexer.peek(true).type === StyleTokenType.Ws) {
            this._lexer.get(true);
          }
        }
      } else {
        let size = this.parseSize();
        if (!size) {
          return null;
        }
        values[count] = size;

        // --- Search for the end/whitespace
        let wsCount = 0;
        while (true) {
          let nextToken = this._lexer.peek(true);
          if (nextToken.type === StyleTokenType.Eof) {
            // --- No more token
            count = 5;
            wsCount = 1;
            break;
          }
          if (nextToken.type === StyleTokenType.Ws) {
            // Skip the whitespace
            this._lexer.get(true);
            wsCount++;
          } else {
            break;
          }
        }

        // --- We need a separator
        if (!wsCount) {
          this.reportError("S016");
          return null;
        }
      }

      // --- Next item
      count++;
    }

    return this.createNode<RadiusNode>(
      "Radius",
      {
        themeId1: themeIds[0],
        themeId2: themeIds[1],
        value1: values[0]?.value,
        unit1: values[0]?.unit,
        value2: values[1]?.value,
        unit2: values[1]?.unit,
      },
      startToken
    );
  }

  /**
   * Parses a shadow value
   */
  parseShadow(): ShadowNode | null {
    const startToken = this._lexer.peek();
    const themeIdNode = this.tryThemeId<ShadowNode>();
    if (themeIdNode) return themeIdNode;

    const segments: ShadowSegment[] = [];
    let nextToken: StyleToken | null = null;

    // --- Parse a single segment
    while (true) {
      let inset: boolean | null = null;
      let sizeX: SizeNode | null = null;
      let sizeY: SizeNode | null = null;
      let blurRadius: SizeNode | null = null;
      let spreadRadius: SizeNode | null = null;
      let color: ColorNode | null = null;

      nextToken = this._lexer.peek();
      if (nextToken.text === "inset") {
        inset = true;
        this._lexer.get();
        nextToken = this._lexer.peek();
      }

      // --- Offset values
      sizeX = this.parseSize();
      if (!sizeX) {
        return null;
      }
      nextToken = this._lexer.peek(true);
      if (nextToken.type !== StyleTokenType.Ws) {
        this.reportError("S016", nextToken);
      }
      this._lexer.get();
      sizeY = this.parseSize();
      if (!sizeY) {
        return null;
      }
      nextToken = this._lexer.peek(true);
      if (nextToken.type === StyleTokenType.Ws) {
        this._lexer.get();
        nextToken = this._lexer.peek();
        if (nextToken.type === StyleTokenType.Number) {
          // --- Blur radius
          blurRadius = this.parseSize();
          nextToken = this._lexer.peek(true);
        }
        if (nextToken.type === StyleTokenType.Ws) {
          this._lexer.get();
          nextToken = this._lexer.peek();
          if (nextToken.type === StyleTokenType.Number) {
            // --- Spread radius
            spreadRadius = this.parseSize();
            nextToken = this._lexer.peek(true);
          }
        }
      }

      // --- Check for color
      if (nextToken.type === StyleTokenType.Ws) {
        nextToken = this._lexer.get();
      }
      if (nextToken.type !== StyleTokenType.Eof && nextToken.type !== StyleTokenType.Comma) {
        color = this.parseColor();
      }

      // --- Create segment
      segments.push({
        inset: inset ?? undefined,
        offsetXValue: sizeX.value,
        offsetXUnit: sizeX.unit,
        offsetYValue: sizeY.value,
        offsetYUnit: sizeY.unit,
        blurRadiusValue: blurRadius?.value,
        blurRadiusUnit: blurRadius?.unit,
        spreadRadiusValue: spreadRadius?.value,
        spreadRadiusUnit: spreadRadius?.unit,
        color: color?.value,
      });

      // --- Check for next segment
      const sp = this._lexer.peek(true);
      if (sp.type === StyleTokenType.Comma) {
        // --- There is a next shadow segment
        this._lexer.get();
      } else {
        break;
      }
    }

    return this.createNode<ShadowNode>(
      "Shadow",
      {
        segments,
      },
      startToken
    );
  }

  private getNumber(): number | null {
    const token = this._lexer.get();
    if (token.type === StyleTokenType.Number) {
      return parseFloat(token.text);
    }
    this.reportError("S001", token);
    return null;
  }

  private expectToken(type: StyleTokenType, errorCode?: StyleErrorCodes, allowEof?: boolean): StyleToken | null {
    const next = this._lexer.peek();
    if (next.type === type || (allowEof && next.type === StyleTokenType.Eof)) {
      // --- Skip the expected token
      return this._lexer.get();
    }
    this.reportError(errorCode ?? "S007", next, next.text);
    return null;
  }

  /**
   * Reports the specified error
   * @param errorCode Error code
   * @param token Token that represents the error's position
   * @param options Error message options
   */
  private reportError(errorCode: StyleErrorCodes, token?: StyleToken, ...options: any[]): void {
    let errorText: string = styleErrorMessages[errorCode] ?? "Unknown error";
    if (options) {
      options.forEach((o, idx) => (errorText = replace(errorText, `{${idx}}`, options[idx].toString())));
    }
    if (!token) {
      token = this._lexer.peek(true);
    }
    this._parseErrors.push({
      code: errorCode,
      text: errorText,
      position: token.start,
    });
    throw new StyleParserError(errorText, errorCode);

    function replace(input: string, placeholder: string, replacement: string): string {
      do {
        input = input.replace(placeholder, replacement);
      } while (input.includes(placeholder));
      return input;
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
  private createNode<T extends BaseNode>(
    type: StyleNode["type"],
    stump: any,
    startToken: StyleToken,
    endToken?: StyleToken,
    source?: string
  ): T {
    if (!endToken) {
      endToken = this._lexer.peek(true);
    }
    const startPosition = startToken.start;
    const endPosition = endToken.start;
    return Object.assign({}, stump, {
      type,
      startPosition,
      endPosition,
      source: source ?? this.getSource(startToken, endToken),
    } as BaseNode);
  }

  /**
   * Gets the source code for the specified token range
   * @param start Start token
   * @param end Optional end token
   * @returns The source code for the token range
   */
  private getSource(start: StyleToken, end?: StyleToken): string {
    if (!end) end = this._lexer.peek();
    return this.source.substring(start.start, end.start);
  }

  private tryThemeId<T extends BaseNode>(): T | null {
    const token = this._lexer.peek();
    if (isThemeId(token)) {
      return this.createNode<T>(
        "Boolean",
        {
          themeId: this.parseThemeId(),
        },
        token
      );
    }
    return null;
  }

  private parseThemeId(): ThemeIdDescriptor {
    const startToken = this._lexer.peek();
    this._lexer.get();
    return {
      id: startToken.text,
    };
  }

  /**
   * Parses a size value with its unit
   */
  private parseSizeLike(defUnit = ""): SizeNode | null {
    const startToken = this._lexer.peek();
    const themeIdNode = this.tryThemeId<SizeNode>();
    if (themeIdNode) return themeIdNode;

    if (startToken.type === StyleTokenType.Star) {
      this._lexer.get();
      const nextToken = this._lexer.peek(true);
      if (nextToken.type === StyleTokenType.Ws) {
        this._lexer.get(true);
      } else if (nextToken.type !== StyleTokenType.Eof) {
        this.reportError("S016", nextToken);
        return null;
      }

      // --- Done with "*"
      return this.createNode<SizeNode>(
        "Size",
        {
          value: 1,
          unit: "*",
        },
        startToken
      );
    }

    const value = this.getNumber();
    if (value === null) return null;

    // --- Get the unit
    let unit = "";
    const unitToken = this._lexer.peek(true);
    if (
      unitToken.type === StyleTokenType.SizeUnit ||
      unitToken.type === StyleTokenType.Star ||
      unitToken.type === StyleTokenType.Percentage
    ) {
      unit = this._lexer.get(true).text;
    } else if (unitToken.type === StyleTokenType.Ws) {
      this._lexer.get(true);
    } else if (unitToken.type !== StyleTokenType.Eof) {
      this.reportError("S016", unitToken);
      return null;
    }

    // --- Done.
    return this.createNode<SizeNode>(
      "Size",
      {
        value,
        unit: unit ? unit : value ? defUnit : "",
      },
      startToken
    );
  }
}

/**
 * Tests if the specified token is a theme identifier
 * @param value Token to test
 */
function isThemeId(value: StyleToken): boolean {
  return value.type === StyleTokenType.Identifier && value.text.charAt(0) === "$";
}

/**
 * Converts the specified themeID to a CSS var string
 * @param c segment to convert
 */
export function toCssVar(c: string | ThemeIdDescriptor): string {
  if (typeof c === "string") {
    return `var(--${THEME_VAR_PREFIX}-${c.substring(1)})`;
  }
  if (c.defaultValue && c.defaultValue.length > 0) {
    let defaultValueString = "";
    for (const segment of c.defaultValue) {
      defaultValueString += typeof segment === "string" ? segment : toCssVar(segment);
    }
    return `var(--${THEME_VAR_PREFIX}-${c.id.substring(1)}, ${defaultValueString})`;
  } else {
    return `var(--${THEME_VAR_PREFIX}-${c.id.substring(1)})`;
  }
}

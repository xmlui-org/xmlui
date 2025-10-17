import type { StyleErrorCodes } from "./errors";
import type { StyleToken } from "./tokens";
import type {
  BaseNode,
  BorderNode,
  BorderStyleNode,
  ColorNode,
  SizeNode,
  StyleNode,
  ThemeIdDescriptor,
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
        if (!themeId1) {
          themeId1 = this.parseThemeId();
        } else if (!themeId2) {
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
      startToken,
    );
  }

  /**
   * Parses a border style value with its unit
   */
  private parseBorderStyle(): BorderStyleNode | null {
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
      startToken,
    );
  }

  /**
   * Parses a color value
   */
  private parseColor(): ColorNode | null {
    const startToken = this._lexer.peek();
    const themeIdNode = this.tryThemeId<ColorNode>();
    if (themeIdNode) return themeIdNode;

    /**
     * Parses color function parameters
     */
    const parseColorParameters = (pars: string[]): boolean => {
      // --- Skip the color function name token
      this._lexer.get();

      // --- Expect "("
      this.expectToken(StyleTokenType.LParent, "S007");

      // --- Iterate through pars
      for (let i = 0; i < pars.length; i++) {
        // --- Get the parameter value
        const value = this.getNumber();
        if (value === null) return false;

        // --- Get optional parameter unit
        const unit = this._lexer.peek(true);

        // --- Process the value & unit
        switch (pars[i]) {
          // 0-255 or 0%-100%
          case "V%":
            if (unit.type === StyleTokenType.Percentage) {
              if (value < 0 || value > 100) {
                this.reportError("S008");
                return false;
              }
              this._lexer.get();
            } else {
              if (value < 0 || value > 255) {
                this.reportError("S009");
                return false;
              }
            }
            break;
          // 0%-100%
          case "%":
            if (unit.type !== StyleTokenType.Percentage || value < 0 || value > 100) {
              this.reportError("S008");
              return false;
            }
            this._lexer.get();
            break;

          case "angle":
            if (unit.type === StyleTokenType.Angle) {
              this._lexer.get();
            }
            break;

          // alpha with units
          case "alpha":
            if (unit.type === StyleTokenType.Percentage) {
              if (value < 0 || value > 100) {
                this.reportError("S008");
                return false;
              }
              this._lexer.get();
            } else {
              if (value < 0 || value > 1) {
                this.reportError("S011");
                return false;
              }
            }
            break;
        }

        // --- No separator expected after the last parameter
        if (i === pars.length - 1) continue;

        // --- Process the separator
        let sepToken = this._lexer.peek(true);
        if (sepToken.type === StyleTokenType.Ws) {
          this._lexer.get();
          sepToken = this._lexer.peek(true);
          if (sepToken.type === StyleTokenType.Comma) {
            this._lexer.get();
          }
        } else {
          this.expectToken(StyleTokenType.Comma);
        }
        sepToken = this._lexer.peek();
        if (sepToken.type === StyleTokenType.Ws) {
          this._lexer.get();
        }
      }

      // --- Process the optional separator
      let aSepToken = this._lexer.peek();
      if (aSepToken.type === StyleTokenType.Ws) {
        this._lexer.get();
      }

      // --- Expect ")"
      this.expectToken(StyleTokenType.RParent, "S010");
      return true;
    };

    switch (startToken.type) {
      case StyleTokenType.ColorName:
        this._lexer.get();
        return this.createNode<ColorNode>(
          "Color",
          {
            value: startToken.text.toLowerCase(),
          },
          startToken,
        );

      case StyleTokenType.HexaColor:
        this._lexer.get();
        return this.createNode<ColorNode>(
          "Color",
          {
            value: startToken.text,
          },
          startToken,
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
  }

  private getNumber(): number | null {
    const token = this._lexer.get();
    if (token.type === StyleTokenType.Number) {
      return parseFloat(token.text);
    }
    this.reportError("S001", token);
    return null;
  }

  private expectToken(
    type: StyleTokenType,
    errorCode?: StyleErrorCodes,
    allowEof?: boolean,
  ): StyleToken | null {
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
      options.forEach(
        (o, idx) => (errorText = replace(errorText, `{${idx}}`, options[idx].toString())),
      );
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
    source?: string,
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
        token,
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
        startToken,
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
      startToken,
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

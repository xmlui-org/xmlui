import { describe, expect, it } from "vitest";
import { Lexer } from "../../../src/parsers/scripting/Lexer";
import { TokenType } from "../../../src/parsers/scripting/TokenType";
import { InputStream } from "../../../src/parsers/common/InputStream";

describe("Lexer - import keywords", () => {
  describe("import keyword tokenization", () => {
    it("should tokenize 'import' as Import token", () => {
      const lexer = new Lexer(new InputStream("import"));
      const token = lexer.get();
      expect(token.type).toBe(TokenType.Import);
      expect(token.text).toBe("import");
    });

    it("should tokenize 'from' as From token", () => {
      const lexer = new Lexer(new InputStream("from"));
      const token = lexer.get();
      expect(token.type).toBe(TokenType.From);
      expect(token.text).toBe("from");
    });

    it("should distinguish import from identifier when different context", () => {
      // Both should tokenize as keywords in isolation
      const lexer1 = new Lexer(new InputStream("import"));
      expect(lexer1.get().type).toBe(TokenType.Import);

      const lexer2 = new Lexer(new InputStream("from"));
      expect(lexer2.get().type).toBe(TokenType.From);
    });
  });

  describe("import statement tokenization", () => {
    it("should tokenize simple import statement", () => {
      const lexer = new Lexer(new InputStream("import { foo } from './helpers.xs'"));
      
      const tokens: TokenType[] = [];
      while (true) {
        const token = lexer.get();
        tokens.push(token.type);
        if (token.type === TokenType.Eof) break;
      }

      expect(tokens[0]).toBe(TokenType.Import);
      expect(tokens[1]).toBe(TokenType.LBrace);
      expect(tokens[2]).toBe(TokenType.Identifier);
      expect(tokens[3]).toBe(TokenType.RBrace);
      expect(tokens[4]).toBe(TokenType.From);
      expect(tokens[5]).toBe(TokenType.StringLiteral);
      expect(tokens[6]).toBe(TokenType.Eof);
    });

    it("should tokenize import with multiple specifiers", () => {
      const lexer = new Lexer(new InputStream("import { foo, bar, baz } from './module.xs'"));
      
      const tokens: TokenType[] = [];
      while (true) {
        const token = lexer.get();
        tokens.push(token.type);
        if (token.type === TokenType.Eof) break;
      }

      expect(tokens[0]).toBe(TokenType.Import);
      expect(tokens[1]).toBe(TokenType.LBrace);
      expect(tokens[2]).toBe(TokenType.Identifier); // foo
      expect(tokens[3]).toBe(TokenType.Comma);
      expect(tokens[4]).toBe(TokenType.Identifier); // bar
      expect(tokens[5]).toBe(TokenType.Comma);
      expect(tokens[6]).toBe(TokenType.Identifier); // baz
      expect(tokens[7]).toBe(TokenType.RBrace);
      expect(tokens[8]).toBe(TokenType.From);
      expect(tokens[9]).toBe(TokenType.StringLiteral);
    });

    it("should tokenize import with 'as' alias", () => {
      const lexer = new Lexer(new InputStream("import { foo as myFoo } from './helpers.xs'"));
      
      const tokens: TokenType[] = [];
      while (true) {
        const token = lexer.get();
        tokens.push(token.type);
        if (token.type === TokenType.Eof) break;
      }

      expect(tokens[0]).toBe(TokenType.Import);
      expect(tokens[1]).toBe(TokenType.LBrace);
      expect(tokens[2]).toBe(TokenType.Identifier); // foo
      expect(tokens[3]).toBe(TokenType.As);
      expect(tokens[4]).toBe(TokenType.Identifier); // myFoo
      expect(tokens[5]).toBe(TokenType.RBrace);
      expect(tokens[6]).toBe(TokenType.From);
      expect(tokens[7]).toBe(TokenType.StringLiteral);
    });
  });

  describe("whitespace handling", () => {
    it("should handle whitespace before import keyword", () => {
      const lexer = new Lexer(new InputStream("  import"));
      const token = lexer.get();
      expect(token.type).toBe(TokenType.Import);
    });

    it("should handle whitespace after import keyword", () => {
      const lexer = new Lexer(new InputStream("import  {"));
      const token1 = lexer.get();
      const token2 = lexer.get();
      expect(token1.type).toBe(TokenType.Import);
      expect(token2.type).toBe(TokenType.LBrace);
    });

    it("should handle newlines in import statement", () => {
      const lexer = new Lexer(new InputStream(`import { foo }
from './helpers.xs'`));
      
      const tokens: TokenType[] = [];
      while (true) {
        const token = lexer.get();
        tokens.push(token.type);
        if (token.type === TokenType.Eof) break;
      }

      expect(tokens[0]).toBe(TokenType.Import);
      expect(tokens[1]).toBe(TokenType.LBrace);
      expect(tokens[2]).toBe(TokenType.Identifier);
      expect(tokens[3]).toBe(TokenType.RBrace);
      expect(tokens[4]).toBe(TokenType.From);
      expect(tokens[5]).toBe(TokenType.StringLiteral);
    });

    it("should handle mixed whitespace in import list", () => {
      const lexer = new Lexer(new InputStream(`import {
  foo,
  bar,
  baz
} from './module.xs'`));
      
      const tokens: TokenType[] = [];
      while (true) {
        const token = lexer.get();
        tokens.push(token.type);
        if (token.type === TokenType.Eof) break;
      }

      expect(tokens[0]).toBe(TokenType.Import);
      expect(tokens[1]).toBe(TokenType.LBrace);
      expect(tokens[2]).toBe(TokenType.Identifier); // foo
      expect(tokens[3]).toBe(TokenType.Comma);
      expect(tokens[4]).toBe(TokenType.Identifier); // bar
      expect(tokens[5]).toBe(TokenType.Comma);
      expect(tokens[6]).toBe(TokenType.Identifier); // baz
      expect(tokens[7]).toBe(TokenType.RBrace);
      expect(tokens[8]).toBe(TokenType.From);
      expect(tokens[9]).toBe(TokenType.StringLiteral);
    });
  });

  describe("token position tracking", () => {
    it("should track correct line and column for import keyword", () => {
      const lexer = new Lexer(new InputStream("import"));
      const token = lexer.get();
      expect(token.startLine).toBe(1);
      expect(token.startColumn).toBe(0);
      expect(token.text).toBe("import");
    });

    it("should track correct line and column for from keyword", () => {
      const lexer = new Lexer(new InputStream("from"));
      const token = lexer.get();
      expect(token.startLine).toBe(1);
      expect(token.startColumn).toBe(0);
      expect(token.text).toBe("from");
    });

    it("should track positions in multi-line import", () => {
      const source = `import {
  foo
} from './helpers.xs'`;
      const lexer = new Lexer(new InputStream(source));
      
      const token1 = lexer.get(); // import
      expect(token1.startLine).toBe(1);
      expect(token1.startColumn).toBe(0);
      
      const token2 = lexer.get(); // {
      expect(token2.startLine).toBe(1);
      
      const token3 = lexer.get(); // foo
      expect(token3.startLine).toBe(2);
      
      const token4 = lexer.get(); // }
      expect(token4.startLine).toBe(3);
      
      const token5 = lexer.get(); // from
      expect(token5.startLine).toBe(3);
      expect(token5.type).toBe(TokenType.From);
    });
  });

  describe("import vs non-import contexts", () => {
    it("should tokenize 'import' as keyword in statement context", () => {
      const lexer = new Lexer(new InputStream("import"));
      const token = lexer.get();
      expect(token.type).toBe(TokenType.Import);
    });

    it("should tokenize 'from' as keyword when used with import", () => {
      const lexer = new Lexer(new InputStream("from"));
      const token = lexer.get();
      expect(token.type).toBe(TokenType.From);
    });

    it("should handle multiple tokens in sequence correctly", () => {
      const lexer = new Lexer(
        new InputStream("import { calculateTotal, formatCurrency } from './helpers.xs';")
      );
      
      const tokens: { type: TokenType; text: string }[] = [];
      while (true) {
        const token = lexer.get();
        tokens.push({ type: token.type, text: token.text });
        if (token.type === TokenType.Eof) break;
      }

      expect(tokens[0].type).toBe(TokenType.Import);
      expect(tokens[0].text).toBe("import");
      
      expect(tokens[1].type).toBe(TokenType.LBrace);
      
      expect(tokens[2].type).toBe(TokenType.Identifier);
      expect(tokens[2].text).toBe("calculateTotal");
      
      expect(tokens[3].type).toBe(TokenType.Comma);
      
      expect(tokens[4].type).toBe(TokenType.Identifier);
      expect(tokens[4].text).toBe("formatCurrency");
      
      expect(tokens[5].type).toBe(TokenType.RBrace);
      expect(tokens[6].type).toBe(TokenType.From);
      expect(tokens[6].text).toBe("from");
      
      expect(tokens[7].type).toBe(TokenType.StringLiteral);
      
      expect(tokens[8].type).toBe(TokenType.Semicolon);
      expect(tokens[9].type).toBe(TokenType.Eof);
    });
  });

  describe("relative path handling", () => {
    it("should handle relative paths starting with ./", () => {
      const lexer = new Lexer(new InputStream("from './helpers.xs'"));
      
      lexer.get(); // from
      const stringToken = lexer.get();
      
      expect(stringToken.type).toBe(TokenType.StringLiteral);
      expect(stringToken.text).toBe("'./helpers.xs'");
    });

    it("should handle relative paths starting with ../", () => {
      const lexer = new Lexer(new InputStream("from '../utils.xs'"));
      
      lexer.get(); // from
      const stringToken = lexer.get();
      
      expect(stringToken.type).toBe(TokenType.StringLiteral);
      expect(stringToken.text).toBe("'../utils.xs'");
    });

    it("should handle nested relative paths", () => {
      const lexer = new Lexer(new InputStream("from '../../lib/helpers.xs'"));
      
      lexer.get(); // from
      const stringToken = lexer.get();
      
      expect(stringToken.type).toBe(TokenType.StringLiteral);
      expect(stringToken.text).toBe("'../../lib/helpers.xs'");
    });
  });

  describe("edge cases", () => {
    it("should handle import followed by semicolon immediately", () => {
      const lexer = new Lexer(new InputStream("import;"));
      
      const token1 = lexer.get();
      const token2 = lexer.get();
      
      expect(token1.type).toBe(TokenType.Import);
      expect(token2.type).toBe(TokenType.Semicolon);
    });

    it("should handle from keyword in different contexts", () => {
      // 'from' is only a keyword in import context, but lexer treats it as keyword
      const lexer = new Lexer(new InputStream("from"));
      const token = lexer.get();
      expect(token.type).toBe(TokenType.From);
    });

    it("should tokenize consecutive import statements", () => {
      const lexer = new Lexer(
        new InputStream(`import { foo } from './a.xs';
import { bar } from './b.xs';`)
      );
      
      const tokens: TokenType[] = [];
      while (true) {
        const token = lexer.get();
        tokens.push(token.type);
        if (token.type === TokenType.Eof) break;
      }

      // First import statement
      expect(tokens[0]).toBe(TokenType.Import);
      expect(tokens[1]).toBe(TokenType.LBrace);
      expect(tokens[2]).toBe(TokenType.Identifier);
      expect(tokens[3]).toBe(TokenType.RBrace);
      expect(tokens[4]).toBe(TokenType.From);
      expect(tokens[5]).toBe(TokenType.StringLiteral);
      expect(tokens[6]).toBe(TokenType.Semicolon);

      // Second import statement
      expect(tokens[7]).toBe(TokenType.Import);
      expect(tokens[8]).toBe(TokenType.LBrace);
      expect(tokens[9]).toBe(TokenType.Identifier);
      expect(tokens[10]).toBe(TokenType.RBrace);
      expect(tokens[11]).toBe(TokenType.From);
      expect(tokens[12]).toBe(TokenType.StringLiteral);
      expect(tokens[13]).toBe(TokenType.Semicolon);
    });
  });
});

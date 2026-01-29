import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { parseKeyBinding, matchesKeyEvent, matchesKeyString } from "../src/parsers/keybinding-parser/keybinding-parser";
import type { ParsedKeyBinding } from "../src/parsers/keybinding-parser/keybinding-parser";

describe("KeyBinding Parser", () => {
  // Store original navigator.platform to restore after tests
  let originalPlatform: string;
  let originalUserAgent: string;

  beforeEach(() => {
    if (typeof navigator !== "undefined") {
      originalPlatform = navigator.platform;
      originalUserAgent = navigator.userAgent;
    }
  });

  afterEach(() => {
    // Note: In real browser environment, we can't actually change navigator properties
    // These tests assume we're in a test environment where we can mock
  });

  describe("parseKeyBinding", () => {
    describe("basic key parsing", () => {
      it("parses single key without modifiers", () => {
        const result = parseKeyBinding("a");
        expect(result.key).toBe("a");
        expect(result.ctrl).toBe(false);
        expect(result.alt).toBe(false);
        expect(result.shift).toBe(false);
        expect(result.meta).toBe(false);
      });

      it("parses uppercase keys as lowercase", () => {
        const result = parseKeyBinding("A");
        expect(result.key).toBe("a");
      });

      it("parses special keys", () => {
        expect(parseKeyBinding("Delete").key).toBe("Delete");
        expect(parseKeyBinding("Backspace").key).toBe("Backspace");
        expect(parseKeyBinding("Enter").key).toBe("Enter");
        expect(parseKeyBinding("Escape").key).toBe("Escape");
        expect(parseKeyBinding("Tab").key).toBe("Tab");
      });

      it("parses special keys case-insensitively", () => {
        expect(parseKeyBinding("delete").key).toBe("Delete");
        expect(parseKeyBinding("DELETE").key).toBe("Delete");
        expect(parseKeyBinding("backspace").key).toBe("Backspace");
        expect(parseKeyBinding("BACKSPACE").key).toBe("Backspace");
      });

      it("parses arrow keys", () => {
        expect(parseKeyBinding("ArrowUp").key).toBe("ArrowUp");
        expect(parseKeyBinding("ArrowDown").key).toBe("ArrowDown");
        expect(parseKeyBinding("ArrowLeft").key).toBe("ArrowLeft");
        expect(parseKeyBinding("ArrowRight").key).toBe("ArrowRight");
      });

      it("parses arrow keys with short names", () => {
        expect(parseKeyBinding("Up").key).toBe("ArrowUp");
        expect(parseKeyBinding("Down").key).toBe("ArrowDown");
        expect(parseKeyBinding("Left").key).toBe("ArrowLeft");
        expect(parseKeyBinding("Right").key).toBe("ArrowRight");
      });

      it("parses function keys", () => {
        expect(parseKeyBinding("F1").key).toBe("F1");
        expect(parseKeyBinding("F12").key).toBe("F12");
      });

      it("preserves original key string", () => {
        const result = parseKeyBinding("Ctrl+A");
        expect(result.original).toBe("Ctrl+A");
      });
    });

    describe("modifier parsing", () => {
      it("parses Ctrl modifier", () => {
        const result = parseKeyBinding("Ctrl+A");
        expect(result.ctrl).toBe(true);
        expect(result.key).toBe("a");
      });

      it("parses Control modifier (alias)", () => {
        const result = parseKeyBinding("Control+A");
        expect(result.ctrl).toBe(true);
      });

      it("parses Alt modifier", () => {
        const result = parseKeyBinding("Alt+A");
        expect(result.alt).toBe(true);
        expect(result.key).toBe("a");
      });

      it("parses Option modifier (alias)", () => {
        const result = parseKeyBinding("Option+A");
        expect(result.alt).toBe(true);
      });

      it("parses Shift modifier", () => {
        const result = parseKeyBinding("Shift+A");
        expect(result.shift).toBe(true);
        expect(result.key).toBe("a");
      });

      it("parses Cmd modifier", () => {
        const result = parseKeyBinding("Cmd+A");
        expect(result.meta).toBe(true);
        expect(result.key).toBe("a");
      });

      it("parses Command modifier (alias)", () => {
        const result = parseKeyBinding("Command+A");
        expect(result.meta).toBe(true);
      });

      it("parses Super modifier", () => {
        const result = parseKeyBinding("Super+A");
        expect(result.meta).toBe(true);
      });

      it("parses multiple modifiers", () => {
        const result = parseKeyBinding("Ctrl+Shift+A");
        expect(result.ctrl).toBe(true);
        expect(result.shift).toBe(true);
        expect(result.key).toBe("a");
      });

      it("parses all modifiers together", () => {
        const result = parseKeyBinding("Ctrl+Alt+Shift+A");
        expect(result.ctrl).toBe(true);
        expect(result.alt).toBe(true);
        expect(result.shift).toBe(true);
        expect(result.key).toBe("a");
      });

      it("handles modifiers case-insensitively", () => {
        const result = parseKeyBinding("ctrl+alt+shift+a");
        expect(result.ctrl).toBe(true);
        expect(result.alt).toBe(true);
        expect(result.shift).toBe(true);
      });
    });

    describe("CmdOrCtrl platform-specific parsing", () => {
      it("parses CmdOrCtrl", () => {
        // In test environment, we can't reliably test platform detection
        // but we can verify it parses without error and sets a modifier
        const result = parseKeyBinding("CmdOrCtrl+A");
        expect(result.key).toBe("a");
        // Should set either ctrl or meta depending on platform
        expect(result.ctrl || result.meta).toBe(true);
      });

      it("parses CommandOrControl (alias)", () => {
        const result = parseKeyBinding("CommandOrControl+A");
        expect(result.key).toBe("a");
        expect(result.ctrl || result.meta).toBe(true);
      });

      it("combines CmdOrCtrl with other modifiers", () => {
        const result = parseKeyBinding("CmdOrCtrl+Shift+Delete");
        expect(result.shift).toBe(true);
        expect(result.key).toBe("Delete");
      });
    });

    describe("special key combinations", () => {
      it("parses Ctrl+Delete", () => {
        const result = parseKeyBinding("Ctrl+Delete");
        expect(result.ctrl).toBe(true);
        expect(result.key).toBe("Delete");
      });

      it("parses Shift+Enter", () => {
        const result = parseKeyBinding("Shift+Enter");
        expect(result.shift).toBe(true);
        expect(result.key).toBe("Enter");
      });

      it("parses Alt+ArrowDown", () => {
        const result = parseKeyBinding("Alt+ArrowDown");
        expect(result.alt).toBe(true);
        expect(result.key).toBe("ArrowDown");
      });

      it("parses Ctrl+Shift+F12", () => {
        const result = parseKeyBinding("Ctrl+Shift+F12");
        expect(result.ctrl).toBe(true);
        expect(result.shift).toBe(true);
        expect(result.key).toBe("F12");
      });
    });

    describe("whitespace handling", () => {
      it("handles spaces around plus signs", () => {
        const result = parseKeyBinding("Ctrl + A");
        expect(result.ctrl).toBe(true);
        expect(result.key).toBe("a");
      });

      it("handles extra spaces", () => {
        const result = parseKeyBinding("  Ctrl  +  Shift  +  A  ");
        expect(result.ctrl).toBe(true);
        expect(result.shift).toBe(true);
        expect(result.key).toBe("a");
      });
    });

    describe("error handling", () => {
      it("throws on empty string", () => {
        expect(() => parseKeyBinding("")).toThrow("non-empty string");
      });

      it("throws on null", () => {
        expect(() => parseKeyBinding(null as any)).toThrow("non-empty string");
      });

      it("throws on undefined", () => {
        expect(() => parseKeyBinding(undefined as any)).toThrow("non-empty string");
      });

      it("throws on unknown modifier", () => {
        expect(() => parseKeyBinding("Unknown+A")).toThrow("Unknown modifier");
      });

      it("throws on invalid format", () => {
        expect(() => parseKeyBinding("+")).toThrow();
      });
    });
  });

  describe("matchesKeyEvent", () => {
    function createKeyEvent(options: {
      key: string;
      ctrl?: boolean;
      alt?: boolean;
      shift?: boolean;
      meta?: boolean;
    }): KeyboardEvent {
      return {
        key: options.key,
        ctrlKey: options.ctrl ?? false,
        altKey: options.alt ?? false,
        shiftKey: options.shift ?? false,
        metaKey: options.meta ?? false,
      } as KeyboardEvent;
    }

    it("matches simple key press", () => {
      const binding = parseKeyBinding("a");
      const event = createKeyEvent({ key: "a" });
      expect(matchesKeyEvent(event, binding)).toBe(true);
    });

    it("matches key with Ctrl modifier", () => {
      const binding = parseKeyBinding("Ctrl+A");
      const event = createKeyEvent({ key: "a", ctrl: true });
      expect(matchesKeyEvent(event, binding)).toBe(true);
    });

    it("does not match when Ctrl is missing", () => {
      const binding = parseKeyBinding("Ctrl+A");
      const event = createKeyEvent({ key: "a" });
      expect(matchesKeyEvent(event, binding)).toBe(false);
    });

    it("matches key with multiple modifiers", () => {
      const binding = parseKeyBinding("Ctrl+Shift+A");
      const event = createKeyEvent({ key: "a", ctrl: true, shift: true });
      expect(matchesKeyEvent(event, binding)).toBe(true);
    });

    it("does not match when modifier is extra", () => {
      const binding = parseKeyBinding("Ctrl+A");
      const event = createKeyEvent({ key: "a", ctrl: true, shift: true });
      expect(matchesKeyEvent(event, binding)).toBe(false);
    });

    it("matches Delete key", () => {
      const binding = parseKeyBinding("Delete");
      const event = createKeyEvent({ key: "Delete" });
      expect(matchesKeyEvent(event, binding)).toBe(true);
    });

    it("matches Shift+Delete", () => {
      const binding = parseKeyBinding("Shift+Delete");
      const event = createKeyEvent({ key: "Delete", shift: true });
      expect(matchesKeyEvent(event, binding)).toBe(true);
    });

    it("matches arrow keys", () => {
      const binding = parseKeyBinding("ArrowDown");
      const event = createKeyEvent({ key: "ArrowDown" });
      expect(matchesKeyEvent(event, binding)).toBe(true);
    });

    it("matches Alt+ArrowDown", () => {
      const binding = parseKeyBinding("Alt+ArrowDown");
      const event = createKeyEvent({ key: "ArrowDown", alt: true });
      expect(matchesKeyEvent(event, binding)).toBe(true);
    });

    it("matches Enter key", () => {
      const binding = parseKeyBinding("Enter");
      const event = createKeyEvent({ key: "Enter" });
      expect(matchesKeyEvent(event, binding)).toBe(true);
    });

    it("is case-insensitive for keys", () => {
      const binding = parseKeyBinding("A");
      const event = createKeyEvent({ key: "a" });
      expect(matchesKeyEvent(event, binding)).toBe(true);
    });

    it("matches all modifiers", () => {
      const binding = parseKeyBinding("Ctrl+Alt+Shift+A");
      const event = createKeyEvent({ key: "a", ctrl: true, alt: true, shift: true });
      expect(matchesKeyEvent(event, binding)).toBe(true);
    });

    it("does not match wrong key", () => {
      const binding = parseKeyBinding("Ctrl+A");
      const event = createKeyEvent({ key: "b", ctrl: true });
      expect(matchesKeyEvent(event, binding)).toBe(false);
    });
  });

  describe("matchesKeyString", () => {
    function createKeyEvent(options: {
      key: string;
      ctrl?: boolean;
      alt?: boolean;
      shift?: boolean;
      meta?: boolean;
    }): KeyboardEvent {
      return {
        key: options.key,
        ctrlKey: options.ctrl ?? false,
        altKey: options.alt ?? false,
        shiftKey: options.shift ?? false,
        metaKey: options.meta ?? false,
      } as KeyboardEvent;
    }

    it("parses and matches in one call", () => {
      const event = createKeyEvent({ key: "a", ctrl: true });
      expect(matchesKeyString(event, "Ctrl+A")).toBe(true);
    });

    it("returns false for invalid key string", () => {
      const event = createKeyEvent({ key: "a" });
      expect(matchesKeyString(event, "InvalidModifier+A")).toBe(false);
    });

    it("returns false for non-matching event", () => {
      const event = createKeyEvent({ key: "a" });
      expect(matchesKeyString(event, "Ctrl+A")).toBe(false);
    });

    it("handles complex shortcuts", () => {
      const event = createKeyEvent({ key: "Delete", shift: true, ctrl: true });
      expect(matchesKeyString(event, "Ctrl+Shift+Delete")).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles plus key itself", () => {
      const result = parseKeyBinding("Plus");
      expect(result.key).toBe("+");
    });

    it("handles minus key itself", () => {
      const result = parseKeyBinding("Minus");
      expect(result.key).toBe("-");
    });

    it("handles space key", () => {
      const result = parseKeyBinding("Space");
      expect(result.key).toBe(" ");
    });

    it("handles Escape alias", () => {
      const result = parseKeyBinding("Esc");
      expect(result.key).toBe("Escape");
    });

    it("handles Return alias for Enter", () => {
      const result = parseKeyBinding("Return");
      expect(result.key).toBe("Enter");
    });

    it("handles Del alias for Delete", () => {
      const result = parseKeyBinding("Del");
      expect(result.key).toBe("Delete");
    });
  });
});

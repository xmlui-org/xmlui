/**
 * KeyBinding Parser - Electron-style keyboard shortcut parser
 * 
 * Parses keyboard shortcut strings using Electron accelerator syntax
 * and matches them against browser KeyboardEvent objects.
 * 
 * Supported accelerators:
 * - CmdOrCtrl: Command on macOS, Ctrl on Windows/Linux
 * - Alt: Alt/Options key
 * - Shift: Shift key
 * - Super: Command on macOS, Windows key on Windows/Linux
 * - Ctrl: Control key
 * - Cmd: Command key (macOS only)
 * 
 * Special keys: Delete, Backspace, Enter, Escape, Tab, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, etc.
 * 
 * Examples:
 * - "CmdOrCtrl+A" → Ctrl+A on Windows, Cmd+A on macOS
 * - "Shift+Delete" → Shift+Delete on all platforms
 * - "Alt+ArrowDown" → Alt+Down Arrow on all platforms
 */

/**
 * Parsed key binding object
 */
export interface ParsedKeyBinding {
  /** The main key (e.g., "a", "Delete", "ArrowUp") */
  key: string;
  /** Whether Ctrl modifier is required */
  ctrl: boolean;
  /** Whether Alt modifier is required */
  alt: boolean;
  /** Whether Shift modifier is required */
  shift: boolean;
  /** Whether Meta/Command modifier is required */
  meta: boolean;
  /** Original key string for debugging */
  original: string;
}

/**
 * Detects if the current platform is macOS
 */
function isMacOS(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

/**
 * Special key mappings from common names to KeyboardEvent.key values
 */
const SPECIAL_KEYS: Record<string, string> = {
  // Navigation
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  arrowleft: "ArrowLeft",
  arrowright: "ArrowRight",
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  
  // Editing
  backspace: "Backspace",
  delete: "Delete",
  del: "Delete",
  enter: "Enter",
  return: "Enter",
  escape: "Escape",
  esc: "Escape",
  tab: "Tab",
  space: " ",
  
  // Function keys
  f1: "F1",
  f2: "F2",
  f3: "F3",
  f4: "F4",
  f5: "F5",
  f6: "F6",
  f7: "F7",
  f8: "F8",
  f9: "F9",
  f10: "F10",
  f11: "F11",
  f12: "F12",
  
  // Other
  home: "Home",
  end: "End",
  pageup: "PageUp",
  pagedown: "PageDown",
  insert: "Insert",
  
  // Plus and minus (special handling for numpad)
  plus: "+",
  minus: "-",
};

/**
 * Normalizes a key string to its KeyboardEvent.key equivalent
 */
function normalizeKey(key: string): string {
  const lowerKey = key.toLowerCase();
  
  // Check special keys mapping
  if (SPECIAL_KEYS[lowerKey]) {
    return SPECIAL_KEYS[lowerKey];
  }
  
  // Single character keys should be lowercase
  if (key.length === 1) {
    return key.toLowerCase();
  }
  
  // Return as-is for other keys (like F1, etc. if not in mapping)
  return key;
}

/**
 * Parses an Electron accelerator string into a ParsedKeyBinding object
 * 
 * @param keyString - The accelerator string (e.g., "CmdOrCtrl+A", "Shift+Delete")
 * @returns Parsed key binding object
 * @throws Error if the key string is invalid
 */
export function parseKeyBinding(keyString: string): ParsedKeyBinding {
  if (!keyString || typeof keyString !== "string") {
    throw new Error("Key binding string must be a non-empty string");
  }

  const original = keyString;
  const parts = keyString.split("+").map((part) => part.trim());

  if (parts.length === 0) {
    throw new Error(`Invalid key binding: "${keyString}"`);
  }

  const binding: ParsedKeyBinding = {
    key: "",
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
    original,
  };

  // The last part is always the key, modifiers come before
  const keyPart = parts[parts.length - 1];
  const modifierParts = parts.slice(0, -1);

  // Normalize the key
  binding.key = normalizeKey(keyPart);

  if (!binding.key) {
    throw new Error(`Invalid key in binding: "${keyString}"`);
  }

  // Process modifiers
  const isMac = isMacOS();
  
  for (const modifier of modifierParts) {
    const lowerModifier = modifier.toLowerCase();

    switch (lowerModifier) {
      case "cmdorctrl":
      case "commandorcontrol":
        // CmdOrCtrl maps to Meta on macOS, Ctrl on others
        if (isMac) {
          binding.meta = true;
        } else {
          binding.ctrl = true;
        }
        break;

      case "ctrl":
      case "control":
        binding.ctrl = true;
        break;

      case "cmd":
      case "command":
        // Cmd only makes sense on macOS
        binding.meta = true;
        break;

      case "alt":
      case "option":
        binding.alt = true;
        break;

      case "shift":
        binding.shift = true;
        break;

      case "super":
        // Super maps to Meta on macOS (Command), Windows key on Windows
        binding.meta = true;
        break;

      default:
        throw new Error(`Unknown modifier in key binding: "${modifier}"`);
    }
  }

  return binding;
}

/**
 * Checks if a KeyboardEvent matches a ParsedKeyBinding
 * 
 * @param event - The keyboard event to check
 * @param binding - The parsed key binding to match against
 * @returns True if the event matches the binding
 */
export function matchesKeyEvent(event: KeyboardEvent, binding: ParsedKeyBinding): boolean {
  // Check modifiers
  if (event.ctrlKey !== binding.ctrl) {
    return false;
  }
  if (event.altKey !== binding.alt) {
    return false;
  }
  if (event.shiftKey !== binding.shift) {
    return false;
  }
  if (event.metaKey !== binding.meta) {
    return false;
  }

  // Check the key itself
  // Normalize both keys for comparison
  const eventKey = event.key.toLowerCase();
  const bindingKey = binding.key.toLowerCase();

  return eventKey === bindingKey;
}

/**
 * Convenience function to parse and match in one call
 * 
 * @param event - The keyboard event to check
 * @param keyString - The accelerator string to parse and match
 * @returns True if the event matches the key string
 */
export function matchesKeyString(event: KeyboardEvent, keyString: string): boolean {
  try {
    const binding = parseKeyBinding(keyString);
    return matchesKeyEvent(event, binding);
  } catch {
    return false;
  }
}

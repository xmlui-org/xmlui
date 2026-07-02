type FocusScopeEntry = {
  id: number;
  element: HTMLElement;
  restoreTo?: Element | null;
};

let nextId = 1;
const stack: FocusScopeEntry[] = [];

export function pushFocusScope(element: HTMLElement, restoreTo?: Element | null): number {
  const id = nextId++;
  stack.push({ id, element, restoreTo });
  return id;
}

export function popFocusScope(id: number): FocusScopeEntry | undefined {
  const idx = stack.findIndex((entry) => entry.id === id);
  if (idx < 0) {
    return undefined;
  }
  const [entry] = stack.splice(idx, 1);
  return entry;
}

export function topFocusScope(): FocusScopeEntry | undefined {
  return stack[stack.length - 1];
}

export function topFocusScopeForElement(element: Element | null): FocusScopeEntry | undefined {
  if (!element) {
    return undefined;
  }
  for (let i = stack.length - 1; i >= 0; i--) {
    const entry = stack[i];
    if (entry.element.contains(element)) {
      return entry;
    }
  }
  return undefined;
}

export function clearFocusScopesForTests(): void {
  stack.length = 0;
  nextId = 1;
}

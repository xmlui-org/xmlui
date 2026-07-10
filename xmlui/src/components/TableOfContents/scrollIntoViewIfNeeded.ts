type ScrollOptions = {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
  boundary?: Element;
};

export default function scrollIntoViewIfNeeded(
  element: Element,
  options: ScrollOptions = {},
): void {
  if (element instanceof HTMLElement) {
    element.scrollIntoView(options);
  }
}

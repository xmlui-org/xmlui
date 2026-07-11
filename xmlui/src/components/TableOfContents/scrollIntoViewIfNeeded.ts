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
  if (!(element instanceof HTMLElement)) {
    return;
  }

  if (options.boundary instanceof HTMLElement) {
    const boundary = options.boundary;
    const elementRect = element.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();

    if (elementRect.top < boundaryRect.top) {
      boundary.scrollTop += elementRect.top - boundaryRect.top;
    } else if (elementRect.bottom > boundaryRect.bottom) {
      boundary.scrollTop += elementRect.bottom - boundaryRect.bottom;
    }
    boundary.scrollLeft = 0;
    return;
  }

  element.scrollIntoView(options);
}

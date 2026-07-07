export function hasRenderableChildren(children: any[]): boolean {
  return !!children?.some((child) => child?.type !== "Slot");  
}

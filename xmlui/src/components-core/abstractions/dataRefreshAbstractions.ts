export type CollectionDataRefreshMode = "reset" | "preserve-state";

export type CollectionDataRefreshOperation = "insert" | "delete" | "update";

export type CollectionDataRefreshScrollTarget = string | number | "first-inserted" | "preserve";

export interface CollectionDataRefreshOptions {
  operation?: CollectionDataRefreshOperation;
  scrollTarget?: CollectionDataRefreshScrollTarget;
}

export interface CollectionScrollMetrics {
  scrollPosition: number;
  scrollSize: number;
  viewportSize: number;
}

export function getSourceIdSet(items: any[], idKey: string): Set<string> {
  const ids = new Set<string>();
  items.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      ids.add(String(index));
      return;
    }
    const rawId = item[idKey];
    ids.add(rawId === undefined || rawId === null || rawId === "" ? String(index) : String(rawId));
  });
  return ids;
}

export function diffInsertedIds(previousIds: Set<string>, currentIds: Set<string>): Set<string> {
  const insertedIds = new Set<string>();
  currentIds.forEach((id) => {
    if (!previousIds.has(id)) {
      insertedIds.add(id);
    }
  });
  return insertedIds;
}

export function shouldInferFirstInserted(options?: CollectionDataRefreshOptions): boolean {
  return options?.operation === "insert" || options?.scrollTarget === "first-inserted";
}

export function isPreserveScrollTarget(
  target: CollectionDataRefreshScrollTarget | undefined,
): boolean {
  return target === undefined || target === "preserve";
}

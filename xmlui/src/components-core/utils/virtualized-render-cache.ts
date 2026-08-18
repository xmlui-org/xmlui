import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const DEFAULT_VIRTUALIZED_RENDER_CACHE_SIZE = 80;

export type VirtualizedRenderCacheId = string | number;

export type VirtualizedVisibleRange = {
  startIndex: number;
  endIndex: number;
};

type UseVirtualizedRenderCacheOptions = {
  enabled?: boolean;
  maxSize?: number;
  rowCount: number;
  getRowId: (index: number) => VirtualizedRenderCacheId | undefined;
};

function areNumberArraysEqual(left: readonly number[], right: readonly number[]) {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) return false;
  }
  return true;
}

export function normalizeVirtualizedRenderCacheSize(
  value: unknown,
  fallback = DEFAULT_VIRTUALIZED_RENDER_CACHE_SIZE,
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.floor(value));
}

export function getIndexesForRetainedRowIds({
  retainedIds,
  rowCount,
  getRowId,
  maxSize,
}: {
  retainedIds: readonly VirtualizedRenderCacheId[];
  rowCount: number;
  getRowId: (index: number) => VirtualizedRenderCacheId | undefined;
  maxSize: number;
}) {
  if (maxSize <= 0 || rowCount <= 0 || retainedIds.length === 0) {
    return [];
  }

  const idToIndex = new Map<VirtualizedRenderCacheId, number>();
  for (let index = 0; index < rowCount; index++) {
    const id = getRowId(index);
    if (id !== undefined && !idToIndex.has(id)) {
      idToIndex.set(id, index);
    }
  }

  const indexes: number[] = [];
  const seenIndexes = new Set<number>();
  for (const id of retainedIds) {
    const index = idToIndex.get(id);
    if (index === undefined || seenIndexes.has(index)) {
      continue;
    }
    indexes.push(index);
    seenIndexes.add(index);
    if (indexes.length >= maxSize) {
      break;
    }
  }
  return indexes.sort((a, b) => a - b);
}

export function useVirtualizedRenderCache({
  enabled = true,
  maxSize = DEFAULT_VIRTUALIZED_RENDER_CACHE_SIZE,
  rowCount,
  getRowId,
}: UseVirtualizedRenderCacheOptions) {
  const normalizedMaxSize = normalizeVirtualizedRenderCacheSize(maxSize);
  const effectiveEnabled = enabled && normalizedMaxSize > 0 && rowCount > 0;
  const retainedIdsRef = useRef<VirtualizedRenderCacheId[]>([]);
  const [keepMountedIndexes, setKeepMountedIndexes] = useState<readonly number[]>([]);

  const publishKeepMountedIndexes = useCallback(() => {
    const next = effectiveEnabled
      ? getIndexesForRetainedRowIds({
          retainedIds: retainedIdsRef.current,
          rowCount,
          getRowId,
          maxSize: normalizedMaxSize,
        })
      : [];

    setKeepMountedIndexes((prev) => (areNumberArraysEqual(prev, next) ? prev : next));
  }, [effectiveEnabled, getRowId, normalizedMaxSize, rowCount]);

  const clear = useCallback(() => {
    retainedIdsRef.current = [];
    setKeepMountedIndexes((prev) => (prev.length === 0 ? prev : []));
  }, []);

  const noteVisibleRange = useCallback(
    ({ startIndex, endIndex }: VirtualizedVisibleRange) => {
      if (!effectiveEnabled) {
        clear();
        return;
      }
      const start = Math.max(0, Math.min(startIndex, rowCount - 1));
      const end = Math.max(start, Math.min(endIndex, rowCount - 1));
      const visibleIds: VirtualizedRenderCacheId[] = [];
      const visibleIdSet = new Set<VirtualizedRenderCacheId>();

      for (let index = start; index <= end; index++) {
        const id = getRowId(index);
        if (id === undefined || visibleIdSet.has(id)) {
          continue;
        }
        visibleIds.push(id);
        visibleIdSet.add(id);
      }

      retainedIdsRef.current = [
        ...visibleIds,
        ...retainedIdsRef.current.filter((id) => !visibleIdSet.has(id)),
      ].slice(0, normalizedMaxSize);
      publishKeepMountedIndexes();
    },
    [clear, effectiveEnabled, getRowId, normalizedMaxSize, publishKeepMountedIndexes, rowCount],
  );

  useEffect(() => {
    if (!effectiveEnabled) {
      clear();
      return;
    }
    publishKeepMountedIndexes();
  }, [clear, effectiveEnabled, publishKeepMountedIndexes]);

  const safeKeepMountedIndexes = useMemo(
    () => keepMountedIndexes.filter((index) => index >= 0 && index < rowCount),
    [keepMountedIndexes, rowCount],
  );

  return {
    keepMountedIndexes: safeKeepMountedIndexes,
    noteVisibleRange,
    clear,
  };
}

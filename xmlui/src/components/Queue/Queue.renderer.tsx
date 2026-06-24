import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";

import { createRuntimeScope } from "../../runtime/state";
import { runEvent } from "../../runtime/rendering/bindings";
import { useBooleanProp, useStringProp } from "../../runtime/rendering/props";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";

type QueueStatus = "pending" | "started" | "completed" | "error";
type QueueItem = {
  actionItemId: string;
  status: QueueStatus;
  item: unknown;
  result?: unknown;
  error?: unknown;
};

let queueItemSerial = 0;

export const queueRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
  const id = useStringProp(node, scope, "id", "");
  const clearAfterFinish = useBooleanProp(node, scope, "clearAfterFinish", true);
  const [, setRevision] = useState(0);
  const queueItemsRef = useRef<QueueItem[]>([]);
  const processingRef = useRef(false);

  const commitQueue = useMemo(() => (updater: (current: QueueItem[]) => QueueItem[]) => {
    queueItemsRef.current = updater(queueItemsRef.current);
    setRevision((current) => current + 1);
    scope.store.invalidateReference(id);
  }, [id, scope.store]);

  const requestProcessing = useMemo(() => () => {
    if (processingRef.current) {
      return;
    }
    const next = queueItemsRef.current.find((entry) => entry.status === "pending");
    if (!next) {
      return;
    }
    processingRef.current = true;
    void processOne({
      item: next,
      node,
      scope,
      queueItemsRef,
      commitQueue,
      clearAfterFinish,
    }).finally(() => {
      processingRef.current = false;
      requestAnimationFrame(requestProcessing);
    });
  }, [clearAfterFinish, commitQueue, node, scope]);

  const api = useMemo(() => ({
    enqueueItem: (item: unknown) => {
      const actionItemId = `queue-item-${++queueItemSerial}`;
      commitQueue((current) => [...current, { actionItemId, status: "pending", item }]);
      requestAnimationFrame(requestProcessing);
      return actionItemId;
    },
    enqueueItems: (items: unknown[]) => {
      if (!Array.isArray(items) || items.length === 0) {
        return [];
      }
      const ids = items.map(() => `queue-item-${++queueItemSerial}`);
      commitQueue((current) => [
        ...current,
        ...items.map((item, index) => ({
          actionItemId: ids[index],
          status: "pending" as QueueStatus,
          item,
        })),
      ]);
      requestAnimationFrame(requestProcessing);
      return ids;
    },
    getQueuedItems: () => queueItemsRef.current,
    getQueueLength: () => queueItemsRef.current.filter((entry) => entry.status === "pending" || entry.status === "started").length,
    remove: (actionItemId: string) => {
      commitQueue((current) => current.filter((entry) => entry.actionItemId !== actionItemId));
    },
    clearCompleted: () => {
      commitQueue((current) => current.filter((entry) => entry.status !== "completed" && entry.status !== "error"));
    },
  }), [commitQueue, requestProcessing]);

  useEffect(() => {
    if (!id) {
      return;
    }
    scope.references[id] = api;
    scope.store.invalidateReference(id);
    return () => {
      if (scope.references[id] === api) {
        delete scope.references[id];
        scope.store.invalidateReference(id);
      }
    };
  }, [api, id, scope]);

  return null;
};

async function processOne({
  item,
  node,
  scope,
  queueItemsRef,
  commitQueue,
  clearAfterFinish,
}: {
  item: QueueItem;
  node: Parameters<XmluiBuiltInRenderer>[0]["node"];
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"];
  queueItemsRef: MutableRefObject<QueueItem[]>;
  commitQueue: (updater: (current: QueueItem[]) => QueueItem[]) => void;
  clearAfterFinish: boolean;
}): Promise<void> {
  const eventScope = () => createRuntimeScope({
    store: scope.store,
    parent: scope,
    references: scope.references,
    contextValues: {
      $completedItems: queueItemsRef.current.filter((entry) => entry.status === "completed"),
      $queuedItems: queueItemsRef.current,
    },
  });

  try {
    const willProcessResult = await runEvent(node.parsed?.events?.willProcess, eventScope(), [item.item]);
    if (willProcessResult === false) {
      commitQueue((current) => current.filter((entry) => entry.actionItemId !== item.actionItemId));
      return;
    }

    commitQueue((current) => current.map((entry) =>
      entry.actionItemId === item.actionItemId ? { ...entry, status: "started" } : entry,
    ));

    const result = await runEvent(node.parsed?.events?.process, eventScope(), [item.item]);

    commitQueue((current) => current.map((entry) =>
      entry.actionItemId === item.actionItemId ? { ...entry, status: "completed", result } : entry,
    ));
    await runEvent(node.parsed?.events?.didProcess, eventScope(), [item.item, result]);
  } catch (error) {
    commitQueue((current) => current.map((entry) =>
      entry.actionItemId === item.actionItemId ? { ...entry, status: "error", error } : entry,
    ));
    await runEvent(node.parsed?.events?.processError, eventScope(), [
      error,
      { item: item.item, itemId: item.actionItemId },
    ]);
  }

  const remaining = queueItemsRef.current.filter((entry) =>
    entry.actionItemId !== item.actionItemId &&
    (entry.status === "pending" || entry.status === "started")
  );
  if (remaining.length === 0) {
    await runEvent(node.parsed?.events?.complete, eventScope());
    if (clearAfterFinish) {
      commitQueue((current) => current.filter((entry) => entry.status !== "completed" && entry.status !== "error"));
    }
  }
}

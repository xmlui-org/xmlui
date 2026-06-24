import { useEffect, useRef } from "react";

import { runEvent } from "../../runtime/rendering/bindings";
import { useEvaluatedProp } from "../../runtime/rendering/props";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";

export const lifecycleRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
  const keyValue = useEvaluatedProp(node, scope, "keyValue", undefined);
  const mountedRef = useRef(false);
  const previousKeyRef = useRef<unknown>(keyValue);

  useEffect(() => {
    mountedRef.current = true;
    void fireSafely("mount", node, scope);
    return () => {
      mountedRef.current = false;
      void fireSafely("unmount", node, scope);
    };
  }, [node, scope]);

  useEffect(() => {
    if (!mountedRef.current) {
      previousKeyRef.current = keyValue;
      return;
    }
    if (Object.is(previousKeyRef.current, keyValue)) {
      return;
    }
    previousKeyRef.current = keyValue;
    void fireSafely("unmount", node, scope);
    void fireSafely("mount", node, scope);
  }, [keyValue, node, scope]);

  return null;
};

async function fireSafely(
  eventName: "mount" | "unmount",
  node: Parameters<XmluiBuiltInRenderer>[0]["node"],
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
): Promise<void> {
  try {
    await runEvent(node.parsed?.events?.[eventName], scope);
  } catch (error) {
    await runEvent(node.parsed?.events?.error, scope, [
      {
        source: eventName,
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
    ]);
  }
}

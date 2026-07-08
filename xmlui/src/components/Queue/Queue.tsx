import { wrapComponent } from "../../components-core/wrapComponent";
import { MemoizedItem } from "../container-helpers";
import { createMetadata } from "../metadata-helpers";
import { defaultProps } from "./Queue.defaults";
import { Queue, QueueWithContextVar } from "./QueueReact";
import { cloneElement, isValidElement, useRef, type ReactNode } from "react";
import { createRuntimeScope } from "../../runtime/state";
import { runEvent } from "../../runtime/rendering/bindings";
import { templateChildren, wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { useEvent } from "../../components-core/utils/misc";

const COMP = "Queue";

export const QueueMd = createMetadata({
  status: "stable",
  description:
    "`Queue` manages sequential processing of items in FIFO (first-in, first-out) " +
    "order. It is a non-visual component but provides UI progress reporting and result display.",
  props: {
    progressFeedback: {
      description:
        "This property defines the component template of the UI that displays " +
        "progress information whenever, the queue's `progressReport` function " +
        "in invoked. If not set, no progress feedback is displayed.",
      valueType: "ComponentDef",
    },
    resultFeedback: {
      description:
        "This property defines the component template of the UI that displays result " +
        "information when the queue becomes empty after processing all queued items. If not set, " +
        "no result feedback is displayed.",
      valueType: "ComponentDef",
    },
    clearAfterFinish: {
      description:
        `This property indicates the completed items (successful or error) should ` +
        `be removed from the queue after completion.`,
      valueType: "boolean",
      defaultValue: defaultProps.clearAfterFinish,
    },
  },
  nonVisual: true,
  events: {
    willProcess: {
      injectedVars: ["$completedItems", "$queuedItems"],
      description: `This event is triggered to process a particular item.`,
      signature: "willProcess(item: any): void | boolean",
      parameters: {
        item: "The item about to be processed.",
      },
    },
    process: {
      injectedVars: ["$completedItems", "$queuedItems"],
      description:
        `This event is fired to process the next item in the queue. If the processing cannot ` +
        `proceed because of some error, raise an exception, and the queue will handle that.`,
      signature: "process(item: any): any",
      parameters: {
        item: "The item to process.",
      },
    },
    didProcess: {
      injectedVars: ["$completedItems", "$queuedItems"],
      description:
        `This event is fired when the processing of a queued item has been successfully processed.`,
      signature: "didProcess(item: any, result: any): void",
      parameters: {
        item: "The item that was processed.",
        result: "The result of the processing operation.",
      },
    },
    processError: {
      injectedVars: ["$completedItems", "$queuedItems"],
      description:
        `This event is fired when processing an item raises an error. The event handler method ` +
        `receives two parameters. The first is the error raised during the processing of the ` +
        `item; the second is an object with these properties:`,
      signature: "processError(error: Error, context: { item: any, itemId: string }): void",
      parameters: {
        error: "The error that occurred during processing.",
        context: "An object containing the item and itemId that failed processing.",
      },
    },
    complete: {
      injectedVars: ["$completedItems", "$queuedItems"],
      description:
        `The queue fires this event when the queue gets empty after processing all items. ` +
        `The event handler has no arguments.`,
      signature: "complete(): void",
      parameters: {},
    },
  },
  apis: {
    enqueueItem: {
      description:
        `This method enqueues the item passed in the method parameter. The new item will be ` +
        `processed after the current queue items have been handled. The method retrieves the ` +
        `unique ID of the newly added item; this ID can be used later in other methods, ` +
        `such as \`remove\`.`,
      signature: "enqueueItem(item: any): string",
      parameters: {
        item: "The item to enqueue.",
      },
    },
    enqueueItems: {
      description:
        `This method enqueues the array of items passed in the method parameter. The new items ` +
        `will be processed after the current queue items have been handled. The method ` +
        `retrieves an array of unique IDs, one for each new item. An item ID can be used later ` +
        `in other methods, such as \`remove\`.`,
      signature: "enqueueItems(items: any[]): string[]",
      parameters: {
        items: "The array of items to enqueue.",
      },
    },
    getQueuedItems: {
      description:
        `You can use this method to return the items in the queue. These items contain all ` +
        `entries not removed from the queue yet, including pending, in-progress, and ` +
        `completed items.`,
      signature: "getQueuedItems(): any[]",
    },
    getQueueLength: {
      description:
        `This method retrieves the current queue length. The queue contains only those items ` +
        `that are not fully processed yet.`,
      signature: "getQueueLength(): number",
    },
    remove: {
      description: `This method removes an item from the queue using its unique ID.`,
      signature: "remove(itemId: string): void",
      parameters: {
        itemId: "The unique ID of the item to remove.",
      },
    },
  },
  contextVars: {
    $completedItems: {
      description: `A list containing the queue items that have been completed (fully processed).`,
    },
    $queuedItems: {
      description: `A list containing the items waiting in the queue, icluding the completed items.`,
    },
  },
});

export const queueComponentRenderer = wrapComponent(COMP, QueueWithContextVar, QueueMd, {
  exposeRegisterApi: true,
  exclude: ["progressFeedback", "resultFeedback"],
  customRender: (
    _props,
    { node, registerComponentApi, lookupEventHandler, renderChild, extractValue },
  ) => (
    <QueueWithContextVar
      node={node as any}
      renderChild={renderChild}
      extractValue={extractValue}
      lookupEventHandler={lookupEventHandler as any}
      registerComponentApi={registerComponentApi}
    />
  ),
});

export const queueRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: QueueMd as ComponentMetadata,
  renderer: ({ adapter }) => <QueueRuntime adapter={adapter} />,
});

function QueueRuntime({ adapter }: { adapter: XmluiComponentAdapter }) {
  const immediateReadSnapshotRef = useRef<{ length: unknown; items: unknown }>();
  const renderProgressFeedback = useTemplateRenderer(adapter, "progressFeedback");
  const renderResultFeedback = useTemplateRenderer(adapter, "resultFeedback");
  const registerApi = useEvent((api: Record<string, any>) => {
    const captureImmediateReadSnapshot = () => {
      if (immediateReadSnapshotRef.current) {
        return;
      }
      immediateReadSnapshotRef.current = {
        length: api.getQueueLength?.(),
        items: api.getQueuedItems?.(),
      };
      setTimeout(() => {
        immediateReadSnapshotRef.current = undefined;
      }, 0);
    };
    adapter.registerApi({
      ...api,
      enqueueItem: (item: unknown) => {
        captureImmediateReadSnapshot();
        return api.enqueueItem?.(item);
      },
      enqueueItems: (items: unknown[]) => {
        captureImmediateReadSnapshot();
        return api.enqueueItems?.(items);
      },
      remove: (itemId: string) => {
        captureImmediateReadSnapshot();
        return api.remove?.(itemId);
      },
      getQueueLength: () =>
        immediateReadSnapshotRef.current?.length ?? api.getQueueLength?.(),
      getQueuedItems: () =>
        immediateReadSnapshotRef.current?.items ?? api.getQueuedItems?.(),
    });
  });
  const emitQueueEvent = useEvent((name: string, args: unknown[]) => {
    const eventScope = createRuntimeScope({
      store: adapter.scope.store,
      parent: adapter.scope,
      props: adapter.scope.props,
      contextValues: { $this: adapter.api },
      references: adapter.scope.references,
      slots: adapter.scope.slots,
      routing: adapter.scope.routing,
      toast: adapter.scope.toast,
      emitEvent: adapter.scope.emitEvent,
      extensionFunctions: adapter.scope.extensionFunctions,
    });
    return runEvent(adapter.node.parsed?.events?.[name], eventScope, args);
  });
  const willProcessItem = useEvent((processing: any) =>
    emitQueueEvent("willProcess", [normalizeProcessing(processing)]),
  );
  const processItem = useEvent((processing: any) =>
    emitQueueEvent("process", [normalizeProcessing(processing)]),
  );
  const didProcessItem = useEvent((processing: any) =>
    emitQueueEvent("didProcess", [normalizeProcessing(processing)]),
  );
  const processItemError = useEvent((error: any, processing: any) =>
    emitQueueEvent("processError", [error, normalizeProcessing(processing)]),
  );
  const onComplete = useEvent(() => emitQueueEvent("complete", []));

  return (
    <Queue
      registerComponentApi={registerApi}
      willProcessItem={willProcessItem}
      processItem={processItem}
      didProcessItem={didProcessItem}
      processItemError={processItemError}
      onComplete={onComplete}
      renderProgressFeedback={renderProgressFeedback}
      renderResultFeedback={renderResultFeedback}
      clearAfterFinish={adapter.booleanProp("clearAfterFinish", defaultProps.clearAfterFinish)}
    />
  );
}

function useTemplateRenderer(adapter: XmluiComponentAdapter, name: string) {
  const children = templateChildren(adapter.node, name);
  const renderTemplate = useEvent((completedItems: any, queuedItems: any) => {
    const rendered = renderTemplateChildren(adapter, children, completedItems, queuedItems);
    if (rendered === undefined) {
      return undefined;
    }
    const Boundary = name === "resultFeedback" ? QueueResultFeedbackBoundary : QueueProgressFeedbackBoundary;
    return <Boundary>{applyTemplateKeys(rendered, name)}</Boundary>;
  });
  if (!children?.length || adapter.prop(name) === null) {
    return undefined;
  }
  return renderTemplate;
}

function normalizeProcessing(processing: any) {
  if (!processing || typeof processing !== "object") {
    return processing;
  }
  const onProgress = processing.onProgress;
  return {
    ...processing,
    onProgress: (progressEvent: any) => {
      return onProgress?.(progressEvent);
    },
    reportProgress: (progressEvent: any) => {
      return (processing.reportProgress ?? onProgress)?.(progressEvent);
    },
  };
}

function renderTemplateChildren(
  adapter: XmluiComponentAdapter,
  children: any[] | undefined,
  completedItems: any,
  queuedItems: any,
) {
  if (!children?.length) {
    return undefined;
  }
  const templateScope = createRuntimeScope({
    store: adapter.scope.store,
    parent: adapter.scope,
    props: adapter.scope.props,
    contextValues: {
      $completedItems: completedItems,
      $queuedItems: queuedItems,
    },
    references: adapter.scope.references,
    slots: adapter.scope.slots,
    emitEvent: adapter.scope.emitEvent,
  });
  return adapter.context.renderChildren(children, templateScope, adapter.node.range.end);
}

function QueueProgressFeedbackBoundary({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function QueueResultFeedbackBoundary({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function applyTemplateKeys(node: ReactNode, name: string): ReactNode {
  if (Array.isArray(node)) {
    return node.map((child, index) =>
      isValidElement(child)
        ? cloneElement(child, { key: `${name}:${index}` })
        : child,
    );
  }
  return isValidElement(node) ? cloneElement(node, { key: name }) : node;
}

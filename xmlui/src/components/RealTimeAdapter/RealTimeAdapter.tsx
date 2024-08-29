import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { useEffect } from "react";
import RestApiProxy from "@components-core/RestApiProxy";
import { delay } from "@components-core/utils/misc";
import type { AppContextObject } from "@abstractions/AppContextDefs";
import { useAppContext } from "@components-core/AppContext";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";

// =====================================================================================================================
// React RealTimeAdapter component implementation

type Props = {
  url: any;
  onEvent?: (...args: any[]) => void;
};

type RealtimeEventHandler = (events: Array<RealTimeEvent>) => void;

class PollClient {
  handlers: Array<RealtimeEventHandler> = [];
  lastEventId: any;
  tries: number = 0;
  polling: boolean = false;
  abortController: AbortController = new AbortController();

  constructor(public url: string, public appContext: AppContextObject) {}

  refreshAppContext(appContext: AppContextObject) {
    this.appContext = appContext;
  }

  private async poll(abortSignal: AbortSignal) {
    if (!this.polling || abortSignal.aborted) {
      return;
    }
    try {
      const response = await new RestApiProxy(this.appContext).execute({
        abortSignal,
        operation: {
          url: this.url,
          method: "get",
          headers: {
            "Cache-Control": "no-cache, no-store",
          },
          queryParams: {
            lastEventId: this.lastEventId,
          },
        },
        resolveBindingExpressions: true,
      });
      this.eventArrived(response);
      await this.poll(abortSignal);
    } catch (e) {
      if (this.tries < 100) {
        this.tries++;
        await delay(this.tries * 100); //TODO we should do some exponential fallback here
        await this.poll(abortSignal);
      } else {
        this.stopPoll();
      }
    }
  }

  private startPoll() {
    if (this.polling) {
      return;
    }
    this.polling = true;
    this.tries = 0;
    this.abortController = new AbortController();
    // console.log("poll client: start polling", this.handlers);
    this.poll(this.abortController.signal);
  }

  private stopPoll() {
    this.polling = false;
    this.abortController.abort();
    // console.log("poll client: stop polling");
  }

  private eventArrived(response: any) {
    if (!response) {
      return;
    }
    let events = [response];
    if (Array.isArray(response)) {
      events = response;
    }
    this.lastEventId = events[events.length - 1].id;
    this.handlers.forEach((handler) => {
      handler(events);
    });
  }

  subscribe(handler: RealtimeEventHandler) {
    // console.log("subscribe", handler);
    this.handlers.push(handler);
    this.startPoll();
  }

  unsubscribe(handler: RealtimeEventHandler) {
    // console.log("unsubscribe", handler);
    this.handlers = this.handlers.filter((existingHandler) => handler !== existingHandler);
    if (!this.handlers.length) {
      this.stopPoll();
    }
  }
}

interface RealTimeEvent {}

const clients: Record<string, PollClient> = {};

function createOrGetPollClient(url: string, appContext: AppContextObject) {
  if (!clients[url]) {
    clients[url] = new PollClient(url, appContext);
  }
  clients[url].refreshAppContext(appContext);
  return clients[url];
}

function RealTimeAdapter({ url, onEvent }: Props) {
  const appContext = useAppContext();

  useEffect(() => {
    const pollClient = createOrGetPollClient(url, appContext);

    const handler: RealtimeEventHandler = (events) => {
      events.forEach((event) => {
        onEvent?.(event);
      });
    };

    pollClient.subscribe(handler);

    return () => {
      pollClient.unsubscribe(handler);
    };
  }, [appContext, onEvent, url]);

  return null;
}

// =====================================================================================================================
// XMLUI RealTimeAdapter component definition

/**
 * \`RealTimeAdapter\` is a non-visual component that listens to real-time events through long-polling.
 * @descriptionRef none
 */
export interface RealTimeAdapterComponentDef extends ComponentDef<"RealTimeAdapter"> {
  props: {
    /**
     * This property specifies the URL to use for long-polling.
     */
    url: string;
  };
  events: {
    /**
     * This event is raised when data arrives from the backend using long-polling.
     */
    eventArrived: string;
  };
}

const metadata: ComponentDescriptor<RealTimeAdapterComponentDef> = {
  displayName: "RealTimeAdapter",
  description: "A non-visual component listening to real time change events through long-polling",
  props: {
    url: desc("URL to listen to for changes"),
  },
  events: {
    eventArrived: desc("An event arrived that the adapter should process"),
  },
};

export const realTimeAdapterComponentRenderer = createComponentRenderer<RealTimeAdapterComponentDef>(
  "RealTimeAdapter",
  ({ node, lookupEventHandler, extractValue }) => {
    return <RealTimeAdapter url={extractValue(node.props.url)} onEvent={lookupEventHandler("eventArrived")} />;
  },
  metadata
);

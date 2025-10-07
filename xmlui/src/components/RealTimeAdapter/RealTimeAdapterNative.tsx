import { useEffect } from "react";

import type { AppContextObject } from "../../abstractions/AppContextDefs";
import RestApiProxy from "../../components-core/RestApiProxy";
import { delay } from "../../components-core/utils/misc";
import { useAppContext } from "../../components-core/AppContext";

export const defaultProps = {
  url: "",
};

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

  constructor(
    public url: string,
    public appContext: AppContextObject,
  ) {}

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
    void this.poll(this.abortController.signal);
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

export function RealTimeAdapter({ url, onEvent }: Props) {
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

import type { AgentEvent } from "./contract";

export type AgentEventSink = {
  emit(event: AgentEvent): void;
  close(): void;
  fail(error: unknown): void;
};

export type AgentEventStream = AgentEventSink & {
  readonly events: AgentEvent[];
  readonly readable: ReadableStream<string>;
};

export function serializeAgentEvent(event: AgentEvent): string {
  return `${JSON.stringify(event)}\n`;
}

export function deserializeAgentEvent(line: string): AgentEvent {
  const trimmed = line.trim();
  if (!trimmed) {
    throw new Error("Cannot deserialize an empty AgentEvent line.");
  }
  return JSON.parse(trimmed) as AgentEvent;
}

export function createAgentEventStream(): AgentEventStream {
  const events: AgentEvent[] = [];
  let controller: ReadableStreamDefaultController<string> | undefined;
  let closed = false;
  const pending: AgentEvent[] = [];

  const readable = new ReadableStream<string>({
    start(nextController) {
      controller = nextController;
      while (pending.length > 0) {
        controller.enqueue(serializeAgentEvent(pending.shift()!));
      }
      if (closed) {
        controller.close();
      }
    },
  });

  return {
    events,
    readable,
    emit(event) {
      if (closed) {
        throw new Error("Cannot emit AgentEvent after the stream is closed.");
      }
      events.push(event);
      if (controller) {
        controller.enqueue(serializeAgentEvent(event));
      } else {
        pending.push(event);
      }
    },
    close() {
      if (closed) return;
      closed = true;
      controller?.close();
    },
    fail(error) {
      if (closed) return;
      closed = true;
      controller?.error(error);
    },
  };
}

export async function collectAgentEvents(readable: ReadableStream<string | Uint8Array>): Promise<AgentEvent[]> {
  const reader = readable.getReader();
  const events: AgentEvent[] = [];
  let buffer = "";
  const decoder = new TextDecoder();

  while (true) {
    const next = await reader.read();
    if (next.done) break;
    buffer += typeof next.value === "string" ? next.value : decoder.decode(next.value, { stream: true });

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.trim()) {
        events.push(deserializeAgentEvent(line));
      }
      newlineIndex = buffer.indexOf("\n");
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    events.push(deserializeAgentEvent(buffer));
  }

  return events;
}

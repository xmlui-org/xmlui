import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

type ExampleTask = {
  id: string;
  title: string;
};

type ExampleApiState = {
  nextTaskId: number;
  statsCount: number;
  tasks: ExampleTask[];
};

export type ExampleApiMockResponse = {
  status: number;
  headers: Record<string, string>;
  body?: unknown;
};

export type ExampleApiMockRequest = {
  method: string;
  url: string;
  body?: unknown;
};

export function createExampleApiMockState(): ExampleApiState {
  return {
    nextTaskId: 3,
    statsCount: 0,
    tasks: [
      { id: "build", title: "Build runtime" },
      { id: "test", title: "Write tests" },
    ],
  };
}

export async function resolveExampleApiMockRequest(
  request: ExampleApiMockRequest,
  state: ExampleApiState = createExampleApiMockState(),
): Promise<ExampleApiMockResponse | undefined> {
  const url = new URL(request.url, "http://xmlui.local");
  const method = request.method.toLowerCase();

  if (method === "get" && url.pathname === "/api/message") {
    return jsonResponse({ text: "Managed hello" });
  }

  const messageMatch = /^\/api\/messages\/([^/]+)$/.exec(url.pathname);
  if (method === "get" && messageMatch) {
    return jsonResponse({ id: messageMatch[1], text: `Message ${messageMatch[1]}` });
  }

  if (method === "get" && url.pathname === "/api/stats") {
    state.statsCount += 1;
    return jsonResponse({ count: state.statsCount });
  }

  if (method === "get" && url.pathname === "/api/tasks") {
    return jsonResponse(state.tasks);
  }

  if (method === "post" && url.pathname === "/api/tasks") {
    const title = requestTitle(request.body);
    const task = { id: String(state.nextTaskId++), title };
    state.tasks = [...state.tasks, task];
    return jsonResponse(task, 201);
  }

  if (url.pathname.startsWith("/api/")) {
    return jsonResponse({ message: `No XMLUI example API mock matches ${method.toUpperCase()} ${url.pathname}.` }, 404);
  }

  return undefined;
}

export function exampleApiMocksPlugin(): Plugin {
  const state = createExampleApiMockState();
  return {
    name: "xmlui-rs:example-api-mocks",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) {
          next();
          return;
        }
        const body = await readRequestBody(req);
        const response = await resolveExampleApiMockRequest(
          {
            method: req.method ?? "get",
            url: req.url,
            body,
          },
          state,
        );
        if (!response) {
          next();
          return;
        }
        writeResponse(res, response);
      });
    },
  };
}

function jsonResponse(body: unknown, status = 200): ExampleApiMockResponse {
  return {
    status,
    headers: {
      "content-type": "application/json",
    },
    body,
  };
}

function requestTitle(body: unknown): string {
  if (body && typeof body === "object" && !Array.isArray(body) && "title" in body) {
    return String((body as { title?: unknown }).title ?? "Untitled task");
  }
  if (typeof body === "string" && body.trim()) {
    return body;
  }
  return "Untitled task";
}

async function readRequestBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) {
    return undefined;
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function writeResponse(res: ServerResponse, response: ExampleApiMockResponse): void {
  res.statusCode = response.status;
  for (const [name, value] of Object.entries(response.headers)) {
    res.setHeader(name, value);
  }
  if (response.body === undefined) {
    res.end();
    return;
  }
  res.end(
    response.headers["content-type"] === "application/json"
      ? JSON.stringify(response.body)
      : String(response.body),
  );
}

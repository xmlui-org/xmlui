import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { createAgentEventStream } from "./eventStream";
import { readJsonRequestBody, parseAgentRequest } from "./request";
import { runAgentRequest, type RunAgentOptions } from "./runtime";

export type RequestHandler = (request: Request) => Promise<Response>;

export type AgentHandlerOptions = RunAgentOptions;

export type LocalServerOptions = AgentHandlerOptions & {
  hostname?: string;
  port?: number;
  path?: string;
};

export type ServerHandle = {
  server: Server;
  url: string;
  close(): Promise<void>;
};

export function createAgentHandler(options: AgentHandlerOptions = {}): RequestHandler {
  return async (request) => {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Only POST is supported." }, 405);
    }

    let body: unknown;
    try {
      body = await readJsonRequestBody(request);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid request body.";
      return jsonResponse({ error: message }, 400);
    }

    const parsed = parseAgentRequest(body);
    if (parsed.ok === false) {
      return jsonResponse({ error: "Invalid AgentRequest.", issues: parsed.issues }, 400);
    }

    const stream = createAgentEventStream();
    void runAgentRequest(parsed.request, stream, options);

    return new Response(stream.readable.pipeThrough(new TextEncoderStream()), {
      headers: {
        "content-type": "application/x-ndjson; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  };
}

export async function createLocalServer(options: LocalServerOptions = {}): Promise<ServerHandle> {
  const hostname = options.hostname ?? "127.0.0.1";
  const requestedPort = options.port ?? 0;
  const path = options.path ?? "/agent";
  const handler = createAgentHandler(options);

  const server = createServer(async (incoming, outgoing) => {
    if (!incoming.url) {
      writeNodeResponse(outgoing, new Response("Missing URL.", { status: 400 }));
      return;
    }

    const url = new URL(incoming.url, `http://${hostname}`);
    if (url.pathname !== path) {
      writeNodeResponse(outgoing, new Response("Not found.", { status: 404 }));
      return;
    }

    const response = await handler(await toWebRequest(incoming, url));
    await writeNodeResponse(outgoing, response);
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(requestedPort, hostname, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Local server did not expose a TCP address.");
  }

  return {
    server,
    url: `http://${hostname}:${address.port}${path}`,
    close() {
      return new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function toWebRequest(incoming: IncomingMessage, url: URL): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of incoming) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return new Request(url, {
    method: incoming.method,
    headers: incoming.headers as HeadersInit,
    body: chunks.length > 0 ? Buffer.concat(chunks) : undefined,
  });
}

async function writeNodeResponse(outgoing: ServerResponse, response: Response): Promise<void> {
  outgoing.statusCode = response.status;
  response.headers.forEach((value, key) => outgoing.setHeader(key, value));

  if (!response.body) {
    outgoing.end();
    return;
  }

  const reader = response.body.getReader();
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    outgoing.write(next.value);
  }
  outgoing.end();
}

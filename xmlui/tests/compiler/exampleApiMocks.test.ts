import { describe, expect, it } from "vitest";

import {
  createExampleApiMockState,
  resolveExampleApiMockRequest,
} from "../../src/vite-plugin/exampleApiMocks";

describe("example API mocks", () => {
  it("serves the message endpoint used by Actions.callApi samples", async () => {
    const response = await resolveExampleApiMockRequest({
      method: "get",
      url: "/api/message",
    });

    expect(response).toMatchObject({
      status: 200,
      body: { text: "Managed hello" },
    });
  });

  it("persists task mutations for DataSource refetch samples", async () => {
    const state = createExampleApiMockState();
    const initial = await resolveExampleApiMockRequest({ method: "get", url: "/api/tasks" }, state);
    expect(initial?.body).toEqual([
      { id: "build", title: "Build runtime" },
      { id: "test", title: "Write tests" },
    ]);

    const created = await resolveExampleApiMockRequest(
      {
        method: "post",
        url: "/api/tasks",
        body: { title: "Ship runtime" },
      },
      state,
    );
    expect(created).toMatchObject({
      status: 201,
      body: { title: "Ship runtime" },
    });

    const updated = await resolveExampleApiMockRequest({ method: "get", url: "/api/tasks" }, state);
    expect(updated?.body).toEqual([
      { id: "build", title: "Build runtime" },
      { id: "test", title: "Write tests" },
      { id: "3", title: "Ship runtime" },
    ]);
  });

  it("serves route-param driven message endpoints", async () => {
    const response = await resolveExampleApiMockRequest({
      method: "get",
      url: "/api/messages/2",
    });

    expect(response).toMatchObject({
      status: 200,
      body: { id: "2", text: "Message 2" },
    });
  });
});

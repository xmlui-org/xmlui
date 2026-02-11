import { describe, it, expect, vi } from "vitest";
import { createPubSubService } from "../../../src/components-core/pubsub/PubSubService";

describe("PubSubService", () => {
  it("should create a service with publishTopic, subscribe, and unsubscribe methods", () => {
    const service = createPubSubService();
    expect(service).toHaveProperty("publishTopic");
    expect(service).toHaveProperty("subscribe");
    expect(service).toHaveProperty("unsubscribe");
    expect(typeof service.publishTopic).toBe("function");
    expect(typeof service.subscribe).toBe("function");
    expect(typeof service.unsubscribe).toBe("function");
  });

  it("should call subscriber when topic is published", () => {
    const service = createPubSubService();
    const callback = vi.fn();

    service.subscribe("test-topic", callback);
    service.publishTopic("test-topic", { foo: "bar" });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("test-topic", { foo: "bar" });
  });

  it("should call multiple subscribers for the same topic", () => {
    const service = createPubSubService();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    service.subscribe("test-topic", callback1);
    service.subscribe("test-topic", callback2);
    service.publishTopic("test-topic", "data");

    expect(callback1).toHaveBeenCalledWith("test-topic", "data");
    expect(callback2).toHaveBeenCalledWith("test-topic", "data");
  });

  it("should handle array of topics in subscribe", () => {
    const service = createPubSubService();
    const callback = vi.fn();

    service.subscribe(["topic1", "topic2"], callback);
    service.publishTopic("topic1", "data1");
    service.publishTopic("topic2", "data2");

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, "topic1", "data1");
    expect(callback).toHaveBeenNthCalledWith(2, "topic2", "data2");
  });

  it("should support numeric topics", () => {
    const service = createPubSubService();
    const callback = vi.fn();

    service.subscribe(42, callback);
    service.publishTopic(42, "answer");

    expect(callback).toHaveBeenCalledWith(42, "answer");
  });

  it("should not call subscriber after unsubscribe", () => {
    const service = createPubSubService();
    const callback = vi.fn();

    service.subscribe("test-topic", callback);
    service.publishTopic("test-topic", "data1");
    expect(callback).toHaveBeenCalledTimes(1);

    service.unsubscribe(callback);
    service.publishTopic("test-topic", "data2");
    expect(callback).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  it("should not call subscriber for unrelated topics", () => {
    const service = createPubSubService();
    const callback = vi.fn();

    service.subscribe("topic1", callback);
    service.publishTopic("topic2", "data");

    expect(callback).not.toHaveBeenCalled();
  });

  it("should publish without data", () => {
    const service = createPubSubService();
    const callback = vi.fn();

    service.subscribe("test-topic", callback);
    service.publishTopic("test-topic");

    expect(callback).toHaveBeenCalledWith("test-topic", undefined);
  });

  it("should handle publish with no subscribers gracefully", () => {
    const service = createPubSubService();
    expect(() => service.publishTopic("nonexistent-topic", "data")).not.toThrow();
  });

  it("should catch errors in subscriber callbacks and log them", () => {
    const service = createPubSubService();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const callback = vi.fn(() => {
      throw new Error("Subscriber error");
    });

    service.subscribe("test-topic", callback);
    service.publishTopic("test-topic", "data");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error in pubsub callback for topic "test-topic"'),
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it("should remove callback from all topics on unsubscribe", () => {
    const service = createPubSubService();
    const callback = vi.fn();

    service.subscribe(["topic1", "topic2", "topic3"], callback);
    service.unsubscribe(callback);

    service.publishTopic("topic1", "data");
    service.publishTopic("topic2", "data");
    service.publishTopic("topic3", "data");

    expect(callback).not.toHaveBeenCalled();
  });

  it("should maintain separate subscriber sets per topic", () => {
    const service = createPubSubService();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    service.subscribe("topic1", callback1);
    service.subscribe("topic2", callback2);

    service.publishTopic("topic1", "data1");
    expect(callback1).toHaveBeenCalledWith("topic1", "data1");
    expect(callback2).not.toHaveBeenCalled();

    service.publishTopic("topic2", "data2");
    expect(callback2).toHaveBeenCalledWith("topic2", "data2");
  });
});

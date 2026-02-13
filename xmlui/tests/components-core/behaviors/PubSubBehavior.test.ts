import { describe, it, expect, vi } from "vitest";
import { pubSubBehavior } from "../../../src/components-core/behaviors/PubSubBehavior";
import type { RendererContext } from "../../../src/abstractions/RendererDefs";
import type { ComponentDef, ComponentMetadata } from "../../../src/abstractions/ComponentDefs";

describe("PubSubBehavior", () => {
  describe("canAttach", () => {
    it("should return true when subscribeToTopic prop exists", () => {
      const mockContext = {
        extractValue: vi.fn((value, strict) => value),
      } as unknown as RendererContext<any>;

      const mockNode = {
        type: "Button",
        props: {
          subscribeToTopic: "test-topic",
        },
      } as ComponentDef;

      const mockMetadata = {} as ComponentMetadata;

      const result = pubSubBehavior.canAttach(mockContext, mockNode, mockMetadata);
      expect(result).toBe(true);
    });

    it("should return true when subscribeToTopic is an array", () => {
      const mockContext = {
        extractValue: vi.fn((value, strict) => value),
      } as unknown as RendererContext<any>;

      const mockNode = {
        type: "Button",
        props: {
          subscribeToTopic: ["topic1", "topic2"],
        },
      } as ComponentDef;

      const mockMetadata = {} as ComponentMetadata;

      const result = pubSubBehavior.canAttach(mockContext, mockNode, mockMetadata);
      expect(result).toBe(true);
    });

    it("should return true when subscribeToTopic is a number", () => {
      const mockContext = {
        extractValue: vi.fn((value, strict) => value),
      } as unknown as RendererContext<any>;

      const mockNode = {
        type: "Button",
        props: {
          subscribeToTopic: 42,
        },
      } as ComponentDef;

      const mockMetadata = {} as ComponentMetadata;

      const result = pubSubBehavior.canAttach(mockContext, mockNode, mockMetadata);
      expect(result).toBe(true);
    });

    it("should return false when subscribeToTopic prop is missing", () => {
      const mockContext = {
        extractValue: vi.fn((value, strict) => value),
      } as unknown as RendererContext<any>;

      const mockNode = {
        type: "Button",
        props: {},
      } as ComponentDef;

      const mockMetadata = {} as ComponentMetadata;

      const result = pubSubBehavior.canAttach(mockContext, mockNode, mockMetadata);
      expect(result).toBe(false);
    });

    it("should return false when subscribeToTopic prop is undefined", () => {
      const mockContext = {
        extractValue: vi.fn(() => undefined),
      } as unknown as RendererContext<any>;

      const mockNode = {
        type: "Button",
        props: {
          subscribeToTopic: undefined,
        },
      } as ComponentDef;

      const mockMetadata = {} as ComponentMetadata;

      const result = pubSubBehavior.canAttach(mockContext, mockNode, mockMetadata);
      expect(result).toBe(false);
    });

    it("should return false when subscribeToTopic prop is null", () => {
      const mockContext = {
        extractValue: vi.fn(() => null),
      } as unknown as RendererContext<any>;

      const mockNode = {
        type: "Button",
        props: {
          subscribeToTopic: null,
        },
      } as ComponentDef;

      const mockMetadata = {} as ComponentMetadata;

      const result = pubSubBehavior.canAttach(mockContext, mockNode, mockMetadata);
      expect(result).toBe(false);
    });

    it("should return false when subscribeToTopic prop is empty string", () => {
      const mockContext = {
        extractValue: vi.fn(() => ""),
      } as unknown as RendererContext<any>;

      const mockNode = {
        type: "Button",
        props: {
          subscribeToTopic: "",
        },
      } as ComponentDef;

      const mockMetadata = {} as ComponentMetadata;

      const result = pubSubBehavior.canAttach(mockContext, mockNode, mockMetadata);
      expect(result).toBe(false);
    });
  });

  describe("metadata", () => {
    it("should have correct name", () => {
      expect(pubSubBehavior.metadata.name).toBe("pubsub");
    });

    it("should have canAttach method", () => {
      expect(typeof pubSubBehavior.canAttach).toBe("function");
    });

    it("should have attach method", () => {
      expect(typeof pubSubBehavior.attach).toBe("function");
    });
  });
});

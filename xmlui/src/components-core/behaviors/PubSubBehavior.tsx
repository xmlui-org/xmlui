import { useContext, useEffect, type ReactElement } from "react";
import type { Behavior } from "./Behavior";
import { AppContext } from "../AppContext";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";

/**
 * Behavior for subscribing components to topics in the pub/sub system.
 * When a component has a `subscribeToTopic` property, this behavior attaches
 * a subscription handler that triggers the `onTopicReceived` event when any
 * subscribed topic is published.
 */
export const pubSubBehavior: Behavior = {
  metadata: {
    name: "pubsub",
    description:
      "Subscribes the component to specified topics and triggers an event when a topic is received.",
    triggerProps: ["subscribeToTopic"],
    props: {
      subscribeToTopic: {
        valueType: "any",
        description:
          "The topic or topics to subscribe to. Can be a single topic or an array of topics.",
      },
    },
  },
  canAttach: (context, node) => {
    const { extractValue } = context;
    const subscribeToTopic = extractValue(node.props?.subscribeToTopic, true);
    return !!subscribeToTopic;
  },
  attach: (context, node, metadata) => {
    const { extractValue, lookupEventHandler } = context;

    // Extract the topic(s) to subscribe to
    const subscribeToTopic = extractValue(context.node.props?.subscribeToTopic, true);

    // Normalize to array of topics
    const topics = Array.isArray(subscribeToTopic) ? subscribeToTopic : [subscribeToTopic];

    // Extract the event handler for when a topic is received
    const onTopicReceived = lookupEventHandler("topicReceived" as any);

    return (
      <PubSubWrapper topics={topics} onTopicReceived={onTopicReceived}>
        {node as ReactElement}
      </PubSubWrapper>
    );
  },
};

/**
 * Wrapper component that manages pub/sub subscriptions for a child component.
 * Subscribes to topics on mount and unsubscribes on unmount.
 */
function PubSubWrapper({
  children,
  topics,
  onTopicReceived,
}: {
  children: ReactElement;
  topics: (string | number)[];
  onTopicReceived: AsyncFunction | undefined;
}) {
  const appContext = useContext(AppContext);
  const pubSubService = appContext?.pubSubService;

  useEffect(() => {
    if (!pubSubService || !onTopicReceived || topics.length === 0) {
      return;
    }

    // Create a callback that will be invoked when any subscribed topic is published
    const callback = (topic: string | number, data: any) => {
      // Invoke the event handler (async function)
      onTopicReceived(topic, data);
    };

    // Subscribe to all topics
    pubSubService.subscribe(topics, callback);

    // Cleanup: unsubscribe when component unmounts or dependencies change
    return () => {
      pubSubService.unsubscribe(callback);
    };
  }, [pubSubService, onTopicReceived, topics]);

  // Return the child element unchanged (no wrapping needed)
  return children;
}

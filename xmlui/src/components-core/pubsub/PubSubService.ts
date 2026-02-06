/**
 * Type definition for a topic subscription callback.
 * @param topic The topic that was published
 * @param data The data payload sent with the topic
 */
export type TopicCallback = (topic: string | number, data: any) => void;

/**
 * PubSub service interface for managing topic subscriptions and publications.
 */
export interface PubSubService {
  /**
   * Publishes a topic with optional data to all subscribers.
   * @param topic The topic to publish (string or number)
   * @param data Optional data payload to send to subscribers
   */
  publishTopic: (topic: string | number, data?: any) => void;

  /**
   * Subscribes a callback to one or more topics.
   * @param topics Single topic or array of topics to subscribe to
   * @param callback Function to call when any subscribed topic is published
   */
  subscribe: (topics: string | number | (string | number)[], callback: TopicCallback) => void;

  /**
   * Unsubscribes a callback from all topics it was subscribed to.
   * @param callback The callback to unsubscribe
   */
  unsubscribe: (callback: TopicCallback) => void;
}

/**
 * Creates a new PubSub service instance.
 * Each service maintains its own isolated set of topic subscriptions.
 * 
 * @returns A PubSubService instance with publishTopic, subscribe, and unsubscribe methods
 */
export function createPubSubService(): PubSubService {
  // Map of topic -> Set of callbacks subscribed to that topic
  const subscriptions = new Map<string | number, Set<TopicCallback>>();

  const publishTopic = (topic: string | number, data?: any): void => {
    const subscribers = subscriptions.get(topic);
    if (subscribers && subscribers.size > 0) {
      // Call each subscriber with the topic and data
      subscribers.forEach((callback) => {
        try {
          callback(topic, data);
        } catch (error) {
          console.error(`Error in pubsub callback for topic "${topic}":`, error);
        }
      });
    }
  };

  const subscribe = (
    topics: string | number | (string | number)[],
    callback: TopicCallback,
  ): void => {
    // Normalize topics to array
    const topicArray = Array.isArray(topics) ? topics : [topics];

    // Subscribe callback to each topic
    topicArray.forEach((topic) => {
      let subscribers = subscriptions.get(topic);
      if (!subscribers) {
        subscribers = new Set<TopicCallback>();
        subscriptions.set(topic, subscribers);
      }
      subscribers.add(callback);
    });
  };

  const unsubscribe = (callback: TopicCallback): void => {
    // Remove callback from all topics
    subscriptions.forEach((subscribers) => {
      subscribers.delete(callback);
    });

    // Clean up empty subscription sets
    for (const [topic, subscribers] of subscriptions.entries()) {
      if (subscribers.size === 0) {
        subscriptions.delete(topic);
      }
    }
  };

  return {
    publishTopic,
    subscribe,
    unsubscribe,
  };
}

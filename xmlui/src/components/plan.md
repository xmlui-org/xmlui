# Publisher/Subscriber Behavior

Resources:
- Component conventions: xmlui/dev-docs/component-behaviors.md
- Rendering pipeline: xmlui/dev-docs/standalone-app.md
- Behaviors: xmlui/dev-docs/component-behaviors.md
- E2E testing conventions: xmlui/dev-docs/conv-e2e-testing.md

I want to add a new behavior, named "pubsub", which implements the publisher-subscriber pattern to unidirectional messaging between unrelated components in the xmlui component tree.

I imagine that the new behavior would uses these extensions:

- `subscribeToTopic`: property with one of these values (TypeScript notation): string | number | (string | number)[]. Defines a single topic, or multiple topics, to which the component listens.
- `topicReceived`: event (using the `onTopicReceived` name in markup) that handles the event when any topic is published the component subscribes to. Signature: `(topic: string | number, data: any) => void`

We have a global function, `publishTopic` that any component can call to sign a particular topic with this signature: `(topic: string | number, data: any) => void`

Only those components trigger their `topicReceived` event, which subscribed to the topic.

## Implementation Plan

### Step 1: Create PubSub Service and Global Function ✅ COMPLETED
- ✅ Created `xmlui/src/components-core/pubsub/PubSubService.ts`:
  - Export `createPubSubService()` returning `{ publishTopic, subscribe, unsubscribe }`
  - Use Map to store topic → Set<callback> subscriptions
  - `publishTopic(topic, data)` calls all subscribers for that topic
  - `subscribe(topics, callback)` adds callback to topic(s)
  - `unsubscribe(callback)` removes callback from all topics

- ✅ Updated `xmlui/src/abstractions/AppContextDefs.ts`:
  - Added `publishTopic: (topic: string | number, data: any) => void` to `AppContextObject` interface
  - Added `pubSubService: PubSubService` to `AppContextObject` interface

- ✅ Updated `xmlui/src/components-core/rendering/AppContent.tsx`:
  - Imported `createPubSubService`
  - Created pubsub service instance using useRef for stable reference
  - Added `publishTopic: pubSubService.publishTopic` to appContextValue object
  - Added `pubSubService` to appContextValue object
  - Added to dependency array

**Test:** ✅ Unit tests - 12/12 tests passing (PubSubService.test.ts)

### Step 2: Create PubSub Behavior ✅ COMPLETED
- ✅ Created `xmlui/src/components-core/behaviors/PubSubBehavior.tsx`:
  - Exported `pubSubBehavior: Behavior`
  - `canAttach`: checks if `node.props?.subscribeToTopic` exists (using `extractValue`)
  - `attach`: 
    - Extracts `subscribeToTopic` (normalized to array if string/number)
    - Extracts `onTopicReceived` event using `lookupEventHandler("topicReceived")`
    - Returns `<PubSubWrapper topics={...} onTopicReceived={...}>{node}</PubSubWrapper>`

- ✅ Created `PubSubWrapper` component in same file:
  - Takes `topics: (string | number)[]`, `onTopicReceived: AsyncFunction | undefined`, `children: ReactElement`
  - Uses `useContext(AppContext)` to get pubsub service
  - `useEffect`: subscribes to topics, returns cleanup (unsubscribe)
  - Callback invokes `onTopicReceived?.(topic, data)`

- ✅ Updated `xmlui/src/components-core/behaviors/CoreBehaviors.tsx`:
  - Exported `pubSubBehavior` (re-export from PubSubBehavior.tsx)

**Test:** ✅ Unit tests - 10/10 tests passing (PubSubBehavior.test.ts)

### Step 3: Register PubSub Behavior
- Update `xmlui/src/components-core/behaviors/CoreBehaviors.tsx`:
  - Export `pubSubBehavior` (import from PubSubBehavior.tsx)

- Update `xmlui/src/components/ComponentProvider.tsx`:
  - Import `pubSubBehavior`
  - Register: `this.registerBehavior(pubSubBehavior)` after existing behaviors

**Test:** Start dev server, verify no runtime errors

### Step 4: Create E2E Tests
- Create `xmlui/tests-e2e/pubsub-behavior.spec.ts`:
  - Test basic pub/sub: component subscribes, button publishes, verify `testState` receives data
  - Test multiple topics: subscribe to 2 topics, publish to each, verify both received
  - Test topic filtering: component subscribes to "topic1", publish to "topic2", verify no trigger
  - Test unsubscribe on unmount: component with subscription, conditionally render, verify cleanup
  - Test data payload: publish object, array, primitives
  - Test multiple subscribers: 2 components subscribe to same topic, both receive

**Run:** `npm run test:e2e -- pubsub-behavior.spec.ts`

### Step 5: Documentation
- Update `xmlui/dev-docs/component-behaviors.md`:
  - Add "PubSub Behavior" section following existing behavior pattern
  - Document `subscribeToTopic` prop, `onTopicReceived` event, `publishTopic` global
  - Include usage example

- Create component documentation (if needed):
  - Add entry to docs site explaining pub/sub pattern

**Validation:** Read documentation, verify clarity and completeness

---

## Implementation Flow Per Step

1. Implement the step
2. Check VS Code Problems panel (no linting errors)
3. Create/run tests for the step
4. If step touches behaviors: manually test in playground/docs site
5. Mark step completed in this document
6. Request approval to continue

---

## Notes

- **Behavior order**: PubSub should run early (before form binding/validation) so subscribing components can react to topics. Register after `tooltipBehavior` but before `formBindingBehavior`.

- **Topics as primitives**: Topics are string | number (not objects), making them simple and serializable for debugging.

- **Async event handlers**: `onTopicReceived` is async (uses `lookupEventHandler`), allowing actions that trigger state updates, API calls, etc.

- **No automatic re-subscription**: If `subscribeToTopic` prop changes reactively, need to handle in PubSubWrapper (useEffect deps).

- **Service singleton**: One PubSubService per app (attached to AppContext), ensuring all components share same message bus.

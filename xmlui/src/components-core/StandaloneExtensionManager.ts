import type { ComponentRendererDef } from "@abstractions/RendererDefs";
import type { Extension } from "@abstractions/ExtensionDefs";

type ExtensionRegisteredCallbackFn = (extension: Extension) => void;

/**
 * This class allows external component libraries to add their components to
 * the xmlui component registry. The framework resolves the components used
 * in an application markup with this registry.
 */
export default class StandaloneExtensionManager {
  subscriptions: Set<ExtensionRegisteredCallbackFn> = new Set();
  registeredExtensions: Array<Extension> = [];

  constructor() {}

  /**
   * You can add a callback function invoked whenever a new component is added
   * to the registry. When you register a new callback function, the component
   * manager automatically invokes it for all components already in the
   * registry.
   * @param cb Function to call when a new component is registered
   */
  subscribeToRegistrations(cb: ExtensionRegisteredCallbackFn) {
    this.subscriptions.add(cb);
    this.registeredExtensions.forEach((component) => {
      cb(component);
    });
  }

  /**
   * You can remove a function added by `subscribeToRegistrations`. After
   * calling this method, the particular callback function won't be invoked
   * for a new component registration.
   * @param cb Function to call when a new component is registered
   */
  unSubscribeFromRegistrations(cb: ExtensionRegisteredCallbackFn) {
    this.subscriptions.delete(cb);
  }

  registerExtension(component: Extension | Extension[]) {
    (Array.isArray(component) ? component : [component]).forEach((component) => {
      this.registeredExtensions.push(component);
      this.subscriptions.forEach((cb: ExtensionRegisteredCallbackFn) => {
        cb(component);
      });
    });
  }
}

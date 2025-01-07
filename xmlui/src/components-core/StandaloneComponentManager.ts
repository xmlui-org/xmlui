import type { ComponentRendererDef } from "@abstractions/RendererDefs";

type ComponentRegisteredCallbackFn = (component: ComponentRendererDef) => void;

/**
 * This class allows external component libraries to add their components to 
 * the xmlui component registry. The framework resolves the components used 
 * in an application markup with this registry.
 */
export default class StandaloneComponentManager {
  subscriptions: Set<ComponentRegisteredCallbackFn> = new Set();
  registeredComponents: Array<ComponentRendererDef> = [];

  constructor() {}

  /**
   * You can add a callback function invoked whenever a new component is added
   * to the registry. When you register a new callback function, the component
   * manager automatically invokes it for all components already in the 
   * registry.
   * @param cb Function to call when a new component is registered
   */
  subscribeToRegistrations(cb: ComponentRegisteredCallbackFn) {
    this.subscriptions.add(cb);
    this.registeredComponents.forEach((component) => {
      cb(component);
    });
  }

  /**
   * You can remove a function added by `subscribeToRegistrations`. After 
   * calling this method, the particular callback function won't be invoked 
   * for a new component registration.
   * @param cb Function to call when a new component is registered
   */
  unSubscribeFromRegistrations(cb: ComponentRegisteredCallbackFn) {
    this.subscriptions.delete(cb);
  }

  /**
   * Use this function to add a new component to the registry. Adding a new 
   * component will invoke all callbacks that have already subscribed to the 
   * component registration.
   * @param component The component to register. You can pass a single 
   * component or an array of components.
   */
  registerComponent(component: ComponentRendererDef | ComponentRendererDef[]) {
    (Array.isArray(component) ? component : [component]).forEach((component) => {
      this.registeredComponents.push(component);
      this.subscriptions.forEach((cb: ComponentRegisteredCallbackFn) => {
        cb(component);
      });
    });
  }
}

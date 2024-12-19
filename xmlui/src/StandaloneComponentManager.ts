import type { ComponentRendererDef } from "@abstractions/RendererDefs";

type ComponentRegisteredCallbackFn = (component: ComponentRendererDef)=> void;

export default class StandaloneComponentManager {
  subscriptions: Set<ComponentRegisteredCallbackFn> = new Set();
  registeredComponents: Array<ComponentRendererDef> = [];

  constructor() {}

  subscribeToRegistrations(cb: ComponentRegisteredCallbackFn) {
    this.subscriptions.add(cb);
    this.registeredComponents.forEach((component) => {
      cb(component);
    });
  }

  unSubscribeFromRegistrations(cb: ComponentRegisteredCallbackFn) {
    this.subscriptions.delete(cb);
  }

  registerComponent(component: ComponentRendererDef | ComponentRendererDef[]) {
    let comps = component as ComponentRendererDef[];
    if(!Array.isArray(component)) {
      comps = [component];
    }
    comps.forEach((component) => {
      this.registeredComponents.push(component);
      this.subscriptions.forEach((cb: ComponentRegisteredCallbackFn) => {
        cb(component);
      });
    });
  }
}

/**
 * Thin action registry for compiled XMLUI apps.
 * Replaces the runtime-extensible Actions.* namespace with a plain Map lookup.
 * Extensions register their actions at import time; compiled handlers dispatch by name.
 */

export type ActionFn = (ctx: ActionContext, ...args: unknown[]) => unknown;

export interface ActionContext {
  navigate: (to: string | number, opts?: { replace?: boolean; queryParams?: Record<string, unknown> }) => void;
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    loading: (msg: string) => string;
    dismiss: (id?: string) => void;
    custom: (msg: string, opts?: unknown) => void;
  };
  confirm: {
    (options: { title?: string; message?: string; actionLabel?: string; cancelLabel?: string; width?: string }): Promise<boolean>;
    (title?: string, message?: string, actionLabel?: string, cancelLabel?: string, width?: string): Promise<boolean>;
  };
  queryClient: unknown;
}

export interface ActionRegistry {
  register: (name: string, fn: ActionFn) => void;
  dispatch: (name: string, ctx: ActionContext, ...args: unknown[]) => unknown;
  has: (name: string) => boolean;
}

export function createActionRegistry(): ActionRegistry {
  const registry = new Map<string, ActionFn>();

  return {
    register(name, fn) {
      registry.set(name, fn);
    },
    dispatch(name, ctx, ...args) {
      const fn = registry.get(name);
      if (!fn) {
        throw new Error(`[xmlui-compiler] Unknown action: "${name}". Was it registered?`);
      }
      return fn(ctx, ...args);
    },
    has(name) {
      return registry.has(name);
    },
  };
}

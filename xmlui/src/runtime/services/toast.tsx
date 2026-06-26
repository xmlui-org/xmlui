import React, { useSyncExternalStore } from "react";

import { announceLiveRegion } from "../../components/LiveRegion/LiveRegionReact";

export type ToastKind = "info" | "success" | "error" | "loading";

export type ToastEntry = {
  id: string;
  message: string;
  kind: ToastKind;
};

export type ToastOptions = {
  id?: string;
  duration?: number;
};

type ToastListener = () => void;
type ToastCallable = ((message: unknown, options?: ToastOptions) => string) & {
  success: (message: unknown, options?: ToastOptions) => string;
  error: (message: unknown, options?: ToastOptions) => string;
  loading: (message: unknown, options?: ToastOptions) => string;
  dismiss: (id?: string) => void;
};

export class ToastService {
  private toasts: ToastEntry[] = [];
  private listeners = new Set<ToastListener>();
  private nextId = 1;
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  readonly reference: ToastCallable;

  constructor() {
    const toast = ((message: unknown, options?: ToastOptions) =>
      this.show("info", message, options)) as ToastCallable;
    toast.success = (message, options) => this.show("success", message, options);
    toast.error = (message, options) => this.show("error", message, options);
    toast.loading = (message, options) => this.show("loading", message, options);
    toast.dismiss = (id) => this.dismiss(id);
    this.reference = toast;
  }

  getSnapshot(): ToastEntry[] {
    return this.toasts;
  }

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  show(kind: ToastKind, message: unknown, options: ToastOptions = {}): string {
    const id = options.id ?? `toast-${this.nextId++}`;
    const entry = { id, message: String(message ?? ""), kind };
    const index = this.toasts.findIndex((toast) => toast.id === id);
    this.toasts = index >= 0
      ? this.toasts.map((toast) => toast.id === id ? entry : toast)
      : [...this.toasts, entry];
    this.scheduleDismiss(kind, id, options.duration);
    announceLiveRegion(entry.message, kind === "error" ? "assertive" : "polite");
    this.notify();
    return id;
  }

  dismiss(id?: string): void {
    if (!id) {
      for (const timer of this.timers.values()) {
        clearTimeout(timer);
      }
      this.timers.clear();
      this.toasts = [];
      this.notify();
      return;
    }
    const before = this.toasts.length;
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    if (this.toasts.length !== before) {
      this.notify();
    }
  }

  private scheduleDismiss(kind: ToastKind, id: string, duration: number | undefined): void {
    const previous = this.timers.get(id);
    if (previous) {
      clearTimeout(previous);
      this.timers.delete(id);
    }
    if (kind === "loading" && duration === undefined) {
      return;
    }
    const delay = duration ?? 4000;
    if (delay <= 0) {
      return;
    }
    this.timers.set(id, setTimeout(() => this.dismiss(id), delay));
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export function createToastService(): ToastService {
  return new ToastService();
}

export function ToastHost({ service }: { service: ToastService }) {
  const toasts = useSyncExternalStore(
    (listener) => service.subscribe(listener),
    () => service.getSnapshot(),
    () => service.getSnapshot(),
  );

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      data-xmlui-part="ToastHost"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: "min(360px, calc(100vw - 32px))",
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          data-xmlui-part="Toast"
          data-kind={toast.kind}
          style={{
            border: "1px solid var(--xmlui-color-border)",
            borderRadius: "var(--xmlui-radius)",
            background: toast.kind === "error" ? "#fee2e2" : toast.kind === "success" ? "#dcfce7" : "#ffffff",
            color: "var(--xmlui-color-text)",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.16)",
            padding: "10px 12px",
            fontSize: 14,
            lineHeight: 1.35,
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
